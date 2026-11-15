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
const COLS = 5, ROWS = 6, NCELL = COLS * ROWS;
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
const HX = 3.22, HY = 3.72, RC = 0.55, LANE = 0.72;
const SEGS = []; let PERIM = 0;
function segLine(x0, y0, x1, y1) { const len = Math.hypot(x1 - x0, y1 - y0); SEGS.push({ arc: false, x0, y0, x1, y1, len, s: PERIM, dx: (x1 - x0) / len, dy: (y1 - y0) / len }); PERIM += len; }
function segArc(cx, cy, a0, a1) { const len = Math.abs(a1 - a0) * RC; SEGS.push({ arc: true, cx, cy, a0, a1, len, s: PERIM }); PERIM += len; }
segLine(-HX + RC, -HY, HX - RC, -HY); segArc(HX - RC, -HY + RC, -PI / 2, 0);
segLine(HX, -HY + RC, HX, HY - RC); segArc(HX - RC, HY - RC, 0, PI / 2);
segLine(HX - RC, HY, -HX + RC, HY); segArc(-HX + RC, HY - RC, PI / 2, PI);
segLine(-HX, HY - RC, -HX, -HY + RC); segArc(-HX + RC, -HY + RC, PI, 1.5 * PI);
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
const FAMS = {
  tal: { name: '탈', short: '탈', color: '#c8763c' },
  samul: { name: '사물놀이', short: '사물놀이', color: '#3f78c8' },
  suho: { name: '마을 수호', short: '수호', color: '#5f9a3a' },
  jang: { name: '장수', short: '장수', color: '#c23a3a' },
};
const FAM_KEYS = ['tal', 'samul', 'suho', 'jang'], FAM_IX = { tal: 0, samul: 1, suho: 2, jang: 3 }, LUCK = 4;
const TYPES = [
  // 일반
  { id: 'choraengi', name: '초랭이', tier: 0, fam: 'tal', origin: '하회별신굿탈놀이', skill: '돌팔매', desc: '잽싸게 돌멩이를 연달아 던져요', dmg: 5, cd: 0.4, range: 3.1, kind: 'shot', shot: 'stone' },
  { id: 'imae', name: '이매', tier: 0, fam: 'tal', origin: '하회별신굿탈놀이', skill: '헛웃음 밀치기', desc: '맞은 도깨비를 뒤로 밀어내요', dmg: 10, cd: 0.95, range: 3.0, kind: 'shot', shot: 'gust', kb: 0.6 },
  { id: 'halmi', name: '할미', tier: 0, fam: 'tal', origin: '하회별신굿탈놀이', skill: '실타래', desc: '맞은 도깨비가 한참 느려져요', dmg: 7, cd: 0.85, range: 3.2, kind: 'shot', shot: 'yarn', slow: 0.35, slowT: 1.8 },
  { id: 'kkwaenggwari', name: '꽹과리', tier: 0, fam: 'samul', origin: '사물놀이', skill: '쇳소리', desc: '쨍한 소리가 한 마리 더 튕겨 가요', dmg: 6, cd: 0.6, range: 3.0, kind: 'chain', chain: 2 },
  { id: 'buk', name: '북', tier: 0, fam: 'samul', origin: '사물놀이', skill: '둥둥', desc: '맞은 자리 둘레를 한꺼번에 울려요', dmg: 13, cd: 1.35, range: 3.0, kind: 'thump', aoe: 0.8 },
  { id: 'sotdae', name: '솟대', tier: 0, fam: 'suho', origin: '마을 수호', skill: '높이 본 새', desc: '둘레 여덟 칸 동료의 사거리가 0.5 늘어나요. 나무새도 날려요', dmg: 8, cd: 1.0, range: 4.2, kind: 'shot', shot: 'bird', rngAura: 0.5 },
  { id: 'dolhareubang', name: '돌하르방', tier: 0, fam: 'suho', origin: '제주 수호석', skill: '수호석', desc: '마을 어귀를 지키는 수호석이에요. 둘레 여덟 칸 동료가 보스와 도전 귀신에게 주는 피해가 15% 늘어요. 다가온 도깨비는 돌주먹으로 쳐요', dmg: 15, cd: 1.3, range: 2.5, kind: 'thump', aoe: 0.55, stunT: 0.3, bossAura: 0.15 },
  { id: 'uibyeong', name: '의병', tier: 0, fam: 'jang', origin: '조선 의병', skill: '죽창 찌르기', desc: '긴 죽창으로 찔러 뒤에 선 도깨비까지 꿰뚫어요', dmg: 9, cd: 0.8, range: 2.4, kind: 'beam', beamW: 0.26 },
  { id: 'sugun', name: '수군 궁수', tier: 0, fam: 'jang', origin: '조선 수군', skill: '애기살', desc: '짧고 빠른 화살을 멀리까지 쏴요', dmg: 7, cd: 0.55, range: 4.0, kind: 'shot', shot: 'arrow' },
  // 희귀
  { id: 'bune', name: '부네', tier: 1, fam: 'tal', origin: '하회별신굿탈놀이', skill: '홀림 꽃잎', desc: '네 번에 한 번꼴로 도깨비를 홀려 멈춰 세워요', dmg: 22, cd: 0.8, range: 3.2, kind: 'shot', shot: 'petal', stunP: 0.25, stunT: 0.7 },
  { id: 'baekjeong', name: '백정', tier: 1, fam: 'tal', origin: '하회별신굿탈놀이', skill: '식칼 던지기', desc: '묵직한 칼이 맞은 자리 둘레까지 베어요', dmg: 46, cd: 1.45, range: 3.0, kind: 'shot', shot: 'cleaver', splash: 1.0 },
  { id: 'janggu', name: '장구', tier: 1, fam: 'samul', origin: '사물놀이', skill: '덩더쿵', desc: '한 번에 두 번씩 두드려요', dmg: 15, cd: 0.9, range: 3.1, kind: 'double' },
  { id: 'jing', name: '징', tier: 1, fam: 'samul', origin: '사물놀이', skill: '징 울림', desc: '넓게 울려서 둘레 도깨비를 느리게 해요', dmg: 22, cd: 1.6, range: 3.0, kind: 'thump', aoe: 1.3, slow: 0.25, slowT: 1.2 },
  { id: 'jangseung', name: '장승', tier: 1, fam: 'suho', origin: '마을 수호', skill: '길목 호통', desc: '둘레를 지나는 도깨비를 늦추고 받는 피해를 20% 늘려요. 길가에 두세요', dmg: 12, cd: 1.2, range: 2.3, kind: 'pulse', slow: 0.3, slowT: 1.4, mark: 0.2, markT: 1.6 },
  { id: 'sapsal', name: '삽살개', tier: 1, fam: 'suho', origin: '귀신 쫓는 개', skill: '귀신 쫓기', desc: '도깨비 무리에 달려들어 물고 잠깐 멈춰 세워요', dmg: 40, cd: 1.15, range: 3.0, kind: 'pounce', aoe: 0.6, stunT: 0.35 },
  { id: 'seungbyeong', name: '승병', tier: 1, fam: 'jang', origin: '조선 승병', skill: '육모방망이', desc: '방망이를 크게 휘둘러 둘레 도깨비를 치고 잠깐 멈춰 세워요', dmg: 20, cd: 1.2, range: 2.1, kind: 'pulse', stunT: 0.2 },
  { id: 'singijeon', name: '신기전 화차', tier: 1, fam: 'jang', origin: '조선 화약 무기', skill: '신기전', desc: '불화살 다섯 발을 한꺼번에 쏘아 여러 도깨비를 맞혀요', dmg: 9, cd: 1.7, range: 4.0, kind: 'bolts', bolts: 5, shot: 'rocket' },
  { id: 'yangban', name: '양반', tier: 1, fam: 'tal', origin: '하회별신굿탈놀이', skill: '엽전 뿌리기', desc: '맞힐 때 셋에 한 번꼴로 엽전을 챙겨요', dmg: 24, cd: 0.95, range: 3.1, kind: 'shot', shot: 'coin', coinP: 0.35 },
  // 영웅
  { id: 'seonbi', name: '선비', tier: 2, fam: 'tal', origin: '하회별신굿탈놀이', skill: '글 읽는 소리', desc: '둘레 여덟 칸 동료의 공격이 25% 빨라져요. 먹물도 던져요', dmg: 34, cd: 1.0, range: 3.3, kind: 'shot', shot: 'ink', aura: 0.25 },
  { id: 'jung', name: '중', tier: 2, fam: 'tal', origin: '하회별신굿탈놀이', skill: '염주 번개', desc: '염주 번개가 다섯 마리까지 튕겨요', dmg: 30, cd: 1.05, range: 3.1, kind: 'chain', chain: 5 },
  { id: 'gaksi', name: '각시', tier: 2, fam: 'tal', origin: '하회별신굿탈놀이', skill: '서낭빛', desc: '한 줄로 꿰뚫는 빛줄기를 쏴요', dmg: 90, cd: 1.5, range: 4.2, kind: 'beam' },
  { id: 'malttugi', name: '말뚝이', tier: 2, fam: 'tal', origin: '봉산탈춤', skill: '채찍 조롱', desc: '채찍 맞은 도깨비는 3초 동안 피해를 35% 더 받아요', dmg: 34, cd: 0.55, range: 3.2, kind: 'whip', mark: 0.35 },
  { id: 'sangmo', name: '상모꾼', tier: 2, fam: 'samul', origin: '풍물놀이', skill: '열두 발 상모', desc: '긴 상모 끈을 돌려 둘레를 모두 휩쓸어요', dmg: 40, cd: 1.0, range: 2.1, kind: 'pulse' },
  { id: 'chwibari', name: '취발이', tier: 2, fam: 'tal', origin: '봉산탈춤', skill: '술불 뿜기', desc: '앞쪽 부채꼴로 불을 뿜어 3초 동안 태워요', dmg: 44, cd: 1.3, range: 3.0, kind: 'cone', cone: 0.62, burn: 0.5 },
  { id: 'mudong', name: '무동', tier: 2, fam: 'samul', origin: '농악 무동놀이', skill: '어깨 위 소고', desc: '어깨 위 아이가 소고를 울려 둘레 여덟 칸 동료의 공격력을 20% 올려요. 소고도 던져요', dmg: 30, cd: 0.9, range: 3.2, kind: 'shot', shot: 'sogo', dmgAura: 0.2 },
  { id: 'sansin', name: '산신령', tier: 2, fam: 'suho', origin: '산신 신앙', skill: '산신 벼락', desc: '지팡이로 벼락을 내려 맞은 자리 둘레를 치고, 셋에 한 번꼴로 기절시켜요', dmg: 62, cd: 1.3, range: 3.6, kind: 'thump', aoe: 0.9, stunP: 0.33, stunT: 0.6 },
  { id: 'samjogo', name: '삼족오', tier: 2, fam: 'suho', origin: '고구려 해 신화', skill: '해불', desc: '해처럼 타오르는 불덩이를 날려 맞은 도깨비를 3초 동안 태워요', dmg: 46, cd: 1.0, range: 3.8, kind: 'shot', shot: 'sunfire', burn: 0.45 },
  { id: 'gwakjaewoo', name: '곽재우', tier: 2, fam: 'jang', origin: '홍의장군', skill: '홍의 돌격', desc: '붉은 옷을 휘날리며 도깨비 무리에 뛰어들어 둘레를 베고 잠깐 멈춰 세워요', dmg: 105, cd: 1.5, range: 3.4, kind: 'pounce', aoe: 0.95, stunT: 0.35 },
  { id: 'gwonyul', name: '권율', tier: 2, fam: 'jang', origin: '행주대첩', skill: '행주 돌팔매', desc: '행주산성의 돌을 날려 맞은 자리 둘레를 크게 치고 느리게 해요', dmg: 58, cd: 1.35, range: 3.6, kind: 'thump', aoe: 1.1, slow: 0.3, slowT: 1.2 },
  // 전설
  { id: 'yeongno', name: '영노', tier: 3, fam: 'tal', origin: '수영야류', skill: '통째로 삼키기', desc: '네 번째 공격마다 도깨비를 통째로 삼켜요. 보스에겐 두 배 피해', dmg: 85, cd: 1.4, range: 2.9, kind: 'devour', devour: 4 },
  { id: 'bangsangsi', name: '방상시', tier: 3, fam: 'tal', origin: '나례', skill: '네 눈 창', desc: '네 눈에서 금빛 창을 날려요. 치명타가 자주 터져요', dmg: 26, cd: 1.1, range: 3.8, kind: 'bolts', bolts: 4, crit: 0.3, critMul: 3 },
  { id: 'haetae', name: '해태', tier: 3, fam: 'suho', origin: '마을 수호', skill: '덮치기', desc: '도깨비 무리에 뛰어들어 둘레를 치고 잠깐 기절시켜요', dmg: 160, cd: 1.6, range: 3.2, kind: 'pounce', aoe: 1.0, stunT: 0.5 },
  { id: 'taepyeongso', name: '태평소', tier: 3, fam: 'samul', origin: '풍물놀이', skill: '날라리 가락', desc: '앞쪽 부채꼴로 쩌렁한 소리를 보내 도깨비를 밀어내요', dmg: 120, cd: 1.3, range: 3.3, kind: 'cone', cone: 0.7, kb: 0.25 },
  { id: 'yisunsin', name: '이순신', tier: 3, fam: 'jang', origin: '삼도수군통제사', skill: '학익진', desc: '학이 날개를 펴듯 화살 일곱 발을 부채꼴로 쏘아 앞쪽 도깨비를 모두 꿰뚫어요', dmg: 40, cd: 1.35, range: 3.9, kind: 'volley', arrows: 7, spread: 0.95 },
  // 신화 (조합으로만)
  { id: 'samulpae', name: '사물놀이패', tier: 4, fam: 'samul', origin: '사물놀이', skill: '신명 장단', desc: '장단에 맞춰 둘레를 계속 울리고 네 번째 박마다 기절시켜요. 사물놀이 동료 공격력 20% 증가', dmg: 70, cd: 0.55, range: 3.0, kind: 'beat', famAura: 0.2 },
  { id: 'bari', name: '바리공주', tier: 4, fam: 'suho', origin: '무속 신화', skill: '저승길 인도', desc: '방울 소리가 여섯 마리까지 튕기고, 체력이 적게 남은 도깨비는 바로 저승으로 보내요', dmg: 120, cd: 1.0, range: 3.4, kind: 'chain', chain: 6, execute: 0.15 },
  { id: 'kkokdusoe', name: '꼭두쇠', tier: 4, fam: 'samul', origin: '남사당놀이', skill: '버나 돌리기', desc: '접시 셋을 부메랑처럼 던져 오가며 베어요. 가끔 엽전이 떨어져요', dmg: 85, cd: 1.4, range: 3.6, kind: 'boomerang', plates: 3, coinP: 0.08 },
  { id: 'saja', name: '북청사자', tier: 4, fam: 'tal', origin: '북청사자놀음', skill: '사자후', desc: '마당 어디든 뛰어들어 둘레를 크게 치고 기절시켜요', dmg: 700, cd: 2.0, range: 99, kind: 'pounce', aoe: 1.6, stunT: 0.7, global: true },
  { id: 'daejanggun', name: '천하대장군', tier: 4, fam: 'suho', origin: '마을 수호', skill: '마을 지킴', desc: '둘레 도깨비의 체력을 비율로 깎고 크게 늦춰요', dmg: 120, cd: 1.0, range: 2.8, kind: 'pulse', pct: 0.03, slow: 0.4, slowT: 1.2 },
  { id: 'cheoyong', name: '처용', tier: 4, fam: 'tal', origin: '처용무', skill: '역신 쫓기', desc: '꿰뚫는 붉은 물결을 보내요. 보스에겐 세 배 피해', dmg: 260, cd: 1.2, range: 4.0, kind: 'wave', bossMul: 3 },
  { id: 'bihyeong', name: '비형랑', tier: 4, fam: 'suho', origin: '삼국유사', skill: '도깨비 호령', desc: '도깨비불 셋을 날리고, 여덟 초마다 호령해서 도깨비들을 뒤로 걷게 해요', dmg: 190, cd: 1.2, range: 4.0, kind: 'homing', orbs: 3, command: 8 },
  { id: 'geobukseon', name: '거북선', tier: 4, fam: 'jang', origin: '조선 수군', skill: '용머리 화포', desc: '화포를 쏘아 맞은 자리 둘레를 크게 치고 기절시켜요. 세 번째마다 용머리가 불을 뿜어 태워요', dmg: 300, cd: 1.4, range: 3.9, kind: 'cannon', aoe: 1.1, stunT: 0.45, breath: 3, cone: 0.6, burn: 0.4 },
  { id: 'uibyeongdae', name: '팔도 의병', tier: 4, fam: 'jang', origin: '조선 의병', skill: '의병 봉기', desc: '네 의병이 함께 둘레를 휩쓸고 네 번째마다 기절시켜요. 장수 동료 공격력 20% 증가', dmg: 80, cd: 0.6, range: 2.9, kind: 'beat', famAura: 0.2 },
  { id: 'seolmundae', name: '설문대할망', tier: 4, fam: 'suho', origin: '제주 창세 신화', skill: '흙치마', desc: '치마폭에 담은 바위를 마당 어디든 떨어뜨려 둘레를 크게 치고 한참 느리게 해요', dmg: 520, cd: 1.8, range: 99, kind: 'drop', aoe: 1.4, slow: 0.5, slowT: 2.2, global: true },
  // 새 동료는 꼭 맨 뒤에 붙여요. 저장된 판이 동료를 순번으로 기억해서 중간에 끼우면 바뀌어요
  { id: 'nongmin', name: '농민', tier: 0, fam: 'samul', origin: '두레 농사', skill: '풍년 농사', desc: '공격은 약하지만 5초마다 엽전 10을 거둬요. 쌓인 만큼 더 거둬요', dmg: 6, cd: 1.1, range: 3.0, kind: 'shot', shot: 'stone', income: 10, incCd: 5 },
  { id: 'bobusang', name: '보부상', tier: 1, fam: 'tal', origin: '조선 장돌뱅이', skill: '장사 수완', desc: '공격은 약하지만 6초마다 엽전 30을 벌어요. 쌓인 만큼 더 벌어요', dmg: 12, cd: 1.0, range: 3.1, kind: 'shot', shot: 'coin', income: 30, incCd: 6 },
  { id: 'mudang', name: '무당', tier: 2, fam: 'suho', origin: '굿', skill: '부정 저주', desc: '도깨비 무리에 부정을 씌워요. 4초 동안 받는 피해가 20% 늘고 되살아나거나 갈라지거나 체력이 차오르지 못해요', dmg: 16, cd: 2.0, range: 3.4, kind: 'curse', aoe: 1.4, curse: 0.2, curseT: 4 },
  { id: 'honggildong', name: '홍길동', tier: 3, fam: 'jang', origin: '홍길동전', skill: '분신술', desc: '분신 둘과 함께 세 번 베어요. 도깨비가 여럿이면 나눠 베고 가끔 엽전을 훔쳐 와요', dmg: 40, cd: 1.05, range: 3.6, kind: 'clone', clones: 3, coinP: 0.12 },
  // 전래동화: 신화 둘과 전설 하나, 그리고 이야기에 어울리는 동료 하나를 모아야 나와요
  { id: 'haedal', name: '해님달님', tier: 6, fam: 'suho', origin: '해와 달이 된 오누이', skill: '해와 달', desc: '오누이가 해와 달이 되어 일곱 초씩 번갈아 떠요. 해가 뜨면 마당의 도깨비가 모두 타고, 달이 뜨면 모두 느려지고 받는 피해가 25% 늘어요. 햇살 다섯 줄기도 쏘아요', dmg: 180, cd: 1.0, range: 4.2, kind: 'homing', shot: 'sunray', orbs: 5, dayNight: 7 },
  { id: 'hokburi', name: '혹부리 영감', tier: 6, fam: 'tal', origin: '혹부리 영감', skill: '도깨비 홀리는 노래', desc: '노랫가락이 일곱 마리까지 튕겨요. 열 초마다 노래를 불러 마당의 도깨비를 모두 춤추게 해 멈춰 세우고, 멈춘 도깨비마다 엽전을 받아요', dmg: 210, cd: 0.9, range: 3.8, kind: 'chain', chain: 7, song: 10 },
  { id: 'namukkun', name: '나무꾼', tier: 6, fam: 'suho', origin: '금도끼 은도끼', skill: '금도끼 은도끼', desc: '금도끼를 던져 둘레까지 크게 베고 보스에겐 세 배를 줘요. 두 번에 한 번은 은도끼도 일직선으로 날아가 줄줄이 베어요', dmg: 560, cd: 1.1, range: 4.0, kind: 'axes', bossMul: 3, splash: 0.7 },
  { id: 'simcheong', name: '심청', tier: 6, fam: 'suho', origin: '심청전', skill: '인당수', desc: '푸른 물결로 줄줄이 꿰뚫고 느리게 해요. 보스에겐 2.5배. 여덟 초마다 인당수 큰 물결이 마당을 덮쳐 모든 도깨비를 치고 뒤로 밀어내요', dmg: 420, cd: 0.9, range: 4.2, kind: 'wave', shot: 'bwave', slow: 0.3, slowT: 1.5, tide: 8, bossMul: 2.5 },
  // 고을 전용 전설: 뒤 고을일수록 세요
  { id: 'heodoryeong', name: '허도령', tier: 3, fam: 'tal', origin: '하회탈을 깎은 총각', skill: '탈 던지기', desc: '깎다 만 탈을 던져 맞은 자리 둘레까지 쳐요. 맞은 도깨비는 2초 동안 받는 피해가 15% 늘어요', dmg: 95, cd: 1.0, range: 3.6, kind: 'shot', shot: 'mask', splash: 0.9, mark: 0.15, markT: 2 },
  { id: 'gimseondal', name: '김선달', tier: 3, fam: 'tal', origin: '봉이 김선달', skill: '대동강 물 팔기', desc: '대동강 물을 한 바가지 끼얹어 둘레를 쳐요. 김선달이 잡은 도깨비마다 엽전을 더 받아요', dmg: 110, cd: 1.1, range: 3.5, kind: 'thump', aoe: 0.95, killCoin: 6 },
  { id: 'euljimundeok', name: '을지문덕', tier: 3, fam: 'jang', origin: '살수대첩', skill: '살수대첩', desc: '막아 둔 강물을 터뜨려 일직선으로 쓸어버리고 한참 느리게 해요', dmg: 135, cd: 1.2, range: 4.0, kind: 'wave', shot: 'flood', slow: 0.35, slowT: 1.6 },
  { id: 'jangbogo', name: '장보고', tier: 3, fam: 'jang', origin: '청해진 대사', skill: '청해진 화포', desc: '배에서 화포를 쏘아 맞은 자리 둘레를 크게 치고 잠깐 멈춰 세워요', dmg: 175, cd: 1.3, range: 3.9, kind: 'cannon', aoe: 0.95, stunT: 0.3 },
  { id: 'gangrim', name: '강림도령', tier: 3, fam: 'suho', origin: '차사본풀이', skill: '저승 오랏줄', desc: '오랏줄이 다섯 마리까지 튕기고, 체력이 조금 남은 도깨비는 바로 저승으로 끌고 가요', dmg: 160, cd: 1.0, range: 3.7, kind: 'chain', chain: 5, execute: 0.12 },
  // 신수: 전설 둘과 영웅 하나를 모아 불러요
  { id: 'cheongryong', name: '청룡', tier: 5, fam: 'tal', origin: '동쪽을 지키는 신수', skill: '청룡의 숨결', desc: '푸른 숨결로 일직선을 꿰뚫어요. 네 초마다 번개가 떨어져 도깨비 넷을 크게 쳐요', dmg: 300, cd: 1.1, range: 4.3, kind: 'wave', shot: 'dragon', storm: 4 },
  { id: 'jujak', name: '주작', tier: 5, fam: 'samul', origin: '남쪽을 지키는 신수', skill: '불새의 깃', desc: '마당 어디든 도깨비가 몰린 곳에 불을 떨어뜨려 둘레를 치고 오래 태워요', dmg: 430, cd: 1.6, range: 99, kind: 'fire', aoe: 1.3, burn: 0.6, global: true },
  { id: 'baekho', name: '백호', tier: 5, fam: 'jang', origin: '서쪽을 지키는 신수', skill: '산군의 발톱', desc: '마당 어디든 뛰어들어 둘레를 크게 할퀴고 기절시켜요. 할퀸 도깨비는 3초 동안 받는 피해가 20% 늘어요', dmg: 820, cd: 1.8, range: 99, kind: 'pounce', aoe: 1.5, stunT: 0.6, mark: 0.2, markT: 3, global: true },
  { id: 'hyeonmu', name: '현무', tier: 5, fam: 'suho', origin: '북쪽을 지키는 신수', skill: '북방의 물결', desc: '물방울 넷을 날려 맞은 도깨비를 느리게 해요. 아홉 초마다 큰 물결로 마당의 도깨비를 모두 뒤로 밀어내요', dmg: 320, cd: 1.2, range: 4.2, kind: 'homing', shot: 'waterorb', orbs: 4, slow: 0.35, slowT: 1.5, shell: 9 },
  { id: 'hwangryong', name: '황룡', tier: 5, fam: 'suho', origin: '가운데를 지키는 신수', skill: '여의주', desc: '여의주 다섯 개를 날려요. 보스에겐 두 배. 황룡이 마당에 있으면 모든 동료 공격력이 15% 올라요', dmg: 300, cd: 1.0, range: 4.4, kind: 'homing', shot: 'pearl', orbs: 5, bossMul: 2, allAura: 0.15 },
  { id: 'choimuseon', name: '최무선', tier: 3, fam: 'jang', origin: '진포 대첩', skill: '주화', desc: '화통도감에서 만든 주화 세 발을 쏘아요. 맞은 자리 둘레가 터지고 3초 동안 불타요', dmg: 70, cd: 1.3, range: 4.0, kind: 'bolts', bolts: 3, shot: 'rocket', splash: 0.75, burn: 0.5 },
  { id: 'yongwang', name: '용왕', tier: 4, fam: 'suho', origin: '용왕 신앙', skill: '용궁 물대포', desc: '물대포로 줄줄이 꿰뚫고 뒤로 밀며 느리게 해요. 둘레 여덟 칸 동료의 궁극기가 30% 빨리 차요', dmg: 240, cd: 1.1, range: 4.2, kind: 'wave', shot: 'bwave', slow: 0.35, slowT: 1.5, kb: 0.35, ultAura: 0.3 },
];
const TYPE_IX = {}; TYPES.forEach((T, i) => { TYPE_IX[T.id] = i; T.ix = i; });
const TIER_POOL = TIERS.map(() => []); TYPES.forEach((T, i) => TIER_POOL[T.tier].push(i));
const MYTHS = [
  { id: 'samulpae', parts: ['kkwaenggwari', 'janggu', 'jing', 'buk', 'sangmo'] },
  { id: 'bari', parts: ['halmi', 'bune', 'jung'] },
  { id: 'kkokdusoe', parts: ['imae', 'baekjeong', 'seonbi'] },
  { id: 'saja', parts: ['choraengi', 'sangmo', 'taepyeongso'] },
  { id: 'daejanggun', parts: ['sotdae', 'jangseung', 'haetae'] },
  { id: 'cheoyong', parts: ['yangban', 'gaksi', 'bangsangsi'] },
  { id: 'bihyeong', parts: ['malttugi', 'chwibari', 'yeongno'], secret: true },
  { id: 'geobukseon', parts: ['yisunsin', 'sugun', 'singijeon'] },
  { id: 'uibyeongdae', parts: ['gwakjaewoo', 'gwonyul', 'seungbyeong', 'uibyeong'] },
  { id: 'seolmundae', parts: ['dolhareubang', 'sapsal', 'sansin'], secret: true },
  { id: 'yongwang', parts: ['jangbogo', 'mudang', 'sugun'] },
  { id: 'haedal', parts: ['bari', 'cheoyong', 'bangsangsi', 'halmi'], tale: true },
  { id: 'hokburi', parts: ['bihyeong', 'kkokdusoe', 'taepyeongso', 'imae'], tale: true },
  { id: 'namukkun', parts: ['daejanggun', 'seolmundae', 'haetae', 'sansin'], tale: true },
  { id: 'simcheong', parts: ['geobukseon', 'yongwang', 'yisunsin', 'jing'], tale: true },
  // '*3' is any 전설 on the yard: spare legends become 신수 instead of sitting on a cell
  { id: 'cheongryong', parts: ['heodoryeong', '*3', 'mudang'], beast: true },
  { id: 'jujak', parts: ['gimseondal', '*3', 'mudong'], beast: true },
  { id: 'baekho', parts: ['euljimundeok', '*3', 'samjogo'], beast: true },
  { id: 'hyeonmu', parts: ['choimuseon', '*3', 'mudang'], beast: true },
  { id: 'hwangryong', parts: ['gangrim', '*3', 'samjogo'], beast: true },
];
const WILD = { '*3': 3 };
/* 신화 해금: each 고을 opens three mythics from the start; the rest are opened for good with 신화 두루마리.
   hidden mythics open by being found. playing together, a mythic either player has opened works for both */
