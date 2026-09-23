const fs = require("fs");

let header = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");
header = header.replace(
  /className="bg-\[var\(--bg-primary\)\] text-\[var\(--text-primary\)\] border-b border-\[var\(--border-color\)\]/g,
  'className="bg-[var(--bg-header)] text-[var(--text-header)] border-b border-[var(--border-header)]',
);
fs.writeFileSync("src/components/DesktopHeader.tsx", header);

let nav = fs.readFileSync("src/components/Navigation.tsx", "utf8");
nav = nav.replace(
  /className="w-64 bg-\[var\(--bg-secondary\)\] text-\[var\(--text-primary\)\] border-l border-\[var\(--border-color\)\]/g,
  'className="w-64 bg-[var(--bg-sidebar)] text-[var(--text-sidebar)] border-l border-[var(--border-sidebar)]',
);

// We need to also fix text colors of the items inside Navigation, which might be using `text-[var(--text-header-sidebar)]` still? Let's check.
// Before I wrote `code.replace(/text-\[var\(--text-header-sidebar\)\]/g, 'text-[var(--text-primary)]');`
// Now let's change those to `--text-sidebar`.
nav = nav.replace(
  /text-\[var\(--text-primary\)\]/g,
  "text-[var(--text-sidebar)]",
);
// EXCEPT the active tab which has text-[var(--text-primary)] (since it blends with main canvas).
// But wait! If I just search and replace, it's safer to use regex. Let's look at the file.

fs.writeFileSync("src/components/Navigation.tsx", nav);
