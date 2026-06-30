import { useState } from "react";
import { Search, Filter, ChevronRight, Plus } from "lucide-react";
import { BRAND, TAGLINE, CATEGORIES } from "../constants.js";
import { money } from "../lib/format.js";
import { grid } from "../lib/ui.js";
import ProductCard from "../components/ProductCard.jsx";
import { s, badgeColor } from "./HomePage.styles.js";

export default function HomePage({ store }) {
  const {
    query, setQuery, sort, setSort, showFilters, setShowFilters,
    inStockOnly, setInStockOnly, maxPrice, setMaxPrice, priceCeiling, priceCap,
    cat, setCat, visibleProducts, go, addToCart, products,
    sizeFilter, setSizeFilter, colorFilter, setColorFilter
  } = store;

  // Compute unique sizes and colors from all active products for the dropdowns
  const availableSizes = [...new Set(products.flatMap(p => (p.is_active ? p.sizes || [] : [])))].filter(Boolean).sort();
  const availableColors = [...new Set(products.flatMap(p => (p.is_active ? p.colours || [] : [])))].filter(Boolean).sort();

  // UI Pagination: show 12 products initially
  const [limit, setLimit] = useState(12);
  const displayedProducts = visibleProducts.slice(0, limit);

  return (
    <>
      <section className="ec-card ec-hero" style={s.hero}>
        <span style={s.eyebrow}>Welcome to {BRAND}</span>
        <h1 className="ec-disp ec-hero-title" style={s.title}>{TAGLINE}</h1>
        <p className="ec-hero-lead" style={s.lead}>Browse our latest stock, add what you love to the cart, and check out in seconds — no trip to the store needed.</p>
        <button className="ec-btn ec-btn-primary" onClick={() => document.getElementById("ec-grid")?.scrollIntoView({ behavior: "smooth" })}>Start shopping <ChevronRight size={16} /></button>
      </section>

      <div className="ec-toolbar" style={s.toolbar}>
        <div style={s.searchWrap}>
          <Search size={17} style={s.searchIcon} />
          <input className="ec-input" style={s.searchInput} placeholder="Search products…" value={query} onChange={(e) => { setQuery(e.target.value); setLimit(12); }} />
        </div>
        <select className="ec-input ec-sort-select" style={s.sortSelect} value={sort} onChange={(e) => { setSort(e.target.value); setLimit(12); }}>
          <option value="featured">Sort: Featured</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
        </select>
        <button className="ec-btn ec-btn-ghost" onClick={() => setShowFilters((x) => !x)}><Filter size={16} /> Filters</button>
      </div>

      {showFilters && (
        <div className="ec-card" style={s.filterCard}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center" }}>
            <label style={s.filterCheck}>
              <input type="checkbox" checked={inStockOnly} onChange={(e) => { setInStockOnly(e.target.checked); setLimit(12); }} /> In stock only
            </label>

            {availableSizes.length > 0 && (
              <select className="ec-input" style={{ width: 140, padding: "8px 12px" }} value={sizeFilter} onChange={(e) => { setSizeFilter(e.target.value); setLimit(12); }}>
                <option value="">Any Size</option>
                {availableSizes.map(sz => <option key={sz} value={sz}>{sz}</option>)}
              </select>
            )}

            {availableColors.length > 0 && (
              <select className="ec-input" style={{ width: 140, padding: "8px 12px" }} value={colorFilter} onChange={(e) => { setColorFilter(e.target.value); setLimit(12); }}>
                <option value="">Any Color</option>
                {availableColors.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            )}
          </div>
          <div style={s.sliderWrap}>
            <div style={s.sliderLabel}>Max price: {money(priceCap)}</div>
            <input type="range" min={0} max={priceCeiling} step={50} value={priceCap} onChange={(e) => { setMaxPrice(Number(e.target.value)); setLimit(12); }} style={s.slider} />
          </div>
          {(inStockOnly || maxPrice != null || sort !== "featured" || sizeFilter !== "" || colorFilter !== "") && (
            <button className="ec-btn ec-btn-ghost" onClick={() => { setInStockOnly(false); setMaxPrice(null); setSort("featured"); setSizeFilter(""); setColorFilter(""); setLimit(12); }}>Clear Filters</button>
          )}
        </div>
      )}

      <div className="ec-scroll" style={s.chipsRow}>
        {["All", ...CATEGORIES].map((c) => <span key={c} className={"ec-chip" + (cat === c ? " ec-chip-on" : "")} onClick={() => { setCat(c); setLimit(12); }}>{c}</span>)}
      </div>

      <div id="ec-grid" className="ec-product-grid" style={grid(220)}>
        {displayedProducts.map((p) => (
          <ProductCard key={p.id} product={p} store={store} />
        ))}
        {displayedProducts.length === 0 && <p style={s.empty}>No products match your search.</p>}
      </div>

      {limit < visibleProducts.length && (
        <div style={{ textAlign: "center", marginTop: 40, marginBottom: 20 }}>
          <button 
            className="ec-btn ec-btn-ghost" 
            style={{ padding: "12px 24px", fontSize: 15, background: "var(--surface)", border: "1px solid var(--line)", borderRadius: 999 }}
            onClick={() => setLimit((l) => l + 12)}
          >
            Load More Products <Plus size={16} style={{ marginLeft: 6 }} />
          </button>
        </div>
      )}
    </>
  );
}
