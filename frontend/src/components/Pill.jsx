// Selectable pill used for size/colour choices on the product page.
export default function Pill({ label, active, onClick }) {
  return (
    <span onClick={onClick} className="ec-link" style={{ fontSize: 14, fontWeight: 600, padding: "8px 16px", borderRadius: 999, border: "1px solid " + (active ? "var(--accent)" : "var(--line)"), background: active ? "var(--accent)" : "var(--surface)", color: active ? "#fff" : "var(--ink)", transition: ".15s" }}>{label}</span>
  );
}
