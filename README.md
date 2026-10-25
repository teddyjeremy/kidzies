# Kidzies

A playful 3D learning world for children aged 3–6, with portals for parents, teachers, admissions staff and school administrators.

Children sign in with a school-issued **student code** and password, then explore a toy island where every place teaches something: letters in the ABC Garden, counting in the Number Playground, animals, stories, shapes and colours, life skills and a creative studio. Every completed activity is saved and shows up for the child's parents and teachers.

## Demo accounts

| Role | Sign in with | Password |
| --- | --- | --- |
| Student | code `QF5G7J90` | `KidziesDemo123!` |
| Parent | `parent@demo.kidzies.local` | `KidziesDemo123!` |
| Teacher | `teacher@demo.kidzies.local` | `KidziesDemo123!` |
| Administrator | `admin@demo.kidzies.local` | `KidziesDemo123!` |
| Admissions | `admissions@demo.kidzies.local` | `KidziesDemo123!` |

The demo accounts are protected: their passwords and codes cannot be changed, and the demo administrator only sees demonstration records and cannot change school settings.

## Features

- **Student playground**: a smooth, toy-like 3D island (React Three Fiber) with eight learning areas, stars, stickers and unlockable decorations. Spoken instructions, sound toggle, reduced-motion support, a low-power mode and a 2D map when WebGL is unavailable (`?lite=1` forces it).
- **Teacher portal**: classes, student profiles, a lesson builder with preview, assignments to a class or a child, results, feedback, attendance and observations.
- **Parent portal**: linked children only, weekly summary, progress by area, assignments, teacher notes, announcements and account settings.
- **Admissions**: public application form with document upload (PDF/PNG/JPEG, 2 MB, max 3), status checking by reference and email, a staff review dashboard, notes, decisions and one-click enrolment that issues student and parent credentials.
- **Administration**: students (create, reset password, new code, suspend, enrol), guardians, teachers, classes, lesson publishing, settings and a full audit log.

## Architecture

- Next.js App Router, TypeScript (strict), Tailwind CSS, React Three Fiber / Drei, Zod.
- Supabase Postgres. All tables live in a private `app` schema that is not exposed through the Data API. The app calls `public.api_*` functions (SECURITY DEFINER) which resolve the session from a token, check the role, and only return rows the caller may see.
- Sessions: a random 32-byte token in an httpOnly, SameSite=Lax cookie (`kz_session`, 12 hours); only its SHA-256 hash is stored. Passwords are bcrypt hashed with pgcrypto. Sign-in attempts are rate limited.
- Activity scoring for teacher lessons happens in the database, so scores cannot be forged by the browser.

```
app/            routes (public site, /playground, /parent, /teacher, /admin, /admissions)
app/actions/    server actions (validated with Zod)
components/     3D scenes, learning activities, portal UI
lib/            auth, data access, validation, scoring
supabase/       migrations and seed data
tests/          unit tests (Vitest) and end-to-end tests (Playwright)
```

## Local development

```bash
npm install
cp .env.example .env.local   # fill in your Supabase URL and publishable key
npm run dev
```

### Database

Apply the migrations in `supabase/migrations` in order, then run `supabase/seed.sql` to create the demo school (with the Supabase CLI: `supabase db push` and `psql -f supabase/seed.sql`, or paste them into the SQL editor).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm test` | Unit tests |
| `npm run e2e` | Playwright end-to-end tests (set `E2E_BASE_URL` to test a deployment) |

## Deployment

Deploy to Vercel and set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_ANON_KEY` for Production and Preview.

## Privacy and safety

No adverts, no third-party tracking, no open chat for children. Parents only see their linked children; teachers only see their classes; admissions documents are visible only to admissions staff and administrators.
