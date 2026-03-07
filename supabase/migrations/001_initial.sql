-- Competition Olympics Database Schema
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_golds INTEGER DEFAULT 0,
  total_silvers INTEGER DEFAULT 0,
  total_olympics INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Olympics (a single games instance between 2 players)
CREATE TABLE olympics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invite_code TEXT UNIQUE NOT NULL,           -- short shareable code e.g. "X7K9M2PQ"
  player1_id UUID REFERENCES profiles(id) NOT NULL,
  player2_id UUID REFERENCES profiles(id),   -- null until P2 joins
  status TEXT DEFAULT 'lobby'                -- lobby | active | complete
    CHECK (status IN ('lobby', 'active', 'complete')),
  event_sequence TEXT[] NOT NULL,            -- ordered array of EventType strings
  current_event_index INTEGER DEFAULT 0,
  player1_gold_count INTEGER DEFAULT 0,
  player2_gold_count INTEGER DEFAULT 0,
  winner_id UUID REFERENCES profiles(id),
  mode TEXT DEFAULT 'async'                  -- async | realtime
    CHECK (mode IN ('async', 'realtime')),
  -- Forfeit/timeout handling
  player1_forfeited_at TIMESTAMPTZ,
  player2_forfeited_at TIMESTAMPTZ,
  timeout_hours INTEGER DEFAULT 24,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Individual event instances within an Olympics
CREATE TABLE olympics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  olympics_id UUID REFERENCES olympics(id) ON DELETE CASCADE NOT NULL,
  event_index INTEGER NOT NULL,              -- position in the sequence
  event_type TEXT NOT NULL,                 -- matches EventType
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'p1_active', 'p2_active', 'p1_complete', 'p2_complete', 'complete')),
  gold_winner_id UUID REFERENCES profiles(id),
  -- Metadata for puzzle assignment (added per plan fix)
  metadata JSONB DEFAULT '{}',
  -- Timing for puzzle assignment and forfeit tracking
  started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual player results for each event
CREATE TABLE event_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  olympics_event_id UUID REFERENCES olympics_events(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES profiles(id) NOT NULL,
  score DECIMAL NOT NULL,                   -- normalized 0-100
  raw_value DECIMAL NOT NULL,               -- actual game metric
  metadata JSONB DEFAULT '{}',              -- game-specific data
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(olympics_event_id, player_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympics ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles viewable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

-- RLS Policies for olympics
CREATE POLICY "Olympics viewable by participants" ON olympics FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "Anyone can create olympics" ON olympics FOR INSERT WITH CHECK (auth.uid() = player1_id);
CREATE POLICY "Participants can update olympics" ON olympics FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Allow anyone to view olympics by invite code (for joining)
CREATE POLICY "Olympics viewable by invite code" ON olympics FOR SELECT
  USING (player2_id IS NULL);

-- RLS Policies for olympics_events
CREATE POLICY "Events viewable by participants" ON olympics_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM olympics o
    WHERE o.id = olympics_id
    AND (o.player1_id = auth.uid() OR o.player2_id = auth.uid())
  ));

-- Added per plan fix: INSERT policy for olympics_events
CREATE POLICY "Participants can insert events" ON olympics_events FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM olympics o
    WHERE o.id = olympics_id
    AND (o.player1_id = auth.uid() OR o.player2_id = auth.uid())
  ));

-- Allow participants to update events
CREATE POLICY "Participants can update events" ON olympics_events FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM olympics o
    WHERE o.id = olympics_id
    AND (o.player1_id = auth.uid() OR o.player2_id = auth.uid())
  ));

-- RLS Policies for event_results
CREATE POLICY "Results viewable by participants" ON event_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM olympics_events oe
    JOIN olympics o ON o.id = oe.olympics_id
    WHERE oe.id = olympics_event_id
    AND (o.player1_id = auth.uid() OR o.player2_id = auth.uid())
  ));
CREATE POLICY "Players submit own results" ON event_results FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE olympics;
ALTER PUBLICATION supabase_realtime ADD TABLE olympics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_results;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Index for fast invite code lookups
CREATE INDEX idx_olympics_invite_code ON olympics(invite_code);

-- Index for finding active olympics by player
CREATE INDEX idx_olympics_player1 ON olympics(player1_id);
CREATE INDEX idx_olympics_player2 ON olympics(player2_id);

-- Index for finding events by olympics
CREATE INDEX idx_olympics_events_olympics_id ON olympics_events(olympics_id);

-- Index for finding results by event
CREATE INDEX idx_event_results_olympics_event_id ON event_results(olympics_event_id);
