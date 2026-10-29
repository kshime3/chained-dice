// Balance simulator: plays thousands of shifts automatically with simple
// betting strategies, using the game's real rule files. Not part of the game.
// Run with Node.js:  node tools/simulate.js
// It prints win rates for each strategy so we can tune config.js.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Load the logic files exactly as the browser does (no display code).
globalThis.location = { search: "" };
const files = ["config", "dice", "bets", "crew", "cards", "shop", "stats", "perks", "crafting", "comps", "unlocks", "rules", "shift"];
const source = files.map((f) => fs.readFileSync(path.join(__dirname, "..", "js", f + ".js"), "utf8")).join("\n");

const simulator = `
// One roll, settled the same way main.js finishRoll does it.
function simRoll(state) {
  const shooter = state.crew[state.shooterIndex];
  const rolled = rollDice(currentDice(state), nextRollPairs(state));
  state.lastRoll = rolled;
  state.turnRolls += 1;
  const total = rolled.total;
  const pointBefore = state.point;
  const results = resolveRoll(state.bets, total, pointBefore);
  const doubled = !!state.armed.doubleDown && results.some((r) => r.outcome === "win");
  const multUsed = effectiveMult(state) * (doubled ? 2 : 1);
  const crewBefore = applyCrewBeforePayout(state, results, total, pointBefore);
  const before = applyCardsBeforePayout(state, results, total, pointBefore);
  applyMult(results, multUsed);
  for (const r of results) {
    if (r.outcome === "win") {
      state.cash += r.winnings;
      if (!r.staysUp) { state.cash += r.amount; state.bets[r.bet] = 0; }
    }
    if (r.outcome === "lose") state.bets[r.bet] = 0;
  }
  finishArmed(state, results);
  if (pointBefore !== null && total === pointBefore && multUsed >= CONFIG.freeCompMult) gainComp(state, randomComp(state));
  state.point = before.pity ? pointBefore : nextPoint(pointBefore, total);
  const sevenOut = !before.pity && pointBefore !== null && total === CONFIG.sevenOut;
  applyCardsAfterRoll(state, results, total, pointBefore, sevenOut);
  const pointHit = pointBefore !== null && total === pointBefore;
  applyCrewEffects(state, results, sevenOut, pointHit);
  trackRollUnlocks(state, { results: results, pointHit: pointHit, sevenOut: sevenOut, doubles: rolled.dice[0] === rolled.dice[1], multUsed: multUsed, shooter: shooter });
  if (shooter === "You") trackChallenge(state, results, { pointHit: pointHit, total: total, doubles: rolled.dice[0] === rolled.dice[1], sevenOut: sevenOut, multUsed: multUsed });
  afterRoll(state, sevenOut);
}

const round5 = (n) => Math.max(5, Math.floor(n / 5) * 5);

// Who the bot hires into an empty seat, best first (never Jinx).
const HIRE_PREFERENCE = ["Lucky Lou", "The Professor", "Big Mo", "Snake", "Lefty", "Hot Rod", "Dealer Dee", "Ghost"];

// Cards the bot likes best, first to last.
const CARD_PREFERENCE = ["muggsy", "oddsAddict", "doubleUp", "pity", "redDice", "hotHand", "doublesCharm", "greenDice", "luckySeven", "snakeEyes", "rattlesnake", "encore", "highRoller", "rodsLighter", "deesLedger", "leftysGlove", "frontOfLine", "sleightOfHand"];

function atBreak(state, s) {
  if (state.cash >= amountOwed(state)) { deposit(state, amountOwed(state)); return; }
  if (s.shop && isShopOpen(state)) {
    // Don't Pass bots want the dark-side cards first; Pass Line bots skip them.
    const prefs = s.side === "dont" ? ["wrongWay", "coldRead"].concat(CARD_PREFERENCE) : CARD_PREFERENCE;
    const offers = state.stock.map((id, slot) => ({ id, slot })).filter((o) => o.id && prefs.includes(o.id))
      .sort((x, y) => prefs.indexOf(x.id) - prefs.indexOf(y.id));
    for (const o of offers) {
      if (state.cash - cardPrice(state, o.id) >= s.shopReserve) buyCard(state, o.slot);
    }
  }
  if (s.payReserve !== null) {
    const extra = state.cash - s.payReserve;
    if (extra > 0) deposit(state, extra);
  }
}

// Comps bot: buy the useful ones with spare money, use them at sensible moments.
const COMP_PREFERENCE = ["chisel", "copycat", "nudge", "noSevens", "doubleDown", "insurance", "hotSeat", "luckyPair"];

// Dice edits: try every option and keep the one that leaves your dice the fewest 7s.
function bestEdit(state, edit) {
  let best = null;
  for (const die of ["left", "right"]) {
    for (let index = 0; index < 6; index++) {
      const choices = edit === "nudge" ? ["up", "down"] : edit === "copycat" ? [0, 1, 2, 3, 4, 5].filter((i) => i !== index) : [1, 2, 3, 4, 5, 6];
      for (const c of choices) {
        const value = editedValue(state, edit, die, index, c);
        const ways = sevenWays(previewDice(state, die, index, value));
        if (ways >= CONFIG.minSevenWays && (!best || ways < best.ways)) best = { die: die, index: index, value: value, ways: ways };
      }
    }
  }
  return best;
}

function useEdits(state) {
  for (let i = state.comps.length - 1; i >= 0; i--) {
    const id = state.comps[i];
    if (!isEdit(id) || compBlocked(state, id)) continue;
    const choice = bestEdit(state, id);
    if (choice) useComp(state, i, choice);
  }
}

function buyComps(state, s) {
  if (!s.comps || !isShopOpen(state)) return;
  state.compStock.forEach((id, slot) => {
    if (id && COMP_PREFERENCE.includes(id) && state.cash - compPrice(state, id) >= s.shopReserve) buyComp(state, slot);
  });
}

function useComps(state) {
  for (let i = state.comps.length - 1; i >= 0; i--) {
    const id = state.comps[i];
    if (compBlocked(state, id)) continue;
    const pointOn = state.point !== null;
    const bigBet = state.bets.odds + state.bets.lay > 0;
    if (id === "doubleDown" || id === "hotSeat") useComp(state, i);
    else if (id === "noSevens" && pointOn && bigBet && state.bets.pass > 0) useComp(state, i);
    else if (id === "insurance" && pointOn) useComp(state, i);
    else if (id === "luckyPair" && pointOn && state.point % 2 === 0 && state.bets.pass > 0) useComp(state, i);
  }
}

function placeBets(state, s) {
  // "protect": once you could pay off the debt, bet the minimum until the next Break.
  const safe = s.protect && totalMoney(state) >= amountOwed(state) + tableMin(state);
  // Which side: "pass", "dont", or "against-jinx" (Don't Pass only when Jinx shoots).
  const shooter = state.crew[state.shooterIndex];
  // House rule Dark Side Only: Don't Pass is the only line bet.
  const line = s.side === "dont" || (s.side === "against-jinx" && shooter === "Jinx") || !passAllowed(state) ? "dont" : "pass";
  const backing = line === "pass" ? "odds" : "lay";
  if (state.point === null && state.bets.pass === 0 && state.bets.dont === 0) {
    let size = s.passPct ? round5(state.cash * s.passPct) : s.pass;
    if (s.debtPct) size = round5(amountOwed(state) * s.debtPct); // bet in proportion to what's still owed
    size = Math.max(tableMin(state), safe ? tableMin(state) : size);
    if (fundPassLine(state, Math.min(size, Math.max(tableMin(state), round5(state.cash))), line) === null) {
      fundPassLine(state, tableMin(state), line);
    }
  }
  const onLine = state.bets.pass > 0 ? "pass" : state.bets.dont > 0 ? "dont" : null;
  if (!safe && onLine && state.point !== null && s.odds > 0) {
    const back = onLine === "pass" ? "odds" : "lay";
    const limit = backingLimit(state, back);
    const want = Math.min(limit, back === "odds" ? state.bets.pass * s.odds : limit * s.odds / 5);
    const add = Math.min(want - state.bets[back], state.cash);
    if (add > 0) { state.cash -= add; state.bets[back] += add; }
  }
}

function playShift(s, carry) {
  const state = carry ? nextShift(carry) : newShiftState();
  if (carry && !s.noPhone) {
    // The phone: take -1 way to roll 7 if offered, else free items, else the first offer.
    const offer = phoneOffer(state);
    const pick = ["minusSeven", "freeItems"].find((id) => offer.includes(id)) || offer.find((id) => id !== "removeCharacter" && id !== "plus7") || offer[0];
    takePerk(state, pick, state.crew.find((n) => n === "Jinx") || state.crew[0]);
  }
  if (s.startCards && !carry) { state.cards = s.startCards.slice(); state.stock = newStock(state); }
  let rolls = 0;
  while (state.status === "playing" && rolls < 3000) {
    if (state.onBreak) {
      atBreak(state, s);
      buyComps(state, s);
      // Hire into an empty seat: Lucky Lou or The Professor first.
      if (s.shop && isShopOpen(state)) {
        // CUT_JINX=1: drop Jinx through the Trapdoor as soon as it's affordable.
        if (process.env.CUT_JINX && cuttableCrew(state).includes("Jinx") && state.cash - cutChainPrice(state) >= s.shopReserve) cutChain(state, "Jinx");
        for (const name of HIRE_PREFERENCE) {
          if (state.hireOffers.includes(name) && state.cash - hirePrice(state) >= s.shopReserve) hire(state, name);
        }
      }
      if (s.comps) useEdits(state);
      if (state.status !== "playing") break;
      endBreak(state);
      continue;
    }
    placeBets(state, s);
    if (s.comps) useComps(state);
    simRoll(state);
    rolls++;
  }
  state.rolls = rolls;
  return state;
}

function run(label, s, n, scale) {
  let wins = 0, broke = 0, short = 0, rolls = 0, left = 0, cards = 0;
  const reached = scale.map(() => 0); // how many runs survived each shift
  const seats = [];
  CONFIG.shifts = scale.map(([cash, debt, minBet], k) => ({ cash: cash, debt: debt, minBet: minBet || (ORIGINAL_SHIFTS[k] || { minBet: 5 }).minBet }));
  for (let i = 0; i < n; i++) {
    let carry = null;
    for (let k = 0; k < scale.length; k++) {
      const r = playShift(s, carry);
      if (k === 0) {
        rolls += r.rolls; cards += r.cards.length;
        if (r.status === "won") { wins++; left += totalMoney(r); }
        else if (r.status === "fell-broke") broke++; else short++;
      }
      if (r.status !== "won") break;
      reached[k]++;
      seats[k] = (seats[k] || 0) + r.roster.length;
      carry = r;
    }
  }
  const pct = (x) => (100 * x / n).toFixed(1).padStart(5) + "%";
  // SEATS=1 also prints the average number of seats filled after each won shift.
  if (process.env.SEATS) console.log("   seats after each won shift: " + reached.map((x, k) => (seats[k] / x).toFixed(1)).join(" "));
  return label.padEnd(44) + " win " + pct(wins) + " | broke " + pct(broke) + " | short " + pct(short) +
    " | rolls " + (rolls / n).toFixed(0).padStart(3) + " | cards " + (cards / n).toFixed(1) +
    (scale.length > 1 ? " | survived shift " + reached.map((x, k) => (k + 1) + ":" + pct(x)).join(" ") : "");
}
`;

