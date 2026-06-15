// ────────────────────────────────────────────────────────────
// EDIT THESE to make the store yours.
// ────────────────────────────────────────────────────────────
import {
  Heart, Dumbbell, Flower2, Moon, Shirt, Sparkles, Bed, Flower, Activity,
} from "lucide-react";

export const BRAND = "Lila & Co.";
export const TAGLINE = "Women's everyday wear, delivered to your door.";

// Product categories shown across the store.
export const CATEGORIES = ["Bra", "Sports Bra", "Panties", "Night Suits", "T-Shirts", "Kaftan", "Pyjama", "Camisole", "Gym Leggings"];

// The store's WhatsApp number (country code + number, no "+", no spaces).
export const WHATSAPP_NUMBER = "919580023800";

// Quick-pick sizes in the admin product form.
export const SIZE_PRESETS = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

// Order status pipeline (matches PostgreSQL ENUM order_status).
export const STATUS_FLOW = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered", "Cancelled"];

// Icon + colour per category (used for placeholder illustrations & fallbacks).
export const CAT_STYLE = {
  "Bra":          { icon: Heart, from: "#E2A9B6", to: "#C2778B" },
  "Sports Bra":   { icon: Dumbbell, from: "#9CC6C2", to: "#4F8B86" },
  "Panties":      { icon: Flower2, from: "#E9B7C6", to: "#CE7E98" },
  "Night Suits":  { icon: Moon, from: "#A9A6C4", to: "#6E6A9E" },
  "T-Shirts":     { icon: Shirt, from: "#E6BFA0", to: "#C0573B" },
  "Kaftan":       { icon: Sparkles, from: "#E0C58A", to: "#B8923E" },
  "Pyjama":       { icon: Bed, from: "#A9C0D4", to: "#5E7E9E" },
  "Camisole":     { icon: Flower, from: "#C9B6D9", to: "#8A6EA8" },
  "Gym Leggings": { icon: Activity, from: "#AFC9A0", to: "#5E8B4F" },
};

// Colour per order status.
export const STATUS_COLOR = {
  Pending: "#C8923E", Confirmed: "#5C6B79", Processing: "#6A5ACD",
  Shipped: "#7A4A63", Delivered: "#5E7B5A", Cancelled: "#B23A2E",
};
