-- Update Flashback puzzles in Supabase
-- Run this in the Supabase SQL Editor

-- First, delete existing puzzles to avoid duplicates
DELETE FROM game_puzzles WHERE id LIKE 'puzzle-%';

-- Insert new puzzles
INSERT INTO game_puzzles (id, theme, events, enabled) VALUES
(
  'puzzle-fast-food-origins',
  'Fast Food Origins',
  '[
    {"id": "e1", "description": "A&W opens as a roadside root beer stand in Lodi, California — the first fast food franchise in America", "year": 1919},
    {"id": "e2", "description": "White Castle introduces the first hamburger chain, selling tiny sliders for five cents each", "year": 1921},
    {"id": "e3", "description": "Harland Sanders opens a gas station diner in Corbin, Kentucky, frying chicken in a cast-iron skillet", "year": 1930},
    {"id": "e4", "description": "Two brothers named McDonald open a drive-in barbecue restaurant in San Bernardino, California", "year": 1940},
    {"id": "e5", "description": "Burger King is founded in Jacksonville, Florida, calling itself \"Insta-Burger King\" after its flame-broiling machine", "year": 1953},
    {"id": "e6", "description": "Ray Kroc opens the first franchise McDonald''s in Des Plaines, Illinois, after visiting the McDonald brothers", "year": 1955},
    {"id": "e7", "description": "Domino''s Pizza is born when Tom Monaghan buys a struggling Michigan pizzeria for $500", "year": 1960},
    {"id": "e8", "description": "Wendy''s opens its first restaurant in Columbus, Ohio, distinguished by its founder''s signature square patties", "year": 1969},
    {"id": "e9", "description": "A Chipotle burrito stand opens next to a Denver University campus, funded by an $85,000 loan from Steve Ells''s father", "year": 1993}
  ]'::jsonb,
  true
),
(
  'puzzle-animals-in-history',
  'When Animals Made History',
  '[
    {"id": "e1", "description": "Jumbo the elephant is sold by London Zoo to P.T. Barnum''s circus, triggering mass public outrage in Britain", "year": 1882},
    {"id": "e2", "description": "A homing pigeon named Cher Ami delivers a critical message through enemy fire, saving 194 American soldiers in the Argonne Forest", "year": 1918},
    {"id": "e3", "description": "Balto the sled dog leads a diphtheria antitoxin relay through an Alaskan blizzard to Nome, saving the town from an epidemic", "year": 1925},
    {"id": "e4", "description": "A dog named Laika becomes the first living creature launched into Earth''s orbit aboard the Soviet Sputnik 2", "year": 1957},
    {"id": "e5", "description": "Ham the chimpanzee is launched into space by NASA and survives, proving animals — and soon humans — could endure spaceflight", "year": 1961},
    {"id": "e6", "description": "Koko the gorilla begins learning American Sign Language with researcher Penny Patterson in San Francisco", "year": 1972},
    {"id": "e7", "description": "Dolly the sheep is born in Scotland, the first mammal successfully cloned from an adult cell", "year": 1996},
    {"id": "e8", "description": "A border collie named Chaser is proven to recognize over 1,000 object names, the largest vocabulary ever documented in a non-human animal", "year": 2010},
    {"id": "e9", "description": "Scientists confirm that a Seychelles giant tortoise named Jonathan, still alive and healthy, hatched around 1832 — making him the oldest known living land animal", "year": 2022}
  ]'::jsonb,
  true
),
(
  'puzzle-women-first',
  'First Time a Woman…',
  '[
    {"id": "e1", "description": "Marie Curie becomes the first woman to win a Nobel Prize, taking home the Physics prize for her work on radioactivity", "year": 1903},
    {"id": "e2", "description": "Harriet Quimby becomes the first woman to pilot an airplane across the English Channel, dressed in her signature purple flying suit", "year": 1912},
    {"id": "e3", "description": "Amelia Earhart completes her solo nonstop transatlantic flight from Newfoundland to Northern Ireland in under 15 hours", "year": 1932},
    {"id": "e4", "description": "Hedy Lamarr co-patents a radio frequency-hopping system — the technology that would eventually underpin Wi-Fi and Bluetooth", "year": 1942},
    {"id": "e5", "description": "Sirimavo Bandaranaike of Sri Lanka becomes the world''s first female elected head of government", "year": 1960},
    {"id": "e6", "description": "Valentina Tereshkova orbits Earth 48 times in Vostok 6, becoming the first woman to fly in space", "year": 1963},
    {"id": "e7", "description": "Billie Jean King defeats Bobby Riggs in the televised \"Battle of the Sexes\" tennis match watched by 90 million people worldwide", "year": 1973},
    {"id": "e8", "description": "Wangari Maathai becomes the first African woman to win the Nobel Peace Prize for her environmental and democracy work in Kenya", "year": 2004},
    {"id": "e9", "description": "Kathryn Bigelow wins the Academy Award for Best Director for The Hurt Locker, the first woman ever to receive the honor", "year": 2010}
  ]'::jsonb,
  true
),
(
  'puzzle-plagues-pandemics',
  'Plagues & Pandemics',
  '[
    {"id": "e1", "description": "The Antonine Plague sweeps the Roman Empire, killing an estimated 5 million people and accelerating Rome''s decline", "year": 165},
    {"id": "e2", "description": "The Black Death reaches Sicily aboard Genoese trading ships, beginning a plague that will kill a third of Europe''s population", "year": 1347},
    {"id": "e3", "description": "Hernán Cortés''s arrival introduces smallpox to the Aztec Empire; the ensuing epidemic kills millions and helps topple Tenochtitlán", "year": 1520},
    {"id": "e4", "description": "A cholera pandemic originating in the Ganges Delta spreads across Asia, Europe, and the Americas in the first truly global epidemic", "year": 1817},
    {"id": "e5", "description": "The Spanish Flu erupts simultaneously among soldiers in Kansas and France, eventually killing more people than World War I itself", "year": 1918},
    {"id": "e6", "description": "Jonas Salk announces a successful vaccine against polio, ending fear of a disease that had paralyzed hundreds of thousands of children annually", "year": 1955},
    {"id": "e7", "description": "The World Health Organization declares the global eradication of smallpox, the only human disease ever to be completely wiped out", "year": 1980},
    {"id": "e8", "description": "The CDC publishes its first report on five cases of a mysterious immune disorder in gay men in Los Angeles — the first official notice of what becomes AIDS", "year": 1981},
    {"id": "e9", "description": "COVID-19 is declared a pandemic by the WHO as cases surge across more than 100 countries simultaneously", "year": 2020}
  ]'::jsonb,
  true
),
(
  'puzzle-older-younger-than-you-think',
  'Older (or Younger) Than You Think',
  '[
    {"id": "e1", "description": "The last woolly mammoths die on Wrangel Island in the Arctic Ocean — long after the pyramids of Giza were already ancient history", "year": -1650},
    {"id": "e2", "description": "The University of Bologna is founded in Italy — making it older than the Magna Carta, the Aztec Empire, and the Black Death", "year": 1088},
    {"id": "e3", "description": "Oxford University begins holding classes, predating the founding of the Aztec Empire by more than 200 years", "year": 1096},
    {"id": "e4", "description": "The Aztec city of Tenochtitlán is founded on an island in Lake Texcoco — younger than Oxford University by over a century", "year": 1325},
    {"id": "e5", "description": "The fax machine is patented by Scottish inventor Alexander Bain — 15 years before the telephone even exists", "year": 1843},
    {"id": "e6", "description": "Nintendo is founded in Kyoto as a playing card company, nearly a full century before it releases the NES", "year": 1889},
    {"id": "e7", "description": "The Eiffel Tower is completed in Paris and immediately declared an eyesore by critics who demand it be torn down", "year": 1889},
    {"id": "e8", "description": "The Ottoman Empire falls and Turkey is declared a republic — less than a century ago, and after the invention of the telephone", "year": 1923},
    {"id": "e9", "description": "The last public execution by guillotine takes place in France — the same year Star Wars is released in cinemas", "year": 1977}
  ]'::jsonb,
  true
);

-- Verify the insert
SELECT id, theme, jsonb_array_length(events) as event_count, enabled
FROM game_puzzles
WHERE id LIKE 'puzzle-%'
ORDER BY id;
