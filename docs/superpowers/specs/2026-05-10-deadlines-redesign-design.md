# Deadlines Page Redesign — Design Spec

**Date:** 2026-05-10
**Scope:** `deadlines/` 페이지의 데이터 구조·UI·문서 전면 개편
**Goal:** 학회 단위 매트릭스 뷰 + 과거 데이터 누적으로 매년 효율적 갱신, single-file portability, agent-friendly 운영

---

## 1. Motivation

기존 `deadlines/deadlines.json` 은 **(학회+연도)** 평면 entry. 마감 지난 항목을 차회 predicted로 옮기면 과거 정보가 사라져 패턴 활용 불가.

목표:
- **모든 관심 학회는 항상 관리됨** — full list 유지
- **과거 회차 데이터 누적** — 다음 회차 갱신 시 LLM/agent가 처음부터 추측하지 않고 누적 패턴 활용
- **사이트 가시성** — 매트릭스 뷰로 패턴 한눈에
- **Single-file** — 다른 AI 도구가 fetch 없이 데이터 접근
- **Agent 신뢰도** — 잘 정리된 CLAUDE.md로 작업 룰 명확화

---

## 2. Data Model (`deadlines.json` 또는 inline JSON)

### Schema

```json
{
  "schema_version": 3,
  "conferences": [
    {
      "name": "AAAI",
      "full_name": "AAAI Conference on Artificial Intelligence",
      "tags": ["AI"],
      "url_pattern": "https://aaai.org/conference/aaai/aaai-{YY}/",
      "url_fallback": "https://aaai.org/conference/aaai/",
      "upcoming": {
        "year": "2027",
        "date": "2026-08-01 20:59",
        "venue": "Montréal, Canada",
        "venue_confirmed": true,
        "url": "https://aaai.org/conference/aaai/",
        "predicted": false,
        "sub_events": [
          {
            "label": "Student Abstract",
            "date": "2026-09-15 20:59",
            "predicted": true,
            "url": "https://aaai.org/conference/aaai/"
          }
        ]
      },
      "history": [
        { "year": "2026", "date": "2025-08-07 20:59", "venue": "Philadelphia, USA", "url": "https://aaai.org/conference/aaai/aaai-26/" },
        { "year": "2025", "date": "2024-08-15 20:59", "venue": "Vancouver, Canada", "url": "https://aaai.org/conference/aaai/aaai-25/" }
      ]
    }
  ]
}
```

### 필드 명세

- `name` (string, required): 학회 약칭. 연도 없음. row 식별자
- `full_name` (string, required): 학회 정식명. UI에서 학회명 아래 작게 표시
- `tags` (string[], required): 분야 태그 — `NLP|ML|AI|CV|IR|Data|Web|Speech|Robotics|Student|Challenge`
- `url_pattern` (string, optional): 차회 URL 템플릿 (`{YY}`/`{YYYY}` 자리표시자). 다음 회차 URL 후보 자동 생성용
- `url_fallback` (string, optional): 부모 도메인. 차회 페이지 미개설 시 사용
- `upcoming` (object, required): 가장 가까운 다음 회차
  - `year` (string): 학회 연도 (예: "2027")
  - `date` (string): 마감일. KST `YYYY-MM-DD HH:MM` 포맷
  - `venue` (string): 도시·국가 (예: "Rome, Italy"). 미정 시 "TBD"
  - `venue_confirmed` (boolean): 공식 발표된 venue인지 여부 (predicted 마감이어도 venue는 별도 확정될 수 있음)
  - `url` (string): 공식 사이트 또는 부모 도메인. HTTP 200 검증 필수
  - `predicted` (boolean): 마감 예측치 여부 (false=공식 발표, true=과거 패턴 추정)
  - `sub_events` (array, optional): 같은 회차의 부속 마감
    - `label` (string): "Student Abstract", "SRW", "Abstract" 등
    - `date`, `predicted`, `url`: upcoming과 동일한 의미
- `history` (array, required): 과거 회차들. 시간 역순 정렬 (최신 위)
  - 각 항목: `year`, `date`, `venue`, `url`

### 상태 전이

- 새 학회 추가 → conference 객체 신설
- venue 발표 → `upcoming.venue` + `venue_confirmed: true`
- 공식 마감 발표 → `predicted: true → false`
- 다음 회차 확정 → 현재 `upcoming` 을 `history` 맨 앞에 push, 새 회차로 `upcoming` 교체

