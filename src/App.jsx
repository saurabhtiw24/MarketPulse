import { useState, useMemo, useCallback } from "react";
import { NSE_STOCKS, SECTORS } from "./data/stocks";
import StockRow  from "./components/StockRow";
import Chat      from "./components/Chat";
import StockPage from "./pages/StockPage";

const PAGE_SIZE = 40;

const GLOBAL_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { height: 100%; background: #090c11; }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
  @keyframes pulse  { 0%,100%{ opacity:1; } 50%{ opacity:0.35; } }
  @keyframes fadeIn { from{ opacity:0; transform:translateY(6px); } to{ opacity:1; transform:translateY(0); } }
  @keyframes slideIn { from{ opacity:0; transform:translateX(20px); } to{ opacity:1; transform:translateX(0); } }
  input::placeholder { color: #3a4568; }
  input { caret-color: #4fffb0; }
  button:focus-visible, a:focus-visible { outline: 2px solid #4fffb0; outline-offset: 2px; }
  select option { background: #111820; }
`;

export default function App() {
  const [mode,     setMode]     = useState("trader");
  const [search,   setSearch]   = useState("");
  const [sector,   setSector]   = useState("All");
  const [selected, setSelected] = useState(null);   // { s, q } → opens StockPage
  const [page,     setPage]     = useState(0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return NSE_STOCKS.filter(s => {
      const matchSec = sector === "All" || s.sector === sector;
      const matchQ   = !q || s.name.toLowerCase().includes(q)
        || s.sym.toLowerCase().includes(q)
        || s.sector.toLowerCase().includes(q);
      return matchSec && matchQ;
    });
  }, [search, sector]);

  const paged = filtered.slice(0, (page + 1) * PAGE_SIZE);

  const handleSelect  = useCallback((s, q) => setSelected({ s, q }), []);
  const handleBack    = useCallback(() => setSelected(null), []);
  const handleSearch  = useCallback(e => { setSearch(e.target.value); setPage(0); }, []);
  const handleSector  = useCallback(e => { setSector(e.target.value); setPage(0); }, []);

  // ── Full Stock Page view ───────────────────────────────────────────────────
  if (selected) {
    return (
      <>
        <style>{GLOBAL_STYLES}</style>
        <StockPage s={selected.s} q={selected.q} mode={mode} onBack={handleBack} />
      </>
    );
  }

  // ── Main list view ────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#090c11", color: "#e8ecf4", fontFamily: "'DM Sans',sans-serif" }}>
      <style>{GLOBAL_STYLES}</style>

      {/* ── HEADER ── */}
      <header style={{
        padding: "14px 20px 12px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "#090c11", position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(12px)",
      }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, justifyContent: "space-between" }}>
          <div>
            <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 8, color: "#4fffb0", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 2 }}>
              NSE · {NSE_STOCKS.length} STOCKS · LIVE + AI
            </div>
            <h1 style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 20, color: "#fff", lineHeight: 1 }}>
              MarketPulse <span style={{ color: "#4fffb0" }}>India</span>
            </h1>
          </div>

          <div role="group" aria-label="Analysis mode" style={{
            display: "flex", background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)", borderRadius: 10, padding: 3, gap: 2,
          }}>
            {["trader","investor"].map(m => (
              <button key={m} onClick={() => setMode(m)} aria-pressed={mode === m} style={{
                padding: "6px 16px", borderRadius: 7, border: "none", cursor: "pointer",
                background: mode === m ? (m==="trader" ? "rgba(79,255,176,0.18)" : "rgba(116,185,255,0.18)") : "transparent",
                color:      mode === m ? (m==="trader" ? "#4fffb0" : "#74b9ff") : "#7a8299",
                fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 11, transition: "all 0.2s",
              }}>
                {m === "trader" ? "⚡ Trader" : "📈 Investor"}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#5a6278", pointerEvents: "none" }}>🔍</span>
            <input
              value={search} onChange={handleSearch}
              placeholder={`Search ${NSE_STOCKS.length} NSE stocks…`}
              aria-label="Search stocks"
              style={{
                width: "100%", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                borderRadius: 8, padding: "8px 12px 8px 32px", color: "#e0e8f4",
                fontSize: 12, fontFamily: "'DM Mono',monospace", outline: "none",
              }}
            />
          </div>
          <select value={sector} onChange={handleSector} aria-label="Filter by sector" style={{
            background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 8, padding: "8px 12px", color: "#e0e8f4", fontSize: 11,
            fontFamily: "'DM Mono',monospace", outline: "none", cursor: "pointer", minWidth: 140,
          }}>
            {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div style={{
            display: "flex", alignItems: "center", padding: "0 12px",
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 8, fontSize: 10, color: "#7a8299", fontFamily: "'DM Mono',monospace",
          }}>{filtered.length} stocks</div>
        </div>
      </header>

      {/* ── BODY ── */}
      <main style={{ display: "grid", gridTemplateColumns: "1fr 300px", maxWidth: 1200, margin: "0 auto" }}>

        {/* LEFT: Stock list */}
        <section aria-label="Stock list" style={{ borderRight: "1px solid rgba(255,255,255,0.06)" }}>
          {/* Mode banner */}
          <div style={{
            padding: "7px 14px",
            background: mode==="trader" ? "rgba(79,255,176,0.03)" : "rgba(116,185,255,0.03)",
            borderBottom: `1px solid ${mode==="trader" ? "rgba(79,255,176,0.07)" : "rgba(116,185,255,0.07)"}`,
            fontSize: 10, fontFamily: "'DM Mono',monospace",
            color: mode==="trader" ? "#4fffb0" : "#74b9ff",
          }}>
            {mode==="trader"
              ? "⚡ Click any stock for full detail page — live chart, signals & news"
              : "📈 Click any stock for full detail page — fundamentals, valuation & news"}
          </div>

          {/* Column headers */}
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 64px 80px 70px",
            gap: 8, padding: "7px 14px",
            background: "rgba(255,255,255,0.02)", borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            {["Company","1M Chart","Price / Chg",""].map(h => (
              <div key={h} style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</div>
            ))}
          </div>

          {paged.map((s, i) => (
            <div key={s.sym} style={{ animation: `fadeIn 0.2s ease forwards`, animationDelay: `${(i % PAGE_SIZE) * 0.008}s` }}>
              <StockRow s={s} mode={mode} onSelect={handleSelect} />
            </div>
          ))}

          {filtered.length > paged.length && (
            <div style={{ padding: 14, textAlign: "center" }}>
              <button onClick={() => setPage(p => p + 1)} style={{
                background: "rgba(79,255,176,0.08)", border: "1px solid rgba(79,255,176,0.2)",
                color: "#4fffb0", padding: "8px 24px", borderRadius: 7, cursor: "pointer",
                fontSize: 11, fontFamily: "'DM Mono',monospace",
              }}>
                Load more ({filtered.length - paged.length} remaining)
              </button>
            </div>
          )}

          {filtered.length === 0 && (
            <div style={{ padding: "40px 20px", textAlign: "center", color: "#3a4568", fontSize: 12, fontFamily: "'DM Mono',monospace" }}>
              No stocks match "{search}"
            </div>
          )}
        </section>

        {/* RIGHT SIDEBAR */}
        <aside style={{ padding: 14, display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 120, height: "calc(100vh - 120px)", overflowY: "auto" }}>
          {/* Stats grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              { v: NSE_STOCKS.length, l: "Total Stocks", c: "#4fffb0" },
              { v: SECTORS.length - 1, l: "Sectors",     c: "#74b9ff" },
              { v: filtered.length,    l: "Filtered",    c: "#ffd166" },
              { v: "Live",             l: "Price Feed",  c: "#a29bfe" },
            ].map(x => (
              <div key={x.l} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "10px 11px" }}>
                <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 16, color: x.c }}>{x.v}</div>
                <div style={{ fontSize: 9, color: "#7a8299", fontFamily: "'DM Mono',monospace", marginTop: 2, textTransform: "uppercase", letterSpacing: "0.07em" }}>{x.l}</div>
              </div>
            ))}
          </div>

          {/* Quick sector pills */}
          <div>
            <div style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 7 }}>Quick Sectors</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {["All","IT","BFSI","Pharma","Auto","Energy","Power","Metal","FMCG","Defence","Realty"].map(s => (
                <button key={s} onClick={() => { setSector(s); setPage(0); }} aria-pressed={sector===s} style={{
                  fontSize: 9, fontFamily: "'DM Mono',monospace",
                  padding: "3px 8px", borderRadius: 4, cursor: "pointer", border: "1px solid",
                  background:  sector===s ? "rgba(79,255,176,0.12)" : "transparent",
                  color:       sector===s ? "#4fffb0" : "#7a8299",
                  borderColor: sector===s ? "rgba(79,255,176,0.3)" : "rgba(255,255,255,0.08)",
                  transition: "all 0.15s",
                }}>{s}</button>
              ))}
            </div>
          </div>

          <Chat mode={mode} />
        </aside>
      </main>

      <footer style={{ padding: "10px 20px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 9, color: "#2a3050", fontFamily: "'DM Mono',monospace", textAlign: "center" }}>
        ⚠ Educational purposes only. Not investment advice. Consult a SEBI-registered advisor before investing.
      </footer>
    </div>
  );
}
