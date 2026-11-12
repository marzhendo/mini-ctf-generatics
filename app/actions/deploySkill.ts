'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { DeploySkillResult, SkillType } from '@/lib/types';
import { isSupabaseConfigured, mockDb } from '@/lib/mockDb';

interface DeploySkillParams {
  actorId: string;
  skillType: SkillType;
  targetId?: string;
}

export async function deploySkill({
  actorId,
  skillType,
  targetId,
}: DeploySkillParams): Promise<DeploySkillResult> {
  try {
    if (!actorId) {
      return { success: false, error: 'Identitas operator tidak valid.' };
    }

    if (!isSupabaseConfigured()) {
      return mockDb.deploySkill(actorId, skillType, targetId);
    }

    const supabase = createAdminClient();

    // 1. Ambil data operator pelaksana
    const { data: actor, error: actorError } = await supabase
      .from('users')
      .select('id, name, score')
      .eq('id', actorId)
      .single();

    if (actorError || !actor) {
      return { success: false, error: 'Data operator pelaksana tidak ditemukan.' };
    }

    // 2. Eksekusi berdasarkan jenis payload skill
    if (skillType === 'DOUBLE_POINTS') {
      // Aktifkan booster poin pada node berikutnya
      const { error: boostError } = await supabase
        .from('users')
        .update({ has_double_points: true })
        .eq('id', actorId);

      if (boostError) {
        return { success: false, error: 'Gagal mengaktifkan Overclock 2X.' };
      }

      // Catat ke battle_events
      await supabase.from('battle_events').insert({
        event_type: 'SKILL_EXECUTED',
        actor_id: actorId,
        skill_type: 'DOUBLE_POINTS',
        description: `⚡ ${actor.name} mengaktifkan Overclock 2X Multiplier!`,
        payload: { actor_name: actor.name },
      });

      return {
        success: true,
        message: 'OVERCLOCK 2X AKTIF: Poin dari node berikutnya akan dilipatgandakan!',
        skill_type: 'DOUBLE_POINTS',
      };
    }

    // Skill ofensif (FREEZE_TIME, DEDUCT_POINTS, STEAL_POINTS) butuh target
    if (!targetId) {
      return { success: false, error: 'Target rival harus dipilih untuk payload ofensif ini.' };
    }

    if (targetId === actorId) {
      return { success: false, error: 'Target tidak boleh diri sendiri.' };
    }

    const { data: target, error: targetError } = await supabase
      .from('users')
      .select('id, name, score')
      .eq('id', targetId)
      .single();

    if (targetError || !target) {
      return { success: false, error: 'Target rival tidak ditemukan.' };
    }

    if (skillType === 'FREEZE_TIME') {
      // Bekukan target selama 15 detik dari sekarang
      const freezeUntil = new Date(Date.now() + 15 * 1000).toISOString();

      const { error: freezeError } = await supabase
        .from('users')
        .update({ frozen_until: freezeUntil })
        .eq('id', targetId);

      if (freezeError) {
        return { success: false, error: 'Gagal membekukan target.' };
      }

      await supabase.from('battle_events').insert({
        event_type: 'SKILL_EXECUTED',
        actor_id: actorId,
        target_id: targetId,
        skill_type: 'FREEZE_TIME',
        description: `🧊 ${actor.name} membekukan sistem ${target.name} selama 15 detik!`,
        payload: {
          actor_name: actor.name,
          target_name: target.name,
          duration_sec: 15,
        },
      });

      return {
        success: true,
        message: `CRYO LOCKOUT BERHASIL: Terminal ${target.name} terkunci selama 15 detik!`,
        skill_type: 'FREEZE_TIME',
      };
    }

    if (skillType === 'DEDUCT_POINTS') {
      // Kurangi 100 poin milik target (minimal 0)
      const newTargetScore = Math.max(0, (target.score || 0) - 100);

      const { error: deductError } = await supabase
        .from('users')
        .update({ score: newTargetScore })
        .eq('id', targetId);

      if (deductError) {
        return { success: false, error: 'Gagal memotong poin target.' };
      }

      await supabase.from('battle_events').insert({
        event_type: 'SKILL_EXECUTED',
        actor_id: actorId,
        target_id: targetId,
        skill_type: 'DEDUCT_POINTS',
        description: `💥 ${actor.name} meluncurkan EMP Drain ke ${target.name} (-100 PTS)!`,
        payload: {
          actor_name: actor.name,
          target_name: target.name,
          deducted: 100,
        },
      });

      return {
        success: true,
        message: `EMP DRAIN BERHASIL: 100 poin milik ${target.name} telah dipotong!`,
        skill_type: 'DEDUCT_POINTS',
      };
    }

    if (skillType === 'STEAL_POINTS') {
      // Curi 100 poin dari target ke actor
      const actualStolen = Math.min(100, target.score || 0);
      const newTargetScore = Math.max(0, (target.score || 0) - actualStolen);
      const newActorScore = (actor.score || 0) + actualStolen;

      // Update target
      await supabase
        .from('users')
        .update({ score: newTargetScore })
        .eq('id', targetId);

      // Update actor
      await supabase
        .from('users')
        .update({ score: newActorScore })
        .eq('id', actorId);

      await supabase.from('battle_events').insert({
        event_type: 'SKILL_EXECUTED',
        actor_id: actorId,
        target_id: targetId,
        skill_type: 'STEAL_POINTS',
        description: `🌀 ${actor.name} menyerap ${actualStolen} PTS dari ${target.name}!`,
        payload: {
          actor_name: actor.name,
          target_name: target.name,
          stolen: actualStolen,
        },
      });

      return {
        success: true,
        message: `DATA SIPHON BERHASIL: +${actualStolen} PTS diserap dari ${target.name}!`,
        skill_type: 'STEAL_POINTS',
        new_score: newActorScore,
      };
    }

    return { success: false, error: 'Jenis skill tidak dikenali.' };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kegagalan server saat eksekusi skill.';
    return { success: false, error: msg };
  }
}
