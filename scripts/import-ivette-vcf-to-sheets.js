/* eslint-disable no-console */
const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");
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

const TARGET_FILE = "Contactos de Ivette Berroa Cosmetica Ancestral.vcf";
const SHEET_NAME = "Contactos";
const HEADERS = [
  "id",
  "nombre",
  "telefono",
  "telefono_normalizado",
  "whatsapp_url",
  "zona",
  "etiqueta",
  "clienta_fiel",
  "cohorte",
  "origen",
  "estado_contacto",
  "interes",
  "ultima_interaccion",
  "proxima_accion",
  "notas",
];
const MANUAL_FIELDS = new Set([
  "zona",
  "etiqueta",
  "estado_contacto",
  "interes",
  "ultima_interaccion",
  "proxima_accion",
  "notas",
]);

async function findFile(startDir, fileName) {
  let entries;
  try {
    entries = await fs.readdir(startDir, { withFileTypes: true });
  } catch {
    return null;
  }

  for (const entry of entries) {
    const fullPath = path.join(startDir, entry.name);
    if (entry.isFile() && entry.name === fileName) return fullPath;
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (["node_modules", ".next", ".git", "public"].includes(entry.name)) continue;
    const found = await findFile(path.join(startDir, entry.name), fileName);
    if (found) return found;
  }

  return null;
}

function unfoldVcf(text) {
  return text.replace(/\r?\n[ \t]/g, "");
}

function splitCards(text) {
  return unfoldVcf(text)
    .split(/BEGIN:VCARD/i)
    .slice(1)
    .map((chunk) => chunk.split(/END:VCARD/i)[0] || "")
    .filter(Boolean);
}

function decodeQuotedPrintable(value) {
  const compact = value.replace(/=\r?\n/g, "");
  const bytes = [];
  for (let i = 0; i < compact.length; i += 1) {
    if (compact[i] === "=" && /[0-9A-Fa-f]{2}/.test(compact.slice(i + 1, i + 3))) {
      bytes.push(parseInt(compact.slice(i + 1, i + 3), 16));
      i += 2;
    } else {
      bytes.push(compact.charCodeAt(i));
    }
  }
  return Buffer.from(bytes).toString("utf8");
}

function cleanVcfValue(rawValue, isQuotedPrintable) {
  const value = isQuotedPrintable ? decodeQuotedPrintable(rawValue) : rawValue;
  return value
    .replace(/\\n/g, " ")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\s+/g, " ")
    .trim();
}

function parseLine(line) {
  const index = line.indexOf(":");
  if (index === -1) return null;
  const meta = line.slice(0, index);
  const rawValue = line.slice(index + 1);
  const [field] = meta.split(";");
  const quoted = /ENCODING=QUOTED-PRINTABLE/i.test(meta);
  return {
    field: field.toUpperCase(),
    value: cleanVcfValue(rawValue, quoted),
  };
}

function nameFromCard(lines) {
  const fn = lines.find((line) => line.field === "FN")?.value;
  if (fn) return fn;

  const n = lines.find((line) => line.field === "N")?.value;
  if (!n) return "Contacto sin nombre";

  return n
    .split(";")
    .filter(Boolean)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim() || "Contacto sin nombre";
}

function normalizePhone(phone) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && /^(809|829|849)/.test(digits)) return `1${digits}`;
  if (digits.length === 11 && /^1(809|829|849)/.test(digits)) return digits;

  const dominicanMatch = digits.match(/1(809|829|849)\d{7}/);
  return dominicanMatch ? dominicanMatch[0] : "";
}

function stableId(phone) {
  return `CON-${crypto.createHash("sha1").update(phone).digest("hex").slice(0, 12).toUpperCase()}`;
}

function parseContacts(vcfText) {
  const cards = splitCards(vcfText);
  const contacts = [];
  let validPhones = 0;
  let duplicatePhones = 0;
  const seen = new Set();

  for (const card of cards) {
    const lines = card
      .split(/\r?\n/)
      .map((line) => parseLine(line))
      .filter(Boolean);
    const nombre = nameFromCard(lines);
    const phones = lines
      .filter((line) => line.field === "TEL")
      .map((line) => ({ original: line.value, normalized: normalizePhone(line.value) }))
      .filter((phone) => phone.normalized);

    for (const phone of phones) {
      validPhones += 1;
      if (seen.has(phone.normalized)) {
        duplicatePhones += 1;
        continue;
      }
      seen.add(phone.normalized);
      const index = contacts.length;
      const lanzamiento = index < 500;
      contacts.push({
        id: stableId(phone.normalized),
        nombre,
        telefono: phone.original,
        telefono_normalizado: phone.normalized,
        whatsapp_url: `https://wa.me/${phone.normalized}`,
        zona: "",
        etiqueta: lanzamiento ? "clienta_fiel" : "",
        clienta_fiel: lanzamiento ? "TRUE" : "FALSE",
        cohorte: lanzamiento ? "lanzamiento_500" : "",
        origen: "VCF Ivette",
        estado_contacto: "Pendiente",
        interes: "",
        ultima_interaccion: "",
        proxima_accion: "",
        notas: "",
      });
    }
  }

  return {
    contactsRead: cards.length,
    validPhones,
    duplicatePhones,
    contacts,
  };
}

