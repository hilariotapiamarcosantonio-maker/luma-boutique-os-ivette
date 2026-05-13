import "server-only";
import { getSheetsClient } from "../google-sheets";
import { Closing } from "@/types/crm";

export async function getClosings(): Promise<Closing[]> {
  const { sheets, spreadsheetId } = await getSheetsClient();

  if (!sheets || !spreadsheetId) {
    return [];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Cierres!A8:L500",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    return rows.filter((row: string[]) => row[0]).map((row: string[]) => ({
      id: row[0] || "",
      date: row[1] || "",
      leadId: row[2] || "N/A",
      propId: row[3] || "N/A",
      type: row[4] || "",
      price: row[5] ? `${row[6] || "USD"} ${row[5]}` : "0",
      currency: row[6] || "USD",
      commPct: row[7] || "0%",
      commGross: row[8] ? `${row[6] || "USD"} ${row[8]}` : "0",
      status: row[9] || "Pendiente",
      invoiceDate: row[10] || "",
      notes: row[11] || "",
    }));
  } catch (error) {
    console.error("Error fetching closings:", error);
    return [];
  }
}