vm.runInThisContext(source + "\n" + simulator);

globalThis.ORIGINAL_SHIFTS = CONFIG.shifts.slice();
// Unlocks: the bots normally play with everything unlocked (comparable with older results).
// LOCKED=1 plays as a brand-new player. Nothing is ever saved.
CONFIG.saveProgress = false;
CONFIG.unlockEverything = !process.env.LOCKED;
if (process.env.CARRY) CONFIG.carryOverShare = Number(process.env.CARRY); // e.g. CARRY=0.5 node tools/simulate.js
// NORULES=1 switches off house rules and challenges (to measure what they change).
if (process.env.NORULES) { globalThis.pickHouseRule = () => null; globalThis.newChallenge = () => null; }
// START_CREW=6 tries a different number of starting seats (the game uses CONFIG.startingCrew).
if (process.env.START_CREW) CONFIG.startingCrew = Number(process.env.START_CREW);
const N = Number(process.argv[2]) || 20000;
const scaleArg = process.argv[3]; // e.g. "100:200,200:500"
const scale = (scaleArg || CONFIG.shifts.map((x) => x.cash + ":" + x.debt + ":" + x.minBet).join(",")).split(",").map((p) => p.split(":").map(Number));

const strategies = [
  ["$5 Pass, no Odds, pay only at the end",      { pass: 5, odds: 0, payReserve: null, shop: false, shopReserve: 0 }],
  ["$10 Pass + max Odds, pay only at the end",   { pass: 10, odds: 5, payReserve: null, shop: false, shopReserve: 0 }],
  ["$25 Pass + max Odds, pay only at the end",   { pass: 25, odds: 5, payReserve: null, shop: false, shopReserve: 0 }],
  ["10% of cash + 2x Odds, keep $100, pay rest", { passPct: 0.1, odds: 2, payReserve: 100, shop: false, shopReserve: 0 }],
  ["$10 Pass + max Odds, keep $100, pay rest",   { pass: 10, odds: 5, payReserve: 100, shop: false, shopReserve: 0 }],
  ["$10 Pass + max Odds, shop, pay at the end",  { pass: 10, odds: 5, payReserve: null, shop: true, shopReserve: 60 }],
  ["$10 Pass + max Odds, shop, keep $100",       { pass: 10, odds: 5, payReserve: 100, shop: true, shopReserve: 60 }],
  ["$25 Pass + max Odds, shop, pay at the end",  { pass: 25, odds: 5, payReserve: null, shop: true, shopReserve: 60 }],
  ["$5 Pass + max Odds, shop, pay at the end",   { pass: 5, odds: 5, payReserve: null, shop: true, shopReserve: 40 }],
  ["$10 Pass + 2x Odds, shop, pay at the end",   { pass: 10, odds: 2, payReserve: null, shop: true, shopReserve: 60 }],
  ["$10 Pass + max Odds, shop, keep $60, pay rest", { pass: 10, odds: 5, payReserve: 60, shop: true, shopReserve: 60 }],
  ["15% of cash + max Odds, shop, pay at end",  { passPct: 0.15, odds: 5, payReserve: null, shop: true, shopReserve: 40 }],
  ["SMART: $10 + max Odds, protect, no shop",   { pass: 10, odds: 5, payReserve: null, shop: false, shopReserve: 0, protect: true }],
  ["SMART: $10 + max Odds, protect, shop",      { pass: 10, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true }],
  ["SMART: $25 + max Odds, protect, shop",      { pass: 25, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true }],
  ["SMART: $10 + 2x Odds, protect, shop",       { pass: 10, odds: 2, payReserve: null, shop: true, shopReserve: 60, protect: true }],
  ["SMART Don't Pass: $10 + max Lay, protect, shop", { pass: 10, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true, side: "dont" }],
  ["SMART: Pass, but Don't Pass against Jinx, shop", { pass: 10, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true, side: "against-jinx" }],
  ["SMART + COMPS: $10 + max Odds, protect, shop, comps", { pass: 10, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true, comps: true }],
  ["SCALING: 5% of what's owed + max Odds, protect, shop",  { debtPct: 0.05, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true }],
  ["SCALING: 10% of what's owed + max Odds, protect, shop", { debtPct: 0.10, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true }],
  ["SCALING: 10% of what's owed + 2x Odds, protect, shop",  { debtPct: 0.10, odds: 2, payReserve: null, shop: true, shopReserve: 60, protect: true }],
  ["SCALING: 20% of what's owed + 2x Odds, protect, shop",  { debtPct: 0.20, odds: 2, payReserve: null, shop: true, shopReserve: 60, protect: true }],
];

