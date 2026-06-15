import { Package } from "lucide-react";

// Friendly empty-state card (e.g. empty cart, no orders).
export default function Empty({ msg, action }) {
  return (
    <div className="ec-card" style={{ padding: 50, textAlign: "center", color: "var(--ink-soft)" }}>
      <Package size={36} style={{ margin: "0 auto 14px", opacity: .5 }} />
      <p style={{ marginBottom: action ? 18 : 0 }}>{msg}</p>{action}
    </div>
  );
}
