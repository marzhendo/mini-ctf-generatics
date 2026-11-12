'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  X,
  AlertCircle,
  HelpCircle,
  Layers,
  UserCheck,
  UserX,
  Loader2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { QuestionAnalysisItem, ParticipantSubmissionDetail } from '@/lib/types';
import { getQuestionAnalysis } from '@/app/actions/getQuestionAnalysis';
import { sound } from '@/lib/audio';

interface QuestionAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterTab = 'ALL' | 'CORRECT' | 'WRONG' | 'PENDING';

export default function QuestionAnalysisModal({ isOpen, onClose }: QuestionAnalysisModalProps) {
  const [analysisData, setAnalysisData] = useState<QuestionAnalysisItem[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [searchQuestion, setSearchQuestion] = useState<string>('');
  const [searchParticipant, setSearchParticipant] = useState<string>('');

  // Fetch analysis data
  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await getQuestionAnalysis();
      if (res.success && res.data) {
        setAnalysisData(res.data);
        if (!selectedLevel && res.data.length > 0) {
          setSelectedLevel(res.data[0].level);
        }
      }
    } catch (err) {
      console.error('Failed to load question analysis:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedLevel]);

  useEffect(() => {
    if (isOpen) {
      fetchData();
      // ESC key handler
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, fetchData, onClose]);

  // Overall Tournament Metrics
  const globalMetrics = useMemo(() => {
    if (analysisData.length === 0) return { totalQuestions: 0, totalAnswers: 0, avgAccuracy: 0 };
    const totalQuestions = analysisData.length;
    let totalAnswers = 0;
    let totalCorrect = 0;

    analysisData.forEach((q) => {
      totalAnswers += q.totalSubmissions;
      totalCorrect += q.correctCount;
    });

    const avgAccuracy = totalAnswers > 0 ? Math.round((totalCorrect / totalAnswers) * 100) : 0;
    return { totalQuestions, totalAnswers, avgAccuracy };
  }, [analysisData]);

  // Filtered Question list (Left Pane)
  const filteredQuestions = useMemo(() => {
    if (!searchQuestion.trim()) return analysisData;
    const q = searchQuestion.toLowerCase();
    return analysisData.filter(
      (item) =>
        item.level.toString().includes(q) ||
        item.questionText.toLowerCase().includes(q) ||
        (item.category && item.category.toLowerCase().includes(q))
    );
  }, [analysisData, searchQuestion]);

  // Currently Selected Question (Right Pane)
  const currentQuestion = useMemo(() => {
    return analysisData.find((q) => q.level === selectedLevel) || analysisData[0] || null;
  }, [analysisData, selectedLevel]);

  // Filtered Participants in current question
  const displayedParticipants = useMemo(() => {
    if (!currentQuestion) return [];

    let list: Array<
      | (ParticipantSubmissionDetail & { type: 'SUBMITTED' })
      | {
          userId: string;
          userName: string;
          currentLevel: number;
          type: 'PENDING';
          isCorrect: false;
          submittedAnswer?: string;
          createdAt?: string;
        }
    > = [];

    if (filterTab === 'ALL') {
      list = [
        ...currentQuestion.correctParticipants.map((p) => ({ ...p, type: 'SUBMITTED' as const })),
        ...currentQuestion.wrongParticipants.map((p) => ({ ...p, type: 'SUBMITTED' as const })),
        ...currentQuestion.pendingParticipants.map((p) => ({
          ...p,
          type: 'PENDING' as const,
          isCorrect: false as const,
        })),
      ];
    } else if (filterTab === 'CORRECT') {
      list = currentQuestion.correctParticipants.map((p) => ({ ...p, type: 'SUBMITTED' as const }));
    } else if (filterTab === 'WRONG') {
      list = currentQuestion.wrongParticipants.map((p) => ({ ...p, type: 'SUBMITTED' as const }));
    } else if (filterTab === 'PENDING') {
      list = currentQuestion.pendingParticipants.map((p) => ({
        ...p,
        type: 'PENDING' as const,
        isCorrect: false as const,
      }));
    }

    if (searchParticipant.trim()) {
      const sp = searchParticipant.toLowerCase();
      list = list.filter((p) => p.userName.toLowerCase().includes(sp));
    }

    return list;
  }, [currentQuestion, filterTab, searchParticipant]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="w-full max-w-6xl h-[90vh] bg-[#0A0D14] border border-white/10 rounded-2xl flex flex-col overflow-hidden shadow-2xl relative">
        
        {/* ==================================================================== */}
        {/* MODAL HEADER                                                        */}
        {/* ==================================================================== */}
        <header className="px-6 py-4 bg-[#0F131D] border-b border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-md">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  Analisis Soal & Jawaban
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-[10px] font-mono text-cyan-300 font-semibold uppercase">
                  Quizizz Mode
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Live breakdown akurasi per soal dan rincian siapa saja yang menjawab benar atau salah
              </p>
            </div>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-4 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono">
              <div>
                <span className="text-zinc-500 block text-[10px]">TOTAL SOAL</span>
                <span className="font-bold text-white">{globalMetrics.totalQuestions}</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <span className="text-zinc-500 block text-[10px]">SUBMISI MASUK</span>
                <span className="font-bold text-cyan-400">{globalMetrics.totalAnswers}</span>
              </div>
              <div className="w-px h-6 bg-white/10" />
              <div>
                <span className="text-zinc-500 block text-[10px]">RATA-RATA AKURASI</span>
                <span className={`font-bold ${globalMetrics.avgAccuracy >= 60 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {globalMetrics.avgAccuracy}%
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                sound.playBeep(900, 0.05);
                fetchData(true);
              }}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Data Live"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-all"
              title="Tutup (ESC)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* ==================================================================== */}
        {/* MODAL MAIN CONTENT: TWO-PANE SPLIT VIEW                              */}
        {/* ==================================================================== */}
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-zinc-400">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
            <span className="text-xs font-mono">Memuat analisis performa soal...</span>
          </div>
        ) : (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* ---------------------------------------------------------------- */}
            {/* LEFT PANE: QUESTION NAVIGATOR (LEVEL 1..10)                      */}
            {/* ---------------------------------------------------------------- */}
            <aside className="w-full md:w-80 border-r border-white/10 bg-[#07090E] flex flex-col flex-shrink-0">
              {/* Question Search */}
              <div className="p-3 border-b border-white/10">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    type="text"
                    placeholder="Cari level atau soal..."
                    value={searchQuestion}
                    onChange={(e) => setSearchQuestion(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 bg-[#0D1017] border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
              </div>

              {/* Question List */}
              <div className="flex-1 overflow-y-auto divide-y divide-white/5">
                {filteredQuestions.map((q) => {
                  const isSelected = q.level === selectedLevel;
                  const isHighAccuracy = q.accuracyRate >= 70;
                  const isMidAccuracy = q.accuracyRate >= 40 && q.accuracyRate < 70;

                  return (
                    <button
                      key={q.level}
                      type="button"
                      onClick={() => {
                        sound.playBeep(1000, 0.03);
                        setSelectedLevel(q.level);
                        setFilterTab('ALL');
                      }}
                      className={`w-full text-left p-3.5 transition-all flex flex-col gap-2 relative ${
                        isSelected
                          ? 'bg-cyan-500/10 border-l-4 border-l-cyan-400'
                          : 'hover:bg-white/[0.03] border-l-4 border-l-transparent'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                              isSelected
                                ? 'bg-cyan-500 text-zinc-950'
                                : 'bg-white/10 text-cyan-300'
                            }`}
                          >
                            LVL 0{q.level}
                          </span>
                          <span className="text-[10px] text-zinc-400 truncate max-w-[130px]">
                            {q.category || 'Tantangan IT'}
                          </span>
                        </div>

                        {/* Accuracy Badge */}
                        <span
                          className={`font-mono text-[11px] font-bold ${
                            q.totalSubmissions === 0
                              ? 'text-zinc-500'
                              : isHighAccuracy
                              ? 'text-emerald-400'
                              : isMidAccuracy
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {q.totalSubmissions === 0 ? '0%' : `${q.accuracyRate}%`}
                        </span>
                      </div>

                      {/* Truncated Question Text */}
                      <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed">
                        {q.questionText}
                      </p>

                      {/* Mini Accuracy Bar */}
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden flex">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isHighAccuracy
                              ? 'bg-emerald-500'
                              : isMidAccuracy
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${q.accuracyRate}%` }}
                        />
                      </div>

                      {/* Stats footer */}
                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
                        <span className="text-emerald-400/90 font-medium">
                          ✓ {q.correctCount} Benar
                        </span>
                        <span className="text-rose-400/90 font-medium">
                          ✗ {q.wrongCount} Salah
                        </span>
                        <span>{q.totalSubmissions} Total</span>
                      </div>
                    </button>
                  );
                })}

                {filteredQuestions.length === 0 && (
                  <div className="p-6 text-center text-xs text-zinc-500">
                    Tidak ada soal yang cocok dengan pencarian.
                  </div>
                )}
              </div>
            </aside>

            {/* ---------------------------------------------------------------- */}
            {/* RIGHT PANE: DEEP DIVE INTO QUESTION & SUBMISSIONS                */}
            {/* ---------------------------------------------------------------- */}
            {currentQuestion ? (
              <main className="flex-1 flex flex-col overflow-y-auto bg-[#0A0D14] p-4 sm:p-6 space-y-6">
                
                {/* 1. Question Detail Card */}
                <div className="p-5 rounded-xl bg-[#0F131D] border border-white/10 space-y-4 shadow-lg">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold">
                        LEVEL 0{currentQuestion.level}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-zinc-400 text-xs">
                        {currentQuestion.category || 'Pengetahuan Umum IT'}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-mono">
                        {currentQuestion.questionType === 'MULTIPLE_CHOICE' ? 'Pilihan Ganda' : 'Input Flag / Teks'}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-amber-400 font-bold px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                      +{currentQuestion.points} PTS
                    </span>
                  </div>

                  {/* Question Prompt */}
                  <div className="text-sm sm:text-base text-white font-medium leading-relaxed bg-[#080A0F] p-4 rounded-lg border border-white/5">
                    {currentQuestion.questionText}
                  </div>

                  {/* Multiple Choice Options or Flag Key */}
                  {currentQuestion.questionType === 'MULTIPLE_CHOICE' && currentQuestion.options ? (
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                        Daftar Pilihan Jawaban:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {currentQuestion.options.map((opt, idx) => {
                          const optLetter = opt.trim().charAt(0).toUpperCase();
                          const targetLetter = currentQuestion.flagAnswer.trim().charAt(0).toUpperCase();
                          const isCorrectOption = optLetter === targetLetter;

                          return (
                            <div
                              key={idx}
                              className={`p-3 rounded-lg border text-xs font-mono flex items-start gap-2.5 transition-all ${
                                isCorrectOption
                                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                                  : 'bg-white/[0.03] border-white/10 text-zinc-300'
                              }`}
                            >
                              {isCorrectOption ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                              ) : (
                                <span className="w-4 h-4 rounded-full border border-white/20 text-zinc-500 flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                                  {optLetter}
                                </span>
                              )}
                              <div className="flex-1">
                                <span>{opt}</span>
                                {isCorrectOption && (
                                  <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-sans font-bold">
                                    KUNCI JAWABAN
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] font-mono text-emerald-400/80 uppercase block">
                          Kunci Jawaban Resmi:
                        </span>
                        <code className="text-sm font-mono font-bold text-emerald-300 tracking-wide">
                          {currentQuestion.flagAnswer}
                        </code>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Three Metric Counter Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Benar */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-emerald-400/80 block uppercase">
                        Jawaban Benar
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono text-emerald-300">
                          {currentQuestion.correctCount}
                        </span>
                        <span className="text-xs text-emerald-400/70 font-mono">
                          ({currentQuestion.totalSubmissions > 0 ? currentQuestion.accuracyRate : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Salah */}
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                      <UserX className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-rose-400/80 block uppercase">
                        Jawaban Salah
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono text-rose-300">
                          {currentQuestion.wrongCount}
                        </span>
                        <span className="text-xs text-rose-400/70 font-mono">
                          ({currentQuestion.totalSubmissions > 0 ? 100 - currentQuestion.accuracyRate : 0}%)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Belum Menjawab / On-Going */}
                  <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-amber-400/80 block uppercase">
                        Belum Sampai / On-Going
                      </span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold font-mono text-amber-300">
                          {currentQuestion.pendingCount}
                        </span>
                        <span className="text-xs text-amber-400/70 font-mono">
                          Peserta
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Participant Breakdown List with Filter Tabs */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Segmented Filter Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-[#0F131D] border border-white/10 rounded-lg text-xs font-mono">
                      <button
                        type="button"
                        onClick={() => setFilterTab('ALL')}
                        className={`px-3 py-1.5 rounded-md transition-all ${
                          filterTab === 'ALL'
                            ? 'bg-cyan-500 text-zinc-950 font-bold'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Semua ({currentQuestion.correctCount + currentQuestion.wrongCount + currentQuestion.pendingCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterTab('CORRECT')}
                        className={`px-3 py-1.5 rounded-md transition-all ${
                          filterTab === 'CORRECT'
                            ? 'bg-emerald-500 text-zinc-950 font-bold'
                            : 'text-emerald-400 hover:bg-emerald-500/10'
                        }`}
                      >
                        Benar ({currentQuestion.correctCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterTab('WRONG')}
                        className={`px-3 py-1.5 rounded-md transition-all ${
                          filterTab === 'WRONG'
                            ? 'bg-rose-500 text-zinc-950 font-bold'
                            : 'text-rose-400 hover:bg-rose-500/10'
                        }`}
                      >
                        Salah ({currentQuestion.wrongCount})
                      </button>
                      <button
                        type="button"
                        onClick={() => setFilterTab('PENDING')}
                        className={`px-3 py-1.5 rounded-md transition-all ${
                          filterTab === 'PENDING'
                            ? 'bg-amber-500 text-zinc-950 font-bold'
                            : 'text-amber-400 hover:bg-amber-500/10'
                        }`}
                      >
                        Belum ({currentQuestion.pendingCount})
                      </button>
                    </div>

                    {/* Participant Search */}
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Cari nama peserta..."
                        value={searchParticipant}
                        onChange={(e) => setSearchParticipant(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 bg-[#0D1017] border border-white/10 rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Participant Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {displayedParticipants.map((p, idx) => {
                      const isPending = p.type === 'PENDING';
                      const isCorrect = p.isCorrect;

                      return (
                        <div
                          key={p.userId || idx}
                          className={`p-3.5 rounded-xl border flex flex-col justify-between gap-2.5 transition-all ${
                            isPending
                              ? 'bg-white/[0.02] border-white/5 text-zinc-400'
                              : isCorrect
                              ? 'bg-emerald-500/5 border-emerald-500/30 text-zinc-200'
                              : 'bg-rose-500/5 border-rose-500/30 text-zinc-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {isPending ? (
                                <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                              ) : isCorrect ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                              ) : (
                                <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                              )}
                              <span className="font-bold text-xs text-white truncate max-w-[170px]">
                                {p.userName}
                              </span>
                            </div>

                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                                isPending
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                  : isCorrect
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {isPending ? 'Pending' : isCorrect ? 'Benar' : 'Salah'}
                            </span>
                          </div>

                          {/* Submitted Answer info */}
                          <div className="text-[11px] font-mono bg-black/40 p-2 rounded-lg border border-white/5">
                            {isPending ? (
                              <span className="text-zinc-500">
                                Sedang berada di Level 0{(p as { currentLevel?: number }).currentLevel || 1}
                              </span>
                            ) : (
                              <div className="flex items-center justify-between">
                                <span className="text-zinc-400">Jawaban:</span>
                                <code
                                  className={`font-bold ${
                                    isCorrect ? 'text-emerald-300' : 'text-rose-300 line-through'
                                  }`}
                                >
                                  {p.submittedAnswer || '-'}
                                </code>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {displayedParticipants.length === 0 && (
                      <div className="col-span-full py-8 text-center text-xs text-zinc-500 font-mono">
                        Tidak ada data peserta untuk kategori filter ini.
                      </div>
                    )}
                  </div>
                </div>

              </main>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-500 text-xs">
                Pilih soal dari daftar di sebelah kiri untuk melihat analisis.
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
