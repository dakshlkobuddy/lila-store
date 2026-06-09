import { useState } from "react";
import { ArrowLeft, ShoppingCart, Minus, Plus, ZoomIn, X } from "lucide-react";
import { money } from "../lib/format.js";
import ProductImage from "../components/ProductImage.jsx";
import StockBadge from "../components/StockBadge.jsx";
import Pill from "../components/Pill.jsx";
import Empty from "../components/Empty.jsx";
import { s } from "./ProductDetailPage.styles.js";

export default function ProductDetailPage({ store }) {
  const { products, route, addToCart, go } = store;
  const product = products.find((x) => x.id === route.id);
  if (!product) return <Empty msg="Product not found." />;
  return <ProductDetail product={product} onAdd={addToCart} onBack={() => go("home")} />;
}

function ProductDetail({ product, onAdd, onBack }) {
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
            src={p.image || ""}
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
          <h1 className="ec-disp" style={s.title}>{p.name}</h1>
          <div className="ec-disp" style={s.price}>{money(p.price)}</div>
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
