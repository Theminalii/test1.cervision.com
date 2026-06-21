# Hostinger Deployment

This project is a `TanStack Start` SSR app, so it should be deployed on Hostinger as a `Node.js` application, not as plain static hosting.

## Required settings

- Node.js version: `22` preferred, `20+` acceptable
- Install command: `npm install`
- Build command: `npm run build`
- Start command: `npm run start`
- Hostinger entry file: `hostinger-entry.mjs`

## What the start command does

Production server runs with `srvx`, which serves `dist/client` and forwards app requests to the SSR server bundle:

```bash
srvx --prod -s dist/client dist/server/server.js
```

These files are created after `npm run build`.

For Hostinger's `Entry file` field, use:

```bash
hostinger-entry.mjs
```

That file starts a Node server, serves static assets from `dist/client`, and forwards other requests to the built SSR handler in `dist/server/server.js`.

## Environment variables

Hostinger usually provides `PORT` automatically. `srvx` will use it.

If needed, you can also set:

```env
HOST=0.0.0.0
PORT=3000
NODE_ENV=production
KAFD_DB_FILE=./data/kafd.sqlite
```

## Backend foundation

The backend foundation now boots automatically inside `src/server.ts` before SSR:

- SQLite database with Drizzle schema in `src/backend/schema.ts`
- SQL migrations in `src/backend/migrations`
- Automatic migration + seed on server startup
- Cookie-based auth sessions
- Role-aware user context endpoint for login redirects
- Standard API response envelope and API error handling
- Participant, team, invite and submission workflow endpoints

### Auth API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/context`
- `GET /api/auth/me`
- `GET /api/me/context`

### Phase 2 workflow API

- `POST /api/teams`
- `GET /api/teams/my`
- `PUT /api/teams/:id`
- `GET /api/teams/:id/members`
- `POST /api/teams/:id/invites`
- `GET /api/teams/:id/invites`
- `POST /api/team-invites/:token/accept`
- `GET /api/submissions/my`
- `POST /api/submissions`
- `GET /api/submissions/:id`
- `PUT /api/submissions/:id`
- `GET /api/submissions/:id/preview`
- `POST /api/submissions/:id/submit-for-review`
- `POST /api/submissions/:id/resubmit-for-review`
- `GET /api/submissions/:id/status`
- `GET /api/submissions/:id/clarification-notes`

### Seed accounts

- Admin: `admin@kafd.sa` / `Admin123!`
- Participant lead: `lead@kafd.sa` / `Lead123!`
- Participant member: `member@kafd.sa` / `Member123!`
- Participant without team: `participant@kafd.sa` / `Participant123!`
- Mentor: `mentor@kafd.sa` / `Mentor123!`
- Judge: `judge@kafd.sa` / `Judge123!`

### Phase 2 notes

- Public registration always creates `platform_role=participant`
- Team creation auto-assigns the creator as `team_role=lead`
- Team members are view-only for submissions
- Submission edits are only allowed in `Draft` and `Needs Clarification`
- Submission status history is stored in `submission_status_history`

### Phase 3 workflow API

- Mentor:
- `GET /api/mentor/dashboard`
- `GET /api/mentor/submissions`
- `GET /api/mentor/submissions/:id`
- `POST /api/mentor/submissions/:id/approve`
- `POST /api/mentor/submissions/:id/return-for-clarification`
- `GET /api/mentor/review-history`
- Judge:
- `GET /api/judge/dashboard`
- `GET /api/judge/projects`
- `GET /api/judge/projects/:id`
- `POST /api/judge/projects/:id/score`
- `GET /api/judge/completed`
- Admin:
- `GET /api/admin/dashboard`
- `GET /api/admin/participants`
- `GET /api/admin/teams`
- `GET /api/admin/submissions`
- `GET /api/admin/mentors`
- `GET /api/admin/judges`
- `GET /api/admin/scores`
- `GET /api/admin/shortlist`
- `GET /api/admin/winners`
- `GET/PUT /api/admin/settings`
- `POST /api/admin/mentor-assignments`
- `POST /api/admin/judge-assignments`
- `GET /api/admin/exports/*.csv`

### Phase 3 notes

- Mentor can only review assigned submissions and can either approve or return for clarification
- Judge can only score assigned submissions in `Released to Judges` or `Judging in Progress`
- Judge `total_score` is computed entirely on the backend
- Admin can release, disqualify, withdraw, reopen, shortlist and mark winners with status guards
- Production builds hide the role switcher; it remains available only in non-production debug mode

## Deploy steps

1. Push this project to GitHub.
2. In Hostinger, create a `Node.js` app and connect the GitHub repo.
3. Set the commands shown above:
   - Install: `npm install`
   - Build: `npm run build`
   - Start: `npm run start`
   - Entry file: `hostinger-entry.mjs`
4. Redeploy the app.

## Important note

If you use normal shared hosting without Node.js app support, this SSR project will not run correctly there. In that case, it would need to be converted to a static app first.
