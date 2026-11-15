/* ================= DOM UI, lobby, loop, boot ================= */
const $ = id => document.getElementById(id);
const el = {
  wave: $('waveLabel'), timer: $('timer'), coins: $('coins'), hon: $('hon'), gauge: $('gauge'), gaugeFill: $('gaugeFill'), gaugeText: $('gaugeText'),
  bossRow: $('bossRow'), bossName: $('bossName'), bossFill: $('bossFill'), bossTime: $('bossTime'), info: $('info'),
  summonBtn: $('summonBtn'), summonCost: $('summonCost'), mythBtn: $('mythBtn'), mythBadge: $('mythBadge'), mythSub: $('mythSub'), gutBtn: $('gutBtn'), gutCost: $('gutCost'), ups: $('ups'),
  speedBtn: $('speedBtn'), pauseBtn: $('pauseBtn'), soundBtn: $('soundBtn'), codexBtn: $('codexBtn'),
  toast: $('toast'), banner: $('banner'), bMain: $('bMain'), bSub: $('bSub'), vignette: $('vignette'),
  lobby: $('lobby'), rsheet: $('rsheet'), rlist: $('rlist'), codexOv: $('codexOv'), codexBody: $('codexBody'), endOv: $('endOv'),
  chalBtn: $('chalBtn'), chalBadge: $('chalBadge'), chalSub: $('chalSub'), csheet: $('csheet'), clist: $('clist'), rewardOv: $('rewardOv'), gsheet: $('gsheet'), glist: $('glist'), gHon: $('gHon'), ucard: $('ucard'),
  gutFam: $('gutFam'), pouchOv: $('pouchOv'),
};
const cache = {};
function setText(node, key, v) { if (cache[key] !== v) { cache[key] = v; node.textContent = v; } }
function setClass(node, key, cls, on) { const k = key + cls; if (cache[k] !== on) { cache[k] = on; node.classList.toggle(cls, on); } }
let toastT = 0;
toast = msg => { el.toast.textContent = msg; el.toast.classList.add('is-on'); toastT = 2.4; };
function showBanner(main, sub, boss, myth) {
  el.bMain.textContent = main; el.bSub.textContent = sub || ''; el.bSub.hidden = !sub;
  el.banner.classList.toggle('is-boss', !!boss); el.banner.classList.toggle('is-myth', !!myth);
  el.banner.classList.remove('show'); void el.banner.offsetWidth; el.banner.classList.add('show');
}
let vig = 0;
function pulseVignette() { vig = 1.1; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PAUSE_SVG = '<svg viewBox="0 0 14 14" aria-hidden="true"><rect x="2" y="1" width="3.5" height="12" rx="1"/><rect x="8.5" y="1" width="3.5" height="12" rx="1"/></svg>';
const PLAY_SVG = '<svg viewBox="0 0 14 14" aria-hidden="true"><path d="M3 1.5v11l9-5.5z"/></svg>';
const HINTS = [
  '같은 동료는 나오면 알아서 한 칸에 쌓여요. 3명이 모이면 칸 테두리가 하얗게 빛나요',
  '고을마다 80 마당이에요. 제 41 마당부터는 깊은 마당이라 온갖 도깨비가 섞여 와요',
  '보스를 처음 잡을 때마다 마당의 고을 길에 보상이 쌓여요. 옥과 향도 나와요',
  '옥으로 보물 상자를 열면 유물이 나와요. 유물은 모든 판을 세게 해 줘요',
  '신화 조합표에 숨은 신화가 있어요. 재료를 우연히 모으면 조합이 떠요',
  '소환만 해서는 깊은 마당을 못 버텨요. 신화를 조합해야 해요',
  '하얗게 빛나는 칸을 두 번 누르면 윗등급 동료로 합성돼요',
  '강화는 등급마다 따로예요. 일반·희귀, 영웅, 전설, 신화 넷이에요',
  '신화는 합성으로는 안 나와요. 신화 버튼에서 조합표를 보세요',
  '신화 재료로 쓸 동료는 합성하지 말고 하나씩 남겨 두세요',
  '모든 고을에 똑같은 동료 19명이 나와요. 신화 26가지도 어디서든 만들 수 있어요',
  '신화 조합표 위의 광역 보스 제어 경제를 누르면 그 역할 신화만 보여요',
  '가운데 칸은 길에서 멀어요. 사거리가 긴 각시나 수군 궁수를 두세요',
  '상모꾼과 사물놀이패는 자기 둘레만 쳐요. 길가 칸에 두세요',
  '선비 둘레 여덟 칸에 공격형 동료를 모으면 더 빨리 때려요',
  '소환 운을 올리면 높은 등급이 더 잘 나와요',
  '도전 버튼으로 귀신을 불러 잡으면 엽전과 혼을 더 받아요. 아래 귀신일수록 세고 보상도 커요',
  '도전 창에서 동료를 도깨비굴에 출정 보낼 수 있어요. 층을 깰수록 보상이 커져요',
  '출정은 여러 칸을 같이 보낼 수 있어요. 숫자를 더해서 100%가 넘으면 이겨요',
  '무당이 부정을 씌우면 물귀신이 다시 일어나지 못하고 이무기도 체력이 안 차요',
  '사물놀이패는 마당의 일반·희귀 동료를, 팔도 의병은 영웅 동료를 세게 해 줘요',
  '신화 아래 파란 막대가 차면 궁극기가 저절로 터져요',
  '쇠도깨비와 불가살이에겐 영웅 이상 동료가 잘 들어요',
  '재수굿은 희귀 60%, 대동굿은 영웅 20%, 별신굿은 전설 10%예요. 꽝이 나도 정성이 쌓여요',
  '정성이 가득 차면 다음 굿은 꼭 돼요. 별신굿에 쓰면 전설이 나와요',
  '소환 운은 5단계까지 엽전, 6단계부터 10단계까지는 혼으로 올려요',
  '마당 위 임무 세 개를 끝내면 엽전과 혼을 받아요',
  '도깨비를 누르면 남은 체력을 볼 수 있어요',
  '돌하르방 둘레 여덟 칸 동료는 보스와 도전 귀신을 더 세게 때려요. 보스 잡을 동료 옆에 두세요',
  '김선달은 가진 엽전에 이자를 붙여 줘요. 엽전을 조금 모아 두면 더 벌어요',
  '장보고의 무역선은 혼을 실어 와요. 굿을 더 자주 벌일 수 있어요',
  '전설 둘을 모으면 신수를, 신화를 모으면 전래동화를 깨울 수 있어요',
];

/* ---------- info bar ---------- */
function refreshInfo() {
  if (G.phase === 'play' && R.pickExp) {
    R.pickSel = R.pickSel.filter(c => G.units[c]);
    const F = caveFloor(), sel = R.pickSel, q = partyRatio(sel), pct = Math.round(q * 100), key = 'pick' + F.n + ':' + sel.join(',') + ':' + pct;
    if (cache.infoKey === key) return;
    cache.infoKey = key;
    const verdict = !sel.length ? `동료를 눌러 고르세요. 최대 ${EXP_MAX}칸` : q >= 1.3 ? `합계 ${pct}% · 넉넉해요` : q >= 1 ? `합계 ${pct}% · 빠듯해요` : `합계 ${pct}% · 아직 모자라요`;
    const B = partyBuffs(sel), bl = [];
    if (B.spd) bl.push(`선비 공속 +${25 * Math.min(2, B.spd)}%`);
    if (B.dmg) bl.push(`무동 +${20 * Math.min(2, B.dmg)}%`);
    if (B.sot) bl.push(`솟대 +${10 * Math.min(2, B.sot)}%`);
    if (B.bo) bl.push(`돌하르방 +${15 * Math.min(2, B.bo)}%`);
    if (B.mark) bl.push(`${B.markBy} 받는 피해 +${Math.round(B.mark * 100)}%`);
    if (B.curse) bl.push(`${B.curseBy} 부정 +${Math.round(B.curse * 100)}%`);
    el.info.innerHTML = `<img alt="" src="${foePortraitURL(F.key, 40)}"><div class="it"><span class="l1"><b>굴 ${F.n}층 ${esc(F.name)}</b></span><small>${verdict}</small><small${bl.length ? ' style="color:#9fe8cf"' : ''}>${bl.length ? '같이 간 버프 ' + bl.join(' · ') : '숫자를 더해서 100%가 넘으면 이겨요'}</small></div><div class="ibtns"><button class="mergebtn" type="button" id="expGoBtn" ${sel.length ? '' : 'disabled'}>출발</button><button class="sell" type="button" id="expCancel">취소</button></div>`;
    $('expCancel').addEventListener('click', () => { R.pickExp = false; R.pickSel = []; cache.infoKey = ''; refreshInfo(); });
    $('expGoBtn').addEventListener('click', () => { if (startExp(R.pickSel.slice())) { R.pickExp = false; R.pickSel = []; } cache.infoKey = ''; refreshInfo(); });
    return;
  }
  const r = G.exp && G.exp.run;
  if (G.phase === 'play' && R.expInfo && r && r.cells && G.sel < 0) {
    const key = 'exp' + r.floor + ':' + Math.ceil(r.t) + ':' + Math.ceil(r.hp / r.max * 100);
    if (cache.infoKey === key) return;
    cache.infoKey = key;
    const T = TYPES[r.units[0].t], names = r.units.map(u => TYPES[u.t].name + (u.c > 1 ? '×' + u.c : ''));
    el.info.innerHTML = `<img alt="" src="${portraitURL(T.id, 40)}"><div class="it"><span class="l1"><b>${r.units.length > 1 ? `${r.units.length}명 출정 중` : `${esc(names[0])} 출정 중`}</b></span><small>굴 ${r.floor}층 ${esc(r.name)} · 남은 체력 ${Math.max(0, Math.ceil(r.hp / r.max * 100))}% · ${Math.ceil(r.t)}초 남음</small><small>${r.units.length > 1 ? esc(names.join(', ')) : '이기든 지든 이 칸으로 돌아와요'}</small></div>`;
    return;
  }
  const u = G.sel >= 0 ? G.units[G.sel] : null;
  if (R.foeSel && (R.foeSel.dead || !G.foes.includes(R.foeSel) || u)) R.foeSel = null;
  if (!u && R.foeSel && G.phase === 'play') { foeInfoBar(R.foeSel); return; }
  if (!u || G.phase !== 'play') {
    const h = HINTS[Math.max(0, G.wave - 1) % HINTS.length];
    if (cache.infoKey !== 'h' + h) { cache.infoKey = 'h' + h; el.info.innerHTML = `<span class="it">${esc(h)}</span>`; }
    return;
  }
  const T = TYPES[u.t], Tr = TIERS[T.tier], cap = capOf(u.t), canM = canMergeAt(G.sel);
  const armed = !!cache.sellArm && cache.sellArm.id === u.id && performance.now() < cache.sellArm.until;
  const key = u.id + ':' + u.c + ':' + killsOf(u) + ':' + earnOf(u) + ':' + G.up.join(',') + ':' + G.spd[G.sel] + ':' + G.dmgN[G.sel] + ':' + gradeMulOf(T) + ':' + armed;
  if (cache.infoKey === key) return;
  cache.infoKey = key;
  const dmg = dmgOf(u.t, G.sel);
  const lvN = lvOf(T.id);
  el.info.innerHTML = `<img alt="" src="${portraitURL(T.id, 40)}"><div class="it"><span class="l1"><b>${esc(T.name)}</b>${cap > 1 ? `<span class="tchip stackchip">${u.c}/${cap}</span>` : ''}<span class="tchip" style="--g:${Tr.color}">${Tr.name}</span>${roleChip(T)}</span><small><span data-tip="${T.id}">${esc(T.skill)}</span> · Lv ${lvN}${lvTag(T, lvN)} · ${fmtC(killsOf(u))}마리 잡음${earnOf(u) ? ` · <span style="color:#f2c94a">엽전 +${fmtC(earnOf(u))}</span>` : ''}</small><small>공격력 ${fmt(dmg)} ${upTag(dmg, T)} · ${unitInterval(u, G.sel).toFixed(2)}초마다</small></div><div class="ibtns">${canM ? '<button class="mergebtn" type="button" id="mergeBtn">합성</button>' : ''}<button class="sell${armed ? ' is-arm' : ''}" type="button" id="sellBtn">${armed ? '정말 팔까요? 한 번 더' : `${u.c > 1 ? '1명 ' : ''}팔기 <i class="coin-ico"></i>${fmtC(Tr.sell)}`}</button></div>`;
  /* 전설 and above are hard to get back: the first tap only arms the button */
  $('sellBtn').addEventListener('click', () => {
    const v = G.units[G.sel]; if (!v) return;
    const ok = cache.sellArm && cache.sellArm.id === v.id && performance.now() < cache.sellArm.until;
    if (TYPES[v.t].tier >= 3 && !ok) {
      cache.sellArm = { id: v.id, until: performance.now() + 3000 };
      clearTimeout(cache.sellArmT); cache.sellArmT = setTimeout(() => { cache.sellArm = null; cache.infoKey = ''; refreshInfo(); }, 3050);
    } else { cache.sellArm = null; sell(G.sel); }
    cache.infoKey = ''; refreshInfo();
  });
  if (canM) $('mergeBtn').addEventListener('click', () => { mergeAt(G.sel); cache.infoKey = ''; refreshInfo(); });
}
/* ---------- upgrades ---------- */
const upBtns = UP_NAMES.map((name, g) => {
  const b = document.createElement('button'); b.type = 'button'; b.className = 'up';
  const dots = g === LUCK ? '<i class="luck"></i>' : `<i style="background:${UP_COLOR[g]}"></i>`;
  b.innerHTML = `<span class="lv">${dots}<span class="num"></span><small class="upct"></small></span><span class="unm">${g === LUCK ? name : name}</span><span class="uc"><i class="coin-ico"></i><span class="num"></span></span><span class="ucount num"></span>`;
  b.addEventListener('click', () => { upgrade(g); cache.infoKey = ''; });
  el.ups.appendChild(b);
  return { b, lv: b.querySelector('.lv .num'), pct: b.querySelector('.upct'), cost: b.querySelector('.uc .num'), cnt: b.querySelector('.ucount'), ico: b.querySelector('.uc i') };
});
function refreshUps() {
  const famN = [0, 0, 0, 0]; G.units.forEach(u => { if (u) famN[upGroup(TYPES[u.t])] += u.c || 1; });
  UP_NAMES.forEach((name, g) => {
    const B = upBtns[g], max = g === LUCK ? LUCK_MAX : UP_MAX, lv = G.up[g], done = lv >= max, cost = done ? 0 : upCost(g);
    setText(B.lv, 'ul' + g, g === LUCK ? `${lv}/${max}` : `+${Math.round(BAL.upBonus * 100 * lv)}%`);
    setText(B.pct, 'up' + g, '');
    setText(B.cost, 'uc' + g, done ? '끝' : fmtC(cost));
    setText(B.cnt, 'un' + g, g === LUCK ? '' : String(famN[g]));
    const byHon = g === LUCK && luckByHon() && !done;
    if (g === LUCK && cache.lico !== byHon) { cache.lico = byHon; B.ico.className = byHon ? 'hon-ico' : 'coin-ico'; }
    setClass(B.b, 'ub' + g, 'is-short', done || (byHon ? G.hon < cost : G.coins < cost));
    const label = g === LUCK ? `소환 운 ${lv}단계, 높은 등급이 더 잘 나와요. 다음 비용 ${byHon ? '혼' : '엽전'} ${cost}` : `${UP_NAMES[g]} 동료 공격력 강화 ${lv}단계로 공격력 +${Math.round(BAL.upBonus * 100 * lv)}%, 지금 마당에 ${famN[g]}명, 다음 비용 엽전 ${cost}`;
    if (cache['ua' + g] !== label) { cache['ua' + g] = label; B.b.setAttribute('aria-label', label); }
  });
}
/* ---------- recipe sheet ---------- */
function wildHTML(p, has, cell, M) {
  const u = has && cell >= 0 && G.units ? G.units[cell] : null;
  if (!u) return `<span class="ing${has ? ' has' : ''}" style="border-left:3px solid ${TIERS[WILD[p]].color}"><span class="anyleg">?</span>아무 ${TIERS[WILD[p]].name}</span>`;
  /* show which legend fills the slot, and warn when it is the only copy another recipe here needs */
  const id = TYPES[u.t].id;
  const other = wildNeed(u.t) >= 1 ? MYTHS.find(o => o !== M && mythOpen(o.id) && o.parts.includes(id)) : null;
  return `<span class="ing has${other ? ' warn' : ''}" style="border-left:3px solid ${TIERS[WILD[p]].color}"><img alt="" src="${portraitURL(id, 22)}">${esc(TYPES[u.t].name)}${other ? `<em>${esc(TYPES[TYPE_IX[other.id]].name)} 재료도 돼요</em>` : ''}</span>`;
}
function ingAny(id, has, cell, M) {
  if (WILD[id]) return wildHTML(id, has, cell, M);
  const T = TYPES[TYPE_IX[id]];
  if (T.tier >= 4) { const M = MYTHS.find(m => m.id === id); if (M && isHiddenMyth(M)) return `<span class="ing${has ? ' has' : ''}" style="border-left:3px solid ${TIERS[4].color}"><img alt="" src="${portraitURL(id, 22, true)}">숨은 신화</span>`; }
  return ingHTML(id, has);
}
function ingHTML(id, has) { const T = TYPES[TYPE_IX[id]]; return `<span class="ing${has ? ' has' : ''}" style="border-left:3px solid ${TIERS[T.tier].color}"><img alt="" src="${portraitURL(id, 22)}">${esc(T.name)}</span>`; }
/* 신화 sheet filter: everything, or one role */
let recipeRole = 'all';
function roleChip(T) { const Ro = T.role && ROLES[T.role]; return Ro ? `<span class="tchip" style="--g:${Ro.color};color:#fff">${Ro.name}</span>` : ''; }
function renderRecipes(force) {
  if (el.rsheet.hidden) return;
  const rows = MYTHS.filter(M => recipeRole === 'all' || TYPES[M.ix].role === recipeRole).map(M => ({ M, st: recipeState(M), op: mythOpen(M.id) })).sort((a, b) => (b.op - a.op) || ((b.st.ready && b.op) - (a.st.ready && a.op)) || (b.st.have / b.M.parts.length - a.st.have / a.M.parts.length));
  const sig = recipeRole + rows.map(r => r.M.id + (r.op ? '' : 'L') + r.st.cells.join('.')).join('|') + (R.recipeHi ? R.recipeHi.id : '');
  if (!force && sig === cache.rsig) return;
  cache.rsig = sig;
  const nOpen = MYTHS.filter(M => mythOpen(M.id)).length;
  const chips = `<div class="chips rchips">${[['all', `전체 ${nOpen}/${MYTHS.length}`], ...Object.entries(ROLES).map(([k, Ro]) => [k, Ro.name])].map(([k, nm]) => `<button class="chipbtn" type="button" data-role="${k}" aria-pressed="${recipeRole === k}">${nm}</button>`).join('')}</div>`;
  el.rlist.innerHTML = chips + rows.map(({ M, st }) => {
    const T = TYPES[M.ix];
    if (isHiddenMyth(M)) return `<div class="recipe is-secret${st.ready ? ' is-sel' : ''}" data-id="${M.id}" data-secret="1"><img class="mi" alt="" src="${portraitURL(T.id, 52, true)}"><div><div class="nm">숨은 신화<small>${st.ready ? '재료가 다 모였어요!' : st.have ? `재료 ${st.have}/${M.parts.length}가지가 마당에 있어요` : '무엇이 재료인지 아무도 몰라요'}</small></div><div class="ings">${M.parts.map((p, i) => `<span class="ing${st.cells[i] >= 0 ? ' has' : ''}">?</span>`).join('')}</div></div><button class="btn-sm${st.ready ? ' is-go' : ''}" type="button" data-craft="${M.id}" ${st.ready ? '' : 'disabled'}>조합</button></div>`;
    const open = mythOpen(M.id), shared = open && !mythOpenSelf(M.id);
    const lockNote = !open ? '<em class="lk-note">🔒 잠김 · 마당 밖에서 신화 두루마리로 열어요</em>' : shared ? `<em class="lk-note sh">${esc(pname())}가 열어둔 신화라 같이 쓸 수 있어요</em>` : '';
    return `<div class="recipe${M.tale ? ' is-tale' : M.beast ? ' is-beast' : ''}${open ? '' : ' is-locked'}${R.recipeHi && R.recipeHi.id === M.id ? ' is-sel' : ''}" data-id="${M.id}"><img class="mi" alt="" src="${portraitURL(T.id, 52, !SAVE.made[M.id])}"><div><div class="nm">${esc(T.name)}${roleChip(T)}<small>${M.tale ? '전래동화 · ' : M.beast ? '신수 · ' : ''}${st.have}/${M.parts.length} · <span data-tip="${T.id}">${esc(T.skill)}</span></small></div>${lockNote}<div class="ings">${M.parts.map((p, i) => ingAny(p, st.cells[i] >= 0, st.cells[i], M)).join('')}</div></div><button class="btn-sm${st.ready && open ? ' is-go' : ''}" type="button" data-craft="${M.id}" ${st.ready && open ? '' : 'disabled'}>${open ? '조합' : '잠김'}</button></div>`;
  }).join('');
  if (R.recipeHi) { const M = MYTHS.find(m => m.id === R.recipeHi.id); R.recipeHi.cells = recipeState(M).cells.filter(c => c >= 0); }
}
el.rlist.addEventListener('click', e => {
  const rb = e.target.closest('[data-role]'); if (rb) { recipeRole = rb.dataset.role; renderRecipes(true); sfx('click'); return; }
  const cb = e.target.closest('[data-craft]');
  if (cb) { if (craft(cb.dataset.craft, G.sel)) { R.recipeHi = null; closeRecipes(); refreshInfo(); } return; }
  const row = e.target.closest('.recipe'); if (!row || row.dataset.secret) return;
  const id = row.dataset.id;
  R.recipeHi = R.recipeHi && R.recipeHi.id === id ? null : { id, cells: [] };
  renderRecipes(true);
});
function openRecipes() { if (el.csheet) el.csheet.hidden = true; el.gsheet.hidden = true; el.rsheet.hidden = false; renderRecipes(true); sfx('click'); }
function closeRecipes() { el.rsheet.hidden = true; R.recipeHi = null; }
$('rClose').addEventListener('click', closeRecipes);
/* ---------- challenge sheet ---------- */
function caveRewardText(n) {
  const F = CAVE[Math.min(n, CAVE.length) - 1], sc = Math.pow(1.5, Math.max(0, n - CAVE.length)), rw = F.rw, o = [];
  if (rw.coins) o.push(`엽전 +${fmtC(Math.round(rw.coins * sc))}`);
  if (rw.hon) o.push(`혼 +${rw.hon}`);
  if (rw.silver) o.push(`은전 +${fmtC(rw.silver)}`);
  if (rw.unit) o.push(`${TIERS[rw.unit].name} 동료`);
  if (rw.part) o.push('모자란 신화 재료');
  return o.join(' · ');
}
function renderChal(force) {
  if (el.csheet.hidden) return;
  const r = G.exp.run;
  const sig = CHALS.map((C, i) => Math.ceil(G.chalCd[i]) + (G.foes.some(f => f.chal === C.id && !f.dead) ? 'a' : '')).join('|') + G.wave + '|' + G.exp.floor + (r ? 'r' + Math.ceil(r.t) + ':' + Math.ceil(r.hp / r.max * 50) : 'c' + Math.ceil(G.exp.cd));
  if (!force && sig === cache.csig) return;
  cache.csig = sig;
  const F = caveFloor(), eready = expReady();
  let ex;
  if (r) {
    const lead = TYPES[r.units[0].t];
    ex = `<div class="recipe exp is-run"><img class="mi" alt="" src="${portraitURL(lead.id, 52)}"><div><div class="nm">굴 ${r.floor}층에서 싸우는 중<small>${esc(lead.name)}${r.units.length > 1 ? ` 외 ${r.units.length - 1}명` : ''}</small></div><p class="exl">${esc(r.name)} 남은 체력 ${Math.max(0, Math.ceil(r.hp / r.max * 100))}%</p><div class="pc exs"><div class="bar red" style="width:90px"><i style="width:${Math.max(0, r.hp / r.max * 100).toFixed(1)}%"></i></div>${Math.ceil(r.t)}초 남음</div></div><span class="exn num">${Math.ceil(r.t)}</span></div>`;
  } else {
    const best = G.units.reduce((m, u, i) => (u ? Math.max(m, expRatio(i)) : m), 0);
    const hint = best >= 1.3 ? '혼자서도 넉넉히 이길 동료가 있어요' : best >= 1 ? '혼자서 빠듯하게 이길 동료가 있어요' : `여러 명을 함께 보내 보세요. 최대 ${EXP_MAX}칸`;
    const status = eready ? hint : `${Math.ceil(G.exp.cd)}초 뒤 다시 보낼 수 있어요`;
    ex = `<div class="recipe exp"><img class="mi" alt="" src="${foePortraitURL(F.key, 52)}"><div><div class="nm">굴 ${F.n}층 · ${esc(F.name)}<small>체력 ${fmt(F.hp)} · ${CAVE_TIME}초</small></div><p class="exl">동료를 여러 칸 같이 보낼 수 있어요. 싸우는 동안 그 칸들은 비어요</p><div class="pc exr">${caveRewardText(F.n)}</div><div class="pc exs">${status}</div></div><button class="btn-sm${eready ? ' is-go' : ''}" type="button" data-exp="1" ${eready ? '' : 'disabled'}>보내기</button></div>`;
  }
  const list = CHALS.map((C, i) => {
    const active = G.foes.some(f => f.chal === C.id && !f.dead), cd = G.chalCd[i], ready = !active && cd <= 0;
    const rw = [`엽전 +${fmtC(C.coins)}`].concat(C.hon ? [`혼 +${C.hon}`] : [], C.silver ? [`은전 +${fmtC(C.silver)}`] : [], C.unit ? [`${TIERS[C.unit].name} 동료`] : []).join(' · ');
    const status = active ? '마당에 있어요' : cd > 0 ? `${Math.ceil(cd)}초 뒤 부를 수 있어요` : G.wave < C.rec ? `제 ${C.rec} 마당쯤부터 추천` : '지금 부를 수 있어요';
    const pct = active ? 0 : Math.round((1 - cd / C.cd) * 100);
    return `<div class="recipe${G.wave < C.rec ? ' is-early' : ''}"><img class="mi" alt="" src="${chalPortraitURL(C.id, 52)}"><div><div class="nm">${esc(C.name)}<small>${C.level} · 체력 ${fmt(C.hp * STAGES[G.stage].hp)} · ${C.time}초</small></div><p style="margin:2px 0 0;font-size:12px;line-height:1.4">${esc(C.desc)}</p><div class="pc" style="font-size:12px;color:var(--dan-gold);margin-top:3px">${rw}</div><div class="pc" style="display:flex;align-items:center;gap:6px;margin-top:4px;font-size:11px;color:var(--hanji-dim)"><div class="bar" style="width:70px"><i style="width:${pct}%"></i></div>${status}</div></div><button class="btn-sm${ready ? ' is-go' : ''}" type="button" data-call="${i}" ${ready ? '' : 'disabled'}>부르기</button></div>`;
  }).join('');
  el.clist.innerHTML = `<div class="csect">도깨비굴 출정 <small>층마다 대장이 세지고 보상도 커져요</small></div>${ex}<div class="csect">도전 귀신 <small>뒤로 갈수록 세고 보상도 커요</small></div>${list}`;
}
el.clist.addEventListener('click', e => {
  const b = e.target.closest('[data-call]'); if (b && callChallenge(+b.dataset.call)) { closeChal(); return; }
  const x = e.target.closest('[data-exp]'); if (x && expReady()) { closeChal(); G.sel = -1; R.pickExp = true; R.pickSel = []; R.expInfo = false; cache.infoKey = ''; refreshInfo(); sfx('click'); }
});
function openChal() { closeRecipes(); el.gsheet.hidden = true; el.csheet.hidden = false; renderChal(true); sfx('click'); }
function closeChal() { el.csheet.hidden = true; }
$('cClose').addEventListener('click', closeChal);
/* ---------- 굿 sheet: 재수굿, 대동굿, 별신굿, 신명 부적 ---------- */
const GUT_LOOK = ['linear-gradient(#3fae8a,#2a8a6a)', 'linear-gradient(#6a90e0,#4a6fc0)', 'linear-gradient(#e0a63a,#b8801c)'];
function renderGut(force) {
  if (el.gsheet.hidden) return;
  const room = emptyCells().length > 0, ct = Math.ceil(G.charmT || 0), pity = G.pity || 0;
  const sig = G.hon + ':' + ct + ':' + room + ':' + pity + ':' + G.up[LUCK] + ':' + (G.rel ? G.rel.gut : 0);
  if (!force && sig === cache.gsig) return;
  cache.gsig = sig;
  setText(el.gHon, 'gh', String(G.hon));
  const btn = (attr, cost, label, need) => { const ok = G.hon >= cost && need; return `<button class="btn-sm${ok ? ' is-go' : ''}" type="button" ${attr} ${ok ? '' : 'disabled'}><i class="hon-ico"></i>${cost} ${label}</button>`; };
  const lv = G.up[LUCK], lnext = lv >= LUCK_MAX ? '끝까지 올렸어요' : `다음 단계 ${luckByHon() ? '혼' : '엽전'} ${fmtC(upCost(LUCK))}`;
  const full = pity >= PITY_MAX;
  el.glist.innerHTML = `<div class="pity${full ? ' is-full' : ''}"><div class="pt"><b>지성이면 감천</b><small>${full ? '정성이 가득 찼어요. 다음 굿은 꼭 돼요 · 별신굿이면 전설이 나와요' : `꽝이 날 때마다 정성이 쌓여요 · ${pity}/${PITY_MAX}`}</small></div><div class="bar"><i style="width:${Math.min(100, pity / PITY_MAX * 100)}%"></i></div></div>` +
    GUTS.map((Gd, k) => `<div class="gut"><span class="gi" style="background:${GUT_LOOK[k]}">${esc(Gd.name[0])}</span><div><div class="nm">${esc(Gd.name)}<small>혼 ${Gd.cost}</small></div><p>${esc(Gd.note)} · ${TIERS[Gd.tier].name} 동료 하나</p><div class="odds"><span style="box-shadow:inset 3px 0 0 ${TIERS[Gd.tier].color}">${full ? '꼭 나와요' : `${TIERS[Gd.tier].name} ${Math.round(gutP(Gd) * 100)}%`}</span><span>꽝이면 정성 +${Gd.pity}</span></div></div>${btn(`data-gut="${k}"`, Gd.cost, '벌이기', room)}</div>`).join('') + `
    <div class="gut${ct > 0 ? ' is-on' : ''}"><span class="gi" style="background:linear-gradient(#e6b24a,#c08a1c)">符</span><div><div class="nm">신명 부적<small>혼 ${CHARM.cost}</small></div><p>${ct > 0 ? `붙어 있어요 · ${ct}초 남음. 다시 붙이면 ${CHARM.t}초로 돌아가요` : `${CHARM.t}초 동안 모든 동료가 ${Math.round((CHARM.spd - 1) * 100)}% 빨리 때려요. 보스 잡을 때 붙이세요`}</p></div>${btn('data-charm="1"', CHARM.cost, '붙이기', true)}</div>
    <p class="gnote">소환 운 ${lv}/${LUCK_MAX}단계 · 6단계부터는 혼으로 올려요 · ${lnext}${room ? '' : '<br>굿은 빈 칸이 하나 있어야 벌일 수 있어요'}</p>`;
}
el.glist.addEventListener('click', e => {
  const b = e.target.closest('[data-gut]'); if (b) { auInit(); gamble(+b.dataset.gut); renderGut(true); return; }
  if (e.target.closest('[data-charm]')) { auInit(); charm(); renderGut(true); }
});
function openGut() { closeRecipes(); closeChal(); el.gsheet.hidden = false; renderGut(true); sfx('click'); }
function closeGut() { el.gsheet.hidden = true; }
$('gClose').addEventListener('click', closeGut);
/* ---------- unit card: everything about the tapped unit, on the side away from it ---------- */
const killsOf = u => (G.killBy && G.killBy[u.id]) || 0;
const earnOf = u => (G.earnBy && G.earnBy[u.id]) || 0;
const baseDmg = T => T.dmg * TIER_MUL[T.tier];
function upTag(cur, T) { const d = cur - baseDmg(T); return d >= 1 ? `<span class="upv">▲${fmt(d)}</span>` : ''; }
function unitInterval(u, i) { const T = TYPES[u.t]; return T.cd / ((i >= 0 && G.spd[i]) || 1) / (G.charmT > 0 ? CHARM.spd : 1) / (G.lotusT > 0 ? 1.6 : 1) * G.lvSpd[u.t] / (T.kind === 'pounce' ? 1 : (u.c || 1)); }
function hitNote(T) {
  switch (T.kind) {
    case 'double': return '한 번에 두 번';
    case 'bolts': return `불화살 ${T.bolts}발`;
    case 'chain': return `${T.chain}마리까지 튕김`;
    case 'beam': return '일직선 관통';
    case 'clone': return '분신이 같이 침';
    case 'volley': return `화살 ${T.arrows}발 부채꼴 관통`;
    case 'cone': return '앞쪽 부채꼴';
    case 'pulse': case 'beat': return '자기 둘레 전부';
    case 'whip': return '한 마리 · 표식';
    case 'devour': return `${T.devour}마리 삼키기`;
    case 'boomerang': return `부메랑 ${T.plates}개`;
    case 'wave': return '물결 관통';
    case 'homing': return `도깨비불 ${T.orbs}개 유도`;
    case 'drop': return `마당 어디든 둘레 ${T.aoe}칸`;
    case 'axes': return '금도끼 둘레 베기 · 은도끼 관통';
  }
  if (T.aoe) return `둘레 ${T.aoe}칸`;
  if (T.splash) return `맞은 둘레 ${T.splash}칸`;
  return '한 마리씩';
}
function specialNote(T) {
  const o = [];
  if (T.slow) o.push(`느리게 ${Math.round(T.slow * 100)}% ${T.slowT}초`);
  if (T.stunT) o.push(`${T.stunP ? `${Math.round(T.stunP * 100)}% 확률 ` : ''}기절 ${T.stunT}초`);
  if (T.mark) o.push(`받는 피해 +${Math.round(T.mark * 100)}%`);
  if (T.curse) o.push(`부정 +${Math.round(T.curse * 100)}% ${T.curseT}초`);
  if (T.kb) o.push('뒤로 밀침');
  if (T.coinP) o.push(`${Math.round(T.coinP * 100)}% 확률 엽전`);
  if (T.income) o.push(`${T.incCd}초마다 엽전 ${T.income}`);
  if (T.aura) o.push(`둘레 공속 +${Math.round(T.aura * 100)}%`);
  if (T.dmgAura) o.push(`둘레 공격력 +${Math.round(T.dmgAura * 100)}%`);
  if (T.rngAura) o.push(`둘레 사거리 +${T.rngAura}`);
  if (T.bossAura) o.push(`둘레 동료 보스 피해 +${Math.round(T.bossAura * 100)}%`);
  if (T.ultAura) o.push(`둘레 궁극기 충전 +${Math.round(T.ultAura * 100)}%`);
  if (T.allAura) o.push(`마당의 모든 동료 공격력 +${Math.round(T.allAura * 100)}%`);
  if (T.storm) o.push(`${T.storm}초마다 번개 여섯`);
  if (T.shell) o.push(`${T.shell}초마다 모두 밀어냄`);
  if (T.killCoin) o.push(`잡을 때마다 엽전 ${T.killCoin}부터`);
  if (T.dayNight) o.push(`${T.dayNight}초마다 해와 달이 바뀜`);
  if (T.song) o.push(`${T.song}초마다 모두 멈추고 엽전`);
  if (T.tide) o.push(`${T.tide}초마다 인당수 물결`);
  if (T.gAura) o.push(`마당의 ${T.gAuraT.map(t => TIERS[t].name).join('·')} 공격력 +${Math.round(T.gAura * 100)}%`);
  if (T.bite) o.push(`보스 남은 체력 ${(T.bite * 100).toFixed(1)}% 베어 물기`);
  if (T.book) o.push(`명부 · 보스 받는 피해 +${Math.round(T.book * 100)}%`);
  if (T.interest) o.push(`마당마다 이자 ${Math.round(T.interest * 100)}%`);
  if (T.trade) o.push(`${T.trade}초마다 무역선 · 혼 1과 엽전`);
  if (T.steal) o.push(`보스에게서 ${Math.round(T.steal * 100)}% 확률로 훔침`);
  if (T.field) o.push('3초 불바다');
  if (T.burn) o.push('불태움');
  if (T.pct) o.push(`최대 체력 ${Math.round(T.pct * 100)}% 피해`);
  if (T.bossMul) o.push(`보스에게 ${T.bossMul}배`);
  if (T.crit) o.push(`${Math.round(T.crit * 100)}% 확률 ${T.critMul || 2}배`);
  if (T.execute) o.push('빈사 처형');
  return o.join(' · ');
}
function buffLines(u, i) {
  const T = TYPES[u.t], o = [], up = upOf(T), lv = lvOf(T.id);
  if (up) o.push(`${UP_NAMES[upGroup(T)]} 강화 ${up}단계 +${Math.round(BAL.upBonus * 100 * up)}%`);
  if (lv > 1) o.push(`도감 Lv ${lv} +${Math.round((G.lvMul[u.t] - 1) * 100)}%${G.lvSpd[u.t] < 1 ? ' · 공속 +10%' : ''}`);
  if (G.spd[i] > 1) o.push(`선비 공속 +${Math.round((G.spd[i] - 1) * 100)}%`);
  if (G.dmgN[i] > 1) o.push(`무동 공격력 +${Math.round((G.dmgN[i] - 1) * 100)}%`);
  if (G.rngB && G.rngB[i] > 0) o.push(`솟대 사거리 +${G.rngB[i]}`);
  if (G.bossN && G.bossN[i] > 1) o.push(`돌하르방 보스 피해 +${Math.round((G.bossN[i] - 1) * 100)}%`);
  if (ULTS[T.id] && G.ultN && G.ultN[i] > 1) o.push(`용왕 가호 궁극기 충전 +${Math.round((G.ultN[i] - 1) * 100)}%`);
  if (gradeMulOf(T) > 1) o.push(`${T.tier <= 1 ? '사물놀이패' : '팔도 의병'} 기운 +${Math.round((gradeMulOf(T) - 1) * 100)}%`);
  const fb = G.tierBuff && G.tierBuff[T.tier]; if (fb && fb.t > 0) o.push(`의병 봉기 ×${fb.mul} · ${Math.ceil(fb.t)}초`);
  const rm = relMul(T); if (rm > 1.001) o.push(`유물 +${Math.round((rm - 1) * 100)}%`);
  if (G.allMul > 1.001) o.push(`황룡 기운 +${Math.round((G.allMul - 1) * 100)}%`);
  if (G.lotusT > 0) o.push(`연꽃 환생 공속 +60% · ${Math.ceil(G.lotusT)}초`);
  if (G.charmT > 0) o.push(`신명 부적 공속 +${Math.round((CHARM.spd - 1) * 100)}% · ${Math.ceil(G.charmT)}초`);
  return o;
}
/* what a companion goes into: "바리공주 · 팔도 의병 재료" (hidden ones stay hidden) */
function partsNote(T) {
  const ids = (PARTS_OF[T.id] || []).filter(id => !isHiddenMyth(MYTH_BY[id]));
  if (T.tier === 3) for (const M of MYTHS) if (M.parts.includes('*3') && !M.parts.includes(T.id) && !ids.includes(M.id)) ids.push(M.id);
  if (!ids.length) return '';
  const names = ids.map(id => TYPES[TYPE_IX[id]].name);
  return `${names.slice(0, 4).join(' · ')}${names.length > 4 ? ` 외 ${names.length - 4}` : ''} 재료`;
}
/* the badge after a level: 각성 and 신물 for mythics, 최고 at the top */
function lvTag(T, lv) { if (lv >= lvTop(T)) return ' 최고'; if (T.tier >= 4) return lv >= 10 ? ' 신물' : lv >= 5 ? ' 각성' : ''; return ''; }
function renderUcard() {
  const c = el.ucard, i = G.sel, u = G.phase === 'play' && i >= 0 && !R.pickExp && !(drag && drag.moved) ? G.units[i] : null;
  if (!u) { if (!c.hidden) { c.hidden = true; cache.ucKey = ''; } return; }
  const T = TYPES[u.t], ult = ULTS[T.id];
  const key = [u.id, u.c, i, killsOf(u), earnOf(u), G.up.join(','), G.spd[i], G.dmgN[i], G.rngB && G.rngB[i], G.bossN && G.bossN[i], gradeMulOf(T), Math.ceil(G.charmT || 0), Math.ceil(G.lotusT || 0), G.tierBuff && G.tierBuff[T.tier] && Math.ceil(G.tierBuff[T.tier].t), ult ? Math.floor((u.mana || 0) / 10) : 0, R.H].join('|');
  if (c.hidden) c.hidden = false;
  if (key === cache.ucKey) return;
  cache.ucKey = key;
  const Tr = TIERS[T.tier], cap = capOf(u.t), lv = lvOf(T.id), dmg = dmgOf(u.t, i), iv = unitInterval(u, i), dps = dmg * (T.kind === 'double' ? 2 : 1) / iv;
  const myth = partsNote(T);
  const sp = specialNote(T), bl = buffLines(u, i);
  c.innerHTML = `<div class="uh"><img alt="" src="${portraitURL(T.id, 46)}"><div><div class="un">${esc(T.name)}</div><div class="uchips"><span class="tchip" style="--g:${Tr.color}">${Tr.name}</span>${roleChip(T)}${cap > 1 ? `<span class="tchip stackchip">${u.c}/${cap}명</span>` : ''}<span class="tchip" style="--g:#e6b24a">Lv ${lv}${lvTag(T, lv)}</span></div></div></div>
    <div class="usk" data-tip="${T.id}">${esc(T.skill)}</div><p>${esc(T.desc)}</p>
    <dl><dt>잡은 도깨비</dt><dd>${fmtC(killsOf(u))}마리</dd>${earnOf(u) ? `<dt>번 엽전</dt><dd style="color:#f2c94a">+${fmtC(earnOf(u))}</dd>` : ''}<dt>공격력</dt><dd>${fmt(dmg)} ${upTag(dmg, T)}</dd><dt>기본 공격력</dt><dd>${fmt(baseDmg(T))} <small>${dmg > baseDmg(T) + 0.5 ? `${(dmg / baseDmg(T)).toFixed(1)}배` : ''}</small></dd><dt>공격 간격</dt><dd>${iv.toFixed(2)}초</dd><dt>초당 피해</dt><dd>${fmt(dps)} <small>한 마리</small></dd><dt>사거리</dt><dd>${T.range > 50 ? '마당 전체' : rngOf(T, i).toFixed(1) + '칸'}</dd><dt>방식</dt><dd>${hitNote(T)}</dd>${sp ? `<dt>특수</dt><dd>${sp}</dd>` : ''}<dt>팔면</dt><dd>엽전 ${fmtC(Tr.sell)}</dd></dl>
    ${ult ? `<div class="uult">궁극기 ${esc(ult.name)} · ${esc(ult.desc)} · 마나 ${Math.floor(u.mana || 0)}%</div>` : ''}
    ${bl.length ? `<div class="ubuff">받는 효과<br>${bl.join('<br>')}</div>` : ''}${myth ? `<div class="ubuff" style="color:var(--dan-gold)">${esc(myth)}</div>` : ''}`;
  const wide = document.body.classList.contains('wide'), top = wide ? 8 : $('hud').getBoundingClientRect().bottom + 4, bot = wide ? R.H - 8 : $('deck').getBoundingClientRect().top - 6;
  c.style.top = `${Math.round(top)}px`; c.style.maxHeight = `${Math.max(140, Math.round(bot - top))}px`; c.style.overflow = 'hidden';
  const side = i % COLS <= 2 ? 'right' : 'left';
  c.classList.toggle('right', side === 'right'); c.classList.toggle('left', side === 'left');
}
/* ---------- skill tooltips: hover with a mouse, tap on a phone ---------- */
const tipEl = document.createElement('div'); tipEl.className = 'tip'; tipEl.hidden = true; document.body.appendChild(tipEl);
const pct = v => `${Math.round(v * 100)}%`;
function kindDetail(T) {
  switch (T.kind) {
    case 'shot': return T.splash ? `한 마리에게 던지고 맞은 둘레 ${T.splash}칸에 절반 피해` : '한 마리에게 던져요';
    case 'chain': return `${T.chain}마리까지 튕기고, 한 번 튕길 때마다 12%씩 약해져요${T.execute ? ` · 체력이 ${pct(T.execute)} 아래면 바로 처치 (보스 빼고)` : ''}`;
    case 'thump': return `맞은 자리 둘레 ${T.aoe}칸을 모두 100%로 쳐요`;
    case 'beam': return '일직선으로 꿰뚫어 그 줄의 도깨비를 모두 쳐요';
    case 'double': return '한 번 때리고 0.16초 뒤 한 번 더, 두 번 모두 100%';
    case 'pulse': return `자기 둘레 ${T.range}칸 안을 모두 쳐요${T.pct ? ` · 최대 체력의 ${pct(T.pct)}를 더 깎아요` : ''}`;
    case 'pounce': return `${T.global ? '마당 어디든' : '사거리 안으로'} 뛰어들어 둘레 ${T.aoe}칸을 치고 ${T.stunT}초 기절`;
    case 'bolts': return `${T.bolts}발을 여러 도깨비에게 나눠 쏴요`;
    case 'whip': return `한 마리를 때리고 ${T.markT || 3}초 동안 받는 피해 +${pct(T.mark)}`;
    case 'cone': return `앞쪽 부채꼴 안을 모두 쳐요${T.burn ? ` · 공격력의 ${pct(T.burn)}로 3초 태움` : ''}${T.kb ? ' · 뒤로 밀침' : ''}`;
    case 'devour': return `${T.devour}번째 공격마다 작은 도깨비를 통째로 삼켜요. 큰 도깨비에겐 ${T.bite ? `남은 체력의 ${(T.bite * 100).toFixed(1)}% (공격력의 12배까지)` : '두 배 피해'}`;
    case 'volley': return `화살 ${T.arrows}발을 부채꼴로 쏘고 발마다 꿰뚫어요`;
    case 'boomerang': return `접시 ${T.plates}개가 날아갔다 돌아오며 두 번 베어요`;
    case 'wave': return `일직선으로 꿰뚫어요${T.slow ? ` · 맞으면 ${pct(T.slow)} 느려짐 ${T.slowT}초` : ''}`;
    case 'homing': return `${T.orbs}개가 도깨비를 따라가 맞혀요${T.slow ? ` · 맞으면 ${pct(T.slow)} 느려짐` : ''}`;
    case 'cannon': return `맞은 둘레 ${T.aoe}칸을 치고 ${T.stunT}초 기절${T.breath ? ` · ${T.breath}번째마다 불을 뿜어 태워요` : ''}`;
    case 'drop': return `마당 어디든 몰린 곳에 떨어뜨려 둘레 ${T.aoe}칸을 치고 ${pct(T.slow)} 느리게 ${T.slowT}초`;
    case 'fire': return `마당 어디든 몰린 곳에 불을 떨어뜨려 둘레 ${T.aoe}칸을 치고, 공격력의 ${pct(T.burn)}로 3초 태워요`;
    case 'curse': return `둘레 ${T.aoe}칸에 부정을 씌워 ${T.curseT}초 동안 받는 피해 +${pct(T.curse)}`;
    case 'clone': return `분신과 함께 ${T.clones}번 베어요. 여럿이면 나눠 벰`;
    case 'axes': return `금도끼는 둘레 ${T.splash}칸에 절반 피해, 보스에겐 ${T.bossMul}배 · 두 번에 한 번 은도끼가 80%로 꿰뚫어요`;
    case 'beat': return `장단마다 둘레를 모두 치고, 네 번째 박엔 2.5배로 치며 0.5초 기절`;
  }
  return '';
}
function skillDetail(id) {
  const T = TYPES[TYPE_IX[id]]; if (!T) return '';
  const lvm = typeof lvMulArr === 'function' ? lvMulArr()[T.ix] : 1, lv = lvOf(T.id), base = baseDmg(T);
  const li = [];
  li.push(`공격력 ${fmt(base * lvm)}${lv > 1 ? ` <small>(기본 ${fmt(base)} · Lv ${lv})</small>` : ''}`);
  li.push(`${T.cd}초마다 · ${T.range > 50 ? '마당 전체' : `사거리 ${T.range}칸`}`);
  const kd = kindDetail(T); if (kd) li.push(kd);
  /* the kind line may already say how it slows or burns; don't say it twice */
  const sp = specialNote(T).split(' · ').filter(x => !(kd && ((x.startsWith('느리게') && kd.includes('느려')) || (x === '불태움' && kd.includes('태')) || (x.startsWith('보스에게') && kd.includes('보스'))))).join(' · '); if (sp) li.push(sp);
  li.push(`치명타 ${pct(T.crit || 0.05)} 확률로 ${T.critMul || 2}배`);
  if (T.stunT || T.slow || T.stunP) li.push('보스는 기절을 4분의 1, 느려짐을 절반만 받아요');
  if (ULTS[T.id]) li.push(`<span style="color:#9ad0ff">궁극기 ${esc(ULTS[T.id].name)} · ${ULTS[T.id].t}초마다 저절로 · ${esc(ULTS[T.id].desc)}</span>`);
  li.push(`${esc(UP_NAMES[upGroup(T)])} 강화 한 단계마다 공격력 +${pct(BAL.upBonus)}`);
  if (typeof lvPerks === 'function') li.push(lvPerks(T).map(([at, txt]) => `<span class="${lv >= at ? 'pk-on' : 'pk-off'}">Lv ${at} ${esc(txt)}${lv >= at ? '' : ' 🔒'}</span>`).join('<br>'));
  return `<b>${esc(T.skill)}</b><small class="tt">${esc(T.name)} · ${TIERS[T.tier].name}</small><p>${esc(T.desc)}</p><ul>${li.map(x => `<li>${x}</li>`).join('')}</ul>`;
}
let tipFor = null;
function showTip(el) {
  tipFor = el; tipEl.innerHTML = skillDetail(el.dataset.tip); tipEl.hidden = false;
  const r = el.getBoundingClientRect(), w = Math.min(290, window.innerWidth - 16); tipEl.style.width = `${w}px`;
  const h = tipEl.offsetHeight, left = clamp(r.left + r.width / 2 - w / 2, 8, window.innerWidth - w - 8);
  const top = r.top - h - 8 >= 8 ? r.top - h - 8 : Math.min(window.innerHeight - h - 8, r.bottom + 8);
  tipEl.style.left = `${Math.round(left)}px`; tipEl.style.top = `${Math.round(top)}px`;
}
function hideTip() { tipFor = null; tipEl.hidden = true; }
document.addEventListener('pointerover', e => { if (e.pointerType !== 'mouse') return; const el = e.target.closest && e.target.closest('[data-tip]'); if (el) showTip(el); });
document.addEventListener('pointerout', e => { if (e.pointerType !== 'mouse') return; const el = e.target.closest && e.target.closest('[data-tip]'); if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) hideTip(); });
document.addEventListener('pointerdown', e => {
  if (e.pointerType === 'mouse') { if (!tipEl.hidden && !(e.target.closest && e.target.closest('[data-tip]'))) hideTip(); return; }
  const el = e.target.closest && e.target.closest('[data-tip]');
  if (el && el !== tipFor) showTip(el); else hideTip();
}, true);
/* with a mouse, resting on a companion on the yard shows its skill and resting on a 도깨비 shows its health, no click needed */
const boardTip = { key: '' };
function placeTip(x, y) {
  const w = tipEl.offsetWidth, h = tipEl.offsetHeight;
  let left = x + 16, top = y + 16;
  if (left + w > window.innerWidth - 8) left = x - w - 16;
  if (top + h > window.innerHeight - 8) top = Math.max(8, y - h - 16);
  tipEl.style.left = `${Math.round(Math.max(8, left))}px`; tipEl.style.top = `${Math.round(top)}px`;
}
function hideBoardTip() { if (tipFor === 'board') hideTip(); boardTip.key = ''; }
cv.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  if (G.phase !== 'play' || drag || R.pickExp) { hideBoardTip(); return; }
  const p = toWorld(e), i = unitAtPoint(p), u = i >= 0 ? G.units[i] : null;
  let key = '', html = '';
  if (u) { key = 'u' + u.id; if (boardTip.key !== key) html = skillDetail(TYPES[u.t].id); }
  else {
    const f = foeAtPoint(p);
    if (f) {
      const I = foeInfo(foeKey(f)), pct = Math.max(0, Math.ceil(f.hp / f.max * 100));
      key = 'f' + f.id + ':' + pct;
      if (boardTip.key !== key) html = `<b>${esc(f.name || I.name)}</b><span class="tt">${esc(I.kind)}${f.mini ? ' · 새끼' : ''}</span><p>체력 ${fmt(Math.max(0, f.hp))} / ${fmt(f.max)} (${pct}%)</p><small>${esc(f.boss ? (BOSS_DEF[f.boss] || {}).note || '' : I.desc || '')}</small>`;
    }
  }
  if (!key) { hideBoardTip(); return; }
  if (html) { boardTip.key = key; tipFor = 'board'; tipEl.style.width = `${Math.min(290, window.innerWidth - 16)}px`; tipEl.innerHTML = html; tipEl.hidden = false; }
  if (tipFor === 'board') placeTip(e.clientX, e.clientY);
});
cv.addEventListener('pointerleave', hideBoardTip);
cv.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse') hideBoardTip(); });
/* ---------- tapped foe: name and health in the info bar ---------- */
function foeKey(f) { return f.boss ? 'b_' + f.boss : f.chal ? 'c_' + f.chal : 'f' + f.kind; }
function foeInfoBar(f) {
  if (!f.uid) f.uid = (cache.fuid = (cache.fuid || 0) + 1);
  const key = foeKey(f), I = foeInfo(key);
  const st = [];
  if (f.stunT > 0) st.push('기절'); if (f.slowT > 0) st.push(`느려짐 ${Math.round((f.slowAmt || 0) * 100)}%`);
  if (f.markT > 0) st.push(`받는 피해 +${Math.round((f.markAmt || 0) * 100)}%`); if (f.curseT > 0) st.push(`부정 +${Math.round((f.curseAmt || 0) * 100)}%`);
  if (f.burnT > 0) st.push('불탐');
  const stTxt = st.length ? st.join(' · ') : (f.boss ? '보스 · 시간 안에 잡아야 해요' : esc(I.desc || ''));
  if (cache.infoKey !== 'foe' + f.uid) {
    cache.infoKey = 'foe' + f.uid;
    el.info.innerHTML = `<img alt="" src="${foePortraitURL(key, 40)}"><div class="it"><span class="l1"><b>${esc(f.name || I.name)}</b><span class="tchip" style="--g:#e2563c;color:#fff">${I.kind}</span>${f.mini ? '<span class="tchip">새끼</span>' : ''}</span><span class="hpline"><i id="fHpI"></i><span id="fHpT"></span></span><small class="fx" id="fSt"></small></div>`;
  }
  const pct = `${Math.max(0, f.hp / f.max * 100).toFixed(1)}%`;
  setText($('fHpT'), 'fht' + f.uid, `${fmt(Math.max(0, f.hp))} / ${fmt(f.max)}`);
  const hi = $('fHpI'); if (hi.style.width !== pct) hi.style.width = pct;
  setText($('fSt'), 'fst' + f.uid, stTxt);
}
/* ---------- silver count-up and flying coins ---------- */
let silverShown = null, silverRAF = 0;
function silverHTML() { if (silverShown == null) silverShown = SAVE.silver; return `<span class="silver"><i class="silver-ico"></i><span class="num">${fmtC(silverShown)}</span> 은전</span>`; }
function setSilverText(v) { document.querySelectorAll('.silver .num').forEach(n => { n.textContent = fmtC(v); }); }
function flyDom(target, kind, from, n = 9) {
  if (reduceMotion || !target) return;
  const r = target.getBoundingClientRect(), sx = from ? from.x : window.innerWidth / 2, sy = from ? from.y : window.innerHeight * 0.45;
  for (let k = 0; k < n; k++) {
    const c = document.createElement('i'); c.className = (kind === 'silver' ? 'silver-ico' : 'coin-ico') + ' flycoin';
    c.style.left = sx + 'px'; c.style.top = sy + 'px'; document.body.appendChild(c);
    const dx = r.left + 16 - sx, dy = r.top + r.height / 2 - sy, jx = rand(-70, 70), jy = rand(-80, 10);
    const a = c.animate([{ transform: 'translate(-50%,-50%) scale(.5)', opacity: 0 }, { transform: `translate(calc(-50% + ${jx}px),calc(-50% + ${jy}px)) scale(1.35)`, opacity: 1, offset: 0.3 }, { transform: `translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px)) scale(.8)`, opacity: 0.9 }], { duration: 640 + k * 45, easing: 'cubic-bezier(.45,0,.6,1)', fill: 'forwards' });
    a.onfinish = () => c.remove();
  }
}
function bump(node) { if (!node) return; node.classList.remove('bump'); void node.offsetWidth; node.classList.add('bump'); }
function tweenSilver(fly, from) {
  const target = SAVE.silver; if (silverShown == null) silverShown = target;
  const start = silverShown; if (start === target) return;
  cancelAnimationFrame(silverRAF);
  const pill = [...document.querySelectorAll('.silver')].find(n => n.offsetParent);
  const up = target > start;
  if (fly && up && pill) flyDom(pill, 'silver', from);
  const t0 = performance.now() + (fly && up ? 480 : 0), dur = up ? Math.min(1400, 500 + Math.log10(target - start + 1) * 220) : 260; let lastTick = 0;
  const step = now => {
    const k = clamp((now - t0) / dur, 0, 1), v = Math.round(start + (target - start) * (1 - Math.pow(1 - k, 3)));
    silverShown = v; setSilverText(v);
    if (up && k > 0 && k < 1 && now - lastTick > 55) { lastTick = now; sfx('tick'); }
    if (k < 1) silverRAF = requestAnimationFrame(step); else { silverShown = target; setSilverText(target); if (up) bump(pill); }
  };
  silverRAF = requestAnimationFrame(step);
}
function countUp(node, to, dur = 1000) {
  const t0 = performance.now(); let last = 0;
  const step = now => { const k = clamp((now - t0) / dur, 0, 1); node.textContent = fmtC(Math.round(to * (1 - Math.pow(1 - k, 3)))); if (k < 1 && now - last > 55) { last = now; sfx('tick'); } if (k < 1) requestAnimationFrame(step); };
  requestAnimationFrame(step);
}
onFlyArrive = () => { const now = performance.now(); if (!cache.bumpT || now - cache.bumpT > 120) { cache.bumpT = now; bump(el.coins.parentElement); } };

