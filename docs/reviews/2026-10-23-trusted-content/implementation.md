# Trusted content scope and evidence — 2026-10-23

This change registers evidence and enforces version validity. It is not a claim of clinical approval, certification, or re-verification of all historical cases.

## Coverage

- 50/50 substance records have `evidenceId` and `ruleVersion`, resolving into the shared registry. 44 have source checks scoped to the recorded classification/route/exception. Six (glucagon, paracetamol, ibuprofen, aspirin, cetirizine, loratadine) remain `pending_verification`: no retained individual official permission evidence in this pass. They are not relabeled prohibited. Both APIs and the frontend return unknown/unverified with no permission, no route decision and no `needsTUE=false` for these records.
- 16/16 frontend questions have official sources and section/page locators. Revision notes record the ILIB FAQ correction and hypoxic-chamber sport-rule caveat. Existing questionnaire remains available.
- 70/70 backend questions inventoried. Only question 1 (S1 classification) was checked here; 69 are pending and have unknown applicable version. API GET retains inventory and publication status but nulls answers/explanations; POST returns `correct:null` for pending items. Education does not consume these quizzes and now links explicitly to `/quiz`.
- No individual named clinical sign-off or institution endorsement is claimed. Responsible roles are maintenance/editorial roles, not professional approval identities.
- 30 selected teaching records copy actual existing reviewed facts, outcomes and source links exactly. They add clearly labeled teaching role actions and discussion questions. Original `sourceCheckedAt`, review scope and uncertainty remain; preparation date is separate.
- Evidence queue covers all 517 existing records: P1 196 (unresolved fields, changed-after-review claims or limited excerpt review); P2 315 (unknown outcomes); P3 6 (routine follow-up). These are maintenance priorities, not findings that 196 cases are incorrect. No new case evidence verification performed. Unknown medals/results remain null.

## Official evidence checked in this pass

- [2026 WADA List](https://www.wada-ama.org/sites/default/files/2025-09/2026list_en_final_clean_september_2025.pdf): sections/pages mapped per registry record, including S3 p9, S5 p12, S6 p15–16, M1/M2 p13, S9 p19, P1 p20.
- [2026 Monitoring Program](https://www.wada-ama.org/sites/default/files/2025-09/2026_list_monitoring_program_en_final_clean_september_2025.pdf): narcotics item5, caffeine item4, semaglutide/tirzepatide markers item6.
- [WADA List FAQ](https://www.wada-ama.org/en/prohibited-list): named questions on platelet-derived preparations, intravenous laser therapy, hypoxic chambers, CBD and IV infusions. The intravenous laser FAQ states it is prohibited under M1.3; old “may fall under” wording was corrected. Non-invasive methods cannot be assumed equivalent.
- [2027 official resource](https://www.wada-ama.org/en/resources/2027-prohibited-list): publication 2026-09-21; approved 2026-09-10; effective 2027-01-01. Only announcement/activation dates verified here; no blanket 2027 rule migration or approval claimed.
- [2021 Code](https://www.wada-ama.org/sites/default/files/resources/files/2021_wada_code.pdf): 2.1.1, 4.3.1/4.3.2, 10.2 and reduction/aggravation rules,20.5.
- [2023 ISTI](https://www.wada-ama.org/sites/default/files/2022-12/isti_2023_w_annex_k_final_clean.pdf): Annex B B.4.3–B.4.5 for minors/representation.
- [CTADA 115-year exam announcement](https://www.antidoping.org.tw/news/測驗平台公告/): specific named event scope preserved; no extrapolation to every competition/year.
- [CTADA organization](https://www.antidoping.org.tw/organization/) and [official consultation](https://www.antidoping.org.tw/consult/).
- [WADA ADHD v7.1](https://www.wada-ama.org/sites/default/files/2023-12/tue_physician_guidelines_adhd_-_version_7.1_-_october_2023.pdf): non-prohibited alternatives p3/5; corrected atomoxetine note so it no longer implies prior failed non-stimulant treatment is always required.
- [WADA cardiovascular guideline](https://www.wada-ama.org/sites/default/files/2022-01/cardiovascular_conditions_v_2.0_jan2018_en.pdf): non-prohibited alternative classes p10 (CCB/angiotensinII inhibitors); class-based support is not product certification.
- [GC/TUE September2025](https://www.wada-ama.org/sites/default/files/2025-09/glucocorticoids_and_therapeutic_use_exemptions_september_2025.pdf) and [male hypogonadism v9 January2026](https://www.antidoping.org.tw/wp-content/uploads/2026/03/tue_physician_guidelines_male_hypogonadism_-_version_9_-_january_2026.pdf) preserve the existing scoped guidance.

## Implementation and maintenance

Registry: `backend/data/content-registry.json`; pure shared guard: `shared/content-evidence.mjs`. Entry metadata inherits year/effective dates from the named version. Guard checks known source+locator, checked status, active matching version, inclusive start/exclusive end and review deadline. Default is local calendar date; callers can pass an explicit `YYYY-MM-DD` for deterministic tests. It does not automatically activate2027.

Public routes: `/sources` (including `?id=drug:salbutamol` and `#rule-transition`), `/editorial-policy`, `/case-learning` (`#evidence-queue`). Quick lookup, decision result and quiz explanations provide direct official links and registry details. Policy explains correction flow, real existing public contact, pending disclosure and lack of certification.

Regenerate case derivatives with `node scripts/build-trusted-cases.mjs`; change `data/case-teaching-selection.json` deliberately to curate teaching. The generator rejects changed/flagged/non-core-reviewed candidates; it never rewrites `data/cases.json`. Review queue preserves current flags and unknowns. Teaching recommendations are authored here, not attributed to parties or sources as quoted fact.

2027 activation requires separately reviewing per-record changes and updating sources/metadata/content, then running date/S5/API contracts and updating activationStatus. New date alone must not enable stale rules. Pending drugs require saved official ingredient/route/condition evidence, not only a negative list search.

## Verification at this change boundary

- `npm --prefix frontend test`:87 tests passed, including9 new date/source guard cases; existing S5 coverage retained. Context-only fixtures now include evidence identity. The old unverified glucagon “permitted” example was replaced with source-supported guanfacine.
- `npm --prefix frontend run lint`: passed.
- `node --test tests/trusted-content.test.mjs tests/trusted-content-api.test.mjs tests/education-rules.test.mjs tests/cloudflare-contract.test.mjs`:42 passed (includes root's concurrent feedback contracts). Tests cover real Pages response redaction,2027 boundary and the whole legacy inventory.
- `npm test -- backend/__tests__/education.test.js backend/__tests__/tue.test.js`:26 passed with loopback binding permitted. Initial sandbox-only run was blocked by `listen EPERM`; it was not an application failure.
- No deployment, full517 source reopening, browser/visual verification, clinical sign-off or delivery claim is made in this subtask. Root owns final browser/build/release integration.
