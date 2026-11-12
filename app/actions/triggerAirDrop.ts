'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

export async function triggerAirDrop(): Promise<{
  success: boolean;
  airDropId?: string;
  error?: string;
}> {
  try {
    if (!isSupabaseConfigured()) {
      return mockDb.triggerAirDrop();
    }

    const supabase = createAdminClient();
    const airDropId = `ad-${Date.now()}`;
    const activeDropData = {
      id: airDropId,
      max_claims: 3,
      claimed_by: [],
      remaining_claims: 3,
      created_at: new Date().toISOString(),
    };

    // 1. Update event_state active_air_drop
    await supabase
      .from('event_state')
      .update({ active_air_drop: activeDropData })
      .eq('id', 'current');

    // 2. Insert into battle_events
    const { error } = await supabase
      .from('battle_events')
      .insert({
        event_type: 'AIR_DROP',
        description: 'Kotak Bantuan Air Drop mendarat! Tersedia untuk 3 peserta tercepat.',
        payload: {
          airDropId,
          remaining_claims: 3,
          max_claims: 3,
          duration_seconds: 12,
          triggered_by: 'MC_ADMIN',
          timestamp: new Date().toISOString(),
        },
      });

    if (error) {
      return { success: false, error: error.message };
    }

    // 3. Realtime broadcast to ctf_arena
    try {
      const channel = supabase.channel('ctf_arena');
      await channel.send({
        type: 'broadcast',
        event: 'air_drop_spawn',
        payload: {
          airDropId,
          remaining_claims: 3,
          max_claims: 3,
          duration_seconds: 12,
        },
      });
    } catch {
      // Broadcast fallback
    }

    return { success: true, airDropId };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memicu Air Drop.';
    return { success: false, error: message };
  }
}
