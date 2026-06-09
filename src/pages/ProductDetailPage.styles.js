// Styling for the product detail screen.
export const s = {
  backBtn: { marginBottom: 18 },
  grid: { display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 30 },
  image: { width: "100%", aspectRatio: "1 / 1", borderRadius: 18 },
  category: { fontSize: 13, color: "var(--accent)", fontWeight: 600 },
  title: { fontSize: 32, margin: "8px 0 12px" },
  price: { fontSize: 30, fontWeight: 600, marginBottom: 10 },
  stockWrap: { marginBottom: 18 },
  desc: { color: "var(--ink-soft)", lineHeight: 1.6, marginBottom: 22 },
  optGroup: { marginBottom: 18 },
  optGroupLast: { marginBottom: 24 },
  optLabel: { fontSize: 13, fontWeight: 700, color: "var(--ink-soft)", marginBottom: 8 },
  optRow: { display: "flex", gap: 8, flexWrap: "wrap" },
  addBtn: { padding: "13px 26px" },
};
