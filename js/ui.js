// Display code: draws the game on screen. No game rules here.

const DIE_FACES = ["", "⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const BET_NAMES = { pass: "Pass Line", field: "Field" };

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
  document.getElementById("bankroll").textContent = money(state.bankroll);
  document.getElementById("on-table").textContent = money(state.bets.pass + state.bets.field);
  document.getElementById("pass-amount").textContent = money(state.bets.pass);
  document.getElementById("field-amount").textContent = money(state.bets.field);
  if (state.lastRoll) {
    document.getElementById("die1").textContent = DIE_FACES[state.lastRoll.dice[0]];
    document.getElementById("die2").textContent = DIE_FACES[state.lastRoll.dice[1]];
    document.getElementById("total").textContent = "Total: " + state.lastRoll.total;
  }
}

// Turn bet results into a plain-language line, e.g. "Pass Line wins $10".
function describeResults(results) {
  if (results.length === 0) return "No bets on the table.";
  return results.map((r) => {
    const name = BET_NAMES[r.bet];
    if (r.outcome === "win") return name + " wins " + money(r.winnings);
    if (r.outcome === "lose") return name + " loses " + money(r.amount);
    return name + ": point is " + r.point + " (points arrive in Milestone 2, bet stays up)";
  }).join(" · ");
}

function showMessage(text) {
  document.getElementById("message").textContent = text;
}
