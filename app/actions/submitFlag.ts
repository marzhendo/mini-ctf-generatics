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
      return { success: false, error: 'Flag jawaban tidak boleh kosong.' };
    }

    if (!isSupabaseConfigured()) {
      return mockDb.submitFlag(userId, level, trimmedInput);
    }

    const supabase = createAdminClient();

    // 1. Verifikasi integritas User
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, score, current_level, frozen_until, has_double_points')
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
        error: `TERMINAL LOCKOUT: Sistem kamu sedang dibekukan oleh serangan Cryo Freeze! Tunggu ${remainingSec} detik lagi.`,
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
        error: 'SYSTEM BREACH DETECTED: Kamu sudah pernah mengirimkan jawaban di level ini. Hanya 1x percobaan diperbolehkan!',
      };
    }

    // 3. Tarik Jawaban Asli & Poin dari tabel challenges (Aman di Server)
    const { data: challengeData, error: challengeError } = await supabase
      .from('challenges')
      .select('flag_answer, points')
      .eq('level', level)
      .single();

    if (challengeError || !challengeData) {
      return { success: false, error: 'Data tantangan tidak ditemukan.' };
    }

    // 4. Komparasi Flag (Case-insensitive & Trimmed)
    const normalizedInput = trimmedInput.toUpperCase();
    const normalizedTarget = challengeData.flag_answer.trim().toUpperCase();
    const isCorrect = normalizedInput === normalizedTarget;

    // Evaluasi Multiplier (Overclock 2X)
    const multiplier = userData.has_double_points ? 2 : 1;
    const basePoints = isCorrect ? challengeData.points : 0;
    const pointsAwarded = basePoints * multiplier;
    const nextLevel = level + 1;
    const newScore = (userData.score || 0) + pointsAwarded;

    // 5. Catat submission ke tabel submissions
    const { error: insertSubError } = await supabase
      .from('submissions')
      .insert({
        user_id: userId,
        challenge_level: level,
        is_correct: isCorrect,
        submitted_answer: trimmedInput,
      });

    if (insertSubError) {
      // Jika terjadi race condition dan constraint unik terkena benturan
      if (insertSubError.code === '23505') {
        return {
          success: false,
          error: 'Kamu sudah tercatat mengirimkan jawaban untuk level ini.',
        };
      }
      return { success: false, error: 'Gagal mencatat jawaban ke database.' };
    }

    // 6. Update user (Naikkan level; tambah skor jika benar; reset has_double_points)
    const { error: updateUserError } = await supabase
      .from('users')
      .update({
        score: newScore,
        current_level: nextLevel,
        has_double_points: false, // Reset booster setelah level diselesaikan
      })
      .eq('id', userId);

    if (updateUserError) {
      return { success: false, error: 'Gagal memperbarui status skor peserta.' };
    }

    return {
      success: true,
      is_correct: isCorrect,
      points_awarded: pointsAwarded,
      new_score: newScore,
      next_level: nextLevel,
      message: isCorrect
        ? `ACCESS GRANTED! +${pointsAwarded} Poin`
        : 'ACCESS DENIED! SYSTEM BREACH FAILED (+0 Poin)',
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kegagalan server saat evaluasi flag.';
    return { success: false, error: message };
  }
}
