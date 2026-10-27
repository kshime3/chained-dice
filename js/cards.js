// Card logic: what each shop card does. No screen code here.
// Card numbers and rarity live in config.js.

const CARDS = {
  hotHand:     { name: "Hot Hand",        text: "+0.5x mult for every winning roll in a row. Resets when a roll loses you a bet without winning one." },
  snakeEyes:   { name: "Snake Eyes",      text: "Rolling a 2 pays a bonus of 10% of the debt." },
  luckySeven:  { name: "Lucky Seven",     text: "A 7 on the come-out pays a bonus of 5% of the debt." },
  rattlesnake: { name: "Rattlesnake",     text: "Rolling snake eyes (1+1) adds +1x mult for the rest of this shooter's turn." },
  redDice:     { name: "Red Dice",        text: "Craps (2, 3, 12) on the come-out wins the Pass Line at even money instead of losing." },
  oddsAddict:  { name: "Odds Addict",     text: "Odds bets pay 50% extra." },
  pity:        { name: "Pit Boss's Pity", text: "The first seven-out of the shift (any shooter) is ignored. Pass Line and Odds stay, and the shooter keeps rolling." },
  muggsy:      { name: "Muggsy",          text: "A 7 right after the point is set costs your Pass Line twice. But the next shooter's winnings are x2 for their whole turn." },
  doubleUp:    { name: "Double Up",       text: "Doubles come up more: +1 way (out of 36) for each double, on everyone's dice. Fewer 7s, too." },
  doublesCharm:{ name: "Doubles Charm",   text: "Every 3rd roll of each shooter's turn is guaranteed to be a pair. Pairs can never make 7." },
  greenDice:   { name: "Green Dice",      text: "Every 12 rolled raises your interest rate by 0.5% for the rest of the run." },
  loadedDie:   { name: "Loaded Die",      text: "Once per shift, when a roll would cost you, reroll one die of your choice." },
  reroll:      { name: "Reroll",          text: "Once per shooter, when a roll would cost you, reroll both dice." },
  wrongWay:    { name: "Wrong Way",       text: "Bet against the shooter and get paid for it: Don't Pass winnings +50%." },
  coldRead:    { name: "Cold Read",       text: "When your Don't Pass wins on a seven-out, the next shooter starts at +1x mult." },
  chainLink:   { name: "Extra chain link", text: "When you would fall, this snaps instead: the shift counts as survived and the rest of the debt is forgiven. Used up." },
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

// The dice the current shooter really rolls: their own dice plus card effects.
function currentDice(state) {
  const set = Object.assign({}, state.dice);
  set.extraWays = [];
  if (hasCard(state, "doubleUp")) {
    for (let face = 1; face <= 6; face++) set.extraWays.push([face, face, CONFIG.doubleUpWays]);
  }
  set.totalWays = perkTotalWays(state);
  return set;
}

// Doubles Charm: is the next roll a guaranteed pair?
function pairDue(state) {
  return hasCard(state, "doublesCharm") && (state.turnRolls + 1) % CONFIG.doublesCharmEvery === 0;
}

// Would this roll cost you money? Counts Red Dice and an unused Pit Boss's Pity,
// since those would save the bet anyway. Returns the bets that would lose.
function costlyBets(state, total) {
  const pointOn = state.point !== null;
  return resolveRoll(state.bets, total, state.point).filter((r) => {
    if (r.outcome !== "lose") return false;
    if (r.bet === "pass" && !pointOn && hasCard(state, "redDice")) return false;
    if (r.bet === "dont" && !pointOn && total === CONFIG.sevenOut && CONFIG.jinxCurse && state.crew[state.shooterIndex] === "Jinx") return false;
    if (pointOn && total === CONFIG.sevenOut && hasCard(state, "pity") && !state.pityUsed && (r.bet === "pass" || r.bet === "odds")) return false;
    return true;
  });
}

// Which rerolls you can use right now: { oneDie: Loaded Die, bothDice: Reroll }.
function rerollOptions(state) {
  return {
    oneDie: hasCard(state, "loadedDie") && !state.loadedDieUsed,
    bothDice: hasCard(state, "reroll") && !state.rerollUsed,
  };
}

// Why the mult is what it is, e.g. ["Mentor: +1x from Hot Rod's streak", "Hot Hand: +1x"].
function multReasons(state) {
  const reasons = state.multNotes.slice();
  if (hasCard(state, "hotHand") && state.hotStreak > 0) {
    reasons.push("Hot Hand: +" + state.hotStreak * CONFIG.hotHandPerWin + "x");
  }
  return reasons;
}

// Charge losing bets again (times - 1 more), never below the $5 minimum.
// bets: which losing bets count. Used by Hot Rod (Pass Line and Odds) and
// Muggsy (Pass Line only). Returns the amount charged.
function chargeExtra(state, results, times, bets = ["pass", "odds"]) {
  const lost = results.filter((r) => r.outcome === "lose" && bets.includes(r.bet))
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
  if (hasCard(state, "pity") && !state.pityUsed && pointBefore !== null && total === CONFIG.sevenOut && state.bets.pass > 0) {
    state.pityUsed = true;
    pity = true;
    for (const r of results) {
      if (r.bet === "pass" || r.bet === "odds") r.outcome = "none";
    }
    notes.push("Pit Boss's Pity: that seven-out is ignored! Your bets stay and the shooter keeps rolling.");
  }

  // Wrong Way: Don't Pass winnings +50%.
  if (hasCard(state, "wrongWay")) {
    for (const r of results) {
      if (r.bet === "dont" && r.outcome === "win") r.winnings = Math.floor(r.winnings * (1 + CONFIG.wrongWayExtra));
    }
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
    const bonus = roundTo5(CONFIG.snakeEyesBonusPct * state.debt);
    state.kitty += bonus;
    notes.push("Snake Eyes: +$" + bonus + " bonus.");
  }
  if (hasCard(state, "luckySeven") && pointBefore === null && total === 7) {
    const bonus = roundTo5(CONFIG.luckySevenBonusPct * state.debt);
    state.kitty += bonus;
    notes.push("Lucky Seven: +$" + bonus + " bonus.");
  }
  if (hasCard(state, "rattlesnake") && total === 2) {
    state.mult += CONFIG.rattlesnakeMult;
    state.rattleGain += CONFIG.rattlesnakeMult;
    setMultNote(state, "Rattlesnake", "Rattlesnake: +" + state.rattleGain + "x");
    notes.push("Rattlesnake: +" + CONFIG.rattlesnakeMult + "x mult for this shooter.");
  }

  // Cold Read: a Don't Pass win on a seven-out warms up the next shooter.
  if (hasCard(state, "coldRead") && sevenOut && results.some((r) => r.bet === "dont" && r.outcome === "win")) {
    state.coldReadPending = true;
    notes.push("Cold Read: the next shooter starts at +" + CONFIG.coldReadMult + "x.");
  }

  // Green Dice: every 12 raises interest for the rest of the run.
  if (hasCard(state, "greenDice") && total === 12) {
    state.interestRate += CONFIG.greenDiceInterestStep;
    notes.push("Green Dice: interest is now " + Math.round(state.interestRate * 1000) / 10 + "%.");
  }

  // Hot Hand streak (tracked always, only counts if you own the card).
  const lost = results.some((r) => r.outcome === "lose");
  if (won) state.hotStreak += 1;
  else if (lost) state.hotStreak = 0;
  if (hasCard(state, "hotHand") && won) {
    notes.push("Hot Hand: " + state.hotStreak + " in a row (+" + state.hotStreak * CONFIG.hotHandPerWin + "x).");
  }

  // Muggsy: a 7 on the very next roll after the point was set.
  if (pointBefore !== null) state.rollsSincePoint += 1;
  if (hasCard(state, "muggsy") && sevenOut && state.rollsSincePoint === 1) {
    const extra = chargeExtra(state, results, CONFIG.muggsyCost, ["pass"]);
    state.muggsyPending = true;
    notes.push("Muggsy: point-7! " + (extra > 0 ? "Another $" + extra + " from your kitty. " : "") +
      "The next shooter's winnings are x" + CONFIG.muggsyNextShooterX + ".");
  }
  if (pointBefore === null && state.point !== null) state.rollsSincePoint = 0;

  return notes;
}
