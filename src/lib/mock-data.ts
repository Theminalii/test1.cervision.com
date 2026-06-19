// Centralized mock data for the KAFD Hackathon MVP platform.
// Structured to mirror a likely backend shape so swap-in is easy.

export type Role =
  | "visitor"
  | "participant"
  | "team_lead"
  | "team_member"
  | "mentor"
  | "judge"
  | "admin";

export const ROLES: { id: Role; label: string; home: string }[] = [
  { id: "visitor", label: "Public Visitor", home: "/" },
  { id: "participant", label: "Participant", home: "/app/onboarding" },
  { id: "team_lead", label: "Team Lead", home: "/app/dashboard" },
  { id: "team_member", label: "Team Member", home: "/member/dashboard" },
  { id: "mentor", label: "Mentor", home: "/mentor/dashboard" },
  { id: "judge", label: "Judge", home: "/judge/dashboard" },
  { id: "admin", label: "Admin", home: "/admin/dashboard" },
];

export type SubmissionStatus =
  | "Draft"
  | "Submitted for Review"
  | "Needs Clarification"
  | "Resubmitted for Review"
  | "Approved for Judging"
  | "Released to Judges"
  | "Judging in Progress"
  | "Judged"
  | "Shortlisted"
  | "Winner"
  | "Disqualified"
  | "Withdrawn";

export const STATUS_TONE: Record<SubmissionStatus, "neutral" | "info" | "warning" | "success" | "gold" | "destructive"> = {
  Draft: "neutral",
  "Submitted for Review": "info",
  "Needs Clarification": "warning",
  "Resubmitted for Review": "info",
  "Approved for Judging": "success",
  "Released to Judges": "info",
  "Judging in Progress": "info",
  Judged: "success",
  Shortlisted: "gold",
  Winner: "gold",
  Disqualified: "destructive",
  Withdrawn: "neutral",
};

export const PARTICIPANT_LABEL: Partial<Record<SubmissionStatus, string>> = {
  "Submitted for Review": "Under Mentor Review",
  "Needs Clarification": "Clarification Needed",
  "Released to Judges": "With Judges",
  Judged: "Judging Complete",
};

export const TRACKS = [
  { id: "smart-city", name: "Smart City", desc: "Urban innovation, mobility and infrastructure intelligence for KAFD and Riyadh.", eligibility: "Open", color: "from-emerald-700 to-emerald-500" },
  { id: "fintech", name: "FinTech", desc: "Capital markets, embedded finance, wealth and payments innovation.", eligibility: "Open", color: "from-amber-600 to-amber-400" },
  { id: "sustainability", name: "Sustainability", desc: "Net-zero, ESG analytics, energy efficiency and circular economy.", eligibility: "Open", color: "from-teal-700 to-emerald-500" },
  { id: "ai-automation", name: "AI & Automation", desc: "Applied AI, agents and intelligent automation for enterprise workflows.", eligibility: "Open", color: "from-slate-700 to-emerald-700" },
  { id: "digital-experience", name: "Digital Experience", desc: "Next-generation customer, tenant and visitor digital experiences.", eligibility: "Open", color: "from-emerald-800 to-amber-500" },
];

export const TIMELINE = [
  { id: 1, label: "Registration Opens", date: "Sep 15, 2026", status: "done" },
  { id: 2, label: "Registration Deadline", date: "Oct 20, 2026", status: "active" },
  { id: 3, label: "Hackathon Kick-off", date: "Oct 25, 2026", status: "upcoming" },
  { id: 4, label: "Submission Deadline", date: "Oct 28, 2026", status: "upcoming" },
  { id: 5, label: "Mentor Review Period", date: "Oct 29 – Nov 1, 2026", status: "upcoming" },
  { id: 6, label: "Judging Period", date: "Nov 2 – Nov 5, 2026", status: "upcoming" },
  { id: 7, label: "Winner Announcement", date: "Nov 8, 2026", status: "upcoming" },
];

export const PRIZES = [
  { rank: "1st Place", amount: "SAR 250,000", perks: ["KAFD residency program", "Investor introductions", "Mentorship cohort"] },
  { rank: "2nd Place", amount: "SAR 150,000", perks: ["KAFD residency program", "Mentorship cohort"] },
  { rank: "3rd Place", amount: "SAR 75,000", perks: ["Mentorship cohort"] },
  { rank: "Track Winner", amount: "SAR 40,000", perks: ["Per-track recognition", "Industry showcase"] },
];

