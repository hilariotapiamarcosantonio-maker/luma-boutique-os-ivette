import "server-only";
import { getSheetsClient } from "../google-sheets";
import { Property } from "@/types/crm";

export async function getProperties(): Promise<Property[]> {
  const { sheets, spreadsheetId } = await getSheetsClient();

  if (!sheets || !spreadsheetId) {
    return [];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Propiedades!A10:Y500",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    return rows.filter((row: string[]) => row[0]).map((row: string[]) => {
      const refWords = (row[1] || "").split(" ");
      const imgInitials = refWords.length >= 2
        ? `${refWords[0][0]}${refWords[1][0]}`.toUpperCase()
        : (row[1] || "PR").substring(0, 2).toUpperCase();

      return {
        id: row[0] || "",
        ref: row[1] || "",
        type: row[2] || "",
        operation: row[3] || "",
        zone: row[4] || "",
        address: row[5] || "",
        price: row[6] ? `${row[7] || "USD"} ${row[6]}` : "N/A",
        currency: row[7] || "",
        maintenance: row[8] || "",
        beds: row[9] || "0",
        baths: row[10] || "0",
        parking: row[11] || "0",
        m2: row[12] || "0",
        furnished: row[13] || "No",
        airbnbReady: row[14] || "No",
        corp: row[15] || "No",
        retirement: row[16] || "No",
        investment: row[17] || "No",
        status: row[18] || "Pausada",
        owner: row[21] || "",
        expectedComm: row[22] ? `${row[7] || "USD"} ${row[22]}` : "",
        agent: row[23] || "",
        notes: row[24] || "",
        img: imgInitials
      };
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}
