# Chained Dice: Game Design Doc (v0.1)

*Working title. A Craps-themed roguelike for the browser, built with Claude Code. Items marked **(proposed)** are placeholders to tune or change.*

## Premise

You wake up chained to a craps table, along with your buddies. A pit boss sets a chip target for each shift. Hit it and the chains hold. Miss it, or go broke, and the chains release and everyone falls through the floor. Then you wake up at the table again.

## Pillars

- **Balatro-style run:** escalating targets, a shop between shifts, modifiers that combine into strategies.
- **Hit the target or die:** one miss ends the run. No health bar.
- **Shared table:** the crew takes turns as shooter, each with weighted dice and their own style, and crew members affect each other.
- **Simple presentation:** placeholder art and sound are fine. Fun comes from the rules.

## Core Loop

1. **Wake up** at the table with a $200 buy-in and a crew.
2. **Shift begins:** the pit boss sets the target. Shift 1 target: **$2,000**.
3. **Rolls:** bet, then the current shooter rolls. The player is one of the shooters.
4. **Seven-out:** each shooter keeps rolling until they seven out, then the next crew member steps in.
5. **Shift ends** once every shooter has had a turn. If your bankroll meets the target, go to the shop. If not, you fall.
6. **Shop:** tip the dealer to buy enhancements.
7. **Next shift** with a higher target. Repeat until you fall. The run has no final shift.

## Loss Conditions

- **Missed target** at the end of a shift: instant fall.
- **Bankroll hits zero:** instant fall.

## Craps Rules (v1 scope)

Keep the bet list small at first.

- **Come-out roll:** 7 or 11 wins pass line bets. 2, 3, or 12 (craps) loses them. Any other number becomes the **point**.
- **Point phase:** the shooter keeps rolling. Hitting the point wins pass line bets. Rolling a 7 is a **seven-out**: pass line bets lose and the shooter changes.
- **v1 bets:** Pass Line, Field, and Odds (behind the pass line).
- **Later bets:** Hard Ways, Come/Don't Come, Place bets, Any Seven.

## Scoring (proposed)

- Winning bets pay **chips** at standard craps odds.
- A **multiplier** applies to payouts, built from modifiers and streaks.
- **Bankroll is your score.** The shift target is the bankroll you must hold when the shift ends. Tips to the dealer come out of the same bankroll.
- Going from $200 to $2,000 is a 10x climb, so bet sizing and multipliers need playtesting.

## The Crew

The seats rotate shooters. A new shooter steps in after each seven-out. Each character has a **dice quirk** and a **style trait**.

| Character | Dice quirk | Style trait |
| --- | --- | --- |
| Lefty | Dice have no 6s | Sevens are rarer, big numbers are impossible |
| Dealer Dee | Dice favor 6s and 8s | Her turn always ends on a seven-out |
| Hot Rod | Normal dice | +1 mult per winning roll; first seven-out costs double |
| Ghost | Even/odd-only die | Streaky, predictable results |
| Jinx | Dice lean toward 3s and 4s, so 7s come up often | Terrible thrower who commonly sevens out |
| You | Normal dice at the start | Dice are upgradable at the shop |

*(All names and quirks are proposed. Start with 4-5 characters, one clear quirk each.)*

**Crew synergies (proposed).** Seat order matters, and characters affect each other:

- **Cold Table:** the shooter after Jinx starts with minus 0.5x mult until their first win.
- **Coach:** the shooter after Dealer Dee gets one free reroll.
- **Mentor:** half of Hot Rod's streak bonus carries to the next shooter.

## The Shop

The shop is **the dealer**. Between shifts, you **tip the dealer** to buy enhancements, paid from your bankroll. The stock rotates, so only some items appear each visit, and rarer items show up less often. The dealer sells:

- **Modifiers:** passive effects that change payouts, rules, or the multiplier.
- **Dice edits:** change a face on any character's dice, including yours (for example, swap a 1 for a 6).
- **Crew changes:** recruit, replace, or upgrade a character.
- **Rerolls:** refresh the shop stock.
- **Rare items:** the **extra chain link** is very rare. It saves you from one fall.

