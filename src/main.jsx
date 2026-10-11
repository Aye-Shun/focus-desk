import React, { useEffect, useReducer, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { initialTimer, timerReducer, formatTime, MODES } from './timer.js';
import './style.css';

const STORAGE_KEY = 'focus-desk.completed.v1';
function readCount() {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isSafeInteger(value) && value >= 0 ? value : 0;
  } catch { return 0; }
}

function App() {
  const [timer, dispatch] = useReducer(timerReducer, undefined, () => initialTimer(readCount()));
  const [storageAvailable, setStorageAvailable] = useState(true);
  const mode = MODES[timer.mode];
  const isRunning = timer.status === 'running';
  const isFinished = timer.status === 'finished';
  const nextMode = timer.mode === 'focus' ? 'short' : 'focus';
  const progress = 1 - timer.remaining / (mode.minutes * 60_000);
  useEffect(() => {
    if (!isRunning) return;
    const tick = () => dispatch({ type: 'tick', now: Date.now() });
    const interval = setInterval(tick, 250);
    document.addEventListener('visibilitychange', tick);
    return () => { clearInterval(interval); document.removeEventListener('visibilitychange', tick); };
  }, [isRunning]);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, String(timer.completed)); setStorageAvailable(true); }
    catch { setStorageAvailable(false); }
  }, [timer.completed]);
  useEffect(() => {
    document.title = isRunning ? `${formatTime(timer.remaining)} · Focus Desk` : 'Focus Desk';
  }, [timer.remaining, isRunning]);

  return <main className="workspace">
    <header className="page-heading"><h1>Focus Desk</h1><p>A focus timer with short and long breaks.</p></header>
    <section className="timer" aria-label="Focus timer">
      <div className="modes" role="group" aria-label="Timer mode">{Object.entries(MODES).map(([key, value]) =>
        <button key={key} className={timer.mode === key ? 'selected' : ''} aria-pressed={timer.mode === key} onClick={() => dispatch({ type: 'mode', mode: key })}>{value.label} ({value.minutes} min)</button>)}</div>
      <div className="timer-display"><p className="time" role="timer" aria-label={`${mode.label} time remaining`}>{formatTime(timer.remaining)}</p><p className="timer-status">{isFinished ? 'Finished' : isRunning ? 'Running' : timer.status === 'paused' ? 'Paused' : 'Ready'}</p></div>
      <progress className="session-progress" max="1" value={progress} aria-label={`${mode.label} progress`} />
      <p className="completion" role="status">{isFinished ? (timer.mode === 'focus' ? 'Focus session complete.' : 'Break complete.') : ''}</p>
      <div className="controls"><button onClick={() => dispatch(isFinished ? { type: 'mode', mode: nextMode } : { type: isRunning ? 'pause' : 'start', now: Date.now() })}>{isFinished ? `Choose ${MODES[nextMode].label.toLowerCase()}` : isRunning ? 'Pause' : timer.status === 'paused' ? 'Resume' : 'Start'}</button><button onClick={() => dispatch({ type: 'reset' })}>Reset</button></div>
    </section>
    <p className="timer-help">Switching modes clears the current timer. Reset keeps your session count.</p>
    <section className="session-summary" aria-label="Completed sessions"><p>Completed focus sessions: <strong>{timer.completed}</strong></p><p className="storage-note">{storageAvailable ? 'Count saved in this browser.' : 'Storage unavailable. The count is kept only for this visit.'}</p></section>
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
