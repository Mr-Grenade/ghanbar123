const fs = require("fs");
let code = fs.readFileSync("src/components/ReportsExportManager.tsx", "utf8");

// 1. Add logoUrl state
code = code.replace(
  'const [signatureUrl, setSignatureUrl] = useState(db.settings.signatureUrl || "");',
  'const [signatureUrl, setSignatureUrl] = useState(db.settings.signatureUrl || "");\n  const [logoUrl, setLogoUrl] = useState(db.settings.logoUrl || "");',
);

// 2. Add handleLogoUpload
const signatureCode = `const signatureFileInputRef = useRef<HTMLInputElement>(null);`;
const logoCode = `const signatureFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("حجم تصویر لوگو نباید بیش از ۲ مگابایت باشد.", "warning");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLogoUrl(base64);
        showToast("تصویر لوگو با موفقیت بارگذاری شد.", "success");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoUrl("");
    showToast("تصویر لوگو حذف شد.", "info");
    if (logoFileInputRef.current) logoFileInputRef.current.value = "";
  };`;

code = code.replace(signatureCode, logoCode);

// 3. Add to handleSaveSettings
code = code.replace(
  /address,\s*signatureUrl,/g,
  "address,\n      signatureUrl,\n      logoUrl,",
);

fs.writeFileSync("src/components/ReportsExportManager.tsx", code);
