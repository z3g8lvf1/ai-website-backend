export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end(); // CORS preflight
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Replace this with your real API call to DeepSeek or OpenAI
    // Here's a dummy example response to test
    const result = {
      choices: [
        {
          message: {
            content: `You sent: "${prompt}". This is a dummy response. Replace with your AI call.`
          }
        }
      ]
    };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
}
