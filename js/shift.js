// Shift logic: turns, paying the dealer, and win/fall checks. No screen code here.

// Cash and debt for shift n (1 = the first shift).
function shiftScale(n) {
  const table = CONFIG.shifts;
  if (n <= table.length) return table[n - 1];
  let scale = table[table.length - 1];
  for (let k = table.length + 1; k <= n; k++) {
    const debt = Math.round((scale.debt * CONFIG.laterDebtGrowth) / 50) * 50;
    scale = {
      cash: scale.cash + CONFIG.laterCashStep,
      debt: debt,
      minBet: Math.max(25, Math.round((debt * CONFIG.laterMinBetPct) / 25) * 25),
    };
  }
  return scale;
}

// The table minimum this shift: the smallest line bet, and what you always keep in cash.
function tableMin(state) {
  return state.minBet * (rule(state, "highStakes") ? CONFIG.highStakesX : 1);
}

// The chips shown this shift.
function chipsFor(state) {
  return tableMin(state) >= 25 ? CONFIG.bigChipValues : CONFIG.chipValues;
}

// Can you pay the dealer right now? Not until the first shooter of the shift has rolled.
function canPay(state) {
  return !CONFIG.payAfterFirstShooter || state.shooterIndex > 0;
}

// Who's seated at the start of a run: you, the crew in alwaysStarts (Jinx),
// and random starters up to CONFIG.startingCrew. Seats keep the CONFIG.crew order.
function startingRoster() {
  const forced = CONFIG.alwaysStarts;
  const others = CONFIG.crew.filter((n) => n !== "You" && !forced.includes(n));
  const picked = [];
  while (picked.length < CONFIG.startingCrew - 1 - forced.length && others.length) {
    picked.push(others.splice(Math.floor(Math.random() * others.length), 1)[0]);
  }
  return CONFIG.crew.filter((n) => n === "You" || forced.includes(n) || picked.includes(n));
}

// A fresh run: wake up at the table for shift 1.
function newShiftState() {
  const roster = startingRoster();
  const state = {
    shift: 1, // which shift of the run this is
    debt: shiftScale(1).debt, // what the dealer wants this shift
    minBet: shiftScale(1).minBet, // the table minimum this shift
    cash: shiftScale(1).cash, // money in your hand, not on the table
    cashAdded: shiftScale(1).cash, // cash the pit boss added at the start of this shift
    dealerCut: 0, // leftover money the dealer kept at the start of this shift
    deposited: 0, // paid to the dealer: safe, but out of play
    bets: emptyBets(),
    firePoints: [], // different points the current shooter has made (Fire Bet)
    savedBets: null, // bets remembered by "Save bets" (carry over between shifts)
    comebackPending: false, // Comeback Kid: the next point after a seven-out pays extra
    point: null, // null means the next roll is a come-out roll
    shooterIndex: 0, // seat number of the current shooter (0 = first seat)
    onBreak: true, // a Dealer Break happens before each shooter and once at the end
    status: "playing", // "playing", "won", "fell-broke", or "fell-short"
    lastRoll: null,
    roster: roster, // who's at the table (carries over; Trapdoor removes, Hire adds)
    crew: roster.slice(), // the shooting order this shift (built from the roster and your cards)
    dropped: [], // crew who fell through a Trapdoor: gone for the run, never hireable again
    locked: lockedNow(), // cards, comps and crew still locked when this run started
    systems: openSystems(), // comps, challenges, house rules: arrive over your first runs
    dice: diceForShooter(roster[0]), // current shooter's dice
    mult: CONFIG.startingMult, // multiplies winnings this turn
    multNotes: [], // why the mult is what it is (synergies)
    coldTable: false, // true until this shooter's first win, after Jinx
    hotRodPenaltyUsed: false, // Hot Rod's double-cost seven-out happens once a shift
    payoutX: 1, // Muggsy's x2 on the next shooter's winnings
    hotRodGain: 0, // mult Hot Rod has built up this turn
    rattleGain: 0, // mult Rattlesnake has added this turn
    turnRolls: 0, // rolls in the current shooter's turn (Doubles Charm)
    loadedDieUsed: false, // Loaded Die works once per shooter
    rerollUsed: false, // Reroll works once per shooter
    prevShooterMult: 1, // the last shooter's final mult (for Mentor if a seat is cut)
    savedByLink: false, // true if the Spare Link saved this shift
    endless: false, // true after "Double or nothing": the chain is gone, play for score
    extraLinks: 0, // links added by Dealer's Bargain (more shifts to walk free)
    comps: [], // comp ids you hold (see comps.js)
    compStock: [], // comps for sale at this Dealer Break
    armed: {}, // comps armed for the next roll, e.g. { noSevens: true, loadedShot: 4 }
    myDice: { left: [1, 2, 3, 4, 5, 6], right: [1, 2, 3, 4, 5, 6] }, // your dice (dice crafting edits these)
    hireOffers: [], // crew you can hire at this Dealer Break
    ghostPick: "evens", // Ghost Story: the side you choose for Ghost's die
    houseRule: null, // this shift's house rule, e.g. { id: "houseDie", x: 4 } (see rules.js)
    challenge: null, // the pit boss challenge for your current turn
    freeShuffles: 0, // Shuffles you can use for free (challenge reward)
    firstPointPaid: {}, // No Free Lunch: shooters who've already had their unpaid first point
    walkedAway: false, // true if you escaped and chose "Walk away"
    stats: newStats(), // run stats for the end screen (carry over between shifts)
    perks: [], // Pit Boss phone perks (carry over between shifts)
    freeBuys: 0, // shop cards you can take for free (from the "free items" perk)
    coldReadPending: false, // Cold Read: the next shooter gets extra mult
    cards: [], // card ids you own (see cards.js)
    stock: [], // card ids for sale at this Dealer Break (null = sold out)
    shuffles: 0, // Shuffles used this shift (each one costs more)
    hotStreak: 0, // winning rolls in a row (Hot Hand)
    pityUsed: false, // Pit Boss's Pity works once a shift
    muggsyPending: false, // the next shooter gets Muggsy's x2
    rollsSincePoint: 0, // for Muggsy's point-7
    sevenOutBy: null, // who just sevened out (shown on the Dealer Break)
    interestRate: CONFIG.interestRate, // cards can raise this later
    lastInterest: 0, // interest paid at the latest Dealer Break
  };
  applyLegacy(state); // Reputation bonuses (starting cash, cards, slots...)
  state.stock = newStock(state);
  state.compStock = newCompStock(state);
  state.hireOffers = newHireOffers(state);
  return state;
}

