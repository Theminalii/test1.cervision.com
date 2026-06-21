import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { z } from "zod";
import {
  PROFILE_STATUSES,
  SUBMISSION_STATUS_LABELS,
  type SubmissionStatus,
  type TeamRole,
} from "./constants";
import { buildUserContext } from "./context";
import { db, schema } from "./db";
import { ApiError } from "./errors";
import { createId, normalizeEmail, nowIso, parseJsonArray } from "./utils";

export const registerPayloadSchema = z
  .object({
    full_name: z.string().trim().min(2).max(120).optional(),
    fullName: z.string().trim().min(2).max(120).optional(),
    email: z.string().trim().email(),
    phone: z.string().trim().min(7).max(30),
    password: z.string().min(8).max(128),
    confirm_password: z.string().min(8).max(128).optional(),
    confirmPassword: z.string().min(8).max(128).optional(),
  })
  .transform((data) => ({
    fullName: data.full_name ?? data.fullName ?? "",
    email: data.email,
    phone: data.phone,
    password: data.password,
    confirmPassword: data.confirm_password ?? data.confirmPassword ?? "",
  }))
  .refine((data) => data.fullName.length >= 2, {
    message: "Full name is required.",
    path: ["full_name"],
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirm_password"],
  });

export const loginPayloadSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
});

export const createTeamSchema = z.object({
  name: z.string().trim().min(2).max(120),
  track_id: z.string().trim().min(1).optional(),
  trackId: z.string().trim().min(1).optional(),
});

export const updateTeamSchema = createTeamSchema.partial().refine(
  (data) => Boolean(data.name || data.track_id || data.trackId),
  {
    message: "At least one team field must be provided.",
  },
);

export const inviteSchema = z.object({
  email: z.string().trim().email(),
});

export const reviewNoteSchema = z.object({
  note: z.string().trim().min(1).max(5000),
});

export const mentorInviteSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  fullName: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(30),
  organization: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(120),
  assigned_tracks: z.array(z.string().trim().min(1)).optional(),
  assignedTracks: z.array(z.string().trim().min(1)).optional(),
}).transform((data) => ({
  fullName: data.full_name ?? data.fullName ?? "",
  email: data.email,
  phone: data.phone,
  organization: data.organization,
  title: data.title,
  assignedTracks: data.assigned_tracks ?? data.assignedTracks ?? [],
}));

export const judgeInviteSchema = z.object({
  full_name: z.string().trim().min(2).max(120).optional(),
  fullName: z.string().trim().min(2).max(120).optional(),
  email: z.string().trim().email(),
  phone: z.string().trim().min(7).max(30),
  organization: z.string().trim().min(2).max(120),
  title: z.string().trim().min(2).max(120),
  bio: z.string().trim().min(2).max(1000),
  assigned_tracks: z.array(z.string().trim().min(1)).optional(),
  assignedTracks: z.array(z.string().trim().min(1)).optional(),
}).transform((data) => ({
  fullName: data.full_name ?? data.fullName ?? "",
  email: data.email,
  phone: data.phone,
  organization: data.organization,
  title: data.title,
  bio: data.bio,
  assignedTracks: data.assigned_tracks ?? data.assignedTracks ?? [],
}));

export const mentorUpdateSchema = z.object({
  organization: z.string().trim().min(2).max(120).optional(),
  title: z.string().trim().min(2).max(120).optional(),
  assigned_tracks: z.array(z.string().trim().min(1)).optional(),
  assignedTracks: z.array(z.string().trim().min(1)).optional(),
  active: z.boolean().optional(),
});

export const judgeUpdateSchema = z.object({
  organization: z.string().trim().min(2).max(120).optional(),
  title: z.string().trim().min(2).max(120).optional(),
  bio: z.string().trim().min(2).max(1000).optional(),
  assigned_tracks: z.array(z.string().trim().min(1)).optional(),
  assignedTracks: z.array(z.string().trim().min(1)).optional(),
  active: z.boolean().optional(),
});

export const participantStatusSchema = z.object({
  status: z.enum(["pending", "active", "suspended", "invited"]),
});

export const mentorAssignmentSchema = z.object({
  mentor_id: z.string().trim().min(1).optional(),
  mentorId: z.string().trim().min(1).optional(),
  submission_id: z.string().trim().min(1).optional(),
  submissionId: z.string().trim().min(1).optional(),
}).transform((data) => ({
  mentorId: data.mentor_id ?? data.mentorId ?? "",
  submissionId: data.submission_id ?? data.submissionId ?? "",
}));

export const judgeAssignmentSchema = z.object({
  judge_id: z.string().trim().min(1).optional(),
  judgeId: z.string().trim().min(1).optional(),
  submission_id: z.string().trim().min(1).optional(),
  submissionId: z.string().trim().min(1).optional(),
}).transform((data) => ({
  judgeId: data.judge_id ?? data.judgeId ?? "",
  submissionId: data.submission_id ?? data.submissionId ?? "",
}));

