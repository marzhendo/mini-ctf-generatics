'use server';

import { EventState } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';
import { createAdminClient } from '@/lib/supabase/server';

export async function getEventState(): Promise<{ success: boolean; state: EventState; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return { success: true, state: mockDb.getEventState() };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('event_state')
      .select('*')
      .eq('id', 'current')
      .single();

    if (error || !data) {
      // Fallback if table or record not initialized yet
      return {
        success: true,
        state: {
          status: 'WAITING',
          duration_minutes: 30,
          seconds_remaining: 1800,
          started_at: null,
          stopped_at: null,
        },
      };
    }

    let calculatedSeconds = data.seconds_remaining;
    if (data.status === 'RUNNING' && data.started_at) {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(data.started_at).getTime()) / 1000));
      calculatedSeconds = Math.max(0, (data.duration_minutes || 30) * 60 - elapsed);
    } else if (data.status === 'WAITING') {
      calculatedSeconds = (data.duration_minutes || 30) * 60;
    }

    return {
      success: true,
      state: {
        status: data.status,
        duration_minutes: data.duration_minutes,
        seconds_remaining: calculatedSeconds,
        started_at: data.started_at,
        stopped_at: data.stopped_at,
        updated_at: data.updated_at,
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengambil status event.';
    return {
      success: false,
      state: mockDb.getEventState(),
      error: errorMsg,
    };
  }
}
