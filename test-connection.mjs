import { config } from "dotenv";
import { google } from "googleapis";
import path from "path";

// Cargar .env.local
config({ path: path.resolve(process.cwd(), ".env.local") });

async function testConnection() {
  console.log("Iniciando validación de conexión a Google Sheets...");

  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const spreadsheetId = process.env.SPREADSHEET_ID;

  if (!clientEmail || !privateKey || !spreadsheetId) {
    console.error("❌ ERROR: Faltan variables en .env.local");
    console.log("Asegúrate de tener SPREADSHEET_ID, GOOGLE_CLIENT_EMAIL, y GOOGLE_PRIVATE_KEY.");
    process.exit(1);
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    console.log("Conectando a la hoja con ID:", spreadsheetId);

    // Test simple: Leer el Dashboard
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Dashboard!B4:B4", // Celda de Total Leads
    });

    if (response.data && response.data.values) {
      console.log("✅ CONEXIÓN EXITOSA");
      console.log("📊 Lectura de prueba (Total Leads en Dashboard):", response.data.values[0][0]);
      console.log("El entorno está listo para validar el frontend en Next.js.");
    } else {
      console.log("⚠️ Conexión establecida, pero no se encontraron datos en el rango Dashboard!B4:B4.");
    }

  } catch (error) {
    console.error("❌ ERROR DE CONEXIÓN A LA API:");
    console.error(error.message);
  }
}

testConnection();
