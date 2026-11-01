// Display: card art, drawn in code (SVG). Style "E" (owner's pick, 2026-11-01):
// a dark panel tinted with the card's theme colour and lit from above like the table lamp,
// with a bold bone-white symbol outlined in rust and a touch of blood red.
// Every drawing uses a 100 x 70 box. Cards without a drawing yet get a plain die.

// Panel colour per theme ("none" for cards without a theme).
const CARD_ART_TINT = { dark: "#4b3b5c", pairs: "#2c6e8f", streak: "#b8461f", money: "#2f7a4a", none: "#5a4632" };

// The palette every symbol is drawn with.
const ART = { ink: "#6a3a1e", bone: "#e9e1cf", bone2: "#c9b994", hi: "#c9a57a", red: "#c0281c", black: "#120d0b", gold: "#d6b46a", ice: "#9cc8e0", w: 2.4 };

// A small helper: a rounded die face with pips at the given spots (0-8, a 3x3 grid).
function artDie(x, y, size, spots, opts) {
  const o = Object.assign({ fill: ART.bone, pip: ART.black, red: -1, rotate: 0 }, opts || {});
  const step = size / 4;
  const pips = spots.map((s) => '<circle cx="' + (x + step * (1 + (s % 3))) + '" cy="' + (y + step * (1 + Math.floor(s / 3))) + '" r="' + (size / 11).toFixed(1) +
    '" fill="' + (s === o.red ? ART.red : o.pip) + '"/>').join("");
  return '<g transform="rotate(' + o.rotate + " " + (x + size / 2) + " " + (y + size / 2) + ')"><rect x="' + x + '" y="' + y + '" width="' + size + '" height="' + size +
    '" rx="' + size / 5 + '" fill="' + o.fill + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' + pips + "</g>";
}

// A flame: orange outside, gold inside. (x, y) is the bottom point, h the height.
function artFlame(x, y, h, w) {
  const drop = (hh, ww, fill) => '<path d="M' + x + " " + y + " C" + (x - ww) + " " + (y - hh * 0.25) + " " + (x - ww * 0.55) + " " + (y - hh * 0.7) + " " + x + " " + (y - hh) +
    " C" + (x + ww * 0.55) + " " + (y - hh * 0.7) + " " + (x + ww) + " " + (y - hh * 0.25) + " " + x + " " + y + ' Z" fill="' + fill + '"/>';
  return drop(h, w || h * 0.55, "#e0501f") + drop(h * 0.62, (w || h * 0.55) * 0.6, ART.gold);
}

// A coin seen from the side (an ellipse), for stacks.
function artCoin(x, y, rx) {
  const r = rx || 10;
  return '<ellipse cx="' + x + '" cy="' + (y + 2.5) + '" rx="' + r + '" ry="' + r * 0.4 + '" fill="#a07a2e" stroke="' + ART.ink + '" stroke-width="1.4"/>' +
    '<ellipse cx="' + x + '" cy="' + y + '" rx="' + r + '" ry="' + r * 0.4 + '" fill="' + ART.gold + '" stroke="' + ART.ink + '" stroke-width="1.4"/>';
}
function artStack(x, bottom, count, rx) {
  let out = "";
  for (let i = 0; i < count; i++) out += artCoin(x, bottom - i * 4.5, rx);
  return out;
}

// A casino chip seen from above, with edge stripes and an optional label.
function artChip(x, y, r, colour, label) {
  const stripes = [0, 60, 120, 180, 240, 300].map((a) => '<rect x="' + (x - r * 0.12) + '" y="' + (y - r) + '" width="' + r * 0.24 + '" height="' + r * 0.28 + '" fill="' + ART.bone + '" transform="rotate(' + a + " " + x + " " + y + ')"/>').join("");
  return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + colour + '" stroke="' + ART.ink + '" stroke-width="1.6"/>' + stripes +
    '<circle cx="' + x + '" cy="' + y + '" r="' + r * 0.6 + '" fill="none" stroke="' + ART.bone + '" stroke-width="1.2" stroke-dasharray="2 2"/>' +
    (label ? '<text x="' + x + '" y="' + (y + r * 0.3) + '" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="' + r * 0.8 + '" fill="' + ART.bone + '">' + label + "</text>" : "");
}
// A side-on stack of chips.
function artChipStack(x, bottom, count, colour) {
  let out = "";
  for (let i = 0; i < count; i++) {
    const y = bottom - i * 5;
    out += '<rect x="' + (x - 11) + '" y="' + (y - 5) + '" width="22" height="5" rx="1.5" fill="' + colour + '" stroke="' + ART.ink + '" stroke-width="1.2"/>' +
      '<path d="M' + (x - 6) + " " + (y - 5) + " V" + y + " M" + x + " " + (y - 5) + " V" + y + " M" + (x + 6) + " " + (y - 5) + " V" + y + '" stroke="' + ART.bone + '" stroke-width="1.6"/>';
  }
  return out;
}
// A big serif number or word, bone with a rust outline.
function artBigText(x, y, size, text, fill) {
  return '<text x="' + x + '" y="' + y + '" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="' + size + '" fill="' + (fill || ART.bone) + '" stroke="' + ART.ink + '" stroke-width="1.6" paint-order="stroke">' + text + "</text>";
}