/* ---------- reward popup ---------- */
function jadeHTML() { return `<span class="jade"><i class="jade-ico"></i><span class="num">${fmtC(SAVE.jade || 0)}</span> 옥</span>`; }
function hyangHTML() { return `<span class="jade hyang" title="향 · 신화 레벨에 써요"><i class="hyang-ico"></i><span class="num">${fmtC(SAVE.hyang || 0)}</span> 향</span>`; }
function curHTML(withHyang) { return `<span class="curs">${silverHTML()}${jadeHTML()}${withHyang ? hyangHTML() : ''}</span>`; }
function pcsHTML(pcs) { return Object.entries(pcs || {}).map(([id, n]) => `<span class="rw" style="border-left:3px solid ${TIERS[TYPES[TYPE_IX[id]].tier].color}"><img alt="" src="${portraitURL(id, 28)}">${esc(TYPES[TYPE_IX[id]].name)} 조각 ×${n}</span>`).join(''); }
function relicChipsHTML(list) { return (list || []).map(g => g.id ? `<span class="rw relic-rw">${relicIcon(g.id, 26)}${esc(RELICS[RELIC_IX[g.id]].name)}${g.isNew ? ' · 새 유물!' : ' · 조각 +1'}</span>` : `<span class="rw jade-rw"><i class="jade-ico"></i>옥 +${g.jade}</span>`).join(''); }
function cardsToPcs(cards) { const o = {}; (cards || []).forEach(id => { o[id] = (o[id] || 0) + 1; }); return o; }
/* opts: { jade, relics, cards } */
function showReward(title, silver, pcs, opts = {}) {
  $('rwTitle').textContent = title;
  $('rwBody').innerHTML = (silver ? `<span class="rw silver-rw"><i class="silver-ico"></i>은전 +${fmtC(silver)}</span>` : '') + (opts.jade ? `<span class="rw jade-rw"><i class="jade-ico"></i>옥 +${fmtC(opts.jade)}</span>` : '') + (opts.scroll ? `<span class="rw scroll-rw">📜 신화 두루마리 +${opts.scroll}</span>` : '') + (opts.hyang ? `<span class="rw hyang-rw"><i class="hyang-ico"></i>향 +${fmtC(opts.hyang)}</span>` : '') + (opts.wild ? `<span class="rw">✦ 만능 조각 +${fmtC(opts.wild)}</span>` : '') + relicChipsHTML(opts.relics) + pcsHTML(pcs) + (opts.note ? `<p class="meta rwnote">${esc(opts.note)}</p>` : '');
  el.rewardOv.hidden = false; $('rwOk').focus(); cache.rwFly = !!silver;
  sfx('upgrade');
}
$('rwOk').addEventListener('click', () => { el.rewardOv.hidden = true; if (R.lobby) { renderTab(); tweenSilver(cache.rwFly); } });

