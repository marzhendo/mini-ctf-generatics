/**
 * Comprehensive 20+ Participant End-to-End Test Suite
 * Mini CTF Generatics 2026 - TDI HMIF
 *
 * Verifies:
 * 1. Waiting Room (Lobby) & Event State Flow (WAITING -> RUNNING -> PAUSED -> STOPPED)
 * 2. 20 Concurrent Participant Registrations
 * 3. Text Flag & Multiple Choice (A/B/C/D) Questions
 * 4. Streak Multiplier (+25% at streak 4, +50% at streak >= 5) & Permadeath Reset
 * 5. One-Shot Attempt Strict Enforcement across 20 participants
 * 6. Air Drop & Tactical Battle Skills (Freeze, EMP Deduct, Siphon Steal)
 * 7. Admin Question Bank CRUD (Add, Edit, Delete Challenge)
 * 8. Two-Mode Admin Reset (SCORES_ONLY and ALL_USERS)
 */

import { registerUser } from '../app/actions/registerUser';
import { getEventState } from '../app/actions/getEventState';
import { updateEventState } from '../app/actions/updateEventState';
import { resetTournament } from '../app/actions/resetTournament';
import { getChallenge } from '../app/actions/getChallenge';
import { submitFlag } from '../app/actions/submitFlag';
import { deploySkill } from '../app/actions/deploySkill';
import { triggerAirDrop } from '../app/actions/triggerAirDrop';
import { getLeaderboard } from '../app/actions/getLeaderboard';
import { getAdminChallenges, saveChallenge, deleteChallenge } from '../app/actions/manageChallenges';
import { User, ChallengeWithAnswer } from '../lib/types';

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    process.exit(1);
  } else {
    console.log(`✅ [PASS] ${testName}`);
  }
}

