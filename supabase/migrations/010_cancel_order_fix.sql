-- ============================================================
-- 010 — Customer Cancel Order RPC Fix (UUID to TEXT)
-- Fixes the invalid input syntax error for string order IDs.
-- ============================================================

DROP FUNCTION IF EXISTS cancel_order(UUID);

CREATE OR REPLACE FUNCTION cancel_order(p_order_id TEXT)
RETURNS JSONB AS $$
DECLARE
  v_user_id UUID;
  v_current_status text;
  v_owner_id UUID;
BEGIN
  -- Authenticate
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN '{"error": "Not authenticated"}'::jsonb;
  END IF;

  -- Verify order ownership and fetch status
  SELECT status, user_id INTO v_current_status, v_owner_id
  FROM orders WHERE id = p_order_id;

  IF v_current_status IS NULL THEN
    RETURN '{"error": "Order not found"}'::jsonb;
  END IF;

  IF v_owner_id != v_user_id THEN
    RETURN '{"error": "Unauthorized"}'::jsonb;
  END IF;

  IF v_current_status != 'Placed' THEN
    RETURN '{"error": "Only Placed orders can be cancelled. Please contact support."}'::jsonb;
  END IF;

  -- Cancel the order
  UPDATE orders SET status = 'Cancelled' WHERE id = p_order_id;

  RETURN '{"success": true}'::jsonb;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
