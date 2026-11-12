'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  Play,
  Square,
  Pause,
  RotateCcw,
  Trash2,
  Package,
  Plus,
  Pencil,
  ExternalLink,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  Clock,
  Layers,
  HelpCircle,
  X,
  ListChecks,
  Key,
  BarChart3,
} from 'lucide-react';
import { EventState, ChallengeWithAnswer } from '@/lib/types';
import { getEventState } from '@/app/actions/getEventState';
import { updateEventState } from '@/app/actions/updateEventState';
import { resetTournament } from '@/app/actions/resetTournament';
import { triggerAirDrop } from '@/app/actions/triggerAirDrop';
import { getAdminChallenges, saveChallenge, deleteChallenge } from '@/app/actions/manageChallenges';
import QuestionAnalysisModal from '@/components/admin/QuestionAnalysisModal';
import { sound } from '@/lib/audio';

export default function AdminManagePage() {
  const [activeTab, setActiveTab] = useState<'OPERATIONS' | 'QUESTIONS'>('OPERATIONS');
  const [eventState, setEventState] = useState<EventState>({
    status: 'WAITING',
    duration_minutes: 30,
    seconds_remaining: 1800,
  });
  const [challenges, setChallenges] = useState<ChallengeWithAnswer[]>([]);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Confirmation Modal States
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    mode: 'ALL_USERS' | 'SCORES_ONLY';
    title: string;
    description: string;
  }>({
    isOpen: false,
    mode: 'SCORES_ONLY',
    title: '',
    description: '',
  });

  // Question Editor Modal State
  const [questionModal, setQuestionModal] = useState<{
    isOpen: boolean;
    isEditing: boolean;
    id?: number;
    level: number;
    category: string;
    question_type: 'FLAG' | 'MULTIPLE_CHOICE';
    question_text: string;
    options: string[];
    flag_answer: string;
    points: number;
    hint: string;
  }>({
    isOpen: false,
    isEditing: false,
    level: 1,
    category: 'Pengetahuan Umum',
    question_type: 'FLAG',
    question_text: '',
    options: ['', '', '', ''],
    flag_answer: '',
    points: 100,
    hint: '',
  });

  // Initial Data Fetch
  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [stateRes, chRes] = await Promise.all([
      getEventState(),
      getAdminChallenges(),
    ]);

    if (stateRes.success && stateRes.state) {
      setEventState(stateRes.state);
      setCustomMinutes(stateRes.state.duration_minutes || 30);
    }
    if (chRes.success && chRes.challenges) {
      setChallenges(chRes.challenges);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const showNotification = (msg: string) => {
    setStatusNotice(msg);
    setTimeout(() => setStatusNotice(null), 4000);
  };

  // 1. Handle Start Event
  const handleStartEvent = async () => {
    setIsActionLoading(true);
    sound.playSuccess();
    const res = await updateEventState({
      status: 'RUNNING',
      duration_minutes: customMinutes,
      seconds_remaining: customMinutes * 60,
    });
    if (res.success && res.state) {
      setEventState(res.state);
      showNotification(`Event berhasil dimulai dengan durasi ${customMinutes} menit! Peserta otomatis dialihkan ke arena.`);
    } else {
      showNotification(res.error || 'Gagal memulai event.');
    }
    setIsActionLoading(false);
  };

  // 2. Handle Stop Event
  const handleStopEvent = async () => {
    if (!window.confirm('Hentikan pertandingan sekarang? Seluruh input jawaban peserta di arena akan dikunci.')) return;
    setIsActionLoading(true);
    sound.playError();
    const res = await updateEventState({
      status: 'STOPPED',
    });
    if (res.success && res.state) {
      setEventState(res.state);
      showNotification('Pertandingan telah dihentikan oleh admin.');
    } else {
      showNotification(res.error || 'Gagal menghentikan event.');
    }
    setIsActionLoading(false);
  };

  // 3. Handle Pause / Resume Timer
  const handleTogglePause = async () => {
    setIsActionLoading(true);
    sound.playBeep(900, 0.04);
    const newStatus = eventState.status === 'PAUSED' ? 'RUNNING' : 'PAUSED';
    const res = await updateEventState({ status: newStatus });
    if (res.success && res.state) {
      setEventState(res.state);
      showNotification(newStatus === 'PAUSED' ? 'Timer pertandingan dijeda.' : 'Timer pertandingan dilanjutkan.');
    }
    setIsActionLoading(false);
  };

  // 4. Trigger Air Drop
  const handleTriggerAirDrop = async () => {
    setIsActionLoading(true);
    sound.playAirDropAlert();
    const res = await triggerAirDrop();
    if (res.success) {
      showNotification('Kotak Bantuan Air Drop berhasil diluncurkan ke seluruh peserta!');
    } else {
      showNotification(res.error || 'Gagal memicu Air Drop.');
    }
    setIsActionLoading(false);
  };

  // 5. Execute Reset (Confirmed)
  const handleExecuteReset = async () => {
    setIsActionLoading(true);
    sound.playBeep(1200, 0.08);
    const res = await resetTournament(confirmModal.mode);
    if (res.success) {
      showNotification(res.message || 'Reset turnamen berhasil dilakukan.');
      setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      loadData();
    } else {
      showNotification(res.error || 'Gagal mereset turnamen.');
    }
    setIsActionLoading(false);
  };

  // 6. Handle Save Question
  const handleSaveQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionModal.question_text.trim() || !questionModal.flag_answer.trim()) {
      alert('Teks soal dan kunci jawaban wajib diisi.');
      return;
    }

    setIsActionLoading(true);
    sound.playBeep(1000, 0.05);

    const formattedOptions =
      questionModal.question_type === 'MULTIPLE_CHOICE'
        ? questionModal.options.map((opt, i) => {
            const letter = String.fromCharCode(65 + i);
            return opt.startsWith(`${letter}.`) ? opt : `${letter}. ${opt.trim()}`;
          })
        : [];

    const res = await saveChallenge({
      id: questionModal.isEditing ? questionModal.id : undefined,
      level: Number(questionModal.level),
      category: questionModal.category.trim() || 'Pengetahuan Umum',
      question_type: questionModal.question_type,
      question_text: questionModal.question_text.trim(),
      options: formattedOptions,
      flag_answer: questionModal.flag_answer.trim(),
      points: Number(questionModal.points) || 100,
      hint: questionModal.hint.trim() || undefined,
    });

    if (res.success) {
      showNotification('Soal berhasil disimpan!');
      setQuestionModal((prev) => ({ ...prev, isOpen: false }));
      loadData();
    } else {
      alert(res.error || 'Gagal menyimpan soal.');
    }
    setIsActionLoading(false);
  };

  // 7. Handle Delete Question
  const handleDeleteQuestion = async (id: number, level: number) => {
    if (!window.confirm(`Yakin ingin menghapus soal Level ${level}?`)) return;
    setIsActionLoading(true);
    const res = await deleteChallenge(id);
    if (res.success) {
      showNotification(`Soal Level ${level} berhasil dihapus.`);
      loadData();
    } else {
      showNotification(res.error || 'Gagal menghapus soal.');
    }
    setIsActionLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#080A0F] text-zinc-100 font-sans pb-16">
      {/* Top Navbar */}
      <header className="border-b border-white/10 bg-[#0D111A] sticky top-0 z-40 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Image
              src="/img/assets/hmif-logo.png"
              alt="HMIF Logo"
              width={22}
              height={22}
              className="object-contain"
            />
            <Image
              src="/img/assets/tdi-logo.png"
              alt="TDI Logo"
              width={22}
              height={22}
              className="object-contain"
            />
          </div>
          <div className="h-4 w-px bg-white/10 hidden sm:block" />
          <div>
            <h1 className="text-sm sm:text-base font-bold text-white leading-tight">
              Panel Manajemen &amp; Kontrol Admin
            </h1>
            <p className="text-[11px] font-mono text-zinc-400">
              Mini CTF Generatics 2026 // TDI HMIF
            </p>
          </div>
        </div>

        {/* Action Link to Stage Projector & Question Analysis */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              sound.playBeep(950, 0.04);
              setIsAnalysisModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5 text-cyan-400" />
            <span>Analisis Soal (Quizizz Mode)</span>
          </button>
          <a
            href="/admin/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="dev-btn-secondary px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all text-cyan-300 border-cyan-500/30 hover:border-cyan-400"
          >
            <span>Buka Layar Proyektor Panggung</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Notification Toast */}
      {statusNotice && (
        <div className="max-w-[1200px] mx-auto px-5 pt-3">
          <div className="p-3 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
            <span>{statusNotice}</span>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1200px] mx-auto px-5 py-6 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-3">
          <button
            onClick={() => setActiveTab('OPERATIONS')}
            className={`pb-2.5 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'OPERATIONS'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Operasi Pertandingan (Match Control)</span>
          </button>
          <button
            onClick={() => setActiveTab('QUESTIONS')}
            className={`pb-2.5 px-3 text-sm font-semibold transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'QUESTIONS'
                ? 'border-cyan-400 text-white'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Bank &amp; Manajemen Soal ({challenges.length} Soal)</span>
          </button>
          <button
            onClick={() => {
              sound.playBeep(950, 0.04);
              setIsAnalysisModalOpen(true);
            }}
            className="pb-2.5 px-3 text-sm font-semibold transition-all border-b-2 border-transparent text-cyan-400 hover:text-cyan-300 flex items-center gap-2 ml-auto"
          >
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">📊 Analisis Akurasi Soal</span>
          </button>
        </div>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-zinc-400 text-sm">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span>Memuat konfigurasi panel admin...</span>
          </div>
        ) : activeTab === 'OPERATIONS' ? (
          /* ======================================================== */
          /* TAB 1: OPERASI PERTANDINGAN (MATCH CONTROLS)            */
          /* ======================================================== */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Main Event Controls */}
            <div className="lg:col-span-8 space-y-6">
              {/* Event Status Card */}
              <div className="dev-card bg-[#0D111A] p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-zinc-400">STATUS EVENT SAAT INI:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded font-mono text-xs font-bold ${
                        eventState.status === 'RUNNING'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : eventState.status === 'PAUSED'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : eventState.status === 'STOPPED'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : 'bg-white/10 text-zinc-300 border border-white/20'
                      }`}
                    >
                      {eventState.status === 'RUNNING'
                        ? 'PERTANDINGAN BERJALAN (LIVE)'
                        : eventState.status === 'PAUSED'
                        ? 'DIJEDA (PAUSED)'
                        : eventState.status === 'STOPPED'
                        ? 'DIHENTIKAN (STOPPED)'
                        : 'RUANG TUNGGU (WAITING)'}
                    </span>
                  </div>
                  <span className="text-xs font-mono text-zinc-500">
                    Durasi: {customMinutes} Menit
                  </span>
                </div>

                {/* Custom Duration Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Atur Durasi Pertandingan:</span>
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {[5, 10, 15, 20, 30, 45].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCustomMinutes(m)}
                        className={`px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all ${
                          customMinutes === m
                            ? 'bg-cyan-500 text-zinc-950 shadow-md'
                            : 'bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10'
                        }`}
                      >
                        {m} Menit
                      </button>
                    ))}
                    <div className="flex items-center gap-1 ml-auto">
                      <input
                        type="number"
                        min={1}
                        max={180}
                        value={customMinutes}
                        onChange={(e) => setCustomMinutes(Number(e.target.value) || 30)}
                        className="w-16 bg-[#080A0F] border border-white/10 text-white font-mono text-xs px-2 py-1.5 rounded-md text-center focus:border-cyan-400 focus:outline-none"
                      />
                      <span className="text-xs text-zinc-400 font-mono">Menit</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons: Start / Pause / Stop */}
                <div className="pt-2 flex flex-wrap gap-3">
                  {eventState.status === 'WAITING' || eventState.status === 'STOPPED' ? (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={handleStartEvent}
                      className="flex-1 py-3 px-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] disabled:opacity-50"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Mulai Event Sekarang (Start Match)</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={handleTogglePause}
                      className="py-3 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-transform active:scale-[0.99] disabled:opacity-50"
                    >
                      {eventState.status === 'PAUSED' ? (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Lanjutkan Timer</span>
                        </>
                      ) : (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>Jeda Timer (Pause)</span>
                        </>
                      )}
                    </button>
                  )}

                  {eventState.status === 'RUNNING' && (
                    <button
                      type="button"
                      disabled={isActionLoading}
                      onClick={handleStopEvent}
                      className="py-3 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.99] disabled:opacity-50"
                    >
                      <Square className="w-4 h-4 fill-current" />
                      <span>Hentikan Event (Stop Match)</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Air Drop Tactical Trigger Card */}
              <div className="dev-card bg-[#0D111A] p-5 space-y-3 border-amber-500/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    <h3 className="font-semibold text-sm text-white">
                      Pemicu Kotak Bantuan (Air Drop)
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    Jendela klaim: 5 detik
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">
                  Luncurkan kotak bantuan taktis ke seluruh peserta. Notifikasi suara dan getaran haptik akan muncul di ponsel seluruh peserta selama 5 detik.
                </p>
                <button
                  type="button"
                  disabled={isActionLoading || eventState.status !== 'RUNNING'}
                  onClick={handleTriggerAirDrop}
                  className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-40"
                >
                  <Package className="w-4 h-4" />
                  <span>Luncurkan Air Drop Sekarang (Auditorium &amp; HP Peserta)</span>
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Danger Zone / Reset Operations */}
            <div className="lg:col-span-4 space-y-6">
              <div className="dev-card bg-[#140D10] border-rose-500/30 p-5 space-y-4">
                <div className="flex items-center gap-2 text-rose-400 border-b border-rose-500/20 pb-2.5">
                  <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                  <h3 className="font-bold text-sm">Zona Bahaya (Reset Turnamen)</h3>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                  Gunakan tombol di bawah untuk membersihkan leaderboard sebelum sesi babak baru dimulai. Aksi ini dilindungi konfirmasi dua langkah.
                </p>

                {/* Option 1: Reset Scores Only */}
                <div className="space-y-1.5 p-3 rounded-lg bg-[#0F0A0D] border border-rose-500/20">
                  <span className="text-xs font-bold text-zinc-200">1. Reset Skor Saja</span>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Mengosongkan skor seluruh peserta kembali ke 0 PTS dan mengembalikan mereka ke ruang tunggu tanpa menghapus akun.
                  </p>
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        mode: 'SCORES_ONLY',
                        title: 'Konfirmasi Reset Skor Peserta',
                        description:
                          'Tindakan ini akan mengosongkan skor, level, dan riwayat submit seluruh peserta kembali ke Level 1 dengan 0 Poin. Akun nama peserta tetap tersimpan.',
                      })
                    }
                    className="w-full mt-2 py-2 px-3 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Skor Seluruh Peserta</span>
                  </button>
                </div>

                {/* Option 2: Delete All Users */}
                <div className="space-y-1.5 p-3 rounded-lg bg-[#0F0A0D] border border-rose-500/20">
                  <span className="text-xs font-bold text-rose-300">2. Hapus Seluruh Peserta (Total Wipe)</span>
                  <p className="text-[11px] text-zinc-400 leading-tight">
                    Menghapus seluruh akun peserta, riwayat submisi, dan mengosongkan leaderboard secara total untuk sesi baru.
                  </p>
                  <button
                    type="button"
                    disabled={isActionLoading}
                    onClick={() =>
                      setConfirmModal({
                        isOpen: true,
                        mode: 'ALL_USERS',
                        title: 'Konfirmasi Hapus Seluruh Peserta & Data',
                        description:
                          'PERINGATAN: Seluruh nama peserta, riwayat submit, dan log pertempuran di database akan dihapus permanen. Seluruh peserta yang sedang online akan otomatis di-logout kembali ke halaman registrasi.',
                      })
                    }
                    className="w-full mt-2 py-2 px-3 rounded-md bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-sans text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Seluruh Peserta &amp; Data</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* TAB 2: MANAJEMEN SOAL (QUESTION BANK)                   */
          /* ======================================================== */
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-white">Daftar Tantangan &amp; Soal Kompetisi</h3>
                <p className="text-xs text-zinc-400">
                  Mendukung soal Isian Flag / Jawaban Singkat serta Pilihan Ganda (A, B, C, D).
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setQuestionModal({
                    isOpen: true,
                    isEditing: false,
                    level: challenges.length + 1,
                    category: 'Pengetahuan TDI HMIF',
                    question_type: 'FLAG',
                    question_text: '',
                    options: ['', '', '', ''],
                    flag_answer: '',
                    points: 100,
                    hint: '',
                  })
                }
                className="dev-btn-primary px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Soal Baru</span>
              </button>
            </div>

            {/* Questions Table */}
            <div className="dev-card bg-[#0D111A] p-0 overflow-x-auto shadow-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/10 bg-[#0A0D15] font-mono text-zinc-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Lvl</th>
                    <th className="py-2.5 px-3">Tipe</th>
                    <th className="py-2.5 px-3">Kategori</th>
                    <th className="py-2.5 px-4 min-w-[280px]">Teks Soal</th>
                    <th className="py-2.5 px-3">Kunci Jawaban</th>
                    <th className="py-2.5 px-3 text-right">Poin</th>
                    <th className="py-2.5 px-3 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-sans">
                  {challenges.map((ch) => (
                    <tr key={ch.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-cyan-300">
                        {ch.level < 10 ? `0${ch.level}` : ch.level}
                      </td>
                      <td className="py-3 px-3">
                        {ch.question_type === 'MULTIPLE_CHOICE' ? (
                          <span className="px-2 py-0.5 rounded bg-amber-500/15 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-semibold flex items-center gap-1 w-max">
                            <ListChecks className="w-3 h-3" /> Pilihan Ganda
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px] font-semibold flex items-center gap-1 w-max">
                            <Key className="w-3 h-3" /> Isian Flag
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-zinc-300 font-medium">
                        {ch.category || 'IT & Kripto'}
                      </td>
                      <td className="py-3 px-4 text-zinc-200 leading-relaxed max-w-sm truncate">
                        {ch.question_text}
                      </td>
                      <td className="py-3 px-3 font-mono text-amber-300 font-bold">
                        {ch.flag_answer}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-400 font-bold">
                        +{ch.points}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              setQuestionModal({
                                isOpen: true,
                                isEditing: true,
                                id: ch.id,
                                level: ch.level,
                                category: ch.category || 'Pengetahuan Umum',
                                question_type: ch.question_type || 'FLAG',
                                question_text: ch.question_text,
                                options: ch.options && ch.options.length > 0 ? ch.options : ['', '', '', ''],
                                flag_answer: ch.flag_answer,
                                points: ch.points,
                                hint: ch.hint || '',
                              })
                            }
                            className="p-1.5 rounded hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                            title="Edit Soal"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteQuestion(ch.id, ch.level)}
                            className="p-1.5 rounded hover:bg-rose-500/20 text-zinc-400 hover:text-rose-400 transition-colors"
                            title="Hapus Soal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ======================================================== */}
      {/* 2-STEP CONFIRMATION MODAL FOR RESET OPERATIONS           */}
      {/* ======================================================== */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-[420px] dev-card bg-[#140D10] border-rose-500/40 p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2.5 text-rose-400">
              <ShieldAlert className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-base text-white">{confirmModal.title}</h3>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed font-sans">
              {confirmModal.description}
            </p>

            <div className="pt-2 flex gap-2.5">
              <button
                type="button"
                disabled={isActionLoading}
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="flex-1 py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-zinc-200 text-xs font-semibold transition-colors"
              >
                Batalkan
              </button>
              <button
                type="button"
                disabled={isActionLoading}
                onClick={handleExecuteReset}
                className="flex-1 py-2.5 px-4 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5"
              >
                {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Ya, Eksekusi Reset</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* QUESTION EDITOR MODAL (ADD / EDIT CHALLENGE)             */}
      {/* ======================================================== */}
      {questionModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
          <div className="w-full max-w-[560px] dev-card bg-[#0D111A] border-white/10 p-5 space-y-4 shadow-2xl my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                {questionModal.isEditing ? <Pencil className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
                <span>{questionModal.isEditing ? `Edit Soal Level ${questionModal.level}` : 'Tambah Soal Baru'}</span>
              </h3>
              <button
                onClick={() => setQuestionModal((prev) => ({ ...prev, isOpen: false }))}
                className="text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveQuestionSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Level Number */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Level (Urutan):</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    required
                    value={questionModal.level}
                    onChange={(e) => setQuestionModal({ ...questionModal, level: Number(e.target.value) || 1 })}
                    className="w-full bg-[#080A0F] border border-white/10 rounded-md p-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                {/* Points */}
                <div className="space-y-1">
                  <label className="font-semibold text-zinc-300">Bobot Poin (+PTS):</label>
                  <input
                    type="number"
                    min={10}
                    step={10}
                    required
                    value={questionModal.points}
                    onChange={(e) => setQuestionModal({ ...questionModal, points: Number(e.target.value) || 100 })}
                    className="w-full bg-[#080A0F] border border-white/10 rounded-md p-2 text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Kategori / Topik:</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Pengetahuan TDI HMIF / Kriptografi"
                  value={questionModal.category}
                  onChange={(e) => setQuestionModal({ ...questionModal, category: e.target.value })}
                  className="w-full bg-[#080A0F] border border-white/10 rounded-md p-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Question Type Radio */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Tipe Soal:</label>
                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="qType"
                      checked={questionModal.question_type === 'FLAG'}
                      onChange={() => setQuestionModal({ ...questionModal, question_type: 'FLAG' })}
                      className="accent-cyan-400"
                    />
                    <span className="text-zinc-200">Isian Jawaban / Flag</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="qType"
                      checked={questionModal.question_type === 'MULTIPLE_CHOICE'}
                      onChange={() => setQuestionModal({ ...questionModal, question_type: 'MULTIPLE_CHOICE' })}
                      className="accent-cyan-400"
                    />
                    <span className="text-zinc-200">Pilihan Ganda (A, B, C, D)</span>
                  </label>
                </div>
              </div>

              {/* Question Text */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Pertanyaan Soal:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ketik teks pertanyaan atau instruksi tantangan..."
                  value={questionModal.question_text}
                  onChange={(e) => setQuestionModal({ ...questionModal, question_text: e.target.value })}
                  className="w-full bg-[#080A0F] border border-white/10 rounded-md p-2 text-white focus:border-cyan-400 focus:outline-none leading-relaxed"
                />
              </div>

              {/* If Multiple Choice, render Option Inputs */}
              {questionModal.question_type === 'MULTIPLE_CHOICE' && (
                <div className="space-y-2 p-3 bg-[#080A0F] rounded-lg border border-white/5">
                  <label className="font-semibold text-amber-300 block">4 Pilihan Jawaban:</label>
                  {['A', 'B', 'C', 'D'].map((letter, idx) => (
                    <div key={letter} className="flex items-center gap-2">
                      <span className="w-5 font-mono font-bold text-zinc-400">{letter}.</span>
                      <input
                        type="text"
                        required
                        placeholder={`Teks pilihan ${letter}`}
                        value={questionModal.options[idx]?.replace(/^[A-Z]\.\s*/, '') || ''}
                        onChange={(e) => {
                          const nextOpts = [...questionModal.options];
                          nextOpts[idx] = `${letter}. ${e.target.value}`;
                          setQuestionModal({ ...questionModal, options: nextOpts });
                        }}
                        className="flex-1 bg-[#0D111A] border border-white/10 rounded p-1.5 text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  ))}

                  <div className="pt-2">
                    <label className="font-semibold text-emerald-400 block mb-1">Kunci Jawaban Benar:</label>
                    <select
                      value={questionModal.flag_answer.charAt(0).toUpperCase() || 'A'}
                      onChange={(e) => setQuestionModal({ ...questionModal, flag_answer: e.target.value })}
                      className="w-full bg-[#0D111A] border border-white/10 rounded p-2 text-white font-mono focus:border-emerald-400 focus:outline-none"
                    >
                      <option value="A">Opsi A</option>
                      <option value="B">Opsi B</option>
                      <option value="C">Opsi C</option>
                      <option value="D">Opsi D</option>
                    </select>
                  </div>
                </div>
              )}

              {/* If Flag, render Flag Answer input */}
              {questionModal.question_type === 'FLAG' && (
                <div className="space-y-1">
                  <label className="font-semibold text-emerald-400">Kunci Jawaban / Flag (Case-insensitive):</label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: GENERATICS_NEXUS atau HMIF"
                    value={questionModal.flag_answer}
                    onChange={(e) => setQuestionModal({ ...questionModal, flag_answer: e.target.value })}
                    className="w-full bg-[#080A0F] border border-white/10 rounded-md p-2 text-white font-mono uppercase focus:border-emerald-400 focus:outline-none"
                  />
                </div>
              )}

              {/* Hint */}
              <div className="space-y-1">
                <label className="font-semibold text-zinc-300">Petunjuk Pengerjaan (Hint):</label>
                <input
                  type="text"
                  placeholder="Petunjuk opsional untuk peserta..."
                  value={questionModal.hint}
                  onChange={(e) => setQuestionModal({ ...questionModal, hint: e.target.value })}
                  className="w-full bg-[#080A0F] border border-white/10 rounded-md p-2 text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuestionModal((prev) => ({ ...prev, isOpen: false }))}
                  className="py-2 px-4 rounded-md bg-white/10 hover:bg-white/15 text-zinc-300 text-xs font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isActionLoading}
                  className="dev-btn-primary py-2 px-4 rounded-md text-xs font-bold flex items-center gap-1.5"
                >
                  {isActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-black" /> : null}
                  <span>Simpan Soal</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quizizz-Style Question Performance Analysis Modal */}
      <QuestionAnalysisModal
        isOpen={isAnalysisModalOpen}
        onClose={() => setIsAnalysisModalOpen(false)}
      />
    </div>
  );
}
