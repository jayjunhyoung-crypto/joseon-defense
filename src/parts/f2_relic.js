/* ================= 유물 icons: small inline SVGs, one per treasure ================= */
const RELIC_SVG = {
  cheongja: `<defs><linearGradient id="rgC" x1="0" x2="1"><stop offset="0" stop-color="#9cc8b4"/><stop offset=".55" stop-color="#6fa892"/><stop offset="1" stop-color="#4c806c"/></linearGradient></defs>
    <path d="M24 10h16l-2 5c9 4 13 13 11 24-2 9-6 15-9 19H24c-3-4-7-10-9-19-2-11 2-20 11-24z" fill="url(#rgC)" stroke="#23382f" stroke-width="2.2"/>
    <path d="M25 10h14" stroke="#23382f" stroke-width="3" stroke-linecap="round"/>
    <path d="M22 30c4-3 8-2 10 1M34 38c4-3 8-2 10 1M20 44c3-2 6-2 8 0" stroke="#f4f7f2" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <circle cx="27" cy="29" r="1.6" fill="#f4f7f2"/><circle cx="39" cy="37" r="1.6" fill="#f4f7f2"/>`,
  geumgwan: `<path d="M12 44h40v7H12z" fill="#e8b84a" stroke="#5a3d0c" stroke-width="2"/>
    <path d="M18 44V22m0 8l-5-4m5 9l-5-4M32 44V14m0 9l-6-5m6 5l6-5m-6 13l-6-5m6 5l6-5M46 44V22m0 8l5-4m-5 9l5-4" stroke="#e8b84a" stroke-width="3.4" fill="none" stroke-linecap="round"/>
    <path d="M18 44V22M32 44V14M46 44V22" stroke="#5a3d0c" stroke-width="1" fill="none"/>
    <path d="M15 51c-1 4 0 7 2 8M49 51c1 4 0 7-2 8" stroke="#e8b84a" stroke-width="2" fill="none"/>
    <path d="M24 47a2.4 3.4 0 1 0 .1 0M40 47a2.4 3.4 0 1 0 .1 0M32 27a2.4 3.4 0 1 0 .1 0" fill="#4fae6a" stroke="#1d4a2a" stroke-width="1"/>`,
  hyangno: `<path d="M22 56h20l-3-6H25z" fill="#a8823a" stroke="#4a320e" stroke-width="2"/>
    <path d="M28 50c-6-2-8-6-6-10l4 3 2-5 4 5 4-5 2 5 4-3c2 4 0 8-6 10z" fill="#c99a40" stroke="#4a320e" stroke-width="1.8"/>
    <ellipse cx="32" cy="32" rx="12" ry="10" fill="#d4a548" stroke="#4a320e" stroke-width="2"/>
    <path d="M22 30c3 2 7 2 10 0 3 2 7 2 10 0" stroke="#7a5418" stroke-width="1.4" fill="none"/>
    <path d="M32 22c-2-4 0-8 3-9 2 3 1 6-1 8l4-1c-1 3-4 4-6 2z" fill="#e8c060" stroke="#4a320e" stroke-width="1.6"/>
    <circle cx="27" cy="35" r="1.4" fill="#4a320e"/><circle cx="37" cy="35" r="1.4" fill="#4a320e"/>`,
  hahoetal: `<path d="M32 9c12 0 19 9 19 21 0 15-9 25-19 25S13 45 13 30C13 18 20 9 32 9z" fill="#e3c89a" stroke="#4a3018" stroke-width="2.2"/>
    <path d="M18 27c3-4 8-4 11 0M35 27c3-4 8-4 11 0" stroke="#2a1a0e" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    <path d="M30 31c-1 5 0 8 2 9 2-1 3-4 2-9" fill="#d4b080" stroke="#4a3018" stroke-width="1.4"/>
    <path d="M19 41c6 7 20 7 26 0-4 8-22 8-26 0z" fill="#7a3a22" stroke="#4a3018" stroke-width="1.6"/>
    <path d="M17 34c2 1 4 1 6 0M41 34c2 1 4 1 6 0" stroke="#c88a6a" stroke-width="2" stroke-linecap="round"/>`,
  sinjong: `<path d="M28 8h8v5h-8z" fill="#6d8a74" stroke="#22322a" stroke-width="2"/>
    <path d="M22 14h20c3 0 5 3 5 7l2 27H15l2-27c0-4 2-7 5-7z" fill="#7fa088" stroke="#22322a" stroke-width="2.2"/>
    <path d="M13 48h38v5H13z" fill="#6d8a74" stroke="#22322a" stroke-width="2"/>
    <path d="M20 20h24M19 26h26" stroke="#22322a" stroke-width="1.2"/>
    <circle cx="32" cy="38" r="5" fill="#a8c4ae" stroke="#22322a" stroke-width="1.4"/>
    <path d="M24 31l2 2-2 2-2-2zM40 31l2 2-2 2-2-2z" fill="#22322a"/>`,
  sasindo: `<rect x="9" y="9" width="46" height="46" rx="6" fill="#2a2a3a" stroke="#0e0e16" stroke-width="2"/>
    <path d="M16 40c4-10 12-14 18-10s10 4 14-4" stroke="#4f8ad8" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M46 24l5-3-1 6" fill="#4f8ad8"/><circle cx="47" cy="25" r="1.2" fill="#fff"/>
    <path d="M18 42l-3 4M24 36l-2 5M30 32l-1 5" stroke="#4f8ad8" stroke-width="2" stroke-linecap="round"/>
    <circle cx="16" cy="16" r="3" fill="#e8e4d6"/><circle cx="48" cy="48" r="3" fill="#d63b2e"/><circle cx="16" cy="48" r="3" fill="#111"/><circle cx="16" cy="48" r="3" fill="none" stroke="#e8e4d6" stroke-width="1"/>`,
  janggeom: `<path d="M15 50L47 12l3 2-31 39z" fill="#dfe4ec" stroke="#2a2f3a" stroke-width="2"/>
    <path d="M18 47l28-33" stroke="#fff" stroke-width="1" opacity=".7"/>
    <path d="M12 44l9 9" stroke="#c9a040" stroke-width="5" stroke-linecap="round"/>
    <path d="M9 56l7-7" stroke="#3a2010" stroke-width="5" stroke-linecap="round"/>
    <path d="M10 57c-4 1-5 4-3 7M8 58c-1 2 0 4 1 5" stroke="#d63b2e" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
  honcheon: `<path d="M32 50v7M22 58h20" stroke="#5a3d1a" stroke-width="3" stroke-linecap="round"/>
    <circle cx="32" cy="30" r="18" fill="none" stroke="#c99a40" stroke-width="3"/>
    <ellipse cx="32" cy="30" rx="18" ry="7" fill="none" stroke="#c99a40" stroke-width="2.4" transform="rotate(-25 32 30)"/>
    <ellipse cx="32" cy="30" rx="7" ry="18" fill="none" stroke="#a87a28" stroke-width="2.2"/>
    <circle cx="32" cy="30" r="5" fill="#4f8ad8" stroke="#1e3a6a" stroke-width="1.6"/>
    <path d="M32 12v-3" stroke="#5a3d1a" stroke-width="2.4" stroke-linecap="round"/>`,
  cheugugi: `<path d="M16 46h32l3 10H13z" fill="#a39f96" stroke="#3a3730" stroke-width="2"/>
    <path d="M18 46h28" stroke="#3a3730" stroke-width="1.4"/>
    <rect x="24" y="12" width="16" height="34" rx="2" fill="#7f8a96" stroke="#232830" stroke-width="2"/>
    <path d="M24 22h16M24 34h16" stroke="#232830" stroke-width="1.6"/>
    <path d="M27 8c0 3-3 4-3 6M37 6c0 3-3 4-3 6M32 2c0 3-3 4-3 6" stroke="#6ab4e8" stroke-width="2" stroke-linecap="round" fill="none"/>`,
  haerye: `<path d="M12 14h18c2 0 2 2 2 2v38s0-2-2-2H12z" fill="#efe4c8" stroke="#4a3a20" stroke-width="2"/>
    <path d="M52 14H34c-2 0-2 2-2 2v38s0-2 2-2h18z" fill="#e8dcbc" stroke="#4a3a20" stroke-width="2"/>
    <path d="M17 22h8v8M17 36v8h8" stroke="#2a1e10" stroke-width="2.4" fill="none"/>
    <circle cx="44" cy="26" r="4" fill="none" stroke="#2a1e10" stroke-width="2.2"/>
    <path d="M38 38h12M44 34v12" stroke="#2a1e10" stroke-width="2.2"/>
    <path d="M10 14v40" stroke="#8a2a1e" stroke-width="2.6"/>`,
  angbu: `<path d="M20 50l-4 8M44 50l4 8M32 52v6" stroke="#5a3d1a" stroke-width="3" stroke-linecap="round"/>
    <path d="M10 26h44c0 14-10 24-22 24S10 40 10 26z" fill="#c99a40" stroke="#4a320e" stroke-width="2.2"/>
    <ellipse cx="32" cy="26" rx="22" ry="6" fill="#e8c878" stroke="#4a320e" stroke-width="2"/>
    <path d="M14 26c4 2 8 3 18 3s14-1 18-3M22 23l4 6M32 21v8M42 23l-4 6" stroke="#4a320e" stroke-width="1.2" fill="none"/>
    <path d="M32 26L46 14" stroke="#2a1a0a" stroke-width="2" stroke-linecap="round"/>`,
  sangpyeong: `<circle cx="32" cy="32" r="22" fill="#b98a3a" stroke="#4a320e" stroke-width="2.4"/>
    <circle cx="32" cy="32" r="18" fill="none" stroke="#e8c470" stroke-width="1.6"/>
    <rect x="25" y="25" width="14" height="14" fill="#2a2436" stroke="#4a320e" stroke-width="2"/>
    <path d="M32 13v8M32 43v8M13 32h8M43 32h8" stroke="#5a3d10" stroke-width="2.4" stroke-linecap="round"/>`,
  dalhang: `<path d="M24 11h16v4c10 3 15 11 15 20 0 12-10 21-23 21S9 47 9 35c0-9 5-17 15-20z" fill="#f4f1e8" stroke="#6a6458" stroke-width="2.2"/>
    <path d="M24 11h16" stroke="#6a6458" stroke-width="3" stroke-linecap="round"/>
    <path d="M14 30c6-6 14-8 22-6" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".9"/>
    <path d="M12 38c10 4 30 4 40 0" stroke="#d8d2c4" stroke-width="1.4" fill="none"/>`,
  jagyeok: `<rect x="8" y="10" width="16" height="12" rx="2" fill="#8a6a4a" stroke="#3a2a1a" stroke-width="2"/>
    <rect x="20" y="26" width="16" height="12" rx="2" fill="#8a6a4a" stroke="#3a2a1a" stroke-width="2"/>
    <rect x="34" y="40" width="22" height="16" rx="2" fill="#8a6a4a" stroke="#3a2a1a" stroke-width="2"/>
    <path d="M22 18c2 2 2 5 0 8M34 34c2 2 2 5 0 8" stroke="#6ab4e8" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M36 46h18" stroke="#6ab4e8" stroke-width="3"/>
    <path d="M45 40V28" stroke="#c99a40" stroke-width="2.4" stroke-linecap="round"/><circle cx="45" cy="27" r="2.4" fill="#d63b2e"/>`,
  cheomseong: `<path d="M24 12h16l1 4H23z" fill="#b5ab98" stroke="#3a3428" stroke-width="2"/>
    <path d="M25 16c-1 10-6 24-9 36h32c-3-12-8-26-9-36z" fill="#cfc4ae" stroke="#3a3428" stroke-width="2.2"/>
    <path d="M22 28h20M20 36h24M18 44h28M23 22h18" stroke="#8a806c" stroke-width="1.2"/>
    <rect x="28" y="30" width="8" height="7" fill="#2a2436" stroke="#3a3428" stroke-width="1.4"/>
    <path d="M12 52h40v4H12z" fill="#a39880" stroke="#3a3428" stroke-width="2"/>
    <path d="M46 8l1.5 3 3 .5-2.2 2 .6 3-2.9-1.5L43 16.5l.6-3-2.2-2 3-.5z" fill="#f2d36b"/>`,
};
function relicIcon(id, size, dim) {
  const body = RELIC_SVG[id] || '';
  return `<svg class="relic-svg${dim ? ' is-dim' : ''}" viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;
}

