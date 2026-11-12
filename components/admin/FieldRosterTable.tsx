'use client';

import React from 'react';
import { Table, Snowflake } from 'lucide-react';
import { LeaderboardUser } from '@/lib/types';

interface FieldRosterTableProps {
  users: LeaderboardUser[];
}

export function FieldRosterTable({ users }: FieldRosterTableProps) {
  // If more than 3 users, show from rank 4 onwards or all users if <= 3
  const displayUsers = users.length > 3 ? users.slice(3) : users;

  return (
    <section className="col-span-12 lg:col-span-8 dev-card bg-[#0A0D15] p-0 flex flex-col min-h-0 shadow-xl overflow-hidden">
      {/* Table Control Header */}
      <div className="px-4 py-2.5 bg-[#0F131E] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <Table className="text-cyan-400 w-4 h-4" />
          <span className="font-sans text-xs font-semibold text-white">
            Daftar Peserta Arena {users.length > 3 ? `(Peringkat 4 – ${users.length})` : `(${users.length} Peserta)`}
          </span>
        </div>

        {/* Legend Indicators */}
        <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-400 rounded-sm inline-block" /> Selesai
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-cyan-400 rounded-sm inline-block" /> Aktif
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-white/10 rounded-sm inline-block" /> Belum
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-cyan-500/40 border border-cyan-400 rounded-sm inline-block" /> Freeze
          </span>
        </div>
      </div>

      {/* Table Column Headers */}
      <div className="grid grid-cols-12 px-4 py-2 bg-[#090C14] border-b border-white/5 font-mono text-zinc-500 uppercase text-[10px] shrink-0 font-medium">
        <div className="col-span-1">No</div>
        <div className="col-span-3">Nama Peserta</div>
        <div className="col-span-4">Progres Level [01 – 10]</div>
        <div className="col-span-2 text-right">Skor (Poin)</div>
        <div className="col-span-2 text-right">Status</div>
      </div>

      {/* Scrollable High Density Rows */}
      <div className="flex-1 overflow-y-auto divide-y divide-white/5 font-mono">
        {displayUsers.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-sans text-xs">
            Belum ada peserta terdaftar di arena.
          </div>
        ) : (
          displayUsers.map((u) => {
            const rankStr = u.rank ? (u.rank < 10 ? `#0${u.rank}` : `#${u.rank}`) : '#--';
            const nodeMatrix = u.nodeMatrix || [];

            return (
              <div
                key={u.id}
                className={`grid grid-cols-12 px-4 py-2.5 items-center transition-colors text-xs ${
                  u.isFrozen
                    ? 'bg-cyan-500/10 border-l-2 border-cyan-400'
                    : 'hover:bg-white/5'
                }`}
              >
                {/* Rank */}
                <div className="col-span-1 font-mono text-zinc-400 font-semibold">
                  {rankStr}
                </div>

                {/* Operator Name */}
                <div className="col-span-3 font-sans text-xs text-white font-medium flex items-center gap-1.5 truncate pr-2">
                  <span className="truncate">{u.name}</span>
                  {u.isFrozen && (
                    <Snowflake className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                  )}
                  {u.has_double_points && (
                    <span className="px-1.5 py-0.2 bg-amber-400 text-zinc-950 text-[9px] font-bold rounded">2X</span>
                  )}
                </div>

                {/* 10-Node Progress Matrix */}
                <div className="col-span-4 flex items-center gap-1">
                  {Array.from({ length: 10 }).map((_, idx) => {
                    const nodeLvl = idx + 1;
                    const isSolved = nodeMatrix[idx] ?? false;
                    const isActive = u.current_level === nodeLvl && !u.isFinished;

                    let bgClass = 'bg-white/10';
                    if (isSolved) {
                      bgClass = 'bg-emerald-400';
                    } else if (isActive) {
                      bgClass = u.isFrozen ? 'bg-cyan-400 animate-pulse' : 'bg-cyan-400';
                    }

                    return (
                      <span
                        key={nodeLvl}
                        className={`h-3 w-3 sm:w-3.5 ${bgClass} rounded-sm transition-all`}
                        title={`Level ${nodeLvl}: ${isSolved ? 'Selesai' : isActive ? 'Sedang Dikerjakan' : 'Belum Terbuka'}`}
                      />
                    );
                  })}
                </div>

                {/* Score */}
                <div className="col-span-2 text-right font-mono text-xs text-amber-300 font-bold tabular-nums">
                  {u.score.toLocaleString()}
                </div>

                {/* Status */}
                <div className="col-span-2 text-right">
                  {u.isFinished ? (
                    <span className="px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold rounded">
                      Selesai
                    </span>
                  ) : u.isFrozen ? (
                    <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-[10px] font-mono font-semibold rounded">
                      {u.statusText}
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-zinc-300 text-[10px] font-mono rounded">
                      {u.statusText}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
