-- Geography Game Locations — 100 entries
-- Run this after adding the radius_km column

-- First, clear existing locations
DELETE FROM game_locations;

-- Insert all 100 new locations
INSERT INTO game_locations (id, name, clue, lat, lng, difficulty, radius_km, enabled) VALUES
-- ICONIC LANDMARKS
('eiffel-tower', 'Eiffel Tower', 'An iron lattice giant that was once called an eyesore by the city it now defines.', 48.8584, 2.2945, 'easy', 5, true),
('colosseum', 'Colosseum', 'An ancient oval arena where crowds once cheered, now a crumbling crown in the eternal city.', 41.8902, 12.4922, 'easy', 5, true),
('machu-picchu', 'Machu Picchu', 'A lost city of stone terraces hidden in Andean clouds, rediscovered only in 1911.', -13.1631, -72.545, 'medium', 10, true),
('angkor-wat', 'Angkor Wat', 'The world''s largest religious monument, its towers rise from a moat in the heart of Southeast Asia.', 13.4125, 103.867, 'medium', 10, true),
('petra', 'Petra', 'A rose-red city half as old as time, carved directly into the sandstone cliffs of a desert kingdom.', 30.3285, 35.4444, 'medium', 10, true),
('great-wall-jinshanling', 'Great Wall of China (Jinshanling)', 'The most iconic stretch of a barrier so long it once defended an entire civilization from the north.', 40.6769, 117.2376, 'medium', 8, true),
('taj-mahal', 'Taj Mahal', 'A marble mausoleum built by a grieving emperor for his beloved wife, on the banks of a sacred river.', 27.1751, 78.0421, 'easy', 5, true),
('christ-the-redeemer', 'Christ the Redeemer', 'Arms spread wide over a city famed for Carnival, this statue watches from a jungle mountaintop.', -22.9519, -43.2105, 'easy', 5, true),
('stonehenge', 'Stonehenge', 'Mysterious standing stones arranged on an English plain, their builders and purpose still debated.', 51.1789, -1.8262, 'easy', 5, true),
('parthenon', 'Parthenon', 'A marble temple atop a rocky hill that has watched over a city for over 2,400 years.', 37.9715, 23.7267, 'easy', 5, true),

-- CITIES
('reykjavik', 'Reykjavik', 'The world''s northernmost capital, where geothermal pools steam and the northern lights dance in winter.', 64.1355, -21.8954, 'medium', 25, true),
('ulaanbaatar', 'Ulaanbaatar', 'The coldest capital on Earth, set in a vast steppe nation where nomads still follow ancient routes.', 47.8864, 106.9057, 'hard', 30, true),
('la-paz', 'La Paz', 'One of the world''s highest capitals, connected by an extraordinary network of urban cable cars.', -16.5, -68.15, 'medium', 30, true),
('timbuktu', 'Timbuktu', 'Synonymous with the ends of the Earth, this Saharan trading city was once a center of Islamic scholarship.', 16.7666, -3.0026, 'hard', 25, true),
('oslo', 'Oslo', 'A Scandinavian fjord-side capital famous for Viking ships, Munch''s scream, and long winter nights.', 59.9139, 10.7522, 'medium', 30, true),
('istanbul', 'Istanbul', 'The only city straddling two continents, where minarets and Byzantine domes share the skyline.', 41.0082, 28.9784, 'easy', 35, true),
('cartagena', 'Cartagena', 'A walled Caribbean city whose pastel colonial streets were once a hub for Spanish treasure fleets.', 10.391, -75.4794, 'medium', 20, true),
('tbilisi', 'Tbilisi', 'A Caucasian capital of sulfur baths and carved wooden balconies, nestled where Europe meets Asia.', 41.6938, 44.8015, 'hard', 25, true),
('luang-prabang', 'Luang Prabang', 'A sleepy royal town where saffron-robed monks collect alms at dawn, surrounded by Mekong tributaries.', 19.8845, 102.135, 'hard', 20, true),
('valparaiso', 'Valparaíso', 'A chaotic, colorful Chilean port city of steep hills, funicular lifts, and world-class street art.', -33.0472, -71.6127, 'medium', 20, true),
('asmara', 'Asmara', 'An African capital with the world''s most intact collection of Italian Art Deco architecture.', 15.3229, 38.9251, 'hard', 25, true),
('chefchaouen', 'Chefchaouen', 'A mountain town painted almost entirely in shades of blue, tucked into Morocco''s Rif Mountains.', 35.1688, -5.2636, 'medium', 10, true),
('bukhara', 'Bukhara', 'An ancient Silk Road city of turquoise domes, where trading caravans rested for centuries in Central Asia.', 39.7747, 64.4286, 'hard', 20, true),
('queenstown', 'Queenstown', 'The adventure capital of the world, set beside a glacial lake surrounded by jagged alpine peaks.', -45.0312, 168.6626, 'medium', 20, true),

