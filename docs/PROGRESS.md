# Progress

Dated session log. Newest at the top.

## 2026-11-10: Release 1.0.5 "juice", milestone J1 (feel settings + vibration)

**Done (J1)**
- Settings: **Vibration** (On/Off; "Not on this phone" where the browser can't, e.g. iPhone) and **Reduce motion** (On/Off; starts on if the phone asks apps to reduce motion; remembered).
- Vibration follows the sounds (sound.js VIBES): a tick on each roll, a double buzz on a win (stronger for bigger win tiers), a long buzz on a seven-out, a pattern on winning a shift, a heavy one on the fall. It works with sound effects muted.
- Reduce motion turns off: screen shake (the fall), lamp flicker, falling dust, the link rattle, pulsing (low cash, coach highlight, mult bump), the fall's light flicker. Later juice checks body.reduce-motion.
- Android app: VIBRATE permission added to AndroidManifest.xml (takes effect in the next app build).

- Fix (owner found): on wider phones (~448px) the dice spilled onto the Field when "Table min" sat beside the point; the dice now reserve room for their 3D tilt.

**Done (J2)**
- New display file js/juice.js (all 1.0.5 effects will live there).
- Chip stacks on every bet with money: the amount drawn as up to 6 chips seen from the side, in the tray's colours (red $5, green $25, black $100; endless chips by size). Come bets that moved to a number stack on the Come tile.
- Flying chips: tray → bet when you bet (tap, MAX, patterns); bet → tray when you take chips back or Clear bets; after a roll, losing bets are swept off the top of the table toward the dealer and winnings fly to the Cash box. A dragged chip doesn't get a second flying chip. Reduce motion keeps the stacks, nothing flies.
- Vibration made stronger (roll tick 35ms instead of 12ms, longer win buzzes): the short ones were likely too short to feel on the owner's Pixel 9 Pro.

- Chip stack look changed to the owner's pick, **B: top-down pile** (from demos/stack-options.html): chips seen from above, each nudged up and right, largest chip on the bottom, the top chip shows its value.
- New rule in CLAUDE.md: major new images, animations or music always come with 3 options first.

**Done (J3, part 1)**
- Cash, Still owed and On table count to their new value (~0.3-0.7s; green going up, red going down); Interest box, the Break's cash box and its interest line pulse when interest pays. Reduce motion: numbers just change.
- Card pops: 3 options in demos/card-pop-options.html (A pill under the mult, B the card jumps out then shrinks into Inventory, C a card icon zips into the mult).

**Done (J3, part 2)**
- Card pops, style C (owner's pick): when your card adds mult (found by comparing each card's part of the mult before and after the roll) or does something else (its note in the roll message), its art zips from the Inventory tab into the mult pill, the mult bumps with a ding, "+0.25x" floats up above the pill with the card's name under it. Up to 4 per roll, one after another. The plain "+0.5x mult" pop is skipped when cards explain the gain. Reduce motion: just the name and bonus fade in.

- J4: 3 big-win looks in demos/big-win-options.html (A casino sign with chasing bulbs, B gold slam with rays and a chip burst, C ribbon sweep with chip rain); each cycles BIG/HUGE/MONSTER with growing shake.

**Done (J4)**
- Big-win banners, style B "gold slam" (owner's pick) with each level bigger and more intense: BIG (4x what was on the table), HUGE (10x), MONSTER (25x+) (CONFIG.bigWinX). Bigger letters, more ray layers (MONSTER darkens the room, red-gold), more chips (12 / 30 / 60 in up to three waves), white flashes on HUGE and MONSTER, stronger and longer screen shake, and a stronger vibration pattern per level. Not on a seven-out. Reduce motion: the words fade in and out, nothing else.
- The shake moves the top bar, shooter area and table only (shaking their parent knocked the pinned Roll button out of place).

- Testing shortcut https://kshime3.github.io/chained-dice/?showWins plays BIG, HUGE and MONSTER once (owner confirmed J4 works).

**Done (J5)**
- ON puck: when a point is set, a white "ON" puck slides from the POINT pill onto that number's Place tile (sitting on its top edge so the number stays readable); it fades away when the point ends.
- A new shooter's face and name slide in from the right.
- Roll pulses with a bright green glow (owner: the first gold glow wasn't noticeable on the gold button) whenever a roll is possible, and presses down when tapped. Reduce motion: no slide or pulse (a steady glow instead).

**Exact next step**
- Owner tests J5, then "build J6" (Break touches: shop cards flip in, bought cards fly to Inventory, reroll shuffle, plaque take-back in reverse, unlock celebration).

## 2026-11-09: Release 1.0.4, milestone A (quick fixes)

1.0.4 plan (owner, QoL only, one milestone at a time): A quick fixes, B big Roll button above the tabs, C Hand becomes Inventory with the odds chart, D Dealer Break layout (scroll / tabs), E betting pattern buttons, F code polish + version 1.0.4.

**Done (A)**
- ⚙ and 📖 close their page when tapped again; opening one closes the other.
- Interest in its own blue box next to Cash and Still owed.
- Chips stand out: the room's dark edge shading sat over the chip row (now above it), brighter chip colours with a shine, a light rim (the black $100 shows on the dark table), the picked chip lifts with a gold ring.
- Take-back chip reads "↩ TAKE BACK" instead of ✖.

**Done (B)**
- Phones: Roll is a wide gold button fixed just above the tab bar (Table tab only), so it never moves when the message changes length.
- The open tab is no longer gold-filled (dark with a gold edge), so only Roll looks like the big gold button.
- To make room, Clear bets / Save bets / Same bets / Odds became compact icon buttons on the chip row (phones); chips are slightly smaller there. A normal turn fits all five test screens; the rare worst case (boss rule + challenge + big SEVEN OUT text) scrolls 10-26px on the two smallest phones, where the Break covers the screen anyway.

**Done (C)**
- Hand tab renamed 🎒 Inventory; the odds chart ("What could the next roll be?") sits at the top of it, live for the current shooter. The 📊 Odds button and pop-up are gone; tutorials now point to Inventory. Key I (or H) opens it.
- 1.0.5 "juice" release planned in docs/IDEAS.md (owner approved all, incl. the small ones); 1.1 list updated there.

**Done (D)**
- Found the scroll bug: the Break remembered its scroll position, so tapping Next shooter at the bottom made the next Break open at the bottom. Every Break now opens at the top.
- The Break is split into tabs: 💰 Pay · 🃏 Shop (stock + your cards) · 🎟 Comps · ⛓ Crew (Trapdoor, Ghost Story pick, Hire). It opens on Pay when paying is open, otherwise Shop; no tab strip when only paying exists (shift 1's first Break). A dot on Crew when Ghost Story needs a pick.
- The tab strip sticks to the top while scrolling; the message, warning and Next shooter button stay pinned at the bottom.
- Cards in the Break are two per row on phones (the shop went from ~3.7 screens tall to ~1.4).
- 1.0.5 split into milestones J1-J7 in docs/IDEAS.md.

- Owner feedback: Still owed and Your cash were easy to miss while shopping. They're now the same coloured boxes as the top bar, pinned with the tabs; Your cash turns red and pulses with "Low! Keep $X to bet" under 3 table minimums (CONFIG.lowCashMins).

**Done (E)**
- Betting patterns: Across, Inside, Outside, Iron Cross, All the Hardways. One tap puts your chosen chip on every bet in the set (once a point is on; only patterns whose bets you've unlocked show). Tall phones (800px+) get a row of pattern buttons in the empty space under the chips; shorter phones get a 🎯 Patterns button on the chip row that opens a pick list. 3-Point Molly left out: it's built over several rolls, so it can't be one tap.
- Logic in shift.js (BET_PATTERNS, patternCheck, placePattern); 3 new rule checks (492); the autoplay bot uses patterns too.

**Done (F: code polish, no visible changes)**
- Checked every function is still used (none dead); removed styles left over from the old odds pop-up and the old deposit box.
- One shared list of the five main bet boxes (was copied in three places); one `cantAct()` check for table actions (was copied six times); the Break's paying part split into its own function (renderPayArea).
- File header comments and CLAUDE.md's file layout updated (Inventory, Break tabs, patterns, plaque take-back).
- Full check: 492 rule checks, three phone sizes fit, 1.0.3 features (drag, MAX, plaques, short Break), touch dragging, Break tabs, patterns, 25 + 5 bot runs, simulator still runs.
- Version 1.0.4 (versionCode 5); release notes in store/LISTING.md.

**Waiting on the owner**
- Test on the phone, then pull, npm run sync, build, upload 1.0.4 to the closed test.

**Exact next step**
- 1.0.5 "juice", milestone J1 (feel settings + vibration). Plan in docs/IDEAS.md.

## 2026-11-08: Release 1.0.3 (QoL, built from the owner's list)

**Done**
- Take back plaques: "↩ Take back a plaque ($20)" under the pay buttons returns the newest plaque dropped at this Break; leaving the Break locks them in (a plaque that pays the debt off ends the shift, so it can't come back).
- MAX button on the Odds and Lay Odds tiles (key M): fills to the max for this point, or as much as your cash allows.
- Drag chips: drag a chip onto any bet to place it; drag a bet back onto the chips to take one table minimum off it. Tapping still works. Mouse and touch.
- Opening Break of every shift: while paying isn't open, the drop box and pay buttons are replaced by "🔒 The drop box opens after Jinx rolls." (the wrong "Shop first" line is gone).
- Shift 1's opening Break for returning players (finished a shift or fallen before): just "Shift 1. You owe the dealer $200." + the lock line + Next shooter.
- End screen: the ⚙ / 📖 / How to play buttons are hidden so they don't cover the chain.
- 2 new rule checks (489). Version 1.0.3 (versionCode 4).
- Fix (owner found): a dragged chip always looked like the green $25; it now takes the colour of the chip you picked up.

**Waiting on the owner**
- Test in the browser, then pull, npm run sync, build, upload 1.0.3 to the closed test.

**Exact next step**
- Closed test running; next work is release 2.0 (list in docs/IDEAS.md).

## 2026-11-07: Release 1.0.2 polish (part 1)

**Done**
- Keyboard shortcuts list hidden in the Android app and on touch-only devices (computers still see it).
- Settings: "Show them again" is now "Show again".
- Shift number in a gold badge next to Cash and Still owed.
- Mult in its own pill (orange glow when hot, blue when cold).
- The shooter's face (cropped crew portrait) beside "Now shooting"; on phones the line is shortened to "Lefty (1 of 3)" with the mult pill beside it, so the table still fits.
- Chain preview: demos/chain-options.html (A real chain, B heavy chain and padlock, C ring counter).

- Pay off debt asks first: "Pay off the whole debt?" says the shift ends now, how many shooters won't roll, how much you keep (and the dealer's cut), and what you'll start the next shift with. Its buttons ignore taps for 0.6s, so rapid tapping can't confirm by accident. The pay buttons now sit in fixed halves and never move. Esc / Android back cancels.
- Seat Swap text says what it's for. IDEAS: release 2.0 section (growing-odds card, 3-use Seat Swap); 1.0.x is QoL only.

- Chain style A built into the game (top bar and the end-of-shift snap): interlocking links, broken ones grey and snapped open; the snapping link glows red-hot and flies apart.

- Hot Hand art redrawn: an open hand (separate fingers, thumb out) in flames (owner's pick).
- Last Break: if you have the cash, the leave button reads "Pay $X and break the link" and pays, instead of "Face the pit boss" (which meant the fall). 2 new rule checks (487).
- Version 1.0.2 (versionCode 3).

**Waiting on the owner**
- Pull, npm run sync, build the signed .aab, upload to the closed test track with the 1.0.2 notes in store/LISTING.md.

**Exact next step**
- Build the chosen chain, bump to 1.0.2 (versionCode 3), owner builds and uploads.

## 2026-11-05: Friend feedback: take back single chips; clearer odds pop-up

**Done**
- New ✖ take-back chip next to the chips (key X): tap a bet to take one chip of the last size off it, double-tap to take the whole bet. Bets that can come down get a dashed red outline; the rest dim. Same rules as Clear bets (line bets stay once a point is on; the Fire Bet stays once the shooter rolls).
- Odds pop-up redesigned: "What could the next roll be?", a colour key, and one plain bar for what matters right now (come-out: 7/11 win, 2/3/12 lose, 4-10 sets the point; with a point: "Which comes first, the 8 or a 7?").
- 6 new rule checks (485 pass). Fits all 5 test screens; autoplay 25 runs, no errors.

**Waiting on the owner**
- Try it in the browser. Testers on the app need a new build (version 1.0.1, versionCode 2) to see it.

**Exact next step**
- Version bumped to 1.0.1 (versionCode 2) on 2026-11-06. Owner: pull, npm run sync, build the signed .aab, upload to the closed test track.

## 2026-11-04: Android Phase E, internal testing live

**Done**
- Owner: Play account verified; app created (Paid); upload key made and backed up; signed .aab built in Android Studio; internal testing release live and installed from Google Play on the owner's Android phone.
- Claude: Git ignores signing keys and android/.idea.

**Waiting on the owner**
- Play the Play Store build on the phone (speed, music, back button, saves). Finish the store listing and app-content forms (answers in store/LISTING.md).

**Exact next step**
- Phase F: closed testing track, promo codes, invites (store/INVITE.md), 12+ testers for 14 days.

## 2026-11-02: Licenses page

**Done**
- Copyright check (notes in docs/ANDROID.md). licenses.html with the MIT / Apache 2.0 notices the app needs, linked in Settings > Credits and copied into the app.

**Waiting on the owner**
- Store text review, category, contact email; Play Console ID check.

**Exact next step**
- Phase E: upload key, signed release build, internal testing (after the ID check).

## 2026-11-02: Android Phase D, store listing draft

**Done**
- store/LISTING.md: app name, short description (76/80), full description (2,043/4,000), release notes, category advice (Strategy), content rating and Data safety answers, Play wording rules. Facts checked against the game (58 cards, 11 comps, 9 crew, 55 unlocks).

**Waiting on the owner**
- Review the text; pick the category and the public contact email. Play Console ID check.

**Exact next step**
- Phase E: create the upload key, build the signed release (.aab), internal testing.

## 2026-11-02: Android Phase A part 2 (icon and store art)

**Done**
- Owner: the app runs in the emulator; music, back button and portrait all work.
- App icon from the Blood Pip logo (adaptive, round, legacy, monochrome) and a dark splash screen, replacing Capacitor's placeholders. Store art in store/: 512 icon, 1024 x 500 feature graphic, five 1080 x 1920 screenshots. Generators: tools/make-icons.js, tools/make-store-art.js.
- Phase A is complete.

**Waiting on the owner**
- Pull, `npm run sync`, Run, and check the home-screen icon and the splash. Play Console ID check.

**Exact next step**
- Phase D: store listing text (Claude drafts), then Phase E: the signed release build and internal testing.

## 2026-11-02: The app runs in the Android emulator

**Done**
- Owner: cloned with GitHub Desktop, npm install / npm run sync, new Android Studio (Gradle JDK 21), enabled SVM in the BIOS and Windows Hypervisor Platform; the game runs in a Pixel 8 / API 36 emulator (a bit laggy on this PC). Log instructions in docs/ANDROID.md.

**Waiting on the owner**
- Emulator checks (music, back button, rotation) and any logs; Play Console ID check.

**Exact next step**
- Fix anything the emulator shows; then Phase A part 2 (app icon and store art).

## 2026-11-02: Android Phase C, repo side

**Done**
- Owner: Play Console account created (ID still to submit), Node.js and Android Studio installed.
- Capacitor 8.6 Android project in the repo (app ID com.kshime3.chaineddice, API 36, portrait, version 1.0.0), copy script, App plugin for the back button. The app copy loads cleanly; tests 479 passing, autoplay clean.

**Waiting on the owner**
- Submit the Play ID check. Clone with GitHub Desktop, `npm install`, `npm run sync`, open `android` in Android Studio, run it in a Pixel 8 / API 36 emulator (steps in docs/ANDROID.md, Phase C), and report back.

**Exact next step**
- Fix whatever shows up in the emulator; then Phase A part 2 (app icon and store art).

## 2026-11-01: Android Phase A, part 1 (app foundations)

**Done**
- Owner accepted the Android recommendations (D1-D6).
- App mode (`CONFIG.inApp`, `?app` to preview), Android back button (closes popups, asks before leaving), sound suspends in the background, notch spacing in the app, version in Settings, privacy.html (linked in Settings). Tests 479 passing, 5 sizes fit, autoplay clean; back button tested with a simulated app.

**Waiting on the owner**
- Phase B: Google Play Console account ($25, ID check) and payments profile; install Node.js LTS and Android Studio on the PC (steps on request).

**Exact next step**
- Phase A part 2: Android app icons and the store art (screenshots, feature graphic, 512 icon).

## 2026-11-01: Android plan

**Done**
- docs/ANDROID.md: the plan for a paid Android app (Capacitor wrapper, Play Console steps, the 12-tester 14-day closed test, store listing, signing, launch). Checked current Play rules (closed test, paid-app testers must buy, target API 36).
- Card upgrades dropped from the ideas list (owner).

**Waiting on the owner**
- Decisions D1-D6 in docs/ANDROID.md (or accept the recommendations).

**Exact next step**
- Phase A (Claude: app-ready game) and Phase B (owner: Play Console account and PC tools) in parallel.

## 2026-11-01: Dark side late game (Body Count)

**Done**
- New rare Dark side card Body Count (locked): every seven-out your Don't Pass wins adds +0.1x mult for the rest of the run. Art drawn. Tuned in the simulator; career pace unchanged. Tests 479 passing, 5 sizes fit, autoplay clean.
- The three balance follow-ups from the owner's question (Trapdoor payoff, "+1 way to roll 7", dark late game) are all done.

**Exact next step**
- Friend feedback, card upgrades (Hot Hand II), or the Android roadmap.

## 2026-11-01: "+1 way to roll 7" fix

**Done**
- The phone only offers "+1 way to roll 7" with a Dark side card; each copy pays 2% of the debt on every seven-out your Don't Pass wins. Don't Pass bots learned to take it. Tests 476 passing, autoplay clean.

**Exact next step**
- Dark side late-game scaling (last open item from the balance question), friend feedback, card upgrades, or the Android roadmap.

## 2026-11-01: Trapdoor payoff

**Done**
- Simulator showed dropping crew was always a loss and "+1 way to roll 7" a trap for Pass Line players (BALANCE.md). Trapdoor and Free Trapdoor now give everyone left +0.5x mult for the rest of the run (stacking); tutorial, button help and perk text updated. Tests 473 passing, autoplay clean.

**Exact next step**
- Owner's choice: the "+1 way to roll 7" dark-side fix, dark side late-game scaling, friend feedback, card upgrades, or the Android roadmap.

## 2026-11-01: Crew theme

**Done**
- 🤝 Crew theme: 8 new locked cards (Snake's Fangs, Big Mo's Belt, Lou's Horseshoe, Professor's Notes, Jinx Jar, Roll Call, Crew Captain, Recruiter) with art; Lefty's Glove, Dee's Ledger, Rod's Lighter and Ghost Story joined the theme.
- Balance: first escape back near before (28 / 26 runs) after harder goals and toning down Crew Captain and Roll Call. Tests 470 passing (9 new), 5 sizes fit, autoplay clean.

**Exact next step**
- Friend feedback, or card upgrades (Hot Hand II), or the Android roadmap.

## 2026-11-01: Comp and perk art

**Done**
- 11 comps drawn (steel-blue panels): shop comp cards, hand tiles, Collection. 5 phone perk drawings (purple panels; "+1 way to roll N" shows N): the phone's offer cards. Tests 461 passing, 5 sizes fit, autoplay clean.

**Exact next step**
- Act on friend feedback, or pick from docs/IDEAS.md (card upgrades, a crew theme, the Android roadmap).

## 2026-11-01: Small polish (keyboard and press-and-hold)

**Done**
- js/controls.js: keyboard shortcuts (list in Settings) and press-and-hold help bubbles on phones (bets, cards, comps, crew seats, buttons). Main bets got help text. Tests 450+11 = 461 passing, 5 sizes fit, coach flow fine, autoplay clean; keys and holds tested in a browser.

**Waiting on the owner**
- Trying the keys and holds; friend feedback.

**Exact next step**
- The agreed list (fall, card art, playtest note, huge numbers, polish) is done. Next: act on friend feedback, or pick from docs/IDEAS.md (comp/perk art, card upgrades, a crew theme, the Android roadmap).

## 2026-11-01: Huge numbers (endless mode)

**Done**
- Endless only: big-number display ($1.25M, $45.6B...), growing chips, compounding interest, 5 ♾️ Endless x-mult cards with art, high scores (best endless shift, biggest win), escape-screen explanation, `?endless` testing shortcut.
- Balance: endless had a runaway tail (7-free dice); added "the house fights back" (+1 way to roll 7 every 2 endless shifts). Veteran escapers: 26% survive 6 endless shifts (millions), 9% 10, 1% 15 (billions). 8-shift run unchanged.
- Checks: tests.html 461 passing (11 new), 5 sizes fit, autoplay clean.

**Waiting on the owner**
- Trying endless (`?endless`), and friend feedback.

**Exact next step**
- 5. Small polish (keyboard shortcuts, press-and-hold help), or act on friend feedback.

## 2026-11-01: Playtest feedback note

**Done**
- "💬 Send feedback" on every end-of-run screen: fun 1-5, play again, what confused you; "Copy feedback" copies answers plus a run summary to paste in a message. Falls back to selected text if the browser blocks copying. Tests 450 passing, 5 sizes fit, autoplay clean.

**Waiting on the owner**
- Sharing the link with friends and collecting pasted feedback (paste it here and I'll sort it into fixes and ideas).

**Exact next step**
- While feedback comes in: 4. huge numbers (endless scaling), then 5. small polish.

## 2026-11-01: Card art, batch 5 (no theme): all cards drawn

**Done**
- Drew the last 18 cards (the ones with no theme). All 44 cards now have art. Tests 450 passing, 5 screen sizes fit, autoplay clean.

**Waiting on the owner**
- A look at the last batch.

**Exact next step**
- Agreed order: 3. friends playtest round (owner shares the link; optionally an in-game "What did you think?" note), 4. huge numbers (endless scaling), 5. small polish (keyboard shortcuts, press-and-hold help).

## 2026-11-01: Card art, batch 4 (Money)

**Done**
- Drew the 5 Money cards (Loan Shark, Green Dice, Compound, Stash, Early Bird). Tests 450 passing, autoplay clean.

**Exact next step**
- Card art batch 5 (last): the 18 cards with no theme (Lucky Seven, Red Dice, Odds Addict, Pit Boss's Pity, Muggsy, Loaded Die, Reroll, Dealer's Bargain, Lefty's Glove, Dee's Ledger, Ghost Story, Encore, High Roller, Front of the Line, Sleight of Hand, Steady Hand, Dice Collector, Spare Link).

## 2026-11-01: Card art, batch 3 (Hot streak)

**Done**
- Drew the 7 Hot streak cards (Hot Hand, Point Collector, Rod's Lighter, Comeback Kid, Heater, Long Night, Torch Pass). Tests 450 passing, autoplay clean.

**Exact next step**
- Card art batch 4: Money (Loan Shark, Green Dice, Compound, Stash, Early Bird), then the cards with no theme.

## 2026-11-01: Card art, batch 2 (Pairs)

**Done**
- Owner liked batch 1. Drew the 8 Pairs cards (Double Up, Doubles Charm, Hardway Hustler, Rattlesnake, Snake Eyes, Mirror Dice, Boxcars, Twin Souls). Tests 450 passing, autoplay clean.

**Exact next step**
- Card art batch 3: Hot streak (Hot Hand, Point Collector, Rod's Lighter, Comeback Kid, Heater, Long Night, Torch Pass), then Money, then cards with no theme.

## 2026-11-01: Card art, batch 1 (Dark side)

**Done**
- Owner picked style E. js/card-art.js draws card art in code; shown on shop cards, hand tiles and the Collection. Batch 1 drawn: the 6 Dark side cards. Other cards show a plain die until their batch.
- Checks: tests.html 450 passing, 5 screen sizes fit (with a full hand), autoplay 25 runs no errors. Display only, no simulator.

**Waiting on the owner**
- Feedback on the Dark side drawings.

**Exact next step**
- Card art batch 2: Pairs (Double Up, Doubles Charm, Hardway Hustler, Rattlesnake, Snake Eyes, Mirror Dice, Boxcars, Twin Souls), then Hot streak, Money, and the cards with no theme.

## 2026-11-01: The fall scene

**Done**
- New fall scene (display only, about 10 seconds after the owner asked for 5 more): dealer's last words, trapdoor bangs open, your real crew drops into the pit, "Out of chips." / "The debt went unpaid.", THE FLOOR OPENS. Music fades out and returns next run; new fall sound. Tap to skip.
- Checks: tests.html 450 passing, 5 screen sizes fit, autoplay 25 runs no errors, music fade tested. No simulator run (display only).

**Waiting on the owner**
- Watching the fall on phone and computer.

**Exact next step**
- Agreed order: 2. card art (an icon per card, in batches by theme), 3. friends playtest, 4. huge numbers, 5. small polish.

## 2026-10-31: Themed cards

**Done**
- 12 new themed cards (Dark side, Pairs, Hot streak, Money; 3 each, all locked with hidden goals). Cards show a theme label; Graveyard Shift, Mirror Dice, Heater and Compound grow with every card of their theme you own. Older cards got theme labels too.
- Reputation is now every 4 unlocks (was 3) to keep the game taking ~30 runs to beat; quick unlock goals raised.
- Checks: tests.html 450 passing (15 new), 5 screen sizes fit, autoplay 25 runs no errors, balance retest in BALANCE.md.

**Waiting on the owner**
- Trying the new cards (test steps in chat; `?unlockAll&cards=...` shortcut).

**Exact next step**
- Owner's choice: more themes or "grows" cards, a crew theme, art polish (card art, the fall), or friend feedback.

## 2026-10-31: Session 9, continued (look B, step 1, on branch 3d-look)

**Done**
- Owner picked look B. On branch `3d-look`: the room (lamp light, flicker, dust, dark edges), tilted table with wooden rail, chained crew portraits (js/art.js). Fits all screen sizes; tests.html 435 passing; autoplay 25 runs no errors.

**Waiting on the owner**
- Looking at step 1 (screenshots or by checking out the branch).

- Step 2 done: the whole game themed to match (wood, leather, brass, parchment, serif headings). tests 435 passing, all sizes fit, autoplay clean.

- Step 3 started: music player, settings and credits built and tested with temporary tones (silent until tracks are added).

- Shift 1 now plays its own dark track, "Phantasm" (owner picked B from demos/music-options.html); credits updated.
- Music added: six Kevin MacLeod tracks (CC BY 4.0), calm and tense playlists, credits in Settings and music/CREDITS.txt.

- **Merged `3d-look` into `main`** (owner approved): look B and the music are live on the GitHub Pages link. All checks passed on main (435 rule checks, 5 screen sizes, coach flow, autoplay 25 runs with 13 escapes and no errors, balance unchanged).

- Music fix for phones (starts on a real tap; volume through Web Audio; status line in Settings).

**Waiting on the owner**
- Listening to the new shift 1 track (Phantasm) on the phone; friend feedback.

**Exact next step**
- Owner's choice: builds (themed cards that reward a strategy), more art polish (card art, the fall), or the Android roadmap when ready.

## 2026-10-31: Session 9, continued (planning art, music, Android)

**Done**
- Discussed an Android release (estimate, money models, readiness). Decision: Android is a roadmap goal; art and music first.
- Art direction previews (B: CSS 3D "sitting at the table", C: Three.js 3D scene) are built on the `3d-look` branch; main stays as the playable game.

**Exact next step**
- Owner picks B or C from the previews; then free licensed music.

## 2026-10-31: Session 9, continued (code cleanup)

**Done**
- Shared `playRoll` for game and simulator; ui.js split into three display files; hidden cards row and unused styles removed; `index.html?autoplay` bot (25 runs in under a minute: 17 escapes, endless mode, no errors). tests.html: 435 checks, all passing. Balance unchanged.

**Waiting on the owner**
- Trying `?autoplay`; playtesting.

**Exact next step**
- Builds: themed cards that reward a strategy (dark side, hard ways, crew) and a shop that leans toward your theme. Then art and music.

## 2026-10-31: Session 9, continued (sticky unlock screens, phone tabs)

**Done**
- Unlock / "New from your next run" screens wait for a Continue button.
- Phone layout with tabs: Table / Hand / Crew. Fits 360x740, 390x844 and iPhone SE 375x667; laptops and desktops unchanged. tests.html: 432 checks, all passing; 25 auto-played runs with no errors.

**Waiting on the owner**
- Testing the tabs on a phone; more friend feedback.

**Exact next step**
- Code cleanup (split ui.js; an automatic play-through in tests.html), then builds/themed cards, then art and music.

## 2026-10-31: Session 9 (teaching craps)

**Done**
- Friends' feedback: they'd never played craps and found it confusing. Built: guided first shooter (coach), live "Wins / Loses" hints on every bet and the point marker, plain-English roll headlines, a 2-page first-visit intro. tests.html: 432 checks, all passing. Fits one screen on phones.

**Waiting on the owner**
- A friend who has never played trying the new start (fresh browser or private window).

**Exact next step**
- Phone layout with tabs (Table / Hand / Crew) and the code cleanup.

## 2026-10-30: Session 8, continued (check-in, run saving)

**Done**
- Check-in: owner agreed the plan (DECISIONS.md).
- Built run saving: continue a run after a refresh or a closed tab; a roll or phone call cut off mid-way is finished the same way (no undo). tests.html: 421 checks, all passing.

- Step 3 built (friends playtesting meanwhile): comps, dice crafting and challenges arrive after the first run; house rules the run after first reaching shift 3; each announced (guaranteed unlock moment after run 1). tests.html: 427 checks.

- Logo: owner picked C3 "Blood Pip" (darker take on Break the Chain). In the game as the tab icon, home-screen icon and title logo; plus an opening animation (die rolls in leaving a blood trail, chain snaps, title, fade).

**Waiting on the owner**
- Testing the logo and opening; friends playtest feedback; testing the first-run flow.

**Exact next step**
- Step 4: phone layout with tabs (Table / Hand / Crew) and the code cleanup.

## 2026-10-30: Session 8, continued (drop box, mult pop, win sounds)

**Done**
- Paying the dealer is now plaques in a drop box (10% of the debt each, last one pays the rest), "Pay off debt" kept. Mult pops with a ding when it rises. Four win sounds by win size. Pop-up screens always cover the floating popups. tests.html: 414 checks, all passing. Fits one screen on phones.
- Balance: unchanged (bots pay with the same logic; plaques only change how a person pays).

- Whole table on screen (locked bets greyed with 🔒), roll % chart behind a "📊 Odds" button. Still fits one screen on phones.
- Bets you can play right now glow gold; others are greyed. Place bets and Hard Ways now wait for a point. tests.html: 418 checks.
- Cash and Still owed are big coloured boxes in the top bar; the left column on bigger screens shows your cards, comps (with Use buttons) and perks.

**Waiting on the owner**
- Playtesting.

**Exact next step**
- Owner's choice.

## 2026-10-30: Session 8, continued (3D dice options)

**Done**
- `demos/dice-3d.html`: three working 3D dice styles to compare: A spin in place (CSS), B thrown across the felt (CSS), C lit 3D with shadows (Three.js library). All land on the rolled number.

- Owner picked **A**: built into the game. The table dice are now CSS 3D cubes that hop and tumble, landing on the rolled number (Loaded Die only spins the rerolled die). Fits one screen on phones; tests.html 409 checks passing.

**Waiting on the owner**
- Playtesting the 3D dice.

**Exact next step**
- Owner's choice: more cards (Crew Captain, Jinx Jar parked), press-and-hold help on phones, or playtest fixes.

## 2026-10-30: Session 8, continued (win screen, recruit prices, new cards)

**Done**
- Tidier win screen. Recruits priced by strength (Hot Rod 40% ... Snake 10%). Six new locked cards (Comeback Kid, Point Collector, Loan Shark, Hardway Hustler, Steady Hand, Dice Collector) with hidden goals; 3 more Reputation steps. Simulator: recruit test, profile reset fix. tests.html: 407 checks, all passing. Fits one screen on phones; 25 auto-played runs with no errors.
- Balance: career median first escape 26-32 runs (target 30-60).
- Unlocks now say why once earned ("Unlocked by surviving shift 3."), on the unlock screen and in the Collection. tests.html: 409 checks.

**Waiting on the owner**
- Playtesting; whether the pace feels right.

**Exact next step**
- Owner's choice: more cards (Crew Captain, Jinx Jar parked), press-and-hold help, 3D dice, or playtest fixes.

## 2026-10-30: Session 8 (polish pass)

**Done**
- Audit: a script played 25 full runs (8 escapes, endless mode, up to shift 9) with no errors; screenshots reviewed. Rough edges found: a line bet below the table minimum only complained at Roll; a big chip stayed selected when you couldn't afford it; header buttons overlapped pop-ups.
- Built: Save bets / Same bets, smarter betting, pop-up layering, win/loss popups, ⚙ Settings (sound, quick dice, replay tutorials, reset progress). tests.html: 398 checks, all passing. Fits one screen on phones.
- Balance unchanged (BALANCE.md).

**Waiting on the owner**
- Playtesting the polish pass.

**Exact next step**
- Owner's choice: more polish (tidier win screen, press-and-hold help on phones), 3D dice, or more content.

## 2026-10-29: Session 7, continued (Milestone 12b: more bets)

**Done**
- Owner chose: all four bets (Hard Ways, Place, Come & Don't Come, Fire Bet), mult applies, draft goals.
- **Built 12b:** new bet rules in `js/bets.js` (one shared `settleResults` for game and simulator), a second "➕ More bets" board, per-bet tutorial on first view, Collection "Bets" section, unlock goals. Pity now covers the new bets. tests.html: 390 checks, all passing. Fits one screen on phones.
- **Balance:** Place bets are strong with mult cards; their goal raised to 150 points. Bot median first escape 32-38 runs (target 30-60); new player still ~0.1% per run.

**Waiting on the owner**
- Playtesting the new bets and the overall progression.

**Exact next step**
- Owner's choice: polish pass, 3D dice, more content, or more playtesting fixes.

## 2026-10-29: Session 7, continued (Milestone 12a: making unlocks matter)

**Done**
- Owner chose: stronger locked cards + trimmed starters, a fixed Reputation ladder, slower unlocks (half by ~20 runs), first escape around run 30-60.
- Measured every card; trimmed 4 starters, strengthened 9 locked cards. Goals moved to `CONFIG.unlockGoals` and slowed. Reputation: 8 lasting bonuses, one per 3 unlocks, shown in the Collection and on the unlock screen. tests.html: 366 checks, all passing.
- Simulator: `VETERAN=1`, `LOCKED=1` (fresh every run), career mode. Bot median first escape now 69-84 runs (was ~200 and not driven by progress); new player 0.1% per run, veteran ~6-7%.

**Waiting on the owner**
- Playtesting; whether 70-85 bot runs (a human should be faster) feels right.

**Exact next step**
- 12b: new bets (Hard Ways, Place, Come, Fire Bet) as unlocks.

## 2026-10-29: Session 7, continued (Milestone 12a: unlocks)

**Done**
- Owner chose: fully hidden goals; also lock some comps (Loaded Shot, Copycat, Chisel) and recruits (Lucky Lou, The Professor); unlocks show up from the next run; draft unlock list approved.
- **Built 12a:** new `js/unlocks.js` (24 locked items, hidden goals, progress saved in the browser). "🔓 UNLOCKED!" screen, 📖 Collection screen (found first, "???" mysteries, reset link), "Many runs" page in How to play, `?unlockAll` shortcut. Splash screens now queue instead of hiding each other. tests.html: 358 checks, all passing. Fits one screen on phones.
- **Balance:** simulator career mode. Bot needs a median of ~200 runs to first escape, but unlocks don't make it stronger (new player 0.4% vs all unlocked 0.3%). Details in BALANCE.md.

**Waiting on the owner**
- How unlocks should add real power (so runs build toward a win), and whether unlocks come too fast (half in 5 runs).
- Testing 12a.

**Exact next step**
- Act on the owner's answer; then 12b: new bets (Hard Ways, Place, Come, Fire Bet) as unlocks.

## 2026-10-29: Session 7, continued (3-seat start with Jinx)

**Done**
- Built: runs start with 3 seats (you, Jinx always, 1 random starter), same debts. Unseated starters can be hired; dropped crew never come back. "How to play" updated. Fixed an empty house-rule box showing on shifts with no rule. tests.html: 345 checks, all passing. Fits one screen on phones.
- Balance: 23-26% of bot runs survive shifts 1-2 (was 46%); walk out free 0.2-0.3%. Dropping Jinx right away doesn't help the bot.

**Waiting on the owner**
- Playtesting the harder start (and Milestone 11).

**Exact next step**
- Milestone 12: card unlocks with hidden requirements, plus more bets as unlocks.

## 2026-10-29: Session 7, continued (3-shooter test, "kitty" -> "cash")

**Done**
- Simulated starting with 3 shooters (you + 2 crew, hire up to 6). It needs easier shifts 1-2 ($150 / $225 owed), then plays like today from shift 4. Results in BALANCE.md. Not built into the game yet.
- Renamed "kitty" to "cash" in the game, tests, simulator and docs. tests.html: 339 checks, all passing. Still fits one screen on phones.
- Owner restated the goal: nobody should beat it on the first run; unlocks over many runs should make it beatable.

**Waiting on the owner**
- Build the 3-shooter start, or keep 6? Testing Milestone 11.

**Exact next step**
- Milestone 12: card unlocks with hidden requirements (the main way players get stronger across runs), plus more bets as unlocks.

## 2026-10-29: Session 7, continued (Milestone 11: house rules + challenges)

**Done**
- Owner chose: drop Short Table, Stingy Field and Jinxed; add **House Die** (left die fixed to a random 1-6) and **Dark Side Only**; a boss rule on the last link (No Free Lunch, Cold Dice, Seven Heaven); challenges on your own turn only.
- **Built Milestone 11:** new `js/rules.js`. 7 house rules from shift 3, 3 boss rules on the last link, 8 pit boss challenges from shift 2 with 4 reward types (cash, debt cut, free comp, free Shuffle). Gold/red rule tag (hover or tap), rule line on the opening Break, blue challenge box with progress, greyed Pit Watch badge, closed Pass Line under Dark Side Only, free Shuffle button. Two short tutorials. Testing shortcut `?rule=id`. tests.html: 339 checks, all passing. Fits one screen on phones.
- **Balance retest:** rules make shifts 3-8 harder for the bot (walk out free 1.2% -> 0.4-0.7%). Curve still rises; scale left alone pending the owner's playtest (BALANCE.md). Simulator found and we fixed a House Die + guaranteed-pair bug.

**Waiting on the owner**
- Testing Milestone 11, and saying whether the difficulty feels right.

**Exact next step**
- Milestone 12: more bets as unlocks, and locked cards with hidden unlock requirements.

## 2026-10-29: Session 7 (Milestone 10: crew growth)

**Done**
- Owner chose: all at once; hire into empty seats (max 6); crew levels skipped; Encore before the final Break; crew cards only while that person is seated. Idea logged: start with 3 crew, recruit up to 6.
- **Built Milestone 10:** roster (who's seated, carries over) split from the shooting order. 5 crew cards (Lefty's Glove, Dee's Ledger, Rod's Lighter, Jinx's Shadow, Ghost Story with a Break picker), 4 "You" cards (Encore extra turn, High Roller, Front of the Line, Sleight of Hand), Hire section with 4 recruits (Snake, Big Mo, The Professor, Lucky Lou), Hire tutorial page. tests.html: 310 checks, all passing. Fits one screen on phones.
- **Balance retest:** game difficulty about the same when the new cards are ignored; a flat-betting bot gets little from the new cards. No rescale (BALANCE.md).

**Waiting on the owner**
- Testing Milestone 10.

**Exact next step**
- Milestone 11: house rules + pit boss challenges.

## 2026-10-28: Session 6, continued (Milestone 9: dice crafting)

**Done**
- Owner chose: edit **only your own dice**; Nudge wraps (6 -> 1, 1 -> 6); sold in the comps row; 7-floor rule; a workshop animation.
- **Built Milestone 9:** new `js/crafting.js`; your dice live in `state.myDice` and carry over. Three edit comps (Nudge, Copycat, Chisel; rarer ones show up less). Dice workshop: pick a face, see which totals each option changes, watch the face rise, flip and reforge. 🔨 on your seat; hover lists your faces. tests.html: 289 checks, all passing. Fits one screen on phones.
- Design note: editing one die alone never changes your 7s (explained in the workshop).
- **Balance retest:** no rescale needed (BALANCE.md). Edits only help your own turn; "You" cards idea logged in IDEAS.md.

**Waiting on the owner**
- Testing dice crafting.

**Exact next step**
- Milestone 10: crew growth (and "You" cards like an extra turn).

## 2026-10-28: Session 6, continued (Milestone 8: comps)

**Done**
- New owner rules: every milestone ends with a balance retest (in CLAUDE.md); some cards start locked with **hidden** unlock requirements (Milestone 12), so beating the game takes many playthroughs.
- **Built Milestone 8, comps:** new `js/comps.js`. 8 comps (No Sevens, Double Down, Lucky Pair, Loaded Shot, Insurance, Hot Seat, Seat Swap, Cash Advance), 2 slots, shop row of 2 per Break, sell for half, armed comps glow and change the odds chart, Loaded Shot face picker, free comp on a point hit at 3x+, phone perk "2 free comps", comps tutorial. Comps carry over. Fits one screen on phones (comp buttons share the cards row). tests.html: 276 checks, all passing.
- **Balance retest:** comps add a little power; curve still rises; no rescale needed (BALANCE.md).

**Waiting on the owner**
- Testing comps.

**Exact next step**
- Milestone 9: dice crafting (face edits, reusing the comps system).

## 2026-10-28: Session 6 (rescale)

**Done**
- Owner asked to adjust the scales and retest before Milestone 8.
- Simulator: added bots that scale bets to the debt. Found later shifts were no harder than early ones (~80% each) because leftover money snowballs; steeper debts alone don't fix it.
- **New scale (E3) + dealer's cut** (keep half your leftover money): each shift is now a bit harder than the last (69, 73, 70, 67, 62, 58, 60, 59%); a simple bot walks out free ~3%. Win screen and next Break explain the cut; tutorial line added. Endless: debt x2.2, min 2.5% of debt. tests.html: 258 checks, all passing.

**Waiting on the owner**
- Testing the new scale and the dealer's cut.

**Exact next step**
- Milestone 8: consumables.

## 2026-10-27: Session 5, continued (Break the Chain)

**Done**
- Owner approved `docs/WORDING.md`. **Built Break the Chain:** 8-link chain in the top bar; link-breaking animation + snap sound at the end of every won shift ("THE FLOOR HOLDS ... N links to go", button "Answer the phone"); after shift 8 "YOU WALK OUT FREE" with stats and Walk away / Double or nothing; endless mode (shift 9+, "FREE · Endless shift N"); "THE FLOOR OPENS" on a fall with links broken (or endless extra shifts); stats hero shows links broken / FREE / endless. Renamed: Spare Link (was Extra chain link), Trapdoor (was Cut a chain), Free Trapdoor (was Remove a character). Tutorials, Break text, fall text updated. tests.html: 241 checks, all passing. Fits one screen on phones.
- Logged in IDEAS.md: scaling to 100 million+ (later), and the owner's "voluntary link break" card idea.

**Works**
- Checked in a headless browser: win shift 1 with the animation, shift 2 text, escape at shift 8, Walk away, Double or nothing into endless, endless fall text.

**Broken**
- Nothing known.

- Owner chose option (b) for the link card: **built "Dealer's Bargain"** (Rare, instant, no slot): +1 link on your chain, -1 way to roll 7 for everyone, for the run. Not offered in endless mode. tests.html: 248 checks, all passing.
- Logged the owner's **hot streak indicator** idea in IDEAS.md.

- Owner: early shifts feel too easy (big leftover cash clears the next 2-3 shifts). **Built:** a table minimum that rises each shift ($5, $10, $15, $25, $50, $75, $100, $150, then ~4% of the debt), shown on the table; chips step up to $25/$100/$500 once the minimum hits $25; **paying the dealer only opens after the first shooter** of each shift. Phone layout trimmed so it still fits. tests.html: 257 checks, all passing. Simulator note in BALANCE.md (the bot actually does better with forced bigger bets; real difficulty lever is debt vs cash, to retune later).

**Waiting on the owner**
- Testing Break the Chain, Dealer's Bargain, and the rising minimum.

**Exact next step**
- Milestone 8: consumables (one-use chips).

## 2026-10-27: Session 5, continued (Milestone 7: bet against the shooter)

**Done**
- Owner picked growth ideas 1-6 and approved the roadmap (7 Don't Pass, 8 consumables, 9 dice crafting, 10 crew growth, 11 house rules + challenges, 12 more bets + unlocks).
- **Built Milestone 7:** Don't Pass and Lay Odds (logic, table areas, one side per come-out, both count as the required line bet, auto top-up, Clear bets), odds summary shows both sides ("The 6 before a 7" / "7 first"), seven-out splash celebrates a Don't win, new tutorial page, two new cards (Wrong Way, Cold Read), Pit Boss's Pity only for Pass Line bettors. Simulator learned Don't Pass. tests.html: 230 checks, all passing. Still fits one screen on phones.

**Works**
- Checked in a headless browser: Don't Pass, one-side rule, Lay Odds limit, seven-out win splash.

**Design finding (simulator, docs/BALANCE.md)**
- Don't Pass with max Lay is weaker than Pass with max Odds for the bot (shift 1: 55% vs 69%), mainly from going broke (Lay risks up to 6x the bet).
- Betting against Jinx doesn't help (14% vs 19% by shift 5): Jinx's frequent 7s also hit the come-out, where a 7 loses a Don't Pass bet. Ideas to fix are in IDEAS.md; owner to choose.

- Owner chose **Jinx's come-out curse**: built (crew logic before payout, reroll prompt aware, hover text and tutorial updated). tests.html: 234 checks. Simulator: still doesn't beat plain Pass Line (see BALANCE.md), which makes Jinx a real choice rather than a free win.
- Owner raised a theme problem: "The chains hold" on a won shift is confusing. Claude's recommendation in chat: keep the theme and rework the language (plus an 8-link escape goal). Waiting for the owner's choice.

- Owner decided: keep the theme, 8 links, walk out free + endless, link-breaking animation. Claude drafted all new wording in `docs/WORDING.md`. Simulator: a simple bot walks out free (8 shifts) ~3-4% of runs.

**Waiting on the owner**
- Review of `docs/WORDING.md`. Then build the "Break the Chain" update. Milestone 8 after that.

**Exact next step**
- Milestone 8: consumables (one-use chips).

## 2026-10-27: Session 5 (polish: fall animation and sound)

**Done**
- **Fall animation:** shake, seats and table tumble into the pit, fade to black on "The chains release.", then the stats screen.
- **Sound:** new `js/sound.js`, all sounds made in the browser (no files). On by default; 🔊/🔇 mute button (remembered). 13 sounds wired to betting, rolling, wins, seven-outs, paying, buying, cutting, the phone, falling, and winning a shift.
- Balance: no rule changes since the 6b simulator check (66/43/34/24/15% survival for shifts 1-5).
- Owner feedback: the game is fun but too basic; it needs a lot of mechanical growth. Claude's suggestions are in IDEAS.md ("Mechanical growth").

**Works**
- Checked in a headless browser: mute toggles and is remembered, every sound plays without errors, the fall runs and the stats screen follows, Play again restores the table. tests.html: 207 checks, all passing.

**Broken**
- Nothing known.

**Waiting on the owner**
- Testing the polish (listen with sound on!), then choosing which mechanical-growth ideas to build next.

**Exact next step**
- Owner picks from the mechanical-growth list; then plan that milestone.

## 2026-10-25: Session 4, continued (Milestone 6b: the Pit Boss phone)

**Done**
- Owner chose: 6b, then polish. **Never publish anywhere without the owner's permission** (now in CLAUDE.md).
- **Built 6b:** new `js/perks.js`. After each won shift the phone rings (with a 2-page tutorial the first time): pick 1 of 3 perks. +1 way to roll any total (7 marked Risky), -1 way to roll 7 (rarer each time, floor of 2 ways), Remove a character (pick who), 2 free items. The dice engine now supports "+/- ways to roll a total". Purple ☎ badges, FREE shop prices, perks on the stats screen. Simulator bot now answers the phone. tests.html: 207 checks, all passing.
- **Milestone 6 is complete.**

**Works**
- Checked in a headless browser: phone tutorial, offers, Remove a character flow, free items, -1 seven in the odds chart.
- Simulator (smart bot, shop + phone): survives shift 1 66%, 2 43%, 3 34%, 4 24%, 5 15%.

**Broken / known**
- A free card can be sold for half its normal price (small exploit). Noted in IDEAS.md.

**Waiting on the owner**
- Testing 6b.

**Exact next step**
- Polish: the fall animation (floor opens), sounds, and a balance check.

## 2026-10-25: Session 4 (Milestone 6a)

**Done**
- Owner approved the Milestone 6 plan (see DECISIONS.md); 6 split into 6a (shifts) and 6b (phone).
- **Built 6a:** the debt now lives in the game state (`state.debt`, `state.shift`); `shifts` table in config plus x1.5 growth after shift 5. After a won shift, "Next shift" carries cash, cards, cut crew and interest into the next shift with new cash added. The shop opens on the opening Break from shift 2. "Shift N" shows at the top; falling shows "You survived N shifts". Simulator updated to play real multi-shift runs. tests.html: 188 checks, all passing.

**Works**
- Checked in a headless browser: win shift 1, next shift intro and prices at $300 debt, cards carried, fall shows the score, Play again resets. Still fits one screen on phones.
- Simulator (smart bot with shop): survives shift 1 68%, 2 40%, 3 29%, 4 18%, 5 9%.

**Broken**
- Nothing known.

- Owner asked for a full stats screen when you fall. **Built:** new `js/stats.js` records every roll (carried across shifts); the fall screen shows 11 stat tiles, a money-over-the-run line chart, a totals-rolled vs expected bar chart, and your cards. Checked on laptop and phone. tests.html: 195 checks, all passing.

**Waiting on the owner**
- Testing 6a and the stats screen; decision on what to do after 6b (see chat: Claude recommends finishing the core loop, then a playtest/tuning pass and an early itch.io release before adding more cards).

**Exact next step**
- 6b: the Pit Boss phone (pick 1 of 3 perks after each won shift, with a tutorial).

## 2026-10-24: Session 3, continued (balance fixes + Milestone 5b-2)

**Done**
- Owner approved the balance plan, house rules, unlocks (with announcements), and the order of work.
- Quick fixes: shift 1 now $150 cash / $200 debt; Pit Boss's Pity is Rare; Hot Hand resets only on a losing roll; Muggsy charges the Pass Line only.
- **Built 5b-2:** Loaded Die and Reroll (a prompt appears only when a roll would cost you; Loaded Die rerolls one chosen die once per shift, Reroll both dice once per shooter). Cut a chain (Dealer Break section, 25% of the debt, confirm box, "falls through the floor" screen, seats close up and synergies follow). Extra chain link (Legendary; when you'd fall, the shift counts as survived). The crew list now lives in the game state so cuts last. Shop tutorial has a 3rd page on Cut a chain. tests.html: 179 checks, all passing.
- **Milestone 5 (the shop) is complete.**

**Works**
- Checked in a headless browser: reroll prompt and both reroll types, cutting Jinx, chain link save screen.

**Broken**
- Nothing known.

**Waiting on the owner**
- Testing 5b-2.

**Exact next step**
- Milestone 6: multiple shifts at the new scale (cash added to leftover cash, cards and cut crew carry over), and the Pit Boss phone (pick 1 of 3 perks after each won shift, with its own tutorial).

## 2026-10-24: Session 3 (Milestone 5b-1)

**Done**
- Owner approved all 5b recommendations (see DECISIONS.md). 5b split into 5b-1 and 5b-2.
- **Built 5b-1:** dice now roll from weighted combos, which supports "+N ways out of 36" (`extraWays`) and pair-only rolls. Three new cards: **Double Up** (Uncommon), **Doubles Charm** (Rare), **Green Dice** (Rare). Rare cards now appear in the shop ($50 at a $200 debt). The odds chart, Break text and hover cards all show the current odds, including card effects. On a Doubles Charm roll, the chart shows pair-only odds and a note. tests.html: 157 checks, all passing.

**Works**
- Checked in a headless browser: the charm roll is a pair, the chart shows pairs only, and Dee's hover shows 12.2% with Double Up.

**Broken**
- Nothing known.

- Added `?cards=` testing shortcut.
- Owner asked whether $200 is too easy. Built `tools/simulate.js` (plays thousands of shifts with the real rule files). Result: it's hard (smart bot 46%, mostly going broke). Results and recommendations in `docs/BALANCE.md`.

**Waiting on the owner**
- Decisions on Claude's balance proposals: shift 1 cash $150, new scale table, card tweaks (Pity to Rare, Hot Hand and Muggsy fixes), house rules, and card unlocks.

**Exact next step**
- 5b-2: Loaded Die and Reroll (offered only on a costly roll), Cut a chain (Break option, 25% of the debt), Extra chain link (Mr. Bones-style save).

## 2026-10-23: Session 2, continued (planning + Milestone 5a)

**Done**
- Owner sent a spreadsheet (cards, Pit Boss phone, scales), saved in docs/. Claude gave feedback; owner answered all open questions (see DECISIONS.md).
- DESIGN.md rewritten as one clean document with a glossary and status tags.
- **Built Milestone 5a:** shift 1 now $100 cash / $200 debt. The Dealer break has "Pay the dealer" and "Tip the dealer (shop)": 3 random cards per break by rarity, prices as a share of the debt, Shuffle (rising price), 5 card slots, sell for half. Your cards show as badges with hover text. 8 cards work: Hot Hand, Snake Eyes, Lucky Seven, Rattlesnake, Red Dice, Odds Addict, Pit Boss's Pity, Muggsy. New `js/cards.js` and `js/shop.js`. tests.html: 134 checks, all passing (now pins its own numbers).

**Works**
- Full shift played in a headless browser: buying, shuffling, selling, and card effects firing (Red Dice, Muggsy, Lucky Seven, x2 next shooter).

**Broken**
- Nothing known.

**Notes for later**
- No Rare or Extra chain link cards exist yet, so those tiers fall back to Uncommon/Common until 5b.
- Hot Hand resets on any roll with no win, including "no decision" rolls during a point. Watch in playtesting.

- Owner feedback on 5a, all done: shop opens after the first shooter with an intro, Shuffle a flat 5%, big red SEVEN OUT, pay box defaults to $5 with $5 steps, "current chance of a 7", coloured rarity labels, instant fall on a broke seven-out. tests.html: 138 checks, all passing.

- Tutorials: a 6-page How to play intro (first visit, plus a button), a 2-page shop tutorial (first time the shop opens, plus a ? button), capital-B "Dealer Break". New `js/tutorials.js`.

- Interest built: 5% of paid money into the cash at every Break after a seven-out, shown at the top, explained on a new 7th intro page.
- Tapping the dice rolls them. Dice now drawn with pips and tumble for 0.6s. New `?fast` testing shortcut.
- New layout fits one screen without scrolling (checked at 1366x768, 1920x1080, 390x844, 360x740). tests.html: 142 checks, all passing.
- Owner decided: finish the base game first, add more bets after v1.

- Splash screens: SEVEN OUT (2.5s, then the Dealer Break) and POINT HIT (winnings with the boost from cards and mult). Mult now lists Hot Rod's streak and Rattlesnake as reasons. tests.html: 144 checks, all passing.
- Owner asked why the tutorial didn't show: it's remembered per browser (How to play button or a private window to see it again).

- 2026-10-24: splash screens lengthened to 5 seconds (tap to close early), per owner.

**Waiting on the owner**
- Testing the splash screens. Owner wants to stay on 5a for now.

**Exact next step**
- Milestone 5b: Loaded Die, Reroll, Double Up, Doubles Charm, Green Dice (interest), Cut a chain, Extra chain link.

## 2026-10-23: Session 2, continued (Milestone 4b)

**Done**
- Owner tested Milestone 4a.
- **Built Milestone 4b:** mult on screen (orange when hot, blue when cold, with reasons), winnings multiplied and shown as "$5 x 1.5". Hot Rod +1x per winning roll, his first seven-out costs double. Mentor (Hot Rod to Jinx) and Cold Table (Jinx to Ghost). Coach removed. tests.html: 107 checks, all passing.

**Works**
- Checked in a headless browser through a full shift: Hot Rod heating up, the double-cost seven-out, Mentor carry-over to Jinx, Cold Table on Ghost lifting after a win.

**Broken**
- Nothing known.

- Owner tested 4b, then asked for a fix: "Pay all I can" replaced by "Pay off debt", greyed out until the cash covers the full debt.

**Waiting on the owner**
- Quick test of the Pay off debt button.

**Exact next step**
- Milestone 5: the dealer's shop at the Dealer break ("Tip the dealer"), with rotating stock and rarity tiers. Includes "Cut a chain" and the Doubles Charm / Reroll ideas. Ask first: shop size per visit, price range, which starter items go in v1, and rarity odds.

## 2026-10-23: Session 2 (Milestone 4a)

**Done**
- Owner accepted all 3 ideas (logged in DESIGN.md). Dee's quirk set to sticky dice, seat order changed, Hot Rod's pair idea moved to the shop.
- **Built Milestone 4a:** each crew member rolls their own dice (set in config.js), an odds bar chart for the current shooter (7 in red, point in yellow, point-before-7 chance), hover cards with real 7 chances, and the next shooter's 7 chance on the break screen. tests.html: 96 checks, all passing.

**Works**
- Checked in a headless browser through a full shift: each shooter's dice and odds are correct, and Ghost's evens/odds note shows.

**Broken**
- Nothing known.

**Waiting on the owner**
- Testing Milestone 4a.

**Exact next step**
- Milestone 4b: mult (applies to winnings), Hot Rod (+1 mult per winning roll, first seven-out costs double), Cold Table, Coach (free reroll), Mentor. Ask first: exactly what "costs double" takes, and how the free reroll is used (button? which roll?).

## 2026-10-23: Session 1 wrap-up

**Done this session (overall)**
- Project set up with git, notes, GitHub repo (kshime3/chained-dice, public) and GitHub Pages (https://kshime3.github.io/chained-dice/).
- Milestones 1, 2, 3 and 3.5 built, tested by owner, committed and pushed.
- Final tweaks: "Pay all I can" (and Pay) always keep $5 in the cash for the Pass Line, unless paying off the whole debt. Hovering a seat shows that character's planned dice and style. New `js/crew.js`. tests.html: 84 checks, all passing.

**Works**
- Full shift: dealer breaks, paying the debt, six shooters with normal dice, Pass Line/Odds/Field, win and both kinds of fall, Play again.

**Broken**
- Nothing known.

**Owner's homework (for next session)**
- Brainstorm using Claude's 3 ideas in `docs/IDEAS.md` (pit boss bounties, house rules, cut a chain).
- Think about how to adjust each crew member's quirks.

**Exact next step**
- Start of next session: hear the owner's brainstorm results, then plan Milestone 4 (crew weighted dice, dice odds on screen, synergies). Settle first: seat order, adjusted quirks, and what makes Dealer Dee's turn different (every turn already ends on a seven-out).

## 2026-10-23: Session 1, continued (Milestone 3.5: Pay the dealer)

**Done**
- Owner adjusted the Milestone 3 rules (see DECISIONS.md and the new DESIGN.md section).
- **Built Milestone 3.5:** "Bankroll" is now "Cash". Dealer break screen before the first shooter, after each seven-out, and a final one after the last shooter. Pay a typed amount or "Pay all I can". Progress bar shows money paid. Win the moment the debt is paid. Pass Line auto-tops-up from the Field/Odds when the cash is short. Warning on the break screen if leaving would mean falling. tests.html: 81 checks, all passing.

**Works**
- Checked in a headless browser: opening break, paying, auto-move, seven-out break, falling broke, falling short.

**Broken**
- Nothing known.

**Waiting on the owner**
- Testing Milestone 3.5 and feedback.

**Exact next step**
- After feedback: plan Milestone 4 (crew weighted dice, dice odds on screen, synergies). Ask about seat order and Dealer Dee's trait first.

## 2026-10-23: Session 1, continued (Milestone 3)

**Done**
- Owner tested Milestone 2: works great.
- **Built Milestone 3:** $200 buy-in, $2,000 target with progress bar, six seats (Lefty, Dealer Dee, Hot Rod, Ghost, Jinx, You) with normal dice, "Now shooting" label, seven-out passes the dice. Pass Line required to roll a come-out. Instant win at target; fall when broke or when the last shooter sevens out. Win/fall screens with Play again. New `js/shift.js`. Testing shortcut `?target=300`. tests.html: 68 checks, all passing.

**Works**
- All three endings checked in a headless browser: win (small target), fall short, fall broke. Play again resets.

**Broken**
- Nothing known.

**Notes for later**
- Balance: with flat bets and no multipliers, $200 to $2,000 is very hard. Expected; modifiers, crew, and the shop should change that. Watch it in playtesting.
- You press Roll for every shooter, including the crew.

**Waiting on the owner**
- Testing Milestone 3 and feedback.

**Exact next step**
- After feedback: plan Milestone 4 (crew weighted dice, dice odds shown on screen, synergies). Settle Dealer Dee's "always ends on a seven-out" question and seat order first.

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
