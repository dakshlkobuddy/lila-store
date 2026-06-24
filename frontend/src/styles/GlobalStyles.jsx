// All shared CSS lives here: theme variables, utility classes, and the
// responsive (mobile) rules. Rendered once near the top of <App/>.
export default function GlobalStyles() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
        :root{
          --bg:#F7F1E7; --bg2:#F1E7D6; --surface:#FFFDF9; --ink:#2A211B; --ink-soft:#6B5D52;
          --line:#E7DCC9; --accent:#C0573B; --accent-dark:#A2452D; --gold:#C8923E;
          --sage:#5E7B5A; --danger:#B23A2E;
        }
        .dark {
          --bg:#1C1715; --bg2:#261E1A; --surface:#231C18; --ink:#F7F1E7; --ink-soft:#B6A893;
          --line:#382D28; --accent:#D46D51; --accent-dark:#E5856C; --gold:#DDA754;
          --sage:#759A71; --danger:#D15243;
        }
        *,*::before,*::after{ box-sizing:border-box; }
        html, body { margin:0; padding:0; overflow-x:hidden; }
        .ec-root{ font-family:'Plus Jakarta Sans',sans-serif; color:var(--ink);
          background-color: var(--bg);
          background-image: radial-gradient(1200px 500px at 80% -10%, #FBEFDC 0%, transparent 60%),
                            radial-gradient(900px 500px at -10% 10%, #F6E7CF 0%, transparent 55%);
          min-height:100vh; transition: background-color 0.25s ease, color 0.25s ease; overflow-x:hidden; }
        .dark.ec-root{
          background-image: radial-gradient(1200px 500px at 80% -10%, rgba(212,109,81,0.06) 0%, transparent 60%),
                            radial-gradient(900px 500px at -10% 10%, rgba(200,146,62,0.05) 0%, transparent 55%);
        }
        .ec-disp{ font-family:'Fraunces',serif; }
        .ec-input{ width:100%; border:1px solid var(--line); background:var(--surface); border-radius:12px;
          padding:11px 14px; font-family:inherit; font-size:15px; color:var(--ink); transition:.15s; }
        .ec-input:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 0 3px rgba(192,87,59,.14); }
        .ec-input::placeholder{ color:#B6A893; }
        .ec-btn{ font-family:inherit; font-weight:600; border-radius:999px; cursor:pointer; border:1px solid transparent;
          display:inline-flex; align-items:center; gap:8px; transition:transform .12s, background .15s, box-shadow .15s; font-size:14px; }
        .ec-btn:active{ transform:translateY(1px); }
        .ec-btn-primary{ background:var(--accent); color:#fff; padding:11px 20px; box-shadow:0 6px 16px rgba(192,87,59,.25); }
        .ec-btn-primary:hover{ background:var(--accent-dark); }
        .ec-btn-primary:disabled{ background:#D9C7B5; box-shadow:none; cursor:not-allowed; }
        .ec-btn-ghost{ background:transparent; color:var(--ink); border-color:var(--line); padding:10px 18px; }
        .ec-btn-ghost:hover{ background:var(--surface); border-color:var(--line); }
        .ec-card{ background:var(--surface); border:1px solid var(--line); border-radius:18px; }
        .ec-tile{ background:var(--surface); border:1px solid var(--line); border-radius:18px; overflow:hidden;
          transition:transform .18s ease, box-shadow .18s ease; opacity:0; animation:ecRise .5s ease forwards; }
        .ec-tile:hover{ transform:translateY(-4px); box-shadow:0 16px 30px -18px rgba(42,33,27,.35); }
        @keyframes ecRise{ from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:translateY(0);} }
        @keyframes ecToast{ from{opacity:0; transform:translateY(12px);} to{opacity:1; transform:translateY(0);} }
        @keyframes ecSpin{ from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .ec-chip{ font-size:13px; font-weight:600; padding:7px 15px; border-radius:999px; cursor:pointer; border:1px solid var(--line);
          background:var(--surface); color:var(--ink-soft); transition:.15s; white-space:nowrap; }
        .ec-chip:hover{ border-color:var(--accent); color:var(--accent); }
        .ec-chip-on{ background:var(--ink); color:var(--bg); border-color:var(--ink); }
        .ec-link{ cursor:pointer; }
        .ec-th{ text-align:left; font-size:12px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
          color:var(--ink-soft); padding:12px 14px; border-bottom:1px solid var(--line); }
        .ec-td{ padding:13px 14px; border-bottom:1px solid var(--line); font-size:14px; vertical-align:middle; }
        .ec-scroll::-webkit-scrollbar{ height:6px; } .ec-scroll::-webkit-scrollbar-thumb{ background:#DDCDB6; border-radius:9px; }
      `}</style>

      {/* ── Nav show/hide ─────────────────────────────────────────── */}
      <style>{`
        @media (max-width:760px){ .ec-nav-desktop{ display:none !important; } }
        @media (min-width:761px){ .ec-nav-mobile{ display:none !important; } }
      `}</style>

      {/* ── Layout: detail & gate grids ───────────────────────────── */}
      <style>{`
        .ec-detail{ display:grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap:30px; }
        .ec-gate{  display:grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap:24px; }
        @media (max-width:760px){
          .ec-detail{ grid-template-columns:1fr !important; gap:20px; }
          .ec-gate{   grid-template-columns:1fr !important; gap:16px; }
        }
      `}</style>

      {/* ── Wrapper padding ───────────────────────────────────────── */}
      <style>{`
        .ec-wrap{ max-width:1120px; margin:0 auto; padding:0 20px; }
        @media (max-width:480px){ .ec-wrap{ padding:0 14px; } }
      `}</style>

      {/* ── Hero section ──────────────────────────────────────────── */}
      <style>{`
        @media (max-width:600px){
          .ec-hero{ padding:28px 20px !important; margin-bottom:20px !important; }
          .ec-hero-title{ font-size:clamp(22px,7vw,32px) !important; }
          .ec-hero-lead{ font-size:14px !important; margin-bottom:16px !important; }
        }
      `}</style>

      {/* ── Toolbar (search + sort + filter) ─────────────────────── */}
      <style>{`
        @media (max-width:520px){
          .ec-toolbar{ gap:8px !important; }
          .ec-toolbar .ec-input{ font-size:14px; }
          .ec-sort-select{ min-width:0; font-size:13px; }
        }
      `}</style>

      {/* ── Product grid ──────────────────────────────────────────── */}
      <style>{`
        /* Force 2 columns on phones, auto-fill on larger */
        @media (max-width:480px){
          .ec-product-grid{ grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap:12px !important; }
          .ec-tile .ec-tile-name{ font-size:13px !important; }
          .ec-tile .ec-tile-price{ font-size:16px !important; }
        }
      `}</style>

      {/* ── Cart page ─────────────────────────────────────────────── */}
      <style>{`
        .ec-cart-row{ display:flex; align-items:center; gap:16px; padding:16px; margin-bottom:16px; }
        @media (max-width:520px){
          .ec-cart-row{ flex-wrap:wrap; gap:12px; padding:14px; }
          .ec-cart-thumb{ width:64px !important; height:64px !important; }
          .ec-cart-heading{ font-size:26px !important; }
          .ec-cart-summary{ padding:20px !important; }
          .ec-cart-total-row{ font-size:18px !important; }
        }
      `}</style>

      {/* ── Checkout & Confirmation ───────────────────────────────── */}
      <style>{`
        .ec-narrow-page{ max-width:560px; margin:0 auto; }
        @media (max-width:600px){
          .ec-narrow-page{ max-width:100% !important; }
          .ec-checkout-heading{ font-size:24px !important; }
        }
      `}</style>

      {/* ── Product detail page ───────────────────────────────────── */}
      <style>{`
        @media (max-width:760px){
          .ec-detail-title{ font-size:24px !important; }
          .ec-detail-price{ font-size:22px !important; }
        }
      `}</style>

      {/* ── Admin dashboard ───────────────────────────────────────── */}
      <style>{`
        @media (max-width:600px){
          .ec-admin-heading{ font-size:22px !important; }
          .ec-admin-table-wrap{ font-size:13px; }
          .ec-admin-table-wrap .ec-th,
          .ec-admin-table-wrap .ec-td{ padding:10px 10px; }
          /* Hide less important columns on phones */
          .ec-admin-col-cat{ display:none; }
        }
        @media (max-width:480px){
          .ec-stat-grid{ grid-template-columns: repeat(2, minmax(0,1fr)) !important; gap:12px !important; }
        }
      `}</style>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <style>{`
        @media (max-width:480px){
          .ec-footer-grid{ grid-template-columns:1fr 1fr !important; gap:20px !important; }
          .ec-footer-brand{ grid-column: 1 / -1; }
        }
      `}</style>

      {/* ── Auth form gate ────────────────────────────────────────── */}
      <style>{`
        @media (max-width:520px){
          .ec-auth-card{ padding:22px 18px !important; margin:16px 0 !important; }
        }
      `}</style>

      {/* ── Utility: touch-friendly tap targets ──────────────────── */}
      <style>{`
        @media (max-width:760px){
          .ec-btn{ min-height:44px; }
          .ec-chip{ min-height:38px; }
          .ec-input{ min-height:46px; }
        }
      `}</style>
    </>
  );
}
