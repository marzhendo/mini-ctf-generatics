'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, Challenge } from '@/lib/types';
import { getChallenge } from '@/app/actions/getChallenge';
import { submitFlag } from '@/app/actions/submitFlag';
import { getEventState } from '@/app/actions/getEventState';
import { ArenaHeader } from '@/components/arena/ArenaHeader';
import { AirDropBanner } from '@/components/arena/AirDropBanner';
import { ChallengeTerminal } from '@/components/arena/ChallengeTerminal';
import { FlagInputSection } from '@/components/arena/FlagInputSection';
import { FeedbackModal } from '@/components/arena/FeedbackModal';
import { AirDropModal } from '@/components/arena/AirDropModal';
import { CryoLockoutOverlay } from '@/components/arena/CryoLockoutOverlay';
import { AttackToast } from '@/components/arena/AttackToast';
import { EndGameScorecard } from '@/components/arena/EndGameScorecard';
import { Loader2, AlertOctagon } from 'lucide-react';
import { sound } from '@/lib/audio';

export default function ArenaPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEventStopped, setIsEventStopped] = useState(false);

  // Modal & Overlay States
  const [feedback, setFeedback] = useState<{
    isOpen: boolean;
    isCorrect: boolean;
    pointsAwarded: number;
    streakCount?: number;
    streakMultiplier?: number;
  }>({
    isOpen: false,
    isCorrect: false,
    pointsAwarded: 0,
  });

  const [airDropAvailable, setAirDropAvailable] = useState(false);
  const [airDropModalOpen, setAirDropModalOpen] = useState(false);
  const [isFrozen, setIsFrozen] = useState(false);
  const [attackerName, setAttackerName] = useState('Peserta Rival');
  const [attackToast, setAttackToast] = useState<{
    isOpen: boolean;
    attackerName: string;
    pointsDeducted: number;
    skillType: string;
  }>({
    isOpen: false,
    attackerName: '',
    pointsDeducted: 100,
    skillType: 'DEDUCT_POINTS',
  });

  // Match session timer simulation (default 30 min from launch or synced)
  const [secondsRemaining, setSecondsRemaining] = useState(1800);

  // Format seconds to MM:SS
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. Session check & event status check on mount
  useEffect(() => {
    const savedUserJson = localStorage.getItem('nexus_user');
    if (!savedUserJson) {
      router.replace('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUserJson) as User;
      setUser(parsedUser);

      // Check initial frozen state
      if (parsedUser.frozen_until) {
        const frozenTime = new Date(parsedUser.frozen_until).getTime();
        if (frozenTime > Date.now()) {
          setIsFrozen(true);
        }
      }
    } catch {
      localStorage.removeItem('nexus_user');
      router.replace('/');
      return;
    }

    // Verify if event is running
    async function verifyEventState() {
      const stateRes = await getEventState();
      if (stateRes.success) {
        if (stateRes.state.status === 'WAITING') {
          router.replace('/lobby');
          return;
        } else if (stateRes.state.status === 'STOPPED') {
          setIsEventStopped(true);
        }
        if (stateRes.state.seconds_remaining) {
          setSecondsRemaining(stateRes.state.seconds_remaining);
        }
      }
    }

    verifyEventState();
  }, [router]);

  // 2. Fetch current challenge
  const loadChallenge = useCallback(async (level: number) => {
    if (level > 10) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const res = await getChallenge(level);
    if (res.success && res.challenge) {
      setChallenge(res.challenge);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (user?.current_level) {
      loadChallenge(user.current_level);
    }
  }, [user?.current_level, loadChallenge]);

  // 3. Match countdown timer interval
  useEffect(() => {
    if (isEventStopped) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isEventStopped]);

  // 4. Supabase Realtime Listeners
  useEffect(() => {
    if (!user?.id) return;

    const supabase = createClient();

    // Channel 1: Listen to user table changes (score, frozen_until, current_level, current_streak)
    const userChannel = supabase
      .channel(`user_state_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'users',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new as User;
          setUser((prev) => {
            if (!prev) return updated;
            return {
              ...prev,
              score: updated.score,
              current_level: updated.current_level,
              current_streak: updated.current_streak,
              frozen_until: updated.frozen_until,
              has_double_points: updated.has_double_points,
            };
          });

          // Check if frozen by an opponent
          if (updated.frozen_until) {
            const frozenTime = new Date(updated.frozen_until).getTime();
            if (frozenTime > Date.now()) {
              setIsFrozen(true);
            }
          }
        }
      )
      .subscribe();

    // Channel 2: Battle events (Air drops, skill attacks)
    const battleChannel = supabase
      .channel('arena_battle_events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'battle_events',
        },
        (payload) => {
          const newEvent = payload.new;
          if (newEvent.event_type === 'AIR_DROP') {
            sound.playAirDropAlert();
            setAirDropAvailable(true);
          } else if (
            newEvent.event_type === 'SKILL_EXECUTED' &&
            newEvent.target_id === user.id
          ) {
            const rivalAttacker = newEvent.description
              ? newEvent.description.replace(/^\[(.*?)\]\s*deploy.*/i, '$1').trim()
              : 'Peserta Rival';

            if (newEvent.skill_type === 'FREEZE_TIME') {
              setAttackerName(rivalAttacker);
              setIsFrozen(true);
              sound.playFreezeShatter();
            } else if (newEvent.skill_type === 'DEDUCT_POINTS' || newEvent.skill_type === 'STEAL_POINTS') {
              sound.playAttackAlert();
              setAttackToast({
                isOpen: true,
                attackerName: rivalAttacker,
                pointsDeducted: 100,
                skillType: newEvent.skill_type,
              });
            }
          }
        }
      )
      .subscribe();

    // Channel 3: Auditorium broadcast sync (ctf_arena)
    const arenaBroadcastChannel = supabase
      .channel('ctf_arena')
      .on('broadcast', { event: 'air_drop_spawn' }, () => {
        sound.playAirDropAlert();
        setAirDropAvailable(true);
      })
      .on('broadcast', { event: 'timer_sync' }, ({ payload }) => {
        if (payload?.secondsRemaining) {
          setSecondsRemaining(payload.secondsRemaining);
        }
      })
      .on('broadcast', { event: 'EVENT_STOPPED' }, () => {
        setIsEventStopped(true);
        sound.playError();
      })
      .on('broadcast', { event: 'TOURNAMENT_RESET' }, ({ payload }) => {
        if (payload?.mode === 'ALL_USERS') {
          localStorage.removeItem('nexus_user');
          router.replace('/');
        } else {
          router.replace('/lobby');
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(battleChannel);
      supabase.removeChannel(arenaBroadcastChannel);
    };
  }, [user?.id, router]);

  // 5. Submit Flag Handler
  const handleFlagSubmit = async (flag: string) => {
    if (!user || !challenge || isSubmitting || isFrozen || isEventStopped) return;

    setIsSubmitting(true);
    try {
      const res = await submitFlag({
        userId: user.id,
        level: challenge.level,
        inputFlag: flag,
      });

      if (!res.success) {
        sound.playError();
        alert(res.error || 'Terjadi kesalahan saat memverifikasi jawaban.');
        setIsSubmitting(false);
        return;
      }

      // Update local state with response
      const isCorrect = res.is_correct ?? false;
      const points = res.points_awarded ?? 0;
      const nextLvl = res.next_level ?? (user.current_level + 1);
      const newScore = res.new_score ?? user.score;

      // Update local user state
      const updatedUser: User = {
        ...user,
        score: newScore,
        current_level: nextLvl,
        current_streak: res.streak_count ?? 0,
        has_double_points: false, // consumed on answer
      };
      setUser(updatedUser);
      localStorage.setItem('nexus_user', JSON.stringify(updatedUser));

      // Show Feedback Modal
      setFeedback({
        isOpen: true,
        isCorrect,
        pointsAwarded: points,
        streakCount: res.streak_count,
        streakMultiplier: res.streak_multiplier,
      });
    } catch {
      sound.playError();
      alert('Gagal menghubungi server penilaian.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 6. Advance to Next Level Handler
  const handleAdvance = () => {
    setFeedback((prev) => ({ ...prev, isOpen: false }));
    if (!user) return;

    const nextLvl = user.current_level;
    if (nextLvl <= 10) {
      loadChallenge(nextLvl);
    }
  };

  // 7. Intercept Air Drop
  const handleInterceptAirDrop = () => {
    sound.playBeep(1100, 0.05);
    setAirDropModalOpen(true);
  };

  // 8. Skill Deployed Callback
  const handleSkillDeployed = (skillType: string, newScore?: number) => {
    setAirDropAvailable(false);
    if (!user) return;

    const updatedUser: User = {
      ...user,
      score: newScore !== undefined ? newScore : user.score,
      has_double_points: skillType === 'DOUBLE_POINTS' ? true : user.has_double_points,
    };
    setUser(updatedUser);
    localStorage.setItem('nexus_user', JSON.stringify(updatedUser));
  };

  // If user has concluded all 10 nodes, show EndGameScorecard
  if (user && user.current_level > 10) {
    return (
      <main className="w-full max-w-[440px] min-h-screen bg-[#080A0F] flex flex-col relative subtle-grid border-x border-white/10 shadow-2xl">
        <EndGameScorecard
          userId={user.id}
          userName={user.name}
          finalScore={user.score}
        />
      </main>
    );
  }

  return (
    <div className="w-full max-w-[440px] min-h-screen bg-[#080A0F] flex flex-col relative subtle-grid border-x border-white/10 shadow-2xl pb-10">
      {/* Main Dynamic Content Canvas */}
      <main className="flex-1 flex flex-col pt-14 px-4 space-y-3.5 z-10">
        {/* Sticky Telemetry HUD */}
        <ArenaHeader
          userName={user?.name || 'Peserta'}
          score={user?.score ?? 0}
          currentLevel={user?.current_level ?? 1}
          timeLeftFormatted={formatTimer(secondsRemaining)}
          pointsForCurrentLevel={challenge?.points ?? 100}
          hasDoublePoints={user?.has_double_points ?? false}
          currentStreak={user?.current_streak ?? 0}
        />

        {/* Stopped Event Banner */}
        {isEventStopped && (
          <div className="p-3 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center gap-2.5 text-xs font-sans">
            <AlertOctagon className="w-5 h-5 flex-shrink-0 text-rose-400" />
            <div>
              <strong className="font-bold">Pertandingan Dihentikan:</strong> Panitia telah menghentikan babak ini. Silakan perhatikan layar proyektor utama di auditorium.
            </div>
          </div>
        )}

        {/* Air Drop Banner (if available) with 5s expiry */}
        {airDropAvailable && (
          <AirDropBanner
            onIntercept={handleInterceptAirDrop}
            onExpire={() => setAirDropAvailable(false)}
            durationSeconds={5}
          />
        )}

        {/* Challenge Loading Spinner or Challenge Terminal */}
        {isLoading || !challenge ? (
          <div className="p-8 dev-card flex flex-col items-center justify-center space-y-2 text-zinc-400 text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
            <span>Memuat soal tantangan...</span>
          </div>
        ) : (
          <>
            {/* Terminal Window with Code & Problem */}
            <ChallengeTerminal challenge={challenge} />

            {/* Flag / Multiple Choice Submission Input Section */}
            <FlagInputSection
              onSubmit={handleFlagSubmit}
              isSubmitting={isSubmitting || isEventStopped}
              isFrozen={isFrozen || isEventStopped}
              isMultipleChoice={challenge.question_type === 'MULTIPLE_CHOICE'}
              options={challenge.options || []}
            />
          </>
        )}
      </main>

      {/* Feedback Modal (Jawaban Benar / Salah) */}
      <FeedbackModal
        isOpen={feedback.isOpen}
        isCorrect={feedback.isCorrect}
        pointsAwarded={feedback.pointsAwarded}
        currentLevel={challenge?.level ?? (user?.current_level ?? 1)}
        hasDoublePoints={user?.has_double_points}
        streakCount={feedback.streakCount}
        streakMultiplier={feedback.streakMultiplier}
        onAdvance={handleAdvance}
      />

      {/* Air Drop Payload Crate Modal */}
      {user && (
        <AirDropModal
          isOpen={airDropModalOpen}
          userId={user.id}
          onClose={() => setAirDropModalOpen(false)}
          onSkillDeployed={handleSkillDeployed}
        />
      )}

      {/* Cryo Lockout Overlay (When Frozen by Opponent) */}
      {isFrozen && user?.frozen_until && (
        <CryoLockoutOverlay
          frozenUntil={user.frozen_until}
          attackerName={attackerName}
          onThawed={() => setIsFrozen(false)}
        />
      )}

      {/* Incoming Attack Toast (EMP Drain / Siphon) */}
      <AttackToast
        isOpen={attackToast.isOpen}
        attackerName={attackToast.attackerName}
        pointsDeducted={attackToast.pointsDeducted}
        skillType={attackToast.skillType}
        onClose={() => setAttackToast((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
