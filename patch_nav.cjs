const fs = require("fs");
let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

if (!code.includes("import { AppLogo }")) {
  code = code.replace(
    "import { useAcademy }",
    'import { AppLogo } from "./AppLogo";\nimport { useAcademy }',
  );
}

const logoSection = `      <div className="flex flex-col gap-6 mb-6 mt-2">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-2xl bg-[var(--bg-primary)] p-2 flex items-center justify-center shadow-xs border border-[var(--border-color)] shrink-0">
            {db.settings.logoUrl ? (
              <img
                src={db.settings.logoUrl}
                alt="Logo"
                className="w-full h-full object-contain rounded"
              />
            ) : (
              <AppLogo className="w-12 h-12" />
            )}
          </div>
          <div className="text-center">
            <h1 className="text-lg font-extrabold text-[var(--text-primary)] tracking-tight">
              {db.settings.academyName}
            </h1>
            <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1 px-2 leading-relaxed">
              سیستم مدیریت یکپارچه کلاس‌ها و حضور و غیاب
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-1 relative">`;

code = code.replace('<div className="space-y-1">', logoSection);

// Add the cone curve to the active tab
// Instead of a full fluid inverted radius (which can be hard to adapt to themes),
// we can use a CSS triangle on the left side (RTL left means towards the main content)
// "cone like curve" -> maybe a pointy arrow or a rounded pill indicator.
// A cone-like curve usually means a notch. Let's do an absolute positioned element inside the active button.
const tabButtonRegex =
  /className=\{\`w-full flex items-center justify-between px-3 py-2\.5 rounded-xl text-xs font-medium transition-all group \$\{\s*isActive\s*\?\s*"bg-\[var\(--accent-primary\)\] text-white shadow-xs font-semibold"\s*:\s*"text-\[var\(--text-secondary\)\] hover:bg-\[var\(--bg-tertiary\)\] hover:text-\[var\(--text-primary\)\]"\s*\}\`\}/;

const tabButtonReplacement = `className={\`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group \${
                isActive
                  ? "bg-[var(--accent-primary)] text-white shadow-xs font-semibold"
                  : "text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)]"
              }\`}
            >
              {isActive && (
                <div className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-4 h-4 bg-[var(--accent-primary)] rotate-45 rounded-sm shadow-xs" style={{ zIndex: -1 }}></div>
              )}`;

code = code.replace(tabButtonRegex, tabButtonReplacement);

fs.writeFileSync("src/components/Navigation.tsx", code);
