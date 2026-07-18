# ETFCTA

ETFCTA is the governed category intelligence source for managed-futures ETF structure, evidence, and change. Sprint 0A established the architecture of truth; **Sprint 0B — Evidence Admission Protocol** governs how knowledge may enter it before any real fund is admitted.

The [Category Intelligence Charter](governance/CATEGORY-INTELLIGENCE-CHARTER.md) has precedence over individual sprints, routes, tools, and commercial surfaces.

Institutional memory is separated by purpose:

- [Decision Log](governance/DECISION_LOG.md) explains why sovereign choices were made.
- [Changelog](CHANGELOG.md) records what changed.
- [Release Index](releases/RELEASE_INDEX.md) records what was actually published or remains a candidate.
- [Known Limitations](governance/KNOWN_LIMITATIONS.md) and [Risk Register](governance/RISK_REGISTER.md) state current boundaries and threats.
- [Transparency Register](governance/TRANSPARENCY-AND-DISCLOSURE-REGISTER.md) records current operational disclosures.

## Run locally

Open `index.html` directly, or serve the repository with any static file server.

## Validate the architecture

```powershell
node scripts/validate.mjs
```

The validator applies the JSON Schema keywords used by this repository (`type`, `enum`, `const`, `pattern`, formats, collection bounds, nested properties, `oneOf`, and `anyOf`) and then checks ontology, glossary, admission history, source preservation, active rules, derived sufficiency, exact review windows, fund-decision ownership, and change continuity without third-party dependencies.

## Founding rule

No fund, quotation, source, evidence, decision, or change event is published until it can pass the repository's evidence and provenance rules. The `data/` collections are intentionally empty in v0.1.0.

The operational sequence is:

`Discover → Verify → Preserve → Extract → Apply rule → Record limits → Set review → Publish → Monitor → Correct`
