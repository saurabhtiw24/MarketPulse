import { useState, useEffect } from "react";
import { fetchQuote } from "../api/market";
import { fmt, pct, clr } from "../utils/format";
import Spark from "./Spark";

export default function StockRow({ s, mode, onSelect }) {
  const [q,  setQ]  = useState(null);
  const [ld, setLd] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchQuote(s.sym).then((r) => {
      if (!cancelled) { setQ(r); setLd(false); }
    });
    return () => { cancelled = true; };
  }, [s.sym]);

  const c = clr(q?.changePct);

  return (
    <div
      onClick={() => onSelect(s, q)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onSelect(s, q)}
      aria-label={`View ${s.name} analysis`}
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 64px 80px 70px",
        alignItems: "center",
        gap: 8,
        padding: "9px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        cursor: "pointer",
        transition: "background 0.15s",
        outline: "none",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      onFocus={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
      onBlur={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <div>
        <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: "#e8ecf4" }}>
          {s.name}
        </div>
        <div style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace", marginTop: 1 }}>
          {s.sym.replace(".NS", "")} · <span style={{ color: "#7a8299" }}>{s.sector}</span>
        </div>
      </div>

      <Spark closes={q?.closes || []} color={c} />

      {ld ? (
        <div style={{ fontSize: 10, color: "#5a6278", fontFamily: "'DM Mono',monospace", textAlign: "right" }}>…</div>
      ) : q ? (
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13, color: "#fff" }}>
            ₹{fmt(q.price)}
          </div>
          <div style={{ fontSize: 10, color: c, fontFamily: "'DM Mono',monospace" }}>
            {pct(q.changePct)}
          </div>
        </div>
      ) : (
        <div style={{ fontSize: 10, color: "#ff6b6b", fontFamily: "'DM Mono',monospace", textAlign: "right" }}>N/A</div>
      )}

      <div style={{ textAlign: "right", fontSize: 9, color: "#4fffb0", fontFamily: "'DM Mono',monospace" }}>
        {mode === "trader" ? "Signal ›" : "Analysis ›"}
      </div>
    </div>
  );
}
