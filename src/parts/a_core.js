/* ================= helpers ================= */
const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const pick = a => a[Math.floor(Math.random() * a.length)];
const josa = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xAC00; return w + ((c >= 0 && c % 28) ? a : b); };
function fmtC(n) {
  n = Math.floor(n);
  if (n >= 1e8) return (n / 1e8).toFixed(n >= 1e9 ? 0 : 2) + '억';
  if (n >= 1e6) return (n / 1e4).toFixed(0) + '만';
  return n.toLocaleString('ko-KR');
}
function fmt(n) {
  n = Math.round(n);
  if (n >= 1e8) return (n / 1e8).toFixed(n >= 1e9 ? 0 : 1) + '억';
  if (n >= 1e4) return (n / 1e4).toFixed(n >= 1e5 ? 0 : 1) + '만';
  return n.toLocaleString('ko-KR');
}

/* ================= board & path (cell units) ================= */
/* six across and three down, like a 운빨존많겜 board: two yards fit one above the other on a phone */
const COLS = 6, ROWS = 3, NCELL = COLS * ROWS;
const cellX = i => (i % COLS) - (COLS - 1) / 2;
const cellY = i => Math.floor(i / COLS) - (ROWS - 1) / 2;
function cellAt(x, y) {
  const c = Math.round(x + (COLS - 1) / 2), r = Math.round(y + (ROWS - 1) / 2);
  return (c < 0 || c >= COLS || r < 0 || r >= ROWS) ? -1 : r * COLS + c;
}
const NEIGH = [];
for (let i = 0; i < NCELL; i++) {
  const c = i % COLS, r = Math.floor(i / COLS), list = [];
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue;
    const cc = c + dc, rr = r + dr;
    if (cc >= 0 && cc < COLS && rr >= 0 && rr < ROWS) list.push(rr * COLS + cc);
  }
  NEIGH.push(list);
}
const HX = COLS / 2 + 0.72, HY = ROWS / 2 + 0.72, RC = 0.55, LANE = 0.72;
/* the partner's yard sits above yours, turned half a circle, so its top road and yours are the same road */
/* the partner's yard is your yard mirrored up over the shared road, so both crowds walk it the same way */
const flipX = x => x, flipY = y => -2 * HY - y;
const SEGS = []; let PERIM = 0;
function segLine(x0, y0, x1, y1) { const len = Math.hypot(x1 - x0, y1 - y0); SEGS.push({ arc: false, x0, y0, x1, y1, len, s: PERIM, dx: (x1 - x0) / len, dy: (y1 - y0) / len }); PERIM += len; }
function segArc(cx, cy, a0, a1) { const len = Math.abs(a1 - a0) * RC; SEGS.push({ arc: true, cx, cy, a0, a1, len, s: PERIM }); PERIM += len; }
/* the lap the way 운빨존많겜 runs it: out of the far bottom-left corner, 통로1 up the left side,
   통로2 the shared road in the middle (the only stretch your partner can reach), 통로3 down the right,
   통로4 back along the outer edge to where it came out */
segLine(-HX, HY - RC, -HX, -HY + RC); segArc(-HX + RC, -HY + RC, PI, 1.5 * PI);
segLine(-HX + RC, -HY, HX - RC, -HY); segArc(HX - RC, -HY + RC, -PI / 2, 0);
segLine(HX, -HY + RC, HX, HY - RC); segArc(HX - RC, HY - RC, 0, PI / 2);
segLine(HX - RC, HY, -HX + RC, HY); segArc(-HX + RC, HY - RC, PI / 2, PI);
const PT = { x: 0, y: 0, dx: 1, dy: 0 };
function pathAt(d, o = PT) {
  d = ((d % PERIM) + PERIM) % PERIM;
  let sg = SEGS[SEGS.length - 1];
  for (const s of SEGS) { if (d < s.s + s.len) { sg = s; break; } }
  const t = (d - sg.s) / sg.len;
  if (!sg.arc) { o.x = sg.x0 + (sg.x1 - sg.x0) * t; o.y = sg.y0 + (sg.y1 - sg.y0) * t; o.dx = sg.dx; o.dy = sg.dy; }
  else { const a = sg.a0 + (sg.a1 - sg.a0) * t; o.x = sg.cx + RC * Math.cos(a); o.y = sg.cy + RC * Math.sin(a); o.dx = -Math.sin(a); o.dy = Math.cos(a); }
  return o;
}

/* ================= data ================= */
const TIERS = [
  { name: '일반', color: '#9a9184', light: '#ece4d4', sell: 40 },
  { name: '희귀', color: '#2f9473', light: '#9fe8cf', sell: 120 },
  { name: '영웅', color: '#4a74c9', light: '#b5ccff', sell: 350 },
  { name: '전설', color: '#d4961c', light: '#ffdc80', sell: 900 },
  { name: '신화', color: '#cf4630', light: '#ffab92', sell: 1500 },
  { name: '신수', color: '#1fae9c', light: '#b4f2e6', sell: 2200 },
  { name: '전래동화', color: '#9b6bff', light: '#e2d2ff', sell: 3000 },
];
const BEAST_TIER = 5, TALE_TIER = 6;
/* 신화 roles: what a mythic is for, shown on its card */
const ROLES = { aoe: { name: '광역', color: '#e2563c' }, boss: { name: '보스', color: '#9b4ad8' }, ctrl: { name: '제어', color: '#2f86d6' }, eco: { name: '경제', color: '#d6a12a' } };
const GRP = { beast: '신수', tale: '전래동화' };
const FAMS = {
  tal: { name: '탈', short: '탈', color: '#c8763c' },
  samul: { name: '사물놀이', short: '사물놀이', color: '#3f78c8' },
  suho: { name: '마을 수호', short: '수호', color: '#5f9a3a' },
  jang: { name: '장수', short: '장수', color: '#c23a3a' },
};
const FAM_KEYS = ['tal', 'samul', 'suho', 'jang'], FAM_IX = { tal: 0, samul: 1, suho: 2, jang: 3 }, LUCK = 4;
const TYPES = [
  // 일반
  { id: 'choraengi', name: '초랭이', tier: 0, old: 1, fam: 'tal', origin: '하회별신굿탈놀이', skill: '돌팔매', desc: '잽싸게 돌멩이를 연달아 던져요', dmg: 5, cd: 0.4, range: 3.1, kind: 'shot', shot: 'stone' },
  { id: 'imae', name: '이매', tier: 0, old: 1, fam: 'tal', origin: '하회별신굿탈놀이', skill: '헛웃음 밀치기', desc: '맞은 도깨비를 뒤로 밀어내요', dmg: 10, cd: 0.95, range: 3.0, kind: 'shot', shot: 'gust', kb: 0.6 },
  { id: 'halmi', name: '할미', tier: 0, fam: 'tal', origin: '하회별신굿탈놀이', skill: '실타래', desc: '맞은 도깨비가 한참 느려져요', dmg: 7, cd: 0.85, range: 3.2, kind: 'shot', shot: 'yarn', slow: 0.35, slowT: 1.8 },
  { id: 'kkwaenggwari', name: '꽹과리', tier: 0, fam: 'samul', origin: '사물놀이', skill: '쇳소리', desc: '쨍한 소리가 한 마리 더 튕겨 가요', dmg: 6, cd: 0.6, range: 3.0, kind: 'chain', chain: 2 },
  { id: 'buk', name: '북', tier: 0, fam: 'samul', origin: '사물놀이', skill: '둥둥', desc: '맞은 자리 둘레를 한꺼번에 울려요', dmg: 13, cd: 1.35, range: 3.0, kind: 'thump', aoe: 0.8 },
  { id: 'sotdae', name: '솟대', tier: 0, old: 1, fam: 'suho', origin: '마을 수호', skill: '높이 본 새', desc: '둘레 여덟 칸 동료의 사거리가 0.5 늘어나요. 나무새도 날려요', dmg: 8, cd: 1.0, range: 4.2, kind: 'shot', shot: 'bird', rngAura: 0.5 },
  { id: 'dolhareubang', name: '돌하르방', tier: 0, fam: 'suho', origin: '제주 수호석', skill: '수호석', desc: '마을 어귀를 지키는 수호석이에요. 둘레 여덟 칸 동료가 보스와 도전 귀신에게 주는 피해가 15% 늘어요. 다가온 도깨비는 돌주먹으로 쳐요', dmg: 15, cd: 1.3, range: 2.5, kind: 'thump', aoe: 0.55, stunT: 0.3, bossAura: 0.15 },
  { id: 'uibyeong', name: '의병', tier: 0, old: 1, fam: 'jang', origin: '조선 의병', skill: '죽창 찌르기', desc: '긴 죽창으로 찔러 뒤에 선 도깨비까지 꿰뚫어요', dmg: 9, cd: 0.8, range: 2.4, kind: 'beam', beamW: 0.26 },
  { id: 'sugun', name: '수군 궁수', tier: 0, fam: 'jang', origin: '조선 수군', skill: '애기살', desc: '짧고 빠른 화살을 멀리까지 쏴요', dmg: 7, cd: 0.55, range: 4.0, kind: 'shot', shot: 'arrow' },
  // 희귀
  { id: 'bune', name: '부네', tier: 1, old: 1, fam: 'tal', origin: '하회별신굿탈놀이', skill: '홀림 꽃잎', desc: '네 번에 한 번꼴로 도깨비를 홀려 멈춰 세워요', dmg: 22, cd: 0.8, range: 3.2, kind: 'shot', shot: 'petal', stunP: 0.25, stunT: 0.7 },
  { id: 'baekjeong', name: '백정', tier: 1, old: 1, fam: 'tal', origin: '하회별신굿탈놀이', skill: '식칼 던지기', desc: '묵직한 칼이 맞은 자리 둘레까지 베어요', dmg: 46, cd: 1.45, range: 3.0, kind: 'shot', shot: 'cleaver', splash: 1.0 },
  { id: 'janggu', name: '장구', tier: 1, fam: 'samul', origin: '사물놀이', skill: '덩더쿵', desc: '한 번에 두 번씩 두드려요', dmg: 15, cd: 0.9, range: 3.1, kind: 'double' },
  { id: 'jing', name: '징', tier: 1, fam: 'samul', origin: '사물놀이', skill: '징 울림', desc: '넓게 울려서 둘레 도깨비를 느리게 해요', dmg: 22, cd: 1.6, range: 3.0, kind: 'thump', aoe: 1.3, slow: 0.25, slowT: 1.2 },
  { id: 'jangseung', name: '장승', tier: 1, old: 1, fam: 'suho', origin: '마을 수호', skill: '길목 호통', desc: '둘레를 지나는 도깨비를 늦추고 받는 피해를 20% 늘려요. 길가에 두세요', dmg: 12, cd: 1.2, range: 2.3, kind: 'pulse', slow: 0.3, slowT: 1.4, mark: 0.2, markT: 1.6 },
  { id: 'sapsal', name: '삽살개', tier: 1, fam: 'suho', origin: '귀신 쫓는 개', skill: '귀신 쫓기', desc: '도깨비 무리에 달려들어 물고 잠깐 멈춰 세워요', dmg: 40, cd: 1.15, range: 3.0, kind: 'pounce', aoe: 0.6, stunT: 0.35 },
  { id: 'seungbyeong', name: '승병', tier: 1, old: 1, fam: 'jang', origin: '조선 승병', skill: '육모방망이', desc: '방망이를 크게 휘둘러 둘레 도깨비를 치고 잠깐 멈춰 세워요', dmg: 20, cd: 1.2, range: 2.1, kind: 'pulse', stunT: 0.2 },
  { id: 'singijeon', name: '신기전 화차', tier: 1, fam: 'jang', origin: '조선 화약 무기', skill: '신기전', desc: '불화살 다섯 발을 한꺼번에 쏘아 여러 도깨비를 맞혀요', dmg: 9, cd: 1.7, range: 4.0, kind: 'bolts', bolts: 5, shot: 'rocket' },
  { id: 'yangban', name: '양반', tier: 1, fam: 'tal', origin: '하회별신굿탈놀이', skill: '엽전 뿌리기', desc: '맞힐 때 셋에 한 번꼴로 엽전을 챙겨요', dmg: 24, cd: 0.95, range: 3.1, kind: 'shot', shot: 'coin', coinP: 0.35 },
  // 영웅
  { id: 'seonbi', name: '선비', tier: 2, fam: 'tal', origin: '하회별신굿탈놀이', skill: '글 읽는 소리', desc: '둘레 여덟 칸 동료의 공격이 25% 빨라져요. 먹물도 던져요', dmg: 34, cd: 1.0, range: 3.3, kind: 'shot', shot: 'ink', aura: 0.25 },
  { id: 'jung', name: '중', tier: 2, old: 1, fam: 'tal', origin: '하회별신굿탈놀이', skill: '염주 번개', desc: '염주 번개가 다섯 마리까지 튕겨요', dmg: 30, cd: 1.05, range: 3.1, kind: 'chain', chain: 5 },
  { id: 'gaksi', name: '각시', tier: 2, fam: 'tal', origin: '하회별신굿탈놀이', skill: '서낭빛', desc: '한 줄로 꿰뚫는 빛줄기를 쏴요', dmg: 90, cd: 1.5, range: 4.2, kind: 'beam' },
  { id: 'malttugi', name: '말뚝이', tier: 2, old: 1, fam: 'tal', origin: '봉산탈춤', skill: '채찍 조롱', desc: '채찍 맞은 도깨비는 3초 동안 피해를 35% 더 받아요', dmg: 34, cd: 0.55, range: 3.2, kind: 'whip', mark: 0.35 },
  { id: 'sangmo', name: '상모꾼', tier: 2, fam: 'samul', origin: '풍물놀이', skill: '열두 발 상모', desc: '긴 상모 끈을 돌려 둘레를 모두 휩쓸어요', dmg: 40, cd: 1.0, range: 2.1, kind: 'pulse' },
  { id: 'chwibari', name: '취발이', tier: 2, old: 1, fam: 'tal', origin: '봉산탈춤', skill: '술불 뿜기', desc: '앞쪽 부채꼴로 불을 뿜어 3초 동안 태워요', dmg: 44, cd: 1.3, range: 3.0, kind: 'cone', cone: 0.62, burn: 0.5 },
  { id: 'mudong', name: '무동', tier: 2, old: 1, fam: 'samul', origin: '농악 무동놀이', skill: '어깨 위 소고', desc: '어깨 위 아이가 소고를 울려 둘레 여덟 칸 동료의 공격력을 20% 올려요. 소고도 던져요', dmg: 30, cd: 0.9, range: 3.2, kind: 'shot', shot: 'sogo', dmgAura: 0.2 },
  { id: 'sansin', name: '산신령', tier: 2, old: 1, fam: 'suho', origin: '산신 신앙', skill: '산신 벼락', desc: '지팡이로 벼락을 내려 맞은 자리 둘레를 치고, 셋에 한 번꼴로 기절시켜요', dmg: 62, cd: 1.3, range: 3.6, kind: 'thump', aoe: 0.9, stunP: 0.33, stunT: 0.6 },
  { id: 'samjogo', name: '삼족오', tier: 2, old: 1, fam: 'suho', origin: '고구려 해 신화', skill: '해불', desc: '해처럼 타오르는 불덩이를 날려 맞은 도깨비를 3초 동안 태워요', dmg: 46, cd: 1.0, range: 3.8, kind: 'shot', shot: 'sunfire', burn: 0.45 },
  { id: 'gwakjaewoo', name: '곽재우', tier: 2, fam: 'jang', origin: '홍의장군', skill: '홍의 돌격', desc: '붉은 옷을 휘날리며 도깨비 무리에 뛰어들어 둘레를 베고 잠깐 멈춰 세워요', dmg: 105, cd: 1.5, range: 3.4, kind: 'pounce', aoe: 0.95, stunT: 0.35 },
  { id: 'gwonyul', name: '권율', tier: 2, old: 1, fam: 'jang', origin: '행주대첩', skill: '행주 돌팔매', desc: '행주산성의 돌을 날려 맞은 자리 둘레를 크게 치고 느리게 해요', dmg: 58, cd: 1.35, range: 3.6, kind: 'thump', aoe: 1.1, slow: 0.3, slowT: 1.2 },
  // 전설
  { id: 'yeongno', name: '영노', tier: 4, fam: 'tal', role: 'boss', origin: '수영야류', skill: '통째로 삼키기', desc: '양반 아흔아홉을 잡아먹고 하늘로 오르려는 탈판의 괴물이에요. 네 번째 공격마다 작은 도깨비를 통째로 삼키고, 보스는 남은 체력의 2.5%를 한입에 베어 물어요', dmg: 230, cd: 1.0, range: 3.2, kind: 'devour', devour: 4, bite: 0.025 },
  { id: 'bangsangsi', name: '방상시', tier: 3, fam: 'tal', origin: '나례', skill: '네 눈 창', desc: '네 눈에서 금빛 창을 날려요. 치명타가 자주 터져요', dmg: 26, cd: 1.1, range: 3.8, kind: 'bolts', bolts: 4, crit: 0.3, critMul: 3 },
  { id: 'haetae', name: '해태', tier: 3, fam: 'suho', origin: '마을 수호', skill: '덮치기', desc: '도깨비 무리에 뛰어들어 둘레를 치고 잠깐 기절시켜요', dmg: 160, cd: 1.6, range: 3.2, kind: 'pounce', aoe: 1.0, stunT: 0.5 },
  { id: 'taepyeongso', name: '태평소', tier: 3, old: 1, fam: 'samul', origin: '풍물놀이', skill: '날라리 가락', desc: '앞쪽 부채꼴로 쩌렁한 소리를 보내 도깨비를 밀어내요', dmg: 120, cd: 1.3, range: 3.3, kind: 'cone', cone: 0.7, kb: 0.25 },
  { id: 'yisunsin', name: '이순신', tier: 3, fam: 'jang', origin: '삼도수군통제사', skill: '학익진', desc: '학이 날개를 펴듯 화살 일곱 발을 부채꼴로 쏘아 앞쪽 도깨비를 모두 꿰뚫어요', dmg: 40, cd: 1.35, range: 3.9, kind: 'volley', arrows: 7, spread: 0.95 },
  // 신화 (조합으로만)
  { id: 'samulpae', name: '사물놀이패', tier: 4, fam: 'samul', role: 'aoe', origin: '사물놀이', skill: '신명 장단', desc: '장단에 맞춰 둘레를 계속 울리고 네 번째 박마다 기절시켜요. 마당의 일반·희귀 동료 공격력이 20% 올라요', dmg: 70, cd: 0.55, range: 3.0, kind: 'beat', gAura: 0.2, gAuraT: [0, 1] },
  { id: 'bari', name: '바리공주', tier: 4, fam: 'suho', role: 'aoe', origin: '무속 신화', skill: '저승길 인도', desc: '방울 소리가 여섯 마리까지 튕기고, 체력이 적게 남은 도깨비는 바로 저승으로 보내요', dmg: 260, cd: 1.0, range: 3.4, kind: 'chain', chain: 6, execute: 0.15 },
  { id: 'kkokdusoe', name: '꼭두쇠', tier: 4, fam: 'samul', role: 'eco', origin: '남사당놀이', skill: '버나 돌리기', desc: '접시 셋을 부메랑처럼 던져 오가며 베어요. 가끔 엽전이 떨어져요', dmg: 85, cd: 1.4, range: 3.6, kind: 'boomerang', plates: 3, coinP: 0.08 },
  { id: 'saja', name: '북청사자', tier: 4, fam: 'tal', role: 'ctrl', origin: '북청사자놀음', skill: '사자후', desc: '마당 어디든 뛰어들어 둘레를 크게 치고 기절시켜요', dmg: 520, cd: 2.0, range: 99, kind: 'pounce', aoe: 1.6, stunT: 0.7, global: true },
  { id: 'daejanggun', name: '천하대장군', tier: 4, fam: 'suho', role: 'ctrl', origin: '마을 수호', skill: '마을 지킴', desc: '둘레 도깨비의 체력을 비율로 깎고 크게 늦춰요', dmg: 120, cd: 1.0, range: 2.8, kind: 'pulse', pct: 0.03, slow: 0.4, slowT: 1.2 },
  { id: 'cheoyong', name: '처용', tier: 4, fam: 'tal', role: 'boss', origin: '처용무', skill: '역신 쫓기', desc: '꿰뚫는 붉은 물결을 보내요. 보스에겐 세 배 피해', dmg: 300, cd: 1.2, range: 4.0, kind: 'wave', bossMul: 3 },
  { id: 'bihyeong', name: '비형랑', tier: 4, fam: 'suho', role: 'ctrl', origin: '삼국유사', skill: '도깨비 호령', desc: '도깨비불 셋을 날리고, 여덟 초마다 호령해서 도깨비들을 뒤로 걷게 해요', dmg: 260, cd: 1.2, range: 4.0, kind: 'homing', orbs: 3, command: 8 },
  { id: 'geobukseon', name: '거북선', tier: 4, fam: 'jang', role: 'aoe', origin: '조선 수군', skill: '용머리 화포', desc: '화포를 쏘아 맞은 자리 둘레를 크게 치고 기절시켜요. 세 번째마다 용머리가 불을 뿜어 태워요', dmg: 300, cd: 1.4, range: 3.9, kind: 'cannon', aoe: 1.1, stunT: 0.45, breath: 3, cone: 0.6, burn: 0.4 },
  { id: 'uibyeongdae', name: '팔도 의병', tier: 4, fam: 'jang', role: 'aoe', origin: '조선 의병', skill: '의병 봉기', desc: '네 의병이 함께 둘레를 휩쓸고 네 번째마다 기절시켜요. 마당의 영웅 동료 공격력이 20% 올라요', dmg: 80, cd: 0.6, range: 2.9, kind: 'beat', gAura: 0.2, gAuraT: [2] },
  { id: 'seolmundae', name: '설문대할망', tier: 4, fam: 'suho', role: 'ctrl', origin: '제주 창세 신화', skill: '흙치마', desc: '치마폭에 담은 바위를 마당 어디든 떨어뜨려 둘레를 크게 치고 한참 느리게 해요', dmg: 400, cd: 1.8, range: 99, kind: 'drop', aoe: 1.4, slow: 0.5, slowT: 2.2, global: true },
  // 새 동료는 꼭 맨 뒤에 붙여요. 저장된 판이 동료를 순번으로 기억해서 중간에 끼우면 바뀌어요
  { id: 'nongmin', name: '농민', tier: 0, old: 1, fam: 'samul', origin: '두레 농사', skill: '풍년 농사', desc: '공격은 약하지만 5초마다 엽전 10을 거둬요. 쌓인 만큼 더 거둬요', dmg: 6, cd: 1.1, range: 3.0, kind: 'shot', shot: 'stone', income: 10, incCd: 5 },
  { id: 'bobusang', name: '보부상', tier: 1, old: 1, fam: 'tal', origin: '조선 장돌뱅이', skill: '장사 수완', desc: '공격은 약하지만 6초마다 엽전 30을 벌어요. 쌓인 만큼 더 벌어요', dmg: 12, cd: 1.0, range: 3.1, kind: 'shot', shot: 'coin', income: 30, incCd: 6 },
  { id: 'mudang', name: '무당', tier: 2, fam: 'suho', origin: '굿', skill: '부정 저주', desc: '도깨비 무리에 부정을 씌워요. 4초 동안 받는 피해가 20% 늘고 되살아나거나 갈라지거나 체력이 차오르지 못해요', dmg: 16, cd: 2.0, range: 3.4, kind: 'curse', aoe: 1.4, curse: 0.2, curseT: 4 },
  { id: 'honggildong', name: '홍길동', tier: 4, fam: 'jang', role: 'eco', origin: '홍길동전', skill: '분신술', desc: '동에 번쩍 서에 번쩍하는 의적이에요. 분신 둘과 함께 세 번 베어요. 작은 도깨비에게선 가끔 엽전을, 보스를 벨 때는 일곱 번에 한 번꼴로 엽전 꾸러미를 훔쳐 와요', dmg: 130, cd: 1.0, range: 3.6, kind: 'clone', clones: 3, coinP: 0.12, steal: 0.15 },
  // 전래동화: 신화를 재료로 깨워요
  { id: 'haedal', name: '해님달님', tier: 4, grp: 'tale', fam: 'suho', role: 'aoe', origin: '해와 달이 된 오누이', skill: '해와 달', desc: '오누이가 해와 달이 되어 일곱 초씩 번갈아 떠요. 해가 뜨면 마당의 도깨비가 모두 타고, 달이 뜨면 모두 느려지고 받는 피해가 25% 늘어요. 햇살 다섯 줄기도 쏘아요', dmg: 208, cd: 1.0, range: 4.2, kind: 'homing', shot: 'sunray', orbs: 5, dayNight: 7 },
  { id: 'hokburi', name: '혹부리 영감', tier: 4, grp: 'tale', fam: 'tal', role: 'eco', origin: '혹부리 영감', skill: '도깨비 홀리는 노래', desc: '노랫가락이 일곱 마리까지 튕겨요. 열 초마다 노래를 불러 마당의 도깨비를 모두 춤추게 해 멈춰 세우고, 멈춘 도깨비마다 엽전을 받아요', dmg: 242, cd: 0.9, range: 3.8, kind: 'chain', chain: 7, song: 10 },
  { id: 'namukkun', name: '나무꾼', tier: 4, grp: 'tale', fam: 'suho', role: 'boss', origin: '금도끼 은도끼', skill: '금도끼 은도끼', desc: '금도끼를 던져 둘레까지 크게 베고 보스에겐 세 배를 줘요. 두 번에 한 번은 은도끼도 일직선으로 날아가 줄줄이 베어요', dmg: 800, cd: 1.1, range: 4.0, kind: 'axes', bossMul: 3, splash: 0.7 },
  { id: 'simcheong', name: '심청', tier: 4, grp: 'tale', fam: 'suho', role: 'ctrl', origin: '심청전', skill: '인당수', desc: '푸른 물결로 줄줄이 꿰뚫고 느리게 해요. 보스에겐 2.5배. 여덟 초마다 인당수 큰 물결이 마당을 덮쳐 모든 도깨비를 치고 뒤로 밀어내요', dmg: 330, cd: 0.9, range: 4.2, kind: 'wave', shot: 'bwave', slow: 0.3, slowT: 1.5, tide: 8, bossMul: 2.5 },
  // 예전 고을 전용 전설. 허도령은 은퇴했고 나머지는 신화가 됐어요
  { id: 'heodoryeong', name: '허도령', tier: 3, old: 1, fam: 'tal', origin: '하회탈을 깎은 총각', skill: '탈 던지기', desc: '깎다 만 탈을 던져 맞은 자리 둘레까지 쳐요. 맞은 도깨비는 2초 동안 받는 피해가 15% 늘어요', dmg: 95, cd: 1.0, range: 3.6, kind: 'shot', shot: 'mask', splash: 0.9, mark: 0.15, markT: 2 },
  { id: 'gimseondal', name: '김선달', tier: 4, fam: 'tal', role: 'eco', origin: '봉이 김선달', skill: '대동강 물 팔기', desc: '대동강 물도 팔아먹은 꾀보예요. 강물을 끼얹어 둘레를 치고, 김선달이 잡은 도깨비마다 엽전을 더 받아요. 마당이 바뀔 때마다 가진 엽전의 5%를 이자로 받아요', dmg: 170, cd: 1.1, range: 3.5, kind: 'thump', aoe: 1.0, killCoin: 8, interest: 0.05 },
  { id: 'euljimundeok', name: '을지문덕', tier: 3, fam: 'jang', origin: '살수대첩', skill: '살수대첩', desc: '막아 둔 강물을 터뜨려 일직선으로 쓸어버리고 한참 느리게 해요', dmg: 135, cd: 1.2, range: 4.0, kind: 'wave', shot: 'flood', slow: 0.35, slowT: 1.6 },
  { id: 'jangbogo', name: '장보고', tier: 4, fam: 'jang', role: 'eco', origin: '청해진 대사', skill: '청해진 화포', desc: '바다를 주름잡은 해상왕이에요. 배에서 화포를 쏘아 둘레를 크게 치고 잠깐 멈춰 세워요. 30초마다 무역선이 들어와 혼 1개와 엽전을 실어 와요', dmg: 210, cd: 1.3, range: 3.9, kind: 'cannon', aoe: 0.95, stunT: 0.3, trade: 30 },
  { id: 'gangrim', name: '강림도령', tier: 4, fam: 'suho', role: 'boss', origin: '차사본풀이', skill: '저승 오랏줄', desc: '염라대왕도 붙잡아 온 저승차사예요. 오랏줄이 다섯 마리까지 튕기고 체력이 조금 남은 도깨비는 바로 저승으로 끌고 가요. 보스에겐 두 배를 주고, 묶인 보스는 명부에 올라 3초 동안 받는 피해가 25% 늘어요', dmg: 300, cd: 1.0, range: 3.7, kind: 'chain', chain: 5, execute: 0.15, book: 0.25, bossMul: 2 },
  // 신수: 전설 둘을 모아 불러요
  { id: 'cheongryong', name: '청룡', tier: 4, grp: 'beast', fam: 'tal', role: 'aoe', origin: '동쪽을 지키는 신수', skill: '청룡의 숨결', desc: '푸른 숨결로 일직선을 꿰뚫어요. 네 초마다 번개가 떨어져 도깨비 여섯을 크게 쳐요', dmg: 450, cd: 1.1, range: 4.3, kind: 'wave', shot: 'dragon', storm: 4 },
  { id: 'jujak', name: '주작', tier: 4, grp: 'beast', fam: 'samul', role: 'aoe', origin: '남쪽을 지키는 신수', skill: '불새의 깃', desc: '마당 어디든 도깨비가 몰린 곳에 불을 떨어뜨려 둘레를 치고 오래 태워요', dmg: 300, cd: 1.6, range: 99, kind: 'fire', aoe: 1.3, burn: 0.4, global: true },
  { id: 'baekho', name: '백호', tier: 4, grp: 'beast', fam: 'jang', role: 'boss', origin: '서쪽을 지키는 신수', skill: '산군의 발톱', desc: '마당 어디든 뛰어들어 둘레를 크게 할퀴고 기절시켜요. 할퀸 도깨비는 3초 동안 받는 피해가 20% 늘고 보스에겐 2.5배를 줘요', dmg: 883, cd: 1.8, range: 99, kind: 'pounce', aoe: 1.1, stunT: 0.6, mark: 0.2, markT: 3, global: true, bossMul: 2.5 },
  { id: 'hyeonmu', name: '현무', tier: 4, grp: 'beast', fam: 'suho', role: 'ctrl', origin: '북쪽을 지키는 신수', skill: '북방의 물결', desc: '물방울 넷을 날려 맞은 도깨비를 느리게 해요. 아홉 초마다 큰 물결로 마당의 도깨비를 모두 뒤로 밀어내요', dmg: 345, cd: 1.2, range: 4.2, kind: 'homing', shot: 'waterorb', orbs: 4, slow: 0.35, slowT: 1.5, shell: 9 },
  { id: 'hwangryong', name: '황룡', tier: 4, grp: 'beast', fam: 'suho', role: 'boss', origin: '가운데를 지키는 신수', skill: '여의주', desc: '여의주 세 개를 날려요. 보스에겐 2.5배. 황룡이 마당에 있으면 모든 동료 공격력이 15% 올라요', dmg: 323, cd: 1.0, range: 4.4, kind: 'homing', shot: 'pearl', orbs: 3, bossMul: 2.5, allAura: 0.15 },
  { id: 'choimuseon', name: '최무선', tier: 4, fam: 'jang', role: 'aoe', origin: '진포 대첩', skill: '주화', desc: '고려에 화약을 들여온 발명가예요. 화통도감에서 만든 주화 네 발을 쏘아 맞은 자리를 터뜨리고, 3초 동안 불바다를 남겨 지나는 도깨비를 태워요', dmg: 120, cd: 1.3, range: 4.0, kind: 'bolts', bolts: 4, shot: 'rocket', splash: 0.8, burn: 0.4, field: 0.35 },
  { id: 'yongwang', name: '용왕', tier: 4, fam: 'suho', role: 'ctrl', origin: '용왕 신앙', skill: '용궁 물대포', desc: '물대포로 줄줄이 꿰뚫고 뒤로 밀며 느리게 해요. 둘레 여덟 칸 동료의 궁극기가 30% 빨리 차요', dmg: 240, cd: 1.1, range: 4.2, kind: 'wave', shot: 'bwave', slow: 0.35, slowT: 1.5, kb: 0.35, ultAura: 0.3 },
];
const TYPE_IX = {}; TYPES.forEach((T, i) => { TYPE_IX[T.id] = i; T.ix = i; });
const TIER_POOL = TIERS.map(() => []); TYPES.forEach((T, i) => TIER_POOL[T.tier].push(i));
/* every 고을 summons the same 19 companions, so every recipe works everywhere.
   recipes follow the old stories: 바리공주 is the first shaman, 처용 dances away the plague spirit from his wife, and so on */
