"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button, Spinner } from "@/components/ui/Button";
import { submitRegistration } from "@/lib/api";
import { RULEBOOK_URL } from "@/lib/content";
import type { Registration, Semester, TeamInput, ThemeId } from "@/lib/types";
import { isFull, slotsOpen, useThemes } from "@/lib/useThemes";
import {
  emptyMember,
  MAX_MEMBERS,
  type MemberDraft,
  MIN_MEMBERS,
  normalizePhone,
  normalizeUsn,
  validateMember,
  validateTeamName,
} from "@/lib/validation";
import { ReviewStep } from "./ReviewStep";
import { ClosedView, SuccessView } from "./ResultViews";
import { StepIndicator } from "./StepIndicator";
import { TeamStep } from "./TeamStep";
import { ThemePicker, ThemePickerSkeleton } from "./ThemePicker";

type Step = 1 | 2 | 3;

interface Draft {
  themeId: ThemeId | null;
  teamName: string;
  members: MemberDraft[];
  agreed: boolean;
}

type Phase = { kind: "form" } | { kind: "success"; registration: Registration } | { kind: "themeFull"; lost: string } | { kind: "closed" };

// Saved per browser tab, so a reload inside WhatsApp's in-app browser
// doesn't wipe what people typed. Cleared after a successful submit.
const DRAFT_KEY = "epoch-register-draft-v1";
const INITIAL: Draft = { themeId: null, teamName: "", members: Array.from({ length: MIN_MEMBERS }, emptyMember), agreed: false };

const HEADINGS: Record<Step, [string, string]> = {
  1: ["Pick your theme", "5 teams per theme, first come first served. Your slot is only locked when you submit in step 3."],
  2: ["Your team", "3 or 4 members. Member 01 is the team lead. Each USN can only be in one team."],
  3: ["Review & lock", "Check everything. Submitting locks your theme slot."],
};

