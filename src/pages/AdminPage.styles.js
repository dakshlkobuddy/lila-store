import { STATUS_COLOR } from "../constants.js";

// Styling for the admin dashboard.
export const s = {
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 },
  heading: { fontSize: 30 },
  tabsRow: { display: "flex", gap: 8, marginBottom: 24, overflowX: "auto" },
  tab: { display: "inline-flex", alignItems: "center", gap: 6 },

  restockCard: { padding: 20, marginTop: 22 },
  restockTitle: { fontSize: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 },
  restockRow: { display: "flex", justifyContent: "space-between", fontSize: 14, padding: "7px 0", borderBottom: "1px solid var(--line)" },

  addBtn: { marginBottom: 18 },
  tableCard: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 560 },
  prodCell: { display: "flex", alignItems: "center", gap: 10 },
  prodThumb: { width: 40, height: 40, borderRadius: 9 },
  prodName: { fontWeight: 600 },
  catCell: { color: "var(--ink-soft)" },
  actionsCell: { display: "flex", gap: 6, justifyContent: "flex-end" },
  iconBtn: { padding: 8 },
  iconBtnDanger: { padding: 8, color: "var(--danger)" },

  orderCard: { padding: 18, marginBottom: 14 },
  orderTop: { display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  orderId: { fontSize: 15 },
  orderMeta: { fontSize: 13, color: "var(--ink-soft)" },
  orderItems: { fontSize: 13, color: "var(--ink-soft)", marginBottom: 8 },
  orderAddr: { fontSize: 13, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 },
  orderTotal: { fontWeight: 700 },

  // dynamic: colour the status dropdown by the order's status
  statusSelect: (status) => ({ width: "auto", padding: "8px 12px", fontWeight: 600, color: STATUS_COLOR[status] }),
};
