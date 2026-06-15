// Dashboard metric card (icon + big number + label).
export default function Stat({ label, value, icon: Icon, color }) {
  return (
    <div className="ec-card" style={{ padding: 20 }}>
      <div style={{ width: 38, height: 38, borderRadius: 11, background: color + "1F", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 }}>
        <Icon size={19} color={color} />
      </div>
      <div className="ec-disp" style={{ fontSize: 26, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>{label}</div>
    </div>
  );
}
