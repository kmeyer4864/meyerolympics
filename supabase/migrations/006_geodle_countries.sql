-- Geodle countries table for storing country hints
-- Hints are ordered from hardest (index 0) to easiest (index 5)

CREATE TABLE geodle_countries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  hints TEXT[] NOT NULL CHECK (array_length(hints, 1) = 6),
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for filtering enabled countries
CREATE INDEX idx_geodle_countries_enabled ON geodle_countries(enabled);

-- Comment
COMMENT ON TABLE geodle_countries IS 'Geodle game countries with 6 hints each (hardest to easiest)';

-- Enable RLS
ALTER TABLE geodle_countries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Countries are viewable by all" ON geodle_countries FOR SELECT USING (true);