-- MOUNTAINS
('mount-everest', 'Mount Everest', 'The rooftop of the world, where only the most determined climbers dare to place a flag.', 27.9881, 86.925, 'easy', 15, true),
('kilimanjaro', 'Mount Kilimanjaro', 'Africa''s highest peak rises improbably from the savannah, capped with glaciers that are slowly disappearing.', -3.0674, 37.3556, 'easy', 15, true),
('mont-blanc', 'Mont Blanc', 'The white mountain crowning the Alps, on the border where France and Italy meet in the sky.', 45.8326, 6.8652, 'medium', 10, true),
('k2', 'K2', 'The savage mountain — the second highest on Earth but considered more deadly than its taller neighbor.', 35.8825, 76.5133, 'hard', 15, true),
('mount-fuji', 'Mount Fuji', 'A perfectly cone-shaped dormant volcano that has inspired artists for centuries on Japan''s main island.', 35.3606, 138.7274, 'easy', 10, true),
('table-mountain', 'Table Mountain', 'A flat-topped icon that looms over a famous cape city, often shrouded in a "tablecloth" of cloud.', -33.9628, 18.4098, 'medium', 10, true),
('torres-del-paine', 'Torres del Paine', 'Three granite spires that erupt dramatically from the Patagonian steppe at the edge of the world.', -50.9423, -73.4068, 'medium', 15, true),
('matterhorn', 'Matterhorn', 'One of the Alps'' most iconic pyramidal peaks, straddling the Swiss-Italian border above a famous ski resort.', 45.9763, 7.6586, 'medium', 8, true),

-- RIVERS & WATERFALLS
('angel-falls', 'Angel Falls', 'The world''s highest uninterrupted waterfall plunges from a flat-topped plateau deep in Venezuelan jungle.', 5.9679, -62.5359, 'medium', 15, true),
('victoria-falls', 'Victoria Falls', 'The "smoke that thunders" — a curtain of water a mile wide on the Zambia-Zimbabwe border.', -17.9243, 25.8572, 'medium', 10, true),
('iguazu-falls', 'Iguazú Falls', 'A horseshoe of 275 separate waterfalls sprawling across the triple-border region of South America.', -25.6953, -54.4367, 'medium', 15, true),
('amazon-source', 'Amazon River Source', 'The birthplace of the world''s mightiest river by volume, high in the Peruvian Andes.', -15.5, -71.77, 'hard', 50, true),
('nile-delta', 'Nile Delta', 'Where the world''s longest river fans out into a green triangle before meeting the Mediterranean Sea.', 31.0, 31.0, 'medium', 75, true),
('plitvice-lakes', 'Plitvice Lakes', 'A staircase of sixteen terraced lakes connected by waterfalls in the limestone karst of the Balkans.', 44.8654, 15.582, 'hard', 15, true),

