# Deadlines 페이지 유지보수 룰북

이 문서는 `deadlines/` 디렉토리를 유지보수하는 에이전트와 사람 모두를 위한 단일 기준서다.
`deadlines/README.md` 및 `deadlines/url-patterns.md` 의 내용을 통합·흡수한다.

---

## 1. Architecture

- **소스 오브 트루스**: `deadlines/index.html` 내 `<script type="application/json" id="deadlines-data">…</script>` 블록
- **별도 JSON 파일 없음** — 과거 `deadlines.json` 은 삭제됨. single-file 운영 원칙
- **UI**: vanilla JS가 인라인 JSON을 파싱한 후 매트릭스 표를 렌더링. 외부 라이브러리 없음
- **Last Update**: `index.html` 상단 `<p>Last Update: YYYY-MM-DD …</p>` 를 매 갱신마다 업데이트
- **검증 소스 (우선순위 순)**:
  1. 공식 학회 사이트 (Call for Papers 페이지)
  2. [aideadlin.es](https://aideadlin.es/)
  3. [ccfddl.com](https://ccfddl.github.io/)
  4. [paperpilot.com/deadlines](https://www.getpaperpilot.com/deadlines/), [mlciv.com/ai-deadlines](https://mlciv.com/ai-deadlines/), [trybibby.com/conference-deadlines](https://trybibby.com/conference-deadlines)
  5. 공식 X(Twitter) 계정의 CFP 공지

---

## 2. Data Schema

`deadlines/index.html` 내 JSON 블록의 완전한 스키마:

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
        {
          "year": "2026",
          "date": "2025-08-02 20:59",
          "venue": "Singapore",
          "url": "https://aaai.org/conference/aaai/aaai-26/"
        },
        {
          "year": "2025",
          "date": "2024-08-16 20:59",
          "venue": "Philadelphia, USA",
          "url": "https://aaai.org/conference/aaai/aaai-25/"
        }
      ]
    }
  ]
}
```

### 필드 설명

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `name` | string | 필수 | 학회 약칭 (연도 없음). row 식별자 |
| `full_name` | string | 필수 | 학회 정식명. UI에서 학회명 아래 작게 표시 |
| `tags` | string[] | 필수 | 분야 태그. 허용값: `NLP\|ML\|AI\|CV\|IR\|Data\|Web\|Speech\|Robotics\|Student\|Challenge` |
| `url_pattern` | string | 필수 | 차회 URL 템플릿. `{YY}` = 2자리 연도, `{YYYY}` = 4자리 연도 |
| `url_fallback` | string | 권장 | 부모 도메인. 차회 페이지 미개설 시 사용 |
| `upcoming` | object | 필수 | 가장 가까운 다음 회차 |
| `upcoming.year` | string | 필수 | 학회 연도 (예: `"2027"`) |
| `upcoming.date` | string | 필수 | 마감일. KST `YYYY-MM-DD HH:MM` |
| `upcoming.venue` | string | 필수 | 도시·국가. 미정 시 `"TBD"` |
| `upcoming.venue_confirmed` | boolean | 필수 | **공식 학회 사이트 또는 공식 모학회 announcement에 명시된 venue만 `true`**. 제3자 트래커(aideadlin.es / mlciv / trybibby 등)나 짐작 출처는 `false`. venue 문자열이 specific city여도 출처가 비공식이면 `false` |
| `upcoming.venue_source_url` | string | 선택 | venue가 비공식 출처에서 왔을 때 그 출처 URL. UI에서 `src ↗` dashed 버튼으로 별도 표시. **수용 가능한 출처**: 학회 공식 X(트위터) 계정 발표, 학회 공식 발표자료(closing slides 등), 학회 공식 홈페이지의 블로그/news 페이지. **수용 불가**: 단순 deadline 모음 트래커 (aideadlin.es / mlciv / trybibby / ccfddl / paperpilot 등) — 이런 경우 `venue_source_url` 자체를 채우지 말 것. 적절한 출처 못 찾으면 venue 자체를 `"TBD"` 로 처리하거나 venue 유지하되 src 비움 |
| `upcoming.url` | string | 필수 | 공식 사이트. HTTP 200 검증 필수 |
| `upcoming.predicted` | boolean | 필수 | 마감 예측치 여부. 공식 발표 시 `false` |
| `upcoming.sub_events` | array | 선택 | 같은 회차의 부속 마감 (Student Abstract, SRW, Cycle 2 등) |
| `upcoming.sub_events[].label` | string | 필수 | 부속 이벤트 라벨 (섹션 7 참고) |
| `upcoming.sub_events[].type` | string | 선택 | `"track"` (기본, 생략 가능) 또는 `"challenge"`. challenge/competition 마감은 성격이 달라 UI에서 별도 표시 (섹션 7-2 참고) |
| `upcoming.sub_events[].date` | string | 필수 | KST `YYYY-MM-DD HH:MM` |
| `upcoming.sub_events[].predicted` | boolean | 필수 | 예측치 여부 |
| `upcoming.sub_events[].url` | string | 필수 | HTTP 200 검증 필수 |
| `history` | array | 필수 | 과거 회차들. **시간 역순 (최신 위)** |
| `history[].year` | string | 필수 | 학회 연도 |
| `history[].date` | string | 필수 | 마감일 KST |
| `history[].venue` | string | 필수 | 도시·국가 |
| `history[].url` | string | 필수 | 공식 사이트 |
| `history[].label` | string | 선택 | multi-cycle 학회용 cycle 식별자 (예: `"Cycle 1"`, `"Cycle 2"`). 같은 year에 여러 cycle 허용 |

---

## 3. Update Procedures

### 3-1. 새 학회 추가

1. `conferences[]` 배열 끝에 새 객체 push
2. 필수 필드 모두 채움: `name`, `full_name`, `tags`, `url_pattern`, `upcoming.*`, `history`
3. 모든 URL HTTP 200 확인 (섹션 4의 sweep 명령 사용)
4. `Last Update` 날짜 갱신

**예시:**
```json
{
  "name": "COLM",
  "full_name": "Conference on Language Modeling",
  "tags": ["NLP", "ML"],
  "url_pattern": "https://colmweb.org/",
  "url_fallback": "https://colmweb.org/",
  "upcoming": {
    "year": "2027",
    "date": "2027-02-10 20:59",
    "venue": "TBD",
    "venue_confirmed": false,
    "url": "https://colmweb.org/",
    "predicted": true,
    "sub_events": []
  },
  "history": [
    { "year": "2026", "date": "2026-02-07 20:59", "venue": "Boston, USA", "url": "https://colmweb.org/" }
  ]
}
```

---

### 3-2. Venue 공식 발표 시 (predicted venue → confirmed)

공식 사이트에 "Athens, Greece" 등 도시·국가가 명시된 것을 직접 확인한 경우.

**Before:**
```json
"upcoming": {
  "year": "2027",
  "venue": "TBD",
  "venue_confirmed": false,
  "predicted": true
}
```

**After (공식 사이트에 "Athens, Greece" 명시 확인):**
```json
"upcoming": {
  "year": "2027",
  "venue": "Athens, Greece",
  "venue_confirmed": true,
  "predicted": true
}
```

주의: `venue_confirmed: true` 여도 마감이 미발표면 `predicted: true` 유지. 두 필드는 독립.

---

### 3-3. 마감 공식 발표 시 (predicted → confirmed)

1. `upcoming.date` 를 정확한 KST 값으로 갱신 (섹션 5 참고)
2. `upcoming.predicted: false` 로 변경
3. (선택) `upcoming.url` 을 더 구체적인 CFP 페이지로 갱신
4. `Last Update` 날짜 갱신

**Before:**
```json
"upcoming": { "date": "2026-09-01 20:59", "predicted": true }
```

**After (공식 CFP: "August 18, 2026 AoE"):**
```json
"upcoming": { "date": "2026-08-19 20:59", "predicted": false }
```

---

### 3-4. 다음 회차 확정 시 (upcoming → history shift)

현재 upcoming이 history로 이동하고, 다음 회차가 새 upcoming이 되는 시점.

**Before** (RecSys 2027 공식 마감 발표됨, 다음 사이클 예측 시작):
```json
{
  "name": "RecSys",
  "upcoming": { "year": "2027", "date": "2027-04-22 20:59", "predicted": false, "venue": "Amsterdam, Netherlands", "url": "https://recsys.acm.org/recsys27/" },
  "history": [
    { "year": "2026", "date": "2026-04-20 20:59", "venue": "Singapore", "url": "https://recsys.acm.org/recsys26/" }
  ]
}
```

**After** (다음 사이클 RecSys 2028 새 upcoming):
```json
{
  "name": "RecSys",
  "upcoming": { "year": "2028", "date": "2028-04-22 20:59", "predicted": true, "venue": "TBD", "venue_confirmed": false, "url": "https://recsys.acm.org/" },
  "history": [
    { "year": "2027", "date": "2027-04-22 20:59", "venue": "Amsterdam, Netherlands", "url": "https://recsys.acm.org/recsys27/" },
    { "year": "2026", "date": "2026-04-20 20:59", "venue": "Singapore", "url": "https://recsys.acm.org/recsys26/" }
  ]
}
```

---

### 3-5. Sub-event 추가/제거

**추가:**
```json
"sub_events": [
  { "label": "Abstract", "date": "2026-08-11 20:59", "predicted": false, "url": "https://wsdm-conference.org/2027/" }
]
```

**제거:** `sub_events` 배열에서 해당 객체만 삭제. 배열이 비면 `"sub_events": []` 유지.

---

### 3-6. Multi-cycle 학회 (KDD)

- **upcoming**: 가장 가까운 cycle을 main에, 그 다음 cycle을 `sub_events`로
- 오늘 5월이면 KDD Cycle 1(8월 마감)이 upcoming main, Cycle 2(다음해 2월 마감)는 sub_event
- Cycle 1 마감 지나면 Cycle 2 → main 승격, Cycle 1은 history에 `label: "Cycle 1"` 추가
- history는 같은 year에 여러 cycle 가능 (label로 구분)

**예시 (오늘 2026-05-10, KDD 2027 진행 중):**
```json
{
  "name": "KDD",
  "upcoming": {
    "year": "2027",
    "date": "2026-08-01 20:59",
    "venue": "Toronto, Canada",
    "venue_confirmed": true,
    "url": "https://kdd2027.kdd.org/",
    "predicted": false,
    "sub_events": [
      { "label": "Cycle 2", "date": "2027-02-05 20:59", "predicted": true, "url": "https://kdd2027.kdd.org/" }
    ]
  },
  "history": [
    { "year": "2026", "date": "2025-08-03 20:59", "venue": "Singapore", "url": "https://kdd2026.kdd.org/", "label": "Cycle 1" },
    { "year": "2026", "date": "2026-02-08 20:59", "venue": "Singapore", "url": "https://kdd2026.kdd.org/", "label": "Cycle 2" }
  ]
}
```

---

## 4. Validation Rules

### JSON 유효성 검증

```bash
python3 -c "
import re, json
html = open('deadlines/index.html').read()
m = re.search(r'<script type=\"application/json\" id=\"deadlines-data\">(.*?)</script>', html, re.DOTALL)
json.loads(m.group(1))
print('OK')
"
```

### URL 컨텐츠 검증 (도메인 파킹·squat 사이트 차단)

**HTTP 200 만으로는 부족**. 다음 패턴 검출 시 url을 거부하고 fallback 사용:

```bash
# 의심 시그널 검출
curl -s -L --max-time 10 <url> | grep -iE "window\.location\.replace|FingerprintJS|tr_uuid|generasipoker|judi|casino|porno" && echo "SUSPICIOUS: parking/squat site"

