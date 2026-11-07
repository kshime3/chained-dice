// Display: "juice", the feel of the game (release 1.0.5). No game rules here.
// J2: chip stacks on every bet, and chips that fly: tray -> bet when you bet, bet -> tray when you
//     take chips back, losing bets swept off toward the dealer, winnings flying to your Cash.
// J3: money that counts to its new value (Cash, Still owed, On table); Interest pulses when it pays;
//     card pops (style C, owner's pick): a card's icon zips from Inventory into the mult, "+0.25x" floats off it.
// Everything that moves checks Reduce motion (body.reduce-motion): stacks still show, nothing flies.

// Chip colours, matching the chip tray (red, green, black; endless chips by size order).
const CHIP_PAINT = [
  "radial-gradient(circle at 50% 30%, #f05a48, #d2372a 60%)",
  "radial-gradient(circle at 50% 30%, #3fd67e, #22a65b 60%)",
  "radial-gradient(circle at 50% 30%, #5a5a5a, #262626 60%)",
];
function chipPaintFor(value, values) {
  const fixed = { 5: 0, 25: 1, 100: 2 };
  const tier = value in fixed ? fixed[value] : Math.max(0, values.indexOf(value));
  return CHIP_PAINT[Math.min(tier, CHIP_PAINT.length - 1)];
}

// An amount as chips, biggest first ($35 -> 25, 5, 5). At most `max` chips are drawn.
function chipsIn(amount, values, max) {
  const out = [];
  let left = amount;
  for (const v of values.slice().sort((a, b) => b - a)) {
    while (left >= v && out.length < max) {
      out.push(v);
      left -= v;
    }
  }
  if (!out.length && amount > 0) out.push(values[0]); // less than the smallest chip: still show one
  return out;
}

function motionOff() {
  return document.body.classList.contains("reduce-motion");
}

// ---------- Chip stacks on the bets ----------

// How much sits on each spot (Come bets that moved to a number stack on their Come tile).
function stackAmounts(state) {
  const spots = new Map();
  for (const [bet, amount] of Object.entries(state.bets)) {
    if (!(amount > 0)) continue;
    const el = betSpot(bet);
    if (!el || el.id === "dice") continue;
    spots.set(el, (spots.get(el) || 0) + amount);
  }
  return spots;
}

function renderStacks(state) {
  const values = chipsFor(state);
  const spots = stackAmounts(state);
  for (const old of document.querySelectorAll(".chip-stack")) {
    if (!spots.has(old.parentElement)) old.remove();
  }
  for (const [el, amount] of spots) {
    let stack = el.querySelector(":scope > .chip-stack");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "chip-stack";
      el.appendChild(stack);
    }
    if (stack.dataset.amount === String(amount)) continue;
    stack.dataset.amount = amount;
    // Style B (owner's pick): chips seen from above, each nudged up and right of the one below.
    // Biggest chip on the bottom (chipsIn lists biggest first); the top chip shows its value.
    const chips = chipsIn(amount, values, 5);
    stack.innerHTML = chips.map((v, i) => '<i style="background:' + chipPaintFor(v, values) + ";left:" + i * 3 + "px;bottom:" + i * 3 + 'px">' +
      (i === chips.length - 1 ? shortMoney(v).replace("$", "") : "") + "</i>").join("");
  }
}

// ---------- Flying chips ----------

let noFly = false; // set while a drag drops a chip (the dragged chip already moved there)