function rowsToObjects(values) {
  const [headers = [], ...rows] = values;
  return rows.map((row, index) => ({
    rowIndex: index + 2,
    data: Object.fromEntries(headers.map((header, col) => [String(header), row[col] ?? ""])),
  }));
}

function rowFromObject(object) {
  return HEADERS.map((header) => object[header] ?? "");
}

function mergeContact(existing, imported) {
  if (!existing) return imported;
  const merged = { ...existing, ...imported };

  for (const field of MANUAL_FIELDS) {
    if (String(existing[field] || "").trim()) {
      merged[field] = existing[field];
    }
  }

  if (String(existing.clienta_fiel || "").trim().toUpperCase() === "TRUE") {
    merged.clienta_fiel = existing.clienta_fiel;
  }
  if (String(existing.cohorte || "").trim()) {
    merged.cohorte = existing.cohorte;
  }

  return merged;
}

function comparable(header, value) {
  if (header === "clienta_fiel") {
    return ["TRUE", "TRUE()"].includes(String(value ?? "").trim().toUpperCase()) ||
      value === true
      ? "TRUE"
      : "FALSE";
  }
  return String(value ?? "").trim();
}

function changed(a, b) {
  return HEADERS.some((header) => comparable(header, a?.[header]) !== comparable(header, b?.[header]));
}

async function getSheets() {
  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.log(NO_ACCESS_MESSAGE);
    process.exit(2);
  }

  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

async function ensureContactSheet(sheets) {
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: "sheets.properties",
  });
  const existing = spreadsheet.data.sheets?.find(
    (sheet) => sheet.properties?.title === SHEET_NAME
  );

  if (!existing) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: SHEET_NAME } } }],
      },
    });
  }

  await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:O1`,
      valueInputOption: "RAW",
      requestBody: { values: [HEADERS] },
  });
}

async function main() {
  const vcfPath =
    (await findFile("F:\\Luma Commerce  Boutique OS", TARGET_FILE)) ||
    (await findFile("F:\\Luma Commerce Boutique OS", TARGET_FILE)) ||
    (await findFile(process.cwd(), TARGET_FILE));

  if (!vcfPath) {
    console.log(JSON.stringify({ ok: false, error: "VCF_NOT_FOUND" }));
    process.exitCode = 1;
    return;
  }

  const sheets = await getSheets();

  try {
    await ensureContactSheet(sheets);

    const text = await fs.readFile(vcfPath, "utf8");
    const parsed = parseContacts(text);

    const existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:O`,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    const existingValues = existingResponse.data.values || [HEADERS];
    const existingObjects = rowsToObjects(existingValues);
    const byPhone = new Map();

    existingObjects.forEach((entry) => {
      const phone = String(entry.data.telefono_normalizado || "");
      if (phone) byPhone.set(phone, entry);
    });

    const allRows = existingObjects.map((entry) => ({ ...entry.data }));
    let inserted = 0;
    let updated = 0;

    for (const contact of parsed.contacts) {
      const found = byPhone.get(contact.telefono_normalizado);
      if (!found) {
        allRows.push(contact);
        inserted += 1;
        continue;
      }

      const merged = mergeContact(found.data, contact);
      if (changed(found.data, merged)) {
        allRows[found.rowIndex - 2] = merged;
        updated += 1;
      }
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:O${allRows.length + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [HEADERS, ...allRows.map(rowFromObject)],
      },
    });

    console.log(
      JSON.stringify(
        {
          ok: true,
          contactos_leidos: parsed.contactsRead,
          contactos_validos: parsed.contacts.length,
          duplicados_ignorados: parsed.duplicatePhones,
          contactos_insertados: inserted,
          contactos_actualizados: updated,
          contactos_lanzamiento_500: Math.min(500, parsed.contacts.length),
        },
        null,
        2
      )
    );
  } catch {
    console.log(NO_ACCESS_MESSAGE);
    process.exitCode = 2;
  }
}

main();
