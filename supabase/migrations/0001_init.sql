-- Alaska 2026 trip planner schema
-- Six users, twenty-seven seed activities, votes, comments, itinerary.

set search_path = public;

-- ---------- Enums ----------
create type user_role as enum ('adult', 'kid');
create type dog_friendly as enum ('yes', 'no', 'maybe');
create type intensity as enum ('easy', 'moderate', 'strenuous');
create type activity_status as enum ('approved', 'pending', 'archived');
create type vote_value as enum ('in', 'curious', 'pass');
create type time_block as enum ('morning', 'afternoon', 'evening', 'all_day');

-- ---------- Tables ----------
create table profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  managed_by_id uuid references profiles(id) on delete set null,
  email text unique,
  name text not null,
  role user_role not null default 'adult',
  household text not null check (household in ('co', 'ak')),
  display_color text not null default '#0E5E63',
  avatar_url text,
  created_at timestamptz not null default now()
);

create table activities (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text not null,
  categories text[] not null default '{}',
  description text not null,
  notes text,
  photo_url text,
  cost_low integer,
  cost_high integer,
  duration_hours numeric(4,1),
  intensity intensity not null default 'easy',
  dog_friendly dog_friendly not null default 'maybe',
  kid_friendly boolean not null default true,
  indoor_option boolean not null default false,
  external_link text,
  status activity_status not null default 'approved',
  submitted_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index activities_status_idx on activities(status);
create index activities_location_idx on activities(location);

create table votes (
  profile_id uuid not null references profiles(id) on delete cascade,
  activity_id uuid not null references activities(id) on delete cascade,
  value vote_value not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (profile_id, activity_id)
);

create index votes_activity_idx on votes(activity_id);

create table comments (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  parent_comment_id uuid references comments(id) on delete cascade,
  body text not null check (length(trim(body)) > 0 and length(body) <= 4000),
  created_at timestamptz not null default now()
);

create index comments_activity_idx on comments(activity_id, created_at);

create table itinerary_items (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references activities(id) on delete cascade,
  trip_day date not null check (trip_day between '2026-06-17' and '2026-07-02'),
  time_block time_block not null default 'all_day',
  added_by uuid not null references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (activity_id, trip_day, time_block)
);

create index itinerary_day_idx on itinerary_items(trip_day);

-- ---------- Helpers ----------
create or replace function public.my_profile_id() returns uuid
  language sql stable security definer set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.profile_is_mine(p_id uuid) returns boolean
  language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles me
    where me.auth_user_id = auth.uid()
    and (me.id = p_id or p_id in (
      select k.id from public.profiles k where k.managed_by_id = me.id
    ))
  );
$$;

-- Link existing seeded profile by email when an adult signs in for the first time.
create or replace function public.handle_new_auth_user() returns trigger
  language plpgsql security definer set search_path = public
as $$
begin
  update public.profiles
     set auth_user_id = new.id
   where email = new.email
     and auth_user_id is null;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- ---------- RLS ----------
alter table profiles enable row level security;
alter table activities enable row level security;
alter table votes enable row level security;
alter table comments enable row level security;
alter table itinerary_items enable row level security;

-- profiles: all authenticated users can read; nobody writes via the API (seed handles it).
create policy "profiles read all authed" on profiles
  for select using (auth.role() = 'authenticated');

create policy "profiles update own avatar" on profiles
  for update using (auth_user_id = auth.uid())
  with check (auth_user_id = auth.uid());

-- activities: all authed can read approved & pending; insert as self.
create policy "activities read all authed" on activities
  for select using (auth.role() = 'authenticated');

create policy "activities insert as me" on activities
  for insert with check (
    auth.role() = 'authenticated'
    and submitted_by = public.my_profile_id()
  );

create policy "activities promote pending" on activities
  for update using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- votes: read all, write as self or managed kid.
create policy "votes read all authed" on votes
  for select using (auth.role() = 'authenticated');

create policy "votes insert as me" on votes
  for insert with check (public.profile_is_mine(profile_id));

create policy "votes update as me" on votes
  for update using (public.profile_is_mine(profile_id))
  with check (public.profile_is_mine(profile_id));

create policy "votes delete as me" on votes
  for delete using (public.profile_is_mine(profile_id));

-- comments: read all, write as self or managed kid, only edit/delete own.
create policy "comments read all authed" on comments
  for select using (auth.role() = 'authenticated');

create policy "comments insert as me" on comments
  for insert with check (public.profile_is_mine(profile_id));

create policy "comments delete own" on comments
  for delete using (public.profile_is_mine(profile_id));

-- itinerary: trusted group of six — any authed user can read & write.
create policy "itinerary read all authed" on itinerary_items
  for select using (auth.role() = 'authenticated');

create policy "itinerary insert as me" on itinerary_items
  for insert with check (public.profile_is_mine(added_by));

create policy "itinerary delete authed" on itinerary_items
  for delete using (auth.role() = 'authenticated');

-- ---------- Realtime ----------
-- Realtime is published per-table in Supabase Studio. The SQL below ensures full row payloads.
alter publication supabase_realtime add table votes;
alter publication supabase_realtime add table comments;
alter publication supabase_realtime add table activities;
alter publication supabase_realtime add table itinerary_items;
