// Shift logic: turns, paying the dealer, and win/fall checks. No screen code here.

// A fresh shift: wake up at the table with the buy-in.
function newShiftState() {
  return {
    kitty: CONFIG.buyIn, // money in your hand, not on the table
    deposited: 0, // paid to the dealer: safe, but out of play
    bets: { pass: 0, odds: 0, field: 0 },
    point: null, // null means the next roll is a come-out roll
    shooterIndex: 0, // seat number of the current shooter (0 = first seat)
    onBreak: true, // a Dealer break happens before each shooter and once at the end
    status: "playing", // "playing", "won", "fell-broke", or "fell-short"
    lastRoll: null,
  };
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

// Pay the dealer from your kitty. Never more than you have or still owe.
// Returns how much was actually paid. Paying in full wins the shift.
function deposit(state, amount) {
  const paid = Math.min(amount, state.kitty, amountOwed(state));
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

// After a roll: a seven-out passes the dice and starts a Dealer break.
// Otherwise, check whether you just went broke.
function afterRoll(state, sevenOut) {
  if (sevenOut) {
    state.shooterIndex += 1;
    state.onBreak = true;
  } else if (isBroke(state)) {
    state.status = "fell-broke";
  }
}

// Leaving a Dealer break: the final break is judged; otherwise the
// next shooter steps up, as long as you can still cover the Pass Line.
function endBreak(state) {
  state.onBreak = false;
  if (isFinalBreak(state)) {
    state.status = "fell-short"; // reaching here means the debt isn't paid
  } else if (isBroke(state)) {
    state.status = "fell-broke";
  }
}