// "node tools/simulate.js 20000 100:200 best" runs only the strategies listed by number.
const pick = process.argv[4] && process.argv[4] !== "cards" ? process.argv[4].split(",").map(Number) : null;

console.log("Shifts: " + scale.map((s, i) => "shift " + (i + 1) + " $" + s[0] + " -> $" + s[1]).join(", ") + ". " + N + " runs each.\n");
// "node tools/simulate.js 20000 100:200 cards" measures each card on its own.
if (process.argv[4] === "cards") {
  const base = { pass: 10, odds: 5, payReserve: null, shop: false, shopReserve: 0 };
  console.log("   " + run("(no cards) $10 Pass + max Odds", base, N, scale));
  for (const id of Object.keys(CARDS)) {
    console.log("   " + run("+ " + CARDS[id].name, Object.assign({}, base, { startCards: [id] }), N, scale));
  }
  console.log("  share of careers that unlocked each one: " + Object.keys(UNLOCKS).map((id) => unlockName(id) + " " + Math.round(100 * (perId[id] || 0) / careers) + "%").join(", "));
  process.exit(0);
}

if (!process.env.CAREER) strategies.forEach(([label, s], i) => {
  if (!pick || pick.includes(i)) console.log(String(i).padStart(2) + " " + run(label, s, N, scale));
});

