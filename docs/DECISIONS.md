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

- **Broke = can't place the minimum Pass Line bet,** counting cash plus money on the table. If the cash is short, money is **moved automatically** from other bets (Field first, then Odds) to the Pass Line. Owner's choice.
- **Pay the dealer instead of "reach $2,000":** deposit from your cash at Dealer breaks between shooters (like Clover Pit). Owner's design.
- **Deposits can't be taken back.** Owner's choice. Why: makes "bank it or let it ride" a real decision.
- **Paying the full debt wins the shift immediately;** leftover cash carries over. Owner's choice.
- **One final Dealer break after the last seven-out,** before judgment. Owner's choice.
- **One Dealer break screen for both paying the debt and (later) the shop; tips don't count toward the debt.** Owner's choice.
- **Deposits are capped at what you still owe.** Why: overpaying would just waste money.
- **"Bankroll" renamed "Cash"** on screen and in code, to match the owner's wording.
- **The first Dealer break appears before shooter 1.** Why: introduces the dealer and the rule right away.

## 2026-10-23 (end of session tweaks)

- **Payments always leave the minimum Pass Line bet ($5) in the cash,** for both "Pay" and "Pay all I can", unless the payment clears the whole debt. Owner's rule: never let the player reach $0 on purpose.
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

- **Hot Rod's first seven-out costs double:** your losing Pass Line and Odds are charged again from the cash, never taking it below the $5 minimum. Field losses don't count. Owner approved.
- **Coach (free reroll after Dee) removed.** A reroll may come back as a shop perk. Owner's choice.
- **Mult applies to winnings only, rounded down,** and resets to 1x for each new shooter (plus Mentor/Cold Table effects).
- **A "winning roll" means any of your bets won that roll.**
- **Mentor = half of Hot Rod's bonus above 1x. Cold Table = -0.5x, lifted by the first winning roll.** All numbers are in config.js.
- **"Pay all I can" removed; replaced by "Pay off debt"** (shows the amount owed), greyed out unless your cash covers the whole debt. Typed "Pay" stays for partial payments. Owner's choice. Why: one accidental click could ruin a run, since payments can't be undone.

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

- **Shift 2+ starting cash adds to your leftover cash.** Owner's choice.
- **Cards carry over between shifts** (like Balatro jokers).
- **Phone perks and dice cards affect everyone's dice.**
- **Flat bonuses are a share of the debt:** Snake Eyes 10%, Lucky Seven 5%.
- **Muggsy:** a seven on the roll right after the point is set charges your losing Pass Line and Odds again (never below $5). The next shooter's winnings are x2 for their whole turn. It stacks with Hot Rod (triple cost).
- **Interest: 0% base;** Green Dice starts it at 0.5%, and each 12 adds 0.5%.
- **Rarities:** Double Up, Muggsy, Reroll and Red Dice are Uncommon.
- **Milestone 5a cards:** Hot Hand, Snake Eyes, Lucky Seven, Rattlesnake, Red Dice, Odds Addict, Pit Boss's Pity, Muggsy. 5b: Loaded Die, Reroll, Double Up, Doubles Charm, Green Dice, Cut a chain, Extra chain link.
- **Shift 1 now uses the new scale ($100 cash, $200 debt)** so shop prices (a share of the debt) make sense.
- **Buying a card can't take the cash below $5,** same as paying the dealer.

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

