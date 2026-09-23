const fs = require("fs");
let code = fs.readFileSync("src/components/DesktopHeader.tsx", "utf8");

const target = `      </div>
      </div>

      {/* Center: Enlarged Prominent Date and Time Display centered in top bar */}`;

const replace = `      </div>

      {/* Center: Enlarged Prominent Date and Time Display centered in top bar */}`;

code = code.replace(target, replace);
fs.writeFileSync("src/components/DesktopHeader.tsx", code);
