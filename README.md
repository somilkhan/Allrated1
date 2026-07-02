# AllRated1

Rate, review and discover **Movies & TV Shows** (via [TMDB](https://www.themoviedb.org/))
and **Anime** (via the [AniList GraphQL API](https://anilist.gitbook.io/anilist-apiv2-docs/)).
User accounts, Watchlist, Favorites, Ratings and Continue Watching are powered by
[Supabase](https://supabase.com/).

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-97nitriq)

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a `.env` from the template and fill in your keys:

   ```bash
   cp .env.example .env
   ```

   | Variable | Where to get it |
   | --- | --- |
   | `VITE_TMDB_API_KEY` | TMDB → Settings → API (v3 API key) |
   | `VITE_SUPABASE_URL` | Supabase → Project Settings → API |
   | `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API (anon/public key) |

3. Create the database tables by running [`supabase/schema.sql`](supabase/schema.sql)
   in the Supabase SQL editor.

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` — start the Vite dev server
- `npm run build` — production build
- `npm run lint` — ESLint
- `npm run typecheck` — TypeScript type checking

## Architecture

- `src/api/` — API layer. `tmdb.ts` and `anilist.ts` fetch and normalize items into
  a common `Item` shape; `media.ts` dispatches per category; `ids.ts` encodes stable
  numeric ids across sources; `userData.ts` handles Supabase reads/writes.
- `src/context/` — `UserDataProvider` exposes auth + Watchlist/Favorites/Continue
  Watching/Ratings to the app.
- `src/hooks/` — `useCatalog`, `useSearch`, `useDetails` fetch live data.
- `src/data/catalog.ts` — category metadata, types and rating helpers (no static
  catalog data).
