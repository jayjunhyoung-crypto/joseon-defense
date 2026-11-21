/* ================= progression: levels, stages, daily quests, attendance, market, saving ================= */
const SAVE_KEY = 'talnori-save-v4';
/* companions climb to Lv 12 with their own pieces and 은전; mythics climb to Lv 15 with 향 and 은전 */
const PCS_NEED = [0, 2, 3, 5, 8, 12, 18, 25, 35, 50, 70, 95];
const SILVER_NEED = [0, 100, 250, 500, 900, 1500, 2400, 3600, 5200, 7500, 10500, 14500];
const HYANG_NEED = [0, 10, 15, 20, 30, 40, 55, 70, 90, 110, 140, 170, 210, 250, 300];
const MSILVER_NEED = [0, 300, 600, 1000, 1500, 2200, 3000, 4000, 5200, 6600, 8200, 10000, 12000, 14500, 17500];
/* companions who left the roster in the big 동료 개편 (save format 6) */
const RETIRED = TYPES.filter(T => T.old).map(T => T.id);
/* save format: v stays 1 forever; fmt counts migrations so every future update can upgrade old saves step by step */
const SAVE_FMT = 6;
const MIGRATIONS = {
  1: s => { if (!s.x10) s.silver = (s.silver || 0) * 10; s.x10 = 1; },   // currency ×10
  /* stages grew from 40 to 80 마당: old clears become 40-마당 records, unlocked 고을 stay open */
  /* 유물 used to level itself from copies; now the level is bought and extra copies wait as 조각 */
  3: s => { const T = [0, 1, 3, 6, 10, 15]; s.rlv = {}; s.rcp = {}; for (const id in s.relics || {}) { const c = s.relics[id] || 0; let lv = 0; for (let l = 1; l <= 5; l++) if (c >= T[l]) lv = l; if (lv) { s.rlv[id] = lv; s.rcp[id] = c - T[lv]; } } },
  /* 신화 해금 arrived: mythics you already made stay open, and 고을 길 steps you already took pay their 두루마리 */
  4: s => { s.mopen = {}; for (const id in s.made || {}) if (s.made[id] > 0) s.mopen[id] = 1; s.scroll = 0; for (const k in s.road || {}) { const step = +k.split('-')[1]; if (s.road[k] && step % 2 === 0) s.scroll++; } },
  2: s => { s.clear40 = Object.assign({}, s.stageClear || {}); s.stageClear = {}; s.bossBest = {}; for (const k in s.stageBest || {}) s.bossBest[k] = Math.min(80, Math.floor(((s.stageBest[k] || 1) - 1) / 10) * 10); },
  /* 동료 개편: one roster for every 고을 and 26 mythics.
     - mythics that were free in a 고을 you had reached stay open
     - retired companions give back their pieces and the pieces spent on their levels as 만능 조각, and the 은전 spent on them
     - mythic pieces turn into 향 (10 each), the new mythic level currency */
  5: s => {
    const OLD_FREE = [['samulpae', 'bari', 'cheoyong'], ['samulpae', 'saja', 'kkokdusoe'], ['uibyeongdae', 'daejanggun', 'cheoyong'], ['geobukseon', 'uibyeongdae', 'samulpae'], ['bari', 'cheoyong', 'saja']];
    s.mopen = s.mopen || {}; s.lv = s.lv || {}; s.pcs = s.pcs || {};
    for (let i = 0; i <= Math.min(OLD_FREE.length - 1, s.stageMax || 0); i++) for (const id of OLD_FREE[i]) s.mopen[id] = 1;
    let wild = 0, silver = 0, hyang = 0, n = 0;
    for (const id of RETIRED) {
      const lv = Math.min(11, s.lv[id] || 1), p = s.pcs[id] || 0;
      if (lv > 1 || p > 0) n++;
      wild += p; for (let l = 1; l < lv; l++) { wild += PCS_NEED[l]; silver += SILVER_NEED[l]; }
      delete s.lv[id]; delete s.pcs[id];
    }
    for (const T of TYPES) if (T.tier >= 4 && s.pcs[T.id]) { hyang += s.pcs[T.id] * 10; delete s.pcs[T.id]; }
    /* 고을 길 steps already taken pay the 향 they now carry */
    for (const k in s.road || {}) if (s.road[k]) { const [st, step] = k.split('-').map(Number); if (step >= 1 && step <= 8) hyang += Math.round(ROAD_HYANG[step - 1] * (1 + 0.4 * st)); }
    s.wild = (s.wild || 0) + wild; s.silver = (s.silver || 0) + silver; s.hyang = (s.hyang || 0) + hyang;
    s.refund = { n, wild, silver, hyang };
  },
};
function defaultSave() {
  return { v: 1, fmt: SAVE_FMT, x10: 1, silver: 0, jade: 0, lv: {}, pcs: {}, made: {}, seen: {}, foes: {}, ach: {}, relics: {}, rlv: {}, rcp: {}, rpity: 0, wild: 0, road: {}, mopen: {}, scroll: 0, hyang: 0, guide: 0, stories: {}, combos: {},
    stats: { games: 0, kills: 0, best: 0, wins: 0, crafts: 0, chalWins: 0, chalHard: 0, bossKills: 0, pouches: 0, silverEarned: 0, jadeEarned: 0, income: 0, chalTop: 0, caveTop: 0, caveWins: 0 },
    stageMax: 0, stageSel: 0, stageBest: {}, stageClear: {}, clear40: {}, bossBest: {}, att: { day: '', n: 0 }, market: null, quests: null, weekly: null, qbonus: '', saved: 0 };
}
let SAVE = defaultSave();
function migrate(s) {
  if (!s || s.v !== 1) return null;
  s = JSON.parse(JSON.stringify(s));
  if (!s.fmt) s.fmt = s.x10 ? 2 : 1;
  while (s.fmt < SAVE_FMT) { const m = MIGRATIONS[s.fmt]; if (m) m(s); s.fmt++; }
  const d = defaultSave();
  const out = Object.assign(d, s, { stats: Object.assign(d.stats, s.stats || {}), att: Object.assign(d.att, s.att || {}) });
  for (const k of ['lv', 'pcs', 'made', 'seen', 'foes', 'ach', 'stageBest', 'stageClear', 'clear40', 'bossBest', 'relics', 'rlv', 'rcp', 'road', 'mopen', 'stories', 'combos']) if (!out[k] || typeof out[k] !== 'object') out[k] = {};
  storyBackfill(out);
  if (typeof out.jade !== 'number') out.jade = 0;
  if (typeof out.scroll !== 'number') out.scroll = 0;
  if (typeof out.hyang !== 'number') out.hyang = 0;
  if (typeof out.guide !== 'number') out.guide = 0;
  revealIn(out);
  return out;
}
/* getting a piece of a unit you never met (from a pouch or the end of a game) puts it in the 도감 with the usual finder's reward */
function revealIn(s) {
  const ids = LIVE.filter(T => T.tier < 4 && !s.seen[T.id] && (s.pcs[T.id] || 0) > 0).map(T => T.id);
  for (const id of ids) s.seen[id] = 1;
  s.silver = (s.silver || 0) + ids.length * 100;
  return ids;
}
/* permanent progress never goes backwards: levels, 도감, 업적, 고을 and records are combined from both copies */
function mergeSaves(a, b) {
  if (!a) return b; if (!b) return a;
  const ga = a.stats.games || 0, gb = b.stats.games || 0;
  const base = gb > ga || (gb === ga && (b.saved || 0) > (a.saved || 0)) ? b : a, other = base === a ? b : a;
  const m = JSON.parse(JSON.stringify(base));
  for (const id in other.lv) m.lv[id] = Math.max(m.lv[id] || 1, other.lv[id] || 1);
  m.combos = m.combos || {}; for (const id in other.combos || {}) m.combos[id] = Math.max(m.combos[id] || 0, other.combos[id] || 0);
  for (const k of ['seen', 'foes', 'ach', 'stageClear', 'clear40', 'road', 'mopen', 'stories']) { m[k] = m[k] || {}; for (const id in other[k] || {}) if (other[k][id]) m[k][id] = m[k][id] || other[k][id]; }
  m.relics = m.relics || {}; for (const id in other.relics || {}) m.relics[id] = Math.max(m.relics[id] || 0, other.relics[id] || 0);
  m.rlv = m.rlv || {}; for (const id in other.rlv || {}) m.rlv[id] = Math.max(m.rlv[id] || 0, other.rlv[id] || 0);
  m.bossBest = m.bossBest || {}; for (const id in other.bossBest || {}) m.bossBest[id] = Math.max(m.bossBest[id] || 0, other.bossBest[id] || 0);
  for (const id in other.made) m.made[id] = Math.max(m.made[id] || 0, other.made[id] || 0);
  for (const id in other.stageBest) m.stageBest[id] = Math.max(m.stageBest[id] || 0, other.stageBest[id] || 0);
  m.stageMax = Math.max(m.stageMax || 0, other.stageMax || 0);
  for (const k in other.stats) m.stats[k] = Math.max(m.stats[k] || 0, other.stats[k] || 0);
  if ((other.att && other.att.n || 0) > (m.att.n || 0)) m.att = Object.assign({}, other.att);
  m.guide = Math.max(a.guide || 0, b.guide || 0);
  m.saved = Math.max(a.saved || 0, b.saved || 0);
  return m;
}
const sameProgress = (a, b) => JSON.stringify(Object.assign({}, a, { saved: 0 })) === JSON.stringify(Object.assign({}, b, { saved: 0 }));
const BACKUP_KEY = 'talnori-save-backup';
function loadLocal() {
  let s = null, bk = null;
  try { s = migrate(JSON.parse(localStorage.getItem(SAVE_KEY) || 'null')); } catch (err) { /* private mode */ }
  try { bk = migrate(JSON.parse(localStorage.getItem(BACKUP_KEY) || 'null')); } catch (err) { /* ignore */ }
  const m = mergeSaves(s, bk); if (m) SAVE = m;
}
let onSaveLoaded = noop;
function persist() {
  revealIn(SAVE);
  SAVE.saved = Date.now();
  try {
    const prev = localStorage.getItem(SAVE_KEY);
    if (prev) { const p = JSON.parse(prev), day = todayKey(); if (!p.bkDay || p.bkDay !== day) { localStorage.setItem(BACKUP_KEY, prev); SAVE.bkDay = day; } }
    localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE));
  } catch (err) { /* ignore */ }
  cloudSave();
}
/* cross-device sync through the page's private per-person store, when the viewer has one */
const CLOUD = { db: null, uid: null, busy: false, pending: false, ready: false, tried: false, state: 'idle', at: 0 };
let onCloudState = noop;
function cloudState(st) { CLOUD.state = st; if (st === 'ok') CLOUD.at = Date.now(); onCloudState(st); }
async function cloudInit() {
  if (CLOUD.ready || CLOUD.state === 'loading') return;
  CLOUD.tried = true;
  try {
    if (!window.claude || typeof window.claude.use !== 'function') { cloudState('off'); return; }
    cloudState('loading');
    const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
    if (!db || !user) { cloudState('off'); return; }
    const uid = await user.id(); if (!uid) { cloudState('off'); return; }
    CLOUD.db = db; CLOUD.uid = uid;
    const snap = await db.doc(`data/users/${uid}/progress`).get();
    const raw = snap.exists && snap.data() && snap.data().save, remote = migrate(raw);
    let bkRemote = null;
    try { const bs = await db.doc(`data/users/${uid}/backup`).get(); bkRemote = bs.exists && bs.data() && migrate(bs.data().save); } catch (err) { /* ignore */ }
    const merged = mergeSaves(mergeSaves(SAVE, remote), bkRemote);
    CLOUD.ready = true;
    const changed = !sameProgress(merged, SAVE);
    SAVE = merged;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(SAVE)); } catch (err) { /* ignore */ }
    if (raw && (!bkRemote || bkRemote.bkDay !== todayKey())) { try { await db.doc(`data/users/${uid}/backup`).set({ save: Object.assign(JSON.parse(JSON.stringify(raw)), { bkDay: todayKey() }) }); } catch (err) { /* ignore */ } }
    if (!remote || !sameProgress(remote, SAVE)) await cloudSave(); else cloudState('ok');
    if (changed) onSaveLoaded();
  } catch (err) { CLOUD.db = null; CLOUD.ready = false; cloudState('error'); }
}
async function cloudSave() {
  if (!CLOUD.db || !CLOUD.ready) return;
  if (CLOUD.busy) { CLOUD.pending = true; return; }
  CLOUD.busy = true;
  try { await CLOUD.db.doc(`data/users/${CLOUD.uid}/progress`).set({ save: JSON.parse(JSON.stringify(SAVE)) }); cloudState('ok'); }
  catch (err) { cloudState('error'); if (!err || err.code !== 'unavailable' && err.code !== 'resource_exhausted') { CLOUD.db = null; CLOUD.ready = false; } }
  CLOUD.busy = false;
  if (CLOUD.pending) { CLOUD.pending = false; cloudSave(); }
}

