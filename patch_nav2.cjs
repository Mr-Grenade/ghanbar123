const fs = require("fs");
let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

code = code.replace(
  /"bg-accent text-on-solid shadow-xs font-semibold"/g,
  '"bg-[var(--accent-primary)] text-white shadow-xs font-semibold"',
);

// also fix the active item's icon text
code = code.replace(
  /isActive\s*\?\s*"text-on-solid"/g,
  'isActive ? "text-white"',
);

fs.writeFileSync("src/components/Navigation.tsx", code);
