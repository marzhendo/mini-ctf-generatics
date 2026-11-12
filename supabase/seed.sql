-- ==============================================================================
-- Seed Data: 10 Level Challenges Mini CTF Generatics - Nexus of Innovation
-- ==============================================================================

INSERT INTO challenges (level, question_text, flag_answer, points) VALUES
(
  1,
  'Selamat datang di Nexus of Innovation! Sebuah pesan terenkripsi Base64 ditemukan di gateway sistem: "R0VORVJBVElDU19ORVhVU19TVEFSVA==". Dekode pesan tersebut untuk membuka gerbang pertama.',
  'GENERATICS_NEXUS_START',
  100
),
(
  2,
  'Sensor keamanan mendeteksi transmisi biner dari mainframe: 01001000 01001101 01001001 01000110. Konversikan biner 8-bit tersebut ke dalam karakter ASCII.',
  'HMIF',
  100
),
(
  3,
  'Sebuah sinyal Caesar Cipher terdeteksi dengan pergeseran 3 langkah ke kanan (ROT3): "JHQHUDWLFV". Temukan kata sandi aslinya!',
  'GENERATICS',
  150
),
(
  4,
  'Penyusup meninggalkan jejak string heksadesimal pada memory dump kernel: "43 59 42 45 52 53 50 41 43 45". Terjemahkan byte hex tersebut ke teks.',
  'CYBERSPACE',
  150
),
(
  5,
  'Sebuah protokol enkripsi kuno menggunakan ROT13 menghasilkan teks: "GBXVA_ONXR_FHPPRF". Lakukan dekripsi ROT13 untuk mendapatkan flag akses.',
  'TOKEN_BAKE_SUCCESS',
  200
),
(
  6,
  'Dalam sistem berkas Linux, seorang admin ingin memberikan izin: Pemilik dapat membaca, menulis, dan mengeksekusi (rwx); Grup hanya dapat membaca dan mengeksekusi (r-x); Publik hanya dapat membaca (r--). Berapakah representasi nilai numerik izin tersebut (contoh format: 755)?',
  '754',
  200
),
(
  7,
  'Protokol keamanan web HTTPS berjalan pada port default jaringan TCP bernomor berapa?',
  '443',
  250
),
(
  8,
  'Sebuah transmisi telegraf darurat mengirimkan kode morse: "... --- ..." diikuti "...- .. -.-. - --- .-. -.--". Gabungkan kedua kata dalam bahasa Inggris dengan pemisah garis bawah (underscore).',
  'SOS_VICTORY',
  250
),
(
  9,
  'Hash MD5 dari sebuah kata sandi penting adalah: "e10adc3949ba59abbe56e057f20f883e". Kata sandi umum apakah yang menghasilkan hash tersebut?',
  '123456',
  300
),
(
  10,
  'Level Terakhir! Sistem Nexus Core AI terkunci dengan teka-teki logika: "Aku adalah bahasa yang menggerakkan web, diciptakan dalam 10 hari oleh Brendan Eich pada tahun 1995. Siapakah aku?". Masukkan nama bahasa tersebut tanpa spasi.',
  'JAVASCRIPT',
  500
)
ON CONFLICT (level) DO UPDATE SET
  question_text = EXCLUDED.question_text,
  flag_answer = EXCLUDED.flag_answer,
  points = EXCLUDED.points;
