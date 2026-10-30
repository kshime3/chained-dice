// Every tunable number in the game lives here.
// Change a value, save, and refresh the browser to try it.

const CONFIG = {
  // Your chain: each won shift breaks one link. Break them all and you walk out free.
  chainLinks: 8,

  // Shifts: cash added at the start of each shift (to your leftover cash), and the debt.
  // Tested with tools/simulate.js (see docs/BALANCE.md).
  // minBet: the table minimum for that shift (the smallest line bet, and what you must keep in cash).
  // Debts grow slowly at first and faster later, so each shift is a bit harder than the last
  // (tested with tools/simulate.js, see docs/BALANCE.md 2026-10-28).
  shifts: [
    { cash: 150, debt: 200, minBet: 5 },
    { cash: 200, debt: 300, minBet: 10 },
    { cash: 175, debt: 550, minBet: 15 },
    { cash: 175, debt: 1100, minBet: 30 },
    { cash: 175, debt: 2400, minBet: 60 },
    { cash: 175, debt: 5500, minBet: 150 },
    { cash: 175, debt: 12500, minBet: 300 },
    { cash: 175, debt: 28000, minBet: 700 },
  ],
  laterDebtGrowth: 2.2,  // endless: each debt is this times the last (rounded to $50)
  laterCashStep: 0,      // endless: each shift adds this much more cash than the last
  laterMinBetPct: 0.025, // endless: the minimum bet is this share of the debt (rounded to $25)

  // The dealer won't take payments until the first shooter of the shift has rolled.
  // Stops paying off a new shift's debt straight from leftover money. false = pay any time.
  payAfterFirstShooter: true,

  // Dealer's cut: at the end of a won shift you keep this share of your leftover money
  // (1 = keep it all). Stops a big leftover cash from clearing the next shifts.
  carryOverShare: 0.5,
  // Seat order. Each seat shoots until they seven out, then the dice pass on.
  crew: ["Lefty", "Dealer Dee", "Hot Rod", "Jinx", "Ghost", "You"],

  // Each shooter's dice: the faces on the left and right die.
  // Every face listed is equally likely. Repeat a face to make it more common.
  // bannedPairs: left/right combos that can't happen (rerolled if they come up).
  crewDice: {
    "Lefty":      { left: [1, 2, 3, 4, 5], right: [1, 2, 3, 4, 5] },          // no 6s
    "Dealer Dee": { left: [1, 2, 3, 4, 5, 6], right: [1, 2, 3, 4, 5, 6],
                    bannedPairs: [[1, 6]] },                                   // sticky dice
    "Hot Rod":    { left: [1, 2, 3, 4, 5, 6], right: [1, 2, 3, 4, 5, 6] },
    "Jinx":       { left: [1, 2, 3, 3, 4, 4], right: [1, 2, 3, 3, 4, 4] },    // leans to 3s and 4s
    "Ghost":      { left: [1, 2, 3, 4, 5, 6], right: "ghost" },                // see ghostFaces
    "You":        { left: [1, 2, 3, 4, 5, 6], right: [1, 2, 3, 4, 5, 6] },
    // Crew you can hire (Milestone 10)
    "Snake":      { left: [1, 1, 2, 3, 5, 6], right: [1, 1, 2, 3, 5, 6] },    // lots of 2s, 3s and 12s
    "Big Mo":     { left: [1, 4, 5, 5, 6, 6], right: [1, 4, 5, 5, 6, 6] },    // lots of 10s, 11s and 12s
    "The Professor": { left: [1, 2, 3, 4, 5, 6], right: [1, 2, 3, 4, 5, 6] },
    "Lucky Lou":  { left: [1, 2, 3, 4, 5, 6], right: [1, 2, 3, 4, 5, 6] },
  },

  // Hiring new crew at a Dealer Break (only into an empty seat).
  recruits: ["Snake", "Big Mo", "The Professor", "Lucky Lou"],
  maxSeats: 6,        // most people at the table, including you
  // Unlocks (js/unlocks.js): progress is saved in the browser.
  saveProgress: true,      // tests.html turns this off so checks never touch your progress
  unlockEverything: false, // testing: ?unlockAll in the address turns this on
  // Hidden unlock goals (what each locked thing needs). Tuned so about half unlock by run 20.
  unlockGoals: {
    loadedDie: 3,       // survive shift 3
    reroll: 4,          // survive shift 4
    chainLink: 5,       // survive shift 5 (Spare Link)
    bargain: 6,         // survive shift 6 (Dealer's Bargain)
    oddsAddict: 2000,   // win this much on Odds, all runs
    muggsy: 15,         // sevens right after the point is set, all runs
    pity: 15,           // times the floor opens
    doublesCharm: 4,    // doubles in one turn
    greenDice: 100,     // interest earned in one run
    wrongWay: 25,       // Don't Pass bets won, all runs
    jinxShadow: 1,      // times Jinx dropped through the Trapdoor
    crewCard: 8,        // shifts survived with that crew member seated (Lefty, Dee, Hot Rod, Ghost cards)
    encore: 15,         // rolls in one turn of yours
    highRoller: 1500,   // won on one turn of yours
    frontOfLine: 4,     // crew hired in one run
    sleightOfHand: 6,   // dice edits used, all runs
    loadedShot: 40,     // points hit, all runs
    copycat: 4,         // Nudges used
    chisel: 2,          // Copycats used
    luckyLou: 3,        // points hit at 3x mult or more, all runs
    professor: 8,       // crew hired, all runs
    hardWays: 40,       // pairs rolled that make 4, 6, 8 or 10, all runs
    placeBets: 150,     // points hit, all runs
    fireBet: 4,         // different points made by one shooter in one turn
    comeBets: 15,       // points hit in one run
    comebackKid: 100,   // seven-outs, all runs
    pointCollector: 5,  // different points made by one shooter in one turn
    loanShark: 2500,    // money left over when you win a shift
    hardwayHustler: 10, // Hard Ways bets won, all runs
    steadyHand: 30,     // Place bets won, all runs
    diceCollector: 4,   // faces edited on your dice at once
  },
  // Reputation: every few unlocks earns the next lasting bonus (from the next run on).
  reputationEvery: 3,
  reputation: [
    { id: "cash", text: "+$25 starting cash" },
    { id: "compSlot", text: "+1 comp slot" },
    { id: "minusSeven", text: "-1 way to roll 7 on everyone's dice" },
    { id: "startCard", text: "Start each run with a random uncommon card" },
    { id: "cardSlot", text: "+1 card slot" },
    { id: "minusSeven2", text: "-1 more way to roll 7 on everyone's dice" },
    { id: "cash2", text: "+$50 more starting cash" },
    { id: "spareLink", text: "Start each run with a Spare Link" },
    { id: "cash3", text: "+$100 more starting cash" },
    { id: "compSlot2", text: "+1 more comp slot" },
    { id: "rareCard", text: "Start each run with a random rare card" },
  ],
  reputationCash: 25,       // the first starting-cash bonus
  reputationCash2: 50,      // the second one
  reputationCash3: 100,     // the third one
  reputationCardRarity: "uncommon", // the starting card's rarity
  startingCrew: 3,    // seats filled at the start of a run, including you (the rest are hired)
  alwaysStarts: ["Jinx"], // crew who are always at the table when a run starts
  hireOffers: 2,      // candidates offered at each Break
  hirePricePct: 0.2,  // hiring costs this share of the debt...
  // ...except these, priced by how much they help (simulator, 2026-10-30).
  hirePrices: { "Hot Rod": 0.4, "Big Mo": 0.3, "Lucky Lou": 0.25, "Ghost": 0.15, "Snake": 0.1 },
  professorOddsX: 2,  // The Professor: Odds and Lay Odds limits are this many times bigger on his turn
  luckyLouMult: 1,    // Lucky Lou: + this much mult every time he hits a point
  // Ghost's right die is evens-only or odds-only, picked at the start of each turn.
  ghostFaces: { evens: [2, 4, 6], odds: [1, 3, 5] },

  // Mult: multiplies your winnings (not your bet). Every shooter starts at this.
  startingMult: 1,
  hotRodMultPerWin: 1,       // Hot Rod: + this after every roll where a bet of yours wins
  hotRodSevenOutCost: 2,     // Hot Rod's first seven-out: your losing bets cost this many times over
  mentorShare: 0.5,          // Mentor: this share of Hot Rod's bonus passes to the next shooter
  coldTablePenalty: 0.5,     // Cold Table: shooter after Jinx starts this much lower, until their first win
  jinxCurse: true,           // Jinx's come-out curse: when Jinx shoots, a come-out 7 is a tie for Don't Pass

  // The shop (the stickman). Prices are a share of the shift's debt, rounded to the nearest $5.
  shopOpensAfterShooter: 1, // the shop first opens after this many shooters have sevened out
  shopSlots: 3,       // cards offered at each Dealer Break
  maxCards: 5,        // cards you can hold
  rarityPricePct: { common: 0.05, uncommon: 0.10, rare: 0.25, legendary: 0.50 },
  rarityChance:   { common: 0.60, uncommon: 0.30, rare: 0.09, legendary: 0.01 }, // per slot
  shuffleBasePct: 0.05,   // a Shuffle costs this share of the debt
  shuffleStepPct: 0,      // each Shuffle after that costs this much more (0 = same price every time)
  sellBackShare: 0.5,     // selling a card gives back this share of its price

  // Card rarity. "legendary" is the Spare Link tier.
  cardRarity: {
    hotHand: "common",
    snakeEyes: "common",
    luckySeven: "common",
    rattlesnake: "common",
    redDice: "uncommon",
    oddsAddict: "uncommon",
    pity: "rare",
    muggsy: "uncommon",
    doubleUp: "uncommon",
    doublesCharm: "rare",
    greenDice: "rare",
    loadedDie: "uncommon",
    reroll: "uncommon",
    chainLink: "legendary",
    wrongWay: "uncommon",
    coldRead: "common",
    bargain: "rare",
    leftysGlove: "uncommon",
    deesLedger: "uncommon",
    rodsLighter: "uncommon",
    jinxShadow: "uncommon",
    ghostStory: "common",
    encore: "rare",
    highRoller: "uncommon",
    frontOfLine: "common",
    sleightOfHand: "uncommon",
    comebackKid: "uncommon",
    pointCollector: "uncommon",
    loanShark: "rare",
    hardwayHustler: "uncommon",
    steadyHand: "uncommon",
    diceCollector: "uncommon",
  },

  // Card numbers
  // Starter cards were trimmed and locked cards strengthened (2026-10-29), so unlocks add power.
  hotHandPerWin: 0.25,        // Hot Hand: +mult per winning roll in a row
  rattlesnakeMult: 0.5,       // Rattlesnake: +mult when snake eyes (1+1) is rolled
  snakeEyesBonusPct: 0.06,    // Snake Eyes: rolling a 2 pays this share of the debt
  luckySevenBonusPct: 0.03,   // Lucky Seven: a come-out 7 pays this share of the debt
  oddsAddictExtra: 0.5,       // Odds Addict: Odds winnings +50%
  muggsyCost: 2,              // Muggsy: a point-7 costs this many times your losing bets
  muggsyNextShooterX: 3,      // Muggsy: the next shooter's winnings are multiplied by this
  doubleUpWays: 1,            // Double Up: + this many ways (out of 36) for each double
  doublesCharmEvery: 3,       // Doubles Charm: every Nth roll of a shooter's turn is a pair
  greenDiceInterestStep: 0.01, // Green Dice: each 12 adds this to the interest rate (0.01 = 1%)
  wrongWayExtra: 1,           // Wrong Way: Don't Pass winnings +100%
  coldReadMult: 1,            // Cold Read: the next shooter starts with this much extra mult
  deesLedgerExtra: 1,         // Dee's Ledger: Odds and Lay Odds pay +100% on Dee's turn
  rodsLighterMultPerWin: 1.5, // Rod's Lighter: Hot Rod's mult per winning roll (instead of 1)
  jinxShadowX: 3,             // Jinx's Shadow: Don't Pass winnings x3 when Jinx shoots
  highRollerX: 3,             // High Roller: your winnings x3 on your own turn
  leftysGloveMult: 1,         // Lefty's Glove: +mult on Lefty's turn
  ghostStoryMult: 1,          // Ghost Story: +mult on Ghost's turn
  frontOfLineMult: 1,         // Front of the Line: +mult on your own turn
  comebackKidX: 2,            // Comeback Kid: after a seven-out, the next shooter's first point pays x this
  pointCollectorMult: 0.5,    // Point Collector: +mult per different point this shooter has made
  loanSharkCarry: 0.75,       // Loan Shark: share of leftover money you keep (instead of carryOverShare)
  hardwayHustlerX: 2,         // Hardway Hustler: Hard Ways winnings x this
  hardwayHustlerMult: 0.5,    // Hardway Hustler: +mult for the turn on any hard pair (2+2, 3+3, 4+4, 5+5)
  steadyHandExtra: 0.5,       // Steady Hand: Place 6 and 8 winnings +50%
  diceCollectorMult: 0.25,    // Dice Collector: +mult on your turn per edited face

  // The Pit Boss phone: after each won shift, pick 1 of these many different perks.
  phoneChoices: 3,
  // How likely each kind of perk is to be offered. "plusTotal" is shared by the 11 "+1 way to roll N" perks.
  perkWeights: { plusTotal: 0.55, removeCharacter: 0.12, freeItems: 0.12, freeComps: 0.12, minusSeven: 0.1 },
  minusSevenRarer: 0.5, // each time you take "-1 way to roll 7", its chance is multiplied by this
  minSevenWays: 2,      // a 7 never drops below this many ways out of 36
  freeItemsCount: 2,    // "2 free items": your next this-many shop cards are free

  // Comps: one-use items. Slots you can hold, how many the shop offers, and prices (share of the debt).
  compSlots: 2,
  compShopSlots: 2,
  compPricePct: { noSevens: 0.08, doubleDown: 0.06, luckyPair: 0.05, loadedShot: 0.07, insurance: 0.04, hotSeat: 0.05, seatSwap: 0.04, cashAdvance: 0.03,
                  nudge: 0.05, copycat: 0.08, chisel: 0.15 },
  // How often each comp shows up in the shop (1 = normal). Stronger dice edits are rarer.
  compWeights: { copycat: 0.6, chisel: 0.35 },
  hotSeatMult: 1,        // Hot Seat: + this much mult for the rest of the turn
  cashAdvancePct: 0.25,  // Cash Advance: lends this share of the debt
  cashAdvanceCost: 1.5,  // Cash Advance: the debt grows by this times what was lent
  freeCompMult: 3,       // hitting a point at this mult or more gives you a free comp (if you have a free slot)
  freeCompsPerk: 2,      // the phone perk "free comps" gives this many

  // House rules and pit boss challenges
  houseRulesFromShift: 3,     // one random house rule per shift from here (a boss rule on the last chain shift)
  tightOddsX: 2,              // Tight Odds: Odds and Lay Odds win at most this many times your line bet
  highStakesX: 2,             // High Stakes: table minimum multiplied by this
  skimmedInterestX: 0.5,      // Skimmed Interest: interest multiplied by this
  markupX: 1.5,               // Markup: shop prices multiplied by this
  challengesFromShift: 2,     // pit boss challenges on your own turn from this shift
  challengeCashPct: 0.10,     // challenge reward: cash, this share of the debt
  challengeDebtCutPct: 0.05,  // challenge reward: this share of the debt taken off

  // Trapdoor: a Dealer Break option once the shop is open (drops a crew member for the run).
  cutChainPct: 0.25, // costs this share of the debt

  // Interest: at every Dealer Break after a seven-out, this share of the money
  // you've paid the dealer so far is added to your cash (rounded down).
  interestRate: 0.05,

  // Presentation
  soundVolume: 0.5, // 0 = silent, 1 = full volume (the mute button turns sound off)
  fallMs: 3200,     // how long the floor-opening animation lasts when you fall
  diceRollMs: 1000, // how long the dice-rolling animation lasts (0 = no animation)
  sevenOutSplashMs: 5000, // how long the SEVEN OUT screen shows before the Dealer Break (tap skips)
  betPopMs: 1400,         // how long a "+$25" win popup floats
  unlockSplashMs: 6000,   // how long the "Unlocked" screen shows (tap skips)
  winSplashMs: 5000,      // how long the "Point hit" winnings screen shows (tap skips)
  cutSplashMs: 4000,      // how long the "falls through the floor" screen shows (tap skips)

  // Chips: three are shown at a time. Small chips while the minimum bet is under $25, big ones after.
  chipValues: [5, 25, 100],
  bigChipValues: [25, 100, 500],

  // Pass Line pays even money (bet $10, win $10).
  passLinePayout: 1,

  // Field: what each winning total pays, per $1 bet.
  // Totals not listed here (5, 6, 7, 8) lose.
  fieldPayouts: {
    2: 2,  // double
    3: 1,
    4: 1,
    9: 1,
    10: 1,
    11: 1,
    12: 3, // triple
  },

  // Come-out roll results for the Pass Line.
  comeOutWinners: [7, 11],
  comeOutLosers: [2, 3, 12], // "craps"

  // Don't Pass: on the come-out, these win, and this one is a tie (the bet stays).
  dontComeOutWinners: [2, 3],
  dontBarNumber: 12,

  // Lay Odds (behind Don't Pass) pay the other way round, as [win, per bet]:
  // [1, 2] means win $1 for every $2 laid. Half dollars round down.
  // The most you can win is limited the same way as Odds (oddsMaxMultiple).
  layPayouts: { 4: [1, 2], 5: [2, 3], 6: [5, 6], 8: [5, 6], 9: [2, 3], 10: [1, 2] },

  // Numbers that become the point on a come-out roll.
  pointNumbers: [4, 5, 6, 8, 9, 10],

  // Odds limits ("3-4-5x"): max odds bet = Pass Line bet x this number.
  oddsMaxMultiple: { 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3 },

  // Odds pay "true odds", written as [win, per bet].
  // [3, 2] means win $3 for every $2 bet. Half dollars round down.
  // More bets (Milestone 12b, unlocked by hidden goals). Profit per $1, or [win, per].
  hardWaysPayouts: { 4: 7, 6: 9, 8: 9, 10: 7 }, // a pair (2+2, 3+3...) before a 7 or the easy way
  placePayouts: { 4: [9, 5], 5: [7, 5], 6: [7, 6], 8: [7, 6], 9: [7, 5], 10: [9, 5] }, // the number before a 7
  firePayouts: { 4: 24, 5: 99, 6: 299 }, // different points made by one shooter (trimmed: the mult applies too)
  fireBetMaxX: 1, // the Fire Bet can be at most this many table minimums
  oddsPayouts: { 4: [2, 1], 5: [3, 2], 6: [6, 5], 8: [6, 5], 9: [3, 2], 10: [2, 1] },

  // A seven during the point phase ends the shooter's turn.
  sevenOut: 7,
};

// Testing shortcut: add ?target=300 to the page address to set shift 1's debt.
const testTarget = Number(new URLSearchParams(location.search).get("target"));
if (testTarget > 0) CONFIG.shifts[0].debt = testTarget;

// Testing shortcut: add ?fast to the page address to skip the dice animation.
if (new URLSearchParams(location.search).has("fast")) {
  CONFIG.diceRollMs = 0;
  CONFIG.sevenOutSplashMs = 0;
  CONFIG.winSplashMs = 0;
  CONFIG.cutSplashMs = 0;
  CONFIG.fallMs = 0;
}
