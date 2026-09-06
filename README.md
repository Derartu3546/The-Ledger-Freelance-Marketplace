# The Ledger — Freelance Marketplace

A two-sided marketplace: **clients** post jobs with a budget range, **freelancers** browse and
apply with a cover letter and proposed rate, clients accept one applicant, and either side can
leave a review once the job is marked complete.

Built with Next.js 14 (App Router), Prisma + PostgreSQL, and JWT auth in httpOnly cookies —


## Stack

- **Next.js 14** (App Router, Route Handlers for the API, middleware for route protection)
- **PostgreSQL** + **Prisma** ORM
- **JWT** (jsonwebtoken) + **bcryptjs** for auth — no NextAuth, so you can see exactly how it works
- **Tailwind CSS v4** with a custom "job-ledger" design (no default SaaS-card look)
- **Zod** for request validation

## Project structure

```
app/
  api/
    auth/          register, login, me (also handles logout)
    jobs/          list+create, and [id] for detail/update/delete
    applications/  list+apply, and [id] for accept/reject/withdraw
    reviews/       post-completion reviews
  (auth)/login, (auth)/register     — public auth pages
  jobs/                              — browse jobs, job detail + apply, post a job
  dashboard/client, dashboard/freelancer  — role-specific dashboards
lib/
  auth.ts    — JWT sign/verify, password hashing, reads the cookie in API routes
  db.ts      — Prisma client singleton
  apiClient.ts — small fetch wrapper used by client components
middleware.ts — protects /dashboard/* and /jobs/new, redirects to role dashboard
prisma/
  schema.prisma — User, Job, Application, Review models
  seed.ts        — sample client + freelancer + job
```

## Data model

- `User` — one table for both roles, distinguished by `role: CLIENT | FREELANCER | ADMIN`.
- `Job` — belongs to a client, has a status (`OPEN → IN_PROGRESS → COMPLETED`/`CANCELLED`).
- `Application` — a freelancer applying to a job, unique per (job, freelancer) pair, so someone
  can't apply twice. Statuses: `PENDING → ACCEPTED/REJECTED`, or `WITHDRAWN` by the applicant.
- `Review` — left by either party against the other, only allowed once a job is `COMPLETED`.

## How auth works 

1. `/api/auth/register` and `/api/auth/login` hash/verify passwords with bcrypt, then sign a JWT
   containing `{ userId, role }` and set it as an **httpOnly** cookie called `token`.
2. `middleware.ts` reads that cookie on every request to `/dashboard/*` and `/jobs/new`, verifies
   it, and redirects to `/login` if missing/invalid — this runs on the edge, before the page
   renders, so there's no flash of protected content.
3. Every API route that needs to know "who is this" calls `getAuthFromRequest(req)` from
   `lib/auth.ts`, which reads and verifies the same cookie server-side.
4. A shared `AuthContext` (`lib/AuthContext.tsx`) fetches `/api/auth/me` once at the root layout
   and exposes `user` + a `refresh()` function everywhere via `useAuth()`. Login/register call
   `refresh()` right after a successful request, so the navbar updates instantly — no full page
   reload needed. This is a UX convenience only; the real security enforcement always happens
   in `middleware.ts` and inside each API route.

## Design

Dark/light mode is handled by `lib/ThemeContext.tsx`, which toggles a `.dark` class on `<html>`
and persists the choice to `localStorage`. A small inline script in the root layout applies the
saved theme before React hydrates, so there's no flash of the wrong theme on load. Colors are
defined as CSS variables in `app/globals.css` and swapped per-theme via a `.dark { ... }` block,
so components reference `var(--color-*)` rather than hardcoded Tailwind color classes — change
the palette in one place and it updates everywhere.

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up PostgreSQL

Create a database (locally, via Docker, or a hosted service like Neon/Supabase/Railway):

```bash
createdb freelance_marketplace
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and set `DATABASE_URL` to your connection string, and `JWT_SECRET` to any long
random string (e.g. run `openssl rand -base64 32`).

### 4. Run migrations and generate the Prisma client

```bash
npx prisma migrate dev --name init
```

### 5. (Optional) Seed sample data

```bash
npm run seed
```


### 6. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

