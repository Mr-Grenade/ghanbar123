const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

// 1. Header background gradient
code = code.replace(
  /className="h-16 bg-\[var\(--bg-secondary\)\] border-b border-\[var\(--border-color\)\]/g,
  `className="h-16 border-b border-[var(--border-color)]"`,
);
// We will apply the gradient by style or class. Wait, it's easier to just add it.
code = code.replace(
  /className="h-16 border-b border-\[var\(--border-color\)\]/g,
  `className="h-16 border-b border-[var(--border-color)] bg-gradient-to-br from-[#FFFFFF] to-[#F5F9FC]"`,
); // Note: I assume it's light theme only? Yes, "light-theme UI". But they have themes, let's just apply it as requested. Or we can just use `bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)]`? The user said `#FFFFFF to #F5F9FC`. I'll use those explicitly for light theme via `data-theme="light"` or just use the hex codes. But wait, in dark mode it will be white! So I should use the variables.
// In styles.css, --bg-secondary is #FFFFFF and --bg-primary is #F5F7FA. I can use `bg-gradient-to-br from-[var(--bg-secondary)] to-[var(--bg-primary)]`.

code = code.replace(
  /className="h-16 border-b border-\[var\(--border-color\)\] bg-gradient-to-br from-\[#FFFFFF\] to-\[#F5F9FC\]"/g,
  `className="h-16 border-b border-[var(--border-color)] bg-[linear-gradient(135deg,var(--bg-secondary)_0%,var(--bg-primary)_100%)]"`,
);

// 2. Date badge
// Was: bg-[var(--bg-tertiary)] border-[var(--border-color)] text-[var(--text-primary)]
// Should be: bg #FFFFFF, border #E1E7EE, text #16222E, calendar icon #55677A
// This maps to bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-primary)], icon text-[var(--text-secondary)]
code = code.replace(
  /<div className="flex items-center gap-2 px-3 py-1\.5 bg-\[var\(--bg-tertiary\)\] rounded-xl border border-\[var\(--border-color\)\]">([\s\S]*?)<Calendar className="w-4 h-4 text-\[var\(--text-muted\)\]" \/>/g,
  `<div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)]">$1<Calendar className="w-4 h-4 text-[var(--text-secondary)]" />`,
);

// 3. Time badge
// Was: bg-accent-soft text-accent-strong border-accent-border
// Should be: bg #FFFFFF, border #E1E7EE, time text #1D4E89 (accent-primary), clock icon #1D4E89 (accent-primary)
code = code.replace(
  /<div className="flex items-center gap-2 px-3 py-1\.5 bg-accent-soft text-accent-strong rounded-xl border border-accent-border font-bold">([\s\S]*?)<Clock className="w-4 h-4 text-accent-strong" \/>([\s\S]*?)<\/div>/g,
  `<div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-secondary)] text-[var(--accent-primary)] rounded-xl border border-[var(--border-color)] font-bold">$1<Clock className="w-4 h-4 text-[var(--accent-primary)]" />$2</div>`,
);

// 4. "تابستان" season chip
// Was: bg-[var(--bg-tertiary)]
// Should be: bg #EEF2F6 (tertiary), text #55677A (secondary), dot #3E7D4C (success)
code = code.replace(
  /<div className="flex items-center gap-1\.5 px-2\.5 py-1\.5 bg-\[var\(--bg-tertiary\)\] rounded-xl border border-\[var\(--border-color\)\]">([\s\S]*?)<span className="w-2 h-2 rounded-full bg-success">([\s\S]*?)<span className="text-xs font-semibold text-\[var\(--text-secondary\)\]">/g,
  `<div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-color)]">$1<span className="w-2 h-2 rounded-full bg-[var(--success)]">$2<span className="text-xs font-semibold text-[var(--text-secondary)]">`,
);

// 5. Theme toggle group
// Was: active bg-accent text-on-solid, inactive text-[var(--text-muted)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]
// Should be: active bg-[var(--accent-primary)] icon text-white, inactive transparent icon #55677A (text-secondary), hover inactive #EEF2F6 (bg-tertiary)
// I will just use `bg-[var(--accent-primary)] text-white` for active, `text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]` for inactive
code = code.replace(
  /activeTheme === "light"[\s\S]*?\? "bg-accent text-on-solid shadow-sm"[\s\S]*?: "text-\[var\(--text-muted\)\] hover:bg-\[var\(--bg-tertiary\)\] hover:text-\[var\(--text-primary\)\]"/g,
  `activeTheme === "light"\n                        ? "bg-[var(--accent-primary)] text-white shadow-sm"\n                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"`,
);
code = code.replace(
  /activeTheme === "dark"[\s\S]*?\? "bg-accent text-on-solid shadow-sm"[\s\S]*?: "text-\[var\(--text-muted\)\] hover:bg-\[var\(--bg-tertiary\)\] hover:text-\[var\(--text-primary\)\]"/g,
  `activeTheme === "dark"\n                        ? "bg-[var(--accent-primary)] text-white shadow-sm"\n                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"`,
);
code = code.replace(
  /activeTheme === "system"[\s\S]*?\? "bg-accent text-on-solid shadow-sm"[\s\S]*?: "text-\[var\(--text-muted\)\] hover:bg-\[var\(--bg-tertiary\)\] hover:text-\[var\(--text-primary\)\]"/g,
  `activeTheme === "system"\n                        ? "bg-[var(--accent-primary)] text-white shadow-sm"\n                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]"`,
);

// 6. Logo icon container
// Was: <AppLogo className="w-8 h-8" />
// We will replace AppLogo usage or AppLogo internal. Let's check AppLogo.tsx.
fs.writeFileSync("src/components/DesktopHeader.tsx", code);
