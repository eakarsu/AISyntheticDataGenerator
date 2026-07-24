BEGIN;
CREATE TABLE IF NOT EXISTS runtime_ai_results (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES synth_users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  input_data JSONB NOT NULL,
  result JSONB NOT NULL,
  model_used TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS runtime_ai_results_user_created_idx
  ON runtime_ai_results(user_id, created_at DESC);
COMMIT;