// Money still in play: cash plus everything on the table (not deposits).
function totalMoney(state) {
  return state.cash + betsTotal(state.bets);
}

function amountOwed(state) {
  return state.debt - state.deposited;
}

// True once every shooter has had a turn.
function isFinalBreak(state) {
  return state.shooterIndex >= state.crew.length;
}

// Dark Side Only (a house rule): no Pass Line this shift.
// Can you put a chip on one of the new bets right now? Returns "ok" or a reason:
// "locked", "noPoint" (Come bets need a point), "fireLate" (the shooter already rolled), "fireMax".
function extraBetCheck(state, bet) {
  if (!available(state, betGroup(bet))) return "locked";
  if (["comeBets", "placeBets", "hardWays"].includes(betGroup(bet)) && state.point === null) return "noPoint"; // these wait for a point
  if (bet === "fire" && state.turnRolls > 0) return "fireLate";
  if (bet === "fire" && state.bets.fire >= fireMax(state)) return "fireMax";
  return "ok";
}

// Can a chip go on this bet right now? (The table highlights these and greys out the rest.)
function betOpen(state, bet) {
  if (state.status !== "playing" || state.onBreak) return false;
  const b = state.bets;
  const pointOn = state.point !== null;
  if (bet === "pass") return !pointOn && passAllowed(state) && b.dont === 0;
  if (bet === "dont") return !pointOn && b.pass === 0;
  if (bet === "odds") return pointOn && b.pass > 0 && b.odds < backingLimit(state, "odds");
  if (bet === "lay") return pointOn && b.dont > 0 && b.lay < backingLimit(state, "lay");
  if (bet === "field") return true;
  return extraBetCheck(state, bet) === "ok";
}

// The Fire Bet is small: at most CONFIG.fireBetMaxX table minimums.
function fireMax(state) {
  return tableMin(state) * CONFIG.fireBetMaxX;
}

// "Save bets": remember what's on the table now. Come bets that already moved
// to a number aren't saved (you can't put a chip there directly).
function saveBets(state) {
  const saved = {};
  for (const [bet, amount] of Object.entries(state.bets)) {
    if (amount > 0 && !/^d?come\d+$/.test(bet)) saved[bet] = amount;
  }
  state.savedBets = Object.keys(saved).length ? saved : null;
  return state.savedBets;
}