/* ---------- lucky pouch and treasure box opening ---------- */
function pouchSVG(kind) {
  if (kind === 'relic') return `<svg viewBox="0 0 120 132" aria-hidden="true"><ellipse cx="60" cy="122" rx="44" ry="6" fill="rgba(0,0,0,.25)"/>
    <path d="M16 62h88v52a6 6 0 0 1-6 6H22a6 6 0 0 1-6-6z" fill="#8a4a24" stroke="#2a1408" stroke-width="3"/>
    <path d="M16 62c0-22 18-34 44-34s44 12 44 34z" fill="#a85a2c" stroke="#2a1408" stroke-width="3"/>
    <path d="M16 78h88M16 100h88" stroke="#e8b84a" stroke-width="5"/><path d="M38 36v84M82 36v84" stroke="#e8b84a" stroke-width="5"/>
    <rect x="50" y="66" width="20" height="22" rx="3" fill="#f0c43a" stroke="#2a1408" stroke-width="2.6"/><circle cx="60" cy="75" r="3.4" fill="#2a1408"/><path d="M60 77v6" stroke="#2a1408" stroke-width="2.6"/></svg>`;
  const P = { small: ['#ff6a5a', '#b8231c', '#d63b2e'], big: ['#4f7ae0', '#1f3f9a', '#3a64c8'], silk: ['#6fd0a8', '#1f7a5a', '#2f9a72'] }[kind] || ['#ff6a5a', '#b8231c', '#d63b2e'];
  const [a, b, fr] = P;
  return `<svg viewBox="0 0 120 132" aria-hidden="true"><defs><radialGradient id="pg${kind}" cx="38%" cy="40%" r="70%"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></radialGradient></defs>
  <ellipse cx="60" cy="124" rx="40" ry="6" fill="rgba(0,0,0,.25)"/>
  <path d="M33 52 Q8 82 20 108 Q60 130 100 108 Q112 82 87 52 Z" fill="url(#pg${kind})" stroke="#2a1a10" stroke-width="3"/>
  <path d="M26 86 q8-8 16 0 q-8 6-16 0z M80 96 q8-8 16 0 q-8 6-16 0z M36 108 q6-6 12 0 q-6 5-12 0z" fill="rgba(255,220,120,.55)"/>
  <circle cx="60" cy="92" r="16" fill="#f0c43a" stroke="#2a1a10" stroke-width="2.6"/>
  <text x="60" y="100" text-anchor="middle" font-size="21" font-family="Jua, sans-serif" fill="${b}">복</text>
  <path d="M34 40 Q40 20 48 35 Q54 17 60 33 Q66 17 72 35 Q80 20 86 40 L84 52 Q60 44 36 52 Z" fill="${fr}" stroke="#2a1a10" stroke-width="3" stroke-linejoin="round"/>
  <path d="M34 52 Q60 62 86 52" stroke="#f0c43a" stroke-width="5" fill="none" stroke-linecap="round"/>
  <path d="M54 58 q-10 4-18 14 M66 58 q10 4 18 14" stroke="#f0c43a" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path d="M31 71 l5 13 l5-13z M79 71 l5 13 l5-13z" fill="#d63b2e" stroke="#2a1a10" stroke-width="1.4"/></svg>`;
}
let pouchState = null;
/* cards: unit ids (pieces) or { relic } entries. the same piece is grouped into one card with a count */
function openPouch(cards, kind, title, again, after) {
  clearTimeout(cache.pouchFlip); clearTimeout(cache.pouchAuto); clearInterval(cache.pouchShake);
  let order;
  if (kind === 'relic') order = cards.map(g => ({ relic: g.id, gr: g.g || 0, isNew: g.isNew, lv: g.lv, jade: g.jade, t: g.id ? (g.g === 2 ? 3 : g.g === 1 ? 2 : 1) : 1, n: 1 }));
  else {
    const grp = {}, fresh = new Set(cards.newSeen || []); cards.forEach((id, i) => { if (!grp[id]) grp[id] = { id, n: 0, i, t: TYPES[TYPE_IX[id]].tier, isNew: fresh.has(id) }; grp[id].n++; });
    order = Object.values(grp).sort((a, b) => a.t - b.t || a.i - b.i);
  }
  pouchState = { cards: order, kind, again, after, phase: 'closed', i: 0, total: cards.length, jackpot: !!cards.jackpot };
  $('pouchTitle').textContent = title + (kind === 'relic' ? '' : ` · 조각 ${cards.length}장${cards.hyang ? ` · 향 +${cards.hyang}` : ''}`);
  $('pouchArt').innerHTML = pouchSVG(kind); $('pouchArt').className = 'pouch is-wobble';
  $('pouchCards').innerHTML = ''; $('pouchCta').hidden = true; $('pouchHint').hidden = false; $('pouchFx').innerHTML = '';
  el.pouchOv.classList.remove('is-open'); el.pouchOv.hidden = false;
  sfx('pouchShake'); cache.pouchShake = setInterval(() => sfx('pouchShake'), 650);
  cache.pouchAuto = setTimeout(burstPouch, 1700);
}
function confetti(box, many) {
  const n = reduceMotion ? 0 : many ? 60 : 28;
  for (let k = 0; k < n; k++) {
    const s = document.createElement('i'), a = rand(0, TAU), d = rand(90, many ? 260 : 200);
    s.style.background = pick(OBANG); s.style.setProperty('--dx', `${Math.cos(a) * d}px`); s.style.setProperty('--dy', `${Math.sin(a) * d - 40}px`); s.style.setProperty('--r', `${rand(-540, 540)}deg`);
    box.appendChild(s); setTimeout(() => s.remove(), 1300);
  }
}
function pouchCardHTML(c) {
  if (c.relic || c.jade) {
    if (!c.relic) return `<div class="pcard t1" style="--tc:#3fae6a;--tl:#9ff0c0"><div class="pc-in"><div class="pc-back"><span>보</span></div><div class="pc-front"><i class="jade-ico big"></i><b>옥 +${c.jade}</b><small>모두 최고 레벨</small></div></div></div>`;
    const Rl = RELICS[RELIC_IX[c.relic]];
    const Gr = RELIC_GRADE[c.gr || 0];
    return `<div class="pcard t${c.t} relic g${c.gr || 0}" style="--tc:${Gr.color};--tl:#fff2c8"><div class="pc-in"><div class="pc-back"><span>보</span></div><div class="pc-front"><em class="rgr">${Gr.name}</em>${relicIcon(c.relic, 52)}<b>${esc(Rl.name)}</b><small>${c.isNew ? '새 유물!' : '조각 +1 · 올리기에 써요'}</small></div></div></div>`;
  }
  const T = TYPES[TYPE_IX[c.id]], tr = TIERS[T.tier];
  return `<div class="pcard t${T.tier}" style="--tc:${tr.color};--tl:${tr.light}"><div class="pc-in"><div class="pc-back"><span>복</span></div><div class="pc-front"><img alt="" src="${portraitURL(c.id, 56)}"><b>${esc(T.name)}</b><small>${c.isNew ? '새 동료!' : tr.name + ' 조각'}</small>${c.n > 1 ? `<em class="pcn">×${c.n}</em>` : ''}</div></div></div>`;
}
function burstPouch() {
  if (!pouchState || pouchState.phase !== 'closed') return;
  pouchState.phase = 'flip'; clearInterval(cache.pouchShake); clearTimeout(cache.pouchAuto);
  el.pouchOv.classList.add('is-open'); $('pouchHint').hidden = true; $('pouchArt').className = 'pouch is-burst';
  sfx('pouchOpen'); confetti($('pouchFx'), pouchState.jackpot);
  const jp = $('pouchJack'); jp.hidden = !pouchState.jackpot; if (pouchState.jackpot) { el.pouchOv.classList.remove('is-flash'); void el.pouchOv.offsetWidth; el.pouchOv.classList.add('is-flash'); sfx('craft'); }
  const box = $('pouchCards'); box.innerHTML = pouchState.cards.map(pouchCardHTML).join('');
  box.classList.toggle('few', pouchState.cards.length <= 3); box.classList.toggle('many', pouchState.cards.length > 6 && pouchState.cards.length <= 12); box.classList.toggle('lots', pouchState.cards.length > 12);
  cache.pouchFlip = setTimeout(flipNext, pouchState.jackpot ? 900 : 650);
}
function againLabel(st) {
  if (!st.again) return null;
  if (st.kind === 'relic') { const B = RELIC_BOX[st.again]; return { text: `한 번 더 · 옥 ${B.jade}`, ok: (SAVE.jade || 0) >= B.jade }; }
  const P = POUCHES[st.kind]; return P.jade ? { text: `한 번 더 · 옥 ${P.jade}`, ok: canBuyPouch(st.kind) } : { text: `한 번 더 · 은전 ${fmtC(P.cost)}`, ok: canBuyPouch(st.kind) };
}
function flipNext() {
  const st = pouchState; if (!st) return;
  const c = $('pouchCards').children[st.i];
  if (!c) { st.phase = 'done'; $('pouchCta').hidden = false; const A = againLabel(st); $('pouchAgain').hidden = !A; if (A) { $('pouchAgain').disabled = !A.ok; $('pouchAgain').textContent = A.text; } $('pouchOk').focus(); return; }
  const card = st.cards[st.i], tier = card.relic || card.jade ? card.t : TYPES[TYPE_IX[card.id]].tier;
  c.classList.add('is-flip'); sfx('flip', Math.min(3, tier));
  if (tier >= 3) { el.pouchOv.classList.remove('is-flash'); void el.pouchOv.offsetWidth; el.pouchOv.classList.add('is-flash'); }
  st.i++;
  cache.pouchFlip = setTimeout(flipNext, tier >= 3 ? 560 : tier >= 2 ? 340 : 170);
}
el.pouchOv.addEventListener('click', e => {
  if (!pouchState) return;
  if (e.target.closest('#pouchOk')) { clearTimeout(cache.pouchFlip); el.pouchOv.hidden = true; const after = pouchState.after; pouchState = null; if (R.lobby) { renderTab(); tweenSilver(false); } if (after) after(); return; }
  if (e.target.closest('#pouchAgain')) {
    const k = pouchState.kind;
    if (k === 'relic') { const box = pouchState.again, got = buyRelicBox(box); if (got) { renderTab(); openPouch(got, 'relic', RELIC_BOX[box].name, box); } }
    else { const cards = buyPouch(k); if (cards) { renderTab(); tweenSilver(false); openPouch(cards, k, POUCHES[k].name, true); } }
    return;
  }
  if (pouchState.phase === 'closed') burstPouch();
  else if (pouchState.phase === 'flip') { clearTimeout(cache.pouchFlip); const kids = $('pouchCards').children; while (pouchState.i < kids.length) { kids[pouchState.i].classList.add('is-flip'); pouchState.i++; } sfx('flip', 1); flipNext(); }
});

