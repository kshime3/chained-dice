// Connects the buttons to the game logic and the display.

const state = {
  bankroll: CONFIG.startingBankroll, // money in your hand, not on the table
  bets: { pass: 0, field: 0 },
  selectedChip: CONFIG.chipValues[0],
  lastRoll: null,
};

function pickChip(value) {
  state.selectedChip = value;
  renderChips(state.selectedChip, pickChip);
}

// Move one chip from your hand onto a bet.
function placeBet(betName) {
  if (state.selectedChip > state.bankroll) {
    showMessage("Not enough money for a " + money(state.selectedChip) + " chip.");
    return;
  }
  state.bankroll -= state.selectedChip;
  state.bets[betName] += state.selectedChip;
  showMessage(BET_NAMES[betName] + " bet is now " + money(state.bets[betName]) + ".");
  renderState(state);
}

// Take all bets back into your hand.
function clearBets() {
  state.bankroll += state.bets.pass + state.bets.field;
  state.bets.pass = 0;
  state.bets.field = 0;
  showMessage("Bets returned to your bankroll.");
  renderState(state);
}

function roll() {
  state.lastRoll = rollDice();
  const results = resolveRoll(state.bets, state.lastRoll.total);

  // Pay winners (the bet stays on the table, like a real craps table).
  // Remove losers. Point results leave the bet alone.
  for (const r of results) {
    if (r.outcome === "win") state.bankroll += r.winnings;
    if (r.outcome === "lose") state.bets[r.bet] = 0;
  }

  showMessage("Rolled " + state.lastRoll.total + ". " + describeResults(results));
  renderState(state);
}

document.getElementById("pass-line").onclick = () => placeBet("pass");
document.getElementById("field").onclick = () => placeBet("field");
document.getElementById("roll-button").onclick = roll;
document.getElementById("clear-button").onclick = clearBets;

renderChips(state.selectedChip, pickChip);
renderState(state);
