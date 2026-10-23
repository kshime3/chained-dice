// Crew logic: each shooter's dice, the mult, and crew synergies.

// The dice a shooter uses for their turn.
// Ghost picks evens or odds for his right die at the start of each turn.
function diceForShooter(name) {
  const set = CONFIG.crewDice[name] || NORMAL_DICE;
  if (set.right !== "ghost") {
    return { left: set.left, right: set.right, bannedPairs: set.bannedPairs || [], note: "" };
  }
  const side = Math.random() < 0.5 ? "evens" : "odds";
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
  const name = CONFIG.crew[state.shooterIndex];
  state.dice = diceForShooter(name);
  state.mult = CONFIG.startingMult;
  state.multNotes = [];
  state.coldTable = false;
  state.payoutX = 1;

  // Muggsy: after a point-7, this shooter's winnings are multiplied.
  if (state.muggsyPending) {
    state.payoutX = CONFIG.muggsyNextShooterX;
    state.muggsyPending = false;
    state.multNotes.push("Muggsy: winnings x" + CONFIG.muggsyNextShooterX + " this turn");
  }

  // Mentor: part of Hot Rod's streak carries over.
  if (prevName === "Hot Rod" && prevMult > CONFIG.startingMult) {
    const carried = (prevMult - CONFIG.startingMult) * CONFIG.mentorShare;
    state.mult += carried;
    state.multNotes.push("Mentor: +" + carried + "x from Hot Rod's streak");
  }
  // Cold Table: Jinx leaves the table cold for the next shooter.
  if (prevName === "Jinx") {
    state.mult -= CONFIG.coldTablePenalty;
    state.coldTable = true;
    state.multNotes.push("Cold Table: -" + CONFIG.coldTablePenalty + "x until the first win");
  }
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

// Crew effects after a roll has been paid out. Returns sentences for the message.
function applyCrewEffects(state, results, sevenOut) {
  const notes = [];
  const name = CONFIG.crew[state.shooterIndex];
  const won = results.some((r) => r.outcome === "win");

  if (won && state.coldTable) {
    state.mult += CONFIG.coldTablePenalty;
    state.coldTable = false;
    state.multNotes = state.multNotes.filter((n) => !n.startsWith("Cold Table"));
    notes.push("The table warms up: Cold Table is lifted.");
  }
  if (won && name === "Hot Rod") {
    state.mult += CONFIG.hotRodMultPerWin;
    notes.push("Hot Rod heats up: mult is now " + state.mult + "x.");
  }

  // Hot Rod's first seven-out costs extra, taken from your kitty.
  // It never takes you below the minimum Pass Line bet.
  if (sevenOut && name === "Hot Rod" && !state.hotRodPenaltyUsed) {
    state.hotRodPenaltyUsed = true;
    const extra = chargeExtra(state, results, CONFIG.hotRodSevenOutCost);
    if (extra > 0) {
      notes.push("Hot Rod's seven-out costs double: another $" + extra + " from your kitty.");
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
    style: "Sevens come up often, and nothing above 8 is possible. Cold Table: the next shooter starts at -0.5x mult until their first win.",
  },
  "Ghost": {
    dice: "Right die is evens-only or odds-only, picked each turn.",
    style: "Streaky: some totals vanish for his whole turn.",
  },
  "You": {
    dice: "Normal dice.",
    style: "Your dice can be upgraded at the dealer's shop (Milestone 5).",
  },
};
