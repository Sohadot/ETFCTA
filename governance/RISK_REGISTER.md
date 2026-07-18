# Risk Register

Last reviewed: 18 July 2026

| ID | Risk | Likelihood | Impact | Owner | Mitigation | Trigger | Status |
|---|---|---:|---:|---|---|---|---|
| RSK-001 | Stale public evidence | Medium | High | Publisher | Review windows and source monitoring | Due or superseded source | Open |
| RSK-002 | Inference presented as fact | Medium | High | Classifier | Claims boundary and visible knowledge states | Copy or JSON loses derivation label | Mitigated, monitored |
| RSK-003 | Broken or mutable source link | High | High | Extractor | Hash, preservation locator, archived metadata | Live source disappears or changes | Open |
| RSK-004 | Validator regression | Medium | High | Maintainer | Canonical fixture and negative tests | Previously rejected fixture passes | Mitigated, monitored |
| RSK-005 | Over-expansion before evidence quality | Medium | High | Publisher | Production gate and zero-placeholder rule | Coverage target bypasses admission | Mitigated, monitored |
| RSK-006 | Issuer or sponsor pressure | Low now | High | Publisher | Independence policy and future recusal process | Relevant financial relationship | Latent |
| RSK-007 | CTA trademark or issuer confusion | Medium | Medium | Operator | Independence disclosure and route-specific clarification | User or issuer reports confusion | Open |
| RSK-008 | Solo-operator review concentration | High | Medium | Operator | Logical role records and second-review triggers | First confirmed production decision | Open |
| RSK-009 | Protected source material republished | Low | High | Extractor | Bounded excerpts and metadata/content separation | Proposed public source copy | Mitigated, monitored |
| RSK-010 | Human and machine output divergence | Medium after 0C | High | Publisher | Release parity check | Dossier and JSON disagree | Latent |

