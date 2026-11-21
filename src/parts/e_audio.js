/* ================= sound: synthesized 장단, 태평소 가락, effects ================= */
const AU = { ctx: null, on: true, master: null, mus: null, fx: null, verb: null, noise: null, timer: 0, mode: 'off', want: 'off', step: 0, nextT: 0, stepDur: 0.17, beat: 0, last: {} };
try { AU.on = localStorage.getItem('talnori-sound') !== '0'; } catch (err) { /* ignore */ }
/* music and effects switch and turn down on their own; AU.on stays the one-tap master switch */
AU.cfg = { mus: true, fx: true, musV: 0.8, fxV: 0.8 };
try { const c = JSON.parse(localStorage.getItem('talnori-audio') || 'null'); if (c && typeof c === 'object') Object.assign(AU.cfg, c); } catch (err) { /* ignore */ }
function auInit() {
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume().catch(() => {}); return; }
  try {
    const c = AU.ctx = new AC();
    const comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4; comp.connect(c.destination);
    AU.master = c.createGain(); AU.master.gain.value = AU.on ? 0.85 : 0; AU.master.connect(comp);
    AU.mus = c.createGain(); AU.mus.connect(AU.master);
    AU.fx = c.createGain(); AU.fx.connect(AU.master);
    AU.verb = c.createConvolver(); AU.verb.buffer = impulse(c, 2.2, 2.8);
    const vg = c.createGain(); vg.gain.value = 0.22; AU.verb.connect(vg); vg.connect(AU.master);
    /* each bus feeds the hall through its own send, so muting music also mutes its echo */
    AU.musV = c.createGain(); AU.musV.connect(AU.verb); AU.fxV = c.createGain(); AU.fxV.connect(AU.verb);
    applyAudio(true);
    const len = c.sampleRate | 0, nb = c.createBuffer(1, len, c.sampleRate), d = nb.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    AU.noise = nb;
    AU.timer = setInterval(scheduler, 30);
    if (AU.want !== 'off') musicMode(AU.want, true);
  } catch (err) { AU.ctx = null; }
}
/* iPhone: the ringer switch silences web audio unless the page says it is a player, and sound only starts from a tap.
   so on the first touch anywhere: ask to be a player, start the context, and play one silent sample to open the door */
