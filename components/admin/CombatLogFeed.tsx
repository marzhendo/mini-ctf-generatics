'use client';

import React from 'react';
import { Radio } from 'lucide-react';
import { BattleEvent } from '@/lib/types';

interface CombatLogFeedProps {
  events: BattleEvent[];
}

export function CombatLogFeed({ events }: CombatLogFeedProps) {
  const getEventBadge = (event: BattleEvent) => {
    if (event.event_type === 'AIR_DROP') {
      return {
        borderClass: 'border-l-2 border-amber-400',
        tagBg: 'bg-amber-400/15 text-amber-300 border-amber-400/30',
        tagText: 'Air Drop',
      };
    }

    if (event.skill_type === 'FREEZE_TIME') {
      return {
        borderClass: 'border-l-2 border-cyan-400',
        tagBg: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
        tagText: 'Freeze 15s',
      };
    }

    if (event.skill_type === 'DEDUCT_POINTS') {
      return {
        borderClass: 'border-l-2 border-amber-500',
        tagBg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        tagText: 'EMP Drain',
      };
    }

    if (event.skill_type === 'STEAL_POINTS') {
      return {
        borderClass: 'border-l-2 border-purple-400',
        tagBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
        tagText: 'Siphon Poin',
      };
    }

    if (event.skill_type === 'DOUBLE_POINTS') {
      return {
        borderClass: 'border-l-2 border-emerald-400',
        tagBg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
        tagText: 'Overclock 2X',
      };
    }

    return {
      borderClass: 'border-l-2 border-zinc-500',
      tagBg: 'bg-white/5 text-zinc-300 border-white/10',
      tagText: 'Aktivitas',
    };
  };

  const formatTime = (isoString?: string) => {
    if (!isoString) return '--:--';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return '--:--';
    }
  };

  return (
    <section className="col-span-12 lg:col-span-4 dev-card bg-[#0A0D15] p-0 flex flex-col min-h-0 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2.5 bg-[#0F131E] border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-sans text-xs font-semibold text-white">
            Log Aktivitas &amp; Skill Taktis
          </span>
        </div>
        <div className="font-mono text-emerald-400 text-[11px] flex items-center gap-1">
          <span>● Live Feed</span>
        </div>
      </div>

      {/* Combat Feed Events List */}
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 font-mono">
        {events.length === 0 ? (
          <div className="py-12 text-center text-zinc-500 font-sans text-xs">
            Belum ada skill atau aktivitas yang tercatat.
          </div>
        ) : (
          events.map((evt, idx) => {
            const badge = getEventBadge(evt);
            return (
              <div
                key={evt.id || idx}
                className={`p-2.5 bg-[#0D111A] rounded border border-white/5 ${badge.borderClass} flex flex-col gap-1 transition-all`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-1.5 py-0.2 rounded border font-mono text-[9px] font-semibold ${badge.tagBg}`}
                  >
                    {badge.tagText}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formatTime(evt.created_at)}
                  </span>
                </div>
                <p className="text-xs text-zinc-200 font-sans leading-snug mt-0.5">
                  {evt.description || 'Aktivitas pertempuran tercatat.'}
                </p>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
