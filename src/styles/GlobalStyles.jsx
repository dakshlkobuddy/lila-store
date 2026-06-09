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
        .ec-root{ font-family:'Plus Jakarta Sans',sans-serif; color:var(--ink);
          background:radial-gradient(1200px 500px at 80% -10%, #FBEFDC 0%, transparent 60%),
                     radial-gradient(900px 500px at -10% 10%, #F6E7CF 0%, transparent 55%), var(--bg);
          min-height:100vh; }
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
        .ec-btn-ghost:hover{ background:#fff; border-color:#D9C9B2; }
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
        .ec-chip-on{ background:var(--ink); color:#fff; border-color:var(--ink); }
        .ec-link{ cursor:pointer; }
        .ec-th{ text-align:left; font-size:12px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
          color:var(--ink-soft); padding:12px 14px; border-bottom:1px solid var(--line); }
        .ec-td{ padding:13px 14px; border-bottom:1px solid var(--line); font-size:14px; vertical-align:middle; }
        .ec-scroll::-webkit-scrollbar{ height:6px; } .ec-scroll::-webkit-scrollbar-thumb{ background:#DDCDB6; border-radius:9px; }
      `}</style>
      <style>{`
        @media (max-width:760px){ .ec-nav-desktop{ display:none !important; } .ec-detail{ grid-template-columns:1fr !important; } .ec-gate{ grid-template-columns:1fr !important; } }
        @media (min-width:761px){ .ec-nav-mobile{ display:none !important; } }
      `}</style>
    </>
  );
}
