# Antigravity Agent Guidelines: Generatics CTF - Nexus of Innovation

## 1. Project Overview & Context
Platform web real-time untuk event **Mini CTF Generatics TDI HMIF**. Sistem mengusung konsep "High-Stakes Survival" individu di mana peserta berpacu dengan waktu menyelesaikan teka-teki IT / Kriptografi secara berurutan.

## 2. Invarian & Core Logic (Non-Negotiable)
- **STRICT SERVER VALIDATION (One-Shot Attempt):**
  - Validasi jawaban (`submitFlag`) WAJIB dilakukan di sisi Server (Next.js Server Actions / API Routes). DILARANG KERAS mengekspos `flag_answer` ke client.
  - Setiap peserta **HANYA BISA MENJAWAB 1 KALI PER LEVEL** (Permadeath per level, anti brute-force).
  - Pengecekan riwayat submit di tabel `submissions` harus mendahului evaluasi jawaban. Jika peserta sudah pernah submit di `challenge_level` yang sama, tolak request.
- **SEQUENTIAL PROGRESSION:**
  - Terdapat 10 level berurutan (Level 1 hingga 10).
  - Peserta tidak bisa melompati level atau kembali ke level sebelumnya.
  - Jika jawaban **BENAR**: `is_correct = true`, tambah `score` sesuai bobot poin soal, naikkan `current_level = level + 1`.
  - Jika jawaban **SALAH**: `is_correct = false`, poin tidak bertambah (+0), tetapi `current_level` TETAP dinaikkan (`level + 1`) agar peserta dipaksa lanjut ke soal berikutnya.
- **FLAG NORMALIZATION:**
  - Komparasi flag jawaban harus case-insensitive dan trimmed:
    `inputFlag.trim().toUpperCase() === flag_answer.toUpperCase()`
- **REALTIME BROADCAST:**
  - Menggunakan Supabase Realtime pada tabel `users`.
  - Layar Admin Proyektor (`/admin/dashboard`) menerima update realtime status posisi pengerjaan ("Hacking Lvl X" / "Finished") dan skor live peserta.
- **SESSION & STATE INTEGRITY:**
  - Peserta masuk hanya dengan nama (Open Input tanpa password). Identitas disimpan di session / local client dengan `userId` valid yang terdaftar di tabel `users`.
  - Admin view diproteksi (misal via token/passcode di environment variable).

## 3. Tech Stack & Directory Structure
- **Framework:** Next.js 14 (App Router, TypeScript)
- **Styling:** Tailwind CSS (Cyberpunk / Terminal / Nexus Dark Theme)
- **Database & Realtime:** Supabase (PostgreSQL + `@supabase/supabase-js`)
- **Icons & UI:** Lucide React, Tailwind Utilities

Struktur direktori yang direkomendasikan:
```
├── app/
│   ├── layout.tsx
│   ├── page.tsx                  # Landing page peserta (Open input nama)
│   ├── arena/
│   │   └── page.tsx              # Arena CTF peserta (Level badge, Soal, Input flag, Feedback overlay)
│   ├── admin/
│   │   └── dashboard/
│   │       └── page.tsx          # Projector View (Timer hitung mundur, Live Leaderboard & Level Tracker)
│   └── actions/
│       └── submitFlag.ts         # Server Action utama untuk verifikasi & submit jawaban
├── components/
│   ├── ui/                       # Reusable UI components
│   ├── arena/                    # Komponen arena & feedback modal/overlay
│   └── admin/                    # Komponen leaderboard & timer proyektor
├── lib/
│   ├── supabase/                 # Supabase client (browser & server action)
│   └── types.ts                  # TypeScript definitions (User, Challenge, Submission)
└── docs/                         # Spesifikasi & dokumentasi PRD/DB/UI
```

