import { NextResponse } from "next/server";
import { THEMES } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import type { Theme } from "@/lib/types";

// Slot counts change constantly — never cache this route.
export const dynamic = "force-dynamic";

// Show themes in the same order the site lists them, not alphabetically.
const ORDER = new Map(THEMES.map((t, i) => [t.id, i]));

export async function GET() {
  try {
    const themes = await prisma.theme.findMany({
      include: { _count: { select: { registrations: true } } },
    });

    const result = themes
      .map((theme) => ({
        id: theme.id,
        code: theme.code,
        name: theme.name,
        blurb: theme.blurb,
        capacity: theme.capacity,
        taken: theme._count.registrations,
      }))
      .sort((a, b) => (ORDER.get(a.id as Theme["id"]) ?? 99) - (ORDER.get(b.id as Theme["id"]) ?? 99));

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/themes failed:", error);
    return NextResponse.json({ code: "INTERNAL_ERROR", message: "Unable to fetch themes." }, { status: 500 });
  }
}
