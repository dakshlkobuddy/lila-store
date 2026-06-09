import { CheckCircle2, MessageCircle } from "lucide-react";
import { money, waLink, orderWhatsAppMessage } from "../lib/format.js";
import { s } from "./ConfirmationPage.styles.js";

export default function ConfirmationPage({ store }) {
  const { lastOrder, go } = store;
  if (!lastOrder) return null;

  return (
    <div style={s.page}>
      <div className="ec-card" style={s.card}>
        <div style={s.check}><CheckCircle2 size={34} color="var(--sage)" /></div>
        <h1 className="ec-disp" style={s.title}>Order placed!</h1>
        <p style={s.thanks}>Thank you, {lastOrder.customer.split(" ")[0]}. Your order <strong style={s.strong}>{lastOrder.id}</strong> has been received.</p>
        <p style={s.note}>We'll contact you on WhatsApp once your order is ready to ship.</p>
      </div>
      <div className="ec-card" style={s.summary}>
        {lastOrder.items.map((i, k) => (
          <div key={k} style={s.line}>
            <span>{i.name}{[i.size, i.colour].filter(Boolean).length ? ` (${[i.size, i.colour].filter(Boolean).join(" · ")})` : ""} × {i.qty}</span><span>{money(i.price * i.qty)}</span>
          </div>
        ))}
        <div style={s.totalRow}>
          <span>Total</span><span>{money(lastOrder.total)}</span>
        </div>
      </div>
      <button className="ec-btn" style={s.waBtn} onClick={() => window.open(waLink(orderWhatsAppMessage(lastOrder)), "_blank")}>
        <MessageCircle size={17} /> Send order details on WhatsApp
      </button>
      <div style={s.actions}>
        <button className="ec-btn ec-btn-ghost" style={s.actionBtn} onClick={() => go("orders")}>My orders</button>
        <button className="ec-btn ec-btn-primary" style={s.actionBtn} onClick={() => go("home")}>Continue shopping</button>
      </div>
    </div>
  );
}
