# Progress

Dated session log. Newest at the top.

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

**Waiting on the owner**
- Testing Milestone 5a.

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
