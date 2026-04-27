// ─── Netlify Serverless Function: AI Analysis Proxy ──────────────────────────
// This function runs on Netlify's servers, NOT in the browser.
// Your ANTHROPIC_API_KEY is stored in Netlify environment variables and
// is NEVER exposed to users — even if they open DevTools.

const ALLOWED_MODES = ["trader", "investor"];
const MAX_PROMPT_LENGTH = 2000;

exports.handler = async (event) => {
  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // Parse and validate body
  let prompt, mode;
  try {
    ({ prompt, mode } = JSON.parse(event.body || "{}"));
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return { statusCode: 400, body: JSON.stringify({ error: "Missing prompt" }) };
  }
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return { statusCode: 400, body: JSON.stringify({ error: "Prompt too long" }) };
  }
  if (!ALLOWED_MODES.includes(mode)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid mode" }) };
  }

  // Check API key is configured
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY environment variable is not set");
    return { statusCode: 500, body: JSON.stringify({ error: "Server configuration error" }) };
  }

  const systemPrompt =
    mode === "trader"
      ? "You are a sharp Indian stock market analyst for a SHORT-TERM TRADER. Use 3-5 bullet points. Mention key price levels, momentum, volume signals, and short-term risks. No definitive buy/sell calls."
      : "You are a sharp Indian stock market analyst for a LONG-TERM INVESTOR. Use 3-5 bullet points. Focus on fundamentals, valuation, competitive moat, and 3-5 year outlook. No definitive buy/sell calls.";

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type":      "application/json",
        "x-api-key":         apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model:     "claude-sonnet-4-20250514",
        max_tokens: 800,
        system:    systemPrompt,
        messages:  [{ role: "user", content: prompt.trim() }],
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error("Anthropic API error:", response.status, errBody);
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "AI service temporarily unavailable" }),
      };
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text ?? "Analysis unavailable.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    };
  } catch (err) {
    console.error("Function error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
