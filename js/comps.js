// Comps: one-use items you hold (2 slots) and spend when you choose. No screen code here.
// "when": "roll" = arm it for the next roll; "now" = works at once; "break" = only at a Dealer Break.

const COMPS = {
  noSevens:    { name: "No Sevens",    when: "roll",  text: "Your next roll can't be a 7." },
  doubleDown:  { name: "Double Down",  when: "roll",  text: "Your next winning roll pays double." },
  luckyPair:   { name: "Lucky Pair",   when: "roll",  text: "Your next roll is a pair." },
  loadedShot:  { name: "Loaded Shot",  when: "roll",  text: "Pick the left die's face for your next roll." },
  insurance:   { name: "Insurance",    when: "roll",  text: "If your next roll loses your line bet, you get it back." },
  hotSeat:     { name: "Hot Seat",     when: "now",   text: "+1x mult for the rest of this shooter's turn." },
  seatSwap:    { name: "Seat Swap",    when: "break", text: "Swap the next two shooters." },
  cashAdvance: { name: "Cash Advance", when: "break", text: "The dealer lends you 25% of the debt right now, but your debt grows by 1.5x what he lent." },
  nudge:       { name: "Nudge",        when: "break", edit: true, text: "Dice edit: move one face on your dice up or down by 1 (6 wraps to 1, 1 wraps to 6)." },
  copycat:     { name: "Copycat",      when: "break", edit: true, text: "Dice edit: copy one face of your die over another face on the same die." },
  chisel:      { name: "Chisel",       when: "break", edit: true, text: "Dice edit: carve one face on your dice into any number from 1 to 6." },
};

function compPrice(state, id) {
  return roundTo5(CONFIG.compPricePct[id] * state.debt * priceX(state));
}

function compSellPrice(state, id) {
  return Math.floor(compPrice(state, id) * CONFIG.sellBackShare);
}

// Fresh comps for sale: different ones at random (dice edits Copycat and Chisel are rarer).
function newCompStock() {
  const stock = [];
  while (stock.length < CONFIG.compShopSlots) {
    const left = Object.keys(COMPS).filter((id) => !stock.includes(id));
    if (left.length === 0) break;
    const weight = (id) => (CONFIG.compWeights[id] === undefined ? 1 : CONFIG.compWeights[id]);
    let pick = Math.random() * left.reduce((sum, id) => sum + weight(id), 0);
    stock.push(left.find((id) => (pick -= weight(id)) < 0) || left[left.length - 1]);
  }
  return stock;
}

// Add a comp to your slots. Returns false if they're full.
function gainComp(state, id) {
  if (state.comps.length >= CONFIG.compSlots) return false;
  state.comps.push(id);
  return true;
}

function randomComp() {
  const ids = Object.keys(COMPS);
  return ids[Math.floor(Math.random() * ids.length)];
}

// Buy the comp in a shop slot. Returns "ok", "empty", "full" or "money".
function buyComp(state, slot) {
  const id = state.compStock[slot];
  if (!id) return "empty";
  if (state.comps.length >= CONFIG.compSlots) return "full";
  const price = compPrice(state, id);
  if (!canSpend(state, price)) return "money";
  state.kitty -= price;
  state.stats.spent += price;
  state.comps.push(id);
  state.compStock[slot] = null;
  return "ok";
}

function sellComp(state, index) {
  const id = state.comps[index];
  if (!id) return 0;
  state.comps.splice(index, 1);
  const got = compSellPrice(state, id);
  state.kitty += got;
  return got;
}

// Can this comp be used right now? Returns "" if yes, or the reason it can't.
function compBlocked(state, id) {
  const when = COMPS[id].when;
  if (when === "break" && !state.onBreak) return "Only at a Dealer Break.";
  if (when !== "break" && state.onBreak) return "Use it once the shooter steps up.";
  if (when === "roll" && state.armed[id]) return "Already armed for the next roll.";
  if (id === "seatSwap" && state.shooterIndex + 1 >= state.crew.length) return "There aren't two shooters left to swap.";
  if (id === "cashAdvance" && !canPay(state)) return "The dealer won't lend until the first shooter has rolled.";
  if (COMPS[id].edit && !state.roster.includes("You")) return "You're not at the table.";
  return "";
}

// Use the comp in slot `index`. face: the chosen face for Loaded Shot, or for a dice edit
// { die: "left" | "right", index: 0-5, value: 1-6 }.
// Returns a sentence for the message, or null if it can't be used.
function useComp(state, index, face) {
  const id = state.comps[index];
  if (!id || compBlocked(state, id)) return null;
  const c = COMPS[id];
  if (c.edit) {
    const before = state.myDice[face.die][face.index];
    if (editFace(state, face.die, face.index, face.value) !== "ok") return null;
    state.comps.splice(index, 1);
    return c.name + ": your " + face.die + " die's " + before + " is now a " + face.value + ".";
  }
  state.comps.splice(index, 1);
  if (c.when === "roll") {
    state.armed[id] = id === "loadedShot" ? face : true;
    return c.name + " is armed for your next roll.";
  }
  if (id === "hotSeat") {
    state.mult += CONFIG.hotSeatMult;
    setMultNote(state, "Hot Seat", "Hot Seat: +" + CONFIG.hotSeatMult + "x");
    return "Hot Seat: +" + CONFIG.hotSeatMult + "x mult for this shooter.";
  }
  if (id === "seatSwap") {
    const i = state.shooterIndex;
    [state.crew[i], state.crew[i + 1]] = [state.crew[i + 1], state.crew[i]];
    setupTurn(state, state.crew[i - 1] || null, state.prevShooterMult);
    return "Seat Swap: " + state.crew[i] + " shoots next, then " + state.crew[i + 1] + ".";
  }
  if (id === "cashAdvance") {
    const lent = roundTo5(CONFIG.cashAdvancePct * state.debt);
    const added = roundTo5(lent * CONFIG.cashAdvanceCost);
    state.kitty += lent;
    state.debt += added;
    return "Cash Advance: +$" + lent + " now. Your debt grows by $" + added + ".";
  }
  return null;
}

// Does the next roll have to be a pair? (Doubles Charm or Lucky Pair)
function nextRollPairs(state) {
  return pairDue(state) || !!state.armed.luckyPair;
}

// Armed comps that change the dice for the next roll.
function applyArmedDice(state, set) {
  if (state.armed.noSevens) set.noSeven = true;
  if (state.armed.loadedShot) set.left = [state.armed.loadedShot];
  return set;
}

// After a roll is settled: Insurance refunds a lost line bet; armed comps are used up.
// Double Down stays armed until a roll actually wins. Returns sentences for the message.
function finishArmed(state, results) {
  const notes = [];
  if (state.armed.insurance) {
    const lost = results.filter((r) => r.outcome === "lose" && (r.bet === "pass" || r.bet === "dont"))
      .reduce((sum, r) => sum + r.amount, 0);
    if (lost > 0) {
      state.kitty += lost;
      notes.push("Insurance pays back your $" + lost + " line bet.");
    }
  }
  const won = results.some((r) => r.outcome === "win");
  for (const id of ["noSevens", "luckyPair", "loadedShot", "insurance"]) delete state.armed[id];
  if (won) delete state.armed.doubleDown;
  return notes;
}
