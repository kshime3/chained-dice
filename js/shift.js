// Shift logic: turns, paying the dealer, and win/fall checks. No screen code here.

// A fresh shift: wake up at the table with the buy-in.
function newShiftState() {
  const state = {
    kitty: CONFIG.buyIn, // money in your hand, not on the table
    deposited: 0, // paid to the dealer: safe, but out of play
    bets: { pass: 0, odds: 0, field: 0 },
    point: null, // null means the next roll is a come-out roll
    shooterIndex: 0, // seat number of the current shooter (0 = first seat)
    onBreak: true, // a Dealer Break happens before each shooter and once at the end
    status: "playing", // "playing", "won", "fell-broke", or "fell-short"
    lastRoll: null,
    dice: diceForShooter(CONFIG.crew[0]), // current shooter's dice
    mult: CONFIG.startingMult, // multiplies winnings this turn
    multNotes: [], // why the mult is what it is (synergies)
    coldTable: false, // true until this shooter's first win, after Jinx
    hotRodPenaltyUsed: false, // Hot Rod's double-cost seven-out happens once a shift
    payoutX: 1, // Muggsy's x2 on the next shooter's winnings
    hotRodGain: 0, // mult Hot Rod has built up this turn
    rattleGain: 0, // mult Rattlesnake has added this turn
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
  return state.kitty + b.pass + b.odds + b.field;
}

function amountOwed(state) {
  return CONFIG.shiftTarget - state.deposited;
}

// True once every shooter has had a turn.
function isFinalBreak(state) {
  return state.shooterIndex >= CONFIG.crew.length;
}

// The Pass Line must be played. On a come-out you need the minimum on it.
function canRoll(state) {
  return state.point !== null || state.bets.pass >= CONFIG.tableMinimum;
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
  if (state.deposited >= CONFIG.shiftTarget) state.status = "won";
  return paid;
}

// Put money on the Pass Line. If your kitty is short, the rest is
// moved from your other bets (Field first, then Odds).
// Returns the list of moves made, e.g. [{ from: "field", amount: 5 }],
// or null if you can't cover it at all.
function fundPassLine(state, amount) {
  const b = state.bets;
  if (state.kitty + b.field + b.odds < amount) return null;
  const moves = [];
  const fromKitty = Math.min(state.kitty, amount);
  state.kitty -= fromKitty;
  let short = amount - fromKitty;
  for (const bet of ["field", "odds"]) {
    const take = Math.min(b[bet], short);
    if (take > 0) {
      b[bet] -= take;
      short -= take;
      moves.push({ from: bet, amount: take });
    }
  }
  b.pass += amount;
  return moves;
}

// Interest: a share of everything you've paid, into your kitty (rounded down).
function payInterest(state) {
  state.lastInterest = Math.floor(state.deposited * state.interestRate);
  state.kitty += state.lastInterest;
  return state.lastInterest;
}

// After a roll: a seven-out passes the dice and starts a Dealer Break.
// Otherwise, check whether you just went broke.
function afterRoll(state, sevenOut) {
  if (sevenOut) {
    const prevName = CONFIG.crew[state.shooterIndex];
    state.sevenOutBy = prevName;
    state.shooterIndex += 1;
    payInterest(state);
    // Broke with no way to pay off the debt: fall right away, no break.
    if (isBroke(state) && state.kitty < amountOwed(state)) {
      state.status = "fell-broke";
      return;
    }
    state.onBreak = true;
    if (!isFinalBreak(state)) setupTurn(state, prevName, state.mult);
    state.stock = newStock(state); // fresh cards at every Dealer Break
  } else if (isBroke(state)) {
    state.status = "fell-broke";
  }
}

// Leaving a Dealer Break: the final break is judged; otherwise the
// next shooter steps up, as long as you can still cover the Pass Line.
function endBreak(state) {
  state.onBreak = false;
  if (isFinalBreak(state)) {
    state.status = "fell-short"; // reaching here means the debt isn't paid
  } else if (isBroke(state)) {
    state.status = "fell-broke";
  }
}
