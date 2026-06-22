import { useState } from "react";
import { CreditCard, Truck, ShieldCheck } from "lucide-react";
import { isPhoneIN, isPin, errBorder } from "../../lib/validation.js";
import { money } from "../../lib/format.js";
import FieldError from "../FieldError.jsx";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
  "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Delhi", "Jammu & Kashmir", "Ladakh", "Puducherry", "Chandigarh",
];

// Shipping details form with validation.
// Exposes two payment buttons — Razorpay (online) and COD — so both go through
// the same address validation before the parent triggers the correct flow.
export default function CheckoutForm({ user, total, onPlaceCOD, onPlaceOnline, busyCOD, busyOnline }) {
  const [f, setF] = useState({ name: user?.name || "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2)   e.name    = "Please enter the full name.";
    if (!f.phone.trim())            e.phone   = "Phone number is required.";
    else if (!isPhoneIN(f.phone))   e.phone   = "Enter a valid 10-digit mobile number.";
    if (f.address.trim().length < 6) e.address = "Please enter a complete address.";
    if (f.city.trim().length < 2)   e.city    = "Please enter your city.";
    if (!f.state)                   e.state   = "Please select your state.";
    if (!f.pincode.trim())          e.pincode = "PIN code is required.";
    else if (!isPin(f.pincode))     e.pincode = "Enter a valid 6-digit PIN code.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isBusy = busyCOD || busyOnline;

  const handleOnline = () => { if (validate()) onPlaceOnline(f); };
  const handleCOD    = () => { if (validate()) onPlaceCOD(f); };

  return (
    <div className="ec-card" style={{ padding: 24 }}>
      <h3 className="ec-disp" style={{ fontSize: 20, marginBottom: 16 }}>Shipping details</h3>

      <input className="ec-input" style={{ marginBottom: errors.name ? 0 : 12, ...errBorder(errors.name) }} placeholder="Full name" value={f.name} onChange={(e) => set("name", e.target.value)} />
      <FieldError msg={errors.name} />

      <input className="ec-input" inputMode="numeric" style={{ marginBottom: errors.phone ? 0 : 12, ...errBorder(errors.phone) }} placeholder="Phone number (10 digits)" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
      <FieldError msg={errors.phone} />

      <input className="ec-input" style={{ marginBottom: errors.address ? 0 : 12, ...errBorder(errors.address) }} placeholder="Street address (house no, area, landmark)" value={f.address} onChange={(e) => set("address", e.target.value)} />
      <FieldError msg={errors.address} />

      <div style={{ display: "flex", gap: 10, marginBottom: errors.city || errors.state ? 0 : 12 }}>
        <div style={{ flex: 1 }}>
          <input className="ec-input" style={{ ...errBorder(errors.city) }} placeholder="City" value={f.city} onChange={(e) => set("city", e.target.value)} />
          <FieldError msg={errors.city} />
        </div>
        <div style={{ flex: 1 }}>
          <select className="ec-input" style={{ ...errBorder(errors.state) }} value={f.state} onChange={(e) => set("state", e.target.value)}>
            <option value="" disabled>— State —</option>
            {INDIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
          <FieldError msg={errors.state} />
        </div>
      </div>

      <input
        className="ec-input"
        inputMode="numeric"
        maxLength={6}
        style={{ marginBottom: errors.pincode ? 0 : 22, ...errBorder(errors.pincode) }}
        placeholder="PIN code (6 digits)"
        value={f.pincode}
        onChange={(e) => set("pincode", e.target.value)}
      />
      <FieldError msg={errors.pincode} />

      {/* ── Payment method ────────────────────────────────── */}
      <div style={{ borderTop: "1px solid var(--line)", paddingTop: 18, marginTop: 6 }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: ".06em", textTransform: "uppercase", color: "var(--ink-soft)", marginBottom: 12 }}>
          Choose payment method
        </p>

        {/* Primary: Razorpay online payment */}
        <button
          id="btn-pay-online"
          className="ec-btn ec-btn-primary"
          style={{
            width: "100%", justifyContent: "center", gap: 10,
            opacity: busyOnline ? 0.75 : 1,
            transition: "opacity .15s",
          }}
          onClick={handleOnline}
          disabled={isBusy}
        >
          <CreditCard size={16} />
          {busyOnline ? "Opening payment…" : `Pay Online · ${money(total)}`}
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--ink-soft)", marginTop: 6, marginBottom: 14 }}>
          UPI · Debit / Credit Cards · Netbanking
        </p>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
          <span style={{ fontSize: 12, color: "var(--ink-soft)", flexShrink: 0 }}>or</span>
          <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
        </div>

        {/* Secondary: Cash on Delivery */}
        <button
          id="btn-pay-cod"
          className="ec-btn ec-btn-ghost"
          style={{
            width: "100%", justifyContent: "center", gap: 10,
            opacity: busyCOD ? 0.75 : 1,
            transition: "opacity .15s",
          }}
          onClick={handleCOD}
          disabled={isBusy}
        >
          <Truck size={16} />
          {busyCOD ? "Placing order…" : "Cash on Delivery"}
        </button>

        <p style={{ textAlign: "center", fontSize: 11, color: "var(--ink-soft)", marginTop: 6 }}>
          Pay when your order arrives
        </p>
      </div>

      {/* Security badge */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        marginTop: 18, paddingTop: 14, borderTop: "1px solid var(--line)",
        color: "var(--ink-soft)", fontSize: 11,
      }}>
        <ShieldCheck size={13} color="var(--sage)" />
        Online payments secured by{" "}
        <span style={{ fontWeight: 700, color: "#072654" }}>Razorpay</span>
      </div>
    </div>
  );
}

