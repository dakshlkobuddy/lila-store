// Little number bubble on the cart icon.
export default function Badge({ n }) {
  return <span style={{ position: "absolute", top: -6, right: -6, background: "var(--accent)", color: "#fff", fontSize: 11, fontWeight: 700, minWidth: 19, height: 19, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{n}</span>;
}