export const FAQS = [
  { q: "Who can participate in the KAFD Hackathon?", a: "Innovators, developers, designers and founders aged 18+ residing in Saudi Arabia or invited internationally through partner programs." },
  { q: "What is the team size?", a: "Teams may include between 2 and 5 members. A team lead must register first and invite other members." },
  { q: "Is participation free?", a: "Yes. Participation is fully sponsored under the KAFD innovation program." },
  { q: "Will I retain IP for my submission?", a: "Yes. Participants retain intellectual property rights for their submissions. Limited rights are granted for promotional use." },
  { q: "How are submissions evaluated?", a: "Mentors first validate submissions for completeness, then judges score on five weighted criteria." },
];

// Operational metrics for admin dashboard
export const METRICS = {
  totalParticipants: 120,
  activatedParticipants: 104,
  teamsCreated: 34,
  draftSubmissions: 6,
  submittedForReview: 8,
  needsClarification: 3,
  resubmittedForReview: 2,
  approvedForJudging: 5,
  releasedToJudges: 4,
  judgingInProgress: 3,
  judged: 9,
  shortlisted: 5,
  winnersSelected: 3,
  pendingMentorReviews: 11,
  completedJudgeReviews: 27,
  judgingCompletionPct: 64,
};

// Synthetic lists
export const PARTICIPANTS = Array.from({ length: 120 }).map((_, i) => ({
  id: `P-${1000 + i}`,
  name: ["Sara Al-Otaibi", "Mohammed Al-Qahtani", "Fatima Al-Harbi", "Khalid Al-Saud", "Noura Al-Mutairi", "Yousef Al-Dosari", "Lina Al-Ghamdi", "Abdulrahman Al-Zahrani"][i % 8] + ` ${i + 1}`,
  email: `participant${i + 1}@kafd-hack.sa`,
  team: i % 4 === 0 ? null : `Team ${Math.floor(i / 4) + 1}`,
  status: ["Activated", "Activated", "Pending", "Activated"][i % 4] as "Activated" | "Pending",
}));

export const TEAMS = Array.from({ length: 34 }).map((_, i) => ({
  id: `T-${200 + i}`,
  name: [
    "Atlas Capital", "Riyadh Pulse", "Greenline", "Quantum Vault", "Nimbus AI",
    "Cedar Labs", "OpenLedger", "Tarteeb", "Mostaqbal", "Arc Reactor",
    "Saffron Pay", "Falcon Mesh", "Najm AI", "Khareef", "Tamayyaz",
    "Nawat", "Beacon ESG", "Edge Souq", "Mawared", "BluePrint",
    "Athar", "Wajha", "Roya", "Mojaz", "Tilal",
    "Mithaq", "Rawya", "Sahab", "Salfa", "Khutwa",
    "Inara", "Mansa", "Bayan", "Mukhtaser",
  ][i] || `Team ${i + 1}`,
  lead: ["Sara Al-Otaibi", "Mohammed Al-Qahtani", "Fatima Al-Harbi", "Khalid Al-Saud"][i % 4],
  track: TRACKS[i % TRACKS.length].name,
  members: 2 + (i % 4),
  status: (["Draft", "Submitted for Review", "Approved for Judging", "Judging in Progress", "Judged", "Shortlisted", "Winner", "Needs Clarification"] as SubmissionStatus[])[i % 8],
}));

export const SUBMISSIONS = Array.from({ length: 28 }).map((_, i) => ({
  id: `S-${300 + i}`,
  title: [
    "AtlasOne — Unified Capital Markets API",
    "RiyadhPulse — Real-time Mobility Twin",
    "Greenline — ESG Disclosure Copilot",
    "Quantum Vault — Post-quantum Custody",
    "Nimbus — Agentic Compliance",
    "Cedar — Open Banking Hub",
    "OpenLedger — Tokenized Sukuk Rails",
    "Tarteeb — Smart Permit Workflows",
    "Mostaqbal — Future-of-Work Studio",
    "Arc Reactor — District Energy Optimizer",
  ][i % 10] + (i >= 10 ? ` v${Math.floor(i / 10) + 1}` : ""),
  team: TEAMS[i % TEAMS.length].name,
  track: TRACKS[i % TRACKS.length].name,
  status: (["Submitted for Review", "Needs Clarification", "Resubmitted for Review", "Approved for Judging", "Released to Judges", "Judging in Progress", "Judged", "Shortlisted", "Winner"] as SubmissionStatus[])[i % 9],
  mentor: ["Dr. Hassan Al-Otaibi", "Eng. Mona Al-Faisal", "Dr. Tariq Al-Sayed", "Lina Al-Marri"][i % 4],
  updatedAt: `Oct ${10 + (i % 18)}, 2026`,
}));