/* ---------- run save / resume (this browser only) ---------- */
const RUN_KEY = 'talnori-run-v4';
function saveRun() { if (!G || G.phase !== 'play' || COOP.on) return; try { localStorage.setItem(RUN_KEY, JSON.stringify(serialize())); } catch (err) { /* ignore */ } }
function clearRun() { try { localStorage.removeItem(RUN_KEY); } catch (err) { /* ignore */ } }
function savedRun() { try { const s = JSON.parse(localStorage.getItem(RUN_KEY) || 'null'); return s && s.v >= 6 && s.v <= 8 && s.phase === 'play' ? s : null; } catch (err) { return null; } }
function resumeRun() {
  const s = savedRun(); if (!s) return;
  auInit(); sfx('click');
  el.lobby.hidden = true; el.endOv.hidden = true; closeRecipes(); closeChal();
  R.lobby = false; document.body.classList.remove('in-lobby');
  UVIS.clear(); FX.length = 0; PART.length = 0; TEXT.length = 0; FLY.length = 0;
  if (!restore(s)) { clearRun(); goLobby(); return; }
  G.paused = false; cache.infoKey = ''; cache.vo = -1; cache.coinShow = null;
  R.theme = STAGES[G.stage].theme;
  layout(); refreshInfo(); refreshUps();
  musicMode(G.boss ? 'boss' : 'play');
  toast(`${STAGES[G.stage].name} 제 ${G.wave} 마당부터 이어서 놀아요`);
}

