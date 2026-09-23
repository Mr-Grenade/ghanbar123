const fs = require("fs");

let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

// 1. Remove transitions on the buttons
code = code.replace(/transition-all group/g, "group");

// 2. Fix the padding of the active button so the badge doesn't move
// active button has `py-3 mr-3 pl-4 pr-4`
code = code.replace("py-3 mr-3 pl-4 pr-4", "py-3 mr-3 pl-[29px] pr-4");

// 3. Add outlines to badges
// Active badge:
// <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg relative z-10 bg-[var(--accent-primary)]/15 text-[var(--accent-text)]">
code = code.replace(
  'className="text-xs font-extrabold px-2.5 py-1 rounded-lg relative z-10 bg-[var(--accent-primary)]/15 text-[var(--accent-text)]"',
  'className="text-xs font-extrabold px-2.5 py-1 rounded-lg relative z-10 bg-[var(--accent-primary)]/15 text-[var(--accent-text)] ring-1 ring-[var(--accent-primary)]/50 shadow-sm"',
);

// Inactive badge:
code = code.replace(
  "className={`text-xs font-bold px-2.5 py-1 rounded-lg relative z-10 ${",
  "className={`text-xs font-bold px-2.5 py-1 rounded-lg relative z-10 ${",
); // wait, let's just replace the classes inside the condition

code = code.replace(
  'item.id === "payroll" && overdueStudentsCount > 0\n                          ? "bg-[var(--danger)] text-white"\n                          : "bg-white/20 text-white"',
  'item.id === "payroll" && overdueStudentsCount > 0\n                          ? "bg-[var(--danger)] text-white ring-1 ring-red-400/50 shadow-sm"\n                          : "bg-black/5 dark:bg-white/10 text-[var(--text-sidebar)] opacity-80 ring-1 ring-black/10 dark:ring-white/20 shadow-sm"',
);

// Wait, the inactive badge was "bg-white/20 text-white". In light theme, text-white on light sidebar is bad.
// text-[var(--text-sidebar)] is better.

fs.writeFileSync("src/components/Navigation.tsx", code);
