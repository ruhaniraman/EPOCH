// =============================================================================
// Every piece of event copy lives here, so facts are typed once.
// Items marked EDIT: are drafts — check/replace the wording.
// =============================================================================

import type { Theme } from "./types";

export const RULEBOOK_URL = "https://drive.google.com/file/d/1705BGEQACEM3ppTnldW5D-cO0VtGWYR5/view?usp=sharing";

export const EVENT = {
  name: "EPOCH",
  kind: "Datathon",
  tagline: "Clean it. Train it. Pitch it.",
  society: "The ACE Society",
  department: "Dept. of CSE (Data Science)",
  college: "Dayananda Sagar College of Engineering",
  collegeShort: "DSCE",
  date: "24 Nov 2026",
  dateLong: "Tuesday, 24 November 2026",
  time: "9 AM – 5 PM",
  venue: "Building No. 4, NEB",
  awards: "25 Nov 2026",
  prizePool: "₹10,000+",
  totalSlots: 25,
  slotsPerTheme: 5,
  track: "Hospital",
  // EDIT: hero paragraph
  intro:
    "One day. One messy hospital dataset. Clean it, train a model on it, and pitch what you found in three minutes flat.",
} as const;

// The sticky note in the hero (components/landing/StickyNote.tsx).
export const ELIGIBILITY_NOTE = {
  title: "Heads up!",
  body: "This datathon is only for students of the Department of Computer Science (Data Science).",
  footer: "Sem 1 · 3 · 5 · 7",
} as const;

export const CONTACTS = [
  { name: "Manosh S", role: "Event Coordinator", phone: "8050581457" },
  { name: "Dr. Aarathi S", role: "Faculty Coordinator" },
] as const;

export const THEMES: Omit<Theme, "taken">[] = [
  // EDIT: blurbs
  { id: "cancer", code: "CAN", name: "Cancer", capacity: 5, blurb: "Diagnosis records, staging and outcomes." },
  { id: "diabetes", code: "DIA", name: "Diabetes", capacity: 5, blurb: "Glucose readings, lab panels and risk." },
  { id: "cardiac", code: "CAR", name: "Cardiac", capacity: 5, blurb: "Vitals, ECG features and heart events." },
  { id: "operations", code: "OPS", name: "Hospital Operations", capacity: 5, blurb: "Beds, staffing, wait times and flow." },
  { id: "icu", code: "ICU", name: "Emergency / ICU", capacity: 5, blurb: "Triage, admissions and critical care." },
];

export const PILLARS = [
  {
    n: "01",
    file: "CLEAN",
    ext: ".CSV",
    title: "Clean it",
    body: "You get a real-world hospital dataset: missing values, duplicates, typos and all. Make it trustworthy.",
    footer: "PANDAS · NUMPY",
  },
  {
    n: "02",
    file: "TRAIN",
    ext: ".PY",
    title: "Train it",
    body: "Engineer features, pick a model, and prove it works. Simple and honest beats complex and leaky.",
    footer: "SCIKIT-LEARN · ANY",
  },
  {
    n: "03",
    file: "PITCH",
    ext: ".PDF",
    title: "Pitch it",
    body: "Three minutes in front of the judges. What did you find, why does it matter, and what should the hospital do?",
    footer: "3 MIN · HARD STOP",
  },
] as const;

// The three text cards under the ASCII moment (the video's "THINK BUILD SHIP" row).
export const RULE_CARDS = [
  {
    title: "25 teams. That's it.",
    body: "Five themes, five teams each. First come, first served. A theme closes the moment its fifth team submits.",
  },
  {
    title: "Three or four. One lead.",
    body: "Teams of 3 or 4 members with exactly one team lead. A USN (or admission ID) can only be in one team, so no double-dipping.",
  },
  {
    title: "Pick your theme!",
    body: "Your slot is only locked when you hit submit, not when you pick it. Read the",
    link: { label: "rulebook before you register.", href: RULEBOOK_URL },
  },
] as const;

export const PRIZE_TIERS = [
  {
    tier: "Podium",
    label: "Top two teams",
    prizes: [
      { n: "01", key: "FIRST", title: "1st Place", amount: "₹6,000" },
      { n: "02", key: "SECOND", title: "2nd Place", amount: "₹4,000" },
    ],
  },
  {
    tier: "Special",
    label: "Award",
    prizes: [{ n: "03", key: "JUNIOR", title: "Best Junior Team", amount: "₹1,000" }],
  },
] as const;

// EDIT: all answers are drafts written from the event facts.
export const FAQ = [
  {
    q: "Who can participate?",
    a: "Only students of Computer Science (Data Science) in semester 1, 3, 5 or 7. Every member needs a valid USN (semester 1 students use their admission ID instead), and each can only be in one team.",
  },
  {
    q: "What do we actually do?",
    a: "Your team gets a messy hospital dataset for your theme. You clean it, train a model on it, and give a 3-minute pitch on what you found.",
  },
  {
    q: "How big is a team?",
    a: "3 or 4 members, with exactly one team lead. The lead is Member 01 on the registration form.",
  },
  {
    q: "How do themes and slots work?",
    a: "There are 5 themes under the Hospital track: Cancer, Diabetes, Cardiac, Hospital Operations and Emergency / ICU. Each takes 5 teams, 25 in total, first come first served. Your slot is locked only when you submit your registration.",
  },
  {
    q: "What if my theme fills up while I'm registering?",
    a: "Nothing you typed is lost. We'll show you the themes that are still open; pick one and go straight back to review.",
  },
  {
    q: "When and where is it?",
    a: "24 November 2026, 9 AM to 5 PM, Building No. 4, NEB. The award ceremony is on 25 November.",
  },
  {
    q: "What should we bring?",
    a: "Laptops with Python and your usual data tools set up, chargers, and your college ID cards.",
  },
  {
    q: "Who do I contact?",
    a: "Manosh S, event coordinator, on 8050581457. Faculty coordinator: Dr. Aarathi S.",
  },
] as const;

export const NAV = [
  { n: "01", label: "About", href: "#about" },
  { n: "02", label: "Themes", href: "#themes" },
  { n: "03", label: "Prizes", href: "#prizes" },
  { n: "04", label: "FAQs", href: "#faq" },
] as const;
