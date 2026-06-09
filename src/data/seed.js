import { CAT_STYLE } from "../constants.js";

// Clean catalog-style garment illustrations per category (always render, never break).
const GARMENT = {
  "Bra": "<path d='M170,332 Q300,360 430,332 L430,300 Q300,326 170,300 Z'/><path d='M176,306 Q182,238 296,248 Q300,302 240,318 Q196,322 176,306 Z'/><path d='M424,306 Q418,238 304,248 Q300,302 360,318 Q404,322 424,306 Z'/><path d='M212,252 L188,168 L202,164 L226,250 Z'/><path d='M388,252 L412,168 L398,164 L374,250 Z'/>",
  "Sports Bra": "<path d='M185,252 L185,372 Q300,398 415,372 L415,252 C370,234 230,234 185,252 Z'/><path d='M228,252 L292,162 L306,172 L256,254 Z'/><path d='M372,252 L308,162 L294,172 L344,254 Z'/>",
  "Panties": "<path d='M180,242 L420,242 L405,288 Q358,290 338,346 Q300,363 262,346 Q242,290 195,288 Z'/>",
  "Night Suits": "<path d='M230,166 C262,150 338,150 370,166 L420,206 L398,238 L379,224 L398,460 Q300,488 202,460 L221,224 L202,238 L180,206 Z'/>",
  "T-Shirts": "<path d='M225,160 L150,205 L185,278 L225,252 L225,455 L375,455 L375,252 L415,278 L450,205 L375,160 C355,196 245,196 225,160 Z'/>",
  "Kaftan": "<path d='M150,206 L240,182 L300,202 L360,182 L450,206 L414,300 L388,262 L405,464 Q300,494 195,464 L212,262 L186,300 Z'/>",
  "Pyjama": "<path d='M210,196 L390,196 L402,460 L322,460 L300,312 L278,460 L198,460 Z'/><path d='M292,196 L300,210 L308,196 Z'/>",
  "Camisole": "<path d='M235,212 L235,448 Q300,470 365,448 L365,212 C330,232 270,232 235,212 Z'/><path d='M250,214 L268,150 L283,154 L264,216 Z'/><path d='M350,214 L332,150 L317,154 L336,216 Z'/>",
  "Gym Leggings": "<path d='M232,186 L368,186 L378,460 L322,460 L300,302 L278,460 L222,460 Z'/>",
};

// Build a data-URI SVG "photo" for a category — used as default product images.
export const productPhoto = (category) => {
  const c = CAT_STYLE[category] || CAT_STYLE["T-Shirts"];
  const g = GARMENT[category] || GARMENT["T-Shirts"];
  const svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'>"
    + "<defs><linearGradient id='bg' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='#FAF6EE'/><stop offset='1' stop-color='#ECE2D1'/></linearGradient>"
    + "<linearGradient id='gm' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + c.from + "'/><stop offset='1' stop-color='" + c.to + "'/></linearGradient></defs>"
    + "<rect width='600' height='600' fill='url(#bg)'/>"
    + "<ellipse cx='300' cy='498' rx='148' ry='24' fill='#000' opacity='0.06'/>"
    + "<g fill='url(#gm)' stroke='" + c.to + "' stroke-width='3' stroke-linejoin='round'>" + g + "</g></svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
};

// The starter catalog. Change SEED_VERSION in constants.js after editing this.
export const seedProducts = () => ([
  { id: "p1", name: "Everyday Cotton Bra", category: "Bra", price: 499, stock: 20, image: productPhoto("Bra"), sizes: ["32B", "34B", "34C", "36C"], colours: ["Black", "Beige", "White"], description: "Soft non-wired everyday bra in breathable cotton with full coverage and gentle support.", badge: "Best Seller" },
  { id: "p2", name: "Lace Balconette Bra", category: "Bra", price: 799, stock: 12, image: productPhoto("Bra"), sizes: ["32B", "34C", "36C"], colours: ["Black", "Maroon"], description: "Underwired balconette bra with delicate lace trim and adjustable straps.", badge: "New" },
  { id: "p3", name: "High-Impact Sports Bra", category: "Sports Bra", price: 899, stock: 15, image: productPhoto("Sports Bra"), sizes: ["S", "M", "L", "XL"], colours: ["Black", "Grey", "Coral"], description: "Moisture-wicking high-support sports bra with a racerback for workouts and running.", badge: "New" },
  { id: "p4", name: "Seamless Hipster Panties (Pack of 3)", category: "Panties", price: 599, stock: 30, image: productPhoto("Panties"), sizes: ["S", "M", "L", "XL"], colours: ["Assorted"], description: "No-show seamless hipster briefs in soft microfiber. Comfortable all-day wear.", badge: "Best Seller" },
  { id: "p5", name: "Printed Cotton Night Suit", category: "Night Suits", price: 1199, stock: 8, image: productPhoto("Night Suits"), sizes: ["S", "M", "L", "XL"], colours: ["Blue", "Pink"], description: "Two-piece cotton night suit with a relaxed top and full-length pants in a soft print." },
  { id: "p6", name: "Relaxed Crew T-Shirt", category: "T-Shirts", price: 449, stock: 0, image: productPhoto("T-Shirts"), sizes: ["S", "M", "L", "XL", "XXL"], colours: ["Black", "White", "Olive"], description: "Everyday crew-neck tee in combed cotton with a relaxed, true-to-size fit.", badge: "Sale" },
  { id: "p7", name: "Floral Kaftan", category: "Kaftan", price: 1299, stock: 10, image: productPhoto("Kaftan"), sizes: ["Free Size"], colours: ["Floral Blue", "Floral Red"], description: "Breezy floral kaftan in lightweight rayon — easy loungewear or beach cover-up.", badge: "New" },
  { id: "p8", name: "Soft Cotton Pyjama Set", category: "Pyjama", price: 899, stock: 4, image: productPhoto("Pyjama"), sizes: ["S", "M", "L", "XL"], colours: ["Grey", "Navy"], description: "Cosy button-down pyjama set in brushed cotton with an elastic drawstring waist." },
  { id: "p9", name: "Satin Camisole", category: "Camisole", price: 699, stock: 18, image: productPhoto("Camisole"), sizes: ["S", "M", "L", "XL"], colours: ["Black", "White", "Nude"], description: "Smooth satin camisole with adjustable straps. Layer it or wear it on its own." },
  { id: "p10", name: "High-Waist Gym Leggings", category: "Gym Leggings", price: 1099, stock: 14, image: productPhoto("Gym Leggings"), sizes: ["S", "M", "L", "XL"], colours: ["Black", "Charcoal", "Plum"], description: "Squat-proof high-waist leggings with four-way stretch and a hidden waistband pocket.", badge: "Best Seller" },
]);

