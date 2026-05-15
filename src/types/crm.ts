// ── Business Config (Pilar 1: Motor de Comisiones) ──────────────────────────
export interface BusinessConfig {
  comisionVentaPorcentaje: number;  // Legacy fallback, e.g. 0.05 = 5%
  comisionCobroPorcentaje: number;  // e.g. 0.03 = 3%
  bonoVentaContado: number;         // Legacy fixed bonus per cash sale
  metaSemanalLineas: number;        // Weekly line target
  comisionBasePorLinea: number;     // Fixed commission per line/product sold
  bonoMetaSemanal: number;          // Fixed bonus when weekly target is reached
}

export interface CapilarSale {
  ventaId: string;
  clienteId: string;
  fechaRegistro: string;
  fechaVenta: string;
  fechaEntrega: string;
  fechaCobro: string;
  fechaProximoPago: string;
  provincia: string;
  nombre: string;
  apellido: string;
  nombreCliente: string;
  whatsapp: string;
  direccion: string;
  cedula: string;
  producto: string;
  lineaVendida: string;
  familiaProducto: string;
  otrosProductos: string;
  totalVenta: number;
  pagosPendientes: string;
  cuotasPagadas: number;
  maximoCuotas: number;
  cicloPago: "quincenal" | "mensual" | string;
  montoAbonado1: number;
  montoAbonado2: number;
  totalAbonado: number;
  montoRestante: number;
  estadoCobro: string;
  promotor: string;
  fuenteArchivo: string;
  fuenteHoja: string;
  filaOrigen: string;
  fuentesConsolidadas: string;
}

export interface CapilarClient {
  clienteId: string;
  nombreCliente: string;
  whatsapp: string;
  cedula: string;
  provincia: string;
  direccion: string;
  promotorPrincipal: string;
  primeraEntrega: string;
  ultimaEntrega: string;
  ventasRegistradas: number;
  totalCompras: number;
  totalAbonado: number;
  saldoPendiente: number;
  fuentes: string;
}

export interface CapilarProduct {
  productoId: string;
  nombreProducto: string;
  familiaProducto: string;
  lineaOriginal: string;
  precioReferencia: number;
  cantidadDisponible: string;
  ventasRegistradas: number;
  fuente: string;
  notas: string;
}

export interface CapilarReceivable {
  cxcId: string;
  ventaId: string;
  clienteId: string;
  nombre: string;
  apellido: string;
  nombreCliente: string;
  whatsapp: string;
  provincia: string;
  direccion: string;
  producto: string;
  lineaVendida: string;
  fechaEntrega: string;
  fechaCobro: string;
  fechaProximoPago: string;
  totalVenta: number;
  totalAbonado: number;
  saldoPendiente: number;
  pagosPendientes: string;
  cuotasPagadas: number;
  maximoCuotas: number;
  cicloPago: "quincenal" | "mensual" | string;
  estado: string;
  promotor: string;
  diasVencido: string;
  fuente: string;
}

export interface CapilarDashboardData {
  totalVentas: number;
  totalAbonado: number;
  saldoPendiente: number;
  clientesActivos: number;
  ventasRegistradas: number;
  cuentasPorCobrar: number;
  lineasVendidas: number;
  byLinea: { name: string; value: number; fill: string }[];
  byPromotor: {
    promotor: string;
    ventas: number;
    totalVenta: number;
    totalAbonado: number;
    saldoPendiente: number;
  }[];
  sales: CapilarSale[];
  clients: CapilarClient[];
  products: CapilarProduct[];
  receivables: CapilarReceivable[];
  source: "google-sheets" | "local-fallback";
  config: BusinessConfig;
}
