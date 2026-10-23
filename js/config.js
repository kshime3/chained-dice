// Every tunable number in the game lives here.
// Change a value, save, and refresh the browser to try it.

const CONFIG = {
  // The shift
  buyIn: 200,        // money you wake up with
  shiftTarget: 2000, // reach this and the chains hold (see testing shortcut at the bottom)
  // Seat order. Each seat shoots until they seven out, then the dice pass on.
  crew: ["Lefty", "Dealer Dee", "Hot Rod", "Ghost", "Jinx", "You"],

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

// Testing shortcut: add ?target=300 to the page address to play with a smaller target.
const testTarget = Number(new URLSearchParams(location.search).get("target"));
if (testTarget > 0) CONFIG.shiftTarget = testTarget;
