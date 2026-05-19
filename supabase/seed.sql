-- Alaska 2026 seed data: 6 profiles + 27 activities.
-- After running migrations, run this once to populate the planner.

set search_path = public;

-- ---------- Profiles ----------
-- IMPORTANT: replace the placeholder emails with real ones before sending invites.
-- Adults need a real email so the magic-link sign-in finds them.
-- Kids do not get auth accounts; an adult votes on their behalf.

insert into profiles (id, email, name, role, household, display_color, managed_by_id)
values
  ('11111111-1111-1111-1111-000000000001', 'brian@example.com',  'Brian', 'adult', 'co', '#0E5E63', null),
  ('11111111-1111-1111-1111-000000000002', 'mary@example.com',   'Mary',  'adult', 'co', '#5A7C5A', null),
  ('11111111-1111-1111-1111-000000000003', null,                 'Ezra',  'kid',   'co', '#D9A14B',
    '11111111-1111-1111-1111-000000000001'),
  ('11111111-1111-1111-1111-000000000004', null,                 'Jack',  'kid',   'co', '#E8775A',
    '11111111-1111-1111-1111-000000000001'),
  ('11111111-1111-1111-1111-000000000005', 'laura@example.com',  'Laura', 'adult', 'ak', '#6E558C', null),
  ('11111111-1111-1111-1111-000000000006', 'eric@example.com',   'Eric',  'adult', 'ak', '#A35E3D', null)
on conflict (id) do nothing;

-- ---------- Activities ----------
-- 27 seeded options across Anchorage, Homer, Cooper Landing, and the wider Kenai Peninsula.

insert into activities (
  title, location, categories, description, notes,
  cost_low, cost_high, duration_hours, intensity,
  dog_friendly, kid_friendly, indoor_option, external_link, status
) values

-- Anchorage (7)
(
  'Anchorage Summer Solstice Festival', 'anchorage',
  array['culture','town'],
  'Free street festival downtown celebrating the longest day of the year. Live music, food trucks, vendors, and the rare chance to be outside at midnight in full sunlight.',
  'Falls on Sunday, June 21, 2026. Crowds peak mid-afternoon — go earlier with the kids and shorter for the dog.',
  0, 0, 4, 'easy', 'no', true, false, 'https://www.anchoragedowntown.org/events', 'approved'
),
(
  'Tony Knowles Coastal Trail', 'anchorage',
  array['outdoors','scenic'],
  '11-mile paved trail along Cook Inlet from downtown to Kincaid Park. Moose sightings common. Best by bike for distance, or pick a 2-3 mile out-and-back for an easy walk.',
  'Bike rental available at Pablo''s Bicycle Rentals near the trailhead. Dog welcome on leash.',
  0, 40, 3, 'easy', 'yes', true, false, null, 'approved'
),
(
  'Anchorage Museum', 'anchorage',
  array['culture'],
  'Alaska Native art, state history, science exhibits, and a planetarium. Great rainy-day option and a strong primer on what we''ll see on the road.',
  null, 25, 25, 3, 'easy', 'no', true, true, 'https://www.anchoragemuseum.org/', 'approved'
),
(
  'Alaska Native Heritage Center', 'anchorage',
  array['culture','outdoors'],
  'Dance performances, traditional dwellings from each major Alaska Native group around a lake, and storytelling. Worth a half-day if culture is a priority.',
  null, 30, 30, 3, 'easy', 'no', true, false, 'https://alaskanative.net/', 'approved'
),
(
  'Flattop Mountain hike', 'anchorage',
  array['hike','outdoors','scenic'],
  'Most-climbed mountain in Alaska. ~1.5 miles each way with a steep, scrambly final push. Panoramic views of the Chugach Range, Cook Inlet, and on a clear day Denali.',
  'Skip this with the dog — too steep for a recovering amputee. Could split: two adults summit while the dog stays at the trailhead picnic area.',
  5, 5, 3, 'moderate', 'maybe', true, false, null, 'approved'
),
(
  'Earthquake Park', 'anchorage',
  array['outdoors','culture'],
  'Short paved walk explaining how the 1964 Good Friday earthquake reshaped this stretch of bluff. Interpretive signs, sweeping inlet views.',
  null, 0, 0, 1, 'easy', 'yes', true, false, null, 'approved'
),
(
  'Potter Marsh boardwalk', 'anchorage',
  array['wildlife','outdoors'],
  'Accessible boardwalk over a wetland just south of town. Moose, spawning salmon, eagles, ducks. Short, no elevation, lots to point at — kid-perfect.',
  null, 0, 0, 1, 'easy', 'yes', true, false, null, 'approved'
),

