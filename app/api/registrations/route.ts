import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { ApiErrorCode, Member, Registration } from "@/lib/types";
import {
  MAX_MEMBERS,
  MIN_MEMBERS,
  normalizePhone,
  normalizeUsn,
  validateMemberField,
  validateTeamName,
  type MemberDraft,
} from "@/lib/validation";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorResponse(code: ApiErrorCode | "INTERNAL_ERROR", message: string, status: number, usns?: string[]) {
  return NextResponse.json({ code, message, ...(usns ? { usns } : {}) }, { status });
}

/** Thrown inside the transaction to roll it back and return an ApiError. */
class RegistrationError extends Error {
  constructor(
    public code: ApiErrorCode,
    message: string,
    public status: number,
    public usns?: string[],
  ) {
    super(message);
  }
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("VALIDATION", "Invalid request body.", 400);
  }

  // ---- validate (same rules as the form, see lib/validation.ts) -------------
  if (!isRecord(body)) return errorResponse("VALIDATION", "Invalid request body.", 400);

  const teamName = typeof body.teamName === "string" ? body.teamName.trim() : "";
  const themeId = typeof body.themeId === "string" ? body.themeId.trim() : "";

  const teamNameError = validateTeamName(teamName);
  if (teamNameError) return errorResponse("VALIDATION", `Team name: ${teamNameError}`, 400);
  if (!themeId) return errorResponse("VALIDATION", "Pick a theme.", 400);

  if (!Array.isArray(body.members) || body.members.length < MIN_MEMBERS || body.members.length > MAX_MEMBERS) {
    return errorResponse("VALIDATION", `A team must have ${MIN_MEMBERS} or ${MAX_MEMBERS} members.`, 400);
  }

  const members: Member[] = [];
  for (const [i, item] of body.members.entries()) {
    if (!isRecord(item) || typeof item.isLead !== "boolean") {
      return errorResponse("VALIDATION", `Member ${i + 1}: invalid details.`, 400);
    }
    const draft: MemberDraft = {
      fullName: typeof item.fullName === "string" ? item.fullName.trim() : "",
      usn: typeof item.usn === "string" ? normalizeUsn(item.usn) : "",
      phone: typeof item.phone === "string" ? normalizePhone(item.phone) : "",
      semester: item.semester === 3 || item.semester === 5 ? item.semester : "",
    };
    const earlierUsns = members.map((m) => m.usn);
    for (const field of ["fullName", "usn", "phone", "semester"] as const) {
      const err = validateMemberField(field, draft, earlierUsns);
      if (err) return errorResponse("VALIDATION", `Member ${i + 1}: ${err}`, 400);
    }
    members.push({
      fullName: draft.fullName,
      usn: draft.usn,
      phone: draft.phone,
      semester: draft.semester as 3 | 5,
      isLead: item.isLead,
    });
  }

  if (members.filter((m) => m.isLead).length !== 1) {
    return errorResponse("VALIDATION", "A team must have exactly one team lead.", 400);
  }

  // ---- lock a slot ---------------------------------------------------------
  try {
    const registration = await prisma.$transaction(async (tx): Promise<Registration> => {
      // Lock every theme row so concurrent submits run one at a time. That keeps
      // the per-theme capacity, the 25-team cap and the running ID number exact.
      // (At most 25 registrations ever, so serialising them costs nothing.)
      await tx.$queryRaw`SELECT id FROM "Theme" ORDER BY id FOR UPDATE`;

      const themes = await tx.theme.findMany({ include: { _count: { select: { registrations: true } } } });
      const totalTaken = themes.reduce((n, t) => n + t._count.registrations, 0);
      const totalCapacity = themes.reduce((n, t) => n + t.capacity, 0);

      if (totalTaken >= totalCapacity) {
        throw new RegistrationError("REGISTRATIONS_CLOSED", "All slots are taken.", 409);
      }

      const theme = themes.find((t) => t.id === themeId);
      if (!theme) throw new RegistrationError("VALIDATION", "Invalid theme selected.", 400);
      if (theme._count.registrations >= theme.capacity) {
        throw new RegistrationError("THEME_FULL", `${theme.name} just filled up.`, 409);
      }

      const clashes = await tx.member.findMany({
        where: { usn: { in: members.map((m) => m.usn) } },
        select: { usn: true },
      });
      if (clashes.length) {
        throw new RegistrationError(
          "DUPLICATE_USN",
          "Already registered in another team.",
          409,
          clashes.map((c) => c.usn),
        );
      }

      // e.g. EPOCH-DIA-07 — the running number across all teams. Taken from the
      // highest existing number (not the count) so deleting a team in /admin
      // can never cause the next team to reuse an ID.
      const existing = await tx.registration.findMany({ select: { id: true } });
      const highest = existing.reduce((max, r) => Math.max(max, Number(r.id.split("-").pop()) || 0), 0);
      const id = `EPOCH-${theme.code}-${String(highest + 1).padStart(2, "0")}`;

      const created = await tx.registration.create({
        data: { id, teamName, themeId, members: { create: members } },
        include: {
          members: { select: { fullName: true, usn: true, phone: true, semester: true, isLead: true } },
        },
      });

      return {
        id: created.id,
        teamName: created.teamName,
        themeId: theme.id as Registration["themeId"],
        themeName: theme.name,
        members: created.members as Member[],
        createdAt: created.createdAt.toISOString(),
      };
    }, {
      // Time spent queueing on the lock above counts toward the timeout. Prisma's
      // 5s default would turn a rush of submits at opening time into 500s.
      maxWait: 10_000,
      timeout: 20_000,
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    if (error instanceof RegistrationError) {
      return errorResponse(error.code, error.message, error.status, error.usns);
    }
    // Safety net: the unique index on Member.usn caught a clash the check missed.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return errorResponse("DUPLICATE_USN", "One or more USNs are already registered.", 409);
    }
    console.error("POST /api/registrations failed:", error);
    return errorResponse("INTERNAL_ERROR", "Unable to complete registration.", 500);
  }
}
