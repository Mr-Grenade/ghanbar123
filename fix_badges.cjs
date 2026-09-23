const fs = require("fs");

let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

// Hide active badge
code = code.replace(
  /                  \{item\.badge && \([\s\S]*?<\/span>\n                  \)\}/,
  "",
);

// Update inactive badge
code = code.replace(
  '"bg-black/5 dark:bg-white/10 text-[var(--text-sidebar)] opacity-80 ring-1 ring-black/10 dark:ring-white/20 shadow-sm"',
  '"bg-[var(--text-sidebar)]/10 text-[var(--text-sidebar)] opacity-90 ring-1 ring-[var(--text-sidebar)]/30 shadow-sm backdrop-blur-sm"',
);

fs.writeFileSync("src/components/Navigation.tsx", code);
