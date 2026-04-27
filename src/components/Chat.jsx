import { useState, useRef, useEffect } from "react";
import { aiAnalysis } from "../api/market";

export default function Chat({ mode }) {
  const [msgs, setMsgs] = useState([]);
  const [inp,  setInp]  = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs]);

  const send = async () => {
    const q = inp.trim();
    if (!q || busy) return;
    setInp("");
    setMsgs((m) => [...m, { r: "u", t: q }]);
    setBusy(true);
    const res = await aiAnalysis(`Indian stock market question: ${q}`, mode);
    setMsgs((m) => [...m, { r: "a", t: res }]);
    setBusy(false);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12, overflow: "hidden", display: "flex", flexDirection: "column", height: 300,
    }}>
      {/* Header */}
      <div style={{
        padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)",
        fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: 12, color: "#fff",
        display: "flex", alignItems: "center", gap: 8,
      }}>
        <span style={{ color: "#4fffb0" }}>✦</span> AI Market Chat
        <span style={{
          marginLeft: "auto", fontSize: 8, fontFamily: "'DM Mono',monospace",
          color:      mode === "trader" ? "#4fffb0" : "#74b9ff",
          background: mode === "trader" ? "rgba(79,255,176,0.07)" : "rgba(116,185,255,0.07)",
          padding: "2px 7px", borderRadius: 3,
          border: `1px solid ${mode === "trader" ? "rgba(79,255,176,0.18)" : "rgba(116,185,255,0.18)"}`,
        }}>
          {mode.toUpperCase()}
        </span>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.length === 0 && (
          <div style={{ color: "#3a4568", fontSize: 11, fontFamily: "'DM Mono',monospace", textAlign: "center", marginTop: 20 }}>
            {mode === "trader"
              ? "Ask about breakouts, momentum, sectors…"
              : "Ask about fundamentals, valuations, dividends…"}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} style={{
            alignSelf: m.r === "u" ? "flex-end" : "flex-start",
            maxWidth: "86%",
            background: m.r === "u" ? "rgba(79,255,176,0.08)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${m.r === "u" ? "rgba(79,255,176,0.16)" : "rgba(255,255,255,0.06)"}`,
            borderRadius: m.r === "u" ? "12px 12px 2px 12px" : "2px 12px 12px 12px",
            padding: "7px 11px", fontSize: 12,
            color: m.r === "u" ? "#4fffb0" : "#c0cce0",
            lineHeight: 1.65, whiteSpace: "pre-wrap",
          }}>
            {m.t}
          </div>
        ))}
        {busy && (
          <div style={{ fontSize: 10, color: "#4fffb0", fontFamily: "'DM Mono',monospace", animation: "pulse 1.2s infinite" }}>
            thinking…
          </div>
        )}
        <div ref={ref} />
      </div>

      {/* Input */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 6 }}>
        <input
          value={inp}
          onChange={(e) => setInp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask anything about Indian stocks…"
          aria-label="Chat input"
          style={{
            flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: 7, padding: "7px 10px", color: "#e0e8f4", fontSize: 11,
            fontFamily: "'DM Mono',monospace", outline: "none",
          }}
        />
        <button
          onClick={send}
          disabled={busy}
          aria-label="Send message"
          style={{
            background:  busy ? "rgba(79,255,176,0.04)" : "rgba(79,255,176,0.12)",
            border: "1px solid rgba(79,255,176,0.25)", color: "#4fffb0",
            padding: "7px 12px", borderRadius: 7,
            cursor: busy ? "not-allowed" : "pointer",
            fontSize: 11, fontFamily: "'DM Mono',monospace",
          }}
        >→</button>
      </div>
    </div>
  );
}
