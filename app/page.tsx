'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions/registerUser';
import { InfoModal } from '@/components/landing/InfoModal';
import { sound } from '@/lib/audio';
import { Terminal, Shield, ArrowRight, BookOpen, Loader2 } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      sound.playError();
      setErrorMsg('Silakan masukkan nama atau nickname kamu terlebih dahulu.');
      return;
    }

    if (trimmed.length < 2) {
      sound.playError();
      setErrorMsg('Nama minimal terdiri dari 2 karakter.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    sound.playBeep(1000, 0.05);

    try {
      const res = await registerUser(trimmed);
      if (!res.success || !res.user) {
        sound.playError();
        setErrorMsg(res.error || 'Gagal mendaftarkan peserta.');
        setIsLoading(false);
        return;
      }

      sound.playSuccess();
      localStorage.setItem('nexus_user', JSON.stringify(res.user));
      router.push('/lobby');
    } catch {
      sound.playError();
      setErrorMsg('Terjadi kesalahan koneksi server.');
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full max-w-[420px] min-h-screen mx-auto px-4 py-8 flex flex-col justify-between relative z-10 font-mono">
      {/* Background Micro Grid */}
      <div className="fixed inset-0 subtle-grid pointer-events-none z-0 opacity-40" />

      {/* Top Header & Official Logos */}
      <header className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xs font-bold text-white tracking-wider">
              GENERATICS CTF 2026
            </h1>
            <p className="text-[10px] text-slate-400">
              TDI HMIF • Nexus of Innovation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Image
            src="/img/assets/hmif-logo.png"
            alt="HMIF Logo"
            width={24}
            height={24}
            className="object-contain"
          />
          <div className="w-px h-3 bg-white/20" />
          <Image
            src="/img/assets/tdi-logo.png"
            alt="TDI Logo"
            width={24}
            height={24}
            className="object-contain"
          />
        </div>
      </header>

      {/* Center Hero & Form Card */}
      <section className="relative z-10 my-auto py-6 space-y-6">
        {/* Title & Context */}
        <div className="space-y-2 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>High-Stakes Survival CTF</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Uji Ketangkasan Kriptografi &amp; Logika
          </h2>

          <p className="text-xs text-slate-400 max-w-[340px] mx-auto leading-relaxed">
            10 level bertingkat dengan aturan <strong className="text-slate-200">One-Shot Permadeath</strong>. Selesaikan tantangan dan rebut posisi puncak di auditorium!
          </p>
        </div>

        {/* Input Form Card */}
        <div className="dev-card p-5 space-y-4 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1.5">
              <label htmlFor="name-input" className="block text-xs font-semibold text-slate-300">
                Nama Peserta / Nickname:
              </label>
              <div className="relative flex items-center">
                <input
                  id="name-input"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isLoading}
                  placeholder="Contoh: Axel, Spectre, Bagas..."
                  maxLength={30}
                  className="w-full bg-[#0a0d14] text-white placeholder:text-slate-500 font-mono text-xs px-3.5 py-3 rounded-md border border-white/10 focus:border-emerald-400 focus:outline-none focus:ring-1 focus:ring-emerald-400 transition-all disabled:opacity-50"
                  autoComplete="off"
                  autoFocus
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded-md text-rose-400 text-[11px] leading-snug">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full dev-btn-primary py-3 px-4 font-mono text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Mendaftarkan Peserta...</span>
                </>
              ) : (
                <>
                  <span>Mulai Kompetisi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Secondary Action: Rulebook */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                sound.playBeep(900, 0.04);
                setIsModalOpen(true);
              }}
              className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Baca Panduan &amp; Aturan Lomba</span>
            </button>

            <span className="text-[10px] text-slate-500 font-mono">
              [↵ Enter]
            </span>
          </div>
        </div>

        {/* Live Event Specs Pill */}
        <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            10 Level Bertingkat
          </span>
          <span>•</span>
          <span>Sistem Permadeath</span>
          <span>•</span>
          <span>Air Drop Battle</span>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 pt-4 border-t border-white/10 text-center text-[10px] text-slate-500 space-y-1">
        <p>© 2026 Himpunan Mahasiswa Teknik Informatika (HMIF)</p>
        <p className="text-slate-600">Diselenggarakan oleh Divisi Teknologi, Desain, &amp; Inovasi (TDI)</p>
      </footer>

      {/* 3-Tab Guide Modal */}
      <InfoModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
