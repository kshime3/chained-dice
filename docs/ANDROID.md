# Android app plan

*Started 2026-11-01. Living plan: we tick things off and update it as we go. Nothing gets published anywhere without the owner's explicit go-ahead (CLAUDE.md rule).*

## Where we start

- **Model:** a one-time price (owner's choice). No ads.
- **Computer:** Windows PC. The owner's phone is an iPhone, so Android testing happens on the PC's Android emulator and on friends' Android phones.
- **Google Play:** no developer account yet.
- **The game is ready to wrap:** plain HTML/CSS/JS, no internet needed (no outside fonts or files), about 16 MB with music, saves stay on the device, touch controls and press-and-hold help already done.

Rough total: **6 to 10 weeks of calendar time**, much of it waiting (account checks, the 14-day test, Google's review). Hands-on work fits the one-hour-a-day pace.

## Decisions to make first

| # | Decision | Recommendation | Why it matters |
| --- | --- | --- | --- |
| D1 | **Wrapper tool** | **Capacitor** (free). It puts the game files inside a real Android app, so it works offline and doesn't depend on GitHub Pages. Needs Node.js and Android Studio on the PC. | CLAUDE.md says no build tools without the owner's OK. This is that OK. The alternative (a "Trusted Web Activity" via PWABuilder) only opens the website inside an app: no Android Studio, but it needs the internet and the free website stays the real game. |
| D2 | **Price** | **$2.99** (US), adjust per country with Play's suggestions. | Small roguelikes sit around $1.99 to $4.99. Can change later. |
| D3 | **The free website** | Keep the GitHub Pages link for friends **until launch**, then either turn it into a **free demo** (e.g. the first 3 shifts) or take it down. | People won't pay for an app that's free on the web. |
| D4 | **Closed-test cost** | Give each tester a **100% promo code** from the Play Console (Google: closed-test testers of a paid app must otherwise buy it). | The 12-tester rule (below) would mean asking 12 friends to pay. |
| D5 | **App ID** | `com.kshime3.chaineddice` | Permanent: it can never change once uploaded. |
| D6 | **Age rating / audience** | Answer "simulated gambling: yes" honestly; set the target audience to **18+**. | It's a craps game. Simulated gambling is allowed on Play (no real money, no prizes), but it raises the rating and children must not be targeted. |

## Phases

Each phase ends with a short check-in, like our milestones. **Who** says who does the hands-on part.

### Phase A: make the game app-ready (Claude, in the repo, 3-4 sessions)
- [ ] Lock to portrait; respect phone notches and the gesture bar (safe areas).
- [ ] Android **back button**: closes the open popup (same as Esc), and asks before leaving the game.
- [ ] Pause and mute when the app goes to the background (music already pauses; check sound effects).
- [ ] An app mode for app-only differences: hide the testing shortcuts, and change the feedback note ("paste it in a message to whoever sent you the link") to an in-store review / email option.
- [ ] Version number in Settings (matches the store's version).
- [ ] **Privacy policy** page (`privacy.html`): no data collected, saves stay on your device. Hosted on GitHub Pages (Play needs a link).
- [ ] App icons: Android adaptive icon (foreground + background layers) from the logo.
- [ ] Store art made by Claude: phone screenshots (1080 x 1920), the 1024 x 500 feature graphic, the 512 x 512 icon.

### Phase B: accounts and tools (owner, 1-2 sessions plus waiting)
- [ ] Create a **Google Play Console** account: personal account, $25 one-time fee, ID verification (can take a few days).
- [ ] Set up a **payments profile** (needed to sell: name, address, tax info, bank account).
- [ ] On the Windows PC, install **Node.js (LTS)** and **Android Studio** (big downloads, about an hour). Claude gives click-by-click steps.

### Phase C: wrap the game (together, 2-3 sessions)
- [ ] Claude adds the Capacitor setup to the repo (`package.json`, `capacitor.config.json`, a script that copies the game into the app). It uses the current Capacitor version, which targets the Android version Play currently requires (Android 16 / API 36 for new apps since August 31, 2026).
- [ ] Owner runs a few commands on the PC (Claude provides them exactly), opens the project in Android Studio and starts the game in the **Android emulator**.
- [ ] Fix what's different in the app: sound unlock on first tap, back button, status bar colour, text sizes.

### Phase D: store listing (together, 2 sessions)
- [ ] Claude drafts: app name, short description (80 characters), full description, "what's new" text.
- [ ] Upload the store art from Phase A.
- [ ] Content rating questionnaire, target audience (18+), Data safety form ("no data collected or shared"), ads: no, privacy policy link.

### Phase E: first signed build + internal test (owner with Claude's steps, 1-2 sessions)
- [ ] Create the **upload key** in Android Studio. **Keep it and its password safe**: losing it makes updates painful. Back it up off the PC.
- [ ] Build the release bundle (`.aab`) and upload it to the **internal testing** track (up to 100 testers, installs free even for paid apps, no review wait). Quick check on friends' Android phones.

### Phase F: closed test, 12 testers x 14 days (calendar: about 2-3 weeks)
- [ ] Recruit **12 or more** friends with Android phones and Google accounts (aim for 15: invites don't count, only testers who opt in and keep it installed).
- [ ] Each gets a promo code (D4), opts in, installs, and keeps it installed for **14 days in a row**.
- [ ] Collect feedback with the in-game note; ship fixes as test updates.

### Phase G: production (owner presses the button)
- [ ] Apply for production access (Google asks a few questions about the test), wait for review (days).
- [ ] Set price and countries, then publish. **Owner's explicit go-ahead required.**

### Phase H: after launch
- [ ] How to ship an update: change the game, bump the version, build, upload (Claude writes a checklist).
- [ ] Watch reviews and crash reports in the Play Console.

## Money and rules to know
- Google keeps **15%** of each sale (for a developer's first $1M a year); taxes depend on the country.
- **Music:** Kevin MacLeod tracks are CC BY 4.0, which allows selling the game as long as the credits stay in (they're in Settings > Credits).
- **Gambling theme:** fine as simulated gambling (no real money, nothing to cash out). Never add real-money features.
- **iPhone:** not part of this plan (needs a Mac and a $99/year Apple account). Possible later.

## Next step
Make decisions D1 to D6 (or accept the recommendations), then start **Phase A** (Claude) and **Phase B** (owner) at the same time, since the account checks take days.

## Sources checked (2026-11-01)
- Closed test rule for new personal accounts: [Play Console help](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en-GB)
- Paid apps in open/closed tests must be bought; internal tests are free: [Play Console help](https://support.google.com/googleplay/android-developer/answer/9845334)
- Target API (Android 16 / API 36 for new apps from August 31, 2026): [Play Console help](https://support.google.com/googleplay/android-developer/answer/11926878), [Android developers](https://developer.android.com/google/play/requirements/target-sdk)
