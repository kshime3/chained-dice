// Card logic: what each shop card does. No screen code here.
// Card numbers and rarity live in config.js.

const CARDS = {
  hotHand:     { name: "Hot Hand",        text: "+0.5x mult for every winning roll in a row. Resets on a roll with no win." },
  snakeEyes:   { name: "Snake Eyes",      text: "Rolling a 2 pays a bonus of 10% of the debt." },
  luckySeven:  { name: "Lucky Seven",     text: "A 7 on the come-out pays a bonus of 5% of the debt." },
  rattlesnake: { name: "Rattlesnake",     text: "Rolling snake eyes (1+1) adds +1x mult for the rest of this shooter's turn." },
  redDice:     { name: "Red Dice",        text: "Craps (2, 3, 12) on the come-out wins the Pass Line at even money instead of losing." },
  oddsAddict:  { name: "Odds Addict",     text: "Odds bets pay 50% extra." },
  pity:        { name: "Pit Boss's Pity", text: "The first seven-out of the shift (any shooter) is ignored. Pass Line and Odds stay, and the shooter keeps rolling." },
  muggsy:      { name: "Muggsy",          text: "A 7 right after the point is set costs double. But the next shooter's winnings are x2 for their whole turn." },
};

function hasCard(state, id) {
  return state.cards.includes(id);
}

// Round to the nearest $5, never below $5.
function roundTo5(n) {
  return Math.max(5, Math.round(n / 5) * 5);
}

// The mult actually used for payouts: shooter mult + Hot Hand, times Muggsy's x2.
function effectiveMult(state) {
  const hotHand = hasCard(state, "hotHand") ? state.hotStreak * CONFIG.hotHandPerWin : 0;
  return (state.mult + hotHand) * state.payoutX;
}

// Why the mult is what it is, e.g. ["Mentor: +1x from Hot Rod's streak", "Hot Hand: +1x"].
function multReasons(state) {
  const reasons = state.multNotes.slice();
  if (hasCard(state, "hotHand") && state.hotStreak > 0) {
    reasons.push("Hot Hand: +" + state.hotStreak * CONFIG.hotHandPerWin + "x");
  }
  return reasons;
}

// Charge losing Pass Line and Odds bets again (times - 1 more), never below the
// $5 minimum. Used by Hot Rod and Muggsy. Returns the amount charged.
function chargeExtra(state, results, times) {
  const lost = results.filter((r) => r.outcome === "lose" && r.bet !== "field")
    .reduce((sum, r) => sum + r.amount, 0);
  const extra = Math.min(lost * (times - 1), Math.max(0, state.kitty - CONFIG.tableMinimum));
  state.kitty -= extra;
  return extra;
}

// Cards that change results before anyone is paid.
// Returns { notes, pity } where pity means the seven-out was ignored.
function applyCardsBeforePayout(state, results, total, pointBefore) {
  const notes = [];
  let pity = false;

  // Red Dice: come-out craps wins instead of losing.
  if (hasCard(state, "redDice") && pointBefore === null && CONFIG.comeOutLosers.includes(total)) {
    for (const r of results) {
      if (r.bet === "pass" && r.outcome === "lose") {
        r.outcome = "win";
        r.winnings = r.amount * CONFIG.passLinePayout;
        notes.push("Red Dice: craps pays!");
      }
    }
  }

  // Pit Boss's Pity: the first seven-out of the shift doesn't count.
  if (hasCard(state, "pity") && !state.pityUsed && pointBefore !== null && total === CONFIG.sevenOut) {
    state.pityUsed = true;
    pity = true;
    for (const r of results) {
      if (r.bet === "pass" || r.bet === "odds") r.outcome = "none";
    }
    notes.push("Pit Boss's Pity: that seven-out is ignored! Your bets stay and the shooter keeps rolling.");
  }

  // Odds Addict: Odds winnings +50%.
  if (hasCard(state, "oddsAddict")) {
    for (const r of results) {
      if (r.bet === "odds" && r.outcome === "win") {
        r.winnings = Math.floor(r.winnings * (1 + CONFIG.oddsAddictExtra));
      }
    }
  }

  // Bets that no longer have a decision drop out of the results.
  const kept = results.filter((r) => r.outcome !== "none");
  results.length = 0;
  results.push(...kept);
  return { notes, pity };
}

// Cards that react after the roll is paid. Returns sentences for the message.
function applyCardsAfterRoll(state, results, total, pointBefore, sevenOut) {
  const notes = [];
  const won = results.some((r) => r.outcome === "win");

  if (hasCard(state, "snakeEyes") && total === 2) {
    const bonus = roundTo5(CONFIG.snakeEyesBonusPct * CONFIG.shiftTarget);
    state.kitty += bonus;
    notes.push("Snake Eyes: +$" + bonus + " bonus.");
  }
  if (hasCard(state, "luckySeven") && pointBefore === null && total === 7) {
    const bonus = roundTo5(CONFIG.luckySevenBonusPct * CONFIG.shiftTarget);
    state.kitty += bonus;
    notes.push("Lucky Seven: +$" + bonus + " bonus.");
  }
  if (hasCard(state, "rattlesnake") && total === 2) {
    state.mult += CONFIG.rattlesnakeMult;
    state.rattleGain += CONFIG.rattlesnakeMult;
    setMultNote(state, "Rattlesnake", "Rattlesnake: +" + state.rattleGain + "x");
    notes.push("Rattlesnake: +" + CONFIG.rattlesnakeMult + "x mult for this shooter.");
  }

  // Hot Hand streak (tracked always, only counts if you own the card).
  state.hotStreak = won ? state.hotStreak + 1 : 0;
  if (hasCard(state, "hotHand") && won) {
    notes.push("Hot Hand: " + state.hotStreak + " in a row (+" + state.hotStreak * CONFIG.hotHandPerWin + "x).");
  }

  // Muggsy: a 7 on the very next roll after the point was set.
  if (pointBefore !== null) state.rollsSincePoint += 1;
  if (hasCard(state, "muggsy") && sevenOut && state.rollsSincePoint === 1) {
    const extra = chargeExtra(state, results, CONFIG.muggsyCost);
    state.muggsyPending = true;
    notes.push("Muggsy: point-7! " + (extra > 0 ? "Another $" + extra + " from your kitty. " : "") +
      "The next shooter's winnings are x" + CONFIG.muggsyNextShooterX + ".");
  }
  if (pointBefore === null && state.point !== null) state.rollsSincePoint = 0;

  return notes;
}
