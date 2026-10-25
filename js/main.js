// Connects the buttons to the game logic and the display.

let state = newShiftState();
giveTestCards(state);
let selectedChip = CONFIG.chipValues[0];
let rolling = false; // true while the dice animation plays

// No betting or rolling while the dice tumble or a splash screen is up.
function busy() {
  return rolling || splashOpen || promptOpen || phoneOpen;
}

function pickChip(value) {
  selectedChip = value;
  renderChips(selectedChip, pickChip);
}

// Move chips from your kitty onto a bet.
function placeBet(betName) {
  if (busy() || state.status !== "playing" || state.onBreak) return;
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
  if (busy() || state.status !== "playing" || state.onBreak) return;
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
  if (busy() || state.status !== "playing" || state.onBreak) return;
  if (!canRoll(state)) {
    showMessage("Place at least " + money(CONFIG.tableMinimum) + " on the Pass Line to roll.");
    return;
  }

  // The result is decided now; the animation just shows it.
  const rolled = rollDice(currentDice(state), pairDue(state));
  rolling = true;
  animateDice(rolled.dice, CONFIG.diceRollMs, () => {
    rolling = false;
    offerRerollOrFinish(rolled);
  });
}

// Loaded Die / Reroll: if this roll would cost you, offer to reroll it first.
function offerRerollOrFinish(rolled) {
  const options = rerollOptions(state);
  const lose = costlyBets(state, rolled.total);
  if (!(options.oneDie || options.bothDice) || lose.length === 0) {
    finishRoll(rolled);
    return;
  }
  showRerollPrompt(rolled, lose, options, (choice) => {
    if (choice === "keep") {
      finishRoll(rolled);
      return;
    }
    let next;
    if (choice === "both") {
      state.rerollUsed = true;
      next = rollDice(currentDice(state));
    } else {
      state.loadedDieUsed = true;
      next = rerollOneDie(currentDice(state), rolled, choice === "left" ? 0 : 1);
    }
    rolling = true;
    animateDice(next.dice, CONFIG.diceRollMs, () => {
      rolling = false;
      offerRerollOrFinish(next); // the other card may still be available
    });
  });
}

// Settle every bet once the dice land.
function finishRoll(rolled) {
  const moneyBefore = totalMoney(state);
  const shooter = state.crew[state.shooterIndex];
  const odds = diceOdds(currentDice(state), pairDue(state));
  state.lastRoll = rolled;
  state.turnRolls += 1;
  const total = state.lastRoll.total;
  const pointBefore = state.point;
  const results = resolveRoll(state.bets, total, pointBefore);
  for (const r of results) r.plain = r.winnings; // before cards and mult, for the win screen
  const boosts = [];
  const multUsed = effectiveMult(state);
  if (multUsed !== 1) boosts.push("Mult " + multUsed + "x" + (multReasons(state).length ? " (" + multReasons(state).join(", ") + ")" : ""));
  const before = applyCardsBeforePayout(state, results, total, pointBefore);
  if (hasCard(state, "oddsAddict") && results.some((r) => r.bet === "odds" && r.outcome === "win")) boosts.push("Odds Addict (+50% Odds)");
  applyMult(results, multUsed);

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

  // Pit Boss's Pity keeps the point on after an ignored seven-out.
  state.point = before.pity ? pointBefore : nextPoint(pointBefore, total);
  const sevenOut = !before.pity && pointBefore !== null && total === CONFIG.sevenOut;
  const cardNotes = applyCardsAfterRoll(state, results, total, pointBefore, sevenOut);
  const crewNotes = applyCrewEffects(state, results, sevenOut);
  const pointHit = pointBefore !== null && total === pointBefore;
  recordRoll(state.stats, state, rolled, totalMoney(state) - moneyBefore, sevenOut, pointHit, odds, multUsed, shooter, state.turnRolls);
  afterRoll(state, sevenOut);

  const notes = before.notes.concat(cardNotes, crewNotes);
  showMessage(describeRoll(total, results, pointBefore, state.point) + " " + notes.join(" "), sevenOut);

  if (sevenOut) {
    // Let the seven-out sink in before the Dealer Break (or the fall).
    renderState(state);
    const lost = results.filter((r) => r.outcome === "lose").reduce((sum, r) => sum + r.amount, 0);
    showSplash(sevenOutSplash(state.sevenOutBy, lost, cardNotes.concat(crewNotes)), "bad", CONFIG.sevenOutSplashMs, renderAll);
    return;
  }
  renderAll();
  if (pointBefore !== null && total === pointBefore) {
    const wins = results.filter((r) => r.outcome === "win");
    showSplash(pointWinSplash(pointBefore, wins, boosts), "good", CONFIG.winSplashMs);
  }
}

