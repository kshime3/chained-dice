# Android app plan

*Started 2026-11-01. Living plan: we tick things off and update it as we go. Nothing gets published anywhere without the owner's explicit go-ahead (CLAUDE.md rule).*

## Where we start

- **Model:** a one-time price (owner's choice). No ads.
- **Computer:** Windows PC. The owner's phone is an iPhone, so Android testing happens on the PC's Android emulator and on friends' Android phones.
- **Google Play:** developer account created 2026-11-02 (ID verification still to submit). Node.js and Android Studio installed on the PC.
- **The game is ready to wrap:** plain HTML/CSS/JS, no internet needed (no outside fonts or files), about 16 MB with music, saves stay on the device, touch controls and press-and-hold help already done.

Rough total: **6 to 10 weeks of calendar time**, much of it waiting (account checks, the 14-day test, Google's review). Hands-on work fits the one-hour-a-day pace.

## Decisions (owner accepted all recommendations, 2026-11-01)

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
- [x] Safe areas: the tab bar already clears the gesture bar; in the app the header clears a notch. Portrait lock goes in the Android settings in Phase C (it can't be set from a web page).
- [x] Android **back button**: closes the open popup (same as Esc), and asks "Leave Chained Dice? Your run is saved." before leaving. (Uses the Capacitor App plugin, added in Phase C.)
- [x] Pause sound when the app goes to the background (music pauses; sound effects suspend).
- [x] App mode (`CONFIG.inApp`; `?app` previews it in a browser): the feedback note points to a Play review and the developer email. Testing shortcuts need address extras, which the app never has.
- [x] Version number in Settings > Credits (`CONFIG.appVersion`, now 1.0.0).
- [x] **Privacy policy** page (`privacy.html`, linked in Settings > Credits): no data collected, saves stay on your device. It will be at https://kshime3.github.io/chained-dice/privacy.html for the Play listing.
- [x] App icons: adaptive icon (background + art layers, plus a monochrome layer for themed icons), round and legacy icons at every density, made from the logo by `tools/make-icons.js`. The splash screen is the icon on the game's dark background (Android 12+) and a dark logo image on older Androids.
- [x] Store art in `store/` (by `tools/make-store-art.js`): `icon-512.png`, `feature-graphic.png` (1024 x 500), five phone screenshots (1080 x 1920: table, shop, hand, the fall, endless).

### Phase B: accounts and tools (owner, 1-2 sessions plus waiting)
- [ ] Create a **Google Play Console** account: personal account, $25 one-time fee, ID verification (can take a few days). *Account created 2026-11-02; ID still to submit.*
- [ ] Set up a **payments profile** (needed to sell: name, address, tax info, bank account).
- [x] On the Windows PC, install **Node.js (LTS)** and **Android Studio** (done 2026-11-02).

### Phase C: wrap the game (together, 2-3 sessions)
**Done in the repo (2026-11-02):** Capacitor 8.6 (targets Android 16 / API 36), `package.json`, `capacitor.config.json` (app ID `com.kshime3.chaineddice`), `tools/copy-web.js` (copies the game into `www/`, adds Capacitor's core script to the app's copy only), the `android/` project (portrait only, version 1.0.0), and the App plugin for the back button.

**Owner: run it on the PC (first time, about an hour, mostly downloads)**
1. Install **GitHub Desktop** (desktop.github.com), sign in with your GitHub account, then *File > Clone repository > kshime3/chained-dice*. It goes into `Documents\GitHub\chained-dice`.
2. In GitHub Desktop: *Repository > Open in Command Prompt* (or PowerShell). If it says "Unable to locate Git", click **Open without Git**: our steps don't need Git. (Or: *Repository > Show in Explorer*, click the address bar, type `cmd`, Enter.) Type these, one at a time, pressing Enter after each:
   - `npm install` (downloads Capacitor into the folder, about a minute)
   - `npm run sync` (copies the game into the Android project)
3. Open **Android Studio** > *Open* > pick the `android` folder inside `chained-dice`. Wait for "Gradle sync" to finish at the bottom (the first time it downloads a lot: 5-15 minutes). If it offers to install an SDK platform or tools, say yes. If it fails with "requires at least JVM runtime version 11. This build uses a Java 8 JVM": *File > Settings > Build, Execution, Deployment > Build Tools > Gradle > Gradle JDK* = **jbr-21** (Android Studio's own Java; or *Download JDK* version 21), OK, then *File > Sync Project with Gradle Files*.
4. *Tools > Device Manager > Create device*: pick **Pixel 8**, then a system image with **API 36** (download it), Finish.
5. Press the green **Run ▶** button at the top. The emulator starts and the game opens in it.
6. Try: tap to start the music, play a shooter, press the emulator's **back** button with a popup open (it should close), then with nothing open (it should ask to leave). Turn the emulator sideways: the game should stay upright.
7. Tell Claude what happened (a screenshot of any red error text helps).

**Status 2026-11-02:** the app builds and runs in the emulator (after: Node not found -> fresh Command Prompt; Gradle on Java 8 -> new Android Studio with Gradle JDK 21; emulator WHPX error -> BIOS OC > Advanced CPU Configuration > SVM Mode Enabled on the MSI B350M board, plus Windows features "Windows Hypervisor Platform" and "Virtual Machine Platform"). The emulator is laggy on this PC; real phones are faster.

**Getting logs to Claude**
- *Game errors (best):* with the app running, open Chrome on the PC at `chrome://inspect/#devices`, click **inspect** under Chained Dice, open the **Console** tab; red lines are errors (right-click > Save as, or copy, or screenshot).
- *App crashes:* Android Studio > View > Tool Windows > **Logcat**, filter `package:com.kshime3.chaineddice level:error`, copy the red lines.
- *Faster emulator:* Device Manager > edit the Pixel 8 > Show Advanced Settings > Graphics: Hardware, RAM: 4096 MB.

**Later updates** (after Claude changes the game): GitHub Desktop *Fetch / Pull*, then `npm run sync`, then Run ▶ again.

- [x] Claude adds the Capacitor setup to the repo (done 2026-11-02, see above).
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
