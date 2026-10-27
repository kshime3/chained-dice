// Run stats: everything the end-of-run screen shows. No screen code here.
// Stats live in state.stats and carry over from shift to shift.

function newStats() {
  const totals = {};
  const expected = {};
  for (let t = 2; t <= 12; t++) { totals[t] = 0; expected[t] = 0; }
  return {
    rolls: 0,
    totals: totals,       // how many times each total came up
    expected: expected,   // how many times each total "should" have, from the dice odds at the time
    doubles: 0,
    pointsHit: 0,
    sevenOuts: 0,
    noSevenRun: 0,        // rolls in a row without a 7, right now
    bestNoSeven: 0,       // the longest such run
    longestTurn: { name: "", rolls: 0 },
    biggestHit: { amount: 0, roll: 0, name: "" },
    biggestLoss: { amount: 0, roll: 0, name: "" },
    totalWon: 0,
    totalLost: 0,
    paid: 0,
    interest: 0,
    spent: 0,             // cards, Shuffles and Trapdoors
    maxMult: 1,
    byShooter: {},        // money made (or lost) during each shooter's turns
    history: [],          // money in play after every roll, for the chart
    shiftStarts: [0],     // where each shift begins in history
  };
}

// Record one settled roll.
// net: how much your money in play changed on this roll (wins, losses, bonuses, charges).
// odds: the chance of each total for this roll. multUsed: the mult that paid out.
function recordRoll(stats, state, rolled, net, sevenOut, pointHit, odds, multUsed, shooter, turnRolls) {
  stats.rolls += 1;
  stats.totals[rolled.total] += 1;
  for (let t = 2; t <= 12; t++) stats.expected[t] += odds[t];
  if (rolled.dice[0] === rolled.dice[1]) stats.doubles += 1;
  if (pointHit) stats.pointsHit += 1;

  if (rolled.total === CONFIG.sevenOut) stats.noSevenRun = 0;
  else stats.bestNoSeven = Math.max(stats.bestNoSeven, ++stats.noSevenRun);

  if (sevenOut) {
    stats.sevenOuts += 1;
    if (turnRolls > stats.longestTurn.rolls) stats.longestTurn = { name: shooter, rolls: turnRolls };
  }

  if (net > 0) stats.totalWon += net;
  if (net < 0) stats.totalLost -= net;
  if (net > stats.biggestHit.amount) stats.biggestHit = { amount: net, roll: stats.rolls, name: shooter };
  if (-net > stats.biggestLoss.amount) stats.biggestLoss = { amount: -net, roll: stats.rolls, name: shooter };
  stats.byShooter[shooter] = (stats.byShooter[shooter] || 0) + net;
  stats.maxMult = Math.max(stats.maxMult, multUsed);
  stats.history.push(totalMoney(state));
}

// The shooter who made you the most money, e.g. { name: "Hot Rod", amount: 120 }.
function bestShooter(stats) {
  let best = null;
  for (const [name, amount] of Object.entries(stats.byShooter)) {
    if (!best || amount > best.amount) best = { name: name, amount: amount };
  }
  return best;
}
