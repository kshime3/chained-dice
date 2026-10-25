# Decisions

Dated log of every decision and why. Newest at the bottom.

## 2026-10-23

- **Plain HTML/CSS/JS, no frameworks or build tools.** Why: beginner-friendly, runs by opening `index.html`, free hosting on itch.io or GitHub Pages.
- **v1 covers only the first shift ($200 to $2,000).** Why: prove the core loop is fun before adding scaling.
- **Logic and display code in separate files; all tunable numbers in one config file.** Why: easy to tune and test the rules without touching the screen code.
- **Git from day one, one commit per working milestone.** Why: a safe save point we can always go back to.
- **Project lives in a `chained-dice/` folder with a `docs/` folder for notes.**
- **Code goes on GitHub, published with GitHub Pages (option A).** Why: this cloud workspace is temporary, and Pages gives a free test link and hosting. Public vs. private repo still to be chosen (free Pages needs a public repo).
- **Shop opens between shooters** (after each seven-out, before the next shooter). Why: several visits per shift, a classic roguelike rhythm.
- **$5 table minimum; chips of $5, $25, $100; no max bet.**
- **Field pays even on 3, 4, 9, 10, 11; double on 2; triple on 12.** Standard craps.
- **Odds limit is 3-4-5x, paying true odds.** Standard craps (used from Milestone 2).
- **Plain `<script>` tags instead of ES modules.** Why: browsers block modules when opening index.html straight from disk.
- **Winning bets are paid and stay on the table; losing bets are removed.** Why: matches a real craps table, so you don't re-place chips every roll. "Clear bets" takes them back.
- **Added tests.html,** a page of automatic rule checks. Why: catches payout mistakes fast.
- **Milestone 1 only:** a point number leaves the Pass Line bet up and the next roll is treated as a come-out again. Temporary until Milestone 2.
- **Owner may move to Claude Code on their own Windows PC later.** Keep everything in git so it's easy to move over.

## 2026-10-23 (after Milestone 1 testing)

- **Milestone 1 tested by owner: everything works.**
- **Code pushed to the public GitHub repository kshime3/chained-dice, published with GitHub Pages** at https://kshime3.github.io/chained-dice/.
- **Once a point is set, the Pass Line bet is locked:** no adding and no removing. You can add Odds up to the 3-4-5x limit. Owner's rule, matches real craps. Built in Milestone 2.
- **Odds payouts round down to whole dollars** (a $5 odds bet on 5 or 9 pays $7, not $7.50). Owner's choice. Keeps money simple, like a real casino.
- **Odds can be taken down at any time.** "Clear bets" returns Odds and Field; a locked Pass Line stays. Owner's choice.
- **Odds over the limit are capped:** clicking a chip bigger than the room left adds only up to the max.
- **Winning Odds come back to you** (bet plus winnings) when the point is hit. Pass Line and Field winners stay on the table.
- **Keep it beginner-friendly:** craps is hard for first-timers. On-screen messages explain each roll in plain words for now. A proper how-to-play intro comes later (see IDEAS.md).
- **Seats use the real crew names now, all with normal dice** (Lefty, Dealer Dee, Hot Rod, Ghost, Jinx, You). Quirks come in Milestone 4. Owner's choice.
- **The shift ends the moment you reach the target** (Balatro-style), counting money in hand plus everything on the table. Owner's choice.
- **The Pass Line must be played:** you can't roll a come-out without at least the $5 minimum on it. Owner's choice. Why: forces the decision and keeps it simple for new players.
- **Broke = on a come-out, your total money (hand + table) is below the $5 minimum Pass Line bet.** Instant fall.
- **If the last shooter sevens out before the target, you fall.**
- **Testing shortcut:** `?target=300` in the page address sets a smaller target, so the win screen is easy to test.

## 2026-10-23 (Milestone 3 adjustments by owner)

