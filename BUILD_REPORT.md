# Build Report — Alaska 2026 Family Trip Planner

A reference for what we built, how it works, and how to spin up a similar site for a different trip (e.g. a road trip / camping trip). Written so it can be handed to a fresh chat as a starting brief — see the last section, **"Starter brief for the next build."**

Live site: https://alaska-2026-five.vercel.app · Repo: https://github.com/ranger783-bg/alaska-2026

---

## 1. What it is

A private, mobile-first planning board for a 16-day family trip. Six people across two households browse a pre-seeded set of activity ideas, vote on each ("I'm in" / "Curious" / "Pass"), comment, suggest new ideas (which land in a review queue), pin activities to specific days on a 16-day calendar, and see a map + photo + info link for every activity. It is a **convergence tool**, not a booking system.

## 2. Tech stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16** (App Router) + **React 19** + **TypeScript** | Server Components by default; client components for interactivity |
| Styling | **Tailwind CSS 4** | CSS-based `@theme`, no `tailwind.config.js` |
| UI primitives | Hand-rolled over **Radix UI** (avatar, checkbox, dropdown-menu, label, select, tabs, slot) | `class-variance-authority` + `clsx` + `tailwind-merge`; `lucide-react` icons; `sonner` toasts |
| Backend | **Supabase** (Postgres + Auth + Realtime + Storage) | `@supabase/supabase-js`, `@supabase/ssr` |
| Maps | Keyless Google Maps embed iframe (`output=embed`) | No API key; per-activity location query |
| Hosting | **Vercel** | Manual `vercel --prod` deploys |
| Fonts | **Fraunces** (serif headings) + **Inter** (body) via `next/font` | |
| Installed but unused | `@dnd-kit/*` | Reserved for drag-and-drop itinerary; current itinerary is tap-to-add |

Palette: warm cream background, deep teal ("kenai"), alder green, coral accent, amber — editorial/"shared family doc" feel, not corporate SaaS. Light mode only.

## 3. App structure

```
src/
  app/
    layout.tsx                 # html/body, fonts, <Toaster>
    globals.css                # Tailwind 4 @theme tokens (palette, fonts)
    login/                     # magic-link sign-in (no nav)
    auth/
      callback/route.ts        # exchanges ?code / token_hash for a session
      logout/route.ts
      set-active/route.ts      # sets the "voting as" cookie
    (app)/                     # route group — everything behind auth, with nav
      layout.tsx               # requireSession() + <Nav> + pending count
      page.tsx + browse-client.tsx
      activities/[id]/page.tsx + vote-section.tsx + itinerary-button.tsx
      suggest/page.tsx + suggest-form.tsx
      pending/page.tsx + pending-list.tsx
      itinerary/page.tsx + itinerary-view.tsx
  components/
    nav.tsx                    # top bar + mobile bottom tab bar + profile switcher
    activity-card.tsx, activity-filters.tsx
    placeholder-image.tsx      # gradient + category icon when no photo
    map-embed.tsx              # Google Maps iframe ("Where it is")
    photo-picker.tsx           # paste URL or upload (camera roll/files), auto-downscale
    comment-thread.tsx         # 2-level threaded comments, realtime
    ui/                        # button, card, badge, input, textarea, label,
                               #   avatar, select, checkbox, dropdown-menu, tabs
  lib/
    types.ts                   # row types
    constants.ts               # trip days+lodging, categories, MAP_QUERIES, helpers
    utils.ts                   # cn(), initials(), cost/duration formatters
    auth.ts                    # getSession()/requireSession(), active-profile cookie
    supabase/{client,server,middleware}.ts
  proxy.ts                     # Next 16 middleware (renamed from middleware.ts)
supabase/
  migrations/0001_init.sql     # schema, enums, RLS, signup trigger, realtime
  migrations/0002_map_query.sql
  seed.sql                     # 6 profiles + 27 activities
  photos_and_links.sql         # photo_url + external_link for all 27
  storage_setup.sql            # activity-photos bucket + policies
```

