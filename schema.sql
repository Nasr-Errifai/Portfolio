-- Run this in Supabase SQL Editor (https://supabase.com/dashboard/project/oikjxuwedowzvcsqokxo/sql/new)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Projects table
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text not null default '',
  tech text[] default '{}',
  image text default '',
  live_url text default '',
  repo_url text default '',
  created_at timestamptz default now()
);

-- Skills table
create table if not exists skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  category text not null default 'Other',
  created_at timestamptz default now()
);

-- Content table (about + contact combined)
create table if not exists content (
  id uuid primary key default uuid_generate_v4(),
  bio text default '',
  photo_url text default '',
  email text default '',
  github text default '',
  linkedin text default '',
  resume_url text default '',
  message text default '',
  created_at timestamptz default now()
);

-- Insert initial empty row
insert into content (bio) values ('') on conflict do nothing;

-- Enable Row Level Security
alter table projects enable row level security;
alter table skills enable row level security;
alter table content enable row level security;

-- Allow public read access
create policy "Public read projects" on projects for select using (true);
create policy "Public read skills" on skills for select using (true);
create policy "Public read content" on content for select using (true);

-- Allow authenticated users (you) full access
create policy "Auth insert projects" on projects for insert with check (auth.role() = 'authenticated');
create policy "Auth update projects" on projects for update using (auth.role() = 'authenticated');
create policy "Auth delete projects" on projects for delete using (auth.role() = 'authenticated');

create policy "Auth insert skills" on skills for insert with check (auth.role() = 'authenticated');
create policy "Auth update skills" on skills for update using (auth.role() = 'authenticated');
create policy "Auth delete skills" on skills for delete using (auth.role() = 'authenticated');

create policy "Auth insert content" on content for insert with check (auth.role() = 'authenticated');
create policy "Auth update content" on content for update using (auth.role() = 'authenticated');
create policy "Auth delete content" on content for delete using (auth.role() = 'authenticated');
