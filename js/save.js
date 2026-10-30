// Saving the run in progress, so a refresh or a closed tab doesn't lose it.
// The whole game state is plain data, so it is stored as JSON in the browser.
// No screen code here. (Unlock progress is saved separately, in unlocks.js.)

const RUN_KEY = "chainedDice.run";
const RUN_VERSION = 1; // bump when the state's shape changes, so old saves are ignored

// Save the run, or clear the save once the run is over (the floor opened, or you walked away).
function saveRun(state) {
  if (!CONFIG.saveProgress) return;
  try {
    if (runIsOver(state)) localStorage.removeItem(RUN_KEY);
    else localStorage.setItem(RUN_KEY, JSON.stringify({ v: RUN_VERSION, state: state }));
  } catch (e) {
    // Storage blocked or full: the run just isn't saved.
  }
}

function runIsOver(state) {
  return state.status.startsWith("fell") || !!state.walkedAway;
}

// The saved run, or null if there isn't one (or it's from an older version of the game).
function loadRun() {
  if (!CONFIG.saveProgress) return null;
  try {
    const saved = JSON.parse(localStorage.getItem(RUN_KEY) || "null");
    if (!saved || saved.v !== RUN_VERSION || !saved.state || runIsOver(saved.state)) return null;
    // A brand-new run nobody has rolled in yet isn't worth asking about.
    if (saved.state.shift === 1 && saved.state.stats.rolls === 0 && !saved.state.pendingRoll) return null;
    return saved.state;
  } catch (e) {
    return null;
  }
}

function clearRun() {
  try {
    localStorage.removeItem(RUN_KEY);
  } catch (e) {
    // Nothing to clear.
  }
}
