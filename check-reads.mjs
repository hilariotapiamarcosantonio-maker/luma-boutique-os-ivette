import { config } from "dotenv";
import { google } from "googleapis";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

async function checkAll() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const sheets = google.sheets({ version: "v4", auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  try {
    const dashboard = await sheets.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: ["Dashboard!B4:B4", "Dashboard!E4:E4", "Dashboard!H4:H4", "Dashboard!K4:K4"]
    });
    console.log("Dashboard KPIs:", dashboard.data.valueRanges.map(v => v.values?.[0]?.[0]));

    const leads = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Leads!A8:O12" });
    console.log("Leads encontrados:", leads.data.values?.length || 0);

    const propiedades = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Propiedades!A10:S14" });
    console.log("Propiedades encontradas:", propiedades.data.values?.length || 0);

    const visitas = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Visitas!A8:H12" });
    console.log("Visitas encontradas:", visitas.data.values?.length || 0);

    const cierres = await sheets.spreadsheets.values.get({ spreadsheetId, range: "Cierres!A8:J12" });
    console.log("Cierres encontrados:", cierres.data.values?.length || 0);

    console.log("Todas las hojas respondieron correctamente.");
  } catch(e) {
    console.error("Error en validación:", e.message);
  }
}
checkAll();
