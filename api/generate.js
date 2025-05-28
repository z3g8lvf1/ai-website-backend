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

// Enhanced prompt with strict functionality requirements
function buildFullPrompt(userInput) {
  return `
You are a professional full-stack web developer and UX designer. Your task is to create a complete, production-ready single-page website that has all features fully functional.

Generate a mobile-first, responsive website as a single HTML file (index.html) using:
- Semantic HTML5
- Tailwind CSS via CDN (v3.4+)
- Vanilla JavaScript (inside <script> tags)

BASED ON USER REQUEST: "${userInput}"

MANDATORY FUNCTIONAL REQUIREMENTS (must all work perfectly):
1. Navigation:
   - Smooth scroll to sections
   - Active link highlighting as user scrolls
   - Mobile hamburger menu that works on all screen sizes
   - Accessible with keyboard navigation

2. Dark Mode Toggle:
   - Must persist user preference in localStorage
   - Smooth transitions between modes
   - Proper contrast ratios in both modes
   - Toggle button with accessible ARIA labels

3. Contact Form:
   - Client-side validation for:
     * Email (proper format)
     * Name (minimum 2 characters)
     * Message (minimum 10 characters)
   - Clear error messages
   - Form submission handler (prevent default + success message)
   - Reset functionality

4. Responsive Design:
   - Properly adapts to all screen sizes
   - Tested breakpoints: 320px, 768px, 1024px, 1440px
   - No horizontal scroll on mobile
   - Touch-friendly interactive elements

5. Accessibility:
   - ARIA attributes where needed
   - Keyboard navigable
   - Proper heading hierarchy
   - Alt text for images
   - Sufficient color contrast

6. Performance:
   - No render-blocking resources
   - Efficient JavaScript
   - Optimized assets

SECTION REQUIREMENTS (all must be present and functional):
- Hero Section:
  * Primary call-to-action button that works
  * Animated background or visual element

- Features/Services:
  * Interactive elements (hover effects, tabs, etc.)
  * Icons or visual indicators

- Testimonials:
  * Functional slider/carousel if multiple
  * Proper attribution

- Contact Form:
  * As specified above with working validation

- Footer:
  * Working social media links (open in new tab)
  * Copyright notice with current year

CODING STANDARDS:
1. Use modern ES6 JavaScript with proper error handling
2. All interactive elements must have visual feedback
3. Include all necessary event listeners
4. No console errors when tested
5. All images must have placeholder src with alt text
6. Include viewport meta tag
7. Set proper lang attribute on HTML tag
8. Include favicon link (can use placeholder)

OUTPUT REQUIREMENTS:
- Only output the complete, valid HTML file
- No markdown, explanations, or comments
- Ready to save directly as index.html and work immediately
- All code must be properly formatted and indented

The website must work perfectly when the HTML file is opened directly in a browser, with no additional setup required.
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