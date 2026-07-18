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

## DEC-ETFCTA-010 — KMLM canonical fund admission

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Sprint 0C required one end-to-end real-fund admission without expanding coverage.
- **Decision:** Admit and publish KMLM as ETFCTA's sole canonical real-fund record in release 0.3.0.
- **Rationale:** Five verified official sources, six admitted evidence records, and five rule-bound decisions pass the production gate; signal horizon remains explicitly not determinable from reviewed sources.
- **Alternatives considered:** Delay publication for a standalone index methodology; infer signal horizon from daily evaluation; add a second fund.
- **Consequences:** The public registry contains one fund, one dossier, one evidence trail, and no comparison, performance claim, score, or recommendation.
- **Affected files:** `data/registry.json`, `sources/KMLM/source-pack.json`, `funds/kmlm/`, `protocol/rules.json`, `protocol/release-gate.json`
- **Evidence of implementation:** Release 0.3.0 gate and negative test suite.
- **Supersedes / superseded by:** Completes the admission opened by DEC-ETFCTA-009 / None

## DEC-ETFCTA-011 — Sprint 0D adversarial DBMF admission

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** KMLM proved the clean index-based path; ECS next required a materially different active replication strategy.
- **Decision:** Admit DBMF independently as the second and final fund in release 0.4.0.
- **Rationale:** Primary documents support active managed-futures replication, broad long/short derivatives, and a commodity subsidiary while leaving index-tracking status explicitly undetermined.
- **Alternatives considered:** Treat DBMF as tracking the SG CTA Index; reduce implementation to swaps; add a comparison page or broader import.
- **Consequences:** Registry scope is exactly KMLM plus DBMF. Unsupported benchmark and implementation shortcuts are validator-prohibited.
- **Affected files:** `data/registry.json`, `sources/DBMF/`, `funds/dbmf/`, `protocol/rules.json`, `validation/registry-validator.mjs`
- **Evidence of implementation:** Release 0.4.0 gate and negative tests.
- **Supersedes / superseded by:** Completes Sprint 0D / None

## DEC-ETFCTA-012 — Publish the public reference surface

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Two materially different fund admissions proved ECS generalization; isolated files were no longer an adequate discovery surface.
- **Decision:** Publish Sprint 1 as a static, indexable, agent-readable reference surface without expanding the fund registry.
- **Rationale:** Researchers need navigable methodology, reference language, per-fund data, and traceable structural comparison while the governed registry remains the sole factual authority.
- **Alternatives considered:** Add a third fund; broad programmatic SEO; performance comparison; migrate canonical data into many independently edited files.
- **Consequences:** The site exposes 17 governed routes, generated fund/release JSON, sitemap and metadata, and a broken-link gate. Comparison remains structural only.
- **Affected files:** `registry/`, `methodology/`, `classification-standard/`, `evidence-admission/`, `independence/`, `known-limitations/`, `reference/`, `compare/`, `data/funds/`, `data/releases/`, `route-manifest.json`
- **Evidence of implementation:** Green release validation, fourteen negative tests, and the 17-route broken-link gate.
- **Supersedes / superseded by:** Opens the public reference phase after DEC-ETFCTA-011 / None

## DEC-ETFCTA-013 — Public export boundary

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Generated fund JSON inherited internal preservation locators from the canonical registry, exposing non-portable development paths.
- **Decision:** Publish source preservation through an explicit allowlisted projection and never copy internal preservation locators into public exports.
- **Rationale:** Public provenance must remain useful without leaking implementation-local details or implying that restricted temporary paths are publicly retrievable.
- **Alternatives considered:** Delete all preservation information; make the canonical registry public-only; retain local locators with warning text.
- **Consequences:** Public exports disclose status, SHA-256, access, retrievability, and nullable public locator. Recursive negative tests reject six internal path forms.
- **Affected files:** `schemas/public-export.schema.json`, `scripts/generate-public-data.mjs`, `validation/public-export-validator.mjs`, `scripts/check-public-exports.mjs`, `data/funds/`
- **Evidence of implementation:** Two valid public exports, six passing negative leak tests, and green release/link gates.
- **Supersedes / superseded by:** Closes the deployment blocker identified after DEC-ETFCTA-012 / None

