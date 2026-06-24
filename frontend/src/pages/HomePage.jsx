import { Search, Filter, ChevronRight, Plus } from "lucide-react";
import { BRAND, TAGLINE, CATEGORIES } from "../constants.js";
import { money } from "../lib/format.js";
import { grid } from "../lib/ui.js";
import ProductImage from "../components/ProductImage.jsx";
import StockBadge from "../components/StockBadge.jsx";
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
        {visibleProducts.map((p, i) => (
          <div key={p.id} className="ec-tile" style={s.tile(i)}>
            <div className="ec-link" onClick={() => go("product", p.id)} style={{ position: "relative" }}>
              <ProductImage product={p} className="" style={s.tileImg} />
              {p.badge && (
                <span style={{
                  position: "absolute", top: 10, left: 10,
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
                  padding: "3px 9px", borderRadius: 999,
                  ...badgeColor(p.badge),
                }}>
                  {p.badge}
                </span>
              )}
            </div>
            <div style={s.tileBody}>
              <span style={s.tileCat}>{p.category}</span>
              <h3 style={s.tileName}>{p.name}</h3>
              <StockBadge stock={p.stock} />
            </div>
            <div style={s.tileFoot}>
              <span className="ec-disp" style={s.price}>{money(p.price)}</span>
              <button className="ec-btn ec-btn-primary" style={s.addBtn} disabled={p.stock <= 0} onClick={() => ((p.sizes && p.sizes.length) || (p.colours && p.colours.length)) ? go("product", p.id) : addToCart(p)}><Plus size={15} /></button>
            </div>
          </div>
        ))}
        {visibleProducts.length === 0 && <p style={s.empty}>No products match your search.</p>}
      </div>
    </>
  );
}
