import { ShoppingBag, ShoppingCart, X, Menu, User, LogOut, LayoutDashboard } from "lucide-react";
import { BRAND } from "../constants.js";
import { wrap, navItem } from "../lib/ui.js";
import Badge from "./Badge.jsx";

// Sticky top bar: brand, navigation, cart, and the mobile menu toggle.
export default function Header({ store }) {
  const { route, currentUser, isAdmin, cartCount, menuOpen, setMenuOpen, go, logout } = store;

  const NavLinks = () => (
    <>
      <span className="ec-link" style={navItem(route.name === "home")} onClick={() => go("home")}>Shop</span>
      {currentUser && <span className="ec-link" style={navItem(route.name === "orders")} onClick={() => go("orders")}>My Orders</span>}
      {isAdmin && <span className="ec-link" style={navItem(route.name === "admin")} onClick={() => go("admin")}><LayoutDashboard size={15} /> Dashboard</span>}
      {currentUser
        ? <span className="ec-link" style={navItem(false)} onClick={logout}><LogOut size={15} /> Sign out</span>
        : <span className="ec-link" style={navItem(false)} onClick={() => go("home")}><User size={15} /> Sign in</span>}
    </>
  );

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 30, background: "rgba(247,241,231,.88)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--line)" }}>
      <div style={wrap()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 0" }}>
          <div className="ec-link" style={{ display: "flex", alignItems: "center", gap: 10 }} onClick={() => go("home")}>
            <div style={{ width: 38, height: 38, borderRadius: 11, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={20} color="#fff" />
            </div>
            <span className="ec-disp" style={{ fontSize: 22, fontWeight: 600 }}>{BRAND}</span>
          </div>
          {currentUser ? (<>
            <nav style={{ display: "flex", alignItems: "center", gap: 22 }} className="ec-nav-desktop">
              <NavLinks />
              {!isAdmin && <button className="ec-btn ec-btn-ghost" style={{ position: "relative", padding: "9px 16px" }} onClick={() => go("cart")}>
                <ShoppingCart size={17} /> Cart {cartCount > 0 && <Badge n={cartCount} />}
              </button>}
            </nav>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }} className="ec-nav-mobile">
              {!isAdmin && <button className="ec-btn ec-btn-ghost" style={{ position: "relative", padding: 10 }} onClick={() => go("cart")}>
                <ShoppingCart size={18} />{cartCount > 0 && <Badge n={cartCount} />}
              </button>}
              <button className="ec-btn ec-btn-ghost" style={{ padding: 10 }} onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={18} /> : <Menu size={18} />}</button>
            </div>
          </>) : null}
        </div>
        {currentUser && menuOpen && <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingBottom: 14 }}><NavLinks /></div>}
      </div>
    </header>
  );
}
