import { useState } from "react";
import { ShoppingBag, Eye, EyeOff } from "lucide-react";
import { BRAND } from "../../constants.js";
import { isEmail, errBorder } from "../../lib/validation.js";
import FieldError from "../FieldError.jsx";

// One login screen for both admin and customers. The role is detected
// from the account on sign-in. Registering creates a customer account
// and then switches to the sign-in form (no auto-login).
export default function AuthForm({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (mode === "register" && f.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!f.email.trim()) e.email = "Email is required.";
    else if (!isEmail(f.email)) e.email = "Enter a valid email address.";
    if (!f.password) e.password = "Password is required.";
    else if (mode === "register" && f.password.length < 6) e.password = "Use at least 6 characters.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = () => {
    if (!validate()) return;
    if (mode === "login") { onLogin(f.email, f.password); return; }
    const ok = onRegister(f.name, f.email, f.password);
    if (ok) { setMode("login"); setErrors({}); setF({ name: "", email: f.email.trim(), password: "" }); }
  };

  const switchMode = () => { setMode(mode === "login" ? "register" : "login"); setErrors({}); };

  return (
    <div style={{ maxWidth: 420, margin: "10px auto" }}>
      <div style={{ textAlign: "center", marginBottom: 22 }}>
        <div style={{ width: 52, height: 52, borderRadius: 14, background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
          <ShoppingBag size={24} color="#fff" />
        </div>
        <h1 className="ec-disp" style={{ fontSize: 30 }}>Welcome to {BRAND}</h1>
      </div>
      <div className="ec-card" style={{ padding: 30 }}>
        <h2 className="ec-disp" style={{ fontSize: 24, marginBottom: 6 }}>{mode === "login" ? "Sign in" : "Create an account"}</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 22 }}>{mode === "login" ? "Enter your credentials to continue." : "It only takes a moment."}</p>
        {mode === "register" && <>
          <input className="ec-input" style={{ ...errBorder(errors.name) }} placeholder="Full name" value={f.name} onChange={(e) => set("name", e.target.value)} />
          <FieldError msg={errors.name} />
          {!errors.name && <div style={{ height: 12 }} />}
        </>}
        <input className="ec-input" style={{ ...errBorder(errors.email) }} placeholder="Email" value={f.email} onChange={(e) => set("email", e.target.value)} />
        <FieldError msg={errors.email} />
        {!errors.email && <div style={{ height: 12 }} />}
        <div style={{ position: "relative" }}>
          <input
            className="ec-input"
            style={{ ...errBorder(errors.password), paddingRight: 44 }}
            type={showPwd ? "text" : "password"}
            placeholder="Password"
            value={f.password}
            onChange={(e) => set("password", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{
              position: "absolute",
              right: 12,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              color: "var(--ink-soft)",
              display: "flex",
              alignItems: "center",
            }}
            tabIndex={-1}
            aria-label={showPwd ? "Hide password" : "Show password"}
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        <FieldError msg={errors.password} />
        {!errors.password && <div style={{ height: 18 }} />}
        <button className="ec-btn ec-btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={submit}>{mode === "login" ? "Sign in" : "Create account"}</button>
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--ink-soft)", marginTop: 18 }}>
          {mode === "login" ? "New customer? " : "Already have an account? "}
          <span className="ec-link" style={{ color: "var(--accent)", fontWeight: 600 }} onClick={switchMode}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </span>
        </p>
      </div>
      <div className="ec-card" style={{ padding: "14px 18px", marginTop: 14, fontSize: 13, color: "var(--ink-soft)", background: "var(--bg2)", lineHeight: 1.6 }}>
        <strong style={{ color: "var(--ink)" }}>Try the demo</strong><br />
        Admin: admin@store.com / admin123<br />
        Or register above as a new customer.
      </div>
    </div>
  );
}
