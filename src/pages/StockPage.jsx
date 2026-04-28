import { useState, useEffect, useRef, useCallback } from "react";
import { fetchDetail, fetchNews, aiAnalysis } from "../api/market";
import { fmt, pct, clr } from "../utils/format";

// ─── small shared components ──────────────────────────────────────────────────
const Lbl = ({ ch }) => (
  <div style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{ch}</div>
);

function fmtCap(n) {
  if (!n) return "—";
  if (n >= 1e12) return `₹${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9)  return `₹${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e7)  return `₹${(n / 1e7).toFixed(2)}Cr`;
  return `₹${fmt(n)}`;
}

function timeAgo(str) {
  if (!str) return "";
  try {
    const diff = Date.now() - new Date(str).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1)  return `${Math.floor(diff / 60000)}m ago`;
    if (h < 24) return `${h}h ago`;
    return new Date(str).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch { return ""; }
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, sub, badge }) {
  return (
    <div style={{
      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10, padding: "13px 14px", display: "flex", flexDirection: "column", gap: 3,
    }}>
      <Lbl ch={label} />
      <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: color || "#e8ecf4" }}>
        {value ?? <span style={{ color: "#3a4568" }}>—</span>}
      </div>
      {sub   && <div style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace" }}>{sub}</div>}
      {badge && <div style={{ marginTop: 4, fontSize: 9, fontFamily: "'DM Mono',monospace", color, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 3, padding: "2px 7px", display: "inline-block" }}>{badge}</div>}
    </div>
  );
}

