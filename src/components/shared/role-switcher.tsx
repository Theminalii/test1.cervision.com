import { useQueryClient } from "@tanstack/react-query";
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
import { logout, useAuthContext } from "@/lib/auth-client";

export function RoleSwitcher({ compact = false }: { compact?: boolean }) {
  if (import.meta.env.PROD) {
    return null;
  }

  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data } = useAuthContext();
  const label = data?.authenticated
    ? data.activeTeam?.teamRole === "lead"
      ? "Team Lead"
      : data.activeTeam?.teamRole === "member"
        ? "Team Member"
        : data.user?.platformRole === "admin"
          ? "Admin"
          : data.user?.platformRole === "mentor"
            ? "Mentor"
            : data.user?.platformRole === "judge"
              ? "Judge"
              : "Participant"
    : "Guest";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 border-gold/40 bg-gold/5 text-foreground hover:bg-gold/10">
          <Users className="size-3.5 text-gold-foreground" />
          {!compact && <span className="text-xs font-semibold">Session:</span>}
          <span className="text-xs">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Current access
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {data?.authenticated ? (
          <>
            <DropdownMenuItem
              onClick={() => navigate({ to: data.correctRedirectPath })}
              className="text-sm"
            >
              {data.user?.fullName ?? "User"}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate({ to: data.correctRedirectPath })}
              className="text-sm"
            >
              Open my portal
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={async () => {
                await logout();
                await queryClient.invalidateQueries({ queryKey: ["auth-context"] });
                navigate({ to: "/login" });
              }}
              className="text-sm"
            >
              Sign out
            </DropdownMenuItem>
          </>
        ) : (
          <DropdownMenuItem
            onClick={() => navigate({ to: "/login" })}
            className="text-sm"
          >
            Sign in
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
