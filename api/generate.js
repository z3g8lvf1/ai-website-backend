import express from 'express';

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

// Allow preflight requests
app.options('/api/generate', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

// Updated dynamic base prompt logic
function buildFullPrompt(userInput) {
  return `
You are a professional full-stack web developer and UX designer.

Generate a complete, mobile-first, responsive, single-page website as a single HTML file (index.html). It must use:

- Semantic HTML5
- Tailwind CSS via CDN
- Vanilla JavaScript (inside <script> tags in the HTML file)

This site must be based on the following user request:
"${userInput}"

Adapt your response to fully match the user's topic (e.g., if they request a game website, include features like leaderboard sections, embedded gameplay, modern gaming UI, etc).

Mandatory functional features to include (adjusted to suit the topic):
- Smooth scroll navigation
- Dark mode toggle with working JS and transitions
- Mobile nav menu toggle
- Working client-side form validation (email, name, message)
- Placeholder or stub for backend submission
- Responsive layout using Tailwind's utility classes
- ARIA attributes and keyboard accessibility

Automatically include the most relevant sections for the topic:
- Hero/banner with call-to-action
- About/introduction
- Features, services, or gameplay mechanics
- Testimonials or ratings (if relevant)
- Contact form
- Footer with social links and copyright

In each section, include placeholder text or hints for the user to customize.

Strict output requirements:
- Everything in one valid HTML file
- No explanations, markdown, or extra commentary
- Use clean, readable code — prioritize performance and accessibility

Output only the raw HTML content of index.html.
`.trim();
}

// POST /api/generate
app.post('/api/generate', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { prompt: userInput } = req.body;

  if (!userInput || typeof userInput !== 'string') {
    return res.status(400).json({ error: 'User prompt is required and must be a string.' });
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('API key not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  const fullPrompt = buildFullPrompt(userInput);

  try {
    const deepSeekResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [{ role: "user", content: fullPrompt }]
      })
    });

    if (!deepSeekResponse.ok) {
      const errorData = await deepSeekResponse.json();
      console.error('DeepSeek API error:', errorData);
      return res.status(deepSeekResponse.status).json({ error: errorData });
    }

    const data = await deepSeekResponse.json();
    res.status(200).json(data);

  } catch (error) {
    console.error('Handler error:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
