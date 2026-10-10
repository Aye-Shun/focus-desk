export const MODES = {
  focus: { label: 'Focus', minutes: 25, hint: 'One thing at a time.' },
  short: { label: 'Short break', minutes: 5, hint: 'Step away. Come back fresh.' },
  long: { label: 'Long break', minutes: 15, hint: 'Give yourself a little room.' },
};

export function initialTimer(completed = 0, mode = 'focus') {
  return { mode, remaining: MODES[mode].minutes * 60_000, status: 'idle', deadline: null, completed };
}

// A deadline, rather than a tick counter, keeps time accurate after delayed callbacks.
export function timerReducer(state, action) {
  if (action.type === 'mode') return initialTimer(state.completed, action.mode);
  if (action.type === 'reset') return initialTimer(state.completed, state.mode);
  if (action.type === 'start' && state.status !== 'running' && state.status !== 'finished') {
    return { ...state, status: 'running', deadline: action.now + state.remaining };
  }
  if ((action.type === 'tick' || action.type === 'pause') && state.status === 'running') {
    const remaining = Math.max(0, state.deadline - action.now);
    if (!remaining) return { ...state, remaining: 0, deadline: null, status: 'finished',
      completed: state.completed + (state.mode === 'focus' ? 1 : 0) };
    return { ...state, remaining, status: action.type === 'pause' ? 'paused' : 'running',
      deadline: action.type === 'pause' ? null : state.deadline };
  }
  return state;
}

export function formatTime(milliseconds) {
  const seconds = Math.ceil(milliseconds / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
