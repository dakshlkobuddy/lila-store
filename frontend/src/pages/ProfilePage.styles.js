export const s = {
  page: { maxWidth: 640, margin: "0 auto" },
  heading: { fontSize: 30, marginBottom: 6, fontWeight: 600 },
  subtitle: { fontSize: 14, color: "var(--ink-soft)", marginBottom: 28 },
  section: { padding: 24, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 600, marginBottom: 4 },
  sectionDesc: { fontSize: 13, color: "var(--ink-soft)", marginBottom: 20 },
  label: { display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 },
  fieldGap: { marginBottom: 16 },
  row: { display: "flex", gap: 12 },
  divider: { borderTop: "1px solid var(--line)", margin: "20px 0" },
  addrCard: {
    border: "1px solid var(--line)", borderRadius: 14, padding: "16px 18px",
    marginBottom: 12, background: "var(--bg)", position: "relative",
    transition: "border-color 0.15s",
  },
  addrCardDefault: {
    borderColor: "var(--accent)",
  },
  addrLabel: { fontSize: 13, fontWeight: 700, letterSpacing: ".03em", textTransform: "uppercase", marginBottom: 4 },
  addrText: { fontSize: 14, color: "var(--ink-soft)", lineHeight: 1.6 },
  addrActions: { display: "flex", gap: 10, marginTop: 12 },
  defaultBadge: {
    display: "inline-block", fontSize: 11, fontWeight: 700, padding: "3px 10px",
    borderRadius: 999, background: "rgba(192,87,59,.12)", color: "var(--accent)",
    marginLeft: 8, verticalAlign: "middle",
  },
  emptyAddr: { textAlign: "center", padding: "30px 20px", color: "var(--ink-soft)", fontSize: 14 },
};
