'use client';

import React, { useEffect } from 'react';
import { Flame, Zap, Sparkles, X } from 'lucide-react';

export interface StageStreakAlert {
  id: string;
  userName: string;
  streakCount: number;
  bonusPercent: string;
}

interface StageStreakBannerProps {
  alert: StageStreakAlert | null;
  onDismiss: () => void;
}

export function StageStreakBanner({ alert, onDismiss }: StageStreakBannerProps) {
  useEffect(() => {
    if (!alert) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 4500);
    return () => clearTimeout(timer);
  }, [alert, onDismiss]);

  if (!alert) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[92vw] animate-terminal-enter font-sans">
      <div className="p-4 rounded-xl bg-[#0C101A]/95 backdrop-blur-xl border-2 border-amber-500/70 shadow-[0_0_30px_rgba(245,158,11,0.35)] flex items-center justify-between gap-3 text-white">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500/30 to-rose-500/30 border border-amber-500/60 flex items-center justify-center text-amber-300 shadow-lg">
            <Flame className="w-6 h-6 text-amber-400 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                STREAK {alert.streakCount}X ON FIRE
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                +{alert.bonusPercent} BONUS
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 tracking-tight">
              <span className="text-cyan-400 font-mono">{alert.userName}</span> sedang melaju tanpa salah!
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="p-1 rounded-md text-zinc-500 hover:text-zinc-300 hover:bg-white/10 transition-colors"
          title="Tutup Notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
