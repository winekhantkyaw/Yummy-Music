create table if not exists public.user_music_library (
  user_id uuid primary key references auth.users (id) on delete cascade,
  favorites jsonb not null default '[]'::jsonb,
  history jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_music_library enable row level security;

drop policy if exists "Users can manage their own music library" on public.user_music_library;
create policy "Users can manage their own music library"
  on public.user_music_library
  for all
  to authenticated
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

grant select, insert, update on public.user_music_library to authenticated;
