# Conference URL Patterns

마감일 갱신 시 URL 후보를 빠르게 추정하기 위한 카탈로그. **패턴은 후보일 뿐, 사용 전 반드시 `curl` 200 확인** (deadlines/README.md 참고).

`{YYYY}` = 4자리 연도, `{YY}` = 2자리 연도.

## NLP

| Conference | Pattern | Fallback | 비고 |
|---|---|---|---|
| ACL | `https://{YYYY}.aclweb.org/` | `https://www.aclweb.org/` | |
| EACL | `https://{YYYY}.eacl.org/` | — | |
| EMNLP | `https://{YYYY}.emnlp.org/` | — | |
| NAACL | `https://{YYYY}.naacl.org/` | `https://naacl.org/` | |
| COLING | `https://coling{YYYY}.org/` | — | year-in-domain |
| COLM | `https://colmweb.org/` | — | static (no year) |
| WMT | `https://www2.statmt.org/wmt{YY}/` | — | 2-digit year |

## ML

| Conference | Pattern | Fallback | 비고 |
|---|---|---|---|
| ICLR | `https://iclr.cc/Conferences/{YYYY}` | `https://iclr.cc/` | |
| NeurIPS | `https://neurips.cc/Conferences/{YYYY}` | `https://neurips.cc/` | |
| ICML | `https://icml.cc/Conferences/{YYYY}` | `https://icml.cc/` | |
| AISTATS | `https://aistats.org/aistats{YYYY}/` | `https://aistats.org/` | |
| AAAI | `https://aaai.org/conference/aaai/aaai-{YY}/` | `https://aaai.org/conference/aaai/` | 2-digit year, 차회 페이지 늦게 개설 |
| IJCAI | `https://{YYYY}.ijcai.org/` | `https://ijcai.org/` | |

## CV

| Conference | Pattern | Fallback | 비고 |
|---|---|---|---|
| CVPR | `https://cvpr.thecvf.com/Conferences/{YYYY}` | `https://cvpr.thecvf.com/` | |
| ICCV | `https://iccv.thecvf.com/Conferences/{YYYY}` | `https://iccv.thecvf.com/` | |
| ECCV | `https://eccv.ecva.net/Conferences/{YYYY}` | `https://eccv.ecva.net/` | |

## IR / Web / Data

| Conference | Pattern | Fallback | 비고 |
|---|---|---|---|
| WWW | `https://www{YYYY}.thewebconf.org/` | `https://thewebconf.org/` | |
| WSDM | `https://wsdm-conference.org/{YYYY}/` | — | year-in-path |
| SIGIR | `https://sigir{YYYY}.org/` (또는 `sigir-{YYYY}.org/`) | `https://sigir.org/` | host varies |
| RecSys | `https://recsys.acm.org/recsys{YY}/` | `https://recsys.acm.org/` | 2-digit year |
| CIKM | `https://cikm{YYYY}.<host>/` | — | host 매년 다름 (예: 2026=uniroma1.it) |
| KDD | `https://kdd{YYYY}.kdd.org/` | `https://kdd.org/` | |
| ICDM | `http://icdm{YYYY}.<host>/` | — | host 매년 다름 (예: 2026=neu.edu.cn) |

## Robotics / Speech

| Conference | Pattern | Fallback | 비고 |
|---|---|---|---|
| ICRA | `https://{YYYY}.ieee-icra.org/` | — | |
| ICASSP | `https://{YYYY}.ieeeicassp.org/` | — | |
| InterSpeech | `https://interspeech{YYYY}.org/` | — | |
| CoRL | `https://www.corl.org/` | — | static |
| RSS | `https://roboticsconference.org/` | — | static |

## 패턴 분류 요약

- **`{YYYY}.<domain>`** (year subdomain): ACL, EACL, EMNLP, NAACL, IJCAI, ICRA, ICASSP
- **`<domain>{YYYY}.org`** (year in domain name): COLING, SIGIR, InterSpeech
- **`<domain>/Conferences/{YYYY}`** (year in path, with fallback): ICLR, NeurIPS, ICML, CVPR, ICCV, ECCV
- **`<domain>/<year-or-prefix>/`** (subpath): WSDM, AISTATS, AAAI, RecSys, KDD
- **Host varies by year** (검색 필수): CIKM, ICDM
- **Static (no year)**: CoRL, RSS, COLM
- **2-digit year**: AAAI(`aaai-27`), RecSys(`recsys26`), WMT(`wmt26`)

## 사용 절차

1. 위 패턴으로 후보 URL 생성
2. `curl -s -L -o /dev/null -w "%{http_code}" <url>` 로 확인
3. 200 → 사용 / 404·DNS 실패 → fallback (없으면 차회 페이지 미개설로 판단, 부모 도메인 또는 가장 최근 운영 사이트 사용)
4. CIKM/ICDM 처럼 host 매년 다른 경우 aideadlin.es / 공식 X 계정 검색
