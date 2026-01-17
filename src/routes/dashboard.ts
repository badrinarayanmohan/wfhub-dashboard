import { Env, FeedbackRecord } from '../utils/types';

/**
 * Handle GET /
 * Render HTML dashboard
 */
export async function handleDashboard(request: Request, env: Env): Promise<Response> {
  try {
    // Fetch recent feedback
    const recentResults = await env.DB.prepare(`
      SELECT * FROM feedback
      ORDER BY created_at DESC
      LIMIT 30
    `).all();

    const recentFeedback = recentResults.results as FeedbackRecord[];

    // Calculate basic stats
    const statsResult = await env.DB.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN sentiment = 'positive' THEN 1 ELSE 0 END) as positive,
        SUM(CASE WHEN sentiment = 'negative' THEN 1 ELSE 0 END) as negative,
        SUM(CASE WHEN sentiment = 'neutral' THEN 1 ELSE 0 END) as neutral
      FROM feedback
      WHERE created_at >= datetime('now', '-7 days')
    `).first();

    const html = generateDashboardHTML(recentFeedback, statsResult as any);

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' },
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return new Response('Error loading dashboard', { status: 500 });
  }
}

function generateDashboardHTML(feedback: FeedbackRecord[], stats: any): string {
  const total = stats?.total || 0;
  const positive = stats?.positive || 0;
  const negative = stats?.negative || 0;
  const neutral = stats?.neutral || 0;

  const positivePercent = total > 0 ? Math.round((positive / total) * 100) : 0;
  const negativePercent = total > 0 ? Math.round((negative / total) * 100) : 0;
  const neutralPercent = total > 0 ? Math.round((neutral / total) * 100) : 0;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feedback Analyzer Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .sentiment-positive { background-color: #dcfce7; color: #166534; }
    .sentiment-negative { background-color: #fee2e2; color: #991b1b; }
    .sentiment-neutral { background-color: #f3f4f6; color: #374151; }
    .urgency-high { border-left: 4px solid #dc2626; }
    .urgency-medium { border-left: 4px solid #f59e0b; }
    .urgency-low { border-left: 4px solid #10b981; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold text-gray-900">Feedback Analyzer</h1>
        <p class="mt-1 text-sm text-gray-600">Cloudflare-powered customer feedback analysis</p>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <!-- Stats Overview -->
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600">Total Feedback</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">${total}</div>
          <div class="mt-1 text-xs text-gray-500">Last 7 days</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600">Positive</div>
          <div class="mt-2 text-3xl font-bold text-green-600">${positive}</div>
          <div class="mt-1 text-xs text-gray-500">${positivePercent}% of total</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600">Negative</div>
          <div class="mt-2 text-3xl font-bold text-red-600">${negative}</div>
          <div class="mt-1 text-xs text-gray-500">${negativePercent}% of total</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600">Neutral</div>
          <div class="mt-2 text-3xl font-bold text-gray-600">${neutral}</div>
          <div class="mt-1 text-xs text-gray-500">${neutralPercent}% of total</div>
        </div>
      </div>

      <!-- Actions -->
      <div class="mb-8 flex gap-4">
        <button onclick="refreshAnalysis()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Refresh AI Analysis
        </button>
        <button onclick="showSubmitForm()" class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          Submit Feedback
        </button>
        <select id="sourceFilter" onchange="filterBySource(this.value)" class="border rounded-lg px-4 py-2">
          <option value="all">All Sources</option>
          <option value="twitter">Twitter</option>
          <option value="discord">Discord</option>
          <option value="github">GitHub</option>
          <option value="support">Support</option>
          <option value="email">Email</option>
        </select>
      </div>

      <!-- AI Analysis Section -->
      <div id="analysisSection" class="bg-white rounded-lg shadow p-6 mb-8">
        <h2 class="text-xl font-bold text-gray-900 mb-4">AI Analysis</h2>
        <div id="analysisContent" class="text-gray-600">
          Click "Refresh AI Analysis" to generate insights...
        </div>
      </div>

      <!-- Recent Feedback -->
      <div class="bg-white rounded-lg shadow">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">Recent Feedback</h2>
        </div>
        <div class="divide-y divide-gray-200">
          ${feedback.map(item => `
            <div class="p-6 urgency-${(item as any).urgency || 'low'}">
              <div class="flex items-start justify-between">
                <div class="flex-1">
                  <div class="flex items-center gap-2 mb-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ${item.source}
                    </span>
                    ${item.sentiment ? `
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium sentiment-${item.sentiment}">
                        ${item.sentiment}
                      </span>
                    ` : ''}
                    ${(item as any).theme ? `
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        ${(item as any).theme.replace('_', ' ')}
                      </span>
                    ` : ''}
                    ${(item as any).urgency === 'high' ? `
                      <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        HIGH URGENCY
                      </span>
                    ` : ''}
                  </div>
                  <p class="text-gray-900 mb-2">${escapeHtml(item.message)}</p>
                  <div class="flex items-center gap-4 text-sm text-gray-500">
                    ${item.author ? `<span>By: ${escapeHtml(item.author)}</span>` : ''}
                    <span>${new Date(item.created_at).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </main>
  </div>

  <!-- Submit Feedback Modal -->
  <div id="submitModal" class="hidden fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
    <div class="bg-white rounded-lg p-8 max-w-md w-full">
      <h3 class="text-xl font-bold mb-4">Submit New Feedback</h3>
      <form id="feedbackForm" onsubmit="submitFeedback(event)">
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Source</label>
          <select name="source" required class="w-full border rounded-lg px-3 py-2">
            <option value="twitter">Twitter</option>
            <option value="discord">Discord</option>
            <option value="github">GitHub</option>
            <option value="support">Support</option>
            <option value="email">Email</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Message</label>
          <textarea name="message" required rows="4" class="w-full border rounded-lg px-3 py-2"></textarea>
        </div>
        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Author (optional)</label>
          <input type="text" name="author" class="w-full border rounded-lg px-3 py-2">
        </div>
        <div class="flex gap-2">
          <button type="submit" class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Submit
          </button>
          <button type="button" onclick="hideSubmitForm()" class="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>

  <script>
    async function refreshAnalysis() {
      const analysisContent = document.getElementById('analysisContent');
      analysisContent.innerHTML = '<div class="text-center py-4">Loading analysis...</div>';

      try {
        const response = await fetch('/api/analyze?period=7d');
        const data = await response.json();

        analysisContent.innerHTML = \`
          <div class="space-y-4">
            <div>
              <h3 class="font-semibold text-lg mb-2">Executive Summary</h3>
              <p class="text-gray-700">\${data.executive_summary}</p>
            </div>

            \${data.urgent_issues && data.urgent_issues.length > 0 ? \`
              <div>
                <h3 class="font-semibold text-lg mb-2 text-red-600">Urgent Issues (\${data.urgent_issues.length})</h3>
                <ul class="list-disc list-inside space-y-1">
                  \${data.urgent_issues.slice(0, 5).map(issue => \`
                    <li class="text-gray-700">\${issue.message.substring(0, 100)}...</li>
                  \`).join('')}
                </ul>
              </div>
            \` : ''}

            \${data.common_themes && data.common_themes.length > 0 ? \`
              <div>
                <h3 class="font-semibold text-lg mb-2">Common Themes</h3>
                <div class="flex flex-wrap gap-2">
                  \${data.common_themes.map(theme => \`
                    <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">\${theme}</span>
                  \`).join('')}
                </div>
              </div>
            \` : ''}
          </div>
        \`;
      } catch (error) {
        analysisContent.innerHTML = '<div class="text-red-600">Error loading analysis</div>';
      }
    }

    function showSubmitForm() {
      document.getElementById('submitModal').classList.remove('hidden');
    }

    function hideSubmitForm() {
      document.getElementById('submitModal').classList.add('hidden');
      document.getElementById('feedbackForm').reset();
    }

    async function submitFeedback(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);

      const data = {
        source: formData.get('source'),
        message: formData.get('message'),
        author: formData.get('author') || undefined,
      };

      try {
        const response = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          alert('Feedback submitted successfully!');
          hideSubmitForm();
          location.reload();
        } else {
          const error = await response.json();
          alert('Error: ' + error.error);
        }
      } catch (error) {
        alert('Error submitting feedback');
      }
    }

    function filterBySource(source) {
      if (source === 'all') {
        location.href = '/';
      } else {
        location.href = '/?source=' + source;
      }
    }
  </script>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}
