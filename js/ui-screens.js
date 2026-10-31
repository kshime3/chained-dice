// Display code: full-screen views. Splashes, prompts, the end-of-run screen and
// stats, the fall, tutorials, the Collection and the opening. No game rules here.

// A small pick-one screen. options: [{ label, value }]. onChoose(value) or onChoose(null) for Cancel.
// opts.cancel: false hides the Cancel button (the player must pick).
function showChoice(title, text, options, onChoose, opts = {}) {
  const box = document.getElementById("choice");
  document.getElementById("choice-title").textContent = title;
  document.getElementById("choice-text").textContent = text;
  const buttons = document.getElementById("choice-buttons");
  buttons.innerHTML = "";
  const done = (value) => {
    box.classList.add("hidden");
    onChoose(value);
  };
  for (const o of options) {
    const b = document.createElement("button");
    b.className = "big-button";
    b.textContent = o.label;
    b.onclick = () => done(o.value);
    buttons.appendChild(b);
  }
  if (opts.cancel !== false) {
    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.onclick = () => done(null);
    buttons.appendChild(cancel);
  }
  box.classList.remove("hidden");
}

// The end of a shift (won), the escape, or the fall.
// handlers: { primary, secondary } from main.js
let chainShownFor = ""; // so the link only breaks once per win
function renderEndScreen(state, handlers) {
  const screen = document.getElementById("end-screen");
  if (state.status === "playing") {
    screen.classList.add("hidden");
    return;
  }
  const kept = money(totalMoney(state));
  const next = shiftScale(state.shift + 1);
  const linksLeft = totalLinks(state) - linksBroken(state);
  let title, body, primary, secondary = null, showStats = false, mood = "won";

  if (state.status === "won" && hasEscaped(state) && state.walkedAway) {
    title = "YOU WALK OUT FREE.";
    body = "You walked away from the table with " + kept + " in your pocket. Nobody stops you.";
    primary = "Play again";
    showStats = true;
  } else if (state.status === "won" && hasEscaped(state)) {
    title = "YOU WALK OUT FREE.";
    body = "The last link falls away. You stand up from the table, and nobody stops you. The dealer smiles: \"Double or nothing?\"";
    primary = "Double or nothing";
    secondary = "Walk away";
    showStats = true;
  } else if (state.status === "won") {
    title = state.savedByLink ? "THE SPARE LINK CATCHES YOU." : "THE FLOOR HOLDS.";
    const left = totalMoney(state);
    const carry = Math.floor(left * carryShare(state));
    body = '<p class="end-lead">' + (state.savedByLink
      ? "The floor opens, but your spare link snags on the edge and holds. The dealer sighs and forgives the rest of the debt."
      : "The dealer reaches over and unlocks a link. <em>Clank.</em>") + "</p>" +
      '<div class="end-big">' + (state.endless ? "Endless shift " + state.shift + " survived" : linksLeft + (linksLeft === 1 ? " link" : " links") + " to go") + "</div>" +
      '<div class="end-lines">' +
      "<div><span>Money left</span><strong>" + money(left) + "</strong></div>" +
      "<div><span>Dealer's cut (" + Math.round((1 - carryShare(state)) * 100) + "%)</span><strong>-" + money(left - carry) + "</strong></div>" +
      '<div class="total"><span>You carry over</span><strong>' + money(carry) + "</strong></div>" +
      "</div>" +
      '<p class="end-next">Shift ' + (state.shift + 1) + ": +" + money(next.cash) + " cash · you'll owe <strong>" + money(next.debt) + "</strong> · table min " + money(next.minBet) + "</p>";
    primary = "Answer the phone";
  } else {
    mood = "fell";
    title = "THE FLOOR OPENS.";
    const why = state.status === "fell-broke"
      ? "You couldn't cover the " + money(tableMin(state)) + " line bet."
      : "You only paid " + money(state.deposited) + " of the " + money(state.debt) + " you owed.";
    body = why + (state.endless
      ? " You walked out free once. Greed brought you back. You lasted " + (state.shift - 1 - totalLinks(state)) + " extra shifts."
      : " The chains drag the whole crew down into the dark. You broke " + linksBroken(state) + " of " + totalLinks(state) + " links.");
    primary = "Play again";
    showStats = true;
  }

  document.getElementById("end-title").textContent = title;
  document.getElementById("end-body").innerHTML = body;
  document.getElementById("run-stats").innerHTML = showStats ? runStatsHtml(state) : "";
  const first = document.getElementById("play-again");
  first.textContent = primary;
  first.onclick = handlers.primary;
  const second = document.getElementById("second-button");
  second.classList.toggle("hidden", !secondary);
  second.textContent = secondary || "";
  second.onclick = handlers.secondary;

  // The link-breaking animation, once per won shift (not in endless mode).
  const chainBox = document.getElementById("chain-break");
  const key = state.shift + ":" + state.status + ":" + state.walkedAway;
  if (state.status === "won" && !state.endless && !state.walkedAway) {
    if (chainShownFor !== key) {
      chainBox.innerHTML = chainHtml(linksBroken(state) - 1, linksBroken(state) - 1, true, totalLinks(state));
      playSound("shiftWon");
      setTimeout(() => playSound("snap"), 900);
    }
  } else if (chainShownFor !== key) {
    chainBox.innerHTML = "";
  }
  chainShownFor = key;
  screen.className = "overlay " + mood;
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
  const best = bestShooter(st);
  const net = st.totalWon - st.totalLost;
  let heroNumber, heroLabel;
  if (state.endless) {
    heroNumber = "+" + (state.shift - 1 - totalLinks(state));
    heroLabel = "endless shifts after escaping";
  } else if (hasEscaped(state)) {
    heroNumber = "FREE";
    heroLabel = "escaped in " + state.shift + " shifts";
  } else {
    heroNumber = linksBroken(state) + " / " + totalLinks(state);
    heroLabel = "links broken";
  }
  let html = '<div class="hero"><div class="hero-number">' + heroNumber + '</div><div class="stat-label">' + heroLabel + "</div></div>";
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
  html += '<h3>Your money over the run</h3><p class="hint">Cash plus bets after every roll. Drops at a Break are payments to the dealer; dashed lines mark new shifts.</p>' + moneyChartSvg(st);
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

// A full-screen splash (seven-out, point hit). Tap to skip; onDone runs after.
// ms = null: it stays until its Continue button is pressed (unlock news is worth reading).
let splashOpen = false;
let splashQueue = []; // splashes waiting for the current one to close
function showSplash(html, kind, ms, onDone) {
  const box = document.getElementById("splash");
  if (splashOpen) {
    splashQueue.push([html, kind, ms, onDone]);
    return;
  }
  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    splashOpen = false;
    box.classList.add("hidden");
    if (onDone) onDone();
    if (splashQueue.length && !splashOpen) showSplash(...splashQueue.shift());
  };
  splashOpen = true;
  document.getElementById("splash-content").innerHTML = html;
  box.className = "overlay splash " + kind;
  if (ms === null) {
    box.onclick = null;
    const button = box.querySelector(".splash-continue");
    if (button) button.onclick = close;
  } else {
    box.onclick = close;
    setTimeout(close, ms);
  }
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

// The fall: the floor shakes, everything drops into the pit, then onDone (the stats screen).
let fallingNow = false;
function playFall(ms, onDone) {
  if (ms <= 0) {
    onDone();
    return;
  }
  fallingNow = true;
  const body = document.body;
  // Each piece falls a moment after the last, spinning a little.
  document.querySelectorAll(".seat, .side > *, .table, .controls, .message").forEach((el, i) => {
    el.style.setProperty("--fall-delay", (0.45 + i * 0.05).toFixed(2) + "s");
    el.style.setProperty("--fall-spin", (Math.random() * 50 - 25).toFixed(0) + "deg");
  });
  document.getElementById("fall-pit").classList.remove("hidden");
  body.classList.add("quake");
  setTimeout(() => body.classList.add("falling"), 450);
  setTimeout(() => {
    body.classList.remove("quake", "falling");
    document.getElementById("fall-pit").classList.add("hidden");
    fallingNow = false;
    onDone();
  }, ms);
}

function renderMuteButton() {
  const button = document.getElementById("mute");
  button.textContent = muted ? "🔇 Off" : "🔊 On";
  button.title = muted ? "Sound is off. Click to turn it on." : "Sound is on. Click to mute.";
}

// The Trapdoor screen.
function cutSplash(name) {
  return '<div class="splash-title">TRAPDOOR.</div><p class="splash-big">' + name + "'s seat drops away.</p>" +
    "<p>The dealer pulls a lever. " + name + " is gone for the rest of the run, and the seats close up.</p>" + '<p class="hint">Tap to continue</p>';
}

// The SEVEN OUT screen.
function sevenOutSplash(who, lost, notes, won) {
  return '<div class="splash-title">SEVEN OUT!</div>' +
    "<p>" + (who === "You" ? "You" : who) + " sevened out.</p>" +
    (won > 0 ? '<p class="splash-big good-text">+' + money(won) + "</p><p>You bet against the shooter, and it paid.</p>" : "") +
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

// ---------- Unlocks ----------

function tutorialOpen() {
  return !document.getElementById("tutorial").classList.contains("hidden");
}

function unlockSplash(ids, perks, systems = []) {
  const kind = { card: "card", comp: "comp", crew: "crew member you can hire", bet: "bet (find it under ➕ More bets)" };
  const perkText = (id) => CONFIG.reputation.find((r) => r.id === id).text;
  return '<div class="splash-title">🔓 UNLOCKED!</div>' +
    ids.map((id) => '<p class="splash-big">' + unlockName(id) + '</p><p class="hint">New ' + kind[UNLOCKS[id].kind] + "</p><p>" + unlockReason(id) + "</p>").join("") +
    (ids.length ? "<p>It can show up from your <strong>next run</strong>. See it in the 📖 Collection.</p>" : "") +
    perks.map((id) => '<p class="boost">⭐ Reputation up! From your next run: <strong>' + perkText(id) + "</strong></p>").join("") +
    systems.map((id) => '<p class="boost">🆕 New from your next run: <strong>' + SYSTEMS[id].name + "</strong>. " + SYSTEMS[id].text + "</p>").join("") +
    '<button class="big-button splash-continue">Continue</button>';
}

// The Reputation ladder: earned bonuses ticked, the rest shown with how many unlocks they need.
function reputationHtml() {
  const found = profile().unlocked.length;
  const earned = earnedReputation();
  return "<h3>⭐ Reputation</h3><p class=\"hint\">Every " + CONFIG.reputationEvery + " unlocks, the house remembers you: a lasting bonus from your next run on.</p>" +
    '<div class="rep-ladder">' + CONFIG.reputation.map((r, i) => {
      const need = (i + 1) * CONFIG.reputationEvery;
      const got = earned.includes(r.id);
      return '<div class="rep-step' + (got ? " earned" : "") + '">' + (got ? "✓ " : need + " unlocks: ") + r.text + "</div>";
    }).join("") + "</div>" + '<p class="hint">You have ' + found + " unlock" + (found === 1 ? "" : "s") + ".</p>";
}

// The Collection: everything unlocked, and locked things as mysteries (no hints).
function renderCollection() {
  const tile = (id, title, text, rarity) => isUnlocked(id)
    ? '<div class="collection-tile ' + (rarity || "") + '"><strong>' + title + "</strong><br>" + text + (UNLOCKS[id] ? '<div class="unlock-reason">' + unlockReason(id) + "</div>" : "") + "</div>"
    : '<div class="collection-tile locked"><strong>???</strong><br>🔒 Locked</div>';
  // Found things first (common first), then the mysteries, so a mystery's place gives nothing away.
  const order = (ids) => ids.filter(isUnlocked).concat(ids.filter((id) => !isUnlocked(id)));
  const cards = order(Object.keys(CARDS).sort((a, b) => RARITY_ORDER.indexOf(CONFIG.cardRarity[b]) - RARITY_ORDER.indexOf(CONFIG.cardRarity[a])));
  const crew = order(CONFIG.crew.filter((n) => n !== "You").concat(CONFIG.recruits));
  let html = "<h3>Cards</h3><div class=\"collection-grid\">" + cards.map((id) => tile(id, CARDS[id].name, CARDS[id].text, CONFIG.cardRarity[id])).join("") + "</div>";
  html += "<h3>Comps</h3><div class=\"collection-grid\">" + order(Object.keys(COMPS)).map((id) => tile(id, COMPS[id].name, COMPS[id].text)).join("") + "</div>";
  html += "<h3>Crew</h3><div class=\"collection-grid\">" + crew.map((n) => tile(n, n, CREW_INFO[n].style)).join("") + "</div>";
  html += "<h3>Bets</h3><div class=\"collection-grid\">" + order(Object.keys(BET_GROUPS)).map((g) => tile(g, BET_GROUPS[g].name, BET_GROUPS[g].text)).join("") + "</div>";
  const all = cards.concat(Object.keys(COMPS), crew, Object.keys(BET_GROUPS));
  document.getElementById("collection-count").textContent = all.filter(isUnlocked).length + " of " + all.length + " found. Locked things unlock by playing. How? That's for you to discover.";
  document.getElementById("collection-body").innerHTML = reputationHtml() + html;
}

function showCollection() {
  renderCollection();
  document.getElementById("collection").classList.remove("hidden");
}

// ---------- Opening animation ----------

// The die rolls in leaving a blood trail, the chain snaps, the title appears, then it fades.
// Tap to skip. ms = 0 skips it entirely.
function playOpening(ms) {
  const box = document.getElementById("opening");
  if (ms <= 0) return;
  box.classList.remove("hidden");
  let closed = false;
  const close = (fadeMs) => {
    if (closed) return;
    closed = true;
    box.style.transition = "opacity " + fadeMs + "ms ease";
    box.style.opacity = "0";
    setTimeout(() => box.classList.add("hidden"), fadeMs);
  };
  box.onclick = () => close(250);
  setTimeout(() => close(700), ms - 700);
}
