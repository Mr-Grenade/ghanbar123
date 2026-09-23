const fs = require("fs");
let code = fs.readFileSync("src/components/AttendanceManager.tsx", "utf8");

const targetStr = "bg-accent text-on-solid";
const newStr =
  "bg-[var(--accent-primary)] hover:bg-[var(--accent-hover)] text-white";

code = code.replace(targetStr, newStr);
fs.writeFileSync("src/components/AttendanceManager.tsx", code);