const SILENT_WAV = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
function auUnlock() {
  if (!AU.on) return;
  try { if (navigator.audioSession && navigator.audioSession.type !== 'playback') navigator.audioSession.type = 'playback'; } catch (err) { /* ignore */ }
  auInit();
  if (!AU.ctx) return;
  if (AU.ctx.state !== 'running') AU.ctx.resume().catch(() => {});
  if (AU.unlocked) return;
  AU.unlocked = true;
  try { const s = AU.ctx.createBufferSource(); s.buffer = AU.ctx.createBuffer(1, 1, 22050); s.connect(AU.ctx.destination); s.start(0); } catch (err) { /* ignore */ }
  /* older iPhones without that switch: a looping silent clip puts the page in player mode */
  if (!navigator.audioSession && /iP(hone|ad|od)/.test(navigator.userAgent)) {
    try { const a = new Audio(SILENT_WAV); a.loop = true; a.setAttribute('playsinline', ''); a.volume = 0.01; a.play().catch(() => {}); AU.keep = a; } catch (err) { /* ignore */ }
  }
}
if (typeof window !== 'undefined') for (const ev of ['pointerdown', 'touchend', 'keydown']) window.addEventListener(ev, auUnlock, { capture: true, passive: true });
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => { if (!document.hidden && AU.ctx && AU.on && AU.ctx.state !== 'running') AU.ctx.resume().catch(() => {}); });
function impulse(c, sec, decay) {
  const n = Math.floor(c.sampleRate * sec), b = c.createBuffer(2, n, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); }
  return b;
}
function vbus(dest) { return dest === AU.fx ? AU.fxV : AU.musV; }
function applyAudio(now) {
  if (!AU.ctx || !AU.master) return;
  const C = AU.cfg, t = AU.ctx.currentTime;
  const set = (g, v) => { if (now) g.gain.value = v; else g.gain.setTargetAtTime(v, t, 0.05); };
  set(AU.master, AU.on ? 0.85 : 0);
  set(AU.mus, C.mus ? 0.62 * C.musV : 0); set(AU.musV, C.mus ? C.musV : 0);
  set(AU.fx, C.fx ? 0.8 * C.fxV : 0); set(AU.fxV, C.fx ? C.fxV : 0);
}
function saveAudio() { try { localStorage.setItem('talnori-audio', JSON.stringify(AU.cfg)); } catch (err) { /* ignore */ } }
function setAudio(patch) { Object.assign(AU.cfg, patch); saveAudio(); if ((AU.cfg.mus || AU.cfg.fx) && !AU.on) setSound(true); else applyAudio(); }
function setSound(on) {
  AU.on = on;
  try { localStorage.setItem('talnori-sound', on ? '1' : '0'); } catch (err) { /* ignore */ }
  applyAudio();
  if (on) auInit();
}
function gEnv(t, a, peak, d, dest) {
  const g = AU.ctx.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, peak), t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  g.connect(dest); return g;
}
function tone(type, f0, f1, t, a, d, vol, dest, slide) {
  const o = AU.ctx.createOscillator(); o.type = type;
  o.frequency.setValueAtTime(f0, t); if (f1 && f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + (slide || d));
  const g = gEnv(t, a, vol, d, dest); o.connect(g); o.start(t); o.stop(t + a + d + 0.05);
  return o;
}
function hiss(t, dur, vol, type, freq, q, dest) {
  const s = AU.ctx.createBufferSource(); s.buffer = AU.noise;
  const f = AU.ctx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q || 1;
  const g = gEnv(t, 0.002, vol, dur, dest);
  s.connect(f); f.connect(g); s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.05);
}
/* instruments */
function iDeok(t, v = 1, dest = AU.mus) { hiss(t, 0.06, 0.32 * v, 'bandpass', 2700, 1.3, dest); tone('triangle', 820, 540, t, 0.002, 0.06, 0.18 * v, dest); }
function iKung(t, v = 1, dest = AU.mus) { tone('sine', 140, 70, t, 0.004, 0.3, 0.55 * v, dest, 0.18); hiss(t, 0.08, 0.1 * v, 'lowpass', 420, 0.7, dest); }
function iKkwaeng(t, v = 1, damp = false, dest = AU.mus) {
  const d = damp ? 0.045 : 0.15, hp = AU.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 900;
  const g = gEnv(t, 0.002, 0.11 * v, d, dest); hp.connect(g);
  for (const f of [1310, 1847, 2652, 3467]) { const o = AU.ctx.createOscillator(); o.type = 'square'; o.frequency.value = f * (1 + (Math.random() - 0.5) * 0.004); o.connect(hp); o.start(t); o.stop(t + d + 0.05); }
  hiss(t, 0.02, 0.06 * v, 'highpass', 4000, 0.7, dest);
}
function iJing(t, v = 1, pitch = 1, dest = AU.mus) {
  const g = AU.ctx.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3 * v, t + 0.04); g.gain.exponentialRampToValueAtTime(0.0001, t + 3.4);
  const lp = AU.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1400; lp.connect(g); g.connect(dest); g.connect(vbus(dest));
  [[1, 1], [2.006, 0.45], [3.01, 0.25], [4.07, 0.12]].forEach(([m, a]) => { const o = AU.ctx.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(108 * pitch * m * 1.01, t); o.frequency.exponentialRampToValueAtTime(108 * pitch * m, t + 0.6); const og = AU.ctx.createGain(); og.gain.value = a; o.connect(og); og.connect(lp); o.start(t); o.stop(t + 3.5); });
}
function iBuk(t, v = 1, dest = AU.mus) { tone('sine', 105, 48, t, 0.003, 0.36, 0.6 * v, dest, 0.25); hiss(t, 0.1, 0.16 * v, 'lowpass', 380, 0.8, dest); }
function iReed(midi, t, dur, v = 1, slideFrom = 0, dest = AU.mus) {
  const c = AU.ctx, f = 440 * Math.pow(2, (midi - 69) / 12);
  const bp = c.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1500; bp.Q.value = 0.8;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 4200;
  const g = c.createGain(), vol = 0.075 * v, end = t + dur;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.03); g.gain.setValueAtTime(vol, Math.max(t + 0.03, end - 0.06)); g.gain.exponentialRampToValueAtTime(0.0001, end + 0.04);
  bp.connect(lp); lp.connect(g); g.connect(dest);
  const send = c.createGain(); send.gain.value = 0.35; g.connect(send); send.connect(vbus(dest));
  const lfo = c.createOscillator(), lg = c.createGain(); lfo.frequency.value = 5.6; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * 0.013, t + Math.min(0.25, dur)); lfo.connect(lg);
  for (const [type, m, a] of [['sawtooth', 1, 0.8], ['square', 1.003, 0.35]]) {
    const o = c.createOscillator(); o.type = type;
    if (slideFrom) { o.frequency.setValueAtTime(f * slideFrom * m, t); o.frequency.exponentialRampToValueAtTime(f * m, t + 0.07); } else o.frequency.setValueAtTime(f * m, t);
    lg.connect(o.frequency);
    const og = c.createGain(); og.gain.value = a; o.connect(og); og.connect(bp); o.start(t); o.stop(end + 0.08);
  }
  lfo.start(t); lfo.stop(end + 0.08);
}
/* soft instruments for the background songs: 가야금 pluck, 대금 flute, 해금 bow, bass and a shaker */
const mfreq = m => 440 * Math.pow(2, (m - 69) / 12);
function vib(t, f, rate, depth, delay) {
  const c = AU.ctx, lfo = c.createOscillator(), lg = c.createGain();
  lfo.frequency.value = rate; lg.gain.setValueAtTime(0, t); lg.gain.linearRampToValueAtTime(f * depth, t + delay); lfo.connect(lg);
  return { lfo, lg };
}
function iPluck(midi, t, dur, v = 1, dest = AU.mus) {
  const c = AU.ctx, f = mfreq(midi), end = t + Math.max(0.3, dur) + 0.5;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.1;
  lp.frequency.setValueAtTime(Math.min(8000, f * 8), t); lp.frequency.exponentialRampToValueAtTime(Math.max(380, f * 1.5), t + 0.4);
  const g = c.createGain(), vol = 0.15 * v;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(vol * 0.3, t + 0.22); g.gain.exponentialRampToValueAtTime(0.0001, end);
  lp.connect(g); g.connect(dest);
  const send = c.createGain(); send.gain.value = 0.28; g.connect(send); send.connect(vbus(dest));
  const V = vib(t, f, 5.4, 0.011, Math.min(0.45, dur * 0.8));
  for (const [type, m, a] of [['triangle', 1, 0.9], ['sine', 2, 0.3], ['sawtooth', 1, 0.1]]) {
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f * m * 1.006, t); o.frequency.exponentialRampToValueAtTime(f * m, t + 0.04);
    V.lg.connect(o.frequency); const og = c.createGain(); og.gain.value = a; o.connect(og); og.connect(lp); o.start(t); o.stop(end + 0.05);
  }
  V.lfo.start(t); V.lfo.stop(end + 0.05);
}
function iFlute(midi, t, dur, v = 1, dest = AU.mus) {
  const c = AU.ctx, f = mfreq(midi), end = t + dur, vol = 0.1 * v;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.08); g.gain.setValueAtTime(vol, Math.max(t + 0.08, end - 0.1)); g.gain.exponentialRampToValueAtTime(0.0001, end + 0.15);
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = Math.min(5000, f * 3.5);
  lp.connect(g); g.connect(dest); const send = c.createGain(); send.gain.value = 0.45; g.connect(send); send.connect(vbus(dest));
  const V = vib(t, f, 5, 0.009, Math.min(0.3, dur * 0.6));
  for (const [type, m, a] of [['sine', 1, 1], ['triangle', 2, 0.07]]) {
    const o = c.createOscillator(); o.type = type; o.frequency.setValueAtTime(f * m * 0.985, t); o.frequency.exponentialRampToValueAtTime(f * m, t + 0.06);
    V.lg.connect(o.frequency); const og = c.createGain(); og.gain.value = a; o.connect(og); og.connect(lp); o.start(t); o.stop(end + 0.2);
  }
  V.lfo.start(t); V.lfo.stop(end + 0.2);
  hiss(t, Math.min(0.25, dur), 0.01 * v, 'bandpass', f * 2, 3, dest);
}
function iBow(midi, t, dur, v = 1, slide = 0, dest = AU.mus) {
  const c = AU.ctx, f = mfreq(midi), end = t + dur, vol = 0.055 * v;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.07); g.gain.setValueAtTime(vol, Math.max(t + 0.07, end - 0.08)); g.gain.exponentialRampToValueAtTime(0.0001, end + 0.1);
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 2.5; lp.frequency.setValueAtTime(900, t); lp.frequency.linearRampToValueAtTime(1900, t + 0.2);
  lp.connect(g); g.connect(dest); const send = c.createGain(); send.gain.value = 0.35; g.connect(send); send.connect(vbus(dest));
  const V = vib(t, f, 6.2, 0.016, Math.min(0.25, dur * 0.5));
  for (const dt of [1, 1.005]) {
    const o = c.createOscillator(); o.type = 'sawtooth';
    if (slide) { o.frequency.setValueAtTime(f * dt * slide, t); o.frequency.exponentialRampToValueAtTime(f * dt, t + 0.1); } else o.frequency.setValueAtTime(f * dt, t);
    V.lg.connect(o.frequency); const og = c.createGain(); og.gain.value = 0.5; o.connect(og); og.connect(lp); o.start(t); o.stop(end + 0.15);
  }
  V.lfo.start(t); V.lfo.stop(end + 0.15);
}
function iBass(midi, t, dur, v = 1, dest = AU.mus) {
  const c = AU.ctx, f = mfreq(midi), end = t + dur, vol = 0.24 * v;
  const lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1100, t); lp.frequency.exponentialRampToValueAtTime(280, t + 0.22);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(vol * 0.55, t + 0.16); g.gain.setValueAtTime(vol * 0.55, Math.max(t + 0.16, end - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, end + 0.08);
  lp.connect(g); g.connect(dest);
  for (const [type, m, a] of [['sine', 1, 1], ['triangle', 1, 0.55], ['triangle', 2, 0.18]]) { const o = c.createOscillator(); o.type = type; o.frequency.value = f * m; const og = c.createGain(); og.gain.value = a; o.connect(og); og.connect(lp); o.start(t); o.stop(end + 0.12); }
}
function iShk(t, v = 1) { hiss(t, 0.035, 0.03 * v, 'highpass', 7200, 0.7, AU.mus); }
/* 자진모리 장단 for the drums: 덩 . 덕 쿵 . 덕 . 쿵 덕 쿵 . . */
const JANGGU = ['D', '', 'd', 'k', '', 'd', '', 'k', 'd', 'k', '', ''];
/* two songs, eight bars of four beats each. [음, 박] */
const SONGS = {
  /* 평조 hook in C. the first two bars come back with a lift, then a falling answer */
  main: {
    mel: [[79, 1], [76, 2 / 3], [79, 1 / 3], [81, 1], [79, 1], [76, 2 / 3], [74, 1 / 3], [72, 1], [74, 2],
      [79, 1], [76, 2 / 3], [79, 1 / 3], [81, 1], [84, 1], [81, 2 / 3], [79, 1 / 3], [76, 1], [79, 2],
      [84, 5 / 3], [81, 1 / 3], [79, 1], [76, 1], [79, 2 / 3], [81, 1 / 3], [79, 1], [76, 1], [74, 1],
      [72, 1], [74, 2 / 3], [76, 1 / 3], [79, 1], [76, 1], [74, 1], [72, 3]],
    bass: [48, 43, 45, 48, 45, 43, 48, 43], chord: ['M', 'M', 'm', 'M', 'm', 'M', 'M', 'M'],
  },
  /* 계면조 in A for bosses: darker, longer notes over a driving bass */
  boss: {
    mel: [[76, 2], [79, 2 / 3], [76, 1 / 3], [74, 1], [72, 1], [74, 1], [69, 2],
      [76, 2], [81, 2 / 3], [79, 1 / 3], [76, 1], [79, 1], [81, 1], [76, 2],
      [84, 1.5], [81, 0.5], [79, 1], [81, 1], [79, 2 / 3], [76, 1 / 3], [74, 1], [76, 2],
      [72, 2 / 3], [74, 1 / 3], [76, 1], [79, 1], [76, 1], [74, 1], [72, 1], [69, 2]],
    bass: [45, 41, 45, 43, 41, 43, 45, 40], chord: ['m', 'M', 'm', 'M', 'M', 'M', 'm', 'M'],
  },
};
for (const k in SONGS) { const S = SONGS[k], out = []; let bt = 0; for (const [m, d] of S.mel) { if (m) out.push([Math.round(bt * 1000) / 1000, m, d]); bt += d; } S.notes = out; S.len = Math.round(bt); }
const MODES = {
  title: { step: 0.2, song: 'main', lead: 'flute', drums: 0, bassV: 0.55, arp: 1, jing: 4 },
  play: { step: 0.17, song: 'main', lead: 'alt', drums: 1, bassV: 1, arp: 0.8, jing: 8, shk: 1 },
  danger: { step: 0.16, song: 'main', lead: 'alt', drums: 1.2, bassV: 1.1, arp: 0.8, jing: 8, shk: 1.4, buk: true },
  boss: { step: 0.15, song: 'boss', lead: 'bow', drums: 1.25, bassV: 1.15, arp: 0, jing: 4, shk: 1, buk: true, kkw: true, drive: true },
};
function musicMode(m, force) {
  AU.want = m;
  if (!AU.ctx || (!force && AU.mode === m)) return;
  const prev = AU.mode; AU.mode = m;
  if (m === 'off') return;
  AU.stepDur = MODES[m].step;
  /* a new song starts from its first bar. danger and play share a song so they keep the place */
  const same = prev !== 'off' && MODES[prev] && MODES[prev].song === MODES[m].song;
  if (force || AU.nextT < AU.ctx.currentTime) { AU.nextT = AU.ctx.currentTime + 0.08; AU.step = 0; }
  else AU.step = same ? Math.ceil(AU.step / 12) * 12 : 0;
}
function scheduler() {
  const c = AU.ctx; if (!c || AU.mode === 'off' || c.state !== 'running') return;
  if (AU.nextT < c.currentTime - 0.3) AU.nextT = c.currentTime + 0.05;
  const ahead = c.currentTime + 0.16;
  while (AU.nextT < ahead) { playStep(AU.step, AU.nextT); AU.nextT += AU.stepDur; AU.step++; }
}
const BASS_SWING = { 0: [0, 2.6, 1], 4: [0, 0.9, 0.7], 6: [7, 2.6, 0.85], 9: [0, 1.6, 0.8], 11: [12, 0.8, 0.6] };
const BASS_DRIVE = [0, -1, 0, 12, -1, 0, 0, -1, 7, 12, -1, 7];
function playStep(step, t) {
  const M = MODES[AU.mode]; if (!M) return;
  const S = SONGS[M.song], s = step % 12, bar = Math.floor(step / 12), bi = bar % 8, pass = Math.floor(bar / 8), sd = AU.stepDur;
  if (M.drums) {
    const d = M.drums, j = JANGGU[s];
    if (j === 'D') { iKung(t, 0.48 * d); iDeok(t, 0.42 * d); } else if (j === 'd') iDeok(t, 0.3 * d); else if (j === 'k') iKung(t, 0.4 * d);
    if (M.shk && s % 3 === 2) iShk(t, M.shk * (s === 11 ? 1.2 : 0.8));
    if (M.buk) { if (s % 3 === 0 && (M.drive || s % 6 === 0)) iBuk(t, s === 0 ? 0.55 : 0.34); }
    else if (s === 0 && bi % 2 === 0) iBuk(t, 0.38);
    if (M.kkw && (s === 0 || s === 6)) iKkwaeng(t, s === 0 ? 0.42 : 0.26, true);
    if (bi === 7 && s >= 6 && s % 2 === 0) iDeok(t, 0.26 * d);
  }
  if (s === 0 && bar % M.jing === 0) iJing(t, 0.42);
  const root = S.bass[bi];
  if (M.drive) { const o = BASS_DRIVE[s]; if (o >= 0) iBass(root + o, t, sd * 1.5, (s === 0 ? 1 : 0.72) * M.bassV); }
  else { const P = BASS_SWING[s]; if (P) iBass(root + P[0], t, sd * P[1], P[2] * M.bassV); }
  if (s % 3 === 0) {
    const beatDur = sd * 3, b = (step / 3) % S.len, bb = s / 3;
    const lead = M.lead === 'alt' ? (pass % 2 ? 'flute' : 'pluck') : M.lead;
    for (const [st, m, d] of S.notes) {
      if (st < b - 1e-6 || st >= b + 1 - 1e-6) continue;
      const tt = t + (st - b) * beatDur, dd = d * beatDur;
      if (lead === 'pluck') iPluck(m, tt, dd, 1);
      else if (lead === 'flute') iFlute(m, tt, dd * 0.96, 1);
      else iBow(m - 12, tt, dd * 0.97, 1, d >= 1 ? 0.95 : 0);
    }
    /* soft chord plucks on beats two and four while the flute sings */
    if (M.arp && lead !== 'pluck' && (bb === 1 || bb === 3)) {
      const third = S.chord[bi] === 'm' ? 3 : 4;
      iPluck(root + 12 + third, t, beatDur, 0.38 * M.arp); iPluck(root + 12 + 7, t + beatDur / 3, beatDur, 0.32 * M.arp);
    }
  }
}
/* sound effects */
const SFX_GAP = { kill: 0.06, coin: 0.09, chain: 0.08, kkwaeng: 0.09, thump: 0.08, tap: 0.08, beat: 0.1, beatBig: 0.1, whip: 0.08, slash: 0.08, gust: 0.1, beam: 0.1, fire: 0.12, blow: 0.15, bite: 0.1, gong: 0.15, whoosh: 0.12, wave: 0.12, slam: 0.12, stone: 0.07, thunder: 0.12, arrow: 0.07, arrows: 0.12, rocket: 0.12, cannon: 0.12, boom: 0.09, quake: 0.15, revive: 0.12, burrow: 0.2, gulp: 0.2, tick: 0.035, flip: 0.05 };
function sfx(name, arg) {
  const c = AU.ctx; if (!c || !AU.on || c.state !== 'running') return;
  const now = c.currentTime, gap = SFX_GAP[name] || 0;
  if (gap && AU.last[name] && now - AU.last[name] < gap) return;
  AU.last[name] = now;
  const t = now + 0.005, D = AU.fx;
  switch (name) {
    case 'click': hiss(t, 0.02, 0.15, 'bandpass', 2400, 2, D); break;
    case 'summon': iKkwaeng(t, 0.6, true, D); tone('sine', 620, 980 + (arg || 0) * 180, t, 0.005, 0.12, 0.12, D, 0.1); if (arg >= 2) tone('sine', 1320, 1760, t + 0.08, 0.005, 0.2, 0.1, D); break;
    case 'merge': iKung(t, 0.7, D); iDeok(t, 0.7, D); tone('sine', 1046, 1046, t + 0.05, 0.005, 0.18, 0.1, D); tone('sine', 1318, 1318, t + 0.1, 0.005, 0.22, 0.1, D); break;
    case 'craft': iJing(t, 0.9, 1, D); for (let i = 0; i < 8; i++) iKkwaeng(t + i * 0.06, 0.6 + i * 0.05, i < 7, D); iReed(79, t + 0.5, 0.18, 1.1, 0, D); iReed(81, t + 0.68, 0.18, 1.1, 0, D); iReed(84, t + 0.86, 0.5, 1.2, 0.89, D); break;
    case 'gut': iBuk(t, 0.7, D); [72, 76, 79, 84].forEach((m, i) => tone('sine', 440 * Math.pow(2, (m - 69) / 12), 0, t + i * 0.07, 0.005, 0.25, 0.1, D)); break;
    case 'gutfail': tone('triangle', 420, 140, t, 0.01, 0.5, 0.14, D, 0.45); break;
    case 'sell': hiss(t, 0.04, 0.2, 'bandpass', 900, 3, D); tone('sine', 1500, 1500, t + 0.02, 0.003, 0.08, 0.06, D); break;
    case 'upgrade': [76, 79, 84].forEach((m, i) => tone('triangle', 440 * Math.pow(2, (m - 69) / 12), 0, t + i * 0.05, 0.005, 0.16, 0.08, D)); break;
    case 'boss': iJing(t, 1, 0.8, D); iJing(t + 0.5, 1, 0.8, D); for (let i = 0; i < 6; i++) iBuk(t + i * 0.09, 0.4 + i * 0.08, D); break;
    case 'bosskill': for (let i = 0; i < 10; i++) iKkwaeng(t + i * 0.05, 0.7, i < 9, D); iJing(t + 0.1, 1, 1, D); iBuk(t, 0.9, D); break;
    case 'coin': tone('sine', 1760, 2100, t, 0.003, 0.08, 0.05, D); break;
    case 'slam': iBuk(t, 0.9, D); hiss(t, 0.18, 0.12, 'lowpass', 600, 0.7, D); break;
    case 'howl': hiss(t, 0.9, 0.12, 'bandpass', 700, 0.6, D); tone('sawtooth', 160, 70, t, 0.1, 0.8, 0.06, D, 0.8); break;
    case 'command': iBuk(t, 0.8, D); iKkwaeng(t + 0.04, 0.8, false, D); break;
    case 'beat': iKung(t, 0.35, D); break;
    case 'beatBig': iBuk(t, 0.5, D); iKkwaeng(t, 0.5, false, D); break;
    case 'kill': tone('sine', 360, 140, t, 0.002, 0.06, 0.035, D); break;
    case 'chain': hiss(t, 0.08, 0.06, 'highpass', 3000, 0.8, D); break;
    case 'kkwaeng': iKkwaeng(t, 0.35, true, D); break;
    case 'thump': iBuk(t, 0.3, D); break;
    case 'gong': iJing(t, 0.4, 1.2, D); break;
    case 'tap': iDeok(t, 0.4, D); break;
    case 'whip': hiss(t, 0.05, 0.12, 'highpass', 2500, 1, D); break;
    case 'slash': hiss(t, 0.06, 0.1, 'bandpass', 3200, 1.2, D); break;
    case 'curse': for (let i = 0; i < 4; i++) tone('triangle', 2300 + i * 170, 2100, t + i * 0.035, 0.002, 0.09, 0.03, D); tone('sine', 230, 170, t, 0.01, 0.32, 0.05, D); break;
    case 'gust': hiss(t, 0.12, 0.05, 'bandpass', 900, 0.7, D); break;
    case 'beam': tone('sine', 900, 1400, t, 0.01, 0.2, 0.04, D, 0.2); break;
    case 'fire': hiss(t, 0.3, 0.08, 'lowpass', 900, 0.6, D); break;
    case 'blow': iReed(84, t, 0.18, 0.8, 0.89, D); break;
    case 'bite': tone('square', 200, 90, t, 0.003, 0.08, 0.05, D); break;
    case 'whoosh': hiss(t, 0.18, 0.06, 'bandpass', 1300, 0.8, D); break;
    case 'wave': hiss(t, 0.25, 0.06, 'bandpass', 700, 0.8, D); break;
    case 'blink': tone('sine', 500, 1600, t, 0.01, 0.2, 0.06, D, 0.2); break;
    case 'chal': iJing(t, 0.8, 1.35, D); iBuk(t + 0.1, 0.6, D); iBuk(t + 0.28, 0.6, D); break;
    case 'chalWin': for (let i = 0; i < 6; i++) iKkwaeng(t + i * 0.05, 0.65, i < 5, D); [79, 84, 88].forEach((m, i) => tone('sine', 440 * Math.pow(2, (m - 69) / 12), 0, t + 0.3 + i * 0.07, 0.005, 0.25, 0.09, D)); break;
    case 'stone': iBuk(t, 0.35, D); hiss(t, 0.08, 0.08, 'bandpass', 500, 1, D); break;
    case 'thunder': hiss(t, 0.35, 0.16, 'lowpass', 1800, 0.5, D); tone('sawtooth', 90, 40, t, 0.003, 0.3, 0.07, D, 0.3); break;
    case 'arrow': hiss(t, 0.06, 0.06, 'highpass', 3600, 1, D); break;
    case 'arrows': for (let i = 0; i < 4; i++) hiss(t + i * 0.025, 0.07, 0.06, 'highpass', 3200 + i * 300, 1, D); break;
    case 'rocket': hiss(t, 0.4, 0.09, 'bandpass', 1500, 0.6, D); for (let i = 0; i < 5; i++) hiss(t + 0.05 + i * 0.05, 0.03, 0.08, 'highpass', 2500, 1, D); break;
    case 'cannon': tone('sine', 90, 35, t, 0.002, 0.4, 0.5, D, 0.3); hiss(t, 0.25, 0.18, 'lowpass', 700, 0.6, D); break;
    case 'boom': tone('sine', 70, 30, t, 0.003, 0.5, 0.45, D, 0.4); hiss(t, 0.35, 0.16, 'lowpass', 900, 0.5, D); break;
    case 'quake': tone('sine', 55, 28, t, 0.01, 0.8, 0.55, D, 0.7); hiss(t, 0.6, 0.14, 'lowpass', 400, 0.5, D); iBuk(t, 0.8, D); break;
    case 'revive': tone('sine', 300, 900, t, 0.01, 0.25, 0.06, D, 0.2); hiss(t, 0.2, 0.06, 'bandpass', 1200, 2, D); break;
    case 'burrow': hiss(t, 0.4, 0.12, 'lowpass', 500, 0.6, D); break;
    case 'gulp': tone('sine', 220, 70, t, 0.01, 0.3, 0.2, D, 0.3); tone('sine', 180, 60, t + 0.18, 0.01, 0.3, 0.2, D, 0.3); break;
    case 'cloud': hiss(t, 0.9, 0.1, 'bandpass', 500, 0.5, D); hiss(t + 0.2, 0.7, 0.08, 'highpass', 4000, 0.7, D); break;
    case 'judge': iJing(t, 0.9, 0.7, D); iBuk(t, 0.9, D); break;
    case 'pouchShake': for (let i = 0; i < 3; i++) hiss(t + i * 0.09, 0.05, 0.08, 'bandpass', 2400 + i * 200, 2, D); tone('sine', 1800, 2000, t, 0.003, 0.05, 0.03, D); break;
    case 'pouchOpen': iJing(t, 0.7, 1.4, D); for (let i = 0; i < 6; i++) iKkwaeng(t + i * 0.05, 0.5, i < 5, D); [72, 76, 79, 84, 88].forEach((m, i) => tone('sine', 440 * Math.pow(2, (m - 69) / 12), 0, t + 0.15 + i * 0.05, 0.005, 0.3, 0.08, D)); break;
    case 'flip': { const tr = arg || 0; hiss(t, 0.04, 0.1, 'bandpass', 2000, 1.5, D); tone('sine', 660 + tr * 160, 990 + tr * 220, t, 0.004, 0.14, 0.07 + tr * 0.02, D, 0.1); if (tr >= 2) [79, 84, 88].forEach((m, i) => tone('sine', 440 * Math.pow(2, (m - 69) / 12), 0, t + 0.08 + i * 0.06, 0.005, 0.3, 0.08, D)); if (tr >= 3) { iJing(t + 0.05, 0.6, 1.2, D); for (let i = 0; i < 6; i++) iKkwaeng(t + 0.1 + i * 0.05, 0.45, i < 5, D); } break; }
    case 'stamp': iBuk(t, 0.7, D); iDeok(t, 0.6, D); tone('sine', 1046, 1046, t + 0.08, 0.005, 0.2, 0.08, D); break;
    case 'tick': tone('sine', 2100, 2300, t, 0.002, 0.03, 0.025, D); break;
    case 'buy': hiss(t, 0.04, 0.15, 'bandpass', 1200, 3, D); [84, 88].forEach((m, i) => tone('sine', 440 * Math.pow(2, (m - 69) / 12), 0, t + i * 0.06, 0.004, 0.12, 0.07, D)); break;
    case 'ult': iJing(t, 1, 1.1, D); for (let i = 0; i < 6; i++) iBuk(t + i * 0.07, 0.5 + i * 0.07, D); iReed(84, t + 0.25, 0.3, 1.2, 0.89, D); break;
    case 'lose': iReed(79, t, 0.5, 1, 0, D); iReed(76, t + 0.5, 0.5, 1, 0, D); iReed(72, t + 1.0, 1.2, 1, 1.12, D); iJing(t + 1.0, 0.8, 0.8, D); break;
    case 'win': for (let i = 0; i < 12; i++) iKkwaeng(t + i * 0.05, 0.7, i < 11, D); iJing(t, 1, 1, D); iReed(84, t + 0.7, 0.25, 1.2, 0, D); iReed(86, t + 0.95, 0.25, 1.2, 0, D); iReed(88, t + 1.2, 0.8, 1.2, 0.89, D); break;
  }
}