/* ---------- codex ---------- */
let codexFilter = 'all';
const isHiddenMyth = M => !!M.secret && !SAVE.made[M.id] && !(G && G.stats && G.stats.crafted && G.stats.crafted[M.id]);
const seenNow = id => !!(SAVE.seen[id] || (G && G.stats && G.stats.seen && G.stats.seen[id]));
function ingMasked(id) { return seenNow(id) ? ingHTML(id, false) : `<span class="ing" style="border-left:3px solid ${TIERS[TYPES[TYPE_IX[id]].tier].color}">???</span>`; }
function perksHTML(T) {
  const lv = lvOf(T.id);
  return `<div class="perks">${lvPerks(T).map(([at, txt]) => `<span class="${lv >= at ? 'pk-on' : 'pk-off'}">Lv ${at} ${esc(txt)}${lv >= at ? '' : ' 🔒'}</span>`).join('')}</div>`;
}
function mythOpenNote(M) {
  if (M.secret) return '';
  if (MYTH_FREE.includes(M.id)) return '<div class="pc">처음부터 열려 있어요</div>';
  if (SAVE.mopen[M.id]) return '<div class="pc">두루마리로 열었어요</div>';
  return `<div class="pc lk">🔒 신화 두루마리 ${scrollCost(M)}개로 열어요</div>`;
}
function codexHTML(interactive) {
  const out = [], onlyLv = interactive && codexFilter === 'lv';
  let head = '';
  const flush = () => { if (head) { out.push(head); head = ''; } };
  const madeN = MYTHS.filter(M => SAVE.made[M.id]).length;
  for (const [rk, Ro] of Object.entries(ROLES)) {
    head = (rk === 'aoe' ? `<h3 class="sect" style="--g:${TIERS[4].color}"><i></i>신화 ${madeN}/${MYTHS.length} <small>어느 고을에서든 만들 수 있어요. 숨은 신화는 직접 찾아요</small></h3>` : '') + `<h4 class="subsect" style="--g:${Ro.color}">${Ro.name}</h4>`;
    for (const M of MYTHS.filter(m => TYPES[m.ix].role === rk)) {
      const T = TYPES[M.ix], made = SAVE.made[M.id] || 0;
      if (onlyLv && (!canLevel(T.id) || isHiddenMyth(M))) continue;
      flush();
      if (isHiddenMyth(M)) { out.push(`<div class="recipe is-secret"><img class="mi" alt="" src="${portraitURL(T.id, 52, true)}"><div><div class="nm">숨은 신화${roleChip(T)}<small>아직 아무도 몰라요</small></div><p style="margin:2px 0 0;font-size:12px;line-height:1.4">재료 ${M.parts.length}가지를 우연히 모으면 신화 버튼에 조합이 떠요</p><div class="ings">${M.parts.map(() => '<span class="ing">?</span>').join('')}</div></div><div class="lvb"></div></div>`); continue; }
      const known = made > 0, grp = T.grp ? `${GRP[T.grp]} · ` : '';
      out.push(`<div class="recipe${known ? '' : ' is-unmade'}"><img class="mi" alt="" src="${portraitURL(T.id, 52, !known)}"><div><div class="nm">${known ? esc(T.name) : '???'}${roleChip(T)}<small>${grp}${known ? `${esc(T.origin)} · ${made}번 조합` : '아직 못 만듦'}</small></div>${known ? `<div class="unit-sk" data-tip="${T.id}" style="font-size:12px;color:var(--dan-gold)">${esc(T.skill)}</div><p style="margin:2px 0 0;font-size:12px;line-height:1.4">${esc(T.desc)}</p>${ULTS[T.id] ? `<p class="ultline">궁극기 ${esc(ULTS[T.id].name)} · ${esc(ULTS[T.id].desc)} · ${ULTS[T.id].t}초마다</p>` : ''}${perksHTML(T)}` : '<p style="margin:2px 0 0;font-size:12px;line-height:1.4">처음 조합하면 정체가 밝혀져요</p>'}<div class="ings">${M.parts.map(p => WILD[p] ? wildHTML(p, false) : TYPES[TYPE_IX[p]].tier >= 4 ? (SAVE.made[p] ? ingHTML(p, false) : `<span class="ing" style="border-left:3px solid ${TIERS[4].color}">${isHiddenMyth(MYTH_BY[p]) ? '숨은 신화' : '???'}</span>`) : ingMasked(p)).join('')}</div>${mythOpenNote(M)}</div>${unitLvHTML(T, interactive)}</div>`);
    }
  }
  const notes = ['소환하면 대부분 이 등급이 나와요. 같은 동료 셋을 합성하면 희귀가 돼요', '같은 일반 셋을 합성하거나 소환·재수굿에서 나와요', '같은 희귀 셋을 합성하거나 대동굿에서 나와요', '같은 영웅 셋을 합성하거나 별신굿에서 나와요'];
  for (let t = 0; t < 4; t++) {
    head = `<h3 class="sect" style="--g:${TIERS[t].color}"><i></i>${TIERS[t].name} <small>${notes[t]}</small></h3>`;
    for (const id of ROSTER) {
      const T = TYPES[TYPE_IX[id]]; if (T.tier !== t) continue;
      const seen = seenNow(T.id);
      if (onlyLv && (!canLevel(T.id) || !seen)) continue;
      flush();
      if (!seen) { out.push(`<div class="unit is-new"><img alt="" src="${portraitURL(T.id, 52, true)}"><div><div class="nm">???<small style="color:${FAMS[T.fam].color}">${esc(FAMS[T.fam].name)}</small></div><p>아직 못 만났어요. 판에서 만나면 정체가 밝혀져요</p></div>${unitLvHTML(T, false)}</div>`); continue; }
      const pn = partsNote(T);
      out.push(`<div class="unit"><img alt="" src="${portraitURL(T.id, 52)}"><div><div class="nm">${esc(T.name)}<small style="color:${FAMS[T.fam].color}">${esc(FAMS[T.fam].name)}</small><small>${esc(T.origin)}</small></div><div class="sk" data-tip="${T.id}">${esc(T.skill)}</div><p>${esc(T.desc)}</p>${perksHTML(T)}${pn ? `<div class="pc">${esc(pn)}</div>` : ''}</div>${unitLvHTML(T, interactive)}</div>`);
    }
  }
  return out.join('');
}
function foeHTML() {
  return FOE_KEYS.map(k => {
    const I = foeInfo(k), seen = SAVE.foes[k];
    return `<div class="unit${seen ? '' : ' is-new'}"><img alt="" src="${foePortraitURL(k, 52, !seen)}"><div><div class="nm">${seen ? esc(I.name) : '???'}<small>${I.kind}</small><small>${esc(I.where)}</small></div><p>${seen ? esc(I.desc) : '아직 만나지 못했어요'}</p></div><div class="lvb"></div></div>`;
  }).join('');
}
function whereHTML() { return '<div class="pc">모든 고을에서 나와요</div>'; }
function unitLvHTML(T, interactive) {
  const lv = lvOf(T.id), n = needFor(T.id), pcs = pcsOf(T.id), myth = T.tier >= 4, have = myth ? SAVE.hyang || 0 : pcs, need = n ? (myth ? n.hyang : n.pcs) : 0;
  const pct = n ? Math.min(100, have / need * 100) : 100;
  const btn = interactive && n ? `<button class="btn-sm${canLevel(T.id) ? ' is-go' : ''}" type="button" data-lv="${T.id}" ${canLevel(T.id) ? '' : 'disabled'}><span class="silver-ico" style="display:inline-block;width:11px;height:11px;vertical-align:-1px"></span> ${fmtC(n.silver)}</button>` : '';
  const wu = n && !myth && pcs < n.pcs && canLevel(T.id) ? Math.min(wildUse(T.id), SAVE.wild || 0) : 0;
  const tag = lv >= lvTop(T) ? '<em class="awk">최고</em>' : myth && lv >= 10 ? '<em class="awk">신물</em>' : myth && lv >= 5 ? '<em class="awk">각성</em>' : '';
  return `<div class="lvb"><span class="lvt">Lv ${lv}${tag}</span>${n ? `<div class="pc"><span class="num">${myth ? '<i class="hyang-ico"></i>' : ''}${fmtC(have)}/${fmtC(need)}${wu ? ` <small style="color:#9ff0c0">+만능 ${wu}</small>` : ''}</span><div class="bar" style="width:52px"><i style="width:${pct}%"></i></div></div>` : ''}${btn}</div>`;
}
function openCodex() {
  cache.codexWas = G.paused;
  if (G.phase === 'play') G.paused = true;
  el.codexBody.innerHTML = codexHTML(false);
  el.codexOv.hidden = false; el.codexOv.scrollTop = 0; $('codexClose').focus();
}
function closeCodex() { el.codexOv.hidden = true; if (G.phase === 'play') G.paused = !!cache.codexWas; }
$('codexClose').addEventListener('click', closeCodex);

