# UI Flow & Components

## A. Participant Mobile View
1. **Landing Page (`/`):**
   - Logo TDI / HMIF.
   - Form input "Masukkan Nama Kamu".
   - Button "Enter The Nexus" (disabled jika nama kosong).
2. **Arena Page (`/arena`):**
   - **Header:** Nama Peserta | Skor Saat Ini.
   - **Main Card:** 
     - Badge Level (ex: "LEVEL 3 / 10").
     - Teks Soal / Pertanyaan.
     - Input Field (Text, Auto-uppercase, monospace).
     - Tombol "Execute / Submit".
     - Teks peringatan 1x jawab.
3. **Feedback Overlay (Muncul 1-2 detik setelah submit):**
   - BENAR: Layar berkedip hijau, teks "ACCESS GRANTED +[poin]".
   - SALAH: Layar berkedip merah, teks "ACCESS DENIED +0".
4. **End Screen:** Ucapan selamat, total skor, dan pesan "Lihat klasemen di Proyektor!".

## B. Admin Projector View (`/admin/dashboard`)
1. **Header:** Timer Besar (Hitung mundur) & Tombol Start/Stop.
2. **Leaderboard Grid:**
   - Baris berurut berdasarkan Skor Tertinggi.
   - Kolom: `Rank` | `Nama Peserta` | `Score` | `Current Status`.
   - `Current Status` dirender berupa badge: "Hacking Lvl 4" (Cyan) atau "Finished" (Green).