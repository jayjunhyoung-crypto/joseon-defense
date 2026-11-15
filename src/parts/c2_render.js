/* ================= renderer part 2: stage scenery, flying coins, extra fx ================= */
let ISLAND = null;
function seaLand(x, y) { if (!ISLAND) return true; const [x0, y0, x1, y1] = ISLAND; return x > x0 && x < x1 && y > y0 && y < y1; }
function seaBase(g, rnd, mx0, my0, mx1, my1) {
  const W = R.W, H = R.H, s = R.CS / 55, e = 46 * s;
  g.fillStyle = '#3f7fae'; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(20,50,90,.35)'); gr.addColorStop(1, 'rgba(120,190,230,.15)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.strokeStyle = 'rgba(220,240,255,.35)'; g.lineWidth = 1.6;
  for (let i = 0; i < W * H / 2600; i++) { const x = rnd() * W, y = rnd() * H, w = 8 + rnd() * 14; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + w / 2, y - 4, x + w, y); g.stroke(); }
  ISLAND = [mx0 - e, my0 - e * 0.7, mx1 + e, H + 10];
  g.save(); g.shadowColor = 'rgba(255,255,255,.55)'; g.shadowBlur = 10;
  g.beginPath(); RR(g, ISLAND[0], ISLAND[1], ISLAND[2] - ISLAND[0], ISLAND[3] - ISLAND[1], 46 * s); g.fillStyle = '#e8d6a2'; g.fill(); g.restore();
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2.4; g.beginPath(); RR(g, ISLAND[0] - 3, ISLAND[1] - 3, ISLAND[2] - ISLAND[0] + 6, ISLAND[3] - ISLAND[1] + 6, 48 * s); g.stroke();
  g.fillStyle = '#e0cb94'; g.beginPath(); RR(g, ISLAND[0] + 8, ISLAND[1] + 8, ISLAND[2] - ISLAND[0] - 16, ISLAND[3] - ISLAND[1] - 16, 40 * s); g.fill();
}
function spots(rnd, s) { const out = [], W = R.W, H = R.H; for (let y = 40; y < H; y += 120 * s) for (let x = 30; x < W; x += 140 * s) out.push([x + rnd() * 60 * s, y + rnd() * 50 * s]); return out; }
function freeFn(mx0, my0, mx1, my1) { return (x, y, r) => x + r < mx0 - 4 || x - r > mx1 + 4 || y + r < my0 - 4 || y - r > my1 + 4; }
function roof(g, w, h, col) { g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * 0.8, -h * 1.1, 0, -h); g.quadraticCurveTo(w * 0.8, -h * 1.1, w, 0); g.quadraticCurveTo(0, -h * 0.25, -w, 0); g.closePath(); g.fillStyle = col; g.fill(); g.strokeStyle = OL; g.lineWidth = 2; g.stroke(); }
const DECOR = {
  village: (...a) => decorOutside(...a),
  market(g, rnd, mx0, my0, mx1, my1) {
    const s = R.CS / 55, free = freeFn(mx0, my0, mx1, my1);
    const stall = (x, y, k, c1, c2) => {
      g.save(); g.translate(x, y); g.scale(k, k); g.lineWidth = 2; g.strokeStyle = OL;
      g.fillStyle = 'rgba(0,0,0,.18)'; g.beginPath(); g.ellipse(0, 4, 46, 7, 0, 0, TAU); g.fill();
      g.fillStyle = '#7a5230'; for (const px of [-36, 32]) { g.fillRect(px, -46, 4, 50); g.strokeRect(px, -46, 4, 50); }
      g.fillStyle = '#9a6a3a'; g.fillRect(-40, -14, 80, 16); g.strokeRect(-40, -14, 80, 16);
      for (let k2 = 0; k2 < 6; k2++) { g.fillStyle = pick(['#d63b2e', '#f0c43a', '#3a8a4a', '#e8e2d2', '#8a4a9a']); g.beginPath(); g.arc(-30 + k2 * 12, -18, 5, 0, TAU); g.fill(); g.stroke(); }
      for (let k2 = 0; k2 < 8; k2++) { g.fillStyle = k2 % 2 ? c1 : c2; g.beginPath(); g.moveTo(-46 + k2 * 11.5, -46); g.lineTo(-46 + (k2 + 1) * 11.5, -46); g.lineTo(-44 + (k2 + 1) * 11.5, -60); g.lineTo(-44 + k2 * 11.5, -60); g.closePath(); g.fill(); g.stroke(); }
      g.fillStyle = c1; g.beginPath(); for (let k2 = 0; k2 < 8; k2++) { g.moveTo(-46 + k2 * 11.5, -46); g.arc(-46 + k2 * 11.5 + 5.75, -46, 5.75, PI, 0, true); } g.fill(); g.stroke();
      g.restore();
    };
    const lantern = (x, y, k) => {
      g.save(); g.translate(x, y); g.scale(k, k);
      const gl = g.createRadialGradient(0, -44, 0, 0, -44, 26); gl.addColorStop(0, 'rgba(255,220,140,.45)'); gl.addColorStop(1, 'rgba(255,220,140,0)'); g.fillStyle = gl; g.fillRect(-26, -70, 52, 52);
      g.strokeStyle = OL; g.lineWidth = 2; g.fillStyle = '#5a3a20'; g.fillRect(-2, -60, 4, 62); g.strokeRect(-2, -60, 4, 62);
      g.fillStyle = '#2f5fb8'; g.beginPath(); g.ellipse(0, -50, 9, 6, 0, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = '#d63b2e'; g.beginPath(); g.ellipse(0, -40, 9, 7, 0, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = '#f0c43a'; g.fillRect(-1.5, -33, 3, 6);
      g.restore();
    };
    const jar = (x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(-15, -12, -10, -22); g.lineTo(10, -22); g.quadraticCurveTo(15, -12, 9, 0); g.closePath(); g.fillStyle = '#5a3420'; g.fill(); g.strokeStyle = OL; g.lineWidth = 2; g.stroke(); g.restore(); };
    for (const [x, y] of spots(rnd, s)) {
      if (!free(x, y, 70 * s)) continue;
      const r = rnd();
      if (r < 0.36) stall(x, y, s * 0.85, pick(['#d63b2e', '#2f5fb8', '#3a8a4a']), '#f4f0e6');
      else if (r < 0.6) lantern(x, y, s);
      else if (r < 0.8) { jar(x - 10 * s, y, s); jar(x + 12 * s, y + 2 * s, s * 1.15); }
      else { g.fillStyle = '#c9a85a'; g.strokeStyle = OL; g.lineWidth = 1.6; g.beginPath(); g.ellipse(x, y, 16 * s, 7 * s, 0, 0, TAU); g.fill(); g.stroke(); for (let k = 0; k < 5; k++) { g.fillStyle = pick(['#6a9a48', '#d63b2e', '#f0c43a']); g.beginPath(); g.arc(x - 10 * s + k * 5 * s, y - 3 * s, 3.4 * s, 0, TAU); g.fill(); } }
    }
    if (my0 > 40) for (let x = mx0 + 20 * s; x < mx1 - 20 * s; x += 96 * s) stall(x + 30 * s, my0 - 8, s * 0.75, rnd() < 0.5 ? '#d63b2e' : '#2f5fb8', '#f4f0e6');
  },
  fortress(g, rnd, mx0, my0, mx1, my1) {
    const s = R.CS / 55, free = freeFn(mx0, my0, mx1, my1);
    const pine = (x, y, k) => {
      g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = OL; g.lineWidth = 2;
      g.fillStyle = 'rgba(0,0,0,.2)'; g.beginPath(); g.ellipse(0, 4, 24, 6, 0, 0, TAU); g.fill();
      g.fillStyle = '#8a4a2a'; g.beginPath(); g.moveTo(-4, 4); g.quadraticCurveTo(-8, -30, 4, -62); g.lineTo(9, -60); g.quadraticCurveTo(0, -30, 5, 4); g.closePath(); g.fill(); g.stroke();
      for (const [cx, cy, rx] of [[-14, -40, 18], [14, -52, 20], [-6, -66, 16], [8, -78, 13]]) { g.fillStyle = '#2f5a34'; g.beginPath(); g.ellipse(cx, cy, rx, rx * 0.42, 0, 0, TAU); g.fill(); g.stroke(); g.fillStyle = 'rgba(160,210,140,.25)'; g.beginPath(); g.ellipse(cx - 3, cy - 3, rx * 0.6, rx * 0.18, 0, 0, TAU); g.fill(); }
      g.restore();
    };
    const rock = (x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#8d8a84'; g.strokeStyle = OL; g.lineWidth = 2; g.beginPath(); g.moveTo(-18, 2); g.lineTo(-12, -14); g.lineTo(4, -18); g.lineTo(16, -8); g.lineTo(18, 2); g.closePath(); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.2)'; g.beginPath(); g.moveTo(-10, -12); g.lineTo(2, -15); g.lineTo(-2, -8); g.closePath(); g.fill(); g.restore(); };
    for (const [x, y] of spots(rnd, s)) { if (!free(x, y, 70 * s)) continue; const r = rnd(); if (r < 0.55) pine(x, y, s * (0.8 + rnd() * 0.4)); else if (r < 0.8) rock(x, y, s * (0.8 + rnd() * 0.5)); }
    if (my0 > 30) {
      const y = my0 - 6, h = 26 * s;
      g.fillStyle = '#8f8b82'; g.fillRect(mx0 - 30, y - h, mx1 - mx0 + 60, h); g.strokeStyle = 'rgba(40,30,20,.6)'; g.lineWidth = 1;
      for (let row = 0; row < 3; row++) for (let x = mx0 - 30 + (row % 2) * 9 * s; x < mx1 + 30; x += 18 * s) { const v = 120 + rnd() * 40 | 0; g.fillStyle = `rgb(${v},${v - 4},${v - 10})`; g.fillRect(x, y - h + row * h / 3, 17 * s, h / 3 - 1); g.strokeRect(x, y - h + row * h / 3, 17 * s, h / 3 - 1); }
      for (let x = mx0 - 30; x < mx1 + 30; x += 22 * s) { g.fillStyle = '#9a968c'; g.fillRect(x, y - h - 10 * s, 14 * s, 10 * s); g.strokeRect(x, y - h - 10 * s, 14 * s, 10 * s); }
      g.save(); g.translate((mx0 + mx1) / 2, y - h - 8 * s); g.scale(s, s);
      g.fillStyle = '#a8322a'; g.fillRect(-34, -24, 68, 26); g.strokeStyle = OL; g.lineWidth = 2; g.strokeRect(-34, -24, 68, 26);
      g.translate(0, -22); roof(g, 52, 26, '#3a3d45'); g.restore();
    }
  },
  sea(g, rnd, mx0, my0, mx1, my1) {
    const s = R.CS / 55, free = freeFn(mx0, my0, mx1, my1);
    const boat = (x, y, k) => {
      g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = OL; g.lineWidth = 2;
      g.fillStyle = 'rgba(20,40,70,.3)'; g.beginPath(); g.ellipse(0, 6, 46, 6, 0, 0, TAU); g.fill();
      g.fillStyle = '#7a5230'; g.beginPath(); g.moveTo(-44, -10); g.quadraticCurveTo(-40, 6, -30, 6); g.lineTo(30, 6); g.quadraticCurveTo(42, 4, 46, -12); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = '#9a6a3a'; g.fillRect(-30, -22, 52, 12); g.strokeRect(-30, -22, 52, 12);
      g.fillStyle = '#a8322a'; g.fillRect(-14, -36, 26, 14); g.strokeRect(-14, -36, 26, 14);
      g.translate(-1, -36); roof(g, 20, 10, '#3a3d45'); g.translate(1, 36);
      g.fillStyle = '#5a3a20'; g.fillRect(16, -74, 3, 52);
      g.fillStyle = '#efe6cf'; g.beginPath(); g.moveTo(19, -72); g.quadraticCurveTo(38, -56, 20, -30); g.closePath(); g.fill(); g.stroke();
      g.fillStyle = pick(['#d63b2e', '#2f5fb8', '#f0c43a']); g.beginPath(); g.moveTo(17, -74); g.lineTo(5, -70); g.lineTo(17, -66); g.closePath(); g.fill(); g.stroke();
      g.restore();
    };
    const flag = (x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = OL; g.lineWidth = 2; g.fillStyle = '#5a3a20'; g.fillRect(-1.5, -56, 3, 58); g.fillStyle = pick(['#d63b2e', '#2f5fb8', '#f0c43a', '#3a8a4a', '#f4f0e6']); g.beginPath(); g.moveTo(1.5, -56); g.lineTo(26, -50); g.lineTo(1.5, -40); g.closePath(); g.fill(); g.stroke(); g.restore(); };
    const barrel = (x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = OL; g.lineWidth = 2; g.fillStyle = '#8a5a32'; g.beginPath(); g.moveTo(-9, 0); g.quadraticCurveTo(-12, -11, -9, -22); g.lineTo(9, -22); g.quadraticCurveTo(12, -11, 9, 0); g.closePath(); g.fill(); g.stroke(); g.strokeStyle = '#3a2414'; g.beginPath(); g.moveTo(-10, -6); g.lineTo(10, -6); g.moveTo(-10, -16); g.lineTo(10, -16); g.stroke(); g.restore(); };
    for (const [x, y] of spots(rnd, s)) {
      if (!free(x, y, 70 * s)) continue;
      const land = seaLand(x, y) && seaLand(x - 30 * s, y) && seaLand(x + 30 * s, y), r = rnd();
      if (!land) { if (r < 0.32) boat(x, y, s * (0.75 + rnd() * 0.3)); }
      else if (r < 0.4) flag(x, y, s); else if (r < 0.7) { barrel(x - 8 * s, y, s); barrel(x + 10 * s, y + 3 * s, s * 0.9); }
    }
  },
  underworld(g, rnd, mx0, my0, mx1, my1) {
    const s = R.CS / 55, free = freeFn(mx0, my0, mx1, my1);
    const tree = (x, y, k) => {
      g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = '#120e18'; g.lineCap = 'round';
      g.lineWidth = 7; g.beginPath(); g.moveTo(0, 2); g.quadraticCurveTo(-4, -30, 2, -50); g.stroke();
      g.lineWidth = 3.4; g.beginPath(); g.moveTo(1, -30); g.quadraticCurveTo(16, -40, 22, -58); g.moveTo(0, -40); g.quadraticCurveTo(-16, -48, -20, -64); g.moveTo(2, -50); g.quadraticCurveTo(6, -62, 2, -72); g.stroke();
      g.lineWidth = 1.8; g.beginPath(); g.moveTo(16, -46); g.lineTo(26, -48); g.moveTo(-12, -52); g.lineTo(-22, -50); g.stroke();
      g.restore();
    };
    const lantern = (x, y, k) => {
      g.save(); g.translate(x, y); g.scale(k, k);
      const gl = g.createRadialGradient(0, -36, 0, 0, -36, 30); gl.addColorStop(0, 'rgba(255,90,60,.45)'); gl.addColorStop(1, 'rgba(255,90,60,0)'); g.fillStyle = gl; g.fillRect(-30, -66, 60, 60);
      g.strokeStyle = OL; g.lineWidth = 2; g.fillStyle = '#2a1a1a'; g.fillRect(-1.5, -50, 3, 52);
      g.fillStyle = '#d6402e'; g.beginPath(); g.ellipse(0, -36, 8, 10, 0, 0, TAU); g.fill(); g.stroke();
      g.restore();
    };
    const mound = (x, y, k) => { g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#4a4458'; g.strokeStyle = OL; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, 26, 13, 0, PI, 0); g.closePath(); g.fill(); g.stroke(); g.restore(); };
    for (const [x, y] of spots(rnd, s)) { if (!free(x, y, 70 * s)) continue; const r = rnd(); if (r < 0.4) tree(x, y, s * (0.8 + rnd() * 0.4)); else if (r < 0.62) lantern(x, y, s); else if (r < 0.8) mound(x, y, s); else { for (let k = 0; k < 4; k++) { const gx = x + rnd() * 40 * s, gy = y + rnd() * 24 * s, gr = g.createRadialGradient(gx, gy, 0, gx, gy, 6 * s); gr.addColorStop(0, 'rgba(160,210,255,.9)'); gr.addColorStop(1, 'rgba(90,140,255,0)'); g.fillStyle = gr; g.fillRect(gx - 6 * s, gy - 6 * s, 12 * s, 12 * s); } } }
    if (my0 > 30) {
      const cx = (mx0 + mx1) / 2, y = my0 - 4;
      g.save(); g.translate(cx, y); g.scale(s, s); g.strokeStyle = OL; g.lineWidth = 2;
      g.fillStyle = '#b8322a'; for (const px of [-70, 66]) { g.fillRect(px, -64, 6, 66); g.strokeRect(px, -64, 6, 66); }
      g.fillRect(-76, -64, 154, 6); g.strokeRect(-76, -64, 154, 6); g.fillRect(-72, -50, 146, 4); g.strokeRect(-72, -50, 146, 4);
      for (let k = 0; k < 16; k++) { const x = -62 + k * 8.2; g.fillRect(x, -76, 2.6, 26); g.beginPath(); g.moveTo(x - 2, -76); g.lineTo(x + 1.3, -84); g.lineTo(x + 4.6, -76); g.closePath(); g.fill(); g.stroke(); }
      g.fillStyle = '#d6402e'; g.beginPath(); g.arc(0, -70, 7, PI / 2, PI * 1.5); g.fill(); g.fillStyle = '#2f5fb8'; g.beginPath(); g.arc(0, -70, 7, -PI / 2, PI / 2); g.fill(); g.beginPath(); g.arc(0, -70, 7, 0, TAU); g.stroke();
      g.restore();
    }
  },
};

/* ---------- flying coins (screen space) ---------- */
const FLY = [];
let onFlyArrive = noop;
function flyCoin(x, y, target, n = 1, kind = 'coin') {
  if (!target || reduceMotion) return;
  const r = target.getBoundingClientRect(); if (!r.width) return;
  for (let k = 0; k < n && FLY.length < 24; k++) FLY.push({ x0: wx(x) + rand(-8, 8), y0: wy(y) + rand(-8, 8), x1: r.left + r.width / 2, y1: r.top + r.height / 2, t: -k * 0.06, dur: 0.55 + Math.random() * 0.2, kind, side: Math.random() < 0.5 ? -1 : 1 });
}
function drawFly(g, dt) {
  for (let i = FLY.length - 1; i >= 0; i--) {
    const f = FLY[i]; f.t += dt; if (f.t < 0) continue;
    const k = Math.min(1, f.t / f.dur), e = k * k * (3 - 2 * k);
    const cx = (f.x0 + f.x1) / 2 + f.side * 50, cy = Math.min(f.y0, f.y1) - 40;
    const x = (1 - e) * (1 - e) * f.x0 + 2 * (1 - e) * e * cx + e * e * f.x1, y = (1 - e) * (1 - e) * f.y0 + 2 * (1 - e) * e * cy + e * e * f.y1;
    const rr = 6 * (1 - k * 0.3), sx = Math.abs(Math.cos(f.t * 14)) * 0.8 + 0.2;
    g.save(); g.translate(x, y); g.scale(sx, 1);
    g.fillStyle = f.kind === 'silver' ? '#dfe3ea' : '#f2c94a'; g.strokeStyle = f.kind === 'silver' ? '#6a7080' : '#8a6a1a'; g.lineWidth = 1.4;
    g.beginPath(); g.arc(0, 0, rr, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = f.kind === 'silver' ? '#8a90a0' : '#5a4510'; g.fillRect(-rr * 0.3, -rr * 0.3, rr * 0.6, rr * 0.6);
    g.restore();
    if (k >= 1) { FLY.splice(i, 1); onFlyArrive(f.kind); }
  }
}

/* ---------- extra fx: falling boulders, storm clouds ---------- */
function drawFxExtra(g) {
  const CS = R.CS;
  for (const e of FX) {
    if (e.t < 0) continue;
    const k = e.t / e.life;
    if (e.k === 'fall') {
      const big = e.big ? 2.6 : 1, x = wx(e.x), y = wy(e.y), h = (1 - k * k) * 6 * CS, sr = CS * (0.2 + 0.5 * k) * big;
      g.fillStyle = `rgba(30,20,10,${0.15 + 0.3 * k})`; g.beginPath(); g.ellipse(x, y, sr, sr * 0.4, 0, 0, TAU); g.fill();
      g.save(); g.translate(x, y - h - CS * 0.3 * big); g.rotate(e.big ? 0 : e.t * 5); const r = CS * 0.42 * big;
      g.fillStyle = '#8d8a84'; g.strokeStyle = OL; g.lineWidth = 2; g.beginPath(); for (let i = 0; i < 7; i++) { const a = i / 7 * TAU, rr = r * (0.8 + ((i * 37) % 5) / 12); g.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } g.closePath(); g.fill(); g.stroke();
      g.fillStyle = 'rgba(255,255,255,.22)'; g.beginPath(); g.ellipse(-r * 0.3, -r * 0.3, r * 0.3, r * 0.18, -0.5, 0, TAU); g.fill();
      g.restore();
    } else if (e.k === 'cloud') {
      const a = k < 0.15 ? k / 0.15 : k > 0.8 ? (1 - k) / 0.2 : 1, x = wx(cellX(e.col)), y0 = wy(-ROWS / 2 - 0.6), y1 = wy(ROWS / 2 + 0.2);
      g.globalAlpha = a;
      g.fillStyle = 'rgba(30,34,52,.85)'; for (const [dx, dy, r] of [[-0.3, 0, 0.32], [0.05, -0.12, 0.38], [0.36, 0.02, 0.3]]) { g.beginPath(); g.arc(x + dx * CS, y0 + dy * CS, r * CS, 0, TAU); g.fill(); }
      g.strokeStyle = 'rgba(150,190,255,.55)'; g.lineWidth = 1.4;
      for (let i = 0; i < 14; i++) { const rx = x + (((i * 53 + Math.floor(R.time * 30) * 7) % 100) / 100 - 0.5) * CS * 0.9, ry = y0 + ((i * 29 + R.time * 300) % (y1 - y0)); g.beginPath(); g.moveTo(rx, ry); g.lineTo(rx - 3, ry + 10); g.stroke(); }
      g.fillStyle = 'rgba(40,50,90,.12)'; g.fillRect(x - CS * 0.5, y0, CS, y1 - y0);
      g.globalAlpha = 1;
    }
  }
}
function drawShotExtra(g, s, ang, t) {
  const CS = R.CS;
  switch (s.kind) {
    case 'sunray': {
      const r = CS * 0.1, gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.9);
      gr.addColorStop(0, 'rgba(255,250,220,1)'); gr.addColorStop(0.45, 'rgba(255,200,80,.9)'); gr.addColorStop(1, 'rgba(255,140,40,0)');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.9, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,220,120,.85)'; g.lineWidth = 1.6; g.rotate(t * 6); g.beginPath();
      for (let k = 0; k < 8; k++) { const a = k * TAU / 8; g.moveTo(Math.cos(a) * r * 1.1, Math.sin(a) * r * 1.1); g.lineTo(Math.cos(a) * r * 1.8, Math.sin(a) * r * 1.8); }
      g.stroke(); return true;
    }
    case 'gaxe': case 'saxe': {
      const gold = s.kind === 'gaxe', z = CS * (gold ? 0.16 : 0.15);
      g.rotate(t * 16 * (s.vx >= 0 ? 1 : -1));
      g.strokeStyle = OL; g.lineWidth = 3; g.beginPath(); g.moveTo(-z * 0.9, 0); g.lineTo(z * 0.6, 0); g.stroke();
      g.strokeStyle = '#9a6a3a'; g.lineWidth = 1.8; g.stroke();
      g.fillStyle = gold ? '#f2c43a' : '#dfe6f0'; g.strokeStyle = OL; g.lineWidth = 1.4;
      g.beginPath(); g.moveTo(z * 0.3, -z * 0.15); g.lineTo(z * 0.75, -z * 0.55); g.quadraticCurveTo(z * 1.15, 0, z * 0.75, z * 0.55); g.lineTo(z * 0.3, z * 0.15); g.closePath(); g.fill(); g.stroke();
      if (gold) { g.fillStyle = 'rgba(255,255,220,.75)'; g.beginPath(); g.arc(z * 0.7, -z * 0.2, z * 0.12, 0, TAU); g.fill(); }
      return true;
    }
    case 'mask': {
      g.rotate(t * 12); const z = CS * 0.1;
      g.fillStyle = '#d9a868'; g.strokeStyle = OL; g.lineWidth = 1.4; g.beginPath(); g.ellipse(0, 0, z, z * 1.2, 0, 0, TAU); g.fill(); g.stroke();
      g.strokeStyle = OL; g.lineWidth = 1.2; g.beginPath(); g.arc(-z * 0.4, -z * 0.2, z * 0.22, PI, 0); g.moveTo(z * 0.62, -z * 0.2); g.arc(z * 0.4, -z * 0.2, z * 0.22, PI, 0); g.moveTo(-z * 0.4, z * 0.45); g.quadraticCurveTo(0, z * 0.75, z * 0.4, z * 0.45); g.stroke();
      return true;
    }
    case 'flood': case 'dragon': {
      g.rotate(ang); const w = CS * (s.kind === 'dragon' ? 0.5 : 0.48), c1 = s.kind === 'dragon' ? 'rgba(60,190,160,.55)' : 'rgba(80,140,220,.55)', c2 = s.kind === 'dragon' ? 'rgba(220,255,240,.9)' : 'rgba(220,235,255,.9)';
      g.fillStyle = c1; g.beginPath(); g.ellipse(0, 0, CS * 0.2, w, 0, -PI / 2, PI / 2); g.ellipse(-CS * 0.08, 0, CS * 0.12, w * 0.85, 0, PI / 2, -PI / 2, true); g.fill();
      g.strokeStyle = c2; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, CS * 0.2, w, 0, -PI / 2, PI / 2); g.stroke();
      if (s.kind === 'dragon') { g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.2; g.beginPath(); for (let k = -2; k <= 2; k++) { g.moveTo(-CS * 0.1, k * w * 0.3); g.lineTo(CS * 0.12, k * w * 0.3 + Math.sin(t * 20 + k) * 3); } g.stroke(); }
      return true;
    }
    case 'waterorb': case 'pearl': {
      const r = CS * (s.kind === 'pearl' ? 0.1 : 0.09), gr = g.createRadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r * 1.7);
      if (s.kind === 'pearl') { gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.5, 'rgba(255,225,140,.95)'); gr.addColorStop(1, 'rgba(255,190,60,0)'); }
      else { gr.addColorStop(0, '#f0faff'); gr.addColorStop(0.5, 'rgba(90,170,240,.9)'); gr.addColorStop(1, 'rgba(40,110,200,0)'); }
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.7, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,.85)'; g.beginPath(); g.arc(-r * 0.35, -r * 0.35, r * 0.3, 0, TAU); g.fill();
      return true;
    }
    case 'bwave': {
      g.rotate(ang); const w = CS * 0.46;
      g.fillStyle = 'rgba(70,150,235,.55)'; g.beginPath(); g.ellipse(0, 0, CS * 0.17, w, 0, -PI / 2, PI / 2); g.ellipse(-CS * 0.06, 0, CS * 0.1, w * 0.85, 0, PI / 2, -PI / 2, true); g.fill();
      g.strokeStyle = 'rgba(220,240,255,.9)'; g.lineWidth = 2; g.beginPath(); g.ellipse(0, 0, CS * 0.17, w, 0, -PI / 2, PI / 2); g.stroke();
      g.fillStyle = 'rgba(255,170,200,.9)'; g.beginPath(); g.arc(CS * 0.12, -w * 0.5, CS * 0.035, 0, TAU); g.arc(CS * 0.14, w * 0.3, CS * 0.03, 0, TAU); g.fill();
      return true;
    }
    case 'arrow': case 'arrowP': {
      g.rotate(ang); const L = CS * (s.kind === 'arrowP' ? 0.36 : 0.3);
      g.strokeStyle = OL; g.lineWidth = 2.6; g.lineCap = 'round'; g.beginPath(); g.moveTo(-L, 0); g.lineTo(L * 0.4, 0); g.stroke();
      g.strokeStyle = '#d9c08a'; g.lineWidth = 1.4; g.stroke();
      g.fillStyle = '#c9ccd4'; g.beginPath(); g.moveTo(L * 0.62, 0); g.lineTo(L * 0.36, -CS * 0.035); g.lineTo(L * 0.36, CS * 0.035); g.closePath(); g.fill();
      g.fillStyle = '#d63b2e'; g.beginPath(); g.moveTo(-L, 0); g.lineTo(-L * 0.75, -CS * 0.04); g.lineTo(-L * 0.6, 0); g.lineTo(-L * 0.75, CS * 0.04); g.closePath(); g.fill();
      return true;
    }
    case 'rocket': {
      g.rotate(ang); const L = CS * 0.26;
      const fl = g.createLinearGradient(-L * 1.6, 0, -L * 0.6, 0); fl.addColorStop(0, 'rgba(255,90,30,0)'); fl.addColorStop(1, 'rgba(255,210,90,.95)');
      g.fillStyle = fl; g.beginPath(); g.moveTo(-L * 0.6, -CS * 0.035); g.lineTo(-L * (1.4 + Math.random() * 0.3), 0); g.lineTo(-L * 0.6, CS * 0.035); g.closePath(); g.fill();
      g.strokeStyle = OL; g.lineWidth = 2; g.beginPath(); g.moveTo(-L * 0.6, 0); g.lineTo(L * 0.5, 0); g.stroke();
      g.fillStyle = '#c23a2c'; g.strokeStyle = OL; g.lineWidth = 1.2; g.fillRect(-L * 0.1, -CS * 0.032, L * 0.5, CS * 0.064); g.strokeRect(-L * 0.1, -CS * 0.032, L * 0.5, CS * 0.064);
      g.fillStyle = '#c9ccd4'; g.beginPath(); g.moveTo(L * 0.72, 0); g.lineTo(L * 0.48, -CS * 0.03); g.lineTo(L * 0.48, CS * 0.03); g.closePath(); g.fill();
      if (Math.random() < R.dtv * 30 * QUALITY[R.q].pmul) part(s.x, s.y + 0.0, 0.02, -s.vx * 0.3, -s.vy * 0.3, 0.1, '#9a9690', 0.05, 0.5, { kind: 'smoke', g: -0.2, drag: 1.5, shrink: false });
      return true;
    }
    case 'sogo': { g.rotate(t * 16); g.fillStyle = '#c23a2c'; g.strokeStyle = OL; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, CS * 0.075, 0, TAU); g.fill(); g.stroke(); g.fillStyle = '#f4eedc'; g.beginPath(); g.arc(0, 0, CS * 0.05, 0, TAU); g.fill(); return true; }
    case 'sunfire': { const r = CS * 0.12; const gr = g.createRadialGradient(0, 0, 0, 0, 0, r * 1.8); gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(0.4, 'rgba(255,170,60,.9)'); gr.addColorStop(1, 'rgba(230,70,30,0)'); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r * 1.8, 0, TAU); g.fill(); if (Math.random() < R.dtv * 20) part(s.x, s.gy, s.h, rand(-0.3, 0.3), 0, 0.3, '#ffb347', 0.04, 0.35, { g: -0.5 }); return true; }
    case 'ball': { const r = CS * 0.085; g.fillStyle = '#2a2a30'; g.strokeStyle = OL; g.lineWidth = 1.4; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill(); g.stroke(); g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.arc(-r * 0.35, -r * 0.35, r * 0.3, 0, TAU); g.fill(); g.fillStyle = Math.random() < 0.5 ? '#ffd36a' : '#ff6a2a'; g.beginPath(); g.arc(r * 0.8, -r * 0.8, r * 0.3, 0, TAU); g.fill(); return true; }
  }
  return false;
}

const COIN_EL = typeof document !== 'undefined' ? document.getElementById('coins') : null;