// CAREER=100: a bot plays run after run, keeping its unlocks, until it walks out free
// (at most CAREER_CAP runs). Shows how many playthroughs it takes, and how fast unlocks come.
// Example: CAREER=100 node tools/simulate.js 0 "" 13
if (process.env.CAREER) {
  const careers = Number(process.env.CAREER), cap = Number(process.env.CAREER_CAP) || 500;
  const [label, s] = strategies[pick ? pick[0] : 13];
  CONFIG.unlockEverything = false;
  CONFIG.shifts = scale.map(([cash, debt, minBet], k) => ({ cash: cash, debt: debt, minBet: minBet || (ORIGINAL_SHIFTS[k] || { minBet: 5 }).minBet }));
  const checkpoints = [1, 5, 10, 25, 50, 100, 200];
  const found = {}; checkpoints.forEach((c) => (found[c] = 0));
  const escapes = [];
  const perId = {};
  for (let c = 0; c < careers; c++) {
    resetProfile();
    let escapedAt = null;
    for (let runNo = 1; runNo <= cap && escapedAt === null; runNo++) {
      let carry = null;
      for (let k = 0; k < scale.length; k++) {
        const r = playShift(s, carry);
        if (r.status !== "won") break;
        if (k === scale.length - 1) escapedAt = runNo;
        carry = r;
      }
      takeFreshUnlocks();
      if (found[runNo] !== undefined) found[runNo] += profile().unlocked.length;
    }
    // A career that escaped early keeps its unlock count for later checkpoints.
    for (const cp of checkpoints) if (escapedAt !== null && cp > escapedAt) found[cp] += profile().unlocked.length;
    escapes.push(escapedAt);
    for (const id of profile().unlocked) perId[id] = (perId[id] || 0) + 1;
  }
  const done = escapes.filter((x) => x !== null).sort((a, b) => a - b);
  const total = Object.keys(UNLOCKS).length;
  console.log("CAREER: " + label + ", " + careers + " careers, up to " + cap + " runs each");
  console.log("  walked out free within " + cap + " runs: " + (100 * done.length / careers).toFixed(0) + "%" +
    (done.length ? " | runs needed: fastest " + done[0] + ", median " + done[Math.floor(done.length / 2)] + " (of those who escaped)" : ""));
  console.log("  unlocks found (of " + total + ") after run: " + checkpoints.map((cp) => cp + ": " + (found[cp] / careers).toFixed(1)).join(" | "));
  console.log("  share of careers that unlocked each one: " + Object.keys(UNLOCKS).map((id) => unlockName(id) + " " + Math.round(100 * (perId[id] || 0) / careers) + "%").join(", "));
  process.exit(0);
}
