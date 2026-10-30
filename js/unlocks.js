// Unlocks: some cards, comps and crew start locked. Hidden goals unlock them
// across runs. Progress is saved in the browser. No screen code here.

// Each locked item and its hidden goal (c = the lifetime counters below,
// g = CONFIG.unlockGoals). Anything not listed here is unlocked from the start.
const UNLOCKS = {
  // Cards
  loadedDie:     { kind: "card", done: (c, g) => c.bestShift >= g.loadedDie },
  reroll:        { kind: "card", done: (c, g) => c.bestShift >= g.reroll },
  chainLink:     { kind: "card", done: (c, g) => c.bestShift >= g.chainLink },
  oddsAddict:    { kind: "card", done: (c, g) => c.oddsWon >= g.oddsAddict },
  muggsy:        { kind: "card", done: (c, g) => c.pointSevens >= g.muggsy },
  pity:          { kind: "card", done: (c, g) => c.falls >= g.pity },
  doublesCharm:  { kind: "card", done: (c, g) => c.turnDoubles >= g.doublesCharm },
  greenDice:     { kind: "card", done: (c, g) => c.runInterest >= g.greenDice },
  wrongWay:      { kind: "card", done: (c, g) => c.dontWins >= g.wrongWay },
  jinxShadow:    { kind: "card", done: (c, g) => c.jinxDropped >= g.jinxShadow },
  leftysGlove:   { kind: "card", done: (c, g) => (c.crewWins["Lefty"] || 0) >= g.crewCard },
  deesLedger:    { kind: "card", done: (c, g) => (c.crewWins["Dealer Dee"] || 0) >= g.crewCard },
  rodsLighter:   { kind: "card", done: (c, g) => (c.crewWins["Hot Rod"] || 0) >= g.crewCard },
  ghostStory:    { kind: "card", done: (c, g) => (c.crewWins["Ghost"] || 0) >= g.crewCard },
  encore:        { kind: "card", done: (c, g) => c.ownTurnRolls >= g.encore },
  highRoller:    { kind: "card", done: (c, g) => c.ownTurnWon >= g.highRoller },
  frontOfLine:   { kind: "card", done: (c, g) => c.runHires >= g.frontOfLine },
  sleightOfHand: { kind: "card", done: (c, g) => c.edits >= g.sleightOfHand },
  bargain:       { kind: "card", done: (c, g) => c.bestShift >= g.bargain },
  // Comps
  loadedShot:    { kind: "comp", done: (c, g) => c.pointsHit >= g.loadedShot },
  copycat:       { kind: "comp", done: (c, g) => c.nudges >= g.copycat },
  chisel:        { kind: "comp", done: (c, g) => c.copycats >= g.chisel },
  // Crew you can hire
  "Lucky Lou":     { kind: "crew", done: (c, g) => c.bigMultPoints >= g.luckyLou },
  "The Professor": { kind: "crew", done: (c, g) => c.hires >= g.professor },
  // Bets (Milestone 12b)
  hardWays:      { kind: "bet", done: (c, g) => c.hardPairs >= g.hardWays },
  placeBets:     { kind: "bet", done: (c, g) => c.pointsHit >= g.placeBets },
  fireBet:       { kind: "bet", done: (c, g) => c.turnPoints >= g.fireBet },
  comeBets:      { kind: "bet", done: (c, g) => c.runPoints >= g.comeBets },
  // Cards added 2026-10-30
  comebackKid:    { kind: "card", done: (c, g) => c.sevenOuts >= g.comebackKid },
  pointCollector: { kind: "card", done: (c, g) => c.turnPoints >= g.pointCollector },
  loanShark:      { kind: "card", done: (c, g) => c.bestLeftover >= g.loanShark },
  hardwayHustler: { kind: "card", done: (c, g) => c.hardWins >= g.hardwayHustler },
  steadyHand:     { kind: "card", done: (c, g) => c.placeWins >= g.steadyHand },
  diceCollector:  { kind: "card", done: (c, g) => c.editedFaces >= g.diceCollector },
};

const SAVE_KEY = "chainedDice.profile";

