const fs = require("fs");
let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

// The active tab notch was a simple triangle, but let's make it a bit more "cone like"
// with a rounded right border-radius (pointing left since it's RTL).
// Actually a triangle with border-r is already a cone pointing left.

// We need to fix the left side border of the sidebar so that it doesn't interrupt the active tab notch.
// The sidebar has border-l. If the notch is absolute -left-3, it will be placed OVER the border if it's z-20.
// Let's ensure no z-index clipping.
code = code.replace(
  'className="w-64 bg-[var(--bg-header-sidebar)] text-[var(--text-header-sidebar)] border-l border-[var(--border-header-sidebar)] flex flex-col justify-between p-3 shrink-0 select-none transition-colors duration-200 z-20"',
  'className="w-64 bg-[var(--bg-header-sidebar)] text-[var(--text-header-sidebar)] border-l border-[var(--border-header-sidebar)] flex flex-col justify-between p-3 shrink-0 select-none transition-colors duration-200 z-20 relative"',
);

fs.writeFileSync("src/components/Navigation.tsx", code);
