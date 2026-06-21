import { useQuery } from "@tanstack/react-query";

type ApiSuccess<T> = { success: true; data: T };
type ApiFailure = { success: false; error: { code: string; message: string; details?: unknown } };

export class HttpError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, code?: string, details?: unknown) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export async function apiRequest<T>(input: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers ?? {});
  if (init?.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(input, {
    credentials: "include",
    ...init,
    headers,
  });

  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("text/csv")) {
    return (await response.text()) as T;
  }

  const body = (await response.json().catch(() => null)) as ApiSuccess<T> | ApiFailure | null;
  if (!response.ok || !body || !("success" in body) || !body.success) {
    const error = body && "error" in body ? body.error : null;
    throw new HttpError(
      response.status,
      error?.message ?? `Request failed with ${response.status}`,
      error?.code,
      error?.details,
    );
  }

  return body.data;
}

export function useApiQuery<T>(queryKey: unknown[], url: string, enabled = true) {
  return useQuery({
    queryKey,
    queryFn: () => apiRequest<T>(url, { method: "GET" }),
    enabled,
  });
}

export function apiGet<T>(url: string) {
  return apiRequest<T>(url, { method: "GET" });
}

export function apiPost<T>(url: string, body?: unknown) {
  return apiRequest<T>(url, {
    method: "POST",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

export function apiPut<T>(url: string, body?: unknown) {
  return apiRequest<T>(url, {
    method: "PUT",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

export function apiDelete<T>(url: string) {
  return apiRequest<T>(url, { method: "DELETE" });
}
