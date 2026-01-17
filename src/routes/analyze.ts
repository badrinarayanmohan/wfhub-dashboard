import { Env, AnalysisResponse, FeedbackRecord } from '../utils/types';
import { generateExecutiveSummary, extractCommonThemes } from '../utils/ai';

/**
 * Handle GET /api/analyze
 * Analyze feedback with AI insights
 */
export async function handleAnalyze(request: Request, env: Env): Promise<Response> {
  try {
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || '7d';
    const source = url.searchParams.get('source') || 'all';

    // Calculate date range
    const daysAgo = parseInt(period.replace('d', '')) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);

    // Check cache first
    const cacheKey = `analysis:${period}:${source}:${startDate.toISOString().split('T')[0]}`;
    const cached = await env.CACHE.get(cacheKey);
    if (cached) {
      return new Response(cached, {
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
        },
      });
    }

    // Build query
    let query = `
      SELECT * FROM feedback
      WHERE created_at >= datetime('now', '-${daysAgo} days')
    `;

    if (source !== 'all') {
      query += ` AND source = '${source}'`;
    }

    query += ' ORDER BY created_at DESC';

    // Fetch feedback
    const results = await env.DB.prepare(query).all();
    const feedbackItems = results.results as FeedbackRecord[];

    // Calculate sentiment breakdown
    const sentimentBreakdown = {
      positive: 0,
      negative: 0,
      neutral: 0,
    };

    const themeBreakdown = {
      bug: 0,
      feature_request: 0,
      praise: 0,
      complaint: 0,
      question: 0,
    };

    feedbackItems.forEach(item => {
      if (item.sentiment) {
        sentimentBreakdown[item.sentiment]++;
      }

      // Extract theme from metadata or analyze message
      const theme = (item as any).theme;
      if (theme && theme in themeBreakdown) {
        themeBreakdown[theme as keyof typeof themeBreakdown]++;
      }
    });

    // Get urgent issues
    const urgentIssues = feedbackItems.filter(
      item => (item as any).urgency === 'high'
    ).slice(0, 10);

    // Extract common themes
    const commonThemes = extractCommonThemes(feedbackItems);

    // Generate executive summary
    const executiveSummary = await generateExecutiveSummary(env.AI, feedbackItems);

    // Build response
    const response: AnalysisResponse = {
      total_feedback: feedbackItems.length,
      period: `Last ${daysAgo} days`,
      sentiment_breakdown: sentimentBreakdown,
      theme_breakdown: themeBreakdown,
      urgent_issues: urgentIssues,
      common_themes: commonThemes,
      executive_summary: executiveSummary,
      recent_feedback: feedbackItems.slice(0, 20),
    };

    const responseJson = JSON.stringify(response, null, 2);

    // Cache for 5 minutes
    await env.CACHE.put(cacheKey, responseJson, { expirationTtl: 300 });

    return new Response(responseJson, {
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to analyze feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
