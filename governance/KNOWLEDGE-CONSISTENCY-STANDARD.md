# Knowledge Consistency Standard

Standard ID: `KCS-001-v0.1.0`

## Scope

Applies to canonical definitions, published reference definitions, aliases, general claims, derivations, content manifests, and definition migrations.

## Blocking rules

- `KCS-R01`: term IDs, labels, aliases, and definitions are unique.
- `KCS-R02`: a published definition exactly matches its canonical definition.
- `KCS-R03`: glossary and canonical term registry agree for shared terms.
- `KCS-R04`: prohibited or undeclared aliases cannot appear as governed labels.
- `KCS-R05`: definition fingerprints are immutable without a versioned migration and Decision Log reference.
- `KCS-R06`: every general claim has an approved type, derivation or source basis, and admitted publication routes.
- `KCS-R07`: derived numeric claims equal current governed data and their rendered value appears on every declared route.
- `KCS-R08`: deep content types declare at least one page-specific limitation.

All violations block publication. Evidence is emitted to `artifacts/governance/knowledge-consistency.json`.
