import { and, asc, desc, eq } from "drizzle-orm";
import { z } from "zod";
import {
  clearSessionCookie,
  createSession,
  createSessionCookie,
  destroySessionByToken,
  getAuthenticatedProfile,
  readCookie,
  requireAuthenticatedProfile,
  verifyPassword,
} from "./auth";
import { SESSION_COOKIE, type SubmissionStatus } from "./constants";
import { buildUserContext } from "./context";
import { db, schema } from "./db";
import { ApiError } from "./errors";
import { canPublicRegister, hasPlatformRole } from "./permissions";
import { apiErrorResponse, apiSuccess } from "./responses";
import { touchLastLogin } from "./seed";
import { createId, normalizeEmail, nowIso, parseJsonArray } from "./utils";
import { hashPassword } from "./auth";
import {
  acceptInviteForUser,
  appendSubmissionHistory,
  assertLeadOwnsTeam,
  buildAdminDashboardMetrics,
  buildSubmissionActions,
  calculateTotalScore,
  canEditSubmissionStatus,
  canResubmitForReviewStatus,
  canSubmitForReviewStatus,
  createCsvResponse,
  createInvitedJudge,
  createInvitedMentor,
  createInviteToken,
  createTeamSchema,
  ensureCanCreateTeam,
  ensureSubmissionDeadlineOpen,
  ensureSubmissionFieldsComplete,
  ensureTeamCapacity,
  generateSubmissionCode,
  getActiveMembership,
  getClarificationNotes,
  getJudgeAssignmentForSubmission,
  getJudgeProfileByUserId,
  getMentorAssignmentForSubmission,
  getMentorProfileByUserId,
  getParticipantById,
  getScoreForAssignment,
  getSettings,
  getStatusHistory,
  getSubmissionById,
  getSubmissionDetails,
  getSubmissionScores,
  getTeamById,
  getTeamDetailsForAdmin,
  getTeamSubmission,
  getTeamSubmission as getSubmissionForTeam,
  inviteSchema,
  judgeAssignmentSchema,
  judgeInviteSchema,
  judgeUpdateSchema,
  listJudgeAssignments,
  listJudgesForAdmin,
  listMentorAssignments,
  listMentorsForAdmin,
  listParticipants,
  listSubmissionsForAdmin,
  listTeamInvites,
  listTeamMembers,
  listTeamsWithDetails,
  loginPayloadSchema,
  maybeMarkSubmissionJudged,
  mentorAssignmentSchema,
  mentorInviteSchema,
  mentorUpdateSchema,
  normalizeSubmissionPayload,
  participantLabelForStatus,
  participantStatusSchema,
  registerPayloadSchema,
  requireActiveMembership,
  requireAdmin,
  requireJudge,
  requireLeadMembership,
  requireMentor,
  requireParticipant,
  requireSubmissionForTeam,
  requireTeamTrack,
  reviewNoteSchema,
  scoreSchema,
  serializeJudgeSubmissionView,
  serializeMentorSubmissionView,
  serializeSubmission,
  settingsUpdateSchema,
  submissionSchema,
  updateTeamSchema,
} from "./workflow";

async function parseJson<T>(request: Request, schemaDef: z.ZodSchema<T>) {
  const raw = await request.json().catch(() => {
    throw new ApiError(400, "INVALID_JSON", "Request body must be valid JSON.");
  });

  const result = schemaDef.safeParse(raw);
  if (!result.success) {
    throw new ApiError(422, "VALIDATION_ERROR", "Request validation failed.", result.error.flatten());
  }

  return result.data;
}

function matchRoute(pathname: string, pattern: RegExp) {
  const match = pathname.match(pattern);
  return match?.groups ?? null;
}

async function getAuthContextResponse(request: Request) {
  const profile = await getAuthenticatedProfile(request);
  if (!profile) {
    return apiSuccess({
      authenticated: false,
      user: null,
      platformRole: null,
      activeTeam: null,
      teamRole: null,
      memberships: [],
      correctRedirectPath: "/login",
      permissions: [],
    });
  }

  const context = await buildUserContext(profile);
  return apiSuccess({ authenticated: true, ...context });
}

