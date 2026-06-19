import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Users, FileCheck2, AlertTriangle, ScrollText, Gavel } from "lucide-react";
import { PublicPage } from "@/components/shared/public-page";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/rules")({
  head: () => ({ meta: [
    { title: "Rules — KAFD Hackathon" },
    { name: "description", content: "Official rules, eligibility and code of conduct for the KAFD Hackathon." },
    { property: "og:title", content: "Rules — KAFD Hackathon" },
    { property: "og:description", content: "Eligibility, IP, conduct and submission rules." },
  ]}),
  component: RulesPage,
});

const SECTIONS = [
  { icon: Users, title: "Eligibility", body: "Teams of 2–5 members aged 18+. Team leads must complete registration and invite members through the platform." },
  { icon: FileCheck2, title: "Submissions", body: "Submissions must include all required fields and links. Late submissions are not accepted under any circumstances." },
  { icon: ShieldCheck, title: "Intellectual Property", body: "Participants retain IP. KAFD receives a non-exclusive license for promotional use of submission materials." },
  { icon: AlertTriangle, title: "Code of Conduct", body: "Respectful conduct is required at all times. Harassment, plagiarism and breach of confidentiality result in disqualification." },
  { icon: ScrollText, title: "Originality", body: "Projects must be substantially built during the hackathon window. Pre-existing IP must be disclosed at submission." },
  { icon: Gavel, title: "Judging Authority", body: "Final scoring, shortlist and winner decisions are made by KAFD-appointed judges. Decisions are final." },
];

function RulesPage() {
  return (
    <PublicPage eyebrow="Compliance" title="Rules and eligibility" description="Please review the official rules before registering your team.">
      <div className="grid gap-6 md:grid-cols-2">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="p-6">
            <div className="grid size-10 place-items-center rounded-lg bg-primary/8 text-primary">
              <s.icon className="size-5" />
            </div>
            <h3 className="mt-4 font-display text-lg font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.body}</p>
          </Card>
        ))}
      </div>
    </PublicPage>
  );
}
