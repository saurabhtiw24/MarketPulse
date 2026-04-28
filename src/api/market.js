// ─── MARKET DATA API ──────────────────────────────────────────────────────────
// All data fetching goes through Netlify serverless functions.
// This means: no CORS issues, no browser blocks, API keys stay secret.

const cache = new Map();
const TTL   = { quote: 60_000, detail: 60_000, news: 120_000 };

async function callFn(path, signal) {
  const r = await fetch(path, { signal: signal ?? AbortSignal.timeout(12000) });
  if (!r.ok) throw new Error(`${path} → HTTP ${r.status}`);
  return r.json();
}

// ── Basic quote for list rows ─────────────────────────────────────────────────
export async function fetchQuote(sym) {
  const key = "q:" + sym;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL.quote) return hit.data;

  try {
    const data = await callFn(`/.netlify/functions/stock-quote?sym=${encodeURIComponent(sym)}`);
    if (data?.price) cache.set(key, { ts: Date.now(), data });
    return data?.price ? data : null;
  } catch (e) {
    console.warn("fetchQuote:", sym, e.message);
    return null;
  }
}

// ── Full detail for StockPage ─────────────────────────────────────────────────
export async function fetchDetail(sym) {
  const key = "d:" + sym;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL.detail) return hit.data;

  try {
    const data = await callFn(`/.netlify/functions/stock-detail?sym=${encodeURIComponent(sym)}`);
    if (data?.price) cache.set(key, { ts: Date.now(), data });
    return data?.price ? data : null;
  } catch (e) {
    console.warn("fetchDetail:", sym, e.message);
    return null;
  }
}

// ── News ──────────────────────────────────────────────────────────────────────
export async function fetchNews(sym) {
  const key = "n:" + sym;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.ts < TTL.news) return hit.data;

  try {
    const data = await callFn(`/.netlify/functions/stock-news?sym=${encodeURIComponent(sym)}`);
    const news = data?.news ?? [];
    cache.set(key, { ts: Date.now(), data: news });
    return news;
  } catch (e) {
    console.warn("fetchNews:", sym, e.message);
    return [];
  }
}

// ── AI Analysis ───────────────────────────────────────────────────────────────
export async function aiAnalysis(prompt, mode) {
  try {
    const r = await fetch("/.netlify/functions/ai-analyze", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ prompt, mode }),
      signal:  AbortSignal.timeout(30_000),
    });
    if (!r.ok) return "AI analysis temporarily unavailable. Please try again.";
    const d = await r.json();
    return d?.text ?? "Analysis unavailable.";
  } catch {
    return "AI analysis temporarily unavailable. Please try again.";
  }
}
