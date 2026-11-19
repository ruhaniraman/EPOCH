import { Frame } from "@/components/ui/Frame";
import { SEMESTERS } from "@/lib/types";
import { idLabel, MAX_MEMBERS, type MemberDraft, type MemberErrors } from "@/lib/validation";
import { SelectField, TextField } from "./Fields";

export function TeamStep({
  teamName,
  teamNameError,
  members,
  errors,
  onTeamName,
  onMember,
  onBlur,
  onAdd,
  onRemove,
}: {
  teamName: string;
  teamNameError?: string;
  members: MemberDraft[];
  errors: MemberErrors[];
  onTeamName: (v: string) => void;
  onMember: (i: number, field: keyof MemberDraft, v: string) => void;
  onBlur: (key: string) => void;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-8">
      <TextField
        id="teamName"
        label="Team name"
        value={teamName}
        onChange={(e) => onTeamName(e.target.value)}
        onBlur={() => onBlur("teamName")}
        error={teamNameError}
        autoComplete="off"
        maxLength={40}
        placeholder="e.g. Null Pointers"
      />

      {members.map((m, i) => {
        const n = String(i + 1).padStart(2, "0");
        const e = errors[i] ?? {};
        const pre = `m${i}`;
        return (
          <Frame key={i} as="fieldset" className="bg-bg p-4 pt-3 sm:p-6 sm:pt-4">
            <legend className="sr-only">
              Member {n}
              {i === 0 ? ", team lead" : ""}
            </legend>
            <div className="flex min-h-tap items-center justify-between gap-3 border-b border-line pb-3">
              <p className="text-sm font-bold uppercase tracking-label" aria-hidden>
                Member {n}
                {i === 0 && <span className="ml-3 bg-gold px-1.5 py-0.5 text-label text-on-gold">Team lead</span>}
                {i === 3 && <span className="ml-3 text-label text-muted">Optional</span>}
              </p>
              {i === 3 && (
                <button
                  type="button"
                  onClick={onRemove}
                  className="min-h-tap px-2 text-label font-bold uppercase tracking-label text-muted hover:text-danger"
                >
                  Remove <span className="sr-only">member 04</span>
                </button>
              )}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <TextField
                  id={`${pre}-fullName`}
                  label="Full name"
                  value={m.fullName}
                  onChange={(ev) => onMember(i, "fullName", ev.target.value)}
                  onBlur={() => onBlur(`${pre}-fullName`)}
                  error={e.fullName}
                  autoComplete={i === 0 ? "name" : "off"}
                />
              </div>
              <SelectField
                id={`${pre}-semester`}
                label="Semester"
                value={m.semester}
                onChange={(ev) => onMember(i, "semester", ev.target.value)}
                onBlur={() => onBlur(`${pre}-semester`)}
                error={e.semester}
              >
                <option value="">Select</option>
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </SelectField>
              <TextField
                id={`${pre}-usn`}
                label={idLabel(m.semester)}
                hint={m.semester === 1 ? "Sem 1 students: use your college admission ID." : undefined}
                value={m.usn}
                onChange={(ev) => onMember(i, "usn", ev.target.value.toUpperCase())}
                onBlur={() => onBlur(`${pre}-usn`)}
                error={e.usn}
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                placeholder={m.semester === 1 ? "Admission ID" : "1DS23CD045"}
                maxLength={m.semester === 1 ? 20 : 12}
              />
              <TextField
                id={`${pre}-phone`}
                label="Phone"
                type="tel"
                inputMode="numeric"
                value={m.phone}
                onChange={(ev) => onMember(i, "phone", ev.target.value.replace(/[^\d ]/g, ""))}
                onBlur={() => onBlur(`${pre}-phone`)}
                error={e.phone}
                autoComplete={i === 0 ? "tel-national" : "off"}
                placeholder="10 digits"
                maxLength={11}
              />
            </div>
          </Frame>
        );
      })}

      {members.length < MAX_MEMBERS && (
        <button
          type="button"
          onClick={onAdd}
          className="flex min-h-14 w-full items-center justify-center gap-3 border border-dashed border-line-strong text-sm font-bold uppercase tracking-label text-muted hover:border-gold hover:text-gold"
        >
          <span aria-hidden className="text-lg text-gold">
            +
          </span>
          Add 4th member
        </button>
      )}
    </div>
  );
}
