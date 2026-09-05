export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY" });
    return;
  }

  try {
    const { system, userMsg } = req.body || {};
    if (!system || !userMsg) {
      res.status(400).json({ error: "Missing request payload" });
      return;
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2200,
        system,
        messages: [{ role: "user", content: userMsg }]
      })
    });

    const data = await response.json();
    if (!response.ok) {
      res.status(response.status).json({ error: data?.error?.message || "Anthropic API error" });
      return;
    }

    const text = (data.content || [])
      .map((block) => (block.type === "text" ? block.text : ""))
      .filter(Boolean)
      .join("\n");

    if (!text) {
      res.status(502).json({ error: "Empty AI response" });
      return;
    }

    res.status(200).json({ text });
  } catch (error) {
    res.status(500).json({ error: error?.message || "Unexpected server error" });
  }
}
