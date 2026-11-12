import { User, Challenge, ChallengeWithAnswer, Submission, BattleEvent, LeaderboardUser, RivalUser, SkillType } from './types';

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  if (!url || !key) return false;
  if (url.includes('your-project') || url.includes('placeholder')) return false;
  if (key.includes('your-') || key.includes('placeholder')) return false;

  return true;
}

export const SEED_CHALLENGES: ChallengeWithAnswer[] = [
  {
    id: 1,
    level: 1,
    question_text: 'Selamat datang di Nexus of Innovation! Sebuah pesan terenkripsi Base64 ditemukan di gateway sistem: "R0VORVJBVElDU19ORVhVU19TVEFSVA==". Dekode pesan tersebut untuk membuka gerbang pertama.',
    flag_answer: 'GENERATICS_NEXUS_START',
    points: 100,
  },
  {
    id: 2,
    level: 2,
    question_text: 'Sensor keamanan mendeteksi transmisi biner dari mainframe: 01001000 01001101 01001001 01000110. Konversikan biner 8-bit tersebut ke dalam karakter ASCII.',
    flag_answer: 'HMIF',
    points: 100,
  },
  {
    id: 3,
    level: 3,
    question_text: 'Sebuah sinyal Caesar Cipher terdeteksi dengan pergeseran 3 langkah ke kanan (ROT3): "JHQHUDWLFV". Temukan kata sandi aslinya!',
    flag_answer: 'GENERATICS',
    points: 150,
  },
  {
    id: 4,
    level: 4,
    question_text: 'Penyusup meninggalkan jejak string heksadesimal pada memory dump kernel: "43 59 42 45 52 53 50 41 43 45". Terjemahkan byte hex tersebut ke teks.',
    flag_answer: 'CYBERSPACE',
    points: 150,
  },
  {
    id: 5,
    level: 5,
    question_text: 'Sebuah protokol enkripsi kuno menggunakan ROT13 menghasilkan teks: "GBXVA_ONXR_FHPPRF". Lakukan dekripsi ROT13 untuk mendapatkan flag akses.',
    flag_answer: 'TOKEN_BAKE_SUCCESS',
    points: 200,
  },
  {
    id: 6,
    level: 6,
    question_text: 'Dalam sistem berkas Linux, seorang admin ingin memberikan izin: Pemilik dapat membaca, menulis, dan mengeksekusi (rwx); Grup hanya dapat membaca dan mengeksekusi (r-x); Publik hanya dapat membaca (r--). Berapakah representasi nilai numerik izin tersebut (contoh format: 755)?',
    flag_answer: '754',
    points: 200,
  },
  {
    id: 7,
    level: 7,
    question_text: 'Protokol keamanan web HTTPS berjalan pada port default jaringan TCP bernomor berapa?',
    flag_answer: '443',
    points: 250,
  },
  {
    id: 8,
    level: 8,
    question_text: 'Sebuah transmisi telegraf darurat mengirimkan kode morse: "... --- ..." diikuti "...- .. -.-. - --- .-. -.--". Gabungkan kedua kata dalam bahasa Inggris dengan pemisah garis bawah (underscore).',
    flag_answer: 'SOS_VICTORY',
    points: 250,
  },
  {
    id: 9,
    level: 9,
    question_text: 'Hash MD5 dari sebuah kata sandi penting adalah: "e10adc3949ba59abbe56e057f20f883e". Kata sandi umum apakah yang menghasilkan hash tersebut?',
    flag_answer: '123456',
    points: 300,
  },
  {
    id: 10,
    level: 10,
    question_text: 'Level Terakhir! Sistem Nexus Core AI terkunci dengan teka-teki logika: "Aku adalah bahasa yang menggerakkan web, diciptakan dalam 10 hari oleh Brendan Eich pada tahun 1995. Siapakah aku?". Masukkan nama bahasa tersebut tanpa spasi.',
    flag_answer: 'JAVASCRIPT',
    points: 500,
  },
];

interface MockDatabaseState {
  users: User[];
  submissions: Submission[];
  battleEvents: BattleEvent[];
}

