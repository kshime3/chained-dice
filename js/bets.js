// Bet logic: who wins and how much. No screen code here.
// "winnings" is profit only. The original bet is not included.
// "point" is the current point number, or null on a come-out roll.

// Field: a one-roll bet. Wins or loses on every roll.
function resolveField(amount, total) {
  const payout = CONFIG.fieldPayouts[total];
  if (payout) {
    return { outcome: "win", winnings: amount * payout };
  }
  return { outcome: "lose", winnings: 0 };
}

// Pass Line. On the come-out: 7/11 win, 2/3/12 lose.
// With a point on: the point wins, a 7 loses. Anything else: no decision.
function resolvePassLine(amount, total, point) {
  if (point === null) {
    if (CONFIG.comeOutWinners.includes(total)) {
      return { outcome: "win", winnings: amount * CONFIG.passLinePayout };
    }
    if (CONFIG.comeOutLosers.includes(total)) {
      return { outcome: "lose", winnings: 0 };
    }
    return { outcome: "none", winnings: 0 };
  }
  if (total === point) return { outcome: "win", winnings: amount * CONFIG.passLinePayout };
  if (total === CONFIG.sevenOut) return { outcome: "lose", winnings: 0 };
  return { outcome: "none", winnings: 0 };
}

// Odds: only exist while a point is on. Pay true odds, rounded down.
function resolveOdds(amount, total, point) {
  if (total === point) {
    const [win, per] = CONFIG.oddsPayouts[point];
    return { outcome: "win", winnings: Math.floor((amount * win) / per) };
  }
  if (total === CONFIG.sevenOut) return { outcome: "lose", winnings: 0 };
  return { outcome: "none", winnings: 0 };
}

// Don't Pass: the shooter's opposite. Come-out: 2/3 win, 7/11 lose, 12 is a tie.
// With a point on: a 7 wins, the point loses. Anything else: no decision.
function resolveDontPass(amount, total, point) {
  if (point === null) {
    if (CONFIG.dontComeOutWinners.includes(total)) return { outcome: "win", winnings: amount };
    if (CONFIG.comeOutWinners.includes(total)) return { outcome: "lose", winnings: 0 };
    return { outcome: "none", winnings: 0 }; // a 12 (tie) or a new point
  }
  if (total === CONFIG.sevenOut) return { outcome: "win", winnings: amount };
  if (total === point) return { outcome: "lose", winnings: 0 };
  return { outcome: "none", winnings: 0 };
}

// Lay Odds: win when the 7 comes before the point. Pays true odds, rounded down.
function resolveLay(amount, total, point) {
  if (total === CONFIG.sevenOut) {
    const [win, per] = CONFIG.layPayouts[point];
    return { outcome: "win", winnings: Math.floor((amount * win) / per) };
  }
  if (total === point) return { outcome: "lose", winnings: 0 };
  return { outcome: "none", winnings: 0 };
}

// The most you can lay: enough to win up to 3-4-5x your Don't Pass bet.
function maxLay(dontAmount, point) {
  const [win, per] = CONFIG.layPayouts[point];
  return Math.floor((dontAmount * CONFIG.oddsMaxMultiple[point] * per) / win);
}

// The most you can have on Odds for this Pass Line bet and point.
function maxOdds(passAmount, point) {
  return passAmount * CONFIG.oddsMaxMultiple[point];
}

// What the point is after this roll (null means back to a come-out roll).
function nextPoint(point, total) {
  if (point === null) {
    return CONFIG.pointNumbers.includes(total) ? total : null;
  }
  if (total === point || total === CONFIG.sevenOut) return null;
  return point;
}

// Settle every bet on the table for one roll.
// bets looks like { pass: 10, odds: 20, dont: 0, lay: 0, field: 5 }. Empty bets (0) are skipped.
// Bets with no decision this roll are left out of the results.
// staysUp: whether a winning bet stays on the table (Odds come back to you).
function resolveRoll(bets, total, point) {
  const results = [];
  if (bets.pass > 0) {
    results.push({ bet: "pass", amount: bets.pass, staysUp: true, ...resolvePassLine(bets.pass, total, point) });
  }
  if (bets.odds > 0 && point !== null) {
    results.push({ bet: "odds", amount: bets.odds, staysUp: false, ...resolveOdds(bets.odds, total, point) });
  }
  if (bets.dont > 0) {
    results.push({ bet: "dont", amount: bets.dont, staysUp: true, ...resolveDontPass(bets.dont, total, point) });
  }
  if (bets.lay > 0 && point !== null) {
    results.push({ bet: "lay", amount: bets.lay, staysUp: false, ...resolveLay(bets.lay, total, point) });
  }
  if (bets.field > 0) {
    results.push({ bet: "field", amount: bets.field, staysUp: true, ...resolveField(bets.field, total) });
  }
  return results.filter((r) => r.outcome !== "none");
}
