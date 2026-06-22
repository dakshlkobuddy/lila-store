-- ============================================================
-- Lila & Co. — Migration 004: Payment columns + updated place_order()
-- Run this in: Supabase Dashboard → SQL Editor
--
-- What this migration does:
--   1. Adds 3 new columns to orders (payment_status, payment_id, razorpay_order_id)
--   2. Recreates place_order() with 3 optional payment params (all have defaults
--      so existing COD calls without those args still work unchanged)
-- ============================================================

-- ── 1. ADD PAYMENT COLUMNS TO orders ─────────────────────────

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_status TEXT NOT NULL DEFAULT 'cod'
    CHECK (payment_status IN ('cod', 'pending', 'paid', 'failed', 'refunded')),
  ADD COLUMN IF NOT EXISTS payment_id TEXT,
  ADD COLUMN IF NOT EXISTS razorpay_order_id TEXT;

COMMENT ON COLUMN orders.payment_status IS
  'cod = cash on delivery; pending = Razorpay order created, not yet paid;
   paid = Razorpay payment verified server-side; failed = payment failed;
   refunded = refund issued.';

COMMENT ON COLUMN orders.payment_id IS
  'Razorpay razorpay_payment_id returned after successful payment. NULL for COD orders.';

COMMENT ON COLUMN orders.razorpay_order_id IS
  'Razorpay order ID (rzp_order_...) returned by /v1/orders API. NULL for COD orders.';

-- ── 2. UPDATE place_order() — add optional payment params ─────
--
-- SECURITY notes (unchanged from original):
--   • SECURITY DEFINER — bypasses RLS for INSERT into orders / order_items
--   • Validates auth.uid() — rejects unauthenticated callers
--   • Product name + price always read from DB, never trusted from client
--   • Total computed server-side as SUM(price * qty)
--   • SELECT ... FOR UPDATE locks rows and validates stock atomically
--
-- NEW: p_payment_status, p_payment_id, p_razorpay_order_id are optional.
--   • Default p_payment_status = 'cod' → existing COD calls need no changes.
--   • verify-and-place-order Edge Function passes p_payment_status = 'paid'
--     only AFTER cryptographic signature verification succeeds.

CREATE OR REPLACE FUNCTION place_order(
  p_order_id           TEXT,
  p_items              JSONB,        -- [{product_id, quantity, size, colour}, ...]
  p_shipping           JSONB,
  p_payment_status     TEXT DEFAULT 'cod',
  p_payment_id         TEXT DEFAULT NULL,
  p_razorpay_order_id  TEXT DEFAULT NULL
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

  -- Validate payment_status value
  IF p_payment_status NOT IN ('cod', 'pending', 'paid', 'failed', 'refunded') THEN
    RAISE EXCEPTION 'Invalid payment_status: %', p_payment_status;
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

  -- STEP 2: Create order (total + payment info stored server-side)
  INSERT INTO orders (
    id, user_id, customer_name, total, shipping,
    payment_status, payment_id, razorpay_order_id
  )
  VALUES (
    p_order_id, v_user_id, v_customer_name, v_total, p_shipping,
    p_payment_status, p_payment_id, p_razorpay_order_id
  );

  -- STEP 3: Insert order items (name + price from DB) + decrement stock
  FOR item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_product_id := (item->>'product_id')::UUID;
    v_qty        := (item->>'quantity')::INTEGER;

    -- Re-read the product to get the authoritative name + price for the snapshot
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
    'success',        TRUE,
    'order_id',       p_order_id,
    'total',          v_total,
    'customer_name',  v_customer_name,
    'payment_status', p_payment_status
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