# 또는 학회 키워드 부재 (응답에 학회명·conference 단어 없음 → 의심)
curl -s -L --max-time 10 <url> | grep -iE "conference|workshop|submission|cfp|paper" || echo "SUSPICIOUS: no conference keywords"
```

**대표 의심 패턴** (이번 세션 발견):
- `window.onload=function(){window.location.href='/lander'}` — 도메인 파킹 (예전 `coling2027.org`)
- FingerprintJS + `tr_uuid` 쿼리 — 추적·리다이렉트 사이트 (예전 `coling2026.org`)
- 무관한 비즈니스 (인도네시아 포커, 러시아 광고 등) — squatted domain (예전 `coling.org/2026`)

거부 후 처리:
1. 같은 학회의 다른 후보 URL (이전 회차, 부모 도메인, ACL Anthology venue 페이지 등)을 시도
2. 모두 실패하면 `url_fallback` 으로 강력한 stable authority 사용 (학회 series의 ACL Anthology venue 페이지가 좋은 fallback)

### URL HTTP 200 전수 검증 (모든 url 필드)

```bash
python3 -c "
import re, json, subprocess, concurrent.futures
with open('deadlines/index.html') as f: html = f.read()
m = re.search(r'<script type=\"application/json\" id=\"deadlines-data\">(.*?)</script>', html, re.DOTALL)
data = json.loads(m.group(1))
urls = []
for c in data['conferences']:
    if c['upcoming'].get('url'): urls.append(c['upcoming']['url'])
    for sub in c['upcoming'].get('sub_events', []):
        if sub.get('url'): urls.append(sub['url'])
    for h in c.get('history', []):
        if h.get('url'): urls.append(h['url'])
