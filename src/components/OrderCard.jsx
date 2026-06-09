import { STATUS_COLOR, STATUS_FLOW } from "../constants.js";
import { money } from "../lib/format.js";
import { CheckCircle2, Circle, Clock } from "lucide-react";

// One order row in the customer's "My orders" list.
export default function OrderCard({ o }) {
  const activeIdx = STATUS_FLOW.indexOf(o.status);
  const isCancelled = o.status === "Cancelled";

  return (
    <div className="ec-card" style={{ padding: 20, marginBottom: 16 }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <div>
          <strong style={{ fontSize: 15 }}>{o.id}</strong>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
            {new Date(o.createdAt).toLocaleDateString("en-IN", { dateStyle: "medium" })}
          </div>
        </div>
        <span style={{
          fontSize: 13, fontWeight: 700,
          color: STATUS_COLOR[o.status],
          background: STATUS_COLOR[o.status] + "1A",
          padding: "5px 12px", borderRadius: 999, height: "fit-content",
        }}>
          {o.status}
        </span>
      </div>

      {/* Items */}
      <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 14, lineHeight: 1.6 }}>
        {o.items.map((i) =>
          `${i.name}${[i.size, i.colour].filter(Boolean).length ? " (" + [i.size, i.colour].filter(Boolean).join(" · ") + ")" : ""} ×${i.qty}`
        ).join("  •  ")}
      </div>

      {/* Order timeline — only show when not cancelled */}
      {!isCancelled && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14, overflowX: "auto", paddingBottom: 4 }}>
          {STATUS_FLOW.filter(s => s !== "Cancelled").map((step, idx, arr) => {
            const done = STATUS_FLOW.indexOf(step) <= activeIdx;
            const isActive = step === o.status;
            const isLast = idx === arr.length - 1;
            return (
              <div key={step} style={{ display: "flex", alignItems: "center", flex: isLast ? 0 : 1, minWidth: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flexShrink: 0 }}>
                  {done
                    ? <CheckCircle2 size={18} color={isActive ? STATUS_COLOR[step] || "var(--accent)" : "var(--sage)"} fill={isActive ? (STATUS_COLOR[step] || "var(--accent)") + "22" : "transparent"} />
                    : <Circle size={18} color="var(--line)" />
                  }
                  <span style={{
                    fontSize: 10, fontWeight: isActive ? 700 : 500,
                    color: isActive ? (STATUS_COLOR[step] || "var(--accent)") : done ? "var(--ink-soft)" : "var(--line)",
                    whiteSpace: "nowrap",
                  }}>
                    {step}
                  </span>
                </div>
                {!isLast && (
                  <div style={{
                    flex: 1, height: 2, margin: "0 4px", marginBottom: 14,
                    background: STATUS_FLOW.indexOf(arr[idx + 1]) <= activeIdx ? "var(--sage)" : "var(--line)",
                    minWidth: 20,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Total */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
        <span style={{ fontSize: 13, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 5 }}>
          <Clock size={13} /> Placed {new Date(o.createdAt).toLocaleTimeString("en-IN", { timeStyle: "short" })}
        </span>
        <span style={{ fontWeight: 700, fontSize: 15 }}>{money(o.total)}</span>
      </div>
    </div>
  );
}
