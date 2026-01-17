# Cloudflare Feedback Analyzer - Deployment Guide

## Overview

This is a feedback aggregation and analysis tool built for a Cloudflare PM Intern assignment. The application helps product managers analyze scattered customer feedback from multiple sources using Cloudflare's powerful edge computing platform.

## Architecture

### Cloudflare Products Used

1. **Cloudflare Workers** (Required)
   - Serverless execution environment
   - Handles all API routes and serves the dashboard
   - Runs on Cloudflare's global edge network

2. **D1 Database** (Required)
   - Cloudflare's serverless SQL database
   - Stores all feedback entries with metadata
   - Supports complex queries for analytics

3. **Workers AI** (Required)
   - On-edge AI inference
   - Analyzes sentiment, themes, and urgency
   - Generates executive summaries
   - Uses Llama 3 8B model

4. **KV (Workers KV)** (Additional Product)
   - Key-value storage for caching
   - Caches analysis results (5-minute TTL)
   - Reduces AI API calls and improves response times

### Why These Products?

- **Workers**: Perfect for API endpoints and serving HTML, with global distribution
- **D1**: Serverless SQL is ideal for structured feedback data with relationships
- **Workers AI**: On-edge AI ensures fast sentiment analysis without external API calls
- **KV**: Caching layer reduces costs and improves performance for repeated queries

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Wrangler CLI (installed via npm)

### Setup Local Environment

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Local Database**
   ```bash
   # Apply schema
   npm run db:migrate:local

   # Seed with mock data
   npm run db:seed:local
   ```

3. **Start Local Development Server**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:8787`

### Testing Locally

- **Dashboard**: Navigate to `http://localhost:8787`
- **Submit Feedback**: POST to `http://localhost:8787/api/feedback`
- **Get Analysis**: GET `http://localhost:8787/api/analyze?period=7d`
- **Health Check**: GET `http://localhost:8787/api/health`

Example feedback submission:
```bash
curl -X POST http://localhost:8787/api/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "source": "twitter",
    "message": "The new feature is amazing!",
    "author": "happy_user"
  }'
```

## Production Deployment

### Step 1: Set Up Cloudflare Account

1. Sign up at https://dash.cloudflare.com/
2. Get API token from https://dash.cloudflare.com/profile/api-tokens
3. Set environment variable:
   ```bash
   export CLOUDFLARE_API_TOKEN=your_token_here
   ```

### Step 2: Create Remote Resources

1. **Create D1 Database**
   ```bash
   npx wrangler d1 create feedback-db
   ```

   This will output something like:
   ```
   database_id = "abc123-def456-ghi789"
   ```

   Copy this ID and update `wrangler.toml`:
   ```toml
   [[d1_databases]]
   binding = "DB"
   database_name = "feedback-db"
   database_id = "abc123-def456-ghi789"  # Replace with your ID
   ```

2. **Create KV Namespace**
   ```bash
   npx wrangler kv:namespace create CACHE
   ```

   Copy the ID and update `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "CACHE"
   id = "your_kv_id_here"
   preview_id = "your_preview_id_here"
   ```

### Step 3: Initialize Remote Database

1. **Apply Schema to Remote Database**
   ```bash
   npm run db:migrate:remote
   ```

2. **Seed Remote Database (Optional)**
   ```bash
   npm run db:seed:remote
   ```

### Step 4: Deploy to Production

```bash
npm run deploy
```

This will:
- Build your Worker
- Upload code to Cloudflare
- Deploy to `https://feedback-analyzer.YOUR_SUBDOMAIN.workers.dev`

The deployment output will show your live URL.

## Post-Deployment Verification

1. **Check Health Endpoint**
   ```bash
   curl https://feedback-analyzer.YOUR_SUBDOMAIN.workers.dev/api/health
   ```

2. **View Dashboard**
   Navigate to your Worker URL in a browser

3. **Submit Test Feedback**
   Use the dashboard UI or API to submit feedback

4. **Run AI Analysis**
   Click "Refresh AI Analysis" in the dashboard

## Configuration Options

### Environment Variables

The app uses Cloudflare bindings (configured in `wrangler.toml`), no env vars needed!

### Analysis Parameters

Query parameters for `/api/analyze`:
- `period`: Time range (e.g., "7d", "30d") - default: "7d"
- `source`: Filter by source ("twitter", "discord", "github", "support", "email", "all") - default: "all"

Example:
```
GET /api/analyze?period=30d&source=github
```

## Monitoring & Debugging

### View Logs

```bash
npx wrangler tail
```

This shows real-time logs from your Worker.

### Check Database

```bash
# Query remote database
npx wrangler d1 execute feedback-db --command "SELECT COUNT(*) FROM feedback"

# Export data
npx wrangler d1 execute feedback-db --command "SELECT * FROM feedback" --json > feedback-export.json
```

### Check KV Cache

```bash
# List cached keys
npx wrangler kv:key list --namespace-id YOUR_KV_ID

# Get cached value
npx wrangler kv:key get "analysis:7d:all:2024-01-17" --namespace-id YOUR_KV_ID
```

## Troubleshooting

### "DB is not defined" Error
- Ensure D1 binding is configured in `wrangler.toml`
- Check database_id matches your created database

### "AI is not defined" Error
- Workers AI is enabled by default for paid plans
- Ensure `[ai]` binding is in `wrangler.toml`

### "CACHE is not defined" Error
- Create KV namespace and update binding ID
- Verify KV namespace ID in `wrangler.toml`

### Slow AI Analysis
- First request may be slower (cold start)
- Subsequent requests use KV cache (5-min TTL)
- Consider using D1 for pre-analyzed data

## Cost Optimization

- **Workers**: 100,000 requests/day free, then $0.50/million
- **D1**: 5M rows read free/day, 100k writes
- **Workers AI**: Free tier available, check limits
- **KV**: 100,000 reads/day free, 1,000 writes

Caching with KV significantly reduces AI costs!

## Production Checklist

- [ ] D1 database created and migrated
- [ ] KV namespace created and configured
- [ ] Worker deployed successfully
- [ ] Health endpoint returns 200
- [ ] Dashboard loads and displays data
- [ ] Feedback submission works
- [ ] AI analysis generates insights
- [ ] Logs show no errors

## Support

For Cloudflare-specific issues:
- Documentation: https://developers.cloudflare.com/
- Discord: https://discord.cloudflare.com/
- Community: https://community.cloudflare.com/

## Next Steps

1. Customize the dashboard styling
2. Add authentication for production use
3. Implement webhook integrations
4. Add more AI models for analysis
5. Create scheduled analytics reports
