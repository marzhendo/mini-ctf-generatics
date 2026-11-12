# System Architecture

## Tech Stack
- Frontend & Backend: Next.js 14 (App Router)
- Styling: Tailwind CSS
- Database & Realtime: Supabase (PostgreSQL + Supabase-js client)

## Core Logic (Server Action: `submitFlag`)
Karena aturan 1x jawab sangat rentan di-hack kalau logic-nya di Client, validasi WAJIB di sisi Server (Next.js Server Actions / API Routes).

1. Client mengirim `{ userId, level, inputFlag }`.
2. Server mengecek tabel `submissions` -> *Apakah userId ini sudah pernah submit di level ini?* Jika YA, tolak.
3. Server menarik jawaban asli dari tabel `challenges` berdasarkan `level`.
4. Komparasi: `inputFlag.trim().toUpperCase() === flag_answer.toUpperCase()`.
5. Jika **True**:
   - `INSERT INTO submissions (is_correct = true)`.
   - `UPDATE users SET score = score + points, current_level = level + 1`.
6. Jika **False**:
   - `INSERT INTO submissions (is_correct = false)`.
   - `UPDATE users SET current_level = level + 1` (Poin tidak ditambah, level tetap naik agar bisa lanjut).
7. Supabase Realtime akan otomatis me-lempar perubahan data tabel `users` ke browser Admin/Proyektor.