export const scoreSchema = z.object({
  problem_relevance: z.number().int().min(1).max(5).optional(),
  innovation: z.number().int().min(1).max(5),
  execution_prototype: z.number().int().min(1).max(5).optional(),
  impact_scalability: z.number().int().min(1).max(5).optional(),
  presentation_clarity: z.number().int().min(1).max(5).optional(),
  comments: z.string().trim().max(5000).optional(),
  problemRelevance: z.number().int().min(1).max(5).optional(),
  executionPrototype: z.number().int().min(1).max(5).optional(),
  impactScalability: z.number().int().min(1).max(5).optional(),
  presentationClarity: z.number().int().min(1).max(5).optional(),
}).transform((data) => ({
  problemRelevance: data.problem_relevance ?? data.problemRelevance ?? 0,
  innovation: data.innovation,
  executionPrototype: data.execution_prototype ?? data.executionPrototype ?? 0,
  impactScalability: data.impact_scalability ?? data.impactScalability ?? 0,
  presentationClarity: data.presentation_clarity ?? data.presentationClarity ?? 0,
  comments: data.comments?.trim() || null,
}));

export const settingsUpdateSchema = z.object({
  registration_deadline: z.string().datetime().optional(),
  submission_deadline: z.string().datetime().optional(),
  mentor_review_deadline: z.string().datetime().optional(),
  judging_deadline: z.string().datetime().optional(),
  max_team_size: z.number().int().min(2).max(20).optional(),
  allow_submission_edits: z.boolean().optional(),
  platform_status: z.string().trim().min(2).max(50).optional(),
});

const urlField = z
  .string()
  .trim()
  .optional()
  .transform((value) => (value ? value : null))
  .refine((value) => !value || z.string().url().safeParse(value).success, {
    message: "Must be a valid URL.",
  });

export const submissionSchema = z.object({
  title: z.string().trim().min(1).max(160),
  short_summary: z.string().trim().min(1).max(500).optional(),
  shortSummary: z.string().trim().min(1).max(500).optional(),
  track_id: z.string().trim().min(1).optional(),
  trackId: z.string().trim().min(1).optional(),
  problem: z.string().trim().min(1).max(5000),
  solution: z.string().trim().min(1).max(5000),
  impact: z.string().trim().min(1).max(5000),
  technical_description: z.string().trim().min(1).max(5000).optional(),
  technicalDescription: z.string().trim().min(1).max(5000).optional(),
  demo_url: urlField,
  demoUrl: urlField,
  deck_url: urlField,
  deckUrl: urlField,
  github_url: urlField,
  githubUrl: urlField,
  video_url: urlField,
  videoUrl: urlField,
});

export function normalizeSubmissionPayload(payload: z.infer<typeof submissionSchema>) {
  return {
    title: payload.title.trim(),
    shortSummary: (payload.short_summary ?? payload.shortSummary ?? "").trim(),
    trackId: payload.track_id ?? payload.trackId ?? "",
    problem: payload.problem.trim(),
    solution: payload.solution.trim(),
    impact: payload.impact.trim(),
    technicalDescription: (payload.technical_description ?? payload.technicalDescription ?? "").trim(),
    demoUrl: payload.demo_url ?? payload.demoUrl ?? null,
    deckUrl: payload.deck_url ?? payload.deckUrl ?? null,
    githubUrl: payload.github_url ?? payload.githubUrl ?? null,
    videoUrl: payload.video_url ?? payload.videoUrl ?? null,
  };
}

export async function requireParticipant(profile: { platformRole: string; status: string }) {
  if (profile.platformRole !== "participant") {
    throw new ApiError(403, "PARTICIPANT_REQUIRED", "Participant access is required.");
  }
  if (!PROFILE_STATUSES.includes(profile.status as never) || profile.status === "suspended") {
    throw new ApiError(403, "PROFILE_INACTIVE", "Your participant account is not active.");
  }
}

export function requireAdmin(profile: { platformRole: string }) {
  if (profile.platformRole !== "admin") {
    throw new ApiError(403, "ADMIN_REQUIRED", "Admin access is required.");
  }
}

export function requireMentor(profile: { platformRole: string; status: string }) {
  if (profile.platformRole !== "mentor") {
    throw new ApiError(403, "MENTOR_REQUIRED", "Mentor access is required.");
  }
  if (profile.status === "suspended") {
    throw new ApiError(403, "PROFILE_INACTIVE", "Your mentor account is not active.");
  }
}

export function requireJudge(profile: { platformRole: string; status: string }) {
  if (profile.platformRole !== "judge") {
    throw new ApiError(403, "JUDGE_REQUIRED", "Judge access is required.");
  }
  if (profile.status === "suspended") {
    throw new ApiError(403, "PROFILE_INACTIVE", "Your judge account is not active.");
  }
}

export async function getActiveMembership(userId: string) {
  const [membership] = await db
    .select({
      membershipId: schema.teamMemberships.id,
      teamId: schema.teamMemberships.teamId,
      teamRole: schema.teamMemberships.teamRole,
      membershipStatus: schema.teamMemberships.status,
      teamName: schema.teams.name,
      teamStatus: schema.teams.status,
      leadUserId: schema.teams.leadUserId,
      trackId: schema.teams.trackId,
    })
    .from(schema.teamMemberships)
    .innerJoin(schema.teams, eq(schema.teamMemberships.teamId, schema.teams.id))
    .where(
      and(
        eq(schema.teamMemberships.userId, userId),
        eq(schema.teamMemberships.status, "active"),
      ),
    )
    .limit(1);

  return membership ?? null;
}

export async function requireActiveMembership(userId: string) {
  const membership = await getActiveMembership(userId);
  if (!membership) {
    throw new ApiError(403, "TEAM_REQUIRED", "You must belong to an active team.");
  }
  return membership;
}

export async function requireLeadMembership(userId: string) {
  const membership = await requireActiveMembership(userId);
  if (membership.teamRole !== "lead") {
    throw new ApiError(403, "TEAM_LEAD_REQUIRED", "Only the team lead can perform this action.");
  }
  return membership;
}

