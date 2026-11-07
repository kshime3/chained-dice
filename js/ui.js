// Display code: the table. Dice, bets and their hints, chips (incl. take-back), betting patterns,
// crew, mult, roll results, win/loss popups, the odds chart (Inventory tab) and the phone tabs. No game rules here.
// (The Dealer Break is in ui-break.js; full-screen views in ui-screens.js.)

// Which of a die's 9 spots (3 x 3 grid, read left to right) have a pip.
const PIP_SPOTS = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

// The two table dice are 3D cubes (CSS), seen from above like a real table:
// the rolled value ends up on TOP. Opposite faces add up to 7.
// TOP_TURN: the [x, y] turn (degrees) that puts each value's face on top.
const TOP_TURN = { 1: [90, 0], 6: [90, 180], 3: [90, -90], 4: [90, 90], 5: [0, 0], 2: [180, 0] };

function buildCube(die) {
  if (die.cube) return die.cube;
  die.innerHTML = '<div class="die-shadow"></div><div class="die-hop"><div class="die-view"><div class="die-cube"></div></div></div>';
  const cube = die.querySelector(".die-cube");
  for (let v = 1; v <= 6; v++) {
    const face = document.createElement("div");
    face.className = "die-face f" + v;
    drawDieEl(face, v);
    cube.appendChild(face);
  }
  die.cube = cube;
  die.turn = { x: 0, y: 0, z: 0 };
  return cube;
}

function setTurn(die) {
  die.cube.style.transform = "rotateZ(" + die.turn.z + "deg) rotateX(" + die.turn.x + "deg) rotateY(" + die.turn.y + "deg)";
}

// Show a value right away (no animation).
function drawDie(id, value) {
  const die = document.getElementById(id);
  const cube = buildCube(die);
  die.turn = { x: TOP_TURN[value][0], y: TOP_TURN[value][1], z: 0 };
  cube.style.transition = "none";
  setTurn(die);
  void cube.offsetWidth; // apply now, before the transition comes back
  cube.style.transition = "";
}

// The nearest angle to "from" that looks the same as "to" (keeps extra spinning down).
function nearestTurn(from, to) {
  const d = ((((to - from) % 360) + 540) % 360) - 180;
  return from + d;
}

// Toss a die up and back, then let it land and roll forward onto its value.
// Most of the turning is one forward roll (about the axis the die rolls over).
function tumbleDie(id, value, ms) {
  const die = document.getElementById(id);
  const cube = buildCube(die);
  die.turn = {
    x: nearestTurn(die.turn.x, TOP_TURN[value][0]),
    y: nearestTurn(die.turn.y, TOP_TURN[value][1]),
    z: die.turn.z + 360, // one full forward roll
  };
  cube.style.transitionDuration = ms + "ms";
  setTurn(die);
  for (const part of [die.querySelector(".die-hop"), die.querySelector(".die-shadow")]) {
    part.style.animationDuration = ms + "ms";
    part.classList.remove("go");
    void part.offsetWidth; // restart the toss
    part.classList.add("go");
  }
}

