# Focus Desk

A small React timer with 25-minute focus sessions, 5-minute short breaks, and 15-minute long breaks. The completed focus-session count is saved in the browser.

![Focus Desk](docs/preview.png)

## Run it

Use Node.js 22.12 or newer.

```bash
git clone https://github.com/Aye-Shun/focus-desk.git
cd focus-desk
npm ci
npm run dev
```

Open the address Vite prints. Pick a mode and press Start. Pause keeps the remaining time; Reset returns that mode to its full duration without clearing the count. Switching modes clears the current timer. After a session finishes, choose the next mode and start it when ready. Breaks do not add to the focus-session count.

## How the timer works

`src/timer.js` handles the state changes in a reducer. A running timer stores a deadline instead of subtracting one second on each callback, so delayed callbacks do not accumulate countdown drift. `src/main.jsx` sends ticks and connects the controls and browser storage. The remaining time also appears in the tab title while running.

```bash
npm test
npm run build
npm run preview
```

The tests cover delayed ticks, pause/resume timing, counting a completion once, breaks, mode changes, and display rounding. The build creates static files in `dist/`; preview serves that build locally.

## Limits

Refreshing or closing the page resets the active timer. Only the completed count is saved. Use one tab at a time: tabs can overwrite each other's count, and the last write wins. There is no browser or account sync. Clearing site data removes the count; blocked storage keeps it only for the current visit.

There are no sound alerts or notifications. A suspended browser updates the timer when it resumes. Changing the system clock can affect a running timer.

MIT — see [LICENSE](LICENSE).
