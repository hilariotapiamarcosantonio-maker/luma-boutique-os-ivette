import "server-only";
import { google, sheets_v4 } from "googleapis";

export async function getSheetsClient(): Promise<{
  sheets: sheets_v4.Sheets | null;
  spreadsheetId: string | null;
}> {
  const spreadsheetId = process.env.IVETTE_SPREADSHEET_ID || null;
  const clientEmail =
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ||
    process.env.GOOGLE_CLIENT_EMAIL ||
    process.env.GOOGLE_SHEETS_CLIENT_EMAIL ||
    null;
  const privateKey = (
    process.env.GOOGLE_PRIVATE_KEY ||
    process.env.GOOGLE_SHEETS_PRIVATE_KEY ||
    ""
  ).replace(/\\n/g, "\n");

  if (!spreadsheetId || !clientEmail || !privateKey) {
    return { sheets: null, spreadsheetId: null };
  }

  const auth = new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return {
    sheets: google.sheets({ version: "v4", auth }),
    spreadsheetId,
  };
}
