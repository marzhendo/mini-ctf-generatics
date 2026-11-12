'use client';

import React, { useEffect, useState } from 'react';
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ExternalLink,
  User,
  Loader2,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getUserDebrief, NodeDebrief } from '@/app/actions/getUserDebrief';
import { sound } from '@/lib/audio';

interface EndGameScorecardProps {
  userId: string;
  userName: string;
  finalScore: number;
}

export function EndGameScorecard({
  userId,
  userName,
  finalScore,
}: EndGameScorecardProps) {
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(finalScore);
  const [rank, setRank] = useState(1);
  const [totalUsers, setTotalUsers] = useState(1);
  const [correctCount, setCorrectCount] = useState(0);
  const [nodes, setNodes] = useState<NodeDebrief[]>([]);

  useEffect(() => {
    sound.playSuccess();

    try {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#00ff9d', '#00e3fd', '#ffd700'],
      });
    } catch {
      // Confetti fallback
    }

    async function loadData() {
      const res = await getUserDebrief(userId);
      if (res.success) {
        setScore(res.score);
        setRank(res.rank);
        setTotalUsers(res.totalUsers);
        setCorrectCount(res.correctCount);
        setNodes(res.nodes);
      }
      setLoading(false);
    }

    loadData();
  }, [userId]);

  const accuracy = Math.round((correctCount / 10) * 100);

  return (
    <div className="w-full max-w-[440px] mx-auto pt-16 pb-12 px-4 flex flex-col gap-4 relative z-20">
      {/* Brand Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[#080A0F]/90 backdrop-blur-md max-w-[440px] mx-auto border-b border-white/10">
        <div className="flex items-center gap-2">
          <Trophy className="text-amber-400 w-5 h-5" />
          <span className="font-sans font-bold text-white text-sm sm:text-base">
            Hasil Akhir Pengerjaan
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">Selesai</span>
        </div>
      </header>

      {/* Hero Scorecard Panel */}
      <section className="dev-card bg-[#0D111A] border-amber-500/30 p-5 space-y-4 shadow-2xl relative">
        {/* Participant Identity Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {userName || 'Peserta CTF'}
              </div>
              <p className="font-mono text-[11px] text-zinc-500">
                ID: #{userId.substring(0, 8)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Rekap Sesi</span>
          </div>
        </div>

        {/* Final Score & Rank */}
        <div className="py-2 text-center">
          <span className="text-xs text-zinc-400 font-sans">
            Total Perolehan Skor
          </span>
          <div className="text-4xl font-extrabold text-amber-400 tracking-tight my-1 tabular-nums">
            {score.toLocaleString()} <span className="text-sm font-sans text-zinc-400 font-normal">Poin</span>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-sans text-zinc-300">
              Peringkat Sementara: <strong className="text-white font-bold font-mono">#{rank}</strong> dari {totalUsers} peserta
            </span>
          </div>
        </div>

        {/* 3 Metric Badges */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center font-mono">
          <div className="bg-[#090C14] p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] text-zinc-500 font-sans">Jawaban Benar</div>
            <div className="text-sm text-emerald-400 font-bold tabular-nums mt-0.5">
              {correctCount} / 10
            </div>
          </div>
          <div className="bg-[#090C14] p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] text-zinc-500 font-sans">Akurasi</div>
            <div className="text-sm text-cyan-400 font-bold tabular-nums mt-0.5">
              {accuracy}%
            </div>
          </div>
          <div className="bg-[#090C14] p-2.5 rounded-lg border border-white/5">
            <div className="text-[10px] text-zinc-500 font-sans">Status</div>
            <div className="text-sm text-zinc-200 font-bold mt-0.5 font-sans">
              Tuntas
            </div>
          </div>
        </div>
      </section>

      {/* 10-Level Matrix Breakdown */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-sans text-xs font-semibold text-zinc-300">
            Rincian Pengerjaan 10 Level
          </h3>
          <span className="font-mono text-xs text-zinc-400">
            {correctCount} / 10 Berhasil
          </span>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center gap-2 text-zinc-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Memuat rincian hasil...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {nodes.map((node) => (
              <div
                key={node.level}
                className={`p-3 rounded-lg border flex flex-col justify-between ${
                  node.is_correct
                    ? 'bg-[#0E151E] border-emerald-500/20'
                    : 'bg-[#120E12] border-rose-500/20 opacity-80'
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[10px] text-zinc-500">
                  <span>Level {node.level < 10 ? `0${node.level}` : node.level}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      node.is_correct ? 'bg-emerald-400' : 'bg-rose-500'
                    }`}
                  />
                </div>
                <div className="text-xs text-zinc-200 truncate my-1.5 font-medium font-sans">
                  {node.title}
                </div>
                <div className="flex items-center justify-between text-xs font-mono">
                  {node.is_correct ? (
                    <>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="w-3 h-3" /> Benar
                      </span>
                      <span className="text-emerald-400 font-bold">+{node.points}</span>
                    </>
                  ) : (
                    <>
                      <span className="text-rose-400 font-semibold flex items-center gap-1 text-[11px]">
                        <XCircle className="w-3 h-3" /> Hangus
                      </span>
                      <span className="text-zinc-600">0 Poin</span>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Auditorium Note & Action Buttons */}
      <section className="pt-2 space-y-3">
        <div className="p-3.5 bg-[#090C14] border border-white/10 rounded-lg text-center text-xs text-zinc-400 leading-relaxed font-sans">
          Seluruh jawaban telah tersimpan di server. Pantau layar proyektor utama di auditorium untuk pengumuman pemenang resmi oleh panitia Generatics TDI HMIF.
        </div>

        <div className="flex gap-2">
          <a
            href="/admin/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 dev-btn-primary py-3 px-3 rounded-lg font-sans text-xs font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Lihat Layar Panggung</span>
          </a>

          <button
            onClick={() => {
              if (window.confirm('Reset sesi dan kembali ke halaman awal?')) {
                localStorage.removeItem('nexus_user');
                window.location.href = '/';
              }
            }}
            className="py-3 px-3.5 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white text-xs rounded-lg transition-colors"
            title="Keluar Sesi"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
}
