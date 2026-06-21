import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "./api-client";

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export type AuthContext = {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    fullName: string;
    phone: string;
    platformRole: "admin" | "participant" | "mentor" | "judge";
    status: string;
  } | null;
  platformRole: "admin" | "participant" | "mentor" | "judge" | null;
  activeTeam: {
    id: string;
    name: string;
    status: string;
    trackId: string | null;
    teamRole: "lead" | "member";
  } | null;
  teamRole: "lead" | "member" | null;
  memberships: Array<{
    teamId: string;
    teamName: string;
    teamRole: "lead" | "member";
    membershipStatus: string;
    teamStatus: string;
    trackId: string | null;
  }>;
  correctRedirectPath: string;
  permissions: string[];
};

export type AuthPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

export function getAuthContext() {
  return apiRequest<AuthContext>("/api/me/context", { method: "GET" });
}

export function login(payload: AuthPayload) {
  return apiRequest<AuthContext>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function register(payload: RegisterPayload) {
  return apiRequest<AuthContext>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logout() {
  return apiRequest<{ authenticated: false }>("/api/auth/logout", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function useAuthContext() {
  return useQuery({
    queryKey: ["auth-context"],
    queryFn: getAuthContext,
    staleTime: 30_000,
  });
}
