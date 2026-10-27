# Wording Rework: "Break the Chain" (draft for owner review)

*Status: approved by the owner and built, 2026-10-27.*

## The idea in one line

**The chains are your sentence; the floor is the threat.** Your chain has 8 links. Survive a shift and the dealer unlocks one. Break all 8 and you walk out free. Fail and the floor opens, and the chains drag the whole crew down with you.

## Words

| Old | New |
| --- | --- |
| "The chains hold." (won a shift) | **"The floor holds."** |
| "The chains release." (fall) | **"The floor opens."** |
| Extra chain link (card) | **Spare Link** |
| Cut a chain (Dealer Break option) | **Trapdoor** |
| Remove a character (phone perk) | **Free Trapdoor** |
| "CHAIN CUT" screen | **"TRAPDOOR"** screen |

## New screens

**Top bar:** a chain of 8 links next to the shift number. Broken links show as open rings: ⛓⛓⛓⛓⛓⛓○○ ("2 of 8 links broken"). In endless mode: "FREE · Endless shift 9".

**Won a shift (shifts 1-7)**, with the link-breaking animation:
> **THE FLOOR HOLDS.**
> The dealer reaches over and unlocks a link. *Clank.*
> **6 links to go.**
> You keep $60. Next: shift 3. You'll get $200 more and owe $500.
> [ Answer the phone ]

**Won shift 8 (the last link):**
> **YOU WALK OUT FREE.**
> The last link falls away. You stand up from the table, and nobody stops you.
> *(stats screen: "Escaped in 8 shifts")*
> The dealer smiles: "Double or nothing?"
> [ Walk away ]  [ Double or nothing ]

- **Walk away:** the run ends as a win. Stats, then Play again.
- **Double or nothing:** the chain goes back on. Endless shifts (9, 10, 11…) with ever-bigger debts, played for score.

**Fall (before escaping):**
> **THE FLOOR OPENS.**
> The chains drag the whole crew down into the dark.
> You broke 3 of 8 links.

**Fall in endless mode:**
> **THE FLOOR OPENS.**
> You walked out free once. Greed brought you back.
> You lasted 4 extra shifts.

**Spare Link saves you:**
> **THE SPARE LINK CATCHES YOU.**
> The floor opens, but your spare link snags on the edge and holds. The dealer sighs and forgives the rest of the debt. *(The shift counts as survived, and a link breaks as normal.)*

**Trapdoor** (was "CHAIN CUT"):
> **TRAPDOOR.**
> The dealer pulls a lever. Jinx's seat drops away. He's gone for the rest of the run.

## Text changes in existing screens

**How to play, page 1** (was "You wake up chained to a craps table"):
> **You wake up chained to a craps table.**
> Your crew is chained up beside you. The dealer leans in: "You owe me $200 by the end of the shift."
> Your chain has **8 links**. Pay off each shift's debt and the dealer unlocks one. **Break all 8 and you walk out free.**
> Fail, and the floor opens. You start with $150 in your kitty.

**How to play, "Paying the dealer" page:** the "You fall if…" line becomes "**The floor opens if:** you can't afford the $5 line bet, or the last shooter sevens out and you still owe money."

**Opening Dealer Break, shift 1:** "The dealer leans in. 'You owe me $200 by the end of the shift. Pay it and I'll unlock a link.' Pay any time between shooters. Paid money is safe, but you can't bet it."

**Opening Dealer Break, later shifts:** "Shift 3. 6 links to go. The pit boss slides $200 into your kitty. The dealer leans in: 'This time you owe me $500.'"

**Shop tutorial, page 3** (was "Cut a chain"): "**Trapdoor.** Don't like a shooter? For 25% of the debt, the dealer will pull the lever under their seat. They drop away for the rest of the run…"

**Phone perk "Free Trapdoor":** "Pick a crew member (not you). The dealer opens the trapdoor under their seat, free."

## The link-breaking animation (end of every won shift)

1. The chain of 8 links appears large across the screen, with the links already broken shown open.
2. The next link glows red-hot and shakes.
3. *Clank:* it cracks and splits in two, the halves spin away and fall, with a few sparks.
4. The count updates: "6 links to go." Then the phone rings, as now.

About 2.5 seconds, tap to skip, with a new metal "snap" sound.

## Scale

Unchanged for shifts 1-5. Shifts 6-8 follow the existing x1.5 growth: $1,800, $2,700, $4,050. A simple bot walks out free about 3-4% of the time; a good human should do better. Endless shifts keep growing x1.5.
