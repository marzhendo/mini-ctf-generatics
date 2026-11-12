'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Zap,
  HelpCircle,
  AlertTriangle,
  Snowflake,
  Flame,
  Magnet,
  KeyRound,
  Terminal,
} from 'lucide-react';
import { sound } from '@/lib/audio';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'rules' | 'skills' | 'tips';

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-[500px] bg-[#11141f] border border-white/15 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#161a28]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-mono text-sm font-bold text-white tracking-wide">
                Panduan Kompetisi // Mini CTF HMIF
              </h3>
              <p className="font-mono text-[11px] text-slate-400">
                Generatics 2026 • Divisi TDI HMIF
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playBeep(600, 0.03);
              onClose();
            }}
            aria-label="Tutup panduan"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#0d1018] p-1 gap-1">
          <button
            onClick={() => {
              sound.playBeep(900, 0.03);
              setActiveTab('rules');
            }}
            className={`flex-1 py-1.5 px-3 rounded-md font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'rules'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Aturan Main</span>
          </button>

          <button
            onClick={() => {
              sound.playBeep(900, 0.03);
              setActiveTab('skills');
            }}
            className={`flex-1 py-1.5 px-3 rounded-md font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'skills'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Kotak Bantuan</span>
          </button>

          <button
            onClick={() => {
              sound.playBeep(900, 0.03);
              setActiveTab('tips');
            }}
            className={`flex-1 py-1.5 px-3 rounded-md font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'tips'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>Tips Teknis</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 overflow-y-auto space-y-3 font-mono text-xs text-slate-300">
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>1. Sistem One-Shot (1 Kesempatan per Soal)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Setiap level hanya bisa kamu jawab satu kali. Tidak ada percobaan ulang (anti brute-force). Pastikan jawabanmu sudah kamu cek sebelum menekan tombol submit.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-rose-500/[0.05] border border-rose-500/20 space-y-1">
                <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>2. Aturan Permadeath (Salah = Hangus)</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Jika jawabanmu salah, poin soal tersebut hangus (+0 poin), tetapi kamu <strong className="text-white">tetap dipaksa lanjut ke soal berikutnya</strong>. Kamu tidak akan terjebak di satu soal dan bisa langsung mengejar poin di soal selanjutnya.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span>3. 10 Level Bertingkat</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Kompetisi terdiri dari 10 level berurutan mulai dari Base64, ASCII Binary, Caesar Cipher, Hex Dump, ROT13, Linux Permissions, Port Security, Morse Code, MD5, hingga Logika Pemrograman.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-2.5">
              <p className="text-slate-400 text-[11px] leading-relaxed mb-2">
                Selama sesi lomba, MC akan meluncurkan <strong className="text-white">Air Drop Kotak Bantuan</strong>. Peserta tercepat yang mengambil kotak dapat memilih 1 dari 4 tactical skill berikut:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-amber-500/[0.06] border border-amber-500/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold">
                    <Zap className="w-3.5 h-3.5" />
                    <span>2X Multiplier</span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    Menggandakan seluruh poin pada soal berikutnya yang berhasil kamu jawab benar.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-cyan-500/[0.06] border border-cyan-500/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
                    <Snowflake className="w-3.5 h-3.5" />
                    <span>15s Cryo Freeze</span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    Membekukan layar terminal rival pilihanmu selama 15 detik penuh (lockout input).
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-rose-500/[0.06] border border-rose-500/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                    <Flame className="w-3.5 h-3.5" />
                    <span>EMP Drain (-100)</span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    Mengurangi 100 poin langsung dari skor operator rival yang kamu targetkan.
                  </p>
                </div>

                <div className="p-2.5 rounded-lg bg-purple-500/[0.06] border border-purple-500/25 space-y-1">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold">
                    <Magnet className="w-3.5 h-3.5" />
                    <span>Point Siphon (+100)</span>
                  </div>
                  <p className="text-slate-400 text-[10px] leading-tight">
                    Menyedot 100 poin dari rival dan langsung menambahkannya ke total skormu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tips' && (
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span>Shortcut &amp; Format Jawaban</span>
                </div>
                <ul className="text-slate-400 text-[11px] space-y-1 list-disc list-inside">
                  <li>Input jawaban bersifat <strong className="text-white">case-insensitive</strong> (huruf besar/kecil otomatis dinilai sama).</li>
                  <li>Spasi di awal dan akhir teks otomatis dibersihkan (trimmed).</li>
                  <li>Tekan <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white font-mono text-[10px]">Enter</kbd> untuk langsung submit jawaban.</li>
                </ul>
              </div>

              <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10 space-y-1.5">
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Rekomendasi Tools Pemecah Sandi</span>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">
                  Kamu diperbolehkan menggunakan terminal lokal (<code className="text-emerald-400">base64 -d</code>, <code className="text-emerald-400">md5sum</code>), browser developer tools, atau web decoder seperti CyberChef dan dCode.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-[#0d1018] flex justify-end">
          <button
            onClick={() => {
              sound.playBeep(700, 0.03);
              onClose();
            }}
            className="dev-btn-secondary px-4 py-2 font-mono text-xs font-semibold"
          >
            Mengerti &amp; Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
