import type { ReactNode } from "react";
import type { Theme } from "@/lib/types";
import type { MemberDraft } from "@/lib/validation";

function Block({ title, onEdit, editLabel, children }: { title: string; onEdit: () => void; editLabel: string; children: ReactNode }) {
  return (
    <section className="border-b border-line py-5">
      <div className="flex items-center justify-between">
        <h3 className="text-label font-bold uppercase tracking-label text-muted">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="min-h-tap px-2 text-label font-bold uppercase tracking-label text-gold underline underline-offset-4 hover:text-ink"
        >
          Edit <span className="sr-only">{editLabel}</span>
        </button>
      </div>
      <div className="mt-1">{children}</div>
    </section>
  );
}

export function ReviewStep({
  theme,
  teamName,
  members,
  onEditTheme,
  onEditTeam,
}: {
  theme: Theme | undefined;
  teamName: string;
  members: MemberDraft[];
  onEditTheme: () => void;
  onEditTeam: () => void;
}) {
  return (
    <div className="border-t border-line">
      <Block title="Theme" onEdit={onEditTheme} editLabel="theme">
        <p className="font-display text-4xl leading-none">{theme?.name ?? "—"}</p>
      </Block>
      <Block title="Team name" onEdit={onEditTeam} editLabel="team name">
        <p className="text-lg font-bold">{teamName.trim()}</p>
      </Block>
      <Block title={`Members (${members.length})`} onEdit={onEditTeam} editLabel="members">
        <ul className="mt-2 space-y-4">
          {members.map((m, i) => (
            <li key={i} className="grid grid-cols-[2.5rem_1fr] gap-x-2">
              <span className="text-label font-bold text-gold">{String(i + 1).padStart(2, "0")}</span>
              <span>
                <span className="font-bold">{m.fullName.trim()}</span>
                {i === 0 && <span className="ml-2 bg-gold px-1.5 py-0.5 text-label font-bold uppercase text-on-gold">Lead</span>}
                <span className="block text-sm text-muted">
                  {m.usn} · {m.phone.replace(/\D/g, "")} · Sem {m.semester}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </Block>
    </div>
  );
}
