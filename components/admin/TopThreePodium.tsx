'use client';

import React from 'react';
import { Trophy, Medal, Star, Snowflake, Zap } from 'lucide-react';
import { LeaderboardUser } from '@/lib/types';
import { AnimatedCounter } from '@/components/ui/AnimatedCounter';

interface TopThreePodiumProps {
  topUsers: LeaderboardUser[];
}

export function TopThreePodium({ topUsers }: TopThreePodiumProps) {
  const rank1 = topUsers[0] || null;
  const rank2 = topUsers[1] || null;
  const rank3 = topUsers[2] || null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-3 shrink-0">
      {/* ======================================================== */}
      {/* 2ND PLACE (SILVER)                                      */}
      {/* ======================================================== */}
      <div className="dev-card bg-[#0D111A] border-slate-400/30 p-3.5 relative overflow-hidden flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-400/15 border border-slate-300/40 flex items-center justify-center font-mono text-base font-bold text-slate-200">
            2
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm lg:text-base text-white font-bold truncate max-w-[150px] lg:max-w-[180px]">
                {rank2 ? rank2.name : 'Belum Ada Peserta'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-400/15 text-slate-300 border border-slate-400/30 font-mono rounded">
                Silver
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 font-mono text-xs">
              {rank2 ? (
                <>
                  <span
                    className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
                      rank2.isFinished
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : rank2.isFrozen
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 flex items-center gap-1'
                        : 'bg-white/5 text-zinc-300 border-white/10'
                    }`}
                  >
                    {rank2.isFrozen && <Snowflake className="w-3 h-3 text-cyan-400 animate-spin" />}
                    {rank2.statusText}
                  </span>
                  {rank2.streak && (
                    <span className="text-emerald-400 flex items-center gap-0.5 text-[11px]">
                      <Zap className="w-3 h-3" /> {rank2.streak}x Beruntun
                    </span>
                  )}
                </>
              ) : (
                <span className="text-zinc-500">Menunggu data...</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right font-mono">
          <div className="text-2xl lg:text-3xl font-extrabold text-slate-100 tabular-nums">
            {rank2 ? <AnimatedCounter value={rank2.score} /> : '0'}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase">
            Poin
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 1ST PLACE (GOLD - ELEVATED CENTER)                       */}
      {/* ======================================================== */}
      <div className="dev-card bg-[#121624] border-amber-400/50 p-4 relative overflow-hidden flex items-center justify-between shadow-xl ring-1 ring-amber-400/20">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="w-11 h-11 rounded-lg bg-amber-400/20 border-2 border-amber-400/80 flex items-center justify-center font-mono text-lg font-extrabold text-amber-300 shadow-md">
              1
            </div>
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 absolute -top-1.5 -right-1.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-base lg:text-lg text-white font-extrabold truncate max-w-[160px] lg:max-w-[200px]">
                {rank1 ? rank1.name : 'Belum Ada Peserta'}
              </span>
              <span className="px-2 py-0.5 bg-amber-400 text-zinc-950 font-sans text-[10px] font-black uppercase rounded">
                Pemuncak
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 font-mono text-xs">
              {rank1 ? (
                <>
                  <span
                    className={`px-2 py-0.5 rounded border text-[11px] font-medium flex items-center gap-1 ${
                      rank1.isFinished
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : rank1.isFrozen
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-white/10 text-zinc-200 border-white/20'
                    }`}
                  >
                    {rank1.isFrozen && <Snowflake className="w-3 h-3 text-cyan-400 animate-spin" />}
                    {rank1.statusText}
                  </span>
                  {rank1.streak && (
                    <span className="text-amber-300 flex items-center gap-0.5 text-[11px]">
                      <Zap className="w-3 h-3" /> {rank1.streak}x Beruntun
                    </span>
                  )}
                </>
              ) : (
                <span className="text-zinc-500">Menunggu data...</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right font-mono">
          <div className="text-2xl lg:text-3xl font-extrabold text-amber-300 tabular-nums">
            {rank1 ? <AnimatedCounter value={rank1.score} /> : '0'}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase">
            Poin
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3RD PLACE (BRONZE)                                      */}
      {/* ======================================================== */}
      <div className="dev-card bg-[#0D111A] border-amber-700/30 p-3.5 relative overflow-hidden flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-700/15 border border-amber-600/40 flex items-center justify-center font-mono text-base font-bold text-amber-500">
            3
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-sans text-sm lg:text-base text-white font-bold truncate max-w-[150px] lg:max-w-[180px]">
                {rank3 ? rank3.name : 'Belum Ada Peserta'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 bg-amber-700/15 text-amber-400 border border-amber-700/30 font-mono rounded">
                Bronze
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 font-mono text-xs">
              {rank3 ? (
                <>
                  <span
                    className={`px-2 py-0.5 rounded border text-[11px] font-medium ${
                      rank3.isFinished
                        ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                        : rank3.isFrozen
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 flex items-center gap-1'
                        : 'bg-white/5 text-zinc-300 border-white/10'
                    }`}
                  >
                    {rank3.isFrozen && <Snowflake className="w-3 h-3 text-cyan-400 animate-spin" />}
                    {rank3.statusText}
                  </span>
                  {rank3.streak && (
                    <span className="text-amber-400 flex items-center gap-0.5 text-[11px]">
                      <Zap className="w-3 h-3" /> {rank3.streak}x Beruntun
                    </span>
                  )}
                </>
              ) : (
                <span className="text-zinc-500">Menunggu data...</span>
              )}
            </div>
          </div>
        </div>
        <div className="text-right font-mono">
          <div className="text-2xl lg:text-3xl font-extrabold text-amber-400/90 tabular-nums">
            {rank3 ? <AnimatedCounter value={rank3.score} /> : '0'}
          </div>
          <div className="text-[10px] text-zinc-500 uppercase">
            Poin
          </div>
        </div>
      </div>
    </section>
  );
}