-- DESERTS
('sahara-erg-chebbi', 'Erg Chebbi (Sahara)', 'A sea of golden dunes near a Moroccan village, the quintessential image of the Sahara Desert.', 31.15, -3.97, 'hard', 50, true),
('atacama-desert', 'Atacama Desert', 'The driest non-polar desert on Earth, where some weather stations have never recorded rainfall.', -24.5, -69.25, 'medium', 200, true),
('namib-desert', 'Namib Desert', 'One of the world''s oldest deserts, home to star-shaped dunes that glow red at sunrise on Africa''s southwest coast.', -24.73, 15.88, 'medium', 200, true),
('wadi-rum', 'Wadi Rum', 'A valley of rose-red sandstone towers and endless sand so otherworldly it has stood in for Mars in films.', 29.5833, 35.4167, 'medium', 40, true),
('rub-al-khali', 'Rub'' al Khali (Empty Quarter)', 'The largest continuous sand desert on Earth, covering a quarter of the Arabian Peninsula.', 20.0, 51.0, 'hard', 300, true),

-- ISLANDS
('galapagos-islands', 'Galápagos Islands', 'A volcanic archipelago that inspired Darwin''s theory of evolution, still home to fearless giant tortoises.', -0.9538, -90.9656, 'easy', 100, true),
('easter-island', 'Easter Island', 'One of the most remote inhabited islands on Earth, famous for its mysterious giant stone heads.', -27.1127, -109.3497, 'easy', 30, true),
('svalbard', 'Svalbard', 'A Norwegian archipelago high in the Arctic where polar bears outnumber people and the sun never sets in summer.', 78.2232, 15.6267, 'hard', 150, true),
('faroe-islands', 'Faroe Islands', 'Storm-battered islands between Norway and Iceland, famous for grass-roofed villages and dramatic cliffs.', 61.8926, -6.9118, 'medium', 50, true),
('socotra', 'Socotra Island', 'A Yemeni island so isolated that one-third of its species exist nowhere else, including eerie umbrella-shaped trees.', 12.4634, 53.8237, 'hard', 50, true),
('zanzibar', 'Zanzibar', 'A spice island off East Africa with a maze of narrow medieval streets and turquoise coral reefs.', -6.165, 39.1989, 'medium', 30, true),
('maldives', 'Maldives', 'A nation of low coral atolls in the Indian Ocean, the most at-risk country to rising sea levels.', 3.2028, 73.2207, 'medium', 200, true),
('madagascar', 'Madagascar', 'A vast island nation off Africa''s east coast where 90% of wildlife is found nowhere else on Earth.', -20.0, 47.0, 'easy', 200, true),
('new-caledonia', 'New Caledonia', 'A French Pacific territory with the world''s second-largest coral lagoon and a unique Kanak culture.', -20.9043, 165.618, 'hard', 100, true),
('tristan-da-cunha', 'Tristan da Cunha', 'The most remote permanently inhabited island on Earth, a British territory in the South Atlantic with no airport.', -37.1052, -12.2776, 'hard', 30, true),

-- LAKES
('lake-titicaca', 'Lake Titicaca', 'The world''s highest navigable lake, straddling Bolivia and Peru at over 3,800 meters elevation.', -15.8422, -69.3336, 'medium', 50, true),
('lake-baikal', 'Lake Baikal', 'The world''s deepest lake holds one-fifth of Earth''s unfrozen fresh water, in the heart of Siberia.', 53.5587, 108.165, 'medium', 75, true),
('dead-sea', 'Dead Sea', 'Earth''s lowest body of water, so salty that swimmers float effortlessly on its surface.', 31.5, 35.5, 'easy', 30, true),
('lake-natron', 'Lake Natron', 'A caustic Tanzanian lake that calcifies animals on contact but is the sole breeding ground of millions of flamingos.', -2.4177, 36.0617, 'hard', 30, true),
('lake-hillier', 'Lake Hillier', 'A perfectly bubblegum-pink lake on a remote Australian island whose vivid color baffled scientists for years.', -34.0914, 123.1965, 'hard', 10, true),

