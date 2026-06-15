-- Run this in Supabase Dashboard → SQL Editor
-- It adds the ensure_profile() function that auto-creates missing profile rows on login.

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