/* ---------- lobby ---------- */
const TABS = ['home', 'shop', 'relic', 'codex', 'quest', 'ach'];
let curTab = 'home';
function selectTab(t) {
  curTab = t;
  for (const k of TABS) { $('tab-' + k).setAttribute('aria-selected', String(k === t)); $('body-' + k).hidden = k !== t; }
  renderTab(); sfx('click'); $('body-' + t).scrollTop = 0;
}
TABS.forEach(k => $('tab-' + k).addEventListener('click', () => selectTab(k)));
const STAGE_REC = [1, 4, 6, 8, 10];
function avgLevel() { const ids = LIVE.filter(T => T.tier < 4 && SAVE.seen[T.id]).map(T => lvOf(T.id)); return ids.length ? ids.reduce((a, b) => a + b, 0) / ids.length : 1; }
function questRows(list, def, kind) {
  return list.map((q, i) => {
    const Q = def(q.id); if (!Q) return '';
    const pct = Math.min(100, q.prog / Q.goal * 100), done = q.prog >= Q.goal, cur = Q.max ? Math.max(0, Math.min(q.prog, Q.goal)) : Math.min(q.prog, Q.goal);
    return `<div class="qrow${q.claimed ? ' is-done' : ''}"><div><div class="qt">${esc(Q.text)}</div><div class="qr"><i class="silver-ico" style="width:11px;height:11px"></i>${fmtC(Q.silver)}${Q.jade ? ` · <i class="jade-ico" style="width:11px;height:11px"></i>${Q.jade}` : ''} · 조각 ${kind === 'w' ? 4 : 2} · <span class="num">${fmtC(cur)}/${fmtC(Q.goal)}</span></div></div>${q.claimed ? '<span class="meta">받음</span>' : `<button class="btn-sm${done ? ' is-go' : ''}" type="button" data-${kind}q="${i}" ${done ? '' : 'disabled'}>받기</button>`}<div class="bar"><i style="width:${pct}%"></i></div></div>`;
  }).join('');
}
function untilMidnight() { const d = new Date(), m = new Date(d); m.setHours(24, 0, 0, 0); const s = Math.max(0, (m - d) / 1000 | 0); return `${s / 3600 | 0}시간 ${(s % 3600) / 60 | 0}분`; }
function stageCardsHTML() {
  return STAGES.map((S, i) => {
    const open = stageUnlocked(i), sel = SAVE.stageSel === i, best = SAVE.stageBest[i], clear = SAVE.stageClear[i], rn = roadReady(i);
    const stars = '★'.repeat(i + 1) + '☆'.repeat(STAGES.length - 1 - i);
    const status = !open ? '앞 고을 80 마당을 지키면 열려요' : clear ? '80 마당 지켜냄' : best ? `최고 제 ${Math.min(best, LAST_WAVE)} 마당` : '아직 안 가 봄';
    return `<button class="stg th-${S.theme}${sel ? ' is-sel' : ''}${open ? '' : ' is-lock'}" type="button" data-stage="${i}" aria-pressed="${sel}"><span class="sn">${esc(S.name)}${rn ? `<i class="dotb">${rn}</i>` : ''}</span><span class="sd">${stars}</span><span class="sb">${status}</span><span class="sr">권장 Lv ${STAGE_REC[i]}+</span></button>`;
  }).join('');
}
function roadHTML(st) {
  const S = STAGES[st], ready = roadReady(st);
  const nodes = [];
  for (let k = 1; k <= 8; k++) {
    const state = roadState(st, k), w = roadReward(st, k), bk = S.bosses[k * 10], known = SAVE.foes['b_' + bk];
    const extra = w.scroll ? '두루마리' : w.relic ? `유물 ${w.relic}` : w.pouch ? (w.pouch === 'big' ? '큰 주머니' : '복주머니') : `옥 ${w.jade}`;
    nodes.push(`<button class="node is-${state}" type="button" data-road="${st}-${k}" aria-label="제 ${k * 10} 마당 보스 보상 ${state === 'claimed' ? '받음' : state === 'ready' ? '받을 수 있어요' : '아직'}"><span class="nw">${k * 10}</span><span class="nb"><img alt="" src="${foePortraitURL('b_' + bk, 34, !known)}"></span><span class="nr">${state === 'claimed' ? '받음' : extra}</span>${state === 'claimed' ? '<i class="seal">참</i>' : ''}</button>`);
  }
  return `<div class="road"><div class="qhead"><h3 class="sect" style="--g:#d63b2e"><i></i>고을 길 <small>보스 첫 처치 보상</small></h3>${ready ? `<button class="btn-sm is-go" type="button" data-roadall="${st}">모두 받기 ${ready}</button>` : ''}</div><div class="nodes">${nodes.join('')}</div></div>`;
}
function guideHTML() {
  const S = guideStep(); if (!S) return '';
  const i = SAVE.guide || 0, ok = S.test(SAVE);
  const rw = [S.silver ? `은전 ${fmtC(S.silver)}` : '', S.jade ? `옥 ${S.jade}` : '', S.hyang ? `향 ${S.hyang}` : '', S.scroll ? `신화 두루마리 ${S.scroll}` : ''].filter(Boolean).join(' · ');
  return `<div class="qrow guide${ok ? ' is-ready' : ''}"><div><div class="qt">길잡이 ${i + 1}/${GUIDE.length} · ${esc(S.text)}</div><div class="qr">보상 ${esc(rw)}${i === GUIDE.length - 1 ? ' · 마지막 보상으로 원하는 신화를 열어요' : ''}</div></div><button class="btn-sm${ok ? ' is-go' : ''}" type="button" data-guide="1" ${ok ? '' : 'disabled'}>${ok ? '받기' : '하는 중'}</button></div>`;
}
function attHTML() {
  const ready = attReady(), n = SAVE.att.n, cur = n % 7, todayIdx = ready ? cur : (n - 1) % 7;
  return `<div class="attcard"><div class="qhead"><h3 class="sect" style="--g:#d63b2e"><i></i>출석 도장 <small>${ready ? '오늘 도장을 찍어 주세요' : '내일 또 와요'}</small></h3><button class="btn-sm${ready ? ' is-go' : ''}" type="button" data-att="1" ${ready ? '' : 'disabled'}>${ready ? '도장 찍기' : '찍었어요'}</button></div>
    <div class="stamps">${ATT.map((A, i) => { const done = ready ? i < cur : i <= todayIdx; return `<div class="stamp${done ? ' is-done' : ''}${ready && i === cur ? ' is-today' : ''}${A.pouch || A.jade ? ' is-pouch' : ''}"><span class="d">${i + 1}일</span><span class="r">${esc(A.text)}</span><i class="seal">참</i></div>`; }).join('')}</div></div>`;
}
function relicCardHTML(r) {
  const lv = relicLv(r.id), sp = relicCopies(r.id), n = relicNeed(r.id), Gr = RELIC_GRADE[r.g || 0], ok = canRelicUp(r.id);
  const up = n ? `<div class="pc"><span class="num">조각 ${sp}/${n.pcs}</span><div class="bar" style="width:46px"><i style="width:${Math.min(100, sp / n.pcs * 100)}%"></i></div></div><button class="btn-sm rup${ok ? ' is-go' : ''}" type="button" data-rup="${r.id}" ${ok ? '' : 'disabled'}>Lv ${lv + 1} <i class="silver-ico" style="display:inline-block;width:11px;height:11px;vertical-align:-1px"></i> ${fmtC(n.silver)}</button>` : '';
  return `<div class="relic${lv ? '' : ' is-none'}" style="--rg:${Gr.color}"><div class="ri">${relicIcon(r.id, 46, !lv)}${lv ? `<span class="rlv">Lv ${lv}</span>` : ''}</div><div class="rt"><b>${esc(r.name)}</b><small><span class="rgr">${Gr.name}</span> · ${esc(r.era)}</small><p>${lv ? esc(relicText(r, lv)) : '아직 못 찾았어요'}</p>${lv ? (n ? `<p class="rn">다음 · ${esc(relicText(r, lv + 1))}</p>${up}` : '<p class="rn">최고 레벨</p>') : ''}</div></div>`;
}
function relicSummary() {
  const b = relicBonuses(), parts = [];
  if (b.atk) parts.push(`모든 공격력 +${Math.round(b.atk * 100)}%`);
  if (b.myth) parts.push(`신화 +${Math.round(b.myth * 100)}%`);
  if (b.boss) parts.push(`보스 피해 +${Math.round(b.boss * 100)}%`);
  ['일반·희귀', '영웅', '전설'].forEach((nm, k) => { if (b.gr[k]) parts.push(`${nm} +${Math.round(b.gr[k] * 100)}%`); });
  if (b.crit) parts.push(`치명타 +${Math.round(b.crit * 100)}%`);
  if (b.coins0) parts.push(`시작 엽전 +${b.coins0}`);
  if (b.hon0) parts.push(`시작 혼 +${b.hon0}`);
  if (b.bossTime) parts.push(`보스 시간 +${b.bossTime}초`);
  return parts.length ? parts.join(' · ') : '아직 효과가 없어요';
}
function renderTab() {
  ensureQuests(); ensureWeekly(); ensureMarket();
  const nq = SAVE.quests.list.filter(q => { const Q = questDef(q.id); return Q && !q.claimed && q.prog >= Q.goal; }).length + SAVE.weekly.list.filter(q => { const Q = weekDef(q.id); return Q && !q.claimed && q.prog >= Q.goal; }).length + (bonusReady() ? 1 : 0);
  const na = ACHS.filter(A => !SAVE.ach[A.id] && A.test(SAVE)).length;
  const nl = levelableCount(), nh = (attReady() ? 1 : 0) + roadReady() + (guideReady() ? 1 : 0), boxes = Math.floor((SAVE.jade || 0) / RELIC_BOX.one.jade);
  /* the ! means "you can open a box you haven't looked at yet": visiting 유물 clears it until more 옥 comes in */
  if ((SAVE.relicSeen || 0) > boxes || (curTab === 'relic' && SAVE.relicSeen !== boxes)) { SAVE.relicSeen = boxes; persist(); }
  const nr = boxes > (SAVE.relicSeen || 0) ? 1 : 0;
  for (const [id, v] of [['qBadge', nq], ['aBadge', na], ['cBadge', nl], ['hBadge', nh], ['rBadge', nr]]) { $(id).hidden = !v; $(id).textContent = id === 'rBadge' ? '!' : v; }
  const b = $('body-' + curTab);
  if (curTab === 'home') {
    const run = savedRun(), S = STAGES[SAVE.stageSel] || STAGES[0];
    const bosses = [10, 40, 80].map(w => `${w} ${BOSS_DEF[S.bosses[w]].name}`).join(' · ');
    b.innerHTML = (run ? `<div class="homegrid"><button class="btn-main" id="resumeBtn" type="button">이어하기 · ${esc(STAGES[run.stage || 0].name)} ${run.wave}마당</button>${curHTML()}</div><button class="btn-sub" id="startBtn" type="button">새로 시작 · ${esc(S.name)} <small style="font-size:12px;color:var(--hanji-dim)">(하던 판은 사라져요)</small></button>`
        : `<div class="homegrid"><button class="btn-main" id="startBtn" type="button">놀이 시작 · ${esc(S.name)}</button>${curHTML()}</div>`) + `
      <button class="btn-sub coopbtn" id="coopBtn" type="button">친구랑 같이 · ${esc(S.name)}${NET.link ? ` <small>방 ${esc(NET.code)}</small>` : ''}</button>
      ${guideHTML()}
      <h3 class="sect" style="--g:#c9a878"><i></i>고을 고르기 <small>80 마당을 지키면 다음 고을</small></h3>
      <div class="stages">${stageCardsHTML()}</div>
      <p class="meta">${esc(S.rule)} · 보스 ${esc(bosses)}${S.reward > 1 ? ` · 은전 보상 ×${S.reward}` : ''} · 내 동료 평균 Lv ${avgLevel().toFixed(1)}</p>
      ${roadHTML(SAVE.stageSel || 0)}
      <details class="mythrow"><summary>신화 ${MYTHS.filter(M => mythOpenSelf(M.id)).length}/${MYTHS.length} 열림 · <span class="scr-n">신화 두루마리 ${SAVE.scroll || 0}</span> · <span class="hy-n"><i class="hyang-ico"></i>향 ${fmtC(SAVE.hyang || 0)}</span></summary>${MYTHS.map(M => { const id = M.id; if (isHiddenMyth(M)) return `<span class="ing"><img alt="" src="${portraitURL(id, 22, true)}">숨은 신화</span>`; const open = mythOpenSelf(id), afford = !open && (SAVE.scroll || 0) >= scrollCost(M); return `<button class="ing mchip${open ? '' : ' is-lock'}${afford ? ' can' : ''}" type="button" data-myth="${id}"><img alt="" src="${portraitURL(id, 22, !SAVE.made[id])}">${SAVE.made[id] ? esc(TYPES[TYPE_IX[id]].name) : '???'}${open ? '' : '<i class="lk" aria-label="잠김">🔒</i>'}</button>`; }).join('')}<small>동료 19명은 모든 고을에서 똑같아요 · 🔒 누르면 두루마리로 열 수 있어요</small></details>
      ${attHTML()}
      <div class="qrow"><div><div class="qt">퀘스트 · 오늘 ${SAVE.quests.list.filter(q => q.claimed).length}/3 · 이번 주 ${SAVE.weekly.list.filter(q => q.claimed).length}/3</div><div class="qr">${nq ? `받을 보상이 ${nq}개 있어요` : `오늘 것은 ${untilMidnight()} 뒤 바뀌어요`}</div></div><button class="btn-sm${nq ? ' is-go' : ''}" type="button" data-goto="quest">보러 가기</button></div>
      <div class="qrow"><div><div class="qt">유물 ${relicCount()}/${RELICS.length}</div><div class="qr">${esc(relicSummary())}</div></div><button class="btn-sm${nr ? ' is-go' : ''}" type="button" data-goto="relic">유물로</button></div>
      <div class="qrow"><div><div class="qt">장터</div><div class="qr">복주머니를 열고 오늘의 조각을 사요. 레벨 올릴 수 있는 동료 ${nl}명</div></div><button class="btn-sm" type="button" data-goto="shop">장터로</button></div>
      <p class="meta">최고 기록 ${SAVE.stats.best ? (SAVE.stats.best > LAST_WAVE ? '고을 지킴' : `제 ${SAVE.stats.best} 마당`) : '아직 없음'} · ${SAVE.stats.games}판 · 신화 조합 ${SAVE.stats.crafts}번 · 보스 ${SAVE.stats.bossKills || 0}마리</p>
      <p class="meta" id="syncLine">${syncText()}</p>
      <p class="meta">하던 판은 이 브라우저에서만 이어할 수 있어요. Space 소환 · G 굿 · M 신화 · C 도전 · P 멈춤</p>`;
    $('startBtn').addEventListener('click', startGame);
    $('coopBtn').addEventListener('click', openCoop);
    if (run) $('resumeBtn').addEventListener('click', resumeRun);
  } else if (curTab === 'shop') {
    const M = ensureMarket();
    b.innerHTML = `<div class="qhead"><h3 class="sect" style="--g:var(--dan-gold)"><i></i>장터</h3>${curHTML()}</div>
      <div class="pouches">${Object.entries(POUCHES).map(([k, P]) => { const ok = canBuyPouch(k); return `<div class="pouchcard ${k}"><div class="pm">${pouchSVG(k)}</div><div class="pt"><b>${P.name}</b><small>조각 ${P.min}~${P.max}장${P.guarantee ? ` · ${TIERS[P.guarantee].name} 이상 하나` : ''}</small></div><button class="btn-sm${ok ? ' is-go' : ''}" type="button" data-pouch="${k}" ${ok ? '' : 'disabled'}>${P.jade ? `<i class="jade-ico" style="display:inline-block;width:11px;height:11px;vertical-align:-1px"></i> ${P.jade}` : `<i class="silver-ico" style="display:inline-block;width:11px;height:11px;vertical-align:-1px"></i> ${fmtC(P.cost)}`}</button></div>`; }).join('')}</div>
      <p class="meta">주머니마다 몇 장이 나올지 몰라요. 가끔 대박이 터지면 두 배로 나와요</p>
      <h3 class="sect" style="--g:#3a8a4a"><i></i>오늘의 장터 <small>${untilMidnight()} 뒤 물건이 바뀌어요</small></h3>
      ${M.offers.map((O, i) => { const T = TYPES[TYPE_IX[O.id]], n = needFor(O.id); return `<div class="offer${O.bought ? ' is-done' : ''}"><img alt="" src="${portraitURL(O.id, 48)}"><div><div class="nm">${esc(T.name)} 조각 ×${O.n}<small style="color:${TIERS[T.tier].color}">${TIERS[T.tier].name}</small></div><div class="qr">가진 조각 ${pcsOf(O.id)}${n ? ` · 다음 레벨에 ${n.pcs}개` : ' · 최고 레벨'}</div></div>${O.bought ? '<span class="meta">샀어요</span>' : `<button class="btn-sm${SAVE.silver >= O.price ? ' is-go' : ''}" type="button" data-buy="${i}" ${SAVE.silver >= O.price ? '' : 'disabled'}><i class="silver-ico" style="display:inline-block;width:11px;height:11px;vertical-align:-1px"></i> ${fmtC(O.price)}</button>`}</div>`; }).join('')}
      <h3 class="sect" style="--g:#3fae6a"><i></i>옥 상점 <small>만능 조각 ${fmtC(SAVE.wild || 0)}개 가짐</small></h3>
      ${Object.entries(JADE_SHOP).map(([k, J]) => { const ok = (SAVE.jade || 0) >= J.jade; return `<div class="offer"><div class="jicon">${k === 'reroll' ? '↻' : k === 'scroll' ? '📜' : '✦'}</div><div><div class="nm">${J.name}${k === 'scroll' ? ` <small class="num">가진 것 ${SAVE.scroll || 0}</small>` : ''}</div><div class="qr">${k === 'reroll' ? '오늘의 장터 물건 세 개를 새로 들여요' : k === 'scroll' ? '잠긴 신화를 여는 데 써요. 신화 하나, 신수 둘, 전래동화 셋이 들어요' : '일반부터 전설까지 아무 동료 조각 하나로 쓸 수 있어요. 레벨 올릴 때 모자란 만큼 알아서 채워요'}</div></div><button class="btn-sm${ok ? ' is-go' : ''}" type="button" data-jade="${k}" ${ok ? '' : 'disabled'}><i class="jade-ico" style="display:inline-block;width:11px;height:11px;vertical-align:-1px"></i> ${J.jade}</button></div>`; }).join('')}
      <div class="qrow"><div><div class="qt">동료 레벨 올리기</div><div class="qr">동료는 조각과 은전으로 12레벨까지, 신화는 향과 은전으로 15레벨까지 올려요. 3·6·9·12레벨마다 능력이 열려요. 지금 ${nl}명 올릴 수 있어요</div></div><button class="btn-sm${nl ? ' is-go' : ''}" type="button" data-goto="lv">도감으로</button></div>`;
  } else if (curTab === 'relic') {
    b.innerHTML = `<div class="qhead"><h3 class="sect" style="--g:#e8b84a"><i></i>유물 <span class="num">${relicCount()}/${RELICS.length}</span></h3>${curHTML()}</div>
      <div class="sumcard"><p>옛 보물이 모든 판을 조금씩 세게 해 줘요. 상자를 열면 등급부터 정해져요. 보통 62% · 귀함 30% · 국보 8%, 열 번 안에 국보 하나는 꼭 나와요${SAVE.rpity ? ` (국보까지 최대 ${RELIC_PITY - SAVE.rpity}번)` : ''}. 처음 찾으면 Lv 1이고, 또 나오면 조각이 돼요. 조각과 은전으로 직접 올려요</p><p style="color:var(--dan-gold)">${esc(relicSummary())}</p></div>
      <div class="boxes">${Object.entries(RELIC_BOX).map(([k, B]) => { const ok = (SAVE.jade || 0) >= B.jade; return `<div class="pouchcard relicbox"><div class="pm">${pouchSVG('relic')}</div><div class="pt"><b>${B.name}</b><small>유물 ${B.n}개</small></div><button class="btn-sm${ok ? ' is-go' : ''}" type="button" data-box="${k}" ${ok ? '' : 'disabled'}><i class="jade-ico" style="display:inline-block;width:11px;height:11px;vertical-align:-1px"></i> ${B.jade}</button></div>`; }).join('')}</div>
      <div class="relics">${RELICS.map(relicCardHTML).join('')}</div>`;
  } else if (curTab === 'codex') {
    const cc = codexCount(), fc = foeCount();
    b.innerHTML = `<div class="sumcard"><div class="qhead"><h3 class="sect" style="--g:var(--dan-gold)"><i></i>도감 <span class="num">${cc}/${LIVE.length}</span> <small>도깨비 ${fc}/${FOE_KEYS.length}</small></h3>${curHTML(true)}</div><div class="bar"><i style="width:${Math.round((cc + fc) / (LIVE.length + FOE_KEYS.length) * 100)}%"></i></div>
      <p class="meta">판에서 처음 만난 동료와 도깨비가 도감에 올라가요. 못 만난 동료는 ???로 가려져 있어요. 새 동료는 은전 100, 새 도깨비는 은전 50을 줘요</p>
      <p class="meta">판이 끝나면 만난 동료의 조각과 향을 받아요. 동료는 레벨마다 공격력 15%, 3·6·9·12레벨에 새 능력. 신화는 레벨마다 12%, 5레벨 각성 10레벨 신물. 15레벨 승천은 곧 열려요</p>
      <div class="chips"><button class="chipbtn" type="button" data-filter="all" aria-pressed="${codexFilter === 'all'}">동료</button><button class="chipbtn" type="button" data-filter="lv" aria-pressed="${codexFilter === 'lv'}">올릴 수 있는 동료 ${nl}</button><button class="chipbtn" type="button" data-filter="foe" aria-pressed="${codexFilter === 'foe'}">도깨비</button></div></div>
      ${codexFilter === 'foe' ? foeHTML() : (codexHTML(true).replace(/^\s*$/, '') || '<p class="meta">지금 올릴 수 있는 동료가 없어요. 판을 더 돌거나 장터에서 조각을 모아 보세요</p>')}`;
  } else if (curTab === 'quest') {
    const all = SAVE.quests.list.every(q => q.claimed), got = SAVE.qbonus === SAVE.quests.day;
    b.innerHTML = `<div class="qhead"><h3 class="sect" style="--g:var(--dan-gold)"><i></i>오늘의 퀘스트</h3>${curHTML()}</div><p class="meta">${untilMidnight()} 뒤 새 퀘스트로 바뀌어요. 진행은 판이 끝날 때 쌓여요</p>${questRows(SAVE.quests.list, questDef, 'd')}
      <div class="qrow bonus${got ? ' is-done' : ''}"><div><div class="qt">오늘 퀘스트 셋 모두 받기</div><div class="qr"><i class="jade-ico" style="width:11px;height:11px"></i>옥 10</div></div>${got ? '<span class="meta">받음</span>' : `<button class="btn-sm${all ? ' is-go' : ''}" type="button" data-bonus="1" ${all ? '' : 'disabled'}>받기</button>`}</div>
      <h3 class="sect" style="--g:#4f8ad8"><i></i>이번 주 퀘스트 <small>${untilWeek()} 뒤 바뀌어요</small></h3>${questRows(SAVE.weekly.list, weekDef, 'w')}`;
  } else {
    const rows = ACHS.map(A => { const ok = A.test(SAVE), got = !!SAVE.ach[A.id], pr = A.prog ? A.prog(SAVE) : null; return { A, ok, got, pr, order: got ? 2 : ok ? 0 : 1, frac: pr ? pr[0] / pr[1] : 0 }; }).sort((a, b) => a.order - b.order || b.frac - a.frac);
    const done = rows.filter(r => r.got).length;
    b.innerHTML = `<div class="qhead"><h3 class="sect" style="--g:var(--dan-gold)"><i></i>업적 <span class="num">${done}/${ACHS.length}</span></h3>${curHTML()}</div>` + rows.map(({ A, ok, got, pr }) => `<div class="achrow${got ? ' is-claimed' : ''}"><div><div class="at">${esc(A.text)}</div><div class="ar"><i class="silver-ico" style="width:11px;height:11px"></i>${fmtC(A.silver)}${A.jade ? ` · <i class="jade-ico" style="width:11px;height:11px"></i>${A.jade}` : ''}${pr && !got ? ` · <span class="num">${fmtC(pr[0])}/${fmtC(pr[1])}</span>` : ''}</div>${pr && !got && !ok ? `<div class="bar"><i style="width:${Math.min(100, pr[0] / pr[1] * 100)}%"></i></div>` : ''}</div>${got ? '<span class="meta">받음</span>' : `<button class="btn-sm${ok ? ' is-go' : ''}" type="button" data-a="${A.id}" ${ok ? '' : 'disabled'}>받기</button>`}</div>`).join('');
  }
}
function syncText() {
  const st = CLOUD.state, mv = ' <button class="linkbtn" type="button" data-savecode="1">기록 옮기기</button>';
  if (st === 'ok') return '<span class="sync ok"></span>Claude 계정에 저장됐어요. 다른 기기에서도 이어지고, 게임이 업데이트돼도 그대로예요.' + mv;
  if (st === 'loading' || st === 'idle') return '<span class="sync wait"></span>Claude 계정에서 기록을 불러오는 중이에요';
  if (st === 'error') return '<span class="sync bad"></span>지금은 계정 저장이 안 돼서 이 브라우저에만 저장하고 있어요. 화면을 한 번 누르면 다시 시도해요.' + mv;
  return '<span class="sync bad"></span>기록은 이 브라우저에 저장돼요. 폰이나 다른 컴퓨터에서 이어 하려면' + mv;
}
onCloudState = () => { const n = document.getElementById('syncLine'); if (n) n.innerHTML = syncText(); };
function centerOf(node) { const r = node.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
/* road rewards: pouches open with the usual animation, then the rest shows in the reward popup */
function presentRoad(title, outs) {
  const silver = outs.reduce((a, o) => a + o.silver, 0), jade = outs.reduce((a, o) => a + o.jade, 0), relics = [].concat(...outs.map(o => o.relics || [])), cards = [].concat(...outs.map(o => o.cards || []));
  const scroll = outs.reduce((a, o) => a + (o.scroll || 0), 0), hyang = outs.reduce((a, o) => a + (o.hyang || 0), 0);
  const pop = () => { showReward(title, silver, null, { jade, relics, scroll, hyang }); };
  auInit(); sfx('stamp');
  if (cards.length) openPouch(cards, outs.some(o => o.pouch === 'big') ? 'big' : 'small', title, false, pop); else pop();
}
el.lobby.addEventListener('click', e => {
  if (e.target.closest('[data-guide]')) { const S = claimGuide(); if (S) { showReward(`길잡이 · ${S.text}`, S.silver || 0, null, { jade: S.jade, hyang: S.hyang, scroll: S.scroll, note: S.scroll ? '두루마리로 고을 아래 신화 목록에서 원하는 신화를 열어 보세요' : '' }); renderTab(); } return; }
  const q = e.target.closest('[data-dq]');
  if (q) { const r = claimQuest(+q.dataset.dq); if (r) { renderTab(); showReward('퀘스트 보상', r.silver, r.pcs); } return; }
  const wq = e.target.closest('[data-wq]');
  if (wq) { const r = claimWeekly(+wq.dataset.wq); if (r) { renderTab(); showReward('주간 퀘스트 보상', r.silver, r.pcs, { jade: r.jade }); } return; }
  if (e.target.closest('[data-bonus]')) { const r = claimBonus(); if (r) { renderTab(); showReward('오늘 퀘스트 모두 완료', 0, null, { jade: r.jade }); } return; }
  const rd = e.target.closest('[data-road]');
  if (rd) {
    const [st, k] = rd.dataset.road.split('-').map(Number), state = roadState(st, k);
    if (state === 'locked') { toast(`${STAGES[st].name} 제 ${k * 10} 마당 보스를 잡으면 받아요`); sfx('tap'); return; }
    if (state === 'claimed') { toast('이미 받은 보상이에요'); return; }
    const o = claimRoad(st, k); if (o) { rd.classList.add('is-stamping'); renderTab(); presentRoad(`고을 길 · ${STAGES[st].name} ${k * 10} 마당`, [o]); }
    return;
  }
  const ra = e.target.closest('[data-roadall]');
  if (ra) { const st = +ra.dataset.roadall, outs = []; for (let k = 1; k <= 8; k++) { if (roadState(st, k) === 'ready') { const o = claimRoad(st, k); if (o) outs.push(o); } } if (outs.length) { renderTab(); presentRoad(`고을 길 · ${STAGES[st].name} 보상 ${outs.length}개`, outs); } return; }
  const ru = e.target.closest('[data-rup]');
  if (ru) { const id = ru.dataset.rup; if (relicUp(id)) { const r = RELICS[RELIC_IX[id]]; sfx('merge', 3); toast(`${r.name} Lv ${relicLv(id)} · ${relicText(r, relicLv(id))}`); const sc = $('body-relic').scrollTop; renderTab(); $('body-relic').scrollTop = sc; tweenSilver(false); } return; }
  const jd = e.target.closest('[data-jade]');
  if (jd) { const J = buyJade(jd.dataset.jade); if (J) { sfx('buy'); renderTab(); toast(J.n ? `만능 조각 ${J.n}개를 샀어요 · 모두 ${SAVE.wild}개` : J.scroll ? `신화 두루마리를 샀어요 · 모두 ${SAVE.scroll}개` : '오늘의 장터 물건을 새로 들였어요'); } else toast(`옥이 ${JADE_SHOP[jd.dataset.jade].jade} 필요해요`); return; }
  const bx = e.target.closest('[data-box]');
  if (bx) { const k = bx.dataset.box, got = buyRelicBox(k); if (got) { auInit(); renderTab(); openPouch(got, 'relic', RELIC_BOX[k].name, k); } else toast(`옥이 ${RELIC_BOX[k].jade} 필요해요`); return; }
  const pz = e.target.closest('[data-pouch]');
  if (pz) { const k = pz.dataset.pouch, cards = buyPouch(k); if (cards) { auInit(); renderTab(); tweenSilver(false); openPouch(cards, k, POUCHES[k].name, true); } else { const P = POUCHES[k]; toast(P.jade ? `옥이 ${P.jade} 필요해요` : `은전이 ${fmtC(P.cost)} 필요해요`); } return; }
  const by = e.target.closest('[data-buy]');
  if (by) { const O = buyOffer(+by.dataset.buy); if (O) { sfx('buy'); renderTab(); tweenSilver(false); toast(`${TYPES[TYPE_IX[O.id]].name} 조각 ${O.n}개를 샀어요`); } return; }
  const at = e.target.closest('[data-att]');
  if (at) {
    const stamp = $('body-home').querySelector('.stamp.is-today'), r = claimAtt(); if (!r) return;
    auInit(); sfx('stamp');
    if (stamp) { stamp.classList.add('is-stamping', 'is-done'); }
    setTimeout(() => {
      if (r.cards) openPouch(r.cards, r.A.pouch, `출석 ${r.idx + 1}일째 · ${POUCHES[r.A.pouch].name}`, false, r.jade ? () => showReward(`출석 ${r.idx + 1}일째`, 0, null, { jade: r.jade }) : null);
      else showReward(`출석 ${r.idx + 1}일째`, r.silver, r.pcs, { jade: r.jade });
      renderTab();
    }, 650);
    return;
  }
  const sg = e.target.closest('[data-stage]');
  if (sg) {
    const i = +sg.dataset.stage;
    if (!stageUnlocked(i)) { toast('앞 고을 80 마당을 끝까지 지키면 열려요'); sfx('gutfail'); return; }
    if (SAVE.stageSel !== i) { SAVE.stageSel = i; persist(); R.theme = STAGES[i].theme; layout(); }
    const sc = sg.parentElement.scrollLeft; renderTab(); const row = $('body-home').querySelector('.stages'); if (row) row.scrollLeft = sc; sfx('click');
    return;
  }
  const mc = e.target.closest('[data-myth]');
  if (mc) { openMythCard(mc.dataset.myth); return; }
  const gt = e.target.closest('[data-goto]');
  if (gt) { const g = gt.dataset.goto; if (g === 'lv') { codexFilter = levelableCount() ? 'lv' : 'all'; selectTab('codex'); } else selectTab(g); return; }
  const fl = e.target.closest('[data-filter]');
  if (fl) { codexFilter = fl.dataset.filter; renderTab(); return; }
  const a = e.target.closest('[data-a]');
  if (a) { const r = claimAch(a.dataset.a); if (r) { renderTab(); showReward('업적 보상', r.silver, null, { jade: r.jade }); } return; }
  const l = e.target.closest('[data-lv]');
  if (l) { const id = l.dataset.lv; if (levelUp(id)) { const T = TYPES[TYPE_IX[id]], lv = lvOf(id), pk = lvPerks(T).find(([at]) => at === lv); toast(`${T.name} ${lv}레벨! 공격력 +${Math.round((lvMulOf(T) - 1) * 100)}%${pk ? ` · ${pk[1]}` : ''}`); sfx('merge', pk ? 3 : 2); const sc = $('body-codex').scrollTop; renderTab(); $('body-codex').scrollTop = sc; tweenSilver(false); } }
});

/* ---------- end of game ---------- */
onEnd = reason => {
  if (COOP.on && COOP.onEnd) COOP.onEnd(reason);
  closeRecipes(); closeChal(); drag = null; clearRun(); R.pickExp = false; R.expInfo = false;
  const r = finishGame(), S = STAGES[G.stage];
  musicMode('off'); sfx(reason === 'win' ? 'win' : 'lose');
  const B = bossAt(G.wave);
  $('endTitle').textContent = reason === 'win' ? '대동놀이 대성공!' : '판이 끝났소';
  $('endReason').textContent = reason === 'win' ? `${josa(S.name, '을', '를')} 지켜냈어요` : reason === 'boss' ? `${josa(B ? B.name : '보스', '을', '를')} 시간 안에 잡지 못했어요` : reason === 'partner' ? `${pname()}의 마당이 무너졌어요. 같이 하면 같이 끝나요` : '도깨비가 마당을 가득 메웠어요';
  $('endStats').innerHTML = [S.name, `제 ${r.wave} 마당`, `도깨비 ${fmtC(G.stats.kills)}마리`, `합성 ${G.stats.merges}번`, `신화 ${G.stats.crafts}번`, `도전 ${G.stats.chalWins}번`].map(s => `<span>${s}</span>`).join('');
  $('endRewards').innerHTML = `<span class="rw silver-rw big"><i class="silver-ico"></i>은전 +<span class="num" id="endSilver">0</span></span>` + (r.jade ? `<span class="rw jade-rw big"><i class="jade-ico"></i>옥 +${r.jade}</span>` : '') + (r.hyang ? `<span class="rw hyang-rw big"><i class="hyang-ico"></i>향 +${r.hyang}</span>` : '') + pcsHTML(r.pieces);
  const notes = [];
  const top = G.units.map((u, i) => u && { u, k: killsOf(u) }).filter(o => o && o.k > 0).sort((a, b) => b.k - a.k).slice(0, 3);
  if (top.length) notes.push(`가장 많이 잡은 동료 · ${top.map(o => `${TYPES[o.u.t].name} ${fmtC(o.k)}`).join(' · ')}`);
  if (r.roadNew > 0) notes.push(`고을 길 보상 ${r.roadNew}개가 생겼어요. 마당에서 받으세요`);
  if (r.firstClear) notes.push(`80 마당을 처음 지킨 보너스 · 은전 +${fmtC(r.clearBonus)} · 옥 +30`);
  if (r.unlocked >= 0) notes.push(`새 고을이 열렸어요 · ${STAGES[r.unlocked].name}`);
  if (r.relicBonus) notes.push(`백자 달항아리 · 은전 +${fmtC(r.relicBonus)}`);
  if (r.newSeen.length) notes.push(`새 동료 ${r.newSeen.length}명 도감 등록 · 은전 +${fmtC(r.newSeen.length * 100)}`);
  if (r.newFoes.length) notes.push(`새 도깨비 ${r.newFoes.length}종 도감 등록 · 은전 +${fmtC(r.newFoes.length * 50)}`);
  if (r.chalSilver) notes.push(`도전 귀신 보상 · 은전 +${fmtC(r.chalSilver)}`);
  r.newMyth.forEach(id => notes.push(`새 신화 발견 · ${TYPES[TYPE_IX[id]].name}`));
  r.questDone.forEach(t => notes.push(`퀘스트 완료 · ${t}`));
  if (levelableCount()) notes.push(`지금 레벨을 올릴 수 있는 동료가 ${levelableCount()}명 있어요`);
  if (claimable()) notes.push('받을 보상이 있어요. 마당에서 확인하세요');
  $('endNotes').innerHTML = notes.map(n => `<li>${esc(n)}</li>`).join('');
  setTimeout(() => { el.endOv.hidden = false; $('againBtn').focus(); countUp($('endSilver'), r.silver, 1100); }, reason === 'win' ? 1600 : 800);
};
$('againBtn').addEventListener('click', () => {
  if (COOP.on && NET.link) { el.endOv.hidden = true; goLobby(); if (NET.role === 'host') toast('친구가 준비되면 같이 시작을 눌러요'); else toast('방장이 시작하면 같이 시작해요'); return; }
  el.endOv.hidden = true; startGame();
});
$('homeBtn').addEventListener('click', () => { el.endOv.hidden = true; goLobby(); setTimeout(() => tweenSilver(true), 250); });

/* ---------- HUD tick ---------- */
/* ---------- 판 안 임무: three pills under the boss bar ---------- */
const missRow = $('missRow');
function renderMissions() {
  if (!missRow) return;
  const M = G.phase === 'play' && G.miss;
  if (!M) { if (!missRow.hidden) missRow.hidden = true; return; }
  if (missRow.hidden) missRow.hidden = false;
  const sig = M.list.map(m => m.id + ':' + missProg(m) + '/' + m.goal).join('|');
  if (sig === cache.missSig) return;
  const fresh = cache.missSig && cache.missIds && M.list.map((m, k) => cache.missIds[k] !== m.id + m.from);
  cache.missSig = sig; cache.missIds = M.list.map(m => m.id + m.from);
  missRow.innerHTML = M.list.map((m, k) => { const D = missDef(m.id), rw = missReward(m), p = missProg(m); return `<button class="mp${fresh && fresh[k] ? ' is-new' : ''}" type="button" data-mk="${k}" aria-label="임무 ${esc(missText(m))} ${p}/${m.goal}"><b>${esc(D.short)}</b><span class="num">${p}/${m.goal}</span><span class="mr">${rw.coins ? `<i class="coin-ico"></i>${fmtC(rw.coins)}` : ''}${rw.hon ? `<i class="hon-ico"></i>${rw.hon}` : ''}</span><i class="mbar" style="width:${Math.round(p / m.goal * 100)}%"></i></button>`; }).join('');
}
if (missRow) missRow.addEventListener('click', e => { const b = e.target.closest('[data-mk]'); if (!b || !G.miss) return; const m = G.miss.list[+b.dataset.mk]; if (m) toast(`임무 · ${missText(m)} · ${missProg(m)}/${m.goal}`); });
function uiTick(dt) {
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) el.toast.classList.remove('is-on'); }
  vig = Math.max(0, vig - dt * 1.2);
  if (G.phase !== 'play') { el.vignette.style.opacity = vig.toFixed(2); return; }
  setText(el.wave, 'wave', `제 ${Math.max(1, G.wave)} 마당`);
  setText(el.timer, 'timer', `${Math.max(0, Math.ceil(G.waveT))}초`);
  setClass(el.timer, 't', 'is-boss', !!G.boss);
  const cT = Math.floor(G.coins);
  if (cache.coinShow == null || cT < cache.coinShow) cache.coinShow = cT; else if (cT > cache.coinShow) cache.coinShow = Math.min(cT, cache.coinShow + Math.max(1, Math.ceil((cT - cache.coinShow) * Math.min(1, dt * 7))));
  setText(el.coins, 'coins', fmtC(cache.coinShow));
  setText(el.hon, 'hon', String(G.hon));
  const n = G.foes.length, p = Math.min(1, n / BAL.cap), w = `${(p * 100).toFixed(1)}%`;
  if (cache.gw !== w) { cache.gw = w; el.gaugeFill.style.width = w; el.gauge.setAttribute('aria-valuenow', String(n)); }
  setClass(el.gaugeFill, 'g', 'is-warn', p >= 0.5 && p < 0.8);
  setClass(el.gaugeFill, 'g', 'is-danger', p >= 0.8);
  setText(el.gaugeText, 'gt', `도깨비 ${n} / ${BAL.cap}`);
  if (G.boss && !G.boss.dead) {
    setClass(el.bossRow, 'br', 'is-on', true);
    setText(el.bossName, 'bn', G.boss.name);
    const bw = `${Math.max(0, G.boss.hp / G.boss.max * 100).toFixed(1)}%`;
    if (cache.bw !== bw) { cache.bw = bw; el.bossFill.style.width = bw; }
    const pw = `${clamp(G.waveT / (G.bossTimeMax || BOSS_TIME) * 100, 0, 100).toFixed(1)}%`;
    if (cache.pw !== pw) { cache.pw = pw; $('bossPace').style.left = pw; }
    setText(el.bossTime, 'bt', `${Math.max(0, Math.ceil(G.waveT))}초 남음`);
  } else {
    setClass(el.bossRow, 'br', 'is-on', false);
    const nb = Math.min(LAST_WAVE, Math.max(10, Math.ceil((Math.max(1, G.wave) + 1) / 10) * 10)), B = bossAt(nb), S = STAGES[G.stage];
    setText(el.bossName, 'bn', B && G.wave <= nb ? `${S.name} · 다음 보스 · 제 ${nb} 마당 ${B.name}` : S.name);
    setText(el.bossTime, 'bt', '');
  }
  setText(el.summonCost, 'sc', fmtC(summonCost()));
  renderMissions();
  setClass(el.summonBtn, 'sb', 'is-short', G.coins < summonCost());
  setText(el.gutCost, 'gc', G.charmT > 0 ? `부적 ${Math.ceil(G.charmT)}초` : (G.pity || 0) >= PITY_MAX ? `${G.hon} 감천` : String(G.hon));
  renderGut(false);
  setClass(el.gutBtn, 'gb', 'is-short', G.hon < 1);
  cache.mt = (cache.mt || 0) + dt;
  if (cache.mt > 0.25) {
    cache.mt = 0;
    const SMy = MYTHS.filter(M => mythOpen(M.id)), sts = SMy.map(M => ({ M, st: recipeState(M) }));
    const ready = sts.filter(o => o.st.ready).length;
    const near = sts.filter(o => !o.st.ready && !isHiddenMyth(o.M)).sort((a, b) => b.st.have / b.M.parts.length - a.st.have / a.M.parts.length)[0];
    el.mythBadge.hidden = !ready; setText(el.mythBadge, 'mb', String(ready));
    setClass(el.mythBtn, 'mr', 'is-ready', ready > 0);
    setText(el.mythSub, 'ms', ready ? '조합 가능' : near && near.st.have ? `${near.st.have}/${near.M.parts.length} ${TYPES[near.M.ix].name}` : '조합표');
    renderRecipes(false);
    const live = G.foes.some(f => f.chal && !f.dead), nc = CHALS.filter((C, i) => chalReady(i) && G.wave >= C.rec).length + (expReady() && G.wave >= 3 ? 1 : 0), xr = G.exp.run;
    el.chalBadge.hidden = !nc; setText(el.chalBadge, 'cb', String(nc));
    setClass(el.chalBtn, 'cr', 'is-ready', nc > 0 && !live && !xr);
    setText(el.chalSub, 'cs', live ? '잡는 중' : xr ? `출정 ${Math.ceil(xr.t)}초` : nc ? '도전 · 출정' : `${Math.ceil(Math.min(...G.chalCd, G.exp.cd || 99))}초`);
    renderChal(false);
    const danger = p >= 0.6;
    if (!G.boss) musicMode(danger ? 'danger' : 'play');
  }
  cache.save = (cache.save || 0) + dt;
  if (cache.save > 5) { cache.save = 0; saveRun(); }
  cache.powT = (cache.powT || 0) - dt;
  if (cache.powT <= 0) {
    cache.powT = 0.4;
    let pw = 0;
    for (let i = 0; i < NCELL; i++) { const u = G.units[i]; if (!u) continue; const T = TYPES[u.t]; pw += dmgOf(u.t, i) * (T.kind === 'double' ? 2 : 1) / unitInterval(u, i) * (T.kind === 'pounce' ? (u.c || 1) : 1); }
    pw = Math.round(pw);
    if (pw !== cache.pow) {
      const chip = $('powChip');
      if (cache.pow > 0 && pw > cache.pow * 1.03) { chip.classList.remove('up'); void chip.offsetWidth; chip.classList.add('up'); }
      cache.pow = pw; $('pow').textContent = fmt(pw);
    }
  }
  setText(el.speedBtn, 'spd', `×${G.speed}`);
  if (cache.paused !== G.paused) { cache.paused = G.paused; el.pauseBtn.innerHTML = G.paused ? PLAY_SVG : PAUSE_SVG; el.pauseBtn.setAttribute('aria-label', G.paused ? '이어서 놀기' : '잠깐 멈추기'); }
  setClass(el.soundBtn, 'snd', 'is-off', !AU.on);
  refreshUps();
  if (G.sel >= 0 && !G.units[G.sel]) G.sel = -1;
  refreshInfo();
  renderUcard();
  const vo = Math.max(clamp((p - 0.6) / 0.4, 0, 1) * (0.55 + 0.45 * Math.sin(R.time * 6)), vig);
  if (Math.abs((cache.vo || 0) - vo) > 0.01) { cache.vo = vo; el.vignette.style.opacity = vo.toFixed(2); }
}

