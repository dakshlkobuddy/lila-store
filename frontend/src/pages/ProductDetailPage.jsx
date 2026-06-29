import { useState, useEffect } from "react";
import { ArrowLeft, ShoppingCart, Minus, Plus, ZoomIn, X, Heart, Star, Loader } from "lucide-react";
import { money } from "../lib/format.js";
import { errBorder } from "../lib/validation.js";
import ProductImage from "../components/ProductImage.jsx";
import StockBadge from "../components/StockBadge.jsx";
import Pill from "../components/Pill.jsx";
import Empty from "../components/Empty.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { s } from "./ProductDetailPage.styles.js";

// Helper for star rating rendering
function Stars({ rating, size = 16, interactive = false, onHover, onClick, hoverRating }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {stars.map((s) => {
        const active = interactive ? (hoverRating || rating) >= s : Math.round(rating) >= s;
        return (
          <Star
            key={s}
            size={size}
            fill={active ? "#F59E0B" : "none"}
            stroke={active ? "#F59E0B" : "var(--ink-soft)"}
            style={{ cursor: interactive ? "pointer" : "default" }}
            onMouseEnter={() => interactive && onHover(s)}
            onMouseLeave={() => interactive && onHover(0)}
            onClick={() => interactive && onClick(s)}
          />
        );
      })}
    </div>
  );
}

