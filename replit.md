# الذاكرون — The Rememberers

A comprehensive Islamic platform ported from Firebase to this pnpm monorepo. Features full Quran reader (604 pages + audio), daily Azkar counter, digital Tasbih, Qibla compass, Zakat calculator, AI Contemplation assistant (Gemini), Hadith of the day, Sunnah duas, Hisn al-Muslim, prayer times, and Islamic events calendar.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the NestJS API server (port 8080, watch mode)
- `pnpm --filter @workspace/azkar-app run dev` — run the frontend (port 5173)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` — JWT signing keys (set as Replit Secrets)
- Optional env: `GEMINI_API_KEY` — Google Gemini API key for the AI Reflection feature
- `DATABASE_URL` — injected automatically by Replit's managed PostgreSQL (no manual setup needed)

## Stack

- pnpm workspaces, Node.js 20, TypeScript 5.7
- Frontend: React 18 + Vite + Tailwind CSS v4, framer-motion, recharts, i18next (Arabic/English)
- API: NestJS 10 + Passport JWT + Prisma ORM + @google/genai
- DB: PostgreSQL + Prisma ORM (schema at `artifacts/api-server/prisma/schema.prisma`)

## Where things live

- `artifacts/azkar-app/src/App.tsx` — entire frontend app (single large component ~6000 lines)
- `artifacts/azkar-app/src/data/` — all Islamic data (azkar, duas, hisn, surahs, events, hadeeths)
- `artifacts/api-server/src/auth/` — JWT auth (register, login, refresh, logout)
- `artifacts/api-server/src/quran/` — Quran module (reciters proxy, audio proxy, bookmarks, favorites)
- `artifacts/api-server/src/azkar/` — Azkar module (categories, progress tracking)
- `artifacts/api-server/src/prayer/` — Prayer times via Aladhan API
- `artifacts/api-server/src/gemini/` — Gemini SSE streaming endpoint
- `artifacts/api-server/src/admin/` — Admin panel (user mgmt, azkar CRUD, stats, notifications)
- `artifacts/api-server/prisma/schema.prisma` — full DB schema

## Architecture decisions

- NestJS replaced the old Express server; all routes now under `/api/v1/...`.
- Real JWT auth (register/login/refresh/logout) with bcrypt password hashing and rotating refresh tokens.
- Quran audio proxied through `/api/v1/quran/audio?url=...` with SSRF-safe allowlist + redirect following.
- Reciters list proxied from `mp3quran.net/api/v3/reciters` with 6h in-memory cache.
- Gemini AI calls go through `/api/v1/gemini/stream` SSE route (uses `GEMINI_API_KEY` server-side).
- Prisma migration applied: `artifacts/api-server/prisma/migrations/` contains the `init` migration.
- Auth uses `bcryptjs` (pure JS) — no native build step required after `pnpm install`

## Product

Full-featured Islamic web app in Arabic with English support:
- 📖 Quran reader (604 Mus'haf pages) + 16 reciters audio player
- 📿 Daily Azkar categories + Hisn al-Muslim
- 🔢 Digital Tasbih with dhikr history charts
- 🧭 Qibla compass + real-time prayer times by geolocation
- 🤲 Sunnah duas + Hadith of the day
- 🕌 Islamic events calendar
- 🤖 AI Contemplation assistant (requires GEMINI_API_KEY)
- 💰 Zakat calculator

## User preferences

- The app is in Arabic RTL with an English toggle.
- Dark emerald theme (`#02130F` bg, `#D4AF37` gold accents).

## Gotchas

- App.tsx is a large monolith (~6000 lines). Firebase has been fully removed; all state is localStorage.
- `subscribeToWebPush` and `unsubscribeFromWebPush` are no-ops — push notifications not implemented.
- The `useAuth` hook returns `user: null` always (no login system).
- API server must be running for Gemini AI and Quran audio features to work.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
