# Ideas

Parked ideas and later features. Not in v1 unless moved into the design.

**Release plan (owner, 2026-11-07):** 1.0.x updates are quality-of-life only (clarity, controls, looks, bug fixes). Major card additions and new mechanics wait for **release 2.0**.

## Release 2.0
- **Come Odds (owner, 2026-11-07):** odds behind Come bets once they move to a number. Plus new cards that boost Come Odds, and higher-rarity cards that boost Pass Odds and Come Odds together. Odds Addict should cover Come Odds too; Dee's Ledger and Professor's Notes stay Pass Odds only.
- **Rebalance (owner: "a lot of rebalancing to do"):** a run escaped in 8 shifts with $139K cash on a $12,500 debt and a 21x mult. Main causes: Hot Rod's uncapped +1x per winning roll (+15x), side-bet wins (Hard Ways) counting toward Hot Rod and Hot Hand streaks, Double Up feeding Hard Ways. Also review Heater.
- **Table minimum on every bet?** Real craps only applies it to line bets; decide during the rebalance.
- **Screen shake on big wins** (bigger shake for bigger wins), with a setting to turn it off. Display only, so it could come earlier if wanted.
- **Open more bets earlier** for fun: today Hard Ways need 40 hard pairs, Fire Bet 4 points by one shooter, Come 15 points in one run, Place Bets 150 points (all runs). Options: lower goals, unlock one group per shift in the first run, or start with Hard Ways and Place Bets.
- **Card idea (owner): odds that grow.** Max Odds drops to 1x, but every point you make raises your max Odds by 1x (for the run or the shift: to decide). Needs a balance run.
- **Seat Swap with 3 uses (owner).** Today it's one use and only matters in niche cases (Hot Rod's Mentor, Torch Pass, Jinx's Cold Table, Muggsy, Cold Read, Comeback Kid, Early Bird). Making comps multi-use is a new mechanic, so it waits for 2.0 and a balance run. 1.0.2 only makes its text say what it's for.

## Later shifts
- After shift 1, each shift target doubles ($2,000, $4,000, $8,000, ...).
- The run has no final shift. Keep going until you fall.
- Shop between shifts.

## Later bets
- Hard Ways, Come / Don't Come, Place bets, Any Seven.

## Later modifiers
- Hard Way Hero needs Hard Ways bets first.

## Presentation
- Real art and sound to replace placeholders.

## Quality of life
- A "repeat last bets" button, and a short roll history ("last 10 rolls").

## Long-term: full 3D (owner's goal, far off)
- Owner wants the game fully 3D eventually, first-person at the table like Clover Pit: look around, see the other players and the room.
- **Plan (owner, 2026-10-23):** finish the whole game first in the current flat layout with shapes. Build the rules and structure here, then grow it into the 3D "world".
- Keeping rules (dice, bets, crew, shop) separate from display code means a 3D version can reuse the logic files and only replace the display.
- Will need a library decision when we get there (for example Three.js in the browser, or a game engine). Ask the owner first.

## Teaching the game (owner priority, later)
- Craps is confusing for newcomers. Balatro and Clover Pit explain themselves well. Add simple instructions at the start, maybe a guided first few rolls.
- Ideas: hover/tap a bet to see what it does; highlight which numbers win or lose right now.

## Paying the dealer
- Clover Pit-style interest: unpaid debt grows, or deposits earn a small bonus.
- The dealer reacts (taunts, nods) depending on how much you pay.

