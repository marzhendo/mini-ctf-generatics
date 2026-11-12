'use client';

import React, { useEffect, useState } from 'react';
import { Package, ChevronRight, Sparkles, Timer } from 'lucide-react';

interface AirDropBannerProps {
  onIntercept: () => void;
  onExpire?: () => void;
  title?: string;
  durationSeconds?: number;
}

export function AirDropBanner({
  onIntercept,
  onExpire,
  title = 'Kotak Bantuan Tiba! (Air Drop)',
  durationSeconds = 5,
}: AirDropBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpire]);

  const percentage = Math.max(0, (secondsLeft / durationSeconds) * 100);

  return (
    <aside
      onClick={onIntercept}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onIntercept();
        }
      }}
      className="relative overflow-hidden dev-card bg-gradient-to-r from-amber-500/15 via-[#0E121B] to-amber-500/10 border-amber-500/40 hover:border-amber-400 p-3.5 flex flex-col gap-2 cursor-pointer active:scale-[0.99] transition-all group shadow-lg"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 bg-amber-500/20 rounded-lg border border-amber-500/40 text-amber-400">
            <Package className="w-5 h-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs sm:text-sm font-bold text-amber-300">
                {title}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 hidden xs:inline" />
            </div>
            <p className="text-[11px] text-zinc-300 leading-snug mt-0.5">
              Sentuh sekarang untuk mengambil 1 skill taktis!
            </p>
          </div>
        </div>

        {/* Claim Action Button */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-400 text-zinc-950 font-sans text-xs font-bold shadow-md group-hover:brightness-105 transition-all flex-shrink-0">
          <span>Buka</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* 5-Second Countdown Progress Bar */}
      <div className="space-y-1 pt-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono text-amber-300/90">
          <span className="flex items-center gap-1">
            <Timer className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Klaim sebelum hangus:</span>
          </span>
          <strong className="text-amber-400 font-bold">{secondsLeft}s</strong>
        </div>
        <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-1000 ease-linear"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
