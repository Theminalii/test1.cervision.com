import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Calendar, Trophy, Layers, ShieldCheck, ChevronRight } from "lucide-react";
import { PublicNav } from "@/components/shared/public-nav";
import { PublicFooter } from "@/components/shared/public-footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Timeline } from "@/components/shared/timeline";
import { TRACKS, TIMELINE, PRIZES, FAQS } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "KAFD Hackathon — Innovation Platform" },
      { name: "description", content: "Official platform for the KAFD Hackathon: register, build, mentor and judge the future of finance and smart cities." },
      { property: "og:title", content: "KAFD Hackathon — Innovation Platform" },
      { property: "og:description", content: "Build the future of finance, smart cities and sustainability with KAFD." },
    ],
  }),
  component: Home,
});

function Home() {
  return (
    <div className="min-h-screen bg-background">
      <PublicNav />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 -z-10 kafd-gradient opacity-[0.04]" />
        <div className="absolute -right-32 -top-32 -z-10 size-[520px] rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-40 bottom-0 -z-10 size-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="container-page grid gap-12 py-20 lg:grid-cols-[1.15fr_1fr] lg:py-28">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold-foreground">
              <Sparkles className="size-3.5" /> Edition 2026 · Registration Open
            </div>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              Building the future of <span className="text-primary">finance</span>, <span className="text-primary">smart cities</span> and <span className="bg-gradient-to-r from-amber-600 to-amber-400 bg-clip-text text-transparent">sustainability</span> from KAFD.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
              The official innovation platform for the King Abdullah Financial District Hackathon. Convene builders,
              mentors and judges around the Kingdom's most ambitious challenges.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" variant="kafd">
                <Link to="/register">Register your team <ArrowRight className="size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/tracks">Explore tracks</Link>
              </Button>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border pt-6 text-sm">
              <Stat label="Participants" value="120+" />
              <Stat label="Teams" value="34" />
              <Stat label="Prize Pool" value="SAR 750K" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <Card className="overflow-hidden border-border/80 p-0 shadow-xl shadow-primary/5">
              <div className="kafd-gradient flex items-center justify-between gap-3 px-5 py-4 text-primary-foreground">
                <div>
                  <div className="text-[10px] uppercase tracking-widest opacity-80">Hackathon Status</div>
                  <div className="font-display text-base font-semibold">Registration Window Open</div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-xs font-semibold text-primary">
                  <span className="size-1.5 animate-pulse rounded-full bg-primary" /> Live
                </span>
              </div>
              <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
                <Counter label="Days to kickoff" value="36" />
                <Counter label="Days to submit" value="39" />
              </div>
              <div className="p-5">
                <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Upcoming Milestones</div>
                <div className="mt-4">
                  <Timeline items={TIMELINE.slice(0, 4).map(t => ({ label: t.label, date: t.date, status: t.status as "done" | "active" | "upcoming" }))} />
                </div>
                <Button asChild variant="ghost" size="sm" className="mt-4 w-full justify-between">
                  <Link to="/timeline">View full timeline <ChevronRight className="size-4" /></Link>
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Tracks preview */}
      <section className="container-page py-20">
        <SectionHeader
          eyebrow="Challenge Tracks"
          title="Five tracks. One mission."
          description="Pick the track that matches your team's expertise and ambition."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {TRACKS.map((t) => (
            <Card key={t.id} className="group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-md">
              <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.color}`} />
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                <Layers className="size-3.5" /> {t.eligibility}
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">{t.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t.desc}</p>
              <Link to="/tracks" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Learn more <ArrowRight className="size-3.5" />
              </Link>
            </Card>
          ))}
        </div>
      </section>

      {/* Prizes preview */}
      <section className="border-y border-border bg-muted/40 py-20">
        <div className="container-page">
          <SectionHeader
            eyebrow="Rewards"
            title="A prize pool worth competing for."
            description="Top teams receive cash awards, KAFD residency program access and direct investor introductions."
          />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PRIZES.map((p, i) => (
              <Card key={i} className={`p-6 ${i === 0 ? "border-gold/40 bg-gradient-to-br from-gold/10 to-transparent" : ""}`}>
                <Trophy className={`size-6 ${i === 0 ? "text-gold-foreground" : "text-muted-foreground"}`} />
                <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{p.rank}</div>
                <div className="mt-1 font-display text-2xl font-bold">{p.amount}</div>
                <ul className="mt-4 space-y-1.5 text-xs text-muted-foreground">
                  {p.perks.map((perk, j) => <li key={j}>• {perk}</li>)}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ preview */}
      <section className="container-page py-20">
        <SectionHeader eyebrow="Questions" title="Frequently asked." />
        <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <Card className="p-6">
            <ShieldCheck className="size-6 text-primary" />
            <h3 className="mt-4 font-display text-lg font-semibold">Official KAFD program</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Run under the KAFD Authority innovation mandate. Operated to enterprise standards across registration,
              mentorship, judging and outcome management.
            </p>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <Link to="/faq">Read all FAQs <Calendar className="size-3.5" /></Link>
            </Button>
          </Card>
          <Accordion type="single" collapsible className="w-full">
            {FAQS.slice(0, 4).map((f, i) => (
              <AccordionItem key={i} value={`q-${i}`} className="border-border">
                <AccordionTrigger className="text-left font-medium">{f.q}</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">{f.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page pb-20">
        <div className="kafd-gradient relative overflow-hidden rounded-2xl px-8 py-14 text-primary-foreground sm:px-14">
          <div className="absolute -right-20 -top-20 size-72 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative grid items-center gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gold">Ready to build?</div>
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Register your team for the KAFD Hackathon today.
              </h2>
              <p className="mt-3 max-w-xl text-primary-foreground/80">
                Spots are limited. The platform closes registrations on Oct 20, 2026.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button asChild size="lg" variant="gold"><Link to="/register">Create Participant Account</Link></Button>
              <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10">
                <Link to="/login">I already have an account</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold">{value}</div>
      <div className="text-xs uppercase tracking-widest text-muted-foreground">{label}</div>
    </div>
  );
}
function Counter({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-5">
      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-3xl font-bold">{value}</div>
    </div>
  );
}
function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="text-xs font-semibold uppercase tracking-widest text-gold-foreground">{eyebrow}</div>
      <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-muted-foreground">{description}</p>}
    </div>
  );
}
