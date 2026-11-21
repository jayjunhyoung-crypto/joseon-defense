/* ================= 친구랑 같이: two yards side by side, one boss health pool =================
   each player runs their own yard. what travels is a small absolute snapshot (presence), a few times a second:
   the partner's yard for the mini view, their damage to the current boss, coins they sent, the host's clock.
   transport, first that works: the claude.ai room (inside claude.ai), a direct browser to browser link through PeerJS
   (the standalone build, no accounts), or a BroadcastChannel between tabs of this browser (testing) */
el.coopOv = $('coopOv'); el.coopCard = $('coopCard'); el.coopBox = $('coopBox'); el.coopCv = $('coopCv'); el.coopGift = $('coopGift');
const NET = { link: null, kind: '', code: '', role: '', peers: new Map(), srv: '', err: '' };
const CO = { hitSeq: 0, hitIn: 0, hitAck: 0, hitLog: [], hitsQ: [], pAt: 0, nick: '', partner: null, rd: '', giftSent: 0, giftGot: 0, lost: false, ph: 'lobby', sendT: 0, big: false, left: false, imgs: new Map() };
try { CO.nick = localStorage.getItem('talnori-nick') || ''; } catch (err) { /* ignore */ }
const COOP_GIFT = 200;

function coopCode() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let s = ''; for (let i = 0; i < 4; i++) s += A[Math.floor(Math.random() * A.length)]; return s; }
const pname = () => (CO.partner && CO.partner.nm) || '친구';

async function netOpen(code) {
  netClose();
  NET.code = code; NET.peers.clear();
  try {
    const room = window.claude && typeof window.claude.use === 'function' ? await window.claude.use('room') : null;
    if (room) {
      const r = await room.join('coop-' + code.toLowerCase());
      NET.link = { send: obj => { r.presence(obj).catch(() => {}); }, close: () => { r.leave().catch(() => {}); } };
      NET.kind = 'room';
      r.onPeers(ch => {
        NET.peers.clear();
        for (const p of ch.peers) if (!p.sameTab && p.kind === 'viewer') NET.peers.set(p.peer, { presence: p.presence || {}, at: p.updatedAt || Date.now() });
        onNet();
      }, e => coopNote(`연결이 끊겼어요 (${e.code})`));
      return true;
    }
  } catch (err) { /* fall through */ }
  /* the no-login page: the internet link or nothing. falling back to same-browser tabs there only hides the failure */
  if (typeof window.Peer === 'function') return peerOpen(code);
  try {
    const id = Math.random().toString(36).slice(2), bc = new BroadcastChannel('talnori-coop-' + code);
    bc.onmessage = ev => { const m = ev.data; if (!m || m.id === id) return; if (m.bye) NET.peers.delete(m.id); else NET.peers.set(m.id, { presence: m.p || {}, at: Date.now() }); onNet(); };
    NET.link = { send: obj => bc.postMessage({ id, p: obj }), close: () => { try { bc.postMessage({ id, bye: 1 }); bc.close(); } catch (err) { /* ignore */ } } };
    NET.kind = 'local';
    return true;
  } catch (err) { NET.link = null; NET.kind = ''; return false; }
}
/* outside claude.ai: the two browsers meet on a public PeerJS signalling server and then talk directly (WebRTC).
   the host claims an id made from the room code; the guest dials it. resolves true, 'taken' (code in use) or false.
   phones drop the server link whenever the game goes to the background (sending the code by chat does that),
   so both sides keep reconnecting, and the guest keeps looking for the host for a minute instead of giving up at once */
const HUNT_MS = (window.PEER_OPTS && window.PEER_OPTS.hunt) || 60000;
function peerOpen(code) {
  return new Promise(resolve => {
    const opts = Object.assign({ debug: 0 }, window.PEER_OPTS || {}), host = NET.role === 'host', hostId = 'joseon-defense-' + code.toLowerCase(), conns = new Map();
    let done = false, closed = false, peer = null, huntT0 = 0, dialN = 0, expired = false, iceBad = false, dog = 0;
    const finish = v => { if (!done) { done = true; resolve(v); } };
    const setSrv = st => { if (NET.srv !== st) { NET.srv = st; if (!el.coopOv.hidden) renderCoop(); } };
    const stop = () => { closed = true; clearInterval(dog); document.removeEventListener('visibilitychange', onVis); try { if (peer) peer.destroy(); } catch (err) { /* ignore */ } };
    const lost = () => coopNote(iceBad && !expired ? '방은 찾았는데 연결이 막혔어요. 와이파이를 끄고 데이터로 해 보거나 다른 와이파이로 바꿔 주세요'
      : '그 코드의 방을 찾지 못했어요. 방장 게임 화면이 켜져 있는지, 둘 다 같은 링크로 들어왔는지 확인해 주세요');
    const wire = c => {
      c.on('open', () => {
        if (closed) { try { c.close(); } catch (err) { /* ignore */ } return; }
        /* the newest link wins: a friend who dialled again after a hiccup replaces the stale one */
        for (const [k, o] of conns) if (o !== c) { conns.delete(k); NET.peers.delete(k); try { o.close(); } catch (err) { /* ignore */ } }
        conns.set(c.peer, c); NET.peers.set(c.peer, { presence: {}, at: Date.now() }); huntT0 = 0; expired = false; iceBad = false;
        if (CO.note && CO.note !== '시작해요!') CO.note = '';
        if (CO.lastSnap) c.send(CO.lastSnap); onNet();
      });
      c.on('data', d => { if (d && typeof d === 'object' && conns.get(c.peer) === c) { NET.peers.set(c.peer, { presence: d, at: Date.now() }); onNet(); } });
      c.on('close', () => {
        if (conns.get(c.peer) !== c) return;
        conns.delete(c.peer); NET.peers.delete(c.peer); onNet();
        if (!host && !closed) { huntT0 = Date.now(); setTimeout(dial, 1500); }
      });
      c.on('error', e => { if (e && /negotiation|ice|webrtc/i.test(String(e.type || ''))) iceBad = true; });
    };
    const dial = () => {
      if (closed || host || conns.size || !peer || peer.destroyed || peer.disconnected) return;
      const n = ++dialN, c = peer.connect(hostId, { reliable: true, serialization: 'json' });
      wire(c);
      /* an offer sent while the host's phone was asleep goes nowhere: try again */
      setTimeout(() => {
        if (n !== dialN || closed || conns.size || c.open) return;
        try { c.close(); } catch (err) { /* ignore */ }
        if (Date.now() - huntT0 < HUNT_MS) dial(); else lost();
      }, 9000);
    };
    const make = () => {
      const me = host ? new Peer(hostId, opts) : new Peer(opts);
      peer = me;
      me.on('open', () => {
        if (me !== peer || closed) return;
        setSrv('ok');
        if (!done) { NET.link = { send: obj => { CO.lastSnap = obj; for (const c of conns.values()) if (c.open) c.send(obj); }, close: stop }; NET.kind = 'p2p'; finish(true); }
        if (!host && !conns.size) { if (!huntT0) huntT0 = Date.now(); dial(); }
      });
      if (host) me.on('connection', c => { if (me === peer && !closed) wire(c); });
      me.on('error', e => {
        const t = e && e.type;
        if (!done) {
          NET.err = t === 'browser-incompatible' ? '이 브라우저는 같이 하기가 안 돼요. 크롬이나 사파리로 열어 주세요' : '연결 서버에 닿지 못했어요. 와이파이를 바꾸거나 데이터로 다시 해 주세요';
          finish(t === 'unavailable-id' ? 'taken' : false); stop(); return;
        }
        if (me !== peer || closed) return;
        if (t === 'peer-unavailable') {
          if (host || conns.size) return;
          expired = true;
          if (Date.now() - huntT0 < HUNT_MS) { coopNote('방장을 찾는 중이에요. 방장 게임 화면이 켜져 있어야 해요'); dialN++; setTimeout(dial, 2500); } else lost();
        } else if (t !== 'webrtc' && t !== 'negotiation-failed') setSrv('re');
        else iceBad = true;
      });
      me.on('disconnected', () => { if (me === peer && !closed) { setSrv('re'); setTimeout(revive, 700); } });
    };
    /* every few seconds, and whenever the page comes back to the front: get back on the server */
    const revive = () => {
      if (closed || !done) return;
      try {
        if (!peer || peer.destroyed) make();
        else if (peer.disconnected) peer.reconnect();
      } catch (err) { /* next tick */ }
    };
    const onVis = () => {
      if (document.visibilityState !== 'visible' || closed || !done) return;
      revive();
      if (!host && !conns.size) { huntT0 = Date.now(); expired = false; dial(); }
    };
    dog = setInterval(revive, 4000);
    document.addEventListener('visibilitychange', onVis);
    try { make(); } catch (err) { NET.err = '이 브라우저는 같이 하기가 안 돼요. 크롬이나 사파리로 열어 주세요'; finish(false); stop(); return; }
    setTimeout(() => { if (!done) { NET.err = '연결 서버에 닿지 못했어요. 와이파이를 바꾸거나 데이터로 다시 해 주세요'; finish(false); stop(); } }, 12000);
  });
}
function netClose() { if (NET.link) NET.link.close(); NET.link = null; NET.kind = ''; NET.srv = ''; NET.peers.clear(); CO.partner = null; }

