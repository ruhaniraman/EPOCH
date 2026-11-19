import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Logo } from "@/components/brand/Logo";
import { buttonClass } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Frame";
import { SlotSquares } from "@/components/ui/SlotSquares";
import { isAdmin } from "@/lib/admin-auth";
import { EVENT, THEMES } from "@/lib/content";
import { prisma } from "@/lib/prisma";
import { logout } from "./actions";
import { DeleteButton } from "./DeleteButton";

export const metadata: Metadata = { title: "Admin — EPOCH 1.0", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (d: Date) =>
  d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default async function AdminPage() {
  if (!(await isAdmin())) redirect("/admin/login");

  const [themes, registrations] = await Promise.all([
    prisma.theme.findMany({ include: { _count: { select: { registrations: true } } } }),
    prisma.registration.findMany({
      orderBy: { createdAt: "asc" },
      include: { theme: true, members: { orderBy: { isLead: "desc" } } },
    }),
  ]);
  const order = new Map(THEMES.map((t, i) => [t.id as string, i]));
  themes.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99));
  const people = registrations.reduce((n, r) => n + r.members.length, 0);

  return (
    <>
      <header className="border-b border-line">
        <div className="mx-auto flex h-16 max-w-page items-center justify-between gap-4 px-gutter lg:px-gutter-lg">
          <Logo size="sm" />
          <form action={logout}>
            <button type="submit" className="min-h-tap text-label font-bold uppercase tracking-label text-muted hover:text-ink">
              Log out
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-page px-gutter pb-24 pt-10 lg:px-gutter-lg">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-label font-bold uppercase tracking-label text-gold">[AD] {EVENT.name}</p>
            <h1 className="mt-3 font-display text-section">Registrations</h1>
          </div>
          <a href="/admin/export" className={buttonClass("gold")}>
            Download CSV
          </a>
        </div>

        {/* Summary */}
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat label="Teams" value={`${registrations.length} / ${EVENT.totalSlots}`} />
          <Stat label="Participants" value={String(people)} />
          <Stat label="Slots open" value={String(EVENT.totalSlots - registrations.length)} />
          <Stat label="Last signup" value={registrations.length ? when(registrations[registrations.length - 1].createdAt) : "—"} />
        </div>

        <Frame className="mt-4 bg-surface">
          <ul className="divide-y divide-line">
            {themes.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <span className="flex min-w-0 items-center gap-3">
                  <span className="text-label font-bold uppercase tracking-label text-muted">{t.code}</span>
                  <span className="truncate font-bold">{t.name}</span>
                </span>
                <span className="flex shrink-0 items-center gap-3">
                  <SlotSquares taken={t._count.registrations} capacity={t.capacity} size="sm" />
                  <span className="w-10 text-right text-sm tabular-nums text-muted">
                    {t._count.registrations}/{t.capacity}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </Frame>

        {/* Teams */}
        <h2 className="mt-16 text-2xl font-extrabold uppercase tracking-tight">All teams</h2>
        {registrations.length === 0 ? (
          <p className="mt-6 text-muted">No registrations yet.</p>
        ) : (
          <ol className="mt-6 space-y-4">
            {registrations.map((r) => (
              <li key={r.id}>
                <Frame className="bg-surface p-4 sm:p-6">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-label font-bold uppercase tracking-label text-gold">{r.id}</p>
                      <h3 className="mt-1 break-words text-xl font-extrabold">{r.teamName}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {r.theme.name} · {when(r.createdAt)}
                      </p>
                    </div>
                    <DeleteButton id={r.id} teamName={r.teamName} />
                  </div>
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full min-w-[32rem] text-left text-sm">
                      <thead>
                        <tr className="border-b border-line text-label uppercase tracking-label text-muted">
                          <th className="py-2 pr-4 font-bold">Name</th>
                          <th className="py-2 pr-4 font-bold">USN</th>
                          <th className="py-2 pr-4 font-bold">Phone</th>
                          <th className="py-2 font-bold">Sem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {r.members.map((m) => (
                          <tr key={m.id} className="border-b border-line last:border-0">
                            <td className="py-2 pr-4">
                              {m.fullName}
                              {m.isLead && <span className="ml-2 bg-gold px-1.5 py-0.5 text-label font-bold uppercase text-on-gold">Lead</span>}
                            </td>
                            <td className="py-2 pr-4 tabular-nums">{m.usn}</td>
                            <td className="py-2 pr-4 tabular-nums">
                              <a href={`tel:+91${m.phone}`} className="hover:text-gold">
                                {m.phone}
                              </a>
                            </td>
                            <td className="py-2">{m.semester}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Frame>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Frame className="bg-surface p-4 sm:p-5">
      <p className="text-label font-bold uppercase tracking-label text-muted">{label}</p>
      <p className="mt-2 text-lg font-extrabold tabular-nums sm:text-2xl">{value}</p>
    </Frame>
  );
}
