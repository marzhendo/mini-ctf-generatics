'use client';

import React from 'react';
import Image from 'next/image';
import { Terminal, Bot, Trophy, Timer, Radio, Zap } from 'lucide-react';

interface ArenaHeaderProps {
  userName: string;
  score: number;
  currentLevel: number;
  timeLeftFormatted: string;
  pointsForCurrentLevel: number;
  hasDoublePoints?: boolean;
}

export function ArenaHeader({
  userName,
  score,
  currentLevel,
  timeLeftFormatted,
  pointsForCurrentLevel,
  hasDoublePoints = false,
}: ArenaHeaderProps) {
  const solvedCount = Math.max(0, Math.min(10, currentLevel - 1));

  return (
    <>
      {/* Top Brand Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[#080a0f]/95 backdrop-blur-md max-w-[420px] mx-auto border-b border-white/10 font-mono">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-md bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-white text-xs sm:text-sm tracking-wider">
            GENERATICS CTF
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-[10px] font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>ARENA LIVE</span>
          </div>

          <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
            <Image
              src="/img/assets/hmif-logo.png"
              alt="HMIF Logo"
              width={18}
              height={18}
              className="object-contain"
            />
          </div>
        </div>
      </header>

      {/* Telemetry HUD */}
      <section className="dev-card p-3 space-y-2.5 mt-2 font-mono shadow-md">
        {/* Row 1: Operator, Score, Countdown */}
        <div className="flex items-center justify-between gap-1.5 flex-wrap">
          {/* Operator Pill */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 bg-white/[0.04] border border-white/10 rounded-md max-w-[150px]">
            <Bot className="text-cyan-400 w-3.5 h-3.5 flex-shrink-0" />
            <span className="text-[11px] text-slate-200 uppercase font-bold tracking-wider truncate">
              {userName || 'PESERTA'}
            </span>
          </div>

          {/* Score Badge */}
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500/[0.08] border border-amber-400/40 rounded-md">
            <Trophy className="text-amber-400 w-3.5 h-3.5" />
            <span className="text-xs text-amber-300 font-extrabold tracking-wider tabular-nums">
              {score.toLocaleString()} PTS
            </span>
          </div>

          {/* Session Countdown Timer */}
          <div className="flex items-center space-x-1 px-2 py-1 bg-white/[0.04] border border-white/10 rounded-md">
            <Timer className="text-cyan-400 w-3.5 h-3.5" />
            <span className="text-xs text-cyan-300 font-bold tracking-wider tabular-nums">
              {timeLeftFormatted}
            </span>
          </div>
        </div>

        {/* 10-Node Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>SECTOR PROGRESS</span>
            <span className="text-emerald-400 font-bold">
              {solvedCount} / 10 SELESAI
            </span>
          </div>
          <div className="grid grid-cols-10 gap-1 h-2">
            {Array.from({ length: 10 }).map((_, index) => {
              const nodeNum = index + 1;
              const isSolved = nodeNum < currentLevel;
              const isActive = nodeNum === currentLevel;

              let nodeClasses = 'h-full rounded-[2px] transition-all duration-300 ';
              if (isSolved) {
                nodeClasses += 'bg-emerald-400';
              } else if (isActive) {
                nodeClasses += 'bg-cyan-400 animate-pulse';
              } else {
                nodeClasses += 'bg-white/10';
              }

              return (
                <div
                  key={nodeNum}
                  className={nodeClasses}
                  title={`Level ${nodeNum}: ${isSolved ? 'Selesai' : isActive ? 'Sedang Dikerjakan' : 'Terkunci'}`}
                />
              );
            })}
          </div>
        </div>

        {/* Level Info & Bounty */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          <div className="flex items-center space-x-1.5">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-cyan-300 font-bold tracking-wide">
              LEVEL {currentLevel < 10 ? `0${currentLevel}` : currentLevel} // SOAL AKTIF
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasDoublePoints && (
              <span className="px-2 py-0.5 bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[10px] font-bold rounded flex items-center gap-1 animate-pulse">
                <Zap className="w-3 h-3 text-amber-400" />
                2X OVERCLOCK
              </span>
            )}
            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded">
              <span className="text-[11px] text-emerald-400 font-extrabold tabular-nums">
                +{hasDoublePoints ? pointsForCurrentLevel * 2 : pointsForCurrentLevel} PTS
              </span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
