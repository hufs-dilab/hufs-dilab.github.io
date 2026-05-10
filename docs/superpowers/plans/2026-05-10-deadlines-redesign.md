# Deadlines Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `deadlines/` 페이지를 학회 단위 매트릭스 뷰로 재설계 — single-file HTML (inline JSON), 과거 회차 누적 추적, agent-friendly 운영 룰북.

**Architecture:** Source-of-truth = `deadlines/index.html` 내 `<script type="application/json" id="deadlines-data">` 블록. 학회 객체 배열 (nested schema with `upcoming`, `sub_events[]`, `history[]`). UI는 vanilla JS로 inline JSON 파싱 후 매트릭스 표 렌더링. 별도 build·tooling 없음.

**Tech Stack:** Vanilla HTML/CSS/JS. JetBrains Mono + Inter Google Font. Country flag emoji. 외부 패키지·빌드 도구 없음.

**Spec:** `docs/superpowers/specs/2026-05-10-deadlines-redesign-design.md`

---

## File Structure

**Files created:**
- `deadlines/CLAUDE.md` — 통합 룰북 (schema, update procedures, URL patterns, validation rules, common mistakes)

**Files rewritten:**
- `deadlines/index.html` — 단일 파일 (HTML + CSS + JS + inline JSON)

**Files modified:**
- `CLAUDE.md` (root) — deadlines 포인터 갱신 (`deadlines/README.md` → `deadlines/CLAUDE.md`)

**Files deleted:**
- `deadlines/README.md`
- `deadlines/url-patterns.md`
- `deadlines/deadlines.json`

**External (memory) modified:**
- `~/.claude/projects/-Users-hist0613-workspace/memory/project_hufs_dilab.md` — 링크 갱신

---

## Task 1: 평면 JSON을 nested schema로 변환

**Files:**
- Read: `deadlines/deadlines.json`
- Output (interim, not committed): nested JSON 텍스트 (Task 2에서 inline 삽입용)

**Normalization rules:**
- `"X YYYY"` → conference `X`, year `YYYY`
- `"X YYYY <Sub>"` (예: "AAAI 2027 Student Abstract", "ACL 2027 SRW", "EACL 2027 SRW", "AAAI 2027 Student Abstract", "NAACL 2027 SRW", "ACL 2027 SRW") → conference `X`, year `YYYY`, sub_event with label `<Sub>`
- `"WMT26 MT Eval Shared Task"` → conference `"WMT MT Eval"`, year `2026` (단독 — WMT 메인 논문 마감 미추적)
- `"IEEE ICDM 2026"` → conference `ICDM`, year `2026`

**Conference list (예상 결과)** — 학회별 grouping:

| Conference | Years (history + upcoming) | Sub-events (in upcoming) |
|---|---|---|
| RecSys | 2026 (passed), 2027 (predicted) | — |
| NeurIPS | 2026 (passed), 2027 (predicted) | — |
| CIKM | 2026 (upcoming) | — |
| EMNLP | 2026 (upcoming) | — |
| CoRL | 2026 (upcoming) | — |
| ICDM | 2026 (upcoming) | — |
| WMT MT Eval | 2026 (upcoming) | — |
| AAAI | 2027 (upcoming) | Student Abstract (predicted) |
| EACL | 2027 (upcoming) | SRW (predicted) |
| WSDM | 2027 (upcoming) | — |
| COLING | 2027 (predicted) | — |
| ICRA | 2027 (predicted) | — |
| ICASSP | 2027 (predicted) | — |
| ICLR | 2027 (predicted) | — |
| AISTATS | 2027 (predicted) | — |
| WWW | 2027 (predicted) | — |
| NAACL | 2027 (predicted) | SRW (predicted) |
| CVPR | 2027 (predicted) | — |
| SIGIR | 2027 (predicted) | — |
| IJCAI | 2027 (predicted) | — |
| ICML | 2027 (predicted) | — |
| RSS | 2027 (predicted) | — |
| KDD | 2027 (predicted) | — |
| InterSpeech | 2027 (predicted) | — |
| ECCV | 2028 (predicted) | — |
| ICCV | 2027 (predicted) | — |
| ACL | 2027 (predicted) | SRW (predicted) |
| COLM | 2027 (predicted) | — |

