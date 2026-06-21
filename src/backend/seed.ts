import { eq } from "drizzle-orm";
import { hashPassword } from "./auth";
import { db, schema } from "./db";
import { createId, nowIso } from "./utils";

type SeedProfile = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  platformRole: "admin" | "participant" | "mentor" | "judge";
  status: "active" | "invited";
};

const TRACK_SEEDS = [
  {
    id: "track_smart_city",
    name: "Smart City",
    description: "Urban innovation, mobility and infrastructure intelligence.",
    challengeStatement: "Design future-ready systems for district operations and visitor experiences.",
  },
  {
    id: "track_fintech",
    name: "FinTech",
    description: "Capital markets, embedded finance and wealth innovation.",
    challengeStatement: "Build modern finance primitives aligned with KAFD's ecosystem.",
  },
  {
    id: "track_sustainability",
    name: "Sustainability",
    description: "Net-zero, ESG analytics and circular economy solutions.",
    challengeStatement: "Accelerate measurable sustainability outcomes for the built environment.",
  },
  {
    id: "track_ai_automation",
    name: "AI & Automation",
    description: "Applied AI and intelligent workflow automation.",
    challengeStatement: "Ship agentic tools that augment decision making and operations.",
  },
  {
    id: "track_digital_experience",
    name: "Digital Experience",
    description: "Next-generation customer, tenant and visitor journeys.",
    challengeStatement: "Reimagine digital touchpoints across the KAFD experience layer.",
  },
];

const PROFILE_SEEDS: SeedProfile[] = [
  {
    id: "usr_admin_01",
    email: "admin@kafd.sa",
    password: "Admin123!",
    fullName: "Alya Al-Harbi",
    phone: "+966500000001",
    platformRole: "admin",
    status: "active",
  },
  {
    id: "usr_participant_lead_01",
    email: "lead@kafd.sa",
    password: "Lead123!",
    fullName: "Sara Al-Otaibi",
    phone: "+966500000002",
    platformRole: "participant",
    status: "active",
  },
  {
    id: "usr_participant_member_01",
    email: "member@kafd.sa",
    password: "Member123!",
    fullName: "Mohammed Al-Qahtani",
    phone: "+966500000003",
    platformRole: "participant",
    status: "active",
  },
  {
    id: "usr_participant_new_01",
    email: "participant@kafd.sa",
    password: "Participant123!",
    fullName: "Noura Al-Mutairi",
    phone: "+966500000004",
    platformRole: "participant",
    status: "active",
  },
  {
    id: "usr_mentor_01",
    email: "mentor@kafd.sa",
    password: "Mentor123!",
    fullName: "Dr. Mona Al-Faisal",
    phone: "+966500000005",
    platformRole: "mentor",
    status: "invited",
  },
  {
    id: "usr_judge_01",
    email: "judge@kafd.sa",
    password: "Judge123!",
    fullName: "Khalid Al-Saud",
    phone: "+966500000006",
    platformRole: "judge",
    status: "invited",
  },
];

