import { NextRequest, NextResponse } from "next/server";
import { Prisma, PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorResponse(code: string, message: string, status: number, usns?: string[]) {
  return NextResponse.json(
    { code, message, ...(usns ? { usns } : {}) },
    { status }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    if (!isRecord(body)) {
      return errorResponse("VALIDATION", "Invalid request body.", 400);
    }

    const teamName =
      typeof body.teamName === "string" ? body.teamName.trim() : "";

    const themeId =
      typeof body.themeId === "string" ? body.themeId.trim() : "";

    if (!teamName || !themeId || !Array.isArray(body.members)) {
      return errorResponse(
        "VALIDATION",
        "Team name, theme and members are required.",
        400
      );
    }

    if (body.members.length < 3 || body.members.length > 4) {
      return errorResponse(
        "VALIDATION",
        "A team must have 3 or 4 members.",
        400
      );
    }

    const members: {
  fullName: string;
  usn: string;
  phone: string;
  semester: number;
  isLead: boolean;
}[] = [];

    for (const item of body.members) {
      if (!isRecord(item)) {
        return errorResponse("VALIDATION", "Invalid member details.", 400);
      }

      const fullName =
        typeof item.fullName === "string" ? item.fullName.trim() : "";

      const usn =
        typeof item.usn === "string" ? item.usn.trim().toUpperCase() : "";

      const phone =
        typeof item.phone === "string" ? item.phone.trim() : "";

      const semester = item.semester;
      const isLead = item.isLead;

      if (
        !fullName ||
        !usn ||
        !phone ||
        (semester !== 3 && semester !== 5) ||
        typeof isLead !== "boolean"
      ) {
        return errorResponse(
          "VALIDATION",
          "Check member names, USNs, phone numbers and semesters.",
          400
        );
      }

      members.push({ fullName, usn, phone, semester, isLead });
    }

    const leaders = members.filter((member) => member.isLead);

    if (leaders.length !== 1) {
      return errorResponse(
        "VALIDATION",
        "A team must have exactly one team leader.",
        400
      );
    }

    const usns = members.map((member) => member.usn);
    const uniqueUsns = new Set(usns);

    if (uniqueUsns.size !== usns.length) {
      const duplicates = usns.filter(
        (usn, index) => usns.indexOf(usn) !== index
      );

      return errorResponse(
        "DUPLICATE_USN",
        "A USN cannot appear more than once in a team.",
        409,
        [...new Set(duplicates)]
      );
    }

    const registration = await prisma.$transaction(async (tx) => {
      // Lock this theme row so simultaneous registrations cannot exceed capacity.
      await tx.$queryRaw`
        SELECT id FROM "Theme" WHERE id = ${themeId} FOR UPDATE
      `;

      const theme = await tx.theme.findUnique({
        where: { id: themeId },
      });

      if (!theme) {
        throw new Error("INVALID_THEME");
      }

      const taken = await tx.registration.count({
        where: { themeId },
      });

      if (taken >= theme.capacity) {
        throw new Error("THEME_FULL");
      }

      const created = await tx.registration.create({
        data: {
          teamName,
          themeId,
          members: {
            create: members,
          },
        },
        include: {
          theme: true,
          members: {
            select: {
              fullName: true,
              usn: true,
              phone: true,
              semester: true,
              isLead: true,
            },
          },
        },
      });

      return {
        id: created.id,
        teamName: created.teamName,
        themeId: created.themeId,
        themeName: created.theme.name,
        members: created.members,
        createdAt: created.createdAt.toISOString(),
      };
    });

    return NextResponse.json(registration, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return errorResponse(
          "DUPLICATE_USN",
          "One or more USNs are already registered.",
          409
        );
      }
    }

    if (error instanceof Error) {
      if (error.message === "THEME_FULL") {
        return errorResponse(
          "THEME_FULL",
          "This theme has reached its registration capacity.",
          409
        );
      }

      if (error.message === "INVALID_THEME") {
        return errorResponse("VALIDATION", "Invalid theme selected.", 400);
      }
    }

    console.error("POST /api/registrations failed:", error);

    return errorResponse(
      "INTERNAL_ERROR",
      "Unable to complete registration.",
      500
    );
  }
}
