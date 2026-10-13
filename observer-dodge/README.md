# 옵저버 피하기

옵저버가 비추는 주황색 탐지 범위를 피해 끝까지 살아남는 게임이에요. 방 코드 하나로 친구들과 최대 8명까지 같이 할 수 있어요.

바로 하기 https://jayjunhyoung-crypto.github.io/joseon-defense/observer-dodge/

## 같이 하기

방 만들기를 누르고 네 글자 코드나 초대 링크를 친구에게 보내면 돼요. 로그인은 필요 없어요.

## 명예의 전당

가장 오래 버틴 시간이 순위에 올라가요. 한 판에 두 명 이상 있을 때 마지막까지 살아남으면 1승이 쌓여요.

지금은 같은 방에서 만난 사람끼리 기록이 합쳐져요. 친구가 혼자 한 기록은 다음에 같은 방에 들어왔을 때 서로의 순위표에 올라가요.

각자 혼자 한 기록까지 바로 한 순위표에 모으고 싶으면 무료 Firebase 데이터베이스를 연결하면 돼요.

1. https://console.firebase.google.com 에서 새 프로젝트를 만들어요
2. 빌드 메뉴의 Realtime Database에서 데이터베이스 만들기를 눌러요. 위치는 싱가포르(asia-southeast1), 시작은 잠금 모드로 골라요
3. 규칙 탭에 아래 내용을 붙여 넣고 게시해요
4. 데이터 탭 위에 보이는 주소(https://로 시작하고 firebasedatabase.app으로 끝나요)를 이 폴더의 `config.js`에 넣어요

```json
{
  "rules": {
    "obsdodge": {
      "v1": {
        "scores": {
          ".read": true,
          "$pid": {
            ".write": "$pid.matches(/^p_[a-z0-9]+$/) && $pid.length <= 18",
            ".validate": "newData.hasChildren(['n','c','b','g','w','t']) && newData.child('n').isString() && newData.child('n').val().length >= 1 && newData.child('n').val().length <= 10 && newData.child('b').isNumber() && newData.child('b').val() > 0 && newData.child('b').val() <= 3600 && newData.child('c').isNumber() && newData.child('g').isNumber() && newData.child('w').isNumber() && newData.child('t').isNumber() && (!data.exists() || newData.child('b').val() >= data.child('b').val())"
          }
        }
      }
    }
  }
}
```

기록은 브라우저에 저장돼서, 같은 사람이라도 폰과 컴퓨터는 따로 순위에 올라가요.
