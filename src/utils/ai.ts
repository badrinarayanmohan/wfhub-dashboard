import { Env, AIAnalysis, Sentiment, Theme, Urgency, FeedbackRecord } from './types';

/**
 * Analyze a single feedback message using Workers AI
 */
export async function analyzeFeedback(ai: any, message: string): Promise<AIAnalysis> {
  try {
    const prompt = `Analyze this customer feedback and respond with ONLY a JSON object (no markdown, no code blocks):

Feedback: "${message}"

Provide:
1. sentiment: "positive", "negative", or "neutral"
2. theme: "bug", "feature_request", "praise", "complaint", or "question"
3. urgency: "low", "medium", or "high"
4. summary: brief one-sentence summary

Format: {"sentiment":"...","theme":"...","urgency":"...","summary":"..."}`;

    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a feedback analysis assistant. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
    });

    // Parse AI response
    let result = response.response;

    // Try to extract JSON if wrapped in markdown
    if (typeof result === 'string') {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      }
    }

    return {
      sentiment: (result.sentiment || 'neutral') as Sentiment,
      theme: (result.theme || 'question') as Theme,
      urgency: (result.urgency || 'low') as Urgency,
      summary: result.summary || message.substring(0, 100),
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    // Fallback to basic sentiment analysis
    return fallbackAnalysis(message);
  }
}

/**
 * Fallback analysis using simple keyword matching
 */
function fallbackAnalysis(message: string): AIAnalysis {
  const lowerMessage = message.toLowerCase();

  let sentiment: Sentiment = 'neutral';
  let theme: Theme = 'question';
  let urgency: Urgency = 'low';

  // Sentiment detection
  const positiveWords = ['love', 'great', 'amazing', 'excellent', 'thank', 'perfect', 'awesome'];
  const negativeWords = ['broken', 'error', 'crash', 'bug', 'fail', 'slow', 'hate', 'terrible'];

  if (positiveWords.some(word => lowerMessage.includes(word))) {
    sentiment = 'positive';
  } else if (negativeWords.some(word => lowerMessage.includes(word))) {
    sentiment = 'negative';
  }

  // Theme detection
  if (lowerMessage.includes('bug') || lowerMessage.includes('error') || lowerMessage.includes('crash')) {
    theme = 'bug';
  } else if (lowerMessage.includes('feature') || lowerMessage.includes('would') || lowerMessage.includes('add')) {
    theme = 'feature_request';
  } else if (lowerMessage.includes('love') || lowerMessage.includes('thank') || lowerMessage.includes('great')) {
    theme = 'praise';
  } else if (lowerMessage.includes('?')) {
    theme = 'question';
  } else if (sentiment === 'negative') {
    theme = 'complaint';
  }

  // Urgency detection
  if (lowerMessage.includes('critical') || lowerMessage.includes('urgent') || lowerMessage.includes('broken')) {
    urgency = 'high';
  } else if (lowerMessage.includes('important') || lowerMessage.includes('need')) {
    urgency = 'medium';
  }

  return {
    sentiment,
    theme,
    urgency,
    summary: message.substring(0, 100),
  };
}

/**
 * Generate executive summary from feedback items
 */
export async function generateExecutiveSummary(
  ai: any,
  feedbackItems: FeedbackRecord[]
): Promise<string> {
  try {
    if (feedbackItems.length === 0) {
      return 'No feedback available for this period.';
    }

    const messages = feedbackItems.slice(0, 20).map(f => f.message).join('\n- ');

    const prompt = `Summarize these customer feedback items in 2-3 sentences, highlighting key trends and priorities:

- ${messages}

Be concise and actionable.`;

    const response = await ai.run('@cf/meta/llama-3-8b-instruct', {
      messages: [
        { role: 'system', content: 'You are a product manager assistant. Provide concise summaries.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.5,
    });

    return response.response || 'Summary generation in progress.';
  } catch (error) {
    console.error('Summary generation error:', error);
    return `Analyzed ${feedbackItems.length} feedback items. Review individual items for details.`;
  }
}

/**
 * Extract common themes from feedback
 */
export function extractCommonThemes(feedbackItems: FeedbackRecord[]): string[] {
  const themes = new Map<string, number>();

  feedbackItems.forEach(item => {
    if (item.sentiment === 'negative' || item.urgency === 'high') {
      // Simple keyword extraction
      const words = item.message.toLowerCase().split(/\s+/);
      const keywords = ['login', 'upload', 'dashboard', 'api', 'export', 'search', 'performance', 'mobile'];

      keywords.forEach(keyword => {
        if (words.some(w => w.includes(keyword))) {
          themes.set(keyword, (themes.get(keyword) || 0) + 1);
        }
      });
    }
  });

  return Array.from(themes.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([theme]) => theme);
}