export async function requireTeamTrack(trackId: string | null | undefined) {
  if (!trackId) {
    throw new ApiError(422, "TRACK_REQUIRED", "Track selection is required.");
  }
  const [track] = await db.select().from(schema.tracks).where(eq(schema.tracks.id, trackId)).limit(1);
  if (!track || !track.active) {
    throw new ApiError(404, "TRACK_NOT_FOUND", "Selected track was not found.");
  }
  return track;
}

export async function getTeamById(teamId: string) {
  const [team] = await db.select().from(schema.teams).where(eq(schema.teams.id, teamId)).limit(1);
  if (!team) {
    throw new ApiError(404, "TEAM_NOT_FOUND", "Team was not found.");
  }
  return team;
}

export async function assertLeadOwnsTeam(userId: string, teamId: string) {
  const membership = await requireLeadMembership(userId);
  if (membership.teamId !== teamId) {
    throw new ApiError(403, "TEAM_ACCESS_DENIED", "You can only manage your own team.");
  }
  return membership;
}

export async function getSettings() {
  const [settings] = await db.select().from(schema.adminSettings).limit(1);
  if (!settings) {
    throw new ApiError(500, "SETTINGS_MISSING", "Admin settings are not configured.");
  }
  return settings;
}

export async function ensureCanCreateTeam(userId: string) {
  const existingMembership = await getActiveMembership(userId);
  if (existingMembership) {
    throw new ApiError(409, "ACTIVE_TEAM_EXISTS", "Participant can only belong to one active team.");
  }
}

export async function listTeamMembers(teamId: string) {
  return db
    .select({
      membershipId: schema.teamMemberships.id,
      userId: schema.teamMemberships.userId,
      fullName: schema.profiles.fullName,
      email: schema.profiles.email,
      phone: schema.profiles.phone,
      platformRole: schema.profiles.platformRole,
      teamRole: schema.teamMemberships.teamRole,
      status: schema.teamMemberships.status,
      joinedAt: schema.teamMemberships.joinedAt,
      createdAt: schema.teamMemberships.createdAt,
    })
    .from(schema.teamMemberships)
    .innerJoin(schema.profiles, eq(schema.teamMemberships.userId, schema.profiles.id))
    .where(eq(schema.teamMemberships.teamId, teamId));
}

export async function listTeamInvites(teamId: string) {
  return db
    .select({
      id: schema.teamInvites.id,
      email: schema.teamInvites.email,
      token: schema.teamInvites.token,
      status: schema.teamInvites.status,
      expiresAt: schema.teamInvites.expiresAt,
      createdAt: schema.teamInvites.createdAt,
      invitedBy: schema.teamInvites.invitedBy,
    })
    .from(schema.teamInvites)
    .where(eq(schema.teamInvites.teamId, teamId));
}

export async function ensureTeamCapacity(teamId: string) {
  const settings = await getSettings();
  const [countRow] = await db
    .select({ count: sql<number>`count(*)` })
    .from(schema.teamMemberships)
    .where(and(eq(schema.teamMemberships.teamId, teamId), eq(schema.teamMemberships.status, "active")));
  const activeCount = Number(countRow?.count ?? 0);
  if (activeCount >= settings.maxTeamSize) {
    throw new ApiError(409, "TEAM_CAPACITY_REACHED", "The team already reached the maximum size.");
  }
  return settings.maxTeamSize;
}