def check(u):
    try:
        r = subprocess.run(
            ['curl', '-s', '-L', '--max-time', '10', '-o', '/dev/null', '-w', '%{http_code}', u],
            capture_output=True, text=True, timeout=15
        )
        return (u, r.stdout.strip())
    except:
        return (u, 'ERR')
with concurrent.futures.ThreadPoolExecutor(max_workers=10) as ex:
    for u, code in ex.map(check, urls):
        if code != '200': print(f'{code} {u}')
"
```

### 검증 규칙 목록

- 모든 conference 필수 필드 존재: `name`, `full_name`, `tags`, `upcoming.year`, `upcoming.date`, `upcoming.venue`, `upcoming.venue_confirmed`, `upcoming.url`, `upcoming.predicted`, `history`
- `history` 시간 역순 정렬 (최신 위). `history[0].date` 가 가장 나중
- history 같은 year의 중복은 `label` 로 구분된 경우만 허용
- `upcoming.date` > `history[0].date` (upcoming 마감이 가장 최근 history 마감보다 늦어야 함)
- 모든 `url` 필드: HTTP 200 확인 필수
- `date` 필드 포맷: `YYYY-MM-DD HH:MM` (정규식 `\d{4}-\d{2}-\d{2} \d{2}:\d{2}`)
- `tags` 값은 허용 목록에 속해야 함: `NLP|ML|AI|CV|IR|Data|Web|Speech|Robotics|Student|Challenge`
- `sub_events[].type` 이 있으면 값은 `track` 또는 `challenge` 중 하나 (생략 시 `track` 으로 간주)
- `tags` 에 `Challenge` 가 있는 독립 row 는 섹션 7-2 의 분류 규칙에 부합해야 함 (자체 캠페인 또는 학회 순회 challenge)

### 검증 규칙 도입/변경 시 주의

규칙을 추가하면 그 시점의 **JSON 안의 모든 URL을 즉시 전수 검증**할 것. "내가 새로 바꾼 것만 확인"은 검증이 아님.

---

## 5. KST 변환

### AoE 변환 (가장 흔한 케이스)

- **AoE (Anywhere on Earth)** = UTC-12
- **변환식**: AoE 마감 `MM-DD 23:59` → UTC `MM-(DD+1) 11:59` → **KST `MM-(DD+1) 20:59`**
- **JSON date 컨벤션: AoE 공식 날짜 +1일, 시간은 `20:59`**

| 공식 마감 | JSON `date` |
|---|---|
| August 3, 2026 (AoE) | `2026-08-04 20:59` |
| Aug 18, 2026 Papers Due (AoE) | `2026-08-19 20:59` |
| January 10, 2027 (AoE) | `2027-01-11 20:59` |

### 타 시간대 변환

AoE가 아닌 학회 자체 시간대를 사용하는 경우 — 공식 CFP에서 시간대 명시를 반드시 확인.

| 시간대 | 변환식 | 예시 |
|---|---|---|
| **PST (UTC-8)** | PST 23:59 = UTC+1일 07:59 = KST+1일 16:59 | ICRA "Sept 15 11:59 PM PST" → `2025-09-16 16:59` |
| **EST (UTC-5)** | EST 23:59 = UTC+1일 04:59 = KST+1일 13:59 | — |
| **CST (UTC+8)** | 동일 날짜 23:59 = KST 동일 날짜 23:59 | 중국 학회 일부 |

> 시간대가 불명확하면 AoE로 가정하지 말고 공식 CFP 페이지에서 직접 확인.

---

## 6. URL Patterns (학회별 카탈로그)

**규칙**:
1. 패턴으로 후보 URL 생성 → `curl -s -L -o /dev/null -w "%{http_code}" <url>` 으로 200 확인
2. 200이면 사용. 404·DNS 실패면 아래 우선순위로 진행:
   - **차회 공지 페이지**: 모학회 공식 사이트에서 차회 일정·장소 명시한 페이지 (사용자가 클릭했을 때 근거 확인 가능)
   - **부모 도메인(`url_fallback`)**: 최후 수단
3. CIKM/ICDM처럼 host 매년 다른 경우 aideadlin.es / 공식 X 계정 검색 필수
4. **연도 패턴 추정으로 URL 만들기 금지 — 실제 200 확인 필수**

### NLP

| Conference | Pattern | Fallback | 비고 |
|---|---|---|---|
| ACL | `https://{YYYY}.aclweb.org/` | `https://www.aclweb.org/` | year subdomain |
| EACL | `https://{YYYY}.eacl.org/` | — | year subdomain |
| EMNLP | `https://{YYYY}.emnlp.org/` | — | year subdomain |
| NAACL | `https://{YYYY}.naacl.org/` | `https://naacl.org/` | year subdomain |
| COLING | `https://coling{YYYY}.org/` | — | year in domain name |
| COLM | `https://colmweb.org/` | — | static (no year) |
| WMT | `https://www2.statmt.org/wmt{YY}/` | — | 2-digit year in path |

