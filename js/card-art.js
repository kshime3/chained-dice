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
