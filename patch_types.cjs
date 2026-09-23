const fs = require("fs");
let code = fs.readFileSync("src/types.ts", "utf8");

const regex = /export type ThemeMode = "light" \| "dark" \| "seasonal";/;
const replacement = `export type ThemeMode = "light" | "dark" | "fall-1" | "fall-2" | "spring-1" | "spring-2" | "winter-1" | "winter-2" | "summer-1" | "summer-2";`;
code = code.replace(regex, replacement);

fs.writeFileSync("src/types.ts", code);
