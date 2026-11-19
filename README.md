# EPOCH 1.0 — Datathon Website

Website for **EPOCH 1.0**, a one-day hospital-data datathon by The ACE Society, Dept. of CSE (Data Science), DSCE.
24 Nov 2026 · 9 AM – 5 PM · Building No. 4, NEB.

> **Status:** Frontend and backend APIs are implemented. PostgreSQL database, Prisma schema, migrations and seed data are ready. Backend changes are pushed to the `main` branch.
> **What's left:** Frontend-backend integration, final content, complete rulebook, end-to-end testing and deployment.
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
- On success, displays the registration ID returned by the backend.
- Formatted IDs such as `EPOCH-DIA-07` need to be aligned between frontend and backend during integration.

### Project layout

```
app/            pages, layout, global styles
components/
  landing/      landing page sections
  register/     registration flow steps & result screens
  ui/           shared UI components
  brand/        logo + mark
  ascii/        ASCII-art word renderer
lib/
  content.ts    event copy
  types.ts      frontend-backend contract
  api.ts        frontend API communication layer
  mock-db.ts    fake backend in localStorage
  validation.ts form rules
  useThemes.ts  live theme/slot data hook
public/         logo SVGs
```

---

### 1. Backend and Database (completed)

The backend APIs have been implemented using Next.js Route Handlers, Prisma ORM and PostgreSQL.

#### `GET /api/themes`

- Fetches all five themes.
- Returns theme ID, code, name, description, capacity and current registration count (`taken`).

#### `POST /api/registrations`

- Accepts team details, selected theme and member information.
- Validates 3–4 members per team.
- Enforces exactly one team leader.
- Validates member details and semester.
- Prevents duplicate USNs across all teams.
- Enforces a maximum of 5 teams per theme.
- Uses database transactions for safe slot allocation.

#### Database

- PostgreSQL with Prisma ORM.
- Models: `Theme`, `Registration`, and `Member`.
- Database migrations are included in `prisma/migrations/`.
- Seed script: `prisma/seed.ts`.
- Five themes are seeded: Cancer, Diabetes, Cardiac, Hospital Operations and Emergency / ICU.

#### Database setup

1. Install dependencies: `npm install`
2. Configure `DATABASE_URL` in `.env` using `.env.example`.
3. Create the PostgreSQL database.
4. Apply migrations: `npx prisma migrate deploy`
5. Generate Prisma Client: `npx prisma generate`
6. Seed themes: `npx tsx prisma/seed.ts`

#### Testing completed

- TypeScript compilation passed.
- Theme fetching tested.
- Team registration tested.
- Duplicate USN rejection tested.
- Theme capacity limit tested, including rejection of a sixth team.

#### GitHub

Backend and database implementation pushed to the `main` branch.

**Remaining backend-related work:**
- Connect the frontend's `lib/api.ts` to the real API endpoints.
- Verify frontend and backend data contracts.
- Perform complete end-to-end testing.



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
- Implement organiser access to view and export registrations (admin page or CSV export), if required.
- Verify registration data and theme slot counts against the production database.

---

## Testing with the fake backend
> The fake backend is retained for frontend-only testing. It should be replaced with real API calls during frontend-backend integration.

`lib/mock-db.ts` simulates backend behavior using `localStorage`. Add these to any URL:

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
