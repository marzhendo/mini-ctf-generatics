'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  X,
  Zap,
  Snowflake,
  Flame,
  Magnet,
  Crosshair,
  Loader2,
  CheckCircle2,
  Sparkles,
  Timer,
} from 'lucide-react';
import { SkillType, RivalUser } from '@/lib/types';
import { getTopRivals } from '@/app/actions/getTopRivals';
import { deploySkill } from '@/app/actions/deploySkill';
import { sound } from '@/lib/audio';

interface AirDropModalProps {
  isOpen: boolean;
  userId: string;
  onClose: () => void;
  onSkillDeployed: (skillType: SkillType, newScore?: number) => void;
  durationSeconds?: number;
}

export function AirDropModal({
  isOpen,
  userId,
  onClose,
  onSkillDeployed,
  durationSeconds = 15,
}: AirDropModalProps) {
  const [selectedSkill, setSelectedSkill] = useState<SkillType>('DOUBLE_POINTS');
  const [rivals, setRivals] = useState<RivalUser[]>([]);
  const [selectedTargetId, setSelectedTargetId] = useState<string>('');
  const [isLoadingRivals, setIsLoadingRivals] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(durationSeconds);
  const deployRef = useRef(false);

  // Load top rivals when modal opens
  useEffect(() => {
    if (!isOpen || !userId) return;

    sound.playAirDropAlert();
    let isMounted = true;
    deployRef.current = false;
    setSecondsRemaining(durationSeconds);

    async function fetchRivals() {
      setIsLoadingRivals(true);
      setErrorMsg(null);
      const res = await getTopRivals(userId);
      if (isMounted) {
        if (res && res.length > 0) {
          setRivals(res);
          setSelectedTargetId(res[0].id);
        } else {
          setRivals([]);
        }
        setIsLoadingRivals(false);
      }
    }

    fetchRivals();

    return () => {
      isMounted = false;
    };
  }, [isOpen, userId, durationSeconds]);

  // 15-Second decision timer
  useEffect(() => {
    if (!isOpen) return;

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Auto-deploy DOUBLE_POINTS if user didn't choose in time
          handleAutoDeploy();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen]);

  const handleAutoDeploy = async () => {
    if (deployRef.current) return;
    deployRef.current = true;
    setIsDeploying(true);

    try {
      const res = await deploySkill({
        actorId: userId,
        skillType: 'DOUBLE_POINTS',
      });

      if (res.success) {
        sound.playSuccess();
        onSkillDeployed('DOUBLE_POINTS', res.new_score);
        onClose();
      } else {
        onClose();
      }
    } catch {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isOffensive = selectedSkill !== 'DOUBLE_POINTS';
  const selectedTarget = rivals.find((r) => r.id === selectedTargetId);

  const handleDeploy = async () => {
    if (isDeploying || deployRef.current) return;
    if (isOffensive && !selectedTargetId && rivals.length > 0) {
      setErrorMsg('Pilih salah satu peserta rival sebagai target.');
      return;
    }

    deployRef.current = true;
    setIsDeploying(true);
    setErrorMsg(null);
    sound.playBeep(1200, 0.08);

    try {
      const res = await deploySkill({
        actorId: userId,
        skillType: selectedSkill,
        targetId: isOffensive ? selectedTargetId : undefined,
      });

      if (!res.success) {
        setErrorMsg(res.error || 'Gagal mengaktifkan skill taktis.');
        setIsDeploying(false);
        deployRef.current = false;
        sound.playError();
        return;
      }

      sound.playSuccess();
      onSkillDeployed(selectedSkill, res.new_score);
      onClose();
    } catch {
      setErrorMsg('Terjadi kesalahan koneksi saat mengaktifkan skill.');
      setIsDeploying(false);
      deployRef.current = false;
    }
  };

  const percentage = Math.max(0, (secondsRemaining / durationSeconds) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-[420px] dev-card bg-[#0D111A] border-amber-500/30 p-0 overflow-hidden shadow-2xl relative my-auto">
        {/* Header */}
        <header className="px-4 py-3 bg-[#111624] border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <h3 className="font-sans text-sm font-semibold text-white">
              Kotak Bantuan Taktis (Air Drop)
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playBeep(600, 0.03);
              onClose();
            }}
            aria-label="Tutup modal"
            className="w-7 h-7 flex items-center justify-center rounded-md bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* 15s Countdown Progress Ribbon */}
        <div className="bg-[#0A0D15] px-4 py-1.5 border-b border-white/5">
          <div className="flex justify-between items-center text-xs font-mono text-zinc-400 mb-1">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Timer className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilih skill: <strong className="text-amber-400">{secondsRemaining}s</strong></span>
            </span>
            <span className="text-[10px] text-zinc-500">Auto 2X jika habis</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4 max-h-[78vh] overflow-y-auto">
          {/* Crate Visual Header */}
          <section className="rounded-lg bg-[#080B12] border border-amber-500/20 p-3 text-center flex items-center gap-3.5">
            <div className="w-14 h-14 relative flex-shrink-0 flex items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Image
                src="/img/assets/airdrop_crate_3d.png"
                alt="Air Drop Crate"
                width={48}
                height={48}
                className="object-contain"
                priority
              />
            </div>
            <div className="text-left">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded font-mono text-[10px] font-semibold">
                KOTAK TERBUKA
              </div>
              <p className="text-xs text-zinc-300 mt-1 leading-snug">
                Pilih 1 skill taktis sebelum waktu 15 detik habis.
              </p>
            </div>
          </section>

          {/* 2x2 Tactical Power-up Grid */}
          <section className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
              <span>PILIH SKILL (PILIH 1)</span>
              <span className="text-cyan-400">Tersedia</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {/* Card 1: 2X MULTIPLIER */}
              <button
                type="button"
                onClick={() => {
                  sound.playBeep(900, 0.04);
                  setSelectedSkill('DOUBLE_POINTS');
                }}
                className={`text-left p-3 rounded-lg transition-all flex flex-col justify-between active:scale-[0.98] ${
                  selectedSkill === 'DOUBLE_POINTS'
                    ? 'bg-[#151D2C] border-2 border-emerald-500 text-white shadow-md'
                    : 'bg-[#0B0E17] border border-white/10 hover:border-white/20 text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-1.5 py-0.5 rounded font-mono text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20">
                      Mandiri
                    </span>
                    <Zap className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h4 className="font-sans text-xs font-bold text-white">
                    Overclock 2X
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-tight">
                    Gandakan poin soal berikutnya yang kamu jawab benar.
                  </p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Target: Diri Sendiri</span>
                  {selectedSkill === 'DOUBLE_POINTS' && (
                    <span className="text-emerald-400 font-semibold">Aktif</span>
                  )}
                </div>
              </button>

              {/* Card 2: CRYO FREEZE 15s */}
              <button
                type="button"
                onClick={() => {
                  sound.playBeep(950, 0.04);
                  setSelectedSkill('FREEZE_TIME');
                }}
                className={`text-left p-3 rounded-lg transition-all flex flex-col justify-between active:scale-[0.98] ${
                  selectedSkill === 'FREEZE_TIME'
                    ? 'bg-[#151D2C] border-2 border-cyan-400 text-white shadow-md'
                    : 'bg-[#0B0E17] border border-white/10 hover:border-white/20 text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-1.5 py-0.5 rounded font-mono text-[9px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20">
                      Hambatan
                    </span>
                    <Snowflake className="w-4 h-4 text-cyan-400" />
                  </div>
                  <h4 className="font-sans text-xs font-bold text-white">
                    Freeze 15 Detik
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-tight">
                    Bekukan layar input lawan selama 15 detik.
                  </p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Target: Rival</span>
                  {selectedSkill === 'FREEZE_TIME' && (
                    <span className="text-cyan-400 font-semibold">Aktif</span>
                  )}
                </div>
              </button>

              {/* Card 3: EMP DRAIN -100 */}
              <button
                type="button"
                onClick={() => {
                  sound.playBeep(1000, 0.04);
                  setSelectedSkill('DEDUCT_POINTS');
                }}
                className={`text-left p-3 rounded-lg transition-all flex flex-col justify-between active:scale-[0.98] ${
                  selectedSkill === 'DEDUCT_POINTS'
                    ? 'bg-[#151D2C] border-2 border-amber-400 text-white shadow-md'
                    : 'bg-[#0B0E17] border border-white/10 hover:border-white/20 text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-1.5 py-0.5 rounded font-mono text-[9px] text-amber-400 bg-amber-500/10 border border-amber-500/20">
                      Kurangi Poin
                    </span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <h4 className="font-sans text-xs font-bold text-white">
                    EMP Drain -100
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-tight">
                    Kurangi 100 poin langsung dari total skor lawan.
                  </p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Target: Rival</span>
                  {selectedSkill === 'DEDUCT_POINTS' && (
                    <span className="text-amber-400 font-semibold">Aktif</span>
                  )}
                </div>
              </button>

              {/* Card 4: DATA SIPHON +100 */}
              <button
                type="button"
                onClick={() => {
                  sound.playBeep(1050, 0.04);
                  setSelectedSkill('STEAL_POINTS');
                }}
                className={`text-left p-3 rounded-lg transition-all flex flex-col justify-between active:scale-[0.98] ${
                  selectedSkill === 'STEAL_POINTS'
                    ? 'bg-[#151D2C] border-2 border-purple-400 text-white shadow-md'
                    : 'bg-[#0B0E17] border border-white/10 hover:border-white/20 text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-1.5 py-0.5 rounded font-mono text-[9px] text-purple-400 bg-purple-500/10 border border-purple-400/20">
                      Transfer Poin
                    </span>
                    <Magnet className="w-4 h-4 text-purple-400" />
                  </div>
                  <h4 className="font-sans text-xs font-bold text-white">
                    Siphon +100
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-tight">
                    Curi 100 poin dari lawan dan tambahkan ke skormu.
                  </p>
                </div>
                <div className="mt-2.5 pt-1.5 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Target: Rival</span>
                  {selectedSkill === 'STEAL_POINTS' && (
                    <span className="text-purple-400 font-semibold">Aktif</span>
                  )}
                </div>
              </button>
            </div>
          </section>

          {/* Target Selection (If Offensive Skill) */}
          {isOffensive && (
            <section className="rounded-lg bg-[#0A0D15] border border-white/10 p-3 space-y-2.5">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 text-xs">
                <div className="flex items-center gap-1.5 font-semibold text-zinc-200">
                  <Crosshair className="w-4 h-4 text-cyan-400" />
                  <span>Pilih Target Rival (Top 5 Peserta)</span>
                </div>
                <span className="text-[11px] font-mono text-zinc-500">Live Roster</span>
              </div>

              {isLoadingRivals ? (
                <div className="py-4 flex items-center justify-center text-zinc-400 text-xs gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>Memuat daftar peserta terdekat...</span>
                </div>
              ) : rivals.length === 0 ? (
                <div className="py-3 text-center text-zinc-400 text-xs">
                  Belum ada peserta lain yang aktif di arena.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-0.5">
                  {rivals.map((rival) => {
                    const isSelected = rival.id === selectedTargetId;
                    return (
                      <div
                        key={rival.id}
                        onClick={() => {
                          sound.playBeep(850, 0.03);
                          setSelectedTargetId(rival.id);
                        }}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#161D2B] border border-cyan-500/60 text-white'
                            : 'bg-[#0E121B] border border-white/5 text-zinc-300 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              isSelected
                                ? 'border-cyan-400 bg-cyan-400/20'
                                : 'border-zinc-600'
                            }`}
                          >
                            {isSelected && (
                              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                            )}
                          </span>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-zinc-200">
                                {rival.name}
                              </span>
                              <span className="px-1.5 py-0.2 bg-white/5 text-zinc-400 font-mono text-[9px] rounded">
                                #{rival.rank}
                              </span>
                            </div>
                            <span className="text-[10px] font-mono text-zinc-500">
                              Level {rival.current_level} {rival.is_frozen ? '· Terkena Freeze' : ''}
                            </span>
                          </div>
                        </div>

                        <div className="text-right font-mono">
                          <div className="text-xs text-amber-300 font-semibold tabular-nums">
                            {rival.score} Poin
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Self-Buff Info */}
          {!isOffensive && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2.5 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>Target: Diri Sendiri. Poin jawaban benar pada level berikutnya otomatis dikalikan 2.</span>
            </div>
          )}

          {/* Error Notice */}
          {errorMsg && (
            <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-md text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          {/* Action Button */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleDeploy}
              disabled={isDeploying || (isOffensive && !selectedTargetId && rivals.length > 0)}
              className="w-full dev-btn-primary py-3 px-4 rounded-lg font-sans font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                  <span>Mengaktifkan Skill...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Aktifkan Skill Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
