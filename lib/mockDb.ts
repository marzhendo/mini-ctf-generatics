import {
  User,
  Challenge,
  ChallengeWithAnswer,
  Submission,
  BattleEvent,
  LeaderboardUser,
  RivalUser,
  SkillType,
  EventState,
  QuestionAnalysisItem,
  ParticipantSubmissionDetail,
  PendingParticipantDetail,
} from './types';

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
    question_type: 'MULTIPLE_CHOICE',
    category: 'Departemen TDI · HMIF',
    question_text: 'Selamat datang di Mini CTF Generatics! Apakah kepanjangan resmi dari nama departemen "TDI" di HMIF Telkom University Purwokerto sebagaimana dipaparkan pada presentasi?',
    options: [
      'A. Technology Development & Infrastructure',
      'B. Talent Development & Innovation',
      'C. Total Digital Information',
      'D. Team Designer & Informatics',
    ],
    flag_answer: 'B',
    points: 100,
    hint: 'Bisa dilihat pada judul besar di slide cover pertama presentasi.',
  },
  {
    id: 2,
    level: 2,
    question_type: 'FLAG',
    category: 'Struktur Organisasi · Koordinator TDI',
    question_text: 'Pada slide struktur kepengurusan departemen TDI, siapakah nama panggilan dari sosok yang menjabat sebagai Koordinator (Core of Department)?',
    flag_answer: 'RIDHA',
    points: 100,
    hint: 'Nama koordinator departemen TDI (R-i-d-h-a).',
  },
  {
    id: 3,
    level: 3,
    question_type: 'MULTIPLE_CHOICE',
    category: 'Program Kerja TDI · Ramadan',
    question_text: 'Program kerja TDI yang berisi kegiatan ngabuburit seru bersama mahasiswa Informatika dan diakhiri dengan buka puasa bersama di bulan Ramadan bernama...?',
    options: [
      'A. NGAFIRMATICS',
      'B. INFORMATRAVEL',
      'C. BERKAH_IF',
      'D. KAJIAN_HMIF',
    ],
    flag_answer: 'A',
    points: 150,
    hint: 'Singkatan dari kata Ngabuburit dan Informatics.',
  },
  {
    id: 4,
    level: 4,
    question_type: 'FLAG',
    category: 'Dasar Web · Markup Language',
    question_text: 'Bahasa markup standar yang menjadi kerangka pondasi utama seluruh halaman website di internet disingkat dengan 4 huruf apa?',
    flag_answer: 'HTML',
    points: 150,
    hint: 'HyperText Markup Language.',
  },
  {
    id: 5,
    level: 5,
    question_type: 'MULTIPLE_CHOICE',
    category: 'Program Kerja TDI · INFENTRA',
    question_text: 'Proker tahunan bergengsi TDI yang menjadi wadah perayaan hari ulang tahun Prodi Informatika melalui kompetisi karya, seminar, dan awarding adalah...?',
    options: [
      'A. TECHNOFEST',
      'B. INFENTRA',
      'C. IF_OLYMPIAD',
      'D. CODESPACE_EXPO',
    ],
    flag_answer: 'B',
    points: 200,
    hint: 'Singkatan dari Informatics Event & Karya.',
  },
  {
    id: 6,
    level: 6,
    question_type: 'MULTIPLE_CHOICE',
    category: 'Jaringan Komputer · Web Security',
    question_text: 'Ketika kamu membuka website aman berprotokol HTTPS (ada lambang gembok aman di browser), nomor port jaringan berapakah yang digunakan secara standar?',
    options: [
      'A. Port 80',
      'B. Port 22',
      'C. Port 443',
      'D. Port 8080',
    ],
    flag_answer: 'C',
    points: 200,
    hint: 'Port 80 untuk HTTP biasa, sedangkan HTTPS menambahkan angka 4 di depannya (443).',
  },
  {
    id: 7,
    level: 7,
    question_type: 'FLAG',
    category: 'Program Kerja TDI · Riset Mahasiswa',
    question_text: 'Program kerja TDI yang bertujuan mengidentifikasi minat dan bakat mahasiswa Teknik Informatika melalui kuesioner/survei (misal: Web Dev, AI, Desain) bernama apa? (1 kata, 6 huruf)',
    flag_answer: 'KENALI',
    points: 250,
    hint: 'Nama programnya mengajak kita untuk saling mengenal.',
  },
  {
    id: 8,
    level: 8,
    question_type: 'MULTIPLE_CHOICE',
    category: 'Developer Tools · Shortcut Browser',
    question_text: 'Tombol shortcut keyboard manakah di browser yang paling umum ditekan seorang programmer untuk membuka menu "Inspect Element / Developer Tools"?',
    options: [
      'A. F5',
      'B. F12',
      'C. Alt + F4',
      'D. Ctrl + Z',
    ],
    flag_answer: 'B',
    points: 250,
    hint: 'Tombol function paling kanan di baris atas keyboard (F12).',
  },
  {
    id: 9,
    level: 9,
    question_type: 'MULTIPLE_CHOICE',
    category: 'Program Kerja TDI · Podcast Informatics',
    question_text: 'Dalam salah satu episode program kerja "Podcast Informatics" oleh departemen TDI, topik IT apakah yang dibahas bersama narasumber?',
    options: [
      'A. Merakit PC Gaming Hemat Budget',
      'B. Cyber Security & Secure Coding',
      'C. Trik Menguasai Rumus Excel',
      'D. Strategi Menjadi Selebgram Kampus',
    ],
    flag_answer: 'B',
    points: 300,
    hint: 'Topik keamanan siber yang sangat relevan dengan tema Mini CTF ini.',
  },
  {
    id: 10,
    level: 10,
    question_type: 'MULTIPLE_CHOICE',
    category: 'Trivia Pemrograman · Web Core',
    question_text: 'Bahasa pemrograman yang menggerakkan interaktivitas web modern ini diciptakan hanya dalam waktu 10 hari pada tahun 1995 oleh Brendan Eich. Siapakah bahasa tersebut?',
    options: [
      'A. Python',
      'B. JavaScript',
      'C. PHP',
      'D. C++',
    ],
    flag_answer: 'B',
    points: 500,
    hint: 'Bahasa pemrograman paling populer di web, sering disingkat JS.',
  },
];

