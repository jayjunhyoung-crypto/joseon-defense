/* ================= 2D art, style 2 pilot: cel shading, richer faces, cloth and ornaments =================
   초랭이, 각시, 이순신, 바리공주 are redrawn here; they replace the older puppets of the same id */
const INK = '#24160e';
function P2(c, fill, fn, lw = 2.2) { c.beginPath(); fn(c); c.fillStyle = fill; c.fill(); if (lw) { c.lineWidth = lw; c.strokeStyle = INK; c.lineJoin = 'round'; c.stroke(); } }
function clipDo(c, fn, draw) { c.save(); c.beginPath(); fn(c); c.clip(); draw(c); c.restore(); }
function lin(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; }
/* paint a soft shadow on the left of a shape and a thin rim of light on the right */
function cel(c, path, x0, x1, dark = 'rgba(40,16,40,.26)', light = 'rgba(255,250,235,.28)') {
  clipDo(c, path, c => {
    c.fillStyle = lin(c, x0, 0, x1, 0, [[0, dark], [0.42, 'rgba(0,0,0,0)'], [0.86, 'rgba(0,0,0,0)'], [1, light]]);
    c.fillRect(x0 - 4, -140, x1 - x0 + 8, 160);
  });
}
function eyes2(c, x, y, o = {}) {
  const pts = [[x - 6, y + 1], [x + 8.5, y + 1]];
  if (o.closed) {
    for (const [ex, ey] of pts) {
      L(c, INK, 2.2, c => { c.moveTo(ex - 3.8, ey); c.quadraticCurveTo(ex, ey + 3.2, ex + 3.8, ey); });
      if (o.lash) L(c, INK, 1.3, c => { c.moveTo(ex + 3.6, ey + 0.2); c.lineTo(ex + 5.4, ey - 1.2); c.moveTo(ex - 3.6, ey + 0.2); c.lineTo(ex - 5.2, ey - 1); });
    }
    return;
  }
  const ry = o.stern ? 3.1 : 4.2;
  for (const [ex, ey] of pts) {
    P2(c, '#fffaf2', c => E(c, ex, ey, 3.4, ry), 1.2);
    F(c, lin(c, 0, ey - ry, 0, ey + ry, [[0, o.iris2 || '#2a160c'], [1, o.iris || '#6a3e22']]), c => E(c, ex + 0.6, ey + 0.3, 2.5, ry - 0.7));
    F(c, '#120804', c => Cc(c, ex + 0.7, ey + 0.4, 1.2));
    F(c, '#fff', c => { Cc(c, ex + 1.6, ey - 1.2, 1.05); Cc(c, ex - 0.6, ey + 1.6, 0.55); });
    L(c, INK, o.stern ? 2.6 : 2, c => { c.moveTo(ex - 3.8, ey - ry + 0.8); c.quadraticCurveTo(ex, ey - ry - 1, ex + 3.9, ey - ry + 1.2); });
    if (o.lash) L(c, INK, 1.3, c => { c.moveTo(ex + 3.6, ey - ry + 1); c.lineTo(ex + 5.5, ey - ry - 0.6); });
  }
  if (o.stern) L(c, INK, 2.8, c => { c.moveTo(x - 10.5, y - 6); c.lineTo(x - 2.5, y - 3.6); c.moveTo(x + 4.5, y - 3.6); c.lineTo(x + 13, y - 6.4); });
  else if (o.brows !== false) L(c, o.browCol || '#3a2416', 1.8, c => { c.moveTo(x - 10, y - 5.4); c.quadraticCurveTo(x - 6, y - 7.4, x - 2.6, y - 5.4); c.moveTo(x + 4.6, y - 5.4); c.quadraticCurveTo(x + 8.6, y - 7.6, x + 12.6, y - 5.4); });
}
function face2(c, o = {}) {
  const x = HC[0], y = HC[1] + 1, r = o.r || 19.5, skin = o.skin || '#f7d3ae';
  P2(c, skin, c => E(c, x - r + 2, y + 3, 4, 5.2), 1.6);
  const g = c.createRadialGradient(x + 6, y - 7, 2, x + 1, y, r + 3);
  g.addColorStop(0, '#fff0de'); g.addColorStop(0.6, skin); g.addColorStop(1, '#e2a984');
  P2(c, g, c => Cc(c, x, y, r));
  clipDo(c, c => Cc(c, x, y, r), c => { F(c, 'rgba(150,70,50,.15)', c => E(c, x - r * 0.95, y + 3, r * 0.5, r * 1.2)); F(c, 'rgba(150,70,50,.12)', c => E(c, x, y + r * 1.05, r, r * 0.35)); });
  F(c, 'rgba(240,108,96,.32)', c => { E(c, x - 10.5, y + 7.5, 4.2, 2.5); E(c, x + 14, y + 7.5, 4.2, 2.5); });
  eyes2(c, x, y, o);
  L(c, 'rgba(150,76,46,.65)', 1.4, c => { c.moveTo(x + 3.6, y + 3); c.quadraticCurveTo(x + 5.6, y + 6.2, x + 2.8, y + 7.2); });
  const m = o.mouth || 'smile';
  if (m === 'small') { P2(c, '#d24a44', c => E(c, x + 2, y + 11.5, 2.4, 1.6), 1); F(c, 'rgba(255,255,255,.5)', c => Cc(c, x + 2.6, y + 11, 0.6)); }
  else if (m === 'stern') L(c, INK, 2, c => { c.moveTo(x - 2, y + 12); c.quadraticCurveTo(x + 2, y + 11, x + 6, y + 12.2); });
  else { P2(c, '#b53c34', c => { c.moveTo(x - 2.4, y + 10.2); c.quadraticCurveTo(x + 2, y + 15.6, x + 6.6, y + 10.2); c.quadraticCurveTo(x + 2, y + 11.4, x - 2.4, y + 10.2); c.closePath(); }, 1.4); F(c, '#e8707a', c => E(c, x + 2.4, y + 12.6, 2, 0.9)); }
}
/* a jeogori sleeve: widens toward the cuff, shaded on the back side */
function sleeve2(c, o) {
  const len = o.len || 18, w0 = 6, w1 = o.wide || 7.6;
  const path = c => { c.moveTo(-w0, -3); c.quadraticCurveTo(-w1 - 1.5, len * 0.55, -w1 + 0.5, len); c.lineTo(w1 + 0.6, len); c.quadraticCurveTo(w1 + 0.6, len * 0.4, w0 + 0.4, -3); c.closePath(); };
  P2(c, o.color, path, 2.2);
  if (o.stripes) clipDo(c, path, c => o.stripes.forEach((col, k) => { c.fillStyle = col; c.fillRect(-w1 - 2, len - 3 - (o.stripes.length - k) * 3, w1 * 2 + 4, 3); }));
  cel(c, path, -w1, w1 + 1);
  if (o.cuff) P2(c, o.cuff, c => RR(c, -w1 + 0.5, len - 2.4, w1 * 2, 3.6, 1.6), 1.2);
  if (o.hansam) {
    const hp = c => { c.moveTo(-w1 + 1, len + 0.6); c.quadraticCurveTo(-w1 - 3, len + 13, -w1 + 1, len + 26); c.quadraticCurveTo(0, len + 30.5, w1 + 0.6, len + 26); c.quadraticCurveTo(w1 + 3.4, len + 12, w1 + 0.6, len + 0.6); c.closePath(); };
    P2(c, '#fbf8f1', hp, 1.8); cel(c, hp, -w1 - 3, w1 + 3, 'rgba(90,80,110,.22)', 'rgba(255,255,255,.4)');
    L(c, 'rgba(120,110,130,.35)', 1, c => { c.moveTo(-2, len + 6); c.quadraticCurveTo(-3, len + 16, -1, len + 25); c.moveTo(3, len + 6); c.quadraticCurveTo(4, len + 16, 3, len + 25); });
  } else if (!o.noHand) {
    const hg = c.createRadialGradient(1.6, len + 2.4, 0.5, 0.4, len + 3.4, 5);
    hg.addColorStop(0, '#fbe0c4'); hg.addColorStop(1, o.skin || '#e8b28c');
    P2(c, hg, c => Cc(c, 0.4, len + 3.6, 4.3), 1.8);
  }
  if (o.prop) o.prop(c, len + 3.6);
}
function straw(c, x, y, w, h) { L(c, 'rgba(120,84,30,.55)', 1, c => { for (let k = 0; k <= w; k += 3) { c.moveTo(x + k, y); c.lineTo(x + k + 1.4, y + h); } }); }

