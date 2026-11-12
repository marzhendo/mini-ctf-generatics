'use client';

import React, { useEffect } from 'react';
import { ShieldAlert, X, Flame } from 'lucide-react';

interface AttackToastProps {
  isOpen: boolean;
  attackerName: string;
  pointsDeducted?: number;
  skillType?: string;
  onClose: () => void;
}

export function AttackToast({
  isOpen,
  attackerName,
  pointsDeducted = 100,
  skillType = 'DEDUCT_POINTS',
  onClose,
}: AttackToastProps) {
  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => clearTimeout(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isSiphon = skillType === 'STEAL_POINTS';

  return (
    <div className="fixed top-16 left-4 right-4 z-50 max-w-[408px] mx-auto animate-in slide-in-from-top-4 duration-300">
      <div className="dev-card bg-[#140B10] border-rose-500/50 p-3.5 shadow-2xl relative flex items-start justify-between gap-3 ring-1 ring-rose-500/30">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 flex-shrink-0 mt-0.5">
            {isSiphon ? (
              <Flame className="w-5 h-5 animate-pulse" />
            ) : (
              <ShieldAlert className="w-5 h-5 animate-bounce" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-sans text-xs font-bold text-rose-300">
                🚨 Serangan Masuk!
              </span>
              <span className="px-1.5 py-0.2 bg-rose-500/20 text-rose-300 font-mono text-[9px] font-bold rounded">
                -{pointsDeducted} PTS
              </span>
            </div>
            <p className="text-xs text-zinc-200 mt-0.5 leading-snug">
              <strong className="text-white font-bold">{attackerName}</strong>{' '}
              {isSiphon
                ? `mencuri ${pointsDeducted} poin dan mentransfer ke skomya!`
                : `mengurangi ${pointsDeducted} poin dari total skormu!`}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 transition-colors flex-shrink-0"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