const MYTHS = [
  { id: 'samulpae', parts: ['kkwaenggwari', 'janggu', 'jing', 'buk', 'sangmo'] },
  { id: 'uibyeongdae', parts: ['gwakjaewoo', 'seonbi', 'halmi', 'singijeon'] },
  { id: 'geobukseon', parts: ['yisunsin', 'sugun', 'singijeon'] },
  { id: 'choimuseon', parts: ['yisunsin', 'singijeon', 'buk'] },
  { id: 'bari', parts: ['mudang', 'halmi', 'bangsangsi'] },
  { id: 'cheoyong', parts: ['yangban', 'gaksi', 'bangsangsi'] },
  { id: 'yeongno', parts: ['yangban', 'kkwaenggwari', 'haetae'] },
  { id: 'gangrim', parts: ['gaksi', 'mudang', 'haetae'] },
  { id: 'saja', parts: ['haetae', 'sapsal', 'buk'] },
  { id: 'daejanggun', parts: ['dolhareubang', 'sapsal', 'seonbi'] },
  { id: 'yongwang', parts: ['mudang', 'kkwaenggwari', 'yisunsin'] },
  { id: 'kkokdusoe', parts: ['gaksi', 'sangmo', 'janggu'] },
  { id: 'gimseondal', parts: ['seonbi', 'yangban', 'sugun'] },
  { id: 'jangbogo', parts: ['sugun', 'gwakjaewoo', 'jing'] },
  { id: 'honggildong', parts: ['yangban', 'gwakjaewoo', 'euljimundeok'] },
  { id: 'seolmundae', parts: ['halmi', 'dolhareubang', 'euljimundeok'], secret: true },
  { id: 'bihyeong', parts: ['bangsangsi', 'sangmo', 'dolhareubang'], secret: true },
  // 신수: one named 전설, any 전설 ('*3'), and one more. spare legends become 신수 instead of sitting on a cell
  { id: 'cheongryong', parts: ['euljimundeok', '*3', 'mudang'], beast: true },
  { id: 'jujak', parts: ['bangsangsi', '*3', 'singijeon'], beast: true },
  { id: 'baekho', parts: ['euljimundeok', '*3', 'gwakjaewoo'], beast: true },
  { id: 'hyeonmu', parts: ['yisunsin', '*3', 'jing'], beast: true },
  { id: 'hwangryong', parts: ['seonbi', '*3', '*3'], beast: true },
  // 전래동화: other mythics are the parts
  { id: 'haedal', parts: ['baekho', 'bari', 'halmi'], tale: true },
  { id: 'hokburi', parts: ['bihyeong', 'kkokdusoe', 'kkwaenggwari'], tale: true },
  { id: 'namukkun', parts: ['daejanggun', 'seolmundae', 'haetae'], tale: true },
  { id: 'simcheong', parts: ['yongwang', 'jangbogo', 'gaksi'], tale: true },
];
const WILD = { '*3': 3 };
/* 신화 해금: four mythics, one per role, are open from the start; the rest are opened for good with 신화 두루마리.
   hidden mythics open by being found. playing together, a mythic either player has opened works for both */
const MYTH_FREE = ['samulpae', 'cheoyong', 'daejanggun', 'kkokdusoe'];
const scrollCost = M => (M.tale ? 3 : M.beast ? 2 : 1);
function mythOpenSelf(id) {
  if (typeof SAVE === 'undefined') return true;
  const M = MYTH_BY[id]; if (!M || M.secret) return true;
  if (MYTH_FREE.includes(id)) return true;
  return !!(SAVE.mopen && SAVE.mopen[id]);
}
function mythOpen(id) {
  if (mythOpenSelf(id)) return true;
  return !!(COOP.on && typeof CO !== 'undefined' && CO.partner && Array.isArray(CO.partner.mo) && CO.partner.mo.includes(id));
}
MYTHS.forEach(M => { M.ix = TYPE_IX[M.id]; M.partIx = M.parts.map(p => TYPE_IX[p]); });
const MYTH_BY = {}; MYTHS.forEach(M => { MYTH_BY[M.id] = M; });
/* which recipes each companion or mythic goes into */
const PARTS_OF = {}; MYTHS.forEach(M => M.parts.forEach(p => { if (WILD[p]) return; (PARTS_OF[p] = PARTS_OF[p] || []).push(M.id); }));
MYTHS.forEach(M => { TYPES[M.ix].grp = M.beast ? 'beast' : M.tale ? 'tale' : TYPES[M.ix].grp; });

/* ---------- 레벨 능력 ----------
   companions: Lv 3 공격력 +10%, Lv 6 its own skill, Lv 9 공격 속도 +10%, Lv 12 its own skill (Lv 12 is the top).
   mythics: every level adds attack; Lv 5 각성, Lv 10 신물, Lv 15 승천 (승천 needs 여의주, coming later).
   a perk changes the numbers the attack code already reads, so it works the same in every 고을 and with a friend */
