# Evidence Validation Standard

Standard ID: `EVS-001-v0.1.0`

`EVS-R01` requires source identity, valid SHA-256, and matching source/preservation hashes. `EVS-R02` prohibits admitted evidence from unverified sources. `EVS-R03` requires justification for superseded sources and prohibits a withdrawn source from solely supporting a current decision. `EVS-R04` enforces retrieval freshness and explicit newer-version state. `EVS-R05` measures primary-source compliance from classification claims and their actual evidence chains. `EVS-R06` requires a current external-link observation with a governed state; `dead` blocks, while redirect, rate-limit, and temporary failure remain explicit review states.

All rules are blocking except transient reachability states with a recorded observation. Evidence is emitted to `artifacts/governance/evidence-governance.json` and `artifacts/governance/external-links.json`.