**Per-conference fields:**
- `full_name`: 정식 학회명 (수동 매핑 — 다음 표 참조)
- `tags`: 기존 entry 그대로 (sub_event 가진 학회는 메인 entry의 tags 사용; 예: AAAI = ["AI"], "AAAI Student Abstract" entry의 tags는 무시)
- `url_pattern` / `url_fallback`: 현재 `deadlines/url-patterns.md`에서 학회별로 매핑

**Full name 매핑:**

| Name | Full name |
|---|---|
| RecSys | ACM Conference on Recommender Systems |
| NeurIPS | Conference on Neural Information Processing Systems |
| CIKM | Conference on Information and Knowledge Management |
| EMNLP | Conference on Empirical Methods in Natural Language Processing |
| CoRL | Conference on Robot Learning |
| ICDM | IEEE International Conference on Data Mining |
| WMT MT Eval | WMT Machine Translation Evaluation Shared Task |
| AAAI | AAAI Conference on Artificial Intelligence |
| EACL | European Chapter of the ACL |
| WSDM | International Conference on Web Search and Data Mining |
| COLING | International Conference on Computational Linguistics |
| ICRA | International Conference on Robotics and Automation |
| ICASSP | International Conference on Acoustics, Speech, and Signal Processing |
| ICLR | International Conference on Learning Representations |
| AISTATS | International Conference on Artificial Intelligence and Statistics |
| WWW | The Web Conference |
| NAACL | North American Chapter of the ACL |
| CVPR | Conference on Computer Vision and Pattern Recognition |
| SIGIR | ACM SIGIR Conference on Research and Development in Information Retrieval |
| IJCAI | International Joint Conference on Artificial Intelligence |
| ICML | International Conference on Machine Learning |
| RSS | Robotics: Science and Systems |
| KDD | ACM SIGKDD Conference on Knowledge Discovery and Data Mining |
| InterSpeech | Annual Conference of the International Speech Communication Association |
| ECCV | European Conference on Computer Vision |
| ICCV | International Conference on Computer Vision |
| ACL | Annual Meeting of the Association for Computational Linguistics |
| COLM | Conference on Language Modeling |

**Steps:**

- [ ] **Step 1.1: 현재 deadlines.json 읽기**

```bash
cat /Users/hist0613/workspace/hufs-dilab.github.io/deadlines/deadlines.json
```

- [ ] **Step 1.2: Nested JSON 구조 빌드**

각 학회 grouping → conference 객체 배열 생성. 예시:

```json
{
  "schema_version": 3,
  "conferences": [
    {
      "name": "RecSys",
      "full_name": "ACM Conference on Recommender Systems",
      "tags": ["IR"],
      "url_pattern": "https://recsys.acm.org/recsys{YY}/",
      "url_fallback": "https://recsys.acm.org/",
      "upcoming": {
        "year": "2027",
        "date": "2027-04-22 20:59",
        "venue": "TBD",
        "venue_confirmed": false,
        "url": "https://recsys.acm.org/",
        "predicted": true
      },
      "history": [
        { "year": "2026", "date": "2026-04-22 20:59", "venue": "Minneapolis, USA", "url": "https://recsys.acm.org/recsys26/" }
      ]
    }
  ]
}
```

- [ ] **Step 1.3: JSON 유효성 검증**

```bash
echo '<<NESTED_JSON>>' | python3 -m json.tool > /dev/null && echo "VALID"
```
Expected: `VALID`

- [ ] **Step 1.4: 학회별 entry 수 확인**

전체 28개 conference object 생성 확인. 각 학회 history는 0개 또는 1개 (현재 단계, backfill 전).

---

## Task 2: 새 index.html 작성 (UI + inline JSON 통합)

**Files:**
- Modify: `deadlines/index.html` (전체 교체)

**기준 prototype:** `.superpowers/brainstorm/97263-1778415879/content/prototype-v3.html` (사용자 승인 완료)

**Steps:**

- [ ] **Step 2.1: prototype-v3 HTML 구조 베이스로 새 index.html 작성**

`prototype-v3.html`을 기반으로 다음 변경:
1. `<title>` → `Deadlines | DILAB`
2. `<meta name="description">` 추가
3. `<link rel="icon" type="image/png" href="/UI/farvicon_colored.png">` 추가
4. 기존 site의 navbar, footer 컴포넌트 추가 (기존 `index.html`에서 복사):
   - `<nav class="navbar">` (Home/People/Publications/Deadlines/Join Us 링크, deadlines active)
   - `<footer>` (HUFS 로고 + 주소 + 연도)
