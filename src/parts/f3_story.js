/* ---------- 전래동화 수집: the first time you beat a boss or make a mythic, its story opens in the codex ----------
   short retellings of the old tales. each new page pays a little 옥 */
const STORIES = {
  b_beom: '부산 장산에 산다는 하얀 털의 짐승이에요. 아는 사람 목소리를 그대로 흉내 내서 사람을 산속 깊이 불러들인대요. 옛이야기라기보다 요즘 사람들 사이에서 퍼진 괴담인데, 그래서 더 으스스하죠.',
  b_gumiho: '천 년을 산 여우는 꼬리가 아홉 개가 되고 사람으로 둔갑할 수 있다고 해요. 고운 여인의 모습으로 나타나 사람을 홀리고, 사람의 간을 먹으면 진짜 사람이 된다는 이야기가 많아요. 대개는 마지막 하루를 앞두고 정체가 들통나요.',
  b_imugi: '용이 되지 못한 큰 뱀이에요. 물속에서 천 년을 기다려 여의주를 얻으면 하늘로 올라 용이 된대요. 그런데 오르는 순간 사람 눈에 띄면 그대로 떨어져 이무기로 남는다고 해요.',
  b_bulgasari: '고려가 저물 무렵 송도에 나타났다는 괴물이에요. 밥알로 빚은 작은 짐승이 바늘을 먹더니 솥이며 칼이며 쇠붙이를 다 먹어 치우고 집채만 해졌대요. 칼로도 창으로도 죽일 수 없어 불가살이라 불렸는데, 불로는 죽일 수 있어서 불가살이라는 말장난도 남았어요.',
  b_geumdwaeji: '신라 때 어느 고을 원님의 부인이 금빛 돼지에게 잡혀갔대요. 부인은 금돼지가 사슴 가죽을 무서워한다는 걸 알아내 물리쳤고, 돌아와 낳은 아이가 훗날 최치원이 되었다는 이야기가 전해져요.',
  b_daejeok: '땅속 나라의 큰 도적이 마을 처녀들을 잡아갔대요. 한 장수가 깊은 굴을 타고 내려가 대적을 물리치고 처녀들을 구했지만, 위에서 기다리던 동료가 줄을 끊어 버렸어요. 장수는 갖은 고생 끝에 땅 위로 돌아와 배신자를 벌했다고 해요.',
  b_heukryong: '먹구름을 몰고 다니는 검은 용이에요. 흰 용과 싸우던 흑룡을 활 잘 쏘는 사람이 쏘아 맞혀 흰 용을 도왔다는 이야기가 여러 고을에 전해져요. 흑룡이 나타나면 하늘이 어두워지고 큰비가 온대요.',
  b_yeomra: '저승을 다스리며 죽은 사람이 살아서 한 일을 심판하는 왕이에요. 착하게 산 사람은 좋은 곳으로, 나쁘게 산 사람은 지옥으로 보낸대요. 제주 이야기에서는 강림도령이 이 염라대왕을 이승으로 잡아 오기도 해요.',
  m_samulpae: '꽹과리, 징, 장구, 북 네 가지 악기로 노는 판이에요. 꽹과리는 천둥, 징은 바람, 장구는 비, 북은 구름 소리라고들 해요. 마을 풍물굿의 가락을 1978년에 무대에 맞게 다듬은 게 지금의 사물놀이예요.',
  m_uibyeongdae: '나라에 큰 난리가 나면 벼슬도 없는 백성과 선비들이 스스로 칼을 들었어요. 임진왜란 때 곽재우는 붉은 옷을 입고 앞장서 홍의장군이라 불렸지요. 이름 없는 의병들이 팔도 고을마다 일어나 나라를 지켰어요.',
  m_geobukseon: '임진왜란 때 이순신 장군이 앞세운 배예요. 등을 덮개로 덮어 적이 뛰어들지 못하게 하고, 용머리와 옆구리에서 포를 쏘았대요. 적진 한가운데로 뛰어들어 휘젓는 돌격선이었어요.',
  m_choimuseon: '고려 말, 왜구가 바닷가를 괴롭히던 때 화약 만드는 법을 알아낸 사람이에요. 나라에 화통도감을 두어 화포를 만들었고, 진포에서 그 화포로 왜구의 배 수백 척을 불태웠대요.',
  m_bari: '왕의 일곱째 딸로 태어나 버려진 공주예요. 부모가 큰 병에 걸리자 아무도 가지 않으려던 저승길을 홀로 걸어 약수를 구해 왔대요. 그래서 바리공주는 죽은 이를 저승으로 이끄는 무당들의 신이 되었어요.',
  m_cheoyong: '신라 헌강왕 때 동해 용왕의 아들 처용이 서라벌에 와서 살았어요. 역신이 아내를 넘보자 처용은 화내지 않고 노래하며 춤을 췄고, 감복한 역신은 처용 얼굴만 봐도 들어오지 않겠다고 약속했대요. 그래서 사람들은 문에 처용 얼굴을 붙였어요.',
  m_yeongno: '남쪽 바닷가 탈춤에 나오는 상상의 짐승이에요. 양반을 아흔아홉 명 잡아먹었고, 하나만 더 먹으면 하늘에 오른다며 양반을 쫓아다녀요. 거들먹거리던 양반이 쩔쩔매는 모습에 구경꾼들이 크게 웃었지요.',
  m_gangrim: '제주에 전해 오는 이야기예요. 원님의 명을 받은 강림은 산 사람의 몸으로 저승에 가서 염라대왕을 이승으로 데려왔대요. 그 솜씨에 반한 염라대왕이 강림을 저승차사로 삼았다고 해요.',
  m_saja: '정월이면 사자탈을 쓰고 집집을 돌며 잡귀를 쫓았어요. 사자가 마당에서 한바탕 놀고 나면 그해에는 나쁜 기운이 얼씬도 못 한다고 믿었지요. 북청 사자놀음이 그 놀이를 지금까지 이어 오고 있어요.',
  m_daejanggun: '마을 어귀에 서서 마을을 지키는 장승이에요. 천하대장군과 지하여장군이 짝을 이뤄 서서 나쁜 기운과 병이 마을에 들어오지 못하게 막는대요. 길 가는 사람에게는 이정표 노릇도 했어요.',
  m_yongwang: '바다 깊은 곳 용궁을 다스리는 왕이에요. 병이 들어 토끼 간을 구하려다 꾀 많은 토끼에게 속은 이야기도 있고, 인당수에 몸을 던진 심청을 구해 연꽃에 태워 보낸 이야기도 있어요. 뱃사람들은 바다에 나가기 전 용왕께 빌었지요.',
  m_kkokdusoe: '남사당패의 우두머리를 꼭두쇠라 불렀어요. 남사당은 마을을 떠돌며 풍물, 대접 돌리기, 땅재주, 줄타기, 탈놀음, 인형극으로 사람들을 웃기고 울렸대요. 꼭두쇠는 그 모든 판을 이끄는 사람이었어요.',
  m_gimseondal: '평양에 살던 꾀쟁이예요. 물장수들에게 미리 엽전을 쥐여 주고 물 값을 받는 척해서, 대동강 물이 제 것인 양 한양 상인에게 비싸게 팔았대요. 닭을 봉황이라 속여 판 장수를 거꾸로 골탕 먹인 일로 봉이 김선달이라 불렸어요.',
  m_jangbogo: '신라 사람으로 당나라에 건너가 군인으로 이름을 떨쳤어요. 돌아와 완도에 청해진을 세우고 바다의 해적을 몰아냈고, 신라와 당과 일본을 잇는 바닷길 무역을 손에 쥐어 해상왕이라 불렸어요.',
  m_honggildong: '판서의 아들이지만 서자로 태어나 아버지를 아버지라 부르지 못했대요. 집을 떠난 길동은 활빈당을 만들어 탐관오리의 재물을 빼앗아 가난한 백성에게 나눴고, 나중엔 바다 건너 율도국을 세웠어요. 허균이 쓴 소설로 전해져요.',
  m_seolmundae: '제주를 만든 거인 할머니예요. 치마폭에 흙을 담아 날라 한라산을 쌓았고, 치마 구멍으로 흘린 흙덩이가 오름이 되었대요. 물이 깊다는 물장오리에 들어가 깊이를 재다 빠졌다는 이야기도 있어요.',
  m_bihyeong: '신라 진지왕의 혼령과 도화녀 사이에서 태어났다고 해요. 밤마다 귀신들과 어울려 놀았는데, 왕이 시키자 귀신 무리를 부려 하룻밤 만에 다리를 놓았대요. 그래서 사람들은 비형랑의 이름을 적어 붙여 귀신을 쫓았어요.',
  m_cheongryong: '동쪽을 지키는 푸른 용이에요. 고구려 무덤 벽에는 청룡, 백호, 주작, 현무 네 신이 방향마다 그려져 죽은 이를 지켰어요. 청룡은 봄과 나무의 기운을 맡는대요.',
  m_jujak: '남쪽을 지키는 붉은 새예요. 여름과 불의 기운을 맡고, 날개를 펴면 불꽃이 인다고 해요. 고구려 강서대묘 벽화의 주작은 지금 봐도 날아오를 듯해요.',
  m_baekho: '서쪽을 지키는 흰 호랑이예요. 가을과 쇠의 기운을 맡아 나쁜 기운을 막는대요. 집터나 묏자리를 볼 때도 좌청룡 우백호라 해서 양옆의 산을 청룡과 백호로 여겼어요.',
  m_hyeonmu: '북쪽을 지키는 신으로 거북과 뱀이 한 몸으로 얽혀 있어요. 겨울과 물의 기운을 맡고, 단단한 등딱지로 무엇이든 막아 낸대요.',
  m_hwangryong: '네 방향의 한가운데를 맡는 누런 용이에요. 청룡, 백호, 주작, 현무를 아우르는 으뜸이고 땅의 기운을 다스린대요. 신라는 궁궐을 지으려던 자리에 황룡이 나타나자 그곳에 황룡사를 지었어요.',
  m_haedal: '떡 하나 주면 안 잡아먹지 하던 호랑이가 엄마를 잡아먹고, 엄마 옷을 입고 오누이를 찾아왔어요. 나무 위로 도망친 오누이가 하늘에 빌자 튼튼한 동아줄이 내려와 해와 달이 되었대요. 썩은 동아줄을 잡은 호랑이는 수수밭에 떨어졌고, 그래서 수숫대가 붉대요.',
  m_hokburi: '턱에 큰 혹이 달린 영감이 산속 빈집에서 노래를 불렀더니 도깨비들이 몰려왔대요. 노래가 어디서 나오냐 묻자 영감은 혹에서 나온다고 둘러대, 혹도 떼고 보물도 받았어요. 이를 흉내 낸 욕심쟁이 영감은 혹을 하나 더 붙이고 돌아왔대요.',
  m_namukkun: '사냥꾼에게 쫓기던 사슴을 숨겨 준 나무꾼이 그 보답으로 선녀의 날개옷 숨기는 법을 배웠어요. 아이 셋을 낳기 전엔 돌려주지 말라 했는데, 둘일 때 날개옷을 보여 주는 바람에 선녀는 아이들을 안고 하늘로 올라갔대요. 나무꾼은 두레박을 타고 하늘로 따라 올라갔어요.',
  m_simcheong: '눈먼 아버지가 눈을 뜨게 하려고 공양미 삼백 석에 몸을 팔아 인당수에 뛰어든 효녀예요. 용왕이 심청을 구해 연꽃에 실어 보냈고, 왕비가 된 심청이 연 맹인 잔치에서 아버지는 눈을 번쩍 떴대요.',
};
const STORY_JADE = 5;
/* bosses first in the order you meet them, then the mythics as the recipe book lists them */
function storyKeys() {
  const bosses = [];
  for (const S of STAGES) for (const w of Object.keys(S.bosses).map(Number).sort((a, b) => a - b)) { const k = 'b_' + S.bosses[w]; if (!bosses.includes(k) && STORIES[k]) bosses.push(k); }
  for (const k of Object.keys(BOSS_DEF)) if (!bosses.includes('b_' + k) && STORIES['b_' + k]) bosses.push('b_' + k);
  return bosses.concat(MYTHS.map(M => 'm_' + M.id).filter(k => STORIES[k]));
}
const storyN = () => storyKeys().filter(k => SAVE.stories && SAVE.stories[k]).length;
function storyTitle(k) { return k.startsWith('b_') ? (BOSS_DEF[k.slice(2)] || {}).name || '' : TYPES[TYPE_IX[k.slice(2)]].name; }
/* a new page: a few 옥, a quiet toast, and the codex has it */
function unlockStory(k) {
  if (!STORIES[k] || !SAVE.stories || SAVE.stories[k]) return false;
  SAVE.stories[k] = 1; SAVE.jade = (SAVE.jade || 0) + STORY_JADE; SAVE.stats.jadeEarned = (SAVE.stats.jadeEarned || 0) + STORY_JADE;
  persist();
  setTimeout(() => toast(`이야기 한 장이 열렸어요 · ${storyTitle(k)} · 옥 +${STORY_JADE} · 도감 이야기에서 볼 수 있어요`), 1400);
  return true;
}
/* players from before this existed: what they already met opens quietly, without the 옥 */
function storyBackfill(s) {
  s.stories = s.stories && typeof s.stories === 'object' ? s.stories : {};
  for (const id in s.made || {}) if (s.made[id] > 0 && STORIES['m_' + id]) s.stories['m_' + id] = s.stories['m_' + id] || 1;
  /* bossBest holds the furthest boss wave beaten in each 고을, so every boss up to it was beaten */
  STAGES.forEach((S, st) => { const top = (s.bossBest && s.bossBest[st]) || 0; for (const w in S.bosses) if (+w <= top && STORIES['b_' + S.bosses[w]]) s.stories['b_' + S.bosses[w]] = s.stories['b_' + S.bosses[w]] || 1; });
}
function storyHTML() {
  return storyKeys().map(k => {
    const open = SAVE.stories && SAVE.stories[k], boss = k.startsWith('b_'), id = k.slice(2);
    const img = boss ? foePortraitURL(k, 52, !open) : portraitURL(id, 52, !open);
    const T = boss ? null : TYPES[TYPE_IX[id]];
    const game = boss ? (BOSS_DEF[id] || {}).note : T && T.skill ? `${T.skill}${T.desc ? ` · ${T.desc}` : ''}` : '';
    if (!open) return `<div class="story is-lock"><img alt="" src="${img}"><div><div class="nm">???<small>${boss ? '보스' : '신화'}</small></div><p>${boss ? '이 보스를 처음 물리치면 열려요' : '이 신화를 처음 만들면 열려요'}</p></div></div>`;
    return `<div class="story"><img alt="" src="${img}"><div><div class="nm">${esc(storyTitle(k))}<small>${boss ? '보스' : '신화'}</small></div><p>${esc(STORIES[k])}</p>${game ? `<p class="sg">게임에선 · ${esc(game)}</p>` : ''}</div></div>`;
  }).join('');
}
/* the hidden 합동기: only the ones you found, and how many are still out there */
function comboHTML() {
  const found = COMBOS.filter(C => SAVE.combos && SAVE.combos[C.id]);
  const rows = found.map(C => {
    const A = TYPES[TYPE_IX[C.a]], B = TYPES[TYPE_IX[C.b]];
    return `<div class="story combo"><span class="cpair"><img alt="" src="${portraitURL(A.id, 40)}"><img alt="" src="${portraitURL(B.id, 40)}"></span><div><div class="nm">${esc(C.name)}<small>${esc(A.name)} · ${esc(B.name)} · ${SAVE.combos[C.id]}번</small></div><p>${esc(C.line)}</p></div></div>`;
  }).join('');
  const left = COMBOS.length - found.length;
  return rows + (left ? `<div class="story is-lock"><div><div class="nm">아직 못 찾은 합동기 ${left}개</div><p>둘이서 할 때 한 이야기에서 짝을 이루는 신화가 두 마당에 하나씩 있으면 가운데 길에서 같이 터져요</p></div></div>` : '<p class="meta">합동기를 모두 찾았어요!</p>');
}
