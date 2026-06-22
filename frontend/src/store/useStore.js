import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "../lib/supabaseClient.js";
import { BRAND } from "../constants.js";
import { loadRazorpayScript, openRazorpayCheckout } from "../lib/razorpay.js";

// All app state and Supabase-backed actions live here.
// Pages/components receive the returned object as `store`.
export default function useStore() {
  // ── UI state ───────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const toastTimer = useRef(null);
  const notify = useCallback((msg, type = "ok") => {
    clearTimeout(toastTimer.current);
    setToast({ msg, type });
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);
  const go = useCallback((name, id) => {
    setRoute({ name, id });
    setMenuOpen(false);
    window.scrollTo?.(0, 0);
  }, []);

  // ── Auth: Supabase session ────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    // 1. Get existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (cancelled) return;
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        if (!cancelled) setCurrentUser(profile);
      }
      if (!cancelled) setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (cancelled) return;
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          if (!cancelled) {
            setCurrentUser(profile);
            // Auto-redirect admin to dashboard on sign-in
            if (_event === "SIGNED_IN" && profile?.role === "admin") {
              setRoute({ name: "admin" });
            }
          }
        } else {
          if (!cancelled) setCurrentUser(null);
        }
      }
    );

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    // Call ensure_profile() RPC which auto-creates the profile if missing
    // (handles users created before the trigger, or schema resets).
    const { data: rpcData, error: rpcError } = await supabase.rpc("ensure_profile");

    if (!rpcError && rpcData) {
      return rpcData;
    }

    // Fallback: direct query (in case the RPC hasn't been deployed yet)
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    return data;
  };

  // ── Load data when user changes ───────────────────────────
  useEffect(() => {
    loadProducts();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      loadCart();
      loadOrders();
    } else {
      setCart([]);
      setOrders([]);
    }
  }, [currentUser]);

  // ── Products ──────────────────────────────────────────────
  const loadProducts = async () => {
    const isAdmin = currentUser?.role === "admin";
    let q = supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    // Non-admin users only see active products
    if (!isAdmin) q = q.eq("is_active", true);

    const { data, error } = await q;
    if (!error && data) setProducts(data);
  };

  const saveProduct = async (data) => {
    if (data.id) {
      // Update existing
      const { error } = await supabase
        .from("products")
        .update({
          name: data.name,
          category: data.category,
          price: Number(data.price),
          stock: Number(data.stock),
          image_url: data.image_url || null,
          sizes: data.sizes || [],
          colours: data.colours || [],
          description: data.description || "",
          badge: data.badge || null,
        })
        .eq("id", data.id);

      if (error) { notify("Failed to update product: " + error.message, "warn"); return; }
      notify("Product updated");
    } else {
      // Insert new
      const { error } = await supabase
        .from("products")
        .insert({
          name: data.name,
          category: data.category,
          price: Number(data.price),
          stock: Number(data.stock),
          image_url: data.image_url || null,
          sizes: data.sizes || [],
          colours: data.colours || [],
          description: data.description || "",
          badge: data.badge || null,
        });

      if (error) { notify("Failed to add product: " + error.message, "warn"); return; }
      notify("Product added");
    }

    setEditingProduct(null);
    setShowForm(false);
    await loadProducts();
  };

  const toggleProduct = async (id, isActive) => {
    const { error } = await supabase
      .from("products")
      .update({ is_active: !isActive })
      .eq("id", id);

    if (error) { notify("Failed to update product: " + error.message, "warn"); return; }
    notify(isActive ? "Product deactivated" : "Product reactivated");
    await loadProducts();
  };

  // ── Image upload to Supabase Storage ──────────────────────
  const uploadProductImage = async (file) => {
    const ext = file.name.split(".").pop().toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = `products/${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { cacheControl: "3600", upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  };

  const deleteProductImage = async (imageUrl) => {
    if (!imageUrl) return;
    try {
      // Extract file path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split("/storage/v1/object/public/product-images/");
      if (pathParts.length > 1) {
        await supabase.storage.from("product-images").remove([pathParts[1]]);
      }
    } catch (_e) { /* ignore cleanup errors */ }
  };

  // ── Cart ──────────────────────────────────────────────────
  const loadCart = async () => {
    if (!currentUser) return;
    const { data, error } = await supabase
      .from("cart_items")
      .select("*, products(*)")
      .eq("user_id", currentUser.id);

    if (!error && data) setCart(data);
  };

  const cartDetailed = cart
    .filter((c) => c.products) // products relation loaded
    .map((c) => ({
      ...c,
      product: c.products, // rename for backward compat with UI components
    }));
  const cartCount = cartDetailed.reduce((s, c) => s + c.qty, 0);
  const cartTotal = cartDetailed.reduce((s, c) => s + Number(c.product.price) * c.qty, 0);

  const addToCart = async (p, opts = {}) => {
    if (!currentUser) { notify("Please sign in first", "warn"); return; }
    if (p.stock <= 0) return notify("That item is out of stock", "warn");

    const size = opts.size || "";
    const colour = opts.colour || "";
    const qty = opts.qty || 1;

    // Check if already in cart (same product + size + colour)
    const existing = cart.find(
      (c) => c.product_id === p.id && c.size === size && c.colour === colour
    );

    if (existing) {
      const newQty = Math.min(existing.qty + qty, p.stock);
      const { error } = await supabase
        .from("cart_items")
        .update({ qty: newQty })
        .eq("id", existing.id);

      if (error) { notify("Failed to update cart", "warn"); return; }
    } else {
      const { error } = await supabase
        .from("cart_items")
        .insert({
          user_id: currentUser.id,
          product_id: p.id,
          size,
          colour,
          qty: Math.min(qty, p.stock),
        });

      if (error) { notify("Failed to add to cart", "warn"); return; }
    }

    await loadCart();
    notify("Added to cart");
  };

  const setQtyAt = async (cartItemId, qty) => {
    const item = cart.find((c) => c.id === cartItemId);
    if (!item) return;

    const maxStock = item.products?.stock ?? qty;
    const q = Math.max(1, Math.min(qty, maxStock));

    const { error } = await supabase
      .from("cart_items")
      .update({ qty: q })
      .eq("id", cartItemId);

    if (!error) await loadCart();
  };

  const removeAt = async (cartItemId) => {
    const { error } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", cartItemId);

    if (!error) await loadCart();
  };

  // ── Auth actions ──────────────────────────────────────────
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      notify(error.message || "Invalid email or password", "warn");
      return { error };
    }

    // Fetch profile to know the role for redirect
    // (onAuthStateChange will also fire, but we redirect here for
    // immediate UX — no extra round-trip delay visible to user)
    const profile = await fetchProfile(data.user.id);
    setCurrentUser(profile);
    if (profile?.role === "admin") {
      setRoute({ name: "admin" });
    }

    notify("Welcome back!");
    return { error: null };
  };

  const register = async (name, email, password) => {
    if (!name || !email || !password) {
      notify("Please fill in all fields", "warn");
      return { error: { message: "Missing fields" } };
    }

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { name } },
    });

    if (error) {
      notify(error.message || "Registration failed", "warn");
      return { error };
    }

    notify("Account created! Please sign in.");
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setCart([]);
    setOrders([]);
    go("home");
    notify("Signed out");
  };

  // ── Orders ────────────────────────────────────────────────
  const loadOrders = async () => {
    if (!currentUser) return;

    let q = supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    // Customers see only their orders; admin sees all
    if (currentUser.role !== "admin") {
      q = q.eq("user_id", currentUser.id);
    }

    const { data, error } = await q;
    if (!error && data) setOrders(data);
  };

  // ── COD flow ─────────────────────────────────────────────
  // Calls place_order() RPC directly with payment_status = 'cod'.
  // No payment gateway involved — customer pays on delivery.
  const placeOrder = async (shipping) => {
    if (!currentUser) return;

    // Only send product_id, quantity, size, colour — the server reads
    // product name + price from the DB and computes the total server-side.
    const items = cartDetailed.map((c) => ({
      product_id: c.product_id,
      quantity: c.qty,
      size: c.size || "",
      colour: c.colour || "",
    }));

    // Collision-safe order ID: base-36 timestamp + 5 random chars
    const ts  = Date.now().toString(36).toUpperCase();
    const rnd = Math.random().toString(36).slice(2, 7).toUpperCase();
    const orderId = `ORD-${ts}-${rnd}`;

    const { data, error } = await supabase.rpc("place_order", {
      p_order_id:       orderId,
      p_items:          items,
      p_shipping:       shipping,
      p_payment_status: "cod",  // explicit: cash on delivery
    });

    if (error) {
      const msg = error.message || "Order failed";
      notify(msg, "warn");
      return { error };
    }

    const serverTotal    = data?.total          ?? cartTotal;
    const serverCustomer = data?.customer_name  ?? currentUser.name;

    setLastOrder({
      id:           orderId,
      customer:     serverCustomer,
      order_items:  cartDetailed.map((c) => ({
        product_name: c.product.name,
        price:        Number(c.product.price),
        quantity:     c.qty,
        size:         c.size   || "",
        colour:       c.colour || "",
      })),
      total:         serverTotal,
      shipping,
      paymentMethod: "cod",
    });

    setCart([]);
    await loadProducts();
    await loadOrders();
    go("confirmation");
    notify("Order placed! Pay on delivery.");
    return { error: null };
  };

  // ── Razorpay online payment flow ──────────────────────────
  // Step-by-step:
  //   1. Load Razorpay SDK (lazy, cached)
  //   2. Call create-razorpay-order Edge Function → gets { internal_order_id,
  //      razorpay_order_id, amount_paise, key_id } (server computes total)
  //   3. Open Razorpay modal — user pays
  //   4. Call verify-and-place-order Edge Function → HMAC-SHA256 verification
  //      of Razorpay's signature, then place_order() RPC with payment_status='paid'
  //   5. Show confirmation page
  const placeOrderOnline = async (shipping) => {
    if (!currentUser) return;

    const items = cartDetailed.map((c) => ({
      product_id: c.product_id,
      quantity:   c.qty,
      size:       c.size   || "",
      colour:     c.colour || "",
    }));

    // ── Step 1: Load Razorpay checkout SDK ───────────────────
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      notify("Could not load payment gateway. Check your connection and try again.", "warn");
      return { error: { message: "Razorpay script failed to load" } };
    }

    // ── Step 2: Get user JWT for Edge Function auth ──────────
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      notify("Session expired. Please sign in again.", "warn");
      return { error: { message: "No active session" } };
    }

    const fnBase = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
    const headers = {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${session.access_token}`,
    };

    // ── Step 3: Create Razorpay order (server computes total) ─
    let createData;
    try {
      const createRes = await fetch(`${fnBase}/create-razorpay-order`, {
        method: "POST",
        headers,
        body: JSON.stringify({ items }),
      });
      createData = await createRes.json();
      if (!createRes.ok) {
        notify(createData.error || "Payment setup failed. Please try again.", "warn");
        return { error: createData };
      }
    } catch (networkErr) {
      notify("Network error while setting up payment. Please try again.", "warn");
      return { error: { message: networkErr.message } };
    }

    const { internal_order_id, razorpay_order_id, amount_paise, key_id } = createData;

    // ── Step 4: Open Razorpay modal ───────────────────────────
    let paymentResult;
    try {
      paymentResult = await openRazorpayCheckout({
        key:         key_id,           // public key — safe in browser
        amount:      amount_paise,     // in paise (₹1 = 100 paise)
        currency:    "INR",
        name:        BRAND,
        description: `Order ${internal_order_id}`,
        order_id:    razorpay_order_id,
        prefill: {
          name:    shipping.name,
          contact: shipping.phone,
        },
        theme: { color: "#5E7B5A" },  // sage green — matches brand
      });
    } catch (err) {
      if (err.message === "Payment cancelled") {
        notify("Payment cancelled.", "warn");
      } else {
        notify(err.message || "Payment failed. Please try again.", "warn");
      }
      return { error: { message: err.message } };
    }

    // ── Step 5: Verify payment + place order (server-side) ────
    // Server verifies HMAC-SHA256 signature before creating the order.
    let verifyData;
    try {
      const verifyRes = await fetch(`${fnBase}/verify-and-place-order`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          razorpay_payment_id: paymentResult.razorpay_payment_id,
          razorpay_order_id:   paymentResult.razorpay_order_id,
          razorpay_signature:  paymentResult.razorpay_signature,
          internal_order_id,
          items,
          shipping,
        }),
      });
      verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        // Payment went through but order creation failed (e.g. stock just ran out).
        // The user's money is still safe — they should contact support.
        notify(
          verifyData.error ||
          "Order could not be placed. Your payment is safe — please contact support.",
          "warn"
        );
        return { error: verifyData };
      }
    } catch (networkErr) {
      notify(
        "Network error after payment. Your payment was received — please contact support with your payment ID.",
        "warn"
      );
      return { error: { message: networkErr.message } };
    }

    // ── Step 6: Update UI ─────────────────────────────────────
    const serverTotal    = verifyData?.total         ?? cartTotal;
    const serverCustomer = verifyData?.customer_name ?? currentUser.name;

    setLastOrder({
      id:          internal_order_id,
      customer:    serverCustomer,
      order_items: cartDetailed.map((c) => ({
        product_name: c.product.name,
        price:        Number(c.product.price),
        quantity:     c.qty,
        size:         c.size   || "",
        colour:       c.colour || "",
      })),
      total:         serverTotal,
      shipping,
      paymentMethod: "online",
      paymentId:     paymentResult.razorpay_payment_id,
    });

    setCart([]);
    await loadProducts();
    await loadOrders();
    go("confirmation");
    notify("Payment successful! Order placed.");
    return { error: null };
  };

  const setOrderStatus = async (id, status) => {
    const { error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", id);

    if (error) { notify("Failed to update status: " + error.message, "warn"); return; }
    await loadOrders();
  };

  // ── Derived ───────────────────────────────────────────────
  const isAdmin = currentUser?.role === "admin";
  const revenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + Number(o.total), 0);
  const lowStock = products.filter((p) => p.is_active && p.stock > 0 && p.stock <= 5);
  const outStock = products.filter((p) => p.is_active && p.stock <= 0);

  const priceCeiling = Math.max(1000, ...products.map((p) => Number(p.price)));
  const priceCap = maxPrice == null ? priceCeiling : maxPrice;
  const visibleProducts = products
    .filter((p) =>
      (isAdmin || p.is_active) &&
      (cat === "All" || p.category === cat) &&
      (p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase())) &&
      (!inStockOnly || p.stock > 0) &&
      (Number(p.price) <= priceCap)
    )
    .sort((a, b) =>
      sort === "priceAsc"
        ? Number(a.price) - Number(b.price)
        : sort === "priceDesc"
          ? Number(b.price) - Number(a.price)
          : 0
    );

  return {
    // state
    products, orders, cart, currentUser, loading, route, toast,
    query, cat, menuOpen, adminTab, editingProduct, showForm, lastOrder,
    sort, inStockOnly, maxPrice, showFilters,
    // setters
    setQuery, setCat, setMenuOpen, setAdminTab, setEditingProduct, setShowForm,
    setSort, setInStockOnly, setMaxPrice, setShowFilters,
    // derived
    cartDetailed, cartCount, cartTotal, visibleProducts, isAdmin,
    revenue, lowStock, outStock, priceCeiling, priceCap,
    // actions
    go, notify, addToCart, setQtyAt, removeAt,
    login, register, logout, placeOrder, placeOrderOnline,
    saveProduct, toggleProduct, setOrderStatus,
    uploadProductImage, deleteProductImage,
    loadProducts, loadCart, loadOrders,
  };
}
