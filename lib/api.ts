// =============================================================================
// THE DATA MODULE. Every read/write the UI does goes through these functions.
//
// For the backend team: replace the two function bodies with real fetch()
// calls that return the same types (lib/types.ts). Nothing else in the
// frontend needs to change. Suggested endpoints:
//   GET  /api/themes        → Theme[]
//   POST /api/registrations → Registration | { code: ApiErrorCode, message, usns? }
// =============================================================================

import type { SubmitResult, TeamInput, Theme } from "./types";
import { delay, mockSubmit, mockThemes } from "./mock-db";

export async function getThemes(): Promise<Theme[]> {
  await delay(400, 900);
  return mockThemes();
}

export async function submitRegistration(team: TeamInput): Promise<SubmitResult> {
  try {
    await delay(900, 1600);
    return mockSubmit(team);
  } catch {
    return { ok: false, error: { code: "NETWORK", message: "Couldn't reach the server. Check your connection." } };
  }
}

/* Example of the real implementation:

export async function getThemes(): Promise<Theme[]> {
  const res = await fetch("/api/themes", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load themes");
  return res.json();
}

export async function submitRegistration(team: TeamInput): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/registrations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(team),
    });
    const body = await res.json();
    return res.ok ? { ok: true, registration: body } : { ok: false, error: body };
  } catch {
    return { ok: false, error: { code: "NETWORK", message: "Couldn't reach the server." } };
  }
}
*/
