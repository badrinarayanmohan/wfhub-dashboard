// Cloudflare Workers environment bindings
export interface Env {
  DB: D1Database;
  AI: any;
  CACHE: KVNamespace;
}

// Feedback source types
export type FeedbackSource = 'twitter' | 'discord' | 'github' | 'support' | 'email';

// Sentiment types
export type Sentiment = 'positive' | 'negative' | 'neutral';

// Theme types
export type Theme = 'bug' | 'feature_request' | 'praise' | 'complaint' | 'question';

// Urgency levels
export type Urgency = 'low' | 'medium' | 'high';

// Feedback submission request
export interface FeedbackRequest {
  source: FeedbackSource;
  message: string;
  author?: string;
  metadata?: {
    url?: string;
    timestamp?: string;
    [key: string]: any;
  };
}

// Feedback database record
export interface FeedbackRecord {
  id: number;
  source: FeedbackSource;
  message: string;
  author: string | null;
  sentiment: Sentiment | null;
  created_at: string;
  metadata: string | null;
}

// AI Analysis result
export interface AIAnalysis {
  sentiment: Sentiment;
  theme: Theme;
  urgency: Urgency;
  summary?: string;
}

// Analysis response
export interface AnalysisResponse {
  total_feedback: number;
  period: string;
  sentiment_breakdown: {
    positive: number;
    negative: number;
    neutral: number;
  };
  theme_breakdown: {
    bug: number;
    feature_request: number;
    praise: number;
    complaint: number;
    question: number;
  };
  urgent_issues: FeedbackRecord[];
  common_themes: string[];
  executive_summary: string;
  recent_feedback: FeedbackRecord[];
}
