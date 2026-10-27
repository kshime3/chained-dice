// Shift logic: turns, paying the dealer, and win/fall checks. No screen code here.

// Cash and debt for shift n (1 = the first shift).
function shiftScale(n) {
  const table = CONFIG.shifts;
  if (n <= table.length) return table[n - 1];
  let scale = table[table.length - 1];
  for (let k = table.length + 1; k <= n; k++) {
    scale = {
      cash: scale.cash + CONFIG.laterCashStep,
      debt: Math.round((scale.debt * CONFIG.laterDebtGrowth) / 50) * 50,
    };
  }
  return scale;
}

// A fresh run: wake up at the table for shift 1.
function newShiftState() {
  const state = {
    shift: 1, // which shift of the run this is
    debt: shiftScale(1).debt, // what the dealer wants this shift
    kitty: shiftScale(1).cash, // money in your hand, not on the table
    cashAdded: shiftScale(1).cash, // cash the pit boss added at the start of this shift
    deposited: 0, // paid to the dealer: safe, but out of play
    bets: { pass: 0, odds: 0, dont: 0, lay: 0, field: 0 },
    point: null, // null means the next roll is a come-out roll
    shooterIndex: 0, // seat number of the current shooter (0 = first seat)
    onBreak: true, // a Dealer Break happens before each shooter and once at the end
    status: "playing", // "playing", "won", "fell-broke", or "fell-short"
    lastRoll: null,
    crew: CONFIG.crew.slice(), // seats still at the table (a Trapdoor removes one)
    dice: diceForShooter(CONFIG.crew[0]), // current shooter's dice
    mult: CONFIG.startingMult, // multiplies winnings this turn
    multNotes: [], // why the mult is what it is (synergies)
    coldTable: false, // true until this shooter's first win, after Jinx
    hotRodPenaltyUsed: false, // Hot Rod's double-cost seven-out happens once a shift
    payoutX: 1, // Muggsy's x2 on the next shooter's winnings
    hotRodGain: 0, // mult Hot Rod has built up this turn
    rattleGain: 0, // mult Rattlesnake has added this turn
    turnRolls: 0, // rolls in the current shooter's turn (Doubles Charm)
    loadedDieUsed: false, // Loaded Die works once a shift
    rerollUsed: false, // Reroll works once per shooter
    prevShooterMult: 1, // the last shooter's final mult (for Mentor if a seat is cut)
    savedByLink: false, // true if the Spare Link saved this shift
    endless: false, // true after "Double or nothing": the chain is gone, play for score
    extraLinks: 0, // links added by Dealer's Bargain (more shifts to walk free)
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
  state.stock = newStock(state);
  return state;
}

// Money still in play: kitty plus everything on the table (not deposits).
function totalMoney(state) {
  const b = state.bets;
  return state.kitty + b.pass + b.odds + b.dont + b.lay + b.field;
}

function amountOwed(state) {
  return state.debt - state.deposited;
}

// True once every shooter has had a turn.
function isFinalBreak(state) {
  return state.shooterIndex >= state.crew.length;
}

// A line bet (Pass Line or Don't Pass) must be played. On a come-out you need the minimum on one.
function canRoll(state) {
  return state.point !== null || state.bets.pass >= CONFIG.tableMinimum || state.bets.dont >= CONFIG.tableMinimum;
}

// Broke: on a come-out, you can't cover the minimum Pass Line bet.
function isBroke(state) {
  return state.point === null && totalMoney(state) < CONFIG.tableMinimum;
}

// The most you can pay right now. You always keep enough in your kitty
// for the minimum Pass Line bet, unless this payment clears the debt.
function maxDeposit(state) {
  const owed = amountOwed(state);
  if (state.kitty >= owed) return owed;
  return Math.max(0, state.kitty - CONFIG.tableMinimum);
}

// Pay the dealer from your kitty, up to maxDeposit.
// Returns how much was actually paid. Paying in full wins the shift.
function deposit(state, amount) {
  const paid = Math.min(amount, maxDeposit(state));
  if (paid <= 0) return 0;
  state.kitty -= paid;
  state.deposited += paid;
  state.stats.paid += paid;
  if (state.deposited >= state.debt) state.status = "won";
  return paid;
}

// Put money on a line bet ("pass" or "dont"). If your kitty is short, the rest is
// moved from your other bets (Field first, then Odds, then Lay Odds).
// Returns the list of moves made, e.g. [{ from: "field", amount: 5 }],
// or null if you can't cover it at all.
function fundPassLine(state, amount, line = "pass") {
  const b = state.bets;
  if (state.kitty + b.field + b.odds + b.lay < amount) return null;
  const moves = [];
  const fromKitty = Math.min(state.kitty, amount);
  state.kitty -= fromKitty;
  let short = amount - fromKitty;
  for (const bet of ["field", "odds", "lay"]) {
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

// Interest: a share of everything you've paid, into your kitty (rounded down).
function payInterest(state) {
  state.lastInterest = Math.floor(state.deposited * state.interestRate);
  state.kitty += state.lastInterest;
  state.stats.interest += state.lastInterest;
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
    return;
  }
  state.status = reason;
}

// Trapdoor (the code calls it cutChain): price, who can be dropped, and doing it.
function cutChainPrice(state) {
  return roundTo5(CONFIG.cutChainPct * state.debt);
}

// Only crew who haven't shot yet this shift, never You.
function cuttableCrew(state) {
  return state.crew.filter((name, i) => i >= state.shooterIndex && name !== "You");
}

function cutChain(state, name) {
  if (!cuttableCrew(state).includes(name)) return "not-allowed";
  if (!canSpend(state, cutChainPrice(state))) return "money";
  state.kitty -= cutChainPrice(state);
  state.stats.spent += cutChainPrice(state);
  removeCrew(state, name);
  return "ok";
}

// Take a crew member off the table for the rest of the run (Trapdoor, phone perk).
function removeCrew(state, name) {
  const wasNext = state.crew[state.shooterIndex] === name;
  state.crew = state.crew.filter((n) => n !== name);
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
  state.cashAdded = scale.cash;
  state.kitty = totalMoney(old) + scale.cash; // bets left on the table come back to you
  state.cards = old.cards.slice();
  state.crew = old.crew.slice();
  state.interestRate = old.interestRate;
  state.stats = old.stats;
  state.perks = old.perks.slice();
  state.endless = old.endless;
  state.extraLinks = old.extraLinks;
  state.freeBuys = old.freeBuys;
  state.stats.shiftStarts.push(state.stats.history.length);
  setupTurn(state, null, CONFIG.startingMult);
  state.stock = newStock(state);
  return state;
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
    if (isBroke(state) && state.kitty < amountOwed(state)) {
      fall(state, "fell-broke");
      return;
    }
    state.onBreak = true;
    if (!isFinalBreak(state)) setupTurn(state, prevName, state.mult);
    state.stock = newStock(state); // fresh cards at every Dealer Break
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
