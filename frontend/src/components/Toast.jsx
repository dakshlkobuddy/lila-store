import { AlertTriangle, Check } from "lucide-react";

// Bottom-centre toast message. Renders nothing when there's no toast.
export default function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div style={{ position: "fixed", bottom: 24, left: 0, right: 0, width: "fit-content", margin: "0 auto", zIndex: 50, background: "var(--ink)", color: "var(--bg)", padding: "12px 20px", borderRadius: 999, fontSize: 14, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 10px 30px rgba(0,0,0,.25)", animation: "ecToast .25s ease" }}>
      {toast.type === "warn" ? <AlertTriangle size={16} color="var(--gold)" /> : <Check size={16} color="#8FD08F" />}
      {toast.msg}
    </div>
  );
}
