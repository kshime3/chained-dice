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

## Core Loop  [Built for one shift]

1. **Wake up** at the table with the shift's starting cash in your **kitty**.
2. **Dealer break:** pay toward the debt (and later, shop).
3. **The current shooter rolls.** You bet on every roll, whoever is shooting. The shooter keeps rolling until they **seven out**.
4. **Dealer break** after every seven-out, then the next shooter steps up.
5. After the last shooter sevens out: one **final Dealer break**, then the pit boss judges.
6. **Win** the moment your payments reach the debt. Leftover kitty is kept. **[Planned]** The Pit Boss phone rings: pick 1 of 3 perks. Next shift.

## Shifts and Scale

| Shift | Starting cash | Debt owed |
| --- | --- | --- |
| 1 | $100 | $200 |
| 2 | $200 | $500 |
| 3+ | TBD | TBD |

**[Built]** with the old scale ($200 cash, $2,000 debt, one shift only). **[Planned]** Switch to this table. **[Open]** Does "starting cash" replace your leftover kitty, or add to it?

## Paying the Dealer  [Built]

- **Kitty:** the money in your hand. You bet from it.
- **Dealer break:** before the first shooter, after every seven-out, and once more after the last shooter.
- **Payments** come from the kitty, are safe from bad rolls, are out of play, and **can't be taken back**.
- You can't pay more than you owe, and a partial payment always leaves the **$5 minimum Pass Line bet** in your kitty.
- **Pay off debt** is greyed out until your kitty covers the whole debt.

## Losing (the Fall)  [Built, animation Planned]

- **Broke:** on a come-out, your kitty plus money on the table can't cover the $5 minimum Pass Line bet.
- **Short:** you leave the final Dealer break still owing.
- [Planned] The floor opens and everyone drops, then the run restarts.

## Craps Rules  [Built]

- **Come-out roll:** 7 or 11 wins the Pass Line. 2, 3 or 12 (craps) loses it. Any other number (4, 5, 6, 8, 9, 10) becomes the **point**.
- **Point phase:** hitting the point wins the Pass Line. A 7 is a **seven-out**: Pass Line and Odds lose, and the shooter changes.
- **Pass Line is required** (minimum $5) to roll a come-out. If your kitty is short, money moves automatically from your other bets (Field first, then Odds). Once a point is set, the Pass Line is locked.
- **Odds:** only while a point is on, up to 3x the Pass Line on 4/10, 4x on 5/9, 5x on 6/8. Pays true odds (2:1, 3:2, 6:5), rounded down. Can be taken back at any time. A winning Odds bet returns to your kitty.
- **Field:** one-roll bet. 3, 4, 9, 10, 11 pay even money; 2 pays double; 12 pays triple; 5, 6, 7, 8 lose.
- Winning Pass Line and Field bets are paid and stay on the table. "Clear bets" takes back everything that isn't locked.
- **Chips:** $5, $25, $100. No maximum bet.
- **[Planned]** Hard Ways, Come/Don't Come, Place bets, Any Seven. Phone unlocks: Fire Bet, Different Doubles.

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

## The Shop (the Stickman)  [Planned: Milestone 5]

- At every Dealer break, a **Tip the dealer** section shows **3 random cards**.
- **Shuffle** replaces the stock for a price that rises each time in a shift.
- **Prices are a share of the current shift's debt,** rounded to the nearest $5:

| Rarity | Price | Chance per slot |
| --- | --- | --- |
| Common | 5% | 60% |
| Uncommon | 10% | 30% |
| Rare | 25% | 9% |
| Extra chain link | 50% | 1% |

- **5 card slots** to start. A "+1 slot" card may come later.
- Paid from the kitty; tips **don't** count toward the debt.
- Presentation (3D, later): run by the stickman; open it by clicking his bank of chips.
- **[Open]** Card packs, like Balatro. A second currency (tickets)? Leaning toward kitty money only.

## Cards  [Planned]

Full list: `docs/Store-Cards-Phone-Scales.xlsx`.

