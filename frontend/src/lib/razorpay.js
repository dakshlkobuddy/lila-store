/**
 * Razorpay checkout helpers for the Lila & Co. frontend.
 *
 * loadRazorpayScript() — lazy-loads the Razorpay checkout.js SDK.
 *   Safe to call multiple times; only injects the <script> tag once.
 *
 * openRazorpayCheckout(options) — opens the Razorpay payment modal.
 *   Returns a Promise that resolves with { razorpay_payment_id,
 *   razorpay_order_id, razorpay_signature } on success, or rejects
 *   with an Error on cancellation / payment failure.
 */

/**
 * Dynamically injects the Razorpay checkout script into the page.
 * @returns {Promise<boolean>} true if script loaded successfully, false on error.
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    // Already loaded — nothing to do
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;

    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay checkout script");
      resolve(false);
    };

    document.body.appendChild(script);
  });
}

/**
 * Opens the Razorpay payment modal.
 *
 * @param {object} options - Razorpay options object. Required fields:
 *   key        — public key_id (rzp_test_... or rzp_live_...)
 *   amount     — amount in paise (₹1 = 100 paise)
 *   currency   — "INR"
 *   order_id   — Razorpay order ID returned by create-razorpay-order edge fn
 *   name       — merchant/store name shown in the modal
 *   description — short description
 *   prefill    — { name, contact } pre-filled from the checkout form
 *   theme      — { color } brand colour for the modal
 *
 * @returns {Promise<{razorpay_payment_id: string, razorpay_order_id: string, razorpay_signature: string}>}
 *   Resolves with the payment response from Razorpay on success.
 *   Rejects with Error("Payment cancelled") if the user closes the modal.
 *   Rejects with Error(description) if the payment fails.
 */
export function openRazorpayCheckout(options) {
  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      ...options,

      // Called by Razorpay on successful payment
      handler: (response) => resolve(response),

      modal: {
        // Called when the user closes the Razorpay modal without paying
        ondismiss: () => reject(new Error("Payment cancelled")),
      },
    });

    // Called when payment fails inside the modal (e.g., card declined)
    rzp.on("payment.failed", (resp) => {
      reject(
        new Error(
          resp?.error?.description || resp?.error?.reason || "Payment failed"
        )
      );
    });

    rzp.open();
  });
}
