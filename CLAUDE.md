# Chained Dice

A Craps-themed roguelike browser game (in the style of Balatro and Clover Pit). You wake up chained to a craps table with your crew. Hit the pit boss's bankroll target by the end of the shift, or the chains release and everyone falls. Full design: `docs/DESIGN.md`.

The owner is a beginner coder working about an hour a day.

## Working rules

- Plain HTML, CSS, and JavaScript. No frameworks or build tools unless the owner approves.
- The game must run by opening `index.html` in a browser, and be easy to host free (itch.io or GitHub Pages).
- Placeholder art and sound are fine (shapes, colors, text).
- One small milestone at a time. After each, give exact browser test steps, then wait for feedback.
- Commit after each working milestone with a clear message.
- Game logic (dice, bets, crew, shop) lives in separate JS files from display code.
- Every tunable number (buy-in, target, payouts, prices, rarity) lives in `js/config.js`.
- Explain things in plain language. Ask before big decisions.

## Session routine

- **Start:** read this file and `docs/PROGRESS.md`, summarize where we are, propose the next step.
- **End:** update `docs/PROGRESS.md`, `docs/DECISIONS.md`, `docs/IDEAS.md` (and this file's layout section if files changed).

## File layout

```
CLAUDE.md          this file
docs/DESIGN.md     game design
docs/DECISIONS.md  dated decision log
docs/PROGRESS.md   dated session log and next step
docs/IDEAS.md      parked ideas and later features
```
(Game files will be added starting in Milestone 1.)
