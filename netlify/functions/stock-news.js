// Netlify function: fetches stock news from Yahoo Finance RSS (server-side, no CORS)
const https = require("https");

function get(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/rss+xml, application/xml, text/xml, */*",
      },
      timeout: 8000,
    }, (res) => {
      // follow one redirect
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        get(res.headers.location).then(resolve).catch(reject);
        return;
      }
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => resolve({ status: res.statusCode, body: data }));
    });
    req.on("error", reject);
    req.on("timeout", () => { req.destroy(); reject(new Error("timeout")); });
  });
}

// Minimal XML tag extractor (no external deps needed)
function extractTags(xml, tag) {
  const results = [];
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "gi");
  let m;
  while ((m = re.exec(xml)) !== null) results.push(m[1].trim());
  return results;
}

function stripCdata(s) {
  return s.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").replace(/<[^>]+>/g, "").trim();
}

exports.handler = async (event) => {
  const sym = event.queryStringParameters?.sym;
  if (!sym || !/^[A-Z0-9.\-&^]+$/.test(sym)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid symbol" }) };
  }

  try {
    const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${encodeURIComponent(sym)}&region=IN&lang=en-IN`;
    const res = await get(url);
    if (res.status !== 200) throw new Error(`RSS returned ${res.status}`);

    const xml = res.body;
    // Extract <item> blocks
    const itemBlocks = [];
    const itemRe = /<item>([\s\S]*?)<\/item>/gi;
    let m;
    while ((m = itemRe.exec(xml)) !== null) itemBlocks.push(m[1]);

    const news = itemBlocks.slice(0, 8).map(block => {
      const title   = stripCdata(extractTags(block, "title")[0]   || "");
      const link    = stripCdata(extractTags(block, "link")[0]    || "");
      const pubDate = stripCdata(extractTags(block, "pubDate")[0] || "");
      const desc    = stripCdata(extractTags(block, "description")[0] || "");
      return { title, link, pubDate, desc };
    }).filter(n => n.title);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=120" },
      body: JSON.stringify({ news }),
    };
  } catch (e) {
    console.error("stock-news error:", e.message);
    return { statusCode: 200, body: JSON.stringify({ news: [] }) };
  }
};
