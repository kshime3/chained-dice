// Connects the buttons to the game logic and the display.

// Testing shortcut: ?unlockAll makes every card, comp and crew member available (nothing is saved).
if (new URLSearchParams(location.search).has("unlockAll")) CONFIG.unlockEverything = true;
// A saved run in progress is offered when the page opens (see the end of this file).
const savedRun = loadRun();
let awaitingResume = !!savedRun; // don't save over it until the player chooses
let state = newShiftState();
giveTestCards(state);
giveTestRule(state);
let selectedChip = CONFIG.chipValues[0];

// Draw this shift's chips; keep the selected chip if it's still there.
function showChips() {
  const values = chipsFor(state);
  if (!values.includes(selectedChip)) selectedChip = values[0];
  // A chip you can't afford is no use: switch to the biggest one you can.
  if (selectedChip > state.cash && values.some((v) => v <= state.cash)) selectedChip = values.filter((v) => v <= state.cash).pop();
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

  // The new bets (More bets board).
  if (betGroup(betName)) {
    const check = extraBetCheck(state, betName);
    const why = {
      locked: BET_GROUPS[betGroup(betName)].name + " are locked. Keep playing to unlock them.",
      noPoint: BET_NAMES[betName] + " opens once a point is set.",
      fireLate: "The Fire Bet goes down before a shooter's first roll.",
      fireMax: "The Fire Bet is at its max (" + money(fireMax(state)) + ").",
    };
    if (check !== "ok") {
      showMessage(why[check]);
      return;
    }
    if (betName === "fire") amount = Math.min(amount, fireMax(state) - state.bets.fire);
    if (amount > state.cash) {
      showMessage("Not enough cash for a " + money(amount) + " bet.");
      return;
    }
    state.cash -= amount;
    state.bets[betName] += amount;
    playSound("chip");
    showMessage(BET_NAMES[betName] + (betName === "fire" ? "" : " bet") + " is now " + money(state.bets[betName]) + ".");
    renderState(state);
    return;
  }

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
    // The first chip on a line bet covers at least the table minimum.
    if (state.bets[betName] < tableMin(state)) amount = Math.max(amount, tableMin(state) - state.bets[betName]);
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
  let loose = state.point === null ? ["pass", "dont"].concat(looseBets()) : looseBets();
  if (state.turnRolls === 0) loose = loose.concat("fire"); // the Fire Bet locks in at the first roll
  for (const bet of loose) {
    state.cash += b[bet];
    b[bet] = 0;
  }
  playSound("chip");
  showMessage(state.point === null
    ? "Bets returned to you. Remember: a Pass Line or Don't Pass bet is needed to roll."
    : "Loose bets returned. Your line bet (and any Come bets on a number) stay until they're decided.");
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
  state.pendingRoll = rolled; // saved now, so a refresh mid-roll can't undo it
  saveRun(state);
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
  const lose = costlyBets(state, rolled.total, rolled.dice);
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
    state.pendingRoll = next;
    saveRun(state);
    rolling = true;
    playSound("rattle");
    const keep = choice === "both" ? undefined : choice === "left" ? 1 : 0; // Loaded Die: the other die stays put
    animateDice(next.dice, CONFIG.diceRollMs, () => {
      rolling = false;
      offerRerollOrFinish(next); // the other card may still be available
    }, keep);
  });
}

