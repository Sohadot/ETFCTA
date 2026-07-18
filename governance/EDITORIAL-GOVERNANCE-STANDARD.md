# Editorial Governance Standard

Standard ID: `EGS-001-v0.1.0`

## Scope and inputs

Applies to visible public prose and content-manifest annotations.

## Blocking rules

- `EGS-R01`: unqualified recommendation or suitability language is prohibited.
- `EGS-R02`: marketing certainty and superiority claims are prohibited.
- `EGS-R03`: negated boundary statements are permitted and are not treated as positive claims.
- `EGS-R04`: annotated exceptions require a route, phrase, rationale, and reviewer.
- `EGS-R05`: governed reference content declares proof boundary and known limitations through its manifest.

Initial prohibited phrases include `best`, `guaranteed`, `safe`, `protects`, `will outperform`, `suitable for`, and `recommended`. Matching is contextual: `does not identify the best fund` is a permitted negated boundary. All violations block publication and are emitted to `artifacts/governance/editorial-governance.json`.
