import { useState } from "react";
import { ShoppingBag, Eye, EyeOff, Loader } from "lucide-react";
import { BRAND } from "../../constants.js";
import { isEmail, errBorder } from "../../lib/validation.js";
import FieldError from "../FieldError.jsx";

// One login screen for both admin and customers. The role is detected
// from the profile after sign-in. Registering creates a customer account
// via Supabase Auth and then switches to the sign-in form.
export default function AuthForm({ onLogin, onRegister }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
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

  const submit = async () => {
    if (!validate() || busy) return;
    setBusy(true);

    try {
      if (mode === "login") {
        const result = await onLogin(f.email, f.password);
        if (result?.error) {
          // error already shown via toast in useStore
        }
      } else {
        const result = await onRegister(f.name, f.email, f.password);
        if (!result?.error) {
          setMode("login");
          setErrors({});
          setF({ name: "", email: f.email.trim(), password: "" });
        }
      }
    } finally {
      setBusy(false);
    }
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
      <div className="ec-card ec-auth-card" style={{ padding: 30 }}>
        <h2 className="ec-disp" style={{ fontSize: 24, marginBottom: 6 }}>{mode === "login" ? "Sign in" : "Create an account"}</h2>
        <p style={{ color: "var(--ink-soft)", fontSize: 14, marginBottom: 22 }}>{mode === "login" ? "Enter your credentials to continue." : "It only takes a moment."}</p>
        {mode === "register" && <>
          <input className="ec-input" style={{ ...errBorder(errors.name) }} placeholder="Full name" value={f.name} onChange={(e) => set("name", e.target.value)} disabled={busy} />
          <FieldError msg={errors.name} />
          {!errors.name && <div style={{ height: 12 }} />}
        </>}
        <input className="ec-input" style={{ ...errBorder(errors.email) }} placeholder="Email" value={f.email} onChange={(e) => set("email", e.target.value)} disabled={busy} />
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
            disabled={busy}
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
        <button
          className="ec-btn ec-btn-primary"
          style={{ width: "100%", justifyContent: "center", opacity: busy ? 0.7 : 1 }}
          onClick={submit}
          disabled={busy}
        >
          {busy ? <><Loader size={16} style={{ animation: "ecSpin 1s linear infinite" }} /> Please wait…</> : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--ink-soft)", marginTop: 18 }}>
          {mode === "login" ? "New customer? " : "Already have an account? "}
          <span className="ec-link" style={{ color: "var(--accent)", fontWeight: 600 }} onClick={switchMode}>
            {mode === "login" ? "Create an account" : "Sign in"}
          </span>
        </p>
      </div>
    </div>
  );
}
