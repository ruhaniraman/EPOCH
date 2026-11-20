# EPOCH — Datathon Website

Website for **EPOCH**, a one-day hospital-data datathon by The ACE Society, Dept. of CSE (Data Science), DSCE.
24 Nov 2026 · 9 AM – 5 PM · Building No. 4, NEB.

> **Status:** Frontend, backend APIs, PostgreSQL database and organiser dashboard (`/admin`) are built, connected and tested end to end.
> **What's left:** deployment (see [Deploying](#deploying)), final content, mobile testing.

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
| `/rulebook`  | `next.config.ts` (redirect)  | Redirects to the rulebook PDF on Google Drive (`RULEBOOK_URL` in `lib/content.ts`) |
| `/admin`     | `app/admin/page.tsx`         | Organisers only (password = `ADMIN_PASSWORD` env var): slot counts per theme, every team with members and phone numbers, **Download CSV**, delete a team (frees its slot and USNs) |

### Registration flow

- Step is kept in the URL (`/register?step=2`), so back/forward works.
- The draft survives reloads; you can't skip ahead to a step without finishing the earlier ones.
- Live validation for names, USN (`1DS23CD045` format; semester 1 students enter their admission ID instead), 10-digit Indian mobile, semester (1, 3, 5 or 7), and duplicate USNs within a team.
- Theme slots refresh every 20s and on tab focus.
- Handles every server error: theme filled while you were registering (keeps your data and lets you pick another theme), USN already in another team, registrations closed, network failure.
- On success, shows the registration ID from the backend, e.g. `EPOCH-DIA-07` (theme code + running number of the team overall, 01–25).

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
  content.ts    ALL event copy (dates, themes, prizes, FAQ, contacts)
  types.ts      the frontend ⇄ backend contract
  api.ts        the only file the UI uses to call the backend
  prisma.ts     shared Prisma client for the API routes
  admin-auth.ts organiser login for /admin (password check + session cookie)
  validation.ts form rules (used by both the form and the API)
  useThemes.ts  live theme/slot data hook
app/api/        backend route handlers (themes, registrations)
app/admin/      organiser dashboard, login, CSV export
prisma/         database schema, migrations, seed script
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
- Validates with the same rules as the form (`lib/validation.ts`): team name, 3–4 members, exactly one lead, USN format, 10-digit mobile, semester 1, 3, 5 or 7 (semester 1 uses an admission ID instead of a USN).
- Prevents duplicate USNs across all teams and returns the clashing ones in `usns`.
- Enforces 5 teams per theme and 25 overall (`THEME_FULL` / `REGISTRATIONS_CLOSED`).
- Generates IDs like `EPOCH-DIA-07`.
- Locks the theme rows in a transaction so simultaneous submits can never overfill a theme or reuse an ID.

#### Database

- PostgreSQL with Prisma ORM.
- Models: `Theme`, `Registration`, and `Member`.
- Database migrations are included in `prisma/migrations/`.
- Seed script: `prisma/seed.ts`.
- Five themes are seeded: Cancer, Diabetes, Cardiac, Hospital Operations and Emergency / ICU.

#### Database setup

1. Install dependencies: `npm install`
2. Configure `DATABASE_URL` in `.env` using `.env.example` (Prisma commands fail without it).
3. Create the PostgreSQL database.
4. Apply migrations: `npx prisma migrate deploy`
5. Generate Prisma Client: `npx prisma generate`
6. Seed themes: `npx tsx prisma/seed.ts`

#### Testing completed

Against a real PostgreSQL database:

- **API:** every validation rule; successful registration and ID format; cross-team duplicate USN; 10 teams submitting for one theme at the same moment (exactly 5 get in, IDs unique); filling all 25 slots; 26th team gets `REGISTRATIONS_CLOSED`.
- **Through the real form in a browser:** register a team and see its ID; duplicate USN sends you back to step 2 naming the USN; theme fills while you're on the review step → "Slot taken" screen; full themes can't be picked; all slots full → closed screen.
- `npm run typecheck` and `npm run build` pass.



### 2. Content

Everything the site says lives in **`lib/content.ts`**. Lines marked `// EDIT:` are drafts that need checking:

- Hero intro paragraph
- Theme blurbs
- All FAQ answers

### 3. Rulebook

The rulebook is a Google Drive file. To change it, update `RULEBOOK_URL` in `lib/content.ts` and the `/rulebook` redirect in `next.config.ts`.

### 4. Before launch

- Deploy — see [Deploying](#deploying).
- Test on real phones (most people will register from mobile).
- Before going live, delete any test teams from `/admin`.
- Theme names/blurbs shown on the register page come from the database (`prisma/seed.ts`), so if you edit them in `lib/content.ts`, update the seed too. It re-runs on every Vercel deploy.

---

## Deploying

Vercel + Neon (free tiers are plenty for 25 teams). About 10 minutes, all in the browser:

1. **Vercel:** sign in at [vercel.com](https://vercel.com) with GitHub → **Add New → Project** → import the `EPOCH` repo. Don't deploy yet.
2. **Database:** in the project, **Storage → Create Database → Neon (Postgres)** → pick the region closest to India (Singapore / Mumbai) → connect it to the project. This adds `DATABASE_URL` (and `DATABASE_URL_UNPOOLED`) automatically.
3. **Admin password:** **Settings → Environment Variables** → add `ADMIN_PASSWORD` = a long password (8+ characters) only organisers know.
4. **Deploy.** The `vercel-build` script in `package.json` runs automatically and:
   generates the Prisma client → creates/updates the tables (`prisma migrate deploy`, using the unpooled URL) → seeds the 5 themes → builds the site.
5. Open `https://<your-project>.vercel.app/admin`, log in, and do one test registration end to end, then delete it from `/admin`.
6. Optional: **Settings → Domains** to add a custom domain.

Changing `ADMIN_PASSWORD` later logs everyone out of `/admin` (redeploy for it to take effect).

### Running locally against the same database

Copy `DATABASE_URL` from Vercel (**Storage → your database → .env.local tab**) and your `ADMIN_PASSWORD` into a `.env` file here, then `npm run dev` and open http://localhost:3000/admin. That's the **live** data, so be careful with Delete. For a separate playground, create a Neon branch and use its URL instead.

---

## Contacts

- **Manosh S** — Event Coordinator — 8050581457
- **Dr. Aarathi S** — Faculty Coordinator