-- FORESTS & JUNGLES
('amazon-manaus', 'Amazon Rainforest (Manaus Region)', 'Where a city of two million people rises incongruously in the middle of the Earth''s great green lung.', -3.119, -60.0217, 'medium', 100, true),
('daintree-rainforest', 'Daintree Rainforest', 'The world''s oldest tropical rainforest meets the Great Barrier Reef on Australia''s tropical northeast coast.', -16.17, 145.42, 'hard', 40, true),
('black-forest', 'Black Forest', 'A dense German forest that gave cuckoo clocks and fairy tales to the world, bordering the Rhine.', 48.0, 8.2, 'medium', 75, true),
('borneo-rainforest', 'Borneo Rainforest', 'One of the oldest and most biodiverse forests on Earth, home to wild orangutans on the world''s third-largest island.', 1.0, 114.0, 'medium', 200, true),

-- GEOLOGICAL FEATURES
('grand-canyon', 'Grand Canyon', 'A mile-deep scar in the American Southwest, carved by a river over millions of years.', 36.1069, -112.1129, 'easy', 50, true),
('cappadocia', 'Cappadocia', 'A Turkish landscape of fairy chimneys and cave hotels, famously dotted with hot air balloons at sunrise.', 38.6431, 34.829, 'medium', 40, true),
('pamukkale', 'Pamukkale', 'A Turkish hillside of brilliant white calcium terraces and warm thermal pools that look like a cotton castle.', 37.9202, 29.1203, 'medium', 10, true),
('waitomo-caves', 'Waitomo Glowworm Caves', 'New Zealand caverns whose ceiling lights are not stars but thousands of bioluminescent worms.', -38.2597, 175.1054, 'hard', 10, true),
('fly-geyser', 'Fly Geyser', 'An accidental man-made geyser in Nevada''s Black Rock Desert, erupting in otherworldly mineral terraces.', 40.8596, -119.3322, 'hard', 10, true),
('salar-de-uyuni', 'Salar de Uyuni', 'The world''s largest salt flat becomes an infinite mirror after rain on the Bolivian altiplano.', -20.1338, -67.4891, 'medium', 100, true),
('zhangjiajie', 'Zhangjiajie', 'Thousands of sandstone pillars rising from mist in China, the real-world inspiration for floating mountains in Avatar.', 29.3174, 110.4344, 'medium', 20, true),
('lake-bled', 'Lake Bled', 'A glacial Slovenian lake with a tiny island and a church reachable only by wooden rowboat.', 46.3683, 14.1146, 'medium', 10, true),
('antelope-canyon', 'Antelope Canyon', 'A slot canyon carved by flash floods in the American Southwest, famous for shafts of light filtering through swirling sandstone.', 36.8619, -111.3743, 'medium', 10, true),
('tianmen-cave', 'Tianmen Cave', 'A massive natural arch in a Chinese mountain, reached by one of the world''s longest cable car rides.', 29.0534, 110.4793, 'hard', 10, true),
('white-cliffs-dover', 'White Cliffs of Dover', 'Chalk cliffs so iconic they became a symbol of England itself, facing France across the narrowest sea crossing.', 51.1293, 1.3717, 'medium', 15, true),
('pinnacles-desert', 'Pinnacles Desert', 'Thousands of jagged limestone spires rise from a yellow desert within sight of the Indian Ocean in Western Australia.', -30.597, 115.156, 'hard', 20, true),
('halong-bay', 'Ha Long Bay', 'Thousands of limestone islets pierce the emerald waters of a Vietnamese bay like a dragon''s spine.', 20.9101, 107.1839, 'medium', 40, true),
('mount-roraima', 'Mount Roraima', 'A flat-topped ancient plateau at the junction of Venezuela, Brazil, and Guyana that inspired Conan Doyle''s Lost World.', 5.1425, -60.7623, 'hard', 15, true),

