import "server-only";
import { getSheetsClient } from "../google-sheets";
import { Lead } from "@/types/crm";

export async function getLeads(): Promise<Lead[]> {
  const { sheets, spreadsheetId } = await getSheetsClient();

  if (!sheets || !spreadsheetId) {
    return [];
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: "Leads!A8:AR500",
    });

    const rows = response.data.values;
    if (!rows || rows.length === 0) return [];

    return rows.filter((row: string[]) => row[0]).map((row: string[]) => ({
      id: row[0] || "",
      date: row[1] || "",
      name: row[2] || "",
      email: row[3] || "",
      phone: row[4] || "",
      source: row[5] || "",
      landing: row[6] || "",
      opp: row[7] || "",
      budget: row[8] || "",
      priority: row[10] || "",
      status: row[11] || "",
      lastContact: row[12] || "",
      nextFollowUp: row[13] || "",
      agent: row[14] || "",
      notes: row[15] || "",
      tags: row[16] || "",
      result: row[17] || "",
      action: row[19] || "",
      propIdOfInterest: row[20] || "",
      propNameOfInterest: row[21] || "",
      clientType: row[22] || "",
      opType: row[23] || "",
      zoneOfInterest: row[24] || "",
      temperature: row[25] || "",
      potentialComm: row[26] || "",
      pipelineStage: row[27] || "",
      probability: row[28] || "",
      sourceChannel: row[31] || "",
      campaignName: row[32] || "",
      adSetName: row[33] || "",
      adName: row[34] || "",
      utmSource: row[35] || "",
      utmMedium: row[36] || "",
      utmCampaign: row[37] || "",
      utmContent: row[38] || "",
      utmTerm: row[39] || "",
      landingPage: row[40] || "",
      referrer: row[41] || "",
      clickId: row[42] || "",
      clickIdType: row[43] || "",
    }));
  } catch (error) {
    console.error("Error fetching leads:", error);
    return [];
  }
}
