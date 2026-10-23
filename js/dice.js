// Dice logic. No screen code here.
// A dice set looks like { left: [faces], right: [faces], bannedPairs: [[1, 6]] }.

const NORMAL_DICE = { left: [1, 2, 3, 4, 5, 6], right: [1, 2, 3, 4, 5, 6], bannedPairs: [] };

// Pick one face at random. Every face in the list is equally likely.
function pickFace(faces) {
  return faces[Math.floor(Math.random() * faces.length)];
}

function isBannedPair(diceSet, a, b) {
  return (diceSet.bannedPairs || []).some(([left, right]) => left === a && right === b);
}

// Roll a shooter's two dice and return both faces plus their total.
// A banned combo is simply rolled again.
function rollDice(diceSet = NORMAL_DICE) {
  let a, b;
  do {
    a = pickFace(diceSet.left);
    b = pickFace(diceSet.right);
  } while (isBannedPair(diceSet, a, b));
  return { dice: [a, b], total: a + b };
}

// The exact chance of each total from 2 to 12, by counting every combo.
// Returns { 2: 0.0278, 3: 0.0556, ... } (0.0278 means 2.78%).
function diceOdds(diceSet = NORMAL_DICE) {
  const counts = {};
  let combos = 0;
  for (let t = 2; t <= 12; t++) counts[t] = 0;
  for (const a of diceSet.left) {
    for (const b of diceSet.right) {
      if (isBannedPair(diceSet, a, b)) continue;
      counts[a + b] += 1;
      combos += 1;
    }
  }
  for (let t = 2; t <= 12; t++) counts[t] /= combos;
  return counts;
}

// Chance of hitting the point before a 7.
function pointBeforeSeven(odds, point) {
  return odds[point] / (odds[point] + odds[7]);
}
