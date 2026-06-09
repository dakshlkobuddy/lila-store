# Lila &amp; Co. — Women's Wear Online Store

React + Vite women's wear storefront with cart, checkout, admin dashboard, and order management.

A working storefront + admin dashboard prototype, built with **React + Vite**.
Single login (admin or customer), product catalog with size/colour options,
cart, checkout, order management, photo upload, filters, WhatsApp ordering,
and form validation.

---

## 1. What you need first (one-time setup)

Install **Node.js** (version 18 or newer). Download it from:
https://nodejs.org  → pick the **LTS** version and install.

To check it worked, open a terminal and run:

```bash
node -v
npm -v
```

You should see version numbers.

(Optional but recommended) Install **VS Code**: https://code.visualstudio.com

---

## 2. Open and run the project

1. Unzip this folder somewhere you'll find it (e.g. Desktop).
2. Open the folder in VS Code: **File → Open Folder…** → choose the `lila-store` folder.
3. Open the built-in terminal: **Terminal → New Terminal**.
4. Install the dependencies (only needed the first time):

   ```bash
   npm install
   ```

5. Start the app:

   ```bash
   npm run dev
   ```

6. Your browser will open at **http://localhost:5173** automatically.
   (If not, hold Ctrl/Cmd and click the link shown in the terminal.)

To stop the app, click in the terminal and press **Ctrl + C**.

---

## 3. Logging in

There is **one login page**. It detects the role from the account:

- **Admin (store owner):**  `admin@store.com`  /  `admin123`
  → opens the Dashboard (add/edit/delete products, manage orders, see stats).
- **Customer:** click **Create an account**, register, then sign in
  → browse products, add to cart, and place orders.

---

## 4. Useful things to know

- **Data is saved in your browser** (localStorage). It stays after refresh on the
  same browser/computer. Clearing browser data, or opening in a different browser,
  starts fresh.
- **Reset the demo data:** Admin Dashboard → top-right **"Reset demo data"**.
- **WhatsApp number:** open `src/App.jsx` and change the line
  `const WHATSAPP_NUMBER = "919580023800";` to your number
  (country code + number, no `+`, no spaces).
- **Store name / tagline / categories:** also near the top of `src/App.jsx`
  (`BRAND`, `TAGLINE`, `CATEGORIES`).

---

## 5. Build for hosting later

```bash
npm run build      # creates an optimized site in the /dist folder
npm run preview    # preview that build locally
```

The `/dist` folder can be uploaded to any static host (Netlify, Vercel, etc.).

---

## 6. Project structure

Everything is split into small, focused files so each part is easy to find and debug.

```
lila-store/
├─ index.html              # page shell
├─ package.json            # dependencies & scripts
├─ vite.config.js          # build/dev config
└─ src/
   ├─ main.jsx             # React entry point
   ├─ index.css            # base styles
   ├─ App.jsx              # layout + routing (decides which page shows)
   ├─ constants.js         # ⭐ brand, categories, WhatsApp number, colours
   │
   ├─ store/
   │  └─ useStore.js       # ⭐ ALL shared logic & data (state + actions)
   │
   ├─ data/
   │  └─ seed.js           # starter products + placeholder illustrations
   │
   ├─ lib/                 # small helpers
   │  ├─ storage.js        # save/load (localStorage)
   │  ├─ validation.js     # email / phone / PIN checks
   │  ├─ format.js         # ₹ money + WhatsApp message text
   │  └─ ui.js             # layout style helpers
   │
   ├─ styles/
   │  └─ GlobalStyles.jsx  # ⭐ all CSS (theme colours, buttons, responsive)
   │
   ├─ components/          # reusable UI pieces
   │  ├─ Header.jsx  Footer.jsx  Toast.jsx  WhatsAppButton.jsx
   │  ├─ ProductImage.jsx  StockBadge.jsx  Badge.jsx  Empty.jsx
   │  ├─ Stat.jsx  OrderCard.jsx  Pill.jsx  FieldError.jsx
   │  └─ forms/
   │     ├─ AuthForm.jsx       # login / register
   │     ├─ ProductForm.jsx    # admin add/edit product
   │     └─ CheckoutForm.jsx   # shipping details
   │
   └─ pages/               # one file per screen + its own styles
      ├─ HomePage.jsx / HomePage.styles.js           # storefront grid + filters
      ├─ ProductDetailPage.jsx / .styles.js          # single product + size/colour
      ├─ CartPage.jsx / .styles.js
      ├─ CheckoutPage.jsx / .styles.js
      ├─ OrdersPage.jsx / .styles.js
      ├─ ConfirmationPage.jsx / .styles.js
      └─ AdminPage.jsx / .styles.js                  # dashboard: overview / products / orders
```

### Where to change things (quick guide)

- **Store name, categories, WhatsApp number, colours** → `src/constants.js`
- **A page's layout/markup & behaviour** → `src/pages/<Page>.jsx`
- **A page's own styling** → `src/pages/<Page>.styles.js` (each page has one)
- **Shared logic** (cart, login, orders, saving data) → `src/store/useStore.js`
- **Global theme** (colour variables, fonts, button styles, mobile rules) → `src/styles/GlobalStyles.jsx`
- **Starter products** → `src/data/seed.js` (then bump `SEED_VERSION` in `constants.js`)

Each page imports its styles as `s` (e.g. `style={s.heading}`), so the markup
stays clean and all of a page's styling lives in one place next to it.


---

## Note — this is a prototype

This runs fully in the browser and is great for trying the experience and showing
it to others. For a **real, live business** you'll later want a backend for:

- secure logins / hashed passwords,
- a shared product database so all customers see the same catalog and photos,
- online payments (Razorpay / UPI / cards),
- and automatic email / SMS order confirmations.

The current code maps cleanly onto a Next.js + database + payments version when
you're ready to take it live.
