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

// Map of common colour names to hex values for swatch rendering
const COLOUR_HEX = {
  black: "#1a1a1a", white: "#fff", red: "#e53e3e", blue: "#3182ce", navy: "#1a365d",
  green: "#38a169", pink: "#ed64a6", purple: "#805ad5", yellow: "#ecc94b", orange: "#ed8936",
  grey: "#a0aec0", gray: "#a0aec0", brown: "#8b6914", beige: "#f5f0e1", cream: "#fdf6e3",
  maroon: "#800000", teal: "#319795", coral: "#ff7f7f", peach: "#ffdab9", lavender: "#b794f4",
  mint: "#b2f5ea", nude: "#e8c4a0", skin: "#f5d5b5", wine: "#722f37", rust: "#b7410e",
  olive: "#6b8e23", gold: "#d4a017", silver: "#c0c0c0", "rose gold": "#b76e79",
  "hot pink": "#ff69b4", magenta: "#ff00ff", turquoise: "#40e0d0", cyan: "#00bcd4",
  "sky blue": "#87ceeb", "light blue": "#add8e6", "dark blue": "#00008b", "royal blue": "#4169e1",
  "light pink": "#ffb6c1", "dark green": "#006400", "light green": "#90ee90",
  multicolor: null, multi: null, printed: null, assorted: null,
};

function getColourHex(name) {
  if (!name) return null;
  const key = name.toLowerCase().trim();
  if (key in COLOUR_HEX) return COLOUR_HEX[key];
  // Try partial match
  for (const [k, v] of Object.entries(COLOUR_HEX)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return null; // Unknown colour — fallback to pill
}

function ProductDetail({ product, onAdd, onBack, isWishlisted, onToggleWishlist }) {
  const p = product;
  const sizes = p.sizes || [];
  const colours = p.colours || [];
  const [size, setSize] = useState("");
  const [colour, setColour] = useState("");
  const [qty, setQty] = useState(1);
  const [zoomed, setZoomed] = useState(false);

  // Hover-to-zoom state
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 }); // percentage

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

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <div>
      {/* Image zoom overlay (click fullscreen) */}
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
        {/* Image with hover-to-zoom magnifier */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 18,
              cursor: "crosshair",
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            onMouseMove={handleMouseMove}
            onClick={() => setZoomed(true)}
          >
            <ProductImage
              product={p}
              className="ec-card"
              style={{
                ...s.image,
                transition: "transform 0.15s ease",
                transform: isHovering ? "scale(1.5)" : "scale(1)",
                transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
              }}
            />
            {/* Zoom lens indicator */}
            {isHovering && (
              <div style={{
                position: "absolute", top: 12, left: 12,
                background: "rgba(0,0,0,0.6)", color: "#fff",
                borderRadius: 6, padding: "4px 10px",
                fontSize: 11, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
                pointerEvents: "none",
              }}>
                <ZoomIn size={12} /> Hover to zoom · Click to expand
              </div>
            )}
          </div>
          {/* Zoom button (shown when NOT hovering) */}
          {!isHovering && (
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
          )}
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
          <div style={s.stockWrap}><StockBadge stock={p.stock} showUrgency /></div>
          
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
              <div style={{ ...s.optRow, gap: 10 }}>
                {colours.map((x) => {
                  const hex = getColourHex(x);
                  const isActive = colour === x;
                  // If we have a hex, show a swatch circle; otherwise fall back to Pill
                  if (hex) {
                    const isLight = hex === "#fff" || hex === "#fdf6e3" || hex === "#f5f0e1" || hex === "#f5d5b5" || hex === "#ffdab9" || hex === "#e8c4a0" || hex === "#ecc94b" || hex === "#c0c0c0";
                    return (
                      <div
                        key={x}
                        onClick={() => setColour(colour === x ? "" : x)}
                        className="ec-link"
                        title={x}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 5, cursor: "pointer",
                        }}
                      >
                        <div style={{
                          width: 36, height: 36, borderRadius: "50%",
                          background: hex,
                          border: isActive ? "3px solid var(--accent)" : isLight ? "2px solid var(--line)" : "2px solid transparent",
                          boxShadow: isActive ? "0 0 0 2px var(--accent)" : "0 1px 4px rgba(0,0,0,0.15)",
                          transition: "all 0.2s ease",
                          transform: isActive ? "scale(1.1)" : "scale(1)",
                        }} />
                        <span style={{
                          fontSize: 11, fontWeight: isActive ? 700 : 500,
                          color: isActive ? "var(--accent)" : "var(--ink-soft)",
                          textTransform: "capitalize",
                        }}>
                          {x}
                        </span>
                      </div>
                    );
                  }
                  // Fallback: Multicolor / printed / unknown → use text Pill
                  return <Pill key={x} label={x} active={isActive} onClick={() => setColour(colour === x ? "" : x)} />;
                })}
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

