'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { LeaderboardUser } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

export async function getLeaderboard(): Promise<{ success: boolean; users: LeaderboardUser[]; error?: string }> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        success: true,
        users: mockDb.getLeaderboard(),
      };
    }

    const supabase = createAdminClient();

    // 1. Fetch all users sorted by score DESC, then created_at ASC (speed tiebreaker)
    const { data: usersData, error: userError } = await supabase
      .from('users')
      .select('id, name, score, current_level, frozen_until, has_double_points, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true });

    if (userError || !usersData) {
      return { success: false, users: [], error: 'Gagal mengambil data peserta.' };
    }

    // 2. Fetch all submissions to build node progress matrices
    const { data: submissionsData } = await supabase
      .from('submissions')
      .select('user_id, challenge_level, is_correct');

    const userSubmissionMap = new Map<string, Map<number, boolean>>();
    (submissionsData || []).forEach((sub) => {
      if (!userSubmissionMap.has(sub.user_id)) {
        userSubmissionMap.set(sub.user_id, new Map());
      }
      userSubmissionMap.get(sub.user_id)!.set(sub.challenge_level, sub.is_correct);
    });

    const now = Date.now();
    const leaderboardUsers: LeaderboardUser[] = usersData.map((u, index) => {
      const isFinished = (u.current_level ?? 1) > 10;
      const frozenTime = u.frozen_until ? new Date(u.frozen_until).getTime() : 0;
      const isFrozen = frozenTime > now;
      const frozenSecondsRemaining = isFrozen ? Math.ceil((frozenTime - now) / 1000) : 0;

      let statusText = `HACKING N${u.current_level < 10 ? `0${u.current_level}` : u.current_level}`;
      if (isFinished) {
        statusText = 'FINISHED (10/10)';
      } else if (isFrozen) {
        statusText = `FROZEN ${frozenSecondsRemaining}s`;
      }

      // Build 10-node boolean matrix
      const userSubMap = userSubmissionMap.get(u.id);
      const nodeMatrix: boolean[] = [];
      let streak = 0;
      let currentStreakCount = 0;

      for (let lvl = 1; lvl <= 10; lvl++) {
        const solved = userSubMap?.get(lvl) ?? false;
        nodeMatrix.push(solved);
        if (solved) {
          currentStreakCount++;
          if (currentStreakCount > streak) streak = currentStreakCount;
        } else {
          currentStreakCount = 0;
        }
      }

      return {
        id: u.id,
        name: u.name,
        score: u.score ?? 0,
        current_level: u.current_level ?? 1,
        frozen_until: u.frozen_until,
        has_double_points: u.has_double_points,
        created_at: u.created_at,
        rank: index + 1,
        statusText,
        isFinished,
        isFrozen,
        nodeMatrix,
        streak: streak > 1 ? streak : undefined,
      };
    });

    return {
      success: true,
      users: leaderboardUsers,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Terjadi kesalahan sistem leaderboard.';
    return { success: false, users: [], error: message };
  }
}