---

## 3. Migration

### 단계

1. **Flat → nested 변환** (일회성 작업 — agent가 직접 수행, 스크립트 아님):
   - 학회명 정규화 룰:
     - `"X YYYY"` → conference `X`, year `YYYY`
     - `"X YYYY <Sub>"` (예: "AAAI 2027 Student Abstract", "ACL 2027 SRW") → `X`의 sub_event of year YYYY
     - `"WMT26 MT Eval Shared Task"` → conference `"WMT MT Eval"`, year `2026` (특수 룰. WMT 메인 논문 마감을 별도 추적 안 하므로 단독 conference로 처리)
     - `"IEEE ICDM 2026"` → conference `ICDM`, year `2026` (벤더 prefix 제거)
   - 각 학회의 가장 최신 (`year` 큰 것) → `upcoming`
   - 그 외 → `history`
   - `url_pattern` / `url_fallback` 은 기존 `deadlines/url-patterns.md`에서 학회별로 매핑
2. **Backfill 2년치 history** (병렬 sub-agent 6개):
   - 분야별 분담: NLP / ML / CV / IR-Web-Data / Robotics / Speech
   - 각 agent: 담당 학회별 최근 2 cycles 데이터 (date·venue·URL) 수집
   - 출처: 공식 사이트 archive, dblp, aideadlin.es, ccfddl
   - 검증 의무: 페이지 명시 정보만, 추정 금지, URL HTTP 200 확인
   - 사용자 검토 단계에서 일부 수정·제거 가능
3. **검증**:
   - 모든 conference entry 필수 필드 검증
   - history 연도 중복 없는지
   - upcoming.year > history[0].year (시간 일관성)
   - 모든 URL HTTP 200
4. **백업**: 마이그레이션 직전 `deadlines/deadlines.legacy.json` 저장 (롤백 보존)

---

## 4. UI Design (`deadlines/index.html`)

### Layout

매트릭스 표 단일 view. 기존 cards/timeline 토글 제거.

```
┌─────────────────────────────────────────────────────┐
│ Conference     │ Next deadline       │ History      │
├────────────────┼─────────────────────┼──────────────┤
│ CIKM           │ CIKM 2026           │ '25 🇰🇷 Seoul │
│ Conf. on Info..│ May 23, 2026  15d   │     May 22 ↗ │
│ [IR][Data]     │ 🇮🇹 Rome, Italy ↗   │ '24 🇺🇸 Boise│
└─────────────────────────────────────────────────────┘
```

### 시각적 규칙

