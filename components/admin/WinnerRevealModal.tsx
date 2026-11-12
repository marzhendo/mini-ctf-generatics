'use client';

import React from 'react';
import { Trophy, Star, X, Medal } from 'lucide-react';
import { LeaderboardUser } from '@/lib/types';

interface WinnerRevealModalProps {
  isOpen: boolean;
  onClose: () => void;
  topUsers: LeaderboardUser[];
}

export function WinnerRevealModal({
  isOpen,
  onClose,
  topUsers,
}: WinnerRevealModalProps) {
  if (!isOpen) return null;

  const first = topUsers[0] || null;
  const second = topUsers[1] || null;
  const third = topUsers[2] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="w-full max-w-[680px] dev-card bg-[#0D111A] border-amber-400/40 rounded-xl p-6 relative text-center space-y-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div>
          <div className="flex items-center justify-center gap-2 text-amber-400 font-sans text-xs font-semibold uppercase tracking-wider">
            <Trophy className="w-4 h-4" />
            <span>Pengumuman Pemenang Resmi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Juara Mini CTF Generatics 2026
          </h2>
          <p className="font-sans text-xs text-zinc-400 mt-1">
            Himpunan Mahasiswa Informatika (HMIF) · Tim Daya Inovasi (TDI)
          </p>
        </div>

        {/* 3 Column Podium */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end pt-2">
          {/* 2nd Place */}
          <div className="p-4 rounded-lg bg-[#0F1420] border border-slate-400/30 text-center space-y-2 order-2 sm:order-1">
            <Medal className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="text-xs font-bold text-slate-300 uppercase">Juara 2</div>
            <div className="text-base text-white font-bold truncate">
              {second ? second.name : 'Belum Ada'}
            </div>
            <div className="font-mono text-xl text-slate-200 font-extrabold tabular-nums">
              {second ? second.score.toLocaleString() : '0'} <span className="text-xs font-sans text-zinc-500 font-normal">Poin</span>
            </div>
          </div>

          {/* 1st Place (Center Champion) */}
          <div className="p-5 rounded-lg bg-[#141A28] border-2 border-amber-400 text-center space-y-2 order-1 sm:order-2 sm:scale-105 shadow-xl ring-1 ring-amber-400/30">
            <Trophy className="w-10 h-10 text-amber-400 mx-auto" />
            <div className="flex items-center justify-center gap-1 text-amber-300 text-xs font-extrabold uppercase">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Juara 1 (Utama)</span>
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-xl text-white font-extrabold truncate">
              {first ? first.name : 'Belum Ada'}
            </div>
            <div className="font-mono text-3xl text-amber-400 font-black tabular-nums">
              {first ? first.score.toLocaleString() : '0'} <span className="text-sm font-sans text-zinc-400 font-normal">Poin</span>
            </div>
          </div>

          {/* 3rd Place */}
          <div className="p-4 rounded-lg bg-[#0F1420] border border-amber-700/40 text-center space-y-2 order-3">
            <Medal className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="text-xs font-bold text-amber-500 uppercase">Juara 3</div>
            <div className="text-base text-white font-bold truncate">
              {third ? third.name : 'Belum Ada'}
            </div>
            <div className="font-mono text-xl text-amber-400/90 font-extrabold tabular-nums">
              {third ? third.score.toLocaleString() : '0'} <span className="text-xs font-sans text-zinc-500 font-normal">Poin</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2">
          <button
            onClick={onClose}
            className="w-full dev-btn-primary py-3 rounded-lg font-sans text-sm font-semibold transition-transform active:scale-[0.99]"
          >
            Tutup &amp; Kembali ke Layar Utama
          </button>
        </div>
      </div>
    </div>
  );
}
