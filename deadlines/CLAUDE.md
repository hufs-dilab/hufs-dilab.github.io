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
| `upcoming.url` | string | 필수 | 공식 사이트. HTTP 200 검증 필수 |
| `upcoming.predicted` | boolean | 필수 | 마감 예측치 여부. 공식 발표 시 `false` |
| `upcoming.sub_events` | array | 선택 | 같은 회차의 부속 마감 (Student Abstract, SRW, Cycle 2 등) |
| `upcoming.sub_events[].label` | string | 필수 | 부속 이벤트 라벨 (섹션 7 참고) |
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
| `Cycle 1` | 첫 번째 제출 사이클 | KDD |
| `Cycle 2` | 두 번째 제출 사이클 | KDD |

새 라벨 도입이 필요하면 이 룰북 표에 추가하고 커밋.

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

대륙·미정값 (`"South America"`, `"TBD"`, `"Asia/Oceania (TBD)"`) 은 이모지 없음. `FLAGS` 에 없으면 UI에서 자동으로 이모지 생략.

---

## 9. Common Mistakes (Lessons Learned)

| 실수 | 올바른 방법 |
|---|---|
| URL 연도 패턴 추정 (예: `iclr.cc/Conferences/2026` 있다고 `/2027` 가정) | 반드시 `curl` 200 확인 후 사용 |
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
- 재검증:
  - JSON 유효성
  - URL HTTP 200 (변경된 것만이 아니라 전수)
  - 일관성 (필수 필드, 시간 역순, KST 포맷)

#### Step 5 — 시각 검증

- headless Chrome 스크린샷 (desktop 1280px + mobile 600px)
- 렌더링 이상 시 사용자 보고

#### Step 6 — Commit + push

- 사용자 별도 거부 없으면 자동 commit + push
- Commit 메시지: `[hufs-dilab.github.io] Auto-update deadlines (YYYY-MM-DD)`
- 변경 학회 수 + 주요 변경 (predicted→confirmed, venue 발표 등) 본문에 요약

### 사용자 개입 포인트

자동 진행하지 않고 사용자 확인이 필요한 경우:
- URL 404/000 다수 발견
- 사용자가 manually 관리하던 항목과 모순 detection
- 학회 schema 자체 변경이 필요해 보일 때 (새 sub_event 라벨 등)

### 보수적 원칙

- **추정 금지** — 공식 페이지 명시 없으면 변경 안 함
- **사용자 의도 추정 금지** — 모호하면 항상 확인
- **URL 추정 금지** — 패턴으로 만든 URL은 HTTP 200 확인 후만 사용