/* the snapshot this player shows the other */
function coopSnap() {
  const o = { v: 1, code: NET.code, role: NET.role, nm: (CO.nick || '').slice(0, 12), ph: CO.ph, rd: CO.rd, st: NET.role === 'host' ? (SAVE.stageSel || 0) : (CO.st || 0) };
  if (CO.ph === 'play' && G && G.units) {
    o.sp = G.speed; o.w = G.wave; o.wt = Math.round(G.waveT * 10) / 10; o.co = Math.floor(G.coins);
    o.u = G.units.map(u => (u ? u.t + (u.c > 1 ? 'x' + u.c : '') + 'n' + ((u.n || 0) % 36).toString(36) : '')).join(',');
    const live = G.foes.filter(f => !f.dead);
    o.fn = live.length;
    o.f = live.slice(0, 48).map(f => [Math.round(f.x * 10), Math.round(f.y * 10), f.boss ? 9 : f.chal ? 8 : f.kind]);
    o.ff = live.slice(0, 110).map(f => [f.id, Math.round(f.d * 100), Math.round(foeSpeedNow(f) * 1000), Math.round(f.hp), Math.round(f.max), f.kind, Math.round(f.lane * 100), Math.round(f.r * 100), f.boss || f.chal || '', (f.big ? 1 : 0) + (f.mini ? 2 : 0) + (f.hidden > 0 ? 4 : 0)]);
    if (G.outHits && G.outHits.length) CO.hitLog.push([++CO.hitSeq, G.outHits.splice(0)]);
    while (CO.hitLog.length && (CO.hitLog[0][0] <= CO.hitAck || CO.hitLog.length > 40)) CO.hitLog.shift();
    o.hz = CO.hitLog; o.ha = CO.hitIn;
    o.bw = COOP.bossW; o.bd = Math.round(COOP.bossDmg); o.bh = G.boss && !G.boss.dead ? Math.round(G.boss.hp / G.boss.max * 100) : -1;
    o.gs = CO.giftSent;
    o.mo = STAGES[G.stage || 0].myths.filter(id => !MYTH_BY[id].secret && mythOpenSelf(id, G.stage || 0));
  }
  o.lost = CO.lost;
  return o;
}
function pickPartner() {
  let best = null, bt = -1;
  for (const v of NET.peers.values()) { const p = v.presence; if (!p || p.v !== 1 || p.code !== NET.code) continue; if (v.at > bt) { bt = v.at; best = p; } }
  return best;
}
function onNet() {
  const before = CO.partner;
  CO.partner = pickPartner();
  const np = CO.partner;
  if (np && np !== before) {
    CO.pAt = performance.now();
    if (np.rd === CO.rd && CO.ph === 'play') {
      if (typeof np.ha === 'number' && np.ha > CO.hitAck) CO.hitAck = np.ha;
      if (Array.isArray(np.hz)) for (const b of np.hz) if (Array.isArray(b) && b[0] > CO.hitIn) { CO.hitIn = b[0]; if (Array.isArray(b[1])) CO.hitsQ.push(...b[1]); }
    }
  }
  if (!CO.partner && before && CO.ph === 'play') { toast(`${before.nm || '친구'}가 나갔어요 · 혼자 계속해요`); }
  const p = CO.partner;
  /* the guest starts when the host does */
  if (p && NET.role === 'guest' && p.ph === 'start' && p.rd && p.rd !== CO.rd) coopBegin(p.st, p.rd);
  if (p && NET.role === 'host' && CO.mmAuto && CO.ph === 'lobby') { CO.mmAuto = false; coopNote(`${pname()}와 짝지었어요! 곧 시작해요`); setTimeout(() => { if (CO.partner && CO.ph === 'lobby') coopStart(); }, 900); }
  if (!el.coopOv.hidden) renderCoop();
}
function coopNote(t) { CO.note = t; if (!el.coopOv.hidden) renderCoop(); }

/* host presses start: tell the guest, then begin a moment later so both yards open together */
function coopStart() {
  if (NET.role !== 'host' || !CO.partner) return;
  const rd = Math.random().toString(36).slice(2, 8);
  CO.rd = rd; CO.ph = 'start'; NET.link && NET.link.send(coopSnap());
  coopNote('시작해요!');
  setTimeout(() => coopBegin(SAVE.stageSel || 0, rd, true), 600);
}
function coopBegin(st, rd, host) {
  el.coopGift.hidden = false; R.duo = true; CO.hitSeq = 0; CO.hitIn = 0; CO.hitAck = 0; CO.hitLog = []; CO.hitsQ = []; NETF.clear();
  CO.rd = rd; CO.st = st; CO.giftSent = 0; CO.giftGot = 0; CO.lost = false; CO.ph = 'play'; CO.mm = false; CO.mmAuto = false;
  AI.on = false; R.mode = 'net';
  COOP.on = true; COOP.bossW = 0; COOP.bossDmg = 0; COOP.pApplied = 0; COOP.sync = NET_SYNC;
  el.coopOv.hidden = true; el.endOv.hidden = true;
  R.coopStage = st; startGame(); R.coopStage = null;
  el.coopBox.hidden = false; placeCoopBox(); renderGiftBtn();
  toast(host ? `${pname()}와 같이 시작! 보스는 둘이 같이 잡아요` : `${pname()}의 방에서 같이 시작! 보스는 둘이 같이 잡아요`);
}

