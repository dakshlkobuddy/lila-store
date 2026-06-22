// Styling for the cart screen.
export const s = {
  page: { maxWidth: 760, margin: "0 auto", padding: "20px 0" },
  heading: { fontSize: 34, marginBottom: 28, letterSpacing: "-0.5px" },
  
  // Products list
  row: { 
    display: "flex", 
    alignItems: "center", 
    gap: 16, 
    padding: 16, 
    marginBottom: 16, 
    borderRadius: 16,
    background: "var(--surface)",
    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
    border: "1px solid var(--line)"
  },
  thumb: { width: 80, height: 80, borderRadius: 12, flexShrink: 0, objectFit: "cover" },
  info: { flex: 1, minWidth: 0 },
  name: { fontSize: 16, fontWeight: 600, color: "var(--ink)", margin: "0 0 4px 0" },
  variant: { fontSize: 13, color: "var(--ink-soft)", margin: "0 0 8px 0" },
  unitPrice: { color: "var(--ink)", fontSize: 15, fontWeight: 600 },
  
  // Qty controls
  qtyWrap: { 
    display: "flex", 
    alignItems: "center", 
    gap: 8,
    background: "var(--bg2)",
    padding: "4px 6px",
    borderRadius: 10,
    border: "1px solid var(--line)"
  },
  qtyBtn: { padding: 4, minHeight: "auto", color: "var(--ink)", borderRadius: "6px" },
  qty: { width: 24, textAlign: "center", fontWeight: 600, fontSize: 14 },
  
  // Remove button
  removeBtn: { 
    padding: 10, 
    color: "var(--danger)", 
    borderColor: "transparent",
    background: "rgba(220, 38, 38, 0.05)",
    borderRadius: "50%",
    marginLeft: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  },
  
  // Summary card
  summary: { 
    padding: 28, 
    marginTop: 32, 
    borderRadius: 20,
    background: "var(--surface)",
    border: "1px solid var(--line)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)"
  },
  totalRow: { 
    display: "flex", 
    justifyContent: "space-between", 
    alignItems: "center",
    fontSize: 22, 
    fontWeight: 700, 
    marginBottom: 24,
    paddingBottom: 20,
    borderBottom: "1px dashed var(--line)"
  },
  
  // Buttons
  checkoutBtn: { 
    width: "100%", 
    justifyContent: "center", 
    marginBottom: 14,
    padding: "16px 0",
    fontSize: 16,
    borderRadius: 12,
    fontWeight: 600,
    letterSpacing: "0.2px",
    background: "var(--accent)", // Use primary color variable
    color: "#ffffff",
    boxShadow: "0 4px 14px rgba(193, 101, 76, 0.25)",
    border: "none"
  },
  waBtn: { 
    width: "100%", 
    justifyContent: "center", 
    background: "#25D366", 
    color: "#fff",
    padding: "16px 0",
    fontSize: 16,
    borderRadius: 12,
    fontWeight: 600,
    border: "none",
    boxShadow: "0 4px 14px rgba(37, 211, 102, 0.25)"
  },
};
