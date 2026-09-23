const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

const targetStr = `<div className="w-11 h-11 rounded-2xl bg-[var(--bg-secondary)] p-1.5 flex items-center justify-center shadow-xs border border-[var(--border-color)] shrink-0">
          <AppLogo className="w-8 h-8" />
        </div>`;

const newStr = `<div className="w-11 h-11 rounded-2xl bg-[var(--bg-secondary)] p-1.5 flex items-center justify-center shadow-xs border border-[var(--border-color)] shrink-0">
          {db.settings.logoUrl ? (
            <img src={db.settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain rounded" />
          ) : (
            <AppLogo className="w-8 h-8" />
          )}
        </div>`;

code = code.replace(targetStr, newStr);
fs.writeFileSync("src/components/DesktopHeader.tsx", code);