### ML

| Conference | Pattern | Fallback | 비고 |
|---|---|---|---|
| ICLR | `https://iclr.cc/Conferences/{YYYY}` | `https://iclr.cc/` | year in path |
| NeurIPS | `https://neurips.cc/Conferences/{YYYY}` | `https://neurips.cc/` | year in path |
| ICML | `https://icml.cc/Conferences/{YYYY}` | `https://icml.cc/` | year in path |
| AISTATS | `https://aistats.org/aistats{YYYY}/` | `https://aistats.org/` | year in path |
| AAAI | `https://aaai.org/conference/aaai/aaai-{YY}/` | `https://aaai.org/conference/aaai/` | 2-digit year, 차회 페이지 늦게 개설 |
| IJCAI | `https://{YYYY}.ijcai.org/` | `https://ijcai.org/` | year subdomain |

### CV

| Conference | Pattern | Fallback | 비고 |
|---|---|---|---|
| CVPR | `https://cvpr.thecvf.com/Conferences/{YYYY}` | `https://cvpr.thecvf.com/` | year in path |
| ICCV | `https://iccv.thecvf.com/Conferences/{YYYY}` | `https://iccv.thecvf.com/` | year in path, 홀수 해만 개최 |
| ECCV | `https://eccv.ecva.net/Conferences/{YYYY}` | `https://eccv.ecva.net/` | year in path, 짝수 해만 개최 |

### IR / Web / Data

| Conference | Pattern | Fallback | 비고 |
|---|---|---|---|
| WWW | `https://www{YYYY}.thewebconf.org/` | `https://thewebconf.org/` | year in domain name |
| WSDM | `https://wsdm-conference.org/{YYYY}/` | — | year in path |
| SIGIR | `https://sigir{YYYY}.org/` | `https://sigir.org/` | year in domain name; 간혹 `sigir-{YYYY}.org/` 변형 |
| RecSys | `https://recsys.acm.org/recsys{YY}/` | `https://recsys.acm.org/` | 2-digit year in path |
| CIKM | `https://cikm{YYYY}.<host>/` | — | host 매년 다름 (예: 2026=uniroma1.it); 검색 필수 |
| KDD | `https://kdd{YYYY}.kdd.org/` | `https://kdd.org/` | year in subdomain |
| ICDM | `http://icdm{YYYY}.<host>/` | — | host 매년 다름 (예: 2026=neu.edu.cn); 검색 필수 |

### Robotics / Speech

| Conference | Pattern | Fallback | 비고 |
|---|---|---|---|
| ICRA | `https://{YYYY}.ieee-icra.org/` | — | year subdomain |
| ICASSP | `https://{YYYY}.ieeeicassp.org/` | — | year subdomain |
| InterSpeech | `https://interspeech{YYYY}.org/` | — | year in domain name |
| CoRL | `https://www.corl.org/` | — | static (no year) |
| RSS | `https://roboticsconference.org/` | — | static (no year) |

### 패턴 분류 요약

| 패턴 유형 | 해당 학회 |
|---|---|
| `{YYYY}.<domain>` (year subdomain) | ACL, EACL, EMNLP, NAACL, IJCAI, ICRA, ICASSP |
| `<domain>{YYYY}.org` (year in domain name) | COLING, SIGIR, InterSpeech, WWW |
| `<domain>/Conferences/{YYYY}` (year in path) | ICLR, NeurIPS, ICML, CVPR, ICCV, ECCV |
| `<domain>/<prefix>{YY or YYYY}/` (subpath) | WSDM, AISTATS, AAAI, RecSys, KDD, WMT |
| host 매년 다름 (검색 필수) | CIKM, ICDM |
| static (year 없음) | CoRL, RSS, COLM |
| 2-digit year | AAAI(`aaai-27`), RecSys(`recsys26`), WMT(`wmt26`) |

---