interface MockDatabaseState {
  users: User[];
  submissions: Submission[];
  battleEvents: BattleEvent[];
  challenges: ChallengeWithAnswer[];
  eventState: EventState;
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
      current_streak: 3,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'usr-ghostx-mock',
      name: 'GHOST_X',
      score: 1600,
      current_level: 11,
      current_streak: 5,
      created_at: new Date(Date.now() - 3500000).toISOString(),
    },
    {
      id: 'usr-devzero-mock',
      name: 'DEV_ZERO',
      score: 1450,
      current_level: 8,
      current_streak: 1,
      created_at: new Date(Date.now() - 3400000).toISOString(),
    },
    {
      id: 'usr-cyberninja-mock',
      name: 'CYBER_NINJA',
      score: 1300,
      current_level: 8,
      current_streak: 0,
      created_at: new Date(Date.now() - 3300000).toISOString(),
    },
    {
      id: 'usr-sarah-mock',
      name: 'SARAH',
      score: 1050,
      current_level: 6,
      current_streak: 2,
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
      description: 'Kotak Bantuan Air Drop mendarat di panggung auditorium!',
      created_at: new Date(Date.now() - 300000).toISOString(),
    },
    {
      id: 'evt-2',
      event_type: 'SKILL_EXECUTED',
      actor_id: 'usr-axel99-mock',
      target_id: 'usr-devzero-mock',
      skill_type: 'FREEZE_TIME',
      description: 'AXEL_99 membekukan layar DEV_ZERO selama 15 detik!',
      created_at: new Date(Date.now() - 240000).toISOString(),
    },
    {
      id: 'evt-3',
      event_type: 'SKILL_EXECUTED',
      actor_id: 'usr-sarah-mock',
      target_id: 'usr-cyberninja-mock',
      skill_type: 'STEAL_POINTS',
      description: 'SARAH mencuri 100 poin dari CYBER_NINJA!',
      created_at: new Date(Date.now() - 180000).toISOString(),
    },
  ];

  const challenges = JSON.parse(JSON.stringify(SEED_CHALLENGES)) as ChallengeWithAnswer[];

  const eventState: EventState = {
    status: 'WAITING',
    duration_minutes: 30,
    seconds_remaining: 1800,
    started_at: null,
    stopped_at: null,
    active_air_drop: null,
    updated_at: new Date().toISOString(),
  };

  return { users, submissions, battleEvents, challenges, eventState };
}

