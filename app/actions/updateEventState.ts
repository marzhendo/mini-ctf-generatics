'use server';

import { EventState } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';
import { createAdminClient } from '@/lib/supabase/server';

interface UpdateEventParams {
  status?: EventState['status'];
  duration_minutes?: number;
  seconds_remaining?: number;
}

export async function updateEventState(params: UpdateEventParams): Promise<{
  success: boolean;
  state?: EventState;
  error?: string;
}> {
  try {
    const isStarting = params.status === 'RUNNING';
    const isStopping = params.status === 'STOPPED';

    const updates: Partial<EventState> = {
      ...params,
      updated_at: new Date().toISOString(),
    };

    if (isStarting) {
      updates.started_at = new Date().toISOString();
      const dur = params.duration_minutes || 30;
      updates.duration_minutes = dur;
      updates.seconds_remaining = dur * 60;
    } else if (isStopping) {
      updates.stopped_at = new Date().toISOString();
    }

    if (!isSupabaseConfigured()) {
      const updated = mockDb.updateEventState(updates);
      return { success: true, state: updated };
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('event_state')
      .upsert({
        id: 'current',
        ...updates,
      })
      .select('*')
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Broadcast event to realtime channel
    try {
      const channel = supabase.channel('ctf_arena');
      await channel.send({
        type: 'broadcast',
        event: isStarting ? 'EVENT_STARTED' : isStopping ? 'EVENT_STOPPED' : 'EVENT_UPDATED',
        payload: data,
      });
      if (isStarting && data.seconds_remaining) {
        await channel.send({
          type: 'broadcast',
          event: 'timer_sync',
          payload: {
            secondsRemaining: data.seconds_remaining,
            duration_minutes: data.duration_minutes,
            started_at: data.started_at,
          },
        });
      }
    } catch {
      // Broadcast fallback
    }

    return {
      success: true,
      state: data as EventState,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal memperbarui status event.';
    return { success: false, error: errorMsg };
  }
}
