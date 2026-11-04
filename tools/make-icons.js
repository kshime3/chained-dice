// Makes the Android app icons, splash screens and store icon from the logo (img/logo.svg).
// Not part of the game. Needs Node.js and Playwright (with its Chromium):  node tools/make-icons.js
// The results are committed, so this only needs running again if the logo changes.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const root = path.join(__dirname, "..");
const res = path.join(root, "android", "app", "src", "main", "res");
const logo = fs.readFileSync(path.join(root, "img", "logo.svg"), "utf8");

// The logo's parts: its definitions, and the art (everything after the three background rects).
const defs = logo.match(/<defs>[\s\S]*?<\/defs>/)[0];
const art = logo.slice(logo.indexOf("<g transform=\"rotate(-14 64 136)\">"), logo.lastIndexOf("</svg>"));

// Full-bleed background (Android cuts it into its own shape) and the art on its own.
const background = '<rect width="256" height="256" fill="#0d2a1a"/><rect width="256" height="256" fill="url(#pit)"/>';
// Adaptive icons: only the middle ~61% is always visible, so the art is scaled into that safe zone.
const safeArt = (scale) => '<g transform="translate(128 128) scale(' + scale + ') translate(-128 -130)">' + art + "</g>";

const svg = (body, w, h, viewBox) => '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="' + (viewBox || "0 0 256 256") + '">' + defs + body + "</svg>";

const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const render = async (markup, w, h, file, transparent) => {
    await page.setViewportSize({ width: w, height: h });
    await page.setContent('<html><body style="margin:0;background:' + (transparent ? "transparent" : "#0a0807") + '">' + markup + "</body></html>");
    await page.screenshot({ path: file, omitBackground: !!transparent, clip: { x: 0, y: 0, width: w, height: h } });
  };

  for (const [name, k] of Object.entries(DENSITIES)) {
    const dir = path.join(res, "mipmap-" + name);
    const legacy = Math.round(48 * k); // old-style icons: 48dp
    const layer = Math.round(108 * k); // adaptive icon layers: 108dp
    await render(svg(logo.slice(logo.indexOf("<rect"), logo.lastIndexOf("</svg>")), legacy, legacy), legacy, legacy, path.join(dir, "ic_launcher.png"), true);
    await render(svg('<clipPath id="c"><circle cx="128" cy="128" r="128"/></clipPath><g clip-path="url(#c)">' + background + safeArt(0.9) + "</g>", legacy, legacy), legacy, legacy, path.join(dir, "ic_launcher_round.png"), true);
    await render(svg(safeArt(0.7), layer, layer), layer, layer, path.join(dir, "ic_launcher_foreground.png"), true);
    await render(svg(background, layer, layer), layer, layer, path.join(dir, "ic_launcher_background.png"), false);
  }

  // Splash screens (older Androids show these images; Android 12+ shows the icon on the dark background).
  for (const dir of fs.readdirSync(res).filter((d) => d.startsWith("drawable"))) {
    const file = path.join(res, dir, "splash.png");
    if (!fs.existsSync(file)) continue;
    const buf = fs.readFileSync(file);
    const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20); // PNG size from its header
    const size = Math.round(Math.min(w, h) * 0.45);
    const markup = '<div style="width:' + w + "px;height:" + h + 'px;display:flex;align-items:center;justify-content:center;background:#0a0807">' +
      svg(logo.slice(logo.indexOf("<rect"), logo.lastIndexOf("</svg>")), size, size) + "</div>";
    await render(markup, w, h, file, false);
  }

  // Store icon for Google Play: 512 x 512.
  fs.mkdirSync(path.join(root, "store"), { recursive: true });
  // Play wants a 32-bit PNG (with an alpha channel) for the store icon, so it is rendered with transparency on (it fills the square anyway).
  await render(svg(background + safeArt(0.85), 512, 512), 512, 512, path.join(root, "store", "icon-512.png"), true);

  await browser.close();
  console.log("Icons, splash screens and store/icon-512.png made.");
})();