// The drawings, by card id.
const CARD_ART = {
  // ---------- Dark side ----------
  wrongWay: () => // a U-turn arrow: going against the shooter
    '<path d="M30 62 V32 Q30 14 50 14 Q70 14 70 32 V44" fill="none" stroke="' + ART.ink + '" stroke-width="13" stroke-linecap="round"/>' +
    '<path d="M30 62 V32 Q30 14 50 14 Q70 14 70 32 V44" fill="none" stroke="' + ART.bone + '" stroke-width="8" stroke-linecap="round"/>' +
    '<path d="M58 42 L82 42 L70 60 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '" stroke-linejoin="round"/>' +
    '<path d="M14 54 L24 64 M24 54 L14 64" stroke="' + ART.red + '" stroke-width="3.2" stroke-linecap="round"/>',
  coldRead: () => // a frozen eye with icicles
    '<path d="M16 34 Q50 6 84 34 Q50 60 16 34 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<circle cx="50" cy="33" r="11" fill="' + ART.ice + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/><circle cx="50" cy="33" r="4.5" fill="' + ART.black + '"/>' +
    '<circle cx="46" cy="29" r="2" fill="#fff"/>' +
    [[34, 44, 8], [44, 47, 12], [56, 47, 9], [66, 44, 13]].map(([x, y, h]) => '<path d="M' + (x - 3) + " " + y + " L" + (x + 3) + " " + y + " L" + x + " " + (y + h) + ' Z" fill="#dff0fa" stroke="' + ART.ink + '" stroke-width="1.4" stroke-linejoin="round"/>').join(""),
  jinxShadow: () => // Jinx's hood, red eyes, and a long shadow
    '<path d="M50 66 L92 66 L84 60 L50 60 Z" fill="' + ART.black + '" opacity="0.7"/>' +
    '<path d="M28 66 Q26 12 50 10 Q74 12 72 66 Q64 34 50 34 Q36 34 28 66 Z" fill="#1a1212" stroke="' + ART.bone + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M36 66 Q38 38 50 38 Q62 38 64 66 Z" fill="' + ART.black + '"/>' +
    '<circle cx="44" cy="48" r="7" fill="#ff4b2b" opacity="0.25"/><circle cx="56" cy="48" r="7" fill="#ff4b2b" opacity="0.25"/>' +
    '<circle cx="44" cy="48" r="3" fill="#ff4b2b"/><circle cx="56" cy="48" r="3" fill="#ff4b2b"/>',
  graveyardShift: () => // a crescent moon over three headstones
    '<path d="M28 8 A15 15 0 1 0 42 30 A12 12 0 1 1 28 8 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M6 66 Q50 50 94 66 Z" fill="' + ART.bone2 + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    [[50, 30, 14], [68, 36, 12], [84, 42, 10]].map(([x, top, w]) => '<path d="M' + (x - w / 2) + " 62 V" + (top + w / 2) + " Q" + (x - w / 2) + " " + top + " " + x + " " + top + " Q" + (x + w / 2) + " " + top + " " + (x + w / 2) + " " + (top + w / 2) + " V62 Z" + '" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>').join("") +
    '<path d="M47 40 H53 M50 37 V45" stroke="' + ART.red + '" stroke-width="2" stroke-linecap="round"/>',
  badOmen: () => // a crow perched on a die
    artDie(34, 38, 28, [0, 2, 4, 6, 8], { red: 4 }) +
    '<path d="M44 38 L42 32 M54 38 L55 32" stroke="' + ART.hi + '" stroke-width="1.8"/>' +
    '<ellipse cx="50" cy="26" rx="15" ry="8" fill="' + ART.black + '" stroke="' + ART.hi + '" stroke-width="1.6"/>' +
    '<path d="M37 24 L22 30 L36 30 Z" fill="' + ART.black + '" stroke="' + ART.hi + '" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<circle cx="64" cy="18" r="7" fill="' + ART.black + '" stroke="' + ART.hi + '" stroke-width="1.6"/>' +
    '<path d="M70 16 L80 19 L70 21 Z" fill="' + ART.hi + '"/><circle cx="66" cy="16.5" r="1.6" fill="#ff4b2b"/>',
  undertaker: () => // a shovel beside a grave marked 7
    '<path d="M14 62 Q50 40 86 62 Z" fill="' + ART.bone2 + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M56 50 V22 Q56 14 64 14 Q72 14 72 22 V50 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<text x="64" y="38" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="13" fill="' + ART.red + '">7</text>' +
    '<path d="M26 58 L40 18" stroke="' + ART.ink + '" stroke-width="5" stroke-linecap="round"/><path d="M26 58 L40 18" stroke="' + ART.hi + '" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M36 14 L46 18 L42 28 L32 24 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M22 54 L32 58" stroke="' + ART.ink + '" stroke-width="4" stroke-linecap="round"/>',
  // ---------- Pairs ----------
  doubleUp: () => // two matching dice with an up arrow
    artDie(16, 24, 30, [0, 4, 8], { red: 4, rotate: -8 }) + artDie(54, 24, 30, [0, 4, 8], { red: 4, rotate: 8 }) +
    '<path d="M50 20 V4 M42 12 L50 4 L58 12" fill="none" stroke="' + ART.ink + '" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M50 20 V4 M42 12 L50 4 L58 12" fill="none" stroke="' + ART.gold + '" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>',
  doublesCharm: () => // a lucky horseshoe with a pair of dice hanging from it
    '<path d="M32 6 V22 Q32 38 50 38 Q68 38 68 22 V6" fill="none" stroke="' + ART.ink + '" stroke-width="12" stroke-linecap="round"/>' +
    '<path d="M32 6 V22 Q32 38 50 38 Q68 38 68 22 V6" fill="none" stroke="' + ART.bone + '" stroke-width="7" stroke-linecap="round"/>' +
    [[32, 12], [34, 26], [66, 26], [68, 12]].map(([x, y]) => '<circle cx="' + x + '" cy="' + y + '" r="1.6" fill="' + ART.ink + '"/>').join("") +
    '<path d="M44 39 L38 46 M56 39 L62 46" stroke="' + ART.hi + '" stroke-width="1.6"/>' +
    artDie(28, 45, 17, [0, 8], { rotate: -12 }) + artDie(55, 45, 17, [0, 8], { rotate: 12 }),
  hardwayHustler: () => // a hustler's fedora over a hard 8 (4 + 4)
    '<path d="M18 26 Q50 18 82 26 Q78 30 66 28 L64 12 Q50 4 36 12 L34 28 Q22 30 18 26 Z" fill="#1a1212" stroke="' + ART.bone + '" stroke-width="' + ART.w + '" stroke-linejoin="round"/>' +
    '<path d="M35 24 Q50 20 65 24" stroke="' + ART.red + '" stroke-width="3.5" fill="none"/>' +
    artDie(22, 34, 28, [0, 2, 6, 8], { rotate: -6 }) + artDie(50, 34, 28, [0, 2, 6, 8], { rotate: 6 }),
  rattlesnake: () => // a coiled rattlesnake, tongue out
    '<path d="M22 60 Q10 60 12 50 Q14 40 30 42 Q50 44 52 36 Q54 28 44 26 Q36 24 40 16" fill="none" stroke="' + ART.ink + '" stroke-width="12" stroke-linecap="round"/>' +
    '<path d="M22 60 Q10 60 12 50 Q14 40 30 42 Q50 44 52 36 Q54 28 44 26 Q36 24 40 16" fill="none" stroke="' + ART.bone2 + '" stroke-width="7" stroke-linecap="round"/>' +
    '<path d="M22 60 Q10 60 12 50 Q14 40 30 42 Q50 44 52 36 Q54 28 44 26 Q36 24 40 16" fill="none" stroke="' + ART.ink + '" stroke-width="7" stroke-dasharray="2 6" stroke-linecap="round" opacity="0.6"/>' +
    '<ellipse cx="46" cy="12" rx="10" ry="6.5" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<circle cx="50" cy="10" r="1.8" fill="' + ART.black + '"/>' +
    '<path d="M56 13 L66 14 L70 11 M66 14 L70 17" fill="none" stroke="' + ART.red + '" stroke-width="2" stroke-linecap="round"/>' +
    [[26, 60], [32, 61], [38, 62]].map(([x, y], i) => '<ellipse cx="' + x + '" cy="' + y + '" rx="3.6" ry="4.6" fill="' + (i % 2 ? ART.hi : ART.bone) + '" stroke="' + ART.ink + '" stroke-width="1.6"/>').join("") +
    artDie(62, 38, 24, [4], { red: 4, rotate: 10 }),
  snakeEyes: () => // two 1s staring back, with snake pupils
    [[18, -8], [54, 8]].map(([x, r]) => '<g transform="rotate(' + r + ' ' + (x + 14) + ' 35)"><rect x="' + x + '" y="21" width="28" height="28" rx="6" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
      '<ellipse cx="' + (x + 14) + '" cy="35" rx="7" ry="5.5" fill="#9be35f" stroke="' + ART.ink + '" stroke-width="1.4"/><rect x="' + (x + 12.8) + '" y="30" width="2.4" height="10" rx="1.2" fill="' + ART.black + '"/></g>').join("") +
    '<path d="M50 52 V60 L46 65 M50 60 L54 65" fill="none" stroke="' + ART.red + '" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>',
  mirrorDice: () => // a die and its reflection
    '<line x1="50" y1="8" x2="50" y2="62" stroke="' + ART.hi + '" stroke-width="2" stroke-dasharray="3 3"/>' +
    artDie(16, 21, 28, [0, 4, 8], { red: 4, rotate: -10 }) +
    '<g opacity="0.6">' + artDie(56, 21, 28, [2, 4, 6], { red: 4, rotate: 10 }) + "</g>",
  boxcars: () => // a pair of 6s riding in a railway boxcar
    artDie(26, 11, 23, [0, 2, 3, 5, 6, 8], { rotate: -6 }) + artDie(51, 11, 23, [0, 2, 3, 5, 6, 8], { rotate: 7 }) +
    '<rect x="16" y="32" width="68" height="22" rx="2" fill="#7a3a22" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M30 32 V54 M50 32 V54 M70 32 V54" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    '<path d="M8 62 H92" stroke="' + ART.hi + '" stroke-width="2"/>' +
    [26, 40, 60, 74].map((x) => '<circle cx="' + x + '" cy="58" r="4.5" fill="' + ART.black + '" stroke="' + ART.bone2 + '" stroke-width="1.8"/>').join(""),
  twinSouls: () => // two ghosts rising from a pair
    [[34, -1], [66, 1]].map(([x, d]) => '<path d="M' + (x - 13) + ' 52 V26 Q' + (x - 13) + ' 10 ' + x + ' 10 Q' + (x + 13) + ' 10 ' + (x + 13) + ' 26 V52 L' + (x + 8) + ' 47 L' + (x + 4) + ' 52 L' + x + ' 47 L' + (x - 4) + ' 52 L' + (x - 8) + ' 47 Z" fill="' + ART.bone + '" opacity="0.92" stroke="' + ART.ink + '" stroke-width="' + ART.w + '" stroke-linejoin="round"/>' +
      '<ellipse cx="' + (x - 4 + d * 2) + '" cy="26" rx="2.6" ry="3.6" fill="' + ART.black + '"/><ellipse cx="' + (x + 4 + d * 2) + '" cy="26" rx="2.6" ry="3.6" fill="' + ART.black + '"/>').join("") +
    artDie(36, 50, 13, [0, 8], { rotate: -10 }) + artDie(51, 50, 13, [0, 8], { rotate: 10 }) +
    '<path d="M47 36 Q50 32 53 36" fill="none" stroke="' + ART.red + '" stroke-width="2" stroke-linecap="round"/>',
  // ---------- Hot streak ----------
  hotHand: () => // an open palm in flames
    artFlame(30, 64, 44, 22) + artFlame(70, 64, 44, 22) + artFlame(50, 60, 58, 30) +
    '<path d="M36 64 L36 40 Q36 36 39.5 36 Q43 36 43 40 L43 24 Q43 20 46.5 20 Q50 20 50 24 L50 22 Q50 18 53.5 18 Q57 18 57 22 L57 26 Q57 22 60.5 22 Q64 22 64 26 L64 50 Q64 66 52 66 L42 66 Q36 66 36 64 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M36 50 Q30 44 26 40 Q24 36 28 35 Q32 35 38 42" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M43 40 V30 M50 38 V26 M57 40 V30" stroke="' + ART.ink + '" stroke-width="1.4" opacity="0.5"/>',
  pointCollector: () => // the ON puck and a row of points collected
    '<circle cx="30" cy="30" r="17" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<text x="30" y="35.5" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="14" fill="' + ART.black + '">ON</text>' +
    [[56, 48, "4"], [70, 38, "6"], [84, 28, "9"], [62, 22, "10"]].map(([x, y, n]) => '<circle cx="' + x + '" cy="' + y + '" r="9.5" fill="#1a1212" stroke="' + ART.gold + '" stroke-width="2"/>' +
      '<text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="' + (n.length > 1 ? 9 : 11) + '" fill="' + ART.gold + '">' + n + "</text>").join("") +
    '<path d="M14 58 Q30 62 46 54" fill="none" stroke="' + ART.red + '" stroke-width="2" stroke-dasharray="2 3" stroke-linecap="round"/>',
  rodsLighter: () => // Hot Rod's flip lighter, lit
    artFlame(52, 30, 26, 11) +
    '<rect x="34" y="30" width="30" height="34" rx="4" fill="' + ART.bone2 + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M34 40 H64" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    '<path d="M34 30 L24 16 Q22 12 26 12 L34 14" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '" stroke-linejoin="round"/>' +
    '<rect x="44" y="26" width="14" height="5" rx="1" fill="' + ART.hi + '" stroke="' + ART.ink + '" stroke-width="1.4"/>' +
    '<path d="M41 50 L49 46 L45 56 L55 50" fill="none" stroke="' + ART.red + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  comebackKid: () => // a line that crashes on a 7, then climbs back past where it started
    '<path d="M10 24 L30 30 L42 58 L58 36 L72 40 L88 12" fill="none" stroke="' + ART.ink + '" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M10 24 L30 30 L42 58 L58 36 L72 40 L88 12" fill="none" stroke="' + ART.bone + '" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M76 12 L89 10 L87 23" fill="none" stroke="' + ART.gold + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<circle cx="42" cy="58" r="7" fill="' + ART.red + '" stroke="' + ART.ink + '" stroke-width="1.6"/><text x="42" y="62" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="10" fill="' + ART.bone + '">7</text>',
  heater: () => // a thermometer climbing into the red
    '<rect x="44" y="8" width="12" height="44" rx="6" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<rect x="47.5" y="18" width="5" height="36" rx="2.5" fill="' + ART.red + '"/>' +
    '<circle cx="50" cy="56" r="9" fill="' + ART.red + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/><circle cx="47" cy="53" r="2.2" fill="#ff8a7a"/>' +
    [16, 24, 32, 40].map((y) => '<path d="M57 ' + y + ' H62" stroke="' + ART.ink + '" stroke-width="1.6"/>').join("") +
    artFlame(28, 62, 30, 13) + artFlame(74, 62, 30, 13) +
    '<path d="M66 16 L72 10 M70 22 L78 20" stroke="' + ART.gold + '" stroke-width="2.2" stroke-linecap="round"/>',
  longNight: () => // a candle burned low under the moon
    '<path d="M74 8 A11 11 0 1 0 84 26 A9 9 0 1 1 74 8 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="1.8"/>' +
    '<ellipse cx="44" cy="62" rx="22" ry="5" fill="' + ART.hi + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M34 60 V34 Q34 31 37 32 Q44 34 51 32 Q54 31 54 34 V60 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M38 33 V42 Q38 45 40 45 Q42 45 42 42 V34 M49 33 V48 Q49 51 51 51 Q53 51 53 48 V36" fill="' + ART.bone2 + '" stroke="' + ART.ink + '" stroke-width="1.4"/>' +
    '<path d="M44 33 V28" stroke="' + ART.black + '" stroke-width="1.6"/>' + artFlame(44, 29, 17, 6),
  torchPass: () => // a torch handed on to the next shooter
    '<path d="M62 30 Q84 30 86 50" fill="none" stroke="' + ART.gold + '" stroke-width="3" stroke-dasharray="4 4" stroke-linecap="round"/>' +
    '<path d="M80 46 L86 54 L91 45" fill="none" stroke="' + ART.gold + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M22 64 L44 28" stroke="' + ART.ink + '" stroke-width="8" stroke-linecap="round"/><path d="M22 64 L44 28" stroke="' + ART.hi + '" stroke-width="4.5" stroke-linecap="round"/>' +
    '<path d="M38 32 L50 39 L54 31 L42 24 Z" fill="' + ART.bone2 + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '" stroke-linejoin="round"/>' +
    artFlame(48, 28, 26, 13),
  // ---------- Money ----------
  loanShark: () => // a shark fin circling a pile of coins
    '<path d="M6 50 Q20 44 34 50 T62 50 T94 50" fill="none" stroke="' + ART.hi + '" stroke-width="2.4"/>' +
    '<path d="M30 50 Q44 12 62 8 Q58 28 66 50 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    artStack(76, 62, 3, 9) + artStack(20, 62, 2, 8) +
    '<path d="M74 18 L82 26 M82 18 L74 26" stroke="' + ART.red + '" stroke-width="3" stroke-linecap="round"/>',
  greenDice: () => // green dice showing 12, interest going up
    artDie(14, 26, 28, [0, 2, 3, 5, 6, 8], { fill: "#5fb07a", rotate: -8 }) + artDie(44, 26, 28, [0, 2, 3, 5, 6, 8], { fill: "#5fb07a", rotate: 8 }) +
    '<text x="86" y="34" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="20" fill="' + ART.gold + '" stroke="' + ART.ink + '" stroke-width="1">%</text>' +
    '<path d="M86 60 V42 M80 48 L86 42 L92 48" fill="none" stroke="' + ART.gold + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  compound: () => // coin stacks that keep growing
    artStack(24, 62, 2) + artStack(46, 62, 4) + artStack(68, 62, 7) +
    '<path d="M14 40 Q40 38 58 22 Q66 15 76 10" fill="none" stroke="' + ART.ink + '" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M14 40 Q40 38 58 22 Q66 15 76 10" fill="none" stroke="' + ART.bone + '" stroke-width="3" stroke-linecap="round"/>' +
    '<path d="M70 6 L80 8 L76 18" fill="none" stroke="' + ART.bone + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>',
  stash: () => // a jar of coins hidden away
    '<path d="M32 22 Q30 26 30 32 V58 Q30 64 36 64 H64 Q70 64 70 58 V32 Q70 26 68 22 Z" fill="' + ART.bone + '" fill-opacity="0.25" stroke="' + ART.bone + '" stroke-width="' + ART.w + '"/>' +
    artStack(42, 60, 4, 7) + artStack(58, 60, 3, 7) + artCoin(50, 46, 7) +
    '<rect x="34" y="14" width="32" height="9" rx="2" fill="' + ART.hi + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M38 34 Q36 44 38 54" fill="none" stroke="#fff" stroke-width="2" opacity="0.5" stroke-linecap="round"/>',
  earlyBird: () => // a bird at sunrise with a coin in its beak
    '<path d="M10 52 A40 40 0 0 1 90 52 Z" fill="' + ART.gold + '" opacity="0.25"/><path d="M26 52 A24 24 0 0 1 74 52 Z" fill="' + ART.gold + '" opacity="0.55"/>' +
    '<path d="M4 52 H96" stroke="' + ART.hi + '" stroke-width="2"/>' +
    '<ellipse cx="44" cy="40" rx="14" ry="9" fill="' + ART.black + '" stroke="' + ART.bone + '" stroke-width="1.6"/>' +
    '<path d="M34 36 Q40 26 50 34" fill="#1a1212" stroke="' + ART.bone + '" stroke-width="1.6"/>' +
    '<path d="M31 40 L20 36 L30 46 Z" fill="' + ART.black + '" stroke="' + ART.bone + '" stroke-width="1.6" stroke-linejoin="round"/>' +
    '<circle cx="57" cy="32" r="7" fill="' + ART.black + '" stroke="' + ART.bone + '" stroke-width="1.6"/><circle cx="59" cy="30.5" r="1.4" fill="' + ART.bone + '"/>' +
    '<path d="M63 32 L70 34 L63 36 Z" fill="' + ART.hi + '"/>' +
    '<circle cx="74" cy="35" r="6" fill="' + ART.gold + '" stroke="' + ART.ink + '" stroke-width="1.6"/><text x="74" y="38.5" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="8" fill="' + ART.ink + '">$</text>' +
    '<path d="M42 49 V54 M48 49 V54" stroke="' + ART.hi + '" stroke-width="1.6"/>',
  // ---------- No theme ----------
  luckySeven: () => // a lucky 7 with a four-leaf clover
    artBigText(44, 62, 64, "7") +
    [[0, -6], [6, 0], [0, 6], [-6, 0]].map(([dx, dy]) => '<circle cx="' + (76 + dx) + '" cy="' + (22 + dy) + '" r="5.5" fill="#3f9a5a" stroke="' + ART.ink + '" stroke-width="1.4"/>').join("") +
    '<path d="M76 22 Q78 32 74 38" fill="none" stroke="#2f6e40" stroke-width="2"/>',
  redDice: () => // red dice showing craps (1 + 2)
    artDie(16, 22, 30, [4], { fill: "#b8322a", pip: ART.bone, rotate: -10 }) + artDie(54, 22, 30, [0, 8], { fill: "#b8322a", pip: ART.bone, rotate: 10 }) +
    '<path d="M42 60 Q50 66 58 60" fill="none" stroke="' + ART.gold + '" stroke-width="2.4" stroke-linecap="round"/>',
  oddsAddict: () => // a tall stack of chips behind the line, paying 3 to 2
    artChipStack(30, 62, 4, "#b8322a") + artChipStack(52, 62, 8, "#2c6e8f") +
    '<path d="M14 64 H70" stroke="' + ART.bone + '" stroke-width="2.4"/>' +
    '<rect x="66" y="12" width="28" height="18" rx="3" fill="' + ART.gold + '" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    '<text x="80" y="25" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="11" fill="' + ART.ink + '">3:2</text>',
  pity: () => // the 7 that didn't count: patched up with a bandage
    artBigText(50, 62, 62, "7", ART.red) +
    '<g transform="rotate(-25 50 36)"><rect x="24" y="30" width="52" height="13" rx="6" fill="' + ART.bone2 + '" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    '<rect x="42" y="30" width="16" height="13" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="1"/>' +
    [44, 48, 52, 56].map((x) => '<circle cx="' + x + '" cy="36.5" r="0.9" fill="' + ART.hi + '"/>').join("") + "</g>",
  muggsy: () => // a mugshot board: x3 for the next shooter
    [16, 26, 36, 46].map((y) => '<path d="M6 ' + y + ' H94" stroke="' + ART.hi + '" stroke-width="1" opacity="0.5"/>').join("") +
    '<path d="M38 10 Q50 2 62 10 L64 18 H36 Z" fill="#2a2420" stroke="' + ART.bone + '" stroke-width="1.6"/>' +
    '<path d="M34 18 H68" stroke="' + ART.bone + '" stroke-width="2"/>' +
    '<rect x="24" y="34" width="52" height="28" rx="2" fill="' + ART.black + '" stroke="' + ART.bone + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M36 34 L50 24 L64 34" fill="none" stroke="' + ART.hi + '" stroke-width="1.4"/>' +
    '<text x="50" y="55" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="18" fill="' + ART.red + '">x3</text>',
  loadedDie: () => // a die with a lead weight showing inside
    artDie(30, 14, 40, [0, 2, 3, 5, 6, 8], { rotate: -8 }) +
    '<g transform="rotate(-8 50 34)"><rect x="40" y="40" width="20" height="14" rx="3" fill="#6f6a66" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    '<text x="50" y="51" text-anchor="middle" font-family="Georgia,serif" font-weight="bold" font-size="9" fill="' + ART.bone + '">Pb</text></g>' +
    '<path d="M22 60 H30 M70 60 H78 M50 62 V68" stroke="' + ART.gold + '" stroke-width="2" stroke-linecap="round"/>',
  reroll: () => // two dice inside a circle of arrows
    '<path d="M24 20 A30 30 0 0 1 80 26" fill="none" stroke="' + ART.gold + '" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M76 50 A30 30 0 0 1 20 44" fill="none" stroke="' + ART.gold + '" stroke-width="3.4" stroke-linecap="round"/>' +
    '<path d="M72 20 L81 27 L84 16 M28 50 L19 43 L16 54" fill="none" stroke="' + ART.gold + '" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    artDie(28, 22, 22, [0, 4, 8], { rotate: -12 }) + artDie(52, 24, 22, [0, 2, 6, 8], { red: -1, rotate: 14 }),
  bargain: () => // the dealer's contract, sealed in red, with an extra link
    '<path d="M22 10 H70 Q76 10 76 16 V60 H28 Q22 60 22 54 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M18 60 Q18 66 24 66 H74 Q80 66 80 60 V58 H28 Q24 58 24 62" fill="' + ART.bone2 + '" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    [20, 27, 34, 41].map((y, i) => '<path d="M30 ' + y + " H" + (i === 3 ? 52 : 68) + '" stroke="' + ART.hi + '" stroke-width="1.6"/>').join("") +
    '<circle cx="62" cy="48" r="8" fill="' + ART.red + '" stroke="#7a1410" stroke-width="1.6"/><path d="M59 45 L65 51 M65 45 L59 51" stroke="#7a1410" stroke-width="1.4"/>' +
    '<ellipse cx="86" cy="34" rx="6" ry="10" fill="none" stroke="#6f6a66" stroke-width="4"/>',
  leftysGlove: () => // Lefty's leather glove, holding a 6
    '<path d="M64 64 L64 40 Q64 36 60.5 36 Q57 36 57 40 L57 24 Q57 20 53.5 20 Q50 20 50 24 L50 22 Q50 18 46.5 18 Q43 18 43 22 L43 26 Q43 22 39.5 22 Q36 22 36 26 L36 50 Q36 66 48 66 L58 66 Q64 66 64 64 Z" fill="#7a4a2a" stroke="' + ART.bone + '" stroke-width="1.8"/>' +
    '<path d="M64 50 Q70 44 74 40 Q76 36 72 35 Q68 35 62 42" fill="#7a4a2a" stroke="' + ART.bone + '" stroke-width="1.8"/>' +
    '<path d="M38 58 H62" stroke="' + ART.bone2 + '" stroke-width="3"/>' +
    artDie(16, 34, 20, [0, 2, 3, 5, 6, 8], { rotate: -14 }),
  deesLedger: () => // Dealer Dee's ledger and quill
    '<path d="M50 18 Q34 12 14 16 V60 Q34 56 50 62 Q66 56 86 60 V16 Q66 12 50 18 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<path d="M50 18 V62" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    [26, 33, 40, 47].map((y) => '<path d="M20 ' + y + ' H44 M56 ' + y + ' H80" stroke="' + ART.hi + '" stroke-width="1.2"/>').join("") +
    '<path d="M36 22 V54 M70 22 V54" stroke="' + ART.red + '" stroke-width="1" opacity="0.7"/>' +
    '<path d="M86 6 Q70 18 62 40 Q74 26 90 12 Z" fill="' + ART.bone2 + '" stroke="' + ART.ink + '" stroke-width="1.4"/><path d="M62 40 L60 46" stroke="' + ART.black + '" stroke-width="1.8"/>',
  ghostStory: () => // Ghost, with the dice faces he can choose between
    '<path d="M24 60 V30 Q24 10 42 10 Q60 10 60 30 V60 L54 54 L48 60 L42 54 L36 60 L30 54 Z" fill="#b6c8d4" opacity="0.9" stroke="' + ART.ink + '" stroke-width="' + ART.w + '" stroke-linejoin="round"/>' +
    '<ellipse cx="36" cy="30" rx="3.4" ry="5" fill="' + ART.black + '"/><ellipse cx="48" cy="30" rx="3.4" ry="5" fill="' + ART.black + '"/>' +
    '<ellipse cx="42" cy="42" rx="3" ry="4" fill="' + ART.black + '"/>' +
    artBigText(78, 26, 16, "2 4 6", ART.bone).replace('font-size="16"', 'font-size="11"') +
    '<path d="M68 33 H88" stroke="' + ART.hi + '" stroke-width="1.4"/>' +
    artBigText(78, 46, 16, "1 3 5", ART.bone).replace('font-size="16"', 'font-size="11"'),
  encore: () => // stage curtains around a spotlight
    '<ellipse cx="50" cy="60" rx="24" ry="6" fill="' + ART.gold + '" opacity="0.45"/><path d="M42 8 L58 8 L74 60 L26 60 Z" fill="' + ART.gold + '" opacity="0.14"/>' +
    '<path d="M4 4 H40 Q36 30 30 44 Q26 56 30 66 H4 Z" fill="#8e1f18" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    '<path d="M96 4 H60 Q64 30 70 44 Q74 56 70 66 H96 Z" fill="#8e1f18" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    '<path d="M14 6 Q16 36 12 64 M26 6 Q26 30 20 64 M86 6 Q84 36 88 64 M74 6 Q74 30 80 64" stroke="#5e130e" stroke-width="2" fill="none"/>' +
    '<path d="M4 4 H96 V12 Q75 18 50 12 Q25 18 4 12 Z" fill="#a8261d" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    '<path d="M50 30 L53.5 40 L64 40 L55.5 46 L58.5 56 L50 50 L41.5 56 L44.5 46 L36 40 L46.5 40 Z" fill="' + ART.gold + '" stroke="' + ART.ink + '" stroke-width="1.6" stroke-linejoin="round"/>',
  highRoller: () => // a top hat on a pile of big chips
    artChipStack(28, 64, 3, "#1a1212") + artChipStack(72, 64, 4, "#6b2d8f") +
    '<path d="M30 32 H70" stroke="' + ART.bone + '" stroke-width="5" stroke-linecap="round"/>' +
    '<path d="M38 32 V8 Q50 4 62 8 V32 Z" fill="#1a1212" stroke="' + ART.bone + '" stroke-width="1.8"/>' +
    '<rect x="38" y="24" width="24" height="5" fill="' + ART.red + '"/>' +
    artChip(50, 52, 11, "#b8322a", "$"),
  frontOfLine: () => // a first-place medal, red ribbon
    '<path d="M38 6 L50 30 L62 6" fill="none" stroke="' + ART.red + '" stroke-width="9"/><path d="M38 6 L50 30 L62 6" fill="none" stroke="#7a1410" stroke-width="1.4"/>' +
    '<circle cx="50" cy="44" r="18" fill="' + ART.gold + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/><circle cx="50" cy="44" r="13" fill="none" stroke="#a07a2e" stroke-width="1.6"/>' +
    artBigText(50, 52, 22, "1", ART.bone) +
    '<path d="M10 44 H24 M18 38 L24 44 L18 50" fill="none" stroke="' + ART.bone + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
  sleightOfHand: () => // a die slipping out of a sleeve
    '<path d="M2 22 L56 46 L48 64 L-4 40 Z" fill="#2a2420" stroke="' + ART.bone + '" stroke-width="1.8"/>' +
    '<path d="M52 40 L64 46 L56 66 L44 60 Z" fill="' + ART.bone + '" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    '<path d="M62 50 Q74 52 78 46 Q76 58 66 62" fill="' + ART.bone2 + '" stroke="' + ART.ink + '" stroke-width="1.6"/>' +
    artDie(64, 12, 22, [0, 2, 4, 6, 8], { red: 4, rotate: 18 }) +
    '<path d="M60 36 Q64 30 68 32 M56 30 Q58 24 62 24" fill="none" stroke="' + ART.gold + '" stroke-width="1.8" stroke-linecap="round"/>',
  steadyHand: () => // a spirit level holding a 6 and an 8 perfectly flat
    artChip(32, 26, 13, "#b8322a", "6") + artChip(68, 26, 13, "#2c6e8f", "8") +
    '<rect x="10" y="44" width="80" height="14" rx="3" fill="' + ART.gold + '" stroke="' + ART.ink + '" stroke-width="' + ART.w + '"/>' +
    '<rect x="38" y="47" width="24" height="8" rx="4" fill="#cfe9a8" stroke="' + ART.ink + '" stroke-width="1.4"/><circle cx="50" cy="51" r="2.6" fill="#fff" stroke="' + ART.ink + '" stroke-width="0.8"/>' +
    '<path d="M46 47 V55 M54 47 V55" stroke="' + ART.ink + '" stroke-width="1"/>',
  diceCollector: () => // a shelf of dice, one with a carved face, and a chisel
    '<path d="M6 56 H94" stroke="' + ART.hi + '" stroke-width="4"/><path d="M14 58 V66 M86 58 V66" stroke="' + ART.hi + '" stroke-width="3"/>' +
    artDie(10, 32, 22, [4], { red: 4 }) + artDie(39, 32, 22, [0, 2, 3, 5, 6, 8]) + artDie(68, 32, 22, [0, 4, 8], { fill: ART.gold }) +
    '<path d="M60 6 L80 26" stroke="' + ART.ink + '" stroke-width="7" stroke-linecap="round"/><path d="M60 6 L72 18" stroke="' + ART.hi + '" stroke-width="4" stroke-linecap="round"/>' +
    '<path d="M72 18 L82 28" stroke="#9a9a9a" stroke-width="4" stroke-linecap="square"/>',
  chainLink: () => // the Spare Link: one glowing gold link between two rusty broken ones
    '<ellipse cx="50" cy="36" rx="30" ry="28" fill="' + ART.gold + '" opacity="0.12"/>' +
    [[18, 50], [82, 22]].map(([x, y]) => '<g transform="rotate(60 ' + x + " " + y + ')"><path d="M' + (x - 7) + " " + (y - 2) + " V" + (y - 8) + " Q" + (x - 7) + " " + (y - 16) + " " + x + " " + (y - 16) + " Q" + (x + 7) + " " + (y - 16) + " " + (x + 7) + " " + (y - 8) + " V" + (y - 2) + '" fill="none" stroke="#6f6a66" stroke-width="5" stroke-linecap="round"/></g>').join("") +
    '<g transform="rotate(-30 50 36)"><rect x="38" y="12" width="24" height="48" rx="12" fill="none" stroke="' + ART.ink + '" stroke-width="11"/>' +
    '<rect x="38" y="12" width="24" height="48" rx="12" fill="none" stroke="' + ART.gold + '" stroke-width="6.5"/>' +
    '<path d="M42 18 Q44 14 50 14" fill="none" stroke="#fff3c4" stroke-width="2.2" stroke-linecap="round"/></g>' +
    [[22, 14], [84, 52], [74, 10]].map(([x, y]) => '<path d="M' + x + " " + (y - 5) + " L" + (x + 1.5) + " " + (y - 1.5) + " L" + (x + 5) + " " + y + " L" + (x + 1.5) + " " + (y + 1.5) + " L" + x + " " + (y + 5) + " L" + (x - 1.5) + " " + (y + 1.5) + " L" + (x - 5) + " " + y + " L" + (x - 1.5) + " " + (y - 1.5) + ' Z" fill="#fff3c4"/>').join(""),
};