-- Homer (11)
(
  'Halibut charter (Homer Harbor)', 'homer',
  array['fishing','water'],
  'Half- or full-day charter out of Homer Harbor. Halibut up to 100+ lbs are common; smaller ''chicken halibut'' are easier eating. Operators clean and bag your catch.',
  'Most charters require kids be at least 6 and decent on a boat. Jack is too young. Adults-only day with the kids at Bishop''s Beach is the obvious move.',
  275, 400, 8, 'moderate', 'no', false, false, null, 'approved'
),
(
  'Kachemak Bay via water taxi', 'homer',
  array['hike','outdoors','scenic','water'],
  'Water taxi drops you across Kachemak Bay at Glacier Spit, Grewingk Glacier trail, or Halibut Cove. A few miles of hiking, beach time, and a return pickup on a fixed schedule. The Grewingk Glacier Lake hike is the classic family-friendly pick.',
  'Mako''s Water Taxi is dog-friendly; some operators are not. Confirm before booking. Ezra would handle Grewingk; Jack may struggle on the steeper variants.',
  110, 140, 8, 'moderate', 'maybe', true, false, null, 'approved'
),
(
  'Bishop''s Beach', 'homer',
  array['outdoors','town','scenic'],
  'Long pebble beach in old town Homer. Tides recede dramatically — beachcombing for sea glass and shells, dogs running, kids throwing rocks. Free, drop-in, low-effort.',
  null, 0, 0, 2, 'easy', 'yes', true, false, null, 'approved'
),
(
  'Homer Spit', 'homer',
  array['town','food','scenic'],
  'The 4.5-mile sand spit jutting into Kachemak Bay. Restaurants, shops, fishing charters, the Salty Dawg Saloon, ice cream. Touristy in the good way.',
  'Sidewalks and beach are dog-fine, shops vary. Watch kids near the harbor edges.',
  0, 50, 3, 'easy', 'yes', true, false, null, 'approved'
),
(
  'Pratt Museum', 'homer',
  array['culture'],
  'Local history and natural history of the Kachemak Bay region. Marine-mammal skeletons, Alaska Native exhibits, a saltwater aquarium. Solid rainy-day backup.',
  null, 12, 15, 2, 'easy', 'no', true, true, 'https://www.prattmuseum.org/', 'approved'
),
(
  'Bunnell Street Arts Center & Old Town galleries', 'homer',
  array['culture','town'],
  'Compact gallery walk in old town Homer. Bunnell Street, Ptarmigan Arts, several smaller studios. Free to browse; purchases optional.',
  null, 0, 0, 2, 'easy', 'maybe', true, true, 'https://www.bunnellarts.org/', 'approved'
),
(
  'Homer Brewing / Grace Ridge Brewing', 'homer',
  array['food','town'],
  'Two small breweries on the same side of town. Dog-friendly patios in summer, food trucks usually parked outside. Adults-leaning experience while a kid wanders.',
  null, 15, 30, 2, 'easy', 'yes', true, false, null, 'approved'
),
(
  'Seldovia day trip via ferry', 'homer',
  array['town','water','scenic'],
  'Small fishing village across Kachemak Bay, reachable only by water or air. Ferry runs ~45 min each way. Walkable, quaint, has a famous old-town boardwalk. Full-day commitment.',
  null, 50, 75, 8, 'easy', 'yes', true, false, null, 'approved'
),
(
  'Lake Clark bear viewing flight', 'homer',
  array['wildlife','water','scenic'],
  'Bush plane to Lake Clark or Katmai for guided brown-bear viewing on the salmon streams. The premium Alaska experience. Half- or full-day. Weather-dependent.',
  'Most operators require kids be 8+. Jack and possibly Ezra are too young. Could be a split-day for the four adults.',
  750, 1000, 8, 'easy', 'no', false, false, null, 'approved'
),
(
  'Center for Alaskan Coastal Studies tidepool tour', 'homer',
  array['wildlife','water','outdoors'],
  'Guided tide-pool tour at the Peterson Bay Field Station across Kachemak Bay. Boat there at low tide, walk the rocks with a naturalist, learn what''s living in the intertidal zone. Kid-magnet.',
  null, 130, 180, 6, 'easy', 'no', true, false, 'https://akcoastalstudies.org/', 'approved'
),
(
  'Bald eagle viewing on the Spit', 'homer',
  array['wildlife','town'],
  'Walk to the end of the Spit on a sunny evening and you''ll see eagles patrolling for fish scraps near the cleaning stations. Free, walk-up, 30 minutes if you''re just looking.',
  null, 0, 0, 1, 'easy', 'yes', true, false, null, 'approved'
),

