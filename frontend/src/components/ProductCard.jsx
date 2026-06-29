import { Plus, Heart } from "lucide-react";
import { money } from "../lib/format.js";
import ProductImage from "./ProductImage.jsx";
import StockBadge from "./StockBadge.jsx";

const badgeColor = (text) => {
  if (!text) return {};
  const t = text.toLowerCase();
  if (t === "sale") return { background: "var(--err)", color: "#fff" };
  if (t === "new") return { background: "var(--accent)", color: "#fff" };
  return { background: "var(--line)", color: "var(--ink)" };
};

export default function ProductCard({ product, store }) {
  const { go, addToCart, wishlist, toggleWishlist } = store;
  const isWishlisted = wishlist?.includes(product.id);

  return (
    <div className="ec-tile" style={{ position: "relative" }}>
      <button 
        onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
        style={{
          position: "absolute", top: 10, right: 10, zIndex: 10,
          background: "rgba(255,255,255,0.8)", border: "none", borderRadius: "50%",
          width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", color: isWishlisted ? "var(--sage)" : "var(--ink-soft)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)", backdropFilter: "blur(4px)"
        }}
      >
        <Heart size={18} fill={isWishlisted ? "var(--sage)" : "none"} strokeWidth={isWishlisted ? 0 : 2} />
      </button>

      <div className="ec-link" onClick={() => go("product", product.id)} style={{ position: "relative" }}>
        <ProductImage product={product} className="" style={{ width: "100%", height: 220, objectFit: "cover", borderRadius: "6px 6px 0 0", background: "var(--line)", borderBottom: "1px solid var(--line)" }} />
        {product.badge && (
          <span style={{
            position: "absolute", top: 10, left: 10,
            fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
            padding: "3px 9px", borderRadius: 999,
            ...badgeColor(product.badge),
          }}>
            {product.badge}
          </span>
        )}
      </div>
      <div style={{ padding: "16px 16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--ink-soft)" }}>{product.category}</span>
        <h3 style={{ fontSize: 15, fontWeight: 500, margin: 0, lineHeight: 1.3 }}>{product.name}</h3>
        {product.rating_avg > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
            <span style={{ color: "#F59E0B", fontSize: 14 }}>★</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{product.rating_avg}</span>
            <span style={{ fontSize: 12, color: "var(--ink-soft)" }}>({product.review_count})</span>
          </div>
        )}
        <StockBadge stock={product.stock} />
      </div>
      <div style={{ padding: "0 16px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
        <span className="ec-disp" style={{ fontSize: 18 }}>{money(product.price)}</span>
        <button className="ec-btn ec-btn-primary" style={{ padding: 0, width: 34, height: 34, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%" }} disabled={product.stock <= 0} onClick={() => ((product.sizes && product.sizes.length) || (product.colours && product.colours.length)) ? go("product", product.id) : addToCart(product)}><Plus size={15} /></button>
      </div>
    </div>
  );
}
