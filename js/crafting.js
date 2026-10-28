// Dice crafting: edit the faces of YOUR dice (Nudge, Copycat, Chisel). No screen code here.
// Your dice live in state.myDice = { left: [6 faces], right: [6 faces] } and last the whole run.

const EDITS = ["nudge", "copycat", "chisel"];

function isEdit(id) {
  return EDITS.includes(id);
}

// What a face becomes. Nudge wraps: up from 6 is 1, down from 1 is 6.
// Copycat copies another face of the same die; Chisel sets any number.
function editedValue(state, edit, die, index, choice) {
  const faces = state.myDice[die];
  if (edit === "nudge") return choice === "up" ? (faces[index] % 6) + 1 : ((faces[index] + 4) % 6) + 1;
  if (edit === "copycat") return faces[choice];
  return choice; // chisel: 1-6
}

// Your dice with one face changed (nothing is saved).
function previewDice(state, die, index, value) {
  const next = { left: state.myDice.left.slice(), right: state.myDice.right.slice() };
  next[die][index] = value;
  return next;
}

// Ways to roll a 7 out of 36 on plain dice.
function sevenWays(dice) {
  return diceOdds({ left: dice.left, right: dice.right, bannedPairs: [] })[7] * 36;
}

// Change a face for real. Returns "ok" or "seven-floor" (refused: too few ways to roll 7).
function editFace(state, die, index, value) {
  const next = previewDice(state, die, index, value);
  if (sevenWays(next) < CONFIG.minSevenWays - 1e-9) return "seven-floor";
  state.myDice = next;
  // If you're the next shooter, your new dice apply straight away.
  if (state.crew[state.shooterIndex] === "You") state.dice = diceForShooter("You", state.myDice);
  return "ok";
}

// The totals whose chance changes most with an edit, e.g. [{ total: 12, before: 0.028, after: 0.056 }].
function editChanges(state, dice, count) {
  const plain = (d) => diceOdds({ left: d.left, right: d.right, bannedPairs: [] });
  const before = plain(state.myDice);
  const after = plain(dice);
  const changes = [];
  for (let t = 2; t <= 12; t++) {
    if (Math.abs(after[t] - before[t]) > 1e-9) changes.push({ total: t, before: before[t], after: after[t] });
  }
  changes.sort((a, b) => Math.abs(b.after - b.before) - Math.abs(a.after - a.before));
  return changes.slice(0, count);
}

function isEdited(state) {
  return state.myDice.left.join() !== "1,2,3,4,5,6" || state.myDice.right.join() !== "1,2,3,4,5,6";
}
