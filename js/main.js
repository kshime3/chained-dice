// Connects the buttons to the game logic and the display.

let state = newShiftState();
giveTestCards(state);
giveTestRule(state);
let selectedChip = CONFIG.chipValues[0];

// Draw this shift's chips; keep the selected chip if it's still there.
function showChips() {
  const values = chipsFor(state);
  if (!values.includes(selectedChip)) selectedChip = values[0];
  renderChips(values, selectedChip, pickChip);
}
let rolling = false; // true while the dice animation plays

// No betting or rolling while the dice tumble or a splash screen is up.
function busy() {
  return rolling || splashOpen || promptOpen || phoneOpen || fallingNow || workshopOpen;
}

function pickChip(value) {
  selectedChip = value;
  showChips();
}

// Move chips from your cash onto a bet.
function placeBet(betName) {
  if (busy() || state.status !== "playing" || state.onBreak) return;
  let amount = selectedChip;

  // Line bets: Pass Line or Don't Pass, one side per come-out.
  if (betName === "pass" && !passAllowed(state)) {
    showMessage("House rule, Dark Side Only: no Pass Line this shift. Bet the Don't Pass instead.");
    return;
  }
  if (betName === "pass" || betName === "dont") {
    const other = betName === "pass" ? "dont" : "pass";
    if (state.point !== null) {
      showMessage("The " + BET_NAMES[betName] + " is locked while the point is on." +
        (state.bets[betName] > 0 ? " You can add " + BET_NAMES[betName === "pass" ? "odds" : "lay"] + " instead." : ""));
      return;
    }
    if (state.bets[other] > 0) {
      showMessage("You're on the " + BET_NAMES[other] + " this come-out. One side at a time: press Clear bets to switch.");
      return;
    }
    const moves = fundPassLine(state, amount, betName);
    if (moves === null) {
      showMessage("Not enough money for a " + money(amount) + " " + BET_NAMES[betName] + " bet. Try a smaller chip.");
      return;
    }
    const moved = moves.map((m) => " Moved " + money(m.amount) + " from the " + BET_NAMES[m.from] + ".").join("");
    playSound("chip");
    showMessage(BET_NAMES[betName] + " bet is now " + money(state.bets[betName]) + "." + moved);
    renderState(state);
    return;
  }

  // Odds sit behind the Pass Line, Lay Odds behind Don't Pass.
  if (betName === "odds" || betName === "lay") {
    const line = betName === "odds" ? "pass" : "dont";
    if (state.point === null) {
      showMessage(BET_NAMES[betName] + " open once a point is set. Place a " + BET_NAMES[line] + " bet and roll first.");
      return;
    }
    if (state.bets[line] === 0) {
      showMessage(BET_NAMES[betName] + " sit behind a " + BET_NAMES[line] + " bet, and you don't have one this time.");
      return;
    }
    const limit = backingLimit(state, betName);
    const room = limit - state.bets[betName];
    if (room <= 0) {
      showMessage("Your " + BET_NAMES[betName] + " are at the max for this point.");
      return;
    }
    amount = Math.min(amount, room); // cap at the limit
  }
  if (amount > state.cash) {
    showMessage("Not enough cash for a " + money(amount) + " bet.");
    return;
  }

  state.cash -= amount;
  state.bets[betName] += amount;
  playSound("chip");
  showMessage(BET_NAMES[betName] + " bet is now " + money(state.bets[betName]) + ".");
  renderState(state);
}

// Take bets back into your cash. A locked Pass Line or Don't Pass stays put.
function clearBets() {
  if (busy() || state.status !== "playing" || state.onBreak) return;
  const b = state.bets;
  const loose = state.point === null ? ["pass", "dont", "odds", "lay", "field"] : ["odds", "lay", "field"];
  for (const bet of loose) {
    state.cash += b[bet];
    b[bet] = 0;
  }
  playSound("chip");
  showMessage(state.point === null
    ? "Bets returned to you. Remember: a Pass Line or Don't Pass bet is needed to roll."
    : "Odds, Lay Odds and Field returned. Your line bet stays locked until the point is decided.");
  renderState(state);
}

