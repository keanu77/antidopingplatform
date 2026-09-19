-- 使用者回饋（取代原 MongoDB feedback collection）。
-- 不存明文 IP，只存截短的雜湊供每小時頻率限制使用。
CREATE TABLE IF NOT EXISTS feedback (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT    NOT NULL,          -- 'rating' | 'issue'
  rating     INTEGER,                   -- 1-5；issue 類型為 NULL
  message    TEXT    NOT NULL DEFAULT '',
  page       TEXT    NOT NULL DEFAULT '',
  ip_hash    TEXT    NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL           -- epoch millis
);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_ratelimit ON feedback (ip_hash, created_at);
