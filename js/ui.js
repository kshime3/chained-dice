// Display code: draws the game on screen. No game rules here.

// Which of a die's 9 spots (3 x 3 grid, read left to right) have a pip.
const PIP_SPOTS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function drawDie(id, value) {
  drawDieEl(document.getElementById(id), value);
}

// Draw pips for a value into any die element.
function drawDieEl(die, value) {
  die.innerHTML = "";
  for (let spot = 0; spot < 9; spot++) {
    const cell = document.createElement("span");
    if (PIP_SPOTS[value].includes(spot)) cell.className = "pip";
    die.appendChild(cell);
  }
}

// Tumble the dice through random faces, then land on the real result.
function animateDice(finalDice, ms, onDone) {
  const box = document.getElementById("dice");
  if (ms <= 0) {
    drawDie("die1", finalDice[0]);
    drawDie("die2", finalDice[1]);
    setTimeout(onDone, 0);
    return;
  }
  box.classList.add("rolling");
  const spin = setInterval(() => {
    drawDie("die1", 1 + Math.floor(Math.random() * 6));
    drawDie("die2", 1 + Math.floor(Math.random() * 6));
  }, 70);
  setTimeout(() => {
    clearInterval(spin);
    box.classList.remove("rolling");
    drawDie("die1", finalDice[0]);
    drawDie("die2", finalDice[1]);
    onDone();
  }, ms);
}
const BET_NAMES = { pass: "Pass Line", odds: "Odds", dont: "Don't Pass", lay: "Lay Odds", field: "Field", come: "Come", dontCome: "Don't Come", fire: "Fire Bet" };
for (const n of [4, 5, 6, 8, 9, 10]) {
  BET_NAMES["hard" + n] = "Hard " + n;
  BET_NAMES["place" + n] = "Place " + n;
  BET_NAMES["come" + n] = "Come bet on " + n;
  BET_NAMES["dcome" + n] = "Don't Come bet on " + n;
}

function money(n) {
  return "$" + n.toLocaleString();
}

// "Jinx's" or "Your", so sentences read right when it's your turn.
function whose(name) {
  return name === "You" ? "Your" : name + "'s";
}

function percent(p) {
  return (p * 100).toFixed(1) + "%";
}

// Chance of a 7 for a crew member, for hover cards and the break screen.
// Ghost's 7 chance is the same whichever side he picks, so evens is used.
function sevenChance(name, state) {
  const set = name === "You" && state ? state.myDice
    : name === "Lefty" && state && hasCard(state, "leftysGlove") ? { left: CONFIG.crewDice.Lefty.left, right: [1, 2, 3, 4, 5, 6] }
    : CONFIG.crewDice[name];
  const dice = set.right === "ghost" ? { left: set.left, right: CONFIG.ghostFaces.evens } : set;
  const now = state ? currentDice(state) : { extraWays: [], totalWays: [] };
  return diceOdds(Object.assign({}, dice, { extraWays: now.extraWays, totalWays: now.totalWays }))[7];
}

function renderChips(values, selectedChip, onPick) {
  const box = document.getElementById("chips");
  box.innerHTML = "";
  for (const value of values) {
    const chip = document.createElement("button");
    chip.className = "chip chip-" + value + (value === selectedChip ? " selected" : "");
    chip.textContent = money(value);
    chip.onclick = () => onPick(value);
    box.appendChild(chip);
  }
}

function renderState(state) {
  const b = state.bets;
  document.getElementById("shift-number").textContent = state.shift;
  document.getElementById("cash").textContent = money(state.cash);
  document.getElementById("interest").textContent = Math.round(state.interestRate * 1000) / 10 + "%";
  document.getElementById("paid").textContent = money(state.deposited) + " / " + money(state.debt);
  const progress = Math.min(100, (state.deposited / state.debt) * 100);
  document.getElementById("progress-fill").style.width = progress + "%";
  renderChainBar(state);
  renderCrew(state);
  renderOddsPanel(state);
  renderMult(state);
  renderHouseRule(state);
  renderChallenge(state);
  document.getElementById("on-table").textContent = money(betsTotal(b));
  renderExtraBoard(state);
  document.getElementById("table-min").textContent = "Table min " + money(tableMin(state));
  document.getElementById("pass-amount").textContent = money(b.pass);
  document.getElementById("dont-amount").textContent = money(b.dont);
  document.getElementById("field-amount").textContent = money(b.field);

  // Point marker
  const puck = document.getElementById("puck");
  puck.textContent = state.point === null ? "OFF · Come-out roll" : "ON · Point is " + state.point;
  puck.className = "puck " + (state.point === null ? "off" : "on");

  // Line bets lock while a point is on (the one you're not on is just closed)
  const pointOn = state.point !== null;
  for (const [id, lockId, bet] of [["pass-line", "pass-lock", "pass"], ["dont-pass", "dont-lock", "dont"]]) {
    document.getElementById(id).classList.toggle("locked", pointOn && b[bet] > 0);
    document.getElementById(id).classList.toggle("disabled", pointOn && b[bet] === 0);
    document.getElementById(lockId).textContent = pointOn && b[bet] > 0 ? "🔒 Locked" : "";
    document.getElementById(lockId).title = "Locked until the point is hit or a 7 rolls.";
  }

  // Dark Side Only: the Pass Line is closed all shift
  if (!passAllowed(state)) {
    document.getElementById("pass-line").classList.add("disabled");
    document.getElementById("pass-lock").textContent = "Closed: Dark Side Only";
  }

  // Odds and Lay Odds open while a point is on, behind the matching line bet
  for (const [id, bet, line] of [["odds", "odds", "pass"], ["lay", "lay", "dont"]]) {
    const open = pointOn && b[line] > 0;
    document.getElementById(id).classList.toggle("disabled", !open);
    document.getElementById(bet + "-amount").textContent = open ? money(b[bet]) + " / max " + money(backingLimit(state, bet)) : "";
  }

  if (state.lastRoll) {
    drawDie("die1", state.lastRoll.dice[0]);
    drawDie("die2", state.lastRoll.dice[1]);
    document.getElementById("total").textContent = "Total: " + state.lastRoll.total;
  }
}

// The seats around the table. Finished shooters are dimmed.
function renderCrew(state) {
  const box = document.getElementById("crew");
  box.innerHTML = "";
  state.crew.forEach((name, i) => {
    const seat = document.createElement("div");
    seat.className = "seat" + (i === state.shooterIndex ? " shooting" : "") + (i < state.shooterIndex ? " done" : "");
    const crafted = name === "You" && isEdited(state);
    const encore = name === "You" && i > 0 && state.crew.indexOf("You") < i;
    seat.innerHTML = "⛓<br>" + name + (crafted ? " 🔨" : "") + (encore ? " (Encore)" : "");
    const info = CREW_INFO[name];
    if (info) {
      const tip = document.createElement("div");
      tip.className = "tooltip";
      const faces = name === "You" ? "<br>Left die: " + state.myDice.left.join(" ") + "<br>Right die: " + state.myDice.right.join(" ") : "";
      tip.innerHTML = "<strong>" + name + "</strong><br>Dice: " + info.dice + faces + "<br>Style: " + info.style +
        "<br>Current chance of a 7: <strong>" + percent(sevenChance(name, state)) + "</strong> (normal dice: 16.7%)";
      seat.appendChild(tip);
    }
    box.appendChild(seat);
  });
  const shooter = state.crew[state.shooterIndex];
  document.getElementById("shooter").textContent = shooter
    ? "Now shooting: " + shooter + " (shooter " + (state.shooterIndex + 1) + " of " + state.crew.length + ")"
    : "Every shooter has had a turn.";
}

