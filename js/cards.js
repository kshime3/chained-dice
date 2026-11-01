// Card logic: what each shop card does. No screen code here.
// Card numbers and rarity live in config.js.

const CARDS = {
  hotHand:     { name: "Hot Hand", theme: "streak",        text: "+" + CONFIG.hotHandPerWin + "x mult for every winning roll in a row. Resets when a roll loses you a bet without winning one." },
  snakeEyes:   { name: "Snake Eyes", theme: "pairs",      text: "Rolling a 2 pays a bonus of " + Math.round(CONFIG.snakeEyesBonusPct * 100) + "% of the debt." },
  luckySeven:  { name: "Lucky Seven",     text: "A 7 on the come-out pays a bonus of " + Math.round(CONFIG.luckySevenBonusPct * 100) + "% of the debt." },
  rattlesnake: { name: "Rattlesnake", theme: "pairs",     text: "Rolling snake eyes (1+1) adds +" + CONFIG.rattlesnakeMult + "x mult for the rest of this shooter's turn." },
  redDice:     { name: "Red Dice",        text: "Craps (2, 3, 12) on the come-out wins the Pass Line at even money instead of losing." },
  oddsAddict:  { name: "Odds Addict",     text: "Odds bets pay " + Math.round(CONFIG.oddsAddictExtra * 100) + "% extra." },
  pity:        { name: "Pit Boss's Pity", text: "The first seven-out of the shift (any shooter) is ignored. Your bets stay (except the Field), and the shooter keeps rolling." },
  muggsy:      { name: "Muggsy",          text: "A 7 right after the point is set costs your Pass Line twice. But the next shooter's winnings are x" + CONFIG.muggsyNextShooterX + " for their whole turn." },
  doubleUp:    { name: "Double Up", theme: "pairs",       text: "Doubles come up more: +1 way (out of 36) for each double, on everyone's dice. Fewer 7s, too." },
  doublesCharm:{ name: "Doubles Charm", theme: "pairs",   text: "Every 3rd roll of each shooter's turn is guaranteed to be a pair. Pairs can never make 7." },
  greenDice:   { name: "Green Dice", theme: "money",      text: "Every 12 rolled raises your interest rate by " + Math.round(CONFIG.greenDiceInterestStep * 100) + "% for the rest of the run." },
  loadedDie:   { name: "Loaded Die",      text: "Once per shooter, when a roll would cost you, reroll one die of your choice." },
  reroll:      { name: "Reroll",          text: "Once per shooter, when a roll would cost you, reroll both dice." },
  wrongWay:    { name: "Wrong Way", theme: "dark",       text: "Bet against the shooter and get paid for it: Don't Pass winnings +" + Math.round(CONFIG.wrongWayExtra * 100) + "%." },
  coldRead:    { name: "Cold Read", theme: "dark",       text: "When your Don't Pass wins on a seven-out, the next shooter starts at +1x mult." },
  bargain:     { name: "Dealer's Bargain", instant: true, text: "One use, works right away, takes no slot. The dealer adds a link to your chain (one more shift to walk free). In return, everyone's dice get -1 way to roll 7 for the rest of the run." },
  // Crew cards: only offered while that crew member is at the table.
  leftysGlove: { name: "Lefty's Glove", theme: "crew",  crew: "Lefty", text: "Lefty gets his 6 back on his right die, and +" + CONFIG.leftysGloveMult + "x mult on his turn." },
  deesLedger:  { name: "Dee's Ledger", theme: "crew",   crew: "Dealer Dee", text: "On Dealer Dee's turn, Odds and Lay Odds pay " + Math.round(CONFIG.deesLedgerExtra * 100) + "% extra." },
  rodsLighter: { name: "Rod's Lighter", theme: "crew",  crew: "Hot Rod", text: "Hot Rod's streak grows +1.5x per winning roll, and his seven-out no longer costs double." },
  jinxShadow:  { name: "Jinx's Shadow", theme: "dark",  crew: "Jinx", text: "When Jinx shoots, Don't Pass winnings are x" + CONFIG.jinxShadowX + "." },
  ghostStory:  { name: "Ghost Story", theme: "crew",    crew: "Ghost", text: "You choose whether Ghost's right die is evens-only or odds-only (at the Break before his turn), and +" + CONFIG.ghostStoryMult + "x mult on his turn." },
  // "You" cards: only offered while you're at the table.
  encore:      { name: "Encore",         crew: "You", text: "Every shift, after the last shooter, you take an extra turn before the final Dealer Break." },
  highRoller:  { name: "High Roller",    crew: "You", text: "Your winnings are x" + CONFIG.highRollerX + " on your own turn." },
  frontOfLine: { name: "Front of the Line", crew: "You", text: "You shoot first every shift (from the next shift), and +" + CONFIG.frontOfLineMult + "x mult on your turn." },
  sleightOfHand: { name: "Sleight of Hand", crew: "You", text: "The shooter right after you rolls YOUR dice, crafted faces and all." },
  // Added 2026-10-30
  comebackKid: { name: "Comeback Kid", theme: "streak", text: "After any seven-out, the next shooter's first point pays x" + CONFIG.comebackKidX + "." },
  pointCollector: { name: "Point Collector", theme: "streak", text: "+" + CONFIG.pointCollectorMult + "x mult for each different point the shooter has made this turn." },
  loanShark:   { name: "Loan Shark", theme: "money", text: "The dealer's cut drops: you keep " + Math.round(CONFIG.loanSharkCarry * 100) + "% of your leftover money into the next shift." },
  hardwayHustler: { name: "Hardway Hustler", theme: "pairs", needs: "hardWays", text: "Hard Ways pay x" + CONFIG.hardwayHustlerX + ", and any hard pair (2+2, 3+3, 4+4, 5+5) adds +" + CONFIG.hardwayHustlerMult + "x mult for the turn." },
  steadyHand:  { name: "Steady Hand", needs: "placeBets", text: "Place bets on 6 and 8 pay " + Math.round(CONFIG.steadyHandExtra * 100) + "% extra." },
  diceCollector: { name: "Dice Collector", crew: "You", text: "+" + CONFIG.diceCollectorMult + "x mult on your turn for every face you've edited on your dice." },
  // Themed cards (2026-10-31): each theme has one card that grows with every card of that theme you own.
  graveyardShift: { name: "Graveyard Shift", theme: "dark", text: "Lay Odds pay +" + Math.round(CONFIG.graveyardShiftPerCard * 100) + "% for every Dark side card you own (this one too)." },
  badOmen:     { name: "Bad Omen", theme: "dark", text: "An 11 on the come-out no longer beats your Don't Pass: it's a tie." },
  undertaker:  { name: "Undertaker", theme: "dark", text: "Every seven-out your Don't Pass wins pays a bonus of " + Math.round(CONFIG.undertakerBonusPct * 100) + "% of the debt." },
  mirrorDice:  { name: "Mirror Dice", theme: "pairs", text: "Every pair rolled adds +" + CONFIG.mirrorDicePerCard + "x mult for the turn, for every Pairs card you own (this one too)." },
  boxcars:     { name: "Boxcars", theme: "pairs", text: "Rolling a 12 (6+6) pays a bonus of " + Math.round(CONFIG.boxcarsBonusPct * 100) + "% of the debt." },
  twinSouls:   { name: "Twin Souls", theme: "pairs", text: "Making the point with a pair (like 4+4 for an 8) pays x" + CONFIG.twinSoulsX + "." },
  heater:      { name: "Heater", theme: "streak", text: "Each point the shooter makes adds +" + CONFIG.heaterPerCard + "x mult for the rest of the turn, for every Hot streak card you own (this one too)." },
  longNight:   { name: "Long Night", theme: "streak", text: "+" + CONFIG.longNightMult + "x mult for every " + CONFIG.longNightEvery + " rolls the shooter lasts." },
  torchPass:   { name: "Torch Pass", theme: "streak", text: "When a shooter sevens out, the next one starts with " + (CONFIG.torchPassShare === 0.5 ? "half" : Math.round(CONFIG.torchPassShare * 100) + "%") + " of their extra mult." },
  compound:    { name: "Compound", theme: "money", text: "Your interest rate is +" + Math.round(CONFIG.compoundPerCard * 100) + "% for every Money card you own (this one too)." },
  stash:       { name: "Stash", theme: "money", text: "At each Dealer Break, the cash in your hand earns " + Math.round(CONFIG.stashRate * 100) + "% interest too." },
  earlyBird:   { name: "Early Bird", theme: "money", text: "Pay off the shift's debt before the last shooter and get " + Math.round(CONFIG.earlyBirdPct * 100) + "% of the debt back as cash." },
  // Crew theme (2026-11-01). Cards with "crew" are only offered while that person is at the table.
  snakeFangs:  { name: "Snake's Fangs", theme: "crew", crew: "Snake", text: "Whenever Snake rolls craps (2, 3 or 12), you get a bonus of " + Math.round(CONFIG.snakeFangsBonusPct * 100) + "% of the debt." },
  bigMoBelt:   { name: "Big Mo's Belt", theme: "crew", crew: "Big Mo", text: "On Big Mo's turn, Field wins pay x" + CONFIG.bigMoBeltFieldX + ", and +" + CONFIG.bigMoBeltMult + "x mult." },
  lousHorseshoe: { name: "Lou's Horseshoe", theme: "crew", crew: "Lucky Lou", text: "Lucky Lou gains +" + CONFIG.lousHorseshoeMult + "x mult for every point he makes (instead of +" + CONFIG.luckyLouMult + "x)." },
  professorsNotes: { name: "Professor's Notes", theme: "crew", crew: "The Professor", text: "On The Professor's turn, Odds and Lay Odds can be x" + CONFIG.professorsNotesOddsX + " bigger (instead of x" + CONFIG.professorOddsX + ") and pay " + Math.round(CONFIG.professorsNotesExtra * 100) + "% extra." },
  jinxJar:     { name: "Jinx Jar", theme: "crew", crew: "Jinx", text: "Every time Jinx sevens out, you get " + Math.round(CONFIG.jinxJarBonusPct * 100) + "% of the debt." },
  rollCall:    { name: "Roll Call", theme: "crew", text: "Every shooter starts at +" + CONFIG.rollCallPerCard + "x mult for every Crew card you own (this one too)." },
  crewCaptain: { name: "Crew Captain", theme: "crew", text: "+" + CONFIG.crewCaptainPerSeat + "x mult for every person at the table beyond 3." },
  recruiter:   { name: "Recruiter", theme: "crew", text: "Hiring crew costs " + (CONFIG.recruiterPriceX === 0.5 ? "half" : Math.round(CONFIG.recruiterPriceX * 100) + "%") + "." },
  // Endless-only (2026-11-01): x-mult cards, offered only after Double or nothing. They multiply the mult.
  snowball:    { name: "Snowball", theme: "endless", endless: true, text: "Endless only. Mult x" + CONFIG.snowballX + "." },
  sweetSpot:   { name: "Sweet Spot", theme: "endless", endless: true, text: "Endless only. Mult x" + CONFIG.sweetSpotX + " while the point is 6 or 8." },
  avalanche:   { name: "Avalanche", theme: "endless", endless: true, text: "Endless only. Every point the shooter makes multiplies the mult by another x" + CONFIG.avalancheX + " for the rest of the turn." },
  deepPockets: { name: "Deep Pockets", theme: "endless", endless: true, text: "Endless only. Mult x" + CONFIG.deepPocketsX + " for every endless shift you've survived (it compounds)." },
  fullHouse:   { name: "Full House", theme: "endless", endless: true, text: "Endless only. Mult x" + CONFIG.fullHousePerCard + " for every card you hold (5 cards = x" + 5 * CONFIG.fullHousePerCard + ")." },
  chainLink:   { name: "Spare Link",      text: "When the floor opens, this link catches you: the shift counts as survived, a link breaks as normal, and the rest of the debt is forgiven. Used up." },
};

