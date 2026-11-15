'use strict';
/* one mythic alone on the yard, 60 seconds against a crowd and against a boss.
   node tools/sim/bench.js [up]   (up = 신화 강화 level, default 10) */
const path = require('path');
global.SAVE = { mopen: {} };
const C = require(path.join(__dirname, 'core.js'));
C.MYTHS.forEach(M => { SAVE.mopen[M.id] = 1; });
const UP = +(process.argv[2] || 10), DT = 0.05, SECS = 60, CELL = +(process.env.CELL || 10), FOE_HP = +(process.env.HP || 7000);
C.applyLevels(null);

function setup(id) {
  C.newGame(null, null, 0, null);
  const G = C.G;
  G.units.fill(null); G.foes.length = 0; G.wave = 30; G.waveT = 1e9; G.spawnLeft = 0; G.up = [UP, UP, UP, UP, 0];
  G.units[CELL] = { id: G.nextId++, t: C.TYPE_IX[id], c: 1, cd: 0.2, dir: 0, sil: 0, n: 0, busy: 0, cmd: 0 };
  G.auraDirty = true; G.tally = {}; G.coins = 0; G.hon = 0;
  return G;
}
function newFoe(G, hp, boss) {
  const f = { id: G.nextId++, kind: 0, boss: boss ? 'beom' : null, d: Math.random() * 26, hp, max: hp, speed: boss ? 0.7 : 1.0, r: boss ? 0.55 : 0.28, lane: (Math.random() - 0.5) * 0.36,
    slowT: 0, slowAmt: 0, stunT: 0, burnT: 0, burnDps: 0, markT: 0, markAmt: 0, curseT: 0, curseAmt: 0, revT: 0, flash: 0, age: 0, x: 0, y: 0, hx: 1, hy: 0, dead: false, big: !!boss, reward: 0, wob: 0, skT: 99, skT2: 99, name: 'x' };
  G.foes.push(f); return f;
}
function crowd(id) {
  const G = setup(id); let t = 0, sp = 0, kills = 0, dist = 0;
  while (t < SECS) {
    sp -= DT; if (sp <= 0 && G.foes.length < 40) { newFoe(G, FOE_HP, false); sp = 0.5; }
    const before = G.foes.length;
    C.update(DT); t += DT;
    if (G.phase !== 'play') G.phase = 'play';
    kills += G.stats.kills; G.stats.kills = 0;
  }
  const dmg = Object.values(G.tally).reduce((a, b) => a + b, 0);
  return { dmg, kills, coins: G.coins, hon: G.hon };
}
function boss(id) {
  const G = setup(id); const b = newFoe(G, 1e10, true); G.boss = b; let t = 0;
  while (t < SECS) { C.update(DT); t += DT; }
  return { dmg: 1e10 - b.hp, coins: G.coins };
}
const rows = [];
for (const M of C.MYTHS) {
  const T = C.TYPES[M.ix], a = crowd(M.id), b = boss(M.id);
  rows.push({ id: M.id, name: T.name, role: T.role, grp: T.grp || '', crowd: a.dmg / SECS, kills: a.kills, boss: b.dmg / SECS, coins: (a.coins + b.coins) / 2 / SECS, hon: a.hon });
}
const base = rows.find(r => r.id === 'cheoyong');
rows.sort((x, y) => (x.role > y.role ? 1 : x.role < y.role ? -1 : y.crowd - x.crowd));
console.log(`신화 강화 ${UP} · 60초 평균 · 처용 = 1.00`);
for (const r of rows) console.log(`${r.role.padEnd(4)} ${(r.name + (r.grp ? '*' : '')).padEnd(7, '　')} 무리 ${(r.crowd / base.crowd).toFixed(2).padStart(5)} 보스 ${(r.boss / base.boss).toFixed(2).padStart(5)} 처치 ${String(r.kills).padStart(4)} 엽전/초 ${r.coins.toFixed(1).padStart(6)} 혼 ${r.hon}`);
