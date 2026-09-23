const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

code = code.replace(
  "text-[var(--text-clock,var(--accent-primary))]",
  "text-[var(--text-clock)]",
);

fs.writeFileSync("src/components/DesktopHeader.tsx", code);
