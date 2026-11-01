// Logic helper: writing numbers for people. Plain dollars up to $999,999,
// then short forms ($1.25M, $45.6B, $7.89T...) so endless mode's huge numbers stay readable.

// "2.50" -> "2.5", "3.00" -> "3", "250" stays "250".
function trimZeros(text) {
  return text.includes(".") ? text.replace(/0+$/, "").replace(/\.$/, "") : text;
}

const BIG_NUMBER_NAMES = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];

// 1250000 -> "1.25M"; 999999 -> "999,999". Three significant digits once it's shortened.
function bigNumber(n) {
  const sign = n < 0 ? "-" : "";
  const a = Math.abs(n);
  if (a < 1e6) return sign + (Math.round(a * 100) / 100).toLocaleString("en-US");
  const tier = Math.min(Math.floor(Math.log10(a) / 3), BIG_NUMBER_NAMES.length - 1);
  const short = a / Math.pow(1000, tier);
  const digits = short >= 100 ? 0 : short >= 10 ? 1 : 2;
  return sign + trimZeros(short.toFixed(digits)) + BIG_NUMBER_NAMES[tier];
}

// Money: "$1,250" or "$1.25M".
function money(n) {
  return (n < 0 ? "-$" : "$") + bigNumber(Math.abs(n));
}

// A mult: "2.5x", "1,250x", "4.2Mx".
function multText(m) {
  return bigNumber(Math.round(m * 100) / 100) + "x";
}

// Short money for small spaces like chips: "$500", "$2.5K", "$1.25M".
function shortMoney(n) {
  const a = Math.abs(n);
  if (a < 1000 || a >= 999500) return money(n);
  const k = a / 1000;
  return (n < 0 ? "-$" : "$") + trimZeros(k.toFixed(k >= 100 ? 0 : k >= 10 ? 1 : 2)) + "K";
}
