import { and, eq } from "drizzle-orm";
import type { TeamRole } from "./constants";
import { db, schema } from "./db";
import { buildPermissions, resolveHomePath } from "./permissions";

type AuthenticatedProfile = {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  platformRole: string;
  status: string;
};

export async function buildUserContext(profile: AuthenticatedProfile) {
  const memberships = await db
    .select({
      teamId: schema.teamMemberships.teamId,
      teamRole: schema.teamMemberships.teamRole,
      membershipStatus: schema.teamMemberships.status,
      teamName: schema.teams.name,
      teamStatus: schema.teams.status,
      trackId: schema.teams.trackId,
    })
    .from(schema.teamMemberships)
    .innerJoin(schema.teams, eq(schema.teamMemberships.teamId, schema.teams.id))
    .where(
      and(
        eq(schema.teamMemberships.userId, profile.id),
        eq(schema.teamMemberships.status, "active"),
      ),
    );

  const activeMembership = memberships[0] ?? null;
  const teamRole = (activeMembership?.teamRole as TeamRole | undefined) ?? null;

  return {
    user: {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      phone: profile.phone,
      platformRole: profile.platformRole,
      status: profile.status,
    },
    platformRole: profile.platformRole,
    activeTeam: activeMembership
      ? {
          id: activeMembership.teamId,
          name: activeMembership.teamName,
          status: activeMembership.teamStatus,
          trackId: activeMembership.trackId,
          teamRole,
        }
      : null,
    teamRole,
    memberships: memberships.map((membership) => ({
      teamId: membership.teamId,
      teamName: membership.teamName,
      teamRole: membership.teamRole,
      membershipStatus: membership.membershipStatus,
      teamStatus: membership.teamStatus,
      trackId: membership.trackId,
    })),
    correctRedirectPath: resolveHomePath(profile.platformRole as never, teamRole),
    permissions: buildPermissions(profile.platformRole as never, teamRole),
  };
}