const LV_TOP = 12, MYTH_TOP = 15;
const pMul = (k, m) => T => { T[k] = +(T[k] * m).toFixed(3); };
const pSet = (k, v) => T => { T[k] = v; };
const pAdd = (k, v) => T => { T[k] = +((T[k] || 0) + v).toFixed(3); };
const PERKS = {
  halmi: { 6: ['실타래가 더 감겨 느려짐 50%', pSet('slow', 0.5)], 12: ['3초 동안 느려져요', pSet('slowT', 3)] },
  kkwaenggwari: { 6: ['쇳소리가 세 마리까지 튕겨요', pSet('chain', 3)], 12: ['다섯 마리까지 튕겨요', pSet('chain', 5)] },
  buk: { 6: ['울림 둘레 1칸', pSet('aoe', 1.0)], 12: ['울릴 때마다 0.3초 기절', pSet('stunT', 0.3)] },
  dolhareubang: { 6: ['둘레 동료 보스 피해 +25%', pSet('bossAura', 0.25)], 12: ['돌주먹 기절 0.6초', pSet('stunT', 0.6)] },
  sugun: { 6: ['사거리 4.5칸', pSet('range', 4.5)], 12: ['치명타 확률 25%', pSet('crit', 0.25)] },
  yangban: { 6: ['둘에 한 번꼴로 엽전', pSet('coinP', 0.5)], 12: ['치명타 확률 20%', pSet('crit', 0.2)] },
  janggu: { 6: ['더 빨리 두드려요 · 0.8초마다', pSet('cd', 0.8)], 12: ['치명타 확률 20% · 2.5배', T => { T.crit = 0.2; T.critMul = 2.5; }] },
  jing: { 6: ['느려짐 35%', pSet('slow', 0.35)], 12: ['울림 둘레 1.6칸', pSet('aoe', 1.6)] },
  sapsal: { 6: ['기절 0.55초', pSet('stunT', 0.55)], 12: ['덮치는 둘레 0.85칸', pSet('aoe', 0.85)] },
  singijeon: { 6: ['불화살 일곱 발', pSet('bolts', 7)], 12: ['맞은 둘레를 태워요', pSet('burn', 0.3)] },
  seonbi: { 6: ['둘레 공속 +32%', pSet('aura', 0.32)], 12: ['둘레 공속 +40%', pSet('aura', 0.4)] },
  gaksi: { 6: ['빛줄기가 굵어져요', pSet('beamW', 0.5)], 12: ['치명타 확률 25%', pSet('crit', 0.25)] },
  sangmo: { 6: ['상모 끈 둘레 2.5칸', pSet('range', 2.5)], 12: ['휩쓴 도깨비가 20% 느려져요', T => { T.slow = 0.2; T.slowT = 1.0; }] },
  mudang: { 6: ['부정 +30%', pSet('curse', 0.3)], 12: ['부정 둘레 1.8칸', pSet('aoe', 1.8)] },
  gwakjaewoo: { 6: ['기절 0.55초', pSet('stunT', 0.55)], 12: ['공격력 +20%', pMul('dmg', 1.2)] },
  bangsangsi: { 6: ['금빛 창 다섯 개', pSet('bolts', 5)], 12: ['치명타가 4배', pSet('critMul', 4)] },
  haetae: { 6: ['덮치는 둘레 1.2칸', pSet('aoe', 1.2)], 12: ['기절 0.8초', pSet('stunT', 0.8)] },
  yisunsin: { 6: ['화살 아홉 발', pSet('arrows', 9)], 12: ['치명타 확률 25%', pSet('crit', 0.25)] },
  euljimundeok: { 6: ['느려짐 50%', pSet('slow', 0.5)], 12: ['2.6초 동안 느려져요', pSet('slowT', 2.6)] },
  // 신화: 5 각성, 10 신물
  samulpae: { 5: ['장단이 빨라져요 · 0.48초마다', pSet('cd', 0.48)], 10: ['신물 태극 꽹과리 · 일반·희귀 공격력 +30%', pSet('gAura', 0.3)] },
  uibyeongdae: { 5: ['봉기가 빨라져요 · 0.52초마다', pSet('cd', 0.52)], 10: ['신물 홍의 깃발 · 영웅 공격력 +30%', pSet('gAura', 0.3)] },
  geobukseon: { 5: ['화포 둘레 1.3칸', pSet('aoe', 1.3)], 10: ['신물 귀선도 · 두 번째마다 불을 뿜어요', pSet('breath', 2)] },
  choimuseon: { 5: ['주화 다섯 발', pSet('bolts', 5)], 10: ['신물 화약 비법서 · 불바다가 더 뜨거워요', pSet('field', 0.5)] },
  bari: { 5: ['방울이 여덟 마리까지 튕겨요', pSet('chain', 8)], 10: ['신물 생명수 · 체력 22% 아래면 저승으로', pSet('execute', 0.22)] },
  cheoyong: { 5: ['보스에게 3.5배', pSet('bossMul', 3.5)], 10: ['신물 처용 탈 · 보스에게 4배', pSet('bossMul', 4)] },
  yeongno: { 5: ['세 번째마다 삼켜요', pSet('devour', 3)], 10: ['신물 영노 비늘 · 보스 체력 3.5%를 베어 물어요', pSet('bite', 0.035)] },
  gangrim: { 5: ['명부에 오른 보스 피해 +30%', pSet('book', 0.3)], 10: ['신물 적패지 · 체력 22% 아래면 저승으로', pSet('execute', 0.22)] },
  saja: { 5: ['덮치는 둘레 1.9칸', pSet('aoe', 1.9)], 10: ['신물 사자 탈 · 기절 1초', pSet('stunT', 1.0)] },
  daejanggun: { 5: ['최대 체력 4%를 깎아요', pSet('pct', 0.04)], 10: ['신물 장승 말뚝 · 느려짐 55%', pSet('slow', 0.55)] },
  yongwang: { 5: ['둘레 궁극기 충전 +45%', pSet('ultAura', 0.45)], 10: ['신물 용궁 진주 · 더 멀리 밀어내요', pSet('kb', 0.5)] },
  kkokdusoe: { 5: ['접시 넷', pSet('plates', 4)], 10: ['신물 버나 · 엽전이 더 자주 떨어져요', pSet('coinP', 0.14)] },
  gimseondal: { 5: ['잡을 때마다 엽전 12부터', pSet('killCoin', 12)], 10: ['신물 대동강 문서 · 이자 7%', pSet('interest', 0.07)] },
  jangbogo: { 5: ['20초마다 무역선', pSet('trade', 20)], 10: ['신물 청해진 깃발 · 화포 둘레 1.25칸', pSet('aoe', 1.25)] },
  honggildong: { 5: ['분신 셋과 네 번 베어요', pSet('clones', 4)], 10: ['신물 활빈당 깃발 · 보스에게서 네 번에 한 번 훔쳐요', pSet('steal', 0.25)] },
  seolmundae: { 5: ['바위 둘레 1.7칸', pSet('aoe', 1.7)], 10: ['신물 흙치마 · 3초 동안 느려져요', pSet('slowT', 3)] },
  bihyeong: { 5: ['여섯 초마다 호령', pSet('command', 6)], 10: ['신물 귀교 돌 · 도깨비불 다섯', pSet('orbs', 5)] },
  cheongryong: { 5: ['세 초마다 번개', pSet('storm', 3)], 10: ['신물 청룡 비늘 · 공격력 +15%', pMul('dmg', 1.15)] },
  jujak: { 5: ['불 둘레 1.6칸', pSet('aoe', 1.6)], 10: ['신물 불새 깃 · 더 오래 태워요', pSet('burn', 0.8)] },
  baekho: { 5: ['할퀸 도깨비 피해 +30%', pSet('mark', 0.3)], 10: ['신물 백호 발톱 · 기절 0.9초', pSet('stunT', 0.9)] },
  hyeonmu: { 5: ['일곱 초마다 큰 물결', pSet('shell', 7)], 10: ['신물 현무 등껍질 · 물방울 여섯', pSet('orbs', 6)] },
  hwangryong: { 5: ['모든 동료 공격력 +20%', pSet('allAura', 0.2)], 10: ['신물 황룡 수염 · 보스에게 2.5배', pSet('bossMul', 2.5)] },
  haedal: { 5: ['햇살 일곱 줄기', pSet('orbs', 7)], 10: ['신물 동아줄 · 공격력 +15%', pMul('dmg', 1.15)] },
  hokburi: { 5: ['여덟 초마다 노래', pSet('song', 8)], 10: ['신물 도깨비 방망이 · 아홉 마리까지 튕겨요', pSet('chain', 9)] },
  namukkun: { 5: ['보스에게 3.5배', pSet('bossMul', 3.5)], 10: ['신물 금도끼 · 도끼 둘레 1칸', pSet('splash', 1.0)] },
  simcheong: { 5: ['여섯 초마다 인당수', pSet('tide', 6)], 10: ['신물 연꽃 · 보스에게 3배', pSet('bossMul', 3)] },
};
const lvTop = T => (T.tier >= 4 ? MYTH_TOP : LV_TOP);
/* what each level brings, for the 도감 */
function lvPerks(T) {
  const P = PERKS[T.id] || {};
  if (T.tier >= 4) return [[5, '각성 · ' + (P[5] ? P[5][0] : '공격력 +10%')], [10, P[10] ? P[10][0] : '신물 · 공격력 +15%'], [15, '승천 · 여의주를 얻으면 열려요 (준비 중)']];
  return [[3, '공격력 +10%'], [6, P[6] ? P[6][0] : '공격력 +10%'], [9, '공격 속도 +10%'], [12, P[12] ? P[12][0] : '공격력 +15%']];
}
const TYPES_BASE = TYPES.map(T => Object.assign({}, T));
/* put each type back to its base numbers, then add the perks of the level it has reached */
function applyLevels(lvFn) {
  TYPES.forEach((T, i) => {
    const B = TYPES_BASE[i];
    for (const k of Object.keys(T)) if (!(k in B)) delete T[k];
    Object.assign(T, B);
    const lv = lvFn ? lvFn(T.id) : 1, P = PERKS[T.id]; if (!P) return;
    for (const at of Object.keys(P)) if (lv >= +at) P[at][1](T);
  });
}
const FOES = [
  { name: '청도깨비', speed: 1.0, hpMul: 1, desc: '방망이를 든 흔한 도깨비' },
  { name: '홍도깨비', speed: 1.18, hpMul: 1, desc: '뿔이 둘 달린 성질 급한 도깨비' },
  { name: '달걀귀신', speed: 0.92, hpMul: 1.3, desc: '얼굴이 달걀처럼 밋밋한 귀신' },
  { name: '외눈도깨비', speed: 1.08, hpMul: 1.2, desc: '눈이 하나뿐인 힘센 도깨비' },
  { name: '야광귀', speed: 1.65, hpMul: 0.55, desc: '설날 밤 신발을 훔쳐 가는 날쌘 귀신' },
  { name: '쇠도깨비', speed: 0.9, hpMul: 1.25, armor: true, desc: '쇠 갑옷을 둘러 일반·희귀 동료 공격을 반만 받아요' },
  { name: '물귀신', speed: 1.0, hpMul: 0.9, revive: true, desc: '쓰러져도 한 번 다시 일어나요' },
  { name: '망령', speed: 1.0, hpMul: 1.0, split: true, desc: '쓰러지면 작은 망령 둘로 나뉘어요' },
];
const BOSS_DEF = {
  beom: { name: '장산범', speed: 0.7, r: 0.55, note: '울음소리로 동료 셋을 잠깐 홀려요' },
  gumiho: { name: '구미호', speed: 0.8, r: 0.5, note: '둔갑술로 앞으로 훌쩍 건너뛰어요' },
  imugi: { name: '이무기', speed: 0.65, r: 0.45, hpF: 0.8, note: '체력이 차오르고, 많이 다치면 빨라져요' },
  bulgasari: { name: '불가살이', speed: 0.55, r: 0.6, note: '쇠 몸이라 일반·희귀 동료 공격은 반만 들어가요' },
  geumdwaeji: { name: '금돼지', speed: 0.72, r: 0.5, note: '때때로 땅속으로 숨어 공격을 피해요' },
  daejeok: { name: '지하국 대적', speed: 0.5, r: 0.6, hpF: 0.8, note: '곁의 도깨비를 집어삼켜 체력을 채워요' },
  heukryong: { name: '흑룡', speed: 0.6, r: 0.48, hpF: 0.9, note: '먹구름으로 한 줄의 동료를 잠깐 묶어요' },
  yeomra: { name: '염라대왕', speed: 0.45, r: 0.6, hpF: 0.8, note: '망령을 불러내고 가장 센 동료를 심판해요' },
};
const STAGES = [
  { id: 'hahoe', name: '하회마을', theme: 'village', hp: 0.78, bossF: 1, spd: 1.0, special: 0, bosses: { 10: 'beom', 20: 'gumiho', 30: 'imugi', 40: 'bulgasari', 50: 'geumdwaeji', 60: 'daejeok', 70: 'heukryong', 80: 'yeomra' }, rule: '도깨비가 처음 몰려든 고을이에요', reward: 1 },
  { id: 'jeoja', name: '저잣거리', theme: 'market', hp: 1.1, bossF: 1, spd: 1.06, special: 4, bosses: { 10: 'gumiho', 20: 'beom', 30: 'geumdwaeji', 40: 'bulgasari', 50: 'imugi', 60: 'heukryong', 70: 'daejeok', 80: 'yeomra' }, rule: '날쌘 야광귀가 섞여 와요', reward: 1.3 },
  { id: 'sanseong', name: '산성', theme: 'fortress', hp: 1.5, bossF: 1.1, spd: 1.0, special: 5, bosses: { 10: 'beom', 20: 'imugi', 30: 'gumiho', 40: 'daejeok', 50: 'bulgasari', 60: 'geumdwaeji', 70: 'yeomra', 80: 'heukryong' }, rule: '쇠도깨비는 일반·희귀 동료 공격을 반만 받아요', reward: 1.6 },
  { id: 'jinyeong', name: '수군 진영', theme: 'sea', hp: 1.9, bossF: 1.3, spd: 1.03, special: 6, bosses: { 10: 'imugi', 20: 'geumdwaeji', 30: 'daejeok', 40: 'bulgasari', 50: 'gumiho', 60: 'beom', 70: 'yeomra', 80: 'heukryong' }, rule: '물귀신은 한 번 쓰러져도 다시 일어나요', reward: 2 },
  { id: 'jeoseung', name: '저승길', theme: 'underworld', hp: 2.3, bossF: 1.6, spd: 1.05, special: 7, bosses: { 10: 'geumdwaeji', 20: 'daejeok', 30: 'heukryong', 40: 'gumiho', 50: 'imugi', 60: 'bulgasari', 70: 'daejeok', 80: 'yeomra' }, rule: '망령이 쓰러지면 작은 망령 둘로 나뉘어요', reward: 2.5 },
];
/* the same companions in every 고을: 일반·희귀·영웅 five each, 전설 four */
const ROSTER = ['halmi', 'kkwaenggwari', 'buk', 'dolhareubang', 'sugun', 'yangban', 'janggu', 'jing', 'sapsal', 'singijeon', 'seonbi', 'gaksi', 'sangmo', 'mudang', 'gwakjaewoo', 'bangsangsi', 'haetae', 'yisunsin', 'euljimundeok'];
const LIVE = TYPES.filter(T => !T.old);
STAGES.forEach(S => {
  S.myths = MYTHS.map(M => M.id);
  S.units = ROSTER;
  S.pool = [0, 1, 2, 3].map(t => ROSTER.map(id => TYPE_IX[id]).filter(k => TYPES[k].tier === t));
});
const hasUnitT = k => G.units.some(u => u && u.t === k) || !!(G.exp && G.exp.run && G.exp.run.units && G.exp.run.units.some(u => u && u.t === k));
/* legends named by a recipe you can make right now */
function legNeed() {
  const out = new Set();
  for (const M of MYTHS) { if (M.secret || !mythOpen(M.id)) continue; for (const p of M.parts) { const k = TYPE_IX[p]; if (k != null && TYPES[k].tier === 3) out.add(k); } }
  return [...out];
}
/* a legend an open recipe still needs and you have none of comes up more often, so one missing part can't stall a whole run */
const poolOf = tier => {
  const S = STAGES[(G && G.stage) || 0], P = S.pool[tier];
  if (tier !== 3 || !G || !G.units) return P;
  const miss = legNeed().filter(k => !hasUnitT(k));
  return miss.length ? P.concat(miss) : P;
};
const STACK_CAP = [3, 3, 3, 1, 1, 1, 1], capOf = t => STACK_CAP[TYPES[t].tier];
const TIER_MUL = [1, 1.5, 2.2, 3.1, 2.6, 2.8, 3.0];
/* mythic ultimates: a mana bar fills while 도깨비 are on the yard, then the skill fires on its own */
const ULTS = {
  samulpae: { name: '판굿', t: 18, desc: '마당의 모든 도깨비를 치고 1.5초 기절시켜요' },
  bari: { name: '저승문', t: 16, desc: '도깨비가 몰린 곳에 저승문을 열어 약해진 도깨비를 한꺼번에 데려가요' },
  kkokdusoe: { name: '버나 소나기', t: 15, desc: '접시 여덟 개를 사방으로 던지고 엽전을 한 움큼 챙겨요' },
  saja: { name: '사자 놀음', t: 18, desc: '도깨비 무리 세 곳을 연달아 덮쳐요' },
  daejanggun: { name: '장승 결계', t: 16, desc: '둘레 도깨비를 4초 동안 크게 늦추고 받는 피해를 30% 늘려요' },
  cheoyong: { name: '처용무', t: 15, desc: '붉은 물결 다섯 줄을 부채꼴로 보내요. 보스에겐 세 배' },
  bihyeong: { name: '도깨비불 폭풍', t: 16, desc: '도깨비불 열두 개를 한꺼번에 날려요' },
  haedal: { name: '동아줄', t: 20, desc: '하늘에서 동아줄이 내려와 가장 센 도깨비를 크게 치고 마당 전체를 2초 멈춰 세워요' },
  hokburi: { name: '혹 떼기', t: 22, desc: '가장 체력이 많은 도깨비의 혹을 떼어 체력을 크게 깎고 혼 1개와 엽전을 받아요' },
  namukkun: { name: '산신령의 선물', t: 20, desc: '금도끼 여섯 자루가 가장 센 도깨비들에게 떨어져요. 보스에겐 세 배, 엽전도 받아요' },
  cheongryong: { name: '비구름', t: 18, desc: '먹구름을 몰고 와 번개 열두 줄기를 내리꽂고 도깨비를 모두 느리게 해요' },
  jujak: { name: '불사조', t: 18, desc: '날개를 펼쳐 마당의 도깨비를 모두 치고 한참 태워요' },
  baekho: { name: '산군의 포효', t: 18, desc: '포효로 마당의 도깨비를 모두 1.5초 멈춰 세우고 5초 동안 받는 피해를 30% 늘려요' },
  hyeonmu: { name: '거북 등껍질', t: 18, desc: '큰 물결로 마당의 도깨비를 모두 치고 멀리 밀어내요' },
  hwangryong: { name: '여의주 천둥', t: 18, desc: '여의주가 터지며 마당의 도깨비를 모두 크게 쳐요. 보스에겐 2.5배' },
  simcheong: { name: '연꽃 환생', t: 20, desc: '연꽃이 피어나 6초 동안 모든 동료가 60% 빨리 때리고 도깨비는 모두 크게 느려져요' },
  geobukseon: { name: '일제 포격', t: 16, desc: '화포 열두 발을 마당 곳곳에 퍼부어요' },
  uibyeongdae: { name: '의병 봉기', t: 19, desc: '6초 동안 영웅 동료 공격력이 50% 올라요' },
  choimuseon: { name: '화통도감', t: 17, desc: '주화 열 발을 도깨비가 몰린 곳마다 퍼부어 불바다를 만들어요' },
  yeongno: { name: '아흔아홉 양반', t: 18, desc: '작은 도깨비를 여섯까지 한꺼번에 삼키고 보스는 남은 체력의 6%를 베어 물어요' },
  gangrim: { name: '명부 등재', t: 18, desc: '보스와 도전 귀신을 명부에 올려 8초 동안 받는 피해를 40% 늘리고, 체력이 30% 아래인 작은 도깨비를 모두 저승으로 데려가요' },
  gimseondal: { name: '대동강 물장사', t: 20, desc: '도깨비가 가장 많이 몰린 곳에 강물을 쏟아 크게 치고 가진 엽전의 10%를 한 번 더 벌어요' },
  jangbogo: { name: '청해진 무역선', t: 20, desc: '무역선 함대가 화포 여덟 발을 퍼붓고 엽전을 가득 실어 와요' },
  honggildong: { name: '분신 여덟', t: 16, desc: '분신 여덟이 가장 센 도깨비들을 크게 베고, 보스를 벨 때마다 엽전을 훔쳐요' },
  seolmundae: { name: '한라산', t: 19, desc: '커다란 산을 떨어뜨려 넓은 곳을 크게 치고 기절시켜요' },
  yongwang: { name: '용궁 소용돌이', t: 18, desc: '도깨비가 가장 많이 몰린 곳에 소용돌이를 일으켜 둘레 도깨비를 크게 치고 2.5초 동안 붙잡아요. 보스에겐 두 배' },
};
function bossAt(w) { const k = STAGES[G ? G.stage || 0 : 0].bosses[w]; return k ? Object.assign({ key: k }, BOSS_DEF[k]) : null; }
/* challenge ladder: fixed strength, so the higher ones only fall once your yard has grown */
const CHALS = [
  { id: 'eodum', name: '어둑시니', level: '쉬움', hp: 1500, time: 30, cd: 60, speed: 0.6, r: 0.4, coins: 150, hon: 0, silver: 0, rec: 4, desc: '쳐다볼수록 커지는 어둠 귀신' },
  { id: 'dueok', name: '두억시니', level: '보통', hp: 8000, time: 35, cd: 90, speed: 0.5, r: 0.45, coins: 400, hon: 1, silver: 0, rec: 12, desc: '사람을 해코지하는 심술궂은 도깨비' },
  { id: 'gangcheol', name: '강철이', level: '어려움', hp: 40000, time: 40, cd: 120, speed: 0.45, r: 0.5, coins: 1000, hon: 2, silver: 200, rec: 20, desc: '지나는 곳마다 가뭄을 부르는 쇠 이무기' },
  { id: 'jine', name: '천년 지네', level: '아주 어려움', hp: 190000, time: 45, cd: 150, speed: 0.42, r: 0.5, coins: 2000, hon: 3, silver: 400, rec: 28, desc: '천 년을 묵어 사람을 홀리는 커다란 지네' },
  { id: 'yacha', name: '야차', level: '지옥', hp: 750000, time: 50, cd: 180, speed: 0.4, r: 0.55, coins: 4000, hon: 5, silver: 800, unit: 3, jade: 3, rec: 35, desc: '불꽃 머리를 휘날리는 사나운 야차. 잡으면 전설 동료가 합류해요' },
];
/* 도깨비굴 출정: send one cell to the cave; it leaves the yard until the cave boss falls or time runs out */
const CAVE = [
  { key: 'f0', name: '청도깨비 대장', hp: 2000, rw: { hon: 1, coins: 300 } },
  { key: 'f1', name: '홍도깨비 대장', hp: 6000, rw: { hon: 2, coins: 600 } },
  { key: 'f3', name: '외눈도깨비 대장', hp: 15000, rw: { unit: 2, coins: 900 } },
  { key: 'f5', name: '쇠도깨비 대장', hp: 40000, rw: { hon: 3, silver: 200, coins: 1500 } },
  { key: 'b_beom', name: '굴 속 장산범', hp: 100000, rw: { unit: 3, coins: 2000 } },
  { key: 'b_gumiho', name: '굴 속 구미호', hp: 250000, rw: { part: 1, silver: 400 } },
  { key: 'b_geumdwaeji', name: '굴 속 금돼지', hp: 600000, rw: { hon: 5, coins: 5000, silver: 500 } },
  { key: 'b_daejeok', name: '굴 깊은 곳 지하국 대적', hp: 1500000, rw: { part: 1, unit: 3, silver: 1000 } },
];
const CAVE_TIME = 30, CAVE_CD = 15, EXP_MAX = 5;
/* 출정지: 하회마을 has the 도깨비굴. from the second 고을 on, every 고을 sends you somewhere of its own,
   and each place wants a different kind of companion. same floors, same 30 seconds, different sums */
const DESTS = {
  cave: { id: 'cave', place: '도깨비굴', u: '층', label: n => `굴 ${n}층`, why: '대장 하나와 싸워요. 보스에게 센 동료가 유리해요', mouth: ['#6d6474', '#15111c'], hpMul: 1, floors: CAVE },
  market: { id: 'market', place: '장터 뒷골목', u: '판', label: n => `장터 ${n}판`, why: '떼로 몰려오는 소매치기예요. 여럿을 한꺼번에 치는 동료가 몇 배로 쳐요', mouth: ['#9a6a3a', '#3a2414'], hpMul: 1.9,
    floors: [
      { key: 'f4', name: '야광귀 패거리', hp: 2000, rw: { coins: 500 } },
      { key: 'f1', name: '홍도깨비 소매치기 떼', hp: 6000, rw: { coins: 900, luck: 1 } },
      { key: 'f2', name: '달걀귀신 노름꾼들', hp: 15000, rw: { coins: 1400, hon: 1 } },
      { key: 'f3', name: '외눈 왈패 무리', hp: 40000, rw: { coins: 2200, silver: 300 } },
      { key: 'f5', name: '쇠도깨비 장사치들', hp: 100000, rw: { coins: 3500, luck: 1 } },
      { key: 'f7', name: '망령 장꾼 떼', hp: 250000, rw: { coins: 5000, unit: 3 } },
      { key: 'b_geumdwaeji', name: '금돼지 노름판', hp: 600000, rw: { coins: 8000, silver: 600 } },
      { key: 'b_gumiho', name: '구미호 투전판', hp: 1500000, rw: { coins: 12000, part: 1, silver: 1000 } },
    ] },
  gate: { id: 'gate', place: '산성 성문', u: '차', label: n => `성문 ${n}차`, why: '성문을 미는 무리예요. 묶고 늦추는 동료가 하나 있을 때마다 모두 60%씩 세져요 (셋까지)', mouth: ['#8a8478', '#4a2f1c'], hpMul: 1.6,
    floors: [
      { key: 'f0', name: '청도깨비 선봉', hp: 2000, rw: { hon: 2 } },
      { key: 'f1', name: '홍도깨비 돌격대', hp: 6000, rw: { unit: 2 } },
      { key: 'f3', name: '외눈 공성대', hp: 15000, rw: { hon: 3, coins: 600 } },
      { key: 'f5', name: '쇠도깨비 충차', hp: 40000, rw: { unit: 3 } },
      { key: 'b_beom', name: '장산범 무리', hp: 100000, rw: { hon: 4, silver: 300 } },
      { key: 'b_bulgasari', name: '성벽 먹는 불가살이', hp: 250000, rw: { unit: 3, hon: 2 } },
      { key: 'b_daejeok', name: '지하국 대적 군세', hp: 600000, rw: { part: 1, hon: 4 } },
      { key: 'b_heukryong', name: '흑룡 먹구름', hp: 1500000, rw: { unit: 3, part: 1, silver: 1000 } },
    ] },
  sea: { id: 'sea', place: '앞바다', u: '척', label: n => `${n}번째 배`, why: '먼바다의 배를 쳐요. 사거리가 긴 동료일수록 세고, 짧으면 거의 못 닿아요', mouth: ['#3f78c8', '#0f2340'], hpMul: 1.4,
    floors: [
      { key: 'f6', name: '물귀신 쪽배', hp: 2000, rw: { coins: 300, silver: 100 } },
      { key: 'f0', name: '청도깨비 돛배', hp: 6000, rw: { silver: 200, hon: 1 } },
      { key: 'f3', name: '외눈 해적선', hp: 15000, rw: { part: 1 } },
      { key: 'f5', name: '쇠도깨비 철갑선', hp: 40000, rw: { silver: 400, coins: 1500 } },
      { key: 'b_imugi', name: '이무기 물길', hp: 100000, rw: { part: 1, hon: 2 } },
      { key: 'f7', name: '망령 유령선', hp: 250000, rw: { silver: 700, unit: 3 } },
      { key: 'b_heukryong', name: '흑룡 폭풍', hp: 600000, rw: { part: 1, silver: 800 } },
      { key: 'b_daejeok', name: '대적 선단', hp: 1500000, rw: { part: 1, unit: 3, silver: 1200 } },
    ] },
  hell: { id: 'hell', place: '저승 시왕전', u: '관', label: n => `저승 ${n}관`, why: '시왕이 무리를 심판해요. 패거리와 등급이 여러 가지 섞일수록 세져요', mouth: ['#7a2a3a', '#1a0610'], hpMul: 1.5,
    floors: [
      { key: 'f7', name: '진광대왕', hp: 2000, rw: { hon: 2 } },
      { key: 'f6', name: '초강대왕', hp: 6000, rw: { hon: 2, coins: 800 } },
      { key: 'f2', name: '송제대왕', hp: 15000, rw: { unit: 2, hon: 2 } },
      { key: 'f5', name: '오관대왕', hp: 40000, rw: { silver: 400, hon: 3 } },
      { key: 'b_yeomra', name: '염라대왕', hp: 100000, rw: { part: 1, hon: 3 } },
      { key: 'c_yacha', name: '변성대왕', hp: 250000, rw: { unit: 3, hon: 4 } },
      { key: 'b_heukryong', name: '태산대왕', hp: 600000, rw: { part: 1, silver: 800 } },
      { key: 'b_daejeok', name: '평등대왕', hp: 1500000, rw: { unit: 3, part: 1, hon: 6 } },
    ] },
};
const STAGE_DEST = ['cave', 'market', 'gate', 'sea', 'hell'];
const destOf = st => DESTS[STAGE_DEST[st != null ? st : (G && G.stage) || 0] || 'cave'];
const BAL = {
  hpBase: 40, hpGrowth: 1.205, hpGrowth2: 1.10, bossMul: { 10: 16, 20: 18, 30: 13, 40: 7, 50: 7, 60: 6.5, 70: 6, 80: 5.5 },
  startCoins: 400, summonBase: 100, summonStep: 20, coinsDiv: 8, coinsPer: 1, coinUnit: 10,
  upBonus: 0.2, upBase: [100, 200, 300, 400], upStep: [100, 150, 220, 300], luckCost: [600, 1200, 2000, 3200, 4800],
  perWave: 24, waveExtra: 0.5, cap: 100, spawnGap: 0.45, honPerWave: 1, lvBonus: 0.15, mythLvBonus: 0.12,
};
const SUMMON_BASE = [0.87, 0.11, 0.02, 0];
const SUMMON_LUCK = [-0.03, 0.02, 0.008, 0.002], SUMMON_LUCK2 = [-0.025, 0.015, 0.008, 0.002];
/* 소환 운 1~5단계는 엽전, 6~10단계는 혼으로 올려요 */
const LUCK_COIN = 5, LUCK_HON = [4, 5, 6, 8, 10];
/* three 굿: each either calls one companion of its grade or fails. every failure fills 정성 by its weight,
   and once 정성 is full the next 굿 always works (지성이면 감천). 신명 부적: every unit attacks faster for a while */
const GUTS = [
  { id: 'jaesu', name: '재수굿', tier: 1, p: 0.6, cost: 1, pity: 1, note: '복을 비는 작은 굿' },
  { id: 'daedong', name: '대동굿', tier: 2, p: 0.2, cost: 1, pity: 2, note: '온 마을이 함께하는 큰 굿' },
  { id: 'byeolsin', name: '별신굿', tier: 3, p: 0.1, cost: 2, pity: 4, note: '몇 해에 한 번 벌이는 마을 큰 잔치' },
];
const PITY_MAX = 20;
const CHARM = { cost: 4, t: 20, spd: 1.4 };
const LUCK_MAX = 10, WAVE_TIME = 20, LAST_WAVE = 80, BREAK_WAVE = 40;
let UP_MAX = 40;
let BOSS_TIME = 60;
/* in-run 강화 goes by grade: 일반·희귀 together, then 영웅, 전설 and 신화 */
const UP_NAMES = ['일반·희귀', '영웅', '전설', '신화', '소환 운'], UP_SHORT = ['일반', '영웅', '전설', '신화', '운'];
const UP_TIER = [0, 0, 1, 2, 3, 3, 3], upGroup = T => UP_TIER[T.tier];
const UP_COLOR = [TIERS[1].color, TIERS[2].color, TIERS[3].color, TIERS[4].color];

/* the first 40 마당 climb steeply; after that the curve eases so a grown yard can push on to 80 */
const hpAt = w => BAL.hpBase * Math.pow(BAL.hpGrowth, Math.min(w, BREAK_WAVE) - 1) * Math.pow(BAL.hpGrowth2, Math.max(0, w - BREAK_WAVE)) * STAGES[G.stage || 0].hp * (G && G.sea ? G.sea.hp : 1);
const killCoins = w => BAL.coinUnit * (1 + BAL.coinsPer * Math.floor((w - 1) / BAL.coinsDiv)) * (G && G.rel ? 1 + G.rel.kill : 1);
/* the first twenty calls are cheap so the yard grows fast early; from the fortieth on it is the old price again */
const summonCost = () => { const n = G.summons, b = BAL.summonBase, st = BAL.summonStep, c = n < 20 ? b + st * 0.5 * n : n < 40 ? b + st * 10 + st * 1.5 * (n - 20) : b + st * n; return G.sea && G.sea.sum !== 1 ? Math.round(c * G.sea.sum / 10) * 10 : c; };
const luckByHon = () => G.up[LUCK] >= LUCK_COIN;
const upCost = g => g === LUCK ? (luckByHon() ? LUCK_HON[Math.min(G.up[LUCK] - LUCK_COIN, LUCK_HON.length - 1)] : BAL.luckCost[G.up[LUCK]]) : Math.round((BAL.upBase[g] + BAL.upStep[g] * G.up[g]) * (G.sea ? G.sea.up : 1) / 10) * 10;
function summonOdds() {
  const L1 = Math.min(G.up[LUCK], LUCK_COIN), L2 = Math.max(0, G.up[LUCK] - LUCK_COIN), o = SUMMON_BASE.map((p, i) => Math.max(0, p + SUMMON_LUCK[i] * L1 + SUMMON_LUCK2[i] * L2));
  const s = o.reduce((a, b) => a + b, 0); return o.map(p => p / s);
}

/* ================= state ================= */
let G = null;
/* which unit is dealing damage right now, so kills can be credited to it */
let HIT_UID = 0;
/* 친구랑 같이: the network layer (h_coop) fills in partner data and sync(); the rules here only read it.
   each player runs their own yard; a boss has one health pool that both damage */
