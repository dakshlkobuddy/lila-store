// Styling for the cart screen.
export const s = {
  page: { maxWidth: 720, margin: "0 auto" },
  heading: { fontSize: 30, marginBottom: 22 },
  row: { display: "flex", alignItems: "center", gap: 14, padding: 12, marginBottom: 12 },
  thumb: { width: 70, height: 70, borderRadius: 12, flexShrink: 0 },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 15, fontWeight: 600 },
  variant: { fontSize: 12, color: "var(--ink-soft)", margin: "2px 0" },
  unitPrice: { color: "var(--ink-soft)", fontSize: 14 },
  qtyWrap: { display: "flex", alignItems: "center", gap: 6 },
  qtyBtn: { padding: 7 },
  qty: { width: 26, textAlign: "center", fontWeight: 600 },
  removeBtn: { padding: 8, color: "var(--danger)", borderColor: "transparent" },
  summary: { padding: 20, marginTop: 8 },
  totalRow: { display: "flex", justifyContent: "space-between", fontSize: 18, fontWeight: 700, marginBottom: 16 },
  checkoutBtn: { width: "100%", justifyContent: "center", marginBottom: 10 },
  waBtn: { width: "100%", justifyContent: "center", background: "#25D366", color: "#fff" },
};
