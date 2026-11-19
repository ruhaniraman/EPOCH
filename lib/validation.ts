// Form rules shared by the register steps. The backend must enforce these too;
// this is only so people see mistakes before they hit submit.

import type { Semester } from "./types";

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
      if (!usn) return "USN is required.";
      if (!USN_RE.test(usn)) return "Looks wrong. Format: 1DS23CD045";
      if (otherUsns.includes(usn)) return "This USN is already in your team.";
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
