import { Heart, ArrowLeft } from "lucide-react";
import ProductCard from "../components/ProductCard.jsx";
import { s } from "./WishlistPage.styles.js";

export default function WishlistPage({ store }) {
  const { wishlist, products, go } = store;

  const savedProducts = products.filter((p) => wishlist.includes(p.id));

  return (
    <div style={s.page}>
      <button className="ec-btn ec-btn-ghost" style={{ marginBottom: 16, gap: 6, padding: "8px 14px" }} onClick={() => go("home")}>
        <ArrowLeft size={16} /> Continue Shopping
      </button>

      <div style={s.header}>
        <div>
          <h1 className="ec-disp" style={s.title}>My Wishlist</h1>
          <p style={s.subtitle}>
            {savedProducts.length} {savedProducts.length === 1 ? "item" : "items"} saved for later
          </p>
        </div>
      </div>

      {savedProducts.length === 0 ? (
        <div style={s.empty}>
          <Heart size={64} style={s.emptyIcon} />
          <p style={s.emptyText}>Your wishlist is empty.</p>
          <button className="ec-btn ec-btn-primary" onClick={() => go("home")}>
            Explore Products
          </button>
        </div>
      ) : (
        <div style={s.grid}>
          {savedProducts.map((p) => (
            <ProductCard key={p.id} product={p} store={store} />
          ))}
        </div>
      )}
    </div>
  );
}
