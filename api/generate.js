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

app.post('/api/generate', async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

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
        messages: [{ role: "user", content: prompt }]
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