| Card | Effect | Rarity |
| --- | --- | --- |
| Rattlesnake | Rolling snake eyes (1+1) adds +1x mult. Resets each shooter. | Common |
| Double Up | Doubles become more likely (+1 way out of 36). | [Open] |
| Muggsy | A seven right after the point is set costs double, but the next shooter pays double. | [Open] |
| Red Dice | Craps on the come-out wins even money. | Common ([Open]: too strong?) |
| Green Dice | Each 12 rolled raises kitty interest by 0.5%. Interest is paid after every shooter. | Rare |
| Hot Hand | +0.5x mult per winning roll in a row; resets on a roll with no win. | Common |
| Snake Eyes | Rolling a 2 pays a bonus. | Common |
| Lucky Seven | A come-out 7 pays a bonus. | Common |
| Odds Addict | Odds pay 50% extra. | Uncommon |
| Loaded Die | Once per shift, reroll one die after seeing a roll. | Uncommon |
| Pit Boss's Pity | The first seven-out of the shift (any shooter) is ignored. Bets stay and the shooter keeps rolling. | Uncommon |
| Doubles Charm | Every 3rd roll is a pair. | Rare |
| Reroll | Cancel a roll and roll again. | [Open] |
| Extra chain link | Saves you from one fall. | Very rare |

**Cut a chain:** pay to drop a crew member through the floor, removing their seat and synergy. Likely a fixed Dealer break option rather than a random card.

**"+1 odds" means +1 way out of 36:** one extra combination for that total, so a 2 goes from 1 in 36 to 2 in 37.

## The Pit Boss Phone  [Planned]

Like Clover Pit's phone. After **every won shift**, it rings and you **pick 1 of 3 permanent perks**:

- -1 way to roll a 7.
- +1 way to roll any one total (2 through 12). +1 to 7 is a deliberate trap, so label it clearly.
- Remove a character from the table (a free Cut a chain).
- 2 items from the shop are free.
- **Let it burn:** unlocks the **Fire Bet** side bet, paid on how many different points the shooter makes: 4 points 25:1, 5 points 250:1, 6 points 1000:1.
- **Different Doubles:** unlocks a side bet paid on how many different doubles the shooter rolls before a 7: 3 doubles 4:1, 4 doubles 8:1, 5 doubles 15:1, 6 doubles 100:1.

## More Planned Ideas

- **Pit boss challenges:** a small challenge each shooter's turn, with a reward. Own milestone after the shop.
- **House rules:** one rule twist per shift, like Balatro's boss blinds. For later shifts.
- **How-to-play intro** for players new to craps.

## Glossary

- **Shift** (also "session"): one round. Pay the debt by the end or fall.
- **Debt:** what the dealer demands this shift (the goal).
- **Kitty:** money in your hand. You bet, shop and pay from it.
- **On table:** money currently in bets.
- **Paid / deposited:** money given to the dealer toward the debt. Safe, but gone from play.
- **Dealer break:** the pause between shooters to pay (and shop).
- **Shooter:** the crew member currently rolling.
- **Seven-out:** rolling a 7 while a point is on. The shooter's turn ends.
- **Point:** the number set on the come-out that the shooter must hit again before a 7.
- **Mult:** multiplier on winnings ("multi" means the same thing).
- **Card:** an item bought in the shop (5 slots).
- **Perk:** a permanent upgrade from the Pit Boss phone.
- **Tip:** money spent in the shop. Doesn't count toward the debt.
- **Fall:** losing the run.

## Tech

- Plain HTML, CSS and JavaScript, hosted on GitHub Pages (https://kshime3.github.io/chained-dice/). itch.io later.
- Game logic is kept separate from display code; every tunable number lives in `js/config.js`.

## Milestones

1. [Built] Dice roll and basic bets
2. [Built] Come-out and point phases, Odds, seven-out
3. [Built] Shift: buy-in, turns, win and fall. 3.5: paying the dealer
4. [Built] Crew dice, visible odds (4a); mult and synergies (4b)
5. [Planned] Shop: 5a framework and simple cards, 5b trickier cards
6. [Planned] Multiple shifts at the new scale, plus the Pit Boss phone
7. [Planned] Fall animation, restart, how-to-play, polish, itch.io release
