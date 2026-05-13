import fs from "fs";

const filesToServerOnly = [
  "src/lib/google-sheets.ts",
  "src/lib/crm-data/get-leads.ts",
  "src/lib/crm-data/get-properties.ts",
  "src/lib/crm-data/get-visits.ts",
  "src/lib/crm-data/get-closings.ts",
  "src/lib/crm-data/get-dashboard-data.ts",
  "src/lib/crm-data/get-pipeline-data.ts",
];

const pagesToNodeRuntime = [
  "src/app/page.tsx",
  "src/app/leads/page.tsx",
  "src/app/propiedades/page.tsx",
  "src/app/visitas/page.tsx",
  "src/app/cierres/page.tsx",
  "src/app/pipeline/page.tsx",
];

for (const file of filesToServerOnly) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, "utf8");
    if (!content.includes('import "server-only"')) {
      fs.writeFileSync(file, 'import "server-only";\n' + content, "utf8");
    }
  }
}

for (const file of pagesToNodeRuntime) {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, "utf8");
    if (!content.includes("export const runtime = 'nodejs';")) {
      content = content.replace("export const dynamic = 'force-dynamic';", "export const runtime = 'nodejs';\nexport const dynamic = 'force-dynamic';");
      fs.writeFileSync(file, content, "utf8");
    }
  }
}
console.log("Arch fix applied");
