'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { Challenge } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

export async function getChallenge(level: number): Promise<{ success: boolean; challenge?: Challenge; error?: string }> {
  try {
    if (level < 1 || level > 10) {
      return { success: false, error: 'Level di luar jangkauan (1-10).' };
    }

    if (!isSupabaseConfigured()) {
      const challenge = mockDb.getChallenge(level);
      if (!challenge) {
        return { success: false, error: 'Tantangan untuk level ini belum tersedia.' };
      }
      return { success: true, challenge };
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('challenges')
      .select('id, level, question_text, points')
      .eq('level', level)
      .single();

    if (error || !data) {
      return { success: false, error: 'Tantangan untuk level ini belum tersedia.' };
    }

    return {
      success: true,
      challenge: data as Challenge,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem saat mengambil soal.';
    return { success: false, error: message };
  }
}