// Card themes: cards of a theme work together, and some grow with every one you own.
const THEMES = {
  dark:   { name: "Dark side", icon: "🌑" },
  pairs:  { name: "Pairs", icon: "🎲" },
  streak: { name: "Hot streak", icon: "🔥" },
  money:  { name: "Money", icon: "💰" },
  crew:   { name: "Crew", icon: "🤝" },
  endless: { name: "Endless", icon: "♾️" },
};

// A card's theme label, e.g. "🌑 Dark side" ("" if it has none).
function themeLabel(id) {
  const t = CARDS[id] && THEMES[CARDS[id].theme];
  return t ? t.icon + " " + t.name : "";
}

// How many cards of this theme you own (switched-off cards don't count).
function themeCount(state, theme) {
  return state.cards.filter((id) => CARDS[id] && CARDS[id].theme === theme && hasCard(state, id)).length;
}

// Pit Watch (a house rule) switches one of your cards off for the shift.
function hasCard(state, id) {
  return state.cards.includes(id) && !(state.houseRule && state.houseRule.disabled === id);
}

// Round to the nearest $5, never below $5.
function roundTo5(n) {
  return Math.max(5, Math.round(n / 5) * 5);
}

// The mult actually used for payouts: shooter mult + Hot Hand, times Muggsy's x2
// (and High Roller's x2 on your own turn).
function effectiveMult(state) {
  const hotHand = hasCard(state, "hotHand") ? state.hotStreak * CONFIG.hotHandPerWin : 0;
  const highRoller = hasCard(state, "highRoller") && state.crew[state.shooterIndex] === "You" ? CONFIG.highRollerX : 1;
  const collector = hasCard(state, "pointCollector") ? (state.firePoints || []).length * CONFIG.pointCollectorMult : 0;
  const crafted = hasCard(state, "diceCollector") && state.crew[state.shooterIndex] === "You" ? editedFaces(state) * CONFIG.diceCollectorMult : 0;
  const mult = (state.mult + hotHand + collector + crafted + themedMult(state)) * state.payoutX * highRoller * xMult(state);
  return rule(state, "coldDice") ? Math.min(1, mult) : mult; // boss rule: mult capped at 1x
}

