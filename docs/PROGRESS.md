# Progress

Dated session log. Newest at the top.

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
