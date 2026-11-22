# Multiplayer Vocabulary Jam

A responsive vocabulary game built with Node.js, Express, Socket.IO, vanilla JavaScript, and a local JSON question bank. The included bank is a **10 question sample**, not the 20,000 question dataset described in the design brief.

## Run locally (Windows)

1. Install Node.js 20+.
2. In this folder run `npm install`.
3. Copy `.env.example` to `.env`. Defaults let you play as a guest without Google or MySQL.
4. Run `npm run dev` and open http://localhost:3000 in two browser sessions.
5. In each session choose a different guest name. Create a room, then join it by room code. Both players must select “I’m ready” before the host can start.

The app writes guest profiles and match results to `data/local-store.json`. This local JSON store is convenient for a single instance. It is not a distributed database and must not be treated as a production persistence layer.

## Google sign-in

Create a Google OAuth web client in Google Cloud Console, add `http://localhost:3000` as an authorized JavaScript origin, then set `GOOGLE_CLIENT_ID` in `.env`. The browser receives a Google ID token; the backend verifies it with Google Auth Library. A verified stable Google `sub` is used to identify the account.

## Questions

Put your question array or `{ "questions": [...] }` in `data/vocabulary_questions.json`. Records may use `question` or legacy `q`; answer indexes are zero-based. The server reads and validates the file once at startup, filters invalid rows, and keeps the question bank in memory. `npm run import:questions` reports valid, duplicate, and invalid counts. It currently validates JSON; a bulk MySQL upsert importer is not yet implemented. Ten sample records are included so the app runs immediately.

## Database

MySQL 8 schema is provided in `database/migrations/001_initial.sql`. Configure `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, and `DB_NAME`, then run `npm run db:migrate`. The current gameplay path uses the local JSON store and does not yet read or write the MySQL schema. Do not assume that setting DB variables switches runtime persistence.

## Game features

- Create private rooms with unique 6 character codes, room settings, ready states, host transfer, lobby chat, and reactions.
- Authoritative Socket.IO question sequence and score calculation, answer validation, duplicate submission rejection, countdowns, reveal, rankings, and match persistence to the local store.
- Solo practice from the same loaded question bank.
- Leaderboard and profile progress from locally recorded games.
- Installable PWA shell with static asset caching; API and Socket.IO traffic are excluded from the cache.

Quick Match currently creates a room and asks you to invite another player; a centralized public matchmaking queue is not implemented. Reconnection recovery, cross process coordination, persisted MySQL results, a dedicated admin dashboard, and detailed learning analytics are not included in this runnable first build.


## Deploy to Vercel

This repository now has a Vercel project layout: `public/` contains static site assets, `api/[...path].js` is the Node.js Function entry for the existing Express/Socket.IO HTTP server, and `vercel.json` includes the sample JSON bank in the function bundle. The Socket.IO client uses `/api/socket.io`, so API and realtime traffic enter through the Vercel function route. Local `npm run dev` remains available.

1. Push this repository to GitHub and import it in Vercel, or install the Vercel CLI and run `vercel` from the project root.
2. Keep the project root at this folder. Vercel detects the Node.js Function and serves files from `public/`.
3. Add `GOOGLE_CLIENT_ID`, `SESSION_SECRET`, and `APP_URL` to Vercel Project Settings → Environment Variables. Add your production URL to Google's authorized JavaScript origins.
4. Deploy with `vercel --prod` (or deploy through the Vercel dashboard).

**Important for multiplayer:** Vercel supports WebSockets and Socket.IO in Functions, but a connected player is pinned to one function instance, and another player may be routed to a different instance. This build's lobby, user, and match state is still stored in process memory; local match persistence writes to `data/local-store.json`, which is intentionally disabled on Vercel because the deployed filesystem is read-only. So the Vercel structure serves the app and supports the function/WebSocket entry point, but multiplayer sessions and saved results are not reliable across Vercel instances yet. Before using it for real matches, move users, rooms, scores, and match results to a shared Redis/database store and add cross-instance Socket.IO broadcasting. Vercel's own WebSocket guidance recommends Redis for cross-instance room state and event fan-out.

Vercel setup does not make MySQL runtime persistence active: the included migration is still only a schema. The current local experience persists to JSON; a production deployment needs a shared database and Redis credentials configured by server environment variables.`n## Deployment notes

Use a VPS or hosting plan that supports long running Node processes and WebSockets. Run behind an HTTPS reverse proxy that forwards WebSocket upgrade headers. Shared cPanel support varies; many plans stop background processes or do not support persistent WebSockets. Cloudflare can proxy WebSockets when enabled. This build keeps rooms in process memory, so use one Node process; horizontal scaling requires Redis-backed Socket.IO, shared authoritative room state, and coordinated persistence. Set a strong `SESSION_SECRET`, configure `APP_URL`, use HTTPS, and use MySQL-backed persistence before production. Do not expose a dev server directly to the public internet.

## Commands

- `npm run dev` — development server with watch mode
- `npm start` — server
- `npm run import:questions` — validate/import report
- `npm run db:migrate` — create MySQL schema when DB connection settings are configured

The visual direction follows the supplied showcase: purple night-sky gradients, glowing cards, trophy accents, colorful mode tiles, mobile bottom navigation, responsive room panels, and large touch targets.

## Jam gameplay model

The live room flow now follows the Vocabulary.com Jam format: host creates a Jam, players enter its six-digit code, players are balanced across teams, and the host starts a shared set of questions after everyone is ready. Hosts can choose 10, 20, 30, or 40 questions, two to four teams, and slow, medium, fast, or untimed play. Timed questions start at 100 potential points and decay toward 10; correct answers earn the current value, wrong answers subtract half that value from the team, and skipping carries no penalty. Untimed questions are worth 50 points and only the host reveals each answer. After each question the correct answer and explanation are shown, followed by the team standings. The host can start a rematch from the results screen.

This is gameplay inspiration based on Vocabulary.com’s public Jam description; the project has its own UI, question content, scoring implementation, and code. Vocabulary.com describes timed speed-based scoring, a half-points wrong-answer penalty, optional no-timer host reveals, six-digit join codes, and team competition in its [Jam help guide](https://www.vocabulary.com/help/vocab-lists/creating-and-hosting-a-vocabulary-jam-video/) and [player guide](https://www.vocabulary.com/help/vocab-lists/participating-in-a-vocabulary-jam-video/).