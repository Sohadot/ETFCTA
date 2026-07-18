# Reference Integrity Standard

Standard ID: `RIS-001-v0.1.0`

## Scope and inputs

Applies to the route manifest, sitemap, public HTML graph, canonical URLs, JSON-LD, and governed entity/citation identifiers.

## Blocking rules

- `RIS-R01`: every route resolves to one HTML file and every public HTML file is admitted.
- `RIS-R02`: internal links resolve and every non-root route has an incoming internal link.
- `RIS-R03`: canonical URLs are present, unique, and equal the admitted route.
- `RIS-R04`: sitemap and route manifest contain the same routes.
- `RIS-R05`: JSON-LD blocks parse as JSON.
- `RIS-R06`: referenced decision, evidence, source, and fund IDs resolve.
- `RIS-R07`: external links are classified as source, challenge workflow, or external reference.

All rules block publication. The evidence artifact is `artifacts/governance/reference-integrity.json`. Network availability is not inferred from internal integrity; external reachability remains a separately reported metric.
