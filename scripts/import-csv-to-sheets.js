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

const CSV_FILE = "F:\\Luma Commerce  Boutique OS\\ptigo-09gu2.csv";
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
  "email",
  "organizacion",
  "estado_importacion",
  "contactable_whatsapp",
  "motivo_revision"
];

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === "," && !quoted) {
      row.push(cell);
      cell = "";
      continue;
    }
    if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }
    cell += char;
  }

  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((items) => items.some((item) => item.trim() !== ""));
}

function normalizePhone(phone) {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return digits;
  return digits;
}

function getRevisionReason(phone, normalized) {
  if (!phone || !phone.trim()) return "Sin teléfono";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return "Teléfono incompleto";
  return "Formato no normalizable";
}

function checkWhatsAppValid(normalized) {
  // Dominican/US formats are 11 digits starting with 1.
  // Standard WhatsApp phone numbers are 10-15 digits.
  return normalized.length >= 10 && normalized.length <= 15;
}

function stableId(phone, name) {
  const salt = phone || name || Math.random().toString();
  return `CON-${crypto.createHash("sha1").update(salt).digest("hex").slice(0, 12).toUpperCase()}`;
}

async function getSheets() {
  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.error("Missing Google credentials or SPREADSHEET_ID in environment variables.");
    process.exit(2);
  }
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

