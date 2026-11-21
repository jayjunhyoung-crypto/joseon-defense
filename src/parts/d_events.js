/* ================= game events → effects + sound ================= */
const OBANG = ['#2f5fb8', '#d63b2e', '#f0c43a', '#f4f0e6', '#3a8a4a'];
const UY = 0.55; // upper-body height above feet in cells
function unitPos(cell) { return { x: cellX(cell), y: cellY(cell) + 0.3 }; }
function onEvent(e) {
  switch (e.k) {
    case 'num':
      if (R.fxLite && !e.crit) break;
      { const cost = e.boss ? 3 : 1; if ((e.crit && R.numBudget >= 0) || R.numBudget >= cost) { R.numBudget -= cost; fxText(e.x + rand(-0.25, 0.25), e.y - (e.boss ? 1.35 : 0.72) + rand(-0.1, 0.1), fmt(e.v), e.crit ? 'crit' : e.res ? 'res' : e.boss ? 'big' : 'myth'); } }
      break;
    case 'hit': hitFx(e); break;
    case 'chain': {
      const col = e.id === 'jung' ? '#ffd36a' : e.id === 'bari' ? '#d8ecff' : e.id === 'hokburi' ? '#ffb3e0' : '#fff1a8';
      if (e.id === 'hokburi') e.pts.slice(1).forEach(p => fxText(p.x + rand(-0.1, 0.1), p.y - 0.5, pick(['♪', '♫']), 'coin', 0.6));
      fxZig(e.pts, col, e.id === 'kkwaenggwari' ? 0.03 : 0.045, 0.22);
      e.pts.slice(1).forEach(p => fxFlash(p.x, p.y, 0.3, col, 0.18, 0.5));
      if (e.id === 'bari') e.pts.slice(1).forEach(p => part(p.x, p.y + 0.25, 0.3, rand(-0.3, 0.3), 0, rand(0.6, 1), '#ffffff', 0.05, 0.9, { g: -0.6, kind: 'petal', drag: 1 }));
      sfx(e.id === 'kkwaenggwari' ? 'kkwaeng' : 'chain');
      break;
    }
    case 'thump': {
      if (e.id === 'dolhareubang') { fxRing(e.x, e.y, 0.1, e.r, '#a8a49a', 4, 0.35); burst(e.x, e.y, 0.2, 5, ['#8d8a84', '#bdb6aa'], 1.8, 0.05, 0.45); if (e.stun && Math.random() < 0.25) fxText(e.x, e.y - 0.8, '쿵', 'word', 0.6); sfx('stone'); break; }
      if (e.id === 'sansin') {
        FX.push({ k: 'zig', pts: [{ x: e.x + 0.25, y: e.y - 4.5 }, { x: e.x - 0.15, y: e.y - 3 }, { x: e.x + 0.2, y: e.y - 1.6 }, { x: e.x, y: e.y - 0.1 }], col: '#c8e0ff', w: 0.06, life: 0.25, t: 0, seed: Math.random() * 100 });
        fxFlash(e.x, e.y - 0.3, 0.9, '#dfeaff', 0.25, 0.6); fxRing(e.x, e.y, 0.1, e.r, '#9ac0ff', 4, 0.35);
        if (e.stun) burst(e.x, e.y, 0.3, 8, '#e8f0ff', 2.6, 0.04, 0.4, { kind: 'spark' });
        sfx('thunder'); break;
      }
      if (e.id === 'gwonyul') { fxRing(e.x, e.y, 0.15, e.r, '#c9a878', 5, 0.45); puff(e.x, e.y, 4, '#c9a878', 0.13, 0.7); burst(e.x, e.y, 0.3, 9, ['#8d8a84', '#6e6c66', '#c9a878'], 2.6, 0.06, 0.6, { up: 2 }); shake(0.06); sfx('stone'); break; }
      const big = e.id === 'jing';
      fxRing(e.x, e.y, 0.15, e.r, big ? '#f2c94a' : '#c47a3a', big ? 5 : 4, big ? 0.5 : 0.35);
      if (big) fxRing(e.x, e.y, 0.1, e.r * 0.7, '#fff3c0', 3, 0.4);
      puff(e.x, e.y, big ? 3 : 2, '#c9a878', 0.1, 0.5);
      sfx(big ? 'gong' : 'thump');
      break;
    }
    case 'tap': fxRing(e.x, e.y, 0.05, 0.38, e.n === 1 ? '#ff8a6a' : '#7aa8ff', 3, 0.22); if (e.n === 1) sfx('tap'); break;
    case 'pulse': {
      const P = { jangseung: ['#a8743f', 4], sangmo: ['#ffffff', 3], daejanggun: ['#f2a13a', 6], seungbyeong: ['#c9a878', 4] }[e.id] || ['#ffffff', 3];
      fxRing(e.x, e.y + 0.3, 0.3, e.r, P[0], P[1], e.id === 'daejanggun' ? 0.6 : 0.4);
      if (e.id === 'daejanggun') { fxFlash(e.x, e.y - 0.4, 0.8, '#ffb347', 0.3, 0.35); puff(e.x, e.y + 0.3, 4, '#c9a878', 0.12, 0.7); sfx('gong'); }
      else if (e.id === 'jangseung' || e.id === 'seungbyeong') sfx('thump');
      else sfx('whoosh');
      break;
    }
    case 'beat': {
      if (e.id === 'uibyeongdae') {
        fxRing(e.x, e.y + 0.3, 0.3, e.r, e.big ? '#ffffff' : pick(['#d63b2e', '#f4f0e6']), e.big ? 6 : 3, e.big ? 0.55 : 0.35);
        if (e.big) { burst(e.x, e.y, 0.6, 10, ['#d63b2e', '#f4f0e6', '#c9a878'], 2.5, 0.06, 0.7, { up: 1.5 }); shake(0.12); fxText(e.x, e.y - 1.3, '와아!', 'word', 0.8); sfx('slam'); }
        else sfx('whoosh');
        break;
      }
      fxRing(e.x, e.y + 0.3, 0.3, e.r, e.big ? '#f0c43a' : pick(['#d63b2e', '#2f5fb8', '#3a8a4a']), e.big ? 6 : 3, e.big ? 0.55 : 0.35);
      if (e.big) { burst(e.x, e.y, 0.6, 10, OBANG, 2.5, 0.06, 0.7, { up: 1.5 }); shake(0.12); }
      sfx(e.big ? 'beatBig' : 'beat');
      break;
    }
    case 'beam':
      if (e.id === 'uibyeong') { fxLine(e.x0, e.y0 - 0.2, e.x1, e.y1 - 0.2, '#e6dc9a', 0.05, 0.16, true); fxSlash(e.x1, e.y1 - 0.25, 0.18, Math.atan2(e.y1 - e.y0, e.x1 - e.x0), '#ffffff', 0.15); sfx('slash'); break; }
      fxLine(e.x0, e.y0 - UY + 0.3, e.x1, e.y1 - 0.2, '#ffd36a', 0.11, 0.3, true);
      fxFlash(e.x0, e.y0 - UY + 0.3, 0.45, '#fff2c0', 0.25, 0.5);
      for (let i = 0; i < 6; i++) { const t = Math.random(); part(lerp(e.x0, e.x1, t), lerp(e.y0, e.y1, t), 0.3, rand(-0.3, 0.3), rand(-0.2, 0.2), rand(0.3, 0.8), '#fff3c0', 0.04, 0.5, { g: 0.5 }); }
      sfx('beam');
      break;
    case 'whip': {
      const mx = (e.x0 + e.x1) / 2, my = (e.y0 + e.y1) / 2 - 0.6;
      FX.push({ k: 'zig', pts: [{ x: e.x0, y: e.y0 - 0.25 }, { x: mx, y: my }, { x: e.x1, y: e.y1 - 0.25 }], col: '#5a3418', w: 0.025, life: 0.14, t: 0, seed: 1 });
      fxSlash(e.x1, e.y1 - 0.3, 0.22, Math.atan2(e.y1 - e.y0, e.x1 - e.x0), '#ff6a4a', 0.22);
      sfx('whip');
      break;
    }
    case 'cone': {
      const hx = e.x0 + e.dx * 0.2, hy = e.y0 - 0.25 + e.dy * 0.2;
      if (e.id === 'chwibari' || e.id === 'geobukseon') {
        fxCone(hx, hy, e.dx, e.dy, e.len, e.w, '#ff8a3a', 0.35);
        const n = Math.round(16 * QUALITY[R.q].pmul);
        for (let i = 0; i < n; i++) { const a = Math.atan2(e.dy, e.dx) + rand(-e.w, e.w), s = rand(2.5, 4.5); part(hx, hy + 0.35, 0.35, Math.cos(a) * s, Math.sin(a) * s, rand(0, 0.5), pick(['#ffd36a', '#ff8a3a', '#ff5a2a']), rand(0.05, 0.08), rand(0.3, 0.5), { g: -0.6, drag: 2.2 }); }
        sfx('fire');
      } else { fxArc(hx, hy, e.dx, e.dy, e.len, e.w, '#ffe08a', 0.45); sfx('blow'); }
      break;
    }
    case 'devour':
      fxRing(e.x, e.y, 0.8, 0.05, '#9a5aff', 5, 0.4);
      puff(e.x, e.y, 4, '#4a2a6a', 0.12, 0.7);
      fxText(e.x, e.y - 0.9, '꿀꺽!', 'word', 0.9); sfx('bite');
      break;
    case 'bite': fxSlash(e.x, e.y - 0.35, e.big ? 0.32 : 0.22, -PI / 2, '#b07aff', 0.2); fxSlash(e.x, e.y - 0.15, e.big ? 0.32 : 0.22, PI / 2, '#b07aff', 0.2); sfx('bite'); break;
    case 'leap': { const v = UVIS.get(e.uid); if (v) v.leap = { t: 0, d1: 0.42 / G.speed, d2: 0.45 / G.speed, x0: cellX(e.cell), y0: cellY(e.cell), x1: e.x, y1: e.y, back: false }; puff(cellX(e.cell), cellY(e.cell) + 0.3, 3, '#c9a878', 0.1, 0.5); break; }
    case 'slam': {
      const saja = e.id === 'saja';
      fxRing(e.x, e.y, 0.2, e.r * 1.15, '#f2c14a', saja ? 7 : 5, 0.5);
      fxRing(e.x, e.y, 0.1, e.r * 0.8, '#ffffff', 3, 0.35);
      puff(e.x, e.y, saja ? 8 : 5, '#c9a878', 0.14, 0.8);
      burst(e.x, e.y, 0.1, saja ? 14 : 8, ['#f6e7c4', '#c9a878'], 3, 0.05, 0.6, { up: 2 });
      shake(saja ? 0.4 : 0.2);
      if (saja) fxText(e.x, e.y - 1.0, '어흥!', 'word', 1.0);
      sfx('slam');
      break;
    }
    case 'waveFx': fxFlash(e.x, e.y - 0.3, 0.45, e.id === 'simcheong' ? '#7ab8ff' : '#ff8a5a', 0.25, 0.45); sfx('wave'); break;
    case 'storm': for (const q of e.pts) { fxZig([{ x: q.x + rand(-0.3, 0.3), y: q.y - 5 }, { x: q.x + rand(-0.4, 0.4), y: q.y - 2.5 }, { x: q.x, y: q.y - 0.2 }], '#cfe8ff', 0.06, 0.35); fxFlash(q.x, q.y - 0.3, 0.7, '#e0f0ff', 0.25, 0.6); } shake(0.12); sfx('thunder'); break;
    case 'fireCall': { const p = unitPos(e.cell); fxFlash(p.x, p.y - 0.8, 0.6, '#ffb347', 0.3, 0.5); FX.push({ k: 'fall', x: e.x, y: e.y, life: 0.45 / Math.max(1, G.speed), t: 0 }); break; }
    case 'fireLand': fxRing(e.x, e.y, 0.2, e.r, '#ff6a2a', 6, 0.5); fxFlash(e.x, e.y - 0.3, e.r, '#ffb347', 0.4, 0.55); burst(e.x, e.y, 0.3, 18, ['#ffd36a', '#ff6a2a', '#d8392a'], 3, 0.06, 0.8, { up: 2, g: 0.5 }); sfx('fire'); break;
    case 'axeThrow': fxFlash(e.x + e.dir * 0.3, e.y - 0.5, 0.4, '#ffe08a', 0.2, 0.5); sfx('whoosh'); break;
    case 'sky': {
      const p = unitPos(e.cell);
      fxFlash(0, 0, 5, e.moon ? '#8aa8ff' : '#ffcf6a', 0.7, 0.3); fxText(p.x, p.y - 1.9, e.moon ? '달이 떴다' : '해가 떴다', 'word', 1.2);
      burst(p.x, p.y - 1.0, 0.4, 16, e.moon ? ['#e8f0ff', '#a8c0ff'] : ['#fff1a8', '#ffb347'], 3, 0.06, 0.8, { g: -0.3 }); sfx('gong'); break;
    }
    case 'song': {
      const p = unitPos(e.cell);
      for (let i = 0; i < 14; i++) part(p.x + rand(-0.4, 0.4), p.y - 0.6, 0.3, rand(-1.4, 1.4), rand(-1.6, -0.6), rand(0.8, 1.3), pick(['#ffb3e0', '#fff1a8', '#a8e0ff']), 0.06, 1.2, { g: -0.2, drag: 1, kind: 'petal' });
      fxText(p.x, p.y - 1.8, '얼씨구 좋다!', 'word', 1.3); if (e.coins) fxText(p.x, p.y - 1.3, `엽전 +${e.coins}`, 'coin', 1.2);
      FX.push({ k: 'ring', x: 0, y: 0, r0: 0.5, r1: 6.5, col: '#ffb3e0', w: 4, life: 0.9, t: 0, flat: 0.75 }); sfx('gut'); break;
    }
    case 'tide': {
      if (e.small) { FX.push({ k: 'ring', x: 0, y: 0, r0: 6.5, r1: 0.8, col: '#5aa8e8', w: 5, life: 0.7, t: 0, flat: 0.75 }); const q = unitPos(e.cell); fxText(q.x, q.y - 1.8, '북방의 물결', 'word', 1.0); sfx('wave'); break; }
      for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: 0, y: 0, r0: 6.5, r1: 0.6, col: i % 2 ? '#e0f0ff' : '#4a9ae8', w: 7, life: 0.8, t: -i * 0.12, flat: 0.75 });
      const p = unitPos(e.cell); fxText(p.x, p.y - 1.8, '인당수!', 'word', 1.2); burst(0, 0, 3, 30, ['#bfe0ff', '#4a9ae8', '#ffffff'], 4, 0.06, 0.9, { up: 1.5, g: 1 }); shake(0.3); sfx('wave'); break;
    }
    case 'ship': { const p = unitPos(e.cell); fxText(p.x, p.y - 1.7, '무역선이 들어왔다!', 'word', 1.1); fxText(p.x, p.y - 1.2, `혼 +${e.hon}`, 'coin', 1.1); fxRing(p.x, p.y, 0.2, 1.4, '#5ab0ff', 4, 0.6); sfx('gong'); break; }
    case 'hon': fxText(e.x, e.y - 0.6, `혼 +${e.v}`, 'coin', 1.1); break;
    case 'mission': sfx('upgrade'); R.missNew = true; if (e.coins) flyCoin(0, -3.2, COIN_EL, 3); break;
    case 'steal': fxText(e.x, e.y - 1.0, '슬쩍!', 'word', 0.8); burst(e.x, e.y - 0.4, 0.3, 6, ['#f2c94a', '#fff2b0'], 1.4, 0.05, 0.5, { up: 2, g: 1.2 }); break;
    case 'execute': for (let i = 0; i < 5; i++) part(e.x + rand(-0.15, 0.15), e.y, 0.3, 0, 0, rand(0.8, 1.4), '#e8f4ff', 0.06, 1.0, { g: -0.5, drag: 0.6, kind: 'petal' }); break;
    case 'command': {
      const p = unitPos(e.cell);
      for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: p.x, y: p.y, r0: 0.3, r1: 4.5, col: '#8a6aff', w: 4, life: 0.8, t: -i * 0.15, flat: 0.55 });
      fxText(p.x, p.y - 1.5, '물렀거라!', 'word', 1.1); shake(0.15); sfx('command');
      break;
    }
    case 'charm': for (let i = 0; i < 4; i++) part(e.x, e.y, 0.6, rand(-0.6, 0.6), rand(-0.3, 0.3), rand(0.6, 1.2), '#ff6aa0', 0.08, 0.7, { g: 0.5, kind: 'heart' }); break;
    case 'safe': bump(el.coins.parentElement); cache.safeShow = { v: e.v, t: performance.now() }; sfx('coin'); break;
    case 'coin': fxText(e.x, e.y - (e.big ? 1.25 : 0.8), `+${fmtC(e.v)}`, 'coin', e.big ? 1.25 : 0.95); if (e.big) burst(e.x, e.y - 0.6, 0.3, 8, ['#f2c94a', '#fff2b0'], 1.6, 0.05, 0.6, { up: 2, g: 1.2 }); flyCoin(e.x, e.y - 0.5, COIN_EL, 1); sfx('coin'); break;
    case 'kill': {
      if (e.boss) {
        unlockStory('b_' + e.boss);
        fxFlash(e.x, e.y - 0.6, 2.2, '#fff3c0', 0.7, 0.55);
        for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: e.x, y: e.y, r0: 0.4, r1: 3 + i, col: i % 2 ? '#f2c14a' : '#ffffff', w: 6, life: 0.8 + i * 0.2, t: 0, flat: 0.55 });
        burst(e.x, e.y, 0.6, 50, OBANG, 4.5, 0.08, 1.3, { up: 2.2 });
        puff(e.x, e.y, 12, '#5a4a60', 0.22, 1.2);
        shake(0.7); R.slowmo = 0.8; sfx('bosskill');
        flyCoin(e.x, e.y - 0.6, COIN_EL, 8);
      } else {
        puff(e.x, e.y, 2, e.kind === 2 || e.kind === 7 ? '#e8e2d6' : '#6a5a70', 0.1, 0.5);
        part(e.x, e.y, 0.45, 0, 0, 0.9, '#9ad8ff', 0.07, 0.7, { g: -0.3, drag: 0.5 });
        if (e.reward && Math.random() < 0.3) flyCoin(e.x, e.y - 0.3, COIN_EL, 1);
        sfx('kill');
      }
      break;
    }
    case 'summon': {
      firstTier(e.tier, e.cell);
      const p = unitPos(e.cell), T = TIERS[e.tier];
      puff(p.x, p.y, 3, '#e6dccb', 0.1, 0.5);
      fxRing(p.x, p.y - 0.18, 0.1, 0.55, T.color, 3, 0.4);
      if (e.tier >= 1) burst(p.x, p.y, 0.3, 6 + e.tier * 5, T.light, 1.6, 0.05, 0.7, { up: 2, g: -0.5 });
      if (e.tier >= 2) fxFlash(p.x, p.y - 0.5, 0.7, T.color, 0.4, 0.35);
      sfx('summon', e.tier);
      break;
    }
    case 'charm': { fxFlash(0, 0, 4.5, '#ffd36a', 0.6, 0.28); for (let k = 0; k < NCELL; k++) if (G.units[k]) fxRing(cellX(k), cellY(k) + 0.2, 0.1, 0.5, '#ffd36a', 3, 0.5); sfx('gong'); break; }
    case 'gut': case 'gutfail': {
      const p = unitPos(e.cell);
      for (let i = 0; i < 18; i++) { const a = i / 18 * TAU; part(p.x + Math.cos(a) * 0.5, p.y + Math.sin(a) * 0.25, 0.1, -Math.cos(a) * 0.8, -Math.sin(a) * 0.4, 1.6, OBANG[i % 5], 0.05, 0.7, { g: 0.5, drag: 1, kind: 'petal' }); }
      if (e.k === 'gut') { firstTier(e.tier, e.cell); const T = TIERS[e.tier]; fxFlash(p.x, p.y - 0.5, 0.9, T.color, 0.5, 0.4); fxRing(p.x, p.y - 0.18, 0.1, 0.9, T.color, 4, 0.55); if (e.tier >= 3) shake(0.2); sfx('gut'); }
      else { puff(p.x, p.y, 5, '#7a7678', 0.14, 0.9); fxText(p.x, p.y - 1.0, '꽝', 'word', 1.0); sfx('gutfail'); }
      break;
    }
    case 'merge': {
      firstTier(e.tier, e.to);
      const a = unitPos(e.from), b = unitPos(e.to), T = TIERS[e.tier];
      for (let i = 0; i < 10; i++) { const t = rand(0.35, 0.6); part(a.x + rand(-0.15, 0.15), a.y, rand(0.3, 0.8), (b.x - a.x) / t, (b.y - a.y) / t, 0, T.light, 0.05, t, { g: 0, drag: 0 }); }
      puff(a.x, a.y, 2, '#e6dccb', 0.1, 0.4);
      fxRing(b.x, b.y - 0.18, 0.1, 0.75, T.color, 4, 0.5);
      fxFlash(b.x, b.y - 0.5, 0.75, T.color, 0.45, 0.4);
      burst(b.x, b.y, 0.4, 8 + e.tier * 4, T.light, 1.8, 0.05, 0.7, { up: 2, g: -0.3 });
      sfx('merge', e.tier);
      break;
    }
    case 'combo': {
      const C = COMBOS.find(c => c.id === e.id); if (!C) break;
      showBanner(`합동기 · ${C.name}`, C.line, false, true);
      fxFlash(0, -HY, 3.2, '#ffe6a0', 0.7, 0.5); fxRing(0, -HY, 0.3, 4.5, '#ffd36a', 7, 0.8); shake(0.35); pulseVignette();
      sfx('gong'); setTimeout(() => sfx('ult'), 160);
      break;
    }
    case 'craft': {
      unlockStory('m_' + e.id);
      const b = unitPos(e.cell), T = TYPES[TYPE_IX[e.id]];
      for (const fr of e.from) { const a = unitPos(fr.cell); for (let i = 0; i < 8; i++) { const t = rand(0.45, 0.7); part(a.x + rand(-0.15, 0.15), a.y, rand(0.3, 0.9), (b.x - a.x) / t, (b.y - a.y) / t, 0, pick(OBANG), 0.06, t, { g: 0, drag: 0 }); } puff(a.x, a.y, 2, '#e6dccb', 0.1, 0.4); }
      FX.push({ k: 'ring', x: b.x, y: b.y - 0.15, r0: 0.1, r1: 1.4, col: '#e2563c', w: 6, life: 0.7, t: -0.45, flat: 0.55 });
      FX.push({ k: 'flash', x: b.x, y: b.y - 0.55, r: 1.3, col: '#ffcf8a', life: 0.7, t: -0.45, a: 0.5 });
      setTimeout(() => { burst(b.x, b.y, 0.5, 26, OBANG, 3, 0.07, 1.0, { up: 2.2, g: 0.6 }); shake(0.3); }, 450 / Math.max(1, G.speed));
      if (T.grp === 'beast') { for (let i = 0; i < 5; i++) FX.push({ k: 'ring', x: b.x, y: b.y - 0.15, r0: 0.2, r1: 2.6 + i * 0.35, col: ['#2f6ad8', '#e2402e', '#f4f0e6', '#1f1a17', '#f2c43a'][i], w: 5, life: 0.9, t: -0.45 - i * 0.07, flat: 0.55 }); fxFlash(b.x, b.y - 0.8, 2.5, '#b4f2e6', 0.9, 0.5); }
      if (T.grp === 'tale') { for (let i = 0; i < 6; i++) FX.push({ k: 'ring', x: b.x, y: b.y - 0.15, r0: 0.2, r1: 3 + i * 0.4, col: ['#e2402e', '#f2c43a', '#3fae6a', '#3a6ad8', '#b06aff', '#ff7ab8'][i], w: 5, life: 1.0, t: -0.45 - i * 0.08, flat: 0.55 }); fxFlash(0, 0, 6, '#fff3d0', 1.0, 0.4); }
      showBanner(T.grp === 'tale' ? '전래동화가 깨어났다' : T.grp === 'beast' ? '신수가 내려왔다' : '신화 탄생', `${T.name} · ${T.skill}`, false, true);
      cutIn(T.id, T.grp === 'tale' ? '전래동화' : T.grp === 'beast' ? '신수 강림' : '신화 탄생', T.name, true);
      sfx('craft');
      break;
    }
    case 'stack': { const b = unitPos(e.to); fxRing(b.x, b.y - 0.18, 0.1, 0.5, '#ffffff', 3, 0.3); sfx('tap'); break; }
    case 'sell': { const p = unitPos(e.cell); puff(p.x, p.y, 3, '#cfc6b4', 0.1, 0.5); fxText(p.x, p.y - 0.9, `+${e.v}`, 'coin', 0.8); sfx('sell'); break; }
    case 'upgrade':
      for (let i = 0; i < NCELL; i++) { const u = G.units[i]; if (!u) continue; const T = TYPES[u.t]; if (e.g === LUCK || upGroup(T) === e.g) { const p = unitPos(i); burst(p.x, p.y, 0.2, 5, e.g === LUCK ? TIERS[T.tier].light : UP_COLOR[e.g], 1.2, 0.045, 0.7, { up: 1.5, g: -0.6 }); } }
      sfx('upgrade');
      break;
    case 'banner': showBanner(e.main, e.sub, e.boss); break;
    case 'bossSpawn': { const p = pathAt(0.1); fxFlash(p.x, p.y - 0.4, 1.6, '#b48cff', 0.8, 0.5); fxRing(p.x, p.y, 0.2, 2.2, '#9a6bff', 6, 0.8); shake(0.45); pulseVignette(); sfx('boss'); musicMode('boss'); break; }
    case 'howl':
      for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: e.x, y: e.y, r0: 0.4, r1: 4, col: '#c8a8ff', w: 5, life: 0.9, t: -i * 0.18, flat: 0.55 });
      for (const c of e.cells) { const p = unitPos(c); fxLine(e.x, e.y - 0.8, p.x, p.y - 0.6, '#b48cff', 0.04, 0.4, false); fxRing(p.x, p.y - 0.15, 0.1, 0.55, '#b48cff', 3, 0.5); }
      fxText(e.x, e.y - 1.8, '어흐응…', 'word', 1.2); shake(0.2); sfx('howl');
      break;
    case 'blink':
      for (const [x, y] of [[e.x0, e.y0], [e.x1, e.y1]]) { fxFlash(x, y - 0.5, 0.9, '#7ad8ff', 0.45, 0.5); burst(x, y, 0.5, 14, ['#c8f2ff', '#7ad8ff'], 2.5, 0.06, 0.7, { g: -0.5 }); }
      puff(e.x0, e.y0, 5, '#5a6a8a', 0.14, 0.8); sfx('blink');
      break;
    case 'chalSpawn': { const p = pathAt(0.1); fxFlash(p.x, p.y - 0.4, 1.1, '#b06aff', 0.6, 0.45); fxRing(p.x, p.y, 0.2, 1.6, '#b06aff', 5, 0.7); fxText(p.x + 0.6, p.y - 1.2, CHALS.find(c => c.id === e.id).name, 'word', 1.2); sfx('chal'); break; }
    case 'chalWin': {
      fxFlash(e.x, e.y - 0.5, 1.2, '#ffd36a', 0.5, 0.5); fxRing(e.x, e.y, 0.3, 1.8, '#f2c14a', 5, 0.6);
      burst(e.x, e.y, 0.6, 26, ['#ffd36a', '#fff3c0', '#b06aff'], 3, 0.06, 1.0, { up: 2 });
      fxText(e.x, e.y - 1.3, `엽전 +${fmtC(e.coins)}`, 'coin', 1.3); flyCoin(e.x, e.y - 0.6, COIN_EL, 6);
      if (e.hon) fxText(e.x, e.y - 1.7, `혼 +${e.hon}`, 'big', 1.3);
      shake(0.2); sfx('chalWin'); break;
    }
    case 'expGo': {
      for (const c of e.cells) {
        const p = unitPos(c);
        puff(p.x, p.y, 4, '#cfc6b4', 0.12, 0.6); fxRing(p.x, p.y - 0.15, 0.1, 0.7, '#f2c14a', 4, 0.5);
        for (let i = 0; i < 6; i++) part(p.x + rand(-0.2, 0.2), p.y - 0.3, 0.4, rand(-0.3, 0.3), -rand(1.2, 2.2), 0.2, '#f2c14a', 0.05, 0.6, { g: 0.2, drag: 0.6 });
      }
      const p0 = unitPos(e.cells[0]);
      fxText(p0.x, p0.y - 1.1, e.cells.length > 1 ? `${e.cells.length}명 출정! ${destOf().label(e.n)}` : `출정! ${destOf().label(e.n)}`, 'word', 1.1); sfx('chal'); break;
    }
    case 'expEnd': {
      if (!e.cells.length) break;
      for (const c of e.cells) { const p = unitPos(c); if (e.win) { fxRing(p.x, p.y - 0.15, 0.2, 1.1, '#f2c14a', 4, 0.6); burst(p.x, p.y, 0.5, 10, ['#ffd36a', '#fff3c0', '#e2563c'], 2.2, 0.05, 0.8, { up: 2 }); } else puff(p.x, p.y, 4, '#6a5a70', 0.14, 0.8); }
      const p = unitPos(e.cells[0]);
      if (e.win) {
        fxFlash(p.x, p.y - 0.5, 1.0, '#ffd36a', 0.5, 0.5);
        fxText(p.x, p.y - 1.3, `${destOf().label(e.floor)} 격파!`, 'big', 1.4);
        e.got.slice(0, 3).forEach((t, k) => fxText(p.x, p.y - 1.75 - k * 0.38, t, 'coin', 1.6 + k * 0.15));
        if (e.got.some(t => t.startsWith('엽전'))) flyCoin(p.x, p.y - 0.6, COIN_EL, 5);
        shake(0.15); sfx('chalWin');
      } else { fxText(p.x, p.y - 1.1, `${destOf().place}에서 물러났다…`, 'word', 1.2); sfx('gutfail'); }
      break;
    }
    case 'curse': {
      fxLine(e.x0, e.y0 - 0.6, e.x, e.y - 0.4, '#b06aff', 0.03, 0.25, false);
      FX.push({ k: 'ring', x: e.x, y: e.y, r0: e.r * 0.2, r1: e.r, col: '#9a5ae0', w: 4, life: 0.5, t: 0, flat: 0.55 });
      fxFlash(e.x, e.y - 0.3, e.r * 0.7, '#c08aff', 0.3, 0.3);
      for (let i = 0; i < 5; i++) part(e.x + rand(-e.r, e.r) * 0.7, e.y + rand(-0.3, 0.3), rand(0.3, 0.8), 0, 0, rand(0.4, 0.9), '#f4d75a', 0.05, 0.7, { g: 0.4, drag: 1, kind: 'petal' });
      sfx('curse'); break;
    }
    case 'clone': {
      e.pts.forEach((q, k) => {
        if (k > 0) puff(q.x - 0.25, q.y, 2, '#d8d2e4', 0.1, 0.4);
        fxSlash(q.x, q.y - 0.35, 0.5, (k - 1) * 0.6 + rand(-0.2, 0.2), k === 0 ? '#e8f0ff' : '#c8d4ff', 0.22);
      });
      if (e.pts.length > 1) fxLine(e.x0, e.y0 - 0.5, e.pts[1].x, e.pts[1].y - 0.4, 'rgba(200,212,255,.6)', 0.025, 0.18, false);
      sfx('slash'); break;
    }
    case 'chalFail': puff(e.x, e.y, 6, '#4a3a5a', 0.16, 0.9); fxText(e.x, e.y - 1.0, '놓쳤다…', 'word', 1.1); sfx('gutfail'); break;
    case 'volley': fxArc(e.x + e.dx * 0.2, e.y - 0.35 + e.dy * 0.2, e.dx, e.dy, 1.2, 0.5, '#fff3c0', 0.3); sfx('arrows'); break;
    case 'rockets': puff(e.x, e.y + 0.1, 4, '#b8b2a8', 0.12, 0.8); fxFlash(e.x + 0.2, e.y - 0.5, 0.5, '#ffb347', 0.2, 0.5); sfx('rocket'); break;
    case 'cannonFire': puff(e.x + e.dir * 0.5, e.y - 0.3, 5, '#cfc8bc', 0.14, 0.8); fxFlash(e.x + e.dir * 0.5, e.y - 0.4, 0.6, '#ffcf6a', 0.2, 0.6); shake(0.08); sfx('cannon'); break;
    case 'boom':
      fxFlash(e.x, e.y - 0.3, e.r * 1.1, '#ffb347', 0.35, 0.6); fxRing(e.x, e.y, 0.2, e.r * 1.1, '#ff8a3a', 5, 0.45);
      burst(e.x, e.y, 0.3, 14, ['#ffd36a', '#ff6a2a', '#5a5048'], 3, 0.06, 0.6, { up: 2 }); puff(e.x, e.y, 5, '#6a6058', 0.15, 0.9); shake(0.15); sfx('boom'); break;
    case 'dropFx': FX.push({ k: 'fall', x: e.x, y: e.y, life: e.t / Math.max(1, G.speed), t: 0 }); break;
    case 'quake':
      fxRing(e.x, e.y, 0.2, e.r * 1.2, '#c9a878', 7, 0.6); fxRing(e.x, e.y, 0.1, e.r * 0.8, '#ffffff', 3, 0.4);
      puff(e.x, e.y, 9, '#b09a78', 0.18, 1.1); burst(e.x, e.y, 0.1, 16, ['#8d8a84', '#c9a878', '#6e6c66'], 3.4, 0.07, 0.8, { up: 2.2 }); shake(0.4); sfx('quake'); break;
    case 'revive': for (let i = 0; i < 8; i++) part(e.x, e.y, 0.2, rand(-1, 1), rand(-0.5, 0.5), rand(0.6, 1.2), '#9ad8ff', 0.05, 0.6, { g: 3 }); fxText(e.x, e.y - 0.8, '다시 일어났다', 'word', 0.9); sfx('revive'); break;
    case 'burrow': case 'emerge': puff(e.x, e.y, 7, '#9a7a4a', 0.16, 0.8); burst(e.x, e.y, 0.2, 10, ['#9a7a4a', '#7a5a32'], 2.4, 0.06, 0.6, { up: 2 }); if (e.k === 'burrow') fxText(e.x, e.y - 1.2, '땅속으로!', 'word', 1.0); sfx('burrow'); break;
    case 'gulp':
      for (const pt of e.pts) { fxLine(pt.x, pt.y - 0.2, e.x, e.y - 0.8, '#7a9a5a', 0.05, 0.3, false); puff(pt.x, pt.y, 2, '#5a6a42', 0.1, 0.5); }
      fxText(e.x, e.y - 2.0, e.n ? `꿀꺽 ${e.n}마리` : '크르릉', 'word', 1.1); if (e.n) fxFlash(e.x, e.y - 0.8, 1.0, '#9ae07a', 0.4, 0.4); sfx('gulp'); break;
    case 'cloud': FX.push({ k: 'cloud', col: e.col, life: 2.0 / Math.max(1, G.speed), t: 0 }); fxText(e.x, e.y - 1.6, '먹구름', 'word', 1.0); sfx('cloud'); break;
    case 'summonGhosts': fxFlash(e.x, e.y - 0.6, 1.3, '#9a7aff', 0.5, 0.45); for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: e.x, y: e.y, r0: 0.3, r1: 2.2, col: '#9a7aff', w: 4, life: 0.7, t: -i * 0.12, flat: 0.55 }); fxText(e.x, e.y - 2.0, '망령들아!', 'word', 1.1); sfx('howl'); break;
    case 'judge': { const p = unitPos(e.cell); fxLine(e.x, e.y - 1.2, p.x, p.y - 0.7, '#ff5a3a', 0.06, 0.45, true); fxRing(p.x, p.y - 0.15, 0.1, 0.7, '#ff5a3a', 4, 0.6); fxText(p.x, p.y - 1.5, '심판!', 'word', 1.1); shake(0.15); sfx('judge'); break; }
    case 'ult': {
      cutIn(e.id, '궁극기', e.name, false);
      const p = unitPos(e.cell);
      fxFlash(p.x, p.y - 0.6, 1.2, '#fff3c0', 0.4, 0.55); fxRing(p.x, p.y, 0.2, 1.6, '#ffd36a', 6, 0.5);
      fxText(p.x, p.y - 1.75, e.name, 'word', 1.3); shake(0.22); sfx('ult');
      if (e.id === 'samulpae') { for (let i = 0; i < 4; i++) FX.push({ k: 'ring', x: 0, y: 0, r0: 0.5, r1: 6.5, col: OBANG[i], w: 6, life: 0.9, t: -i * 0.12, flat: 0.75 }); burst(0, 0, 0.5, 40, OBANG, 5, 0.07, 1.1, { up: 2 }); shake(0.45); }
      else if (e.id === 'bari') { for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: e.tx, y: e.ty, r0: 2.2, r1: 0.2, col: '#e8f4ff', w: 5, life: 0.7, t: -i * 0.15, flat: 0.55 }); fxFlash(e.tx, e.ty - 0.4, 2.0, '#dfeaff', 0.6, 0.5); for (let i = 0; i < 20; i++) part(e.tx + rand(-1.5, 1.5), e.ty + rand(-0.8, 0.8), 0.2, 0, 0, rand(0.8, 1.6), '#ffffff', 0.06, 1.2, { g: -0.6, kind: 'petal', drag: 0.8 }); }
      else if (e.id === 'daejanggun') { fxRing(p.x, p.y, 0.3, 3.4, '#f2a13a', 8, 0.8); fxFlash(p.x, p.y - 0.3, 3.2, '#ffb347', 0.6, 0.3); }
      else if (e.id === 'cheoyong') fxFlash(p.x, p.y - 0.4, 1.6, '#ff6a4a', 0.4, 0.5);
      else if (e.id === 'bihyeong') { fxRing(p.x, p.y, 0.2, 2.6, '#7ac8ff', 6, 0.6); burst(p.x, p.y, 0.6, 18, ['#c8f2ff', '#5ab0ff'], 3, 0.06, 0.8, { g: -0.4 }); }
      else if (e.id === 'geobukseon') { puff(p.x, p.y - 0.2, 10, '#cfc8bc', 0.16, 1.0); sfx('cannon'); }
      else if (e.id === 'uibyeongdae') { for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: p.x, y: p.y, r0: 0.3, r1: 3.2, col: i % 2 ? '#f4f0e6' : '#d63b2e', w: 5, life: 0.7, t: -i * 0.12, flat: 0.55 }); fxText(p.x, p.y - 2.2, '장수 공격력 +50%', 'coin', 1.4); }
      else if (e.id === 'cheongryong') { for (const q of e.pts || []) { fxZig([{ x: q.x + rand(-0.3, 0.3), y: q.y - 6 }, { x: q.x + rand(-0.5, 0.5), y: q.y - 3 }, { x: q.x, y: q.y - 0.2 }], '#cfe8ff', 0.07, 0.45); fxFlash(q.x, q.y - 0.3, 0.8, '#e0f0ff', 0.3, 0.6); } fxFlash(0, 0, 6, '#3a4a6a', 0.8, 0.35); shake(0.35); sfx('thunder'); }
      else if (e.id === 'jujak') { for (let i = 0; i < 4; i++) FX.push({ k: 'ring', x: 0, y: 0, r0: 0.5, r1: 6.5, col: ['#ffd36a', '#ff6a2a', '#d8392a', '#ffb347'][i], w: 6, life: 0.9, t: -i * 0.1, flat: 0.75 }); burst(0, 0, 3, 40, ['#ffd36a', '#ff6a2a', '#d8392a'], 5, 0.07, 1.1, { up: 2 }); shake(0.4); sfx('fire'); }
      else if (e.id === 'baekho') { for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: p.x, y: p.y, r0: 0.3, r1: 6, col: '#f4f0e6', w: 6, life: 0.8, t: -i * 0.12, flat: 0.6 }); fxText(p.x, p.y - 2.2, '어흥!', 'word', 1.3); shake(0.5); sfx('howl'); }
      else if (e.id === 'hyeonmu') { for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: 0, y: 0, r0: 6.5, r1: 0.6, col: i % 2 ? '#e0f0ff' : '#2a6ab8', w: 7, life: 0.8, t: -i * 0.12, flat: 0.75 }); burst(0, 0, 3, 30, ['#bfe0ff', '#2a6ab8'], 4, 0.06, 0.9, { up: 1.5, g: 1 }); shake(0.3); sfx('wave'); }
      else if (e.id === 'yongwang') {
        for (let i = 0; i < 5; i++) FX.push({ k: 'ring', x: e.tx, y: e.ty, r0: 2.4 - i * 0.2, r1: 0.2, col: i % 2 ? '#bfefff' : '#3aa0e8', w: 6 - i, life: 0.9, t: -i * 0.12, flat: 0.55 });
        fxFlash(e.tx, e.ty - 0.3, 2.4, '#7fd8ff', 0.55, 0.6);
        for (let i = 0; i < 26; i++) { const a = i / 26 * TAU; part(e.tx + Math.cos(a) * 2, e.ty + Math.sin(a) * 1, 0.2, -Math.sin(a) * 2.6 - Math.cos(a) * 1.6, Math.cos(a) * 1.3 - Math.sin(a) * 0.8, 0.8, i % 3 ? '#9fe4ff' : '#ffffff', 0.06, 0.8, { g: 0, drag: 1.2 }); }
        fxText(e.tx, e.ty - 1.6, '용궁 소용돌이!', 'word', 1.2); shake(0.3);
      }
      else if (e.id === 'hwangryong') { fxFlash(0, 0, 7, '#fff1a8', 0.9, 0.5); for (let i = 0; i < 4; i++) FX.push({ k: 'ring', x: p.x, y: p.y, r0: 0.3, r1: 6.5, col: '#ffd36a', w: 6, life: 0.9, t: -i * 0.12, flat: 0.6 }); burst(p.x, p.y - 1, 0.5, 36, ['#fff6d8', '#ffd36a', '#e6b23a'], 5, 0.07, 1.1, { up: 1.5 }); shake(0.5); sfx('thunder'); }
      else if (e.id === 'haedal') { fxZig([{ x: e.tx, y: e.ty - 6 }, { x: e.tx + 0.1, y: e.ty - 3 }, { x: e.tx, y: e.ty - 0.3 }], '#f2d27a', 0.07, 0.6); fxFlash(e.tx, e.ty - 0.4, 1.8, '#fff1a8', 0.7, 0.6); fxFlash(0, 0, 6, '#fff7dc', 0.5, 0.35); shake(0.4); }
      else if (e.id === 'hokburi') { fxFlash(e.tx, e.ty - 0.4, 1.0, '#ffb3e0', 0.5, 0.6); fxText(e.tx, e.ty - 1.2, '혹 떼였다!', 'word', 1.2); burst(e.tx, e.ty - 0.3, 0.3, 14, ['#f0c49a', '#ffd36a'], 3, 0.06, 0.8, { up: 2, g: 1 }); }
      else if (e.id === 'namukkun') { for (const q of e.pts || []) { FX.push({ k: 'fall', x: q.x, y: q.y, life: 0.5 / Math.max(1, G.speed), t: 0 }); fxFlash(q.x, q.y - 0.4, 0.7, '#ffe08a', 0.4, 0.6); } fxText(p.x, p.y - 2.2, '금도끼 은도끼!', 'coin', 1.2); }
      else if (e.id === 'simcheong') { for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: p.x, y: p.y, r0: 0.3, r1: 4.5, col: i % 2 ? '#ffd6e4' : '#ff8ab4', w: 6, life: 0.9, t: -i * 0.15, flat: 0.55 }); burst(p.x, p.y - 0.5, 0.5, 26, ['#ffc2d8', '#ff8ab4', '#fff1a8'], 4, 0.06, 1.1, { up: 1.5, g: -0.2 }); fxText(p.x, p.y - 2.2, '모두 60% 빨리', 'coin', 1.2); }
      else if (e.id === 'choimuseon') { for (const q of e.pts || []) fxFlash(q.x, q.y - 0.3, 1.0, '#ffb347', 0.4, 0.5); fxText(p.x, p.y - 2.2, '주화 발사!', 'word', 1.2); shake(0.3); sfx('cannon'); }
      else if (e.id === 'yeongno') { for (const q of e.pts || []) { fxSlash(q.x, q.y - 0.35, 0.3, -PI / 2, '#b07aff', 0.25); puff(q.x, q.y, 3, '#5a4a60', 0.12, 0.6); } fxText(p.x, p.y - 2.2, '꿀꺽!', 'word', 1.3); sfx('bite'); }
      else if (e.id === 'gangrim') { for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: 0, y: 0, r0: 6.5, r1: 0.5, col: i % 2 ? '#f4f0e6' : '#c23a3a', w: 5, life: 0.8, t: -i * 0.12, flat: 0.75 }); fxText(p.x, p.y - 2.2, '명부에 올랐다!', 'word', 1.2); sfx('command'); }
      else if (e.id === 'gimseondal') { fxRing(e.tx, e.ty, 0.2, 2.0, '#5ab0ff', 6, 0.6); burst(e.tx, e.ty, 0.4, 24, ['#bfe0ff', '#5ab0ff', '#ffffff'], 3, 0.06, 0.8, { up: 2, g: 1 }); fxText(p.x, p.y - 2.2, '대동강 물 사려!', 'word', 1.2); sfx('wave'); }
      else if (e.id === 'jangbogo') { puff(p.x, p.y - 0.2, 10, '#cfc8bc', 0.16, 1.0); fxText(p.x, p.y - 2.2, '청해진 무역선!', 'word', 1.2); sfx('cannon'); }
      else if (e.id === 'honggildong') { for (const q of e.pts || []) { fxSlash(q.x, q.y - 0.3, 0.3, rand(-PI, PI), '#ff6a5a', 0.2); } fxText(p.x, p.y - 2.2, '동에 번쩍 서에 번쩍!', 'word', 1.2); sfx('whoosh'); }
      else if (e.id === 'seolmundae') FX.push({ k: 'fall', x: e.tx, y: e.ty, life: 0.8 / Math.max(1, G.speed), t: 0, big: true });
      break;
    }
    case 'rage': fxFlash(e.x, e.y - 0.5, 1.5, '#ffe08f', 0.6, 0.5); fxRing(e.x, e.y, 0.3, 2.5, '#f2c14a', 6, 0.8); shake(0.4); fxText(e.x, e.y - 1.5, '승천하리라!', 'word', 1.3); sfx('howl'); break;
  }
}
function hitFx(e) {
  const x = e.x, y = e.y, z = e.boss ? 0.8 : 0.35;
  switch (e.kind) {
    case 'stone': burst(x, y, z, 3, ['#bdb6aa', '#8d8a84'], 1.6, 0.035, 0.35); break;
    case 'gust': fxRing(x, y, 0.05, 0.45, '#b9f2a0', 3, 0.3); sfx('gust'); break;
    case 'yarn': fxRing(x, y, 0.45, 0.08, '#8ec4ff', 3, 0.35); break;
    case 'bird': burst(x, y, z, 4, ['#d8b07a', '#8a6440'], 1.6, 0.04, 0.4, { kind: 'petal' }); break;
    case 'petal': for (let i = 0; i < 4; i++) part(x, y, z, rand(-0.8, 0.8), rand(-0.4, 0.4), rand(0.3, 1), pick(['#ffc2dc', '#ff8fb8']), 0.05, 0.6, { g: 1, kind: 'petal', drag: 1.5 }); break;
    case 'cleaver': fxSlash(x, y - 0.3, 0.28, rand(0, TAU), '#ffffff', 0.2); fxRing(x, y, 0.1, 1.0, '#e0e6ff', 2.5, 0.3); sfx('slash'); break;
    case 'coin': burst(x, y, z, 3, '#f2c94a', 1.4, 0.04, 0.4); break;
    case 'ink': burst(x, y, z, 5, ['#1e2040', '#3a3f7a'], 1.4, 0.05, 0.5, { g: 3 }); break;
    case 'bolt': fxFlash(x, y - 0.3, e.crit ? 0.5 : 0.28, '#ffe08f', 0.18, e.crit ? 0.55 : 0.4); if (e.crit) burst(x, y, z, 6, '#fff3b0', 2.4, 0.04, 0.4, { kind: 'spark' }); break;
    case 'onibi': fxFlash(x, y - 0.3, 0.5, '#7ac8ff', 0.25, 0.5); burst(x, y, z, 5, ['#c8f2ff', '#5ab0ff'], 1.8, 0.05, 0.5, { g: -0.5 }); break;
    case 'wave': fxFlash(x, y - 0.3, e.boss ? 0.9 : 0.5, '#ff7a5a', 0.25, 0.45); if (e.boss) shake(0.12); break;
    case 'plate': burst(x, y, z, 3, ['#ffffff', '#d63b2e'], 1.6, 0.035, 0.35, { kind: 'spark' }); break;
    case 'arrow': case 'arrowP': burst(x, y, z, 2, ['#d9c08a', '#ffffff'], 1.4, 0.03, 0.3, { kind: 'spark' }); if (e.kind === 'arrow') sfx('arrow'); break;
    case 'rocket': fxFlash(x, y - 0.3, 0.4, '#ffb347', 0.2, 0.5); burst(x, y, z, 4, ['#ffd36a', '#ff6a2a'], 1.8, 0.04, 0.35, { kind: 'spark' }); break;
    case 'sogo': fxRing(x, y, 0.05, 0.35, '#ff8a6a', 2.5, 0.2); sfx('tap'); break;
    case 'sunfire': fxFlash(x, y - 0.3, 0.55, '#ffb347', 0.25, 0.55); burst(x, y, z, 5, ['#ffd36a', '#ff8a3a'], 1.8, 0.05, 0.45, { g: -0.4 }); sfx('fire'); break;
  }
}

