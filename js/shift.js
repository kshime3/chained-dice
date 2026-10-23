// Shift logic: turns, target, and win/fall checks. No screen code here.

// A fresh shift: wake up at the table with the buy-in.
function newShiftState() {
  return {
    bankroll: CONFIG.buyIn, // money in your hand, not on the table
    bets: { pass: 0, odds: 0, field: 0 },
    point: null, // null means the next roll is a come-out roll
    shooterIndex: 0, // seat number of the current shooter (0 = first seat)
    status: "playing", // "playing", "won", "fell-broke", or "fell-short"
    lastRoll: null,
  };
}

// All your money: in hand plus everything on the table.
function totalMoney(state) {
  const b = state.bets;
  return state.bankroll + b.pass + b.odds + b.field;
}

// The Pass Line must be played. On a come-out you need the minimum on it.
function canRoll(state) {
  return state.point !== null || state.bets.pass >= CONFIG.tableMinimum;
}

// Broke: on a come-out, you can't cover the minimum Pass Line bet.
function isBroke(state) {
  return state.point === null && totalMoney(state) < CONFIG.tableMinimum;
}

// Check where the shift stands after a roll.
// sevenOut: whether this roll was a seven-out.
function updateShift(state, sevenOut) {
  if (totalMoney(state) >= CONFIG.shiftTarget) {
    state.status = "won";
    return;
  }
  if (sevenOut) state.shooterIndex += 1;
  if (isBroke(state)) {
    state.status = "fell-broke";
  } else if (state.shooterIndex >= CONFIG.crew.length) {
    state.status = "fell-short";
  }
}
