# ETFCTA Decision Log

This log records sovereign product, standard, evidence, publication, and independence decisions—not routine implementation changes.

## DEC-ETFCTA-001 — Category intelligence positioning

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** A fund database would not preserve how category judgments formed.
- **Decision:** ETFCTA is a governed Managed Futures ETF Category Intelligence Source.
- **Rationale:** The defensible asset is category language plus verifiable classification memory.
- **Alternatives considered:** ETF directory; editorial site; performance comparison portal.
- **Consequences:** Every tool must read from the governed truth chain.
- **Affected files:** `governance/CATEGORY-INTELLIGENCE-CHARTER.md`, `index.html`
- **Evidence of implementation:** `f4e985e`, charter precedence and interface thesis.
- **Supersedes / superseded by:** None / None

## DEC-ETFCTA-002 — Structural Fingerprints are not scores

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Filled visual intensity can imply quality or superiority.
- **Decision:** Fingerprints represent structure and knowledge state only.
- **Rationale:** Neutral state symbols preserve uncertainty without ranking funds.
- **Alternatives considered:** Radar chart; aggregate score; filled/empty quality blocks.
- **Consequences:** Scores and quality-like visual intensity are prohibited.
- **Affected files:** `spec/ECS-001-v0.1.0.md`, `index.html`, `assets/styles.css`
- **Evidence of implementation:** `52e6fca`, five-state vocabulary and UI.
- **Supersedes / superseded by:** None / None

## DEC-ETFCTA-003 — One governed truth chain

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Tools can drift into independent, unauditable factual stores.
- **Decision:** All public output follows `Fund → Source → Evidence → Decision → Change`.
- **Rationale:** Separation preserves provenance, replaceability, and history.
- **Alternatives considered:** Monolithic fund JSON; tool-specific datasets.
- **Consequences:** Cross-record references and ownership are validator-enforced.
- **Affected files:** `schemas/`, `validation/registry-validator.mjs`
- **Evidence of implementation:** `52e6fca`, `c7bbde9`.
- **Supersedes / superseded by:** None / None

## DEC-ETFCTA-004 — Evidence admission precedes publication

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Discovery or extraction alone does not establish truth.
- **Decision:** Knowledge crosses the ten-stage EAP-001 workflow before publication.
- **Rationale:** Candidates must not silently become evidence or decisions.
- **Alternatives considered:** Manual editorial approval without states; automatic filing ingestion.
- **Consequences:** Admission transitions are chronological and validator-enforced.
- **Affected files:** `protocol/EVIDENCE-ADMISSION-PROTOCOL.md`, `schemas/evidence.schema.json`
- **Evidence of implementation:** `f4e985e`, `c7bbde9`.
- **Supersedes / superseded by:** None / None

## DEC-ETFCTA-005 — Static-first, versioned publication

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** A founding registry does not require a live synchronization claim.
- **Decision:** Publish static, versioned human and machine-readable releases.
- **Rationale:** Reproducibility and auditability outrank false real-time appearance.
- **Alternatives considered:** “Latest Global Sync”; mutable API-first state.
- **Consequences:** Release date and per-record freshness replace synchronization claims.
- **Affected files:** `data/registry.json`, `governance/MACHINE-READABLE-PUBLICATION-POLICY.md`
- **Evidence of implementation:** `52e6fca`, `f4e985e`.
- **Supersedes / superseded by:** None / None

## DEC-ETFCTA-006 — No real fund before executable gate

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Example data contained a risk of unsupported claims becoming seed truth.
- **Decision:** Keep the public registry empty until schemas, rules, sufficiency, review, and negative tests pass.
- **Rationale:** Coverage growth cannot precede evidence integrity.
- **Alternatives considered:** DBMF seed record; illustrative public fund entry.
- **Consequences:** Synthetic fixtures live only under `tests/fixtures/`.
- **Affected files:** `data/registry.json`, `tests/fixtures/canonical-valid.json`
- **Evidence of implementation:** `c7bbde9`; public counts remain zero.
- **Supersedes / superseded by:** None / None

## DEC-ETFCTA-007 — Sufficiency and review are derived

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Manually asserted `pass` and arbitrary review dates could bypass governance.
- **Decision:** The validator derives sufficiency from active-rule requirements and computes review dates from named windows.
- **Rationale:** Decision status must be reproducible from admitted records.
- **Alternatives considered:** Reviewer-entered sufficiency; minimum “future date” check.
- **Consequences:** Declared and derived results must match exactly.
- **Affected files:** `protocol/rules.json`, `protocol/review-windows.json`, `validation/registry-validator.mjs`
- **Evidence of implementation:** `c7bbde9`, negative tests.
- **Supersedes / superseded by:** None / None

## DEC-ETFCTA-008 — Sprint 0C remains explicitly blocked

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** A passing synthetic chain proves mechanics, not production readiness.
- **Decision:** Fixture success does not authorize real-fund admission.
- **Rationale:** Publication also requires claims, roles, preservation, and release governance.
- **Alternatives considered:** Automatically unlock 0C after green tests.
- **Consequences:** `production_admission_authorized` remains `false` pending deliberate approval.
- **Affected files:** `protocol/release-gate.json`, `governance/RELEASE-AND-PUBLICATION-GOVERNANCE.md`
- **Evidence of implementation:** `c7bbde9` plus current release governance.
- **Supersedes / superseded by:** None / None

## DEC-ETFCTA-009 — Sprint 0B closed; canonical admission opened

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** The executable gate, active rules, derived sufficiency, review windows, decision roles, canonical fixture, and negative tests all pass.
- **Decision:** Close Sprint 0B and open Sprint 0C for one canonical real fund only: KMLM.
- **Rationale:** A single bounded admission is the smallest test of the complete real-world chain.
- **Alternatives considered:** Broader registry import; DBMF-first admission; remaining indefinitely on synthetic fixtures.
- **Consequences:** Research is limited to KMLM; production publication remains unauthorized until the complete real-fund gate passes.
- **Affected files:** `protocol/release-gate.json`, `data/registry.json`, future `sources/KMLM/`, `evidence/KMLM/`, and dossier route.
- **Evidence of implementation:** `9c57900`, green Sprint 0B gate and twelve negative tests.
- **Supersedes / superseded by:** Supersedes the operational block in DEC-ETFCTA-008 while retaining its rule that fixture success alone cannot authorize publication / None
