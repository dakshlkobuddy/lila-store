// @ts-nocheck — Deno Edge Function: VS Code uses Node.js TS, not Deno.
// These red squiggles are IDE-only; the function works fine on Supabase.
/**
 * Edge Function: create-razorpay-order
 *
 * Called by the frontend BEFORE opening the Razorpay modal.
 *
 * What it does (server-side, secret key never leaves this function):
 *   1. Validates the caller's JWT → gets auth.uid()
 *   2. Queries the DB for each product's authoritative price + stock
 *   3. Computes the total in paise (₹1 = 100 paise) — never trusts client amount
 *   4. Validates stock availability
 *   5. Generates a collision-safe internal order ID
 *   6. Calls the Razorpay /v1/orders API using the secret key (env var)
 *   7. Returns { internal_order_id, razorpay_order_id, amount_paise, key_id }
 *      — the KEY_ID (public) is safe to return; KEY_SECRET never leaves this fn
 *
 * Required Supabase secrets (Dashboard → Edge Functions → Secrets):
 *   RAZORPAY_KEY_ID     e.g.  rzp_test_XXXXXXXXXXXXXXXX
 *   RAZORPAY_KEY_SECRET e.g.  xxxxxxxxxxxxxxxxxxxxxxxx
 *
 * Request body: { items: [{ product_id, quantity, size?, colour? }] }
 * Auth header:  Authorization: Bearer <supabase_user_jwt>
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  const preflight = handleCors(req);
  if (preflight) return preflight;

  try {
    // ── 1. Authenticate ──────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing Authorization header" }, 401);
    }

    // Use the user's JWT so Supabase RLS applies when querying products
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    // ── 2. Parse + validate request body ────────────────────
    let body: { items?: Array<{ product_id: string; quantity: number; size?: string; colour?: string }> };
    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const { items } = body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return jsonResponse({ error: "items array is required and must not be empty" }, 400);
    }

    // ── 3. Compute total server-side from authoritative DB prices ──
    let totalPaise = 0;

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0) {
        return jsonResponse(
          { error: `Invalid item: product_id and positive quantity are required` },
          400
        );
      }

      const { data: product, error: productError } = await supabase
        .from("products")
        .select("name, price, stock, is_active")
        .eq("id", item.product_id)
        .eq("is_active", true)
        .single();

      if (productError || !product) {
        return jsonResponse(
          { error: `Product not available (id: ${item.product_id})` },
          400
        );
      }

      if (product.stock < item.quantity) {
        return jsonResponse(
          {
            error: `Insufficient stock for "${product.name}". Requested: ${item.quantity}, available: ${product.stock}`,
          },
          400
        );
      }

      // Multiply price (₹) × 100 to get paise, then × quantity
      // Math.round prevents floating-point drift (e.g. ₹499 × 100 = 49900.000...001)
      totalPaise += Math.round(Number(product.price) * 100) * item.quantity;
    }

    if (totalPaise <= 0) {
      return jsonResponse({ error: "Computed total is zero or negative" }, 400);
    }

    // ── 4. Generate a collision-safe internal order ID ───────
    // base-36 timestamp (shorter than decimal) + 4 random chars
    const ts = Date.now().toString(36).toUpperCase();
    const rnd = crypto.randomUUID().replace(/-/g, "").slice(0, 5).toUpperCase();
    const internalOrderId = `ORD-${ts}-${rnd}`;

    // ── 5. Create Razorpay order ─────────────────────────────
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      console.error("RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET env vars not set");
      return jsonResponse({ error: "Payment gateway not configured" }, 500);
    }

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        // Basic Auth: base64(key_id:key_secret)
        Authorization: "Basic " + btoa(`${keyId}:${keySecret}`),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalPaise,
        currency: "INR",
        receipt: internalOrderId,          // shown in Razorpay dashboard
        notes: {
          internal_order_id: internalOrderId,
          user_id: user.id,
        },
      }),
    });

    const rzpOrder = await rzpResponse.json();

    if (!rzpResponse.ok) {
      console.error("Razorpay API error:", rzpOrder);
      return jsonResponse(
        {
          error:
            rzpOrder?.error?.description ||
            "Payment gateway error. Please try again.",
        },
        502
      );
    }

    // ── 6. Return only what the frontend needs ───────────────
    // KEY_SECRET is never included in the response.
    return jsonResponse({
      internal_order_id: internalOrderId,
      razorpay_order_id: rzpOrder.id,   // rzp_order_XXXXXXXXXXXXXXXX
      amount_paise: totalPaise,
      key_id: keyId,                    // safe: this is the public key
    });
  } catch (err) {
    console.error("create-razorpay-order unhandled error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