// Mult from the themed cards that build up during a turn: [card, amount] pairs.
function themedMultParts(state) {
  const parts = [];
  if (hasCard(state, "mirrorDice") && state.turnDoubles > 0) parts.push(["Mirror Dice", state.turnDoubles * CONFIG.mirrorDicePerCard * themeCount(state, "pairs")]);
  if (hasCard(state, "heater") && state.turnPointsMade > 0) parts.push(["Heater", state.turnPointsMade * CONFIG.heaterPerCard * themeCount(state, "streak")]);
  if (hasCard(state, "crewCaptain") && state.roster.length > 3) parts.push(["Crew Captain", (state.roster.length - 3) * CONFIG.crewCaptainPerSeat]);
  const nights = Math.floor(state.turnRolls / CONFIG.longNightEvery);
  if (hasCard(state, "longNight") && nights > 0) parts.push(["Long Night", nights * CONFIG.longNightMult]);
  return parts;
}

function themedMult(state) {
  return themedMultParts(state).reduce((sum, p) => sum + p[1], 0);
}

// Endless shifts survived so far (0 during the first endless shift).
function endlessShiftsSurvived(state) {
  return state.endless ? Math.max(0, state.shift - totalLinks(state) - 1) : 0;
}

// The endless-only x-mult cards: [card, factor] pairs (factors of 1 are left out).
function xMultParts(state) {
  const parts = [];
  if (hasCard(state, "snowball")) parts.push(["Snowball", CONFIG.snowballX]);
  if (hasCard(state, "sweetSpot") && (state.point === 6 || state.point === 8)) parts.push(["Sweet Spot", CONFIG.sweetSpotX]);
  if (hasCard(state, "avalanche") && state.turnPointsMade > 0) parts.push(["Avalanche", Math.pow(CONFIG.avalancheX, state.turnPointsMade)]);
  if (hasCard(state, "deepPockets") && endlessShiftsSurvived(state) > 0) parts.push(["Deep Pockets", Math.pow(CONFIG.deepPocketsX, endlessShiftsSurvived(state))]);
  if (hasCard(state, "fullHouse")) parts.push(["Full House", Math.max(1, CONFIG.fullHousePerCard * state.cards.length)]);
  return parts.filter((p) => p[1] !== 1);
}

