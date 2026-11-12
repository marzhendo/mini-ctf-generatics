'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Maximize, Minimize, Wifi, ShieldCheck, Users } from 'lucide-react';
import { sound } from '@/lib/audio';

interface ProjectorHeaderProps {
  totalOperators: number;
}

export function ProjectorHeader({ totalOperators }: ProjectorHeaderProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    sound.playBeep(900, 0.04);
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="flex justify-between items-center w-full px-5 py-2.5 border-b border-white/10 bg-[#080A0F] z-40 shrink-0">
      {/* Left: Official Tournament Identity */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          {/* Official HMIF Badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0A101D] border border-cyan-500/30 text-cyan-300 text-xs font-semibold">
            <Image
              src="/img/assets/hmif-logo.png"
              alt="HMIF Logo"
              width={18}
              height={18}
              className="object-contain"
            />
            <span>HMIF</span>
          </div>

          {/* Official TDI Badge */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#0A1814] border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Image
              src="/img/assets/tdi-logo.png"
              alt="TDI Logo"
              width={18}
              height={18}
              className="object-contain"
            />
            <span>TDI</span>
          </div>
        </div>

        <div className="h-4 w-px bg-white/10 hidden sm:block" />

        <div className="flex flex-col">
          <span className="text-white font-sans text-xs sm:text-sm font-bold tracking-tight">
            Mini CTF Generatics 2026
          </span>
          <span className="text-zinc-400 font-mono text-[10px] hidden md:inline">
            Layar Panggung Utama // Live Leaderboard
          </span>
        </div>
      </div>

      {/* Center: Stage Notice */}
      <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-sans text-zinc-300">
        <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
        <span>One-Shot Attempt · 10 Level Tantangan Berurutan</span>
      </div>

      {/* Right: Participant Count & Fullscreen Button */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 bg-[#0D111A] px-3 py-1 rounded-md border border-white/10 font-mono text-xs">
          <Users className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-white font-bold tabular-nums">{totalOperators}</span>
          <span className="text-zinc-400">Peserta Terdaftar</span>
          <span className="text-white/20">•</span>
          <div className="flex items-center gap-1 text-emerald-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px]">Auto-Sync (2.5s)</span>
          </div>
        </div>

        <button
          onClick={toggleFullscreen}
          className="border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-sans text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
          title="Fullscreen Mode (F11)"
        >
          {isFullscreen ? (
            <>
              <Minimize className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit Fullscreen</span>
            </>
          ) : (
            <>
              <Maximize className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Layar Penuh</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
