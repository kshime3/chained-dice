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
  const die = document.getElementById(id);
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
const BET_NAMES = { pass: "Pass Line", odds: "Odds", field: "Field" };

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
  const set = CONFIG.crewDice[name];
  const dice = set.right === "ghost" ? { left: set.left, right: CONFIG.ghostFaces.evens } : set;
  const now = state ? currentDice(state) : { extraWays: [], totalWays: [] };
  return diceOdds(Object.assign({}, dice, { extraWays: now.extraWays, totalWays: now.totalWays }))[7];
}

function renderChips(selectedChip, onPick) {
  const box = document.getElementById("chips");
  box.innerHTML = "";
  for (const value of CONFIG.chipValues) {
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
  document.getElementById("kitty").textContent = money(state.kitty);
  document.getElementById("interest").textContent = Math.round(state.interestRate * 1000) / 10 + "%";
  document.getElementById("paid").textContent = money(state.deposited) + " / " + money(state.debt);
  const progress = Math.min(100, (state.deposited / state.debt) * 100);
  document.getElementById("progress-fill").style.width = progress + "%";
  renderCrew(state);
  renderOddsPanel(state);
  renderMult(state);
  document.getElementById("on-table").textContent = money(b.pass + b.odds + b.field);
  document.getElementById("pass-amount").textContent = money(b.pass);
  document.getElementById("field-amount").textContent = money(b.field);

  // Point marker
  const puck = document.getElementById("puck");
  puck.textContent = state.point === null ? "OFF · Come-out roll" : "ON · Point is " + state.point;
  puck.className = "puck " + (state.point === null ? "off" : "on");

  // Pass Line locks while a point is on
  document.getElementById("pass-line").classList.toggle("locked", state.point !== null);
  document.getElementById("pass-lock").textContent = state.point === null ? "" : "🔒 Locked until the point is hit or a 7 rolls";

  // Odds only open while a point is on
  const odds = document.getElementById("odds");
  odds.classList.toggle("disabled", state.point === null);
  document.getElementById("odds-amount").textContent =
    state.point === null ? "Opens once a point is set" : money(b.odds) + " / max " + money(maxOdds(b.pass, state.point));

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
    seat.innerHTML = "⛓<br>" + name;
    const info = CREW_INFO[name];
    if (info) {
      const tip = document.createElement("div");
      tip.className = "tooltip";
      tip.innerHTML = "<strong>" + name + "</strong><br>Dice: " + info.dice + "<br>Style: " + info.style +
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
    intro = state.shift === 1
      ? "The dealer leans in. \"You owe me " + money(state.debt) + " by the end of the shift.\" Pay any time between shooters. Paid money is safe, but you can't bet it."
      : "Shift " + state.shift + ". The pit boss slides " + money(state.cashAdded) + " into your kitty. The dealer leans in: \"This time you owe me " + money(state.debt) + ".\"";
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
  document.getElementById("break-kitty").textContent = money(state.kitty);
  const rate = Math.round(state.interestRate * 1000) / 10 + "%";
  document.getElementById("break-interest").innerHTML = state.lastInterest > 0
    ? "Interest paid into your kitty: <strong>+" + money(state.lastInterest) + "</strong> (" + rate + " of the " + money(state.deposited) + " you've paid)."
    : "Paid money earns " + rate + " interest at every Break, paid into your kitty.";

  // Pay off debt only works when your kitty covers the whole amount owed.
  const payOff = document.getElementById("pay-off");
  payOff.disabled = state.kitty < amountOwed(state);
  payOff.textContent = "Pay off debt (" + money(amountOwed(state)) + ")";
  payOff.title = payOff.disabled ? "You need the full amount in your kitty to pay off the debt." : "";
  document.getElementById("leave-break").textContent = isFinalBreak(state)
    ? "Face the pit boss"
    : "Next shooter: " + state.crew[state.shooterIndex];

  const warn = !isFinalBreak(state) && totalMoney(state) < CONFIG.tableMinimum;
  document.getElementById("break-warning").textContent = warn
    ? "Warning: you need " + money(CONFIG.tableMinimum) + " to bet the Pass Line. Leave now and you fall."
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
  const full = state.cards.length >= CONFIG.maxCards;
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
  document.getElementById("shuffle").textContent = "Shuffle (" + money(shuffleCost(state)) + ")";
  document.getElementById("shuffle").disabled = !canSpend(state, shuffleCost(state));

  // Your cards, with Sell buttons (break screen)
  document.getElementById("slots").textContent = state.cards.length + " / " + CONFIG.maxCards;
  const owned = document.getElementById("owned");
  owned.innerHTML = state.cards.length ? "" : '<p class="hint">No cards yet.</p>';
  for (const id of state.cards) {
    owned.appendChild(cardBox(id, "Sell for " + money(sellPrice(state, id)), () => handlers.sell(id)));
  }

  // Cut a chain: one button per crew member who hasn't shot yet (Break screen)
  const cutRow = document.getElementById("cut-row");
  cutRow.innerHTML = "";
  for (const name of cuttableCrew(state)) {
    const button = document.createElement("button");
    button.textContent = "Cut " + name + " (" + money(cutChainPrice(state)) + ")";
    button.disabled = !canSpend(state, cutChainPrice(state));
    button.onclick = () => handlers.cut(name);
    cutRow.appendChild(button);
  }
  if (!cutRow.children.length) cutRow.innerHTML = '<p class="hint">Nobody left to cut this shift.</p>';

  // Your cards as small badges with hover text (main screen)
  const badges = document.getElementById("my-cards");
  badges.innerHTML = "";
  // Phone perks first (purple), with repeats grouped: "-1 way to roll 7 x2".
  // One-time perks (Remove a character, free items) don't stay as badges.
  if (state.freeBuys > 0) {
    const free = document.createElement("div");
    free.className = "card-badge perk";
    free.textContent = "☎ " + state.freeBuys + " free shop card" + (state.freeBuys > 1 ? "s" : "") + " left";
    badges.appendChild(free);
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
    badge.className = "card-badge " + CONFIG.cardRarity[id];
    badge.innerHTML = CARDS[id].name + '<div class="tooltip"><strong>' + CARDS[id].name + "</strong><br>" + CARDS[id].text + "</div>";
    badges.appendChild(badge);
  }
}

// Bar chart of the current shooter's chance of each total.
function renderOddsPanel(state) {
  const panel = document.getElementById("odds-panel");
  const name = state.crew[state.shooterIndex];
  if (!name) {
    panel.innerHTML = "";
    return;
  }
  const charm = pairDue(state);
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
  let summary = whose(name) + " dice: current chance of a 7 is <strong>" + percent(odds[7]) + "</strong> (normal: 16.7%).";
  if (state.point !== null) {
    summary += " Hitting the " + state.point + " before a 7: <strong>" + percent(pointBeforeSeven(odds, state.point)) + "</strong>.";
  }
  if (state.dice.note) summary += " " + state.dice.note;
  if (charm) summary += " <strong>Doubles Charm: next roll is a pair!</strong>";
  panel.innerHTML = '<div class="bars">' + bars + '</div><div class="odds-summary">' + summary + "</div>";
}

// Show the win or fall screen when the shift is over.
function renderEndScreen(state) {
  const screen = document.getElementById("end-screen");
  if (state.status === "playing") {
    screen.classList.add("hidden");
    return;
  }
  const next = shiftScale(state.shift + 1);
  const nextLine = " Next: shift " + (state.shift + 1) + ". You'll get " + money(next.cash) + " more and owe " + money(next.debt) + ".";
  const survived = state.shift - 1;
  const score = " You survived " + survived + (survived === 1 ? " shift." : " shifts.");
  const texts = {
    "won": state.savedByLink
      ? ["The extra link holds!", "You were about to fall, but your Extra chain link snapped instead. The dealer forgives the rest of the debt. You keep " + money(totalMoney(state)) + "." + nextLine]
      : ["Shift " + state.shift + " survived. The chains hold.", "You paid the dealer " + money(state.debt) + ". You keep " + money(totalMoney(state)) + "." + nextLine],
    "fell-broke": ["You fall.", "You couldn't cover the " + money(CONFIG.tableMinimum) + " Pass Line. The chains release and the floor opens." + score],
    "fell-short": ["You fall.", "You only paid " + money(state.deposited) + " of the " + money(state.debt) + " you owed. The chains release." + score],
  };
  const [title, body] = texts[state.status];
  document.getElementById("end-title").textContent = title;
  document.getElementById("end-body").textContent = body;
  document.getElementById("play-again").textContent = state.status === "won" ? "Next shift" : "Play again";
  document.getElementById("run-stats").innerHTML = state.status === "won" ? "" : runStatsHtml(state);
  screen.className = "overlay " + (state.status === "won" ? "won" : "fell");
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
  const survived = state.shift - 1;
  const best = bestShooter(st);
  const net = st.totalWon - st.totalLost;
  let html = '<div class="hero"><div class="hero-number">' + survived + '</div><div class="stat-label">' +
    (survived === 1 ? "shift survived" : "shifts survived") + "</div></div>";
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
  html += '<h3>Your money over the run</h3><p class="hint">Kitty plus bets after every roll. Drops at a Break are payments to the dealer; dashed lines mark new shifts.</p>' + moneyChartSvg(st);
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
function showSplash(html, kind, ms, onDone) {
  const box = document.getElementById("splash");
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    splashOpen = false;
    box.classList.add("hidden");
    if (onDone) onDone();
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

// The Pit Boss phone: pick one of the offered perks.
// onPick(id, target) runs once a perk (and, for Remove a character, a crew member) is chosen.
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
      document.getElementById("phone-text").textContent = "\"Who goes?\" Pick a crew member to remove for the rest of the run.";
      choices.innerHTML = "";
      for (const name of state.crew.filter((n) => n !== "You")) {
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

// The "falls through the floor" screen for Cut a chain.
function cutSplash(name) {
  return '<div class="splash-title">CHAIN CUT</div><p class="splash-big">' + name + " falls through the floor.</p>" +
    "<p>The seats close up. " + name + " is gone for the rest of the run.</p>" + '<p class="hint">Tap to continue</p>';
}

// The SEVEN OUT screen.
function sevenOutSplash(who, lost, notes) {
  return '<div class="splash-title">SEVEN OUT!</div>' +
    "<p>" + (who === "You" ? "You" : who) + " sevened out.</p>" +
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