/* every simulation step: partner damage on the shared boss, coins they sent, the host's clock and speed */
COOP.sync = () => {
  const p = CO.partner; if (!p || p.rd !== CO.rd) { if (G.ghosts && G.ghosts.length) syncGhosts([]); return; }
  if (p.lost && !CO.lost) { CO.lost = true; endGame('partner'); return; }
  if (p.ph !== 'play') return;
  /* the shared road: their 도깨비 there, and the hits they landed on yours */
  syncGhosts(netFoes(p));
  if (CO.hitsQ.length) { applyHits(CO.hitsQ.splice(0)); if (G.phase !== 'play') return; }
  if (typeof p.gs === 'number' && p.gs > CO.giftGot) {
    const d = p.gs - CO.giftGot; CO.giftGot = p.gs; G.coins += d;
    emit({ k: 'coin', x: 0, y: -HY - 0.2, v: d, big: true }); toast(`${pname()}가 엽전 ${fmtC(d)}을 보냈어요`);
  }
  const b = G.boss;
  if (b && !b.dead && p.bw === COOP.bossW && typeof p.bd === 'number' && p.bd > COOP.pApplied) {
    const d = p.bd - COOP.pApplied; COOP.pApplied = p.bd; b.hp -= d;
    if (b.hp <= 0) { HIT_UID = 0; kill(b); }
  }
  if (NET.role === 'guest') {
    if (p.sp && G.speed !== p.sp) G.speed = p.sp;
    if (p.w === G.wave && typeof p.wt === 'number') { const diff = p.wt - G.waveT; if (Math.abs(diff) > 0.5 && Math.abs(diff) < 20) G.waveT += diff * 0.25; }
  }
  if (p.lost && !CO.lost) { CO.lost = true; endGame('partner'); }
};
const NET_SYNC = COOP.sync;
COOP.onEnd = reason => {
  if (reason !== 'win' && reason !== 'partner') CO.lost = true;
  CO.ph = 'over';
  if (NET.link) NET.link.send(coopSnap());
};
function coopLeaveRun() { COOP.on = false; CO.ph = 'lobby'; el.coopBox.hidden = true; R.duo = false; NETF.clear(); if (NET.kind === 'ai') { aiStop(); netClose(); NET.role = ''; } }

/* ---------- the partner's yard on your field ----------
   with the AI it is its real state. with a friend it is rebuilt from their last message: each 도깨비 keeps
   walking along the road at the speed it had, until the next message corrects it */
const NETF = new Map(), NETU = { key: '', list: [] };
function netFoes(p) {
  if (!p || !Array.isArray(p.ff)) return [];
  const now = performance.now(), age = G.paused ? 0 : Math.min(1.2, Math.max(0, (now - (CO.pAt || 0)) / 1000)) * (G.speed || 1), seen = new Set(), out = [];
  for (const a of p.ff) {
    const [id, d, sp, hp, max, kind, lane, r, key, fl] = a;
    let f = NETF.get(id);
    if (!f) { f = { id, w0: Math.random() * TAU, age: 1, flash: 0, hx: 1, hy: 0, face: 1, slowT: 0, stunT: 0, burnT: 0, markT: 0, curseT: 0, revT: 0, fAt: -1e9, chalT: 1, chalMax: 1 }; NETF.set(id, f); }
    if (f.hp !== undefined && hp < f.hp) f.fAt = now;
    f.kind = kind; f.hp = hp; f.max = max || hp || 1; f.lane = lane / 100; f.r = r / 100; f.big = !!(fl & 1); f.mini = !!(fl & 2); f.hidden = fl & 4 ? 1 : 0;
    f.boss = f.big && key && BOSS_DEF[key] ? key : null; f.chal = f.big && key && !f.boss ? key : null;
    f.d = d / 100 + (sp / 1000) * age;
    const q = pathAt(f.d); f.x = q.x - q.dy * f.lane; f.y = q.y + q.dx * f.lane; f.hx = q.dx; f.hy = q.dy;
    f.wob = f.w0 + now / 1000 * 4 * (G.speed || 1); f.flash = Math.max(0, 0.09 - (now - f.fAt) / 1000);
    f.dead = false; seen.add(id); out.push(f);
  }
  for (const id of [...NETF.keys()]) if (!seen.has(id)) NETF.delete(id);
  return out;
}
function netUnits(p) {
  const key = p.u || '';
  if (NETU.key === key) return NETU.list;
  NETU.key = key;
  NETU.list = key.split(',').map((c, i) => {
    if (!c) return null;
    const m = /^(\d+)(?:x(\d+))?(?:n([0-9a-z]+))?$/.exec(c); if (!m || !TYPES[+m[1]]) return null;
    return { id: 'p' + i + ':' + m[1], t: +m[1], c: +(m[2] || 1), n: parseInt(m[3] || '0', 36) };
  });
  return NETU.list;
}
function partnerView() {
  if (!R.duo || !G || G.phase !== 'play') return null;
  if (NET.kind === 'ai') {
    const A = AI.G; if (!A) return null;
    return { units: A.units, foes: AI.out ? [] : A.foes, shots: AI.out ? [] : A.shots, nm: `AI ${AI.nm}`, n: A.foes.length, out: AI.out };
  }
  const p = CO.partner; if (!p || p.rd !== CO.rd || p.ph !== 'play') return null;
  return { units: netUnits(p), foes: netFoes(p), shots: [], nm: pname(), n: p.fn || 0, out: false };
}

