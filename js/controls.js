// Display: extra ways to play.
// 1. Keyboard shortcuts (computers). Each key presses the same button a player would tap,
//    so every rule and guard still applies. The list shows in Settings.
// 2. Dragging chips onto bets, and bets back onto the chips.
// 3. Press-and-hold help (phones): hold a finger on anything with hover help for half a second
//    and a bubble explains it. Holding never presses the thing underneath.

// ---------- Keyboard shortcuts ----------

const KEY_HELP = [
  ["Space", "roll, or continue (next shooter, close a popup)"],
  ["1 2 3", "pick the small, middle or big chip"],
  ["P", "Pass Line"], ["D", "Don't Pass"], ["O", "Odds (or Lay Odds)"], ["M", "max Odds (or Lay Odds)"], ["F", "Field"],
  ["C", "clear your bets"], ["X", "take-back chip: tap a bet to take a chip off"], ["S", "same bets as saved"],
  ["I / T", "your Inventory / the Table"], ["K", "Collection"], ["Esc", "close what's open"],
];

// Is this element showing? (Pop-ups are fixed-position, so check their style, not offsetParent.)
function shown(id) {
  const el = document.getElementById(id);
  return !!el && !el.classList.contains("hidden") && getComputedStyle(el).display !== "none";
}

function press(selector) {
  const el = typeof selector === "string" ? document.querySelector(selector) : selector;
  if (el && !el.disabled && (el.offsetParent !== null || getComputedStyle(el).position === "fixed")) {
    el.click();
    return true;
  }
  return false;
}

// Something covers the table (bets and chips keys do nothing then).
function tableCovered() {
  return ["splash", "tutorial", "phone", "choice", "reroll-prompt", "workshop", "end-screen", "settings", "collection", "break-screen", "fall-scene", "opening"].some(shown);
}

// Space: whatever "carry on" means right now.
function keyContinue() {
  if (shown("opening")) return press("#opening");
  if (shown("splash")) return press(".splash-continue") || press("#splash");
  if (shown("tutorial")) return press("#tutorial-next");
  if (shown("coach") && press("#coach-ok")) return true;
  if (["phone", "choice", "reroll-prompt", "workshop", "settings", "collection"].some(shown)) return false; // these need a real choice
  if (shown("end-screen")) return !hasEscaped(state) && press("#play-again"); // never pick Double or nothing for you
  if (shown("break-screen")) return press("#leave-break");
  return press("#roll-button");
}

