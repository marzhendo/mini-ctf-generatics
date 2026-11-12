-- Skema Database untuk Supabase (PostgreSQL)

-- 1. Table Users (Peserta)
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  score INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table Challenges (Daftar 10 Soal)
CREATE TABLE challenges (
  id SERIAL PRIMARY KEY,
  level INTEGER NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  flag_answer TEXT NOT NULL,
  points INTEGER NOT NULL
);

-- 3. Table Submissions (Tracking history 1x attempt)
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  challenge_level INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, challenge_level) -- Mencegah peserta submit 2x di level yg sama
);

-- Aktifkan Realtime untuk table users agar proyektor langsung update
alter publication supabase_realtime add table users;