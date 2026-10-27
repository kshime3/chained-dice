// Tutorial text, shown as pages with Back / Next.
// Each tutorial is shown once per browser; "How to play" and the shop's "?" show them again.
// Numbers come from config.js so the text stays correct when we tune.

function introPages() {
  const min = money(CONFIG.shifts[0].minBet);
  return [
    {
      title: "You wake up chained to a craps table",
      body: "Your crew is chained up beside you. The dealer leans in: <strong>\"You owe me " + money(CONFIG.shifts[0].debt) +
        " by the end of the shift.\"</strong><br><br>Your chain has <strong>" + CONFIG.chainLinks + " links</strong>. Pay off each shift's debt and the dealer unlocks one. <strong>Break all " + CONFIG.chainLinks +
        " and you walk out free.</strong><br><br>Fail, and the floor opens.<br><br>You start with <strong>" +
        money(CONFIG.shifts[0].cash) + "</strong> in your <strong>kitty</strong> (the money in your hand).",
    },
    {
      title: "The shooters",
      body: "Six people take turns rolling the dice: " + CONFIG.crew.join(", ") + ". You bet on <strong>every roll</strong>, no matter who is shooting.<br><br>" +
        "Each shooter keeps rolling until they <strong>seven out</strong>, then the dice pass to the next seat.<br><br>" +
        "Everyone's dice are different. The bar chart shows the current shooter's chances, and you can hover over a seat to learn about them. Some shooters change the <strong>Mult</strong>, which multiplies your winnings.",
    },
    {
      title: "Step 1: the come-out roll",
      body: "Before a shooter's first roll (the <strong>come-out</strong>), you must put at least <strong>" + min + " on the Pass Line</strong> (or Don't Pass, more on that soon). Pick a chip, then click the Pass Line.<br><br>" +
        "<strong>7 or 11:</strong> you win.<br><strong>2, 3 or 12 (craps):</strong> you lose.<br><strong>Any other number</strong> becomes the <strong>point</strong>.",
    },
    {
      title: "Step 2: the point",
      body: "Now the shooter wants to roll the point again <strong>before a 7</strong>.<br><br>" +
        "<strong>Point rolled again:</strong> your Pass Line wins, and it's a new come-out.<br>" +
        "<strong>7 rolled:</strong> SEVEN OUT. Your Pass Line loses and the next shooter steps up.<br><br>" +
        "While a point is on, your Pass Line is locked, but you can add <strong>Odds</strong> behind it. Odds pay extra, at the true odds of the point.",
    },
    {
      title: "The Field",
      body: "The <strong>Field</strong> is a one-roll bet you can make any time.<br><br>" +
        "<strong>3, 4, 9, 10, 11:</strong> win even money.<br><strong>2:</strong> pays double. <strong>12:</strong> pays triple.<br><strong>5, 6, 7, 8:</strong> lose.",
    },
    {
      title: "Betting against the shooter",
      body: "Think a shooter is about to blow it? Bet <strong>Don't Pass</strong> instead of the Pass Line. You need one of the two (at least " + min + ") before every come-out, but only one side at a time.<br><br>" +
        "<strong>Come-out:</strong> 2 or 3 wins, 7 or 11 loses, 12 is a tie.<br><strong>Point on:</strong> a 7 wins, the point coming back loses.<br><br>" +
        "Once a point is set you can add <strong>Lay Odds</strong> behind it. Sevens are more likely than the point, so you risk more to win less. Jinx is cursed: when he shoots, a come-out 7 is only a tie for Don't Pass, so he's the best shooter to bet against.",
    },
    {
      title: "Paying the dealer",
      body: "Between shooters there's a <strong>Dealer Break</strong>. That's your chance to pay toward the debt.<br><br>" +
        "Paid money is <strong>safe</strong> from bad rolls, but you can't bet it, and you can't take it back. You win the moment the debt is fully paid.<br><br>" +
        "Money left over when you win a shift carries into the next one, but the dealer takes <strong>" + Math.round((1 - CONFIG.carryOverShare) * 100) + "%</strong> of it as his cut.<br><br>" +
        "<strong>The floor opens if:</strong> you can't afford the " + min + " line bet, or the last shooter sevens out and you still owe money.",
    },
    {
      title: "Interest: why paying early pays",
      body: "Money you've paid the dealer earns <strong>interest</strong>.<br><br>" +
        "At every Dealer Break (after each seven-out), you get <strong>" + Math.round(CONFIG.interestRate * 100) +
        "% of everything you've paid so far</strong>, paid into your kitty.<br><br>" +
        "Example: you've paid " + money(100) + ", so you get " + money(Math.floor(100 * CONFIG.interestRate)) + " at the next Break.<br><br>" +
        "The current interest rate is always shown at the top of the screen.<br><br>Good luck.",
    },
  ];
}

