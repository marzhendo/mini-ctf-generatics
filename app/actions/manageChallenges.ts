'use server';

import { ChallengeWithAnswer } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';
import { createAdminClient } from '@/lib/supabase/server';

export async function getAdminChallenges(): Promise<{
  success: boolean;
  challenges: ChallengeWithAnswer[];
  error?: string;
}> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true, challenges: mockDb.getAllChallenges() };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .order('level', { ascending: true });

    if (error) {
      return { success: false, challenges: mockDb.getAllChallenges(), error: error.message };
    }

    return { success: true, challenges: data as ChallengeWithAnswer[] };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengambil daftar soal.';
    return { success: false, challenges: mockDb.getAllChallenges(), error: errorMsg };
  }
}

export async function saveChallenge(challenge: Omit<ChallengeWithAnswer, 'id'> & { id?: number }): Promise<{
  success: boolean;
  challenge?: ChallengeWithAnswer;
  error?: string;
}> {
  try {
    if (!isSupabaseConfigured()) {
      if (challenge.id) {
        const updated = mockDb.updateChallenge(challenge.id, challenge);
        return { success: !!updated, challenge: updated || undefined };
      } else {
        const created = mockDb.addChallenge(challenge);
        return { success: true, challenge: created };
      }
    }

    const supabase = createAdminClient();

    if (challenge.id) {
      const { data, error } = await supabase
        .from('challenges')
        .update({
          level: challenge.level,
          question_text: challenge.question_text,
          question_type: challenge.question_type || 'FLAG',
          options: challenge.options || [],
          category: challenge.category || 'Pengetahuan Umum',
          flag_answer: challenge.flag_answer,
          points: challenge.points,
          hint: challenge.hint || null,
        })
        .eq('id', challenge.id)
        .select('*')
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, challenge: data as ChallengeWithAnswer };
    } else {
      const { data, error } = await supabase
        .from('challenges')
        .insert({
          level: challenge.level,
          question_text: challenge.question_text,
          question_type: challenge.question_type || 'FLAG',
          options: challenge.options || [],
          category: challenge.category || 'Pengetahuan Umum',
          flag_answer: challenge.flag_answer,
          points: challenge.points,
          hint: challenge.hint || null,
        })
        .select('*')
        .single();

      if (error) return { success: false, error: error.message };
      return { success: true, challenge: data as ChallengeWithAnswer };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal menyimpan soal.';
    return { success: false, error: errorMsg };
  }
}

export async function deleteChallenge(id: number): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    if (!isSupabaseConfigured()) {
      const ok = mockDb.deleteChallenge(id);
      return { success: ok };
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from('challenges').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal menghapus soal.';
    return { success: false, error: errorMsg };
  }
}
