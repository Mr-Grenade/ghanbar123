const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

// Header wrapper
code = code.replace(
  'className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)] px-4 py-2.5 flex items-center justify-between shadow-xs transition-colors duration-200 gap-4"',
  'className="bg-[var(--bg-header-sidebar)] text-[var(--text-header-sidebar)] border-b border-[var(--border-header-sidebar)] px-4 py-2.5 flex items-center justify-between shadow-xs transition-colors duration-200 gap-4"',
);

// Center time box (make it look good on dark bg)
code = code.replace(
  'className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-5 py-2 rounded-2xl shadow-2xs"',
  'className="flex items-center gap-3 bg-[var(--bg-primary)] border border-[var(--border-header-sidebar)] px-5 py-2 rounded-2xl shadow-2xs"',
);
code = code.replace(
  'className="flex items-center gap-2 text-base md:text-lg font-extrabold text-[var(--text-primary)]"',
  'className="flex items-center gap-2 text-base md:text-lg font-extrabold text-[var(--text-primary)]"',
);

code = code.replace(
  'className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--accent-primary)] text-base md:text-lg font-extrabold tracking-wider"',
  'className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-header-sidebar)] text-[var(--accent-primary)] text-base md:text-lg font-extrabold tracking-wider"',
);

// Auto-save badge
code = code.replace(
  /className=\{\`flex items-center justify-center \$\{(.*?)\} rounded-xl border transition-all cursor-default\`\}/,
  (match, p1) => {
    return (
      "className={`flex items-center justify-center ${" +
      p1
        .replace(
          "bg-[var(--bg-tertiary)]",
          "bg-[var(--bg-primary)] text-[var(--text-primary)]",
        )
        .replace(
          "border-[var(--border-color)]",
          "border-[var(--border-header-sidebar)]",
        ) +
      "} rounded-xl border transition-all cursor-default`}"
    );
  },
);

// Theme switcher
code = code.replace(
  'className="flex items-center p-0.5 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-color)]"',
  'className="flex items-center p-0.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-header-sidebar)]"',
);

fs.writeFileSync("src/components/DesktopHeader.tsx", code);
