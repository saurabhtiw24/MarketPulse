// Netlify function: fetches full stock detail from Yahoo Finance (server-side, no CORS)
const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "identity",
      },
      timeout: 12000,
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
    const modules = "summaryDetail,defaultKeyStatistics,financialData,price";
    const url = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${encodeURIComponent(sym)}?modules=${modules}`;
    const res = await get(url);

    if (res.status !== 200) throw new Error(`YF returned ${res.status}`);

    const d   = JSON.parse(res.body);
    const r0  = d?.quoteSummary?.result?.[0];
    if (!r0) throw new Error("No result");

    const sd = r0.summaryDetail        || {};
    const ks = r0.defaultKeyStatistics || {};
    const fd = r0.financialData        || {};
    const pr = r0.price                || {};

    const prevClose = pr.regularMarketPreviousClose?.raw;

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({
        price:        pr.regularMarketPrice?.raw,
        open:         pr.regularMarketOpen?.raw,
        prevClose,
        high:         pr.regularMarketDayHigh?.raw,
        low:          pr.regularMarketDayLow?.raw,
        change:       pr.regularMarketChange?.raw,
        changePct:    pr.regularMarketChangePercent?.raw != null
                        ? pr.regularMarketChangePercent.raw * 100 : null,
        vol:          pr.regularMarketVolume?.raw,
        marketCap:    pr.marketCap?.raw,
        week52High:   sd.fiftyTwoWeekHigh?.raw,
        week52Low:    sd.fiftyTwoWeekLow?.raw,
        upperCircuit: prevClose ? prevClose * 1.20 : null,
        lowerCircuit: prevClose ? prevClose * 0.80 : null,
        peRatio:      sd.trailingPE?.raw   ?? ks.forwardPE?.raw,
        pbRatio:      ks.priceToBook?.raw,
        roe:          fd.returnOnEquity?.raw   != null ? fd.returnOnEquity.raw * 100   : null,
        evEbitda:     ks.enterpriseToEbitda?.raw,
        eps:          ks.trailingEps?.raw,
        debtToEquity: fd.debtToEquity?.raw,
        revenueGrowth:fd.revenueGrowth?.raw   != null ? fd.revenueGrowth.raw * 100    : null,
        profitMargin: fd.profitMargins?.raw   != null ? fd.profitMargins.raw * 100    : null,
        dividendYield:sd.dividendYield?.raw   != null ? sd.dividendYield.raw * 100    : null,
        beta:         sd.beta?.raw,
        avgVol:       sd.averageVolume?.raw,
      }),
    };
  } catch (e) {
    console.error("stock-detail error:", e.message);
    return { statusCode: 502, body: JSON.stringify({ error: "Fetch failed" }) };
  }
};
