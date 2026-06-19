import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicNav } from "@/components/shared/public-nav";
import { PublicFooter } from "@/components/shared/public-footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { setRole } from "@/lib/role";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [
    { title: "Register — KAFD Hackathon" },
    { name: "description", content: "Create your participant account for the KAFD Hackathon." },
  ]}),
  component: RegisterPage,
});

function RegisterPage() {
  const nav = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setRole("participant");
      toast.success("Participant account created");
      nav({ to: "/app/onboarding" });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="container-page grid items-center gap-10 py-16 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-gold-foreground">Get started</div>
          <h1 className="mt-3 font-display text-4xl font-bold sm:text-5xl">Create your participant account.</h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Once registered, you can create or join a team and collaborate on your KAFD Hackathon submission.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li>• Secure single account across all hackathon portals</li>
            <li>• Invite up to 4 additional team members</li>
            <li>• Manage submission, mentor reviews and judging visibility</li>
          </ul>
        </div>

        <Card className="p-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <Field label="Full name"><Input required placeholder="Sara Al-Otaibi" /></Field>
            <Field label="Email address"><Input required type="email" placeholder="you@company.sa" /></Field>
            <Field label="Phone number"><Input required type="tel" placeholder="+966 5X XXX XXXX" /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Password"><Input required type="password" placeholder="••••••••" /></Field>
              <Field label="Confirm password"><Input required type="password" placeholder="••••••••" /></Field>
            </div>
            <Button type="submit" disabled={submitting} variant="kafd" className="w-full" size="lg">
              {submitting ? "Creating account…" : "Create Participant Account"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Already registered? <Link to="/login" className="font-medium text-primary">Sign in</Link>
            </p>
          </form>
        </Card>
      </main>
      <PublicFooter />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
