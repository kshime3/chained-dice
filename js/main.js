// Connects the buttons to the game logic and the display.

let state = newShiftState();
let selectedChip = CONFIG.chipValues[0];

function pickChip(value) {
  selectedChip = value;
  renderChips(selectedChip, pickChip);
}

// Move chips from your kitty onto a bet.
function placeBet(betName) {
  if (state.status !== "playing" || state.onBreak) return;
  let amount = selectedChip;

  if (betName === "pass") {
    if (state.point !== null) {
      showMessage("The Pass Line is locked while the point is on. You can add Odds instead.");
      return;
    }
    const moves = fundPassLine(state, amount);
    if (moves === null) {
      showMessage("Not enough money for a " + money(amount) + " Pass Line bet. Try a smaller chip.");
      return;
    }
    const moved = moves.map((m) => " Moved " + money(m.amount) + " from the " + BET_NAMES[m.from] + ".").join("");
    showMessage("Pass Line bet is now " + money(state.bets.pass) + "." + moved);
    renderState(state);
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
  if (amount > state.kitty) {
    showMessage("Not enough money in your kitty for a " + money(amount) + " bet.");
    return;
  }

  state.kitty -= amount;
  state.bets[betName] += amount;
  showMessage(BET_NAMES[betName] + " bet is now " + money(state.bets[betName]) + ".");
  renderState(state);
}

// Take bets back into your kitty. A locked Pass Line stays put.
function clearBets() {
  if (state.status !== "playing" || state.onBreak) return;
  state.kitty += state.bets.odds + state.bets.field;
  state.bets.odds = 0;
  state.bets.field = 0;
  if (state.point === null) {
    state.kitty += state.bets.pass;
    state.bets.pass = 0;
    showMessage("Bets returned to your kitty. Remember: the Pass Line must be played to roll.");
  } else {
    showMessage("Odds and Field returned. The Pass Line stays locked until the point is decided.");
  }
  renderState(state);
}

function roll() {
  if (state.status !== "playing" || state.onBreak) return;
  if (!canRoll(state)) {
    showMessage("Place at least " + money(CONFIG.tableMinimum) + " on the Pass Line to roll.");
    return;
  }

  state.lastRoll = rollDice(state.dice);
  const total = state.lastRoll.total;
  const pointBefore = state.point;
  const results = resolveRoll(state.bets, total, pointBefore);
  applyMult(results, state.mult);

  // Pay winners and remove losers.
  for (const r of results) {
    if (r.outcome === "win") {
      state.kitty += r.winnings;
      if (!r.staysUp) {
        state.kitty += r.amount; // bet comes back to you
        state.bets[r.bet] = 0;
      }
    }
    if (r.outcome === "lose") state.bets[r.bet] = 0;
  }

  state.point = nextPoint(pointBefore, total);
  const sevenOut = pointBefore !== null && total === CONFIG.sevenOut;
  const crewNotes = applyCrewEffects(state, results, sevenOut);
  afterRoll(state, sevenOut);

  showMessage(describeRoll(total, results, pointBefore, state.point) + " " + crewNotes.join(" "));
  renderAll();
}

// Dealer break buttons
function payDealer(amount) {
  const paid = deposit(state, amount);
  let text = paid > 0 ? "Paid " + money(paid) + ". That money is safe now, and out of play." : "Nothing more you can pay.";
  if (state.status === "playing" && state.kitty <= CONFIG.tableMinimum) {
    text += " You keep " + money(CONFIG.tableMinimum) + " for your Pass Line bet.";
  }
  showBreakMessage(text);
  renderAll();
}

function payTyped() {
  const typed = Math.floor(Number(document.getElementById("deposit-amount").value));
  if (!(typed > 0)) {
    showBreakMessage("Type an amount to pay, like 50.");
    return;
  }
  payDealer(typed);
  document.getElementById("deposit-amount").value = "";
}

function leaveBreak() {
  endBreak(state);
  showBreakMessage("");
  if (state.status === "playing") {
    const next = CONFIG.crew[state.shooterIndex];
    showMessage((next === "You" ? "Your turn to shoot." : next + " steps up to shoot.") + " Place your Pass Line bet.");
  }
  renderAll();
}

function playAgain() {
  state = newShiftState();
  showBreakMessage("");
  showMessage("You wake up chained to the table.");
  renderAll();
}

function renderAll() {
  renderState(state);
  renderBreak(state);
  renderEndScreen(state);
}

document.getElementById("pass-line").onclick = () => placeBet("pass");
document.getElementById("odds").onclick = () => placeBet("odds");
document.getElementById("field").onclick = () => placeBet("field");
document.getElementById("roll-button").onclick = roll;
document.getElementById("clear-button").onclick = clearBets;
document.getElementById("pay-typed").onclick = payTyped;
document.getElementById("pay-all").onclick = () => payDealer(maxDeposit(state));
document.getElementById("leave-break").onclick = leaveBreak;
document.getElementById("play-again").onclick = playAgain;

renderChips(selectedChip, pickChip);
renderAll();
