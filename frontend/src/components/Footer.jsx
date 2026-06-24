import { BRAND, WHATSAPP_NUMBER } from "../constants.js";
import { wrap } from "../lib/ui.js";
import { MessageCircle, Phone, Heart } from "lucide-react";

export default function Footer() {
  const waUrl = `https://wa.me/${WHATSAPP_NUMBER}`;
  const year = new Date().getFullYear();

  return (
    <footer style={{ borderTop: "1px solid var(--line)", background: "var(--bg2)", marginTop: 32 }}>
      <div className="ec-footer-grid" style={{ ...wrap(), padding: "36px 20px 24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 28 }}>

        {/* Brand */}
        <div className="ec-footer-brand">
          <span className="ec-disp" style={{ fontSize: 18, color: "var(--ink)", display: "block", marginBottom: 8 }}>{BRAND}</span>
          <p style={{ fontSize: 13, color: "var(--ink-soft)", lineHeight: 1.7, maxWidth: 220 }}>
            Women's everyday wear — bras, lingerie, nightwear &amp; more. Delivered to your door.
          </p>
        </div>

        {/* Quick links */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink-soft)", marginBottom: 10, textTransform: "uppercase" }}>Shop</div>
          {["Bra", "Sports Bra", "Panties", "Night Suits", "T-Shirts", "Gym Leggings"].map((cat) => (
            <div key={cat} style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 5 }}>{cat}</div>
          ))}
        </div>

        {/* Policies */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink-soft)", marginBottom: 10, textTransform: "uppercase" }}>Info</div>
          {["Cash on Delivery", "Easy Returns (7 days)", "Secure Checkout", "Size Guide available on request"].map((item) => (
            <div key={item} style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 5 }}>{item}</div>
          ))}
        </div>

        {/* Contact */}
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: "var(--ink-soft)", marginBottom: 10, textTransform: "uppercase" }}>Contact</div>
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#25D366", fontWeight: 600, marginBottom: 10, textDecoration: "none" }}
          >
            <MessageCircle size={16} /> Chat on WhatsApp
          </a>
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-soft)" }}>
            <Phone size={14} /> +91 {WHATSAPP_NUMBER.replace(/^91/, "")}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: "1px solid var(--line)", padding: "14px 20px", display: "flex", justifyContent: "center", alignItems: "center", gap: 6, fontSize: 12, color: "var(--ink-soft)", flexWrap: "wrap" }}>
        <span>© {year} {BRAND}</span>
        <span>·</span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>Made with <Heart size={11} fill="var(--accent)" color="var(--accent)" /> for every woman</span>
      </div>
    </footer>
  );
}
