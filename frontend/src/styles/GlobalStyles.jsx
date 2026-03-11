const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --void:    #050404;
      --deep:    #0d0b0a;
      --surface: #141210;
      --card:    #1c1916;
      --lift:    #242019;
      --border:  rgba(255,255,255,0.07);
      --border2: rgba(255,255,255,0.12);
      --gold:    #c9a84c;
      --gold2:   #e8d5a3;
      --gold3:   #f5ead0;
      --text:    #f0ebe3;
      --muted:   #7a7068;
      --dim:     #4a4438;
      --rose:    #c0392b;
      --emerald: #1a7a4a;
    }

    html { scroll-behavior: smooth; }
    body {
      font-family: 'Jost', sans-serif;
      background: var(--void);
      color: var(--text);
      line-height: 1.6;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }

    h1,h2,h3,h4 {
      font-family: 'Playfair Display', serif;
      font-weight: 300;
      letter-spacing: 0.01em;
    }
    input, select, textarea, button { font-family: 'Jost', sans-serif; }
    button { cursor: pointer; }

    /* ── Scrollbar ── */
    ::-webkit-scrollbar { width: 3px; height: 3px; }
    ::-webkit-scrollbar-track { background: var(--void); }
    ::-webkit-scrollbar-thumb { background: var(--gold); border-radius: 2px; }

    /* ── Keyframes ── */
    @keyframes fadeUp    { from { opacity:0; transform:translateY(28px); } to { opacity:1; transform:translateY(0); } }
    @keyframes fadeIn    { from { opacity:0; } to { opacity:1; } }
    @keyframes spin      { to { transform: rotate(360deg); } }
    @keyframes pulse     { 0%,100%{opacity:1} 50%{opacity:.4} }
    @keyframes shimmer   { 0%{background-position:-400% 0} 100%{background-position:400% 0} }
    @keyframes goldPulse { 0%,100%{box-shadow:0 0 0 0 rgba(201,168,76,0)} 50%{box-shadow:0 0 0 8px rgba(201,168,76,0)} }
    @keyframes marquee   { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
    @keyframes modalIn   { from{opacity:0;transform:scale(.94) translateY(20px)} to{opacity:1;transform:scale(1) translateY(0)} }
    @keyframes toastIn   { from{opacity:0;transform:translateY(16px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }

    /* ── Utility animation classes ── */
    .fu { animation: fadeUp .65s cubic-bezier(.16,1,.3,1) both; }
    .fi { animation: fadeIn .5s ease both; }

    /* ── Glass effect ── */
    .glass {
      background: rgba(255,255,255,0.03);
      backdrop-filter: blur(20px);
      border: 1px solid var(--border);
    }

    /* ── Film grain overlay ── */
    body::before {
      content: '';
      position: fixed; inset: 0; z-index: 9999; pointer-events: none;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
      opacity: .025;
    }

    /* ── Gold shimmer text ── */
    .gold-text {
      background: linear-gradient(90deg, var(--gold) 0%, var(--gold3) 50%, var(--gold) 100%);
      background-size: 200% auto;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: shimmer 4s linear infinite;
    }

    /* ── Input focus ring ── */
    .inp:focus {
      outline: none;
      border-color: var(--gold) !important;
      box-shadow: 0 0 0 3px rgba(201,168,76,.1);
    }

    /* ── Hover lift ── */
    .lift { transition: transform .3s cubic-bezier(.16,1,.3,1), box-shadow .3s; }
    .lift:hover { transform: translateY(-4px); box-shadow: 0 24px 60px rgba(0,0,0,.5); }

    /* ── Marquee ── */
    .marquee-wrap  { overflow: hidden; }
    .marquee-inner { display: flex; width: max-content; animation: marquee 28s linear infinite; white-space: nowrap; }

    /* ── Toasts ── */
    .toast-wrap {
      position: fixed; bottom: 28px; right: 28px; z-index: 99999;
      display: flex; flex-direction: column; gap: 10px;
    }
    .toast {
      padding: 14px 22px; border-radius: 6px;
      background: var(--card); border: 1px solid var(--border2);
      box-shadow: 0 16px 48px rgba(0,0,0,.6);
      font-size: 13px; letter-spacing: .04em; color: var(--text);
      animation: toastIn .35s cubic-bezier(.16,1,.3,1);
      display: flex; align-items: center; gap: 10px; min-width: 240px;
    }
    .toast.ok   { border-left: 3px solid var(--emerald); }
    .toast.err  { border-left: 3px solid var(--rose); }
    .toast.info { border-left: 3px solid var(--gold); }

    /* ── Modal ── */
    .modal-bg {
      position: fixed; inset: 0; z-index: 9000;
      background: rgba(0,0,0,.85); backdrop-filter: blur(8px);
      display: flex; align-items: center; justify-content: center;
      padding: 20px; animation: fadeIn .25s ease;
    }
    .modal-box {
      background: var(--surface); border: 1px solid var(--border2); border-radius: 12px;
      max-width: 960px; width: 100%; max-height: 92vh; overflow-y: auto;
      animation: modalIn .4s cubic-bezier(.16,1,.3,1);
      box-shadow: 0 40px 120px rgba(0,0,0,.8);
    }

    /* ── Table ── */
    .tbl { width: 100%; border-collapse: collapse; }
    .tbl th {
      padding: 10px 16px; text-align: left;
      font-size: 10px; letter-spacing: .2em; text-transform: uppercase;
      color: var(--muted); border-bottom: 1px solid var(--border2); font-weight: 400;
    }
    .tbl td { padding: 16px; font-size: 13px; border-bottom: 1px solid var(--border); }
    .tbl tr:hover td { background: rgba(255,255,255,.02); }

    /* ── Stat card ── */
    .stat-card {
      background: var(--card); border: 1px solid var(--border); border-radius: 10px;
      padding: 28px; flex: 1; transition: border-color .3s, transform .3s;
    }
    .stat-card:hover { border-color: var(--gold); transform: translateY(-2px); }

    /* ── Bar chart ── */
    .bar { background: var(--lift); border-radius: 6px 6px 0 0; transition: height .8s cubic-bezier(.16,1,.3,1); }
    .bar.active { background: linear-gradient(180deg, var(--gold) 0%, #8b5e1a 100%); }

    /* ── Tag badge ── */
    .tag {
      display: inline-flex; align-items: center;
      padding: 3px 10px; border-radius: 100px;
      font-size: 10px; font-weight: 500; letter-spacing: .1em; text-transform: uppercase;
    }

    /* ── Qty button ── */
    .qty-btn {
      width: 32px; height: 32px; border-radius: 50%;
      border: 1px solid var(--border2); background: none;
      color: var(--text); font-size: 16px; line-height: 1;
      display: flex; align-items: center; justify-content: center;
      transition: all .2s;
    }
    .qty-btn:hover { border-color: var(--gold); color: var(--gold); }

    /* ── Nav links ── */
    .nav-link {
      background: none; border: none; color: var(--muted);
      font-size: 11px; letter-spacing: .15em; text-transform: uppercase;
      padding: 6px 0; position: relative; transition: color .25s;
      font-family: 'Jost', sans-serif; font-weight: 400;
    }
    .nav-link::after {
      content: ''; position: absolute; bottom: -2px; left: 0; right: 0;
      height: 1px; background: var(--gold); transform: scaleX(0);
      transition: transform .3s cubic-bezier(.16,1,.3,1);
    }
    .nav-link:hover { color: var(--text); }
    .nav-link:hover::after { transform: scaleX(1); }

    /* ── Sidebar button ── */
    .side-btn {
      width: 100%; padding: 12px 24px; background: none; border: none;
      border-left: 2px solid transparent; color: var(--muted);
      text-align: left; cursor: pointer; font-size: 13px;
      display: flex; align-items: center; gap: 12px;
      transition: all .2s; font-family: 'Jost', sans-serif; letter-spacing: .04em;
    }
    .side-btn:hover  { color: var(--text); background: rgba(255,255,255,.02); }
    .side-btn.active { color: var(--gold2); border-left-color: var(--gold); background: rgba(201,168,76,.05); }

    /* ── Section typography ── */
    .section-title { font-family: 'Playfair Display', serif; font-weight: 300; font-size: 32px; margin-bottom: 6px; color: var(--text); }
    .section-sub   { color: var(--muted); font-size: 13px; margin-bottom: 28px; letter-spacing: .04em; }

    /* ── Input wrapper ── */
    .inp-wrap  { margin-bottom: 20px; }
    .inp-label { display: block; font-size: 10px; letter-spacing: .2em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }
    .inp {
      width: 100%; padding: 13px 16px; border-radius: 6px;
      border: 1px solid var(--border2); background: rgba(255,255,255,.04);
      color: var(--text); font-size: 14px; transition: all .2s;
    }
    .inp::placeholder { color: var(--dim); }
    .inp-icon { padding-left: 44px !important; }

    /* ── Button system ── */
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      gap: 8px; border: none; border-radius: 6px; cursor: pointer;
      font-family: 'Jost', sans-serif; font-weight: 400;
      letter-spacing: .12em; text-transform: uppercase;
      transition: all .25s; position: relative; overflow: hidden;
    }
    .btn::after { content: ''; position: absolute; inset: 0; background: rgba(255,255,255,0); transition: background .2s; }
    .btn:hover::after  { background: rgba(255,255,255,.06); }
    .btn-sm  { font-size: 10px; padding: 8px 18px; }
    .btn-md  { font-size: 11px; padding: 12px 28px; }
    .btn-lg  { font-size: 12px; padding: 16px 44px; }
    .btn-fl  { width: 100%; }
    .btn-primary { background: linear-gradient(135deg, var(--gold) 0%, #a07828 100%); color: #0d0b0a; }
    .btn-primary:hover { box-shadow: 0 8px 30px rgba(201,168,76,.35); transform: translateY(-1px); }
    .btn-dark  { background: var(--card); color: var(--text); border: 1px solid var(--border2); }
    .btn-dark:hover  { border-color: var(--gold); }
    .btn-ghost { background: none; color: var(--muted); border: 1px solid var(--border); }
    .btn-ghost:hover { color: var(--text); border-color: var(--border2); }
    .btn-danger { background: var(--rose); color: #fff; }
    .btn:disabled { opacity: .5; pointer-events: none; }

    /* ── Category chips ── */
    .chip {
      padding: 8px 20px; border-radius: 100px;
      border: 1px solid var(--border); background: none; color: var(--muted);
      font-size: 11px; letter-spacing: .08em; cursor: pointer;
      font-family: 'Jost', sans-serif; transition: all .2s;
    }
    .chip:hover  { border-color: var(--border2); color: var(--text); }
    .chip.active { border-color: var(--gold); background: rgba(201,168,76,.1); color: var(--gold2); }

    /* ── Product card ── */
    .prod-card { cursor: pointer; }
    .prod-img {
      border-radius: 10px; position: relative; overflow: hidden;
      border: 1px solid var(--border); transition: box-shadow .4s;
    }
    .prod-card:hover .prod-img { box-shadow: 0 28px 70px rgba(0,0,0,.6); }
    .prod-overlay {
      position: absolute; bottom: 0; left: 0; right: 0; padding: 16px;
      background: linear-gradient(0deg, rgba(5,4,4,.95) 0%, transparent 100%);
      transform: translateY(100%);
      transition: transform .35s cubic-bezier(.16,1,.3,1);
    }
    .prod-card:hover .prod-overlay { transform: translateY(0); }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .hide-mobile { display: none !important; }
      .grid-1-mobile { grid-template-columns: 1fr !important; }
      .hero-title { font-size: clamp(40px, 12vw, 80px) !important; }
      
      /* Mobile nav adjustments */
      nav { height: 64px !important; }
      nav > div { padding: 0 20px !important; }
      
      /* Mobile button sizing */
      .btn-lg { padding: 14px 32px !important; font-size: 11px !important; }
      .btn-md { padding: 10px 20px !important; font-size: 10px !important; }
      
      /* Mobile product grid */
      .prod-card { margin-bottom: 20px; }
      
      /* Mobile modals */
      .modal-box { max-width: 96vw !important; margin: 20px; max-height: 85vh !important; }
      .modal-bg { padding: 10px !important; }
      
      /* Mobile forms */
      .inp-wrap { margin-bottom: 16px; }
      .inp { font-size: 16px !important; } /* Prevents zoom on iOS */
      
      /* Mobile admin sidebar */
      aside { display: none !important; }
      
      /* Mobile stat cards */
      .stat-card { padding: 20px !important; }
      
      /* Mobile footer */
      footer { padding: 48px 24px 24px !important; }
    }
    
    @media (max-width: 900px) {
      .grid-2-col { grid-template-columns: 1fr 1fr !important; }
    }
    
    @media (max-width: 480px) {
      .grid-2-col { grid-template-columns: 1fr !important; }
      h1 { font-size: 28px !important; }
      .section-title { font-size: 26px !important; }
    }
  `}</style>
);

export default GlobalStyles;
