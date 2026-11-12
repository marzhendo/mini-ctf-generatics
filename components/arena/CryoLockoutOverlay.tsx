'use client';

import React, { useEffect, useState } from 'react';
import { Lock, Snowflake } from 'lucide-react';
import { sound } from '@/lib/audio';

interface CryoLockoutOverlayProps {
  frozenUntil: string;
  attackerName?: string;
  onThawed: () => void;
}

export function CryoLockoutOverlay({
  frozenUntil,
  attackerName = 'Peserta Rival',
  onThawed,
}: CryoLockoutOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState(15);
  const totalDuration = 15;

  useEffect(() => {
    sound.playFreezeShatter();

    const calculateRemaining = () => {
      const now = Date.now();
      const target = new Date(frozenUntil).getTime();
      const diff = Math.max(0, Math.ceil((target - now) / 1000));
      return diff;
    };

    const initial = calculateRemaining();
    setSecondsLeft(initial > 0 ? initial : 15);

    const interval = setInterval(() => {
      const remaining = calculateRemaining();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
        sound.playBeep(1200, 0.1);
        onThawed();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [frozenUntil, onThawed]);

  const percentage = Math.max(0, Math.min(100, ((totalDuration - secondsLeft) / totalDuration) * 100));
  // Circle circumference: 2 * PI * 58 ~= 364.42
  const circumference = 2 * Math.PI * 58;
  const strokeDashoffset = circumference - (circumference * percentage) / 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050C16]/90 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="dev-card bg-[#0B1320] border-cyan-500/30 w-full max-w-[380px] p-6 text-center shadow-2xl space-y-4">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs">
          <div className="flex items-center gap-1.5 text-cyan-400 font-medium">
            <Snowflake className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            <span>Efek Freeze Aktif</span>
          </div>
          <span className="font-mono text-zinc-400 text-[11px]">15 Detik</span>
        </div>

        {/* Circular Countdown Ring */}
        <div className="relative w-36 h-36 mx-auto flex items-center justify-center py-2">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Track */}
            <circle
              cx="72"
              cy="72"
              r="58"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="6"
              fill="transparent"
            />
            {/* Active Cyan Progress */}
            <circle
              cx="72"
              cy="72"
              r="58"
              stroke="#06b6d4"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>

          {/* Central Counter Display */}
          <div className="absolute flex flex-col items-center justify-center">
            <div className="w-8 h-8 rounded-full bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-1">
              <Lock className="w-4 h-4" />
            </div>
            <span className="font-mono text-2xl font-bold text-white tabular-nums">
              {secondsLeft}s
            </span>
            <span className="text-[10px] font-sans text-zinc-400">tersisa</span>
          </div>
        </div>

        {/* Content Details */}
        <div>
          <h3 className="text-base font-bold text-white">
            Layar Terkunci Sementara
          </h3>
          <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
            Peserta lawan menggunakan skill Freeze pada perangkatmu. Input jawaban dinonaktifkan sementara.
          </p>

          {/* Attacker Callout */}
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            <span>Target serangan oleh: <strong>{attackerName}</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
}
