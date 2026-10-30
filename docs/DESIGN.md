# Chained Dice: Game Design (v0.2)

*A Craps-themed roguelike for the browser. This is the single current version of the design. The history of how we got here is in `DECISIONS.md`. Status tags: **[Built]**, **[Planned]**, **[Open]** (still to decide).*

## Premise

You wake up chained to a craps table with your crew. The dealer, the bad guy, says you owe them money by the end of the shift. **The chains are your sentence; the floor is the threat.** Your chain has 8 links: pay off a shift and the dealer unlocks one. Break all 8 and you walk out free. Fail, or go broke, and the floor opens and the chains drag the whole crew down. Then you wake up at the table again.

## The End Goal

An endless roguelike about beating the house at its own game. Each shift, the dealer demands a bigger debt. You have a fixed crew of shooters whose dice have visible, different odds. You build an engine from **cards** (the stickman's shop, between shooters), **permanent perks** (the Pit Boss's phone, between shifts) and **new bets** you unlock, turning craps' house edge into your edge. Every decision is **bank it or ride it**. Your score is how many shifts you survive.

Long term, it becomes a first-person 3D room like Clover Pit: chained at the table, the crew around you, the stickman's chip bank to shop, the ringing phone, the floor opening.

**v1 goal (to finish and publish on itch.io):** 2-3 shifts at the new scale, the shop with 8-10 cards, the phone with about 5 perks, the fall and restart, a short how-to-play intro. Flat 2D shapes for now.

## Pillars

- **Balatro-style run:** escalating debts, a shop, and items that combine into strategies ("builds").
- **Hit the debt or fall:** one miss ends the run. No health bar.
- **Shared table:** the crew takes turns as shooter, each with different dice, and seat order matters.
- **Visible math:** the odds of every roll are shown on screen.
- **Beginner-friendly:** craps is confusing, so the game explains itself as you play.
- **Simple presentation first:** placeholder shapes; fun comes from the rules.

## Core Loop  [Built]

1. **Wake up** at the table with the shift's starting cash in your **cash**.
2. **Dealer Break:** pay toward the debt (and later, shop).
3. **The current shooter rolls.** You bet on every roll, whoever is shooting. The shooter keeps rolling until they **seven out**.
4. **Dealer Break** after every seven-out, then the next shooter steps up.
5. After the last shooter sevens out: one **final Dealer Break**, then the pit boss judges.
6. **Win** the moment your payments reach the debt. Leftover cash is kept. **[Planned, 6b]** The Pit Boss phone rings: pick 1 of 3 perks. **[Built]** Next shift: the new cash is added to your cash and a bigger debt starts. From shift 2, the shop is open on the opening Break.
7. **Fall:** the run ends with a **stats screen [Built]**: shifts survived (your score), rolls and doubles, longest run without a 7, longest turn, biggest hit and loss, won/lost at the table, paid to the dealer and interest, spent in the shop, points hit and seven-outs, highest mult, best shooter, a chart of your money over the run (shift starts marked), a chart of every total rolled against what the dice odds expected, and your cards. Play again starts a new run at shift 1.

## Break the Chain  [Built]

- **8 links** (`chainLinks` in config), shown in the top bar. Each won shift breaks one, with a link-breaking animation (glows red-hot, shakes, snaps, sparks) and a snap sound: "THE FLOOR HOLDS. The dealer unlocks a link. N links to go."
- **Break all 8: "YOU WALK OUT FREE."** with your stats. The dealer offers **"Double or nothing?"**: **Walk away** ends the run as a win; **Double or nothing** starts **endless mode** (shift 9 on, debts keep growing x1.5, played for score).
- **The floor opens** when you fail: "You broke 3 of 8 links." In endless: "You walked out free once. Greed brought you back."
- Full wording: `docs/WORDING.md` (approved by owner).

## Shifts and Scale

Tested with the simulator (`docs/BALANCE.md`).

