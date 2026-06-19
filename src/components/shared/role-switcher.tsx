import { useNavigate } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";
import { ROLES } from "@/lib/mock-data";
import { useRole } from "@/lib/role";

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  const [role, setRole] = useRole();
  const navigate = useNavigate();
  const current = ROLES.find((r) => r.id === role) ?? ROLES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-gold/40 bg-gold/5 text-foreground hover:bg-gold/10">
          <Users className="size-3.5 text-gold-foreground" />
          {!compact && <span className="text-xs font-semibold">Demo:</span>}
          <span className="text-xs">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Preview portal as
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((r) => (
          <DropdownMenuItem
            key={r.id}
            onClick={() => {
              setRole(r.id);
              navigate({ to: r.home });
            }}
            className="text-sm"
          >
            {r.label}
            {r.id === role && <span className="ml-auto text-xs text-gold-foreground">●</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
