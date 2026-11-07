# Chained Dice

A Craps-themed roguelike browser game (in the style of Balatro and Clover Pit). You wake up chained to a craps table with your crew. Pay the dealer's debt each shift to break a link of your 8-link chain; break all 8 to walk out free (then optional endless mode). Fail and the floor opens. Full design: `docs/DESIGN.md`; game wording: `docs/WORDING.md`.

The owner is a beginner coder working about an hour a day.

## Working rules

- Plain HTML, CSS, and JavaScript. No frameworks or build tools unless the owner approves. (Approved 2026-11-01: Capacitor, only to wrap the game as an Android app. The game itself still needs no build step.)
- The game must run by opening `index.html` in a browser, and be easy to host free (itch.io or GitHub Pages).
- Placeholder art and sound are fine (shapes, colors, text).
- One small milestone at a time. After each, give exact browser test steps, then wait for feedback.
- Commit after each working milestone with a clear message.
- Game logic (dice, bets, crew, shop) lives in separate JS files from display code.
- Every tunable number (buy-in, target, payouts, prices, rarity) lives in `js/config.js`.
- Explain things in plain language. Ask before big decisions.
- **Full addresses (owner, 2026-11-10):** when giving the owner a testing shortcut, always write the entire URL, e.g. https://kshime3.github.io/chained-dice/?unlockAll (never just `?unlockAll`).
- **Owner's phone (2026-11-10): Google Pixel 9 Pro** (Android, Chrome; about 412px wide in the browser). Test layouts at its size too, and Android-only features (vibration) work on it.
- **Three options for major additions (owner, 2026-11-11):** for any major new image, animation or music addition (not a change to something existing), always show the owner 3 options to choose from first (a preview page in demos/ or screenshots), then build the chosen one.
- **Phone layouts only (owner, 2026-11-09):** design, test and screenshot for phone screens (portrait, about 360-430px wide). The computer layout is no longer a goal; don't spend effort on it.
- **Balance retest only when gameplay changes** (cards, comps, crew, bets, payouts, prices, debts, rules, shop, unlocks, or anything else that affects how the game plays): run `tools/simulate.js` (teach the bots any new mechanic first), compare per-shift survival with the last entry in `docs/BALANCE.md`, retune `CONFIG.shifts` if the curve drifts, and record the results there. Skip it for display, art, sound, music, wording, layout or docs changes (owner's call, 2026-10-31). The game should take many playthroughs to beat.
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
docs/ANDROID.md    the Android app plan: decisions, phases, checklist
index.html         the game page (open this to play)
tests.html         rule checks: open to see green/red results
privacy.html       privacy policy (linked in Settings; the Play listing needs it)
licenses.html      open-source licenses the Android app needs to show (Capacitor MIT, AndroidX/Cordova Apache 2.0, music CC BY)
css/style.css      colors and layout
img/logo.svg       the logo (C3 "Blood Pip"); img/icon-*.png are renders of it for tabs and home screens
manifest.webmanifest  name and icons for "add to home screen"
js/config.js       ALL tunable numbers
js/numbers.js      logic: writing money and mults for people ($1.25M, 4.2Mx)
js/dice.js         logic: rolling dice
js/bets.js         logic: settling bets
js/shift.js        logic: shift turns, roster vs shooting order, hiring, dealer breaks and deposits (plaques, take-back), betting patterns, win/fall checks
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
js/art.js          display: drawings made in code (crew portraits, SVG)
js/card-art.js     display: card art drawn in code (style E: theme-tinted dark panel, bone symbol)
js/music.js        display: background music (tracks listed in CONFIG.music; calm/tense playlists; credits)
music/             music files (free licensed; credits in CONFIG.music)
js/ui.js           display: the table (dice, bets and hints, chips, betting patterns, crew, mult, roll results, popups, odds chart, phone tabs)
js/ui-break.js     display: the Dealer Break in tabs (Pay, Shop, Comps, Crew), dice workshop, phone call, your Inventory
js/ui-screens.js   display: full-screen views (splashes, prompts, end screen and stats, fall, tutorials, Collection, opening)
js/tutorials.js    display: tutorial pages (intro, shop, comps, phone) and "seen" memory
js/coach.js        display: the guided first shooter (coach bubble for brand-new players)
js/juice.js        display: the game's feel (1.0.5): chip stacks, flying chips, counting numbers, card pops, big-win banners and screen shake
js/controls.js     display: keyboard shortcuts (list in Settings), dragging chips on/off bets, press-and-hold help on phones
js/main.js         wires buttons to logic and display
js/autoplay.js     testing tool: index.html?autoplay lets a bot play whole runs and report errors (loaded only then)
demos/dice-3d.html  preview: three 3D dice styles to choose from (not part of the game)
demos/logo-options.html  preview: four logo directions to choose from (not part of the game)
demos/table-look.html  preview: table looks B (CSS 3D) and C (Three.js) (not part of the game)
demos/music-options.html  preview: darker shift-1 music candidates (not part of the game)
demos/card-art.html  preview: card art styles (A, B, C and mixes D, E) to choose from (not part of the game)
demos/chain-options.html  preview: three chain styles for the link bar (not part of the game)
demos/stack-options.html  preview: three chip-stack looks for bets (not part of the game)
demos/card-pop-options.html  preview: three ways to show a card firing (not part of the game)
demos/big-win-options.html  preview: three big-win banner looks with screen shake (not part of the game)
demos/break-anim-options.html  preview: 3 options each for shop cards arriving, a bought card flying to Your cards, the unlock celebration (not part of the game)
tools/simulate.js  balance simulator (Node.js, not part of the game): node tools/simulate.js 20000
tools/copy-web.js  Android: copies the game into www/ for the app (npm run sync)
tools/make-icons.js  Android: app icons and splash screens from img/logo.svg (needs Playwright)
tools/make-store-art.js  Google Play pictures into store/ (feature graphic, screenshots; needs Playwright)
store/             Google Play pictures (icon-512.png, feature-graphic.png, screenshot-*.png phone, tablet7-*/tablet10-*.png tablets), LISTING.md (store text draft), INVITE.md (closed-test invites and tracker)
package.json, capacitor.config.json  Android app setup (Capacitor; owner approved build tools for the app only)
android/           the Android Studio project (generated by Capacitor; portrait, version in app/build.gradle)
```
Testing shortcuts: add `?target=300` to the page address to set shift 1's debt; add `?fast` to skip the dice animation, splash screens and fall animation; add `?cards=doubleUp,greenDice` to start with those cards (ids are in js/cards.js). `?shift=5` starts the run at that shift (to test later shifts, e.g. the tense music). `?endless` starts in endless mode at shift 9 (or `&shift=N`), with 30% of the debt as cash; it never saves. `?app` previews the Android app mode (feedback note, back button handling). `?rule=houseDie` forces that house rule every shift (ids are in js/rules.js). `?unlockAll` makes everything available without touching saved progress. `?showWins` plays the BIG / HUGE / MONSTER WIN banners once. `?autoplay` (or `?autoplay=100`) lets a bot play whole runs through the real screen and report errors or stuck screens; it never saves. Combine with `&`, e.g. `?target=300&fast&cards=doublesCharm`.

tests.html pins its own numbers (shift 1: $200 cash, $2,000 debt, 6 seats, everything unlocked, progress never saved) so tuning config.js doesn't break the checks. Shift cash and debts are in `CONFIG.shifts`; the current debt is `state.debt`.

Scripts load with plain `<script>` tags in a set order (config, numbers, logic: dice, bets, crew, cards, shop, stats, perks, crafting, comps, unlocks, rules, save, shift; then display: sound, music, art, card-art, ui, ui-break, ui-screens, tutorials, coach, juice, controls; then main), not ES modules, so double-clicking index.html works.