declare global {
  // eslint-disable-next-line no-var
  var __mockCtfDb: MockDatabaseState | undefined;
}

function getInitialState(): MockDatabaseState {
  const users: User[] = [
    {
      id: 'usr-axel99-mock',
      name: 'AXEL_99',
      score: 1750,
      current_level: 9,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'usr-ghostx-mock',
      name: 'GHOST_X',
      score: 1600,
      current_level: 11,
      created_at: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: 'usr-devzero-mock',
      name: 'DEV_ZERO',
      score: 1450,
      current_level: 8,
      created_at: new Date(Date.now() - 3400000).toISOString(),
    },
    {
      id: 'usr-cyberninja-mock',
      name: 'CYBER_NINJA',
      score: 1300,
      current_level: 8,
      created_at: new Date(Date.now() - 3300000).toISOString(),
    },
    {
      id: 'usr-sarah-mock',
      name: 'SARAH',
      score: 1050,
      current_level: 6,
      created_at: new Date(Date.now() - 3200000).toISOString(),
    },
  ];

  const submissions: Submission[] = [];
  users.forEach((u) => {
    const solvedUpto = Math.min(10, u.current_level - 1);
    for (let l = 1; l <= solvedUpto; l++) {
      submissions.push({
        id: `sub-${u.id}-${l}`,
        user_id: u.id,
        challenge_level: l,
        is_correct: true,
        created_at: new Date(Date.now() - (10 - l) * 60000).toISOString(),
      });
    }
  });

  const battleEvents: BattleEvent[] = [
    {
      id: 'evt-1',
      event_type: 'AIR_DROP',
      description: 'AIR DROP DETECTED in Sector 07 Auditorium! Floor pods unlocked.',
      created_at: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 'evt-2',
      event_type: 'SKILL_EXECUTED',
      actor_id: 'usr-axel99-mock',
      target_id: 'usr-devzero-mock',
      skill_type: 'FREEZE_TIME',
      description: 'AXEL_99 injected Cryo Lockout into DEV_ZERO for 15s!',
      created_at: new Date(Date.now() - 240000).toISOString(),
    },
    {
      id: 'evt-3',
      event_type: 'SKILL_EXECUTED',
      actor_id: 'usr-sarah-mock',
      target_id: 'usr-cyberninja-mock',
      skill_type: 'STEAL_POINTS',
      description: 'SARAH siphoned 100 PTS from CYBER_NINJA!',
      created_at: new Date(Date.now() - 180000).toISOString(),
    },
  ];

  return { users, submissions, battleEvents };
}

export function getMockDb(): MockDatabaseState {
  if (!globalThis.__mockCtfDb) {
    globalThis.__mockCtfDb = getInitialState();
  }
  return globalThis.__mockCtfDb;
}

