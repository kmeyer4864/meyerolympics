-- Add config column to olympics_events for storing event-specific settings (e.g., difficulty)
ALTER TABLE olympics_events ADD COLUMN IF NOT EXISTS config JSONB DEFAULT '{}';

-- Add comment explaining the column
COMMENT ON COLUMN olympics_events.config IS 'Event configuration options set during Olympics creation (e.g., difficulty level for Sudoku)';
