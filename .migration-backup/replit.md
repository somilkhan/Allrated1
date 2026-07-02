# AllRated

Rate and track movies, TV shows, and anime — all in one place.

## Run & Operate

- `pnpm --filter @workspace/allrated run dev` — run the web app (frontend)
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Required secrets

Set these in the Replit Secrets panel to enable all features:

- `VITE_SUPABASE_URL` — your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` — your Supabase anonymous (public) key
- `VITE_TMDB_API_KEY` — your TMDB API key (for movie/TV data)

The app degrades gracefully without these: auth is disabled without Supabase, and live media data is unavailable without TMDB.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite + Tailwind CSS v3 (PostCSS approach)
- Auth & DB: Supabase (external) — watchlist, favorites, continue watching, ratings
- Media data: TMDB API (movies/TV), AniList API (anime)
- UI: Custom dark theme — #0d0709 background, gold (#B8860B) accents, Inter font

## Where things live

- `artifacts/allrated/` — the web app (React + Vite)
- `artifacts/allrated/src/api/` — API clients (Supabase, TMDB, AniList)
- `artifacts/allrated/src/context/` — UserDataProvider (auth + user lists)
- `artifacts/allrated/src/data/catalog.ts` — media type definitions
- `artifacts/allrated/src/components/` — all UI components
- `artifacts/api-server/` — Express API server (scaffold, not yet used by this app)

## Architecture decisions

- Frontend-only app: all data comes from Supabase and third-party media APIs directly from the browser. No custom backend routes needed.
- Tailwind v3 with PostCSS (not @tailwindcss/vite) — the Bolt export used v3 conventions.
- Supabase is optional at build time: `hasSupabase` flag in `src/lib/env.ts` enables graceful degradation.
- Composite item IDs encode media type + source ID in a single number (see `src/api/ids.ts`).

## Product

AllRated lets users sign up, pick a category (Movies, TV, Anime), browse and search for titles, add them to a watchlist or favorites, track continue-watching progress, and leave ratings/reviews. All user data persists in Supabase.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Do NOT use `@tailwindcss/vite` — this project uses Tailwind v3 with PostCSS.
- Supabase secrets must be `VITE_*` prefix so Vite exposes them to the browser.
- Run `pnpm --filter @workspace/allrated run dev` to start the web app, not a root-level `pnpm dev`.
