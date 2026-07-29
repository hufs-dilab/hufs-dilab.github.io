# hufs-dilab.github.io

한국외국어대학교 **DILAB** (Data Intelligence Lab) 공식 홈페이지 소스.

- 배포 주소: <https://dilab.hufs.ac.kr> (GitHub Pages, `CNAME`)
- `main` 브랜치에 머지되면 자동 배포된다.

## 스택

백엔드 없는 정적 사이트다. 프레임워크·빌드 도구·패키지 매니저를 쓰지 않고 vanilla HTML/CSS/JS만 사용한다.
따라서 홈페이지에 나오는 모든 데이터(멤버, 논문, 마감일 등)는 HTML 안에 직접 들어 있다.

## 디렉토리

| 경로 | 내용 |
|---|---|
| `index.html` | 메인 페이지 (소개, 연구 하이라이트, 최근 소식) |
| `people/` | 구성원 소개 + 프로필 사진 |
| `publications/` | 논문 목록 |
| `deadlines/` | 학회 마감 트래커 (30개 학회, 인라인 JSON 기반) |
| `join/` | 지원 안내 |
| `style.css`, `script.js` | 전 페이지 공통 스타일·스크립트 |
| `UI/`, `fonts/`, `main-image/`, `background-image/`, `research-highlight/` | 로고·폰트·이미지 자산 |

## 로컬에서 보기

빌드 단계가 없으니 정적 서버 하나만 띄우면 된다. (`file://`로 열면 절대 경로 자산이 깨진다.)

```bash
python3 -m http.server 8123
# http://localhost:8123 접속
```

## 수정 규칙

- 페이지를 고치면 그 페이지 상단의 `Last Update: YYYY-MM-DD` 표기도 함께 갱신한다.
- `style.css`의 CSS 변수(`--color-accent` 등) 같은 디자인 토큰은 임의로 바꾸지 않는다. 색을 바꾸면 전 페이지에 영향이 간다.
- 외부 라이브러리 추가는 지양한다.

### 학회 마감 트래커 (`deadlines/`)

데이터는 `deadlines/index.html` 안의 `<script type="application/json" id="deadlines-data">` 블록 하나에 모여 있다.
별도 JSON 파일은 없다. 스키마(필수 필드, `upcoming`/`history` 구조), 마감 시각 KST 변환(AoE → 익일 20:59),
학회별 URL 패턴, 갱신 절차는 [`deadlines/CLAUDE.md`](deadlines/CLAUDE.md)에 정리돼 있다.

값을 넣기 전에 지켜야 할 것:

- 마감일은 **논문 제출 마감** 기준으로 통일한다 (commitment·camera-ready 마감을 끌어오지 않는다).
- 공식 학회 페이지에 명시된 정보만 반영한다. 제3자 마감 트래커는 참고용일 뿐 확정 근거가 아니다.
- URL은 연도 패턴으로 추측하지 말고, HTTP 200 + 실제 학회 컨텐츠까지 확인한 것만 넣는다.

## AI 도구로 작업할 때

리포 전반의 작업 규칙은 [`CLAUDE.md`](CLAUDE.md), 마감 트래커 규칙은 [`deadlines/CLAUDE.md`](deadlines/CLAUDE.md)에 있다.
Claude Code 등에서 `deadlines 갱신해줘`라고 하면 룰북에 정의된 자동 갱신 절차(분야별 병렬 검증 → 변경 검토 → JSON 갱신 → 전수 URL 재검증)가 실행된다.

## 연혁

2025년 12월 29일부터 2026년 1월 4일까지 연구실 겨울방학 이벤트로 처음 만들었다.
별도 UI/UX 팀 없이 AI 코딩 도구(Cursor, Antigravity, Claude Code)를 적극적으로 활용해 개발했다.