function roll() {
  if (busy() || state.status !== "playing" || state.onBreak) return;
  if (!canRoll(state)) {
    showMessage("Place at least " + money(tableMin(state)) + " on the Pass Line or Don't Pass to roll.");
    return;
  }

  // The result is decided now; the animation just shows it.
  const rolled = rollDice(currentDice(state), nextRollPairs(state));
  rolling = true;
  playSound("rattle");
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
    playSound("rattle");
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
  const odds = diceOdds(currentDice(state), nextRollPairs(state));
  state.lastRoll = rolled;
  state.turnRolls += 1;
  const total = state.lastRoll.total;
  const pointBefore = state.point;
  const results = resolveRoll(state.bets, total, pointBefore);
  for (const r of results) r.plain = r.winnings; // before cards and mult, for the win screen
  const boosts = [];
  const doubled = !!state.armed.doubleDown && results.some((r) => r.outcome === "win");
  const multUsed = effectiveMult(state) * (doubled ? 2 : 1);
  if (multUsed !== 1) boosts.push("Mult " + multUsed + "x" + (multReasons(state).length || doubled ? " (" + multReasons(state).concat(doubled ? ["Double Down x2"] : []).join(", ") + ")" : ""));
  const crewBefore = applyCrewBeforePayout(state, results, total, pointBefore);
  const before = applyCardsBeforePayout(state, results, total, pointBefore);
  if (hasCard(state, "oddsAddict") && results.some((r) => r.bet === "odds" && r.outcome === "win")) boosts.push("Odds Addict (+50% Odds)");
  applyMult(results, multUsed);

  // Pay winners and remove losers.
  for (const r of results) {
    if (r.outcome === "win") {
      state.cash += r.winnings;
      if (!r.staysUp) {
        state.cash += r.amount; // bet comes back to you
        state.bets[r.bet] = 0;
      }
    }
    if (r.outcome === "lose") state.bets[r.bet] = 0;
  }

  const compNotes = finishArmed(state, results);

  // Pit Boss's Pity keeps the point on after an ignored seven-out.
  state.point = before.pity ? pointBefore : nextPoint(pointBefore, total);
  const sevenOut = !before.pity && pointBefore !== null && total === CONFIG.sevenOut;
  const cardNotes = applyCardsAfterRoll(state, results, total, pointBefore, sevenOut);
  const crewNotes = applyCrewEffects(state, results, sevenOut, pointBefore !== null && total === pointBefore);
  const pointHit = pointBefore !== null && total === pointBefore;
  const challengeNote = shooter === "You"
    ? trackChallenge(state, results, { pointHit: pointHit, total: total, doubles: rolled.dice[0] === rolled.dice[1], sevenOut: sevenOut, multUsed: multUsed })
    : null;
  if (challengeNote) compNotes.push(challengeNote);
  recordRoll(state.stats, state, rolled, totalMoney(state) - moneyBefore, sevenOut, pointHit, odds, multUsed, shooter, state.turnRolls);
  afterRoll(state, sevenOut);

  // A free comp for hitting a point at a big mult.
  if (pointHit && multUsed >= CONFIG.freeCompMult && gainComp(state, randomComp())) {
    compNotes.push("The dealer is impressed: a free " + COMPS[state.comps[state.comps.length - 1]].name + " comp!");
  }
  const notes = crewBefore.concat(before.notes, cardNotes, crewNotes, compNotes);
  showMessage(describeRoll(total, results, pointBefore, state.point) + " " + notes.join(" "), sevenOut);

  if (sevenOut && results.some((r) => r.bet === "dont" && r.outcome === "win")) playSound("pointHit");
  else if (sevenOut) playSound("sevenOut");
  else if (pointHit || challengeNote) playSound("pointHit");
  else if (results.some((r) => r.outcome === "win")) playSound("win");
  else if (results.some((r) => r.outcome === "lose")) playSound("lose");
  else playSound("land");

  if (sevenOut) {
    // Let the seven-out sink in before the Dealer Break (or the fall).
    renderState(state);
    const lost = results.filter((r) => r.outcome === "lose").reduce((sum, r) => sum + r.amount, 0);
    const won = results.filter((r) => r.outcome === "win" && r.bet !== "field").reduce((sum, r) => sum + r.winnings, 0);
    showSplash(sevenOutSplash(state.sevenOutBy, lost, cardNotes.concat(crewNotes), won), "bad", CONFIG.sevenOutSplashMs, renderAll);
    return;
  }
  renderAll();
  if (pointHit && results.some((r) => r.bet === "pass" && r.outcome === "win")) {
    const wins = results.filter((r) => r.outcome === "win");
    showSplash(pointWinSplash(pointBefore, wins, boosts), "good", CONFIG.winSplashMs);
  }
}

