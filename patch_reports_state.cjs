const fs = require("fs");
let code = fs.readFileSync("src/components/ReportsExportManager.tsx", "utf8");

const targetStr = `  const [signatureUrl, setSignatureUrl] = useState<string>(
    db.settings.signatureUrl || "",
  );`;

const logoStr = `  const [signatureUrl, setSignatureUrl] = useState<string>(
    db.settings.signatureUrl || "",
  );
  const [logoUrl, setLogoUrl] = useState<string>(db.settings.logoUrl || "");`;

code = code.replace(targetStr, logoStr);
fs.writeFileSync("src/components/ReportsExportManager.tsx", code);
