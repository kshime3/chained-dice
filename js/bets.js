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

// The table's bets. Come and Don't Come bets move to a number ("come6", "dcome6") once it rolls.
const POINT_NUMBERS = [4, 5, 6, 8, 9, 10];
function emptyBets() {
  const bets = { pass: 0, odds: 0, dont: 0, lay: 0, field: 0, come: 0, dontCome: 0, fire: 0 };
  for (const n of [4, 6, 8, 10]) bets["hard" + n] = 0;
  for (const n of POINT_NUMBERS) {
    bets["place" + n] = 0;
    bets["come" + n] = 0;
    bets["dcome" + n] = 0;
  }
  return bets;
}

// Bets you can take back (or move onto a line bet). Come bets on a number and
// the Fire Bet are locked in, like a line bet once the point is on.
function looseBets() {
  return ["field", "odds", "lay", "come", "dontCome"].concat([4, 6, 8, 10].map((n) => "hard" + n), POINT_NUMBERS.map((n) => "place" + n));
}

// Everything on the table added up.
function betsTotal(bets) {
  return Object.values(bets).reduce((sum, x) => sum + x, 0);
}

// Hard Ways: the number as a pair (2+2 for a hard 4) before a 7 or the "easy" way. Off on come-outs.
function resolveHardWay(amount, n, dice, point) {
  if (point === null) return { outcome: "none", winnings: 0 };
  const total = dice[0] + dice[1];
  if (total === n && dice[0] === dice[1]) return { outcome: "win", winnings: amount * CONFIG.hardWaysPayouts[n] };
  if (total === n || total === CONFIG.sevenOut) return { outcome: "lose", winnings: 0 };
  return { outcome: "none", winnings: 0 };
}

// Place bets: the number before a 7. They stay up and keep paying. Off on come-outs.
function resolvePlace(amount, n, total, point) {
  if (point === null) return { outcome: "none", winnings: 0 };
  if (total === n) {
    const [win, per] = CONFIG.placePayouts[n];
    return { outcome: "win", winnings: Math.floor((amount * win) / per) };
  }
  if (total === CONFIG.sevenOut) return { outcome: "lose", winnings: 0 };
  return { outcome: "none", winnings: 0 };
}

// Come: its own come-out. 7/11 win, 2/3/12 lose, a point number moves it there.
function resolveCome(amount, total) {
  if (CONFIG.comeOutWinners.includes(total)) return { outcome: "win", winnings: amount };
  if (CONFIG.comeOutLosers.includes(total)) return { outcome: "lose", winnings: 0 };
  return { outcome: "move", to: "come" + total, winnings: 0 };
}

// Don't Come: the opposite. 2/3 win, 7/11 lose, 12 ties, a point number moves it there.
function resolveDontCome(amount, total) {
  if (CONFIG.dontComeOutWinners.includes(total)) return { outcome: "win", winnings: amount };
  if (CONFIG.comeOutWinners.includes(total)) return { outcome: "lose", winnings: 0 };
  if (POINT_NUMBERS.includes(total)) return { outcome: "move", to: "dcome" + total, winnings: 0 };
  return { outcome: "none", winnings: 0 };
}

// Fire Bet: pays when one shooter makes 4, 5 or 6 different points. Settled at the
// seven-out (or right away on the 6th point). firePoints: different points made so far this turn.
function resolveFire(amount, total, point, firePoints) {
  const made = point !== null && total === point && !firePoints.includes(point) ? firePoints.length + 1 : firePoints.length;
  if (made >= 6) return { outcome: "win", winnings: amount * CONFIG.firePayouts[6] };
  if (point !== null && total === CONFIG.sevenOut) {
    return made >= 4 ? { outcome: "win", winnings: amount * CONFIG.firePayouts[made] } : { outcome: "lose", winnings: 0 };
  }
  return { outcome: "none", winnings: 0 };
}

