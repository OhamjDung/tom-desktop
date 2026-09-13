create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_description text not null default '',
  description text not null default '',
  role text not null default '',
  year text not null default '',
  tags text[] not null default '{}',
  cover_image_url text not null default '',
  gallery_image_urls text[] not null default '{}',
  case_study_url text not null default '',
  live_url text not null default '',
  github_url text not null default '',
  featured boolean not null default false,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'published')),
  created_at timestamptz not null default now()
);
alter table public.projects enable row level security;
grant select on public.projects to anon, authenticated;
create policy "Visitors can read published projects"
  on public.projects for select to anon, authenticated
  using (status = 'published');
-- Project editing and image uploads stay in the Supabase dashboard.
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do nothing;
