-- Step 2: restrict every write to admin accounts only.
-- Run this in Supabase SQL Editor, after schema.sql.
-- Until you run it, any signed-in user can insert, update and delete
-- anything, because the policies only check auth.role() = 'authenticated'
-- and Supabase accepts new sign-ups by default.

-- ============================================================
-- 1. The list of admin users
-- ============================================================

create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

-- No policies on this table, so RLS blocks every read. is_admin()
-- below still works because it is security definer.
revoke all on table public.admins from anon, authenticated;
alter table public.admins enable row level security;

-- ============================================================
-- 2. is_admin(): true only for users listed above
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

revoke execute on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ============================================================
-- 3. Drop the 9 "Auth ..." write policies
-- ============================================================

drop policy if exists "Auth insert projects" on public.projects;
drop policy if exists "Auth update projects" on public.projects;
drop policy if exists "Auth delete projects" on public.projects;

drop policy if exists "Auth insert skills" on public.skills;
drop policy if exists "Auth update skills" on public.skills;
drop policy if exists "Auth delete skills" on public.skills;

drop policy if exists "Auth insert content" on public.content;
drop policy if exists "Auth update content" on public.content;
drop policy if exists "Auth delete content" on public.content;

-- ============================================================
-- 4. One admin-only policy per table
-- ============================================================
-- The "Public read ..." policies from schema.sql stay, so the public
-- site keeps working. Policies are combined with OR, so this adds
-- write access for admins without removing public read access.

drop policy if exists "Admins only projects" on public.projects;
create policy "Admins only projects" on public.projects
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins only skills" on public.skills;
create policy "Admins only skills" on public.skills
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins only content" on public.content;
create policy "Admins only content" on public.content
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 5. Give yourself access
-- ============================================================
-- Sign in through the admin app once, so Supabase creates your user,
-- then run this with your own user id:
--
--   Authentication -> Users -> click your row -> copy the id
--
-- insert into public.admins (user_id)
-- values ('PASTE-YOUR-USER-UUID-HERE');
--
-- To remove access later, delete the row:
--
-- delete from public.admins where user_id = 'PASTE-YOUR-USER-UUID-HERE';
--
-- Check who currently has access:
--
-- select user_id from public.admins;
