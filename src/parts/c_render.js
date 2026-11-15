/* ================= renderer (Canvas 2D) ================= */
const QUALITY = [
  { label: '고', name: '높음', dpr: 2, pmul: 1 },
  { label: '중', name: '보통', dpr: 1.5, pmul: 0.75 },
  { label: '저', name: '낮음', dpr: 1, pmul: 0.45 },
];
const R = { theme: 'village', time: 0, q: 0, autoQ: true, W: 1, H: 1, DPR: 1, CS: 50, OX: 0, OY: 0, shake: 0, slowmo: 0, fpsT: 0, fpsN: 0, artScale: 0, recipeHi: null, numBudget: 0, ok: false, pickExp: false, pickSel: [], expInfo: false };
const cv = typeof document !== 'undefined' ? document.getElementById('cv') : null;
const ctx = cv ? cv.getContext('2d') : null;
const BG = typeof document !== 'undefined' ? document.createElement('canvas') : null;
const reduceMotion = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const UNIT_H = 1.12, FOE_H = 0.6;
const wx = x => R.OX + x * R.CS, wy = y => R.OY + y * R.CS;

/* ---------- sprite atlas ---------- */
const ART = {}, FOE_ART = [], BOSS_ART = {}, CHAL_ART = {};
const BOX = { body: [-42, -62, 42, 6], head: [-48, -128, 56, -32], armF: [-30, -12, 34, 58], armB: [-30, -12, 34, 58], inst: [-24, -72, 40, -10], back: [-30, -96, 36, -36], whole: [-30, -124, 30, 6], bird: [-20, -122, 30, -90] };
const BOX_STATIC = { daejanggun: [-26, -108, 26, 6], jangseung: [-18, -102, 18, 6], haetae: { body: [-44, -60, 30, 4], head: [-10, -80, 46, -18] }, saja: { body: [-44, -60, 30, 4], head: [-10, -80, 50, -16] } };
function mkPart(draw, box, scale) {
  const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0;
  const c = document.createElement('canvas');
  c.width = Math.max(1, Math.ceil(w * scale)); c.height = Math.max(1, Math.ceil(h * scale));
  const g = c.getContext('2d'); g.scale(scale, scale); g.translate(-x0, -y0); g.lineCap = 'round'; g.lineJoin = 'round';
  draw(g);
  return { cv: c, x0, y0, w, h };
}
function buildArt(scale) {
  R.artScale = scale;
  for (const [id, D] of Object.entries(PUP)) {
    const A = ART[id] = {};
    if (D.group) continue;
    const parts = D.static ? D.order : ['back', 'body', 'head', 'armF', 'armB', 'inst'];
    for (const name of parts) {
      if (!D[name]) continue;
      let box = (D.boxes && D.boxes[name]) || BOX[name];
      if (D.static && name === 'whole' && BOX_STATIC[id]) box = BOX_STATIC[id];
      if (D.quad && BOX_STATIC[id]) box = BOX_STATIC[id][name] || box;
      A[name] = mkPart(D[name], box, scale);
    }
  }
  const fs = scale * 1.15;
  for (let k = 0; k < FOES.length; k++) {
    FOE_ART[k] = [0, 1].map(fr => mkPart(c => drawFoe2D(c, k, fr), [-22, -66, 34, 4], fs));
    FOE_ART[k].white = FOE_ART[k].map(p => whiten(p));
  }
  const bs = scale * 1.25;
  for (const [k, box] of Object.entries(BOSS_BOX)) BOSS_ART[k] = mkPart(BOSS2D[k === 'imugi' ? 'imugiHead' : k === 'heukryong' ? 'heukryongHead' : k], box, bs);
  for (const k of Object.keys(BOSS_ART)) BOSS_ART[k].white = whiten(BOSS_ART[k]);
  for (const k of Object.keys(CHAL2D)) { CHAL_ART[k] = mkPart(CHAL2D[k], [-46, -104, 52, 4], bs); CHAL_ART[k].white = whiten(CHAL_ART[k]); }
  PORTRAIT_CACHE.clear();
}
/* illustrated foes take over from the drawn ones once every picture has loaded; heights are in each draw's local units */
const FOE_SPR_H = [72, 72, 70, 72, 66, 80, 74, 72];
const BOSS_SPR_H = { beom: 0.95, gumiho: 0.88, imugi: 0.88, bulgasari: 0.92, geumdwaeji: 1.45, daejeok: 1.75, heukryong: 1.7, yeomra: 1.75 };
const CHAL_SPR_H = { eodum: 1.35, dueok: 1.3, gangcheol: 1.3, jine: 1.5, yacha: 1.45 };
let FSPR_AT = 0;
function sprPart(id, h, pxu, sq) {
  const S = FOE_SPRITES[id], w = h * S.naturalWidth / S.naturalHeight, sx = sq ? 1.05 : 1, sy = sq ? 0.95 : 1;
  const p = mkPart(c => { c.imageSmoothingQuality = 'high'; c.scale(sx, sy); c.drawImage(S, -w / 2, -h, w, h); }, [-w / 2 * sx - 1, -h - 1, w / 2 * sx + 1, 1], pxu);
  p.spr = true; p.H = h; return p;
}
function foeSprites() {
  if (typeof FOE_SPRITES === 'undefined' || !R.artScale || FSPR_AT === R.artScale) return;
  for (const id in FOE_SPRITES) if (!foeSpriteReady(id)) return;
  FSPR_AT = R.artScale;
  const px = R.CS * R.DPR * 1.2;
  for (let k = 0; k < FOES.length; k++) {
    const id = 'foe_f' + k; if (!FOE_SPRITES[id]) continue;
    FOE_ART[k] = [0, 1].map(fr => sprPart(id, FOE_SPR_H[k] || 62, px * FOE_H / 64, fr));
    FOE_ART[k].white = FOE_ART[k].map(p => whiten(p)); FOE_ART[k].spr = true;
  }
  for (const b in BOSS_SPR_H) { const id = 'boss_' + b; if (!FOE_SPRITES[id]) continue; const p = sprPart(id, BOSS_SPR_H[b] * 100, px / 100); p.white = whiten(p); BOSS_ART[b] = p; }
  for (const c in CHAL_SPR_H) { const id = 'chal_' + c; if (!FOE_SPRITES[id]) continue; const p = sprPart(id, CHAL_SPR_H[c] * 90, px / 90); p.white = whiten(p); CHAL_ART[c] = p; }
  PIX.cache.clear();
}
const BOSS_BOX = { beom: [-52, -100, 80, 4], gumiho: [-40, -82, 70, 4], imugi: [-34, -64, 50, 6], bulgasari: [-50, -94, 76, 4], geumdwaeji: [-58, -86, 66, 4], daejeok: [-62, -132, 78, 4], heukryong: [-38, -74, 54, 8], yeomra: [-50, -116, 60, 4] };
const BOSS_SCALE = { beom: 1.35, gumiho: 1.25, imugi: 1.0, bulgasari: 1.45, geumdwaeji: 1.3, daejeok: 1.3, heukryong: 1.0, yeomra: 1.3 };
function whiten(p) {
  const c = document.createElement('canvas'); c.width = p.cv.width; c.height = p.cv.height;
  const g = c.getContext('2d'); g.drawImage(p.cv, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = '#ffffff'; g.fillRect(0, 0, c.width, c.height);
  return Object.assign({}, p, { cv: c });
}

/* ---------- poses ---------- */
const KEYS = {
  throw: { dur: 0.36, aF: [[0, 0.6], [0.35, -1.5], [0.55, 2.3], [1, 1.0]], lean: [[0.35, -0.12], [0.55, 0.16]], by: [[0.55, -3]] },
  flick: { dur: 0.32, aF: [[0.3, 0.3], [0.55, 2.2], [1, 1.4]], lean: [[0.3, -0.06], [0.55, 0.1]], hrot: [[0.55, 0.1]] },
  push: { dur: 0.42, aF: [[0.3, -0.3], [0.55, 1.55], [0.85, 1.2]], aB: [[0.3, -0.3], [0.55, 1.45], [0.85, 1.1]], lean: [[0.3, -0.1], [0.55, 0.22]], bx: [[0.55, 5]], hrot: [[0.55, -0.25]] },
  swing: { dur: 0.4, aF: [[0.4, 3.0], [0.6, 0.8], [0.9, 0.9]], lean: [[0.4, -0.1], [0.6, 0.18]] },
  strike: { dur: 0.36, aF: [[0.2, 2.2], [0.32, 1.2], [0.55, 2.2], [0.68, 1.2]], hrot: [[0.32, 0.1], [0.68, 0.1]], inst: 1 },
  strike2: { dur: 0.38, aF: [[0.18, 1.7], [0.32, 0.5]], aB: [[0.45, 0.8], [0.6, 1.8], [0.76, 0.6]], inst: 1, by: [[0.32, -2], [0.76, -2]] },
  bigstrike: { dur: 0.44, aF: [[0.4, 2.9], [0.58, 0.7]], lean: [[0.4, -0.1], [0.58, 0.12]], sy: [[0.58, 0.93], [0.75, 1.03]], inst: 1 },
  raise: { dur: 0.46, aF: [[0.3, 2.7], [0.7, 2.7]], aB: [[0.3, 2.5], [0.7, 2.5]], hrot: [[0.3, -0.15], [0.7, -0.15]], by: [[0.3, -4], [0.7, -4]] },
  spin: { dur: 0.44, sx: [[0, 1], [0.25, -0.15], [0.5, -1], [0.75, 0.15], [1, 1]], aF: [[0.2, 1.9], [0.8, 1.9]], aB: [[0.2, 1.9], [0.8, 1.9]], by: [[0.5, -5]] },
  thrust: { dur: 0.36, aF: [[0.3, -0.1], [0.5, 1.45], [0.85, 0.8]], lean: [[0.3, -0.12], [0.5, 0.22]], bx: [[0.5, 6]] },
  drink: { dur: 0.62, aF: [[0.3, 2.5], [0.5, 2.5], [0.62, 1.2]], hrot: [[0.3, -0.35], [0.5, -0.35], [0.62, 0.3]], lean: [[0.3, -0.1], [0.62, 0.2]] },
  lunge: { dur: 0.42, lunge: [[0, 0], [0.4, 1], [1, 0]], aF: [[0.3, 2.0], [0.5, 1.0]], aB: [[0.3, 1.8], [0.5, 0.8]], sy: [[0.4, 0.92]], sx: [[0.4, 1.08]] },
  blow: { dur: 0.44, hrot: [[0.3, -0.32], [0.6, -0.32]], by: [[0.3, -3], [0.6, -3]], lean: [[0.3, -0.08]] },
  sweep: { dur: 0.52, aF: [[0.3, 3.0], [0.6, 0.4]], aB: [[0.35, 2.8], [0.65, 0.4]], lean: [[0.6, 0.12]], by: [[0.3, -4]] },
  point: { dur: 0.38, aF: [[0.3, 1.75], [0.7, 1.75]], lean: [[0.3, 0.06]] },
  peck: { dur: 0.36, bird: [[0, 0], [0.3, 1], [1, 0]] },
  pulse: { dur: 0.42, sy: [[0, 1], [0.2, 0.9], [0.42, 1.08], [1, 1]], sx: [[0, 1], [0.2, 1.08], [0.42, 0.95], [1, 1]], glow: [[0, 0], [0.2, 1], [1, 0]] },
  pounce: { dur: 0.3, sy: [[0.4, 0.9]] },
  beat: { dur: 0.3 },
  bow: { dur: 0.42, aF: [[0.25, 1.55], [0.75, 1.55]], aB: [[0.25, 1.35], [0.5, 0.95], [0.6, 1.4]], lean: [[0.5, -0.07]], hrot: [[0.25, 0.08], [0.75, 0.08]] },
  recoil: { dur: 0.4, bx: [[0.12, -5], [0.5, 0]], sy: [[0.12, 0.94], [0.4, 1.02]], sx: [[0.12, 1.05]], glow: [[0, 0], [0.1, 1], [1, 0]] },
};
const smooth = t => t * t * (3 - 2 * t);
function kv(keys, t, base) {
  let pk = 0, pv = base;
  for (const [kt, val] of keys) {
    if (t <= kt) return lerp(pv, val, smooth(kt === pk ? 1 : (t - pk) / (kt - pk)));
    pk = kt; pv = val;
  }
  return lerp(pv, base, smooth(pk >= 1 ? 1 : (t - pk) / (1 - pk)));
}
function newPose() { return { bx: 0, by: 0, lean: 0, sx: 1, sy: 1, hx: 0, hy: 0, hrot: 0, aF: 0.3, aB: 0.3, ix: 0, iy: 0, glow: 0, lunge: 0, bird: 0, t: 0, ap: 1 }; }
function computePose(p, D, t, ph, ap, sil) {
  const I = D.idle || {}, tm = t * (I.tempo || 1) + ph;
  p.t = t; p.ap = ap;
  p.bx = 0; p.hx = 0; p.hy = 0; p.ix = 0; p.iy = 0; p.glow = 0; p.lunge = 0; p.bird = 0; p.sx = 1;
  p.by = -Math.abs(Math.sin(tm * PI)) * (I.bob || 0);
  p.lean = (I.lean || 0) + Math.sin(tm * PI * 0.5) * (I.sway || 0);
  p.aF = I.aF ? I.aF[0] + I.aF[1] * Math.sin(tm * PI) : 0.3;
  p.aB = I.aB ? I.aB[0] + I.aB[1] * Math.sin(tm * PI + PI) : 0.3;
  p.hrot = (I.head || 0) + Math.sin(tm * PI * 0.5 + 1) * 0.05;
  p.sy = 1 + Math.sin(tm * PI * 2) * 0.012;
  if (D.static) { p.by = 0; p.lean = Math.sin(tm * 1.3) * 0.015; }
  if (sil) { p.aF = 0.1; p.aB = 0.1; p.by = 0; p.hrot = 0.28; p.lean = 0.06; return p; }
  if (ap < 1) {
    const K = KEYS[D.atk];
    if (K) for (const f in K) { if (f === 'dur' || f === 'inst') continue; p[f] = kv(K[f], ap, p[f]); }
    if (K && K.inst) { const e = 1 - ap; p.ix = Math.sin(ap * 46) * 1.4 * e; p.iy = Math.cos(ap * 39) * 0.8 * e; }
  }
  return p;
}
/* an illustrated unit is one picture: it bobs with the idle pose and, when it attacks, leans back a moment,
   lunges forward and settles. a unit with an attack picture (<id>_atk) swaps to it during the strike */
const SPRITE_H = 116;
const SWING_KIND = { thump: 1, whip: 1, axes: 1, devour: 1, cone: 1, beat: 1, pulse: 1, pounce: 1 };
function atkCurve(ap) {
  if (ap >= 1) return null;
  if (ap < 0.18) { const e = Math.sin(ap / 0.18 * PI / 2); return { x: -5 * e, y: e, r: -0.13 * e, sx: 1 - 0.04 * e, sy: 1 + 0.05 * e, s: 0 }; }
  if (ap < 0.45) { const t = (ap - 0.18) / 0.27, e = 1 - (1 - t) * (1 - t); return { x: -5 + 15 * e, y: 1 - 4 * e, r: -0.13 + 0.27 * e, sx: 0.96 + 0.12 * e, sy: 1.05 - 0.11 * e, s: t }; }
  const t = (ap - 0.45) / 0.55, ee = (1 - t) * (1 - t);
  return { x: 10 * ee, y: -3 * ee, r: 0.14 * ee, sx: 1 + 0.08 * ee, sy: 0.94 + 0.06 * (1 - ee), s: 1 + t };
}
function drawSprite(g, id, x, y, k, pose, face, alpha) {
  const ap = pose.ap == null ? 1 : pose.ap, c = atkCurve(ap), I = SPRITES[id];
  const aid = id + '_atk', useA = !!c && ap < 0.75 && spriteReady(aid);
  const S = useA ? SPRITES[aid] : I;
  let h = SPRITE_H * ((SPRITE_SRC[id] && SPRITE_SRC[id].h) || 1), w = h * I.naturalWidth / I.naturalHeight;
  const maxW = SPRITE_H * 1.15; if (w > maxW) { h *= maxW / w; w = maxW; }
  /* the attack picture keeps the idle picture's scale, so an outstretched arm makes it wider, not the body smaller */
  let left = -w / 2;
  if (useA) {
    const r = h / I.naturalHeight, SA = SPRITE_SRC[aid] || {}, SI = SPRITE_SRC[id] || {};
    const fx = left + (SI.ax == null ? 0.5 : SI.ax) * w;
    h = S.naturalHeight * r; w = S.naturalWidth * r; left = fx - (SA.ax == null ? 0.5 : SA.ax) * w;
  }
  g.save(); g.imageSmoothingQuality = 'high'; g.translate(x, y); g.scale(face * k, k);
  if (alpha < 1) g.globalAlpha *= alpha;
  /* with a real attack picture the body motion stays small: the picture does the work */
  const m = useA ? 0.35 : 1;
  g.translate(pose.bx + (c ? c.x * m : 0), pose.by + (c ? c.y * m : 0)); g.rotate(pose.lean * 0.5 + (c ? c.r * m : 0)); g.scale(c ? 1 + (c.sx - 1) * m : 1, c ? 1 + (c.sy - 1) * m : 1);
  g.drawImage(S, left, -h, w, h);
  /* melee companions leave a short white swing arc in front of them */
  if (c && c.s > 0.15 && c.s < 1.5) {
    const T = TYPES[TYPE_IX[id]];
    if (T && SWING_KIND[T.kind]) {
      const a = Math.max(0, 1 - Math.abs(c.s - 0.7) / 0.8), sweep = Math.min(1, c.s) * 2.4, R0 = h * 0.42;
      g.lineCap = 'round';
      g.strokeStyle = `rgba(255,255,255,${0.75 * a})`; g.lineWidth = 6;
      g.beginPath(); g.arc(w * 0.12, -h * 0.5, R0, -2.1, -2.1 + sweep); g.stroke();
      g.strokeStyle = `rgba(255,236,170,${0.5 * a})`; g.lineWidth = 2.5;
      g.beginPath(); g.arc(w * 0.12, -h * 0.5, R0 * 0.82, -1.9, -1.9 + sweep * 0.9); g.stroke();
    }
  }
  g.restore();
}
function drawPuppetHi(g, id, x, y, k, pose, face, alpha = 1, tint = 0) {
  if (typeof spriteReady === 'function' && spriteReady(id)) { drawSprite(g, id, x, y, k, pose, face, alpha); return; }
  const A = ART[id], D = PUP[id];
  if (!A) return;
  g.save(); g.imageSmoothingQuality = 'high'; g.translate(x, y); g.scale(face * k, k);
  if (alpha < 1) g.globalAlpha *= alpha;
  g.translate(pose.bx, pose.by); g.rotate(pose.lean); g.scale(pose.sx, pose.sy);
  for (const name of D.order) {
    const p = A[name]; if (!p) continue;
    if (name === 'head') {
      const n = D.neck; g.save(); g.translate(n[0] + pose.hx, n[1] + pose.hy); g.rotate(pose.hrot); g.drawImage(p.cv, p.x0 - n[0], p.y0 - n[1], p.w, p.h); g.restore();
    } else if (name === 'armF' || name === 'armB') {
      const s = name === 'armF' ? D.shF : D.shB, a = name === 'armF' ? pose.aF : pose.aB;
      g.save(); g.translate(s[0], s[1]); g.rotate(-a); g.drawImage(p.cv, p.x0, p.y0, p.w, p.h); g.restore();
    } else if (name === 'inst') { g.drawImage(p.cv, p.x0 + pose.ix, p.y0 + pose.iy, p.w, p.h); }
    else if (name === 'bird') {
      const pv = D.pivots.bird, b = pose.bird;
      g.save(); g.translate(pv[0] + b * 6, pv[1] - b * 7); g.rotate(-b * 0.5); g.drawImage(p.cv, p.x0 - pv[0], p.y0 - pv[1], p.w, p.h); g.restore();
    } else g.drawImage(p.cv, p.x0, p.y0, p.w, p.h);
  }
  if (D.glowEyes && pose.glow > 0.02) { g.fillStyle = `rgba(255,150,50,${0.85 * pose.glow})`; for (const [ex, ey] of D.glowEyes) { g.beginPath(); g.arc(ex, ey, 4.5, 0, TAU); g.fill(); } }
  if (tint) { g.globalCompositeOperation = 'source-atop'; }
  g.restore();
}
/* pixel mode: each unit is baked once into a tiny pixel sprite (two idle frames and one attack frame) and drawn crisp */
let PIXEL = false;
const PIX = { cache: new Map(), fit: new Map(), px: 1, snap: 1, ol: true, art: 32 };
const PIX_MAXH = 128;
const PIX_UNIT = 0.74, UNIT_S = PIX_UNIT, PIX_BOX = [-170, -240, 170, 30];
function pixBake(key, sA, box, render, noOl) {
  const ck = key + '@' + Math.round(sA * 500);
  let e = PIX.cache.get(ck); if (e) return e;
  if (PIX.cache.size > 900) PIX.cache.clear();
  const S = 5, ax0 = Math.floor(box[0] * sA) - 1, ay0 = Math.floor(box[1] * sA) - 1;
  const aw = Math.ceil(box[2] * sA) + 1 - ax0, ah = Math.ceil(box[3] * sA) + 1 - ay0;
  const hi = document.createElement('canvas'); hi.width = aw * S; hi.height = ah * S;
  const hg = hi.getContext('2d'); hg.setTransform(S * sA, 0, 0, S * sA, -ax0 * S, -ay0 * S); render(hg);
  const d = hg.getImageData(0, 0, aw * S, ah * S).data, n = aw * ah, rw = aw * S;
  const col = new Float32Array(n * 3), on = new Uint8Array(n), idx = [];
  for (let y = 0; y < ah; y++) for (let x = 0; x < aw; x++) {
    let r = 0, gg = 0, b = 0, a = 0;
    for (let yy = 0; yy < S; yy++) { let o = ((y * S + yy) * rw + x * S) * 4; for (let xx = 0; xx < S; xx++, o += 4) { const al = d[o + 3]; if (al && !(d[o] > 165 && d[o + 2] > 145 && d[o] - d[o + 1] > 95 && d[o + 2] - d[o + 1] > 75)) { r += d[o] * al; gg += d[o + 1] * al; b += d[o + 2] * al; a += al; } } }
    const i = y * aw + x;
    if (a >= S * S * 255 * 0.42) { on[i] = 1; idx.push(i); col[i * 3] = r / a; col[i * 3 + 1] = gg / a; col[i * 3 + 2] = b / a; }
  }
  /* small palette per sprite: farthest point seeds keep tiny accents, then a few k means passes */
  const K = Math.min(13, idx.length), C = [], asg = new Uint8Array(n);
  if (K) {
    let m = [0, 0, 0]; for (const i of idx) { m[0] += col[i * 3]; m[1] += col[i * 3 + 1]; m[2] += col[i * 3 + 2]; }
    C.push(m.map(v => v / idx.length));
    const md = new Float32Array(n).fill(1e9);
    while (C.length < K) {
      const c = C[C.length - 1]; let bi = -1, bd = -1;
      for (const i of idx) { const dr = col[i * 3] - c[0], dg = col[i * 3 + 1] - c[1], db = col[i * 3 + 2] - c[2], dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11; if (dd < md[i]) md[i] = dd; if (md[i] > bd) { bd = md[i]; bi = i; } }
      if (bd < 60) break;
      C.push([col[bi * 3], col[bi * 3 + 1], col[bi * 3 + 2]]);
    }
    for (let it = 0; it < 6; it++) {
      const sum = C.map(() => [0, 0, 0, 0]);
      for (const i of idx) {
        let bj = 0, bd = 1e12;
        for (let j = 0; j < C.length; j++) { const c = C[j], dr = col[i * 3] - c[0], dg = col[i * 3 + 1] - c[1], db = col[i * 3 + 2] - c[2], dd = dr * dr * 0.3 + dg * dg * 0.59 + db * db * 0.11; if (dd < bd) { bd = dd; bj = j; } }
        asg[i] = bj; const s2 = sum[bj]; s2[0] += col[i * 3]; s2[1] += col[i * 3 + 1]; s2[2] += col[i * 3 + 2]; s2[3]++;
      }
      for (let j = 0; j < C.length; j++) if (sum[j][3]) C[j] = [sum[j][0] / sum[j][3], sum[j][1] / sum[j][3], sum[j][2] / sum[j][3]];
    }
  }
  const W2 = aw + 2, H2 = ah + 2, cv = document.createElement('canvas'); cv.width = W2; cv.height = H2;
  const og = cv.getContext('2d'), im = og.createImageData(W2, H2), od = im.data;
  const ol = PIX.ol && !noOl;
  for (let y = 0; y < H2; y++) for (let x = 0; x < W2; x++) {
    const sx = x - 1, sy = y - 1, o = (y * W2 + x) * 4, inside = sx >= 0 && sy >= 0 && sx < aw && sy < ah;
    const i = sy * aw + sx;
    if (inside && on[i]) { const c = C[asg[i]]; od[o] = c[0]; od[o + 1] = c[1]; od[o + 2] = c[2]; od[o + 3] = 255; continue; }
    if (!ol) continue;
    const nb = (xx, yy) => xx >= 0 && yy >= 0 && xx < aw && yy < ah && on[yy * aw + xx];
    if (nb(sx - 1, sy) || nb(sx + 1, sy) || nb(sx, sy - 1) || nb(sx, sy + 1)) { od[o] = 40; od[o + 1] = 25; od[o + 2] = 19; od[o + 3] = 255; }
  }
  og.putImageData(im, 0, 0);
  let y0 = ah, y1 = -1; for (const i of idx) { const yy = (i / aw) | 0; if (yy < y0) y0 = yy; if (yy > y1) y1 = yy; }
  e = { cv, x: ax0 - 1, y: ay0 - 1, h: Math.max(0, y1 - y0 + 1) };
  PIX.cache.set(ck, e);
  return e;
}
function pixDraw(g, e, x, y, face, alpha) {
  const P = PIX.px, s = PIX.snap;
  g.save(); g.imageSmoothingEnabled = false;
  g.translate(Math.round(x * s) / s, Math.round(y * s) / s); g.scale(face < 0 ? -P : P, P);
  if (alpha < 1) g.globalAlpha *= alpha;
  g.drawImage(e.cv, e.x, e.y);
  g.restore();
}
/* tall units (장승, 대장군) are shrunk so every unit stands inside its own cell */
function unitFit(id) {
  const spr = typeof spriteReady === 'function' && spriteReady(id), fk = id + (spr ? 's' : '');
  let f = PIX.fit.get(fk); if (f != null) return f;
  const D = PUP[id]; if (!D || !ART[id]) return 1;
  const sA = 0.25, e = pixBake('m:' + fk, sA, PIX_BOX, hg => { const p = newPose(); computePose(p, D, 0, 0, 1, false); drawPuppetHi(hg, id, 0, 0, 1, p, 1, 1, 0); }, true);
  const hl = e.h / sA * (D.size || 1); f = hl > PIX_MAXH ? PIX_MAXH / hl : 1; PIX.fit.set(fk, f); return f;
}
function drawPuppet(g, id, x, y, k, pose, face, alpha = 1, tint = 0) {
  if (!PIXEL) return drawPuppetHi(g, id, x, y, k, pose, face, alpha, tint);
  const D = PUP[id]; if (!D || !ART[id]) return;
  let fr = 0;
  if (pose.ap < 0.8) fr = 2;
  else { if (pose.pph == null) pose.pph = Math.random() * 2; fr = Math.floor((pose.t || 0) * 2.2 + pose.pph) & 1; }
  const spr = typeof spriteReady === 'function' && spriteReady(id), fk = id + (spr ? 's' : '');
  const bake = (f, sA) => pixBake(fk + ':' + f, sA, PIX_BOX, hg => {
    const p = newPose(), I = D.idle || {};
    computePose(p, D, f === 1 ? 0.5 / (I.tempo || 1) : 0, 0, f === 2 ? 0.42 : 1, false);
    drawPuppetHi(hg, id, 0, 0, 1, p, 1, 1, 0);
  });
  const e = bake(fr, k / PIX.px);
  pixDraw(g, e, x, y, face, alpha);
}
const PORTRAIT_CACHE = new Map();
function portraitURL(id, css, silhouette) {
  const key = id + ':' + css + ':' + (silhouette ? 1 : 0);
  if (PORTRAIT_CACHE.has(key)) return PORTRAIT_CACHE.get(key);
  const d = Math.min(window.devicePixelRatio || 1, 2), c = document.createElement('canvas');
  c.width = c.height = Math.round(css * d);
  const g = c.getContext('2d'); g.scale(d, d);
  const pp0 = PIX.px, ps0 = PIX.snap; PIX.px = Math.max(1, Math.round(css * d / 40)) / d; PIX.snap = d;
  const D = PUP[id], pose = newPose();
  computePose(pose, D, 0.35, 0, 1, false);
  if (D.group && !(typeof spriteReady === 'function' && spriteReady(id))) {
    const k = css / 150 * (D.groupK ? D.groupK / 0.62 : 1);
    for (const [sid, ox, oy] of D.group.slice().sort((a, b) => a[2] - b[2])) { const sp = newPose(); computePose(sp, PUP[sid], 0.3, ox, 1, false); drawPuppet(g, sid, css / 2 + ox * css * 0.42, css * (D.groupK ? 0.8 : 0.66) + oy * css * 0.3, k, sp, ox < 0 ? 1 : -1); }
  } else {
    const k = css / (D.pdiv || (D.static ? 128 : D.quad ? 96 : D.boxes && D.boxes.inst && D.boxes.inst[1] < -150 ? 168 : 118));
    const fy = D.pfy ? css * D.pfy : D.static ? css * 0.97 : D.quad ? css * 0.86 : css * 0.98;
    drawPuppet(g, id, css / 2 - (D.quad ? css * 0.12 : 0), fy, k, pose, 1);
  }
  PIX.px = pp0; PIX.snap = ps0;
  if (silhouette) { g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgba(30,26,40,.85)'; g.fillRect(0, 0, css, css); }
  const url = c.toDataURL();
  if (!(typeof SPRITES !== 'undefined' && SPRITES[id] && !spriteReady(id))) PORTRAIT_CACHE.set(key, url);
  return url;
}
/* enemy portraits for the codex: 'f3', 'b_beom', 'c_eodum' */
function foePortraitURL(key, css, silhouette) {
  const ck = 'foe:' + key + ':' + css + ':' + (silhouette ? 1 : 0);
  if (PORTRAIT_CACHE.has(ck)) return PORTRAIT_CACHE.get(ck);
  const d = Math.min(window.devicePixelRatio || 1, 2), c = document.createElement('canvas');
  c.width = c.height = Math.round(css * d);
  const g = c.getContext('2d'); g.scale(d, d); g.lineCap = 'round'; g.lineJoin = 'round';
  const sid = key[0] === 'f' ? 'foe_' + key : key[0] === 'c' ? 'chal_' + key.slice(2) : 'boss_' + key.slice(2);
  if (typeof FOE_SPRITES !== 'undefined' && FOE_SPRITES[sid] && !foeSpriteReady(sid)) {
    /* picture still loading: draw the old art but don't keep it */
    drawFoePortraitOld(g, key, css);
    if (silhouette) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgba(30,26,40,.85)'; g.fillRect(0, 0, c.width, c.height); }
    return c.toDataURL();
  }
  if (typeof FOE_SPRITES !== 'undefined' && FOE_SPRITES[sid]) fitSprite(g, FOE_SPRITES[sid], css, key[0] === 'f' ? 0.86 : 0.94);
  else drawFoePortraitOld(g, key, css);
  if (silhouette) { g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = 'rgba(30,26,40,.85)'; g.fillRect(0, 0, c.width, c.height); }
  const url = c.toDataURL(); PORTRAIT_CACHE.set(ck, url); return url;
}
/* a picture fitted into a square portrait, standing on the bottom edge */
function fitSprite(g, S, css, fill) {
  const asp = S.naturalWidth / S.naturalHeight;
  g.imageSmoothingQuality = 'high';
  /* long beasts face right: show the head end bigger and let the tail run off the edge */
  if (asp > 1.3) { const h = css * 0.74, w = h * asp; g.drawImage(S, css * 1.02 - w, css * 0.95 - h, w, h); return; }
  const k = Math.min(css * fill / S.naturalWidth, css * fill / S.naturalHeight), w = S.naturalWidth * k, h = S.naturalHeight * k;
  g.drawImage(S, (css - w) / 2, css * 0.97 - h, w, h);
}
function drawFoePortraitOld(g, key, css) {
  if (key[0] === 'f') { g.translate(css * 0.44, css * 0.94); const k = css / 76; g.scale(k, k); drawFoe2D(g, +key.slice(1), 0); }
  else if (key[0] === 'c') { g.translate(css * 0.47, css * 0.96); const k = css / 110; g.scale(k, k); CHAL2D[key.slice(2)](g); }
  else {
    const b = key.slice(2), box = BOSS_BOX[b], w = box[2] - box[0], h = box[3] - box[1], k = css / Math.max(w, h) * 0.95;
    g.translate(css / 2 - (box[0] + w / 2) * k, css / 2 - (box[1] + h / 2) * k); g.scale(k, k);
    BOSS2D[b === 'imugi' ? 'imugiHead' : b === 'heukryong' ? 'heukryongHead' : b](g);
  }
}

/* ---------- layout & background ---------- */
const WORLD = { x0: -HX - 0.55, x1: HX + 0.55, y0: -HY - 1.05, y1: HY + 0.55 };
function layout() {
  const W = window.innerWidth, H = window.innerHeight;
  R.W = W; R.H = H;
  R.DPR = Math.min(window.devicePixelRatio || 1, QUALITY[R.q].dpr);
  cv.width = Math.round(W * R.DPR); cv.height = Math.round(H * R.DPR);
  let x0 = 0, x1 = W, top, bot;
  if (R.lobby) {
    const wide = W >= 900 && W / H >= 1.25;
    if (wide) { x1 = W - 560; top = H * 0.34; bot = H - 12; }
    else { const sh = document.querySelector('.sheet'), st = sh ? sh.getBoundingClientRect().top : H * 0.55; top = Math.min(H * 0.205, st - 180); bot = st - 2; }
  } else {
    const wide = W >= 1000 && W / H >= 1.2 && H >= 560;
    document.body.classList.toggle('wide', wide);
    if (wide) { x1 = W - (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--side')) || 392); top = 6; bot = H - 6; }
    else { top = document.getElementById('hud').getBoundingClientRect().bottom - 8; bot = document.getElementById('deck').getBoundingClientRect().top + 8; }
  }
  if (R.lobby) document.body.classList.remove('wide');
  const freeH = Math.max(160, bot - top), ww = WORLD.x1 - WORLD.x0, wh = WORLD.y1 - WORLD.y0;
  R.CS = Math.max(18, Math.min((x1 - x0 - 12) / ww, freeH / wh));
  R.OX = (x0 + x1) / 2 - (WORLD.x0 + WORLD.x1) / 2 * R.CS;
  R.OY = top + (freeH - wh * R.CS) / 2 - WORLD.y0 * R.CS;
  const scale = R.CS * UNIT_H * 1.3 / 100 * R.DPR;
  if (Math.abs(scale - R.artScale) / scale > 0.12) buildArt(scale);
  buildBG();
  try { if (el.coopBox && !el.coopBox.hidden) placeCoopBox(); } catch (err) { /* not ready yet */ }
}
function seeded(s) { return () => (s = (s * 16807) % 2147483647) / 2147483647; }
let MAT_PAT = null;
const THEMES = {
  village: { ground: '#7d9a55', g1: 'rgba(40,70,20,.35)', g2: 'rgba(190,220,120,.25)', yard: '#dcc394', path: '#c29a63', grass: true },
  market: { ground: '#a8916c', g1: 'rgba(90,60,30,.22)', g2: 'rgba(240,220,180,.2)', yard: '#dfcaa2', path: '#b98f5c' },
  fortress: { ground: '#617b4c', g1: 'rgba(30,50,20,.35)', g2: 'rgba(170,200,120,.2)', yard: '#cfc19c', path: '#a8916a', grass: true },
  sea: { ground: '#e0cb94', g1: 'rgba(150,120,70,.22)', g2: 'rgba(255,250,220,.3)', yard: '#d9c18c', path: '#bf9f68' },
  underworld: { ground: '#3b3549', g1: 'rgba(10,8,20,.35)', g2: 'rgba(140,120,180,.16)', yard: '#b0a3a0', path: '#8c7d79' },
};
function buildBG() {
  BG.width = cv.width; BG.height = cv.height;
  const g = BG.getContext('2d'), D = R.DPR, CS = R.CS, TH = THEMES[R.theme] || THEMES.village;
  g.setTransform(D, 0, 0, D, 0, 0);
  const rnd = seeded(11);
  const W = R.W, H = R.H;
  const mx0 = wx(-HX - LANE / 2 - 0.42), my0 = wy(-HY - LANE / 2 - 0.42), mx1 = wx(HX + LANE / 2 + 0.42), my1 = wy(HY + LANE / 2 + 0.42);
  g.fillStyle = TH.ground; g.fillRect(0, 0, W, H);
  if (R.theme === 'sea') seaBase(g, rnd, mx0, my0, mx1, my1);
  for (let i = 0; i < W * H / 260; i++) {
    const x = rnd() * W, y = rnd() * H;
    if (TH.grass) { g.strokeStyle = rnd() < 0.5 ? TH.g1 : TH.g2; g.lineWidth = 1.2; g.beginPath(); g.moveTo(x, y); g.lineTo(x + rnd() * 3 - 1.5, y - 3 - rnd() * 4); g.stroke(); }
    else if (i % 2 === 0 && (R.theme !== 'sea' || seaLand(x, y))) { g.fillStyle = rnd() < 0.5 ? TH.g1 : TH.g2; g.fillRect(x, y, 1.6, 1.6); }
  }
  if (R.theme === 'underworld') for (let i = 0; i < 10; i++) { const x = rnd() * W, y = rnd() * H, r = 60 + rnd() * 120; const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, 'rgba(160,150,200,.16)'); gr.addColorStop(1, 'rgba(160,150,200,0)'); g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); }
  (DECOR[R.theme] || decorOutside)(g, rnd, mx0, my0, mx1, my1);
  g.save();
  g.shadowColor = 'rgba(40,30,10,.35)'; g.shadowBlur = 12; g.shadowOffsetY = 4;
  g.beginPath(); RR(g, mx0, my0, mx1 - mx0, my1 - my0, (RC + LANE / 2 + 0.42) * CS); g.fillStyle = TH.yard; g.fill();
  g.restore();
  g.save(); g.beginPath(); RR(g, mx0, my0, mx1 - mx0, my1 - my0, (RC + LANE / 2 + 0.42) * CS); g.clip();
  for (let i = 0; i < (mx1 - mx0) * (my1 - my0) / 30; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(120,90,50,.13)' : 'rgba(255,245,220,.18)'; g.fillRect(mx0 + rnd() * (mx1 - mx0), my0 + rnd() * (my1 - my0), 1.6, 1.6); }
  g.restore();
  const pr = (o) => { g.beginPath(); RR(g, wx(-HX - o), wy(-HY - o), (2 * (HX + o)) * CS, (2 * (HY + o)) * CS, (RC + o) * CS); };
  g.lineJoin = 'round';
  pr(0); g.strokeStyle = TH.path; g.lineWidth = LANE * CS; g.stroke();
  pr(0); g.strokeStyle = 'rgba(255,235,200,.16)'; g.lineWidth = LANE * CS * 0.5; g.stroke();
  for (let i = 0; i < 700; i++) { const d = rnd() * PERIM, p = pathAt(d), o = (rnd() - 0.5) * LANE * 0.9; g.fillStyle = rnd() < 0.5 ? 'rgba(90,60,30,.22)' : 'rgba(255,240,210,.2)'; g.beginPath(); g.arc(wx(p.x - p.dy * o), wy(p.y + p.dx * o), 0.7 + rnd() * 1.2, 0, TAU); g.fill(); }
  const P0 = { x: 0, y: 0, dx: 0, dy: 0 };
  for (const off of [-LANE / 2 - 0.03, LANE / 2 + 0.03]) {
    for (let d = 0; d < PERIM; d += 0.17 + rnd() * 0.06) {
      pathAt(d, P0);
      const x = wx(P0.x - P0.dy * off), y = wy(P0.y + P0.dx * off), s = CS * (0.045 + rnd() * 0.03), v = 150 + rnd() * 40 | 0;
      g.fillStyle = `rgb(${v},${v - 4},${v - 14})`; g.strokeStyle = 'rgba(60,45,30,.55)'; g.lineWidth = 1;
      g.beginPath(); g.ellipse(x, y, s * 1.3, s, rnd() * PI, 0, TAU); g.fill(); g.stroke();
    }
  }
  const gx0 = wx(-COLS / 2 - 0.08), gy0 = wy(-ROWS / 2 - 0.08);
  g.fillStyle = 'rgba(90,60,30,.28)'; g.beginPath(); RR(g, gx0, gy0, (COLS + 0.16) * CS, (ROWS + 0.16) * CS, 0.18 * CS); g.fill();
  if (!MAT_PAT) {
    const pc = document.createElement('canvas'); pc.width = pc.height = 16; const q = pc.getContext('2d');
    q.fillStyle = '#b8935a'; q.fillRect(0, 0, 16, 16);
    q.fillStyle = '#a7834d'; q.fillRect(0, 0, 8, 8); q.fillRect(8, 8, 8, 8);
    q.fillStyle = 'rgba(255,235,190,.25)'; q.fillRect(0, 0, 8, 1.5); q.fillRect(8, 8, 8, 1.5);
    MAT_PAT = pc;
  }
  const pat = g.createPattern(MAT_PAT, 'repeat');
  for (let i = 0; i < NCELL; i++) {
    const x = wx(cellX(i) - 0.45), y = wy(cellY(i) - 0.45), s = 0.9 * CS;
    g.save(); g.beginPath(); RR(g, x, y, s, s, 0.1 * CS); g.fillStyle = pat; g.fill();
    g.strokeStyle = '#6b4c28'; g.lineWidth = Math.max(1.5, CS * 0.04); g.stroke();
    g.strokeStyle = 'rgba(255,235,190,.35)'; g.lineWidth = 1; g.beginPath(); RR(g, x + 3, y + 3, s - 6, s - 6, 0.08 * CS); g.stroke();
    g.restore();
  }
}
function decorOutside(g, rnd, mx0, my0, mx1, my1) {
  const CS = R.CS, W = R.W, H = R.H;
  const free = (x, y, r) => x + r < mx0 - 4 || x - r > mx1 + 4 || y + r < my0 - 4 || y - r > my1 + 4;
  const house = (x, y, s) => {
    g.save(); g.translate(x, y); g.scale(s, s);
    g.fillStyle = '#6d675e'; g.fillRect(-46, 6, 92, 8);
    g.fillStyle = '#d8c9a6'; g.fillRect(-40, -22, 80, 30); g.strokeStyle = OL; g.lineWidth = 2; g.strokeRect(-40, -22, 80, 30);
    g.fillStyle = '#4a3424'; for (const px of [-40, -14, 14, 38]) g.fillRect(px, -22, 4, 30);
    g.fillStyle = '#ffe6a8'; g.fillRect(-8, -14, 14, 12); g.strokeRect(-8, -14, 14, 12);
    g.beginPath(); g.moveTo(-58, -14); g.quadraticCurveTo(-50, -52, 0, -54); g.quadraticCurveTo(50, -52, 58, -14); g.quadraticCurveTo(0, -24, -58, -14); g.closePath();
    g.fillStyle = '#b8954f'; g.fill(); g.stroke();
    g.strokeStyle = 'rgba(90,70,30,.5)'; g.lineWidth = 1.5; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-50 + k * 4, -24 - k * 8); g.quadraticCurveTo(0, -36 - k * 8, 50 - k * 4, -24 - k * 8); g.stroke(); }
    g.restore();
  };
  const tree = (x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, 4, 26, 7, 0, 0, TAU); g.fill(); g.fillStyle = '#6b4a2e'; g.fillRect(-4, -30, 8, 34); g.strokeStyle = OL; g.lineWidth = 2; g.strokeRect(-4, -30, 8, 34); for (const [cx, cy, r, col] of [[-12, -38, 18, '#4e7a3a'], [12, -42, 20, '#5a8a40'], [0, -58, 18, '#6a9a48']]) { g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.fillStyle = col; g.fill(); g.stroke(); } g.restore(); };
  const jar = (x, y, s) => { g.save(); g.translate(x, y); g.scale(s, s); g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(-15, -12, -10, -22); g.lineTo(10, -22); g.quadraticCurveTo(15, -12, 9, 0); g.closePath(); g.fillStyle = '#5a3420'; g.fill(); g.strokeStyle = OL; g.lineWidth = 2; g.stroke(); g.fillStyle = '#3a2416'; g.beginPath(); g.ellipse(0, -22, 10, 3, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(-7, -18, 3, 10); g.restore(); };
  const s = CS / 55;
  const spots = [];
  for (let y = 40; y < H; y += 120 * s) for (let x = 30; x < W; x += 140 * s) spots.push([x + rnd() * 60 * s, y + rnd() * 50 * s]);
  for (const [x, y] of spots) {
    if (!free(x, y, 70 * s)) continue;
    const r = rnd();
    if (r < 0.28) house(x, y, s * 0.9); else if (r < 0.62) tree(x, y, s * (0.8 + rnd() * 0.4)); else if (r < 0.75) { jar(x - 10 * s, y, s); jar(x + 12 * s, y + 2 * s, s * 1.15); }
    else { g.fillStyle = pick(['#f2c94a', '#f07aa0', '#ffffff', '#c58ae0']); for (let k = 0; k < 6; k++) { g.beginPath(); g.arc(x + rnd() * 30 * s, y + rnd() * 20 * s, 2.4 * s, 0, TAU); g.fill(); } }
  }
  // stone wall along the top of the yard when there is room
  if (my0 > 30) {
    for (let x = mx0 - 20; x < mx1 + 20; x += 18 * s) {
      for (let row = 0; row < 3; row++) {
        const yy = my0 - 10 - row * 11 * s, xx = x + (row % 2) * 9 * s, v = 120 + rnd() * 40 | 0;
        g.fillStyle = `rgb(${v},${v - 4},${v - 12})`; g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = 1;
        g.beginPath(); g.ellipse(xx, yy, 9 * s, 6 * s, rnd() * 0.4 - 0.2, 0, TAU); g.fill(); g.stroke();
      }
    }
  }
}

/* ---------- effects ---------- */
const FX = [], PART = [], TEXT = [];
function fxRing(x, y, r0, r1, col, w, life, flat = 0.55) { FX.push({ k: 'ring', x, y, r0, r1, col, w, life, t: 0, flat }); }
function fxFlash(x, y, r, col, life, a = 0.45) { FX.push({ k: 'flash', x, y, r, col, life, t: 0, a }); }
function fxLine(x0, y0, x1, y1, col, w, life, core) { FX.push({ k: 'line', x0, y0, x1, y1, col, w, life, t: 0, core }); }
function fxZig(pts, col, w, life) { FX.push({ k: 'zig', pts, col, w, life, t: 0, seed: Math.random() * 1000 }); }
function fxSlash(x, y, r, ang, col, life) { FX.push({ k: 'slash', x, y, r, ang, col, life, t: 0 }); }
function fxCone(x, y, dx, dy, len, w, col, life) { FX.push({ k: 'cone', x, y, dx, dy, len, w, col, life, t: 0 }); }
function fxArc(x, y, dx, dy, len, w, col, life) { FX.push({ k: 'arcs', x, y, dx, dy, len, w, col, life, t: 0 }); }
function fxText(x, y, s, cls, life = 0.9) {
  if (TEXT.length > 40) TEXT.shift();
  TEXT.push({ x: x + rand(-0.08, 0.08), y, s, cls, life, t: 0 });
}
function part(x, y, z, vx, vy, vz, col, size, life, o = {}) {
  if (PART.length > 700) return;
  PART.push({ x, y, z, vx, vy, vz, col, size, life, t: 0, g: o.g != null ? o.g : 4, drag: o.drag != null ? o.drag : 2, kind: o.kind || 'dot', rot: rand(0, TAU), spin: rand(-8, 8), shrink: o.shrink !== false });
}
function burst(x, y, z, n, col, spd, size, life, o = {}) {
  n = Math.max(1, Math.round(n * QUALITY[R.q].pmul));
  for (let i = 0; i < n; i++) { const a = rand(0, TAU), s = spd * rand(0.4, 1); part(x, y, z, Math.cos(a) * s, Math.sin(a) * s * 0.6, rand(0.5, 1.6) * (o.up || 1.2), Array.isArray(col) ? pick(col) : col, size * rand(0.7, 1.2), life * rand(0.7, 1.1), o); }
}
function puff(x, y, n, col, size, life) {
  n = Math.max(1, Math.round(n * QUALITY[R.q].pmul));
  for (let i = 0; i < n; i++) part(x + rand(-0.15, 0.15), y + rand(-0.08, 0.08), rand(0.05, 0.3), rand(-0.4, 0.4), rand(-0.2, 0.2), rand(0.2, 0.6), col, size * rand(0.7, 1.2), life * rand(0.8, 1.2), { kind: 'smoke', g: -0.2, drag: 1.4, shrink: false });
}
function shake(a) { if (!reduceMotion) R.shake = Math.max(R.shake, a); }
function updateFx(dt) {
  for (let i = FX.length - 1; i >= 0; i--) { FX[i].t += dt; if (FX[i].t >= FX[i].life) FX.splice(i, 1); }
  for (let i = PART.length - 1; i >= 0; i--) {
    const p = PART[i]; p.t += dt;
    if (p.t >= p.life) { PART.splice(i, 1); continue; }
    const d = Math.max(0, 1 - p.drag * dt);
    p.vx *= d; p.vy *= d; p.vz = p.vz * d - p.g * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt; p.rot += p.spin * dt;
    if (p.z < 0 && p.g > 0) { p.z = 0; p.vz *= -0.3; p.vx *= 0.6; p.vy *= 0.6; }
  }
  for (let i = TEXT.length - 1; i >= 0; i--) { const t = TEXT[i]; t.t += dt; t.y -= dt * 0.55; if (t.t >= t.life) TEXT.splice(i, 1); }
  if (R.numBudget < 14) R.numBudget += dt * 12;
}
function drawFx(g) {
  const CS = R.CS;
  for (const e of FX) {
    if (e.t < 0) continue;
    const k = e.t / e.life, a = 1 - k;
    switch (e.k) {
      case 'ring': {
        const r = lerp(e.r0, e.r1, 1 - (1 - k) * (1 - k)) * CS;
        g.strokeStyle = rgba(e.col, 0.75 * a); g.lineWidth = e.w * a + 1;
        g.beginPath(); g.ellipse(wx(e.x), wy(e.y), r, r * e.flat, 0, 0, TAU); g.stroke(); break;
      }
      case 'flash': {
        const r = e.r * CS * (0.6 + 0.6 * k), x = wx(e.x), y = wy(e.y);
        const gr = g.createRadialGradient(x, y, 0, x, y, r);
        gr.addColorStop(0, rgba(e.col, e.a * a)); gr.addColorStop(1, rgba(e.col, 0));
        g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); break;
      }
      case 'line': {
        g.lineCap = 'round';
        g.strokeStyle = rgba(e.col, 0.8 * a); g.lineWidth = e.w * CS * (0.5 + 0.5 * a);
        g.beginPath(); g.moveTo(wx(e.x0), wy(e.y0)); g.lineTo(wx(e.x1), wy(e.y1)); g.stroke();
        if (e.core) { g.strokeStyle = `rgba(255,255,255,${0.75 * a})`; g.lineWidth = e.w * CS * 0.3; g.stroke(); }
        break;
      }
      case 'zig': {
        const rnd = seeded(Math.floor(e.seed + e.t * 30) + 1);
        g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath();
        e.pts.forEach((p, i) => {
          if (!i) { g.moveTo(wx(p.x), wy(p.y)); return; }
          const q = e.pts[i - 1];
          for (let s = 1; s <= 3; s++) { const t = s / 3, jx = s < 3 ? (rnd() - 0.5) * 0.25 : 0, jy = s < 3 ? (rnd() - 0.5) * 0.25 : 0; g.lineTo(wx(lerp(q.x, p.x, t) + jx), wy(lerp(q.y, p.y, t) + jy)); }
        });
        g.strokeStyle = rgba(e.col, 0.85 * a); g.lineWidth = e.w * CS; g.stroke();
        g.strokeStyle = `rgba(255,255,255,${0.7 * a})`; g.lineWidth = e.w * CS * 0.35; g.stroke();
        break;
      }
      case 'slash': {
        g.strokeStyle = rgba(e.col, 0.9 * a); g.lineWidth = CS * 0.07 * a + 1; g.lineCap = 'round';
        g.beginPath(); g.arc(wx(e.x), wy(e.y), e.r * CS, e.ang - 1.1 + k * 0.6, e.ang + 0.2 + k * 0.6); g.stroke(); break;
      }
      case 'cone': {
        const x = wx(e.x), y = wy(e.y), ang = Math.atan2(e.dy, e.dx), len = e.len * CS * (0.4 + 0.6 * Math.min(1, k * 2.5));
        const gr = g.createRadialGradient(x, y, 0, x, y, len);
        gr.addColorStop(0, rgba(e.col, 0.4 * a)); gr.addColorStop(1, rgba(e.col, 0));
        g.fillStyle = gr; g.beginPath(); g.moveTo(x, y); g.arc(x, y, len, ang - e.w, ang + e.w); g.closePath(); g.fill(); break;
      }
      case 'arcs': {
        const x = wx(e.x), y = wy(e.y), ang = Math.atan2(e.dy, e.dx);
        g.lineCap = 'round';
        for (let i = 0; i < 3; i++) {
          const kk = (k + i * 0.18) % 1, rr = e.len * CS * kk;
          g.strokeStyle = rgba(e.col, 0.7 * (1 - kk) * a + 0.05); g.lineWidth = CS * 0.06;
          g.beginPath(); g.arc(x, y, Math.max(1, rr), ang - e.w * 0.8, ang + e.w * 0.8); g.stroke();
        }
        break;
      }
    }
  }
}
function drawParticles(g) {
  const CS = R.CS;
  for (const p of PART) {
    const k = p.t / p.life, a = k < 0.1 ? k / 0.1 : 1 - (k - 0.1) / 0.9;
    const x = wx(p.x), y = wy(p.y - p.z), s = Math.max(0.5, p.size * CS * (p.shrink ? 1 - k * 0.7 : 1 + k * 0.8));
    g.globalAlpha = Math.max(0, a) * (p.kind === 'smoke' ? 0.5 : 0.9);
    g.fillStyle = p.col;
    if (p.kind === 'petal') { g.save(); g.translate(x, y); g.rotate(p.rot); g.beginPath(); g.ellipse(0, 0, s, s * 0.5, 0, 0, TAU); g.fill(); g.restore(); }
    else if (p.kind === 'spark') { g.strokeStyle = p.col; g.lineWidth = Math.max(1, s * 0.5); g.beginPath(); g.moveTo(x, y); g.lineTo(x - p.vx * CS * 0.04, y - (p.vy - p.vz) * CS * 0.04); g.stroke(); }
    else if (p.kind === 'heart') { g.save(); g.translate(x, y); g.scale(s / 6, s / 6); g.beginPath(); g.moveTo(0, 3); g.bezierCurveTo(-6, -2, -3, -7, 0, -3); g.bezierCurveTo(3, -7, 6, -2, 0, 3); g.fill(); g.restore(); }
    else { g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); }
  }
  g.globalAlpha = 1;
}
function drawTexts(g) {
  g.textAlign = 'center'; g.textBaseline = 'middle';
  for (const t of TEXT) {
    const k = t.t / t.life, a = k > 0.7 ? (1 - k) / 0.3 : 1, pop = t.t < 0.12 ? 1 + (1 - t.t / 0.12) * 0.5 : 1;
    const size = (t.cls === 'crit' ? 17 : t.cls === 'word' ? 26 : t.cls === 'big' ? 15 : 13) * pop * Math.min(1.25, Math.max(0.85, R.CS / 52));
    g.font = `${size}px ${t.cls === 'word' ? '"East Sea Dokdo",cursive' : '"Jua","Apple SD Gothic Neo",sans-serif'}`;
    g.globalAlpha = a; g.lineWidth = 3.4; g.strokeStyle = 'rgba(30,18,10,.85)';
    const x = wx(t.x), y = wy(t.y);
    g.strokeText(t.s, x, y);
    g.fillStyle = t.cls === 'crit' ? '#ffd24a' : t.cls === 'coin' ? '#ffd24a' : t.cls === 'res' ? '#c9c4bb' : t.cls === 'myth' ? '#ffb39c' : '#fff8ea';
    g.fillText(t.s, x, y);
  }
  g.globalAlpha = 1;
}

