// Crew logic: each shooter's dice, the mult, and crew synergies.

// The dice a shooter uses for their turn.
// Ghost picks evens or odds for his right die at the start of each turn.
// state (optional): your crafted dice, and cards like Lefty's Glove and Ghost Story.
function diceForShooter(name, state) {
  if (name === "You" && state) return { left: state.myDice.left.slice(), right: state.myDice.right.slice(), bannedPairs: [], note: "" };
  const set = CONFIG.crewDice[name] || NORMAL_DICE;
  if (name === "Lefty" && state && hasCard(state, "leftysGlove")) {
    return { left: set.left, right: [1, 2, 3, 4, 5, 6], bannedPairs: [], note: "Lefty's Glove: his right die has its 6 back." };
  }
  if (set.right !== "ghost") {
    return { left: set.left, right: set.right, bannedPairs: set.bannedPairs || [], note: "" };
  }
  const side = state && hasCard(state, "ghostStory") ? state.ghostPick : Math.random() < 0.5 ? "evens" : "odds";
  return {
    left: set.left,
    right: CONFIG.ghostFaces[side],
    bannedPairs: [],
    note: "Ghost's right die is " + side + "-only this turn.",
  };
}

// Set up a new shooter's turn: their dice and starting mult.
// prevName / prevMult: the shooter who just sevened out, and their final mult.
function setupTurn(state, prevName, prevMult) {
  const name = state.crew[state.shooterIndex];
  state.dice = diceForShooter(name, state);
  // Sleight of Hand: the shooter after you rolls your dice.
  if (prevName === "You" && name !== "You" && hasCard(state, "sleightOfHand")) {
    state.dice = diceForShooter("You", state);
    state.dice.note = "Sleight of Hand: " + name + " is rolling your dice.";
  }
  state.mult = CONFIG.startingMult;
  state.multNotes = [];
  state.coldTable = false;
  state.payoutX = 1;
  state.hotRodGain = 0;
  state.rattleGain = 0;
  state.turnRolls = 0;
  state.turnDoubles = 0; // for unlocks
  state.turnWon = 0;
  state.rerollUsed = false; // Reroll works once per shooter
  state.loadedDieUsed = false; // and so does Loaded Die
  state.louGain = 0;
  state.challenge = name === "You" ? newChallenge(state) : null; // pit boss challenge on your turn

  // Muggsy: after a point-7, this shooter's winnings are multiplied.
  if (state.muggsyPending) {
    state.payoutX = CONFIG.muggsyNextShooterX;
    state.muggsyPending = false;
    state.multNotes.push("Muggsy: winnings x" + CONFIG.muggsyNextShooterX + " this turn");
  }

  // Cold Read: your Don't Pass won on the last seven-out.
  if (state.coldReadPending) {
    state.mult += CONFIG.coldReadMult;
    state.coldReadPending = false;
    state.multNotes.push("Cold Read: +" + CONFIG.coldReadMult + "x");
  }

  // Mentor: part of Hot Rod's streak carries over.
  if (prevName === "Hot Rod" && prevMult > CONFIG.startingMult) {
    const carried = (prevMult - CONFIG.startingMult) * CONFIG.mentorShare;
    state.mult += carried;
    state.multNotes.push("Mentor: +" + carried + "x from Hot Rod's streak");
  }
  // Cards that warm up one seat's turn.
  for (const [card, who, extra] of [["leftysGlove", "Lefty", CONFIG.leftysGloveMult], ["ghostStory", "Ghost", CONFIG.ghostStoryMult], ["frontOfLine", "You", CONFIG.frontOfLineMult]]) {
    if (name === who && hasCard(state, card)) {
      state.mult += extra;
      state.multNotes.push(CARDS[card].name + ": +" + extra + "x");
    }
  }
  // Cold Table: Jinx leaves the table cold for the next shooter.
  if (prevName === "Jinx") {
    state.mult -= CONFIG.coldTablePenalty;
    state.coldTable = true;
    state.multNotes.push("Cold Table: -" + CONFIG.coldTablePenalty + "x until the first win");
  }
}

// Keep one note per source in the mult's list of reasons (replaces an older one).
function setMultNote(state, prefix, text) {
  state.multNotes = state.multNotes.filter((n) => !n.startsWith(prefix)).concat(text);
}

// Multiply each winning bet by the current mult (rounded down).
function applyMult(results, mult) {
  for (const r of results) {
    if (r.outcome !== "win") continue;
    r.baseWinnings = r.winnings;
    r.mult = mult;
    r.winnings = Math.floor(r.winnings * mult);
  }
}

// Crew effects before anyone is paid. Returns sentences for the message.
// Jinx's come-out curse: when he shoots, a come-out 7 doesn't beat Don't Pass (it's a tie).
function applyCrewBeforePayout(state, results, total, pointBefore) {
  const notes = [];
  // Boss rules
  if (rule(state, "sevenHeaven") && pointBefore === null && total === CONFIG.sevenOut) {
    for (const r of results) if (r.bet === "pass" && r.outcome === "win") { r.outcome = "none"; notes.push("Seven Heaven: come-out 7s don't pay."); }
  }
  if (rule(state, "noFreeLunch") && pointBefore !== null && total === pointBefore && !state.firstPointPaid[state.shooterIndex]) {
    state.firstPointPaid[state.shooterIndex] = true;
    for (const r of results) {
      if ((r.bet === "pass" || r.bet === "odds") && r.outcome === "win") r.winnings = 0;
    }
    notes.push("No Free Lunch: this shooter's first point pays nothing.");
  }
  const name = state.crew[state.shooterIndex];
  if (CONFIG.jinxCurse && name === "Jinx" && pointBefore === null && total === CONFIG.sevenOut) {
    for (const r of results) {
      if (r.bet === "dont" && r.outcome === "lose") {
        r.outcome = "none";
        notes.push("Jinx's curse: his come-out 7 is only a tie for Don't Pass.");
      }
    }
    const kept = results.filter((r) => r.outcome !== "none");
    results.length = 0;
    results.push(...kept);
  }
  return notes;
}