- **상태별 색**:
  - 공식 발표 (`predicted: false`): 주황 (#c2410c) 카운트다운 배지
  - 예측 (`predicted: true`): 보라 (#7c3aed) 카운트다운 배지, italic
  - 지난 (PASSED): 회색 + 날짜 line-through
- **Year pill 폐지** — 학회 약칭+연도는 셀 상단 작은 메타 라인 (예: "AAAI 2027" 회색 텍스트 + 옆에 "PREDICTED" 배지). 이전 prototype의 색 pill 제거
- **카운트다운 분리** — 날짜는 검정 본문색, 카운트다운만 색 배지 (가독성)
- **Status 배지** — `predicted` / `passed` 텍스트만 표시 (confirmed는 색만으로 충분, 텍스트 생략)
- **Sub-event** — 들여쓰기 + 옅은 색 + 작은 라벨 ("STUDENT ABSTRACT", "SRW", "ABSTRACT")
- **Venue confidence**:
  - `venue_confirmed: true` (공식 발표) → 일반 텍스트, predicted 마감인 경우 ✓ 마크
  - `venue_confirmed: false` (추정) → italic + 흐린 색
  - "TBD" → "venue TBD" 회색
- **링크 버튼** — venue와 분리. "Site ↗" / "CFP ↗" 텍스트+아이콘 버튼. 공식 출처는 실선, 차회 페이지 미개설은 점선 테두리
- **국가 이모지** — venue 앞에 국기 (🇮🇹, 🇺🇸, 🇰🇷, ...). "South America" / "TBD" 등은 이모지 없음
- **History chip** — 학회 row 우측. `'YY 🇫🇱 Venue · Mon Day ↗`. 최근 2개만 표시

### 상호작용

- **Filter**: Tag 다중 선택 (현재 컨벤션 유지)
- **Sort**: 다음 마감 가까운 순 (고정)
- **Hover**: row background 변화

### 반응형

- 화면 < 900px: history 컬럼 숨김
- 화면 < 600px: 학회 컬럼 폭 축소

### Single-file architecture

- `deadlines/index.html` 안에 `<script type="application/json" id="deadlines-data">…</script>` 블록으로 인라인 JSON
- JS는 fetch 대신 `document.getElementById('deadlines-data').textContent` 파싱
- 다른 AI 도구가 HTML 한 파일만 보면 데이터 추출 가능

---

## 5. Documentation

### 통합 문서: `deadlines/CLAUDE.md`

기존 `deadlines/README.md` (절차) + `deadlines/url-patterns.md` (URL 카탈로그) 를 흡수. 단일 룰북.

### 구성

- **Schema**: 데이터 모델 사양 (Section 2 내용)
- **Update Procedures**:
  - 새 학회 추가
  - venue 공식 발표 시 (predicted venue → confirmed)
  - 마감 공식 발표 시 (predicted → confirmed)
  - 다음 회차 확정 시 (upcoming → history shift)
  - sub_event 추가/제거
  - 학회 제거 (가급적 지양)
- **Validation Rules**:
  - 필수 필드 체크
  - history 시간 일관성 / 연도 중복 검사
  - KST 변환 (AoE date + 1일, 20:59)
  - 모든 URL HTTP 200 (curl 명령 예시 포함)
- **URL Patterns** (현재 url-patterns.md 흡수): 학회별 패턴 카탈로그 + 학회 entry의 `url_pattern`/`url_fallback`로 활용
- **Sub-event 컨벤션**: 라벨 명명 룰 ("Student Abstract", "SRW", "Abstract" 등 표준화)
- **Country flag 매핑**: 국가명 → 이모지 매핑 룰
- **Common Mistakes** (이번 세션 학습):
  - URL 연도 패턴 추정 금지 — curl 200 확인 후만 기재
  - 마감 변경 시 전체 URL 전수 검증 의무
  - 페이지에 차회 마감 명시 안 됨 = predicted 유지
  - Sub-agent 위임 시 "추정 금지, 페이지 명시 정보만" 명시
- **Examples**: 각 update 절차에 before/after JSON 예시

### 외부 변경

- root `CLAUDE.md`: 유지보수 표의 deadlines 포인터를 `deadlines/CLAUDE.md`로 갱신
- root `README.md`: 손대지 않음
- memory `project_hufs_dilab.md`: deadlines/README.md → deadlines/CLAUDE.md 링크 갱신
- memory `feedback_no_url_extrapolation.md`: 유지

---

## 6. Tooling

**없음.**

- 소스 = `deadlines/index.html`의 inline JSON 블록
- 편집·검증·migration·backfill 모두 agent가 CLAUDE.md 룰을 따라 직접 수행
- Python 스크립트, build step, pre-commit hook 모두 불필요

---

## 7. Implementation Order

1. **Migration**: 평면 → nested 변환 + index.html에 inline JSON으로 통합
2. **Backfill**: 분야별 6개 sub-agent 병렬 실행, history 채우기. 사용자 검토 후 반영
3. **UI rewrite**: index.html 전체 교체 (v3 prototype 기반)
4. **Documentation**: deadlines/CLAUDE.md 작성, url-patterns.md/README.md 흡수
5. **Cleanup**: deadlines/README.md / url-patterns.md / deadlines.json 삭제, root CLAUDE.md + memory 포인터 갱신
6. **Verification**: headless Chrome 스크린샷 (1280px / 600px), URL 200 sweep, 수동 점검
7. **Commit + push**: 단일 atomic commit

### Dependencies

- 1 → 2 → 3
- 3 // 4 (병행 가능)
- 5는 4 끝나고
- 6 → 7

---

## 8. Out of Scope

- 다른 페이지 (`/people/`, `/publications/`, `/join/`) 디자인 변경 — 별도 결정
- 백엔드 추가 (현재 정적 사이트 유지)
- 사용자 인증·개인화
- 타임라인/캘린더 뷰 등 추가 view (필요 시 v2 검토)

---

## 9. Open Questions

없음 — Section 1-6 모두 사용자 승인 완료.
