// Tutorial text, shown as pages with Back / Next.
// Each tutorial is shown once per browser; "How to play" and the shop's "?" show them again.
// Numbers come from config.js so the text stays correct when we tune.

function introPages() {
  const min = money(CONFIG.tableMinimum);
  return [
    {
      title: "You wake up chained to a craps table",
      body: "Your crew is chained up beside you. The dealer leans in: <strong>\"You owe me " + money(CONFIG.shiftTarget) +
        " by the end of the shift.\"</strong><br><br>Pay it and the chains hold. Fail, and the chains release and everyone falls through the floor.<br><br>You start with <strong>" +
        money(CONFIG.buyIn) + "</strong> in your <strong>kitty</strong> (the money in your hand).",
    },
    {
      title: "The shooters",
      body: "Six people take turns rolling the dice: " + CONFIG.crew.join(", ") + ". You bet on <strong>every roll</strong>, no matter who is shooting.<br><br>" +
        "Each shooter keeps rolling until they <strong>seven out</strong>, then the dice pass to the next seat.<br><br>" +
        "Everyone's dice are different. The bar chart shows the current shooter's chances, and you can hover over a seat to learn about them. Some shooters change the <strong>Mult</strong>, which multiplies your winnings.",
    },
    {
      title: "Step 1: the come-out roll",
      body: "Before a shooter's first roll (the <strong>come-out</strong>), you must put at least <strong>" + min + " on the Pass Line</strong>. Pick a chip, then click the Pass Line.<br><br>" +
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
      title: "Paying the dealer",
      body: "Between shooters there's a <strong>Dealer Break</strong>. That's your chance to pay toward the debt.<br><br>" +
        "Paid money is <strong>safe</strong> from bad rolls, but you can't bet it, and you can't take it back. You win the moment the debt is fully paid.<br><br>" +
        "<strong>You fall if:</strong> you can't afford the " + min + " Pass Line bet, or the last shooter sevens out and you still owe money.<br><br>Good luck.",
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
        "Buying can never take your kitty below the " + money(CONFIG.tableMinimum) + " Pass Line minimum.",
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