/* ---------- AI 동료: the default way to play. the computer keeps its own yard beside yours and shares bosses ---------- */
function aiStop() { AI.on = false; AI.G = null; COOP.sync = NET_SYNC; }
function aiLink() {
  netClose(); mmStop();
  NET.kind = 'ai'; NET.role = 'host'; NET.code = ''; NET.link = { send: () => {}, close: aiStop };
  CO.rd = 'ai' + Math.random().toString(36).slice(2, 7); CO.giftSent = 0; CO.giftGot = 0; CO.lost = false; CO.ph = 'play'; CO.mm = false; CO.mmAuto = false;
}
function aiShow() {
  CO.partner = aiSnap(); el.coopGift.hidden = false;
  el.coopOv.hidden = true; el.endOv.hidden = true;
  el.coopBox.hidden = false; placeCoopBox(); renderGiftBtn();
}
function aiBegin() {
  aiLink(); R.duo = true;
  COOP.on = true; COOP.bossW = 0; COOP.bossDmg = 0; COOP.pApplied = 0; COOP.sync = aiSyncMe;
  R.mode = 'ai'; startGame();
  aiNew(lvMulArr(), lvSpdArr(), G.stage, relicBonuses());
  aiShow();
  toast(`AI ${AI.nm}와 같이 시작! 마당은 각자, 보스는 둘이 같이 잡아요`);
}
/* the AI's yard as the partner view expects it */
function aiSnap() {
  const A = AI.G; if (!A) return null;
  const live = A.foes.filter(f => !f.dead);
  return { v: 1, ai: true, code: '', role: 'guest', nm: `AI ${AI.nm}`, ph: AI.out ? 'out' : 'play', rd: CO.rd, st: A.stage, sp: A.speed, w: A.wave, wt: A.waveT, co: Math.floor(A.coins),
    u: A.units.map(u => (u ? u.t + (u.c > 1 ? 'x' + u.c : '') : '')).join(','), fn: live.length,
    f: live.slice(0, 48).map(f => [Math.round(f.x * 10), Math.round(f.y * 10), f.boss ? 9 : f.chal ? 8 : f.kind]),
    bw: AI.co.bossW, bd: Math.round(AI.co.bossDmg), bh: A.boss && !A.boss.dead ? Math.round(A.boss.hp / A.boss.max * 100) : -1, gs: 0, mo: [], lost: false };
}
/* a run with the AI saves both yards, so closing the app and coming back keeps your teammate */
function aiSave() {
  if (NET.kind !== 'ai' || !AI.G) return null;
  const me = G; let st = null;
  try { G = AI.G; st = AI.out ? null : serialize(); } finally { G = me; }
  return { st, co: AI.co, nm: AI.nm, out: AI.out || !st, gift: AI.gift, giftGot: AI.giftGot, sent: AI.sent, sentGot: AI.sentGot, coop: { on: COOP.on, bossW: COOP.bossW, bossDmg: COOP.bossDmg, pApplied: COOP.pApplied } };
}
function aiResume(a) {
  aiLink(); R.duo = true;
  const me = G; let ok = false;
  try { if (a.st && !a.out) ok = restore(a.st); if (ok) { AI.G = G; AI.G.paused = false; AI.G.sel = -1; } } finally { G = me; }
  Object.assign(AI, { on: true, out: !ok, t: 0.5, sendT: 20, nm: a.nm || pick(AI_NAMES), co: Object.assign({ bossW: 0, bossDmg: 0, pApplied: 0 }, a.co || {}), gift: a.gift || 0, giftGot: a.giftGot || 0, sent: a.sent || 0, sentGot: a.sentGot || 0 });
  if (!ok) AI.G = null;
  const c = a.coop || {};
  COOP.on = !!c.on && ok; COOP.bossW = c.bossW || 0; COOP.bossDmg = c.bossDmg || 0; COOP.pApplied = c.pApplied || 0; COOP.sync = aiSyncMe;
  R.mode = 'ai';
  if (AI.G) aiShow(); else { CO.partner = null; el.coopBox.hidden = true; }
}

/* send loop: often while playing, now and then in the lobby; drop same-browser peers that went quiet */
setInterval(() => {
  if (!NET.link) return;
  const now = Date.now();
  if (NET.kind === 'local') { let gone = false; for (const [k, v] of NET.peers) if (now - v.at > 6000) { NET.peers.delete(k); gone = true; } if (gone) onNet(); }
  CO.sendT -= 0.25;
  if (NET.kind === 'ai') { if (AI.G) CO.partner = aiSnap(); el.coopGift.hidden = AI.out || !AI.G; }
  else if (CO.ph === 'play' || CO.sendT <= 0) { CO.sendT = 1; NET.link.send(coopSnap()); }
  if (CO.ph === 'play' && !el.coopBox.hidden) drawPartner();
}, 250);

/* ---------- the partner's yard, small, top left; tap to enlarge ---------- */
function partnerImg(id) {
  let im = CO.imgs.get(id);
  if (!im) { im = new Image(); im.src = portraitURL(id, 40); CO.imgs.set(id, im); }
  return im;
}
function drawPartner() {
  const pill = CO.compact && !CO.big;
  const cvs = el.coopCv, d = Math.min(window.devicePixelRatio || 1, 2), W = pill ? 178 : CO.big ? 236 : CO.wideBox ? 168 : 124, H = pill ? 30 : Math.round(W * 1.12);
  if (cvs.width !== Math.round(W * d) || cvs.height !== Math.round(H * d)) { cvs.width = Math.round(W * d); cvs.height = Math.round(H * d); cvs.style.width = W + 'px'; cvs.style.height = H + 'px'; }
  const g = cvs.getContext('2d'); g.setTransform(d, 0, 0, d, 0, 0); g.clearRect(0, 0, W, H);
  g.fillStyle = 'rgba(18,15,28,.86)'; g.beginPath(); RR(g, 0, 0, W, H, 10); g.fill();
  const p = CO.partner, top = 18;
  /* a phone has no room beside the yard: one line with the friend's wave and crowd, tap to see their yard */
  if (pill) {
    g.textBaseline = 'middle'; g.font = '12px "Jua",sans-serif';
    if (!p || p.ph !== 'play') { g.fillStyle = '#ffe6a0'; g.textAlign = 'left'; g.fillText(p ? `${pname()} · ${p.ph === 'out' ? '쓰러졌어요' : '기다리는 중'}` : '친구 연결 끊김', 9, H / 2); return; }
    g.textAlign = 'left'; g.fillStyle = '#ffe6a0'; g.fillText(`${pname()} · ${p.w}마당`, 9, H / 2 - (p.bh >= 0 ? 2 : 0));
    g.textAlign = 'right'; g.fillStyle = p.fn >= 80 ? '#ff8a6a' : '#cfc6b4'; g.fillText(`${p.fn || 0}/${BAL.cap} ▾`, W - 8, H / 2 - (p.bh >= 0 ? 2 : 0));
    if (p.bh >= 0) { g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(9, H - 6, W - 18, 3); g.fillStyle = '#ef5a3a'; g.fillRect(9, H - 6, (W - 18) * p.bh / 100, 3); }
    return;
  }
  g.fillStyle = '#ffe6a0'; g.font = `${CO.big ? 13 : 11}px "Jua",sans-serif`; g.textBaseline = 'middle'; g.textAlign = 'left';
  if (!p || p.ph !== 'play') { g.fillText(p ? `${pname()} · ${p.ph === 'out' ? '쓰러졌어요' : '기다리는 중'}` : '친구 연결 끊김', 8, 10); return; }
  g.fillText(`${pname()} · ${p.w}마당`, 8, 10);
  g.textAlign = 'right'; g.fillStyle = p.fn >= 80 ? '#ff8a6a' : '#cfc6b4'; g.fillText(`${p.fn || 0}/${BAL.cap}`, W - 8, 10);
  const ww = WORLD.x1 - WORLD.x0, wh = WORLD.y1 - WORLD.y0, k = Math.min((W - 8) / ww, (H - top - 4) / wh);
  const ox = W / 2 - (WORLD.x0 + ww / 2) * k, oy = top + (H - top) / 2 - (WORLD.y0 + wh / 2) * k;
  const X = x => ox + x * k, Y = y => oy + y * k;
  g.strokeStyle = 'rgba(230,200,150,.35)'; g.lineWidth = Math.max(4, k * 0.6); g.beginPath(); RR(g, X(-HX), Y(-HY), HX * 2 * k, HY * 2 * k, k * 0.6); g.stroke();
  const cells = (p.u || '').split(',');
  cells.forEach((s, i) => {
    if (!s || i >= NCELL) return;
    const [t, c] = s.split('x'), T = TYPES[+t]; if (!T) return;
    const cx = X(cellX(i)), cy = Y(cellY(i)), sz = k * 0.92;
    g.fillStyle = rgba(TIERS[T.tier].color, 0.35); g.fillRect(cx - sz / 2, cy - sz / 2, sz, sz);
    const im = partnerImg(T.id); if (im.complete && im.naturalWidth) g.drawImage(im, cx - sz / 2, cy - sz / 2, sz, sz);
    if (c && CO.big) { g.fillStyle = '#fff'; g.font = '9px sans-serif'; g.textAlign = 'right'; g.fillText(c, cx + sz / 2 - 1, cy + sz / 2 - 4); }
  });
  for (const [fx, fy, kd] of p.f || []) {
    const x = X(fx / 10), y = Y(fy / 10), big = kd === 9 || kd === 8;
    g.fillStyle = kd === 9 ? '#ff4a3a' : kd === 8 ? '#b06aff' : '#ffb347';
    g.beginPath(); g.arc(x, y, big ? Math.max(3.5, k * 0.32) : Math.max(1.6, k * 0.14), 0, TAU); g.fill();
  }
  if (p.bh >= 0) {
    const bw = W - 16; g.fillStyle = 'rgba(0,0,0,.6)'; g.fillRect(8, H - 10, bw, 5); g.fillStyle = '#ef5a3a'; g.fillRect(8, H - 10, bw * p.bh / 100, 5);
  }
}
function renderGiftBtn() {
  el.coopGift.textContent = `엽전 ${COOP_GIFT} 보내기`;
}

