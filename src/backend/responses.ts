import { ApiError } from "./errors";

export function jsonResponse(body: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...(init?.headers ?? {}),
    },
  });
}

export function apiSuccess<T>(data: T, init?: ResponseInit, meta?: Record<string, unknown>) {
  return jsonResponse(
    {
      success: true,
      data,
      ...(meta ? { meta } : {}),
    },
    init,
  );
}

export function apiErrorResponse(error: unknown) {
  if (error instanceof ApiError) {
    return jsonResponse(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          ...(error.details ? { details: error.details } : {}),
        },
      },
      { status: error.status },
    );
  }

  console.error(error);
  return jsonResponse(
    {
      success: false,
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "Something went wrong.",
      },
    },
    { status: 500 },
  );
}
