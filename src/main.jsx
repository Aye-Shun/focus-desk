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
    <header className="header"><a className="brand" href="./"><span className="brand-icon">◈</span> Focus Desk</a><span className="header-note">A little space to get things done.</span></header>
    <section className="intro"><p className="eyebrow">YOUR NEXT 25 MINUTES</p><h1>Find your focus.</h1><p>Pick a task, start a session, and take a proper break.</p></section>
    <div className="grid">
      <section className="timer-card" aria-label="Focus timer">
        <div className="modes" aria-label="Timer mode">{Object.entries(MODES).map(([key, value]) =>
          <button key={key} className={timer.mode === key ? 'selected' : ''} aria-pressed={timer.mode === key} onClick={() => dispatch({ type: 'mode', mode: key })}>{value.label}</button>)}</div>
        <div className="dial">
          <svg viewBox="0 0 260 260" aria-hidden="true"><circle className="track" cx="130" cy="130" r="118"/><circle className="progress" cx="130" cy="130" r="118" strokeDasharray="741.42" strokeDashoffset={741.42 * (1 - progress)}/></svg>
          <div className="dial-text"><p className="timer-status">{isFinished ? 'SESSION COMPLETE' : isRunning ? 'IN PROGRESS' : timer.status === 'paused' ? 'PAUSED' : 'READY WHEN YOU ARE'}</p><p className="time" role="timer" aria-label={`${mode.label} time remaining`}>{formatTime(timer.remaining)}</p><p className="timer-hint">{isFinished ? 'A small win. Keep the rhythm.' : mode.hint}</p></div>
        </div>
        <p className="completion" role="status">{isFinished ? (timer.mode === 'focus' ? 'Focus session saved. Time for a break.' : 'Break complete. Ready for your next task?') : ''}</p>
        <div className="controls"><button className="primary" onClick={() => dispatch(isFinished ? { type: 'mode', mode: nextMode } : { type: isRunning ? 'pause' : 'start', now: Date.now() })}>{isFinished ? `Next: ${MODES[nextMode].label.toLowerCase()}` : isRunning ? 'Pause session' : timer.status === 'paused' ? 'Resume session' : 'Start session'}</button><button className="reset" onClick={() => dispatch({ type: 'reset' })}>Reset</button></div>
      </section>
      <aside className="side">
        <section className="session-card"><span className="small-label">YOUR MOMENTUM</span><p className="session-count">{timer.completed}<span>sessions</span></p><p>Completed focus sessions</p><div className="storage-note"><span className="dot"/> {storageAvailable ? 'Saved on this browser' : 'Storage unavailable — this visit only'}</div></section>
        <section className="routine-card"><span className="small-label">A SIMPLE RHYTHM</span><ol><li><span>01</span><div><strong>Choose one task</strong><p>Keep the next step small.</p></div></li><li><span>02</span><div><strong>Make some progress</strong><p>Give it 25 quiet minutes.</p></div></li><li><span>03</span><div><strong>Take a break</strong><p>Stretch, refill, reset.</p></div></li></ol></section>
      </aside>
    </div>
    <footer>Built with React · No account needed · Your pace, your space</footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App/></React.StrictMode>);
