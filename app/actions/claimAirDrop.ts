'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

export async function claimAirDrop(
  userId: string,
  airDropId?: string
): Promise<{
  success: boolean;
  error?: string;
  already_claimed?: boolean;
  remaining_claims?: number;
  is_exhausted?: boolean;
  airDropId?: string;
}> {
  try {
    if (!userId) {
      return { success: false, error: 'Identitas peserta tidak valid.' };
    }

    if (!isSupabaseConfigured()) {
      return mockDb.claimAirDrop(userId, airDropId);
    }

    const supabase = createAdminClient();

    // 1. Fetch current event_state
    const { data: stateData, error: stateError } = await supabase
      .from('event_state')
      .select('active_air_drop')
      .eq('id', 'current')
      .single();

    if (stateError || !stateData?.active_air_drop) {
      return { success: false, error: 'Tidak ada Air Drop aktif saat ini.' };
    }

    const activeDrop = stateData.active_air_drop;
    if (airDropId && activeDrop.id !== airDropId) {
      return { success: false, error: 'Air Drop ini sudah kadaluarsa.' };
    }

    const claimedBy: string[] = activeDrop.claimed_by || [];

    // Already claimed by this user?
    if (claimedBy.includes(userId)) {
      return {
        success: true,
        already_claimed: true,
        remaining_claims: activeDrop.remaining_claims ?? 0,
        airDropId: activeDrop.id,
      };
    }

    // Quota reached? (Only first 3 participants)
    const maxClaims = activeDrop.max_claims || 3;
    if (claimedBy.length >= maxClaims) {
      return {
        success: false,
        error: 'Kuota Air Drop habis! Sudah diambil 3 peserta tercepat.',
        is_exhausted: true,
      };
    }

    // Add user to claimed_by
    claimedBy.push(userId);
    const remainingClaims = Math.max(0, maxClaims - claimedBy.length);
    const isExhausted = remainingClaims === 0;

    const updatedDrop = {
      ...activeDrop,
      claimed_by: claimedBy,
      remaining_claims: remainingClaims,
    };

    await supabase
      .from('event_state')
      .update({ active_air_drop: updatedDrop })
      .eq('id', 'current');

    // Fetch user name
    const { data: userData } = await supabase
      .from('users')
      .select('name')
      .eq('id', userId)
      .single();

    const userName = userData?.name || 'Peserta';

    // Insert battle event for combat log
    await supabase.from('battle_events').insert({
      event_type: 'SKILL_EXECUTED',
      actor_id: userId,
      description: `${userName} mengklaim Kotak Air Drop! (Sisa kuota: ${remainingClaims}/${maxClaims})`,
      payload: { airDropId: activeDrop.id, remaining_claims: remainingClaims },
    });

    // Broadcast claim update to all clients
    try {
      const channel = supabase.channel('ctf_arena');
      await channel.send({
        type: 'broadcast',
        event: 'air_drop_claim_update',
        payload: {
          airDropId: activeDrop.id,
          remaining_claims: remainingClaims,
          max_claims: maxClaims,
          claimed_by_name: userName,
        },
      });

      if (isExhausted) {
        await channel.send({
          type: 'broadcast',
          event: 'air_drop_exhausted',
          payload: { airDropId: activeDrop.id },
        });
      }
    } catch {
      // Broadcast fallback
    }

    return {
      success: true,
      airDropId: activeDrop.id,
      remaining_claims: remainingClaims,
      is_exhausted: isExhausted,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal mengklaim Air Drop.';
    return { success: false, error: msg };
  }
}
