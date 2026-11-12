'use client';

import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
  Zap,
  CornerDownLeft,
  Flame,
} from 'lucide-react';
import { sound } from '@/lib/audio';

interface FeedbackModalProps {
  isOpen: boolean;
  isCorrect: boolean;
  pointsAwarded: number;
  currentLevel: number;
  hasDoublePoints?: boolean;
  streakCount?: number;
  streakMultiplier?: number;
  onAdvance: () => void;
}

export function FeedbackModal({
  isOpen,
  isCorrect,
  pointsAwarded,
  currentLevel,
  hasDoublePoints = false,
  streakCount = 0,
  streakMultiplier = 1,
  onAdvance,
}: FeedbackModalProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(4);

  useEffect(() => {
    if (!isOpen) return;

    if (isCorrect) {
      sound.playSuccess();
      setSecondsRemaining(4);

      const interval = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            onAdvance();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      sound.playError();
    }
  }, [isOpen, isCorrect, onAdvance]);

  // Handle Enter key to quickly advance
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onAdvance();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onAdvance]);

  if (!isOpen) return null;

  const nextLevel = currentLevel + 1;
  const isFinalNode = currentLevel >= 10;
  const hasStreakBonus = isCorrect && streakCount >= 4 && streakMultiplier > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[400px] relative">
        {isCorrect ? (
          /* ======================================================== */
          /* SUCCESS STATE: Jawaban Benar                              */
          /* ======================================================== */
          <div className="dev-card bg-[#0D111A] border-emerald-500/30 p-5 space-y-4 shadow-2xl relative">
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium">
                Level {currentLevel} Selesai
              </span>
              <span className="text-zinc-500 text-xs font-mono">Tervalidasi</span>
            </div>

            {/* Central Icon & Headline */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Jawaban Benar!
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Poin telah berhasil ditambahkan ke saldo skormu.
              </p>
            </div>

            {/* Points Awarded Card */}
            <div className="p-3 rounded-lg bg-[#121826] border border-emerald-500/20 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="font-sans text-sm font-semibold text-emerald-300">
                    +{pointsAwarded} Poin
                  </span>
                  {hasDoublePoints && (
                    <span className="px-1.5 py-0.5 bg-amber-400 text-zinc-950 font-mono text-[10px] font-bold rounded flex items-center gap-0.5">
                      <Zap className="w-3 h-3" /> 2X BONUS
                    </span>
                  )}
                </div>
                <span className="font-mono text-xs text-zinc-400">
                  1st Attempt
                </span>
              </div>

              {/* Streak Multiplier Notice */}
              {hasStreakBonus && (
                <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs font-mono text-amber-300">
                  <span className="flex items-center gap-1.5 font-bold">
                    <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                    <span>STREAK {streakCount}X BERTURUT-TURUT!</span>
                  </span>
                  <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 rounded font-bold">
                    +{streakMultiplier === 1.25 ? '25%' : '50%'} BONUS
                  </span>
                </div>
              )}
            </div>

            {/* Auto-advance Countdown Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-xs text-zinc-400 font-mono">
                <span>
                  {isFinalNode
                    ? 'Menuju debrief akhir dalam'
                    : `Menuju Level ${nextLevel} dalam`}{' '}
                  <strong className="text-emerald-400 font-semibold">{secondsRemaining}s</strong>
                </span>
                <span className="text-zinc-500 text-[11px]">[↵ Enter]</span>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-1000"
                  style={{ width: `${(secondsRemaining / 4) * 100}%` }}
                />
              </div>
            </div>

            {/* Advance Action Button */}
            <button
              onClick={onAdvance}
              className="w-full dev-btn-primary py-3 px-4 rounded-lg font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:brightness-105"
            >
              <span>{isFinalNode ? 'Lihat Hasil Akhir (Debrief)' : `Lanjut ke Level ${nextLevel}`}</span>
              <CornerDownLeft className="w-4 h-4 opacity-70" />
            </button>
          </div>
        ) : (
          /* ======================================================== */
          /* FAILED STATE: Jawaban Salah (One-Shot Permadeath)        */
          /* ======================================================== */
          <div className="dev-card bg-[#0D111A] border-rose-500/30 p-5 space-y-4 shadow-2xl relative">
            {/* Top Badge */}
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 font-medium">
                Level {currentLevel} Gagal
              </span>
              <span className="text-zinc-500 text-xs font-mono">One-Shot</span>
            </div>

            {/* Central Icon & Headline */}
            <div className="flex flex-col items-center text-center pt-2">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-3">
                <XCircle className="w-8 h-8 text-rose-400" />
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Jawaban Kurang Tepat
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Poin tidak bertambah (+0 poin) untuk tantangan ini.
              </p>
            </div>

            {/* Rule Explanation Box */}
            <div className="p-3.5 rounded-lg bg-[#161217] border border-rose-500/20 text-xs text-zinc-300 leading-relaxed font-sans">
              <p>
                Sesuai aturan <strong>One-Shot Survival</strong>, kamu tidak bisa mengulang level ini. Sistem otomatis melanjutkanmu ke level berikutnya agar tetap bisa bersaing merebut poin tersisa!
              </p>
            </div>

            {/* Advance Action Button */}
            <button
              onClick={onAdvance}
              className="w-full dev-btn-secondary py-3 px-4 rounded-lg font-sans font-semibold text-sm text-zinc-200 border-white/10 hover:border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              <span>{isFinalNode ? 'Lihat Hasil Akhir' : `Lanjut ke Level ${nextLevel}`}</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
