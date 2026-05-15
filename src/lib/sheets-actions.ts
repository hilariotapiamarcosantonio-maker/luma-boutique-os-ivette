import { getSheetsClient } from "./google-sheets";

const SHEETS = {
  sales: "Ventas_y_Entregas",
  receivables: "Cuentas_por_Cobrar",
} as const;

type SheetValue = string | number;
type SheetRow = Record<string, SheetValue | undefined>;
type PaymentCycle = "quincenal" | "mensual";

const FIELD_ALIASES: Record<string, string[]> = {
  venta_id: ["venta_id", "Venta_ID", "Venta ID"],
  cxc_id: ["cxc_id", "CXC_ID", "CXC ID"],
  cliente_id: ["cliente_id", "Cliente_ID", "Cliente ID"],
  fecha_registro: ["fecha_registro", "Fecha_Registro", "Fecha Registro"],
  fecha_venta: ["fecha_venta", "Fecha_Venta", "Fecha Venta"],
  fecha_entrega: ["fecha_entrega", "Fecha_Entrega", "Fecha Entrega"],
  fecha_cobro: ["fecha_cobro", "Fecha_Cobro", "Fecha Cobro"],
  fecha_proximo_pago: [
    "fecha_proximo_pago",
    "Fecha_Proximo_Pago",
    "Fecha Proximo Pago",
    "Fecha Próximo Pago",
  ],
  provincia: ["provincia", "Provincia"],
  nombre: ["nombre", "Nombre"],
  apellido: ["apellido", "Apellido"],
  nombre_cliente: ["nombre_cliente", "Nombre_Cliente", "Nombre Cliente", "Cliente"],
  whatsapp: ["whatsapp", "WhatsApp", "Telefono", "Teléfono"],
  direccion: ["direccion", "Direccion", "Dirección"],
  cedula: ["cedula", "Cedula", "Cédula"],
  producto: ["producto", "Producto", "linea_vendida", "Linea_Vendida", "Línea_Vendida"],
  linea_vendida: ["linea_vendida", "Linea_Vendida", "Línea_Vendida", "producto", "Producto"],
  familia_producto: ["familia_producto", "Familia_Producto", "Familia Producto"],
  otros_productos: ["otros_productos", "Otros_Productos", "Otros Productos"],
  total_venta: ["total_venta", "Total_Venta", "Total Venta", "monto", "Monto"],
  total_abonado: ["total_abonado", "Total_Abonado", "Total Abonado"],
  monto_abonado_1: ["monto_abonado_1", "Monto_Abonado_1", "Monto Abonado 1"],
  monto_abonado_2: ["monto_abonado_2", "Monto_Abonado_2", "Monto Abonado 2"],
  monto_restante: ["monto_restante", "Monto_Restante", "Monto Restante", "saldo_pendiente"],
  saldo_pendiente: ["saldo_pendiente", "Saldo_Pendiente", "Saldo Pendiente", "monto_restante"],
  pagos_pendientes: ["pagos_pendientes", "Pagos_Pendientes", "Pagos Pendientes"],
  cuotas_pagadas: ["cuotas_pagadas", "Cuotas_Pagadas", "Cuotas Pagadas"],
  maximo_cuotas: ["maximo_cuotas", "Maximo_Cuotas", "Máximo_Cuotas", "Maximo Cuotas"],
  ciclo_pago: ["ciclo_pago", "Ciclo_Pago", "Ciclo Pago"],
  estado: ["estado", "Estado"],
  estado_cobro: ["estado_cobro", "Estado_Cobro", "Estado Cobro"],
  promotor: ["promotor", "Promotor"],
  dias_vencido: ["dias_vencido", "Dias_Vencido", "Días_Vencido"],
  fuente: ["fuente", "Fuente"],
  fuente_archivo: ["fuente_archivo", "Fuente_Archivo", "Fuente Archivo"],
  fuente_hoja: ["fuente_hoja", "Fuente_Hoja", "Fuente Hoja"],
  fila_origen: ["fila_origen", "Fila_Origen", "Fila Origen"],
  fuentes_consolidadas: [
    "fuentes_consolidadas",
    "Fuentes_Consolidadas",
    "Fuentes Consolidadas",
  ],
};

function normalizeKey(key: string) {
  return key
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toLowerCase();
}

function columnLetter(index: number) {
  let letter = "";
  let current = index + 1;

  while (current > 0) {
    const remainder = (current - 1) % 26;
    letter = String.fromCharCode(65 + remainder) + letter;
    current = Math.floor((current - 1) / 26);
  }

  return letter;
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function addPaymentInterval(
  baseDate: Date,
  cycle: PaymentCycle = "quincenal"
) {
  const next = new Date(baseDate);

  if (cycle === "mensual") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setDate(next.getDate() + 15);
  }

  return toDateInput(next);
}

