// ─── MARKET DATA API ─────────────────────────────────────────────────────────
const CORS = "https://corsproxy.io/?";
const YF_CHART   = "https://query1.finance.yahoo.com/v8/finance/chart/";
const YF_MODULES = "https://query1.finance.yahoo.com/v10/finance/quoteSummary/";

const cache    = new Map();
const CACHE_TTL = 60_000;

// ── Basic quote (used in list rows) ──────────────────────────────────────────
export async function fetchQuote(sym) {
  const cached = cache.get("q:" + sym);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const url = `${CORS}${encodeURIComponent(YF_CHART + sym + "?interval=1d&range=1mo")}`;
    const r = await fetch(url, {
      headers: { "x-requested-with": "XMLHttpRequest" },
      signal: AbortSignal.timeout(8000),
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
    cache.set("q:" + sym, { ts: Date.now(), data });
    return data;
  } catch { return null; }
}

// ── Full detail (used in StockPage) ──────────────────────────────────────────
export async function fetchDetail(sym) {
  const cached = cache.get("d:" + sym);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const modules = "summaryDetail,defaultKeyStatistics,financialData,price,calendarEvents";
    const url = `${CORS}${encodeURIComponent(
      YF_MODULES + sym + `?modules=${modules}&corsDomain=finance.yahoo.com`
    )}`;
    const r = await fetch(url, {
      headers: { "x-requested-with": "XMLHttpRequest" },
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const d = await r.json();
    const res = d?.quoteSummary?.result?.[0];
    if (!res) return null;

    const sd  = res.summaryDetail        || {};
    const ks  = res.defaultKeyStatistics || {};
    const fd  = res.financialData        || {};
    const pr  = res.price                || {};

    const data = {
      // Summary
      open:          pr.regularMarketOpen?.raw,
      prevClose:     pr.regularMarketPreviousClose?.raw,
      high:          pr.regularMarketDayHigh?.raw,
      low:           pr.regularMarketDayLow?.raw,
      price:         pr.regularMarketPrice?.raw,
      change:        pr.regularMarketChange?.raw,
      changePct:     pr.regularMarketChangePercent?.raw * 100,
      vol:           pr.regularMarketVolume?.raw,
      marketCap:     pr.marketCap?.raw,
      currency:      pr.currency,
      week52High:    sd.fiftyTwoWeekHigh?.raw,
      week52Low:     sd.fiftyTwoWeekLow?.raw,
      // Circuits — Yahoo doesn't give exact circuits; use ±20% of prevClose as fallback
      upperCircuit:  pr.regularMarketPreviousClose?.raw * 1.20,
      lowerCircuit:  pr.regularMarketPreviousClose?.raw * 0.80,
      // Fundamentals
      peRatio:       sd.trailingPE?.raw        ?? ks.forwardPE?.raw,
      pbRatio:       ks.priceToBook?.raw,
      roe:           fd.returnOnEquity?.raw     ? fd.returnOnEquity.raw * 100 : null,
      evEbitda:      ks.enterpriseToEbitda?.raw,
      eps:           ks.trailingEps?.raw,
      debtToEquity:  fd.debtToEquity?.raw,
      revenueGrowth: fd.revenueGrowth?.raw     ? fd.revenueGrowth.raw * 100 : null,
      profitMargin:  fd.profitMargins?.raw      ? fd.profitMargins.raw * 100 : null,
      dividendYield: sd.dividendYield?.raw      ? sd.dividendYield.raw * 100 : null,
      beta:          sd.beta?.raw,
      avgVol:        sd.averageVolume?.raw,
    };

    cache.set("d:" + sym, { ts: Date.now(), data });
    return data;
  } catch (e) {
    console.error("fetchDetail error:", e);
    return null;
  }
}

// ── News via Yahoo Finance RSS (proxied) ─────────────────────────────────────
export async function fetchNews(sym) {
  const cached = cache.get("n:" + sym);
  if (cached && Date.now() - cached.ts < 120_000) return cached.data; // 2-min cache

  try {
    // Yahoo Finance news search RSS
    const rssUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${sym}&region=IN&lang=en-IN`;
    const url    = `${CORS}${encodeURIComponent(rssUrl)}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const text = await r.text();

    // Parse RSS XML
    const parser = new DOMParser();
    const xml    = parser.parseFromString(text, "text/xml");
    const items  = Array.from(xml.querySelectorAll("item")).slice(0, 8);
    const news   = items.map((item) => ({
      title:   item.querySelector("title")?.textContent   || "",
      link:    item.querySelector("link")?.textContent    || "",
      pubDate: item.querySelector("pubDate")?.textContent || "",
      desc:    item.querySelector("description")?.textContent?.replace(/<[^>]+>/g, "") || "",
    }));

    cache.set("n:" + sym, { ts: Date.now(), data: news });
    return news;
  } catch { return []; }
}

// ── AI Analysis ───────────────────────────────────────────────────────────────
export async function aiAnalysis(prompt, mode) {
  try {
    const r = await fetch("/.netlify/functions/ai-analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, mode }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!r.ok) return "Analysis temporarily unavailable. Please try again.";
    const d = await r.json();
    return d?.text ?? "Analysis unavailable.";
  } catch {
    return "Analysis temporarily unavailable. Please try again.";
  }
}