| Shift | Cash added | Debt owed | Table minimum | House rule |
| --- | --- | --- | --- | --- |
| 1 | $150 | $200 | $5 | none |
| 2 | $200 | $300 | $10 | none |
| 3 | $175 | $550 | $15 | 1 random |
| 4 | $175 | $1,100 | $30 | 1 random |
| 5 | $175 | $2,400 | $60 | 1 random |
| 6 | $175 | $5,500 | $150 | 1 random |
| 7 | $175 | $12,500 | $300 | 1 random |
| 8 | $175 | $28,000 | $700 | 1 boss rule |
| 9+ (endless) | $175 | x2.2 per shift | 2.5% of the debt (to $25) | 1 random (normal or boss) |

(The boss rule lands on the last link, so a Dealer's Bargain pushes it later.)

- **Dealer's cut [Built]:** when you win a shift, you carry only **half** your leftover money into the next one (`carryOverShare` in config). The win screen and the next opening Break say how much he kept.

- **Table minimum [Built]:** the smallest line bet, and what you must always keep in cash (payments and shopping can't go below it; under it on a come-out, the floor opens). Shown on the table as "Table min $X". Chips shown: $5/$25/$100 while the minimum is under $25, then $25/$100/$500.
- **Paying opens after the first shooter [Built]** (`payAfterFirstShooter` in config): the dealer won't take payment on a shift's opening Break, so you can't clear a new shift from leftover money before rolling.

**[Built]** All shifts use this scale (`shifts` in config). Cash is **added** to what you carry over (half your leftover money after the dealer's cut; bets left on the table count too). Cards, cut crew and interest boosts carry over; payments and once-a-shift effects (Pity, Loaded Die, Hot Rod's double cost) reset.

## Paying the Dealer  [Built]

- **Cash:** the money in your hand. You bet from it.
- **Dealer Break:** before the first shooter, after every seven-out, and once more after the last shooter.
- **Payments** come from the cash, are safe from bad rolls, are out of play, and **can't be taken back**.
- You can't pay more than you owe, and a partial payment always leaves the **$5 minimum Pass Line bet** in your cash.
- **Pay off debt** is greyed out until your cash covers the whole debt.
- **Interest [Built]:** at every Dealer Break after a seven-out, 5% of everything you've paid so far (rounded down) goes into your cash. Shown at the top of the screen. Rewards paying early.

## Losing (the Fall)  [Built, animation Planned]

- **Broke:** on a come-out, your cash plus money on the table can't cover the $5 minimum Pass Line bet.
- **Short:** you leave the final Dealer Break still owing.
- A seven-out that leaves you broke (and unable to pay off the debt) is an instant fall, with no Dealer Break.
- [Planned] The floor opens and everyone drops, then the run restarts.

## Craps Rules  [Built]

- **Come-out roll:** 7 or 11 wins the Pass Line. 2, 3 or 12 (craps) loses it. Any other number (4, 5, 6, 8, 9, 10) becomes the **point**.
- **Point phase:** hitting the point wins the Pass Line. A 7 is a **seven-out**: Pass Line and Odds lose, and the shooter changes.
- **Pass Line is required** (minimum $5) to roll a come-out. If your cash is short, money moves automatically from your other bets (Field first, then Odds). Once a point is set, the Pass Line is locked.
- **Don't Pass [Built, Milestone 7]:** bet against the shooter. Come-out: 2/3 win, 7/11 lose, 12 is a tie. Point on: a 7 wins, the point loses. Even money. A Pass Line **or** Don't Pass bet ($5+) is required on every come-out, one side at a time; it locks during a point.
- **Lay Odds [Built]:** behind Don't Pass while a point is on. Pays 1:2 on 4/10, 2:3 on 5/9, 5:6 on 6/8 (rounded down). You can lay enough to win up to 3-4-5x your Don't Pass bet (6x the bet on every point). Can be taken back.
- **Odds:** only while a point is on, up to 3x the Pass Line on 4/10, 4x on 5/9, 5x on 6/8. Pays true odds (2:1, 3:2, 6:5), rounded down. Can be taken back at any time. A winning Odds bet returns to your cash.
- **Field:** one-roll bet. 3, 4, 9, 10, 11 pay even money; 2 pays double; 12 pays triple; 5, 6, 7, 8 lose.
- Winning Pass Line and Field bets are paid and stay on the table. "Clear bets" takes back everything that isn't locked.
- **Chips:** $5, $25, $100. No maximum bet.
- **[Planned, after v1]** A "More bets" milestone: Place bets, Hard Ways, Come with its own Odds (some as phone unlocks). Phone unlocks: Fire Bet, Different Doubles. The base game is finished first.

## The Crew  [Built]

**Starting table [Built, 2026-10-29]:** a run starts with only **3 seats: you, Jinx (always), and one random starter** (`startingCrew`, `alwaysStarts` in config). The other starters join the hire pool; hire up to 6 seats. Jinx is the reason to use the Trapdoor, but dropping him costs 25% of the debt and a shooter. Anyone dropped is gone for the run and can't be hired back.

Seat order: **Lefty, Dealer Dee, Hot Rod, Jinx, Ghost, You.** Dice are lists of faces in `config.js`; each listed face is equally likely.

| Character | Dice | Chance of a 7 | Style |
| --- | --- | --- | --- |
| Lefty | Each die rolls 1-5 (no 6s) | 16.0% | 11 and 12 impossible |
| Dealer Dee | Sticky dice: left 1 + right 6 can't land together | 14.3% | Turns tend to last longer |
| Hot Rod | Normal | 16.7% | +1x mult per winning roll; first seven-out of the shift costs double |
| Jinx | Faces 1, 2, 3, 3, 4, 4 | 22.2% | Nothing above 8. **Cursed [Built]:** when he shoots, a come-out 7 is only a tie for Don't Pass |
| Ghost | Right die evens-only or odds-only, picked each turn | 16.7% | Streaky |
| You | Normal, **craftable** (Milestone 9) | 16.7% | The shooter you build up |

**Synergies (seat order matters):**
- **Mentor (Hot Rod to Jinx):** half of Hot Rod's mult bonus carries over.
- **Cold Table (Jinx to Ghost):** -0.5x mult until the first winning roll.

**Hot Rod's double cost:** your losing Pass Line and Odds are charged again from the cash, never below the $5 minimum.

## Mult  [Built]

- Multiplies **winnings**, not bets. Rounded down.
- Starts at 1x for every shooter, then adjusted by synergies and cards.
- Shown on screen with the reasons, and in each win message ("$5 x 1.5").

## The Shop (the Stickman)  [Built: Milestone 5a]

- From the **second** Dealer Break on (after the first shooter), a **Tip the dealer** section shows **3 random cards**. The first time, it explains how the shop works.
- **Shuffle** replaces the stock for a flat 5% of the debt.
- **Prices are a share of the current shift's debt,** rounded to the nearest $5:

| Rarity | Price | Chance per slot |
| --- | --- | --- |
| Common | 5% | 60% |
| Uncommon | 10% | 30% |
| Rare | 25% | 9% |
| Spare Link | 50% | 1% |

- **5 card slots** to start. A "+1 slot" card may come later.
- Paid from the cash; tips **don't** count toward the debt. Buying or shuffling can't take the cash below $5.
- Cards you own never appear in the stock. Selling gives back half the price.
- Presentation (3D, later): run by the stickman; open it by clicking his bank of chips.
- **[Open]** Card packs, like Balatro. A second currency (tickets)? Leaning toward cash money only.

## Cards  [Planned]

Full list: `docs/Store-Cards-Phone-Scales.xlsx`.

| Card | Effect | Rarity |
| --- | --- | --- |
| Rattlesnake [Built] | Rolling snake eyes (1+1) adds +1x mult. Resets each shooter. | Common |
| Double Up [Built] | +1 way (out of 36) for each double, on everyone's dice. Normal dice: doubles 28.6%, 7s 14.3%. | Uncommon |
| Muggsy [Built] | A 7 on the roll right after the point is set charges your losing Pass Line again (not Odds; never below $5). The next shooter's winnings are x2 for their whole turn. Stacks with Hot Rod. | Uncommon |
| Red Dice [Built] | Craps on the come-out wins the Pass Line at even money. | Uncommon |
| Green Dice [Built] | Each 12 rolled adds +0.5% to your interest rate for the rest of the run. | Rare |
| Hot Hand [Built] | +0.5x mult per winning roll in a row; resets on a roll that loses a bet without winning one. | Common |
| Snake Eyes [Built] | Rolling a 2 pays a bonus of 10% of the debt. | Common |
| Lucky Seven [Built] | A come-out 7 pays a bonus of 5% of the debt. | Common |
| Odds Addict [Built] | Odds pay 50% extra. | Uncommon |
| Loaded Die [Built] | Once per shift, reroll one die, offered only when a roll is about to cost you. | Uncommon |
| Pit Boss's Pity [Built] | The first seven-out of the shift (any shooter) is ignored. Bets stay and the shooter keeps rolling. | Rare |
| Doubles Charm [Built] | Every 3rd roll of each shooter's turn is a pair (from the doubles that shooter can roll). | Rare |
| Reroll [Built] | Once per shooter, reroll both dice, offered only when a roll is about to cost you. | Uncommon |
| Wrong Way [Built] | Don't Pass winnings +50%. | Uncommon |
| Cold Read [Built] | When your Don't Pass wins on a seven-out, the next shooter starts at +1x mult. | Common |
| Pit Boss's Pity (note) | Only triggers when you're on the Pass Line. | |
| Dealer's Bargain [Built] | One use, instant, takes no slot. Adds a link to your chain (one more shift to walk free); in return everyone's dice get -1 way to roll 7 for the rest of the run (7 floor still applies). Not offered in endless mode. | Rare |
| Spare Link [Built] | When you would fall, it snaps instead: the shift counts as survived and the rest of the debt is forgiven. Takes a slot until used. | Very rare |

**Trapdoor [Built]:** a fixed Dealer Break option (once the shop is open) for 25% of the debt. Drops a crew member who hasn't shot yet this shift (never You) through the floor for the rest of the run; seats close up and synergies change.

**"+1 odds" means +1 way out of 36 [Built]:** one extra combination for that total, so a 2 goes from 1 in 36 to 2 in 37. Dice with fewer faces (like Lefty's) are scaled so their plain combos still count as 36.

## Comps  [Built, Milestone 8]

One-use items ("comps", casino slang for the house's freebies). Hold up to **2**. The shop offers **2 comps at every Dealer Break** (once the shop is open), priced by strength as a share of the debt; sell for half. Comps carry over between shifts.

| Comp | When | Effect | Price |
| --- | --- | --- | --- |
| No Sevens | Next roll | The next roll can't be a 7 | 8% |
| Double Down | Next winning roll | Pays double (stays armed until a roll wins) | 6% |
| Lucky Pair | Next roll | The next roll is a pair | 5% |
| Loaded Shot | Next roll | You pick the left die's face | 7% |
| Insurance | Next roll | If it loses your line bet, you get it back | 4% |
| Hot Seat | Any time (not at a Break) | +1x mult for the rest of the turn | 5% |
| Seat Swap | At a Break | Swap the next two shooters | 4% |
| Cash Advance | At a Break (after the first shooter) | +25% of the debt now; the debt grows by 1.5x that | 3% |

- Your comps sit in the cards row as blue 🎟 buttons; click to use. Armed comps glow ⚡ and the odds chart shows their effect.
- **Free comps:** hitting a point at 3x mult or more gives a free comp (if a slot is free); phone perk **"2 free comps"** (Uncommon).
- Tutorial the first time comps are on sale (also via the ? next to "Comps").

## Crew Growth  [Built, Milestone 10]

**Crew cards** (only offered while that person is at the table):

| Card | Effect | Rarity |
| --- | --- | --- |
| Lefty's Glove | Lefty's right die gets its 6 back | Uncommon |
| Dee's Ledger | On Dee's turn, Odds and Lay Odds pay +50% | Uncommon |
| Rod's Lighter | Hot Rod +1.5x per winning roll; his seven-out no longer costs double | Uncommon |
| Jinx's Shadow | Don't Pass winnings x2 when Jinx shoots | Uncommon |
| Ghost Story | You choose Ghost's evens/odds die at the Break before his turn | Common |

**"You" cards** (only while you're at the table):

| Card | Effect | Rarity |
| --- | --- | --- |
| Encore | Every shift, an extra turn for you after the last shooter, before the final Break | Rare |
| High Roller | Your winnings x2 on your own turn | Uncommon |
| Front of the Line | You shoot first every shift (from the next shift) | Common |
| Sleight of Hand | The shooter right after you rolls your (crafted) dice | Uncommon |

**Hiring:** a Dealer Break section (once the shop is open) offers 2 candidates for 20% of the debt each, only while a seat is empty (max **6** at the table, you included). New crew shoot last on the shift they're hired (before an Encore turn) and keep their seat for the run.

| Recruit | Dice | Style | Chance of a 7 |
| --- | --- | --- | --- |
| Snake | 1, 1, 2, 3, 5, 6 | Craps machine (2/3/12 = 25%) | 16.7% |
| Big Mo | 1, 4, 5, 5, 6, 6 | Rolls big (10-12) | 11.1% |
| The Professor | Normal | Odds and Lay Odds limits x2 on his turn | 16.7% |
| Lucky Lou | Normal | +1x mult each time he hits a point | 16.7% |

The game now keeps a **roster** (who's at the table, carries over) separate from the **shooting order** for the shift (roster plus Front of the Line / Encore).

**Crew levels:** skipped for now (owner). **Idea:** start with fewer crew (e.g. 3) and recruit up to 6, as a scaling lever (IDEAS.md).

## Dice Crafting  [Built, Milestone 9]

Edit the faces of **your own dice** (only yours: "You" is the shooter you build up). Edits last the whole run.

| Edit (a comp) | Effect | Price | Shop chance |
| --- | --- | --- | --- |
| Nudge | One face +1 or -1 (up from 6 is 1, down from 1 is 6) | 5% | normal |
| Copycat | Copy one face over another on the same die | 8% | 0.6x |
| Chisel | Carve one face into any number 1-6 | 15% | 0.35x |

- Used at a Dealer Break in the **dice workshop**: pick a face on your left or right die, pick the change (each option shows which totals it changes), then the face rises, flips and lands as its new number.
- **7-floor rule:** an edit is refused if your dice would have fewer than 2 ways (of 36) to roll a 7.
- Note: changing one die alone never changes your 7s (any face has exactly one partner that makes 7). Edit both dice to change them; one-die edits change the other totals.
- Your seat shows 🔨 once edited; your hover card lists your faces.

## The Pit Boss Phone  [Built, Milestone 6b]

Like Clover Pit's phone. After **every won shift**, it rings before the next shift starts: **pick 1 of 3 different permanent perks**. A 2-page tutorial the first time.

| Perk | Effect | Rarity |
| --- | --- | --- |
| +1 way to roll N (2 to 12) | That total comes up more often on everyone's dice (+1 way out of 36, shared over the pairs that make it). +1 to 7 is labelled **Risky**. | Common |
| -1 way to roll 7 | Fewer 7s on everyone's dice. Gets half as likely to be offered each time it's taken; a 7 never drops below 2 ways out of 36. | Rare |
| Remove a character | Pick a crew member (not You); gone for the rest of the run, free. | Uncommon |
| 2 free items | Your next 2 shop cards cost $0. | Uncommon |
| 2 free comps | Two random comps (as many as fit). | Uncommon |

- Perks can be picked again (except where noted); each call offers 3 different ones.
- Dice perks show as purple ☎ badges next to your cards; remaining free items show too.
- **[After v1]** Let it burn (unlocks the Fire Bet) and Different Doubles (side bet) arrive with the "More bets" milestone.

## More Planned Ideas

- **House rules [Built, Milestone 11]** (`js/rules.js`): from shift 3, one random rule per shift, shown as a gold 📜 tag under the shooter (hover or tap to read) and on the opening Dealer Break, with a tutorial the first time.
  - **Tight Odds:** Odds and Lay Odds limited to 2x the line bet (Lay: win at most 2x).
  - **High Stakes:** table minimum doubled.
  - **Skimmed Interest:** interest halved.
  - **Markup:** cards, comps, Shuffle and Hire cost 50% more.
  - **Pit Watch:** one of your cards (random) is switched off for the shift. Only picked if you own a card.
  - **House Die:** every shooter's left die shows the same number (1-6, random) all shift. Skipped for a shooter when it would leave no way to roll 7, or no possible roll (a guaranteed pair the right die can't match). Loaded Shot overrides it.
  - **Dark Side Only:** no Pass Line; only Don't Pass and Lay Odds.
  - Dropped by the owner: Short Table, Stingy Field, Jinxed.
- **Boss rules [Built]:** the last link (shift 8 normally) always gets a red 👑 boss rule. **No Free Lunch** (each shooter's first point pays nothing; bets come back), **Cold Dice** (all mult capped at 1x), **Seven Heaven** (come-out 7s don't pay the Pass Line; it's a tie). Endless shifts pick from normal and boss rules.
- **Pit boss challenges [Built, Milestone 11]:** from shift 2, a challenge on **your own turn only**, shown in a blue 🎯 box with progress. Hit the point; Make 2 points; Hit a point of 4 or 10; Win the Field 3 times; Roll 3 doubles; Survive 6 rolls without a seven-out; Win a Don't Pass bet; Win a bet at 3x mult or more. Reward (random, shown up front): cash (10% of the debt), money off the debt (5%), a free comp, or a free Shuffle. Tutorial the first time.
- **Unlocks [Built, Milestone 12a]** (`js/unlocks.js`): new players start with 7 cards (Hot Hand, Snake Eyes, Lucky Seven, Rattlesnake, Red Dice, Double Up, Cold Read), most comps and the 4 starting crew plus Snake and Big Mo. Everything else unlocks by **fully hidden** goals (the Collection shows only "???"; owner, 2026-10-29). Unlocks count across runs, are saved in the browser, get a "🔓 UNLOCKED!" screen, and show up from your **next run**.
  - Goals (numbers in `CONFIG.unlockGoals`, slowed down 2026-10-29 so about half unlock by run 20): Loaded Die / Reroll / Spare Link / Dealer's Bargain (survive shift 3 / 4 / 5 / 6), Odds Addict (win $2,000 on Odds, all runs), Muggsy (15 sevens right after the point is set), Pit Boss's Pity (the floor opens 15 times), Doubles Charm (4 doubles in one turn), Green Dice ($100 interest in one run), Wrong Way (win 25 Don't Pass bets), Jinx's Shadow (drop Jinx), Lefty's Glove / Dee's Ledger / Rod's Lighter / Ghost Story (survive 8 shifts with that crew member seated), Encore (your turn lasts 15+ rolls), High Roller (win $1,500 on one turn of yours), Front of the Line (hire 4 crew in one run), Sleight of Hand (use 6 dice edits), Loaded Shot (hit 40 points), Copycat (use 4 Nudges), Chisel (use 2 Copycats), Lucky Lou (hit 3 points at 3x mult or more), The Professor (hire 8 crew, all runs).
  - **Reputation [Built]:** every 3 unlocks earns the next lasting bonus, from the next run on (shown on the Collection screen, announced on the unlock screen): +$25 starting cash; +1 comp slot; -1 way to roll 7 on everyone's dice; start with a random uncommon card; +1 card slot; -1 more way to roll 7; +$50 starting cash; start with a Spare Link.
  - **Card power [Tuned 2026-10-29]:** starters trimmed (Hot Hand +0.25x per win, Rattlesnake +0.5x, Snake Eyes 6%, Lucky Seven 3%); locked cards strengthened (Muggsy x3, High Roller x3, Wrong Way +100%, Dee's Ledger +100%, Jinx's Shadow x3, Green Dice +1% per 12, Loaded Die once per shooter; Lefty's Glove, Ghost Story and Front of the Line add +1x mult on that seat's turn).
  - **More bets [Built, Milestone 12b]:** four bet groups, each locked behind a hidden goal and counted toward Reputation. They live on a second board (**➕ More bets** swaps it with the main bets; the button appears once one is unlocked). The mult applies to them like any bet.
    - **Hard Ways** (4/6/8/10): the number as a pair before a 7 or the easy way; 7:1 (4, 10), 9:1 (6, 8). Off on come-outs. Goal: roll 40 pairs that make 4/6/8/10.
    - **Place bets** (4, 5, 6, 8, 9, 10): the number before a 7, stays up; 9:5, 7:5, 7:6. Off on come-outs. Goal: hit 150 points (all runs). The strongest of the four (frequent wins feed Hot Hand and other mult cards), so it unlocks latest.
    - **Come / Don't Come:** only while a point is on; its own come-out, then moves to its number ("Come bet on 6"); even money; no odds behind them. Goal: hit 15 points in one run.
    - **Fire Bet:** before a shooter's first roll, at most one table minimum; pays when that shooter makes 4 / 5 / 6 different points: 24:1 / 99:1 / 299:1 (trimmed from casino 249 and 999 because the mult applies). Goal: one shooter makes 4 different points.
    - Place bets, Hard Ways and unmoved Come bets can be taken back with Clear bets and used to cover a line bet; Come bets on a number and the Fire Bet (after the first roll) are locked in. Pit Boss's Pity now saves every bet a seven-out would beat, except the Field.
  - 📖 Collection button: found items first, then locked "???" tiles; "Reset all progress" link. Testing: `?unlockAll`.
- **Tutorials [Built]:** a 2-page phone tutorial the first time it rings; a 7-page "How to play" intro on first visit (also via the How to play button), a 3-page shop tutorial (including Cut a chain) the first time the shop opens (also via the shop's ? button). [Planned] A phone tutorial. Each shows once per browser.

## New cards and recruit prices  [Built, 2026-10-30]
- **Six new cards** (all locked, hidden goals in `CONFIG.unlockGoals`):
  - **Comeback Kid** (Uncommon): after any seven-out, the next shooter's first point pays x2. Goal: 100 seven-outs, all runs.
  - **Point Collector** (Uncommon): +0.5x mult per different point the shooter has made this turn. Goal: one shooter makes 5 different points.
  - **Loan Shark** (Rare): keep 75% of leftover money (instead of 50%). Goal: finish a shift with $2,500 left.
  - **Hardway Hustler** (Uncommon, only once Hard Ways are unlocked): Hard Ways pay x2; any hard pair adds +0.5x mult for the turn. Goal: win 10 Hard Ways bets.
  - **Steady Hand** (Uncommon, only once Place bets are unlocked): Place 6 and 8 pay +50%. Goal: win 30 Place bets.
  - **Dice Collector** (Uncommon, "You" card): +0.25x mult on your turn per edited face. Goal: 4 edited faces at once.
- **Reputation** continues: 27 unlocks +$100 starting cash, 30 +1 more comp slot, 33 start with a random rare card.
- **Hire prices by strength** (`CONFIG.hirePrices`, measured in the simulator): Hot Rod 40% of the debt, Big Mo 30%, Lucky Lou 25%, Dealer Dee / Lefty / The Professor 20%, Ghost 15%, Snake 10%.
- **Win screen** tidied: lead line, big "7 links to go", then Money left / Dealer's cut / You carry over, then next shift's cash, debt and table minimum.

## Polish  [Built, 2026-10-30]
- **Save bets / Same bets** (rules in DECISIONS.md, logic `saveBets` / `rebet` in shift.js).
- First chip on a line bet covers the table minimum; unaffordable chips switch to one you can afford.
- "+$25" popups float up from winning bets, losses drop away in red.
- ⚙ Settings: sound, quick dice, replay tutorials, reset progress.
- Controls on two rows (chips + Roll; small buttons below).
- **3D dice** (option A): CSS 3D cubes seen from above; the rolled number is on top. Each roll (1 second) tosses the dice up and back, they land, bounce and roll forward to rest. Opposite faces add to 7, red single pip.

## Glossary

- **Shift** (also "session"): one round. Pay the debt by the end or fall.
- **Debt:** what the dealer demands this shift (the goal).
- **Cash:** money in your hand. You bet, shop and pay from it.
- **Interest:** a share of your paid money, added to your cash at each Dealer Break.
- **On table:** money currently in bets.
- **Paid / deposited:** money given to the dealer toward the debt. Safe, but gone from play.
- **Dealer Break:** the pause between shooters to pay (and shop).
- **Shooter:** the crew member currently rolling.
- **Seven-out:** rolling a 7 while a point is on. The shooter's turn ends.
- **Point:** the number set on the come-out that the shooter must hit again before a 7.
- **Mult:** multiplier on winnings ("multi" means the same thing).
- **Card:** an item bought in the shop (5 slots).
- **Perk:** a permanent upgrade from the Pit Boss phone.
- **Tip:** money spent in the shop. Doesn't count toward the debt.
- **Fall:** losing the run.

## Presentation  [Built]

- Fits on one screen without scrolling on desktop and phones: two columns on wide screens, one compact column on phones.
- **The fall [Built]:** the screen shakes, the seats, table and chips tumble into the pit one by one, the screen fades to black on "The chains release.", then the stats screen (`fallMs` in config).
- **Sound [Built]:** made in the browser (no audio files), on by default with a 🔊/🔇 mute button that's remembered. Chip clicks, dice rattle, win chime, point-hit fanfare, a low thud on seven-out, coin sounds for paying and buying, a chain clank, the phone ring, the fall, and a shift-won tune (`soundVolume` in config).
- Dice are drawn with pips and tumble for a moment before landing (`diceRollMs` in config). Tapping the dice rolls them.
- **SEVEN OUT screen:** big and red, shows who sevened out and what you lost, for 5 seconds (tap to skip), then the Dealer Break (and the shop tutorial the first time).
- **POINT HIT screen:** shows total winnings, each bet's winnings, and how much cards and mult boosted them ("normally $12"), for 5 seconds (tap to skip).

## Tech

- Plain HTML, CSS and JavaScript, hosted on GitHub Pages (https://kshime3.github.io/chained-dice/). itch.io later.
- Game logic is kept separate from display code; every tunable number lives in `js/config.js`.

## Milestones

1. [Built] Dice roll and basic bets
2. [Built] Come-out and point phases, Odds, seven-out
3. [Built] Shift: buy-in, turns, win and fall. 3.5: paying the dealer
4. [Built] Crew dice, visible odds (4a); mult and synergies (4b)
5. [Built] Shop: 5a framework and 8 cards; 5b-1 dice cards; 5b-2 Loaded Die, Reroll, Cut a chain, Spare Link
6. [Built] Multiple shifts (6a) and the Pit Boss phone (6b)
7. [Built] Don't Pass (Milestone 7). House rules + pit boss challenges: [Built] Milestone 11
8. [Built] Comps
9. [Built] Dice crafting (your dice). Polish: fall animation and sound [Built]. [Only with owner's permission] Any public release.
10. [Built] Crew growth. 11. [Built] House rules + challenges. 12a. [Built] Unlocks + Collection. 12b. [Built] More bets as unlocks (Hard Ways, Place, Come & Don't Come, Fire Bet)
