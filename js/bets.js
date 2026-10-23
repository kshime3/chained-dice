// Bet logic: who wins and how much. No screen code here.
// "winnings" is profit only. The original bet is not included.

// Field: a one-roll bet. Wins or loses on every roll.
function resolveField(amount, total) {
  const payout = CONFIG.fieldPayouts[total];
  if (payout) {
    return { outcome: "win", winnings: amount * payout };
  }
  return { outcome: "lose", winnings: 0 };
}

// Pass Line on the come-out roll.
// Milestone 1 only handles the come-out. A point number leaves the bet up.
function resolvePassComeOut(amount, total) {
  if (CONFIG.comeOutWinners.includes(total)) {
    return { outcome: "win", winnings: amount * CONFIG.passLinePayout };
  }
  if (CONFIG.comeOutLosers.includes(total)) {
    return { outcome: "lose", winnings: 0 };
  }
  return { outcome: "point", winnings: 0, point: total };
}

// Settle every bet on the table for one roll.
// bets looks like { pass: 10, field: 5 }. Empty bets (0) are skipped.
function resolveRoll(bets, total) {
  const results = [];
  if (bets.pass > 0) {
    results.push({ bet: "pass", amount: bets.pass, ...resolvePassComeOut(bets.pass, total) });
  }
  if (bets.field > 0) {
    results.push({ bet: "field", amount: bets.field, ...resolveField(bets.field, total) });
  }
  return results;
}
