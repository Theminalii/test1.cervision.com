import { createHash, randomUUID } from "node:crypto";

export function nowIso() {
  return new Date().toISOString();
}

export function createId(prefix: string) {
  return `${prefix}_${randomUUID()}`;
}

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function parseJsonArray(value: string | null | undefined) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
