const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

const regex = /\{\/\* Dropdown for Semesters \*\/\}[\s\S]*?<\/DropdownMenu>/;
const newBadge = `{/* Archive/Live Status Badge */}
      <div className="flex-shrink-0 flex items-center mr-4">
        <div
          className={\`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold \${isArchiveView ? "bg-red-50 text-red-600 border border-red-200" : "bg-[var(--accent-light)] text-[var(--accent-text)] border border-[var(--accent-light)]"}\`}
        >
          <History className={\`w-3.5 h-3.5 \${isArchiveView ? "text-red-600" : "text-[var(--accent-primary)]"}\`} />
          {isArchiveView
            ? \`آرشیو: \${db.archives?.find((a) => a.id === activeArchiveId)?.title || "ترم گذشته"}\`
            : "سیستم زنده (ترم جاری)"}
        </div>
      </div>`;

code = code.replace(regex, newBadge);
fs.writeFileSync("src/components/DesktopHeader.tsx", code);