function shopPages() {
  const pct = (tier) => Math.round(CONFIG.rarityPricePct[tier] * 100) + "%";
  return [
    {
      title: "New: the stickman's shop",
      body: "From now on, every Dealer Break has a shop. <strong>Tip the dealer</strong> from your kitty to buy <strong>cards</strong> that bend the rules in your favor.<br><br>" +
        "Tips <strong>don't</strong> count toward your debt. Every dollar you spend here is a dollar you didn't pay the dealer, so choose carefully.<br><br>" +
        "Buying can never take your kitty below the table minimum (the smallest line bet, which goes up each shift).",
    },
    {
      title: "How cards work",
      body: CONFIG.shopSlots + " cards are offered at every Break. Rarer cards are stronger and cost more:<br><br>" +
        '<span class="rarity-pill common">Common</span> ' + pct("common") + " of the debt<br>" +
        '<span class="rarity-pill uncommon">Uncommon</span> ' + pct("uncommon") + "<br>" +
        '<span class="rarity-pill rare">Rare</span> ' + pct("rare") + "<br><br>" +
        "You can hold <strong>" + CONFIG.maxCards + " cards</strong>, and sell one for half its price. Don't like the offer? <strong>Shuffle</strong> for new cards (" +
        pct("common") + " of the debt).<br><br>Your cards work on every roll. Hover over one, under the Mult line, to read it.",
    },
    {
      title: "Trapdoor",
      body: "Don't like a shooter? For <strong>" + Math.round(CONFIG.cutChainPct * 100) + "% of the debt</strong>, the dealer will pull the lever under their seat at a Dealer Break. They drop away and are gone <strong>for the rest of the run</strong>.<br><br>" +
        "You can only drop crew who haven't shot yet this shift, and never yourself. Fewer shooters means fewer rolls to make your money, and the seats close up, so synergies change.",
    },
  ];
}

function phonePages() {
  return [
    {
      title: "The Pit Boss is calling",
      body: "You survived a shift, so the Pit Boss's phone rings. He offers you <strong>" + CONFIG.phoneChoices + " perks</strong>. Pick one.<br><br>" +
        "Perks are <strong>permanent</strong>: they last for the rest of the run, and they change <strong>everyone's</strong> dice, not just yours. You'll see the new odds in the bar chart.<br><br>" +
        "The phone rings after every shift you survive.",
    },
    {
      title: "Which perk?",
      body: "<strong>+1 way to roll a number:</strong> that total comes up a little more often (common).<br>" +
        "<strong>-1 way to roll 7:</strong> fewer seven-outs. The strongest perk, so it's rare, and it gets rarer each time you take it. A 7 never goes away completely.<br>" +
        "<strong>Free Trapdoor</strong> or <strong>" + CONFIG.freeItemsCount + " free items</strong> (uncommon).<br><br>" +
        "Careful with <strong>+1 way to roll 7</strong>: it's marked <strong>Risky</strong>. More 7s win come-out rolls, but they also end turns.<br><br>" +
        "Your perks show as purple ☎ badges next to your cards.",
    },
  ];
}

// Remember which tutorials were seen. Storage can fail (private windows), so it's optional.
function tutorialSeen(name) {
  try {
    return localStorage.getItem("chainedDice.seen." + name) === "yes";
  } catch (e) {
    return false;
  }
}

function markTutorialSeen(name) {
  try {
    localStorage.setItem("chainedDice.seen." + name, "yes");
  } catch (e) {
    // Not saved; the tutorial will just show again next time.
  }
}