function xMult(state) {
  return xMultParts(state).reduce((product, p) => product * p[1], 1);
}

// One-use cards that work the moment you buy them.
function useInstantCard(state, id) {
  if (id === "bargain") state.extraLinks += 1; // its -1 way to roll 7 comes from perkTotalWays
}

// The dice the current shooter really rolls: their own dice plus card effects.
function currentDice(state) {
  const set = Object.assign({}, state.dice);
  set.extraWays = [];
  if (hasCard(state, "doubleUp")) {
    for (let face = 1; face <= 6; face++) set.extraWays.push([face, face, CONFIG.doubleUpWays]);
  }
  set.totalWays = perkTotalWays(state);
  return applyHouseDie(state, applyArmedDice(state, set)); // armed comps, then the House Die rule
}

// Doubles Charm: is the next roll a guaranteed pair?
function pairDue(state) {
  return hasCard(state, "doublesCharm") && (state.turnRolls + 1) % CONFIG.doublesCharmEvery === 0;
}

// Would this roll cost you money? Counts Red Dice and an unused Pit Boss's Pity,
// since those would save the bet anyway. Returns the bets that would lose.
function costlyBets(state, total, dice) {
  const pointOn = state.point !== null;
  return resolveRoll(state.bets, total, state.point, { dice: dice, firePoints: state.firePoints }).filter((r) => {
    if (r.outcome !== "lose") return false;
    if (r.bet === "pass" && !pointOn && hasCard(state, "redDice")) return false;
    if (r.bet === "dont" && !pointOn && total === 11 && hasCard(state, "badOmen")) return false;
    if (r.bet === "dont" && !pointOn && total === CONFIG.sevenOut && CONFIG.jinxCurse && state.crew[state.shooterIndex] === "Jinx") return false;
    if (pointOn && total === CONFIG.sevenOut && hasCard(state, "pity") && !state.pityUsed && state.bets.pass > 0 && !["field", "come", "dontCome"].includes(r.bet)) return false;
    return true;
  });
}

