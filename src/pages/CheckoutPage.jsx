import { money, variantLabel } from "../lib/format.js";
import CheckoutForm from "../components/forms/CheckoutForm.jsx";
import Empty from "../components/Empty.jsx";
import { s } from "./CheckoutPage.styles.js";

export default function CheckoutPage({ store }) {
  const { cartDetailed, cartTotal, currentUser, placeOrder } = store;

  return (
    <div style={s.page}>
      <h1 className="ec-disp" style={s.heading}>Checkout</h1>
      {cartDetailed.length === 0 ? <Empty msg="Your cart is empty." /> : (
        <>
          <div className="ec-card" style={s.summary}>
            {cartDetailed.map((c) => (
              <div key={c.idx} style={s.line}>
                <span>{c.product.name}{variantLabel(c) ? ` (${variantLabel(c)})` : ""} × {c.qty}</span><span>{money(c.product.price * c.qty)}</span>
              </div>
            ))}
            <div style={s.totalRow}>
              <span>Total</span><span>{money(cartTotal)}</span>
            </div>
          </div>
          <CheckoutForm user={currentUser} total={cartTotal} onPlace={placeOrder} />
        </>
      )}
    </div>
  );
}