## 4. Database Schema Reference
- `users`: `id` (UUID PK), `name` (TEXT), `score` (INT default 0), `current_level` (INT default 1), `created_at` (TIMESTAMPTZ)
- `challenges`: `id` (SERIAL PK), `level` (INT UNIQUE), `question_text` (TEXT), `flag_answer` (TEXT), `points` (INT)
- `submissions`: `id` (UUID PK), `user_id` (UUID FK users), `challenge_level` (INT), `is_correct` (BOOLEAN), `created_at` (TIMESTAMPTZ), `UNIQUE(user_id, challenge_level)`

## 5. Coding & Security Standards
- **Keamanan Kredensial:** Semua kunci API (Supabase URL, Anon Key, Service Role Key jika dibutuhkan) WAJIB disimpan di `.env.local`. Jangan pernah melakukan hardcode secret di kode.
- **Client IP & Network Awareness:** Jika dijalankan di belakang reverse proxy / Cloud Run, ekstrak IP client melalui header `X-Forwarded-For`.
- **UI & UX Feel:** 
  - Tema terminal futuristik (Dark mode, neon accent hijau untuk success, merah untuk breach failed, cyan untuk status aktif).
  - Teks input flag dibuat uppercase otomatis dan monospace font.

## 6. Installed Engineering Skills
- **Matt Pocock Workflow:**
  - `codebase-design`: `.agents/skills/codebase-design/SKILL.md`
  - `implement`: `.agents/skills/implement/SKILL.md`
  - `tdd`: `.agents/skills/tdd/SKILL.md`
  - `diagnosing-bugs`: `.agents/skills/diagnosing-bugs/SKILL.md`
  - `handoff`: `.agents/skills/handoff/SKILL.md`
- **Code Review:**
  - `open-code-review`: `.agents/skills/open-code-review/SKILL.md`
  - `open-code-review-delegate`: `.agents/skills/open-code-review-delegate/SKILL.md`
- **UI/UX & Micro-Interactions (Installed for Project):**
  - `make-interfaces-feel-better`: `.agents/skills/make-interfaces-feel-better/SKILL.md`
  - `transitions-dev`: `.agents/skills/transitions-dev/SKILL.md`
  - `transitions-polish`: `.agents/skills/transitions-polish/SKILL.md`
  - `impeccable`: `.agents/skills/impeccable/SKILL.md`
  - `ui-ux-pro-max`: `.agents/skills/ui-ux-pro-max/SKILL.md`
  - `gsap-react` & `gsap-core`: `.agents/skills/gsap-react/SKILL.md`

<!-- antislop:start -->
## antislop
For UI, copy, people, mobile layout, or code comments work, read these installed skill files directly (use these paths even if a same-named global skill exists):
- Core filter, always on: `antislop`: `.agents/skills/antislop/SKILL.md`
- UI / visual: `antislop-ui`: `.agents/skills/antislop-ui/SKILL.md`
- Copy & text: `antislop-copywriting`: `.agents/skills/antislop-copywriting/SKILL.md`
- People: `antislop-human`: `.agents/skills/antislop-human/SKILL.md`
- Mobile / responsive: `antislop-layoutmobile`: `.agents/skills/antislop-layoutmobile/SKILL.md`
- Code comments: `antislop-code`: `.agents/skills/antislop-code/SKILL.md`
Before starting, follow the core's "Two Usage Modes" section in strict order: explicit session instruction first, then global preference, then ask. A session instruction always wins. For a resolved mode, say `antislop active: <mode> (session override).` or `antislop active: <mode> (global preference).` once before presenting findings or making edits, using the actual mode and source. Acknowledging the user's request without naming the source does not replace this notice.
Only an explicit choice of antislop during or after selects a session mode. A request to review, audit, or avoid file edits does not select a mode; read the global preference in that case. Another skill's mode does not select antislop's mode.
If the mode is unresolved, ask during/after and end the response; wait for the answer before any UI review, planning, or concept. For read-only tasks, put the active-mode notice only at the start of the final answer, never in progress messages. For editing tasks, announce before the first edit and omit it from the final answer.
To update antislop later: `npx antislop-ai --update`, or run `npx antislop-ai` and pick Overwrite them.
<!-- antislop:end -->
