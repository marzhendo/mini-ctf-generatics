'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { RivalUser } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

export async function getTopRivals(currentUserId: string): Promise<RivalUser[]> {
  try {
    if (!isSupabaseConfigured()) {
      return mockDb.getTopRivals(currentUserId);
    }

    const supabase = createAdminClient();

    // Query active operators sorted by score DESC, created_at ASC
    const { data, error } = await supabase
      .from('users')
      .select('id, name, score, current_level, frozen_until')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(10);

    if (error || !data) {
      return [];
    }

    const now = Date.now();
    let rankCounter = 1;
    const rivals: RivalUser[] = [];

    for (const u of data) {
      const isSelf = u.id === currentUserId;
      const rank = rankCounter++;

      if (!isSelf && rivals.length < 5) {
        const isFrozen = !!(u.frozen_until && new Date(u.frozen_until).getTime() > now);
        rivals.push({
          id: u.id,
          name: u.name,
          score: u.score ?? 0,
          current_level: u.current_level ?? 1,
          rank,
          is_frozen: isFrozen,
        });
      }
    }

    return rivals;
  } catch {
    return [];
  }
}
