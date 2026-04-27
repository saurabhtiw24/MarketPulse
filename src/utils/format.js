export const fmt = (n) =>
  n == null ? "—" : n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

export const pct = (n) =>
  n == null ? "—" : `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export const clr = (n) =>
  n == null ? "#7a8299" : n >= 0 ? "#4fffb0" : "#ff6b6b";
