'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

export interface NodeDebrief {
  level: number;
  title: string;
  is_correct: boolean;
  points: number;
}

export interface UserDebriefResult {
  success: boolean;
  score: number;
  rank: number;
  totalUsers: number;
  correctCount: number;
  nodes: NodeDebrief[];
  error?: string;
}

const LEVEL_TITLES: Record<number, string> = {
  1: 'Base64 Gateway',
  2: 'ASCII Binary Signal',
  3: 'Caesar Cipher',
  4: 'Kernel Hex Dump',
  5: 'ROT13 Protocol',
  6: 'Linux Permissions',
  7: 'HTTPS Port Security',
  8: 'Telegraph Morse',
  9: 'MD5 Hash Password',
  10: 'Steganography Exploit',
};

const LEVEL_POINTS: Record<number, number> = {
  1: 100,
  2: 100,
  3: 150,
  4: 150,
  5: 200,
  6: 200,
  7: 250,
  8: 250,
  9: 300,
  10: 300,
};

export async function getUserDebrief(userId: string): Promise<UserDebriefResult> {
  try {
    if (!userId) {
      return {
        success: false,
        score: 0,
        rank: 0,
        totalUsers: 0,
        correctCount: 0,
        nodes: [],
        error: 'User ID tidak valid.',
      };
    }

    if (!isSupabaseConfigured()) {
      const res = mockDb.getUserDebrief(userId);
      if (!res) {
        return {
          success: false,
          score: 0,
          rank: 0,
          totalUsers: 0,
          correctCount: 0,
          nodes: [],
          error: 'Data user tidak ditemukan.',
        };
      }
      return {
        success: true,
        ...res,
      };
    }

    const supabase = createAdminClient();

    // 1. Fetch user data
    const { data: user, error: userErr } = await supabase
      .from('users')
      .select('id, name, score, current_level')
      .eq('id', userId)
      .single();

    if (userErr || !user) {
      return {
        success: false,
        score: 0,
        rank: 0,
        totalUsers: 0,
        correctCount: 0,
        nodes: [],
        error: 'Data user tidak ditemukan.',
      };
    }

    // 2. Fetch all user submissions
    const { data: submissions } = await supabase
      .from('submissions')
      .select('challenge_level, is_correct')
      .eq('user_id', userId);

    const submissionMap = new Map<number, boolean>();
    (submissions || []).forEach((sub) => {
      submissionMap.set(sub.challenge_level, sub.is_correct);
    });

    let correctCount = 0;
    const nodes: NodeDebrief[] = [];
    for (let lvl = 1; lvl <= 10; lvl++) {
      const isCorrect = submissionMap.get(lvl) ?? false;
      if (isCorrect) correctCount++;

      nodes.push({
        level: lvl,
        title: LEVEL_TITLES[lvl] || `Node 0${lvl}`,
        is_correct: isCorrect,
        points: isCorrect ? LEVEL_POINTS[lvl] || 100 : 0,
      });
    }

    // 3. Calculate rank
    const { data: allUsers } = await supabase
      .from('users')
      .select('id, score')
      .order('score', { ascending: false });

    const totalUsers = allUsers ? allUsers.length : 1;
    let rank = 1;
    if (allUsers) {
      const idx = allUsers.findIndex((u) => u.id === userId);
      rank = idx !== -1 ? idx + 1 : 1;
    }

    return {
      success: true,
      score: user.score,
      rank,
      totalUsers,
      correctCount,
      nodes,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memproses debrief hasil.';
    return {
      success: false,
      score: 0,
      rank: 0,
      totalUsers: 0,
      correctCount: 0,
      nodes: [],
      error: message,
    };
  }
}
