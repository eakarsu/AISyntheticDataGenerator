# Audit Note — AISyntheticDataGenerator

Source: `/Users/erolakarsu/projects/_AUDIT/reports/batch_08.md` (section 11).

## Original Recommendations

### Audit Verdict
"Skeleton" — but `routes/datasets.js` actually contains substantial AI workflows (`/generate`, `/generate-from-schema`, `/privacy-score`, `/generate/stream`).

### Missing AI Counterparts
- Synthetic data generation engine (PARTIALLY EXISTS — see `/generate`)
- Schema inference from samples
- Distribution-aware generation (PARTIALLY via existing prompts)

### Missing Non-AI Features
- Schema editor UI
- Dataset preview UI
- Export to CSV/Parquet/JSON (partially exists via `/:id/export`)
- Privacy compliance / PII redaction

### Custom Feature Suggestions
- LLM-powered schema inference
- Distribution learning (preserve real-data stats)
- Privacy-aware generation (DP)
- Relational data generation (FK, cardinality)
- Targeted edge-case generation

## Implemented (this round)
1. `POST /api/datasets/schema-infer` — schema inference from sample rows.
2. `POST /api/datasets/redact-pii` — flag and redact PII fields.

Both reuse `generateWithAI` + `persistAIResult` + `aiRateLimiter`. Syntax-checked.

## Backlog (prioritized)
1. **MECHANICAL** Distribution-preservation prompt extension to existing `/generate`.
2. **MECHANICAL** Edge-case generator endpoint.
3. **NEEDS-PRODUCT-DECISION** Relational FK-aware generation (multi-table state machine).
4. **NEEDS-PRODUCT-DECISION** Differential-privacy synthesis library choice.
5. **NEEDS-PRODUCT-DECISION** Schema editor UI (frontend, out of scope for this pass).

## Apply pass 3 (frontend)

LEFT-AS-IS. Frontend already wired for every AI endpoint in `routes/datasets.js`:
- `frontend/src/pages/SchemaInfer.jsx` and `frontend/src/pages/RedactPII.jsx` cover the pass-2 additions.
- `frontend/src/pages/StreamingGenerator.jsx` covers `/generate/stream`.
- `frontend/src/pages/DatasetDetail.jsx` covers `/:id/privacy-score`, `/:id/export`, `/generate`.
- `frontend/src/pages/SchemaBuilder.jsx` covers `/generate-from-schema`.
- `frontend/src/components/GenerateModal.jsx` and `AIResultDisplay.jsx` cover `/generate` flow.
- `App.jsx` mounts all the routes; `services/api.js` exposes `datasets.schemaInfer`, `datasets.redactPII`, `datasets.privacyScore`, etc. through a shared axios-style fetch helper that adds `Authorization: Bearer <token>` from localStorage.

Log: `/Users/erolakarsu/projects/_AUDIT/apply3_logs/ab3_98.md`.

## Apply pass 4 (mechanical backlog)

Implemented both mechanical backlog items end-to-end:

### Backend (`backend/routes/datasets.js`)
- `POST /api/datasets/distribution-preserve` — generates synthetic rows that
  preserve numeric/categorical/datetime distributions of provided real
  samples; persists via `persistAIResult`.
- `POST /api/datasets/edge-cases` — generates edge-case rows that stress-test
  numeric extremes, string boundaries, datetime extremes, nullables, enums,
  and combinatorial conflicts against a provided schema.

Both reuse `generateWithAI` + `aiRateLimiter` + `authenticate`. Added
`handleAIError` helper that surfaces 503 when OpenRouter key is missing.
`node --check` clean.

### Frontend
- `frontend/src/pages/DistributionPreserve.jsx` — JSON sample input, name +
  category + rowCount controls, result viewer.
- `frontend/src/pages/EdgeCases.jsx` — JSON schema input, focus + count
  controls, edge-case categories chip list.
- Wired into `App.jsx` (`/distribution-preserve`, `/edge-cases`) and
  `Navbar.jsx`. `services/api.js` adds `datasets.distributionPreserve` and
  `datasets.edgeCases`; `handleResponse` now surfaces 503 with a friendly
  message.

Babel JSX parse clean. No new deps.

Log: `/Users/erolakarsu/projects/_AUDIT/apply4_logs/ab3_98.md`.
