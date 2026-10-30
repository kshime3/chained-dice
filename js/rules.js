// House rules (one per shift from shift 3, a boss rule on the last chain shift)
// and pit boss challenges (on your own turn). No screen code here.

const HOUSE_RULES = {
  tightOdds:       { name: "Tight Odds",       text: "Odds and Lay Odds are limited to 2x your line bet." },
  highStakes:      { name: "High Stakes",      text: "The table minimum is doubled." },
  skimmedInterest: { name: "Skimmed Interest", text: "Interest is halved." },
  markup:          { name: "Markup",           text: "Shop prices are 50% higher (cards, comps, Shuffle, Hire)." },
  pitWatch:        { name: "Pit Watch",        text: "One of your cards is switched off this shift." },
  houseDie:        { name: "House Die",        text: "Every shooter's left die is set to the same number this shift." },
  darkSideOnly:    { name: "Dark Side Only",   text: "No Pass Line this shift: only Don't Pass and Lay Odds." },
  // Boss rules: the last shift of the chain
  noFreeLunch:     { name: "No Free Lunch",    boss: true, text: "Each shooter's first point pays nothing (your bets come back)." },
  coldDice:        { name: "Cold Dice",        boss: true, text: "All mult is capped at 1x." },
  sevenHeaven:     { name: "Seven Heaven",     boss: true, text: "A 7 on the come-out doesn't pay the Pass Line (it's a tie)." },
};

function rule(state, id) {
  return !!state.houseRule && state.houseRule.id === id;
}

function pickFrom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

// Pick the house rule for a new shift (or none). forcedId is a testing shortcut.
function pickHouseRule(state, forcedId) {
  const normal = Object.keys(HOUSE_RULES).filter((id) => !HOUSE_RULES[id].boss && (id !== "pitWatch" || state.cards.length > 0));
  const boss = Object.keys(HOUSE_RULES).filter((id) => HOUSE_RULES[id].boss);
  let id = null;
  if (!systemOn(state, "houseRules") && !forcedId) return null; // not yet: arrives after you first reach shift 3
  if (state.endless) id = pickFrom(normal.concat(boss));
  else if (state.shift === totalLinks(state)) id = pickFrom(boss);
  else if (state.shift >= CONFIG.houseRulesFromShift) id = pickFrom(normal);
  if (HOUSE_RULES[forcedId] && (forcedId !== "pitWatch" || state.cards.length > 0)) id = forcedId;
  if (!id) return null;
  const picked = { id: id };
  if (id === "houseDie") picked.x = 1 + Math.floor(Math.random() * 6);
  if (id === "pitWatch") picked.disabled = pickFrom(state.cards);
  return picked;
}

// House Die: fix the left die, unless that would leave the shooter no way to roll 7
// (or no possible roll at all, e.g. a guaranteed pair the right die can't match).
function applyHouseDie(state, set) {
  if (!rule(state, "houseDie") || state.armed.loadedShot) return set;
  const fixed = Object.assign({}, set, { left: [state.houseRule.x] });
  const canSeven = comboList(fixed).some((c) => c.a + c.b === 7);
  const canRoll = usableCombos(fixed, nextRollPairs(state)).length > 0;
  return canSeven && canRoll ? fixed : set;
}

// ---------- Pit boss challenges (your own turn) ----------

const CHALLENGES = {
  hitPoint:   { text: "Hit the point", target: 1 },
  twoPoints:  { text: "Make 2 points", target: 2 },
  hardPoint:  { text: "Hit a point of 4 or 10", target: 1 },
  fieldWins:  { text: "Win the Field 3 times", target: 3 },
  doubles:    { text: "Roll 3 doubles", target: 3 },
  longHaul:   { text: "Survive 6 rolls without a seven-out", target: 6 },
  dontWin:    { text: "Win a Don't Pass bet", target: 1 },
  bigMult:    { text: "Win a bet at 3x mult or more", target: 1 },
};
const REWARDS = ["cash", "comp", "debtCut", "shuffle"];

// A new challenge for your turn (from CONFIG.challengesFromShift).
function newChallenge(state) {
  if (state.shift < CONFIG.challengesFromShift || !systemOn(state, "challenges")) return null;
  return { id: pickFrom(Object.keys(CHALLENGES)), progress: 0, done: false, reward: pickFrom(REWARDS) };
}

function rewardText(state, reward) {
  if (reward === "cash") return "$" + roundTo5(CONFIG.challengeCashPct * state.debt) + " cash";
  if (reward === "debtCut") return "$" + roundTo5(CONFIG.challengeDebtCutPct * state.debt) + " off the debt";
  if (reward === "comp") return "a free comp";
  return "a free Shuffle";
}

// Update the challenge after a roll on your turn. Returns a sentence when it's completed.
// info: { pointHit, total, doubles, sevenOut, multUsed }
function trackChallenge(state, results, info) {
  const c = state.challenge;
  if (!c || c.done) return null;
  const won = (bet) => results.some((r) => r.bet === bet && r.outcome === "win");
  const step = {
    hitPoint: info.pointHit ? 1 : 0,
    twoPoints: info.pointHit ? 1 : 0,
    hardPoint: info.pointHit && (info.total === 4 || info.total === 10) ? 1 : 0,
    fieldWins: won("field") ? 1 : 0,
    doubles: info.doubles ? 1 : 0,
    longHaul: info.sevenOut ? 0 : 1,
    dontWin: won("dont") ? 1 : 0,
    bigMult: info.multUsed >= 3 && results.some((r) => r.outcome === "win") ? 1 : 0,
  }[c.id];
  c.progress = Math.min(CHALLENGES[c.id].target, c.progress + step);
  if (c.progress < CHALLENGES[c.id].target) return null;
  c.done = true;
  // Pay the reward.
  const what = rewardText(state, c.reward);
  if (c.reward === "cash") state.cash += roundTo5(CONFIG.challengeCashPct * state.debt);
  if (c.reward === "debtCut") state.debt = Math.max(state.deposited, state.debt - roundTo5(CONFIG.challengeDebtCutPct * state.debt));
  if (c.reward === "comp" && !gainComp(state, randomComp(state))) return "Challenge complete! (Your comp slots were full, so the pit boss kept the comp.)";
  if (c.reward === "shuffle") state.freeShuffles += 1;
  return "Challenge complete! The pit boss hands you " + what + ".";
}