function readCell(row: (string | number)[], headers: string[], aliases: string[]) {
  const normalizedAliases = new Set(aliases.map(normalizeKey));
  const index = headers.findIndex((header) =>
    normalizedAliases.has(normalizeKey(header))
  );

  return index === -1 ? "" : row[index] ?? "";
}

function findHeaderIndex(headers: string[], aliases: string[]) {
  const normalizedAliases = new Set(aliases.map(normalizeKey));
  return headers.findIndex((header) => normalizedAliases.has(normalizeKey(header)));
}

function resolveCanonicalField(header: string) {
  const normalizedHeader = normalizeKey(header);

  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some((alias) => normalizeKey(alias) === normalizedHeader)) {
      return field;
    }
  }

  return normalizedHeader;
}

function valueForHeader(header: string, row: SheetRow) {
  const canonical = resolveCanonicalField(header);
  const aliases = FIELD_ALIASES[canonical] ?? [canonical, header];

  for (const alias of [canonical, ...aliases, header]) {
    const value = row[alias];
    if (value !== undefined) return value;
  }

  return "";
}

async function getHeaders(sheetName: string) {
  const { sheets, spreadsheetId } = await getSheetsClient();
  if (!sheets || !spreadsheetId) throw new Error("Google Sheets not configured");

  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A1:AZ1`,
  });

  const headers = headerResponse.data.values?.[0] as string[] | undefined;
  if (!headers) throw new Error(`Could not read headers from ${sheetName}`);

  return { sheets, spreadsheetId, headers };
}

async function appendByHeaders(sheetName: string, data: SheetRow) {
  const { sheets, spreadsheetId, headers } = await getHeaders(sheetName);
  const newRow = headers.map((header) => valueForHeader(header, data));

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:A`,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [newRow],
    },
  });
}

export type NewSaleInput = {
  venta_id: string;
  cliente_id: string;
  nombre: string;
  apellido: string;
  whatsapp: string;
  provincia: string;
  producto: string;
  promotor: string;
  fecha_venta: string;
  fecha_proximo_pago: string;
  total_venta: number;
  cedula?: string;
  maximo_cuotas: number;
  cuotas_pagadas?: number;
  ciclo_pago?: PaymentCycle;
};

function buildSaleRows(saleData: NewSaleInput) {
  const cuotasPagadas = saleData.cuotas_pagadas ?? 0;
  const maximoCuotas = Math.min(Math.max(Number(saleData.maximo_cuotas) || 2, 2), 4);
  const totalVenta = Number(saleData.total_venta) || 0;
  const nombreCliente = [saleData.nombre, saleData.apellido].filter(Boolean).join(" ");
  const cicloPago = saleData.ciclo_pago ?? "quincenal";

  const shared: SheetRow = {
    venta_id: saleData.venta_id,
    cliente_id: saleData.cliente_id,
    fecha_registro: saleData.fecha_venta,
    fecha_venta: saleData.fecha_venta,
    fecha_entrega: saleData.fecha_venta,
    fecha_cobro: saleData.fecha_proximo_pago,
    fecha_proximo_pago: saleData.fecha_proximo_pago,
    provincia: saleData.provincia,
    nombre: saleData.nombre,
    apellido: saleData.apellido,
    nombre_cliente: nombreCliente,
    whatsapp: saleData.whatsapp,
    cedula: saleData.cedula ?? "",
    producto: saleData.producto,
    linea_vendida: saleData.producto,
    familia_producto: saleData.producto,
    total_venta: totalVenta,
    total_abonado: 0,
    monto_abonado_1: 0,
    monto_abonado_2: 0,
    monto_restante: totalVenta,
    saldo_pendiente: totalVenta,
    pagos_pendientes: `${maximoCuotas} cuotas`,
    cuotas_pagadas: cuotasPagadas,
    maximo_cuotas: maximoCuotas,
    ciclo_pago: cicloPago,
    promotor: saleData.promotor,
    fuente_archivo: "app:luma-route-os",
    fuente_hoja: "Nueva Venta",
    fila_origen: "",
    fuentes_consolidadas: "app:luma-route-os",
  };

  const receivable: SheetRow = {
    ...shared,
    cxc_id: `CXC-${Date.now()}`,
    saldo_pendiente: totalVenta,
    estado: totalVenta > 0 ? "Pendiente" : "Pagada",
    fuente: "app:luma-route-os",
    dias_vencido: "",
  };

  return { sale: { ...shared, estado_cobro: "Pendiente" }, receivable };
}

export async function addSale(saleData: NewSaleInput) {
  const rows = buildSaleRows(saleData);

  await appendByHeaders(SHEETS.sales, rows.sale);

  if (Number(saleData.total_venta) > 0) {
    await appendByHeaders(SHEETS.receivables, rows.receivable);
  }

  return true;
}