// Dealer Break buttons
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
    showBreakMessage("Type an amount to pay, like 25.");
    return;
  }
  payDealer(typed);
  document.getElementById("deposit-amount").value = CONFIG.tableMinimum;
}

// Shop buttons
function buy(slot) {
  const id = state.stock[slot];
  const outcome = buyCard(state, slot);
  const texts = {
    ok: "Bought " + (id && CARDS[id].name) + ".",
    full: "Your card slots are full (" + CONFIG.maxCards + "). Sell a card first.",
    money: "Not enough. Buying can't take your kitty below " + money(CONFIG.tableMinimum) + ".",
    empty: "That one's sold out.",
  };
  showBreakMessage(texts[outcome]);
  renderAll();
}

function sell(id) {
  const got = sellCard(state, id);
  showBreakMessage("Sold " + CARDS[id].name + " for " + money(got) + ".");
  renderAll();
}

function cut(name) {
  if (!confirm("Cut " + name + "'s chain for " + money(cutChainPrice(state)) + "? They fall through the floor for the rest of the run.")) return;
  const outcome = cutChain(state, name);
  if (outcome !== "ok") {
    showBreakMessage(outcome === "money" ? "Not enough. Cutting can't take your kitty below " + money(CONFIG.tableMinimum) + "." : "You can't cut " + name + ".");
    renderAll();
    return;
  }
  showBreakMessage(name + " is gone.");
  renderAll();
  showSplash(cutSplash(name), "bad", CONFIG.cutSplashMs);
}

function shuffle() {
  const cost = shuffleCost(state);
  showBreakMessage(shuffleStock(state)
    ? "Shuffled for " + money(cost) + ". New cards on the table."
    : "Not enough. Shuffling can't take your kitty below " + money(CONFIG.tableMinimum) + ".");
  renderAll();
}

function leaveBreak() {
  endBreak(state);
  showBreakMessage("");
  if (state.status === "playing") {
    const next = state.crew[state.shooterIndex];
    showMessage((next === "You" ? "Your turn to shoot." : next + " steps up to shoot.") + " Place your Pass Line bet.");
  }
  renderAll();
}

// Testing shortcut: ?cards=doubleUp,greenDice starts you with those cards.
function giveTestCards(st) {
  const wanted = new URLSearchParams(location.search).get("cards");
  if (!wanted) return;
  st.cards = wanted.split(",").filter((id) => CARDS[id]).slice(0, CONFIG.maxCards);
  st.stock = newStock(st);
}

// After a won shift: the next shift starts, and the Pit Boss phone rings first.
function startNextShift() {
  state = nextShift(state);
  showBreakMessage("");
  showMessage("Shift " + state.shift + " begins.");
  renderAll();
  showPhone(state, phoneOffer(state), (id, target) => {
    takePerk(state, id, target);
    showBreakMessage("New perk: " + perkInfo(id).name + (target ? " (" + target + " is gone)" : "") + ".");
    renderAll();
  });
  if (!tutorialSeen("phone")) {
    markTutorialSeen("phone");
    showTutorial(phonePages());
  }
}

function playAgain() {
  state = newShiftState();
  giveTestCards(state);
  showBreakMessage("");
  showMessage("You wake up chained to the table.");
  renderAll();
}

function renderAll() {
  renderState(state);
  renderShop(state, { buy: buy, sell: sell, cut: cut });
  renderBreak(state);
  renderEndScreen(state);

  // The first time the shop opens, explain it.
  if (state.onBreak && state.status === "playing" && isShopOpen(state) && !tutorialSeen("shop")) {
    markTutorialSeen("shop");
    showTutorial(shopPages());
  }
}

document.getElementById("pass-line").onclick = () => placeBet("pass");
document.getElementById("odds").onclick = () => placeBet("odds");
document.getElementById("field").onclick = () => placeBet("field");
document.getElementById("roll-button").onclick = roll;
document.getElementById("dice").onclick = roll; // tapping the dice rolls too
document.getElementById("clear-button").onclick = clearBets;
document.getElementById("pay-typed").onclick = payTyped;
document.getElementById("pay-off").onclick = () => payDealer(amountOwed(state));
document.getElementById("leave-break").onclick = leaveBreak;
document.getElementById("shuffle").onclick = shuffle;
document.getElementById("play-again").onclick = () => (state.status === "won" ? startNextShift() : playAgain());

document.getElementById("how-to-play").onclick = () => showTutorial(introPages());
document.getElementById("shop-help").onclick = () => showTutorial(shopPages());

renderChips(selectedChip, pickChip);
drawDie("die1", 1);
drawDie("die2", 1);
renderAll();

// First visit: the full introduction.
if (!tutorialSeen("intro")) {
  markTutorialSeen("intro");
  showTutorial(introPages());
}
