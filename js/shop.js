// Shop logic (the stickman): stock, prices, buying and selling. No screen code here.

const RARITY_ORDER = ["legendary", "rare", "uncommon", "common"];

// Price of a card: a share of the shift's debt, rounded to the nearest $5.
function cardPrice(state, id) {
  return roundTo5(CONFIG.rarityPricePct[CONFIG.cardRarity[id]] * state.debt * priceX(state));
}

// What you actually pay: free while you have free items from the phone.
function buyPrice(state, id) {
  return state.freeBuys > 0 ? 0 : cardPrice(state, id);
}

function sellPrice(state, id) {
  return Math.floor(cardPrice(state, id) * CONFIG.sellBackShare);
}

function shuffleCost(state) {
  if (state.freeShuffles > 0) return 0;
  return roundTo5((CONFIG.shuffleBasePct + CONFIG.shuffleStepPct * state.shuffles) * state.debt * priceX(state));
}

// Pick a rarity tier using the chances in config.js.
function rollRarity() {
  let roll = Math.random();
  for (const tier of ["common", "uncommon", "rare", "legendary"]) {
    roll -= CONFIG.rarityChance[tier];
    if (roll < 0) return tier;
  }
  return "common";
}

// Fresh stock: random cards you don't own, no repeats.
// If a tier has no cards left, the next tier down is used.
function newStock(state) {
  const stock = [];
  for (let slot = 0; slot < CONFIG.shopSlots; slot++) {
    const pool = Object.keys(CARDS).filter((id) => !state.cards.includes(id) && !stock.includes(id) &&
      !(id === "bargain" && state.endless) && available(state, id) && // no chain to add a link to in endless mode
      (!CARDS[id].crew || state.roster.includes(CARDS[id].crew))); // crew cards need that person at the table
    if (pool.length === 0) {
      stock.push(null);
      continue;
    }
    const start = RARITY_ORDER.indexOf(rollRarity());
    let candidates = [];
    for (let i = start; i < RARITY_ORDER.length && candidates.length === 0; i++) {
      candidates = pool.filter((id) => CONFIG.cardRarity[id] === RARITY_ORDER[i]);
    }
    if (candidates.length === 0) candidates = pool;
    stock.push(candidates[Math.floor(Math.random() * candidates.length)]);
  }
  return stock;
}

// In shift 1 the shop stays closed until the first shooter has had a turn.
// From shift 2 on, it's open from the start.
function isShopOpen(state) {
  return state.shift > 1 || state.shooterIndex >= CONFIG.shopOpensAfterShooter;
}

// Spending in the shop can't take your cash below the minimum Pass Line bet.
function canSpend(state, amount) {
  return state.cash - amount >= tableMin(state);
}

// Buy the card in a stock slot. Returns "ok", "empty", "full" or "money".
function buyCard(state, slot) {
  const id = state.stock[slot];
  if (!id) return "empty";
  if (state.cards.length >= maxCards(state) && !CARDS[id].instant) return "full";
  const price = buyPrice(state, id);
  if (!canSpend(state, price)) return "money";
  if (state.freeBuys > 0) state.freeBuys -= 1;
  state.cash -= price;
  state.stats.spent += price;
  if (CARDS[id].instant) useInstantCard(state, id); // used right away, takes no slot
  else state.cards.push(id);
  if (id === "encore") addEncoreTurn(state); // your extra turn starts this shift
  if (id === "leftysGlove" || id === "ghostStory") refreshNextShooter(state);
  state.stock[slot] = null; // sold out
  return "ok";
}

// Sell a card you own for part of its price.
function sellCard(state, id) {
  if (!state.cards.includes(id)) return 0;
  state.cards = state.cards.filter((c) => c !== id);
  state.cash += sellPrice(state, id);
  return sellPrice(state, id);
}

// Replace the stock. Returns true if it worked.
function shuffleStock(state) {
  const cost = shuffleCost(state);
  if (!canSpend(state, cost)) return false;
  state.cash -= cost;
  state.stats.spent += cost;
  if (state.freeShuffles > 0) state.freeShuffles -= 1;
  else state.shuffles += 1;
  state.stock = newStock(state);
  return true;
}
