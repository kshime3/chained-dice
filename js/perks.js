// The Pit Boss phone: permanent perks for the rest of the run. No screen code here.
// state.perks is a list of perk ids, e.g. ["plus8", "minusSeven", "minusSeven"].

const PERK_TOTALS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

// Name, description and rarity of a perk.
function perkInfo(id) {
  if (id.startsWith("plus")) {
    const total = Number(id.slice(4));
    return {
      name: "+1 way to roll " + total,
      text: total === 7
        ? "Risky: more 7s means more come-out wins, but more seven-outs too. Everyone's dice, for the rest of the run."
        : "Every shooter rolls a " + total + " a little more often (+1 way out of 36), for the rest of the run.",
      rarity: "common",
      risky: total === 7,
    };
  }
  const perks = {
    minusSeven: { name: "-1 way to roll 7", text: "Every shooter rolls 7s a little less often (-1 way out of 36), for the rest of the run. A 7 never drops below " + CONFIG.minSevenWays + " ways.", rarity: "rare" },
    removeCharacter: { name: "Free Trapdoor", text: "Pick a crew member (not you). The dealer opens the trapdoor under their seat, free. They're gone for the rest of the run.", rarity: "uncommon" },
    freeComps: { name: CONFIG.freeCompsPerk + " free comps", text: "The dealer slips you " + CONFIG.freeCompsPerk + " random comps (as many as fit in your slots).", rarity: "uncommon" },
    freeItems: { name: CONFIG.freeItemsCount + " free items", text: "Your next " + CONFIG.freeItemsCount + " cards from the shop are free.", rarity: "uncommon" },
  };
  return perks[id];
}

function countPerk(state, id) {
  return state.perks.filter((p) => p === id).length;
}

// How likely each perk is to be offered right now (0 = never).
function perkWeight(state, id) {
  if (id.startsWith("plus")) return CONFIG.perkWeights.plusTotal / PERK_TOTALS.length;
  if (id === "minusSeven") {
    // Gets rarer every time it's taken; stops once normal dice would be at the floor.
    if (countPerk(state, "minusSeven") >= 6 - CONFIG.minSevenWays) return 0;
    return CONFIG.perkWeights.minusSeven * Math.pow(CONFIG.minusSevenRarer, countPerk(state, "minusSeven"));
  }
  if (id === "removeCharacter") return state.crew.some((n) => n !== "You") ? CONFIG.perkWeights.removeCharacter : 0;
  return CONFIG.perkWeights[id];
}

// The phone rings: pick different perks at random, weighted by rarity.
function phoneOffer(state) {
  const pool = PERK_TOTALS.map((t) => "plus" + t).concat(["minusSeven", "removeCharacter", "freeItems", "freeComps"]);
  const offer = [];
  while (offer.length < CONFIG.phoneChoices) {
    const left = pool.filter((id) => !offer.includes(id) && perkWeight(state, id) > 0);
    if (left.length === 0) break;
    const totalWeight = left.reduce((sum, id) => sum + perkWeight(state, id), 0);
    let pick = Math.random() * totalWeight;
    for (const id of left) {
      pick -= perkWeight(state, id);
      if (pick < 0) { offer.push(id); break; }
    }
    if (pick >= 0) offer.push(left[left.length - 1]); // rounding safety
  }
  return offer;
}

// Take a perk. target: the crew member for "Free Trapdoor".
function takePerk(state, id, target) {
  if (id === "removeCharacter") {
    removeCrew(state, target);
  } else if (id === "freeItems") {
    state.freeBuys += CONFIG.freeItemsCount;
  } else if (id === "freeComps") {
    for (let i = 0; i < CONFIG.freeCompsPerk; i++) gainComp(state, randomComp());
  }
  state.perks.push(id);
}

// "+1 / -1 way to roll a total" from perks, as [[total, ways], ...] for the dice.
function perkTotalWays(state) {
  const ways = {};
  for (const id of state.perks) {
    if (id.startsWith("plus")) ways[Number(id.slice(4))] = (ways[Number(id.slice(4))] || 0) + 1;
    if (id === "minusSeven") ways[7] = (ways[7] || 0) - 1;
  }
  if (state.extraLinks > 0) ways[7] = (ways[7] || 0) - state.extraLinks; // Dealer's Bargain
  return Object.entries(ways).map(([total, n]) => [Number(total), n]);
}
