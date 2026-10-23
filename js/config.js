// Every tunable number in the game lives here.
// Change a value, save, and refresh the browser to try it.

const CONFIG = {
  // Money
  startingBankroll: 200, // testing value for now; becomes the buy-in in Milestone 3
  tableMinimum: 5,
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

  // Odds limits ("3-4-5x"). Used starting in Milestone 2.
  oddsMaxMultiple: { 4: 3, 5: 4, 6: 5, 8: 5, 9: 4, 10: 3 },
};