// Which rerolls you can use right now: { oneDie: Loaded Die, bothDice: Reroll }.
function rerollOptions(state) {
  return {
    oneDie: hasCard(state, "loadedDie") && !state.loadedDieUsed,
    bothDice: hasCard(state, "reroll") && !state.rerollUsed,
  };
}

// Why the mult is what it is, e.g. ["Mentor: +1x from Hot Rod's streak", "Hot Hand: +1x"].
function multReasons(state) {
  const reasons = state.multNotes.slice();
  if (hasCard(state, "highRoller") && state.crew[state.shooterIndex] === "You") reasons.push("High Roller: x" + CONFIG.highRollerX);
  if (hasCard(state, "hotHand") && state.hotStreak > 0) {
    reasons.push("Hot Hand: +" + state.hotStreak * CONFIG.hotHandPerWin + "x");
  }
  if (hasCard(state, "pointCollector") && (state.firePoints || []).length > 0) {
    reasons.push("Point Collector: +" + state.firePoints.length * CONFIG.pointCollectorMult + "x");
  }
  if (hasCard(state, "diceCollector") && state.crew[state.shooterIndex] === "You" && editedFaces(state) > 0) {
    reasons.push("Dice Collector: +" + editedFaces(state) * CONFIG.diceCollectorMult + "x");
  }
  for (const [name, amount] of themedMultParts(state)) reasons.push(name + ": +" + Math.round(amount * 100) / 100 + "x");
  for (const [name, factor] of xMultParts(state)) reasons.push(name + ": x" + Math.round(factor * 100) / 100);
  return reasons;
}

