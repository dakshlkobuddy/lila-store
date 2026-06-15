-- ============================================================
-- Lila & Co. — Supabase Schema Migration (IDEMPOTENT)
-- Run this in: Supabase Dashboard → SQL Editor
--
-- Safe to re-run on an existing database:
--   • CREATE TABLE ... IF NOT EXISTS
--   • DROP POLICY/TRIGGER IF EXISTS before CREATE
--   • CREATE INDEX IF NOT EXISTS
--   • CREATE OR REPLACE FUNCTION
-- ============================================================

-- ── 1. ENUM ──────────────────────────────────────────────────
-- ENUMs don't support IF NOT EXISTS, so we guard with a DO block.
-- NOTE: If you later need to add a status, use:
--   ALTER TYPE order_status ADD VALUE 'NewStatus' AFTER 'Delivered';
-- You cannot rename or remove ENUM values without recreating the type.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM (
      'Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'
    );
  END IF;
END $$;

-- ── 2. HELPER: auto-update updated_at ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 3. TABLES ────────────────────────────────────────────────

-- profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  role       TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- products
CREATE TABLE IF NOT EXISTS products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  category    TEXT NOT NULL,
  price       NUMERIC(10,2) NOT NULL CHECK (price > 0),
  stock       INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  image_url   TEXT,
  sizes       TEXT[] DEFAULT '{}',
  colours     TEXT[] DEFAULT '{}',
  description TEXT DEFAULT '',
  badge       TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id            TEXT PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES profiles(id),
  customer_name TEXT NOT NULL,
  total         NUMERIC(10,2) NOT NULL,
  status        order_status NOT NULL DEFAULT 'Pending',
  shipping      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_orders_updated_at ON orders;
CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- order_items (normalised — replaces JSONB items)
CREATE TABLE IF NOT EXISTS order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  price        NUMERIC(10,2) NOT NULL,
  quantity     INTEGER NOT NULL CHECK (quantity > 0),
  size         TEXT NOT NULL DEFAULT '',
  colour       TEXT NOT NULL DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_order_items_updated_at ON order_items;
CREATE TRIGGER trg_order_items_updated_at
  BEFORE UPDATE ON order_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- cart_items
CREATE TABLE IF NOT EXISTS cart_items (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size       TEXT NOT NULL DEFAULT '',
  colour     TEXT NOT NULL DEFAULT '',
  qty        INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id, size, colour)
);

ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON cart_items;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── 4. INDEXES ───────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_products_is_active  ON products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_category   ON products (category);

