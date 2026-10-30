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
> You have $200 left. The dealer takes his cut, so you carry $100 into the next shift. Next: shift 3. You'll get $175 more and owe $550.
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
> Fail, and the floor opens. You start with $150 in your cash.

**How to play, "Paying the dealer" page:** the "You fall if…" line becomes "**The floor opens if:** you can't afford the $5 line bet, or the last shooter sevens out and you still owe money."

**Opening Dealer Break, shift 1:** "The dealer leans in. 'You owe me $200 by the end of the shift. Pay it and I'll unlock a link.' Pay any time between shooters. Paid money is safe, but you can't bet it."

**Opening Dealer Break, later shifts:** "Shift 3. 6 links to go. The pit boss slides $200 in cash. The dealer leans in: 'This time you owe me $500.'"

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

## Added 2026-10-28: dealer's cut
- Win screen: "You have $200 left. The dealer takes his cut, so you carry $100 into the next shift."
- Next opening Break: "The dealer kept $100 of your leftover money as his cut."
- How to play, "Paying the dealer": "Money left over when you win a shift carries into the next one, but the dealer takes 50% of it as his cut."

## Added 2026-10-29: house rules and challenges (Milestone 11)
- Table tag: "📜 House rule: Tight Odds" (gold); last link: "👑 Boss rule: No Free Lunch" (red). Hover or tap for the full text.
- Opening Break adds: "House rule this shift: Markup. Shop prices are 50% higher (cards, comps, Shuffle, Hire)."
- House Die: "Every shooter's left die is set to 4 this shift (unless that leaves no way to roll 7)."
- Pit Watch: "The pit boss is watching your Doubles Charm. It's switched off this shift." (badge greyed with 👁)
- Dark Side Only: Pass Line shows "Closed: Dark Side Only"; clicking it: "House rule, Dark Side Only: no Pass Line this shift. Bet the Don't Pass instead."
- Challenge box: "🎯 Roll 3 doubles (2/3) → $110 cash"; done: "🎯 Challenge done: Roll 3 doubles ✓"; message: "Challenge complete! The pit boss hands you $110 cash."
- Free shuffle button: "Shuffle (free x1)"; message "Free shuffle from the pit boss."

## Added 2026-10-29: unlocks (Milestone 12a)
- Unlock screen: "🔓 UNLOCKED! Odds Addict. New card. It can show up from your next run. See it in the 📖 Collection."
- Collection: "22 of 46 found. Locked things unlock by playing. How? That's for you to discover." Locked tile: "??? 🔒 Locked".
- How to play, last page "Many runs": "You probably won't walk out free on your first try. That's the point. Many cards, comps and crew start locked. Each unlocks when you do something special during a run. What? That's for you to discover."
- Collection "⭐ Reputation": "Every 3 unlocks, the house remembers you: a lasting bonus from your next run on." Earned steps show "✓ +$25 starting cash"; later ones "9 unlocks: -1 way to roll 7 on everyone's dice".
- Unlock screen extra line: "⭐ Reputation up! From your next run: +1 comp slot".

## Added 2026-10-29: more bets (Milestone 12b)
- Button: "➕ More bets" / "⬅ Main bets". Board note: "Hard Ways and Place bets are off on come-out rolls. Tap a bet to add your chip."
- Messages: "Come bets open once a point is set." "The Fire Bet goes down before a shooter's first roll." "Place 6 bet is now $12. (Off until a point is set.)" Roll text: "Come moves to the 5." "Come bet on 5 wins $10."
- Unlock screen: "New bet (find it under ➕ More bets)". Tutorial pages per bet use the Collection text.

## Added 2026-10-30: polish pass
- Buttons: "💾 Save bets", "↻ Same bets". Messages: "Saved: Pass Line $5, Odds $15. Press ↻ Same bets to put them back." / "Placed Pass Line $5. Odds wait for a point: press again once it's set." / "Not enough cash for Odds." / "No saved bets yet. Put chips down, then press 💾 Save bets."
- Settings: "Sound", "Quick dice (no tumbling animation)", "Tutorials: Show them again", "Unlocks and Reputation: Reset all progress".
- Unlock reason (unlock screen and Collection tile): "Unlocked by surviving shift 3." / "Unlocked by winning $2,000 on Odds bets (all runs)." / "Unlocked by seeing 100 seven-outs (all runs)." Starters show no line.
- Paying: "Pay the dealer: the drop box", button "Drop a plaque ($20)", message "Dropped a $20 plaque in the box. $140 to go." / "Not enough cash: a plaque can't take your cash below $5." How to play: "drop plaques into the dealer's drop box. Each plaque is 10% of the debt (the last one pays exactly what's left), or pay it all at once."
- Mult pop: "+0.5x mult".
