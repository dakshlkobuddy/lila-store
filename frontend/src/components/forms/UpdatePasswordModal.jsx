import { useState } from "react";
import { Eye, EyeOff, Loader, Lock } from "lucide-react";

export default function UpdatePasswordModal({ onUpdate, onClose }) {
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (password.length < 8) {
      return setError("Use at least 8 characters.");
    }
    setBusy(true);
    const res = await onUpdate(password);
    setBusy(false);
    if (res?.error) {
      setError(res.error.message || "Failed to update password.");
    }
  };

  const inputStyle = {
    width: "100%",
    background: "rgba(255, 255, 255, 0.1)",
    border: `1px solid ${error ? "#ff6b6b" : "rgba(255, 255, 255, 0.3)"}`,
    borderRadius: "12px",
    padding: "14px 16px",
    paddingRight: "44px",
    color: "#fff",
    fontSize: "15px",
    outline: "none",
    transition: "all 0.2s ease",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.1)",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)"
    }}>
      <div style={{
        width: "100%", maxWidth: 400,
        padding: "32px", borderRadius: "24px",
        background: "var(--surface)", border: "1px solid var(--line)",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)", margin: "20px"
      }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={26} color="var(--accent)" />
          </div>
        </div>
        
        <h2 style={{ textAlign: "center", fontSize: 24, fontWeight: 600, marginBottom: "8px" }}>
          Update Password
        </h2>
        
        <p style={{ textAlign: "center", fontSize: 14, color: "var(--ink-soft)", marginBottom: 24 }}>
          Please enter a new password for your account.
        </p>

        <div style={{ position: "relative", marginBottom: "20px" }}>
          <input
            style={{...inputStyle, background: "var(--bg)", color: "var(--ink)"}}
            type={showPwd ? "text" : "password"}
            placeholder="New Password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            disabled={busy}
          />
          <button
            type="button"
            onClick={() => setShowPwd((v) => !v)}
            style={{
              position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
              background: "none", border: "none", cursor: "pointer", padding: 0,
              color: "var(--ink-soft)", display: "flex", alignItems: "center",
            }}
          >
            {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        
        {error && <div style={{ color: "#ff6b6b", fontSize: 13, marginTop: "-12px", marginBottom: "16px", paddingLeft: 4 }}>{error}</div>}

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={onClose}
            disabled={busy}
            style={{
              flex: 1, padding: "14px", borderRadius: "24px", background: "transparent",
              border: "1px solid var(--line)", color: "var(--ink)", fontWeight: 600,
              cursor: busy ? "not-allowed" : "pointer"
            }}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={busy}
            style={{
              flex: 1, padding: "14px", borderRadius: "24px", background: "var(--ink)",
              border: "none", color: "var(--bg)", fontWeight: 600,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: busy ? "not-allowed" : "pointer"
            }}
          >
            {busy ? <Loader size={18} style={{ animation: "ecSpin 1s linear infinite" }} /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