// This shift's house rule as a tag with hover text.
function houseRuleText(state) {
  const r = state.houseRule;
  if (!r) return "";
  const info = HOUSE_RULES[r.id];
  let text = info.text;
  if (r.id === "houseDie") text = "Every shooter's left die is set to " + r.x + " this shift (unless that leaves no way to roll 7).";
  if (r.id === "pitWatch") text = "The pit boss is watching your " + CARDS[r.disabled].name + ". It's switched off this shift.";
  return text;
}

function renderHouseRule(state) {
  const box = document.getElementById("house-rule");
  box.classList.toggle("hidden", !state.houseRule);
  if (!state.houseRule) return;
  const info = HOUSE_RULES[state.houseRule.id];
  box.className = "house-rule" + (info.boss ? " boss" : "");
  box.innerHTML = (info.boss ? "👑 Boss rule: " : "📜 House rule: ") + "<strong>" + info.name + "</strong>" +
    '<div class="tooltip">' + houseRuleText(state) + "</div>";
}

// The pit boss challenge on your turn.
function renderChallenge(state) {
  const box = document.getElementById("challenge");
  const c = state.challenge;
  const show = !!c && state.crew[state.shooterIndex] === "You";
  box.classList.toggle("hidden", !show);
  if (!show) return;
  const info = CHALLENGES[c.id];
  box.className = "challenge" + (c.done ? " done" : "");
  box.innerHTML = c.done
    ? "🎯 Challenge done: " + info.text + " ✓"
    : "🎯 " + info.text + (info.target > 1 ? " (" + c.progress + "/" + info.target + ")" : "") + " → " + rewardText(state, c.reward);
}

// The Dealer Break: pay toward the debt between shooters.
function renderBreak(state) {
  const screen = document.getElementById("break-screen");
  if (!state.onBreak || state.status !== "playing") {
    screen.classList.add("hidden");
    return;
  }
  screen.classList.remove("hidden");

  let intro;
  if (state.shooterIndex === 0 && state.lastRoll === null) {
    const left = totalLinks(state) - linksBroken(state);
    intro = state.shift === 1
      ? "The dealer leans in. \"You owe me " + money(state.debt) + " by the end of the shift. Pay it and I'll unlock a link.\" Pay any time between shooters. Paid money is safe, but you can't bet it."
      : "Shift " + state.shift + ". " + (state.endless ? "Endless mode, no chain left to break. " : left + (left === 1 ? " link" : " links") + " to go. ") +
        (state.dealerCut > 0 ? "The dealer kept " + money(state.dealerCut) + " of your leftover money as his cut. " : "") +
        "The pit boss hands you " + money(state.cashAdded) + " in cash. The dealer leans in: \"This time you owe me " + money(state.debt) + ".\" The table minimum is now " + money(tableMin(state)) + ".";
    if (state.houseRule) intro += " " + (HOUSE_RULES[state.houseRule.id].boss ? "Boss rule" : "House rule") + " this shift: " + HOUSE_RULES[state.houseRule.id].name + ". " + houseRuleText(state);
  } else if (isFinalBreak(state)) {
    intro = "Every shooter has sevened out. Last chance to pay before the pit boss judges you.";
  } else {
    const next = state.crew[state.shooterIndex];
    const before = next === "You" ? "Before you shoot" : "Before " + next + " shoots";
    intro = before + ", you can pay the dealer. " + whose(next) + " current chance of a 7: " + percent(diceOdds(currentDice(state))[7]) + ".";
  }
  document.getElementById("break-intro").textContent = intro;

  // A seven-out is bad news: say it big and red.
  const who = state.sevenOutBy;
  document.getElementById("seven-out-banner").innerHTML = who
    ? '<div class="big">SEVEN OUT!</div>' + (who === "You" ? "You" : who) + " sevened out."
    : "";

  // The shop opens after the first shooter (its tutorial is shown by main.js).
  document.getElementById("shop-section").classList.toggle("hidden", !isShopOpen(state));
  document.getElementById("break-owed").textContent = money(amountOwed(state));
  document.getElementById("break-cash").textContent = money(state.cash);
  const rate = Math.round(state.interestRate * 1000) / 10 + "%";
  document.getElementById("break-interest").innerHTML = state.lastInterest > 0
    ? "Interest added to your cash: <strong>+" + money(state.lastInterest) + "</strong> (" + rate + " of the " + money(state.deposited) + " you've paid)."
    : "Paid money earns " + rate + " interest at every Break, added to your cash.";

  // Paying opens after the first shooter. Pay off debt needs the whole amount.
  const payOpen = canPay(state);
  document.getElementById("pay-typed").disabled = !payOpen;
  document.getElementById("deposit-amount").disabled = !payOpen;
  document.getElementById("pay-closed").textContent = payOpen ? "" :
    "The dealer won't take payment until the first shooter has rolled. Shop first, then pay at the next Break.";
  const payOff = document.getElementById("pay-off");
  payOff.disabled = !payOpen || state.cash < amountOwed(state);
  payOff.textContent = "Pay off debt (" + money(amountOwed(state)) + ")";
  payOff.title = payOff.disabled ? "You need the full amount in cash to pay off the debt." : "";
  document.getElementById("leave-break").textContent = isFinalBreak(state)
    ? "Face the pit boss"
    : "Next shooter: " + state.crew[state.shooterIndex];

  const warn = !isFinalBreak(state) && totalMoney(state) < tableMin(state);
  document.getElementById("break-warning").textContent = warn
    ? "Warning: you need " + money(tableMin(state)) + " to bet the Pass Line. Leave now and you fall."
    : "";
}

function showBreakMessage(text) {
  document.getElementById("break-message").textContent = text;
}

// The current mult, and why (synergies).
function renderMult(state) {
  const box = document.getElementById("mult");
  if (!state.crew[state.shooterIndex]) {
    box.textContent = "";
    return;
  }
  const mult = effectiveMult(state);
  const notes = multReasons(state);
  box.innerHTML = "Mult: <strong>" + mult + "x</strong>" + (notes.length ? " · " + notes.join(" · ") : "");
  box.className = "mult" + (mult > 1 ? " hot" : mult < 1 ? " cold" : "");
}

// One card as a box: name, rarity, what it does, plus an optional button.
function cardBox(id, buttonText, onClick, disabled) {
  const card = CARDS[id];
  const rarity = CONFIG.cardRarity[id];
  const box = document.createElement("div");
  box.className = "card " + rarity;
  box.innerHTML = '<div class="card-name">' + card.name + '</div><div class="card-rarity">' + rarity +
    '</div><div class="card-text">' + card.text + "</div>";
  if (buttonText) {
    const button = document.createElement("button");
    button.textContent = buttonText;
    button.disabled = !!disabled;
    button.onclick = onClick;
    box.appendChild(button);
  }
  return box;
}

