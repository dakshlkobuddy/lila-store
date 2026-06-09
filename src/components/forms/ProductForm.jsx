import { useState, useRef } from "react";
import { Check, X, Camera, Image as ImageIcon, Loader } from "lucide-react";
import { CATEGORIES } from "../../constants.js";
import { errBorder } from "../../lib/validation.js";
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

// Admin form to add or edit a product, including photo capture/upload,
// size & colour options, and validation.
export default function ProductForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(() => ({
    sizes: [],
    colours: [],
    ...(initial || { name: "", category: "", price: "", stock: "", image: "", description: "" }),
  }));
  const [sizeInput, setSizeInput] = useState("");
  const [colourInput, setColourInput] = useState("");
  const [errors, setErrors] = useState({});
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState("");
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

  const submit = () => {
    if (validate()) onSave({ ...f, name: f.name.trim(), price: Number(f.price), stock: Number(f.stock) });
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

  // ── Smart image processor ──
  const MAX_INPUT_MB = 15;
  const TARGET_PX = 600;
  const MAX_OUTPUT_KB = 120;

  const handleFile = (file) => {
    if (!file) return;
    if (fileRef.current) fileRef.current.value = "";

    if (file.size > MAX_INPUT_MB * 1024 * 1024) {
      setImageError(`Photo too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Please use a photo under ${MAX_INPUT_MB} MB.`);
      return;
    }

    setImageLoading(true);
    setImageError("");

    const reader = new FileReader();
    reader.onerror = () => { setImageLoading(false); setImageError("Could not read this file. Try another photo."); };

    reader.onload = (ev) => {
      const img = new window.Image();
      img.onerror = () => { setImageLoading(false); setImageError("This file doesn't look like a valid image. Try a JPG or PNG."); };

      img.onload = () => {
        try {
          const pad = Math.round(TARGET_PX * 0.04);
          const box = TARGET_PX - pad * 2;
          const scale = Math.min(box / img.width, box / img.height, 1);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);

          const canvas = document.createElement("canvas");
          canvas.width = TARGET_PX;
          canvas.height = TARGET_PX;
          const ctx = canvas.getContext("2d");
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, TARGET_PX, TARGET_PX);
          if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";
          ctx.drawImage(img, (TARGET_PX - w) / 2, (TARGET_PX - h) / 2, w, h);

          const maxBase64Chars = Math.round(MAX_OUTPUT_KB * 1024 * 1.37);
          let quality = 0.85;
          let dataUrl = canvas.toDataURL("image/jpeg", quality);

          while (dataUrl.length > maxBase64Chars && quality > 0.25) {
            quality -= 0.1;
            dataUrl = canvas.toDataURL("image/jpeg", Math.round(quality * 100) / 100);
          }

          set("image", dataUrl);
          setImageLoading(false);
        } catch (err) {
          console.error("Image processing failed:", err);
          try { set("image", ev.target.result); } catch (_e) { /* ignore */ }
          setImageError("Photo was saved, but compression failed — it may be larger than usual.");
          setImageLoading(false);
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
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

        {/* Product photo */}
        <div style={{ gridColumn: "1 / -1" }}>
          <L>Product photo</L>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ width: 88, height: 88, borderRadius: 12, border: "1px solid var(--line)", overflow: "hidden", flexShrink: 0, background: "var(--bg2)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
              {f.image ? <img src={f.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <ImageIcon size={24} color="#B6A893" />}
              {imageLoading && (
                <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,.8)", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 12 }}>
                  <Loader size={22} color="var(--accent)" style={{ animation: "ecSpin 1s linear infinite" }} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <label className={"ec-btn ec-btn-primary" + (imageLoading ? " ec-btn-disabled" : "")} style={{ cursor: imageLoading ? "wait" : "pointer", opacity: imageLoading ? 0.6 : 1 }}>
                <Camera size={16} /> {imageLoading ? "Processing…" : f.image ? "Change photo" : "Take / upload photo"}
                <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} disabled={imageLoading} onChange={(e) => handleFile(e.target.files && e.target.files[0])} />
              </label>
              {f.image && !imageLoading && <button type="button" className="ec-btn ec-btn-ghost" onClick={() => { set("image", ""); setImageError(""); }}>Remove</button>}
            </div>
          </div>
          {imageError && <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 8, fontWeight: 600 }}>{imageError}</p>}
          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8 }}>Any photo works — phone camera, gallery, or screenshot. It's automatically resized, compressed, and fitted onto a clean white square.</p>
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
            value={f.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="799"
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
        <button className="ec-btn ec-btn-primary" onClick={submit}><Check size={16} />{f.id ? "Save changes" : "Add product"}</button>
        <button className="ec-btn ec-btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}
