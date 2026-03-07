-- Game content tables for storing geography locations and flashback puzzles
-- These tables allow content to be managed separately from the codebase

-- Geography locations table
CREATE TABLE game_locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  clue TEXT NOT NULL,
  lat DECIMAL NOT NULL CHECK (lat >= -90 AND lat <= 90),
  lng DECIMAL NOT NULL CHECK (lng >= -180 AND lng <= 180),
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering by difficulty and enabled status
CREATE INDEX idx_game_locations_difficulty ON game_locations(difficulty) WHERE enabled = true;
CREATE INDEX idx_game_locations_enabled ON game_locations(enabled);

-- Comment
COMMENT ON TABLE game_locations IS 'Geography game locations - can be managed via import script';

-- Enable RLS
ALTER TABLE game_locations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Locations are viewable by all" ON game_locations FOR SELECT USING (true);

-- Flashback puzzles table
CREATE TABLE game_puzzles (
  id TEXT PRIMARY KEY,
  theme TEXT NOT NULL,
  events JSONB NOT NULL,  -- Array of {id, description, year}
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering enabled puzzles
CREATE INDEX idx_game_puzzles_enabled ON game_puzzles(enabled);

-- Comment
COMMENT ON TABLE game_puzzles IS 'Flashback timeline puzzles - can be managed via import script';

-- Enable RLS
ALTER TABLE game_puzzles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Puzzles are viewable by all" ON game_puzzles FOR SELECT USING (true);
