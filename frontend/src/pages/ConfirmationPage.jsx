import { CheckCircle2, MessageCircle, FileText } from "lucide-react";
import { money, waLink, orderWhatsAppMessage } from "../lib/format.js";
import { generateInvoice } from "../lib/pdf.js";
import { s } from "./ConfirmationPage.styles.js";

export default function ConfirmationPage({ store }) {
  const { lastOrder, go } = store;
  if (!lastOrder) return null;

  const items = lastOrder.order_items || [];

  return (
    <div className="ec-narrow-page" style={s.page}>
      <div className="ec-card" style={s.card}>
        <div style={s.check}><CheckCircle2 size={34} color="var(--sage)" /></div>
        <h1 className="ec-disp" style={s.title}>Order placed!</h1>
        <p style={s.thanks}>Thank you, {lastOrder.customer_name?.split(" ")[0] || "Customer"}. Your order <strong style={s.strong}>{lastOrder.id}</strong> has been received.</p>
        <p style={s.note}>We'll contact you on WhatsApp once your order is ready to ship.</p>
      </div>
      <div className="ec-card" style={s.summary}>
        {items.map((i, k) => (
          <div key={k} style={s.line}>
            <span>{i.product_name}{[i.size, i.colour].filter(Boolean).length ? ` (${[i.size, i.colour].filter(Boolean).join(" · ")})` : ""} × {i.quantity}</span><span>{money(i.price * i.quantity)}</span>
          </div>
        ))}
        <div style={s.totalRow}>
          <span>Total</span><span>{money(lastOrder.total)}</span>
        </div>
      </div>
      <div style={s.actions}>
        <button className="ec-btn ec-btn-primary" style={{ width: "100%", justifyContent: "center", marginBottom: 12, background: "#25D366", color: "#fff", border: "none" }} onClick={() => window.open(waLink(orderWhatsAppMessage(lastOrder)), "_blank")}>
          <MessageCircle size={18} /> Send WhatsApp update
        </button>
        <div style={{ display: "flex", gap: 12 }}>
          <button className="ec-btn ec-btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={() => go("orders")}>View Orders</button>
          <button className="ec-btn ec-btn-ghost" style={{ flex: 1, justifyContent: "center", color: "var(--accent)" }} onClick={() => generateInvoice(lastOrder)}>
            <FileText size={16} /> Invoice
          </button>
        </div>
      </div>

    </div>
  );
}
