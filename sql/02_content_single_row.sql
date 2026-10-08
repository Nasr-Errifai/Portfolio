-- Migration 02: the content table holds exactly one row, with id = 1.
-- Run this in Supabase SQL Editor, after schema.sql and sql/01_admin_only.sql.
--
-- The schema that shipped before this migration gave content.id a random
-- uuid default, so running schema.sql twice created a second, empty content
-- row. The app then asks for one row with .single() and gets PGRST116
-- instead. This migration merges every row into one and makes a second row
-- impossible. (A database installed from the current schema.sql already has
-- smallint id = 1, so this is a no-op there.)
--
-- Safe to run twice: every statement below is idempotent.

begin;

-- ============================================================
-- 1. Merge the rows: keep the newest, fill its empty columns
-- ============================================================

do $$
declare
  base_id uuid;
  older record;
begin
  if to_regclass('public.content') is null then
    raise exception 'public.content does not exist: run schema.sql first';
  end if;

  -- Already migrated: id is smallint now, and smallint has no cast to
  -- uuid, so the select below would error. Nothing left to merge.
  if (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'content' and column_name = 'id')
     <> 'uuid' then
    return;
  end if;

  select id into base_id
  from public.content
  order by created_at desc, id desc
  limit 1;

  -- No rows yet: nothing to merge, step 4 seeds one.
  if base_id is null then
    return;
  end if;

  -- Newest first, so the newest non-empty value wins.
  for older in
    select * from public.content where id <> base_id order by created_at desc, id desc
  loop
    update public.content c
    set bio        = case when coalesce(c.bio, '')       = '' then coalesce(older.bio, '')       else c.bio end,
        photo_url  = case when coalesce(c.photo_url, '') = '' then coalesce(older.photo_url, '') else c.photo_url end,
        email      = case when coalesce(c.email, '')     = '' then coalesce(older.email, '')     else c.email end,
        github     = case when coalesce(c.github, '')    = '' then coalesce(older.github, '')    else c.github end,
        linkedin   = case when coalesce(c.linkedin, '')  = '' then coalesce(older.linkedin, '')  else c.linkedin end,
        resume_url = case when coalesce(c.resume_url, '') = '' then coalesce(older.resume_url, '') else c.resume_url end,
        message    = case when coalesce(c.message, '')   = '' then coalesce(older.message, '')   else c.message end
    where c.id = base_id;
  end loop;

  delete from public.content where id <> base_id;
end $$;

-- ============================================================
-- 2. id: uuid -> smallint, always 1
-- ============================================================

-- The uuid default has to go first, it cannot be cast to smallint.
alter table public.content alter column id drop default;
alter table public.content alter column id type smallint using 1;
alter table public.content alter column id set default 1;
alter table public.content alter column id set not null;

-- ============================================================
-- 3. At most one row, from now on
-- ============================================================

alter table public.content drop constraint if exists content_single_row;
alter table public.content add constraint content_single_row check (id = 1);

-- ============================================================
-- 4. Seed the row
-- ============================================================

insert into public.content (id) values (1)
on conflict (id) do nothing;

commit;

-- Verify: expect one row, min_id = 1, max_id = 1.
-- select count(*) as rows, min(id) as min_id, max(id) as max_id from public.content;
