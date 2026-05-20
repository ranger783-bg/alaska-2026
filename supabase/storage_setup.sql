-- One-time setup for activity photo uploads (camera roll / file picker).
-- Creates a public "activity-photos" bucket and policies so any signed-in
-- family member can upload and everyone can view. Safe to re-run.

insert into storage.buckets (id, name, public)
values ('activity-photos', 'activity-photos', true)
on conflict (id) do nothing;

-- Limit to images, 10 MB max (the app also downscales before upload).
update storage.buckets
   set file_size_limit = 10485760,
       allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
 where id = 'activity-photos';

do $$
begin
  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'authed upload activity photos'
  ) then
    create policy "authed upload activity photos"
      on storage.objects for insert to authenticated
      with check (bucket_id = 'activity-photos');
  end if;

  if not exists (
    select 1 from pg_policies
     where schemaname = 'storage' and tablename = 'objects'
       and policyname = 'public read activity photos'
  ) then
    create policy "public read activity photos"
      on storage.objects for select
      using (bucket_id = 'activity-photos');
  end if;
end $$;
