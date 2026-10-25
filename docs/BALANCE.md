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
