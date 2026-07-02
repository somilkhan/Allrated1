-- AllRated — tier_votes table
-- Run this in the Supabase SQL Editor AFTER the main schema.sql.
-- Stores one tier vote per user per item (Skip / Timepass / Go for it / Perfection).
-- Also adds a nullable `tier` column to the existing `ratings` table so review
-- cards can display the reviewer's chosen tier as a badge.

-- ---------------------------------------------------------------------------
-- Tier Votes
-- ---------------------------------------------------------------------------
create table if not exists public.tier_votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  item_id bigint not null,
  tier text not null check (tier in ('skip', 'timepass', 'goforit', 'perfection')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, item_id)
);

alter table public.tier_votes enable row level security;

-- Anyone can read aggregate vote counts
create policy "tier_votes_select_all" on public.tier_votes
  for select using (true);
create policy "tier_votes_insert_own" on public.tier_votes
  for insert with check (auth.uid() = user_id);
create policy "tier_votes_update_own" on public.tier_votes
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tier_votes_delete_own" on public.tier_votes
  for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Add `tier` column to ratings so review cards can show the badge
-- ---------------------------------------------------------------------------
alter table public.ratings
  add column if not exists tier text check (tier in ('skip', 'timepass', 'goforit', 'perfection'));
