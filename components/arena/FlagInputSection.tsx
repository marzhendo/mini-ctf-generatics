'use client';

import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, X, Loader2, CornerDownLeft } from 'lucide-react';
import { sound } from '@/lib/audio';

interface FlagInputSectionProps {
  onSubmit: (flag: string) => Promise<void>;
  isSubmitting: boolean;
  isFrozen: boolean;
}

export function FlagInputSection({
  onSubmit,
  isSubmitting,
  isFrozen,
}: FlagInputSectionProps) {
  const [flagInput, setFlagInput] = useState('');
  const [shake, setShake] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isFrozen) return;

    const trimmed = flagInput.trim();
    if (!trimmed) {
      sound.playError();
      setShake(true);
      setTimeout(() => setShake(false), 350);
      return;
    }

    sound.playBeep(1200, 0.05);
    await onSubmit(trimmed);
  };

  const handleClear = () => {
    sound.playBeep(700, 0.03);
    setFlagInput('');
  };

  return (
    <section className="dev-card p-4 space-y-3 relative shadow-xl">
      {/* Warning Banner - Clear & Authentic */}
      <div className="flex items-start gap-2.5 px-3 py-2 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300">
        <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400 mt-0.5" />
        <span className="text-xs font-sans leading-relaxed text-amber-200">
          <strong className="text-amber-300 font-semibold">Aturan One-Shot:</strong> Kamu hanya
          bisa menjawab <strong>1 kali</strong> per level. Pastikan format flag / jawaban sudah
          sesuai sebelum mengirim.
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Modern Monospace Input Box */}
        <div className={`relative flex items-center ${shake ? 't-input-shake' : ''}`}>
          <div className="absolute left-3.5 flex items-center pointer-events-none text-cyan-400">
            <span className="font-mono text-sm font-semibold">&gt;</span>
          </div>

          <input
            type="text"
            value={flagInput}
            onChange={(e) => setFlagInput(e.target.value.toUpperCase())}
            disabled={isSubmitting || isFrozen}
            placeholder="Ketik flag jawaban..."
            className="w-full bg-[#07090F] text-zinc-100 placeholder:text-zinc-600 font-mono text-sm pl-8 pr-10 py-3 rounded-lg border border-white/10 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 focus:outline-none transition-all uppercase tracking-wider disabled:opacity-50"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="characters"
            spellCheck="false"
          />

          {flagInput && !isSubmitting && !isFrozen && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 text-zinc-500 hover:text-zinc-200 p-1 transition-colors"
              aria-label="Hapus teks input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* CTA Button */}
        <button
          type="submit"
          disabled={isSubmitting || isFrozen || !flagInput.trim()}
          className="w-full dev-btn-primary py-3 px-4 rounded-lg font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
              <span>Memverifikasi Jawaban...</span>
            </>
          ) : isFrozen ? (
            <span>Input Terkunci Sementara (Freeze)</span>
          ) : (
            <>
              <span>Kirim Jawaban</span>
              <div className="flex items-center gap-1 opacity-70 text-xs font-mono">
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span>Enter</span>
              </div>
              <ArrowRight className="w-4 h-4 ml-0.5" />
            </>
          )}
        </button>
      </form>

      {/* Helpful Status Meta */}
      <div className="pt-0.5 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-500">
        <span>Format: Case-insensitive</span>
        <span>Validasi: Server-side</span>
      </div>
    </section>
  );
}