/* ---------- 초랭이: the cheeky servant mask ---------- */
function choraengiMask(c) {
  const x = HC[0], y = HC[1] + 1;
  P2(c, '#1c1414', c => { c.moveTo(x - 20, y - 8); c.quadraticCurveTo(x - 24, y + 4, x - 19, y + 12); c.lineTo(x - 14, y + 4); c.lineTo(x + 15, y + 4); c.lineTo(x + 19, y + 12); c.quadraticCurveTo(x + 24, y + 2, x + 20, y - 10); c.closePath(); }, 1.4);
  const face = c => { c.moveTo(x + 2, y + 24); c.bezierCurveTo(x - 9, y + 23, x - 19, y + 13, x - 20, y); c.bezierCurveTo(x - 21, y - 15, x - 12, y - 23, x + 1, y - 23); c.bezierCurveTo(x + 14, y - 23, x + 22, y - 15, x + 21, y); c.bezierCurveTo(x + 20, y + 13, x + 12, y + 23, x + 2, y + 24); c.closePath(); };
  P2(c, lin(c, x - 12, y - 24, x + 10, y + 22, [[0, '#e4a064'], [0.5, '#c4743c'], [1, '#93501f']]), face, 2.3);
  clipDo(c, face, c => {
    L(c, 'rgba(110,50,15,.18)', 0.9, c => { for (let k = -3; k <= 3; k++) { c.moveTo(x + k * 5.5 - 2, y - 24); c.quadraticCurveTo(x + k * 6.4, y, x + k * 5.5 + 2, y + 25); } });
    F(c, 'rgba(255,226,180,.38)', c => E(c, x + 4, y - 14, 11, 5.6, -0.15));
    F(c, 'rgba(90,30,10,.24)', c => E(c, x - 19, y + 4, 7, 19));
  });
  L(c, 'rgba(80,30,10,.75)', 1.8, c => { c.moveTo(x - 15, y - 9); c.quadraticCurveTo(x - 9, y - 15.5, x - 2.6, y - 9.6); c.moveTo(x + 4.6, y - 9.6); c.quadraticCurveTo(x + 11, y - 16, x + 18, y - 9.4); });
  for (const [ex, ey] of [[x - 8, y - 1.4], [x + 10.5, y - 1.6]]) {
    P2(c, lin(c, 0, ey - 6, 0, ey + 6, [[0, '#f0b678'], [1, '#c47a40']]), c => Cc(c, ex, ey, 5.6), 1.6);
    F(c, '#160a04', c => Cc(c, ex + 0.5, ey + 0.3, 2.9));
    F(c, '#fff', c => Cc(c, ex + 1.4, ey - 0.8, 0.9));
    L(c, 'rgba(80,30,10,.5)', 1, c => { c.moveTo(ex - 6.4, ey + 3); c.quadraticCurveTo(ex - 4, ey + 6.6, ex, ey + 6.4); });
  }
  P2(c, '#d08848', c => { c.moveTo(x + 1.4, y - 1); c.quadraticCurveTo(x + 7.4, y + 5, x + 4.6, y + 7.4); c.quadraticCurveTo(x + 1, y + 8.6, x - 0.6, y + 6); c.closePath(); }, 1.3);
  F(c, '#5a2a10', c => { Cc(c, x + 0.8, y + 6.6, 0.9); Cc(c, x + 4.2, y + 6.8, 0.9); });
  P2(c, '#dc8a50', c => E(c, x + 3, y + 14, 6.2, 5), 1.8);
  F(c, '#2a0a04', c => E(c, x + 3.4, y + 14.4, 3.2, 2.5));
  F(c, 'rgba(255,220,180,.6)', c => E(c, x + 1.6, y + 11.3, 3, 0.9));
  L(c, 'rgba(80,30,10,.55)', 1.1, c => { c.moveTo(x - 7, y + 8); c.quadraticCurveTo(x - 4, y + 13, x - 3, y + 17); c.moveTo(x + 12.6, y + 8); c.quadraticCurveTo(x + 10, y + 13, x + 9.6, y + 17); });
  F(c, 'rgba(232,96,60,.33)', c => { E(c, x - 13, y + 7, 3.6, 2.4); E(c, x + 16, y + 7, 3.6, 2.4); });
}
function paeraengi2(c) {
  const x = HC[0], y = HC[1];
  P2(c, lin(c, x - 32, 0, x + 32, 0, [[0, '#b8954e'], [0.5, '#e2c27a'], [1, '#c9a560']]), c => E(c, x, y - 16, 32, 6.4));
  straw(c, x - 28, y - 19, 56, 5);
  P2(c, lin(c, x - 13, 0, x + 13, 0, [[0, '#b8954e'], [0.6, '#e8c984'], [1, '#c9a560']]), c => { c.moveTo(x - 13, y - 17); c.lineTo(x - 10, y - 33); c.quadraticCurveTo(x, y - 36.5, x + 10, y - 33); c.lineTo(x + 13, y - 17); c.closePath(); });
  straw(c, x - 11, y - 33, 22, 15);
  P2(c, '#2a2018', c => { c.moveTo(x - 12.6, y - 21.5); c.lineTo(x + 12.6, y - 21.5); c.lineTo(x + 12.2, y - 25.5); c.lineTo(x - 12.2, y - 25.5); c.closePath(); }, 1);
}
function choraengiBody(c) {
  for (const sx of [-7, 8]) { P2(c, '#d9c08a', c => E(c, sx, -1.6, 6.6, 3.2), 1.8); L(c, 'rgba(110,80,30,.6)', 0.9, c => { c.moveTo(sx - 4, -2.6); c.lineTo(sx + 4, -0.6); c.moveTo(sx - 4, -0.6); c.lineTo(sx + 4, -2.6); }); }
  const legs = c => { c.moveTo(-12, -24); c.quadraticCurveTo(-19, -13, -13, -4); c.lineTo(-2, -4); c.lineTo(0, -15); c.lineTo(2, -4); c.lineTo(13, -4); c.quadraticCurveTo(19, -13, 12, -24); c.closePath(); };
  P2(c, '#f4efe3', legs); cel(c, legs, -18, 18, 'rgba(70,70,110,.22)');
  for (const sx of [-7.5, 7.5]) { P2(c, '#c9c1b0', c => RR(c, sx - 5.4, -10, 10.8, 6.4, 2), 1.4); L(c, '#7a2a20', 1.6, c => { c.moveTo(sx - 5, -8); c.lineTo(sx + 5, -6); }); }
  const jk = c => { c.moveTo(-12, -45); c.quadraticCurveTo(-16, -34, -15, -22); c.quadraticCurveTo(0, -18.5, 15, -22); c.quadraticCurveTo(16, -34, 12, -45); c.quadraticCurveTo(0, -49, -12, -45); c.closePath(); };
  P2(c, lin(c, 0, -48, 0, -20, [[0, '#4d6fc0'], [1, '#2f4c94']]), jk); cel(c, jk, -16, 16);
  P2(c, '#f8f4ec', c => { c.moveTo(-5, -46); c.lineTo(3, -33); c.lineTo(9.5, -46); c.lineTo(7, -46); c.lineTo(3, -37); c.lineTo(-2, -46); c.closePath(); }, 1.4);
  P2(c, '#e0563c', c => RR(c, -15.5, -26, 31, 5, 2.4), 1.6);
  P2(c, '#e0563c', c => { c.moveTo(-13, -22); c.lineTo(-17, -10); c.lineTo(-12.5, -9.5); c.lineTo(-10, -21); c.closePath(); c.moveTo(-9.5, -22); c.lineTo(-11, -12); c.lineTo(-7.5, -12); c.lineTo(-7, -21); c.closePath(); }, 1.4);
  F(c, 'rgba(255,240,200,.35)', c => RR(c, -14, -25.4, 28, 1.6, 0.8));
}
Object.assign(PUP, {
  choraengi: H({ size: 0.92, boxes: { head: [-48, -132, 56, -30] },
    body: c => choraengiBody(c),
    head: c => { choraengiMask(c); paeraengi2(c); },
    armB: c => sleeve2(c, { color: '#3f5fae', cuff: '#f4efe3' }), armF: c => sleeve2(c, { color: '#3f5fae', cuff: '#f4efe3', prop: PROP.stone }),
    idle: { tempo: 2.4, bob: 6, sway: 0.08, aF: [0.9, 0.8], aB: [1.0, 0.8] }, atk: 'throw' }),
});

