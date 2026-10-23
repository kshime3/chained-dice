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
