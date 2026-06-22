-- ============================================================
-- Lila & Co. — Migration 005: Order Notifications Webhook
-- Run this in: Supabase Dashboard → SQL Editor
--
-- What this migration does:
--   Creates a Database Webhook trigger on the `orders` table.
--   Whenever an order is INSERTed (new order) or UPDATEd (status change),
--   it securely POSTs the row data to the `order-notifications` Edge Function.
-- ============================================================

DROP TRIGGER IF EXISTS "order_notifications_webhook" ON "public"."orders";

CREATE TRIGGER "order_notifications_webhook"
AFTER INSERT OR UPDATE ON "public"."orders"
FOR EACH ROW
EXECUTE FUNCTION "supabase_functions"."http_request"(
  'http://supabase_kong:8000/functions/v1/order-notifications',
  'POST',
  '{"Content-Type":"application/json"}',
  '{}',
  '5000'
);

COMMENT ON TRIGGER "order_notifications_webhook" ON "public"."orders" IS
  'Fires order-notifications Edge Function for Email/SMS/WhatsApp on new orders and status updates.';
