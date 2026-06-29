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
    cat, setCat, visibleProducts, go, addToCart,
  } = store;

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
          <input className="ec-input" style={s.searchInput} placeholder="Search products…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <select className="ec-input ec-sort-select" style={s.sortSelect} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="featured">Sort: Featured</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
        </select>
        <button className="ec-btn ec-btn-ghost" onClick={() => setShowFilters((x) => !x)}><Filter size={16} /> Filters</button>
      </div>

      {showFilters && (
        <div className="ec-card" style={s.filterCard}>
          <label style={s.filterCheck}>
            <input type="checkbox" checked={inStockOnly} onChange={(e) => setInStockOnly(e.target.checked)} /> In stock only
          </label>
          <div style={s.sliderWrap}>
            <div style={s.sliderLabel}>Max price: {money(priceCap)}</div>
            <input type="range" min={0} max={priceCeiling} step={50} value={priceCap} onChange={(e) => setMaxPrice(Number(e.target.value))} style={s.slider} />
          </div>
          {(inStockOnly || maxPrice != null || sort !== "featured") && <button className="ec-btn ec-btn-ghost" onClick={() => { setInStockOnly(false); setMaxPrice(null); setSort("featured"); }}>Clear</button>}
        </div>
      )}

      <div className="ec-scroll" style={s.chipsRow}>
        {["All", ...CATEGORIES].map((c) => <span key={c} className={"ec-chip" + (cat === c ? " ec-chip-on" : "")} onClick={() => setCat(c)}>{c}</span>)}
      </div>

      <div id="ec-grid" className="ec-product-grid" style={grid(220)}>
        {visibleProducts.map((p) => (
          <ProductCard key={p.id} product={p} store={store} />
        ))}
        {visibleProducts.length === 0 && <p style={s.empty}>No products match your search.</p>}
      </div>
    </>
  );
}
