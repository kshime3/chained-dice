// Balance simulator: plays thousands of shifts automatically with simple
// betting strategies, using the game's real rule files. Not part of the game.
// Run with Node.js:  node tools/simulate.js
// It prints win rates for each strategy so we can tune config.js.

const fs = require("fs");
const path = require("path");
const vm = require("vm");

// Load the logic files exactly as the browser does (no display code).
globalThis.location = { search: "" };
const files = ["config", "dice", "bets", "crew", "cards", "shop", "stats", "perks", "shift"];
const source = files.map((f) => fs.readFileSync(path.join(__dirname, "..", "js", f + ".js"), "utf8")).join("\n");

const simulator = `
// One roll, settled the same way main.js finishRoll does it.
function simRoll(state) {
  const rolled = rollDice(currentDice(state), pairDue(state));
  state.lastRoll = rolled;
  state.turnRolls += 1;
  const total = rolled.total;
  const pointBefore = state.point;
  const results = resolveRoll(state.bets, total, pointBefore);
  const multUsed = effectiveMult(state);
  const crewBefore = applyCrewBeforePayout(state, results, total, pointBefore);
  const before = applyCardsBeforePayout(state, results, total, pointBefore);
  applyMult(results, multUsed);
  for (const r of results) {
    if (r.outcome === "win") {
      state.kitty += r.winnings;
      if (!r.staysUp) { state.kitty += r.amount; state.bets[r.bet] = 0; }
    }
    if (r.outcome === "lose") state.bets[r.bet] = 0;
  }
  state.point = before.pity ? pointBefore : nextPoint(pointBefore, total);
  const sevenOut = !before.pity && pointBefore !== null && total === CONFIG.sevenOut;
  applyCardsAfterRoll(state, results, total, pointBefore, sevenOut);
  applyCrewEffects(state, results, sevenOut);
  afterRoll(state, sevenOut);
}

const round5 = (n) => Math.max(5, Math.floor(n / 5) * 5);

// Cards the bot likes best, first to last.
const CARD_PREFERENCE = ["muggsy", "oddsAddict", "doubleUp", "pity", "redDice", "hotHand", "doublesCharm", "greenDice", "luckySeven", "snakeEyes", "rattlesnake"];

function atBreak(state, s) {
  if (state.kitty >= amountOwed(state)) { deposit(state, amountOwed(state)); return; }
  if (s.shop && isShopOpen(state)) {
    // Don't Pass bots want the dark-side cards first; Pass Line bots skip them.
    const prefs = s.side === "dont" ? ["wrongWay", "coldRead"].concat(CARD_PREFERENCE) : CARD_PREFERENCE;
    const offers = state.stock.map((id, slot) => ({ id, slot })).filter((o) => o.id && prefs.includes(o.id))
      .sort((x, y) => prefs.indexOf(x.id) - prefs.indexOf(y.id));
    for (const o of offers) {
      if (state.kitty - cardPrice(state, o.id) >= s.shopReserve) buyCard(state, o.slot);
    }
  }
  if (s.payReserve !== null) {
    const extra = state.kitty - s.payReserve;
    if (extra > 0) deposit(state, extra);
  }
}

function placeBets(state, s) {
  // "protect": once you could pay off the debt, bet the minimum until the next Break.
  const safe = s.protect && totalMoney(state) >= amountOwed(state) + tableMin(state);
  // Which side: "pass", "dont", or "against-jinx" (Don't Pass only when Jinx shoots).
  const shooter = state.crew[state.shooterIndex];
  const line = s.side === "dont" || (s.side === "against-jinx" && shooter === "Jinx") ? "dont" : "pass";
  const backing = line === "pass" ? "odds" : "lay";
  if (state.point === null && state.bets.pass === 0 && state.bets.dont === 0) {
    const size = Math.max(tableMin(state), safe ? tableMin(state) : s.passPct ? round5(state.kitty * s.passPct) : s.pass);
    if (fundPassLine(state, Math.min(size, Math.max(tableMin(state), round5(state.kitty))), line) === null) {
      fundPassLine(state, tableMin(state), line);
    }
  }
  const onLine = state.bets.pass > 0 ? "pass" : state.bets.dont > 0 ? "dont" : null;
  if (!safe && onLine && state.point !== null && s.odds > 0) {
    const back = onLine === "pass" ? "odds" : "lay";
    const limit = back === "odds" ? maxOdds(state.bets.pass, state.point) : maxLay(state.bets.dont, state.point);
    const want = Math.min(limit, back === "odds" ? state.bets.pass * s.odds : limit * s.odds / 5);
    const add = Math.min(want - state.bets[back], state.kitty);
    if (add > 0) { state.kitty -= add; state.bets[back] += add; }
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
      if (state.status !== "playing") break;
      endBreak(state);
      continue;
    }
    placeBets(state, s);
    simRoll(state);
    rolls++;
  }
  state.rolls = rolls;
  return state;
}

function run(label, s, n, scale) {
  let wins = 0, broke = 0, short = 0, rolls = 0, left = 0, cards = 0;
  const reached = scale.map(() => 0); // how many runs survived each shift
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
      carry = r;
    }
  }
  const pct = (x) => (100 * x / n).toFixed(1).padStart(5) + "%";
  return label.padEnd(44) + " win " + pct(wins) + " | broke " + pct(broke) + " | short " + pct(short) +
    " | rolls " + (rolls / n).toFixed(0).padStart(3) + " | cards " + (cards / n).toFixed(1) +
    (scale.length > 1 ? " | survived shift " + reached.map((x, k) => (k + 1) + ":" + pct(x)).join(" ") : "");
}
`;

