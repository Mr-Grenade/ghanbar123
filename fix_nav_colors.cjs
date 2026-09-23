const fs = require("fs");
let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

code = code.replace(
  /bg-\[var\(--bg-header-sidebar\)\]/g,
  "bg-[var(--bg-secondary)]",
);
code = code.replace(
  /text-\[var\(--text-header-sidebar\)\]/g,
  "text-[var(--text-primary)]",
);
code = code.replace(
  /border-\[var\(--border-header-sidebar\)\]/g,
  "border-[var(--border-color)]",
);

fs.writeFileSync("src/components/Navigation.tsx", code);
