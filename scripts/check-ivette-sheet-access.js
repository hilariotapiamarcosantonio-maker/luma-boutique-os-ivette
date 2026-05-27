/* eslint-disable no-console */
const { google } = require("googleapis");
const { config } = require("dotenv");

config({ path: ".env.local", quiet: true });

const SPREADSHEET_ID = process.env.IVETTE_SPREADSHEET_ID;
const CLIENT_EMAIL =
  process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
  process.env.GOOGLE_CLIENT_EMAIL ||
  process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
const PRIVATE_KEY = (
  process.env.GOOGLE_PRIVATE_KEY ||
  process.env.GOOGLE_SHEETS_PRIVATE_KEY ||
  ""
).replace(/\\n/g, "\n");

const NO_ACCESS_MESSAGE =
  "El service account todavía no tiene permiso editor en el Google Sheet. Comparte el Sheet con el email del service account como Editor.";

async function main() {
  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.log(NO_ACCESS_MESSAGE);
    process.exitCode = 2;
    return;
  }

  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheets = google.sheets({ version: "v4", auth });

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: "Config!A20:C20",
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [
          [
            "last_service_account_write_test",
            new Date().toISOString(),
            "Safe non-sensitive write test",
          ],
        ],
      },
    });

    const read = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: "Contactos!A1:O1",
    });

    console.log(
      JSON.stringify({
        ok: true,
        spreadsheetId: SPREADSHEET_ID,
        contactoHeadersVisible: Array.isArray(read.data.values?.[0]),
      })
    );
  } catch {
    console.log(NO_ACCESS_MESSAGE);
    process.exitCode = 2;
  }
}

main();
