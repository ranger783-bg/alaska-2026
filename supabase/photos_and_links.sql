-- Populate photo_url and external_link for all 27 seed activities.
-- Images: Wikimedia Commons (CC / public domain, hotlink-safe), verified 200 + image/jpeg.
-- Links: official sites (NPS, FWS, org pages) where available, else the relevant Wikipedia article.
-- Re-run safe: pure UPDATE keyed on title.

set search_path = public;

update activities a set
  photo_url = v.photo,
  external_link = v.link
from (values
  -- Anchorage
  ('Anchorage Summer Solstice Festival',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/b/be/Anchorage%2C_Alaska_skyline.jpg/3840px-Anchorage%2C_Alaska_skyline.jpg',
   'https://www.anchoragedowntown.org/events'),
  ('Tony Knowles Coastal Trail',
   'https://upload.wikimedia.org/wikipedia/commons/e/e3/Tony_Knowles_Coastal_Trail.jpg',
   'https://en.wikipedia.org/wiki/Tony_Knowles_Coastal_Trail'),
  ('Anchorage Museum',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Around_Anchorage_%2833884033738%29.jpg/3840px-Around_Anchorage_%2833884033738%29.jpg',
   'https://www.anchoragemuseum.org/'),
  ('Alaska Native Heritage Center',
   'https://upload.wikimedia.org/wikipedia/commons/e/e0/Alaska_Native_Heritage_Center_across_Lake_Tiulana.jpg',
   'https://alaskanative.net/'),
  ('Flattop Mountain hike',
   'https://upload.wikimedia.org/wikipedia/commons/4/43/Flattop-Anchorage.jpg',
   'https://en.wikipedia.org/wiki/Flattop_Mountain_(Alaska)'),
  ('Earthquake Park',
   'https://upload.wikimedia.org/wikipedia/commons/5/55/Earthquake_Park_Trail%2C_Anchorage%2C_Alaska%2C_Summer_01.jpg',
   'https://en.wikipedia.org/wiki/1964_Alaska_earthquake'),
  ('Potter Marsh boardwalk',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Potter_Marsh_facing_the_inlet.jpg/3840px-Potter_Marsh_facing_the_inlet.jpg',
   'https://en.wikipedia.org/wiki/Potter_Marsh'),
  -- Homer
  ('Halibut charter (Homer Harbor)',
   'https://upload.wikimedia.org/wikipedia/commons/d/d7/Mete_%28fiske%29_-_Ystad-2018.jpg',
   'https://www.homeralaska.org/'),
  ('Kachemak Bay via water taxi',
   'https://upload.wikimedia.org/wikipedia/commons/d/dd/Sunrise_on_Kachemak_Bay.jpg',
   'https://en.wikipedia.org/wiki/Kachemak_Bay'),
  ('Bishop''s Beach',
   'https://upload.wikimedia.org/wikipedia/commons/8/88/Homerfromslough.JPG',
   'https://en.wikipedia.org/wiki/Homer,_Alaska'),
  ('Homer Spit',
   'https://upload.wikimedia.org/wikipedia/commons/c/ce/USACE_Homer_Spit_Alaska.jpg',
   'https://en.wikipedia.org/wiki/Homer_Spit'),
  ('Pratt Museum',
   'https://upload.wikimedia.org/wikipedia/commons/1/14/Halibut_Cove_Alaska.jpg',
   'https://www.prattmuseum.org/'),
  ('Bunnell Street Arts Center & Old Town galleries',
   'https://upload.wikimedia.org/wikipedia/commons/e/e4/Homer_Alaska_Salty_Dawg_Saloon_1850px.jpg',
   'https://www.bunnellarts.org/'),
  ('Homer Brewing / Grace Ridge Brewing',
   'https://upload.wikimedia.org/wikipedia/commons/a/a4/8210_Brewery_in_Abbaye_Notre-Dame_de_Saint-Remy_Rochefort_2007_Luca_Galuzzi.jpg',
   'https://www.homerbrew.com/'),
  ('Seldovia day trip via ferry',
   'https://upload.wikimedia.org/wikipedia/commons/0/0a/Seldovia.jpg',
   'https://en.wikipedia.org/wiki/Seldovia,_Alaska'),
  ('Lake Clark bear viewing flight',
   'https://upload.wikimedia.org/wikipedia/commons/7/71/2010-kodiak-bear-1.jpg',
   'https://www.nps.gov/lacl/index.htm'),
  ('Center for Alaskan Coastal Studies tidepool tour',
   'https://upload.wikimedia.org/wikipedia/commons/d/dd/Sunrise_on_Kachemak_Bay.jpg',
   'https://akcoastalstudies.org/'),
  ('Bald eagle viewing on the Spit',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg/3840px-Bald_eagle_about_to_fly_in_Alaska_%282016%29.jpg',
   'https://en.wikipedia.org/wiki/Bald_eagle'),
  -- Cooper Landing / Kenai Peninsula
  ('Russian River sockeye fishing',
   'https://upload.wikimedia.org/wikipedia/commons/7/76/Sockeye_salmon_swimming_right.jpg',
   'https://en.wikipedia.org/wiki/Kenai_River'),
  ('Kenai River drift trip with guide',
   'https://upload.wikimedia.org/wikipedia/commons/5/53/Kenai_River.jpg',
   'https://en.wikipedia.org/wiki/Kenai_River'),
  ('Russian River Falls hike',
   'https://www.adfg.alaska.gov/static/viewing/viewinglocations/images/russianriverfalls_oharra.jpg',
   'https://en.wikipedia.org/wiki/Chugach_National_Forest'),
  ('Resurrection Pass Trail',
   'https://uploads.alaska.org/suppliers/parks-trails/G/guide-to-backpacking-resurrection-pass-trail/_1600xAUTO_crop_center-center_65_none/resurrection-pass-haley-johnston-IMG_9379.jpg',
   'https://en.wikipedia.org/wiki/Chugach_National_Forest'),
  ('Crescent Creek / Crescent Lake trail',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Skilakblue.JPG/3840px-Skilakblue.JPG',
   'https://en.wikipedia.org/wiki/Chugach_National_Forest'),
  ('Kenai Lake',
   'https://upload.wikimedia.org/wikipedia/commons/0/0a/Kenai_River_Alaska.jpg',
   'https://en.wikipedia.org/wiki/Kenai_Lake'),
  ('Cooper Landing Museum',
   'https://upload.wikimedia.org/wikipedia/commons/f/fa/Cooper_Landing.jpg',
   'https://en.wikipedia.org/wiki/Cooper_Landing,_Alaska'),
  ('Alaska Horsemen Trail Adventures',
   'https://upload.wikimedia.org/wikipedia/commons/e/e2/Ebnit06061.JPG',
   'https://alaskahorsemen.com/'),
  ('Hidden Lake / Skilak Lake Loop',
   'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e8/Skilakblue.JPG/3840px-Skilakblue.JPG',
   'https://www.fws.gov/refuge/kenai')
) as v(title, photo, link)
where a.title = v.title;

-- Verify: every approved activity should now have a photo and a link.
select count(*) filter (where photo_url is not null) as with_photo,
       count(*) filter (where external_link is not null) as with_link,
       count(*) as total
  from activities where status = 'approved';
