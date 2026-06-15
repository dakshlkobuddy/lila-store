import { useState } from "react";
import { money, variantLabel } from "../lib/format.js";
import CheckoutForm from "../components/forms/CheckoutForm.jsx";
import Empty from "../components/Empty.jsx";
import { s } from "./CheckoutPage.styles.js";

export default function CheckoutPage({ store }) {
  const { cartDetailed, cartTotal, currentUser, placeOrder } = store;
  const [busy, setBusy] = useState(false);
  const [orderError, setOrderError] = useState("");

  const handlePlace = async (shipping) => {
    setBusy(true);
    setOrderError("");
    try {
      const result = await placeOrder(shipping);
      if (result?.error) {
        // Extract meaningful stock error message
        const msg = result.error.message || "Order failed. Please try again.";
        setOrderError(msg);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={s.page}>
      <h1 className="ec-disp" style={s.heading}>Checkout</h1>
      {cartDetailed.length === 0 ? <Empty msg="Your cart is empty." /> : (
        <>
          <div className="ec-card" style={s.summary}>
            {cartDetailed.map((c) => (
              <div key={c.id} style={s.line}>
                <span>{c.product.name}{variantLabel(c) ? ` (${variantLabel(c)})` : ""} × {c.qty}</span><span>{money(Number(c.product.price) * c.qty)}</span>
              </div>
            ))}
            <div style={s.totalRow}>
              <span>Total</span><span>{money(cartTotal)}</span>
            </div>
          </div>
          {orderError && (
            <div className="ec-card" style={{ padding: "14px 18px", marginBottom: 16, background: "rgba(178,58,46,.08)", border: "1px solid rgba(178,58,46,.25)", borderRadius: 12 }}>
              <p style={{ fontSize: 14, color: "var(--danger)", fontWeight: 600, margin: 0 }}>{orderError}</p>
            </div>
          )}
          <CheckoutForm user={currentUser} total={cartTotal} onPlace={handlePlace} busy={busy} />
        </>
      )}
    </div>
  );
}
