# AGENTS.md: Portfolio (Nasr Errifai)

## Goal
My personal portfolio with an admin dashboard. I'm a 4th-year software engineering student at EMSI (Morocco), looking for an internship. The site must be fast, secure, accessible and professional.
Explain your plans and summaries in simple English, with short sentences.

## Stack
React 19 + Vite, Tailwind CSS 4, react-router-dom 7, framer-motion, react-icons, Supabase (Postgres + RLS, Google login, Storage). JavaScript only. Lint: oxlint.

## Project map
- src/pages/Home.jsx + src/components/ → the public one-page site (Hero, About, Projects, Skills, Contact, Footer)
- src/admin/ → the admin under /admin (lazy-loaded), Google login, access checked with rpc("is_admin")
- src/lib/query.js → run(context, fn): the only way to call Supabase (checks `error`, returns { ok, data, error, count })
- src/supabase.js → the client, from VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (.env.local)
- schema.sql + sql/NN_*.sql → schema, RLS policies and migrations. I run them myself in the Supabase SQL Editor.

## Workflow
1. One phase at a time, one step at a time (see Roadmap).
2. Plan first: read the code (use @explore to search), then give me a short plan (files, what, why, risks) and wait for my OK. Don't edit files before my OK.
3. Then, in this order:
   - write the code
   - run npm run build and npm run lint (0 errors)
   - ask @reviewer to review the changes, and fix the important problems
   - make one commit (feat:, fix:, refactor:, docs:, chore:)
   - give me a short summary and tell me how I can test it
4. At the end of a phase, after my OK: tick the boxes in the Roadmap below, then git push.
5. Always tell me exactly what I must do by hand (SQL to run, Supabase or Vercel settings, environment variables).
6. Never add a dependency without asking. Don't touch files that are not part of the step.
7. If something is unclear, ask me one question instead of guessing.

## Skills: load the matching skill before you start a task
- supabase → anything with Supabase: auth, RLS policies, Storage, migrations, Supabase errors.
- supabase-postgres-best-practices → writing or reviewing SQL, tables, constraints, indexes, RLS.
- vercel-react-best-practices → writing or reviewing React components, hooks and data fetching. This is a Vite SPA, so skip the Next.js and server-only rules.
- web-design-guidelines → after every UI change: check accessibility, focus, forms, images and motion, and fix the important findings.
- frontend-design → only for design work (Phase 5, or when I ask). Propose a design plan first and wait for my OK.

## MCP tools: use them when they are connected
- supabase (read-only): look at tables, policies and data, and run the verification queries yourself. Never try to change the database; write SQL files for me instead.
- playwright: ask me to start npm run dev in another terminal. Then open http://localhost:5173, take screenshots at 1280px and 390px wide after UI changes, and check the console for errors.
- context7: check the current docs (React 19, Vite, Tailwind CSS 4, supabase-js, react-router 7) before using an API you're not sure about.

## Rules
Security:
- Never put the service_role / secret key in the frontend or in Git. Never commit .env.local.
- Every table has RLS. Public read only when needed. Writes only when public.is_admin() is true. The only exception is the contact form insert in Phase 5.
- New SQL goes in a new numbered file in sql/ (02_, 03_...), in one transaction, safe to run twice. schema.sql always shows the final state for a fresh install.

Code:
- Every Supabase call goes through run().
- Visitors never see technical errors or admin hints. The admin shows the real error.
- Every data screen handles 4 states: loading, error, empty, data.
- Keep the current design until Phase 5. Small, readable components, no dead code.

Content:
- Never invent facts about me (projects, dates, jobs, grades, skills). Ask me, and write TODO where something is missing.
- My main projects: EventsMa (events + QR-code tickets, https://github.com/Nasr-Errifai/EventsMa) and Hirelink.

## Roadmap
### Phase 1: Finish the fixes
- [x] 1. Error handling everywhere (commit 99359a0)
- [ ] 2. content table = exactly one row (sql/02, id = 1, upsert)
- [ ] 3. Load data once (src/data/usePortfolioData.js); the navbar shows only visible sections (empty sections are already hidden)
- [ ] 4. ProjectsManager sends only real columns; link and email validation; "Saving..." state (ContactEditor is already fixed)
- [ ] 5. AuthProvider + one guard + AdminShell (Sidebar + <Outlet />)
- [ ] 6. schema.sql = final state
- [ ] 7. Verification (SQL checks, curl RLS test, manual tests) + Supabase dashboard checklist

### Phase 2: Projects
- [ ] Storage bucket "portfolio" + uploads (project images, photo, CV)
- [ ] New project columns: slug, summary, content (Markdown), role, dates, status, gallery, featured, sort_order, published
- [ ] /projects/:slug page (react-markdown) + admin form for the new fields
- [ ] Write the EventsMa and Hirelink case studies with me

### Phase 3: About me
- [ ] Editable hero (headline, tagline, location, open to work, CV button)
- [ ] Experience & education timeline (table + admin page + section)
- [ ] Write the hero text, bio and experience with me

### Phase 4: Put it online
- [ ] Vercel (vercel.json rewrites, environment variables), Supabase redirect URLs, custom domain
- [ ] Favicon, og:image, meta tags, sitemap.xml, robots.txt, README
- [ ] GitHub Action: daily Supabase keep-alive
- [ ] Final check with web-design-guidelines + Lighthouse on mobile

### Phase 5: Extras
- [ ] Contact form + messages inbox in the admin
- [ ] French / English (react-i18next + _fr columns)
- [ ] New design with frontend-design: plan → my OK → build → check with screenshots
