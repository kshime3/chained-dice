# Ideas

Parked ideas and later features. Not in v1 unless moved into the design.

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
- **Interest on the kitty** (Green Dice card).
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
6. **House rules and pit boss challenges** (already planned): each shift plays differently and gives short goals.
7. **Dealer loans.** Borrow from the dealer mid-shift at steep interest. A risk lever when you're about to go broke.
8. **Card upgrades / editions.** Buying a card you own levels it up (Hot Hand II), or cards come in foil/gold versions with extra effects.

## Making "bet against the shooter" pay (from the Milestone 7 simulator finding)
- **Jinx's come-out curse:** when Jinx shoots, come-out 7s don't count against Don't Pass (they're a tie). Makes him the perfect shooter to bet against.
- **Crew-specific dark cards:** "Jinx's Shadow" (Don't Pass on Jinx pays 2x), "Hot Rod's Rival" (Don't Pass on Hot Rod gains mult when he sevens out).
- **Smaller Lay limit option** for the dark side, or a card that lets Lay Odds pay true odds +25%.

## Huge numbers (owner, 2026-10-27; not now)
- Part of the fun of Balatro and Clover Pit is that scores scale to 100 million and beyond. Endless mode should get there: multiplying mults (x2, x3 cards stacking), mult that multiplies other mult, interest that compounds, chip values that grow (a $5 chip becomes $5,000 late in a run). Needs number formatting for big values ($1.2M, $45B) and a debt curve that keeps up.

## Card idea from the owner (2026-10-27): voluntary link break
- Built as **Dealer's Bargain** (owner chose: add a link, get -1 way to roll 7). The other version ("Hacksaw": break a link now, +1 way to roll 7) could still be a future card.

## Hot streak indicator (owner, 2026-10-27)
- A visible **hot streak** counter: every roll in a row where you win money adds 1; a roll that loses money resets it. Show it on screen (flames that grow?).
- Later, cards and perks can use it to raise mult ("+0.1x mult per streak", "at 5 in a row, double the next payout"). Hot Hand already tracks something similar (winning rolls in a row, reset on a losing roll); the indicator would make it visible to everyone, with or without the card.

## "You" cards (owner, 2026-10-28)
- Now that only your dice can be crafted, add cards that make **your turn** special: **take an extra turn** (shoot twice per shift), "your winnings x2 on your own turn", "your seat moves to first", "your crafted faces also apply to the next shooter". These make dice crafting pay off. Candidate for Milestone 10 (crew growth).

## Starting crew size (owner, 2026-10-29)
- If 6 shooters feels like too many, start with 3 crew and let recruiting grow the table to a maximum of 6. Helps the game grow and scale over a run. Would need a `startingCrew` setting and more recruits.
