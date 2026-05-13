import { config } from "dotenv";
import { google } from "googleapis";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env.local") });

const SHEET_NAME = "Leads";
const HEADER_SCAN_RANGE = `${SHEET_NAME}!1:10`;
const ATTRIBUTION_HEADERS = [
  "sourceChannel",
  "campaignName",
  "adSetName",
  "adName",
  "utmSource",
  "utmMedium",
  "utmCampaign",
  "utmContent",
  "utmTerm",
  "landingPage",
  "referrer",
  "clickId",
  "clickIdType",
];

function columnToLetter(columnNumber) {
  let column = "";
  let value = columnNumber;

  while (value > 0) {
    const remainder = (value - 1) % 26;
    column = String.fromCharCode(65 + remainder) + column;
    value = Math.floor((value - 1) / 26);
  }

  return column;
}

function lastNonEmptyIndex(values) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    if (String(values[index] ?? "").trim()) {
      return index;
    }
  }

  return -1;
}

function scoreHeaderRow(row) {
  const normalized = row.map((value) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
  );
  const expectedTokens = [
    "id lead",
    "fecha registro",
    "nombre prospecto",
    "email",
    "whatsapp",
    "fuente",
    "landing page",
    "oportunidad",
    "presupuesto",
    "estatus",
    "asesor responsable",
    "etapa pipeline",
  ];

  return expectedTokens.reduce(
    (score, token) =>
      score +
      (normalized.some((cell) => cell === token || cell.includes(token))
        ? 1
        : 0),
    0
  );
}

function requireEnv(name) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: requireEnv("GOOGLE_CLIENT_EMAIL"),
      private_key: requireEnv("GOOGLE_PRIVATE_KEY").replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  return {
    sheets: google.sheets({ version: "v4", auth }),
    spreadsheetId: requireEnv("SPREADSHEET_ID"),
  };
}

async function detectHeaders(sheets, spreadsheetId) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: HEADER_SCAN_RANGE,
  });
  const rows = response.data.values ?? [];
  const candidates = rows
    .map((row, index) => ({
      rowNumber: index + 1,
      score: scoreHeaderRow(row),
      row,
    }))
    .sort((a, b) => b.score - a.score || a.rowNumber - b.rowNumber);
  const detected = candidates[0];

  if (!detected || detected.score === 0) {
    throw new Error(`Could not detect ${SHEET_NAME} header row in rows 1-10.`);
  }

  const lastIndex = lastNonEmptyIndex(detected.row);

  if (lastIndex < 0) {
    throw new Error(`${SHEET_NAME} header row is empty.`);
  }

  return {
    headerRow: detected.rowNumber,
    headers: detected.row
      .slice(0, lastIndex + 1)
      .map((header) => String(header ?? "").trim()),
  };
}

async function getLeadsSheetProperties(sheets, spreadsheetId) {
  const metadata = await sheets.spreadsheets.get({
    spreadsheetId,
    fields:
      "sheets(properties(sheetId,title,gridProperties(rowCount,columnCount)))",
  });
  const sheet = metadata.data.sheets?.find(
    (item) => item.properties?.title === SHEET_NAME
  );

  if (!sheet?.properties?.sheetId) {
    throw new Error(`Sheet named ${SHEET_NAME} was not found.`);
  }

  return {
    sheetId: sheet.properties.sheetId,
    columnCount: sheet.properties.gridProperties?.columnCount ?? 0,
  };
}

async function ensurePhysicalColumns({
  sheets,
  spreadsheetId,
  sheetId,
  currentColumnCount,
  requiredColumnCount,
}) {
  if (currentColumnCount >= requiredColumnCount) {
    return 0;
  }

  const length = requiredColumnCount - currentColumnCount;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [
        {
          appendDimension: {
            sheetId,
            dimension: "COLUMNS",
            length,
          },
        },
      ],
    },
  });

  return length;
}

async function main() {
  const { sheets, spreadsheetId } = await getSheetsClient();
  const sheetProperties = await getLeadsSheetProperties(sheets, spreadsheetId);
  const detected = await detectHeaders(sheets, spreadsheetId);
  const existingHeaderSet = new Set(detected.headers.filter(Boolean));
  const missingHeaders = ATTRIBUTION_HEADERS.filter(
    (header) => !existingHeaderSet.has(header)
  );

  const startColumnNumber = detected.headers.length + 1;
  const endColumnNumber = detected.headers.length + missingHeaders.length;
  const writtenRange = missingHeaders.length
    ? `${SHEET_NAME}!${columnToLetter(startColumnNumber)}${detected.headerRow}:${columnToLetter(endColumnNumber)}${detected.headerRow}`
    : "";

  if (missingHeaders.length === 0) {
    console.log(
      JSON.stringify(
        {
          headerRow: detected.headerRow,
          existingHeadersCount: detected.headers.length,
          lastColumn: columnToLetter(detected.headers.length),
          missingHeaders,
          writtenRange: null,
          noChangesNeeded: true,
          message: "no changes needed",
        },
        null,
        2
      )
    );
    return;
  }

  const appendedPhysicalColumns = await ensurePhysicalColumns({
    sheets,
    spreadsheetId,
    sheetId: sheetProperties.sheetId,
    currentColumnCount: sheetProperties.columnCount,
    requiredColumnCount: endColumnNumber,
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: writtenRange,
    valueInputOption: "RAW",
    requestBody: {
      values: [missingHeaders],
    },
  });

  console.log(
    JSON.stringify(
      {
        headerRow: detected.headerRow,
        existingHeadersCount: detected.headers.length,
        lastColumnBeforeWrite: columnToLetter(detected.headers.length),
        missingHeaders,
        appendedPhysicalColumns,
        writtenRange,
        noChangesNeeded: false,
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
