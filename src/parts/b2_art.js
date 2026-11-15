/* ================= 2D art, part 2: 장수 family, new guardians, stage foes and bosses ================= */
/* extra hats */
Object.assign(HAT, {
  jurip(c) { // red lacquered officer hat with egret plume and bead string
    const x = HC[0], y = HC[1];
    P(c, '#b3241f', c => E(c, x, y - 17, 31, 6));
    P(c, '#b3241f', c => { c.moveTo(x - 10, y - 19); c.lineTo(x - 9, y - 36); c.quadraticCurveTo(x, y - 39, x + 9, y - 36); c.lineTo(x + 10, y - 19); c.closePath(); });
    F(c, '#e8c45a', c => c.rect(x - 10, y - 23, 20, 3));
    P(c, '#fbf8f0', c => { c.moveTo(x - 6, y - 38); c.quadraticCurveTo(x - 20, y - 56, x - 30, y - 54); c.quadraticCurveTo(x - 18, y - 48, x - 3, y - 36); c.closePath(); }, 1.4);
    L(c, '#e8c45a', 1.6, c => { c.moveTo(x - 14, y - 14); c.quadraticCurveTo(x - 8, y + 18, x + 2, y + 26); c.quadraticCurveTo(x + 12, y + 18, x + 16, y - 14); });
    F(c, '#f0d070', c => { for (let k = 0; k < 7; k++) Cc(c, x - 10 + k * 3.2, y + 18 + Math.sin(k / 6 * PI) * 7, 1.5); });
  },
  tugu(c, o = {}) { // iron helmet with spike, red tassel and neck flaps
    const x = HC[0], y = HC[1], trim = o.trim || '#e8c45a', flap = o.flap || '#2a3a7a';
    P(c, flap, c => { c.moveTo(x - 21, y - 8); c.quadraticCurveTo(x - 25, y + 10, x - 20, y + 20); c.lineTo(x - 12, y + 18); c.lineTo(x - 13, y - 4); c.closePath(); c.moveTo(x + 21, y - 8); c.quadraticCurveTo(x + 25, y + 10, x + 21, y + 20); c.lineTo(x + 13, y + 18); c.lineTo(x + 14, y - 4); c.closePath(); }, 1.8);
    F(c, trim, c => { for (const s of [-1, 1]) for (let k = 0; k < 3; k++) Cc(c, x + s * 18, y + 1 + k * 6, 1.1); });
    const g = c.createLinearGradient(x - 20, y - 36, x + 20, y - 8); g.addColorStop(0, o.dome || '#5a5f6a'); g.addColorStop(1, '#22252c');
    P(c, g, c => { c.moveTo(x - 21, y - 9); c.quadraticCurveTo(x - 22, y - 34, x, y - 36); c.quadraticCurveTo(x + 22, y - 34, x + 21, y - 9); c.quadraticCurveTo(x, y - 14, x - 21, y - 9); c.closePath(); });
    P(c, trim, c => { c.moveTo(x - 22, y - 10); c.quadraticCurveTo(x, y - 16, x + 22, y - 10); c.lineTo(x + 22, y - 6); c.quadraticCurveTo(x, y - 12, x - 22, y - 6); c.closePath(); }, 1.4);
    L(c, trim, 1.8, c => { c.moveTo(x, y - 36); c.lineTo(x, y - 14); c.moveTo(x - 12, y - 31); c.lineTo(x - 9, y - 13); c.moveTo(x + 12, y - 31); c.lineTo(x + 9, y - 13); });
    P(c, trim, c => { c.moveTo(x - 2.4, y - 36); c.lineTo(x, y - 52); c.lineTo(x + 2.4, y - 36); c.closePath(); }, 1.2);
    P(c, o.plume || '#d63b2e', c => { c.moveTo(x, y - 46); c.quadraticCurveTo(x - 14, y - 50, x - 18, y - 40); c.quadraticCurveTo(x - 10, y - 44, x - 1, y - 41); c.quadraticCurveTo(x - 12, y - 40, x - 14, y - 32); c.quadraticCurveTo(x - 6, y - 40, x + 1, y - 40); c.closePath(); }, 1.2);
  },
  monkBand(c) { const x = HC[0], y = HC[1]; P(c, '#e9dcc0', c => { c.moveTo(x - 19, y - 9); c.quadraticCurveTo(x, y - 18, x + 19, y - 9); c.lineTo(x + 19, y - 5); c.quadraticCurveTo(x, y - 14, x - 19, y - 5); c.closePath(); }, 1.8); },
  bun(c) { // white hair in a chignon with binyeo
    const x = HC[0], y = HC[1];
    P(c, '#ece8e0', c => { c.moveTo(x - 20, y + 2); c.quadraticCurveTo(x - 22, y - 22, x, y - 23); c.quadraticCurveTo(x + 22, y - 22, x + 20, y + 2); c.quadraticCurveTo(x + 13, y - 13, x, y - 13); c.quadraticCurveTo(x - 13, y - 13, x - 20, y + 2); c.closePath(); });
    L(c, 'rgba(120,110,100,.45)', 1.2, c => { c.moveTo(x - 12, y - 18); c.quadraticCurveTo(x, y - 21, x + 12, y - 18); });
    P(c, '#ece8e0', c => E(c, x - 18, y - 6, 8, 7));
    L(c, OL, 4.4, c => { c.moveTo(x - 30, y - 9); c.lineTo(x - 6, y - 3); }); L(c, '#e8c45a', 2.6, c => { c.moveTo(x - 30, y - 9); c.lineTo(x - 6, y - 3); });
    F(c, '#5fb3c8', c => Cc(c, x - 31, y - 9, 2.6));
  },
  satgat(c) { // conical straw hat of a farmer
    const x = HC[0], y = HC[1];
    P(c, '#d8b872', c => { c.moveTo(x - 30, y - 10); c.quadraticCurveTo(x - 12, y - 24, x + 1, y - 40); c.quadraticCurveTo(x + 14, y - 24, x + 32, y - 10); c.quadraticCurveTo(x + 1, y - 4, x - 30, y - 10); c.closePath(); });
    L(c, 'rgba(120,86,30,.55)', 1.2, c => { for (let k = -3; k <= 3; k++) { c.moveTo(x + 1, y - 38); c.lineTo(x + k * 9, y - 8 - Math.abs(k) * 0.6); } });
    L(c, 'rgba(120,86,30,.5)', 1.1, c => { c.moveTo(x - 18, y - 17); c.quadraticCurveTo(x + 1, y - 22, x + 20, y - 17); });
    L(c, '#8a6a3a', 1.4, c => { c.moveTo(x - 12, y - 8); c.quadraticCurveTo(x - 10, y + 12, x + 1, y + 18); c.quadraticCurveTo(x + 12, y + 12, x + 14, y - 8); });
  },
  bobusang(c) { // straw paeraengi with the peddler's white cotton tufts
    HAT.paeraengi(c);
    const x = HC[0], y = HC[1];
    for (const s of [-1, 1]) { P(c, '#fbf8f0', c => { Cc(c, x + s * 13, y - 26, 5); Cc(c, x + s * 17, y - 22, 4.2); Cc(c, x + s * 10, y - 21, 4); }, 1.2); }
  },
  mudang(c) { // shaman's black jeollip with red tassel and a peacock feather
    const x = HC[0], y = HC[1];
    P(c, '#18171d', c => E(c, x, y - 15, 31, 6));
    P(c, '#18171d', c => { c.moveTo(x - 13, y - 17); c.quadraticCurveTo(x - 12, y - 34, x, y - 35); c.quadraticCurveTo(x + 12, y - 34, x + 13, y - 17); c.closePath(); });
    F(c, '#f0c43a', c => c.rect(x - 13, y - 22, 26, 3));
    L(c, OL, 3.4, c => { c.moveTo(x + 2, y - 33); c.quadraticCurveTo(x + 16, y - 44, x + 32, y - 46); }); L(c, '#3a8a7a', 2, c => { c.moveTo(x + 2, y - 33); c.quadraticCurveTo(x + 16, y - 44, x + 32, y - 46); });
    P(c, '#2a9a8a', c => E(c, x + 32, y - 46, 6, 4.4, -0.2), 1.2); P(c, '#2f5fb8', c => E(c, x + 32.5, y - 46, 3, 2.2, -0.2), 0); F(c, '#f0c43a', c => Cc(c, x + 32.8, y - 46, 1.1));
    P(c, '#d63b2e', c => { c.moveTo(x - 2, y - 35); c.quadraticCurveTo(x - 14, y - 34, x - 18, y - 22); c.quadraticCurveTo(x - 9, y - 29, x + 2, y - 33); }, 1.2);
    F(c, '#d63b2e', c => Cc(c, x, y - 36, 3));
    for (const [col, dx] of [['#d63b2e', -4], ['#f0c43a', 0], ['#2f5fb8', 4]]) L(c, col, 2.2, c => { c.moveTo(x - 14 + dx * 0.4, y - 13); c.quadraticCurveTo(x - 18 + dx, y + 4, x - 15 + dx, y + 22); });
  },
  childGokkal(c, x, y, s) { at(c, x, y, s, c => { P(c, '#f8f4ea', c => { c.moveTo(-14, 0); c.quadraticCurveTo(-7, -22, 1, -32); c.quadraticCurveTo(8, -21, 15, 0); c.quadraticCurveTo(0, -5, -14, 0); c.closePath(); }); flower(c, -5, -8, 5.5, '#e2558a'); flower(c, 7, -10, 5.5, '#f2c94a'); flower(c, 1, -19, 4.6, '#5a8ae0'); }); },
});
/* extra props (held at the hand, arm hangs along +y) */
Object.assign(PROP, {
  bamboo(c, h) { const dx = 0.5, dy = -0.866; L(c, OL, 4.4, c => { c.moveTo(-dx * 20, h - dy * 20); c.lineTo(dx * 52, h + dy * 52); }); L(c, '#c9b65a', 2.8, c => { c.moveTo(-dx * 20, h - dy * 20); c.lineTo(dx * 52, h + dy * 52); }); L(c, '#7a8a3a', 1.6, c => { for (const k of [-8, 8, 24, 40]) { c.moveTo(dx * k - dy * 2, h + dy * k + dx * 2); c.lineTo(dx * k + dy * 2, h + dy * k - dx * 2); } }); P(c, '#e6dc9a', c => { const x = dx * 52, y = h + dy * 52; c.moveTo(x - dy * 2.4, y + dx * 2.4); c.lineTo(x + dx * 12, y + dy * 12); c.lineTo(x + dy * 2.4, y - dx * 2.4); c.closePath(); }, 1.4); },
  bow(c, h) {
    L(c, OL, 4.6, c => { c.moveTo(-2, h - 20); c.bezierCurveTo(10, h - 10, 10, h + 10, -2, h + 20); });
    L(c, '#7a4a28', 3, c => { c.moveTo(-2, h - 20); c.bezierCurveTo(10, h - 10, 10, h + 10, -2, h + 20); });
    L(c, '#d63b2e', 2.4, c => { c.moveTo(4.6, h - 4); c.lineTo(4.6, h + 4); });
    L(c, 'rgba(250,245,230,.9)', 1, c => { c.moveTo(-2, h - 20); c.lineTo(-2, h + 20); });
  },
  club(c, h) { L(c, OL, 6.4, c => { c.moveTo(0, h - 4); c.lineTo(3, h + 26); }); L(c, '#8a5a32', 4.6, c => { c.moveTo(0, h - 4); c.lineTo(3, h + 26); }); P(c, '#8a5a32', c => { c.moveTo(-2, h + 14); c.lineTo(7, h + 13); c.lineTo(8, h + 30); c.lineTo(-1, h + 31); c.closePath(); }, 1.8); L(c, 'rgba(40,20,10,.5)', 1, c => { c.moveTo(1, h + 15); c.lineTo(2.6, h + 30); c.moveTo(4, h + 14); c.lineTo(5.6, h + 30); }); },
  staff(c, h) { L(c, OL, 5, c => { c.moveTo(0, h - 26); c.bezierCurveTo(-3, h - 10, 4, h + 6, 1, h + 30); }); L(c, '#9a6a3a', 3.2, c => { c.moveTo(0, h - 26); c.bezierCurveTo(-3, h - 10, 4, h + 6, 1, h + 30); }); P(c, '#9a6a3a', c => { E(c, 0, h - 29, 5, 4.4); }, 1.8); P(c, '#d9b25a', c => { E(c, 6, h - 18, 3.6, 4.6); }, 1.4); P(c, '#d9b25a', c => Cc(c, 6, h - 24, 2.4), 1.2); L(c, '#d63b2e', 1.4, c => { c.moveTo(1, h - 24); c.lineTo(6, h - 22); }); },
  hwando(c, h) { L(c, OL, 4.4, c => { c.moveTo(0, h - 3); c.lineTo(1, h + 6); }); L(c, '#3a2a1a', 3, c => { c.moveTo(0, h - 3); c.lineTo(1, h + 6); }); P(c, '#e6b84a', c => E(c, 1, h + 6, 5, 1.8), 1.2); P(c, '#e4e8ef', c => { c.moveTo(-1, h + 7); c.quadraticCurveTo(4, h + 24, 0, h + 40); c.lineTo(3, h + 38); c.quadraticCurveTo(7, h + 22, 3, h + 7); c.closePath(); }, 1.4); },
  flag(c, h) { L(c, OL, 3.6, c => { c.moveTo(0, h - 30); c.lineTo(1, h + 14); }); L(c, '#8a5a32', 2, c => { c.moveTo(0, h - 30); c.lineTo(1, h + 14); }); P(c, '#d63b2e', c => { c.moveTo(0, h - 30); c.lineTo(-24, h - 22); c.lineTo(0, h - 12); c.closePath(); }, 1.6); L(c, '#f0c43a', 1.6, c => { c.moveTo(-2, h - 28); c.lineTo(-18, h - 22); c.lineTo(-2, h - 15); }); P(c, '#f0c43a', c => Cc(c, 0, h - 31, 2), 1); },
  rock(c, h) { P(c, '#8d8a84', c => { c.moveTo(-5, h + 1); c.lineTo(5, h - 1); c.lineTo(8, h + 7); c.lineTo(3, h + 11); c.lineTo(-5, h + 9); c.closePath(); }, 1.8); F(c, 'rgba(255,255,255,.25)', c => E(c, 0, h + 3, 3, 1.6)); },
  sickle(c, h) { L(c, OL, 4.2, c => { c.moveTo(0, h - 2); c.lineTo(2, h + 14); }); L(c, '#9a6a3a', 2.6, c => { c.moveTo(0, h - 2); c.lineTo(2, h + 14); }); P(c, '#dfe3ea', c => { c.moveTo(1, h + 13); c.quadraticCurveTo(16, h + 12, 18, h + 24); c.quadraticCurveTo(12, h + 17, 3, h + 17); c.closePath(); }, 1.4); },
  sogoChild(c, h) { P(c, '#c23a2c', c => Cc(c, 1, h + 4, 5.4), 1.6); P(c, '#f4eedc', c => Cc(c, 1, h + 4, 3.6), 1); },
});
/* extra bodies */
function armorBody(c, o) {
  feet(c, '#1a1414', 7);
  P(c, o.pants || '#2a2420', c => { RR(c, -11, -16, 9, 15, 3); RR(c, 2, -16, 9, 15, 3); }, 2);
  P(c, o.color, c => { c.moveTo(-13, -45); c.bezierCurveTo(-16, -30, -22, -18, -21, -10); c.lineTo(-2, -12); c.lineTo(1, -20); c.lineTo(4, -12); c.lineTo(21, -10); c.bezierCurveTo(22, -18, 16, -30, 13, -45); c.quadraticCurveTo(0, -49, -13, -45); c.closePath(); });
  F(c, 'rgba(0,0,0,.14)', c => { c.moveTo(-13, -45); c.bezierCurveTo(-16, -30, -22, -18, -21, -10); c.lineTo(-15, -11); c.bezierCurveTo(-15, -20, -11, -32, -8, -46); c.closePath(); });
  F(c, o.stud || '#ecd078', c => { for (let r = 0; r < 5; r++) for (let k = 0; k < 6; k++) { const y = -42 + r * 6.5, sp = 1 + r * 0.07, x = (-12.5 + k * 5 + (r % 2) * 2.5) * sp; if (Math.abs(x) > 18) continue; Cc(c, x, y, 0.95); } });
  L(c, o.trim, 2.8, c => { c.moveTo(-21, -10.5); c.lineTo(-2, -12.5); c.moveTo(4, -12.5); c.lineTo(21, -10.5); c.moveTo(0, -46); c.lineTo(1, -20); });
  P(c, o.belt || '#d63b2e', c => RR(c, -15, -31, 30, 5, 2.5), 1.8);
  if (o.knot) P(c, o.belt || '#d63b2e', c => { c.moveTo(4, -27); c.lineTo(1, -16); c.lineTo(5, -16); c.lineTo(7, -27); c.closePath(); }, 1.4);
  P(c, o.trim, c => { E(c, -12, -43, 6.5, 4); E(c, 13, -43, 6.5, 4); }, 1.6);
}
function plainBody(c, o) {
  P(c, '#b39a5e', c => { E(c, -7, -1.5, 6.4, 3.1); E(c, 8, -1.5, 6.4, 3.1); }, 2);
  P(c, o.pants || '#e6e0d0', c => { c.moveTo(-12, -25); c.quadraticCurveTo(-18, -13, -12, -4); c.lineTo(-2, -4); c.lineTo(0, -15); c.lineTo(2, -4); c.lineTo(13, -4); c.quadraticCurveTo(18, -13, 12, -25); c.closePath(); });
  L(c, '#f4f0e6', 3.2, c => { c.moveTo(-12, -7); c.lineTo(-3, -7); c.moveTo(2, -7); c.lineTo(12, -7); });
  L(c, 'rgba(120,100,70,.5)', 1, c => { c.moveTo(-11, -9); c.lineTo(-3, -5); c.moveTo(3, -9); c.lineTo(11, -5); });
  P(c, o.top || '#efe9da', c => { c.moveTo(-12, -45); c.quadraticCurveTo(-15, -33, -14, -21); c.quadraticCurveTo(0, -18, 14, -21); c.quadraticCurveTo(15, -33, 12, -45); c.quadraticCurveTo(0, -49, -12, -45); c.closePath(); });
  P(c, '#f8f4ec', c => { c.moveTo(-5, -46); c.lineTo(3, -34); c.lineTo(9, -46); c.closePath(); }, 1.6);
  if (o.patch) P(c, o.patch, c => RR(c, -10, -36, 7, 6, 1.5), 1.2);
  L(c, o.rope || '#b08a4a', 3, c => { c.moveTo(-14, -24); c.quadraticCurveTo(0, -21, 14, -24); });
  L(c, o.rope || '#b08a4a', 2, c => { c.moveTo(6, -23); c.quadraticCurveTo(8, -17, 6, -12); });
}
function beardOn(c, col, len) { const x = HC[0], y = HC[1]; P(c, col, c => { c.moveTo(x - 9, y + 11); c.quadraticCurveTo(x - 6, y + len, x + 2, y + len + 6); c.quadraticCurveTo(x + 8, y + len, x + 11, y + 11); c.quadraticCurveTo(x + 1, y + 15, x - 9, y + 11); c.closePath(); }, 1.6); L(c, 'rgba(0,0,0,.18)', 1, c => { c.moveTo(x - 3, y + 15); c.lineTo(x, y + len); c.moveTo(x + 4, y + 15); c.lineTo(x + 4, y + len - 2); }); }
function longBrows(c, col) { const x = HC[0], y = HC[1] + 1; P(c, col, c => { c.moveTo(x - 4, y - 5); c.quadraticCurveTo(x - 12, y - 7, x - 17, y - 1); c.quadraticCurveTo(x - 11, y - 4, x - 4, y - 3); c.closePath(); c.moveTo(x + 5, y - 5); c.quadraticCurveTo(x + 13, y - 7, x + 18, y - 1); c.quadraticCurveTo(x + 12, y - 4, x + 5, y - 3); c.closePath(); }, 1); }
function quiver(c) { P(c, '#7a4a28', c => { c.moveTo(-14, -48); c.lineTo(-6, -50); c.lineTo(-2, -20); c.lineTo(-9, -18); c.closePath(); }, 2); L(c, '#e8c45a', 1.4, c => { c.moveTo(-12, -42); c.lineTo(-5, -43); c.moveTo(-10, -28); c.lineTo(-4, -29); }); for (let k = 0; k < 4; k++) { L(c, OL, 2.2, c => { c.moveTo(-12 + k * 2.4, -49); c.lineTo(-15 + k * 2.6, -60); }); P(c, k % 2 ? '#f4f0e6' : '#d63b2e', c => { c.moveTo(-15 + k * 2.6, -60); c.lineTo(-17 + k * 2.6, -64); c.lineTo(-13 + k * 2.6, -62); c.closePath(); }, 0.8); } }

