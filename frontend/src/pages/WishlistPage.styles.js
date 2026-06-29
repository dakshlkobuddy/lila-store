export const s = {
  page: { maxWidth: 1200, margin: "0 auto", padding: "0 16px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 700, margin: 0 },
  subtitle: { fontSize: 15, color: "var(--ink-soft)", marginTop: 4 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 24,
  },
  empty: {
    textAlign: "center",
    padding: "60px 20px",
    color: "var(--ink-soft)",
  },
  emptyIcon: {
    opacity: 0.2,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    marginBottom: 20,
  }
};
