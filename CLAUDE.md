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

사용자가 다음 문구 중 하나를 말하면 `deadlines/CLAUDE.md` Section 11의 자동 갱신 절차 (6 sub-agent 병렬 검증 → 결과 통합 → JSON 갱신 → commit·push) 실행:

- `deadlines 갱신해줘`
- `deadlines 업데이트해줘`
- `/update-deadlines`
