import { useState } from "react";
import {
  TrendingUp, Box, ClipboardList, AlertTriangle, Plus, Pencil,
  Power, PowerOff, MapPin, Phone, X,
} from "lucide-react";
import { STATUS_FLOW, STATUS_COLOR } from "../constants.js";
import { money } from "../lib/format.js";
import { grid } from "../lib/ui.js";
import Stat from "../components/Stat.jsx";
import StockBadge from "../components/StockBadge.jsx";
import ProductImage from "../components/ProductImage.jsx";
import Empty from "../components/Empty.jsx";
import ProductForm from "../components/forms/ProductForm.jsx";
import { s } from "./AdminPage.styles.js";

// ── Confirm Deactivate Modal ──────────────────────────────────
function ConfirmModal({ productName, isActive, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
    }}>
      <div className="ec-card" style={{ maxWidth: 380, width: "100%", padding: 28, position: "relative" }}>
        <button
          type="button"
          onClick={onCancel}
          style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)" }}
        >
          <X size={18} />
        </button>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: isActive ? "rgba(178,58,46,.12)" : "rgba(94,123,90,.12)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
          {isActive ? <PowerOff size={22} color="var(--danger)" /> : <Power size={22} color="var(--sage)" />}
        </div>
        <h3 className="ec-disp" style={{ fontSize: 20, marginBottom: 8 }}>
          {isActive ? "Deactivate product?" : "Reactivate product?"}
        </h3>
        <p style={{ fontSize: 14, color: "var(--ink-soft)", marginBottom: 22, lineHeight: 1.6 }}>
          <strong style={{ color: "var(--ink)" }}>{productName}</strong>
          {isActive
            ? " will be hidden from customers. Existing orders will not be affected."
            : " will become visible to customers again."}
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <button className="ec-btn ec-btn-ghost" style={{ flex: 1, justifyContent: "center" }} onClick={onCancel}>Cancel</button>
          <button
            className="ec-btn"
            style={{
              flex: 1, justifyContent: "center",
              background: isActive ? "var(--danger)" : "var(--sage)",
              color: "#fff", border: "none",
            }}
            onClick={onConfirm}
          >
            {isActive ? <><PowerOff size={15} /> Deactivate</> : <><Power size={15} /> Reactivate</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage({ store }) {
  const {
    isAdmin, go, adminTab, setAdminTab,
    revenue, orders, products, lowStock, outStock,
    showForm, setShowForm, editingProduct, setEditingProduct,
    saveProduct, toggleProduct, setOrderStatus,
    uploadProductImage, deleteProductImage,
  } = store;

  const [confirmToggle, setConfirmToggle] = useState(null); // { id, name, is_active }
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");

  if (!isAdmin) {
    return <Empty msg="Admin access required." action={<button className="ec-btn ec-btn-primary" onClick={() => go("home")}>Back to shop</button>} />;
  }

  const handleToggleClick = (p) => setConfirmToggle({ id: p.id, name: p.name, is_active: p.is_active });
  const handleToggleConfirm = () => { toggleProduct(confirmToggle.id, confirmToggle.is_active); setConfirmToggle(null); };

  const filteredOrders = orderStatusFilter === "All"
    ? orders
    : orders.filter((o) => o.status === orderStatusFilter);

  return (
    <div>
      {confirmToggle && (
        <ConfirmModal
          productName={confirmToggle.name}
          isActive={confirmToggle.is_active}
          onConfirm={handleToggleConfirm}
          onCancel={() => setConfirmToggle(null)}
        />
      )}

      <div style={s.header}>
        <h1 className="ec-disp ec-admin-heading" style={s.heading}>Dashboard</h1>
      </div>

      <div className="ec-scroll" style={s.tabsRow}>
        {[["overview", "Overview", TrendingUp], ["products", "Products", Box], ["orders", "Orders", ClipboardList]].map(([k, label, Icon]) => (
          <span key={k} className={"ec-chip" + (adminTab === k ? " ec-chip-on" : "")} onClick={() => setAdminTab(k)} style={s.tab}>
            <Icon size={15} /> {label}
          </span>
        ))}
      </div>

      {adminTab === "overview" && (
        <>
          <div className="ec-stat-grid" style={grid(180)}>
            <Stat label="Revenue" value={money(revenue)} icon={TrendingUp} color="var(--sage)" />
            <Stat label="Orders" value={orders.length} icon={ClipboardList} color="var(--accent)" />
            <Stat label="Products" value={products.filter(p => p.is_active).length} icon={Box} color="#5C6B79" />
            <Stat label="Low / out of stock" value={lowStock.length + outStock.length} icon={AlertTriangle} color="var(--gold)" />
          </div>
          {(lowStock.length > 0 || outStock.length > 0) && (
            <div className="ec-card" style={s.restockCard}>
              <h3 className="ec-disp" style={s.restockTitle}><AlertTriangle size={18} color="var(--gold)" /> Restock soon</h3>
              {[...outStock, ...lowStock].map((p) => (
                <div key={p.id} style={s.restockRow}>
                  <span>{p.name}</span><StockBadge stock={p.stock} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {adminTab === "products" && (
        <>
          {!showForm && <button className="ec-btn ec-btn-primary" style={s.addBtn} onClick={() => { setEditingProduct(null); setShowForm(true); }}><Plus size={16} /> Add product</button>}
          {showForm && (
            <ProductForm
              key={editingProduct?.id || "new"}
              initial={editingProduct}
              onSave={saveProduct}
              onCancel={() => { setShowForm(false); setEditingProduct(null); }}
              onUploadImage={uploadProductImage}
              onDeleteImage={deleteProductImage}
            />
          )}
          <div className="ec-card ec-scroll ec-admin-table-wrap" style={s.tableCard}>
            <table style={s.table}>
              <thead><tr><th className="ec-th">Product</th><th className="ec-th">Category</th><th className="ec-th">Price</th><th className="ec-th">Stock</th><th className="ec-th">Status</th><th className="ec-th"></th></tr></thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ opacity: p.is_active ? 1 : 0.5 }}>
                    <td className="ec-td"><div style={s.prodCell}><ProductImage product={p} className="" style={s.prodThumb} /><span style={s.prodName}>{p.name}</span></div></td>
                    <td className="ec-td ec-admin-col-cat" style={s.catCell}>{p.category}</td>
                    <td className="ec-td">{money(p.price)}</td>
                    <td className="ec-td"><StockBadge stock={p.stock} /></td>
                    <td className="ec-td">
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 999,
                        background: p.is_active ? "rgba(94,123,90,.12)" : "rgba(178,58,46,.12)",
                        color: p.is_active ? "var(--sage)" : "var(--danger)",
                      }}>
                        {p.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="ec-td">
                      <div style={s.actionsCell}>
                        <button className="ec-btn ec-btn-ghost" style={s.iconBtn} onClick={() => { setEditingProduct(p); setShowForm(true); window.scrollTo?.(0, 0); }}><Pencil size={15} /></button>
                        <button
                          className="ec-btn ec-btn-ghost"
                          style={p.is_active ? s.iconBtnDanger : { ...s.iconBtn, color: "var(--sage)" }}
                          onClick={() => handleToggleClick(p)}
                          title={p.is_active ? "Deactivate" : "Reactivate"}
                        >
                          {p.is_active ? <PowerOff size={15} /> : <Power size={15} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {adminTab === "orders" && (
        <>
          {/* Status filter tabs */}
          <div className="ec-scroll" style={{ display: "flex", gap: 8, marginBottom: 16, paddingBottom: 4 }}>
            {["All", ...STATUS_FLOW].map((st) => (
              <span
                key={st}
                onClick={() => setOrderStatusFilter(st)}
                style={{
                  fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 999, cursor: "pointer",
                  whiteSpace: "nowrap",
                  border: "1px solid " + (orderStatusFilter === st ? (STATUS_COLOR[st] || "var(--accent)") : "var(--line)"),
                  background: orderStatusFilter === st ? (STATUS_COLOR[st] ? STATUS_COLOR[st] + "1A" : "var(--accent)") : "var(--surface)",
                  color: orderStatusFilter === st ? (STATUS_COLOR[st] || "var(--accent)") : "var(--ink)",
                }}
              >
                {st}{st !== "All" && orders.filter(o => o.status === st).length > 0 && (
                  <span style={{ marginLeft: 6, background: STATUS_COLOR[st] + "33", borderRadius: 999, padding: "1px 7px", fontSize: 11 }}>
                    {orders.filter(o => o.status === st).length}
                  </span>
                )}
              </span>
            ))}
          </div>

          {filteredOrders.length === 0
            ? <Empty msg={orderStatusFilter === "All" ? "No orders yet." : `No ${orderStatusFilter} orders.`} />
            : filteredOrders.map((o) => (
              <div key={o.id} className="ec-card" style={s.orderCard}>
                <div style={s.orderTop}>
                  <div>
                    <strong style={s.orderId}>{o.id}</strong>
                    <div style={s.orderMeta}>{o.customer_name} · {new Date(o.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</div>
                  </div>
                  <select value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value)} className="ec-input" style={s.statusSelect(o.status)}>
                    {STATUS_FLOW.map((x) => <option key={x}>{x}</option>)}
                  </select>
                </div>
                <div style={s.orderItems}>
                  {(o.order_items || []).map((i) =>
                    `${i.product_name}${[i.size, i.colour].filter(Boolean).length ? " (" + [i.size, i.colour].filter(Boolean).join(" · ") + ")" : ""} ×${i.quantity}`
                  ).join(",  ")}
                </div>
                <div style={s.orderAddr}>
                  <MapPin size={13} /> {o.shipping?.address}, {o.shipping?.city}{o.shipping?.state ? ", " + o.shipping.state : ""}{o.shipping?.pincode ? " - " + o.shipping.pincode : ""} &nbsp;·&nbsp; <Phone size={13} /> {o.shipping?.phone}
                </div>
                <div style={s.orderTotal}>Total: {money(o.total)}</div>
              </div>
            ))
          }
        </>
      )}
    </div>
  );
}