function getDominicanTimestamp() {
  const now = new Date();
  const options = { timeZone: "America/Santo_Domingo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
  const formatter = new Intl.DateTimeFormat("es-DO", options);
  const parts = formatter.formatToParts(now);
  const val = (type) => parts.find((p) => p.type === type).value;
  return `${val("year")}${val("month")}${val("day")}_${val("hour")}${val("minute")}`;
}

async function main() {
  console.log("Loading Sheets API client...");
  const sheets = await getSheets();

  // 1. Fetch current Contacts sheet
  console.log("Retrieving existing contacts...");
  let existingResponse;
  try {
    existingResponse = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:Z50000`, // Grab all potential headers/columns
      valueRenderOption: "UNFORMATTED_VALUE"
    });
  } catch (err) {
    console.error("Error reading from spreadsheet:", err.message);
    process.exit(2);
  }

  const existingValues = existingResponse.data.values || [];
  const existingHeaders = existingValues[0] || [];
  const existingRows = existingValues.slice(1);

  console.log(`Found ${existingRows.length} existing contacts in sheet.`);

  // 2. Create Backup Sheet
  const timestamp = getDominicanTimestamp();
  const backupSheetName = `${SHEET_NAME}_BACKUP_${timestamp}`;
  console.log(`Creating backup sheet: ${backupSheetName}...`);
  try {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{ addSheet: { properties: { title: backupSheetName } } }]
      }
    });

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${backupSheetName}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: existingValues.length ? existingValues : [HEADERS]
      }
    });
    console.log("Backup sheet created successfully.");
  } catch (err) {
    console.error("Failed to create backup sheet:", err.message);
    process.exit(2);
  }

  // 3. Read & Parse CSV
  console.log(`Reading CSV file from: ${CSV_FILE}...`);
  let csvText;
  try {
    csvText = await fs.readFile(CSV_FILE, "utf8");
  } catch (err) {
    console.error(`Failed to read CSV file: ${err.message}`);
    process.exit(1);
  }

  const csvParsed = parseCsv(csvText);
  const [csvHeaders, ...csvRows] = csvParsed;

  const colFirstName = csvHeaders.indexOf("First Name");
  const colDisplayName = csvHeaders.indexOf("Display Name");
  const colLastName = csvHeaders.indexOf("Last Name");
  const colMobile = csvHeaders.indexOf("Mobile Phone");
  const colHome = csvHeaders.indexOf("Home Phone");
  const colBusiness = csvHeaders.indexOf("Business Phone");
  const colEmail = csvHeaders.indexOf("E-mail Address");
  const colNotes = csvHeaders.indexOf("Notes");
  const colOrg = csvHeaders.indexOf("Organization");
  const colCategories = csvHeaders.indexOf("Categories");

  console.log(`Parsed CSV. Total contacts found: ${csvRows.length}`);

  // Create lookup maps from existing Contacts sheet to avoid duplicates and perform merge
  // We'll normalize keys to headers indices
  const getHeaderIdx = (headerName) => existingHeaders.indexOf(headerName);
  const idIdx = getHeaderIdx("id");
  const nameIdx = getHeaderIdx("nombre");
  const phoneIdx = getHeaderIdx("telefono");
  const normPhoneIdx = getHeaderIdx("telefono_normalizado");
  const waUrlIdx = getHeaderIdx("whatsapp_url");
  const zonaIdx = getHeaderIdx("zona");
  const labelIdx = getHeaderIdx("etiqueta");
  const clientaFielIdx = getHeaderIdx("clienta_fiel");
  const cohorteIdx = getHeaderIdx("cohorte");
  const originIdx = getHeaderIdx("origen");
  const contactStatusIdx = getHeaderIdx("estado_contacto");
  const interestIdx = getHeaderIdx("interes");
  const lastIntIdx = getHeaderIdx("ultima_interaccion");
  const nextActIdx = getHeaderIdx("proxima_accion");
  const notesIdx = getHeaderIdx("notas");
  const emailIdx = getHeaderIdx("email");
  const orgIdx = getHeaderIdx("organizacion");
  const importStatusIdx = getHeaderIdx("estado_importacion");
  const contactableWaIdx = getHeaderIdx("contactable_whatsapp");
  const revReasonIdx = getHeaderIdx("motivo_revision");

  // Load existing contacts into structured objects keyed by normalized phone or name (if no phone)
  const existingMapByPhone = new Map();
  const existingMapByNameNoPhone = new Map();

  existingRows.forEach((row, rowIndex) => {
    const val = (idx) => (idx !== -1 && idx < row.length ? String(row[idx] ?? "").trim() : "");
    const contactObj = {
      rowIndex: rowIndex + 2, // 1-indexed, +1 for header
      id: val(idIdx) || stableId(val(normPhoneIdx), val(nameIdx)),
      nombre: val(nameIdx) || "Contacto sin nombre",
      telefono: val(phoneIdx),
      telefono_normalizado: val(normPhoneIdx),
      whatsapp_url: val(waUrlIdx),
      zona: val(zonaIdx),
      etiqueta: val(labelIdx),
      clienta_fiel: val(clientaFielIdx) || "FALSE",
      cohorte: val(cohorteIdx),
      origen: val(originIdx) || "VCF Ivette",
      estado_contacto: val(contactStatusIdx) || "Pendiente",
      interes: val(interestIdx),
      ultima_interaccion: val(lastIntIdx),
      proxima_accion: val(nextActIdx),
      notas: val(notesIdx),
      email: val(emailIdx),
      organizacion: val(orgIdx),
      estado_importacion: val(importStatusIdx),
      contactable_whatsapp: val(contactableWaIdx),
      motivo_revision: val(revReasonIdx)
    };

    if (contactObj.telefono_normalizado) {
      existingMapByPhone.set(contactObj.telefono_normalizado, contactObj);
    } else {
      existingMapByNameNoPhone.set(contactObj.nombre.toLowerCase(), contactObj);
    }
  });

  let stats = {
    rowsRead: csvRows.length,
    contactsWithPhone: 0,
    contactsWithoutPhone: 0,
    validWhatsApp: 0,
    inRevision: 0,
    duplicateCsvIgnored: 0,
    alreadyExisting: 0,
    insertedNew: 0,
    updated: 0,
    conservedNoChanges: 0,
    totalFinal: 0,
    totalLanzamiento500: 0
  };

  // Intermediate helper map for deduplicating CSV contacts internally before writing
  const csvProcessedContacts = new Map();

  for (const row of csvRows) {
    const firstName = row[colFirstName] || "";
    const lastName = row[colLastName] || "";
    const displayName = row[colDisplayName] || "";
    
    let name = displayName.trim() || `${firstName} ${lastName}`.trim();
    if (!name) name = "Contacto sin nombre";

    const email = row[colEmail] ? row[colEmail].trim() : "";
    const notas = row[colNotes] ? row[colNotes].trim() : "";
    const organization = row[colOrg] ? row[colOrg].trim() : "";
    const category = row[colCategories] ? row[colCategories].trim() : "";

    // Read phone numbers
    const rawPhones = [row[colMobile], row[colHome], row[colBusiness]].filter(Boolean);

    if (rawPhones.length === 0) {
      stats.contactsWithoutPhone++;
      stats.inRevision++;
      // Handle contact without phone
      const rawNormalized = "";
      const isContactable = false;
      const csvContact = {
        nombre: name,
        telefono: "",
        telefono_normalizado: "",
        whatsapp_url: "",
        email,
        notas,
        organizacion: organization,
        etiqueta: category,
        origen: "CSV ptigo",
        estado_contacto: "Pendiente",
        estado_importacion: "Revisión",
        contactable_whatsapp: "FALSE",
        motivo_revision: "Sin teléfono",
        cohorte: "",
        clienta_fiel: "FALSE"
      };

      // Internal CSV Deduplication by name (since no phone)
      const lookupKey = `name:${name.toLowerCase()}`;
      if (csvProcessedContacts.has(lookupKey)) {
        // Merge internally within CSV rows
        const existingCsv = csvProcessedContacts.get(lookupKey);
        stats.duplicateCsvIgnored++;
        if (existingCsv.nombre === "Contacto sin nombre" && name) existingCsv.nombre = name;
        if (!existingCsv.email && email) existingCsv.email = email;
        if (!existingCsv.notas && notas) existingCsv.notas = notas;
        if (!existingCsv.organizacion && organization) existingCsv.organizacion = organization;
        if (!existingCsv.etiqueta && category) existingCsv.etiqueta = category;
      } else {
        csvProcessedContacts.set(lookupKey, csvContact);
      }
    } else {
      stats.contactsWithPhone++;
      // Handle all phones found for this row
      for (const rawPhone of rawPhones) {
        const normalized = normalizePhone(rawPhone);
        if (!normalized) {
          stats.inRevision++;
          // Treated as no valid phone number
          const csvContact = {
            nombre: name,
            telefono: rawPhone,
            telefono_normalizado: "",
            whatsapp_url: "",
            email,
            notas,
            organizacion: organization,
            etiqueta: category,
            origen: "CSV ptigo",
            estado_contacto: "Pendiente",
            estado_importacion: "Revisión",
            contactable_whatsapp: "FALSE",
            motivo_revision: getRevisionReason(rawPhone, ""),
            cohorte: "",
            clienta_fiel: "FALSE"
          };

          const lookupKey = `name:${name.toLowerCase()}`;
          if (csvProcessedContacts.has(lookupKey)) {
            const existingCsv = csvProcessedContacts.get(lookupKey);
            stats.duplicateCsvIgnored++;
            if (!existingCsv.telefono && rawPhone) existingCsv.telefono = rawPhone;
            if (!existingCsv.email && email) existingCsv.email = email;
            if (!existingCsv.notas && notas) existingCsv.notas = notas;
            if (!existingCsv.organizacion && organization) existingCsv.organizacion = organization;
            if (!existingCsv.etiqueta && category) existingCsv.etiqueta = category;
          } else {
            csvProcessedContacts.set(lookupKey, csvContact);
          }
          continue;
        }

        const isContactable = checkWhatsAppValid(normalized);
        if (isContactable) {
          stats.validWhatsApp++;
        } else {
          stats.inRevision++;
        }

        const csvContact = {
          nombre: name,
          telefono: rawPhone,
          telefono_normalizado: normalized,
          whatsapp_url: isContactable ? `https://wa.me/${normalized}` : "",
          email,
          notas,
          organizacion: organization,
          etiqueta: category,
          origen: "CSV ptigo",
          estado_contacto: "Pendiente",
          estado_importacion: isContactable ? "Importado" : "Revisión",
          contactable_whatsapp: isContactable ? "TRUE" : "FALSE",
          motivo_revision: isContactable ? "" : getRevisionReason(rawPhone, normalized),
          cohorte: "",
          clienta_fiel: "FALSE"
        };

        const lookupKey = `phone:${normalized}`;
        if (csvProcessedContacts.has(lookupKey)) {
          // Merge internally within CSV rows
          const existingCsv = csvProcessedContacts.get(lookupKey);
          stats.duplicateCsvIgnored++;
          if (existingCsv.nombre === "Contacto sin nombre" && name) existingCsv.nombre = name;
          if (!existingCsv.email && email) existingCsv.email = email;
          if (!existingCsv.notas && notas) existingCsv.notas = notas;
          if (!existingCsv.organizacion && organization) existingCsv.organizacion = organization;
          if (!existingCsv.etiqueta && category) existingCsv.etiqueta = category;
        } else {
          csvProcessedContacts.set(lookupKey, csvContact);
        }
      }
    }
  }

  // 4. Perform Fusión with Existing Contacts list
  const mergedContactsList = [];
  const processedExistingRowIndexes = new Set();

  // Keep track of all updated or inserted contacts
  for (const [key, csvContact] of csvProcessedContacts.entries()) {
    let matchedExisting = null;

    if (csvContact.telefono_normalizado) {
      matchedExisting = existingMapByPhone.get(csvContact.telefono_normalizado);
    } else {
      matchedExisting = existingMapByNameNoPhone.get(csvContact.nombre.toLowerCase());
    }

    if (matchedExisting) {
      stats.alreadyExisting++;
      processedExistingRowIndexes.add(matchedExisting.rowIndex);

      // Perform Merge
      const originalCopy = { ...matchedExisting };
      let changed = false;

      // Update empty fields in existing with CSV values
      const fieldsToMerge = ["nombre", "email", "organizacion", "notas", "etiqueta", "zona", "telefono"];
      for (const field of fieldsToMerge) {
        const existingVal = String(matchedExisting[field] || "").trim();
        const csvVal = String(csvContact[field] || "").trim();

        if (field === "nombre") {
          if ((existingVal === "" || existingVal.toLowerCase() === "contacto sin nombre") && csvVal) {
            matchedExisting.nombre = csvContact.nombre;
            changed = true;
          }
        } else {
          if (existingVal === "" && csvVal) {
            matchedExisting[field] = csvContact[field];
            changed = true;
          }
        }
      }

      // Always update contactable_whatsapp, whatsapp_url, estado_importacion, and motivo_revision for existing contacts
      const newContactable = csvContact.contactable_whatsapp;
      const newWaUrl = csvContact.whatsapp_url;
      const newImportStatus = csvContact.estado_importacion;
      const newRevReason = csvContact.motivo_revision;

      if (matchedExisting.contactable_whatsapp !== newContactable) {
        matchedExisting.contactable_whatsapp = newContactable;
        changed = true;
      }
      if (matchedExisting.whatsapp_url !== newWaUrl) {
        matchedExisting.whatsapp_url = newWaUrl;
        changed = true;
      }
      if (matchedExisting.estado_importacion !== newImportStatus) {
        matchedExisting.estado_importacion = newImportStatus;
        changed = true;
      }
      if (matchedExisting.motivo_revision !== newRevReason) {
        matchedExisting.motivo_revision = newRevReason;
        changed = true;
      }

      if (changed) {
        stats.updated++;
      } else {
        stats.conservedNoChanges++;
      }

      mergedContactsList.push(matchedExisting);
    } else {
      stats.insertedNew++;
      // Build a complete contact object for the Sheet row
      const newContact = {
        id: stableId(csvContact.telefono_normalizado, csvContact.nombre),
        nombre: csvContact.nombre,
        telefono: csvContact.telefono,
        telefono_normalizado: csvContact.telefono_normalizado,
        whatsapp_url: csvContact.whatsapp_url,
        zona: "",
        etiqueta: csvContact.etiqueta,
        clienta_fiel: "FALSE",
        cohorte: "",
        origen: csvContact.origen,
        estado_contacto: csvContact.estado_contacto,
        interes: "",
        ultima_interaccion: "",
        proxima_accion: "",
        notas: csvContact.notas,
        email: csvContact.email,
        organizacion: csvContact.organizacion,
        estado_importacion: csvContact.estado_importacion,
        contactable_whatsapp: csvContact.contactable_whatsapp,
        motivo_revision: csvContact.motivo_revision
      };
      mergedContactsList.push(newContact);
    }
  }

  // Append any existing contacts that were NOT matched by the CSV import
  existingRows.forEach((row, rowIndex) => {
    const rIndex = rowIndex + 2;
    if (!processedExistingRowIndexes.has(rIndex)) {
      // Create object representation
      const val = (idx) => (idx !== -1 && idx < row.length ? String(row[idx] ?? "").trim() : "");
      const isContactable = checkWhatsAppValid(val(normPhoneIdx));
      
      const unmergedContact = {
        id: val(idIdx) || stableId(val(normPhoneIdx), val(nameIdx)),
        nombre: val(nameIdx) || "Contacto sin nombre",
        telefono: val(phoneIdx),
        telefono_normalizado: val(normPhoneIdx),
        whatsapp_url: val(waUrlIdx) || (isContactable ? `https://wa.me/${val(normPhoneIdx)}` : ""),
        zona: val(zonaIdx),
        etiqueta: val(labelIdx),
        clienta_fiel: val(clientaFielIdx) || "FALSE",
        cohorte: val(cohorteIdx),
        origen: val(originIdx) || "VCF Ivette",
        estado_contacto: val(contactStatusIdx) || "Pendiente",
        interes: val(interestIdx),
        ultima_interaccion: val(lastIntIdx),
        proxima_accion: val(nextActIdx),
        notas: val(notesIdx),
        email: val(emailIdx),
        organizacion: val(orgIdx),
        estado_importacion: val(importStatusIdx) || (isContactable ? "Importado" : "Revisión"),
        contactable_whatsapp: val(contactableWaIdx) || (isContactable ? "TRUE" : "FALSE"),
        motivo_revision: val(revReasonIdx) || (isContactable ? "" : getRevisionReason(val(phoneIdx), val(normPhoneIdx)))
      };
      stats.conservedNoChanges++;
      mergedContactsList.push(unmergedContact);
    }
  });

  // Calculate final statistics
  stats.totalFinal = mergedContactsList.length;
  stats.totalLanzamiento500 = mergedContactsList.filter(
    (c) => c.cohorte === "lanzamiento_500"
  ).length;

  console.log("Stats calculated. Writing merged data to sheet...");

  // Write mergedContactsList to Google Sheets
  const rowsToWrite = mergedContactsList.map((contact) =>
    HEADERS.map((header) => contact[header] ?? "")
  );

  // Write headers & all records to sheet
  try {
    // Check if we need to expand columns and write
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A1:T${rowsToWrite.length + 1}`,
      valueInputOption: "RAW",
      requestBody: {
        values: [HEADERS, ...rowsToWrite]
      }
    });

    console.log("Sheets write completed successfully.");

    // Print masked stats
    console.log("\n" + "=".repeat(40));
    console.log("RESULTADO DE IMPORTACIÓN (ESTADÍSTICAS REALES):");
    console.log(JSON.stringify(stats, null, 2));
    console.log("=".repeat(40) + "\n");

  } catch (err) {
    console.error("Failed to write merged data to Google Sheets:", err.message);
    process.exit(2);
  }
}

main().catch((err) => {
  console.error("Unhandled execution error:", err);
  process.exit(1);
});
