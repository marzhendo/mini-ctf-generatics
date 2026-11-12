import { updateEventState } from '../app/actions/updateEventState';
import { getEventState } from '../app/actions/getEventState';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runTimerSyncTest() {
  console.log('\n============================================================');
  console.log('🏁 E2E VERIFICATION: MATCH DURATION & TIMER SYNCHRONIZATION');
  console.log('============================================================\n');

  // Test 1: Start event with 15 minutes
  console.log('👉 [Test 1] Admin sets match duration to 15 minutes and starts event...');
  const startRes = await updateEventState({
    status: 'RUNNING',
    duration_minutes: 15,
  });

  if (!startRes.success || !startRes.state) {
    throw new Error(`Failed to start event: ${startRes.error}`);
  }

  console.log('  State after start:', {
    status: startRes.state.status,
    duration_minutes: startRes.state.duration_minutes,
    seconds_remaining: startRes.state.seconds_remaining,
    started_at: startRes.state.started_at,
  });

  if (startRes.state.duration_minutes !== 15) {
    throw new Error(`Expected duration_minutes 15, got ${startRes.state.duration_minutes}`);
  }
  if (startRes.state.seconds_remaining !== 900) {
    throw new Error(`Expected seconds_remaining 900 (15m * 60s), got ${startRes.state.seconds_remaining}`);
  }
  console.log('  ✅ [PASS] Event started with exactly 15 minutes (900 seconds), NOT 1800!');

  // Test 2: Verify dynamic wall-clock elapsed calculation
  console.log('\n👉 [Test 2] Simulating 2.5 seconds elapsed wall-clock time...');
  await sleep(2500);

  const fetchRes = await getEventState();
  if (!fetchRes.success || !fetchRes.state) {
    throw new Error(`Failed to get event state: ${fetchRes.error}`);
  }

  console.log('  Current dynamic state:', {
    status: fetchRes.state.status,
    duration_minutes: fetchRes.state.duration_minutes,
    seconds_remaining: fetchRes.state.seconds_remaining,
  });

  if (fetchRes.state.seconds_remaining > 898 || fetchRes.state.seconds_remaining < 895) {
    throw new Error(`Expected seconds_remaining between 895 and 898, got ${fetchRes.state.seconds_remaining}`);
  }
  console.log(`  ✅ [PASS] Dynamic server calculation accurate: ${fetchRes.state.seconds_remaining}s remaining!`);

  // Test 3: Test stopping match
  console.log('\n👉 [Test 3] Admin stops the match...');
  const stopRes = await updateEventState({
    status: 'STOPPED',
  });
  if (!stopRes.success || !stopRes.state) {
    throw new Error(`Failed to stop event: ${stopRes.error}`);
  }
  console.log('  State after stop:', {
    status: stopRes.state.status,
    stopped_at: stopRes.state.stopped_at,
  });
  console.log('  ✅ [PASS] Match stopped successfully.');

  // Test 4: Custom duration preset 10 minutes
  console.log('\n👉 [Test 4] Admin starts another event with 10 minutes...');
  const start10Res = await updateEventState({
    status: 'RUNNING',
    duration_minutes: 10,
  });
  if (!start10Res.success || !start10Res.state) {
    throw new Error(`Failed to start 10m event: ${start10Res.error}`);
  }
  if (start10Res.state.duration_minutes !== 10 || start10Res.state.seconds_remaining !== 600) {
    throw new Error(`Expected 10m / 600s, got ${start10Res.state.duration_minutes}m / ${start10Res.state.seconds_remaining}s`);
  }
  console.log('  ✅ [PASS] 10 minutes preset starts with exactly 600 seconds!');

  // Reset back to WAITING / 30m default for safety
  await updateEventState({
    status: 'WAITING',
    duration_minutes: 30,
    seconds_remaining: 1800,
  });

  console.log('\n============================================================');
  console.log('🎉 ALL TIMER SYNCHRONIZATION TESTS PASSED PERFECTLY!');
  console.log('============================================================\n');
}

runTimerSyncTest().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
