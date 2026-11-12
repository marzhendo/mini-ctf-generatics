'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { User, LeaderboardUser } from '@/lib/types';
import { getEventState } from '@/app/actions/getEventState';
import { getLeaderboard } from '@/app/actions/getLeaderboard';
import { sound } from '@/lib/audio';
import {
  Clock,
  Users,
  ShieldAlert,
  Zap,
  Sparkles,
  Loader2,
  CheckCircle2,
  Flame,
  Radio,
} from 'lucide-react';

export default function LobbyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [participants, setParticipants] = useState<LeaderboardUser[]>([]);
  const [isEventStarting, setIsEventStarting] = useState(false);

  // 1. Session verification & initial status check
  useEffect(() => {
    const savedUserJson = localStorage.getItem('nexus_user');
    if (!savedUserJson) {
      router.replace('/');
      return;
    }

    try {
      const parsedUser = JSON.parse(savedUserJson) as User;
      setUser(parsedUser);
    } catch {
      localStorage.removeItem('nexus_user');
      router.replace('/');
      return;
    }

    // Check if event is already RUNNING
    async function checkState() {
      const res = await getEventState();
      if (res.success && res.state.status === 'RUNNING') {
        router.replace('/arena');
        return;
      }

      // Fetch participants currently standby
      const lbRes = await getLeaderboard();
      if (lbRes.success && lbRes.users) {
        setParticipants(lbRes.users);
      }
    }

    checkState();
  }, [router]);

  // 2. Realtime listener for EVENT_STARTED broadcast
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('ctf_arena')
      .on('broadcast', { event: 'EVENT_STARTED' }, () => {
        sound.playSuccess();
        setIsEventStarting(true);
        setTimeout(() => {
          router.replace('/arena');
        }, 100);
      })
      .on('broadcast', { event: 'TOURNAMENT_RESET' }, ({ payload }) => {
        if (payload?.mode === 'ALL_USERS') {
          localStorage.removeItem('nexus_user');
          router.replace('/');
        }
      })
      .subscribe();

    // Polling fallback every 3 seconds in case broadcast is missed
    const pollInterval = setInterval(async () => {
      const res = await getEventState();
      if (res.success && res.state.status === 'RUNNING') {
        router.replace('/arena');
      }

      const lbRes = await getLeaderboard();
      if (lbRes.success && lbRes.users) {
        setParticipants(lbRes.users);
      }
    }, 3000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(pollInterval);
    };
  }, [router]);

  return (
    <main className="w-full max-w-[440px] min-h-screen mx-auto px-4 py-6 flex flex-col justify-between relative z-10 font-mono">
      {/* Background Subtle Grid */}
      <div className="fixed inset-0 subtle-grid pointer-events-none z-0 opacity-40" />

      {/* Top Header */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0A101D] border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Image
              src="/img/assets/hmif-logo.png"
              alt="HMIF Logo"
              width={16}
              height={16}
              className="object-contain"
            />
            <span>HMIF</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0A1814] border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Image
              src="/img/assets/tdi-logo.png"
              alt="TDI Logo"
              width={16}
              height={16}
              className="object-contain"
            />
            <span>TDI</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-zinc-400">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Lobby Standby</span>
        </div>
      </header>

      {/* Main Content Area */}
      <section className="relative z-10 my-auto py-5 space-y-4">
        {/* Waiting Card */}
        <div className="dev-card bg-[#0D111A] border-amber-500/30 p-5 text-center space-y-3.5 shadow-2xl relative">
          <div className="relative mx-auto w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            {isEventStarting ? (
              <Loader2 className="w-7 h-7 animate-spin text-emerald-400" />
            ) : (
              <Clock className="w-7 h-7 text-amber-400 animate-pulse" />
            )}
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-semibold mb-1">
              <span>{isEventStarting ? 'Memasuki Arena...' : 'Ruang Tunggu Peserta'}</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isEventStarting ? 'Pertandingan Dimulai!' : 'Menunggu Panitia Memulai...'}
            </h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed font-sans">
              Hai <strong className="text-white">{user?.name}</strong>! Tetap berada di halaman ini. Begitu panitia menekan tombol mulai di panggung, layarmu akan langsung otomatis berpindah ke arena pengerjaan.
            </p>
          </div>

          {/* Realtime Standby Counter */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs font-mono text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span>Peserta Standby:</span>
            </span>
            <span className="text-cyan-300 font-bold tabular-nums">
              {participants.length} Orang
            </span>
          </div>
        </div>

        {/* Live Standby Participant Pills */}
        <div className="dev-card bg-[#0A0D15] p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
            <span>DAFTAR PESERTA DI RUANG TUNGGU</span>
            <span className="text-emerald-400 font-semibold">● Terhubung</span>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {participants.length === 0 ? (
              <span className="text-xs text-zinc-500 py-1">Memuat daftar peserta...</span>
            ) : (
              participants.map((p) => {
                const isMe = p.id === user?.id;
                return (
                  <span
                    key={p.id}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium flex items-center gap-1 transition-all ${
                      isMe
                        ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-200'
                        : 'bg-white/5 border border-white/10 text-zinc-300'
                    }`}
                  >
                    <CheckCircle2 className={`w-3 h-3 ${isMe ? 'text-cyan-400' : 'text-zinc-500'}`} />
                    <span className="truncate max-w-[120px]">{p.name}</span>
                    {isMe && <span className="text-[9px] text-cyan-400 font-bold">(Kamu)</span>}
                  </span>
                );
              })
            )}
          </div>
        </div>

        {/* Tactical Rules Briefing */}
        <div className="dev-card bg-[#0A0D15] p-3.5 space-y-2 text-xs font-sans text-zinc-300">
          <div className="font-semibold text-white flex items-center gap-1.5 text-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Pengingat Singkat Aturan:</span>
          </div>
          <ul className="space-y-1.5 text-[11px] text-zinc-400 leading-snug">
            <li className="flex items-start gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span><strong>One-Shot Attempt:</strong> Setiap level hanya bisa dijawab 1 kali. Jika salah, level hangus dan lanjut ke soal berikutnya.</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Flame className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 mt-0.5" />
              <span><strong>Streak Bonus:</strong> Jawab benar &gt;3 soal berturut-turut untuk bonus skor +25% di streak 4 dan +50% di streak 5+!</span>
            </li>
            <li className="flex items-start gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
              <span><strong>Air Drop:</strong> Kotak bantuan muncul di tengah babak dengan jendela klaim cepat 5 detik.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pt-3 border-t border-white/10 text-center text-[10px] text-zinc-500">
        <p>Mini CTF Generatics 2026 • TDI HMIF</p>
      </footer>
    </main>
  );
}