- **Interest is earned on paid money, not the cash:** at every Dealer Break after a seven-out, 5% of everything paid so far (rounded down) goes into your cash. Owner approved Claude's suggestion. Why: rewards paying early, and makes "bank it or ride it" sharper. Green Dice becomes "each 12 adds +0.5% to your interest rate".
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
- **Carry over between shifts:** cash (plus the new shift's cash), cards, cut crew, interest boosts, perks. **Reset each shift:** payments, Pit Boss's Pity, Loaded Die, Hot Rod's double cost.
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

## 2026-10-27 (polish)

- **Sound is on by default, with a mute button** (remembered per browser). Owner's choice.
- **Sounds are generated in the browser (Web Audio), not audio files.** Why: nothing to download or host, keeps the plain HTML/JS rule.
- **Owner: the game is fun but too basic; it needs lots of mechanical growth after this first build.** Claude listed options in IDEAS.md.

## 2026-10-27 (mechanical growth roadmap + Milestone 7)

- **Owner picked growth ideas 1-6.** Roadmap: 7 bet against the shooter, 8 consumables, 9 dice crafting, 10 crew growth, 11 house rules + pit boss challenges, 12 more bets as unlocks + card unlocks (Collection).
- **Milestone 7, Don't Pass:** come-out 2/3 win, 7/11 lose, 12 is a tie; point phase 7 wins, the point loses; even money. **Lay Odds** behind it pay true odds the other way (1:2 on 4/10, 2:3 on 5/9, 5:6 on 6/8), limited so the win is at most 3-4-5x the Don't Pass bet (so up to 6x the bet).
- **Pass Line or Don't Pass is required** on every come-out ($5 minimum), **one side at a time**. Don't Pass locks during a point like the Pass Line; Lay Odds can be added or taken back.
- **Pit Boss's Pity only triggers when you're on the Pass Line** (it would hurt a Don't bettor).
- **Two new "dark side" cards:** Wrong Way (Uncommon: Don't Pass winnings +50%) and Cold Read (Common: if your Don't Pass wins on a seven-out, the next shooter starts at +1x mult).
- **Jinx's come-out curse:** when Jinx shoots, a come-out 7 is only a tie for Don't Pass (an 11 still loses). Owner's choice. Toggle: `jinxCurse` in config.

## 2026-10-27 (theme)

- **Keep the theme; rework the language.** "The chains hold" read backwards. New frame: the chains are your sentence, the floor is the threat.
- **8 links.** Each won shift unlocks one. Break all 8 and you **walk out free** (a real win), then the dealer offers **"Double or nothing"** for **endless mode** (play for score).
- **A chain link breaking animation at the end of every won shift.** Owner's request.
- Wording draft in `docs/WORDING.md` for owner review before it goes in the game.
- **Break the Chain built** as written in `docs/WORDING.md` (approved): 8 links, link-break animation, walk out free, Double or nothing into endless mode. Renamed Spare Link, Trapdoor, Free Trapdoor.
- **Big-number scaling (100 million+) is a later goal,** logged in IDEAS.md. Owner's note.
- **Dealer's Bargain (Rare, one use, instant, no slot):** adds a link to your chain (one more shift to walk free) in exchange for -1 way to roll 7 on everyone's dice for the run. Owner chose this over "break a link now, +1 way to 7". Not offered in endless mode.
- **Hot streak indicator** idea logged for later (owner).
- **Table minimum rises each shift** ($5, $10, $15, $25, $50, $75, $100, $150, then ~4% of the debt rounded to $25). Owner asked; Claude's schedule. Chips step up to $25/$100/$500 once the minimum is $25+.
- **Paying the dealer opens only after the first shooter of each shift** (toggle `payAfterFirstShooter`). Claude's recommendation to stop clearing a new shift instantly with leftover money. Owner: fine-tune difficulty later at higher levels.

## 2026-10-28 (rescale)

- **New scale (accelerating debts):** $200, $300, $550, $1,100, $2,400, $5,500, $12,500, $28,000; cash added $150, $200, then $175 a shift; minimums $5, $10, $15, $30, $60, $150, $300, $700; endless x2.2 per shift. Why: simulator showed later shifts weren't getting harder.
- **Dealer's cut: keep half your leftover money** between shifts (`carryOverShare` 0.5). Claude's recommendation after testing; the one lever that made difficulty rise shift by shift. Easy to change or turn off (set to 1).

## 2026-10-28 (Milestone 8 plan + rules)

- **Every milestone ends with a balance retest** with the simulator, recorded in BALANCE.md (added to CLAUDE.md working rules). Owner's rule.
- **Some cards start locked, with hidden unlock requirements.** Locked cards show as mysteries; the goals are not shown to the player. Beating the game should take many playthroughs. Owner's rule; replaces the earlier plan of showing goals in the Collection (Milestone 12).
- **Milestone 8 = Comps** (one-use items; casino slang for the house's freebies). 2 slots. Shop row of 2 comps per Dealer Break, priced 3-8% of the debt by strength, sell for half. Starter set: No Sevens, Double Down, Lucky Pair, Loaded Shot, Hot Seat, Insurance, Seat Swap, Cash Advance. Also: a phone perk "2 free comps", and a free comp for hitting a point at 3x mult or more. All Claude's recommendations, approved.

## 2026-10-28 (Milestone 9 plan)

- **Dice crafting edits only YOUR dice** (owner). Makes "You" the shooter you build up; opens future "You" cards (extra turn, etc.).
- **Three edits, sold in the comps row, used at a Dealer Break:** Nudge (a face +1 or -1, wrapping: up from 6 is 1, down from 1 is 6; Common), Copycat (copy one face over another on the same die; Uncommon), Chisel (set a face to any number; Rare).
- **7-floor safety rule:** an edit is refused if your dice would have fewer than 2 ways (out of 36) to roll a 7.
- **Workshop animation:** you pick the face on your die and watch it flip and reforge into the new face (owner's request).
- **Workshop previews show which totals an edit changes** (not just 7s), since editing one die alone never changes the chance of a 7. Claude's call after testing.
- **Copycat and Chisel show up less often in the shop** (`compWeights`: 0.6x and 0.35x).

## 2026-10-29 (Milestone 10 plan)

- **Milestone 10 built all at once:** crew-specific cards (only offered while that crew member is at the table), "You" cards, and hiring new crew. **Crew levels skipped** for now (owner).
- **Hiring** at the Dealer Break, only into an empty seat; **max 6 seats** (`maxSeats`). Owner's idea for later: start with fewer crew (e.g. 3) and recruit up to 6, to help the game grow and scale (`startingCrew` setting, logged in IDEAS.md).
- **Encore:** your extra turn comes after the last shooter, before the final Dealer Break.
- New crew to hire: Snake, Big Mo, The Professor, Lucky Lou. (Big Mo's dice adjusted so he can still roll a 7: faces 1, 4, 5, 5, 6, 6.)

## 2026-10-29 (Milestone 11 plan)

- **House rules (shifts 3-7, one random per shift):** Tight Odds (Odds/Lay limited to 2x), High Stakes (table minimum x2), Skimmed Interest (interest halved), Markup (shop prices +50%), Pit Watch (one of your cards switched off), **House Die** (owner: every shooter's left die is set to a random X this shift; skipped for a shooter it would leave with no way to roll 7), **Dark Side Only** (owner: no Pass Line, only Don't Pass and Lay Odds). Dropped by owner: Short Table, Stingy Field (too weak), Jinxed.
- **Boss rule on the last chain shift (shift 8):** one of No Free Lunch (owner: each shooter's first point pays nothing), Cold Dice (mult capped at 1x), Seven Heaven (come-out 7s don't pay the Pass Line). Endless shifts get a random rule from either list.
- **Pit boss challenges only on your own turn,** from shift 2; random rewards scaled to the debt (cash, free comp, debt cut, free Shuffle); no penalty for failing.
- Renamed to avoid clashes: "High Roller" rule -> **High Stakes**; "Dealer's Cut" rule -> **Skimmed Interest**.

## 2026-10-29 (after Milestone 11)

- **"Kitty" renamed to "cash" everywhere** (owner: "kitty" is gambling talk; keep words simple for the average person). Top bar "Cash $150", Break "Your cash:", messages "Not enough cash for a $10 bet." The code variable is now `state.cash`.
- **Difficulty goal restated (owner):** players should *not* beat the game on the first run. Winning should come from unlocking cards and more over many runs, so each run feels fresh. A very low first-run escape rate is fine; unlocks (Milestone 12) are what should make escaping possible.
- **Starting with 3 shooters (you + 2 crew): tested in the simulator only, not built yet.** Results in BALANCE.md; waiting on the owner's choice.
- **Built: start with 3 seats, same debts** (owner, 2026-10-29). You + **Jinx always** + 1 random starter. The other starters can be hired (pool = recruits + unseated starters). Owner: the first runs, before unlocks, should make even shifts 1-2 very hard; forcing Jinx also gives a reason to use the Trapdoor. Dropped crew can never be hired back.

## 2026-10-29 (Milestone 12a: unlocks)

- **Milestone 12 split:** 12a = unlocks + Collection (built); 12b = new bets as unlocks (next).
- **Fully hidden goals** (owner): locked things show only "???" in the Collection, no hints. Found items are listed first so a mystery's position doesn't give away its rarity.
- **Locked from the start:** 19 cards, 3 comps (Loaded Shot, Copycat, Chisel) and 2 recruits (Lucky Lou, The Professor). Unlock list as drafted (owner approved).
- **Unlocks show up from the next run** (owner), not mid-run.
- Progress saved in the browser (`localStorage`); tests.html never touches it. "Reset all progress" on the Collection screen.
- **Unlocks must add power** (owner chose 1 + 2 + 4): locked cards made stronger and starters trimmed (measured with the simulator); a fixed **Reputation** ladder (every 3 unlocks, a lasting bonus); slower unlock goals (about half by run 20). Target: the bot's first escape around run 30-60.
- Reputation counts real unlocks only, so `?unlockAll` and tests.html get no bonuses. Interest bonus and free-Shuffle bonus were tried and replaced by "-1 way to roll 7" (they did little for most play styles).

## 2026-10-29 (Milestone 12b: more bets)

- **All four new bets** (owner): Hard Ways, Place, Come & Don't Come, Fire Bet. Each is an unlock group with a hidden goal (drafts approved, then tuned).
- **The mult applies to them** (owner). Fire Bet payouts trimmed to 24/99/299 and capped at one table minimum because of it.
- Kept simple: Hard Ways and Place bets are off on come-outs; no odds behind Come bets; a second "More bets" board instead of squeezing the main board.
- Place bets turned out to be strong (with mult cards), so their goal was raised to 150 points rather than cutting their payouts (lower payouts barely changed the result).

## 2026-10-30 (polish pass)

- Owner picked: smarter betting, pop-up layering, a **Save bets / Same bets** button (owner's idea), win popups, a settings menu.
- **Same bets** puts back what the rules allow right now (cash only, each bet in full or not at all): line bets on a come-out (raised to the table minimum if it went up), Odds/Lay once a point is set (capped at today's limit). Press again after the point is set to add the Odds. Saved bets carry across shooters and shifts.
- **Smarter betting:** the first chip on a line bet covers at least the table minimum; a chip you can't afford switches to the biggest one you can.
- **Settings (⚙, replaces the sound button):** sound, quick dice, show tutorials again, reset progress.
- Pop-ups leave 60px at the top so the header buttons never cover a box.
- **Tidier win screen** (owner). **Recruits priced by strength** (owner chose "price all by strength"): simulator measured each as the third seat; Hot Rod turned out strongest (mult streaks), then Big Mo.
- **Six new cards** (owner picked from 8 suggestions): Comeback Kid, Point Collector, Loan Shark, Hardway Hustler, Steady Hand, Dice Collector. All locked with hidden goals; Reputation ladder extended by 3 steps. Not picked (parked in IDEAS.md): Crew Captain, Jinx Jar.
- **Show why something unlocked** (owner, 2026-10-30): goals stay hidden while locked; once unlocked, the unlock screen and the Collection tile say "Unlocked by surviving shift 3." (text built from `CONFIG.unlockGoals`, so it always matches).
- **3D dice: option A "spin in place"** (owner picked from 3 styles on demos/dice-3d.html). Plain CSS 3D cubes, no library; same 600 ms roll length; Quick dice still skips it. With Loaded Die only the rerolled die tumbles.
- **3D dice feedback** (owner): roll 1 second; the rolled number is on the TOP face (seen from above, like a real table); a toss-and-roll instead of a spin. Also fixed: the old flat roll code was still overriding the 3D roll (it flicked random faces every 70 ms, which looked "spinny").
- **Cache-busting** (2026-10-30): the owner saw new game code with an old cached style.css (GitHub Pages lets browsers keep files ~10 minutes), so the dice looked side-on. index.html now loads every file with a `?v=` version tag, bumped on each update. Camera made steeper (68 degrees) so the top face clearly dominates.