CREATE INDEX IF NOT EXISTS idx_orders_user_id      ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id   ON order_items (order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items (product_id);

CREATE INDEX IF NOT EXISTS idx_cart_items_user_id    ON cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items (product_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles (role);

-- ── 5. AUTH TRIGGER: auto-create profile on signup ───────────

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', 'User'),
    'customer'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ── 5b. RPC: ensure_profile (self-heal missing profiles) ─────
-- Called by the frontend on login. If the user was created before
-- the trigger existed, or the public schema was reset while
-- auth.users persisted, this creates the missing profile row.
-- Returns the profile row (existing or newly created).

CREATE OR REPLACE FUNCTION ensure_profile()
RETURNS JSONB AS $$
DECLARE
  v_uid  UUID;
  v_name TEXT;
  v_row  profiles;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Try to find existing profile
  SELECT * INTO v_row FROM profiles WHERE id = v_uid;

  IF v_row.id IS NOT NULL THEN
    RETURN jsonb_build_object(
      'id', v_row.id, 'name', v_row.name,
      'role', v_row.role, 'created_at', v_row.created_at,
      'updated_at', v_row.updated_at
    );
  END IF;

  -- Profile missing — create from auth.users metadata
  SELECT COALESCE(raw_user_meta_data->>'name', 'User')
  INTO v_name
  FROM auth.users WHERE id = v_uid;

  INSERT INTO profiles (id, name, role)
  VALUES (v_uid, COALESCE(v_name, 'User'), 'customer')
  ON CONFLICT (id) DO NOTHING;

  SELECT * INTO v_row FROM profiles WHERE id = v_uid;

  RETURN jsonb_build_object(
    'id', v_row.id, 'name', v_row.name,
    'role', v_row.role, 'created_at', v_row.created_at,
    'updated_at', v_row.updated_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 6. RPC: place_order (atomic + stock validation) ──────────
-- SECURITY:
--   • SECURITY DEFINER — bypasses RLS (needed since orders/order_items
--     have NO direct INSERT policies for clients)
--   • Validates auth.uid() is not null (rejects anonymous callers)
--   • Reads product name + price from the products table (never trusts client)
--   • Computes the order total SERVER-SIDE as SUM(price * qty)
--   • Uses SELECT ... FOR UPDATE to lock product rows and validate stock

CREATE OR REPLACE FUNCTION place_order(
  p_order_id      TEXT,
  p_items         JSONB,       -- [{product_id, quantity, size, colour}, ...]
  p_shipping      JSONB
)
RETURNS JSONB AS $$
DECLARE
  v_user_id       UUID;
  v_customer_name TEXT;
  v_total         NUMERIC(10,2) := 0;
  item            JSONB;
  v_product_id    UUID;
  v_qty           INTEGER;
  v_stock         INTEGER;
  v_product_name  TEXT;
  v_product_price NUMERIC(10,2);
BEGIN
  -- STEP 0: Authenticate — reject if not signed in
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Look up the customer's display name from their profile
  SELECT name INTO v_customer_name
  FROM profiles
  WHERE id = v_user_id;

  IF v_customer_name IS NULL THEN
    RAISE EXCEPTION 'Profile not found for current user';
  END IF;

  -- STEP 1: Validate stock for every item (with row-level locks)
  --         and compute server-side total
  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (item->>'product_id')::UUID;
    v_qty        := (item->>'quantity')::INTEGER;

    IF v_qty IS NULL OR v_qty <= 0 THEN
      RAISE EXCEPTION 'Invalid quantity for product %', v_product_id;
    END IF;

    -- Lock the product row and read authoritative name + price
    SELECT stock, name, price
    INTO   v_stock, v_product_name, v_product_price
    FROM   products
    WHERE  id = v_product_id
      AND  is_active = TRUE
    FOR UPDATE;

    IF v_stock IS NULL THEN
      RAISE EXCEPTION 'Product "%" is no longer available', v_product_id;
    END IF;

    IF v_stock < v_qty THEN
      RAISE EXCEPTION 'Insufficient stock for "%": requested %, available %',
        v_product_name, v_qty, v_stock;
    END IF;

    -- Accumulate server-computed total
    v_total := v_total + (v_product_price * v_qty);
  END LOOP;

  -- STEP 2: Create order (total computed server-side)
  INSERT INTO orders (id, user_id, customer_name, total, shipping)
  VALUES (p_order_id, v_user_id, v_customer_name, v_total, p_shipping);

  -- STEP 3: Insert order items (name + price from DB) + decrement stock
  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (item->>'product_id')::UUID;
    v_qty        := (item->>'quantity')::INTEGER;

    -- Re-read the product to get the authoritative name + price for snapshot
    SELECT name, price INTO v_product_name, v_product_price
    FROM products WHERE id = v_product_id;

    INSERT INTO order_items (order_id, product_id, product_name, price, quantity, size, colour)
    VALUES (
      p_order_id,
      v_product_id,
      v_product_name,
      v_product_price,
      v_qty,
      COALESCE(item->>'size', ''),
      COALESCE(item->>'colour', '')
    );

    UPDATE products
    SET stock = stock - v_qty
    WHERE id = v_product_id;
  END LOOP;

  -- STEP 4: Clear user's cart
  DELETE FROM cart_items WHERE user_id = v_user_id;

  RETURN jsonb_build_object(
    'success', TRUE,
    'order_id', p_order_id,
    'total', v_total,
    'customer_name', v_customer_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ── 7. ROW-LEVEL SECURITY POLICIES ──────────────────────────
-- All policies are idempotent: DROP IF EXISTS then CREATE.

-- Helper: check if current user is admin (SECURITY DEFINER prevents
-- infinite recursion when called from within profiles RLS policies)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── profiles ──
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

-- Users can update their OWN profile but CANNOT change their role.
-- The WITH CHECK ensures role stays the same as the current DB value.
DROP POLICY IF EXISTS "Users can update own name" ON profiles;
CREATE POLICY "Users can update own name"
  ON profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM profiles p WHERE p.id = auth.uid())
  );

-- ── products ──
-- Public can only see ACTIVE products; admins can see all (including deactivated)
DROP POLICY IF EXISTS "Anyone can view products" ON products;
CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  USING (is_active = TRUE OR is_admin());

DROP POLICY IF EXISTS "Admin can insert products" ON products;
CREATE POLICY "Admin can insert products"
  ON products FOR INSERT
  WITH CHECK (is_admin());

DROP POLICY IF EXISTS "Admin can update products" ON products;
CREATE POLICY "Admin can update products"
  ON products FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- No DELETE policy — soft-delete only via UPDATE is_active

-- ── orders ──
-- Customers see own orders; admins see all. NO INSERT policy —
-- the ONLY way to create orders is the place_order() RPC (SECURITY DEFINER).
DROP POLICY IF EXISTS "Users can view own orders" ON orders;
CREATE POLICY "Users can view own orders"
  ON orders FOR SELECT
  USING (user_id = auth.uid() OR is_admin());

-- *** REMOVED: "Authenticated can insert orders" — this was a security hole ***
-- Clients must use place_order() RPC which runs as SECURITY DEFINER.
DROP POLICY IF EXISTS "Authenticated can insert orders" ON orders;

DROP POLICY IF EXISTS "Admin can update orders" ON orders;
CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  USING (is_admin())
  WITH CHECK (is_admin());

-- ── order_items ──
-- SELECT: only if the parent order is visible to the user
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND (orders.user_id = auth.uid() OR is_admin())
    )
  );

-- *** REMOVED: "Authenticated can insert order items" — this was a security hole ***
-- Order items are inserted ONLY by place_order() (SECURITY DEFINER).
DROP POLICY IF EXISTS "Authenticated can insert order items" ON order_items;

-- ── cart_items ──
DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
CREATE POLICY "Users can view own cart"
  ON cart_items FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can add to own cart" ON cart_items;
CREATE POLICY "Users can add to own cart"
  ON cart_items FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own cart" ON cart_items;
CREATE POLICY "Users can update own cart"
  ON cart_items FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete from own cart" ON cart_items;
CREATE POLICY "Users can delete from own cart"
  ON cart_items FOR DELETE
  USING (user_id = auth.uid());

-- ── 8. STORAGE BUCKET ───────────────────────────────────────
-- Create the product-images bucket (public read)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies: anyone can read, admin can upload/update/delete
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Admin can upload product images" ON storage.objects;
CREATE POLICY "Admin can upload product images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "Admin can update product images" ON storage.objects;
CREATE POLICY "Admin can update product images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'product-images' AND is_admin())
  WITH CHECK (bucket_id = 'product-images' AND is_admin());

DROP POLICY IF EXISTS "Admin can delete product images" ON storage.objects;
CREATE POLICY "Admin can delete product images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'product-images' AND is_admin());