// Settle every bet once the dice land.
function finishRoll(rolled) {
  delete state.pendingRoll;
  const moneyBefore = totalMoney(state);
  const shooter = state.crew[state.shooterIndex];
  const odds = diceOdds(currentDice(state), nextRollPairs(state));
  state.lastRoll = rolled;
  state.turnRolls += 1;
  const total = state.lastRoll.total;
  const pointBefore = state.point;
  const results = resolveRoll(state.bets, total, pointBefore, { dice: rolled.dice, firePoints: state.firePoints });
  for (const r of results) r.plain = r.winnings; // before cards and mult, for the win screen
  const boosts = [];
  const doubled = !!state.armed.doubleDown && results.some((r) => r.outcome === "win");
  const multUsed = effectiveMult(state) * (doubled ? 2 : 1);
  if (multUsed !== 1) boosts.push("Mult " + multUsed + "x" + (multReasons(state).length || doubled ? " (" + multReasons(state).concat(doubled ? ["Double Down x2"] : []).join(", ") + ")" : ""));
  const crewBefore = applyCrewBeforePayout(state, results, total, pointBefore);
  const before = applyCardsBeforePayout(state, results, total, pointBefore);
  if (hasCard(state, "oddsAddict") && results.some((r) => r.bet === "odds" && r.outcome === "win")) boosts.push("Odds Addict (+50% Odds)");
  applyMult(results, multUsed);

  // Pay winners, remove losers, move Come bets.
  settleResults(state, results);
  showBetPopups(results);

  const compNotes = finishArmed(state, results);

  // Pit Boss's Pity keeps the point on after an ignored seven-out.
  state.point = before.pity ? pointBefore : nextPoint(pointBefore, total);
  const sevenOut = !before.pity && pointBefore !== null && total === CONFIG.sevenOut;
  const cardNotes = applyCardsAfterRoll(state, results, total, pointBefore, sevenOut);
  const crewNotes = applyCrewEffects(state, results, sevenOut, pointBefore !== null && total === pointBefore);
  const pointHit = pointBefore !== null && total === pointBefore;
  if (pointHit && !state.firePoints.includes(pointBefore)) state.firePoints.push(pointBefore); // Fire Bet
  const challengeNote = shooter === "You"
    ? trackChallenge(state, results, { pointHit: pointHit, total: total, doubles: rolled.dice[0] === rolled.dice[1], sevenOut: sevenOut, multUsed: multUsed })
    : null;
  if (challengeNote) compNotes.push(challengeNote);
  trackRollUnlocks(state, { results: results, pointHit: pointHit, sevenOut: sevenOut, doubles: rolled.dice[0] === rolled.dice[1], multUsed: multUsed, shooter: shooter });
  recordRoll(state.stats, state, rolled, totalMoney(state) - moneyBefore, sevenOut, pointHit, odds, multUsed, shooter, state.turnRolls);
  afterRoll(state, sevenOut);

  // A free comp for hitting a point at a big mult.
  if (pointHit && multUsed >= CONFIG.freeCompMult && gainComp(state, randomComp(state))) {
    compNotes.push("The dealer is impressed: a free " + COMPS[state.comps[state.comps.length - 1]].name + " comp!");
  }
  const notes = crewBefore.concat(before.notes, cardNotes, crewNotes, compNotes);
  showMessage(describeRoll(total, results, pointBefore, state.point) + " " + notes.join(" "), sevenOut);
  saveRun(state); // settled: a refresh from here on won't settle this roll again

  // Bigger wins, bigger sounds (tiers are shares of the debt; a point hit is at least tier 2).
  const won = results.filter((r) => r.outcome === "win").reduce((sum, r) => sum + r.winnings, 0);
  const tier = 1 + CONFIG.winSoundTiers.filter((share) => won >= share * state.debt).length;
  const winSound = "win" + Math.max(tier, pointHit || challengeNote || (sevenOut && won > 0) ? 2 : 1);
  if (sevenOut && won > 0) playSound(winSound);
  else if (sevenOut) playSound("sevenOut");
  else if (won > 0 || pointHit || challengeNote) playSound(winSound);
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
    showSplash(pointWinSplash(pointBefore, wins, boosts), "good", CONFIG.winSplashMs, announceUnlocks);
  }
}

// Dealer Break buttons
function payDealer(amount) {
  const paid = deposit(state, amount);
  if (paid > 0 && state.status !== "won") playSound("plaque");
  if (paid > 0) plaqueJustDropped = true;
  let text = paid > 0 ? "Paid " + money(paid) + ". That money is safe now, and out of play." : "Nothing more you can pay.";
  if (state.status === "playing" && state.cash <= tableMin(state)) {
    text += " You keep " + money(tableMin(state)) + " for your Pass Line bet.";
  }
  showBreakMessage(text);
  renderAll();
}

// Drop one plaque in the drop box.
function payPlaque() {
  const r = dropPlaque(state);
  const why = {
    closed: "The dealer won't take payment until the first shooter has rolled.",
    money: "Not enough cash: a plaque can't take your cash below " + money(tableMin(state)) + ".",
    done: "The debt is paid.",
  };
  if (r.reason !== "ok") {
    showBreakMessage(why[r.reason]);
    return;
  }
  plaqueJustDropped = true;
  if (state.status !== "won") playSound("plaque");
  showBreakMessage("Dropped a " + money(r.paid) + " plaque in the box. " + (state.status === "won" ? "" : money(amountOwed(state)) + " to go."));
  renderAll();
}

