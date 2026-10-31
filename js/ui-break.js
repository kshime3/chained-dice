// Display code: the Dealer Break. Paying (drop box), the shop, comps, the dice
// workshop, hiring, the Pit Boss phone and your hand. No game rules here.

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
  renderDropBox(state);
  const plaque = Math.min(plaqueValue(state), amountOwed(state));
  const dropButton = document.getElementById("drop-plaque");
  dropButton.textContent = "Drop a plaque (" + money(plaque) + ")";
  dropButton.disabled = !payOpen || maxDeposit(state) < plaque;
  dropButton.title = dropButton.disabled && payOpen ? "Not enough cash: you keep " + money(tableMin(state)) + " for your line bet." : "";
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

// The drop box: 10 slots, one per plaque, filled as you pay.
function renderDropBox(state) {
  const box = document.getElementById("drop-box");
  const per = plaqueValue(state);
  const slots = Math.ceil(state.debt / per);
  const full = Math.min(slots, state.deposited / per);
  let html = "";
  for (let i = 0; i < slots; i++) {
    const fill = Math.max(0, Math.min(1, full - i));
    const newest = plaqueJustDropped && fill > 0 && i === Math.ceil(full) - 1;
    html += '<div class="slot"><div class="plaque' + (newest ? " dropping" : "") + '" style="width:' + Math.round(fill * 100) + '%"></div></div>';
  }
  box.innerHTML = html + '<div class="drop-label">' + money(state.deposited) + " of " + money(state.debt) + "</div>";
  plaqueJustDropped = false;
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
}

// Comps: the shop row and your comps on the Break screen, plus Use buttons on the table.
// handlers: { buyComp(slot), sellComp(index), useComp(index) }
function renderComps(state, handlers) {
  document.getElementById("comps-section").classList.toggle("hidden", !systemOn(state, "comps"));
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

// ---------- Your hand (left column on bigger screens) ----------

// Cards, comps and phone perks as readable tiles. Phones use the compact row instead.
// handlers: { useComp(index) }
function renderHand(state, handlers) {
  const hand = document.getElementById("hand");
  hand.innerHTML = "";
  const section = (title) => {
    const h = document.createElement("h3");
    h.textContent = title;
    hand.appendChild(h);
    const row = document.createElement("div");
    row.className = "hand-row";
    hand.appendChild(row);
    return row;
  };
  const cards = section("Your cards (" + state.cards.length + " / " + maxCards(state) + ")");
  if (!state.cards.length) cards.innerHTML = '<p class="hint">No cards yet. Tip the dealer at a Dealer Break to buy some.</p>';
  for (const id of state.cards) {
    const off = rule(state, "pitWatch") && state.houseRule.disabled === id;
    const tile = document.createElement("div");
    tile.className = "hand-card " + CONFIG.cardRarity[id] + (off ? " switched-off" : "");
    tile.title = CARDS[id].text;
    tile.innerHTML = "<strong>" + (off ? "👁 " : "") + CARDS[id].name + '</strong><span class="rarity">' + CONFIG.cardRarity[id] + '</span><div class="hand-text">' +
      (off ? "<em>Switched off this shift (Pit Watch).</em> " : "") + CARDS[id].text + "</div>";
    cards.appendChild(tile);
  }
  const comps = systemOn(state, "comps") ? section("Comps (" + state.comps.length + " / " + compSlots(state) + ")") : document.createElement("div");
  for (const id of Object.keys(state.armed)) {
    const tile = document.createElement("div");
    tile.className = "hand-comp armed";
    tile.innerHTML = "<strong>⚡ " + COMPS[id].name + " armed</strong><br>" + COMPS[id].text;
    comps.appendChild(tile);
  }
  if (!state.comps.length && !Object.keys(state.armed).length) comps.innerHTML = '<p class="hint">No comps. The dealer sells them at a Dealer Break.</p>';
  state.comps.forEach((id, i) => {
    const blocked = compBlocked(state, id);
    const tile = document.createElement("div");
    tile.className = "hand-comp";
    tile.title = COMPS[id].text;
    tile.innerHTML = "<strong>🎟 " + COMPS[id].name + '</strong><div class="hand-text">' + COMPS[id].text + "</div>";
    const use = document.createElement("button");
    use.textContent = blocked ? "Not now" : "Use";
    use.title = blocked || "Use it now";
    use.disabled = !!blocked;
    use.onclick = () => handlers.useComp(i);
    tile.appendChild(use);
    comps.appendChild(tile);
  });
  const perks = perkBadges(state);
  if (perks.length) {
    const row = section("Pit Boss perks");
    for (const badge of perks) row.appendChild(badge);
  }
}

// Pit Boss perks (and free shop cards, Dealer's Bargain) as purple badges with hover text.
// Repeats are grouped ("-1 way to roll 7 x2"); one-time perks don't stay as badges.
function perkBadges(state) {
  const badges = [];
  const badge = (html) => {
    const el = document.createElement("div");
    el.className = "card-badge perk";
    el.innerHTML = html;
    badges.push(el);
  };
  if (state.freeBuys > 0) badge("☎ " + state.freeBuys + " free shop card" + (state.freeBuys > 1 ? "s" : "") + " left");
  if (state.extraLinks > 0) {
    const n = state.extraLinks;
    badge("⛓ Dealer's Bargain" + (n > 1 ? " x" + n : "") + '<div class="tooltip"><strong>Dealer\'s Bargain</strong><br>' + n + " extra link" + (n > 1 ? "s" : "") +
      " on your chain, and -" + n + " way" + (n > 1 ? "s" : "") + " to roll 7 on everyone's dice.</div>");
  }
  for (const id of [...new Set(state.perks)].filter((p) => p.startsWith("plus") || p === "minusSeven")) {
    const info = perkInfo(id);
    const n = countPerk(state, id);
    badge("☎ " + info.name + (n > 1 ? " x" + n : "") + '<div class="tooltip"><strong>' + info.name + "</strong><br>" + info.text + "</div>");
  }
  return badges;
}