function newProfile() {
  return {
    unlocked: [], // locked items you've earned (they show up from your next run)
    counts: {
      bestShift: 0, oddsWon: 0, pointSevens: 0, falls: 0, turnDoubles: 0, runInterest: 0,
      dontWins: 0, jinxDropped: 0, crewWins: {}, ownTurnRolls: 0, ownTurnWon: 0, runHires: 0,
      edits: 0, nudges: 0, copycats: 0, pointsHit: 0, bigMultPoints: 0, hires: 0,
      hardPairs: 0, turnPoints: 0, runPoints: 0,
      sevenOuts: 0, bestLeftover: 0, hardWins: 0, placeWins: 0, editedFaces: 0,
    },
    fresh: [], // just unlocked, waiting to be announced (not saved)
    freshPerks: [], // Reputation bonuses just earned, announced with them
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
  const perksBefore = earnedReputation().length;
  for (const id of Object.keys(UNLOCKS)) {
    if (!p.unlocked.includes(id) && UNLOCKS[id].done(p.counts, CONFIG.unlockGoals)) {
      p.unlocked.push(id);
      p.fresh.push(id);
    }
  }
  p.freshPerks = p.freshPerks.concat(earnedReputation().slice(perksBefore));
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
  if (info.sevenOut) c.sevenOuts += 1;
  c.hardWins += wins.filter((r) => /^hard\d+$/.test(r.bet)).length;
  c.placeWins += wins.filter((r) => /^place\d+$/.test(r.bet)).length;
  if (info.pointHit) {
    c.pointsHit += 1;
    state.stats.runPoints = (state.stats.runPoints || 0) + 1;
    best("runPoints", state.stats.runPoints);
  }
  const total = state.lastRoll ? state.lastRoll.total : 0;
  if (info.doubles && [4, 6, 8, 10].includes(total)) c.hardPairs += 1;
  best("turnPoints", (state.firePoints || []).length);
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
  best("bestLeftover", totalMoney(state));
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

function trackEdit(id, state) {
  const c = profile().counts;
  c.edits += 1;
  if (id === "nudge") c.nudges += 1;
  if (id === "copycat") c.copycats += 1;
  if (state) best("editedFaces", editedFaces(state));
  checkUnlocks();
}

// The display shows these once, then they're cleared.
function takeFreshUnlocks() {
  const p = profile();
  const fresh = p.fresh.slice();
  p.fresh = [];
  return fresh;
}

function takeFreshPerks() {
  const p = profile();
  const fresh = p.freshPerks.slice();
  p.freshPerks = [];
  return fresh;
}

// ---------- Reputation: lasting bonuses ----------

// Bonuses earned so far (ids from CONFIG.reputation). Counts real unlocks only,
// so ?unlockAll and tests.html get no bonuses.
function earnedReputation() {
  const levels = Math.floor(profile().unlocked.length / CONFIG.reputationEvery);
  return CONFIG.reputation.slice(0, levels).map((r) => r.id);
}

function hasLegacy(state, id) {
  return !!state.legacy && state.legacy.includes(id);
}

function maxCards(state) {
  return CONFIG.maxCards + (hasLegacy(state, "cardSlot") ? 1 : 0);
}

function compSlots(state) {
  return CONFIG.compSlots + (hasLegacy(state, "compSlot") ? 1 : 0) + (hasLegacy(state, "compSlot2") ? 1 : 0);
}

// A brand-new run gets its Reputation bonuses (called from newShiftState).
function applyLegacy(state) {
  state.legacy = earnedReputation();
  if (hasLegacy(state, "cash")) state.cash += CONFIG.reputationCash;
  if (hasLegacy(state, "cash2")) state.cash += CONFIG.reputationCash2;
  if (hasLegacy(state, "cash3")) state.cash += CONFIG.reputationCash3;
  if (hasLegacy(state, "minusSeven")) state.perks.push("minusSeven"); // same as the phone perk
  if (hasLegacy(state, "minusSeven2")) state.perks.push("minusSeven");
  if (hasLegacy(state, "startCard")) {
    const pool = Object.keys(CARDS).filter((id) => CONFIG.cardRarity[id] === CONFIG.reputationCardRarity && !CARDS[id].crew && available(state, id));
    if (pool.length) state.cards.push(pool[Math.floor(Math.random() * pool.length)]);
  }
  if (hasLegacy(state, "spareLink")) state.cards.push("chainLink");
  if (hasLegacy(state, "rareCard")) {
    const rares = Object.keys(CARDS).filter((id) => CONFIG.cardRarity[id] === "rare" && !CARDS[id].crew && !CARDS[id].instant && !CARDS[id].needs && available(state, id) && !state.cards.includes(id));
    if (rares.length) state.cards.push(rares[Math.floor(Math.random() * rares.length)]);
  }
}

// The new bets, as unlockable groups.
const BET_GROUPS = {
  hardWays:  { name: "Hard Ways", text: "Bet a 4, 6, 8 or 10 comes as a pair (2+2, 3+3...) before a 7 or the plain way. Pays 7 to 1 (4, 10) or 9 to 1 (6, 8). Off on come-out rolls." },
  placeBets: { name: "Place Bets", text: "Bet a number (4, 5, 6, 8, 9, 10) comes before a 7. It stays up and keeps paying: 9 to 5 (4, 10), 7 to 5 (5, 9), 7 to 6 (6, 8). Off on come-out rolls." },
  comeBets:  { name: "Come & Don't Come", text: "A second Pass Line (or Don't Pass) started while the point is on. Its own come-out: 7/11 win, 2/3/12 lose; any other number becomes its own point." },
  fireBet:   { name: "Fire Bet", text: "A small bet before a shooter's first roll. Pays big if they make 4, 5 or 6 different points before sevening out." },
};

// Which unlock group a table bet belongs to ("hard6" -> "hardWays"), or null for the main bets.
function betGroup(bet) {
  if (/^hard\d+$/.test(bet)) return "hardWays";
  if (/^place\d+$/.test(bet)) return "placeBets";
  if (bet === "come" || bet === "dontCome") return "comeBets";
  if (bet === "fire") return "fireBet";
  return null;
}

// A friendly name for any unlockable id.
function unlockName(id) {
  if (CARDS[id]) return CARDS[id].name;
  if (COMPS[id]) return COMPS[id].name;
  if (BET_GROUPS[id]) return BET_GROUPS[id].name;
  return id; // crew are named by their id
}