/* 저장 코드: the whole save as one line of text, so progress can move to a phone, another browser or the no-login copy of the game */
const CODE_Z = 'JD1.', CODE_RAW = 'JD0.';
function b64u(bytes) { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
function unb64u(t) { const s = atob(t.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((t.length + 3) % 4)); const b = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) b[i] = s.charCodeAt(i); return b; }
async function pipeBytes(bytes, stream) { return new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer()); }
async function saveCode() {
  const s = JSON.parse(JSON.stringify(SAVE)); delete s.bkDay;
  const raw = new TextEncoder().encode(JSON.stringify(s));
  if (typeof CompressionStream === 'function') { try { return CODE_Z + b64u(await pipeBytes(raw, new CompressionStream('deflate-raw'))); } catch (err) { /* plain code below */ } }
  return CODE_RAW + b64u(raw);
}
/* chat apps wrap long lines, so every space and line break is dropped before reading */
async function readCode(text) {
  const t = String(text || '').replace(/\s+/g, '');
  let bytes;
  if (t.startsWith(CODE_Z)) { if (typeof DecompressionStream !== 'function') throw new Error('old'); bytes = await pipeBytes(unb64u(t.slice(4)), new DecompressionStream('deflate-raw')); }
  else if (t.startsWith(CODE_RAW)) bytes = unb64u(t.slice(4));
  else throw new Error('tag');
  const s = migrate(JSON.parse(new TextDecoder().decode(bytes)));
  if (!s || !s.stats || !s.lv) throw new Error('bad');
  return s;
}
/* a code never takes progress away: it is combined like the cloud copy, the side with more games leads */
function importSave(s) { SAVE = mergeSaves(s, SAVE); persist(); onSaveLoaded(); }

