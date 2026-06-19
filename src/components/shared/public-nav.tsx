import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RoleSwitcher } from "./role-switcher";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/tracks", label: "Tracks" },
  { to: "/timeline", label: "Timeline" },
  { to: "/prizes", label: "Prizes" },
  { to: "/rules", label: "Rules" },
  { to: "/faq", label: "FAQ" },
];

export function PublicNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="kafd-gradient grid size-9 place-items-center rounded-lg shadow-sm">
            <span className="font-display text-sm font-bold text-primary-foreground">K</span>
          </div>
          <div className="leading-tight">
            <div className="font-display text-sm font-bold tracking-tight">KAFD Hackathon</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Innovation Platform</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground",
                path === item.to && "bg-accent text-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <RoleSwitcher />
          <Button asChild variant="ghost" size="sm">
            <Link to="/login">Login</Link>
          </Button>
          <Button asChild size="sm" variant="kafd">
            <Link to="/register">Register</Link>
          </Button>
        </div>

        <button
          className="grid size-9 place-items-center rounded-md border border-border lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background lg:hidden">
          <div className="container-page flex flex-col gap-1 py-3">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                {item.label}
              </Link>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Button asChild variant="outline" size="sm"><Link to="/login">Login</Link></Button>
              <Button asChild size="sm" variant="kafd"><Link to="/register">Register</Link></Button>
            </div>
            <div className="mt-2"><RoleSwitcher /></div>
          </div>
        </div>
      )}
    </header>
  );
}
