const fs = require("fs");
let nav = fs.readFileSync("src/components/Navigation.tsx", "utf8");

nav = nav.replace(
  'className="relative w-[calc(100%-12px)] flex items-center justify-between py-3 mr-3 pl-4 pr-4 rounded-r-2xl text-xs font-medium transition-all group overflow-visible bg-[var(--bg-primary)] text-[var(--text-sidebar)] font-semibold z-10"',
  'className="relative w-[calc(100%-12px)] flex items-center justify-between py-3 mr-3 pl-4 pr-4 rounded-r-2xl text-xs font-medium transition-all group overflow-visible bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold z-10"',
);

fs.writeFileSync("src/components/Navigation.tsx", nav);
