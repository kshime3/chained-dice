// Crew logic: each shooter's dice. Milestone 4b adds synergies here.

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
    style: "+1 mult per winning roll. His first seven-out costs double. Half his streak passes to the next shooter. (Coming in Milestone 4b.)",
  },
  "Jinx": {
    dice: "Faces are 1, 2, 3, 3, 4, 4. Lots of 3s and 4s.",
    style: "Sevens come up often, and nothing above 8 is possible. The next shooter starts at -0.5x mult. (Coming in Milestone 4b.)",
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