// Rebuild the next shooter's dice (after a card changes them at a Break).
function refreshNextShooter(state) {
  if (state.crew[state.shooterIndex]) setupTurnDiceOnly(state);
}

function setupTurnDiceOnly(state) {
  const name = state.crew[state.shooterIndex];
  const prev = state.crew[state.shooterIndex - 1];
  state.dice = diceForShooter(name, state);
  if (prev === "You" && name !== "You" && hasCard(state, "sleightOfHand")) {
    state.dice = diceForShooter("You", state);
    state.dice.note = "Sleight of Hand: " + name + " is rolling your dice.";
  }
}

// Odds / Lay Odds limit, with The Professor doubling it on his turn.
function backingLimit(state, back) {
  let base = back === "odds" ? maxOdds(state.bets.pass, state.point) : maxLay(state.bets.dont, state.point);
  if (rule(state, "tightOdds")) { // house rule: win at most 2x the line bet
    const [win, per] = CONFIG.layPayouts[state.point];
    base = Math.min(base, back === "odds" ? state.bets.pass * CONFIG.tightOddsX : Math.floor((state.bets.dont * CONFIG.tightOddsX * per) / win));
  }
  return state.crew[state.shooterIndex] === "The Professor" ? base * CONFIG.professorOddsX : base;
}

// Crew effects after a roll has been paid out. Returns sentences for the message.
// pointHit: the shooter just hit their point.
function applyCrewEffects(state, results, sevenOut, pointHit) {
  const notes = [];
  const name = state.crew[state.shooterIndex];
  const won = results.some((r) => r.outcome === "win");

  if (won && state.coldTable) {
    state.mult += CONFIG.coldTablePenalty;
    state.coldTable = false;
    state.multNotes = state.multNotes.filter((n) => !n.startsWith("Cold Table"));
    notes.push("The table warms up: Cold Table is lifted.");
  }
  if (won && name === "Hot Rod") {
    const gain = hasCard(state, "rodsLighter") ? CONFIG.rodsLighterMultPerWin : CONFIG.hotRodMultPerWin;
    state.mult += gain;
    state.hotRodGain += gain;
    setMultNote(state, "Hot Rod", "Hot Rod streak: +" + state.hotRodGain + "x");
    notes.push("Hot Rod heats up: mult is now " + state.mult + "x.");
  }

  // Hot Rod's first seven-out costs extra, taken from your cash.
  // It never takes you below the minimum Pass Line bet.
  // Lucky Lou: + mult every time he hits a point.
  if (pointHit && name === "Lucky Lou") {
    state.mult += CONFIG.luckyLouMult;
    state.louGain = (state.louGain || 0) + CONFIG.luckyLouMult;
    setMultNote(state, "Lucky Lou", "Lucky Lou: +" + state.louGain + "x");
    notes.push("Lucky Lou hits it again: +" + CONFIG.luckyLouMult + "x mult.");
  }

  if (sevenOut && name === "Hot Rod" && !state.hotRodPenaltyUsed && !hasCard(state, "rodsLighter")) {
    state.hotRodPenaltyUsed = true;
    const extra = chargeExtra(state, results, CONFIG.hotRodSevenOutCost);
    if (extra > 0) {
      notes.push("Hot Rod's seven-out costs double: another $" + extra + " from your cash.");
    }
  }
  return notes;
}

// Hover text. The chance of a 7 is worked out from the real dice.
const CREW_INFO = {
  "Lefty": {
    dice: "No 6s. Each die rolls 1 to 5.",
    style: "11 and 12 can't happen, and 10 is rare.",
  },
  "Dealer Dee": {
    dice: "Sticky dice: the left 1 and right 6 can't land together.",
    style: "One way to roll a 7 is gone, so her turns tend to last longer.",
  },
  "Hot Rod": {
    dice: "Normal dice.",
    style: "+1x mult after every winning roll. His first seven-out costs double. Mentor: half his bonus passes to the next shooter.",
  },
  "Jinx": {
    dice: "Faces are 1, 2, 3, 3, 4, 4. Lots of 3s and 4s.",
    style: "Sevens come up often, and nothing above 8 is possible. Cursed: when he shoots, a come-out 7 is only a tie for Don't Pass, so he's the perfect shooter to bet against. Cold Table: the next shooter starts at -0.5x mult until their first win.",
  },
  "Ghost": {
    dice: "Right die is evens-only or odds-only, picked each turn.",
    style: "Streaky: some totals vanish for his whole turn.",
  },
  "Snake": {
    dice: "Faces 1, 1, 2, 3, 5, 6. Lots of 2s, 3s and 12s.",
    style: "Craps machine: great for Don't Pass, rough on the Pass Line come-out.",
  },
  "Big Mo": {
    dice: "Faces 1, 4, 5, 5, 6, 6. Lots of 10s, 11s and 12s.",
    style: "Rolls big: great for the Field and come-out 11s.",
  },
  "The Professor": {
    dice: "Normal dice.",
    style: "Reads the table: Odds and Lay Odds limits are doubled on his turn.",
  },
  "Lucky Lou": {
    dice: "Normal dice.",
    style: "+1x mult every time he hits a point (for the rest of his turn).",
  },
  "You": {
    dice: "Your own dice. Edit their faces with Nudge, Copycat and Chisel comps from the shop.",
    style: "The one shooter you can build up.",
  },
};
