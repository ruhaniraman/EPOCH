# EPOCH 1.0 — Datathon Website

Website for **EPOCH 1.0**, a one-day hospital-data datathon by The ACE Society, Dept. of CSE (Data Science), DSCE.
24 Nov 2026 · 9 AM – 5 PM · Building No. 4, NEB.

> **Status:** the frontend is done and runs on its own using a fake in-browser backend.
> **What's left:** the real backend, final copy, and the full rulebook. See [What's left to build](#whats-left-to-build).

---

## Getting started

Needs Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # TypeScript check
npm run build      # production build
```

Stack: **Next.js 16** (App Router), **React 19**, **Tailwind CSS 4**, TypeScript.

> Next.js 16 has breaking changes from older versions. Before changing framework-level code, check the docs bundled in `node_modules/next/dist/docs/` (see `AGENTS.md`).

---

## What's already built

### Pages

| Route        | File                         | What it is |
|--------------|------------------------------|------------|
| `/`          | `app/page.tsx`               | Landing page: hero, Clean / Train / Pitch pillars, ASCII "big moment", themes with live slot counts, prizes, FAQ |
| `/register`  | `app/register/page.tsx`      | 3-step registration: **1** pick a theme → **2** team details (3–4 members, one lead) → **3** review & submit |
| `/rulebook`  | `app/rulebook/page.tsx`      | Registration rules (confirmed); rest of the rulebook is a "Coming soon" placeholder |

### Registration flow

- Step is kept in the URL (`/register?step=2`), so back/forward works.
- The draft survives reloads; you can't skip ahead to a step without finishing the earlier ones.
- Live validation for names, USN (`1DS23CD045` format), 10-digit Indian mobile, semester (3 or 5), and duplicate USNs within a team.
- Theme slots refresh every 20s and on tab focus.
- Handles every server error: theme filled while you were registering (keeps your data and lets you pick another theme), USN already in another team, registrations closed, network failure.
- On success, shows the team's registration ID, e.g. `EPOCH-DIA-07`.

### Project layout

```
app/            pages, layout, global styles (theme.css = design tokens)
components/
  landing/      landing page sections
  register/     registration flow steps & result screens
  ui/           shared Button, Frame, Section, SlotSquares
  brand/        logo + mark
  ascii/        ASCII-art word renderer
lib/
  content.ts    ALL event copy (dates, themes, prizes, FAQ, contacts)
  types.ts      the frontend ⇄ backend contract
  api.ts        the only file that talks to the backend
  mock-db.ts    fake backend in localStorage (temporary)
  validation.ts form rules
  useThemes.ts  live theme/slot data hook
public/         logo SVGs
```

---

## What's left to build

### 1. Backend (main task)

The frontend only ever talks to the backend through **`lib/api.ts`**, and the exact data shapes are in **`lib/types.ts`**. Build these two endpoints, then swap the function bodies in `lib/api.ts` for real `fetch()` calls (a ready-to-paste example is commented at the bottom of that file). Nothing else in the frontend needs to change.

#### `GET /api/themes` → `Theme[]`

```json
[{ "id": "diabetes", "code": "DIA", "name": "Diabetes", "blurb": "...", "capacity": 5, "taken": 2 }]
```

`taken` = number of teams that have **submitted** for that theme.

#### `POST /api/registrations`

Request body (`TeamInput`):

```json
{
  "teamName": "Null Pointers",
  "themeId": "diabetes",
  "members": [
    { "fullName": "...", "usn": "1DS23CD045", "phone": "9876543210", "semester": 3, "isLead": true }
  ]
}
```

Success → `200` with a `Registration` (adds `id` like `EPOCH-DIA-07`, `themeName`, `createdAt`).
Failure → non-2xx with an `ApiError`:

| `code`                 | When |
|------------------------|------|
| `THEME_FULL`           | the theme already has 5 submitted teams |
| `DUPLICATE_USN`        | a USN is already in another team — include the clashing ones in `usns: []` |
| `REGISTRATIONS_CLOSED` | all 25 slots are gone |
| `VALIDATION`           | server-side validation failed — put the reason in `message` |

#### Rules the backend **must** enforce (the frontend checks are only for UX)

- 5 themes × 5 teams = 25 teams max. A slot is taken only on successful submit.
- **Slot locking must be atomic** — two teams submitting for the last slot at the same time must not both get in (use a DB transaction / unique constraint).
- 3 or 4 members per team, exactly one `isLead: true`.
- USN unique across **all** teams; store upper-case, no spaces; format `^\d[A-Z]{2}\d{2}[A-Z]{2}\d{3}$`.
- Phone: 10 digits, starts with 6–9. Semester: 3 or 5. Team name: 2–40 chars.
- Registration ID: `EPOCH-<theme code>-<2-digit running number>`.

#### Also needed

- Database (any — Postgres/Supabase/Firebase/SQLite are all fine) + hosting.
- A way for organisers to see/export registrations (admin page or CSV export).
- Optional: confirmation email/WhatsApp to the team lead.

Once the backend is live, delete `lib/mock-db.ts` and its import in `lib/api.ts`.

### 2. Content

Everything the site says lives in **`lib/content.ts`**. Lines marked `// EDIT:` are drafts that need checking:

- Hero intro paragraph
- Theme blurbs
- All FAQ answers

### 3. Rulebook

`app/rulebook/page.tsx` has the confirmed registration rules. Replace the "Coming soon" block with the remaining sections (judging criteria, allowed tools, dataset rules, pitch format, disqualification, etc.).

### 4. Before launch

- Test on real phones (most people will register from mobile).
- Deploy (Vercel is the easiest for Next.js) and point the domain.

---

## Testing with the fake backend

Until the real backend exists, `lib/mock-db.ts` fakes it in `localStorage`. Add these to any URL:

| Switch          | Effect |
|-----------------|--------|
| `?mock=full`    | every submit fails with "theme full" |
| `?mock=closed`  | all 25 slots taken — "registrations closed" |
| `?mock=reset`   | wipe fake data and turn switches off |

Without a switch, about 1 in 4 submits randomly fails with "theme full" so that path gets exercised.

---

## Contacts

- **Manosh S** — Event Coordinator — 8050581457
- **Dr. Aarathi S** — Faculty Coordinator