// Charge losing bets again (times - 1 more), never below the $5 minimum.
// bets: which losing bets count. Used by Hot Rod (Pass Line and Odds) and
// Muggsy (Pass Line only). Returns the amount charged.
function chargeExtra(state, results, times, bets = ["pass", "odds"]) {
  const lost = results.filter((r) => r.outcome === "lose" && bets.includes(r.bet))
    .reduce((sum, r) => sum + r.amount, 0);
  const extra = Math.min(lost * (times - 1), Math.max(0, state.cash - tableMin(state)));
  state.cash -= extra;
  return extra;
}

// Cards that change results before anyone is paid.
// Returns { notes, pity } where pity means the seven-out was ignored.
function applyCardsBeforePayout(state, results, total, pointBefore) {
  const notes = [];
  let pity = false;

  // Red Dice: come-out craps wins instead of losing.
  if (hasCard(state, "redDice") && pointBefore === null && CONFIG.comeOutLosers.includes(total)) {
    for (const r of results) {
      if (r.bet === "pass" && r.outcome === "lose") {
        r.outcome = "win";
        r.winnings = r.amount * CONFIG.passLinePayout;
        notes.push("Red Dice: craps pays!");
      }
    }
  }

  // Pit Boss's Pity: the first seven-out of the shift doesn't count.
  if (hasCard(state, "pity") && !state.pityUsed && pointBefore !== null && total === CONFIG.sevenOut && state.bets.pass > 0) {
    state.pityUsed = true;
    pity = true;
    for (const r of results) {
      // Every bet that this 7 would beat stays up (not the one-roll Field, Come and Don't Come).
      if (r.outcome === "lose" && !["field", "come", "dontCome"].includes(r.bet)) r.outcome = "none";
    }
    notes.push("Pit Boss's Pity: that seven-out is ignored! Your bets stay and the shooter keeps rolling.");
  }

  // Bad Omen: a come-out 11 is a tie for Don't Pass.
  if (hasCard(state, "badOmen") && pointBefore === null && total === 11) {
    for (const r of results) {
      if (r.bet === "dont" && r.outcome === "lose") {
        r.outcome = "none";
        notes.push("Bad Omen: the 11 doesn't count against your Don't Pass.");
      }
    }
  }

  // Twin Souls: making the point with a pair pays double.
  const pair = state.lastRoll && state.lastRoll.dice[0] === state.lastRoll.dice[1];
  if (hasCard(state, "twinSouls") && pair && pointBefore !== null && total === pointBefore) {
    for (const r of results) if (r.outcome === "win") r.winnings *= CONFIG.twinSoulsX;
    notes.push("Twin Souls: the point came as a pair! x" + CONFIG.twinSoulsX + ".");
  }

  // Graveyard Shift: Lay Odds pay more for every Dark side card.
  if (hasCard(state, "graveyardShift")) {
    const extra = CONFIG.graveyardShiftPerCard * themeCount(state, "dark");
    for (const r of results) if (r.bet === "lay" && r.outcome === "win") r.winnings = Math.floor(r.winnings * (1 + extra));
  }

  // Crew cards that change payouts on a crew member's turn.
  const shooter = state.crew[state.shooterIndex];
  for (const r of results) {
    if (r.outcome !== "win") continue;
    if (shooter === "Dealer Dee" && hasCard(state, "deesLedger") && (r.bet === "odds" || r.bet === "lay")) {
      r.winnings = Math.floor(r.winnings * (1 + CONFIG.deesLedgerExtra));
    }
    if (shooter === "Jinx" && hasCard(state, "jinxShadow") && r.bet === "dont") r.winnings *= CONFIG.jinxShadowX;
    if (shooter === "Big Mo" && hasCard(state, "bigMoBelt") && r.bet === "field") r.winnings *= CONFIG.bigMoBeltFieldX;
    if (shooter === "The Professor" && hasCard(state, "professorsNotes") && (r.bet === "odds" || r.bet === "lay")) r.winnings = Math.floor(r.winnings * (1 + CONFIG.professorsNotesExtra));
  }

  // Wrong Way: Don't Pass winnings +50%.
  if (hasCard(state, "wrongWay")) {
    for (const r of results) {
      if (r.bet === "dont" && r.outcome === "win") r.winnings = Math.floor(r.winnings * (1 + CONFIG.wrongWayExtra));
    }
  }

  // Odds Addict: Odds winnings +50%.
  if (hasCard(state, "oddsAddict")) {
    for (const r of results) {
      if (r.bet === "odds" && r.outcome === "win") {
        r.winnings = Math.floor(r.winnings * (1 + CONFIG.oddsAddictExtra));
      }
    }
  }

  // Comeback Kid: the first point after a seven-out pays extra.
  if (state.comebackPending && pointBefore !== null && total === pointBefore) {
    state.comebackPending = false;
    if (hasCard(state, "comebackKid")) {
      for (const r of results) if (r.outcome === "win") r.winnings *= CONFIG.comebackKidX;
      notes.push("Comeback Kid: this point pays x" + CONFIG.comebackKidX + "!");
    }
  }

  // Hardway Hustler: Hard Ways pay more.
  if (hasCard(state, "hardwayHustler")) {
    for (const r of results) if (/^hard\d+$/.test(r.bet) && r.outcome === "win") r.winnings *= CONFIG.hardwayHustlerX;
  }

  // Steady Hand: Place 6 and 8 pay more.
  if (hasCard(state, "steadyHand")) {
    for (const r of results) {
      if ((r.bet === "place6" || r.bet === "place8") && r.outcome === "win") r.winnings = Math.floor(r.winnings * (1 + CONFIG.steadyHandExtra));
    }
  }

  // Bets that no longer have a decision drop out of the results.
  const kept = results.filter((r) => r.outcome !== "none");
  results.length = 0;
  results.push(...kept);
  return { notes, pity };
}

