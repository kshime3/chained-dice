// Display: background music. Plays the tracks listed in CONFIG.music, looping through
// a dark track for shift 1, a calm playlist for the next shifts and a tense one later, with a crossfade.
//
// Phones are strict about music: it may only start inside a real tap (finger lifted),
// each player needs that permission, and iPhones ignore an audio element's volume.
// So: two players ("decks") both get permission on the first tap, and their volume
// runs through the Web Audio system (shared with the sound effects), which phones respect.

let musicOn = true;
let musicVolume = CONFIG.music.volume;
try {
  musicOn = localStorage.getItem("chainedDice.musicOn") !== "no";
  const v = Number(localStorage.getItem("chainedDice.musicVolume"));
  if (localStorage.getItem("chainedDice.musicVolume") !== null && v >= 0 && v <= 1) musicVolume = v;
} catch (e) {
  // Storage blocked: defaults.
}

// decks: two audio players; live: which one is playing; gains: Web Audio volume knobs (if available).
const music = { started: false, mood: null, queue: [], decks: [], gains: [], live: 0, state: null, status: "Waiting for your first tap" };

function musicTracks(mood) {
  return CONFIG.music.tracks.filter((t) => t.mood === mood);
}

// Which playlist fits this moment of the run.
function musicMoodFor(state) {
  if (state.endless || state.shift >= CONFIG.music.tenseFromShift) return "tense";
  if (state.shift < CONFIG.music.calmFromShift && musicTracks("first").length) return "first";
  return "calm";
}

// Build the two decks. Web Audio volume only works for pages served over http(s):
// a file opened by double-click is a different "origin", so it falls back to the player's own volume.
function buildDecks() {
  if (music.decks.length) return;
  const ctx = location.protocol.startsWith("http") ? audioContext() : null;
  for (let i = 0; i < 2; i++) {
    const deck = new Audio();
    deck.preload = "auto";
    deck.onended = () => {
      if (i === music.live) playNextTrack();
    };
    deck.onerror = () => {
      if (i === music.live && deck.src) setTimeout(playNextTrack, 1000); // a missing file: skip it
    };
    music.decks.push(deck);
    if (ctx) {
      try {
        const gain = ctx.createGain();
        gain.gain.value = 0;
        ctx.createMediaElementSource(deck).connect(gain).connect(ctx.destination);
        music.gains.push(gain);
      } catch (e) {
        music.gains = [];
      }
    }
  }
}

