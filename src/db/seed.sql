-- Mock feedback data for demonstration
INSERT INTO feedback (source, message, author, sentiment, theme, urgency, created_at, metadata) VALUES
-- Bugs (High urgency)
('support', 'The login page is completely broken on Safari mobile. Can''t sign in at all!', 'sarah_m', 'negative', 'bug', 'high', datetime('now', '-1 day'), '{"url": "ticket-1234", "browser": "Safari Mobile"}'),
('github', 'Getting 500 errors when uploading files larger than 10MB', 'dev_john', 'negative', 'bug', 'high', datetime('now', '-2 days'), '{"url": "github.com/issues/567", "issue_number": 567}'),
('discord', 'Dashboard keeps crashing when I try to filter by date range', 'mike_k', 'negative', 'bug', 'high', datetime('now', '-3 days'), '{"channel": "bug-reports", "timestamp": "2024-01-15T10:30:00Z"}'),
('support', 'Export to PDF feature is throwing errors on Chrome', 'admin_lisa', 'negative', 'bug', 'medium', datetime('now', '-5 days'), '{"url": "ticket-1289", "browser": "Chrome 120"}'),

-- Feature Requests
('discord', 'Would be amazing if we could export reports to CSV. Currently having to copy-paste manually.', 'product_manager', 'neutral', 'feature_request', 'medium', datetime('now', '-4 days'), '{"channel": "feature-requests"}'),
('twitter', 'Please add dark mode! My eyes are burning at night 🌙', 'night_owl_dev', 'neutral', 'feature_request', 'low', datetime('now', '-6 days'), '{"url": "twitter.com/status/123", "likes": 45}'),
('email', 'It would be great to have API webhooks for real-time notifications', 'enterprise_client', 'neutral', 'feature_request', 'medium', datetime('now', '-7 days'), '{"email_id": "msg-4567"}'),
('github', 'Add support for SSO with Okta and Azure AD', 'security_team', 'neutral', 'feature_request', 'high', datetime('now', '-8 days'), '{"url": "github.com/issues/589", "issue_number": 589}'),
('discord', 'Bulk edit would save me so much time!', 'power_user', 'neutral', 'feature_request', 'medium', datetime('now', '-10 days'), '{"channel": "feature-requests"}'),

-- Praise
('twitter', 'Just tried the new dashboard - absolutely love the redesign! Great work team 🎉', 'happy_customer', 'positive', 'praise', 'low', datetime('now', '-1 day'), '{"url": "twitter.com/status/456", "likes": 128}'),
('email', 'The API documentation is really clear and helpful!', 'api_developer', 'positive', 'praise', 'low', datetime('now', '-3 days'), '{"email_id": "msg-7890"}'),
('support', 'Your support team is incredible - they solved my issue in under 10 minutes!', 'grateful_user', 'positive', 'praise', 'low', datetime('now', '-5 days'), '{"url": "ticket-1245", "response_time": "8 minutes"}'),
('discord', 'The new search feature is lightning fast ⚡', 'community_mod', 'positive', 'praise', 'low', datetime('now', '-9 days'), '{"channel": "general"}'),
('github', 'Thank you for fixing the accessibility issues so quickly!', 'accessibility_advocate', 'positive', 'praise', 'low', datetime('now', '-12 days'), '{"url": "github.com/issues/601"}'),

-- Complaints
('support', 'The interface is so confusing. Took me 30 minutes to find the export button.', 'frustrated_user', 'negative', 'complaint', 'medium', datetime('now', '-2 days'), '{"url": "ticket-1256"}'),
('twitter', 'Why does every update break something that was working fine? 😤', 'angry_dev', 'negative', 'complaint', 'medium', datetime('now', '-4 days'), '{"url": "twitter.com/status/789"}'),
('discord', 'The mobile app is way too slow compared to the web version', 'mobile_user', 'negative', 'complaint', 'low', datetime('now', '-7 days'), '{"channel": "feedback"}'),
('email', 'Pricing seems high compared to competitors offering similar features', 'potential_customer', 'negative', 'complaint', 'medium', datetime('now', '-11 days'), '{"email_id": "msg-3456"}'),

-- Questions
('discord', 'How do I integrate this with Slack? Can''t find it in the docs', 'slack_admin', 'neutral', 'question', 'low', datetime('now', '-1 day'), '{"channel": "help"}'),
('support', 'Does the enterprise plan include dedicated support?', 'sales_inquiry', 'neutral', 'question', 'medium', datetime('now', '-3 days'), '{"url": "ticket-1267"}'),
('github', 'Is there a plan to support on-premise deployment?', 'enterprise_dev', 'neutral', 'question', 'medium', datetime('now', '-6 days'), '{"url": "github.com/discussions/45"}'),

-- Mixed recent feedback
('twitter', 'The performance improvements are noticeable! But please fix the notification spam', 'tech_reviewer', 'positive', 'bug', 'low', datetime('now', '-1 hour'), '{"url": "twitter.com/status/999"}'),
('support', 'Love the new features but the onboarding tutorial needs work', 'new_user', 'positive', 'complaint', 'low', datetime('now', '-6 hours'), '{"url": "ticket-1278"}'),
('discord', 'Analytics dashboard is beautiful but takes forever to load with large datasets', 'data_analyst', 'neutral', 'bug', 'medium', datetime('now', '-12 hours'), '{"channel": "feedback"}'),
('github', 'Great API design! Would love to see GraphQL support though', 'graphql_fan', 'positive', 'feature_request', 'low', datetime('now', '-18 hours'), '{"url": "github.com/discussions/78"}'),
('email', 'The widget integration is exactly what we needed for our use case!', 'happy_enterprise', 'positive', 'praise', 'low', datetime('now', '-1 day'), '{"email_id": "msg-8901"}'),

-- Older feedback for variety
('support', 'Search functionality returns irrelevant results', 'search_user', 'negative', 'bug', 'medium', datetime('now', '-15 days'), '{"url": "ticket-1190"}'),
('twitter', 'Best decision was switching to your platform. No regrets!', 'satisfied_customer', 'positive', 'praise', 'low', datetime('now', '-20 days'), '{"url": "twitter.com/status/111"}'),
('discord', 'Multi-language support would open this up to global teams', 'international_user', 'neutral', 'feature_request', 'medium', datetime('now', '-25 days'), '{"channel": "feature-requests"}'),
('github', 'Memory leak in the background sync process', 'performance_tester', 'negative', 'bug', 'high', datetime('now', '-28 days'), '{"url": "github.com/issues/612"}');