// "Same bets": top each saved bet back up to its saved amount, using cash only,
// where the rules allow it right now. A line bet is raised to the table minimum if needed;
// Odds and Lay Odds are capped at today's limit. Each bet goes down in full or not at all.
// Returns { placed: [{ bet, amount }], waiting: [bet] (not allowed yet), short: [bet] (not enough cash) }.
function rebet(state) {
  const out = { placed: [], waiting: [], short: [] };
  const saved = state.savedBets || {};
  const put = (bet, want) => {
    const need = want - state.bets[bet];
    if (need <= 0) return;
    if (need > state.cash) {
      out.short.push(bet);
      return;
    }
    state.cash -= need;
    state.bets[bet] += need;
    out.placed.push({ bet: bet, amount: need });
  };
  for (const line of ["pass", "dont"]) {
    if (!saved[line]) continue;
    const other = line === "pass" ? "dont" : "pass";
    if (state.point !== null || (line === "pass" && !passAllowed(state)) || state.bets[other] > 0) {
      if (state.bets[line] === 0) out.waiting.push(line);
      continue;
    }
    put(line, Math.max(saved[line], tableMin(state)));
  }
  if (saved.field) put("field", saved.field);
  for (const [back, line] of [["odds", "pass"], ["lay", "dont"]]) {
    if (!saved[back]) continue;
    if (state.point === null || state.bets[line] === 0) {
      out.waiting.push(back);
      continue;
    }
    put(back, Math.min(saved[back], backingLimit(state, back)));
  }
  for (const bet of Object.keys(saved).filter((b) => betGroup(b))) {
    const check = extraBetCheck(state, bet);
    if (check === "noPoint" || check === "fireLate") out.waiting.push(bet);
    else if (check === "ok" || (check === "fireMax" && state.bets.fire < saved.fire)) {
      put(bet, bet === "fire" ? Math.min(saved.fire, fireMax(state)) : saved[bet]);
    }
  }
  return out;
}

// How much of your leftover money you keep into the next shift (the rest is the dealer's cut).
function carryShare(state) {
  return hasCard(state, "loanShark") ? CONFIG.loanSharkCarry : CONFIG.carryOverShare;
}

function passAllowed(state) {
  return !rule(state, "darkSideOnly");
}

// A line bet (Pass Line or Don't Pass) must be played. On a come-out you need the minimum on one.
function canRoll(state) {
  return state.point !== null || state.bets.pass >= tableMin(state) || state.bets.dont >= tableMin(state);
}

// Broke: on a come-out, you can't cover the minimum Pass Line bet.
function isBroke(state) {
  // Only money you could still put on a line bet counts (not Come bets on a number).
  const free = state.cash + state.bets.pass + state.bets.dont + looseBets().reduce((sum, bet) => sum + state.bets[bet], 0);
  return state.point === null && free < tableMin(state);
}

// The most you can pay right now. You always keep enough in cash
// for the minimum Pass Line bet, unless this payment clears the debt.
function maxDeposit(state) {
  if (!canPay(state)) return 0;
  const owed = amountOwed(state);
  if (state.cash >= owed) return owed;
  return Math.max(0, state.cash - tableMin(state));
}

// Pay the dealer from your cash, up to maxDeposit.
// Returns how much was actually paid. Paying in full wins the shift.
function deposit(state, amount) {
  const paid = Math.min(amount, maxDeposit(state));
  if (paid <= 0) return 0;
  state.cash -= paid;
  state.deposited += paid;
  state.stats.paid += paid;
  if (state.deposited >= state.debt && state.status !== "won") {
    state.status = "won";
    trackShiftWon(state);
  }
  return paid;
}

// Plaques: you pay the dealer by dropping plaques in the drop box, each worth
// CONFIG.plaquePct of the debt. The last one pays exactly what's left.
function plaqueValue(state) {
  return Math.max(1, Math.round(state.debt * CONFIG.plaquePct));
}

// Drop one plaque. Returns { paid, reason }: reason is "ok", "closed" (not after the
// first shooter yet), "money" (not enough cash, keeping the table minimum) or "done".
function dropPlaque(state) {
  if (amountOwed(state) <= 0) return { paid: 0, reason: "done" };
  if (!canPay(state)) return { paid: 0, reason: "closed" };
  const amount = Math.min(plaqueValue(state), amountOwed(state));
  if (maxDeposit(state) < amount) return { paid: 0, reason: "money" };
  return { paid: deposit(state, amount), reason: "ok" };
}

