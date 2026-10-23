# Progress

Dated session log. Newest at the top.

## 2026-10-23: Session 1, continued (Milestone 2)

**Done**
- Pushed everything to GitHub (kshime3/chained-dice, public). Live at https://kshime3.github.io/chained-dice/.
- Owner tested Milestone 1: all working.
- **Built Milestone 2:** point marker (ON/OFF), Pass Line locks once a point is set, Odds bet (3-4-5x limit, true odds, rounded down, capped at max), point hit and seven-out handling. Clear bets returns Odds and Field but not a locked Pass Line. Plain-language messages for every roll. tests.html: 58 checks, all passing.

**Works**
- Full come-out and point cycle, checked in a headless browser and by tests.html.

**Broken**
- Nothing known.

**Known limits (by design)**
- "Seven out! New shooter" is only a message. No crew or turns yet (Milestones 3 and 4).
- Starting bankroll is $200 with no target or game over yet (Milestone 3).

**Waiting on the owner**
- Testing Milestone 2 and feedback.

**Exact next step**
- After feedback: plan Milestone 3 ($200 buy-in, $2,000 target, roll-until-seven-out turns, instant fall when broke or short of target).

## 2026-10-23: Session 1 (kickoff + Milestone 1)

**Done**
- Created the project folder and started git.
- Added CLAUDE.md and the four docs files. Design doc copied in, with kickoff clarifications appended.
- Owner answered the kickoff questions (see DECISIONS.md) and approved the Milestone 1 plan.
- **Built Milestone 1:** two dice, chip picker ($5/$25/$100), Field and Pass Line (come-out only) bets, Roll and Clear buttons, plain-language result messages. tests.html: 25 checks, all passing.

**Works**
- Field pays correctly on every total. Pass Line wins on 7/11, loses on 2/3/12.
- Bankroll and on-table amounts update correctly.

**Broken**
- Nothing known.

**Known limits (by design, Milestone 1)**
- No point phase yet: a point number leaves the Pass Line bet up and the next roll is a come-out again.

**Waiting on the owner**
- Public or private GitHub repository? Then create it and connect it so the code can be pushed. Nothing is on GitHub yet, and this workspace is temporary.
- Feedback after testing Milestone 1.

**Exact next step**
- Push to GitHub and turn on Pages, then (after feedback) plan Milestone 2: point phase, Odds bet, seven-out.
