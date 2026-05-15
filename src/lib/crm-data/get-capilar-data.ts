import "server-only";

import fs from "node:fs/promises";
import path from "node:path";
import { getSheetsClient } from "../google-sheets";
import {
  BusinessConfig,
  CapilarClient,
  CapilarDashboardData,
  CapilarProduct,
  CapilarReceivable,
  CapilarSale,
} from "@/types/crm";

const SHEETS = {
  products: "Inventario_Productos",
  clients: "Directorio_Clientes",
  sales: "Ventas_y_Entregas",
  receivables: "Cuentas_por_Cobrar",
  config: "Config_Negocio",
} as const;

const FILL_COLORS = [
  "#315D91",
  "#2BAE9E",
  "#2A8C95",
  "#B8860B",
  "#61498A",
  "#2F7D52",
  "#AA4C4C",
];

type RawTable = Record<string, string | number>[];

function parseNumber(value: unknown) {
  const text = String(value ?? "")
    .replace("RD$", "")
    .replace("$", "")
    .replace(/,/g, "")
    .trim();
  const number = Number(text);
  return Number.isFinite(number) ? number : 0;
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

function readValue(
  row: Record<string, string | number>,
  aliases: string[]
): string | number {
  for (const alias of aliases) {
    const direct = row[alias];
    if (direct !== undefined && String(direct).trim() !== "") return direct;
  }

  const normalizedAliases = new Set(aliases.map(normalizeKey));
  for (const [key, value] of Object.entries(row)) {
    if (normalizedAliases.has(normalizeKey(key)) && String(value).trim() !== "") {
      return value;
    }
  }

  return "";
}

function readString(row: Record<string, string | number>, aliases: string[]) {
  return String(readValue(row, aliases) || "");
}

function readNumber(row: Record<string, string | number>, aliases: string[]) {
  return parseNumber(readValue(row, aliases));
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

  return rows.filter((items) => items.some((item) => item !== ""));
}

function matrixToObjects(values: (string | number)[][]): RawTable {
  const [headers, ...rows] = values;
  if (!headers) return [];
  return rows
    .filter((row) => row.some((cell) => String(cell ?? "").trim()))
    .map((row) =>
      headers.reduce<Record<string, string | number>>((acc, header, index) => {
        const key = String(header);
        const value = row[index] ?? "";
        const current = acc[key];

        if (current === undefined || String(current).trim() === "") {
          acc[key] = value;
        }

        return acc;
      }, {})
    );
}

async function readLocalSheet(sheetName: string): Promise<RawTable> {
  const filePath = path.join(
    process.cwd(),
    "data",
    "luma_route_os",
    `${sheetName}.csv`
  );
  const text = await fs.readFile(filePath, "utf8");
  return matrixToObjects(parseCsv(text));
}

async function readSheetRange(sheetName: string): Promise<RawTable | null> {
  const { sheets, spreadsheetId } = await getSheetsClient();
  if (!sheets || !spreadsheetId) return null;

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:AZ1000`,
      valueRenderOption: "UNFORMATTED_VALUE",
    });
    return matrixToObjects((response.data.values || []) as (string | number)[][]);
  } catch (error) {
    const status =
      typeof error === "object" && error && "status" in error
        ? String((error as { status?: unknown }).status)
        : "sin status";
    console.warn(
      `No se pudo leer ${sheetName} desde Google Sheets (${status}); usando fallback local.`
    );
    return null;
  }
}

async function readTable(sheetName: string) {
  const remoteRows = await readSheetRange(sheetName);
  if (remoteRows) {
    return { rows: remoteRows, source: "google-sheets" as const };
  }
  return {
    rows: await readLocalSheet(sheetName),
    source: "local-fallback" as const,
  };
}

function mapSale(row: Record<string, string | number>): CapilarSale {
  const nombre = readString(row, ["nombre", "Nombre"]);
  const apellido = readString(row, ["apellido", "Apellido"]);
  const nombreCliente =
    readString(row, ["nombre_cliente", "Nombre_Cliente", "Cliente"]) ||
    [nombre, apellido].filter(Boolean).join(" ");
  const producto = readString(row, [
    "producto",
    "Producto",
    "linea_vendida",
    "Linea_Vendida",
    "Línea_Vendida",
  ]);
  const fechaProximoPago = readString(row, [
    "fecha_proximo_pago",
    "Fecha_Proximo_Pago",
    "fecha_cobro",
    "Fecha_Cobro",
  ]);

  return {
    ventaId: readString(row, ["venta_id", "Venta_ID"]),
    clienteId: readString(row, ["cliente_id", "Cliente_ID"]),
    fechaRegistro: readString(row, ["fecha_registro", "Fecha_Registro"]),
    fechaVenta: readString(row, ["fecha_venta", "Fecha_Venta", "fecha_registro"]),
    fechaEntrega: readString(row, ["fecha_entrega", "Fecha_Entrega"]),
    fechaCobro: readString(row, ["fecha_cobro", "Fecha_Cobro"]),
    fechaProximoPago,
    provincia: readString(row, ["provincia", "Provincia"]),
    nombre,
    apellido,
    nombreCliente,
    whatsapp: readString(row, ["whatsapp", "WhatsApp", "telefono", "Telefono"]),
    direccion: readString(row, ["direccion", "Direccion", "Dirección"]),
    cedula: readString(row, ["cedula", "Cedula", "Cédula"]),
    producto,
    lineaVendida: producto,
    familiaProducto: readString(row, ["familia_producto", "Familia_Producto"]) || producto,
    otrosProductos: readString(row, ["otros_productos", "Otros_Productos"]),
    totalVenta: readNumber(row, ["total_venta", "Total_Venta", "monto", "Monto"]),
    pagosPendientes: readString(row, ["pagos_pendientes", "Pagos_Pendientes"]),
    cuotasPagadas: readNumber(row, ["cuotas_pagadas", "Cuotas_Pagadas"]),
    maximoCuotas: readNumber(row, ["maximo_cuotas", "Maximo_Cuotas", "Máximo_Cuotas"]),
    cicloPago:
      readString(row, ["ciclo_pago", "Ciclo_Pago", "ciclo"]) || "quincenal",
    montoAbonado1: readNumber(row, ["monto_abonado_1", "Monto_Abonado_1"]),
    montoAbonado2: readNumber(row, ["monto_abonado_2", "Monto_Abonado_2"]),
    totalAbonado: readNumber(row, ["total_abonado", "Total_Abonado"]),
    montoRestante: readNumber(row, ["monto_restante", "Monto_Restante", "saldo_pendiente"]),
    estadoCobro: readString(row, ["estado_cobro", "Estado_Cobro"]),
    promotor: readString(row, ["promotor", "Promotor"]) || "Sin promotor",
    fuenteArchivo: readString(row, ["fuente_archivo", "Fuente_Archivo"]),
    fuenteHoja: readString(row, ["fuente_hoja", "Fuente_Hoja"]),
    filaOrigen: readString(row, ["fila_origen", "Fila_Origen"]),
    fuentesConsolidadas: readString(row, ["fuentes_consolidadas", "Fuentes_Consolidadas"]),
  };
}

function mapClient(row: Record<string, string | number>): CapilarClient {
  return {
    clienteId: String(row.cliente_id || ""),
    nombreCliente: String(row.nombre_cliente || ""),
    whatsapp: String(row.whatsapp || ""),
    cedula: String(row.cedula || ""),
    provincia: String(row.provincia || ""),
    direccion: String(row.direccion || ""),
    promotorPrincipal: String(row.promotor_principal || ""),
    primeraEntrega: String(row.primera_entrega || ""),
    ultimaEntrega: String(row.ultima_entrega || ""),
    ventasRegistradas: parseNumber(row.ventas_registradas),
    totalCompras: parseNumber(row.total_compras),
    totalAbonado: parseNumber(row.total_abonado),
    saldoPendiente: parseNumber(row.saldo_pendiente),
    fuentes: String(row.fuentes || ""),
  };
}

function mapProduct(row: Record<string, string | number>): CapilarProduct {
  return {
    productoId: String(row.producto_id || ""),
    nombreProducto: String(row.nombre_producto || ""),
    familiaProducto: String(row.familia_producto || ""),
    lineaOriginal: String(row.linea_original || ""),
    precioReferencia: parseNumber(row.precio_referencia),
    cantidadDisponible: String(row.cantidad_disponible || ""),
    ventasRegistradas: parseNumber(row.ventas_registradas),
    fuente: String(row.fuente || ""),
    notas: String(row.notas || ""),
  };
}

function mapReceivable(row: Record<string, string | number>): CapilarReceivable {
  const nombre = readString(row, ["nombre", "Nombre"]);
  const apellido = readString(row, ["apellido", "Apellido"]);
  const nombreCliente =
    readString(row, ["nombre_cliente", "Nombre_Cliente", "Cliente"]) ||
    [nombre, apellido].filter(Boolean).join(" ");
  const producto = readString(row, [
    "producto",
    "Producto",
    "linea_vendida",
    "Linea_Vendida",
    "Línea_Vendida",
  ]);
  const fechaProximoPago = readString(row, [
    "fecha_proximo_pago",
    "Fecha_Proximo_Pago",
    "fecha_cobro",
    "Fecha_Cobro",
  ]);

  return {
    cxcId: readString(row, ["cxc_id", "CXC_ID"]),
    ventaId: readString(row, ["venta_id", "Venta_ID"]),
    clienteId: readString(row, ["cliente_id", "Cliente_ID"]),
    nombre,
    apellido,
    nombreCliente,
    whatsapp: readString(row, ["whatsapp", "WhatsApp", "telefono", "Telefono"]),
    provincia: readString(row, ["provincia", "Provincia"]),
    direccion: readString(row, ["direccion", "Direccion", "Dirección"]),
    producto,
    lineaVendida: producto,
    fechaEntrega: readString(row, ["fecha_entrega", "Fecha_Entrega"]),
    fechaCobro: readString(row, ["fecha_cobro", "Fecha_Cobro"]),
    fechaProximoPago,
    totalVenta: readNumber(row, ["total_venta", "Total_Venta", "monto", "Monto"]),
    totalAbonado: readNumber(row, ["total_abonado", "Total_Abonado"]),
    saldoPendiente: readNumber(row, ["saldo_pendiente", "Saldo_Pendiente"]),
    pagosPendientes: readString(row, ["pagos_pendientes", "Pagos_Pendientes"]),
    cuotasPagadas: readNumber(row, ["cuotas_pagadas", "Cuotas_Pagadas"]),
    maximoCuotas: readNumber(row, ["maximo_cuotas", "Maximo_Cuotas", "Máximo_Cuotas"]),
    cicloPago:
      readString(row, ["ciclo_pago", "Ciclo_Pago", "ciclo"]) || "quincenal",
    estado: readString(row, ["estado", "Estado"]),
    promotor: readString(row, ["promotor", "Promotor"]) || "Sin promotor",
    diasVencido: readString(row, ["dias_vencido", "Dias_Vencido", "Días_Vencido"]),
    fuente: readString(row, ["fuente", "Fuente"]),
  };
}

function groupByPromotor(sales: CapilarSale[]) {
  const grouped = new Map<
    string,
    {
      promotor: string;
      ventas: number;
      totalVenta: number;
      totalAbonado: number;
      saldoPendiente: number;
    }
  >();

  for (const sale of sales) {
    const key = sale.promotor || "Sin promotor";
    const current =
      grouped.get(key) ||
      {
        promotor: key,
        ventas: 0,
        totalVenta: 0,
        totalAbonado: 0,
        saldoPendiente: 0,
      };
    current.ventas += 1;
    current.totalVenta += sale.totalVenta;
    current.totalAbonado += sale.totalAbonado;
    current.saldoPendiente += sale.montoRestante;
    grouped.set(key, current);
  }

  return Array.from(grouped.values()).sort(
    (a, b) => b.totalVenta - a.totalVenta
  );
}

function groupByLinea(products: CapilarProduct[]) {
  return products
    .filter((product) => product.ventasRegistradas > 0)
    .sort((a, b) => b.ventasRegistradas - a.ventasRegistradas)
    .slice(0, 7)
    .map((product, index) => ({
      name: product.nombreProducto,
      value: product.ventasRegistradas,
      fill: FILL_COLORS[index % FILL_COLORS.length],
    }));
}

export function formatDop(value: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  }).format(value);
}

// ── Business Config Reader (Pilar 1) ──────────────────────────────
const DEFAULT_CONFIG: BusinessConfig = {
  comisionVentaPorcentaje: 0.05,
  comisionCobroPorcentaje: 0.03,
  bonoVentaContado: 200,
  metaSemanalLineas: 20,
  comisionBasePorLinea: 450,
  bonoMetaSemanal: 1000,
};

async function readBusinessConfig(): Promise<BusinessConfig> {
  try {
    const remoteRows = await readSheetRange(SHEETS.config);
    const rows = remoteRows ?? [];
    const map = Object.fromEntries(
      rows.map((r) => [
        String(r["variable"] ?? "").trim(),
        parseNumber(r["valor"]),
      ])
    );
    return {
      comisionVentaPorcentaje: map["Comision_Venta_Porcentaje"] ?? DEFAULT_CONFIG.comisionVentaPorcentaje,
      comisionCobroPorcentaje: map["Comision_Cobro_Porcentaje"] ?? DEFAULT_CONFIG.comisionCobroPorcentaje,
      bonoVentaContado: map["Bono_Venta_Contado"] ?? DEFAULT_CONFIG.bonoVentaContado,
      metaSemanalLineas: map["Meta_Semanal_Lineas"] ?? DEFAULT_CONFIG.metaSemanalLineas,
      comisionBasePorLinea: map["Comision_Base_Por_Linea"] ?? DEFAULT_CONFIG.comisionBasePorLinea,
      bonoMetaSemanal: map["Bono_Meta_Semanal"] ?? DEFAULT_CONFIG.bonoMetaSemanal,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export async function getCapilarData(): Promise<CapilarDashboardData> {
  const [salesTable, clientsTable, productsTable, receivablesTable, config] =
    await Promise.all([
      readTable(SHEETS.sales),
      readTable(SHEETS.clients),
      readTable(SHEETS.products),
      readTable(SHEETS.receivables),
      readBusinessConfig(),
    ]);

  const sales = salesTable.rows.map(mapSale);
  const clients = clientsTable.rows.map(mapClient);
  const products = productsTable.rows.map(mapProduct);
  const receivables = receivablesTable.rows.map(mapReceivable);
  const source =
    salesTable.source === "google-sheets" &&
    clientsTable.source === "google-sheets" &&
    productsTable.source === "google-sheets" &&
    receivablesTable.source === "google-sheets"
      ? "google-sheets"
      : "local-fallback";

  return {
    totalVentas: sales.reduce((sum, sale) => sum + sale.totalVenta, 0),
    totalAbonado: sales.reduce((sum, sale) => sum + sale.totalAbonado, 0),
    saldoPendiente: sales.reduce((sum, sale) => sum + sale.montoRestante, 0),
    clientesActivos: clients.length,
    ventasRegistradas: sales.length,
    cuentasPorCobrar: receivables.length,
    lineasVendidas: products.reduce(
      (sum, product) => sum + product.ventasRegistradas,
      0
    ),
    byLinea: groupByLinea(products),
    byPromotor: groupByPromotor(sales),
    sales,
    clients,
    products,
    receivables,
    source,
    config,
  };
}
