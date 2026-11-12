'use client';

import React, { useState } from 'react';
import { Package, Pause, Play, Trophy, Loader2, RefreshCw, BarChart3, Volume2, VolumeX } from 'lucide-react';
import { triggerAirDrop } from '@/app/actions/triggerAirDrop';
import { sound } from '@/lib/audio';
import confetti from 'canvas-confetti';

interface AdminControlsFooterProps {
  isTimerPaused: boolean;
  onTogglePauseTimer: () => void;
  onRevealWinners: () => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onOpenAnalysis?: () => void;
}

export function AdminControlsFooter({
  isTimerPaused,
  onTogglePauseTimer,
  onRevealWinners,
  onRefresh,
  isRefreshing = false,
  onOpenAnalysis,
}: AdminControlsFooterProps) {
  const [isTriggeringDrop, setIsTriggeringDrop] = useState(false);
  const [isSoundMuted, setIsSoundMuted] = useState(() => sound.isMuted());

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsSoundMuted(muted);
    if (!muted) {
      sound.playBeep(1000, 0.05);
    }
  };

  const handleAirDropClick = async () => {
    if (isTriggeringDrop) return;
    setIsTriggeringDrop(true);
    sound.playAirDropAlert();

    try {
      const res = await triggerAirDrop();
      if (!res.success) {
        alert(res.error || 'Gagal memicu Air Drop.');
      }
    } catch {
      alert('Gagal menghubungi server.');
    } finally {
      setIsTriggeringDrop(false);
    }
  };

  const handleEndMatch = () => {
    sound.playSuccess();
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#ffd700', '#00ff9d', '#00e3fd', '#ffffff'],
      });
    } catch {}
    onRevealWinners();
  };

  return (
    <footer className="w-full z-40 flex flex-col sm:flex-row justify-between items-center px-5 py-2.5 border-t border-white/10 bg-[#080A0F] shrink-0">
      {/* Left Info */}
      <div className="flex items-center gap-3 mb-2 sm:mb-0">
        <span className="font-sans text-xs font-semibold text-zinc-300">
          Panel Kontrol MC &amp; Operator Panggung
        </span>
        <div className="hidden md:flex items-center gap-2 text-zinc-500 font-mono text-xs">
          <span>•</span>
          <span>Sesi: CTF-AUDITORIUM-2026</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2.5 flex-wrap justify-end">
        {/* Quick Sync Button */}
        {onRefresh && (
          <button
            onClick={() => {
              sound.playBeep(900, 0.03);
              onRefresh();
            }}
            disabled={isRefreshing}
            className="border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-sans text-xs px-2.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
            title="Segarkan data leaderboard dan urutan ranking"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Sync</span>
          </button>
        )}

        {/* Sound FX Mute Toggle Button */}
        <button
          onClick={handleToggleSound}
          className={`border text-xs px-2.5 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-sans ${
            isSoundMuted
              ? 'border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
              : 'border-white/10 bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white'
          }`}
          title={isSoundMuted ? 'Suara dinonaktifkan (Klik untuk aktifkan)' : 'Suara aktif (Klik untuk mute)'}
        >
          {isSoundMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              <span>Muted</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Audio FX</span>
            </>
          )}
        </button>

        {/* Question Analysis (Quizizz Mode) Button */}
        {onOpenAnalysis && (
          <button
            onClick={() => {
              sound.playBeep(950, 0.04);
              onOpenAnalysis();
            }}
            className="border border-cyan-500/30 hover:border-cyan-500/50 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 font-sans text-xs px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 font-semibold shadow-sm"
            title="Buka Analisis Soal & Jawaban (Quizizz Mode)"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analisis Soal</span>
          </button>
        )}

        {/* Trigger Air Drop Button */}
        <button
          onClick={handleAirDropClick}
          disabled={isTriggeringDrop}
          className="bg-amber-500 hover:bg-amber-400 text-zinc-950 font-sans text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 disabled:opacity-50"
        >
          {isTriggeringDrop ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Package className="w-3.5 h-3.5" />
          )}
          <span>Luncurkan Air Drop</span>
        </button>

        {/* Pause/Resume Timer Button */}
        <button
          onClick={() => {
            sound.playBeep(1000, 0.04);
            onTogglePauseTimer();
          }}
          className="bg-white/10 hover:bg-white/15 text-zinc-200 font-sans text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 border border-white/10"
        >
          {isTimerPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
          <span>{isTimerPaused ? 'Lanjutkan Timer' : 'Jeda Timer'}</span>
        </button>

        {/* End Match & Reveal Winners Button */}
        <button
          onClick={handleEndMatch}
          className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-sans text-xs font-semibold px-3.5 py-1.5 rounded-md transition-colors flex items-center gap-1.5"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Umumkan Pemenang (Reveal Podium)</span>
        </button>
      </div>
    </footer>
  );
}
