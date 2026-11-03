-- Run once in Supabase → SQL Editor.
-- Creates a public bucket for listing photos so images are served from storage
-- (fast, cached, CDN) instead of being stored as base64 text inside the rows.

insert into storage.buckets (id, name, public)
values ('item-photos', 'item-photos', true)
on conflict (id) do nothing;

-- Anyone can view photos (listings are public to members).
drop policy if exists "item_photos_public_read" on storage.objects;
create policy "item_photos_public_read" on storage.objects
  for select to public
  using (bucket_id = 'item-photos');

-- Signed-in members can upload.
drop policy if exists "item_photos_auth_insert" on storage.objects;
create policy "item_photos_auth_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'item-photos');

-- Signed-in members can replace / remove photos in this bucket.
drop policy if exists "item_photos_auth_update" on storage.objects;
create policy "item_photos_auth_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'item-photos');

drop policy if exists "item_photos_auth_delete" on storage.objects;
create policy "item_photos_auth_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'item-photos');
