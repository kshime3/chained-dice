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
- What makes later shifts genuinely hard is the **debt compared with the cash you bring in**. The owner noticed the real problem: a big leftover kitty clears the next shifts. "Pay after the first shooter" stops the instant payoff; if shifts still feel easy, the next lever is steeper debts or less cash added. Retune after consumables and dice crafting (they add power).

## 2026-10-28: Rescaled for rising difficulty

**Problem found:** with the old scale, once past shift 2 the bot survived each later shift ~80% of the time, every time. Later shifts were no harder than early ones, because survivors carry a big leftover kitty (and cards) into the next shift. Steeper debts alone barely changed this (every candidate stayed at ~65-70% per shift).

**Fix:** debts that accelerate (x1.5 early, ~x2.2 late) **plus a dealer's cut** (keep half your leftover money). Tested 8,000-20,000 runs per candidate; per-shift survival (survived / reached) for the smart bot:

| Scale | S1 | S2 | S3 | S4 | S5 | S6 | S7 | S8 | Walk out free |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Old, keep all leftover | 68% | 66% | 79% | 83% | 81% | 81% | 82% | 83% | 13% |
| **New (E3), keep half** | 69% | 73% | 70% | 67% | 62% | 58% | 60% | 59% | **3.0%** |

A bot that bets 10% of what it owes does a bit worse (walk out free 1.7%). A thoughtful human with a good build should do noticeably better; retune after consumables and dice crafting, which add power. Tool: `CARRY=0.5 node tools/simulate.js 20000` and the `SCALING` bots (strategies 18-21).