function keyEscape() {
  if (shown("choice") && press("#choice-buttons .choice-cancel")) return true;
  if (shown("workshop")) return press("#workshop-cancel");
  if (shown("collection")) return press("#collection-close");
  if (shown("settings")) return press("#settings-close");
  if (shown("tutorial")) return press("#tutorial-skip");
  if (shown("splash")) return press(".splash-continue") || press("#splash");
  if (shown("opening")) return press("#opening");
  return false;
}

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const typing = e.target && (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT");
  if (typing && e.key !== "Escape") return;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  let handled = false;
  if (key === " " || key === "Enter") handled = keyContinue() || key === " ";
  else if (key === "Escape") handled = keyEscape();
  else if (key === "k") handled = shown("collection") ? press("#collection-close") : press("#collection-button");
  else if (!tableCovered()) {
    if (["1", "2", "3"].includes(key)) handled = press("#chips .chip:nth-child(" + key + ")");
    else if (key === "p") handled = press("#pass-line");
    else if (key === "d") handled = press("#dont-pass");
    else if (key === "o") handled = press(state.bets.dont > 0 ? "#lay" : "#odds");
    else if (key === "m") handled = press(state.bets.dont > 0 ? "#lay-max" : "#odds-max");
    else if (key === "f") handled = press("#field");
    else if (key === "c") handled = press("#clear-button");
    else if (key === "x") handled = press("#chips .chip-take-back");
    else if (key === "s") handled = press("#same-bets");
    else if (key === "i" || key === "h") { showTab("hand"); handled = true; }
    else if (key === "t") { showTab("table"); handled = true; }
  }
  if (handled) {
    e.preventDefault(); // no page scroll, and a focused button isn't pressed a second time
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
});
// Space presses a focused button when the key comes back up: stop that too.
document.addEventListener("keyup", (e) => {
  const typing = e.target && (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT");
  if (e.key === " " && !typing) e.preventDefault();
});

// The list in Settings.
function keyHelpHtml() {
  return KEY_HELP.map(([k, what]) => "<span class=\"key-row\"><kbd>" + k + "</kbd> " + what + "</span>").join("");
}

// ---------- Dragging chips ----------
// Drag a chip onto a bet to place it (same as picking the chip and tapping the bet).
// Drag a bet back onto the chips to take one table minimum off it. Tapping still works.

let drag = null; // { kind: "chip" | "bet", value, bet, x, y, ghost, over }
let dragSwallow = false;

// Which bet a screen element belongs to (or null).
function betAt(el) {
  const area = el && el.closest && el.closest(".bet-area");
  if (!area) return null;
  return MAIN_BET_IDS[area.id] || area.dataset.bet || null;
}

function dragTarget(x, y, kind) {
  const el = document.elementFromPoint(x, y);
  if (!el) return null;
  if (kind === "chip") {
    const bet = betAt(el);
    return bet ? { el: el.closest(".bet-area"), bet: bet } : null;
  }
  const tray = el.closest("#chips, .chip-row, .controls");
  return tray ? { el: document.getElementById("chips") } : null;
}

// A chip's paint (its gradient, or plain colour) so the dragged copy looks the same.
function chipPaint(chip) {
  const cs = getComputedStyle(chip);
  return cs.backgroundImage && cs.backgroundImage !== "none" ? cs.backgroundImage : cs.backgroundColor;
}

document.addEventListener("pointerdown", (e) => {
  if (e.button > 0 || !e.isPrimary) return;
  const chip = e.target.closest && e.target.closest("#chips .chip:not(.chip-take-back)");
  if (chip) {
    const value = Number(chip.dataset.value);
    if (value) drag = { kind: "chip", value: value, label: chip.textContent, colour: chipPaint(chip), x: e.clientX, y: e.clientY };
    return;
  }
  const bet = betAt(e.target);
  if (bet && state.bets[bet] > 0 && !takeBackMode && !e.target.closest(".max-odds")) {
    drag = { kind: "bet", bet: bet, label: "−" + shortMoney(Math.min(tableMin(state), state.bets[bet])), x: e.clientX, y: e.clientY };
  }
});

document.addEventListener("pointermove", (e) => {
  if (!drag) return;
  if (!drag.ghost) {
    if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 12) return;
    drag.ghost = document.createElement("div");
    drag.ghost.className = "chip-ghost" + (drag.kind === "bet" ? " taking" : "");
    drag.ghost.textContent = drag.label;
    if (drag.colour) drag.ghost.style.background = drag.colour; // the same colour as the chip you picked up
    document.body.appendChild(drag.ghost);
    document.body.classList.add("dragging-" + drag.kind);
  }
  drag.ghost.style.left = e.clientX + "px";
  drag.ghost.style.top = e.clientY + "px";
  const target = dragTarget(e.clientX, e.clientY, drag.kind);
  const el = target && target.el;
  if (drag.over !== el) {
    if (drag.over) drag.over.classList.remove("drop-here");
    if (el) el.classList.add("drop-here");
    drag.over = el;
  }
  e.preventDefault();
}, { passive: false });

function endDrag(e, cancelled) {
  if (!drag) return;
  const d = drag;
  drag = null;
  if (!d.ghost) return; // it was a tap: the normal click handles it
  d.ghost.remove();
  if (d.over) d.over.classList.remove("drop-here");
  document.body.classList.remove("dragging-chip", "dragging-bet");
  dragSwallow = true; // the click that follows a drag isn't a tap
  setTimeout(() => { dragSwallow = false; }, 0);
  if (cancelled) return;
  const target = dragTarget(e.clientX, e.clientY, d.kind);
  if (!target) return;
  if (d.kind === "chip") {
    pickChip(d.value);
    placeBet(target.bet);
  } else {
    takeOffBet(d.bet, tableMin(state));
  }
}
document.addEventListener("pointerup", (e) => endDrag(e, false));
document.addEventListener("pointercancel", (e) => endDrag(e, true));
document.addEventListener("click", (e) => {
  if (!dragSwallow) return;
  dragSwallow = false;
  e.stopPropagation();
  e.preventDefault();
}, true);

