const fs = require("fs");

let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

// 1. Remove the badge property from the payroll item
code = code.replace(
  /    \{\n      id: "payroll",\n      label: "امور مالی",\n      icon: Calculator,\n      badge:\n        overdueStudentsCount > 0\n          \? `\$\{toPersianDigits\(overdueStudentsCount\)\} بدهکار`\n          : undefined,\n    \},/,
  '    {\n      id: "payroll",\n      label: "امور مالی",\n      icon: Calculator,\n    },',
);

// 2. Clean up the badge rendering class logic
code = code.replace(
  /className=\{`text-xs font-bold px-2\.5 py-1 rounded-lg relative z-10 \$\{\n                        item\.id === "payroll" && overdueStudentsCount > 0\n                          \? "bg-\[var\(--danger\)\] text-white ring-1 ring-red-400\/50 shadow-sm"\n                          : "bg-\[var\(--text-sidebar\)\]\/10 text-\[var\(--text-sidebar\)\] opacity-90 ring-1 ring-\[var\(--text-sidebar\)\]\/30 shadow-sm backdrop-blur-sm"\n                      \}`\}/,
  'className="text-xs font-bold px-2.5 py-1 rounded-lg relative z-10 bg-[var(--text-sidebar)]/10 text-[var(--text-sidebar)] opacity-90 ring-1 ring-[var(--text-sidebar)]/30 shadow-sm backdrop-blur-sm"',
);

fs.writeFileSync("src/components/Navigation.tsx", code);
