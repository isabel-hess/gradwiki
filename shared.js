/* shared.js — wiki navigation & search */

// ── Per-page sidebar search ──────────────────────────────────────────────────
function initSidebarSearch(inputId, noResultsId) {
  const input     = document.getElementById(inputId);
  const noResults = document.getElementById(noResultsId);
  if (!input) return;

  const allLinks    = document.querySelectorAll('.sidebar a');
  const groupLabels = document.querySelectorAll('.sidebar .nav-label');

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) {
      allLinks.forEach(l => l.classList.remove('hidden'));
      groupLabels.forEach(g => g.style.display = '');
      if (noResults) noResults.style.display = 'none';
      return;
    }
    let any = false;
    allLinks.forEach(link => {
      const hay = (link.dataset.terms || '') + ' ' + link.textContent;
      const match = hay.toLowerCase().includes(q);
      link.classList.toggle('hidden', !match);
      if (match) any = true;
    });
    groupLabels.forEach(label => {
      let next = label.nextElementSibling;
      let visible = false;
      while (next && !next.classList.contains('nav-label')) {
        if (!next.classList.contains('hidden') && next.tagName === 'A') visible = true;
        next = next.nextElementSibling;
      }
      label.style.display = visible ? '' : 'none';
    });
    if (noResults) noResults.style.display = any ? 'none' : 'block';
  });
}

// ── Active sidebar link on scroll ───────────────────────────────────────────
function initScrollSpy() {
  const sections = document.querySelectorAll('.wiki-section');
  const links    = document.querySelectorAll('.sidebar a');
  if (!sections.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const a = document.querySelector(`.sidebar a[href="#${e.target.id}"]`);
        if (a) a.classList.add('active');
      }
    });
  }, { threshold: 0.2, rootMargin: '-56px 0px -60% 0px' });

  sections.forEach(s => obs.observe(s));
}

// ── Global cross-page search ─────────────────────────────────────────────────
const SEARCH_INDEX = [
  // index
  { title: 'Research Overview',              page: 'index.html#overview',          terms: 'overview dissertation aims timeline nebula hasel energy harvesting gantry nrel contract' },
  // nebula
  { title: 'Nebula: Design & Fabrication',   page: 'nebula.html#nebula-design',    terms: 'nebula design fabrication tpu silicone hasel skeleton mold ecoflex speckle paint cantilever' },
  { title: 'Nebula: Kinematic Testing',      page: 'nebula.html#nebula-testing',   terms: 'nebula kinematic testing dic ldv laser doppler vibrometry quiescent water modal mac traveling index mode shape cupping' },
  { title: 'EHE Simulation',                 page: 'nebula.html#nebula-model',     terms: 'ehe electro hydro elastic model simulation galerkin euler bernoulli fluid structure interaction lighthill aureli' },
  { title: 'Nebula v2',                      page: 'nebula.html#nebula-v2',        terms: 'nebula v2 robosoft 2025 strain gauge load cell dspace thrust phase offset distributed muscles lausanne soto' },
  // energy
  { title: 'HASEL Theory of Operation',      page: 'energy.html#hasel-theory',     terms: 'hasel theory ccw generation cycle capacitance voltage zipping priming constant voltage cmax cmin kellaris' },
  { title: 'Circuit Design',                 page: 'energy.html#hasel-circuit',    terms: 'hasel circuit duranti reed relay pico voltage measurement cp resistor hv amplifier cynergy' },
  { title: 'Experimental Results',           page: 'energy.html#hasel-results',    terms: 'hasel results energy generation mj efficiency mechanical density test matrix 3kv 6kv energies mdpi boren chamot' },
  { title: 'Power & Frequency Study',        page: 'energy.html#hasel-freq',       terms: 'hasel power frequency cycling nrel megsrp power density linear inertial viscous crio labview motor rothemund' },
  { title: 'Self-Sensing',                   page: 'energy.html#hasel-selfsensing',terms: 'hasel self sensing capacitive ac impedance rizzello artimus data over power rls recursive least squares' },
  { title: 'HASEL Memcapacitance',           page: 'energy.html#hasel-memcap',     terms: 'hasel memcapacitance nonlinear capacitance hysteresis qv cv bias triangular carrier trek amplifier april 2026 acome' },
  { title: 'Nebula Energy Harvesting',       page: 'energy.html#nebula-eh',        terms: 'nebula energy harvesting bending gantry phase offset dic zipping karman vortex strain resonance base excitation' },
  // side projects
  { title: 'Underwater DIC (NREL)',          page: 'side-projects.html#dic',       terms: 'dic underwater deformation nrel wave flume snell camera angle surrogate wec videogrammetry contract vro calibration' },
  { title: 'Gantry System Build',            page: 'side-projects.html#gantry',    terms: 'gantry system build galil dyn4 servo z brake oscillation platform three axis ball screw encoder' },
  // pubs
  { title: 'Publications & Conferences',     page: 'publications.html#pubs',       terms: 'publications papers smasis robosoft journal doi conferences hardware competition award 2022 2023 2024 2025 energies smart materials' },
  // background
  { title: 'What is a HASEL?',              page: 'background.html#hasel-background', terms: 'hasel background what is hydraulically amplified self healing electrostatic peano variable capacitor artimus electrostatic zipping' },
  { title: 'EHE Modeling Background',       page: 'background.html#ehe-background',   terms: 'ehe background euler bernoulli lighthill galerkin traveling index mac beam theory fluid structure musgrave 2021' },
];