5. `<link rel="stylesheet" href="/style.css">` 추가 (사이트 공통 스타일)
6. `<script src="/script.js"></script>` 추가 (메뉴 토글 등)
7. `<style>` 섹션은 prototype-v3의 폰트·색·레이아웃 그대로 유지
8. `<script type="application/json" id="deadlines-data">` 블록 — Task 1.2의 결과 JSON으로 채움
9. 메인 `<script>` 섹션 (parseData/render/...) prototype 그대로

- [ ] **Step 2.2: JS의 today 변수 제거**

prototype은 `const today = new Date('2026-05-10T13:00:00+09:00')` 하드코딩. 실제 사이트는 실시간 사용:

```js
const today = new Date();
```

- [ ] **Step 2.3: Last Update 메타 자동화**

prototype의 `<p class="meta">Last Update: 2026-05-10 ...</p>` 부분을 빌드 시 사용자가 수동 업데이트하는 정적 텍스트로 유지. 매번 commit 시 갱신 (룰은 CLAUDE.md에 명시).

- [ ] **Step 2.4: 새 index.html 저장**

Write 도구로 `deadlines/index.html` 전체 교체.

- [ ] **Step 2.5: 로컬에서 즉시 시각 확인 (headless Chrome 스크린샷)**

```bash
cd /Users/hist0613/workspace/hufs-dilab.github.io
python3 -m http.server 8000 &
SERVER_PID=$!
sleep 1
# 스크린샷 (headless Chrome 또는 macOS Chrome)
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless --disable-gpu --window-size=1280,900 --screenshot=/tmp/deadlines-desktop.png \
  http://localhost:8000/deadlines/
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --headless --disable-gpu --window-size=600,900 --screenshot=/tmp/deadlines-mobile.png \
  http://localhost:8000/deadlines/
kill $SERVER_PID
```

Expected: 두 PNG 생성, 매트릭스 테이블 렌더링 확인 (사용자 검토)

- [ ] **Step 2.6: JSON 인라인 블록 파싱 검증**

```bash
python3 -c "
import re, json
with open('deadlines/index.html') as f: html = f.read()
m = re.search(r'<script type=\"application/json\" id=\"deadlines-data\">(.*?)</script>', html, re.DOTALL)
data = json.loads(m.group(1))
print(f'OK: {len(data[\"conferences\"])} conferences')
"
```
Expected: `OK: 28 conferences`

- [ ] **Step 2.7: 임시 commit (검증 용이성 위해 plan 도중 chunk별 commit)**

```bash
git add deadlines/index.html
git commit -m "[hufs-dilab.github.io] Rewrite deadlines page with nested schema and matrix view (no history yet)"
```

---

## Task 3: 과거 history 2년치 backfill (병렬 sub-agent)

**Files:**
- Modify: `deadlines/index.html` (inline JSON의 conference[].history 배열 갱신)

**Steps:**

- [ ] **Step 3.1: 6개 sub-agent 동시 dispatch (단일 메시지에 모두)**

각 agent는 분야별 학회 담당. 공통 instruction:

```
오늘은 2026-05-10. 담당 학회들의 최근 2 cycles (지난 2년) history를 조사.

각 학회별로:
- year (학회 연도, 4자리 string)
- date (제출 마감, KST 기준 "YYYY-MM-DD HH:MM" — AoE 마감일 + 1일, 20:59)
- venue (도시·국가, 예: "Seoul, South Korea")
- url (해당 회차 공식 사이트, HTTP 200 확인 필수)

검증:
- 페이지 명시 정보만 사용. 추정·외삽 금지
- URL은 curl로 200 확인 후만 기재
- venue 불명확 시 "no info"

출력 형식 (학회별):
[ConferenceName]
  year: YYYY
  date: YYYY-MM-DD 20:59
  venue: ...
  url: ...
  source: <인용 출처>
```

각 agent의 담당:
- **NLP**: EMNLP, EACL, NAACL, ACL, COLING, COLM, WMT MT Eval
- **ML**: NeurIPS, ICLR, ICML, AISTATS, IJCAI, AAAI
- **CV**: CVPR, ICCV, ECCV
- **IR/Web/Data**: CIKM, ICDM, KDD, WSDM, RecSys, SIGIR, WWW
- **Robotics**: CoRL, ICRA, RSS
- **Speech**: ICASSP, InterSpeech

- [ ] **Step 3.2: 모든 agent 결과 수집 후 사용자 검토**

agent 결과를 그대로 보여주고, 사용자가 수정·제거할 항목 결정. 자동 commit 금지.