// Settle every bet on the table for one roll.
// Empty bets (0) are skipped. Bets with no decision this roll are left out of the results.
// staysUp: whether a winning bet stays on the table (Odds come back to you).
// extra: { dice, firePoints } for Hard Ways and the Fire Bet (optional).
function resolveRoll(bets, total, point, extra = {}) {
  const results = [];
  const dice = extra.dice || [Math.floor(total / 2), total - Math.floor(total / 2)];
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
  for (const n of [4, 6, 8, 10]) {
    const amount = bets["hard" + n] || 0;
    if (amount > 0) results.push({ bet: "hard" + n, amount: amount, staysUp: true, ...resolveHardWay(amount, n, dice, point) });
  }
  for (const n of POINT_NUMBERS) {
    const place = bets["place" + n] || 0;
    if (place > 0) results.push({ bet: "place" + n, amount: place, staysUp: true, ...resolvePlace(place, n, total, point) });
    // Come bets sitting on a number: the number wins, a 7 loses (Don't Come: the other way round).
    const come = bets["come" + n] || 0;
    if (come > 0 && (total === n || total === CONFIG.sevenOut)) {
      results.push({ bet: "come" + n, amount: come, staysUp: false, outcome: total === n ? "win" : "lose", winnings: total === n ? come : 0 });
    }
    const dcome = bets["dcome" + n] || 0;
    if (dcome > 0 && (total === n || total === CONFIG.sevenOut)) {
      results.push({ bet: "dcome" + n, amount: dcome, staysUp: false, outcome: total === CONFIG.sevenOut ? "win" : "lose", winnings: total === CONFIG.sevenOut ? dcome : 0 });
    }
  }
  if (bets.come > 0) results.push({ bet: "come", amount: bets.come, staysUp: false, ...resolveCome(bets.come, total) });
  if (bets.dontCome > 0) results.push({ bet: "dontCome", amount: bets.dontCome, staysUp: false, ...resolveDontCome(bets.dontCome, total) });
  if (bets.fire > 0) results.push({ bet: "fire", amount: bets.fire, staysUp: false, ...resolveFire(bets.fire, total, point, extra.firePoints || []) });
  return results.filter((r) => r.outcome !== "none");
}

// Pay winners, remove losers and move Come bets. Shared by the game and the simulator.
function settleResults(state, results) {
  for (const r of results) {
    if (r.outcome === "win") {
      state.cash += r.winnings;
      if (!r.staysUp) {
        state.cash += r.amount; // bet comes back to you
        state.bets[r.bet] = 0;
      }
    }
    if (r.outcome === "lose") state.bets[r.bet] = 0;
    if (r.outcome === "move") {
      state.bets[r.to] += r.amount;
      state.bets[r.bet] = 0;
    }
  }
}

// What the NEXT roll does for a bet, for the table's plain-English hints.
// Returns { wins: [totals], loses: [totals], note } or null when the bet isn't working right now.
function nextRollOutcomes(bet, point) {
  const fieldWins = Object.keys(CONFIG.fieldPayouts).map(Number);
  const all = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  if (bet === "field") return { wins: fieldWins, loses: all.filter((t) => !fieldWins.includes(t)) };
  if (bet === "pass" || bet === "come") {
    if (bet === "pass" && point !== null) return { wins: [point], loses: [CONFIG.sevenOut] };
    return { wins: CONFIG.comeOutWinners.slice(), loses: CONFIG.comeOutLosers.slice() };
  }
  if (bet === "dont" || bet === "dontCome") {
    if (bet === "dont" && point !== null) return { wins: [CONFIG.sevenOut], loses: [point] };
    return { wins: CONFIG.dontComeOutWinners.slice(), loses: CONFIG.comeOutWinners.slice(), note: "12 ties" };
  }
  if (bet === "odds") return point === null ? null : { wins: [point], loses: [CONFIG.sevenOut] };
  if (bet === "lay") return point === null ? null : { wins: [CONFIG.sevenOut], loses: [point] };
  const place = bet.match(/^place(\d+)$/);
  if (place) return point === null ? null : { wins: [Number(place[1])], loses: [CONFIG.sevenOut] };
  const hard = bet.match(/^hard(\d+)$/);
  if (hard) {
    const n = Number(hard[1]);
    return point === null ? null : { wins: [n], loses: [CONFIG.sevenOut, n], note: n / 2 + "+" + n / 2 + " only" };
  }
  return null;
}
