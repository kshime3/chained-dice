// Connects the buttons to the game logic and the display.

const state = {
  bankroll: CONFIG.startingBankroll, // money in your hand, not on the table
  bets: { pass: 0, odds: 0, field: 0 },
  point: null, // null means the next roll is a come-out roll
  selectedChip: CONFIG.chipValues[0],
  lastRoll: null,
};

function pickChip(value) {
  state.selectedChip = value;
  renderChips(state.selectedChip, pickChip);
}

// Move chips from your hand onto a bet.
function placeBet(betName) {
  let amount = state.selectedChip;

  if (betName === "pass" && state.point !== null) {
    showMessage("The Pass Line is locked while the point is on. You can add Odds instead.");
    return;
  }
  if (betName === "odds") {
    if (state.point === null) {
      showMessage("Odds open once a point is set. Place a Pass Line bet and roll first.");
      return;
    }
    if (state.bets.pass === 0) {
      showMessage("Odds sit behind a Pass Line bet. You need a Pass Line bet to add Odds.");
      return;
    }
    const room = maxOdds(state.bets.pass, state.point) - state.bets.odds;
    if (room <= 0) {
      showMessage("Your Odds are at the max for this point.");
      return;
    }
    amount = Math.min(amount, room); // cap at the limit
  }
  if (amount > state.bankroll) {
    showMessage("Not enough money for a " + money(amount) + " bet.");
    return;
  }

  state.bankroll -= amount;
  state.bets[betName] += amount;
  showMessage(BET_NAMES[betName] + " bet is now " + money(state.bets[betName]) + ".");
  renderState(state);
}

// Take bets back into your hand. A locked Pass Line stays put.
function clearBets() {
  state.bankroll += state.bets.odds + state.bets.field;
  state.bets.odds = 0;
  state.bets.field = 0;
  if (state.point === null) {
    state.bankroll += state.bets.pass;
    state.bets.pass = 0;
    showMessage("Bets returned to your bankroll.");
  } else {
    showMessage("Odds and Field returned. The Pass Line stays locked until the point is decided.");
  }
  renderState(state);
}

function roll() {
  state.lastRoll = rollDice();
  const total = state.lastRoll.total;
  const pointBefore = state.point;
  const results = resolveRoll(state.bets, total, pointBefore);

  // Pay winners and remove losers.
  for (const r of results) {
    if (r.outcome === "win") {
      state.bankroll += r.winnings;
      if (!r.staysUp) {
        state.bankroll += r.amount; // bet comes back to you
        state.bets[r.bet] = 0;
      }
    }
    if (r.outcome === "lose") state.bets[r.bet] = 0;
  }

  state.point = nextPoint(pointBefore, total);
  showMessage(describeRoll(total, results, pointBefore, state.point));
  renderState(state);
}

document.getElementById("pass-line").onclick = () => placeBet("pass");
document.getElementById("odds").onclick = () => placeBet("odds");
document.getElementById("field").onclick = () => placeBet("field");
document.getElementById("roll-button").onclick = roll;
document.getElementById("clear-button").onclick = clearBets;

renderChips(state.selectedChip, pickChip);
renderState(state);
