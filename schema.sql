-- Final schema for a fresh install.
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/quexisjgqxtqssitfbzb/sql/new)
--
-- Already have a database with data? Leave this file alone and run the
-- migrations instead: sql/01_admin_only.sql, then sql/02_content_single_row.sql.
--
-- Safe to run twice: every object is dropped or guarded before it is created.

begin;

-- ============================================================
-- Extensions
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- Tables
-- ============================================================

create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null default '',
  tech text[] default '{}',
  image text default '',
  live_url text default '',
  repo_url text default '',
  created_at timestamptz default now()
);

create table if not exists public.skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null default 'Other',
  created_at timestamptz default now()
);

-- About + contact live together, in exactly one row with id = 1.
create table if not exists public.content (
  id smallint primary key default 1,
  bio text default '',
  photo_url text default '',
  email text default '',
  github text default '',
  linkedin text default '',
  resume_url text default '',
  message text default '',
  created_at timestamptz default now(),
  constraint content_single_row check (id = 1)
);

-- The list of admin users. No policies are defined for it, so no browser
-- client can read or write it; is_admin() below still can, because it is
-- security definer and runs as the function owner.
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

revoke all on table public.admins from anon, authenticated;
alter table public.admins enable row level security;

-- ============================================================
-- is_admin(): true only for users listed in public.admins
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

-- Supabase grants EXECUTE on new functions to anon by default as well as to
-- PUBLIC, so anon has to be named explicitly or this stays reachable at
-- POST /rest/v1/rpc/is_admin with the anon key.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ============================================================
-- Seed the single content row
-- ============================================================

-- A database built on the old schema.sql has content.id as uuid, and this
-- insert would fail with a type error halfway through the transaction.
do $$
begin
  if to_regclass('public.content') is not null and
     (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'content' and column_name = 'id') = 'uuid' then
    raise exception 'public.content.id is still uuid: this file is for a fresh install. On an existing database run sql/01_admin_only.sql then sql/02_content_single_row.sql instead.';
  end if;
  insert into public.content (id) values (1) on conflict do nothing;
end $$;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.content enable row level security;

-- The names are dropped first so a database created by an older version of
-- this file ends up with the same policies as a brand new one.
drop policy if exists "Public read projects" on public.projects;
drop policy if exists "Public read skills" on public.skills;
drop policy if exists "Public read content" on public.content;

drop policy if exists "Auth insert projects" on public.projects;
drop policy if exists "Auth update projects" on public.projects;
drop policy if exists "Auth delete projects" on public.projects;
drop policy if exists "Auth insert skills" on public.skills;
drop policy if exists "Auth update skills" on public.skills;
drop policy if exists "Auth delete skills" on public.skills;
drop policy if exists "Auth insert content" on public.content;
drop policy if exists "Auth update content" on public.content;
drop policy if exists "Auth delete content" on public.content;

drop policy if exists "Admins only projects" on public.projects;
drop policy if exists "Admins only skills" on public.skills;
drop policy if exists "Admins only content" on public.content;

-- Anyone can read the public site.
create policy "Public read projects" on public.projects for select using (true);
create policy "Public read skills" on public.skills for select using (true);
create policy "Public read content" on public.content for select using (true);

-- Only the accounts listed in public.admins can write. Policies on the same
-- table are combined with OR, so this never removes the public reads above.
create policy "Admins only projects" on public.projects
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins only skills" on public.skills
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

create policy "Admins only content" on public.content
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

commit;

-- ============================================================
-- Give yourself access
-- ============================================================
-- 1. Sign in through the admin app once, so Supabase creates your user.
-- 2. Authentication -> Users -> copy your user id.
-- 3. Run:
--
--      insert into public.admins (user_id)
--      values ('PASTE-YOUR-USER-UUID-HERE')
--      on conflict do nothing;
--
-- Check who currently has access:
--
--      select user_id from public.admins;
