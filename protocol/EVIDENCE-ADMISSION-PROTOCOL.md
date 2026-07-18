# Evidence Admission Protocol

Protocol version: 0.1.0  
Applies to: ECS-001 v0.1.0  
Status: founding operational protocol

No information enters the public registry unless it completes this sequence:

`Discover source → Verify identity → Preserve version → Extract bounded evidence → Apply named ECS rule → Record limitations → Set review date → Publish decision → Monitor for change → Correct publicly when necessary`

## 1. Discover source

Create a candidate source record. Discovery is not verification and MUST NOT create public evidence or decisions.

## 2. Verify identity

Confirm title, issuer or originator, authority, document type, applicable date, retrieval date, and stable locator. Filed material MUST include its filing form and accession number when available.

## 3. Preserve version

Record a SHA-256 hash of the exact reviewed bytes and a preservation locator. If preservation is legally or technically unavailable, record that limitation and keep the source ineligible for `preserved` status.

## 4. Extract bounded evidence

An evidence record MUST describe one bounded observation, identify an exact location, and use an original-language summary. A verbatim excerpt is optional and MUST obey the quotation policy in ECS-001.

## 5. Apply named ECS rule

Evidence does not classify itself. A decision MUST point to one active, versioned rule in the rule registry. Rules state their required evidence types and minimum sufficiency.

## 6. Record limitations

The decision MUST disclose unresolved scope, missing documents, conflicting observations, interpretation risk, and other material constraints. An empty limitations array is an affirmative assertion that no material limitation was identified.

## 7. Set review date

The decision's review date MUST be computed from the applicable review-window policy and MUST be later than the decision date. A stricter rule or known source event MAY shorten the window.

## 8. Publish decision

Only `admitted` evidence can support a published decision. `confirmed` requires rule-level sufficiency; otherwise the decision is `provisional`, `needs_review`, or `withdrawn`.

## 9. Monitor for change

Monitoring creates source candidates, not automatic truth. A detected filing or disclosure change MUST re-enter the protocol at source verification.

## 10. Correct publicly

Published decisions are never silently overwritten. Corrections and withdrawals MUST create a change event, preserve the previous state, identify the cause, and link the replacement or withdrawal decision.

## Admission states

`candidate → identity_verified → preserved → extracted → admitted`

Terminal or exceptional states are `rejected`, `withdrawn`, and `superseded`. State transitions MUST be timestamped in the evidence admission history.