-- COASTAL & POLAR
('amalfi-coast', 'Amalfi Coast', 'Pastel villages cling to vertiginous cliffs above the Mediterranean on Italy''s finger-shaped peninsula.', 40.6333, 14.6029, 'medium', 30, true),
('fiordland', 'Fiordland (Milford Sound)', 'Often called the eighth wonder of the world — a deep New Zealand fjord framed by waterfalls and sheer peaks.', -44.6414, 167.8974, 'medium', 15, true),
('antarctic-peninsula', 'Antarctic Peninsula', 'The most accessible part of Earth''s frozen continent, where penguins crowd beaches of black volcanic rock.', -64.5, -62.5, 'medium', 200, true),
('cape-horn', 'Cape Horn', 'The southernmost point of the Americas, a rocky headland feared by sailors for centuries of tempestuous seas.', -55.9833, -67.2667, 'hard', 15, true),
('skeleton-coast', 'Skeleton Coast', 'A graveyard of shipwrecks stretches along Namibia''s foggy Atlantic shore, where deserts meet the cold Benguela current.', -21.0, 13.5, 'hard', 100, true),
('twelve-apostles', 'Twelve Apostles', 'Sea stacks jutting from wild Southern Ocean waters along a famous Australian coast drive.', -38.6627, 143.1047, 'medium', 20, true),
('lofoten-islands', 'Lofoten Islands', 'Red fishing huts perch over a Norwegian archipelago above the Arctic Circle, ringed by dramatic peaks.', 68.157, 13.997, 'medium', 50, true),

-- ARCHAEOLOGICAL SITES
('teotihuacan', 'Teotihuacán', 'An ancient Mexican city of pyramids so vast it was once the sixth-largest in the world — its builders remain unknown.', 19.6925, -98.8438, 'medium', 10, true),
('chichen-itza', 'Chichen Itzá', 'A Mayan pyramid that casts a serpent shadow on each equinox, in Mexico''s Yucatán jungle.', 20.6843, -88.5678, 'easy', 10, true),
('pompeii', 'Pompeii', 'A Roman city frozen in ash and time by a volcanic eruption in 79 AD, near Naples in southern Italy.', 40.7491, 14.4989, 'easy', 8, true),
('great-zimbabwe', 'Great Zimbabwe', 'Sub-Saharan Africa''s largest ancient stone ruins, a medieval city that gave its country a name.', -20.2667, 30.9333, 'hard', 10, true),
('gobekli-tepe', 'Göbekli Tepe', 'The world''s oldest known temple complex, built 6,000 years before Stonehenge on a hilltop in southeastern Turkey.', 37.2232, 38.9224, 'hard', 10, true),
('nazca-lines', 'Nazca Lines', 'Enormous geoglyphs etched into a Peruvian plateau that are only fully visible from the air above the desert.', -14.739, -75.13, 'medium', 40, true),
('luxor-temple', 'Luxor Temple', 'A pharaonic temple complex on the banks of the Nile in what was once the greatest city of the ancient world.', 25.6997, 32.6392, 'medium', 8, true),

-- FAMOUS BRIDGES & INFRASTRUCTURE
('golden-gate-bridge', 'Golden Gate Bridge', 'A rust-orange suspension bridge that has graced countless postcards from a fog-prone California bay.', 37.8199, -122.4783, 'easy', 5, true),
('zhangjiajie-glass-bridge', 'Zhangjiajie Glass Bridge', 'The world''s longest and highest glass-bottomed bridge, suspended between canyon peaks in China.', 29.1847, 110.393, 'hard', 10, true),
('rialto-bridge', 'Rialto Bridge', 'The oldest bridge spanning the Grand Canal of a sinking Italian city famed for gondolas.', 45.438, 12.3358, 'medium', 5, true),

-- VOLCANOES
('mount-etna', 'Mount Etna', 'Europe''s tallest and most active volcano, looming over a triangular island famous for ancient history and cuisine.', 37.751, 14.9934, 'medium', 20, true),
('mount-pinatubo', 'Mount Pinatubo', 'A Philippine volcano whose 1991 eruption was one of the 20th century''s largest, now filled with a turquoise crater lake.', 15.1429, 120.35, 'hard', 15, true),
('santorini-caldera', 'Santorini Caldera', 'A Greek archipelago shaped by a Bronze Age explosion so massive it may have inspired the myth of Atlantis.', 36.4018, 25.3962, 'easy', 20, true),
('mount-nyiragongo', 'Mount Nyiragongo', 'An African volcano containing the world''s largest and most active lava lake, overlooking a turbulent Congolese city.', -1.5215, 29.2495, 'hard', 15, true),

