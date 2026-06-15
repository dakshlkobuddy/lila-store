import { BRAND, WHATSAPP_NUMBER } from "../constants.js";

// Format a number as Indian Rupees, e.g. 1499 → "₹1,499".
export const money = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// "M · Black" style label for a chosen size/colour.
export const variantLabel = (i) => [i.size, i.colour].filter(Boolean).join(" · ");

// Build a "click to open WhatsApp chat" link with a prefilled message.
export const waLink = (text) => "https://wa.me/" + WHATSAPP_NUMBER + "?text=" + encodeURIComponent(text);

// Message used by the cart's "Order on WhatsApp" button.
export const cartWhatsAppMessage = (lines, total) =>
  `Hi ${BRAND}! I'd like to order:\n` +
  lines.map((c) => `• ${c.product.name}${variantLabel(c) ? ` (${variantLabel(c)})` : ""} ×${c.qty} — ${money(Number(c.product.price) * c.qty)}`).join("\n") +
  `\n\nTotal: ${money(total)}`;

// Message used by the order confirmation's WhatsApp button.
// Supports normalized order_items (product_name, quantity) from Supabase.
export const orderWhatsAppMessage = (o) => {
  const items = o.order_items || [];
  return `Hi ${BRAND}! Here are my order details (${o.id}):\n` +
    items.map((i) => `• ${i.product_name}${variantLabel(i) ? ` (${variantLabel(i)})` : ""} ×${i.quantity} — ${money(i.price * i.quantity)}`).join("\n") +
    `\n\nTotal: ${money(o.total)}\nName: ${o.customer}\nAddress: ${o.shipping?.address}, ${o.shipping?.city}${o.shipping?.pincode ? " - " + o.shipping.pincode : ""}\nPhone: ${o.shipping?.phone}`;
};
