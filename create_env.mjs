import fs from "fs";
import path from "path";

const jsonFile = process.argv[2] || "service-account.json";
const jsonPath = path.resolve(process.cwd(), jsonFile);
const envPath = path.resolve(process.cwd(), ".env.local");

if (fs.existsSync(jsonPath)) {
  const creds = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

  const envContent = `SPREADSHEET_ID=""\nGOOGLE_CLIENT_EMAIL="${creds.client_email}"\nGOOGLE_PRIVATE_KEY="${creds.private_key.replace(/\n/g, "\\n")}"\n`;

  fs.writeFileSync(envPath, envContent, "utf8");
  console.log(".env.local creado exitosamente a partir del archivo JSON.");
} else {
  console.log(`No se encontro el archivo JSON de credenciales: ${jsonFile}`);
  console.log("Uso: node create_env.mjs <ruta-al-service-account.json>");
}