const COOP = { on: false, hpMul: 1.5, bossW: 0, bossDmg: 0, pApplied: 0, sync: null };
const UID_CELL = {};
let FX_ON = true;
function emit(e) { if (FX_ON && G.ev.length < 900) G.ev.push(e); }
function noop() {}
let toast = noop, onEnd = noop;
/* 유물 bonuses for one run; the lobby fills these from the save */
/* gr: attack bonus by 강화 group (일반·희귀, 영웅, 전설) */
function noRelics() { return { atk: 0, myth: 0, boss: 0, coins0: 0, hon0: 0, ult: 0, bossTime: 0, kill: 0, exp: 0, gut: 0, crit: 0, safe: 0, gun: 0, gr: [0, 0, 0] }; }
/* 엽전검: every 100 엽전 you hold is a little more attack, up to this much */
const MONEY_CAP = 2.5;
const moneyMul = () => (G.rel && G.rel.gun ? 1 + Math.min(MONEY_CAP, G.rel.gun * Math.floor(Math.max(0, G.coins) / 100)) : 1);
/* 돈궤: at the end of every 마당 the 엽전 you kept grow. the chest holds more the deeper you go */
const safeCap = w => 2000 + 400 * w;
function paySafe() {
  if (!G.rel || !G.rel.safe) return;
  const c = Math.floor(Math.min(Math.max(0, G.coins), safeCap(G.wave)) * G.rel.safe);
  if (c > 0) { G.coins += c; G.stats.safe = (G.stats.safe || 0) + c; G.stats.income = (G.stats.income || 0) + c; emit({ k: 'safe', v: c }); }
}
function makeState(phase, speed = 1) {
  return {
    phase, wave: 0, waveT: 0, spawnLeft: 0, spawnT: 0, coins: BAL.startCoins, hon: 0, summons: 0, stage: 0,
    units: Array(NCELL).fill(null), foes: [], shots: [], pend: [], addQ: [], up: [0, 0, 0, 0, 0],
    speed, paused: false, sel: -1, time: 0, boss: null, nextId: 1, endReason: '',
    ev: [], spd: Array(NCELL).fill(1), dmgN: Array(NCELL).fill(1), rngB: Array(NCELL).fill(0), auraDirty: true, gradeMul: [1, 1, 1, 1], pity: 0, fields: [], ghosts: [], outHits: [], mb: [0, 0, 0, 0, 0],
    rel: noRelics(), bossTimeMax: BOSS_TIME,
    lvMul: TYPES.map(() => 1), lvSpd: TYPES.map(() => 1), chalCd: CHALS.map(C => C.cd * 0.3), tierBuff: {}, killBy: {}, earnBy: {}, charmT: 0, lotusT: 0, sky: null, skyT: 0, exp: { floor: 1, cd: 0, run: null, wins: 0 },
    stats: { kills: 0, merges: 0, guts: 0, bossKills: 0, crafts: 0, crafted: {}, seen: {}, foeSeen: {}, summons: 0, chalWins: 0, chalHard: 0, chalTop: 0, silverBonus: 0, caveTop: 0, missions: 0 },
    miss: null, missT: 0,
  };
}
function newGame(lvMul, lvSpd, stage, rel) {
  G = makeState('play', G ? G.speed : 1);
  G.stage = clamp(stage || 0, 0, STAGES.length - 1);
  if (lvMul) G.lvMul = lvMul.slice();
  if (lvSpd) G.lvSpd = lvSpd.slice();
  if (rel) { G.rel = Object.assign(noRelics(), rel, { gr: [0, 1, 2].map(k => (rel.gr && rel.gr[k]) || 0) }); G.coins += G.rel.coins0; G.hon += G.rel.hon0; }
  G.bossTimeMax = BOSS_TIME + G.rel.bossTime;
  nextWave();
}
function nextWave() {
  G.wave++;
  if (G.wave > 1) { G.hon += (BAL.honPerWave + (G.sea ? G.sea.honW : 0)) * (G.sea ? G.sea.honMul : 1); paySafe(); payInterest(); }
  const B = bossAt(G.wave), S = STAGES[G.stage];
  if (B) {
    G.waveT = G.bossTimeMax || BOSS_TIME; G.spawnLeft = 0;
    spawnBoss(B);
    emit({ k: 'banner', main: `제 ${G.wave} 마당`, sub: `${B.name} 출현! ${B.note}`, boss: true });
  } else {
    G.waveT = WAVE_TIME; G.spawnLeft = BAL.perWave + Math.floor(BAL.waveExtra * Math.max(0, G.wave - 10)); G.spawnT = 0;
    if (G.wave === 1) emit({ k: 'banner', main: `${S.name} · 제 1 마당`, sub: S.rule });
    else if (G.wave === 3 && S.special) emit({ k: 'banner', main: `${FOES[S.special].name} 출현`, sub: FOES[S.special].desc });
    else if (G.wave === BREAK_WAVE + 1) emit({ k: 'banner', main: `제 ${G.wave} 마당`, sub: '여기부터 깊은 마당이에요. 온갖 도깨비가 섞여 와요' });
    else if (G.wave % 10 === 1) emit({ k: 'banner', main: `제 ${G.wave} 마당`, sub: `${FOES[Math.min(3, Math.floor((G.wave - 1) / 10))].name} 무리가 몰려와요` });
  }
}
/* 김선달: each one on the yard pays a share of the coins you hold, up to a cap that grows with the 마당 */
function payInterest() {
  for (let i = 0; i < NCELL; i++) {
    const u = G.units[i], T = u && TYPES[u.t]; if (!T || !T.interest) continue;
    const c = Math.min(Math.floor(G.coins * T.interest), 100 + 30 * G.wave);
    if (c > 0) { G.coins += c; earnFor(u.id, c); G.stats.income = (G.stats.income || 0) + c; emit({ k: 'coin', x: cellX(i), y: cellY(i) - 0.3, v: c, big: true }); }
  }
}
function placeFoe(f) {
  const p = pathAt(f.d);
  f.x = p.x - p.dy * f.lane; f.y = p.y + p.dx * f.lane; f.hx = p.dx; f.hy = p.dy;
}
function newFoe(kind, hp, speed, r, extra) {
  return Object.assign({ id: G.nextId++, kind, boss: null, d: 0, hp, max: hp, speed, r, lane: 0,
    slowT: 0, slowAmt: 0, stunT: 0, burnT: 0, burnDps: 0, markT: 0, markAmt: 0, curseT: 0, curseAmt: 0, revT: 0, flash: 0, age: 0,
    x: 0, y: 0, hx: 1, hy: 0, dead: false, big: false, reward: 1, wob: rand(0, TAU) }, extra);
}
function spawnFoe() {
  const w = G.wave, S = STAGES[G.stage];
  let kind = Math.min(3, Math.floor((w - 1) / 10));
  if (kind > 0 && Math.random() < 0.3) kind = Math.floor(Math.random() * kind);
  if (S.special && w >= 3 && Math.random() < 0.25) kind = S.special;
  else if (w > BREAK_WAVE && Math.random() < 0.2) kind = 4 + Math.floor(Math.random() * 4);
  const F = FOES[kind];
  const f = newFoe(kind, hpAt(w) * F.hpMul, F.speed * S.spd * (1 + w * 0.004) * (G.sea ? G.sea.fspd : 1), 0.28, { lane: rand(-0.18, 0.18), reward: killCoins(w) });
  if (F.armor) f.armor = 1;
  if (F.revive) f.rev = 1;
  if (F.split) f.split = 1;
  placeFoe(f); G.foes.push(f);
  G.stats.foeSeen['f' + kind] = 1;
}
function spawnBoss(B) {
  if (COOP.on) { COOP.bossW = G.wave; COOP.bossDmg = 0; COOP.pApplied = 0; }
  const f = newFoe(0, hpAt(G.wave) * BAL.bossMul[G.wave] * (B.hpF || 1) * (STAGES[G.stage].bossF || 1) * (COOP.on ? COOP.hpMul : 1) * (G.sea ? G.sea.bossHp : 1), B.speed * STAGES[G.stage].spd * (G.sea ? G.sea.fspd : 1), B.r, { boss: B.key, big: true, name: B.name, reward: BAL.coinUnit * (20 + G.wave * 3), skT: 4, skT2: 6, rage: false, wob: 0, hidden: 0 });
  placeFoe(f); G.foes.push(f); G.boss = f;
  G.stats.foeSeen['b_' + B.key] = 1;
  emit({ k: 'bossSpawn', key: B.key });
}

/* ================= 판 안 임무 =================
   three at a time. the first seven teach the run in order: summon, merge, 굿, 강화, 영웅, 전설, 신화.
   after that they come from a pool, and the rewards grow with the 마당 */
const tierOnYard = t => (G.units.some(u => u && TYPES[u.t].tier >= t) ? 1 : 0);
const upSum = () => G.up[0] + G.up[1] + G.up[2] + G.up[3];
/* 임무 장부: every goal of the run on one page, each paid once. collecting a whole grade, selling, merging,
   bad luck at the 굿, helping on the shared road. the rewards make the rest of the run easier:
   엽전 and 혼 now, or attack for a grade until the run ends (b: [일반·희귀, 영웅, 전설, 신화, 모두]) */
const tierSetOwned = t => { const P = STAGES[G.stage || 0].pool[t]; const have = new Set(); for (const u of G.units) if (u) have.add(u.t); let n = 0; for (const k of new Set(P)) if (have.has(k)) n++; return n; };
const tierSetSize = t => new Set(STAGES[G.stage || 0].pool[t]).size;
const mythOnYard = () => G.units.filter(u => u && TYPES[u.t].tier >= 4).length;
const MISS_GROUPS = [['first', '첫걸음'], ['set', '모으기'], ['hand', '손놀림'], ['gut', '굿'], ['fight', '싸움'], ['duo', '둘이서']];
const MISSIONS = [
  { id: 'sum', g: 'first', text: '동료 10번 소환하기', cur: () => G.stats.summons, goal: 10, coins: 150 },
  { id: 'merge', g: 'first', text: '같은 동료 셋을 모아 합성하기', cur: () => G.stats.merges, goal: 1, coins: 200 },
  { id: 'gut', g: 'first', text: '혼으로 굿 벌이기', cur: () => G.stats.guts, goal: 1, hon: 2 },
  { id: 'up', g: 'first', text: '강화 3번 하기', cur: upSum, goal: 3, coins: 300 },
  { id: 'all0', g: 'set', text: '일반 동료 다섯 모두 마당에 두기', cur: () => tierSetOwned(0), goal: () => tierSetSize(0), coins: 300, b: [0.1, 0, 0, 0, 0] },
  { id: 'all1', g: 'set', text: '희귀 동료 다섯 모두 마당에 두기', cur: () => tierSetOwned(1), goal: () => tierSetSize(1), hon: 2, b: [0.1, 0, 0, 0, 0] },
  { id: 'all2', g: 'set', text: '영웅 동료 다섯 모두 마당에 두기', cur: () => tierSetOwned(2), goal: () => tierSetSize(2), hon: 3, b: [0, 0.15, 0, 0, 0] },
  { id: 'all3', g: 'set', text: '전설 동료 넷 모두 마당에 두기', cur: () => tierSetOwned(3), goal: () => tierSetSize(3), hon: 4, b: [0, 0, 0.15, 0, 0] },
  { id: 'myth1', g: 'set', text: '신화 조합하기', cur: () => G.stats.crafts, goal: 1, coins: 600, hon: 2 },
  { id: 'myth3', g: 'set', text: '신화 셋을 한꺼번에 마당에 두기', cur: mythOnYard, goal: 3, hon: 5, b: [0, 0, 0, 0.1, 0] },
  { id: 'sell5', g: 'hand', text: '동료 5번 팔기', cur: () => G.stats.sells || 0, goal: 5, coins: 300 },
  { id: 'sell20', g: 'hand', text: '동료 20번 팔기', cur: () => G.stats.sells || 0, goal: 20, coins: 900 },
  { id: 'merge10', g: 'hand', text: '합성 10번 하기', cur: () => G.stats.merges, goal: 10, luck: 1 },
  { id: 'up10', g: 'hand', text: '강화 합쳐서 10번 하기', cur: upSum, goal: 10, coins: 1000 },
  { id: 'sum50', g: 'hand', text: '동료 50번 소환하기', cur: () => G.stats.summons, goal: 50, hon: 3 },
  { id: 'rich', g: 'hand', text: '엽전 3,000을 한꺼번에 쥐기', cur: () => Math.floor(G.coins), goal: 3000, hon: 2 },
  { id: 'gut5', g: 'gut', text: '굿 5번 벌이기', cur: () => G.stats.guts, goal: 5, hon: 3 },
  { id: 'gutbad', g: 'gut', text: '굿에서 내리 세 번 꽝 나기', cur: () => G.stats.gutFailTop || 0, goal: 3, hon: 4, note: '부정 탄 날엔 위로금' },
  { id: 'gutleg', g: 'gut', text: '별신굿으로 전설 받기', cur: () => G.stats.gutLeg || 0, goal: 1, coins: 1000 },
  { id: 'kill500', g: 'fight', text: '도깨비 500마리 잡기', cur: () => G.stats.kills, goal: 500, coins: 500 },
  { id: 'kill2000', g: 'fight', text: '도깨비 2,000마리 잡기', cur: () => G.stats.kills, goal: 2000, b: [0, 0, 0, 0, 0.05] },
  { id: 'boss3', g: 'fight', text: '보스 셋 잡기', cur: () => G.stats.bossKills, goal: 3, hon: 5 },
  { id: 'chal3', g: 'fight', text: '도전 귀신 셋 잡기', cur: () => G.stats.chalWins, goal: 3, coins: 1000 },
  { id: 'cave3', g: 'fight', text: '출정 세 번 이기기', cur: () => (G.exp ? G.exp.wins : 0), goal: 3, hon: 3 },
  { id: 'help50', g: 'duo', duo: true, text: '가운데 길에서 동료 쪽 도깨비 50마리 잡아 주기', cur: () => G.stats.assists || 0, goal: 50, coins: 500 },
  { id: 'gift', g: 'duo', duo: true, text: '동료에게 엽전 보내기', cur: () => G.stats.gifts || 0, goal: 1, hon: 2 },
  { id: 'joint', g: 'duo', duo: true, text: '합동 굿 벌이기', cur: () => G.stats.joint || 0, goal: 1, coins: 400, hon: 1 },
  { id: 'joint3', g: 'duo', duo: true, text: '합동 굿 세 번 벌이기', cur: () => G.stats.joint || 0, goal: 3, b: [0, 0.05, 0.05, 0, 0] },
  { id: 'help300', g: 'duo', duo: true, text: '가운데 길에서 300마리 잡아 주기', cur: () => G.stats.assists || 0, goal: 300, b: [0, 0, 0, 0, 0.05] },
];
const MISS_BY = Object.fromEntries(MISSIONS.map(m => [m.id, m]));
const missGoal = D => (typeof D.goal === 'function' ? D.goal() : D.goal);
const missOn = D => !D.duo || COOP.on || (G && G.duo);
function missInit() { G.miss = { done: {} }; if (!G.mb) G.mb = [0, 0, 0, 0, 0]; }
function missProg(D) { return Math.min(missGoal(D), Math.max(0, D.cur() || 0)); }
function missReward(D) {
  const k = 1 + Math.min(4, Math.floor((G.wave || 1) / 10)) * 0.25;
  return { coins: D.coins ? Math.round(D.coins * k / 10) * 10 : 0, hon: D.hon || 0, b: D.b || null, luck: D.luck || 0 };
}
const BUF_NAME = ['일반·희귀', '영웅', '전설', '신화', '모두'];
function rewardText(rw) {
  const out = [];
  if (rw.coins) out.push(`엽전 ${fmtC(rw.coins)}`);
  if (rw.hon) out.push(`혼 ${rw.hon}`);
  if (rw.b) rw.b.forEach((v, i) => { if (v) out.push(`${BUF_NAME[i]} 공격 +${Math.round(v * 100)}%`); });
  if (rw.luck) out.push(`소환 운 +${rw.luck}`);
  return out.join(' · ');
}
/* the goal shown at the bottom of the yard: the first-steps in order, then whatever is closest to done */
function missNext() {
  if (!G.miss) return null;
  let best = null, bk = -1;
  for (const D of MISSIONS) {
    if (G.miss.done[D.id] || !missOn(D)) continue;
    if (D.g === 'first') return D;
    const k = missProg(D) / missGoal(D);
    if (k > bk) { bk = k; best = D; }
  }
  return best;
}
const missDoneN = () => (G.miss ? Object.keys(G.miss.done).length : 0);
const missAllN = () => MISSIONS.filter(missOn).length;
function missTick(dt) {
  if (!G.miss || !G.miss.done) missInit();
  if (!G.mb) G.mb = [0, 0, 0, 0, 0];
  G.missT = (G.missT || 0) - dt; if (G.missT > 0) return;
  G.missT = 0.4;
  for (const D of MISSIONS) {
    if (G.miss.done[D.id] || !missOn(D) || missProg(D) < missGoal(D)) continue;
    G.miss.done[D.id] = 1;
    const rw = missReward(D);
    G.coins += rw.coins; G.hon += rw.hon; G.stats.missions = (G.stats.missions || 0) + 1;
    if (rw.b) { rw.b.forEach((v, i) => { G.mb[i] += v; }); G.auraDirty = true; }
    if (rw.luck && G.up[LUCK] < LUCK_MAX) G.up[LUCK] = Math.min(LUCK_MAX, G.up[LUCK] + rw.luck);
    emit({ k: 'mission', id: D.id, text: D.text, coins: rw.coins, hon: rw.hon });
    toast(`임무 완료! ${D.text} · ${rewardText(rw)}`);
  }
}

/* ================= actions ================= */
function isAway(i) { const r = G.exp && G.exp.run; return !!r && !!r.cells && r.cells.includes(i); }
function emptyCells() { const out = []; G.units.forEach((u, i) => { if (!u && !isAway(i)) out.push(i); }); return out; }
function newUnit(t) { G.stats.seen[TYPES[t].id] = 1; return { id: G.nextId++, t, c: 1, cd: rand(0.1, 0.5), dir: 0, sil: 0, n: 0, busy: 0, cmd: 0 }; }
/* same companions stack in one cell, up to 3 for 일반·희귀·영웅. a new one joins a stack with room, else takes an empty cell */
function addUnit(t, prefer = -1) {
  const cap = capOf(t); let i = -1;
  for (let k = 0; k < NCELL; k++) { const u = G.units[k]; if (u && u.t === t && u.c < cap) { i = k; break; } }
  if (i < 0) { if (prefer >= 0 && !G.units[prefer]) i = prefer; else { const e = emptyCells(); if (!e.length) return -1; i = pick(e); } }
  if (G.units[i]) G.units[i].c++; else G.units[i] = newUnit(t);
  G.stats.seen[TYPES[t].id] = 1; G.auraDirty = true;
  return i;
}
function hasRoom() { if (emptyCells().length) return true; return G.units.some(u => u && u.c < capOf(u.t)); }
function canMergeAt(i) { const u = G.units[i]; return !!u && TYPES[u.t].tier <= 2 && u.c >= capOf(u.t); }
function mergeAt(i) {
  if (G.phase !== 'play' || !canMergeAt(i)) return false;
  const u = G.units[i], nt = TYPES[u.t].tier + 1, t = pick(poolOf(nt));
  u.c -= capOf(u.t); if (u.c <= 0) G.units[i] = null;
  const to = addUnit(t, i);
  G.stats.merges++; G.auraDirty = true;
  emit({ k: 'merge', from: i, to, tier: nt });
  if (G.sel === i) G.sel = to;
  return true;
}
function rollTier(odds) { let r = Math.random(); for (let i = 0; i < odds.length; i++) { if ((r -= odds[i]) < 0) return i; } return 0; }
function place(i, t) { G.units[i] = newUnit(t); G.auraDirty = true; return G.units[i]; }
function summon() {
  if (G.phase !== 'play') return false;
  const cost = summonCost();
  if (G.coins < cost) { toast('엽전이 모자라요'); return false; }
  if (!hasRoom()) { toast('멍석이 꽉 찼어요. 하얗게 빛나는 칸을 합성하거나 팔아 주세요'); return false; }
  const tier = rollTier(summonOdds()), t = pick(poolOf(tier)), i = addUnit(t);
  if (i < 0) { toast(`${TYPES[t].name} 자리가 없어서 돌려보냈어요. 엽전은 그대로예요`); return false; }
  G.coins -= cost; G.summons++; G.stats.summons++;
  emit({ k: 'summon', cell: i, tier });
  return true;
}
function gutP(Gd) { return Math.min(0.95, Gd.p * (1 + Math.min(0.5, G && G.rel ? G.rel.gut : 0))); }
/* k: which 굿 (0 재수굿, 1 대동굿, 2 별신굿) */
function gamble(k) {
  if (G.phase !== 'play') return false;
  const Gd = GUTS[k | 0] || GUTS[0];
  if (G.hon < Gd.cost) { toast('혼이 모자라요. 마당을 넘기거나 보스를 잡으면 모여요'); return false; }
  const empty = emptyCells();
  if (!empty.length) { toast('굿은 빈 칸이 하나 있어야 벌일 수 있어요'); return false; }
  G.hon -= Gd.cost; G.stats.guts++;
  G.stats.gutKind = G.stats.gutKind || [0, 0, 0]; G.stats.gutKind[k | 0]++;
  const sure = (G.pity || 0) >= PITY_MAX;
  if (!sure && Math.random() >= gutP(Gd)) {
    G.pity = Math.min(PITY_MAX, (G.pity || 0) + Gd.pity);
    G.stats.gutFailRun = (G.stats.gutFailRun || 0) + 1; G.stats.gutFailTop = Math.max(G.stats.gutFailTop || 0, G.stats.gutFailRun);
    emit({ k: 'gutfail', cell: pick(empty) });
    toast(G.pity >= PITY_MAX ? '부정 탔다… 꽝. 그래도 정성이 가득 찼어요. 다음 굿은 꼭 돼요' : '부정 탔다… 꽝');
    return true;
  }
  if (sure) G.pity = 0;
  G.stats.gutFailRun = 0; if (Gd.tier >= 3) G.stats.gutLeg = (G.stats.gutLeg || 0) + 1;
  const t = pick(poolOf(Gd.tier)), i = addUnit(t);
  emit({ k: 'gut', cell: i, tier: Gd.tier, sure });
  toast(`${sure ? '지성이면 감천!' : Gd.tier >= 3 ? '신이 내렸다!' : '굿 효험!'} ${TIERS[Gd.tier].name} ${TYPES[t].name}`);
  return true;
}
/* ---------- 절기: every run falls on one of the 24 seasons of the old calendar ----------
   each changes the run a little, mostly in your favour, sometimes a trade. with a partner both yards share one */
