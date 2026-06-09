// Small reusable validators used by the forms.
export const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((v || "").trim());
export const onlyDigits = (v) => (v || "").replace(/\D/g, "");
export const isPhoneIN = (v) => { const d = onlyDigits(v); return /^[6-9]\d{9}$/.test(d) || (d.length === 12 && d.startsWith("91") && /^[6-9]\d{9}$/.test(d.slice(2))); };
export const isPin = (v) => /^[1-9]\d{5}$/.test(onlyDigits(v));

// Inline style applied to an input when its field has an error.
export const errBorder = (on) => on ? { borderColor: "var(--danger)", boxShadow: "0 0 0 3px rgba(178,58,46,.12)" } : {};
