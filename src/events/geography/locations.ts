import { supabase } from '../../lib/supabase'

export interface Location {
  id: string
  name: string
  clue: string
  lat: number
  lng: number
  difficulty: 'easy' | 'medium' | 'hard'
  radiusKm: number // Acceptable radius - guesses within this distance count as "on target"
}

// Cache for fetched locations
let cachedLocations: Location[] | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION_MS = 5 * 60 * 1000 // 5 minutes

// Geography Game Locations — 100 entries
// Mix of landmarks, cities, natural features, and hidden gems worldwide
export const locations: Location[] = [
  // ─── ICONIC LANDMARKS ───────────────────────────────────────────────
  { id: 'eiffel-tower', name: 'Eiffel Tower', clue: 'An iron lattice giant that was once called an eyesore by the city it now defines.', lat: 48.8584, lng: 2.2945, difficulty: 'easy', radiusKm: 5 },
  { id: 'colosseum', name: 'Colosseum', clue: 'An ancient oval arena where crowds once cheered, now a crumbling crown in the eternal city.', lat: 41.8902, lng: 12.4922, difficulty: 'easy', radiusKm: 5 },
  { id: 'machu-picchu', name: 'Machu Picchu', clue: 'A lost city of stone terraces hidden in Andean clouds, rediscovered only in 1911.', lat: -13.1631, lng: -72.545, difficulty: 'medium', radiusKm: 10 },
  { id: 'angkor-wat', name: 'Angkor Wat', clue: "The world's largest religious monument, its towers rise from a moat in the heart of Southeast Asia.", lat: 13.4125, lng: 103.867, difficulty: 'medium', radiusKm: 10 },
  { id: 'petra', name: 'Petra', clue: 'A rose-red city half as old as time, carved directly into the sandstone cliffs of a desert kingdom.', lat: 30.3285, lng: 35.4444, difficulty: 'medium', radiusKm: 10 },
  { id: 'great-wall-jinshanling', name: 'Great Wall of China (Jinshanling)', clue: 'The most iconic stretch of a barrier so long it once defended an entire civilization from the north.', lat: 40.6769, lng: 117.2376, difficulty: 'medium', radiusKm: 8 },
  { id: 'taj-mahal', name: 'Taj Mahal', clue: 'A marble mausoleum built by a grieving emperor for his beloved wife, on the banks of a sacred river.', lat: 27.1751, lng: 78.0421, difficulty: 'easy', radiusKm: 5 },
  { id: 'christ-the-redeemer', name: 'Christ the Redeemer', clue: 'Arms spread wide over a city famed for Carnival, this statue watches from a jungle mountaintop.', lat: -22.9519, lng: -43.2105, difficulty: 'easy', radiusKm: 5 },
  { id: 'stonehenge', name: 'Stonehenge', clue: 'Mysterious standing stones arranged on an English plain, their builders and purpose still debated.', lat: 51.1789, lng: -1.8262, difficulty: 'easy', radiusKm: 5 },
  { id: 'parthenon', name: 'Parthenon', clue: 'A marble temple atop a rocky hill that has watched over a city for over 2,400 years.', lat: 37.9715, lng: 23.7267, difficulty: 'easy', radiusKm: 5 },

  // ─── CITIES ─────────────────────────────────────────────────────────
  { id: 'reykjavik', name: 'Reykjavik', clue: "The world's northernmost capital, where geothermal pools steam and the northern lights dance in winter.", lat: 64.1355, lng: -21.8954, difficulty: 'medium', radiusKm: 25 },
  { id: 'ulaanbaatar', name: 'Ulaanbaatar', clue: 'The coldest capital on Earth, set in a vast steppe nation where nomads still follow ancient routes.', lat: 47.8864, lng: 106.9057, difficulty: 'hard', radiusKm: 30 },
  { id: 'la-paz', name: 'La Paz', clue: "One of the world's highest capitals, connected by an extraordinary network of urban cable cars.", lat: -16.5, lng: -68.15, difficulty: 'medium', radiusKm: 30 },
  { id: 'timbuktu', name: 'Timbuktu', clue: 'Synonymous with the ends of the Earth, this Saharan trading city was once a center of Islamic scholarship.', lat: 16.7666, lng: -3.0026, difficulty: 'hard', radiusKm: 25 },
  { id: 'oslo', name: 'Oslo', clue: "A Scandinavian fjord-side capital famous for Viking ships, Munch's scream, and long winter nights.", lat: 59.9139, lng: 10.7522, difficulty: 'medium', radiusKm: 30 },
  { id: 'istanbul', name: 'Istanbul', clue: 'The only city straddling two continents, where minarets and Byzantine domes share the skyline.', lat: 41.0082, lng: 28.9784, difficulty: 'easy', radiusKm: 35 },
  { id: 'cartagena', name: 'Cartagena', clue: 'A walled Caribbean city whose pastel colonial streets were once a hub for Spanish treasure fleets.', lat: 10.391, lng: -75.4794, difficulty: 'medium', radiusKm: 20 },
  { id: 'tbilisi', name: 'Tbilisi', clue: 'A Caucasian capital of sulfur baths and carved wooden balconies, nestled where Europe meets Asia.', lat: 41.6938, lng: 44.8015, difficulty: 'hard', radiusKm: 25 },
  { id: 'luang-prabang', name: 'Luang Prabang', clue: 'A sleepy royal town where saffron-robed monks collect alms at dawn, surrounded by Mekong tributaries.', lat: 19.8845, lng: 102.135, difficulty: 'hard', radiusKm: 20 },
  { id: 'valparaiso', name: 'Valparaíso', clue: 'A chaotic, colorful Chilean port city of steep hills, funicular lifts, and world-class street art.', lat: -33.0472, lng: -71.6127, difficulty: 'medium', radiusKm: 20 },
  { id: 'asmara', name: 'Asmara', clue: "An African capital with the world's most intact collection of Italian Art Deco architecture.", lat: 15.3229, lng: 38.9251, difficulty: 'hard', radiusKm: 25 },
  { id: 'chefchaouen', name: 'Chefchaouen', clue: "A mountain town painted almost entirely in shades of blue, tucked into Morocco's Rif Mountains.", lat: 35.1688, lng: -5.2636, difficulty: 'medium', radiusKm: 10 },
  { id: 'bukhara', name: 'Bukhara', clue: 'An ancient Silk Road city of turquoise domes, where trading caravans rested for centuries in Central Asia.', lat: 39.7747, lng: 64.4286, difficulty: 'hard', radiusKm: 20 },
  { id: 'queenstown', name: 'Queenstown', clue: 'The adventure capital of the world, set beside a glacial lake surrounded by jagged alpine peaks.', lat: -45.0312, lng: 168.6626, difficulty: 'medium', radiusKm: 20 },

  // ─── MOUNTAINS ──────────────────────────────────────────────────────
  { id: 'mount-everest', name: 'Mount Everest', clue: 'The rooftop of the world, where only the most determined climbers dare to place a flag.', lat: 27.9881, lng: 86.925, difficulty: 'easy', radiusKm: 15 },
  { id: 'kilimanjaro', name: 'Mount Kilimanjaro', clue: "Africa's highest peak rises improbably from the savannah, capped with glaciers that are slowly disappearing.", lat: -3.0674, lng: 37.3556, difficulty: 'easy', radiusKm: 15 },
  { id: 'mont-blanc', name: 'Mont Blanc', clue: 'The white mountain crowning the Alps, on the border where France and Italy meet in the sky.', lat: 45.8326, lng: 6.8652, difficulty: 'medium', radiusKm: 10 },
  { id: 'k2', name: 'K2', clue: 'The savage mountain — the second highest on Earth but considered more deadly than its taller neighbor.', lat: 35.8825, lng: 76.5133, difficulty: 'hard', radiusKm: 15 },
  { id: 'mount-fuji', name: 'Mount Fuji', clue: "A perfectly cone-shaped dormant volcano that has inspired artists for centuries on Japan's main island.", lat: 35.3606, lng: 138.7274, difficulty: 'easy', radiusKm: 10 },
  { id: 'table-mountain', name: 'Table Mountain', clue: 'A flat-topped icon that looms over a famous cape city, often shrouded in a "tablecloth" of cloud.', lat: -33.9628, lng: 18.4098, difficulty: 'medium', radiusKm: 10 },
  { id: 'torres-del-paine', name: 'Torres del Paine', clue: 'Three granite spires that erupt dramatically from the Patagonian steppe at the edge of the world.', lat: -50.9423, lng: -73.4068, difficulty: 'medium', radiusKm: 15 },
  { id: 'matterhorn', name: 'Matterhorn', clue: "One of the Alps' most iconic pyramidal peaks, straddling the Swiss-Italian border above a famous ski resort.", lat: 45.9763, lng: 7.6586, difficulty: 'medium', radiusKm: 8 },

  // ─── RIVERS & WATERFALLS ────────────────────────────────────────────
  { id: 'angel-falls', name: 'Angel Falls', clue: "The world's highest uninterrupted waterfall plunges from a flat-topped plateau deep in Venezuelan jungle.", lat: 5.9679, lng: -62.5359, difficulty: 'medium', radiusKm: 15 },
  { id: 'victoria-falls', name: 'Victoria Falls', clue: 'The "smoke that thunders" — a curtain of water a mile wide on the Zambia-Zimbabwe border.', lat: -17.9243, lng: 25.8572, difficulty: 'medium', radiusKm: 10 },
  { id: 'iguazu-falls', name: 'Iguazú Falls', clue: 'A horseshoe of 275 separate waterfalls sprawling across the triple-border region of South America.', lat: -25.6953, lng: -54.4367, difficulty: 'medium', radiusKm: 15 },
  { id: 'amazon-source', name: 'Amazon River Source', clue: "The birthplace of the world's mightiest river by volume, high in the Peruvian Andes.", lat: -15.5, lng: -71.77, difficulty: 'hard', radiusKm: 50 },
  { id: 'nile-delta', name: 'Nile Delta', clue: "Where the world's longest river fans out into a green triangle before meeting the Mediterranean Sea.", lat: 31.0, lng: 31.0, difficulty: 'medium', radiusKm: 75 },
  { id: 'plitvice-lakes', name: 'Plitvice Lakes', clue: 'A staircase of sixteen terraced lakes connected by waterfalls in the limestone karst of the Balkans.', lat: 44.8654, lng: 15.582, difficulty: 'hard', radiusKm: 15 },

  // ─── DESERTS ────────────────────────────────────────────────────────
  { id: 'sahara-erg-chebbi', name: 'Erg Chebbi (Sahara)', clue: 'A sea of golden dunes near a Moroccan village, the quintessential image of the Sahara Desert.', lat: 31.15, lng: -3.97, difficulty: 'hard', radiusKm: 50 },
  { id: 'atacama-desert', name: 'Atacama Desert', clue: 'The driest non-polar desert on Earth, where some weather stations have never recorded rainfall.', lat: -24.5, lng: -69.25, difficulty: 'medium', radiusKm: 200 },
  { id: 'namib-desert', name: 'Namib Desert', clue: "One of the world's oldest deserts, home to star-shaped dunes that glow red at sunrise on Africa's southwest coast.", lat: -24.73, lng: 15.88, difficulty: 'medium', radiusKm: 200 },
  { id: 'wadi-rum', name: 'Wadi Rum', clue: 'A valley of rose-red sandstone towers and endless sand so otherworldly it has stood in for Mars in films.', lat: 29.5833, lng: 35.4167, difficulty: 'medium', radiusKm: 40 },
  { id: 'rub-al-khali', name: "Rub' al Khali (Empty Quarter)", clue: 'The largest continuous sand desert on Earth, covering a quarter of the Arabian Peninsula.', lat: 20.0, lng: 51.0, difficulty: 'hard', radiusKm: 300 },

  // ─── ISLANDS ────────────────────────────────────────────────────────
  { id: 'galapagos-islands', name: 'Galápagos Islands', clue: "A volcanic archipelago that inspired Darwin's theory of evolution, still home to fearless giant tortoises.", lat: -0.9538, lng: -90.9656, difficulty: 'easy', radiusKm: 100 },
  { id: 'easter-island', name: 'Easter Island', clue: 'One of the most remote inhabited islands on Earth, famous for its mysterious giant stone heads.', lat: -27.1127, lng: -109.3497, difficulty: 'easy', radiusKm: 30 },
  { id: 'svalbard', name: 'Svalbard', clue: 'A Norwegian archipelago high in the Arctic where polar bears outnumber people and the sun never sets in summer.', lat: 78.2232, lng: 15.6267, difficulty: 'hard', radiusKm: 150 },
  { id: 'faroe-islands', name: 'Faroe Islands', clue: 'Storm-battered islands between Norway and Iceland, famous for grass-roofed villages and dramatic cliffs.', lat: 61.8926, lng: -6.9118, difficulty: 'medium', radiusKm: 50 },
  { id: 'socotra', name: 'Socotra Island', clue: 'A Yemeni island so isolated that one-third of its species exist nowhere else, including eerie umbrella-shaped trees.', lat: 12.4634, lng: 53.8237, difficulty: 'hard', radiusKm: 50 },
  { id: 'zanzibar', name: 'Zanzibar', clue: 'A spice island off East Africa with a maze of narrow medieval streets and turquoise coral reefs.', lat: -6.165, lng: 39.1989, difficulty: 'medium', radiusKm: 30 },
  { id: 'maldives', name: 'Maldives', clue: 'A nation of low coral atolls in the Indian Ocean, the most at-risk country to rising sea levels.', lat: 3.2028, lng: 73.2207, difficulty: 'medium', radiusKm: 200 },
  { id: 'madagascar', name: 'Madagascar', clue: "A vast island nation off Africa's east coast where 90% of wildlife is found nowhere else on Earth.", lat: -20.0, lng: 47.0, difficulty: 'easy', radiusKm: 200 },
  { id: 'new-caledonia', name: 'New Caledonia', clue: "A French Pacific territory with the world's second-largest coral lagoon and a unique Kanak culture.", lat: -20.9043, lng: 165.618, difficulty: 'hard', radiusKm: 100 },
  { id: 'tristan-da-cunha', name: 'Tristan da Cunha', clue: 'The most remote permanently inhabited island on Earth, a British territory in the South Atlantic with no airport.', lat: -37.1052, lng: -12.2776, difficulty: 'hard', radiusKm: 30 },

  // ─── LAKES ──────────────────────────────────────────────────────────
  { id: 'lake-titicaca', name: 'Lake Titicaca', clue: "The world's highest navigable lake, straddling Bolivia and Peru at over 3,800 meters elevation.", lat: -15.8422, lng: -69.3336, difficulty: 'medium', radiusKm: 50 },
  { id: 'lake-baikal', name: 'Lake Baikal', clue: "The world's deepest lake holds one-fifth of Earth's unfrozen fresh water, in the heart of Siberia.", lat: 53.5587, lng: 108.165, difficulty: 'medium', radiusKm: 75 },
  { id: 'dead-sea', name: 'Dead Sea', clue: "Earth's lowest body of water, so salty that swimmers float effortlessly on its surface.", lat: 31.5, lng: 35.5, difficulty: 'easy', radiusKm: 30 },
  { id: 'lake-natron', name: 'Lake Natron', clue: 'A caustic Tanzanian lake that calcifies animals on contact but is the sole breeding ground of millions of flamingos.', lat: -2.4177, lng: 36.0617, difficulty: 'hard', radiusKm: 30 },
  { id: 'lake-hillier', name: 'Lake Hillier', clue: 'A perfectly bubblegum-pink lake on a remote Australian island whose vivid color baffled scientists for years.', lat: -34.0914, lng: 123.1965, difficulty: 'hard', radiusKm: 10 },

  // ─── FORESTS & JUNGLES ──────────────────────────────────────────────
  { id: 'amazon-manaus', name: 'Amazon Rainforest (Manaus Region)', clue: "Where a city of two million people rises incongruously in the middle of the Earth's great green lung.", lat: -3.119, lng: -60.0217, difficulty: 'medium', radiusKm: 100 },
  { id: 'daintree-rainforest', name: 'Daintree Rainforest', clue: "The world's oldest tropical rainforest meets the Great Barrier Reef on Australia's tropical northeast coast.", lat: -16.17, lng: 145.42, difficulty: 'hard', radiusKm: 40 },
  { id: 'black-forest', name: 'Black Forest', clue: 'A dense German forest that gave cuckoo clocks and fairy tales to the world, bordering the Rhine.', lat: 48.0, lng: 8.2, difficulty: 'medium', radiusKm: 75 },
  { id: 'borneo-rainforest', name: 'Borneo Rainforest', clue: "One of the oldest and most biodiverse forests on Earth, home to wild orangutans on the world's third-largest island.", lat: 1.0, lng: 114.0, difficulty: 'medium', radiusKm: 200 },

  // ─── GEOLOGICAL FEATURES ────────────────────────────────────────────
  { id: 'grand-canyon', name: 'Grand Canyon', clue: 'A mile-deep scar in the American Southwest, carved by a river over millions of years.', lat: 36.1069, lng: -112.1129, difficulty: 'easy', radiusKm: 50 },
  { id: 'cappadocia', name: 'Cappadocia', clue: 'A Turkish landscape of fairy chimneys and cave hotels, famously dotted with hot air balloons at sunrise.', lat: 38.6431, lng: 34.829, difficulty: 'medium', radiusKm: 40 },
  { id: 'pamukkale', name: 'Pamukkale', clue: 'A Turkish hillside of brilliant white calcium terraces and warm thermal pools that look like a cotton castle.', lat: 37.9202, lng: 29.1203, difficulty: 'medium', radiusKm: 10 },
  { id: 'waitomo-caves', name: 'Waitomo Glowworm Caves', clue: 'New Zealand caverns whose ceiling lights are not stars but thousands of bioluminescent worms.', lat: -38.2597, lng: 175.1054, difficulty: 'hard', radiusKm: 10 },
  { id: 'fly-geyser', name: 'Fly Geyser', clue: "An accidental man-made geyser in Nevada's Black Rock Desert, erupting in otherworldly mineral terraces.", lat: 40.8596, lng: -119.3322, difficulty: 'hard', radiusKm: 10 },
  { id: 'salar-de-uyuni', name: 'Salar de Uyuni', clue: "The world's largest salt flat becomes an infinite mirror after rain on the Bolivian altiplano.", lat: -20.1338, lng: -67.4891, difficulty: 'medium', radiusKm: 100 },
  { id: 'zhangjiajie', name: 'Zhangjiajie', clue: 'Thousands of sandstone pillars rising from mist in China, the real-world inspiration for floating mountains in Avatar.', lat: 29.3174, lng: 110.4344, difficulty: 'medium', radiusKm: 20 },
  { id: 'lake-bled', name: 'Lake Bled', clue: 'A glacial Slovenian lake with a tiny island and a church reachable only by wooden rowboat.', lat: 46.3683, lng: 14.1146, difficulty: 'medium', radiusKm: 10 },
  { id: 'antelope-canyon', name: 'Antelope Canyon', clue: 'A slot canyon carved by flash floods in the American Southwest, famous for shafts of light filtering through swirling sandstone.', lat: 36.8619, lng: -111.3743, difficulty: 'medium', radiusKm: 10 },
  { id: 'tianmen-cave', name: 'Tianmen Cave', clue: "A massive natural arch in a Chinese mountain, reached by one of the world's longest cable car rides.", lat: 29.0534, lng: 110.4793, difficulty: 'hard', radiusKm: 10 },
  { id: 'white-cliffs-dover', name: 'White Cliffs of Dover', clue: 'Chalk cliffs so iconic they became a symbol of England itself, facing France across the narrowest sea crossing.', lat: 51.1293, lng: 1.3717, difficulty: 'medium', radiusKm: 15 },
  { id: 'pinnacles-desert', name: 'Pinnacles Desert', clue: 'Thousands of jagged limestone spires rise from a yellow desert within sight of the Indian Ocean in Western Australia.', lat: -30.597, lng: 115.156, difficulty: 'hard', radiusKm: 20 },
  { id: 'halong-bay', name: 'Ha Long Bay', clue: "Thousands of limestone islets pierce the emerald waters of a Vietnamese bay like a dragon's spine.", lat: 20.9101, lng: 107.1839, difficulty: 'medium', radiusKm: 40 },
  { id: 'mount-roraima', name: 'Mount Roraima', clue: "A flat-topped ancient plateau at the junction of Venezuela, Brazil, and Guyana that inspired Conan Doyle's Lost World.", lat: 5.1425, lng: -60.7623, difficulty: 'hard', radiusKm: 15 },

  // ─── COASTAL & POLAR ────────────────────────────────────────────────
  { id: 'amalfi-coast', name: 'Amalfi Coast', clue: "Pastel villages cling to vertiginous cliffs above the Mediterranean on Italy's finger-shaped peninsula.", lat: 40.6333, lng: 14.6029, difficulty: 'medium', radiusKm: 30 },
  { id: 'fiordland', name: 'Fiordland (Milford Sound)', clue: 'Often called the eighth wonder of the world — a deep New Zealand fjord framed by waterfalls and sheer peaks.', lat: -44.6414, lng: 167.8974, difficulty: 'medium', radiusKm: 15 },
  { id: 'antarctic-peninsula', name: 'Antarctic Peninsula', clue: "The most accessible part of Earth's frozen continent, where penguins crowd beaches of black volcanic rock.", lat: -64.5, lng: -62.5, difficulty: 'medium', radiusKm: 200 },
  { id: 'cape-horn', name: 'Cape Horn', clue: 'The southernmost point of the Americas, a rocky headland feared by sailors for centuries of tempestuous seas.', lat: -55.9833, lng: -67.2667, difficulty: 'hard', radiusKm: 15 },
  { id: 'skeleton-coast', name: 'Skeleton Coast', clue: "A graveyard of shipwrecks stretches along Namibia's foggy Atlantic shore, where deserts meet the cold Benguela current.", lat: -21.0, lng: 13.5, difficulty: 'hard', radiusKm: 100 },
  { id: 'twelve-apostles', name: 'Twelve Apostles', clue: 'Sea stacks jutting from wild Southern Ocean waters along a famous Australian coast drive.', lat: -38.6627, lng: 143.1047, difficulty: 'medium', radiusKm: 20 },
  { id: 'lofoten-islands', name: 'Lofoten Islands', clue: 'Red fishing huts perch over a Norwegian archipelago above the Arctic Circle, ringed by dramatic peaks.', lat: 68.157, lng: 13.997, difficulty: 'medium', radiusKm: 50 },

  // ─── ARCHAEOLOGICAL SITES ───────────────────────────────────────────
  { id: 'teotihuacan', name: 'Teotihuacán', clue: 'An ancient Mexican city of pyramids so vast it was once the sixth-largest in the world — its builders remain unknown.', lat: 19.6925, lng: -98.8438, difficulty: 'medium', radiusKm: 10 },
  { id: 'chichen-itza', name: 'Chichen Itzá', clue: "A Mayan pyramid that casts a serpent shadow on each equinox, in Mexico's Yucatán jungle.", lat: 20.6843, lng: -88.5678, difficulty: 'easy', radiusKm: 10 },
  { id: 'pompeii', name: 'Pompeii', clue: 'A Roman city frozen in ash and time by a volcanic eruption in 79 AD, near Naples in southern Italy.', lat: 40.7491, lng: 14.4989, difficulty: 'easy', radiusKm: 8 },
  { id: 'great-zimbabwe', name: 'Great Zimbabwe', clue: "Sub-Saharan Africa's largest ancient stone ruins, a medieval city that gave its country a name.", lat: -20.2667, lng: 30.9333, difficulty: 'hard', radiusKm: 10 },
  { id: 'gobekli-tepe', name: 'Göbekli Tepe', clue: "The world's oldest known temple complex, built 6,000 years before Stonehenge on a hilltop in southeastern Turkey.", lat: 37.2232, lng: 38.9224, difficulty: 'hard', radiusKm: 10 },
  { id: 'nazca-lines', name: 'Nazca Lines', clue: 'Enormous geoglyphs etched into a Peruvian plateau that are only fully visible from the air above the desert.', lat: -14.739, lng: -75.13, difficulty: 'medium', radiusKm: 40 },
  { id: 'luxor-temple', name: 'Luxor Temple', clue: 'A pharaonic temple complex on the banks of the Nile in what was once the greatest city of the ancient world.', lat: 25.6997, lng: 32.6392, difficulty: 'medium', radiusKm: 8 },

  // ─── FAMOUS BRIDGES & INFRASTRUCTURE ───────────────────────────────
  { id: 'golden-gate-bridge', name: 'Golden Gate Bridge', clue: 'A rust-orange suspension bridge that has graced countless postcards from a fog-prone California bay.', lat: 37.8199, lng: -122.4783, difficulty: 'easy', radiusKm: 5 },
  { id: 'zhangjiajie-glass-bridge', name: 'Zhangjiajie Glass Bridge', clue: "The world's longest and highest glass-bottomed bridge, suspended between canyon peaks in China.", lat: 29.1847, lng: 110.393, difficulty: 'hard', radiusKm: 10 },
  { id: 'rialto-bridge', name: 'Rialto Bridge', clue: 'The oldest bridge spanning the Grand Canal of a sinking Italian city famed for gondolas.', lat: 45.438, lng: 12.3358, difficulty: 'medium', radiusKm: 5 },

  // ─── VOLCANOES ──────────────────────────────────────────────────────
  { id: 'mount-etna', name: 'Mount Etna', clue: "Europe's tallest and most active volcano, looming over a triangular island famous for ancient history and cuisine.", lat: 37.751, lng: 14.9934, difficulty: 'medium', radiusKm: 20 },
  { id: 'mount-pinatubo', name: 'Mount Pinatubo', clue: "A Philippine volcano whose 1991 eruption was one of the 20th century's largest, now filled with a turquoise crater lake.", lat: 15.1429, lng: 120.35, difficulty: 'hard', radiusKm: 15 },
  { id: 'santorini-caldera', name: 'Santorini Caldera', clue: 'A Greek archipelago shaped by a Bronze Age explosion so massive it may have inspired the myth of Atlantis.', lat: 36.4018, lng: 25.3962, difficulty: 'easy', radiusKm: 20 },
  { id: 'mount-nyiragongo', name: 'Mount Nyiragongo', clue: "An African volcano containing the world's largest and most active lava lake, overlooking a turbulent Congolese city.", lat: -1.5215, lng: 29.2495, difficulty: 'hard', radiusKm: 15 },

  // ─── PLAINS, STEPPES & SAVANNAS ─────────────────────────────────────
  { id: 'serengeti', name: 'Serengeti', clue: 'An endless Tanzanian plain where the largest land animal migration on Earth passes twice a year.', lat: -2.3333, lng: 34.8333, difficulty: 'easy', radiusKm: 150 },
  { id: 'mongolian-steppe', name: 'Mongolian Steppe', clue: 'An ocean of grass stretching from the Gobi to the Altai, where eagle hunters on horseback keep ancient traditions.', lat: 47.0, lng: 103.0, difficulty: 'hard', radiusKm: 250 },
  { id: 'outback-uluru', name: 'Uluru', clue: "A sacred sandstone monolith that glows crimson at sunset, rising from flat red desert in Australia's heart.", lat: -25.3444, lng: 131.0369, difficulty: 'easy', radiusKm: 10 },
  { id: 'okavango-delta', name: 'Okavango Delta', clue: 'A vast inland river delta where the water never reaches the sea, forming an Eden in the middle of the Kalahari.', lat: -19.3, lng: 22.8, difficulty: 'medium', radiusKm: 100 },

  // ─── UNIQUE CULTURAL SITES ──────────────────────────────────────────
  { id: 'varanasi-ghats', name: 'Varanasi Ghats', clue: 'Stone steps descending to a sacred Indian river where funeral pyres burn day and night in the holiest city of Hinduism.', lat: 25.3176, lng: 83.0088, difficulty: 'medium', radiusKm: 10 },
  { id: 'burning-man-site', name: 'Black Rock Desert (Burning Man)', clue: 'A vast, flat alkali playa in Nevada where tens of thousands gather annually to build a temporary city that vanishes without a trace.', lat: 40.786, lng: -119.2065, difficulty: 'hard', radiusKm: 30 },
  { id: 'zhouzhuang', name: 'Zhouzhuang', clue: "China's most famous water town, a labyrinth of ancient canals and arched stone bridges near Shanghai.", lat: 31.1038, lng: 120.8437, difficulty: 'hard', radiusKm: 10 },
  { id: 'lalibela', name: 'Lalibela Rock-Hewn Churches', clue: 'Eleven medieval Christian churches carved entirely downward into solid red volcanic rock in the Ethiopian highlands.', lat: 12.0315, lng: 39.0447, difficulty: 'hard', radiusKm: 10 },
  { id: 'meteora', name: 'Meteora', clue: 'Monasteries perched atop impossibly thin rock pillars in central Greece, accessible for centuries only by rope ladders.', lat: 39.7217, lng: 21.6306, difficulty: 'medium', radiusKm: 15 },
  { id: 'palacio-potala', name: 'Potala Palace', clue: 'A thirteen-story white-and-red fortress-palace built on a hill above the highest capital city in the world.', lat: 29.6578, lng: 91.1175, difficulty: 'medium', radiusKm: 10 },

  // ─── UNUSUAL / HIDDEN GEMS ──────────────────────────────────────────
  { id: 'surtsey', name: 'Surtsey Island', clue: "An Icelandic island that didn't exist before 1963, born from an underwater volcanic eruption and still being colonized by life.", lat: 63.3, lng: -20.6, difficulty: 'hard', radiusKm: 15 },
  { id: 'point-nemo', name: 'Point Nemo', clue: 'The most remote point in any ocean — the oceanic pole of inaccessibility, where the nearest humans are often astronauts overhead.', lat: -48.8767, lng: -123.3933, difficulty: 'hard', radiusKm: 200 },
  { id: 'dallol', name: 'Dallol Volcanic Area', clue: 'The hottest inhabited place on Earth, a psychedelic landscape of acid pools and yellow sulfur mounds below sea level in Ethiopia.', lat: 14.2417, lng: 40.2997, difficulty: 'hard', radiusKm: 20 },
  { id: 'crooked-forest', name: 'Crooked Forest', clue: 'A grove of 400 pine trees in western Poland, all bent at a 90-degree angle at the base — the cause remains a mystery.', lat: 53.2152, lng: 14.4756, difficulty: 'hard', radiusKm: 10 },
  { id: 'red-beach-panjin', name: 'Red Beach, Panjin', clue: "A Chinese coastal wetland carpeted brilliant crimson by seepweed each autumn, one of the world's most unusual vistas.", lat: 40.9333, lng: 121.8167, difficulty: 'hard', radiusKm: 20 },
  { id: 'chocolate-hills', name: 'Chocolate Hills', clue: 'Over a thousand perfectly dome-shaped hills turn brown in the dry season on a Philippine island, resembling giant candies.', lat: 9.8007, lng: 124.1694, difficulty: 'hard', radiusKm: 20 },
  { id: 'blue-hole-belize', name: 'Great Blue Hole, Belize', clue: 'A perfectly circular marine sinkhole off the Caribbean coast, appearing as a dark sapphire disc in turquoise shallows.', lat: 17.3164, lng: -87.535, difficulty: 'hard', radiusKm: 10 },
  { id: 'sichuan-jiuzhaigou', name: 'Jiuzhaigou Valley', clue: 'A Chinese valley of multicolored lakes ranging from emerald to sapphire, fed by minerals from the Tibetan Plateau.', lat: 33.2, lng: 103.917, difficulty: 'hard', radiusKm: 20 },
]

