// =============================================================================
// FAKE BACKEND — used by lib/api.ts until the real backend exists.
// Lives in the browser's localStorage so taken slots survive reloads.
//
// Test switches (add to any URL; they stick for the browser tab):
//   ?mock=full    → every submit fails with THEME_FULL
//   ?mock=closed  → all 25 slots taken ("Registrations closed")
//   ?mock=reset   → wipe fake data back to the seed and turn switches off
// Without a switch, ~1 in 4 submits fails with THEME_FULL at random.
// =============================================================================

import type { Registration, SubmitResult, TeamInput, Theme, ThemeId } from "./types";
import { THEMES } from "./content";

const DB_KEY = "epoch-mock-db-v1";
const MODE_KEY = "epoch-mock-mode";
const RANDOM_THEME_FULL_RATE = 0.25;

interface Db {
  taken: Record<ThemeId, number>;
  usns: string[];
  registrations: Registration[];
}

// Starting state: some themes partly filled, Diabetes already full,
// so every slot-square state is visible straight away.
const SEED: Record<ThemeId, number> = { cancer: 3, diabetes: 5, cardiac: 1, operations: 2, icu: 4 };

type Mode = "normal" | "full" | "closed";

function readMode(): Mode {
  try {
    const param = new URLSearchParams(window.location.search).get("mock");
    if (param === "reset") {
      localStorage.removeItem(DB_KEY);
      sessionStorage.removeItem(MODE_KEY);
      return "normal";
    }
    if (param === "full" || param === "closed") sessionStorage.setItem(MODE_KEY, param);
    return (sessionStorage.getItem(MODE_KEY) as Mode) ?? "normal";
  } catch {
    return "normal";
  }
}

function load(): Db {
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (raw) return JSON.parse(raw) as Db;
  } catch {}
  return { taken: { ...SEED }, usns: [], registrations: [] };
}

function save(db: Db) {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch {}
}

export const delay = (min = 600, max = 1200) =>
  new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));

export function mockThemes(): Theme[] {
  const mode = readMode();
  const db = load();
  return THEMES.map((t) => ({ ...t, taken: mode === "closed" ? t.capacity : Math.min(db.taken[t.id], t.capacity) }));
}

export function mockSubmit(input: TeamInput): SubmitResult {
  const mode = readMode();
  const db = load();
  const theme = THEMES.find((t) => t.id === input.themeId);
  if (!theme) return { ok: false, error: { code: "VALIDATION", message: "Unknown theme." } };

  const totalTaken = Object.values(db.taken).reduce((a, b) => a + b, 0);
  if (mode === "closed" || totalTaken >= THEMES.length * theme.capacity) {
    return { ok: false, error: { code: "REGISTRATIONS_CLOSED", message: "All 25 slots are taken." } };
  }

  // Simulate another team grabbing the last slot a moment before us.
  const unluckyRace = mode === "full" || Math.random() < RANDOM_THEME_FULL_RATE;
  if (db.taken[theme.id] >= theme.capacity || unluckyRace) {
    db.taken[theme.id] = theme.capacity;
    save(db);
    return { ok: false, error: { code: "THEME_FULL", message: `${theme.name} just filled up.` } };
  }

  const clash = input.members.map((m) => m.usn).filter((u) => db.usns.includes(u));
  if (clash.length) {
    return {
      ok: false,
      error: { code: "DUPLICATE_USN", message: "Already registered in another team.", usns: clash },
    };
  }

  db.taken[theme.id] += 1;
  db.usns.push(...input.members.map((m) => m.usn));
  const number = String(totalTaken + 1).padStart(2, "0");
  const registration: Registration = {
    id: `EPOCH-${theme.code}-${number}`,
    teamName: input.teamName,
    themeId: theme.id,
    themeName: theme.name,
    members: input.members,
    createdAt: new Date().toISOString(),
  };
  db.registrations.push(registration);
  save(db);
  return { ok: true, registration };
}
