# AllRated

A social rating app where users rate movies, TV shows, games, anime, and more — with tier-based verdicts, reviews, watchlists, and community scores.

## Run & Operate

- Workflow: `artifacts/allrated: web` — starts the Vite dev server on port 19115
- `pnpm run typecheck` — full typecheck across all packages

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: Vite + React + Tailwind CSS (artifacts/allrated)
- Auth + data: Supabase (auth, watchlist, ratings, tier votes)
- External APIs: TMDB (movies/TV), AniList (anime)

## Where things live

- `artifacts/allrated/src/App.tsx` — root component, screen routing logic
- `artifacts/allrated/src/components/` — UI screens (Auth, Category, App, Detail, Saved)
- `artifacts/allrated/src/api/` — TMDB, AniList, Supabase data access
- `artifacts/allrated/src/context/UserDataProvider.tsx` — auth + list state
- `artifacts/allrated/src/data/catalog.ts` — category/media type definitions
- `artifacts/allrated/src/lib/env.ts` — env var access + feature flags

## Architecture decisions

- App uses client-side state machine for screen routing (no URL router) via `useAppHistory`
- Supabase is optional: app degrades gracefully when env vars are absent (auth/lists disabled)
- TMDB key is also optional: search/discovery disabled without it, but local catalog still works

## Product

Rate movies, TV, anime, games, and more. Users sign in, pick a category, search for titles, leave star ratings and reviews, assign tier verdicts (skip / timepass / go for it / perfection), and save items to a watchlist or favorites.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `artifact.toml` must live at `artifacts/allrated/.replit-artifact/artifact.toml` (not at root of artifact dir)
- Required env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TMDB_API_KEY`
- Do NOT run `pnpm dev` at workspace root — use the workflow or `pnpm --filter @workspace/allrated run dev`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
