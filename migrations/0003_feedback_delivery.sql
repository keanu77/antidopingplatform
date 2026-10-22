-- Additive migration: retain every original feedback record.
ALTER TABLE feedback ADD COLUMN request_id TEXT;
CREATE UNIQUE INDEX idx_feedback_request ON feedback(request_id);

-- The previous sender had no delivery ledger. Existing rows remain legacy/unreconciled;
-- never resend them automatically or label them delivered. New rows use this cursor.
CREATE TABLE feedback_delivery (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  legacy_through_id INTEGER NOT NULL,
  cursor_id INTEGER NOT NULL,
  pending_json TEXT,
  first_attempt_at INTEGER,
  lock_token TEXT,
  lease_until INTEGER NOT NULL DEFAULT 0,
  last_success_at INTEGER,
  last_provider_id TEXT
);
INSERT INTO feedback_delivery(id, legacy_through_id, cursor_id)
SELECT 1, COALESCE(MAX(id), 0), COALESCE(MAX(id), 0) FROM feedback;
