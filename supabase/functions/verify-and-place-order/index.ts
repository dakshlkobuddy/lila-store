// @ts-nocheck — Deno Edge Function: VS Code uses Node.js TS, not Deno.
// These red squiggles are IDE-only; the function works fine on Supabase.
/**
 * Edge Function: verify-and-place-order
 *
 * Called by the frontend AFTER Razorpay returns a successful payment response.
 *
 * What it does (server-side, cryptographic — cannot be faked from the browser):
 *   1. Validates the caller's JWT → gets auth.uid()
 *   2. Verifies the Razorpay payment signature using HMAC-SHA256 and the
 *      secret key stored as a Supabase secret (never exposed to the client).
 *      Formula: HMAC-SHA256(KEY_SECRET, razorpay_order_id + "|" + razorpay_payment_id)
 *      If the hex digest doesn't match razorpay_signature → 400, order NOT created.
 *   3. Only if valid: calls place_order() RPC with p_payment_status = 'paid'.
 *      The RPC uses the user's JWT so auth.uid() works inside it, applies stock
 *      locks, and inserts the order row atomically.
 *   4. Returns the RPC result: { success, order_id, total, customer_name, payment_status }
 *
 * Required Supabase secrets (same as create-razorpay-order):
 *   RAZORPAY_KEY_SECRET
 *
 * Request body:
 *   {
 *     razorpay_payment_id: string,   // e.g. "pay_XXXXXXXXXXXXXXXX"
 *     razorpay_order_id:   string,   // e.g. "order_XXXXXXXXXXXXXXXX"
 *     razorpay_signature:  string,   // hex-encoded HMAC from Razorpay
 *     internal_order_id:   string,   // "ORD-..." returned by create-razorpay-order
 *     items:               Array,    // same items array sent to create-razorpay-order
 *     shipping:            object,   // { name, phone, address, city, state, pincode }
 *   }
 * Auth header: Authorization: Bearer <supabase_user_jwt>
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, handleCors, jsonResponse } from "../_shared/cors.ts";

/**
 * Verifies the Razorpay payment signature using the Web Crypto API (built into Deno).
 * No external library needed.
 *
 * Razorpay signing formula:
 *   signature = HMAC-SHA256(key_secret, razorpay_order_id + "|" + razorpay_payment_id)
 */
async function verifyRazorpaySignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const message = `${razorpayOrderId}|${razorpayPaymentId}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(message)
  );

  // Convert ArrayBuffer → lowercase hex string
  const hexSig = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison is not strictly necessary here (Deno doesn't have
  // timingSafeEqual for strings), but the signature is already a public value
  // that Razorpay generates — what matters is we compute it server-side.
  return hexSig === signature;
}

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

    // Use the user's JWT for the supabase client so place_order() RPC
    // receives the correct auth.uid() context.
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

    // ── 2. Parse request body ────────────────────────────────
    let body: {
      razorpay_payment_id?: string;
      razorpay_order_id?: string;
      razorpay_signature?: string;
      internal_order_id?: string;
      items?: unknown[];
      shipping?: unknown;
    };

    try {
      body = await req.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON body" }, 400);
    }

    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      internal_order_id,
      items,
      shipping,
    } = body;

    // Validate all required fields are present
    if (
      !razorpay_payment_id ||
      !razorpay_order_id ||
      !razorpay_signature ||
      !internal_order_id ||
      !items ||
      !shipping
    ) {
      return jsonResponse(
        {
          error:
            "Missing required fields: razorpay_payment_id, razorpay_order_id, " +
            "razorpay_signature, internal_order_id, items, shipping",
        },
        400
      );
    }

    // ── 3. Cryptographic signature verification ──────────────
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    if (!keySecret || !keyId) {
      console.error("RAZORPAY credentials env vars not set");
      return jsonResponse({ error: "Payment gateway not configured" }, 500);
    }

    const isValid = await verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      keySecret
    );

    if (!isValid) {
      // Log for fraud monitoring, but don't expose details to the caller
      console.warn(
        `Signature mismatch for internal_order_id=${internal_order_id} ` +
          `user_id=${user.id} razorpay_order_id=${razorpay_order_id}`
      );
      return jsonResponse(
        {
          error:
            "Payment verification failed. Your payment has NOT been captured. " +
            "Please contact support with your Razorpay payment ID.",
        },
        400
      );
    }

    // ── 4. Place the order via place_order() RPC ─────────────
    // Signature verified → safe to create the order with payment_status = 'paid'.
    // The RPC runs as SECURITY DEFINER but uses the user's JWT so auth.uid()
    // resolves to the correct user, applies stock locks, and clears the cart.
    const { data: rpcData, error: rpcError } = await supabase.rpc("place_order", {
      p_order_id:          internal_order_id,
      p_items:             items,
      p_shipping:          shipping,
      p_payment_status:    "paid",
      p_payment_id:        razorpay_payment_id,
      p_razorpay_order_id: razorpay_order_id,
    });

    if (rpcError) {
      // This can happen if stock ran out in the window between create-razorpay-order
      // and the user completing payment. Very rare but must be handled.
      console.error("place_order RPC error after verified payment:", rpcError, {
        internal_order_id,
        razorpay_payment_id,
        user_id: user.id,
      });

      // ── Attempt Automatic Refund ─────────────────────────────
      try {
        const authStr = "Basic " + btoa(`${keyId}:${keySecret}`);
        const refundRes = await fetch(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}/refund`, {
          method: "POST",
          headers: {
            "Authorization": authStr,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({}) // empty body triggers a full refund
        });

        if (refundRes.ok) {
          console.log(`Successfully auto-refunded payment ${razorpay_payment_id}`);
          return jsonResponse({
            error: "Order could not be placed due to stock running out. Your payment has been automatically refunded and will reflect in your account in 5-7 business days."
          }, 400);
        } else {
          const refundData = await refundRes.text();
          console.error("Razorpay Auto-Refund Failed:", refundData);
        }
      } catch (refundErr) {
        console.error("Razorpay Auto-Refund Exception:", refundErr);
      }

      // Fallback if auto-refund fails or throws
      return jsonResponse(
        {
          error:
            rpcError.message ||
            "Order could not be placed after payment. Please contact support immediately " +
            "with your payment ID — your money is safe.",
        },
        400
      );
    }

    // ── 5. Return the result ─────────────────────────────────
    return jsonResponse(rpcData);
  } catch (err) {
    console.error("verify-and-place-order unhandled error:", err);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
