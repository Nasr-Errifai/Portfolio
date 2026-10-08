-- Step 7: verification. Run this in the Supabase SQL Editor AFTER
-- schema.sql. Nothing here changes data, except the deliberate failed
-- insert in check 8, which is the last statement in this file.
--
-- Checks 1-7 are safe to run as one script. Check 8 is SUPPOSED to error,
-- and an error stops the script, which is why it is last.

-- ============================================================
-- 1. Tables exist and RLS is on
-- ============================================================

select c.relname as table_name,
       c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('projects', 'skills', 'content', 'admins')
order by c.relname;

-- Expect 4 rows, rls_enabled = true on every one of them.


-- ============================================================
-- 2. Policies: public read + admin-only writes, nothing else
-- ============================================================

select tablename, policyname, cmd, roles, qual
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- Expect exactly 6 rows:
--   3 x "Public read ..."   cmd = SELECT, roles = {public}
--   3 x "Admins only ..."   cmd = ALL,    roles = {authenticated}
-- Expect ZERO rows named "Auth insert/update/delete ...".


-- ============================================================
-- 3. content holds exactly one row, id = 1
-- ============================================================

select count(*) as rows, min(id) as min_id, max(id) as max_id
from public.content;

-- Expect: rows = 1, min_id = 1, max_id = 1.
-- schema.sql seeds this row. If it is missing, run the seed at the bottom
-- of schema.sql. If the column is still uuid, run sql/02_content_single_row.sql.


-- ============================================================
-- 4. is_admin() is locked down
-- ============================================================

select p.prosecdef as security_definer,
       p.proconfig as config,
       has_function_privilege('anon', 'public.is_admin()', 'execute') as anon_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'is_admin';

-- Expect: security_definer = true,
--         config contains "search_path=",
--         anon_can_execute = false.


-- ============================================================
-- 5. The admin list is unreadable from a browser client
-- ============================================================

select grantee, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name = 'admins'
order by grantee, privilege_type;

-- Expect rows for postgres and service_role ONLY (7 privileges each).
-- anon and authenticated must NOT appear.
-- service_role is your secret server key, which never ships to the
-- browser, so its access is fine.
-- If anon or authenticated show up, re-run the revoke from schema.sql:
--   revoke all on table public.admins from anon, authenticated;


-- ============================================================
-- 6. Reads work under RLS, as the anon role your site uses
-- ============================================================

set role anon;
select count(*) as anon_can_read_projects from public.projects;
select count(*) as anon_can_read_skills from public.skills;
select count(*) as anon_can_read_content from public.content;
reset role;

-- Expect, with NO error: 0, 0, 1.
-- (schema.sql seeds the one content row.) An error here means the
-- "Public read" policy is missing.


-- ============================================================
-- 7. Who has access
-- ============================================================

select user_id from public.admins;

-- Expect: your own user id, once you have inserted it (see the bottom of
-- schema.sql). An empty result means you cannot save anything in the admin
-- yet.


-- ============================================================
-- 8. EXPECTED TO FAIL: a write as anon must be refused
-- ============================================================
-- Run this one on its own. It is meant to produce an error, and an error
-- stops the script, so no executable statement follows it.
-- If a later query fails with an odd permission error, run `reset role;`
-- first: the session may still be role anon.

set role anon;
insert into public.projects (title) values ('this must fail');

-- Expect: ERROR containing "row-level security".
-- If the row appears instead, STOP: your writes are open to everyone.
-- Delete it with:
--   reset role;
--   delete from public.projects where title = 'this must fail';


-- ============================================================
-- Curl tests (run in a terminal, not here)
-- ============================================================
-- Take the key from .env.local, it is the VITE_SUPABASE_ANON_KEY value:
--   URL=https://quexisjgqxtqssitfbzb.supabase.co
--   SUPABASE_ANON_KEY=...   (never commit this)
--
-- a) Public read works:
--      curl -s -o /dev/null -w "%{http_code}\n" \
--        -H "apikey: $SUPABASE_ANON_KEY" \
--        "$URL/rest/v1/projects?select=*"
--    Expect: 200
--
-- b) Anonymous insert is refused:
--      curl -s -w "\n%{http_code}\n" -X POST \
--        -H "apikey: $SUPABASE_ANON_KEY" \
--        -H "Content-Type: application/json" \
--        -H "Prefer: return=representation" \
--        -d '{"title":"must not be created"}' \
--        "$URL/rest/v1/projects"
--    Expect: 401 (403 only if a logged-in user) mentioning row-level
--    security. NOT 201.
--
-- c) The admin list is not exposed:
--      curl -s -w "\n%{http_code}\n" \
--        -H "apikey: $SUPABASE_ANON_KEY" \
--        "$URL/rest/v1/admins?select=*"
--    Expect: 401 (403 only if a logged-in user) with
--    "permission denied for table admins".
--    A 200 with [] would mean the revoke on admins is missing.
--
-- d) is_admin() is not callable from the public:
--      curl -s -w "\n%{http_code}\n" -X POST \
--        -H "apikey: $SUPABASE_ANON_KEY" \
--        -H "Content-Type: application/json" \
--        "$URL/rest/v1/rpc/is_admin"
--    Expect: 401 (403 only if a logged-in user) with
--    "permission denied for function is_admin".


-- ============================================================
-- Supabase dashboard checklist
-- ============================================================
-- [ ] SQL Editor: schema.sql ran without errors
-- [ ] SQL Editor: sql/03_verify.sql checks 1-7 pass, check 8 errors
-- [ ] Database -> Tables: projects, skills, content, admins, RLS on all 4
-- [ ] Database -> Policies: 6 policies, none named "Auth ..."
-- [ ] Authentication -> Providers -> Google: enabled, client id + secret set
-- [ ] Authentication -> URL Configuration -> Redirect URLs:
--       http://localhost:5173/admin/dashboard
--       plus your production /admin/dashboard URL
-- [ ] Authentication -> Users: your account exists
-- [ ] SQL Editor: your user id inserted into public.admins
-- [ ] The public site shows About, Projects, Skills and Contact
-- [ ] The admin lets you save, and a second Google account cannot save
