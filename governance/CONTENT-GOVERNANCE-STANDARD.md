# Content Governance Standard

Standard ID: `CGS-001-v0.1.0`

## Scope and inputs

Applies to every route in `route-manifest.json`. Inputs are `content/content-manifest.json`, public HTML, and the governed registry.

## Blocking rules

- `CGS-R01`: every public route has exactly one published manifest entry.
- `CGS-R02`: every claim has a declared knowledge type.
- `CGS-R03`: every evidence-bearing claim resolves to admitted evidence through a decision or explicit evidence ID.
- `CGS-R04`: every evidence ID resolves to a source ID.
- `CGS-R05`: every quotation has a bounded locator.
- `CGS-R06`: every page declares review and review-due dates.
- `CGS-R07`: every page declares known limitations or the explicit `none_material_known` state.

All rules block publication. No exception may silently remove a claim from the manifest. Metrics and violations are emitted to `artifacts/governance/content-governance.json`. Rule or metric meaning changes require a Decision Log entry and standard version change.