export async function seedDatabase() {
  const [existingProfile] = await db.select({ id: schema.profiles.id }).from(schema.profiles).limit(1);
  if (existingProfile) return;

  const now = nowIso();

  for (const track of TRACK_SEEDS) {
    await db.insert(schema.tracks).values({
      ...track,
      active: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  for (const profile of PROFILE_SEEDS) {
    await db.insert(schema.profiles).values({
      id: profile.id,
      email: profile.email,
      passwordHash: await hashPassword(profile.password),
      fullName: profile.fullName,
      phone: profile.phone,
      platformRole: profile.platformRole,
      status: profile.status,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
    });
  }

  await db.insert(schema.adminProfiles).values({
    id: createId("adm"),
    userId: "usr_admin_01",
    department: "Platform Operations",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.mentorProfiles).values({
    id: "mentor_profile_01",
    userId: "usr_mentor_01",
    organization: "KAFD Innovation Office",
    title: "Lead Mentor",
    assignedTracks: JSON.stringify(["track_fintech", "track_ai_automation"]),
    active: true,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.judgeProfiles).values({
    id: "judge_profile_01",
    userId: "usr_judge_01",
    organization: "KAFD Authority",
    title: "Innovation Jury",
    bio: "Executive judge for digital transformation and venture readiness.",
    assignedTracks: JSON.stringify(["track_smart_city", "track_fintech"]),
    active: true,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.teams).values({
    id: "team_01",
    name: "Atlas Capital",
    leadUserId: "usr_participant_lead_01",
    trackId: "track_fintech",
    status: "active",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.teamMemberships).values([
    {
      id: createId("tm"),
      teamId: "team_01",
      userId: "usr_participant_lead_01",
      teamRole: "lead",
      status: "active",
      joinedAt: now,
      createdAt: now,
    },
    {
      id: createId("tm"),
      teamId: "team_01",
      userId: "usr_participant_member_01",
      teamRole: "member",
      status: "active",
      joinedAt: now,
      createdAt: now,
    },
  ]);

  await db.insert(schema.teamInvites).values({
    id: createId("invite"),
    teamId: "team_01",
    email: "invitee@kafd.sa",
    token: "seed-invite-token",
    invitedBy: "usr_participant_lead_01",
    status: "pending",
    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5).toISOString(),
    createdAt: now,
  });

  await db.insert(schema.submissions).values({
    id: "submission_01",
    submissionCode: "KAFD-2026-001",
    teamId: "team_01",
    trackId: "track_fintech",
    title: "AtlasOne - Unified Capital Markets API",
    shortSummary: "A single API surface for regional capital-market integration.",
    problem: "Fragmented market connectivity increases integration cost and time to launch.",
    solution: "A normalized API layer across data, execution and settlement workflows.",
    impact: "Faster market access and lower operating cost for ecosystem participants.",
    technicalDescription: "TypeScript services, secure adapters and observability-driven pipelines.",
    demoUrl: "https://demo.atlasone.sa",
    deckUrl: "https://decks.atlasone.sa/kafd",
    githubUrl: "https://github.com/atlasone/core",
    videoUrl: "https://video.atlasone.sa/walkthrough",
    status: "Submitted for Review",
    submittedAt: now,
    lastReturnedAt: null,
    approvedForJudgingAt: null,
    releasedToJudgesAt: null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.submissionStatusHistory).values([
    {
      id: createId("submission_status"),
      submissionId: "submission_01",
      status: "Draft",
      actorUserId: "usr_participant_lead_01",
      note: "Draft created",
      createdAt: now,
    },
    {
      id: createId("submission_status"),
      submissionId: "submission_01",
      status: "Submitted for Review",
      actorUserId: "usr_participant_lead_01",
      note: "Submitted by team lead",
      createdAt: now,
    },
  ]);

  await db.insert(schema.mentorAssignments).values({
    id: createId("mentor_assignment"),
    mentorId: "mentor_profile_01",
    submissionId: "submission_01",
    status: "assigned",
    assignedAt: now,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.submissionReviewNotes).values({
    id: createId("review_note"),
    submissionId: "submission_01",
    mentorId: "mentor_profile_01",
    action: "clarification_requested",
    note: "Please expand the FIX 5.0 adapter details and clarify regional scaling assumptions.",
    createdAt: now,
  });

  await db.insert(schema.judgeAssignments).values({
    id: "judge_assignment_01",
    judgeId: "judge_profile_01",
    submissionId: "submission_01",
    status: "assigned",
    assignedAt: now,
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.adminSettings).values({
    id: "settings_primary",
    registrationDeadline: "2026-10-20T23:59:59.000Z",
    submissionDeadline: "2026-10-28T23:59:59.000Z",
    mentorReviewDeadline: "2026-11-01T23:59:59.000Z",
    judgingDeadline: "2026-11-05T23:59:59.000Z",
    maxTeamSize: 5,
    allowSubmissionEdits: true,
    platformStatus: "registration_open",
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(schema.emailLogs).values({
    id: createId("email"),
    recipientEmail: "invitee@kafd.sa",
    emailType: "team_invite",
    relatedUserId: "usr_participant_lead_01",
    relatedSubmissionId: null,
    status: "queued",
    sentAt: null,
    createdAt: now,
  });
}

export async function touchLastLogin(userId: string) {
  await db
    .update(schema.profiles)
    .set({ lastLoginAt: nowIso(), updatedAt: nowIso() })
    .where(eq(schema.profiles.id, userId));
}
