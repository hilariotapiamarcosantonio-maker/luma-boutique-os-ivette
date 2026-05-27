import "server-only";

import {
  listContactos,
  listPagosQuincenales,
  listPedidos,
} from "@/lib/ivette-crm";

type RawRow = Record<string, string | number | boolean>;

export interface AdminLead {
  id: string;
  fecha: string;
  nombre: string;
  apellido: string;
  whatsapp: string;
  email?: string;
  provincia: string;
  municipio?: string;
  direccion: string;
  referencia?: string;
  notas: string;
  producto?: string;
  cantidad?: number;
  deliveryMethod?: string;
  googleMapsUrl?: string;
  itemsJson?: string;
  itemsSummary?: string;
  subtotal?: number;
  tax?: number;
  delivery?: number;
  total?: number;
  canal: string;
  fuente: string;
  origen: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  metodoPago?: string;
  origenLead?: string;
  estado: string;
  modalidadPago?: string;
  montoTotal?: number;
  cuota1?: number;
  cuota2?: number;
  fechaCuota1?: string;
  fechaCuota2?: string;
  observaciones?: string;
  clienteFiel?: string;
  estadoPlan?: string;
}

export interface AdminContact {
  id: string;
  nombre: string;
  telefono: string;
  telefonoNormalizado: string;
  etiqueta: string;
  origen: string;
  notas: string;
  clientaFiel: boolean;
  cohortes: string;
  estadoContacto: string;
  interes: string;
  ultimaInteraccion: string;
  proximaAccion: string;
}

export interface AdminContactsResult {
  contacts: AdminContact[];
  source: "google-sheets" | "local-fallback";
}

function read(row: RawRow | undefined, key: string) {
  return String(row?.[key] ?? "");
}

function readNumber(row: RawRow | undefined, key: string) {
  const number = Number(String(row?.[key] ?? "").replace(/[^0-9.-]+/g, ""));
  return Number.isFinite(number) ? number : 0;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  return {
    nombre: parts[0] || "",
    apellido: parts.slice(1).join(" "),
  };
}

export async function getAdminLeads(): Promise<AdminLead[]> {
  const [pedidos, pagos] = await Promise.all([listPedidos(), listPagosQuincenales()]);
  const pagosByPedido = new Map(pagos.rows.map((row) => [read(row, "pedido_id"), row]));

  return pedidos.rows
    .map((pedido) => {
      const plan = pagosByPedido.get(read(pedido, "id"));
      const fullName = read(pedido, "cliente_nombre");
      const { nombre, apellido } = splitName(fullName);
      const zona = read(pedido, "zona");

      return {
        id: read(pedido, "id"),
        fecha: read(pedido, "fecha"),
        nombre,
        apellido,
        whatsapp: read(pedido, "cliente_telefono"),
        provincia: zona,
        municipio: "",
        direccion: read(pedido, "direccion"),
        referencia: read(pedido, "referencia"),
        notas: read(pedido, "notas"),
        deliveryMethod: "delivery_coordinado",
        itemsJson: "[]",
        itemsSummary: read(pedido, "productos"),
        subtotal: readNumber(pedido, "subtotal"),
        tax: 0,
        delivery: 0,
        total: readNumber(pedido, "total"),
        canal: "tienda_online",
        fuente: read(pedido, "origen"),
        origen: read(pedido, "origen"),
        utm_source: "",
        utm_medium: "",
        utm_campaign: "",
        utm_content: "",
        utm_term: "",
        metodoPago: read(pedido, "metodo_pago"),
        origenLead: "tienda",
        estado: read(pedido, "estado_pedido") || "Nuevo",
        modalidadPago: read(pedido, "modalidad_pago"),
        montoTotal: readNumber(pedido, "total"),
        cuota1: readNumber(plan, "cuota_1"),
        cuota2: readNumber(plan, "cuota_2"),
        fechaCuota1: read(plan, "fecha_cuota_1"),
        fechaCuota2: read(plan, "fecha_cuota_2"),
        observaciones: read(pedido, "notas"),
        clienteFiel: plan ? "true" : "false",
        estadoPlan: read(plan, "estado_plan"),
      };
    })
    .reverse();
}

export async function getAdminContactsResult(): Promise<AdminContactsResult> {
  const contactos = await listContactos();

  return {
    source: contactos.source,
    contacts: contactos.rows.map((contacto) => ({
    id: read(contacto, "id"),
    nombre: read(contacto, "nombre"),
    telefono: read(contacto, "telefono"),
    telefonoNormalizado: read(contacto, "telefono_normalizado"),
    etiqueta: read(contacto, "etiqueta"),
    origen: read(contacto, "origen"),
    notas: read(contacto, "notas"),
    clientaFiel: ["true", "si", "sí", "1"].includes(
      read(contacto, "clienta_fiel").toLowerCase()
    ),
    cohortes: read(contacto, "cohorte"),
    estadoContacto: read(contacto, "estado_contacto"),
    interes: read(contacto, "interes"),
    ultimaInteraccion: read(contacto, "ultima_interaccion"),
    proximaAccion: read(contacto, "proxima_accion"),
    })),
  };
}

export async function getAdminContacts(): Promise<AdminContact[]> {
  const result = await getAdminContactsResult();
  return result.contacts;
}
