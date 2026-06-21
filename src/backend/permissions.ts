import type { PlatformRole, TeamRole } from "./constants";

export function resolveHomePath(platformRole: PlatformRole, teamRole?: TeamRole | null) {
  if (platformRole === "admin") return "/admin/dashboard";
  if (platformRole === "mentor") return "/mentor/dashboard";
  if (platformRole === "judge") return "/judge/dashboard";
  if (teamRole === "lead") return "/app/dashboard";
  if (teamRole === "member") return "/member/dashboard";
  return "/app/onboarding";
}

export function hasPlatformRole(actual: PlatformRole, allowed: PlatformRole[]) {
  return allowed.includes(actual);
}

export function canPublicRegister(role: PlatformRole) {
  return role === "participant";
}

export function buildPermissions(platformRole: PlatformRole, teamRole?: TeamRole | null) {
  const permissions = ["auth.self"] as string[];

  if (platformRole === "admin") {
    permissions.push("admin.access");
  }

  if (platformRole === "mentor") {
    permissions.push("mentor.access");
  }

  if (platformRole === "judge") {
    permissions.push("judge.access");
  }

  if (platformRole === "participant") {
    permissions.push("participant.access");
    if (teamRole === "lead") {
      permissions.push(
        "team.create",
        "team.view",
        "team.update",
        "team.members.view",
        "team.invites.create",
        "team.invites.view",
        "submission.create",
        "submission.view",
        "submission.edit",
        "submission.submit",
        "submission.resubmit",
      );
    } else if (teamRole === "member") {
      permissions.push("team.view", "team.members.view", "submission.view");
    } else {
      permissions.push("team.create");
    }
  }

  return permissions;
}
