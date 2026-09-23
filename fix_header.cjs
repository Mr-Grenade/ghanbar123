const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

code = code.replace(
  /bg-\[var\(--bg-header-sidebar\)\]/g,
  "bg-[var(--bg-primary)]",
);
code = code.replace(
  /text-\[var\(--text-header-sidebar\)\]/g,
  "text-[var(--text-primary)]",
);
code = code.replace(
  /border-\[var\(--border-header-sidebar\)\]/g,
  "border-[var(--border-color)]",
);

code = code.replace(
  "bg-[var(--bg-primary)] text-[var(--text-primary)] border-[var(--border-color)]",
  "bg-[var(--bg-tertiary)] text-[var(--text-primary)] border-[var(--border-color)]",
);

code = code.replace(
  "bg-[var(--bg-primary)] border border-[var(--border-color)] px-5",
  "bg-[var(--bg-secondary)] border border-[var(--border-color)] px-5",
);

code = code.replace(
  "bg-[var(--bg-primary)] border border-[var(--border-color)]",
  "bg-[var(--bg-tertiary)] border border-[var(--border-color)]",
);

fs.writeFileSync("src/components/DesktopHeader.tsx", code);
