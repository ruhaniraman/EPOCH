import { LinkButton } from "@/components/ui/Button";
import { Frame } from "@/components/ui/Frame";
import { CONTACTS, EVENT } from "@/lib/content";
import type { Registration } from "@/lib/types";

export function SuccessView({ registration }: { registration: Registration }) {
  const lead = registration.members.find((m) => m.isLead);
  const rows = [
    ["Team", registration.teamName],
    ["Theme", registration.themeName],
    ["Team lead", lead?.fullName ?? ""],
    ["Members", String(registration.members.length)],
    ["Date", `${EVENT.date} · ${EVENT.time}`],
    ["Venue", EVENT.venue],
  ];
  return (
    <div>
      <p className="text-label font-bold uppercase tracking-label text-gold">[✓] Theme locked</p>
      <h1 className="mt-3 font-display text-section">You&apos;re in.</h1>

      <Frame className="mt-8 bg-surface p-5 sm:p-6">
        <p className="text-label font-bold uppercase tracking-label text-muted">Registration ID</p>
        <p className="mt-2 break-all text-3xl font-extrabold tracking-tight text-gold sm:text-4xl">{registration.id}</p>
        <dl className="mt-6 grid grid-cols-[6.5rem_1fr] gap-y-3 border-t border-line pt-5 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-label font-bold uppercase tracking-label text-muted">{k}</dt>
              <dd className="font-bold">{v}</dd>
            </div>
          ))}
        </dl>
      </Frame>

      <p className="mt-6 flex items-center gap-3 bg-gold px-4 py-3 text-sm font-bold uppercase tracking-label text-on-gold">
        <span aria-hidden>▣</span> Screenshot this page and share it with your team
      </p>
      <p className="mt-4 text-sm text-muted">
        Awards on {EVENT.awards}. Questions? Call {CONTACTS[0].name} on {CONTACTS[0].phone}.
      </p>
      <div className="mt-8">
        <LinkButton href="/" variant="outline">
          Back to site
        </LinkButton>
      </div>
    </div>
  );
}

export function ClosedView() {
  return (
    <div>
      <p className="text-label font-bold uppercase tracking-label text-gold">[!] 0 / {EVENT.totalSlots} slots open</p>
      <h1 className="mt-3 font-display text-section">Registrations closed</h1>
      <p className="mt-6 leading-relaxed text-muted">
        All {EVENT.totalSlots} slots across the five themes have been taken. Thanks for the interest: watch out for EPOCH 2.0.
      </p>
      <p className="mt-4 text-sm text-muted">
        Think there&apos;s a mistake? Call {CONTACTS[0].name} on{" "}
        <a href={`tel:+91${CONTACTS[0].phone}`} className="font-bold text-ink underline decoration-gold decoration-2 underline-offset-4">
          {CONTACTS[0].phone}
        </a>
        .
      </p>
      <div className="mt-8">
        <LinkButton href="/" variant="outline">
          Back to site
        </LinkButton>
      </div>
    </div>
  );
}