export const mockDb = {
  registerUser(name: string): User {
    const db = getMockDb();
    const existing = db.users.find((u) => u.name.toUpperCase() === name.toUpperCase());
    if (existing) {
      return existing;
    }

    const newUser: User = {
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name,
      score: 0,
      current_level: 1,
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    return newUser;
  },

  getChallenge(level: number): Challenge | null {
    const c = SEED_CHALLENGES.find((ch) => ch.level === level);
    if (!c) return null;
    return {
      id: c.id,
      level: c.level,
      question_text: c.question_text,
      points: c.points,
    };
  },

  submitFlag(userId: string, level: number, inputFlag: string) {
    const db = getMockDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) {
      return { success: false, error: 'Peserta tidak ditemukan.' };
    }

    // Freeze check
    if (user.frozen_until) {
      const frozenTime = new Date(user.frozen_until).getTime();
      if (frozenTime > Date.now()) {
        const remaining = Math.ceil((frozenTime - Date.now()) / 1000);
        return { success: false, error: `Sistem sedang di-freeze oleh lawan! Tunggu ${remaining} detik.` };
      }
    }

    // Level sequence check
    if (user.current_level !== level) {
      return { success: false, error: `Anda sedang berada di Level ${user.current_level}. Tidak bisa submit level ${level}.` };
    }

    // One-shot check
    const existingSub = db.submissions.find(
      (s) => s.user_id === userId && s.challenge_level === level
    );
    if (existingSub) {
      return { success: false, error: 'Anda sudah pernah menjawab level ini (Aturan One-Shot Attempt).' };
    }

    const challenge = SEED_CHALLENGES.find((c) => c.level === level);
    if (!challenge) {
      return { success: false, error: 'Tantangan tidak ditemukan.' };
    }

    const normalizedInput = inputFlag.trim().toUpperCase();
    const normalizedTarget = challenge.flag_answer.trim().toUpperCase();
    const isCorrect = normalizedInput === normalizedTarget;

    let pointsAwarded = 0;
    if (isCorrect) {
      const basePoints = challenge.points;
      const multiplier = user.has_double_points ? 2 : 1;
      pointsAwarded = basePoints * multiplier;
      user.score += pointsAwarded;
    }

    user.current_level = level + 1;
    user.has_double_points = false;

    db.submissions.push({
      id: `sub-${Date.now()}`,
      user_id: userId,
      challenge_level: level,
      is_correct: isCorrect,
      submitted_answer: inputFlag,
      created_at: new Date().toISOString(),
    });

    if (isCorrect) {
      db.battleEvents.unshift({
        id: `evt-${Date.now()}`,
        event_type: 'SKILL_EXECUTED',
        actor_id: user.id,
        description: `${user.name} unlocked Node 0${level} (+${pointsAwarded} PTS)!`,
        created_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      is_correct: isCorrect,
      points_awarded: pointsAwarded,
      new_score: user.score,
      next_level: user.current_level,
    };
  },

  getLeaderboard(): LeaderboardUser[] {
    const db = getMockDb();
    const sorted = [...db.users].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    const now = Date.now();
    return sorted.map((u, idx) => {
      const isFinished = u.current_level > 10;
      const frozenTime = u.frozen_until ? new Date(u.frozen_until).getTime() : 0;
      const isFrozen = frozenTime > now;
      const frozenSecs = isFrozen ? Math.ceil((frozenTime - now) / 1000) : 0;

      let statusText = `HACKING N${u.current_level < 10 ? `0${u.current_level}` : u.current_level}`;
      if (isFinished) statusText = 'FINISHED (10/10)';
      else if (isFrozen) statusText = `FROZEN ${frozenSecs}s`;

      const userSubs = db.submissions.filter((s) => s.user_id === u.id);
      const subMap = new Map(userSubs.map((s) => [s.challenge_level, s.is_correct]));

      const nodeMatrix: boolean[] = [];
      let streak = 0;
      let currStreak = 0;
      for (let l = 1; l <= 10; l++) {
        const ok = subMap.get(l) ?? false;
        nodeMatrix.push(ok);
        if (ok) {
          currStreak++;
          if (currStreak > streak) streak = currStreak;
        } else {
          currStreak = 0;
        }
      }

      return {
        ...u,
        rank: idx + 1,
        statusText,
        isFinished,
        isFrozen,
        nodeMatrix,
        streak: streak > 1 ? streak : undefined,
      };
    });
  },

  getTopRivals(currentUserId: string): RivalUser[] {
    const leaderboard = this.getLeaderboard();
    return leaderboard
      .filter((u) => u.id !== currentUserId)
      .slice(0, 5)
      .map((u) => ({
        id: u.id,
        name: u.name,
        score: u.score,
        current_level: u.current_level,
        rank: u.rank || 1,
        is_frozen: !!u.isFrozen,
      }));
  },

  deploySkill(actorId: string, skillType: SkillType, targetId?: string) {
    const db = getMockDb();
    const actor = db.users.find((u) => u.id === actorId);
    if (!actor) return { success: false, error: 'Actor tidak ditemukan.' };

    const target = targetId ? db.users.find((u) => u.id === targetId) : undefined;

    switch (skillType) {
      case 'DOUBLE_POINTS':
        actor.has_double_points = true;
        db.battleEvents.unshift({
          id: `evt-${Date.now()}`,
          event_type: 'SKILL_EXECUTED',
          actor_id: actor.id,
          skill_type: 'DOUBLE_POINTS',
          description: `${actor.name} activated Overclock 2X Multiplier!`,
          created_at: new Date().toISOString(),
        });
        return { success: true, skill_type: skillType, new_score: actor.score };

      case 'FREEZE_TIME': {
        if (!target) return { success: false, error: 'Target rival tidak valid.' };
        const freezeDurationMs = 15000;
        target.frozen_until = new Date(Date.now() + freezeDurationMs).toISOString();
        db.battleEvents.unshift({
          id: `evt-${Date.now()}`,
          event_type: 'SKILL_EXECUTED',
          actor_id: actor.id,
          target_id: target.id,
          skill_type: 'FREEZE_TIME',
          description: `${actor.name} injected Cryo Freeze into ${target.name} for 15s!`,
          created_at: new Date().toISOString(),
        });
        return { success: true, skill_type: skillType, message: `Berhasil membekukan layar ${target.name} selama 15 detik.` };
      }

      case 'DEDUCT_POINTS': {
        if (!target) return { success: false, error: 'Target rival tidak valid.' };
        target.score = Math.max(0, target.score - 100);
        db.battleEvents.unshift({
          id: `evt-${Date.now()}`,
          event_type: 'SKILL_EXECUTED',
          actor_id: actor.id,
          target_id: target.id,
          skill_type: 'DEDUCT_POINTS',
          description: `${actor.name} drained 100 PTS from ${target.name}!`,
          created_at: new Date().toISOString(),
        });
        return { success: true, skill_type: skillType, message: `Berhasil mengurangi 100 poin milik ${target.name}.` };
      }

      case 'STEAL_POINTS': {
        if (!target) return { success: false, error: 'Target rival tidak valid.' };
        const pointsToSteal = Math.min(100, target.score);
        target.score = Math.max(0, target.score - pointsToSteal);
        actor.score += pointsToSteal;
        db.battleEvents.unshift({
          id: `evt-${Date.now()}`,
          event_type: 'SKILL_EXECUTED',
          actor_id: actor.id,
          target_id: target.id,
          skill_type: 'STEAL_POINTS',
          description: `${actor.name} siphoned ${pointsToSteal} PTS from ${target.name}!`,
          created_at: new Date().toISOString(),
        });
        return { success: true, skill_type: skillType, new_score: actor.score, message: `Berhasil mencuri ${pointsToSteal} poin dari ${target.name}.` };
      }

      default:
        return { success: false, error: 'Tipe skill tidak dikenali.' };
    }
  },

  triggerAirDrop() {
    const db = getMockDb();
    db.battleEvents.unshift({
      id: `evt-${Date.now()}`,
      event_type: 'AIR_DROP',
      description: 'AIR DROP DETECTED in Sector 07 Auditorium! Floor pods unlocked.',
      created_at: new Date().toISOString(),
    });
    return { success: true };
  },

  getBattleEvents(limit = 25): BattleEvent[] {
    const db = getMockDb();
    return db.battleEvents.slice(0, limit);
  },

  getUserDebrief(userId: string) {
    const db = getMockDb();
    const user = db.users.find((u) => u.id === userId);
    if (!user) return null;

    const userSubs = db.submissions.filter((s) => s.user_id === userId);
    const subMap = new Map(userSubs.map((s) => [s.challenge_level, s.is_correct]));

    let correctCount = 0;
    const nodes = SEED_CHALLENGES.map((ch) => {
      const ok = subMap.get(ch.level) ?? false;
      if (ok) correctCount++;
      return {
        level: ch.level,
        title: `Node 0${ch.level} - ${ch.flag_answer}`,
        is_correct: ok,
        points: ok ? ch.points : 0,
      };
    });

    const leaderboard = this.getLeaderboard();
    const rank = leaderboard.findIndex((u) => u.id === userId) + 1;

    return {
      score: user.score,
      rank: rank > 0 ? rank : 1,
      totalUsers: leaderboard.length,
      correctCount,
      nodes,
    };
  },
};