/* ---------- 랜덤 매칭: meet a stranger who picked the same 고을, with no server of our own ----------
   the public PeerJS server knows which ids are taken, and that is enough for a tiny lobby:
   a few well known slot ids per 고을 and game version. try to hold a slot; if someone already holds it,
   they are waiting, so knock. whoever waits makes a room code and hands it to the one who knocked,
   and from there it is an ordinary room. nobody in time: play with the AI instead */
const MM = { on: false, t0: 0, st: 0, peer: null, host: null, found: false, tick: 0, timer: 0, hosting: false };
const MM_SLOTS = 3, MM_WAIT = (window.PEER_OPTS && window.PEER_OPTS.mmWait) || 30000;
const mmId = (st, k) => `joseon-defense-mm-${APP_BUILD}-${st}-${k}`.toLowerCase();
const mmSleep = ms => new Promise(r => setTimeout(r, ms));
/* someone with no name yet shows up as 나그네 and a number, so two strangers are not both just 나그네 */
const mmNick = () => (CO.nick || '').slice(0, 12) || (MM.anon = MM.anon || `나그네${10 + Math.floor(Math.random() * 90)}`);
function mmStart() {
  if (typeof window.Peer !== 'function' || window.claude) { toast('랜덤 매칭은 깃허브 링크에서 할 수 있어요'); return; }
  if (MM.on) { openCoop(); return; }
  netClose(); NET.role = ''; aiStop();
  Object.assign(MM, { on: true, t0: Date.now(), st: SAVE.stageSel || 0, found: false, hosting: false });
  CO.mm = true; CO.mmAuto = false; CO.note = ''; CO.ph = 'lobby'; CO.rd = '';
  openCoop();
  MM.tick = setInterval(() => { if (!el.coopOv.hidden && CO.mm) renderCoop(); }, 1000);
  MM.timer = setTimeout(mmTimeout, MM_WAIT);
  mmLoop().catch(() => {});
}
function mmStop() {
  if (!MM.on && !MM.peer && !MM.host) return;
  MM.on = false; MM.hosting = false; clearInterval(MM.tick); clearTimeout(MM.timer);
  for (const p of [MM.peer, MM.host]) { try { if (p) p.destroy(); } catch (err) { /* ignore */ } }
  MM.peer = null; MM.host = null;
}
function mmTimeout() {
  if (!MM.on || MM.found) return;
  mmStop(); CO.mm = false;
  toast('같이 할 사람이 아직 없어서 AI 동료랑 시작해요');
  aiBegin();
}
/* a peer on the server: resolves with it once registered, 'taken' when that id is in use, or null */
function mmPeer(id) {
  return new Promise(res => {
    const opts = Object.assign({ debug: 0 }, window.PEER_OPTS || {});
    let p, done = false; const fin = v => { if (!done) { done = true; res(v); } };
    try { p = id ? new Peer(id, opts) : new Peer(opts); } catch (err) { fin(null); return; }
    p.on('open', () => fin(p));
    p.on('error', e => { if (done) return; try { p.destroy(); } catch (err) { /* ignore */ } fin(e && e.type === 'unavailable-id' ? 'taken' : null); });
    setTimeout(() => { if (!done) { try { p.destroy(); } catch (err) { /* ignore */ } fin(null); } }, 10000);
  });
}
/* knock on one slot: { code, nm } when someone waiting there takes us, else 'empty' or 'busy' */
function mmProbe(peer, id) {
  return new Promise(res => {
    let done = false, c = null;
    const fin = v => { if (done) return; done = true; clearTimeout(to); peer.off('error', onErr); try { if (c && typeof v === 'string') c.close(); } catch (err) { /* ignore */ } res(v); };
    const onErr = e => { if (e && e.type === 'peer-unavailable' && (!e.message || String(e.message).toLowerCase().includes(id))) fin('empty'); };
    peer.on('error', onErr);
    const to = setTimeout(() => fin('busy'), 7000);
    try { c = peer.connect(id, { reliable: true, serialization: 'json' }); } catch (err) { fin('busy'); return; }
    c.on('data', d => {
      if (!d || !d.mm) return;
      if (d.mm === 'hi') c.send({ mm: 'join', nm: mmNick() });
      else if (d.mm === 'busy') fin('busy');
      else if (d.mm === 'room' && d.code) fin({ code: String(d.code).toUpperCase(), nm: d.nm || '' });
    });
    c.on('close', () => fin('busy'));
  });
}
/* we hold a slot: wait there until someone knocks. resolves 'matched' or 'end' */
function mmWaitIn(p) {
  MM.host = p; MM.hosting = true; renderCoop();
  return new Promise(res => {
    p.on('connection', c => {
      c.on('open', () => { try { c.send(MM.found || !MM.on ? { mm: 'busy' } : { mm: 'hi', nm: mmNick() }); } catch (err) { /* ignore */ } });
      c.on('data', d => {
        if (!d || d.mm !== 'join') return;
        if (MM.found || !MM.on) { try { c.send({ mm: 'busy' }); } catch (err) { /* ignore */ } return; }
        MM.found = true;
        const code = coopCode();
        try { c.send({ mm: 'room', code, nm: mmNick() }); } catch (err) { /* ignore */ }
        setTimeout(() => mmMatched(code, 'host', d.nm), 400);
        res('matched');
      });
    });
    p.on('disconnected', () => { if (MM.on && !MM.found) { try { p.reconnect(); } catch (err) { /* ignore */ } } });
    p.on('close', () => res('end'));
  });
}
/* claiming an id answers at once, while asking for a missing one takes the server seconds.
   so for each slot: try to hold it. held, we wait there. taken, someone waits there: knock */