/* ---------- game flow ---------- */
const SHOWCASE = ['seonbi', 'gaksi', 'sangmo', 'mudang', 'gwakjaewoo', 'halmi', 'yisunsin', 'yangban', 'kkwaenggwari', 'janggu', 'jing', 'saja', 'bangsangsi', 'haetae', 'euljimundeok', 'cheoyong', 'samulpae', 'bari', 'sugun', 'yeongno', 'geobukseon', 'daejanggun', 'honggildong', 'buk', 'sapsal', 'singijeon', 'dolhareubang', 'gimseondal', 'jangbogo', 'gangrim', 'choimuseon', 'uibyeongdae'];
function setupTitle() {
  G = makeState('title', G ? G.speed : 1); G.stage = SAVE.stageSel || 0;
  SHOWCASE.slice(0, NCELL).forEach((id, i) => { G.units[i] = newUnit(TYPE_IX[id]); });
  for (let k = 0; k < 7; k++) { const f = newFoe(k % 4, 1, 0.45 + Math.random() * 0.2, 0.28, { d: k * PERIM / 7, lane: rand(-0.15, 0.15) }); placeFoe(f); G.foes.push(f); }
  UVIS.clear();
}
function titleTick(dt) {
  for (const f of G.foes) { f.d += f.speed * dt; f.wob += dt * 6; f.age += dt; placeFoe(f); }
  cache.tt = (cache.tt || 0) - dt;
  if (cache.tt <= 0) { cache.tt = 0.5 + Math.random() * 0.6; const i = Math.floor(Math.random() * NCELL), u = G.units[i]; if (u) { u.n++; u.dir = Math.random() < 0.5 ? -1 : 1; u.tx = cellX(i) + u.dir * 2; u.ty = cellY(i); } }
}
function startGame() {
  auInit(); sfx('click');
  el.lobby.hidden = true; el.endOv.hidden = true; closeRecipes(); closeChal(); clearRun(); cache.pow = 0;
  R.lobby = false; document.body.classList.remove('in-lobby');
  UVIS.clear(); FX.length = 0; PART.length = 0; TEXT.length = 0; FLY.length = 0;
  const st = R.coopStage != null ? R.coopStage : stageUnlocked(SAVE.stageSel) ? SAVE.stageSel : 0;
  R.theme = STAGES[st].theme;
  R.pickExp = false; R.pickSel = []; R.expInfo = false;
  newGame(lvMulArr(), lvSpdArr(), st, relicBonuses()); cache.save = 0; cache.coinShow = null;
  cache.infoKey = ''; cache.vo = -1;
  layout(); refreshInfo(); refreshUps();
  musicMode('play');
}
function goLobby() {
  saveRun();
  const wasCoop = COOP.on; if (wasCoop) coopLeaveRun();
  closeRecipes(); closeChal(); el.codexOv.hidden = true;
  R.theme = STAGES[SAVE.stageSel || 0].theme;
  setupTitle();
  R.lobby = true; document.body.classList.add('in-lobby');
  el.lobby.hidden = false; FX.length = 0; PART.length = 0; TEXT.length = 0;
  layout(); selectTab('home');
  musicMode('title');
  if (wasCoop && NET.link) openCoop();
  /* once, after the 동료 개편 update: what came back from the companions who retired */
  if (SAVE.refund && !SAVE.refund.shown) {
    const F = SAVE.refund; F.shown = 1; persist();
    showReward('동료 개편', F.silver, null, { wild: F.wild, hyang: F.hyang, note: `이제 모든 고을에 똑같은 동료 19명이 나오고 신화는 26가지예요.${F.n ? ` 은퇴한 동료 ${F.n}명의 조각과 레벨에 쓴 은전을 돌려드려요.` : ''} 신화 조각은 신화 레벨에 쓰는 향으로 바꿔 드렸어요` });
  }
}
function setPixel(v) { PIXEL = !!v; PIX.cache.clear(); PIX.fit.clear(); PORTRAIT_CACHE.clear(); try { localStorage.setItem('talnori-look', PIXEL ? '1' : '0'); } catch (err) { /* ignore */ } if (R.lobby) renderTab(); }
function setQuality(q) { R.q = q; try { localStorage.setItem('talnori-quality', String(q)); } catch (err) { /* ignore */ } layout(); }

