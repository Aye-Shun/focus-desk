import test from 'node:test';
import assert from 'node:assert/strict';
import { initialTimer, timerReducer, formatTime } from '../src/timer.js';

test('delayed ticks use the real deadline rather than accumulating drift', () => {
  const state = timerReducer(initialTimer(), { type: 'start', now: 1000 });
  const delayed = timerReducer(state, { type: 'tick', now: 321000 });
  assert.equal(delayed.remaining, 1180000);
  assert.equal(delayed.deadline, 1501000);
});
test('pause and resume preserve sub-second remaining time', () => {
  const started = timerReducer(initialTimer(), { type: 'start', now: 0 });
  const paused = timerReducer(started, { type: 'pause', now: 1250 });
  assert.equal(paused.remaining, 1498750);
  const resumed = timerReducer(paused, { type: 'start', now: 10000 });
  assert.equal(resumed.deadline, 1508750);
});
test('a completed focus session is counted exactly once, even after extra callbacks', () => {
  const started = timerReducer(initialTimer(), { type: 'start', now: 0 });
  const done = timerReducer(started, { type: 'tick', now: 1500050 });
  assert.equal(done.completed, 1);
  assert.equal(done.status, 'finished');
  assert.equal(timerReducer(done, { type: 'tick', now: 1600000 }).completed, 1);
});
test('break completion is not counted as a focus session', () => {
  const started = timerReducer(initialTimer(4, 'short'), { type: 'start', now: 0 });
  assert.equal(timerReducer(started, { type: 'pause', now: 300001 }).completed, 4);
});
test('mode change cancels the active timer and reset preserves session history', () => {
  const started = timerReducer(initialTimer(3), { type: 'start', now: 0 });
  const changed = timerReducer(started, { type: 'mode', mode: 'long' });
  assert.equal(changed.deadline, null);
  assert.equal(changed.remaining, 900000);
  assert.equal(timerReducer(changed, { type: 'reset' }).completed, 3);
});
test('display rounds partial seconds upward and handles completion', () => {
  assert.equal(formatTime(60001), '01:01');
  assert.equal(formatTime(0), '00:00');
});
