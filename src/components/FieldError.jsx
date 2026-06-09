// Small red error line shown under a form field.
export default function FieldError({ msg }) {
  return msg ? <div style={{ color: "var(--danger)", fontSize: 12, marginTop: 5, marginBottom: 10, fontWeight: 600 }}>{msg}</div> : null;
}
