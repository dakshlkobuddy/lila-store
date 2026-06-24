import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Loader } from "lucide-react";
import { BRAND } from "../../constants.js";
import { isEmail } from "../../lib/validation.js";

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
        await onLogin(f.email, f.password);
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

  const inputStyle = (hasError) => ({
    width: "100%",
    background: "rgba(255, 255, 255, 0.1)",
    border: `1px solid ${hasError ? "#ff6b6b" : "rgba(255, 255, 255, 0.3)"}`,
    borderRadius: "12px",
    padding: "14px 16px",
    paddingRight: "44px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s ease",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
  });

  const placeholderStyle = `
    .glass-input::placeholder { color: rgba(255, 255, 255, 0.6); }
    .glass-input:focus { border-color: rgba(255,255,255,0.8); background: rgba(255, 255, 255, 0.15); }
  `;

  return (
    <div style={{
      minHeight: "100vh",
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2940&auto=format&fit=crop') center/cover no-repeat",
      position: "relative",
      fontFamily: "Inter, sans-serif"
    }}>
      <style>{placeholderStyle}</style>
      
      {/* Dark overlay to ensure readability */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />

      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 420,
        padding: "40px",
        borderRadius: "24px",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)",
        color: "#fff",
        margin: "20px"
      }}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 600, marginBottom: "32px", letterSpacing: "0.5px" }}>
          {mode === "login" ? "Login" : "Register"}
        </h2>

        {mode === "register" && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ position: "relative" }}>
              <input 
                className="glass-input" 
                style={inputStyle(errors.name)} 
                placeholder="Full Name" 
                value={f.name} 
                onChange={(e) => set("name", e.target.value)} 
                disabled={busy} 
              />
              <User size={18} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.6)" }} />
            </div>
            {errors.name && <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 6, paddingLeft: 4 }}>{errors.name}</div>}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <div style={{ position: "relative" }}>
            <input 
              className="glass-input" 
              style={inputStyle(errors.email)} 
              placeholder="Email ID" 
              value={f.email} 
              onChange={(e) => set("email", e.target.value)} 
              disabled={busy} 
            />
            <Mail size={18} style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.6)" }} />
          </div>
          {errors.email && <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 6, paddingLeft: 4 }}>{errors.email}</div>}
        </div>

        <div style={{ marginBottom: "24px" }}>
          <div style={{ position: "relative" }}>
            <input
              className="glass-input"
              style={{ ...inputStyle(errors.password), paddingRight: 44 }}
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
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: "rgba(255,255,255,0.8)",
                display: "flex",
                alignItems: "center",
              }}
              tabIndex={-1}
            >
              {showPwd ? <EyeOff size={18} /> : <Lock size={18} />}
            </button>
          </div>
          {errors.password && <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 6, paddingLeft: 4 }}>{errors.password}</div>}
        </div>

        {mode === "login" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" style={{ accentColor: "#fff", width: 16, height: 16, cursor: "pointer" }} />
              Remember me
            </label>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e=>e.target.style.color="#fff"} onMouseOut={e=>e.target.style.color="rgba(255,255,255,0.8)"}>
              Forgot Password?
            </span>
          </div>
        )}

        <button
          style={{
            width: "100%",
            background: "#fff",
            color: "#1a1a1a",
            border: "none",
            borderRadius: "24px",
            padding: "14px",
            fontSize: "16px",
            fontWeight: 600,
            cursor: busy ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "transform 0.1s, opacity 0.2s",
            opacity: busy ? 0.8 : 1,
            marginTop: mode === "register" ? "8px" : "0"
          }}
          onMouseDown={e => { if(!busy) e.currentTarget.style.transform = "scale(0.98)" }}
          onMouseUp={e => { if(!busy) e.currentTarget.style.transform = "scale(1)" }}
          onMouseLeave={e => { if(!busy) e.currentTarget.style.transform = "scale(1)" }}
          onClick={submit}
          disabled={busy}
        >
          {busy ? <Loader size={18} style={{ animation: "ecSpin 1s linear infinite" }} /> : (mode === "login" ? "Login" : "Register")}
        </button>

        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 24 }}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <span 
            style={{ color: "#fff", fontWeight: 600, cursor: "pointer" }} 
            onClick={switchMode}
          >
            {mode === "login" ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
