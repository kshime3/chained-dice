# Decisions

Dated log of every decision and why. Newest at the bottom.

## 2026-10-23

- **Plain HTML/CSS/JS, no frameworks or build tools.** Why: beginner-friendly, runs by opening `index.html`, free hosting on itch.io or GitHub Pages.
- **v1 covers only the first shift ($200 to $2,000).** Why: prove the core loop is fun before adding scaling.
- **Logic and display code in separate files; all tunable numbers in one config file.** Why: easy to tune and test the rules without touching the screen code.
- **Git from day one, one commit per working milestone.** Why: a safe save point we can always go back to.
- **Project lives in a `chained-dice/` folder with a `docs/` folder for notes.**
