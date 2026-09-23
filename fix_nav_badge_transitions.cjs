const fs = require("fs");

let code = fs.readFileSync("src/components/Navigation.tsx", "utf8");

code = code.replace(/transition-all /g, "");

fs.writeFileSync("src/components/Navigation.tsx", code);