vm.runInThisContext(source + "\n" + simulator);

globalThis.ORIGINAL_SHIFTS = CONFIG.shifts.slice();
const N = Number(process.argv[2]) || 20000;
const scaleArg = process.argv[3]; // e.g. "100:200,200:500"
const scale = (scaleArg || CONFIG.shifts.map((x) => x.cash + ":" + x.debt + ":" + x.minBet).join(",")).split(",").map((p) => p.split(":").map(Number));

const strategies = [
  ["$5 Pass, no Odds, pay only at the end",      { pass: 5, odds: 0, payReserve: null, shop: false, shopReserve: 0 }],
  ["$10 Pass + max Odds, pay only at the end",   { pass: 10, odds: 5, payReserve: null, shop: false, shopReserve: 0 }],
  ["$25 Pass + max Odds, pay only at the end",   { pass: 25, odds: 5, payReserve: null, shop: false, shopReserve: 0 }],
  ["10% of kitty + 2x Odds, keep $100, pay rest", { passPct: 0.1, odds: 2, payReserve: 100, shop: false, shopReserve: 0 }],
  ["$10 Pass + max Odds, keep $100, pay rest",   { pass: 10, odds: 5, payReserve: 100, shop: false, shopReserve: 0 }],
  ["$10 Pass + max Odds, shop, pay at the end",  { pass: 10, odds: 5, payReserve: null, shop: true, shopReserve: 60 }],
  ["$10 Pass + max Odds, shop, keep $100",       { pass: 10, odds: 5, payReserve: 100, shop: true, shopReserve: 60 }],
  ["$25 Pass + max Odds, shop, pay at the end",  { pass: 25, odds: 5, payReserve: null, shop: true, shopReserve: 60 }],
  ["$5 Pass + max Odds, shop, pay at the end",   { pass: 5, odds: 5, payReserve: null, shop: true, shopReserve: 40 }],
  ["$10 Pass + 2x Odds, shop, pay at the end",   { pass: 10, odds: 2, payReserve: null, shop: true, shopReserve: 60 }],
  ["$10 Pass + max Odds, shop, keep $60, pay rest", { pass: 10, odds: 5, payReserve: 60, shop: true, shopReserve: 60 }],
  ["15% of kitty + max Odds, shop, pay at end",  { passPct: 0.15, odds: 5, payReserve: null, shop: true, shopReserve: 40 }],
  ["SMART: $10 + max Odds, protect, no shop",   { pass: 10, odds: 5, payReserve: null, shop: false, shopReserve: 0, protect: true }],
  ["SMART: $10 + max Odds, protect, shop",      { pass: 10, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true }],
  ["SMART: $25 + max Odds, protect, shop",      { pass: 25, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true }],
  ["SMART: $10 + 2x Odds, protect, shop",       { pass: 10, odds: 2, payReserve: null, shop: true, shopReserve: 60, protect: true }],
  ["SMART Don't Pass: $10 + max Lay, protect, shop", { pass: 10, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true, side: "dont" }],
  ["SMART: Pass, but Don't Pass against Jinx, shop", { pass: 10, odds: 5, payReserve: null, shop: true, shopReserve: 60, protect: true, side: "against-jinx" }],
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
  process.exit(0);
}

strategies.forEach(([label, s], i) => {
  if (!pick || pick.includes(i)) console.log(String(i).padStart(2) + " " + run(label, s, N, scale));
});