## 7. Sub-event Labels

`sub_events[].label` 에 사용하는 표준 라벨. 일관성을 위해 아래 목록을 엄수.

| Label | 설명 | 사용 학회 예시 |
|---|---|---|
| `Student Abstract` | 학생 초록 트랙 별도 마감 | AAAI |
| `SRW` | Student Research Workshop | ACL, EACL, NAACL |
| `Abstract` | 논문 초록 사전 제출 마감 (별도 트랙) | WSDM, SIGIR 등 |
| `Industry` | Industry Track 별도 마감 | EMNLP, NAACL 등 |
| `Cycle 1` | 첫 번째 제출 사이클 | KDD |
| `Cycle 2` | 두 번째 제출 사이클 | KDD |

새 라벨 도입이 필요하면 이 룰북 표에 추가하고 커밋.

---

## 7-2. Challenges & Competitions

학회가 여는 challenge / competition / shared task 의 수록 규칙.

### 분류 규칙

| 종류 | 처리 방식 | 해당 예시 |
|---|---|---|
| **학회 공식 트랙** | 해당 학회 `sub_events` 에 `type: "challenge"` 로 추가 | KDD Cup, ICASSP SP Grand Challenge, IJCAI Competitions & Challenges, NeurIPS Competition Track, RecSys Challenge, WSDM Cup, CIKM AnalytiCup, ICDM Contest, ICRA Competitions |
| **자체 평가 캠페인** | 독립 conference row + `tags` 에 `Challenge` | WMT MT Eval, SemEval, IWSLT, FIRE, Blizzard Challenge |
| **학회 순회 challenge** | 독립 conference row + `tags` 에 `Challenge`. `venue` 는 그 해 개최 학회 기준 | Perception Test (CVPR/ICCV/ECCV 순회), AI City Challenge (2026 CVPR->ECCV 이관) |
| **워크샵 소형 challenge** | **수록하지 않음** | CVPR/ICCV/ECCV 워크샵 challenge 대다수 |

"학회 공식 트랙" 판정 기준: 학회 공식 사이트가 자체 CFP 페이지(call for competitions / challenge proposals)를 운영하는 경우. 워크샵이 개별적으로 여는 것은 공식 트랙이 아니다.

### date 기준

challenge 의 `date` 는 **참가자 시스템·결과 제출 마감** 으로 통일한다. 등록 마감, 데이터 공개일, 시스템 논문 마감, organizer 대상 제안서(proposal) 마감을 `date` 에 넣지 말 것.

organizer 대상 제안서 마감은 참가자와 무관하므로 수록 대상이 아니다. 다만 **차회 challenge 확정 시점을 예측하는 근거**로 쓰이므로 섹션 11 의 모니터링 표에 기록한다.

### 시간대 미기재 처리

challenge 는 학회 논문 CFP 와 달리 마감에 시간대를 안 적는 경우가 흔하다 (예: `"May 13, 2026"` 만 표기).

- AoE 로 가정하고 섹션 5 의 변환식 적용 (익일 `20:59` KST)
- **반드시 `predicted: true`** — 시각이 확인된 값이 아니므로
- 나중에 공식 시간대가 확인되면 `predicted: false` 로 승격

### challenge 수록 시 주의

| 함정 | 대응 |
|---|---|
| 소속 학회가 바뀜 | Perception Test 는 CVPR/ICCV/ECCV 순회, AI City 는 2026 부터 ECCV 이관, BabyLM 은 CoNLL->EMNLP 이적. 학회 `sub_events` 에 매달지 말고 독립 row 로 |
| 트랙별로 마감이 흩어짐 | TREC(트랙별 "late May"~"mid-Sept"), NTCIR(Formal Run 이 3~5개월 범위), CLEF(lab 별 상이) 는 표에 찍을 **단일 대표 마감을 뽑을 수 없어 수록 불가** |
| 중단·휴면된 시리즈를 살아있는 것으로 오인 | 2026-07 기준 확인된 중단·휴면: WWW Competitions Track(2026 신설했으나 선정작 0건), CoNLL Shared Task(2024 이후 중단), DSTC(공식 도메인 파킹 의심, 2024 공백), DIHARD(2021 이후), ComParE(2023 이후), MediaEval(2024 공백) |
| challenge 트랙이 없는 학회를 계속 뒤짐 | 전수 확인 결과 challenge 문화 자체가 없는 학회: **AISTATS**(2024~2026 4회차 확인), **RSS**(2026 워크샵 32개 확인), **COLM** |
| 지금 열려 있는 challenge 가 표에 안 잡힘 | challenge 는 학회 논문 마감보다 리듬이 늦다 (개막 3~6개월 전 확정). `upcoming` 이 차회를 가리키는 동안 현재 회차 challenge 는 열려 있어도 sub_event 로는 표현되지 않는다. 섹션 7-3 의 `open_challenges` 로 처리한다 |

---

## 7-3. Open Challenges 섹션

메인 표와 **별개**로, 회차와 무관하게 "지금 참가 제출이 열려 있는" challenge 를 보여주는 목록.

### 존재 이유

메인 표는 한 row 가 `upcoming`(차회) + `history` 구조라 다음 두 가지를 표현할 수 없다.

1. **현재 회차 challenge** — NeurIPS 2026 Competition Track 은 참가 제출이 열려 있지만, NeurIPS row 의 `upcoming` 은 2027 이고 2026 은 이미 history 로 내려갔다. 걸 자리가 없다
2. **일회성 대회** — RealPDE, AIMO Interpretability 처럼 1회로 끝나는 대회는 `history` 도 차회도 없어 row 모델에 맞지 않는다

