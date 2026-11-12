'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Package, ChevronRight, Sparkles, Timer, Flame, Loader2 } from 'lucide-react';

interface AirDropBannerProps {
  onIntercept: () => void;
  onExpire?: () => void;
  title?: string;
  durationSeconds?: number;
  remainingQuota?: number;
  maxQuota?: number;
  isClaiming?: boolean;
}

export function AirDropBanner({
  onIntercept,
  onExpire,
  title = 'Kotak Bantuan Tiba! (Air Drop)',
  durationSeconds = 12,
  remainingQuota = 3,
  maxQuota = 3,
  isClaiming = false,
}: AirDropBannerProps) {
  const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Stably calculate countdown based on timestamp
  useEffect(() => {
    const endTime = Date.now() + durationSeconds * 1000;

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.ceil((endTime - now) / 1000);

      if (diff <= 0) {
        clearInterval(interval);
        setSecondsLeft(0);
        onExpireRef.current?.();
      } else {
        setSecondsLeft(diff);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [durationSeconds]);

  const percentage = Math.max(0, Math.min(100, (secondsLeft / durationSeconds) * 100));

  return (
    <aside
      onClick={isClaiming ? undefined : onIntercept}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !isClaiming) {
          e.preventDefault();
          onIntercept();
        }
      }}
      className="relative overflow-hidden dev-card bg-gradient-to-r from-amber-500/20 via-[#120F0D] to-amber-500/15 border-amber-500/50 hover:border-amber-400 p-3.5 flex flex-col gap-2 cursor-pointer active:scale-[0.99] transition-all group shadow-xl"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative flex items-center justify-center w-11 h-11 bg-amber-500/25 rounded-lg border border-amber-500/50 text-amber-400 flex-shrink-0">
            <Package className="w-5 h-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-sans text-xs sm:text-sm font-bold text-amber-300">
                {title}
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 hidden xs:inline" />
            </div>

            {/* Quota Badge (Only first 3 participants) */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                <span>Sisa Kuota: {remainingQuota}/{maxQuota} Tercepat!</span>
              </span>
              <span className="text-[11px] text-zinc-300 truncate hidden sm:inline">
                Tap cepat untuk ambil skill!
              </span>
            </div>
          </div>
        </div>

        {/* Claim Action Button */}
        <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-400 text-zinc-950 font-sans text-xs font-bold shadow-md group-hover:brightness-105 active:scale-95 transition-all flex-shrink-0">
          {isClaiming ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Mengklaim...</span>
            </>
          ) : (
            <>
              <span>Buka Sekarang</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </>
          )}
        </div>
      </div>

      {/* Countdown Progress Bar */}
      <div className="space-y-1 pt-0.5">
        <div className="flex justify-between items-center text-[10px] font-mono text-amber-300/90">
          <span className="flex items-center gap-1">
            <Timer className="w-3 h-3 text-amber-400 animate-pulse" />
            <span>Klaim sebelum hangus:</span>
          </span>
          <strong className="text-amber-400 font-bold">{secondsLeft} detik</strong>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-200 ease-linear shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </aside>
  );
}
