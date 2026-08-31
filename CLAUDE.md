# DILAB 웹사이트 작업 규칙

HUFS DILAB 공식 사이트 (`hufs-dilab.github.io`) 정적 페이지 레포.

## 구조

- `index.html` / `people/` / `publications/` / `deadlines/` / `join/` — 각 섹션
- `style.css`, `script.js` — 공통 스타일/스크립트
- `UI/` — 로고·이미지

## 정기 유지보수 작업

| 항목 | 위치 | 절차 문서 |
|---|---|---|
| Conference deadlines | `deadlines/index.html` (inline JSON) | `deadlines/CLAUDE.md` |
| 멤버 정보 | `people/index.html` | (정해지면 추가) |
| 논문 목록 | `publications/index.html` | (정해지면 추가) |
| Recent News | `index.html` `#news` | 아래 「News 항목 규칙」 |

## News 항목 규칙 (`index.html` `#news`)

`pub-item` 3단 구조를 유지한다 — `pub-meta`=날짜, `pub-title`=사건(링크), `<p>`=상세.

- 논문: 제목 `One paper got accepted in <학회>.` / 상세 = 논문 제목
- 연구과제: 제목 `Selected for the <사업명(국문 병기)>, <시작–종료>.` /
  상세 = `영문 과제명 (국문 과제명)`
- 항목은 지우지 않고 최신 것을 위에 쌓는다.
- 금액·과제번호는 적지 않는다 (학계 관례).

## 일반 규칙

- 모든 페이지 수정 시 페이지 상단의 `Last Update: YYYY-MM-DD` 표기가 있다면 갱신
- `style.css` 의 CSS 변수 (`--color-accent` 등) 와 디자인 토큰을 임의 변경하지 말 것
- 외부 라이브러리 추가는 지양, 가능한 vanilla JS / CSS 유지

## 자동 갱신 트리거

사용자가 다음 문구 중 하나를 말하면 `deadlines/CLAUDE.md` Section 11의 자동 갱신 절차 (6 sub-agent 병렬 검증 -> 결과 통합 -> JSON 갱신 -> 시각 검증 -> 변경 보고 후 정지) 실행. **commit·push는 명시 요청 시에만** — 옛 룰북의 "자동 commit+push"는 전역 git 규칙과 충돌해 2026-08-03에 삭제했다:

- `deadlines 갱신해줘`
- `deadlines 업데이트해줘`
- `/update-deadlines`

## 원격·권한 (혼자 작업할 때 걸리는 것)

- 공용 org 리포라 다른 사람 커밋이 자주 올라온다 -> 갱신 작업 **전에 `git fetch` / `git pull --rebase`**. (2026-07-29 작업 중 main이 앞서 나가 KCC 추가·WMT sub-event와 충돌)
- `main`에 `dont-push-main-directly` 룰셋(active). **PR 머지가 `REVIEW_REQUIRED`로 막히고 본인 PR 셀프 승인이 안 되므로**, 혼자 작업할 땐 `gh pr merge <N> --squash --admin`으로 우회한다 (2026-07-29 확인). 우회했으면 사용자에게 그 사실을 알린다.
- repo는 `hufs-dilab` **org** 소유이고 org Base permission이 `Read`다. **org 멤버면 org의 모든 repo를 자동으로 읽는다**(비공개 `structural-overthinking` 포함). 그래서 `repos/.../collaborators` API는 org 멤버까지 섞어 뱉으니 직접 붙은 사람만 보려면 `?affiliation=direct`.
- **사람이 나갈 때 확인 순서**: repo collaborator -> org 멤버(`https://github.com/orgs/hufs-dilab/people`) -> org 대기중 초대 -> 비공개 repo direct collaborator. 마지막을 빼먹으면 org에서 빼도 접근이 남는다. 팀을 지워도 org 멤버십은 안 없어진다.
- hist0613은 org admin이지만 admin은 권한이지 watch가 아니라서, collaborator로 추가돼야 repo 알림이 온다.

## Recent News 게재 기준 (2026-08-14)

뉴스는 **확정된 사건**만 올린다 — accept·수상처럼 남는 게 있어야 한다. 리더보드 순위만으로는 올리지 않는다(공식 결과와 어긋나면 정정해야 하고, 참가 팀 수에 따라 숫자가 과장되어 보인다).