// Shop buttons
function buy(slot) {
  const id = state.stock[slot];
  const outcome = buyCard(state, slot);
  const texts = {
    ok: id && CARDS[id].instant ? CARDS[id].name + ": done. " + (id === "bargain" ? "Your chain now has " + totalLinks(state) + " links, and 7s are a little rarer." : "") : "Bought " + (id && CARDS[id].name) + ".",
    full: "Your card slots are full (" + maxCards(state) + "). Sell a card first.",
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
    full: "Your comp slots are full (" + compSlots(state) + "). Use or sell one first.",
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
  showSplash(cutSplash(name), "bad", CONFIG.cutSplashMs, announceUnlocks);
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
  st.cards = wanted.split(",").filter((id) => CARDS[id]).slice(0, maxCards(st));
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
  state.phoneOffer = phoneOffer(state); // saved, so a refresh shows the same offer
  answerPhone();
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

// The Pit Boss phone: pick one of the offered perks.
function answerPhone() {
  playSound("ring");
  renderAll();
  showPhone(state, state.phoneOffer, (id, target) => {
    delete state.phoneOffer;
    takePerk(state, id, target);
    showBreakMessage("New perk: " + perkInfo(id).name + (target ? " (" + target + "'s seat dropped away)" : "") + ".");
    renderAll();
  });
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
let plaqueJustDropped = false; // the drop box animates the newest plaque

function renderAll() {
  showChips();
  renderState(state);
  renderShop(state, { buy: buy, sell: sell, cut: cut, hire: hireCrew });
  renderComps(state, { buyComp: buyCompSlot, sellComp: sellCompSlot, useComp: useCompSlot });
  renderHand(state, { useComp: useCompSlot });
  renderBreak(state);

  // Falling: the floor opens first, then the stats screen.
  if (state.status.startsWith("fell") && !fallPlayed) {
    fallPlayed = true;
    playSound("fall");
    playFall(CONFIG.fallMs, () => {
      renderEndScreen(state, endHandlers());
      announceUnlocks(); // things this run unlocked, shown before the next run starts
    });
  } else if (!fallingNow) {
    renderEndScreen(state, endHandlers());
  }

  // The first time the shop opens, explain it (then comps, on a later visit).
  if (state.onBreak && state.status === "playing" && isShopOpen(state) && !tutorialSeen("shop")) {
    markTutorialSeen("shop");
    showTutorial(shopPages());
  } else if (state.onBreak && state.status === "playing" && isShopOpen(state) && systemOn(state, "comps") && !tutorialSeen("comps")) {
    markTutorialSeen("comps");
    showTutorial(compPages());
  }
  announceUnlocks();
  explainNewBets();
  if (!awaitingResume) saveRun(state);
}

// The first time an unlocked bet is on the table in a run, explain it.
function explainNewBets() {
  if (busy() || tutorialOpen() || state.status !== "playing" || state.onBreak) return;
  const fresh = Object.keys(BET_GROUPS).filter((g) => available(state, g) && !tutorialSeen("bet." + g));
  if (!fresh.length) return;
  fresh.forEach((g) => markTutorialSeen("bet." + g));
  showTutorial(fresh.map((g) => ({ title: "New bet: " + BET_GROUPS[g].name, body: BET_GROUPS[g].text })));
}

// New unlocks: announce them once nothing else is on screen.
function announceUnlocks() {
  if (busy() || tutorialOpen() || (profile().fresh.length === 0 && profile().freshSystems.length === 0)) return;
  playSound("win2");
  showSplash(unlockSplash(takeFreshUnlocks(), takeFreshPerks(), takeFreshSystems()), "good", CONFIG.unlockSplashMs, renderAll);
}

document.getElementById("pass-line").onclick = () => placeBet("pass");
document.getElementById("odds").onclick = () => placeBet("odds");
document.getElementById("field").onclick = () => placeBet("field");
document.getElementById("dont-pass").onclick = () => placeBet("dont");
document.getElementById("lay").onclick = () => placeBet("lay");
document.getElementById("roll-button").onclick = roll;
document.getElementById("save-bets").onclick = () => {
  if (busy() || state.onBreak) return;
  const saved = saveBets(state);
  showMessage(saved ? "Saved: " + Object.entries(saved).map(([bet, amount]) => BET_NAMES[bet] + " " + money(amount)).join(", ") + ". Press ↻ Same bets to put them back."
    : "Nothing on the table to save.");
  renderState(state);
};
document.getElementById("same-bets").onclick = () => {
  if (busy() || state.onBreak || state.status !== "playing") return;
  if (!state.savedBets) {
    showMessage("No saved bets yet. Put chips down, then press 💾 Save bets.");
    return;
  }
  const r = rebet(state);
  const parts = [];
  if (r.placed.length) parts.push("Placed " + r.placed.map((p) => BET_NAMES[p.bet] + " " + money(p.amount)).join(", ") + ".");
  if (r.waiting.length) parts.push(r.waiting.map((b) => BET_NAMES[b]).join(", ") + (state.point === null ? " wait for a point: press again once it's set." : " can't go down right now."));
  if (r.short.length) parts.push("Not enough cash for " + r.short.map((b) => BET_NAMES[b]).join(", ") + ".");
  if (!parts.length) parts.push("Your saved bets are already on the table.");
  if (r.placed.length) playSound("chip");
  showMessage(parts.join(" "));
  renderAll();
};
document.getElementById("odds-button").onclick = () => {
  renderOddsPanel(state);
  document.getElementById("odds-popup").classList.remove("hidden");
};
document.getElementById("odds-close").onclick = () => document.getElementById("odds-popup").classList.add("hidden");
document.getElementById("house-rule").onclick = () => showMessage(HOUSE_RULES[state.houseRule.id].name + ": " + houseRuleText(state));
document.getElementById("dice").onclick = roll; // tapping the dice rolls too
document.getElementById("clear-button").onclick = clearBets;
document.getElementById("drop-plaque").onclick = payPlaque;
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

// Quick dice: skip the tumbling animation (remembered in this browser).
const normalDiceMs = CONFIG.diceRollMs;
let quickDice = false;
try {
  quickDice = localStorage.getItem("chainedDice.quickDice") === "yes";
} catch (e) {
  // Storage blocked: normal dice.
}
function applyQuickDice() {
  CONFIG.diceRollMs = quickDice ? 0 : normalDiceMs;
  document.getElementById("quick-dice").textContent = quickDice ? "On" : "Off";
}
applyQuickDice();
document.getElementById("quick-dice").onclick = () => {
  quickDice = !quickDice;
  try {
    localStorage.setItem("chainedDice.quickDice", quickDice ? "yes" : "no");
  } catch (e) {
    // Not saved; lasts until the page closes.
  }
  applyQuickDice();
};
document.getElementById("settings-button").onclick = () => {
  document.getElementById("settings-message").textContent = "";
  document.getElementById("settings").classList.remove("hidden");
};
document.getElementById("settings-close").onclick = () => document.getElementById("settings").classList.add("hidden");
document.getElementById("replay-tutorials").onclick = () => {
  forgetTutorials();
  document.getElementById("settings-message").textContent = "Done. Each tutorial will show again the next time it comes up.";
};
document.getElementById("settings-reset").onclick = () => {
  if (!confirm("Lock everything again and erase all unlock progress and Reputation? Your current run isn't affected.")) return;
  resetProfile();
  document.getElementById("settings-message").textContent = "Progress reset. Everything is locked again from your next run.";
};
document.getElementById("how-to-play").onclick = () => showTutorial(introPages());
document.getElementById("collection-button").onclick = showCollection;
document.getElementById("collection-close").onclick = () => document.getElementById("collection").classList.add("hidden");
document.getElementById("collection-reset").onclick = () => {
  if (!confirm("Lock everything again and erase all unlock progress? Your current run isn't affected.")) return;
  resetProfile();
  renderCollection();
};
document.getElementById("shop-help").onclick = () => showTutorial(shopPages());
document.getElementById("comps-help").onclick = () => showTutorial(compPages());

showChips();
renderMuteButton();
drawDie("die1", 1);
drawDie("die2", 1);
renderAll();

// The opening animation plays on top of whatever comes next.
playOpening(CONFIG.openingMs);

// First visit: the full introduction.
if (!tutorialSeen("intro")) {
  markTutorialSeen("intro");
  showTutorial(introPages());
}

// A run in progress was saved: continue it, or start fresh.
if (savedRun) {
  const where = savedRun.endless ? "endless shift " + savedRun.shift : "shift " + savedRun.shift;
  showChoice("Welcome back", "You have a run in progress: " + where + ", " + money(savedRun.cash) + " cash, " +
    money(savedRun.debt - savedRun.deposited) + " still owed.",
    [{ label: "Continue run", value: "continue" }, { label: "Start a new run", value: "new" }], (choice) => {
      awaitingResume = false;
      if (choice === "new") {
        clearRun();
        renderAll(); // saves the fresh run
        return;
      }
      resumeRun(savedRun);
    }, { cancel: false });
}

// Put a saved run back on the table, finishing a roll or phone call that was cut off.
function resumeRun(saved) {
  state = saved;
  showBreakMessage("");
  showMessage("Welcome back. Your run continues.");
  if (state.lastRoll) {
    drawDie("die1", state.lastRoll.dice[0]);
    drawDie("die2", state.lastRoll.dice[1]);
  }
  renderAll();
  if (state.pendingRoll) {
    drawDie("die1", state.pendingRoll.dice[0]);
    drawDie("die2", state.pendingRoll.dice[1]);
    offerRerollOrFinish(state.pendingRoll);
  } else if (state.phoneOffer) {
    answerPhone();
  }
}
