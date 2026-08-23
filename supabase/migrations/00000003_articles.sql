create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  main_keyword text not null,
  title text not null,
  body text not null,
  tags jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists articles_user_id_created_at_idx
  on public.articles (user_id, created_at desc);

alter table public.articles enable row level security;

create policy "select own articles" on public.articles
  for select using (auth.uid() = user_id);
create policy "insert own articles" on public.articles
  for insert with check (auth.uid() = user_id);
create policy "delete own articles" on public.articles
  for delete using (auth.uid() = user_id);

grant select, insert, delete on public.articles to authenticated;
