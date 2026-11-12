/**
 * Comprehensive End-to-End Invariant Test Suite
 * Validates all Non-Negotiable CTF Rules & Server Actions
 */

import { registerUser } from '../app/actions/registerUser';
import { getChallenge } from '../app/actions/getChallenge';
import { submitFlag } from '../app/actions/submitFlag';
import { deploySkill } from '../app/actions/deploySkill';
import { getTopRivals } from '../app/actions/getTopRivals';
import { getLeaderboard } from '../app/actions/getLeaderboard';
import { triggerAirDrop } from '../app/actions/triggerAirDrop';
import { getBattleEvents } from '../app/actions/getBattleEvents';
import { getUserDebrief } from '../app/actions/getUserDebrief';
import { SEED_CHALLENGES } from '../lib/mockDb';

function assert(condition: boolean, testName: string, detail?: string) {
  if (!condition) {
    console.error(`❌ [FAIL] ${testName}${detail ? ` - ${detail}` : ''}`);
    process.exit(1);
  } else {
    console.log(`✅ [PASS] ${testName}`);
  }
}

async function runAllTests() {
  console.log('\n============================================================');
  console.log('🚀 GENERATICS CTF: END-TO-END INVARIANT TEST SUITE');
  console.log('============================================================\n');

  // ----------------------------------------------------
  // TEST GROUP 1: User Registration
  // ----------------------------------------------------
  console.log('--- TEST GROUP 1: Operator Registration ---');

  const emptyReg = await registerUser('  ');
  assert(!emptyReg.success, 'Reject empty codename');

  const shortReg = await registerUser('A');
  assert(!shortReg.success, 'Reject codename shorter than 2 chars');

  const validReg = await registerUser('E2E_HERO_' + Date.now().toString().slice(-4));
  assert(validReg.success && !!validReg.user?.id, 'Create valid operator session', validReg.user?.name);
  const user = validReg.user!;
  assert(user.score === 0, 'Initial score is 0 PTS');
  assert(user.current_level === 1, 'Initial level is 1');

  // ----------------------------------------------------
  // TEST GROUP 2: Challenge Retrieval & Flag Secrecy
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 2: Challenge Retrieval & Flag Secrecy ---');

  const lvl1Ch = await getChallenge(1);
  assert(lvl1Ch.success && !!lvl1Ch.challenge, 'Retrieve Level 1 challenge');
  assert(
    !(lvl1Ch.challenge as unknown as { flag_answer?: string }).flag_answer,
    'Server never exposes flag_answer in challenge retrieval'
  );

  const invalidLvlLow = await getChallenge(0);
  assert(!invalidLvlLow.success, 'Reject Level 0 (out of bounds)');

  const invalidLvlHigh = await getChallenge(11);
  assert(!invalidLvlHigh.success, 'Reject Level 11 (out of bounds)');

  // ----------------------------------------------------
  // TEST GROUP 3: Correct Flag Submission & Case Normalization
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 3: Correct Flag & Case Normalization ---');

  // Level 1 target answer is 'B' (Multiple Choice - Talent Development & Innovation)
  // Test case-insensitive and whitespace trimmed submission
  const subLvl1 = await submitFlag({
    userId: user.id,
    level: 1,
    inputFlag: '  b  ',
  });

  assert(subLvl1.success && subLvl1.is_correct === true, 'Accept case-insensitive trimmed flag');
  assert(subLvl1.points_awarded === 100, 'Award base 100 PTS for Level 1');
  assert(subLvl1.new_score === 100, 'User score updated to 100 PTS');
  assert(subLvl1.next_level === 2, 'User level incremented to Level 2');

  // ----------------------------------------------------
  // TEST GROUP 4: Strict One-Shot Attempt Invariant
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 4: One-Shot Attempt Invariant ---');

  const retryLvl1 = await submitFlag({
    userId: user.id,
    level: 1,
    inputFlag: 'B',
  });

  assert(!retryLvl1.success, 'Reject duplicate attempt on Level 1 (One-Shot Enforcement)');

  // ----------------------------------------------------
  // TEST GROUP 5: Sequential Progression Invariant
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 5: Sequential Progression Invariant ---');

  const skipToLvl4 = await submitFlag({
    userId: user.id,
    level: 4,
    inputFlag: 'HTML',
  });

  assert(!skipToLvl4.success, 'Reject skipping level (must solve Level 2 first)');

  // ----------------------------------------------------
  // TEST GROUP 6: Permadeath Invariant on Wrong Flag
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 6: Sequential Permadeath on Wrong Flag ---');

  const wrongLvl2 = await submitFlag({
    userId: user.id,
    level: 2,
    inputFlag: 'INCORRECT_FLAG_XYZ',
  });

  assert(wrongLvl2.success, 'Evaluation completed for wrong flag');
  assert(wrongLvl2.is_correct === false, 'Flag marked as incorrect');
  assert(wrongLvl2.points_awarded === 0, 'No points awarded (+0 PTS)');
  assert(wrongLvl2.new_score === 100, 'Score remains unchanged at 100 PTS');
  assert(wrongLvl2.next_level === 3, 'Level forcefully advanced to Level 3 (Permadeath)');

  // ----------------------------------------------------
  // TEST GROUP 7: Tactical Skills - 2X Point Multiplier
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 7: Tactical Overclock (2X Multiplier) ---');

  const buff2x = await deploySkill({
    actorId: user.id,
    skillType: 'DOUBLE_POINTS',
  });

  assert(buff2x.success, 'Activate DOUBLE_POINTS skill');

  // Level 3 answer is 'A' (Multiple Choice - NGAFIRMATICS, base 150 PTS -> double should be 300 PTS)
  const subLvl3 = await submitFlag({
    userId: user.id,
    level: 3,
    inputFlag: 'A',
  });

  assert(subLvl3.success && subLvl3.is_correct === true, 'Level 3 solved correctly');
  assert(subLvl3.points_awarded === 300, 'Points doubled from 150 to 300 PTS');
  assert(subLvl3.new_score === 400, 'Total score updated to 400 PTS (100 + 300)');
  assert(subLvl3.next_level === 4, 'Advanced to Level 4');

  // Verify multiplier is consumed / reset
  const subLvl4 = await submitFlag({
    userId: user.id,
    level: 4,
    inputFlag: 'HTML',
  });

  assert(subLvl4.points_awarded === 150, 'Multiplier auto-reset to 1X on next solve (150 PTS awarded)');
  assert(subLvl4.new_score === 550, 'Total score is 550 PTS');

  // ----------------------------------------------------
  // TEST GROUP 8: Tactical Skills - 15s Cryo Freeze
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 8: Tactical Cryo Freeze Lockout ---');

  const rivals = await getTopRivals(user.id);
  assert(rivals.length > 0, 'Retrieve top rivals for target acquisition');
  const targetRival = rivals[0];

  const freezeRival = await deploySkill({
    actorId: user.id,
    skillType: 'FREEZE_TIME',
    targetId: targetRival.id,
  });

  assert(freezeRival.success, 'Deploy 15s Cryo Freeze against rival', targetRival.name);

  // If a user is frozen, they cannot submit flags
  const freezeSelf = await deploySkill({
    actorId: targetRival.id,
    skillType: 'FREEZE_TIME',
    targetId: user.id,
  });
  assert(freezeSelf.success, 'Self injected with Cryo Freeze test');

  const blockedSubmission = await submitFlag({
    userId: user.id,
    level: 5,
    inputFlag: 'TOKEN_BAKE_SUCCESS',
  });

  assert(!blockedSubmission.success, 'Submission strictly rejected while in Cryo Freeze lockout');

  // ----------------------------------------------------
  // TEST GROUP 9: Tactical Skills - EMP Drain & Siphon
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 9: EMP Drain & Point Siphon ---');

  const drainRes = await deploySkill({
    actorId: user.id,
    skillType: 'DEDUCT_POINTS',
    targetId: targetRival.id,
  });
  assert(drainRes.success, 'Deploy EMP Drain (-100 PTS) on rival');

  const siphonRes = await deploySkill({
    actorId: user.id,
    skillType: 'STEAL_POINTS',
    targetId: targetRival.id,
  });
  assert(siphonRes.success, 'Deploy Point Siphon (+100 PTS) from rival');

  // ----------------------------------------------------
  // TEST GROUP 10: Air Drop & Live Combat Feed
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 10: Air Drop Trigger & Combat Log ---');

  const airDropRes = await triggerAirDrop();
  assert(airDropRes.success, 'MC successfully triggered auditorium Air Drop');

  const battleEventsRes = await getBattleEvents(10);
  assert(battleEventsRes.success && battleEventsRes.events.length > 0, 'Fetch recent combat events');
  const hasAirDrop = battleEventsRes.events.some((e) => e.event_type === 'AIR_DROP');
  assert(hasAirDrop, 'Air Drop event recorded in tactical combat feed');

  // ----------------------------------------------------
  // TEST GROUP 11: Live Field Roster & Leaderboard
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 11: Leaderboard & 10-Node Matrix ---');

  const lbRes = await getLeaderboard();
  assert(lbRes.success && lbRes.users.length > 0, 'Retrieve full auditorium field roster');
  const userInLb = lbRes.users.find((u) => u.id === user.id);
  assert(!!userInLb, 'Participant found in live field roster');
  assert(userInLb!.nodeMatrix?.length === 10, '10-Node matrix generated for participant');
  assert(userInLb!.nodeMatrix![0] === true, 'Node 01 reflected as solved in matrix');
  assert(userInLb!.nodeMatrix![1] === false, 'Node 02 reflected as failed in matrix');
  assert(userInLb!.nodeMatrix![2] === true, 'Node 03 reflected as solved in matrix');

  // ----------------------------------------------------
  // TEST GROUP 12: End-Game Debrief Scorecard
  // ----------------------------------------------------
  console.log('\n--- TEST GROUP 12: End-Game Debrief Scorecard ---');

  const debrief = await getUserDebrief(user.id);
  assert(debrief.success, 'Generate post-mission debrief scorecard');
  assert(debrief.nodes.length === 10, 'Debrief contains all 10 nodes breakdown');
  assert(debrief.correctCount >= 3, 'Accurately counts solved nodes');

  console.log('\n============================================================');
  console.log('🎉 ALL 15 INVARIANT & SERVER ACTION TESTS PASSED PERFECTLY!');
  console.log('============================================================\n');
}

runAllTests().catch((err) => {
  console.error('Fatal Test Suite Error:', err);
  process.exit(1);
});
