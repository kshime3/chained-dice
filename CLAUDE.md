# Chained Dice

A Craps-themed roguelike browser game (in the style of Balatro and Clover Pit). You wake up chained to a craps table with your crew. Pay the dealer's debt each shift to break a link of your 8-link chain; break all 8 to walk out free (then optional endless mode). Fail and the floor opens. Full design: `docs/DESIGN.md`; game wording: `docs/WORDING.md`.

The owner is a beginner coder working about an hour a day.

## Working rules

- Plain HTML, CSS, and JavaScript. No frameworks or build tools unless the owner approves.
- The game must run by opening `index.html` in a browser, and be easy to host free (itch.io or GitHub Pages).
- Placeholder art and sound are fine (shapes, colors, text).
- One small milestone at a time. After each, give exact browser test steps, then wait for feedback.
- Commit after each working milestone with a clear message.
- Game logic (dice, bets, crew, shop) lives in separate JS files from display code.
- Every tunable number (buy-in, target, payouts, prices, rarity) lives in `js/config.js`.
- Explain things in plain language. Ask before big decisions.
- **Every milestone ends with a balance retest:** run `tools/simulate.js` (teach the bots any new mechanic first), compare per-shift survival with the last entry in `docs/BALANCE.md`, retune `CONFIG.shifts` if the curve drifts, and record the results there. The game should take many playthroughs to beat.
- **Cache-busting:** index.html loads every CSS/JS file with `?v=YYYYMMDDx`. When committing a change to css/ or js/, bump that tag everywhere in index.html (one sed), so players' browsers fetch the new files together instead of mixing old and new.
- **Never publish the game anywhere (itch.io or any other site) without the owner's explicit permission.** The owner shares the GitHub Pages link with friends themselves.

## Session routine

- **Start:** read this file and `docs/PROGRESS.md`, summarize where we are, propose the next step.
- **End:** update `docs/PROGRESS.md`, `docs/DECISIONS.md`, `docs/IDEAS.md` (and this file's layout section if files changed).

## File layout

```
CLAUDE.md          this file
docs/DESIGN.md     game design
docs/DECISIONS.md  dated decision log
docs/PROGRESS.md   dated session log and next step
docs/IDEAS.md      parked ideas and later features
docs/BALANCE.md    simulator results and balance recommendations
docs/WORDING.md    approved game wording (Break the Chain theme)
index.html         the game page (open this to play)
tests.html         rule checks: open to see green/red results
css/style.css      colors and layout
js/config.js       ALL tunable numbers
js/dice.js         logic: rolling dice
js/bets.js         logic: settling bets
js/shift.js        logic: shift turns, roster vs shooting order, hiring, dealer breaks and deposits, win/fall checks
js/crew.js         logic: each shooter's dice, mult, crew synergies, hover text (incl. hireable crew)
js/cards.js        logic: what each shop card does
js/shop.js         logic: shop stock, rarity, prices, buy/sell/shuffle
js/stats.js        logic: run stats for the end-of-run screen
js/perks.js        logic: Pit Boss phone perks
js/crafting.js     logic: dice crafting (editing faces of YOUR dice, 7-floor rule)
js/comps.js        logic: comps (one-use items: shop row, slots, armed for the next roll; dice edits)
js/save.js         logic: saving the run in progress (browser), cleared when the run ends
js/unlocks.js      logic: locked cards/comps/crew, hidden unlock goals, saved progress (browser)
js/rules.js        logic: house rules, boss rules, pit boss challenges
js/sound.js        display: sound effects made in the browser (Web Audio), mute setting
js/ui.js           display: drawing the screen
js/tutorials.js    display: tutorial pages (intro, shop, comps, phone) and "seen" memory
js/main.js         wires buttons to logic and display
demos/dice-3d.html  preview: three 3D dice styles to choose from (not part of the game)
tools/simulate.js  balance simulator (Node.js, not part of the game): node tools/simulate.js 20000
```
Testing shortcuts: add `?target=300` to the page address to set shift 1's debt; add `?fast` to skip the dice animation, splash screens and fall animation; add `?cards=doubleUp,greenDice` to start with those cards (ids are in js/cards.js). `?rule=houseDie` forces that house rule every shift (ids are in js/rules.js). `?unlockAll` makes everything available without touching saved progress. Combine with `&`, e.g. `?target=300&fast&cards=doublesCharm`.

tests.html pins its own numbers (shift 1: $200 cash, $2,000 debt, 6 seats, everything unlocked, progress never saved) so tuning config.js doesn't break the checks. Shift cash and debts are in `CONFIG.shifts`; the current debt is `state.debt`.

Scripts load with plain `<script>` tags in a set order (config, logic: dice, bets, crew, cards, shop, stats, perks, crafting, comps, unlocks, rules, save, shift; then display: sound, ui, tutorials; then main), not ES modules, so double-clicking index.html works.
