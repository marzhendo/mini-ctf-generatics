'use client';

import React, { useState } from 'react';
import { Copy, Check, Terminal, ChevronDown, HelpCircle, Code2 } from 'lucide-react';
import { Challenge } from '@/lib/types';
import { sound } from '@/lib/audio';

interface ChallengeTerminalProps {
  challenge: Challenge;
}

export function ChallengeTerminal({ challenge }: ChallengeTerminalProps) {
  const [copied, setCopied] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Extract quoted string or prominent cipher text from question text if present
  const extractedQuoteMatch = challenge.question_text.match(/"([^"]+)"/);
  const codeSnippet = extractedQuoteMatch
    ? extractedQuoteMatch[1]
    : challenge.question_text;

  const handleCopy = () => {
    sound.playBeep(1100, 0.05);
    navigator.clipboard
      .writeText(codeSnippet)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {});
  };

  const getCategoryLabel = (level: number) => {
    switch (level) {
      case 1:
        return 'Encoding · Base64';
      case 2:
        return 'Encoding · Binary to ASCII';
      case 3:
        return 'Kriptografi · Caesar Cipher (ROT3)';
      case 4:
        return 'Hexadecimal · ASCII Dump';
      case 5:
        return 'Kriptografi · ROT13';
      case 6:
        return 'Sistem Linux · File Permission Octal';
      case 7:
        return 'Jaringan · TCP Port Standards';
      case 8:
        return 'Komunikasi · Sandi Morse';
      case 9:
        return 'Keamanan Informasi · Hash MD5 Cracking';
      case 10:
        return 'Forensik File · Magic Bytes Signature';
      default:
        return 'Tantangan Pemrograman & IT';
    }
  };

  const getHintText = (level: number) => {
    switch (level) {
      case 1:
        return 'Gunakan decoder Base64 online atau jalankan perintah echo "..." | base64 -d di terminal Linux/macOS.';
      case 2:
        return 'Setiap 8 bit biner merepresentasikan 1 karakter ASCII (misal: 01001000 = H, 01001101 = M).';
      case 3:
        return 'Geser mundur setiap karakter alfabet sebanyak 3 langkah ke kiri (misal: J menjadi G, H menjadi E).';
      case 4:
        return 'Ubah setiap pasangan 2 digit heksadesimal ke karakter ASCII (0x43 = C, 0x59 = Y, dst).';
      case 5:
        return 'Rotasikan alfabet sebanyak 13 langkah (A ↔ N, B ↔ O, dsb).';
      case 6:
        return 'Gunakan formula nilai oktal izin Linux: Read (r) = 4, Write (w) = 2, Execute (x) = 1. Jumlahkan per bagian Owner, Group, dan Others.';
      case 7:
        return 'Port HTTP biasa adalah 80, sementara HTTPS (SSL/TLS) menggunakan port 3 digit di rentang 400-an.';
      case 8:
        return 'Format "... --- ..." adalah sinyal maritim darurat universal.';
      case 9:
        return 'Hash MD5 ini merupakan kata sandi paling populer di dunia (kombinasi 6 angka berurutan sederhana).';
      case 10:
        return 'Periksa 4 byte pertama file heksadesimal (header magic bytes) untuk mengetahui ekstensi dokumen sebenarnya.';
      default:
        return 'Perhatikan pola teks, panjang karakter, dan format jawaban yang diminta.';
    }
  };

  return (
    <article className="dev-card p-0 overflow-hidden shadow-2xl">
      {/* IDE Window Titlebar */}
      <div className="h-10 px-3.5 bg-[#0D111A] border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Muted Window Dots */}
          <div className="flex items-center gap-1.5 opacity-70">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>

          {/* Active File Tab */}
          <div className="ml-2 flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#131824] border border-white/10 text-xs font-mono text-zinc-300">
            <Code2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>challenge_0{challenge.level}.py</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block font-mono text-[11px] text-zinc-500">
            UTF-8
          </span>
          <button
            onClick={handleCopy}
            className={`flex items-center gap-1.5 font-mono text-xs px-2.5 py-1 rounded-md transition-all ${
              copied
                ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10'
            }`}
            title="Salin ciphertext / payload"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Disalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Challenge Description */}
      <div className="p-4 bg-[#0A0D14] border-b border-white/5">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono text-[11px] text-cyan-300 font-semibold tracking-wide">
              {getCategoryLabel(challenge.level)}
            </span>
          </div>
          <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            +{challenge.points} Poin
          </span>
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed font-sans">
          {challenge.question_text}
        </p>
      </div>

      {/* Clean Code / Cipher Block */}
      <div className="bg-[#05070C] p-3.5 font-mono text-xs overflow-x-auto selection:bg-cyan-500/30 selection:text-white">
        <div className="flex items-start gap-3">
          <div className="select-none text-zinc-600 text-right font-mono text-xs flex flex-col gap-1 w-5">
            <span>01</span>
            <span>02</span>
          </div>
          <div className="flex flex-col gap-1 text-zinc-300 w-full">
            <div className="text-zinc-500">
              # Nilai payload tantangan level {challenge.level}
            </div>
            <div className="break-all font-mono">
              <span className="text-cyan-400 font-medium">cipher_input</span>{' '}
              <span className="text-zinc-500">=</span>{' '}
              <span className="text-amber-300">&quot;{codeSnippet}&quot;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Clean Hint Drawer */}
      <div className="border-t border-white/10 bg-[#0B0E17]">
        <button
          onClick={() => {
            sound.playBeep(800, 0.04);
            setShowHint(!showHint);
          }}
          className="w-full px-4 py-2.5 flex items-center justify-between hover:bg-white/5 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span className="font-sans text-xs text-amber-300/90 font-medium">
              {showHint ? 'Sembunyikan Petunjuk Pengerjaan' : 'Butuh Petunjuk Pengerjaan? (Hint)'}
            </span>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
              showHint ? 'rotate-180 text-amber-300' : ''
            }`}
          />
        </button>

        {showHint && (
          <div className="px-4 pb-3.5 pt-1 border-t border-amber-500/20 bg-[#0E121E]">
            <p className="font-sans text-xs text-amber-200/90 leading-relaxed">
              {getHintText(challenge.level)}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