// The shop on the Dealer Break, plus your cards on the main screen.
// handlers: { buy(slot), sell(id) } from main.js
function renderShop(state, handlers) {
  const stockBox = document.getElementById("stock");
  stockBox.innerHTML = "";
  const full = state.cards.length >= maxCards(state);
  state.stock.forEach((id, slot) => {
    if (!id) {
      const empty = document.createElement("div");
      empty.className = "card sold-out";
      empty.textContent = "Sold out";
      stockBox.appendChild(empty);
      return;
    }
    const price = buyPrice(state, id);
    const label = price === 0 ? "Take it FREE (" + state.freeBuys + " left)" : "Buy " + money(price);
    stockBox.appendChild(cardBox(id, label, () => handlers.buy(slot), full || !canSpend(state, price)));
  });
  document.getElementById("shuffle").textContent = state.freeShuffles > 0
    ? "Shuffle (free x" + state.freeShuffles + ")"
    : "Shuffle (" + money(shuffleCost(state)) + ")";
  document.getElementById("shuffle").disabled = !canSpend(state, shuffleCost(state));

  // Your cards, with Sell buttons (break screen)
  document.getElementById("slots").textContent = state.cards.length + " / " + maxCards(state);
  const owned = document.getElementById("owned");
  owned.innerHTML = state.cards.length ? "" : '<p class="hint">No cards yet.</p>';
  for (const id of state.cards) {
    owned.appendChild(cardBox(id, "Sell for " + money(sellPrice(state, id)), () => handlers.sell(id)));
  }

  // Trapdoor: one button per crew member who hasn't shot yet (Break screen)
  const cutRow = document.getElementById("cut-row");
  cutRow.innerHTML = "";
  for (const name of cuttableCrew(state)) {
    const button = document.createElement("button");
    button.textContent = "Trapdoor: " + name + " (" + money(cutChainPrice(state)) + ")";
    button.disabled = !canSpend(state, cutChainPrice(state));
    button.onclick = () => handlers.cut(name);
    cutRow.appendChild(button);
  }
  if (!cutRow.children.length) cutRow.innerHTML = '<p class="hint">Nobody left to drop this shift.</p>';

  // Hire: new crew for an empty seat (Break screen)
  const seatsFree = CONFIG.maxSeats - state.roster.length;
  document.getElementById("hire-hint").textContent = seatsFree > 0
    ? seatsFree + (seatsFree === 1 ? " empty seat" : " empty seats") + ". New crew shoot last this shift, then keep their seat for the run."
    : "Every seat is taken (" + CONFIG.maxSeats + "). Open a Trapdoor to make room.";
  const hireRow = document.getElementById("hire-row");
  hireRow.innerHTML = "";
  for (const name of state.hireOffers) {
    const info = CREW_INFO[name];
    const box = document.createElement("div");
    box.className = "card hire-card";
    box.innerHTML = '<div class="card-name">⛓ ' + name + '</div><div class="card-rarity">crew</div><div class="card-text">' +
      info.dice + " " + info.style + "<br>Chance of a 7: " + percent(sevenChance(name, state)) + "</div>";
    const button = document.createElement("button");
    button.textContent = "Hire " + money(hirePrice(state, name));
    button.disabled = seatsFree <= 0 || !canSpend(state, hirePrice(state, name));
    button.onclick = () => handlers.hire(name);
    box.appendChild(button);
    hireRow.appendChild(box);
  }
  if (!state.hireOffers.length) hireRow.innerHTML = '<p class="hint">Nobody looking for a seat right now.</p>';

  // Ghost Story: pick Ghost's die when he's up next
  const ghostNext = state.onBreak && state.crew[state.shooterIndex] === "Ghost" && hasCard(state, "ghostStory");
  document.getElementById("ghost-pick").classList.toggle("hidden", !ghostNext);
  document.getElementById("ghost-evens").classList.toggle("selected-option", state.ghostPick === "evens");
  document.getElementById("ghost-odds").classList.toggle("selected-option", state.ghostPick === "odds");

  // Your cards as small badges with hover text (main screen)
  const badges = document.getElementById("my-cards");
  badges.innerHTML = "";
  // Phone perks first (purple), with repeats grouped: "-1 way to roll 7 x2".
  // One-time perks (Free Trapdoor, free items) don't stay as badges.
  if (state.freeBuys > 0) {
    const free = document.createElement("div");
    free.className = "card-badge perk";
    free.textContent = "☎ " + state.freeBuys + " free shop card" + (state.freeBuys > 1 ? "s" : "") + " left";
    badges.appendChild(free);
  }
  if (state.extraLinks > 0) {
    const deal = document.createElement("div");
    deal.className = "card-badge perk";
    deal.innerHTML = "⛓ Dealer's Bargain" + (state.extraLinks > 1 ? " x" + state.extraLinks : "") +
      '<div class="tooltip"><strong>Dealer\'s Bargain</strong><br>' + state.extraLinks + " extra link" + (state.extraLinks > 1 ? "s" : "") +
      " on your chain, and -" + state.extraLinks + " way" + (state.extraLinks > 1 ? "s" : "") + " to roll 7 on everyone's dice.</div>";
    badges.appendChild(deal);
  }
  for (const id of [...new Set(state.perks)].filter((p) => p.startsWith("plus") || p === "minusSeven")) {
    const info = perkInfo(id);
    const n = countPerk(state, id);
    const badge = document.createElement("div");
    badge.className = "card-badge perk";
    badge.innerHTML = "☎ " + info.name + (n > 1 ? " x" + n : "") + '<div class="tooltip"><strong>' + info.name + "</strong><br>" + info.text + "</div>";
    badges.appendChild(badge);
  }
  for (const id of state.cards) {
    const badge = document.createElement("div");
    const off = rule(state, "pitWatch") && state.houseRule.disabled === id;
    badge.className = "card-badge " + CONFIG.cardRarity[id] + (off ? " switched-off" : "");
    badge.innerHTML = (off ? "👁 " : "") + CARDS[id].name + '<div class="tooltip"><strong>' + CARDS[id].name + "</strong><br>" + CARDS[id].text +
      (off ? "<br><em>Switched off this shift (Pit Watch).</em>" : "") + "</div>";
    badges.appendChild(badge);
  }
}

// Comps: the shop row and your comps on the Break screen, plus Use buttons on the table.
// handlers: { buyComp(slot), sellComp(index), useComp(index) }
function renderComps(state, handlers) {
  document.getElementById("comp-slots").textContent = compSlots(state);
  const stock = document.getElementById("comp-stock");
  stock.innerHTML = "";
  state.compStock.forEach((id, slot) => {
    if (!id) {
      const empty = document.createElement("div");
      empty.className = "card comp sold-out";
      empty.textContent = "Sold out";
      stock.appendChild(empty);
      return;
    }
    stock.appendChild(compBox(id, "Buy " + money(compPrice(state, id)), () => handlers.buyComp(slot),
      state.comps.length >= compSlots(state) || !canSpend(state, compPrice(state, id))));
  });

  const owned = document.getElementById("comp-owned");
  owned.innerHTML = "";
  state.comps.forEach((id, i) => {
    const box = compBox(id, "Use", () => handlers.useComp(i), !!compBlocked(state, id));
    const sell = document.createElement("button");
    sell.textContent = "Sell for " + money(compSellPrice(state, id));
    sell.onclick = () => handlers.sellComp(i);
    box.appendChild(sell);
    owned.appendChild(box);
  });

  // On the table: one small Use button per comp you hold, in the same row as your cards
  // (renderShop has just refilled that row, so comps go in front).
  const row = document.getElementById("my-cards");
  const first = row.firstChild;
  const add = (el) => row.insertBefore(el, first);
  state.comps.forEach((id, i) => {
    const blocked = compBlocked(state, id);
    const button = document.createElement("button");
    button.className = "comp-chip";
    button.textContent = "🎟 " + COMPS[id].name;
    button.title = COMPS[id].text + (blocked ? " (" + blocked + ")" : " Click to use.");
    button.disabled = !!blocked;
    button.onclick = () => handlers.useComp(i);
    add(button);
  });
  for (const id of Object.keys(state.armed)) {
    const tag = document.createElement("span");
    tag.className = "comp-chip armed";
    tag.textContent = "⚡ " + COMPS[id].name + " armed";
    add(tag);
  }
}

function compBox(id, buttonText, onClick, disabled) {
  const c = COMPS[id];
  const box = document.createElement("div");
  box.className = "card comp";
  box.innerHTML = '<div class="card-name">🎟 ' + c.name + '</div><div class="card-rarity comp-when">' +
    { roll: "next roll", now: "use any time", break: "at a Break" }[c.when] + '</div><div class="card-text">' + c.text + "</div>";
  const button = document.createElement("button");
  button.textContent = buttonText;
  button.disabled = !!disabled;
  button.onclick = onClick;
  box.appendChild(button);
  return box;
}

