# Ontology Governance Standard

Standard ID: `OGS-001-v0.1.0`

## Scope

Applies to registered entities, relationship types, relationship instances, and governed identifiers across the registry, rules, evidence, sources, and terms.

## Blocking rules

- `OGS-R01`: every relationship type is registered with a permitted subject and object kind.
- `OGS-R02`: every relationship endpoint resolves to a governed entity.
- `OGS-R03`: subject and object kinds match the relationship signature.
- `OGS-R04`: relationship IDs and entity IDs are unique.
- `OGS-R05`: entity renames require an explicit migration record.
- `OGS-R06`: a decision may relate only to its owning fund and active governing rule.

All violations block publication. Ontology expansion is outside Sprint 4C; this standard only governs entities and relations already needed by the current registry. Evidence is emitted to `artifacts/governance/ontology-governance.json`.
