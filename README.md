# Alaska 2026

A small planning board for our 16-day Alaska family trip, June 17 – July 2, 2026. Browse activity ideas, vote on what you want to do, leave comments, and pin things to specific days. For Brian, Mary, Ezra, Jack, Laura, and Eric — nobody else.

Built with Next.js 16 (App Router), Supabase (Postgres + Auth + Realtime), Tailwind CSS 4, and a few hand-rolled UI primitives over Radix UI.

## Running it locally

```bash
npm install
cp .env.local.example .env.local
# fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Open http://localhost:3000.

## First-time Supabase setup

You only do this once, before anyone signs in.

1. Create a new project at https://supabase.com (free tier is fine for six users).
2. In **Project Settings → API**, copy the **Project URL** and the **anon public** key into `.env.local`.
3. In the SQL Editor, run the two files in order:
   1. `supabase/migrations/0001_init.sql` — schema, helpers, RLS.
   2. `supabase/seed.sql` — six profiles and 27 starter activities.
4. **Update the placeholder emails.** Open `supabase/seed.sql` first (or run an UPDATE later) to set each adult's real email. The four adults each need a real address — the kids do not. Example:
   ```sql
   update profiles set email = 'brian.real@gmail.com' where name = 'Brian';
   update profiles set email = 'mary.real@gmail.com'  where name = 'Mary';
   update profiles set email = 'laura.real@gmail.com' where name = 'Laura';
   update profiles set email = 'eric.real@gmail.com'  where name = 'Eric';
   ```
5. In **Authentication → URL Configuration**, set:
   - **Site URL**: your production URL (e.g. `https://alaska-2026.vercel.app`)
   - **Additional Redirect URLs**: `http://localhost:3000/**`
6. In **Authentication → Providers → Email**, leave magic links enabled and turn **off** "Confirm email" (we trust the six of us). Set "Enable email signups" to **off** — we don't want randoms making accounts. We pre-seeded the profiles; the trigger in the migration links each adult auth user to its profile by email when they first sign in.
7. In **Database → Replication**, confirm Realtime is enabled for the `votes`, `comments`, `activities`, and `itinerary_items` tables (the migration already publishes them).

## How to invite the family

Each adult can sign in by entering their email on `/login` and clicking the magic link. The first time, Supabase will refuse if the email isn't a known auth user — so you need to **invite them first**:

1. In Supabase → **Authentication → Users**, click **Invite User** and enter each adult's real email.
2. They'll receive an invite link; clicking it creates the auth user, which our trigger links to the seeded profile.
3. From then on, they can sign in via magic link any time.

For the kids: there are no kid accounts. Their parents (Brian for Ezra and Jack) can switch "voting as" via the avatar menu in the top-right.

## How to add a new seed activity

Either:
- Suggest it from the running app (the form lives at `/suggest`); anyone can promote it from `/pending`.
- Or insert it via SQL:
  ```sql
  insert into activities (title, location, categories, description, dog_friendly, kid_friendly, indoor_option, status)
  values ('My new idea', 'cooper_landing', array['hike'], 'Description here.', 'yes', true, false, 'approved');
  ```

## How to add a new user

The site is hardcoded to the six of us, but if it ever needs to grow:

1. Insert a profile in `profiles` (name, email, household, role, display_color).
2. Invite the user via Supabase Auth.
3. The signup trigger will link them.

## How to swap in real photos

Each activity has a `photo_url` column. Until it's set, the card shows a stylized gradient with a category icon. Update with:

```sql
update activities
   set photo_url = 'https://images.unsplash.com/photo-XXX?w=1200&q=80'
 where title = 'Tony Knowles Coastal Trail';
```

## How to deploy

1. Push to GitHub.
2. Import the repo at https://vercel.com.
3. Add the two env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy. Vercel will give you a `https://alaska-2026-XXX.vercel.app` URL.
5. Update Supabase **Site URL** to match the deployed domain.

Subsequent deploys: push to `main` and Vercel auto-deploys.

## Tech notes

- **Auth model**: four adult magic-link accounts. Kids are managed profiles voted on behalf of by their parent via the top-right avatar menu. The "active profile" is stored in a cookie (`active_profile_id`) that's editable via `POST /auth/set-active`.
- **Realtime**: votes, comments, and itinerary changes propagate within ~1s via Supabase Realtime channels.
- **No drag-and-drop on the calendar yet** — assignment is via tap-to-add (works the same on mobile and desktop, and avoids most of the accessibility pitfalls of DnD). If we end up wanting drag-drop on the desktop view, `@dnd-kit` is already in `package.json`.
- **No dark mode**. The cream palette is the whole point.

## Throwing the site away

After July 2, 2026, archive or delete:
- The Vercel project
- The Supabase project
- The GitHub repo (or keep it as a souvenir)

The trip is the thing, not the website.