- [ ] **Step 3.3: 사용자 승인된 history 데이터를 inline JSON에 삽입**

각 conference 객체의 `history` 배열에 `[{year, date, venue, url}, ...]` 시간 역순으로 추가.

- [ ] **Step 3.4: JSON 유효성 + 일관성 검증**

```bash
python3 -c "
import re, json
with open('deadlines/index.html') as f: html = f.read()
m = re.search(r'<script type=\"application/json\" id=\"deadlines-data\">(.*?)</script>', html, re.DOTALL)
data = json.loads(m.group(1))
for c in data['conferences']:
    years = [int(c['upcoming']['year'])] + [int(h['year']) for h in c['history']]
    assert years == sorted(years, reverse=True), f'{c[\"name\"]}: history not sorted'
    assert len(years) == len(set(years)), f'{c[\"name\"]}: duplicate years'
print('OK')
"
```
Expected: `OK`

- [ ] **Step 3.5: 모든 history URL HTTP 200 검증**

```bash
python3 -c "
import re, json
with open('deadlines/index.html') as f: html = f.read()
m = re.search(r'<script type=\"application/json\" id=\"deadlines-data\">(.*?)</script>', html, re.DOTALL)
data = json.loads(m.group(1))
urls = []
for c in data['conferences']:
    if c.get('upcoming', {}).get('url'): urls.append(c['upcoming']['url'])
    for sub in c['upcoming'].get('sub_events', []):
        if sub.get('url'): urls.append(sub['url'])
    for h in c.get('history', []):
        if h.get('url'): urls.append(h['url'])
print('\n'.join(urls))
" | xargs -I{} sh -c 'echo \"$(curl -s -L --max-time 8 -o /dev/null -w \"%{http_code}\" \"{}\") {}\"'
```
Expected: 모든 URL 200 (404/000 있으면 사용자에게 보고 + URL fallback으로 교체)

- [ ] **Step 3.6: Browser 시각 확인**

Step 2.5와 동일한 명령으로 스크린샷 재생성. history chip 채워진 모습 확인.

- [ ] **Step 3.7: Commit**

```bash
git add deadlines/index.html
git commit -m "[hufs-dilab.github.io] Backfill 2 years of history per conference"
```

---

## Task 4: deadlines/CLAUDE.md 작성 (룰북 통합)

**Files:**
- Create: `deadlines/CLAUDE.md`

**Steps:**

- [ ] **Step 4.1: CLAUDE.md 작성**

다음 9개 섹션을 포함하는 단일 문서:

```markdown
# Deadlines — Maintenance Rulebook

`deadlines/index.html` 의 inline JSON 데이터·UI·갱신 절차를 모두 정리한 단일 룰북.

## 1. Architecture

- **Source-of-truth**: `deadlines/index.html` 내 `<script type="application/json" id="deadlines-data">…</script>` 블록
- 별도 deadlines.json 파일 없음 (single-file 운영)
- UI는 vanilla JS로 inline JSON 파싱 후 매트릭스 표 렌더링

## 2. Data Schema

(spec Section 2 내용 그대로 — schema_version, conferences[], 각 필드 명세)

## 3. Update Procedures

### 새 학회 추가
1. `conferences[]` 배열에 새 객체 push
2. 필수 필드 모두 채움
3. URL HTTP 200 확인
4. `Last Update` 텍스트 갱신

### Venue 공식 발표 시
1. 해당 conference 찾기 (name 매칭)
2. `upcoming.venue` + `venue_confirmed: true`
3. (선택) `upcoming.url` 도 더 구체적인 페이지로 갱신

### 마감 공식 발표 시 (predicted → confirmed)
1. `upcoming.date` 정확한 KST 값으로 갱신
2. `upcoming.predicted: false`
3. (선택) `upcoming.url` 갱신

### 다음 회차 확정 시 (upcoming → history shift)
1. 현재 `upcoming` 을 통째로 `history` 맨 앞에 push (year, date, venue, url만 발췌)
2. 새 회차 정보로 `upcoming` 객체 교체 (`predicted: true` 시작)
3. `sub_events` 는 빈 배열로 시작

### Sub-event 추가/제거
- 추가: `upcoming.sub_events[]` 에 push (label, date, predicted, url)
- 제거: 해당 객체 제거

### 학회 제거 (가급적 지양)
- 사용자 명시 요청 시에만
- 데이터 보존 의도 위반 — 정말 필요한지 재확인

## 4. Validation Rules

(필수 체크리스트 + 명령 예시)

```bash
# JSON 유효성
python3 -c "import re, json; html = open('deadlines/index.html').read(); m = re.search(r'<script type=\"application/json\" id=\"deadlines-data\">(.*?)</script>', html, re.DOTALL); json.loads(m.group(1)); print('OK')"

