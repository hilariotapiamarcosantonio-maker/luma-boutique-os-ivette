import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { getSheetsClient } from "./google-sheets";

export const IVETTE_SHEETS = {
  contactos: "Contactos",
  clientas: "Clientas",
  pedidos: "Pedidos",
  leads: "Leads",
  seguimiento: "Seguimiento",
  pagosQuincenales: "Pagos Quincenales",
  productos: "Productos",
  inventario: "Inventario",
  campanas: "Campañas",
  historialContacto: "Historial de Contacto",
  config: "Config",
} as const;

export const CRM_HEADERS: Record<string, string[]> = {
  [IVETTE_SHEETS.contactos]: [
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
    "motivo_revision",
  ],
  [IVETTE_SHEETS.clientas]: [
    "id",
    "contacto_id",
    "nombre",
    "telefono",
    "tipo_clienta",
    "limite_credito",
    "puede_fiar",
    "estado",
    "fecha_creacion",
    "notas",
  ],
  [IVETTE_SHEETS.pedidos]: [
    "id",
    "fecha",
    "cliente_nombre",
    "cliente_telefono",
    "productos",
    "subtotal",
    "descuento",
    "total",
    "metodo_pago",
    "modalidad_pago",
    "estado_pedido",
    "origen",
    "direccion",
    "zona",
    "referencia",
    "notas",
  ],
  [IVETTE_SHEETS.leads]: [
    "id",
    "fecha",
    "nombre",
    "telefono",
    "origen",
    "producto_interes",
    "estado",
    "proxima_accion",
    "notas",
  ],
  [IVETTE_SHEETS.seguimiento]: [
    "id",
    "fecha",
    "contacto_id",
    "nombre",
    "telefono",
    "canal",
    "accion",
    "estado",
    "proxima_fecha",
    "responsable",
    "notas",
  ],
  [IVETTE_SHEETS.pagosQuincenales]: [
    "id",
    "pedido_id",
    "contacto_id",
    "cliente_nombre",
    "telefono",
    "fecha_entrega",
    "monto_total",
    "cuota_1",
    "fecha_cuota_1",
    "estado_cuota_1",
    "cuota_2",
    "fecha_cuota_2",
    "estado_cuota_2",
    "saldo_pendiente",
    "estado_plan",
    "notas",
  ],
  [IVETTE_SHEETS.productos]: [
    "id",
    "nombre",
    "categoria",
    "precio",
    "costo_estimado",
    "stock",
    "estado",
    "descripcion",
    "notas",
  ],
  [IVETTE_SHEETS.inventario]: [
    "id",
    "producto_id",
    "producto",
    "movimiento",
    "cantidad",
    "fecha",
    "motivo",
    "responsable",
    "notas",
  ],
  [IVETTE_SHEETS.campanas]: [
    "id",
    "nombre",
    "fecha_inicio",
    "fecha_fin",
    "cohorte",
    "mensaje",
    "canal",
    "estado",
    "resultado",
    "notas",
  ],
  [IVETTE_SHEETS.historialContacto]: [
    "id",
    "fecha",
    "contacto_id",
    "nombre",
    "telefono",
    "tipo_interaccion",
    "mensaje",
    "resultado",
    "proxima_accion",
    "responsable",
    "notas",
  ],
  [IVETTE_SHEETS.config]: ["clave", "valor", "descripcion"],
};

export type SheetPrimitive = string | number | boolean;
export type SheetRow = Record<string, SheetPrimitive | undefined>;
export type CrmSource = "google-sheets" | "local-fallback";

export interface StoreOrderInput {
  nombre: string;
  apellido?: string;
  whatsapp: string;
  email?: string;
  provincia: string;
  municipio?: string;
  direccion: string;
  referencia?: string;
  notas?: string;
  itemsJson?: string;
  itemsSummary: string;
  subtotal: number;
  tax?: number;
  delivery?: number;
  discount?: number;
  total: number;
  metodoPago: string;
  modalidadPago: string;
  origen: string;
  canal?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  fechaEntrega?: string;
  observaciones?: string;
}

