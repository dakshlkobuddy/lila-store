// @ts-nocheck — Deno Edge Function
/**
 * Edge Function: order-notifications
 *
 * Triggered by a Supabase Database Webhook on the `orders` table.
 * 
 * Flow:
 * 1. INSERT (New Order): Sends Order Confirmation Email, SMS, and Admin WhatsApp.
 * 2. UPDATE (Status Change): If status changed to Shipped/Delivered, sends update Email & SMS.
 * 
 * Required Secrets:
 * - RESEND_API_KEY
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_PHONE_NUMBER (e.g., +1234567890)
 * - ADMIN_WHATSAPP_NUMBER (e.g., +919876543210)
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Utility to send Email via Resend
async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  if (!RESEND_API_KEY) return { error: "RESEND_API_KEY not configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "Lila & Co. <orders@yourdomain.com>", // You will need to verify this domain in Resend
      to,
      subject,
      html,
    }),
  });
  return res.json();
}

// Utility to send SMS/WhatsApp via Twilio
async function sendTwilioMessage(to: string, body: string, isWhatsApp = false) {
  const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
  const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
  const fromNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

  if (!accountSid || !authToken || !fromNumber) {
    return { error: "Twilio credentials not configured" };
  }

  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
  
  // Format numbers for WhatsApp if required
  const fromParam = isWhatsApp ? `whatsapp:${fromNumber}` : fromNumber;
  
  // Ensure the 'to' number has the country code. If not, default to India (+91)
  let formattedTo = to.startsWith("+") ? to : `+91${to}`;
  const toParam = isWhatsApp ? `whatsapp:${formattedTo}` : formattedTo;

  const bodyData = new URLSearchParams({
    To: toParam,
    From: fromParam,
    Body: body,
  });

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + btoa(`${accountSid}:${authToken}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: bodyData.toString(),
  });
  return res.json();
}

serve(async (req) => {
  try {
    const payload = await req.json();
    
    // Payload from Supabase Webhook
    const { type, record, old_record } = payload;
    
    if (!record) {
      return new Response("Missing record in payload", { status: 400 });
    }

    const orderId = record.id;
    const total = record.total;
    const customerName = record.customer_name;
    const status = record.status;
    const shipping = record.shipping || {};
    
    // Attempt to extract contact info. In a real app, you might query the profiles table 
    // for the email if it's not in the shipping JSON. Assuming email might be in shipping or user profile.
    // For this demo, if shipping doesn't have email, we skip email or use a placeholder logic.
    const phone = shipping.phone;
    const email = shipping.email; // If you added email to the checkout form. If not, it skips email.

    // 1. Handle NEW ORDER
    if (type === "INSERT") {
      console.log(`Processing new order: ${orderId}`);
      
      const adminPhone = Deno.env.get("ADMIN_WHATSAPP_NUMBER");

      // Send Customer SMS
      if (phone) {
        await sendTwilioMessage(
          phone, 
          `Hi ${customerName}, your order ${orderId} for Rs.${total} has been placed successfully at Lila & Co. We will notify you when it ships!`
        );
      }

      // Send Customer Email
      if (email) {
        await sendEmail(
          email,
          `Order Confirmation - ${orderId}`,
          `<h2>Thank you for your order, ${customerName}!</h2><p>Your order <strong>${orderId}</strong> for <strong>Rs.${total}</strong> has been confirmed.</p>`
        );
      }

      // Send Admin WhatsApp Alert
      if (adminPhone) {
        await sendTwilioMessage(
          adminPhone,
          `🚨 New Order Alert!\nOrder ID: ${orderId}\nCustomer: ${customerName}\nAmount: Rs.${total}\nStatus: ${record.payment_status}`,
          true // isWhatsApp
        );
      }
    } 
    
    // 2. Handle STATUS UPDATE
    else if (type === "UPDATE" && old_record && old_record.status !== status) {
      console.log(`Processing status update for ${orderId}: ${old_record.status} -> ${status}`);
      
      if (status === "Shipped" || status === "Delivered") {
        const msg = `Hi ${customerName}, good news! Your Lila & Co. order ${orderId} is now ${status}.`;
        
        if (phone) await sendTwilioMessage(phone, msg);
        
        if (email) {
          await sendEmail(
            email,
            `Order Update: ${status} - ${orderId}`,
            `<h2>Order Update</h2><p>${msg}</p>`
          );
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Webhook Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