Pattern: each page is a **Server Component** that fetches initial data with the SSR Supabase client, then hands it to a **Client Component** that subscribes to Supabase Realtime and handles mutations with optimistic updates.

## 4. Data model

Tables (all with RLS): `profiles`, `activities`, `votes`, `comments`, `itinerary_items`. Enums for role, dog_friendly, intensity, status, vote value, time_block.

- **profiles** — `id, auth_user_id, managed_by_id, email, name, role(adult|kid), household, display_color, avatar_url`. Kids have `managed_by_id` pointing to a parent and no `auth_user_id`.
- **activities** — `title, location, categories[], description, notes, photo_url, cost_low, cost_high, duration_hours, intensity, dog_friendly, kid_friendly, indoor_option, external_link, map_query, status(approved|pending|archived), submitted_by`.
- **votes** — PK `(profile_id, activity_id)`, `value`.
- **comments** — `activity_id, profile_id, parent_comment_id?, body` (max 2 levels enforced in UI).
- **itinerary_items** — `activity_id, trip_day, time_block, added_by`.

RLS: any authenticated user can read everything; writes (votes/comments/itinerary) are allowed only "as yourself or a kid you manage" via a `profile_is_mine()` SECURITY DEFINER helper. Realtime is published for votes, comments, activities, itinerary_items.

## 5. Auth model (the interesting part)

