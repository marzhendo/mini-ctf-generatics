'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { BattleEvent } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

export async function getBattleEvents(limit = 25): Promise<{ success: boolean; events: BattleEvent[]; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true, events: mockDb.getBattleEvents(limit) };
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('battle_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return { success: false, events: [], error: 'Gagal mengambil log pertempuran.' };
    }

    return {
      success: true,
      events: data as BattleEvent[],
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem battle log.';
    return { success: false, events: [], error: message };
  }
}