export async function updateReceivableAbono(
  cxcId: string,
  newAbono: number,
  cycle: PaymentCycle = "quincenal"
) {
  const { sheets, spreadsheetId } = await getSheetsClient();
  if (!sheets || !spreadsheetId) throw new Error("Google Sheets not configured");

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${SHEETS.receivables}!A:AZ`,
  });

  const rows = response.data.values;
  if (!rows || rows.length === 0) throw new Error("Empty receivables sheet");

  const headers = rows[0] as string[];
  const cxcIdIdx = findHeaderIndex(headers, FIELD_ALIASES.cxc_id);
  const abonoIdx = findHeaderIndex(headers, FIELD_ALIASES.total_abonado);
  const saldoIdx = findHeaderIndex(headers, FIELD_ALIASES.saldo_pendiente);
  const ventaTotalIdx = findHeaderIndex(headers, FIELD_ALIASES.total_venta);

  if (cxcIdIdx === -1 || abonoIdx === -1 || saldoIdx === -1 || ventaTotalIdx === -1) {
    throw new Error("Missing required columns in Cuentas_por_Cobrar");
  }

  let targetRowIdx = -1;
  let targetRow: (string | number)[] | null = null;

  for (let i = 1; i < rows.length; i += 1) {
    if (String(rows[i][cxcIdIdx]) === cxcId) {
      targetRowIdx = i;
      targetRow = rows[i] as (string | number)[];
      break;
    }
  }

  if (targetRowIdx === -1 || !targetRow) {
    throw new Error("Receivable not found");
  }

  const currentAbono = Number(
    String(targetRow[abonoIdx] ?? "").replace(/[^0-9.-]+/g, "")
  ) || 0;
  const totalVenta = Number(
    String(targetRow[ventaTotalIdx] ?? "").replace(/[^0-9.-]+/g, "")
  ) || 0;

  const updatedAbono = currentAbono + newAbono;
  const updatedSaldo = Math.max(totalVenta - updatedAbono, 0);

  const cuotasIdx = findHeaderIndex(headers, FIELD_ALIASES.cuotas_pagadas);
  const maxCuotasIdx = findHeaderIndex(headers, FIELD_ALIASES.maximo_cuotas);
  const fechaProximoPagoIdx = findHeaderIndex(headers, FIELD_ALIASES.fecha_proximo_pago);
  const fechaCobroIdx = findHeaderIndex(headers, FIELD_ALIASES.fecha_cobro);
  const cicloPagoIdx = findHeaderIndex(headers, FIELD_ALIASES.ciclo_pago);
  const estadoIdx = findHeaderIndex(headers, FIELD_ALIASES.estado);

  const currentCuotas = Number(
    String(
      cuotasIdx === -1
        ? readCell(targetRow, headers, FIELD_ALIASES.cuotas_pagadas)
        : targetRow[cuotasIdx] ?? ""
    ).replace(/[^0-9.-]+/g, "")
  ) || 0;
  const maximoCuotas =
    Number(
      String(
        maxCuotasIdx === -1
          ? readCell(targetRow, headers, FIELD_ALIASES.maximo_cuotas)
          : targetRow[maxCuotasIdx] ?? ""
      ).replace(/[^0-9.-]+/g, "")
    ) || 2;
  const updatedCuotas = currentCuotas + 1;
  const reachedLimit = updatedCuotas >= maximoCuotas;
  const nextPaymentDate =
    updatedSaldo > 0 && !reachedLimit
      ? addPaymentInterval(new Date(), cycle)
      : "";

  const rowNumber = targetRowIdx + 1;
  const newRowData = [...targetRow];
  while (newRowData.length < headers.length) newRowData.push("");

  newRowData[abonoIdx] = updatedAbono.toString();
  newRowData[saldoIdx] = updatedSaldo.toString();
  if (cuotasIdx !== -1) newRowData[cuotasIdx] = updatedCuotas.toString();
  if (fechaProximoPagoIdx !== -1) newRowData[fechaProximoPagoIdx] = nextPaymentDate;
  if (fechaCobroIdx !== -1) newRowData[fechaCobroIdx] = nextPaymentDate;
  if (cicloPagoIdx !== -1) newRowData[cicloPagoIdx] = cycle;
  if (estadoIdx !== -1) {
    newRowData[estadoIdx] =
      updatedSaldo <= 0
        ? "Pagada"
        : reachedLimit
          ? "Maximo cuotas alcanzado"
          : "Pendiente";
  }

  const updateRange = `${SHEETS.receivables}!A${rowNumber}:${columnLetter(headers.length - 1)}${rowNumber}`;

  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: updateRange,
    valueInputOption: "USER_ENTERED",
    requestBody: {
      values: [newRowData],
    },
  });

  return {
    updatedAbono,
    updatedSaldo,
    updatedCuotas,
    nextPaymentDate,
    maximoCuotas,
  };
}
