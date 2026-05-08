# Deadlines Maintenance

`deadlines.json` 을 정기적으로 갱신해 conference/challenge 마감일 페이지를 최신 상태로 유지한다.

## 데이터 위치

- `deadlines.json` — 항목 배열. 각 항목 필드:
  - `name` (필수): 학회명 + 연도
  - `date` (필수): `YYYY-MM-DD HH:MM` 포맷 (KST). AoE 마감(UTC 23:59)은 KST 익일 13:59 = `다음날 13:59`로 변환하거나 출처 표기 시간을 그대로 사용
  - `url` (필수): 공식 사이트
  - `tags` (필수): `NLP|ML|AI|CV|IR|Robotics|Speech|Data|Web|Student|Challenge` 중
  - `venue` (필수): 도시/국가, 미정이면 `TBD`
  - `predicted` (선택, true): 작년 일정 기준 추정. 공식 발표되면 제거
- `index.html` line 272 — `Last Update: YYYY-MM-DD` 매 갱신마다 업데이트

## 정기 점검 절차

1. **Last Update 확인** — 2주 이상 경과했으면 전체 검증 권장
2. **지난 마감 처리** — `date` 가 오늘보다 과거인 Upcoming 항목:
   - 차회(다음 연도) 정보가 있으면 → `name` 연도 +1, `predicted: true` 추가, `url`/`venue` 차회 정보로 갱신
   - 차회 정보 없으면 → 동일 항목을 `predicted: true` 만 추가하고 `date` +1년 (잠정 추정)
3. **Predicted → Upcoming 승격** — 공식 CFP가 발표된 항목은 `predicted: true` 제거 + 정확한 날짜/장소
4. **Venue / URL 갱신** — TBD 였던 항목 중 발표된 곳, outdated 연도 URL (예: `2026.aclweb.org` → `2027.aclweb.org`)
5. **`index.html` Last Update 갱신**

## 검증 소스 (우선순위 순)

1. 공식 학회 사이트 (Call for Papers 페이지)
2. [aideadlin.es](https://aideadlin.es/) — AI/ML/NLP/CV/Robotics 전반
3. [ccfddl.com](https://ccfddl.github.io/) — 중국어 커뮤니티 트래커, 빠른 업데이트
4. [paperpilot.com/deadlines](https://www.getpaperpilot.com/deadlines/), [mlciv.com/ai-deadlines](https://mlciv.com/ai-deadlines/), [trybibby.com/conference-deadlines](https://trybibby.com/conference-deadlines)
5. 공식 X(Twitter) 계정의 CFP 공지

## URL 검증 규칙 (필수)

- **추정 URL을 검증 없이 저장 금지**. 학회 차회 사이트가 미개설인 경우 다수
- 후보 URL은 `url-patterns.md` 카탈로그를 참고해 생성 → `curl -s -L -o /dev/null -w "%{http_code}" <url>` 로 200 확인
- subagent에 위임할 때도 "URL은 HTTP 200 확인 후에만 기재" 명시, 결과 받을 때 재검증

### URL 우선순위 (높은 → 낮은)

1. **차회 공식 사이트** (예: `https://2027.eacl.org/`)
2. **공식 모학회 사이트의 차회 공지/announcement 페이지** — 차회 페이지가 없어도 모학회 사이트에서 "AAAI-27 will be held in Montreal, January 2027"같이 명시한 페이지가 있으면 그것을 link로 사용 (사용자가 클릭했을 때 일정·장소를 확인할 수 있는 근거 링크)
3. **부모 도메인** (예: `https://aaai.org/conference/aaai/`) — 위 둘 다 없을 때 최후 수단

### 검증 규칙을 도입/변경할 때

규칙을 추가하면 그 시점의 **JSON 안의 모든 URL을 즉시 전수 검증**할 것. "내가 새로 바꾼 것만 확인"은 검증이 아님. 한 번에:

```bash
python3 -c "import json; [print(x['url']) for x in json.load(open('deadlines/deadlines.json'))]" \
  | xargs -I{} sh -c 'echo "$(curl -s -L -o /dev/null -w "%{http_code}" "{}") {}"'
```

## 시간대 규칙

- 대부분 학회는 **AoE (Anywhere on Earth)** = UTC-12 사용 → 마감 시점 = UTC 23:59 = **KST 익일 13:59**
- `deadlines.json` 의 시간은 KST 기준. 출처가 명확하지 않으면 보수적으로 KST 당일 20:59 정도로 표기 (기존 관례)

## 자동화 힌트

전체 일괄 검증은 토큰을 많이 쓰므로 researcher subagent (sonnet) 위임 권장. 입력으로 현재 JSON 전체 + 오늘 날짜를 넘기면 검색·갱신·저장까지 한 번에 처리 가능.
