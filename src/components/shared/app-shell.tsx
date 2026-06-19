import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, Send, FileText, ListChecks, MessageSquare, CheckCircle2,
  Settings, Download, Trophy, Star, Gavel, ClipboardList, History, UserPlus,
  Briefcase, Award, BarChart3, ShieldCheck, Mail, FolderKanban, Menu, ChevronRight,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { RoleSwitcher } from "./role-switcher";
import type { Role } from "@/lib/mock-data";

type NavItem = { to: string; label: string; icon: any };
type NavGroup = { label: string; items: NavItem[] };

const NAVS: Record<Role, { title: string; groups: NavGroup[] }> = {
  visitor: { title: "Visitor", groups: [] },
  participant: {
    title: "Participant",
    groups: [{ label: "Onboarding", items: [{ to: "/app/onboarding", label: "Get Started", icon: LayoutDashboard }] }],
  },
  team_lead: {
    title: "Team Lead",
    groups: [
      { label: "Overview", items: [{ to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard }] },
      { label: "Team", items: [
        { to: "/app/team", label: "Team Profile", icon: Users },
        { to: "/app/team/invite", label: "Invite Members", icon: UserPlus },
      ]},
      { label: "Submission", items: [
        { to: "/app/submission", label: "Builder", icon: FileText },
        { to: "/app/submission/preview", label: "Preview", icon: ListChecks },
        { to: "/app/submission/status", label: "Status", icon: BarChart3 },
        { to: "/app/submission/clarification", label: "Clarification", icon: MessageSquare },
      ]},
    ],
  },
  team_member: {
    title: "Team Member",
    groups: [{ label: "Overview", items: [
      { to: "/member/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/member/team", label: "Team", icon: Users },
      { to: "/member/submission", label: "Submission", icon: FileText },
      { to: "/member/status", label: "Status", icon: BarChart3 },
    ]}],
  },
  mentor: {
    title: "Mentor",
    groups: [{ label: "Reviews", items: [
      { to: "/mentor/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/mentor/submissions", label: "Submissions", icon: ClipboardList },
      { to: "/mentor/review-history", label: "Review History", icon: History },
    ]}],
  },
  judge: {
    title: "Judge",
    groups: [{ label: "Judging", items: [
      { to: "/judge/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { to: "/judge/projects", label: "Assigned Projects", icon: FolderKanban },
      { to: "/judge/completed", label: "Completed", icon: CheckCircle2 },
    ]}],
  },
  admin: {
    title: "Admin Console",
    groups: [
      { label: "Overview", items: [{ to: "/admin/dashboard", label: "Command Center", icon: LayoutDashboard }] },
      { label: "People", items: [
        { to: "/admin/participants", label: "Participants", icon: Users },
        { to: "/admin/teams", label: "Teams", icon: Briefcase },
        { to: "/admin/mentors", label: "Mentors", icon: ShieldCheck },
        { to: "/admin/judges", label: "Judges", icon: Gavel },
      ]},
      { label: "Workflow", items: [
        { to: "/admin/submissions", label: "Submissions", icon: FileText },
        { to: "/admin/mentor-assignments", label: "Mentor Assignments", icon: Mail },
        { to: "/admin/judge-assignments", label: "Judge Assignments", icon: Send },
        { to: "/admin/scores", label: "Scores", icon: BarChart3 },
      ]},
      { label: "Outcomes", items: [
        { to: "/admin/shortlist", label: "Shortlist", icon: Star },
        { to: "/admin/winners", label: "Winners", icon: Trophy },
      ]},
      { label: "System", items: [
        { to: "/admin/settings", label: "Settings", icon: Settings },
        { to: "/admin/exports", label: "Exports", icon: Download },
      ]},
    ],
  },
};

function SidebarBody({ role }: { role: Role }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const nav = NAVS[role];
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-5 py-5">
        <div className="gold-gradient grid size-9 place-items-center rounded-lg">
          <span className="font-display text-sm font-bold text-primary">K</span>
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-bold">KAFD Hackathon</div>
          <div className="text-[10px] uppercase tracking-[0.18em] text-sidebar-foreground/60">{nav.title}</div>
        </div>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        {nav.groups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/50">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = path === item.to || (item.to !== "/" && path.startsWith(item.to + "/"));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="size-4 opacity-80" />
                    <span className="flex-1">{item.label}</span>
                    {active && <span className="size-1.5 rounded-full bg-gold" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="border-t border-sidebar-border p-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-sidebar-foreground/70 hover:bg-sidebar-accent/60"
        >
          <Award className="size-3.5" /> Back to public site
        </Link>
      </div>
    </div>
  );
}

export function AppShell({
  role,
  title,
  breadcrumbs,
  actions,
  children,
}: {
  role: Role;
  title?: string;
  breadcrumbs?: { label: string; to?: string }[];
  actions?: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-muted/40">
      <div className="grid min-h-screen w-full lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-0 h-screen">
            <SidebarBody role={role} />
          </div>
        </aside>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <button className="grid size-9 place-items-center rounded-md border border-border lg:hidden">
                    <Menu className="size-4" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 border-r border-sidebar-border bg-sidebar p-0 text-sidebar-foreground">
                  <SidebarBody role={role} />
                </SheetContent>
              </Sheet>
              <div className="min-w-0 flex-1">
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {breadcrumbs.map((b, i) => (
                      <span key={i} className="flex items-center gap-1">
                        {b.to ? (
                          <button onClick={() => navigate({ to: b.to! })} className="hover:text-foreground">{b.label}</button>
                        ) : (
                          <span className="text-foreground">{b.label}</span>
                        )}
                        {i < breadcrumbs.length - 1 && <ChevronRight className="size-3" />}
                      </span>
                    ))}
                  </div>
                )}
                {title && <h1 className="truncate font-display text-lg font-semibold sm:text-xl">{title}</h1>}
              </div>
              <div className="flex items-center gap-2">
                {actions}
                <RoleSwitcher compact />
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
