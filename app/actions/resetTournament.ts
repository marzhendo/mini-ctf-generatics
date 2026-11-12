'use server';

import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';
import { createAdminClient } from '@/lib/supabase/server';

export async function resetTournament(
  input: 'ALL_USERS' | 'SCORES_ONLY' | { mode: 'ALL_USERS' | 'SCORES_ONLY' }
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const mode = typeof input === 'object' && input !== null ? input.mode : input;

    if (!isSupabaseConfigured()) {
      mockDb.resetTournament(mode);
      return {
        success: true,
        message:
          mode === 'ALL_USERS'
            ? 'Seluruh data peserta dan pertandingan berhasil dihapus.'
            : 'Seluruh skor berhasil direset kembali ke 0.',
      };
    }

    const supabase = createAdminClient();

    if (mode === 'ALL_USERS') {
      // 1. Delete all submissions, battle events, user skills, then users
      await Promise.all([
        supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('battle_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('user_skills').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      ]);

      await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Reset event state to WAITING
      await supabase.from('event_state').upsert({
        id: 'current',
        status: 'WAITING',
        seconds_remaining: 1800,
        started_at: null,
        stopped_at: null,
        updated_at: new Date().toISOString(),
      });
    } else {
      // SCORES_ONLY: delete submissions & battle events, reset user progress
      await Promise.all([
        supabase.from('submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('battle_events').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('user_skills').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      ]);

      await supabase
        .from('users')
        .update({
          score: 0,
          current_level: 1,
          current_streak: 0,
          frozen_until: null,
          has_double_points: false,
        })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      await supabase.from('event_state').upsert({
        id: 'current',
        status: 'WAITING',
        seconds_remaining: 1800,
        started_at: null,
        stopped_at: null,
        updated_at: new Date().toISOString(),
      });
    }

    // Broadcast reset event
    try {
      const channel = supabase.channel('ctf_arena');
      await channel.send({
        type: 'broadcast',
        event: 'TOURNAMENT_RESET',
        payload: { mode },
      });
    } catch {
      // Broadcast fallback
    }

    return {
      success: true,
      message:
        mode === 'ALL_USERS'
          ? 'Seluruh data peserta dan pertandingan berhasil dihapus.'
          : 'Seluruh skor berhasil direset kembali ke 0.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mereset turnamen.';
    return { success: false, error: errorMsg };
  }
}
