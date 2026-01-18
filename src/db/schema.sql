-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL CHECK(source IN ('twitter', 'discord', 'github', 'support', 'email')),
  message TEXT NOT NULL,
  author TEXT,
  sentiment TEXT CHECK(sentiment IN ('positive', 'negative', 'neutral')),
  theme TEXT CHECK(theme IN ('bug', 'feature_request', 'praise', 'complaint', 'question')),
  urgency TEXT CHECK(urgency IN ('low', 'medium', 'high')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  metadata TEXT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_created_at ON feedback(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_source ON feedback(source);
CREATE INDEX IF NOT EXISTS idx_sentiment ON feedback(sentiment);
CREATE INDEX IF NOT EXISTS idx_urgency ON feedback(urgency);
CREATE INDEX IF NOT EXISTS idx_theme ON feedback(theme);