// A card's art as an SVG string. cls: the CSS class ("card-art", "hand-art"...).
let cardArtCount = 0;
function cardArt(id, cls) {
  const card = CARDS[id] || {};
  const tint = CARD_ART_TINT[card.theme] || CARD_ART_TINT.none;
  const gid = "cart" + cardArtCount++; // each picture needs its own gradient id
  const symbol = CARD_ART[id] ? CARD_ART[id]() : artDie(36, 21, 28, [0, 4, 8], { red: 4, rotate: -8 });
  // Hand tiles show a short strip from the middle of the picture.
  const fit = cls === "hand-art" ? ' preserveAspectRatio="xMidYMid slice"' : "";
  return '<svg class="' + (cls || "card-art") + '" viewBox="0 0 100 70"' + fit + ' xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<defs><radialGradient id="' + gid + '" cx="0.5" cy="0" r="1"><stop offset="0" stop-color="' + tint + '"/><stop offset="1" stop-color="#0b0807"/></radialGradient></defs>' +
    '<rect width="100" height="70" fill="url(#' + gid + ')"/><rect width="100" height="70" fill="#000" opacity="0.25"/>' + symbol +
    '<rect x="1" y="1" width="98" height="68" fill="none" stroke="#5c4a3a" stroke-width="2" rx="4"/></svg>';
}

// Locked cards in the Collection: a dark panel with a padlock (gives nothing away).
function lockedCardArt(cls) {
  return '<svg class="' + (cls || "card-art") + '" viewBox="0 0 100 70" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<rect width="100" height="70" fill="#0f0b09"/>' +
    '<path d="M40 34 V26 Q40 16 50 16 Q60 16 60 26 V34" fill="none" stroke="#4a3a2c" stroke-width="5"/>' +
    '<rect x="34" y="32" width="32" height="24" rx="4" fill="#2a2018" stroke="#4a3a2c" stroke-width="2.4"/><circle cx="50" cy="42" r="3" fill="#0f0b09"/><path d="M50 44 V50" stroke="#0f0b09" stroke-width="2.4"/>' +
    '<rect x="1" y="1" width="98" height="68" fill="none" stroke="#2a2018" stroke-width="2" rx="4"/></svg>';
}
