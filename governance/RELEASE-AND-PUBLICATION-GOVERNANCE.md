# Release and Publication Governance

## Release candidate

A release candidate MUST identify its commit SHA, ECS/EAP/schema/validator versions, registry counts, known limitations, migration notes, rollback point, and approver. Publication requires:

1. executable release gate passes;
2. fixture and negative tests pass;
3. canonical links and preservation locators are checked;
4. accessibility and responsive smoke checks pass;
5. claims are reviewed against the Claims and Inference Boundary;
6. HTML and machine-readable current state agree;
7. no required review is overdue;
8. prohibited placeholders and synthetic fixture IDs are absent from public data;
9. changelog and release archive are complete.

A release MUST NOT publish when admitted evidence is missing, a current source withdrawal is unresolved, a canonical route is broken, human and machine output disagree, or the validator is not green.

## Approval and rollback

The Publisher records approval with timestamp and commit SHA. The approver MUST NOT approve while recused. Rollback restores the last archived release, publishes an incident entry when public output was affected, and never deletes already cited release metadata.

Sprint 0C remains blocked while `production_admission_authorized` is false, regardless of fixture success.

