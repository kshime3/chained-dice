// Makes the Google Play store pictures into store/: the 1024 x 500 feature graphic and
// phone screenshots (1080 x 1920) taken from the real game. Not part of the game.
// Needs Node.js and Playwright (with its Chromium):  node tools/make-store-art.js

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.join(__dirname, "..");
const out = path.join(root, "store");
const game = "file://" + path.join(root, "index.html");
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();

  // ---------- Feature graphic: 1024 x 500 ----------
  const logo = fs.readFileSync(path.join(root, "img", "logo.svg"), "utf8").replace("<svg ", '<svg width="300" height="300" ');
  const banner = await browser.newPage({ viewport: { width: 1024, height: 500 } });
  await banner.setContent(`<html><body style="margin:0">
    <div style="width:1024px;height:500px;position:relative;overflow:hidden;font-family:Georgia,'Times New Roman',serif;
      background:radial-gradient(ellipse 70% 90% at 30% 110%, #5a1208 0%, #1a0a06 45%, #0a0807 75%);">
      <div style="position:absolute;left:70px;top:100px">${logo}</div>
      <div style="position:absolute;left:420px;top:130px;color:#e9e1cf">
        <div style="font-size:84px;font-weight:bold;letter-spacing:6px;text-shadow:0 4px 18px rgba(0,0,0,0.8)">CHAINED<br>DICE</div>
        <div style="margin-top:22px;font-size:27px;font-style:italic;color:#e2c89a">Pay the dealer. Break the chain.<br>Or the floor opens.</div>
      </div>
    </div></body></html>`);
  await banner.screenshot({ path: path.join(out, "feature-graphic.png") });

  // ---------- Phone screenshots: 360 x 640 at 3x = 1080 x 1920 ----------
  const shot = async (name, query, setup) => {
    const ctx = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
    const page = await ctx.newPage();
    await page.addInitScript(() => { for (const k of ["intro", "shop", "comps", "phone", "guided", "bets"]) localStorage.setItem("chainedDice.seen." + k, "yes"); });
    await page.goto(game + "?fast&unlockAll&app" + (query || ""));
    await page.waitForTimeout(600);
    await page.evaluate(setup);
    await page.waitForTimeout(700);
    await page.evaluate(() => { const t = document.getElementById("tutorial-skip"); if (t && t.offsetParent) t.click(); });
    await page.waitForTimeout(300);
    await page.screenshot({ path: path.join(out, "screenshot-" + name + ".png") });
    await ctx.close();
  };

  // 1. The table mid-shooter: a point is on, bets down, a warm mult.
  await shot("1-table", "&cards=hotHand,mirrorDice,twinSouls,doubleUp", () => {
    document.getElementById("leave-break").click();
    state.point = 8; state.bets.pass = 25; state.bets.odds = 50; state.bets.field = 10; state.bets.hard8 = 5;
    state.mult = 2.5; state.hotStreak = 3; state.turnDoubles = 2; state.cash = 340;
    state.lastRoll = { dice: [4, 4], total: 8 };
    renderAll();
    showMessage("Hard 8! Twin Souls pays double. Hot Hand: 3 in a row.", false);
  });
  // 2. The Dealer Break shop with card art.
  await shot("2-shop", "", () => {
    state.shooterIndex = 1; state.cash = 260; state.stock = ["undertaker", "mirrorDice", "torchPass"]; renderAll();
    document.getElementById("shop-help").scrollIntoView({ block: "start" });
  });
  // 3. Your hand of themed cards (phone Hand tab).
  await shot("3-hand", "&cards=bodyCount,wrongWay,graveyardShift,jinxShadow,undertaker", () => {
    document.getElementById("leave-break").click(); showTab("hand");
  });
  // 4. The fall: the trapdoor drops your crew.
  await shot("4-fall", "", () => {
    CONFIG.fallMs = 60000; state.roster = ["You", "Jinx", "Big Mo", "Lefty", "Ghost"]; state.status = "fell-short"; renderAll();
    return new Promise((r) => setTimeout(r, 1000)); // plus the 1s the shot waits: the crew is mid-drop
  });
  // 5. Endless mode: huge numbers.
  await shot("5-endless", "&endless&shift=22&cards=snowball,deepPockets,fullHouse,avalanche,hotHand", () => {
    document.getElementById("leave-break").click();
    state.point = 6; state.bets.pass = state.minBet; state.bets.odds = state.minBet * 5; state.turnPointsMade = 3; state.hotStreak = 4; renderAll();
    showMessage("Point hit! +" + money(state.debt * 0.37) + ". The house is still counting.", false);
  });

  await browser.close();
  console.log("Store art made in store/.");
})();