- **Invite-only magic links.** The 4 adults each have a real email. Supabase "Allow new users to sign up" is **off**; "Confirm email" **off**. Admin invites create the auth user.
- **A Postgres trigger** (`on_auth_user_created`) links each new auth user to its pre-seeded profile **by matching email**, so signing in "becomes" the right person with their color/household.
- **Managed kid profiles.** Ezra and Jack have no accounts; their parent switches "voting as Ezra/Jack" from the top-right avatar menu. The active profile is stored in a non-HTTP-only cookie (`active_profile_id`) set via `POST /auth/set-active`; all mutations use that profile id (which must pass the `profile_is_mine` RLS check).
- **Session plumbing** in `proxy.ts` (Next 16's renamed middleware) refreshes the Supabase session on every request and redirects unauthenticated users to `/login`.

## 6. Feature list

- **Browse + filter**: card grid, quick-chips + an expandable filter panel (location, category, dog-friendly, kid-friendly, indoor option, intensity, cost ceiling). Consensus badge when all adults are "in".
- **Vote**: 3-way (In/Curious/Pass) with avatars, realtime tally, optimistic updates.
- **Comments**: threaded (2 levels), realtime, delete-own.
- **Suggest**: full form → lands in `pending` queue. Optional photo (URL or upload) and map location.
- **Pending review**: anyone can promote to the board or archive; can attach/replace a photo before promoting.
- **Itinerary**: 16-day grid with lodging anchors; tap-to-add activities to days; tentative days shown dashed/amber; realtime.
- **Maps**: every detail page embeds a Google map centered on a curated per-activity location query, with "Open in Maps."
- **Photos**: 27 seed activities use verified Wikimedia Commons images; suggestions/pending can use a pasted URL or an uploaded file (camera roll on mobile), auto-downscaled to ≤1600px and stored in Supabase Storage.

## 7. External setup (one-time, done in dashboards)

- **Supabase project**: run `migrations/0001_init.sql` → `seed.sql` → set real adult emails → `migrations/0002_map_query.sql` → `photos_and_links.sql` → `storage_setup.sql`. Auth config: email provider on, confirm-email off, signups off, Site URL = prod URL, redirect URLs include localhost + prod + Vercel preview wildcard.
- **Email**: built-in Supabase email is rate-limited (~4/hr) → configured **custom Gmail SMTP** (smtp.gmail.com:587, a Google **App Password**, requires 2FA on the Google account).
- **Storage**: public `activity-photos` bucket, image-only, 10 MB cap.
- **GitHub**: public repo. **Vercel**: env vars `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Deploy workflow (GitHub→Vercel auto-deploy was **not** wired up): `git commit && git push && vercel --prod --yes`.

## 8. Gotchas / lessons learned (save yourself the pain)

1. **Node wasn't installed** on the machine — installed Node 20+ via winget first.
2. **Next 16 renamed `middleware.ts` → `proxy.ts`** (`export function proxy`). The old name only warns, but use the new one.
3. **Tailwind 4 + variable fonts**: can't pass both `weight` and `axes` to a `next/font` variable font (Fraunces) — drop `weight`.
4. **Keep DB column names and TS types in lockstep** (we briefly had `user_id` in types vs `profile_id` in SQL → build error).
5. **Invite/magic-link callback**: Supabase may redirect to the Site URL **root** with `?code=`, not your `/auth/callback`. Add middleware that forwards any stray `?code=` to the callback. Also, with invite-only + confirm-email, an invited user who hits `/login` directly before accepting can get "Signups not allowed" — **force-confirm** them with `update auth.users set email_confirmed_at = now() where email = …`.
6. **Email rate limits**: don't rely on Supabase's built-in mailer for real invites; wire up Gmail/Resend SMTP early.
7. **Don't hotlink signed/CDN image URLs** (e.g. Atlas Obscura's `imgproxy` links) — they 403 outside the origin site. Use **Wikimedia Commons** (hotlink-safe, CC/PD) or your own Supabase Storage. Verify each image actually returns `200 image/*` before trusting it.
8. **Keyless Google Maps embed** (`https://www.google.com/maps?q=QUERY&output=embed`) works with no API key; upgrade to the official Embed API (needs a key) or OpenStreetMap if it ever misbehaves.
9. **Long opaque URLs are easy to mistype** — verify by fetching or by md5-comparing DB value vs source, don't eyeball.

## 9. Starter brief for the next build (road trip / camping trip)

> Paste the block below into a new chat to kick off the variant. Fill in the brackets.

---

**Build a private, mobile-first trip-planning website for [my mother]'s summer road trip / camping trip.** Same architecture and stack as my Alaska 2026 planner (Next.js 16 App Router + TypeScript, Tailwind 4, Supabase for Postgres/Auth/Realtime/Storage, hand-rolled UI over Radix + lucide + sonner, deployed on Vercel, invite-only magic-link auth). Reuse all the patterns from that build; this is a sibling project.

**Trip specifics:** [route/region, dates, who's going, vehicle (car/RV/tent), any fixed campground reservations].

**What's the same:** browse + filter cards, 3-way voting with avatars, threaded comments, suggest→pending→promote flow, photos (Wikimedia/URL/upload), a Google Maps embed per stop, realtime updates, magic-link invite-only auth with the email-matching profile trigger.

**What's different for a road trip — please adapt:**
- Model entries as **stops along a route** rather than activities at fixed bases. Add an **ordered, day-by-day itinerary** with **drive time / distance from the previous stop**, and an **overview map showing the whole route** (multiple markers / a directions embed), not just one map per stop.
- Categories suited to road/camping: **campground, hike, scenic drive, roadside attraction, food, gas/charging, lodging, rest stop, swimming/water**.
- Per-stop fields worth adding: **reservation required?**, **max RV length / tent vs RV**, **hookups (water/electric/sewer)**, **cell signal**, **pet rules**, **cost/night**, **nearest town**.
- Seed it with [N] candidate stops along the route, each with a photo, a map location, and an official/park link (NPS, state parks, fws.gov, recreation.gov).
- Keep it dog-friendly-aware and kid-friendly-aware if relevant.

**Setup notes from last time:** install Node first if missing; use `proxy.ts` not `middleware.ts`; wire custom SMTP (Gmail App Password) for invites to avoid rate limits; use hotlink-safe images (Wikimedia/Storage), not signed CDN URLs; deploy with `vercel --prod` (GitHub auto-deploy optional).

---

*Generated 2026-05-26. Source project: alaska-2026.*