// Put money on a line bet ("pass" or "dont"). If your cash is short, the rest is
// moved from your other bets (Field first, then Odds, then Lay Odds).
// Returns the list of moves made, e.g. [{ from: "field", amount: 5 }],
// or null if you can't cover it at all.
function fundPassLine(state, amount, line = "pass") {
  const b = state.bets;
  const loose = looseBets();
  if (state.cash + loose.reduce((sum, bet) => sum + b[bet], 0) < amount) return null;
  const moves = [];
  const fromCash = Math.min(state.cash, amount);
  state.cash -= fromCash;
  let short = amount - fromCash;
  for (const bet of loose) {
    const take = Math.min(b[bet], short);
    if (take > 0) {
      b[bet] -= take;
      short -= take;
      moves.push({ from: bet, amount: take });
    }
  }
  b[line] += amount;
  return moves;
}

// Interest: a share of everything you've paid, into your cash (rounded down).
function payInterest(state) {
  const rate = state.interestRate * (rule(state, "skimmedInterest") ? CONFIG.skimmedInterestX : 1);
  state.lastInterest = Math.floor(state.deposited * rate);
  state.cash += state.lastInterest;
  state.stats.interest += state.lastInterest;
  trackInterest(state);
  return state.lastInterest;
}

// How many links your chain has (Dealer's Bargain adds more).
function totalLinks(state) {
  return CONFIG.chainLinks + state.extraLinks;
}

// Links broken so far: one per won shift (all of them in endless mode).
function linksBroken(state) {
  if (state.endless) return totalLinks(state);
  const won = state.shift - 1 + (state.status === "won" ? 1 : 0);
  return Math.min(won, totalLinks(state));
}

// True when the last link just broke: you can walk out free.
function hasEscaped(state) {
  return !state.endless && state.status === "won" && state.shift >= totalLinks(state);
}

// You would fall. The Spare Link catches you instead, if you have one:
// the shift counts as survived and the rest of the debt is forgiven.
function fall(state, reason) {
  if (hasCard(state, "chainLink")) {
    state.cards = state.cards.filter((id) => id !== "chainLink");
    state.savedByLink = true;
    state.status = "won";
    trackShiftWon(state);
    return;
  }
  state.status = reason;
  trackFall();
}

// Trapdoor (the code calls it cutChain): price, who can be dropped, and doing it.
function cutChainPrice(state) {
  return roundTo5(CONFIG.cutChainPct * state.debt);
}

// Only crew who haven't shot yet this shift, never You.
function cuttableCrew(state) {
  return [...new Set(state.crew.filter((name, i) => i >= state.shooterIndex && name !== "You"))];
}

function cutChain(state, name) {
  if (!cuttableCrew(state).includes(name)) return "not-allowed";
  if (!canSpend(state, cutChainPrice(state))) return "money";
  state.cash -= cutChainPrice(state);
  state.stats.spent += cutChainPrice(state);
  removeCrew(state, name);
  return "ok";
}

// Take a crew member off the table for the rest of the run (Trapdoor, phone perk).
function removeCrew(state, name) {
  const wasNext = state.crew[state.shooterIndex] === name;
  state.roster = state.roster.filter((n) => n !== name);
  state.crew = state.crew.filter((n) => n !== name);
  if (!state.dropped.includes(name)) state.dropped.push(name);
  trackDropped(name);
  // If the next shooter was removed, the seat after them steps up (synergies included).
  if (wasNext && !isFinalBreak(state)) {
    setupTurn(state, state.crew[state.shooterIndex - 1] || null, state.prevShooterMult);
  }
}

// After a won shift: the next shift. Money, cards, cut crew and interest
// carry over; payments and once-a-shift effects start fresh.
function nextShift(old) {
  const state = newShiftState();
  state.shift = old.shift + 1;
  const scale = shiftScale(state.shift);
  state.debt = scale.debt;
  state.minBet = scale.minBet;
  state.cashAdded = scale.cash;
  state.carriedOver = Math.floor(totalMoney(old) * carryShare(old)); // bets left on the table come back too
  state.dealerCut = totalMoney(old) - state.carriedOver;
  state.cash = state.carriedOver + scale.cash;
  state.cards = old.cards.slice();
  state.roster = old.roster.slice();
  state.dropped = old.dropped.slice();
  state.locked = old.locked.slice();
  state.systems = old.systems ? Object.assign({}, old.systems) : undefined;
  state.savedBets = old.savedBets ? Object.assign({}, old.savedBets) : null;
  state.interestRate = old.interestRate;
  state.stats = old.stats;
  state.perks = old.perks.slice();
  state.endless = old.endless;
  state.extraLinks = old.extraLinks;
  state.comps = old.comps.slice();
  state.myDice = { left: old.myDice.left.slice(), right: old.myDice.right.slice() };
  state.freeBuys = old.freeBuys;
  state.stats.shiftStarts.push(state.stats.history.length);
  state.legacy = (old.legacy || []).slice(); // the bonuses this run started with
  state.freeShuffles = old.freeShuffles;
  state.houseRule = pickHouseRule(state);
  state.crew = turnOrder(state);
  setupTurn(state, null, CONFIG.startingMult);
  state.stock = newStock(state);
  state.compStock = newCompStock(state);
  state.hireOffers = newHireOffers(state);
  return state;
}