### 데이터 위치

JSON 최상위에 `conferences` 와 나란히 둔다.

```json
{
  "schema_version": 4,
  "open_challenges_verified": "2026-07-29",
  "open_challenges": [
    {
      "name": "RealPDE Competition",
      "host": "NeurIPS 2026 Competition Track",
      "kind": "official",
      "topic": "Sim2real 유체역학 과학 기계학습",
      "date": "2026-09-28 08:59",
      "predicted": false,
      "url": "https://realpdecompetition.github.io/"
    }
  ],
  "conferences": [ ... ]
}
```

| 필드 | 타입 | 필수 | 설명 |
|---|---|---|---|
| `open_challenges_verified` | string | 필수 | 마감일을 마지막으로 확인한 날짜 `YYYY-MM-DD`. UI 에 표시됨 |
| `name` | string | 필수 | challenge 이름 |
| `host` | string | 필수 | 주최 워크샵·학회와 회차. 예: `"NeurIPS 2026 Competition Track"`, `"MRL @ EMNLP 2026"` |
| `kind` | string | 필수 | `"official"` (학회 공식 트랙) 또는 `"workshop"` |
| `topic` | string | 필수 | 주제 한 줄. UI 에서 이름 아래 표시 |
| `date` | string | 필수 | **참가자 시스템·결과 제출 마감**, KST `YYYY-MM-DD HH:MM` |
| `predicted` | boolean | 필수 | 시간대 미기재로 AoE 가정한 경우 `true` |
| `url` | string | 필수 | HTTP 200 + 컨텐츠 검증 필수 |

### 메인 표와 다른 점

| | 메인 표 | Open Challenges |
|---|---|---|
| 워크샵 소형 challenge | 수록 안 함 | **수록함** (지금 참가 가능한지가 기준이므로) |
| 마감 지난 항목 | `history` 로 보존 | **배열에서 제거** (보존 안 함) |
| 일회성 이벤트 | 수록 안 함 (history·차회 없음) | 수록함 |
| 정렬 | 마감 빠른 순 | 마감 빠른 순 (동일) |

### 수록하지 않는 것

- **시스템 논문(system description paper) 마감** — 참가 제출이 아니다. WMT26 은 2026-08 기준 시스템 논문 마감만 열려 있어 수록 대상이 아니었다
- **등록 마감, 데이터 공개일**
- **organizer 대상 제안서(proposal) 마감** — 참가자와 무관

### 자동 만료

UI 는 `date` 가 지난 항목을 렌더에서 제외하고, 남는 항목이 없으면 섹션 전체를 숨긴다. 갱신이 밀려도 **틀린 정보가 남는 게 아니라 목록이 비는 쪽으로 망가진다**. 다만 배열에 만료 항목을 방치하면 안 되므로, 갱신 시 제거한다.

### 갱신 절차

deadlines 갱신 때마다 함께 수행한다.

1. 기존 항목 중 마감 지난 것 제거
2. 남은 항목의 마감일이 **연장(extended)되지 않았는지** 확인 — challenge 는 마감 연장이 흔하다 (실측 사례: VOTS2026 06-22 -> 06-28, VoicePrivacy 2026 연장)
3. 섹션 11 의 모니터링 시점을 참고해 새로 열린 challenge 추가
4. `open_challenges_verified` 를 오늘 날짜로 갱신
5. 모든 `url` HTTP 200 + 컨텐츠 검증

> 주의: SPA(단일 페이지 앱) 로 만들어진 challenge 사이트는 원문 HTML 에 학회 키워드가 없어 컨텐츠 검증 grep 이 0건으로 나온다 (실측 사례: `chinatravel-competition.github.io`). 이 경우 `<title>` 과 호스팅 도메인으로 판단하고, 파킹 시그널만 없으면 통과시킨다.

---

## 8. Country Flag Mapping

UI의 `FLAGS` 객체 (`index.html` 내 JS)에 국가명 → 이모지 매핑. 새 venue 추가 시 해당 국가 매핑 확인/추가.

### 지원 국가 (현재 등록)

| 이모지 | 국가명 (venue 문자열 내 포함 키) |
|---|---|
| 🇮🇹 | Italy |
| 🇺🇸 | USA |
| 🇭🇺 | Hungary |
| 🇰🇷 | South Korea |
| 🇭🇰 | Hong Kong |
| 🇨🇦 | Canada |
| 🇬🇷 | Greece |
| 🇦🇹 | Austria |
| 🇧🇷 | Brazil |
| 🇨🇿 | Czechia |
| 🇦🇺 | Australia |
| 🇨🇳 | China |
| 🇩🇪 | Germany |
| 🇦🇪 | UAE |
| 🇲🇹 | Malta |
| 🇯🇵 | Japan |
| 🇫🇷 | France |
| 🇬🇧 | UK |
| 🇸🇬 | Singapore |
| 🇪🇸 | Spain |
| 🇮🇪 | Ireland |
| 🇲🇽 | Mexico |
| 🇸🇪 | Sweden |
| 🇫🇮 | Finland |
| 🇳🇱 | Netherlands |
| 🇮🇳 | India |
| 🇷🇴 | Romania |

대륙·미정값 (`"South America"`, `"TBD"`, `"Asia/Oceania (TBD)"`) 은 이모지 없음. `FLAGS` 에 없으면 UI에서 자동으로 이모지 생략.

---

## 9. Common Mistakes (Lessons Learned)

