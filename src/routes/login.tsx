import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { PublicNav } from "@/components/shared/public-nav";
import { PublicFooter } from "@/components/shared/public-footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { setRole } from "@/lib/role";
import { ROLES, type Role } from "@/lib/mock-data";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Login — KAFD Hackathon" },
    { name: "description", content: "Sign in to the KAFD Hackathon platform." },
  ]}),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [role, setLocalRole] = useState<Role>("team_lead");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole(role);
    toast.success("Signed in");
    const target = ROLES.find(r => r.id === role)!;
    nav({ to: target.home });
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNav />
      <main className="container-page flex justify-center py-16">
        <Card className="w-full max-w-md p-8">
          <div className="text-xs font-semibold uppercase tracking-widest text-gold-foreground">Sign in</div>
          <h1 className="mt-2 font-display text-3xl font-bold">Welcome back.</h1>
          <p className="mt-2 text-sm text-muted-foreground">Use your KAFD Hackathon credentials.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input required type="email" placeholder="you@company.sa" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input required type="password" placeholder="••••••••" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Demo role (preview)</Label>
              <select
                value={role}
                onChange={(e) => setLocalRole(e.target.value as Role)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                {ROLES.filter(r => r.id !== "visitor").map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-start gap-2 rounded-md border border-info/20 bg-info/5 p-3 text-xs text-info">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              You'll be redirected to the portal that matches your role.
            </div>

            <Button type="submit" variant="kafd" className="w-full" size="lg">Sign in</Button>
            <p className="text-center text-xs text-muted-foreground">
              New here? <Link to="/register" className="font-medium text-primary">Create an account</Link>
            </p>
          </form>
        </Card>
      </main>
      <PublicFooter />
    </div>
  );
}
