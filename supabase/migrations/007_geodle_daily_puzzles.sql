-- Geodle Daily Puzzles Table
-- Stores curated puzzles for the daily puzzle feature
CREATE TABLE geodle_daily_puzzles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  play_date DATE UNIQUE,                     -- NULL for drafts, date when puzzle is active
  status TEXT DEFAULT 'draft'
    CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  countries JSONB NOT NULL,                  -- [{name: string, hints: string[4]}]
  title TEXT,                                -- Optional puzzle title/theme
  difficulty TEXT DEFAULT 'medium'
    CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Analytics fields (updated by triggers/functions)
  times_played INTEGER DEFAULT 0,
  avg_guesses DECIMAL,
  completion_rate DECIMAL
);

-- Index for quickly finding today's puzzle
CREATE INDEX idx_geodle_daily_puzzles_play_date ON geodle_daily_puzzles(play_date);
CREATE INDEX idx_geodle_daily_puzzles_status ON geodle_daily_puzzles(status);

-- Enable RLS
ALTER TABLE geodle_daily_puzzles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Anyone can read published puzzles
CREATE POLICY "Published puzzles are viewable by all"
  ON geodle_daily_puzzles FOR SELECT
  USING (status = 'published');

-- Admins can do everything (checked via email in application layer)
-- For now, any authenticated user can manage puzzles
-- In production, you'd add a proper admin check
CREATE POLICY "Authenticated users can manage puzzles"
  ON geodle_daily_puzzles FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_geodle_daily_puzzles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_geodle_daily_puzzles_updated_at
  BEFORE UPDATE ON geodle_daily_puzzles
  FOR EACH ROW EXECUTE FUNCTION update_geodle_daily_puzzles_updated_at();

-- Auto-publish scheduled puzzles when their date arrives
-- This should be run via a cron job or Supabase edge function
CREATE OR REPLACE FUNCTION publish_scheduled_puzzles()
RETURNS void AS $$
BEGIN
  UPDATE geodle_daily_puzzles
  SET status = 'published'
  WHERE status = 'scheduled'
    AND play_date <= CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;