/* ---------- 각시: the bride mask in a green wonsam ---------- */
function gaksiBack(c) {
  const x = HC[0], y = HC[1];
  P2(c, '#141018', c => E(c, x - 3, y + 1, 22.5, 25));
  P2(c, '#c8302a', c => { c.moveTo(x - 20, y + 10); c.quadraticCurveTo(x - 26, y + 34, x - 22, y + 58); c.lineTo(x - 15, y + 58); c.quadraticCurveTo(x - 17, y + 34, x - 13, y + 12); c.closePath(); }, 1.6);
  F(c, '#f0c43a', c => { for (let k = 0; k < 4; k++) Cc(c, x - 18.6 - k * 0.6, y + 24 + k * 9, 1.1); });
}
function gaksiMask(c) {
  const x = HC[0], y = HC[1] + 1;
  P2(c, '#141018', c => { c.moveTo(x - 21, y + 8); c.bezierCurveTo(x - 25, y - 20, x - 9, y - 26, x + 1, y - 26); c.bezierCurveTo(x + 12, y - 26, x + 26, y - 20, x + 21, y + 8); c.bezierCurveTo(x + 17, y - 8, x + 9, y - 13, x + 1, y - 13); c.bezierCurveTo(x - 8, y - 13, x - 16, y - 8, x - 21, y + 8); c.closePath(); });
  const face = c => E(c, x + 0.6, y + 2.4, 16.5, 20.5);
  P2(c, lin(c, x - 16, y - 18, x + 16, y + 22, [[0, '#fffaf2'], [0.6, '#f6ece0'], [1, '#e6d2c0']]), face, 2.2);
  clipDo(c, face, c => { F(c, 'rgba(120,90,110,.16)', c => E(c, x - 15, y + 4, 6.5, 20)); F(c, 'rgba(255,255,255,.55)', c => E(c, x + 5, y - 9, 6, 3.4, -0.3)); });
  F(c, '#141018', c => { c.moveTo(x - 9, y - 10); c.quadraticCurveTo(x + 1, y - 17, x + 11, y - 10); c.quadraticCurveTo(x + 1, y - 13.5, x - 9, y - 10); });
  L(c, 'rgba(42,29,36,.55)', 1.1, c => { c.moveTo(x - 11, y - 3.6); c.quadraticCurveTo(x - 7, y - 5.6, x - 3, y - 3.8); c.moveTo(x + 5, y - 3.8); c.quadraticCurveTo(x + 9, y - 5.8, x + 13, y - 3.6); });
  L(c, '#2a1d24', 2, c => { c.moveTo(x - 10, y + 1.4); c.quadraticCurveTo(x - 6.5, y + 3.6, x - 3, y + 1.4); c.moveTo(x + 5, y + 1.4); c.quadraticCurveTo(x + 8.5, y + 3.6, x + 12, y + 1.4); });
  L(c, 'rgba(140,100,90,.5)', 1.1, c => { c.moveTo(x + 1.6, y + 3.6); c.quadraticCurveTo(x + 3, y + 7, x + 1, y + 8); });
  P2(c, '#d8443c', c => { Cc(c, x - 9, y + 9.5, 3.1); Cc(c, x + 11, y + 9.5, 3.1); Cc(c, x + 1, y - 7.2, 2.1); }, 0.8);
  P2(c, '#c3322c', c => { c.moveTo(x - 2, y + 13.4); c.quadraticCurveTo(x + 1, y + 11.6, x + 4, y + 13.4); c.quadraticCurveTo(x + 1, y + 16, x - 2, y + 13.4); c.closePath(); }, 1);
}
function jokduri2(c) {
  const x = HC[0], y = HC[1];
  P2(c, '#1a1424', c => { c.moveTo(x - 11, y - 22); c.lineTo(x + 12, y - 22); c.lineTo(x + 9.5, y - 34); c.lineTo(x - 8.5, y - 34); c.closePath(); }, 1.8);
  P2(c, '#e8b84a', c => RR(c, x - 11.5, y - 24.4, 23.5, 3.2, 1.4), 1.2);
  L(c, '#e8b84a', 1.3, c => { c.moveTo(x - 8, y - 33.5); c.lineTo(x - 9.6, y - 24); c.moveTo(x + 9, y - 33.5); c.lineTo(x + 10.6, y - 24); c.moveTo(x + 0.5, y - 34); c.lineTo(x + 0.5, y - 24.5); });
  for (const [px, py, col] of [[x + 0.5, y - 29, '#d4473b'], [x - 5, y - 29, '#2f7ad8'], [x + 6, y - 29, '#3fae6a']]) { P2(c, col, c => Cc(c, px, py, 2.1), 1); F(c, 'rgba(255,255,255,.7)', c => Cc(c, px + 0.6, py - 0.6, 0.6)); }
  P2(c, '#f0c43a', c => Cc(c, x + 0.5, y - 37, 3), 1.2); F(c, '#d4473b', c => Cc(c, x + 0.5, y - 37, 1.4));
  for (const sx of [-1, 1]) {
    L(c, '#e8b84a', 1, c => { c.moveTo(x + 0.5 + sx * 11, y - 24); c.lineTo(x + 0.5 + sx * 13, y - 15); });
    F(c, '#f2d36b', c => { Cc(c, x + 0.5 + sx * 13, y - 14.2, 1.6); });
    F(c, sx < 0 ? '#2f7ad8' : '#d4473b', c => Cc(c, x + 0.5 + sx * 13.2, y - 11.6, 1.2));
  }
}
function gaksiBody(c) {
  P2(c, '#1f1a17', c => { E(c, -6, -1, 6, 3); E(c, 8, -1, 6, 3); }, 1.8);
  const sk = c => { c.moveTo(-11, -33); c.bezierCurveTo(-18, -22, -25, -8, -24.5, -1); c.quadraticCurveTo(0, 4.5, 24.5, -1); c.bezierCurveTo(25, -8, 18, -22, 11, -33); c.closePath(); };
  P2(c, lin(c, 0, -34, 0, 2, [[0, '#e04a50'], [1, '#b8283a']]), sk); cel(c, sk, -25, 25);
  clipDo(c, sk, c => {
    L(c, 'rgba(90,10,30,.32)', 1.3, c => { for (const k of [-15, -8, -1, 6, 13, 19]) { c.moveTo(k * 0.45, -31); c.quadraticCurveTo(k * 0.8, -16, k * 1.1, 2); } });
    c.fillStyle = lin(c, 0, -9, 0, -3, [[0, '#f2cf62'], [1, '#c99a30']]); c.fillRect(-26, -9.5, 52, 6);
    F(c, '#b8283a', c => { for (let k = -22; k <= 22; k += 6) { c.moveTo(k, -8.4); c.lineTo(k + 2.2, -6.5); c.lineTo(k, -4.6); c.lineTo(k - 2.2, -6.5); c.closePath(); } });
  });
  const ws = c => { c.moveTo(-13, -46); c.quadraticCurveTo(-17, -36, -18, -22); c.quadraticCurveTo(-8, -18.5, 0, -24); c.quadraticCurveTo(8, -18.5, 18, -22); c.quadraticCurveTo(17, -36, 13, -46); c.quadraticCurveTo(0, -50, -13, -46); c.closePath(); };
  P2(c, lin(c, 0, -49, 0, -20, [[0, '#3f9a6a'], [1, '#22704a']]), ws); cel(c, ws, -18, 18);
  clipDo(c, ws, c => { for (const [px, py] of [[-9, -38], [6, -40], [-3, -29], [10, -30], [-12, -26]]) { P2(c, 'rgba(242,207,98,.85)', c => Cc(c, px, py, 2.4), 0); L(c, '#22704a', 0.8, c => Cc(c, px, py, 1.2)); } });
  P2(c, '#fbf8f1', c => { c.moveTo(-5, -47); c.lineTo(2.6, -35); c.lineTo(9.6, -47); c.lineTo(7, -47); c.lineTo(2.6, -39); c.lineTo(-2.2, -47); c.closePath(); }, 1.2);
  P2(c, '#c8302a', c => RR(c, -14, -29, 28, 4.4, 2), 1.4);
  P2(c, '#d4473b', c => { c.moveTo(4, -27); c.quadraticCurveTo(1, -17, -1, -9); c.lineTo(3, -9); c.quadraticCurveTo(5, -18, 6.4, -26); c.closePath(); }, 1.2);
  P2(c, '#f0c43a', c => Cc(c, 9, -22, 2.2), 1);
  L(c, '#2f6ad8', 1.6, c => { c.moveTo(9, -20); c.lineTo(9.4, -10); c.moveTo(8, -20); c.lineTo(7.4, -11); c.moveTo(10, -20); c.lineTo(11.2, -11); });
}
Object.assign(PUP, {
  gaksi: H({ size: 0.98, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-34, -100, 30, 0], head: [-48, -132, 56, -30] },
    back: c => gaksiBack(c),
    body: c => gaksiBody(c),
    head: c => { gaksiMask(c); jokduri2(c); },
    armB: c => sleeve2(c, { color: '#2f8a5c', wide: 8.6, stripes: ['#d63b2e', '#f0c43a', '#2f6ad8', '#f4f0e6', '#d63b9a'], hansam: true }),
    armF: c => sleeve2(c, { color: '#2f8a5c', wide: 8.6, stripes: ['#d63b2e', '#f0c43a', '#2f6ad8', '#f4f0e6', '#d63b9a'], hansam: true }),
    idle: { tempo: 0.6, bob: 0.8, sway: 0.03, aF: [0.9, 0.12], aB: [0.9, 0.12], head: 0.14 }, atk: 'raise' }),
});

