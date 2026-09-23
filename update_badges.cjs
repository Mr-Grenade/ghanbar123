const fs = require("fs");

let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

// Remove active badge
code = code.replace(
  /                  \{item\.badge && \(\n                    <span className="text-xs font-extrabold px-2\.5 py-1 rounded-lg relative z-10 bg-\[var\(--accent-primary\)\]\/15 text-\[var\(--accent-text\)\]">\n                      \{item\.badge\}\n                    <\/span>\n                  \)\}/g,
  "",
);

// We might have missed it if it was changed in the previous step (I added rings). Let's check exactly what the active badge is now.
