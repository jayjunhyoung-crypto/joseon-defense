/* ================= 2D art, part 5: stage legends and the five 신수 ================= */
Object.assign(HAT, {
  chaGat(c) { // the underworld messenger's wide black gat with red tassels
    const x = HC[0], y = HC[1];
    P(c, 'rgba(14,12,18,.95)', c => E(c, x, y - 17, 37, 7));
    P(c, '#0e0c12', c => { c.moveTo(x - 11, y - 19); c.lineTo(x - 10, y - 42); c.quadraticCurveTo(x, y - 45, x + 10, y - 42); c.lineTo(x + 11, y - 19); c.closePath(); });
    for (const s of [-1, 1]) { L(c, '#c8302a', 2.2, c => { c.moveTo(x + s * 16, y - 15); c.quadraticCurveTo(x + s * 20, y + 4, x + s * 15, y + 22); }); P(c, '#c8302a', c => Cc(c, x + s * 15, y + 24, 2.6), 1); }
  },
  bachelor(c) { // 총각: short hair parted with a long braid behind
    const x = HC[0], y = HC[1];
    P(c, '#17131a', c => { c.moveTo(x - 20, y + 3); c.quadraticCurveTo(x - 22, y - 23, x, y - 24); c.quadraticCurveTo(x + 22, y - 23, x + 20, y + 3); c.quadraticCurveTo(x + 14, y - 11, x + 1, y - 14); c.quadraticCurveTo(x - 13, y - 11, x - 20, y + 3); c.closePath(); });
    L(c, 'rgba(255,255,255,.2)', 1.2, c => { c.moveTo(x + 1, y - 23); c.lineTo(x + 1, y - 15); });
  },
});
Object.assign(PROP, {
  heldMask(c, h) { // a half carved hahoe mask
    P(c, '#d9a868', c => { c.moveTo(-8, h + 2); c.quadraticCurveTo(-10, h + 18, 1, h + 22); c.quadraticCurveTo(12, h + 18, 10, h + 2); c.quadraticCurveTo(1, h - 2, -8, h + 2); c.closePath(); }, 1.8);
    L(c, OL, 1.6, c => { c.moveTo(-5, h + 8); c.quadraticCurveTo(-3, h + 6, -1, h + 8); c.moveTo(3, h + 8); c.quadraticCurveTo(5, h + 6, 7, h + 8); c.moveTo(-3, h + 15); c.quadraticCurveTo(1, h + 18, 5, h + 15); });
    F(c, 'rgba(255,255,255,.35)', c => E(c, -3, h + 4, 3, 1.4));
  },
  bagaji(c, h) { // a gourd dipper full of river water
    P(c, '#d9b25a', c => { c.moveTo(-9, h + 4); c.quadraticCurveTo(-8, h + 16, 2, h + 16); c.quadraticCurveTo(12, h + 16, 12, h + 4); c.closePath(); }, 1.8);
    P(c, '#6ab4e8', c => E(c, 1.5, h + 4, 10, 2.6), 1.2);
    F(c, 'rgba(255,255,255,.7)', c => E(c, -2, h + 3.4, 3, 0.9));
  },
  rope(c, h) { // a red binding rope coiled in the hand
    L(c, OL, 4.4, c => { for (let k = 0; k < 3; k++) { c.moveTo(-7, h + 4 + k * 4); c.quadraticCurveTo(1, h + 1 + k * 4, 9, h + 4 + k * 4); } });
    L(c, '#c8302a', 2.6, c => { for (let k = 0; k < 3; k++) { c.moveTo(-7, h + 4 + k * 4); c.quadraticCurveTo(1, h + 1 + k * 4, 9, h + 4 + k * 4); } });
    L(c, '#c8302a', 2.2, c => { c.moveTo(8, h + 12); c.bezierCurveTo(16, h + 20, 4, h + 26, 12, h + 34); });
  },
});
function cloudPuff(c, x, y, s, col = '#f4f0e6') {
  P(c, col, c => { Cc(c, x - 9 * s, y, 7 * s); Cc(c, x, y - 4 * s, 9 * s); Cc(c, x + 10 * s, y, 7 * s); E(c, x, y + 3 * s, 16 * s, 5 * s); }, 1.8);
  L(c, 'rgba(120,140,170,.35)', 1.2, c => { c.moveTo(x - 12 * s, y + 3 * s); c.quadraticCurveTo(x, y + 6 * s, x + 12 * s, y + 3 * s); });
}
function dragonBody(c, o) { // a coiling serpent body along a curve, scales on top
  const pts = o.pts, w = o.w || 9;
  const path = c => { c.moveTo(pts[0][0], pts[0][1]); for (let k = 1; k < pts.length - 1; k++) { const mx = (pts[k][0] + pts[k + 1][0]) / 2, my = (pts[k][1] + pts[k + 1][1]) / 2; c.quadraticCurveTo(pts[k][0], pts[k][1], mx, my); } const l = pts[pts.length - 1]; c.lineTo(l[0], l[1]); };
  if (o.fin) for (let k = 1; k < pts.length - 1; k++) {
    const [x, y] = pts[k], dx = pts[k + 1][0] - pts[k - 1][0], dy = pts[k + 1][1] - pts[k - 1][1], l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l, sx = ny < 0 ? 1 : -1;
    const ox = x + nx * sx * w * 0.9, oy = y + ny * sx * w * 0.9;
    P(c, o.fin, c => { c.moveTo(ox - dx / l * 5, oy - dy / l * 5); c.lineTo(ox + nx * sx * 9, oy + ny * sx * 9); c.lineTo(ox + dx / l * 5, oy + dy / l * 5); c.closePath(); }, 1.4);
  }
  c.lineCap = 'round'; c.lineJoin = 'round';
  L(c, OL, w * 2 + 5, path); L(c, o.col, w * 2, path); L(c, o.belly, w * 0.8, path);
  L(c, o.dark, 1.6, c => { for (let k = 1; k < pts.length - 1; k++) { const [x, y] = pts[k]; c.moveTo(x - w * 0.7, y - 2); c.quadraticCurveTo(x, y - w * 0.6, x + w * 0.7, y - 2); } });
  c.lineCap = 'butt'; c.lineJoin = 'miter';
}
function dragonHead(c, x, y, o, flip = 1) {
  at(c, x, y, 1, c => {
    c.scale(flip, 1);
    P(c, o.col, c => { c.moveTo(-14, 4); c.quadraticCurveTo(-16, -12, -2, -14); c.quadraticCurveTo(14, -15, 24, -6); c.quadraticCurveTo(28, 0, 22, 5); c.quadraticCurveTo(8, 10, -14, 4); c.closePath(); }, 2.2);
    P(c, o.belly, c => { c.moveTo(4, 3); c.quadraticCurveTo(14, 6, 23, 3); c.quadraticCurveTo(14, 9, 2, 7); c.closePath(); }, 1.4);
    for (const dx of [-6, 2]) P(c, '#f4ead0', c => { c.moveTo(dx - 2, -13); c.quadraticCurveTo(dx - 8, -28, dx - 14, -32); c.quadraticCurveTo(dx - 4, -26, dx + 3, -14); c.closePath(); }, 1.6);
    P(c, o.mane, c => { c.moveTo(-14, -2); c.quadraticCurveTo(-26, -6, -28, 4); c.quadraticCurveTo(-22, 2, -20, 8); c.quadraticCurveTo(-26, 12, -22, 18); c.quadraticCurveTo(-14, 10, -12, 4); c.closePath(); }, 1.6);
    P(c, '#fff6d0', c => E(c, 8, -6, 4.4, 3.4), 1.4); F(c, OL, c => Cc(c, 9, -6, 1.8)); F(c, '#fff', c => Cc(c, 8.2, -7, 0.7));
    F(c, OL, c => Cc(c, 22, -3, 1.2));
    L(c, o.whisker, 1.6, c => { c.moveTo(20, 2); c.bezierCurveTo(30, 6, 26, 16, 36, 18); c.moveTo(16, 4); c.bezierCurveTo(22, 14, 14, 20, 22, 26); });
    F(c, '#f4f0e6', c => { c.moveTo(10, 5); c.lineTo(12, 9); c.lineTo(14, 5); c.moveTo(16, 4.4); c.lineTo(18, 8); c.lineTo(20, 4); });
  });
}
function dragonLeg(c, x, y, x2, y2, col) { c.lineCap = 'round'; L(c, OL, 9, c => { c.moveTo(x, y); c.quadraticCurveTo((x + x2) / 2 - 4, (y + y2) / 2 - 6, x2, y2); }); L(c, col, 5.6, c => { c.moveTo(x, y); c.quadraticCurveTo((x + x2) / 2 - 4, (y + y2) / 2 - 6, x2, y2); }); c.lineCap = 'butt'; claw4(c, x2, y2, col, 1.1); }
function claw4(c, x, y, col, s = 1) { at(c, x, y, s, c => { P(c, col, c => E(c, 0, 0, 5, 3.6), 1.6); F(c, '#f4ead0', c => { for (let k = -1; k <= 1; k++) { c.moveTo(k * 3 - 1, 2); c.lineTo(k * 3.4, 6); c.lineTo(k * 3 + 1, 2); } }); }); }
Object.assign(PUP, {
  heodoryeong: H({ size: 1.0, order: ['back', 'armB', 'body', 'head', 'armF'],
    back: c => HAT.braidBack(c, '#1f1a17'),
    body: c => plainBody(c, { top: '#ece6d6', pants: '#e2dccb', rope: '#8a6a3a' }),
    head: c => { face(c, { brows: true }); HAT.bachelor(c); },
    armB: c => arm(c, { color: '#ece6d6', prop: PROP.stick }), armF: c => arm(c, { color: '#ece6d6', prop: PROP.heldMask }),
    idle: { tempo: 1.3, bob: 2.5, sway: 0.05, aF: [0.8, 0.3], aB: [0.5, 0.2] }, atk: 'throw' }),
  gimseondal: H({ size: 1.02,
    body: c => robe(c, { color: '#a9bccb', hem: '#6a7f90', belt: '#3a4a5a', tie: '#c8302a', top: 12, bot: 22, collar: '#f4efe3' }),
    head: c => { face(c, { brows: true, mustache: true }); HAT.gat(c); },
    armB: c => arm(c, { color: '#a9bccb', cuff: '#f4efe3', prop: PROP.fan }), armF: c => arm(c, { color: '#a9bccb', cuff: '#f4efe3', prop: PROP.bagaji }),
    idle: { tempo: 1.2, bob: 2.5, sway: 0.1, aF: [0.7, 0.4], aB: [0.9, 0.3], head: 0.1 }, atk: 'swing' }),
  euljimundeok: H({ size: 1.08,
    body: c => armorBody(c, { color: '#8a2a22', trim: '#1a1a1e', belt: '#d8a23a', stud: '#f2d888', knot: true }),
    head: c => { face(c, { brows: true, mustache: true }); beardOn(c, '#1b1512', 18); HAT.tugu(c, { dome: '#4a4a52', flap: '#8a2a22', plume: '#1a1a1e', trim: '#d8a23a' }); },
    armB: c => arm(c, { color: '#8a2a22', cuff: '#d8a23a' }), armF: c => arm(c, { color: '#8a2a22', cuff: '#d8a23a', prop: PROP.spear }),
    idle: { tempo: 0.9, bob: 1.5, sway: 0.03, aF: [0.5, 0.15], aB: [0.4, 0.1] }, atk: 'thrust' }),
  jangbogo: H({ size: 1.06,
    body: c => armorBody(c, { color: '#24477a', trim: '#e8c45a', belt: '#a83a2c', stud: '#dfe6f0', knot: true }),
    head: c => { face(c, { brows: true, mustache: true }); HAT.tugu(c, { flap: '#24477a', plume: '#2f9ad6' }); },
    armB: c => arm(c, { color: '#24477a', cuff: '#e8c45a' }), armF: c => arm(c, { color: '#24477a', cuff: '#e8c45a', prop: PROP.flag }),
    idle: { tempo: 0.9, bob: 1.5, sway: 0.04, aF: [0.6, 0.15], aB: [0.4, 0.1] }, atk: 'point' }),
  gangrim: H({ size: 1.06,
    body: c => robe(c, { color: '#1c1a22', hem: '#c8302a', belt: '#c8302a', tie: '#c8302a', top: 12, bot: 23, collar: '#f4efe3' }),
    head: c => { face(c, { brows: true, skin: '#e8dccb' }); HAT.chaGat(c); },
    armB: c => arm(c, { color: '#1c1a22', cuff: '#c8302a' }), armF: c => arm(c, { color: '#1c1a22', cuff: '#c8302a', prop: PROP.rope }),
    idle: { tempo: 0.8, bob: 1.2, sway: 0.03, aF: [0.5, 0.15], aB: [0.3, 0.1] }, atk: 'swing' }),
  cheongryong: { size: 1.1, order: ['whole'], static: true, boxes: { whole: [-62, -120, 66, 8] }, pdiv: 150, pfy: 0.9,
    whole: c => {
      const o = { col: '#2f9a86', belly: '#d8e6a8', dark: '#1d6a5a', mane: '#2f6ad8', whisker: '#e8f4ff', fin: '#2f6ad8' };
      cloudPuff(c, -30, -8, 1.1); cloudPuff(c, 34, -14, 0.9);
      dragonBody(c, { pts: [[40, -10], [10, -6], [-26, -22], [-20, -52], [10, -60], [22, -82], [6, -96]], w: 9, col: o.col, belly: o.belly, dark: o.dark, fin: o.fin });
      L(c, OL, 3.4, c => { c.moveTo(40, -10); c.quadraticCurveTo(56, -14, 58, -26); }); P(c, o.mane, c => { c.moveTo(56, -22); c.quadraticCurveTo(66, -30, 62, -38); c.quadraticCurveTo(58, -30, 52, -28); c.closePath(); }, 1.6);
      dragonLeg(c, -22, -30, -40, -20, o.col); dragonLeg(c, 14, -62, 34, -54, o.col); dragonLeg(c, 18, -8, 30, 2, o.col);
      dragonHead(c, 4, -100, o, -1);
      cloudPuff(c, -6, 0, 1.3);
    },
    idle: { tempo: 0.7 }, atk: 'recoil', glowEyes: [[-4, -106]] },
  jujak: { size: 1.08, order: ['whole'], static: true, boxes: { whole: [-66, -118, 66, 8] }, pdiv: 150, pfy: 0.9,
    whole: c => {
      const red = '#d8392a', or = '#f28a2a', gold = '#f2c43a';
      for (let k = 0; k < 5; k++) { const a = 0.35 + k * 0.17; P(c, k % 2 ? or : red, c => { c.moveTo(4, -40); c.bezierCurveTo(12 + k * 6, -24, 28 + k * 8, -14 + k * 2, 30 + k * 10, 2); c.quadraticCurveTo(22 + k * 8, -10, 6, -32); c.closePath(); }, 1.6); }
      for (const s of [-1, 1]) {
        P(c, s < 0 ? red : or, c => { c.moveTo(0, -60); c.bezierCurveTo(s * 20, -96, s * 50, -104, s * 64, -92); c.quadraticCurveTo(s * 50, -88, s * 52, -76); c.quadraticCurveTo(s * 38, -78, s * 40, -64); c.quadraticCurveTo(s * 24, -66, s * 22, -52); c.quadraticCurveTo(s * 10, -52, 0, -46); c.closePath(); }, 2);
        L(c, gold, 1.6, c => { c.moveTo(s * 10, -62); c.quadraticCurveTo(s * 34, -86, s * 58, -90); c.moveTo(s * 12, -56); c.quadraticCurveTo(s * 28, -70, s * 44, -72); });
      }
      P(c, red, c => E(c, 0, -50, 13, 18), 2.2);
      P(c, gold, c => E(c, 0, -46, 7, 11), 1.2);
      P(c, red, c => { c.moveTo(-8, -64); c.quadraticCurveTo(-10, -82, 2, -84); c.quadraticCurveTo(12, -82, 10, -66); c.closePath(); }, 2);
      P(c, gold, c => { c.moveTo(8, -78); c.lineTo(20, -75); c.lineTo(8, -72); c.closePath(); }, 1.4);
      for (let k = 0; k < 3; k++) P(c, k === 1 ? gold : or, c => { c.moveTo(-2, -84); c.quadraticCurveTo(-8 - k * 4, -98 - k * 4, -2 - k * 6, -106 - k * 3); c.quadraticCurveTo(0 - k * 2, -96, 2, -84); c.closePath(); }, 1.2);
      P(c, '#fff6d0', c => E(c, 4, -77, 2.8, 2.4), 1.2); F(c, OL, c => Cc(c, 4.8, -77, 1.3));
      L(c, OL, 3, c => { c.moveTo(-4, -34); c.lineTo(-6, -4); c.moveTo(5, -34); c.lineTo(7, -4); }); L(c, gold, 1.6, c => { c.moveTo(-4, -34); c.lineTo(-6, -4); c.moveTo(5, -34); c.lineTo(7, -4); });
      F(c, 'rgba(255,170,60,.55)', c => { E(c, -6, -2, 7, 2.4); E(c, 8, -2, 7, 2.4); });
    },
    idle: { tempo: 1.2 }, atk: 'peck', glowEyes: [[4, -77]] },
  baekho: { size: 1.06, order: ['whole'], static: true, boxes: { whole: [-60, -98, 58, 8] }, pdiv: 140, pfy: 0.9,
    whole: c => {
      const w = '#f6f2ea', sh = '#d6d0c4';
      L(c, OL, 8, c => { c.moveTo(-30, -12); c.bezierCurveTo(-56, -14, -58, -48, -42, -56); }); L(c, w, 5, c => { c.moveTo(-30, -12); c.bezierCurveTo(-56, -14, -58, -48, -42, -56); });
      L(c, OL, 2, c => { for (const t of [0.3, 0.55, 0.8]) { const x = -30 - 30 * t, y = -12 - 36 * t; c.moveTo(x - 3, y - 2); c.lineTo(x + 3, y + 2); } });
      P(c, w, c => { c.moveTo(-34, -4); c.quadraticCurveTo(-40, -46, -6, -56); c.quadraticCurveTo(24, -58, 26, -30); c.quadraticCurveTo(28, -6, 16, -2); c.closePath(); }, 2.4);
      F(c, sh, c => { c.moveTo(-34, -4); c.quadraticCurveTo(-38, -30, -26, -44); c.quadraticCurveTo(-30, -24, -24, -4); c.closePath(); });
      L(c, '#1f1a17', 4, c => { for (const [x0, y0, x1, y1] of [[-24, -48, -16, -36], [-12, -54, -6, -40], [2, -55, 4, -42], [-30, -30, -20, -26], [-28, -18, -18, -16], [16, -40, 22, -30], [18, -26, 24, -18]]) { c.moveTo(x0, y0); c.quadraticCurveTo((x0 + x1) / 2 + 3, (y0 + y1) / 2, x1, y1); } });
      for (const x of [-18, 10]) { P(c, w, c => { RR(c, x - 6, -24, 13, 24, 5); }, 2); L(c, OL, 1.4, c => { c.moveTo(x - 2, -2); c.lineTo(x - 2, -6); c.moveTo(x + 2, -2); c.lineTo(x + 2, -6); }); }
      P(c, w, c => { c.moveTo(4, -48); c.quadraticCurveTo(0, -80, 22, -84); c.quadraticCurveTo(46, -84, 48, -62); c.quadraticCurveTo(48, -44, 28, -42); c.quadraticCurveTo(12, -40, 4, -48); c.closePath(); }, 2.4);
      for (const ex of [10, 40]) { P(c, w, c => Cc(c, ex, -82, 7), 2); F(c, '#1f1a17', c => Cc(c, ex, -82, 3.4)); }
      L(c, '#1f1a17', 3, c => { c.moveTo(19, -80); c.lineTo(33, -80); c.moveTo(20, -75.5); c.lineTo(32, -75.5); c.moveTo(18, -71); c.lineTo(34, -71); c.moveTo(26, -80); c.lineTo(26, -71); });
      L(c, '#1f1a17', 3.2, c => { c.moveTo(4, -70); c.quadraticCurveTo(10, -68, 12, -63); c.moveTo(5, -61); c.quadraticCurveTo(10, -60, 12, -56); c.moveTo(48, -70); c.quadraticCurveTo(42, -68, 40, -63); c.moveTo(47, -61); c.quadraticCurveTo(42, -60, 40, -56); });
      P(c, '#fff6c8', c => { E(c, 18, -66, 4.4, 3.4); E(c, 34, -66, 4.4, 3.4); }, 1.4); F(c, '#2a6a3a', c => { Cc(c, 19, -66, 2); Cc(c, 35, -66, 2); }); F(c, OL, c => { E(c, 19, -66, 0.8, 1.8); E(c, 35, -66, 0.8, 1.8); });
      P(c, '#e8a0a0', c => { c.moveTo(23, -58); c.lineTo(29, -58); c.lineTo(26, -54); c.closePath(); }, 1.2);
      P(c, '#fbf8f2', c => { E(c, 20, -51, 7, 5); E(c, 32, -51, 7, 5); }, 1.4);
      L(c, OL, 1.6, c => { c.moveTo(26, -54); c.quadraticCurveTo(22, -48, 17, -50); c.moveTo(26, -54); c.quadraticCurveTo(30, -48, 35, -50); });
      F(c, '#fbf8f2', c => { c.moveTo(20, -47); c.lineTo(22, -41); c.lineTo(24, -47); c.moveTo(28, -47); c.lineTo(30, -41); c.lineTo(32, -47); });
      L(c, OL, 1, c => { c.moveTo(20, -47); c.lineTo(22, -41); c.lineTo(24, -47); c.moveTo(28, -47); c.lineTo(30, -41); c.lineTo(32, -47); });
      L(c, 'rgba(60,50,40,.6)', 1, c => { c.moveTo(14, -54); c.lineTo(2, -56); c.moveTo(14, -52); c.lineTo(3, -50); c.moveTo(38, -54); c.lineTo(50, -56); c.moveTo(38, -52); c.lineTo(49, -50); });
    },
    idle: { tempo: 0.8 }, atk: 'recoil', glowEyes: [[19, -66], [35, -66]] },
  hyeonmu: { size: 1.06, order: ['whole'], static: true, boxes: { whole: [-62, -104, 62, 8] }, pdiv: 150, pfy: 0.88,
    whole: c => {
      const shell = '#2c3a3a', sd = '#1a2424', skin = '#4a6a5a';
      P(c, 'rgba(60,110,160,.4)', c => E(c, 0, -1, 56, 6), 0);
      for (const [x, s] of [[-34, 1], [30, 1]]) P(c, skin, c => { E(c, x, -6, 10, 6); }, 2);
      P(c, skin, c => { c.moveTo(40, -18); c.quadraticCurveTo(56, -22, 60, -30); c.quadraticCurveTo(64, -40, 54, -40); c.quadraticCurveTo(46, -34, 38, -26); c.closePath(); }, 2);
      P(c, '#fff6c8', c => Cc(c, 56, -34, 2.6), 1); F(c, OL, c => Cc(c, 56.6, -34, 1.2));
      P(c, shell, c => { c.moveTo(-46, -12); c.quadraticCurveTo(-44, -58, 0, -60); c.quadraticCurveTo(44, -58, 46, -12); c.closePath(); }, 2.6);
      L(c, '#5a7a6a', 1.8, c => { for (const [x, y] of [[-24, -26], [0, -30], [24, -26], [-12, -46], [12, -46]]) { c.moveTo(x - 9, y); c.lineTo(x - 5, y - 8); c.lineTo(x + 5, y - 8); c.lineTo(x + 9, y); c.lineTo(x + 5, y + 8); c.lineTo(x - 5, y + 8); c.closePath(); } });
      P(c, sd, c => { c.moveTo(-48, -12); c.quadraticCurveTo(0, -4, 48, -12); c.lineTo(46, -8); c.quadraticCurveTo(0, 0, -46, -8); c.closePath(); }, 1.6);
      const snake = c => { c.moveTo(-40, -14); c.bezierCurveTo(-60, -30, -40, -66, -10, -64); c.bezierCurveTo(24, -62, 30, -80, 14, -88); };
      c.lineCap = 'round'; L(c, OL, 11, snake); L(c, '#3a7a5a', 7, snake); L(c, '#cde0a0', 2.4, snake); c.lineCap = 'butt';
      P(c, '#3a7a5a', c => { c.moveTo(8, -86); c.quadraticCurveTo(10, -100, 24, -100); c.quadraticCurveTo(34, -98, 32, -90); c.quadraticCurveTo(26, -84, 12, -84); c.closePath(); }, 2);
      P(c, '#fff6c8', c => Cc(c, 24, -94, 2.6), 1); F(c, OL, c => Cc(c, 24.8, -94, 1.2));
      L(c, '#d63b2e', 1.6, c => { c.moveTo(32, -92); c.lineTo(40, -92); c.moveTo(40, -92); c.lineTo(43, -95); c.moveTo(40, -92); c.lineTo(43, -89); });
    },
    idle: { tempo: 0.5 }, atk: 'recoil', glowEyes: [[24, -94], [56, -34]] },
  hwangryong: { size: 1.12, order: ['whole'], static: true, boxes: { whole: [-62, -124, 64, 8] }, pdiv: 150, pfy: 0.9,
    whole: c => {
      const o = { col: '#e6b23a', belly: '#fff0b8', dark: '#a8741a', mane: '#d6402e', whisker: '#fff6d8', fin: '#d6402e' };
      const g = c.createRadialGradient(-4, -54, 2, -4, -54, 26); g.addColorStop(0, '#ffffff'); g.addColorStop(0.4, '#ffe6a0'); g.addColorStop(1, 'rgba(255,200,90,0)');
      F(c, g, c => Cc(c, -4, -54, 26));
      cloudPuff(c, 30, -8, 1.0, '#fff4d6'); cloudPuff(c, -34, -12, 0.9, '#fff4d6');
      dragonBody(c, { pts: [[44, -6], [20, -2], [-24, -14], [-34, -50], [-10, -78], [20, -72], [26, -98], [8, -110]], w: 10, col: o.col, belly: o.belly, dark: o.dark, fin: o.fin });
      P(c, '#fffbe8', c => Cc(c, -4, -54, 9), 2); F(c, 'rgba(255,220,140,.8)', c => Cc(c, -2, -52, 4)); F(c, '#fff', c => Cc(c, -7, -57, 2.4));
      dragonLeg(c, -28, -44, -16, -56, o.col); dragonLeg(c, 14, -70, 2, -60, o.col); dragonLeg(c, -16, -12, -32, -2, o.col);
      dragonHead(c, 6, -112, o, -1);
      cloudPuff(c, 0, 0, 1.25, '#fff4d6');
    },
    idle: { tempo: 0.6 }, atk: 'recoil', glowEyes: [[-2, -118]] },
});
/* drawn fallbacks while the illustrations load: 용왕 borrows 산신령's frame, 최무선 장보고's */
PUP.yongwang = PUP.sansin; PUP.choimuseon = PUP.jangbogo;

