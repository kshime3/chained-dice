// Display code: draws the game on screen. No game rules here.

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
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
    document.getElementById("die1").textContent = DIE_FACES[state.lastRoll.dice[0]];
    document.getElementById("die2").textContent = DIE_FACES[state.lastRoll.dice[1]];
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
        "<br>Chance of a 7: <strong>" + percent(sevenChance(name)) + "</strong> (normal dice: 16.7%)";
      seat.appendChild(tip);
    }
    box.appendChild(seat);
  });
  const shooter = CONFIG.crew[state.shooterIndex];
  document.getElementById("shooter").textContent = shooter
    ? "Now shooting: " + shooter + " (shooter " + (state.shooterIndex + 1) + " of " + CONFIG.crew.length + ")"
    : "Every shooter has had a turn.";
}

// The Dealer break: pay toward the debt between shooters.
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
    intro = "Seven out. " + before + ", you can pay the dealer. " + whose(next) + " chance of a 7: " + percent(diceOdds(state.dice)[7]) + ".";
  }
  document.getElementById("break-intro").textContent = intro;
  document.getElementById("break-owed").textContent = money(amountOwed(state));
  document.getElementById("break-kitty").textContent = money(state.kitty);
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
  box.innerHTML = "Mult: <strong>" + state.mult + "x</strong>" +
    (state.multNotes.length ? " · " + state.multNotes.join(" · ") : "");
  box.className = "mult" + (state.mult > 1 ? " hot" : state.mult < 1 ? " cold" : "");
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
    const height = Math.round((odds[t] / 0.25) * 60); // 25% fills the bar
    let cls = "bar";
    if (t === 7) cls += " seven";
    if (t === state.point) cls += " point";
    if (odds[t] === 0) cls += " impossible";
    bars += '<div class="' + cls + '"><span class="pct">' + Math.round(odds[t] * 100) + '%</span>' +
      '<div class="fill" style="height:' + height + 'px"></div><span class="num">' + t + "</span></div>";
  }
  let summary = whose(name) + " dice: chance of a 7 is <strong>" + percent(odds[7]) + "</strong> (normal: 16.7%).";
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

function showMessage(text) {
  document.getElementById("message").textContent = text;
}
