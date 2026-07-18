# Security and Supply Chain Standard

Standard ID: `SSS-001-v0.1.0`

`SSS-R01` rejects secret-like credentials, private keys, local absolute paths, and internal preservation locators in public output. `SSS-R02` requires declared dependencies and lock integrity when dependencies exist. `SSS-R03` requires every distributed code, specification, data, font, image, and excerpt category to have a license status. `SSS-R04` verifies governed file hashes. `SSS-R05` requires GitHub Actions to be pinned to commit SHAs with minimum permissions. `SSS-R06` restricts shell execution to reviewed scripts. Commit-signature verification remains an explicit non-blocking `not_measured` metric until the repository environment supports it.

All other rules block release. Evidence is emitted to `artifacts/governance/security-supply-chain.json`.
