# Governance Automation Layer Charter

Adopted: 18 July 2026

Charter ID: `GAL-001`

Contract: `protocol/governance-automation.json`

## Governing principle

> No knowledge enters the corpus directly. It enters through governance.

GAL is the mandatory control plane between authored material and publication. It governs claims, evidence, terminology, routes, technical integrity, security, and releases. Passing editorial review alone never authorizes publication.

## Scope and authority

GAL applies to every public HTML page, machine-readable export, registry record, reference object, source record, evidence record, classification decision, schema, ontology term, and release artifact. The executable release command MUST invoke every gate marked `enforced` in the machine contract. A failed blocking gate prevents publication; bypasses are prohibited. An unavailable required check fails closed.

The contract is intentionally compact. A separate normative standard is created only when implementation of its gate begins and the existing governance documents cannot state its rules without ambiguity.

## Gate model

The nine ordered layers are:

1. Content governance
2. Reference integrity
3. Knowledge consistency
4. Evidence governance
5. Ontology governance
6. Editorial governance
7. Technical quality
8. Security and supply chain
9. Release governance

Each gate declares an owner role, implementation sprint, enforcement state, inputs, checks, metrics, blocking semantics, and evidence artifact. Gate order is normative. Later gates MUST NOT conceal failure in an earlier gate.

## Measurement contract

PASS/FAIL alone is insufficient. Every executed gate MUST emit:

- gate and contract versions;
- evaluated commit and timestamp;
- result: `pass`, `fail`, or `not_run`;
- every declared metric with value, unit, target, numerator and denominator when applicable;
- violations with stable rule IDs and affected entity IDs;
- the checker version and evidence artifact path.

`not_run`, `not_measured`, and unavailable dependencies are explicit states, never zero. Percentages MUST expose their numerator and denominator. A gate may pass only when all blocking targets are satisfied.

## Change control

Changing gate order, blocking behavior, metric meaning, or an enforced rule requires a Decision Log entry and a compatible version change. Renaming a metric or entity requires a migration mapping. Removing an enforced check is a governance-breaking change.

## Delivery sequence

- **Sprint 4A:** charter and executable contract validation.
- **Sprint 4B:** content, reference-integrity, editorial, and technical-quality gates.
- **Sprint 4C:** knowledge-consistency and ontology gates.
- **Sprint 4D:** evidence hardening, security/supply-chain, release orchestration, and metrics publication.
- **Sprint 5:** reference-corpus expansion, only after all blocking GAL layers are enforced.

Sprint 4A does not claim that planned checks have run. The contract distinguishes `enforced`, `partial`, and `planned` states so governance maturity cannot be overstated.
