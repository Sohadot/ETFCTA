# Technical Quality Standard

Standard ID: `TQS-001-v0.1.0`

## Scope and inputs

Applies to admitted HTML, local CSS and JavaScript, JSON-LD, forms, images, and static dependencies.

## Blocking rules

- `TQS-R01`: HTML has doctype, language, head, body, title, and viewport metadata.
- `TQS-R02`: IDs are unique and heading levels do not skip.
- `TQS-R03`: images have alt text; form controls have labels or accessible names.
- `TQS-R04`: JSON-LD parses and local CSS/JavaScript references resolve.
- `TQS-R05`: third-party inline scripts and styles are prohibited unless allowlisted.
- `TQS-R06`: static budgets are HTML 128 KiB, CSS 160 KiB, and JavaScript 128 KiB per file.
- `TQS-R07`: production JavaScript may not contain `console.log`, `debugger`, or source-map directives.

All rules block publication. Browser runtime accessibility, viewport overflow, and console observations supplement this static gate when a browser is available; absence of a runtime MUST be reported, not converted to a pass. Evidence is emitted to `artifacts/governance/technical-quality.json`.