function sheaf(c) { // a bundle of ripe rice on the farmer's back
  L(c, OL, 2, c => { for (let k = 0; k < 7; k++) { c.moveTo(-22 + k * 2.4, -30); c.lineTo(-26 + k * 3, -76); } });
  P(c, '#d9b452', c => { c.moveTo(-26, -30); c.lineTo(-30, -70); c.quadraticCurveTo(-18, -80, -6, -72); c.lineTo(-8, -30); c.closePath(); }, 2);
  L(c, 'rgba(140,100,30,.6)', 1.1, c => { for (let k = 0; k < 6; k++) { c.moveTo(-24 + k * 3, -32); c.lineTo(-27 + k * 3.6, -70); } });
  for (let k = 0; k < 5; k++) P(c, '#e8c860', c => E(c, -28 + k * 5, -76 + Math.abs(k - 2) * 1.5, 3, 6, -0.5 + k * 0.25), 1.2);
  P(c, '#8a6a3a', c => RR(c, -29, -52, 23, 4, 2), 1.4);
}
function jige(c) { // A frame carrier with a cloth bundle
  L(c, OL, 4.6, c => { c.moveTo(-10, -2); c.lineTo(-18, -80); c.moveTo(-2, -4); c.lineTo(-6, -78); });
  L(c, '#9a6a3a', 3, c => { c.moveTo(-10, -2); c.lineTo(-18, -80); c.moveTo(-2, -4); c.lineTo(-6, -78); });
  L(c, '#9a6a3a', 2.4, c => { c.moveTo(-16, -60); c.lineTo(-5, -60); c.moveTo(-14, -40); c.lineTo(-4, -40); });
  P(c, '#3a6aa8', c => { c.moveTo(-34, -48); c.quadraticCurveTo(-36, -76, -18, -80); c.quadraticCurveTo(-2, -80, -4, -52); c.quadraticCurveTo(-18, -44, -34, -48); c.closePath(); }, 2);
  F(c, 'rgba(255,255,255,.18)', c => { for (let k = 0; k < 3; k++) Cc(c, -26 + k * 7, -66 + (k % 2) * 6, 2); });
  P(c, '#3a6aa8', c => { c.moveTo(-20, -80); c.quadraticCurveTo(-24, -90, -16, -92); c.quadraticCurveTo(-12, -86, -16, -80); c.closePath(); }, 1.4);
}
Object.assign(PUP, {
  dolhareubang: { size: 1.05, order: ['whole'], static: true, boxes: { whole: [-24, -110, 24, 6] },
    whole: c => {
      const st = '#8c8a84', dk = '#6e6c66';
      P(c, '#77746c', c => E(c, 0, -2, 16, 4.5), 2);
      P(c, st, c => { c.moveTo(-15, -2); c.quadraticCurveTo(-17, -32, -13, -58); c.lineTo(13, -58); c.quadraticCurveTo(17, -32, 15, -2); c.closePath(); }, 2.4);
      P(c, dk, c => { c.moveTo(-14, -40); c.quadraticCurveTo(-4, -44, 4, -41); c.quadraticCurveTo(6, -36, 2, -34); c.quadraticCurveTo(-6, -36, -14, -33); c.closePath(); }, 1.8);
      P(c, dk, c => { c.moveTo(14, -28); c.quadraticCurveTo(4, -31, -4, -28); c.quadraticCurveTo(-6, -23, -2, -21); c.quadraticCurveTo(6, -23, 14, -21); c.closePath(); }, 1.8);
      P(c, st, c => E(c, 0, -76, 16, 19), 2.4);
      P(c, st, c => { c.moveTo(-17, -90); c.quadraticCurveTo(0, -95, 17, -90); c.quadraticCurveTo(0, -86, -17, -90); c.closePath(); }, 2);
      P(c, st, c => { c.moveTo(-12, -91); c.quadraticCurveTo(-11, -106, 0, -107); c.quadraticCurveTo(11, -106, 12, -91); c.closePath(); }, 2.2);
      P(c, '#a3a09a', c => { Cc(c, -6.5, -79, 5); Cc(c, 7.5, -79, 5); }, 2);
      F(c, '#4a4842', c => { Cc(c, -6, -79, 2.2); Cc(c, 8, -79, 2.2); });
      P(c, '#9a978f', c => { c.moveTo(1, -78); c.quadraticCurveTo(-5, -66, -4, -63); c.quadraticCurveTo(1, -60, 6, -63); c.quadraticCurveTo(7, -66, 1, -78); c.closePath(); }, 1.8);
      L(c, '#4a4842', 2.2, c => { c.moveTo(-7, -60); c.quadraticCurveTo(1, -57, 9, -60); });
      const rnd = seeded(7); F(c, 'rgba(40,38,34,.45)', c => { for (let k = 0; k < 46; k++) { const x = rnd() * 28 - 14, y = -rnd() * 104; if (Math.abs(x) > 13 - (y < -60 ? 0 : 1)) continue; Cc(c, x, y, 0.6 + rnd() * 0.9); } });
    },
    idle: { tempo: 0.6 }, atk: 'pulse', glowEyes: [[-6, -79], [8, -79]] },
  uibyeong: H({ size: 0.98, boxes: { armF: [-34, -64, 46, 56] },
    body: c => plainBody(c, { top: '#ece5d2', pants: '#e2dccb', patch: '#cfc4a8' }),
    head: c => { face(c, { brows: true }); HAT.headband(c); },
    armB: c => arm(c, { color: '#ece5d2' }), armF: c => arm(c, { color: '#ece5d2', prop: PROP.bamboo }),
    idle: { tempo: 1.4, bob: 3, sway: 0.05, aF: [0.55, 0.12], aB: [0.7, 0.3] }, atk: 'thrust' }),
  sugun: H({ size: 0.98, order: ['back', 'armB', 'body', 'head', 'armF'], back: c => quiver(c),
    body: c => robe(c, { color: '#2a3f6e', hem: '#d63b2e', belt: '#d63b2e', vest: '#1c2848', top: 12, bot: 19, collar: '#d63b2e' }),
    head: c => { face(c, { brows: true }); HAT.jeollip(c); },
    armB: c => arm(c, { color: '#c83a2e', cuff: '#2a3f6e' }), armF: c => arm(c, { color: '#c83a2e', cuff: '#2a3f6e', prop: PROP.bow }),
    idle: { tempo: 1.2, bob: 2, sway: 0.04, aF: [0.5, 0.15], aB: [0.4, 0.15] }, atk: 'bow' }),
  sapsal: { size: 1.0, order: ['body', 'head'], neck: [14, -30], quad: true, boxes: { body: [-44, -60, 30, 4], head: [-10, -74, 44, -10] },
    body: c => {
      const col = '#cdbb94', dk = '#9c8a64';
      for (const x of [-15, 9]) P(c, dk, c => RR(c, x - 4, -16, 8, 16, 3), 2);
      P(c, col, c => { c.moveTo(-28, -18); c.quadraticCurveTo(-30, -38, -12, -40); c.quadraticCurveTo(10, -44, 22, -34); c.quadraticCurveTo(26, -20, 18, -14); c.quadraticCurveTo(0, -10, -28, -18); c.closePath(); }, 2.4);
      L(c, dk, 1.6, c => { for (let k = 0; k < 12; k++) { const x = -24 + k * 4; c.moveTo(x, -36 + Math.sin(k) * 2); c.quadraticCurveTo(x + 2, -26, x - 1, -14); } });
      for (const x of [-19, 5]) P(c, col, c => RR(c, x - 4.5, -16, 9, 16, 3.5), 2);
      F(c, '#3a2a1a', c => { E(c, -19, -1, 5, 2.4); E(c, 5, -1, 5, 2.4); });
      P(c, col, c => { c.moveTo(-26, -30); c.quadraticCurveTo(-42, -38, -36, -52); c.quadraticCurveTo(-30, -44, -24, -40); c.closePath(); }, 2);
      L(c, dk, 1.4, c => { c.moveTo(-34, -48); c.lineTo(-40, -50); c.moveTo(-36, -44); c.lineTo(-42, -44); });
    },
    head: c => {
      const col = '#d8c8a2', dk = '#9c8a64';
      P(c, col, c => { c.moveTo(4, -40); c.quadraticCurveTo(0, -64, 20, -66); c.quadraticCurveTo(38, -66, 38, -46); c.quadraticCurveTo(40, -30, 26, -24); c.quadraticCurveTo(10, -22, 4, -40); c.closePath(); }, 2.2);
      P(c, dk, c => { c.moveTo(6, -54); c.quadraticCurveTo(-2, -44, 2, -28); c.quadraticCurveTo(8, -38, 12, -46); c.closePath(); }, 1.6);
      L(c, dk, 1.4, c => { for (let k = 0; k < 8; k++) { const x = 14 + k * 3; c.moveTo(x, -64); c.quadraticCurveTo(x + 1, -52, x - 1, -44); } });
      F(c, 'rgba(255,250,235,.5)', c => E(c, 22, -58, 10, 4));
      P(c, '#2a1a10', c => E(c, 37, -42, 4.4, 3.4), 1.2);
      F(c, '#2a1a10', c => { Cc(c, 27, -47, 1.6); });
      P(c, '#d8576a', c => { c.moveTo(30, -32); c.quadraticCurveTo(33, -24, 36, -32); c.closePath(); }, 1.2);
    },
    idle: { tempo: 1.6, bob: 2.5 }, atk: 'pounce' },
  seungbyeong: H({ size: 1.0, boxes: { armF: [-30, -20, 34, 70], armB: [-30, -20, 34, 70] },
    body: c => { monkBody(c); L(c, '#e9dcc0', 3, c => { c.moveTo(-11, -9); c.lineTo(-3, -9); c.moveTo(3, -9); c.lineTo(11, -9); }); },
    head: c => { face(c, { brows: true, mouth: 'small' }); HAT.monkBand(c); },
    armB: c => arm(c, { color: '#7f7c76' }), armF: c => arm(c, { color: '#7f7c76', prop: PROP.club }),
    idle: { tempo: 1.1, bob: 2.5, sway: 0.05, aF: [0.5, 0.25], aB: [0.6, 0.25] }, atk: 'sweep' }),
  singijeon: { size: 1.08, order: ['whole'], static: true, boxes: { whole: [-42, -92, 46, 6] },
    whole: c => {
      P(c, '#6b4a2e', c => { c.moveTo(-34, -20); c.lineTo(30, -20); c.lineTo(30, -14); c.lineTo(-34, -14); c.closePath(); }, 2);
      L(c, OL, 4, c => { c.moveTo(-34, -17); c.lineTo(-44, -6); }); L(c, '#8a5a32', 2.4, c => { c.moveTo(-34, -17); c.lineTo(-44, -6); });
      at(c, -4, -46, 1, c => {
        P(c, '#8a5a32', c => RR(c, -22, -16, 44, 32, 3), 2.2);
        F(c, '#3a2414', c => { for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) Cc(c, -16 + k * 6.4, -10 + r * 7, 2.1); });
        for (let r = 0; r < 4; r++) for (let k = 0; k < 6; k++) { if ((r + k) % 2) continue; const x = -16 + k * 6.4, y = -10 + r * 7; L(c, OL, 1.8, c => { c.moveTo(x, y); c.lineTo(x + 7, y - 3); }); F(c, '#d63b2e', c => { c.moveTo(x + 7, y - 5); c.lineTo(x + 11, y - 3.4); c.lineTo(x + 7, y - 1.6); c.closePath(); }); }
        L(c, '#e8c45a', 1.6, c => { c.rect(-22, -16, 44, 32); });
      }, -0.42);
      L(c, OL, 3.4, c => { c.moveTo(-14, -20); c.lineTo(-10, -34); c.moveTo(14, -20); c.lineTo(8, -46); });
      L(c, '#8a5a32', 2, c => { c.moveTo(-14, -20); c.lineTo(-10, -34); c.moveTo(14, -20); c.lineTo(8, -46); });
      for (const x of [-20, 18]) { P(c, '#7a5230', c => Cc(c, x, -12, 12), 2.2); L(c, '#4a2e1a', 1.8, c => { for (let k = 0; k < 6; k++) { const a = k * PI / 3; c.moveTo(x, -12); c.lineTo(x + Math.cos(a) * 11, -12 + Math.sin(a) * 11); } }); P(c, '#4a2e1a', c => Cc(c, x, -12, 3), 1.4); }
      P(c, '#d63b2e', c => { c.moveTo(-32, -24); c.lineTo(-32, -60); c.lineTo(-18, -54); c.lineTo(-32, -48); }, 1.6);
      L(c, OL, 2.4, c => { c.moveTo(-32, -20); c.lineTo(-32, -62); });
    },
    idle: { tempo: 0.7 }, atk: 'recoil' },
  mudong: H({ size: 1.0, order: ['armB', 'body', 'head', 'inst', 'armF'], boxes: { inst: [-34, -168, 40, -66] },
    body: c => bajiBody(c, { waist: '#2f9a5a', tie: '#d63b2e' }),
    head: c => { face(c, { brows: true }); HAT.headband(c); },
    inst: c => {
      const x = HC[0], y = HC[1];
      P(c, '#2f5fb8', c => { c.moveTo(x - 4, y - 18); c.quadraticCurveTo(x - 16, y - 8, x - 15, y + 6); c.lineTo(x - 9, y + 7); c.quadraticCurveTo(x - 9, y - 6, x + 1, y - 14); c.closePath(); }, 1.8);
      P(c, '#2f5fb8', c => { c.moveTo(x + 4, y - 18); c.quadraticCurveTo(x + 18, y - 8, x + 17, y + 8); c.lineTo(x + 11, y + 9); c.quadraticCurveTo(x + 10, y - 6, x, y - 14); c.closePath(); }, 1.8);
      P(c, '#1f1a17', c => { E(c, x - 12, y + 8, 4.6, 2.6); E(c, x + 14, y + 10, 4.6, 2.6); }, 1.4);
      P(c, '#f6c84a', c => { c.moveTo(x - 10, y - 42); c.quadraticCurveTo(x - 12, y - 28, x - 10, y - 16); c.quadraticCurveTo(x + 1, y - 13, x + 12, y - 16); c.quadraticCurveTo(x + 13, y - 28, x + 10, y - 42); c.quadraticCurveTo(x, y - 45, x - 10, y - 42); c.closePath(); });
      ['#d63b2e', '#f0c43a', '#2f5fb8', '#3a8a4a', '#f4f0e6'].forEach((col, k) => F(c, col, c => c.rect(x + 11, y - 40 + k * 4, 6, 3.4)));
      P(c, '#d63b2e', c => RR(c, x - 11, y - 24, 23, 3.4, 1.6), 1.2);
      P(c, '#f3cda5', c => Cc(c, x + 1, y - 56, 13.5), 2.2);
      F(c, OL, c => { E(c, x - 3, y - 54, 1.7, 2.2); E(c, x + 6, y - 54, 1.7, 2.2); });
      F(c, 'rgba(232,110,90,.45)', c => { Cc(c, x - 8, y - 49, 2.6); Cc(c, x + 10, y - 49, 2.6); });
      P(c, '#c0453a', c => { c.moveTo(x - 1, y - 49); c.quadraticCurveTo(x + 1.5, y - 45, x + 4, y - 49); c.closePath(); }, 1.2);
      HAT.childGokkal(c, x + 1, y - 64, 0.82);
      L(c, '#f6c84a', 5, c => { c.moveTo(x + 10, y - 38); c.lineTo(x + 20, y - 52); });
      L(c, OL, 1.6, c => { c.moveTo(x + 10, y - 38); c.lineTo(x + 20, y - 52); });
      P(c, '#f3cda5', c => Cc(c, x + 21, y - 54, 3.2), 1.4);
      at(c, x + 25, y - 62, 1, c => { P(c, '#c23a2c', c => Cc(c, 0, 0, 6.6), 1.6); P(c, '#f4eedc', c => Cc(c, 0, 0, 4.4), 1); L(c, OL, 2.2, c => { c.moveTo(-3, 6); c.lineTo(-5, 12); }); });
      L(c, '#f6c84a', 5, c => { c.moveTo(x - 9, y - 38); c.lineTo(x - 17, y - 28); });
      L(c, OL, 1.6, c => { c.moveTo(x - 9, y - 38); c.lineTo(x - 17, y - 28); });
      P(c, '#f3cda5', c => Cc(c, x - 18, y - 26, 3.2), 1.4);
    },
    armB: c => arm(c, { color: '#f8f4ec', cuff: '#2f9a5a' }), armF: c => arm(c, { color: '#f8f4ec', cuff: '#2f9a5a' }),
    idle: { tempo: 1.6, bob: 3.5, sway: 0.05, aF: [2.25, 0.08], aB: [2.35, 0.08] }, atk: 'strike' }),
  sansin: H({ size: 1.03, boxes: { head: [-48, -128, 56, -18], armF: [-30, -50, 34, 62] },
    body: c => robe(c, { color: '#f2efe6', hem: '#3a6a8a', belt: '#3a6a8a', tie: '#3a6a8a', top: 12, bot: 22, collar: '#3a6a8a' }),
    head: c => { face(c, { closed: true, mouth: 'small' }); longBrows(c, '#fbfaf6'); beardOn(c, '#fbfaf6', 40); HAT.jeongja(c); },
    armB: c => arm(c, { color: '#f2efe6', cuff: '#3a6a8a', hansam: true }), armF: c => arm(c, { color: '#f2efe6', cuff: '#3a6a8a', prop: PROP.staff }),
    idle: { tempo: 0.7, bob: 1.2, sway: 0.03, aF: [0.35, 0.1], aB: [0.9, 0.1], head: 0.06 }, atk: 'raise' }),
  samjogo: { size: 1.08, order: ['whole', 'bird'], static: true, boxes: { bird: [-34, -118, 44, -58], whole: [-34, -124, 34, 6] },
    whole: c => {
      const g = c.createRadialGradient(4, -84, 4, 4, -84, 30); g.addColorStop(0, '#ffd36a'); g.addColorStop(0.6, '#f07a2a'); g.addColorStop(1, '#c8401f');
      P(c, g, c => Cc(c, 4, -84, 26), 2);
      L(c, 'rgba(255,220,140,.6)', 2, c => { for (let k = 0; k < 12; k++) { const a = k * TAU / 12; c.moveTo(4 + Math.cos(a) * 29, -84 + Math.sin(a) * 29); c.lineTo(4 + Math.cos(a) * 34, -84 + Math.sin(a) * 34); } });
      P(c, '#8a8378', c => E(c, 0, -2, 12, 4), 2);
      P(c, '#7a5230', c => { c.moveTo(-3, -2); c.lineTo(-2.4, -62); c.lineTo(2.4, -62); c.lineTo(3, -2); c.closePath(); }, 2.2);
      P(c, '#7a5230', c => RR(c, -16, -66, 32, 5, 2), 2);
    },
    bird: c => {
      for (const x of [-6, 0, 6]) L(c, '#e8b23a', 2.2, c => { c.moveTo(x, -72); c.lineTo(x + 1, -64); c.moveTo(x - 2, -64); c.lineTo(x + 4, -64); });
      P(c, '#1d1a26', c => { c.moveTo(-22, -84); c.quadraticCurveTo(-10, -104, 10, -98); c.quadraticCurveTo(22, -94, 20, -82); c.quadraticCurveTo(14, -70, -2, -71); c.quadraticCurveTo(-16, -72, -22, -84); c.closePath(); }, 2.2);
      P(c, '#2a2638', c => { c.moveTo(-14, -90); c.quadraticCurveTo(-32, -104, -30, -86); c.quadraticCurveTo(-20, -84, -12, -80); c.closePath(); }, 1.8);
      L(c, 'rgba(110,130,220,.55)', 1.4, c => { c.moveTo(-12, -92); c.quadraticCurveTo(0, -98, 12, -94); c.moveTo(-14, -84); c.quadraticCurveTo(-2, -88, 10, -86); });
      P(c, '#1d1a26', c => Cc(c, 18, -100, 9), 2);
      P(c, '#e8b23a', c => { c.moveTo(25, -102); c.lineTo(38, -98); c.lineTo(25, -95); c.closePath(); }, 1.4);
      F(c, '#ff5a2a', c => Cc(c, 20, -102, 2.2)); F(c, '#fff', c => Cc(c, 20.6, -102.6, 0.8));
      P(c, '#2a2638', c => { c.moveTo(-20, -82); c.lineTo(-34, -78); c.lineTo(-30, -74); c.lineTo(-18, -76); c.closePath(); }, 1.4);
    },
    pivots: { bird: [0, -72] }, idle: { tempo: 0.9 }, atk: 'peck' },
  gwakjaewoo: H({ size: 1.04, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-44, -60, 20, 4], armF: [-30, -12, 34, 66] },
    back: c => { P(c, '#a81f1f', c => { c.moveTo(-8, -46); c.quadraticCurveTo(-34, -30, -40, -4); c.quadraticCurveTo(-24, -10, -16, -2); c.quadraticCurveTo(-10, -24, 4, -44); c.closePath(); }, 2); },
    body: c => robe(c, { color: '#cc2b26', hem: '#f0c43a', belt: '#1d1d22', tie: '#f0c43a', top: 12, bot: 23, collar: '#f4efe3' }),
    head: c => { face(c, { brows: true, mustache: true }); HAT.jurip(c); },
    armB: c => arm(c, { color: '#cc2b26', cuff: '#f0c43a' }), armF: c => arm(c, { color: '#cc2b26', cuff: '#f0c43a', prop: PROP.hwando }),
    idle: { tempo: 1.3, bob: 3, sway: 0.06, aF: [0.6, 0.2], aB: [0.5, 0.25] }, atk: 'swing' }),
  gwonyul: H({ size: 1.04, boxes: { armB: [-34, -48, 34, 58] },
    body: c => armorBody(c, { color: '#2a3a7a', trim: '#d63b2e', belt: '#e8c45a', knot: true }),
    head: c => { face(c, { brows: true, mustache: true }); HAT.tugu(c, { flap: '#2a3a7a', trim: '#e8c45a', plume: '#d63b2e' }); },
    armB: c => arm(c, { color: '#2a3a7a', cuff: '#d63b2e', prop: PROP.flag }), armF: c => arm(c, { color: '#2a3a7a', cuff: '#d63b2e', prop: PROP.rock }),
    idle: { tempo: 1.0, bob: 2, sway: 0.04, aF: [0.5, 0.15], aB: [1.6, 0.06] }, atk: 'throw' }),
  yisunsin: H({ size: 1.1, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-44, -60, 20, 4], head: [-48, -128, 56, -20], armF: [-30, -12, 34, 66] },
    back: c => { P(c, '#1f2a5a', c => { c.moveTo(-8, -46); c.quadraticCurveTo(-30, -30, -36, -2); c.quadraticCurveTo(-22, -8, -14, -1); c.quadraticCurveTo(-8, -24, 4, -44); c.closePath(); }, 2); },
    body: c => armorBody(c, { color: '#9a2420', trim: '#e8c45a', belt: '#1f2a5a', stud: '#f2d888', knot: true }),
    head: c => { face(c, { brows: true }); beardOn(c, '#1b1512', 30); HAT.tugu(c, { flap: '#9a2420', trim: '#f0c43a', plume: '#f4f0e6', dome: '#7a6a4a' }); },
    armB: c => arm(c, { color: '#9a2420', cuff: '#e8c45a' }), armF: c => arm(c, { color: '#9a2420', cuff: '#e8c45a', prop: PROP.hwando }),
    idle: { tempo: 0.8, bob: 1.5, sway: 0.03, aF: [0.45, 0.12], aB: [0.35, 0.1], head: -0.04 }, atk: 'point' }),
  geobukseon: { size: 1.06, order: ['whole'], static: true, boxes: { whole: [-56, -86, 62, 6] }, pdiv: 150, pfy: 0.86,
    whole: c => {
      P(c, 'rgba(60,110,160,.45)', c => E(c, 0, -2, 54, 6), 0);
      L(c, OL, 3, c => { for (let k = 0; k < 7; k++) { const x = -38 + k * 12; c.moveTo(x, -16); c.lineTo(x - 6, -1); } });
      L(c, '#c9a878', 1.8, c => { for (let k = 0; k < 7; k++) { const x = -38 + k * 12; c.moveTo(x, -16); c.lineTo(x - 6, -1); } });
      P(c, '#7a5230', c => { c.moveTo(-50, -30); c.quadraticCurveTo(-52, -12, -40, -8); c.lineTo(40, -8); c.quadraticCurveTo(50, -12, 48, -30); c.closePath(); }, 2.4);
      L(c, '#4a2e1a', 1.4, c => { c.moveTo(-48, -22); c.lineTo(46, -22); c.moveTo(-44, -15); c.lineTo(42, -15); });
      F(c, '#2a1a10', c => { for (let k = 0; k < 6; k++) RR(c, -36 + k * 13, -28, 5, 4, 1); });
      const g = c.createLinearGradient(0, -70, 0, -28); g.addColorStop(0, '#5a6a5a'); g.addColorStop(1, '#2f3a34');
      P(c, g, c => { c.moveTo(-50, -30); c.quadraticCurveTo(-46, -62, -6, -66); c.quadraticCurveTo(36, -66, 46, -30); c.closePath(); }, 2.4);
      L(c, 'rgba(200,220,200,.35)', 1.2, c => { for (let r = 0; r < 3; r++) { c.moveTo(-44 + r * 4, -36 - r * 9); c.quadraticCurveTo(-4, -56 - r * 3, 40 - r * 4, -36 - r * 9); } });
      F(c, '#dfe3ea', c => { for (let r = 0; r < 3; r++) for (let k = 0; k < 9 - r * 2; k++) { const x = -34 + r * 8 + k * 9, y = -36 - r * 9 - Math.sin((k + 0.5) / (9 - r * 2) * PI) * 6; c.moveTo(x - 1.6, y); c.lineTo(x, y - 5); c.lineTo(x + 1.6, y); } });
      P(c, '#d63b2e', c => { c.moveTo(-10, -66); c.lineTo(-10, -84); c.lineTo(4, -78); c.lineTo(-10, -72); }, 1.4); L(c, OL, 2, c => { c.moveTo(-10, -64); c.lineTo(-10, -86); });
      P(c, '#2f5fb8', c => { c.moveTo(-30, -58); c.lineTo(-30, -72); c.lineTo(-20, -67); c.lineTo(-30, -63); }, 1.2); L(c, OL, 1.6, c => { c.moveTo(-30, -56); c.lineTo(-30, -74); });
      P(c, '#c8a23a', c => { c.moveTo(42, -26); c.quadraticCurveTo(46, -44, 56, -46); c.quadraticCurveTo(64, -44, 62, -34); c.quadraticCurveTo(58, -26, 50, -24); c.closePath(); }, 2);
      P(c, '#c8a23a', c => { c.moveTo(52, -45); c.lineTo(50, -56); c.lineTo(56, -47); c.closePath(); c.moveTo(57, -45); c.lineTo(58, -55); c.lineTo(60, -44); c.closePath(); }, 1.4);
      P(c, '#3a0d08', c => { c.moveTo(62, -36); c.lineTo(54, -33); c.lineTo(61, -29); c.closePath(); }, 1.2);
      F(c, '#fff', c => Cc(c, 55, -40, 2)); F(c, OL, c => Cc(c, 55.6, -40, 1));
      F(c, 'rgba(220,220,220,.5)', c => { Cc(c, 64, -38, 3); Cc(c, 68, -42, 2.4); });
    },
    idle: { tempo: 0.5 }, atk: 'recoil', glowEyes: [[55, -40]] },
  uibyeongdae: { size: 1.0, order: ['dyn'], group: [['gwakjaewoo', -0.42, -0.34], ['gwonyul', 0.42, -0.34], ['seungbyeong', -0.42, 0.28], ['uibyeong', 0.42, 0.28]], idle: { tempo: 1 }, atk: 'beat' },
  nongmin: H({ size: 0.96, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-40, -96, 10, -20] }, back: c => sheaf(c),
    body: c => plainBody(c, { top: '#e6dcc2', pants: '#ddd3ba', patch: '#c4b084', rope: '#8a6a3a' }),
    head: c => { face(c, { brows: true }); HAT.satgat(c); },
    armB: c => arm(c, { color: '#e6dcc2' }), armF: c => arm(c, { color: '#e6dcc2', prop: PROP.sickle }),
    idle: { tempo: 1.2, bob: 2.5, sway: 0.05, aF: [0.5, 0.2], aB: [0.6, 0.3] }, atk: 'throw' }),
  bobusang: H({ size: 1.0, order: ['back', 'armB', 'body', 'head', 'armF'], boxes: { back: [-42, -100, 6, 4] }, back: c => jige(c),
    body: c => robe(c, { color: '#8c7a5e', hem: '#5a4a34', belt: '#5a4a34', top: 12, bot: 20, collar: '#efe6d2' }),
    head: c => { face(c, { brows: true, mustache: true }); HAT.bobusang(c); },
    armB: c => arm(c, { color: '#8c7a5e', cuff: '#5a4a34' }), armF: c => arm(c, { color: '#8c7a5e', cuff: '#5a4a34', prop: PROP.cane }),
    idle: { tempo: 1.0, bob: 2, sway: 0.04, aF: [0.4, 0.15], aB: [0.5, 0.2] }, atk: 'throw' }),
  mudang: H({ size: 1.02, boxes: { head: [-48, -136, 64, -32] },
    body: c => skirtBody(c, { skirt: '#2f5fb8', jacket: '#c8302a', goreum: '#f0c43a', skirtBand: '#f0c43a' }),
    head: c => { face(c, { mouth: 'small' }); HAT.mudang(c); },
    armB: c => arm(c, { color: '#c8302a', stripes: ['#f0c43a', '#2f9a5a', '#2f5fb8', '#f4f0e6'], prop: PROP.bells }),
    armF: c => arm(c, { color: '#c8302a', stripes: ['#f0c43a', '#2f9a5a', '#2f5fb8', '#f4f0e6'], prop: PROP.obangFan }),
    idle: { tempo: 1.6, bob: 3, sway: 0.08, aF: [0.9, 0.5], aB: [1.0, 0.5] }, atk: 'spin' }),
  honggildong: H({ size: 1.06,
    body: c => robe(c, { color: '#2b3f73', hem: '#1a2648', belt: '#c8302a', tie: '#c8302a', top: 12, bot: 22, collar: '#f4efe3' }),
    head: c => { face(c, { brows: true }); HAT.gat(c); },
    armB: c => arm(c, { color: '#2b3f73', cuff: '#f4efe3' }), armF: c => arm(c, { color: '#2b3f73', cuff: '#f4efe3', prop: PROP.hwando }),
    idle: { tempo: 1.3, bob: 2.5, sway: 0.06, aF: [0.6, 0.2], aB: [0.5, 0.25] }, atk: 'lunge' }),
  seolmundae: H({ size: 1.24, order: ['back', 'armB', 'body', 'head', 'inst', 'armF'], boxes: { inst: [-30, -50, 34, -6] },
    back: c => { P(c, '#ece8e0', c => E(c, HC[0] - 3, HC[1] + 2, 22, 22)); },
    body: c => skirtBody(c, { skirt: '#b8642c', jacket: '#c97a3a', goreum: '#8a4a20', skirtBand: '#8a4a20' }),
    head: c => { face(c, { closed: true, mouth: 'small', skin: '#efc49c' }); L(c, 'rgba(120,70,40,.4)', 1.2, c => { const x = HC[0], y = HC[1]; c.moveTo(x - 14, y - 6); c.lineTo(x - 9, y - 7); c.moveTo(x + 10, y - 7); c.lineTo(x + 15, y - 6); }); HAT.bun(c); },
    inst: c => {
      P(c, '#a85a28', c => { c.moveTo(-18, -36); c.quadraticCurveTo(-22, -16, -10, -12); c.quadraticCurveTo(6, -8, 22, -14); c.quadraticCurveTo(28, -28, 22, -38); c.quadraticCurveTo(0, -30, -18, -36); c.closePath(); }, 2);
      for (const [x, y, r] of [[-8, -38, 7], [4, -40, 8], [15, -37, 6.5], [-2, -45, 6], [10, -47, 5.4]]) { P(c, '#8d8a84', c => E(c, x, y, r, r * 0.8), 1.6); F(c, 'rgba(255,255,255,.22)', c => E(c, x - r * 0.3, y - r * 0.3, r * 0.35, r * 0.2)); }
    },
    armB: c => arm(c, { color: '#c97a3a', cuff: '#8a4a20' }), armF: c => arm(c, { color: '#c97a3a', cuff: '#8a4a20' }),
    idle: { tempo: 0.7, bob: 1.5, sway: 0.03, aF: [1.05, 0.06], aB: [1.15, 0.06] }, atk: 'raise' }),
});
/* ---------- stage foes (kinds 4..7) ---------- */
function drawFoeExtra(c, kind, frame) {
  const sw = frame ? 3 : -3;
  if (kind === 4) { // 야광귀
    const body = '#2a3a6a', dk = '#18224a';
    P(c, dk, c => { RR(c, -9 + sw, -12, 7, 12, 3); RR(c, 3 - sw, -12, 7, 12, 3); }, 2);
    P(c, body, c => E(c, 0, -24, 13, 14), 2.2);
    for (const s of [-1, 1]) P(c, body, c => { c.moveTo(s * 8, -32); c.lineTo(s * 22, -46); c.lineTo(s * 12, -28); c.closePath(); }, 1.8);
    P(c, '#ffe24a', c => { E(c, -4, -27, 4, 3.4); E(c, 7, -27, 4, 3.4); }, 1.4);
    F(c, OL, c => { Cc(c, -3, -27, 1.6); Cc(c, 8, -27, 1.6); });
    P(c, '#3a0d08', c => { c.moveTo(-3, -18); c.quadraticCurveTo(3, -13, 9, -18); c.closePath(); }, 1.2);
    P(c, '#c9a85a', c => { c.moveTo(10, -22); c.quadraticCurveTo(26, -26, 28, -18); c.quadraticCurveTo(26, -12, 12, -14); c.closePath(); }, 1.6);
    L(c, 'rgba(120,90,40,.6)', 1, c => { c.moveTo(14, -20); c.lineTo(24, -20); c.moveTo(14, -17); c.lineTo(24, -17); });
    return;
  }
  if (kind === 5) { // 쇠도깨비
    const body = '#7b808a', dk = shade(body, -0.32), lt = shade(body, 0.3), lf = frame ? 4 : -4;
    P(c, dk, c => { RR(c, -10 + lf, -14, 8, 14, 3); RR(c, 3 - lf, -14, 8, 14, 3); }, 2);
    P(c, body, c => E(c, 0, -28, 17, 18), 2.4);
    F(c, lt, c => E(c, 4, -25, 9, 9));
    P(c, '#5a5f68', c => { c.moveTo(-14, -26); c.quadraticCurveTo(0, -20, 14, -26); c.lineTo(13, -12); c.quadraticCurveTo(0, -8, -13, -12); c.closePath(); }, 1.8);
    F(c, '#c9ccd4', c => { for (let k = 0; k < 4; k++) Cc(c, -9 + k * 6, -18, 1.3); });
    P(c, '#4a4e58', c => { c.moveTo(-16, -34); c.quadraticCurveTo(-16, -52, 0, -53); c.quadraticCurveTo(16, -52, 16, -34); c.closePath(); }, 2);
    P(c, '#c9ccd4', c => { c.moveTo(-2, -53); c.lineTo(1, -63); c.lineTo(4, -53); c.closePath(); }, 1.4);
    F(c, '#ff5a2a', c => { E(c, -2, -33, 3, 2); E(c, 9, -33, 3, 2); });
    P(c, '#5a5f68', c => { c.moveTo(13, -28); c.lineTo(26, -50); c.quadraticCurveTo(31, -50, 30, -45); c.lineTo(17, -25); c.closePath(); }, 2);
    F(c, '#c9ccd4', c => { Cc(c, 25, -44, 1.8); Cc(c, 28, -48, 1.6); });
    P(c, body, c => Cc(c, 15, -26, 5), 1.8);
    return;
  }
  if (kind === 6) { // 물귀신
    P(c, '#7fb8a8', c => { c.moveTo(-13, -30); c.quadraticCurveTo(-16, -10, -12 + sw, 0); c.lineTo(-5 + sw, -5); c.lineTo(1 + sw, 0); c.lineTo(7 + sw, -5); c.lineTo(13 + sw, 0); c.quadraticCurveTo(16, -12, 12, -30); c.closePath(); }, 2.2);
    P(c, '#cfe8df', c => E(c, 1, -40, 11, 13), 2);
    P(c, '#14181e', c => { c.moveTo(-14, -36); c.quadraticCurveTo(-16, -58, 2, -56); c.quadraticCurveTo(18, -56, 15, -34); c.lineTo(13, -14); c.lineTo(9, -30); c.lineTo(6, -12); c.lineTo(3, -32); c.lineTo(-1, -16); c.lineTo(-4, -32); c.lineTo(-8, -14); c.lineTo(-10, -32); c.lineTo(-13, -16); c.closePath(); }, 1.6);
    F(c, '#bfe9ff', c => { E(c, 5, -40, 1.8, 2.6); });
    F(c, 'rgba(160,220,255,.8)', c => { Cc(c, -14, -8, 1.6); Cc(c, 14, -4, 1.4); Cc(c, -6, 2, 1.2); });
    return;
  }
  if (kind === 7) { // 망령
    const g = c.createLinearGradient(0, -50, 0, 0); g.addColorStop(0, 'rgba(220,235,255,.95)'); g.addColorStop(1, 'rgba(150,170,230,.35)');
    P(c, g, c => { c.moveTo(-14, -34); c.quadraticCurveTo(-16, -56, 0, -56); c.quadraticCurveTo(16, -56, 14, -34); c.quadraticCurveTo(12, -16, 4 + sw, -4); c.quadraticCurveTo(0, 4, -4 - sw, -6); c.quadraticCurveTo(-12, -16, -14, -34); c.closePath(); }, 2);
    F(c, '#2a2a4a', c => { E(c, -4, -40, 2.6, 3.6); E(c, 6, -40, 2.6, 3.6); });
    P(c, '#2a2a4a', c => { c.moveTo(-2, -30); c.quadraticCurveTo(1, -33, 4, -30); c.quadraticCurveTo(1, -28, -2, -30); }, 1);
    F(c, 'rgba(120,140,255,.35)', c => { Cc(c, -12, -48, 2); Cc(c, 13, -46, 1.6); });
  }
}