// The dice workshop: pick a face on your dice, choose the change, watch it reforge.
// edit: "nudge" | "copycat" | "chisel". onApply({ die, index, value }) returns true if it worked.
let workshopOpen = false;
function showWorkshop(state, edit, onApply, onCancel) {
  const box = document.getElementById("workshop");
  const names = { nudge: "Nudge", copycat: "Copycat", chisel: "Chisel" };
  const how = {
    nudge: "Pick a face, then move it up or down by 1.",
    copycat: "Pick the face to replace, then the face to copy onto it (same die).",
    chisel: "Pick a face, then carve it into any number.",
  };
  document.getElementById("workshop-title").textContent = "🔨 " + names[edit];
  document.getElementById("workshop-text").textContent = how[edit];
  const options = document.getElementById("workshop-options");
  const now = percent(sevenWays(state.myDice) / 36);
  let busyForging = false;

  const drawRows = (selected) => {
    for (const die of ["left", "right"]) {
      const row = document.getElementById("workshop-" + die);
      row.innerHTML = "";
      state.myDice[die].forEach((value, index) => {
        const tile = document.createElement("button");
        tile.className = "die face-tile" + (selected && selected.die === die && selected.index === index ? " selected" : "");
        drawDieEl(tile, value);
        tile.onclick = () => { if (!busyForging) pickFace(die, index); };
        row.appendChild(tile);
      });
    }
  };

  const pickFace = (die, index) => {
    drawRows({ die: die, index: index });
    const from = state.myDice[die][index];
    let choices;
    if (edit === "nudge") choices = ["up", "down"].map((c) => ({ value: editedValue(state, edit, die, index, c), label: c === "up" ? "▲ Up" : "▼ Down" }));
    else if (edit === "copycat") choices = state.myDice[die].map((v, i) => i).filter((i) => i !== index && state.myDice[die][i] !== from)
      .map((i) => ({ value: state.myDice[die][i], label: "Copy the " + state.myDice[die][i] }));
    else choices = [1, 2, 3, 4, 5, 6].filter((v) => v !== from).map((v) => ({ value: v, label: "Carve a " + v }));
    // One button per distinct result, showing what it does to your 7s.
    const seen = new Set();
    options.innerHTML = '<p class="hint">Your ' + die + " die's " + from + ". Your chance of a 7 now: " + now +
      ". (Editing one die alone never changes your 7s; edit both to change them.)</p>";
    for (const c of choices) {
      if (seen.has(c.value)) continue;
      seen.add(c.value);
      const after = sevenWays(previewDice(state, die, index, c.value));
      const blocked = after < CONFIG.minSevenWays - 1e-9;
      const b = document.createElement("button");
      b.className = "big-button";
      b.disabled = blocked;
      const changes = editChanges(state, previewDice(state, die, index, c.value), 2)
        .map((x) => x.total + "s " + percent(x.before) + " → " + percent(x.after)).join(", ");
      b.innerHTML = c.label + " → " + c.value + '<br><span class="hint">' +
        (blocked ? "Not allowed: too few ways to roll 7" : (changes || "no change in totals") + (Math.abs(after / 36 - sevenWays(state.myDice) / 36) > 1e-9 ? "" : " · 7s stay " + now)) + "</span>";
      b.onclick = () => forge(die, index, c.value);
      options.appendChild(b);
    }
    if (!seen.size) options.innerHTML += '<p class="hint">Nothing to copy: every other face on this die already matches.</p>';
  };

  // The reforge: the face rises, flips, and lands as its new number.
  const forge = (die, index, value) => {
    if (!onApply({ die: die, index: index, value: value })) return;
    busyForging = true;
    options.innerHTML = "";
    playSound("clank");
    const tile = document.getElementById("workshop-" + die).children[index];
    tile.classList.add("reforging");
    setTimeout(() => { drawDieEl(tile, value); playSound("snap"); }, 550);
    setTimeout(() => {
      tile.classList.remove("reforging");
      tile.classList.add("forged");
    }, 1200);
    setTimeout(() => close(), 2000);
  };

  const close = () => {
    workshopOpen = false;
    box.classList.add("hidden");
  };
  document.getElementById("workshop-cancel").onclick = () => {
    if (busyForging) return;
    close();
    onCancel();
  };
  options.innerHTML = "";
  drawRows(null);
  workshopOpen = true;
  box.classList.remove("hidden");
}

// A small pick-one screen. options: [{ label, value }]. onChoose(value) or onChoose(null) for Cancel.
function showChoice(title, text, options, onChoose) {
  const box = document.getElementById("choice");
  document.getElementById("choice-title").textContent = title;
  document.getElementById("choice-text").textContent = text;
  const buttons = document.getElementById("choice-buttons");
  buttons.innerHTML = "";
  const done = (value) => {
    box.classList.add("hidden");
    onChoose(value);
  };
  for (const o of options) {
    const b = document.createElement("button");
    b.className = "big-button";
    b.textContent = o.label;
    b.onclick = () => done(o.value);
    buttons.appendChild(b);
  }
  const cancel = document.createElement("button");
  cancel.textContent = "Cancel";
  cancel.onclick = () => done(null);
  buttons.appendChild(cancel);
  box.classList.remove("hidden");
}

// Bar chart of the current shooter's chance of each total.
function renderOddsPanel(state) {
  const panel = document.getElementById("odds-panel");
  const name = state.crew[state.shooterIndex];
  if (!name) {
    panel.innerHTML = "";
    return;
  }
  const charm = nextRollPairs(state);
  const odds = diceOdds(currentDice(state), charm);
  let bars = "";
  for (let t = 2; t <= 12; t++) {
    const share = Math.min(1, odds[t] / 0.25); // 25% fills the bar (height set in CSS)
    let cls = "bar";
    if (t === 7) cls += " seven";
    if (t === state.point) cls += " point";
    if (odds[t] === 0) cls += " impossible";
    bars += '<div class="' + cls + '"><span class="pct">' + Math.round(odds[t] * 100) + '%</span>' +
      '<div class="fill" style="height: calc(var(--bar-max) * ' + share + ')"></div><span class="num">' + t + "</span></div>";
  }
  let summary = whose(name) + " dice: current chance of a 7 is <strong>" + percent(odds[7]) + "</strong><span class=\"hide-mobile\"> (normal: 16.7%)</span>.";
  if (state.point !== null) {
    const hit = pointBeforeSeven(odds, state.point);
    summary += " The " + state.point + " before a 7: <strong>" + percent(hit) + "</strong> (Pass) · 7 first: <strong>" + percent(1 - hit) + "</strong> (Don't).";
  }
  if (state.dice.note) summary += " " + state.dice.note;
  if (pairDue(state)) summary += " <strong>Doubles Charm: next roll is a pair!</strong>";
  const armed = Object.keys(state.armed).map((id) => COMPS[id].name + (id === "loadedShot" ? " (left die " + state.armed[id] + ")" : ""));
  if (armed.length) summary += ' <strong class="armed-text">Armed: ' + armed.join(", ") + ".</strong>";
  panel.innerHTML = '<div class="bars">' + bars + '</div><div class="odds-summary">' + summary + "</div>";
}

// Show the win or fall screen when the shift is over.
// A chain of links as HTML. broken: how many are already open. breaking: the index
// of the link that snaps now (-1 for none). big: the large end-of-shift version.
function chainHtml(broken, breaking, big, total) {
  let html = '<div class="chain' + (big ? " big" : "") + '">';
  for (let i = 0; i < total; i++) {
    let cls = "link";
    if (i < broken) cls += " broken";
    if (i === breaking) cls += " breaking";
    html += '<span class="' + cls + '"><span class="half l"></span><span class="half r"></span>';
    if (i === breaking) {
      for (let k = 0; k < 7; k++) {
        html += '<span class="spark" style="--dx:' + (Math.random() * 120 - 60).toFixed(0) + "px;--dy:" + (Math.random() * -70 - 10).toFixed(0) + 'px"></span>';
      }
    }
    html += "</span>";
  }
  return html + "</div>";
}

