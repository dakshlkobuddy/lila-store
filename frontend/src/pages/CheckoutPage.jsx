import { useState } from "react";
import { money, variantLabel } from "../lib/format.js";
import CheckoutForm from "../components/forms/CheckoutForm.jsx";
import Empty from "../components/Empty.jsx";
import { s } from "./CheckoutPage.styles.js";

export default function CheckoutPage({ store }) {
  const { cartDetailed, cartTotal, currentUser, placeOrder, placeOrderOnline } = store;

  // Separate busy states so each button shows its own spinner independently
  const [busyCOD, setBusyCOD]       = useState(false);
  const [busyOnline, setBusyOnline] = useState(false);
  const [orderError, setOrderError] = useState("");

  // Cash on Delivery — calls place_order() RPC directly
  const handlePlaceCOD = async (shipping) => {
    setBusyCOD(true);
    setOrderError("");
    try {
      const result = await placeOrder(shipping);
      if (result?.error) {
        setOrderError(result.error.message || "Order failed. Please try again.");
      }
    } finally {
      setBusyCOD(false);
    }
  };

  // Online payment — loads Razorpay, opens modal, verifies server-side, then places order
  const handlePlaceOnline = async (shipping) => {
    setBusyOnline(true);
    setOrderError("");
    try {
      const result = await placeOrderOnline(shipping);
      // "Payment cancelled" is a soft cancel — don't show an error card
      if (result?.error && result.error.message !== "Payment cancelled") {
        setOrderError(result.error.message || "Payment failed. Please try again.");
      }
    } finally {
      setBusyOnline(false);
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
                <span>{c.product.name}{variantLabel(c) ? ` (${variantLabel(c)})` : ""} × {c.qty}</span>
                <span>{money(Number(c.product.price) * c.qty)}</span>
              </div>
            ))}
            <div style={s.totalRow}>
              <span>Total</span><span>{money(cartTotal)}</span>
            </div>
          </div>

          {orderError && (
            <div className="ec-card" style={{
              padding: "14px 18px", marginBottom: 16,
              background: "rgba(178,58,46,.08)", border: "1px solid rgba(178,58,46,.25)", borderRadius: 12,
            }}>
              <p style={{ fontSize: 14, color: "var(--danger)", fontWeight: 600, margin: 0 }}>{orderError}</p>
            </div>
          )}

          <CheckoutForm
            user={currentUser}
            total={cartTotal}
            onPlaceCOD={handlePlaceCOD}
            onPlaceOnline={handlePlaceOnline}
            busyCOD={busyCOD}
            busyOnline={busyOnline}
          />
        </>
      )}
    </div>
  );
}

