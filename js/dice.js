// Dice logic. No screen code here.
// A dice set looks like:
//   { left: [faces], right: [faces], bannedPairs: [[1, 6]], extraWays: [[2, 2, 1]] }
// Every listed face is equally likely. bannedPairs can't happen.
// extraWays adds "+N ways out of 36" to a left/right pair (cards and perks use this).

const NORMAL_DICE = { left: [1, 2, 3, 4, 5, 6], right: [1, 2, 3, 4, 5, 6], bannedPairs: [] };

function isBannedPair(diceSet, a, b) {
  return (diceSet.bannedPairs || []).some(([left, right]) => left === a && right === b);
}

// Every possible left/right combo with its weight.
// The plain combos share a weight of 36 in total, so "+1 way" means 1 out of 36.
function comboList(diceSet) {
  const combos = [];
  for (const a of diceSet.left) {
    for (const b of diceSet.right) {
      if (!isBannedPair(diceSet, a, b)) combos.push({ a: a, b: b, weight: 1 });
    }
  }
  const scale = 36 / combos.length;
  for (const c of combos) c.weight *= scale;

  // Extra ways only count for pairs these dice can actually roll.
  for (const [a, b, ways] of diceSet.extraWays || []) {
    const possible = combos.some((c) => c.a === a && c.b === b);
    if (possible) combos.push({ a: a, b: b, weight: ways });
  }
  return combos;
}

// pairsOnly: only doubles can come up (Doubles Charm).
function usableCombos(diceSet, pairsOnly) {
  const combos = comboList(diceSet);
  return pairsOnly ? combos.filter((c) => c.a === c.b) : combos;
}

// Roll a shooter's two dice and return both faces plus their total.
function rollDice(diceSet = NORMAL_DICE, pairsOnly = false) {
  const combos = usableCombos(diceSet, pairsOnly);
  const totalWeight = combos.reduce((sum, c) => sum + c.weight, 0);
  let pick = Math.random() * totalWeight;
  for (const c of combos) {
    pick -= c.weight;
    if (pick < 0) return { dice: [c.a, c.b], total: c.a + c.b };
  }
  const last = combos[combos.length - 1];
  return { dice: [last.a, last.b], total: last.a + last.b };
}

// The exact chance of each total from 2 to 12.
// Returns { 2: 0.0278, 3: 0.0556, ... } (0.0278 means 2.78%).
function diceOdds(diceSet = NORMAL_DICE, pairsOnly = false) {
  const combos = usableCombos(diceSet, pairsOnly);
  const totalWeight = combos.reduce((sum, c) => sum + c.weight, 0);
  const odds = {};
  for (let t = 2; t <= 12; t++) odds[t] = 0;
  for (const c of combos) odds[c.a + c.b] += c.weight / totalWeight;
  return odds;
}

// Chance of hitting the point before a 7.
function pointBeforeSeven(odds, point) {
  return odds[point] / (odds[point] + odds[7]);
}
