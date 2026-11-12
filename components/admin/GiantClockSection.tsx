'use client';

import React from 'react';
import { Timer, Radio, Pause } from 'lucide-react';

interface GiantClockSectionProps {
  secondsRemaining: number;
  isPaused?: boolean;
}

export function GiantClockSection({
  secondsRemaining,
  isPaused = false,
}: GiantClockSectionProps) {
  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formattedMins = mins < 10 ? `0${mins}` : `${mins}`;
  const formattedSecs = secs < 10 ? `0${secs}` : `${secs}`;

  const isLowTime = secondsRemaining <= 300 && secondsRemaining > 0;
  const isTimeUp = secondsRemaining === 0;

  return (
    <section className="relative z-30 px-5 py-2.5 bg-[#090C14] border-b border-white/10 shrink-0">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Tournament Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
            </span>
            <span className="font-sans text-xs sm:text-sm font-semibold text-white tracking-wide">
              Sesi Kompetisi Sedang Berlangsung
            </span>
          </div>
          <span className="text-zinc-500 font-mono text-xs hidden lg:inline">
            Auditorium Hall · 30 Menit Babak Penyisihan
          </span>
        </div>

        {/* Center High-Visibility Clock */}
        <div className="flex items-center gap-4 bg-[#0E131F] px-6 py-1.5 rounded-lg border border-cyan-500/30 shadow-md">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-sans text-cyan-300 font-semibold tracking-wide">
              Sisa Waktu Babak
            </div>
            <div className="font-mono text-[10px] text-zinc-400">
              {isPaused ? 'Dijeda oleh MC' : isLowTime ? 'Fase Menit Terakhir' : 'Waktu Standar'}
            </div>
          </div>

          <div className="h-8 w-px bg-white/10 hidden sm:block" />

          {/* Digital Numbers */}
          <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-widest text-cyan-300 flex items-center gap-1 font-mono tabular-nums">
            <span>{formattedMins}</span>
            <span className={`text-white ${isPaused ? '' : 'animate-pulse'}`}>:</span>
            <span>{formattedSecs}</span>
          </div>

          <div className="hidden sm:block pl-1">
            {isPaused ? (
              <span className="px-2.5 py-0.5 bg-amber-500/15 border border-amber-400/40 text-amber-300 font-mono text-xs font-semibold rounded flex items-center gap-1">
                <Pause className="w-3 h-3 fill-current" />
                <span>Dijeda</span>
              </span>
            ) : isTimeUp ? (
              <span className="px-2.5 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-semibold rounded">
                Waktu Habis
              </span>
            ) : isLowTime ? (
              <span className="px-2.5 py-0.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-xs font-semibold rounded animate-pulse">
                Waktu Kritis
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-semibold rounded">
                Aktif
              </span>
            )}
          </div>
        </div>

        {/* Right Broadcast Meta */}
        <div className="hidden md:flex items-center gap-3 font-mono text-xs text-zinc-400">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Sinkronisasi Otomatis</span>
          </div>
        </div>
      </div>
    </section>
  );
}