/* ---------- 이순신: studded armour, red war cloak, the great sword ---------- */
PROP.greatsword = (c, h) => {
  L(c, INK, 5.4, c => { c.moveTo(0, h - 4); c.lineTo(1, h + 7); }); L(c, '#3a2214', 3.6, c => { c.moveTo(0, h - 4); c.lineTo(1, h + 7); });
  L(c, '#e8b84a', 1.2, c => { for (let k = 0; k < 4; k++) { c.moveTo(-1.6, h - 3 + k * 2.6); c.lineTo(2.4, h - 2 + k * 2.6); } });
  P2(c, lin(c, -6, 0, 8, 0, [[0, '#c99a40'], [1, '#f2d36b']]), c => E(c, 1, h + 7.5, 6.4, 2.2), 1.2);
  const bl = c => { c.moveTo(-1.4, h + 9); c.quadraticCurveTo(5, h + 30, 1, h + 54); c.lineTo(4.6, h + 52); c.quadraticCurveTo(9.6, h + 28, 3.4, h + 9); c.closePath(); };
  P2(c, lin(c, -2, 0, 9, 0, [[0, '#b8c0cc'], [0.5, '#f4f7fb'], [1, '#9aa4b2']]), bl, 1.4);
  L(c, 'rgba(255,255,255,.8)', 0.9, c => { c.moveTo(1.6, h + 12); c.quadraticCurveTo(6, h + 30, 2.8, h + 50); });
  P2(c, '#d63b2e', c => { c.moveTo(-1, h + 7); c.quadraticCurveTo(-8, h + 12, -6, h + 22); c.lineTo(-3.6, h + 21); c.quadraticCurveTo(-5, h + 13, 0, h + 9); c.closePath(); }, 1);
};
function tugu2(c) {
  const x = HC[0], y = HC[1];
  for (const s of [-1, 1]) {
    const fl = c => { c.moveTo(x + s * 19, y - 9); c.quadraticCurveTo(x + s * 26, y + 8, x + s * 21, y + 22); c.lineTo(x + s * 12, y + 20); c.lineTo(x + s * 12.6, y - 4); c.closePath(); };
    P2(c, lin(c, x + s * 12, 0, x + s * 24, 0, [[0, '#22306a'], [1, '#33449a']]), fl, 1.8);
    F(c, '#f2d888', c => { for (let k = 0; k < 4; k++) Cc(c, x + s * (17.5 + k * 0.3), y + k * 5.4, 1.05); });
  }
  const dome = c => { c.moveTo(x - 20, y - 9); c.quadraticCurveTo(x - 21.5, y - 35, x, y - 37); c.quadraticCurveTo(x + 21.5, y - 35, x + 20, y - 9); c.quadraticCurveTo(x, y - 14, x - 20, y - 9); c.closePath(); };
  P2(c, lin(c, x - 20, y - 36, x + 20, y - 10, [[0, '#8a7a5a'], [0.5, '#5a4e3a'], [1, '#2e281e']]), dome, 2.2);
  clipDo(c, dome, c => { F(c, 'rgba(255,240,200,.35)', c => E(c, x + 7, y - 28, 6, 4, -0.5)); L(c, '#e8c45a', 2, c => { c.moveTo(x, y - 37); c.lineTo(x, y - 12); c.moveTo(x - 11, y - 33); c.quadraticCurveTo(x - 9, y - 22, x - 8, y - 11); c.moveTo(x + 11, y - 33); c.quadraticCurveTo(x + 9, y - 22, x + 8, y - 11); }); });
  P2(c, lin(c, 0, y - 15, 0, y - 6, [[0, '#f6d77a'], [1, '#b8862a']]), c => { c.moveTo(x - 22, y - 10); c.quadraticCurveTo(x, y - 17, x + 22, y - 10); c.lineTo(x + 22, y - 5.5); c.quadraticCurveTo(x, y - 12, x - 22, y - 5.5); c.closePath(); }, 1.6);
  P2(c, '#c9a040', c => { c.moveTo(x + 3, y - 12); c.lineTo(x + 9, y - 2); c.lineTo(x + 4, y - 3); c.closePath(); }, 1.2);
  P2(c, '#e8c45a', c => { c.moveTo(x - 2.6, y - 36); c.lineTo(x, y - 54); c.lineTo(x + 2.6, y - 36); c.closePath(); }, 1.2);
  P2(c, '#e8c45a', c => Cc(c, x, y - 38.5, 3.2), 1.2);
  P2(c, '#d63b2e', c => { c.moveTo(x, y - 47); c.quadraticCurveTo(x - 9, y - 49, x - 14, y - 41); c.quadraticCurveTo(x - 7, y - 43, x - 1, y - 42); c.quadraticCurveTo(x - 10, y - 39, x - 12, y - 31); c.quadraticCurveTo(x - 5, y - 38, x + 1, y - 40); c.closePath(); }, 1.2);
  P2(c, '#fbf8f1', c => { c.moveTo(x + 1, y - 53); c.quadraticCurveTo(x - 2, y - 66, x - 14, y - 70); c.quadraticCurveTo(x - 5, y - 62, x - 3, y - 52); c.closePath(); }, 1.4);
}
function generalFace(c) {
  face2(c, { stern: true, mouth: 'stern', skin: '#f0c69e', iris: '#4a2a16' });
  const x = HC[0], y = HC[1] + 1;
  P2(c, '#1a120e', c => { c.moveTo(x - 4, y + 9.6); c.quadraticCurveTo(x + 2, y + 7, x + 9, y + 9.4); c.quadraticCurveTo(x + 12, y + 11.4, x + 14, y + 13); c.quadraticCurveTo(x + 9, y + 11, x + 2.4, y + 10.6); c.quadraticCurveTo(x - 4, y + 11.6, x - 7, y + 13.6); c.quadraticCurveTo(x - 6, y + 10.8, x - 4, y + 9.6); c.closePath(); }, 0.8);
  const bd = c => { c.moveTo(x - 6, y + 14); c.quadraticCurveTo(x - 4, y + 30, x + 2, y + 37); c.quadraticCurveTo(x + 7, y + 30, x + 10, y + 14); c.quadraticCurveTo(x + 2, y + 17, x - 6, y + 14); c.closePath(); };
  P2(c, lin(c, 0, y + 14, 0, y + 37, [[0, '#2a1e18'], [1, '#120c08']]), bd, 1.2);
  L(c, 'rgba(255,255,255,.18)', 0.9, c => { c.moveTo(x + 1, y + 17); c.quadraticCurveTo(x + 2, y + 27, x + 2, y + 34); c.moveTo(x + 5, y + 17); c.quadraticCurveTo(x + 5.6, y + 25, x + 4, y + 31); });
}
function generalBody(c) {
  P2(c, '#1a1414', c => { RR(c, -13, -12, 10, 12, 3); RR(c, 3, -12, 10, 12, 3); }, 1.8);
  P2(c, '#1a1414', c => { E(c, -7, -1.5, 7, 3.2); E(c, 9, -1.5, 7, 3.2); }, 1.8);
  const coat = c => { c.moveTo(-13, -45); c.bezierCurveTo(-16, -30, -23, -18, -22, -9); c.lineTo(-2, -11); c.lineTo(1, -19); c.lineTo(4, -11); c.lineTo(22, -9); c.bezierCurveTo(23, -18, 16, -30, 13, -45); c.quadraticCurveTo(0, -49, -13, -45); c.closePath(); };
  P2(c, lin(c, 0, -48, 0, -9, [[0, '#b0302a'], [1, '#7a1a16']]), coat, 2.4);
  clipDo(c, coat, c => {
    F(c, '#f2d888', c => { for (let r = 0; r < 6; r++) for (let k = 0; k < 7; k++) { const yy = -42 + r * 5.6, sp = 1 + r * 0.08, xx = (-14 + k * 4.8 + (r % 2) * 2.4) * sp; Cc(c, xx, yy, 0.95); } });
    F(c, 'rgba(255,255,255,.6)', c => { for (let r = 0; r < 6; r++) for (let k = 0; k < 7; k++) { const yy = -42 + r * 5.6, sp = 1 + r * 0.08, xx = (-14 + k * 4.8 + (r % 2) * 2.4) * sp; Cc(c, xx - 0.3, yy - 0.3, 0.35); } });
  });
  cel(c, coat, -22, 22);
  L(c, '#e8c45a', 2.6, c => { c.moveTo(-22, -9.5); c.lineTo(-2, -11.5); c.moveTo(4, -11.5); c.lineTo(22, -9.5); c.moveTo(0, -46); c.lineTo(1, -19); });
  P2(c, lin(c, 0, -32, 0, -26, [[0, '#2a3a7a'], [1, '#1a2450']]), c => RR(c, -15.5, -32, 31, 6, 3), 1.8);
  P2(c, '#f0c43a', c => RR(c, -3, -32.6, 7, 7.2, 1.6), 1.2);
  for (const s of [-1, 1]) {
    const sh = c => { c.moveTo(s * 5, -47); c.quadraticCurveTo(s * 18, -49, s * 20, -40); c.quadraticCurveTo(s * 15, -37, s * 7, -40); c.closePath(); };
    P2(c, lin(c, 0, -49, 0, -37, [[0, '#d8b45a'], [1, '#9a7428']]), sh, 1.6);
    L(c, 'rgba(90,60,10,.6)', 0.9, c => { c.moveTo(s * 9, -45.6); c.quadraticCurveTo(s * 15, -46.6, s * 18, -42); });
  }
}
Object.assign(PUP, {
  yisunsin: H({ size: 1.12, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-46, -62, 20, 4], head: [-48, -140, 56, -18], armF: [-30, -12, 40, 80] },
    back: c => { const cp = c => { c.moveTo(-8, -46); c.quadraticCurveTo(-34, -30, -40, -1); c.quadraticCurveTo(-30, -6, -24, 0); c.quadraticCurveTo(-18, -4, -12, 1); c.quadraticCurveTo(-8, -24, 4, -44); c.closePath(); }; P2(c, lin(c, -40, 0, 4, 0, [[0, '#7a1612'], [1, '#c8342a']]), cp, 2); L(c, 'rgba(60,8,8,.45)', 1.2, c => { c.moveTo(-14, -38); c.quadraticCurveTo(-24, -22, -26, -3); c.moveTo(-8, -36); c.quadraticCurveTo(-14, -20, -15, -1); }); },
    body: c => generalBody(c),
    head: c => { generalFace(c); tugu2(c); },
    armB: c => sleeve2(c, { color: '#9a2420', cuff: '#e8c45a' }), armF: c => sleeve2(c, { color: '#9a2420', cuff: '#e8c45a', prop: PROP.greatsword }),
    idle: { tempo: 0.8, bob: 1.5, sway: 0.03, aF: [0.45, 0.12], aB: [0.35, 0.1], head: -0.04 }, atk: 'point' }),
});

