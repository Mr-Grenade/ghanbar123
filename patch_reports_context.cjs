const fs = require("fs");
let code = fs.readFileSync("src/components/ReportsExportManager.tsx", "utf8");

code = code.replace(
  "    archiveAndResetSemester,\n    showToast,\n  } = useAcademy();",
  "    archiveAndResetSemester,\n    showToast,\n    activeArchiveId,\n    setActiveArchiveId,\n  } = useAcademy();",
);

fs.writeFileSync("src/components/ReportsExportManager.tsx", code);