function renderChainBar(state) {
  const bar = document.getElementById("chain-bar");
  if (state.endless) {
    bar.innerHTML = '<span class="chain-label">FREE · Endless shift ' + state.shift + "</span>";
    return;
  }
  const broken = linksBroken(state);
  bar.innerHTML = chainHtml(broken, -1, false, totalLinks(state)) + '<span class="chain-label">' + broken + " of " + totalLinks(state) + " links broken</span>";
  bar.title = "Survive a shift and the dealer unlocks a link. Break all " + totalLinks(state) + " to walk out free.";
}

// The end of a shift (won), the escape, or the fall.
// handlers: { primary, secondary } from main.js
let chainShownFor = ""; // so the link only breaks once per win
function renderEndScreen(state, handlers) {
  const screen = document.getElementById("end-screen");
  if (state.status === "playing") {
    screen.classList.add("hidden");
    return;
  }
  const kept = money(totalMoney(state));
  const next = shiftScale(state.shift + 1);
  const linksLeft = totalLinks(state) - linksBroken(state);
  let title, body, primary, secondary = null, showStats = false, mood = "won";

  if (state.status === "won" && hasEscaped(state) && state.walkedAway) {
    title = "YOU WALK OUT FREE.";
    body = "You walked away from the table with " + kept + " in your pocket. Nobody stops you.";
    primary = "Play again";
    showStats = true;
  } else if (state.status === "won" && hasEscaped(state)) {
    title = "YOU WALK OUT FREE.";
    body = "The last link falls away. You stand up from the table, and nobody stops you. The dealer smiles: \"Double or nothing?\"";
    primary = "Double or nothing";
    secondary = "Walk away";
    showStats = true;
  } else if (state.status === "won") {
    title = state.savedByLink ? "THE SPARE LINK CATCHES YOU." : "THE FLOOR HOLDS.";
    const left = totalMoney(state);
    const carry = Math.floor(left * carryShare(state));
    body = '<p class="end-lead">' + (state.savedByLink
      ? "The floor opens, but your spare link snags on the edge and holds. The dealer sighs and forgives the rest of the debt."
      : "The dealer reaches over and unlocks a link. <em>Clank.</em>") + "</p>" +
      '<div class="end-big">' + (state.endless ? "Endless shift " + state.shift + " survived" : linksLeft + (linksLeft === 1 ? " link" : " links") + " to go") + "</div>" +
      '<div class="end-lines">' +
      "<div><span>Money left</span><strong>" + money(left) + "</strong></div>" +
      "<div><span>Dealer's cut (" + Math.round((1 - carryShare(state)) * 100) + "%)</span><strong>-" + money(left - carry) + "</strong></div>" +
      '<div class="total"><span>You carry over</span><strong>' + money(carry) + "</strong></div>" +
      "</div>" +
      '<p class="end-next">Shift ' + (state.shift + 1) + ": +" + money(next.cash) + " cash · you'll owe <strong>" + money(next.debt) + "</strong> · table min " + money(next.minBet) + "</p>";
    primary = "Answer the phone";
  } else {
    mood = "fell";
    title = "THE FLOOR OPENS.";
    const why = state.status === "fell-broke"
      ? "You couldn't cover the " + money(tableMin(state)) + " line bet."
      : "You only paid " + money(state.deposited) + " of the " + money(state.debt) + " you owed.";
    body = why + (state.endless
      ? " You walked out free once. Greed brought you back. You lasted " + (state.shift - 1 - totalLinks(state)) + " extra shifts."
      : " The chains drag the whole crew down into the dark. You broke " + linksBroken(state) + " of " + totalLinks(state) + " links.");
    primary = "Play again";
    showStats = true;
  }

  document.getElementById("end-title").textContent = title;
  document.getElementById("end-body").innerHTML = body;
  document.getElementById("run-stats").innerHTML = showStats ? runStatsHtml(state) : "";
  const first = document.getElementById("play-again");
  first.textContent = primary;
  first.onclick = handlers.primary;
  const second = document.getElementById("second-button");
  second.classList.toggle("hidden", !secondary);
  second.textContent = secondary || "";
  second.onclick = handlers.secondary;

  // The link-breaking animation, once per won shift (not in endless mode).
  const chainBox = document.getElementById("chain-break");
  const key = state.shift + ":" + state.status + ":" + state.walkedAway;
  if (state.status === "won" && !state.endless && !state.walkedAway) {
    if (chainShownFor !== key) {
      chainBox.innerHTML = chainHtml(linksBroken(state) - 1, linksBroken(state) - 1, true, totalLinks(state));
      playSound("shiftWon");
      setTimeout(() => playSound("snap"), 900);
    }
  } else if (chainShownFor !== key) {
    chainBox.innerHTML = "";
  }
  chainShownFor = key;
  screen.className = "overlay " + mood;
}

// ---------- End-of-run stats screen ----------

function statTile(label, value, detail) {
  return '<div class="stat-tile"><div class="stat-label">' + label + '</div><div class="stat-value">' + value + "</div>" +
    (detail ? '<div class="stat-detail">' + detail + "</div>" : "") + "</div>";
}

// Line chart: money in play after every roll, with shift starts marked.
function moneyChartSvg(stats) {
  const data = stats.history;
  if (data.length < 2) return '<p class="hint">Not enough rolls for a chart.</p>';
  const w = 420, h = 150, padL = 44, padR = 8, padT = 12, padB = 22;
  const max = Math.max(...data, 1);
  const x = (i) => padL + (i / (data.length - 1)) * (w - padL - padR);
  const y = (v) => padT + (1 - v / max) * (h - padT - padB);
  let svg = '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="Money in play after each roll">';
  // Recessive grid: 0, half, max
  for (const v of [0, max / 2, max]) {
    svg += '<line class="grid" x1="' + padL + '" x2="' + (w - padR) + '" y1="' + y(v) + '" y2="' + y(v) + '"/>' +
      '<text class="axis" x="' + (padL - 6) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + money(Math.round(v)) + "</text>";
  }
  // Shift starts (labels only where there's room, so they don't overlap)
  let lastLabel = -Infinity;
  stats.shiftStarts.forEach((start, k) => {
    if (k === 0) return;
    const sx = x(Math.min(start, data.length - 1));
    svg += '<line class="shift-line" x1="' + sx + '" x2="' + sx + '" y1="' + padT + '" y2="' + (h - padB) + '"/>';
    if (sx - lastLabel > 34) {
      svg += '<text class="axis" x="' + (sx + 3) + '" y="' + (padT + 8) + '">S' + (k + 1) + "</text>";
      lastLabel = sx;
    }
  });
  svg += '<polyline class="money-line" points="' + data.map((v, i) => x(i) + "," + y(v)).join(" ") + '"/>';
  // Hover targets, bigger than the line
  data.forEach((v, i) => {
    svg += '<circle class="hit" cx="' + x(i) + '" cy="' + y(v) + '" r="6"><title>Roll ' + (i + 1) + ": " + money(v) + "</title></circle>";
  });
  svg += '<text class="axis" x="' + padL + '" y="' + (h - 6) + '">Roll 1</text>' +
    '<text class="axis" x="' + (w - padR) + '" y="' + (h - 6) + '" text-anchor="end">Roll ' + data.length + "</text>";
  return svg + "</svg>";
}

