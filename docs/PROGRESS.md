# Progress

Dated session log. Newest at the top.

## 2026-10-27: Session 5, continued (Milestone 7: bet against the shooter)

**Done**
- Owner picked growth ideas 1-6 and approved the roadmap (7 Don't Pass, 8 consumables, 9 dice crafting, 10 crew growth, 11 house rules + challenges, 12 more bets + unlocks).
- **Built Milestone 7:** Don't Pass and Lay Odds (logic, table areas, one side per come-out, both count as the required line bet, auto top-up, Clear bets), odds summary shows both sides ("The 6 before a 7" / "7 first"), seven-out splash celebrates a Don't win, new tutorial page, two new cards (Wrong Way, Cold Read), Pit Boss's Pity only for Pass Line bettors. Simulator learned Don't Pass. tests.html: 230 checks, all passing. Still fits one screen on phones.

**Works**
- Checked in a headless browser: Don't Pass, one-side rule, Lay Odds limit, seven-out win splash.

**Design finding (simulator, docs/BALANCE.md)**
- Don't Pass with max Lay is weaker than Pass with max Odds for the bot (shift 1: 55% vs 69%), mainly from going broke (Lay risks up to 6x the bet).
- Betting against Jinx doesn't help (14% vs 19% by shift 5): Jinx's frequent 7s also hit the come-out, where a 7 loses a Don't Pass bet. Ideas to fix are in IDEAS.md; owner to choose.

**Waiting on the owner**
- Testing Milestone 7, and a decision on the Jinx / Don't Pass finding.

**Exact next step**
- Milestone 8: consumables (one-use chips).

## 2026-10-27: Session 5 (polish: fall animation and sound)

**Done**
- **Fall animation:** shake, seats and table tumble into the pit, fade to black on "The chains release.", then the stats screen.
- **Sound:** new `js/sound.js`, all sounds made in the browser (no files). On by default; 🔊/🔇 mute button (remembered). 13 sounds wired to betting, rolling, wins, seven-outs, paying, buying, cutting, the phone, falling, and winning a shift.
- Balance: no rule changes since the 6b simulator check (66/43/34/24/15% survival for shifts 1-5).
- Owner feedback: the game is fun but too basic; it needs a lot of mechanical growth. Claude's suggestions are in IDEAS.md ("Mechanical growth").

**Works**
- Checked in a headless browser: mute toggles and is remembered, every sound plays without errors, the fall runs and the stats screen follows, Play again restores the table. tests.html: 207 checks, all passing.

**Broken**
- Nothing known.

**Waiting on the owner**
- Testing the polish (listen with sound on!), then choosing which mechanical-growth ideas to build next.

**Exact next step**
- Owner picks from the mechanical-growth list; then plan that milestone.

## 2026-10-25: Session 4, continued (Milestone 6b: the Pit Boss phone)

**Done**
- Owner chose: 6b, then polish. **Never publish anywhere without the owner's permission** (now in CLAUDE.md).
- **Built 6b:** new `js/perks.js`. After each won shift the phone rings (with a 2-page tutorial the first time): pick 1 of 3 perks. +1 way to roll any total (7 marked Risky), -1 way to roll 7 (rarer each time, floor of 2 ways), Remove a character (pick who), 2 free items. The dice engine now supports "+/- ways to roll a total". Purple ☎ badges, FREE shop prices, perks on the stats screen. Simulator bot now answers the phone. tests.html: 207 checks, all passing.
- **Milestone 6 is complete.**

**Works**
- Checked in a headless browser: phone tutorial, offers, Remove a character flow, free items, -1 seven in the odds chart.
- Simulator (smart bot, shop + phone): survives shift 1 66%, 2 43%, 3 34%, 4 24%, 5 15%.

**Broken / known**
- A free card can be sold for half its normal price (small exploit). Noted in IDEAS.md.

**Waiting on the owner**
- Testing 6b.

**Exact next step**
- Polish: the fall animation (floor opens), sounds, and a balance check.

## 2026-10-25: Session 4 (Milestone 6a)

**Done**
- Owner approved the Milestone 6 plan (see DECISIONS.md); 6 split into 6a (shifts) and 6b (phone).
- **Built 6a:** the debt now lives in the game state (`state.debt`, `state.shift`); `shifts` table in config plus x1.5 growth after shift 5. After a won shift, "Next shift" carries kitty, cards, cut crew and interest into the next shift with new cash added. The shop opens on the opening Break from shift 2. "Shift N" shows at the top; falling shows "You survived N shifts". Simulator updated to play real multi-shift runs. tests.html: 188 checks, all passing.

**Works**
- Checked in a headless browser: win shift 1, next shift intro and prices at $300 debt, cards carried, fall shows the score, Play again resets. Still fits one screen on phones.
- Simulator (smart bot with shop): survives shift 1 68%, 2 40%, 3 29%, 4 18%, 5 9%.

**Broken**
- Nothing known.

- Owner asked for a full stats screen when you fall. **Built:** new `js/stats.js` records every roll (carried across shifts); the fall screen shows 11 stat tiles, a money-over-the-run line chart, a totals-rolled vs expected bar chart, and your cards. Checked on laptop and phone. tests.html: 195 checks, all passing.

**Waiting on the owner**
- Testing 6a and the stats screen; decision on what to do after 6b (see chat: Claude recommends finishing the core loop, then a playtest/tuning pass and an early itch.io release before adding more cards).

**Exact next step**
- 6b: the Pit Boss phone (pick 1 of 3 perks after each won shift, with a tutorial).

## 2026-10-24: Session 3, continued (balance fixes + Milestone 5b-2)

**Done**
- Owner approved the balance plan, house rules, unlocks (with announcements), and the order of work.
- Quick fixes: shift 1 now $150 cash / $200 debt; Pit Boss's Pity is Rare; Hot Hand resets only on a losing roll; Muggsy charges the Pass Line only.
- **Built 5b-2:** Loaded Die and Reroll (a prompt appears only when a roll would cost you; Loaded Die rerolls one chosen die once per shift, Reroll both dice once per shooter). Cut a chain (Dealer Break section, 25% of the debt, confirm box, "falls through the floor" screen, seats close up and synergies follow). Extra chain link (Legendary; when you'd fall, the shift counts as survived). The crew list now lives in the game state so cuts last. Shop tutorial has a 3rd page on Cut a chain. tests.html: 179 checks, all passing.
- **Milestone 5 (the shop) is complete.**

**Works**
- Checked in a headless browser: reroll prompt and both reroll types, cutting Jinx, chain link save screen.

**Broken**
- Nothing known.

**Waiting on the owner**
- Testing 5b-2.

**Exact next step**
- Milestone 6: multiple shifts at the new scale (cash added to leftover kitty, cards and cut crew carry over), and the Pit Boss phone (pick 1 of 3 perks after each won shift, with its own tutorial).

## 2026-10-24: Session 3 (Milestone 5b-1)

**Done**
- Owner approved all 5b recommendations (see DECISIONS.md). 5b split into 5b-1 and 5b-2.
- **Built 5b-1:** dice now roll from weighted combos, which supports "+N ways out of 36" (`extraWays`) and pair-only rolls. Three new cards: **Double Up** (Uncommon), **Doubles Charm** (Rare), **Green Dice** (Rare). Rare cards now appear in the shop ($50 at a $200 debt). The odds chart, Break text and hover cards all show the current odds, including card effects. On a Doubles Charm roll, the chart shows pair-only odds and a note. tests.html: 157 checks, all passing.

**Works**
- Checked in a headless browser: the charm roll is a pair, the chart shows pairs only, and Dee's hover shows 12.2% with Double Up.

**Broken**
- Nothing known.

- Added `?cards=` testing shortcut.
- Owner asked whether $200 is too easy. Built `tools/simulate.js` (plays thousands of shifts with the real rule files). Result: it's hard (smart bot 46%, mostly going broke). Results and recommendations in `docs/BALANCE.md`.

**Waiting on the owner**
- Decisions on Claude's balance proposals: shift 1 cash $150, new scale table, card tweaks (Pity to Rare, Hot Hand and Muggsy fixes), house rules, and card unlocks.

**Exact next step**
- 5b-2: Loaded Die and Reroll (offered only on a costly roll), Cut a chain (Break option, 25% of the debt), Extra chain link (Mr. Bones-style save).

## 2026-10-23: Session 2, continued (planning + Milestone 5a)

**Done**
- Owner sent a spreadsheet (cards, Pit Boss phone, scales), saved in docs/. Claude gave feedback; owner answered all open questions (see DECISIONS.md).
- DESIGN.md rewritten as one clean document with a glossary and status tags.
- **Built Milestone 5a:** shift 1 now $100 cash / $200 debt. The Dealer break has "Pay the dealer" and "Tip the dealer (shop)": 3 random cards per break by rarity, prices as a share of the debt, Shuffle (rising price), 5 card slots, sell for half. Your cards show as badges with hover text. 8 cards work: Hot Hand, Snake Eyes, Lucky Seven, Rattlesnake, Red Dice, Odds Addict, Pit Boss's Pity, Muggsy. New `js/cards.js` and `js/shop.js`. tests.html: 134 checks, all passing (now pins its own numbers).

**Works**
- Full shift played in a headless browser: buying, shuffling, selling, and card effects firing (Red Dice, Muggsy, Lucky Seven, x2 next shooter).

**Broken**
- Nothing known.

**Notes for later**
- No Rare or Extra chain link cards exist yet, so those tiers fall back to Uncommon/Common until 5b.
- Hot Hand resets on any roll with no win, including "no decision" rolls during a point. Watch in playtesting.

- Owner feedback on 5a, all done: shop opens after the first shooter with an intro, Shuffle a flat 5%, big red SEVEN OUT, pay box defaults to $5 with $5 steps, "current chance of a 7", coloured rarity labels, instant fall on a broke seven-out. tests.html: 138 checks, all passing.

- Tutorials: a 6-page How to play intro (first visit, plus a button), a 2-page shop tutorial (first time the shop opens, plus a ? button), capital-B "Dealer Break". New `js/tutorials.js`.

- Interest built: 5% of paid money into the kitty at every Break after a seven-out, shown at the top, explained on a new 7th intro page.
- Tapping the dice rolls them. Dice now drawn with pips and tumble for 0.6s. New `?fast` testing shortcut.
- New layout fits one screen without scrolling (checked at 1366x768, 1920x1080, 390x844, 360x740). tests.html: 142 checks, all passing.
- Owner decided: finish the base game first, add more bets after v1.

- Splash screens: SEVEN OUT (2.5s, then the Dealer Break) and POINT HIT (winnings with the boost from cards and mult). Mult now lists Hot Rod's streak and Rattlesnake as reasons. tests.html: 144 checks, all passing.
- Owner asked why the tutorial didn't show: it's remembered per browser (How to play button or a private window to see it again).

- 2026-10-24: splash screens lengthened to 5 seconds (tap to close early), per owner.

**Waiting on the owner**
- Testing the splash screens. Owner wants to stay on 5a for now.

**Exact next step**
- Milestone 5b: Loaded Die, Reroll, Double Up, Doubles Charm, Green Dice (interest), Cut a chain, Extra chain link.

## 2026-10-23: Session 2, continued (Milestone 4b)

**Done**
- Owner tested Milestone 4a.
- **Built Milestone 4b:** mult on screen (orange when hot, blue when cold, with reasons), winnings multiplied and shown as "$5 x 1.5". Hot Rod +1x per winning roll, his first seven-out costs double. Mentor (Hot Rod to Jinx) and Cold Table (Jinx to Ghost). Coach removed. tests.html: 107 checks, all passing.

**Works**
- Checked in a headless browser through a full shift: Hot Rod heating up, the double-cost seven-out, Mentor carry-over to Jinx, Cold Table on Ghost lifting after a win.

**Broken**
- Nothing known.

- Owner tested 4b, then asked for a fix: "Pay all I can" replaced by "Pay off debt", greyed out until the kitty covers the full debt.

**Waiting on the owner**
- Quick test of the Pay off debt button.

**Exact next step**
- Milestone 5: the dealer's shop at the Dealer break ("Tip the dealer"), with rotating stock and rarity tiers. Includes "Cut a chain" and the Doubles Charm / Reroll ideas. Ask first: shop size per visit, price range, which starter items go in v1, and rarity odds.

## 2026-10-23: Session 2 (Milestone 4a)

**Done**
- Owner accepted all 3 ideas (logged in DESIGN.md). Dee's quirk set to sticky dice, seat order changed, Hot Rod's pair idea moved to the shop.
- **Built Milestone 4a:** each crew member rolls their own dice (set in config.js), an odds bar chart for the current shooter (7 in red, point in yellow, point-before-7 chance), hover cards with real 7 chances, and the next shooter's 7 chance on the break screen. tests.html: 96 checks, all passing.

**Works**
- Checked in a headless browser through a full shift: each shooter's dice and odds are correct, and Ghost's evens/odds note shows.

**Broken**
- Nothing known.

**Waiting on the owner**
- Testing Milestone 4a.

**Exact next step**
- Milestone 4b: mult (applies to winnings), Hot Rod (+1 mult per winning roll, first seven-out costs double), Cold Table, Coach (free reroll), Mentor. Ask first: exactly what "costs double" takes, and how the free reroll is used (button? which roll?).

## 2026-10-23: Session 1 wrap-up

**Done this session (overall)**
- Project set up with git, notes, GitHub repo (kshime3/chained-dice, public) and GitHub Pages (https://kshime3.github.io/chained-dice/).
- Milestones 1, 2, 3 and 3.5 built, tested by owner, committed and pushed.
- Final tweaks: "Pay all I can" (and Pay) always keep $5 in the kitty for the Pass Line, unless paying off the whole debt. Hovering a seat shows that character's planned dice and style. New `js/crew.js`. tests.html: 84 checks, all passing.

**Works**
- Full shift: dealer breaks, paying the debt, six shooters with normal dice, Pass Line/Odds/Field, win and both kinds of fall, Play again.

**Broken**
- Nothing known.

**Owner's homework (for next session)**
- Brainstorm using Claude's 3 ideas in `docs/IDEAS.md` (pit boss bounties, house rules, cut a chain).
- Think about how to adjust each crew member's quirks.

**Exact next step**
- Start of next session: hear the owner's brainstorm results, then plan Milestone 4 (crew weighted dice, dice odds on screen, synergies). Settle first: seat order, adjusted quirks, and what makes Dealer Dee's turn different (every turn already ends on a seven-out).

## 2026-10-23: Session 1, continued (Milestone 3.5: Pay the dealer)

**Done**
- Owner adjusted the Milestone 3 rules (see DECISIONS.md and the new DESIGN.md section).
- **Built Milestone 3.5:** "Bankroll" is now "Kitty". Dealer break screen before the first shooter, after each seven-out, and a final one after the last shooter. Pay a typed amount or "Pay all I can". Progress bar shows money paid. Win the moment the debt is paid. Pass Line auto-tops-up from the Field/Odds when the kitty is short. Warning on the break screen if leaving would mean falling. tests.html: 81 checks, all passing.

**Works**
- Checked in a headless browser: opening break, paying, auto-move, seven-out break, falling broke, falling short.

**Broken**
- Nothing known.

**Waiting on the owner**
- Testing Milestone 3.5 and feedback.

**Exact next step**
- After feedback: plan Milestone 4 (crew weighted dice, dice odds on screen, synergies). Ask about seat order and Dealer Dee's trait first.

## 2026-10-23: Session 1, continued (Milestone 3)

**Done**
- Owner tested Milestone 2: works great.
- **Built Milestone 3:** $200 buy-in, $2,000 target with progress bar, six seats (Lefty, Dealer Dee, Hot Rod, Ghost, Jinx, You) with normal dice, "Now shooting" label, seven-out passes the dice. Pass Line required to roll a come-out. Instant win at target; fall when broke or when the last shooter sevens out. Win/fall screens with Play again. New `js/shift.js`. Testing shortcut `?target=300`. tests.html: 68 checks, all passing.

**Works**
- All three endings checked in a headless browser: win (small target), fall short, fall broke. Play again resets.

**Broken**
- Nothing known.

**Notes for later**
- Balance: with flat bets and no multipliers, $200 to $2,000 is very hard. Expected; modifiers, crew, and the shop should change that. Watch it in playtesting.
- You press Roll for every shooter, including the crew.

**Waiting on the owner**
- Testing Milestone 3 and feedback.

**Exact next step**
- After feedback: plan Milestone 4 (crew weighted dice, dice odds shown on screen, synergies). Settle Dealer Dee's "always ends on a seven-out" question and seat order first.

## 2026-10-23: Session 1, continued (Milestone 2)

**Done**
- Pushed everything to GitHub (kshime3/chained-dice, public). Live at https://kshime3.github.io/chained-dice/.
- Owner tested Milestone 1: all working.
- **Built Milestone 2:** point marker (ON/OFF), Pass Line locks once a point is set, Odds bet (3-4-5x limit, true odds, rounded down, capped at max), point hit and seven-out handling. Clear bets returns Odds and Field but not a locked Pass Line. Plain-language messages for every roll. tests.html: 58 checks, all passing.

**Works**
- Full come-out and point cycle, checked in a headless browser and by tests.html.

**Broken**
- Nothing known.

**Known limits (by design)**
- "Seven out! New shooter" is only a message. No crew or turns yet (Milestones 3 and 4).
- Starting bankroll is $200 with no target or game over yet (Milestone 3).

**Waiting on the owner**
- Testing Milestone 2 and feedback.

**Exact next step**
- After feedback: plan Milestone 3 ($200 buy-in, $2,000 target, roll-until-seven-out turns, instant fall when broke or short of target).

## 2026-10-23: Session 1 (kickoff + Milestone 1)

**Done**
- Created the project folder and started git.
- Added CLAUDE.md and the four docs files. Design doc copied in, with kickoff clarifications appended.
- Owner answered the kickoff questions (see DECISIONS.md) and approved the Milestone 1 plan.
- **Built Milestone 1:** two dice, chip picker ($5/$25/$100), Field and Pass Line (come-out only) bets, Roll and Clear buttons, plain-language result messages. tests.html: 25 checks, all passing.

**Works**
- Field pays correctly on every total. Pass Line wins on 7/11, loses on 2/3/12.
- Bankroll and on-table amounts update correctly.

**Broken**
- Nothing known.

**Known limits (by design, Milestone 1)**
- No point phase yet: a point number leaves the Pass Line bet up and the next roll is a come-out again.

**Waiting on the owner**
- Public or private GitHub repository? Then create it and connect it so the code can be pushed. Nothing is on GitHub yet, and this workspace is temporary.
- Feedback after testing Milestone 1.

**Exact next step**
- Push to GitHub and turn on Pages, then (after feedback) plan Milestone 2: point phase, Odds bet, seven-out.
