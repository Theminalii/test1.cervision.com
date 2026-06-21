export const PLATFORM_ROLES = ["admin", "participant", "mentor", "judge"] as const;
export type PlatformRole = (typeof PLATFORM_ROLES)[number];

export const PROFILE_STATUSES = ["pending", "active", "suspended", "invited"] as const;
export type ProfileStatus = (typeof PROFILE_STATUSES)[number];

export const TEAM_ROLES = ["lead", "member"] as const;
export type TeamRole = (typeof TEAM_ROLES)[number];

export const TEAM_MEMBER_STATUSES = ["pending", "active", "removed"] as const;
export type TeamMembershipStatus = (typeof TEAM_MEMBER_STATUSES)[number];

export const TEAM_INVITE_STATUSES = ["pending", "accepted", "expired", "cancelled"] as const;
export type TeamInviteStatus = (typeof TEAM_INVITE_STATUSES)[number];

export const TEAM_STATUSES = ["forming", "active", "locked", "archived"] as const;
export type TeamStatus = (typeof TEAM_STATUSES)[number];

export const SUBMISSION_STATUSES = [
  "Draft",
  "Submitted for Review",
  "Needs Clarification",
  "Resubmitted for Review",
  "Approved for Judging",
  "Released to Judges",
  "Judging in Progress",
  "Judged",
  "Shortlisted",
  "Winner",
  "Disqualified",
  "Withdrawn",
] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const SUBMISSION_STATUS_LABELS: Partial<Record<SubmissionStatus, string>> = {
  "Submitted for Review": "Under Mentor Review",
  "Needs Clarification": "Clarification Needed",
  "Released to Judges": "With Judges",
  Judged: "Judging Complete",
};

export const MENTOR_ASSIGNMENT_STATUSES = ["assigned", "in_review", "returned", "approved"] as const;
export type MentorAssignmentStatus = (typeof MENTOR_ASSIGNMENT_STATUSES)[number];

export const JUDGE_ASSIGNMENT_STATUSES = ["assigned", "in_review", "submitted"] as const;
export type JudgeAssignmentStatus = (typeof JUDGE_ASSIGNMENT_STATUSES)[number];

export const PLATFORM_STATUSES = ["setup", "registration_open", "submission_open", "judging_live", "closed"] as const;
export type PlatformStatus = (typeof PLATFORM_STATUSES)[number];

export const SESSION_COOKIE = "kafd_session";
export const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