export const MENTORS = [
  { id: "M-1", name: "Dr. Hassan Al-Otaibi", expertise: "FinTech, Capital Markets", assigned: 6, completed: 4, active: true },
  { id: "M-2", name: "Eng. Mona Al-Faisal", expertise: "Smart City, IoT", assigned: 5, completed: 5, active: true },
  { id: "M-3", name: "Dr. Tariq Al-Sayed", expertise: "AI, Applied ML", assigned: 7, completed: 3, active: true },
  { id: "M-4", name: "Lina Al-Marri", expertise: "Sustainability, ESG", assigned: 4, completed: 4, active: true },
  { id: "M-5", name: "Omar Al-Bishri", expertise: "Product, UX", assigned: 3, completed: 2, active: true },
  { id: "M-6", name: "Reem Al-Khalifa", expertise: "Digital Experience", assigned: 3, completed: 2, active: true },
  { id: "M-7", name: "Faisal Al-Rashed", expertise: "Cybersecurity", assigned: 2, completed: 1, active: false },
  { id: "M-8", name: "Hala Al-Dakheel", expertise: "Open Banking", assigned: 2, completed: 1, active: true },
];

export const JUDGES = [
  { id: "J-1", name: "H.E. Ibrahim Al-Saadoun", org: "KAFD Authority", assigned: 5, completed: 4, active: true },
  { id: "J-2", name: "Sarah Al-Mansoori", org: "Saudi Tadawul Group", assigned: 5, completed: 5, active: true },
  { id: "J-3", name: "Khalid Al-Mutlaq", org: "MCIT", assigned: 4, completed: 2, active: true },
  { id: "J-4", name: "Nora Al-Hamdan", org: "PIF Innovation", assigned: 4, completed: 3, active: true },
  { id: "J-5", name: "Bandar Al-Rajhi", org: "STC Pay", assigned: 4, completed: 4, active: true },
  { id: "J-6", name: "Maya Al-Sharif", org: "NEOM Tech", assigned: 3, completed: 2, active: true },
  { id: "J-7", name: "Anas Al-Hashemi", org: "Aramco Ventures", assigned: 3, completed: 1, active: true },
  { id: "J-8", name: "Reema Al-Saud", org: "Monsha'at", assigned: 3, completed: 3, active: true },
  { id: "J-9", name: "Talal Al-Sharhan", org: "Saudi National Bank", assigned: 2, completed: 2, active: true },
  { id: "J-10", name: "Hessah Al-Otaibi", org: "stc Group", assigned: 2, completed: 1, active: false },
];

export const ANNOUNCEMENTS = [
  { id: 1, title: "Mentor office hours start Oct 25", date: "Oct 18, 2026", body: "Sign up for 30-minute mentor slots in your team portal." },
  { id: 2, title: "Submission template v2 released", date: "Oct 14, 2026", body: "Updated submission template now available with refined structure." },
  { id: 3, title: "Kick-off venue confirmed", date: "Oct 10, 2026", body: "Hackathon kick-off will be held at the KAFD Conference Center." },
];

export const RUBRIC = [
  { id: "problem", label: "Problem Relevance", weight: 20 },
  { id: "innovation", label: "Innovation", weight: 20 },
  { id: "execution", label: "Execution / Prototype", weight: 25 },
  { id: "impact", label: "Impact / Scalability", weight: 20 },
  { id: "presentation", label: "Presentation Clarity", weight: 15 },
];

export const SAMPLE_SUBMISSION = {
  title: "AtlasOne — Unified Capital Markets API",
  summary: "A single API surface that unifies fragmented capital-markets data and execution across regional exchanges.",
  track: "FinTech",
  problem:
    "Capital-markets data and execution endpoints across Saudi and GCC venues are fragmented, increasing integration cost and latency for issuers and asset managers.",
  solution:
    "AtlasOne abstracts ten core APIs (quotes, orders, custody, corporate actions, KYC, settlement, ESG, sukuk, derivatives, analytics) into one OpenAPI surface with a normalized schema and developer console.",
  impact:
    "Reduces integration time from ~16 weeks to under 2 weeks, lowers operational cost by ~40%, and unlocks new entrants into the Saudi capital-markets stack.",
  technical:
    "TypeScript edge runtime, event-sourced state, ISO-20022 mapping layer, post-quantum signing, FIX 5.0 gateway adapter, deployed across three AZs.",
  demoUrl: "https://demo.atlasone.sa",
  deckUrl: "https://decks.atlasone.sa/kafd",
  githubUrl: "https://github.com/atlasone/core",
  videoUrl: "https://video.atlasone.sa/walkthrough",
};