/* ---------- new bosses ---------- */
Object.assign(BOSS2D, {
  geumdwaeji(c) {
    P(c, '#b07a1a', c => { RR(c, -34, -24, 10, 24, 3); RR(c, -20, -24, 10, 24, 3); RR(c, 14, -24, 10, 24, 3); RR(c, 28, -24, 10, 24, 3); }, 2);
    F(c, '#3a2a10', c => { E(c, -29, -1, 5, 2.4); E(c, -15, -1, 5, 2.4); E(c, 19, -1, 5, 2.4); E(c, 33, -1, 5, 2.4); });
    const g = c.createLinearGradient(0, -78, 0, -18); g.addColorStop(0, '#ffe58a'); g.addColorStop(0.6, '#e2a92a'); g.addColorStop(1, '#a8741a');
    P(c, g, c => E(c, 0, -44, 44, 28), 2.6);
    L(c, '#a8741a', 2.4, c => { for (let k = 0; k < 14; k++) { const x = -34 + k * 5; c.moveTo(x, -66 + Math.abs(k - 7) * 0.8); c.lineTo(x - 2, -76 + Math.abs(k - 7) * 1.2); } });
    F(c, 'rgba(255,255,255,.35)', c => E(c, -10, -58, 18, 7, -0.2));
    P(c, '#f0c040', c => E(c, 38, -50, 18, 16), 2.4);
    P(c, '#e2a92a', c => { c.moveTo(30, -64); c.lineTo(28, -78); c.lineTo(38, -66); c.closePath(); }, 1.6);
    P(c, '#f2b7a0', c => E(c, 54, -46, 8, 7), 2);
    F(c, '#6a2a1a', c => { E(c, 52, -46, 1.6, 2.4); E(c, 57, -46, 1.6, 2.4); });
    P(c, '#fffaf0', c => { c.moveTo(46, -38); c.quadraticCurveTo(52, -30, 46, -24); c.quadraticCurveTo(48, -32, 43, -37); c.closePath(); }, 1.4);
    F(c, '#c0281c', c => E(c, 40, -55, 2.6, 2));
    P(c, '#e2a92a', c => { c.moveTo(-42, -48); c.quadraticCurveTo(-54, -56, -50, -64); c.quadraticCurveTo(-46, -56, -40, -54); c.closePath(); }, 1.6);
  },
  daejeok(c) {
    P(c, '#3a3428', c => { RR(c, -30, -30, 16, 30, 5); RR(c, 10, -30, 16, 30, 5); }, 2);
    P(c, '#4f5a3a', c => { c.moveTo(-36, -30); c.quadraticCurveTo(-46, -70, -20, -84); c.quadraticCurveTo(0, -92, 22, -84); c.quadraticCurveTo(44, -70, 34, -30); c.quadraticCurveTo(0, -20, -36, -30); c.closePath(); }, 2.6);
    L(c, '#2f3622', 2, c => { for (let k = 0; k < 10; k++) { const x = -30 + k * 6.5; c.moveTo(x, -74); c.quadraticCurveTo(x + 3, -58, x, -40); } });
    P(c, '#8a6a3a', c => RR(c, -34, -42, 68, 7, 3), 2);
    P(c, '#6b5a3a', c => { c.moveTo(-42, -60); c.quadraticCurveTo(-60, -50, -56, -28); c.quadraticCurveTo(-46, -26, -44, -40); c.closePath(); }, 2);
    P(c, '#c8b07a', c => E(c, -50, -24, 10, 9), 1.8);
    for (const [hx, hy, s] of [[-22, -96, 0.7], [26, -96, 0.7], [2, -102, 1]]) at(c, hx, hy, s, c => {
      P(c, '#5a6a42', c => E(c, 0, 0, 16, 15), 2.2);
      for (const sd of [-1, 1]) P(c, '#e8dcb0', c => { c.moveTo(sd * 8, -10); c.lineTo(sd * 14, -26); c.lineTo(sd * 3, -12); c.closePath(); }, 1.4);
      P(c, '#fff', c => { Cc(c, -5, -2, 4); Cc(c, 6, -2, 4); }, 1.2);
      F(c, '#c0281c', c => { Cc(c, -4.4, -2, 2); Cc(c, 6.6, -2, 2); });
      P(c, '#2a0d08', c => { c.moveTo(-8, 6); c.quadraticCurveTo(0, 13, 8, 6); c.closePath(); }, 1.2);
      F(c, '#fff', c => { c.moveTo(-5, 6.5); c.lineTo(-3.6, 10); c.lineTo(-2.2, 7); c.moveTo(2.2, 7); c.lineTo(3.6, 10); c.lineTo(5, 6.5); });
    });
    P(c, '#6b4428', c => { c.moveTo(34, -50); c.lineTo(64, -96); c.quadraticCurveTo(74, -98, 72, -86); c.lineTo(42, -44); c.closePath(); }, 2.2);
    F(c, '#cfc6b0', c => { for (const [x, y] of [[62, -90], [66, -84], [58, -84], [64, -96]]) { c.moveTo(x, y); c.lineTo(x + 4, y - 3); c.lineTo(x + 1, y + 3); } });
  },
  heukryongHead(c) {
    P(c, '#22283a', c => E(c, 0, -28, 26, 19), 2.6);
    P(c, '#6a8ab0', c => E(c, 8, -18, 18, 7), 1.8);
    for (const s of [0, 1]) P(c, '#d9c47a', c => { c.moveTo(-8 + s * 10, -44); c.quadraticCurveTo(-20 + s * 8, -60, -24 + s * 10, -68); c.quadraticCurveTo(-12 + s * 8, -58, -2 + s * 10, -46); c.closePath(); }, 1.6);
    P(c, '#3a7ab0', c => { for (let k = 0; k < 6; k++) { c.moveTo(-24 + k * 3, -40 + k); c.lineTo(-34 + k * 2, -52 + k * 2); c.lineTo(-20 + k * 3, -42 + k); } }, 1.2);
    P(c, '#ffd84a', c => Cc(c, 10, -34, 5), 1.6); F(c, OL, c => E(c, 11, -34, 1.6, 4.2));
    L(c, '#cfe0f0', 1.8, c => { c.moveTo(22, -22); c.quadraticCurveTo(40, -30, 50, -18); c.moveTo(20, -18); c.quadraticCurveTo(34, -6, 40, 6); });
    F(c, OL, c => Cc(c, 22, -28, 1.6));
    F(c, '#fff', c => { c.moveTo(14, -14); c.lineTo(16, -9); c.lineTo(18, -14); c.moveTo(20, -15); c.lineTo(22, -10); c.lineTo(24, -15); });
  },
  yeomra(c) {
    P(c, '#7a1a1a', c => { c.moveTo(-26, -66); c.bezierCurveTo(-34, -40, -44, -10, -42, -2); c.quadraticCurveTo(0, 4, 42, -2); c.bezierCurveTo(44, -10, 34, -40, 26, -66); c.quadraticCurveTo(0, -72, -26, -66); c.closePath(); }, 2.6);
    F(c, 'rgba(0,0,0,.18)', c => { c.moveTo(-26, -66); c.bezierCurveTo(-34, -40, -44, -10, -42, -2); c.lineTo(-30, -1); c.bezierCurveTo(-28, -20, -22, -44, -16, -68); c.closePath(); });
    P(c, '#e8c45a', c => Cc(c, 0, -46, 11), 1.8);
    L(c, '#7a1a1a', 2, c => { c.moveTo(-6, -46); c.lineTo(6, -46); c.moveTo(0, -52); c.lineTo(0, -40); c.moveTo(-4, -50); c.lineTo(4, -42); c.moveTo(4, -50); c.lineTo(-4, -42); });
    P(c, '#1d1d22', c => RR(c, -28, -32, 56, 6, 3), 1.8);
    P(c, '#7a1a1a', c => { c.moveTo(-26, -64); c.quadraticCurveTo(-44, -50, -48, -30); c.lineTo(-38, -28); c.quadraticCurveTo(-34, -46, -20, -56); c.closePath(); }, 2);
    P(c, '#7a1a1a', c => { c.moveTo(26, -64); c.quadraticCurveTo(42, -54, 46, -40); c.lineTo(36, -36); c.quadraticCurveTo(32, -50, 20, -56); c.closePath(); }, 2);
    P(c, '#e8dcb0', c => { c.moveTo(40, -42); c.lineTo(52, -70); c.lineTo(57, -68); c.lineTo(45, -40); c.closePath(); }, 1.6);
    P(c, '#e8b48a', c => Cc(c, 0, -84, 17), 2.4);
    P(c, '#1b1512', c => { c.moveTo(-12, -78); c.quadraticCurveTo(-10, -56, 0, -52); c.quadraticCurveTo(10, -56, 12, -78); c.quadraticCurveTo(0, -72, -12, -78); c.closePath(); }, 1.4);
    L(c, OL, 3, c => { c.moveTo(-11, -92); c.lineTo(-3, -89); c.moveTo(11, -92); c.lineTo(3, -89); });
    F(c, OL, c => { E(c, -6, -86, 2, 2.4); E(c, 6, -86, 2, 2.4); });
    P(c, '#1d1d22', c => { c.moveTo(-14, -98); c.lineTo(-12, -106); c.lineTo(12, -106); c.lineTo(14, -98); c.closePath(); }, 1.8);
    P(c, '#1d1d22', c => RR(c, -24, -112, 48, 6, 2), 1.8);
    L(c, '#e8c45a', 1.4, c => { for (let k = 0; k < 7; k++) { const x = -21 + k * 7; c.moveTo(x, -106); c.lineTo(x, -96); } });
    F(c, '#e8c45a', c => { for (let k = 0; k < 7; k++) Cc(c, -21 + k * 7, -95, 1.4); });
  },
});

