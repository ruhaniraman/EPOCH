// Form rules shared by the register steps. The backend must enforce these too;
// this is only so people see mistakes before they hit submit.

import { SEMESTERS, type Semester } from "./types";

/** Form state for one member (semester is "" until picked). */
export interface MemberDraft {
  fullName: string;
  usn: string;
  phone: string;
  semester: Semester | "";
}

export type MemberErrors = Partial<Record<keyof MemberDraft, string>>;

export const MIN_MEMBERS = 3;
export const MAX_MEMBERS = 4;

export const normalizeUsn = (v: string) => v.toUpperCase().replace(/\s+/g, "");
export const normalizePhone = (v: string) => v.replace(/\D/g, "").slice(-10);

// VTU-style USN: 1DS23CD045 → digit, 2 letters, 2 digits, 2 letters, 3 digits.
const USN_RE = /^\d[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/;
// Semester 1 students don't have a USN yet; they enter their college admission ID
// in the same field. Format isn't fixed, so allow 3–20 letters, digits, "/" or "-".
const ADMISSION_ID_RE = /^[A-Z0-9][A-Z0-9/-]{2,19}$/;
// Semester 3 students may also have a UGDS-style ID (e.g. UGDS23045) instead of a VTU USN.
const UGDS_RE = /^UGDS[A-Z0-9]{4,12}$/;

/** What the ID field is called for a given semester. */
export const idLabel = (semester: Semester | "") => (semester === 1 ? "Admission ID" : "USN");

export const isSemester = (v: unknown): v is Semester => SEMESTERS.includes(v as Semester);

export function validateTeamName(v: string): string | undefined {
  const t = v.trim();
  if (!t) return "Team name is required.";
  if (t.length < 2) return "At least 2 characters.";
  if (t.length > 40) return "Keep it under 40 characters.";
}

export function validateMemberField(
  field: keyof MemberDraft,
  m: MemberDraft,
  otherUsns: string[],
): string | undefined {
  switch (field) {
    case "fullName":
      if (!m.fullName.trim()) return "Full name is required.";
      if (m.fullName.trim().length < 2) return "Enter the full name.";
      return;
    case "usn": {
      const usn = normalizeUsn(m.usn);
      const label = idLabel(m.semester);
      if (!usn) return `${label} is required.`;
      if (m.semester === 1) {
        if (!ADMISSION_ID_RE.test(usn)) return "Enter your admission ID (letters and numbers only).";
      } else if (m.semester === 3) {
        if (!USN_RE.test(usn) && !UGDS_RE.test(usn)) return "Looks wrong. Format: 1DS23CD045 or UGDS…";
      } else if (!USN_RE.test(usn)) {
        return m.semester ? "Looks wrong. Format: 1DS23CD045" : "Looks wrong. Format: 1DS23CD045 (Sem 1: pick Semester 1 first)";
      }
      if (otherUsns.includes(usn)) return `This ${label} is already in your team.`;
      return;
    }
    case "phone": {
      const digits = m.phone.replace(/\D/g, "");
      if (!digits) return "Phone number is required.";
      if (digits.length !== 10) return "Phone must be exactly 10 digits.";
      if (!/^[6-9]/.test(digits)) return "Enter a valid Indian mobile number.";
      return;
    }
    case "semester":
      if (!m.semester) return "Pick a semester.";
      return;
  }
}

export function validateMember(m: MemberDraft, otherUsns: string[]): MemberErrors {
  const errors: MemberErrors = {};
  for (const f of ["fullName", "usn", "phone", "semester"] as const) {
    const e = validateMemberField(f, m, otherUsns);
    if (e) errors[f] = e;
  }
  return errors;
}

export const emptyMember = (): MemberDraft => ({ fullName: "", usn: "", phone: "", semester: "" });
