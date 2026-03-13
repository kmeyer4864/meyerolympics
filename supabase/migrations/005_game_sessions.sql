-- Game Sessions: Persistent sessions for rematches
-- Allows players to rematch without re-entering invite codes

-- Create game_sessions table
CREATE TABLE game_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  session_code TEXT UNIQUE NOT NULL,           -- persistent 8-char code for session
  player1_id UUID REFERENCES profiles(id) NOT NULL,
  player2_id UUID REFERENCES profiles(id),     -- null until P2 joins
  mode TEXT DEFAULT 'realtime'                 -- async | realtime
    CHECK (mode IN ('async', 'realtime')),
  games_played INTEGER DEFAULT 0,              -- count of Olympics in this session
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add session_id foreign key to olympics table
ALTER TABLE olympics ADD COLUMN session_id UUID REFERENCES game_sessions(id);

-- Create index for session lookups
CREATE INDEX idx_olympics_session_id ON olympics(session_id);
CREATE INDEX idx_game_sessions_code ON game_sessions(session_code);
CREATE INDEX idx_game_sessions_players ON game_sessions(player1_id, player2_id);

-- Enable RLS on game_sessions
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for game_sessions
CREATE POLICY "Sessions viewable by participants" ON game_sessions FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Anyone can create session" ON game_sessions FOR INSERT
  WITH CHECK (auth.uid() = player1_id);

CREATE POLICY "Participants can update session" ON game_sessions FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

-- Enable realtime on game_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE game_sessions;

-- Function to increment games_played and update last_active_at
CREATE OR REPLACE FUNCTION update_session_on_olympics_create()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.session_id IS NOT NULL THEN
    UPDATE game_sessions
    SET games_played = games_played + 1,
        last_active_at = NOW()
    WHERE id = NEW.session_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_olympics_created_update_session
  AFTER INSERT ON olympics
  FOR EACH ROW EXECUTE FUNCTION update_session_on_olympics_create();

-- Function to clean up inactive sessions (older than 24 hours)
-- Can be called via pg_cron or manually
CREATE OR REPLACE FUNCTION cleanup_inactive_sessions()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Delete sessions that have been inactive for more than 24 hours
  -- and have no active Olympics
  WITH inactive_sessions AS (
    SELECT gs.id
    FROM game_sessions gs
    WHERE gs.last_active_at < NOW() - INTERVAL '24 hours'
    AND NOT EXISTS (
      SELECT 1 FROM olympics o
      WHERE o.session_id = gs.id
      AND o.status != 'complete'
    )
  )
  DELETE FROM game_sessions
  WHERE id IN (SELECT id FROM inactive_sessions);

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if a session is still valid
CREATE OR REPLACE FUNCTION is_session_valid(session_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM game_sessions
    WHERE id = session_uuid
    AND last_active_at > NOW() - INTERVAL '24 hours'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
