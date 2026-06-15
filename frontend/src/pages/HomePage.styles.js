// Styling for HomePage — kept separate from the markup/logic.
export const s = {
  hero: { padding: "40px 34px", marginBottom: 30, background: "linear-gradient(120deg, var(--bg2), #FBF2E2)", borderColor: "#EAD9BD" },
  eyebrow: { fontSize: 13, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: "var(--accent)" },
  title: { fontSize: "clamp(28px,5vw,44px)", lineHeight: 1.1, margin: "12px 0 10px", maxWidth: 560 },
  lead: { color: "var(--ink-soft)", maxWidth: 480, marginBottom: 22 },

  toolbar: { display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" },
  searchWrap: { position: "relative", flex: "1 1 240px" },
  searchIcon: { position: "absolute", left: 14, top: 13, color: "#B6A893" },
  searchInput: { paddingLeft: 40 },
  sortSelect: { width: "auto" },

  filterCard: { padding: 16, marginBottom: 14, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" },
  filterCheck: { display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, cursor: "pointer" },
  sliderWrap: { flex: "1 1 220px", minWidth: 200 },
  sliderLabel: { fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 },
  slider: { width: "100%", accentColor: "var(--accent)" },

  chipsRow: { display: "flex", gap: 9, overflowX: "auto", paddingBottom: 6, marginBottom: 24 },

  tileImg: { width: "100%", aspectRatio: "1 / 1" },
  tileBody: { padding: "14px 15px 0" },
  tileCat: { fontSize: 12, color: "var(--accent)", fontWeight: 600 },
  tileName: { fontSize: 16, fontWeight: 600, margin: "4px 0 6px", lineHeight: 1.25 },
  tileFoot: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 15px 15px" },
  price: { fontSize: 19, fontWeight: 600 },
  addBtn: { padding: "8px 12px" },
  empty: { color: "var(--ink-soft)", gridColumn: "1/-1", padding: 30, textAlign: "center" },

  // dynamic: staggered entry animation per tile
  tile: (i) => ({ animationDelay: `${i * 35}ms` }),
};

// Badge colours per label
export const badgeColor = (badge) => {
  if (badge === "New")         return { background: "#4F8B86", color: "#fff" };
  if (badge === "Best Seller") return { background: "var(--accent)", color: "#fff" };
  if (badge === "Sale")        return { background: "#5E8B4F", color: "#fff" };
  return { background: "var(--bg2)", color: "var(--ink)" };
};

