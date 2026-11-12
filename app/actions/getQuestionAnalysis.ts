'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { QuestionAnalysisItem, ParticipantSubmissionDetail, PendingParticipantDetail } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

export async function getQuestionAnalysis(): Promise<{
  success: boolean;
  data?: QuestionAnalysisItem[];
  error?: string;
}> {
  try {
    if (!isSupabaseConfigured()) {
      return {
        success: true,
        data: mockDb.getQuestionAnalysis(),
      };
    }

    const supabase = createAdminClient();

    // Fetch challenges, users, and submissions concurrently
    const [challengesRes, usersRes, submissionsRes] = await Promise.all([
      supabase.from('challenges').select('*').order('level', { ascending: true }),
      supabase.from('users').select('id, name, current_level, score').order('name', { ascending: true }),
      supabase.from('submissions').select('user_id, challenge_level, is_correct, submitted_answer, created_at'),
    ]);

    if (challengesRes.error) {
      throw new Error(`Gagal mengambil data soal: ${challengesRes.error.message}`);
    }
    if (usersRes.error) {
      throw new Error(`Gagal mengambil data peserta: ${usersRes.error.message}`);
    }
    if (submissionsRes.error) {
      throw new Error(`Gagal mengambil data submisi: ${submissionsRes.error.message}`);
    }

    const challenges = challengesRes.data || [];
    const users = usersRes.data || [];
    const submissions = submissionsRes.data || [];

    const userMap = new Map(users.map((u) => [u.id, u.name]));

    const analysis: QuestionAnalysisItem[] = challenges.map((ch) => {
      const challengeSubs = submissions.filter((s) => s.challenge_level === ch.level);
      const correctParticipants: ParticipantSubmissionDetail[] = [];
      const wrongParticipants: ParticipantSubmissionDetail[] = [];
      const answeredUserIds = new Set<string>();

      challengeSubs.forEach((sub) => {
        answeredUserIds.add(sub.user_id);
        const userName = userMap.get(sub.user_id) || 'Peserta';
        const detail: ParticipantSubmissionDetail = {
          userId: sub.user_id,
          userName,
          submittedAnswer: sub.submitted_answer,
          isCorrect: sub.is_correct,
          createdAt: sub.created_at,
        };
        if (sub.is_correct) {
          correctParticipants.push(detail);
        } else {
          wrongParticipants.push(detail);
        }
      });

      const pendingParticipants: PendingParticipantDetail[] = users
        .filter((u) => !answeredUserIds.has(u.id))
        .map((u) => ({
          userId: u.id,
          userName: u.name,
          currentLevel: u.current_level,
        }));

      const totalSubmissions = challengeSubs.length;
      const correctCount = correctParticipants.length;
      const wrongCount = wrongParticipants.length;
      const pendingCount = pendingParticipants.length;
      const accuracyRate = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;

      return {
        challengeId: ch.id,
        level: ch.level,
        questionText: ch.question_text,
        questionType: ch.question_type || 'FLAG',
        options: ch.options || [],
        flagAnswer: ch.flag_answer,
        category: ch.category || 'Pengetahuan Umum IT',
        points: ch.points,
        totalSubmissions,
        correctCount,
        wrongCount,
        pendingCount,
        accuracyRate,
        correctParticipants,
        wrongParticipants,
        pendingParticipants,
      };
    });

    return {
      success: true,
      data: analysis,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Gagal mengambil analisis soal.';
    return {
      success: false,
      error: errorMsg,
      data: mockDb.getQuestionAnalysis(),
    };
  }
}
