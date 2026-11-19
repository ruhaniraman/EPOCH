// =============================================================================
// THE DATA MODULE. Every read/write the UI does goes through these functions.
// They call the route handlers in app/api/ and return the shapes in lib/types.ts.
//   GET  /api/themes        → Theme[]
//   POST /api/registrations → Registration | ApiError
// =============================================================================

import type { ApiError, Registration, SubmitResult, TeamInput, Theme } from "./types";

export async function getThemes(): Promise<Theme[]> {
  const res = await fetch("/api/themes", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load themes (${res.status})`);
  return res.json();
}

export async function submitRegistration(team: TeamInput): Promise<SubmitResult> {
  let res: Response;
  try {
    res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(team),
    });
  } catch {
    return { ok: false, error: { code: "NETWORK", message: "Couldn't reach the server. Check your connection." } };
  }

  let body: unknown;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (res.ok) return { ok: true, registration: body as Registration };

  const error = body as Partial<ApiError> | null;
  return {
    ok: false,
    error: {
      code: error?.code ?? "NETWORK",
      message: error?.message ?? "Something went wrong on our side. Please try again.",
      ...(error?.usns ? { usns: error.usns } : {}),
    },
  };
}
