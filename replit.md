# الذاكرون — The Rememberers

A comprehensive Islamic platform ported from Firebase to this pnpm monorepo. Features full Quran reader (604 pages + audio), daily Azkar counter, digital Tasbih, Qibla compass, Zakat calculator, AI Contemplation assistant (Gemini), Hadith of the day, Sunnah duas, Hisn al-Muslim, prayer times, and Islamic events calendar.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/azkar-app run dev` — run the frontend (port 24812)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- Required env: `GEMINI_API_KEY` — Google Gemini API key for the AI Reflection feature

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + Tailwind CSS v4, framer-motion, recharts, i18next (Arabic/English)
- API: Express 5 + @google/genai
- DB: PostgreSQL + Drizzle ORM (not yet used by app features)
- Build: esbuild (CJS bundle for API)

## Where things live

- `artifacts/azkar-app/src/App.tsx` — entire frontend app (single large component ~6000 lines)
- `artifacts/azkar-app/src/data/` — all Islamic data (azkar, duas, hisn, surahs, events, hadeeths)
- `artifacts/azkar-app/src/AuthProvider.tsx` — stub auth context (no Firebase)
- `artifacts/api-server/src/routes/gemini.ts` — Gemini stream SSE endpoint
- `artifacts/api-server/src/routes/quran.ts` — Quran reciters proxy + audio CORS proxy

## Architecture decisions

- Firebase completely removed; all sync replaced with localStorage. Auth is a stub.
- Quran audio proxied through `/api/quran/audio?url=...` to avoid CORS issues with CDN servers.
- Reciters list auto-updated at runtime from `mp3quran.net/api/v3/reciters`.
- Gemini AI calls go through `/api/gemini/stream` SSE route (uses `GEMINI_API_KEY` server-side).
- Push notifications replaced with no-op stubs (web push requires a separate backend infrastructure).

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
