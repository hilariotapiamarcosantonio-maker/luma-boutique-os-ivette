import fs from "fs";
import path from "path";

const envPath = path.resolve(process.cwd(), ".env.local");
const spreadsheetId = process.argv[2] || process.env.SPREADSHEET_ID;

function escapeEnvValue(value) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

if (!spreadsheetId) {
  console.error("Uso: node update_env.mjs <SPREADSHEET_ID>");
  process.exit(1);
}

if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, "utf8");
  const nextLine = `SPREADSHEET_ID="${escapeEnvValue(spreadsheetId)}"`;

  if (content.match(/^SPREADSHEET_ID=.*$/m)) {
    content = content.replace(/^SPREADSHEET_ID=.*$/m, nextLine);
  } else {
    content = `${nextLine}\n${content}`;
  }

  fs.writeFileSync(envPath, content, "utf8");
  console.log(".env.local actualizado con el SPREADSHEET_ID.");
} else {
  console.error("No se encontro .env.local");
}
