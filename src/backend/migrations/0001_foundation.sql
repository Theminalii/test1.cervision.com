CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY NOT NULL,
  email TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  platform_role TEXT NOT NULL CHECK (platform_role IN ('admin', 'participant', 'mentor', 'judge')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'suspended', 'invited')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  last_login_at TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique ON profiles(email);

CREATE TABLE IF NOT EXISTS admin_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  department TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tracks (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_statement TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  lead_user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  track_id TEXT REFERENCES tracks(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('forming', 'active', 'locked', 'archived')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS team_memberships (
  id TEXT PRIMARY KEY NOT NULL,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_role TEXT NOT NULL CHECK (team_role IN ('lead', 'member')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'active', 'removed')),
  joined_at TEXT,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS team_memberships_user_team_unique ON team_memberships(team_id, user_id);
CREATE INDEX IF NOT EXISTS team_memberships_user_idx ON team_memberships(user_id);

CREATE TABLE IF NOT EXISTS team_invites (
  id TEXT PRIMARY KEY NOT NULL,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  token TEXT NOT NULL,
  invited_by TEXT NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS team_invites_token_unique ON team_invites(token);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY NOT NULL,
  submission_code TEXT NOT NULL,
  team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  track_id TEXT NOT NULL REFERENCES tracks(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  short_summary TEXT NOT NULL,
  problem TEXT NOT NULL,
  solution TEXT NOT NULL,
  impact TEXT NOT NULL,
  technical_description TEXT NOT NULL,
  demo_url TEXT,
  deck_url TEXT,
  github_url TEXT,
  video_url TEXT,
  status TEXT NOT NULL CHECK (
    status IN (
      'Draft',
      'Submitted for Review',
      'Needs Clarification',
      'Resubmitted for Review',
      'Approved for Judging',
      'Released to Judges',
      'Judging in Progress',
      'Judged',
      'Shortlisted',
      'Winner',
      'Disqualified',
      'Withdrawn'
    )
  ),
  submitted_at TEXT,
  last_returned_at TEXT,
  approved_for_judging_at TEXT,
  released_to_judges_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS submissions_code_unique ON submissions(submission_code);

CREATE TABLE IF NOT EXISTS mentor_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  title TEXT NOT NULL,
  assigned_tracks TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mentor_assignments (
  id TEXT PRIMARY KEY NOT NULL,
  mentor_id TEXT NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'in_review', 'returned', 'approved')),
  assigned_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submission_review_notes (
  id TEXT PRIMARY KEY NOT NULL,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  mentor_id TEXT NOT NULL REFERENCES mentor_profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  note TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS submission_status_history (
  id TEXT PRIMARY KEY NOT NULL,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  actor_user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS judge_profiles (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  organization TEXT NOT NULL,
  title TEXT NOT NULL,
  bio TEXT NOT NULL,
  assigned_tracks TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS judge_assignments (
  id TEXT PRIMARY KEY NOT NULL,
  judge_id TEXT NOT NULL REFERENCES judge_profiles(id) ON DELETE CASCADE,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('assigned', 'in_review', 'submitted')),
  assigned_at TEXT NOT NULL,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS scores (
  id TEXT PRIMARY KEY NOT NULL,
  assignment_id TEXT NOT NULL REFERENCES judge_assignments(id) ON DELETE CASCADE,
  submission_id TEXT NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  judge_id TEXT NOT NULL REFERENCES judge_profiles(id) ON DELETE CASCADE,
  problem_relevance INTEGER NOT NULL,
  innovation INTEGER NOT NULL,
  execution_prototype INTEGER NOT NULL,
  impact_scalability INTEGER NOT NULL,
  presentation_clarity INTEGER NOT NULL,
  total_score INTEGER NOT NULL,
  comments TEXT,
  submitted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS admin_settings (
  id TEXT PRIMARY KEY NOT NULL,
  registration_deadline TEXT,
  submission_deadline TEXT,
  mentor_review_deadline TEXT,
  judging_deadline TEXT,
  max_team_size INTEGER NOT NULL DEFAULT 5,
  allow_submission_edits INTEGER NOT NULL DEFAULT 1,
  platform_status TEXT NOT NULL DEFAULT 'setup',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS email_logs (
  id TEXT PRIMARY KEY NOT NULL,
  recipient_email TEXT NOT NULL,
  email_type TEXT NOT NULL,
  related_user_id TEXT REFERENCES profiles(id) ON DELETE SET NULL,
  related_submission_id TEXT REFERENCES submissions(id) ON DELETE SET NULL,
  status TEXT NOT NULL,
  sent_at TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY NOT NULL,
  user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS auth_sessions_token_hash_unique ON auth_sessions(token_hash);
CREATE INDEX IF NOT EXISTS auth_sessions_user_idx ON auth_sessions(user_id);
