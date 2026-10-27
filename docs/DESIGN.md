# Chained Dice: Game Design (v0.2)

*A Craps-themed roguelike for the browser. This is the single current version of the design. The history of how we got here is in `DECISIONS.md`. Status tags: **[Built]**, **[Planned]**, **[Open]** (still to decide).*

## Premise

You wake up chained to a craps table with your crew. The dealer, the bad guy, says you owe them money by the end of the shift. Pay it and the chains hold. Fail, or go broke, and the chains release and everyone falls through the floor. Then you wake up at the table again.

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

1. **Wake up** at the table with the shift's starting cash in your **kitty**.
2. **Dealer Break:** pay toward the debt (and later, shop).
3. **The current shooter rolls.** You bet on every roll, whoever is shooting. The shooter keeps rolling until they **seven out**.
4. **Dealer Break** after every seven-out, then the next shooter steps up.
5. After the last shooter sevens out: one **final Dealer Break**, then the pit boss judges.
6. **Win** the moment your payments reach the debt. Leftover kitty is kept. **[Planned, 6b]** The Pit Boss phone rings: pick 1 of 3 perks. **[Built]** Next shift: the new cash is added to your kitty and a bigger debt starts. From shift 2, the shop is open on the opening Break.
7. **Fall:** the run ends with a **stats screen [Built]**: shifts survived (your score), rolls and doubles, longest run without a 7, longest turn, biggest hit and loss, won/lost at the table, paid to the dealer and interest, spent in the shop, points hit and seven-outs, highest mult, best shooter, a chart of your money over the run (shift starts marked), a chart of every total rolled against what the dice odds expected, and your cards. Play again starts a new run at shift 1.

## Shifts and Scale

Tested with the simulator (`docs/BALANCE.md`).

| Shift | Cash added | Debt owed | House rule |
| --- | --- | --- | --- |
| 1 | $150 | $200 | none |
| 2 | $150 | $300 | none |
| 3 | $200 | $500 | 1 random |
| 4 | $250 | $800 | 1 random |
| 5 | $300 | $1,200 | 1 random |
| 6+ | about 1.5x per shift | | 1 random |

