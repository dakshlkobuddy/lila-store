# Lila & Co. — Women's Wear Online Store

A full-stack women's wear storefront built with **React + Vite** (frontend), **Supabase** (database + auth + storage), and **Supabase Edge Functions** (backend API). Includes online payments via **Razorpay**.

---

## What's Built

### Customer Features
- **Auth** — Register, login, logout (Supabase Auth). Role-based: admin vs customer detected automatically on sign-in.
- **Product Catalog** — Browse all active products with search, category filters, price range slider, in-stock filter, and sort (featured / price low-high / price high-low).
- **Product Detail Page** — View product description, pick size and colour variants, add to cart.
- **Cart** — Add items, update quantities (capped at stock), remove items. Persists in Supabase DB (not localStorage).
- **Checkout** — Enter shipping details. Choose between:
  - **Cash on Delivery (COD)** — order placed directly via `place_order()` RPC.
  - **Online Payment (Razorpay)** — full payment flow: Razorpay modal → HMAC-SHA256 server-side verification → order placed only after successful payment.
- **Order Confirmation** — Summary of placed order with a WhatsApp share button.
- **My Orders** — View order history with a live status timeline (Pending → Confirmed → Processing → Shipped → Delivered).
- **WhatsApp Button** — Floating button to contact the store directly.
- **Dark Mode** — Toggle dark/light theme, saved to localStorage.
- **Fully Responsive** — Works on mobile, tablet, and desktop.

### Admin Features (Dashboard)
- **Overview tab** — Revenue total, order count, active product count, low/out-of-stock alerts with restock list.
- **Products tab** — Table of all products (active + inactive). Add new products, edit existing ones, deactivate/reactivate with confirm modal. Upload product images (Supabase Storage).
- **Orders tab** — All customer orders with status filter tabs. Change order status via dropdown (Pending → Confirmed → Processing → Shipped → Delivered → Cancelled). See shipping address, phone, and order items inline.

### Backend (Supabase Edge Functions)
| Function | What it does |
|---|---|
| `create-razorpay-order` | Creates a Razorpay order server-side, computes the total from DB prices (never trusts client amounts) |
| `verify-and-place-order` | Verifies Razorpay HMAC-SHA256 signature, then calls `place_order()` RPC with `payment_status = 'paid'` |
| `order-notifications` | Webhook listener for order events (notifications integration) |