/* levels */
const lvOf = id => SAVE.lv[id] || 1;
const pcsOf = id => SAVE.pcs[id] || 0;
/* companions: +15% a level, and Lv 3 adds 10% more. mythics: +12% a level. Lv 9 companions attack 10% faster */
function lvMulOf(T) { const l = lvOf(T.id); return T.tier >= 4 ? 1 + BAL.mythLvBonus * (l - 1) : (1 + BAL.lvBonus * (l - 1)) * (l >= 3 ? 1.1 : 1); }
function lvMulArr() { return TYPES.map(lvMulOf); }
function lvSpdArr() { return TYPES.map(T => T.tier < 4 && lvOf(T.id) >= 9 ? 0.9 : 1); }
function needFor(id) {
  const T = TYPES[TYPE_IX[id]], lv = lvOf(id); if (lv >= lvTop(T)) return null;
  return T.tier >= 4 ? { pcs: 0, hyang: HYANG_NEED[lv], silver: MSILVER_NEED[lv] } : { pcs: PCS_NEED[lv], silver: SILVER_NEED[lv] };
}
const wildOk = id => TYPES[TYPE_IX[id]].tier < 4;
/* own pieces first; 만능 조각 (bought with 옥) cover what is missing for 일반 to 전설 */
function wildUse(id) { const n = needFor(id); if (!n || !wildOk(id)) return 0; return Math.max(0, n.pcs - pcsOf(id)); }
/* a mythic can be leveled once it is open for you; a hidden one once you have found it */
const mythLevelable = id => { const M = MYTH_BY[id]; return !!M && (M.secret ? !!SAVE.made[id] : mythOpenSelf(id)); };
function canLevel(id, own) {
  const n = needFor(id); if (!n || SAVE.silver < n.silver) return false;
  if (TYPES[TYPE_IX[id]].tier >= 4 && !mythLevelable(id)) return false;
  if (n.hyang) return (SAVE.hyang || 0) >= n.hyang;
  if (pcsOf(id) >= n.pcs) return true;
  return !own && wildOk(id) && pcsOf(id) + (SAVE.wild || 0) >= n.pcs;
}
function levelUp(id) {
  const n = needFor(id); if (!n || !canLevel(id)) return false;
  if (n.hyang) SAVE.hyang -= n.hyang;
  else { const w = Math.min(wildUse(id), SAVE.wild || 0); SAVE.wild = (SAVE.wild || 0) - w; SAVE.pcs[id] = pcsOf(id) + w - n.pcs; }
  SAVE.silver -= n.silver; SAVE.lv[id] = lvOf(id) + 1;
  applyLevels(lvOf);
  persist(); return true;
}
const PIECE_W = [1, 0.6, 0.35, 0.2];
/* pouch pieces lean toward the 고을 you have picked, so leveling for the next 고을 doesn't drown among everyone else */
function randomPieceId(minTier = 0) {
  const pool = LIVE.filter(T => T.tier < 4 && T.tier >= minTier);
  let tot = 0; for (const T of pool) tot += PIECE_W[T.tier];
  let r = Math.random() * tot; for (const T of pool) { if ((r -= PIECE_W[T.tier]) < 0) return T.id; }
  return pool[0].id;
}
function grantPieces(n, prefer) {
  const out = {};
  for (let i = 0; i < n; i++) { const id = prefer && prefer.length && Math.random() < 0.6 ? pick(prefer) : randomPieceId(); out[id] = (out[id] || 0) + 1; }
  for (const id in out) SAVE.pcs[id] = pcsOf(id) + out[id];
  return out;
}

/* stages */
function stageUnlocked(i) { return i <= (SAVE.stageMax || 0); }

/* daily quests */
const QUEST_POOL = [
  { id: 'k300', text: '도깨비 300마리 물리치기', stat: 'kills', goal: 300, silver: 300 },
  { id: 'k800', text: '도깨비 800마리 물리치기', stat: 'kills', goal: 800, silver: 600 },
  { id: 'w15', text: '한 판에 제 15 마당까지 버티기', stat: 'wave', goal: 15, silver: 300, max: true },
  { id: 'w25', text: '한 판에 제 25 마당까지 버티기', stat: 'wave', goal: 25, silver: 600, max: true },
  { id: 'w45', text: '한 판에 제 45 마당까지 버티기', stat: 'wave', goal: 45, silver: 900, max: true },
  { id: 'm20', text: '합성 20번 하기', stat: 'merges', goal: 20, silver: 300 },
  { id: 'c1', text: '신화 1번 조합하기', stat: 'crafts', goal: 1, silver: 400 },
  { id: 'c3', text: '신화 3번 조합하기', stat: 'crafts', goal: 3, silver: 700 },
  { id: 'g3', text: '굿 3번 벌이기', stat: 'guts', goal: 3, silver: 300 },
  { id: 'b1', text: '보스 1마리 잡기', stat: 'bossKills', goal: 1, silver: 400 },
  { id: 'b2', text: '보스 2마리 잡기', stat: 'bossKills', goal: 2, silver: 700 },
  { id: 'sm', text: '사물놀이패 조합하기', stat: 'made_samulpae', goal: 1, silver: 500 },
  { id: 'p2', text: '두 판 놀기', stat: 'games', goal: 2, silver: 250 },
  { id: 'd2', text: '도전 귀신 2마리 잡기', stat: 'chalWins', goal: 2, silver: 400 },
  { id: 'd5', text: '도전 귀신 5마리 잡기', stat: 'chalWins', goal: 5, silver: 700 },
  { id: 'j1', text: '경제 신화 조합하기', stat: 'made_eco', goal: 1, silver: 500 },
];
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function daySeed(k, salt) { let h = salt || 0; for (const ch of k) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return seeded(h % 2147483646 + 1); }
function ensureQuests() {
  const k = todayKey();
  if (SAVE.quests && SAVE.quests.day === k) return false;
  const rnd = daySeed(k), ids = [];
  while (ids.length < 3) { const q = QUEST_POOL[Math.floor(rnd() * QUEST_POOL.length)]; if (!ids.includes(q.id) && !ids.some(x => x[0] === q.id[0])) ids.push(q.id); }
  SAVE.quests = { day: k, list: ids.map(id => ({ id, prog: 0, claimed: false })) };
  return true;
}
function questDef(id) { return QUEST_POOL.find(q => q.id === id); }
function claimQuest(i) {
  const q = SAVE.quests && SAVE.quests.list[i]; if (!q || q.claimed) return null;
  const Q = questDef(q.id); if (q.prog < Q.goal) return null;
  q.claimed = true; gain(Q.silver, 0);
  const pcs = grantPieces(2);
  persist(); return { silver: Q.silver, pcs };
}
/* finishing all three daily quests leaves a little 옥 */
function bonusReady() { return !!SAVE.quests && SAVE.quests.list.every(q => q.claimed) && SAVE.qbonus !== SAVE.quests.day; }
function claimBonus() { if (!bonusReady()) return null; SAVE.qbonus = SAVE.quests.day; gain(0, 10); persist(); return { jade: 10 }; }
/* weekly quests: bigger goals, paid in 은전 and 옥 */
const WEEK_POOL = [
  { id: 'wb10', text: '보스 10마리 잡기', stat: 'bossKills', goal: 10, silver: 1500, jade: 25 },
  { id: 'wk5k', text: '도깨비 5,000마리 물리치기', stat: 'kills', goal: 5000, silver: 1500, jade: 20 },
  { id: 'wc8', text: '신화 8번 조합하기', stat: 'crafts', goal: 8, silver: 2000, jade: 30 },
  { id: 'wd15', text: '도전 귀신 15마리 잡기', stat: 'chalWins', goal: 15, silver: 1500, jade: 25 },
  { id: 'wx10', text: '출정 10번 이기기 · 여러 판 합쳐서', stat: 'caveWins', goal: 10, silver: 1500, jade: 25 },
  { id: 'wg7', text: '일곱 판 놀기', stat: 'games', goal: 7, silver: 1200, jade: 20 },
  { id: 'ww60', text: '한 판에 제 60 마당 넘기기', stat: 'wave', goal: 61, silver: 2500, jade: 40, max: true },
  { id: 'wi3k', text: '경제 신화로 엽전 3,000 벌기', stat: 'income', goal: 3000, silver: 1200, jade: 20 },
];
function weekKey() { const d = new Date(), back = (d.getDay() + 6) % 7; d.setDate(d.getDate() - back); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function ensureWeekly() {
  const k = weekKey();
  if (SAVE.weekly && SAVE.weekly.week === k) return false;
  const rnd = daySeed(k, 31), ids = [];
  while (ids.length < 3) { const q = WEEK_POOL[Math.floor(rnd() * WEEK_POOL.length)]; if (!ids.includes(q.id)) ids.push(q.id); }
  SAVE.weekly = { week: k, list: ids.map(id => ({ id, prog: 0, claimed: false })) };
  return true;
}
function weekDef(id) { return WEEK_POOL.find(q => q.id === id); }
function claimWeekly(i) {
  const q = SAVE.weekly && SAVE.weekly.list[i]; if (!q || q.claimed) return null;
  const Q = weekDef(q.id); if (!Q || q.prog < Q.goal) return null;
  q.claimed = true; gain(Q.silver, Q.jade);
  const pcs = grantPieces(4);
  persist(); return { silver: Q.silver, jade: Q.jade, pcs };
}
function untilWeek() { const d = new Date(), m = new Date(d); m.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7)); m.setHours(0, 0, 0, 0); const s = Math.max(0, (m - d) / 1000 | 0); return s >= 86400 ? `${s / 86400 | 0}일 ${(s % 86400) / 3600 | 0}시간` : `${s / 3600 | 0}시간 ${(s % 3600) / 60 | 0}분`; }
/* every 은전 and 옥 that comes in goes through here so the totals stay counted */
function gain(silver, jade) {
  if (silver) { SAVE.silver += silver; SAVE.stats.silverEarned = (SAVE.stats.silverEarned || 0) + silver; }
  if (jade) { SAVE.jade = (SAVE.jade || 0) + jade; SAVE.stats.jadeEarned = (SAVE.stats.jadeEarned || 0) + jade; }
}

