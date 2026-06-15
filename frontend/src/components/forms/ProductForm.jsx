import { useState, useRef } from "react";
import { Check, X, Camera, Image as ImageIcon, Loader } from "lucide-react";
import { CATEGORIES } from "../../constants.js";
import { errBorder } from "../../lib/validation.js";
import { validateImage } from "../../lib/imageValidation.js";
import FieldError from "../FieldError.jsx";

// ── Size presets per category ──────────────────────────────────
// Bra-type categories get bra sizes; everything else gets clothing sizes.
const BRA_CATEGORIES = ["Bra", "Sports Bra"];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "Free Size"];

const BRA_SIZES = [
  "28A", "30A", "32A", "34A", "36A",
  "28B", "30B", "32B", "34B", "36B", "38B",
  "28C", "30C", "32C", "34C", "36C", "38C",
  "32D", "34D", "36D", "38D",
];

function getSizePresets(category) {
  return BRA_CATEGORIES.includes(category) ? BRA_SIZES : CLOTHING_SIZES;
}

// Admin form to add or edit a product, including photo upload to Supabase Storage,
// size & colour options, and validation.
export default function ProductForm({ initial, onSave, onCancel, onUploadImage, onDeleteImage }) {
  const [f, setF] = useState(() => ({
    sizes: [],
    colours: [],
    ...(initial
      ? { ...initial, image_url: initial.image_url || "" }
      : { name: "", category: "", price: "", stock: "", image_url: "", description: "", badge: "" }),
  }));
  const [sizeInput, setSizeInput] = useState("");
  const [colourInput, setColourInput] = useState("");
  const [errors, setErrors] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef(null);

  const set = (k, v) => { setF((p) => ({ ...p, [k]: v })); setErrors((e) => ({ ...e, [k]: "" })); };
  const arr = (k) => f[k] || [];
  const toggleArr = (k, v) => {
    const next = arr(k).includes(v) ? arr(k).filter((x) => x !== v) : [...arr(k), v];
    setF((p) => ({ ...p, [k]: next }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };
  const addArr = (k, v) => {
    const t = (v || "").trim();
    if (t && !arr(k).includes(t)) {
      setF((p) => ({ ...p, [k]: [...arr(k), t] }));
      setErrors((e) => ({ ...e, [k]: "" }));
    }
  };
  const removeArr = (k, v) => set(k, arr(k).filter((x) => x !== v));

  // When category changes, clear sizes so stale sizes don't linger
  const handleCategoryChange = (cat) => {
    setF((p) => ({ ...p, category: cat, sizes: [] }));
    setErrors((e) => ({ ...e, category: "", sizes: "" }));
  };

  const validate = () => {
    const e = {};
    if (f.name.trim().length < 2) e.name = "Product name must be at least 2 characters.";
    if (!f.category) e.category = "Please select a category.";
    if (f.price === "" || isNaN(Number(f.price)) || Number(f.price) <= 0)
      e.price = "Enter a valid price greater than ₹0.";
    if (
      f.stock === "" ||
      isNaN(Number(f.stock)) ||
      Number(f.stock) < 0 ||
      !Number.isInteger(Number(f.stock))
    )
      e.stock = "Stock must be 0 or a whole positive number.";
    if (!arr("sizes").length) e.sizes = "Please select or add at least one size.";
    if (!arr("colours").length) e.colours = "Please add at least one colour.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async () => {
    if (!validate() || saving) return;
    setSaving(true);
    try {
      await onSave({
        ...f,
        name: f.name.trim(),
        price: Number(f.price),
        stock: Number(f.stock),
        image_url: f.image_url || null,
      });
    } finally {
      setSaving(false);
    }
  };

  // ── Image upload to Supabase Storage ──
  const handleFile = async (file) => {
    if (!file) return;
    if (fileRef.current) fileRef.current.value = "";

    // Validate format and size
    const validation = validateImage(file);
    if (!validation.valid) {
      setImageError(validation.error);
      return;
    }

    setImageLoading(true);
    setImageError("");

    try {
      // Delete old image if replacing
      if (f.image_url && onDeleteImage) {
        await onDeleteImage(f.image_url);
      }

      const publicUrl = await onUploadImage(file);
      set("image_url", publicUrl);
    } catch (err) {
      console.error("Image upload failed:", err);
      setImageError("Upload failed: " + (err.message || "Please try again."));
    } finally {
      setImageLoading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (f.image_url && onDeleteImage) {
      try { await onDeleteImage(f.image_url); } catch (_e) { /* ignore */ }
    }
    set("image_url", "");
    setImageError("");
  };

  const L = ({ children, required }) => (
    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--ink-soft)", display: "block", marginBottom: 6 }}>
      {children}
      {required && <span style={{ color: "var(--danger)", marginLeft: 3 }}>*</span>}
    </label>
  );

  const pillS = (on) => ({
    fontSize: 12,
    fontWeight: 600,
    padding: "6px 11px",
    borderRadius: 999,
    cursor: "pointer",
    border: "1px solid " + (on ? "var(--accent)" : "var(--line)"),
    background: on ? "var(--accent)" : "var(--surface)",
    color: on ? "#fff" : "var(--ink)",
    userSelect: "none",
    transition: "all .15s",
  });

  const tagS = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    padding: "6px 12px",
    borderRadius: 999,
    background: "var(--bg2)",
    border: "1px solid var(--line)",
  };

  const sizePresets = getSizePresets(f.category);
  const isBraCategory = BRA_CATEGORIES.includes(f.category);

  return (
    <div className="ec-card" style={{ padding: 22, marginBottom: 22 }}>
      <h3 className="ec-disp" style={{ fontSize: 20, marginBottom: 18 }}>{f.id ? "Edit product" : "Add a product"}</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>

        {/* Product name */}
        <div style={{ gridColumn: "1 / -1" }}>
          <L required>Product name</L>
          <input
            className="ec-input"
            style={errBorder(errors.name)}
            value={f.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Lace Balconette Bra"
          />
          <FieldError msg={errors.name} />
        </div>

        {/* Product photo — Supabase Storage */}
        <div style={{ gridColumn: "1 / -1" }}>
          <L>Product photo</L>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 88, height: 88, borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden", flexShrink: 0, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {f.image_url ? <img src={f.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={24} color="#B6A893" />}
              {imageLoading && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.8)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }}>
                  <Loader size={22} color="var(--accent)" style={{ animation: "ecSpin 1s linear infinite" }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <label className={"ec-btn ec-btn-primary" + (imageLoading ? " ec-btn-disabled" : "")} style={{ cursor: imageLoading ? "wait" : "pointer", opacity: imageLoading ? 0.6 : 1 }}>
                <Camera size={16} /> {imageLoading ? "Uploading…" : f.image_url ? "Change photo" : "Upload photo"}
                <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.webp" style={{ display: "none" }} disabled={imageLoading} onChange={(e) => handleFile(e.target.files && e.target.files[0])} />
              </label>
              {f.image_url && !imageLoading && <button type="button" className="ec-btn ec-btn-ghost" onClick={handleRemoveImage}>Remove</button>}
            </div>
          </div>
          {imageError && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 8, fontWeight: 600 }}>{imageError}</p>}
          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8 }}>Accepted formats: JPG, PNG, WEBP. Maximum size: 5 MB.</p>
        </div>

        {/* Category */}
        <div>
          <L required>Category</L>
          <select
            className="ec-input"
            style={errBorder(errors.category)}
            value={f.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="" disabled>— Select a category —</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <FieldError msg={errors.category} />
        </div>

        {/* Price */}
        <div>
          <L required>Price (₹)</L>
          <input
            className="ec-input"
            style={errBorder(errors.price)}
            type="number"
            min="0"
            step="0.01"
            value={f.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="799.00"
          />
          <FieldError msg={errors.price} />
        </div>

        {/* Stock */}
        <div style={{ gridColumn: "1 / -1" }}>
          <L required>Stock quantity</L>
          <input
            className="ec-input"
            style={{ ...errBorder(errors.stock), maxWidth: 220 }}
            type="number"
            min="0"
            value={f.stock}
            onChange={(e) => set("stock", e.target.value)}
            placeholder="12"
          />
          <FieldError msg={errors.stock} />
        </div>

        {/* Sizes — mandatory */}
        <div style={{ gridColumn: "1 / -1" }}>
          <L required>Sizes</L>
          {isBraCategory && (
            <p style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 8 }}>
              Bra sizes — select all that apply, or type a custom size below.
            </p>
          )}
          <div
            style={{
              display: "flex",
              gap: 6,
              flexWrap: "wrap",
              marginBottom: 8,
              padding: isBraCategory ? "10px 12px" : 0,
              borderRadius: isBraCategory ? 10 : 0,
              background: isBraCategory ? "var(--bg2)" : "transparent",
              border: isBraCategory ? "1px solid var(--line)" : "none",
            }}
          >
            {sizePresets.map((s) => (
              <span key={s} onClick={() => toggleArr("sizes", s)} style={pillS(arr("sizes").includes(s))}>{s}</span>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="ec-input"
              style={errBorder(errors.sizes)}
              placeholder={isBraCategory ? "Custom size (e.g. 40D)" : "Custom size (e.g. 34C)"}
              value={sizeInput}
              onChange={(e) => setSizeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArr("sizes", sizeInput); setSizeInput(""); } }}
            />
            <button type="button" className="ec-btn ec-btn-ghost" onClick={() => { addArr("sizes", sizeInput); setSizeInput(""); }}>Add</button>
          </div>
          <FieldError msg={errors.sizes} />
          {arr("sizes").length > 0 && (
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
              {arr("sizes").map((s) => (
                <span key={s} style={tagS}>{s} <X size={12} style={{ cursor: "pointer" }} onClick={() => removeArr("sizes", s)} /></span>
              ))}
            </div>
          )}
        </div>

        {/* Colours — mandatory */}
        <div style={{ gridColumn: "1 / -1" }}>
          <L required>Colours</L>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              className="ec-input"
              style={errBorder(errors.colours)}
              placeholder="Add a colour (e.g. Black)"
              value={colourInput}
              onChange={(e) => setColourInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addArr("colours", colourInput); setColourInput(""); } }}
            />
            <button type="button" className="ec-btn ec-btn-ghost" onClick={() => { addArr("colours", colourInput); setColourInput(""); }}>Add</button>
          </div>
          <FieldError msg={errors.colours} />
          {arr("colours").length > 0 && (
            <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginTop: 10 }}>
              {arr("colours").map((c) => (
                <span key={c} style={tagS}>{c} <X size={12} style={{ cursor: "pointer" }} onClick={() => removeArr("colours", c)} /></span>
              ))}
            </div>
          )}
        </div>

        {/* Description */}
        <div style={{ gridColumn: "1 / -1" }}>
          <L>Description</L>
          <textarea className="ec-input" rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} placeholder="Short description customers will see" />
        </div>
      </div>

      {/* Required fields note */}
      <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 12 }}>
        Fields marked with <span style={{ color: "var(--danger)" }}>*</span> are required.
      </p>

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button className="ec-btn ec-btn-primary" onClick={submit} disabled={saving} style={{ opacity: saving ? 0.7 : 1 }}>
          {saving ? <><Loader size={16} style={{ animation: "ecSpin 1s linear infinite" }} /> Saving…</> : <><Check size={16} />{f.id ? "Save changes" : "Add product"}</>}
        </button>
        <button className="ec-btn ec-btn-ghost" onClick={onCancel} disabled={saving}>Cancel</button>
      </div>
    </div>
  );
}