## DEC-ETFCTA-014 — Initialize category memory without invented history

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** The registry had current decisions but no append-only event establishing how those states first entered public memory.
- **Decision:** Represent each first publication as `initial_admission`, with a null previous state and the admitted decision as the new state.
- **Rationale:** Initial admission is historically meaningful but must remain distinct from a claim that the fund or its disclosure changed on the admission date.
- **Alternatives considered:** Leave change history empty; classify admissions as evidence improvements; invent pre-admission states from historical inference.
- **Consequences:** Eleven admission events establish the baseline for future fund, disclosure, evidence, rule, and correction events. Public pages state that no post-admission change exists yet.
- **Affected files:** `data/registry.json`, `schemas/change.schema.json`, `spec/vocabularies.json`, `reference/ontology.json`, `changes/`, `review-calendar/`, `funds/*/changes/`, `data/changes.json`
- **Evidence of implementation:** Green append-only validation, negative admission-history test, public export boundary, and 21-route link gate.
- **Supersedes / superseded by:** Begins Sprint 2 category memory after DEC-ETFCTA-013 / None

## DEC-ETFCTA-015 — Correct memory initialization time semantics

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Sequential minute values were generated to order the eleven initial-admission events and were not actual independent recording times.
- **Decision:** Use the actual memory-creation commit time `2026-07-18T14:55:35Z` for the full batch and order events with explicit sequence values.
- **Rationale:** `recorded_at` must represent real creation time; ordering belongs in sequence metadata.
- **Consequences:** Every baseline event declares retrospective initialization, batch `ETFCTA-MEMORY-INIT-20260718`, site release 1.1.0, and its decision-origin data release.
- **Affected files:** `data/registry.json`, `schemas/change.schema.json`, public change exports.
- **Evidence of implementation:** Commit timestamp for `64ec347` and green append-only validation.
- **Supersedes / superseded by:** Corrects generated time semantics in DEC-ETFCTA-014 / None

## DEC-ETFCTA-016 — Publish evidence intelligence without scoring

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Users could trace individual evidence but lacked a consolidated view of coverage, freshness boundaries, and open gaps.
- **Decision:** Publish qualitative evidence states, methodology gaps, source proof boundaries, and a governed challenge route.
- **Rationale:** Evidence strength and absence must be operationally visible without collapsing heterogeneous states into a score.
- **Consequences:** Coverage uses complete, corroborated, unresolved, missing, not available, and not assessed states. External link recency and newer-version status remain explicitly unverified in Sprint 3.
- **Affected files:** `evidence-status/`, `methodology-gaps/`, `sources/`, `evidence-challenge/`, `data/evidence-status.json`, `data/methodology-gaps.json`
- **Evidence of implementation:** Public export boundary, evidence pages, machine exports, and challenge workflow.
- **Supersedes / superseded by:** Opens Sprint 3 after corrected category-memory initialization / None

## DEC-ETFCTA-017 — Establish the Governance Automation Layer

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** Expanding the reference corpus before its production controls are stable would multiply later review and migration risk.
- **Decision:** Establish GAL-001 as the mandatory, fail-closed control plane for all future public knowledge and deliver it through Sprints 4A–4D before Sprint 5 corpus expansion.
- **Rationale:** Knowledge quality must be produced by a governed system, not recovered through retrospective cleanup.
- **Consequences:** Nine ordered gates have stable IDs, owners, delivery sprints, checks, and measurable outputs. Planned controls cannot be reported as executed or passed.
- **Affected files:** `governance/GOVERNANCE_AUTOMATION_CHARTER.md`, `protocol/governance-automation.json`, `scripts/check-governance-contract.mjs`, `protocol/release-gate.json`
- **Evidence of implementation:** Executable contract check covering all nine layers and their declared metrics.
- **Supersedes / superseded by:** Opens Sprint 4A after DEC-ETFCTA-016 / None

## DEC-ETFCTA-018 — Enforce the first four GAL gates

- **Date:** 2026-07-18
- **Status:** Ratified
- **Context:** GAL-001 defined controls and measurements but did not yet execute page-level governance or emit gate evidence.
- **Decision:** Enforce content governance, reference integrity, editorial governance, and technical quality for every admitted public route before publication.
- **Rationale:** Reference-corpus expansion remains unsafe until authored pages are evidence-linked, connected, bounded, and technically valid by construction.
- **Consequences:** All 25 routes require content manifests; four gate reports emit measurements and stable violations; 14 adversarial fixtures must fail; Sprint 5 remains blocked pending 4C and 4D.
- **Affected files:** `content/content-manifest.json`, `governance/*-STANDARD.md`, `validation/governance-gates.mjs`, `scripts/run-governance-gates.mjs`, `tests/governance-gate-suite.mjs`
- **Evidence of implementation:** Four passing GAL artifacts, zero gate violations, and all negative fixtures rejected.
- **Supersedes / superseded by:** Executes the Sprint 4B controls declared by DEC-ETFCTA-017 / None
