-- Insert/update geography locations with improved clues
-- Uses UPSERT to safely update existing entries or add new ones

INSERT INTO game_locations (id, name, clue, lat, lng, difficulty) VALUES
  ('eiffel-tower', 'Eiffel Tower', 'Built for a world''s fair and nearly torn down — it survived only because its height made it a useful radio transmitter', 48.8584, 2.2945, 'easy'),
  ('machu-picchu', 'Machu Picchu', 'A mountaintop city abandoned so abruptly that its builders left tools mid-task — rediscovered by a Western explorer in 1911', -13.1631, -72.5450, 'easy'),
  ('mount-everest', 'Mount Everest', 'Its summit rises about 4mm every year as the tectonic plates beneath it slowly continue their collision', 27.9881, 86.9250, 'easy'),
  ('grand-canyon', 'Grand Canyon', 'A hike from rim to river here passes through two billion years of exposed geological history in a single afternoon', 36.1069, -112.1129, 'easy'),
  ('colosseum', 'Colosseum', 'This oval arena once flooded its floor to stage mock naval battles for crowds of 50,000 spectators', 41.8902, 12.4922, 'easy'),
  ('stonehenge', 'Stonehenge', 'Its largest stones were dragged from a quarry 160 miles away by people with no wheels or metal tools — how, nobody fully agrees', 51.1789, -1.8262, 'easy'),
  ('niagara-falls', 'Niagara Falls', 'Engineers secretly switched these falls completely off in 1969 to study the riverbed — most tourists had no idea', 43.0962, -79.0377, 'easy'),
  ('dead-sea', 'Dead Sea', 'You physically cannot sink here no matter how hard you try — the water is so saturated with minerals your body simply floats', 31.5590, 35.4732, 'easy'),
  ('chichen-itza', 'Chichen Itza', 'On two days each year the setting sun casts a shadow that makes a serpent appear to slither down the main pyramid', 20.6843, -88.5678, 'medium'),
  ('cappadocia', 'Cappadocia', 'Ancient volcanic ash hardened into soft rock that people carved into entire underground cities capable of hiding tens of thousands of residents', 38.6431, 34.8289, 'medium'),
  ('okavango-delta', 'Okavango Delta', 'An entire river travels over 1,000km only to vanish — it never reaches the sea, instead flooding an inland desert before slowly evaporating', -19.3058, 22.8966, 'medium'),
  ('serengeti', 'Serengeti', 'Each year 1.5 million large animals travel a circular route of nearly 2,000km in what scientists call the greatest wildlife spectacle on earth', -2.3333, 34.8333, 'medium'),
  ('geirangerfjord', 'Geirangerfjord', 'Glaciers spent millions of years carving this arm of seawater so deep that enormous ocean liners can sail between sheer mountain walls', 62.1015, 7.2063, 'medium'),
  ('pamukkale', 'Pamukkale', 'Calcium-rich hot springs cascade down a hillside depositing gleaming white mineral terraces that look like a frozen waterfall from a distance', 37.9137, 29.1189, 'medium'),
  ('mount-kilimanjaro', 'Mount Kilimanjaro', 'Africa''s highest peak rises dramatically from flat savanna plains — and the glaciers that have capped it for 11,000 years are nearly gone', -3.0674, 37.3556, 'medium'),
  ('halong-bay', 'Hạ Long Bay', 'Thousands of limestone islands rise from the sea like the humps of a submerged creature, inspiring a legend that a dragon created them', 20.9101, 107.1839, 'medium'),
  ('lake-titicaca', 'Lake Titicaca', 'The highest navigable lake on earth, where entire inhabited islands are constructed on floating platforms woven from aquatic reeds', -15.9254, -69.3354, 'medium'),
  ('salar-de-uyuni', 'Salar de Uyuni', 'After thin rainfall, this vast salt flat becomes so perfectly reflective that pilots have become disoriented unable to tell sky from ground', -20.1338, -67.4891, 'hard'),
  ('socotra-island', 'Socotra Island', 'This island''s signature tree looks completely upside-down with an umbrella-shaped canopy — it grows nowhere else on the planet', 12.4634, 53.8237, 'hard'),
  ('zhangjiajie', 'Zhangjiajie', 'Thousands of sandstone pillars rising vertically from a forested floor were scanned and used as the floating mountains in a famous sci-fi blockbuster', 29.3245, 110.4346, 'hard'),
  ('waitomo-caves', 'Waitomo Caves', 'The cave ceiling glows like a galaxy because thousands of larvae have strung sticky silk threads using bioluminescent lures to trap insects', -38.2610, 175.1040, 'hard'),
  ('richat-structure', 'Richat Structure', 'A 50km bullseye clearly visible from orbit that geologists long assumed was a meteor crater — it is actually geological erosion', 21.1240, -11.3980, 'hard'),
  ('lake-natron', 'Lake Natron', 'This alkaline lake turns animals that fall in to stone — its caustic waters preserve carcasses so perfectly that calcified birds wash onto its shores', -2.4167, 36.0000, 'hard'),
  ('valley-of-geysers', 'Valley of Geysers', 'The second-largest geyser field on earth sits on a volcanic peninsula so remote it is reachable only by helicopter for most of the year', 54.4395, 160.1167, 'hard'),
  ('dallol', 'Dallol', 'One of the most hostile places on the planet''s surface, where acid pools glow neon yellow and chartreuse amid toxic gas vents — all below sea level', 14.2417, 40.2958, 'hard')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  clue = EXCLUDED.clue,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  difficulty = EXCLUDED.difficulty;