// Bar chart: how often each total came up, with a tick for what the dice odds expected.
function totalsChartSvg(stats) {
  const w = 420, h = 150, padL = 8, padR = 8, padT = 14, padB = 22;
  let max = 1;
  for (let t = 2; t <= 12; t++) max = Math.max(max, stats.totals[t], stats.expected[t]);
  const slot = (w - padL - padR) / 11;
  const y = (v) => padT + (1 - v / max) * (h - padT - padB);
  let svg = '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="Times each total was rolled, against what the dice odds expected">';
  svg += '<line class="grid" x1="' + padL + '" x2="' + (w - padR) + '" y1="' + y(0) + '" y2="' + y(0) + '"/>';
  for (let t = 2; t <= 12; t++) {
    const left = padL + (t - 2) * slot;
    const barX = left + slot * 0.2, barW = slot * 0.6;
    const count = stats.totals[t], exp = stats.expected[t];
    const top = y(count);
    const tip = "<title>" + t + ": rolled " + count + " times, expected about " + exp.toFixed(1) + "</title>";
    if (count > 0) {
      svg += '<path class="' + (t === 7 ? "bar seven" : "bar") + '" d="M' + barX + "," + y(0) + " V" + (top + 4) +
        " Q" + barX + "," + top + " " + (barX + 4) + "," + top + " H" + (barX + barW - 4) +
        " Q" + (barX + barW) + "," + top + " " + (barX + barW) + "," + (top + 4) + " V" + y(0) + ' Z">' + tip + "</path>";
      svg += '<text class="bar-label" x="' + (barX + barW / 2) + '" y="' + (top - 4) + '" text-anchor="middle">' + count + "</text>";
    }
    svg += '<line class="expected" x1="' + (left + slot * 0.1) + '" x2="' + (left + slot * 0.9) + '" y1="' + y(exp) + '" y2="' + y(exp) + '">' + tip + "</line>";
    svg += '<rect class="hit" x="' + left + '" y="' + padT + '" width="' + slot + '" height="' + (h - padT - padB) + '">' + tip + "</rect>";
    svg += '<text class="axis" x="' + (left + slot / 2) + '" y="' + (h - 6) + '" text-anchor="middle">' + t + "</text>";
  }
  return svg + "</svg>";
}

function runStatsHtml(state) {
  const st = state.stats;
  const best = bestShooter(st);
  const net = st.totalWon - st.totalLost;
  let heroNumber, heroLabel;
  if (state.endless) {
    heroNumber = "+" + (state.shift - 1 - totalLinks(state));
    heroLabel = "endless shifts after escaping";
  } else if (hasEscaped(state)) {
    heroNumber = "FREE";
    heroLabel = "escaped in " + state.shift + " shifts";
  } else {
    heroNumber = linksBroken(state) + " / " + totalLinks(state);
    heroLabel = "links broken";
  }
  let html = '<div class="hero"><div class="hero-number">' + heroNumber + '</div><div class="stat-label">' + heroLabel + "</div></div>";
  html += '<div class="stat-grid">' +
    statTile("Rolls", st.rolls, st.doubles + " doubles") +
    statTile("Longest run without a 7", st.bestNoSeven + " rolls") +
    statTile("Longest turn", st.longestTurn.rolls + " rolls", st.longestTurn.name || "-") +
    statTile("Biggest hit", "+" + money(st.biggestHit.amount), st.biggestHit.amount ? "roll " + st.biggestHit.roll + ", " + st.biggestHit.name + " shooting" : "-") +
    statTile("Biggest loss", "-" + money(st.biggestLoss.amount), st.biggestLoss.amount ? "roll " + st.biggestLoss.roll + ", " + st.biggestLoss.name + " shooting" : "-") +
    statTile("Won / lost at the table", money(st.totalWon) + " / " + money(st.totalLost), "net " + (net >= 0 ? "+" : "-") + money(Math.abs(net))) +
    statTile("Paid to the dealer", money(st.paid), money(st.interest) + " interest earned") +
    statTile("Spent in the shop", money(st.spent)) +
    statTile("Points hit / seven-outs", st.pointsHit + " / " + st.sevenOuts) +
    statTile("Highest mult", st.maxMult + "x") +
    statTile("Best shooter", best ? best.name : "-", best ? (best.amount >= 0 ? "+" : "-") + money(Math.abs(best.amount)) + " for you" : "") +
    "</div>";
  html += '<h3>Your money over the run</h3><p class="hint">Cash plus bets after every roll. Drops at a Break are payments to the dealer; dashed lines mark new shifts.</p>' + moneyChartSvg(st);
  html += '<h3>Every total you rolled</h3><p class="hint"><span class="legend-bar"></span> times rolled &nbsp; <span class="legend-tick"></span> expected from the dice odds</p>' + totalsChartSvg(st);
  html += "<h3>Phone perks</h3>" + (state.perks.length
    ? '<div class="my-cards">' + [...new Set(state.perks)].map((id) => '<div class="card-badge perk">☎ ' + perkInfo(id).name +
      (countPerk(state, id) > 1 ? " x" + countPerk(state, id) : "") + "</div>").join("") + "</div>"
    : '<p class="hint">No perks.</p>');
  html += "<h3>Cards at the end</h3>" + (state.cards.length
    ? '<div class="my-cards">' + state.cards.map((id) => '<div class="card-badge ' + CONFIG.cardRarity[id] + '">' + CARDS[id].name + "</div>").join("") + "</div>"
    : '<p class="hint">No cards.</p>');
  return html;
}

// Turn one roll into plain-language sentences.
function describeRoll(total, results, pointBefore, pointAfter) {
  const lines = ["Rolled " + total + "."];

  for (const r of results) {
    const name = BET_NAMES[r.bet];
    if (r.outcome === "win") {
      const shown = r.mult !== undefined && r.mult !== 1
        ? " (" + money(r.baseWinnings) + " x " + r.mult + ")"
        : "";
      lines.push(name + " wins " + money(r.winnings) + shown + ".");
    }
    if (r.outcome === "lose") lines.push(name + " loses " + money(r.amount) + ".");
    if (r.outcome === "move") lines.push(name + " moves to the " + r.to.replace(/\D/g, "") + ".");
  }

  if (pointBefore === null && pointAfter !== null) {
    lines.push("The point is " + pointAfter + ". Roll another " + pointAfter + " before a 7 to win the Pass Line.");
  } else if (pointBefore !== null && pointAfter === null) {
    lines.push(total === pointBefore
      ? "Point hit! Next roll is a new come-out."
      : "Seven out! New shooter. Next roll is a new come-out.");
  } else if (pointAfter !== null) {
    lines.push("Still rolling for a " + pointAfter + ". A 7 ends it.");
  }
  return lines.join(" ");
}

// A full-screen splash (seven-out, point hit). Tap to skip; onDone runs after.
let splashOpen = false;
let splashQueue = []; // splashes waiting for the current one to close
function showSplash(html, kind, ms, onDone) {
  const box = document.getElementById("splash");
  if (splashOpen) {
    splashQueue.push([html, kind, ms, onDone]);
    return;
  }
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    splashOpen = false;
    box.classList.add("hidden");
    if (onDone) onDone();
    if (splashQueue.length && !splashOpen) showSplash(...splashQueue.shift());
  };
  splashOpen = true;
  document.getElementById("splash-content").innerHTML = html;
  box.className = "overlay splash " + kind;
  box.onclick = close;
  setTimeout(close, ms);
}

