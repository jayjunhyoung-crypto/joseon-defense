/* ================= 2D art: cut-out puppets drawn in code ================= */
const OL = '#2a1a10';
const HAN = '#f7f3ea';
const SKIN = '#f2c9a2';
function P(c, fill, fn, lw = 2.6) { c.beginPath(); fn(c); if (fill) { c.fillStyle = fill; c.fill(); } if (lw) { c.lineWidth = lw; c.strokeStyle = OL; c.stroke(); } }
function F(c, fill, fn) { c.beginPath(); fn(c); c.fillStyle = fill; c.fill(); }
function L(c, col, w, fn) { c.beginPath(); fn(c); c.strokeStyle = col; c.lineWidth = w; c.stroke(); }
function E(c, x, y, rx, ry, rot = 0) { c.moveTo(x + rx * Math.cos(rot), y + rx * Math.sin(rot)); c.ellipse(x, y, rx, ry, rot, 0, TAU); }
function Cc(c, x, y, r) { c.moveTo(x + r, y); c.arc(x, y, r, 0, TAU); }
function RR(c, x, y, w, h, r) { c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function at(c, x, y, s, fn, rot = 0) { c.save(); c.translate(x, y); if (rot) c.rotate(rot); if (s !== 1) c.scale(s, s); fn(c); c.restore(); }
function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = n >> 16 & 255, g = n >> 8 & 255, b = n & 255;
  const t = amt < 0 ? 0 : 255, p = Math.abs(amt);
  r = Math.round(r + (t - r) * p); g = Math.round(g + (t - g) * p); b = Math.round(b + (t - b) * p);
  return '#' + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
}
function rgba(hex, a) { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
const HC = [3, -66];

/* ---------- masks (centered, about 38 wide and 44 tall) ---------- */
function oval(c, col, rx = 19, ry = 22) { P(c, col, c => E(c, 0, 0, rx, ry)); F(c, 'rgba(255,255,255,.18)', c => E(c, -6, -9, 8, 6, -0.4)); }
const MASK = {
  choraengi(c) {
    P(c, '#b5652e', c => { c.moveTo(0, 23); c.bezierCurveTo(-13, 21, -19, 9, -19, -2); c.bezierCurveTo(-19, -16, -10, -22, 0, -22); c.bezierCurveTo(10, -22, 19, -16, 19, -2); c.bezierCurveTo(19, 9, 13, 21, 0, 23); c.closePath(); });
    L(c, OL, 3.4, c => { c.moveTo(-14, -10); c.lineTo(-4, -6); c.moveTo(14, -10); c.lineTo(4, -6); });
    F(c, OL, c => { Cc(c, -7, 0, 4); Cc(c, 8, 0, 4); });
    F(c, '#fff', c => { Cc(c, -6, -1.4, 1.3); Cc(c, 9, -1.4, 1.3); });
    P(c, '#8a4320', c => E(c, 1, 12, 5.5, 4.6), 2);
    F(c, OL, c => E(c, 1, 12, 3, 2.6));
  },
  imae(c) {
    P(c, '#dcb57c', c => { c.moveTo(-18, 10); c.bezierCurveTo(-21, -10, -14, -22, 0, -22); c.bezierCurveTo(14, -22, 21, -10, 18, 10); c.quadraticCurveTo(0, 15, -18, 10); c.closePath(); });
    L(c, '#5a3418', 2.6, c => { c.moveTo(-14, -11); c.quadraticCurveTo(-8, -15, -3, -11); c.moveTo(14, -11); c.quadraticCurveTo(8, -15, 3, -11); });
    L(c, OL, 3, c => { c.moveTo(-13, -3); c.quadraticCurveTo(-8, 2, -3, -3); c.moveTo(13, -3); c.quadraticCurveTo(8, 2, 3, -3); });
    F(c, 'rgba(214,90,60,.3)', c => { Cc(c, -13, 4, 4); Cc(c, 13, 4, 4); });
    P(c, OL, c => { c.moveTo(-12, 7); c.quadraticCurveTo(0, 15, 12, 7); c.quadraticCurveTo(0, 10, -12, 7); }, 0);
  },
  halmi(c) {
    oval(c, '#5f4535', 18, 21);
    L(c, 'rgba(230,190,150,.45)', 1.6, c => { for (let k = 0; k < 3; k++) { c.moveTo(-10, -15 - k * 3.5); c.quadraticCurveTo(0, -18 - k * 3.5, 10, -15 - k * 3.5); } });
    F(c, 'rgba(230,190,150,.45)', c => { Cc(c, -7, 0, 5.5); Cc(c, 8, 0, 5.5); });
    F(c, '#120a06', c => { Cc(c, -7, 0, 3.6); Cc(c, 8, 0, 3.6); });
    P(c, '#120a06', c => { c.moveTo(-8, 14); c.quadraticCurveTo(1, 4, 9, 14); c.quadraticCurveTo(1, 10, -8, 14); }, 0);
    L(c, 'rgba(230,190,150,.4)', 1.4, c => { c.moveTo(-14, 6); c.quadraticCurveTo(-13, 14, -8, 18); c.moveTo(15, 6); c.quadraticCurveTo(14, 14, 9, 18); });
  },
  bune(c) {
    oval(c, '#f5eddf', 17, 21);
    L(c, '#2a1d14', 2, c => { c.moveTo(-11, -8); c.quadraticCurveTo(-7, -11, -3, -8); c.moveTo(11, -8); c.quadraticCurveTo(7, -11, 3, -8); });
    L(c, '#2a1d14', 2.4, c => { c.moveTo(-11, 0); c.quadraticCurveTo(-7, -3, -3, 0); c.moveTo(11, 0); c.quadraticCurveTo(7, -3, 3, 0); });
    F(c, '#d4473b', c => { Cc(c, -10, 8, 3.6); Cc(c, 10, 8, 3.6); Cc(c, 0, -14, 2.6); });
    F(c, '#c0392b', c => E(c, 0, 13, 3, 2));
  },
  baekjeong(c) {
    oval(c, '#91633a', 19, 21);
    L(c, '#1f1007', 4, c => { c.moveTo(-14, -9); c.lineTo(-4, -4); c.moveTo(14, -9); c.lineTo(4, -4); });
    F(c, '#1a0d05', c => { E(c, -8, 1, 3.6, 2.6); E(c, 8, 1, 3.6, 2.6); });
    P(c, '#1a0d05', c => { c.moveTo(-12, 9); c.quadraticCurveTo(0, 21, 12, 9); c.quadraticCurveTo(0, 13, -12, 9); }, 0);
    F(c, '#f3ecda', c => { c.moveTo(-9, 10.5); c.quadraticCurveTo(0, 14, 9, 10.5); c.lineTo(8, 12.6); c.quadraticCurveTo(0, 16.2, -8, 12.6); c.closePath(); });
  },
  yangban(c) {
    oval(c, '#e6c086', 19, 22);
    L(c, '#3a2414', 3.6, c => { c.moveTo(-15, -7); c.quadraticCurveTo(-9, -12, -3, -7); c.moveTo(15, -7); c.quadraticCurveTo(9, -12, 3, -7); });
    L(c, OL, 3, c => { c.moveTo(-14, 0); c.quadraticCurveTo(-8, -5, -3, 0); c.moveTo(14, 0); c.quadraticCurveTo(8, -5, 3, 0); });
    F(c, 'rgba(214,90,60,.25)', c => { Cc(c, -13, 7, 4.5); Cc(c, 13, 7, 4.5); });
    P(c, OL, c => { c.moveTo(-12, 8); c.quadraticCurveTo(0, 18, 12, 8); c.quadraticCurveTo(0, 12, -12, 8); }, 0);
    L(c, 'rgba(40,22,10,.85)', 2.6, c => { c.moveTo(-17, 13); c.quadraticCurveTo(0, 23, 17, 13); });
  },
  seonbi(c) {
    oval(c, '#d8ae76', 16, 23);
    L(c, '#3a2414', 3, c => { c.moveTo(-13, -6); c.lineTo(-3, -10); c.moveTo(13, -6); c.lineTo(3, -10); });
    P(c, OL, c => { c.moveTo(-12, 0); c.quadraticCurveTo(-7, -4, -3, -1); c.quadraticCurveTo(-7, 0, -12, 0); c.moveTo(12, 0); c.quadraticCurveTo(7, -4, 3, -1); c.quadraticCurveTo(7, 0, 12, 0); }, 0);
    F(c, '#3a2010', c => { E(c, -2.6, 8, 2.2, 1.6); E(c, 2.6, 8, 2.2, 1.6); });
    F(c, OL, c => E(c, 0, 15, 4.4, 2.4));
    L(c, 'rgba(40,22,10,.85)', 2.4, c => { c.moveTo(-13, 17); c.quadraticCurveTo(0, 26, 13, 17); });
  },
  jung(c) {
    oval(c, '#c97b4f', 19, 22);
    F(c, '#3a1d0e', c => Cc(c, 0, -12, 2));
    L(c, OL, 2.8, c => { c.moveTo(-13, -1); c.quadraticCurveTo(-8, -5, -3, -1); c.moveTo(13, -1); c.quadraticCurveTo(8, -5, 3, -1); });
    L(c, 'rgba(70,35,15,.6)', 2, c => { c.moveTo(0, -1); c.lineTo(-2, 8); c.quadraticCurveTo(0, 10, 3, 8); });
    L(c, OL, 2.6, c => { c.moveTo(-6, 14); c.quadraticCurveTo(0, 17, 6, 12); });
    F(c, 'rgba(214,90,60,.25)', c => { Cc(c, -12, 8, 4); Cc(c, 12, 8, 4); });
  },
  gaksi(c) {
    oval(c, '#f7efe3', 16, 20);
    L(c, '#2a1d14', 2.2, c => { c.moveTo(-10, 0); c.quadraticCurveTo(-6, 3, -2.5, 0); c.moveTo(10, 0); c.quadraticCurveTo(6, 3, 2.5, 0); });
    F(c, '#d4473b', c => { Cc(c, -9, 8, 3); Cc(c, 9, 8, 3); Cc(c, 0, -12, 2.2); });
    F(c, '#b8322a', c => E(c, 0, 12, 2.4, 1.6));
  },
  malttugi(c) {
    oval(c, '#c4553b', 19, 22);
    F(c, 'rgba(255,190,150,.3)', c => { Cc(c, 0, -15, 4); Cc(c, -12, -11, 3); Cc(c, 12, -11, 3); });
    L(c, '#1a0d07', 4.2, c => { c.moveTo(-15, -6); c.quadraticCurveTo(-9, -13, -3, -6); c.moveTo(15, -6); c.quadraticCurveTo(9, -13, 3, -6); });
    P(c, '#f6ecd8', c => { E(c, -8, 0, 4.6, 4.2); E(c, 8, 0, 4.6, 4.2); }, 1.6);
    F(c, '#140a05', c => { Cc(c, -7.4, 0.5, 2.4); Cc(c, 8.6, 0.5, 2.4); });
    P(c, shade('#c4553b', 0.22), c => E(c, 0, 7, 5.5, 5), 1.6);
    P(c, OL, c => { c.moveTo(-12, 12); c.quadraticCurveTo(0, 22, 12, 12); c.quadraticCurveTo(0, 15, -12, 12); }, 0);
    F(c, '#f4ead6', c => { c.moveTo(-9, 13.4); c.quadraticCurveTo(0, 17, 9, 13.4); c.lineTo(8, 15.2); c.quadraticCurveTo(0, 19, -8, 15.2); c.closePath(); });
  },
  chwibari(c) {
    oval(c, '#b83a2c', 18, 22);
    L(c, 'rgba(255,200,170,.3)', 1.5, c => { for (let k = 0; k < 3; k++) { c.moveTo(-10, -12 - k * 3); c.quadraticCurveTo(0, -15 - k * 3, 10, -12 - k * 3); } });
    L(c, '#1a0b06', 3.6, c => { c.moveTo(-14, -5); c.lineTo(-5, -7); c.moveTo(14, -5); c.lineTo(5, -7); });
    P(c, '#e8c45a', c => { Cc(c, -8, 0, 4.2); Cc(c, 8, 0, 4.2); }, 1.6);
    F(c, OL, c => { Cc(c, -8, 0, 2.4); Cc(c, 8, 0, 2.4); });
    P(c, OL, c => { c.moveTo(-10, 9); c.quadraticCurveTo(0, 22, 10, 9); c.quadraticCurveTo(0, 13, -10, 9); }, 0);
    F(c, '#e2584a', c => E(c, 0, 15, 4, 2.2));
  },
  cheoyong(c) {
    oval(c, '#a8452f', 19, 22);
    L(c, '#1a0c08', 3.8, c => { c.moveTo(-15, -7); c.quadraticCurveTo(-9, -12, -3, -7); c.moveTo(15, -7); c.quadraticCurveTo(9, -12, 3, -7); });
    P(c, '#f2e6d0', c => { E(c, -8, 0, 4.6, 3); E(c, 8, 0, 4.6, 3); }, 1.4);
    F(c, OL, c => { Cc(c, -8, 0, 2.1); Cc(c, 8, 0, 2.1); });
    P(c, shade('#a8452f', 0.2), c => { c.moveTo(0, -4); c.quadraticCurveTo(-5, 6, -5, 8); c.quadraticCurveTo(0, 11, 5, 8); c.quadraticCurveTo(5, 6, 0, -4); }, 1.6);
    P(c, OL, c => { c.moveTo(-11, 12); c.quadraticCurveTo(0, 20, 11, 12); c.quadraticCurveTo(0, 15, -11, 12); }, 0);
    F(c, '#f6eedc', c => { c.moveTo(-8, 13); c.quadraticCurveTo(0, 16, 8, 13); c.lineTo(7.4, 14.6); c.quadraticCurveTo(0, 18, -7.4, 14.6); c.closePath(); });
    F(c, '#e2b04a', c => Cc(c, 0, -15, 2.2));
  },
  bangsangsi(c) {
    P(c, '#5b2a22', c => { c.moveTo(-18, -18); c.quadraticCurveTo(0, -25, 18, -18); c.quadraticCurveTo(21, 2, 17, 18); c.quadraticCurveTo(0, 26, -17, 18); c.quadraticCurveTo(-21, 2, -18, -18); c.closePath(); });
    L(c, '#1a0806', 3.2, c => { c.moveTo(-15, -13); c.lineTo(-4, -10); c.moveTo(15, -13); c.lineTo(4, -10); });
    for (const [x, y] of [[-8, -5], [8, -5], [-8, 4], [8, 4]]) { P(c, '#ffcf4a', c => c.rect(x - 4, y - 3, 8, 6), 1.4); F(c, OL, c => c.rect(x - 1.6, y - 1.6, 3.2, 3.2)); }
    P(c, OL, c => { c.moveTo(-12, 11); c.lineTo(12, 11); c.quadraticCurveTo(11, 19, 0, 20); c.quadraticCurveTo(-11, 19, -12, 11); }, 0);
    F(c, '#f4ead6', c => { for (const x of [-9, -3, 3, 9]) { c.moveTo(x - 2, 11); c.lineTo(x, 15); c.lineTo(x + 2, 11); } });
  },
};
/* human faces for non-mask characters */
function face(c, o = {}) {
  const x = HC[0], y = HC[1] + 1;
  P(c, o.skin || '#f3cda5', c => Cc(c, x, y, 19));
  if (o.closed) L(c, OL, 2.4, c => { c.moveTo(x - 9, y + 2); c.quadraticCurveTo(x - 6, y + 5, x - 3, y + 2); c.moveTo(x + 5, y + 2); c.quadraticCurveTo(x + 8, y + 5, x + 11, y + 2); });
  else { F(c, OL, c => { E(c, x - 6, y + 2, 2.3, 3); E(c, x + 8, y + 2, 2.3, 3); }); F(c, '#fff', c => { Cc(c, x - 5.3, y + 1, 0.9); Cc(c, x + 8.7, y + 1, 0.9); }); }
  if (o.brows) L(c, OL, 2.2, c => { c.moveTo(x - 10, y - 5); c.lineTo(x - 3, y - 4); c.moveTo(x + 4, y - 4); c.lineTo(x + 12, y - 5); });
  F(c, 'rgba(232,110,90,.42)', c => { E(c, x - 11, y + 8, 4, 2.6); E(c, x + 13, y + 8, 4, 2.6); });
  if (o.mustache) P(c, OL, c => { c.moveTo(x - 6, y + 10); c.quadraticCurveTo(x + 1, y + 7, x + 8, y + 10); c.quadraticCurveTo(x + 1, y + 9.5, x - 6, y + 10); }, 1.2);
  if (o.mouth === 'small') F(c, '#c0453a', c => E(c, x + 1, y + 11, 2.2, 1.4));
  else P(c, '#c0453a', c => { c.moveTo(x - 3, y + 9); c.quadraticCurveTo(x + 1.5, y + 15, x + 6, y + 9); c.closePath(); }, 1.6);
}
function maskOn(c, id) { at(c, HC[0], HC[1], 1, MASK[id]); }

/* ---------- hats and hair ---------- */
function flower(c, x, y, r, col) {
  for (let k = 0; k < 6; k++) { const a = k * TAU / 6; P(c, col, c => E(c, x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55, r * 0.55, r * 0.4, a), 1.2); }
  F(c, '#fff3b0', c => Cc(c, x, y, r * 0.3));
}
const HAT = {
  paeraengi(c) { const x = HC[0], y = HC[1]; P(c, '#cfae6c', c => E(c, x, y - 15, 30, 6)); P(c, '#cfae6c', c => { c.moveTo(x - 13, y - 16); c.lineTo(x - 10, y - 32); c.quadraticCurveTo(x, y - 35, x + 10, y - 32); c.lineTo(x + 13, y - 16); c.closePath(); }); F(c, '#2a2420', c => c.rect(x - 12.5, y - 22, 25, 4)); L(c, 'rgba(120,90,40,.5)', 1.2, c => { for (let k = -2; k <= 2; k++) { c.moveTo(x + k * 5, y - 31); c.lineTo(x + k * 6, y - 17); } }); },
  sangtu(c) { const x = HC[0], y = HC[1]; P(c, '#141010', c => { E(c, x - 1, y - 20, 18, 7); }); P(c, '#141010', c => Cc(c, x, y - 29, 6)); F(c, '#e8c45a', c => c.rect(x - 7, y - 26, 14, 2.4)); },
  scarf(c) { const x = HC[0], y = HC[1]; P(c, '#ebe5d4', c => { c.moveTo(x - 22, y + 4); c.quadraticCurveTo(x - 25, y - 26, x, y - 27); c.quadraticCurveTo(x + 25, y - 26, x + 22, y + 4); c.quadraticCurveTo(x + 16, y - 12, x, y - 14); c.quadraticCurveTo(x - 16, y - 12, x - 22, y + 4); c.closePath(); }); P(c, '#ddd3be', c => E(c, x + 21, y - 6, 5, 4, 0.6), 1.6); L(c, 'rgba(120,100,70,.35)', 1.3, c => { c.moveTo(x - 15, y - 19); c.quadraticCurveTo(x, y - 24, x + 15, y - 19); }); },
  buneHair(c) { const x = HC[0], y = HC[1]; P(c, '#17131a', c => { c.moveTo(x, y - 26); c.bezierCurveTo(x - 23, y - 26, x - 25, y - 6, x - 21, y + 8); c.bezierCurveTo(x - 17, y - 8, x - 9, y - 14, x, y - 14); c.bezierCurveTo(x + 9, y - 14, x + 17, y - 8, x + 21, y + 8); c.bezierCurveTo(x + 25, y - 6, x + 23, y - 26, x, y - 26); }); P(c, '#17131a', c => Cc(c, x - 18, y - 16, 8)); L(c, '#e8c45a', 2.4, c => { c.moveTo(x - 30, y - 16); c.lineTo(x - 6, y - 16); }); F(c, '#d4473b', c => Cc(c, x - 30, y - 16, 2.4)); },
  buneBack(c) { const x = HC[0], y = HC[1]; P(c, '#17131a', c => E(c, x - 2, y, 23, 25)); },
  headband(c) { const x = HC[0], y = HC[1]; P(c, '#ece5d4', c => { c.moveTo(x - 20, y - 8); c.quadraticCurveTo(x, y - 19, x + 20, y - 8); c.lineTo(x + 20, y - 3); c.quadraticCurveTo(x, y - 14, x - 20, y - 3); c.closePath(); }, 2); P(c, '#ece5d4', c => { c.moveTo(x - 20, y - 6); c.lineTo(x - 30, y - 12); c.lineTo(x - 28, y - 2); c.closePath(); }, 1.8); },
  hairShort(c) { const x = HC[0], y = HC[1]; P(c, '#1b1512', c => { c.moveTo(x - 20, y + 2); c.quadraticCurveTo(x - 22, y - 22, x, y - 23); c.quadraticCurveTo(x + 22, y - 22, x + 20, y + 2); c.quadraticCurveTo(x + 13, y - 12, x, y - 12); c.quadraticCurveTo(x - 13, y - 12, x - 20, y + 2); c.closePath(); }); },
  gat(c) { const x = HC[0], y = HC[1]; P(c, 'rgba(20,20,26,.92)', c => E(c, x, y - 17, 33, 6)); P(c, '#15151b', c => { c.moveTo(x - 10, y - 19); c.lineTo(x - 9, y - 38); c.quadraticCurveTo(x, y - 41, x + 9, y - 38); c.lineTo(x + 10, y - 19); c.closePath(); }); F(c, '#3a3a46', c => c.rect(x - 10, y - 23, 20, 3)); L(c, '#2a2420', 1.4, c => { c.moveTo(x - 15, y - 13); c.quadraticCurveTo(x - 17, y + 10, x - 9, y + 22); c.moveTo(x + 17, y - 13); c.quadraticCurveTo(x + 19, y + 10, x + 11, y + 22); }); },
  jeongja(c) { const x = HC[0], y = HC[1]; P(c, '#18181c', c => { c.moveTo(x - 16, y - 12); c.lineTo(x - 15, y - 28); c.lineTo(x + 15, y - 28); c.lineTo(x + 16, y - 12); c.quadraticCurveTo(x, y - 16, x - 16, y - 12); c.closePath(); }); P(c, '#18181c', c => { c.moveTo(x - 12, y - 28); c.lineTo(x - 6, y - 40); c.lineTo(x, y - 29); c.lineTo(x + 6, y - 40); c.lineTo(x + 12, y - 28); c.closePath(); }); L(c, '#55555f', 1.2, c => { c.moveTo(x - 15, y - 21); c.lineTo(x + 15, y - 21); }); },
  bald() {},
  jokduri(c) { const x = HC[0], y = HC[1]; P(c, '#17131a', c => { c.moveTo(x - 19, y + 4); c.bezierCurveTo(x - 23, y - 22, x - 8, y - 25, x, y - 25); c.bezierCurveTo(x + 8, y - 25, x + 23, y - 22, x + 19, y + 4); c.bezierCurveTo(x + 15, y - 10, x + 8, y - 14, x, y - 14); c.bezierCurveTo(x - 8, y - 14, x - 15, y - 10, x - 19, y + 4); }); P(c, '#1e1a26', c => { c.moveTo(x - 9, y - 23); c.lineTo(x + 9, y - 23); c.lineTo(x + 7, y - 33); c.lineTo(x - 7, y - 33); c.closePath(); }); F(c, '#e8c45a', c => { Cc(c, x, y - 36, 2.6); Cc(c, x - 7, y - 28, 1.8); Cc(c, x + 7, y - 28, 1.8); }); F(c, '#d4473b', c => Cc(c, x, y - 28, 1.8)); },
  beonggeoji(c) { const x = HC[0], y = HC[1]; P(c, '#16161a', c => E(c, x, y - 16, 28, 6)); P(c, '#16161a', c => { c.moveTo(x - 14, y - 17); c.arc(x, y - 17, 14, PI, 0); c.closePath(); }); P(c, '#d43a2a', c => Cc(c, x, y - 34, 4.6), 1.6); P(c, '#d43a2a', c => { c.moveTo(x + 2, y - 37); c.quadraticCurveTo(x + 14, y - 44, x + 18, y - 34); c.quadraticCurveTo(x + 10, y - 38, x + 3, y - 33); }, 1.4); },
  lock(c) { const x = HC[0], y = HC[1]; P(c, '#140c08', c => Cc(c, x, y - 21, 5)); P(c, '#140c08', c => { c.moveTo(x - 1, y - 20); c.quadraticCurveTo(x + 12, y - 30, x + 10, y - 10); c.quadraticCurveTo(x + 7, y - 20, x - 1, y - 16); }, 1.6); },
  bear(c) { const x = HC[0], y = HC[1]; P(c, '#4a3424', c => { c.moveTo(x - 24, y + 8); c.quadraticCurveTo(x - 28, y - 28, x, y - 29); c.quadraticCurveTo(x + 28, y - 28, x + 24, y + 8); c.quadraticCurveTo(x + 21, y - 16, x, y - 19); c.quadraticCurveTo(x - 21, y - 16, x - 24, y + 8); c.closePath(); }); P(c, '#4a3424', c => { Cc(c, x - 17, y - 24, 6); Cc(c, x + 18, y - 24, 6); }); F(c, '#2a1d14', c => { Cc(c, x - 17, y - 24, 3); Cc(c, x + 18, y - 24, 3); }); },
  samo(c) { const x = HC[0], y = HC[1]; P(c, '#141418', c => { c.moveTo(x - 15, y - 13); c.lineTo(x - 14, y - 32); c.quadraticCurveTo(x, y - 36, x + 14, y - 32); c.lineTo(x + 15, y - 13); c.quadraticCurveTo(x, y - 17, x - 15, y - 13); c.closePath(); }); P(c, '#141418', c => { RR(c, x - 34, y - 28, 20, 5, 2); RR(c, x + 14, y - 28, 20, 5, 2); }, 1.6); flower(c, x - 8, y - 35, 6, '#e2558a'); flower(c, x + 7, y - 37, 6.5, '#f0a27a'); flower(c, x, y - 42, 5, '#e2558a'); },
  sangmoBupo(c) { const x = HC[0], y = HC[1]; P(c, '#18171d', c => E(c, x, y - 15, 25, 5)); P(c, '#18171d', c => { c.moveTo(x - 13, y - 16); c.arc(x, y - 16, 13, PI, 0); c.closePath(); }); L(c, '#2a2420', 2, c => { c.moveTo(x, y - 29); c.lineTo(x + 2, y - 40); }); P(c, '#fbf8f0', c => { for (let k = 0; k < 7; k++) { const a = -PI / 2 + (k - 3) * 0.42; E(c, x + 2 + Math.cos(a) * 8, y - 46 + Math.sin(a) * 8, 7, 4, a); } }, 1.2); F(c, '#fbf8f0', c => Cc(c, x + 2, y - 46, 7)); },
  sangmoHat(c) { const x = HC[0], y = HC[1]; P(c, '#18171d', c => E(c, x, y - 15, 25, 5)); P(c, '#18171d', c => { c.moveTo(x - 13, y - 16); c.arc(x, y - 16, 13, PI, 0); c.closePath(); }); P(c, '#e8c45a', c => Cc(c, x, y - 30, 3.4), 1.4); },
  jeollip(c) { const x = HC[0], y = HC[1]; P(c, '#18171d', c => E(c, x, y - 15, 30, 6)); P(c, '#18171d', c => { c.moveTo(x - 13, y - 17); c.quadraticCurveTo(x - 12, y - 33, x, y - 34); c.quadraticCurveTo(x + 12, y - 33, x + 13, y - 17); c.closePath(); }); P(c, '#d43a2a', c => { c.moveTo(x, y - 34); c.quadraticCurveTo(x - 9, y - 30, x - 12, y - 18); c.quadraticCurveTo(x - 4, y - 26, x + 2, y - 33); }, 1.2); F(c, '#e8c45a', c => Cc(c, x, y - 35, 2.6)); L(c, '#3a7a9a', 2.4, c => { c.moveTo(x + 4, y - 32); c.quadraticCurveTo(x + 16, y - 46, x + 26, y - 42); }); },
  hwagwan(c) { const x = HC[0], y = HC[1]; P(c, '#17131a', c => { c.moveTo(x - 20, y + 6); c.bezierCurveTo(x - 24, y - 22, x - 8, y - 24, x, y - 24); c.bezierCurveTo(x + 8, y - 24, x + 24, y - 22, x + 20, y + 6); c.bezierCurveTo(x + 15, y - 10, x + 8, y - 13, x, y - 13); c.bezierCurveTo(x - 8, y - 13, x - 15, y - 10, x - 20, y + 6); }); P(c, '#e6b84a', c => { c.moveTo(x - 16, y - 18); c.lineTo(x - 12, y - 34); c.lineTo(x - 5, y - 26); c.lineTo(x, y - 38); c.lineTo(x + 5, y - 26); c.lineTo(x + 12, y - 34); c.lineTo(x + 16, y - 18); c.quadraticCurveTo(x, y - 22, x - 16, y - 18); c.closePath(); }, 1.8); F(c, '#d4473b', c => { Cc(c, x, y - 30, 2.6); Cc(c, x - 10, y - 24, 2); Cc(c, x + 10, y - 24, 2); }); flower(c, x - 18, y - 16, 5, '#f07aa0'); flower(c, x + 19, y - 16, 5, '#f07aa0'); },
  goldband(c) { const x = HC[0], y = HC[1]; P(c, '#1b1512', c => { c.moveTo(x - 20, y + 2); c.quadraticCurveTo(x - 22, y - 22, x, y - 23); c.quadraticCurveTo(x + 22, y - 22, x + 20, y + 2); c.quadraticCurveTo(x + 13, y - 12, x, y - 12); c.quadraticCurveTo(x - 13, y - 12, x - 20, y + 2); c.closePath(); }); P(c, '#1b1512', c => Cc(c, x - 1, y - 27, 6)); P(c, '#e6b84a', c => { c.moveTo(x - 19, y - 9); c.quadraticCurveTo(x, y - 18, x + 19, y - 9); c.lineTo(x + 19, y - 6); c.quadraticCurveTo(x, y - 15, x - 19, y - 6); c.closePath(); }, 1.4); F(c, '#4fb3c8', c => Cc(c, x + 1, y - 14.5, 2.2)); },
  flowerHat(c) { HAT.paeraengi(c); const x = HC[0], y = HC[1]; flower(c, x - 10, y - 26, 6.5, '#e2558a'); flower(c, x + 2, y - 32, 6.5, '#f2c94a'); flower(c, x + 12, y - 25, 6, '#5a8ae0'); },
};
function gokkal(c, cols) {
  const x = HC[0], y = HC[1];
  P(c, '#f8f4ea', c => { c.moveTo(x - 22, y - 2); c.quadraticCurveTo(x - 11, y - 33, x + 2, y - 47); c.quadraticCurveTo(x + 13, y - 32, x + 23, y - 2); c.quadraticCurveTo(x, y - 9, x - 22, y - 2); c.closePath(); });
  L(c, 'rgba(0,0,0,.1)', 1.3, c => { c.moveTo(x - 4, y - 8); c.lineTo(x + 1, y - 44); c.moveTo(x + 8, y - 7); c.lineTo(x + 3, y - 43); });
  flower(c, x - 9, y - 13, 7.5, cols[0]); flower(c, x + 10, y - 16, 8, cols[1]); flower(c, x + 1, y - 29, 6.5, cols[2]);
  L(c, '#d14a3a', 1.8, c => { c.moveTo(x - 18, y + 4); c.quadraticCurveTo(x, y + 25, x + 19, y + 4); });
}

/* ---------- bodies (feet at 0,0) ---------- */
function feet(c, col = '#1f1a17', sp = 7) { P(c, col, c => { E(c, -sp, -1.5, 6.6, 3.2); E(c, sp + 1, -1.5, 6.6, 3.2); }, 2); }
function robe(c, o) {
  const t = o.top || 12, b = o.bot || 21, y0 = -44;
  feet(c, o.shoe);
  const outline = c => { c.moveTo(-t, y0); c.bezierCurveTo(-t - 3, y0 + 18, -b, -10, -b, -2); c.quadraticCurveTo(0, 3, b, -2); c.bezierCurveTo(b, -10, t + 3, y0 + 18, t, y0); c.quadraticCurveTo(0, y0 - 4, -t, y0); c.closePath(); };
  P(c, o.color, outline);
  F(c, 'rgba(0,0,0,.13)', c => { c.moveTo(-t, y0); c.bezierCurveTo(-t - 3, y0 + 18, -b, -10, -b, -2); c.quadraticCurveTo(-b + 6, 0, -b + 9, -1); c.bezierCurveTo(-b + 8, -12, -t + 1, y0 + 16, -t + 5, y0 - 1); c.closePath(); });
  if (o.hem) L(c, o.hem, 3, c => { c.moveTo(-b + 2, -3.5); c.quadraticCurveTo(0, 1, b - 2, -3.5); });
  if (o.collar !== false) P(c, o.collar || '#f4efe3', c => { c.moveTo(-5, y0 - 1); c.lineTo(3, y0 + 12); c.lineTo(9, y0 - 1); c.closePath(); }, 2);
  if (o.sash) { for (let k = 0; k < o.sash.length; k++) L(c, o.sash[k], 2.8, c => { c.moveTo(-11 + k * 2.6, -44); c.lineTo(10 + k * 2.6, -24); }); }
  if (o.belt) P(c, o.belt, c => RR(c, -t - 2.5, -27, 2 * t + 5, 5, 2.5), 2);
  if (o.tie) L(c, o.tie, 2.4, c => { c.moveTo(4, -25); c.quadraticCurveTo(7, -17, 5, -9); c.moveTo(4, -25); c.quadraticCurveTo(10, -18, 10, -11); });
  if (o.vest) P(c, o.vest, c => { c.moveTo(-12, -45); c.quadraticCurveTo(-15, -30, -13, -14); c.lineTo(-3, -14); c.lineTo(1, -40); c.lineTo(5, -14); c.lineTo(13, -14); c.quadraticCurveTo(15, -30, 12, -45); c.closePath(); }, 2);
}
function skirtBody(c, o) {
  P(c, '#1f1a17', c => { E(c, -6, -1, 6, 3); E(c, 8, -1, 6, 3); }, 2);
  P(c, o.skirt, c => { c.moveTo(-11, -33); c.bezierCurveTo(-18, -22, -25, -8, -24, -1); c.quadraticCurveTo(0, 4, 24, -1); c.bezierCurveTo(25, -8, 18, -22, 11, -33); c.closePath(); });
  L(c, 'rgba(0,0,0,.16)', 1.6, c => { c.moveTo(-6, -29); c.quadraticCurveTo(-11, -14, -13, -1); c.moveTo(3, -30); c.quadraticCurveTo(4, -14, 5, 0); c.moveTo(10, -29); c.quadraticCurveTo(15, -14, 17, -1); });
  if (o.skirtBand) L(c, o.skirtBand, 3.2, c => { c.moveTo(-22, -5); c.quadraticCurveTo(0, 0, 22, -5); });
  P(c, o.jacket, c => { c.moveTo(-12, -45); c.quadraticCurveTo(-14, -37, -13, -30); c.quadraticCurveTo(0, -27, 13, -30); c.quadraticCurveTo(14, -37, 12, -45); c.quadraticCurveTo(0, -49, -12, -45); c.closePath(); });
  P(c, '#f6f1e6', c => { c.moveTo(-4, -46); c.lineTo(3, -36); c.lineTo(8, -46); c.closePath(); }, 1.6);
  if (o.goreum) P(c, o.goreum, c => { c.moveTo(4, -35); c.quadraticCurveTo(1, -24, -1, -16); c.lineTo(3, -16); c.quadraticCurveTo(5, -25, 6, -34); c.moveTo(5, -35); c.quadraticCurveTo(10, -26, 10, -19); c.lineTo(13, -20); c.quadraticCurveTo(12, -27, 7, -35); }, 1.4);
}
function bajiBody(c, o) {
  P(c, '#2a2420', c => { E(c, -7, -1.5, 6.4, 3.1); E(c, 8, -1.5, 6.4, 3.1); }, 2);
  P(c, '#f4f0e6', c => { c.moveTo(-12, -25); c.quadraticCurveTo(-18, -13, -12, -4); c.lineTo(-2, -4); c.lineTo(0, -15); c.lineTo(2, -4); c.lineTo(13, -4); c.quadraticCurveTo(18, -13, 12, -25); c.closePath(); });
  L(c, o.tie || '#3a5fae', 2.6, c => { c.moveTo(-12, -6); c.lineTo(-2, -6); c.moveTo(2, -6); c.lineTo(13, -6); });
  P(c, '#f8f4ec', c => { c.moveTo(-12, -45); c.quadraticCurveTo(-15, -33, -13, -22); c.quadraticCurveTo(0, -19, 13, -22); c.quadraticCurveTo(15, -33, 12, -45); c.quadraticCurveTo(0, -49, -12, -45); c.closePath(); });
  if (o.vest) P(c, o.vest, c => { c.moveTo(-12, -45); c.quadraticCurveTo(-15, -33, -13, -22); c.lineTo(-3, -21); c.lineTo(0, -40); c.lineTo(4, -21); c.lineTo(13, -22); c.quadraticCurveTo(15, -33, 12, -45); c.closePath(); }, 2);
  const cols = ['#d63b2e', '#f0c43a', '#2f5fb8'];
  cols.forEach((col, k) => L(c, col, 2.9, c => { c.moveTo(-11 + k * 2.7, -45); c.lineTo(11 + k * 2.7, -22); }));
  P(c, o.waist || '#d63b2e', c => RR(c, -14, -25, 28, 5, 2.5), 1.8);
  P(c, o.waist || '#d63b2e', c => { c.moveTo(-12, -21); c.lineTo(-16, -9); c.lineTo(-11, -9); c.lineTo(-9, -20); c.closePath(); }, 1.6);
}
function monkBody(c) {
  robe(c, { color: '#7f7c76', collar: '#f4efe3', top: 12, bot: 21, hem: '#5f5c56' });
  P(c, '#a83a2c', c => { c.moveTo(-13, -42); c.lineTo(-8, -45); c.lineTo(15, -12); c.lineTo(9, -10); c.closePath(); }, 2);
  L(c, '#e8c45a', 1.3, c => { c.moveTo(-10, -43); c.lineTo(12, -11); });
}

/* ---------- arms (pivot at shoulder, hanging down) ---------- */
function arm(c, o) {
  const len = o.len || 18;
  P(c, o.color, c => { c.moveTo(-5.8, -3); c.quadraticCurveTo(-7.8, len * 0.55, -6, len); c.lineTo(6.6, len); c.quadraticCurveTo(7.8, len * 0.45, 6, -3); c.closePath(); }, 2.4);
  if (o.stripes) o.stripes.forEach((col, k) => F(c, col, c => c.rect(-6.4, 2 + k * 3.2, 12.8, 2.4)));
  if (o.cuff) L(c, o.cuff, 3, c => { c.moveTo(-6, len - 1); c.lineTo(6.6, len - 1); });
  if (o.hansam) P(c, HAN, c => { c.moveTo(-6, len - 1); c.quadraticCurveTo(-10, len + 12, -6, len + 24); c.quadraticCurveTo(0, len + 28, 7, len + 24); c.quadraticCurveTo(9.5, len + 11, 6.6, len - 1); c.closePath(); }, 2);
  else if (!o.noHand) P(c, o.skin || SKIN, c => Cc(c, 0.4, len + 3.4, 4.3), 2);
  if (o.prop) o.prop(c, len + 3.4);
}
const PROP = {
  stone(c, h) { P(c, '#8d8a84', c => E(c, 1, h + 2, 4.2, 3.6), 1.8); },
  cane(c, h) { L(c, OL, 4.4, c => { c.moveTo(1, h - 6); c.lineTo(2, h + 24); }); L(c, '#8a6440', 2.6, c => { c.moveTo(1, h - 6); c.lineTo(2, h + 24); }); },
  stick(c, h) { L(c, OL, 3.6, c => { c.moveTo(0, h); c.lineTo(3, h + 15); }); L(c, '#b78a52', 2, c => { c.moveTo(0, h); c.lineTo(3, h + 15); }); P(c, '#b78a52', c => Cc(c, 3, h + 15, 1.8), 1.2); },
  mallet(c, h) { L(c, OL, 4.4, c => { c.moveTo(0, h); c.lineTo(2, h + 17); }); L(c, '#9a6a3a', 2.8, c => { c.moveTo(0, h); c.lineTo(2, h + 17); }); },
  padMallet(c, h) { L(c, OL, 3.8, c => { c.moveTo(0, h); c.lineTo(2, h + 15); }); L(c, '#9a6a3a', 2.2, c => { c.moveTo(0, h); c.lineTo(2, h + 15); }); P(c, '#e9dfc9', c => Cc(c, 2.2, h + 17, 4.4), 1.8); },
  gungchae(c, h) { L(c, OL, 3.4, c => { c.moveTo(0, h); c.lineTo(2, h + 14); }); L(c, '#9a6a3a', 2, c => { c.moveTo(0, h); c.lineTo(2, h + 14); }); P(c, '#efe6d2', c => Cc(c, 2.2, h + 15.5, 3.4), 1.6); },
  fan(c, h) { P(c, '#f3e6c4', c => { c.moveTo(1, h); c.arc(1, h, 14, PI * 0.15, PI * 0.85); c.closePath(); }, 1.8); L(c, 'rgba(120,90,40,.5)', 1, c => { for (let k = 1; k < 6; k++) { const a = PI * 0.15 + k * PI * 0.7 / 6; c.moveTo(1, h); c.lineTo(1 + Math.cos(a) * 14, h + Math.sin(a) * 14); } }); },
  brush(c, h) { L(c, OL, 3.4, c => { c.moveTo(-1, h - 3); c.lineTo(2, h + 13); }); L(c, '#c49a5a', 2, c => { c.moveTo(-1, h - 3); c.lineTo(2, h + 13); }); P(c, '#1a1a1a', c => E(c, 2.4, h + 15, 1.8, 3.2), 1); },
  book(c, h) { P(c, '#2a3a5a', c => RR(c, -7, h - 2, 14, 17, 1.5), 1.8); F(c, '#efe6cf', c => c.rect(-5.5, h, 11, 13)); L(c, '#c4b896', 0.8, c => { for (let k = 0; k < 4; k++) { c.moveTo(-4, h + 3 + k * 3); c.lineTo(4, h + 3 + k * 3); } }); },
  beads(c, h) { for (let k = 0; k < 9; k++) { const a = PI * 0.2 + k * PI * 1.6 / 8; P(c, '#5a3418', c => Cc(c, 1 + Math.cos(a) * 6, h + 9 + Math.sin(a) * 7, 1.9), 0.9); } P(c, '#a83a2c', c => E(c, 1, h + 18, 1.8, 3.2), 0.9); },
  whip(c, h) { L(c, OL, 4, c => { c.moveTo(0, h - 2); c.lineTo(2, h + 11); }); L(c, '#6b4428', 2.4, c => { c.moveTo(0, h - 2); c.lineTo(2, h + 11); }); L(c, '#2a1a10', 1.6, c => { c.moveTo(2, h + 11); c.bezierCurveTo(10, h + 18, -2, h + 24, 8, h + 32); }); },
  gourd(c, h) { P(c, '#d9b25a', c => { E(c, 1, h + 9, 5.6, 6.4); }, 1.8); P(c, '#d9b25a', c => Cc(c, 1, h + 1, 3.8), 1.8); L(c, '#a33', 1.6, c => { c.moveTo(-2, h + 4); c.lineTo(4, h + 4); }); },
  spear(c, h) { const dx = 0.565, dy = -0.825; L(c, OL, 4, c => { c.moveTo(-dx * 22, h - dy * 22); c.lineTo(dx * 46, h + dy * 46); }); L(c, '#6b4a2e', 2.4, c => { c.moveTo(-dx * 22, h - dy * 22); c.lineTo(dx * 46, h + dy * 46); }); P(c, '#dfe3ea', c => { const x = dx * 46, y = h + dy * 46; c.moveTo(x + dx * 12, y + dy * 12); c.lineTo(x - dy * 3.5, y + dx * 3.5); c.lineTo(x + dy * 3.5, y - dx * 3.5); c.closePath(); }, 1.6); F(c, '#d43a2a', c => Cc(c, dx * 40, h + dy * 40, 2.6)); },
  shield(c, h) { P(c, '#9c2a20', c => Cc(c, 2, h + 4, 11), 2); L(c, '#e6b24a', 2, c => Cc(c, 2, h + 4, 8)); P(c, '#e6b24a', c => Cc(c, 2, h + 4, 3), 1.2); },
  bells(c, h) { L(c, OL, 3, c => { c.moveTo(0, h); c.lineTo(1, h + 10); }); for (const [x, y] of [[-3, 12], [4, 13], [0, 17], [-5, 17], [5, 18]]) P(c, '#e6b84a', c => Cc(c, x, h + y, 2.6), 1.2); },
  obangFan(c, h) { const cols = ['#2f5fb8', '#d63b2e', '#f0c43a', '#f4f0e6', '#2a2420']; for (let k = 0; k < 5; k++) { const a0 = PI * 0.15 + k * PI * 0.14, a1 = a0 + PI * 0.14; P(c, cols[k], c => { c.moveTo(1, h); c.arc(1, h, 15, a0, a1); c.closePath(); }, 1.2); } },
  sogo(c, h) { P(c, '#c23a2c', c => Cc(c, 1, h + 6, 8), 1.8); P(c, '#f4eedc', c => Cc(c, 1, h + 6, 5.6), 1.2); L(c, OL, 2.6, c => { c.moveTo(1, h + 13); c.lineTo(1, h + 20); }); },
  plate(c, h) { const dx = 0.47, dy = -0.88; L(c, OL, 3.4, c => { c.moveTo(0, h); c.lineTo(dx * 34, h + dy * 34); }); L(c, '#b78a52', 1.8, c => { c.moveTo(0, h); c.lineTo(dx * 34, h + dy * 34); }); at(c, dx * 36, h + dy * 36, 1, c => { P(c, '#f4f0e6', c => E(c, 0, 0, 11, 4), 1.6); L(c, '#d63b2e', 1.6, c => E(c, 0, 0, 7, 2.4)); }, 0.5); },
  claw(c, h) { P(c, '#33584a', c => Cc(c, 0.4, h, 5.4), 2); for (let k = -1; k <= 1; k++) P(c, '#f2ecd8', c => { c.moveTo(k * 3.2 - 1.2, h + 3); c.lineTo(k * 3.6, h + 9); c.lineTo(k * 3.2 + 1.2, h + 3); }, 1); },
};

/* ---------- instruments carried on the body ---------- */
function gong(c, x, y, r) {
  const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
  g.addColorStop(0, '#fff1b0'); g.addColorStop(0.5, '#e2b440'); g.addColorStop(1, '#a8761c');
  P(c, g, c => Cc(c, x, y, r), 2.2);
  L(c, 'rgba(90,60,10,.55)', 1.4, c => Cc(c, x, y, r * 0.72));
  F(c, 'rgba(255,255,255,.5)', c => E(c, x - r * 0.35, y - r * 0.4, r * 0.3, r * 0.16, -0.6));
}
const INST = {
  kkwaeng(c) { gong(c, 13, -52, 8); L(c, '#d63b2e', 1.8, c => { c.moveTo(13, -60); c.quadraticCurveTo(9, -66, 5, -62); }); },
  buk(c) {
    P(c, '#9a4a2a', c => { RR(c, 2, -42, 20, 22, 4); }, 2.2);
    L(c, '#e8c45a', 1.6, c => { for (let k = 0; k < 4; k++) { c.moveTo(4 + k * 5, -42); c.lineTo(4 + k * 5, -20); } });
    P(c, '#efe4cc', c => E(c, 22, -31, 4.5, 11), 2);
    P(c, '#2f5fb8', c => { c.moveTo(10, -42); c.quadraticCurveTo(5, -54, 0, -44); }, 0);
    L(c, '#2f5fb8', 2, c => { c.moveTo(6, -42); c.quadraticCurveTo(0, -52, -6, -44); });
  },
  janggu(c) {
    P(c, '#efe4cc', c => E(c, -13, -24, 4.6, 10), 2);
    P(c, '#c23a2c', c => { c.moveTo(-12, -32); c.quadraticCurveTo(2, -27, 16, -32); c.lineTo(16, -16); c.quadraticCurveTo(2, -21, -12, -16); c.closePath(); }, 2);
    L(c, '#f0c43a', 1.4, c => { for (let k = 0; k < 6; k++) { c.moveTo(-10 + k * 4.6, -31); c.lineTo(-8 + k * 4.6, -17); } });
    P(c, '#2f5fb8', c => E(c, 2, -24, 3.6, 6.4), 1.6);
    P(c, '#efe4cc', c => E(c, 18, -24, 5, 11), 2);
  },
  jing(c) { L(c, '#d63b2e', 2, c => { c.moveTo(14, -54); c.lineTo(12, -48); }); gong(c, 15, -36, 13.5); },
};

/* ---------- puppet definitions ---------- */
const STD = { neck: [0, -44], shF: [7, -41], shB: [-8, -42], order: ['armB', 'body', 'head', 'armF'] };
function H(o) { return Object.assign({}, STD, o); }
const PUP = {
  choraengi: H({ size: 0.9,
    body: c => robe(c, { color: '#33508f', hem: '#e9e2d0', belt: '#e9e2d0', top: 11, bot: 19 }),
    head: c => { maskOn(c, 'choraengi'); HAT.paeraengi(c); },
    armB: c => arm(c, { color: '#33508f', hansam: true }), armF: c => arm(c, { color: '#33508f', prop: PROP.stone }),
    idle: { tempo: 2.4, bob: 6, sway: 0.08, aF: [0.9, 0.8], aB: [1.0, 0.8] }, atk: 'throw' }),
  imae: H({ size: 0.98,
    body: c => robe(c, { color: '#c9bea6', hem: '#7a6a55', belt: '#7a6a55', top: 12, bot: 20 }),
    head: c => { HAT.sangtu(c); maskOn(c, 'imae'); },
    armB: c => arm(c, { color: '#c9bea6', hansam: true }), armF: c => arm(c, { color: '#c9bea6', hansam: true }),
    idle: { tempo: 1.0, bob: 2, sway: 0.12, aF: [0.15, 0.25], aB: [0.15, 0.25], head: 0.12 }, atk: 'push' }),
  halmi: H({ size: 0.92,
    body: c => robe(c, { color: '#6b5b4c', hem: '#d9cfbb', top: 12, bot: 20, collar: '#d9cfbb' }),
    head: c => { maskOn(c, 'halmi'); HAT.scarf(c); },
    armB: c => arm(c, { color: '#6b5b4c', hansam: true }), armF: c => arm(c, { color: '#6b5b4c', prop: PROP.cane }),
    idle: { tempo: 0.9, bob: 1.5, sway: 0.04, lean: 0.16, aF: [0.25, 0.08], aB: [0.6, 0.4] }, atk: 'swing' }),
  kkwaenggwari: H({ size: 0.95, order: ['armB', 'body', 'inst', 'head', 'armF'],
    body: c => bajiBody(c, { waist: '#d63b2e', tie: '#2f5fb8' }),
    head: c => { face(c); HAT.sangmoBupo(c); }, inst: INST.kkwaeng,
    armB: c => arm(c, { color: '#f8f4ec', cuff: '#d63b2e' }), armF: c => arm(c, { color: '#f8f4ec', cuff: '#d63b2e', prop: PROP.stick }),
    idle: { tempo: 2.0, bob: 4.5, sway: 0.05, aF: [1.5, 0.35], aB: [2.1, 0.1] }, atk: 'strike' }),
  buk: H({ size: 0.97, order: ['armB', 'body', 'inst', 'head', 'armF'],
    body: c => bajiBody(c, { waist: '#2f5fb8', tie: '#d63b2e' }),
    head: c => { face(c); gokkal(c, ['#d63b2e', '#f0c43a', '#2f5fb8']); }, inst: INST.buk,
    armB: c => arm(c, { color: '#f8f4ec', cuff: '#2f5fb8' }), armF: c => arm(c, { color: '#f8f4ec', cuff: '#2f5fb8', prop: PROP.mallet }),
    idle: { tempo: 1.6, bob: 4, sway: 0.06, aF: [1.2, 0.5], aB: [1.3, 0.1] }, atk: 'bigstrike' }),
  sotdae: { size: 1.15, order: ['whole', 'bird'], static: true,
    whole: c => {
      P(c, '#8a8378', c => { E(c, -6, -2, 9, 4); E(c, 7, -2, 8, 3.6); }, 2);
      P(c, '#8a6440', c => { c.moveTo(-3, -1); c.lineTo(-2.4, -98); c.lineTo(2.4, -98); c.lineTo(3, -1); c.closePath(); }, 2.2);
      L(c, 'rgba(60,40,20,.4)', 1.2, c => { c.moveTo(0, -10); c.lineTo(0.4, -90); });
      P(c, '#d63b2e', c => RR(c, -4, -60, 8, 3, 1), 1.2); P(c, '#2f5fb8', c => RR(c, -4, -56, 8, 3, 1), 1.2);
    },
    bird: c => {
      P(c, '#b4895a', c => { c.moveTo(-14, -100); c.quadraticCurveTo(-6, -110, 6, -106); c.quadraticCurveTo(14, -112, 17, -108); c.lineTo(22, -106); c.lineTo(16, -104); c.quadraticCurveTo(10, -97, -2, -97); c.quadraticCurveTo(-10, -96, -14, -100); c.closePath(); }, 2);
      F(c, OL, c => Cc(c, 14, -108, 1.4));
      P(c, '#a07848', c => { c.moveTo(-4, -103); c.quadraticCurveTo(0, -112, 6, -104); c.closePath(); }, 1.4);
    },
    pivots: { bird: [0, -100] }, idle: { tempo: 0.8 }, atk: 'peck' },
  bune: H({ size: 0.95, order: ['back', 'armB', 'body', 'head', 'armF'],
    back: c => HAT.buneBack(c),
    body: c => skirtBody(c, { skirt: '#d43a3f', jacket: '#f0c84a', goreum: '#d43a3f', skirtBand: '#3f6fb8' }),
    head: c => { maskOn(c, 'bune'); HAT.buneHair(c); },
    armB: c => arm(c, { color: '#f0c84a', cuff: '#3f6fb8', hansam: true }), armF: c => arm(c, { color: '#f0c84a', cuff: '#3f6fb8', hansam: true }),
    idle: { tempo: 1.1, bob: 2, sway: 0.08, aF: [1.1, 0.6], aB: [0.5, 0.4], head: -0.05 }, atk: 'spin' }),
  baekjeong: H({ size: 1.04,
    body: c => robe(c, { color: '#7a5530', hem: '#e9e2d0', belt: '#3a2a1a', top: 14, bot: 23 }),
    head: c => { maskOn(c, 'baekjeong'); HAT.headband(c); },
    armB: c => arm(c, { color: '#7a5530', hansam: true }), armF: c => arm(c, { color: '#7a5530', prop: (c, h) => { P(c, '#d9dde4', c => { c.moveTo(-1, h + 2); c.lineTo(13, h + 2); c.lineTo(13, h + 12); c.lineTo(3, h + 12); c.closePath(); }, 1.8); L(c, OL, 3.6, c => { c.moveTo(-1, h + 2); c.lineTo(-1, h - 5); }); } }),
    idle: { tempo: 1.2, bob: 3, sway: 0.05, aF: [0.5, 0.4], aB: [0.6, 0.4] }, atk: 'throw' }),
  janggu: H({ size: 0.97, order: ['armB', 'body', 'inst', 'head', 'armF'], shB: [-6, -41],
    body: c => bajiBody(c, { waist: '#f0c43a', tie: '#d63b2e' }),
    head: c => { face(c); gokkal(c, ['#2f5fb8', '#d63b2e', '#f0c43a']); }, inst: INST.janggu,
    armB: c => arm(c, { color: '#f8f4ec', cuff: '#f0c43a', prop: PROP.gungchae }), armF: c => arm(c, { color: '#f8f4ec', cuff: '#f0c43a', prop: PROP.stick }),
    idle: { tempo: 1.8, bob: 4, sway: 0.05, aF: [0.8, 0.3], aB: [0.9, 0.3] }, atk: 'strike2' }),
  jing: H({ size: 0.98, order: ['armB', 'body', 'inst', 'head', 'armF'],
    body: c => bajiBody(c, { waist: '#2f9a5a', tie: '#2f5fb8' }),
    head: c => { face(c); gokkal(c, ['#f0c43a', '#2f9a5a', '#d63b2e']); }, inst: INST.jing,
    armB: c => arm(c, { color: '#f8f4ec', cuff: '#2f9a5a' }), armF: c => arm(c, { color: '#f8f4ec', cuff: '#2f9a5a', prop: PROP.padMallet }),
    idle: { tempo: 1.1, bob: 2.5, sway: 0.05, aF: [0.8, 0.35], aB: [1.5, 0.05] }, atk: 'bigstrike' }),
  jangseung: { size: 1.1, order: ['whole'], static: true,
    whole: c => {
      P(c, '#8a8378', c => E(c, 0, -2, 14, 4.5), 2);
      P(c, '#9a7a52', c => { c.moveTo(-12, -2); c.lineTo(-11, -78); c.quadraticCurveTo(0, -84, 11, -78); c.lineTo(12, -2); c.closePath(); }, 2.4);
      L(c, 'rgba(60,40,20,.35)', 1.2, c => { c.moveTo(-6, -8); c.lineTo(-5, -70); c.moveTo(6, -6); c.lineTo(5, -60); });
      P(c, '#18181c', c => { c.moveTo(-13, -76); c.lineTo(-10, -96); c.quadraticCurveTo(0, -100, 10, -96); c.lineTo(13, -76); c.quadraticCurveTo(0, -80, -13, -76); c.closePath(); }, 2);
      L(c, OL, 3.4, c => { c.moveTo(-10, -70); c.quadraticCurveTo(-5, -75, -1, -70); c.moveTo(10, -70); c.quadraticCurveTo(5, -75, 1, -70); });
      P(c, '#f2ead8', c => { Cc(c, -5.5, -64, 4.6); Cc(c, 5.5, -64, 4.6); }, 1.8);
      F(c, OL, c => { Cc(c, -5.5, -63.4, 2.4); Cc(c, 5.5, -63.4, 2.4); });
      P(c, '#7a5a3c', c => E(c, 0, -55, 4, 5.5), 1.6);
      P(c, OL, c => { c.moveTo(-8, -47); c.quadraticCurveTo(0, -40, 8, -47); c.quadraticCurveTo(0, -44, -8, -47); }, 0);
      F(c, '#f2ead8', c => { c.moveTo(-6, -46.5); c.lineTo(-4.5, -42); c.lineTo(-3, -46); c.moveTo(3, -46); c.lineTo(4.5, -42); c.lineTo(6, -46.5); });
      F(c, '#16120e', c => { for (let k = 0; k < 4; k++) c.rect(-1.6, -36 + k * 7, 3.2, 4.6); });
    },
    idle: { tempo: 0.6 }, atk: 'pulse' },
  yangban: H({ size: 1.05,
    body: c => robe(c, { color: '#efe9da', hem: '#4a74c9', belt: '#4a74c9', tie: '#4a74c9', top: 12, bot: 22, collar: '#4a74c9' }),
    head: c => { maskOn(c, 'yangban'); HAT.gat(c); },
    armB: c => arm(c, { color: '#efe9da', hansam: true }), armF: c => arm(c, { color: '#efe9da', cuff: '#4a74c9', prop: PROP.fan }),
    idle: { tempo: 0.8, bob: 1.5, sway: 0.04, lean: -0.06, aF: [1.6, 0.35], aB: [0.35, 0.2], head: -0.08 }, atk: 'flick' }),
  seonbi: H({ size: 1.02,
    body: c => robe(c, { color: '#a9bccf', hem: '#2a3550', belt: '#2a3550', top: 11, bot: 20, collar: '#2a3550' }),
    head: c => { maskOn(c, 'seonbi'); HAT.jeongja(c); },
    armB: c => arm(c, { color: '#a9bccf', cuff: '#2a3550', prop: PROP.book }), armF: c => arm(c, { color: '#a9bccf', cuff: '#2a3550', prop: PROP.brush }),
    idle: { tempo: 0.7, bob: 1, sway: 0.03, aF: [0.5, 0.2], aB: [1.5, 0.08], head: 0.16 }, atk: 'flick' }),
  jung: H({ size: 1.0,
    body: c => monkBody(c),
    head: c => { maskOn(c, 'jung'); },
    armB: c => arm(c, { color: '#7f7c76' }), armF: c => arm(c, { color: '#7f7c76', prop: PROP.beads }),
    idle: { tempo: 0.9, bob: 1.5, sway: 0.05, aF: [0.6, 0.3], aB: [1.6, 0.05] }, atk: 'raise' }),
  gaksi: H({ size: 0.96, order: ['back', 'armB', 'body', 'head', 'armF'],
    back: c => HAT.buneBack(c),
    body: c => skirtBody(c, { skirt: '#d63b4a', jacket: '#2f7a52', goreum: '#d63b4a', skirtBand: '#e8c45a' }),
    head: c => { maskOn(c, 'gaksi'); HAT.jokduri(c); },
    armB: c => arm(c, { color: '#2f7a52', stripes: ['#d63b2e', '#f0c43a', '#2f5fb8', '#f4f0e6'], hansam: true }), armF: c => arm(c, { color: '#2f7a52', stripes: ['#d63b2e', '#f0c43a', '#2f5fb8', '#f4f0e6'], hansam: true }),
    idle: { tempo: 0.6, bob: 0.8, sway: 0.03, aF: [0.9, 0.12], aB: [0.9, 0.12], head: 0.14 }, atk: 'raise' }),
  malttugi: H({ size: 1.02,
    body: c => robe(c, { color: '#b0302a', hem: '#f0e6cf', belt: '#1d1d22', vest: '#2a2a33', top: 12, bot: 21 }),
    head: c => { maskOn(c, 'malttugi'); HAT.beonggeoji(c); },
    armB: c => arm(c, { color: '#b0302a', hansam: true }), armF: c => arm(c, { color: '#b0302a', prop: PROP.whip }),
    idle: { tempo: 1.9, bob: 5, sway: 0.1, aF: [1.4, 0.8], aB: [1.2, 0.8] }, atk: 'swing' }),
  sangmo: H({ size: 0.96, order: ['armB', 'body', 'head', 'armF'],
    body: c => bajiBody(c, { waist: '#7a3aa8', tie: '#d63b2e', vest: '#3a3a8a' }),
    head: c => { face(c); HAT.sangmoHat(c); },
    armB: c => arm(c, { color: '#f8f4ec', cuff: '#7a3aa8', prop: PROP.sogo }), armF: c => arm(c, { color: '#f8f4ec', cuff: '#7a3aa8', prop: PROP.stick }),
    idle: { tempo: 1.7, bob: 4, sway: 0.05, aF: [1.0, 0.5], aB: [1.2, 0.3] }, atk: 'spin', ribbon: true }),
  chwibari: H({ size: 1.0,
    body: c => robe(c, { color: '#2e5a57', hem: '#d43a2a', belt: '#d43a2a', top: 12, bot: 21 }),
    head: c => { maskOn(c, 'chwibari'); HAT.lock(c); },
    armB: c => arm(c, { color: '#2e5a57', hansam: true }), armF: c => arm(c, { color: '#2e5a57', prop: PROP.gourd }),
    idle: { tempo: 0.8, bob: 2, sway: 0.2, aF: [0.9, 0.5], aB: [1.1, 0.6] }, atk: 'drink' }),
  yeongno: H({ size: 1.06, order: ['armB', 'body', 'head', 'armF'],
    body: c => {
      P(c, '#1f3a33', c => { E(c, -8, -2, 7, 3.4); E(c, 9, -2, 7, 3.4); }, 2);
      P(c, '#2f5a4a', c => { c.moveTo(-14, -42); c.quadraticCurveTo(-19, -20, -13, -3); c.lineTo(14, -3); c.quadraticCurveTo(19, -20, 14, -42); c.quadraticCurveTo(0, -48, -14, -42); c.closePath(); });
      P(c, '#cfd8a0', c => E(c, 3, -22, 8, 14), 1.8);
      L(c, 'rgba(60,80,50,.5)', 1.2, c => { for (let k = 0; k < 4; k++) { c.moveTo(-3, -32 + k * 6); c.lineTo(9, -32 + k * 6); } });
      for (let k = 0; k < 5; k++) P(c, '#5f8a5a', c => { const y = -42 + k * 8; c.moveTo(-13, y); c.lineTo(-22, y + 3); c.lineTo(-14, y + 6); }, 1.4);
    },
    head: c => {
      const x = HC[0], y = HC[1];
      for (const s of [-1, 1]) P(c, '#c9c09a', c => { c.moveTo(x + s * 10, y - 16); c.lineTo(x + s * 18, y - 34); c.lineTo(x + s * 4, y - 20); c.closePath(); }, 1.8);
      P(c, '#2f5a4a', c => E(c, x, y, 21, 20));
      F(c, 'rgba(160,220,160,.15)', c => { for (let k = 0; k < 6; k++) Cc(c, x - 12 + k * 5, y - 10 + (k % 2) * 4, 2.2); });
      L(c, '#0c1610', 4, c => { c.moveTo(x - 15, y - 9); c.lineTo(x - 3, y - 6); c.moveTo(x + 15, y - 9); c.lineTo(x + 3, y - 6); });
      P(c, '#f2d14a', c => { Cc(c, x - 8, y - 1, 5.4); Cc(c, x + 8, y - 1, 5.4); }, 1.6);
      F(c, '#a12a1a', c => { E(c, x - 8, y - 1, 1.6, 4.4); E(c, x + 8, y - 1, 1.6, 4.4); });
      P(c, '#3d6a58', c => E(c, x + 1, y + 11, 12, 8), 1.8);
      L(c, '#0c1610', 2.4, c => { c.moveTo(x - 10, y + 12); c.lineTo(x - 6, y + 15); c.lineTo(x - 2, y + 12); c.lineTo(x + 2, y + 15); c.lineTo(x + 6, y + 12); c.lineTo(x + 11, y + 14); });
      F(c, '#f4f0e0', c => { c.moveTo(x - 8, y + 13); c.lineTo(x - 6, y + 19); c.lineTo(x - 4, y + 13); c.moveTo(x + 4, y + 13); c.lineTo(x + 6, y + 19); c.lineTo(x + 8, y + 13); });
    },
    armB: c => arm(c, { color: '#2f5a4a', noHand: true, prop: PROP.claw }), armF: c => arm(c, { color: '#2f5a4a', noHand: true, prop: PROP.claw }),
    idle: { tempo: 1.2, bob: 3, sway: 0.06, lean: 0.1, aF: [0.9, 0.3], aB: [0.8, 0.3] }, atk: 'lunge' }),
  bangsangsi: H({ size: 1.08, boxes: { armF: [-34, -64, 44, 56] },
    body: c => robe(c, { color: '#9c2a20', hem: '#e6b24a', belt: '#e6b24a', top: 13, bot: 22, collar: '#e6b24a' }),
    head: c => { HAT.bear(c); maskOn(c, 'bangsangsi'); },
    armB: c => arm(c, { color: '#9c2a20', cuff: '#e6b24a', prop: PROP.shield }), armF: c => arm(c, { color: '#9c2a20', cuff: '#e6b24a', prop: PROP.spear }),
    idle: { tempo: 1.3, bob: 4, sway: 0.05, aF: [0.6, 0.15], aB: [1.2, 0.2] }, atk: 'thrust' }),
  haetae: { size: 1.12, order: ['body', 'head'], neck: [14, -36], quad: true,
    body: c => {
      const col = '#7fa38a', dk = '#4f7a5e';
      for (const [x, s] of [[-14, 1], [12, 1]]) P(c, dk, c => RR(c, x - 4, -20, 9, 20, 3), 2);
      P(c, col, c => { E(c, -1, -26, 22, 14); }, 2.4);
      for (const [x, s] of [[-18, 1], [8, 1]]) P(c, col, c => RR(c, x - 4.5, -20, 10, 20, 3.5), 2);
      F(c, dk, c => { for (let k = 0; k < 5; k++) Cc(c, -14 + k * 6, -32 + (k % 2) * 3, 2.6); });
      P(c, col, c => { c.moveTo(-22, -32); c.quadraticCurveTo(-36, -40, -30, -52); c.quadraticCurveTo(-26, -44, -20, -40); }, 2);
      P(c, dk, c => Cc(c, -30, -52, 5), 1.8);
    },
    head: c => {
      const col = '#7fa38a', dk = '#4f7a5e';
      P(c, dk, c => { for (let k = 0; k < 9; k++) { const a = PI * 0.6 + k * PI * 1.1 / 8; Cc(c, 16 + Math.cos(a) * 16, -46 + Math.sin(a) * 16, 6); } }, 1.6);
      P(c, col, c => E(c, 20, -46, 15, 14), 2.2);
      P(c, '#c9c09a', c => { c.moveTo(16, -58); c.lineTo(20, -74); c.lineTo(24, -58); c.closePath(); }, 1.6);
      P(c, '#f2ead8', c => Cc(c, 24, -50, 4.4), 1.4); F(c, OL, c => Cc(c, 25, -50, 2.2));
      P(c, shade(col, 0.2), c => E(c, 32, -42, 6, 5), 1.6);
      P(c, OL, c => { c.moveTo(22, -36); c.quadraticCurveTo(30, -31, 37, -37); c.quadraticCurveTo(30, -34, 22, -36); }, 0);
      F(c, '#f4f0e0', c => { c.moveTo(27, -35); c.lineTo(28, -31); c.lineTo(30, -35); });
    },
    idle: { tempo: 0.7, bob: 1.5 }, atk: 'pounce' },
  taepyeongso: H({ size: 1.0,
    body: c => robe(c, { color: '#2f4f8f', hem: '#d63b2e', belt: '#d63b2e', top: 12, bot: 21, collar: '#d63b2e' }),
    head: c => {
      face(c, { closed: true, mouth: 'small' }); HAT.jeollip(c);
      const x = HC[0] + 6, y = HC[1] + 11;
      L(c, OL, 5, c => { c.moveTo(x, y); c.lineTo(x + 24, y + 9); });
      L(c, '#7a4a28', 3.2, c => { c.moveTo(x, y); c.lineTo(x + 24, y + 9); });
      P(c, '#e2b440', c => { c.moveTo(x + 22, y + 6); c.lineTo(x + 34, y + 6); c.lineTo(x + 34, y + 18); c.lineTo(x + 22, y + 12); c.closePath(); }, 1.8);
    },
    armB: c => arm(c, { color: '#d63b2e', cuff: '#2f4f8f' }), armF: c => arm(c, { color: '#d63b2e', cuff: '#2f4f8f' }),
    idle: { tempo: 1.4, bob: 3, sway: 0.06, aF: [1.75, 0.08], aB: [1.95, 0.08], head: 0.05 }, atk: 'blow' }),
  /* ---- 신화 ---- */
  samulpae: { size: 1.0, order: ['dyn'], group: [['kkwaenggwari', -0.42, -0.34], ['janggu', 0.42, -0.34], ['buk', -0.42, 0.28], ['jing', 0.42, 0.28]], idle: { tempo: 1 }, atk: 'beat' },
  bari: H({ size: 1.05, order: ['back', 'armB', 'body', 'head', 'armF'],
    back: c => HAT.buneBack(c),
    body: c => { skirtBody(c, { skirt: '#f4efe3', jacket: '#c23a2c', goreum: '#2f5fb8', skirtBand: '#2f5fb8' }); P(c, '#2f5fb8', c => RR(c, -13, -32, 26, 4, 2), 1.6); },
    head: c => { face(c, { closed: true, mouth: 'small' }); HAT.hwagwan(c); },
    armB: c => arm(c, { color: '#c23a2c', stripes: ['#f0c43a', '#2f5fb8', '#f4f0e6'], prop: PROP.obangFan }), armF: c => arm(c, { color: '#c23a2c', stripes: ['#f0c43a', '#2f5fb8', '#f4f0e6'], prop: PROP.bells }),
    idle: { tempo: 0.9, bob: 2, sway: 0.06, aF: [1.2, 0.5], aB: [1.0, 0.5] }, atk: 'raise' }),
  kkokdusoe: H({ size: 1.04, boxes: { armF: [-30, -60, 40, 56] },
    body: c => robe(c, { color: '#f4f0e6', hem: '#2f5fb8', belt: '#d63b2e', vest: '#2f7a52', top: 12, bot: 21 }),
    head: c => { face(c, { mustache: true, brows: true }); HAT.flowerHat(c); },
    armB: c => arm(c, { color: '#f4f0e6', cuff: '#d63b2e', hansam: true }), armF: c => arm(c, { color: '#f4f0e6', cuff: '#d63b2e', prop: PROP.plate }),
    idle: { tempo: 1.5, bob: 4, sway: 0.07, aF: [0.5, 0.2], aB: [1.2, 0.6] }, atk: 'throw' }),
  saja: { size: 1.2, order: ['body', 'head'], neck: [16, -40], quad: true,
    body: c => {
      const cols = ['#d63b2e', '#2f5fb8', '#f0c43a', '#f4f0e6', '#3a8a4a'];
      P(c, '#f4f0e6', c => { RR(c, -22, -20, 9, 20, 3); RR(c, -12, -20, 9, 20, 3); }, 2);
      F(c, '#2a2420', c => { E(c, -18, -1, 6, 3); E(c, -8, -1, 6, 3); });
      P(c, '#d9a640', c => E(c, -2, -28, 24, 13), 2.2);
      for (let k = 0; k < 14; k++) P(c, cols[k % 5], c => RR(c, -24 + k * 3.6, -24, 3.4, 16, 1.5), 1);
      P(c, '#c48a2a', c => { RR(c, 8, -20, 8, 20, 3); }, 2);
      P(c, '#f4f0e6', c => E(c, 12, -2, 6, 3.2), 1.6);
      P(c, '#d9a640', c => { c.moveTo(-24, -32); c.quadraticCurveTo(-38, -38, -34, -50); c.quadraticCurveTo(-30, -42, -22, -38); }, 2);
      P(c, '#d63b2e', c => Cc(c, -34, -51, 4.4), 1.6);
    },
    head: c => {
      const cols = ['#d63b2e', '#2f5fb8', '#f0c43a', '#f4f0e6', '#3a8a4a'];
      for (let k = 0; k < 22; k++) { const a = k / 22 * TAU; P(c, cols[k % 5], c => E(c, 20 + Math.cos(a) * 20, -48 + Math.sin(a) * 20, 6, 3, a), 1); }
      P(c, '#e2932e', c => Cc(c, 20, -48, 17), 2.2);
      P(c, '#f6f2e8', c => { E(c, 13, -60, 7, 3.4, -0.2); E(c, 27, -60, 7, 3.4, 0.2); }, 1.4);
      P(c, '#fff', c => { Cc(c, 14, -51, 5.4); Cc(c, 27, -51, 5.4); }, 1.6);
      F(c, OL, c => { Cc(c, 15, -50.4, 2.8); Cc(c, 28, -50.4, 2.8); });
      P(c, '#8a2a1a', c => E(c, 21, -42, 6, 4), 1.4);
      P(c, '#3a0d08', c => E(c, 21, -34, 12, 6), 1.6);
      F(c, '#f6efe0', c => { for (const x of [12, 16, 20, 24, 28]) { c.moveTo(x - 1.6, -38); c.lineTo(x, -34); c.lineTo(x + 1.6, -38); } });
      F(c, '#d8463a', c => E(c, 21, -31, 6, 2.6));
    },
    idle: { tempo: 1.1, bob: 3 }, atk: 'pounce' },
  daejanggun: { size: 1.35, order: ['whole'], static: true,
    whole: c => {
      for (const [ox, fem] of [[-11, false], [11, true]]) {
        P(c, '#8a8378', c => E(c, ox, -2, 10, 3.6), 1.8);
        P(c, '#9a7a52', c => { c.moveTo(ox - 9, -2); c.lineTo(ox - 8, fem ? -72 : -78); c.quadraticCurveTo(ox, fem ? -78 : -84, ox + 8, fem ? -72 : -78); c.lineTo(ox + 9, -2); c.closePath(); }, 2.2);
        const ty = fem ? -72 : -78;
        if (!fem) P(c, '#18181c', c => { c.moveTo(ox - 10, ty + 2); c.lineTo(ox - 7, ty - 18); c.quadraticCurveTo(ox, ty - 22, ox + 7, ty - 18); c.lineTo(ox + 10, ty + 2); c.quadraticCurveTo(ox, ty - 2, ox - 10, ty + 2); c.closePath(); }, 1.8);
        else P(c, '#18181c', c => { c.moveTo(ox - 9, ty + 1); c.quadraticCurveTo(ox, ty - 12, ox + 9, ty + 1); c.quadraticCurveTo(ox, ty - 3, ox - 9, ty + 1); }, 1.6);
        P(c, '#f2ead8', c => { Cc(c, ox - 4, ty + 12, 3.6); Cc(c, ox + 4, ty + 12, 3.6); }, 1.4);
        F(c, OL, c => { Cc(c, ox - 4, ty + 12.4, 1.8); Cc(c, ox + 4, ty + 12.4, 1.8); });
        if (fem) F(c, '#d4473b', c => { Cc(c, ox - 6, ty + 19, 2.4); Cc(c, ox + 6, ty + 19, 2.4); });
        P(c, '#7a5a3c', c => E(c, ox, ty + 19, 3, 4), 1.2);
        P(c, OL, c => { c.moveTo(ox - 6, ty + 26); c.quadraticCurveTo(ox, ty + 31, ox + 6, ty + 26); c.quadraticCurveTo(ox, ty + 28, ox - 6, ty + 26); }, 0);
        F(c, '#16120e', c => { for (let k = 0; k < 5; k++) c.rect(ox - 1.4, ty + 36 + k * 6.5, 2.8, 4.2); });
      }
    },
    idle: { tempo: 0.5 }, atk: 'pulse', glowEyes: [[-15, -66], [-7, -66], [7, -60], [15, -60]] },
  cheoyong: H({ size: 1.12,
    body: c => robe(c, { color: '#c23a2c', hem: '#2f5fb8', belt: '#f0c43a', tie: '#2f5fb8', top: 13, bot: 23, collar: '#2f5fb8' }),
    head: c => { maskOn(c, 'cheoyong'); HAT.samo(c); at(c, HC[0], HC[1], 1, c => { P(c, '#c47a5a', c => { Cc(c, -19, 2, 3.6); Cc(c, 20, 2, 3.6); }, 1.4); L(c, '#e6b24a', 1.6, c => { Cc(c, -19, 9, 2.6); Cc(c, 20, 9, 2.6); }); }); },
    armB: c => arm(c, { color: '#c23a2c', cuff: '#f0c43a', hansam: true, len: 19 }), armF: c => arm(c, { color: '#c23a2c', cuff: '#f0c43a', hansam: true, len: 19 }),
    idle: { tempo: 0.7, bob: 2, sway: 0.05, aF: [2.0, 0.5], aB: [1.8, 0.5] }, atk: 'sweep' }),
  bihyeong: H({ size: 1.05,
    body: c => robe(c, { color: '#3a2f6a', hem: '#e6b84a', belt: '#e6b84a', tie: '#e6b84a', top: 12, bot: 21, collar: '#e6b84a' }),
    head: c => { face(c, { brows: true }); HAT.goldband(c); },
    armB: c => arm(c, { color: '#3a2f6a', cuff: '#e6b84a' }), armF: c => arm(c, { color: '#3a2f6a', cuff: '#e6b84a' }),
    idle: { tempo: 1.0, bob: 2, sway: 0.04, aF: [0.5, 0.25], aB: [0.4, 0.2] }, atk: 'point', orbs: true }),
};

/* ---------- foes ---------- */
const FOE_COL = ['#3f6fab', '#b9473a', '#efe9dc', '#4f8b4b'];
function drawFoe2D(c, kind, frame) {
  if (kind >= 4) return drawFoeExtra(c, kind, frame);
  if (kind === 2) {
    const sw = frame ? 3 : -3;
    P(c, '#f4efe4', c => { c.moveTo(-14, -26); c.quadraticCurveTo(-18, -8, -14 + sw, 0); c.lineTo(-6 + sw, -4); c.lineTo(0 + sw, 0); c.lineTo(6 + sw, -4); c.lineTo(14 + sw, 0); c.quadraticCurveTo(17, -10, 13, -28); c.closePath(); }, 2.2);
    P(c, '#17131a', c => { c.moveTo(-16, -40); c.quadraticCurveTo(-24, -16, -18, -6); c.lineTo(-10, -26); c.lineTo(12, -26); c.lineTo(17, -12); c.quadraticCurveTo(22, -30, 14, -48); c.closePath(); }, 2);
    P(c, '#fbf8f2', c => E(c, 1, -40, 13, 16), 2.2);
    P(c, '#17131a', c => { c.moveTo(-13, -42); c.bezierCurveTo(-14, -60, 14, -62, 14, -44); c.quadraticCurveTo(10, -52, 2, -52); c.quadraticCurveTo(-8, -52, -13, -42); }, 1.6);
    return;
  }
  const body = FOE_COL[kind], dk = shade(body, -0.28), lt = shade(body, 0.3);
  const lf = frame ? 4 : -4;
  P(c, dk, c => { RR(c, -10 + lf, -14, 8, 14, 3); RR(c, 3 - lf, -14, 8, 14, 3); }, 2);
  P(c, body, c => E(c, 0, -28, 17, 18), 2.4);
  F(c, lt, c => E(c, 4, -24, 10, 11));
  P(c, '#e8b23a', c => { c.moveTo(-16, -20); c.quadraticCurveTo(0, -15, 16, -20); c.lineTo(15, -11); c.quadraticCurveTo(0, -7, -15, -11); c.closePath(); }, 2);
  F(c, '#2a1a0c', c => { for (let k = 0; k < 4; k++) { c.moveTo(-12 + k * 8, -18); c.lineTo(-10 + k * 8, -10); c.lineTo(-8 + k * 8, -17); } });
  const horn = '#efe2a8';
  if (kind === 1) { P(c, horn, c => { c.moveTo(-10, -42); c.lineTo(-14, -56); c.lineTo(-4, -44); c.closePath(); c.moveTo(6, -44); c.lineTo(12, -57); c.lineTo(13, -41); c.closePath(); }, 1.8); }
  else P(c, horn, c => { c.moveTo(-4, -44); c.lineTo(1, kind === 3 ? -62 : -58); c.lineTo(6, -44); c.closePath(); }, 1.8);
  if (kind === 3) { P(c, '#fff', c => Cc(c, 4, -32, 7.5), 1.8); F(c, OL, c => Cc(c, 6, -32, 3.6)); F(c, '#fff', c => Cc(c, 7, -33.4, 1.2)); }
  else { P(c, '#fff', c => { Cc(c, -2, -32, 4.6); Cc(c, 9, -32, 4.6); }, 1.6); F(c, OL, c => { Cc(c, -0.6, -32, 2.2); Cc(c, 10.4, -32, 2.2); }); }
  L(c, OL, 2.6, c => { c.moveTo(-6, -39); c.lineTo(1, -37); c.moveTo(13, -39); c.lineTo(7, -37); });
  P(c, '#3a0d08', c => { c.moveTo(-1, -23); c.quadraticCurveTo(5, -18, 12, -23); c.closePath(); }, 1.6);
  F(c, '#fff', c => { c.moveTo(1, -23); c.lineTo(2.4, -19.6); c.lineTo(3.8, -23); c.moveTo(8, -23); c.lineTo(9.4, -19.6); c.lineTo(10.8, -23); });
  P(c, '#8a5a32', c => { c.moveTo(13, -28); c.lineTo(26, -50); c.quadraticCurveTo(31, -50, 30, -45); c.lineTo(17, -25); c.closePath(); }, 2);
  F(c, '#5a3418', c => { Cc(c, 25, -44, 1.8); Cc(c, 28, -48, 1.6); Cc(c, 21, -40, 1.6); });
  P(c, body, c => Cc(c, 15, -26, 5), 1.8);
}

/* ---------- bosses ---------- */
const BOSS2D = {
  beom(c) {
    P(c, '#d8d3c8', c => { RR(c, -40, -26, 11, 26, 4); RR(c, -24, -26, 11, 26, 4); RR(c, 16, -26, 11, 26, 4); RR(c, 30, -26, 11, 26, 4); }, 2);
    P(c, '#ece8de', c => E(c, 0, -44, 46, 26), 2.6);
    L(c, '#fbfaf6', 3, c => { for (let k = 0; k < 40; k++) { const x = -42 + k * 2.2, y = -64 + Math.sin(k * 1.7) * 6; c.moveTo(x, y); c.quadraticCurveTo(x + 4, y + 20, x + 1 + Math.sin(k) * 4, y + 40); } });
    L(c, 'rgba(160,150,140,.6)', 1.4, c => { for (let k = 0; k < 20; k++) { const x = -38 + k * 4.4; c.moveTo(x, -58); c.quadraticCurveTo(x + 3, -40, x, -22); } });
    P(c, '#f4f1ea', c => E(c, 40, -56, 20, 19), 2.4);
    L(c, '#fbfaf6', 2.6, c => { for (let k = 0; k < 16; k++) { const a = -PI * 0.9 + k * 0.13; c.moveTo(40 + Math.cos(a) * 14, -56 + Math.sin(a) * 14); c.lineTo(40 + Math.cos(a) * 28, -56 + Math.sin(a) * 28); } });
    P(c, '#d8d0c4', c => E(c, 54, -50, 9, 7), 1.8);
    F(c, '#2a1f1a', c => Cc(c, 61, -52, 2.4));
    F(c, '#ffd84a', c => { Cc(c, 42, -60, 3.2); Cc(c, 52, -61, 3); });
    F(c, '#2a1010', c => { Cc(c, 42.6, -60, 1.4); Cc(c, 52.6, -61, 1.3); });
    P(c, '#7a1a14', c => { c.moveTo(48, -44); c.quadraticCurveTo(54, -38, 62, -44); c.closePath(); }, 1.4);
  },
  gumiho(c) {
    P(c, '#c96c22', c => { RR(c, -30, -24, 8, 24, 3); RR(c, -18, -24, 8, 24, 3); RR(c, 14, -24, 8, 24, 3); RR(c, 26, -24, 8, 24, 3); }, 2);
    F(c, '#1a0e08', c => { E(c, -26, -1, 5, 2.6); E(c, -14, -1, 5, 2.6); E(c, 18, -1, 5, 2.6); E(c, 30, -1, 5, 2.6); });
    P(c, '#e2832e', c => E(c, 2, -36, 34, 16), 2.4);
    P(c, '#f6efe2', c => E(c, 18, -30, 14, 10), 1.8);
    P(c, '#e88a35', c => E(c, 38, -50, 15, 14), 2.4);
    for (const s of [-1, 1]) P(c, '#e2832e', c => { c.moveTo(30 + s * 8, -60); c.lineTo(32 + s * 10, -76); c.lineTo(40 + s * 4, -62); c.closePath(); }, 1.8);
    P(c, '#f6efe2', c => { c.moveTo(44, -50); c.lineTo(62, -44); c.lineTo(46, -40); c.closePath(); }, 1.8);
    F(c, OL, c => Cc(c, 61, -44, 2.2));
    L(c, OL, 2.4, c => { c.moveTo(32, -54); c.lineTo(38, -52); c.moveTo(43, -55); c.lineTo(48, -53); });
  },
  imugiHead(c) {
    P(c, '#2f6e66', c => E(c, 0, -26, 26, 19), 2.6);
    P(c, '#e0c070', c => E(c, 6, -16, 18, 8), 2);
    for (const s of [0, 1]) P(c, '#e2b84a', c => { c.moveTo(-10 + s * 10, -42); c.lineTo(-18 + s * 6, -60); c.lineTo(-4 + s * 10, -44); c.closePath(); }, 1.6);
    for (let k = 0; k < 4; k++) P(c, '#e04a3a', c => { c.moveTo(-22 + k * 6, -42); c.lineTo(-26 + k * 6, -52); c.lineTo(-18 + k * 6, -44); c.closePath(); }, 1.2);
    P(c, '#f2d36b', c => Cc(c, 10, -32, 5), 1.6); F(c, OL, c => E(c, 11, -32, 1.6, 4.4));
    L(c, '#e8d48a', 1.6, c => { c.moveTo(20, -20); c.quadraticCurveTo(36, -24, 44, -12); c.moveTo(18, -16); c.quadraticCurveTo(32, -8, 38, 2); });
    F(c, OL, c => Cc(c, 22, -26, 1.6));
  },
  bulgasari(c) {
    P(c, '#5b5f68', c => { RR(c, -42, -30, 14, 30, 4); RR(c, -24, -30, 14, 30, 4); RR(c, 16, -30, 14, 30, 4); RR(c, 32, -30, 14, 30, 4); }, 2);
    const g = c.createLinearGradient(0, -80, 0, -20); g.addColorStop(0, '#a3a8b2'); g.addColorStop(1, '#4a4d55');
    P(c, g, c => E(c, 0, -48, 48, 28), 2.6);
    for (let k = 0; k < 9; k++) P(c, '#3a3d45', c => { const x = -36 + k * 9; c.moveTo(x - 4, -70 + Math.abs(k - 4) * 1.6); c.lineTo(x, -88 + Math.abs(k - 4) * 2.4); c.lineTo(x + 4, -70 + Math.abs(k - 4) * 1.6); c.closePath(); }, 1.6);
    L(c, '#ff6a2a', 2, c => { c.moveTo(-20, -40); c.lineTo(-12, -48); c.lineTo(-4, -38); c.moveTo(10, -36); c.lineTo(18, -46); c.lineTo(26, -40); });
    P(c, '#787c85', c => E(c, 44, -58, 17, 15), 2.4);
    P(c, '#62666e', c => { c.moveTo(56, -56); c.quadraticCurveTo(70, -48, 66, -30); c.quadraticCurveTo(62, -24, 58, -30); c.quadraticCurveTo(62, -42, 52, -50); c.closePath(); }, 2);
    P(c, '#efe9dc', c => { c.moveTo(50, -50); c.lineTo(58, -40); c.lineTo(54, -52); c.closePath(); }, 1.2);
    F(c, '#ff3b1f', c => { E(c, 46, -64, 3.6, 2.4, 0.3); E(c, 56, -63, 3.2, 2.2, -0.3); });
  },
};

/* ---------- challenge spirits ---------- */
const CHAL2D = {
  eodum(c) {
    P(c, '#2a2238', c => { c.moveTo(-26, -6); c.bezierCurveTo(-34, -40, -22, -80, 0, -82); c.bezierCurveTo(24, -82, 36, -44, 28, -8); c.quadraticCurveTo(21, -1, 14, -8); c.quadraticCurveTo(7, 1, 0, -6); c.quadraticCurveTo(-7, 2, -14, -6); c.quadraticCurveTo(-20, 1, -26, -6); c.closePath(); });
    F(c, 'rgba(140,110,200,.28)', c => E(c, -6, -58, 14, 18));
    P(c, '#2a2238', c => { c.moveTo(-26, -42); c.quadraticCurveTo(-42, -38, -40, -26); c.quadraticCurveTo(-33, -34, -24, -33); }, 2);
    P(c, '#2a2238', c => { c.moveTo(28, -42); c.quadraticCurveTo(44, -40, 44, -27); c.quadraticCurveTo(37, -35, 27, -33); }, 2);
    F(c, '#ffd84a', c => { E(c, -6, -54, 6.4, 4.6, -0.2); E(c, 13, -54, 6.4, 4.6, 0.2); });
    F(c, '#2a1a10', c => { Cc(c, -4, -54, 2.2); Cc(c, 15, -54, 2.2); });
    P(c, '#120d1a', c => { c.moveTo(-13, -37); c.quadraticCurveTo(4, -24, 23, -37); c.quadraticCurveTo(4, -31, -13, -37); }, 0);
    F(c, '#f4f0e0', c => { for (let k = 0; k < 5; k++) { const x = -9 + k * 6.4; c.moveTo(x, -35.4); c.lineTo(x + 2.2, -31); c.lineTo(x + 4.4, -35.4); } });
  },
  dueok(c) {
    const body = '#5b3a7a', dk = '#3a2452';
    P(c, dk, c => { RR(c, -17, -22, 12, 22, 4); RR(c, 5, -22, 12, 22, 4); }, 2);
    P(c, body, c => E(c, 0, -46, 27, 29), 2.6);
    F(c, shade(body, 0.22), c => E(c, 6, -42, 15, 17));
    P(c, '#e8b23a', c => { c.moveTo(-25, -33); c.quadraticCurveTo(0, -25, 25, -33); c.lineTo(23, -18); c.quadraticCurveTo(0, -12, -23, -18); c.closePath(); }, 2);
    F(c, '#2a1a0c', c => { for (let k = 0; k < 5; k++) { c.moveTo(-19 + k * 9, -30); c.lineTo(-17 + k * 9, -17); c.lineTo(-15 + k * 9, -29); } });
    P(c, '#1a1020', c => { for (let k = 0; k < 9; k++) { const a = PI + 0.25 + k * (PI - 0.5) / 8; c.moveTo(Math.cos(a) * 22, -50 + Math.sin(a) * 24); c.lineTo(Math.cos(a) * 34, -50 + Math.sin(a) * 34); c.lineTo(Math.cos(a + 0.16) * 22, -50 + Math.sin(a + 0.16) * 24); } }, 1.4);
    for (const s of [-1, 1]) P(c, '#efe2a8', c => { c.moveTo(s * 8, -72); c.quadraticCurveTo(s * 22, -90, s * 34, -88); c.quadraticCurveTo(s * 22, -82, s * 15, -68); c.closePath(); }, 1.8);
    P(c, '#fff', c => { E(c, -6, -54, 5.5, 4.4); E(c, 11, -54, 5.5, 4.4); }, 1.6);
    F(c, '#c0281c', c => { Cc(c, -4.6, -54, 2.4); Cc(c, 12.4, -54, 2.4); });
    L(c, OL, 3.4, c => { c.moveTo(-13, -62); c.lineTo(-1, -58); c.moveTo(18, -62); c.lineTo(6, -58); });
    P(c, '#2a0d08', c => { c.moveTo(-8, -40); c.quadraticCurveTo(3, -32, 16, -40); c.quadraticCurveTo(3, -36, -8, -40); }, 1.4);
    F(c, '#f4f0e0', c => { c.moveTo(-5, -39); c.lineTo(-3, -46); c.lineTo(-1, -38.6); c.moveTo(10, -38.6); c.lineTo(12, -46); c.lineTo(14, -39); });
    P(c, '#6b4428', c => { c.moveTo(18, -40); c.lineTo(34, -76); c.quadraticCurveTo(42, -80, 42, -70); c.lineTo(25, -36); c.closePath(); }, 2);
    F(c, '#cfc6b0', c => { for (const [x, y] of [[33, -70], [37, -64], [30, -60], [35, -76]]) { c.moveTo(x, y); c.lineTo(x + 4, y - 3); c.lineTo(x + 1, y + 3); } });
    P(c, body, c => Cc(c, 22, -38, 6), 1.8);
  },
  gangcheol(c) {
    const g1 = c.createLinearGradient(0, -90, 0, 0); g1.addColorStop(0, '#b4b9c4'); g1.addColorStop(1, '#4a4e58');
    P(c, g1, c => E(c, -2, -10, 30, 11), 2.4);
    P(c, g1, c => E(c, 0, -26, 24, 10), 2.4);
    P(c, g1, c => E(c, 2, -41, 18, 9), 2.4);
    F(c, '#ff6a2a', c => { for (const [x, y] of [[-20, -10], [-6, -6], [10, -8], [22, -12], [-14, -26], [2, -24], [16, -27], [-6, -41], [8, -40]]) Cc(c, x, y, 1.6); });
    P(c, '#7a7f8a', c => { c.moveTo(-6, -46); c.quadraticCurveTo(-10, -62, 2, -70); c.lineTo(14, -66); c.quadraticCurveTo(6, -58, 10, -46); c.closePath(); }, 2);
    P(c, '#8a8f9a', c => E(c, 14, -74, 15, 10, -0.15), 2.2);
    for (const s of [0, 1]) P(c, '#d9b25a', c => { c.moveTo(4 + s * 8, -82); c.lineTo(-2 + s * 6, -98); c.lineTo(10 + s * 8, -84); c.closePath(); }, 1.6);
    F(c, '#ff3b1f', c => E(c, 18, -77, 3.2, 2.2, -0.3));
    P(c, '#3a1a10', c => { c.moveTo(22, -70); c.lineTo(34, -66); c.lineTo(24, -64); c.closePath(); }, 1.4);
    F(c, '#ffb347', c => { c.moveTo(33, -68); c.quadraticCurveTo(44, -72, 48, -64); c.quadraticCurveTo(42, -66, 40, -60); c.quadraticCurveTo(38, -64, 33, -64); });
    for (let k = 0; k < 4; k++) P(c, '#5b5f68', c => { const x = -10 + k * 6; c.moveTo(x - 3, -64 + k * 5); c.lineTo(x - 8, -70 + k * 5); c.lineTo(x + 1, -66 + k * 5); c.closePath(); }, 1.2);
  },
  jine(c) {
    /* a thousand-year centipede rearing up: segments from tail to head */
    const seg = [[-36, -7, 10], [-25, -11, 11], [-13, -15, 12], [0, -19, 12.5], [10, -29, 12.5], [14, -42, 12], [12, -55, 11.5], [14, -68, 11], [20, -79, 10.5]];
    for (let k = 0; k < seg.length; k++) {
      const [x, y, r] = seg[k], ang = k < 3 ? -0.3 : k < 5 ? -0.8 : -1.4;
      L(c, OL, 3.4, c => { for (const s of [-1, 1]) { const nx = Math.cos(ang + PI / 2) * s, ny = Math.sin(ang + PI / 2) * s; c.moveTo(x, y); c.quadraticCurveTo(x + nx * (r + 7), y + ny * (r + 7) - 4, x + nx * (r + 10) + 3, y + ny * (r + 10) + 4); } });
      L(c, '#f2b434', 1.8, c => { for (const s of [-1, 1]) { const nx = Math.cos(ang + PI / 2) * s, ny = Math.sin(ang + PI / 2) * s; c.moveTo(x, y); c.quadraticCurveTo(x + nx * (r + 7), y + ny * (r + 7) - 4, x + nx * (r + 10) + 3, y + ny * (r + 10) + 4); } });
    }
    for (let k = 0; k < seg.length; k++) {
      const [x, y, r] = seg[k];
      P(c, k % 2 ? '#6e2216' : '#561a12', c => E(c, x, y, r, r * 0.72, k < 3 ? -0.3 : k < 5 ? -0.9 : -1.45), 2.2);
      F(c, 'rgba(255,190,120,.22)', c => E(c, x - r * 0.25, y - r * 0.3, r * 0.45, r * 0.22, -0.5));
      F(c, '#1e0c08', c => E(c, x + r * 0.15, y + r * 0.1, r * 0.2, r * 0.6, k < 3 ? -0.3 : -1.4));
    }
    P(c, '#3a120c', c => E(c, 26, -88, 13, 10, -0.3), 2.4);
    L(c, OL, 3.2, c => { c.moveTo(20, -95); c.quadraticCurveTo(10, -104, -2, -100); c.moveTo(30, -96); c.quadraticCurveTo(36, -104, 48, -100); });
    L(c, '#e05a2a', 1.6, c => { c.moveTo(20, -95); c.quadraticCurveTo(10, -104, -2, -100); c.moveTo(30, -96); c.quadraticCurveTo(36, -104, 48, -100); });
    for (const s of [-1, 1]) P(c, '#d9c7a0', c => { c.moveTo(30, -82 + s * 3); c.quadraticCurveTo(46, -84 + s * 10, 44, -72 + s * 6); c.quadraticCurveTo(40, -78 + s * 4, 32, -79 + s * 2); c.closePath(); }, 1.6);
    F(c, '#ffd84a', c => { E(c, 24, -91, 3.6, 2.6, -0.3); E(c, 33, -91, 3, 2.3, -0.3); });
    F(c, '#c0281c', c => { Cc(c, 24.6, -91, 1.4); Cc(c, 33.4, -91, 1.2); });
  },
  yacha(c) {
    /* a fierce yaksha with flaming hair and a trident */
    c.save(); c.scale(0.9, 0.9);
    const skin = '#2f5d8c', dk = '#1f3e60';
    L(c, OL, 4.4, c => { c.moveTo(34, -2); c.lineTo(42, -90); });
    L(c, '#8a5a2a', 2.8, c => { c.moveTo(34, -2); c.lineTo(42, -90); });
    P(c, '#c9ced8', c => { c.moveTo(32, -86); c.quadraticCurveTo(30, -98, 34, -102); c.lineTo(36, -90); c.lineTo(42, -88); c.lineTo(41, -104); c.lineTo(46, -90); c.lineTo(50, -88); c.quadraticCurveTo(54, -96, 52, -102); c.quadraticCurveTo(56, -90, 50, -84); c.lineTo(34, -82); c.closePath(); }, 1.8);
    P(c, dk, c => { RR(c, -16, -30, 11, 30, 4); RR(c, 4, -30, 11, 30, 4); }, 2);
    P(c, '#b8262a', c => { c.moveTo(-20, -40); c.lineTo(20, -40); c.lineTo(24, -20); c.lineTo(8, -26); c.lineTo(0, -16); c.lineTo(-8, -26); c.lineTo(-24, -20); c.closePath(); }, 2);
    F(c, '#f2c14a', c => { RR(c, -20, -42, 40, 5, 2); });
    P(c, skin, c => { c.moveTo(-22, -40); c.quadraticCurveTo(-26, -66, -14, -74); c.lineTo(14, -74); c.quadraticCurveTo(26, -66, 22, -40); c.closePath(); }, 2.4);
    F(c, shade(skin, 0.2), c => E(c, 6, -58, 10, 12));
    L(c, dk, 1.6, c => { c.moveTo(-8, -64); c.quadraticCurveTo(0, -60, 8, -64); c.moveTo(-6, -54); c.lineTo(-6, -46); c.moveTo(6, -54); c.lineTo(6, -46); });
    P(c, skin, c => { c.moveTo(-18, -70); c.quadraticCurveTo(-36, -60, -34, -44); c.lineTo(-26, -44); c.quadraticCurveTo(-26, -56, -14, -62); c.closePath(); }, 2.2);
    P(c, skin, c => { c.moveTo(16, -70); c.quadraticCurveTo(30, -66, 36, -56); c.lineTo(30, -50); c.quadraticCurveTo(26, -58, 14, -62); c.closePath(); }, 2.2);
    P(c, skin, c => Cc(c, 35, -54, 5.5), 1.8);
    P(c, skin, c => Cc(c, -30, -42, 5.5), 1.8);
    F(c, '#f2c14a', c => { RR(c, -34, -50, 8, 3, 1); RR(c, 31, -62, 8, 3, 1); });
    const flame = (col, s) => P(c, col, c => { c.moveTo(-19 * s, -78); for (let k = 0; k <= 6; k++) { const x = (-19 + k * 6.3) * s, h = [12, 20, 16, 25, 17, 21, 11][k] * s; c.lineTo(x + 3.1 * s, -87 - h); c.lineTo(x + 6.3 * s, -86 - (k % 2) * 4 * s); } c.lineTo(19 * s, -74); c.closePath(); }, s > 0.9 ? 2 : 0);
    flame('#e2482a', 1); flame('#ffb347', 0.62);
    P(c, skin, c => E(c, 0, -80, 15, 13), 2.4);
    for (const s of [-1, 1]) P(c, '#efe2a8', c => { c.moveTo(s * 9, -90); c.quadraticCurveTo(s * 13, -100, s * 18, -102); c.quadraticCurveTo(s * 14, -96, s * 13, -88); c.closePath(); }, 1.4);
    P(c, '#fff', c => { E(c, -6, -82, 4.6, 3.8); E(c, 7, -82, 4.6, 3.8); }, 1.4);
    F(c, '#ffcf2a', c => { Cc(c, -5, -82, 2.2); Cc(c, 8, -82, 2.2); });
    F(c, '#1a0a06', c => { Cc(c, -4.6, -82, 1); Cc(c, 8.4, -82, 1); });
    L(c, OL, 3, c => { c.moveTo(-12, -89); c.lineTo(-2, -86); c.moveTo(13, -89); c.lineTo(4, -86); });
    P(c, '#2a0d08', c => { c.moveTo(-8, -74); c.quadraticCurveTo(1, -67, 10, -74); c.quadraticCurveTo(1, -71, -8, -74); }, 1.4);
    F(c, '#f4f0e0', c => { c.moveTo(-6, -73.4); c.lineTo(-4, -79); c.lineTo(-2, -72.6); c.moveTo(4, -72.6); c.lineTo(6, -79); c.lineTo(8, -73.4); });
    c.restore();
  },
};

