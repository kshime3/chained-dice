// Sound effects, made in the browser with the Web Audio API (no audio files).
// Display code: plays sounds, never changes the game.

let audio = null; // created on the first sound, after the player has clicked something
let muted = false;
try {
  muted = localStorage.getItem("chainedDice.muted") === "yes";
} catch (e) {
  // Storage can be blocked; sound just starts on.
}

function setMuted(value) {
  muted = value;
  try {
    localStorage.setItem("chainedDice.muted", value ? "yes" : "no");
  } catch (e) {
    // Not saved; fine.
  }
}

function audioContext() {
  if (!audio) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audio = new Ctx();
  }
  if (audio.state === "suspended") audio.resume();
  return audio;
}

// One tone: wave shape, start and end pitch (Hz), when it starts (seconds from now), how long, how loud.
function tone(type, freqStart, freqEnd, at, length, volume) {
  const ctx = audioContext();
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freqStart, t);
  osc.frequency.exponentialRampToValueAtTime(Math.max(1, freqEnd), t + length);
  gain.gain.setValueAtTime(volume * CONFIG.soundVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + length);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + length + 0.02);
}

// A short burst of noise (rattles, clanks, rumbles).
function noise(at, length, volume, lowpass) {
  const ctx = audioContext();
  if (!ctx) return;
  const t = ctx.currentTime + at;
  const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * length), ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = lowpass;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume * CONFIG.soundVolume, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + length);
  source.connect(filter).connect(gain).connect(ctx.destination);
  source.start(t);
}

const SOUNDS = {
  chip: () => { tone("triangle", 1800, 1200, 0, 0.06, 0.5); tone("triangle", 2400, 1600, 0.03, 0.05, 0.3); },
  rattle: () => { for (let i = 0; i < 7; i++) noise(i * 0.075 + Math.random() * 0.02, 0.03, 0.5, 3000); },
  land: () => { noise(0, 0.05, 0.6, 1500); tone("sine", 180, 120, 0, 0.08, 0.4); },
  win1: () => { tone("sine", 660, 660, 0, 0.12, 0.4); tone("sine", 880, 880, 0.08, 0.18, 0.4); },
  win2: () => { [523, 659, 784, 1047].forEach((f, i) => tone("triangle", f, f, i * 0.09, 0.25, 0.45)); },
  win3: () => {
    [523, 659, 784, 1047, 1319].forEach((f, i) => tone("triangle", f, f, i * 0.08, 0.3, 0.45));
    [523, 659, 784].forEach((f) => tone("sine", f * 2, f * 2, 0.42, 0.6, 0.18)); // a held chord on top
  },
  win4: () => { // jackpot: fanfare, bass and a shower of sparkles
    [392, 523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone("square", f, f, i * 0.07, 0.22, 0.18));
    tone("sine", 131, 131, 0, 0.9, 0.5);
    [1047, 1319, 1568].forEach((f) => tone("triangle", f, f, 0.5, 0.9, 0.3));
    for (let i = 0; i < 10; i++) tone("sine", 2500 + Math.random() * 2000, 3500, 0.5 + i * 0.07, 0.08, 0.12);
  },
  ding: () => { tone("sine", 1568, 1568, 0, 0.35, 0.35); tone("sine", 3136, 3136, 0, 0.2, 0.12); },
  plaque: () => { noise(0, 0.06, 0.7, 2500); tone("sine", 220, 140, 0, 0.18, 0.5); tone("triangle", 900, 700, 0.02, 0.08, 0.2); },
  lose: () => { tone("sine", 300, 200, 0, 0.15, 0.3); },
  sevenOut: () => { tone("sawtooth", 220, 55, 0, 0.7, 0.35); tone("sine", 90, 40, 0, 0.8, 0.6); noise(0, 0.4, 0.4, 400); },
  pay: () => { tone("square", 1300, 1300, 0, 0.05, 0.15); tone("square", 1750, 1750, 0.06, 0.12, 0.15); },
  buy: () => { [880, 1175, 1568].forEach((f, i) => tone("triangle", f, f, i * 0.06, 0.12, 0.35)); },
  clank: () => { tone("square", 420, 380, 0, 0.12, 0.25); tone("square", 610, 560, 0.02, 0.18, 0.2); noise(0, 0.12, 0.5, 5000); },
  ring: () => { for (let i = 0; i < 2; i++) for (let j = 0; j < 8; j++) tone("square", j % 2 ? 480 : 440, j % 2 ? 480 : 440, i * 0.6 + j * 0.045, 0.04, 0.12); },
  fall: () => { noise(0, 0.5, 0.6, 600); tone("sine", 900, 80, 0.3, 1.6, 0.4); noise(1.6, 0.8, 0.5, 250); },
  snap: () => { tone("square", 1400, 300, 0, 0.18, 0.3); noise(0, 0.25, 0.7, 6000); tone("triangle", 2600, 2200, 0.02, 0.3, 0.2); noise(0.35, 0.15, 0.4, 2000); },
  shiftWon: () => { [392, 523, 659, 784].forEach((f, i) => tone("triangle", f, f, i * 0.12, 0.4, 0.4)); },
};

function playSound(name) {
  if (muted || !SOUNDS[name]) return;
  try {
    SOUNDS[name]();
  } catch (e) {
    // A browser without audio support: just stay quiet.
  }
}
