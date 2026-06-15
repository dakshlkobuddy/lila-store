import { useState } from "react";
import { Truck } from "lucide-react";
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

// Shipping details form with validation, used on the checkout page.
export default function CheckoutForm({ user, total, onPlace, busy }) {
  const [f, setF] = useState({ name: user?.name || "", phone: "", address: "", city: "", state: "", pincode: "" });
  const [errors, setErrors] = useState({});
  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = "Please enter the full name.";
    if (!f.phone.trim()) e.phone = "Phone number is required.";
    else if (!isPhoneIN(f.phone)) e.phone = "Enter a valid 10-digit mobile number.";
    if (f.address.trim().length < 6) e.address = "Please enter a complete address.";
    if (f.city.trim().length < 2) e.city = "Please enter your city.";
    if (!f.state) e.state = "Please select your state.";
    if (!f.pincode.trim()) e.pincode = "PIN code is required.";
    else if (!isPin(f.pincode)) e.pincode = "Enter a valid 6-digit PIN code.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };
  const place = () => { if (validate()) onPlace(f); };

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
          <select
            className="ec-input"
            style={{ ...errBorder(errors.state) }}
            value={f.state}
            onChange={(e) => set("state", e.target.value)}
          >
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
        style={{ marginBottom: errors.pincode ? 0 : 18, ...errBorder(errors.pincode) }}
        placeholder="PIN code (6 digits)"
        value={f.pincode}
        onChange={(e) => set("pincode", e.target.value)}
      />
      <FieldError msg={errors.pincode} />

      <button className="ec-btn ec-btn-primary" style={{ width: "100%", justifyContent: "center", opacity: busy ? 0.7 : 1 }} onClick={place} disabled={busy}>
        <Truck size={16} /> {busy ? "Placing order…" : `Place order · ${money(total)}`}
      </button>
      <p style={{ textAlign: "center", fontSize: 12, color: "var(--ink-soft)", marginTop: 12 }}>Cash on delivery · No payment taken now</p>
    </div>
  );
}