// Loaded Die / Reroll: offer to reroll a roll that would cost you.
// lose: the bets that would lose. options: from rerollOptions(). onChoose("left" | "right" | "both" | "keep").
let promptOpen = false;
function showRerollPrompt(rolled, lose, options, onChoose) {
  const box = document.getElementById("reroll-prompt");
  document.getElementById("reroll-text").innerHTML = "Rolled <strong>" + rolled.dice[0] + " and " + rolled.dice[1] +
    " (" + rolled.total + ")</strong>. You'd lose: " + lose.map((r) => BET_NAMES[r.bet] + " " + money(r.amount)).join(", ") + ".";
  const buttons = document.getElementById("reroll-buttons");
  buttons.innerHTML = "";
  const add = (label, choice, cls) => {
    const button = document.createElement("button");
    button.textContent = label;
    if (cls) button.className = cls;
    button.onclick = (e) => {
      e.stopPropagation();
      promptOpen = false;
      box.classList.add("hidden");
      onChoose(choice);
    };
    buttons.appendChild(button);
  };
  if (options.oneDie) {
    add("Loaded Die: reroll the left " + rolled.dice[0], "left", "big-button");
    add("Loaded Die: reroll the right " + rolled.dice[1], "right", "big-button");
  }
  if (options.bothDice) add("Reroll: both dice", "both", "big-button");
  add("Keep the roll", "keep");
  promptOpen = true;
  box.classList.remove("hidden");
}

// The fall: the floor shakes, everything drops into the pit, then onDone (the stats screen).
let fallingNow = false;
function playFall(ms, onDone) {
  if (ms <= 0) {
    onDone();
    return;
  }
  fallingNow = true;
  const body = document.body;
  // Each piece falls a moment after the last, spinning a little.
  document.querySelectorAll(".seat, .side > *, .table, .controls, .message").forEach((el, i) => {
    el.style.setProperty("--fall-delay", (0.45 + i * 0.05).toFixed(2) + "s");
    el.style.setProperty("--fall-spin", (Math.random() * 50 - 25).toFixed(0) + "deg");
  });
  document.getElementById("fall-pit").classList.remove("hidden");
  body.classList.add("quake");
  setTimeout(() => body.classList.add("falling"), 450);
  setTimeout(() => {
    body.classList.remove("quake", "falling");
    document.getElementById("fall-pit").classList.add("hidden");
    fallingNow = false;
    onDone();
  }, ms);
}

function renderMuteButton() {
  const button = document.getElementById("mute");
  button.textContent = muted ? "🔇 Off" : "🔊 On";
  button.title = muted ? "Sound is off. Click to turn it on." : "Sound is on. Click to mute.";
}

// The Pit Boss phone: pick one of the offered perks.
// onPick(id, target) runs once a perk (and, for Free Trapdoor, a crew member) is chosen.
let phoneOpen = false;
function showPhone(state, offer, onPick) {
  const box = document.getElementById("phone");
  const choices = document.getElementById("phone-choices");
  document.getElementById("phone-text").textContent = "\"Nice shift. I've got something for you. Pick one, it's yours for the rest of the run.\"";
  choices.innerHTML = "";
  const close = (id, target) => {
    phoneOpen = false;
    box.classList.add("hidden");
    onPick(id, target);
  };
  for (const id of offer) {
    const info = perkInfo(id);
    const card = document.createElement("div");
    card.className = "card perk-card " + info.rarity;
    card.innerHTML = '<div class="card-name">☎ ' + info.name + '</div><div class="card-rarity">' + info.rarity + "</div>" +
      (info.risky ? '<div class="risky">RISKY</div>' : "") + '<div class="card-text">' + info.text + "</div>";
    const button = document.createElement("button");
    button.textContent = "Take it";
    button.onclick = () => {
      if (id !== "removeCharacter") return close(id);
      // Pick who goes.
      document.getElementById("phone-text").textContent = "\"Who drops?\" Pick a crew member. The trapdoor takes them for the rest of the run.";
      choices.innerHTML = "";
      for (const name of state.roster.filter((n) => n !== "You")) {
        const who = document.createElement("button");
        who.className = "big-button";
        who.textContent = name;
        who.onclick = () => close(id, name);
        choices.appendChild(who);
      }
    };
    card.appendChild(button);
    choices.appendChild(card);
  }
  phoneOpen = true;
  box.classList.remove("hidden");
}

// The Trapdoor screen.
function cutSplash(name) {
  return '<div class="splash-title">TRAPDOOR.</div><p class="splash-big">' + name + "'s seat drops away.</p>" +
    "<p>The dealer pulls a lever. " + name + " is gone for the rest of the run, and the seats close up.</p>" + '<p class="hint">Tap to continue</p>';
}

// The SEVEN OUT screen.
function sevenOutSplash(who, lost, notes, won) {
  return '<div class="splash-title">SEVEN OUT!</div>' +
    "<p>" + (who === "You" ? "You" : who) + " sevened out.</p>" +
    (won > 0 ? '<p class="splash-big good-text">+' + money(won) + "</p><p>You bet against the shooter, and it paid.</p>" : "") +
    (lost > 0 ? '<p class="splash-big">-' + money(lost) + "</p><p>lost on the table</p>" : "") +
    notes.map((n) => "<p>" + n + "</p>").join("") +
    '<p class="hint">Tap to continue</p>';
}

// The "Point hit" screen: what you won, and how much cards and mult added.
// wins: [{ bet, plain, winnings }], boosts: reasons the winnings went up.
function pointWinSplash(point, wins, boosts) {
  const total = wins.reduce((sum, w) => sum + w.winnings, 0);
  const plain = wins.reduce((sum, w) => sum + w.plain, 0);
  let html = '<div class="splash-title">POINT HIT!</div><p>The ' + point + ' came back before a 7.</p>' +
    '<p class="splash-big">+' + money(total) + "</p>";
  html += wins.map((w) => "<p>" + BET_NAMES[w.bet] + ": +" + money(w.winnings) +
    (w.winnings !== w.plain ? ' <span class="hint">(normally ' + money(w.plain) + ")</span>" : "") + "</p>").join("");
  if (total !== plain) {
    html += '<p class="boost">' + (total > plain ? "Boosted +" + money(total - plain) : "Cut by " + money(plain - total)) +
      " by: " + boosts.join(", ") + "</p>";
  }
  return html + '<p class="hint">Tap to continue</p>';
}

// Show tutorial pages one at a time. onDone runs when it's closed.
function showTutorial(pages, onDone) {
  let page = 0;
  const box = document.getElementById("tutorial");
  const draw = () => {
    document.getElementById("tutorial-step").textContent = (page + 1) + " / " + pages.length;
    document.getElementById("tutorial-title").textContent = pages[page].title;
    document.getElementById("tutorial-body").innerHTML = pages[page].body;
    document.getElementById("tutorial-back").disabled = page === 0;
    document.getElementById("tutorial-next").textContent = page === pages.length - 1 ? "Let's play" : "Next";
  };
  const close = () => {
    box.classList.add("hidden");
    if (onDone) onDone();
  };
  document.getElementById("tutorial-back").onclick = () => { page -= 1; draw(); };
  document.getElementById("tutorial-next").onclick = () => {
    if (page === pages.length - 1) close();
    else { page += 1; draw(); }
  };
  document.getElementById("tutorial-skip").onclick = close;
  draw();
  box.classList.remove("hidden");
}

// bad: a seven-out, shown big and red.
function showMessage(text, bad) {
  const box = document.getElementById("message");
  box.innerHTML = "";
  if (bad) {
    const big = document.createElement("div");
    big.className = "seven-out-text";
    big.textContent = "SEVEN OUT!";
    box.appendChild(big);
  }
  box.appendChild(document.createTextNode(text));
}

// ---------- Unlocks ----------

function tutorialOpen() {
  return !document.getElementById("tutorial").classList.contains("hidden");
}

function unlockSplash(ids, perks) {
  const kind = { card: "card", comp: "comp", crew: "crew member you can hire", bet: "bet (find it under ➕ More bets)" };
  const perkText = (id) => CONFIG.reputation.find((r) => r.id === id).text;
  return '<div class="splash-title">🔓 UNLOCKED!</div>' +
    ids.map((id) => '<p class="splash-big">' + unlockName(id) + '</p><p class="hint">New ' + kind[UNLOCKS[id].kind] + "</p><p>" + unlockReason(id) + "</p>").join("") +
    "<p>It can show up from your <strong>next run</strong>. See it in the 📖 Collection.</p>" +
    perks.map((id) => '<p class="boost">⭐ Reputation up! From your next run: <strong>' + perkText(id) + "</strong></p>").join("") +
    '<p class="hint">Tap to continue</p>';
}

