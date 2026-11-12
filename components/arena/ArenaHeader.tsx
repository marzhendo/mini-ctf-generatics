'use client';

import React from 'react';
import Image from 'next/image';
import { Terminal, Bot, Trophy, Timer, Radio, Zap, Flame } from 'lucide-react';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface ArenaHeaderProps {
  userName: string;
  score: number;
  currentLevel: number;
  timeLeftFormatted: string;
  pointsForCurrentLevel: number;
  hasDoublePoints?: boolean;
  currentStreak?: number;
}

export function ArenaHeader({
  userName,
  score,
  currentLevel,
  timeLeftFormatted,
  pointsForCurrentLevel,
  hasDoublePoints = false,
  currentStreak = 0,
}: ArenaHeaderProps) {
  const solvedCount = Math.max(0, Math.min(10, currentLevel - 1));

  const getStreakBonusText = (streak: number) => {
    if (streak === 4) return '+25%';
    if (streak >= 5) return '+50%';
    return null;
  };

  const streakBonusText = getStreakBonusText(currentStreak);

  return (
    <>
      {/* Top Brand Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-[#080a0f]/95 backdrop-blur-md max-w-[440px] mx-auto border-b border-white/10 font-mono">
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
            <Image
              src="/img/assets/tdi-logo.png"
              alt="TDI Logo"
              width={18}
              height={18}
              className="object-contain"
            />
          </div>
        </div>
      </header>

      {/* Main Telemetry Card */}
      <section className="dev-card p-3 space-y-2.5 font-mono">
        {/* User Stats Row */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold leading-none truncate max-w-[120px]">
                {userName}
              </span>
              <span className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                <Radio className="w-2.5 h-2.5 text-emerald-400" />
                <span>ONLINE</span>
              </span>
            </div>
          </div>

          {/* Points / Score Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-amber-400/10 border border-amber-400/30">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <AnimatedCounter
              value={score}
              className="text-amber-300 font-extrabold text-sm tabular-nums"
            />
            <span className="text-[10px] text-amber-400/80">PTS</span>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/30">
            <Timer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs text-cyan-300 font-bold tracking-wider tabular-nums">
              {timeLeftFormatted}
            </span>
          </div>
        </div>

        {/* 10-Node Progress Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-[10px]">
            <span>PROGRES LEVEL</span>
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

        {/* Level Info, Streak & Bounty */}
        <div className="flex items-center justify-between pt-1 border-t border-white/10">
          <div className="flex items-center space-x-1.5">
            <span className="inline-block w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-[11px] text-cyan-300 font-bold tracking-wide">
              LEVEL {currentLevel < 10 ? `0${currentLevel}` : currentLevel} // SOAL AKTIF
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {currentStreak >= 3 && (
              <span className="px-2 py-0.5 bg-rose-500/20 border border-rose-500/50 text-rose-300 text-[10px] font-bold rounded flex items-center gap-1 animate-streak-fire">
                <Flame className="w-3 h-3 text-rose-400 animate-bounce" />
                <span>{currentStreak}X{streakBonusText ? ` (${streakBonusText})` : ''}</span>
              </span>
            )}

            {hasDoublePoints && (
              <span className="px-2 py-0.5 bg-amber-400/20 border border-amber-400/50 text-amber-300 text-[10px] font-bold rounded flex items-center gap-1 animate-pulse">
                <Zap className="w-3 h-3 text-amber-400" />
                2X
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
