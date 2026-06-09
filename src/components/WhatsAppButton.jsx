import { MessageCircle } from "lucide-react";
import { BRAND } from "../constants.js";
import { waLink } from "../lib/format.js";

// Floating "chat on WhatsApp" button, shown to signed-in customers.
export default function WhatsAppButton() {
  return (
    <button
      onClick={() => window.open(waLink(`Hi ${BRAND}! I have a question about your products.`), "_blank")}
      title="Chat on WhatsApp"
      style={{ position: "fixed", bottom: 22, left: 22, zIndex: 45, width: 54, height: 54, borderRadius: "50%", background: "#25D366", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 8px 22px rgba(37,211,102,.45)" }}>
      <MessageCircle size={26} color="#fff" />
    </button>
  );
}
