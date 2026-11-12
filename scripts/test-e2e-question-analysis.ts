import { mockDb } from '../lib/mockDb';
import { getQuestionAnalysis } from '../app/actions/getQuestionAnalysis';
import { submitFlag } from '../app/actions/submitFlag';
import { resetTournament } from '../app/actions/resetTournament';

async function runQuestionAnalysisTest() {
  console.log('\n============================================================');
  console.log('🏁 E2E VERIFICATION: QUIZIZZ-STYLE QUESTION ANALYSIS');
  console.log('============================================================\n');

  // Step 1: Clean slate reset
  console.log('👉 [Step 1] Reset tournament to fresh state...');
  await resetTournament('ALL_USERS');

  // Step 2: Register 5 test participants
  console.log('👉 [Step 2] Registering 5 test operators...');
  const op1 = mockDb.registerUser('ALICE_HACKER');
  const op2 = mockDb.registerUser('BOB_CIPHER');
  const op3 = mockDb.registerUser('CHARLIE_SEC');
  const op4 = mockDb.registerUser('DIANA_NEXUS');
  const op5 = mockDb.registerUser('EVAN_STANDBY'); // will stay at level 1

  console.log('  Registered:', [op1.name, op2.name, op3.name, op4.name, op5.name]);

  // Step 3: Submissions for Level 1 (Multiple Choice: Correct = "B")
  // Alice & Bob submit correct answer ("B")
  // Charlie & Diana submit wrong answer ("A")
  // Evan does not answer Level 1
  console.log('👉 [Step 3] Submitting Level 1 answers (2 Correct, 2 Wrong, 1 Pending)...');
  await submitFlag({ userId: op1.id, level: 1, inputFlag: 'B' });
  await submitFlag({ userId: op2.id, level: 1, inputFlag: 'B' });
  await submitFlag({ userId: op3.id, level: 1, inputFlag: 'A' });
  await submitFlag({ userId: op4.id, level: 1, inputFlag: 'A' });

  // Step 4: Submissions for Level 2 (Flag input: Correct = "RIDHA")
  // Alice answers "RIDHA" (Correct)
  // Bob answers "SALAH_FLAG" (Wrong)
  // Charlie & Diana & Evan pending
  console.log('👉 [Step 4] Submitting Level 2 answers (1 Correct, 1 Wrong, 3 Pending)...');
  await submitFlag({ userId: op1.id, level: 2, inputFlag: 'RIDHA' });
  await submitFlag({ userId: op2.id, level: 2, inputFlag: 'SALAH_FLAG' });

  // Step 5: Execute Question Analysis Server Action
  console.log('\n👉 [Step 5] Calling getQuestionAnalysis() server action...');
  const res = await getQuestionAnalysis();

  if (!res.success || !res.data) {
    throw new Error(`getQuestionAnalysis failed: ${res.error}`);
  }

  console.log(`  Received analysis for ${res.data.length} levels.`);
  if (res.data.length < 10) {
    throw new Error(`Expected at least 10 levels, got ${res.data.length}`);
  }

  // Step 6: Verify Level 1 breakdown
  console.log('\n👉 [Step 6] Validating Level 1 analysis...');
  const lvl1 = res.data.find((q) => q.level === 1);
  if (!lvl1) throw new Error('Level 1 not found in analysis');

  console.log('  Level 1 Stats:', {
    totalSubmissions: lvl1.totalSubmissions,
    correctCount: lvl1.correctCount,
    wrongCount: lvl1.wrongCount,
    pendingCount: lvl1.pendingCount,
    accuracyRate: `${lvl1.accuracyRate}%`,
  });

  if (lvl1.totalSubmissions !== 4) {
    throw new Error(`Expected 4 totalSubmissions, got ${lvl1.totalSubmissions}`);
  }
  if (lvl1.correctCount !== 2) {
    throw new Error(`Expected 2 correctCount, got ${lvl1.correctCount}`);
  }
  if (lvl1.wrongCount !== 2) {
    throw new Error(`Expected 2 wrongCount, got ${lvl1.wrongCount}`);
  }
  if (lvl1.pendingCount !== 1) {
    throw new Error(`Expected 1 pendingCount (Evan), got ${lvl1.pendingCount}`);
  }
  if (lvl1.accuracyRate !== 50) {
    throw new Error(`Expected 50% accuracyRate (2/4), got ${lvl1.accuracyRate}%`);
  }

  // Verify correct participants array
  const correctNames = lvl1.correctParticipants.map((p) => p.userName);
  if (!correctNames.includes('ALICE_HACKER') || !correctNames.includes('BOB_CIPHER')) {
    throw new Error(`Expected Alice & Bob in correctParticipants, got: ${correctNames.join(', ')}`);
  }
  console.log('  ✅ Correct participants verified:', correctNames);

  // Verify wrong participants array and their submitted answers
  const wrongNames = lvl1.wrongParticipants.map((p) => p.userName);
  const wrongAnswers = lvl1.wrongParticipants.map((p) => p.submittedAnswer);
  if (!wrongNames.includes('CHARLIE_SEC') || !wrongNames.includes('DIANA_NEXUS')) {
    throw new Error(`Expected Charlie & Diana in wrongParticipants, got: ${wrongNames.join(', ')}`);
  }
  if (!wrongAnswers.every((ans) => ans === 'A')) {
    throw new Error(`Expected all wrong answers to be 'A', got: ${wrongAnswers.join(', ')}`);
  }
  console.log('  ✅ Wrong participants and captured submitted answers verified:', wrongNames, wrongAnswers);

  // Verify pending participants
  const pendingNames = lvl1.pendingParticipants.map((p) => p.userName);
  if (!pendingNames.includes('EVAN_STANDBY')) {
    throw new Error(`Expected Evan in pendingParticipants, got: ${pendingNames.join(', ')}`);
  }
  console.log('  ✅ Pending participants verified:', pendingNames);

  // Step 7: Verify Level 2 breakdown
  console.log('\n👉 [Step 7] Validating Level 2 analysis...');
  const lvl2 = res.data.find((q) => q.level === 2);
  if (!lvl2) throw new Error('Level 2 not found in analysis');

  console.log('  Level 2 Stats:', {
    totalSubmissions: lvl2.totalSubmissions,
    correctCount: lvl2.correctCount,
    wrongCount: lvl2.wrongCount,
    pendingCount: lvl2.pendingCount,
    accuracyRate: `${lvl2.accuracyRate}%`,
  });

  if (lvl2.totalSubmissions !== 2) {
    throw new Error(`Expected 2 totalSubmissions, got ${lvl2.totalSubmissions}`);
  }
  if (lvl2.correctCount !== 1 || lvl2.wrongCount !== 1) {
    throw new Error(`Expected 1 correct and 1 wrong, got ${lvl2.correctCount} / ${lvl2.wrongCount}`);
  }
  if (lvl2.pendingCount !== 3) {
    throw new Error(`Expected 3 pending participants, got ${lvl2.pendingCount}`);
  }

  const lvl2WrongAnswer = lvl2.wrongParticipants.find((p) => p.userName === 'BOB_CIPHER')?.submittedAnswer;
  if (lvl2WrongAnswer !== 'SALAH_FLAG') {
    throw new Error(`Expected Bob's wrong answer to be 'SALAH_FLAG', got ${lvl2WrongAnswer}`);
  }
  console.log(`  ✅ Captured Bob's exact wrong input flag: "${lvl2WrongAnswer}"`);

  // Step 8: Clean up reset
  await resetTournament('ALL_USERS');

  console.log('\n============================================================');
  console.log('🎉 ALL QUESTION ANALYSIS INVARIANTS & ACCURACY TESTS PASSED!');
  console.log('============================================================\n');
}

runQuestionAnalysisTest().catch((err) => {
  console.error('❌ Question analysis test failed:', err);
  process.exit(1);
});
