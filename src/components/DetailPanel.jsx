import { useState, useEffect } from "react";
import { aiAnalysis } from "../api/market";
import { fmt, pct, clr } from "../utils/format";
import Spark from "./Spark";

export default function DetailPanel({ s, q, mode, onClose }) {
  const [ai,  setAi]  = useState("");
  const [aiL, setAiL] = useState(false);

  const runAnalysis = () => {
    if (!s) return;
    setAi(""); setAiL(true);
    const price = q
      ? `Price ₹${fmt(q.price)}, ${pct(q.changePct)} today, H:₹${fmt(q.high)} L:₹${fmt(q.low)}, Vol:${q.vol ? (q.vol / 1e5).toFixed(1) + "L" : "N/A"}`
      : "Price data unavailable";
    aiAnalysis(`Analyze ${s.name} (${s.sym}). ${price}. Sector: ${s.sector}.`, mode)
      .then((r) => { setAi(r); setAiL(false); });
  };

  useEffect(() => {
    runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s?.sym, mode]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!s) return null;
  const c = clr(q?.changePct);

  return (
    <>
      {/* Backdrop for accessibility */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{ position: "fixed", inset: 0, zIndex: 999, background: "rgba(0,0,0,0.35)" }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${s.name} Analysis`}
        style={{
          position: "fixed", top: 0, right: 0, width: 360, height: "100vh",
          background: "#0d1119", borderLeft: "1px solid rgba(255,255,255,0.08)",
          overflowY: "auto", zIndex: 1000, padding: "0 0 40px",
          boxShadow: "-8px 0 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "16px 18px 12px", borderBottom: "1px solid rgba(255,255,255,0.07)",
          position: "sticky", top: 0, background: "#0d1119", zIndex: 1,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: 18, color: "#fff" }}>
                {s.name}
              </div>
              <div style={{ fontSize: 10, color: "#7a8299", fontFamily: "'DM Mono',monospace", marginTop: 2 }}>
                {s.sym} · {s.sector}
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Close panel"
              style={{
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
                color: "#7a8299", width: 28, height: 28, borderRadius: 6, cursor: "pointer",
                fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >✕</button>
          </div>

          {/* Price grid */}
          {q && (
            <div style={{ marginTop: 12, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                ["Price",    `₹${fmt(q.price)}`],
                ["Change",   pct(q.changePct)],
                ["High",     `₹${fmt(q.high)}`],
                ["Low",      `₹${fmt(q.low)}`],
                ["Vol",      q.vol ? `${(q.vol / 1e5).toFixed(1)}L` : "—"],
                ["1M Trend", q.changePct >= 0 ? "▲ Uptrend" : "▼ Downtrend"],
              ].map(([k, v]) => (
                <div key={k} style={{
                  background: "rgba(255,255,255,0.04)", borderRadius: 7, padding: "7px 9px",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <div style={{ fontSize: 9, color: "#7a8299", fontFamily: "'DM Mono',monospace", textTransform: "uppercase", letterSpacing: "0.07em" }}>
                    {k}
                  </div>
                  <div style={{
                    fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 13,
                    color: (k === "Change" || k === "1M Trend") ? c : "#fff", marginTop: 2,
                  }}>
                    {v}
                  </div>
                </div>
              ))}
            </div>
          )}

          {q && (
            <div style={{ marginTop: 12 }}>
              <Spark closes={q.closes} color={c} />
              <div style={{ fontSize: 9, color: "#5a6278", fontFamily: "'DM Mono',monospace", marginTop: 3 }}>
                1-month price chart
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis */}
        <div style={{ padding: "16px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>
              ✦ AI {mode === "trader" ? "Trader" : "Investor"} Analysis
            </span>
            <span style={{
              fontSize: 9, fontFamily: "'DM Mono',monospace",
              color:       mode === "trader" ? "#4fffb0" : "#74b9ff",
              background:  mode === "trader" ? "rgba(79,255,176,0.08)" : "rgba(116,185,255,0.08)",
              border:      `1px solid ${mode === "trader" ? "rgba(79,255,176,0.2)" : "rgba(116,185,255,0.2)"}`,
              padding: "2px 7px", borderRadius: 3,
            }}>
              {mode.toUpperCase()}
            </span>
          </div>

          {aiL ? (
            <div style={{ fontSize: 12, color: "#4fffb0", fontFamily: "'DM Mono',monospace", animation: "pulse 1.2s infinite" }}>
              Analyzing {s.name}…
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#c0cce0", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>
              {ai}
            </div>
          )}

          <button
            onClick={runAnalysis}
            disabled={aiL}
            style={{
              marginTop: 14, background: "transparent", border: "1px solid rgba(255,255,255,0.09)",
              color: "#7a8299", padding: "5px 12px", borderRadius: 6,
              cursor: aiL ? "not-allowed" : "pointer",
              fontSize: 10, fontFamily: "'DM Mono',monospace",
            }}
          >
            ↺ Re-analyze
          </button>
        </div>
      </div>
    </>
  );
}
