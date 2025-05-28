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

Based solely on the user's site description, automatically choose the most relevant sections from the following list and include them:
- Header with logo/site name and navigation menu supporting smooth scrolling
- Hero/banner with headline, brief description, and a clear call-to-action
- About or introduction with text and an image
- Services, features, or product overview with icons or images
- Portfolio, gallery, or product listing with hover effects
- Testimonials or social proof with names and photos
- Pricing plans, donation buttons, or event registration form if appropriate
- Blog or news preview
- Contact form with accessible labels, placeholders guiding user input, and client-side validation
- Footer with social media links and copyright info
- Dark mode toggle for user preference

In every section you generate, include clear placeholder text inside headings, paragraphs, form fields, or image alt attributes that briefly explain what content the user should write or upload to make the site look professional and complete. For example, the About section should say: "Write a brief introduction about yourself or your company here."

Ensure the site is:
- Fully mobile-first and responsive across all devices
- Accessible, including ARIA roles and keyboard navigation support
- Optimized for fast loading (minimal external resources, compressed images placeholders, efficient scripts)
- Uses modern UI/UX best practices: harmonious colors, readable typography, ample whitespace, and subtle animations
- Smooth scrolling navigation for anchor links
- Dark mode toggle that smoothly switches color schemes

Write clean, semantic, well-indented, and valid HTML, CSS, and JavaScript in this one file.

Output only the complete content of index.html, ready to deploy with no bugs or errors.
`;

app.post('/api/generate', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    console.error('API key not configured');
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    const deepSeekResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [{ role: "user", content: flawlessUniversalPrompt }]
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