-- PLAINS, STEPPES & SAVANNAS
('serengeti', 'Serengeti', 'An endless Tanzanian plain where the largest land animal migration on Earth passes twice a year.', -2.3333, 34.8333, 'easy', 150, true),
('mongolian-steppe', 'Mongolian Steppe', 'An ocean of grass stretching from the Gobi to the Altai, where eagle hunters on horseback keep ancient traditions.', 47.0, 103.0, 'hard', 250, true),
('outback-uluru', 'Uluru', 'A sacred sandstone monolith that glows crimson at sunset, rising from flat red desert in Australia''s heart.', -25.3444, 131.0369, 'easy', 10, true),
('okavango-delta', 'Okavango Delta', 'A vast inland river delta where the water never reaches the sea, forming an Eden in the middle of the Kalahari.', -19.3, 22.8, 'medium', 100, true),

-- UNIQUE CULTURAL SITES
('varanasi-ghats', 'Varanasi Ghats', 'Stone steps descending to a sacred Indian river where funeral pyres burn day and night in the holiest city of Hinduism.', 25.3176, 83.0088, 'medium', 10, true),
('burning-man-site', 'Black Rock Desert (Burning Man)', 'A vast, flat alkali playa in Nevada where tens of thousands gather annually to build a temporary city that vanishes without a trace.', 40.786, -119.2065, 'hard', 30, true),
('zhouzhuang', 'Zhouzhuang', 'China''s most famous water town, a labyrinth of ancient canals and arched stone bridges near Shanghai.', 31.1038, 120.8437, 'hard', 10, true),
('lalibela', 'Lalibela Rock-Hewn Churches', 'Eleven medieval Christian churches carved entirely downward into solid red volcanic rock in the Ethiopian highlands.', 12.0315, 39.0447, 'hard', 10, true),
('meteora', 'Meteora', 'Monasteries perched atop impossibly thin rock pillars in central Greece, accessible for centuries only by rope ladders.', 39.7217, 21.6306, 'medium', 15, true),
('palacio-potala', 'Potala Palace', 'A thirteen-story white-and-red fortress-palace built on a hill above the highest capital city in the world.', 29.6578, 91.1175, 'medium', 10, true),

-- UNUSUAL / HIDDEN GEMS
('surtsey', 'Surtsey Island', 'An Icelandic island that didn''t exist before 1963, born from an underwater volcanic eruption and still being colonized by life.', 63.3, -20.6, 'hard', 15, true),
('point-nemo', 'Point Nemo', 'The most remote point in any ocean — the oceanic pole of inaccessibility, where the nearest humans are often astronauts overhead.', -48.8767, -123.3933, 'hard', 200, true),
('dallol', 'Dallol Volcanic Area', 'The hottest inhabited place on Earth, a psychedelic landscape of acid pools and yellow sulfur mounds below sea level in Ethiopia.', 14.2417, 40.2997, 'hard', 20, true),
('crooked-forest', 'Crooked Forest', 'A grove of 400 pine trees in western Poland, all bent at a 90-degree angle at the base — the cause remains a mystery.', 53.2152, 14.4756, 'hard', 10, true),
('red-beach-panjin', 'Red Beach, Panjin', 'A Chinese coastal wetland carpeted brilliant crimson by seepweed each autumn, one of the world''s most unusual vistas.', 40.9333, 121.8167, 'hard', 20, true),
('chocolate-hills', 'Chocolate Hills', 'Over a thousand perfectly dome-shaped hills turn brown in the dry season on a Philippine island, resembling giant candies.', 9.8007, 124.1694, 'hard', 20, true),
('blue-hole-belize', 'Great Blue Hole, Belize', 'A perfectly circular marine sinkhole off the Caribbean coast, appearing as a dark sapphire disc in turquoise shallows.', 17.3164, -87.535, 'hard', 10, true),
('sichuan-jiuzhaigou', 'Jiuzhaigou Valley', 'A Chinese valley of multicolored lakes ranging from emerald to sapphire, fed by minerals from the Tibetan Plateau.', 33.2, 103.917, 'hard', 20, true);
