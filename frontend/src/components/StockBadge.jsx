// Coloured "In stock / Only N left / Out of stock" label with urgency alert.
export default function StockBadge({ stock, showUrgency = false }) {
  let label = "In stock", color = "var(--sage)";
  if (stock <= 0) { label = "Out of stock"; color = "var(--danger)"; }
  else if (stock <= 5) { label = `Only ${stock} left in stock!`; color = "var(--gold)"; }

  // Compact badge (for product cards)
  if (!showUrgency || stock > 5 || stock <= 0) {
    return <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>;
  }

  // Urgency alert (for product detail page when low stock)
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 8,
      background: "rgba(255, 165, 0, 0.1)", border: "1px solid rgba(255, 165, 0, 0.3)",
      borderRadius: 8, padding: "8px 14px",
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: "50%", background: color,
        animation: "stockPulse 1.4s ease-in-out infinite",
      }} />
      <span style={{ fontSize: 13, fontWeight: 700, color }}>🔥 {label}</span>
      <style>{`@keyframes stockPulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.5; transform: scale(1.3); } }`}</style>
    </div>
  );
}
