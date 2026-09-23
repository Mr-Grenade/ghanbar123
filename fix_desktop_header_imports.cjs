const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

// If setActiveArchiveId is unused, remove it to avoid ESLint/TS errors.
code = code.replace(/setActiveArchiveId,\s*/, "");
// Also remove DropdownMenu imports if they are unused
code = code.replace(
  /import \{\s*DropdownMenu,\s*DropdownMenuContent,\s*DropdownMenuItem,\s*DropdownMenuTrigger,\s*\} from "\.\/ui\/dropdown-menu";\n/,
  "",
);

fs.writeFileSync("src/components/DesktopHeader.tsx", code);