-- Cooper Landing / Kenai Peninsula (9)
(
  'Russian River sockeye fishing', 'cooper_landing',
  array['fishing','water','outdoors'],
  'Peak sockeye run is typically late June into early July — perfect timing. Combat fishing crowds on the bank, or hire a guide for a calmer experience. The ''Russian River flip'' is its own technique to learn.',
  'Heavy bear traffic on the banks during the run. Not a place to bring a recovering dog or younger kids. Adults-only.',
  25, 250, 6, 'moderate', 'no', false, false, null, 'approved'
),
(
  'Kenai River drift trip with guide', 'cooper_landing',
  array['water','scenic','fishing'],
  '4–6 hour float in a guided raft on the upper Kenai. Pick a scenic-only trip or a fishing-focused one. Otters, eagles, sometimes bears on the bank. Calm enough for older kids.',
  'Most guides take kids 6+. Ezra would be borderline; Jack too young.',
  110, 200, 5, 'easy', 'no', true, false, null, 'approved'
),
(
  'Russian River Falls hike', 'cooper_landing',
  array['hike','wildlife','scenic'],
  '~5 miles round-trip on a mostly-boardwalk trail to a viewing platform over the falls. During the run, hundreds of sockeye visibly leap up. Easy footing, gradual climb.',
  'Active bear country during the salmon run. Make noise, travel in a group, carry spray. Leash the dog and keep her close.',
  5, 5, 3, 'easy', 'yes', true, false, null, 'approved'
),
(
  'Resurrection Pass Trail', 'cooper_landing',
  array['hike','outdoors','scenic'],
  '39-mile thru-hike from Hope to Cooper Landing, or punch in for a 4-8 mile day hike from the Cooper Landing trailhead. The full thru is a serious commitment; the day-hike portion is a stunning sample.',
  'Day-hike version is fine with kids; the thru is adults only.',
  0, 0, 6, 'strenuous', 'yes', true, false, null, 'approved'
),
(
  'Crescent Creek / Crescent Lake trail', 'cooper_landing',
  array['hike','scenic'],
  '6.4 miles out-and-back to a high alpine lake. Steady moderate climb through birch and spruce, opens to a glacier-cut bowl at the top. Pack a lunch — the lake is the point.',
  'Ezra could probably do this with breaks; Jack would need to be carried for most of it.',
  0, 0, 5, 'moderate', 'yes', true, false, null, 'approved'
),
(
  'Kenai Lake', 'cooper_landing',
  array['scenic','water'],
  'Glacier-fed lake right next to the Russian River House. Astonishing milky-blue color. Paddle if you can borrow a SUP or kayak, photo stop otherwise. Swimming is technically possible — water hovers around 40°F.',
  null, 0, 0, 1, 'easy', 'yes', true, false, null, 'approved'
),
(
  'Cooper Landing Museum', 'cooper_landing',
  array['culture'],
  'Small, sweet local history museum. 30–45 minutes, max. Worth it on a rainy morning while you wait out weather. Donation-based.',
  null, 0, 5, 1, 'easy', 'no', true, true, null, 'approved'
),
(
  'Alaska Horsemen Trail Adventures', 'cooper_landing',
  array['outdoors','scenic'],
  'Guided trail rides from a couple of hours to a half-day. Operators usually have a short kid-appropriate option. Ezra at 6 would likely qualify for the family ride.',
  'Confirm the minimum age for each ride length when booking.',
  100, 200, 3, 'easy', 'no', true, false, 'https://alaskahorsemen.com/', 'approved'
),
(
  'Hidden Lake / Skilak Lake Loop', 'kenai_peninsula',
  array['scenic','wildlife','outdoors'],
  'Scenic driving loop through the Kenai NWR with several pullouts: Hidden Lake, Skilak Lake overlook, Bear Mountain Trail. Easy windshield wildlife: moose, sometimes brown bear, lots of waterfowl.',
  null, 0, 0, 4, 'easy', 'yes', true, false, null, 'approved'
)
on conflict do nothing;
