// Display: background music. Plays the tracks listed in CONFIG.music, looping through
// a calm playlist early in a run and a tense one in later shifts, with a crossfade.
// Silent until tracks are added. Browsers only allow sound after the first tap or click.

let musicOn = true;
let musicVolume = CONFIG.music.volume;
try {
  musicOn = localStorage.getItem("chainedDice.musicOn") !== "no";
  const v = Number(localStorage.getItem("chainedDice.musicVolume"));
  if (localStorage.getItem("chainedDice.musicVolume") !== null && v >= 0 && v <= 1) musicVolume = v;
} catch (e) {
  // Storage blocked: defaults.
}

const music = { audio: null, mood: null, started: false, queue: [] };

function musicTracks(mood) {
  return CONFIG.music.tracks.filter((t) => t.mood === mood);
}

// Which playlist fits this moment of the run.
function musicMoodFor(state) {
  return state.endless || state.shift >= CONFIG.music.tenseFromShift ? "tense" : "calm";
}

// Fade an audio element's volume to a target over ms, then call done.
function fadeAudio(audio, to, ms, done) {
  const from = audio.volume;
  const start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / ms);
    audio.volume = from + (to - from) * t;
    if (t < 1) requestAnimationFrame(tick);
    else if (done) done();
  };
  requestAnimationFrame(tick);
}

// Play the next track of the current mood (shuffled, no repeat until all have played).
function playNextTrack() {
  const list = musicTracks(music.mood);
  if (!list.length || !musicOn || !music.started) return;
  if (!music.queue.length) music.queue = list.slice().sort(() => Math.random() - 0.5);
  const track = music.queue.shift();
  const audio = new Audio(track.file);
  audio.volume = 0;
  audio.onended = playNextTrack;
  audio.onerror = () => setTimeout(playNextTrack, 1000); // a missing file: skip it
  const old = music.audio;
  music.audio = audio;
  audio.play().then(() => fadeAudio(audio, musicVolume, 1500)).catch(() => {});
  if (old) fadeAudio(old, 0, 1500, () => old.pause());
}

// Called after every screen update: start once allowed, switch playlists when the mood changes.
function updateMusic(state) {
  if (!music.started) return;
  const mood = musicMoodFor(state);
  if (mood !== music.mood) {
    music.mood = mood;
    music.queue = [];
    playNextTrack();
  }
}

// The first tap or click anywhere starts the music (browsers require that).
function armMusic(getState) {
  const start = () => {
    if (music.started) return;
    music.started = true;
    music.mood = null;
    if (musicOn) updateMusic(getState());
  };
  window.addEventListener("pointerdown", start, { once: true });
  window.addEventListener("keydown", start, { once: true });
}

function setMusicOn(on, state) {
  musicOn = on;
  try {
    localStorage.setItem("chainedDice.musicOn", on ? "yes" : "no");
  } catch (e) {
    // Not saved.
  }
  if (!on && music.audio) {
    const old = music.audio;
    music.audio = null;
    fadeAudio(old, 0, 600, () => old.pause());
  }
  if (on) {
    music.mood = null;
    updateMusic(state);
  }
}

function setMusicVolume(v) {
  musicVolume = v;
  try {
    localStorage.setItem("chainedDice.musicVolume", String(v));
  } catch (e) {
    // Not saved.
  }
  if (music.audio) music.audio.volume = v;
}

// Credits for the Settings screen (CC-BY asks for title, artist, licence and a link).
function musicCreditsHtml() {
  if (!CONFIG.music.tracks.length) return "<p class=\"hint\">No music added yet.</p>";
  return CONFIG.music.tracks.map((t) => "<p class=\"credit\">\"" + t.title + "\" by " + t.artist + ". Licensed under " +
    (t.link ? '<a href="' + t.link + '" target="_blank" rel="noopener">' + t.license + "</a>" : t.license) + ".</p>").join("") +
    '<p class="hint">Tracks re-encoded at a lower bitrate for the web; otherwise unchanged.</p>';
}