// ─── SUMMARY TAB ─────────────────────────────────────────────────────────────
function SummaryTab({ d }) {
  if (!d) return (
    <div style={{ padding: 32, textAlign: "center", color: "#ff6b6b", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
      Market data unavailable — Yahoo Finance may be rate-limiting. Try again in a moment.
    </div>
  );

  const c = clr(d.changePct);
  const pct52 = d.week52Low && d.week52High && d.price
    ? Math.min(100, Math.max(0, ((d.price - d.week52Low) / (d.week52High - d.week52Low)) * 100))
    : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* ── PRICE HERO ── */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em", marginBottom: 6 }}>CURRENT MARKET PRICE</div>
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 38, color: "#fff", lineHeight: 1 }}>
              ₹{fmt(d.price)}
            </div>
            <div style={{ marginTop: 8, fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 16, color: c }}>
              {d.change >= 0 ? "▲" : "▼"} ₹{fmt(Math.abs(d.change))} &nbsp;({pct(d.changePct)} today)
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, minWidth: 200 }}>
            <StatCard label="Market Cap"  value={fmtCap(d.marketCap)} />
            <StatCard label="Volume"      value={d.vol ? `${(d.vol / 1e5).toFixed(2)}L` : null} sub="Today's volume" />
          </div>
        </div>
      </div>

      {/* ── TODAY'S SNAPSHOT ── */}
      <div>
        <div style={{ fontSize: 10, color: "#4fffb0", fontFamily: "'DM Mono',monospace", letterSpacing: "0.12em", marginBottom: 10 }}>TODAY'S SNAPSHOT</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(145px, 1fr))", gap: 8 }}>
          <StatCard label="Open Price"  value={`₹${fmt(d.open)}`}      sub="Market open" />
          <StatCard label="Prev. Close" value={`₹${fmt(d.prevClose)}`} sub="Yesterday close" />
          <StatCard label="Day High"    value={`₹${fmt(d.high)}`}      color="#4fffb0"   sub="Today's high" />
          <StatCard label="Day Low"     value={`₹${fmt(d.low)}`}       color="#ff6b6b"   sub="Today's low" />
          <StatCard label="Avg Volume"  value={d.avgVol ? `${(d.avgVol / 1e5).toFixed(1)}L` : null} sub="30-day avg" />
          <StatCard label="Beta"        value={d.beta?.toFixed(2)}      sub="Market sensitivity" />
        </div>
      </div>

      {/* ── CIRCUIT LIMITS ── */}
      <div>
        <div style={{ fontSize: 10, color: "#ffd166", fontFamily: "'DM Mono',monospace", letterSpacing: "0.12em", marginBottom: 10 }}>
          CIRCUIT LIMITS <span style={{ color: "#5a6278", fontWeight: 400, fontSize: 8 }}>(±20% of prev. close — indicative)</span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div style={{ background: "rgba(79,255,176,0.05)", border: "1px solid rgba(79,255,176,0.18)", borderRadius: 12, padding: "16px 18px" }}>
            <Lbl ch="Upper Circuit" />
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "#4fffb0" }}>₹{fmt(d.upperCircuit)}</div>
            <div style={{ fontSize: 9, color: "#4fffb0", fontFamily: "'DM Mono',monospace", marginTop: 4, opacity: 0.7 }}>
              +20% · Trading halts above this
            </div>
          </div>
          <div style={{ background: "rgba(255,107,107,0.05)", border: "1px solid rgba(255,107,107,0.18)", borderRadius: 12, padding: "16px 18px" }}>
            <Lbl ch="Lower Circuit" />
            <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 22, color: "#ff6b6b" }}>₹{fmt(d.lowerCircuit)}</div>
            <div style={{ fontSize: 9, color: "#ff6b6b", fontFamily: "'DM Mono',monospace", marginTop: 4, opacity: 0.7 }}>
              -20% · Trading halts below this
            </div>
          </div>
        </div>
      </div>

      {/* ── 52-WEEK RANGE ── */}
      <div>
        <div style={{ fontSize: 10, color: "#a29bfe", fontFamily: "'DM Mono',monospace", letterSpacing: "0.12em", marginBottom: 10 }}>52-WEEK RANGE</div>
        <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "18px 20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <Lbl ch="52W Low" />
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: "#ff6b6b" }}>₹{fmt(d.week52Low)}</div>
            </div>
            {pct52 != null && (
              <div style={{ textAlign: "center" }}>
                <Lbl ch="Position" />
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: "#a29bfe" }}>{pct52.toFixed(0)}%</div>
                <div style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace" }}>of 52W range</div>
              </div>
            )}
            <div style={{ textAlign: "right" }}>
              <Lbl ch="52W High" />
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: "#4fffb0" }}>₹{fmt(d.week52High)}</div>
            </div>
          </div>
          {/* Range bar */}
          {pct52 != null && (
            <div style={{ position: "relative" }}>
              <div style={{ height: 8, background: "rgba(255,255,255,0.07)", borderRadius: 4 }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${pct52}%`, background: "linear-gradient(90deg, #ff6b6b, #ffd166, #4fffb0)",
                  borderRadius: 4, transition: "width 0.8s ease",
                }} />
                <div style={{
                  position: "absolute", top: "50%", left: `${pct52}%`,
                  transform: "translate(-50%, -50%)",
                  width: 14, height: 14, borderRadius: "50%", background: "#fff",
                  border: "2px solid #090c11", boxShadow: "0 0 8px rgba(162,155,254,0.8)",
                }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace" }}>
                <span>52W Low</span>
                <span style={{ color: "#a29bfe" }}>Current: ₹{fmt(d.price)}</span>
                <span>52W High</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── DIVIDEND ── */}
      {d.dividendYield && (
        <StatCard label="Dividend Yield" value={`${d.dividendYield.toFixed(2)}%`} color="#ffd166" sub="Annual dividend yield" />
      )}
    </div>
  );
}

// ─── TRADINGVIEW CHART TAB ────────────────────────────────────────────────────
function ChartTab({ sym }) {
  const containerRef = useRef(null);
  const tvSym = "NSE:" + sym.replace(".NS", "");

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "tradingview-widget-container__widget";
    wrapper.style.cssText = "height:100%;width:100%;";
    el.appendChild(wrapper);

    const script = document.createElement("script");
    script.type  = "text/javascript";
    script.src   = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize:           true,
      symbol:             tvSym,
      interval:           "D",
      timezone:           "Asia/Kolkata",
      theme:              "dark",
      style:              "1",
      locale:             "en",
      backgroundColor:    "#090c11",
      gridColor:          "rgba(255,255,255,0.04)",
      hide_top_toolbar:   false,
      hide_legend:        false,
      allow_symbol_change: false,
      save_image:         true,
      calendar:           false,
      studies:            ["Volume@tv-basicstudies", "MAExp@tv-basicstudies"],
      support_host:       "https://www.tradingview.com",
    });
    el.appendChild(script);
    return () => { el.innerHTML = ""; };
  }, [tvSym]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      {/* Info bar */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10, padding: "10px 20px",
        background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)",
        flexShrink: 0,
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#4fffb0", display: "inline-block", boxShadow: "0 0 6px #4fffb0" }} />
        <span style={{ fontSize: 10, color: "#7a8299", fontFamily: "'DM Mono',monospace" }}>
          LIVE CHART · <span style={{ color: "#4fffb0" }}>{tvSym}</span> · Powered by TradingView
        </span>
        <a href={`https://www.tradingview.com/chart/?symbol=${tvSym}`} target="_blank" rel="noopener noreferrer"
          style={{ marginLeft: "auto", fontSize: 10, color: "#4fffb0", fontFamily: "'DM Mono',monospace", textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          Open full chart ↗
        </a>
      </div>
      <div ref={containerRef} className="tradingview-widget-container" style={{ flex: 1, minHeight: 0 }} />
    </div>
  );
}

// ─── NEWS TAB ─────────────────────────────────────────────────────────────────
function NewsTab({ sym, name }) {
  const [news, setNews] = useState([]);
  const [ld,   setLd]   = useState(true);

  useEffect(() => {
    setLd(true);
    fetchNews(sym).then(n => { setNews(n); setLd(false); });
  }, [sym]);

  if (ld) return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <div style={{ fontSize: 11, color: "#4fffb0", fontFamily: "'DM Mono',monospace", animation: "pulse 1.2s infinite" }}>
        Fetching latest news for {name}…
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ fontSize: 10, color: "#ffd166", fontFamily: "'DM Mono',monospace", letterSpacing: "0.1em" }}>
          LATEST NEWS
        </div>
        {news.length > 0 && (
          <div style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace" }}>{news.length} articles</div>
        )}
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          {[
            { label: "ET Markets", href: `https://economictimes.indiatimes.com/topic/${sym.replace(".NS","")}` },
            { label: "MoneyControl", href: `https://www.moneycontrol.com/mccode/common/search/search_result.php?search_data=${name.split(" ")[0]}` },
          ].map(l => (
            <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer" style={{
              fontSize: 9, color: "#7a8299", fontFamily: "'DM Mono',monospace",
              textDecoration: "none", padding: "3px 8px",
              border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4,
            }}>{l.label} ↗</a>
          ))}
        </div>
      </div>

      {news.length === 0 ? (
        <div style={{ padding: "30px 20px", textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ fontSize: 13, color: "#3a4568", marginBottom: 10 }}>No RSS news found for this stock.</div>
          <div style={{ fontSize: 10, color: "#5a6278", fontFamily: "'DM Mono',monospace" }}>Check the links above for latest news.</div>
        </div>
      ) : news.map((n, i) => (
        <a key={i} href={n.link} target="_blank" rel="noopener noreferrer" style={{
          display: "block", textDecoration: "none",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 11, padding: "14px 16px", transition: "border-color 0.15s, background 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,209,102,0.3)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"; e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
        >
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#e8ecf4", lineHeight: 1.45, marginBottom: 6 }}>
            {n.title}
          </div>
          {n.desc && n.desc.length > 10 && (
            <div style={{ fontSize: 12, color: "#7a8299", lineHeight: 1.6, marginBottom: 8 }}>
              {n.desc.slice(0, 200)}{n.desc.length > 200 ? "…" : ""}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 9, color: "#ffd166", fontFamily: "'DM Mono',monospace" }}>{timeAgo(n.pubDate)}</span>
            <span style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace" }}>· Read full article ↗</span>
          </div>
        </a>
      ))}
    </div>
  );
}