function initGlobalSearch(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  // build dropdown
  const wrap = input.closest('.global-search');
  const dropdown = document.createElement('div');
  dropdown.id = 'global-dropdown';
  dropdown.style.cssText = `
    position:fixed; background:#fff; border:1px solid #e0ddd7; border-radius:8px;
    box-shadow:0 4px 20px rgba(0,0,0,0.10); z-index:9999;
    max-height:320px; overflow-y:auto; display:none; min-width:280px;
  `;
  document.body.appendChild(dropdown);

  function positionDropdown() {
    const r = wrap.getBoundingClientRect();
    dropdown.style.left  = r.left  + 'px';
    dropdown.style.top   = (r.bottom + 4) + 'px';
    dropdown.style.width = Math.max(r.width, 280) + 'px';
  }

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { dropdown.style.display = 'none'; return; }
    const hits = SEARCH_INDEX.filter(item =>
      item.title.toLowerCase().includes(q) || item.terms.toLowerCase().includes(q)
    );
    if (!hits.length) {
      dropdown.innerHTML = '<div style="padding:10px 14px;font-size:12px;color:#9c9890;font-family:monospace">No results</div>';
    } else {
      dropdown.innerHTML = hits.map(h => `
        <a href="${h.page}" style="display:flex;align-items:center;gap:10px;padding:9px 14px;text-decoration:none;color:#1a1916;font-size:13px;border-bottom:1px solid #f0eeea;transition:background 0.1s"
           onmouseover="this.style.background='#f0eeea'" onmouseout="this.style.background=''">
          <span style="font-size:16px">${getPageIcon(h.page)}</span>
          <span>
            <div style="font-weight:500">${h.title}</div>
            <div style="font-size:11px;color:#9c9890;font-family:monospace">${getPageLabel(h.page)}</div>
          </span>
        </a>`).join('');
    }
    positionDropdown();
    dropdown.style.display = 'block';
  });

  input.addEventListener('focus', () => { if (input.value.trim()) dropdown.style.display = 'block'; });
  document.addEventListener('click', e => {
    if (!wrap.contains(e.target) && e.target !== dropdown) dropdown.style.display = 'none';
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { dropdown.style.display = 'none'; input.blur(); } });
}

function getPageIcon(page) {
  if (page.startsWith('nebula')) return '🐟';
  if (page.startsWith('energy')) return '⚡';
  if (page.startsWith('side'))   return '🔧';
  if (page.startsWith('pub'))    return '📄';
  if (page.startsWith('back'))   return '📚';
  return '🗺';
}
function getPageLabel(page) {
  if (page.startsWith('nebula')) return 'Aim 1 — Soft Robotic Fish';
  if (page.startsWith('energy')) return 'Aim 2 — Energy Harvesting';
  if (page.startsWith('side'))   return 'Side Projects';
  if (page.startsWith('pub'))    return 'Publications';
  if (page.startsWith('back'))   return 'Background';
  return 'Overview';
}

// Init on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initSidebarSearch('sidebarSearch', 'sidebarNoResults');
  initScrollSpy();
  initGlobalSearch('globalSearch');
});
