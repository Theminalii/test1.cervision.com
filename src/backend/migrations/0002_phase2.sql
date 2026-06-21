CREATE TABLE IF NOT EXISTS submission_status_history (
  id TEXT PRIMARY KEY NOT NULL,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actor_user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TEXT NOT NULL
);