/* attendance: a 7-day stamp card that keeps going even if you skip a day */
const ATT = [
  { silver: 300, text: '은전 300' }, { pcs: 3, text: '조각 3' }, { silver: 500, text: '은전 500' }, { pouch: 'small', text: '복주머니' },
  { jade: 10, text: '옥 10' }, { pcs: 6, text: '조각 6' }, { pouch: 'big', jade: 20, text: '큰 복주머니 · 옥 20' },
];
function attReady() { return SAVE.att.day !== todayKey(); }
function claimAtt() {
  if (!attReady()) return null;
  const idx = SAVE.att.n % 7, A = ATT[idx];
  SAVE.att = { day: todayKey(), n: SAVE.att.n + 1 };
  const out = { idx, A, silver: 0, jade: 0, pcs: null, cards: null };
  if (A.silver) { gain(A.silver, 0); out.silver = A.silver; }
  if (A.jade) { gain(0, A.jade); out.jade = A.jade; }
  if (A.pcs) out.pcs = grantPieces(A.pcs);
  if (A.pouch) out.cards = rollPouch(A.pouch);
  persist(); return out;
}

/* lucky pouches: how many cards come out is random, and now and then a pouch bursts double */
const POUCHES = {
  small: { name: '복주머니', cost: 600, min: 3, max: 8 },
  big: { name: '큰 복주머니', cost: 1200, min: 8, max: 16, guarantee: 2 },
  silk: { name: '비단 복주머니', jade: 30, min: 12, max: 20, guarantee: 3 },
};
const JACKPOT = 0.08;
const POUCH_HYANG = { small: 2, big: 5, silk: 10 };
function pouchCount(P) { return P.min + Math.round((Math.random() + Math.random()) / 2 * (P.max - P.min)); }
function rollPouch(kind) {
  const P = POUCHES[kind], jackpot = Math.random() < JACKPOT, n = Math.min(32, pouchCount(P) * (jackpot ? 2 : 1)), cards = [];
  for (let i = 0; i < n; i++) {
    let id;
    id = randomPieceId(P.guarantee && i === n - 1 && !cards.some(c => TYPES[TYPE_IX[c]].tier >= P.guarantee) ? P.guarantee : 0);
    cards.push(id);
  }
  for (const id of cards) SAVE.pcs[id] = pcsOf(id) + 1;
  cards.hyang = POUCH_HYANG[kind] * (jackpot ? 2 : 1); SAVE.hyang = (SAVE.hyang || 0) + cards.hyang;
  cards.newSeen = revealIn(SAVE);
  SAVE.stats.pouches = (SAVE.stats.pouches || 0) + 1;
  cards.jackpot = jackpot;
  return cards;
}
function pouchPrice(kind) { const P = POUCHES[kind]; return P.jade ? { jade: P.jade } : { silver: P.cost }; }
function canBuyPouch(kind) { const P = POUCHES[kind]; return P.jade ? (SAVE.jade || 0) >= P.jade : SAVE.silver >= P.cost; }
function buyPouch(kind = 'small') {
  const P = POUCHES[kind];
  if (!canBuyPouch(kind)) return null;
  if (P.jade) SAVE.jade -= P.jade; else SAVE.silver -= P.cost;
  const cards = rollPouch(kind);
  persist(); return cards;
}

/* 신화 해금 with 두루마리: once opened, a mythic is open in every 고을 */
function unlockMyth(id) {
  const M = MYTH_BY[id]; if (!M || M.secret || SAVE.mopen[id]) return false;
  const c = scrollCost(M); if ((SAVE.scroll || 0) < c) return false;
  SAVE.scroll -= c; SAVE.mopen[id] = 1; persist(); return true;
}
/* 옥 상점: 옥 is not only for treasure boxes */
const JADE_SHOP = { wild1: { jade: 6, n: 1, name: '만능 조각' }, wild10: { jade: 50, n: 10, name: '만능 조각 열 개' }, reroll: { jade: 10, name: '장터 새로 고치기' }, scroll: { jade: 60, name: '신화 두루마리', scroll: 1 } };
function buyJade(k) {
  const J = JADE_SHOP[k]; if (!J || (SAVE.jade || 0) < J.jade) return null;
  SAVE.jade -= J.jade;
  if (J.n) SAVE.wild = (SAVE.wild || 0) + J.n;
  if (J.scroll) SAVE.scroll = (SAVE.scroll || 0) + J.scroll;
  else { SAVE.mktN = (SAVE.mktN || 0) + 1; SAVE.market = null; ensureMarket(); }
  persist(); return J;
}
/* 유물: old treasures that strengthen every run. more copies raise the level */
const RELIC_LV = [0, 1, 3, 6, 10, 15];
const RELIC_MAX = 5;
/* 핵심 유물 first: 돈궤 grows the 엽전 you keep, 엽전검 turns the 엽전 you keep into attack.
   together they make saving a strategy, the way 금고 and 머니건 do in 운빨존많겜 */
