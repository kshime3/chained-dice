// Unlocks: some cards, comps and crew start locked. Hidden goals unlock them
// across runs. Progress is saved in the browser. No screen code here.

// Each locked item and its hidden goal (c = the lifetime counters below).
// Anything not listed here is unlocked from the start.
const UNLOCKS = {
  // Cards
  loadedDie:     { kind: "card", done: (c) => c.bestShift >= 2 },      // survive shift 2
  reroll:        { kind: "card", done: (c) => c.bestShift >= 3 },      // survive shift 3
  chainLink:     { kind: "card", done: (c) => c.bestShift >= 4 },      // survive shift 4 (Spare Link)
  oddsAddict:    { kind: "card", done: (c) => c.oddsWon >= 500 },      // win $500 on Odds, all runs
  muggsy:        { kind: "card", done: (c) => c.pointSevens >= 5 },    // 5 sevens right after the point is set
  pity:          { kind: "card", done: (c) => c.falls >= 5 },          // the floor opens 5 times
  doublesCharm:  { kind: "card", done: (c) => c.turnDoubles >= 3 },    // 3 doubles in one turn
  greenDice:     { kind: "card", done: (c) => c.runInterest >= 50 },   // $50 interest in one run
  wrongWay:      { kind: "card", done: (c) => c.dontWins >= 10 },      // win 10 Don't Pass bets
  jinxShadow:    { kind: "card", done: (c) => c.jinxDropped >= 1 },    // drop Jinx through the Trapdoor
  leftysGlove:   { kind: "card", done: (c) => (c.crewWins["Lefty"] || 0) >= 3 },      // survive 3 shifts with Lefty seated
  deesLedger:    { kind: "card", done: (c) => (c.crewWins["Dealer Dee"] || 0) >= 3 },
  rodsLighter:   { kind: "card", done: (c) => (c.crewWins["Hot Rod"] || 0) >= 3 },
  ghostStory:    { kind: "card", done: (c) => (c.crewWins["Ghost"] || 0) >= 3 },
  encore:        { kind: "card", done: (c) => c.ownTurnRolls >= 10 },  // your own turn lasts 10+ rolls
  highRoller:    { kind: "card", done: (c) => c.ownTurnWon >= 500 },   // win $500 on one turn of yours
  frontOfLine:   { kind: "card", done: (c) => c.runHires >= 3 },       // hire 3 crew in one run
  sleightOfHand: { kind: "card", done: (c) => c.edits >= 3 },          // use 3 dice edits
  bargain:       { kind: "card", done: (c) => c.bestShift >= 5 },      // reach shift 6 (Dealer's Bargain)
  // Comps
  loadedShot:    { kind: "comp", done: (c) => c.pointsHit >= 10 },     // hit 10 points, all runs
  copycat:       { kind: "comp", done: (c) => c.nudges >= 2 },         // use 2 Nudges
  chisel:        { kind: "comp", done: (c) => c.copycats >= 1 },       // use a Copycat
  // Crew you can hire
  "Lucky Lou":     { kind: "crew", done: (c) => c.bigMultPoints >= 1 }, // hit a point at 3x mult or more
  "The Professor": { kind: "crew", done: (c) => c.hires >= 2 },         // hire 2 crew, all runs
};

const SAVE_KEY = "chainedDice.profile";

function newProfile() {
  return {
    unlocked: [], // locked items you've earned (they show up from your next run)
    counts: {
      bestShift: 0, oddsWon: 0, pointSevens: 0, falls: 0, turnDoubles: 0, runInterest: 0,
      dontWins: 0, jinxDropped: 0, crewWins: {}, ownTurnRolls: 0, ownTurnWon: 0, runHires: 0,
      edits: 0, nudges: 0, copycats: 0, pointsHit: 0, bigMultPoints: 0, hires: 0,
    },
    fresh: [], // just unlocked, waiting to be announced (not saved)
  };
}