/* ---------- unit visuals ---------- */
const UVIS = new Map();
function unitVis(u, i) {
  let v = UVIS.get(u.id);
  if (!v) { v = { id: u.id, t: u.t, ph: rand(0, 10), n: u.n, last: -9, spawn: 0, x: cellX(i), y: cellY(i), face: cellX(i) < 0 ? -1 : 1, pose: newPose(), leap: null, sub: null }; UVIS.set(u.id, v); }
  return v;
}
function syncUnits(dt) {
  const seen = new Set();
  for (let i = 0; i < NCELL; i++) {
    const u = G.units[i]; if (!u) continue;
    const v = unitVis(u, i); seen.add(u.id); v.cell = i; v.u = u;
    if (u.n !== v.n) { v.n = u.n; v.last = R.time; v.lastK = (u.n - 1) % (u.c || 1); if (u.dir) v.face = u.dir; }
    if (v.spawn < 1) v.spawn = Math.min(1, v.spawn + dt / 0.38);
    const dragging = drag && drag.moved && drag.uid === u.id;
    const tx = dragging ? drag.x : cellX(i), ty = dragging ? drag.y : cellY(i);
    const kk = 1 - Math.exp(-dt * 16); v.x += (tx - v.x) * kk; v.y += (ty - v.y) * kk;
  }
  for (const id of [...UVIS.keys()]) if (!seen.has(id)) UVIS.delete(id);
}
const STACK_POS = [null, [[0, 0]], [[-0.21, 0.03], [0.21, -0.02]], [[-0.22, 0.07], [0.22, 0.07], [0, -0.1]], [[-0.21, -0.1], [0.21, -0.1], [-0.21, 0.09], [0.21, 0.09]]];
const STACK_SC = [1, 1, 0.74, 0.68, 0.6];
/* 무당's curse: a yellow paper talisman flutters over a cursed foe */
function drawCurse(g, x, y, s) {
  const CS = R.CS, w = CS * 0.13 * s, h = CS * 0.24 * s;
  g.save(); g.translate(x, y); g.rotate(Math.sin(R.time * 5 + x) * 0.18);
  g.fillStyle = '#f4d75a'; g.strokeStyle = '#6a4a10'; g.lineWidth = 1; g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.fill(); g.stroke();
  g.strokeStyle = '#c8241c'; g.lineWidth = Math.max(1, CS * 0.018 * s); g.beginPath();
  g.moveTo(-w * 0.25, -h * 0.35); g.lineTo(w * 0.25, -h * 0.35); g.moveTo(0, -h * 0.4); g.lineTo(0, h * 0.35); g.moveTo(-w * 0.28, -h * 0.05); g.quadraticCurveTo(0, h * 0.12, w * 0.28, -h * 0.05); g.moveTo(-w * 0.22, h * 0.25); g.lineTo(w * 0.22, h * 0.25);
  g.stroke(); g.restore();
}
/* 도깨비굴 출정: the empty cell left behind shows a cave mouth, the fight's progress and the time left */
function drawExpCell(g, r) {
  (r.cells || []).forEach((i, k) => {
    const CS = R.CS, cx = wx(cellX(i)), cy = wy(cellY(i)), s = 0.9 * CS;
    g.save();
    g.setLineDash([CS * 0.09, CS * 0.07]); g.lineDashOffset = -R.time * CS * 0.25;
    g.strokeStyle = 'rgba(242,193,74,.8)'; g.lineWidth = Math.max(1.5, CS * 0.035);
    g.beginPath(); RR(g, cx - s / 2, cy - s / 2, s, s, 0.14 * CS); g.stroke(); g.setLineDash([]);
    const aw = CS * 0.34, ah = CS * 0.38, ay = cy + CS * 0.2;
    g.fillStyle = '#6d6474'; g.beginPath(); g.moveTo(cx - aw - CS * 0.07, ay); g.ellipse(cx, ay, aw + CS * 0.07, ah + CS * 0.06, 0, PI, TAU); g.closePath(); g.fill();
    g.fillStyle = '#15111c'; g.beginPath(); g.moveTo(cx - aw, ay); g.ellipse(cx, ay, aw, ah, 0, PI, TAU); g.closePath(); g.fill();
    if (Math.sin(R.time * 11 + k * 1.7) > 0.2) { for (let j = 0; j < 3; j++) { const a = R.time * 7 + j * 2.1 + k; g.fillStyle = j % 2 ? 'rgba(255,230,140,.9)' : 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(cx + Math.cos(a) * aw * 0.45, ay - ah * 0.45 + Math.sin(a * 1.3) * ah * 0.25, CS * 0.03, 0, TAU); g.fill(); } }
    const fs = Math.max(9, CS * 0.19);
    g.font = `${fs}px "Jua",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
    if (k === 0) {
      const lab = `${r.floor}층 ${Math.ceil(r.t)}초`, tw = Math.min(s, g.measureText(lab).width + fs * 0.9);
      g.fillStyle = 'rgba(22,19,31,.78)'; g.beginPath(); RR(g, cx - tw / 2, cy - s / 2 + CS * 0.04, tw, fs * 1.2, fs * 0.6); g.fill();
      g.fillStyle = '#ffe6a0'; g.fillText(lab, cx, cy - s / 2 + CS * 0.04 + fs * 0.62);
    }
    const bw = s * 0.8, bh = Math.max(3, CS * 0.07), bx = cx - bw / 2, by = cy + s / 2 - bh - CS * 0.05;
    g.fillStyle = 'rgba(22,19,31,.8)'; g.beginPath(); RR(g, bx - 1, by - 1, bw + 2, bh + 2, bh); g.fill();
    g.fillStyle = '#e2563c'; g.beginPath(); RR(g, bx, by, Math.max(0, bw * r.hp / r.max), bh, bh / 2); g.fill();
    g.restore();
  });
}
/* while choosing who to send, each companion shows how much of the floor boss it would cut down in time */
function drawExpPick(g) {
  const CS = R.CS, fs = Math.max(9, CS * 0.2), sel = R.pickSel, tot = partyRatio(sel), done = tot >= 1;
  g.font = `${fs}px "Jua",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const a = 0.55 + 0.45 * Math.sin(R.time * 6);
  for (let i = 0; i < NCELL; i++) {
    const u = G.units[i]; if (!u) continue;
    const on = sel.includes(i), q = expRatio(i), txt = `${Math.max(1, Math.round(q * 100))}%`;
    const x = wx(cellX(i)), y = wy(cellY(i) - 0.44), w = Math.max(fs * 2.6, g.measureText(txt).width + fs * 0.9), h = fs * 1.25;
    if (on) { g.strokeStyle = done ? `rgba(95,211,154,${0.6 + 0.4 * a})` : `rgba(242,193,74,${0.6 + 0.4 * a})`; g.lineWidth = Math.max(2, CS * 0.05); g.beginPath(); RR(g, wx(cellX(i) - 0.46), wy(cellY(i) - 0.46), 0.92 * CS, 0.92 * CS, 0.14 * CS); g.stroke(); }
    g.fillStyle = on ? (done ? '#3fae6a' : '#e0a53a') : 'rgba(22,19,31,.78)'; g.beginPath(); RR(g, x - w / 2, y - h / 2, w, h, h / 2); g.fill();
    g.fillStyle = on ? '#fff' : (q >= 1 ? '#9ff0c0' : '#f6efe0'); g.fillText(txt, x, y + 1);
  }
}
const easeOutBack = k => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
/* a small badge per family: mask for 탈, drum for 사물놀이, shield for 수호, sword for 장수 */
function famBadge(g, fam, x, y, r) {
  g.save(); g.translate(x, y);
  g.fillStyle = FAMS[fam].color; g.strokeStyle = '#fff6e6'; g.lineWidth = Math.max(1.2, r * 0.18);
  g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.stroke();
  g.fillStyle = '#fff6e6'; g.strokeStyle = '#fff6e6'; g.lineWidth = Math.max(1, r * 0.16); g.lineCap = 'round';
  if (fam === 'tal') { g.beginPath(); g.ellipse(0, 0, r * 0.52, r * 0.62, 0, 0, TAU); g.fill(); g.strokeStyle = FAMS[fam].color; g.beginPath(); g.moveTo(-r * 0.32, -r * 0.12); g.quadraticCurveTo(-r * 0.18, -r * 0.26, -r * 0.06, -r * 0.12); g.moveTo(r * 0.06, -r * 0.12); g.quadraticCurveTo(r * 0.18, -r * 0.26, r * 0.32, -r * 0.12); g.moveTo(-r * 0.22, r * 0.2); g.quadraticCurveTo(0, r * 0.4, r * 0.22, r * 0.2); g.stroke(); }
  else if (fam === 'samul') { g.beginPath(); g.ellipse(0, -r * 0.18, r * 0.5, r * 0.2, 0, 0, TAU); g.fill(); g.fillRect(-r * 0.5, -r * 0.18, r, r * 0.5); g.beginPath(); g.ellipse(0, r * 0.32, r * 0.5, r * 0.2, 0, 0, TAU); g.fill(); g.beginPath(); g.moveTo(-r * 0.15, -r * 0.3); g.lineTo(-r * 0.55, -r * 0.75); g.moveTo(r * 0.15, -r * 0.3); g.lineTo(r * 0.55, -r * 0.75); g.stroke(); }
  else if (fam === 'suho') { g.beginPath(); g.moveTo(0, -r * 0.62); g.lineTo(r * 0.5, -r * 0.38); g.lineTo(r * 0.42, r * 0.18); g.quadraticCurveTo(r * 0.2, r * 0.5, 0, r * 0.64); g.quadraticCurveTo(-r * 0.2, r * 0.5, -r * 0.42, r * 0.18); g.lineTo(-r * 0.5, -r * 0.38); g.closePath(); g.fill(); }
  else { g.lineWidth = Math.max(1.4, r * 0.2); g.beginPath(); g.moveTo(-r * 0.45, r * 0.45); g.lineTo(r * 0.5, -r * 0.5); g.stroke(); g.beginPath(); g.moveTo(-r * 0.42, r * 0.06); g.lineTo(-r * 0.06, r * 0.42); g.stroke(); }
  g.restore();
}
function drawUnitBase(g, v, T) {
  if (v.u && canMergeAt(v.cell)) {
    const a = 0.5 + 0.5 * Math.sin(R.time * 3), cx = wx(cellX(v.cell) - 0.46), cy = wy(cellY(v.cell) - 0.46), s = 0.92 * R.CS;
    g.save(); g.shadowColor = `rgba(255,255,255,${0.45 * a})`; g.shadowBlur = R.CS * 0.12;
    g.strokeStyle = `rgba(255,255,255,${0.35 + 0.25 * a})`; g.lineWidth = Math.max(1.6, R.CS * 0.04);
    g.beginPath(); RR(g, cx, cy, s, s, 0.14 * R.CS); g.stroke(); g.restore();
  }
  const x = wx(cellX(v.cell)), y = wy(cellY(v.cell) + 0.12), rx = R.CS * 0.38, ry = R.CS * 0.2, tr = TIERS[T.tier];
  g.fillStyle = rgba(tr.color, T.tier >= 4 ? 0.5 : 0.36); g.strokeStyle = tr.color; g.lineWidth = Math.max(1.5, R.CS * 0.045);
  g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill(); g.stroke();
  if (T.grp === 'beast') {
    const cols = ['#2f6ad8', '#e2402e', '#f4f0e6', '#1f1a17', '#f2c43a'], sp = R.time * 1.2;
    g.strokeStyle = rgba(tr.light, 0.85); g.lineWidth = Math.max(2, R.CS * 0.05); g.beginPath(); g.ellipse(x, y, rx * 1.16, ry * 1.16, 0, 0, TAU); g.stroke();
    for (let k = 0; k < 5; k++) { const a = sp + k * TAU / 5; g.fillStyle = cols[k]; g.strokeStyle = OL; g.lineWidth = 1; g.beginPath(); g.arc(x + Math.cos(a) * rx * 1.16, y + Math.sin(a) * ry * 1.16, Math.max(2.2, R.CS * 0.05), 0, TAU); g.fill(); g.stroke(); }
  } else if (T.grp === 'tale') {
    const cols = ['#e2402e', '#f2c43a', '#3fae6a', '#3a6ad8', '#b06aff', '#ff7ab8'], n = cols.length, sp = R.time * 0.8;
    g.lineWidth = Math.max(2.4, R.CS * 0.07);
    for (let k = 0; k < n; k++) { g.strokeStyle = cols[k]; g.beginPath(); g.ellipse(x, y, rx * 1.14, ry * 1.14, 0, sp + k * TAU / n, sp + (k + 1) * TAU / n); g.stroke(); }
    if (Math.random() < R.dtv * 3) part(cellX(v.cell) + rand(-0.35, 0.35), cellY(v.cell) + 0.1, 0.2, 0, 0, 0.9, pick(cols), 0.045, 0.7, { g: -0.8, drag: 1 });
  } else if (T.tier >= 3) { g.strokeStyle = rgba(tr.light, 0.7); g.lineWidth = 1.4; g.setLineDash([R.CS * 0.08, R.CS * 0.06]); g.lineDashOffset = -R.time * R.CS * 0.3; g.beginPath(); g.ellipse(x, y, rx * 1.12, ry * 1.12, 0, 0, TAU); g.stroke(); g.setLineDash([]); }
}
function drawUnit(g, v) {
  const u = v.u, T = TYPES[u.t], D = PUP[T.id];
  const dur = (KEYS[D.atk] && KEYS[D.atk].dur) || 0.36, ap = Math.min(1, (R.time - v.last) / dur);
  const sil = u.sil > 0;
  let fx = v.x, fy = v.y + 0.3, lift = 0;
  if (v.leap) {
    const L = v.leap; L.t += R.dtv;
    const p = Math.min(1, L.t / (L.back ? L.d2 : L.d1));
    if (!L.back) { fx = lerp(L.x0, L.x1, p); fy = lerp(L.y0, L.y1, p) + 0.3; lift = Math.sin(p * PI) * 1.5; if (p >= 1) { L.back = true; L.t = 0; } }
    else { fx = lerp(L.x1, L.x0, p); fy = lerp(L.y1, L.y0, p) + 0.3; lift = Math.sin(p * PI) * 1.0; if (p >= 1) v.leap = null; }
    v.face = (L.back ? L.x0 - L.x1 : L.x1 - L.x0) >= 0 ? 1 : -1;
  }
  const dragging = drag && drag.moved && drag.uid === u.id;
  if (dragging) lift = 0.35;
  const pose = computePose(v.pose, D, R.time, v.ph, ap, sil);
  if (pose.lunge && u.tx != null) { const dx = u.tx - fx, dy = u.ty - fy, l = Math.hypot(dx, dy) || 1, m = Math.min(0.45, l * 0.3) * pose.lunge; fx += dx / l * m; fy += dy / l * m; }
  const sc = PIXEL ? 1 : (v.spawn < 1 ? Math.max(0.05, easeOutBack(v.spawn)) : 1) * (dragging ? 1.1 : 1);
  const k = R.CS * UNIT_S * D.size / 100 * sc * unitFit(T.id);
  if (PIXEL && v.spawn < 1) lift += (1 - easeOutBack(Math.min(1, v.spawn))) * 0.5;
  const sx = wx(fx), sy = wy(fy);
  g.fillStyle = 'rgba(40,25,10,.28)'; g.beginPath(); g.ellipse(sx, sy - 1, R.CS * 0.26 * (D.quad ? 1.4 : 1), R.CS * 0.09, 0, 0, TAU); g.fill();
  const yy = sy - lift * R.CS;
  const cnt = u.c || 1;
  const grp = D.group && !(typeof spriteReady === 'function' && spriteReady(T.id));
  if (cnt > 1 && !grp) {
    const pos = STACK_POS[Math.min(4, cnt)], ks = STACK_SC[Math.min(4, cnt)];
    v.poses = v.poses || [];
    const order = pos.map((p, j) => j).sort((a, b) => pos[a][1] - pos[b][1]);
    for (const j of order) {
      const pp = v.poses[j] || (v.poses[j] = newPose());
      computePose(pp, D, R.time, v.ph + j * 1.7, j === (v.lastK || 0) ? ap : 1, sil);
      drawPuppet(g, T.id, sx + pos[j][0] * R.CS, yy + pos[j][1] * R.CS, k * ks, pp, j === (v.lastK || 0) || j % 2 === 0 ? v.face : -v.face, dragging ? 0.92 : 1);
    }
  } else if (grp) {
    for (const [sid, ox, oy] of D.group.slice().sort((a, b) => a[2] - b[2])) {
      const SD = PUP[sid], sp = v.sub || (v.sub = {}), pp = sp[sid] || (sp[sid] = newPose());
      computePose(pp, SD, R.time, v.ph + ox * 3, Math.min(1, (R.time - v.last) / 0.36), sil);
      drawPuppet(g, sid, sx + ox * R.CS * 0.5, yy + oy * R.CS * 0.36, k * (D.groupK || 0.62), pp, ox < 0 ? 1 : -1);
    }
  } else drawPuppet(g, T.id, sx, yy, k, pose, v.face, dragging ? 0.92 : 1);
  if (D.ribbon) drawRibbon(g, sx + v.face * k * 3, yy - k * 92, ap < 1 ? 1 : 0, v);
  if (T.tier >= 4 && ULTS[T.id] && G.phase === 'play') {
    const w = R.CS * 0.56, h = Math.max(3, R.CS * 0.065), bx = sx - w / 2, by = wy(cellY(v.cell)) + R.CS * 0.36, m = Math.min(1, (u.mana || 0) / 100);
    g.fillStyle = 'rgba(15,12,25,.75)'; g.beginPath(); RR(g, bx - 1, by - 1, w + 2, h + 2, h); g.fill();
    g.fillStyle = m >= 0.97 ? '#ffd36a' : '#5ab0ff'; if (m > 0.02) { g.beginPath(); RR(g, bx, by, w * m, h, h / 2); g.fill(); }
  }
  if (G.charmT > 0 && Math.random() < R.dtv * 2.5) part(v.x + rand(-0.25, 0.25), v.y + 0.2, 0.25, 0, 0, 0.8, '#ffd36a', 0.04, 0.5, { g: -0.9, drag: 1 });
  const fb = G.tierBuff && G.tierBuff[T.tier];
  if (fb && fb.t > 0 && Math.random() < R.dtv * 6) part(v.x + rand(-0.25, 0.25), v.y + 0.3, 0.3, 0, 0, 1, '#ff7a5a', 0.05, 0.6, { g: -0.6, drag: 1 });
  if (D.orbs) drawOrbs(g, sx, yy - R.CS * 0.55, v);
  if (sil) { g.fillStyle = 'rgba(70,40,110,.5)'; for (let j = 0; j < 3; j++) { const a = R.time * 4 + j * TAU / 3; g.beginPath(); g.arc(sx + Math.cos(a) * R.CS * 0.25, yy - R.CS * 1.05 + Math.sin(a) * R.CS * 0.06, R.CS * 0.05, 0, TAU); g.fill(); } }
  if (R.recipeHi && R.recipeHi.cells.includes(v.cell)) {
    const by = yy - R.CS * (UNIT_S * 1.1 * D.size + 0.12) + Math.sin(R.time * 6) * R.CS * 0.04;
    g.fillStyle = '#2f9473'; g.strokeStyle = '#fff'; g.lineWidth = 2; g.beginPath(); g.arc(sx, by, R.CS * 0.13, 0, TAU); g.fill(); g.stroke();
    g.strokeStyle = '#fff'; g.lineWidth = 2.4; g.beginPath(); g.moveTo(sx - R.CS * 0.06, by); g.lineTo(sx - R.CS * 0.01, by + R.CS * 0.05); g.lineTo(sx + R.CS * 0.07, by - R.CS * 0.05); g.stroke();
  }
}
function drawRibbon(g, hx, hy, fast, v) {
  const sp = fast ? 14 : 3.2;
  v.rib = (v.rib || 0) + R.dtv * sp;
  const L = R.CS * 1.15;
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath();
  for (let s = 0; s <= 1.0001; s += 0.05) {
    const a = v.rib - s * (fast ? 1.4 : 2.6), r = s * L;
    const x = hx + Math.cos(a) * r, y = hy - R.CS * 0.05 + Math.sin(a) * r * 0.35 + s * s * R.CS * (fast ? 0.05 : 0.45);
    s ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = Math.max(2.5, R.CS * 0.07); g.stroke();
  g.strokeStyle = '#fbf8f0'; g.lineWidth = Math.max(1.6, R.CS * 0.045); g.stroke();
}
function drawOrbs(g, x, y, v) {
  for (let j = 0; j < 3; j++) {
    const a = R.time * 2.2 + j * TAU / 3, ox = x + Math.cos(a) * R.CS * 0.48, oy = y + Math.sin(a) * R.CS * 0.2, r = R.CS * 0.1;
    const gr = g.createRadialGradient(ox, oy, 0, ox, oy, r * 1.8);
    gr.addColorStop(0, 'rgba(220,250,255,.95)'); gr.addColorStop(0.4, 'rgba(90,190,255,.8)'); gr.addColorStop(1, 'rgba(60,120,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(ox, oy, r * 1.8, 0, TAU); g.fill();
  }
}

/* ---------- foes ---------- */
function drawFoe(g, f) {
  const CS = R.CS;
  if (f === R.foeSel) { const r = f.boss ? 0.66 : f.chal ? 0.46 : 0.27; g.strokeStyle = '#ffd36a'; g.lineWidth = 2; g.setLineDash([5, 4]); g.lineDashOffset = -R.time * 24; g.beginPath(); g.ellipse(wx(f.x), wy(f.y + 0.06), CS * r, CS * r * 0.4, 0, 0, TAU); g.stroke(); g.setLineDash([]); }
  if (f.boss) return drawBoss(g, f);
  if (f.chal) return drawChal(g, f);
  const art = FOE_ART[f.kind]; if (!art) return;
  if (Math.abs(f.hx) > 0.3) f.face = f.hx > 0 ? 1 : -1;
  const face = f.face || 1, fr = Math.floor(f.wob / PI) & 1;
  const rise = Math.min(1, f.age / 0.35);
  const ghost = f.kind === 2 || f.kind === 6 || f.kind === 7;
  const hover = ghost ? 0.08 + Math.sin(f.wob * 0.6) * 0.04 : Math.abs(Math.sin(f.wob)) * 0.05;
  const x = wx(f.x), y = wy(f.y + 0.06), k = CS * FOE_H / 64 * (0.6 + 0.4 * rise) * (f.mini ? 0.72 : 1);
  g.fillStyle = 'rgba(40,25,10,.25)'; g.beginPath(); g.ellipse(x, y, CS * 0.2, CS * 0.07, 0, 0, TAU); g.fill();
  if (f.slowT > 0) { g.strokeStyle = 'rgba(80,150,255,.8)'; g.lineWidth = 2; g.beginPath(); g.ellipse(x, y, CS * 0.24, CS * 0.09, 0, 0, TAU); g.stroke(); }
  const yy = y - hover * CS;
  g.save(); g.translate(x, yy); g.scale(face * k, k);
  if (f.down > 0) { g.rotate(-1.35 * clamp(f.down / 0.4, 0, 1)); g.globalAlpha = 0.75; }
  else if (f.stunT > 0) g.rotate(Math.sin(R.time * 22) * 0.06);
  if (f.revT > 0) g.rotate(-0.12);
  if (PIXEL && !(f.down > 0)) {
    g.restore();
    const kk = CS * FOE_H / 64 * (f.mini ? 0.72 : 1), p = art[fr], al = 0.35 + 0.65 * rise;
    pixDraw(g, pixBake('foe' + f.kind + ':' + fr, kk / PIX.px, [p.x0, p.y0, p.x0 + p.w, p.y0 + p.h], hg => hg.drawImage(p.cv, p.x0, p.y0, p.w, p.h)), x, yy, face, al);
    if (f.flash > 0) { const w = art.white[fr]; pixDraw(g, pixBake('foew' + f.kind + ':' + fr, kk / PIX.px, [w.x0, w.y0, w.x0 + w.w, w.y0 + w.h], hg => hg.drawImage(w.cv, w.x0, w.y0, w.w, w.h), true), x, yy, face, Math.min(1, f.flash / 0.09) * 0.65); }
  } else {
  const p = art[fr]; g.drawImage(p.cv, p.x0, p.y0, p.w, p.h); g.globalAlpha = 1;
  if (f.flash > 0) { g.globalAlpha = Math.min(1, f.flash / 0.09) * 0.65; const w = art.white[fr]; g.drawImage(w.cv, w.x0, w.y0, w.w, w.h); g.globalAlpha = 1; }
  g.restore();
  }
  const top = yy - CS * FOE_H * (art.spr ? art[0].H / 64 * (f.mini ? 0.72 : 1) + 0.04 : 1.02);
  if (f.burnT > 0 && Math.random() < R.dtv * 14 * QUALITY[R.q].pmul) part(f.x + rand(-0.15, 0.15), f.y, rand(0.2, 0.5), 0, 0, rand(0.6, 1.2), pick(['#ffb347', '#ff6a2a', '#ffd36a']), 0.06, 0.4, { g: -1, drag: 1 });
  if (f.markT > 0) { g.strokeStyle = '#e8402e'; g.lineWidth = 2; const r = CS * 0.09; g.beginPath(); g.arc(x, top - CS * 0.08, r, 0, TAU); g.moveTo(x - r * 1.5, top - CS * 0.08); g.lineTo(x + r * 1.5, top - CS * 0.08); g.moveTo(x, top - CS * 0.08 - r * 1.5); g.lineTo(x, top - CS * 0.08 + r * 1.5); g.stroke(); }
  if (f.stunT > 0) { g.fillStyle = '#ffd24a'; for (let j = 0; j < 3; j++) { const a = R.time * 7 + j * TAU / 3; star(g, x + Math.cos(a) * CS * 0.16, top + Math.sin(a) * CS * 0.05, CS * 0.05); } }
  if (f.curseT > 0) drawCurse(g, x - CS * 0.3, top - CS * 0.12, 0.8);
  if (f.hp < f.max || f === R.foeSel) {
    const w = CS * 0.5, h = Math.max(3, CS * 0.07), pct = Math.max(0, f.hp / f.max), bx = x - w / 2, by = top - CS * 0.02;
    g.fillStyle = 'rgba(20,12,8,.7)'; g.fillRect(bx - 1, by - 1, w + 2, h + 2);
    g.fillStyle = pct > 0.5 ? '#5fd39a' : pct > 0.25 ? '#f2c14a' : '#ef5a3a'; g.fillRect(bx, by, w * pct, h);
  }
}
function star(g, x, y, r) { g.beginPath(); for (let i = 0; i < 10; i++) { const a = -PI / 2 + i * PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); g.fill(); }
const PB = { x: 0, y: 0, dx: 0, dy: 0 };
function drawBoss(g, f) {
  const CS = R.CS;
  if (Math.abs(f.hx) > 0.3) f.face = f.hx > 0 ? 1 : -1;
  const face = f.face || 1, x = wx(f.x), y = wy(f.y + 0.08);
  const bob = Math.abs(Math.sin(f.wob * 0.5)) * CS * 0.04;
  if (f.hidden > 0) {
    g.fillStyle = '#7a5a32'; g.strokeStyle = OL; g.lineWidth = 2;
    g.beginPath(); g.ellipse(x, y - CS * 0.05, CS * 0.5, CS * 0.2, 0, PI, 0); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#9a7a4a'; for (let j = 0; j < 5; j++) { g.beginPath(); g.arc(x + (j - 2) * CS * 0.18, y - CS * (0.12 + (j % 2) * 0.06), CS * 0.08, 0, TAU); g.fill(); }
    if (Math.random() < R.dtv * 12) part(f.x + rand(-0.4, 0.4), f.y, 0.1, rand(-0.5, 0.5), 0, rand(0.6, 1.2), '#9a7a4a', 0.05, 0.5, { g: 3 });
    if (Math.random() < R.dtv * 4) part(f.x, f.y, 0.3, 0, 0, 0.8, '#ffe58a', 0.05, 0.6, { g: -0.3, kind: 'spark' });
    return;
  }
  g.fillStyle = 'rgba(40,25,10,.3)'; g.beginPath(); g.ellipse(x, y, CS * 0.6, CS * 0.16, 0, 0, TAU); g.fill();
  if (f.slowT > 0) { g.strokeStyle = 'rgba(80,150,255,.8)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y, CS * 0.66, CS * 0.2, 0, 0, TAU); g.stroke(); }
  const art = BOSS_ART[f.boss]; if (!art) return;
  const BH = art.spr ? art.H / 100 : 1.3;
  if ((f.boss === 'imugi' || f.boss === 'heukryong') && !art.spr) {
    const segs = 16, dr = f.boss === 'heukryong';
    for (let j = segs; j >= 1; j--) {
      pathAt(f.d - j * 0.26, PB);
      const r = CS * 0.26 * (1 - j / (segs + 6)), sx = wx(PB.x), sy = wy(PB.y) - r * 0.9 - Math.max(0, Math.sin(R.time * 5 - j * 0.6)) * CS * 0.06;
      if (dr && j % 2) { g.fillStyle = '#3a7ab0'; g.beginPath(); g.moveTo(sx - r * 0.4, sy - r * 0.7); g.lineTo(sx, sy - r * 1.5); g.lineTo(sx + r * 0.4, sy - r * 0.7); g.closePath(); g.fill(); }
      g.fillStyle = dr ? (j % 2 ? '#22283a' : '#2c3550') : (j % 2 ? '#2f6e66' : '#3c8277'); g.strokeStyle = OL; g.lineWidth = 2;
      g.beginPath(); g.arc(sx, sy, r, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = dr ? '#6a8ab0' : '#e0c070'; g.beginPath(); g.ellipse(sx, sy + r * 0.45, r * 0.7, r * 0.35, 0, 0, TAU); g.fill();
      if (dr && j === 6) for (const sd of [-1, 1]) { g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.moveTo(sx, sy + r * 0.6); g.lineTo(sx + sd * r * 0.9, sy + r * 1.5); g.stroke(); }
    }
  }
  if (f.rage) { g.strokeStyle = `rgba(255,210,90,${0.5 + 0.3 * Math.sin(R.time * 10)})`; g.lineWidth = 3; g.beginPath(); g.arc(x, y - CS * BH * 0.45, CS * (art.spr ? 0.95 : 0.6), 0, TAU); g.stroke(); }
  const scale = art.spr ? 1 : BOSS_SCALE[f.boss] || 1.3;
  const k = CS * scale / 100;
  g.save(); g.translate(x, y - bob); g.scale(face * k, k);
  if (f.boss === 'gumiho' && !art.spr) {
    for (let j = 0; j < 9; j++) {
      const a = -PI * 0.5 - 0.9 + j * 0.2 + Math.sin(R.time * 2.4 + j) * 0.08, len = 46;
      const bx = -30, by = -40, ex = bx + Math.cos(a) * len * -0.6 - 18, ey = by + Math.sin(a) * len;
      g.lineCap = 'round';
      g.strokeStyle = OL; g.lineWidth = 13; g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(bx - 20, by - 10, ex, ey); g.stroke();
      g.strokeStyle = '#e2832e'; g.lineWidth = 10; g.stroke();
      g.fillStyle = '#fbf3e6'; g.beginPath(); g.arc(ex, ey, 6, 0, TAU); g.fill();
    }
  }
  g.drawImage(art.cv, art.x0, art.y0, art.w, art.h);
  if (f.flash > 0) { g.globalAlpha = Math.min(1, f.flash / 0.09) * 0.55; g.drawImage(art.white.cv, art.x0, art.y0, art.w, art.h); g.globalAlpha = 1; }
  g.restore();
  if (f.boss === 'gumiho' && Math.random() < R.dtv * 10) { const a = rand(0, TAU); part(f.x + Math.cos(a) * 0.7, f.y + Math.sin(a) * 0.3, 0.6, 0, 0, 0.5, '#7ad8ff', 0.07, 0.6, { g: -0.4, drag: 1 }); }
  if (f.boss === 'bulgasari' && Math.random() < R.dtv * 8) part(f.x + rand(-0.5, 0.5), f.y, rand(0.5, 1.1), 0, 0, 0.6, '#ff7a3a', 0.05, 0.6, { g: -0.4, drag: 1 });
  if (f.boss === 'geumdwaeji' && Math.random() < R.dtv * 6) part(f.x + rand(-0.6, 0.6), f.y, rand(0.4, 1.0), 0, 0, 0.5, '#ffe58a', 0.04, 0.6, { g: -0.3, drag: 1, kind: 'spark' });
  if (f.boss === 'yeomra' && Math.random() < R.dtv * 4) part(f.x + rand(-0.7, 0.7), f.y + 0.1, 0.02, 0, 0, 0.1, '#7a6a9a', 0.09, 0.8, { kind: 'smoke', g: -0.05, shrink: false });
  if (f.boss === 'heukryong' && Math.random() < R.dtv * 3) { const a = R.time * 2; part(f.x + Math.cos(a) * 0.6, f.y + Math.sin(a) * 0.2, 0.9, 0, 0, 0.2, '#e8f4ff', 0.09, 0.5, { g: 0, drag: 1 }); }
  if (f.stunT > 0) { g.fillStyle = '#ffd24a'; for (let j = 0; j < 3; j++) { const a = R.time * 7 + j * TAU / 3; star(g, x + Math.cos(a) * CS * 0.3, y - CS * (BH + 0.05) + Math.sin(a) * CS * 0.08, CS * 0.07); } }
  if (f.curseT > 0) drawCurse(g, x - CS * 0.5, y - CS * (BH + 0.12), 1.2);
  if (f.markT > 0) { g.strokeStyle = '#e8402e'; g.lineWidth = 2.5; const r = CS * 0.12, cy = y - CS * (BH + 0.12); g.beginPath(); g.arc(x, cy, r, 0, TAU); g.moveTo(x - r * 1.5, cy); g.lineTo(x + r * 1.5, cy); g.moveTo(x, cy - r * 1.5); g.lineTo(x, cy + r * 1.5); g.stroke(); }
}

function drawChal(g, f) {
  const CS = R.CS, art = CHAL_ART[f.chal]; if (!art) return;
  if (Math.abs(f.hx) > 0.3) f.face = f.hx > 0 ? 1 : -1;
  const face = f.face || 1, x = wx(f.x), y = wy(f.y + 0.08), left = f.chalT / f.chalMax;
  const grow = f.chal === 'eodum' ? 1 + (1 - left) * 0.35 : 1;
  const rise = Math.min(1, f.age / 0.5), bob = Math.abs(Math.sin(f.wob * 0.5)) * CS * 0.04;
  g.fillStyle = 'rgba(40,25,10,.3)'; g.beginPath(); g.ellipse(x, y, CS * 0.42 * grow, CS * 0.12, 0, 0, TAU); g.fill();
  if (f.slowT > 0) { g.strokeStyle = 'rgba(80,150,255,.8)'; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y, CS * 0.48 * grow, CS * 0.15, 0, 0, TAU); g.stroke(); }
  const k = CS * 1.0 / 90 * grow * (0.4 + 0.6 * rise), hover = f.chal === 'eodum' ? CS * (0.06 + Math.sin(f.wob * 0.7) * 0.04) : bob;
  g.save(); g.translate(x, y - hover); g.scale(face * k, k);
  if (f.stunT > 0) g.rotate(Math.sin(R.time * 22) * 0.05);
  g.drawImage(art.cv, art.x0, art.y0, art.w, art.h);
  if (f.flash > 0) { g.globalAlpha = Math.min(1, f.flash / 0.09) * 0.55; g.drawImage(art.white.cv, art.x0, art.y0, art.w, art.h); g.globalAlpha = 1; }
  g.restore();
  const top = y - CS * (art.spr ? art.H / 90 + 0.05 : 1.05) * grow - hover;
  const w = CS * 0.8, h = Math.max(4, CS * 0.08), pct = Math.max(0, f.hp / f.max);
  g.fillStyle = 'rgba(20,12,8,.75)'; g.fillRect(x - w / 2 - 1, top - 1, w + 2, h + 2);
  g.fillStyle = '#b06aff'; g.fillRect(x - w / 2, top, w * pct, h);
  const cy = top - CS * 0.2, r = CS * 0.15;
  g.fillStyle = 'rgba(22,19,31,.85)'; g.beginPath(); g.arc(x, cy, r, 0, TAU); g.fill();
  g.strokeStyle = left > 0.3 ? '#f2c14a' : '#ef5a3a'; g.lineWidth = Math.max(2.5, CS * 0.05); g.lineCap = 'round';
  g.beginPath(); g.arc(x, cy, r, -PI / 2, -PI / 2 + TAU * left); g.stroke();
  g.fillStyle = '#fff6e6'; g.font = `${Math.max(10, CS * 0.2)}px "Jua",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(String(Math.ceil(f.chalT)), x, cy + 1);
  if (f.stunT > 0) { g.fillStyle = '#ffd24a'; for (let j = 0; j < 3; j++) { const a = R.time * 7 + j * TAU / 3; star(g, x + Math.cos(a) * CS * 0.28, top + CS * 0.1 + Math.sin(a) * CS * 0.06, CS * 0.06); } }
  if (f.markT > 0) { g.strokeStyle = '#e8402e'; g.lineWidth = 2.2; const rr = CS * 0.1, my = top + CS * 0.25; g.beginPath(); g.arc(x + CS * 0.42, my, rr, 0, TAU); g.stroke(); }
  if (f.curseT > 0) drawCurse(g, x - CS * 0.42, top + CS * 0.25, 1.1);
}
function chalPortraitURL(id, css) {
  const key = 'chal:' + id + ':' + css;
  if (PORTRAIT_CACHE.has(key)) return PORTRAIT_CACHE.get(key);
  const d = Math.min(window.devicePixelRatio || 1, 2), c = document.createElement('canvas');
  c.width = c.height = Math.round(css * d);
  const g = c.getContext('2d'); g.scale(d, d);
  const sid = 'chal_' + id, has = typeof FOE_SPRITES !== 'undefined' && FOE_SPRITES[sid];
  if (has && foeSpriteReady(sid)) fitSprite(g, FOE_SPRITES[sid], css, 0.94);
  else { g.translate(css * 0.47, css * 0.96); const k = css / 110; g.scale(k, k); g.lineCap = 'round'; g.lineJoin = 'round'; CHAL2D[id](g); }
  const url = c.toDataURL(); if (!has || foeSpriteReady(sid)) PORTRAIT_CACHE.set(key, url); return url;
}
/* ---------- projectiles ---------- */
function drawShot(g, s) {
  const CS = R.CS, x = wx(s.x), y = wy(s.y), gy = wy(s.gy);
  if (!s.straight && !s.boomer) { g.fillStyle = 'rgba(40,25,10,.18)'; g.beginPath(); g.ellipse(x, gy, CS * 0.06, CS * 0.025, 0, 0, TAU); g.fill(); }
  const ang = Math.atan2(s.vy, s.vx), t = R.time;
  g.save(); g.translate(x, y);
  if (drawShotExtra(g, s, ang, t)) { g.restore(); return; }
  switch (s.kind) {
    case 'stone': g.fillStyle = '#8d8a84'; g.strokeStyle = OL; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, CS * 0.055, 0, TAU); g.fill(); g.stroke(); break;
    case 'gust': g.rotate(ang); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = CS * 0.05; g.lineCap = 'round'; g.beginPath(); g.arc(-CS * 0.08, 0, CS * 0.13, -0.9, 0.9); g.stroke(); g.strokeStyle = 'rgba(160,230,140,.8)'; g.lineWidth = CS * 0.025; g.beginPath(); g.arc(-CS * 0.16, 0, CS * 0.1, -0.8, 0.8); g.stroke(); break;
    case 'yarn': g.fillStyle = '#a8d4ff'; g.strokeStyle = OL; g.lineWidth = 1.3; g.beginPath(); g.arc(0, 0, CS * 0.07, 0, TAU); g.fill(); g.stroke(); g.strokeStyle = '#5a8ad0'; g.lineWidth = 1; g.beginPath(); g.arc(0, 0, CS * 0.045, t * 8, t * 8 + 3); g.stroke(); break;
    case 'bird': { g.scale(s.vx >= 0 ? 1 : -1, 1); const w = Math.sin(t * 26) * CS * 0.08; g.fillStyle = '#b4895a'; g.strokeStyle = OL; g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, 0, CS * 0.11, CS * 0.05, 0, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-CS * 0.02, 0); g.lineTo(-CS * 0.08, -CS * 0.02 - w); g.lineTo(CS * 0.04, -CS * 0.01); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#e8b23a'; g.beginPath(); g.moveTo(CS * 0.11, -CS * 0.01); g.lineTo(CS * 0.16, 0); g.lineTo(CS * 0.11, CS * 0.015); g.fill(); break; }
    case 'petal': for (let j = 0; j < 3; j++) { g.save(); g.rotate(t * 9 + j * 2.1); g.fillStyle = j % 2 ? '#ff8fb8' : '#ffc2dc'; g.beginPath(); g.ellipse(CS * 0.05, 0, CS * 0.06, CS * 0.03, 0, 0, TAU); g.fill(); g.restore(); } break;
    case 'cleaver': g.rotate(t * 18); g.fillStyle = '#dfe3ea'; g.strokeStyle = OL; g.lineWidth = 1.4; g.fillRect(-CS * 0.08, -CS * 0.05, CS * 0.13, CS * 0.1); g.strokeRect(-CS * 0.08, -CS * 0.05, CS * 0.13, CS * 0.1); g.fillStyle = '#6b4428'; g.fillRect(CS * 0.05, -CS * 0.02, CS * 0.07, CS * 0.04); break;
    case 'coin': { const sx = Math.abs(Math.cos(t * 14)) + 0.15; g.scale(sx, 1); g.fillStyle = '#f2c94a'; g.strokeStyle = '#8a6a1a'; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, CS * 0.065, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#5a4510'; g.fillRect(-CS * 0.02, -CS * 0.02, CS * 0.04, CS * 0.04); break; }
    case 'ink': g.fillStyle = '#1e2040'; g.beginPath(); g.arc(0, 0, CS * 0.07, 0, TAU); g.fill(); g.fillStyle = 'rgba(30,32,64,.5)'; g.beginPath(); g.arc(-s.vx * CS * 0.1, -s.vy * CS * 0.1, CS * 0.04, 0, TAU); g.fill(); break;
    case 'bolt': g.rotate(ang); g.strokeStyle = 'rgba(255,215,110,.55)'; g.lineWidth = CS * 0.08; g.lineCap = 'round'; g.beginPath(); g.moveTo(-CS * 0.26, 0); g.lineTo(CS * 0.06, 0); g.stroke(); g.strokeStyle = '#fff5cc'; g.lineWidth = CS * 0.03; g.beginPath(); g.moveTo(-CS * 0.22, 0); g.lineTo(CS * 0.1, 0); g.stroke(); break;
    case 'onibi': { const r = CS * 0.11; const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.6); gr.addColorStop(0, 'rgba(230,250,255,.95)'); gr.addColorStop(0.45, 'rgba(90,190,255,.85)'); gr.addColorStop(1, 'rgba(60,120,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.6, 0, TAU); g.fill(); break; }
    case 'wave': { g.rotate(ang); const w = CS * 0.42; g.fillStyle = 'rgba(230,70,50,.55)'; g.beginPath(); g.ellipse(0, 0, CS * 0.16, w, 0, -PI / 2, PI / 2); g.ellipse(-CS * 0.06, 0, CS * 0.1, w * 0.85, 0, PI / 2, -PI / 2, true); g.fill(); g.strokeStyle = 'rgba(255,200,170,.8)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, CS * 0.16, w, 0, -PI / 2, PI / 2); g.stroke(); break; }
    case 'plate': g.rotate(t * 16); g.fillStyle = '#f4f0e6'; g.strokeStyle = OL; g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, 0, CS * 0.13, CS * 0.06, 0, 0, TAU); g.fill(); g.stroke(); g.strokeStyle = '#d63b2e'; g.lineWidth = 1.6; g.beginPath(); g.ellipse(0, 0, CS * 0.08, CS * 0.035, 0, 0, TAU); g.stroke(); break;
  }
  g.restore();
}

/* ---------- portal, helpers ---------- */
function drawPortal(g) {
  const p = pathAt(0.05), x = wx(p.x - 0.18), y = wy(p.y), CS = R.CS;
  g.fillStyle = 'rgba(40,20,70,.55)'; g.beginPath(); g.ellipse(x, y, CS * 0.42, CS * 0.2, 0, 0, TAU); g.fill();
  for (let j = 0; j < 3; j++) { g.strokeStyle = `rgba(${150 - j * 20},${110 + j * 30},255,${0.7 - j * 0.15})`; g.lineWidth = 2.5; g.beginPath(); g.ellipse(x, y, CS * (0.18 + j * 0.09), CS * (0.08 + j * 0.045), 0, R.time * (2 + j) , R.time * (2 + j) + 4); g.stroke(); }
  if (Math.random() < R.dtv * 6) part(p.x - 0.18 + rand(-0.2, 0.2), p.y, 0.05, 0, 0, rand(0.5, 1), '#b48cff', 0.05, 0.9, { g: -0.3, drag: 0.5 });
}
function drawHelpers(g) {
  const CS = R.CS;
  const dragU = drag && drag.moved && G.units[drag.from] && G.units[drag.from].id === drag.uid ? G.units[drag.from] : null;
  const roundSq = (i, col, w, a) => { const x = wx(cellX(i) - 0.47), y = wy(cellY(i) - 0.47); g.strokeStyle = rgba(col, a); g.lineWidth = w; g.beginPath(); RR(g, x, y, 0.94 * CS, 0.94 * CS, 0.12 * CS); g.stroke(); };
  let rx = null, ry = 0, rr = 0;
  if (dragU) {
    const T = TYPES[dragU.t];
    if (drag.hover >= 0) roundSq(drag.hover, '#ffffff', 3, 0.9);
    if (T.tier < 3) G.units.forEach((u, i) => { if (u && i !== drag.from && u.t === dragU.t && u.c < capOf(u.t)) roundSq(i, TIERS[T.tier].light, 3.5, 0.55 + 0.45 * Math.sin(R.time * 9)); });
    if (T.range < 50) { rx = drag.x; ry = drag.y; rr = rngOf(T, drag.hover); }
  } else if (G.sel >= 0 && G.units[G.sel]) {
    const T = TYPES[G.units[G.sel].t];
    roundSq(G.sel, '#fff4cc', 3, 0.95);
    if (T.range < 50) { rx = cellX(G.sel); ry = cellY(G.sel); rr = rngOf(T, G.sel); }
  }
  if (rx != null) {
    g.fillStyle = 'rgba(255,255,255,.08)'; g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = 1.6; g.setLineDash([6, 5]);
    g.beginPath(); g.arc(wx(rx), wy(ry), rr * CS, 0, TAU); g.fill(); g.stroke(); g.setLineDash([]);
  }
}

/* names under each companion, for players still learning who is who */
function drawNames(g) {
  const fs = Math.max(9, R.CS * 0.15);
  g.font = `${fs}px "Jua",sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < NCELL; i++) {
    const u = G.units[i]; if (!u) continue;
    const T = TYPES[u.t], x = wx(cellX(i)), y = wy(cellY(i) + 0.47), w = g.measureText(T.name).width + fs * 0.7;
    g.fillStyle = 'rgba(15,12,25,.78)'; g.beginPath(); RR(g, x - w / 2, y - fs * 0.62, w, fs * 1.24, fs * 0.6); g.fill();
    g.fillStyle = TIERS[T.tier].light; g.fillText(T.name, x, y + 1);
  }
}
/* 최무선's 불바다: flickering fire on the ground, fading as it burns out */
function drawFields(g) {
  for (const F of G.fields) {
    const k = clamp(F.t / F.max, 0, 1), x = wx(F.x), y = wy(F.y), rx = F.r * R.CS, ry = rx * 0.5;
    const gr = g.createRadialGradient(x, y, 0, x, y, rx);
    gr.addColorStop(0, `rgba(255,200,90,${0.42 * k})`); gr.addColorStop(0.6, `rgba(255,110,40,${0.3 * k})`); gr.addColorStop(1, 'rgba(200,50,20,0)');
    g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, rx, ry, 0, 0, TAU); g.fill();
    if (Math.random() < R.dtv * 10 * k) part(F.x + rand(-F.r, F.r) * 0.7, F.y + rand(-F.r, F.r) * 0.35, 0.1, 0, 0, rand(0.4, 0.8), pick(['#ffd36a', '#ff8a3a', '#ff5a2a']), 0.045, 0.6, { g: -1.2, drag: 1 });
  }
}
/* ---------- frame ---------- */
const DRAWLIST = [];
function renderFrame(dt) {
  R.dtv = dt;
  const ev = G.ev; if (ev.length) { G.ev = []; for (const e of ev) onEvent(e); }
  syncUnits(dt); updateFx(dt);
  const g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(BG, 0, 0);
  g.setTransform(R.DPR, 0, 0, R.DPR, 0, 0);
  PIX.snap = R.DPR; PIX.px = Math.max(1, Math.round(R.CS * PIX_UNIT * 1.05 / PIX.art * R.DPR)) / R.DPR;
  if (R.shake > 0) { const s = R.shake * R.CS * 0.12; g.translate(rand(-s, s), rand(-s, s)); R.shake = Math.max(0, R.shake - dt * 2.5); }
  drawPortal(g);
  drawHelpers(g);
  for (let i = 0; i < NCELL; i++) { const u = G.units[i]; if (u) { const v = UVIS.get(u.id); if (v && v.cell === i) drawUnitBase(g, v, TYPES[u.t]); } }
  if (G.phase === 'play' && G.exp && G.exp.run) drawExpCell(g, G.exp.run);
  if (G.fields && G.fields.length) drawFields(g);
  foeSprites();
  DRAWLIST.length = 0;
  for (const v of UVIS.values()) if (G.units[v.cell] && G.units[v.cell].id === v.id) DRAWLIST.push({ y: (v.leap ? 99 : v.y + 0.3), k: 0, o: v });
  for (const f of G.foes) if (!f.dead) DRAWLIST.push({ y: f.y + (f.boss ? 0.2 : 0.06), k: 1, o: f });
  DRAWLIST.sort((a, b) => a.y - b.y);
  for (const d of DRAWLIST) { if (d.k) drawFoe(g, d.o); else drawUnit(g, d.o); }
  if (R.names && G.phase === 'play') drawNames(g);
  if (G.phase === 'play' && R.pickExp) drawExpPick(g);
  for (const s of G.shots) if (!s.dead) drawShot(g, s);
  if (G.sky) { R.skyA = Math.min(1, (R.skyA || 0) + dt * 2); R.skyK = G.sky; } else R.skyA = Math.max(0, (R.skyA || 0) - dt * 2);
  if (R.skyA > 0.01) { g.fillStyle = R.skyK === 'moon' ? `rgba(40,60,150,${0.17 * R.skyA})` : `rgba(255,170,60,${0.12 * R.skyA})`; g.fillRect(0, 0, R.W, R.H); }
  drawFx(g); drawFxExtra(g); drawParticles(g); drawTexts(g);
  if (G.phase === 'play' && G.paused) {
    g.fillStyle = 'rgba(15,12,25,.45)'; g.fillRect(0, 0, R.W, R.H);
    g.textAlign = 'center'; g.fillStyle = '#f6efe0'; g.font = '48px "East Sea Dokdo",cursive'; g.fillText('잠깐 쉬는 중', R.W / 2, wy(0));
  }
  g.setTransform(R.DPR, 0, 0, R.DPR, 0, 0);
  drawFly(g, dt);
}
function fpsMonitor(dt) {
  if (G.phase !== 'play' || G.paused || !R.autoQ) { R.fpsT = 0; R.fpsN = 0; return; }
  R.fpsT += dt; R.fpsN++;
  if (R.fpsT >= 4) { const fps = R.fpsN / R.fpsT; R.fpsT = 0; R.fpsN = 0; if (fps < 40 && R.q < 2) { setQuality(R.q + 1); toast(`화면이 버벅여서 화질을 ${QUALITY[R.q].name}으로 낮췄어요`); } }
}

/* ---------- input ---------- */
let drag = null;
function toWorld(e) { return { x: (e.clientX - R.OX) / R.CS, y: (e.clientY - R.OY) / R.CS }; }
function unitAtPoint(p, skipId) {
  let best = -1, by = -1e9;
  for (let i = 0; i < NCELL; i++) {
    const u = G.units[i]; if (!u || u.id === skipId) continue;
    const D = PUP[TYPES[u.t].id], cx = cellX(i), fy = cellY(i) + 0.3, h = UNIT_S * 1.15 * D.size;
    if (p.x >= cx - 0.46 && p.x <= cx + 0.46 && p.y >= fy - h && p.y <= fy + 0.16 && fy > by) { best = i; by = fy; }
  }
  if (best >= 0) return best;
  const c = cellAt(p.x, p.y);
  return c >= 0 && Math.abs(p.x - cellX(c)) < 0.5 && Math.abs(p.y - cellY(c)) < 0.5 ? c : -1;
}
function foeAtPoint(p) {
  let best = null, bd = 1e9;
  for (const f of G.foes) {
    if (f.dead || f.hidden > 0) continue;
    const cy = f.y - (f.boss ? 0.45 : f.chal ? 0.4 : 0.26), d = Math.hypot(p.x - f.x, p.y - cy), lim = f.boss ? 0.85 : f.chal ? 0.65 : 0.42;
    if (d < lim && d < bd) { bd = d; best = f; }
  }
  return best;
}
function bindInput(onSelect) {
  cv.addEventListener('pointerdown', e => {
    if (G.phase !== 'play') return;
    const p = toWorld(e), i = unitAtPoint(p);
    if (R.pickExp) {
      if (i >= 0 && G.units[i]) {
        const k = R.pickSel.indexOf(i);
        if (k >= 0) R.pickSel.splice(k, 1);
        else if (R.pickSel.length >= EXP_MAX) toast(`출정은 한 번에 ${EXP_MAX}칸까지 보낼 수 있어요`);
        else R.pickSel.push(i);
        sfx('tap');
      }
      G.sel = -1; onSelect(); return;
    }
    R.expInfo = isAway(i);
    if (i >= 0 && G.units[i]) {
      R.foeSel = null;
      drag = { from: i, uid: G.units[i].id, sx: e.clientX, sy: e.clientY, moved: false, x: cellX(i), y: cellY(i), hover: i };
      try { cv.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    } else { const f = foeAtPoint(p); R.foeSel = f; G.sel = -1; if (f) sfx('tap'); onSelect(); }
  });
  cv.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 8) drag.moved = true;
    const p = toWorld(e);
    drag.x = clamp(p.x, -HX, HX); drag.y = clamp(p.y + 0.15, -HY, HY);
    drag.hover = unitAtPoint(p, drag.uid);
  });
  const end = e => {
    if (!drag) return;
    const d = drag; drag = null;
    if (!G.units[d.from] || G.units[d.from].id !== d.uid) return;
    if (d.moved) { const to = unitAtPoint(toWorld(e), d.uid); if (to >= 0) drop(d.from, to); }
    else if (G.sel === d.from && canMergeAt(d.from)) mergeAt(d.from);
    else G.sel = G.sel === d.from ? -1 : d.from;
    onSelect();
  };
  cv.addEventListener('pointerup', end);
  cv.addEventListener('pointercancel', () => { drag = null; });
}

