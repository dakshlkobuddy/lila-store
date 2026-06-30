import { useState } from "react";
import { STATUS_COLOR, STATUS_FLOW } from "../constants.js";
import { money } from "../lib/format.js";
import { CheckCircle2, Circle, Clock, FileText, XCircle, Loader } from "lucide-react";
import { generateInvoice } from "../lib/pdf.js";

// One order row in the customer's "My orders" list.
export default function OrderCard({ o, onCancel }) {
  const [cancelling, setCancelling] = useState(false);
  const activeIdx = STATUS_FLOW.indexOf(o.status);
  const isCancelled = o.status === "Cancelled";
  const items = o.order_items || [];

  return (
    <div className="ec-card" style={{ padding: 20, marginBottom: 16 }}>
      {/* Header row */}
      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
        <div>
          <strong style={{ fontSize: 15 }}>{o.id}</strong>
          <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>
            {new Date(o.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}
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
        {items.map((i) =>
          `${i.product_name}${[i.size, i.colour].filter(Boolean).length ? " (" + [i.size, i.colour].filter(Boolean).join(" · ") + ")" : ""} ×${i.quantity}`
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

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--line)", paddingTop: 14, marginTop: 14, flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontSize: 13, color: "var(--ink-soft)" }}>
          Total <span className="ec-disp" style={{ color: "var(--ink)", fontSize: 18, marginLeft: 6 }}>{money(o.total)}</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {o.status === "Placed" && onCancel && (
            <button 
              className="ec-btn ec-btn-ghost" 
              style={{ padding: "6px 12px", fontSize: 13, color: "var(--danger)", border: "1px solid var(--danger)", background: "transparent" }}
              disabled={cancelling}
              onClick={async () => {
                if (!window.confirm("Are you sure you want to cancel this order?")) return;
                setCancelling(true);
                await onCancel();
                setCancelling(false);
              }}
            >
              {cancelling ? <Loader size={14} style={{ animation: "ecSpin 1s linear infinite" }} /> : <XCircle size={14} />} Cancel Order
            </button>
          )}
          <button 
            className="ec-btn ec-btn-ghost" 
            style={{ padding: "6px 12px", fontSize: 13, color: "var(--accent)", border: "1px solid var(--line)", background: "var(--surface)" }}
            onClick={() => generateInvoice(o)}
          >
            <FileText size={14} /> Download Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