// This shift's shooting order: the roster, with Front of the Line (You first)
// and Encore (You again at the end).
function turnOrder(state) {
  let order = state.roster.slice();
  const here = order.includes("You");
  if (here && hasCard(state, "frontOfLine")) order = ["You"].concat(order.filter((n) => n !== "You"));
  if (here && hasCard(state, "encore")) order.push("You");
  return order;
}

// Encore bought mid-shift: add your extra turn at the end (once).
function addEncoreTurn(state) {
  if (!state.roster.includes("You") || state.crew.filter((n) => n === "You").length > 1) return;
  state.crew.push("You");
  if (state.onBreak && state.shooterIndex === state.crew.length - 1) setupTurn(state, state.crew[state.shooterIndex - 1] || null, state.prevShooterMult);
}

// Hiring: new crew can join while a seat is empty (fewer than maxSeats at the table).
function hirePrice(state, name) {
  const pct = CONFIG.hirePrices[name] !== undefined ? CONFIG.hirePrices[name] : CONFIG.hirePricePct;
  return roundTo5(pct * state.debt * priceX(state));
}

// Markup (a house rule) raises shop prices.
function priceX(state) {
  return rule(state, "markup") ? CONFIG.markupX : 1;
}

function newHireOffers(state) {
  // New recruits, plus starting crew who weren't seated this run (never anyone dropped).
  const pool = CONFIG.recruits.concat(CONFIG.crew).filter((n) => n !== "You" && !state.roster.includes(n) && !state.dropped.includes(n) && available(state, n));
  const offers = [];
  while (offers.length < CONFIG.hireOffers && pool.length) offers.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  return offers;
}

// Returns "ok", "full" (no empty seat), "money" or "gone".
function hire(state, name) {
  if (!state.hireOffers.includes(name)) return "gone";
  if (state.roster.length >= CONFIG.maxSeats) return "full";
  if (!canSpend(state, hirePrice(state, name))) return "money";
  state.cash -= hirePrice(state, name);
  state.stats.spent += hirePrice(state, name);
  state.roster.push(name);
  state.hireOffers = state.hireOffers.filter((n) => n !== name);
  state.stats.hires += 1;
  trackHire(state);
  // They shoot this shift, last (but before an Encore turn).
  const encoreAtEnd = state.crew.length > 1 && state.crew[state.crew.length - 1] === "You" && state.crew.filter((n) => n === "You").length > 1;
  const at = encoreAtEnd ? state.crew.length - 1 : state.crew.length;
  state.crew.splice(Math.max(at, state.shooterIndex), 0, name);
  if (state.onBreak && state.crew[state.shooterIndex] === name) setupTurn(state, state.crew[state.shooterIndex - 1] || null, state.prevShooterMult);
  return "ok";
}

// After a roll: a seven-out passes the dice and starts a Dealer Break.
// Otherwise, check whether you just went broke.
function afterRoll(state, sevenOut) {
  if (sevenOut) {
    const prevName = state.crew[state.shooterIndex];
    state.prevShooterMult = state.mult;
    state.sevenOutBy = prevName;
    state.shooterIndex += 1;
    payInterest(state);
    // Broke with no way to pay off the debt: fall right away, no break.
    if (isBroke(state) && state.cash < amountOwed(state)) {
      fall(state, "fell-broke");
      return;
    }
    state.onBreak = true;
    if (!isFinalBreak(state)) setupTurn(state, prevName, state.mult);
    state.stock = newStock(state); // fresh cards at every Dealer Break
    state.compStock = newCompStock(state);
    state.hireOffers = newHireOffers(state);
  } else if (isBroke(state)) {
    fall(state, "fell-broke");
  }
}

// Leaving a Dealer Break: the final break is judged; otherwise the
// next shooter steps up, as long as you can still cover the Pass Line.
function endBreak(state) {
  state.onBreak = false;
  if (isFinalBreak(state)) {
    fall(state, "fell-short"); // reaching here means the debt isn't paid
  } else if (isBroke(state)) {
    fall(state, "fell-broke");
  }
}
