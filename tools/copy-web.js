// Copies the game's files into www/ for the Android app (Capacitor packs www/ into the app).
// Only what the game needs: no docs, demos, tests or tools. Run with: npm run copy-web
// (npm run sync does this and then updates the Android project).

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const out = path.join(root, "www");
const keep = ["index.html", "privacy.html", "manifest.webmanifest", "css", "js", "img", "music"];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out);
for (const item of keep) fs.cpSync(path.join(root, item), path.join(out, item), { recursive: true });
fs.rmSync(path.join(out, "js", "autoplay.js"), { force: true }); // a testing tool, not part of the app

// The app also needs Capacitor's core script (it lets the game talk to Android, e.g. the back button).
// Only the app's copy of index.html loads it, so the website is unchanged.
fs.copyFileSync(path.join(root, "node_modules", "@capacitor", "core", "dist", "capacitor.js"), path.join(out, "js", "capacitor.js"));
const page = path.join(out, "index.html");
const html = fs.readFileSync(page, "utf8");
const first = html.indexOf('<script src="js/config.js');
if (first < 0) throw new Error("copy-web: couldn't find the config.js script tag in index.html");
fs.writeFileSync(page, html.slice(0, first) + '<script src="js/capacitor.js"></script>\n  ' + html.slice(first));
console.log("Copied the game into www/: " + keep.join(", "));