// ─── FUNDAMENTALS TAB ────────────────────────────────────────────────────────
function FundamentalsTab({ s, d, mode }) {
  const [ai,  setAi]  = useState("");
  const [aiL, setAiL] = useState(false);

  const runAI = useCallback(() => {
    setAi(""); setAiL(true);
    const ctx = d
      ? `P/E: ${d.peRatio?.toFixed(2) ?? "N/A"}, P/B: ${d.pbRatio?.toFixed(2) ?? "N/A"}, ROE: ${d.roe?.toFixed(1) ?? "N/A"}%, EV/EBITDA: ${d.evEbitda?.toFixed(2) ?? "N/A"}, EPS: ₹${d.eps?.toFixed(2) ?? "N/A"}, Profit Margin: ${d.profitMargin?.toFixed(1) ?? "N/A"}%, Revenue Growth: ${d.revenueGrowth?.toFixed(1) ?? "N/A"}%, Debt/Equity: ${d.debtToEquity?.toFixed(2) ?? "N/A"}, Market Cap: ${fmtCap(d.marketCap)}`
      : "Fundamental data unavailable";
    aiAnalysis(`Give a detailed fundamental analysis of ${s.name} (${s.sym}), Sector: ${s.sector}. Key metrics — ${ctx}. Highlight valuation, profitability, growth, and risks.`, mode)
      .then(r => { setAi(r); setAiL(false); });
  }, [s, d, mode]);

  useEffect(() => { runAI(); }, [s.sym, mode]); // eslint-disable-line

  const groups = [
    {
      title: "VALUATION RATIOS",
      color: "#4fffb0",
      metrics: [
        {
          label: "P/E Ratio", value: d?.peRatio?.toFixed(2), unit: "x",
          sub: "Price-to-Earnings",
          badge: d?.peRatio > 40 ? "Expensive" : d?.peRatio > 25 ? "Premium" : d?.peRatio < 12 ? "Cheap" : "Fair",
          badgeColor: d?.peRatio > 40 ? "#ff6b6b" : d?.peRatio > 25 ? "#ffd166" : d?.peRatio < 12 ? "#4fffb0" : "#7a8299",
        },
        {
          label: "P/B Ratio", value: d?.pbRatio?.toFixed(2), unit: "x",
          sub: "Price-to-Book",
          badge: d?.pbRatio < 1 ? "Below Book" : d?.pbRatio > 5 ? "High Premium" : null,
          badgeColor: d?.pbRatio < 1 ? "#4fffb0" : "#ffd166",
        },
        {
          label: "EV / EBITDA", value: d?.evEbitda?.toFixed(2), unit: "x",
          sub: "Enterprise Value Multiple",
          badge: d?.evEbitda < 10 ? "Attractive" : d?.evEbitda > 25 ? "Rich" : null,
          badgeColor: d?.evEbitda < 10 ? "#4fffb0" : "#ff6b6b",
        },
        {
          label: "EPS (TTM)", value: d?.eps ? `₹${d.eps.toFixed(2)}` : null,
          sub: "Earnings per Share",
          badge: d?.eps > 0 ? "Profitable" : d?.eps < 0 ? "Loss-making" : null,
          badgeColor: d?.eps > 0 ? "#4fffb0" : "#ff6b6b",
        },
      ],
    },
    {
      title: "PROFITABILITY",
      color: "#74b9ff",
      metrics: [
        {
          label: "ROE", value: d?.roe?.toFixed(1), unit: "%",
          sub: "Return on Equity",
          badge: d?.roe > 20 ? "Excellent" : d?.roe > 12 ? "Good" : d?.roe < 8 ? "Weak" : null,
          badgeColor: d?.roe > 20 ? "#4fffb0" : d?.roe > 12 ? "#74b9ff" : "#ff6b6b",
        },
        {
          label: "Profit Margin", value: d?.profitMargin?.toFixed(1), unit: "%",
          sub: "Net profit margin",
          badge: d?.profitMargin > 20 ? "High Margin" : d?.profitMargin < 5 ? "Thin Margin" : null,
          badgeColor: d?.profitMargin > 20 ? "#4fffb0" : "#ffd166",
        },
        {
          label: "Revenue Growth", value: d?.revenueGrowth?.toFixed(1), unit: "%",
          sub: "Year-over-year",
          badge: d?.revenueGrowth > 15 ? "High Growth" : d?.revenueGrowth < 0 ? "Declining" : null,
          badgeColor: d?.revenueGrowth > 15 ? "#4fffb0" : "#ff6b6b",
        },
      ],
    },
    {
      title: "FINANCIAL HEALTH",
      color: "#ffd166",
      metrics: [
        {
          label: "Debt / Equity", value: d?.debtToEquity?.toFixed(2), unit: "x",
          sub: "Leverage ratio",
          badge: d?.debtToEquity > 2 ? "High Debt" : d?.debtToEquity < 0.3 ? "Debt Free" : null,
          badgeColor: d?.debtToEquity > 2 ? "#ff6b6b" : "#4fffb0",
        },
        {
          label: "Dividend Yield", value: d?.dividendYield?.toFixed(2), unit: "%",
          sub: "Annual dividend",
          badge: d?.dividendYield > 3 ? "High Yield" : null,
          badgeColor: "#ffd166",
        },
        {
          label: "Market Cap", value: fmtCap(d?.marketCap),
          sub: "Total market value",
        },
        {
          label: "Beta", value: d?.beta?.toFixed(2),
          sub: "Volatility vs market",
          badge: d?.beta > 1.5 ? "High Risk" : d?.beta < 0.7 ? "Low Risk" : "Moderate",
          badgeColor: d?.beta > 1.5 ? "#ff6b6b" : d?.beta < 0.7 ? "#4fffb0" : "#ffd166",
        },
      ],
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {groups.map(({ title, color, metrics }) => (
        <div key={title}>
          <div style={{ fontSize: 10, color, fontFamily: "'DM Mono',monospace", letterSpacing: "0.12em", marginBottom: 10 }}>{title}</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 8 }}>
            {metrics.map(({ label, value, unit = "", sub, badge, badgeColor }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, padding: "13px 14px" }}>
                <Lbl ch={label} />
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 18, color: value ? color : "#3a4568" }}>
                  {value ? `${value}${unit}` : "—"}
                </div>
                {sub && <div style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace", marginTop: 3 }}>{sub}</div>}
                {badge && value && (
                  <div style={{ marginTop: 6, fontSize: 9, fontFamily: "'DM Mono',monospace", color: badgeColor, background: `${badgeColor}15`, border: `1px solid ${badgeColor}28`, borderRadius: 3, padding: "2px 7px", display: "inline-block" }}>{badge}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* AI assessment */}
      <div style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 13, padding: "16px 18px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>✦ AI Fundamental Assessment</span>
          <span style={{ fontSize: 8, fontFamily: "'DM Mono',monospace", padding: "2px 8px", borderRadius: 3,
            color: mode==="trader" ? "#4fffb0" : "#74b9ff",
            background: mode==="trader" ? "rgba(79,255,176,0.08)" : "rgba(116,185,255,0.08)",
            border: `1px solid ${mode==="trader" ? "rgba(79,255,176,0.2)" : "rgba(116,185,255,0.2)"}`,
          }}>{mode.toUpperCase()}</span>
          <button onClick={runAI} disabled={aiL} style={{
            marginLeft: "auto", background: "transparent", border: "1px solid rgba(255,255,255,0.08)",
            color: "#7a8299", padding: "4px 12px", borderRadius: 5, cursor: aiL ? "not-allowed" : "pointer",
            fontSize: 10, fontFamily: "'DM Mono',monospace",
          }}>↺ Re-analyze</button>
        </div>
        {aiL
          ? <div style={{ fontSize: 11, color: "#4fffb0", fontFamily: "'DM Mono',monospace", animation: "pulse 1.2s infinite" }}>Analyzing fundamentals…</div>
          : <div style={{ fontSize: 13, color: "#c0cce0", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{ai}</div>
        }
      </div>
    </div>
  );
}

// ─── MAIN STOCK PAGE ──────────────────────────────────────────────────────────
const TABS = ["Summary", "Chart", "News", "Fundamentals"];
const TAB_ICONS = { Summary: "📋", Chart: "📊", News: "📰", Fundamentals: "🔬" };

export default function StockPage({ s, q, mode, onBack }) {
  const [tab,     setTab]     = useState("Summary");
  const [detail,  setDetail]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true); setDetail(null); setTab("Summary");
    fetchDetail(s.sym).then(d => { setDetail(d); setLoading(false); });
  }, [s.sym]);

  useEffect(() => {
    const h = e => { if (e.key === "Escape") onBack(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onBack]);

  const c = clr(detail?.changePct ?? q?.changePct);
  const displayPrice = detail?.price ?? q?.price;
  const displayChangePct = detail?.changePct ?? q?.changePct;

  const isChart = tab === "Chart";

  return (
    <div style={{ minHeight: "100vh", background: "#090c11", color: "#e8ecf4", fontFamily: "'DM Sans',sans-serif" }}>

      {/* ── TOP BAR ── */}
      <div style={{
        position: "sticky", top: 0, zIndex: 60,
        background: "rgba(9,12,17,0.96)", borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(12px)", padding: "10px 20px",
        display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap",
      }}>
        <button onClick={onBack} aria-label="Back" style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          color: "#c0cce0", padding: "7px 14px", borderRadius: 7, cursor: "pointer",
          fontSize: 12, fontFamily: "'DM Mono',monospace", flexShrink: 0,
        }}>← Back</button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 17, color: "#fff", margin: 0, whiteSpace: "nowrap" }}>
              {s.name}
            </h1>
            <span style={{ fontSize: 10, fontFamily: "'DM Mono',monospace", color: "#7a8299", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4, whiteSpace: "nowrap" }}>
              {s.sym.replace(".NS","")} · NSE
            </span>
            <span style={{ fontSize: 9, fontFamily: "'DM Mono',monospace", color: "#a29bfe", background: "rgba(162,155,254,0.08)", padding: "2px 8px", borderRadius: 4 }}>
              {s.sector}
            </span>
          </div>
        </div>

        {/* Live price */}
        <div style={{ textAlign: "right", flexShrink: 0 }}>
          {loading && !displayPrice
            ? <div style={{ fontSize: 10, color: "#5a6278", fontFamily: "'DM Mono',monospace", animation: "pulse 1.2s infinite" }}>Loading…</div>
            : <>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#fff" }}>₹{fmt(displayPrice)}</div>
                <div style={{ fontSize: 11, color: c, fontFamily: "'DM Mono',monospace" }}>{pct(displayChangePct)}</div>
              </>
          }
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{
        position: "sticky", top: 53, zIndex: 50,
        background: "rgba(9,12,17,0.96)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        display: "flex", padding: "0 20px",
      }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} aria-selected={tab === t} style={{
            padding: "11px 18px", border: "none", background: "transparent", cursor: "pointer",
            fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12,
            color: tab === t ? "#4fffb0" : "#5a6278",
            borderBottom: tab === t ? "2px solid #4fffb0" : "2px solid transparent",
            transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5,
            marginBottom: -1,
          }}>
            <span>{TAB_ICONS[t]}</span> {t}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      {isChart ? (
        <ChartTab sym={s.sym} />
      ) : (
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 20px 48px" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 11, color: "#4fffb0", fontFamily: "'DM Mono',monospace", animation: "pulse 1.2s infinite" }}>
                Loading data for {s.name}…
              </div>
            </div>
          ) : (
            <>
              {tab === "Summary"      && <SummaryTab      d={detail} />}
              {tab === "News"         && <NewsTab          sym={s.sym} name={s.name} />}
              {tab === "Fundamentals" && <FundamentalsTab  s={s} d={detail} mode={mode} />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
