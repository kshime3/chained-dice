// Dice logic. No screen code here.

// Roll one fair six-sided die: a whole number from 1 to 6.
function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

// Roll two dice and return both faces plus their total.
function rollDice() {
  const a = rollDie();
  const b = rollDie();
  return { dice: [a, b], total: a + b };
}
