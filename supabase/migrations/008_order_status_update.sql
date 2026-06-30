-- ============================================================
-- Lila & Co. — Migration 008: Order Status Update
-- Run this in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Add new enum values
-- (Supabase SQL editor runs each statement. We add them if they don't exist)
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Placed' BEFORE 'Pending';
ALTER TYPE order_status ADD VALUE IF NOT EXISTS 'Out for Delivery' BEFORE 'Delivered';

-- 2. Update default value for new orders to 'Placed'
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'Placed';

-- 3. Migrate existing orders to the new simplified statuses
UPDATE orders SET status = 'Placed' WHERE status IN ('Pending', 'Confirmed', 'Processing');
