// Display: drawings made in code (vector SVG), in the logo's dark style.
// Crew portraits: dark busts lit from above by the table lamp, each wearing an iron shackle collar.

const PORTRAIT_STYLE = {
  // skin, clothes, rim light (where the lamp catches the edge)
  base: { skin: "#2a1d17", body: "#1a1210", rim: "#6a4630" },
  Ghost: { skin: "#9fb4c4", body: "#7d93a3", rim: "#d6e6f2", see: 0.55 },
  You: { skin: "#3a2a20", body: "#22201c", rim: "#b0884e" },
};

// Hats, hair and faces: what makes each one recognisable at a small size.
function portraitDetails(name, body) {
  const eyes = '<circle cx="86" cy="96" r="3.2" fill="#d8c7a8"/><circle cx="114" cy="96" r="3.2" fill="#d8c7a8"/>';
  const d = {
    Lefty: { hat: '<path d="M58 78 Q100 46 142 78 L150 84 Q100 74 50 84 Z" fill="#3a3028" stroke="#5c4a3a" stroke-width="2"/>' },
    "Dealer Dee": {
      hat: '<path d="M60 74 Q100 64 140 74 L146 84 Q100 76 54 84 Z" fill="#1f6b3f" opacity="0.9"/><circle cx="100" cy="52" r="13" fill="' + body + '"/>',
      extra: '<path d="M86 152 L100 160 L114 152 L114 168 L100 160 L86 168 Z" fill="#9e1b14"/>',
    },
    "Hot Rod": { hat: '<path d="M64 76 Q70 34 112 40 Q146 44 140 70 Q122 54 100 62 Q80 58 64 76 Z" fill="#0f0b0a" stroke="#4a3220" stroke-width="2"/>' },
    Jinx: {
      hat: '<path d="M50 120 Q48 40 100 36 Q152 40 150 120 Q130 70 100 70 Q70 70 50 120 Z" fill="#0d0a0a" stroke="#3a1414" stroke-width="2"/>',
      eyes: '<circle cx="87" cy="97" r="4.5" fill="#ff4b2b"/><circle cx="113" cy="97" r="4.5" fill="#ff4b2b"/><circle cx="87" cy="97" r="10" fill="#ff4b2b" opacity="0.18"/><circle cx="113" cy="97" r="10" fill="#ff4b2b" opacity="0.18"/>',
    },
    Ghost: { eyes: '<ellipse cx="86" cy="97" rx="5" ry="7" fill="#0b0f14"/><ellipse cx="114" cy="97" rx="5" ry="7" fill="#0b0f14"/>' },
    Snake: {
      hat: '<path d="M64 80 Q100 50 136 80" fill="none" stroke="#2e4a2a" stroke-width="6" stroke-dasharray="3 5"/>',
      eyes: '<ellipse cx="86" cy="96" rx="5" ry="4" fill="#9be35f"/><ellipse cx="114" cy="96" rx="5" ry="4" fill="#9be35f"/><rect x="85" y="92" width="2" height="8" fill="#0b0b0b"/><rect x="113" y="92" width="2" height="8" fill="#0b0b0b"/>',
    },
    "Big Mo": {
      wide: true,
      hat: '<path d="M62 76 Q62 42 100 42 Q138 42 138 76 Z" fill="#4a1e1e" stroke="#6a2a2a" stroke-width="2"/><rect x="60" y="72" width="80" height="10" rx="4" fill="#5a2424"/>',
    },
    "The Professor": {
      eyes: '<circle cx="86" cy="96" r="9" fill="none" stroke="#c9b79a" stroke-width="3"/><circle cx="114" cy="96" r="9" fill="none" stroke="#c9b79a" stroke-width="3"/><line x1="95" y1="96" x2="105" y2="96" stroke="#c9b79a" stroke-width="3"/>' + eyes,
      hat: '<path d="M64 74 Q100 48 136 74" fill="none" stroke="#8c8c8c" stroke-width="5"/>',
    },
    "Lucky Lou": {
      hat: '<path d="M56 74 L144 74 L134 66 Q130 44 100 44 Q70 44 66 66 Z" fill="#2c2620" stroke="#5c4a3a" stroke-width="2"/><rect x="66" y="64" width="68" height="6" fill="#9e1b14"/><path d="M128 60 q8 -10 14 -4 q-4 8 -14 4 Z" fill="#3f8f45"/>',
    },
    You: { eyes: '<circle cx="86" cy="96" r="3.5" fill="#f0dcb4"/><circle cx="114" cy="96" r="3.5" fill="#f0dcb4"/>', hat: '<path d="M62 84 Q66 50 100 50 Q134 50 138 84 Q120 66 100 70 Q80 66 62 84 Z" fill="#17120f"/>' },
  };
  return Object.assign({ eyes: eyes, hat: "", extra: "", wide: false }, d[name] || {});
}

// A portrait as an SVG string (viewBox 200 x 240).
function crewPortrait(name) {
  const s = Object.assign({}, PORTRAIT_STYLE.base, PORTRAIT_STYLE[name] || {});
  const p = portraitDetails(name, s.body);
  const shoulders = p.wide ? "M4 240 Q8 160 64 148 L136 148 Q192 160 196 240 Z" : "M20 240 Q24 168 70 152 L130 152 Q176 168 180 240 Z";
  return '<svg class="portrait" viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><g' + (s.see ? ' opacity="' + s.see + '"' : "") + ">" +
    '<path d="' + shoulders + '" fill="' + s.body + '" stroke="' + s.rim + '" stroke-width="3"/>' +
    '<ellipse cx="100" cy="100" rx="38" ry="46" fill="' + s.skin + '" stroke="' + s.rim + '" stroke-width="3"/>' + p.hat + p.eyes + p.extra +
    '</g><ellipse cx="100" cy="152" rx="34" ry="9" fill="none" stroke="#5d6570" stroke-width="7"/>' +
    '<ellipse cx="100" cy="152" rx="34" ry="9" fill="none" stroke="#8a4a2a" stroke-width="3"/></svg>';
}