/* ---------- 바리공주: the princess who guides the dead ---------- */
function bariBack(c) {
  const x = HC[0], y = HC[1];
  F(c, 'rgba(255,226,150,.22)', c => Cc(c, x - 2, y + 4, 34));
  L(c, 'rgba(255,226,150,.45)', 1.6, c => Cc(c, x - 2, y + 4, 30));
  P2(c, '#141018', c => { c.moveTo(x - 20, y - 6); c.quadraticCurveTo(x - 28, y + 30, x - 22, y + 62); c.lineTo(x - 6, y + 60); c.quadraticCurveTo(x - 6, y + 30, x + 4, y + 6); c.closePath(); });
  L(c, 'rgba(120,110,160,.35)', 1, c => { c.moveTo(x - 18, y + 8); c.quadraticCurveTo(x - 22, y + 34, x - 18, y + 58); c.moveTo(x - 12, y + 10); c.quadraticCurveTo(x - 14, y + 34, x - 11, y + 58); });
  const cols = ['#2f6ad8', '#d63b2e', '#f0c43a', '#f4f0e6', '#2a2420'];
  cols.forEach((col, k) => L(c, col, 2.6, c => { c.moveTo(x + 8, y + 22 + k * 2.4); c.bezierCurveTo(x - 20, y + 4 + k * 3, x - 36, y + 30 + k * 2, x - 30, y + 56 + k * 2.4); }));
}
function bariCrown(c) {
  const x = HC[0], y = HC[1];
  P2(c, '#141018', c => { c.moveTo(x - 20, y + 7); c.bezierCurveTo(x - 24, y - 22, x - 8, y - 25, x + 1, y - 25); c.bezierCurveTo(x + 10, y - 25, x + 25, y - 22, x + 21, y + 7); c.bezierCurveTo(x + 16, y - 10, x + 9, y - 13.5, x + 1, y - 13.5); c.bezierCurveTo(x - 8, y - 13.5, x - 15, y - 10, x - 20, y + 7); c.closePath(); });
  L(c, 'rgba(140,130,190,.4)', 1, c => { c.moveTo(x - 12, y - 19); c.quadraticCurveTo(x + 1, y - 23, x + 14, y - 19); });
  const cr = c => { c.moveTo(x - 17, y - 17); c.lineTo(x - 14, y - 33); c.lineTo(x - 7, y - 26); c.lineTo(x + 1, y - 41); c.lineTo(x + 9, y - 26); c.lineTo(x + 16, y - 33); c.lineTo(x + 19, y - 17); c.quadraticCurveTo(x + 1, y - 22, x - 17, y - 17); c.closePath(); };
  P2(c, lin(c, x - 17, y - 40, x + 19, y - 17, [[0, '#ffe7a0'], [0.5, '#e8b84a'], [1, '#b8862a']]), cr, 1.8);
  clipDo(c, cr, c => { L(c, 'rgba(120,80,10,.5)', 1, c => { c.moveTo(x - 14, y - 22); c.quadraticCurveTo(x + 1, y - 26, x + 16, y - 22); }); });
  for (const [px, py, col, r] of [[x + 1, y - 30, '#d4473b', 2.8], [x - 9, y - 24, '#2f7ad8', 2], [x + 11, y - 24, '#3fae6a', 2], [x - 14, y - 31, '#f4f0e6', 1.6], [x + 16, y - 31, '#f4f0e6', 1.6]]) { P2(c, col, c => Cc(c, px, py, r), 1); F(c, 'rgba(255,255,255,.75)', c => Cc(c, px + r * 0.3, py - r * 0.3, r * 0.3)); }
  flower(c, x - 19, y - 14, 5.4, '#f07aa0'); flower(c, x + 21, y - 14, 5.4, '#f07aa0');
  for (const s of [-1, 1]) { L(c, '#e8b84a', 1, c => { c.moveTo(x + 1 + s * 18, y - 12); c.lineTo(x + 1 + s * 19.5, y - 2); }); F(c, '#f2d36b', c => Cc(c, x + 1 + s * 19.6, y - 1.2, 1.5)); F(c, '#d4473b', c => Cc(c, x + 1 + s * 19.8, y + 1.6, 1.1)); }
}
function bariBody(c) {
  P2(c, '#1f1a17', c => { E(c, -6, -1, 6, 3); E(c, 8, -1, 6, 3); }, 1.8);
  const sk = c => { c.moveTo(-11, -33); c.bezierCurveTo(-19, -22, -26, -8, -25.5, -1); c.quadraticCurveTo(0, 5, 25.5, -1); c.bezierCurveTo(26, -8, 19, -22, 11, -33); c.closePath(); };
  P2(c, lin(c, 0, -34, 0, 3, [[0, '#fdfbf6'], [1, '#e2dccf']]), sk); cel(c, sk, -26, 26, 'rgba(70,80,130,.24)', 'rgba(255,255,255,.5)');
  clipDo(c, sk, c => {
    L(c, 'rgba(110,120,160,.3)', 1.2, c => { for (const k of [-16, -9, -2, 5, 12, 19]) { c.moveTo(k * 0.45, -31); c.quadraticCurveTo(k * 0.8, -16, k * 1.12, 3); } });
    c.fillStyle = lin(c, 0, -8, 0, -2, [[0, '#4f7ae0'], [1, '#2a4ab0']]); c.fillRect(-27, -8.5, 54, 5.5);
    L(c, '#f2d36b', 1, c => { c.moveTo(-27, -8.4); c.lineTo(27, -8.4); c.moveTo(-27, -3.2); c.lineTo(27, -3.2); });
  });
  const jk = c => { c.moveTo(-12, -46); c.quadraticCurveTo(-15, -38, -14, -30); c.quadraticCurveTo(0, -27, 14, -30); c.quadraticCurveTo(15, -38, 12, -46); c.quadraticCurveTo(0, -50, -12, -46); c.closePath(); };
  P2(c, lin(c, 0, -49, 0, -28, [[0, '#d8443a'], [1, '#a8281e']]), jk); cel(c, jk, -15, 15);
  L(c, '#f2d36b', 1.4, c => { c.moveTo(-14, -31); c.quadraticCurveTo(0, -28, 14, -31); });
  P2(c, '#fbf8f1', c => { c.moveTo(-4.6, -47); c.lineTo(3, -36); c.lineTo(9.6, -47); c.lineTo(7, -47); c.lineTo(3, -39.6); c.lineTo(-2, -47); c.closePath(); }, 1.2);
  P2(c, '#2f5fb8', c => { c.moveTo(4, -36); c.quadraticCurveTo(0, -24, -2.5, -14); c.lineTo(1.5, -14); c.quadraticCurveTo(4.6, -24, 6.6, -35); c.moveTo(5.4, -36); c.quadraticCurveTo(11, -27, 11.4, -18); c.lineTo(14.6, -19); c.quadraticCurveTo(13, -28, 7.6, -36); }, 1.2);
  P2(c, '#f0c43a', c => Cc(c, 5.4, -36, 2.2), 1);
}
Object.assign(PUP, {
  bari: H({ size: 1.07, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-46, -110, 30, 4], head: [-48, -136, 56, -30] },
    back: c => bariBack(c),
    body: c => bariBody(c),
    head: c => { face2(c, { closed: true, lash: true, mouth: 'small' }); bariCrown(c); },
    armB: c => sleeve2(c, { color: '#c8342a', wide: 8, stripes: ['#f0c43a', '#2f6ad8', '#f4f0e6', '#3fae6a'], prop: PROP.obangFan }),
    armF: c => sleeve2(c, { color: '#c8342a', wide: 8, stripes: ['#f0c43a', '#2f6ad8', '#f4f0e6', '#3fae6a'], prop: PROP.bells }),
    idle: { tempo: 0.9, bob: 2, sway: 0.06, aF: [1.2, 0.5], aB: [1.0, 0.5] }, atk: 'raise' }),
});

