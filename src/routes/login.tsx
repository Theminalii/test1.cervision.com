import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PublicNav } from "@/components/shared/public-nav";
import { PublicFooter } from "@/components/shared/public-footer";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
import { login } from "@/lib/auth-client";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [
    { title: "Login — KAFD Hackathon" },
    { name: "description", content: "Sign in to the KAFD Hackathon platform." },
  ]}),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setSubmitting(true);

    try {
      const context = await login({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      await queryClient.invalidateQueries({ queryKey: ["auth-context"] });
      toast.success("Signed in");
      nav({ to: context.correctRedirectPath });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
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
              <Input required name="email" type="email" placeholder="you@company.sa" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</Label>
              <Input required name="password" type="password" placeholder="••••••••" />
            </div>

            <div className="flex items-start gap-2 rounded-md border border-info/20 bg-info/5 p-3 text-xs text-info">
              <Info className="mt-0.5 size-3.5 shrink-0" />
              You'll be redirected based on your platform role and active team membership.
            </div>

            <Button type="submit" disabled={submitting} variant="kafd" className="w-full" size="lg">
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
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