| 실수 | 올바른 방법 |
|---|---|
| URL 연도 패턴 추정 (예: `iclr.cc/Conferences/2026` 있다고 `/2027` 가정) | 반드시 `curl` 200 확인 후 사용 |
| HTTP 200만 보고 url 합격 처리 | 200 + **컨텐츠 검증** 필수. 도메인 파킹·squat 사이트는 200 반환하지만 실제 학회 사이트 아님. 의심 시그널: ① `window.location.replace` 자동 리다이렉트, ② FingerprintJS / tr_uuid 추적, ③ 무관 언어/주제 (인도네시아 포커, 러시아 광고 등), ④ 학회·논문 키워드 부재. 의심되면 학회명·연도 텍스트 grep으로 추가 검증 |
| "내가 새로 바꾼 것만" 검증 | 검증 도입·변경 시 JSON의 모든 URL 전수 검증 |
| 페이지에 차회 마감 미명시인데 `predicted: false` 로 기재 | 공식 CFP에 명시된 경우에만 `predicted: false` |
| AoE 변환 시 `13:59` 로 잘못 변환 (구 README 오류) | 실제 변환값 **익일 `20:59` KST** |
| Sub-agent에 "조사해줘" 만 지시 | "페이지 명시 정보만, 추정/외삽 금지" 명시 필수 |
| 마감 지난 학회 entry 삭제 | `history` 로 보존 (삭제 금지) |
| 사용자 의도 추정으로 혼자 결정 진행 | 선택지 제시 후 확인받고 진행 |
| `venue_confirmed: true` 이면 `predicted: false` 라고 가정 | 두 필드는 독립. venue 확정 + 마감 미발표 = `venue_confirmed: true, predicted: true` 동시 가능 |
| venue 문자열이 specific city라고 자동으로 `venue_confirmed: true` 처리 | **출처가 공식 사이트일 때만 `true`**. 제3자 트래커/짐작은 `false` (이번 세션 CVPR 2027 Seattle 케이스 — 출처 불명인데 confirmed로 라벨링됨) |
| history 같은 year에 label 없이 두 항목 추가 | multi-cycle은 반드시 `label` 필드로 구분 |
| `sub_events` 필드 자체를 누락 | `sub_events` 없으면 빈 배열 `[]` 로 명시 |
| Parent (upcoming) 가 predicted인데 sub_event도 predicted로 추가 (이중 예측) | parent 미발표면 sub_event도 미발표 상태. 단순 추측 sub_event 추가 금지. **예외**: structural invariant (KDD multi-cycle처럼 매년 동일하게 존재하는 구조)는 유지. SRW/Student Abstract 같은 derivative event는 parent 확정 후에만 추가 |

---

## 10. Examples (Reference 케이스)

### 예시 A: Predicted venue → confirmed (마감은 여전히 predicted)

ICRA 2027 공식 사이트가 "Seoul, South Korea" 명시했지만 마감 미발표:

```json
"upcoming": {
  "year": "2027",
  "date": "2027-07-01 16:59",
  "venue": "Seoul, South Korea",
  "venue_confirmed": true,
  "url": "https://2027.ieee-icra.org/",
  "predicted": true
}
```

`venue_confirmed: true` 와 `predicted: true` 가 동시에 공존 가능. venue 확인 출처는 공식 사이트 직접 확인.

---

### 예시 B: Multi-cycle 진행 (KDD)

오늘 2026-05-10. KDD 2027 Cycle 1 마감(8월 2026)이 아직 안 지남:

```json
{
  "name": "KDD",
  "upcoming": {
    "year": "2027",
    "date": "2026-08-01 20:59",
    "venue": "Toronto, Canada",
    "venue_confirmed": true,
    "url": "https://kdd2027.kdd.org/",
    "predicted": false,
    "sub_events": [
      { "label": "Cycle 2", "date": "2027-02-05 20:59", "predicted": true, "url": "https://kdd2027.kdd.org/" }
    ]
  },
  "history": [
    { "year": "2026", "date": "2026-02-08 20:59", "venue": "Singapore", "url": "https://kdd2026.kdd.org/", "label": "Cycle 2" },
    { "year": "2026", "date": "2025-08-03 20:59", "venue": "Singapore", "url": "https://kdd2026.kdd.org/", "label": "Cycle 1" }
  ]
}
```

Cycle 1 마감(2026-08-01)이 지나면:
- `sub_events` 의 Cycle 2 → upcoming main으로 승격
- 구 Cycle 1 upcoming → history 에 `label: "Cycle 1"` 로 추가

---

### 예시 C: 비공식 출처로 인한 venue_confirmed: false

ICML 2027 venue: 대륙만 발표된 경우 ("South America" 트윗, 공식 사이트 미반영):

```json
"upcoming": {
  "year": "2027",
  "venue": "South America",
  "venue_confirmed": false,
  "predicted": true
}
```

공식 사이트가 아닌 소셜미디어 출처 → `venue_confirmed: false`. UI에서 link button이 dashed border로 표시됨.

---

### 예시 D: Sub-agent 지시 템플릿

전수 검증 시 카테고리별 병렬 sub-agent 활용. 각 agent 지시 사항:

1. 담당 학회의 공식 URL을 fetch해 차회 마감일/장소 명시 여부 확인
2. **URL은 HTTP 200 검증 후에만 보고**
3. JSON 항목 vs 공식 정보 불일치를 표로 보고
4. **추정·외삽 금지 — 페이지에 명시 안 된 정보는 "no info" 로 보고**
5. AoE 마감 변환 시 반드시 익일 `20:59 KST` 사용

