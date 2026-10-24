(function () {
  'use strict';
  const M = window.EnergyModel;
  const $ = s => document.querySelector(s);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const STORE = 'oev-demo-v3';
  const defaults = {
    lang: 'ro',
    site: 'C',
    persona: 'owner',
    screen: 'overview',
    period: 'day',
    commercial: false,
    policy: 'residential',
    threshold: -12,
    reserve: 20,
    terminalLock: true,
    flex: 'none',
    start: 10,
    end: 16,
    mode: 'benchmark',
    cases: {},
    missing: {},
    imports: {},
    technicians: { A: 'Andrei M.', B: 'Elena P.', C: 'Mihai R.' }
  };

  let state = { ...defaults };
  let data;
  let sourceLabel = 'Built-in reference';
  let serverAvailable = false;
  let storageAvailable = true;
  let cache = new Map();
  let tour = null;
  let tourTimer = null;
  let preview = {};
  let dataVersion = 0;
  let loadMessage = '';

  try {
    const saved = localStorage.getItem(STORE);
    if (saved) state = { ...defaults, ...JSON.parse(saved) };
  } catch {
    storageAvailable = false;
  }

  if (!['A', 'B', 'C'].includes(state.site)) state.site = 'C';
  if (!['ro', 'en'].includes(state.lang)) state.lang = 'ro';

  // Check initial URL hash for screen
  const initialHash = (location.hash || '').replace('#', '');
  const validScreens = ['overview', 'performance', 'schedule', 'costs', 'fleet', 'case', 'connections'];
  if (validScreens.includes(initialHash)) {
    state.screen = initialHash;
    if (['fleet', 'case'].includes(initialHash)) state.persona = 'ops';
  }

  const save = () => {
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
    } catch {
      storageAvailable = false;
    }
  };

  const t = (ro, en) => state.lang === 'ro' ? ro : en;
  const n = (x, d = 1) => x === null || x === undefined || !Number.isFinite(Number(x)) ? '—' : new Intl.NumberFormat(state.lang === 'ro' ? 'ro-RO' : 'en-GB', { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(x));
  const money = x => n(x, 2);
  const pct = x => x === null ? '—' : n(x * 100, 1) + '%';
  const unit = (v, u, d = 1) => `${n(v, d)}<span class="unit">${u}</span>`;

  const siteNames = { A: 'București Nord', B: 'Ilfov Sud', C: 'București Vest' };
  const brands = { A: 'Huawei', B: 'Deye', C: 'Fronius' };
  const models = { A: 'SUN2000', B: 'SUN-10K', C: 'Symo' };
  const sig = id => id === 'A' ? t('Plafonare la prânz', 'Noon cap') : id === 'B' ? t('Program baterie ineficient', 'Dispatch mistiming') : t('Subperformanță persistentă −18%', 'Persistent −18% shortfall');

  const screens = [
    ['overview', 'Acasă', 'Overview', '⌂'],
    ['performance', 'Producție', 'Performance', '↗'],
    ['schedule', 'Baterie și consum', 'Schedule', 'ϟ'],
    ['costs', 'Costuri', 'Costs', '◈'],
    ['fleet', 'Instalații', 'Fleet', '▦'],
    ['case', 'Diagnostic', 'Case', '◎'],
    ['connections', 'Conexiuni', 'Connections', '⊞']
  ];

  const states = ['CANDIDATE', 'REVIEWED', 'ACTION_REQUESTED', 'ACTION_ACCEPTED', 'IN_PROGRESS', 'RESOLVED_PENDING_CHECK', 'VERIFIED'];

  const pill = (text, cls = 'plain') => `<span class="pill ${cls}">${esc(text)}</span>`;
  const header = (title, sub, extra = '') => `<div class="card-head"><div><h2>${title}</h2><div class="sub">${sub}</div></div>${extra}</div>`;
  const note = (text, cls = '') => `<div class="note ${cls}">${text}</div>`;

  function allRows(id = state.site) { return M.rowsFor(data, id, state, state.imports); }
  function days(id = state.site) { return M.daily(allRows(id)); }
  function selectedRows(id = state.site) {
    const ds = days(id);
    return state.period === 'day' ? (ds.at(-1)?.rows || []) : allRows(id);
  }

  function memo(key, fn) {
    const k = JSON.stringify([dataVersion, state.commercial, state.policy, state.reserve, state.terminalLock, state.flex, state.start, state.end, state.missing, state.imports?.revision, key]);
    if (!cache.has(k)) cache.set(k, fn());
    return cache.get(k);
  }

  const finances = (id = state.site, period = state.period) => memo(['finance', id, period], () => M.financial(period === 'day' ? (days(id).at(-1)?.rows || []) : period === '7d' ? allRows(id).slice(-168) : allRows(id), state));

  function identity(id = state.site) {
    const ds = days(id);
    const window = ds.slice(-7).map(d => d.date);
    const rule = id === 'B' ? 'dispatch_mistiming' : 'pv_underperformance';
    const scope = [window[0], window.at(-1), state.commercial ? '250kwp' : '6kwp', state.imports?.revision || 0].join('/');
    return { id: M.key(id, rule, scope), rule, window: scope, site: id };
  }

  function caseState(id = state.site) {
    const k = identity(id).id;
    return state.cases[k] || (state.cases[k] = { status: 'CANDIDATE', decision: '', notes: '', events: [], receipt: null });
  }

  function event(c, status, detail) {
    c.status = status;
    c.events.push({ status, at: new Date().toISOString(), detail });
    save();
  }

  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('visible');
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove('visible'), 4200);
  }

  function setScreen(screen) {
    if (state.persona === 'owner' && ['fleet', 'case'].includes(screen)) {
      state.persona = 'ops';
    }
    state.screen = screen;
    try {
      if (location.hash !== '#' + screen) {
        history.replaceState(null, '', '#' + screen);
      }
    } catch {}
    save();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function dayLabel(date) {
    return new Intl.DateTimeFormat(state.lang === 'ro' ? 'ro-RO' : 'en-GB', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
  }

  function residual(id = state.site) {
    const ds = days(id).slice(-7);
    const eligible = ds.filter(d => d.complete);
    const expected = M.sum(eligible, 'expected');
    return expected ? (M.sum(eligible, 'pv') - expected) / expected : null;
  }

  function coverage(id) {
    const rs = allRows(id).slice(-168);
    return rs.length ? rs.filter(r => r.quality === 'good').length / rs.length : 0;
  }

  /* Smooth Bézier spline curve builder */
  function buildSpline(pts) {
    if (!pts.length) return '';
    if (pts.length === 1) return `M ${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
    if (pts.length === 2) return `M ${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)} L ${pts[1][0].toFixed(2)},${pts[1][1].toFixed(2)}`;
    let d = `M ${pts[0][0].toFixed(2)},${pts[0][1].toFixed(2)}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;
      const cp1x = p1[0] + (p2[0] - p0[0]) / 6;
      const cp1y = p1[1] + (p2[1] - p0[1]) / 6;
      const cp2x = p2[0] - (p3[0] - p1[0]) / 6;
      const cp2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`;
    }
    return d;
  }

  /* High-fidelity SVG chart with smooth curves, gradients, and interactive hover */
  function chart(series, labels, { height = 230, min = 0, max = null, missing = [], regions = [], suffix = '', area = true, zero = false } = {}) {
    const W = 820, H = height, L = 52, R = 18, T = 22, B = 36, N = labels.length;
    const values = series.flatMap(s => s.values.filter(v => v !== null && Number.isFinite(v)));
    max = max ?? Math.max(1, ...values) * 1.15;
    const x = i => L + (N === 1 ? 0 : i / (N - 1)) * (W - L - R);
    const y = v => T + (max - v) / (max - min || 1) * (H - T - B);
    const colorGrid = 'rgba(255, 255, 255, 0.06)';
    const chartUid = 'c' + Math.random().toString(36).slice(2, 7);

    let defs = '<defs>';
    series.forEach((s, idx) => {
      defs += `
        <linearGradient id="${chartUid}-grad-${idx}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${s.color}" stop-opacity="0.28" />
          <stop offset="100%" stop-color="${s.color}" stop-opacity="0.01" />
        </linearGradient>`;
    });
    defs += '</defs>';

    let body = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(series.map(s => s.label).join(' / '))}">` + defs;

    // Background Highlight Regions (e.g. Investigation Window)
    for (const r of regions) {
      const rw = Math.max(0, x(r.end) - x(r.start));
      body += `<rect x="${x(r.start)}" y="${T}" width="${rw}" height="${H - T - B}" fill="${r.color}" opacity="0.08" rx="4"/>
               <text x="${x(r.start) + 8}" y="${T + 14}" font-weight="600" fill="${r.color}" opacity="0.9">${esc(r.label)}</text>`;
    }

    // Grid Lines & Y-axis labels
    for (let j = 0; j <= 4; j++) {
      const v = min + (max - min) * j / 4;
      const yPos = y(v);
      body += `<line x1="${L}" x2="${W - R}" y1="${yPos}" y2="${yPos}" stroke="${colorGrid}" stroke-dasharray="${j ? '4 5' : '0'}" stroke-width="1"/>
               <text x="${L - 10}" y="${yPos + 4}" text-anchor="end">${n(v, Math.abs(max) > 20 ? 0 : 1)}</text>`;
    }

    // Missing Data Highlights
    for (const i of missing) {
      const barW = Math.max(16, (W - L - R) / N);
      body += `<rect x="${x(i) - barW / 2}" y="${T}" width="${barW}" height="${H - T - B}" fill="#f43f5e" opacity="0.14" rx="2"/>`;
    }

    // Zero Line
    if (zero && min < 0) {
      body += `<line x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" stroke-dasharray="2 3"/>`;
    }

    // Series Curves and Area Fills
    series.forEach((s, sIdx) => {
      let segments = [], current = [];
      s.values.forEach((v, i) => {
        if (v === null || !Number.isFinite(v)) {
          if (current.length) segments.push(current);
          current = [];
        } else {
          current.push([x(i), y(v)]);
        }
      });
      if (current.length) segments.push(current);

      for (const ps of segments) {
        const linePath = s.dashed ? ps.map((p, i) => (i ? 'L' : 'M') + p.map(v => v.toFixed(2)).join(',')).join(' ') : buildSpline(ps);

        if (area && min >= 0 && !s.dashed) {
          const areaPath = `${linePath} L ${ps.at(-1)[0].toFixed(2)},${y(min).toFixed(2)} L ${ps[0][0].toFixed(2)},${y(min).toFixed(2)} Z`;
          body += `<path d="${areaPath}" fill="url(#${chartUid}-grad-${sIdx})" />`;
        }
        body += `<path d="${linePath}" fill="none" stroke="${s.color}" stroke-width="${s.dashed ? 1.8 : 2.6}" ${s.dashed ? 'stroke-dasharray="5 5"' : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
      }
    });

    // X-axis Labels & Interactive Point Hit Rectangles
    labels.forEach((label, i) => {
      if (i === 0 || i === N - 1 || i % Math.ceil(N / 7) === 0) {
        body += `<text x="${x(i)}" y="${H - 12}" text-anchor="middle">${esc(label)}</text>`;
      }
      const info = [
        label,
        ...series.map(s => s.label + ': ' + (s.values[i] === null ? t('Date insuficiente', 'Insufficient data') : n(s.values[i], 2) + ' ' + suffix))
      ].join('\n');

      const hitW = Math.max(12, (W - L - R) / N);
      body += `<rect class="point-hit" x="${x(i) - hitW / 2}" y="${T}" width="${hitW}" height="${H - T - B}" fill="transparent" tabindex="0" aria-label="${esc(info)}" data-tip="${esc(info)}"/>`;
    });

    return `<div class="chart">${body}</svg></div>`;
  }

  const legend = ss => `<div class="legend">${ss.map(([label, color]) => `<span><i style="background:${color}"></i>${label}</span>`).join('')}</div>`;

  /* Clean Unified Shell Header and Navigation */
  function shell() {
    const name = screens.find(s => s[0] === state.screen) || screens[0];
    const ds = days();
    const last = ds.at(-1);
    const first = ds[0];
    const tot = M.totals(selectedRows());
    document.documentElement.lang = state.lang;

    return `
      <header class="topbar" role="banner">
        <div class="topline">
          <div class="brand-section">
            <div class="brand">
              <div class="brandmark">ϟ</div>
              <span>ONE ENERGY VIEW</span>
            </div>
            <span class="edition">ENERGY OPERATIONS <span class="muted">/ DEMO</span></span>
          </div>

          <div class="top-middle">
            <select class="site-select" id="site-select" aria-label="Site">
              ${['A', 'B', 'C'].map(id => `<option value="${id}" ${state.site === id ? 'selected' : ''}>Site ${id} — ${id === 'C' ? 'Cluj / București Vest' : siteNames[id]} · ${brands[id]} ${models[id]} · ${state.commercial ? '250' : '6'} kWp · ${sig(id)}</option>`).join('')}
            </select>
            <select class="period-select" id="period-select" aria-label="Period">
              <option value="day" ${state.period === 'day' ? 'selected' : ''}>${t('Ziua curentă (24h)', 'Current replay day (24h)')}</option>
              <option value="14d" ${state.period === '14d' ? 'selected' : ''}>${t('Fereastra 14 zile (anomalie)', '14-day window (anomaly)')}</option>
            </select>
            <label class="commercial-toggle" title="${t('Scenariu comercial 250 kWp', 'Commercial 250 kWp scenario')}">
              <input id="commercial" type="checkbox" ${state.commercial ? 'checked' : ''}>
              <span>250 kWp</span>
            </label>
          </div>

          <div class="top-actions">
            <div class="persona" role="group" aria-label="Persona">
              <button data-persona="owner" class="${state.persona === 'owner' ? 'active' : ''}" aria-pressed="${state.persona === 'owner'}">
                ⌂ ${t('Prosumator', 'Prosumer')}
              </button>
              <button data-persona="ops" class="${state.persona === 'ops' ? 'active' : ''}" aria-pressed="${state.persona === 'ops'}">
                ⚒ ${t('Echipa O&M', 'O&M team')}
              </button>
            </div>
            <button class="small accent" data-action="tour" aria-label="Guided jury tour">
              ⚡ <span>${t('Tur juriu', 'Jury tour')}</span>
            </button>
            <div class="lang" aria-label="Language">
              ${['ro', 'en'].map(l => `<button data-lang="${l}" class="${state.lang === l ? 'active' : ''}" aria-pressed="${state.lang === l}">${l.toUpperCase()}</button>`).join('')}
            </div>
          </div>
        </div>

        <div class="nav-row">
          <nav class="navigation" aria-label="Primary Navigation">
            ${screens.filter(s => state.persona === 'ops' || !['fleet', 'case'].includes(s[0])).map(s => `
              <button data-screen="${s[0]}" class="${state.screen === s[0] ? 'active' : ''}" aria-current="${state.screen === s[0] ? 'page' : 'false'}">
                <span class="nav-icon">${s[3]}</span>
                <span>${state.lang === 'ro' ? s[1] : s[2]}</span>
                ${s[0] === 'fleet' ? '<span class="nav-badge">3</span>' : ''}
              </button>
            `).join('')}
          </nav>
          <div class="provenance-strip" style="background:transparent;border:0;padding:0;">
            ${pill('PVGIS JRC ' + (first?.date.slice(0, 4) || '2020'), 'amber')}
            ${pill(t('Telemetrie: replay', 'Telemetry: replay'), 'blue')}
            ${state.imports?.revision ? pill('CSV OVERLAY · ' + state.imports.revision, 'amber') : ''}
            <span class="source-mode">${esc(sourceLabel)}</span>
          </div>
        </div>
      </header>

      <main role="main">
        <div class="pagehead">
          <div>
            <div class="eyebrow">${state.persona === 'ops' ? 'OPERATIONS & DIAGNOSTIC CONSOLE' : 'YOUR ENERGY. IN CONTEXT.'} / SITE ${state.site}</div>
            <h1>${state.lang === 'ro' ? name[1] : name[2]}<span class="muted">${state.screen === 'fleet' ? '' : ' / ' + siteNames[state.site]}</span></h1>
            <p class="sub">${state.persona === 'owner' ? t('Unde s-a dus energia mea și ce pot optimiza?', 'Where did my energy go, and what can I optimize?') : t('Ce instalații necesită atenție astăzi?', 'Which installations need attention today?')}</p>
          </div>
          <div class="headmeta">
            <small class="muted">Europe/Bucharest · UTC replay window</small>
            <div class="date">${state.period === 'day' ? dayLabel(last.date) : dayLabel(first.date) + ' — ' + dayLabel(last.date)} ${last.date.slice(0, 4)}</div>
            ${pill(t('REPLAY ISTORIC · DATE SIMULATE', 'HISTORICAL REPLAY · SIMULATED DATA'), 'amber')}
          </div>
        </div>

        ${loadMessage ? note(esc(loadMessage), 'amber') + '<div style="height:15px"></div>' : ''}
        ${!storageAvailable ? note(t('Stocarea locală este indisponibilă; starea va rămâne doar în această sesiune.', 'Browser storage unavailable; state lasts for this session only.'), 'amber') : ''}
        ${state.commercial ? note(t('Scenariu comercial: 250 kWp, consum scalat și baterie ilustrativă de 10 kWh. Nu reprezintă o recomandare de dimensionare.', 'Commercial scenario: 250 kWp, scaled load and illustrative 10 kWh battery. Not sizing advice.'), 'amber') + '<div style="height:15px"></div>' : ''}

        <div id="screen">${renderScreen()}</div>

        <footer class="footer" role="contentinfo">
          <span>ONE ENERGY VIEW / ${t('Dovezi înainte de concluzii', 'Evidence before conclusions')} / BOOTCAMP 2026</span>
          <span>${t('Valori de scenariu · fără factură reconciliată · fără comandă în invertor', 'Scenario values · no reconciled bill · no inverter commands')}</span>
        </footer>
      </main>
      ${tourUI()}
    `;
  }

  /* Micro sparkline with smooth area curve and glowing terminal pulse dot */
  function renderSpark(values, color) {
    const nums = values.filter(v => v !== null && Number.isFinite(v));
    if (!nums.length) return '';
    const min = Math.min(...nums, 0);
    const max = Math.max(...nums, 1);
    const W = 240, H = 34;
    const pts = nums.map((v, i) => [
      i * (W / (nums.length - 1 || 1)),
      H - 6 - ((v - min) / (max - min || 1)) * (H - 12)
    ]);
    const line = buildSpline(pts);
    const area = `${line} L ${pts.at(-1)[0].toFixed(2)},${H} L ${pts[0][0].toFixed(2)},${H} Z`;
    const lastPt = pts.at(-1);

    return `
      <svg class="spark" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="spark-grad-${color}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="var(--${color})" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="var(--${color})" stop-opacity="0"/>
          </linearGradient>
        </defs>
        <path d="${area}" fill="url(#spark-grad-${color})" />
        <path d="${line}" fill="none" stroke="var(--${color})" stroke-width="2" stroke-linecap="round"/>
        <circle cx="${lastPt[0].toFixed(2)}" cy="${lastPt[1].toFixed(2)}" r="3.5" fill="var(--${color})"/>
        <circle cx="${lastPt[0].toFixed(2)}" cy="${lastPt[1].toFixed(2)}" r="6" fill="none" stroke="var(--${color})" stroke-width="1.2" opacity="0.6"/>
      </svg>
    `;
  }

  /* KPI Summary Cards */
  function kpis() {
    const rs = selectedRows();
    const x = M.totals(rs);
    const dailyData = days();
    const cards = [
      [t('Producție solară', 'Solar generation'), 'PV GENERATION', 'solar', '☀', unit(x.pv, 'kWh'), `${pct(x.residual)} ${t('față de așteptat', 'vs expected')} · ${n(x.expected)} kWh`, dailyData.map(d => d.pv)],
      [t('Consum total', 'Total consumption'), 'SITE CONSUMPTION', 'load', '⌂', unit(x.load, 'kWh'), t('Consum de bază din replay', 'Base consumption from replay'), dailyData.map(d => M.sum(d.rows, 'load_kwh'))],
      [t('Stare baterie', 'Battery state'), 'BATTERY STORAGE', 'battery', '▤', unit(x.soc, '%'), `${n(x.charge)} ↑ / ${n(x.discharge)} ↓ kWh · ${t('rezervă', 'reserve')} ${state.reserve}%`, dailyData.map(d => d.rows.at(-1).soc_end_pct)],
      [t('Schimb cu rețeaua', 'Grid exchange'), 'GRID EXCHANGE', x.complete && x.exp > x.imp ? 'cyan' : 'rose', '⇄', unit(x.complete ? x.imp - x.exp : null, 'kWh'), `${n(x.imp)} ${t('import', 'import')} / ${n(x.exp)} ${t('export', 'export')}`, dailyData.map(d => d.complete ? M.sum(d.rows, 'grid_import_kwh') - M.sum(d.rows, 'grid_export_kwh') : null)]
    ];

    return `
      <div class="kpis">
        ${cards.map(([label, sub, colorClass, icon, val, detail, vals]) => `
          <div class="card kpi ${colorClass}">
            <div class="icon-bubble ${colorClass}">${icon}</div>
            <div class="upper">${label}</div>
            <div class="metric ${colorClass}">${val}</div>
            <div class="detail">${detail}</div>
            <div class="spark-wrap">${renderSpark(vals, colorClass === 'rose' ? 'import' : colorClass === 'cyan' ? 'export' : colorClass)}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* High-Tech Animated Energy Flow Diagram */
  function energyFlow() {
    const x = M.totals(selectedRows());
    const tot = selectedRows().length;

    const node = (nx, ny, nw, nh, label, val, color, sub = '', icon = '') => `
      <g>
        <rect class="node-card" x="${nx}" y="${ny}" width="${nw}" height="${nh}" rx="10"/>
        <rect x="${nx}" y="${ny + 14}" width="3.5" height="${nh - 28}" fill="${color}" rx="1.5"/>
        <text x="${nx + 16}" y="${ny + 24}" class="node-title">${label}</text>
        <text x="${nx + 16}" y="${ny + 50}" class="node-val">${val}</text>
        ${sub ? `<text x="${nx + 16}" y="${ny + 68}" class="node-sub">${sub}</text>` : ''}
        ${icon ? `<text x="${nx + nw - 24}" y="${ny + 26}" font-size="14" fill="${color}" opacity="0.85">${icon}</text>` : ''}
      </g>
    `;

    const conduit = (id, d, color, reverse = false, active = true) => `
      <path class="conduit-bg" d="${d}" />
      ${active ? `<path id="${id}" class="conduit-active ${reverse ? 'reverse' : ''}" d="${d}" stroke="${color}" />` : ''}
      ${active ? `
        <circle r="3.5" fill="${color}" filter="drop-shadow(0 0 5px ${color})">
          <animateMotion dur="2.4s" repeatCount="indefinite" path="${d}" ${reverse ? 'keyPoints="1;0" keyTimes="0;1" calcMode="linear"' : ''} />
        </circle>` : ''}
    `;

    return `
      <div class="flow">
        <svg viewBox="0 0 780 340" role="img" aria-label="Energy Flow Diagram">
          ${conduit('flow-pv', 'M 190,82 C 255,82 255,148 320,148', '#f59e0b', false, x.complete && x.pv > 0)}
          ${conduit('flow-load', 'M 466,148 C 530,148 530,82 590,82', '#3b82f6', false, x.load > 0)}
          ${conduit('flow-bat', 'M 393,198 V 248', '#10b981', x.discharge > x.charge, x.complete && (x.discharge + x.charge) > 0)}
          ${conduit('flow-grid', 'M 466,160 C 530,160 530,284 590,284', '#06b6d4', x.imp > x.exp, x.complete && (x.imp + x.exp) > 0)}

          ${node(25, 38, 165, 88, t('PANOURI PV', 'SOLAR ARRAY'), n(x.pv) + ' kWh', '#f59e0b', (state.commercial ? '250' : '6') + ' kWp · 35° / 180°', '☀')}
          ${node(320, 110, 146, 88, t('INVERTOR', 'INVERTER'), brands[state.site], '#38bdf8', models[state.site] + ' · ' + t('95% randament', '95% efficiency'), '⚡')}
          ${node(590, 38, 165, 88, t('CASĂ / CONSUM', 'SITE / LOAD'), n(x.load) + ' kWh', '#3b82f6', tot + ' ' + t('intervale orare', 'hourly intervals'), '⌂')}
          ${node(310, 248, 166, 82, t('BATERIE BESS', 'BATTERY BESS'), n(x.soc) + '%', '#10b981', '10 kWh · ' + t('rezervă', 'reserve') + ' ' + state.reserve + '%', '▤')}
          ${node(590, 238, 165, 92, t('REȚEA', 'GRID EXCHANGE'), n(x.imp) + ' / ' + n(x.exp), '#06b6d4', 'kWh ' + t('import / export', 'import / export'), '⇄')}

          <text x="238" y="98" fill="#f59e0b" font-size="10" font-family="var(--mono)" font-weight="600">PV → AC</text>
          <text x="526" y="220" fill="#06b6d4" font-size="10" font-family="var(--mono)" font-weight="600">⇄ GRID</text>
        </svg>
      </div>

      <div class="balance ${!x.complete || Math.abs(x.balance) > .02 ? 'bad' : ''}">
        <span>${x.complete ? '✓ ' + t('Bilanț energetic verificat', 'Energy balance verified') + ' · Δ ' + n(Math.abs(x.balance), 4) + ' kWh' : t('Date insuficiente — bilanțul nu poate fi verificat', 'Insufficient data — balance cannot be verified')}</span>
        <span class="formula">PV + Import + ${t('Descărcare', 'Discharge')} ≈ ${t('Consum', 'Load')} + Export + ${t('Încărcare', 'Charge')} · Δ &lt; 0.02 kWh</span>
      </div>
    `;
  }

  /* Overview Screen */
  function overview() {
    const f = finances();
    const isB = state.site === 'B';
    const lastDay = days().at(-1).rows;
    const proposal = isB ? memo(['owner-opt', state.site], () => M.optimize(lastDay, state)) : null;
    const redistributed = proposal?.available ? lastDay.reduce((v, r, i) => v + Math.abs(r.delta - proposal.deltas[i]), 0) / 2 : null;
    const short = f.complete ? f.shortfall / f.days : null;
    const impact = isB ? (f.dispatch === null ? null : f.dispatch / f.days) : (f.pvExposure === null ? null : f.pvExposure / f.days);

    return `
      ${kpis()}
      <div class="grid2">
        <div class="card">
          ${header(t('Energia, într-o singură vedere', 'Your energy, connected'), 'PRODUCTION → CONSUMPTION → STORAGE', pill(t('Model AC normalizat (95%)', 'Normalized AC model (95%)'), 'plain'))}
          ${energyFlow()}
          <div class="card-foot">
            <span>${t('Intervale istorice; fluxurile sunt animate pentru demonstrație.', 'Historical intervals; animated flows are illustrative.')}</span>
            <span>95% ${t('randament dus-întors', 'round-trip efficiency')}</span>
          </div>
        </div>

        <div class="stack">
          <div class="card recommendation">
            <div class="upper battery">↗ ${t('O ACȚIUNE CU SENS', 'RECOMMENDED NEXT STEP')}</div>
            <h2>${!f.complete ? t('Restabilește mai întâi datele lipsă.', 'Restore missing data first.') : isB ? t('Mută încărcarea bateriei spre orele cu surplus solar.', 'Move battery charging toward solar-surplus hours.') : state.site === 'C' ? t('Cere instalatorului o verificare a scăderii persistente.', 'Ask your installer to investigate the persistent shortfall.') : t('Verifică limita de putere din orele de prânz.', 'Review the power limit around midday.')}</h2>
            <p>${isB ? t('Comparația respectă rezerva și aceeași energie finală. Nu trimitem o comandă către invertor.', 'The comparison respects reserve and equal terminal energy. No command is sent to equipment.') : t('Vremea, umbrirea și limitarea exportului pot explica aceeași abatere. Trimite dovezile pentru evaluare.', 'Weather, shading and export limits can produce similar deviations. Share evidence for review.')}</p>
            <div class="impact">
              <div>
                <b>${n(isB ? redistributed : short)} <span class="unit">kWh/${t('zi', 'day')}</span></b>
                <small>${isB ? t('Energie stocată reprogramată, scenariu', 'Rescheduled stored energy, scenario') : t('Deficit de producție în replay', 'Production shortfall in replay')}</small>
              </div>
              <div>
                <b>${money(impact)} <span class="unit">RON/${t('zi', 'day')}</span></b>
                <small>${t('Estimare de scenariu, nu economie realizată', 'Scenario estimate, not realized savings')}</small>
              </div>
            </div>
            <button class="primary" data-screen="${isB ? 'schedule' : 'performance'}">
              ${t('Vezi dovezile și opțiunile', 'Explore evidence and options')} →
            </button>
          </div>

          <div class="card card-pad">
            <div class="upper">${t('CONTEXTUL INSTALAȚIEI', 'SITE CONTEXT')}</div>
            <div class="item">
              <span>${t('Surse și acoperire', 'Sources & coverage')}</span>
              <strong class="mono">${pct(coverage(state.site))}</strong>
            </div>
            <div class="item">
              <span>${t('Politică de export', 'Export valuation')}</span>
              <strong>${state.policy === 'commercial' ? 'PZU · ' + t('medie lunară', 'monthly average') : t('Credit energie activă', 'Active energy credit')}</strong>
            </div>
            <div class="item">
              <span>${t('Caz curent', 'Current case')}</span>
              ${pill(caseState().status, caseState().status === 'VERIFIED' ? 'green' : 'amber')}
            </div>
          </div>
        </div>
      </div>
      ${note(t('Datele din fișier sunt replay istoric. Bilanțul AC din UI este recalculat cu randament de 95% dus-întors; sursa Python folosește 95% pe fiecare sens (90,25% dus-întors). Datele originale sunt păstrate în JSON.', 'The file is historical replay. UI AC flows are normalized to 95% round-trip efficiency; Python source uses 95% each way (90.25% round trip). Original measurements remain in the JSON.'), 'section-gap')}
    `;
  }

  /* Performance Screen */
  function performance() {
    const ds = days();
    const streak = M.persistence(ds, state.threshold);
    const missing = ds.flatMap((d, i) => d.complete ? [] : [i]);
    const s = [
      { label: t('PV real în replay', 'Replay actual PV'), color: '#f59e0b', values: ds.map(d => d.pv) },
      { label: 'PVGIS expected', color: '#73869f', values: ds.map(d => d.expected), dashed: true }
    ];

    return `
      <div class="grid2">
        <div class="stack">
          <div class="card">
            ${header(t('Producție observată vs. așteptată', 'Observed vs expected production'), t('14 zile · Z1–7 sănătos / Z8–14 anomalie injectată', '14 days · D1–7 healthy / D8–14 injected anomaly'), legend([[t('Actual', 'Actual'), '#f59e0b'], ['PVGIS', '#73869f']]))}
            ${chart(s, ds.map(d => dayLabel(d.date)), { height: 285, missing, regions: [{ start: 0, end: 6.5, color: '#10b981', label: t('BAZĂ SĂNĂTOASĂ', 'HEALTHY BASELINE') }, { start: 6.5, end: 13, color: '#f43f5e', label: t('FEREASTRĂ INVESTIGAȚIE', 'INVESTIGATION WINDOW') }], suffix: 'kWh' })}
            <div class="card-foot">
              <span>${t('Geometrie scenariu: București · 35° înclinare · 180° azimut', 'Scenario geometry: Bucharest · 35° tilt · 180° azimuth')}</span>
              <span>${state.commercial ? '250' : '6'} kWp</span>
            </div>
          </div>

          <div class="card">
            ${header(t('Abatere zilnică în lumină', 'Daylight residual'), '(actual − expected) / expected · ' + t('continuitate verificată', 'continuity checked'), pill(streak >= 3 ? t('Persistență detectată', 'Persistent deviation') : t('Fără prag persistent', 'No persistent breach'), streak >= 3 ? 'red' : 'green'))}
            ${chart([{ label: t('Rezidual', 'Residual'), color: '#f43f5e', values: ds.map(d => d.residual === null ? null : d.residual * 100) }, { label: t('Prag', 'Threshold'), color: '#f59e0b', values: ds.map(() => state.threshold), dashed: true }], ds.map(d => dayLabel(d.date)), { height: 195, min: -45, max: 5, area: false, missing, suffix: '%', zero: true })}
            <div class="card-foot">
              <span>${t('Poll lipsă = date insuficiente. Nu înlocuim lipsa cu 0 kWh.', 'A missing poll means insufficient data. Missing is never replaced with 0 kWh.')}</span>
            </div>
          </div>
        </div>

        <div class="stack">
          <div class="card">
            ${header(t('Regulă de detecție', 'Detection rule'), 'PERSISTENT UNDERPERFORMANCE')}
            <div class="controls">
              <div class="control">
                <label for="threshold">
                  <span>${t('Prag rezidual', 'Residual threshold')}</span>
                  <output>${state.threshold}%</output>
                </label>
                <input type="range" id="threshold" min="-30" max="-5" step="1" value="${state.threshold}">
              </div>
              <div class="item">
                <span>${t('Durată minimă', 'Minimum duration')}</span>
                <strong class="mono">3 ${t('zile consecutive', 'consecutive days')}</strong>
              </div>
              <div class="item">
                <span>${t('Persistență maximă', 'Longest streak')}</span>
                <strong class="mono ${streak >= 3 ? 'rose' : 'battery'}">${streak} ${t('zile', 'days')}</strong>
              </div>
              <div class="item">
                <span>${t('Rezidual ultimele 7 zile valide', 'Last 7-day valid residual')}</span>
                <strong class="mono rose">${pct(residual())}</strong>
              </div>
              <label class="switch-row">
                <input type="checkbox" id="missing" ${state.missing[state.site] ? 'checked' : ''}>
                <span>${t('Simulează un poll lipsă', 'Simulate a missing poll')}</span>
              </label>
              ${note(t('Pragul este o ipoteză pentru demo, nu o constantă de diagnostic. Cauza fizică trebuie verificată.', 'The threshold is a demo hypothesis, not an engineering diagnostic constant. Physical cause needs verification.'), 'amber')}
              <button data-screen="case" class="primary">
                ${t('Deschide cazul O&M', 'Open O&M case')} →
              </button>
            </div>
          </div>

          <div class="card card-pad">
            <div class="upper">BASELINE PROVENANCE</div>
            <div class="item">
              <span>PVGIS</span>
              <span>${esc(data.sources?.pvgis?.kind || 'historical')}</span>
            </div>
            <p class="sub">${t('Model istoric, nu prognoză meteo pentru azi. Nu există măsurare independentă de iradianță pentru aceste situri simulate.', 'Historical model, not today’s weather forecast. No independent irradiance measurements exist for these simulated sites.')}</p>
          </div>
        </div>
      </div>
    `;
  }

  /* Schedule Screen */
  function schedule() {
    const rs = days().at(-1).rows;
    const opt = memo(['opt', state.site], () => M.optimize(rs, state));
    const labels = rs.map(r => String(r.hour).padStart(2, '0') + ':00');
    const socSeries = [
      { label: t('Observat', 'Observed'), color: '#73869f', values: rs.map(r => r.soc_end_pct), dashed: true },
      { label: t('Alternativă fezabilă', 'Feasible alternative'), color: '#10b981', values: opt.available ? opt.socs : rs.map(() => null) }
    ];
    const powerSeries = [
      { label: t('Observat AC', 'Observed AC'), color: '#73869f', values: rs.map(r => r.battery_charge_kwh - r.battery_discharge_kwh), dashed: true },
      { label: t('Alternativ AC', 'Alternative AC'), color: '#10b981', values: opt.available ? opt.flows.map(r => r.battery_charge_kwh - r.battery_discharge_kwh) : rs.map(() => null) }
    ];

    return `
      <div class="section-gap" style="margin:0 0 18px">
        ${note(t('Pentru proprietar: compară orele de încărcare cu surplusul solar și păstrează rezerva de backup. Propunerea de mai jos nu modifică echipamentul.', 'For the owner: compare charging hours with solar surplus while preserving backup reserve. The proposal below does not change equipment.'))}
      </div>
      <div class="grid2">
        <div class="stack">
          <div class="card">
            ${header(t('Stocare, cu aceleași limite', 'Storage, with the same constraints'), t('Baterie 10 kWh · 3 kW AC · 95% randament dus-întors', '10 kWh battery · 3 kW AC · 95% round-trip efficiency'), legend([[t('Observat', 'Observed'), '#73869f'], [t('Alternativă', 'Alternative'), '#10b981']]))}
            ${chart(socSeries, labels, { height: 240, min: 0, max: 100, suffix: '%' })}
            <div class="statsrow">
              <div>
                <small class="muted">${t('SoC final observat', 'Observed terminal SoC')}</small>
                <div class="metric">${n(rs.at(-1).soc_end_pct)}%</div>
              </div>
              <div>
                <small class="muted">${t('SoC final alternativ', 'Alternative terminal SoC')}</small>
                <div class="metric battery">${opt.available ? n(opt.terminal * 10) : '—'}%</div>
              </div>
              <div>
                <small class="muted">${t('Comparație financiară', 'Financial comparison')}</small>
                <div style="margin-top:4px">${pill(opt.available && opt.comparable ? t('Energie finală egală', 'Equal terminal energy') : t('Necomparabilă', 'Not comparable'), opt.available && opt.comparable ? 'green' : 'amber')}</div>
              </div>
            </div>
          </div>

          <div class="card">
            ${header(t('Încărcare / descărcare la bornele AC', 'AC charging / discharging'), t('Pozitiv = încărcare · negativ = descărcare', 'Positive = charge · negative = discharge'))}
            ${chart(powerSeries, labels, { height: 190, min: -3.5, max: 3.5, area: false, zero: true, suffix: 'kW' })}
            <div class="card-foot">
              <span>−3 kW ≤ P ≤ +3 kW · 20% ≤ SoC ≤ 90%</span>
              <span>${t('Nicio comandă trimisă', 'No command sent')}</span>
            </div>
          </div>

          <div class="card">
            ${header(t('Prețuri OPCOM pe interval', 'OPCOM delivery-period prices'), t('RON/MWh · politică de export afișată separat', 'RON/MWh · export policy shown separately'))}
            ${chart([{ label: 'OPCOM PZU', color: '#06b6d4', values: rs.map(r => r.pzu_ron_mwh) }], labels, { height: 170, min: Math.min(0, ...rs.map(r => r.pzu_ron_mwh)), suffix: 'RON/MWh' })}
            <div class="card-foot">
              <span>${t('Importurile CSV actualizează acest grafic. Tariful fix nu devine automat dinamic.', 'CSV imports update this chart. A fixed retail tariff does not become dynamic automatically.')}</span>
            </div>
          </div>
          ${note(state.mode === 'benchmark' ? t('Benchmark retrospectiv (informație completă): folosește producția și consumul deja cunoscute. Este o limită de comparație, nu o prognoză operațională.', 'Retrospective benchmark (perfect information): uses already-known production and load. This is a comparison benchmark, not an operational forecast.') : t('Program propus pe datele de replay, fără comandă directă în echipament. Nu există încă o prognoză operațională în acest demo.', 'Proposed schedule on replay inputs, without direct equipment commands. This demo has no operational forecast.'), 'amber')}
        </div>

        <div class="card">
          ${header(t('Constrângeri și preferințe', 'Constraints and preferences'), 'DISPATCH LAB / LOCAL SIMULATION')}
          <div class="controls">
            <div class="control">
              <label for="reserve">
                <span>${t('Rezervă backup SoC', 'Backup reserve SoC')}</span>
                <output>${state.reserve}%</output>
              </label>
              <input id="reserve" type="range" min="20" max="50" step="5" value="${state.reserve}">
              <small class="muted">${t('SoC inițial 50%; rezerva propusă nu îl poate depăși.', 'Initial SoC is 50%; proposed reserve cannot exceed it.')}</small>
            </div>

            <div class="control">
              <label for="flex">${t('Consumator flexibil (scenariu)', 'Flexible load (scenario)')}</label>
              <select id="flex">
                ${[['none', 'Fără consumator suplimentar', 'No added load'], ['ev', 'EV · 4 kWh / 2h', 'EV · 4 kWh / 2h'], ['boiler', 'Boiler · 2 kWh / 2h', 'Boiler · 2 kWh / 2h'], ['heat', 'Pompă de căldură · 3 kWh / 2h', 'Heat pump · 3 kWh / 2h']].map(([v, ro, en]) => `<option value="${v}" ${state.flex === v ? 'selected' : ''}>${t(ro, en)}</option>`).join('')}
              </select>
            </div>

            <div class="control">
              <label>${t('Fereastră permisă, ora locală', 'Allowed window, local hour')}</label>
              <div class="inline">
                <input id="start" aria-label="Window start" type="number" min="0" max="23" value="${state.start}">
                <span>→</span>
                <input id="end" aria-label="Window end" type="number" min="0" max="24" value="${state.end}">
              </div>
              <small class="muted">${t('Consum simulat de referință la 18–20h; aceeași energie este mutată în fereastra aleasă.', 'Reference simulated load at 18–20h; the same energy is shifted into the selected window.')}</small>
            </div>

            <label class="switch-row">
              <input type="checkbox" id="terminalLock" ${state.terminalLock ? 'checked' : ''}>
              <span>${t('Blochează aceeași energie finală', 'Lock equal terminal energy')}</span>
            </label>

            <div class="control">
              <label for="mode">${t('Mod de evaluare', 'Evaluation mode')}</label>
              <select id="mode">
                <option value="benchmark" ${state.mode === 'benchmark' ? 'selected' : ''}>${t('Benchmark retrospectiv', 'Retrospective benchmark')}</option>
                <option value="proposal" ${state.mode === 'proposal' ? 'selected' : ''}>${t('Program propus pe replay', 'Proposed schedule on replay')}</option>
              </select>
            </div>

            ${opt.available ? `
              <div class="impact">
                <div>
                  <b>${money(opt.saving)} <span class="unit">RON/${t('zi', 'day')}</span></b>
                  <small>${t('Oportunitate estimată, include uzura', 'Estimated opportunity, includes wear')}</small>
                </div>
              </div>
              ${opt.flexEnergy ? note(t('Consumatorul flexibil este adăugat ca scenariu, nu este o măsurare din contor.', 'The flexible load is an added scenario, not a meter measurement.')) : ''}
            ` : note(t('Nu există program fezabil: ', 'No feasible schedule: ') + esc(opt.reason), 'rose')}

            <button data-action="save-schedule" class="primary" ${!opt.available ? 'disabled' : ''}>
              ${t('Salvează propunerea local', 'Save proposal locally')}
            </button>
            <small class="muted">${t('Persistă în browser. Nu activează un releu sau invertor.', 'Persists in this browser. Does not activate a relay or inverter.')}</small>
          </div>
        </div>
      </div>
    `;
  }

  /* Costs Screen */
  function costs() {
    const f = finances();
    const c = caseState();
    const buckets = [
      [t('Energie observată, evaluată contractual', 'Observed energy, contract valuation'), f.observed, 'RON / ' + (state.period === 'day' ? '24h' : '14d'), t('Import × tarif cumpărare − export × valoare compensare. Modelul de replay nu este o factură reconciliată.', 'Import × purchase tariff − export × compensation value. Replay modeling is not a reconciled invoice.'), 'load'],
      [t('Expunere estimată din subproducție PV', 'Estimated PV shortfall exposure'), f.pvExposure === null ? null : f.pvExposure / f.days, 'RON / ' + t('zi', 'day'), t('PV contrafactual; consumul și schimbarea energiei stocate rămân constante.', 'Counterfactual PV; load and stored-energy changes stay fixed.'), 'rose'],
      [t('Oportunitate din reprogramare baterie', 'Battery rescheduling opportunity'), f.dispatch === null ? null : f.dispatch / f.days, 'RON / ' + t('zi', 'day'), t('PV constant, energie flexibilă totală constantă și SoC final egal. Include uzura de scenariu.', 'Fixed PV, fixed total flexible-load energy and equal terminal SoC. Includes scenario wear.'), 'battery'],
      [t('Rezultat post-intervenție', 'Post-intervention outcome'), null, '', c.status === 'VERIFIED' ? t('Verificare locală a cazului de demo; nu există rezultat financiar real măsurat.', 'Local demo case check; no measured real financial outcome.') : t('Așteaptă intervenția și o perioadă comparabilă de măsurare.', 'Await intervention and a comparable observation period.'), 'muted']
    ];

    return `
      <div class="card policybar">
        <div>
          <h2>${t('Regulă contractuală de scenariu', 'Scenario contract policy')}</h2>
          <small class="muted">${t('Legea 160/2026 · configurație ilustrativă, verifică termenii aplicabili', 'Law 160/2026 · illustrative configuration; verify applicable terms')}</small>
        </div>
        <select id="policy" aria-label="Settlement policy">
          <option value="residential" ${state.policy === 'residential' ? 'selected' : ''}>≤200 kW · ${t('Compensare cantitativă / credit energie activă', 'Quantity compensation / active-energy credit')}</option>
          <option value="commercial" ${state.policy === 'commercial' ? 'selected' : ''}>200–400 kW · ${t('Decontare financiară / medie ponderată lunară PZU', 'Financial settlement / monthly weighted PZU')}</option>
        </select>
      </div>

      <div class="costs">
        ${buckets.map(([title, val, u, description, color], i) => `
          <div class="card bucket">
            <div class="bucket-id">LEDGER / 0${i + 1}</div>
            <h2>${title}</h2>
            <div class="metric ${color}">${i === 3 ? t(c.status === 'VERIFIED' ? 'Caz verificat' : 'În așteptare', c.status === 'VERIFIED' ? 'Case checked' : 'Pending') : money(val)}</div>
            <small class="muted">${u}</small>
            <p>${description}</p>
          </div>
        `).join('')}
      </div>

      <div class="section-gap">
        ${note('<b>' + t('Aceste valori NU se însumează.', 'These amounts must NOT be added together.') + '</b> ' + t('Sunt perspective și contrafactuale diferite, cu suprapuneri. O economie realizată necesită măsurători și reconciliere după intervenție.', 'They are different, potentially overlapping views and counterfactuals. Realized savings require measurements and reconciliation after intervention.'), 'amber')}
      </div>

      <div class="grid2 equal section-gap">
        <div class="card card-pad">
          <h2>${t('Ipoteze de evaluare', 'Valuation assumptions')}</h2>
          <div class="item">
            <span>${t('Import', 'Import')}</span>
            <b class="mono">${data.sources?.retail_contract?.import_mode === 'pzu_linked' ? 'PZU + ' + money(data.sources.retail_contract.import_adder_ron_kwh) : money(data.sources?.retail_contract?.import_ron_kwh ?? 1.3)} RON/kWh</b>
          </div>
          <div class="item">
            <span>${t('Export / credit', 'Export / credit')}</span>
            <b class="mono">${money(selectedRows()[0]?.sell)} RON/kWh</b>
          </div>
          <div class="item">
            <span>${t('Uzură în benchmark', 'Wear in benchmark')}</span>
            <b class="mono">0.05 RON/kWh ${t('stocat', 'stored')}</b>
          </div>
          <div class="item">
            <span>${t('Acoperire', 'Coverage')}</span>
            ${pill(f.complete ? '100%' : t('Date insuficiente', 'Insufficient data'), f.complete ? 'green' : 'red')}
          </div>
        </div>

        <div class="card card-pad">
          <h2>${t('Preț de piață ≠ tarif de factură', 'Market price ≠ billed tariff')}</h2>
          <p class="sub">${t('Prețurile OPCOM importate modifică graficul pieței și tariful de import numai dacă acesta este indexat PZU. Valoarea de export comercial folosește media lunară din contract, nu media simplă a orelor încărcate.', 'Imported OPCOM prices update the market chart and import rate only when the contract is PZU-linked. Commercial export uses the configured monthly average, not a simple mean of uploaded hours.')}</p>
          <div style="margin-top:18px">
            ${pill(state.policy === 'commercial' && !state.commercial ? t('Politică comercială pe 6 kWp: scenariu comparativ', 'Commercial policy on 6 kWp: comparison scenario') : 'ILLUSTRATIVE POLICY', 'amber')}
          </div>
        </div>
      </div>
    `;
  }

  /* Fleet Screen */
  function fleet() {
    const rows = ['A', 'B', 'C'].map(id => {
      const f = finances(id, '7d');
      const cov = coverage(id);
      const res = residual(id);
      const exposure = f.pvExposure === null ? 0 : f.pvExposure / 7;
      return { id, f, cov, res, exposure, score: Math.abs(res || 0) * Math.max(0, exposure) * cov };
    }).sort((a, b) => b.score - a.score);

    return `
      <div class="kpis">
        ${[
          [t('Instalații urmărite', 'Monitored installations'), '3', 'MULTI-BRAND FLEET'],
          [t('Abatere persistentă PV', 'Persistent PV deviation'), String(rows.filter(r => M.persistence(days(r.id), state.threshold) >= 3).length), 'THRESHOLD × 3 DAYS'],
          [t('Scenariu program baterie', 'Dispatch scenario'), '1', 'DEYE / SITE B'],
          [t('Acoperire medie', 'Average coverage'), pct(M.sum(rows, 'cov') / 3), 'SOURCE QUALITY']
        ].map(([l, v, s]) => `
          <div class="card kpi">
            <div class="upper">${l}</div>
            <div class="metric">${v}</div>
            <small class="muted">${s}</small>
          </div>
        `).join('')}
      </div>

      <div class="card">
        ${header(t('Coada de atenție O&M', 'O&M attention queue'), t('Ordine: |rezidual PV| × expunere RON × acoperire · oportunitățile de baterie rămân separate', 'Rank: |PV residual| × RON exposure × coverage · battery opportunities stay separate'), pill('3 SITES / 3 ADAPTERS', 'blue'))}
        <div class="table-wrap section-gap">
          <table>
            <thead>
              <tr>
                ${[t('Instalație / adaptor', 'Site / adapter'), t('Capacitate / geometrie', 'Capacity / geometry'), '7D residual', t('Semnătură candidat', 'Candidate signature'), t('Expunere PV / zi', 'PV exposure / day'), t('Sursă / acoperire', 'Source / coverage'), t('Tehnician', 'Technician'), t('Stare caz', 'Case status')].map(c => `<th>${c}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(r => `
                <tr class="clickable ${r.id === state.site ? 'selected' : ''}" data-open-site="${r.id}" tabindex="0" aria-label="Open diagnostic Site ${r.id}">
                  <td>
                    <div class="site-cell">
                      <span class="site-badge">${r.id}</span>
                      <div>
                        <b>${siteNames[r.id]}</b>
                        <small>${brands[r.id]} ${models[r.id]} · MOCK ADAPTER</small>
                      </div>
                    </div>
                  </td>
                  <td class="num">${state.commercial ? '250' : '6'} kWp<small>35° tilt · 180° azimuth</small></td>
                  <td class="num ${r.res < -.12 ? 'rose' : 'battery'}">
                    ${pct(r.res)}
                    <div class="rulebar"><i style="width:${Math.min(100, Math.abs(r.res || 0) * 300)}%"></i></div>
                  </td>
                  <td>${sig(r.id)}<small>${r.id === 'B' ? t('PV normal · incident dispatch separat', 'Normal PV · separate dispatch incident') : t('Cauză încă neconfirmată', 'Cause not yet confirmed')}</small></td>
                  <td class="num">${r.f.shortfall === null ? '—' : n(r.f.shortfall / 7)} kWh<small>${r.f.pvExposure === null ? '—' : money(r.f.pvExposure / 7)} RON · ${t('medie 7 zile', '7-day average')}</small></td>
                  <td>${pill(r.cov < 1 ? t('Poll lipsă', 'Missing poll') : 'REPLAY', r.cov < 1 ? 'red' : 'blue')}<small class="mono">${pct(r.cov)} · ${days(r.id).at(-1).date}</small></td>
                  <td>${esc(state.technicians[r.id])}</td>
                  <td>${pill(caseState(r.id).status, caseState(r.id).status === 'VERIFIED' ? 'green' : 'amber')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div class="card-foot">
          <span>${t('Site C este un scenariu de București; „Cluj” din selector este o etichetă de demo, nu o geometrie măsurată.', 'Site C uses Bucharest scenario geometry; “Cluj” in the selector is a demo alias, not measured geometry.')}</span>
          <button class="small" data-action="flagged">${t('Investighează Site C', 'Investigate Site C')} →</button>
        </div>
      </div>
      <div class="section-gap">
        ${note(t('O abatere sau un scor mare deschide o investigație, nu confirmă o defecțiune. Site B rămâne vizibil chiar dacă rezidualul său PV este zero: are o oportunitate de dispatch distinctă.', 'A deviation or a high score opens an investigation; it does not confirm a fault. Site B stays visible with zero PV residual because it has a separate dispatch opportunity.'))}
      </div>
    `;
  }

  /* Diagnostic Screen */
  function diagnostic() {
    const id = identity();
    const c = caseState();
    const rs = selectedRows();
    const tot = M.totals(rs);
    const ds = days();
    const last = ds.at(-1);
    const index = c.status === 'REOPENED' ? 0 : states.indexOf(c.status);
    const opt = memo(['case-opt', state.site], () => M.optimize(last.rows, state));

    const checks = [
      [tot.complete ? '✓' : '!', t('Completitudinea canalelor', 'Channel completeness'), `${pct(tot.coverage)} · ${rs.length} ${t('intervale așteptate', 'expected intervals')}`, tot.complete ? 'green' : 'red', tot.complete ? 'PASS' : 'INSUFFICIENT'],
      ['✓', t('Geometrie PVGIS', 'PVGIS geometry'), t('Geometrie comună de scenariu: București, 35°, sud. Nu este validare de teren.', 'Shared scenario geometry: Bucharest, 35°, south. Not field validation.'), 'amber', 'SCENARIO MATCH'],
      ['?', t('Putere AC vs. plafonare', 'AC rating vs noon cap'), t('Model/rating independent și setare export: necolectate.', 'Independent model/rating and export setting: not collected.'), 'amber', 'CHECK REQUIRED'],
      [tot.complete ? '✓' : '!', t('Bilanț cu Smart Meter', 'Smart Meter balance'), tot.complete ? 'Δ ' + n(Math.abs(tot.balance), 4) + ' kWh · ' + t('bilanț modelat, nu contor independent', 'modeled balance, not an independent meter') : t('Nu poate fi verificat', 'Cannot verify'), tot.complete ? 'green' : 'red', tot.complete ? 'MODEL PASS' : 'INSUFFICIENT'],
      [opt.available && opt.comparable ? '✓' : '!', t('Conservare SoC baterie', 'Battery SoC conservation'), opt.available ? `${n(opt.initial)} → ${n(opt.terminal)} kWh · ${t('alternativă', 'alternative')}` : esc(opt.reason), opt.available && opt.comparable ? 'green' : 'amber', opt.available && opt.comparable ? 'PASS' : 'CHECK REQUIRED']
    ];

    return `
      <div class="card">
        <div class="card-head">
          <div>
            <h2>${t('Caz', 'Case')} <span class="mono">${id.id}</span></h2>
            <div class="sub">${sig(state.site)} · ${t('fereastră stabilă', 'stable window')} ${esc(id.window)}</div>
          </div>
          ${pill(c.status, c.status === 'VERIFIED' ? 'green' : 'amber')}
        </div>
        <div class="stepper">
          ${states.map((s, i) => `
            <div class="step ${i < index ? 'done' : i === index ? 'current' : ''}">
              <b>${i < index ? '✓' : String(i + 1).padStart(2, '0')}</b>
              <span>${s.replaceAll('_', ' ')}</span>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="grid2 section-gap">
        <div class="stack">
          <div class="card">
            ${header(t('Verificări deterministe', 'Deterministic cross-checks'), 'QUALITY GATES / EVIDENCE BEFORE DIAGNOSIS')}
            <div class="matrix">
              ${checks.map(([icon, label, desc, cls, status]) => `
                <div class="check">
                  <span class="check-icon ${cls === 'green' ? 'battery' : cls === 'red' ? 'rose' : 'solar'}">${icon}</span>
                  <div>
                    ${label}
                    <small>${desc}</small>
                  </div>
                  ${pill(status, cls)}
                </div>
              `).join('')}
            </div>
          </div>

          <div class="card">
            ${header(t('Brief diagnostic în română', 'Bounded diagnostic brief'), 'TEMPLATE EXPLANATION / NO LIVE LLM', pill('BOUNDED EVIDENCE', 'blue'))}
            <div class="brief">
              <section>
                <h3>${t('Observații măsurate în replay', 'Observed replay facts')}</h3>
                <p>${esc(last.date)} · Site ${state.site}: ${n(last.pv)} / ${n(last.expected)} kWh ${t('așteptat', 'expected')}; ${t('rezidual 7 zile', '7-day residual')} ${pct(residual())}. ${t('Telemetrie simulată, nu măsurători pe teren.', 'Simulated telemetry, not field measurements.')}</p>
              </section>
              <section>
                <h3>${t('Ipoteze candidate', 'Candidate hypotheses')}</h3>
                <ul>
                  ${(state.site === 'B' ? [
                    t('Programul poate importa energie înaintea orelor de surplus solar.', 'The schedule may import before solar-surplus hours.'),
                    t('Rezerva backup poate avea un scop intenționat; întreabă proprietarul.', 'Backup reserve may be intentional; ask the owner.')
                  ] : [
                    t('Umbrire sau murdărire; nu poate fi stabilit doar din producție.', 'Shading or soiling; output alone cannot establish this.'),
                    t('Limită de export, temperatură sau tensiune de rețea.', 'Export limit, temperature or grid voltage.'),
                    t('Baseline meteo necomparabil ori configurație schimbată.', 'Non-comparable weather baseline or changed configuration.')
                  ]).map(x => `<li>${x}</li>`).join('')}
                </ul>
              </section>
              <section>
                <h3>${t('Verificări lipsă înainte de deplasare', 'Missing checks before a site visit')}</h3>
                <p>${t('Confirmă ratingul AC, alarmele invertorului, tensiunea rețelei, orientarea și setările bateriei. Cere un export original și data ultimei intervenții.', 'Confirm AC rating, inverter alarms, grid voltage, orientation and battery settings. Request an original export and latest intervention date.')}</p>
              </section>
            </div>
          </div>
        </div>

        <div class="stack">
          <div class="card">
            ${header(t('Evaluarea tehnicianului', 'Technician assessment'), 'AUDITED WORKFLOW')}
            <div class="assessment">
              <label for="technician">${t('Responsabil', 'Assignee')}</label>
              <select id="technician">
                ${['Andrei M.', 'Elena P.', 'Mihai R.', 'Ioana D.'].map(x => `<option ${state.technicians[state.site] === x ? 'selected' : ''}>${x}</option>`).join('')}
              </select>

              <label for="decision">${t('Decizie', 'Decision')}</label>
              <select id="decision">
                <option value="">${t('Selectează o evaluare', 'Choose an assessment')}</option>
                ${[['anomaly', 'Confirmă anomalie', 'Confirm anomaly'], ['normal', 'Condiție normală de operare', 'Normal operating condition'], ['insufficient', 'Date insuficiente', 'Insufficient data']].map(([v, ro, en]) => `<option value="${v}" ${c.decision === v ? 'selected' : ''}>${t(ro, en)}</option>`).join('')}
              </select>

              <label for="assessment-notes">${t('Note și dovezi', 'Notes and evidence')}</label>
              <textarea id="assessment-notes" placeholder="${t('Ce ai verificat? Ce rămâne de confirmat?', 'What did you check? What remains unconfirmed?')}">${esc(c.notes)}</textarea>

              <div class="actions">
                <button data-action="review" ${!c.decision || !['CANDIDATE', 'REOPENED'].includes(c.status) ? 'disabled' : ''}>
                  ${t('Salvează evaluarea', 'Save assessment')}
                </button>
                <button class="primary" data-action="ticket" ${c.receipt || !['REVIEWED', 'ACTION_REQUESTED'].includes(c.status) || c.decision !== 'anomaly' || !tot.complete ? 'disabled' : ''}>
                  ${c.receipt ? '✓ ' + t('Ticket creat', 'Ticket created') : t('Creează ticket O&M', 'Create O&M ticket')}
                </button>
              </div>

              <small class="muted" style="display:block;margin-top:8px">
                ${serverAvailable ? t('Destinație: SQLite local, prin endpointul Python. Niciun webhook extern nu este apelat.', 'Destination: local SQLite through Python. No external webhook called.') : t('Destinație: registrul local al browserului; fără trimitere externă.', 'Destination: local browser ledger; no external delivery.')}
              </small>

              ${workflowActions(c)}
              ${c.receipt ? receiptUI(c.receipt) : ''}
            </div>
          </div>

          <div class="card card-pad">
            <h2>${t('Jurnal de decizii', 'Decision log')}</h2>
            ${c.events.length ? c.events.slice().reverse().map(e => `
              <div class="item">
                <div>
                  <span class="mono">${esc(e.status)}</span>
                  <small>${esc(e.detail || '')}</small>
                </div>
                <small class="mono">${esc(e.at.slice(11, 19))}</small>
              </div>
            `).join('') : `<p class="sub">${t('Candidat creat din fereastra de dovezi. Nicio intervenție trimisă.', 'Candidate from evidence window. No intervention sent.')}</p>`}
          </div>
        </div>
      </div>
    `;
  }

  function workflowActions(c) {
    if (c.receipt && c.status === 'REVIEWED' && c.decision === 'anomaly') {
      return `<div class="actions"><button data-action="progress">${t('Reia intervenția existentă', 'Resume existing intervention')}</button></div>`;
    }
    if (c.status === 'ACTION_ACCEPTED') {
      return `<div class="actions"><button data-action="progress">${t('Începe intervenția', 'Start intervention')}</button></div>`;
    }
    if (c.status === 'IN_PROGRESS') {
      return `<div class="actions"><button data-action="resolve">${t('Marchează rezolvat, așteaptă verificare', 'Resolve, pending check')}</button></div>`;
    }
    if (c.status === 'RESOLVED_PENDING_CHECK') {
      return `
        <div class="section-gap">
          ${note(t('Nu există date reale post-intervenție. Poți verifica numai pașii demonstrației; nu revendicăm recuperare de producție sau economii realizate.', 'No real post-intervention data exists. Only the demo workflow can be checked; no recovered generation or realized savings is claimed.'), 'amber')}
        </div>
        <label class="switch-row" style="margin-top:10px">
          <input id="verify-demo" type="checkbox">
          <span>${t('Confirm verificarea exclusivă a fluxului demo', 'Confirm demo-workflow-only verification')}</span>
        </label>
        <div class="actions">
          <button data-action="verify">${t('Verifică fluxul demo', 'Verify demo workflow')}</button>
          <button data-action="reopen">${t('Redeschide cazul', 'Reopen case')}</button>
        </div>
      `;
    }
    if (c.status === 'VERIFIED') {
      return `
        <div class="section-gap">
          ${note(t('Flux demo verificat local. Rezultatul financiar real rămâne în așteptare.', 'Demo workflow checked locally. Real financial outcome remains pending.'))}
        </div>
        <div class="actions">
          <button data-action="reopen">${t('Redeschide cazul', 'Reopen case')}</button>
        </div>
      `;
    }
    return '';
  }

  function receiptUI(r) {
    return `
      <div class="receipt">
        <div class="upper battery">✓ ${t('CONFIRMARE DESTINAȚIE', 'DESTINATION RECEIPT')}</div>
        <div class="metric" style="margin-top:6px">${esc(r.case_id)}</div>
        <div class="item">
          <span>${t('Destinație', 'Destination')}</span>
          <strong>${esc(r.destination)}</strong>
        </div>
        <div class="item">
          <span>${t('Creat la', 'Created at')}</span>
          <strong class="mono">${esc(r.created_at)}</strong>
        </div>
        <div class="item">
          <span>${t('Dovadă', 'Evidence')}</span>
          <strong>${esc(r.status)}</strong>
        </div>
        <small class="muted">${t('Cheie stabilă · repetarea nu creează alt ticket', 'Stable key · repeated requests do not create another ticket')}</small>
        <details style="margin-top:10px">
          <summary style="cursor:pointer;color:var(--export-light);font-weight:600">${t('Vezi payload', 'Inspect payload')}</summary>
          <pre>${esc(JSON.stringify(r.payload, null, 2))}</pre>
        </details>
      </div>
    `;
  }

  /* Connections Screen */
  function connections() {
    const last = allRows().at(-1).timestamp;
    const adapters = [
      ['Huawei FusionSolar', 'pyhfs Northbound', '1 call/min · illustrative queue', 'PV · SoC · battery power', 'INSTALLER ACCESS REQUIRED', 'Session worker / not connected'],
      ['Fronius Local Solar API', '/solar_api/v1/GetPowerFlowRealtimeData.fcgi', 'Local read-only · model-dependent', 'PV · meter · inverter alarms', 'LOCAL API NOT CONNECTED', 'No active hardware session'],
      ['Deye / Solarman Gateway', 'Authorized gateway / export', 'Vendor/account-dependent', 'PV · BESS · import/export', 'GATEWAY NOT CONNECTED', 'Access not configured'],
      ['Smart Meter / Export CSV', 'Normalized owner-authorized intervals', 'Historical replay', 'Load · grid import · grid export', 'SIMULATED CHANNELS', 'No live meter'],
      ['EU JRC PVGIS Cache', 'seriescalc · geometry-matched historical model', 'Cached hourly history', 'Expected PV · irradiance', 'HISTORICAL MODEL', 'Server cache / no credentials'],
      ['OPCOM PZU / Contract JSON', 'RON/MWh → RON/kWh · effective policy', 'Historical / scenario values', 'Market price · import/export policy', 'SCENARIO POLICY', 'No market session']
    ];

    return `
      <div class="adapter-grid">
        ${adapters.map(([name, endpoint, cadence, channels, status, session], i) => `
          <div class="card adapter">
            <div class="row-gap" style="justify-content:space-between">
              <span class="upper">ADAPTER / 0${i + 1}</span>
              ${pill(status, i < 4 ? 'amber' : 'blue')}
            </div>
            <h2>${name}</h2>
            <div class="endpoint">${endpoint}</div>
            <div class="channels">
              ${channels.split(' · ').map(x => `<span class="channel">${x}</span>`).join('')}
            </div>
            <dl>
              <dt>${t('Ultimul eșantion', 'Last sample')}</dt>
              <dd>${last.slice(0, 16).replace('T', ' ')}Z</dd>
              <dt>${t('Ultimul poll live', 'Last live poll')}</dt>
              <dd>${t('Niciunul', 'None')}</dd>
              <dt>${t('Cadență', 'Cadence')}</dt>
              <dd>${cadence}</dd>
              <dt>${t('Sesiune / lock', 'Session / lock')}</dt>
              <dd>${session}</dd>
            </dl>
          </div>
        `).join('')}
      </div>

      <div class="section-gap">
        ${note(t('Toate adaptoarele hardware sunt etichete de demo. Limita Huawei de un apel/minut este o ipoteză de planificare, nu un plafon universal. Nicio sesiune cloud nu este activă.', 'All hardware adapters are demo labels. Huawei’s one-call/minute queue is a planning assumption, not a universal limit. No cloud session is active.'), 'amber')}
      </div>

      <div class="upload section-gap">
        ${uploadUI('load')}
        ${uploadUI('price')}
      </div>

      <div class="card card-pad section-gap">
        <div class="row-gap" style="justify-content:space-between">
          <div>
            <h2>${t('Încarcă un dashboard.json propriu', 'Load your own dashboard.json')}</h2>
            <p class="sub">${t('Generat de energy_data_pipeline.py · fișierul rămâne în browser', 'Generated by energy_data_pipeline.py · file stays in the browser')}</p>
          </div>
          <div class="row-gap">
            <input type="file" id="json-upload" accept=".json,application/json" aria-label="Upload dashboard JSON">
            <button data-action="download-json">${t('Exportă datele sursă', 'Export source data')}</button>
            <button data-action="clear-imports">${t('Elimină importurile CSV', 'Clear CSV overlays')}</button>
          </div>
        </div>
      </div>

      <div class="card card-pad section-gap">
        <label class="switch-row">
          <input type="checkbox" id="missing" ${state.missing[state.site] ? 'checked' : ''}>
          <span>${t('Simulează un poll PV lipsă pentru situl selectat', 'Simulate a missing PV poll for selected site')}</span>
        </label>
        <p class="sub">${t('Producția devine necunoscută pentru acel interval. Graficele și evaluarea financiară nu tratează lipsa ca zero.', 'Production becomes unknown for that interval. Charts and financial evaluation never treat a missing reading as zero.')}</p>
      </div>
    `;
  }

  function uploadUI(kind) {
    const p = preview[kind];
    const load = kind === 'load';
    return `
      <div class="card upload-card">
        <div class="upper">BROWSER DATA IMPORT / ${load ? 'LOAD' : 'OPCOM'}</div>
        <h2 style="margin-top:10px">${load ? 'normalized-load.csv' : 'normalized-opcom.csv'}</h2>
        <p class="sub">${load ? t('Sit selectat: ', 'Selected site: ') + state.site : t('Prețuri pentru toate siturile; agregare ponderată cu durata', 'Prices for all sites; duration-weighted aggregation')}</p>
        <input type="file" data-csv="${kind}" accept=".csv,text/csv" aria-label="Upload ${load ? 'load' : 'OPCOM'} CSV">
        <div class="row-gap">
          <button class="small" data-download-csv="${kind}">${t('Descarcă exemplu compatibil', 'Download compatible sample')}</button>
          ${p?.rows ? `<button class="small primary" data-apply-csv="${kind}">${t('Aplică', 'Apply')} ${p.rows.length} ${t('rânduri', 'rows')}</button>` : ''}
        </div>
        ${p?.error ? `<p class="error-text section-gap">${esc(p.error)}</p>` : p?.rows ? `<p class="good-text section-gap">${p.rows.length} ${t('rânduri validate · previzualizare', 'validated rows · preview')}</p><pre>${esc(JSON.stringify(p.rows.slice(0, 3), null, 2))}</pre>` : `<pre>${load ? 'timestamp,load_kw\n2020-06-14T00:00:00Z,0.35' : 'timestamp,duration_minutes,price_ron_mwh\n2020-06-14T00:00:00Z,60,500'}</pre>`}
        <small class="muted">${load ? t('Valori orare kW la HH:00 UTC; se aplică numai orelor care coincid cu replay-ul.', 'Hourly kW at HH:00 UTC; applied only to matching replay intervals.') : t('Intervalele trebuie să acopere ore complete, fără suprapuneri. PZU poate fi negativ.', 'Intervals must cover full hours without overlaps. PZU prices may be negative.')}</small>
      </div>
    `;
  }

  /* Executive Guided Jury Tour Presentation HUD */
  function armTour() {
    clearTimeout(tourTimer);
    if (tour && !tour.paused) {
      tourTimer = setTimeout(async () => {
        await tourNext();
        armTour();
      }, 12000);
    }
  }

  function tourUI() {
    if (!tour) return '';
    const titles = [
      t('01 / Instalația care merită atenție', '01 / A site worth investigating'),
      t('02 / Abaterea persistă în timp', '02 / A persistent deviation'),
      t('03 / Verificări înainte de concluzii', '03 / Checks before conclusions'),
      t('04 / Ticket și confirmare', '04 / Ticket and receipt'),
      t('05 / Ce poate face proprietarul', '05 / What the owner can do')
    ];
    const descriptions = [
      t('Site C este selectat. Deschidem dovezile din ultimele 14 zile.', 'Site C is selected. Open the last 14 days of evidence.'),
      t('Zilele 1–7 sunt baza sănătoasă; zilele 8–14 au deficitul injectat de 18%.', 'Days 1–7 form a healthy baseline; days 8–14 contain the injected 18% shortfall.'),
      t('Separăm observațiile, ipotezele și verificările lipsă. Următorul pas salvează o evaluare demonstrativă și creează un singur ticket local.', 'Separate observations, hypotheses and missing checks. Next saves a demo assessment and creates one local ticket.'),
      t('Confirmarea dovedește înregistrarea cererii, nu repararea instalației. Repetarea folosește aceeași cheie.', 'The receipt proves the request was recorded, not that the installation was repaired. Repeats use the same key.'),
      t('Revenim la proprietar: program fezabil, rezervă respectată și aceeași energie finală. Fără comandă în echipament.', 'Return to the owner: feasible schedule, reserve respected and equal terminal energy. No equipment command.')
    ];

    return `
      <aside class="tour" aria-label="Guided jury tour">
        <div>
          <div class="tour-header">
            <span class="tour-badge">${t('DEMO JURIU GHIDAT', 'GUIDED JURY DEMO')}</span>
            <div class="tour-progress">
              ${titles.map((_, i) => `<i class="${i <= tour.step ? 'active' : ''}"></i>`).join('')}
            </div>
          </div>
          <b>${titles[tour.step]}</b>
          <p>${descriptions[tour.step]}</p>
          <small>${tour.paused ? t('În pauză', 'Paused') : t('Auto · 12 secunde / pas', 'Auto · 12 seconds / step')} · ~60 ${t('secunde total', 'seconds total')}</small>
        </div>
        <div class="stack" style="gap:8px;justify-content:center">
          <button data-action="tour-next" class="accent">
            ${tour.step === 4 ? t('Încheie', 'Finish') : t('Continuă', 'Continue')} →
          </button>
          <button class="dismiss" data-action="tour-toggle">
            ${tour.paused ? '▶ ' + t('Reia automat', 'Resume') : '⏸ ' + t('Pauză', 'Pause')}
          </button>
          <button class="dismiss" data-action="tour-close">
            ✕ ${t('Închide', 'Close')}
          </button>
        </div>
      </aside>
    `;
  }

  function renderScreen() {
    return ({
      overview,
      performance,
      schedule,
      costs,
      fleet,
      case: diagnostic,
      connections
    }[state.screen] || overview)();
  }

  function render() {
    try {
      $('#app').innerHTML = shell();
    } catch (e) {
      $('#app').innerHTML = `
        <main>
          <h1>One Energy View</h1>
          <p class="error-text">${esc(e.message)}</p>
          <button data-action="reset-state">Reset local demo state</button>
        </main>
      `;
      console.error(e);
    }
  }

  function download(name, text, type = 'text/plain') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  async function createTicket() {
    const c = caseState();
    const id = identity();
    if (c.receipt) {
      toast(t('Ticket existent — nu a fost duplicat.', 'Existing ticket — no duplicate created.'));
      return c.receipt;
    }
    if (c.status === 'ACTION_REQUESTED' && c.deliveryUncertain) {
      toast(t('Livrare incertă: verifică destinația înainte de retrimitere.', 'Delivery uncertain: reconcile with destination before retrying.'));
      return null;
    }
    if (c.decision !== 'anomaly' || c.status !== 'REVIEWED' || !M.totals(selectedRows()).complete) {
      toast(t('Evaluează mai întâi cazul și verifică datele complete.', 'Review the case and check complete data first.'));
      return null;
    }

    const f = finances();
    const payload = {
      idempotency_key: id.id,
      site_id: state.site,
      rule_id: id.rule,
      evidence_window: id.window,
      title_ro: 'Verificare O&M — Site ' + state.site + ': ' + sig(state.site),
      decision: c.decision,
      technician: state.technicians[state.site],
      notes: c.notes,
      estimated_pv_value_ron_per_day: f.pvExposure === null ? null : f.pvExposure / f.days,
      mode: 'FRONTEND_SIMULATED_REPLAY',
      warning: 'Candidate diagnosis; no real equipment command or verified physical cause.'
    };

    event(c, 'ACTION_REQUESTED', t('Cerere locală înregistrată înainte de livrare', 'Local request persisted before delivery'));
    c.deliveryUncertain = serverAvailable;
    save();
    render();

    let receipt;
    if (serverAvailable) {
      try {
        const response = await fetch('/tickets/' + encodeURIComponent(id.id), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Idempotency-Key': id.id },
          body: JSON.stringify(payload)
        });
        if (!response.ok) {
          c.deliveryUncertain = false;
          event(c, 'REVIEWED', 'HTTP ' + response.status + ' rejected; no acceptance claimed');
          toast('SQLite request rejected: HTTP ' + response.status);
          render();
          return null;
        }
        receipt = await response.json();
        receipt.payload = payload;
        receipt.destination = 'SQLite · local Python';
      } catch (e) {
        c.deliveryUncertain = true;
        save();
        toast(t('Confirmare indisponibilă. Verifică SQLite înainte de a relua cererea.', 'No confirmation. Reconcile SQLite before retrying.'));
        render();
        return null;
      }
    } else {
      receipt = {
        case_id: id.id,
        created_at: new Date().toISOString(),
        destination: storageAvailable ? 'Browser localStorage' : 'Browser session memory',
        status: 'ACCEPTED_LOCAL_ONLY',
        payload
      };
    }

    c.receipt = receipt;
    c.deliveryUncertain = false;
    event(c, 'ACTION_ACCEPTED', receipt.destination + ' · ' + receipt.status);
    toast(t('Ticket înregistrat. Cheia de deduplicare este păstrată.', 'Ticket recorded. Deduplication key retained.'));
    render();
    return receipt;
  }

  async function tourNext() {
    if (!tour) return;
    const activeTour = tour;
    if (tour.step === 0) {
      tour.step = 1;
      setScreen('performance');
    } else if (tour.step === 1) {
      tour.step = 2;
      setScreen('case');
    } else if (tour.step === 2) {
      const c = caseState();
      if (!c.receipt) {
        c.decision = 'anomaly';
        c.notes = t('Evaluare demonstrativă: deficit injectat de 18%; cauza fizică nu este confirmată.', 'Demo assessment: injected 18% deficit; physical cause unconfirmed.');
        if (c.status !== 'ACTION_REQUESTED') event(c, 'REVIEWED', 'GUIDED TOUR / simulated assessment');
        await createTicket();
        if (tour !== activeTour || !c.receipt) return;
      }
      tour.step = 3;
      setScreen('case');
    } else if (tour.step === 3) {
      tour.step = 4;
      state.persona = 'owner';
      state.period = 'day';
      setScreen('schedule');
    } else {
      tour = null;
      toast(t('Tur încheiat. Datele și cazul rămân disponibile.', 'Tour completed. Data and case remain available.'));
    }
    save();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.addEventListener('click', async e => {
    const el = e.target.closest('button,[data-open-site]');
    if (!el || el.disabled) return;

    if (el.dataset.screen) return setScreen(el.dataset.screen);
    if (el.dataset.openSite) {
      state.site = el.dataset.openSite;
      return setScreen('case');
    }

    if (el.dataset.lang) {
      state.lang = el.dataset.lang;
      save();
      return render();
    }
    if (el.dataset.persona) {
      state.persona = el.dataset.persona;
      if (state.persona === 'owner' && ['case', 'fleet'].includes(state.screen)) {
        state.screen = 'overview';
      }
      save();
      return render();
    }

    if (el.dataset.downloadCsv) {
      const kind = el.dataset.downloadCsv;
      const rs = days().at(-1).rows;
      download(
        kind === 'load' ? 'normalized-load.csv' : 'normalized-opcom.csv',
        kind === 'load'
          ? 'timestamp,load_kw\n' + rs.map(r => r.timestamp + ',' + r.load_kwh.toFixed(4)).join('\n')
          : 'timestamp,duration_minutes,price_ron_mwh\n' + rs.map(r => r.timestamp + ',60,' + r.pzu_ron_mwh).join('\n'),
        'text/csv'
      );
      return;
    }

    if (el.dataset.applyCsv) {
      const kind = el.dataset.applyCsv;
      const p = preview[kind];
      try {
        const map = M.importMap(p.rows, kind);
        const stamps = new Set(allRows().map(r => r.timestamp));
        const matched = Object.keys(map).filter(k => stamps.has(k));
        if (!matched.length) throw Error(t('Niciun interval nu coincide cu replay-ul. Folosește exemplul descărcat.', 'No intervals match the replay. Use the downloaded sample.'));
        if (kind === 'load') {
          state.imports.loads = state.imports.loads || {};
          state.imports.loads[state.site] = { ...state.imports.loads[state.site], ...Object.fromEntries(matched.map(k => [k, map[k]])) };
        } else {
          state.imports.prices = { ...state.imports.prices, ...Object.fromEntries(matched.map(k => [k, map[k]])) };
        }
        state.imports.revision = (state.imports.revision || 0) + 1;
        cache.clear();
        save();
        toast(matched.length + ' ' + t('ore actualizate; graficele au fost recalculate.', 'hours updated; charts recomputed.'));
        preview[kind] = null;
        render();
      } catch (err) {
        toast(err.message);
      }
      return;
    }

    const c = caseState();
    switch (el.dataset.action) {
      case 'tour':
        state.site = 'C';
        state.persona = 'ops';
        state.period = '14d';
        state.missing.C = false;
        state.threshold = -12;
        state.terminalLock = true;
        state.reserve = 20;
        state.flex = 'none';
        state.start = 10;
        state.end = 16;
        tour = { step: 0, paused: false };
        setScreen('fleet');
        armTour();
        break;
      case 'tour-next':
        clearTimeout(tourTimer);
        await tourNext();
        armTour();
        break;
      case 'tour-toggle':
        tour.paused = !tour.paused;
        armTour();
        render();
        break;
      case 'tour-close':
        tour = null;
        clearTimeout(tourTimer);
        render();
        break;
      case 'flagged':
        state.site = 'C';
        setScreen('case');
        break;
      case 'review':
        if (c.decision && ['CANDIDATE', 'REOPENED'].includes(c.status)) {
          event(c, 'REVIEWED', c.decision + ' · ' + state.technicians[state.site]);
          toast(t('Evaluare salvată.', 'Assessment saved.'));
          render();
        }
        break;
      case 'ticket':
        await createTicket();
        break;
      case 'progress':
        if (c.receipt && ['ACTION_ACCEPTED', 'REVIEWED'].includes(c.status)) {
          event(c, 'IN_PROGRESS', 'Demo intervention started');
          render();
        }
        break;
      case 'resolve':
        if (c.status === 'IN_PROGRESS') {
          event(c, 'RESOLVED_PENDING_CHECK', 'Awaiting comparable follow-up evidence');
          render();
        }
        break;
      case 'verify':
        if (c.status === 'RESOLVED_PENDING_CHECK' && $('#verify-demo')?.checked) {
          event(c, 'VERIFIED', 'DEMO WORKFLOW ONLY / real financial outcome pending');
          render();
        } else {
          toast(t('Confirmă că verifici doar fluxul demonstrativ.', 'Confirm demo-workflow-only verification.'));
        }
        break;
      case 'reopen':
        if (['RESOLVED_PENDING_CHECK', 'VERIFIED'].includes(c.status)) {
          event(c, 'REOPENED', 'Technician requested further checks');
          render();
        }
        break;
      case 'save-schedule':
        state.savedSchedule = {
          site: state.site,
          at: new Date().toISOString(),
          reserve: state.reserve,
          flex: state.flex,
          start: state.start,
          end: state.end,
          terminalLock: state.terminalLock
        };
        save();
        toast(t('Propunere salvată local. Nu s-a trimis nicio comandă.', 'Proposal saved locally. No command sent.'));
        break;
      case 'download-json':
        download('dashboard.json', JSON.stringify(data, null, 2), 'application/json');
        break;
      case 'clear-imports':
        state.imports = {};
        dataVersion++;
        cache.clear();
        save();
        render();
        toast(t('Importurile CSV au fost eliminate.', 'CSV overlays cleared.'));
        break;
      case 'reset-state':
        state = { ...defaults, cases: {}, missing: {}, imports: {}, technicians: { ...defaults.technicians } };
        save();
        render();
        break;
    }
  });

  document.addEventListener('keydown', e => {
    if (['Enter', ' '].includes(e.key) && e.target.matches('[data-open-site]')) {
      e.preventDefault();
      e.target.click();
    }
    if (e.key === 'Escape' && tour) {
      tour = null;
      clearTimeout(tourTimer);
      render();
    }
  });

  document.addEventListener('input', e => {
    if (e.target.id === 'assessment-notes') {
      caseState().notes = e.target.value;
      save();
    }
    if (e.target.type === 'range') {
      const out = e.target.parentElement.querySelector('output');
      if (out) out.textContent = e.target.value + '%';
    }
  });

  document.addEventListener('change', async e => {
    const el = e.target;
    const id = el.id;

    if (el.dataset.csv) {
      const kind = el.dataset.csv;
      try {
        const file = el.files[0];
        if (!file) return;
        preview[kind] = { rows: M.parseCSV(await file.text(), kind) };
      } catch (err) {
        preview[kind] = { error: err.message };
      }
      render();
      return;
    }

    if (id === 'json-upload') {
      try {
        const file = el.files[0];
        if (!file) return;
        if (file.size > 10_000_000) throw Error('Maximum JSON size: 10 MB');
        data = M.validate(JSON.parse(await file.text()));
        state.imports = {};
        sourceLabel = 'Uploaded dashboard.json';
        dataVersion++;
        cache.clear();
        save();
        render();
        toast(t('JSON încărcat și verificat.', 'JSON loaded and validated.'));
      } catch (err) {
        toast(err.message);
      }
      return;
    }

    if (id === 'site-select') state.site = el.value;
    else if (id === 'period-select') state.period = el.value;
    else if (id === 'commercial') {
      state.commercial = el.checked;
      state.policy = el.checked ? 'commercial' : 'residential';
    } else if (id === 'policy') state.policy = el.value;
    else if (id === 'threshold') state.threshold = Number(el.value);
    else if (['reserve', 'start', 'end'].includes(id)) {
      const value = Number(el.value);
      const max = id === 'reserve' ? 50 : id === 'start' ? 23 : 24;
      const min = id === 'reserve' ? 20 : 0;
      if (!Number.isFinite(value) || value < min || value > max) {
        toast('Invalid range');
        render();
        return;
      }
      state[id] = value;
    } else if (id === 'terminalLock') state.terminalLock = el.checked;
    else if (['flex', 'mode'].includes(id)) state[id] = el.value;
    else if (id === 'missing') state.missing[state.site] = el.checked;
    else if (id === 'decision') caseState().decision = el.value;
    else if (id === 'technician') state.technicians[state.site] = el.value;
    else return;

    save();
    render();
  });

  // URL Hash change handling
  window.addEventListener('hashchange', () => {
    const h = (location.hash || '').replace('#', '');
    if (screens.some(s => s[0] === h) && state.screen !== h) {
      setScreen(h);
    }
  });

  // Tooltip handler
  const tip = $('#tooltip');
  document.addEventListener('pointermove', e => {
    const target = e.target.closest('[data-tip]');
    if (!target) {
      tip.style.display = 'none';
      return;
    }
    tip.textContent = target.dataset.tip;
    tip.style.whiteSpace = 'pre-line';
    tip.style.display = 'block';
    tip.style.left = Math.max(8, Math.min(e.clientX + 14, innerWidth - 360)) + 'px';
    tip.style.top = Math.max(8, Math.min(e.clientY + 14, innerHeight - 160)) + 'px';
  });

  document.addEventListener('focusin', e => {
    if (e.target.dataset.tip) {
      tip.textContent = e.target.dataset.tip;
      tip.style.whiteSpace = 'pre-line';
      tip.style.display = 'block';
      const r = e.target.getBoundingClientRect();
      tip.style.left = Math.max(8, Math.min(r.left, innerWidth - 360)) + 'px';
      tip.style.top = Math.min(r.bottom + 5, innerHeight - 160) + 'px';
    }
  });
  document.addEventListener('focusout', () => {
    tip.style.display = 'none';
  });

  async function boot() {
    const embedded = window.__ENERGY_DATA__;
    if (embedded) {
      data = M.validate(embedded);
      sourceLabel = 'Embedded dashboard.json';
    } else if (location.protocol !== 'file:') {
      try {
        const response = await fetch('dashboard.json', { cache: 'no-store' });
        if (!response.ok) throw Error('HTTP ' + response.status);
        data = M.validate(await response.json());
        sourceLabel = 'Loaded dashboard.json';
      } catch (e) {
        data = M.validate(window.OEV_FALLBACK);
        sourceLabel = 'Built-in reference';
        loadMessage = t('dashboard.json indisponibil; folosim setul istoric inclus.', 'dashboard.json unavailable; using built-in historical reference.');
      }
    } else {
      data = M.validate(window.OEV_FALLBACK);
      sourceLabel = 'Offline built-in reference';
    }

    try {
      if (location.protocol !== 'file:') {
        const r = await fetch('/api/demo-capabilities');
        const x = r.ok ? await r.json() : null;
        serverAvailable = x?.sqlite_work_orders === true;
      }
    } catch {
      serverAvailable = false;
    }

    if (!serverAvailable && Object.values(state.cases).some(c => c.status === 'ACTION_REQUESTED' && c.deliveryUncertain)) {
      loadMessage = t('Un ticket are livrare incertă pe server. Verifică destinația înainte de retrimitere.', 'A server ticket has uncertain delivery. Reconcile before retrying.');
    }

    render();
  }

  boot().catch(e => {
    $('#app').innerHTML = `
      <main>
        <h1>Unable to load energy data</h1>
        <p class="error-text">${esc(e.message)}</p>
      </main>
    `;
    console.error(e);
  });
})();
