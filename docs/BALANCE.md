# Balance Notes

Results from `tools/simulate.js`, which plays thousands of shifts automatically using the game's real rule files. To rerun: `node tools/simulate.js 20000` (Node.js needed; not part of the game).

The bots are simple: flat bets, a fixed card preference, no reading of the odds chart. A thoughtful human should do somewhat better, so treat bot win rates as a floor.

## 2026-10-24: Is $100 to $200 too easy?

**No, it's hard.** Shift 1 win rates (20,000 runs each):

| Strategy | Win | Broke | Short |
| --- | --- | --- | --- |
| $5 Pass Line only, no Odds | 3.7% | 0% | 96% |
| $10 Pass + max Odds | 39% | 56% | 5% |
| $25 Pass + max Odds | 29% | 71% | 0% |
| $10 Pass + max Odds, shop, **switch to $5 bets once the debt is covered** ("smart") | 46% | 53% | 1% |

- Most losses are **going broke**. $100 only covers one or two big Pass Line + Odds bets.
- Playing safe never works: $5 bets can't earn $100 in six shooters.
- Survival to shift 2 ($200 cash added, $500 debt): only **21%** for the smart bot.

### Starting cash matters more than the debt (smart bot, shift 1)

| Cash to debt | Win |
| --- | --- |
| $100 to $150 | 62% |
| $100 to $200 (current) | 46% |
| $125 to $200 | 54% |
| **$150 to $200** | **68%** |
| $150 to $250 | 52% |

## How much each card helps (shift 1, $10 Pass + max Odds, card owned from the start)

Baseline with no cards: 39%.

| Card | Win | Change | Notes |
| --- | --- | --- | --- |
| Doubles Charm (Rare) | 56% | +17 | Strongest. Fine as a Rare. |
| Pit Boss's Pity (Uncommon) | 55% | +16 | Too strong for Uncommon. |
| Odds Addict (Uncommon) | 52% | +13 | Strong. |
| Red Dice (Uncommon) | 45% | +6 | |
| Rattlesnake (Common) | 45% | +6 | |
| Double Up (Uncommon) | 44% | +5 | |
| Snake Eyes (Common) | 43% | +4 | |
| Lucky Seven (Common) | 42% | +3 | |
| Hot Hand (Common) | 40% | +1 | Weak: resets on every "no decision" roll. |
| Green Dice (Rare) | 39% | 0 | Only helps players who pay early. |
| Muggsy (Uncommon) | 35% | **-3** | Hurts: the double charge includes your Odds. |

## Proposed scale (smart bot, chaining shifts with money and cards carried over)

| Shift | Cash added | Debt | Survive (no shop) | Survive (shop) |
| --- | --- | --- | --- | --- |
| 1 | $150 | $200 | 69% | 69% |
| 2 | $150 | $300 | 37% | 41% |
| 3 | $200 | $500 | 12% | 25% |
| 4 | $250 | $800 | 2% | 14% |
| 5 | $300 | $1,200 | 0.1% | 6% |

Compared with the current scale ($100 to $200, then $200 to $500): 46% then 21%.

The proposed scale gives a gentle first shift, then cards become **necessary** from shift 3 on. That's the Balatro feel: you can't survive on luck alone, you need a build. House rules and phone perks will shift these numbers, so rerun the simulator after each change.

## 2026-10-24: Changes made from this report

- Shift 1 changed to $150 cash / $200 debt.
- Pit Boss's Pity moved to Rare. Hot Hand now resets only on a losing roll. Muggsy's double charge now covers the Pass Line only.
- Rerun the simulator after Milestone 6 to check shifts 2-5.

## 2026-10-25: Milestone 6a check (real multi-shift runs, shop open from shift 2)

Smart bot with shop, 10,000 runs: survived shift 1 **68%**, shift 2 **40%**, shift 3 **29%**, shift 4 **18%**, shift 5 **9%**. Without the shop: 69%, 37%, 13%, 2%, 0.1%. Cards matter more and more as shifts go on, as intended.