카테고리 분할 예시 (6 sub-agents):
- NLP: ACL / EACL / EMNLP / NAACL / COLING / COLM / WMT
- ML: ICLR / NeurIPS / ICML / AISTATS / AAAI / IJCAI
- CV: CVPR / ICCV / ECCV
- IR·Web·Data: SIGIR / WSDM / RecSys / CIKM / ICDM / KDD / WWW
- Robotics: ICRA / CoRL / RSS
- Speech: ICASSP / InterSpeech

---

## 11. 자동 갱신 트리거 (Auto-Update Workflow)

사용자 입력에 다음 트리거 문구 중 하나가 포함되면 agent는 이 절차를 자동 실행:

- `deadlines 갱신해줘`
- `deadlines 업데이트해줘`
- `/update-deadlines`

### 절차

#### Step 1 — 현재 상태 점검

- inline JSON 파싱 + 일관성 검사 (Section 4)
- 모든 URL HTTP 200 일괄 확인 (병렬 curl)
- 이상 항목 (404, 일관성 위반) 사용자에게 보고. 명백한 fix는 자동 적용, 모호하면 사용자 확인

#### Step 2 — 6개 병렬 sub-agent 디스패치

분야별 분담 (Section 10 예시 D 와 동일).

각 sub-agent 지시 템플릿:

> 오늘 날짜 [YYYY-MM-DD]. 담당 학회들의 공식 사이트를 fetch해서 다음 변화 detection:
>
> 1. **upcoming.date 정확한지** — 페이지 명시 마감과 비교
> 2. **venue 새로 발표** — TBD/추정값 → 구체적 도시·국가
> 3. **predicted → confirmed 가능한지** — 공식 발표되면 `predicted: false`
> 4. **마감 지난 것 history 이동** — `upcoming.date < today` 면 history에 push, 차회 추정으로 새 upcoming
> 5. **sub_event 새 추가/변경** — Student Abstract / SRW / Cycle 2 등
>
> 출력: 학회별 변경 사항 표 (current / proposed / source URL).
>
> **추정 금지** — 페이지에 명시 안 된 변경은 보고 안 함.
> **URL 변경 시 HTTP 200 검증 필수**.

#### Step 3 — 결과 통합 + 사용자 검토

- 6 agent 결과를 학회별 변경 표로 정리
- 사용자가 항목별 accept/reject/modify 가능
- 사용자 명시 거부 외에는 자동 적용

#### Step 4 — JSON 갱신

- inline JSON 직접 수정 (Edit 도구)
- `Last Update: YYYY-MM-DD` 텍스트 갱신
- **`open_challenges` 갱신** (섹션 7-3 의 갱신 절차): 만료 항목 제거, 연장 여부 확인, 신규 추가, `open_challenges_verified` 갱신
- 재검증:
  - JSON 유효성
  - URL HTTP 200 (변경된 것만이 아니라 전수)
  - 일관성 (필수 필드, 시간 역순, KST 포맷)
  - `open_challenges` 필수 필드 및 `kind` 값 (`official` | `workshop`)

#### Step 5 — 시각 검증

- headless Chrome 스크린샷 (desktop 1280px + mobile 600px)
- 렌더링 이상 시 사용자 보고

#### Step 6 — Commit + push

- 사용자 별도 거부 없으면 자동 commit + push
- Commit 메시지: `[hufs-dilab.github.io] Auto-update deadlines (YYYY-MM-DD)`
- 변경 학회 수 + 주요 변경 (predicted→confirmed, venue 발표 등) 본문에 요약

#### Step 2-1 — Challenge 확정 시점 모니터링

challenge 는 "제안 공모 -> 선정 -> 대회" 2단계라 학회 논문 마감보다 늦게 확정된다. 아래 시점 이후 갱신 시 해당 학회의 challenge 라인업을 함께 확인한다 (섹션 7-2 분류 규칙 적용).

| 시점 | 확정되는 것 | 확인처 |
|---|---|---|
| 매년 8월 초 | ICASSP 차년도 SP Grand Challenge 선정 | `{YYYY}.ieeeicassp.org` |
| 매년 8월 중순 | IEEE SPS SP Cup 차년도 주제 | signalprocessingsociety.org |
| 매년 9월 말 | SIGIR Futures Challenges & Competitions 선정 | sigir.org/futures |
| 매년 10월 초 | ACL/EACL/NAACL/COLING 차년도 워크샵 선정 (shared task 딸려옴) | 각 학회 Joint Call for Workshops |
| 매년 10월 말 | ICRA 차년도 competition 선정 | `{YYYY}.ieee-icra.org` |
| 매년 11월 초 | IWSLT 차년도 shared task 선정 | iwslt.org/current-calls |
| 매년 5~6월 | NeurIPS Competition Track / CIKM AnalytiCup 선정 | neurips.cc, cikm 개최년 사이트 |

2026-07 조사 기준 실측값: ICASSP 2027 선정 2026-08-07, SP Cup 2027 발표 2026-08-18, SIGIR Futures 2026-09-30, ACL 계열 워크샵 통보 2026-10-02, ICRA 2027 통보 2026-10-31, IWSLT 2027 선정 2026-11-01.

### 사용자 개입 포인트

자동 진행하지 않고 사용자 확인이 필요한 경우:
- URL 404/000 다수 발견
- 사용자가 manually 관리하던 항목과 모순 detection
- 학회 schema 자체 변경이 필요해 보일 때 (새 sub_event 라벨 등)

### 보수적 원칙

- **추정 금지** — 공식 페이지 명시 없으면 변경 안 함
- **사용자 의도 추정 금지** — 모호하면 항상 확인
- **URL 추정 금지** — 패턴으로 만든 URL은 HTTP 200 확인 후만 사용
