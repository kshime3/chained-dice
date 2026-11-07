// Display: "juice", the feel of the game (release 1.0.5). No game rules here.
// J2: chip stacks on every bet, and chips that fly: tray -> bet when you bet, bet -> tray when you
//     take chips back, losing bets swept off toward the dealer, winnings flying to your Cash.
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
    stack.innerHTML = chipsIn(amount, values, 6).reverse()
      .map((v, i) => '<i style="background:' + chipPaintFor(v, values) + ";bottom:" + i * 3 + 'px"></i>').join("");
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