const SEASONS = [
  { id: 'ipchun', name: '입춘', s: 0, line: '봄이 서요', e: { sum: 0.9 }, desc: '소환 비용 10% 싸요' },
  { id: 'usu', name: '우수', s: 0, line: '눈이 녹아 비가 돼요', e: { fspd: 0.92 }, desc: '도깨비가 8% 느려요' },
  { id: 'gyeongchip', name: '경칩', s: 0, line: '개구리가 깨어나요', e: { fspd: 1.05, kill: 0.2 }, desc: '도깨비가 5% 빠르지만 잡을 때 엽전 20% 더' },
  { id: 'chunbun', name: '춘분', s: 0, line: '낮과 밤이 같아요', e: { dmg: 1.06 }, desc: '모든 동료 공격력 6% 더' },
  { id: 'cheongmyeong', name: '청명', s: 0, line: '하늘이 맑아요', e: { crit: 0.05 }, desc: '치명타 확률 5% 더' },
  { id: 'gogu', name: '곡우', s: 0, line: '곡식을 깨우는 비가 와요', e: { coins0: 300 }, desc: '처음 엽전 300 더' },
  { id: 'ipha', name: '입하', s: 1, line: '여름이 서요', e: { as: 1.06 }, desc: '공격 속도 6% 빨라요' },
  { id: 'soman', name: '소만', s: 1, line: '온 들이 차올라요', e: { ult: 0.15 }, desc: '궁극기가 15% 빨리 차요' },
  { id: 'mangjong', name: '망종', s: 1, line: '씨를 뿌려요', e: { hon0: 3 }, desc: '처음 혼 3 더' },
  { id: 'haji', name: '하지', s: 1, line: '낮이 가장 길어요', e: { bossTime: 10 }, desc: '보스 제한 시간 10초 더' },
  { id: 'soseo', name: '소서', s: 1, line: '더위가 와요', e: { hp: 1.08, kill: 0.2 }, desc: '도깨비 체력 8% 더, 엽전 20% 더' },
  { id: 'daeseo', name: '대서', s: 1, line: '가장 더워요', e: { fspd: 0.9, as: 0.95 }, desc: '도깨비가 지쳐 10% 느리고 동료도 5% 느려요' },
  { id: 'ipchu', name: '입추', s: 2, line: '가을이 서요', e: { gut: 0.15 }, desc: '굿 성공 확률 15% 올라요' },
  { id: 'cheoseo', name: '처서', s: 2, line: '더위가 물러가요', e: { up: 0.85 }, desc: '강화 비용 15% 싸요' },
  { id: 'baengno', name: '백로', s: 2, line: '이슬이 맺혀요', e: { boss: 0.15 }, desc: '보스에게 주는 피해 15% 더' },
  { id: 'chubun', name: '추분', s: 2, line: '밤이 길어지기 시작해요', e: { dmg: 1.04, as: 1.04 }, desc: '공격력과 공격 속도 4%씩 더' },
  { id: 'hallo', name: '한로', s: 2, line: '찬 이슬이 내려요', e: { hp: 0.95, bossHp: 1.1 }, desc: '도깨비 체력 5% 덜, 보스 체력 10% 더' },
  { id: 'sanggang', name: '상강', s: 2, line: '서리가 내려요', e: { fspd: 0.88, kill: -0.1 }, desc: '도깨비가 12% 느리지만 엽전 10% 덜' },
  { id: 'ipdong', name: '입동', s: 3, line: '겨울이 서요', e: { bossHon: 2 }, desc: '보스를 잡으면 혼 2 더' },
  { id: 'soseol', name: '소설', s: 3, line: '첫눈이 와요', e: { fspd: 0.94, ult: 0.1 }, desc: '도깨비 6% 느리고 궁극기 10% 빨리 차요' },
  { id: 'daeseol', name: '대설', s: 3, line: '큰 눈이 와요', e: { hp: 1.1, honW: 1 }, desc: '도깨비 체력 10% 더, 마당 넘길 때 혼 1 더' },
  { id: 'dongji', name: '동지', s: 3, line: '밤이 가장 길어요 · 팥죽 먹는 날', e: { hp: 1.15, honMul: 2 }, desc: '도깨비 체력 15% 더, 혼은 두 배' },
  { id: 'sohan', name: '소한', s: 3, line: '작은 추위', e: { as: 0.95, hon0: 4 }, desc: '공격 속도 5% 느리고 처음 혼 4 더' },
  { id: 'daehan', name: '대한', s: 3, line: '가장 추워요', e: { hp: 1.2, kill: 0.3, honW: 1 }, desc: '도깨비 체력 20% 더, 엽전 30% 더, 마당 넘길 때 혼 1 더' },
];
const SEASON_NAMES = ['봄', '여름', '가을', '겨울'], SEASON_COLORS = ['#f3a6c0', '#7cc96b', '#e8a24a', '#9cc8ff'];
const SEA_BASE = { dmg: 1, as: 1, fspd: 1, hp: 1, bossHp: 1, sum: 1, up: 1, honW: 0, honMul: 1, bossHon: 0 };
/* put one on the run in G. the relic-like parts go straight into G.rel */
function applySeason(k) {
  const S = SEASONS[((k | 0) % SEASONS.length + SEASONS.length) % SEASONS.length], e = S.e;
  G.sea = Object.assign({}, SEA_BASE, { id: S.id, k: SEASONS.indexOf(S) });
  for (const key of Object.keys(SEA_BASE)) if (e[key] != null) G.sea[key] = e[key];
  if (!G.rel) G.rel = noRelics();
  for (const key of ['kill', 'crit', 'gut', 'boss', 'ult', 'bossTime']) if (e[key]) G.rel[key] = (G.rel[key] || 0) + e[key];
  if (e.bossTime) G.bossTimeMax = (G.bossTimeMax || BOSS_TIME) + e.bossTime;
  if (e.coins0) G.coins += e.coins0;
  if (e.hon0) G.hon += e.hon0;
  return S;
}
const seasonOf = () => (G && G.sea ? SEASONS[G.sea.k] : null);

/* ---------- 숨은 합동기: two mythics from one story, one in each yard ----------
   nothing in the game tells you about them. when both are out and the shared road is busy, they go off together */
const COMBOS = [
  { id: 'hakik', name: '학익진', a: 'geobukseon', b: 'choimuseon', fx: 'volley', line: '거북선과 최무선이 학의 날개처럼 가운데 길을 감싸 불화살을 퍼부어요' },
  { id: 'pangut', name: '판굿', a: 'samulpae', b: 'samulpae', fx: 'haste', line: '두 사물놀이패가 장단을 맞춰요 · 두 마당 모두 신명 나게 빨라져요' },
  { id: 'jeoseung', name: '저승길', a: 'bari', b: 'gangrim', fx: 'reap', line: '바리공주와 강림도령이 저승길을 열어요 · 다 죽어 가는 도깨비를 데려가요' },
  { id: 'jwacheong', name: '좌청룡 우백호', a: 'cheongryong', b: 'baekho', fx: 'power', line: '청룡과 백호가 양쪽을 지켜요 · 두 마당 모두 15초 동안 공격력 20%' },
  { id: 'namju', name: '남주작 북현무', a: 'jujak', b: 'hyeonmu', fx: 'burn', line: '불과 물이 가운데 길을 덮어요 · 느려지고 타올라요' },
  { id: 'indangsu', name: '인당수', a: 'yongwang', b: 'simcheong', fx: 'sweep', line: '용왕이 심청을 맞으러 물길을 열어요 · 가운데 길 도깨비가 휩쓸려 가요' },
  { id: 'hwalbin', name: '활빈당', a: 'honggildong', b: 'uibyeongdae', fx: 'loot', line: '홍길동과 의병이 도깨비 재물을 털어 나눠요' },
  { id: 'daedonggang', name: '대동강 거래', a: 'jangbogo', b: 'gimseondal', fx: 'trade', line: '장보고와 김선달이 큰 거래를 터요 · 둘 다 엽전을 받아요' },
];
const COMBO_CD = 45, COMBO_SRC = { tier: 4, id: 'combo', ally: true };
const onShared = f => !f.dead && !(f.hidden > 0) && f.y <= -HY + 0.55;
function comboLive(C, mine, theirs) { return (mine.has(C.a) && theirs.has(C.b)) || (mine.has(C.b) && theirs.has(C.a)); }
function comboReady(C) { const busy = G.foes.filter(onShared).length >= 3 || (G.boss && !G.boss.dead); return busy && !((G.comboCd && G.comboCd[C.id]) > 0); }
/* goes off in whichever yard G is right now; each yard does its own half */
function comboFire(C) {
  if (G.phase !== 'play') return false;
  G.comboCd = G.comboCd || {}; G.comboCd[C.id] = COMBO_CD;
  G.stats.combos = (G.stats.combos || 0) + 1;
  const w = G.wave, road = G.foes.filter(onShared), boss = G.boss && !G.boss.dead ? G.boss : null, hp = hpAt(w);
  const hitBoss = k => { if (boss && G.phase === 'play') { HIT_UID = 0; damage(boss, boss.max * k, COMBO_SRC, true); } };
  switch (C.fx) {
    case 'volley': for (const f of road) { if (f.big) continue; HIT_UID = 0; damage(f, hp * 0.9, COMBO_SRC, true); if (G.phase !== 'play') return true; } hitBoss(0.05); break;
    case 'haste': G.charmT = Math.max(G.charmT || 0, 12); break;
    case 'reap': for (const f of G.foes.slice()) { if (f.dead || f.big || f.hp > f.max * 0.35) continue; HIT_UID = 0; kill(f); if (G.phase !== 'play') return true; } hitBoss(0.03); break;
    case 'power': G.comboPowT = 15; break;
    case 'burn': for (const f of road) { f.slowT = Math.max(f.slowT || 0, 6); f.slowAmt = Math.max(f.slowAmt || 0, 0.5); f.burnT = 6; f.burnUid = 0; f.burnDps = Math.max(f.burnDps || 0, hp * (f.big ? 0.02 : 0.12)); } break;
    case 'sweep': for (const f of road) { if (f.big) continue; knock(f, 2.5); HIT_UID = 0; damage(f, hp * 0.3, COMBO_SRC, false); if (G.phase !== 'play') return true; } break;
    case 'loot': G.coins += killCoins(w) * 30; hitBoss(0.04); break;
    case 'trade': G.coins += killCoins(w) * 50; break;
  }
  emit({ k: 'combo', id: C.id });
  return true;
}
function comboTickCd(dt) { if (G.comboCd) for (const k in G.comboCd) if (G.comboCd[k] > 0) G.comboCd[k] -= dt; if (G.comboPowT > 0) G.comboPowT -= dt; }

/* ---------- 합동 굿: one 굿상 between the two yards ----------
   each side puts 혼 on it, a hon at a time. once both are in, a few seconds to add more, then one roll for both:
   no 꽝, both get a companion of the same grade, and the more 혼 on the table the better the grade.
   a: your 혼 on the table, b: your partner's, n: which table (a new one after every roll) */
const JOINT = { MAX: 5, WAIT: 5, n: 1, a: 0, b: 0, t: 5, ka: 0, kb: 0 };
function jointOdds(T) { const leg = Math.min(0.4, 0.04 * T), hero = Math.min(1 - leg, 0.12 * T); return [Math.max(0, 1 - leg - hero), hero, leg]; }
function jointRoll(T) { const [, h, l] = jointOdds(T), x = Math.random(); return x < l ? 3 : x < l + h ? 2 : 1; }
function jointReset() { Object.assign(JOINT, { n: 1, a: 0, b: 0, t: JOINT.WAIT, ka: 0, kb: 0 }); }
/* the roll lands in whichever yard G is right now */
function jointAward(tier, stake) {
  if (!emptyCells().length) { G.hon += stake; return -1; }
  const t = pick(poolOf(tier)), i = addUnit(t);
  G.stats.guts++; G.stats.joint = (G.stats.joint || 0) + 1; G.stats.gutFailRun = 0;
  if (tier >= 3) G.stats.gutLeg = (G.stats.gutLeg || 0) + 1;
  emit({ k: 'gut', cell: i, tier, sure: false });
  return t;
}
function charm() {
  if (G.phase !== 'play') return false;
  if (G.hon < CHARM.cost) { toast('혼이 모자라요'); return false; }
  G.hon -= CHARM.cost; G.charmT = CHARM.t; G.stats.charms = (G.stats.charms || 0) + 1;
  emit({ k: 'charm' });
  toast(`신명 부적! ${CHARM.t}초 동안 모두 ${Math.round((CHARM.spd - 1) * 100)}% 빨리 때려요`);
  return true;
}
function upgrade(g) {
  if (G.phase !== 'play') return false;
  if (g === LUCK ? G.up[LUCK] >= LUCK_MAX : G.up[g] >= UP_MAX) { toast(`${UP_NAMES[g]} 강화는 끝까지 했어요`); return false; }
  const cost = upCost(g), byHon = g === LUCK && luckByHon();
  if (byHon ? G.hon < cost : G.coins < cost) { toast(byHon ? `소환 운 ${G.up[LUCK] + 1}단계부터는 혼으로 올려요. 혼이 모자라요` : '엽전이 모자라요'); return false; }
  if (byHon) G.hon -= cost; else G.coins -= cost;
  G.up[g]++;
  emit({ k: 'upgrade', g });
  if (g === LUCK) { const o = summonOdds(); toast(`소환 운 ${G.up[LUCK]}단계 · 희귀 ${Math.round(o[1] * 100)}% 영웅 ${(o[2] * 100).toFixed(1)}% 전설 ${(o[3] * 100).toFixed(1)}%`); }
  else toast(`${UP_NAMES[g]} 동료 공격력 +${Math.round(BAL.upBonus * 100 * G.up[g])}%`);
  return true;
}
function sell(i) {
  const u = G.units[i]; if (!u) return;
  const v = TIERS[TYPES[u.t].tier].sell;
  G.coins += v; u.c--; if (u.c <= 0) G.units[i] = null; G.auraDirty = true;
  G.stats.sells = (G.stats.sells || 0) + 1;
  emit({ k: 'sell', cell: i, v });
  if (G.sel === i && !G.units[i]) G.sel = -1;
}
function drop(from, to) {
  if (to < 0 || to === from || !G.units[from]) return false;
  if (isAway(to)) { toast('출정 간 동료의 자리예요'); return false; }
  const a = G.units[from], b = G.units[to];
  if (b && a.t === b.t) {
    const room = capOf(a.t) - b.c;
    if (room > 0) {
      const k = Math.min(room, a.c); b.c += k; a.c -= k;
      if (a.c <= 0) G.units[from] = null;
      G.auraDirty = true; emit({ k: 'stack', from, to });
      if (G.sel === from && !G.units[from]) G.sel = to;
      return true;
    }
    if (canMergeAt(to)) toast('이 칸은 꽉 찼어요. 두 번 눌러서 합성해 보세요');
  }
  G.units[to] = a; G.units[from] = b || null; G.auraDirty = true;
  if (G.sel === from) G.sel = to; else if (G.sel === to) G.sel = from;
  return true;
}
/* challenges: summon a strong spirit and beat it in time */
function chalReady(i) { return G.chalCd[i] <= 0 && !G.foes.some(f => f.chal === CHALS[i].id && !f.dead); }
function callChallenge(i) {
  if (G.phase !== 'play') return false;
  const C = CHALS[i];
  if (G.foes.some(f => f.chal === C.id && !f.dead)) { toast(`${C.name}가 아직 마당에 있어요`); return false; }
  if (G.chalCd[i] > 0) { toast(`${C.name}는 ${Math.ceil(G.chalCd[i])}초 뒤에 부를 수 있어요`); return false; }
  const f = newFoe(0, C.hp * STAGES[G.stage].hp, C.speed, C.r, { chal: C.id, big: true, name: C.name, chalT: C.time, chalMax: C.time, reward: 0, wob: 0 });
  placeFoe(f); G.foes.push(f); G.chalCd[i] = C.cd;
  G.stats.foeSeen['c_' + C.id] = 1;
  emit({ k: 'chalSpawn', id: C.id });
  toast(`${C.name} 등장! ${C.time}초 안에 잡으면 보상을 받아요`);
  return true;
}
/* 도깨비굴 출정 */
function caveFloor() {
  const D = destOf(), L = D.floors, n = G.exp.floor, C = L[Math.min(n, L.length) - 1], extra = Math.max(0, n - L.length);
  /* 1.4: the estimate counts every arrow and bolt, so the bosses got a little tougher to match */
  return Object.assign({}, C, { n, hp: C.hp * 1.4 * D.hpMul * Math.pow(2.2, extra) * STAGES[G.stage].hp });
}
/* against a crowd: how many of them one attack catches */
function crowdHits(T) {
  switch (T.kind) {
    case 'double': return 2;
    case 'bolts': return T.bolts || 1;
    case 'homing': return T.orbs || 1;
    case 'clone': return (T.clones || 1) * 1.5;
    case 'volley': return (T.arrows || 1) * 0.8;
    case 'chain': case 'pulse': case 'cone': case 'beat': case 'wave': case 'fire': case 'drop': return 3;
    case 'cannon': return 2.5;
    case 'beam': case 'boomerang': return 2;
    case 'whip': case 'curse': return 1.5;
    default: return 1;
  }
}
/* out at sea only the long arms reach */
const reachMul = T => (T.range >= 3.8 ? 1.6 : T.range >= 3.2 ? 1 : 0.4);
const isCtrl = T => !!(T.slow || T.stun || T.role === 'ctrl');
/* what the place does to the whole party: 산성 wants holders, 저승 wants a mixed crowd */
function destParty(cells) {
  const D = destOf(), T = cells.filter(c => G.units[c]).map(c => TYPES[G.units[c].t]);
  if (D.id === 'gate') { const n = Math.min(3, T.filter(isCtrl).length); return { mul: 1 + 0.6 * n, n }; }
  if (D.id === 'hell') { const f = new Set(T.map(t => t.fam)).size, g = new Set(T.map(t => Math.min(4, t.tier))).size; return { mul: 1 + 0.3 * Math.max(0, f - 1) + 0.15 * Math.max(0, g - 1), f, g }; }
  return { mul: 1 };
}
/* how many blows one attack lands on a single big cave boss: a fan of arrows only half meets it */
function hitsOn1(T) {
  switch (T.kind) {
    case 'double': return 2;
    case 'bolts': return T.bolts || 1;
    case 'homing': return T.orbs || 1;
    case 'clone': return T.clones || 1;
    case 'volley': return Math.max(1, (T.arrows || 1) * 0.45);
    case 'boomerang': return 2;
    default: return 1;
  }
}
function expDps(u) {
  const T = TYPES[u.t], D = destOf(), crit = 1 + Math.min(1, (T.crit || 0.05) + (G.rel ? G.rel.crit || 0 : 0)) * ((T.critMul || 2) - 1);
  const base = dmgOf(u.t, -1) * (u.c || 1) * crit / (T.cd * G.lvSpd[u.t]) * 0.95;
  switch (D.id) {
    case 'market': return base * crowdHits(T);
    case 'sea': return base * hitsOn1(T) * reachMul(T);
    case 'gate': case 'hell': return base * hitsOn1(T);
    default: return base * hitsOn1(T) * (T.bossMul || 1);
  }
}
/* buffs travel with the party. 선비 speeds up the others, 무동 and 솟대 add damage, 장승 말뚝이 무당 make the cave boss take more */
function partyBuffs(cells) {
  const T = cells.filter(c => G.units[c]).map(c => TYPES[G.units[c].t]), b = { spd: 0, dmg: 0, sot: 0, mark: 0, curse: 0, markBy: '', curseBy: '' };
  for (const t of T) {
    if (t.aura) b.spd++; if (t.dmgAura) b.dmg++; if (t.rngAura) b.sot++; if (t.bossAura) b.bo = (b.bo || 0) + 1;
    if (t.mark && t.mark > b.mark) { b.mark = t.mark; b.markBy = t.name; }
    if (t.curse && t.curse > b.curse) { b.curse = t.curse; b.curseBy = t.name; }
  }
  return b;
}
function partyDps(cells) {
  cells = cells.filter(c => G.units[c]);
  const b = partyBuffs(cells);
  let sum = 0;
  for (const c of cells) {
    const t = TYPES[G.units[c].t], sp = b.spd - (t.aura ? 1 : 0), dm = b.dmg - (t.dmgAura ? 1 : 0), so = b.sot - (t.rngAura ? 1 : 0);
    const bo = (b.bo || 0) - (t.bossAura ? 1 : 0);
    sum += expDps(G.units[c]) * (1 + 0.25 * Math.min(2, sp)) * (1 + 0.2 * Math.min(2, dm) + 0.1 * Math.min(2, so)) * (1 + 0.15 * Math.min(2, Math.max(0, bo)));
  }
  return sum * (1 + b.mark) * (1 + b.curse) * destParty(cells).mul;
}
function expReady() { return !G.exp.run && G.exp.cd <= 0; }
function expTime() { return CAVE_TIME + (G.rel ? G.rel.exp : 0); }
/* how much of this floor's boss a cell (or a party) would cut down in time: 1 means just enough */
function expRatio(cell) { return G.units[cell] ? partyDps([cell]) * expTime() / caveFloor().hp : 0; }
function partyRatio(cells) { return partyDps(cells) * expTime() / caveFloor().hp; }
/* old saves sent one cell; parties keep a list */
function normExp() { const r = G.exp && G.exp.run; if (r && !r.cells) { r.cells = [r.cell]; r.units = [r.unit]; delete r.cell; delete r.unit; } }
function startExp(cells) {
  if (G.phase !== 'play' || !expReady()) return false;
  if (!Array.isArray(cells)) cells = [cells];
  cells = [...new Set(cells)].filter(c => c >= 0 && c < NCELL && G.units[c]).slice(0, EXP_MAX);
  if (!cells.length) return false;
  const F = caveFloor(), dps = partyDps(cells);
  G.exp.run = { cells, units: cells.map(c => G.units[c]), hp: F.hp, max: F.hp, t: expTime(), dps, floor: F.n, name: F.name, key: F.key };
  cells.forEach(c => { G.units[c] = null; });
  G.auraDirty = true; if (cells.includes(G.sel)) G.sel = -1;
  G.stats.foeSeen[F.key] = 1;
  emit({ k: 'expGo', cells, name: F.name, n: F.n });
  return true;
}
function nearestMissingPart() {
  const sts = MYTHS.filter(M => mythOpen(M.id) && !M.tale && !M.beast && !M.secret).map(M => ({ M, st: recipeState(M) })).filter(o => !o.st.ready).sort((a, b) => b.st.have / b.M.parts.length - a.st.have / a.M.parts.length);
  if (!sts.length) return -1;
  const o = sts[0]; const k = o.st.cells.findIndex(c => c < 0); return k >= 0 ? o.M.partIx[k] : -1;
}
function endExp(win) {
  normExp();
  const r = G.exp.run; if (!r) return;
  G.exp.run = null; G.exp.cd = CAVE_CD;
  const back = [];
  r.cells.forEach((cell, k) => {
    const u = r.units[k]; if (!u) return;
    if (!G.units[cell]) { G.units[cell] = u; back.push(cell); }
    else { const e = emptyCells(); if (e.length) { const c = pick(e); G.units[c] = u; back.push(c); } else G.coins += TIERS[TYPES[u.t].tier].sell * (u.c || 1); }
  });
  G.auraDirty = true;
  const got = [];
  if (win) {
    const L = destOf().floors, F = L[Math.min(r.floor, L.length) - 1], scale = Math.pow(1.5, Math.max(0, r.floor - L.length)), rw = F.rw;
    if (rw.coins) { const c = Math.round(rw.coins * scale); G.coins += c; got.push(`엽전 +${fmtC(c)}`); }
    if (rw.hon) { G.hon += rw.hon; got.push(`혼 +${rw.hon}`); }
    if (rw.silver) { G.stats.silverBonus += rw.silver; got.push(`은전 +${fmtC(rw.silver)}`); }
    if (rw.unit) { const t = pick(poolOf(rw.unit)); if (addUnit(t) >= 0) got.push(`${TIERS[rw.unit].name} ${TYPES[t].name}`); else { G.coins += 1000; got.push('엽전 +1,000'); } }
    if (rw.part) { const t = nearestMissingPart(); if (t >= 0 && addUnit(t) >= 0) got.push(`신화 재료 ${TYPES[t].name}`); else { G.hon += 3; got.push('혼 +3'); } }
    if (rw.luck) { if (G.up[LUCK] < LUCK_MAX) { G.up[LUCK]++; got.push('소환 운 +1'); } else { G.coins += 800; got.push('엽전 +800'); } }
    if (r.floor >= 6) { const j = Math.min(10, r.floor - 4); G.stats.jade = (G.stats.jade || 0) + j; got.push(`옥 +${j}`); }
    G.exp.floor++; G.exp.wins++; G.stats.caveTop = Math.max(G.stats.caveTop, r.floor);
  }
  emit({ k: 'expEnd', win, cells: back, floor: r.floor, name: r.name, got });
  const D = destOf();
  toast(win ? `${D.label(r.floor)} ${r.name} 격파! ${got.join(' · ')}` : `${D.label(r.floor)}에서 물러났어요. 동료는 무사히 돌아왔어요`);
}
function expTick(dt) {
  if (G.exp.cd > 0) G.exp.cd = Math.max(0, G.exp.cd - dt);
  normExp();
  const r = G.exp.run; if (!r) return;
  r.t -= dt; r.hp -= r.dps * dt;
  if (r.hp <= 0) endExp(true); else if (r.t <= 0) endExp(false);
}
/* recipe helpers */
/* how much a unit is still wanted by this 고을's other recipes: 0 spare, 1 the only copy of a needed part (never taken by an any-slot) */
function wildNeed(t) {
  const id = TYPES[t].id;
  if (!MYTHS.some(M => mythOpen(M.id) && M.parts.includes(id))) return 0;
  let copies = 0; for (const u of G.units) if (u && u.t === t) copies++;
  return copies > 1 ? 0.5 : 1;
}
function recipeState(M) {
  const used = new Set(), cells = M.parts.map(() => -1);
  M.partIx.forEach((pt, k) => {
    if (pt == null) return;
    for (let i = 0; i < NCELL; i++) { const u = G.units[i]; if (u && u.t === pt && !used.has(i)) { cells[k] = i; used.add(i); break; } }
  });
  M.parts.forEach((p, k) => {
    if (!WILD[p]) return;
    /* spare legends first; the only copy of another recipe's part is used last, and the recipe card says so */
    let best = -1, bs = 2;
    for (let i = 0; i < NCELL; i++) { const u = G.units[i]; if (!u || used.has(i) || TYPES[u.t].tier !== WILD[p]) continue; const sc = wildNeed(u.t); if (sc < bs) { bs = sc; best = i; } }
    cells[k] = best; if (best >= 0) used.add(best);
  });
  return { cells, have: cells.filter(c => c >= 0).length, ready: cells.every(c => c >= 0) };
}
function craft(mythId, prefer = -1) {
  if (G.phase !== 'play') return false;
  const M = MYTHS.find(m => m.id === mythId); if (!M) return false;
  if (!mythOpen(M.id)) { toast('아직 잠긴 신화예요. 마당 밖에서 신화 두루마리로 열 수 있어요'); return false; }
  const st = recipeState(M);
  if (!st.ready) { toast('재료가 아직 모자라요'); return false; }
  const freed = st.cells.filter(c => G.units[c].c === 1);
  let target = freed.includes(prefer) ? prefer : freed.length ? freed.reduce((best, c) => (TYPES[G.units[c].t].tier > TYPES[G.units[best].t].tier ? c : best), freed[0]) : -1;
  if (target < 0) { const e = emptyCells(); if (!e.length) { toast('신화를 놓을 빈 칸이 하나 필요해요'); return false; } target = pick(e); }
  const from = st.cells.map(c => ({ cell: c, t: G.units[c].t }));
  for (const c of st.cells) { const u = G.units[c]; u.c--; if (u.c <= 0) G.units[c] = null; }
  place(target, M.ix);
  G.stats.crafts++; G.stats.crafted[M.id] = (G.stats.crafted[M.id] || 0) + 1;
  emit({ k: 'craft', id: M.id, cell: target, from });
  G.sel = target;
  return true;
}

