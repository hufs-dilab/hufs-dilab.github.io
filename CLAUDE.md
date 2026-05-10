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

## 일반 규칙

- 모든 페이지 수정 시 페이지 상단의 `Last Update: YYYY-MM-DD` 표기가 있다면 갱신
- `style.css` 의 CSS 변수 (`--color-accent` 등) 와 디자인 토큰을 임의 변경하지 말 것
- 외부 라이브러리 추가는 지양, 가능한 vanilla JS / CSS 유지