/* the first 영웅 and 전설 of a run: a burst and a word, once each */
function firstTier(tier, cell) {
  if (!(tier >= 2 && tier <= 3) || cell == null || cell < 0 || !G.units[cell]) return;
  G.firstT = G.firstT || {};
  if (G.firstT[tier]) return;
  G.firstT[tier] = 1;
  const p = unitPos(cell), T = TIERS[tier], U = TYPES[G.units[cell].t];
  setTimeout(() => {
    fxFlash(p.x, p.y - 0.5, 1.6, T.color, 0.6, 0.6);
    for (let i = 0; i < 3; i++) FX.push({ k: 'ring', x: p.x, y: p.y - 0.15, r0: 0.2, r1: 1.6 + i * 0.4, col: i ? T.light : T.color, w: 5, life: 0.8, t: -i * 0.1, flat: 0.55 });
    burst(p.x, p.y, 0.4, 30, [T.color, T.light, '#fff6d8'], 3, 0.06, 1.0, { up: 2.4, g: 0.5 });
    shake(0.18);
    const last = U.name.charCodeAt(U.name.length - 1), josa = last >= 0xAC00 && last <= 0xD7A3 && (last - 0xAC00) % 28 ? '이' : '가';
    showBanner(`첫 ${T.name}`, `${U.name}${josa} 마당에 섰어요`, false, true);
  }, 250);
}
/* ultimate and big crafts: a portrait band sweeps across the screen. at most one every few seconds unless it's a craft */
let cutT = -1e9;
const CUT_COL = { yongwang: '#2a7fd4', cheongryong: '#2fa86a', jujak: '#e2402e', baekho: '#8a96a8', hyeonmu: '#2a5a8a', hwangryong: '#d9a22a' };
function cutIn(id, label, name, force) {
  if (!R.cutin || typeof document === 'undefined') return;
  const now = performance.now();
  if (!force && now - cutT < 7000) return;
  const el = document.getElementById('cutin'); if (!el) return;
  cutT = now;
  const T = TYPES[TYPE_IX[id]]; if (!T) return;
  const col = CUT_COL[id] || (T.grp === 'tale' ? '#b06aff' : T.grp === 'beast' ? '#2fbfa6' : T.tier >= 4 ? '#e2563c' : TIERS[T.tier].color);
  el.style.setProperty('--ci', col);
  /* a mythic with a big illustration shows it whole instead of the small portrait */
  const ill = typeof ILLUST !== 'undefined' && ILLUST[id] && ILLUST[id].complete && ILLUST[id].naturalWidth ? ILLUST[id] : null;
  el.classList.toggle('big', !!ill);
  el.querySelector('img').src = ill ? ill.src : portraitURL(id, 128);
  /* the picture sweeps across; its words only with 맵 위 글자 on */
  const words = !!R.mapText;
  el.querySelector('small').textContent = words ? label : '';
  el.querySelector('b').textContent = words ? name : '';
  el.querySelector('em').textContent = words ? (T.name === name ? T.skill : T.name) : '';
  el.classList.toggle('no-words', !words);
  el.hidden = false; el.classList.remove('go'); void el.offsetWidth; el.classList.add('go');
  clearTimeout(cutIn.t); cutIn.t = setTimeout(() => { el.hidden = true; el.classList.remove('go'); }, 1250);
  if (G.phase === 'play') R.slowmo = Math.max(R.slowmo || 0, 0.35);
}

