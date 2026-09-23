const fs = require("fs");
let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

const regex =
  /<div className="flex items-center gap-3 px-4 pb-5 border-b border-white\/10 mx-2">([\s\S]*?)<div className="flex-1 min-w-0">/m;

const replacement = `<div className="flex flex-row items-center gap-3 px-4 pb-4 border-b border-[var(--border-color)] mx-2 mb-2">$1<div className="flex-1 min-w-0 text-right">`;

code = code.replace(regex, replacement);
fs.writeFileSync("src/components/Navigation.tsx", code);
