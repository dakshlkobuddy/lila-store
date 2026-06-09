import { Minus, Plus, Trash2, MessageCircle, AlertCircle } from "lucide-react";
import { money, variantLabel, waLink, cartWhatsAppMessage } from "../lib/format.js";
import ProductImage from "../components/ProductImage.jsx";
import Empty from "../components/Empty.jsx";
import { s } from "./CartPage.styles.js";

export default function CartPage({ store }) {
  const { cartDetailed, cartTotal, go, setQtyAt, removeAt } = store;

  return (
    <div style={s.page}>
      <h1 className="ec-disp" style={s.heading}>Your cart</h1>
      {cartDetailed.length === 0 ? (
        <Empty msg="Your cart is empty." action={<button className="ec-btn ec-btn-primary" onClick={() => go("home")}>Browse products</button>} />
      ) : (
        <>
          {cartDetailed.map((c) => {
            const atMax = c.qty >= (c.product?.stock ?? Infinity);
            return (
              <div key={c.idx} className="ec-card" style={s.row}>
                <ProductImage product={c.product} className="" style={s.thumb} />
                <div style={s.info}>
                  <h3 style={s.name}>{c.product.name}</h3>
                  {variantLabel(c) && <div style={s.variant}>{variantLabel(c)}</div>}
                  <span style={s.unitPrice}>{money(c.product.price)}</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                  <div style={s.qtyWrap}>
                    <button className="ec-btn ec-btn-ghost" style={s.qtyBtn} onClick={() => setQtyAt(c.idx, c.qty - 1)} disabled={c.qty <= 1}><Minus size={14} /></button>
                    <span style={s.qty}>{c.qty}</span>
                    <button className="ec-btn ec-btn-ghost" style={{ ...s.qtyBtn, opacity: atMax ? 0.4 : 1 }} onClick={() => setQtyAt(c.idx, c.qty + 1)} disabled={atMax}><Plus size={14} /></button>
                  </div>
                  {atMax && (
                    <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--gold)", fontWeight: 600 }}>
                      <AlertCircle size={12} /> Max stock reached
                    </div>
                  )}
                </div>
                <button className="ec-btn ec-btn-ghost" style={s.removeBtn} onClick={() => removeAt(c.idx)}><Trash2 size={16} /></button>
              </div>
            );
          })}
          <div className="ec-card" style={s.summary}>
            <div style={s.totalRow}>
              <span>Total</span><span className="ec-disp">{money(cartTotal)}</span>
            </div>
            <button className="ec-btn ec-btn-primary" style={s.checkoutBtn} onClick={() => go("checkout")}>
              Proceed to checkout
            </button>
            <button className="ec-btn" style={s.waBtn} onClick={() => window.open(waLink(cartWhatsAppMessage(cartDetailed, cartTotal)), "_blank")}>
              <MessageCircle size={17} /> Order on WhatsApp
            </button>
          </div>
        </>
      )}
    </div>
  );
}
