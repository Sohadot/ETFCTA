# ETFCTA

ETFCTA is an open, evidence-linked classification registry for managed-futures ETFs. The founding release implements **Sprint 0A — Evidence and Classification Architecture** before any real fund is admitted.

## Run locally

Open `index.html` directly, or serve the repository with any static file server.

## Validate the architecture

```powershell
node scripts/validate.mjs
```

The validator checks the ECS specification, controlled vocabularies, JSON Schemas, and any future registry records without third-party dependencies.

## Founding rule

No fund, quotation, source, evidence, decision, or change event is published until it can pass the repository's evidence and provenance rules. The `data/` collections are intentionally empty in v0.1.0.