export function createInviteToken() {
  return `invite_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export async function getInviteByToken(token: string) {
  const [invite] = await db
    .select({
      id: schema.teamInvites.id,
      teamId: schema.teamInvites.teamId,
      email: schema.teamInvites.email,
      token: schema.teamInvites.token,
      status: schema.teamInvites.status,
      expiresAt: schema.teamInvites.expiresAt,
      createdAt: schema.teamInvites.createdAt,
      invitedBy: schema.teamInvites.invitedBy,
      teamName: schema.teams.name,
      teamStatus: schema.teams.status,
      trackId: schema.teams.trackId,
    })
    .from(schema.teamInvites)
    .innerJoin(schema.teams, eq(schema.teamInvites.teamId, schema.teams.id))
    .where(eq(schema.teamInvites.token, token))
    .limit(1);

  if (!invite) {
    throw new ApiError(404, "INVITE_NOT_FOUND", "Invite token was not found.");
  }
  return invite;
}

export async function acceptInviteForUser(token: string, profile: {
  id: string;
  email: string;
  platformRole: string;
  status: string;
}) {
  await requireParticipant(profile);
  await ensureCanCreateTeam(profile.id);

  const invite = await getInviteByToken(token);
  const now = nowIso();

  if (invite.status === "cancelled") {
    throw new ApiError(409, "INVITE_CANCELLED", "This invite has been cancelled.");
  }
  if (invite.status === "accepted") {
    throw new ApiError(409, "INVITE_ALREADY_ACCEPTED", "This invite has already been accepted.");
  }
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    await db
      .update(schema.teamInvites)
      .set({ status: "expired" })
      .where(eq(schema.teamInvites.id, invite.id));
    throw new ApiError(409, "INVITE_EXPIRED", "This invite has expired.");
  }

  if (normalizeEmail(invite.email) !== normalizeEmail(profile.email)) {
    throw new ApiError(403, "INVITE_EMAIL_MISMATCH", "Invite email does not match the signed-in user.");
  }

  await ensureTeamCapacity(invite.teamId);

  await db.insert(schema.teamMemberships).values({
    id: createId("tm"),
    teamId: invite.teamId,
    userId: profile.id,
    teamRole: "member",
    status: "active",
    joinedAt: now,
    createdAt: now,
  });

  await db
    .update(schema.teamInvites)
    .set({ status: "accepted" })
    .where(eq(schema.teamInvites.id, invite.id));

  const [membership] = await listTeamMembers(invite.teamId).then((members) =>
    members.filter((member) => member.userId === profile.id),
  );
  const context = await buildUserContext(profile);
  return { invite, membership, context };
}

export async function getSubmissionById(submissionId: string) {
  const [submission] = await db
    .select()
    .from(schema.submissions)
    .where(eq(schema.submissions.id, submissionId))
    .limit(1);
  if (!submission) {
    throw new ApiError(404, "SUBMISSION_NOT_FOUND", "Submission was not found.");
  }
  return submission;
}

export async function getSubmissionDetails(submissionId: string) {
  const [row] = await db
    .select({
      id: schema.submissions.id,
      submissionCode: schema.submissions.submissionCode,
      teamId: schema.submissions.teamId,
      trackId: schema.submissions.trackId,
      title: schema.submissions.title,
      shortSummary: schema.submissions.shortSummary,
      problem: schema.submissions.problem,
      solution: schema.submissions.solution,
      impact: schema.submissions.impact,
      technicalDescription: schema.submissions.technicalDescription,
      demoUrl: schema.submissions.demoUrl,
      deckUrl: schema.submissions.deckUrl,
      githubUrl: schema.submissions.githubUrl,
      videoUrl: schema.submissions.videoUrl,
      status: schema.submissions.status,
      submittedAt: schema.submissions.submittedAt,
      lastReturnedAt: schema.submissions.lastReturnedAt,
      approvedForJudgingAt: schema.submissions.approvedForJudgingAt,
      releasedToJudgesAt: schema.submissions.releasedToJudgesAt,
      createdAt: schema.submissions.createdAt,
      updatedAt: schema.submissions.updatedAt,
      teamName: schema.teams.name,
      leadUserId: schema.teams.leadUserId,
      trackName: schema.tracks.name,
    })
    .from(schema.submissions)
    .innerJoin(schema.teams, eq(schema.submissions.teamId, schema.teams.id))
    .innerJoin(schema.tracks, eq(schema.submissions.trackId, schema.tracks.id))
    .where(eq(schema.submissions.id, submissionId))
    .limit(1);

  if (!row) {
    throw new ApiError(404, "SUBMISSION_NOT_FOUND", "Submission was not found.");
  }

  return row;
}

export async function getTeamSubmission(teamId: string) {
  const [submission] = await db
    .select()
    .from(schema.submissions)
    .where(eq(schema.submissions.teamId, teamId))
    .limit(1);
  return submission ?? null;
}

export async function requireSubmissionForTeam(submissionId: string, teamId: string) {
  const submission = await getSubmissionById(submissionId);
  if (submission.teamId !== teamId) {
    throw new ApiError(403, "SUBMISSION_ACCESS_DENIED", "Submission does not belong to your team.");
  }
  return submission;
}

export function canEditSubmissionStatus(status: SubmissionStatus) {
  return status === "Draft" || status === "Needs Clarification";
}

export function canSubmitForReviewStatus(status: SubmissionStatus) {
  return status === "Draft";
}

export function canResubmitForReviewStatus(status: SubmissionStatus) {
  return status === "Needs Clarification";
}

export async function ensureSubmissionDeadlineOpen() {
  const settings = await getSettings();
  if (settings.submissionDeadline && new Date(settings.submissionDeadline).getTime() < Date.now()) {
    throw new ApiError(409, "SUBMISSION_DEADLINE_PASSED", "Submission deadline has already passed.");
  }
  return settings;
}

export async function ensureSubmissionFieldsComplete(submission: {
  title: string;
  shortSummary: string;
  trackId: string;
  problem: string;
  solution: string;
  impact: string;
  technicalDescription: string;
}) {
  const missing = [
    !submission.title && "title",
    !submission.shortSummary && "short_summary",
    !submission.trackId && "track_id",
    !submission.problem && "problem",
    !submission.solution && "solution",
    !submission.impact && "impact",
    !submission.technicalDescription && "technical_description",
  ].filter(Boolean);

  if (missing.length > 0) {
    throw new ApiError(422, "SUBMISSION_INCOMPLETE", "Required submission fields are missing.", {
      missingFields: missing,
    });
  }
}

export async function generateSubmissionCode() {
  const year = new Date().getFullYear();
  const [row] = await db.select({ count: sql<number>`count(*)` }).from(schema.submissions);
  const next = String(Number(row?.count ?? 0) + 1).padStart(4, "0");
  return `KAFD-${year}-${next}`;
}

export async function appendSubmissionHistory(
  submissionId: string,
  status: SubmissionStatus,
  actorUserId: string | null,
  note?: string | null,
) {
  await db.insert(schema.submissionStatusHistory).values({
    id: createId("submission_status"),
    submissionId,
    status,
    actorUserId,
    note: note ?? null,
    createdAt: nowIso(),
  });
}

export async function getStatusHistory(submissionId: string) {
  return db
    .select({
      id: schema.submissionStatusHistory.id,
      status: schema.submissionStatusHistory.status,
      actorUserId: schema.submissionStatusHistory.actorUserId,
      note: schema.submissionStatusHistory.note,
      createdAt: schema.submissionStatusHistory.createdAt,
      actorName: schema.profiles.fullName,
    })
    .from(schema.submissionStatusHistory)
    .leftJoin(schema.profiles, eq(schema.submissionStatusHistory.actorUserId, schema.profiles.id))
    .where(eq(schema.submissionStatusHistory.submissionId, submissionId))
    .orderBy(schema.submissionStatusHistory.createdAt);
}

export async function getClarificationNotes(submissionId: string) {
  const mentorNotes = await db
    .select({
      id: schema.submissionReviewNotes.id,
      action: schema.submissionReviewNotes.action,
      note: schema.submissionReviewNotes.note,
      createdAt: schema.submissionReviewNotes.createdAt,
      mentorName: schema.profiles.fullName,
    })
    .from(schema.submissionReviewNotes)
    .innerJoin(schema.mentorProfiles, eq(schema.submissionReviewNotes.mentorId, schema.mentorProfiles.id))
    .innerJoin(schema.profiles, eq(schema.mentorProfiles.userId, schema.profiles.id))
    .where(eq(schema.submissionReviewNotes.submissionId, submissionId))
    .orderBy(desc(schema.submissionReviewNotes.createdAt));

  return mentorNotes;
}

export function buildSubmissionActions(status: SubmissionStatus, teamRole: TeamRole | null) {
  const actions: string[] = [];
  if (teamRole === "lead") {
    if (status === "Draft") {
      actions.push("edit", "preview", "submit_for_review");
    } else if (status === "Needs Clarification") {
      actions.push("edit", "preview", "resubmit_for_review");
    } else {
      actions.push("preview", "view_status");
    }
  } else if (teamRole === "member") {
    actions.push("preview", "view_status");
  }
  return actions;
}

export function participantLabelForStatus(status: SubmissionStatus) {
  return SUBMISSION_STATUS_LABELS[status] ?? status;
}

export async function serializeSubmission(submission: Awaited<ReturnType<typeof getSubmissionById>>) {
  const [track] = await db
    .select({ id: schema.tracks.id, name: schema.tracks.name })
    .from(schema.tracks)
    .where(eq(schema.tracks.id, submission.trackId))
    .limit(1);

  return {
    id: submission.id,
    submission_code: submission.submissionCode,
    team_id: submission.teamId,
    track_id: submission.trackId,
    track_name: track?.name ?? null,
    title: submission.title,
    short_summary: submission.shortSummary,
    problem: submission.problem,
    solution: submission.solution,
    impact: submission.impact,
    technical_description: submission.technicalDescription,
    demo_url: submission.demoUrl,
    deck_url: submission.deckUrl,
    github_url: submission.githubUrl,
    video_url: submission.videoUrl,
    status: submission.status,
    participant_label: participantLabelForStatus(submission.status as SubmissionStatus),
    submitted_at: submission.submittedAt,
    last_returned_at: submission.lastReturnedAt,
    approved_for_judging_at: submission.approvedForJudgingAt,
    released_to_judges_at: submission.releasedToJudgesAt,
    created_at: submission.createdAt,
    updated_at: submission.updatedAt,
  };
}

export async function getMentorProfileByUserId(userId: string) {
  const [profile] = await db
    .select()
    .from(schema.mentorProfiles)
    .where(eq(schema.mentorProfiles.userId, userId))
    .limit(1);
  if (!profile) {
    throw new ApiError(404, "MENTOR_PROFILE_NOT_FOUND", "Mentor profile was not found.");
  }
  return profile;
}

export async function getJudgeProfileByUserId(userId: string) {
  const [profile] = await db
    .select()
    .from(schema.judgeProfiles)
    .where(eq(schema.judgeProfiles.userId, userId))
    .limit(1);
  if (!profile) {
    throw new ApiError(404, "JUDGE_PROFILE_NOT_FOUND", "Judge profile was not found.");
  }
  return profile;
}

export async function getMentorAssignmentForSubmission(mentorId: string, submissionId: string) {
  const [assignment] = await db
    .select()
    .from(schema.mentorAssignments)
    .where(
      and(
        eq(schema.mentorAssignments.mentorId, mentorId),
        eq(schema.mentorAssignments.submissionId, submissionId),
      ),
    )
    .limit(1);
  if (!assignment) {
    throw new ApiError(404, "MENTOR_ASSIGNMENT_NOT_FOUND", "Mentor assignment was not found.");
  }
  return assignment;
}

export async function getJudgeAssignmentForSubmission(judgeId: string, submissionId: string) {
  const [assignment] = await db
    .select()
    .from(schema.judgeAssignments)
    .where(
      and(
        eq(schema.judgeAssignments.judgeId, judgeId),
        eq(schema.judgeAssignments.submissionId, submissionId),
      ),
    )
    .limit(1);
  if (!assignment) {
    throw new ApiError(404, "JUDGE_ASSIGNMENT_NOT_FOUND", "Judge assignment was not found.");
  }
  return assignment;
}

export async function listMentorAssignments(mentorId: string) {
  return db
    .select({
      assignmentId: schema.mentorAssignments.id,
      status: schema.mentorAssignments.status,
      assignedAt: schema.mentorAssignments.assignedAt,
      completedAt: schema.mentorAssignments.completedAt,
      submissionId: schema.submissions.id,
      submissionCode: schema.submissions.submissionCode,
      submissionStatus: schema.submissions.status,
      title: schema.submissions.title,
      teamId: schema.teams.id,
      teamName: schema.teams.name,
      trackId: schema.tracks.id,
      trackName: schema.tracks.name,
      updatedAt: schema.submissions.updatedAt,
    })
    .from(schema.mentorAssignments)
    .innerJoin(schema.submissions, eq(schema.mentorAssignments.submissionId, schema.submissions.id))
    .innerJoin(schema.teams, eq(schema.submissions.teamId, schema.teams.id))
    .innerJoin(schema.tracks, eq(schema.submissions.trackId, schema.tracks.id))
    .where(eq(schema.mentorAssignments.mentorId, mentorId))
    .orderBy(desc(schema.mentorAssignments.assignedAt));
}

export async function listJudgeAssignments(judgeId: string) {
  return db
    .select({
      assignmentId: schema.judgeAssignments.id,
      status: schema.judgeAssignments.status,
      assignedAt: schema.judgeAssignments.assignedAt,
      completedAt: schema.judgeAssignments.completedAt,
      submissionId: schema.submissions.id,
      submissionCode: schema.submissions.submissionCode,
      submissionStatus: schema.submissions.status,
      title: schema.submissions.title,
      teamId: schema.teams.id,
      teamName: schema.teams.name,
      trackId: schema.tracks.id,
      trackName: schema.tracks.name,
      updatedAt: schema.submissions.updatedAt,
    })
    .from(schema.judgeAssignments)
    .innerJoin(schema.submissions, eq(schema.judgeAssignments.submissionId, schema.submissions.id))
    .innerJoin(schema.teams, eq(schema.submissions.teamId, schema.teams.id))
    .innerJoin(schema.tracks, eq(schema.submissions.trackId, schema.tracks.id))
    .where(eq(schema.judgeAssignments.judgeId, judgeId))
    .orderBy(desc(schema.judgeAssignments.assignedAt));
}

export function calculateTotalScore(scores: {
  problemRelevance: number;
  innovation: number;
  executionPrototype: number;
  impactScalability: number;
  presentationClarity: number;
}) {
  const total =
    (scores.problemRelevance / 5) * 20 +
    (scores.innovation / 5) * 20 +
    (scores.executionPrototype / 5) * 25 +
    (scores.impactScalability / 5) * 20 +
    (scores.presentationClarity / 5) * 15;

  return Math.round(total * 100) / 100;
}

export async function getScoreForAssignment(assignmentId: string) {
  const [score] = await db
    .select()
    .from(schema.scores)
    .where(eq(schema.scores.assignmentId, assignmentId))
    .limit(1);
  return score ?? null;
}

export async function getSubmissionScores(submissionId: string) {
  return db
    .select({
      id: schema.scores.id,
      assignmentId: schema.scores.assignmentId,
      submissionId: schema.scores.submissionId,
      judgeId: schema.scores.judgeId,
      judgeName: schema.profiles.fullName,
      problemRelevance: schema.scores.problemRelevance,
      innovation: schema.scores.innovation,
      executionPrototype: schema.scores.executionPrototype,
      impactScalability: schema.scores.impactScalability,
      presentationClarity: schema.scores.presentationClarity,
      totalScore: schema.scores.totalScore,
      comments: schema.scores.comments,
      submittedAt: schema.scores.submittedAt,
      createdAt: schema.scores.createdAt,
      updatedAt: schema.scores.updatedAt,
    })
    .from(schema.scores)
    .innerJoin(schema.judgeProfiles, eq(schema.scores.judgeId, schema.judgeProfiles.id))
    .innerJoin(schema.profiles, eq(schema.judgeProfiles.userId, schema.profiles.id))
    .where(eq(schema.scores.submissionId, submissionId))
    .orderBy(desc(schema.scores.totalScore));
}

export async function maybeMarkSubmissionJudged(submissionId: string) {
  const assignments = await db
    .select({
      id: schema.judgeAssignments.id,
      completedAt: schema.judgeAssignments.completedAt,
    })
    .from(schema.judgeAssignments)
    .where(eq(schema.judgeAssignments.submissionId, submissionId));

  if (assignments.length === 0) return false;
  const allDone = assignments.every((assignment) => Boolean(assignment.completedAt));
  if (!allDone) return false;

  await db
    .update(schema.submissions)
    .set({
      status: "Judged",
      updatedAt: nowIso(),
    })
    .where(eq(schema.submissions.id, submissionId));
  return true;
}

export async function serializeMentorSubmissionView(submissionId: string, mentorId: string) {
  const submission = await getSubmissionDetails(submissionId);
  const assignment = await getMentorAssignmentForSubmission(mentorId, submissionId);
  const notes = await getClarificationNotes(submissionId);
  return {
    ...submission,
    assignment: {
      id: assignment.id,
      status: assignment.status,
      assigned_at: assignment.assignedAt,
      completed_at: assignment.completedAt,
    },
    clarification_notes: notes,
  };
}

export async function serializeJudgeSubmissionView(submissionId: string, judgeId: string) {
  const submission = await getSubmissionDetails(submissionId);
  const assignment = await getJudgeAssignmentForSubmission(judgeId, submissionId);
  const ownScore = await getScoreForAssignment(assignment.id);
  return {
    ...submission,
    assignment: {
      id: assignment.id,
      status: assignment.status,
      assigned_at: assignment.assignedAt,
      completed_at: assignment.completedAt,
    },
    own_score: ownScore
      ? {
          id: ownScore.id,
          problem_relevance: ownScore.problemRelevance,
          innovation: ownScore.innovation,
          execution_prototype: ownScore.executionPrototype,
          impact_scalability: ownScore.impactScalability,
          presentation_clarity: ownScore.presentationClarity,
          total_score: ownScore.totalScore,
          comments: ownScore.comments,
          submitted_at: ownScore.submittedAt,
        }
      : null,
  };
}

export async function buildAdminDashboardMetrics() {
  const submissions = await db.select().from(schema.submissions);
  const participants = await db
    .select()
    .from(schema.profiles)
    .where(eq(schema.profiles.platformRole, "participant"));
  const teams = await db.select().from(schema.teams);
  const mentorAssignments = await db.select().from(schema.mentorAssignments);
  const judgeAssignments = await db.select().from(schema.judgeAssignments);

  const countStatus = (status: string) => submissions.filter((submission) => submission.status === status).length;
  const mentorReviewTimes = mentorAssignments
    .filter((assignment) => assignment.completedAt)
    .map((assignment) => {
      return new Date(assignment.completedAt!).getTime() - new Date(assignment.assignedAt).getTime();
    });

  const completedJudgeReviews = judgeAssignments.filter((assignment) => assignment.completedAt).length;
  const assignedJudgeReviews = judgeAssignments.length;

  return {
    total_participants: participants.length,
    activated_participants: participants.filter((profile) => profile.status === "active").length,
    teams_created: teams.length,
    draft_submissions: countStatus("Draft"),
    submitted_for_mentor_review: countStatus("Submitted for Review"),
    needs_clarification: countStatus("Needs Clarification"),
    resubmitted_for_review: countStatus("Resubmitted for Review"),
    approved_for_judging: countStatus("Approved for Judging"),
    released_to_judges: countStatus("Released to Judges"),
    judging_in_progress: countStatus("Judging in Progress"),
    judged_submissions: countStatus("Judged"),
    shortlisted_projects: countStatus("Shortlisted"),
    winners_selected: countStatus("Winner"),
    pending_mentor_reviews: mentorAssignments.filter((assignment) => !assignment.completedAt).length,
    returned_submissions: mentorAssignments.filter((assignment) => assignment.status === "returned").length,
    approved_submissions: mentorAssignments.filter((assignment) => assignment.status === "approved").length,
    average_mentor_review_time:
      mentorReviewTimes.length > 0
        ? Math.round(mentorReviewTimes.reduce((acc, value) => acc + value, 0) / mentorReviewTimes.length / 1000)
        : 0,
    assigned_judge_reviews: assignedJudgeReviews,
    completed_judge_reviews: completedJudgeReviews,
    pending_judge_reviews: assignedJudgeReviews - completedJudgeReviews,
    judging_completion_percentage:
      assignedJudgeReviews > 0 ? Math.round((completedJudgeReviews / assignedJudgeReviews) * 100) : 0,
  };
}

export async function listParticipants() {
  return db
    .select({
      id: schema.profiles.id,
      email: schema.profiles.email,
      fullName: schema.profiles.fullName,
      phone: schema.profiles.phone,
      status: schema.profiles.status,
      createdAt: schema.profiles.createdAt,
      lastLoginAt: schema.profiles.lastLoginAt,
    })
    .from(schema.profiles)
    .where(eq(schema.profiles.platformRole, "participant"))
    .orderBy(asc(schema.profiles.createdAt));
}

export async function getParticipantById(participantId: string) {
  const [participant] = await db
    .select()
    .from(schema.profiles)
    .where(and(eq(schema.profiles.id, participantId), eq(schema.profiles.platformRole, "participant")))
    .limit(1);
  if (!participant) {
    throw new ApiError(404, "PARTICIPANT_NOT_FOUND", "Participant was not found.");
  }
  const context = await buildUserContext(participant);
  return { participant, context };
}

export async function listTeamsWithDetails() {
  const teams = await db
    .select({
      id: schema.teams.id,
      name: schema.teams.name,
      leadUserId: schema.teams.leadUserId,
      trackId: schema.teams.trackId,
      status: schema.teams.status,
      createdAt: schema.teams.createdAt,
      updatedAt: schema.teams.updatedAt,
      leadName: schema.profiles.fullName,
      trackName: schema.tracks.name,
    })
    .from(schema.teams)
    .innerJoin(schema.profiles, eq(schema.teams.leadUserId, schema.profiles.id))
    .leftJoin(schema.tracks, eq(schema.teams.trackId, schema.tracks.id))
    .orderBy(asc(schema.teams.createdAt));

  const counts = await db
    .select({
      teamId: schema.teamMemberships.teamId,
      count: sql<number>`count(*)`,
    })
    .from(schema.teamMemberships)
    .where(eq(schema.teamMemberships.status, "active"))
    .groupBy(schema.teamMemberships.teamId);

  const countMap = new Map(counts.map((row) => [row.teamId, Number(row.count)]));
  return teams.map((team) => ({
    ...team,
    active_members_count: countMap.get(team.id) ?? 0,
  }));
}

export async function getTeamDetailsForAdmin(teamId: string) {
  const [team] = await listTeamsWithDetails().then((rows) => rows.filter((row) => row.id === teamId));
  if (!team) {
    throw new ApiError(404, "TEAM_NOT_FOUND", "Team was not found.");
  }
  const members = await listTeamMembers(teamId);
  const invites = await listTeamInvites(teamId);
  const submission = await getTeamSubmission(teamId);
  return {
    team,
    members,
    invites,
    submission: submission ? await serializeSubmission(submission) : null,
  };
}

export async function listSubmissionsForAdmin() {
  const rows = await db
    .select({
      id: schema.submissions.id,
      submissionCode: schema.submissions.submissionCode,
      title: schema.submissions.title,
      status: schema.submissions.status,
      updatedAt: schema.submissions.updatedAt,
      teamId: schema.teams.id,
      teamName: schema.teams.name,
      trackId: schema.tracks.id,
      trackName: schema.tracks.name,
    })
    .from(schema.submissions)
    .innerJoin(schema.teams, eq(schema.submissions.teamId, schema.teams.id))
    .innerJoin(schema.tracks, eq(schema.submissions.trackId, schema.tracks.id))
    .orderBy(desc(schema.submissions.updatedAt));

  return rows;
}

export async function listMentorsForAdmin() {
  return db
    .select({
      id: schema.mentorProfiles.id,
      userId: schema.mentorProfiles.userId,
      fullName: schema.profiles.fullName,
      email: schema.profiles.email,
      phone: schema.profiles.phone,
      status: schema.profiles.status,
      organization: schema.mentorProfiles.organization,
      title: schema.mentorProfiles.title,
      assignedTracks: schema.mentorProfiles.assignedTracks,
      active: schema.mentorProfiles.active,
      createdAt: schema.mentorProfiles.createdAt,
      updatedAt: schema.mentorProfiles.updatedAt,
    })
    .from(schema.mentorProfiles)
    .innerJoin(schema.profiles, eq(schema.mentorProfiles.userId, schema.profiles.id))
    .orderBy(desc(schema.mentorProfiles.createdAt));
}

export async function listJudgesForAdmin() {
  return db
    .select({
      id: schema.judgeProfiles.id,
      userId: schema.judgeProfiles.userId,
      fullName: schema.profiles.fullName,
      email: schema.profiles.email,
      phone: schema.profiles.phone,
      status: schema.profiles.status,
      organization: schema.judgeProfiles.organization,
      title: schema.judgeProfiles.title,
      bio: schema.judgeProfiles.bio,
      assignedTracks: schema.judgeProfiles.assignedTracks,
      active: schema.judgeProfiles.active,
      createdAt: schema.judgeProfiles.createdAt,
      updatedAt: schema.judgeProfiles.updatedAt,
    })
    .from(schema.judgeProfiles)
    .innerJoin(schema.profiles, eq(schema.judgeProfiles.userId, schema.profiles.id))
    .orderBy(desc(schema.judgeProfiles.createdAt));
}

export async function createInvitedMentor(payload: z.infer<typeof mentorInviteSchema>) {
  const now = nowIso();
  const email = normalizeEmail(payload.email);
  const [existing] = await db
    .select({ id: schema.profiles.id })
    .from(schema.profiles)
    .where(eq(schema.profiles.email, email))
    .limit(1);
  if (existing) {
    throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists.");
  }

  const userId = createId("usr");
  const mentorProfileId = createId("mentor_profile");
  await db.insert(schema.profiles).values({
    id: userId,
    email,
    passwordHash: "invite_only",
    fullName: payload.fullName,
    phone: payload.phone,
    platformRole: "mentor",
    status: "invited",
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  });
  await db.insert(schema.mentorProfiles).values({
    id: mentorProfileId,
    userId,
    organization: payload.organization,
    title: payload.title,
    assignedTracks: JSON.stringify(payload.assignedTracks),
    active: true,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(schema.emailLogs).values({
    id: createId("email"),
    recipientEmail: email,
    emailType: "mentor_invite",
    relatedUserId: userId,
    relatedSubmissionId: null,
    status: "queued",
    sentAt: null,
    createdAt: now,
  });
  return mentorProfileId;
}

export async function createInvitedJudge(payload: z.infer<typeof judgeInviteSchema>) {
  const now = nowIso();
  const email = normalizeEmail(payload.email);
  const [existing] = await db
    .select({ id: schema.profiles.id })
    .from(schema.profiles)
    .where(eq(schema.profiles.email, email))
    .limit(1);
  if (existing) {
    throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists.");
  }

  const userId = createId("usr");
  const judgeProfileId = createId("judge_profile");
  await db.insert(schema.profiles).values({
    id: userId,
    email,
    passwordHash: "invite_only",
    fullName: payload.fullName,
    phone: payload.phone,
    platformRole: "judge",
    status: "invited",
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null,
  });
  await db.insert(schema.judgeProfiles).values({
    id: judgeProfileId,
    userId,
    organization: payload.organization,
    title: payload.title,
    bio: payload.bio,
    assignedTracks: JSON.stringify(payload.assignedTracks),
    active: true,
    createdAt: now,
    updatedAt: now,
  });
  await db.insert(schema.emailLogs).values({
    id: createId("email"),
    recipientEmail: email,
    emailType: "judge_invite",
    relatedUserId: userId,
    relatedSubmissionId: null,
    status: "queued",
    sentAt: null,
    createdAt: now,
  });
  return judgeProfileId;
}

export async function createCsvResponse(
  filename: string,
  headers: string[],
  rows: Array<Array<string | number | null | undefined>>,
) {
  const escape = (value: string | number | null | undefined) => {
    const text = value == null ? "" : String(value);
    if (/[",\n]/.test(text)) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const csv = [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
  return new Response(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
    },
  });
}