// The Reputation ladder: earned bonuses ticked, the rest shown with how many unlocks they need.
function reputationHtml() {
  const found = profile().unlocked.length;
  const earned = earnedReputation();
  return "<h3>⭐ Reputation</h3><p class=\"hint\">Every " + CONFIG.reputationEvery + " unlocks, the house remembers you: a lasting bonus from your next run on.</p>" +
    '<div class="rep-ladder">' + CONFIG.reputation.map((r, i) => {
      const need = (i + 1) * CONFIG.reputationEvery;
      const got = earned.includes(r.id);
      return '<div class="rep-step' + (got ? " earned" : "") + '">' + (got ? "✓ " : need + " unlocks: ") + r.text + "</div>";
    }).join("") + "</div>" + '<p class="hint">You have ' + found + " unlock" + (found === 1 ? "" : "s") + ".</p>";
}

// The Collection: everything unlocked, and locked things as mysteries (no hints).
function renderCollection() {
  const tile = (id, title, text, rarity) => isUnlocked(id)
    ? '<div class="collection-tile ' + (rarity || "") + '"><strong>' + title + "</strong><br>" + text + (UNLOCKS[id] ? '<div class="unlock-reason">' + unlockReason(id) + "</div>" : "") + "</div>"
    : '<div class="collection-tile locked"><strong>???</strong><br>🔒 Locked</div>';
  // Found things first (common first), then the mysteries, so a mystery's place gives nothing away.
  const order = (ids) => ids.filter(isUnlocked).concat(ids.filter((id) => !isUnlocked(id)));
  const cards = order(Object.keys(CARDS).sort((a, b) => RARITY_ORDER.indexOf(CONFIG.cardRarity[b]) - RARITY_ORDER.indexOf(CONFIG.cardRarity[a])));
  const crew = order(CONFIG.crew.filter((n) => n !== "You").concat(CONFIG.recruits));
  let html = "<h3>Cards</h3><div class=\"collection-grid\">" + cards.map((id) => tile(id, CARDS[id].name, CARDS[id].text, CONFIG.cardRarity[id])).join("") + "</div>";
  html += "<h3>Comps</h3><div class=\"collection-grid\">" + order(Object.keys(COMPS)).map((id) => tile(id, COMPS[id].name, COMPS[id].text)).join("") + "</div>";
  html += "<h3>Crew</h3><div class=\"collection-grid\">" + crew.map((n) => tile(n, n, CREW_INFO[n].style)).join("") + "</div>";
  html += "<h3>Bets</h3><div class=\"collection-grid\">" + order(Object.keys(BET_GROUPS)).map((g) => tile(g, BET_GROUPS[g].name, BET_GROUPS[g].text)).join("") + "</div>";
  const all = cards.concat(Object.keys(COMPS), crew, Object.keys(BET_GROUPS));
  document.getElementById("collection-count").textContent = all.filter(isUnlocked).length + " of " + all.length + " found. Locked things unlock by playing. How? That's for you to discover.";
  document.getElementById("collection-body").innerHTML = reputationHtml() + html;
}

function showCollection() {
  renderCollection();
  document.getElementById("collection").classList.remove("hidden");
}

// ---------- More bets (Milestone 12b) ----------

let showingExtraBoard = false; // which bet board is on the table

// The second bet board: only the bet groups this run has unlocked.
function renderExtraBoard(state) {
  const groups = Object.keys(BET_GROUPS).filter((g) => available(state, g));
  const toggle = document.getElementById("board-toggle");
  toggle.classList.toggle("hidden", groups.length === 0);
  if (groups.length === 0) showingExtraBoard = false;
  toggle.textContent = showingExtraBoard ? "⬅ Main bets" : "➕ More bets";
  document.getElementById("main-board").classList.toggle("hidden", showingExtraBoard);
  const board = document.getElementById("extra-board");
  board.classList.toggle("hidden", !showingExtraBoard);
  if (!showingExtraBoard) return;
  const b = state.bets;
  const pointOn = state.point !== null;
  const tile = (bet, title, sub, off) => '<div class="bet-area extra-tile' + (off ? " off" : "") + '" data-bet="' + bet + '"><div class="bet-title">' + title +
    ' <span class="bet-amount">' + (b[bet] ? money(b[bet]) : "") + '</span></div><div class="bet-hint">' + sub + "</div></div>";
  const moved = (prefix) => [4, 5, 6, 8, 9, 10].filter((n) => b[prefix + n] > 0).map((n) => "on " + n + ": " + money(b[prefix + n])).join(" · ");
  let html = "";
  if (groups.includes("hardWays")) {
    html += '<div class="extra-row">' + [4, 6, 8, 10].map((n) => tile("hard" + n, "HARD " + n, n / 2 + "+" + n / 2 + " · " + CONFIG.hardWaysPayouts[n] + ":1", !pointOn)).join("") + "</div>";
  }
  if (groups.includes("placeBets")) {
    html += '<div class="extra-row">' + [4, 5, 6, 8, 9, 10].map((n) => tile("place" + n, "PLACE " + n, CONFIG.placePayouts[n].join(":"), !pointOn)).join("") + "</div>";
  }
  const last = [];
  if (groups.includes("comeBets")) {
    last.push(tile("come", "COME", moved("come") || "7/11 win · needs a point", !pointOn));
    last.push(tile("dontCome", "DON'T COME", moved("dcome") || "2/3 win · needs a point", !pointOn));
  }
  if (groups.includes("fireBet")) {
    last.push(tile("fire", "🔥 FIRE", state.firePoints.length + " different points · max " + money(fireMax(state)), state.turnRolls > 0 && !b.fire));
  }
  if (last.length) html += '<div class="extra-row">' + last.join("") + "</div>";
  html += '<p class="hint extra-note">Hard Ways and Place bets are off on come-out rolls. Tap a bet to add your chip.</p>';
  board.innerHTML = html;
  for (const el of board.querySelectorAll("[data-bet]")) el.onclick = () => placeBet(el.dataset.bet);
}

// ---------- Win and loss popups ----------

// The spot on the table for a bet (falls back to the dice if that board isn't showing).
function betSpot(bet) {
  const ids = { pass: "pass-line", odds: "odds", dont: "dont-pass", lay: "lay", field: "field" };
  const tile = /^come\d+$/.test(bet) ? "come" : /^dcome\d+$/.test(bet) ? "dontCome" : bet;
  const el = ids[bet] ? document.getElementById(ids[bet]) : document.querySelector('[data-bet="' + tile + '"]');
  return el && el.offsetParent !== null ? el : document.getElementById("dice");
}

// "+$25" floats up from each winning bet; losses drop away in red.
function showBetPopups(results) {
  const used = new Map(); // stack popups that share a spot
  for (const r of results) {
    if (r.outcome !== "win" && r.outcome !== "lose") continue;
    const spot = betSpot(r.bet);
    const box = spot.getBoundingClientRect();
    const n = used.get(spot) || 0;
    used.set(spot, n + 1);
    const pop = document.createElement("div");
    pop.className = "bet-pop " + (r.outcome === "win" ? "win" : "lose");
    pop.textContent = r.outcome === "win" ? "+" + money(r.winnings) : "-" + money(r.amount);
    pop.style.left = box.left + box.width / 2 + "px";
    pop.style.top = box.top + box.height / 2 - n * 22 + "px";
    document.body.appendChild(pop);
    setTimeout(() => pop.remove(), CONFIG.betPopMs);
  }
}