export async function handleApiRequest(request: Request) {
  try {
    const url = new URL(request.url);
    const pathname = url.pathname;

    if (request.method === "GET" && pathname === "/api/health") {
      return apiSuccess({ status: "ok", service: "kafd-backend-phase-3" });
    }

    if (request.method === "POST" && pathname === "/api/auth/register") {
      const payload = await parseJson(request, registerPayloadSchema);
      const email = normalizeEmail(payload.email);

      const [existing] = await db
        .select({ id: schema.profiles.id })
        .from(schema.profiles)
        .where(eq(schema.profiles.email, email))
        .limit(1);
      if (existing) {
        throw new ApiError(409, "EMAIL_ALREADY_EXISTS", "An account with this email already exists.");
      }

      if (!canPublicRegister("participant")) {
        throw new ApiError(403, "REGISTRATION_DISABLED", "Public registration is disabled.");
      }

      const now = nowIso();
      const userId = createId("usr");

      await db.insert(schema.profiles).values({
        id: userId,
        email,
        passwordHash: await hashPassword(payload.password),
        fullName: payload.fullName.trim(),
        phone: payload.phone.trim(),
        platformRole: "participant",
        status: "active",
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });

      const session = await createSession(userId, request);
      const context = await buildUserContext({
        id: userId,
        email,
        fullName: payload.fullName.trim(),
        phone: payload.phone.trim(),
        platformRole: "participant",
        status: "active",
      });

      return apiSuccess(
        { authenticated: true, ...context },
        {
          status: 201,
          headers: { "set-cookie": createSessionCookie(session.token, session.expiresAt) },
        },
      );
    }

    if (request.method === "POST" && pathname === "/api/auth/login") {
      const payload = await parseJson(request, loginPayloadSchema);
      const email = normalizeEmail(payload.email);

      const [profile] = await db
        .select()
        .from(schema.profiles)
        .where(eq(schema.profiles.email, email))
        .limit(1);

      if (!profile || !(await verifyPassword(payload.password, profile.passwordHash))) {
        throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password.");
      }

      if (profile.status === "suspended") {
        throw new ApiError(403, "ACCOUNT_SUSPENDED", "This account has been suspended.");
      }

      if (!hasPlatformRole(profile.platformRole as never, ["admin", "participant", "mentor", "judge"])) {
        throw new ApiError(403, "ROLE_NOT_ALLOWED", "This account role is not permitted.");
      }

      await touchLastLogin(profile.id);
      const session = await createSession(profile.id, request);
      const context = await buildUserContext(profile);

      return apiSuccess(
        { authenticated: true, ...context },
        {
          headers: { "set-cookie": createSessionCookie(session.token, session.expiresAt) },
        },
      );
    }

    if (request.method === "POST" && pathname === "/api/auth/logout") {
      const token = readCookie(request, SESSION_COOKIE);
      await destroySessionByToken(token);
      return apiSuccess(
        { authenticated: false },
        { headers: { "set-cookie": clearSessionCookie() } },
      );
    }

    if (
      request.method === "GET" &&
      (pathname === "/api/auth/me" || pathname === "/api/auth/context" || pathname === "/api/me/context")
    ) {
      return await getAuthContextResponse(request);
    }

    if (request.method === "GET" && pathname === "/api/admin/settings") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      return apiSuccess(await getSettings());
    }

    if (request.method === "PUT" && pathname === "/api/admin/settings") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const payload = await parseJson(request, settingsUpdateSchema);
      const now = nowIso();
      await db
        .update(schema.adminSettings)
        .set({
          ...(payload.registration_deadline ? { registrationDeadline: payload.registration_deadline } : {}),
          ...(payload.submission_deadline ? { submissionDeadline: payload.submission_deadline } : {}),
          ...(payload.mentor_review_deadline ? { mentorReviewDeadline: payload.mentor_review_deadline } : {}),
          ...(payload.judging_deadline ? { judgingDeadline: payload.judging_deadline } : {}),
          ...(payload.max_team_size ? { maxTeamSize: payload.max_team_size } : {}),
          ...(payload.allow_submission_edits !== undefined
            ? { allowSubmissionEdits: payload.allow_submission_edits }
            : {}),
          ...(payload.platform_status ? { platformStatus: payload.platform_status } : {}),
          updatedAt: now,
        })
        .where(eq(schema.adminSettings.id, "settings_primary"));
      return apiSuccess(await getSettings());
    }

    if (request.method === "GET" && pathname === "/api/teams/my") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await getActiveMembership(profile.id);
      if (!membership) return apiSuccess(null);

      const [track] = await db
        .select({ id: schema.tracks.id, name: schema.tracks.name })
        .from(schema.tracks)
        .where(eq(schema.tracks.id, membership.trackId ?? ""))
        .limit(1);

      return apiSuccess({
        id: membership.teamId,
        name: membership.teamName,
        status: membership.teamStatus,
        lead_user_id: membership.leadUserId,
        track_id: membership.trackId,
        track_name: track?.name ?? null,
        team_role: membership.teamRole,
      });
    }

    if (request.method === "POST" && pathname === "/api/teams") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      await ensureCanCreateTeam(profile.id);
      const payload = await parseJson(request, createTeamSchema);
      const trackId = payload.track_id ?? payload.trackId ?? null;
      await requireTeamTrack(trackId);

      const now = nowIso();
      const teamId = createId("team");
      await db.insert(schema.teams).values({
        id: teamId,
        name: payload.name.trim(),
        leadUserId: profile.id,
        trackId,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
      await db.insert(schema.teamMemberships).values({
        id: createId("tm"),
        teamId,
        userId: profile.id,
        teamRole: "lead",
        status: "active",
        joinedAt: now,
        createdAt: now,
      });

      return apiSuccess(
        {
          team: await getTeamById(teamId),
          context: await buildUserContext(profile),
        },
        { status: 201 },
      );
    }

    const teamRoute = matchRoute(pathname, /^\/api\/teams\/(?<teamId>[^/]+)$/);
    if (teamRoute && request.method === "PUT") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      await assertLeadOwnsTeam(profile.id, teamRoute.teamId);
      const payload = await parseJson(request, updateTeamSchema);
      const nextTrackId = payload.track_id ?? payload.trackId;
      if (nextTrackId) await requireTeamTrack(nextTrackId);
      await db
        .update(schema.teams)
        .set({
          ...(payload.name ? { name: payload.name.trim() } : {}),
          ...(nextTrackId ? { trackId: nextTrackId } : {}),
          updatedAt: nowIso(),
        })
        .where(eq(schema.teams.id, teamRoute.teamId));
      return apiSuccess(await getTeamById(teamRoute.teamId));
    }

    const membersRoute = matchRoute(pathname, /^\/api\/teams\/(?<teamId>[^/]+)\/members$/);
    if (membersRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireActiveMembership(profile.id);
      if (membership.teamId !== membersRoute.teamId) {
        throw new ApiError(403, "TEAM_ACCESS_DENIED", "You can only view your own team members.");
      }
      return apiSuccess(await listTeamMembers(membersRoute.teamId));
    }

    const invitesRoute = matchRoute(pathname, /^\/api\/teams\/(?<teamId>[^/]+)\/invites$/);
    if (invitesRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      await assertLeadOwnsTeam(profile.id, invitesRoute.teamId);
      const payload = await parseJson(request, inviteSchema);
      const email = normalizeEmail(payload.email);
      await ensureTeamCapacity(invitesRoute.teamId);

      const teamMembers = await listTeamMembers(invitesRoute.teamId);
      if (teamMembers.some((member) => normalizeEmail(member.email) === email)) {
        throw new ApiError(409, "ALREADY_ON_TEAM", "That participant is already on the team.");
      }

      const [existingInvite] = await db
        .select({ id: schema.teamInvites.id })
        .from(schema.teamInvites)
        .where(
          and(
            eq(schema.teamInvites.teamId, invitesRoute.teamId),
            eq(schema.teamInvites.email, email),
            eq(schema.teamInvites.status, "pending"),
          ),
        )
        .limit(1);
      if (existingInvite) {
        throw new ApiError(409, "INVITE_ALREADY_PENDING", "A pending invite already exists for this email.");
      }

      const invite = {
        id: createId("invite"),
        teamId: invitesRoute.teamId,
        email,
        token: createInviteToken(),
        invitedBy: profile.id,
        status: "pending" as const,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
        createdAt: nowIso(),
      };
      await db.insert(schema.teamInvites).values(invite);
      return apiSuccess(invite, { status: 201 });
    }

    if (invitesRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireActiveMembership(profile.id);
      if (membership.teamId !== invitesRoute.teamId) {
        throw new ApiError(403, "TEAM_ACCESS_DENIED", "You can only view invites for your own team.");
      }
      return apiSuccess(await listTeamInvites(invitesRoute.teamId));
    }

    const acceptInviteRoute = matchRoute(pathname, /^\/api\/team-invites\/(?<token>[^/]+)\/accept$/);
    if (acceptInviteRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      const result = await acceptInviteForUser(acceptInviteRoute.token, profile);
      return apiSuccess({
        invite: result.invite,
        membership: result.membership,
        context: result.context,
      });
    }

    if (request.method === "GET" && pathname === "/api/submissions/my") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireActiveMembership(profile.id);
      const submission = await getTeamSubmission(membership.teamId);
      return apiSuccess(submission ? await serializeSubmission(submission) : null);
    }

    if (request.method === "POST" && pathname === "/api/submissions") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireLeadMembership(profile.id);
      const existingSubmission = await getTeamSubmission(membership.teamId);
      if (existingSubmission) {
        throw new ApiError(409, "SUBMISSION_ALREADY_EXISTS", "Your team already has a submission.");
      }

      const payload = normalizeSubmissionPayload(await parseJson(request, submissionSchema));
      await requireTeamTrack(payload.trackId);
      const team = await getTeamById(membership.teamId);
      const now = nowIso();
      const submissionId = createId("submission");

      await db.insert(schema.submissions).values({
        id: submissionId,
        submissionCode: await generateSubmissionCode(),
        teamId: membership.teamId,
        trackId: payload.trackId,
        title: payload.title,
        shortSummary: payload.shortSummary,
        problem: payload.problem,
        solution: payload.solution,
        impact: payload.impact,
        technicalDescription: payload.technicalDescription,
        demoUrl: payload.demoUrl,
        deckUrl: payload.deckUrl,
        githubUrl: payload.githubUrl,
        videoUrl: payload.videoUrl,
        status: "Draft",
        submittedAt: null,
        lastReturnedAt: null,
        approvedForJudgingAt: null,
        releasedToJudgesAt: null,
        createdAt: now,
        updatedAt: now,
      });

      await db
        .update(schema.teams)
        .set({ trackId: payload.trackId, updatedAt: now })
        .where(eq(schema.teams.id, team.id));

      await appendSubmissionHistory(submissionId, "Draft", profile.id, "Submission draft created");
      return apiSuccess(await serializeSubmission(await getSubmissionById(submissionId)), { status: 201 });
    }

    const submissionRoute = matchRoute(pathname, /^\/api\/submissions\/(?<submissionId>[^/]+)$/);
    if (submissionRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireActiveMembership(profile.id);
      return apiSuccess(await serializeSubmission(await requireSubmissionForTeam(submissionRoute.submissionId, membership.teamId)));
    }

    if (submissionRoute && request.method === "PUT") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireLeadMembership(profile.id);
      const submission = await requireSubmissionForTeam(submissionRoute.submissionId, membership.teamId);
      if (!canEditSubmissionStatus(submission.status as SubmissionStatus)) {
        throw new ApiError(409, "SUBMISSION_EDIT_LOCKED", "Submission can no longer be edited.");
      }
      const payload = normalizeSubmissionPayload(await parseJson(request, submissionSchema));
      await requireTeamTrack(payload.trackId);
      const now = nowIso();
      await db
        .update(schema.submissions)
        .set({
          trackId: payload.trackId,
          title: payload.title,
          shortSummary: payload.shortSummary,
          problem: payload.problem,
          solution: payload.solution,
          impact: payload.impact,
          technicalDescription: payload.technicalDescription,
          demoUrl: payload.demoUrl,
          deckUrl: payload.deckUrl,
          githubUrl: payload.githubUrl,
          videoUrl: payload.videoUrl,
          updatedAt: now,
        })
        .where(eq(schema.submissions.id, submissionRoute.submissionId));
      await db
        .update(schema.teams)
        .set({ trackId: payload.trackId, updatedAt: now })
        .where(eq(schema.teams.id, membership.teamId));
      return apiSuccess(await serializeSubmission(await getSubmissionById(submissionRoute.submissionId)));
    }

    const previewRoute = matchRoute(pathname, /^\/api\/submissions\/(?<submissionId>[^/]+)\/preview$/);
    if (previewRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireActiveMembership(profile.id);
      const submission = await requireSubmissionForTeam(previewRoute.submissionId, membership.teamId);
      return apiSuccess({ ...(await serializeSubmission(submission)), preview_mode: "read_only" });
    }

    const submitRoute = matchRoute(pathname, /^\/api\/submissions\/(?<submissionId>[^/]+)\/submit-for-review$/);
    if (submitRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireLeadMembership(profile.id);
      const submission = await requireSubmissionForTeam(submitRoute.submissionId, membership.teamId);
      if (!canSubmitForReviewStatus(submission.status as SubmissionStatus)) {
        throw new ApiError(409, "INVALID_SUBMISSION_STATUS", "Only draft submissions can be submitted for review.");
      }
      await ensureSubmissionFieldsComplete({
        title: submission.title,
        shortSummary: submission.shortSummary,
        trackId: submission.trackId,
        problem: submission.problem,
        solution: submission.solution,
        impact: submission.impact,
        technicalDescription: submission.technicalDescription,
      });
      await ensureSubmissionDeadlineOpen();
      const now = nowIso();
      await db
        .update(schema.submissions)
        .set({ status: "Submitted for Review", submittedAt: now, updatedAt: now })
        .where(eq(schema.submissions.id, submitRoute.submissionId));
      await db
        .update(schema.mentorAssignments)
        .set({ status: "assigned", completedAt: null, updatedAt: now })
        .where(eq(schema.mentorAssignments.submissionId, submitRoute.submissionId));
      await appendSubmissionHistory(submitRoute.submissionId, "Submitted for Review", profile.id, "Submitted for mentor review");
      return apiSuccess(await serializeSubmission(await getSubmissionById(submitRoute.submissionId)));
    }

    const resubmitRoute = matchRoute(pathname, /^\/api\/submissions\/(?<submissionId>[^/]+)\/resubmit-for-review$/);
    if (resubmitRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireLeadMembership(profile.id);
      const submission = await requireSubmissionForTeam(resubmitRoute.submissionId, membership.teamId);
      if (!canResubmitForReviewStatus(submission.status as SubmissionStatus)) {
        throw new ApiError(409, "INVALID_SUBMISSION_STATUS", "Only clarification submissions can be resubmitted.");
      }
      await ensureSubmissionFieldsComplete({
        title: submission.title,
        shortSummary: submission.shortSummary,
        trackId: submission.trackId,
        problem: submission.problem,
        solution: submission.solution,
        impact: submission.impact,
        technicalDescription: submission.technicalDescription,
      });
      await ensureSubmissionDeadlineOpen();
      const now = nowIso();
      await db
        .update(schema.submissions)
        .set({ status: "Resubmitted for Review", updatedAt: now })
        .where(eq(schema.submissions.id, resubmitRoute.submissionId));
      await db
        .update(schema.mentorAssignments)
        .set({ status: "assigned", completedAt: null, updatedAt: now })
        .where(eq(schema.mentorAssignments.submissionId, resubmitRoute.submissionId));
      await appendSubmissionHistory(resubmitRoute.submissionId, "Resubmitted for Review", profile.id, "Resubmitted after clarification");
      return apiSuccess(await serializeSubmission(await getSubmissionById(resubmitRoute.submissionId)));
    }

    const statusRoute = matchRoute(pathname, /^\/api\/submissions\/(?<submissionId>[^/]+)\/status$/);
    if (statusRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireActiveMembership(profile.id);
      const submission = await requireSubmissionForTeam(statusRoute.submissionId, membership.teamId);
      return apiSuccess({
        submission_id: submission.id,
        current_status: submission.status,
        participant_label: participantLabelForStatus(submission.status as SubmissionStatus),
        timestamps: {
          created_at: submission.createdAt,
          updated_at: submission.updatedAt,
          submitted_at: submission.submittedAt,
          last_returned_at: submission.lastReturnedAt,
          approved_for_judging_at: submission.approvedForJudgingAt,
          released_to_judges_at: submission.releasedToJudgesAt,
        },
        history: await getStatusHistory(statusRoute.submissionId),
        mentor_notes: await getClarificationNotes(statusRoute.submissionId),
        next_allowed_actions: buildSubmissionActions(submission.status as SubmissionStatus, membership.teamRole as "lead" | "member"),
      });
    }

    const clarificationRoute = matchRoute(pathname, /^\/api\/submissions\/(?<submissionId>[^/]+)\/clarification-notes$/);
    if (clarificationRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      await requireParticipant(profile);
      const membership = await requireActiveMembership(profile.id);
      await requireSubmissionForTeam(clarificationRoute.submissionId, membership.teamId);
      return apiSuccess(await getClarificationNotes(clarificationRoute.submissionId));
    }

    if (request.method === "GET" && pathname === "/api/mentor/dashboard") {
      const profile = await requireAuthenticatedProfile(request);
      requireMentor(profile);
      const mentorProfile = await getMentorProfileByUserId(profile.id);
      const assignments = await listMentorAssignments(mentorProfile.id);
      return apiSuccess({
        pending_reviews: assignments.filter((a) => !a.completedAt).length,
        needs_clarification: assignments.filter((a) => a.submissionStatus === "Needs Clarification").length,
        resubmitted: assignments.filter((a) => a.submissionStatus === "Resubmitted for Review").length,
        approved: assignments.filter((a) => a.status === "approved").length,
        total_assigned: assignments.length,
        completed_reviews: assignments.filter((a) => Boolean(a.completedAt)).length,
      });
    }

    if (request.method === "GET" && pathname === "/api/mentor/submissions") {
      const profile = await requireAuthenticatedProfile(request);
      requireMentor(profile);
      const mentorProfile = await getMentorProfileByUserId(profile.id);
      return apiSuccess(await listMentorAssignments(mentorProfile.id));
    }

    const mentorSubmissionRoute = matchRoute(pathname, /^\/api\/mentor\/submissions\/(?<submissionId>[^/]+)$/);
    if (mentorSubmissionRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      requireMentor(profile);
      const mentorProfile = await getMentorProfileByUserId(profile.id);
      return apiSuccess(await serializeMentorSubmissionView(mentorSubmissionRoute.submissionId, mentorProfile.id));
    }

    const mentorApproveRoute = matchRoute(pathname, /^\/api\/mentor\/submissions\/(?<submissionId>[^/]+)\/approve$/);
    if (mentorApproveRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      requireMentor(profile);
      const mentorProfile = await getMentorProfileByUserId(profile.id);
      const assignment = await getMentorAssignmentForSubmission(mentorProfile.id, mentorApproveRoute.submissionId);
      const submission = await getSubmissionById(mentorApproveRoute.submissionId);
      if (!["Submitted for Review", "Resubmitted for Review"].includes(submission.status)) {
        throw new ApiError(409, "INVALID_SUBMISSION_STATUS", "Submission is not ready for mentor approval.");
      }
      const now = nowIso();
      await db
        .update(schema.submissions)
        .set({ status: "Approved for Judging", approvedForJudgingAt: now, updatedAt: now })
        .where(eq(schema.submissions.id, mentorApproveRoute.submissionId));
      await db
        .update(schema.mentorAssignments)
        .set({ status: "approved", completedAt: now, updatedAt: now })
        .where(eq(schema.mentorAssignments.id, assignment.id));
      await appendSubmissionHistory(mentorApproveRoute.submissionId, "Approved for Judging", profile.id, "Approved by mentor");
      return apiSuccess(await serializeSubmission(await getSubmissionById(mentorApproveRoute.submissionId)));
    }

    const mentorClarifyRoute = matchRoute(pathname, /^\/api\/mentor\/submissions\/(?<submissionId>[^/]+)\/return-for-clarification$/);
    if (mentorClarifyRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      requireMentor(profile);
      const mentorProfile = await getMentorProfileByUserId(profile.id);
      const assignment = await getMentorAssignmentForSubmission(mentorProfile.id, mentorClarifyRoute.submissionId);
      const submission = await getSubmissionById(mentorClarifyRoute.submissionId);
      if (!["Submitted for Review", "Resubmitted for Review"].includes(submission.status)) {
        throw new ApiError(409, "INVALID_SUBMISSION_STATUS", "Submission is not ready for clarification.");
      }
      const payload = await parseJson(request, reviewNoteSchema);
      const now = nowIso();
      await db
        .update(schema.submissions)
        .set({ status: "Needs Clarification", lastReturnedAt: now, updatedAt: now })
        .where(eq(schema.submissions.id, mentorClarifyRoute.submissionId));
      await db
        .update(schema.mentorAssignments)
        .set({ status: "returned", completedAt: now, updatedAt: now })
        .where(eq(schema.mentorAssignments.id, assignment.id));
      await db.insert(schema.submissionReviewNotes).values({
        id: createId("review_note"),
        submissionId: mentorClarifyRoute.submissionId,
        mentorId: mentorProfile.id,
        action: "clarification_requested",
        note: payload.note,
        createdAt: now,
      });
      await appendSubmissionHistory(mentorClarifyRoute.submissionId, "Needs Clarification", profile.id, payload.note);
      return apiSuccess(await serializeSubmission(await getSubmissionById(mentorClarifyRoute.submissionId)));
    }

    if (request.method === "GET" && pathname === "/api/mentor/review-history") {
      const profile = await requireAuthenticatedProfile(request);
      requireMentor(profile);
      const mentorProfile = await getMentorProfileByUserId(profile.id);
      const assignments = await listMentorAssignments(mentorProfile.id);
      return apiSuccess(assignments.filter((assignment) => Boolean(assignment.completedAt)));
    }

    if (request.method === "GET" && pathname === "/api/judge/dashboard") {
      const profile = await requireAuthenticatedProfile(request);
      requireJudge(profile);
      const judgeProfile = await getJudgeProfileByUserId(profile.id);
      const assignments = await listJudgeAssignments(judgeProfile.id);
      return apiSuccess({
        assigned_projects: assignments.length,
        pending_reviews: assignments.filter((a) => !a.completedAt).length,
        completed_reviews: assignments.filter((a) => Boolean(a.completedAt)).length,
        judging_deadline: (await getSettings()).judgingDeadline,
      });
    }

    if (request.method === "GET" && pathname === "/api/judge/projects") {
      const profile = await requireAuthenticatedProfile(request);
      requireJudge(profile);
      const judgeProfile = await getJudgeProfileByUserId(profile.id);
      const assignments = await listJudgeAssignments(judgeProfile.id);
      return apiSuccess(assignments.filter((a) => ["Released to Judges", "Judging in Progress", "Judged"].includes(a.submissionStatus)));
    }

    const judgeProjectRoute = matchRoute(pathname, /^\/api\/judge\/projects\/(?<submissionId>[^/]+)$/);
    if (judgeProjectRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      requireJudge(profile);
      const judgeProfile = await getJudgeProfileByUserId(profile.id);
      const assignment = await getJudgeAssignmentForSubmission(judgeProfile.id, judgeProjectRoute.submissionId);
      const submission = await getSubmissionById(judgeProjectRoute.submissionId);
      if (!["Released to Judges", "Judging in Progress", "Judged"].includes(submission.status)) {
        throw new ApiError(403, "SUBMISSION_NOT_VISIBLE", "Judge cannot view this submission yet.");
      }
      return apiSuccess(await serializeJudgeSubmissionView(judgeProjectRoute.submissionId, judgeProfile.id));
    }

    const judgeScoreRoute = matchRoute(pathname, /^\/api\/judge\/projects\/(?<submissionId>[^/]+)\/score$/);
    if (judgeScoreRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      requireJudge(profile);
      const judgeProfile = await getJudgeProfileByUserId(profile.id);
      const assignment = await getJudgeAssignmentForSubmission(judgeProfile.id, judgeScoreRoute.submissionId);
      const submission = await getSubmissionById(judgeScoreRoute.submissionId);
      if (!["Released to Judges", "Judging in Progress"].includes(submission.status)) {
        throw new ApiError(409, "INVALID_SUBMISSION_STATUS", "Submission is not open for judging.");
      }
      const existingScore = await getScoreForAssignment(assignment.id);
      if (existingScore) {
        throw new ApiError(409, "SCORE_ALREADY_SUBMITTED", "This assignment has already been scored.");
      }

      const payload = await parseJson(request, scoreSchema);
      const total = calculateTotalScore(payload);
      const now = nowIso();

      if (submission.status === "Released to Judges") {
        await db
          .update(schema.submissions)
          .set({ status: "Judging in Progress", updatedAt: now })
          .where(eq(schema.submissions.id, judgeScoreRoute.submissionId));
        await appendSubmissionHistory(judgeScoreRoute.submissionId, "Judging in Progress", profile.id, "First judge evaluation started");
      }

      await db.insert(schema.scores).values({
        id: createId("score"),
        assignmentId: assignment.id,
        submissionId: judgeScoreRoute.submissionId,
        judgeId: judgeProfile.id,
        problemRelevance: payload.problemRelevance,
        innovation: payload.innovation,
        executionPrototype: payload.executionPrototype,
        impactScalability: payload.impactScalability,
        presentationClarity: payload.presentationClarity,
        totalScore: total,
        comments: payload.comments,
        submittedAt: now,
        createdAt: now,
        updatedAt: now,
      });

      await db
        .update(schema.judgeAssignments)
        .set({ status: "submitted", completedAt: now, updatedAt: now })
        .where(eq(schema.judgeAssignments.id, assignment.id));

      if (await maybeMarkSubmissionJudged(judgeScoreRoute.submissionId)) {
        await appendSubmissionHistory(judgeScoreRoute.submissionId, "Judged", profile.id, "All judge evaluations completed");
      }

      return apiSuccess(await serializeJudgeSubmissionView(judgeScoreRoute.submissionId, judgeProfile.id));
    }

    if (request.method === "GET" && pathname === "/api/judge/completed") {
      const profile = await requireAuthenticatedProfile(request);
      requireJudge(profile);
      const judgeProfile = await getJudgeProfileByUserId(profile.id);
      const assignments = await listJudgeAssignments(judgeProfile.id);
      return apiSuccess(assignments.filter((assignment) => Boolean(assignment.completedAt)));
    }

    if (request.method === "GET" && pathname === "/api/admin/dashboard") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      return apiSuccess(await buildAdminDashboardMetrics());
    }

    if (request.method === "GET" && pathname === "/api/admin/participants") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      return apiSuccess(await listParticipants());
    }

    const adminParticipantRoute = matchRoute(pathname, /^\/api\/admin\/participants\/(?<participantId>[^/]+)$/);
    if (adminParticipantRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      return apiSuccess(await getParticipantById(adminParticipantRoute.participantId));
    }

    const adminParticipantStatusRoute = matchRoute(pathname, /^\/api\/admin\/participants\/(?<participantId>[^/]+)\/status$/);
    if (adminParticipantStatusRoute && request.method === "PUT") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const payload = await parseJson(request, participantStatusSchema);
      await db
        .update(schema.profiles)
        .set({ status: payload.status, updatedAt: nowIso() })
        .where(and(eq(schema.profiles.id, adminParticipantStatusRoute.participantId), eq(schema.profiles.platformRole, "participant")));
      return apiSuccess(await getParticipantById(adminParticipantStatusRoute.participantId));
    }

    if (request.method === "GET" && pathname === "/api/admin/teams") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      return apiSuccess(await listTeamsWithDetails());
    }

    const adminTeamRoute = matchRoute(pathname, /^\/api\/admin\/teams\/(?<teamId>[^/]+)$/);
    if (adminTeamRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      return apiSuccess(await getTeamDetailsForAdmin(adminTeamRoute.teamId));
    }

    if (request.method === "GET" && pathname === "/api/admin/submissions") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      return apiSuccess(await listSubmissionsForAdmin());
    }

    const adminSubmissionRoute = matchRoute(pathname, /^\/api\/admin\/submissions\/(?<submissionId>[^/]+)$/);
    if (adminSubmissionRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      return apiSuccess(await getSubmissionDetails(adminSubmissionRoute.submissionId));
    }

    const adminReleaseRoute = matchRoute(pathname, /^\/api\/admin\/submissions\/(?<submissionId>[^/]+)\/release-to-judges$/);
    if (adminReleaseRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const submission = await getSubmissionById(adminReleaseRoute.submissionId);
      if (submission.status !== "Approved for Judging") {
        throw new ApiError(409, "INVALID_SUBMISSION_STATUS", "Only approved submissions can be released to judges.");
      }
      const now = nowIso();
      await db
        .update(schema.submissions)
        .set({ status: "Released to Judges", releasedToJudgesAt: now, updatedAt: now })
        .where(eq(schema.submissions.id, adminReleaseRoute.submissionId));
      await appendSubmissionHistory(adminReleaseRoute.submissionId, "Released to Judges", profile.id, "Released by admin");
      return apiSuccess(await serializeSubmission(await getSubmissionById(adminReleaseRoute.submissionId)));
    }

    const adminDisqualifyRoute = matchRoute(pathname, /^\/api\/admin\/submissions\/(?<submissionId>[^/]+)\/disqualify$/);
    if (adminDisqualifyRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      await db
        .update(schema.submissions)
        .set({ status: "Disqualified", updatedAt: nowIso() })
        .where(eq(schema.submissions.id, adminDisqualifyRoute.submissionId));
      await appendSubmissionHistory(adminDisqualifyRoute.submissionId, "Disqualified", profile.id, "Disqualified by admin");
      return apiSuccess(await serializeSubmission(await getSubmissionById(adminDisqualifyRoute.submissionId)));
    }

    const adminWithdrawRoute = matchRoute(pathname, /^\/api\/admin\/submissions\/(?<submissionId>[^/]+)\/withdraw$/);
    if (adminWithdrawRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      await db
        .update(schema.submissions)
        .set({ status: "Withdrawn", updatedAt: nowIso() })
        .where(eq(schema.submissions.id, adminWithdrawRoute.submissionId));
      await appendSubmissionHistory(adminWithdrawRoute.submissionId, "Withdrawn", profile.id, "Withdrawn by admin");
      return apiSuccess(await serializeSubmission(await getSubmissionById(adminWithdrawRoute.submissionId)));
    }

    const adminReopenRoute = matchRoute(pathname, /^\/api\/admin\/submissions\/(?<submissionId>[^/]+)\/reopen$/);
    if (adminReopenRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      await db
        .update(schema.submissions)
        .set({ status: "Draft", updatedAt: nowIso() })
        .where(eq(schema.submissions.id, adminReopenRoute.submissionId));
      await appendSubmissionHistory(adminReopenRoute.submissionId, "Draft", profile.id, "Reopened by admin");
      return apiSuccess(await serializeSubmission(await getSubmissionById(adminReopenRoute.submissionId)));
    }

    if (request.method === "GET" && pathname === "/api/admin/mentors") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const mentors = await listMentorsForAdmin();
      return apiSuccess(mentors.map((mentor) => ({ ...mentor, assignedTracks: parseJsonArray(mentor.assignedTracks) })));
    }

    if (request.method === "POST" && pathname === "/api/admin/mentors/invite") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const mentorProfileId = await createInvitedMentor(await parseJson(request, mentorInviteSchema));
      const mentors = await listMentorsForAdmin();
      return apiSuccess(mentors.find((mentor) => mentor.id === mentorProfileId), { status: 201 });
    }

    const adminMentorRoute = matchRoute(pathname, /^\/api\/admin\/mentors\/(?<mentorId>[^/]+)$/);
    if (adminMentorRoute && request.method === "PUT") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const payload = await parseJson(request, mentorUpdateSchema);
      await db
        .update(schema.mentorProfiles)
        .set({
          ...(payload.organization ? { organization: payload.organization } : {}),
          ...(payload.title ? { title: payload.title } : {}),
          ...((payload.assigned_tracks ?? payload.assignedTracks)
            ? { assignedTracks: JSON.stringify(payload.assigned_tracks ?? payload.assignedTracks ?? []) }
            : {}),
          ...(payload.active !== undefined ? { active: payload.active } : {}),
          updatedAt: nowIso(),
        })
        .where(eq(schema.mentorProfiles.id, adminMentorRoute.mentorId));
      const mentors = await listMentorsForAdmin();
      return apiSuccess(mentors.find((mentor) => mentor.id === adminMentorRoute.mentorId) ?? null);
    }

    if (request.method === "POST" && pathname === "/api/admin/mentor-assignments") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const payload = await parseJson(request, mentorAssignmentSchema);
      const submission = await getSubmissionById(payload.submissionId);
      if (!["Submitted for Review", "Resubmitted for Review", "Needs Clarification"].includes(submission.status)) {
        throw new ApiError(409, "INVALID_SUBMISSION_STATUS", "Submission is not eligible for mentor assignment.");
      }
      const [existing] = await db
        .select({ id: schema.mentorAssignments.id })
        .from(schema.mentorAssignments)
        .where(and(eq(schema.mentorAssignments.mentorId, payload.mentorId), eq(schema.mentorAssignments.submissionId, payload.submissionId)))
        .limit(1);
      if (existing) {
        throw new ApiError(409, "ASSIGNMENT_EXISTS", "Mentor assignment already exists.");
      }
      const now = nowIso();
      await db.insert(schema.mentorAssignments).values({
        id: createId("mentor_assignment"),
        mentorId: payload.mentorId,
        submissionId: payload.submissionId,
        status: "assigned",
        assignedAt: now,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      });
      return apiSuccess({ mentor_id: payload.mentorId, submission_id: payload.submissionId, status: "assigned" }, { status: 201 });
    }

    if (request.method === "GET" && pathname === "/api/admin/judges") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const judges = await listJudgesForAdmin();
      return apiSuccess(judges.map((judge) => ({ ...judge, assignedTracks: parseJsonArray(judge.assignedTracks) })));
    }

    if (request.method === "POST" && pathname === "/api/admin/judges/invite") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const judgeProfileId = await createInvitedJudge(await parseJson(request, judgeInviteSchema));
      const judges = await listJudgesForAdmin();
      return apiSuccess(judges.find((judge) => judge.id === judgeProfileId), { status: 201 });
    }

    const adminJudgeRoute = matchRoute(pathname, /^\/api\/admin\/judges\/(?<judgeId>[^/]+)$/);
    if (adminJudgeRoute && request.method === "PUT") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const payload = await parseJson(request, judgeUpdateSchema);
      await db
        .update(schema.judgeProfiles)
        .set({
          ...(payload.organization ? { organization: payload.organization } : {}),
          ...(payload.title ? { title: payload.title } : {}),
          ...(payload.bio ? { bio: payload.bio } : {}),
          ...((payload.assigned_tracks ?? payload.assignedTracks)
            ? { assignedTracks: JSON.stringify(payload.assigned_tracks ?? payload.assignedTracks ?? []) }
            : {}),
          ...(payload.active !== undefined ? { active: payload.active } : {}),
          updatedAt: nowIso(),
        })
        .where(eq(schema.judgeProfiles.id, adminJudgeRoute.judgeId));
      const judges = await listJudgesForAdmin();
      return apiSuccess(judges.find((judge) => judge.id === adminJudgeRoute.judgeId) ?? null);
    }

    if (request.method === "POST" && pathname === "/api/admin/judge-assignments") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const payload = await parseJson(request, judgeAssignmentSchema);
      const submission = await getSubmissionById(payload.submissionId);
      if (!["Approved for Judging", "Released to Judges"].includes(submission.status)) {
        throw new ApiError(409, "INVALID_SUBMISSION_STATUS", "Submission is not eligible for judge assignment.");
      }
      const [existing] = await db
        .select({ id: schema.judgeAssignments.id })
        .from(schema.judgeAssignments)
        .where(and(eq(schema.judgeAssignments.judgeId, payload.judgeId), eq(schema.judgeAssignments.submissionId, payload.submissionId)))
        .limit(1);
      if (existing) {
        throw new ApiError(409, "ASSIGNMENT_EXISTS", "Judge assignment already exists.");
      }
      const now = nowIso();
      await db.insert(schema.judgeAssignments).values({
        id: createId("judge_assignment"),
        judgeId: payload.judgeId,
        submissionId: payload.submissionId,
        status: "assigned",
        assignedAt: now,
        completedAt: null,
        createdAt: now,
        updatedAt: now,
      });
      return apiSuccess({ judge_id: payload.judgeId, submission_id: payload.submissionId, status: "assigned" }, { status: 201 });
    }

    if (request.method === "GET" && pathname === "/api/admin/scores") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const submissions = await listSubmissionsForAdmin();
      const rows = await Promise.all(
        submissions.map(async (submission) => {
          const scores = await getSubmissionScores(submission.id);
          return {
            ...submission,
            score_count: scores.length,
            average_score: scores.length > 0 ? Math.round((scores.reduce((acc, row) => acc + Number(row.totalScore), 0) / scores.length) * 100) / 100 : null,
          };
        }),
      );
      return apiSuccess(rows);
    }

    const adminSubmissionScoresRoute = matchRoute(pathname, /^\/api\/admin\/submissions\/(?<submissionId>[^/]+)\/scores$/);
    if (adminSubmissionScoresRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      return apiSuccess(await getSubmissionScores(adminSubmissionScoresRoute.submissionId));
    }

    if (request.method === "GET" && pathname === "/api/admin/shortlist") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const rows = await listSubmissionsForAdmin();
      return apiSuccess(rows.filter((row) => row.status === "Shortlisted" || row.status === "Winner"));
    }

    const adminShortlistRoute = matchRoute(pathname, /^\/api\/admin\/submissions\/(?<submissionId>[^/]+)\/shortlist$/);
    if (adminShortlistRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const submission = await getSubmissionById(adminShortlistRoute.submissionId);
      if (submission.status !== "Judged") {
        throw new ApiError(409, "INVALID_SUBMISSION_STATUS", "Only judged submissions can be shortlisted.");
      }
      await db
        .update(schema.submissions)
        .set({ status: "Shortlisted", updatedAt: nowIso() })
        .where(eq(schema.submissions.id, adminShortlistRoute.submissionId));
      await appendSubmissionHistory(adminShortlistRoute.submissionId, "Shortlisted", profile.id, "Shortlisted by admin");
      return apiSuccess(await serializeSubmission(await getSubmissionById(adminShortlistRoute.submissionId)));
    }

    if (adminShortlistRoute && request.method === "DELETE") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      await db
        .update(schema.submissions)
        .set({ status: "Judged", updatedAt: nowIso() })
        .where(eq(schema.submissions.id, adminShortlistRoute.submissionId));
      await appendSubmissionHistory(adminShortlistRoute.submissionId, "Judged", profile.id, "Removed from shortlist");
      return apiSuccess(await serializeSubmission(await getSubmissionById(adminShortlistRoute.submissionId)));
    }

    if (request.method === "GET" && pathname === "/api/admin/winners") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const rows = await listSubmissionsForAdmin();
      return apiSuccess(rows.filter((row) => row.status === "Winner"));
    }

    const adminWinnerRoute = matchRoute(pathname, /^\/api\/admin\/submissions\/(?<submissionId>[^/]+)\/winner$/);
    if (adminWinnerRoute && request.method === "POST") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      const submission = await getSubmissionById(adminWinnerRoute.submissionId);
      if (!["Shortlisted", "Judged"].includes(submission.status)) {
        throw new ApiError(409, "INVALID_SUBMISSION_STATUS", "Winner can only be selected from judged or shortlisted submissions.");
      }
      await db
        .update(schema.submissions)
        .set({ status: "Winner", updatedAt: nowIso() })
        .where(eq(schema.submissions.id, adminWinnerRoute.submissionId));
      await appendSubmissionHistory(adminWinnerRoute.submissionId, "Winner", profile.id, "Winner selected by admin");
      return apiSuccess(await serializeSubmission(await getSubmissionById(adminWinnerRoute.submissionId)));
    }

    if (adminWinnerRoute && request.method === "DELETE") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);
      await db
        .update(schema.submissions)
        .set({ status: "Shortlisted", updatedAt: nowIso() })
        .where(eq(schema.submissions.id, adminWinnerRoute.submissionId));
      await appendSubmissionHistory(adminWinnerRoute.submissionId, "Shortlisted", profile.id, "Winner designation removed");
      return apiSuccess(await serializeSubmission(await getSubmissionById(adminWinnerRoute.submissionId)));
    }

    const exportRoute = matchRoute(pathname, /^\/api\/admin\/exports\/(?<file>[^/]+)$/);
    if (exportRoute && request.method === "GET") {
      const profile = await requireAuthenticatedProfile(request);
      requireAdmin(profile);

      if (exportRoute.file === "participants.csv") {
        const rows = await listParticipants();
        return createCsvResponse(
          "participants.csv",
          ["id", "full_name", "email", "phone", "status", "created_at", "last_login_at"],
          rows.map((row) => [row.id, row.fullName, row.email, row.phone, row.status, row.createdAt, row.lastLoginAt]),
        );
      }

      if (exportRoute.file === "teams.csv") {
        const rows = await listTeamsWithDetails();
        return createCsvResponse(
          "teams.csv",
          ["id", "name", "lead_name", "track_name", "status", "active_members_count", "created_at"],
          rows.map((row) => [row.id, row.name, row.leadName, row.trackName, row.status, row.active_members_count, row.createdAt]),
        );
      }

      if (exportRoute.file === "submissions.csv") {
        const rows = await listSubmissionsForAdmin();
        return createCsvResponse(
          "submissions.csv",
          ["id", "submission_code", "title", "team_name", "track_name", "status", "updated_at"],
          rows.map((row) => [row.id, row.submissionCode, row.title, row.teamName, row.trackName, row.status, row.updatedAt]),
        );
      }

      if (exportRoute.file === "scores.csv") {
        const submissions = await listSubmissionsForAdmin();
        const scores = (await Promise.all(submissions.map((row) => getSubmissionScores(row.id)))).flat();
        return createCsvResponse(
          "scores.csv",
          ["id", "submission_id", "judge_name", "total_score", "problem_relevance", "innovation", "execution_prototype", "impact_scalability", "presentation_clarity", "submitted_at"],
          scores.map((row) => [row.id, row.submissionId, row.judgeName, row.totalScore, row.problemRelevance, row.innovation, row.executionPrototype, row.impactScalability, row.presentationClarity, row.submittedAt]),
        );
      }

      if (exportRoute.file === "winners.csv") {
        const rows = await listSubmissionsForAdmin();
        return createCsvResponse(
          "winners.csv",
          ["id", "submission_code", "title", "team_name", "track_name", "status"],
          rows.filter((row) => row.status === "Winner").map((row) => [row.id, row.submissionCode, row.title, row.teamName, row.trackName, row.status]),
        );
      }

      throw new ApiError(404, "EXPORT_NOT_FOUND", "Export endpoint was not found.");
    }

    throw new ApiError(404, "NOT_FOUND", "API route not found.");
  } catch (error) {
    return apiErrorResponse(error);
  }
}
