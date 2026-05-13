import "server-only";
import { getSheetsClient } from "../google-sheets";
import { Visit } from "@/types/crm";

export async function getVisits(): Promise<Visit[]> {
  const { sheets, spreadsheetId } = await getSheetsClient();

  if (!sheets || !spreadsheetId) {
    return [];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Visitas!A8:J500",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    return rows.filter((row: string[]) => row[0]).map((row: string[]) => ({
      id: row[0] || "",
      date: row[1] || "",
      time: row[2] || "",
      leadId: row[3] || "N/A",
      propId: row[4] || "N/A",
      agent: row[5] || "",
      status: row[6] || "Agendada",
      interest: row[7] || "Medio",
      comments: row[8] || "",
      nextStep: row[9] || "",
    }));
  } catch (error) {
    console.error("Error fetching visits:", error);
    return [];
  }
}
