const fs = require("fs");

let header = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");
header = header.replace(
  '<div className="flex items-center gap-3 bg-[var(--bg-secondary)] border border-[var(--border-color)] px-5 py-2 rounded-2xl shadow-2xs">',
  '<div className="flex items-center gap-3 px-2 py-2">',
);

header = header.replace(
  '<div className="flex items-center gap-2 text-base md:text-lg font-extrabold text-[var(--text-primary)]">',
  '<div className="flex items-center gap-2 text-base md:text-lg font-extrabold text-[var(--text-header)]">',
);

header = header.replace(
  '<Calendar className="w-5 h-5 text-[var(--text-secondary)] shrink-0" />',
  '<Calendar className="w-5 h-5 opacity-80 shrink-0" />',
);

header = header.replace(
  '<span className="text-[var(--border-color)] font-bold text-base">',
  '<span className="text-[var(--text-header)] opacity-30 font-bold text-base">',
);

header = header.replace(
  '<div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--accent-primary)] text-base md:text-lg font-extrabold tracking-wider">',
  '<div className="flex items-center gap-2 px-2 py-1 text-[var(--text-clock,var(--accent-primary))] text-base md:text-lg font-extrabold tracking-wider">',
);

header = header.replace(
  '<Clock className="w-4 h-4 text-[var(--accent-primary)] animate-pulse" />',
  '<Clock className="w-4 h-4 animate-pulse" />',
);

fs.writeFileSync("src/components/DesktopHeader.tsx", header);

let styles = fs.readFileSync("src/styles.css", "utf8");
if (!styles.includes("--text-clock:")) {
  styles = styles.replace(
    "--color-sidebar-border: var(--border-sidebar, var(--border-color));",
    "--color-sidebar-border: var(--border-sidebar, var(--border-color));\n  --text-clock: var(--accent-primary);",
  );
  fs.writeFileSync("src/styles.css", styles);
}
