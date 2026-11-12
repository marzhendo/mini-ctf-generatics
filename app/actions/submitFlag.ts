'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { SubmitFlagResult } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

interface SubmitFlagParams {
  userId: string;
  level: number;
  inputFlag: string;
}

export async function submitFlag({
  userId,
  level,
  inputFlag,
}: SubmitFlagParams): Promise<SubmitFlagResult> {
  try {
    if (!userId) {
      return { success: false, error: 'Identitas peserta (User ID) tidak valid.' };
    }

    if (!level || level < 1 || level > 10) {
      return { success: false, error: 'Nomor level tidak valid.' };
    }

    const trimmedInput = (inputFlag || '').trim();
    if (!trimmedInput) {
      return { success: false, error: 'Flag atau jawaban tidak boleh kosong.' };
    }

    if (!isSupabaseConfigured()) {
      return mockDb.submitFlag(userId, level, trimmedInput);
    }

    const supabase = createAdminClient();

    // 1. Verifikasi integritas User
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, name, score, current_level, current_streak, frozen_until, has_double_points')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'Peserta tidak ditemukan di database.' };
    }

    // Cek apakah user sedang dalam status Cryo Freeze Lockout
    if (userData.frozen_until && new Date(userData.frozen_until).getTime() > Date.now()) {
      const remainingSec = Math.ceil((new Date(userData.frozen_until).getTime() - Date.now()) / 1000);
      return {
        success: false,
        error: `Layar sedang terkunci sementara karena efek Freeze dari lawan! Tunggu ${remainingSec} detik lagi.`,
      };
    }

    // Pastikan user tidak melompati level atau mengerjakan level lama
    if (userData.current_level !== level) {
      return {
        success: false,
        error: `Level tidak sinkron. Posisi level kamu saat ini adalah Level ${userData.current_level}.`,
      };
    }

    // 2. Strict One-Shot Attempt Check (Permadeath per Level)
    const { data: existingSubmission, error: subCheckError } = await supabase
      .from('submissions')
      .select('id')
      .eq('user_id', userId)
      .eq('challenge_level', level)
      .maybeSingle();

    if (subCheckError) {
      return { success: false, error: 'Gagal memverifikasi riwayat submit peserta.' };
    }

    if (existingSubmission) {
      return {
        success: false,
        error: 'Satu kesempatan telah digunakan untuk level ini (Aturan One-Shot Attempt).',
      };
    }

    // 3. Tarik Jawaban Asli & Poin dari tabel challenges (Aman di Server)
    const { data: challengeData, error: challengeError } = await supabase
      .from('challenges')
      .select('flag_answer, points, question_type')
      .eq('level', level)
      .single();

    if (challengeError || !challengeData) {
      return { success: false, error: 'Data tantangan tidak ditemukan.' };
    }

    // 4. Komparasi Flag / Opsi Jawaban
    const normalizedInput = trimmedInput.toUpperCase();
    const normalizedTarget = challengeData.flag_answer.trim().toUpperCase();

    let isCorrect = false;
    if (challengeData.question_type === 'MULTIPLE_CHOICE') {
      const optionLetter = normalizedInput.charAt(0);
      const targetLetter = normalizedTarget.charAt(0);
      isCorrect = optionLetter === targetLetter || normalizedInput === normalizedTarget;
    } else {
      isCorrect = normalizedInput === normalizedTarget;
    }

    // 5. Evaluasi Multiplier (Overclock 2X + Streak Bonus)
    let pointsAwarded = 0;
    let streakCount = 0;
    let streakMultiplier = 1;

    if (isCorrect) {
      const currentStreak = userData.current_streak || 0;
      streakCount = currentStreak + 1;

      // Streak bonus:
      // Streak 4: +25%
      // Streak >= 5: +50%
      if (streakCount === 4) {
        streakMultiplier = 1.25;
      } else if (streakCount >= 5) {
        streakMultiplier = 1.5;
      }

      const doubleMultiplier = userData.has_double_points ? 2 : 1;
      const basePoints = challengeData.points;
      pointsAwarded = Math.round(basePoints * doubleMultiplier * streakMultiplier);
    } else {
      streakCount = 0;
    }

    const nextLevel = level + 1;
    const newScore = (userData.score || 0) + pointsAwarded;

    // 6. Catat submission ke tabel submissions
    const { error: insertSubError } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        challenge_level: level,
        is_correct: isCorrect,
        submitted_answer: trimmedInput,
      });

    if (insertSubError) {
      if (insertSubError.code === '23505') {
        return {
          success: false,
          error: 'Kamu sudah tercatat mengirimkan jawaban untuk level ini.',
        };
      }
      return { success: false, error: 'Gagal mencatat jawaban ke database.' };
    }

    // 7. Update user (Skor, level, current_streak, reset has_double_points)
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        score: newScore,
        current_level: nextLevel,
        current_streak: streakCount,
        has_double_points: false,
      })
      .eq('id', userId);

    if (updateUserError) {
      return { success: false, error: 'Gagal memperbarui status skor peserta.' };
    }

    // 8. Catat battle event jika jawaban benar
    if (isCorrect) {
      try {
        await supabase.from('battle_events').insert({
          event_type: 'SKILL_EXECUTED',
          actor_id: userId,
          description: `${userData.name} menyelesaikan Level 0${level} (+${pointsAwarded} Poin)${
            streakMultiplier > 1 ? ` 🔥 Streak ${streakCount}x!` : ''
          }`,
        });
      } catch {
        // Fallback
      }
    }

    return {
      success: true,
      is_correct: isCorrect,
      points_awarded: pointsAwarded,
      streak_count: streakCount,
      streak_multiplier: streakMultiplier,
      new_score: newScore,
      next_level: nextLevel,
      message: isCorrect
        ? `Jawaban Benar! +${pointsAwarded} Poin`
        : 'Jawaban Kurang Tepat. Level hangus (0 Poin)',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kegagalan server saat evaluasi jawaban.';
    return { success: false, error: message };
  }
}