async function run20ParticipantsE2ETest() {
  console.log('\n========================================================================');
  console.log('🚀 GENERATICS CTF: 20+ PARTICIPANTS E2E SCALE & ADMIN TEST SUITE');
  console.log('========================================================================\n');

  // ----------------------------------------------------
  // STEP 1: Initial Event State & Clean Slate
  // ----------------------------------------------------
  console.log('--- STEP 1: Initial Event State & Clean Slate ---');
  await resetTournament({ mode: 'ALL_USERS' });

  const initialState = await getEventState();
  assert(initialState.success, 'Fetch initial event state');
  assert(initialState.state?.status === 'WAITING', 'Default tournament state is WAITING');

  // ----------------------------------------------------
  // STEP 2: Concurrently Register 20 Participants
  // ----------------------------------------------------
  console.log('\n--- STEP 2: Concurrently Register 20 Participants into Lobby ---');
  const participantNames = Array.from({ length: 20 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0');
    return `OPERATOR_${num}`;
  });

  const registrationResults = await Promise.all(
    participantNames.map((name) => registerUser(name))
  );

  const participants: User[] = [];
  registrationResults.forEach((res, idx) => {
    assert(res.success && !!res.user, `Participant ${participantNames[idx]} successfully registered`);
    if (res.user) participants.push(res.user);
  });

  assert(participants.length === 20, 'Exactly 20 participants registered in lobby');

  // Verify all participants are in initial state: score 0, level 1, streak 0
  const lbRes = await getLeaderboard();
  console.log('Leaderboard users count:', lbRes.users.length);
  assert(lbRes.success, 'Fetch leaderboard successfully');
  assert(lbRes.users.length === 20, 'Leaderboard lists all 20 standby participants', `Actual length: ${lbRes.users.length}`);
  assert(
    lbRes.users.every((u) => u.score === 0 && u.current_level === 1),
    'All 20 participants start at 0 PTS and Level 1'
  );

  // ----------------------------------------------------
  // STEP 3: Admin Custom Timer & Start Event
  // ----------------------------------------------------
  console.log('\n--- STEP 3: Admin Custom Timer & Start Event ---');
  const startRes = await updateEventState({
    status: 'RUNNING',
    duration_minutes: 20,
    seconds_remaining: 1200,
  });

  assert(startRes.success, 'Admin triggers Start Event with 20m duration');
  const runningState = await getEventState();
  assert(
    runningState.state?.status === 'RUNNING' && runningState.state.duration_minutes === 20,
    'Event state updated to RUNNING (20 mins)'
  );

  // ----------------------------------------------------
  // STEP 4: Level 1 (Text Flag - Base64) Submission
  // 16 Correct, 4 Wrong (Testing Permadeath & Progression)
  // ----------------------------------------------------
  console.log('\n--- STEP 4: Level 1 Submissions (16 Correct, 4 Wrong) ---');
  const lvl1Ch = await getChallenge(1);
  assert(lvl1Ch.success && lvl1Ch.challenge?.question_type === 'FLAG', 'Level 1 is a FLAG question');

  const lvl1Subs = await Promise.all(
    participants.map((user, idx) => {
      // First 16 answer correctly, last 4 answer incorrectly
      const flag = idx < 16 ? 'GENERATICS_NEXUS_START' : 'WRONG_FLAG_SAMPLE';
      return submitFlag({
        userId: user.id,
        level: 1,
        inputFlag: flag,
      });
    })
  );

  // Verify 16 correct
  const correctLvl1 = lvl1Subs.filter((s) => s.success && s.is_correct);
  const wrongLvl1 = lvl1Subs.filter((s) => s.success && !s.is_correct);
  assert(correctLvl1.length === 16, '16 participants answered Level 1 correctly');
  assert(wrongLvl1.length === 4, '4 participants answered Level 1 incorrectly');

  assert(correctLvl1[0].points_awarded === 100, 'Level 1 awarded 100 PTS');
  assert(correctLvl1[0].new_score === 100, 'Participant score is now 100 PTS');
  assert(correctLvl1[0].streak_count === 1, 'Streak is now 1');

  assert(wrongLvl1[0].points_awarded === 0, 'Wrong answer awarded 0 PTS');
  assert(wrongLvl1[0].new_score === 0, 'Participant score remains 0 PTS');
  assert(wrongLvl1[0].next_level === 2, 'Permadeath: participant forced to advance to Level 2');
  assert(wrongLvl1[0].streak_count === 0, 'Streak reset to 0');

  // Verify One-Shot: attempt to re-submit Level 1 should fail
  const duplicateLvl1 = await submitFlag({
    userId: participants[0].id,
    level: 1,
    inputFlag: 'GENERATICS_NEXUS_START',
  });
  assert(!duplicateLvl1.success, 'Enforce One-Shot: Level 1 re-submission rejected');

  // ----------------------------------------------------
  // STEP 5: Level 2 (Text Flag - Binary ASCII)
  // ----------------------------------------------------
  console.log('\n--- STEP 5: Level 2 Submissions ---');
  const lvl2Subs = await Promise.all(
    participants.map((user, idx) => {
      const flag = idx < 16 ? 'HMIF' : 'WRONG';
      return submitFlag({
        userId: user.id,
        level: 2,
        inputFlag: flag,
      });
    })
  );

  const correctLvl2 = lvl2Subs.filter((s) => s.success && s.is_correct);
  assert(correctLvl2.length === 16, '16 participants answered Level 2 correctly');
  assert(correctLvl2[0].new_score === 200, 'Score is now 200 PTS (100 + 100)');
  assert(correctLvl2[0].streak_count === 2, 'Streak is now 2');

  // ----------------------------------------------------
  // STEP 6: Level 3 (Multiple Choice - TDI HMIF)
  // Testing Option 'B' vs Text Choice
  // ----------------------------------------------------
  console.log('\n--- STEP 6: Level 3 Submissions (Multiple Choice) ---');
  const lvl3Ch = await getChallenge(3);
  assert(lvl3Ch.success && lvl3Ch.challenge?.question_type === 'MULTIPLE_CHOICE', 'Level 3 is MULTIPLE_CHOICE');
  assert(Array.isArray(lvl3Ch.challenge?.options) && lvl3Ch.challenge.options.length === 4, 'Level 3 provides 4 options');

  const lvl3Subs = await Promise.all(
    participants.map((user, idx) => {
      // Alternate between selecting 'B' and 'B. Divisi Teknologi, Desain, & Inovasi (TDI)'
      const choice = idx < 16 ? (idx % 2 === 0 ? 'B' : 'B. Divisi Teknologi, Desain, & Inovasi (TDI)') : 'C';
      return submitFlag({
        userId: user.id,
        level: 3,
        inputFlag: choice,
      });
    })
  );

  const correctLvl3 = lvl3Subs.filter((s) => s.success && s.is_correct);
  assert(correctLvl3.length === 16, '16 participants correctly answered Level 3 (Multiple Choice)');
  assert(correctLvl3[0].points_awarded === 150, 'Level 3 awarded 150 PTS');
  assert(correctLvl3[0].new_score === 350, 'Score is now 350 PTS (200 + 150)');
  assert(correctLvl3[0].streak_count === 3, 'Streak is now 3');

  // ----------------------------------------------------
  // STEP 7: Level 4 (Streak 4 Multiplier: +25% Bonus Points)
  // Base points: 150. Bonus: round(150 * 1.25) = 188 PTS!
  // ----------------------------------------------------
  console.log('\n--- STEP 7: Level 4 Submissions (STREAK 4: +25% BONUS) ---');
  const lvl4Subs = await Promise.all(
    participants.map((user, idx) => {
      const flag = idx < 16 ? 'CYBERSPACE' : 'WRONG';
      return submitFlag({
        userId: user.id,
        level: 4,
        inputFlag: flag,
      });
    })
  );

  const correctLvl4 = lvl4Subs.filter((s) => s.success && s.is_correct);
  assert(correctLvl4.length === 16, '16 participants correctly answered Level 4');
  assert(correctLvl4[0].streak_count === 4, 'Current streak reached 4');
  assert(
    correctLvl4[0].points_awarded === 188,
    'Awarded 188 PTS (+25% streak bonus over 150 base PTS)',
    `Expected 188, got ${correctLvl4[0].points_awarded}`
  );
  assert(
    correctLvl4[0].new_score === 538,
    'Score is now 538 PTS (350 + 188)',
    `Expected 538, got ${correctLvl4[0].new_score}`
  );

  // ----------------------------------------------------
  // STEP 8: Level 5 (Streak 5 Multiplier: +50% Bonus Points)
  // Base points: 200. Bonus: round(200 * 1.50) = 300 PTS!
  // ----------------------------------------------------
  console.log('\n--- STEP 8: Level 5 Submissions (STREAK 5: +50% BONUS) ---');
  const lvl5Subs = await Promise.all(
    participants.map((user, idx) => {
      const flag = idx < 16 ? 'TOKEN_BAKE_SUCCESS' : 'WRONG';
      return submitFlag({
        userId: user.id,
        level: 5,
        inputFlag: flag,
      });
    })
  );

  const correctLvl5 = lvl5Subs.filter((s) => s.success && s.is_correct);
  assert(correctLvl5.length === 16, '16 participants correctly answered Level 5');
  assert(correctLvl5[0].streak_count === 5, 'Current streak reached 5');
  assert(
    correctLvl5[0].points_awarded === 300,
    'Awarded 300 PTS (+50% streak bonus over 200 base PTS)',
    `Expected 300, got ${correctLvl5[0].points_awarded}`
  );
  assert(
    correctLvl5[0].new_score === 838,
    'Score is now 838 PTS (538 + 300)',
    `Expected 838, got ${correctLvl5[0].new_score}`
  );

  // ----------------------------------------------------
  // STEP 9: Tactical Battle Skills & Air Drop
  // ----------------------------------------------------
  console.log('\n--- STEP 9: Tactical Skills & Air Drop ---');
  const airDropRes = await triggerAirDrop();
  assert(airDropRes.success, 'Admin triggers manual Air Drop delivery');

  // Participant 0 uses FREEZE_TIME on Participant 1
  const freezeRes = await deploySkill({
    actorId: participants[0].id,
    targetId: participants[1].id,
    skillType: 'FREEZE_TIME',
  });
  assert(freezeRes.success, 'Participant 0 successfully FREEZES Participant 1');

  // Verify Participant 1 cannot submit while frozen
  const frozenAttempt = await submitFlag({
    userId: participants[1].id,
    level: 6,
    inputFlag: 'B',
  });
  assert(!frozenAttempt.success, 'Participant 1 submission blocked by active FREEZE status');

  // Participant 2 deploys DEDUCT_POINTS against Participant 0 (-100 PTS)
  const deductRes = await deploySkill({
    actorId: participants[2].id,
    targetId: participants[0].id,
    skillType: 'DEDUCT_POINTS',
  });
  assert(deductRes.success, 'Participant 2 executes DEDUCT_POINTS on Participant 0');

  // Participant 3 deploys STEAL_POINTS against Participant 0 (siphons 100 PTS)
  const stealRes = await deploySkill({
    actorId: participants[3].id,
    targetId: participants[0].id,
    skillType: 'STEAL_POINTS',
  });
  assert(stealRes.success, 'Participant 3 executes STEAL_POINTS on Participant 0');

  // ----------------------------------------------------
  // STEP 10: Admin Challenge Bank Management (CRUD)
  // ----------------------------------------------------
  console.log('\n--- STEP 10: Admin Challenge Bank CRUD ---');
  const initialChallenges = await getAdminChallenges();
  assert(initialChallenges.success && initialChallenges.challenges.length >= 10, 'Retrieve full question bank');

  const newChallenge: Omit<ChallengeWithAnswer, 'id'> & { id?: number } = {
    level: 11,
    question_type: 'MULTIPLE_CHOICE',
    category: 'TDI HMIF · Event Innovation',
    question_text: 'Apa nama maskot resmi divisi TDI HMIF pada Generatics 2026?',
    options: ['A. Nexa', 'B. Bytey', 'C. Cyberon', 'D. Glitch'],
    flag_answer: 'A',
    points: 350,
    hint: 'Berasal dari kata Nexus of Innovation.',
  };

  const createChRes = await saveChallenge(newChallenge);
  assert(createChRes.success, 'Admin creates new Level 11 challenge');

  const afterAdd = await getAdminChallenges();
  const addedCh = afterAdd.challenges.find((c) => c.level === 11);
  assert(!!addedCh && addedCh.points === 350, 'Level 11 challenge retrieved from question bank');

  // Edit challenge
  const updatedChallenge: Omit<ChallengeWithAnswer, 'id'> & { id?: number } = {
    ...addedCh!,
    points: 400,
    hint: 'Karakter avatar futuristik.',
  };
  const editChRes = await saveChallenge(updatedChallenge);
  assert(editChRes.success, 'Admin updates Level 11 challenge');

  const afterEdit = await getAdminChallenges();
  const editedCh = afterEdit.challenges.find((c) => c.level === 11);
  assert(editedCh?.points === 400, 'Level 11 updated points verified (400 PTS)');

  // Delete challenge
  if (editedCh?.id) {
    const deleteRes = await deleteChallenge(editedCh.id);
    assert(deleteRes.success, 'Admin deletes Level 11 challenge');
  }

  // ----------------------------------------------------
  // STEP 11: Admin Match Operations (Pause, Stop)
  // ----------------------------------------------------
  console.log('\n--- STEP 11: Admin Match Operations (Pause & Stop) ---');
  const pauseRes = await updateEventState({ status: 'PAUSED' });
  assert(pauseRes.success, 'Admin pauses the tournament');

  const stopRes = await updateEventState({ status: 'STOPPED' });
  assert(stopRes.success, 'Admin stops the tournament');

  const stoppedState = await getEventState();
  assert(stoppedState.state?.status === 'STOPPED', 'Event state is verified STOPPED');

  // ----------------------------------------------------
  // STEP 12: Admin Reset: SCORES_ONLY
  // ----------------------------------------------------
  console.log('\n--- STEP 12: Admin Reset: SCORES_ONLY ---');
  const resetScoresRes = await resetTournament({ mode: 'SCORES_ONLY' });
  assert(resetScoresRes.success, 'Admin executes Reset Skor Saja');

  const lbAfterScoreReset = await getLeaderboard();
  assert(lbAfterScoreReset.success && lbAfterScoreReset.users.length === 20, 'All 20 participant accounts are preserved');
  assert(
    lbAfterScoreReset.users.every((u) => u.score === 0 && u.current_level === 1),
    'All participants reset to 0 PTS and Level 1'
  );

  // ----------------------------------------------------
  // STEP 13: Admin Reset: ALL_USERS (Total Wipe)
  // ----------------------------------------------------
  console.log('\n--- STEP 13: Admin Reset: ALL_USERS (Total Wipe) ---');
  const resetAllRes = await resetTournament({ mode: 'ALL_USERS' });
  assert(resetAllRes.success, 'Admin executes Reset Hapus Seluruh Peserta');

  const lbAfterTotalReset = await getLeaderboard();
  assert(lbAfterTotalReset.success && lbAfterTotalReset.users.length === 0, 'Leaderboard is completely wiped (0 participants)');

  const finalState = await getEventState();
  assert(finalState.state?.status === 'WAITING', 'Tournament state reset to WAITING for new lobby');

  console.log('\n========================================================================');
  console.log('🎉 ALL 20+ PARTICIPANT E2E SCALE & ADMIN INVARIANT TESTS PASSED!');
  console.log('========================================================================\n');
}

run20ParticipantsE2ETest().catch((err) => {
  console.error('Fatal error during E2E test:', err);
  process.exit(1);
});
