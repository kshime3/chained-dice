// Display: the guided first shooter. A coach bubble points at the right thing and
// explains each roll as it happens, for a brand-new player's first turn only.
// Steps: break -> bet -> roll -> (point -> odds -> keep rolling) -> done.

let coachStep = null; // null = not coaching
let coachNote = null; // a one-off explanation after a roll: { text, target, button }

// Start coaching a brand-new player (main.js calls this once on a first visit).
function startCoach() {
  if (tutorialSeen("guided")) return;
  coachStep = "break";
}

function endCoach() {
  coachStep = null;
  coachNote = null;
  markTutorialSeen("guided");
  hideCoach();
}

// Move the coach along after something happened, then redraw the bubble.
// Called from renderAll, so it always matches what's on screen.
function updateCoach(state) {
  if (!coachStep) return;
  if (state.status !== "playing") return endCoach();
  const before = coachStep;
  if (coachStep === "break" && !state.onBreak) coachStep = "bet";
  if (coachStep === "bet" && (state.bets.pass > 0 || state.bets.dont > 0)) coachStep = "roll";
  if (coachStep === "roll" && state.point === null && state.bets.pass === 0 && state.bets.dont === 0) coachStep = "bet";
  if (coachStep === "odds" && state.bets.odds > 0) coachStep = "keep";
  if (coachStep !== before) coachNote = null; // the player did what the note asked
  drawCoach(state);
}

// After each roll on the coached turn: explain what just happened.
function coachAfterRoll(state, total, pointBefore, sevenOut) {
  if (!coachStep) return;
  if (coachStep === "done") return endCoach(); // they kept playing past the last tip
  if (pointBefore === null) {
    if (CONFIG.comeOutWinners.includes(total)) {
      coachNote = { text: "<strong>" + total + " on the first roll wins!</strong> Your Pass Line bet stays on the table. Roll again: it's another first roll.", target: "roll-button" };
      coachStep = "roll";
    } else if (CONFIG.comeOutLosers.includes(total)) {
      coachNote = { text: "<strong>Craps:</strong> 2, 3 or 12 on the first roll loses. Your chip is gone. Put a new one on the Pass Line and roll again.", target: "pass-line" };
      coachStep = "bet";
    } else {
      coachNote = { text: "<strong>" + total + " is now the POINT.</strong> The shooter keeps rolling. Another " + total + " before a 7: you win. A 7 first: you lose (that's a <strong>seven out</strong>). Any other number: nothing happens.", target: "puck", button: "Got it" };
      coachStep = "odds";
    }
  } else if (total === pointBefore) {
    coachNote = { text: "<strong>🎉 Point hit! You won.</strong> Now it starts over with a new first roll. That's craps! You're on your own now: good luck.", target: "message", button: "Let's go", last: true };
    coachStep = "done";
  } else if (sevenOut) {
    coachNote = { text: "<strong>Seven out.</strong> A 7 came before the point, so the Pass Line lost and the dice pass to the next shooter. At each Dealer Break you can pay the dealer by dropping plaques in the drop box. You're on your own now: good luck!", target: "drop-box", button: "Let's go", last: true };
    coachStep = "done";
  } else {
    coachNote = { text: "Rolled <strong>" + total + "</strong>: not " + pointBefore + ", not 7, so nothing happens to your Pass Line. Roll again.", target: "roll-button" };
    coachStep = "keep";
  }
}

// What the bubble says and points at for the current step.
function coachMessage(state) {
  if (coachNote) return coachNote;
  if (coachStep === "break") {
    return { text: "This is a <strong>Dealer Break</strong>. Between shooters you can pay the dealer and shop. Nothing to do yet: tap here to let the first shooter roll.", target: "leave-break" };
  }
  if (coachStep === "bet") {
    return { text: "Bet that the shooter wins: tap the <strong>PASS LINE</strong> to put your chip on it. (Pick a chip below the table first if you like.)", target: "pass-line" };
  }
  if (coachStep === "roll") {
    return { text: "Now <strong>roll</strong>! On this first roll, <strong>7 or 11 wins</strong> and <strong>2, 3 or 12 loses</strong>. Any other number becomes the <strong>point</strong>.", target: "roll-button" };
  }
  if (coachStep === "odds") {
    return { text: "Want more? <strong>ODDS</strong> sit behind your Pass Line and pay extra if the point hits. Optional: tap Odds to add a chip, or just roll.", target: "odds", button: "Skip, just roll" };
  }
  return { text: "Keep rolling until the point or a 7 comes.", target: "roll-button" };
}

function drawCoach(state) {
  const bubble = document.getElementById("coach");
  // Out of the way while dice tumble, splashes show or another tutorial is open.
  if (busy() || tutorialOpen() || (state.onBreak && coachStep !== "break" && !(coachNote && coachNote.last))) {
    hideCoach();
    return;
  }
  const msg = coachMessage(state);
  const target = document.getElementById(msg.target);
  if (!target || target.offsetParent === null) {
    hideCoach();
    return;
  }
  document.querySelectorAll(".coach-target").forEach((el) => el.classList.remove("coach-target"));
  target.classList.add("coach-target");
  document.getElementById("coach-text").innerHTML = msg.text;
  const ok = document.getElementById("coach-ok");
  ok.textContent = msg.button || "";
  ok.classList.toggle("hidden", !msg.button);
  document.getElementById("coach-skip").onclick = endCoach;
  ok.onclick = () => {
    if (msg.last) return endCoach();
    if (coachNote) coachNote = null;
    else if (coachStep === "odds") coachStep = "keep";
    drawCoach(state);
  };
  bubble.classList.remove("hidden");
  // Place the bubble under the target, or above it if there's no room, kept on screen.
  const r = target.getBoundingClientRect();
  const b = bubble.getBoundingClientRect();
  const below = r.bottom + 12 + b.height < window.innerHeight;
  const top = below ? r.bottom + 12 : Math.max(8, r.top - 12 - b.height);
  const left = Math.min(Math.max(8, r.left + r.width / 2 - b.width / 2), window.innerWidth - b.width - 8);
  bubble.style.top = top + "px";
  bubble.style.left = left + "px";
  bubble.classList.toggle("above", !below);
}

function hideCoach() {
  document.getElementById("coach").classList.add("hidden");
  document.querySelectorAll(".coach-target").forEach((el) => el.classList.remove("coach-target"));
}
