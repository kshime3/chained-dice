// Every tunable number in the game lives here.
// Change a value, save, and refresh the browser to try it.

const CONFIG = {
  // Shifts: cash added at the start of each shift (to your leftover kitty), and the debt.
  // Tested with tools/simulate.js (see docs/BALANCE.md).
  shifts: [
    { cash: 150, debt: 200 },
    { cash: 150, debt: 300 },
    { cash: 200, debt: 500 },
    { cash: 250, debt: 800 },
    { cash: 300, debt: 1200 },
  ],
  laterDebtGrowth: 1.5, // after the table: each debt is this times the last (rounded to $50)
  laterCashStep: 50,    // after the table: each shift adds this much more cash than the last
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
  },
  // Ghost's right die is evens-only or odds-only, picked at the start of each turn.
  ghostFaces: { evens: [2, 4, 6], odds: [1, 3, 5] },

  // Mult: multiplies your winnings (not your bet). Every shooter starts at this.
  startingMult: 1,
  hotRodMultPerWin: 1,       // Hot Rod: + this after every roll where a bet of yours wins
  hotRodSevenOutCost: 2,     // Hot Rod's first seven-out: your losing bets cost this many times over
  mentorShare: 0.5,          // Mentor: this share of Hot Rod's bonus passes to the next shooter
  coldTablePenalty: 0.5,     // Cold Table: shooter after Jinx starts this much lower, until their first win

  // The shop (the stickman). Prices are a share of the shift's debt, rounded to the nearest $5.
  shopOpensAfterShooter: 1, // the shop first opens after this many shooters have sevened out
  shopSlots: 3,       // cards offered at each Dealer Break
  maxCards: 5,        // cards you can hold
  rarityPricePct: { common: 0.05, uncommon: 0.10, rare: 0.25, legendary: 0.50 },
  rarityChance:   { common: 0.60, uncommon: 0.30, rare: 0.09, legendary: 0.01 }, // per slot
  shuffleBasePct: 0.05,   // a Shuffle costs this share of the debt
  shuffleStepPct: 0,      // each Shuffle after that costs this much more (0 = same price every time)
  sellBackShare: 0.5,     // selling a card gives back this share of its price

  // Card rarity. "legendary" is the Extra chain link tier.
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
  },

  // Card numbers
  hotHandPerWin: 0.5,         // Hot Hand: +mult per winning roll in a row
  rattlesnakeMult: 1,         // Rattlesnake: +mult when snake eyes (1+1) is rolled
  snakeEyesBonusPct: 0.10,    // Snake Eyes: rolling a 2 pays this share of the debt
  luckySevenBonusPct: 0.05,   // Lucky Seven: a come-out 7 pays this share of the debt
  oddsAddictExtra: 0.5,       // Odds Addict: Odds winnings +50%
  muggsyCost: 2,              // Muggsy: a point-7 costs this many times your losing bets
  muggsyNextShooterX: 2,      // Muggsy: the next shooter's winnings are multiplied by this
  doubleUpWays: 1,            // Double Up: + this many ways (out of 36) for each double
  doublesCharmEvery: 3,       // Doubles Charm: every Nth roll of a shooter's turn is a pair
  greenDiceInterestStep: 0.005, // Green Dice: each 12 adds this to the interest rate (0.005 = 0.5%)

  // The Pit Boss phone: after each won shift, pick 1 of these many different perks.
  phoneChoices: 3,
  // How likely each kind of perk is to be offered. "plusTotal" is shared by the 11 "+1 way to roll N" perks.
  perkWeights: { plusTotal: 0.6, removeCharacter: 0.15, freeItems: 0.15, minusSeven: 0.1 },
  minusSevenRarer: 0.5, // each time you take "-1 way to roll 7", its chance is multiplied by this
  minSevenWays: 2,      // a 7 never drops below this many ways out of 36
  freeItemsCount: 2,    // "2 free items": your next this-many shop cards are free

  // Cut a chain: a Dealer Break option once the shop is open.
  cutChainPct: 0.25, // costs this share of the debt

  // Interest: at every Dealer Break after a seven-out, this share of the money
  // you've paid the dealer so far is paid into your kitty (rounded down).
  interestRate: 0.05,

  // Presentation
  soundVolume: 0.5, // 0 = silent, 1 = full volume (the mute button turns sound off)
  fallMs: 3200,     // how long the floor-opening animation lasts when you fall
  diceRollMs: 600, // how long the dice-rolling animation lasts (0 = no animation)
  sevenOutSplashMs: 5000, // how long the SEVEN OUT screen shows before the Dealer Break (tap skips)
  winSplashMs: 5000,      // how long the "Point hit" winnings screen shows (tap skips)
  cutSplashMs: 4000,      // how long the "falls through the floor" screen shows (tap skips)

  // Money
  tableMinimum: 5, // also the smallest Pass Line bet, which is required to roll
  chipValues: [5, 25, 100],

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

  // Numbers that become the point on a come-out roll.
  pointNumbers: [4, 5, 6, 8, 9, 10],

  // Odds limits ("3-4-5x"): max odds bet = Pass Line bet x this number.
  oddsMaxMultiple: { 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3 },

  // Odds pay "true odds", written as [win, per bet].
  // [3, 2] means win $3 for every $2 bet. Half dollars round down.
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
