-- Optional precise map location for an activity (used by the Google Maps embed).
-- Suggested activities can set this from the suggest form; seed activities use
-- the curated MAP_QUERIES list in the app, so this stays null for them.
alter table activities add column if not exists map_query text;
