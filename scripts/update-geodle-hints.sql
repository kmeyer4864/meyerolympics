-- Script to remove and replace Geodle country hints
-- Run this in Supabase SQL Editor after running migration 006_geodle_countries.sql

-- First, delete all existing countries
DELETE FROM geodle_countries;

-- Insert new countries with hints
INSERT INTO geodle_countries (id, name, hints) VALUES
(
  'norway',
  'Norway',
  ARRAY[
    'This country has more electric vehicles per capita than anywhere else on Earth — over 25% of all cars on its roads are fully electric.',
    'This Nordic nation sits on a peninsula sharing land borders with two Scandinavian neighbors, with its dramatic western coastline carved by ancient glaciers into the world''s deepest fjords.',
    'Home to roughly 5 million people, this country consistently ranks #1 on the Human Development Index and funds the world''s largest sovereign wealth fund — built entirely on oil money.',
    'This country is home to the Northern Lights, the Midnight Sun, and a thousand-year-old tradition of Viking heritage that''s inspired global pop culture.',
    'Its capital city sits at the head of a long fjord in the southeast, and the country stretches so far north that about a third of it lies above the Arctic Circle.',
    'This country''s flag features a red background with a blue cross outlined in white, a design shared by its Scandinavian neighbors.'
  ]
),
(
  'peru',
  'Peru',
  ARRAY[
    'This country is home to more than 3,000 varieties of potato — the crop was first domesticated here roughly 8,000 years ago, and the world owes it a debt for every french fry ever eaten.',
    'This South American nation spans three dramatically different climates — a coastal desert, a towering Andean mountain range, and a vast stretch of the Amazon basin — all within a single country.',
    'With around 33 million people, this country''s main language is Spanish, but millions also speak Quechua, the language of the ancient empire that once ruled the entire western coast of the continent.',
    'This country is home to Machu Picchu, a 15th-century Incan citadel perched at 2,430 meters in the Andes that was unknown to the outside world until 1911.',
    'Its capital is one of the largest cities in South America and sits on the Pacific coast, while Lake Titicaca — the world''s highest navigable lake — sits on its eastern border.',
    'This country''s flag is a vertical tricolor of red, white, and red with a coat of arms at the center featuring a vicuña, a cinchona tree, and a cornucopia.'
  ]
),
(
  'ethiopia',
  'Ethiopia',
  ARRAY[
    'This country uses its own calendar — 13 months long — which means it celebrated the year 2000 in what the rest of the world called 2007, and currently runs about 7 years behind the Gregorian calendar.',
    'Located in the Horn of Africa, this landlocked nation sits on a high plateau surrounded by lower, hotter neighbors, making its capital one of the highest-altitude capital cities on Earth.',
    'With over 120 million people, this is the second most populous country on its continent, and it''s home to more UNESCO World Heritage Sites than any other African nation.',
    'This country is considered the birthplace of coffee — the word ''coffee'' itself is thought to derive from the name of one of its regions — and it remains one of the world''s top coffee exporters.',
    'Its capital, Addis Ababa, is the headquarters of the African Union, and the country is notable for being one of only two African nations never colonized by a European power.',
    'This country''s flag features three horizontal stripes of green, yellow, and red with a blue circle and yellow star at the center.'
  ]
),
(
  'new-zealand',
  'New Zealand',
  ARRAY[
    'This country was the first in the world to give women the right to vote nationally, doing so in 1893 — a full 27 years before the United States.',
    'This island nation in the southwestern Pacific sits on the boundary of two tectonic plates, giving it frequent earthquakes, geothermal activity, and some of the youngest mountain ranges on Earth.',
    'Home to only around 5 million people, this country has more sheep than humans (about 5 to 1), and its indigenous Māori culture is one of the most actively preserved in the world.',
    'This country served as the filming location for all three Lord of the Rings films, and its landscapes — from volcanic peaks to fiords — have made it one of the world''s top adventure tourism destinations.',
    'Its largest city is Auckland, a metropolis built across a volcanic field, but its capital is the smaller city of Wellington at the southern tip of the North Island.',
    'This country''s flag features a dark blue background with the Union Jack in the upper left corner and four red stars outlined in white, representing the Southern Cross constellation.'
  ]
),
(
  'hungary',
  'Hungary',
  ARRAY[
    'This country''s language is so unlike its neighbors'' that linguists classify it as a Uralic language — more closely related to Finnish and Estonian than to any of the surrounding European tongues.',
    'This landlocked Central European nation sits in the Carpathian Basin, surrounded on most sides by mountain ranges it doesn''t own, with a major river cutting through its capital.',
    'With around 10 million people, this country was once the junior partner in one of history''s most powerful dual monarchies, controlling a vast empire until its collapse after World War I.',
    'This country is home to one of the world''s largest thermal lake systems and claims Budapest, a city often described as the Paris of the East, where more than 100 thermal springs bubble up beneath the streets.',
    'Its capital, Budapest, was formed by merging three cities — Buda, Óbuda, and Pest — on either side of the Danube in 1873, and is the largest city in Central Europe.',
    'This country''s flag is a horizontal tricolor of red, white, and green — identical in colors to Italy''s flag but displayed horizontally rather than vertically.'
  ]
),
(
  'chile',
  'Chile',
  ARRAY[
    'This country is so long and narrow that if you rotated it 90 degrees and laid it across the US, it would stretch from New York to Los Angeles — yet it averages only about 177 km wide.',
    'Running along the entire western edge of a continent, this country contains the world''s driest non-polar desert in its north and glacial fjords in its south, with the Andes forming its entire eastern spine.',
    'With around 19 million people, this South American nation is the world''s top producer of copper — responsible for roughly a quarter of global supply — and also one of its top wine exporters.',
    'This country is home to the Atacama Desert, where some weather stations have never recorded a single drop of rain, and Easter Island — a remote Pacific territory famous for its giant stone heads.',
    'Its capital, Santiago, sits in a central valley between the Andes and the lower coastal range, and the country stretches so far south it claims a slice of Antarctica.',
    'This country''s flag features two horizontal bands — red on the bottom and white on top — with a blue square in the upper left bearing a single white five-pointed star.'
  ]
),
(
  'cambodia',
  'Cambodia',
  ARRAY[
    'This country suffered one of the worst genocides of the 20th century in the 1970s, during which nearly a quarter of its entire population was killed in under four years.',
    'This Southeast Asian nation is dominated by a vast freshwater lake at its center that dramatically expands to six times its size during the monsoon season — one of the most productive freshwater fisheries on Earth.',
    'With around 17 million people, this country''s dominant religion is Theravada Buddhism, practiced by over 95% of the population, and its ancient empire once controlled much of mainland Southeast Asia.',
    'This country is home to Angkor Wat, the world''s largest religious monument, a 12th-century Hindu-Buddhist temple complex whose silhouette appears on the national flag.',
    'Its capital is Phnom Penh, located at the confluence of the Mekong and Tonlé Sap rivers, and the country borders Vietnam to the east and Thailand to the northwest.',
    'This country''s flag features three horizontal bands of blue, red, and blue, with a white depiction of Angkor Wat temple in the center — the only national flag to feature a building.'
  ]
),
(
  'ghana',
  'Ghana',
  ARRAY[
    'This country is home to Lake Volta, one of the world''s largest man-made reservoirs by surface area, created in 1965 by damming a major river — an infrastructure project that displaced around 80,000 people.',
    'Sitting right on the Greenwich Meridian and almost exactly on the equator, this West African nation is geographically one of the closest countries on Earth to the coordinate (0°, 0°).',
    'With around 33 million people, this was the first sub-Saharan African country to gain independence from colonial rule, in 1957, becoming a symbol of the broader African liberation movement.',
    'This country is the world''s second-largest cocoa producer, responsible for roughly 20% of global supply, and its capital city was a key hub in the transatlantic slave trade with well-preserved coastal forts still standing today.',
    'Its capital is Accra, a fast-growing coastal metropolis on the Gulf of Guinea, and the country is widely considered one of West Africa''s most stable democracies.',
    'This country''s flag features three horizontal bands of red, gold, and green with a black five-pointed star at the center — the first African flag to use the Pan-African colors.'
  ]
),
(
  'iceland',
  'Iceland',
  ARRAY[
    'Despite its name, this country is actually quite green and temperate in coastal areas — it was reportedly named to discourage settlement, while its icy neighbor was given a more appealing name to attract settlers.',
    'This island nation straddles the Mid-Atlantic Ridge, meaning it sits directly on the boundary between two tectonic plates that are slowly pulling apart — adding about 2.5 cm of new land each year.',
    'With only around 370,000 people — roughly the population of a mid-sized American city — this country has the oldest functioning parliament in the world, established in 930 AD.',
    'This volcanic island nation is home to geysers, hot springs, and more active volcanoes per square kilometer than almost anywhere on Earth — one eruption in 2010 grounded flights across Europe for weeks.',
    'Its capital, Reykjavík, is the world''s northernmost capital of a sovereign state, and the country is located just south of the Arctic Circle in the North Atlantic.',
    'This country''s flag features a red cross with a white outline on a deep blue background — a Nordic cross design similar to its Scandinavian neighbors.'
  ]
),
(
  'uzbekistan',
  'Uzbekistan',
  ARRAY[
    'This country is one of only two doubly landlocked nations on Earth — meaning you have to cross at least two borders to reach any ocean, no matter which direction you travel.',
    'This Central Asian nation sits in the heart of the ancient Silk Road trade routes, surrounded entirely by other landlocked countries, and bordered by a shrinking inland sea that was once the fourth-largest lake in the world.',
    'With around 36 million people, the most populous country in Central Asia, this nation''s primary language belongs to the Turkic family, and it was a major Soviet republic until 1991.',
    'This country is home to Samarkand, one of the oldest continuously inhabited cities on Earth and a legendary crossroads of civilizations, where the conqueror Timur built some of the Islamic world''s most breathtaking blue-tiled architecture.',
    'Its capital is Tashkent, the largest city in Central Asia, and the country is the world''s fifth or sixth-largest cotton exporter — a legacy of Soviet-era agricultural policy that helped drain the Aral Sea.',
    'This country''s flag features three horizontal bands of blue, white, and green separated by thin red lines, with a crescent moon and twelve stars on the blue stripe.'
  ]
),
(
  'ecuador',
  'Ecuador',
  ARRAY[
    'Despite being named after the equator, which runs directly through it, this small country is also home to one of the world''s highest active volcanoes and serves as the origin of the Panama hat — which was never actually made in Panama.',
    'This South American nation has more plant and animal species per square kilometer than almost anywhere on Earth, spanning Pacific coast, Andean highlands, and Amazon rainforest all within a compact territory.',
    'With around 18 million people, this country was the first in the world to grant constitutional rights to nature — a radical legal concept enshrined in its 2008 constitution.',
    'This country governs the Galápagos Islands, roughly 1,000 km off its coast, where Charles Darwin''s observations of unique wildlife helped inspire his theory of evolution by natural selection.',
    'Its capital, Quito, sits at an altitude of 2,850 meters in the Andes and is the closest capital city to the equator, while its largest city and main port, Guayaquil, lies on the Pacific coast.',
    'This country''s flag features three horizontal bands of yellow (double-width), blue, and red, with a coat of arms at the center depicting a condor over a snow-capped volcano.'
  ]
),
(
  'czech-republic',
  'Czech Republic',
  ARRAY[
    'This country has the highest beer consumption per capita in the world — its citizens drink an average of around 180 liters of beer per person per year, more than any other nation on Earth.',
    'This landlocked Central European nation sits at the historical crossroads of the continent, surrounded by four neighbors, with mountain ranges forming most of its borders and a river system draining in two different directions.',
    'With around 11 million people, this country peacefully split from its former union partner in 1993 in what became known as the ''Velvet Divorce'' — one of history''s most amicable national separations.',
    'This country''s capital is home to one of Europe''s best-preserved medieval city centers, including a famous 14th-century astronomical clock that''s been telling time (and drawing crowds) for over 600 years.',
    'Its capital, Prague, is nicknamed the ''City of a Hundred Spires'' and sits on the Vltava River; the country also has the highest concentration of UNESCO-listed town centers in Europe.',
    'This country''s flag features two horizontal bands — white on top and red on bottom — with a blue triangle extending from the left side to the center.'
  ]
),
(
  'mozambique',
  'Mozambique',
  ARRAY[
    'This country''s flag is the only national flag in the world to feature an AK-47 assault rifle, included as a symbol of its armed struggle for independence — alongside a hoe and an open book.',
    'Stretching along the southeastern coast of a major continent, this nation has one of the longest coastlines on its landmass — over 2,700 km — bordering a named channel that separates it from a large island nation.',
    'With around 33 million people, this country was a Portuguese colony until 1975, making it one of only a handful of African nations where Portuguese is the official language.',
    'This country is home to the Zambezi River and Victoria Falls (shared with a northern neighbor), as well as some of Africa''s premier marine national parks, where whale sharks and manta rays gather in great numbers.',
    'Its capital is Maputo, a port city in the far south of the country near the border with South Africa, while the rest of the country stretches over 1,800 km to the north along the Indian Ocean.',
    'This country''s flag features a horizontal tricolor of green, black, and yellow separated by thin white lines, with a red triangle on the left side containing a yellow star, an open book, a hoe, and an AK-47.'
  ]
),
(
  'mongolia',
  'Mongolia',
  ARRAY[
    'This country has the lowest population density of any sovereign nation on Earth — with roughly 2 people per square kilometer, you could fit all of its residents in a single large city and leave the rest of the country completely empty.',
    'This landlocked nation is hemmed in by two of the world''s largest countries — one to the north and one to the south — and contains both one of the world''s coldest deserts and vast open grasslands called steppes.',
    'With around 3.3 million people spread over a territory the size of Western Europe, this country has more horses than people, and a significant portion of the population still lives a nomadic or semi-nomadic herding lifestyle.',
    'This country was the heart of the largest contiguous land empire in history, founded in the 13th century by a warlord whose direct male-line descendants may account for roughly 1 in 200 men alive today.',
    'Its capital, Ulaanbaatar, is the world''s coldest capital city, averaging temperatures well below freezing for much of the year, while the southern third of the country is dominated by the Gobi Desert.',
    'This country''s flag features three vertical bands — red, blue, and red — with a golden Soyombo symbol on the left red band, a complex national emblem representing freedom and independence.'
  ]
),
(
  'portugal',
  'Portugal',
  ARRAY[
    'This country established the world''s oldest surviving bookshop still operating at its original location — the Livraria Bertrand in Lisbon, open since 1732 — and is also credited with inventing the concept of a ''global trade network'' in the 15th century.',
    'Occupying the southwestern tip of a major continental peninsula, this Atlantic-facing nation has just one land neighbor and was historically one of the first European empires to establish overseas colonies and one of the last to relinquish them.',
    'With around 10 million people on the mainland (plus two Atlantic archipelagos it governs), this country''s language is spoken by over 250 million people worldwide — the official language of Brazil, Angola, Mozambique, and several other nations.',
    'This country is the world''s largest producer of cork, supplying roughly half of global output, and is also famous for its melancholic musical genre called fado, which UNESCO recognizes as intangible cultural heritage.',
    'Its capital, Lisbon, is one of Europe''s oldest and westernmost capitals, known for its steep hills, yellow trams, and historic neighborhoods; the country also governs the Azores islands in the mid-Atlantic.',
    'This country''s flag features two vertical bands — a wider red section on the right and a narrower green section on the left — with the national coat of arms centered on the boundary between the two colors.'
  ]
);

-- Verify the insert
SELECT id, name, array_length(hints, 1) as hint_count FROM geodle_countries ORDER BY name;