The player can view each character's dice odds so the math stays visible.

## Starter Modifiers (proposed)

- **Hot Hand:** +0.5x mult per consecutive winning roll. Resets on a loss.
- **Loaded Die:** once per shift, reroll one die.
- **Pit Boss's Pity:** ignore your first seven-out each shift.
- **Snake Eyes:** rolling a 2 pays a big flat bonus.
- **Hard Way Hero:** hard way bets pay double.
- **Odds Addict:** odds bets pay a bonus on top of true odds.
- **Lucky Seven:** a come-out 7 also adds bonus chips.

## Presentation

- Top-down or front-on table view with dice, chips, and the crew seated around it.
- Chains visible on the player and crew.
- **The fall:** on a loss, the floor opens and everyone drops. Then the run restarts.
- Placeholder shapes and basic sounds are acceptable for v1.

## Tech and Scope

- **v1 scope: the first shift only.** Build the $200 to $2,000 shift end to end, then scale up with later shifts.
- **Platform:** browser game in plain HTML, CSS, and JavaScript, hosted free (for example itch.io or GitHub Pages).
- **Tools:** Claude Code for building, git for version control.
- **Keep a notes file** in the project with decisions and the next task.

## Milestones

1. Dice roll and basic bets paying out correctly
2. Come-out and point phases, seven-out handling
3. $200 buy-in, shift target, roll-until-seven-out turns, and instant-fall loss
4. Crew rotation with weighted dice
5. Dealer shop with rotating stock and rarity tiers
6. Fall animation, run restart, and polish

## Open Questions

- After shift 1 works, should each target double (proposed), or ramp differently?
- What are the rarity odds for shop items, and how rare is the extra chain link?
- Which crew synergies ship in v1?
- How much should tips cost relative to the bankroll target?

## Kickoff Clarifications (2026-10-23)

These details come from the kickoff brief and take priority over anything above.

- **v1 is the first shift only:** $200 buy-in, $2,000 target. No shop *between shifts* yet, so when the shop opens in v1 is an open question (see DECISIONS.md).
- **You bet on every roll**, whoever is shooting. You are one of the shooters.
- **The shift ends** once every shooter has had one turn (one lap of the table).
- **Payouts** use standard craps odds; a multiplier from modifiers and streaks applies on top.
- **Crew details:**
  - Hot Rod: +1 mult per winning roll; his first seven-out costs double.
  - Ghost: one die rolls only even or only odd numbers; streaky.
  - Jinx: dice lean toward 3s and 4s, so 7s come up often.
- **Starter synergies are part of Milestone 4:** Cold Table (after Jinx), Coach (after Dealer Dee), Mentor (after Hot Rod).
- **Dice odds are shown on screen** for every character, so the math is visible.
- **Chains are visible** on the player and crew. On a loss the floor opens, everyone drops, and the game restarts.

## Open Questions Added at Kickoff

- Dealer Dee "always ends on a seven-out": every turn ends that way, so what makes her different? (Settle before Milestone 4.)
- When does the shop open in a single-shift v1?

## Paying the Dealer (2026-10-23, replaces "reach the target")

The dealer is the bad guy, and you owe them the shift target. Inspired by Clover Pit's ATM.

- **Kitty:** the money in your hand. You bet from it.
- **Dealer break:** before the first shooter, after every seven-out, and once more after the last shooter. You can **deposit** any amount from your kitty.
- **Deposits are paid for good:** safe from bad rolls, out of play, can't be taken back. You can't pay more than you still owe.
- **Win:** the moment your deposits reach the target. Leftover kitty carries over (to later shifts).
- **Fall:** you leave the final Dealer break still owing, or you can't cover the minimum Pass Line bet.
- **Pass Line is required** to roll a come-out. If your kitty is short, the game moves money from your other bets to cover it.
- **The Dealer break is also where the shop lives** (Milestone 5): "Pay the dealer" (debt) and "Tip the dealer" (items). Tips don't count toward the debt.
