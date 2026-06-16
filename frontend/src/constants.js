// ────────────────────────────────────────────────────────────
// 🛍️  STORE CONFIGURATION — Edit these for production
// ────────────────────────────────────────────────────────────
import {
  Heart, Dumbbell, Flower2, Moon, Shirt, Sparkles, Bed, Flower, Activity,
} from "lucide-react";

// Apna brand naam aur tagline yahan badlo
export const BRAND   = "Lila & Co.";
export const TAGLINE = "Women's everyday wear, delivered to your door.";

// Apna WhatsApp number (country code + number, no "+" or spaces)
// India example: 98765 43210 → "919876543210"
export const WHATSAPP_NUMBER = "919580023800";  // ← CHANGE THIS

// Product categories shown in the store & admin panel.
// Add/remove categories as needed — also update CAT_STYLE below.
export const CATEGORIES = [
  "Bra", "Sports Bra", "Panties", "Night Suits",
  "T-Shirts", "Kaftan", "Pyjama", "Camisole", "Gym Leggings",
];

// Quick-pick sizes shown in the admin "Add product" form.
export const SIZE_PRESETS = [
  "XS", "S", "M", "L", "XL", "XXL", "Free Size",
  "32B", "34B", "34C", "36B", "36C", "38B", "38C",
];

// ── DO NOT EDIT BELOW unless you add/remove order statuses ──

// Order status pipeline (must match PostgreSQL ENUM order_status exactly).
export const STATUS_FLOW = [
  "Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled",
];

// Colour per order status (used in admin order cards & timeline).
export const STATUS_COLOR = {
  Pending:    "#C8923E",
  Confirmed:  "#5C6B79",
  Processing: "#6A5ACD",
  Shipped:    "#7A4A63",
  Delivered:  "#5E7B5A",
  Cancelled:  "#B23A2E",
};

// Icon + gradient per category (used for placeholder illustrations & image fallbacks).
// If you add a new category to CATEGORIES, add a matching entry here.
export const CAT_STYLE = {
  "Bra":          { icon: Heart,    from: "#E2A9B6", to: "#C2778B" },
  "Sports Bra":   { icon: Dumbbell, from: "#9CC6C2", to: "#4F8B86" },
  "Panties":      { icon: Flower2,  from: "#E9B7C6", to: "#CE7E98" },
  "Night Suits":  { icon: Moon,     from: "#A9A6C4", to: "#6E6A9E" },
  "T-Shirts":     { icon: Shirt,    from: "#E6BFA0", to: "#C0573B" },
  "Kaftan":       { icon: Sparkles, from: "#E0C58A", to: "#B8923E" },
  "Pyjama":       { icon: Bed,      from: "#A9C0D4", to: "#5E7E9E" },
  "Camisole":     { icon: Flower,   from: "#C9B6D9", to: "#8A6EA8" },
  "Gym Leggings": { icon: Activity, from: "#AFC9A0", to: "#5E8B4F" },
};