const RELICS = [
  { id: 'dongwe', g: 2, core: true, name: '돈궤', era: '조선', desc: '마당이 끝날 때 가진 엽전이 불어나요', base: 0.045, per: 0.005, key: 'safe', pct: true, dec: 1,
    text: v => `마당 끝날 때 가진 엽전 +${(v * 100).toFixed(1)}%` },
  { id: 'yeopgeom', g: 2, core: true, name: '엽전검', era: '조선', desc: '가진 엽전만큼 모든 동료가 세져요', base: 0.0063, per: 0.0007, key: 'gun', pct: true,
    text: v => `엽전 100마다 공격력 +${(v * 100).toFixed(2)}%` },
  { id: 'cheongja', g: 2, name: '고려청자 매병', era: '고려', desc: '모든 동료 공격력', per: 0.06, key: 'atk', pct: true },
  { id: 'geumgwan', g: 2, name: '신라 금관', era: '신라', desc: '신화 공격력', per: 0.1, key: 'myth', pct: true },
  { id: 'hyangno', g: 2, name: '백제 금동대향로', era: '백제', desc: '보스에게 주는 피해', per: 0.1, key: 'boss', pct: true },
  { id: 'hahoetal', g: 1, name: '하회탈', era: '고려', desc: '일반·희귀 공격력', per: 0.1, gr: 0, pct: true },
  { id: 'sinjong', g: 1, name: '성덕대왕신종', era: '신라', desc: '영웅 공격력', per: 0.1, gr: 1, pct: true },
  { id: 'sasindo', g: 1, name: '고구려 사신도', era: '고구려', desc: '전설 공격력', per: 0.1, gr: 2, pct: true },
  { id: 'janggeom', g: 1, name: '이순신 장검', era: '조선', desc: '치명타 확률', per: 0.03, key: 'crit', pct: true },
  { id: 'honcheon', g: 1, name: '혼천의', era: '조선', desc: '궁극기 충전 속도', per: 0.08, key: 'ult', pct: true },
  { id: 'cheugugi', g: 0, name: '측우기', era: '조선', desc: '시작 엽전', per: 100, key: 'coins0' },
  { id: 'haerye', g: 0, name: '훈민정음 해례본', era: '조선', desc: '시작 혼', per: 1, key: 'hon0' },
  { id: 'angbu', g: 0, name: '앙부일구', era: '조선', desc: '보스 제한 시간', per: 3, key: 'bossTime', unit: '초' },
  { id: 'sangpyeong', g: 0, name: '상평통보', era: '조선', desc: '도깨비 처치 엽전', per: 0.08, key: 'kill', pct: true },
  { id: 'dalhang', g: 0, name: '백자 달항아리', era: '조선', desc: '판이 끝날 때 은전', per: 0.1, key: 'silver', pct: true },
  { id: 'jagyeok', g: 0, name: '자격루', era: '조선', desc: '출정 제한 시간', per: 4, key: 'exp', unit: '초' },
  { id: 'cheomseong', g: 0, name: '첨성대', era: '신라', desc: '굿이 될 확률', per: 0.05, key: 'gut', pct: true },
];
const relicVal = (r, lv) => (r.base || 0) + r.per * lv;
const RELIC_IX = {}; RELICS.forEach((r, i) => { RELIC_IX[r.id] = i; });
/* 유물 grades: a box rolls the grade first, then a treasure of that grade */
const RELIC_GRADE = [{ name: '보통', color: '#c9b48a', p: 0.62 }, { name: '귀함', color: '#6aa8ff', p: 0.30 }, { name: '국보', color: '#ffcf4a', p: 0.08 }];
const RELIC_PITY = 10;
/* level ups are bought: spare copies plus 은전, dearer for rarer treasures */
const RELIC_UP = { pcs: [0, 1, 2, 3, 5], silver: [0, 1500, 3500, 7000, 12000] }, RELIC_GMUL = [1, 1.4, 2];
const relicLv = id => (SAVE.rlv || {})[id] || 0;
const relicCopies = id => (SAVE.rcp || {})[id] || 0;
function relicNeed(id) { const lv = relicLv(id); if (!lv || lv >= RELIC_MAX) return null; const r = RELICS[RELIC_IX[id]]; return { pcs: RELIC_UP.pcs[lv], silver: Math.round(RELIC_UP.silver[lv] * RELIC_GMUL[r.g || 0] / 100) * 100 }; }
function canRelicUp(id) { const n = relicNeed(id); return !!n && relicCopies(id) >= n.pcs && SAVE.silver >= n.silver; }
function relicUp(id) {
  const n = relicNeed(id); if (!n || !canRelicUp(id)) return false;
  SAVE.rcp[id] = relicCopies(id) - n.pcs; SAVE.silver -= n.silver; SAVE.rlv[id] = relicLv(id) + 1;
  persist(); return true;
}
function relicText(r, lv) { const v = relicVal(r, lv); if (r.text) return r.text(v); return `${r.desc} ${r.minus ? '-' : '+'}${r.pct ? Math.round(v * 100) + '%' : fmtC(v) + (r.unit || '')}`; }
function relicBonuses() {
  const o = noRelics();
  for (const r of RELICS) { const lv = relicLv(r.id); if (!lv) continue; const v = relicVal(r, lv); if (r.gr != null) o.gr[r.gr] += v; else if (r.key in o) o[r.key] += v; }
  return o;
}
function relicSilverBonus() { return RELICS[RELIC_IX.dalhang].per * relicLv('dalhang'); }
function relicCount() { return RELICS.filter(r => relicLv(r.id) > 0).length; }
const RELIC_BOX = { one: { n: 1, jade: 50, name: '보물 상자' }, three: { n: 3, jade: 135, name: '보물 상자 셋' } };
function rollRelicGrade() {
  SAVE.rpity = (SAVE.rpity || 0) + 1;
  let g = 0; const r = Math.random();
  if (SAVE.rpity >= RELIC_PITY || r < RELIC_GRADE[2].p) g = 2; else if (r < RELIC_GRADE[2].p + RELIC_GRADE[1].p) g = 1;
  if (g === 2) SAVE.rpity = 0;
  return g;
}
function grantRelics(n) {
  const out = [];
  if (!SAVE.rlv) SAVE.rlv = {}; if (!SAVE.rcp) SAVE.rcp = {};
  for (let i = 0; i < n; i++) {
    /* a treasure already at the top level, with enough copies saved to get there, no longer drops */
    const want = r => { const lv = relicLv(r.id); if (lv >= RELIC_MAX) return false; let need = 0; for (let l = Math.max(1, lv); l < RELIC_MAX; l++) need += RELIC_UP.pcs[l]; return relicCopies(r.id) < need; };
    const g0 = rollRelicGrade();
    let pool = RELICS.filter(r => (r.g || 0) === g0 && want(r));
    /* a 국보 goes to a 핵심 유물 you still lack before anything else */
    if (g0 === 2) { const core = RELICS.filter(r => r.core && relicLv(r.id) === 0); if (core.length) pool = core; }
    for (let d = 1; !pool.length && d <= 2; d++) pool = RELICS.filter(r => want(r) && Math.abs((r.g || 0) - g0) === d);
    if (!pool.length) { gain(0, 20); out.push({ id: null, jade: 20 }); continue; }
    const r = pick(pool), isNew = relicLv(r.id) === 0;
    if (isNew) SAVE.rlv[r.id] = 1; else SAVE.rcp[r.id] = relicCopies(r.id) + 1;
    SAVE.relics[r.id] = (SAVE.relics[r.id] || 0) + 1;
    out.push({ id: r.id, g: r.g || 0, isNew, lv: relicLv(r.id) });
  }
  return out;
}
function buyRelicBox(kind) {
  const B = RELIC_BOX[kind]; if (!B || (SAVE.jade || 0) < B.jade) return null;
  SAVE.jade -= B.jade; SAVE.stats.relicBoxes = (SAVE.stats.relicBoxes || 0) + 1;
  const got = grantRelics(B.n); persist(); return got;
}