## Claude's 3 ideas for brainstorming (2026-10-23)
1. **Pit boss bounties.** Each shooter's turn, the pit boss posts one small challenge, like "Hit a point of 4 or 10", "Win the Field 3 times in a row" or "Don't seven out in your first 5 rolls". Complete it for a reward: cash, a free item, or a cut to the dealer's debt. It gives every turn a goal beyond "win money", like Balatro's blinds.
2. **House rules (boss twists).** Later shifts add one rule change shown at the start, like "Field pays only 1:1 on 12", "Odds capped at 2x" or "Come-out 11s don't pay". Like Balatro's boss blinds, it forces you to adapt instead of repeating one strategy.
3. **Cut a chain.** Pay the dealer (or give up something) to cut a crew member's chain. They're gone and drop through the floor, and the shift gets one shooter shorter. Skip Jinx and lose the bad thrower, but also his seat in the rotation and any synergy. It ties the chains theme to seat-order strategy and is a dark, memorable moment.

## Shop item ideas
- **Doubles Charm:** every 3rd roll is a pair (owner's idea, first proposed for Hot Rod). Pairs never make 7. Pairs nicely with Hard Ways later.
- **Reroll perk:** once per turn (or shift), cancel a roll and roll again. Was Dealer Dee's "Coach" synergy, moved here by the owner.

## From the owner's spreadsheet (2026-10-23), not built yet
- **Pit Boss phone** (like Clover Pit's phone): offers permanent perks between shifts. Includes +1 odds for any total, -1 odds for 7, remove a character, 2 free shop items, and new side bets (Fire Bet, Different Doubles).
- **Card packs** like Balatro.
- **Interest on the cash** (Green Dice card).
- **Presentation:** the shop is run by the stickman; open it by clicking the bank of chips next to him.
- **Possible second currency** (tickets) for the shop. Open question.

## After v1: More bets milestone (owner agreed 2026-10-23)
- Place bets first (most common), then Hard Ways (unlocks Hard Way Hero), then Come bets with their own Odds.
- Some arrive as Pit Boss phone unlocks, so new players start simple.

## Presentation polish (later)
- Better dice art, sounds for rolls and the seven-out, chip stacks on bets.

## Stats ideas (later)
- Best-ever records across runs (longest run, most shifts), saved in the browser.
- Share a run summary as an image or text.

## Known small issues
- A card taken free (phone perk) can be sold for half its normal price. Could make free cards sell for $0.

## Mechanical growth (Claude's suggestions, 2026-10-27; owner to choose)
1. **Bet against the shooter (Don't Pass / Don't Come).** Makes bad shooters like Jinx valuable instead of just bad. Every seat becomes a decision: bet with them or against them.
2. **Dice crafting.** Buy and edit faces on any crew member's dice (the "dice edits" from the original design). The Balatro deck-building feel: you shape the dice over a run. Your own dice could be upgraded.
3. **Consumables (one-use chips).** Like Balatro's tarot/planet cards: "next roll can't be 7", "double the next payout", "swap two seats", "call the point". Short-term power you choose when to spend.
4. **Crew growth.** Recruit new crew with new quirks, level crew up, crew-specific cards ("Lefty's Glove": Lefty gets his 6s back). Seat-order builds get deeper.
5. **More bets as unlocks** (Place, Hard Ways, Come, Fire Bet, Different Doubles): more ways to win, and the phone can unlock them.
6. **House rules and pit boss challenges** [Built, Milestone 11].
7. **Dealer loans.** Borrow from the dealer mid-shift at steep interest. A risk lever when you're about to go broke.
8. ~~**Card upgrades / editions.**~~ Dropped by the owner (2026-11-01): not a milestone.

## Making "bet against the shooter" pay (from the Milestone 7 simulator finding)
- **Jinx's come-out curse:** when Jinx shoots, come-out 7s don't count against Don't Pass (they're a tie). Makes him the perfect shooter to bet against.
- **Crew-specific dark cards:** "Jinx's Shadow" (Don't Pass on Jinx pays 2x), "Hot Rod's Rival" (Don't Pass on Hot Rod gains mult when he sevens out).
- **Smaller Lay limit option** for the dark side, or a card that lets Lay Odds pay true odds +25%.

## Huge numbers (owner, 2026-10-27) [Built 2026-11-01 for endless: big-number display, growing chips, x-mult cards, compounding interest, high scores. Not built: a whole-run version; card upgrades dropped by the owner]
- Part of the fun of Balatro and Clover Pit is that scores scale to 100 million and beyond. Endless mode should get there: multiplying mults (x2, x3 cards stacking), mult that multiplies other mult, interest that compounds, chip values that grow (a $5 chip becomes $5,000 late in a run). Needs number formatting for big values ($1.2M, $45B) and a debt curve that keeps up.

## Card idea from the owner (2026-10-27): voluntary link break
- Built as **Dealer's Bargain** (owner chose: add a link, get -1 way to roll 7). The other version ("Hacksaw": break a link now, +1 way to roll 7) could still be a future card.

## Hot streak indicator (owner, 2026-10-27)
- A visible **hot streak** counter: every roll in a row where you win money adds 1; a roll that loses money resets it. Show it on screen (flames that grow?).
- Later, cards and perks can use it to raise mult ("+0.1x mult per streak", "at 5 in a row, double the next payout"). Hot Hand already tracks something similar (winning rolls in a row, reset on a losing roll); the indicator would make it visible to everyone, with or without the card.

## "You" cards (owner, 2026-10-28)
- Now that only your dice can be crafted, add cards that make **your turn** special: **take an extra turn** (shoot twice per shift), "your winnings x2 on your own turn", "your seat moves to first", "your crafted faces also apply to the next shooter". These make dice crafting pay off. Candidate for Milestone 10 (crew growth).

## Starting crew size (owner, 2026-10-29)
- If 6 shooters feels like too many, start with 3 crew and let recruiting grow the table to a maximum of 6. Helps the game grow and scale over a run. Would need a `startingCrew` setting and more recruits. **Built 2026-10-29** with the same debts (owner wants it harder) and Jinx always seated.

## Polish ideas (2026-10-30)
- [Built 2026-11-01] Press-and-hold help on phones; keyboard shortcuts.

## Card ideas (2026-10-30)
- [Built 2026-11-01 in the Crew theme] Crew Captain, Jinx Jar.

## Planned next (owner agreed, 2026-10-30)
1. Friends playtest round (owner shares the link; collect where people quit and what confuses them).
2. Systems that arrive over the first runs + a guaranteed early unlock.
3. Phone layout with tabs (Table / Hand / Crew) and a code cleanup (split ui.js, an automatic play-through in tests.html).
4. Builds: themed cards that reward a strategy [Built 2026-10-31: 4 themes, 12 cards]. Parked: shop leaning toward your theme (owner said no for now); a crew theme; more "grows" cards per theme.
5. Art (crew portraits, dungeon-casino look, chain motif) and a quiet background music loop.

## Roadmap goal: Android app (2026-10-31)
**Now an active plan: see docs/ANDROID.md (2026-11-01).**
If the owner feels good after art, music and a wider playtest: wrap with Capacitor, add rewarded ads (or a one-time price / remove-ads purchase), Play Store listing and closed testing. Rough effort: 1.5-2.5 months of calendar time, much of it waiting. Owner's explicit permission needed before any publishing.

## Art ideas (2026-11-01)
- [Built 2026-11-01] Art for comps and Pit Boss phone perks in style E.
- New cards need a drawing in js/card-art.js (otherwise they show the plain die).

## Open from the 2026-11-01 balance question
- [Built 2026-11-01] "+1 way to roll 7" is now a dark-side piece (gated, with a seven-out bonus).
- [Built 2026-11-01] Dark side late game: Body Count. Still possible later: a stronger Graveyard Shift.

## Tablet layout (2026-11-04)
- On tall tablet screens (7- and 10-inch, portrait) the game fills only the top half; the rest is empty background (see store/tablet7-*.png, tablet10-*.png). Fix: scale the layout up to fill tall screens (layout only, no gameplay change), then remake the tablet screenshots with `node tools/make-store-art.js` and upload them. Owner chose to skip tablet screenshots for launch.
