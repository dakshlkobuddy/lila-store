import { useState, useEffect, useRef } from "react";
import { ADMIN_SEED, SEED_VERSION, SHARED_KEYS } from "../constants.js";
import { appStorage } from "../lib/storage.js";
import { seedProducts } from "../data/seed.js";

// All app state, persistence, and actions live here in one place.
// Pages/components receive the returned object as `store` and use what they need.
export default function useStore() {
  const [products, setProducts] = useState(() => seedProducts());
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([ADMIN_SEED]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [route, setRoute] = useState({ name: "home" });
  const [toast, setToast] = useState(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminTab, setAdminTab] = useState("overview");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [sort, setSort] = useState("featured");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // ── persistence ──
  const save = async (k, v) => { try { await appStorage.set("ecom:" + k, JSON.stringify(v), !!SHARED_KEYS[k]); } catch (e) { console.error(e); } };

  // Session uses sessionStorage so it clears when the tab/browser is closed.
  // Every fresh visit will show the login page.
  const SESSION_KEY = "ecom:session";
  const saveSession = (v) => {
    try {
      if (v == null) sessionStorage.removeItem(SESSION_KEY);
      else sessionStorage.setItem(SESSION_KEY, JSON.stringify(v));
    } catch (e) { console.error(e); }
  };
  const loadSession = () => {
    try { const raw = sessionStorage.getItem(SESSION_KEY); return raw ? JSON.parse(raw) : null; }
    catch (_e) { return null; }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    // One-time migration: remove old localStorage session so fresh visit always shows login.
    try { localStorage.removeItem("ecom:session"); } catch (_e) { /* ignore */ }
    let cancelled = false;
    const withTimeout = (p) => Promise.race([
      Promise.resolve(p).catch(() => null),
      new Promise((res) => setTimeout(() => res(null), 1500)),
    ]);
    (async () => {
      // Load products, orders, users, cart from localStorage as before.
      const keys = ["products", "orders", "users", "cart", "seedver"];
      const pairs = await Promise.all(keys.map(async (k) => {
        try { const r = await withTimeout(appStorage.get("ecom:" + k, !!SHARED_KEYS[k])); return [k, r ? JSON.parse(r.value) : null]; }
        catch (_e) { return [k, null]; }
      }));
      if (cancelled) return;
      const loaded = Object.fromEntries(pairs);
      const fresh = !loaded.products || loaded.seedver !== SEED_VERSION;
      if (fresh) { save("products", seedProducts()); save("seedver", SEED_VERSION); }
      else setProducts(loaded.products);
      if (loaded.users) setUsers(loaded.users); else save("users", [ADMIN_SEED]);
      if (loaded.orders) setOrders(loaded.orders);
      if (loaded.cart) setCart(loaded.cart);
      // Session comes from sessionStorage only — clears on tab close.
      const sess = loadSession();
      if (sess) setCurrentUser(sess);
    })();
    return () => { cancelled = true; };
  }, []);

  const updProducts = (v) => { setProducts(v); save("products", v); };
  const updOrders = (v) => { setOrders(v); save("orders", v); };
  const updUsers = (v) => { setUsers(v); save("users", v); };
  const updCart = (v) => { setCart(v); save("cart", v); };
  const updSession = (v) => { setCurrentUser(v); saveSession(v); };

  const toastTimer = useRef(null);
  const notify = (msg, type = "ok") => { clearTimeout(toastTimer.current); setToast({ msg, type }); toastTimer.current = setTimeout(() => setToast(null), 2200); };
  const go = (name, id) => { setRoute({ name, id }); setMenuOpen(false); window.scrollTo?.(0, 0); };

  // ── cart (each line = product + size + colour) ──
  const sameLine = (a, b) => a.id === b.id && (a.size || "") === (b.size || "") && (a.colour || "") === (b.colour || "");
  const cartDetailed = cart.map((c, idx) => ({ ...c, idx, product: products.find((p) => p.id === c.id) })).filter((c) => c.product);
  const cartCount = cartDetailed.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cartDetailed.reduce((s, c) => s + c.product.price * c.qty, 0);

  const addToCart = (p, opts = {}) => {
    if (p.stock <= 0) return notify("That item is out of stock", "warn");
    const line = { id: p.id, size: opts.size || "", colour: opts.colour || "" };
    const qty = opts.qty || 1;
    const ex = cart.find((c) => sameLine(c, line));
    const newQty = Math.min((ex ? ex.qty : 0) + qty, p.stock);
    updCart(ex ? cart.map((c) => sameLine(c, line) ? { ...c, qty: newQty } : c) : [...cart, { ...line, qty: newQty }]);
    notify("Added to cart");
  };
  const setQtyAt = (idx, qty) => {
    const line = cart[idx]; if (!line) return;
    const p = products.find((x) => x.id === line.id);
    const q = Math.max(1, Math.min(qty, p?.stock ?? qty));
    updCart(cart.map((c, i) => i === idx ? { ...c, qty: q } : c));
  };
  const removeAt = (idx) => updCart(cart.filter((_, i) => i !== idx));

  // ── auth ──
  const login = (email, password) => {
    const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase() && x.password === password);
    if (!u) return notify("Invalid email or password", "warn");
    updSession(u); notify("Welcome back, " + u.name.split(" ")[0]); go(u.role === "admin" ? "admin" : "home");
  };
  const register = (name, email, password) => {
    if (!name || !email || !password) { notify("Please fill in all fields", "warn"); return false; }
    if (users.some((x) => x.email.toLowerCase() === email.trim().toLowerCase())) { notify("That email is already registered", "warn"); return false; }
    const u = { id: "u-" + Date.now(), name, email: email.trim(), password, role: "customer" };
    updUsers([...users, u]); notify("Account created! Please sign in."); return true;
  };
  const logout = () => { updSession(null); go("home"); notify("Signed out"); };

  // ── orders ──
  const placeOrder = (shipping) => {
    const items = cartDetailed.map((c) => ({ id: c.id, name: c.product.name, price: c.product.price, qty: c.qty, size: c.size || "", colour: c.colour || "" }));
    const order = { id: "ORD-" + Date.now().toString().slice(-6), userId: currentUser.id, customer: currentUser.name, items, total: cartTotal, status: "Pending", createdAt: new Date().toISOString(), shipping };
    updOrders([order, ...orders]);
    updProducts(products.map((p) => { const tot = items.filter((i) => i.id === p.id).reduce((s, i) => s + i.qty, 0); return tot ? { ...p, stock: Math.max(0, p.stock - tot) } : p; }));
    updCart([]); setLastOrder(order); go("confirmation"); notify("Order placed successfully!");
  };

  // ── admin ──
  const saveProduct = (data) => {
    if (data.id) { updProducts(products.map((p) => p.id === data.id ? { ...p, ...data } : p)); notify("Product updated"); }
    else { updProducts([{ ...data, id: "p-" + Date.now() }, ...products]); notify("Product added"); }
    setEditingProduct(null); setShowForm(false);
  };
  const deleteProduct = (id) => { updProducts(products.filter((p) => p.id !== id)); notify("Product removed"); };
  const setOrderStatus = (id, status) => updOrders(orders.map((o) => o.id === id ? { ...o, status } : o));
  const resetDemo = () => { const s = seedProducts(); updProducts(s); updOrders([]); updCart([]); notify("Demo data reset"); };

  // ── derived ──
  const revenue = orders.filter((o) => o.status !== "Cancelled").reduce((s, o) => s + o.total, 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5);
  const outStock = products.filter((p) => p.stock <= 0);
  const isAdmin = currentUser?.role === "admin";

  const priceCeiling = Math.max(1000, ...products.map((p) => p.price));
  const priceCap = maxPrice == null ? priceCeiling : maxPrice;
  const visibleProducts = products
    .filter((p) =>
      (cat === "All" || p.category === cat) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) || p.category.toLowerCase().includes(query.toLowerCase())) &&
      (!inStockOnly || p.stock > 0) &&
      (p.price <= priceCap)
    )
    .sort((a, b) => sort === "priceAsc" ? a.price - b.price : sort === "priceDesc" ? b.price - a.price : 0);

  return {
    // state
    products, orders, users, cart, currentUser, route, toast,
    query, cat, menuOpen, adminTab, editingProduct, showForm, lastOrder,
    sort, inStockOnly, maxPrice, showFilters,
    // setters used by pages
    setQuery, setCat, setMenuOpen, setAdminTab, setEditingProduct, setShowForm,
    setSort, setInStockOnly, setMaxPrice, setShowFilters,
    // derived
    cartDetailed, cartCount, cartTotal, visibleProducts, isAdmin,
    revenue, lowStock, outStock, priceCeiling, priceCap,
    // actions
    go, notify, addToCart, setQtyAt, removeAt,
    login, register, logout, placeOrder,
    saveProduct, deleteProduct, setOrderStatus, resetDemo,
  };
}