// A chip flies from one spot to another (centres of two elements or rectangles), in an arc.
function flyChip(from, to, paint, opts) {
  if (motionOff() || noFly || !from || !to) return;
  const o = Object.assign({ ms: 380, delay: 0, fade: false, lift: 40 }, opts || {});
  const a = from.getBoundingClientRect ? from.getBoundingClientRect() : from;
  const b = to.getBoundingClientRect ? to.getBoundingClientRect() : to;
  const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
  const x1 = b.left + b.width / 2, y1 = b.top + b.height / 2;
  const chip = document.createElement("div");
  chip.className = "fly-chip";
  chip.style.background = paint;
  chip.style.left = x0 + "px";
  chip.style.top = y0 + "px";
  document.body.appendChild(chip);
  const dx = x1 - x0, dy = y1 - y0;
  const anim = chip.animate([
    { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
    { transform: "translate(calc(-50% + " + dx / 2 + "px), calc(-50% + " + (dy / 2 - o.lift) + "px)) scale(1.15)", opacity: 1, offset: 0.5 },
    { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(0.8)", opacity: o.fade ? 0 : 1 },
  ], { duration: o.ms, delay: o.delay, easing: "cubic-bezier(0.3, 0.7, 0.4, 1)", fill: "backwards" });
  anim.onfinish = () => chip.remove();
  anim.oncancel = () => chip.remove();
}

// The chip tray, or the selected chip in it.
function trayChip(value) {
  return document.querySelector('#chips .chip[data-value="' + value + '"]') || document.getElementById("chips");
}

// You bet: chips fly from the tray to the bet (one per chip, a little apart).
function chipsToBet(state, bet, amount) {
  const values = chipsFor(state);
  chipsIn(amount, values, 4).forEach((v, i) => flyChip(trayChip(v), betSpot(bet), chipPaintFor(v, values), { delay: i * 60 }));
}

// You took chips back: they fly from the bet to the tray.
function chipsToTray(state, bet, amount) {
  const values = chipsFor(state);
  chipsIn(amount, values, 4).forEach((v, i) => flyChip(betSpot(bet), trayChip(v), chipPaintFor(v, values), { delay: i * 60 }));
}

// After a roll: the dealer sweeps losing bets off the table; winnings fly to your Cash.
function settleChips(state, results) {
  if (motionOff()) return;
  const values = chipsFor(state);
  const table = document.querySelector(".table").getBoundingClientRect();
  const dealer = { left: table.left + table.width / 2 - 20, top: table.top - 40, width: 40, height: 20 }; // off the top of the table
  const cash = document.querySelector(".cash-box");
  let n = 0;
  for (const r of results) {
    const spot = betSpot(r.bet);
    if (spot.id === "dice") continue;
    if (r.outcome === "lose") {
      chipsIn(r.amount, values, 3).forEach((v) => flyChip(spot, dealer, chipPaintFor(v, values), { delay: 250 + n++ * 50, ms: 520, fade: true, lift: 10 }));
    } else if (r.outcome === "win" && r.winnings > 0) {
      chipsIn(r.winnings, values, 4).forEach((v) => flyChip(spot, cash, chipPaintFor(v, values), { delay: 350 + n++ * 70, ms: 600, lift: 70 }));
    }
  }
}

// ---------- Money that counts ----------

// Show a money amount; if it changed, count from the old value to the new one (quick: ~0.5s).
function countTo(el, value) {
  const from = el.dataset.value === undefined ? value : Number(el.dataset.value);
  el.dataset.value = value;
  if (el._count) cancelAnimationFrame(el._count);
  if (from === value || motionOff() || !el.offsetParent) {
    el.textContent = money(value);
    return;
  }
  el.classList.toggle("counting-up", value > from);
  el.classList.toggle("counting-down", value < from);
  const start = performance.now(), ms = Math.min(700, 300 + Math.abs(value - from) / 4);
  const step = (now) => {
    const t = Math.min(1, (now - start) / ms);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = money(Math.round(from + (value - from) * eased));
    if (t < 1) el._count = requestAnimationFrame(step);
    else { el.textContent = money(value); el.classList.remove("counting-up", "counting-down"); }
  };
  el._count = requestAnimationFrame(step);
}

// Interest was just paid at a Break: the Interest box (and your Cash) pulse.
function pulseInterest() {
  if (motionOff()) return;
  for (const el of [document.querySelector(".interest-box"), document.getElementById("break-cash-box"), document.getElementById("break-interest")]) {
    if (!el) continue;
    el.classList.remove("pulse");
    void el.offsetWidth; // restart the animation
    el.classList.add("pulse");
  }
}

// ---------- Cards that fire (style C: zip into the mult) ----------

// "Hot Hand: +0.75x" -> { name: "Hot Hand", add: 0.75 } (or times: 2 for "x2" parts).
function parseReason(text) {
  const m = /^(.+?): ([+x])([\d.]+)x?$/.exec(text);
  return m ? { name: m[1], kind: m[2], value: Number(m[3]) } : null;
}
function ownedCardNamed(state, name) {
  return state.cards.find((id) => CARDS[id] && CARDS[id].name === name) || null;
}

let cardPopQueue = [];
let cardPopsCoverMult = false;

// After a roll: which of your cards did something? Mult cards by how much their part grew;
// other cards by the note they left ("Twin Souls: the point came as a pair! x2.").
function queueCardPops(state, multBefore, notes) {
  const before = new Map(multBefore.map(parseReason).filter(Boolean).map((p) => [p.name, p]));
  const pops = [];
  for (const p of multReasons(state).map(parseReason).filter(Boolean)) {
    const id = ownedCardNamed(state, p.name);
    if (!id) continue;
    const old = before.get(p.name);
    if (p.kind === "+" && p.value > (old ? old.value : 0) + 1e-9) pops.push({ id: id, text: "+" + multText(p.value - (old ? old.value : 0)) });
    if (p.kind === "x" && (!old || p.value > old.value + 1e-9)) pops.push({ id: id, text: "x" + bigNumber(p.value) });
  }
  cardPopsCoverMult = pops.length > 0;
  for (const note of notes || []) {
    const name = note.split(":")[0];
    const id = ownedCardNamed(state, name);
    if (!id || pops.some((p) => p.id === id)) continue;
    const amount = /(x[\d.]+|\+\$[\d,.]+[KMB]?|\+[\d.]+x)/.exec(note);
    pops.push({ id: id, text: amount ? amount[1] : "✓" });
  }
  cardPopQueue = pops.slice(0, 4);
  cardPopQueue.forEach((pop, i) => setTimeout(() => cardPop(pop), 450 + i * 520));
}

// Did card pops already account for this mult gain? (Then the plain "+0.5x mult" pop is skipped.)
function cardPopsExplain() {
  const yes = cardPopsCoverMult;
  cardPopsCoverMult = false;
  return yes;
}

function cardPop(pop) {
  const pill = document.querySelector("#mult .mult-pill");
  if (!pill || !pill.offsetParent) return;
  const target = pill.getBoundingClientRect();
  const theme = CARDS[pop.id].theme;
  const label = (theme ? THEMES[theme].icon + " " : "") + CARDS[pop.id].name;
  // The gain floats up off the mult, the card's name underneath it.
  const gain = document.createElement("div");
  gain.className = "card-pop-gain";
  gain.textContent = pop.text;
  gain.style.left = target.left + target.width / 2 + "px";
  gain.style.top = target.top - 22 + "px"; // just above the pill, so the mult number stays readable
  const name = document.createElement("div");
  name.className = "card-pop-name";
  name.textContent = label;
  name.style.left = target.left + target.width / 2 + "px";
  name.style.top = target.bottom + 3 + "px";
  const showText = (delay) => {
    document.body.append(gain, name);
    gain.animate([{ opacity: 0, transform: "translate(-50%, 0)" }, { opacity: 1, transform: "translate(-50%, -8px)", offset: 0.2 }, { opacity: 0, transform: "translate(-50%, -30px)" }],
      { duration: 1200, delay: delay, fill: "both" }).onfinish = () => gain.remove();
    name.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.75 }, { opacity: 0 }],
      { duration: 1300, delay: delay, fill: "both" }).onfinish = () => name.remove();
  };
  if (motionOff()) return showText(0); // Reduce motion: just the words, no zip or bump
  // The card's icon zips from the Inventory tab up into the mult.
  const from = (document.querySelector('.tabbar [data-tab="hand"]') || pill).getBoundingClientRect();
  const icon = document.createElement("div");
  icon.className = "card-pop-icon";
  icon.innerHTML = cardArt(pop.id, "art");
  icon.style.left = from.left + from.width / 2 + "px";
  icon.style.top = from.top + from.height / 2 + "px";
  document.body.appendChild(icon);
  const dx = target.left + target.width / 2 - (from.left + from.width / 2), dy = target.top + target.height / 2 - (from.top + from.height / 2);
  icon.animate([
    { opacity: 0, transform: "translate(-50%, -50%) scale(0.6)" },
    { opacity: 1, transform: "translate(-50%, -50%) scale(1.1)", offset: 0.2 },
    { opacity: 1, transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(0.55)", offset: 0.9 },
    { opacity: 0, transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) scale(0.3)" },
  ], { duration: 560, easing: "cubic-bezier(0.5, 0, 0.6, 1)" }).onfinish = () => {
    icon.remove();
    const strong = pill.querySelector("strong");
    if (strong) strong.animate([{ transform: "scale(1)" }, { transform: "scale(1.45)", offset: 0.35 }, { transform: "scale(1)" }], { duration: 380 });
    playSound("ding");
    showText(0);
  };
}