/* ================= combat ================= */
function computeAura() {
  G.auraDirty = false;
  /* 사물놀이패 lifts 일반·희귀, 팔도 의병 lifts 영웅; two of the same kind count, a third does not */
  const cnt = [0, 0, 0, 0], amt = [0, 0, 0, 0];
  for (let i = 0; i < NCELL; i++) { const u = G.units[i], T = u && TYPES[u.t]; if (T && T.gAura) for (const t of T.gAuraT) { cnt[t]++; amt[t] = Math.max(amt[t], T.gAura); } }
  if (!G.gradeMul) G.gradeMul = [1, 1, 1, 1];
  for (let t = 0; t < 4; t++) G.gradeMul[t] = 1 + amt[t] * Math.min(2, cnt[t]);
  let am = 0; for (let i = 0; i < NCELL; i++) { const u = G.units[i]; if (u && TYPES[u.t].allAura) am = Math.max(am, TYPES[u.t].allAura); }
  G.allMul = 1 + am;
  for (let i = 0; i < NCELL; i++) {
    let n = 0, m = 0, r = 0, bo = 0;
    let na = 0, ba = 0;
    for (const j of NEIGH[i]) { const u = G.units[j]; if (!u) continue; const T = TYPES[u.t]; if (T.aura) { n++; na = Math.max(na, T.aura); } if (T.dmgAura) m++; if (T.rngAura) r++; if (T.bossAura) { bo++; ba = Math.max(ba, T.bossAura); } }
    G.spd[i] = 1 + na * Math.min(2, n);
    G.dmgN[i] = 1 + 0.2 * Math.min(2, m);
    if (!G.rngB) G.rngB = Array(NCELL).fill(0);
    G.rngB[i] = 0.5 * Math.min(2, r);
    if (!G.bossN) G.bossN = Array(NCELL).fill(1);
    G.bossN[i] = 1 + ba * Math.min(2, bo);
    let ua = 0; for (const j of NEIGH[i]) { const u = G.units[j]; if (u && TYPES[u.t].ultAura) ua = Math.max(ua, TYPES[u.t].ultAura); }
    if (!G.ultN) G.ultN = Array(NCELL).fill(1);
    G.ultN[i] = 1 + ua;
  }
}
function rngOf(T, i) { return T.range > 50 ? T.range : T.range + ((i >= 0 && G.rngB && G.rngB[i]) || 0); }
function relMul(T) { const r = G.rel; if (!r) return 1; const g = upGroup(T); return (1 + r.atk + (g < 3 && r.gr ? r.gr[g] || 0 : 0)) * (T.tier >= 4 ? 1 + r.myth : 1); }
const upOf = T => G.up[upGroup(T)];
const gradeMulOf = T => (T.tier < 4 && G.gradeMul ? G.gradeMul[T.tier] : 1);
const tierBuffOf = T => { const b = G.tierBuff && G.tierBuff[T.tier]; return b && b.t > 0 ? b.mul : 1; };
function dmgOf(t, i) { const T = TYPES[t]; return (G.allMul || 1) * moneyMul() * (G.mb ? 1 + G.mb[UP_TIER[T.tier]] + G.mb[4] : 1) * (G.sea ? G.sea.dmg : 1) * (G.comboPowT > 0 ? 1.2 : 1) * T.dmg * TIER_MUL[T.tier] * (1 + BAL.upBonus * upOf(T)) * G.lvMul[t] * gradeMulOf(T) * ((i >= 0 && G.dmgN[i]) || 1) * tierBuffOf(T) * relMul(T); }
function topClusters(rad, n) {
  const out = [], used = new Set(), r2 = rad * rad;
  for (let k = 0; k < n; k++) {
    let best = null, bn = 0;
    for (const a of G.foes) { if (a.dead || a.hidden > 0 || used.has(a)) continue; let c = 0; for (const b of G.foes) if (!b.dead && !(b.hidden > 0) && (b.x - a.x) ** 2 + (b.y - a.y) ** 2 < r2) c++; if (c > bn || (c === bn && best && a.d > best.d)) { bn = c; best = a; } }
    if (!best) break;
    out.push({ x: best.x, y: best.y });
    for (const b of G.foes) if ((b.x - best.x) ** 2 + (b.y - best.y) ** 2 < r2 * 2.2) used.add(b);
  }
  return out;
}
function castUlt(u, i, T) {
  const x = cellX(i), y = cellY(i), base = dmgOf(u.t, i), U = ULTS[T.id], live = G.foes.filter(f => !f.dead && !(f.hidden > 0));
  if (!live.length) return false;
  const ev = { k: 'ult', id: T.id, cell: i, x, y, name: U.name };
  switch (T.id) {
    case 'samulpae': for (const f of live) { damage(f, base * 3, T, false); if (!f.dead) stunFoe(f, 1.5); if (G.phase !== 'play') return true; } break;
    case 'bari': {
      const c = topClusters(2.0, 1)[0]; if (!c) return false; ev.tx = c.x; ev.ty = c.y;
      for (const f of inRange(c.x, c.y, 2.0)) { if (!f.big && f.hp < f.max * 0.35) { emit({ k: 'execute', x: f.x, y: f.y }); kill(f, true); } else damage(f, base * 4, T, true); if (G.phase !== 'play') return true; }
      break;
    }
    case 'kkokdusoe':
      for (let k = 0; k < 8; k++) { const a = k * TAU / 8; G.shots.push({ id: G.nextId++, kind: 'plate', boomer: true, ox: x, oy: y, x, y, gy: y, h: 0.5, vx: Math.cos(a), vy: Math.sin(a), s: 0, back: false, max: 4.2, hit: [], src: T, dmg: base * 1.5, crit: false, dead: false }); }
      giveCoin(x, y, BAL.coinUnit * (3 + Math.floor(G.wave / 5)));
      break;
    case 'saja': {
      const cs = topClusters(1.6, 3); if (!cs.length) return false;
      cs.forEach((c, k) => G.pend.push({ t: 0.25 + k * 0.45, x: c.x, y: c.y, dmg: base * 2.5, crit: true, src: T, kind: 'slam' }));
      ev.pts = cs; break;
    }
    case 'daejanggun': for (const f of inRange(x, y, 3.4)) { damage(f, base * 2, T, false); if (!f.dead) { slowFoe(f, 0.7, 4); f.markT = Math.max(f.markT, 4); f.markAmt = Math.max(f.markAmt || 0, 0.3); } if (G.phase !== 'play') return true; } break;
    case 'cheoyong': {
      const tgt = pickTarget(x, y, 9) || live[0]; let dx = tgt.x - x, dy = tgt.y - y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      for (let k = 0; k < 5; k++) { const a = (k - 2) * 0.3, c = Math.cos(a), s2 = Math.sin(a); G.shots.push({ id: G.nextId++, kind: 'wave', straight: true, x, y, gy: y, h: 0.3, vx: dx * c - dy * s2, vy: dx * s2 + dy * c, travel: 0, max: 6, hit: [], src: T, dmg: base, crit: true, dead: false }); }
      ev.dx = dx; ev.dy = dy; break;
    }
    case 'bihyeong': { const list = pickMany(x, y, 9, 12); for (let k = 0; k < 12; k++) { const f = list[k % list.length]; if (f) fireShot('onibi', x, y, f, T, base * 2, false); } break; }
    case 'geobukseon': for (let k = 0; k < 12; k++) { const f = pick(live); G.pend.push({ t: 0.15 + k * 0.11, x: f.x + rand(-0.3, 0.3), y: f.y + rand(-0.2, 0.2), dmg: base * 1.2, crit: false, src: T, kind: 'ultBall' }); } break;
    case 'uibyeongdae': if (!G.tierBuff) G.tierBuff = {}; G.tierBuff[2] = { mul: 1.5, t: 6 }; for (const f of inRange(x, y, 3)) { damage(f, base * 2, T, false); if (G.phase !== 'play') return true; } break;
    case 'choimuseon': {
      const cs = topClusters(1.4, 5); if (!cs.length) return false; ev.pts = cs;
      for (let k = 0; k < 10; k++) { const c = cs[k % cs.length]; G.pend.push({ t: 0.12 + k * 0.1, x: c.x + rand(-0.4, 0.4), y: c.y + rand(-0.3, 0.3), dmg: base * 1.6, crit: false, src: T, kind: 'rocketRain' }); }
      break;
    }
    case 'yeongno': {
      const small = live.filter(f => !f.big).sort((a, b) => b.hp - a.hp).slice(0, 6); ev.pts = small.map(f => ({ x: f.x, y: f.y }));
      for (const f of small) { emit({ k: 'devour', x: f.x, y: f.y }); kill(f, true); G.stats.devour = (G.stats.devour || 0) + 1; if (G.phase !== 'play') return true; }
      for (const f of live) if (f.big && !f.dead) { damage(f, Math.min(f.hp * 0.06, base * 30) + base * 3, T, true); if (G.phase !== 'play') return true; }
      break;
    }
    case 'gangrim':
      for (const f of live) {
        if (f.big) { f.bookT = 8; f.bookAmt = Math.max(f.bookAmt || 0, 0.4); continue; }
        if (f.hp < f.max * 0.3) { emit({ k: 'execute', x: f.x, y: f.y }); kill(f, true); if (G.phase !== 'play') return true; }
      }
      break;
    case 'gimseondal': {
      const c = topClusters(2.0, 1)[0]; if (!c) return false; ev.tx = c.x; ev.ty = c.y;
      for (const f of inRange(c.x, c.y, 2.0)) { damage(f, base * 4, T, true); if (G.phase !== 'play') return true; if (!f.dead) slowFoe(f, 0.4, 2); }
      const coin = Math.min(Math.floor(G.coins * 0.1), 300 + 60 * G.wave); if (coin > 0) giveCoin(x, y - 0.3, coin, true);
      break;
    }
    case 'jangbogo':
      for (let k = 0; k < 8; k++) { const f = pick(live); G.pend.push({ t: 0.15 + k * 0.12, x: f.x + rand(-0.3, 0.3), y: f.y + rand(-0.2, 0.2), dmg: base * 1.5, crit: false, src: T, kind: 'ultBall' }); }
      giveCoin(x, y - 0.4, killCoins(G.wave) * 8, true);
      break;
    case 'honggildong': {
      const list = live.slice().sort((a, b) => (b.boss ? 1e15 : 0) + b.hp - ((a.boss ? 1e15 : 0) + a.hp)).slice(0, 8); ev.pts = [];
      for (let k = 0; k < 8; k++) { const f = list[k % list.length]; if (!f || f.dead) continue; ev.pts.push({ x: f.x, y: f.y }); damage(f, base * 3, T, true); if (G.phase !== 'play') return true; if (f.boss) giveCoin(f.x, f.y, killCoins(G.wave) * 2); }
      break;
    }
    case 'haedal': {
      const tgt = live.reduce((b, f) => (f.boss && !b.boss) || ((!!f.boss === !!b.boss) && f.hp > b.hp) ? f : b, live[0]); ev.tx = tgt.x; ev.ty = tgt.y;
      damage(tgt, base * 15, T, true); if (G.phase !== 'play') return true;
      for (const f of live) if (!f.dead) stunFoe(f, 2);
      break;
    }
    case 'hokburi': {
      const tgt = live.reduce((b, f) => f.hp > b.hp ? f : b, live[0]); ev.tx = tgt.x; ev.ty = tgt.y;
      damage(tgt, Math.min(tgt.hp * (tgt.big ? 0.06 : 0.6), base * 30) + base * 5, T, true); if (G.phase !== 'play') return true;
      G.hon += 1; giveCoin(x, y, BAL.coinUnit * (5 + Math.floor(G.wave / 4)));
      break;
    }
    case 'namukkun': {
      const list = live.slice().sort((a, b) => b.hp - a.hp).slice(0, 6); ev.pts = list.map(f => ({ x: f.x, y: f.y }));
      for (const f of list) { damage(f, base * 4 * (f.boss ? 3 : 1), T, true); if (G.phase !== 'play') return true; }
      giveCoin(x, y, BAL.coinUnit * (4 + Math.floor(G.wave / 5)));
      break;
    }
    case 'cheongryong': {
      ev.pts = [];
      for (let k = 0; k < 12; k++) { const f = pick(live); if (!f || f.dead) continue; ev.pts.push({ x: f.x, y: f.y }); damage(f, base * 3, T, true); if (G.phase !== 'play') return true; }
      for (const f of live) if (!f.dead) slowFoe(f, 0.4, 3);
      break;
    }
    case 'jujak': for (const f of live) { damage(f, base * 2, T, false); if (G.phase !== 'play') return true; if (!f.dead) { const prev = f.burnT > 0 ? f.burnDps : 0; f.burnT = 4; f.burnUid = HIT_UID; f.burnDps = Math.max(prev, base * 0.5); } } break;
    case 'baekho': for (const f of live) { stunFoe(f, 1.5); f.markAmt = f.markT > 0 ? Math.max(f.markAmt || 0, 0.3) : 0.3; f.markT = Math.max(f.markT, 5); } break;
    case 'hyeonmu': for (const f of live) { damage(f, base * 4, T, false); if (G.phase !== 'play') return true; if (!f.dead) knock(f, 1.5); } break;
    case 'yongwang': {
      const c = topClusters(2.2, 1)[0]; if (!c) return false; ev.tx = c.x; ev.ty = c.y;
      for (const f of inRange(c.x, c.y, 2.2)) { damage(f, base * 5 * (f.boss ? 2 : 1), T, true); if (G.phase !== 'play') return true; if (!f.dead) stunFoe(f, f.big ? 1 : 2.5); }
      break;
    }
    case 'hwangryong': for (const f of live) { damage(f, base * 3 * (f.boss ? 2.5 : 1), T, true); if (G.phase !== 'play') return true; } break;
    case 'simcheong': G.lotusT = 6; for (const f of live) slowFoe(f, 0.6, 3); break;
    case 'seolmundae': { const c = topClusters(2.4, 1)[0]; if (!c) return false; ev.tx = c.x; ev.ty = c.y; G.pend.push({ t: 0.8, x: c.x, y: c.y, dmg: base * 6, crit: true, src: T, kind: 'mountain' }); break; }
  }
  emit(ev);
  return true;
}
function unitDmg(u, critBonus) {
  const T = TYPES[u.t];
  let amt = dmgOf(u.t, u.ci == null ? -1 : u.ci);
  const crit = Math.random() < (T.crit || 0.05) + (critBonus || 0) + (G.rel ? G.rel.crit || 0 : 0);
  if (crit) amt *= (T.critMul || 2);
  return { amt, crit };
}
/* ---------- the shared road ----------
   a ghost is the partner's 도깨비 while it walks the road between the two yards, seen from your side.
   your companions can hit it; the hit is sent over and the partner's game applies it */
const tgtList = () => (G.ghosts && G.ghosts.length ? G.foes.concat(G.ghosts) : G.foes);
const ALLY_SRC = [0, 1, 2, 3, 4].map(t => ({ tier: t, id: 'ally', ally: true }));
function syncGhosts(list) {
  if (!(G.ghostMap instanceof Map)) G.ghostMap = new Map();
  const M = G.ghostMap, seen = new Set();
  for (const f of list || []) {
    if (!f || f.dead || f.hidden > 0 || f.y > -HY + 0.55) continue;
    let g = M.get(f.id);
    if (!g) { g = { ghost: true, pid: f.id, id: -1 - f.id, kind: f.kind, d: -1, lane: 0, slowT: 0, slowAmt: 0, stunT: 0, burnT: 0, burnDps: 0, markT: 0, markAmt: 0, curseT: 0, curseAmt: 0, revT: 0, flash: 0, age: 0, hx: 1, hy: 0, wob: 0 }; M.set(f.id, g); }
    g.x = flipX(f.x); g.y = flipY(f.y); g.r = f.r || 0.28; g.big = !!f.big; g.boss = f.boss || null; g.chal = f.chal || null;
    /* keep your own hits on it until the partner's game reports a new health */
    if (g.rep !== f.hp) { g.rep = f.hp; g.hp = f.hp; }
    g.max = f.max; g.dead = g.hp <= 0; seen.add(f.id);
  }
  for (const [id, g] of M) if (!seen.has(id)) { g.dead = true; M.delete(id); }
  G.ghosts = [...M.values()].filter(g => !g.dead);
}
/* hits the partner sent for your 도깨비 */
function applyHits(list) {
  if (!list || !list.length) return;
  const byId = new Map(); for (const f of G.foes) byId.set(f.id, f);
  const keep = HIT_UID; HIT_UID = 0;
  for (const [id, amt, tier] of list) { const f = byId.get(id); if (f && !f.dead) { damage(f, amt, ALLY_SRC[tier | 0] || ALLY_SRC[4], false); if (G.phase !== 'play') break; } }
  HIT_UID = keep;
}
function pickTarget(x, y, range) {
  const r2 = range * range; let best = null, bs = -1;
  for (const f of tgtList()) {
    if (f.dead || f.hidden > 0) continue;
    const dx = f.x - x, dy = f.y - y, rr = range + (f.big ? f.r : 0);
    if (dx * dx + dy * dy > (f.big ? rr * rr : r2)) continue;
    const s = f.boss ? 1e9 + f.d : f.chal ? 5e8 + f.d : f.d;
    if (s > bs) { bs = s; best = f; }
  }
  return best;
}
function inRange(x, y, range) {
  const out = [];
  for (const f of tgtList()) {
    if (f.dead || f.hidden > 0) continue;
    const rr = range + (f.big ? f.r : 0);
    if ((f.x - x) ** 2 + (f.y - y) ** 2 <= rr * rr) out.push(f);
  }
  return out;
}
function pickMany(x, y, range, n) {
  const list = inRange(x, y, range);
  list.sort((a, b) => ((b.boss ? 1e9 : b.chal ? 5e8 : 0) + b.d) - ((a.boss ? 1e9 : a.chal ? 5e8 : 0) + a.d));
  return list.slice(0, n);
}
function pickCluster(rad) {
  if (G.boss && !G.boss.dead && !(G.boss.hidden > 0)) return G.boss;
  let best = null, bn = -1; const r2 = rad * rad, F = G.foes;
  for (let i = 0; i < F.length; i++) {
    const a = F[i]; if (a.dead || a.hidden > 0) continue;
    let n = 0;
    for (let j = 0; j < F.length; j++) { const b = F[j]; if (!b.dead && !(b.hidden > 0) && (b.x - a.x) ** 2 + (b.y - a.y) ** 2 < r2) n++; }
    if (n > bn || (n === bn && a.d > best.d)) { bn = n; best = a; }
  }
  return best;
}
const DOT = { tier: 2, dot: true };
function damage(f, amt, src, crit) {
  if (f.dead || f.hidden > 0) return 0;
  if (f.ghost) {
    if (!(amt > 0)) return 0;
    if (G.outHits) G.outHits.push([f.pid, Math.round(amt), src && src.tier != null ? Math.min(4, src.tier) : 4]);
    f.hp -= amt; f.flash = 0.09; if (f.hp <= 0) { f.dead = true; G.stats.assists = (G.stats.assists || 0) + 1; }
    if (!src.dot && (crit || src.tier >= 4)) emit({ k: 'num', x: f.x, y: f.y, v: amt, crit: !!crit, res: false, boss: !!f.big });
    return amt;
  }
  if (f.markT > 0) amt *= 1 + f.markAmt;
  if (f.curseT > 0) amt *= 1 + f.curseAmt;
  if (f.bookT > 0) amt *= 1 + f.bookAmt;
  if (f.boss && G.rel && G.rel.boss) amt *= 1 + G.rel.boss;
  if ((f.boss || f.chal) && HIT_UID && G.bossN) { const c = UID_CELL[HIT_UID]; if (c != null && G.bossN[c] > 1) amt *= G.bossN[c]; }
  const res = (f.boss === 'bulgasari' || f.armor) && src.tier <= 1;
  if (res) amt *= 0.5;
  if (f.boss && COOP.on) COOP.bossDmg += Math.min(amt, Math.max(0, f.hp));
  /* balance bots only: who did the damage */
  if (G.tally && HIT_UID) { const c = UID_CELL[HIT_UID], u = c != null && G.units[c]; if (u) { const k = TYPES[u.t].id; G.tally[k] = (G.tally[k] || 0) + Math.min(amt, Math.max(0, f.hp)); } }
  f.hp -= amt; f.flash = 0.09;
  if (!src.dot && (crit || src.tier >= 4 || f.big)) emit({ k: 'num', x: f.x, y: f.y, v: amt, crit: !!crit, res, boss: !!f.big });
  if (f.hp <= 0) kill(f);
  return amt;
}
function kill(f, final) {
  if (f.dead) return;
  if (f.ghost) { damage(f, Math.max(1, f.hp) * 1.2 + 1, ALLY_SRC[4], false); return; }
  if (f.rev && !final && !(f.curseT > 0)) { f.rev = 0; f.hp = f.max * 0.5; f.stunT = Math.max(f.stunT, 1.0); f.down = 1.0; emit({ k: 'revive', x: f.x, y: f.y }); return; }
  f.dead = true; G.stats.kills++; G.coins += f.reward;
  if (HIT_UID) {
    if (!G.killBy) G.killBy = {}; G.killBy[HIT_UID] = (G.killBy[HIT_UID] || 0) + 1;
    const ku = G.units.find(u => u && u.id === HIT_UID);
    if (ku && TYPES[ku.t].killCoin && !f.mini) { const c = TYPES[ku.t].killCoin * (1 + Math.floor(G.wave / 10)); G.coins += c; G.stats.income = (G.stats.income || 0) + c; earnFor(ku.id, c); emit({ k: 'coin', x: f.x, y: f.y, v: c }); }
  }
  emit({ k: 'kill', x: f.x, y: f.y, boss: f.boss, kind: f.kind, reward: f.reward, chal: f.chal, mini: f.mini });
  if (f.split && !(f.curseT > 0)) for (let k = 0; k < 2; k++) G.addQ.push(newFoe(7, f.max * 0.3, f.speed * 1.15, 0.22, { d: Math.max(0, f.d + (k ? 0.18 : -0.12)), lane: clamp(f.lane + (k ? 0.12 : -0.12), -0.25, 0.25), reward: 0, mini: true, stunT: 0.3 }));
  if (f.chal) {
    const C = CHALS.find(c => c.id === f.chal), ci = CHALS.indexOf(C), coins = C.coins;
    G.coins += coins; G.hon += C.hon; G.stats.chalWins++; G.stats.silverBonus += C.silver;
    if (ci >= 2) G.stats.chalHard++;
    G.stats.chalTop = Math.max(G.stats.chalTop, ci + 1);
    if (C.jade) G.stats.jade = (G.stats.jade || 0) + C.jade;
    if (C.unit) { const t = pick(poolOf(C.unit)); if (addUnit(t) >= 0) setTimeout(() => toast(`${TIERS[C.unit].name} ${TYPES[t].name} 합류!`), 1600); else G.coins += 1500; }
    emit({ k: 'chalWin', id: C.id, x: f.x, y: f.y, coins, hon: C.hon, silver: C.silver });
    toast(`${josa(C.name, '을', '를')} 잡았어요! 엽전 +${fmtC(coins)}${C.hon ? ` · 혼 +${C.hon}` : ''}${C.silver ? ` · 은전 +${fmtC(C.silver)}` : ''}`);
  }
  if (f.boss) {
    const bh = (3 + (G.sea ? G.sea.bossHon : 0)) * (G.sea ? G.sea.honMul : 1);
    G.hon += bh; G.boss = null; G.stats.bossKills++;
    if (G.wave >= LAST_WAVE) { endGame('win'); return; }
    emit({ k: 'banner', main: `${josa(f.name, '을', '를')} 물리쳤다!`, sub: `엽전 +${fmtC(f.reward)} · 혼 +${bh}` });
    G.waveT = Math.min(G.waveT, 3);
  }
}
function slowFoe(f, amt, dur) { if (f.big) amt *= 0.5; f.slowAmt = f.slowT > 0 ? Math.max(f.slowAmt, amt) : amt; f.slowT = Math.max(f.slowT, dur); }
function stunFoe(f, dur) { if (f.big) dur *= 0.25; f.stunT = Math.max(f.stunT, dur); }
/* how fast a 도깨비 walks right now, for the partner's picture of it */
function foeSpeedNow(f) { let v = f.speed; if (f.slowT > 0) v *= 1 - f.slowAmt; if (f.revT > 0) v = -0.6 * Math.abs(v); if (f.stunT > 0) v = 0; if (f.hidden > 0) v *= 1.6; return v; }
function knock(f, d) { if (f.dead) return; f.d = Math.max(0, f.d - (f.big ? d * 0.25 : d)); placeFoe(f); }
/* coins a companion earns are counted for it, like kills, so its card can say how much it brought in */
function earnFor(uid, c) { if (!uid) return; if (!G.earnBy) G.earnBy = {}; G.earnBy[uid] = (G.earnBy[uid] || 0) + c; }
function giveCoin(x, y, c, big) { G.coins += c; earnFor(HIT_UID, c); emit({ k: 'coin', x, y, v: c, big: !!big }); }

