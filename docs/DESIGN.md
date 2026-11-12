# UI/UX Specification: Generatics CTF - Nexus of Innovation

## 1. Design Direction & Aesthetic Foundation
- **Theme:** Arcade / High-Stakes Game Show + Cyber-Terminal Battle Royale
- **Atmosphere:** Kompetitif, intens, visual cues tebal dengan kontras tinggi, pertarungan real-time dengan interaksi skill/power-up.
- **Color Palette:**
  - Background Utama: Deep Void Black (`#08090D`)
  - Surface/Card: Dark Slate (`#0F121C` / `#151926`)
  - Accent Primary: Electric Cyan (`#00F0FF`) — Elemen aktif, stepper glow, fokus input
  - Accent Success: Neon Emerald (`#00FF88`) — Akses lolos, level terjawab benar, tombol eksekusi, buff 2x poin
  - Accent Danger: Crimson Red (`#FF2E63`) — Breach failed (+0 poin), peringatan 1x attempt, debuff potong poin
  - Accent Frost/Freeze: Glacial Ice Blue (`#38BDF8` / `#E0F2FE`) — Efek freeze layar 15 detik
  - Accent Gold/Podium: Trophy Amber (`#FFB703`) — Juara 1 & skor tertinggi
  - Text: Bright White (`#F0F4FC`) & Muted Slate (`#6B7A99`)

---

## 2. Invarian Game & Fitur Supply Drop Skill

### A. Mekanika Supply Drop (Full Manual MC Control)
1. **Trigger oleh MC/Panitia:**
   - MC menekan tombol `[🚨 DROP SUPPLY CRATE]` pada Floating Operator Drawer di layar proyektor aula saat ingin memicu kehebohan di panggung.
2. **Quick-Tap Race di HP Peserta:**
   - Sirene berbunyi dan muncul modal darurat *"AIR DROP DETECTED // TAP TO LOOT"* di seluruh layar HP peserta.
   - Hanya **2 peserta tercepat** di aula yang berhasil mengklaim peti sebelum persediaan habis (*first-come, first-served*).
   - Peti memberikan 1 skill acak dari 4 kemungkinan skill.

### B. Spesifikasi 4 Skill Kompetitif
1. **⚡ 2X POINT (Double Multiplier):**
   - Menggandakan poin reward pada level aktif saat ini jika jawaban benar (misal +150 menjadi +300 PTS). Jika salah, poin tetap +0.
2. **❄️ FREEZE TIME (EMP Screen Lockout):**
   - Mengunci dan membekukan antarmuka layar target (efek visual es/glitch) selama **15 detik**. Korban tidak bisa mengetik atau submit hingga waktu thaw selesai.
3. **💥 KURANGIN POIN (Point Deduct):**
   - Memotong **flat 100 Poin** dari target yang dipilih. Poin target tidak dapat jatuh di bawah 0.
4. **🧲 CURI POIN (Point Siphon):**
   - Menyedot **100 Poin** dari target dan mentransfernya langsung ke penyerang (+100 untukmu, -100 untuk korban).

### C. Mekanisme Penargetan (Top 5 Rival Selector)
- Saat mengaktifkan skill ofensif (Freeze, Kurang, Curi), peserta disuguhkan pop-up ringkas berisi kartu **5 Besar Klasemen (Rank 1 - 5)** saat itu.
- Peserta cukup melakukan satu kali tap pada nama rival yang ingin diserang tanpa repot mengetik nama.

### D. Efek Layar Proyektor Aula (Esports Battle Feed)
- **Saat Air Drop:** Banner radar merah berkedip di header proyektor: `⚠️ GLOBAL AIR DROP DETECTED // CRATE DEPLOYED!`.
- **Saat Skill Dipakai:** Muncul *Battle Feed* animasi neon di panggung (misal: `❄️ [ALEXA] INFLICTED EMP FREEZE ON [NOCTURNE] (15s)` atau `🧲 [MARZHENDO] STOLE 100 PTS FROM [CYBER_GHOST]`).
- Kartu peserta yang menjadi korban di podium leaderboard berkedip es / merah secara dramatis, memicu reaksi penonton aula!

---

## 3. Database Schema Extension untuk Fitur Skill

```sql
-- 1. Tabel inventaris skill yang dimiliki peserta
CREATE TABLE IF NOT EXISTS user_skills (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_type TEXT NOT NULL, -- 'DOUBLE_POINTS', 'FREEZE_TIME', 'DEDUCT_POINTS', 'STEAL_POINTS'
  is_used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. State efek aktif pada user
ALTER TABLE users ADD COLUMN IF NOT EXISTS frozen_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_double_points BOOLEAN DEFAULT FALSE;

-- 3. Tabel log event real-time (Air Drop & Battle Feed)
CREATE TABLE IF NOT EXISTS battle_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL, -- 'AIR_DROP', 'SKILL_EXECUTED'
  actor_id UUID REFERENCES users(id),
  target_id UUID REFERENCES users(id),
  skill_type TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Aktifkan Realtime untuk tabel battle_events
ALTER PUBLICATION supabase_realtime ADD TABLE battle_events;
```

---

## 4. Rincian Antarmuka Tiap Layar

### A. Landing Page (`/` - Mobile First)
- Logo TDI / HMIF & Beacon Server Status `LIVE ARENA ACTIVE`.
- Kartu Arcade *"Player Select / Insert Coin"* (input nama `MARZHENDO_G`).
- Survival Directives & Info Power-Up Drop.

### B. Arena Pengerjaan (`/arena` - Mobile First)
- **Top HUD:** Info peserta, skor live, dan inventaris skill aktif di saku (ikon skill yang siap ditap).
- **Survival Node Gauge (10 Segmen):** Visual status level 1–10.
- **Breach Terminal Card:** Soal CTF, box payload monospace, input flag, dan tombol `LOCK IN & EXECUTE`.
- **Air Drop Pop-up Modal:** Muncul instan saat MC memicu drop dengan tombol berdenyut `⚡ LOOT CRATE!`.
- **Top 5 Rival Selector Modal:** Pilihan instan 5 rival teratas saat mengeksekusi skill serangan.
- **Frozen Overlay:** Layar glitch es biru membeku dengan countdown mundur 15 detik jika peserta terkena serangan EMP Freeze dari rival.

### C. Admin Projector View (`/admin/dashboard` - 16:9 Display)
- **Stage Header:** Timer Digital Raksasa (`24:58`) & Live Stats.
- **Esports Battle-Feed Bar:** Ticker animasi neon yang menyiarkan setiap aksi serangan skill yang sedang terjadi di arena secara live.
- **Top 3 Podium Showcase:** Kartu Gold, Silver, Bronze dengan efek visual glitch jika sedang diserang.
- **Live Leaderboard Roster (Rank 4+):** Roster peserta real-time.
- **Floating Operator Drawer:** Dilengkapi tombol khusus MC:
  - `[ 🚨 TRIGGER AIR DROP NOW ]`
  - Kontrol waktu: `[ ▶ RESUME ]`, `[ ⏸ PAUSE ]`, `[ ↺ RESET ]`.