// Dealer Break buttons
function payDealer(amount) {
  const paid = deposit(state, amount);
  if (paid > 0 && state.status !== "won") playSound("pay");
  let text = paid > 0 ? "Paid " + money(paid) + ". That money is safe now, and out of play." : "Nothing more you can pay.";
  if (state.status === "playing" && state.cash <= tableMin(state)) {
    text += " You keep " + money(tableMin(state)) + " for your Pass Line bet.";
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
  document.getElementById("deposit-amount").value = Math.max(5, tableMin(state));
}

// Shop buttons
function buy(slot) {
  const id = state.stock[slot];
  const outcome = buyCard(state, slot);
  const texts = {
    ok: id && CARDS[id].instant ? CARDS[id].name + ": done. " + (id === "bargain" ? "Your chain now has " + totalLinks(state) + " links, and 7s are a little rarer." : "") : "Bought " + (id && CARDS[id].name) + ".",
    full: "Your card slots are full (" + CONFIG.maxCards + "). Sell a card first.",
    money: "Not enough. Buying can't take your cash below " + money(tableMin(state)) + ".",
    empty: "That one's sold out.",
  };
  if (outcome === "ok") playSound("buy");
  showBreakMessage(texts[outcome]);
  renderAll();
}

function sell(id) {
  const got = sellCard(state, id);
  playSound("chip");
  showBreakMessage("Sold " + CARDS[id].name + " for " + money(got) + ".");
  renderAll();
}

// Comp buttons
function buyCompSlot(slot) {
  const id = state.compStock[slot];
  const outcome = buyComp(state, slot);
  if (outcome === "ok") playSound("buy");
  showBreakMessage({
    ok: "Bought " + (id && COMPS[id].name) + ".",
    full: "Your comp slots are full (" + CONFIG.compSlots + "). Use or sell one first.",
    money: "Not enough. Buying can't take your cash below " + money(tableMin(state)) + ".",
    empty: "That one's sold out.",
  }[outcome]);
  renderAll();
}

function sellCompSlot(index) {
  const id = state.comps[index];
  const got = sellComp(state, index);
  playSound("chip");
  showBreakMessage("Sold " + COMPS[id].name + " for " + money(got) + ".");
  renderAll();
}

function useCompSlot(index) {
  if (rolling || splashOpen || promptOpen || fallingNow) return;
  const id = state.comps[index];
  const finish = (face) => {
    const text = useComp(state, index, face);
    if (!text) return;
    playSound("clank");
    if (state.onBreak) showBreakMessage(text);
    else showMessage(text);
    renderAll();
  };
  if (COMPS[id].edit) {
    if (compBlocked(state, id)) return;
    showWorkshop(state, id, (choice) => {
      const text = useComp(state, index, choice);
      if (!text) return false;
      showBreakMessage(text);
      setTimeout(renderAll, 2000); // after the reforge animation
      return true;
    }, () => {});
    return;
  }
  if (id === "loadedShot") {
    const faces = [...new Set(state.dice.left)].sort();
    showChoice("Loaded Shot", "Pick the face for the left die on your next roll.", faces.map((f) => ({ label: String(f), value: f })),
      (face) => { if (face !== null) finish(face); });
    return;
  }
  finish();
}

function hireCrew(name) {
  const outcome = hire(state, name);
  if (outcome === "ok") playSound("buy");
  showBreakMessage({
    ok: name + " takes a seat. They'll shoot this shift" + (state.crew[state.shooterIndex] === name ? ", starting now." : ", last in line."),
    full: "Every seat is taken. Open a Trapdoor to make room.",
    money: "Not enough. Hiring can't take your cash below " + money(tableMin(state)) + ".",
    gone: name + " already found a seat.",
  }[outcome]);
  renderAll();
}

function pickGhost(side) {
  state.ghostPick = side;
  refreshNextShooter(state);
  playSound("chip");
  showBreakMessage("Ghost Story: Ghost's right die is " + side + "-only this turn.");
  renderAll();
}

function cut(name) {
  if (!confirm("Pay " + money(cutChainPrice(state)) + " to open the trapdoor under " + name + "'s seat? They're gone for the rest of the run.")) return;
  const outcome = cutChain(state, name);
  if (outcome !== "ok") {
    showBreakMessage(outcome === "money" ? "Not enough. The trapdoor can't take your cash below " + money(tableMin(state)) + "." : "You can't drop " + name + ".");
    renderAll();
    return;
  }
  showBreakMessage(name + "'s seat is empty.");
  renderAll();
  playSound("clank");
  showSplash(cutSplash(name), "bad", CONFIG.cutSplashMs);
}

function shuffle() {
  const cost = shuffleCost(state);
  showBreakMessage(shuffleStock(state)
    ? (cost > 0 ? "Shuffled for " + money(cost) + "." : "Free shuffle from the pit boss.") + " New cards on the table."
    : "Not enough. Shuffling can't take your cash below " + money(tableMin(state)) + ".");
  renderAll();
}

function leaveBreak() {
  endBreak(state);
  showBreakMessage("");
  if (state.status === "playing") {
    const next = state.crew[state.shooterIndex];
    showMessage((next === "You" ? "Your turn to shoot." : next + " steps up to shoot.") + (passAllowed(state) ? " Place your Pass Line bet." : " Dark Side Only: place your Don't Pass bet."));
    if (next === "You" && state.challenge && !tutorialSeen("challenges")) {
      markTutorialSeen("challenges");
      showTutorial(challengePages());
    }
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

// Testing shortcut: ?rule=houseDie forces that house rule every shift.
function giveTestRule(st) {
  const wanted = new URLSearchParams(location.search).get("rule");
  if (wanted) st.houseRule = pickHouseRule(st, wanted);
}

// After a won shift: the next shift starts, and the Pit Boss phone rings first.
function startNextShift() {
  state = nextShift(state);
  giveTestRule(state);
  showBreakMessage("");
  showMessage("Shift " + state.shift + " begins.");
  renderAll();
  playSound("ring");
  showPhone(state, phoneOffer(state), (id, target) => {
    takePerk(state, id, target);
    showBreakMessage("New perk: " + perkInfo(id).name + (target ? " (" + target + "'s seat dropped away)" : "") + ".");
    renderAll();
  });
  let pages = [];
  if (!tutorialSeen("phone")) {
    markTutorialSeen("phone");
    pages = pages.concat(phonePages());
  }
  if (state.houseRule && !tutorialSeen("houseRules")) {
    markTutorialSeen("houseRules");
    pages = pages.concat(houseRulePages());
  }
  if (pages.length) showTutorial(pages);
}

function playAgain() {
  fallPlayed = false;
  state = newShiftState();
  giveTestCards(state);
  giveTestRule(state);
  showBreakMessage("");
  showMessage("You wake up chained to the table.");
  renderAll();
}

let fallPlayed = false; // the fall animation plays once per run

function renderAll() {
  showChips();
  renderState(state);
  renderShop(state, { buy: buy, sell: sell, cut: cut, hire: hireCrew });
  renderComps(state, { buyComp: buyCompSlot, sellComp: sellCompSlot, useComp: useCompSlot });
  renderBreak(state);

  // Falling: the floor opens first, then the stats screen.
  if (state.status.startsWith("fell") && !fallPlayed) {
    fallPlayed = true;
    playSound("fall");
    playFall(CONFIG.fallMs, () => renderEndScreen(state, endHandlers()));
  } else if (!fallingNow) {
    renderEndScreen(state, endHandlers());
  }

  // The first time the shop opens, explain it (then comps, on a later visit).
  if (state.onBreak && state.status === "playing" && isShopOpen(state) && !tutorialSeen("shop")) {
    markTutorialSeen("shop");
    showTutorial(shopPages());
  } else if (state.onBreak && state.status === "playing" && isShopOpen(state) && !tutorialSeen("comps")) {
    markTutorialSeen("comps");
    showTutorial(compPages());
  }
}

document.getElementById("pass-line").onclick = () => placeBet("pass");
document.getElementById("odds").onclick = () => placeBet("odds");
document.getElementById("field").onclick = () => placeBet("field");
document.getElementById("dont-pass").onclick = () => placeBet("dont");
document.getElementById("lay").onclick = () => placeBet("lay");
document.getElementById("roll-button").onclick = roll;
document.getElementById("house-rule").onclick = () => showMessage(HOUSE_RULES[state.houseRule.id].name + ": " + houseRuleText(state));
document.getElementById("dice").onclick = roll; // tapping the dice rolls too
document.getElementById("clear-button").onclick = clearBets;
document.getElementById("pay-typed").onclick = payTyped;
document.getElementById("pay-off").onclick = () => payDealer(amountOwed(state));
document.getElementById("leave-break").onclick = leaveBreak;
document.getElementById("shuffle").onclick = shuffle;
document.getElementById("ghost-evens").onclick = () => pickGhost("evens");
document.getElementById("ghost-odds").onclick = () => pickGhost("odds");
// End screen buttons: the next shift, the escape choice, or a new run.
function endHandlers() {
  if (state.status !== "won" || state.walkedAway) return { primary: playAgain, secondary: null };
  if (hasEscaped(state)) {
    return {
      primary: () => { state.endless = true; startNextShift(); }, // Double or nothing
      secondary: () => { state.walkedAway = true; playSound("shiftWon"); renderAll(); }, // Walk away
    };
  }
  return { primary: startNextShift, secondary: null };
}

document.getElementById("mute").onclick = () => {
  setMuted(!muted);
  renderMuteButton();
  playSound("chip");
};
document.getElementById("how-to-play").onclick = () => showTutorial(introPages());
document.getElementById("shop-help").onclick = () => showTutorial(shopPages());
document.getElementById("comps-help").onclick = () => showTutorial(compPages());

showChips();
renderMuteButton();
drawDie("die1", 1);
drawDie("die2", 1);
renderAll();

// First visit: the full introduction.
if (!tutorialSeen("intro")) {
  markTutorialSeen("intro");
  showTutorial(introPages());
}