const SHOT_SPD = { sunray: 9, gaxe: 9, mask: 9, waterorb: 8, pearl: 9, stone: 11, gust: 8, yarn: 8, bird: 7.5, petal: 8.5, cleaver: 8, coin: 10, ink: 9, bolt: 14, onibi: 7, arrow: 15, rocket: 10, sogo: 9, sunfire: 8, ball: 7 };
const SHOT_ARC = { stone: 0.35, gust: 0.1, yarn: 0.5, bird: 0.25, petal: 0.2, cleaver: 0.6, coin: 0.55, ink: 0.4, bolt: 0.08, onibi: 0.3, arrow: 0.12, rocket: 0.4, sogo: 0.45, sunfire: 0.3, ball: 0.9 };
function fireShot(kind, x, y, f, src, dmg, crit) {
  const d0 = Math.max(0.3, Math.hypot(f.x - x, f.y - y));
  G.shots.push({ id: G.nextId++, kind, x, y: y - 0.55, gy: y, h: 0.55, z: 0, d0, f, src, dmg, crit, prog: 0, vx: 0, vy: 1, dead: false });
}
function attack(u, i, T, tgt) {
  const x = cellX(i), y = cellY(i), src = T;
  const { amt, crit } = unitDmg(u);
  const RG = rngOf(T, i);
  switch (T.kind) {
    case 'shot': fireShot(T.shot, x, y, tgt, src, amt, crit); break;
    case 'chain': {
      const pts = [{ x, y: y - 0.5 }], seen = new Set();
      let cur = tgt;
      for (let k = 0; k < T.chain && cur; k++) {
        pts.push({ x: cur.x, y: cur.y - 0.25 }); seen.add(cur);
        const cx = cur.x, cy = cur.y;
        if (T.execute && !cur.big && cur.hp < cur.max * T.execute) { emit({ k: 'execute', x: cx, y: cy }); kill(cur, true); }
        else { damage(cur, amt * Math.pow(0.88, k) * (cur.boss && T.bossMul ? T.bossMul : 1), src, crit && k === 0); if (T.book && cur.big && !cur.dead) { cur.bookT = Math.max(cur.bookT || 0, 3); cur.bookAmt = Math.max(cur.bookT > 3 ? cur.bookAmt || 0 : 0, T.book); } }
        let next = null, nd = 1.8 * 1.8;
        for (const o of G.foes) { if (o.dead || seen.has(o)) continue; const d2 = (o.x - cx) ** 2 + (o.y - cy) ** 2; if (d2 < nd) { nd = d2; next = o; } }
        cur = next;
      }
      emit({ k: 'chain', id: T.id, pts });
      break;
    }
    case 'thump': {
      const tx = tgt.x, ty = tgt.y;
      const stun = T.stunT && (!T.stunP || Math.random() < T.stunP);
      for (const f of inRange(tx, ty, T.aoe)) { damage(f, amt, src, crit && f === tgt); if (T.slow && !f.dead) slowFoe(f, T.slow, T.slowT); if (stun && !f.dead) stunFoe(f, T.stunT); }
      emit({ k: 'thump', id: T.id, x: tx, y: ty, r: T.aoe, stun, x0: x, y0: y });
      break;
    }
    case 'double': {
      damage(tgt, amt, src, crit);
      G.pend.push({ t: 0.16, f: tgt, dmg: amt, src, kind: 'hit2' });
      emit({ k: 'tap', x: tgt.x, y: tgt.y, n: 1 });
      break;
    }
    case 'pulse': {
      const list = inRange(x, y, RG);
      for (const f of list) {
        let a = amt;
        if (T.pct) a += Math.min(f.max * (f.big ? T.pct * 0.2 : T.pct), amt * 3);
        damage(f, a, src, crit);
        if (T.slow && !f.dead) slowFoe(f, T.slow, T.slowT);
        if (T.mark && !f.dead) { if (!(f.markT > 0)) f.markAmt = 0; f.markT = Math.max(f.markT, T.markT); f.markAmt = Math.max(f.markAmt, T.mark); }
        if (T.stunT && !f.dead) stunFoe(f, T.stunT);
      }
      emit({ k: 'pulse', id: T.id, x, y, r: RG });
      break;
    }
    case 'beat': {
      const big = u.n % 4 === 0;
      for (const f of inRange(x, y, RG)) { damage(f, big ? amt * 2.5 : amt, src, crit); if (big && !f.dead) stunFoe(f, 0.5); }
      emit({ k: 'beat', id: T.id, x, y, r: RG, big });
      break;
    }
    case 'beam': {
      let dx = tgt.x - x, dy = tgt.y - y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const len = RG + (T.beamW ? 0.3 : 0.6), bw = T.beamW || 0.36;
      for (const f of tgtList()) {
        if (f.dead || f.hidden > 0) continue;
        const px = f.x - x, py = f.y - y, t = px * dx + py * dy;
        if (t < 0 || t > len) continue;
        if (Math.abs(px * dy - py * dx) < bw + (f.big ? f.r : 0)) damage(f, amt, src, crit);
      }
      emit({ k: 'beam', id: T.id, x0: x, y0: y, x1: x + dx * len, y1: y + dy * len });
      break;
    }
    case 'curse': {
      for (const f of inRange(tgt.x, tgt.y, T.aoe)) { damage(f, amt, src, crit && f === tgt); if (!f.dead) { f.curseT = Math.max(f.curseT || 0, T.curseT); f.curseAmt = Math.max(f.curseAmt || 0, T.curse); } }
      emit({ k: 'curse', x: tgt.x, y: tgt.y, r: T.aoe, x0: x, y0: y });
      break;
    }
    case 'clone': {
      const list = pickMany(x, y, RG, T.clones); if (!list.length) list.push(tgt);
      const pts = [];
      for (let k = 0; k < T.clones; k++) {
        const f = list[k % list.length]; if (f.dead) continue;
        const r = k === 0 ? { amt, crit } : unitDmg(u);
        pts.push({ x: f.x, y: f.y });
        if (T.coinP && !f.big && !f.mini && Math.random() < T.coinP) giveCoin(f.x, f.y, killCoins(G.wave));
        if (T.steal && f.boss && Math.random() < T.steal) { giveCoin(f.x, f.y, killCoins(G.wave) * 2); emit({ k: 'steal', x: f.x, y: f.y }); }
        damage(f, r.amt, src, r.crit);
        if (G.phase !== 'play') return;
      }
      emit({ k: 'clone', x0: x, y0: y, pts });
      break;
    }
    case 'whip': {
      damage(tgt, amt, src, crit);
      tgt.markT = 3; tgt.markAmt = T.mark;
      emit({ k: 'whip', x0: x, y0: y, x1: tgt.x, y1: tgt.y });
      break;
    }
    case 'cone': {
      let dx = tgt.x - x, dy = tgt.y - y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const cosC = Math.cos(T.cone), R = RG + 0.3;
      for (const f of tgtList()) {
        if (f.dead || f.hidden > 0) continue;
        const px = f.x - x, py = f.y - y, d = Math.hypot(px, py);
        if (d > R + (f.big ? f.r : 0)) continue;
        if (d > 0.01 && (px * dx + py * dy) / d < cosC && f !== tgt) continue;
        damage(f, amt, src, crit);
        if (T.burn && !f.dead) { const prev = f.burnT > 0 ? f.burnDps : 0; f.burnT = 3; f.burnUid = HIT_UID; f.burnDps = Math.max(prev, amt * T.burn); }
        if (T.kb && !f.dead) knock(f, T.kb);
      }
      emit({ k: 'cone', id: T.id, x0: x, y0: y, dx, dy, len: R, w: T.cone });
      break;
    }
    case 'devour': {
      if (u.n % T.devour === 0) {
        if (!tgt.big) { emit({ k: 'devour', x: tgt.x, y: tgt.y }); kill(tgt, true); G.stats.devour = (G.stats.devour || 0) + 1; }
        else { damage(tgt, T.bite ? Math.max(amt * 2, Math.min(tgt.hp * T.bite, amt * 12)) : amt * 2, src, true); emit({ k: 'bite', x: tgt.x, y: tgt.y, big: 1 }); }
      } else { damage(tgt, amt, src, crit); emit({ k: 'bite', x: tgt.x, y: tgt.y, big: 0 }); }
      break;
    }
    case 'bolts': {
      const list = pickMany(x, y, RG, T.bolts);
      for (let k = 0; k < T.bolts; k++) { const f = list[k % list.length] || tgt, r = unitDmg(u); fireShot(T.shot || 'bolt', x, y, f, src, r.amt, r.crit); }
      if (T.shot === 'rocket') emit({ k: 'rockets', x, y });
      break;
    }
    case 'pounce': {
      u.busy = 1.0;
      G.pend.push({ t: 0.42, x: tgt.x, y: tgt.y, dmg: amt * (u.c || 1), crit, src, kind: 'slam' });
      emit({ k: 'leap', uid: u.id, cell: i, x: tgt.x, y: tgt.y });
      break;
    }
    case 'wave': {
      let dx = tgt.x - x, dy = tgt.y - y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      G.shots.push({ id: G.nextId++, kind: T.shot || 'wave', straight: true, x, y, gy: y, h: 0.3, vx: dx, vy: dy, travel: 0, max: RG + 0.8, hit: [], src, dmg: amt, crit, dead: false });
      emit({ k: 'waveFx', x, y, dx, dy, id: T.id });
      break;
    }
    case 'homing': {
      const list = pickMany(x, y, RG, T.orbs);
      for (let k = 0; k < T.orbs; k++) { const f = list[k % list.length] || tgt, r = unitDmg(u); fireShot(T.shot || 'onibi', x, y, f, src, r.amt, r.crit); }
      break;
    }
    case 'axes': {
      fireShot('gaxe', x, y, tgt, src, amt, crit);
      if (u.n % 2 === 0) {
        let dx = tgt.x - x, dy = tgt.y - y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        G.shots.push({ id: G.nextId++, kind: 'saxe', straight: true, x, y, gy: y, h: 0.45, vx: dx, vy: dy, travel: 0, max: RG + 0.8, hit: [], src: Object.assign({}, src, { bossMul: 0 }), dmg: amt * 0.8, crit: false, dead: false, spd: 9, rr: 0.42 });
      }
      emit({ k: 'axeThrow', x, y, dir: tgt.x < x ? -1 : 1 });
      break;
    }
    case 'volley': {
      let dx = tgt.x - x, dy = tgt.y - y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
      const n = T.arrows;
      for (let k = 0; k < n; k++) {
        const a = (k - (n - 1) / 2) * T.spread / (n - 1), c = Math.cos(a), s = Math.sin(a);
        G.shots.push({ id: G.nextId++, kind: 'arrowP', straight: true, x, y, gy: y, h: 0.5, vx: dx * c - dy * s, vy: dx * s + dy * c, travel: 0, max: RG + 0.5, hit: [], src, dmg: amt, crit, dead: false, spd: 10, rr: 0.28 });
      }
      emit({ k: 'volley', x, y, dx, dy });
      break;
    }
    case 'cannon': {
      if (T.breath && u.n % T.breath === 0) {
        let dx = tgt.x - x, dy = tgt.y - y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        const cosC = Math.cos(T.cone), Rr = RG;
        for (const f of tgtList()) {
          if (f.dead || f.hidden > 0) continue;
          const px = f.x - x, py = f.y - y, d = Math.hypot(px, py);
          if (d > Rr + (f.big ? f.r : 0)) continue;
          if (d > 0.01 && (px * dx + py * dy) / d < cosC && f !== tgt) continue;
          damage(f, amt * 0.6, src, false);
          if (!f.dead) { const prev = f.burnT > 0 ? f.burnDps : 0; f.burnT = 3; f.burnUid = HIT_UID; f.burnDps = Math.max(prev, amt * T.burn); }
        }
        emit({ k: 'cone', id: T.id, x0: x, y0: y, dx, dy, len: Rr, w: T.cone });
      }
      fireShot('ball', x, y, tgt, src, amt, crit);
      emit({ k: 'cannonFire', x, y, dir: tgt.x < x ? -1 : 1 });
      break;
    }
    case 'fire': {
      G.pend.push({ t: 0.5, x: tgt.x, y: tgt.y, dmg: amt, crit, src, kind: 'fire' });
      emit({ k: 'fireCall', cell: i, x: tgt.x, y: tgt.y });
      break;
    }
    case 'drop': {
      G.pend.push({ t: 0.55, x: tgt.x, y: tgt.y, dmg: amt, crit, src, kind: 'drop' });
      emit({ k: 'dropFx', x: tgt.x, y: tgt.y, cell: i, t: 0.55 });
      break;
    }
    case 'boomerang': {
      const list = pickMany(x, y, RG, T.plates);
      for (let k = 0; k < T.plates; k++) {
        const f = list[k % list.length] || tgt;
        let dx = f.x - x, dy = f.y - y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        const ang = (k - (T.plates - 1) / 2) * 0.25, c = Math.cos(ang), s = Math.sin(ang);
        G.shots.push({ id: G.nextId++, kind: 'plate', boomer: true, ox: x, oy: y, x, y, gy: y, h: 0.5, vx: dx * c - dy * s, vy: dx * s + dy * c, s: 0, back: false, max: RG + 0.4, hit: [], src, dmg: amt, crit, dead: false });
      }
      break;
    }
  }
}
/* 불바다: burning ground that hurts every 도깨비 standing in it */
function addField(x, y, r, t, dps) {
  if (!G.fields) G.fields = [];
  if (G.fields.length >= 14) G.fields.shift();
  G.fields.push({ x, y, r, t, max: t, dps, uid: HIT_UID });
}
function fieldTick(dt) {
  if (!G.fields || !G.fields.length) return;
  for (const F of G.fields) {
    F.t -= dt; if (F.t <= 0) continue;
    HIT_UID = F.uid || 0;
    for (const f of inRange(F.x, F.y, F.r)) { damage(f, F.dps * dt, DOT); if (G.phase !== 'play') { HIT_UID = 0; return; } }
    HIT_UID = 0;
  }
  G.fields = G.fields.filter(F => F.t > 0);
}
function resolvePend(p) {
  if (p.kind === 'rocketRain') {
    for (const f of inRange(p.x, p.y, 0.8)) { damage(f, p.dmg, p.src, false); if (G.phase !== 'play') return; }
    emit({ k: 'boom', x: p.x, y: p.y, r: 0.8 }); addField(p.x, p.y, 0.8, 3.5, p.dmg * 0.3);
    return;
  }
  if (p.kind === 'hit2') { if (!p.f.dead) { damage(p.f, p.dmg, p.src, false); emit({ k: 'tap', x: p.f.x, y: p.f.y, n: 2 }); } return; }
  const T = p.src;
  if (p.kind === 'ultBall' || p.kind === 'mountain') {
    const big = p.kind === 'mountain', r = big ? 2.4 : 1.0;
    for (const f of inRange(p.x, p.y, r)) { damage(f, p.dmg, T, big); if (!f.dead) stunFoe(f, big ? 1.0 : 0.3); if (G.phase !== 'play') return; }
    emit(big ? { k: 'quake', id: T.id, x: p.x, y: p.y, r, big: true } : { k: 'boom', x: p.x, y: p.y, r });
    return;
  }
  if (p.kind === 'fire') {
    for (const f of inRange(p.x, p.y, T.aoe)) { damage(f, p.dmg, T, p.crit); if (G.phase !== 'play') return; if (!f.dead) { const prev = f.burnT > 0 ? f.burnDps : 0; f.burnT = 3; f.burnUid = HIT_UID; f.burnDps = Math.max(prev, p.dmg * T.burn); } }
    emit({ k: 'fireLand', x: p.x, y: p.y, r: T.aoe });
    return;
  }
  if (p.kind === 'drop') {
    for (const f of inRange(p.x, p.y, T.aoe)) { damage(f, p.dmg, T, p.crit); if (!f.dead) slowFoe(f, T.slow, T.slowT); if (G.phase !== 'play') return; }
    emit({ k: 'quake', id: T.id, x: p.x, y: p.y, r: T.aoe });
    return;
  }
  for (const f of inRange(p.x, p.y, T.aoe)) {
    damage(f, p.dmg * (f.boss && T.bossMul ? T.bossMul : 1), T, p.crit);
    if (!f.dead) stunFoe(f, T.stunT);
    if (T.mark && !f.dead) { f.markAmt = f.markT > 0 ? Math.max(f.markAmt || 0, T.mark) : T.mark; f.markT = Math.max(f.markT, T.markT || 2); }
    if (G.phase !== 'play') return;
  }
  emit({ k: 'slam', id: T.id, x: p.x, y: p.y, r: T.aoe });
}
function hit(s) {
  const f = s.f, T = s.src;
  switch (s.kind) {
    case 'gust': damage(f, s.dmg, T, s.crit); if (!f.dead) { knock(f, T.kb); stunFoe(f, 0.15); } break;
    case 'yarn': slowFoe(f, T.slow, T.slowT); damage(f, s.dmg, T, s.crit); break;
    case 'petal': if (Math.random() < T.stunP) { stunFoe(f, T.stunT); emit({ k: 'charm', x: f.x, y: f.y }); } damage(f, s.dmg, T, s.crit); break;
    case 'cleaver': {
      const fx = f.x, fy = f.y;
      damage(f, s.dmg, T, s.crit);
      for (const o of inRange(fx, fy, T.splash)) if (o !== f) damage(o, s.dmg * 0.5, T, false);
      break;
    }
    case 'coin': damage(f, s.dmg, T, s.crit); if (Math.random() < T.coinP) giveCoin(f.x, f.y, BAL.coinUnit * (1 + Math.floor(G.wave / 8))); break;
    case 'mask': { const fx = f.x, fy = f.y; for (const o of inRange(fx, fy, T.splash)) { damage(o, o === f ? s.dmg : s.dmg * 0.5, T, s.crit && o === f); if (!o.dead) { o.markAmt = o.markT > 0 ? Math.max(o.markAmt || 0, T.mark) : T.mark; o.markT = Math.max(o.markT, T.markT); } } break; }
    case 'waterorb': damage(f, s.dmg, T, s.crit); if (!f.dead) slowFoe(f, T.slow, T.slowT); break;
    case 'pearl': damage(f, s.dmg * (f.boss ? T.bossMul : 1), T, s.crit || !!f.boss); break;
    case 'gaxe': { const fx = f.x, fy = f.y; damage(f, s.dmg * (f.boss ? T.bossMul : 1), T, s.crit || !!f.boss); for (const o of inRange(fx, fy, T.splash)) if (o !== f) damage(o, s.dmg * 0.5, T, false); break; }
    case 'rocket': {
      const fx = f.x, fy = f.y, sr = T.splash || 0.45; damage(f, s.dmg, T, s.crit);
      for (const o of inRange(fx, fy, sr)) { if (o !== f) damage(o, s.dmg * 0.4, T, false); if (G.phase !== 'play') return; }
      /* 최무선's 주화 burst into flame where they land */
      if (T.burn) { for (const o of inRange(fx, fy, sr)) if (!o.dead) { const prev = o.burnT > 0 ? o.burnDps : 0; o.burnT = 3; o.burnUid = HIT_UID; o.burnDps = Math.max(prev, s.dmg * T.burn); } emit({ k: 'boom', x: fx, y: fy, r: sr }); }
      if (T.field) addField(fx, fy, sr, 3, s.dmg * T.field);
      break;
    }
    case 'sunfire': damage(f, s.dmg, T, s.crit); if (!f.dead) { const prev = f.burnT > 0 ? f.burnDps : 0; f.burnT = 3; f.burnUid = HIT_UID; f.burnDps = Math.max(prev, s.dmg * T.burn); } break;
    case 'ball': { const fx = f.x, fy = f.y; for (const o of inRange(fx, fy, T.aoe)) { damage(o, s.dmg, T, s.crit && o === f); if (!o.dead) stunFoe(o, T.stunT); if (G.phase !== 'play') return; } emit({ k: 'boom', x: fx, y: fy, r: T.aoe }); break; }
    default: damage(f, s.dmg, T, s.crit);
  }
  emit({ k: 'hit', kind: s.kind, x: s.x, y: s.gy, crit: s.crit, boss: !!f.big });
}
function shotTick(s, dt) {
  if (s.straight) {
    const step = (s.spd || 6.5) * dt;
    s.x += s.vx * step; s.y += s.vy * step; s.gy = s.y; s.travel += step;
    for (const f of tgtList()) {
      if (f.dead || f.hidden > 0 || s.hit.includes(f.id)) continue;
      const rr = (s.rr || 0.5) + (f.big ? f.r : 0);
      if ((f.x - s.x) ** 2 + (f.y - s.y) ** 2 < rr * rr) {
        s.hit.push(f.id);
        const bm = f.boss && s.src.bossMul ? s.src.bossMul : 1;
        damage(f, s.dmg * bm, s.src, s.crit || bm > 1);
        if (s.src.slow && !f.dead) slowFoe(f, s.src.slow, s.src.slowT);
        if (s.src.kb && s.kind !== 'gust' && !f.dead) knock(f, s.src.kb);
        emit({ k: 'hit', kind: s.kind, x: f.x, y: f.y, crit: bm > 1, boss: !!f.boss });
        if (G.phase !== 'play') return;
      }
    }
    if (s.travel >= s.max) s.dead = true;
    return;
  }
  if (s.boomer) {
    const step = 6.5 * dt;
    if (!s.back) { s.s += step; if (s.s >= s.max) { s.back = true; s.hit = []; } }
    else { s.s -= step * 1.15; if (s.s <= 0) { s.dead = true; return; } }
    s.x = s.ox + s.vx * s.s; s.y = s.oy + s.vy * s.s; s.gy = s.y;
    for (const f of tgtList()) {
      if (f.dead || f.hidden > 0 || s.hit.includes(f.id)) continue;
      const rr = 0.42 + (f.big ? f.r : 0);
      if ((f.x - s.x) ** 2 + (f.y - s.y) ** 2 < rr * rr) {
        s.hit.push(f.id);
        damage(f, s.dmg, s.src, s.crit);
        if (Math.random() < s.src.coinP) giveCoin(f.x, f.y, BAL.coinUnit * (1 + Math.floor(G.wave / 10)));
        emit({ k: 'hit', kind: 'plate', x: f.x, y: f.y, crit: s.crit, boss: !!f.boss });
        if (G.phase !== 'play') return;
      }
    }
    return;
  }
  const f = s.f;
  if (f.dead || f.hidden > 0) { s.dead = true; return; }
  const spd = SHOT_SPD[s.kind], dx = f.x - s.x, dy = f.y - s.gy, dist = Math.hypot(dx, dy), step = spd * dt;
  if (dist <= step + 0.1 + (f.big ? f.r * 0.6 : 0)) { s.dead = true; s.x = f.x; s.gy = f.y; hit(s); return; }
  s.vx = dx / dist; s.vy = dy / dist;
  s.x += s.vx * step; s.gy += s.vy * step;
  s.prog = Math.min(1, s.prog + step / s.d0);
  s.h = lerp(0.55, f.big ? 0.5 : 0.3, s.prog) + SHOT_ARC[s.kind] * Math.sin(s.prog * PI);
  s.y = s.gy - s.h;
}
function bossTick(dt) {
  const b = G.boss; if (!b || b.dead) return;
  b.skT -= dt;
  if (b.boss === 'beom' && b.skT <= 0) {
    b.skT = 7;
    const occ = []; G.units.forEach((u, i) => { if (u) occ.push(i); });
    const cells = [];
    for (let k = 0; k < 3 && occ.length; k++) { const j = Math.floor(Math.random() * occ.length); cells.push(occ.splice(j, 1)[0]); }
    cells.forEach(i => { G.units[i].sil = 2.5; });
    emit({ k: 'howl', x: b.x, y: b.y, cells });
  } else if (b.boss === 'gumiho' && b.skT <= 0) {
    b.skT = 5;
    const x0 = b.x, y0 = b.y; b.d += 2.8; placeFoe(b);
    emit({ k: 'blink', x0, y0, x1: b.x, y1: b.y });
  } else if (b.boss === 'imugi') {
    if (!(b.curseT > 0)) b.hp = Math.min(b.max, b.hp + b.max * 0.009 * dt);
    if (!b.rage && b.hp < b.max * 0.4) { b.rage = true; b.speed *= 1.6; emit({ k: 'rage', x: b.x, y: b.y }); }
  } else if (b.boss === 'geumdwaeji') {
    if (b.hidden > 0) { b.hidden -= dt; if (b.hidden <= 0) { b.hidden = 0; emit({ k: 'emerge', x: b.x, y: b.y }); } }
    else if (b.skT <= 0) { b.skT = 8; b.hidden = 2.2; emit({ k: 'burrow', x: b.x, y: b.y }); }
  } else if (b.boss === 'daejeok' && b.skT <= 0) {
    b.skT = 5;
    const near = G.foes.filter(f => !f.dead && !f.big && (f.x - b.x) ** 2 + (f.y - b.y) ** 2 < 1.7 * 1.7).slice(0, 4);
    for (const f of near) { f.dead = true; b.hp = Math.min(b.max, b.hp + b.max * 0.02); }
    emit({ k: 'gulp', x: b.x, y: b.y, n: near.length, pts: near.map(f => ({ x: f.x, y: f.y })) });
  } else if (b.boss === 'heukryong' && b.skT <= 0) {
    b.skT = 7;
    const cols = [0, 0, 0, 0, 0]; G.units.forEach((u, i) => { if (u) cols[i % COLS]++; });
    let col = 0; for (let c = 1; c < COLS; c++) if (cols[c] > cols[col] || (cols[c] === cols[col] && Math.random() < 0.4)) col = c;
    const cells = []; for (let r = 0; r < ROWS; r++) { const i = r * COLS + col; if (G.units[i]) { G.units[i].sil = 2.0; cells.push(i); } }
    emit({ k: 'cloud', col, cells, x: b.x, y: b.y });
  } else if (b.boss === 'yeomra') {
    if (b.skT <= 0) {
      b.skT = 8;
      for (let k = 0; k < 4; k++) { const f = newFoe(7, hpAt(G.wave) * 0.4, 1.05, 0.24, { d: Math.max(0, b.d - 0.3 - k * 0.25), lane: rand(-0.18, 0.18), reward: 0, mini: true }); placeFoe(f); G.foes.push(f); }
      emit({ k: 'summonGhosts', x: b.x, y: b.y });
    }
    b.skT2 -= dt;
    if (b.skT2 <= 0) {
      b.skT2 = 7;
      let best = -1, bs = -1; G.units.forEach((u, i) => { if (!u || u.sil > 0) return; const sc = TYPES[u.t].tier * 1000 + TYPES[u.t].dmg; if (sc > bs) { bs = sc; best = i; } });
      if (best >= 0) { G.units[best].sil = 2.5; emit({ k: 'judge', cell: best, x: b.x, y: b.y }); }
    }
  }
}
/* 해님달님: the sun burns every 도깨비 on the yard, the moon slows them and makes them take more */
function taleSky(u, i, T, dt) {
  u.sky = (u.sky == null ? T.dayNight : u.sky) - dt;
  if (u.sky <= 0) { u.sky = T.dayNight; u.moon = !u.moon; emit({ k: 'sky', cell: i, moon: !!u.moon }); }
  G.sky = u.moon ? 'moon' : 'sun'; G.skyT = 0.4;
  u.skyTick = (u.skyTick || 0) - dt; if (u.skyTick > 0) return;
  u.skyTick = 0.5;
  const base = dmgOf(u.t, i);
  for (const f of G.foes) {
    if (f.dead || f.hidden > 0) continue;
    if (u.moon) { slowFoe(f, 0.35, 0.9); f.markAmt = f.markT > 0 ? Math.max(f.markAmt || 0, 0.25) : 0.25; f.markT = Math.max(f.markT, 0.9); }
    else { const prev = f.burnT > 0 ? f.burnDps : 0; f.burnT = Math.max(f.burnT, 1.0); f.burnUid = HIT_UID; f.burnDps = Math.max(prev, base * 0.5); }
  }
}
function unitTick(u, i, dt) {
  if (u.busy > 0) u.busy -= dt;
  if (u.sil > 0) { u.sil -= dt; return; }
  const T = TYPES[u.t];
  if (T.income) {
    u.inc = (u.inc == null ? T.incCd * (0.5 + Math.random() * 0.5) : u.inc) - dt;
    if (u.inc <= 0) { u.inc += T.incCd; giveCoin(cellX(i), cellY(i) - 0.2, T.income * (u.c || 1), true); G.stats.income = (G.stats.income || 0) + T.income * (u.c || 1); }
  }
  if (T.trade) {
    u.trade = (u.trade == null ? T.trade * 0.6 : u.trade) - dt;
    if (u.trade <= 0) {
      u.trade = T.trade; const c = killCoins(G.wave) * 6;
      G.hon += 1; giveCoin(cellX(i), cellY(i) - 0.3, c, true); G.stats.income = (G.stats.income || 0) + c;
      emit({ k: 'ship', cell: i, hon: 1, coins: c });
    }
  }
  if (T.command) {
    u.cmd += dt;
    if (u.cmd >= T.command && G.foes.length) {
      u.cmd = 0;
      for (const f of G.foes) if (!f.big && !f.dead) f.revT = 1.5;
      emit({ k: 'command', cell: i });
    }
  }
  if (T.dayNight) taleSky(u, i, T, dt);
  if (T.storm) {
    u.storm = (u.storm == null ? T.storm * 0.5 : u.storm) - dt;
    if (u.storm <= 0 && G.foes.length) {
      u.storm = T.storm; const base = dmgOf(u.t, i), live = G.foes.filter(f => !f.dead && !(f.hidden > 0)), pts = [];
      for (let k = 0; k < 6 && live.length; k++) { const f = live.splice(Math.floor(Math.random() * live.length), 1)[0]; pts.push({ x: f.x, y: f.y }); damage(f, base * 2, T, true); if (G.phase !== 'play') return; }
      emit({ k: 'storm', pts });
    }
  }
  if (T.shell) {
    u.shell = (u.shell == null ? T.shell * 0.6 : u.shell) - dt;
    if (u.shell <= 0 && G.foes.length) {
      u.shell = T.shell;
      for (const f of G.foes) if (!f.dead && !(f.hidden > 0)) { knock(f, 0.8); slowFoe(f, 0.3, 1.5); }
      emit({ k: 'tide', cell: i, small: true });
    }
  }
  if (T.song) {
    u.song = (u.song == null ? T.song * 0.6 : u.song) - dt;
    if (u.song <= 0 && G.foes.length) {
      u.song = T.song; let n = 0;
      for (const f of G.foes) { if (f.dead || f.hidden > 0) continue; stunFoe(f, 1.5); if (!f.big) n++; }
      const c = Math.min(n, 40) * Math.max(1, Math.round(killCoins(G.wave) * 0.12));
      if (c) giveCoin(cellX(i), cellY(i) - 0.4, c, true);
      emit({ k: 'song', cell: i, n, coins: c });
    }
  }
  if (T.tide) {
    u.tide = (u.tide == null ? T.tide * 0.6 : u.tide) - dt;
    if (u.tide <= 0 && G.foes.length) {
      u.tide = T.tide; const base = dmgOf(u.t, i);
      for (const f of G.foes.slice()) { if (f.dead || f.hidden > 0) continue; damage(f, base * (f.big ? 6 : 3), T, false); if (G.phase !== 'play') return; if (!f.dead) { knock(f, 1.0); slowFoe(f, 0.4, 2); } }
      emit({ k: 'tide', cell: i });
    }
  }
  if (T.tier >= 4 && ULTS[T.id] && G.foes.length) {
    u.mana = (u.mana || 0) + dt / ULTS[T.id].t * 100 * (1 + (G.rel ? G.rel.ult : 0)) * ((G.ultN && G.ultN[i]) || 1);
    if (u.mana >= 100 && castUlt(u, i, T)) { u.mana = 0; if (G.phase !== 'play') return; }
    else if (u.mana > 100) u.mana = 100;
  }
  u.cd -= dt; if (u.cd > 0) return;
  const tgt = T.global ? pickCluster(T.aoe) : pickTarget(cellX(i), cellY(i), rngOf(T, i));
  if (!tgt) { u.cd = 0; return; }
  u.ci = i;
  u.cd = T.cd / G.spd[i] / (G.charmT > 0 ? CHARM.spd : 1) / (G.lotusT > 0 ? 1.6 : 1) / (G.sea ? G.sea.as : 1) * G.lvSpd[u.t] / (T.kind === 'pounce' ? 1 : (u.c || 1));
  u.n++;
  u.dir = tgt.x < cellX(i) ? -1 : 1;
  u.tx = tgt.x; u.ty = tgt.y;
  attack(u, i, T, tgt);
}
function update(dt) {
  HIT_UID = 0;
  if (G.phase !== 'play' || G.paused) return;
  G.time += dt; G.waveT -= dt;
  if (COOP.on && COOP.sync) { COOP.sync(dt); if (G.phase !== 'play') return; }
  if (G.auraDirty) computeAura();
  if (G.spawnLeft > 0) {
    G.spawnT -= dt;
    while (G.spawnT <= 0 && G.spawnLeft > 0) { spawnFoe(); G.spawnLeft--; G.spawnT += BAL.spawnGap; }
  }
  bossTick(dt);
  missTick(dt);
  for (let i = 0; i < CHALS.length; i++) if (G.chalCd[i] > 0) G.chalCd[i] = Math.max(0, G.chalCd[i] - dt);
  if (G.tierBuff) for (const k in G.tierBuff) { const b = G.tierBuff[k]; if (b.t > 0) b.t -= dt; }
  if (G.charmT > 0) G.charmT -= dt;
  comboTickCd(dt);
  if (G.lotusT > 0) G.lotusT -= dt;
  if (G.skyT > 0) { G.skyT -= dt; if (G.skyT <= 0) G.sky = null; }
  expTick(dt);
  fieldTick(dt); if (G.phase !== 'play') return;
  for (const f of G.foes) {
    if (f.dead) continue;
    if (f.chal) { f.chalT -= dt; if (f.chalT <= 0) { f.dead = true; emit({ k: 'chalFail', id: f.chal, x: f.x, y: f.y }); toast(`${f.name}가 달아났어요`); continue; } }
    f.flash = Math.max(0, f.flash - dt); f.age += dt;
    if (f.burnT > 0) { f.burnT -= dt; HIT_UID = f.burnUid || 0; damage(f, f.burnDps * dt, DOT); HIT_UID = 0; if (f.dead) continue; }
    if (f.markT > 0) f.markT -= dt;
    if (f.curseT > 0) f.curseT -= dt;
    if (f.bookT > 0) f.bookT -= dt;
    let v = f.speed;
    if (f.slowT > 0) { f.slowT -= dt; v *= 1 - f.slowAmt; }
    if (f.revT > 0) { f.revT -= dt; v = -0.6 * Math.abs(v); }
    if (f.stunT > 0) { f.stunT -= dt; v = 0; }
    if (f.hidden > 0) v *= 1.6;
    if (f.down > 0) f.down -= dt;
    f.d = Math.max(0, f.d + v * dt); f.wob += dt * (4 + Math.abs(v) * 6);
    placeFoe(f);
  }
  if (G.phase !== 'play') return;
  for (const p of G.pend) { p.t -= dt; if (p.t <= 0) { p.done = true; HIT_UID = p.uid || 0; resolvePend(p); HIT_UID = 0; if (G.phase !== 'play') return; } }
  G.pend = G.pend.filter(p => !p.done);
  for (const k in UID_CELL) delete UID_CELL[k];
  for (let i = 0; i < NCELL; i++) if (G.units[i]) UID_CELL[G.units[i].id] = i;
  for (let i = 0; i < NCELL; i++) {
    const u = G.units[i]; if (!u) continue;
    const ns = G.shots.length, np = G.pend.length;
    HIT_UID = u.id; unitTick(u, i, dt); HIT_UID = 0;
    for (let k = ns; k < G.shots.length; k++) if (!G.shots[k].uid) G.shots[k].uid = u.id;
    for (let k = np; k < G.pend.length; k++) if (!G.pend[k].uid) G.pend[k].uid = u.id;
    if (G.phase !== 'play') return;
  }
  for (const s of G.shots) { if (!s.dead) { HIT_UID = s.uid || 0; shotTick(s, dt); HIT_UID = 0; if (G.phase !== 'play') return; } }
  G.foes = G.foes.filter(f => !f.dead);
  if (G.addQ.length) { for (const f of G.addQ) { placeFoe(f); G.foes.push(f); } G.addQ.length = 0; }
  G.shots = G.shots.filter(s => !s.dead);
  if (G.foes.length >= BAL.cap) { endGame('cap'); return; }
  if (G.waveT <= 0) {
    if (G.boss && !G.boss.dead) { endGame('boss'); return; }
    nextWave();
  }
}
function endGame(reason) {
  if (G.phase !== 'play') return;
  G.phase = reason === 'win' ? 'win' : 'over';
  G.endReason = reason;
  onEnd(reason);
}