async function mmLoop() {
  while (MM.on && !MM.found) {
    for (let k = 0; k < MM_SLOTS && MM.on && !MM.found; k++) {
      const id = mmId(MM.st, k), p = await mmPeer(id);
      if (!MM.on || MM.found) { try { if (p && p !== 'taken') p.destroy(); } catch (err) { /* ignore */ } return; }
      if (p && p !== 'taken') { await mmWaitIn(p); return; }
      if (!p) { mmStop(); CO.mm = false; coopNote('연결 서버에 닿지 못했어요. 와이파이를 바꾸거나 데이터로 다시 해 주세요'); return; }
      if (!MM.peer) {
        const me = await mmPeer(null);
        if (!MM.on || MM.found) { try { if (me && me !== 'taken') me.destroy(); } catch (err) { /* ignore */ } return; }
        if (!me || me === 'taken') continue;
        MM.peer = me;
      }
      const r = await mmProbe(MM.peer, id);
      if (!MM.on || MM.found) return;
      if (r && r.code) { MM.found = true; mmMatched(r.code, 'guest', r.nm); return; }
    }
    await mmSleep(1500);
  }
}
/* from here it is an ordinary room; the one who waited starts as soon as the other is in */
function mmMatched(code, role, nm) {
  mmStop(); MM.found = true; CO.mm = true;
  if (!CO.nick) CO.nick = mmNick();
  CO.mmAuto = role === 'host';
  coopNote(`${nm || '상대'}를 찾았어요! 연결하는 중…`);
  coopEnter(code, role);
}