# URL HTTP 200 sweep
(위와 동일한 sweep 명령)
```

- 모든 conference 필수 필드 (name, full_name, tags, upcoming.year, upcoming.date, upcoming.venue, upcoming.venue_confirmed, upcoming.url, upcoming.predicted, history) 존재
- history 시간 역순 정렬, 연도 중복 없음
- upcoming.year > history[0].year (시간 일관성)
- 모든 URL HTTP 200
- KST 시간 포맷 `YYYY-MM-DD HH:MM` 정규식 매칭

## 5. KST 변환

- AoE = UTC-12. AoE 마감 11:59 PM = UTC 다음날 11:59 = **KST 다음날 20:59**
- **JSON date 컨벤션: AoE 날짜 + 1일, 20:59 KST**
- 예: EACL 2027 공식 "ARR submission deadline: August 3, 2026 (AoE)" → JSON `2026-08-04 20:59`

## 6. URL Patterns

(현재 url-patterns.md 흡수: 학회별 URL 패턴 카탈로그)

| Conference | Pattern | Fallback |
|---|---|---|
| ACL | `https://{YYYY}.aclweb.org/` | `https://www.aclweb.org/` |
| EACL | `https://{YYYY}.eacl.org/` | — |
| ... (전체 28개)

**규칙**:
- 후보 URL은 패턴으로 생성 → `curl -s -L -o /dev/null -w "%{http_code}" <url>` 200 확인 후만 사용
- 200 안 되면 fallback (부모 도메인) 사용
- 연도 패턴 추정으로 URL 만들기 금지

## 7. Sub-event Labels

표준 라벨:
- `Student Abstract` (AAAI)
- `SRW` (Student Research Workshop — ACL/EACL/NAACL)
- `Abstract` (논문 초록 마감, WSDM 등)
- `Workshop Proposal` (학회 워크샵 제안)

## 8. Country Flag Mapping

JS의 `FLAGS` 객체에 매핑 (자세한 코드는 index.html 참조). 새 venue 추가 시 해당 국가 매핑 추가.

## 9. Common Mistakes (Lessons Learned)

- ❌ URL 연도 패턴만 보고 추정 (예: `iclr.cc/Conferences/2026` 있다고 `/2027` 가정) — **반드시 curl 200 확인**
- ❌ "내가 새로 바꾼 것만" 검증 — 검증 도입/변경 시 **JSON 안의 모든 URL 전수 검증**
- ❌ 페이지에 차회 마감 명시 안 됐는데 "추정값" 으로 confirmed 표기 — **predicted 유지**
- ❌ AoE 변환 시 "익일 13:59" — 실제 **익일 20:59 KST**
- ❌ Sub-agent에 "조사해줘" — **"페이지 명시 정보만, 추정 금지" 명시**

## 10. Examples (before/after)

### 예시 A: predicted venue → confirmed
**Before:**
\`\`\`json
"upcoming": { "year": "2027", "venue": "TBD", "venue_confirmed": false, ... }
\`\`\`
**After (공식 사이트에 "Athens, Greece" 명시 확인):**
\`\`\`json
"upcoming": { "year": "2027", "venue": "Athens, Greece", "venue_confirmed": true, ... }
\`\`\`

### 예시 B: 다음 회차 확정 (upcoming → history shift)
**Before** (RecSys 2027 공식 마감 발표됨):
\`\`\`json
{ "name": "RecSys", "upcoming": {"year": "2027", "date": "2027-04-22 20:59", "predicted": true, ...},
  "history": [{"year": "2026", ...}] }
\`\`\`
**After** (다음 사이클인 RecSys 2028을 새 upcoming으로):
\`\`\`json
{ "name": "RecSys", "upcoming": {"year": "2028", "date": "2028-04-22 20:59", "predicted": true, ...},
  "history": [{"year": "2027", ...}, {"year": "2026", ...}] }
\`\`\`
```

- [ ] **Step 4.2: deadlines/CLAUDE.md 저장**

Write 도구로 위 내용 저장.

---

## Task 5: 외부 참조 갱신