export interface QuincenalPlan {
  modalidadPago: "Plan Quincenal Clienta Fiel";
  fechaEntrega: string;
  montoTotal: number;
  cuota1: number;
  fechaCuota1: string;
  estadoCuota1: "Cuota 1 pendiente";
  cuota2: number;
  fechaCuota2: string;
  estadoCuota2: "Cuota 2 pendiente";
  saldoPendiente: number;
  estadoPlan: "Cuota 1 pendiente";
}

function normalizeKey(key: string) {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

export function todayInLaPaz() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function addDaysToDateInput(dateInput: string, days: number) {
  const date = new Date(`${dateInput}T00:00:00`);
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10 && /^(809|829|849)/.test(digits)) return `1${digits}`;
  return digits;
}

export function buildWhatsAppUrl(phone: string, message = "") {
  const normalized = normalizePhone(phone);
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return normalized ? `https://wa.me/${normalized}${text}` : "";
}

function toMoney(value: unknown) {
  const number = Number(String(value ?? "").replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

export function isQuincenalPlan(modalidadPago: string) {
  return modalidadPago === "Plan Quincenal Clienta Fiel" || modalidadPago === "Plan Quincenal";
}

export function calculateQuincenalPlan(
  montoTotal: number,
  fechaEntrega = todayInLaPaz()
): QuincenalPlan {
  const total = roundMoney(montoTotal);
  const cuota1 = roundMoney(total / 2);
  const cuota2 = roundMoney(total - cuota1);

  return {
    modalidadPago: "Plan Quincenal Clienta Fiel",
    fechaEntrega,
    montoTotal: total,
    cuota1,
    fechaCuota1: addDaysToDateInput(fechaEntrega, 15),
    estadoCuota1: "Cuota 1 pendiente",
    cuota2,
    fechaCuota2: addDaysToDateInput(fechaEntrega, 30),
    estadoCuota2: "Cuota 2 pendiente",
    saldoPendiente: total,
    estadoPlan: "Cuota 1 pendiente",
  };
}

function safeSheetFileName(sheetName: string) {
  return sheetName.replace(/[<>:"/\\|?*]/g, "_");
}

function localCsvPath(sheetName: string) {
  return path.join(
    process.cwd(),
    "data",
    "luma_boutique_os",
    `${safeSheetFileName(sheetName)}.csv`
  );
}

function cleanCsvCell(value: unknown) {
  const str = String(value ?? "")
    .replace(/"/g, '""')
    .replace(/\r?\n|\r/g, " ");
  return `"${str}"`;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
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

function matrixToRows(values: (string | number | boolean)[][]) {
  const [headers, ...rows] = values;
  if (!headers) return [];
  return rows
    .filter((row) => row.some((cell) => String(cell ?? "").trim()))
    .map((row) =>
      headers.reduce<Record<string, string | number | boolean>>(
        (acc, header, index) => {
          acc[String(header)] = row[index] ?? "";
          return acc;
        },
        {}
      )
    );
}

function valueForHeader(header: string, data: SheetRow) {
  if (data[header] !== undefined) return data[header] ?? "";

  const normalized = normalizeKey(header);
  const match = Object.keys(data).find((key) => normalizeKey(key) === normalized);
  return match ? data[match] ?? "" : "";
}

async function readLocalRows(sheetName: string) {
  try {
    const text = await fs.readFile(localCsvPath(sheetName), "utf8");
    return matrixToRows(parseCsv(text));
  } catch {
    return [];
  }
}

async function appendLocalRow(sheetName: string, data: SheetRow) {
  const filePath = localCsvPath(sheetName);
  const headers = CRM_HEADERS[sheetName] ?? Object.keys(data);

  await fs.mkdir(path.dirname(filePath), { recursive: true });

  let exists = false;
  try {
    await fs.access(filePath);
    exists = true;
  } catch {
    exists = false;
  }

  let csv = "";
  if (!exists) {
    csv += headers.map(cleanCsvCell).join(",") + "\n";
  }

  csv += headers.map((header) => cleanCsvCell(valueForHeader(header, data))).join(",") + "\n";
  await fs.appendFile(filePath, csv, "utf8");
}

async function getRemoteHeaders(sheetName: string) {
  const { sheets, spreadsheetId } = await getSheetsClient();
  if (!sheets || !spreadsheetId) return null;

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:AZ1`,
  });
  const headers = response.data.values?.[0] as string[] | undefined;

  return headers?.length ? { sheets, spreadsheetId, headers } : null;
}

export async function appendCrmRow(sheetName: string, data: SheetRow) {
  try {
    const remote = await getRemoteHeaders(sheetName);
    if (!remote) {
      await appendLocalRow(sheetName, data);
      return { source: "local-fallback" as CrmSource };
    }

    const row = remote.headers.map((header) => valueForHeader(header, data));

    await remote.sheets.spreadsheets.values.append({
      spreadsheetId: remote.spreadsheetId,
      range: `${sheetName}!A:A`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [row] },
    });

    return { source: "google-sheets" as CrmSource };
  } catch {
    console.warn(`Google Sheets unavailable for ${sheetName}; using local fallback.`);
    await appendLocalRow(sheetName, data);
    return { source: "local-fallback" as CrmSource };
  }
}

export async function readCrmRows(sheetName: string) {
  const { sheets, spreadsheetId } = await getSheetsClient();

  if (sheets && spreadsheetId) {
    try {
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:AZ`,
        valueRenderOption: "UNFORMATTED_VALUE",
      });
      return {
        rows: matrixToRows((response.data.values || []) as (string | number | boolean)[][]),
        source: "google-sheets" as CrmSource,
      };
    } catch {
      console.warn(`Google Sheets read failed for ${sheetName}; using local fallback.`);
    }
  }

  return { rows: await readLocalRows(sheetName), source: "local-fallback" as CrmSource };
}

export async function appendContacto(row: SheetRow) {
  return appendCrmRow(IVETTE_SHEETS.contactos, row);
}

export async function appendClienta(row: SheetRow) {
  return appendCrmRow(IVETTE_SHEETS.clientas, row);
}

export async function appendPedido(row: SheetRow) {
  return appendCrmRow(IVETTE_SHEETS.pedidos, row);
}

export async function appendLead(row: SheetRow) {
  return appendCrmRow(IVETTE_SHEETS.leads, row);
}

export async function appendSeguimiento(row: SheetRow) {
  return appendCrmRow(IVETTE_SHEETS.seguimiento, row);
}

export async function appendPagoQuincenal(row: SheetRow) {
  return appendCrmRow(IVETTE_SHEETS.pagosQuincenales, row);
}

export async function appendProducto(row: SheetRow) {
  return appendCrmRow(IVETTE_SHEETS.productos, row);
}

export async function appendInventario(row: SheetRow) {
  return appendCrmRow(IVETTE_SHEETS.inventario, row);
}

export async function appendCampana(row: SheetRow) {
  return appendCrmRow(IVETTE_SHEETS.campanas, row);
}

export async function appendHistorialContacto(row: SheetRow) {
  return appendCrmRow(IVETTE_SHEETS.historialContacto, row);
}

export async function listContactos() {
  return readCrmRows(IVETTE_SHEETS.contactos);
}

export async function listClientas() {
  return readCrmRows(IVETTE_SHEETS.clientas);
}

export async function listPedidos() {
  return readCrmRows(IVETTE_SHEETS.pedidos);
}

export async function listLeads() {
  return readCrmRows(IVETTE_SHEETS.leads);
}

export async function listSeguimiento() {
  return readCrmRows(IVETTE_SHEETS.seguimiento);
}

export async function listPagosQuincenales() {
  return readCrmRows(IVETTE_SHEETS.pagosQuincenales);
}

export async function listProductos() {
  return readCrmRows(IVETTE_SHEETS.productos);
}

export async function listInventario() {
  return readCrmRows(IVETTE_SHEETS.inventario);
}

export async function updateContactoSeguimiento(input: {
  contactoId: string;
  nombre: string;
  telefono: string;
  estadoContacto: string;
  ultimaInteraccion: string;
  proximaAccion: string;
  notas: string;
  accion: string;
  proximaFecha: string;
  responsable: string;
}) {
  const { sheets, spreadsheetId } = await getSheetsClient();
  if (!sheets || !spreadsheetId) {
    throw new Error("Google Sheets is required to update contact follow-up.");
  }

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${IVETTE_SHEETS.contactos}!A:AZ`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const values = (response.data.values || []) as (string | number | boolean)[][];
  const headers = values[0] || [];
  const indexes = Object.fromEntries(headers.map((header, index) => [String(header), index]));
  const targetRowIndex = values.findIndex((row, index) => {
    if (index === 0) return false;
    return (
      String(row[indexes.id] || "") === input.contactoId ||
      String(row[indexes.telefono_normalizado] || "") === normalizePhone(input.telefono)
    );
  });

  if (targetRowIndex === -1) {
    throw new Error("Contact not found.");
  }

  const row = [...values[targetRowIndex]];
  while (row.length < headers.length) row.push("");
  if (indexes.estado_contacto !== undefined) row[indexes.estado_contacto] = input.estadoContacto;
  if (indexes.ultima_interaccion !== undefined) row[indexes.ultima_interaccion] = input.ultimaInteraccion;
  if (indexes.proxima_accion !== undefined) row[indexes.proxima_accion] = input.proximaAccion;
  if (indexes.notas !== undefined) row[indexes.notas] = input.notas;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${IVETTE_SHEETS.contactos}!A${targetRowIndex + 1}:AZ${targetRowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });

  await appendSeguimiento({
    id: `SEG-${Date.now()}`,
    fecha: input.ultimaInteraccion || todayInLaPaz(),
    contacto_id: input.contactoId,
    nombre: input.nombre,
    telefono: input.telefono,
    canal: "WhatsApp",
    accion: input.accion,
    estado: input.estadoContacto,
    proxima_fecha: input.proximaFecha,
    responsable: input.responsable,
    notas: input.notas,
  });

  return { ok: true };
}

export async function createStoreOrder(input: StoreOrderInput) {
  const fecha = todayInLaPaz();
  const pedidoId = `PED-${Date.now()}`;
  const leadId = `LEAD-${Date.now()}`;
  const contactoId = `CON-${Date.now()}`;
  const clienteId = `CLI-${Date.now()}`;
  const clienteNombre = [input.nombre, input.apellido].filter(Boolean).join(" ").trim();
  const zona = [input.provincia, input.municipio].filter(Boolean).join(" / ");
  const isPlan = isQuincenalPlan(input.modalidadPago);
  const isPayPal = input.metodoPago === "PayPal";
  const defaultEstado = isPayPal ? "Pendiente confirmación de pago" : "Nuevo";
  const plan = isPlan
    ? calculateQuincenalPlan(input.total, input.fechaEntrega || fecha)
    : null;
  const modalidadPago = plan?.modalidadPago || input.modalidadPago || "Pago Completo";
  const notas = [
    input.notas,
    input.email ? `Email: ${input.email}` : "",
    input.observaciones,
    input.utm_source ? `UTM: ${input.utm_source}/${input.utm_medium || ""}/${input.utm_campaign || ""}` : "",
  ]
    .filter(Boolean)
    .join(" | ");
  const whatsappUrl = buildWhatsAppUrl(input.whatsapp);

  await appendContacto({
    id: contactoId,
    nombre: clienteNombre,
    telefono: input.whatsapp,
    telefono_normalizado: normalizePhone(input.whatsapp),
    whatsapp_url: whatsappUrl,
    zona,
    etiqueta: isPlan ? "clienta_fiel_plan_quincenal" : "pedido_tienda",
    clienta_fiel: isPlan ? "TRUE" : "FALSE",
    cohorte: isPlan ? "clienta_fiel" : "tienda_online",
    origen: input.origen,
    estado_contacto: "Nuevo pedido",
    interes: input.itemsSummary,
    ultima_interaccion: fecha,
    proxima_accion: "Confirmar por WhatsApp",
    notas,
  });

  await appendClienta({
    id: clienteId,
    contacto_id: contactoId,
    nombre: clienteNombre,
    telefono: input.whatsapp,
    tipo_clienta: isPlan ? "Clienta fiel" : "Online",
    limite_credito: isPlan ? input.total : 0,
    puede_fiar: isPlan ? "TRUE" : "FALSE",
    estado: "Activa",
    fecha_creacion: fecha,
    notas: isPlan ? "Plan Quincenal Clienta Fiel activo" : notas,
  });

  await appendPedido({
    id: pedidoId,
    fecha,
    cliente_nombre: clienteNombre,
    cliente_telefono: input.whatsapp,
    productos: input.itemsSummary,
    subtotal: input.subtotal,
    descuento: input.discount || 0,
    total: input.total,
    metodo_pago: input.metodoPago,
    modalidad_pago: modalidadPago,
    estado_pedido: defaultEstado,
    origen: input.origen,
    direccion: input.direccion,
    zona,
    referencia: input.referencia || "",
    notas,
  });

  await appendLead({
    id: leadId,
    fecha,
    nombre: clienteNombre,
    telefono: input.whatsapp,
    origen: input.origen,
    producto_interes: input.itemsSummary,
    estado: defaultEstado,
    proxima_accion: isPayPal ? "Confirmar pago PayPal externo" : "Confirmar disponibilidad y pago",
    notas,
  });

  await appendSeguimiento({
    id: `SEG-${Date.now()}`,
    fecha,
    contacto_id: contactoId,
    nombre: clienteNombre,
    telefono: input.whatsapp,
    canal: "WhatsApp",
    accion: "Confirmar pedido",
    estado: "Pendiente",
    proxima_fecha: fecha,
    responsable: "Marcos / Ivette",
    notas,
  });

  await appendHistorialContacto({
    id: `HIS-${Date.now()}`,
    fecha,
    contacto_id: contactoId,
    nombre: clienteNombre,
    telefono: input.whatsapp,
    tipo_interaccion: "Pedido checkout",
    mensaje: input.itemsSummary,
    resultado: "Pedido registrado",
    proxima_accion: "Confirmar por WhatsApp",
    responsable: "Sistema",
    notas,
  });

  if (plan) {
    await appendPagoQuincenal({
      id: `PQ-${Date.now()}`,
      pedido_id: pedidoId,
      contacto_id: contactoId,
      cliente_nombre: clienteNombre,
      telefono: input.whatsapp,
      fecha_entrega: plan.fechaEntrega,
      monto_total: plan.montoTotal,
      cuota_1: plan.cuota1,
      fecha_cuota_1: plan.fechaCuota1,
      estado_cuota_1: plan.estadoCuota1,
      cuota_2: plan.cuota2,
      fecha_cuota_2: plan.fechaCuota2,
      estado_cuota_2: plan.estadoCuota2,
      saldo_pendiente: plan.saldoPendiente,
      estado_plan: plan.estadoPlan,
      notas,
    });
  }

  return {
    id: leadId,
    pedidoId,
    contactoId,
    clienteId,
    fecha,
    nombre: input.nombre,
    apellido: input.apellido || "",
    whatsapp: input.whatsapp,
    provincia: input.provincia,
    municipio: input.municipio || "",
    direccion: input.direccion,
    referencia: input.referencia || "",
    notas,
    itemsJson: input.itemsJson || "[]",
    itemsSummary: input.itemsSummary,
    subtotal: input.subtotal,
    tax: input.tax || 0,
    delivery: input.delivery || 0,
    total: input.total,
    canal: input.canal || "tienda_online",
    fuente: "tienda_online",
    origen: input.origen,
    metodoPago: input.metodoPago,
    origenLead: "tienda",
    estado: defaultEstado,
    modalidadPago,
    montoTotal: input.total,
    cuota1: plan?.cuota1 || 0,
    cuota2: plan?.cuota2 || 0,
    fechaCuota1: plan?.fechaCuota1 || "",
    fechaCuota2: plan?.fechaCuota2 || "",
    observaciones: input.observaciones || "",
    clienteFiel: isPlan ? "true" : "false",
    estadoPlan: plan?.estadoPlan || "",
  };
}

export async function updateQuincenalPayment(
  planId: string,
  amount: number,
  paidAt = todayInLaPaz()
) {
  const { sheets, spreadsheetId } = await getSheetsClient();
  if (!sheets || !spreadsheetId) {
    throw new Error("Google Sheets is required to update plan status safely.");
  }

  const sheetName = IVETTE_SHEETS.pagosQuincenales;
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:AZ`,
    valueRenderOption: "UNFORMATTED_VALUE",
  });
  const values = (response.data.values || []) as (string | number)[][];
  const headers = values[0] || [];
  const idIndex = headers.findIndex((header) => normalizeKey(String(header)) === "id");
  const saldoIndex = headers.findIndex((header) => normalizeKey(String(header)) === "saldo_pendiente");
  const estadoPlanIndex = headers.findIndex((header) => normalizeKey(String(header)) === "estado_plan");
  const estadoCuota1Index = headers.findIndex((header) => normalizeKey(String(header)) === "estado_cuota_1");
  const estadoCuota2Index = headers.findIndex((header) => normalizeKey(String(header)) === "estado_cuota_2");
  const notasIndex = headers.findIndex((header) => normalizeKey(String(header)) === "notas");

  const rowIndex = values.findIndex((row, index) => index > 0 && String(row[idIndex] || "") === planId);
  if (rowIndex === -1) throw new Error("Plan not found.");

  const row = [...values[rowIndex]];
  while (row.length < headers.length) row.push("");

  if (saldoIndex !== -1) {
    const currentSaldo = toMoney(row[saldoIndex]);
    const newSaldo = Math.max(roundMoney(currentSaldo - amount), 0);
    row[saldoIndex] = newSaldo;

    if (newSaldo <= 0) {
      if (estadoCuota1Index !== -1) row[estadoCuota1Index] = "Pagada";
      if (estadoCuota2Index !== -1) row[estadoCuota2Index] = "Pagada";
      if (estadoPlanIndex !== -1) row[estadoPlanIndex] = "Completado";
    } else if (estadoCuota1Index !== -1 && row[estadoCuota1Index] !== "Pagada") {
      row[estadoCuota1Index] = "Pagada";
      if (estadoPlanIndex !== -1) row[estadoPlanIndex] = "Cuota 2 pendiente";
    }
  }

  if (notasIndex !== -1) {
    const previous = String(row[notasIndex] || "");
    row[notasIndex] = [previous, `Abono registrado ${paidAt}: ${amount}`]
      .filter(Boolean)
      .join(" | ");
  }

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `${sheetName}!A${rowIndex + 1}:AZ${rowIndex + 1}`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });

  return { updatedSaldo: saldoIndex !== -1 ? toMoney(row[saldoIndex]) : 0, estadoPlan: estadoPlanIndex !== -1 ? String(row[estadoPlanIndex]) : "" };
}