export function RegisterFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const raw = Number(params.get("step"));
  const step: Step = raw === 2 || raw === 3 ? raw : 1;

  const { themes, error: loadError, refresh } = useThemes();
  const [draft, setDraft] = useState<Draft>(INITIAL);
  const [hydrated, setHydrated] = useState(false);
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
  const [dupUsns, setDupUsns] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>({ kind: "form" });
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // ---- persistence -------------------------------------------------------
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DRAFT_KEY);
      if (saved) setDraft({ ...INITIAL, ...JSON.parse(saved) });
    } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (!hydrated || phase.kind === "success") return;
    try {
      sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {}
  }, [draft, hydrated, phase.kind]);

  // ---- validation --------------------------------------------------------
  const usns = draft.members.map((m) => normalizeUsn(m.usn));
  const memberErrors = draft.members.map((m, i) => {
    const e = validateMember(m, usns.slice(0, i).filter(Boolean)); // only flag the later duplicate
    if (!e.usn && dupUsns.includes(usns[i])) e.usn = "Already registered in another team.";
    return e;
  });
  const teamNameError = validateTeamName(draft.teamName);
  const teamValid = !teamNameError && memberErrors.every((e) => Object.keys(e).length === 0);
  const shown = (key: string) => showAll || touched.has(key);
  const visibleMemberErrors = memberErrors.map((e, i) =>
    Object.fromEntries(Object.entries(e).filter(([f]) => shown(`m${i}-${f}`) || (f === "usn" && dupUsns.includes(usns[i])))),
  );

  const theme = themes?.find((t) => t.id === draft.themeId);

  // ---- navigation --------------------------------------------------------
  const goTo = (n: Step) => {
    setNotice(null);
    router.push(`/register?step=${n}`, { scroll: false });
    window.scrollTo({ top: 0 });
  };

  // Move focus to the new step's heading so screen readers announce it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step, phase.kind]);

  // Guards: can't land on a later step without finishing the earlier ones.
  useEffect(() => {
    if (!hydrated || phase.kind !== "form") return;
    if (step >= 2 && !draft.themeId) router.replace("/register?step=1");
    else if (step === 3 && !teamValid) {
      setShowAll(true);
      router.replace("/register?step=2");
    }
  }, [hydrated, step, draft.themeId, teamValid, phase.kind, router]);

  // If the picked theme fills up while still choosing, un-pick it.
  useEffect(() => {
    if (step === 1 && theme && isFull(theme)) {
      setDraft((d) => ({ ...d, themeId: null }));
      setNotice(`${theme.name} just filled up. Pick another theme.`);
    }
  }, [step, theme]);

  // ---- updates -----------------------------------------------------------
  const blur = (key: string) => setTouched((t) => new Set(t).add(key));
  const setMember = (i: number, field: keyof MemberDraft, v: string) => {
    if (field === "usn") setDupUsns((d) => d.filter((u) => u !== normalizeUsn(v)));
    setDraft((d) => ({
      ...d,
      members: d.members.map((m, j) => (j === i ? { ...m, [field]: field === "semester" ? (v ? Number(v) : "") : v } : m)),
    }));
  };

  const nextFromTeam = () => {
    setShowAll(true);
    if (teamValid) return goTo(3);
    const order = ["fullName", "usn", "phone", "semester"] as const;
    let id = teamNameError ? "teamName" : "";
    for (let i = 0; !id && i < memberErrors.length; i++) {
      const f = order.find((k) => memberErrors[i][k]);
      if (f) id = `m${i}-${f}`;
    }
    document.getElementById(id)?.focus();
  };

  const submit = async () => {
    if (!draft.agreed) return setNotice("Tick the box to confirm you've read the rulebook.");
    if (!draft.themeId) return goTo(1);
    setNotice(null);
    setSubmitting(true);
    const input: TeamInput = {
      teamName: draft.teamName.trim(),
      themeId: draft.themeId,
      members: draft.members.map((m, i) => ({
        fullName: m.fullName.trim(),
        usn: normalizeUsn(m.usn),
        phone: normalizePhone(m.phone),
        semester: m.semester as Semester,
        isLead: i === 0,
      })),
    };
    const res = await submitRegistration(input);
    if (res.ok) {
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      setPhase({ kind: "success", registration: res.registration });
      window.scrollTo({ top: 0 });
      refresh();
    } else {
      const { error } = res;
      if (error.code === "THEME_FULL") {
        await refresh(); // show up-to-date open themes on the error screen
        setDraft((d) => ({ ...d, themeId: null }));
        setPhase({ kind: "themeFull", lost: theme?.name ?? "That theme" });
        window.scrollTo({ top: 0 });
      } else if (error.code === "DUPLICATE_USN") {
        setDupUsns(error.usns ?? []);
        goTo(2);
        setNotice(`${(error.usns ?? []).join(", ")} ${error.usns?.length === 1 ? "is" : "are"} already registered in another team.`);
      } else if (error.code === "REGISTRATIONS_CLOSED") {
        await refresh();
        setPhase({ kind: "closed" });
      } else {
        setNotice(error.message);
      }
    }
    setSubmitting(false);
  };

  // ---- render ------------------------------------------------------------
  if (phase.kind === "success") return <SuccessView registration={phase.registration} />;
  if (phase.kind === "closed" || (themes && slotsOpen(themes) === 0)) return <ClosedView />;

  const Notice = notice && (
    <p role="alert" className="mt-6 border border-danger px-4 py-3 text-sm text-danger">
      {notice}
    </p>
  );

  if (phase.kind === "themeFull") {
    return (
      <div>
        <p className="text-label font-bold uppercase tracking-label text-danger">[!] Slot taken</p>
        <h1 ref={headingRef} tabIndex={-1} className="mt-3 font-display text-section outline-none">
          Theme just filled
        </h1>
        <p className="mt-4 leading-relaxed text-muted">
          Another team locked the last <span className="font-bold text-ink">{phase.lost}</span> slot moments before you.{" "}
          <span className="text-ink">Your team details are saved.</span> Pick a theme that&apos;s still open and you&apos;ll go straight back
          to review.
        </p>
        {Notice}
        <div className="mt-8">
          {themes ? (
            <ThemePicker
              themes={themes}
              hideFull
              value={draft.themeId}
              legend="Themes still open"
              onChange={(id) => setDraft((d) => ({ ...d, themeId: id }))}
            />
          ) : (
            <ThemePickerSkeleton />
          )}
        </div>
        <Button
          className="mt-8 w-full"
          onClick={() => {
            if (!draft.themeId) return setNotice("Pick one of the open themes first.");
            setPhase({ kind: "form" });
            goTo(3);
          }}
        >
          Back to review <span aria-hidden>→</span>
        </Button>
      </div>
    );
  }

  const [title, sub] = HEADINGS[step];

  return (
    <div>
      <StepIndicator step={step} />
      <h1 ref={headingRef} tabIndex={-1} className="mt-8 font-display text-[clamp(3rem,13vw,4.5rem)] leading-[0.9] outline-none">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted">{sub}</p>
      {Notice}

      <div className="mt-8">
        {!hydrated ? (
          <ThemePickerSkeleton />
        ) : step === 1 ? (
          loadError && !themes ? (
            <div className="border border-line p-6 text-center">
              <p className="text-muted">Couldn&apos;t load themes.</p>
              <Button variant="outline" className="mt-4" onClick={refresh}>
                Try again
              </Button>
            </div>
          ) : themes ? (
            <ThemePicker
              themes={themes}
              value={draft.themeId}
              legend="Pick your theme"
              onChange={(id) => {
                setNotice(null);
                setDraft((d) => ({ ...d, themeId: id }));
              }}
            />
          ) : (
            <div role="status">
              <span className="sr-only">Loading themes…</span>
              <ThemePickerSkeleton />
            </div>
          )
        ) : step === 2 ? (
          <TeamStep
            teamName={draft.teamName}
            teamNameError={shown("teamName") ? teamNameError : undefined}
            members={draft.members}
            errors={visibleMemberErrors}
            onTeamName={(v) => setDraft((d) => ({ ...d, teamName: v }))}
            onMember={setMember}
            onBlur={blur}
            onAdd={() => setDraft((d) => (d.members.length < MAX_MEMBERS ? { ...d, members: [...d.members, emptyMember()] } : d))}
            onRemove={() => setDraft((d) => ({ ...d, members: d.members.slice(0, MIN_MEMBERS) }))}
          />
        ) : (
          <>
            <ReviewStep theme={theme} teamName={draft.teamName} members={draft.members} onEditTheme={() => goTo(1)} onEditTeam={() => goTo(2)} />
            <label className="mt-6 flex min-h-tap cursor-pointer items-start gap-3 py-2">
              <input
                type="checkbox"
                checked={draft.agreed}
                onChange={(e) => setDraft((d) => ({ ...d, agreed: e.target.checked }))}
                className="mt-0.5 size-5 shrink-0 accent-gold"
              />
              <span className="text-sm leading-relaxed">
                I&apos;ve read the{" "}
                <a href={RULEBOOK_URL} target="_blank" rel="noopener noreferrer" className="font-bold underline decoration-gold decoration-2 underline-offset-4">
                  rulebook
                </a>{" "}
                and my team agrees to follow it.
              </span>
            </label>
          </>
        )}
      </div>

      {/* Step actions */}
      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        {step > 1 ? (
          <Button variant="outline" onClick={() => goTo((step - 1) as Step)} disabled={submitting}>
            <span aria-hidden>←</span> Back
          </Button>
        ) : (
          <span />
        )}
        {step === 1 && (
          <Button onClick={() => (draft.themeId ? goTo(2) : setNotice("Pick a theme to continue."))} disabled={!themes}>
            Next: team <span aria-hidden>→</span>
          </Button>
        )}
        {step === 2 && (
          <Button onClick={nextFromTeam}>
            Next: review <span aria-hidden>→</span>
          </Button>
        )}
        {step === 3 && (
          <Button onClick={submit} disabled={submitting} aria-busy={submitting}>
            {submitting ? (
              <>
                <Spinner /> Locking your slot…
              </>
            ) : (
              <>Submit &amp; lock theme</>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