// Roll both dice in 3D and land on the real result. keep: index of a die that stays put (Loaded Die).
function animateDice(finalDice, ms, onDone, keep) {
  if (ms <= 0) {
    drawDie("die1", finalDice[0]);
    drawDie("die2", finalDice[1]);
    setTimeout(onDone, 0);
    return;
  }
  ["die1", "die2"].forEach((id, i) => {
    if (i !== keep) tumbleDie(id, finalDice[i], ms);
  });
  setTimeout(onDone, ms);
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

const BET_NAMES = { pass: "Pass Line", odds: "Odds", dont: "Don't Pass", lay: "Lay Odds", field: "Field", come: "Come", dontCome: "Don't Come", fire: "Fire Bet" };
for (const n of [4, 5, 6, 8, 9, 10]) {
  BET_NAMES["hard" + n] = "Hard " + n;
  BET_NAMES["place" + n] = "Place " + n;
  BET_NAMES["come" + n] = "Come bet on " + n;
  BET_NAMES["dcome" + n] = "Don't Come bet on " + n;
}


// The five main bet boxes on the table and the bet each one holds (the other bets use data-bet tiles).
const MAIN_BET_IDS = { "pass-line": "pass", "dont-pass": "dont", odds: "odds", lay: "lay", field: "field" };

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

// The take-back chip is on: tapping a bet takes chips off it (main.js toggles this).
let takeBackMode = false;

function renderChips(values, selectedChip, onPick, takingBack, onTakeBack) {
  const box = document.getElementById("chips");
  box.innerHTML = "";
  values.forEach((value, tier) => {
    const chip = document.createElement("button");
    const tierClass = [5, 25, 100].includes(value) ? "" : " chip-tier-" + tier; // endless chips get colours by size
    chip.className = "chip chip-" + value + tierClass + (value === selectedChip ? " selected" : "");
    chip.textContent = shortMoney(value);
    chip.dataset.value = value; // dragging a chip needs its value (js/controls.js)
    chip.onclick = () => onPick(value);
    box.appendChild(chip);
  });
  if (onTakeBack) {
    const back = document.createElement("button");
    back.className = "chip chip-take-back" + (takingBack ? " selected" : "");
    back.innerHTML = '<span class="tb-icon">↩</span><span class="tb-label">Take<br>back</span>';
    back.title = "Take back: tap a bet to take one chip off it, double-tap to take the whole bet";
    back.setAttribute("aria-label", "Take back chips");
    back.onclick = onTakeBack;
    box.appendChild(back);
  }
}

// Betting patterns you've unlocked: a row of buttons on tall phones, a 🎯 button (a pick list) on short ones.
// handlers: { onPattern(id) }
function renderPatterns(state, chip, onPattern) {
  const unlocked = Object.keys(BET_PATTERNS).filter((id) => patternCheck(state, id, chip) !== "locked");
  document.getElementById("patterns-button").classList.toggle("hidden", !unlocked.length);
  const row = document.getElementById("pattern-row");
  row.classList.toggle("hidden", !unlocked.length);
  row.innerHTML = "";
  for (const id of unlocked) {
    const p = BET_PATTERNS[id];
    const b = document.createElement("button");
    b.className = "pattern-chip";
    b.innerHTML = p.name + " <small>" + money(chip * p.bets.length) + "</small>";
    b.title = p.what + " (" + money(chip) + " each)";
    b.disabled = patternCheck(state, id, chip) !== "ok" || state.onBreak || state.status !== "playing";
    b.onclick = () => onPattern(id);
    row.appendChild(b);
  }
}

// In take-back mode, mark the bets that have chips you're allowed to take back.
function markTakeBack(state) {
  document.body.classList.toggle("taking-back", takeBackMode);
  const can = (bet) => takeBackMode && state.bets[bet] > 0 && removableBets(state).includes(bet);
  for (const [id, bet] of Object.entries(MAIN_BET_IDS)) {
    const el = document.getElementById(id);
    if (el) el.classList.toggle("can-take", can(bet));
  }
  document.querySelectorAll("#extra-board [data-bet]").forEach((el) => el.classList.toggle("can-take", can(el.dataset.bet)));
}

function renderState(state) {
  const b = state.bets;
  document.getElementById("shift-number").textContent = state.shift;
  countTo(document.getElementById("cash"), state.cash); // counts up or down (juice.js)
  document.getElementById("interest").textContent = Math.round(interestRate(state) * 1000) / 10 + "%";
  countTo(document.getElementById("owed"), amountOwed(state));
  document.getElementById("debt-of").textContent = "of " + money(state.debt);
  document.querySelector(".owed-box").classList.toggle("paid-off", amountOwed(state) <= 0);
  const progress = Math.min(100, (state.deposited / state.debt) * 100);
  document.getElementById("progress-fill").style.width = progress + "%";
  renderChainBar(state);
  renderCrew(state);
  renderOddsPanel(state);
  renderMult(state);
  renderHouseRule(state);
  renderChallenge(state);
  countTo(document.getElementById("on-table"), betsTotal(b));
  renderExtraBoard(state);
  markTakeBack(state);
  if (typeof betPattern === "function") renderPatterns(state, selectedChip, betPattern); // main.js owns the chip and the action
  renderStacks(state); // chip stacks on the bets (juice.js)
  document.getElementById("table-min").textContent = "Table min " + money(tableMin(state));
  document.getElementById("pass-amount").textContent = money(b.pass);
  document.getElementById("dont-amount").textContent = money(b.dont);
  document.getElementById("field-amount").textContent = money(b.field);

  // Point marker
  const puck = document.getElementById("puck");
  // Long wording on bigger screens, short on phones.
  puck.innerHTML = state.point === null
    ? '<strong>FIRST ROLL</strong> · <span class="hide-mobile">7 or 11 wins · 2, 3, 12 lose</span><span class="show-mobile">7/11 win, 2/3/12 lose</span>'
    : "<strong>POINT " + state.point + '</strong> · <span class="hide-mobile">roll it again before a 7</span><span class="show-mobile">' + state.point + " before 7 wins</span>";
  puck.className = "puck " + (state.point === null ? "off" : "on");

  // Line bets lock while a point is on (the one you're not on is just closed)
  const pointOn = state.point !== null;
  for (const [id, lockId, bet] of [["pass-line", "pass-lock", "pass"], ["dont-pass", "dont-lock", "dont"]]) {
    document.getElementById(id).classList.toggle("locked", pointOn && b[bet] > 0);
    document.getElementById(lockId).textContent = pointOn && b[bet] > 0 ? "🔒 Locked" : "";
    document.getElementById(lockId).title = "Locked until the point is hit or a 7 rolls.";
  }

  // Dark Side Only: the Pass Line is closed all shift
  if (!passAllowed(state)) document.getElementById("pass-lock").textContent = "Closed: Dark Side Only";

  // Odds and Lay Odds open while a point is on, behind the matching line bet
  for (const [bet, line] of [["odds", "pass"], ["lay", "dont"]]) {
    const on = pointOn && b[line] > 0;
    document.getElementById(bet + "-amount").textContent = on ? money(b[bet]) + " / max " + money(backingLimit(state, bet)) : "";
    document.getElementById(bet + "-max").classList.toggle("hidden", !on || b[bet] >= backingLimit(state, bet) || state.cash <= 0);
  }

  // What the next roll does for each bet, in plain words.
  for (const [id, bet] of [["field-hint", "field"], ["pass-hint", "pass"], ["odds-hint", "odds"], ["dont-hint", "dont"], ["lay-hint", "lay"]]) {
    document.getElementById(id).innerHTML = outcomeHint(state, bet);
  }

  // Highlight the bets a chip can go on right now; grey out the empty ones that can't take one.
  for (const [id, bet] of Object.entries(MAIN_BET_IDS)) {
    const open = betOpen(state, bet);
    document.getElementById(id).classList.toggle("open", open);
    document.getElementById(id).classList.toggle("disabled", !open && b[bet] === 0);
  }

  if (state.lastRoll) {
    drawDie("die1", state.lastRoll.dice[0]);
    drawDie("die2", state.lastRoll.dice[1]);
    document.getElementById("total").textContent = "Total: " + state.lastRoll.total;
  }
  updateCoach(state); // the guided first shooter follows what is on screen
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
    seat.innerHTML = crewPortrait(name) + '<span class="seat-name">' + name + (crafted ? " 🔨" : "") + (encore ? " (Encore)" : "") + "</span>";
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
  document.getElementById("shooter").innerHTML = shooter
    ? '<span class="shooter-face">' + crewPortrait(shooter).replace('viewBox="0 0 200 240"', 'viewBox="48 38 104 104"') + "</span><span><span class=\"hide-mobile\">Now shooting: </span><strong>" + shooter + "</strong> (<span class=\"hide-mobile\">shooter </span>" + (state.shooterIndex + 1) + " of " + state.crew.length + ")</span>"
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

// The current mult, and why (synergies). When it goes up, it pops with a ding.
let multShown = null;
function renderMult(state) {
  const box = document.getElementById("mult");
  if (!state.crew[state.shooterIndex]) {
    box.textContent = "";
    multShown = null;
    return;
  }
  const mult = effectiveMult(state);
  const gain = multShown !== null && mult > multShown + 1e-9 ? mult - multShown : 0;
  multShown = mult;
  const notes = multReasons(state);
  box.innerHTML = '<span class="mult-pill">Mult <strong>' + multText(mult) + "</strong></span>" + (notes.length ? '<span class="mult-notes">' + notes.join(" · ") + "</span>" : "");
  box.className = "mult" + (mult > 1 ? " hot" : mult < 1 ? " cold" : "");
  if (gain && !cardPopsExplain()) popMult(box, gain); // card pops show where the mult came from instead
}

// The odds chart (top of the Inventory tab): the chance of each total on the next roll, a color key, and a "race" bar
// that answers what players actually want to know (who wins, Pass Line or Don't Pass).
function renderOddsPanel(state) {
  const panel = document.getElementById("odds-panel");
  const name = state.crew[state.shooterIndex];
  if (!name) {
    panel.innerHTML = "";
    return;
  }
  const charm = nextRollPairs(state);
  const odds = diceOdds(currentDice(state), charm);
  const pct = (x) => Math.round(x * 100) + "%";
  let bars = "";
  for (let t = 2; t <= 12; t++) {
    const share = Math.min(1, odds[t] / 0.25); // 25% fills the bar (height set in CSS)
    let cls = "bar";
    if (t === 7) cls += " seven";
    if (t === state.point) cls += " point";
    if (odds[t] === 0) cls += " impossible";
    bars += '<div class="' + cls + '"><span class="pct">' + pct(odds[t]) + '</span>' +
      '<div class="fill" style="height: calc(var(--bar-max) * ' + share + ')"></div><span class="num">' + t + "</span></div>";
  }
  const sub = '<p class="odds-sub">How likely each total is on <strong>' + (name === "You" ? "your" : name + "'s") + "</strong> next roll.</p>";
  let key, race;
  if (state.point !== null) {
    const hit = pointBeforeSeven(odds, state.point);
    key = '<span class="key"><i class="sw point"></i>your point (' + state.point + ")</span>" +
      '<span class="key"><i class="sw seven"></i>7 (ends the turn)</span><span class="key"><i class="sw other"></i>anything else: nothing happens</span>';
    race = '<div class="race-title">Which comes first, the ' + state.point + " or a 7?</div>" +
      '<div class="race"><div class="seg point" style="width:' + hit * 100 + '%">' + pct(hit) + '</div><div class="seg seven" style="width:' + (1 - hit) * 100 + '%">' + pct(1 - hit) + "</div></div>" +
      '<div class="race-labels"><span>' + state.point + " first: <strong>Pass Line wins</strong></span><span>7 first: <strong>Don't Pass wins</strong></span></div>";
  } else {
    const win = odds[7] + odds[11], lose = odds[2] + odds[3] + odds[12], pointSet = Math.max(0, 1 - win - lose);
    key = '<span class="key"><i class="sw seven"></i>7</span><span class="key"><i class="sw other"></i>other totals</span>';
    race = '<div class="race-title">This is a first roll (come-out)</div>' +
      '<div class="race"><div class="seg win" style="width:' + win * 100 + '%">' + pct(win) + '</div><div class="seg lose" style="width:' + lose * 100 + '%">' + pct(lose) +
      '</div><div class="seg setpoint" style="width:' + pointSet * 100 + '%">' + pct(pointSet) + "</div></div>" +
      '<div class="race-labels three"><span><strong>7 or 11</strong>: Pass Line wins</span><span><strong>2, 3 or 12</strong>: Pass Line loses</span><span><strong>4-10</strong>: becomes the point</span></div>';
  }
  let notes = "Chance of a 7: <strong>" + percent(odds[7]) + "</strong> (normal dice: 16.7%).";
  if (state.dice.note) notes += " " + state.dice.note;
  if (pairDue(state)) notes += " <strong>Doubles Charm: next roll is a pair!</strong>";
  const armed = Object.keys(state.armed).map((id) => COMPS[id].name + (id === "loadedShot" ? " (left die " + state.armed[id] + ")" : ""));
  if (armed.length) notes += ' <strong class="armed-text">Armed: ' + armed.join(", ") + ".</strong>";
  panel.innerHTML = sub + '<div class="bars">' + bars + '</div><div class="odds-key">' + key + "</div>" + race + '<div class="odds-summary">' + notes + "</div>";
}

// Show the win or fall screen when the shift is over.
// One link of the chain (style A, owner's pick 2026-11-07): a real chain seen from the side,
// flat oval links alternating with edge-on links. Broken links are grey and snapped open.
// Each link is a 22 x 20 drawing; neighbours overlap so the chain interlocks.
function chainLinkSvg(flat, broken) {
  const grey = "#4a4a4a";
  let body;
  if (flat && broken) body = '<ellipse cx="11" cy="11" rx="8.6" ry="6.4" fill="none" stroke="' + grey + '" stroke-width="2.4" stroke-dasharray="36 10" transform="rotate(10 11 11)"/>';
  else if (flat) body = '<ellipse class="metal-dark" cx="11" cy="10" rx="8.6" ry="6.6" fill="none" stroke="#5d6570" stroke-width="4.4"/><ellipse class="metal" cx="11" cy="10" rx="8.6" ry="6.6" fill="none" stroke="#c9c9c9" stroke-width="2.4"/>';
  else if (broken) body = '<rect x="1" y="9" width="8" height="4" rx="2" fill="' + grey + '"/><rect x="13" y="10" width="8" height="4" rx="2" fill="' + grey + '"/>';
  else body = '<rect class="metal-fill" x="1" y="7.5" width="20" height="5" rx="2.5" fill="#c9c9c9" stroke="#5d6570" stroke-width="1.5"/>';
  return '<svg viewBox="0 0 22 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + body + "</svg>";
}

// A chain of links as HTML. broken: how many are already open. breaking: the index
// of the link that snaps now (-1 for none). big: the large end-of-shift version.
// Each link is split into two halves (each shows half the drawing) so a snapping link can fly apart.
function chainHtml(broken, breaking, big, total) {
  let html = '<div class="chain' + (big ? " big" : "") + '">';
  for (let i = 0; i < total; i++) {
    const flat = i % 2 === 0;
    let cls = "link " + (flat ? "flat" : "edge");
    if (i < broken) cls += " broken";
    if (i === breaking) cls += " breaking";
    const svg = chainLinkSvg(flat, i < broken && i !== breaking);
    html += '<span class="' + cls + '"><span class="half l">' + svg + '</span><span class="half r">' + svg + "</span>";
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

// ---------- More bets (Milestone 12b) ----------

// The rest of the table under the main bets: Place bets, Hard Ways, Come / Don't Come
// and the Fire Bet. Bets not unlocked yet are greyed out with a lock.
function renderExtraBoard(state) {
  const board = document.getElementById("extra-board");
  const b = state.bets;
  const tile = (bet, title, sub) => {
    const group = betGroup(bet);
    if (!available(state, group)) {
      return '<div class="bet-area extra-tile locked-bet" data-bet="' + bet + '" title="Locked: keep playing to unlock ' + BET_GROUPS[group].name + '"><div class="bet-title">' + title + " 🔒</div></div>";
    }
    const open = betOpen(state, bet);
    const chips = b[bet] > 0 || (sub && sub.moved);
    return '<div class="bet-area extra-tile' + (open ? " open" : chips ? "" : " disabled") + '" data-bet="' + bet + '" title="' + BET_GROUPS[group].text + '"><div class="bet-title">' + title +
      ' <span class="bet-amount">' + (b[bet] ? money(b[bet]) : "") + '</span></div><div class="bet-hint' + (sub.moved ? " show-hint" : "") + '">' + (sub.text || sub) + "</div></div>";
  };
  const moved = (prefix) => [4, 5, 6, 8, 9, 10].filter((n) => b[prefix + n] > 0).map((n) => "on " + n + ": " + money(b[prefix + n])).join(" · ");
  let html = '<div class="extra-row">' + [4, 5, 6, 8, 9, 10].map((n) => tile("place" + n, "PLACE " + n, CONFIG.placePayouts[n].join(":"))).join("") + "</div>";
  html += '<div class="extra-row">' + [4, 6, 8, 10].map((n) => tile("hard" + n, "HARD " + n, n / 2 + "+" + n / 2 + " · " + CONFIG.hardWaysPayouts[n] + ":1")).join("");
  const comeOn = moved("come"), dcomeOn = moved("dcome");
  html += tile("come", "COME", comeOn ? { text: comeOn, moved: true } : "7/11 win");
  html += tile("dontCome", "DON'T COME", dcomeOn ? { text: dcomeOn, moved: true } : "2/3 win");
  html += tile("fire", "🔥 FIRE", state.firePoints.length + " points · max " + money(fireMax(state))) + "</div>";
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

// "+0.5x" pops up from the mult and fades, with a ding.
function popMult(box, gain) {
  const pop = document.createElement("div");
  pop.className = "mult-pop";
  pop.textContent = "+" + multText(gain) + " mult";
  const r = box.getBoundingClientRect();
  pop.style.left = r.left + r.width / 2 + "px";
  pop.style.top = r.top + "px";
  document.body.appendChild(pop);
  setTimeout(() => pop.remove(), CONFIG.betPopMs);
  box.classList.add("bump");
  playSound("ding");
}

// "Wins: 8 · Loses: 7" for a bet on the next roll, with what it pays when that helps.
function outcomeHint(state, bet) {
  const o = nextRollOutcomes(bet, state.point);
  if (!o) {
    if (bet === "odds" || bet === "lay" || /^(place|hard)/.test(bet)) return "Opens once a point is set";
    return "";
  }
  const list = (t) => t.join(" ");
  let pays = "";
  if (bet === "field") pays = " · 2 pays x" + CONFIG.fieldPayouts[2] + ", 12 x" + CONFIG.fieldPayouts[12];
  if (bet === "odds") pays = " · pays " + CONFIG.oddsPayouts[state.point].join(":");
  if (bet === "lay") pays = " · pays " + CONFIG.layPayouts[state.point].join(":");
  return '<span class="hint-win">Wins: ' + list(o.wins) + '</span> · <span class="hint-lose">Loses: ' + list(o.loses) + "</span>" + (o.note ? " · " + o.note : "") + pays;
}

// ---------- Plain-English roll results ----------

// The big line after a roll, from your side of the table. Returns { text, kind } (kind: good, bad, neutral).
function rollHeadline(total, pointBefore, pointAfter, line, sevenOut) {
  const dont = line === "dont";
  if (pointBefore === null) {
    if (CONFIG.comeOutWinners.includes(total)) {
      return dont ? { text: "❌ " + total + " on the first roll: your Don't Pass loses.", kind: "bad" }
        : { text: "✅ " + total + " on the first roll: your Pass Line wins!", kind: "good" };
    }
    if (CONFIG.comeOutLosers.includes(total)) {
      if (!dont) return { text: "❌ Craps! " + total + " on the first roll loses the Pass Line.", kind: "bad" };
      return CONFIG.dontComeOutWinners.includes(total) ? { text: "✅ Craps " + total + ": your Don't Pass wins!", kind: "good" }
        : { text: "➖ " + total + ": a tie for Don't Pass. Your bet stays.", kind: "neutral" };
    }
    return dont ? { text: "🎯 " + total + " is the point. A 7 before another " + total + " wins your Don't Pass.", kind: "neutral" }
      : { text: "🎯 " + total + " is the point. Roll " + total + " again before a 7 to win.", kind: "neutral" };
  }
  if (total === pointBefore) {
    return dont ? { text: "❌ The point (" + pointBefore + ") came again: your Don't Pass loses.", kind: "bad" }
      : { text: "🎉 Point hit! " + pointBefore + " came again: your Pass Line wins!", kind: "good" };
  }
  if (sevenOut) {
    return dont ? { text: "✅ Seven out: your Don't Pass wins!", kind: "good" }
      : { text: "💀 A 7 came before the " + pointBefore + ": seven out. Your Pass Line loses and the dice move on.", kind: "bad" };
  }
  if (total === CONFIG.sevenOut && pointAfter !== null) return { text: "😮 A 7, but it's ignored this time. Still rolling for " + pointAfter + ".", kind: "neutral" };
  return { text: "Rolled " + total + ": no decision for your line bet. Still rolling for " + pointBefore + " (a 7 ends it).", kind: "neutral" };
}

// The money line under it: "Pass Line +$10 · Odds +$12 · Field -$5".
function rollDetails(results) {
  const parts = [];
  for (const r of results) {
    if (r.outcome === "win") parts.push(BET_NAMES[r.bet] + " +" + money(r.winnings) + (r.mult !== undefined && r.mult !== 1 ? " (x" + bigNumber(Math.round(r.mult * 100) / 100) + ")" : ""));
    if (r.outcome === "lose") parts.push(BET_NAMES[r.bet] + " -" + money(r.amount));
    if (r.outcome === "move") parts.push(BET_NAMES[r.bet] + " moves to the " + r.to.replace(/\D/g, ""));
  }
  return parts.join(" · ");
}

function showRollResult(headline, details, sevenOut) {
  const box = document.getElementById("message");
  box.innerHTML = "";
  if (sevenOut) {
    const big = document.createElement("div");
    big.className = "seven-out-text";
    big.textContent = "SEVEN OUT!";
    box.appendChild(big);
  }
  const head = document.createElement("div");
  head.className = "roll-headline " + headline.kind;
  head.textContent = headline.text;
  box.appendChild(head);
  if (details) {
    const rest = document.createElement("div");
    rest.className = "roll-details";
    rest.textContent = details;
    box.appendChild(rest);
  }
}

// ---------- Phone tabs ----------

// The Crew tab: everyone at the table, written out (hover text doesn't work on phones).
function renderCrewList(state) {
  const box = document.getElementById("crew-list");
  box.innerHTML = "<h3>At the table</h3>";
  state.crew.forEach((name, i) => {
    const info = CREW_INFO[name];
    if (!info) return;
    const row = document.createElement("div");
    row.className = "crew-card" + (i === state.shooterIndex ? " shooting" : "") + (i < state.shooterIndex ? " done" : "");
    const status = i === state.shooterIndex ? "🎲 Shooting now" : i < state.shooterIndex ? "Done this shift" : "Shoots " + (i - state.shooterIndex === 1 ? "next" : "later");
    const faces = name === "You" ? "<br>Your dice: " + state.myDice.left.join(" ") + " / " + state.myDice.right.join(" ") : "";
    row.innerHTML = '<div class="crew-face">' + crewPortrait(name) + "</div><strong>" + name + '</strong><span class="crew-status">' + status + "</span><br>" + info.style + faces +
      '<br><span class="hint">Dice: ' + info.dice + "</span> · Chance of a 7: <strong>" + percent(sevenChance(name, state)) + "</strong>";
    box.appendChild(row);
  });
}

// Which tab is showing on phones (bigger screens show everything at once).
let phoneTab = "table";
function showTab(tab) {
  phoneTab = tab;
  document.body.dataset.tab = tab;
  for (const b of document.querySelectorAll("#tabbar button")) b.classList.toggle("active", b.dataset.tab === tab);
}

// A dot on the Inventory tab when a comp is ready to use.
function renderTabBar(state) {
  const ready = state.comps.some((id) => !compBlocked(state, id));
  document.getElementById("hand-dot").classList.toggle("hidden", !ready || phoneTab === "hand");
}
