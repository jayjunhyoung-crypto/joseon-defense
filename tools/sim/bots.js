'use strict';
/* headless balance bots. build first: python3 tools/build.py --sim
   node tools/sim/bots.js [stage] [runs] [open]
     open: 'free' (the 4 starting mythics), 'all' (everything open), or a comma list of ids */
const path = require('path');
const stage = +(process.argv[2] || 0), runs = +(process.argv[3] || 6), openArg = process.argv[4] || 'free';
global.SAVE = { mopen: {} };
const C = require(path.join(__dirname, 'core.js'));
if (openArg === 'all') C.MYTHS.forEach(M => { SAVE.mopen[M.id] = 1; });
else if (openArg !== 'free') openArg.split(',').forEach(id => { SAVE.mopen[id] = 1; });

const DT = 0.05, THINK = 0.25;
const T = t => C.TYPES[t];
const LV = +(process.env.LV || 1), MLV = +(process.env.MLV || 1);
/* levels as a player who has played a while would have them */
function lvArrays() {
  const mul = C.TYPES.map(Ty => Ty.tier >= 4 ? 1 + C.BAL.mythLvBonus * (MLV - 1) : (1 + C.BAL.lvBonus * (LV - 1)) * (LV >= 3 ? 1.1 : 1));
  const spd = C.TYPES.map(Ty => Ty.tier < 4 && LV >= 9 ? 0.9 : 1);
  C.applyLevels(id => (C.TYPES[C.TYPE_IX[id]].tier >= 4 ? MLV : LV));
  return [mul, spd];
}