/* ================= AI 동료: a second yard the computer plays, sharing each boss with you =================
   it runs these same rules on its own state. one step swaps G and the per-yard boss counters to the AI's,
   runs the yard, lets the AI think, then swaps back. you two share boss health the way two friends do:
   each side's damage on the boss is applied to the other's boss */
const AI = { on: false, G: null, co: { bossW: 0, bossDmg: 0, pApplied: 0 }, me: { bd: 0, bw: 0, wave: 0, waveT: 0, coins: 0 }, nm: '', out: false, t: 0, gift: 0, giftGot: 0, sent: 0, sentGot: 0, sendT: 0 };
const AI_NAMES = ['돌쇠', '마당쇠', '꽃분이', '복순이', '칠복이', '삼돌이', '언년이', '막동이'];
function aiNew(lvMul, lvSpd, stage, rel, nm) {
  const me = G, keep = { bossW: COOP.bossW, bossDmg: COOP.bossDmg, pApplied: COOP.pApplied }, fx = FX_ON;
  FX_ON = false;
  try { newGame(lvMul, lvSpd, stage, rel); AI.G = G; AI.G.ev.length = 0; } finally { G = me; Object.assign(COOP, keep); FX_ON = fx; }
  Object.assign(AI, { on: true, out: false, t: 0.5, gift: 0, giftGot: 0, sent: 0, sentGot: 0, sendT: 20, co: { bossW: 0, bossDmg: 0, pApplied: 0 }, nm: nm || pick(AI_NAMES) });
}
/* your side, every step: the AI's damage on the boss, and coins it sent you */
function aiSyncMe() {
  if (!AI.on || AI.out) return;
  const b = G.boss;
  if (b && !b.dead && AI.co.bossW === COOP.bossW && AI.co.bossDmg > COOP.pApplied) {
    const d = AI.co.bossDmg - COOP.pApplied; COOP.pApplied = AI.co.bossDmg; b.hp -= d;
    if (b.hp <= 0) { HIT_UID = 0; kill(b); if (G.phase !== 'play') return; }
  }
  if (AI.sent > AI.sentGot) { const d = AI.sent - AI.sentGot; AI.sentGot = AI.sent; G.coins += d; emit({ k: 'coin', x: 0, y: -HY - 0.2, v: d, big: true }); toast(`AI ${AI.nm}가 엽전 ${fmtC(d)}을 보냈어요`); }
}
/* the AI's side: your damage on its boss, your clock, coins you sent it */
function aiSyncAi() {
  const m = AI.me, b = G.boss;
  if (b && !b.dead && m.bw === COOP.bossW && m.bd > COOP.pApplied) {
    const d = m.bd - COOP.pApplied; COOP.pApplied = m.bd; b.hp -= d;
    if (b.hp <= 0) { HIT_UID = 0; kill(b); if (G.phase !== 'play') return; }
  }
  if (m.wave === G.wave) { const diff = m.waveT - G.waveT; if (Math.abs(diff) > 0.5 && Math.abs(diff) < 20) G.waveT += diff * 0.25; }
  if (AI.gift > AI.giftGot) { G.coins += AI.gift - AI.giftGot; AI.giftGot = AI.gift; }
}
function aiStep(dt) {
  if (!AI.on || AI.out || !AI.G || AI.G.phase !== 'play') return;
  AI.me = { bd: COOP.bossDmg, bw: COOP.bossW, wave: G.wave, waveT: G.waveT, coins: G.coins };
  const me = G, mine = { bossW: COOP.bossW, bossDmg: COOP.bossDmg, pApplied: COOP.pApplied, sync: COOP.sync }, t0 = toast, e0 = onEnd, fx = FX_ON;
  let fell = false;
  G = AI.G; COOP.bossW = AI.co.bossW; COOP.bossDmg = AI.co.bossDmg; COOP.pApplied = AI.co.pApplied; COOP.sync = aiSyncAi;
  toast = noop; onEnd = noop; FX_ON = false;
  try {
    /* the shared road: your 도깨비 there are the AI's ghosts, and your hits on its 도깨비 land now */
    syncGhosts(me.foes);
    applyHits(me.outHits); me.outHits.length = 0;
    if (G.phase === 'play') update(dt);
    AI.t -= dt;
    if (AI.t <= 0 && G.phase === 'play') { AI.t = 0.3; aiThink(); }
    fell = G.phase !== 'play' && G.phase !== 'win';
  } finally {
    AI.co = { bossW: COOP.bossW, bossDmg: COOP.bossDmg, pApplied: COOP.pApplied };
    G.ev.length = 0;
    G = me; COOP.bossW = mine.bossW; COOP.bossDmg = mine.bossDmg; COOP.pApplied = mine.pApplied; COOP.sync = mine.sync;
    toast = t0; onEnd = e0; FX_ON = fx;
  }
  if (fell) { aiFall(); return; }
  syncGhosts(AI.G.foes);
  if (AI.G.outHits.length) { applyHits(AI.G.outHits); AI.G.outHits.length = 0; }
}
/* the AI's yard fell: you go on alone, and bosses go back to one player's health */
function aiFall() {
  AI.out = true; G.ghosts = []; if (G.ghostMap) G.ghostMap.clear();
  if (JOINT.a) G.hon += JOINT.a; jointReset();
  if (COOP.on) {
    if (G.boss && !G.boss.dead) { G.boss.hp /= COOP.hpMul; G.boss.max /= COOP.hpMul; }
    COOP.on = false;
  }
  emit({ k: 'banner', main: '동료가 쓰러졌다', sub: `AI ${AI.nm}의 마당이 무너졌어요. 여기서부터는 혼자 지켜요`, boss: false });
  toast(`AI ${AI.nm}의 마당이 무너졌어요 · 혼자 계속해요`);
}
/* what the AI does a few times a second: make mythics, merge, 굿, summon and 강화, sell spares, call 도전 귀신 */
function aiThink() {
  for (const M of MYTHS) if (mythOpen(M.id) && recipeState(M).ready) craft(M.id);
  const need = new Set();
  for (const M of MYTHS) { if (!mythOpen(M.id)) continue; const st = recipeState(M); if (st.have >= M.parts.length - 2) M.parts.forEach(p => need.add(p)); }
  for (let i = 0; i < NCELL; i++) {
    if (!canMergeAt(i)) continue;
    const t = G.units[i].t;
    if (need.has(TYPES[t].id) && !G.units.some((u, j) => j !== i && u && u.t === t)) continue;
    mergeAt(i);
  }
  /* 합동 굿: match what you put on the 굿상, a hon at a time, and now and then set one up itself */
  AI.jgT = (AI.jgT || 0) - 0.3;
  if (JOINT.a > JOINT.b && JOINT.b < JOINT.MAX && G.hon >= 1 && emptyCells().length) {
    if (AI.jgT <= 0) { G.hon -= 1; JOINT.b++; AI.jgT = rand(0.6, 1.6); AI.jgAge = 0; }
  } else if (!JOINT.a && !JOINT.b && G.hon >= 5 && G.wave >= 5 && AI.jgT <= -20 && Math.random() < 0.03) {
    G.hon -= 2; JOINT.b = 2; AI.jgAge = 0; AI.jgT = 0;
  } else if (JOINT.b && !JOINT.a && (AI.jgAge = (AI.jgAge || 0) + 0.3) > 40) { G.hon += JOINT.b; JOINT.b = 0; AI.jgT = 0; }
  /* with a partner it keeps two 혼 aside, so it can answer when you open a table */
  const keep = Math.max(JOINT.a - JOINT.b, COOP.on && G.wave >= 3 ? 2 : 0, 0);
  for (let n = 0; n < 4 && G.hon - keep >= 1 && emptyCells().length; n++) {
    const k = (G.pity || 0) >= PITY_MAX && G.hon - keep >= 2 ? 2 : G.wave < 6 ? 0 : 1;
    if (G.hon - keep < GUTS[k].cost) break;
    gamble(k);
  }
  const pw = [0, 0, 0, 0];
  G.units.forEach((u, i) => { if (u) { const T = TYPES[u.t]; pw[upGroup(T)] += dmgOf(u.t, i) * (u.c || 1) / T.cd; } });
  let best = 0; for (let g = 1; g < 4; g++) if (pw[g] > pw[best]) best = g;
  for (let guard = 0; guard < 30; guard++) {
    const sc = summonCost(), uc = G.up[best] < UP_MAX ? upCost(best) : Infinity;
    if (G.up[LUCK] < 5 && !luckByHon() && G.wave >= 8 && G.coins >= upCost(LUCK) + sc) { upgrade(LUCK); continue; }
    if (hasRoom() && G.coins >= sc && (G.coins - sc >= uc * 0.5 || G.up[best] >= G.wave * 0.6)) { if (!summon()) break; continue; }
    if (G.coins >= uc) { upgrade(best); continue; }
    if (hasRoom() && G.coins >= sc) { if (!summon()) break; continue; }
    break;
  }
  if (!hasRoom() && G.coins >= summonCost()) {
    let worst = -1, wv = Infinity;
    G.units.forEach((u, i) => { if (!u) return; const T = TYPES[u.t]; if (T.tier >= 3 || need.has(T.id)) return; const v = T.tier * 10 + u.c; if (v < wv) { wv = v; worst = i; } });
    if (worst >= 0) sell(worst);
  }
  for (let i = 0; i < CHALS.length; i++) if (chalReady(i) && G.wave >= CHALS[i].rec) callChallenge(i);
  /* a good teammate: when you are broke and it has plenty, it sends you coins now and then */
  AI.sendT -= 0.3;
  if (AI.sendT <= 0 && AI.me.coins < 150 && G.coins > 1500 && G.wave >= 3) { AI.sendT = 30; G.coins -= 200; AI.sent += 200; }
}
