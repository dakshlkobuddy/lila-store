import { useState, useEffect } from "react";
import { User, Phone, Lock, Eye, EyeOff, MapPin, Plus, Pencil, Trash2, Star, Loader, ChevronLeft } from "lucide-react";
import { errBorder } from "../lib/validation.js";
import FieldError from "../components/FieldError.jsx";
import { s } from "./ProfilePage.styles.js";

// ── State / City data (shared with CheckoutForm) ─────────────
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

const LABELS = ["Home", "Office", "Other"];

// ── Password strength checker (same as AuthForm) ─────────────
const getPasswordStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: "transparent" };
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  const map = [
    { label: "Too weak", color: "#ff4d4d" },
    { label: "Weak", color: "#ff8c00" },
    { label: "Fair", color: "#ffd700" },
    { label: "Strong", color: "#7ecb5f" },
    { label: "Very strong", color: "#4caf50" },
  ];
  return { score, ...map[score] };
};

// Block non-numeric key presses
const onlyNumbers = (e) => {
  const allowedKeys = ["Backspace", "Delete", "Tab", "Escape", "Enter", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
  if (allowedKeys.includes(e.key)) return;
  if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) return;
  if (!/^[0-9]$/.test(e.key)) e.preventDefault();
};

// ═══════════════════════════════════════════════════════════════
// Profile Page
// ═══════════════════════════════════════════════════════════════
export default function ProfilePage({ store }) {
  const { currentUser, updateProfile, updatePassword, addresses, saveAddress, deleteAddress, setDefaultAddress, go } = store;

  return (
    <div style={s.page}>
      {/* Back + heading */}
      <button className="ec-btn ec-btn-ghost" style={{ marginBottom: 16, gap: 6, padding: "8px 14px" }} onClick={() => go("home")}>
        <ChevronLeft size={16} /> Back to Shop
      </button>

      <h1 className="ec-disp" style={s.heading}>My Account</h1>
      <p style={s.subtitle}>Manage your profile, password, and saved addresses</p>

      {/* Section 1: Personal Info */}
      <PersonalInfoCard user={currentUser} onSave={updateProfile} />

      {/* Section 2: Change Password */}
      <ChangePasswordCard onUpdate={updatePassword} />

      {/* Section 3: Saved Addresses */}
      <AddressesCard
        addresses={addresses}
        user={currentUser}
        onSave={saveAddress}
        onDelete={deleteAddress}
        onSetDefault={setDefaultAddress}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Section 1 — Personal Info
// ═══════════════════════════════════════════════════════════════
function PersonalInfoCard({ user, onSave }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setName(user?.name || "");
    setEmail(user?.email || "");
    setPhone(user?.phone || "");
  }, [user]);

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Name is required.";
    else if (name.trim().length < 2) e.name = "Name must be at least 2 characters.";
    
    if (!email.trim()) e.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = "Enter a valid email.";

    if (phone.trim() && !/^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""))) {
      e.phone = "Enter a valid 10-digit Indian mobile number.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setBusy(true);
    await onSave({ name, email, phone: phone.replace(/\D/g, "") });
    setBusy(false);
  };

  return (
    <div className="ec-card" style={s.section}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(192,87,59,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <User size={18} color="var(--accent)" />
        </div>
        <h2 style={s.sectionTitle}>Personal Information</h2>
      </div>
      <p style={s.sectionDesc}>Update your name and phone number</p>

      <div style={s.fieldGap}>
        <label style={s.label}>Full Name <span style={{ color: "var(--accent)" }}>*</span></label>
        <input className="ec-input" style={errBorder(errors.name)} value={name} onChange={(e) => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }} disabled={busy} placeholder="Your full name" />
        <FieldError msg={errors.name} />
      </div>

      <div style={s.fieldGap}>
        <label style={s.label}>Email Address <span style={{ color: "var(--accent)" }}>*</span></label>
        <input className="ec-input" style={errBorder(errors.email)} value={email} onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }} disabled={busy} placeholder="Your email address" />
        <FieldError msg={errors.email} />
      </div>

      <div style={s.fieldGap}>
        <label style={s.label}>Phone Number</label>
        <input className="ec-input" inputMode="numeric" maxLength={10} style={errBorder(errors.phone)} value={phone} onChange={(e) => { setPhone(e.target.value); setErrors(p => ({ ...p, phone: "" })); }} onKeyDown={onlyNumbers} disabled={busy} placeholder="Enter 10 digit phone number" />
        <FieldError msg={errors.phone} />
      </div>

      <button className="ec-btn ec-btn-primary" style={{ gap: 8 }} onClick={handleSave} disabled={busy}>
        {busy ? <Loader size={16} style={{ animation: "ecSpin 1s linear infinite" }} /> : "Save Changes"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Section 2 — Change Password
// ═══════════════════════════════════════════════════════════════
function ChangePasswordCard({ onUpdate }) {
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const validate = () => {
    const e = {};
    if (!pwd) e.pwd = "Password is required.";
    else if (pwd.length < 8) e.pwd = "Use at least 8 characters.";
    else if (!/[A-Z]/.test(pwd)) e.pwd = "Include at least one uppercase letter.";
    else if (!/[0-9]/.test(pwd)) e.pwd = "Include at least one number.";
    else if (!/[^A-Za-z0-9]/.test(pwd)) e.pwd = "Include at least one special character.";

    if (!e.pwd) {
      if (!confirmPwd) e.confirmPwd = "Please confirm your password.";
      else if (confirmPwd !== pwd) e.confirmPwd = "Passwords do not match.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    setBusy(true);
    const res = await onUpdate(pwd);
    setBusy(false);
    if (!res?.error) {
      setPwd("");
      setConfirmPwd("");
      setShowPwd(false);
      setShowConfirm(false);
    }
  };

  const strength = getPasswordStrength(pwd);

  return (
    <div className="ec-card" style={s.section}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(192,87,59,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Lock size={18} color="var(--accent)" />
        </div>
        <h2 style={s.sectionTitle}>Change Password</h2>
      </div>
      <p style={s.sectionDesc}>Update your password without email verification</p>

      <div style={s.fieldGap}>
        <label style={s.label}>New Password <span style={{ color: "var(--accent)" }}>*</span></label>
        <div style={{ position: "relative" }}>
          <input className="ec-input" style={{ ...errBorder(errors.pwd), paddingRight: 44 }} type={showPwd ? "text" : "password"} value={pwd} onChange={(e) => { setPwd(e.target.value); setErrors(p => ({ ...p, pwd: "" })); }} disabled={busy} placeholder="At least 8 characters" />
          <button type="button" onClick={() => setShowPwd(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--ink-soft)", display: "flex" }} tabIndex={-1}>
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <FieldError msg={errors.pwd} />
        {/* Strength bar */}
        {pwd && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i < strength.score ? strength.color : "var(--line)", transition: "background 0.3s" }} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: strength.color, fontWeight: 500 }}>{strength.label}</div>
          </div>
        )}
      </div>

      <div style={s.fieldGap}>
        <label style={s.label}>Confirm Password <span style={{ color: "var(--accent)" }}>*</span></label>
        <div style={{ position: "relative" }}>
          <input className="ec-input" style={{ ...errBorder(errors.confirmPwd), paddingRight: 44 }} type={showConfirm ? "text" : "password"} value={confirmPwd} onChange={(e) => { setConfirmPwd(e.target.value); setErrors(p => ({ ...p, confirmPwd: "" })); }} onKeyDown={(e) => e.key === "Enter" && handleUpdate()} disabled={busy} placeholder="Re-enter new password" />
          <button type="button" onClick={() => setShowConfirm(v => !v)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "var(--ink-soft)", display: "flex" }} tabIndex={-1}>
            {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <FieldError msg={errors.confirmPwd} />
      </div>

      <button className="ec-btn ec-btn-primary" style={{ gap: 8 }} onClick={handleUpdate} disabled={busy}>
        {busy ? <Loader size={16} style={{ animation: "ecSpin 1s linear infinite" }} /> : "Update Password"}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Section 3 — Saved Addresses
// ═══════════════════════════════════════════════════════════════
function AddressesCard({ addresses, user, onSave, onDelete, onSetDefault }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // address object or null

  const handleEdit = (addr) => {
    setEditing(addr);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditing(null);
    setShowForm(true);
  };

  const handleFormSave = async (data) => {
    const res = await onSave(data);
    if (!res?.error) {
      setShowForm(false);
      setEditing(null);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditing(null);
  };

  return (
    <div className="ec-card" style={s.section}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(192,87,59,.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <MapPin size={18} color="var(--accent)" />
          </div>
          <h2 style={s.sectionTitle}>Saved Addresses</h2>
        </div>
        {!showForm && (
          <button className="ec-btn ec-btn-ghost" style={{ gap: 6, padding: "8px 14px", fontSize: 13 }} onClick={handleAdd}>
            <Plus size={15} /> Add
          </button>
        )}
      </div>
      <p style={s.sectionDesc}>Manage your delivery addresses for faster checkout</p>

      {showForm ? (
        <AddressForm
          initial={editing}
          user={user}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      ) : addresses.length === 0 ? (
        <div style={s.emptyAddr}>
          <MapPin size={32} style={{ opacity: 0.3, marginBottom: 10 }} />
          <p>No saved addresses yet.</p>
          <button className="ec-btn ec-btn-primary" style={{ margin: "12px auto 0", gap: 6 }} onClick={handleAdd}>
            <Plus size={15} /> Add your first address
          </button>
        </div>
      ) : (
        <div>
          {addresses.map((addr) => (
            <div key={addr.id} style={{ ...s.addrCard, ...(addr.is_default ? s.addrCardDefault : {}) }}>
              <div style={s.addrLabel}>
                {addr.label}
                {addr.is_default && <span style={s.defaultBadge}>Default</span>}
              </div>
              <div style={s.addrText}>
                <strong>{addr.name}</strong> · {addr.phone}<br />
                {addr.address}, {addr.city}, {addr.state} — {addr.pincode}
              </div>
              <div style={s.addrActions}>
                <button className="ec-btn ec-btn-ghost" style={{ padding: "6px 12px", fontSize: 12, gap: 5 }} onClick={() => handleEdit(addr)}>
                  <Pencil size={13} /> Edit
                </button>
                <button className="ec-btn ec-btn-ghost" style={{ padding: "6px 12px", fontSize: 12, gap: 5, color: "var(--danger)" }} onClick={() => onDelete(addr.id)}>
                  <Trash2 size={13} /> Delete
                </button>
                {!addr.is_default && (
                  <button className="ec-btn ec-btn-ghost" style={{ padding: "6px 12px", fontSize: 12, gap: 5, color: "var(--sage)" }} onClick={() => onSetDefault(addr.id)}>
                    <Star size={13} /> Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// Address Form (add / edit)
// ═══════════════════════════════════════════════════════════════
function AddressForm({ initial, user, onSave, onCancel }) {
  const [f, setF] = useState({
    label: initial?.label || "Home",
    name: initial?.name || user?.name || "",
    phone: initial?.phone || user?.phone || "",
    address: initial?.address || "",
    city: initial?.city || "",
    cityCustom: "",
    state: initial?.state || "",
    pincode: initial?.pincode || "",
    is_default: initial?.is_default || false,
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // Determine if the initial city is in the dropdown or "Other"
  useEffect(() => {
    if (initial?.state && initial?.city) {
      const cities = STATE_CITIES[initial.state] || [];
      if (!cities.includes(initial.city)) {
        setF(p => ({ ...p, city: "Other", cityCustom: initial.city }));
      }
    }
  }, [initial]);

  const set = (k, v) => {
    setF(p => ({ ...p, [k]: v }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Name is required.";
    if (!f.phone.trim()) e.phone = "Phone is required.";
    else if (!/^[6-9]\d{9}$/.test(f.phone.replace(/\D/g, ""))) e.phone = "Enter a valid 10-digit mobile number.";
    if (!f.address.trim()) e.address = "Address is required.";
    else if (f.address.trim().length < 8) e.address = "Enter at least 8 characters.";
    if (!f.state) e.state = "State is required.";
    if (!f.city) e.city = "City is required.";
    else if (f.city === "Other" && !f.cityCustom.trim()) e.cityCustom = "City name is required.";
    if (!f.pincode.trim()) e.pincode = "PIN code is required.";
    else if (!/^[1-9]\d{5}$/.test(f.pincode.replace(/\D/g, ""))) e.pincode = "Enter a valid 6-digit PIN code.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setBusy(true);
    await onSave({
      ...(initial?.id ? { id: initial.id } : {}),
      label: f.label,
      name: f.name.trim(),
      phone: f.phone.replace(/\D/g, ""),
      address: f.address.trim(),
      city: f.city === "Other" ? f.cityCustom.trim() : f.city,
      state: f.state,
      pincode: f.pincode.replace(/\D/g, ""),
      is_default: f.is_default,
    });
    setBusy(false);
  };

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: 20, background: "var(--bg)" }}>
      <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>
        {initial ? "Edit Address" : "New Address"}
      </h3>

      {/* Label pills */}
      <div style={{ marginBottom: 16 }}>
        <label style={s.label}>Label</label>
        <div style={{ display: "flex", gap: 8 }}>
          {LABELS.map((l) => (
            <button key={l} className={`ec-chip ${f.label === l ? "ec-chip-on" : ""}`} onClick={() => set("label", l)}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 0 }}>
        <div style={{ flex: 1, minWidth: 160, ...s.fieldGap }}>
          <label style={s.label}>Full Name <span style={{ color: "var(--accent)" }}>*</span></label>
          <input className="ec-input" style={errBorder(errors.name)} value={f.name} onChange={(e) => set("name", e.target.value)} disabled={busy} />
          <FieldError msg={errors.name} />
        </div>
        <div style={{ flex: 1, minWidth: 160, ...s.fieldGap }}>
          <label style={s.label}>Phone <span style={{ color: "var(--accent)" }}>*</span></label>
          <input className="ec-input" inputMode="numeric" maxLength={10} style={errBorder(errors.phone)} value={f.phone} onChange={(e) => set("phone", e.target.value)} onKeyDown={onlyNumbers} disabled={busy} placeholder="Enter 10 digit phone number" />
          <FieldError msg={errors.phone} />
        </div>
      </div>

      <div style={s.fieldGap}>
        <label style={s.label}>Street Address <span style={{ color: "var(--accent)" }}>*</span></label>
        <input className="ec-input" style={errBorder(errors.address)} value={f.address} onChange={(e) => set("address", e.target.value)} disabled={busy} placeholder="House no, area, landmark" />
        <FieldError msg={errors.address} />
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 0 }}>
        <div style={{ flex: 1, minWidth: 140, ...s.fieldGap }}>
          <label style={s.label}>State <span style={{ color: "var(--accent)" }}>*</span></label>
          <select className="ec-input" style={errBorder(errors.state)} value={f.state} onChange={(e) => { set("state", e.target.value); setF(p => ({ ...p, city: "", cityCustom: "" })); }}>
            <option value="" disabled>— State —</option>
            {INDIAN_STATES.map((st) => <option key={st} value={st}>{st}</option>)}
          </select>
          <FieldError msg={errors.state} />
        </div>
        <div style={{ flex: 1, minWidth: 140, ...s.fieldGap }}>
          <label style={s.label}>City <span style={{ color: "var(--accent)" }}>*</span></label>
          <select className="ec-input" style={errBorder(errors.city)} value={f.city} onChange={(e) => set("city", e.target.value)} disabled={!f.state}>
            <option value="" disabled>— City —</option>
            {f.state && STATE_CITIES[f.state]?.map((ct) => <option key={ct} value={ct}>{ct}</option>)}
            {f.state && <option value="Other">Other (Type manually)</option>}
          </select>
          <FieldError msg={errors.city} />
          {f.city === "Other" && (
            <>
              <input className="ec-input" style={{ marginTop: 8, ...errBorder(errors.cityCustom) }} placeholder="Enter your city name" value={f.cityCustom} onChange={(e) => set("cityCustom", e.target.value)} />
              <FieldError msg={errors.cityCustom} />
            </>
          )}
        </div>
      </div>

      <div style={s.fieldGap}>
        <label style={s.label}>PIN Code <span style={{ color: "var(--accent)" }}>*</span></label>
        <input className="ec-input" inputMode="numeric" maxLength={6} style={{ maxWidth: 200, ...errBorder(errors.pincode) }} value={f.pincode} onChange={(e) => set("pincode", e.target.value)} onKeyDown={onlyNumbers} disabled={busy} placeholder="6-digit PIN code" />
        <FieldError msg={errors.pincode} />
      </div>

      {/* Default toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, marginBottom: 20, cursor: "pointer" }}>
        <input type="checkbox" checked={f.is_default} onChange={(e) => set("is_default", e.target.checked)} style={{ accentColor: "var(--accent)", width: 16, height: 16 }} />
        Set as default address
      </label>

      <div style={{ display: "flex", gap: 10 }}>
        <button className="ec-btn ec-btn-primary" style={{ gap: 8 }} onClick={handleSave} disabled={busy}>
          {busy ? <Loader size={16} style={{ animation: "ecSpin 1s linear infinite" }} /> : (initial ? "Update Address" : "Save Address")}
        </button>
        <button className="ec-btn ec-btn-ghost" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </div>
  );
}
