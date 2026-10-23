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
