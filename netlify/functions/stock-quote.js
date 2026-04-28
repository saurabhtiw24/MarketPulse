// Netlify function: fetches basic quote from Yahoo Finance (server-side, no CORS)
const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
      },
      timeout: 8000,
    }, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

exports.handler = async (event) => {
  const sym = event.queryStringParameters?.sym;
  if (!sym || !/^[A-Z0-9.\-&^]+$/.test(sym)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid symbol" }) };
  }

  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1mo`;
    const res = await get(url);
    if (res.status !== 200) throw new Error(`YF returned ${res.status}`);

    const d = JSON.parse(res.body);
    const m = d?.chart?.result?.[0]?.meta;
    if (!m) return { statusCode: 404, body: JSON.stringify({ error: "No data" }) };

    const prev  = m.chartPreviousClose ?? m.previousClose ?? m.regularMarketPrice;
    const price = m.regularMarketPrice;
    const closes = d.chart.result[0].indicators?.quote?.[0]?.close ?? [];

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({
        price,
        change:    price - prev,
        changePct: prev ? ((price - prev) / prev) * 100 : 0,
        high:      m.regularMarketDayHigh,
        low:       m.regularMarketDayLow,
        vol:       m.regularMarketVolume,
        closes:    closes.slice(-30),
      }),
    };
  } catch (e) {
    console.error("stock-quote error:", e.message);
    return { statusCode: 502, body: JSON.stringify({ error: "Fetch failed" }) };
  }
};
