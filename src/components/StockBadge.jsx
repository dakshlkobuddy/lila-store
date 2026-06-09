// Coloured "In stock / Only N left / Out of stock" label.
export default function StockBadge({ stock }) {
  let label = "In stock", color = "var(--sage)";
  if (stock <= 0) { label = "Out of stock"; color = "var(--danger)"; }
  else if (stock <= 5) { label = `Only ${stock} left`; color = "var(--gold)"; }
  return <span style={{ fontSize: 12, fontWeight: 700, color }}>{label}</span>;
}
