export default async function handler(req, res) {
  // Enable CORS for all origins (change '*' to your frontend URL for security later)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    // Handle preflight CORS request
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST method allowed' });
  }

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Call your AI API here, e.g., DeepSeek API or OpenAI API
    // Example placeholder response (replace this with your actual API call):

    // Sample dummy response for testing
    const result = {
      choices: [
        {
          message: {
            content: `You asked: "${prompt}". This is a test response from backend.`
          }
        }
      ]
    };

    res.status(200).json(result);

  } catch (error) {
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
