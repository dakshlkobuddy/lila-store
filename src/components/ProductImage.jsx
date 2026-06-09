import { useState } from "react";
import { CAT_STYLE } from "../constants.js";

// Shows a product's photo; if it's missing/broken, falls back to a
// category-coloured gradient with the category icon.
export default function ProductImage({ product, className, style }) {
  const [broken, setBroken] = useState(false);
  const cat = CAT_STYLE[product.category] || CAT_STYLE["T-Shirts"];
  const Icon = cat.icon;
  if (product.image && !broken) {
    return <img src={product.image} alt={product.name} onError={() => setBroken(true)}
      className={className} style={{ objectFit: "cover", display: "block", ...style }} />;
  }
  return (
    <div className={className} style={{ background: `linear-gradient(135deg, ${cat.from}, ${cat.to})`,
      display: "flex", alignItems: "center", justifyContent: "center", ...style }}>
      <Icon size={46} color="rgba(255,255,255,.85)" strokeWidth={1.5} />
    </div>
  );
}
