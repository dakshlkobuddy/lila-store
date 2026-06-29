-- ============================================================
-- 006 — Profile Management: phone column + addresses table
-- Safe to re-run (idempotent).
-- ============================================================

-- ── 1. Add phone column to profiles ─────────────────────────
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'phone'
  ) THEN
    ALTER TABLE profiles ADD COLUMN phone TEXT;
  END IF;
END $$;

-- ── 2. Addresses table ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS addresses (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  label      TEXT NOT NULL DEFAULT 'Home',
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  address    TEXT NOT NULL,
  city       TEXT NOT NULL,
  state      TEXT NOT NULL,
  pincode    TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE addresses ENABLE ROW LEVEL SECURITY;

DROP TRIGGER IF EXISTS trg_addresses_updated_at ON addresses;
CREATE TRIGGER trg_addresses_updated_at
  BEFORE UPDATE ON addresses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses (user_id);

GRANT ALL ON TABLE addresses TO authenticated;
GRANT ALL ON TABLE addresses TO service_role;

-- ── 3. RLS policies for addresses ───────────────────────────
DROP POLICY IF EXISTS "Users can view own addresses" ON addresses;
CREATE POLICY "Users can view own addresses"
  ON addresses FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own addresses" ON addresses;
CREATE POLICY "Users can insert own addresses"
  ON addresses FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own addresses" ON addresses;
CREATE POLICY "Users can update own addresses"
  ON addresses FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own addresses" ON addresses;
CREATE POLICY "Users can delete own addresses"
  ON addresses FOR DELETE
  USING (user_id = auth.uid());

-- ── 4. Update ensure_profile() to include phone ─────────────
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
      'role', v_row.role, 'phone', v_row.phone,
      'created_at', v_row.created_at,
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
    'role', v_row.role, 'phone', v_row.phone,
    'created_at', v_row.created_at,
    'updated_at', v_row.updated_at
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