export function getMockDb(): MockDatabaseState {
  if (!globalThis.__mockCtfDb) {
    globalThis.__mockCtfDb = getInitialState();
  }
  return globalThis.__mockCtfDb;
}

export const mockDb = {
  getEventState(): EventState {
    const db = getMockDb();
    let calculatedSeconds = db.eventState.seconds_remaining;
    if (db.eventState.status === 'RUNNING' && db.eventState.started_at) {
      const elapsed = Math.max(0, Math.floor((Date.now() - new Date(db.eventState.started_at).getTime()) / 1000));
      calculatedSeconds = Math.max(0, (db.eventState.duration_minutes || 30) * 60 - elapsed);
    } else if (db.eventState.status === 'WAITING') {
      calculatedSeconds = (db.eventState.duration_minutes || 30) * 60;
    }
    return {
      ...db.eventState,
      seconds_remaining: calculatedSeconds,
    };
  },

  updateEventState(partial: Partial<EventState>): EventState {
    const db = getMockDb();
    if (partial.status === 'RUNNING') {
      partial.started_at = partial.started_at || new Date().toISOString();
      const dur = partial.duration_minutes || db.eventState.duration_minutes || 30;
      partial.duration_minutes = dur;
      partial.seconds_remaining = dur * 60;
    }
    db.eventState = {
      ...db.eventState,
      ...partial,
      updated_at: new Date().toISOString(),
    };
    return db.eventState;
  },

  resetTournament(mode: 'ALL_USERS' | 'SCORES_ONLY') {
    const db = getMockDb();
    if (mode === 'ALL_USERS') {
      db.users = [];
      db.submissions = [];
      db.battleEvents = [];
      db.eventState = {
        ...db.eventState,
        status: 'WAITING',
        seconds_remaining: db.eventState.duration_minutes * 60,
        started_at: null,
        stopped_at: null,
        active_air_drop: null,
      };
    } else {
      // SCORES_ONLY: retain users, reset score, level, streak, submissions
      db.users.forEach((u) => {
        u.score = 0;
        u.current_level = 1;
        u.current_streak = 0;
        u.frozen_until = null;
        u.has_double_points = false;
      });
      db.submissions = [];
      db.battleEvents = [];
      db.eventState = {
        ...db.eventState,
        status: 'WAITING',
        seconds_remaining: db.eventState.duration_minutes * 60,
        started_at: null,
        stopped_at: null,
        active_air_drop: null,
      };
    }
    return { success: true, mode };
  },

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
      current_streak: 0,
      created_at: new Date().toISOString(),
    };
    db.users.push(newUser);
    return newUser;
  },

  getAllChallenges(): ChallengeWithAnswer[] {
    const db = getMockDb();
    return db.challenges.sort((a, b) => a.level - b.level);
  },

  getChallenge(level: number): Challenge | null {
    const db = getMockDb();
    const c = db.challenges.find((ch) => ch.level === level);
    if (!c) return null;
    return {
      id: c.id,
      level: c.level,
      question_text: c.question_text,
      question_type: c.question_type || 'FLAG',
      options: c.options || [],
      category: c.category || 'Pengetahuan Umum IT',
      points: c.points,
      hint: c.hint,
    };
  },

  addChallenge(c: Omit<ChallengeWithAnswer, 'id'>): ChallengeWithAnswer {
    const db = getMockDb();
    const nextId = db.challenges.length > 0 ? Math.max(...db.challenges.map((x) => x.id)) + 1 : 1;
    const newChallenge: ChallengeWithAnswer = {
      ...c,
      id: nextId,
    };
    db.challenges.push(newChallenge);
    return newChallenge;
  },

  updateChallenge(id: number, c: Partial<ChallengeWithAnswer>): ChallengeWithAnswer | null {
    const db = getMockDb();
    const target = db.challenges.find((x) => x.id === id);
    if (!target) return null;
    Object.assign(target, c);
    return target;
  },

  deleteChallenge(id: number): boolean {
    const db = getMockDb();
    const index = db.challenges.findIndex((x) => x.id === id);
    if (index === -1) return false;
    db.challenges.splice(index, 1);
    return true;
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

    const challenge = db.challenges.find((c) => c.level === level);
    if (!challenge) {
      return { success: false, error: 'Tantangan tidak ditemukan.' };
    }

    const normalizedInput = inputFlag.trim().toUpperCase();
    const normalizedTarget = challenge.flag_answer.trim().toUpperCase();

    let isCorrect = false;
    if (challenge.question_type === 'MULTIPLE_CHOICE') {
      // Allow e.g. "B" or "B. Divisi..." or full matching text
      const optionLetter = normalizedInput.charAt(0);
      const targetLetter = normalizedTarget.charAt(0);
      isCorrect = optionLetter === targetLetter || normalizedInput === normalizedTarget;
    } else {
      isCorrect = normalizedInput === normalizedTarget;
    }

    let pointsAwarded = 0;
    let streakCount = 0;
    let streakMultiplier = 1;

    if (isCorrect) {
      const currentStreak = user.current_streak || 0;
      streakCount = currentStreak + 1;
      user.current_streak = streakCount;

      // Streak Bonus Logic:
      // Streak 4: +25%
      // Streak >= 5: +50%
      if (streakCount === 4) {
        streakMultiplier = 1.25;
      } else if (streakCount >= 5) {
        streakMultiplier = 1.5;
      }

      const doubleMultiplier = user.has_double_points ? 2 : 1;
      const basePoints = challenge.points;
      pointsAwarded = Math.round(basePoints * doubleMultiplier * streakMultiplier);
      user.score += pointsAwarded;
    } else {
      // Reset streak on error
      user.current_streak = 0;
      streakCount = 0;
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
        description: `${user.name} menyelesaikan Level 0${level} (+${pointsAwarded} Poin)${
          streakMultiplier > 1 ? ` 🔥 Streak ${streakCount}x!` : ''
        }`,
        created_at: new Date().toISOString(),
      });
    }

    return {
      success: true,
      is_correct: isCorrect,
      points_awarded: pointsAwarded,
      streak_count: streakCount,
      streak_multiplier: streakMultiplier,
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

      let statusText = `LEVEL 0${u.current_level < 10 ? `0${u.current_level}` : u.current_level}`;
      if (isFinished) statusText = 'SELESAI (10/10)';
      else if (isFrozen) statusText = `FREEZE ${frozenSecs}s`;

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
        streak: u.current_streak && u.current_streak > 1 ? u.current_streak : streak > 1 ? streak : undefined,
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
          description: `${actor.name} mengaktifkan bonus Overclock 2X!`,
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
          description: `${actor.name} membekukan layar ${target.name} selama 15 detik!`,
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
          description: `${actor.name} mengurangi 100 poin milik ${target.name}!`,
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
          description: `${actor.name} mencuri ${pointsToSteal} poin dari ${target.name}!`,
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
    const airDropId = `ad-${Date.now()}`;
    db.eventState.active_air_drop = {
      id: airDropId,
      max_claims: 3,
      claimed_by: [],
      remaining_claims: 3,
      created_at: new Date().toISOString(),
    };
    db.battleEvents.unshift({
      id: `evt-${Date.now()}`,
      event_type: 'AIR_DROP',
      description: 'Kotak Bantuan Air Drop mendarat di panggung auditorium! (Hanya 3 tercepat)',
      payload: { airDropId, remaining_claims: 3, max_claims: 3 },
      created_at: new Date().toISOString(),
    });
    return { success: true, airDropId };
  },

  claimAirDrop(userId: string, airDropId?: string) {
    const db = getMockDb();
    const activeDrop = db.eventState.active_air_drop;
    if (!activeDrop) {
      return { success: false, error: 'Tidak ada Air Drop yang sedang aktif.' };
    }
    if (airDropId && activeDrop.id !== airDropId) {
      return { success: false, error: 'Air Drop ini sudah kadaluarsa.' };
    }
    if (activeDrop.claimed_by.includes(userId)) {
      return {
        success: true,
        already_claimed: true,
        remaining_claims: activeDrop.remaining_claims,
        airDropId: activeDrop.id,
      };
    }
    if (activeDrop.claimed_by.length >= activeDrop.max_claims) {
      return {
        success: false,
        error: 'Kuota Air Drop habis! Sudah diambil 3 peserta tercepat.',
        is_exhausted: true,
      };
    }

    activeDrop.claimed_by.push(userId);
    activeDrop.remaining_claims = Math.max(0, activeDrop.max_claims - activeDrop.claimed_by.length);

    const user = db.users.find((u) => u.id === userId);
    const userName = user ? user.name : 'Peserta';

    db.battleEvents.unshift({
      id: `evt-${Date.now()}`,
      event_type: 'SKILL_EXECUTED',
      actor_id: userId,
      description: `${userName} mengklaim Kotak Air Drop! (Sisa kuota: ${activeDrop.remaining_claims}/${activeDrop.max_claims})`,
      payload: { airDropId: activeDrop.id, remaining_claims: activeDrop.remaining_claims },
      created_at: new Date().toISOString(),
    });

    return {
      success: true,
      airDropId: activeDrop.id,
      remaining_claims: activeDrop.remaining_claims,
      is_exhausted: activeDrop.remaining_claims === 0,
    };
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
    const nodes = db.challenges.map((ch) => {
      const ok = subMap.get(ch.level) ?? false;
      if (ok) correctCount++;
      return {
        level: ch.level,
        title: `Node 0${ch.level} - ${ch.question_type === 'MULTIPLE_CHOICE' ? `[Pilihan Ganda] Opsi ${ch.flag_answer}` : ch.flag_answer}`,
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

  getQuestionAnalysis(): QuestionAnalysisItem[] {
    const db = getMockDb();
    const sortedChallenges = [...db.challenges].sort((a, b) => a.level - b.level);
    const users = db.users;
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    return sortedChallenges.map((ch) => {
      const challengeSubs = db.submissions.filter((s) => s.challenge_level === ch.level);
      const correctParticipants: ParticipantSubmissionDetail[] = [];
      const wrongParticipants: ParticipantSubmissionDetail[] = [];
      const answeredUserIds = new Set<string>();

      challengeSubs.forEach((sub) => {
        answeredUserIds.add(sub.user_id);
        const userName = userMap.get(sub.user_id) || 'Peserta';
        const detail: ParticipantSubmissionDetail = {
          userId: sub.user_id,
          userName,
          submittedAnswer: sub.submitted_answer,
          isCorrect: sub.is_correct,
          createdAt: sub.created_at,
        };
        if (sub.is_correct) {
          correctParticipants.push(detail);
        } else {
          wrongParticipants.push(detail);
        }
      });

      const pendingParticipants: PendingParticipantDetail[] = users
        .filter((u) => !answeredUserIds.has(u.id))
        .map((u) => ({
          userId: u.id,
          userName: u.name,
          currentLevel: u.current_level,
        }));

      const totalSubmissions = challengeSubs.length;
      const correctCount = correctParticipants.length;
      const wrongCount = wrongParticipants.length;
      const pendingCount = pendingParticipants.length;
      const accuracyRate = totalSubmissions > 0 ? Math.round((correctCount / totalSubmissions) * 100) : 0;

      return {
        challengeId: ch.id,
        level: ch.level,
        questionText: ch.question_text,
        questionType: ch.question_type || 'FLAG',
        options: ch.options || [],
        flagAnswer: ch.flag_answer,
        category: ch.category || 'Pengetahuan Umum IT',
        points: ch.points,
        totalSubmissions,
        correctCount,
        wrongCount,
        pendingCount,
        accuracyRate,
        correctParticipants,
        wrongParticipants,
        pendingParticipants,
      };
    });
  },
};