/* 고을 길: the first time you beat each boss, a reward waits in the yard */
const ROAD = [
  { silver: 500, jade: 10 }, { silver: 800, jade: 15, pouch: 'small', scroll: 1 }, { silver: 1200, jade: 20 }, { silver: 1600, jade: 25, relic: 1, scroll: 1 },
  { silver: 2000, jade: 30 }, { silver: 2500, jade: 35, pouch: 'big', scroll: 1 }, { silver: 3000, jade: 40 }, { silver: 5000, jade: 60, relic: 2, scroll: 1 },
];
const roadMul = st => 1 + 0.4 * st;
const ROAD_HYANG = [10, 15, 20, 25, 30, 40, 50, 80];
function roadState(st, k) {
  if (SAVE.road[st + '-' + k]) return 'claimed';
  return (SAVE.bossBest[st] || 0) >= k * 10 ? 'ready' : 'locked';
}
function roadReward(st, k) { const Rw = ROAD[k - 1], m = roadMul(st); return { silver: Math.round(Rw.silver * m / 10) * 10, jade: Math.round(Rw.jade * m), hyang: Math.round(ROAD_HYANG[k - 1] * m), pouch: Rw.pouch || null, relic: Rw.relic || 0, scroll: Rw.scroll || 0 }; }
function roadReady(st) { let n = 0; for (let s2 = 0; s2 < STAGES.length; s2++) { if (st != null && s2 !== st) continue; for (let k = 1; k <= 8; k++) if (roadState(s2, k) === 'ready') n++; } return n; }
function claimRoad(st, k) {
  if (roadState(st, k) !== 'ready') return null;
  const w = roadReward(st, k);
  SAVE.road[st + '-' + k] = 1;
  gain(w.silver, w.jade);
  if (w.scroll) SAVE.scroll = (SAVE.scroll || 0) + w.scroll;
  SAVE.hyang = (SAVE.hyang || 0) + w.hyang;
  const out = Object.assign({}, w, { cards: w.pouch ? rollPouch(w.pouch) : null, relics: w.relic ? grantRelics(w.relic) : null });
  persist(); return out;
}

/* daily market: three pieces offers that change every day */
const MARKET_PRICE = [60, 100, 180, 300];
function ensureMarket() {
  const k = todayKey();
  if (SAVE.market && SAVE.market.day === k && SAVE.market.offers.every(O => TYPE_IX[O.id] != null && !TYPES[TYPE_IX[O.id]].old && TYPES[TYPE_IX[O.id]].tier < 4)) return SAVE.market;
  const rnd = daySeed(k, 7 + (SAVE.mktN || 0) * 31), seen = LIVE.filter(T => T.tier < 4 && SAVE.seen[T.id]);
  const pool = t => { const a = (seen.length >= 6 ? seen : LIVE).filter(T => T.tier === t); return a.length ? a : LIVE.filter(T => T.tier === t); };
  const slots = [[rnd() < 0.5 ? 0 : 1, 5], [rnd() < 0.5 ? 1 : 2, 3], [rnd() < 0.6 ? 2 : 3, 2]];
  const offers = slots.map(([t, n]) => { const P = pool(t), T = P[Math.floor(rnd() * P.length)]; return { id: T.id, n, price: Math.round(MARKET_PRICE[t] * n * 0.9 / 10) * 10, bought: false }; });
  SAVE.market = { day: k, offers };
  return SAVE.market;
}
function buyOffer(i) {
  const M = ensureMarket(), O = M.offers[i];
  if (!O || O.bought || SAVE.silver < O.price) return null;
  SAVE.silver -= O.price; O.bought = true; SAVE.pcs[O.id] = pcsOf(O.id) + O.n;
  persist(); return O;
}

/* 길잡이: a short chain for new players, one step at a time. the last step pays 신화 두루마리 to open a mythic of your choice */
const GUIDE = [
  { text: '첫 판 놀기', test: s => s.stats.games >= 1, silver: 300 },
  { text: '제 10 마당 보스 잡기', test: s => (s.stats.best || 0) >= 11, silver: 500, hyang: 10 },
  { text: '한 판에서 신화 조합하기', test: s => (s.stats.crafts || 0) >= 1, hyang: 20 },
  { text: '도감에서 동료 하나 레벨 올리기', test: s => Object.keys(s.lv || {}).some(id => (s.lv[id] || 1) >= 2), silver: 600 },
  { text: '제 20 마당 보스 잡기', test: s => (s.stats.best || 0) >= 21, jade: 20, hyang: 10 },
  { text: '굿 열 번 벌이기 · 여러 판 합쳐서', test: s => (s.stats.guts || 0) >= 10, hyang: 20 },
  { text: '제 30 마당 넘기기', test: s => (s.stats.best || 0) >= 31, silver: 1000 },
  { text: '제 40 마당 넘기기', test: s => (s.stats.best || 0) >= 41, scroll: 2, jade: 20 },
];
const guideStep = () => GUIDE[SAVE.guide || 0] || null;
const guideReady = () => { const S = guideStep(); return !!S && S.test(SAVE); };
function claimGuide() {
  const S = guideStep(); if (!S || !S.test(SAVE)) return null;
  SAVE.guide = (SAVE.guide || 0) + 1;
  gain(S.silver || 0, S.jade || 0);
  if (S.hyang) SAVE.hyang = (SAVE.hyang || 0) + S.hyang;
  if (S.scroll) SAVE.scroll = (SAVE.scroll || 0) + S.scroll;
  persist(); return S;
}

