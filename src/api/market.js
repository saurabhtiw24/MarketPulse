// ─── MARKET DATA API ─────────────────────────────────────────────────────────
// Using corsproxy.io to bypass CORS for Yahoo Finance
const CORS = "https://corsproxy.io/?";
const YF   = "https://query1.finance.yahoo.com/v8/finance/chart/";

// Simple rate-limiter: max 1 request per symbol per 60 seconds
const cache = new Map();
const CACHE_TTL = 60_000;

export async function fetchQuote(sym) {
  const cached = cache.get(sym);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const url = `${CORS}${encodeURIComponent(YF + sym + "?interval=1d&range=1mo")}`;
    const r = await fetch(url, {
      headers: { "x-requested-with": "XMLHttpRequest" },
      signal: AbortSignal.timeout(8000), // 8s timeout
    });

    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    const m = d?.chart?.result?.[0]?.meta;
    if (!m) return null;

    const prev  = m.chartPreviousClose ?? m.previousClose;
    const price = m.regularMarketPrice;
    const data  = {
      price,
      change:    price - prev,
      changePct: ((price - prev) / prev) * 100,
      high:      m.regularMarketDayHigh,
      low:       m.regularMarketDayLow,
      vol:       m.regularMarketVolume,
      closes:    d.chart.result[0].indicators?.quote?.[0]?.close ?? [],
    };

    cache.set(sym, { ts: Date.now(), data });
    return data;
  } catch {
    return null;
  }
}

// ─── AI ANALYSIS API ─────────────────────────────────────────────────────────
// Calls our Netlify serverless function (netlify/functions/ai-analyze.js)
// which keeps the Anthropic API key secret on the server side.
export async function aiAnalysis(prompt, mode) {
  try {
    const r = await fetch("/.netlify/functions/ai-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, mode }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!r.ok) {
      console.error("AI function error:", r.status);
      return "Analysis temporarily unavailable. Please try again.";
    }

    const d = await r.json();
    return d?.text ?? "Analysis unavailable.";
  } catch (e) {
    console.error("AI fetch error:", e);
    return "Analysis temporarily unavailable. Please try again.";
  }
}
