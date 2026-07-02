-- AllRated Supabase schema
-- Run this in the Supabase SQL editor (Dashboard > SQL Editor > New query).
-- Creates the tables for Watchlist, Favorites, Continue Watching and Ratings,
-- each protected by Row Level Security so users only touch their own rows.

-- ---------------------------------------------------------------------------
-- Watchlist
-- ---------------------------------------------------------------------------
create table if not exists public.watchlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id bigint not null,
  media_type text not null,
  item jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table public.watchlist enable row level security;

create policy "watchlist_select_own" on public.watchlist
  for select using (auth.uid() = user_id);
create policy "watchlist_insert_own" on public.watchlist
  for insert with check (auth.uid() = user_id);
create policy "watchlist_update_own" on public.watchlist
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "watchlist_delete_own" on public.watchlist
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Favorites
-- ---------------------------------------------------------------------------
create table if not exists public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id bigint not null,
  media_type text not null,
  item jsonb not null,
  created_at timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites_update_own" on public.favorites
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Continue Watching
-- ---------------------------------------------------------------------------
create table if not exists public.continue_watching (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id bigint not null,
  media_type text not null,
  item jsonb not null,
  progress real not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table public.continue_watching enable row level security;

create policy "continue_select_own" on public.continue_watching
  for select using (auth.uid() = user_id);
create policy "continue_insert_own" on public.continue_watching
  for insert with check (auth.uid() = user_id);
create policy "continue_update_own" on public.continue_watching
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "continue_delete_own" on public.continue_watching
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Ratings / Reviews
-- Reviews are readable by everyone (community reviews) but only writable by
-- their author.
-- ---------------------------------------------------------------------------
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  author text,
  item_id bigint not null,
  media_type text not null,
  item jsonb,
  score int not null check (score between 1 and 5),
  review text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table public.ratings enable row level security;

create policy "ratings_select_all" on public.ratings
  for select using (true);
create policy "ratings_insert_own" on public.ratings
  for insert with check (auth.uid() = user_id);
create policy "ratings_update_own" on public.ratings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "ratings_delete_own" on public.ratings
  for delete using (auth.uid() = user_id);
