export interface BusinessConfig {
  planQuincenalMaxDays: number;
  planQuincenalInstallments: number;
  defaultResponsible: string;
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
  responsable: string;
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
  responsablePrincipal: string;
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
  responsable: string;
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
  byResponsable: {
    responsable: string;
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
