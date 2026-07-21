# Governed Synthetic Data Operations

The supported backend is `/api/governed-synthesis`. Original generated, direct-model, dataset, and `gap*` routes remain as prototype reference material but are not mounted by `backend/server.js`.

## Controlled setup

1. Copy `.env.example` into a secret-managed runtime and replace placeholders.
2. Run `./scripts/bootstrap.sh` explicitly to install lockfile-pinned dependencies.
3. Apply `./scripts/migrate.sh apply-governed-synth-001` through normal database change approval.
4. Provision users, tenants, and memberships through an administrator-controlled channel. Default credentials and public registration are disabled.
5. Enable providers only after their HTTPS endpoints and runtime credentials are configured. Readiness fails closed.
6. Run `./start.sh`. It refuses missing dependencies and occupied ports and does not install, seed, migrate, create databases, or terminate processes it did not start.

## Governed release lifecycle

Specifications bind a purpose, classification, schema, deterministic seed, generator version, record limit, privacy budget, and source authority/consent digests. PII fields require tokenize, hash, generalize, or drop transforms. A data steward validates the spec and a different privacy reviewer records re-identification evidence before a generation operator can enqueue an idempotent job.

Generation runs through typed job-runner, KMS, and object-storage boundaries with retry/dead-letter states and manifest receipts. Evaluation measures schema validity, uniqueness, referential integrity, distribution similarity, privacy-attack resistance, utility, and latency against versioned thresholds. A release manager independent of the author approves the exact spec, batch, privacy, and evaluation digests before an encrypted retained object can be released.

Integration destinations are durable tenant records. Notifications contain payload digests rather than sensitive data and use a retrying outbox. Incoming webhooks require HMAC signatures and a five-minute replay window. Delivery receipts, provider failures, usage, state changes, and releases are retained in append-only audit evidence.

## External validation still required

Local tests cover deterministic fixtures, privacy policy, evaluation gates, roles, recovery, signatures, migration, API, and launcher contracts without external services. Production release still requires schema/catalog/KMS/job-runner/storage contract tests, privacy and legal review, representative utility and re-identification studies, migration/restore rehearsal, security/access review, load/latency tests, and end-to-end notification/webhook validation.