## 2026-10-25: Milestone 6b check (shop + Pit Boss phone)

Smart bot that takes -1 way to roll 7 when offered (else free items, else a +1 total): survived shift 1 **66%**, 2 **43%**, 3 **34%**, 4 **24%**, 5 **15%** (was 68/40/29/18/9 without the phone).

## 2026-10-27: Milestone 7 check (Don't Pass)

20,000 runs, smart bots with shop and phone. Survived shift 1 / 3 / 5:

| Strategy | Shift 1 | Shift 3 | Shift 5 |
| --- | --- | --- | --- |
| Pass Line + max Odds | 69% | 37% | 19% |
| Don't Pass + max Lay | 55% | 29% | 8% |
| Pass Line, but Don't Pass when Jinx shoots | 68% | 32% | 14% |

- Don't Pass loses more runs to going broke: max Lay risks up to 6x the bet.
- Betting against Jinx doesn't pay: his 7s also come on the come-out, where they **lose** a Don't Pass bet. In real craps the same is true; to make "bet against Jinx" a real strategy the game needs a twist (see IDEAS.md).

## 2026-10-27: Jinx's come-out curse

With the curse (a come-out 7 is a tie for Don't Pass when Jinx shoots), "Pass Line, but Don't Pass against Jinx" still trails plain Pass Line (shift 5: 14% vs 19%). Reason: Jinx's 7s also make the Pass Line *win* 22% of his come-outs. He's good to bet **with** on the come-out and **against** once a point is set (vs a point of 8, a 7 comes first 67% of the time). You can't switch sides mid-hand, so it's a real choice rather than a free win.

## 2026-10-27: Rising table minimum + pay after the first shooter

Smart bot (flat $10 bets, raised to the table minimum when needed), shop + phone, 10,000 runs: survived shift 1 **68%**, 2 **46%**, 3 **37%**, 4 **30%**, 5 **25%**, 6 **20%**, 7 **17%**, 8 (walk out free) **14%**.

- Surprise: survival to shift 8 went **up** (from ~3%). The old bot bet a flat $10 even against a $4,050 debt, so it could never earn enough late on. The minimum forces bigger bets, and bigger bets are what it takes to clear big debts. A human already scales bets, so for people the minimum mainly removes "coast on $5 bets".
- What makes later shifts genuinely hard is the **debt compared with the cash you bring in**. The owner noticed the real problem: a big leftover cash clears the next shifts. "Pay after the first shooter" stops the instant payoff; if shifts still feel easy, the next lever is steeper debts or less cash added. Retune after consumables and dice crafting (they add power).

## 2026-10-28: Rescaled for rising difficulty

**Problem found:** with the old scale, once past shift 2 the bot survived each later shift ~80% of the time, every time. Later shifts were no harder than early ones, because survivors carry a big leftover cash (and cards) into the next shift. Steeper debts alone barely changed this (every candidate stayed at ~65-70% per shift).

**Fix:** debts that accelerate (x1.5 early, ~x2.2 late) **plus a dealer's cut** (keep half your leftover money). Tested 8,000-20,000 runs per candidate; per-shift survival (survived / reached) for the smart bot:

| Scale | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Old, keep all leftover | 68% | 66% | 79% | 83% | 81% | 81% | 82% | 83% | 13% |
| **New (E3), keep half** | 69% | 73% | 70% | 67% | 62% | 58% | 60% | 59% | **3.0%** |

A bot that bets 10% of what it owes does a bit worse (walk out free 1.7%). A thoughtful human with a good build should do noticeably better; retune after consumables and dice crafting, which add power. Tool: `CARRY=0.5 node tools/simulate.js 20000` and the `SCALING` bots (strategies 18-21).

## 2026-10-28: Milestone 8 retest (comps)

Simulator learned comps (settling, Insurance, Double Down, free comps) and a bot that buys No Sevens / Double Down / Insurance / Hot Seat / Lucky Pair with spare money. 8,000 runs, keep-half carry-over, per-shift survival:

| Bot | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Smart, no comps | 69% | 72% | 70% | 67% | 63% | 59% | 61% | 58% | 3.1% |
| Smart + comps | 70% | 75% | 70% | 68% | 64% | 57% | 61% | 60% | 3.3% |

Comps add a little power; the curve still gets harder shift by shift. **No rescale needed.** Humans who time comps well (Loaded Shot, No Sevens on a big Odds bet) will gain more than the bot.

## 2026-10-28: Milestone 9 retest (dice crafting)

Bot now buys Nudge / Copycat / Chisel and uses each to leave its own dice the fewest 7s. 8,000 runs, keep-half carry-over:

| Bot | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Smart, no comps | 69% | 72% | 71% | 67% | 62% | 57% | 62% | 62% | 3.3% |
| Smart + comps + dice edits | 70% | 71% | 69% | 65% | 59% | 55% | 57% | 56% | 2.3% |

Dice edits only help on **your** turn (1 shooter in 6), so a bot that spends money on them does slightly worse. Curve still rises; **no rescale needed**. Edits will matter more once "You" cards exist (extra turns, betting bigger on your own turn); retest then.

## 2026-10-29: Milestone 10 retest (crew cards, "You" cards, hiring)

Bot learned the 9 new cards and hiring (Lucky Lou / The Professor first). 8,000 runs, keep-half carry-over, smart bot (flat bets):

| Bot shopping list | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| New cards first | 67% | 67% | 61% | 55% | 50% | 47% | 43% | 60% | 0.9% |
| New cards after the old favourites | 68% | 67% | 64% | 59% | 54% | 52% | 54% | 58% | 1.5% |
| Ignores the new cards | 69% | 71% | 65% | 65% | 61% | 57% | 60% | 59% | 2.6% |

- The game itself isn't much harder (ignoring the new cards: 2.6% vs 3.3% before; a bigger card pool makes favourites a little rarer).
- A flat-betting bot gets little from the new cards: they're situational build pieces (an extra turn, x2 on your own turn), not raw power. **No rescale.** Watch in playtesting whether Encore (Rare) and High Roller feel worth their price.

## 2026-10-29: Milestone 11 retest (house rules, boss rules, challenges)

Simulator learned the rules (they're in the game's own logic files) and challenges; under Dark Side Only the bot bets Don't Pass. It doesn't otherwise adapt to a rule. 8,000 runs, keep-half carry-over, per-shift survival:

| Bot | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Smart, rules off (`NORULES=1`) | 68% | 68% | 64% | 57% | 53% | 51% | 49% | 55% | 1.2% |
| Smart, rules on | 68% | 67% | 58% | 54% | 45% | 39% | 44% | 36% | 0.4% |
| Smart + comps, rules on | 69% | 67% | 55% | 56% | 47% | 50% | 48% | 44% | 0.7% |
| Smart, rules on, debts 3-8 trimmed 10% | 67% | 66% | 63% | 54% | 47% | 41% | 45% | 46% | 0.6% |

- House rules cost a flat-betting bot about 5-10 points per shift from shift 3, and the boss rule on shift 8 about 10-20. Escapes roughly halve.
- Trimming the debts barely helps (same lesson as before: debts aren't the main lever). The curve still gets harder shift by shift, so **no rescale for now**: a human can adapt to a rule (smaller bets under Tight Odds, Don't Pass bots aren't hurt by Dark Side Only), the bot can't. If playtesting feels too punishing, the levers are: rules from shift 4 instead of 3, or a softer boss rule list.
- Found by the simulator: House Die plus a guaranteed pair (Doubles Charm, Lucky Pair) could leave no possible roll. Fixed (House Die skips that shooter), with a test.

## 2026-10-29: Test: start with 3 shooters (you + 2 random crew)

Simulator only (`START_CREW=3`): the 3 starters left out join the hire pool, and the bot hires into empty seats (best shooters first, never Jinx). House rules on, 8,000 runs, keep-half carry-over, per-shift survival:

| Setup | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 6 shooters, current scale (M11) | 68% | 67% | 58% | 54% | 45% | 39% | 44% | 36% | 0.4% |
| 3 shooters, current scale | 59% | 43% | 53% | 55% | 44% | 41% | 46% | 33% | 0.2% |
| 3 shooters, shift 1 owes $150, shift 2 owes $225 | 70% | 57% | 45% | 52% | 46% | 40% | 47% | 38% | 0.3% |

(Second bot, with comps, within about 5 points of these.)

- Seats fill fast: after each won shift the bot has about 3.2, 5.1, 5.8, then 6.0 seats. Hiring costs 20% of the debt, which is cheap early.
- Fewer shooters means fewer chances to win money each shift, so **shifts 1-2 get much harder** on the current scale. Lowering the first two debts brings shift 1 back to normal. Shift 3 ($550) is then the wall while the table is still growing.
- From shift 4 on the table is full and it plays like today.
- Tools: `START_CREW=3 node tools/simulate.js 8000`, and `SEATS=1` prints the seats filled after each shift.

## 2026-10-29: Built: 3 seats (you, Jinx, 1 random), same debts

8,000 runs, rules on, keep-half carry-over, per-shift survival:

| Bot | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Smart | 58% | 39% | 52% | 53% | 48% | 43% | 46% | 33% | 0.2% |
| Smart + comps | 60% | 44% | 49% | 49% | 48% | 47% | 50% | 43% | 0.3% |
| Smart, drops Jinx as soon as it can afford to | 58% | 33% | 42% | 53% | 50% | 43% | 44% | 50% | 0.2% |

- Only **23-26%** of bot runs get through the first 2 shifts (was 46%). Seats fill to about 5 by the end of shift 2 and 6 by shift 4.
- Dropping Jinx immediately is **worse** for the bot: it costs 25% of the debt early and one shooter's rolls. Cutting him is a real decision, not a free win.
- Fine for the owner's goal (first runs should fail); Milestone 12 unlocks are what should make escaping possible over many runs. Tools: `START_CREW=6` to compare with a full table, `CUT_JINX=1`, `SEATS=1`.

## 2026-10-29: Milestone 12a retest (unlocks)

The bots now play with unlocks. Normal runs use everything unlocked (comparable with older results); `LOCKED=1` plays as a brand-new player; `CAREER=200` plays run after run keeping unlocks until the bot walks out free.

| Smart bot, 8,000 runs | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| New player (everything locked) | 59% | 42% | 54% | 60% | 53% | 43% | 50% | 44% | 0.4% |
| Everything unlocked | 58% | 40% | 52% | 55% | 47% | 48% | 47% | 43% | 0.3% |

Careers (200 each, up to 1,000 runs):

| Bot | Escaped within 1,000 runs | Median runs to first escape | Unlocks found after 5 / 10 / 50 / 200 runs (of 24) |
| --- | --- | --- | --- |
| Smart | 98% | 196 | 11 / 14 / 18 / 19 |
| Smart + comps | 97% | 219 | 13 / 17 / 21 / 22 |

- **Finding: unlocks don't make the bot stronger.** A new player escapes about as often as a fully unlocked one, so the ~200-run median is just a 0.4% chance repeated, not progress. A flat-betting bot gets little from cards in general (seen since Milestone 10). For unlocks to *feel* like getting closer to winning, they need to add real power. Owner to decide how (see PROGRESS.md).
- Unlocks come quickly: about half in the first 5 runs. Never unlocked by the bot: Green Dice (it pays the debt all at once, so earns little interest) and Jinx's Shadow (it never drops Jinx). Humans will.
- Shift-by-shift difficulty unchanged: no rescale.

## 2026-10-29: Making unlocks matter (stronger locked cards, Reputation, slower unlocks)

Card power measured first (smart bot, no shop, owning one card; % that reach shift 3; no card = 14%): starters Hot Hand 24, Rattlesnake 21, Snake Eyes 20, Red Dice 19, Double Up 19, Lucky Seven 18, Cold Read 16; locked Doubles Charm 27, Pity 26, Odds Addict 25, Rod's Lighter 20, Muggsy 20, Dee's Ledger 19, the rest about 14-16. So starters were trimmed and locked cards strengthened (DESIGN.md). Tool: `node tools/simulate.js 6000 "" cards`.

New player vs veteran (8,000 runs each; `LOCKED=1` = every run is a first run, `VETERAN=1` = everything unlocked plus all Reputation bonuses):

| Smart bot | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Brand-new player | 57% | 40% | 52% | 49% | 44% | 42% | 27% | 33% | 0.1% |
| Veteran | 100% | 100% | 76% | 74% | 70% | 61% | 52% | 50% | 6.2% |

Careers (200 each, unlocks and Reputation kept between runs):

| Bot | Median runs to first escape | Unlocks after 5 / 10 / 25 / 50 runs (of 24) |
| --- | --- | --- |
| Smart | 84 | 4 / 8 / 14 / 16 |
| Smart + comps | 69 | 5 / 10 / 17 / 19 |

- Path tried: weak ladder (cash, slots, free Shuffle, interest) gave a median of ~150 runs; a stronger ladder ~90-105; a second "-1 way to roll 7" ~60-85.
- New players: only ~1 in 4 bot runs survive shifts 1-2, and escapes are about 1 in 1,000. Veterans escape about 1 run in 15.
- These bots are simple (flat bets, no rerolls, never drop Jinx), so a thoughtful player should land inside 30-60 runs. If playtests say it's still too long, the next levers are `reputationEvery` (3 -> 2) or the unlock goals.
- Bot never unlocks Green Dice, Jinx's Shadow or Front of the Line (it pays at the end, never drops Jinx, hires slowly); humans will.

## 2026-10-29: Milestone 12b retest (more bets)

Bots learned: a Fire Bet (one table minimum) on each fresh shooter, and Place 6 and 8 (in $6 steps) while a point is on, once unlocked. `NOEXTRA=1`, `NOFIRE=1`, `NOPLACE=1` switch these off.

| Smart bot, 8,000 runs | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Brand-new player | 58% | 41% | 51% | 50% | 42% | 36% | 44% | 25% | 0.1% |
| Veteran, no new bets | 100% | 100% | 75% | 73% | 69% | 61% | 51% | 52% | 6.0% |
| Veteran, Place bets only | 100% | 100% | 80% | 84% | 80% | 72% | 65% | 65% | 16.3% |
| Veteran, Fire Bet only | 100% | 100% | 71% | 71% | 69% | 60% | 57% | 52% | 6.2% |
| Veteran, both | 100% | 100% | 75% | 81% | 78% | 72% | 66% | 64% | 14.4% |

Careers (200 each): median runs to first escape **38** (smart) and **32** (smart + comps), inside the 30-60 target. Unlocks found after 10 / 25 / 50 runs (of 28): 9-12 / 17-21 / 20-24.

- Path: with easy goals the median fell to 21-24 runs. Harder goals for all four helped little; Place bets were the driver (6 and 8 win often, feeding Hot Hand and other mult cards). Cutting Place payouts to 1:1 on 6/8 barely changed it, so payouts stay at casino odds and the Place goal went from 25 to 150 points hit.
- The Fire Bet is a fun long shot but adds almost nothing on average.

## 2026-10-30: Polish pass retest

No rule changes. New player per-shift survival 57 / 41 / 52 / 51 / 47 / 41 / 33 / 25%, career median 36 runs: same as the 12b entry. No rescale.
