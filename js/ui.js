// Display code: the table. Dice, bets and their hints, crew, mult, roll results,
// popups and the phone tabs. No game rules here.
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
  document.getElementById("owed").textContent = money(amountOwed(state));
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
  document.getElementById("on-table").textContent = money(betsTotal(b));
  renderExtraBoard(state);
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
  }

  // What the next roll does for each bet, in plain words.
  for (const [id, bet] of [["field-hint", "field"], ["pass-hint", "pass"], ["odds-hint", "odds"], ["dont-hint", "dont"], ["lay-hint", "lay"]]) {
    document.getElementById(id).innerHTML = outcomeHint(state, bet);
  }

  // Highlight the bets a chip can go on right now; grey out the empty ones that can't take one.
  for (const [id, bet] of [["pass-line", "pass"], ["dont-pass", "dont"], ["odds", "odds"], ["lay", "lay"], ["field", "field"]]) {
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
  box.innerHTML = "Mult: <strong>" + Math.round(mult * 100) / 100 + "x</strong>" + (notes.length ? " · " + notes.join(" · ") : "");
  box.className = "mult" + (mult > 1 ? " hot" : mult < 1 ? " cold" : "");
  if (gain) popMult(box, gain);
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
  pop.textContent = "+" + Math.round(gain * 100) / 100 + "x mult";
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
    if (r.outcome === "win") parts.push(BET_NAMES[r.bet] + " +" + money(r.winnings) + (r.mult !== undefined && r.mult !== 1 ? " (x" + r.mult + ")" : ""));
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
    row.innerHTML = "<strong>" + name + '</strong><span class="crew-status">' + status + "</span><br>" + info.style + faces +
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

// A dot on the Hand tab when a comp is ready to use.
function renderTabBar(state) {
  const ready = state.comps.some((id) => !compBlocked(state, id));
  document.getElementById("hand-dot").classList.toggle("hidden", !ready || phoneTab === "hand");
}
