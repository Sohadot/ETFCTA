# Release Gate Standard

Standard ID: `RGS-001-v0.1.0`

A release is valid only through `npm run release:verify`. The command runs the GAL contract, data generation, schemas, nine ordered GAL gates, negative fixtures, export boundary, links, integrity verification, release completeness, and attestation generation/verification.

`RGS-R01` requires all nine gates to be enforced and passing. `RGS-R02` requires consistent site, data, GAL, schema, validator, term, claim, ontology, and standard versions. `RGS-R03` requires Changelog, Decision Log when sovereign meaning changes, release archive, route manifest, sitemap, llms.txt, exports, limitations, hashes, and attestation. `RGS-R04` rejects artifact hash or subject commit mismatch. `RGS-R05` prohibits attestation when any gate is failed or `not_run`.

The immutable attestation references the release-content commit. It is committed in the immediately following attestation-only commit to avoid an impossible self-referential hash.
