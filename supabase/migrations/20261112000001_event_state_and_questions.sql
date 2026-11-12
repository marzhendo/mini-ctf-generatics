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

-- 4. Seed / Update 10 Simplified Challenges (TDI Presentation + Friendly IT Trivia)
INSERT INTO challenges (level, question_type, category, question_text, options, flag_answer, points, hint)
VALUES
(
  1,
  'MULTIPLE_CHOICE',
  'Departemen TDI · HMIF',
  'Selamat datang di Mini CTF Generatics! Apakah kepanjangan resmi dari nama departemen "TDI" di HMIF Telkom University Purwokerto sebagaimana dipaparkan pada presentasi?',
  '["A. Technology Development & Infrastructure", "B. Talent Development & Innovation", "C. Total Digital Information", "D. Team Designer & Informatics"]'::jsonb,
  'B',
  100,
  'Bisa dilihat pada judul besar di slide cover pertama presentasi.'
),
(
  2,
  'FLAG',
  'Struktur Organisasi · Core TDI',
  'Pada slide struktur kepengurusan departemen TDI, siapakah nama panggilan/singkatan dari sosok yang menjabat sebagai "Core of Departement"? (Tuliskan nama panggilannya)',
  '[]'::jsonb,
  'IDAA',
  100,
  'Nama terdiri dari 4 huruf di slide kedua (I-d-A-a).'
),
(
  3,
  'MULTIPLE_CHOICE',
  'Program Kerja TDI · Ramadan',
  'Program kerja TDI yang berisi kegiatan ngabuburit seru bersama mahasiswa Informatika dan diakhiri dengan buka puasa bersama di bulan Ramadan bernama...?',
  '["A. NGAFIRMATICS", "B. INFORMATRAVEL", "C. BERKAH_IF", "D. KAJIAN_HMIF"]'::jsonb,
  'A',
  150,
  'Singkatan dari kata Ngabuburit dan Informatics.'
),
(
  4,
  'FLAG',
  'Dasar Web · Markup Language',
  'Bahasa markup standar yang menjadi kerangka pondasi utama seluruh halaman website di internet disingkat dengan 4 huruf apa?',
  '[]'::jsonb,
  'HTML',
  150,
  'HyperText Markup Language.'
),
(
  5,
  'MULTIPLE_CHOICE',
  'Program Kerja TDI · INFENTRA',
  'Proker tahunan bergengsi TDI yang menjadi wadah perayaan hari ulang tahun Prodi Informatika melalui kompetisi karya, seminar, dan awarding adalah...?',
  '["A. TECHNOFEST", "B. INFENTRA", "C. IF_OLYMPIAD", "D. CODESPACE_EXPO"]'::jsonb,
  'B',
  200,
  'Singkatan dari Informatics Event & Karya.'
),
(
  6,
  'MULTIPLE_CHOICE',
  'Jaringan Komputer · Web Security',
  'Ketika kamu membuka website aman berprotokol HTTPS (ada lambang gembok aman di browser), nomor port jaringan berapakah yang digunakan secara standar?',
  '["A. Port 80", "B. Port 22", "C. Port 443", "D. Port 8080"]'::jsonb,
  'C',
  200,
  'Port 80 untuk HTTP biasa, sedangkan HTTPS menambahkan angka 4 di depannya (443).'
),
(
  7,
  'FLAG',
  'Program Kerja TDI · Riset Mahasiswa',
  'Program kerja TDI yang bertujuan mengidentifikasi minat dan bakat mahasiswa Teknik Informatika melalui kuesioner/survei (misal: Web Dev, AI, Desain) bernama apa? (1 kata, 6 huruf)',
  '[]'::jsonb,
  'KENALI',
  250,
  'Nama programnya mengajak kita untuk saling mengenal.'
),
(
  8,
  'MULTIPLE_CHOICE',
  'Developer Tools · Shortcut Browser',
  'Tombol shortcut keyboard manakah di browser yang paling umum ditekan seorang programmer untuk membuka menu "Inspect Element / Developer Tools"?',
  '["A. F5", "B. F12", "C. Alt + F4", "D. Ctrl + Z"]'::jsonb,
  'B',
  250,
  'Tombol function paling kanan di baris atas keyboard (F12).'
),
(
  9,
  'MULTIPLE_CHOICE',
  'Fun Fact & Meme Presentasi',
  'Pada slide Q&A / sesi tanya jawab di akhir presentasi, apa pesan peringatan kocak yang tertera di tengah slide sebelum audiens bertanya?',
  '["A. Dilarang bertanya yang sulit-sulit", "B. Sebelum bertanya pastikan pertanyaanmu masuk akal PAHAM👊🖐️", "C. Pertanyaan terbaik dapat doorprize takjil", "D. Tanya ke ChatGPT saja ya teman-teman"]'::jsonb,
  'B',
  300,
  'Ada foto meme tangan terbuka dan tinju bertuliskan PAHAM👊🖐️.'
),
(
  10,
  'MULTIPLE_CHOICE',
  'Trivia Pemrograman · Web Core',
  'Bahasa pemrograman yang menggerakkan interaktivitas web modern ini diciptakan hanya dalam waktu 10 hari pada tahun 1995 oleh Brendan Eich. Siapakah bahasa tersebut?',
  '["A. Python", "B. JavaScript", "C. PHP", "D. C++"]'::jsonb,
  'B',
  500,
  'Bahasa pemrograman paling populer di web, sering disingkat JS.'
)
ON CONFLICT (level) DO UPDATE SET
  question_type = EXCLUDED.question_type,
  category = EXCLUDED.category,
  question_text = EXCLUDED.question_text,
  options = EXCLUDED.options,
  flag_answer = EXCLUDED.flag_answer,
  points = EXCLUDED.points,
  hint = EXCLUDED.hint;
