alter table public.user_settings
  add column if not exists sponsor_disclosure text not null default '',
  add column if not exists bridge_url_template text not null default '';