const MYTH_FREE = [['samulpae', 'bari', 'cheoyong'], ['samulpae', 'saja', 'kkokdusoe'], ['uibyeongdae', 'daejanggun', 'cheoyong'], ['geobukseon', 'uibyeongdae', 'samulpae'], ['bari', 'cheoyong', 'saja']];
const scrollCost = M => (M.tale ? 3 : M.beast ? 2 : 1);
function mythOpenSelf(id, st) {
  if (typeof SAVE === 'undefined') return true;
  const M = MYTH_BY[id]; if (!M || M.secret) return true;
  if ((MYTH_FREE[st] || []).includes(id)) return true;
  return !!(SAVE.mopen && SAVE.mopen[id]);
}
function mythOpen(id) {
  const st = G ? (G.stage || 0) : 0;
  if (mythOpenSelf(id, st)) return true;
  return !!(COOP.on && typeof CO !== 'undefined' && CO.partner && Array.isArray(CO.partner.mo) && CO.partner.mo.includes(id));
}
MYTHS.forEach(M => { M.ix = TYPE_IX[M.id]; M.partIx = M.parts.map(p => TYPE_IX[p]); });
const MYTH_BY = {}; MYTHS.forEach(M => { MYTH_BY[M.id] = M; });
const PART_OF = {}, TALE_OF = {}; MYTHS.forEach(M => M.parts.forEach(p => { if (WILD[p]) return; if (M.tale || M.beast) (TALE_OF[p] = TALE_OF[p] || []).push(M.id); else PART_OF[p] = M.id; }));
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
  { id: 'hahoe', name: '하회마을', theme: 'village', hp: 0.78, spd: 1.0, special: 0, bosses: { 10: 'beom', 20: 'gumiho', 30: 'imugi', 40: 'bulgasari', 50: 'geumdwaeji', 60: 'daejeok', 70: 'heukryong', 80: 'yeomra' }, rule: '도깨비가 처음 몰려든 고을이에요', reward: 1 },
  { id: 'jeoja', name: '저잣거리', theme: 'market', hp: 1.09, spd: 1.06, special: 4, bosses: { 10: 'gumiho', 20: 'beom', 30: 'geumdwaeji', 40: 'bulgasari', 50: 'imugi', 60: 'heukryong', 70: 'daejeok', 80: 'yeomra' }, rule: '날쌘 야광귀가 섞여 와요', reward: 1.3 },
  { id: 'sanseong', name: '산성', theme: 'fortress', hp: 1.93, spd: 1.0, special: 5, bosses: { 10: 'beom', 20: 'imugi', 30: 'gumiho', 40: 'daejeok', 50: 'bulgasari', 60: 'geumdwaeji', 70: 'yeomra', 80: 'heukryong' }, rule: '쇠도깨비는 일반·희귀 동료 공격을 반만 받아요', reward: 1.6 },
  { id: 'jinyeong', name: '수군 진영', theme: 'sea', hp: 1.89, spd: 1.03, special: 6, bosses: { 10: 'imugi', 20: 'geumdwaeji', 30: 'daejeok', 40: 'bulgasari', 50: 'gumiho', 60: 'beom', 70: 'yeomra', 80: 'heukryong' }, rule: '물귀신은 한 번 쓰러져도 다시 일어나요', reward: 2 },
  { id: 'jeoseung', name: '저승길', theme: 'underworld', hp: 1.86, spd: 1.05, special: 7, bosses: { 10: 'geumdwaeji', 20: 'daejeok', 30: 'heukryong', 40: 'gumiho', 50: 'imugi', 60: 'bulgasari', 70: 'daejeok', 80: 'yeomra' }, rule: '망령이 쓰러지면 작은 망령 둘로 나뉘어요', reward: 2.5 },
];
/* each 고을 summons only the companions its mythic recipes need, so recipes stay reachable */
const STAGE_ROSTER = [
  { myths: ['bari', 'kkokdusoe', 'cheoyong', 'samulpae', 'daejanggun', 'haedal', 'cheongryong'], extra: ['nongmin', 'bobusang', 'mudang', 'honggildong', 'heodoryeong'] },
  { myths: ['samulpae', 'saja', 'bihyeong', 'kkokdusoe', 'hokburi', 'jujak'], extra: ['mudong', 'nongmin', 'bobusang', 'honggildong', 'gimseondal'] },
  { myths: ['uibyeongdae', 'daejanggun', 'seolmundae', 'cheoyong', 'namukkun', 'baekho'], extra: ['samjogo', 'nongmin', 'bobusang', 'honggildong', 'euljimundeok'] },
  { myths: ['geobukseon', 'uibyeongdae', 'seolmundae', 'samulpae', 'yongwang', 'simcheong', 'hyeonmu'], extra: ['nongmin', 'bobusang', 'mudang', 'jangbogo', 'choimuseon'], boost: { yisunsin: 2 } },
  { myths: ['bari', 'bihyeong', 'cheoyong', 'saja', 'seolmundae', 'haedal', 'hwangryong'], extra: ['samjogo', 'nongmin', 'bobusang', 'mudang', 'gangrim'] },
];
STAGES.forEach((S, i) => {
  S.myths = STAGE_ROSTER[i].myths;
  const ids = new Set(STAGE_ROSTER[i].extra);
  S.myths.forEach(m => MYTHS.find(M => M.id === m).parts.forEach(pt => ids.add(pt)));
  S.units = TYPES.filter(T => T.tier < 4 && ids.has(T.id)).map(T => T.id);
  S.pool = [0, 1, 2, 3].map(t => S.units.map(id => TYPE_IX[id]).filter(k => TYPES[k].tier === t));
  /* a boosted unit counts more than once when the 고을 picks at random */
  for (const [id, n] of Object.entries(STAGE_ROSTER[i].boost || {})) { const k = TYPE_IX[id]; for (let r = 1; r < n; r++) S.pool[TYPES[k].tier].push(k); }
  S.fams = FAM_KEYS.filter(f => S.units.some(id => TYPES[TYPE_IX[id]].fam === f));
  /* legends a recipe here names outright (not the any-legend slot) */
  S.legNeed = [...new Set(S.myths.flatMap(m => MYTH_BY[m].parts).filter(p => !WILD[p] && TYPES[TYPE_IX[p]] && TYPES[TYPE_IX[p]].tier === 3))].map(id => TYPE_IX[id]);
});
const hasUnitT = k => G.units.some(u => u && u.t === k) || !!(G.exp && G.exp.run && G.exp.run.units && G.exp.run.units.some(u => u && u.t === k));
/* a legend some recipe here still needs and you have none of comes up more often, so one missing part can't stall a whole run */
const poolOf = tier => {
  const S = STAGES[(G && G.stage) || 0], P = S.pool[tier];
  if (tier !== 3 || !G || !G.units) return P;
  const miss = S.legNeed.filter(k => !hasUnitT(k));
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
  hokburi: { name: '혹 떼기', t: 22, desc: '가장 체력이 많은 도깨비의 혹을 떼어 체력을 크게 깎고 혼 2개와 엽전을 받아요' },
  namukkun: { name: '산신령의 선물', t: 20, desc: '금도끼 여섯 자루가 가장 센 도깨비들에게 떨어져요. 보스에겐 세 배, 엽전도 받아요' },
  cheongryong: { name: '비구름', t: 18, desc: '먹구름을 몰고 와 번개 열두 줄기를 내리꽂고 도깨비를 모두 느리게 해요' },
  jujak: { name: '불사조', t: 18, desc: '날개를 펼쳐 마당의 도깨비를 모두 치고 한참 태워요' },
  baekho: { name: '산군의 포효', t: 18, desc: '포효로 마당의 도깨비를 모두 1.5초 멈춰 세우고 5초 동안 받는 피해를 30% 늘려요' },
  hyeonmu: { name: '거북 등껍질', t: 18, desc: '큰 물결로 마당의 도깨비를 모두 치고 멀리 밀어내요' },
  hwangryong: { name: '여의주 천둥', t: 18, desc: '여의주가 터지며 마당의 도깨비를 모두 크게 쳐요' },
  simcheong: { name: '연꽃 환생', t: 20, desc: '연꽃이 피어나 6초 동안 모든 동료가 60% 빨리 때리고 도깨비는 모두 크게 느려져요' },
  geobukseon: { name: '일제 포격', t: 16, desc: '화포 열두 발을 마당 곳곳에 퍼부어요' },
  uibyeongdae: { name: '의병 봉기', t: 19, desc: '6초 동안 장수 동료 공격력이 50% 올라요' },
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
const BAL = {
  hpBase: 40, hpGrowth: 1.205, hpGrowth2: 1.10, bossMul: { 10: 16, 20: 18, 30: 13, 40: 7, 50: 7, 60: 6.5, 70: 6, 80: 5.5 },
  startCoins: 400, summonBase: 100, summonStep: 20, coinsDiv: 8, coinsPer: 1, coinUnit: 10,
  upBonus: 0.2, upBase: 200, upStep: 200, luckCost: [600, 1200, 2000, 3200, 4800], gutBias: 0.5,
  perWave: 24, waveExtra: 0.5, cap: 100, spawnGap: 0.45, gutCost: 3, honPerWave: 1, lvBonus: 0.15,
};
const SUMMON_BASE = [0.87, 0.11, 0.02, 0];
const SUMMON_LUCK = [-0.03, 0.02, 0.008, 0.002], SUMMON_LUCK2 = [-0.025, 0.015, 0.008, 0.002];
/* 소환 운 1~5단계는 엽전, 6~10단계는 혼으로 올려요 */
const LUCK_COIN = 5, LUCK_HON = [4, 5, 6, 8, 10];
const GUT_ODDS = [[-1, 0.35], [1, 0.40], [2, 0.19], [3, 0.06]];
/* 큰굿: no 희귀, more 영웅 and 전설. 신명 부적: every unit attacks faster for a while */
const BIG_GUT = { cost: 7, odds: [[-1, 0.30], [2, 0.52], [3, 0.18]] };
const CHARM = { cost: 4, t: 20, spd: 1.4 };
const LUCK_MAX = 10, WAVE_TIME = 20, LAST_WAVE = 80, BREAK_WAVE = 40;
let UP_MAX = 40;
let BOSS_TIME = 60;
const UP_NAMES = ['탈', '사물놀이', '수호', '장수', '소환 운'];
const upGroup = T => FAM_IX[T.fam];

/* the first 40 마당 climb steeply; after that the curve eases so a grown yard can push on to 80 */
const hpAt = w => BAL.hpBase * Math.pow(BAL.hpGrowth, Math.min(w, BREAK_WAVE) - 1) * Math.pow(BAL.hpGrowth2, Math.max(0, w - BREAK_WAVE)) * STAGES[G.stage || 0].hp;
const killCoins = w => BAL.coinUnit * (1 + BAL.coinsPer * Math.floor((w - 1) / BAL.coinsDiv)) * (G && G.rel ? 1 + G.rel.kill : 1);
/* the first twenty calls are cheap so the yard grows fast early; from the fortieth on it is the old price again */
const summonCost = () => { const n = G.summons, b = BAL.summonBase, st = BAL.summonStep; return n < 20 ? b + st * 0.5 * n : n < 40 ? b + st * 10 + st * 1.5 * (n - 20) : b + st * n; };
const luckByHon = () => G.up[LUCK] >= LUCK_COIN;
const upCost = g => g === LUCK ? (luckByHon() ? LUCK_HON[Math.min(G.up[LUCK] - LUCK_COIN, LUCK_HON.length - 1)] : BAL.luckCost[G.up[LUCK]]) : BAL.upBase + BAL.upStep * G.up[g];
function mainFam() { let b = -1, bv = 0; for (let k = 0; k < 4; k++) if (G.up[k] > bv) { bv = G.up[k]; b = k; } return b; }
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
const COOP = { on: false, hpMul: 1.8, bossW: 0, bossDmg: 0, pApplied: 0, sync: null };
const UID_CELL = {};
let FX_ON = true;
function emit(e) { if (FX_ON && G.ev.length < 900) G.ev.push(e); }
function noop() {}
let toast = noop, onEnd = noop;
/* 유물 bonuses for one run; the lobby fills these from the save */
function noRelics() { return { atk: 0, myth: 0, boss: 0, coins0: 0, hon0: 0, ult: 0, bossTime: 0, kill: 0, exp: 0, gut: 0, fam: { tal: 0, samul: 0, suho: 0, jang: 0 } }; }
function makeState(phase, speed = 1) {
  return {
    phase, wave: 0, waveT: 0, spawnLeft: 0, spawnT: 0, coins: BAL.startCoins, hon: 0, summons: 0, stage: 0,
    units: Array(NCELL).fill(null), foes: [], shots: [], pend: [], addQ: [], up: [0, 0, 0, 0, 0],
    speed, paused: false, sel: -1, time: 0, boss: null, nextId: 1, endReason: '',
    ev: [], spd: Array(NCELL).fill(1), dmgN: Array(NCELL).fill(1), rngB: Array(NCELL).fill(0), auraDirty: true, famMul: { tal: 1, samul: 1, suho: 1, jang: 1 },
    rel: noRelics(), bossTimeMax: BOSS_TIME,
    lvMul: TYPES.map(() => 1), lvSpd: TYPES.map(() => 1), chalCd: CHALS.map(C => C.cd * 0.3), famBuff: {}, killBy: {}, earnBy: {}, charmT: 0, lotusT: 0, sky: null, skyT: 0, exp: { floor: 1, cd: 0, run: null, wins: 0 },
    stats: { kills: 0, merges: 0, guts: 0, bossKills: 0, crafts: 0, crafted: {}, seen: {}, foeSeen: {}, summons: 0, chalWins: 0, chalHard: 0, chalTop: 0, silverBonus: 0, caveTop: 0 },
  };
}
function newGame(lvMul, lvSpd, stage, rel) {
  G = makeState('play', G ? G.speed : 1);
  G.stage = clamp(stage || 0, 0, STAGES.length - 1);
  if (lvMul) G.lvMul = lvMul.slice();
  if (lvSpd) G.lvSpd = lvSpd.slice();
  if (rel) { G.rel = Object.assign(noRelics(), rel, { fam: Object.assign(noRelics().fam, rel.fam || {}) }); G.coins += G.rel.coins0; G.hon += G.rel.hon0; }
  G.bossTimeMax = BOSS_TIME + G.rel.bossTime;
  nextWave();
}
function nextWave() {
  G.wave++;
  if (G.wave > 1) G.hon += BAL.honPerWave;
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
  const f = newFoe(kind, hpAt(w) * F.hpMul, F.speed * S.spd * (1 + w * 0.004), 0.28, { lane: rand(-0.18, 0.18), reward: killCoins(w) });
  if (F.armor) f.armor = 1;
  if (F.revive) f.rev = 1;
  if (F.split) f.split = 1;
  placeFoe(f); G.foes.push(f);
  G.stats.foeSeen['f' + kind] = 1;
}
function spawnBoss(B) {
  if (COOP.on) { COOP.bossW = G.wave; COOP.bossDmg = 0; COOP.pApplied = 0; }
  const f = newFoe(0, hpAt(G.wave) * BAL.bossMul[G.wave] * (B.hpF || 1) * (COOP.on ? COOP.hpMul : 1), B.speed * STAGES[G.stage].spd, B.r, { boss: B.key, big: true, name: B.name, reward: BAL.coinUnit * (20 + G.wave * 3), skT: 4, skT2: 6, rage: false, wob: 0, hidden: 0 });
  placeFoe(f); G.foes.push(f); G.boss = f;
  G.stats.foeSeen['b_' + B.key] = 1;
  emit({ k: 'bossSpawn', key: B.key });
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
function gutOdds(big) {
  const shift = Math.min(0.25, G && G.rel ? G.rel.gut : 0), src = big ? BIG_GUT.odds : GUT_ODDS, up = big ? 2 : 1;
  return src.map(([g, p]) => [g, g < 0 ? p - shift : g === up ? p + shift : p]);
}
function gamble(big) {
  if (G.phase !== 'play') return false;
  const cost = big ? BIG_GUT.cost : BAL.gutCost;
  if (G.hon < cost) { toast('혼이 모자라요. 마당을 넘기거나 보스를 잡으면 모여요'); return false; }
  const empty = emptyCells();
  if (!empty.length) { toast('굿판은 빈 칸이 하나 있어야 벌일 수 있어요'); return false; }
  G.hon -= cost; G.stats.guts++;
  let r = Math.random(), tier = -1;
  for (const [g, q] of gutOdds(big)) { if ((r -= q) < 0) { tier = g; break; } }
  if (tier < 0) { emit({ k: 'gutfail', cell: pick(empty) }); toast('부정 탔다… 꽝'); return true; }
  let pool = poolOf(tier);
  const mf = mainFam();
  if (mf >= 0 && Math.random() < BAL.gutBias) { const p2 = pool.filter(t => TYPES[t].fam === FAM_KEYS[mf]); if (p2.length) pool = p2; }
  const t = pick(pool), i = addUnit(t);
  emit({ k: 'gut', cell: i, tier });
  toast(tier >= 3 ? `신이 내렸다! ${TIERS[tier].name} ${TYPES[t].name}` : `굿 효험! ${TIERS[tier].name} ${TYPES[t].name}`);
  return true;
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
  else toast(`${FAMS[FAM_KEYS[g]].name} 동료 공격력 +${Math.round(BAL.upBonus * 100 * G.up[g])}%${mainFam() === g ? ' · 굿판에서 더 잘 나와요' : ''}`);
  return true;
}
function sell(i) {
  const u = G.units[i]; if (!u) return;
  const v = TIERS[TYPES[u.t].tier].sell;
  G.coins += v; u.c--; if (u.c <= 0) G.units[i] = null; G.auraDirty = true;
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
  const n = G.exp.floor, C = CAVE[Math.min(n, CAVE.length) - 1], extra = Math.max(0, n - CAVE.length);
  return Object.assign({}, C, { n, hp: C.hp * Math.pow(2.2, extra) * STAGES[G.stage].hp });
}
function expDps(u) { const T = TYPES[u.t]; return dmgOf(u.t, -1) * (u.c || 1) / (T.cd * G.lvSpd[u.t]) * 1.05; }
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
  return sum * (1 + b.mark) * (1 + b.curse);
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
  const S = STAGES[G.stage];
  const sts = MYTHS.filter(M => S.myths.includes(M.id) && !M.tale && !M.beast).map(M => ({ M, st: recipeState(M) })).filter(o => !o.st.ready).sort((a, b) => b.st.have / b.M.parts.length - a.st.have / a.M.parts.length);
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
    const F = CAVE[Math.min(r.floor, CAVE.length) - 1], scale = Math.pow(1.5, Math.max(0, r.floor - CAVE.length)), rw = F.rw;
    if (rw.coins) { const c = Math.round(rw.coins * scale); G.coins += c; got.push(`엽전 +${fmtC(c)}`); }
    if (rw.hon) { G.hon += rw.hon; got.push(`혼 +${rw.hon}`); }
    if (rw.silver) { G.stats.silverBonus += rw.silver; got.push(`은전 +${fmtC(rw.silver)}`); }
    if (rw.unit) { const t = pick(poolOf(rw.unit)); if (addUnit(t) >= 0) got.push(`${TIERS[rw.unit].name} ${TYPES[t].name}`); else { G.coins += 1000; got.push('엽전 +1,000'); } }
    if (rw.part) { const t = nearestMissingPart(); if (t >= 0 && addUnit(t) >= 0) got.push(`신화 재료 ${TYPES[t].name}`); else { G.hon += 3; got.push('혼 +3'); } }
    if (r.floor >= 6) { const j = Math.min(10, r.floor - 4); G.stats.jade = (G.stats.jade || 0) + j; got.push(`옥 +${j}`); }
    G.exp.floor++; G.exp.wins++; G.stats.caveTop = Math.max(G.stats.caveTop, r.floor);
  }
  emit({ k: 'expEnd', win, cells: back, floor: r.floor, name: r.name, got });
  toast(win ? `굴 ${r.floor}층 ${r.name} 격파! ${got.join(' · ')}` : `굴 ${r.floor}층에서 물러났어요. 동료는 무사히 돌아왔어요`);
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
  const id = TYPES[t].id, S = STAGES[G.stage || 0];
  if (!S.myths.some(m => MYTH_BY[m] && MYTH_BY[m].parts.includes(id))) return 0;
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
  const cnt = { tal: 0, samul: 0, suho: 0, jang: 0 };
  for (let i = 0; i < NCELL; i++) { const u = G.units[i]; if (u && TYPES[u.t].famAura) cnt[TYPES[u.t].fam]++; }
  for (const k of FAM_KEYS) G.famMul[k] = 1 + 0.2 * Math.min(2, cnt[k]);
  let am = 0; for (let i = 0; i < NCELL; i++) { const u = G.units[i]; if (u && TYPES[u.t].allAura) am = Math.max(am, TYPES[u.t].allAura); }
  G.allMul = 1 + am;
  for (let i = 0; i < NCELL; i++) {
    let n = 0, m = 0, r = 0, bo = 0;
    for (const j of NEIGH[i]) { const u = G.units[j]; if (!u) continue; const T = TYPES[u.t]; if (T.aura) n++; if (T.dmgAura) m++; if (T.rngAura) r++; if (T.bossAura) bo++; }
    G.spd[i] = 1 + 0.25 * Math.min(2, n);
    G.dmgN[i] = 1 + 0.2 * Math.min(2, m);
    if (!G.rngB) G.rngB = Array(NCELL).fill(0);
    G.rngB[i] = 0.5 * Math.min(2, r);
    if (!G.bossN) G.bossN = Array(NCELL).fill(1);
    G.bossN[i] = 1 + 0.15 * Math.min(2, bo);
    let ua = 0; for (const j of NEIGH[i]) { const u = G.units[j]; if (u && TYPES[u.t].ultAura) ua = Math.max(ua, TYPES[u.t].ultAura); }
    if (!G.ultN) G.ultN = Array(NCELL).fill(1);
    G.ultN[i] = 1 + ua;
  }
}
function rngOf(T, i) { return T.range > 50 ? T.range : T.range + ((i >= 0 && G.rngB && G.rngB[i]) || 0); }
function relMul(T) { const r = G.rel; return r ? (1 + r.atk + (r.fam[T.fam] || 0)) * (T.tier >= 4 ? 1 + r.myth : 1) : 1; }
const upOf = T => T.tier >= TALE_TIER ? Math.max(G.up[0], G.up[1], G.up[2], G.up[3]) : G.up[FAM_IX[T.fam]];
function dmgOf(t, i) { const T = TYPES[t], fb = G.famBuff && G.famBuff[T.fam]; return (G.allMul || 1) * T.dmg * TIER_MUL[T.tier] * (1 + BAL.upBonus * upOf(T)) * G.lvMul[t] * G.famMul[T.fam] * ((i >= 0 && G.dmgN[i]) || 1) * (fb && fb.t > 0 ? fb.mul : 1) * relMul(T); }
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
    case 'uibyeongdae': G.famBuff.jang = { mul: 1.5, t: 6 }; for (const f of inRange(x, y, 3)) { damage(f, base * 2, T, false); if (G.phase !== 'play') return true; } break;
    case 'haedal': {
      const tgt = live.reduce((b, f) => (f.boss && !b.boss) || ((!!f.boss === !!b.boss) && f.hp > b.hp) ? f : b, live[0]); ev.tx = tgt.x; ev.ty = tgt.y;
      damage(tgt, base * 15, T, true); if (G.phase !== 'play') return true;
      for (const f of live) if (!f.dead) stunFoe(f, 2);
      break;
    }
    case 'hokburi': {
      const tgt = live.reduce((b, f) => f.hp > b.hp ? f : b, live[0]); ev.tx = tgt.x; ev.ty = tgt.y;
      damage(tgt, tgt.hp * (tgt.big ? 0.06 : 0.6) + base * 5, T, true); if (G.phase !== 'play') return true;
      G.hon += 2; giveCoin(x, y, BAL.coinUnit * (5 + Math.floor(G.wave / 4)));
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
    case 'jujak': for (const f of live) { damage(f, base * 3, T, false); if (G.phase !== 'play') return true; if (!f.dead) { const prev = f.burnT > 0 ? f.burnDps : 0; f.burnT = 4; f.burnUid = HIT_UID; f.burnDps = Math.max(prev, base * 0.8); } } break;
    case 'baekho': for (const f of live) { stunFoe(f, 1.5); f.markAmt = f.markT > 0 ? Math.max(f.markAmt || 0, 0.3) : 0.3; f.markT = Math.max(f.markT, 5); } break;
    case 'hyeonmu': for (const f of live) { damage(f, base * 4, T, false); if (G.phase !== 'play') return true; if (!f.dead) knock(f, 1.5); } break;
    case 'yongwang': {
      const c = topClusters(2.2, 1)[0]; if (!c) return false; ev.tx = c.x; ev.ty = c.y;
      for (const f of inRange(c.x, c.y, 2.2)) { damage(f, base * 5 * (f.boss ? 2 : 1), T, true); if (G.phase !== 'play') return true; if (!f.dead) stunFoe(f, f.big ? 1 : 2.5); }
      break;
    }
    case 'hwangryong': for (const f of live) { damage(f, base * 5 * (f.boss ? 2 : 1), T, true); if (G.phase !== 'play') return true; } break;
    case 'simcheong': G.lotusT = 6; for (const f of live) slowFoe(f, 0.6, 3); break;
    case 'seolmundae': { const c = topClusters(2.4, 1)[0]; if (!c) return false; ev.tx = c.x; ev.ty = c.y; G.pend.push({ t: 0.8, x: c.x, y: c.y, dmg: base * 6, crit: true, src: T, kind: 'mountain' }); break; }
  }
  emit(ev);
  return true;
}
function unitDmg(u, critBonus) {
  const T = TYPES[u.t];
  let amt = dmgOf(u.t, u.ci == null ? -1 : u.ci);
  const crit = Math.random() < (T.crit || 0.05) + (critBonus || 0);
  if (crit) amt *= (T.critMul || 2);
  return { amt, crit };
}
function pickTarget(x, y, range) {
  const r2 = range * range; let best = null, bs = -1;
  for (const f of G.foes) {
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
  for (const f of G.foes) {
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
  if (f.markT > 0) amt *= 1 + f.markAmt;
  if (f.curseT > 0) amt *= 1 + f.curseAmt;
  if (f.boss && G.rel && G.rel.boss) amt *= 1 + G.rel.boss;
  if ((f.boss || f.chal) && HIT_UID && G.bossN) { const c = UID_CELL[HIT_UID]; if (c != null && G.bossN[c] > 1) amt *= G.bossN[c]; }
  const res = (f.boss === 'bulgasari' || f.armor) && src.tier <= 1;
  if (res) amt *= 0.5;
  if (f.boss && COOP.on) COOP.bossDmg += Math.min(amt, Math.max(0, f.hp));
  f.hp -= amt; f.flash = 0.09;
  if (!src.dot && (crit || src.tier >= 4 || f.big)) emit({ k: 'num', x: f.x, y: f.y, v: amt, crit: !!crit, res, boss: !!f.big });
  if (f.hp <= 0) kill(f);
  return amt;
}
function kill(f, final) {
  if (f.dead) return;
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
    G.hon += 3; G.boss = null; G.stats.bossKills++;
    if (G.wave >= LAST_WAVE) { endGame('win'); return; }
    emit({ k: 'banner', main: `${josa(f.name, '을', '를')} 물리쳤다!`, sub: `엽전 +${fmtC(f.reward)} · 혼 +3` });
    G.waveT = Math.min(G.waveT, 3);
  }
}
function slowFoe(f, amt, dur) { if (f.big) amt *= 0.5; f.slowAmt = f.slowT > 0 ? Math.max(f.slowAmt, amt) : amt; f.slowT = Math.max(f.slowT, dur); }
function stunFoe(f, dur) { if (f.big) dur *= 0.25; f.stunT = Math.max(f.stunT, dur); }
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
        else damage(cur, amt * Math.pow(0.88, k), src, crit && k === 0);
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
        if (T.pct) a += f.max * (f.big ? T.pct * 0.2 : T.pct);
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
      for (const f of G.foes) {
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
      for (const f of G.foes) {
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
        if (!tgt.big) { emit({ k: 'devour', x: tgt.x, y: tgt.y }); kill(tgt, true); }
        else { damage(tgt, amt * 2, src, true); emit({ k: 'bite', x: tgt.x, y: tgt.y, big: 1 }); }
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
        for (const f of G.foes) {
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
function resolvePend(p) {
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
    damage(f, p.dmg, T, p.crit);
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
    for (const f of G.foes) {
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
    for (const f of G.foes) {
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
      for (let k = 0; k < 4 && live.length; k++) { const f = live.splice(Math.floor(Math.random() * live.length), 1)[0]; pts.push({ x: f.x, y: f.y }); damage(f, base * 2, T, true); if (G.phase !== 'play') return; }
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
      for (const f of G.foes.slice()) { if (f.dead || f.hidden > 0) continue; damage(f, base * (f.big ? 10 : 5), T, false); if (G.phase !== 'play') return; if (!f.dead) { knock(f, 1.0); slowFoe(f, 0.4, 2); } }
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
  u.cd = T.cd / G.spd[i] / (G.charmT > 0 ? CHARM.spd : 1) / (G.lotusT > 0 ? 1.6 : 1) * G.lvSpd[u.t] / (T.kind === 'pounce' ? 1 : (u.c || 1));
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
  for (let i = 0; i < CHALS.length; i++) if (G.chalCd[i] > 0) G.chalCd[i] = Math.max(0, G.chalCd[i] - dt);
  for (const k in G.famBuff) { const b = G.famBuff[k]; if (b.t > 0) b.t -= dt; }
  if (G.charmT > 0) G.charmT -= dt;
  if (G.lotusT > 0) G.lotusT -= dt;
  if (G.skyT > 0) { G.skyT -= dt; if (G.skyT <= 0) G.sky = null; }
  expTick(dt);
  for (const f of G.foes) {
    if (f.dead) continue;
    if (f.chal) { f.chalT -= dt; if (f.chalT <= 0) { f.dead = true; emit({ k: 'chalFail', id: f.chal, x: f.x, y: f.y }); toast(`${f.name}가 달아났어요`); continue; } }
    f.flash = Math.max(0, f.flash - dt); f.age += dt;
    if (f.burnT > 0) { f.burnT -= dt; HIT_UID = f.burnUid || 0; damage(f, f.burnDps * dt, DOT); HIT_UID = 0; if (f.dead) continue; }
    if (f.markT > 0) f.markT -= dt;
    if (f.curseT > 0) f.curseT -= dt;
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

