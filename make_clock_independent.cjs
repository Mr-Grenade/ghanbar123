const fs = require("fs");

let css = fs.readFileSync("src/styles.css", "utf8");

// Remove the global default
css = css.replace("--text-clock: var(--accent-primary);\n", "");

// Light Theme
css = css.replace(
  "--border-sidebar: #1e293b;",
  "--border-sidebar: #1e293b;\n  \n  /* Independent Clock Color */\n  --text-clock: #3b82f6;",
);

// Dark Theme
css = css.replace(
  "  --border-sidebar: #0f172a;\n}",
  "  --border-sidebar: #0f172a;\n  \n  /* Independent Clock Color */\n  --text-clock: #60a5fa;\n}",
);

// Themes replacement
function addClockColor(theme, color) {
  const regex = new RegExp(
    `(\\[data-theme="${theme}"\\] \\{[\\s\\S]*?  --border-sidebar: var\\(--border-color\\);)`,
  );
  css = css.replace(regex, `$1\n  --text-clock: ${color};`);
}

addClockColor("fall-1", "#d97706"); // amber-600
addClockColor("fall-2", "#65a30d"); // lime-600
addClockColor("spring-1", "#059669"); // emerald-600
addClockColor("spring-2", "#8b5cf6"); // violet-500
addClockColor("winter-1", "#0284c7"); // sky-600
addClockColor("winter-2", "#6366f1"); // indigo-500
addClockColor("summer-1", "#ea580c"); // orange-600
addClockColor("summer-2", "#0891b2"); // cyan-600

fs.writeFileSync("src/styles.css", css);
