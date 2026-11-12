'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

export async function triggerAirDrop(): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return mockDb.triggerAirDrop();
    }

    const supabase = createAdminClient();

    const { error } = await supabase
      .from('battle_events')
      .insert({
        event_type: 'AIR_DROP',
        description: 'AIR DROP DETECTED in Sector 07 Auditorium! Floor pods unlocked.',
        payload: {
          triggered_by: 'MC_ADMIN',
          timestamp: new Date().toISOString(),
        },
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memicu Air Drop.';
    return { success: false, error: message };
  }
}
