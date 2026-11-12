-- ==============================================================================
-- Schema Database Mini CTF Generatics - Nexus of Innovation
-- Database: PostgreSQL / Supabase
-- ==============================================================================

-- 1. Table Users (Peserta)
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  frozen_until TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  has_double_points BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk mempercepat query leaderboard (skor tertinggi, kemudian waktu selesai tercepat)
CREATE INDEX IF NOT EXISTS idx_users_leaderboard ON users (score DESC, created_at ASC);

-- 2. Table Challenges (Daftar Soal CTF)
CREATE TABLE IF NOT EXISTS challenges (
  id SERIAL PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  flag_answer TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 100
);

CREATE INDEX IF NOT EXISTS idx_challenges_level ON challenges (level);

-- 3. Table Submissions (Tracking history 1x attempt per level)
CREATE TABLE IF NOT EXISTS submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_level INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  submitted_answer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_challenge_attempt UNIQUE(user_id, challenge_level)
);

CREATE INDEX IF NOT EXISTS idx_submissions_lookup ON submissions (user_id, challenge_level);

-- 4. Table User Skills (Inventaris Skill Milik Peserta)
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_type TEXT NOT NULL, -- 'DOUBLE_POINTS', 'FREEZE_TIME', 'DEDUCT_POINTS', 'STEAL_POINTS'
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_skills_active ON user_skills (user_id, is_used);

-- 5. Table Battle Events (Real-time Air Drop & Battle Feed Notifikasi)
CREATE TABLE IF NOT EXISTS battle_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'AIR_DROP', 'SKILL_EXECUTED'
  actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  target_id UUID REFERENCES users(id) ON DELETE SET NULL,
  skill_type TEXT,
  description TEXT NOT NULL,
  payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Enable Supabase Realtime untuk tabel users dan battle_events
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE battle_events;

-- ==============================================================================
-- Row Level Security (RLS) Policies
-- ==============================================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE battle_events ENABLE ROW LEVEL SECURITY;

-- Users policies: Publik diperbolehkan membaca data peserta (untuk leaderboard & status live)
CREATE POLICY "Public can view users" ON users
  FOR SELECT USING (true);

-- Users policies: Publik diperbolehkan mendaftarkan nama peserta
CREATE POLICY "Public can insert users" ON users
  FOR INSERT WITH CHECK (true);

-- Challenges policies:
-- DILARANG KERAS mengekspos challenges dengan flag_answer langsung ke anon role.
CREATE POLICY "Service Role can access challenges" ON challenges
  FOR ALL USING (auth.role() = 'service_role');

-- Submissions policies:
CREATE POLICY "Service Role can manage submissions" ON submissions
  FOR ALL USING (auth.role() = 'service_role');

-- User Skills & Battle Events policies:
CREATE POLICY "Public can view battle events" ON battle_events
  FOR SELECT USING (true);

CREATE POLICY "Service Role can manage battle events" ON battle_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own skills" ON user_skills
  FOR SELECT USING (true);

CREATE POLICY "Service Role can manage user skills" ON user_skills
  FOR ALL USING (auth.role() = 'service_role');
