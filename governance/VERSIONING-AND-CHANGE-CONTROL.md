# Versioning and Change Control

Adopted: 18 July 2026

## Governing rule

> The meaning of a published record MUST NOT change without a version change or an explicit change event.

ETFCTA versions five independently addressable components: ECS, EAP, JSON Schemas, registry releases, and the validator. Every release archive MUST name the active version of each component.

## Semantic versioning

- **MAJOR** — changes classification meaning, removes or renames a public value, breaks a machine-readable contract, or requires reinterpretation of historical records.
- **MINOR** — adds a backward-compatible rule, dimension, field, state, or validation capability.
- **PATCH** — corrects implementation or wording without changing normative meaning or a published classification.

Normative rule text and released schemas are immutable. Corrections create a new version; Git history is not a substitute for an explicit version.

## Compatibility and migration

A rule or schema change MUST declare whether it is compatible. An incompatible change MUST include a migration note, affected record query, rollback point, deprecation entry, and target completion date. Historical decisions retain the version under which they were made.

When a new ECS version can change an existing result, every affected decision enters `needs_review`. Re-evaluation creates a new decision and, when the result or governing interpretation changes, a `rule_changed` change event. The prior decision is preserved.

## Release control

Registry releases MUST never be edited in place. A failed release is superseded or rolled back using the procedure in `RELEASE-AND-PUBLICATION-GOVERNANCE.md`. Release archives identify exact commits; a release candidate without a commit SHA is not a published release.

