const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

const targetStr =
  'className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${isArchiveView ? "bg-red-50 text-red-600 border border-red-200" : "bg-[var(--bg-tertiary)] border border-[var(--border-color)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)]"}`}';
const newStr =
  'className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold transition-colors ${isArchiveView ? "bg-red-50 text-red-600 border border-red-200" : "bg-[var(--accent-light)] text-[var(--accent-text)] border border-[var(--accent-light)]"}`}';

code = code.replace(targetStr, newStr);

code = code.replace(
  /<History className="w-4 h-4" \/>/g,
  '<History className={`w-4 h-4 ${isArchiveView ? "text-red-600" : "text-[var(--accent-primary)]"}`} />',
);

fs.writeFileSync("src/components/DesktopHeader.tsx", code);