export function getLocationById(id: string): Location | undefined {
  return locations.find(l => l.id === id)
}

export function getLocationsByIds(ids: string[]): Location[] {
  return ids.map(id => getLocationById(id)).filter((l): l is Location => l !== undefined)
}

export function getRandomLocations(count: number): Location[] {
  const shuffled = [...locations].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

export function getRandomLocationIds(count: number): string[] {
  return getRandomLocations(count).map(l => l.id)
}

// Calculate distance between two points using Haversine formula
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c // Distance in km
}

// Format distance for display
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} m`
  } else if (km < 100) {
    return `${km.toFixed(1)} km`
  } else {
    return `${Math.round(km).toLocaleString()} km`
  }
}

// Check if a guess is within the acceptable radius for a location
export function isOnTarget(distance: number, location: Location): boolean {
  return distance <= location.radiusKm
}

/**
 * Fetch locations from Supabase with fallback to hardcoded data.
 * Results are cached for 5 minutes to reduce database calls.
 */
export async function fetchLocations(): Promise<Location[]> {
  const now = Date.now()

  // Return cached data if still valid
  if (cachedLocations && (now - cacheTimestamp) < CACHE_DURATION_MS) {
    return cachedLocations
  }

  try {
    const { data, error } = await supabase
      .from('game_locations')
      .select('id, name, clue, lat, lng, difficulty, radius_km')
      .eq('enabled', true)

    if (error) {
      console.error('Error fetching locations from Supabase:', error)
      return locations // Fall back to hardcoded
    }

    if (data && data.length > 0) {
      // Convert database response to Location type
      cachedLocations = data.map(loc => ({
        id: loc.id,
        name: loc.name,
        clue: loc.clue,
        lat: Number(loc.lat),
        lng: Number(loc.lng),
        difficulty: loc.difficulty as 'easy' | 'medium' | 'hard',
        radiusKm: Number(loc.radius_km) || 25, // Default to 25km if not specified
      }))
      cacheTimestamp = now
      return cachedLocations
    }

    // No data in database, use hardcoded
    return locations
  } catch (err) {
    console.error('Failed to fetch locations:', err)
    return locations // Fall back to hardcoded
  }
}

/**
 * Get all locations - combines database and hardcoded content.
 * Prefers database content when available.
 */
export async function getAllLocations(): Promise<Location[]> {
  const dbLocations = await fetchLocations()

  // If we got locations from DB, use those (they may be the same as hardcoded)
  if (dbLocations !== locations) {
    return dbLocations
  }

  // Fall back to hardcoded
  return locations
}

/**
 * Get random locations - async version that fetches from DB first.
 */
export async function getRandomLocationsAsync(count: number): Promise<Location[]> {
  const allLocations = await getAllLocations()
  const shuffled = [...allLocations].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Clear the location cache (useful for testing or after imports).
 */
export function clearLocationCache(): void {
  cachedLocations = null
  cacheTimestamp = 0
}
