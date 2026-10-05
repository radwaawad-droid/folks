-- Run this once in Supabase → SQL Editor.
-- Adds username support for the new username/password sign-up.

alter table public.profiles add column if not exists username text unique;

-- Let a signed-in user create/update their OWN profile row (needed at sign-up).
drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- Anyone signed in can read profiles (public reputation / names on listings).
drop policy if exists profiles_read on public.profiles;
create policy profiles_read on public.profiles
  for select to anon, authenticated using (true);

-- Let the public browse available listings without logging in.
drop policy if exists items_read on public.items;
create policy items_read on public.items
  for select to anon, authenticated
  using (status = 'available' or owner_id = auth.uid());
