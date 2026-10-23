// Connects the buttons to the game logic and the display.

let state = newShiftState();
let selectedChip = CONFIG.chipValues[0];

function pickChip(value) {
  selectedChip = value;
  renderChips(selectedChip, pickChip);
}

// Move chips from your hand onto a bet.
function placeBet(betName) {
  if (state.status !== "playing") return;
  let amount = selectedChip;

  if (betName === "pass" && state.point !== null) {
    showMessage("The Pass Line is locked while the point is on. You can add Odds instead.");
    return;
  }
  if (betName === "odds") {
    if (state.point === null) {
      showMessage("Odds open once a point is set. Place a Pass Line bet and roll first.");
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
  if (state.status !== "playing") return;
  state.bankroll += state.bets.odds + state.bets.field;
  state.bets.odds = 0;
  state.bets.field = 0;
  if (state.point === null) {
    state.bankroll += state.bets.pass;
    state.bets.pass = 0;
    showMessage("Bets returned to your bankroll. Remember: the Pass Line must be played to roll.");
  } else {
    showMessage("Odds and Field returned. The Pass Line stays locked until the point is decided.");
  }
  renderState(state);
}

function roll() {
  if (state.status !== "playing") return;
  if (!canRoll(state)) {
    showMessage("Place at least " + money(CONFIG.tableMinimum) + " on the Pass Line to roll.");
    return;
  }

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
  const sevenOut = pointBefore !== null && total === CONFIG.sevenOut;
  updateShift(state, sevenOut);

  showMessage(describeRoll(total, results, pointBefore, state.point));
  renderState(state);
  renderEndScreen(state);
}

function playAgain() {
  state = newShiftState();
  showMessage("You wake up chained to the table. Place a Pass Line bet to start.");
  renderState(state);
  renderEndScreen(state);
}

document.getElementById("pass-line").onclick = () => placeBet("pass");
document.getElementById("odds").onclick = () => placeBet("odds");
document.getElementById("field").onclick = () => placeBet("field");
document.getElementById("roll-button").onclick = roll;
document.getElementById("clear-button").onclick = clearBets;
document.getElementById("play-again").onclick = playAgain;

renderChips(selectedChip, pickChip);
renderState(state);
