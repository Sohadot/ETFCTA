# Classification Decision Governance

## Logical roles

Every workflow records the acting role even when one person performs multiple roles:

- **Extractor** locates and summarizes bounded evidence.
- **Classifier** applies a named ECS rule.
- **Reviewer** challenges sufficiency, conflicts, inference, and limitations.
- **Publisher** confirms release eligibility.
- **Corrector** initiates a correction or withdrawal.

An actor record MUST include a stable actor ID, role, action timestamp, and declared conflict state. Extraction and classification are separate actions. Issuer-supplied text is never self-admitting.

## Decision states

- `provisional`: minimum evidence is incomplete or independent review is pending.
- `confirmed`: the validator derives sufficiency `pass`, limitations are recorded, and review is complete.
- `needs_review`: conflict, expiry, source event, challenge, or rule migration requires reassessment.
- `withdrawn`: evidence or governance no longer permits the result to remain current.

A decision is blocked when no active rule applies, required evidence is not admitted, conflict behavior prohibits a result, or the reviewer must recuse and no replacement is available.

## Review independence

A second reviewer is required for unresolved conflicts, corrections affecting a public result, issuer-funded research, and promotion from provisional when the classifier also extracted the decisive evidence. During the solo-operator phase, the same person MAY perform multiple roles only when role timestamps remain separate and the decision discloses the lack of independent second review; such a decision cannot bypass a rule that explicitly requires two reviewers.

Issuer preview may identify factual or locator errors but cannot approve, suppress, or negotiate classification outcomes.