// ---------- Press-and-hold help (phones) ----------

const HOLD_MS = 450;
let holdTimer = null;
let holdStart = null;
let holdShown = false;
let swallowClick = false;

// The help for an element: its hover text, or a crew seat's tooltip.
function holdHelpFor(target) {
  const el = target.closest("[title], .seat");
  if (!el) return null;
  const tip = el.classList.contains("seat") ? el.querySelector(".tooltip") : null;
  if (tip) return { el: el, html: tip.innerHTML };
  return el.getAttribute("title") ? { el: el, text: el.getAttribute("title") } : null;
}

function showHoldHelp(help, x, y) {
  const bubble = document.getElementById("hold-help");
  if (help.html) bubble.innerHTML = help.html; else bubble.textContent = help.text;
  bubble.classList.remove("hidden");
  const b = bubble.getBoundingClientRect();
  const left = Math.min(Math.max(8, x - b.width / 2), window.innerWidth - b.width - 8);
  const top = y - b.height - 24 > 8 ? y - b.height - 24 : Math.min(y + 24, window.innerHeight - b.height - 8); // above the finger if there's room
  bubble.style.left = left + "px";
  bubble.style.top = top + "px";
  holdShown = true;
}

function hideHoldHelp() {
  document.getElementById("hold-help").classList.add("hidden");
  holdShown = false;
}

document.addEventListener("pointerdown", (e) => {
  swallowClick = false; // only the click right after a hold is swallowed
  if (holdShown) hideHoldHelp();
  if (e.pointerType === "mouse") return; // a mouse has hover help already
  const help = holdHelpFor(e.target);
  if (!help) return;
  holdStart = { x: e.clientX, y: e.clientY };
  clearTimeout(holdTimer);
  holdTimer = setTimeout(() => {
    if (!holdStart) return;
    showHoldHelp(help, holdStart.x, holdStart.y);
    swallowClick = true; // the finger lifting shouldn't press it
  }, HOLD_MS);
});
document.addEventListener("pointermove", (e) => {
  if (holdStart && Math.hypot(e.clientX - holdStart.x, e.clientY - holdStart.y) > 10) clearTimeout(holdTimer); // scrolling, not holding
});
for (const type of ["pointerup", "pointercancel"]) {
  document.addEventListener(type, () => {
    clearTimeout(holdTimer);
    holdStart = null;
    if (holdShown) setTimeout(hideHoldHelp, 2500);
  });
}
// Swallow the click that follows a hold (capture phase, before any button sees it).
document.addEventListener("click", (e) => {
  if (!swallowClick) return;
  swallowClick = false;
  e.stopPropagation();
  e.preventDefault();
}, true);
// A long press can also open the phone's own menu: not while our bubble shows.
document.addEventListener("contextmenu", (e) => {
  if (holdShown || holdStart) e.preventDefault();
});

// ---------- Android app (Capacitor) ----------
// The back button closes whatever is open (like Esc); with nothing open it asks before leaving.
// Pausing sound in the background: music.js pauses the music; sound effects stop here.
(function androidApp() {
  const cap = typeof window !== "undefined" ? window.Capacitor : null;
  // The app loads Capacitor's core script (tools/copy-web.js), which can register the App plugin by name.
  const app = cap && ((cap.Plugins && cap.Plugins.App) || (cap.registerPlugin && cap.isNativePlatform && cap.isNativePlatform() ? cap.registerPlugin("App") : null));
  if (app && app.addListener) {
    app.addListener("backButton", () => {
      if (keyEscape()) return;
      if (window.confirm("Leave Chained Dice? Your run is saved.")) app.exitApp();
    });
  }
  document.addEventListener("visibilitychange", () => {
    const ctx = typeof audio !== "undefined" ? audio : null; // sound.js's Web Audio context, if it exists yet
    if (!ctx) return;
    if (document.hidden) ctx.suspend().catch(() => {});
    else ctx.resume().catch(() => {});
  });
})();
