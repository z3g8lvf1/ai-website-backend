import express from 'express';

const app = express();
app.use(express.json());

const port = process.env.PORT || 3000;

app.options('/api/generate', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

const flawlessUniversalPrompt = `
You are a professional full-stack web developer and UX designer.

Generate a single fully responsive, accessible, single-page website in ONE complete HTML file named index.html.

Use semantic HTML5, Tailwind CSS (via CDN), and vanilla JavaScript included in script tags inside the same file.

All features and interactive elements must be FULLY FUNCTIONING, not just UI mockups:
- Dark mode toggle must switch themes with working JavaScript and smooth transitions.
- Navigation menu must support smooth scrolling to each section using JavaScript.
- Contact form must have working client-side validation for name, email, and message.
- Include placeholder actions or inline notes in JavaScript for sending form data via POST.
- Toggle menus (like mobile nav) must open/close correctly.
- All hover, scroll, and click interactions must behave as expected using JS/CSS.
- Add meaningful ARIA roles for accessibility.
- Ensure all scripts and interactions are tested to function across mobile, tablet, and desktop.

Based solely on the user's site description, automatically choose the most relevant sections from this list:
- Header with logo/site name and navigation
- Hero/banner with headline and call-to-action
- About or introduction
- Services, features, or products
- Portfolio or gallery
- Testimonials or reviews
- Pricing/donations
- Blog/news preview
- Contact form
- Footer with social links and copyright
- Fully functioning dark mode toggle

In each section, include placeholder text that briefly tells the user what to write or upload to personalize the site.

Ensure the site is:
- Mobile-first and responsive across all screen sizes
- Fully accessible with ARIA support and keyboard navigation
- Optimized for fast load: no unnecessary libraries, compress assets
- Uses clean, readable, semantic HTML5
- Uses Tailwind CSS (CDN) and vanilla JS
- Written in ONE valid and complete HTML file

Output ONLY the full content of index.html — no explanations, no extra text.
`;

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

  const fullPrompt = `
${flawlessUniversalPrompt}

User instructions: ${userInput}
  `.trim();

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

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
