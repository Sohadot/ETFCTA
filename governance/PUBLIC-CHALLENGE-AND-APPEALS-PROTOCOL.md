# Public Challenge and Appeals Protocol

Anyone may challenge a source identity, locator, evidence summary, missing source, conflict handling, fund-change claim, or application of an ECS rule. A challenge does not grant the submitter control over the outcome.

## Workflow

`Submission → Acknowledgment → Scope check → Evidence review → Decision → Public outcome → Correction event when required`

A submission MUST identify the challenged record or route, the asserted issue, supporting source or reasoning, and contact method when acknowledgment is requested. Sensitive personal information is not accepted.

Outcomes are `accepted`, `partially_accepted`, `rejected_with_reason`, `insufficient_evidence`, `duplicate`, or `outside_scope`. Material accepted outcomes create a correction, withdrawal, new evidence record, or review event as applicable. Rejections state the governing rule or evidence reason.

Challenges and outcomes receive stable IDs and timestamps. Public reporting MAY redact contact details and protected source content, but MUST preserve the substance, status, and effect of the challenge. Repeated submission does not create precedence; new evidence may reopen a closed challenge.