**Files:**
- Modify: `CLAUDE.md` (root)
- Modify: `~/.claude/projects/-Users-hist0613-workspace/memory/project_hufs_dilab.md`

**Steps:**

- [ ] **Step 5.1: root CLAUDE.md 의 deadlines 포인터 갱신**

`CLAUDE.md` 의 유지보수 작업 표:
```
| Conference deadlines | deadlines/deadlines.json | deadlines/README.md |
```
→
```
| Conference deadlines | deadlines/index.html (inline JSON) | deadlines/CLAUDE.md |
```

Edit 도구 사용.

- [ ] **Step 5.2: memory project_hufs_dilab.md 갱신**

```
- `deadlines/README.md` — `deadlines.json` 갱신 절차
- `deadlines/index.html` line ~272 — `Last Update: YYYY-MM-DD`
- `deadlines/deadlines.json` — Upcoming + Predicted 학회 마감 데이터
```
→
```
- `deadlines/CLAUDE.md` — schema·갱신 절차·URL 패턴·KST 변환·common mistakes 통합 룰북
- `deadlines/index.html` — 단일 파일 (UI + inline JSON 데이터). `Last Update: YYYY-MM-DD` 매 갱신마다 업데이트
```

기타 표현 (deadline 갱신 시 핵심 규칙) 도 동기화.

---

## Task 6: 구 파일 삭제

**Files:**
- Delete: `deadlines/README.md`
- Delete: `deadlines/url-patterns.md`
- Delete: `deadlines/deadlines.json`

**Steps:**

- [ ] **Step 6.1: 파일 삭제**

```bash
git rm deadlines/README.md deadlines/url-patterns.md deadlines/deadlines.json
```
Expected: 3개 파일 stage 됨

- [ ] **Step 6.2: 깨진 참조 검사**

```bash
grep -rn "deadlines/README.md\|deadlines/url-patterns.md\|deadlines/deadlines.json" \
  --include="*.md" --include="*.html" --include="*.js" \
  --exclude-dir="docs/superpowers" \
  /Users/hist0613/workspace/hufs-dilab.github.io
```
Expected: 출력 없음 (spec/plan 파일은 의도적으로 deprecated 파일명 언급하므로 제외). 있으면 해당 위치 갱신.

---

## Task 7: 최종 검증 및 commit

**Steps:**

- [ ] **Step 7.1: JSON 유효성**

```bash
python3 -c "import re, json; html = open('deadlines/index.html').read(); m = re.search(r'<script type=\"application/json\" id=\"deadlines-data\">(.*?)</script>', html, re.DOTALL); data = json.loads(m.group(1)); print(f'OK: {len(data[\"conferences\"])} conferences')"
```
Expected: `OK: 28 conferences`

- [ ] **Step 7.2: URL 전수 검증 (Task 3.5와 동일)**

모든 URL HTTP 200 확인.

- [ ] **Step 7.3: 일관성 검사 (Task 3.4와 동일)**

history 시간 역순 + 중복 없음.

- [ ] **Step 7.4: Browser 시각 검증 (desktop + mobile)**

Task 2.5 명령으로 두 viewport 스크린샷 → 사용자 검토.

- [ ] **Step 7.5: 모든 변경사항 commit**

```bash
git status
# 예상: deadlines/CLAUDE.md (new), CLAUDE.md (modified), deadlines/* (modified/deleted)
git add CLAUDE.md deadlines/CLAUDE.md deadlines/index.html
# (Task 6.1에서 git rm으로 이미 stage된 파일도 함께)
git commit -m "[hufs-dilab.github.io] Redesign deadlines page with nested schema, matrix view, and unified rulebook

- New schema: per-conference entries with upcoming, sub_events[], history[]
- New UI: matrix table (Conference / Next deadline / Recent history)
  with country flag emojis, separate link buttons, color-coded status
- Single-file architecture: inline JSON in index.html (replaces deadlines.json)
- Backfill: 2 years of history per conference (~28 conferences tracked)
- New unified rulebook: deadlines/CLAUDE.md (replaces README.md + url-patterns.md)
- Update root CLAUDE.md and memory pointers

Co-Authored-By: claude-flow <ruv@ruv.net>"
```

- [ ] **Step 7.6: Push**

```bash
git push
```
Expected: `main -> main`

- [ ] **Step 7.7: 배포된 사이트 확인**

GitHub Pages 배포 완료 후 (~1-2분), `https://hufs-dilab.github.io/deadlines/` 방문해 동작 확인 — 사용자 검토.