/* ---------- controls ---------- */
el.summonBtn.addEventListener('click', () => { auInit(); summon(); });
el.gutBtn.addEventListener('click', () => { auInit(); if (el.gsheet.hidden) openGut(); else closeGut(); });
el.mythBtn.addEventListener('click', () => { auInit(); if (el.rsheet.hidden) openRecipes(); else closeRecipes(); });
el.chalBtn.addEventListener('click', () => { auInit(); if (el.csheet.hidden) openChal(); else closeChal(); });
el.speedBtn.addEventListener('click', () => { if (COOP.on && NET.role === 'guest') { toast('같이 할 땐 속도를 방장이 정해요'); return; } G.speed = G.speed >= 3 ? 1 : G.speed + 1; });
el.pauseBtn.addEventListener('click', () => { if (COOP.on) { toast('같이 할 땐 멈출 수 없어요'); return; } if (G.phase === 'play') G.paused = !G.paused; });
/* ---------- settings: one gear, top right, in the lobby and in a run ---------- */
const setPanel = $('setPanel'), gearBtn = $('gearBtn');
R.cutin = true; try { R.cutin = localStorage.getItem('talnori-cutin') !== '0'; } catch (err) { /* ignore */ }
R.names = false; try { R.names = localStorage.getItem('talnori-names') === '1'; } catch (err) { /* ignore */ }
let setAnchor = null;
function renderSettings() {
  const C = AU.cfg, on = AU.on, row = (label, key, val, vol) => `<div class="sp-row${vol && !on ? ' dim' : ''}"><span>${label}</span>${vol ? `<input type="range" min="0" max="100" step="5" value="${Math.round(C[vol] * 100)}" data-vol="${vol}" aria-label="${label} 크기">` : ''}<button class="tog${val ? ' on' : ''}" type="button" data-sp="${key}">${val ? '켜짐' : '꺼짐'}</button></div>`;
  setPanel.innerHTML = `<div class="sp-h"><b>설정</b><button class="ib" type="button" id="spClose" aria-label="닫기">✕</button></div>
    ${row('소리 전체', 'on', on)}${row('배경음악', 'mus', C.mus, 'musV')}${row('효과음', 'fx', C.fx, 'fxV')}
    <div class="sp-row"><span>유닛 이름 보기</span><button class="tog${R.names ? ' on' : ''}" type="button" data-sp="names">${R.names ? '켜짐' : '꺼짐'}</button></div>
    <div class="sp-row"><span>궁극기 연출</span><button class="tog${R.cutin ? ' on' : ''}" type="button" data-sp="cut">${R.cutin ? '켜짐' : '꺼짐'}</button></div>
    <div class="sp-row"><span>화질</span><button class="tog on" type="button" data-sp="q">${QUALITY[R.q].name}</button></div>
    <div class="sp-row"><span>그림</span><button class="tog on" type="button" data-sp="pix">${PIXEL ? '도트' : '선명'}</button></div>
    <div class="sp-row"><span>기록 옮기기<small class="sp-sub">폰, 다른 컴퓨터로</small></span><button class="tog on" type="button" data-sp="code">저장 코드</button></div>${APP.standalone ? '<div class="sp-row"><span>다시 불러오기<small class="sp-sub">화면이 이상할 때</small></span><button class="tog on" type="button" data-sp="reload">새로고침</button></div>' : ''}`;
}
function placeSettings() {
  if (!setAnchor) return;
  const r = setAnchor.getBoundingClientRect();
  setPanel.style.top = `${Math.round(r.bottom + 8)}px`; setPanel.style.right = `${Math.max(12, Math.round(window.innerWidth - r.right))}px`;
}
function openSettings(anchor) { setAnchor = anchor; renderSettings(); setPanel.hidden = false; placeSettings(); }
function closeSettings() { setPanel.hidden = true; setAnchor = null; }
function toggleSettings(anchor) { auInit(); if (!setPanel.hidden && setAnchor === anchor) closeSettings(); else openSettings(anchor); }
el.soundBtn.addEventListener('click', () => toggleSettings(el.soundBtn));
gearBtn.addEventListener('click', () => toggleSettings(gearBtn));
setPanel.addEventListener('click', e => {
  if (e.target.closest('#spClose')) { closeSettings(); return; }
  const b = e.target.closest('[data-sp]'); if (!b) return;
  const k = b.dataset.sp;
  if (k === 'code') { openSaveCode(); return; }
  if (k === 'reload') { location.reload(); return; }
  if (k === 'on') { setSound(!AU.on); if (AU.on && R.lobby) musicMode('title'); }
  else if (k === 'mus') setAudio({ mus: !AU.cfg.mus });
  else if (k === 'fx') { setAudio({ fx: !AU.cfg.fx }); if (AU.cfg.fx) sfx('tap'); }
  else if (k === 'q') { R.autoQ = false; setQuality((R.q + 1) % 3); }
  else if (k === 'pix') setPixel(!PIXEL);
  else if (k === 'names') { R.names = !R.names; try { localStorage.setItem('talnori-names', R.names ? '1' : '0'); } catch (err) { /* ignore */ } }
  else if (k === 'cut') { R.cutin = !R.cutin; try { localStorage.setItem('talnori-cutin', R.cutin ? '1' : '0'); } catch (err) { /* ignore */ } }
  renderSettings();
});
setPanel.addEventListener('input', e => { const v = e.target.dataset && e.target.dataset.vol; if (v) setAudio({ [v]: e.target.value / 100 }); });
setPanel.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.vol === 'fxV') sfx('tap'); });
document.addEventListener('pointerdown', e => { if (setPanel.hidden) return; if (setPanel.contains(e.target) || (setAnchor && setAnchor.contains(e.target))) return; closeSettings(); }, true);
window.addEventListener('resize', placeSettings);
/* ---------- 기록 옮기기: the save as a code to copy out, and a box to paste one in ---------- */
const saveOv = $('saveOv'), saveCard = $('saveCard');
const SV = { code: '', pend: null, note: '', busy: false };
const saveSum = s => `${fmtC(s.stats.games || 0)}판 · 고을 ${(s.stageMax || 0) + 1}곳 · 레벨 올린 동료 ${Object.values(s.lv || {}).filter(v => v > 1).length}명 · 은전 ${fmtC(s.silver || 0)} · 옥 ${fmtC(s.jade || 0)}`;
async function refreshCode() { try { SV.code = await saveCode(); } catch (err) { SV.code = ''; SV.note = '코드를 만들지 못했어요'; } renderSaveCode(); }
function openSaveCode() { closeSettings(); auInit(); saveOv.hidden = false; SV.pend = null; SV.note = ''; SV.code = ''; renderSaveCode(); refreshCode(); }
function closeSaveCode() { saveOv.hidden = true; SV.pend = null; }
function renderSaveCode() {
  const inRun = !R.lobby, keep = $('svIn') ? $('svIn').value : '';
  const inPart = SV.pend
    ? `<div class="sv-pend"><b>이 코드의 기록</b><span>${esc(saveSum(SV.pend))}</span></div>
      <p class="meta sv-l">지금 기록과 합쳐요. 더 많이 한 쪽을 기준으로 하고, 레벨과 도감, 고을, 유물 레벨은 높은 쪽이 남아요. 기록이 줄어드는 일은 없어요</p>
      <div class="two"><button class="btn-main" id="svApply" type="button">가져오기</button><button class="btn-sub" id="svCancel" type="button">취소</button></div>`
    : `<textarea class="sv-box sv-in" id="svIn" rows="3" placeholder="다른 곳에서 복사한 코드를 여기에 붙여넣어요" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></textarea>
      <button class="btn-sub" id="svRead" type="button" ${inRun || SV.busy ? 'disabled' : ''}>${inRun ? '판이 끝나고 넣을 수 있어요' : SV.busy ? '읽는 중…' : '코드 읽기'}</button>`;
  saveCard.innerHTML = `<h2 class="title" style="font-size:34px">기록 옮기기</h2>
    <p class="meta">폰이든 컴퓨터든 이 코드만 있으면 기록이 그대로 옮겨져요. 카톡 나와의 채팅이나 메모에 붙여두면 백업도 돼요</p>
    <h3 class="sv-h">내 저장 코드</h3>
    <p class="meta sv-l">${esc(saveSum(SAVE))}</p>
    <textarea class="sv-box" id="svOut" rows="3" readonly>${esc(SV.code || '만드는 중…')}</textarea>
    <div class="${navigator.share ? 'two' : ''}"><button class="btn-main sv-btn" id="svCopy" type="button" ${SV.code ? '' : 'disabled'}>복사하기</button>${navigator.share ? `<button class="btn-sub" id="svShare" type="button" ${SV.code ? '' : 'disabled'}>보내기</button>` : ''}</div>
    <h3 class="sv-h">코드 넣기</h3>
    ${inPart}
    ${SV.note ? `<p class="sv-note">${esc(SV.note)}</p>` : ''}
    <button class="btn-sub" id="svClose" type="button">닫기</button>`;
  if (keep && $('svIn')) $('svIn').value = keep;
}
async function copyText(txt, ta) {
  try { if (navigator.clipboard && navigator.clipboard.writeText) { await navigator.clipboard.writeText(txt); return true; } } catch (err) { /* some frames block the clipboard */ }
  try { ta.removeAttribute('readonly'); ta.focus(); ta.select(); ta.setSelectionRange(0, txt.length); const ok = document.execCommand('copy'); ta.setAttribute('readonly', ''); if (ok) return true; } catch (err) { /* ignore */ }
  return false;
}
saveOv.addEventListener('click', async e => {
  const t = e.target.closest('button'); if (!t) return;
  if (t.id === 'svClose') closeSaveCode();
  else if (t.id === 'svCopy') { const ok = await copyText(SV.code, $('svOut')); if (ok) { toast('저장 코드를 복사했어요'); sfx('tap'); } else { const ta = $('svOut'); ta.focus(); ta.select(); toast('코드를 길게 눌러 전체 선택한 뒤 복사해 주세요'); } }
  else if (t.id === 'svShare') { try { await navigator.share({ title: '조선 디펜스 저장 코드', text: SV.code }); } catch (err) { if (!err || err.name !== 'AbortError') toast('보내기가 안 돼서 복사로 해 주세요'); } }
  else if (t.id === 'svRead') {
    const txt = ($('svIn').value || '').trim(); if (!txt) { toast('코드를 먼저 붙여넣어 주세요'); return; }
    SV.busy = true; SV.note = ''; renderSaveCode();
    try { SV.pend = await readCode(txt); }
    catch (err) { SV.note = err && err.message === 'old' ? '이 브라우저가 오래돼서 코드를 못 읽어요. 브라우저를 업데이트해 주세요' : '코드가 맞지 않아요. 처음부터 끝까지 다 복사됐는지 확인해 주세요'; }
    SV.busy = false; renderSaveCode();
  }
  else if (t.id === 'svCancel') { SV.pend = null; renderSaveCode(); }
  else if (t.id === 'svApply') {
    if (!SV.pend || !R.lobby) return;
    importSave(SV.pend); SV.pend = null; SV.note = '기록을 가져왔어요!';
    sfx('merge', 3); toast('기록을 가져왔어요'); await refreshCode();
  }
});
document.addEventListener('click', e => { if (e.target.closest && e.target.closest('[data-savecode]')) openSaveCode(); });
el.codexBtn.addEventListener('click', openCodex);
document.addEventListener('pointerdown', () => { if (!AU.ctx && AU.on) { auInit(); if (R.lobby) musicMode('title'); } if (!CLOUD.ready && CLOUD.state !== 'loading' && CLOUD.state !== 'off') cloudInit(); }, { capture: true });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !setPanel.hidden) { closeSettings(); return; }
  if (e.key === 'Escape' && !saveOv.hidden) { closeSaveCode(); return; }
  if (!saveOv.hidden) return;
  if (e.key === 'Escape' && el.coopOv && !el.coopOv.hidden) { closeCoop(); return; }
  if (e.key === 'Escape') { if (R.pickExp) { R.pickExp = false; R.pickSel = []; cache.infoKey = ''; refreshInfo(); return; } if (!el.pouchOv.hidden) { $('pouchOk').click(); return; } if (!el.rewardOv.hidden) $('rwOk').click(); else if (!el.codexOv.hidden) closeCodex(); else if (!el.gsheet.hidden) closeGut(); else if (!el.rsheet.hidden) closeRecipes(); else if (!el.csheet.hidden) closeChal(); return; }
  if (G.phase !== 'play' || !el.codexOv.hidden) return;
  const onButton = e.target && e.target.tagName === 'BUTTON';
  if (e.code === 'Space' && !onButton) { e.preventDefault(); auInit(); summon(); }
  else if (e.key === 'g' || e.key === 'G' || e.key === 'ㅎ') { if (el.gsheet.hidden) openGut(); else closeGut(); }
  else if (e.key === 'm' || e.key === 'M' || e.key === 'ㅡ') { if (el.rsheet.hidden) openRecipes(); else closeRecipes(); }
  else if (e.key === 'c' || e.key === 'C' || e.key === 'ㅊ') { if (el.csheet.hidden) openChal(); else closeChal(); }
  else if ((e.key === 'p' || e.key === 'P' || e.key === 'ㅔ') && !COOP.on) G.paused = !G.paused;
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) { if (G.phase === 'play' && !COOP.on) { G.paused = true; saveRun(); } if (AU.ctx) AU.ctx.suspend().catch(() => {}); }
  else if (AU.ctx && AU.on) AU.ctx.resume().catch(() => {});
});

window.addEventListener('pagehide', () => saveRun());

/* ---------- loop ---------- */
let last = 0;
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now;
  R.time += dt;
  if (G.phase === 'play' && !G.paused) {
    let simDt = dt * G.speed * (R.slowmo > 0 ? 0.3 : 1);
    while (simDt > 1e-6 && G.phase === 'play') { const s = Math.min(simDt, 1 / 60); update(s); simDt -= s; }
  } else if (G.phase === 'title') titleTick(dt);
  if (R.slowmo > 0) R.slowmo -= dt;
  if (G.phase === 'win' && Math.random() < dt * 3) { const x = rand(-3, 3), y = rand(-3, 2); burst(x, y, rand(1.5, 2.5), 24, OBANG, 3.5, 0.06, 1.4, { g: 2 }); }
  renderFrame(dt);
  uiTick(dt);
  fpsMonitor(dt);
  requestAnimationFrame(frame);
}

/* ---------- live update & boot ---------- */
function serialize() {
  if (!G || G.phase !== 'play') return null;
  const s = Object.assign({}, G, { shots: [], pend: [], ev: [], addQ: [], boss: null, v: 8 });
  s.foes = G.foes.map(f => Object.assign({}, f));
  return JSON.parse(JSON.stringify(s));
}
function restore(state) {
  if (!state || !(state.v >= 6 && state.v <= 8) || state.phase !== 'play' || !Array.isArray(state.units) || state.units.length !== NCELL) return false;
  const base = makeState('play', state.speed || 1);
  G = Object.assign(base, state, { paused: true, sel: -1, ev: [], shots: [], pend: [], auraDirty: true });
  if (state.v < 8 && Array.isArray(state.up)) { const m = Math.max(0, ...state.up.slice(0, 4)); G.up = [m, m, m, m, state.up[4] || 0]; delete G.famMul; delete G.famBuff; G.tierBuff = {}; G.gradeMul = [1, 1, 1, 1]; G.pity = 0; G.fields = []; }
  if (!Array.isArray(G.fields)) G.fields = [];
  if (!G.tierBuff) G.tierBuff = {};
  G.stats = Object.assign(makeState('play').stats, state.stats || {});
  G.chalCd = CHALS.map((C, i) => (Array.isArray(state.chalCd) && typeof state.chalCd[i] === 'number' ? state.chalCd[i] : C.cd * 0.3));
  G.exp = Object.assign({ floor: 1, cd: 0, run: null, wins: 0 }, state.exp || {});
  normExp();
  G.lvMul = lvMulArr(); G.lvSpd = lvSpdArr();
  if (!Array.isArray(G.rngB) || G.rngB.length !== NCELL) G.rngB = Array(NCELL).fill(0);
  R.pickExp = false; R.pickSel = []; R.expInfo = false;
  G.boss = G.foes.find(f => f.boss) || null;
  return true;
}
function boot(data) {
  loadLocal(); ensureQuests(); applyLevels(lvOf);
  try { const pv = localStorage.getItem('talnori-look'); if (pv !== null) PIXEL = pv === '1'; } catch (err) { /* ignore */ }
  try { const q = localStorage.getItem('talnori-quality'); if (q !== null) { R.q = clamp(parseInt(q, 10) || 0, 0, 2); R.autoQ = false; } } catch (err) { /* ignore */ }
  if (!R.autoQ) { /* keep saved */ } else if (typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches && (window.devicePixelRatio || 1) > 2) R.q = 1;
  bindInput(() => { cache.infoKey = ''; refreshInfo(); });
  if (!stageUnlocked(SAVE.stageSel)) SAVE.stageSel = 0;
  R.theme = STAGES[SAVE.stageSel || 0].theme;
  if (data && restore(data.state)) {
    R.theme = STAGES[G.stage].theme;
    R.lobby = false; document.body.classList.remove('in-lobby'); el.lobby.hidden = true; layout();
  } else { R.lobby = true; goLobby(); }
  window.addEventListener('resize', () => layout());
  if (window.visualViewport) window.visualViewport.addEventListener('resize', () => layout());
  $('loadOv').hidden = true;
  R.ok = true;
  onSaveLoaded = () => { ensureQuests(); applyLevels(lvOf); silverShown = SAVE.silver; if (!stageUnlocked(SAVE.stageSel)) SAVE.stageSel = 0; if (R.lobby) { R.theme = STAGES[SAVE.stageSel || 0].theme; layout(); setupTitle(); renderTab(); } };
  cloudInit();
  requestAnimationFrame(t => { last = t; frame(t); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => layout());
  setTimeout(() => layout(), 400);
}

/* ---------- no accidental zoom on phones and tablets ---------- */
document.addEventListener('dblclick', e => { e.preventDefault(); }, { passive: false });
document.addEventListener('gesturestart', e => { e.preventDefault(); }, { passive: false });
let lastTouchEnd = 0;
document.addEventListener('touchend', e => {
  const now = Date.now();
  /* a second tap within a third of a second is a double tap to the browser: keep the tap, drop the zoom */
  if (now - lastTouchEnd < 320 && !(e.target.closest && e.target.closest('input,textarea,select'))) { e.preventDefault(); const t = (e.target.closest && e.target.closest('button')) || e.target; if (t && t !== cv && !t.disabled && typeof t.click === 'function') t.click(); }
  lastTouchEnd = now;
}, { passive: false });
/* if the page got zoomed anyway, put it back */
if (window.visualViewport) {
  const vp = document.querySelector('meta[name=viewport]');
  window.visualViewport.addEventListener('resize', () => {
    if (window.visualViewport.scale <= 1.01 || !vp || document.activeElement && /INPUT|TEXTAREA/.test(document.activeElement.tagName)) return;
    const c = vp.getAttribute('content');
    vp.setAttribute('content', 'width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover');
    setTimeout(() => vp.setAttribute('content', c), 300);
  });
}

/* ---------- 신화 해금 card: what the mythic is, what it needs, open it with 두루마리 ---------- */
const mythOv = $('mythOv'), mythCard = $('mythCard');
function openMythCard(id) { mythOv.dataset.id = id; renderMythCard(); mythOv.hidden = false; sfx('click'); }
function renderMythCard() {
  const id = mythOv.dataset.id, M = MYTH_BY[id], T = TYPES[TYPE_IX[id]];
  const free = MYTH_FREE.includes(id), opened = !!SAVE.mopen[id], open = free || opened || M.secret, cost = scrollCost(M), have = SAVE.scroll || 0;
  const kind = (M.tale ? '전래동화' : M.beast ? '신수' : '신화') + (T.role ? ` · ${ROLES[T.role].name}` : '');
  const ings = M.parts.map(p => WILD[p] ? `<span class="ing" style="border-left:3px solid ${TIERS[WILD[p]].color}"><span class="anyleg">?</span>아무 ${TIERS[WILD[p]].name}</span>` : ingHTML(p, false)).join('');
  const status = opened ? '두루마리로 열었어요. 모든 고을에서 쓸 수 있어요' : free ? '처음부터 열려 있어요' : `잠겨 있어요. 신화 두루마리 ${cost}개로 열면 모든 고을에서 쓸 수 있어요`;
  mythCard.innerHTML = `<img class="mc-pic" alt="" src="${portraitURL(id, 96, !SAVE.made[id])}"><h2 class="title" style="font-size:34px;margin:0">${esc(T.name)}</h2>
    <p class="meta">${kind} · ${esc(T.skill)}</p>
    <p class="sub" style="margin:0">${esc(T.desc)}</p>
    <div class="ings mc-ings">${ings}</div>
    <p class="mc-st${open ? ' ok' : ''}">${status}</p>
    ${open ? '' : !open ? `<button class="btn-main" id="mcOpen" type="button" ${have >= cost ? '' : 'disabled'}>📜 두루마리 ${cost}개로 열기 <small>(가진 것 ${have})</small></button>${have < cost ? '<p class="meta">두루마리는 고을 길 20 · 40 · 60 · 80 마당 보상이나 장터 옥 상점에서 얻어요</p>' : ''}` : ''}
    <button class="btn-sub" id="mcClose" type="button">닫기</button>`;
}
mythOv.addEventListener('click', e => {
  const t = e.target.closest('button');
  if (!t) { if (e.target === mythOv) mythOv.hidden = true; return; }
  if (t.id === 'mcClose') mythOv.hidden = true;
  else if (t.id === 'mcOpen') { if (unlockMyth(mythOv.dataset.id)) { sfx('merge', 3); toast(`${TYPES[TYPE_IX[mythOv.dataset.id]].name}을 열었어요!`); renderMythCard(); renderTab(); } }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mythOv.hidden) mythOv.hidden = true; });