/* ---------- the room panel in the lobby ---------- */
function openCoop() { auInit(); el.coopOv.hidden = false; renderCoop(); }
function closeCoop() { el.coopOv.hidden = true; }
function renderCoop() {
  const p = CO.partner, S = STAGES[NET.role === 'guest' && p ? (p.st || 0) : (SAVE.stageSel || 0)] || STAGES[0];
  const GH = 'https://jayjunhyoung-crypto.github.io/joseon-defense/';
  const p2pHow = NET.role === 'host'
    ? (NET.srv === 're' ? '<p class="meta co-warn">연결 서버에 다시 붙는 중이에요. 이 화면을 켜 두세요</p>' : '<p class="meta"><span class="sync ok"></span>방이 열려 있어요. 코드를 보낸 뒤 이 화면으로 꼭 돌아와 주세요</p>')
    : (NET.srv === 're' ? '<p class="meta co-warn">연결 서버에 다시 붙는 중이에요</p>' : '<p class="meta">친구는 이 게임 링크를 열고 코드만 넣으면 돼요</p>');
  const how = NET.kind === 'p2p' ? p2pHow : NET.kind === 'local' ? '<p class="meta">지금은 이 브라우저의 다른 탭끼리만 연결돼요. 다른 기기의 친구와 하려면 이 페이지를 친구에게 공유해야 해요</p>' : NET.kind === 'room' ? '<p class="meta">실시간 연결 중 · 친구도 이 페이지를 열고 같은 코드로 들어오면 돼요</p>' : '';
  /* inside claude.ai the room only reaches people who open this same page with an account; the no-login page is a different place */
  const ghNote = window.claude && (!NET.link || NET.kind === 'room') ? `<p class="meta">친구가 Claude 계정이 없으면 둘 다 <a class="linkbtn" href="${GH}" target="_blank" rel="noopener">로그인 없는 링크</a>로 들어가서 거기서 방을 만들어야 해요. 여기서 만든 방은 그 링크에서 안 보여요</p>` : '';
  let body;
  if (CO.mm) {
    const left = MM.on ? Math.max(0, Math.ceil((MM_WAIT - (Date.now() - MM.t0)) / 1000)) : 0;
    body = MM.found || NET.link
      ? `<p class="co-who">${p ? `<b>${esc(pname())}</b>와 짝지었어요! 곧 시작해요` : '상대를 찾았어요. 연결하는 중…'}</p><p class="sub">고을 ${esc(S.name)}</p>`
      : `<p class="co-who"><span class="mm-dot"></span>같은 고을을 고른 사람을 찾는 중… <b class="num">${left}</b>초</p>
        <p class="sub">고을 ${esc(STAGES[MM.st] ? STAGES[MM.st].name : S.name)} · 마당은 각자 지키고 보스는 둘이 같이 잡아요. 못 찾으면 AI 동료랑 바로 시작해요</p>
        <button class="btn-sub" id="mmAi" type="button">기다리지 않고 AI 동료와 시작</button>`;
    el.coopCard.innerHTML = `<h2 class="title" style="font-size:38px">랜덤 매칭</h2>${body}${CO.note ? `<p class="meta co-note">${esc(CO.note)}</p>` : ''}
      <div class="two"><button class="btn-sub" id="mmCancel" type="button">그만두기</button></div>`;
    return;
  }
  if (!NET.link) {
    body = `<p class="sub">각자 자기 마당을 지키고, 보스는 체력 하나를 둘이 같이 깎아요. 엽전도 보내줄 수 있어요. 둘 중 한 명이라도 무너지면 같이 끝나요</p>
      <label class="co-row"><span>내 이름</span><input id="coNick" maxlength="12" placeholder="친구에게 보일 이름" value="${esc(CO.nick)}"></label>
      <button class="btn-main" id="coMake" type="button">방 만들기</button>
      <div class="co-row"><input id="coCode" maxlength="4" placeholder="코드 네 글자" autocapitalize="characters"><button class="btn-sub" id="coJoin" type="button">들어가기</button></div>`;
  } else if (NET.role === 'host') {
    body = `<p class="co-code">${esc(NET.code)}</p><p class="sub">친구에게 이 코드를 알려주세요 · 고을 ${esc(S.name)}</p>
      <p class="co-who">${p ? `<b>${esc(pname())}</b> 들어왔어요` : '친구를 기다리는 중…'}</p>
      <button class="btn-main" id="coGo" type="button" ${p ? '' : 'disabled'}>같이 시작</button>${NET.kind === 'p2p' && !p ? '<button class="btn-sub" id="coInvite" type="button">초대 링크 보내기</button>' : ''}${how}`;
  } else {
    body = `<p class="co-code">${esc(NET.code)}</p>
      <p class="co-who">${p ? `<b>${esc(pname())}</b>의 방 · 고을 ${esc(S.name)}` : '방장을 찾는 중…'}</p>
      <p class="sub">방장이 시작하면 같이 시작해요</p>${how}`;
  }
  el.coopCard.innerHTML = `<h2 class="title" style="font-size:38px">친구랑 같이</h2>${body}${CO.note ? `<p class="meta co-note">${esc(CO.note)}</p>` : ''}${ghNote}
    <div class="two">${NET.link ? '<button class="btn-sub" id="coLeave" type="button">방 나가기</button>' : ''}<button class="btn-sub" id="coClose" type="button">닫기</button></div>`;
}
async function coopEnter(code, role) {
  CO.nick = ($('coNick') && $('coNick').value.trim()) || CO.nick || '';
  try { localStorage.setItem('talnori-nick', CO.nick); } catch (err) { /* ignore */ }
  NET.role = role; CO.ph = 'lobby'; CO.rd = ''; CO.note = '연결하는 중…'; renderCoop();
  let ok = await netOpen(code);
  /* someone else is holding that code right now: pick another */
  for (let k = 0; ok === 'taken' && k < 3; k++) { code = coopCode(); ok = await netOpen(code); }
  ok = ok === true;
  if (!ok || CO.note === '연결하는 중…') CO.note = ok ? '' : (NET.err || '연결하지 못했어요');
  NET.err = '';
  if (!ok) NET.role = '';
  if (NET.link) NET.link.send(coopSnap());
  renderCoop();
}
document.addEventListener('click', e => {
  if (el.coopOv.hidden) return;
  const t = e.target.closest('button'); if (!t) return;
  if (t.id === 'mmCancel') { mmStop(); CO.mm = false; CO.mmAuto = false; netClose(); NET.role = ''; CO.note = ''; closeCoop(); return; }
  if (t.id === 'mmAi') { mmStop(); CO.mm = false; aiBegin(); return; }
  if (t.id === 'coMake') coopEnter(coopCode(), 'host');
  else if (t.id === 'coJoin') { const c = ($('coCode').value || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (c.length !== 4) { toast('코드 네 글자를 넣어 주세요'); return; } coopEnter(c, 'guest'); }
  else if (t.id === 'coGo') coopStart();
  else if (t.id === 'coInvite') coopInvite();
  else if (t.id === 'coLeave') { netClose(); NET.role = ''; CO.note = ''; renderCoop(); }
  else if (t.id === 'coClose') { if (CO.mm && !NET.link) { mmStop(); CO.mm = false; } closeCoop(); }
});
el.coopCv.addEventListener('click', () => { if (R.duo) return; CO.big = !CO.big; placeCoopBox(); });
el.coopGift.addEventListener('click', () => {
  if (!COOP.on || G.phase !== 'play') return;
  if (!CO.partner) { toast('친구와 연결이 끊겼어요'); return; }
  if (G.coins < COOP_GIFT) { toast(`엽전이 ${COOP_GIFT} 있어야 보낼 수 있어요`); return; }
  if (NET.kind === 'ai' && (AI.out || !AI.G)) { toast(`${pname()}는 쓰러졌어요`); return; }
  G.coins -= COOP_GIFT; CO.giftSent += COOP_GIFT; G.stats.gifts = (G.stats.gifts || 0) + 1; if (NET.kind === 'ai') AI.gift += COOP_GIFT; sfx('coin'); toast(`${pname()}에게 엽전 ${COOP_GIFT}을 보냈어요`);
});
window.addEventListener('pagehide', () => { mmStop(); netClose(); });

/* beside the yard when there is room (laptop, tablet on its side), otherwise a one-line strip under the top bar */
function placeCoopBox() {
  const wide = document.body.classList.contains('wide'), hud = document.getElementById('hud');
  const room = R.OX + WORLD.x0 * R.CS - 12;
  CO.wideBox = room >= 180; CO.compact = room < 132 || R.duo; if (R.duo) CO.big = false;
  /* their yard is on the field now, so only the gift button stays */
  el.coopCv.hidden = !!R.duo; el.coopBox.classList.toggle('only-gift', !!R.duo);
  el.coopBox.classList.toggle('is-pill', CO.compact && !CO.big);
  const top = wide ? 10 : hud ? Math.round(hud.getBoundingClientRect().bottom - (CO.compact && !CO.big ? 6 : -4)) : 110;
  el.coopBox.style.top = `${top}px`;
  drawPartner();
}
window.addEventListener('resize', () => { if (!el.coopBox.hidden) placeCoopBox(); });

/* one tap for the friend: the link carries the room code and joins by itself */
const joinURL = () => location.origin + location.pathname + '#join=' + NET.code;
async function coopInvite() {
  const text = `조선 디펜스 같이 하자! 방 코드 ${NET.code}`, url = joinURL();
  if (navigator.share) { try { await navigator.share({ title: '조선 디펜스', text, url }); return; } catch (err) { if (err && err.name === 'AbortError') return; } }
  const tmp = document.createElement('textarea'); tmp.value = `${text}\n${url}`; tmp.style.cssText = 'position:fixed;left:-999px;top:0'; document.body.appendChild(tmp);
  const ok = await copyText(tmp.value, tmp); tmp.remove();
  toast(ok ? '초대 링크를 복사했어요. 친구에게 붙여넣어 보내 주세요' : `친구에게 이 주소를 보내 주세요 · ${url}`);
}
function joinFromLink() {
  const m = /[#&]join=([A-Za-z0-9]{4})\b/.exec(location.hash || '');
  if (!m || typeof window.Peer !== 'function') return;
  try { history.replaceState(null, '', location.pathname + location.search); } catch (err) { /* ignore */ }
  const go = () => { if (!R.lobby) { setTimeout(go, 500); return; } openCoop(); const c = $('coCode'); if (c) c.value = m[1].toUpperCase(); coopEnter(m[1].toUpperCase(), 'guest'); };
  setTimeout(go, 700);
}

/* ---------- 폰 앱: install to the home screen, play offline, keep the screen on ---------- */
const APP_BUILD = 'cbd0e5d3da';
const APP = (() => {
  const ua = navigator.userAgent || '', mq = q => { try { return matchMedia(q).matches; } catch (err) { return false; } };
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return {
    ios, android: /Android/i.test(ua),
    standalone: mq('(display-mode: standalone)') || mq('(display-mode: fullscreen)') || navigator.standalone === true,
    inapp: /KAKAOTALK/i.test(ua) ? 'kakao' : /Instagram|FBAN|FBAV|\bLine\/|NAVER\(inapp|DaumApps|everytimeApp/i.test(ua) ? 'other' : '',
    prompt: null, installed: false,
  };
})();
const appOv = $('appOv'), appCard = $('appCard');
const AP_SHARE = '<svg class="ap-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8.5 10H6.5a1.5 1.5 0 0 0-1.5 1.5v8A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-8a1.5 1.5 0 0 0-1.5-1.5h-2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
const AP_ADD = '<svg class="ap-ico" viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
function renderAppChips() {
  const c = $('appChip'), u = $('updChip'), box = $('appChips');
  c.hidden = APP.standalone || APP.installed || !(APP.prompt || APP.ios || APP.android || APP.inapp);
  box.hidden = c.hidden && u.hidden;
}
function openAppGuide() {
  let body;
  if (APP.inapp === 'kakao') body = '<p class="meta">카카오톡 안에서 열린 화면이라 여기서는 설치가 안 돼요. 사파리나 크롬으로 열면 홈 화면에 깔 수 있어요.</p><button class="btn-main" id="apExt" type="button">사파리·크롬으로 열기</button><p class="ap-note">버튼이 안 되면 카톡 화면의 ⋯ 또는 ⋮ 메뉴에서 "다른 브라우저로 열기"를 눌러 주세요.</p>';
  else if (APP.inapp) body = '<p class="meta">이 앱 안에서 열린 화면이라 설치가 안 돼요. ⋯ 또는 ⋮ 메뉴에서 "브라우저로 열기"를 눌러 사파리나 크롬에서 열어 주세요.</p>';
  else if (APP.ios) body = `<ol class="ap-steps"><li>${AP_SHARE} 공유 버튼을 눌러요. 아이폰은 화면 아래, 아이패드는 위에 있어요. 안 보이면 ⋯ 버튼을 먼저 눌러요.</li><li>목록에서 ${AP_ADD} <b>홈 화면에 추가</b>를 눌러요.</li><li>오른쪽 위 <b>추가</b>를 누르면 끝이에요. 이제 홈 화면 아이콘으로 열면 돼요.</li></ol>`;
  else body = '<ol class="ap-steps"><li>브라우저 오른쪽 위 ⋮ 메뉴를 눌러요.</li><li><b>앱 설치</b> 또는 <b>홈 화면에 추가</b>를 눌러요.</li></ol>';
  appCard.innerHTML = `<h2 class="title" style="font-size:34px">앱으로 설치</h2>${body}
    <p class="ap-note">홈 화면 앱은 브라우저랑 기록이 따로 저장돼요. 지금 하던 기록은 저장 코드로 옮기면 돼요.</p>
    <button class="btn-sub" id="apCode" type="button">내 저장 코드 열기</button>
    <button class="btn-sub" id="apClose" type="button">닫기</button>`;
  appOv.hidden = false; auInit(); sfx('click');
}
async function appInstall() {
  if (APP.prompt && !APP.inapp) {
    const pr = APP.prompt; APP.prompt = null;
    try { pr.prompt(); const ch = await pr.userChoice; if (ch && ch.outcome === 'accepted') APP.installed = true; } catch (err) { openAppGuide(); }
    renderAppChips(); return;
  }
  openAppGuide();
}
/* the first time the game opens from the home screen: the browser's progress is not here yet */
function appHello() {
  if (!APP.standalone || !R.lobby) return;
  let seen = false; try { seen = !!localStorage.getItem('jd-app-hello'); localStorage.setItem('jd-app-hello', '1'); } catch (err) { seen = true; }
  if (seen || (SAVE.stats.games || 0) > 0) return;
  appCard.innerHTML = `<h2 class="title" style="font-size:34px">앱으로 열었어요!</h2>
    <p class="meta">브라우저에서 하던 기록이 있으면 저장 코드로 가져오세요. 브라우저에서 설정, 기록 옮기기, 복사하기 순서로 누른 다음 여기서 붙여넣으면 돼요.</p>
    <button class="btn-main" id="apCode" type="button">저장 코드 붙여넣기</button>
    <button class="btn-sub" id="apClose" type="button">새로 시작할게요</button>`;
  appOv.hidden = false;
}
appOv.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) { if (e.target === appOv) appOv.hidden = true; return; }
  if (t.id === 'apClose') appOv.hidden = true;
  else if (t.id === 'apCode') { appOv.hidden = true; openSaveCode(); }
  else if (t.id === 'apExt') location.href = 'kakaotalk://web/openExternal?url=' + encodeURIComponent(NET.code && NET.role === 'guest' ? joinURL() : location.origin + location.pathname);
});
$('appChip').addEventListener('click', appInstall);
$('updChip').addEventListener('click', () => location.reload());
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !appOv.hidden) appOv.hidden = true; });
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); APP.prompt = e; renderAppChips(); });
window.addEventListener('appinstalled', () => { APP.prompt = null; APP.installed = true; renderAppChips(); toast('홈 화면에 깔았어요! 이제 아이콘으로 열면 돼요'); });
/* the screen stays on while a yard is being defended */
let wakeLk = null, wakeBusy = false;
async function keepAwake() {
  if (wakeBusy) return;
  const want = !R.lobby && document.visibilityState === 'visible';
  wakeBusy = true;
  try {
    if (want && !wakeLk && navigator.wakeLock) { wakeLk = await navigator.wakeLock.request('screen'); wakeLk.addEventListener('release', () => { wakeLk = null; }); }
    else if (!want && wakeLk) { const w = wakeLk; wakeLk = null; await w.release(); }
  } catch (err) { wakeLk = null; }
  wakeBusy = false;
}
setInterval(keepAwake, 2500);
document.addEventListener('visibilitychange', keepAwake);
/* a newer page on the site: offer it in the lobby */
async function checkUpdate() {
  if (APP_BUILD === 'dev' || !R.lobby || navigator.onLine === false) return;
  try {
    const r = await fetch('version.json?t=' + Date.now(), { cache: 'no-store' });
    if (!r.ok) return;
    const v = await r.json();
    if (v && v.build && v.build !== APP_BUILD) { $('updChip').hidden = false; renderAppChips(); }
  } catch (err) { /* offline */ }
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkUpdate(); });
setTimeout(checkUpdate, 4000);
setTimeout(appHello, 1200);
renderAppChips();
if (APP.standalone && navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => {});
if ('serviceWorker' in navigator && !window.claude && (location.protocol === 'https:' || /^(localhost|127\.0\.0\.1)$/.test(location.hostname))) {
  const reg = () => navigator.serviceWorker.register('sw.js', { scope: './' }).catch(() => {});
  if (document.readyState === 'complete') reg(); else window.addEventListener('load', reg);
}

