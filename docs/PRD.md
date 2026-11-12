# PRD: Generatics CTF - Nexus of Innovation

## 1. Objective
Aplikasi web real-time untuk event Mini CTF mahasiswa Generatics TDI HMIF. Platform ini mengusung sistem "High-Stakes Survival" individu, di mana setiap peserta berpacu dengan waktu menjawab teka-teki IT/Kriptografi.

## 2. Game Rules & Mechanics (Core Logic)
- **Individual Play:** Peserta masuk hanya dengan mengetikkan Nama mereka (Open Input).
- **Locked Stepper (Sequential):** Terdapat 10 level. Peserta harus mengerjakan secara berurutan dari Level 1 hingga 10.
- **One-Shot Attempt (Permadeath per Level):** 
  - Peserta HANYA BISA MENGIRIMKAN JAWABAN 1 KALI per soal.
  - Jika jawaban **BENAR**: Poin bertambah sesuai bobot soal, otomatis lanjut ke soal berikutnya.
  - Jika jawaban **SALAH**: Poin +0, muncul peringatan "SYSTEM BREACH FAILED", dan otomatis dipaksa lanjut ke soal berikutnya.
  - *Note: Aturan ini memaksa peserta agar tidak asal tebak (brute-force).*
- **Real-Time Tracking:** Layar proyektor (Admin) menampilkan skor secara live dan indikator peserta sedang mengerjakan soal nomor berapa.

## 3. User Roles
- **Participant (Mobile):** Menginput nama -> Mengerjakan soal berurutan -> Melihat total skor akhir setelah 10 soal selesai.
- **Admin (Desktop/Projector):** Start/Stop sesi -> Memantau Live Leaderboard + Live Tracker (Posisi level peserta).