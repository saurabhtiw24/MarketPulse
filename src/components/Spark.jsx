export default function Spark({ closes, color }) {
  const v = (closes || []).filter(Boolean);
  if (v.length < 2) return <div style={{ height: 24 }} />;

  const mn  = Math.min(...v);
  const mx  = Math.max(...v);
  const rng = mx - mn || 1;
  const W   = 64, H = 24;
  const pts = v
    .map((x, i) => `${(i / (v.length - 1)) * W},${H - ((x - mn) / rng) * (H - 3) - 1.5}`)
    .join(" ");

  return (
    <svg width={W} height={H} style={{ display: "block" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