**[Built]** All shifts use this scale (`shifts` in config). Cash is **added** to your leftover kitty (bets left on the table come back too). Cards, cut crew and interest boosts carry over; payments and once-a-shift effects (Pity, Loaded Die, Hot Rod's double cost) reset.

## Paying the Dealer  [Built]

- **Kitty:** the money in your hand. You bet from it.
- **Dealer Break:** before the first shooter, after every seven-out, and once more after the last shooter.
- **Payments** come from the kitty, are safe from bad rolls, are out of play, and **can't be taken back**.
- You can't pay more than you owe, and a partial payment always leaves the **$5 minimum Pass Line bet** in your kitty.
- **Pay off debt** is greyed out until your kitty covers the whole debt.
- **Interest [Built]:** at every Dealer Break after a seven-out, 5% of everything you've paid so far (rounded down) goes into your kitty. Shown at the top of the screen. Rewards paying early.

## Losing (the Fall)  [Built, animation Planned]

- **Broke:** on a come-out, your kitty plus money on the table can't cover the $5 minimum Pass Line bet.
- **Short:** you leave the final Dealer Break still owing.
- A seven-out that leaves you broke (and unable to pay off the debt) is an instant fall, with no Dealer Break.
- [Planned] The floor opens and everyone drops, then the run restarts.

## Craps Rules  [Built]

- **Come-out roll:** 7 or 11 wins the Pass Line. 2, 3 or 12 (craps) loses it. Any other number (4, 5, 6, 8, 9, 10) becomes the **point**.
- **Point phase:** hitting the point wins the Pass Line. A 7 is a **seven-out**: Pass Line and Odds lose, and the shooter changes.
- **Pass Line is required** (minimum $5) to roll a come-out. If your kitty is short, money moves automatically from your other bets (Field first, then Odds). Once a point is set, the Pass Line is locked.
- **Odds:** only while a point is on, up to 3x the Pass Line on 4/10, 4x on 5/9, 5x on 6/8. Pays true odds (2:1, 3:2, 6:5), rounded down. Can be taken back at any time. A winning Odds bet returns to your kitty.
- **Field:** one-roll bet. 3, 4, 9, 10, 11 pay even money; 2 pays double; 12 pays triple; 5, 6, 7, 8 lose.
- Winning Pass Line and Field bets are paid and stay on the table. "Clear bets" takes back everything that isn't locked.
- **Chips:** $5, $25, $100. No maximum bet.
- **[Planned, after v1]** A "More bets" milestone: Place bets, Hard Ways, Come with its own Odds (some as phone unlocks). Phone unlocks: Fire Bet, Different Doubles. The base game is finished first.

## The Crew  [Built]

Seat order: **Lefty, Dealer Dee, Hot Rod, Jinx, Ghost, You.** Dice are lists of faces in `config.js`; each listed face is equally likely.

| Character | Dice | Chance of a 7 | Style |
| --- | --- | --- | --- |
| Lefty | Each die rolls 1-5 (no 6s) | 16.0% | 11 and 12 impossible |
| Dealer Dee | Sticky dice: left 1 + right 6 can't land together | 14.3% | Turns tend to last longer |
| Hot Rod | Normal | 16.7% | +1x mult per winning roll; first seven-out of the shift costs double |
| Jinx | Faces 1, 2, 3, 3, 4, 4 | 22.2% | Nothing above 8 |
| Ghost | Right die evens-only or odds-only, picked each turn | 16.7% | Streaky |
| You | Normal | 16.7% | Upgradable later |

**Synergies (seat order matters):**
- **Mentor (Hot Rod to Jinx):** half of Hot Rod's mult bonus carries over.
- **Cold Table (Jinx to Ghost):** -0.5x mult until the first winning roll.

**Hot Rod's double cost:** your losing Pass Line and Odds are charged again from the kitty, never below the $5 minimum.

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
| Extra chain link | 50% | 1% |

- **5 card slots** to start. A "+1 slot" card may come later.
- Paid from the kitty; tips **don't** count toward the debt. Buying or shuffling can't take the kitty below $5.
- Cards you own never appear in the stock. Selling gives back half the price.
- Presentation (3D, later): run by the stickman; open it by clicking his bank of chips.
- **[Open]** Card packs, like Balatro. A second currency (tickets)? Leaning toward kitty money only.

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
| Extra chain link [Built] | When you would fall, it snaps instead: the shift counts as survived and the rest of the debt is forgiven. Takes a slot until used. | Very rare |

**Cut a chain [Built]:** a fixed Dealer Break option (once the shop is open) for 25% of the debt. Drops a crew member who hasn't shot yet this shift (never You) through the floor for the rest of the run; seats close up and synergies change.

**"+1 odds" means +1 way out of 36 [Built]:** one extra combination for that total, so a 2 goes from 1 in 36 to 2 in 37. Dice with fewer faces (like Lefty's) are scaled so their plain combos still count as 36.

## The Pit Boss Phone  [Built, Milestone 6b]

Like Clover Pit's phone. After **every won shift**, it rings before the next shift starts: **pick 1 of 3 different permanent perks**. A 2-page tutorial the first time.

| Perk | Effect | Rarity |
| --- | --- | --- |
| +1 way to roll N (2 to 12) | That total comes up more often on everyone's dice (+1 way out of 36, shared over the pairs that make it). +1 to 7 is labelled **Risky**. | Common |
| -1 way to roll 7 | Fewer 7s on everyone's dice. Gets half as likely to be offered each time it's taken; a 7 never drops below 2 ways out of 36. | Rare |
| Remove a character | Pick a crew member (not You); gone for the rest of the run, free. | Uncommon |
| 2 free items | Your next 2 shop cards cost $0. | Uncommon |

- Perks can be picked again (except where noted); each call offers 3 different ones.
- Dice perks show as purple ☎ badges next to your cards; remaining free items show too.
- **[After v1]** Let it burn (unlocks the Fire Bet) and Different Doubles (side bet) arrive with the "More bets" milestone.

## More Planned Ideas

- **Pit boss challenges:** a small challenge each shooter's turn, with a reward. Own milestone after the shop.
- **House rules [Planned, Milestone 7]:** from shift 3, one random rule per shift, announced on the opening Dealer Break, with a tutorial the first time. Starter list: **Tight Odds** (Odds capped at 2x), **Short Table** (a random crew member sits out), **High Roller** ($25 minimum), **Stingy Field** (12 pays only double), **Dealer's Cut** (interest halved), **Markup** (shop prices +50%), **Jinxed** (Jinx shoots twice), **Pit Watch** (one of your cards is switched off).
- **Card unlocks [Planned, Milestone 8]:** new players start with Hot Hand, Snake Eyes, Lucky Seven, Rattlesnake, Red Dice and Double Up. Others unlock by goals: Odds Addict (win $500 total on Odds), Muggsy (5 point-7s), Pit Boss's Pity (fall 5 times), Doubles Charm (3 doubles in one turn), Green Dice ($50 interest in one run), Loaded Die (survive shift 2), Reroll (survive shift 3), Extra chain link (survive shift 4). Each unlock gets an announcement. Progress is saved in the browser; a Collection screen shows locked cards and their goals.
- **Tutorials [Built]:** a 2-page phone tutorial the first time it rings; a 7-page "How to play" intro on first visit (also via the How to play button), a 3-page shop tutorial (including Cut a chain) the first time the shop opens (also via the shop's ? button). [Planned] A phone tutorial. Each shows once per browser.

## Glossary

- **Shift** (also "session"): one round. Pay the debt by the end or fall.
- **Debt:** what the dealer demands this shift (the goal).
- **Kitty:** money in your hand. You bet, shop and pay from it.
- **Interest:** a share of your paid money, added to your kitty at each Dealer Break.
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
5. [Built] Shop: 5a framework and 8 cards; 5b-1 dice cards; 5b-2 Loaded Die, Reroll, Cut a chain, Extra chain link
6. [Built] Multiple shifts (6a) and the Pit Boss phone (6b)
7. [Planned] House rules
8. [Planned] Card unlocks and the Collection screen
9. [Built] Polish: fall animation and sound. [Only with owner's permission] Any public release.
10. [After v1] More bets (Place, Hard Ways, Come)
