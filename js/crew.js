// Crew info. Milestone 4 adds their weighted dice and synergies here.
// "active" becomes true once a character's quirk is actually in the game.

const CREW_INFO = {
  "Lefty": {
    dice: "No 6s on his dice.",
    style: "Sevens are rarer and big numbers can't happen.",
    active: false,
  },
  "Dealer Dee": {
    dice: "Favors 6s and 8s.",
    style: "Her turn always ends on a seven-out. The shooter after her gets one free reroll.",
    active: false,
  },
  "Hot Rod": {
    dice: "Normal dice.",
    style: "+1 mult per winning roll. His first seven-out costs double. Half his streak passes to the next shooter.",
    active: false,
  },
  "Ghost": {
    dice: "One die rolls only evens or only odds.",
    style: "Streaky, predictable results.",
    active: false,
  },
  "Jinx": {
    dice: "Leans toward 3s and 4s, so 7s come up often.",
    style: "Terrible thrower who sevens out a lot. The next shooter starts at -0.5x mult until their first win.",
    active: false,
  },
  "You": {
    dice: "Normal dice.",
    style: "Your dice can be upgraded at the dealer's shop.",
    active: false,
  },
};
