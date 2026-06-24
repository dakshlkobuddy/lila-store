import { useState } from "react";
import { CreditCard, Truck, ShieldCheck } from "lucide-react";
import { isPhoneIN, isPin, errBorder } from "../../lib/validation.js";
import { money } from "../../lib/format.js";
import FieldError from "../FieldError.jsx";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh",
  "Chhattisgarh", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jammu & Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const STATE_CITIES = {
  "Andhra Pradesh": ["Anantapur", "Guntur", "Kadapa", "Kakinada", "Kurnool", "Nellore", "Rajamahendravaram", "Tirupati", "Vijayawada", "Visakhapatnam"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Namsai", "Pasighat"],
  "Assam": ["Dibrugarh", "Guwahati", "Jorhat", "Nagaon", "Silchar", "Tinsukia"],
  "Bihar": ["Arrah", "Bhagalpur", "Bihar Sharif", "Darbhanga", "Gaya", "Muzaffarpur", "Patna", "Purnia"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Bhilai", "Bilaspur", "Durg", "Korba", "Raipur", "Rajnandgaon"],
  "Delhi": ["Central Delhi", "Delhi", "Dwarka", "East Delhi", "New Delhi", "North Delhi", "Rohini", "South Delhi", "West Delhi"],
  "Goa": ["Mapusa", "Margao", "Panaji", "Ponda", "Vasco da Gama"],
  "Gujarat": ["Ahmedabad", "Anand", "Bhavnagar", "Gandhinagar", "Jamnagar", "Junagadh", "Rajkot", "Surat", "Vadodara"],
  "Haryana": ["Ambala", "Faridabad", "Gurugram", "Hisar", "Karnal", "Panchkula", "Panipat", "Rohtak", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Dharamshala", "Mandi", "Shimla", "Solan"],
  "Jammu & Kashmir": ["Anantnag", "Baramulla", "Jammu", "Kathua", "Sopore", "Srinagar"],
  "Jharkhand": ["Bokaro Steel City", "Deoghar", "Dhanbad", "Hazaribagh", "Jamshedpur", "Ranchi"],
  "Karnataka": ["Ballari", "Belagavi", "Bengaluru", "Davanagere", "Hubballi-Dharwad", "Kalaburagi", "Mangaluru", "Mysuru", "Shimoga"],
  "Kerala": ["Alappuzha", "Kochi", "Kollam", "Kozhikode", "Malappuram", "Palakkad", "Thiruvananthapuram", "Thrissur"],
  "Ladakh": ["Kargil", "Leh"],
  "Madhya Pradesh": ["Bhopal", "Dewas", "Gwalior", "Indore", "Jabalpur", "Ratlam", "Sagar", "Satna", "Ujjain"],
  "Maharashtra": ["Aurangabad", "Kalyan-Dombivli", "Kolhapur", "Mumbai", "Nagpur", "Nashik", "Navi Mumbai", "Pimpri-Chinchwad", "Pune", "Solapur", "Thane", "Vasai-Virar"],
  "Manipur": ["Churachandpur", "Imphal", "Thoubal"],
  "Meghalaya": ["Nongpoh", "Shillong", "Tura"],
  "Mizoram": ["Aizawl", "Champhai", "Lunglei"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung", "Tuensang"],
  "Odisha": ["Balasore", "Bhubaneswar", "Brahmapur", "Cuttack", "Puri", "Rourkela", "Sambalpur"],
  "Puducherry": ["Karaikal", "Mahe", "Puducherry", "Yanam"],
  "Punjab": ["Amritsar", "Bathinda", "Hoshiarpur", "Jalandhar", "Ludhiana", "Mohali", "Pathankot", "Patiala"],
  "Rajasthan": ["Ajmer", "Alwar", "Bhilwara", "Bikaner", "Jaipur", "Jodhpur", "Kota", "Sri Ganganagar", "Sikar", "Udaipur"],
  "Sikkim": ["Gangtok", "Geyzing", "Namchi"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Erode", "Madurai", "Salem", "Thoothukudi", "Tirunelveli", "Tiruppur", "Tiruchirappalli", "Vellore"],
  "Telangana": ["Hyderabad", "Karimnagar", "Khammam", "Mahbubnagar", "Nizamabad", "Ramagundam", "Warangal"],
  "Tripura": ["Agartala", "Dharmanagar", "Kailasahar", "Udaipur"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Bareilly", "Ghaziabad", "Gorakhpur", "Greater Noida", "Jhansi", "Kanpur", "Lucknow", "Meerut", "Moradabad", "Noida", "Prayagraj", "Saharanpur", "Varanasi"],
  "Uttarakhand": ["Dehradun", "Haldwani", "Haridwar", "Kashipur", "Rishikesh", "Roorkee", "Rudrapur"],
  "West Bengal": ["Asansol", "Bardhaman", "Durgapur", "Haldia", "Howrah", "Kharagpur", "Kolkata", "Malda", "Siliguri"]
};

// Shipping details form with validation.
// Exposes two payment buttons — Razorpay (online) and COD — so both go through
// the same address validation before the parent triggers the correct flow.
export default function CheckoutForm({ user, total, onPlaceCOD, onPlaceOnline, busyCOD, busyOnline }) {
  const [f, setF] = useState({ name: user?.name || "", phone: "", address: "", city: "", cityCustom: "", state: "", pincode: "" });
  const [errors, setErrors] = useState({});
  
  const set = (k, v) => {
    setF((p) => ({ ...p, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const handleStateChange = (st) => {
    setF((p) => ({ ...p, state: st, city: "", cityCustom: "" }));
    setErrors((e) => ({ ...e, state: "", city: "", cityCustom: "" }));
  };

  const validate = () => {
    const e = {};
    
    // Name validation
    const trimmedName = f.name.trim();
    if (!trimmedName) {
      e.name = "Full name is required.";
    } else if (trimmedName.length < 2) {
      e.name = "Full name must be at least 2 characters.";
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      e.name = "Full name can only contain letters and spaces.";
    }

    // Phone validation
    const cleanPhone = f.phone.replace(/\D/g, "");
    if (!f.phone.trim()) {
      e.phone = "Phone number is required.";
    } else if (cleanPhone.length !== 10) {
      e.phone = "Phone number must be exactly 10 digits.";
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      e.phone = "Please enter a valid 10-digit Indian mobile number.";
    }

    // Address validation
    const trimmedAddress = f.address.trim();
    if (!trimmedAddress) {
      e.address = "Street address is required.";
    } else if (trimmedAddress.length < 8) {
      e.address = "Please enter a complete street address (minimum 8 characters).";
    }

    // State validation
    if (!f.state) {
      e.state = "Please select your state.";
    }

    // City validation
    if (!f.state) {
      e.city = "Please select a state first.";
    } else if (!f.city) {
      e.city = "Please select your city.";
    } else if (f.city === "Other") {
      const trimmedCustom = f.cityCustom.trim();
      if (!trimmedCustom) {
        e.cityCustom = "City name is required.";
      } else if (trimmedCustom.length < 2) {
        e.cityCustom = "City name must be at least 2 characters.";
      } else if (!/^[a-zA-Z\s]+$/.test(trimmedCustom)) {
        e.cityCustom = "City name can only contain letters and spaces.";
      }
    }

    // PIN code validation
    const cleanPin = f.pincode.replace(/\D/g, "");
    if (!f.pincode.trim()) {
      e.pincode = "PIN code is required.";
    } else if (cleanPin.length !== 6) {
      e.pincode = "PIN code must be exactly 6 digits.";
    } else if (!/^[1-9]\d{5}$/.test(cleanPin)) {
      e.pincode = "Please enter a valid 6-digit Indian PIN code.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const getFormData = () => {
    return {
      ...f,
      city: f.city === "Other" ? f.cityCustom.trim() : f.city
    };
  };

  const isBusy = busyCOD || busyOnline;

  const handleOnline = () => { if (validate()) onPlaceOnline(getFormData()); };
  const handleCOD    = () => { if (validate()) onPlaceCOD(getFormData()); };

  return (
    <div className="ec-card" style={{ padding: 24 }}>
      <h3 className="ec-disp" style={{ fontSize: 20, marginBottom: 16 }}>Shipping details</h3>

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>
        Full name <span style={{ color: "var(--accent)" }}>*</span>
      </label>
      <input className="ec-input" style={{ marginBottom: errors.name ? 0 : 12, ...errBorder(errors.name) }} placeholder="e.g. Daksh Agarwal" value={f.name} onChange={(e) => set("name", e.target.value)} />
      <FieldError msg={errors.name} />

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>
        Phone number <span style={{ color: "var(--accent)" }}>*</span>
      </label>
      <input className="ec-input" inputMode="numeric" style={{ marginBottom: errors.phone ? 0 : 12, ...errBorder(errors.phone) }} placeholder="e.g. 9876543210" value={f.phone} onChange={(e) => set("phone", e.target.value)} />
      <FieldError msg={errors.phone} />

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>
        Street address <span style={{ color: "var(--accent)" }}>*</span>
      </label>
      <input className="ec-input" style={{ marginBottom: errors.address ? 0 : 12, ...errBorder(errors.address) }} placeholder="house no, area, landmark" value={f.address} onChange={(e) => set("address", e.target.value)} />
      <FieldError msg={errors.address} />

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: errors.city || errors.state || errors.cityCustom ? 0 : 12 }}>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>
            State <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <select className="ec-input" style={{ ...errBorder(errors.state) }} value={f.state} onChange={(e) => handleStateChange(e.target.value)}>
            <option value="" disabled>— State —</option>
            {INDIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
          <FieldError msg={errors.state} />
        </div>
        <div style={{ flex: 1, minWidth: 140 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>
            City <span style={{ color: "var(--accent)" }}>*</span>
          </label>
          <select
            className="ec-input"
            style={{ ...errBorder(errors.city) }}
            value={f.city}
            onChange={(e) => set("city", e.target.value)}
            disabled={!f.state}
          >
            <option value="" disabled>
              {f.state ? "— City —" : "Select State first"}
            </option>
            {f.state && STATE_CITIES[f.state]?.map((ct) => (
              <option key={ct} value={ct}>{ct}</option>
            ))}
            {f.state && <option value="Other">Other (Type manually)</option>}
          </select>
          <FieldError msg={errors.city} />

          {f.city === "Other" && (
            <>
              <input
                className="ec-input"
                style={{ marginTop: 8, ...errBorder(errors.cityCustom) }}
                placeholder="Enter your city name"
                value={f.cityCustom}
                onChange={(e) => set("cityCustom", e.target.value)}
              />
              <FieldError msg={errors.cityCustom} />
            </>
          )}
        </div>
      </div>

      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 6 }}>
        PIN code <span style={{ color: "var(--accent)" }}>*</span>
      </label>
      <input
        className="ec-input"
        inputMode="numeric"
        maxLength={6}
        style={{ marginBottom: errors.pincode ? 0 : 22, ...errBorder(errors.pincode) }}
        placeholder="e.g. 302001"
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

