'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { LeaderboardUser, BattleEvent } from '@/lib/types';
import { getLeaderboard } from '@/app/actions/getLeaderboard';
import { getBattleEvents } from '@/app/actions/getBattleEvents';
import { getEventState } from '@/app/actions/getEventState';
import { ProjectorHeader } from '@/components/admin/ProjectorHeader';
import { GiantClockSection } from '@/components/admin/GiantClockSection';
import { TopThreePodium } from '@/components/admin/TopThreePodium';
import { FieldRosterTable } from '@/components/admin/FieldRosterTable';
import { CombatLogFeed } from '@/components/admin/CombatLogFeed';
import { AdminControlsFooter } from '@/components/admin/AdminControlsFooter';
import { WinnerRevealModal } from '@/components/admin/WinnerRevealModal';
import { sound } from '@/lib/audio';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [events, setEvents] = useState<BattleEvent[]>([]);
  const [secondsRemaining, setSecondsRemaining] = useState(1800); // 30 minutes match
  const [isTimerPaused, setIsTimerPaused] = useState(false);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isFetchingRef = useRef(false);

  // 1. Initial & Periodic Data Fetch (Auto-Sync)
  const fetchData = useCallback(async (isManual = false) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    if (isManual) setIsRefreshing(true);

    try {
      const [leaderboardRes, eventsRes, stateRes] = await Promise.all([
        getLeaderboard(),
        getBattleEvents(25),
        getEventState(),
      ]);

      if (leaderboardRes.success && leaderboardRes.users) {
        setUsers(leaderboardRes.users);
      }
      if (eventsRes.success && eventsRes.events) {
        setEvents(eventsRes.events);
      }
      if (stateRes.success && stateRes.state) {
        if (stateRes.state.status === 'PAUSED' || stateRes.state.status === 'STOPPED') {
          setIsTimerPaused(true);
        } else if (stateRes.state.status === 'RUNNING') {
          setIsTimerPaused(false);
        }
      }
    } catch (err) {
      console.error('Failed to auto-sync leaderboard:', err);
    } finally {
      isFetchingRef.current = false;
      if (isManual) setIsRefreshing(false);
    }
  }, []);

  // Auto-refresh interval (Polls every 2.5 seconds so rankings update automatically without manual reload)
  useEffect(() => {
    fetchData();

    const autoSyncInterval = setInterval(() => {
      fetchData();
    }, 2500);

    return () => clearInterval(autoSyncInterval);
  }, [fetchData]);

  // 2. Realtime Subscriptions
  useEffect(() => {
    const supabase = createClient();

    // Listen to user score and level progression changes
    const userChannel = supabase
      .channel('admin_users_stream')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        () => {
          fetchData();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'submissions' },
        () => {
          fetchData();
        }
      )
      .subscribe();

    // Listen to battle events (Air drop, skill attack, siphons)
    const battleChannel = supabase
      .channel('admin_battle_stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'battle_events' },
        (payload) => {
          const newEvt = payload.new as BattleEvent;
          setEvents((prev) => [newEvt, ...prev.slice(0, 30)]);

          if (newEvt.event_type === 'AIR_DROP') {
            sound.playAirDropAlert();
          } else if (newEvt.skill_type === 'FREEZE_TIME') {
            sound.playFreezeShatter();
          } else {
            sound.playBeep(950, 0.05);
          }
          fetchData();
        }
      )
      .subscribe();

    // Listen to arena broadcast events (start, stop, reset, airdrops)
    const arenaChannel = supabase
      .channel('ctf_arena')
      .on('broadcast', { event: 'air_drop_spawn' }, () => {
        sound.playAirDropAlert();
        fetchData();
      })
      .on('broadcast', { event: 'air_drop_claim_update' }, () => {
        fetchData();
      })
      .on('broadcast', { event: 'EVENT_STARTED' }, () => {
        setIsTimerPaused(false);
        fetchData();
      })
      .on('broadcast', { event: 'EVENT_STOPPED' }, () => {
        setIsTimerPaused(true);
        fetchData();
      })
      .on('broadcast', { event: 'TOURNAMENT_RESET' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(userChannel);
      supabase.removeChannel(battleChannel);
      supabase.removeChannel(arenaChannel);
    };
  }, [fetchData]);

  // 3. Countdown Timer Interval
  useEffect(() => {
    if (isTimerPaused) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isTimerPaused]);

  // Broadcast timer sync to participants periodically
  useEffect(() => {
    const supabase = createClient();
    const broadcastChannel = supabase.channel('ctf_arena');

    broadcastChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        broadcastChannel.send({
          type: 'broadcast',
          event: 'timer_sync',
          payload: { secondsRemaining },
        });
      }
    });

    const syncInterval = setInterval(() => {
      broadcastChannel.send({
        type: 'broadcast',
        event: 'timer_sync',
        payload: { secondsRemaining },
      });
    }, 10000);

    return () => {
      clearInterval(syncInterval);
      supabase.removeChannel(broadcastChannel);
    };
  }, [secondsRemaining]);

  const togglePauseTimer = () => {
    setIsTimerPaused((prev) => !prev);
  };

  return (
    <div className="bg-[#080A0F] text-zinc-100 font-sans select-none overflow-hidden h-screen w-screen flex flex-col justify-between relative subtle-grid">
      {/* Top Header */}
      <ProjectorHeader totalOperators={users.length} />

      {/* Giant Projector Countdown Clock */}
      <GiantClockSection
        secondsRemaining={secondsRemaining}
        isPaused={isTimerPaused}
      />

      {/* Main Expansive Stage */}
      <main className="relative z-20 flex-1 px-4 lg:px-6 py-2.5 flex flex-col gap-3 min-h-0 overflow-hidden max-w-[1920px] w-full mx-auto">
        {/* Top 3 Spotlight Podium */}
        <TopThreePodium topUsers={users.slice(0, 3)} />

        {/* Bottom Half Dual Panels */}
        <div className="flex-1 grid grid-cols-12 gap-3 min-h-0">
          {/* Left Column: Live Field Roster (~65% width) */}
          <FieldRosterTable users={users} />

          {/* Right Column: Live Combat Events Log (~35% width) */}
          <CombatLogFeed events={events} />
        </div>
      </main>

      {/* Operator Controls Bar / MC Admin Footer */}
      <AdminControlsFooter
        isTimerPaused={isTimerPaused}
        onTogglePauseTimer={togglePauseTimer}
        onRevealWinners={() => setIsWinnerModalOpen(true)}
        onRefresh={() => fetchData(true)}
        isRefreshing={isRefreshing}
      />

      {/* Winner Reveal Modal */}
      <WinnerRevealModal
        isOpen={isWinnerModalOpen}
        onClose={() => setIsWinnerModalOpen(false)}
        topUsers={users.slice(0, 3)}
      />
    </div>
  );
}