/* ---------- start the game: everything above is defined by now ---------- */
window.claude?.hot?.snapshot?.(() => ({ state: serialize() }));
window.claude?.hot?.ready ? window.claude.hot.ready(boot) : boot(window.claude?.hot?.data ?? {});
joinFromLink();
window.__tal = { netFoes, partnerView, PVIS, AI, aiBegin, aiStep, aiSnap, aiSave, aiResume, aiStop, mmStart, mmStop, MM, mmId, APP, appInstall, openAppGuide, appHello, checkUpdate, keepAwake, mythOpen, mythOpenSelf, unlockMyth, MYTH_FREE, openMythCard, claimRoad, roadReward, COOP, NET, CO, coopBegin, coopEnter, netClose, coopInvite, joinURL, saveCode, readCode, importSave, mergeSaves, BAL, get G() { return G; }, grantRelics, relicLv, relicCopies, relicUp, relicNeed, migrate, needFor, canLevel, levelUp, newGame, newFoe, placeFoe, BOSS_DEF, FOES, spawnBoss, update, summon, gamble, upgrade, sell, drop, craft, recipeState, summonCost, upCost, TYPES, TIERS, TIER_POOL, MYTHS, setFx(v) { FX_ON = v; }, endGame, R, startGame, goLobby, get SAVE() { return SAVE; }, cellX, cellY, finishGame, AU, playStep, MODES, canMergeAt, mergeAt, hasRoom, capOf, TIER_MUL, STAGES, openPouch, buyPouch, claimAtt, tweenSilver, selectTab, FAM_KEYS, CHALS, chalReady, callChallenge, saveRun, savedRun, resumeRun, serialize, restore, startExp, expRatio, caveFloor, expReady, CAVE, endExp, chalPortraitURL, foePortraitURL, portraitURL, partyRatio, buildArt, PORTRAIT_CACHE, charm, GUTS, gutP, PITY_MAX, applyLevels, lvPerks, ROSTER, PARTS_OF, LIVE, openRecipes, openCodex, renderTab, unitLvHTML, lvOf, payInterest, addField, legNeed, poolOf, summonOdds, partyBuffs, partyDps, openGut, setPixel(v, o) { if (o) Object.assign(PIX, o); setPixel(v); }, PIX };

