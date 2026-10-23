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
function sevenChance(name) {
  const set = CONFIG.crewDice[name];
  const dice = set.right === "ghost" ? { left: set.left, right: CONFIG.ghostFaces.evens } : set;
  return diceOdds(dice)[7];
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
  document.getElementById("kitty").textContent = money(state.kitty);
  document.getElementById("interest").textContent = Math.round(state.interestRate * 1000) / 10 + "%";
  document.getElementById("paid").textContent = money(state.deposited) + " / " + money(CONFIG.shiftTarget);
  const progress = Math.min(100, (state.deposited / CONFIG.shiftTarget) * 100);
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
  CONFIG.crew.forEach((name, i) => {
    const seat = document.createElement("div");
    seat.className = "seat" + (i === state.shooterIndex ? " shooting" : "") + (i < state.shooterIndex ? " done" : "");
    seat.innerHTML = "⛓<br>" + name;
    const info = CREW_INFO[name];
    if (info) {
      const tip = document.createElement("div");
      tip.className = "tooltip";
      tip.innerHTML = "<strong>" + name + "</strong><br>Dice: " + info.dice + "<br>Style: " + info.style +
        "<br>Current chance of a 7: <strong>" + percent(sevenChance(name)) + "</strong> (normal dice: 16.7%)";
      seat.appendChild(tip);
    }
    box.appendChild(seat);
  });
  const shooter = CONFIG.crew[state.shooterIndex];
  document.getElementById("shooter").textContent = shooter
    ? "Now shooting: " + shooter + " (shooter " + (state.shooterIndex + 1) + " of " + CONFIG.crew.length + ")"
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
    intro = "The dealer leans in. \"You owe me " + money(CONFIG.shiftTarget) + " by the end of the shift.\" Pay any time between shooters. Paid money is safe, but you can't bet it.";
  } else if (isFinalBreak(state)) {
    intro = "Every shooter has sevened out. Last chance to pay before the pit boss judges you.";
  } else {
    const next = CONFIG.crew[state.shooterIndex];
    const before = next === "You" ? "Before you shoot" : "Before " + next + " shoots";
    intro = before + ", you can pay the dealer. " + whose(next) + " current chance of a 7: " + percent(diceOdds(state.dice)[7]) + ".";
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
    : "Next shooter: " + CONFIG.crew[state.shooterIndex];

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
  if (!CONFIG.crew[state.shooterIndex]) {
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
    const price = cardPrice(id);
    stockBox.appendChild(cardBox(id, "Buy " + money(price), () => handlers.buy(slot),
      full || !canSpend(state, price)));
  });
  document.getElementById("shuffle").textContent = "Shuffle (" + money(shuffleCost(state)) + ")";
  document.getElementById("shuffle").disabled = !canSpend(state, shuffleCost(state));

  // Your cards, with Sell buttons (break screen)
  document.getElementById("slots").textContent = state.cards.length + " / " + CONFIG.maxCards;
  const owned = document.getElementById("owned");
  owned.innerHTML = state.cards.length ? "" : '<p class="hint">No cards yet.</p>';
  for (const id of state.cards) {
    owned.appendChild(cardBox(id, "Sell for " + money(sellPrice(id)), () => handlers.sell(id)));
  }

  // Your cards as small badges with hover text (main screen)
  const badges = document.getElementById("my-cards");
  badges.innerHTML = "";
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
  const name = CONFIG.crew[state.shooterIndex];
  if (!name) {
    panel.innerHTML = "";
    return;
  }
  const odds = diceOdds(state.dice);
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
  panel.innerHTML = '<div class="bars">' + bars + '</div><div class="odds-summary">' + summary + "</div>";
}

// Show the win or fall screen when the shift is over.
function renderEndScreen(state) {
  const screen = document.getElementById("end-screen");
  if (state.status === "playing") {
    screen.classList.add("hidden");
    return;
  }
  const texts = {
    "won": ["The chains hold.", "You paid the dealer " + money(CONFIG.shiftTarget) + ". The pit boss nods. You keep " + money(totalMoney(state)) + " for the next shift."],
    "fell-broke": ["You fall.", "You couldn't cover the " + money(CONFIG.tableMinimum) + " Pass Line. The chains release and the floor opens."],
    "fell-short": ["You fall.", "You only paid " + money(state.deposited) + " of the " + money(CONFIG.shiftTarget) + " you owed. The chains release."],
  };
  const [title, body] = texts[state.status];
  document.getElementById("end-title").textContent = title;
  document.getElementById("end-body").textContent = body;
  screen.className = "overlay " + (state.status === "won" ? "won" : "fell");
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
