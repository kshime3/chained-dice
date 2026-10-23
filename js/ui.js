// Display code: draws the game on screen. No game rules here.

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const BET_NAMES = { pass: "Pass Line", odds: "Odds", field: "Field" };

function money(n) {
  return "$" + n.toLocaleString();
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
  document.getElementById("bankroll").textContent = money(state.bankroll);
  document.getElementById("target").textContent = money(CONFIG.shiftTarget);
  const progress = Math.min(100, (totalMoney(state) / CONFIG.shiftTarget) * 100);
  document.getElementById("progress-fill").style.width = progress + "%";
  renderCrew(state);
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
    box.appendChild(seat);
  });
  const shooter = CONFIG.crew[state.shooterIndex];
  document.getElementById("shooter").textContent = shooter
    ? "Now shooting: " + shooter + " (shooter " + (state.shooterIndex + 1) + " of " + CONFIG.crew.length + ")"
    : "Every shooter has had a turn.";
}

// Show the win or fall screen when the shift is over.
function renderEndScreen(state) {
  const screen = document.getElementById("end-screen");
  if (state.status === "playing") {
    screen.classList.add("hidden");
    return;
  }
  const texts = {
    "won": ["The chains hold.", "You reached " + money(CONFIG.shiftTarget) + ". The pit boss nods. You live to roll another shift."],
    "fell-broke": ["You fall.", "You couldn't cover the " + money(CONFIG.tableMinimum) + " Pass Line. The chains release and the floor opens."],
    "fell-short": ["You fall.", "Every shooter has sevened out and you finished with " + money(totalMoney(state)) + ", short of " + money(CONFIG.shiftTarget) + ". The chains release."],
  };
  const [title, body] = texts[state.status];
  document.getElementById("end-title").textContent = title;
  document.getElementById("end-body").textContent = body;
  screen.className = state.status === "won" ? "won" : "fell";
}

// Turn one roll into plain-language sentences.
function describeRoll(total, results, pointBefore, pointAfter) {
  const lines = ["Rolled " + total + "."];

  for (const r of results) {
    const name = BET_NAMES[r.bet];
    if (r.outcome === "win") lines.push(name + " wins " + money(r.winnings) + ".");
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