/* achievements: paid in 은전 and 옥. numeric ones show how far along you are */
const stat = (s, k) => (s.stats && s.stats[k]) || 0;
const NUM = (id, text, key, goal, silver, jade) => ({ id, text, test: s => stat(s, key) >= goal, prog: s => [Math.min(goal, stat(s, key)), goal], silver, jade });
const lvCount = (s, min, myth) => LIVE.filter(T => (myth ? T.tier >= 4 : T.tier < 4) && (s.lv[T.id] || 1) >= min).length;
const ACHS = [
  { id: 'first', text: '첫 판 놀기', test: s => s.stats.games >= 1, silver: 200, jade: 5 },
  ...[[10, 300, 5], [20, 600, 5], [30, 1000, 10], [40, 1500, 10], [50, 2000, 15], [60, 2500, 20], [70, 3000, 25]].map(([w, sv, jd]) => ({ id: 'w' + w, text: `제 ${w} 마당 넘기기`, test: s => s.stats.best >= w + 1, prog: s => [Math.max(0, Math.min(w, (s.stats.best || 1) - 1)), w], silver: sv, jade: jd })),
  ...STAGES.map((S, i) => ({ id: i ? 'st' + i : 'win', text: `${S.name} 제 40 마당 넘기기`, test: s => (s.stageBest[i] || 0) >= 41 || !!(s.clear40 || {})[i], silver: 1000 + i * 500, jade: 10 })),
  ...STAGES.map((S, i) => ({ id: 'clr' + i, text: `${S.name} 80 마당 모두 지키기`, test: s => !!(s.stageClear || {})[i], silver: 4000 + i * 2000, jade: 50 + i * 25 })),
  NUM('k1k', '도깨비 1,000마리 물리치기', 'kills', 1000, 400, 5),
  NUM('k10k', '도깨비 10,000마리 물리치기', 'kills', 10000, 1500, 10),
  NUM('k50k', '도깨비 50,000마리 물리치기', 'kills', 50000, 3000, 20),
  NUM('k100k', '도깨비 100,000마리 물리치기', 'kills', 100000, 5000, 30),
  NUM('boss10', '보스 10마리 잡기', 'bossKills', 10, 500, 5),
  NUM('boss50', '보스 50마리 잡기', 'bossKills', 50, 1500, 15),
  NUM('boss150', '보스 150마리 잡기', 'bossKills', 150, 3000, 30),
  NUM('craft10', '신화 10번 조합하기', 'crafts', 10, 800, 10),
  NUM('craft50', '신화 50번 조합하기', 'crafts', 50, 2500, 25),
  ...MYTHS.filter(M => !M.tale && !M.beast).map(M => ({ id: 'made_' + M.id, text: M.secret ? '숨은 신화 하나 찾기' + (M.id === 'bihyeong' ? ' · 도깨비의 왕' : ' · 바다를 만든 할망') : `${TYPES[M.ix].name} 처음 조합하기`, test: s => (s.made[M.id] || 0) >= 1, silver: M.secret ? 1500 : 500, jade: M.secret ? 20 : 5 })),
  { id: 'mythAll', text: '신수와 전래동화 말고 신화 열일곱을 모두 조합하기', test: s => MYTHS.filter(M => !M.tale && !M.beast).every(M => s.made[M.id]), prog: s => [MYTHS.filter(M => !M.tale && !M.beast && s.made[M.id]).length, MYTHS.filter(M => !M.tale && !M.beast).length], silver: 3000, jade: 30 },
  { id: 'myth26', text: '신화 스물여섯을 모두 조합하기', test: s => MYTHS.every(M => s.made[M.id]), prog: s => [MYTHS.filter(M => s.made[M.id]).length, MYTHS.length], silver: 20000, jade: 150 },
  ...MYTHS.filter(M => M.beast).map(M => ({ id: 'made_' + M.id, text: `신수 ${TYPES[M.ix].name} 부르기`, test: s => (s.made[M.id] || 0) >= 1, silver: 3000, jade: 25 })),
  { id: 'beastAll', text: '신수 다섯을 모두 부르기', test: s => MYTHS.filter(M => M.beast).every(M => s.made[M.id]), prog: s => [MYTHS.filter(M => M.beast && s.made[M.id]).length, MYTHS.filter(M => M.beast).length], silver: 10000, jade: 60 },
  ...MYTHS.filter(M => M.tale).map(M => ({ id: 'made_' + M.id, text: `전래동화 ${TYPES[M.ix].name} 깨우기`, test: s => (s.made[M.id] || 0) >= 1, silver: 5000, jade: 40 })),
  { id: 'taleAll', text: '전래동화를 모두 깨우기', test: s => MYTHS.filter(M => M.tale).every(M => s.made[M.id]), prog: s => [MYTHS.filter(M => M.tale && s.made[M.id]).length, MYTHS.filter(M => M.tale).length], silver: 15000, jade: 100 },
  { id: 'chalHard', text: '도전 귀신 강철이 잡기', test: s => stat(s, 'chalHard') >= 1 || stat(s, 'chalTop') >= 3, silver: 800, jade: 5 },
  { id: 'chalJine', text: '도전 귀신 천년 지네 잡기', test: s => stat(s, 'chalTop') >= 4, silver: 1200, jade: 10 },
  { id: 'chalYacha', text: '도전 귀신 야차 잡기', test: s => stat(s, 'chalTop') >= 5, silver: 2000, jade: 20 },
  NUM('chal20', '도전 귀신 20마리 잡기', 'chalWins', 20, 600, 5),
  NUM('chal100', '도전 귀신 100마리 잡기', 'chalWins', 100, 2000, 15),
  NUM('cave5', '출정 5단계 깨기', 'caveTop', 5, 800, 10),
  NUM('cave8', '출정 8단계 깨기', 'caveTop', 8, 1500, 20),
  NUM('cave12', '출정 12단계 깨기', 'caveTop', 12, 3000, 30),
  { id: 'lv5', text: '동료 하나를 5레벨까지 키워 각성하기', test: s => Object.values(s.lv).some(l => l >= 5), silver: 500, jade: 5 },
  { id: 'lv5x10', text: '동료 10명을 5레벨 이상으로 키우기', test: s => lvCount(s, 5) >= 10, prog: s => [Math.min(10, lvCount(s, 5)), 10], silver: 2000, jade: 20 },
  { id: 'mythLv5', text: '신화 하나를 5레벨까지 키우기', test: s => lvCount(s, 5, true) >= 1, silver: 1500, jade: 15 },
  { id: 'lv10', text: '동료 하나를 10레벨까지 키우기', test: s => Object.values(s.lv).some(l => l >= 10), silver: 2000, jade: 20 },
  { id: 'lv12', text: '동료 하나를 12레벨까지 키우기', test: s => lvCount(s, 12) >= 1, silver: 4000, jade: 30 },
  { id: 'mythLv10', text: '신화 하나를 10레벨까지 키워 신물 얻기', test: s => lvCount(s, 10, true) >= 1, silver: 5000, jade: 40 },
  { id: 'seen20', text: '동료와 신화 20명 만나기', test: s => LIVE.filter(T => s.seen[T.id]).length >= 20, prog: s => [Math.min(20, LIVE.filter(T => s.seen[T.id]).length), 20], silver: 500, jade: 5 },
  { id: 'seen', text: '일반부터 전설까지 열아홉 동료 모두 만나기', test: s => LIVE.filter(T => T.tier < 4).every(T => s.seen[T.id]), prog: s => [LIVE.filter(T => T.tier < 4 && s.seen[T.id]).length, LIVE.filter(T => T.tier < 4).length], silver: 1000, jade: 15 },
  { id: 'foes', text: '도깨비 도감 모두 채우기', test: s => FOE_KEYS.every(k => (s.foes || {})[k]), prog: s => [FOE_KEYS.filter(k => (s.foes || {})[k]).length, FOE_KEYS.length], silver: 1500, jade: 15 },
  { id: 'relic3', text: '유물 3종 모으기', test: s => RELICS.filter(r => (s.rlv || {})[r.id]).length >= 3, prog: s => [Math.min(3, RELICS.filter(r => (s.rlv || {})[r.id]).length), 3], silver: 800, jade: 10 },
  { id: 'relic8', text: '유물 8종 모으기', test: s => RELICS.filter(r => (s.rlv || {})[r.id]).length >= 8, prog: s => [Math.min(8, RELICS.filter(r => (s.rlv || {})[r.id]).length), 8], silver: 1500, jade: 20 },
  { id: 'relicAll', text: '유물 15종 모두 모으기', test: s => RELICS.every(r => (s.rlv || {})[r.id]), prog: s => [RELICS.filter(r => (s.rlv || {})[r.id]).length, RELICS.length], silver: 3000, jade: 40 },
  { id: 'relicMax', text: '유물 하나를 5레벨까지 올리기', test: s => RELICS.some(r => ((s.rlv || {})[r.id] || 0) >= RELIC_MAX), silver: 2000, jade: 30 },
  NUM('silver50k', '은전 모두 50,000 벌기', 'silverEarned', 50000, 1000, 10),
  NUM('pouch10', '복주머니 10번 열기', 'pouches', 10, 500, 5),
  NUM('pouch50', '복주머니 50번 열기', 'pouches', 50, 1500, 15),
  NUM('income5k', '경제 신화로 엽전 5,000 벌기', 'income', 5000, 800, 10),
  { id: 'att7', text: '출석 도장 7번 찍기', test: s => (s.att && s.att.n || 0) >= 7, prog: s => [Math.min(7, s.att && s.att.n || 0), 7], silver: 500, jade: 10 },
  { id: 'att30', text: '출석 도장 30번 찍기', test: s => (s.att && s.att.n || 0) >= 30, prog: s => [Math.min(30, s.att && s.att.n || 0), 30], silver: 2000, jade: 30 },
  NUM('games10', '열 판 놀기', 'games', 10, 500, 5),
  NUM('games50', '쉰 판 놀기', 'games', 50, 1500, 15),
  NUM('games100', '백 판 놀기', 'games', 100, 3000, 30),
];
function claimAch(id) {
  const A = ACHS.find(a => a.id === id); if (!A || SAVE.ach[id] || !A.test(SAVE)) return null;
  SAVE.ach[id] = 1; gain(A.silver, A.jade || 0); persist(); return { silver: A.silver, jade: A.jade || 0 };
}
function claimable() {
  let n = 0;
  if (SAVE.quests) SAVE.quests.list.forEach(q => { const Q = questDef(q.id); if (Q && !q.claimed && q.prog >= Q.goal) n++; });
  if (SAVE.weekly) SAVE.weekly.list.forEach(q => { const Q = weekDef(q.id); if (Q && !q.claimed && q.prog >= Q.goal) n++; });
  if (bonusReady()) n++;
  ACHS.forEach(A => { if (!SAVE.ach[A.id] && A.test(SAVE)) n++; });
  if (attReady()) n++;
  return n + roadReady() + (guideReady() ? 1 : 0);
}