// Load once, on first use. Storage can fail (private windows, Node), so it's optional.
let PROFILE = null;
function profile() {
  if (PROFILE) return PROFILE;
  PROFILE = newProfile();
  if (!CONFIG.saveProgress) return PROFILE;
  try {
    const saved = JSON.parse(localStorage.getItem(SAVE_KEY) || "null");
    if (saved) {
      PROFILE.unlocked = saved.unlocked || [];
      Object.assign(PROFILE.counts, saved.counts || {});
    }
  } catch (e) {
    // Nothing saved, or no storage: start fresh.
  }
  return PROFILE;
}

function saveProfile() {
  if (!CONFIG.saveProgress) return;
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({ unlocked: PROFILE.unlocked, counts: PROFILE.counts }));
  } catch (e) {
    // Not saved; progress lasts until the page closes.
  }
}

// Wipe all progress (Collection screen).
function resetProfile() {
  PROFILE = newProfile();
  saveProfile();
}

function isUnlocked(id) {
  return CONFIG.unlockEverything || !UNLOCKS[id] || profile().unlocked.includes(id);
}

// What's still locked at the start of a run. Unlocks earned during a run
// only show up from the next run, so a run keeps this list.
function lockedNow() {
  return Object.keys(UNLOCKS).filter((id) => !isUnlocked(id));
}

// Can this card, comp or crew member show up in this run?
function available(state, id) {
  return !state.locked || !state.locked.includes(id);
}

// Check every goal; newly met ones are unlocked and queued for an announcement.
function checkUnlocks() {
  const p = profile();
  for (const id of Object.keys(UNLOCKS)) {
    if (!p.unlocked.includes(id) && UNLOCKS[id].done(p.counts)) {
      p.unlocked.push(id);
      p.fresh.push(id);
    }
  }
  saveProfile();
}

// Raise a "best" counter.
function best(key, value) {
  const c = profile().counts;
  c[key] = Math.max(c[key], value);
}

// ---------- Hooks, called by the game logic ----------

// After every settled roll. info: { results, pointHit, sevenOut, doubles, multUsed, shooter }
function trackRollUnlocks(state, info) {
  const c = profile().counts;
  const wins = info.results.filter((r) => r.outcome === "win");
  c.oddsWon += wins.filter((r) => r.bet === "odds").reduce((sum, r) => sum + r.winnings, 0);
  c.dontWins += wins.filter((r) => r.bet === "dont").length;
  if (info.sevenOut && state.rollsSincePoint === 1) c.pointSevens += 1;
  if (info.pointHit) c.pointsHit += 1;
  if (info.pointHit && info.multUsed >= 3) c.bigMultPoints += 1;
  if (info.doubles) state.turnDoubles = (state.turnDoubles || 0) + 1;
  best("turnDoubles", state.turnDoubles || 0);
  if (info.shooter === "You") {
    state.turnWon = (state.turnWon || 0) + wins.reduce((sum, r) => sum + r.winnings, 0);
    best("ownTurnWon", state.turnWon);
    best("ownTurnRolls", state.turnRolls);
  }
  checkUnlocks();
}

// A shift was survived (paid off, or caught by the Spare Link).
function trackShiftWon(state) {
  const c = profile().counts;
  best("bestShift", state.shift);
  for (const name of state.roster) {
    if (name !== "You") c.crewWins[name] = (c.crewWins[name] || 0) + 1;
  }
  checkUnlocks();
}

function trackFall() {
  profile().counts.falls += 1;
  checkUnlocks();
}

function trackInterest(state) {
  best("runInterest", state.stats.interest);
  checkUnlocks();
}

function trackDropped(name) {
  if (name === "Jinx") profile().counts.jinxDropped += 1;
  checkUnlocks();
}

function trackHire(state) {
  profile().counts.hires += 1;
  best("runHires", state.stats.hires);
  checkUnlocks();
}

function trackEdit(id) {
  const c = profile().counts;
  c.edits += 1;
  if (id === "nudge") c.nudges += 1;
  if (id === "copycat") c.copycats += 1;
  checkUnlocks();
}

// The display shows these once, then they're cleared.
function takeFreshUnlocks() {
  const p = profile();
  const fresh = p.fresh.slice();
  p.fresh = [];
  return fresh;
}

// A friendly name for any unlockable id.
function unlockName(id) {
  if (CARDS[id]) return CARDS[id].name;
  if (COMPS[id]) return COMPS[id].name;
  return id; // crew are named by their id
}