export default function ProductDetailPage({ store }) {
  const { products, route, addToCart, go, currentUser, toggleWishlist, wishlist, checkHasPurchased, loadReviews, submitReview } = store;
  const product = products.find((x) => x.id === route.id);
  
  const [reviews, setReviews] = useState([]);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    if (!product) return;
    let cancelled = false;
    
    setLoadingReviews(true);
    // Fetch reviews
    loadReviews(product.id).then(({ data }) => {
      if (!cancelled && data) setReviews(data);
      if (!cancelled) setLoadingReviews(false);
    });

    // Check purchase status
    if (currentUser) {
      checkHasPurchased(product.id).then((purchased) => {
        if (!cancelled) setHasPurchased(purchased);
      });
    } else {
      setHasPurchased(false);
    }

    return () => { cancelled = true; };
  }, [product?.id, currentUser]);

  if (!product) return <Empty msg="Product not found." />;

  // Find related products
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id && p.is_active)
    .slice(0, 4);

  const isWishlisted = wishlist?.includes(product.id);
  
  const handleReviewSubmit = async () => {
    if (rating === 0) {
      setReviewError("Please select a rating");
      return;
    }
    setSubmitting(true);
    setReviewError("");
    const { error } = await submitReview(product.id, rating, comment);
    if (!error) {
      setShowReviewForm(false);
      setRating(0);
      setComment("");
      // Reload reviews
      const { data } = await loadReviews(product.id);
      if (data) setReviews(data);
    }
    setSubmitting(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 60 }}>
      <ProductDetail 
        product={product} 
        onAdd={addToCart} 
        onBack={() => go("home")}
        isWishlisted={isWishlisted}
        onToggleWishlist={() => toggleWishlist(product.id)}
      />

      {/* Reviews Section */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 40 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 8px 0" }}>Customer Reviews</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Stars rating={product.rating_avg || 0} size={20} />
              <span style={{ fontSize: 16, fontWeight: 600 }}>{product.rating_avg > 0 ? product.rating_avg : "0.0"} out of 5</span>
              <span style={{ fontSize: 14, color: "var(--ink-soft)" }}>({product.review_count} {product.review_count === 1 ? "review" : "reviews"})</span>
            </div>
          </div>
          
          {hasPurchased && !showReviewForm && (
            <button className="ec-btn ec-btn-primary" onClick={() => setShowReviewForm(true)}>
              Write a Review
            </button>
          )}
        </div>

        {showReviewForm && (
          <div style={{ background: "var(--bg)", padding: 24, borderRadius: 12, border: "1px solid var(--line)", marginBottom: 30 }}>
            <h3 style={{ margin: "0 0 16px 0", fontSize: 18 }}>Write a Review</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Rating <span style={{ color: "var(--accent)" }}>*</span></label>
              <Stars 
                rating={rating} 
                hoverRating={hoverRating}
                size={24} 
                interactive 
                onHover={setHoverRating}
                onClick={setRating}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Review Comment (Optional)</label>
              <textarea 
                className="ec-input" 
                rows={3}
                placeholder="What did you like or dislike about this product?"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ resize: "vertical", minHeight: 80 }}
              />
            </div>
            {reviewError && <p style={{ color: "var(--err)", fontSize: 14, marginBottom: 16, marginTop: 0 }}>{reviewError}</p>}
            <div style={{ display: "flex", gap: 12 }}>
              <button className="ec-btn ec-btn-primary" onClick={handleReviewSubmit} disabled={submitting}>
                {submitting ? <Loader size={16} className="ec-spin" /> : "Submit Review"}
              </button>
              <button className="ec-btn ec-btn-ghost" onClick={() => setShowReviewForm(false)} disabled={submitting}>Cancel</button>
            </div>
          </div>
        )}

        {loadingReviews ? (
          <div style={{ padding: 40, textAlign: "center" }}><Loader size={24} className="ec-spin" style={{ opacity: 0.5 }} /></div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: "40px 20px", textAlign: "center", color: "var(--ink-soft)", background: "rgba(0,0,0,0.02)", borderRadius: 12 }}>
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {reviews.map((r) => (
              <div key={r.id} style={{ paddingBottom: 24, borderBottom: "1px solid var(--line)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--accent)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14 }}>
                    {(r.profiles?.name || "U")[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{r.profiles?.name || "User"}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{new Date(r.created_at).toLocaleDateString()}</div>
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}><Stars rating={r.rating} size={14} /></div>
                {r.comment && <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div style={{ borderTop: "1px solid var(--line)", paddingTop: 40 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 24px 0" }}>You may also like</h2>
          <div className="ec-product-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 24 }}>
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} store={store} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProductDetail({ product, onAdd, onBack, isWishlisted, onToggleWishlist }) {
  const p = product;
  const sizes = p.sizes || [];
  const colours = p.colours || [];
  const [size, setSize] = useState("");
  const [colour, setColour] = useState("");
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);

  const ready = p.stock > 0 && (sizes.length === 0 || size) && (colours.length === 0 || colour);
  const maxQty = p.stock;

  const add = () => {
    if (p.stock <= 0) return;
    if ((sizes.length && !size) || (colours.length && !colour)) return;
    onAdd(p, { size, colour, qty });
  };

  const btnLabel = p.stock <= 0
    ? "Out of stock"
    : (sizes.length && !size) || (colours.length && !colour)
      ? "Select options"
      : "Add to cart";

  return (
    <div>
      {/* Image zoom overlay */}
      {zoomed && (
        <div
          onClick={() => setZoomed(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out",
          }}
        >
          <button
            onClick={() => setZoomed(false)}
            style={{ position: "absolute", top: 18, right: 18, background: "rgba(255,255,255,.15)", border: "none", borderRadius: 999, padding: 10, cursor: "pointer", color: "#fff", display: "flex" }}
          >
            <X size={22} />
          </button>
          <img
            src={p.image_url || ""}
            alt={p.name}
            style={{ maxWidth: "92vw", maxHeight: "92vh", borderRadius: 16, objectFit: "contain" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <button className="ec-btn ec-btn-ghost" style={s.backBtn} onClick={onBack}><ArrowLeft size={16} /> Back</button>
      <div style={s.grid} className="ec-detail">
        {/* Image with zoom button */}
        <div style={{ position: "relative" }}>
          <ProductImage product={p} className="ec-card" style={{ ...s.image, cursor: "zoom-in" }} onClick={() => setZoomed(true)} />
          <button
            onClick={() => setZoomed(true)}
            title="Zoom image"
            style={{
              position: "absolute", bottom: 12, right: 12,
              background: "rgba(255,255,255,0.88)", border: "1px solid var(--line)",
              borderRadius: 8, padding: "6px 10px", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 5,
              fontSize: 12, fontWeight: 600, color: "var(--ink-soft)",
            }}
          >
            <ZoomIn size={14} /> Zoom
          </button>
        </div>

        <div>
          <span style={s.category}>{p.category}</span>
          
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <h1 className="ec-disp ec-detail-title" style={{ ...s.title, margin: 0, padding: 0 }}>{p.name}</h1>
            <button 
              onClick={onToggleWishlist}
              style={{
                background: "transparent", border: "1px solid var(--line)", borderRadius: "50%",
                width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: isWishlisted ? "var(--sage)" : "var(--ink-soft)",
                flexShrink: 0, marginTop: 4, transition: "all 0.2s"
              }}
            >
              <Heart size={20} fill={isWishlisted ? "var(--sage)" : "none"} strokeWidth={isWishlisted ? 0 : 2} />
            </button>
          </div>

          <div className="ec-disp ec-detail-price" style={{ ...s.price, marginTop: 8 }}>{money(p.price)}</div>
          <div style={s.stockWrap}><StockBadge stock={p.stock} /></div>
          
          <p style={s.desc}>{p.description}</p>

          {sizes.length > 0 && (
            <div style={s.optGroup}>
              <div style={s.optLabel}>Size{size ? `: ${size}` : ""}</div>
              <div style={s.optRow}>
                {sizes.map((x) => <Pill key={x} label={x} active={size === x} onClick={() => setSize(size === x ? "" : x)} />)}
              </div>
            </div>
          )}
          {colours.length > 0 && (
            <div style={s.optGroupLast}>
              <div style={s.optLabel}>Colour{colour ? `: ${colour}` : ""}</div>
              <div style={s.optRow}>
                {colours.map((x) => <Pill key={x} label={x} active={colour === x} onClick={() => setColour(colour === x ? "" : x)} />)}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          {p.stock > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)" }}>Qty</span>
              <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid var(--line)", borderRadius: 8, overflow: "hidden" }}>
                <button
                  className="ec-btn ec-btn-ghost"
                  style={{ borderRadius: 0, padding: "8px 14px", borderRight: "1px solid var(--line)" }}
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >
                  <Minus size={14} />
                </button>
                <span style={{ padding: "8px 18px", fontWeight: 700, fontSize: 15, minWidth: 48, textAlign: "center" }}>{qty}</span>
                <button
                  className="ec-btn ec-btn-ghost"
                  style={{ borderRadius: 0, padding: "8px 14px", borderLeft: "1px solid var(--line)", opacity: qty >= maxQty ? 0.4 : 1 }}
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                >
                  <Plus size={14} />
                </button>
              </div>
              {qty >= maxQty && <span style={{ fontSize: 12, color: "var(--gold)", fontWeight: 600 }}>Max stock</span>}
            </div>
          )}

          <button className="ec-btn ec-btn-primary" style={s.addBtn} disabled={!ready} onClick={add}>
            <ShoppingCart size={17} /> {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
