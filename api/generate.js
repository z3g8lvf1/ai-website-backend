export default async function handler(req, res) {
  const { prompt } = await req.json();

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-coder",
      messages: [
        { role: "system", content: "You are a helpful AI developer." },
        { role: "user", content: prompt }
      ]
    })
  });

  const data = await response.json();
  return res.json(data);
}