function groupPower(G) {
  const p = [0, 0, 0, 0];
  G.units.forEach((u, i) => { if (!u) return; const Ty = T(u.t), g = [0, 0, 1, 2, 3][Math.min(4, Ty.tier)]; p[g] += C.dmgOf(u.t, i) * (u.c || 1) / Ty.cd; });
  return p;
}
function neededIds() {
  const need = new Set();
  for (const M of C.MYTHS) { if (!C.mythOpen(M.id)) continue; const st = C.recipeState(M); if (st.have >= M.parts.length - 2) M.parts.forEach(p => need.add(p)); }
  return need;
}
function think(G, mode, memo) {
  /* 1. mythics first */
  if (mode !== 'summon') {
    for (const M of C.MYTHS) { if (!C.mythOpen(M.id)) continue; if (C.recipeState(M).ready) { if (C.craft(M.id)) memo.crafts.push(`${G.wave}:${M.id}`); } }
  }
  /* 2. merges: full stacks, but keep a lone copy that an almost-ready recipe wants */
  const need = mode === 'summon' ? new Set() : neededIds();
  for (let i = 0; i < C.NCELL; i++) {
    if (!C.canMergeAt(i)) continue;
    const id = T(G.units[i].t).id;
    if (need.has(id) && !G.units.some((u, j) => j !== i && u && u.t === G.units[i].t)) continue;
    C.mergeAt(i);
  }
  /* 3. 굿 with 혼 */
  if (mode !== 'summon') {
    let guard = 0;
    while (G.hon >= 1 && C.emptyCells().length && guard++ < 6) {
      const sure = (G.pity || 0) >= C.PITY_MAX;
      const k = sure && G.hon >= 2 ? 2 : G.wave < 6 ? 0 : 1;
      if (G.hon < C.GUTS[k].cost) break;
      C.gamble(k);
    }
  }
  /* 4. coins: summon while there is room, keep upgrades moving */
  const pw = groupPower(G);
  let best = 0; for (let g = 1; g < 4; g++) if (pw[g] > pw[best]) best = g;
  let guard = 0;
  while (guard++ < 30) {
    const sc = C.summonCost(), uc = G.up[best] < C.UP_MAX ? C.upCost(best) : Infinity;
    const luckOk = G.up[C.LUCK] < 5 && !C.luckByHon() && G.coins >= C.upCost(C.LUCK) + sc && G.wave >= 8;
    if (luckOk) { C.upgrade(C.LUCK); continue; }
    if (C.hasRoom() && G.coins >= sc && (G.coins - sc >= uc * 0.5 || G.up[best] >= G.wave * 0.6)) { if (!C.summon()) break; continue; }
    if (G.coins >= uc) { C.upgrade(best); continue; }
    if (C.hasRoom() && G.coins >= sc) { if (!C.summon()) break; continue; }
    break;
  }
  /* 5. full yard: sell the weakest spare */
  if (!C.hasRoom() && G.coins >= C.summonCost()) {
    let worst = -1, wv = Infinity;
    G.units.forEach((u, i) => { if (!u) return; const Ty = T(u.t); if (Ty.tier >= 3) return; if (need.has(Ty.id)) return; const v = Ty.tier * 10 + u.c; if (v < wv) { wv = v; worst = i; } });
    if (worst >= 0) C.sell(worst);
  }
  /* 6. 도전 귀신 when the yard is ready for them */
  if (mode === 'pro') for (let i = 0; i < C.CHALS.length; i++) if (C.chalReady(i) && G.wave >= C.CHALS[i].rec) C.callChallenge(i);
}
/* pair: you are the 'pro' bot, with the in-game AI teammate beside you sharing bosses */
function run(mode) {
  const [mul, spd] = lvArrays(), pair = mode === 'pair';
  C.newGame(mul, spd, stage, null);
  if (pair) { Object.assign(C.COOP, { on: true, bossW: 0, bossDmg: 0, pApplied: 0, sync: C.aiSyncMe }); C.aiNew(mul, spd, stage, null); }
  const memo = { crafts: [] };
  let t = 0, nt = 0;
  while (C.G.phase === 'play' && t < 4000) {
    C.update(DT); t += DT;
    if (pair && C.G.phase === 'play') C.aiStep(DT);
    if (t >= nt) { nt = t + THINK; think(C.G, pair ? 'pro' : mode, memo); }
  }
  const G = C.G, ai = pair ? { fell: C.AI.out ? C.AI.G.wave : 0 } : null;
  if (pair) { C.COOP.on = false; C.COOP.sync = null; C.AI.on = false; }
  return { wave: G.phase === 'win' ? 81 : G.wave, why: G.endReason, crafts: memo.crafts, up: G.up.slice(), myth: G.units.filter(u => u && T(u.t).tier >= 4).map(u => T(u.t).name), ai };
}
function dps(G) { let s = 0; G.units.forEach((u, i) => { if (u) { const Ty = T(u.t); s += C.dmgOf(u.t, i) * (u.c || 1) * (Ty.kind === 'double' ? 2 : 1) / Ty.cd; } }); return s; }
function trace(mode, every = 5) {
  const [mul, spd] = lvArrays();
  C.newGame(mul, spd, stage, null); C.G.tally = {};
  const memo = { crafts: [] };
  let t = 0, nt = 0, lw = 0;
  while (C.G.phase === 'play' && t < 4000) {
    C.update(DT); t += DT;
    if (t >= nt) { nt = t + THINK; think(C.G, mode, memo); }
    const G = C.G;
    if (G.wave !== lw && G.wave % every === 0) {
      lw = G.wave;
      const my = G.units.filter(u => u && T(u.t).tier >= 4).length, n = G.units.filter(Boolean).length;
      console.log(`w${String(G.wave).padStart(2)} t${Math.round(t)} coins ${Math.round(G.coins)} hon ${G.hon} up ${G.up.join('/')} cells ${n} myth ${my} dps ${Math.round(dps(G))} hp ${Math.round(C.hpAt(G.wave))} foes ${G.foes.length} summons ${G.summons}`);
    }
  }
  console.log('end', C.G.wave, C.G.endReason, memo.crafts.join(' '));
  const tl = Object.entries(C.G.tally).sort((a, b) => b[1] - a[1]), tot = tl.reduce((a, b) => a + b[1], 0);
  console.log('damage', tl.slice(0, 12).map(([k, v]) => `${C.TYPES[C.TYPE_IX[k]].name} ${Math.round(v / tot * 100)}%`).join(' · '));
}
module.exports = { run, trace, think, C };
if (require.main !== module) return;
if (process.env.TRACE) { trace(process.env.TRACE, +(process.env.EVERY || 5)); return; }
for (const mode of (process.env.MODES || 'summon,mythic,pro').split(',')) {
  const out = [];
  for (let r = 0; r < runs; r++) out.push(run(mode));
  const ws = out.map(o => o.wave).sort((a, b) => a - b);
  console.log(`${C.STAGES[stage].name} ${mode.padEnd(6)} Lv${LV}/${MLV} waves ${ws.join(' ')} · median ${ws[Math.floor(ws.length / 2)]}${mode === 'pair' ? ` · AI 쓰러진 마당 ${out.map(o => o.ai.fell || '-').join(' ')}` : ''}`);
  if (process.env.V) out.forEach(o => console.log('   ', o.wave, o.why, 'up', o.up.join('/'), '|', o.myth.join(','), '|', o.crafts.slice(0, 8).join(' ')));
}
