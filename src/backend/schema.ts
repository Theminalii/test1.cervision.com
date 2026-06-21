import { relations, sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const profiles = sqliteTable(
  "profiles",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    fullName: text("full_name").notNull(),
    phone: text("phone").notNull(),
    platformRole: text("platform_role").notNull(),
    status: text("status").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    lastLoginAt: text("last_login_at"),
  },
  (table) => ({
    emailUnique: uniqueIndex("profiles_email_unique").on(table.email),
    roleCheck: check(
      "profiles_role_check",
      sql`${table.platformRole} in ('admin', 'participant', 'mentor', 'judge')`,
    ),
    statusCheck: check(
      "profiles_status_check",
      sql`${table.status} in ('pending', 'active', 'suspended', 'invited')`,
    ),
  }),
);

export const adminProfiles = sqliteTable("admin_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  department: text("department"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const tracks = sqliteTable("tracks", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  challengeStatement: text("challenge_statement").notNull(),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const teams = sqliteTable(
  "teams",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    leadUserId: text("lead_user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    trackId: text("track_id").references(() => tracks.id, { onDelete: "set null" }),
    status: text("status").notNull(),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    statusCheck: check(
      "teams_status_check",
      sql`${table.status} in ('forming', 'active', 'locked', 'archived')`,
    ),
  }),
);

export const teamMemberships = sqliteTable(
  "team_memberships",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    teamRole: text("team_role").notNull(),
    status: text("status").notNull(),
    joinedAt: text("joined_at"),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    userTeamUnique: uniqueIndex("team_memberships_user_team_unique").on(table.teamId, table.userId),
    teamRoleCheck: check(
      "team_memberships_role_check",
      sql`${table.teamRole} in ('lead', 'member')`,
    ),
    statusCheck: check(
      "team_memberships_status_check",
      sql`${table.status} in ('pending', 'active', 'removed')`,
    ),
    byUserIdx: index("team_memberships_user_idx").on(table.userId),
  }),
);