// Cards that react after the roll is paid. Returns sentences for the message.
function applyCardsAfterRoll(state, results, total, pointBefore, sevenOut) {
  const notes = [];
  const won = results.some((r) => r.outcome === "win");

  if (hasCard(state, "snakeEyes") && total === 2) {
    const bonus = roundTo5(CONFIG.snakeEyesBonusPct * state.debt);
    state.cash += bonus;
    notes.push("Snake Eyes: +" + money(bonus) + " bonus.");
  }
  if (hasCard(state, "luckySeven") && pointBefore === null && total === 7) {
    const bonus = roundTo5(CONFIG.luckySevenBonusPct * state.debt);
    state.cash += bonus;
    notes.push("Lucky Seven: +" + money(bonus) + " bonus.");
  }
  if (hasCard(state, "rattlesnake") && total === 2) {
    state.mult += CONFIG.rattlesnakeMult;
    state.rattleGain += CONFIG.rattlesnakeMult;
    setMultNote(state, "Rattlesnake", "Rattlesnake: +" + state.rattleGain + "x");
    notes.push("Rattlesnake: +" + CONFIG.rattlesnakeMult + "x mult for this shooter.");
  }

  if (hasCard(state, "boxcars") && total === 12) {
    const bonus = roundTo5(CONFIG.boxcarsBonusPct * state.debt);
    state.cash += bonus;
    notes.push("Boxcars: +" + money(bonus) + " bonus.");
  }
  const shooterNow = state.crew[state.shooterIndex];
  if (hasCard(state, "snakeFangs") && shooterNow === "Snake" && CONFIG.comeOutLosers.includes(total)) {
    const bonus = roundTo5(CONFIG.snakeFangsBonusPct * state.debt);
    state.cash += bonus;
    notes.push("Snake's Fangs: craps! +" + money(bonus) + ".");
  }
  if (hasCard(state, "jinxJar") && sevenOut && shooterNow === "Jinx") {
    const bonus = roundTo5(CONFIG.jinxJarBonusPct * state.debt);
    state.cash += bonus;
    notes.push("Jinx Jar: +" + money(bonus) + " for Jinx's seven-out.");
  }
  const dontWon = results.some((r) => r.bet === "dont" && r.outcome === "win");
  if (hasCard(state, "undertaker") && sevenOut && dontWon) {
    const bonus = roundTo5(CONFIG.undertakerBonusPct * state.debt);
    state.cash += bonus;
    notes.push("Undertaker: +" + money(bonus) + " for the seven-out.");
  }
  // "+1 way to roll 7" phone perk (dark side): seven-outs pay you.
  const plusSevens = state.perks.filter((id) => id === "plus7").length;
  if (plusSevens > 0 && sevenOut && dontWon) {
    const bonus = roundTo5(CONFIG.plusSevenBonusPct * plusSevens * state.debt);
    state.cash += bonus;
    notes.push("+1 way to roll 7: +" + money(bonus) + " for the seven-out.");
  }
  if (pointBefore !== null && total === pointBefore) state.turnPointsMade = (state.turnPointsMade || 0) + 1; // Heater

  // Cold Read: a Don't Pass win on a seven-out warms up the next shooter.
  if (hasCard(state, "coldRead") && sevenOut && results.some((r) => r.bet === "dont" && r.outcome === "win")) {
    state.coldReadPending = true;
    notes.push("Cold Read: the next shooter starts at +" + CONFIG.coldReadMult + "x.");
  }

  // Green Dice: every 12 raises interest for the rest of the run.
  if (hasCard(state, "greenDice") && total === 12) {
    state.interestRate += CONFIG.greenDiceInterestStep;
    notes.push("Green Dice: interest is now " + Math.round(interestRate(state) * 1000) / 10 + "%.");
  }

  // Hot Hand streak (tracked always, only counts if you own the card).
  const lost = results.some((r) => r.outcome === "lose");
  if (won) state.hotStreak += 1;
  else if (lost) state.hotStreak = 0;
  if (hasCard(state, "hotHand") && won) {
    notes.push("Hot Hand: " + state.hotStreak + " in a row (+" + state.hotStreak * CONFIG.hotHandPerWin + "x).");
  }

  // Muggsy: a 7 on the very next roll after the point was set.
  if (pointBefore !== null) state.rollsSincePoint += 1;
  if (hasCard(state, "muggsy") && sevenOut && state.rollsSincePoint === 1) {
    const extra = chargeExtra(state, results, CONFIG.muggsyCost, ["pass"]);
    state.muggsyPending = true;
    notes.push("Muggsy: point-7! " + (extra > 0 ? "Another " + money(extra) + " from your cash. " : "") +
      "The next shooter's winnings are x" + CONFIG.muggsyNextShooterX + ".");
  }
  if (pointBefore === null && state.point !== null) state.rollsSincePoint = 0;

  // Comeback Kid waits for the next shooter's first point.
  if (sevenOut) state.comebackPending = true;

  // Hardway Hustler: a hard pair warms up the rest of the turn.
  const dice = state.lastRoll ? state.lastRoll.dice : null;
  if (hasCard(state, "hardwayHustler") && dice && dice[0] === dice[1] && [2, 3, 4, 5].includes(dice[0])) {
    state.mult += CONFIG.hardwayHustlerMult;
    state.hustleGain = (state.hustleGain || 0) + CONFIG.hardwayHustlerMult;
    setMultNote(state, "Hardway Hustler", "Hardway Hustler: +" + state.hustleGain + "x");
    notes.push("Hardway Hustler: hard " + total + "! +" + CONFIG.hardwayHustlerMult + "x mult.");
  }

  return notes;
}