// Volume of one deck, through Web Audio when we have it.
function deckVolume(i, value, ms) {
  const gain = music.gains[i];
  if (gain) {
    const ctx = gain.context;
    gain.gain.cancelScheduledValues(ctx.currentTime);
    gain.gain.setValueAtTime(gain.gain.value, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(value, ctx.currentTime + (ms || 0) / 1000 + 0.01);
    music.decks[i].volume = 1;
  } else {
    fadeElement(music.decks[i], value, ms || 0);
  }
}

function fadeElement(el, to, ms) {
  const from = el.volume;
  const start = performance.now();
  const tick = (now) => {
    const t = ms ? Math.min(1, (now - start) / ms) : 1;
    el.volume = Math.max(0, Math.min(1, from + (to - from) * t));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// Play the next track of the current mood on the other deck, crossfading (shuffled, no repeats until all played).
function playNextTrack() {
  const list = musicTracks(music.mood);
  if (!list.length || !musicOn || !music.started) return;
  if (!music.queue.length) music.queue = list.slice().sort(() => Math.random() - 0.5);
  const track = music.queue.shift();
  const old = music.live;
  const next = 1 - old;
  music.live = next;
  const deck = music.decks[next];
  deck.src = track.file;
  deckVolume(next, 0);
  deck.play().then(() => {
    deckVolume(next, musicVolume, 1500);
    music.status = "Playing: " + track.title;
  }).catch((e) => (music.status = "Couldn't play " + track.title + " (" + e.name + ")"));
  deckVolume(old, 0, 1500);
  setTimeout(() => {
    if (music.live !== old) music.decks[old].pause();
  }, 1600);
}

// Called after every screen update: switch playlists when the mood changes.
function updateMusic(state) {
  music.state = state;
  if (!music.started || !musicOn || music.hold) return;
  const mood = musicMoodFor(state);
  if (mood !== music.mood) {
    music.mood = mood;
    music.queue = [];
    playNextTrack();
  }
}

// The fall: fade the music out and keep it quiet until the next run starts.
function holdMusic(ms) {
  music.hold = true;
  if (music.started && music.decks.length) deckVolume(music.live, 0, ms);
}

function releaseMusic() {
  music.hold = false;
  music.mood = null; // a fresh track when the next screen update comes (the next run)
  music.queue = [];
}

// The first real tap, click or key press starts the music (phones only allow it then).
// Keeps listening until a track actually starts.
function armMusic(getState) {
  const events = ["pointerup", "touchend", "click", "keydown"];
  const unlock = () => {
    if (music.started || music.unlocking || !musicOn || !CONFIG.music.tracks.length) return;
    music.unlocking = true; // one attempt at a time (a Settings tap and the page tap can arrive together)
    buildDecks();
    if (typeof audioContext === "function" && music.gains.length) audioContext(); // wake Web Audio up inside the tap
    const state = getState();
    music.mood = musicMoodFor(state);
    if (!music.queue.length) music.queue = musicTracks(music.mood).slice().sort(() => Math.random() - 0.5);
    const track = music.queue.shift();
    if (!track) return (music.unlocking = false);
    const deck = music.decks[0];
    music.live = 0;
    deck.src = track.file;
    deckVolume(0, 0);
    // Bless the second deck in the same tap, so later tracks are allowed to start.
    const spare = music.decks[1];
    spare.src = track.file;
    spare.muted = true;
    spare.play().then(() => {
      spare.pause();
      spare.muted = false;
    }).catch(() => {});
    deck.play().then(() => {
      music.started = true;
      music.unlocking = false;
      music.status = "Playing: " + track.title;
      deckVolume(0, musicVolume, 1500);
      events.forEach((e) => window.removeEventListener(e, unlock));
    }).catch((e) => {
      music.unlocking = false; // not allowed yet (or the file failed): try again on the next tap
      music.status = "Couldn't start yet (" + e.name + "). Tap again.";
    });
  };
  events.forEach((e) => window.addEventListener(e, unlock));
  music.unlock = unlock;
}

// Phones: pause while the game is in the background, carry on when it comes back.
document.addEventListener("visibilitychange", () => {
  const deck = music.decks[music.live];
  if (!deck || !music.started || !musicOn) return;
  if (document.hidden) deck.pause();
  else deck.play().catch(() => {});
});

function setMusicOn(on, state) {
  musicOn = on;
  try {
    localStorage.setItem("chainedDice.musicOn", on ? "yes" : "no");
  } catch (e) {
    // Not saved.
  }
  if (!on) {
    music.status = "Off";
    music.decks.forEach((d, i) => {
      deckVolume(i, 0, 400);
      setTimeout(() => d.pause(), 450);
    });
    return;
  }
  // Turning it on is itself a tap, so it may start right away.
  if (!music.started && music.unlock) return music.unlock();
  music.mood = null;
  updateMusic(state);
}

function setMusicVolume(v) {
  musicVolume = v;
  try {
    localStorage.setItem("chainedDice.musicVolume", String(v));
  } catch (e) {
    // Not saved.
  }
  if (music.started && music.decks.length) deckVolume(music.live, v, 100);
}

// Credits for the Settings screen (CC-BY asks for title, artist, licence and a link).
function musicCreditsHtml() {
  if (!CONFIG.music.tracks.length) return "<p class=\"hint\">No music added yet.</p>";
  return CONFIG.music.tracks.map((t) => "<p class=\"credit\">\"" + t.title + "\" by " + t.artist + ". Licensed under " +
    (t.link ? '<a href="' + t.link + '" target="_blank" rel="noopener">' + t.license + "</a>" : t.license) + ".</p>").join("") +
    '<p class="hint">Tracks re-encoded at a lower bitrate for the web; otherwise unchanged.</p>';
}
