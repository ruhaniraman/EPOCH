import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// One row per participant, with their team's details repeated, so it can be
// sorted/filtered in Excel or Google Sheets.
const HEADERS = ["Registration ID", "Team", "Theme", "Registered at (IST)", "Role", "Full name", "USN", "Phone", "Semester"];

function cell(v: string | number): string {
  let s = String(v);
  // Stop spreadsheet apps from running user-typed text as a formula.
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET() {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });

  const registrations = await prisma.registration.findMany({
    orderBy: { createdAt: "asc" },
    include: { theme: true, members: { orderBy: { isLead: "desc" } } },
  });

  const rows = registrations.flatMap((r) =>
    r.members.map((m) => [
      r.id,
      r.teamName,
      r.theme.name,
      r.createdAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }),
      m.isLead ? "Lead" : "Member",
      m.fullName,
      m.usn,
      m.phone,
      m.semester,
    ]),
  );

  // BOM so Excel opens it as UTF-8.
  const csv = "﻿" + [HEADERS, ...rows].map((row) => row.map(cell).join(",")).join("\r\n") + "\r\n";
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="epoch-registrations-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
