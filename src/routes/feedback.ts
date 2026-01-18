import { Env, FeedbackRequest } from '../utils/types';
import { analyzeFeedback } from '../utils/ai';

/**
 * Handle POST /api/feedback
 * Submit new feedback to the system
 */
export async function handleFeedbackSubmission(request: Request, env: Env): Promise<Response> {
  try {
    // Parse request body
    const body = await request.json() as FeedbackRequest;

    // Validate required fields
    if (!body.source || !body.message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: source and message' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate source
    const validSources = ['twitter', 'discord', 'github', 'support', 'email'];
    if (!validSources.includes(body.source)) {
      return new Response(
        JSON.stringify({ error: `Invalid source. Must be one of: ${validSources.join(', ')}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Analyze feedback using Workers AI
    const analysis = await analyzeFeedback(env.AI, body.message);

    // Store in D1 database
    const metadata = body.metadata ? JSON.stringify(body.metadata) : null;

    const result = await env.DB.prepare(`
      INSERT INTO feedback (source, message, author, sentiment, theme, urgency, metadata)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
      .bind(
        body.source,
        body.message,
        body.author || null,
        analysis.sentiment,
        analysis.theme,
        analysis.urgency,
        metadata
      )
      .run();

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        id: result.meta.last_row_id,
        analysis: {
          sentiment: analysis.sentiment,
          theme: analysis.theme,
          urgency: analysis.urgency,
        },
        message: 'Feedback submitted successfully',
      }),
      {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Feedback submission error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to submit feedback',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
