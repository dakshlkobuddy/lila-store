import { useState, useEffect, useRef } from "react";
import { Mail, Eye, EyeOff, Lock, User, Loader, RefreshCw, ShieldCheck } from "lucide-react";
import { BRAND } from "../../constants.js";
import { isEmail } from "../../lib/validation.js";

const RESEND_COOLDOWN = 60; // seconds
const OTP_LENGTH = 6;

export default function AuthForm({ onLogin, onRegister, onResendVerification, onForgotPassword, onVerifyOtp, onUpdatePassword }) {
  const [mode, setMode] = useState("login");
  const [f, setF] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const [busy, setBusy] = useState(false);

  // OTP screen state
  const [pendingEmail, setPendingEmail] = useState(null); // null = form, string = OTP screen
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [otpError, setOtpError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const cooldownRef = useRef(null);
  const otpRefs = useRef([]);

  // Recovery: after OTP verified, show new password form
  const [recoveryVerified, setRecoveryVerified] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showNewPwd, setShowNewPwd] = useState(false);
  const [newPwdError, setNewPwdError] = useState("");

  // Start the 60-second resend cooldown timer
  const startCooldown = () => {
    setCooldown(RESEND_COOLDOWN);
    clearInterval(cooldownRef.current);
    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) { clearInterval(cooldownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  // Cleanup timer on unmount
  useEffect(() => () => clearInterval(cooldownRef.current), []);

  // Auto-focus first OTP input when OTP screen appears
  useEffect(() => {
    if (pendingEmail && !recoveryVerified) {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [pendingEmail, recoveryVerified]);

  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };

  // Password strength checker — returns { score 0-4, label, color }
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: "", color: "transparent" };
    let score = 0;
    if (pwd.length >= 8)  score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    const map = [
      { label: "Too weak",  color: "#ff4d4d" },
      { label: "Weak",      color: "#ff8c00" },
      { label: "Fair",      color: "#ffd700" },
      { label: "Strong",    color: "#7ecb5f" },
      { label: "Very strong", color: "#4caf50" },
    ];
    return { score, ...map[score] };
  };

  const validate = () => {
    const e = {};
    if (mode === "register" && f.name.trim().length < 2) e.name = "Please enter your full name.";
    if (!f.email.trim()) e.email = "Email is required.";
    else if (!isEmail(f.email)) e.email = "Enter a valid email address.";
    if (!f.password) {
      e.password = "Password is required.";
    } else if (mode === "register") {
      if (f.password.length < 8)        e.password = "Use at least 8 characters.";
      else if (!/[A-Z]/.test(f.password)) e.password = "Include at least one uppercase letter.";
      else if (!/[0-9]/.test(f.password)) e.password = "Include at least one number.";
      else if (!/[^A-Za-z0-9]/.test(f.password)) e.password = "Include at least one special character (!@#$ etc.)";
    }
    if (mode === "register" && !e.password) {
      if (!f.confirmPassword)              e.confirmPassword = "Please confirm your password.";
      else if (f.confirmPassword !== f.password) e.confirmPassword = "Passwords do not match.";
    }
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
        if (result?.error?.code === "email_exists") {
          setErrors(e => ({ ...e, email: "This email is already registered. Please login instead." }));
        } else if (!result?.error && result?.needsVerification) {
          setPendingEmail(result.email);
          setOtp(Array(OTP_LENGTH).fill(""));
          setOtpError("");
          startCooldown();
        }
      }
    } finally {
      setBusy(false);
    }
  };

  // ── OTP input handlers ──────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (value && !/^\d$/.test(value)) return; // only single digits
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError("");

    // Auto-focus next box
    if (value && index < OTP_LENGTH - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === "Enter") {
      handleVerifyOtp();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (pasteData.length === 0) return;
    const newOtp = [...otp];
    for (let i = 0; i < OTP_LENGTH; i++) {
      newOtp[i] = pasteData[i] || "";
    }
    setOtp(newOtp);
    setOtpError("");
    // Focus last filled or the next empty
    const focusIdx = Math.min(pasteData.length, OTP_LENGTH - 1);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join("");
    if (code.length !== OTP_LENGTH) {
      setOtpError("Please enter the complete 6-digit OTP.");
      return;
    }
    setBusy(true);
    try {
      const type = mode === "forgot-password" ? "recovery" : "signup";
      const result = await onVerifyOtp(pendingEmail, code, type);
      if (result?.error) {
        setOtpError(result.error.message || "Invalid or expired OTP. Please try again.");
        setOtp(Array(OTP_LENGTH).fill(""));
        otpRefs.current[0]?.focus();
      } else {
        if (mode === "forgot-password") {
          // OTP verified for recovery — now show set new password form
          setRecoveryVerified(true);
        }
        // For signup, the store auto-logs in — component will unmount
      }
    } finally {
      setBusy(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || busy) return;
    setBusy(true);
    try {
      let result;
      if (mode === "forgot-password") {
        result = await onForgotPassword(pendingEmail);
      } else {
        result = await onResendVerification(pendingEmail);
      }
      if (!result?.error) {
        startCooldown();
        setOtp(Array(OTP_LENGTH).fill(""));
        setOtpError("");
        otpRefs.current[0]?.focus();
      }
    } finally {
      setBusy(false);
    }
  };

  const handleSetNewPassword = async () => {
    if (newPassword.length < 8) {
      setNewPwdError("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      const result = await onUpdatePassword(newPassword);
      if (result?.error) {
        setNewPwdError(result.error.message || "Failed to update password.");
      }
      // On success, the store notifies and handles redirect
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setErrors({});
    setPendingEmail(null);
    setRecoveryVerified(false);
    setNewPassword("");
    setNewPwdError("");
    setOtp(Array(OTP_LENGTH).fill(""));
    setOtpError("");
    if (newMode === "login" || newMode === "register") {
      setF({ name: "", email: "", password: "", confirmPassword: "" });
    }
    setShowPwd(false);
    setShowConfirmPwd(false);
    clearInterval(cooldownRef.current);
    setCooldown(0);
  };

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

  const css = `
    .glass-input::placeholder { color: rgba(255, 255, 255, 0.6); }
    .glass-input:focus { border-color: rgba(255,255,255,0.8); background: rgba(255, 255, 255, 0.15); }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .verify-card { animation: fadeSlideIn 0.35s ease forwards; }
    @keyframes otpPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0); }
      50%       { box-shadow: 0 0 0 4px rgba(255,255,255,0.15); }
    }
    .otp-box:focus { 
      border-color: rgba(255,255,255,0.9); 
      background: rgba(255,255,255,0.18); 
      animation: otpPulse 1.5s ease infinite; 
    }
  `;

  const cardStyle = {
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
    margin: "20px",
    fontFamily: "Inter, sans-serif",
  };

  const bgStyle = {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "url('https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2940&auto=format&fit=crop') center/cover no-repeat",
    position: "relative",
    fontFamily: "Inter, sans-serif",
  };

  // ── Recovery: Set New Password screen (after OTP verified) ─────────────────
  if (recoveryVerified) {
    return (
      <div style={bgStyle}>
        <style>{css}</style>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />

        <div style={cardStyle} className="verify-card">
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{
              width: 76, height: 76, borderRadius: "50%",
              background: "rgba(126, 203, 95, 0.2)",
              border: "2px solid rgba(126,203,95,0.5)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 8px rgba(126,203,95,0.08)",
            }}>
              <Lock size={34} color="#7ecb5f" />
            </div>
          </div>

          <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
            Set New Password
          </h2>

          <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: 24 }}>
            OTP verified! Enter your new password below.
          </p>

          <div style={{ position: "relative", marginBottom: 20 }}>
            <input
              className="glass-input"
              style={inputStyle(!!newPwdError)}
              type={showNewPwd ? "text" : "password"}
              placeholder="New Password (min 8 characters)"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); setNewPwdError(""); }}
              onKeyDown={(e) => e.key === "Enter" && handleSetNewPassword()}
              disabled={busy}
            />
            <button
              type="button"
              onClick={() => setShowNewPwd((v) => !v)}
              style={{
                position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", padding: 0,
                color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center",
              }}
              tabIndex={-1}
            >
              {showNewPwd ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {newPwdError && <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: "-12px", marginBottom: 16, paddingLeft: 4 }}>{newPwdError}</div>}

          <button
            onClick={handleSetNewPassword}
            disabled={busy}
            style={{
              width: "100%", background: "#fff", color: "#1a1a1a", border: "none",
              borderRadius: "24px", padding: "14px", fontSize: "16px", fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "transform 0.1s, opacity 0.2s", opacity: busy ? 0.8 : 1,
            }}
          >
            {busy ? <Loader size={18} style={{ animation: "ecSpin 1s linear infinite" }} /> : "Update Password"}
          </button>
        </div>
      </div>
    );
  }

  // ── OTP verification screen ────────────────────────────────────────────────
  if (pendingEmail) {
    return (
      <div style={bgStyle}>
        <style>{css}</style>
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.25)" }} />

        <div style={cardStyle} className="verify-card">
          {/* Shield icon */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 24 }}>
            <div style={{
              width: 76, height: 76, borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              border: "2px solid rgba(255,255,255,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 0 0 8px rgba(255,255,255,0.06)",
            }}>
              <ShieldCheck size={34} color="#fff" />
            </div>
          </div>

          <h2 style={{ textAlign: "center", fontSize: 26, fontWeight: 700, marginBottom: 10 }}>
            Enter OTP
          </h2>

          <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.75)", lineHeight: 1.65, marginBottom: 6 }}>
            We sent a 6-digit verification code to:
          </p>

          {/* Email display pill */}
          <div style={{
            textAlign: "center", fontSize: 14, fontWeight: 600,
            background: "rgba(255,255,255,0.14)", borderRadius: 12,
            padding: "10px 18px", marginBottom: 24, wordBreak: "break-all",
            border: "1px solid rgba(255,255,255,0.22)",
          }}>
            {pendingEmail}
          </div>

          {/* OTP input boxes */}
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 8 }}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                className="otp-box"
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                onPaste={i === 0 ? handleOtpPaste : undefined}
                disabled={busy}
                style={{
                  width: 48, height: 56,
                  textAlign: "center",
                  fontSize: 22, fontWeight: 700,
                  background: digit ? "rgba(255,255,255,0.18)" : "rgba(255,255,255,0.08)",
                  border: `2px solid ${otpError ? "#ff6b6b" : digit ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.2)"}`,
                  borderRadius: 12,
                  color: "#fff",
                  outline: "none",
                  transition: "all 0.2s ease",
                  caretColor: "#fff",
                }}
              />
            ))}
          </div>

          {/* OTP error */}
          {otpError && (
            <div style={{ color: "#ff6b6b", fontSize: 13, textAlign: "center", marginBottom: 12, padding: "0 4px" }}>
              {otpError}
            </div>
          )}

          <p style={{ textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 24, marginTop: 8 }}>
            Check your inbox and spam folder. The code expires in 15 minutes.
          </p>

          {/* Verify OTP button */}
          <button
            id="verify-otp-btn"
            onClick={handleVerifyOtp}
            disabled={busy}
            style={{
              width: "100%", background: "#fff", color: "#1a1a1a", border: "none",
              borderRadius: "24px", padding: "14px", fontSize: "16px", fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "transform 0.1s, opacity 0.2s", opacity: busy ? 0.8 : 1,
              marginBottom: 14,
            }}
            onMouseDown={e => { if (!busy) e.currentTarget.style.transform = "scale(0.98)"; }}
            onMouseUp={e => { if (!busy) e.currentTarget.style.transform = "scale(1)"; }}
            onMouseLeave={e => { if (!busy) e.currentTarget.style.transform = "scale(1)"; }}
          >
            {busy ? <Loader size={18} style={{ animation: "ecSpin 1s linear infinite" }} /> : <><ShieldCheck size={18} /> Verify OTP</>}
          </button>

          {/* Resend OTP with live countdown */}
          <button
            id="resend-otp-btn"
            onClick={handleResend}
            disabled={cooldown > 0 || busy}
            style={{
              width: "100%",
              background: cooldown > 0 ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.18)",
              color: cooldown > 0 ? "rgba(255,255,255,0.45)" : "#fff",
              border: `1px solid ${cooldown > 0 ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.35)"}`,
              borderRadius: "14px",
              padding: "13px",
              fontSize: "15px",
              fontWeight: 600,
              cursor: cooldown > 0 || busy ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.25s ease",
              marginBottom: 14,
            }}
          >
            {busy ? (
              <Loader size={16} style={{ animation: "ecSpin 1s linear infinite" }} />
            ) : (
              <>
                <RefreshCw size={15} style={{ opacity: cooldown > 0 ? 0.45 : 1 }} />
                {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.18)" }} />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)" }}>or</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.18)" }} />
          </div>

          {/* Use different email */}
          <button
            id="change-email-btn"
            onClick={() => {
              setPendingEmail(null);
              setOtp(Array(OTP_LENGTH).fill(""));
              setOtpError("");
              setMode(mode === "forgot-password" ? "forgot-password" : "register");
              setF(p => ({ ...p, password: "" }));
              clearInterval(cooldownRef.current);
              setCooldown(0);
            }}
            style={{
              width: "100%",
              background: "transparent",
              color: "rgba(255,255,255,0.7)",
              border: "1px solid rgba(255,255,255,0.2)",
              borderRadius: "14px",
              padding: "12px",
              fontSize: "14px",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: 20,
            }}
            onMouseOver={e => { e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.45)"; }}
            onMouseOut={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.2)"; }}
          >
            Use a different email
          </button>

          {/* Back to login */}
          <p style={{ textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.55)", margin: 0 }}>
            {mode === "forgot-password" ? "Remembered your password? " : "Already verified? "}
            <span
              style={{ color: "#fff", fontWeight: 600, cursor: "pointer" }}
              onClick={() => {
                setPendingEmail(null);
                setMode("login");
                setF({ name: "", email: pendingEmail, password: "", confirmPassword: "" });
                clearInterval(cooldownRef.current);
                setCooldown(0);
              }}
            >
              Login
            </span>
          </p>
        </div>
      </div>
    );
  }

  // ── Login / Register / Forgot Password form ────────────────────────────────
  return (
    <div style={bgStyle}>
      <style>{css}</style>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />

      <div style={cardStyle}>
        <h2 style={{ textAlign: "center", fontSize: 32, fontWeight: 600, marginBottom: "32px", letterSpacing: "0.5px" }}>
          {mode === "login" ? "Login" : mode === "register" ? "Register" : "Reset Password"}
        </h2>

        {mode === "forgot-password" && (
          <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.75)", marginBottom: 24, lineHeight: 1.5 }}>
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        )}

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

        {mode !== "forgot-password" && (
          <div style={{ marginBottom: mode === "register" ? "12px" : "24px" }}>
            <div style={{ position: "relative" }}>
              <input
                className="glass-input"
                style={{ ...inputStyle(errors.password), paddingRight: 44 }}
                type={showPwd ? "text" : "password"}
                placeholder={mode === "register" ? "New Password" : "Password"}
                value={f.password}
                onChange={(e) => set("password", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && mode === "login" && submit()}
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                style={{
                  position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center",
                }}
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 6, paddingLeft: 4 }}>{errors.password}</div>}

            {mode === "register" && f.password && (() => {
              const { score, label, color } = getPasswordStrength(f.password);
              return (
                <div style={{ marginTop: 10 }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: 4 }}>
                    {[0,1,2,3].map(i => (
                      <div key={i} style={{
                        flex: 1, height: 4, borderRadius: 4,
                        background: i < score ? color : "rgba(255,255,255,0.15)",
                        transition: "background 0.3s ease",
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color, fontWeight: 500, paddingLeft: 2 }}>{label}</div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Confirm Password — only in register mode */}
        {mode === "register" && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ position: "relative" }}>
              <input
                className="glass-input"
                style={{ ...inputStyle(errors.confirmPassword), paddingRight: 44 }}
                type={showConfirmPwd ? "text" : "password"}
                placeholder="Confirm Password"
                value={f.confirmPassword}
                onChange={(e) => set("confirmPassword", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                disabled={busy}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPwd((v) => !v)}
                style={{
                  position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  color: "rgba(255,255,255,0.8)", display: "flex", alignItems: "center",
                }}
                tabIndex={-1}
              >
                {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: 6, paddingLeft: 4 }}>{errors.confirmPassword}</div>}
          </div>
        )}

        {mode === "login" && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
              <input type="checkbox" style={{ accentColor: "#fff", width: 16, height: 16, cursor: "pointer" }} />
              Remember me
            </label>
            <span style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseOver={e => e.target.style.color = "#fff"} onMouseOut={e => e.target.style.color = "rgba(255,255,255,0.8)"} onClick={() => switchMode("forgot-password")}>
              Forgot Password?
            </span>
          </div>
        )}

        <button
          id={mode === "login" ? "login-submit-btn" : "register-submit-btn"}
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
            marginTop: mode === "register" ? "8px" : "0",
          }}
          onMouseDown={e => { if (!busy) e.currentTarget.style.transform = "scale(0.98)"; }}
          onMouseUp={e => { if (!busy) e.currentTarget.style.transform = "scale(1)"; }}
          onMouseLeave={e => { if (!busy) e.currentTarget.style.transform = "scale(1)"; }}
          onClick={mode === "forgot-password" ? async () => {
            if (!isEmail(f.email)) return setErrors({ email: "Enter a valid email address" });
            setBusy(true);
            const res = await onForgotPassword(f.email);
            setBusy(false);
            if (!res?.error) {
              setPendingEmail(f.email.trim());
              setOtp(Array(OTP_LENGTH).fill(""));
              setOtpError("");
              startCooldown();
            }
          } : submit}
          disabled={busy}
        >
          {busy ? <Loader size={18} style={{ animation: "ecSpin 1s linear infinite" }} /> : (mode === "login" ? "Login" : mode === "register" ? "Register" : "Send OTP")}
        </button>

        <p style={{ textAlign: "center", fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 24 }}>
          {mode === "login" ? "Don't have an account? " : mode === "register" ? "Already have an account? " : "Remembered your password? "}
          <span style={{ color: "#fff", fontWeight: 600, cursor: "pointer" }} onClick={() => switchMode(mode === "login" ? "register" : "login")}>
            {mode === "login" ? "Register" : "Login"}
          </span>
        </p>
      </div>
    </div>
  );
}
