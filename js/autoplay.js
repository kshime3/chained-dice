// Testing tool (not part of the game): a bot plays whole runs through the real screen,
// clicking buttons like a person, and reports any errors or stuck screens.
// Open index.html?autoplay (25 runs) or index.html?autoplay=100. It never touches your
// saved progress or run, and uses tiny debts so it reaches every shift, the escape and endless mode.

(function autoplay() {
  const runsWanted = Number(new URLSearchParams(location.search).get("autoplay")) || 25;
  const errors = [];
  window.addEventListener("error", (e) => errors.push(e.message));
  const out = { runs: 0, escapes: 0, endless: 0, bestShift: 0, rolls: 0, stuck: 0 };

  // A small status panel in the corner.
  const panel = document.createElement("div");
  panel.className = "autoplay-panel";
  document.body.appendChild(panel);
  const show = (done) => {
    const verdict = !done ? "▶ Playing…" : errors.length || out.stuck ? "❌ Problems found" : "✅ All good";
    panel.innerHTML = "<strong>Autoplay " + verdict + "</strong><br>Runs " + out.runs + " / " + runsWanted + " · escapes " + out.escapes +
      " · endless " + out.endless + " · best shift " + out.bestShift + " · rolls " + out.rolls +
      "<br>Errors: " + (errors.length ? errors.map((m) => "<br>• " + m).join("") : "none") + (out.stuck ? "<br>Stuck: " + out.stuck + " time(s)" : "");
    panel.classList.toggle("bad", done && (errors.length > 0 || out.stuck > 0));
    panel.classList.toggle("good", done && !errors.length && !out.stuck);
  };

  // Showing on screen? (Pop-ups are fixed-position, so check their style, not offsetParent.)
  const visible = (id) => {
    const el = document.getElementById(id);
    return !!el && !el.classList.contains("hidden") && getComputedStyle(el).display !== "none";
  };
  const click = (selector) => {
    const el = document.querySelector(selector);
    if (el && !el.disabled) el.click();
    return !!el;
  };
  const chance = (p) => Math.random() < p;
  let lastProgress = 0;
  let steps = 0;

  // One action per tick, like a (very fast) person.
  function step() {
    steps++;
    if (out.runs >= runsWanted || steps > runsWanted * 4000) return show(true);
    try {
      act();
    } catch (e) {
      errors.push(e.message);
    }
    // Stuck: nothing has happened for a long time.
    const progress = state.stats.rolls + state.shift * 1000 + out.runs * 100000 + (state.onBreak ? 1 : 0);
    if (progress !== lastProgress) {
      lastProgress = progress;
      step.idle = 0;
  step.seenRolls = 0;
    } else if (++step.idle > 400) {
      out.stuck++;
      step.idle = 0;
      playAgain();
    }
    // Count rolls (a roll finishes a moment after Roll is pressed).
    if (state.stats.rolls > step.seenRolls) out.rolls += state.stats.rolls - step.seenRolls;
    step.seenRolls = state.stats.rolls;
    if (steps % 20 === 0) show(false);
    setTimeout(step, 0);
  }
  step.idle = 0;

  function act() {
    // Close whatever is on screen first.
    if (visible("splash")) return click(".splash-continue") || document.getElementById("splash").click();
    if (visible("tutorial")) return click("#tutorial-skip");
    if (visible("coach")) return click("#coach-skip");
    if (visible("phone")) return click("#phone button");
    if (visible("choice")) return click("#choice-buttons button");
    if (visible("reroll-prompt")) return click("#reroll-buttons button");
    if (visible("workshop")) return click("#workshop-cancel");
    if (visible("end-screen")) {
      out.bestShift = Math.max(out.bestShift, state.shift);
      if (state.status === "won" && hasEscaped(state) && !state.walkedAway) {
        out.escapes++;
        if (chance(0.5) && visible("second-button")) {
          out.endless++;
          return click("#play-again"); // Double or nothing
        }
        return click("#second-button"); // Walk away
      }
      if (state.status !== "won") out.runs++;
      return click("#play-again");
    }
    if (state.status !== "playing") return;
    if (state.onBreak) {
      // Tiny debts so the bot reaches every shift (it plays badly on purpose).
      state.debt = Math.min(state.debt, state.endless ? 400 : 40);
      if (!document.getElementById("pay-off").disabled) click("#pay-off"); // pay it all when it can
      else if (canPay(state) && chance(0.5)) click("#drop-plaque");
      if (chance(0.3)) click("#stock button:not([disabled])");
      if (chance(0.2)) click("#comp-stock button:not([disabled])");
      if (chance(0.1)) click("#hire-row button:not([disabled])");
      if (chance(0.05)) click("#cut-row button:not([disabled])");
      if (chance(0.2)) click("#shuffle");
      if (state.onBreak && state.status === "playing") click("#leave-break");
      return;
    }
    // Betting: get the line bet up to the minimum, sometimes add other bets, then roll.
    if (selectedChip > state.cash) pickChip(chipsFor(state)[0]);
    for (let k = 0; k < 40 && state.point === null && !canRoll(state); k++) {
      placeBet(state.bets.dont > 0 || !passAllowed(state) ? "dont" : "pass");
    }
    if (state.point === null && !canRoll(state)) clearBets();
    if (chance(0.3)) placeBet("field");
    if (state.point !== null && chance(0.5)) placeBet(state.bets.pass ? "odds" : "lay");
    if (chance(0.2)) placeBet(["place6", "place8", "hard8", "come", "dontCome", "fire"][Math.floor(Math.random() * 6)]);
    if (chance(0.1)) click(".hand-comp button:not([disabled])");
    if (chance(0.05)) click("#save-bets");
    if (chance(0.05)) click("#same-bets");
    if (chance(0.05)) showTab(["table", "hand", "crew"][Math.floor(Math.random() * 3)]);
    if (chance(0.05)) showTab("table");
    roll();
  }

  show(false);
  setTimeout(step, 500);
})();