- **Broke = can't place the minimum Pass Line bet,** counting kitty plus money on the table. If the kitty is short, money is **moved automatically** from other bets (Field first, then Odds) to the Pass Line. Owner's choice.
- **Pay the dealer instead of "reach $2,000":** deposit from your kitty at Dealer breaks between shooters (like Clover Pit). Owner's design.
- **Deposits can't be taken back.** Owner's choice. Why: makes "bank it or let it ride" a real decision.
- **Paying the full debt wins the shift immediately;** leftover kitty carries over. Owner's choice.
- **One final Dealer break after the last seven-out,** before judgment. Owner's choice.
- **One Dealer break screen for both paying the debt and (later) the shop; tips don't count toward the debt.** Owner's choice.
- **Deposits are capped at what you still owe.** Why: overpaying would just waste money.
- **"Bankroll" renamed "Kitty"** on screen and in code, to match the owner's wording.
- **The first Dealer break appears before shooter 1.** Why: introduces the dealer and the rule right away.

## 2026-10-23 (end of session tweaks)

- **Payments always leave the minimum Pass Line bet ($5) in the kitty,** for both "Pay" and "Pay all I can", unless the payment clears the whole debt. Owner's rule: never let the player reach $0 on purpose.
- **Hovering over a seat shows that character's dice and style.** Quirks are marked "Coming in Milestone 4" until they're real. Owner wants to revisit and adjust the quirks in Milestone 4. Crew text lives in `js/crew.js` (it's words, not tunable numbers).
- **Keep the flat shapes layout until the game is complete,** then grow it into a 3D Clover Pit-style world. Owner's direction.

## 2026-10-23 (Session 2: Milestone 4a)

- **Owner accepted all three ideas:** pit boss challenges, house rules, cut a chain.
- **Dealer Dee = sticky dice:** only the left-1 + right-6 combo is impossible (chance of a 7 is 14.3%). Owner's choice over the stricter versions, which would actually raise 7s to 20-25%.
- **Seat order: Lefty, Dealer Dee, Hot Rod, Jinx, Ghost, You** (Ghost and Jinx swapped). Owner's choice.
- **Hot Rod's "every 3rd roll is a pair" becomes a shop item, not his quirk.** Why: pairs can't make 7, so he'd be nearly unable to seven out on top of his mult bonus. Too strong for a free seat.
- **Milestone 4 split into 4a (weighted dice, visible odds) and 4b (mult and synergies).** Why: smaller steps.
- **Dice are lists of faces in config.js;** every listed face is equally likely, and repeating a face makes it more common. Odds are worked out exactly by counting combos.
- **Ghost picks evens or odds for his right die at the start of each turn.**
- **Odds panel shows the current shooter's chance of every total, the 7, and the point before 7.** The break screen shows the next shooter's 7 chance.

## 2026-10-23 (Session 2: Milestone 4b)

- **Hot Rod's first seven-out costs double:** your losing Pass Line and Odds are charged again from the kitty, never taking it below the $5 minimum. Field losses don't count. Owner approved.
- **Coach (free reroll after Dee) removed.** A reroll may come back as a shop perk. Owner's choice.
- **Mult applies to winnings only, rounded down,** and resets to 1x for each new shooter (plus Mentor/Cold Table effects).
- **A "winning roll" means any of your bets won that roll.**
- **Mentor = half of Hot Rod's bonus above 1x. Cold Table = -0.5x, lifted by the first winning roll.** All numbers are in config.js.
- **"Pay all I can" removed; replaced by "Pay off debt"** (shows the amount owed), greyed out unless your kitty covers the whole debt. Typed "Pay" stays for partial payments. Owner's choice. Why: one accidental click could ruin a run, since payments can't be undone.

## 2026-10-23 (Session 2: shop planning, owner's spreadsheet)

- **Owner's spreadsheet saved as `docs/Store-Cards-Phone-Scales.xlsx`** (shop cards, Pit Boss phone perks, shift scales).
- **Shop layout approved:** 3 random items per Dealer break, Shuffle button, tips don't count toward the debt.
- **Prices scale with the shift's debt:** Common 5%, Uncommon 10%, Rare 25%, Extra chain link 50%, each rounded to the nearest $5. Why: prices stay meaningful as debts grow.
- **5 item slots to start;** a "+1 slot" item may come later.
- **New scale (owner):** shift 1 = $100 starting cash, $200 debt; shift 2 = $200 cash, $500 debt; later shifts TBD. Replaces $200 / $2,000. Not built yet.
- **Not decided yet:** see the open questions in PROGRESS.md.
- **"Session" = "shift".** Glossary added to DESIGN.md.
- **The Pit Boss phone rings after every won shift: pick 1 of 3 perks.**
- **Pit Boss's Pity covers any shooter's first seven-out of the shift.** Owner's choice; Claude agrees it's fine for an Uncommon.
- **"+1 odds" = +1 way out of 36** (one extra combination for that total).
- **DESIGN.md rewritten as one clean, current document,** with status tags (Built/Planned/Open), the end goal, the v1 goal, and a glossary. Milestones renumbered: 6 = multiple shifts + phone, 7 = fall animation, polish, release.

## 2026-10-23 (Session 2: final shop answers)

- **Shift 2+ starting cash adds to your leftover kitty.** Owner's choice.
- **Cards carry over between shifts** (like Balatro jokers).
- **Phone perks and dice cards affect everyone's dice.**
- **Flat bonuses are a share of the debt:** Snake Eyes 10%, Lucky Seven 5%.
- **Muggsy:** a seven on the roll right after the point is set charges your losing Pass Line and Odds again (never below $5). The next shooter's winnings are x2 for their whole turn. It stacks with Hot Rod (triple cost).
- **Interest: 0% base;** Green Dice starts it at 0.5%, and each 12 adds 0.5%.
- **Rarities:** Double Up, Muggsy, Reroll and Red Dice are Uncommon.
- **Milestone 5a cards:** Hot Hand, Snake Eyes, Lucky Seven, Rattlesnake, Red Dice, Odds Addict, Pit Boss's Pity, Muggsy. 5b: Loaded Die, Reroll, Double Up, Doubles Charm, Green Dice, Cut a chain, Extra chain link.
- **Shift 1 now uses the new scale ($100 cash, $200 debt)** so shop prices (a share of the debt) make sense.
- **Buying a card can't take the kitty below $5,** same as paying the dealer.

## 2026-10-23 (Milestone 5a feedback from owner)

- **The shop opens after the first shooter,** not at the start, with a one-time "New: the stickman's shop!" explanation. Why: opening with the shop was confusing. (`shopOpensAfterShooter` in config.)
- **Shuffle costs a flat 5% of the debt** every time.
- **Seven-outs are big and red:** a "SEVEN OUT!" banner on the Dealer break and in the roll message.
- **The pay box starts at $5 and its arrows move in $5 steps.**
- **Odds wording says "current chance of a 7",** since cards and perks will change the odds.
- **Rarity labels are coloured:** Common grey, Uncommon green, Rare blue, Legendary gold.
- **A seven-out that leaves you broke (and unable to pay off the debt) is an instant fall,** with no Dealer break.

## 2026-10-23 (tutorials)

- **"Dealer Break" with a capital B,** everywhere. Owner's choice.
- **The game opens with a full paged "How to play" tutorial** (premise, shooters, come-out, point and Odds, Field, paying the dealer). No shop or phone notes in it. Owner's choice.
- **The shop has its own tutorial the first time it opens;** the phone will get one too (Milestone 6). Owner's choice.
- **Tutorials show once per browser** (remembered in the browser's storage), with a "How to play" button and a shop "?" button to see them again, plus a Skip link. Why: players restart often in a roguelike, so repeating tutorials would get annoying.

## 2026-10-23 (interest, bets, layout)

- **Interest is earned on paid money, not the kitty:** at every Dealer Break after a seven-out, 5% of everything paid so far (rounded down) goes into your kitty. Owner approved Claude's suggestion. Why: rewards paying early, and makes "bank it or ride it" sharper. Green Dice becomes "each 12 adds +0.5% to your interest rate".
- **Finish the base game first; add more bets later** (Place, Hard Ways, Come with Odds), some as phone unlocks. Owner's choice.
- **Tapping the dice rolls them.** Owner's request.
- **Everything should fit on one screen without scrolling, on desktop and mobile.** Owner's request.
- **Dice are drawn with real pips and get a short rolling animation.** Owner suggested it for later; Claude added it with the layout rework. Length is `diceRollMs` in config.
- **SEVEN OUT gets its own screen for a few seconds before the Dealer Break.** Owner's request. `sevenOutSplashMs` in config; tap skips.
- **Hitting a point shows a winnings screen,** including how much cards and mult boosted the payout. Owner's request. `winSplashMs` in config; tap skips. `?fast` skips both for testing.

## 2026-10-24

- **Splash screens (SEVEN OUT and POINT HIT) last 5 seconds,** up from 2.5; tapping or clicking closes them early. Owner's choice: 2.5s was too short.
- **Milestone 5b split into 5b-1 (Double Up, Doubles Charm, Green Dice) and 5b-2 (Loaded Die, Reroll, Cut a chain, Extra chain link).**
- **Double Up: +1 way (out of 36) for each double** the shooter can roll. On normal dice, doubles go from 16.7% to 28.6% and 7s drop to 14.3%. Applies to everyone's dice.
- **Doubles Charm: every 3rd roll of each shooter's turn is a pair,** picked from the doubles that shooter can roll. A note shows when it's due.
- **Green Dice: each 12 adds +0.5% interest for the rest of the run.**
- **Loaded Die and Reroll are only offered when a roll is about to cost you** (seven-out, come-out craps, Field loss). Loaded Die: once per shift, one die. Reroll: once per shooter, both dice.
- **Cut a chain:** a fixed Dealer Break option once the shop is open, 25% of the debt, only for crew who haven't shot yet this shift (never You), gone for the rest of the run.
- **Extra chain link works like Balatro's Mr. Bones:** when you would fall, it snaps instead, the shift counts as survived, and the rest of the debt is forgiven. Takes a card slot until used.

## 2026-10-24 (balance, from simulator results in docs/BALANCE.md)

- **Shift 1 is now $150 cash and a $200 debt.** Why: $100 to $200 was only won 46% of the time by a careful bot, mostly lost by going broke.
- **Scale for later shifts (Milestone 6):** shift 2 +$150 / $300, shift 3 +$200 / $500, shift 4 +$250 / $800, shift 5 +$300 / $1,200, then about 1.5x per shift, retested with the simulator.
- **Card fixes:** Pit Boss's Pity becomes Rare (+16 points was too strong for Uncommon). Hot Hand resets only on a losing roll. Muggsy's double charge covers only the Pass Line, not Odds.
- **House rules (Milestone 7):** one random rule per shift from shift 3, announced on the opening Break, with a tutorial the first time. Starter list: Tight Odds, Short Table, High Roller, Stingy Field, Dealer's Cut, Markup, Jinxed, Pit Watch.
- **Card unlocks (Milestone 8):** starter set Hot Hand, Snake Eyes, Lucky Seven, Rattlesnake, Red Dice, Double Up; others unlock by goals (see DESIGN.md). Each unlock gets an on-screen announcement. Progress saved in the browser; a Collection screen shows locked cards.
- **Order of work:** 5b-2 + quick fixes now, then 6 (shifts + phone), 7 (house rules), 8 (unlocks + Collection), then polish and release.

## 2026-10-25 (Milestone 6 plan)

- **Milestone 6 split:** 6a multiple shifts, 6b the Pit Boss phone.
- **From shift 2, the shop is open on the opening Dealer Break.** Shift 1 keeps it closed until after the first shooter.
- **Carry over between shifts:** kitty (plus the new shift's cash), cards, cut crew, interest boosts, perks. **Reset each shift:** payments, Pit Boss's Pity, Loaded Die, Hot Rod's double cost.
- **Scale:** the table in DESIGN.md for shifts 1-5; after that the debt grows 1.5x per shift (rounded to $50) and the cash added grows $50 per shift.
- **Score = shifts survived,** shown when you fall.
- **Fire Bet and Different Doubles wait for the "More bets" milestone.** The phone launches with the other perks.
- **Perks can be picked again,** but each call offers 3 different ones. **"-1 way to roll 7" gets rarer each time it's taken, and a 7 can never drop below 2 ways out of 36.** Owner's rule: 7s should get rarer, never disappear.
- **"+1 way to roll 7" stays, labelled Risky.**
- **Perk rarity:** +1 way to a total is common; Remove a character and 2 free items are uncommon; -1 way to roll 7 is rare.

## 2026-10-25 (stats screen)

- **A full stats screen when a run ends.** Owner's request; Claude added best shooter, highest mult, interest, shop spending, points/seven-outs, and the "rolled vs expected" chart (it shows how lucky the dice were). Stats carry across shifts.

## 2026-10-25 (direction)

- **Order:** 6b (the phone), then polish (fall animation, sounds, balance check). House rules and unlocks after that.
- **Never publish the game anywhere without the owner's explicit permission.** The owner shares the GitHub Pages link with friends for testing. Added to CLAUDE.md working rules.
