// Shared inline-style helpers for page layout.
export const wrap = () => ({ maxWidth: 1120, margin: "0 auto", padding: "0 20px" });
export const grid = (min) => ({ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 18 });
export const navItem = (active) => ({ fontSize: 14, fontWeight: 600, color: active ? "var(--accent)" : "var(--ink)", display: "flex", alignItems: "center", gap: 6, padding: "6px 0" });