### Database (Supabase + PostgreSQL)
| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` — stores name and role (`customer` / `admin`) |
| `products` | Product catalog with sizes, colours, stock, image URL, badge, active flag |
| `orders` | Order header — customer, total, shipping JSON, status, payment info |
| `order_items` | Normalised line items — product snapshot (name + price at time of order) |
| `cart_items` | Per-user cart rows, unique per (user, product, size, colour) |

**Security:**
- Row Level Security (RLS) on all tables.
- `place_order()` is a `SECURITY DEFINER` RPC — clients cannot insert orders directly; only this function can.
- Product prices and totals are always computed server-side; client values are ignored.
- Admin role cannot be changed by the user themselves (RLS `WITH CHECK`).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 8, vanilla CSS-in-JS |
| Icons | Lucide React |
| Backend | Supabase Edge Functions (Deno / TypeScript) |
| Database | Supabase (PostgreSQL) with RLS |
| Auth | Supabase Auth |
| Storage | Supabase Storage (`product-images` bucket) |
| Payments | Razorpay (test + live keys supported) |

---

## Project Structure

```
lila-store/
├── README.md
├── .gitignore
│
├── frontend/                        # React + Vite storefront
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── .env.local                   # Supabase + Razorpay keys (not committed)
│   └── src/
│       ├── main.jsx                 # React entry point
│       ├── index.css                # base reset
│       ├── App.jsx                  # layout + client-side routing
│       ├── constants.js             # BRAND, TAGLINE, WHATSAPP_NUMBER, CATEGORIES
│       ├── store/
│       │   └── useStore.js          # all state + Supabase actions
│       ├── lib/
│       │   ├── supabaseClient.js    # Supabase client init
│       │   ├── razorpay.js          # Razorpay SDK loader + modal wrapper
│       │   ├── format.js            # money, WhatsApp link, order message
│       │   ├── ui.js                # layout helpers (grid, wrap)
│       │   ├── validation.js        # form field validators
│       │   ├── imageValidation.js   # image file type/size checks
│       │   └── storage.js           # Supabase Storage helpers
│       ├── styles/
│       │   └── GlobalStyles.jsx     # design tokens, theme, responsive rules
│       ├── components/
│       │   ├── Header.jsx           # nav bar with cart count + dark mode toggle
│       │   ├── Footer.jsx
│       │   ├── Toast.jsx            # notification toasts
│       │   ├── WhatsAppButton.jsx   # floating WhatsApp CTA
│       │   ├── OrderCard.jsx        # order row with status timeline
│       │   ├── ProductImage.jsx     # image with category-icon fallback
│       │   ├── StockBadge.jsx       # In stock / Low stock / Out of stock
│       │   ├── Stat.jsx             # admin stat card
│       │   ├── Badge.jsx / Pill.jsx / Empty.jsx / FieldError.jsx
│       │   └── forms/
│       │       ├── AuthForm.jsx     # login + register tabs
│       │       ├── CheckoutForm.jsx # shipping fields + COD/Online buttons
│       │       └── ProductForm.jsx  # admin add/edit product with image upload
│       └── pages/
│           ├── HomePage.jsx/.styles.js
│           ├── ProductDetailPage.jsx/.styles.js
│           ├── CartPage.jsx/.styles.js
│           ├── CheckoutPage.jsx/.styles.js
│           ├── ConfirmationPage.jsx/.styles.js
│           ├── OrdersPage.jsx/.styles.js
│           └── AdminPage.jsx/.styles.js
│
├── backend/                         # Supabase Edge Functions (Deno / TypeScript)
│   ├── deno.json
│   └── functions/
│       ├── _shared/
│       │   └── cors.ts              # CORS headers shared by all functions
│       ├── create-razorpay-order/
│       │   └── index.ts
│       ├── verify-and-place-order/
│       │   └── index.ts
│       └── order-notifications/
│           └── index.ts
│
└── supabase/                        # Database (PostgreSQL migrations)
    └── migrations/
        ├── 001_initial_schema.sql   # tables, RLS, indexes, place_order() RPC
        ├── 002_seed_products.sql    # sample products
        ├── 003_ensure_profile.sql   # ensure_profile() RPC (self-heal)
        ├── 004_payment_columns.sql  # payment_status, payment_id columns + updated RPC
        └── 005_notifications_webhook.sql
```

---

## Running Locally

### Prerequisites
- **Node.js 18+** — https://nodejs.org (pick LTS)
- A Supabase project with the migrations applied (see below)

### Setup

```bash
# 1. Install frontend dependencies (first time only)
cd frontend
npm install

# 2. Create .env.local with your keys
# (copy the template below and fill in your values)

# 3. Start the dev server
npm run dev
```

Opens at **http://localhost:5173**

### `.env.local` template
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Razorpay public key — safe in browser
# Use rzp_test_... for testing, rzp_live_... for production
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```

---

## Database Setup (Supabase)

Run all migrations **in order** in the Supabase Dashboard → SQL Editor:

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_seed_products.sql
supabase/migrations/003_ensure_profile.sql
supabase/migrations/004_payment_columns.sql
supabase/migrations/005_notifications_webhook.sql
```

All migrations are idempotent — safe to re-run.

---

## Logging In

| Role | Email | Password |
|---|---|---|
| Admin (store owner) | `admin@store.com` | `admin123` |
| Customer | Register a new account | — |

Admin auto-redirects to the Dashboard on sign-in. Customers see the store.

---

## Customisation

| What to change | Where |
|---|---|
| Store name, tagline | `frontend/src/constants.js` → `BRAND`, `TAGLINE` |
| WhatsApp number | `frontend/src/constants.js` → `WHATSAPP_NUMBER` (format: `91XXXXXXXXXX`) |
| Product categories | `frontend/src/constants.js` → `CATEGORIES` (also update `CAT_STYLE`) |
| Size presets (admin form) | `frontend/src/constants.js` → `SIZE_PRESETS` |
| Global theme (colours, fonts) | `frontend/src/styles/GlobalStyles.jsx` |
| A page's layout | `frontend/src/pages/<Page>.jsx` |
| A page's styles | `frontend/src/pages/<Page>.styles.js` |
| Shared state & actions | `frontend/src/store/useStore.js` |

---

## Build for Production

```bash
cd frontend
npm run build      # outputs to frontend/dist/
npm run preview    # preview the production build locally
```

The `frontend/dist/` folder can be deployed to **Vercel**, **Netlify**, or any static host.
Remember to set the `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_RAZORPAY_KEY_ID` environment variables in your host's dashboard.