export const teamInvites = sqliteTable(
  "team_invites",
  {
    id: text("id").primaryKey(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    token: text("token").notNull(),
    invitedBy: text("invited_by")
      .notNull()
      .references(() => profiles.id, { onDelete: "restrict" }),
    status: text("status").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
  },
  (table) => ({
    tokenUnique: uniqueIndex("team_invites_token_unique").on(table.token),
    statusCheck: check(
      "team_invites_status_check",
      sql`${table.status} in ('pending', 'accepted', 'expired', 'cancelled')`,
    ),
  }),
);

export const submissions = sqliteTable(
  "submissions",
  {
    id: text("id").primaryKey(),
    submissionCode: text("submission_code").notNull(),
    teamId: text("team_id")
      .notNull()
      .references(() => teams.id, { onDelete: "cascade" }),
    trackId: text("track_id")
      .notNull()
      .references(() => tracks.id, { onDelete: "restrict" }),
    title: text("title").notNull(),
    shortSummary: text("short_summary").notNull(),
    problem: text("problem").notNull(),
    solution: text("solution").notNull(),
    impact: text("impact").notNull(),
    technicalDescription: text("technical_description").notNull(),
    demoUrl: text("demo_url"),
    deckUrl: text("deck_url"),
    githubUrl: text("github_url"),
    videoUrl: text("video_url"),
    status: text("status").notNull(),
    submittedAt: text("submitted_at"),
    lastReturnedAt: text("last_returned_at"),
    approvedForJudgingAt: text("approved_for_judging_at"),
    releasedToJudgesAt: text("released_to_judges_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    submissionCodeUnique: uniqueIndex("submissions_code_unique").on(table.submissionCode),
    statusCheck: check(
      "submissions_status_check",
      sql`${table.status} in (
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
      )`,
    ),
  }),
);

export const mentorProfiles = sqliteTable("mentor_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  organization: text("organization").notNull(),
  title: text("title").notNull(),
  assignedTracks: text("assigned_tracks").notNull().default("[]"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const mentorAssignments = sqliteTable(
  "mentor_assignments",
  {
    id: text("id").primaryKey(),
    mentorId: text("mentor_id")
      .notNull()
      .references(() => mentorProfiles.id, { onDelete: "cascade" }),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    assignedAt: text("assigned_at").notNull(),
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    statusCheck: check(
      "mentor_assignments_status_check",
      sql`${table.status} in ('assigned', 'in_review', 'returned', 'approved')`,
    ),
  }),
);

export const submissionReviewNotes = sqliteTable("submission_review_notes", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  mentorId: text("mentor_id")
    .notNull()
    .references(() => mentorProfiles.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  note: text("note").notNull(),
  createdAt: text("created_at").notNull(),
});

export const submissionStatusHistory = sqliteTable("submission_status_history", {
  id: text("id").primaryKey(),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  actorUserId: text("actor_user_id").references(() => profiles.id, { onDelete: "set null" }),
  note: text("note"),
  createdAt: text("created_at").notNull(),
});

export const judgeProfiles = sqliteTable("judge_profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  organization: text("organization").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  assignedTracks: text("assigned_tracks").notNull().default("[]"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const judgeAssignments = sqliteTable(
  "judge_assignments",
  {
    id: text("id").primaryKey(),
    judgeId: text("judge_id")
      .notNull()
      .references(() => judgeProfiles.id, { onDelete: "cascade" }),
    submissionId: text("submission_id")
      .notNull()
      .references(() => submissions.id, { onDelete: "cascade" }),
    status: text("status").notNull(),
    assignedAt: text("assigned_at").notNull(),
    completedAt: text("completed_at"),
    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
  },
  (table) => ({
    statusCheck: check(
      "judge_assignments_status_check",
      sql`${table.status} in ('assigned', 'in_review', 'submitted')`,
    ),
  }),
);

export const scores = sqliteTable("scores", {
  id: text("id").primaryKey(),
  assignmentId: text("assignment_id")
    .notNull()
    .references(() => judgeAssignments.id, { onDelete: "cascade" }),
  submissionId: text("submission_id")
    .notNull()
    .references(() => submissions.id, { onDelete: "cascade" }),
  judgeId: text("judge_id")
    .notNull()
    .references(() => judgeProfiles.id, { onDelete: "cascade" }),
  problemRelevance: integer("problem_relevance").notNull(),
  innovation: integer("innovation").notNull(),
  executionPrototype: integer("execution_prototype").notNull(),
  impactScalability: integer("impact_scalability").notNull(),
  presentationClarity: integer("presentation_clarity").notNull(),
  totalScore: integer("total_score").notNull(),
  comments: text("comments"),
  submittedAt: text("submitted_at"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const adminSettings = sqliteTable("admin_settings", {
  id: text("id").primaryKey(),
  registrationDeadline: text("registration_deadline"),
  submissionDeadline: text("submission_deadline"),
  mentorReviewDeadline: text("mentor_review_deadline"),
  judgingDeadline: text("judging_deadline"),
  maxTeamSize: integer("max_team_size").notNull().default(5),
  allowSubmissionEdits: integer("allow_submission_edits", { mode: "boolean" }).notNull().default(true),
  platformStatus: text("platform_status").notNull().default("setup"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const emailLogs = sqliteTable("email_logs", {
  id: text("id").primaryKey(),
  recipientEmail: text("recipient_email").notNull(),
  emailType: text("email_type").notNull(),
  relatedUserId: text("related_user_id").references(() => profiles.id, { onDelete: "set null" }),
  relatedSubmissionId: text("related_submission_id").references(() => submissions.id, {
    onDelete: "set null",
  }),
  status: text("status").notNull(),
  sentAt: text("sent_at"),
  createdAt: text("created_at").notNull(),
});

export const authSessions = sqliteTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull(),
    lastSeenAt: text("last_seen_at").notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
  },
  (table) => ({
    tokenUnique: uniqueIndex("auth_sessions_token_hash_unique").on(table.tokenHash),
    userIdx: index("auth_sessions_user_idx").on(table.userId),
  }),
);

export const profileRelations = relations(profiles, ({ one, many }) => ({
  adminProfile: one(adminProfiles, {
    fields: [profiles.id],
    references: [adminProfiles.userId],
  }),
  teamMemberships: many(teamMemberships),
  ledTeams: many(teams),
  mentorProfile: one(mentorProfiles, {
    fields: [profiles.id],
    references: [mentorProfiles.userId],
  }),
  judgeProfile: one(judgeProfiles, {
    fields: [profiles.id],
    references: [judgeProfiles.userId],
  }),
  sessions: many(authSessions),
}));

export const teamRelations = relations(teams, ({ one, many }) => ({
  leadUser: one(profiles, {
    fields: [teams.leadUserId],
    references: [profiles.id],
  }),
  track: one(tracks, {
    fields: [teams.trackId],
    references: [tracks.id],
  }),
  memberships: many(teamMemberships),
  invites: many(teamInvites),
  submissions: many(submissions),
}));

export const teamMembershipRelations = relations(teamMemberships, ({ one }) => ({
  team: one(teams, {
    fields: [teamMemberships.teamId],
    references: [teams.id],
  }),
  user: one(profiles, {
    fields: [teamMemberships.userId],
    references: [profiles.id],
  }),
}));

export const submissionRelations = relations(submissions, ({ one, many }) => ({
  team: one(teams, {
    fields: [submissions.teamId],
    references: [teams.id],
  }),
  track: one(tracks, {
    fields: [submissions.trackId],
    references: [tracks.id],
  }),
  mentorAssignments: many(mentorAssignments),
  judgeAssignments: many(judgeAssignments),
  reviewNotes: many(submissionReviewNotes),
  statusHistory: many(submissionStatusHistory),
  scores: many(scores),
}));

export const mentorProfileRelations = relations(mentorProfiles, ({ one, many }) => ({
  user: one(profiles, {
    fields: [mentorProfiles.userId],
    references: [profiles.id],
  }),
  assignments: many(mentorAssignments),
}));

export const judgeProfileRelations = relations(judgeProfiles, ({ one, many }) => ({
  user: one(profiles, {
    fields: [judgeProfiles.userId],
    references: [profiles.id],
  }),
  assignments: many(judgeAssignments),
  scores: many(scores),
}));
