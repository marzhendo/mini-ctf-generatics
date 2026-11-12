-- ==============================================================================
-- Migration: Event State, Question Types, and Streak Multipliers
-- Database: PostgreSQL / Supabase
-- ==============================================================================

-- 1. Table Event State (Global Tournament Status)
CREATE TABLE IF NOT EXISTS event_state (
  id VARCHAR PRIMARY KEY DEFAULT 'current',
  status TEXT NOT NULL DEFAULT 'WAITING', -- 'WAITING', 'RUNNING', 'PAUSED', 'STOPPED'
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  seconds_remaining INTEGER NOT NULL DEFAULT 1800,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  stopped_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed initial event state if not exists
INSERT INTO event_state (id, status, duration_minutes, seconds_remaining)
VALUES ('current', 'WAITING', 30, 1800)
ON CONFLICT (id) DO NOTHING;

-- Enable Realtime for event_state
ALTER PUBLICATION supabase_realtime ADD TABLE event_state;

ALTER TABLE event_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view event state" ON event_state FOR SELECT USING (true);
CREATE POLICY "Service Role can manage event state" ON event_state FOR ALL USING (auth.role() = 'service_role');

-- 2. Alter Table challenges (Multiple Choice & Category Support)
ALTER TABLE challenges
  ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'FLAG',
  ADD COLUMN IF NOT EXISTS options JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Pengetahuan IT',
  ADD COLUMN IF NOT EXISTS hint TEXT DEFAULT NULL;

-- 3. Alter Table users (Streak Tracking)
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS current_streak INTEGER DEFAULT 0;