/* enemy codex keys */
const FOE_KEYS = [...FOES.map((F, i) => 'f' + i), ...Object.keys(BOSS_DEF).map(k => 'b_' + k), ...CHALS.map(C => 'c_' + C.id)];
function foeInfo(key) {
  if (key[0] === 'f') { const F = FOES[+key.slice(1)]; return { name: F.name, desc: F.desc, kind: '도깨비', where: (() => { const i = STAGES.findIndex(S => S.special === +key.slice(1)); return i > 0 ? STAGES[i].name : '모든 고을'; })() }; }
  if (key[0] === 'b') { const k = key.slice(2), B = BOSS_DEF[k]; return { name: B.name, desc: B.note, kind: '보스', where: STAGES.filter(S => Object.values(S.bosses).includes(k)).map(S => S.name).join(' · ') }; }
  const C = CHALS.find(c => c.id === key.slice(2)); return { name: C.name, desc: C.desc, kind: '도전 귀신', where: `도전 · ${C.level}` };
}

/* end of a game */
function finishGame() {
  const st = G.stats, wave = G.wave, win = G.phase === 'win', S = STAGES[G.stage], reached = win ? LAST_WAVE + 1 : wave;
  const roadBefore = roadReady();
  SAVE.stats.games++; SAVE.stats.kills += st.kills; SAVE.stats.crafts += st.crafts; SAVE.stats.guts = (SAVE.stats.guts || 0) + (st.guts || 0);
  SAVE.stats.best = Math.max(SAVE.stats.best, reached);
  SAVE.stageBest[G.stage] = Math.max(SAVE.stageBest[G.stage] || 0, reached);
  SAVE.bossBest[G.stage] = Math.max(SAVE.bossBest[G.stage] || 0, win ? LAST_WAVE : Math.floor((wave - 1) / 10) * 10);
  SAVE.stats.bossKills = (SAVE.stats.bossKills || 0) + st.bossKills;
  SAVE.stats.income = (SAVE.stats.income || 0) + (st.income || 0);
  SAVE.stats.chalTop = Math.max(SAVE.stats.chalTop || 0, st.chalTop || 0);
  SAVE.stats.caveTop = Math.max(SAVE.stats.caveTop || 0, st.caveTop || 0);
  SAVE.stats.caveWins = (SAVE.stats.caveWins || 0) + (G.exp ? G.exp.wins : 0);
  let firstClear = false, unlocked = -1;
  if (win) {
    SAVE.stats.wins++;
    if (!SAVE.stageClear[G.stage]) { SAVE.stageClear[G.stage] = 1; firstClear = true; }
    if (G.stage + 1 < STAGES.length && SAVE.stageMax < G.stage + 1) { SAVE.stageMax = G.stage + 1; unlocked = G.stage + 1; }
  }
  SAVE.stats.chalWins = (SAVE.stats.chalWins || 0) + st.chalWins; SAVE.stats.chalHard = (SAVE.stats.chalHard || 0) + st.chalHard;
  const newSeen = Object.keys(st.seen).filter(id => !SAVE.seen[id]);
  for (const id in st.seen) SAVE.seen[id] = 1;
  const newFoes = Object.keys(st.foeSeen).filter(k => !SAVE.foes[k]);
  for (const k in st.foeSeen) SAVE.foes[k] = 1;
  const newMyth = [];
  for (const id in st.crafted) { if (!SAVE.made[id]) newMyth.push(id); SAVE.made[id] = (SAVE.made[id] || 0) + st.crafted[id]; }
  const seenIds = Object.keys(st.seen).filter(id => TYPE_IX[id] != null && TYPES[TYPE_IX[id]].tier < 4 && !TYPES[TYPE_IX[id]].old);
  const pieces = grantPieces(Math.round((2 + Math.floor(wave / 4) + G.stage) * 1.3), seenIds);
  /* 향 for mythic levels: how far you got, bosses, and mythics you made */
  const hyang = Math.floor(wave / 5) + st.bossKills * 2 + st.crafts * 2 + (firstClear ? 30 : 0) + G.stage * 2 + (st.missions || 0);
  SAVE.hyang = (SAVE.hyang || 0) + hyang;
  const revealed = revealIn(SAVE); SAVE.silver -= revealed.length * 100; newSeen.push(...revealed);
  const base = Math.round((10 + wave * 4 + st.bossKills * 15 + st.crafts * 10 + (win ? 120 : 0)) * 10 * S.reward / 10) * 10;
  const relicBonus = Math.round(base * relicSilverBonus() / 10) * 10;
  const clearBonus = firstClear ? 4000 + G.stage * 2000 : 0;
  const silver = base + relicBonus + newSeen.length * 100 + newFoes.length * 50 + st.silverBonus + clearBonus;
  const jade = (st.jade || 0) + (firstClear ? 30 : 0);
  gain(silver, jade);
  ensureQuests(); ensureWeekly();
  const madeEco = Object.keys(st.crafted).filter(id => TYPES[TYPE_IX[id]].role === 'eco').reduce((a, id) => a + st.crafted[id], 0);
  const add = { kills: st.kills, merges: st.merges, crafts: st.crafts, guts: st.guts, bossKills: st.bossKills, games: 1, made_samulpae: st.crafted.samulpae || 0, chalWins: st.chalWins, made_eco: madeEco, income: st.income || 0, caveWins: G.exp ? G.exp.wins : 0 };
  const questDone = [];
  const bump = (list, def) => { for (const q of list) { const Q = def(q.id); if (!Q || q.claimed) continue; const before = q.prog; q.prog = Q.max ? Math.max(q.prog, reached) : q.prog + (add[Q.stat] || 0); if (q.prog >= Q.goal && before < Q.goal) questDone.push(Q.text); } };
  bump(SAVE.quests.list, questDef); bump(SAVE.weekly.list, weekDef);
  persist();
  return { silver, jade, hyang, base, relicBonus, pieces, newMyth, newSeen, newFoes, questDone, win, wave, chalSilver: st.silverBonus, firstClear, clearBonus, unlocked, roadNew: roadReady() - roadBefore };
}

/* helpers */
function levelableCount() { return LIVE.filter(T => canLevel(T.id, true) && (T.tier < 4 ? SAVE.seen[T.id] : true)).length; }
function codexCount() { return LIVE.filter(T => SAVE.seen[T.id]).length; }
function foeCount() { return FOE_KEYS.filter(k => SAVE.foes[k]).length; }

