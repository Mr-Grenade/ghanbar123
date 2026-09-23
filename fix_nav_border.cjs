const fs = require("fs");
let nav = fs.readFileSync("src/components/Navigation.tsx", "utf8");

nav = nav.replace(
  'className="flex flex-row items-center gap-3 px-4 pb-4 border-b border-[var(--border-color)] mx-2 mb-2"',
  'className="flex flex-row items-center gap-3 px-4 pb-4 mx-2 mb-2"',
);

fs.writeFileSync("src/components/Navigation.tsx", nav);
