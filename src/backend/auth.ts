import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { and, eq, gt } from "drizzle-orm";
import { SESSION_COOKIE, SESSION_TTL_MS } from "./constants";
import { db, schema } from "./db";
import { ApiError } from "./errors";
import { createId, nowIso, sha256 } from "./utils";

const scrypt = promisify(scryptCallback);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `scrypt$${salt}$${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, hex] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !salt || !hex) return false;
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const stored = Buffer.from(hex, "hex");
  return stored.length === derived.length && timingSafeEqual(stored, derived);
}

export function createSessionCookie(token: string, expiresAt: Date) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Lax; Expires=${expiresAt.toUTCString()}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Expires=${new Date(0).toUTCString()}`;
}

export function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie");
  if (!header) return null;
  const parts = header.split(";").map((part) => part.trim());
  const match = parts.find((part) => part.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export async function createSession(userId: string, request: Request) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = sha256(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);

  await db.insert(schema.authSessions).values({
    id: createId("sess"),
    userId,
    tokenHash,
    expiresAt: expiresAt.toISOString(),
    createdAt: now.toISOString(),
    lastSeenAt: now.toISOString(),
    userAgent: request.headers.get("user-agent"),
    ipAddress: request.headers.get("x-forwarded-for") ?? undefined,
  });

  return { token, expiresAt };
}

export async function destroySessionByToken(token: string | null) {
  if (!token) return;
  await db.delete(schema.authSessions).where(eq(schema.authSessions.tokenHash, sha256(token)));
}

export async function getAuthenticatedProfile(request: Request) {
  const token = readCookie(request, SESSION_COOKIE);
  if (!token) return null;

  const [session] = await db
    .select({
      sessionId: schema.authSessions.id,
      userId: schema.profiles.id,
      email: schema.profiles.email,
      fullName: schema.profiles.fullName,
      phone: schema.profiles.phone,
      platformRole: schema.profiles.platformRole,
      status: schema.profiles.status,
    })
    .from(schema.authSessions)
    .innerJoin(schema.profiles, eq(schema.authSessions.userId, schema.profiles.id))
    .where(
      and(
        eq(schema.authSessions.tokenHash, sha256(token)),
        gt(schema.authSessions.expiresAt, new Date().toISOString()),
      ),
    )
    .limit(1);

  if (!session) return null;

  await db
    .update(schema.authSessions)
    .set({ lastSeenAt: nowIso() })
    .where(eq(schema.authSessions.id, session.sessionId));

  return {
    id: session.userId,
    email: session.email,
    fullName: session.fullName,
    phone: session.phone,
    platformRole: session.platformRole,
    status: session.status,
  };
}

export async function requireAuthenticatedProfile(request: Request) {
  const profile = await getAuthenticatedProfile(request);
  if (!profile) {
    throw new ApiError(401, "UNAUTHORIZED", "Authentication required.");
  }
  return profile;
}
