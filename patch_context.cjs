const fs = require("fs");
let code = fs.readFileSync("src/context/AcademyContext.tsx", "utf8");

const regex =
  /const applyThemeToDOM = \(themeMode: ThemeMode\) => \{[\s\S]*?document\.documentElement\.removeAttribute\("data-season"\);\s*\}\s*\};/;
const replacement = `const applyThemeToDOM = (themeMode: ThemeMode) => {
    document.documentElement.setAttribute("data-theme", themeMode);
  };`;
code = code.replace(regex, replacement);

fs.writeFileSync("src/context/AcademyContext.tsx", code);
