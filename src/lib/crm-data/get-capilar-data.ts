import "server-only";

import {
  listClientas,
  listPagosQuincenales,
  listPedidos,
  listProductos,
  ensureSheetHeaders,
} from "@/lib/ivette-crm";
import {
  BusinessConfig,
  CapilarClient,
  CapilarDashboardData,
  CapilarProduct,
  CapilarReceivable,
  CapilarSale,
} from "@/types/crm";

const FILL_COLORS = [
  "#315D91",
  "#2BAE9E",
  "#2A8C95",
  "#B8860B",
  "#61498A",
  "#2F7D52",
  "#AA4C4C",
];

type RawRow = Record<string, string | number | boolean>;

function parseNumber(value: unknown) {
  const number = Number(String(value ?? "").replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function readString(row: RawRow | undefined, key: string) {
  return String(row?.[key] ?? "");
}

function readNumber(row: RawRow | undefined, key: string) {
  return parseNumber(row?.[key]);
}

function splitName(name: string) {
  const parts = name.trim().split(/\s+/);
  return {
    nombre: parts[0] || "",
    apellido: parts.slice(1).join(" "),
  };
}

function mapSale(row: RawRow, plan?: RawRow): CapilarSale {
  const nombreCliente = readString(row, "cliente_nombre");
  const { nombre, apellido } = splitName(nombreCliente);
  const totalVenta = readNumber(row, "total");
  const saldoPendiente = readString(row, "saldo_pendiente") !== ""
    ? readNumber(row, "saldo_pendiente")
    : (plan ? readNumber(plan, "saldo_pendiente") : 0);
  const totalAbonado = Math.max(totalVenta - saldoPendiente, 0);
  const fechaCuota1 = readString(plan, "fecha_cuota_1");
  const fechaCuota2 = readString(plan, "fecha_cuota_2");

  return {
    ventaId: readString(row, "id"),
    clienteId: readString(plan, "contacto_id"),
    fechaRegistro: readString(row, "fecha"),
    fechaVenta: readString(row, "fecha"),
    fechaEntrega: readString(plan, "fecha_entrega") || readString(row, "fecha"),
    fechaCobro: fechaCuota1,
    fechaProximoPago: fechaCuota1 || fechaCuota2,
    provincia: readString(row, "zona"),
    nombre,
    apellido,
    nombreCliente,
    whatsapp: readString(row, "cliente_telefono"),
    direccion: readString(row, "direccion"),
    cedula: "",
    producto: readString(row, "productos"),
    lineaVendida: readString(row, "productos"),
    familiaProducto: readString(row, "productos"),
    otrosProductos: "",
    totalVenta,
    pagosPendientes: plan ? "2 cuotas quincenales" : "",
    cuotasPagadas:
      readString(plan, "estado_plan") === "Completado"
        ? 2
        : readString(plan, "estado_cuota_1") === "Pagada"
          ? 1
          : 0,
    maximoCuotas: plan ? 2 : 0,
    cicloPago: plan ? "quincenal" : "",
    montoAbonado1: readString(plan, "estado_cuota_1") === "Pagada" ? readNumber(plan, "cuota_1") : 0,
    montoAbonado2: readString(plan, "estado_cuota_2") === "Pagada" ? readNumber(plan, "cuota_2") : 0,
    totalAbonado,
    montoRestante: saldoPendiente,
    estadoCobro: readString(row, "estado_pago") || (plan ? readString(plan, "estado_plan") : "Sin plan"),
    responsable: "Marcos / Ivette",
    fuenteArchivo: "google-sheets",
    fuenteHoja: "Pedidos",
    filaOrigen: "",
    fuentesConsolidadas: "Luma Boutique OS",
  };
}

function mapClient(row: RawRow): CapilarClient {
  return {
    clienteId: readString(row, "id"),
    nombreCliente: readString(row, "nombre"),
    whatsapp: readString(row, "telefono"),
    cedula: "",
    provincia: "",
    direccion: "",
    responsablePrincipal: "Marcos / Ivette",
    primeraEntrega: readString(row, "fecha_creacion"),
    ultimaEntrega: readString(row, "fecha_creacion"),
    ventasRegistradas: 0,
    totalCompras: 0,
    totalAbonado: 0,
    saldoPendiente: 0,
    fuentes: "Clientas",
  };
}

function mapProduct(row: RawRow): CapilarProduct {
  return {
    productoId: readString(row, "id"),
    nombreProducto: readString(row, "nombre"),
    familiaProducto: readString(row, "categoria"),
    lineaOriginal: readString(row, "nombre"),
    precioReferencia: readNumber(row, "precio"),
    cantidadDisponible: readString(row, "stock"),
    ventasRegistradas: readNumber(row, "stock"),
    fuente: "Productos",
    notas: readString(row, "notas"),
  };
}

function mapReceivable(row: RawRow): CapilarReceivable {
  const nombreCliente = readString(row, "cliente_nombre");
  const { nombre, apellido } = splitName(nombreCliente);
  const totalVenta = readNumber(row, "monto_total");
  const saldoPendiente = readNumber(row, "saldo_pendiente");

  return {
    cxcId: readString(row, "id"),
    ventaId: readString(row, "pedido_id"),
    clienteId: readString(row, "contacto_id"),
    nombre,
    apellido,
    nombreCliente,
    whatsapp: readString(row, "telefono"),
    provincia: "",
    direccion: "",
    producto: "",
    lineaVendida: "",
    fechaEntrega: readString(row, "fecha_entrega"),
    fechaCobro: readString(row, "fecha_cuota_1"),
    fechaProximoPago: readString(row, "fecha_cuota_1"),
    totalVenta,
    totalAbonado: Math.max(totalVenta - saldoPendiente, 0),
    saldoPendiente,
    pagosPendientes: "2 cuotas quincenales",
    cuotasPagadas:
      readString(row, "estado_plan") === "Completado"
        ? 2
        : readString(row, "estado_cuota_1") === "Pagada"
          ? 1
          : 0,
    maximoCuotas: 2,
    cicloPago: "quincenal",
    estado: readString(row, "estado_plan"),
    responsable: "Marcos / Ivette",
    diasVencido: "",
    fuente: "Pagos Quincenales",
  };
}

function groupByResponsible(sales: CapilarSale[]) {
  const grouped = new Map<
    string,
    {
      responsable: string;
      ventas: number;
      totalVenta: number;
      totalAbonado: number;
      saldoPendiente: number;
    }
  >();

  for (const sale of sales) {
    const key = sale.responsable || "Marcos / Ivette";
    const current =
      grouped.get(key) ||
      {
        responsable: key,
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

  return Array.from(grouped.values()).sort((a, b) => b.totalVenta - a.totalVenta);
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

const DEFAULT_CONFIG: BusinessConfig = {
  planQuincenalMaxDays: 30,
  planQuincenalInstallments: 2,
  defaultResponsible: "Marcos / Ivette",
};

export async function getCapilarData(): Promise<CapilarDashboardData> {
  // Ensure headers are migrated first (non-destructively)
  await Promise.all([
    ensureSheetHeaders("Pedidos"),
    ensureSheetHeaders("Pagos Quincenales"),
    ensureSheetHeaders("Historial de Contacto"),
  ]).catch((err) => {
    console.error("Failed to ensure CRM headers:", err);
  });

  const [pedidosTable, clientasTable, productosTable, pagosTable] =
    await Promise.all([
      listPedidos(),
      listClientas(),
      listProductos(),
      listPagosQuincenales(),
    ]);

  const pagosByPedido = new Map(
    pagosTable.rows.map((row) => [readString(row, "pedido_id"), row])
  );
  const sales = pedidosTable.rows.map((row) =>
    mapSale(row, pagosByPedido.get(readString(row, "id")))
  );
  const clients = clientasTable.rows.map(mapClient);
  const products = productosTable.rows.map(mapProduct);
  const receivables = pagosTable.rows.map(mapReceivable);
  const source =
    pedidosTable.source === "google-sheets" &&
    clientasTable.source === "google-sheets" &&
    productosTable.source === "google-sheets" &&
    pagosTable.source === "google-sheets"
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
    byResponsable: groupByResponsible(sales),
    sales,
    clients,
    products,
    receivables,
    source,
    config: DEFAULT_CONFIG,
  };
}
