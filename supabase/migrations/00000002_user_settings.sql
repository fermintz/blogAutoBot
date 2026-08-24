create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  api_key_encrypted bytea,
  topic text not null default 'restaurant',
  business_info_by_topic jsonb not null default '{}'::jsonb,
  body_templates jsonb not null default '{}'::jsonb,
  writing_rules text not null default '',
  tone text not null default 'friendly',
  length text not null default 'standard',
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "select own settings" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "insert own settings" on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy "update own settings" on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

grant select, insert, update on public.user_settings to authenticated;

-- API 키는 반드시 이 세 함수를 통해서만 쓰고 읽는다 (평문 컬럼 직접 접근 없음)
create or replace function public.set_encrypted_api_key(p_api_key text, p_secret text)
returns void
language sql
security invoker
as $$
  insert into public.user_settings (user_id, api_key_encrypted, updated_at)
  values (auth.uid(), pgp_sym_encrypt(p_api_key, p_secret), now())
  on conflict (user_id) do update
    set api_key_encrypted = excluded.api_key_encrypted,
        updated_at = now();
$$;

create or replace function public.get_decrypted_api_key(p_secret text)
returns text
language sql
security invoker
stable
as $$
  select pgp_sym_decrypt(user_settings.api_key_encrypted, p_secret)
  from public.user_settings
  where user_settings.user_id = auth.uid();
$$;

create or replace function public.clear_api_key()
returns void
language sql
security invoker
as $$
  update public.user_settings set api_key_encrypted = null, updated_at = now()
  where user_id = auth.uid();
$$;

grant execute on function public.set_encrypted_api_key(text, text) to authenticated;
grant execute on function public.get_decrypted_api_key(text) to authenticated;
grant execute on function public.clear_api_key() to authenticated;
