import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      orderBy: { id: "asc" },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    });

    const result = themes.map((theme) => ({
      id: theme.id,
      code: theme.code,
      name: theme.name,
      blurb: theme.blurb,
      capacity: theme.capacity,
      taken: theme._count.registrations,
    }));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/themes failed:", error);

    return NextResponse.json(
      {
        code: "INTERNAL_ERROR",
        message: "Unable to fetch themes.",
      },
      { status: 500 }
    );
  }
}
