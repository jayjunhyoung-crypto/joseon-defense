/* ================= 2D art, part 4: 전래동화 characters ================= */
Object.assign(HAT, {
  kidHair(c) { // a boy's short hair with a little topknot ribbon
    const x = HC[0], y = HC[1];
    P(c, '#1b1512', c => { c.moveTo(x - 20, y + 2); c.quadraticCurveTo(x - 22, y - 22, x, y - 23); c.quadraticCurveTo(x + 22, y - 22, x + 20, y + 2); c.quadraticCurveTo(x + 13, y - 12, x, y - 12); c.quadraticCurveTo(x - 13, y - 12, x - 20, y + 2); c.closePath(); });
    P(c, '#1b1512', c => Cc(c, x, y - 25, 5.5));
    P(c, '#d63b2e', c => { c.moveTo(x - 3, y - 27); c.quadraticCurveTo(x - 12, y - 34, x - 14, y - 26); c.quadraticCurveTo(x - 8, y - 28, x - 3, y - 24); c.closePath(); }, 1.2);
  },
  girlBraid(c, ribbon = '#d63b2e') { // a long braid down the back with a 댕기 ribbon
    const x = HC[0], y = HC[1];
    P(c, '#17131a', c => { c.moveTo(x, y - 25); c.bezierCurveTo(x - 23, y - 25, x - 24, y - 4, x - 20, y + 6); c.bezierCurveTo(x - 15, y - 9, x - 8, y - 13, x, y - 13); c.bezierCurveTo(x + 8, y - 13, x + 15, y - 9, x + 20, y + 6); c.bezierCurveTo(x + 24, y - 4, x + 23, y - 25, x, y - 25); c.closePath(); });
    L(c, 'rgba(255,255,255,.18)', 1.4, c => { c.moveTo(x - 8, y - 21); c.quadraticCurveTo(x, y - 23, x + 8, y - 21); });
  },
  braidBack(c, ribbon = '#d63b2e') {
    const x = HC[0], y = HC[1];
    P(c, '#17131a', c => E(c, x - 2, y - 2, 21, 22));
    for (let k = 0; k < 4; k++) P(c, '#17131a', c => E(c, x - 16 - k * 1.5, y + 18 + k * 7, 4.6, 4.2), 1.6);
    P(c, ribbon, c => { c.moveTo(x - 22, y + 44); c.lineTo(x - 30, y + 60); c.lineTo(x - 22, y + 56); c.lineTo(x - 16, y + 62); c.lineTo(x - 15, y + 45); c.closePath(); }, 1.6);
  },
  whiteTopknot(c) { // an old man's white 상투 with a thin band
    const x = HC[0], y = HC[1];
    P(c, '#ece8e0', c => { c.moveTo(x - 19, y - 4); c.quadraticCurveTo(x - 20, y - 21, x, y - 22); c.quadraticCurveTo(x + 20, y - 21, x + 19, y - 4); c.quadraticCurveTo(x + 12, y - 13, x, y - 14); c.quadraticCurveTo(x - 12, y - 13, x - 19, y - 4); c.closePath(); });
    P(c, '#ece8e0', c => Cc(c, x, y - 27, 6));
    F(c, '#8a6a3a', c => c.rect(x - 7, y - 24, 14, 2.4));
  },
});
Object.assign(PROP, {
  gaxe(c, h) { // the golden axe
    L(c, OL, 4.4, c => { c.moveTo(0, h - 4); c.lineTo(3, h + 26); }); L(c, '#9a6a3a', 2.8, c => { c.moveTo(0, h - 4); c.lineTo(3, h + 26); });
    const g = c.createLinearGradient(-2, h + 14, 18, h + 34); g.addColorStop(0, '#fff2a8'); g.addColorStop(0.5, '#f2c43a'); g.addColorStop(1, '#b8861a');
    P(c, g, c => { c.moveTo(1, h + 16); c.lineTo(10, h + 13); c.quadraticCurveTo(20, h + 22, 16, h + 34); c.lineTo(3, h + 27); c.closePath(); }, 1.8);
    F(c, 'rgba(255,255,255,.65)', c => { c.moveTo(10, h + 16); c.quadraticCurveTo(16, h + 22, 14, h + 29); c.lineTo(12, h + 27); c.quadraticCurveTo(13, h + 22, 9, h + 17); c.closePath(); });
  },
  lotus(c, h) { // a pink lotus held up in the hand
    L(c, '#4a8a4a', 2.4, c => { c.moveTo(0, h); c.lineTo(1, h + 10); });
    for (let k = -2; k <= 2; k++) P(c, k % 2 ? '#ffb3cf' : '#ff8ab4', c => { const a = -PI / 2 + k * 0.42; c.moveTo(1, h - 1); c.quadraticCurveTo(1 + Math.cos(a - 0.35) * 9, h - 1 + Math.sin(a - 0.35) * 9, 1 + Math.cos(a) * 13, h - 1 + Math.sin(a) * 13); c.quadraticCurveTo(1 + Math.cos(a + 0.35) * 9, h - 1 + Math.sin(a + 0.35) * 9, 1, h - 1); c.closePath(); }, 1.2);
    F(c, '#ffe27a', c => Cc(c, 1, h - 3, 2.4));
  },
  sunFan(c, h) { // the boy holds a little red sun disc
    L(c, OL, 3, c => { c.moveTo(0, h); c.lineTo(1, h + 8); });
    P(c, '#e2402e', c => Cc(c, 1, h + 13, 6.4), 1.6); F(c, '#ffd36a', c => Cc(c, 1, h + 13, 3));
  },
});
function sunHalo(c) {
  const x = HC[0], y = HC[1] - 2;
  const g = c.createRadialGradient(x, y, 4, x, y, 34); g.addColorStop(0, 'rgba(255,230,140,.95)'); g.addColorStop(0.6, 'rgba(255,170,60,.85)'); g.addColorStop(1, 'rgba(255,120,40,0)');
  F(c, g, c => Cc(c, x, y, 34));
  L(c, '#f2a13a', 2.6, c => { for (let k = 0; k < 12; k++) { const a = k * TAU / 12; c.moveTo(x + Math.cos(a) * 26, y + Math.sin(a) * 26); c.lineTo(x + Math.cos(a) * 33, y + Math.sin(a) * 33); } });
  P(c, '#ffcf4a', c => Cc(c, x, y, 25), 2);
}
function moonHalo(c) {
  const x = HC[0], y = HC[1] - 2;
  const g = c.createRadialGradient(x, y, 4, x, y, 34); g.addColorStop(0, 'rgba(230,240,255,.9)'); g.addColorStop(0.6, 'rgba(150,180,255,.55)'); g.addColorStop(1, 'rgba(120,150,240,0)');
  F(c, g, c => Cc(c, x, y, 34));
  P(c, '#f4f0d8', c => { c.arc(x, y, 26, PI * 0.35, PI * 1.65, false); c.arc(x + 11, y - 3, 22, PI * 1.55, PI * 0.45, true); c.closePath(); }, 2);
  F(c, '#fffbe8', c => { Cc(c, x + 22, y - 20, 1.6); Cc(c, x + 27, y + 4, 1.2); });
}
function lotusBase(c) { // a big lotus the girl rose from, spread around her feet
  P(c, '#5a9a5a', c => E(c, 0, 0, 40, 6), 1.8);
  for (let k = -4; k <= 4; k++) P(c, k % 2 ? '#ffc2d8' : '#ff9cc0', c => { const a = -PI / 2 + k * 0.36, rx = 44, ry = 26; c.moveTo(0, -2); c.quadraticCurveTo(Math.cos(a - 0.28) * rx * 0.62, -2 + Math.sin(a - 0.28) * ry * 0.62, Math.cos(a) * rx, -2 + Math.sin(a) * ry); c.quadraticCurveTo(Math.cos(a + 0.28) * rx * 0.62, -2 + Math.sin(a + 0.28) * ry * 0.62, 0, -2); c.closePath(); }, 1.6);
}
Object.assign(PUP, {
  haedal_o: H({ size: 0.9, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-36, -110, 42, -24] },
    back: c => sunHalo(c),
    body: c => bajiBody(c, { waist: '#e2402e', tie: '#f0c43a', vest: '#e2402e' }),
    head: c => { face(c, { brows: true }); HAT.kidHair(c); },
    armB: c => arm(c, { color: '#f8f4ec', cuff: '#e2402e' }), armF: c => arm(c, { color: '#f8f4ec', cuff: '#e2402e', prop: PROP.sunFan }),
    idle: { tempo: 1.6, bob: 3.5, sway: 0.05, aF: [1.0, 0.4], aB: [0.6, 0.2] }, atk: 'raise' }),
  haedal_n: H({ size: 0.86, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-46, -110, 42, 0] },
    back: c => { moonHalo(c); HAT.braidBack(c, '#5a7ae0'); },
    body: c => skirtBody(c, { skirt: '#3a52a8', jacket: '#f4ecd2', goreum: '#5a7ae0', skirtBand: '#c8d4ff' }),
    head: c => { face(c, { mouth: 'small' }); HAT.girlBraid(c); },
    armB: c => arm(c, { color: '#f4ecd2', cuff: '#5a7ae0' }), armF: c => arm(c, { color: '#f4ecd2', cuff: '#5a7ae0' }),
    idle: { tempo: 1.2, bob: 2.5, sway: 0.05, aF: [0.9, 0.3], aB: [0.7, 0.2] }, atk: 'raise' }),
  haedal: { size: 1.0, order: ['dyn'], group: [['haedal_n', 0.5, -0.1], ['haedal_o', -0.5, 0.12]], groupK: 0.78, idle: { tempo: 1 }, atk: 'raise' },
  hokburi: H({ size: 1.0,
    body: c => robe(c, { color: '#e9e2d0', hem: '#a89a7c', belt: '#8a6a3a', tie: '#8a6a3a', top: 12, bot: 21, collar: '#f8f4ea' }),
    head: c => {
      face(c, { closed: true, skin: '#f0c49a' });
      const x = HC[0], y = HC[1] + 1;
      longBrows(c, '#f4f0e6');
      beardOn(c, '#f4f0e6', 22);
      P(c, '#f0c49a', c => Cc(c, x + 18, y + 8, 12.5), 2.2);
      F(c, 'rgba(232,110,90,.4)', c => E(c, x + 21, y + 11, 7, 5));
      F(c, 'rgba(255,255,255,.45)', c => E(c, x + 14, y + 3, 4, 2.4));
      HAT.whiteTopknot(c);
    },
    armB: c => arm(c, { color: '#e9e2d0', cuff: '#a89a7c' }), armF: c => arm(c, { color: '#e9e2d0', cuff: '#a89a7c', prop: PROP.fan }),
    idle: { tempo: 1.4, bob: 3, sway: 0.1, aF: [0.45, 0.35], aB: [0.9, 0.5], head: -0.06 }, atk: 'swing' }),
  namukkun: H({ size: 1.04, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-42, -100, 6, 4] },
    back: c => jige(c),
    body: c => plainBody(c, { top: '#c9b48a', pants: '#e6dcc2', patch: '#a8925e', rope: '#6b4a2e' }),
    head: c => { face(c, { brows: true }); HAT.headband(c); },
    armB: c => arm(c, { color: '#c9b48a' }), armF: c => arm(c, { color: '#c9b48a', prop: PROP.gaxe }),
    idle: { tempo: 1.2, bob: 2.5, sway: 0.05, aF: [0.7, 0.3], aB: [0.5, 0.2] }, atk: 'throw' }),
  simcheong: H({ size: 0.98, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-50, -110, 50, 8] },
    back: c => { lotusBase(c); HAT.braidBack(c, '#d63b2e'); },
    body: c => skirtBody(c, { skirt: '#f4eee0', jacket: '#ffd6e4', goreum: '#d63b4a', skirtBand: '#ffb3cf' }),
    head: c => { face(c, { mouth: 'small' }); HAT.girlBraid(c); },
    armB: c => arm(c, { color: '#ffd6e4', cuff: '#d63b4a' }), armF: c => arm(c, { color: '#ffd6e4', cuff: '#d63b4a', prop: PROP.lotus }),
    idle: { tempo: 0.8, bob: 1.5, sway: 0.04, aF: [1.0, 0.2], aB: [0.6, 0.15], head: 0.06 }, atk: 'raise' }),
});

