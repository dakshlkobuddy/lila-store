-- ============================================================
-- 007 — Wishlist, Reviews & Ratings
-- Safe to re-run (idempotent).
-- ============================================================

-- ── 1. Wishlists table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS wishlists (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE wishlists ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON wishlists (user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_product_id ON wishlists (product_id);

GRANT ALL ON TABLE wishlists TO authenticated;
GRANT ALL ON TABLE wishlists TO service_role;

DROP POLICY IF EXISTS "Users can view own wishlists" ON wishlists;
CREATE POLICY "Users can view own wishlists"
  ON wishlists FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own wishlists" ON wishlists;
CREATE POLICY "Users can insert own wishlists"
  ON wishlists FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own wishlists" ON wishlists;
CREATE POLICY "Users can delete own wishlists"
  ON wishlists FOR DELETE
  USING (user_id = auth.uid());

-- ── 2. Add stats to products ────────────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'rating_avg'
  ) THEN
    ALTER TABLE products ADD COLUMN rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0;
    ALTER TABLE products ADD COLUMN review_count INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- ── 3. Reviews table ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reviews (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  rating     INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment    TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, product_id)
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_reviews_updated_at ON reviews;
CREATE TRIGGER trg_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews (product_id);

GRANT ALL ON TABLE reviews TO authenticated;
GRANT ALL ON TABLE reviews TO anon;
GRANT ALL ON TABLE reviews TO service_role;

-- Helper function: Check if user has purchased a product
CREATE OR REPLACE FUNCTION has_purchased(uid UUID, pid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    WHERE o.user_id = uid AND oi.product_id = pid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
DROP POLICY IF EXISTS "Anyone can view reviews" ON reviews;
CREATE POLICY "Anyone can view reviews"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert review if purchased" ON reviews;
CREATE POLICY "Users can insert review if purchased"
  ON reviews FOR INSERT
  WITH CHECK (user_id = auth.uid() AND has_purchased(auth.uid(), product_id));

DROP POLICY IF EXISTS "Users can update own reviews" ON reviews;
CREATE POLICY "Users can update own reviews"
  ON reviews FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own reviews" ON reviews;
CREATE POLICY "Users can delete own reviews"
  ON reviews FOR DELETE
  USING (user_id = auth.uid());

-- ── 4. Trigger to update product stats ──────────────────────
CREATE OR REPLACE FUNCTION update_product_review_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE products
    SET rating_avg = (
          SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)
          FROM reviews WHERE product_id = NEW.product_id
        ),
        review_count = (
          SELECT COUNT(*)
          FROM reviews WHERE product_id = NEW.product_id
        )
    WHERE id = NEW.product_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE products
    SET rating_avg = (
          SELECT COALESCE(ROUND(AVG(rating)::NUMERIC, 2), 0)
          FROM reviews WHERE product_id = OLD.product_id
        ),
        review_count = (
          SELECT COUNT(*)
          FROM reviews WHERE product_id = OLD.product_id
        )
    WHERE id = OLD.product_id;
  END IF;
  RETURN NULL; -- AFTER trigger
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_product_stats ON reviews;
CREATE TRIGGER trg_update_product_stats
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_product_review_stats();
