import {
  addDaysToDateInput,
  createStoreOrder,
  todayInLaPaz,
  updateQuincenalPayment,
} from "./ivette-crm";

type PaymentCycle = "quincenal" | "mensual";

export type NewSaleInput = {
  venta_id?: string;
  cliente_id?: string;
  nombre: string;
  apellido?: string;
  whatsapp: string;
  provincia: string;
  producto: string;
  responsable?: string;
  fecha_venta?: string;
  fecha_proximo_pago?: string;
  total_venta: number;
  direccion?: string;
  referencia?: string;
  maximo_cuotas?: number;
  cuotas_pagadas?: number;
  ciclo_pago?: PaymentCycle;
  modalidad_pago?: string;
};

export function addPaymentInterval(baseDate: Date, cycle: PaymentCycle = "quincenal") {
  const dateInput = [
    baseDate.getFullYear(),
    String(baseDate.getMonth() + 1).padStart(2, "0"),
    String(baseDate.getDate()).padStart(2, "0"),
  ].join("-");

  return addDaysToDateInput(dateInput, cycle === "mensual" ? 30 : 15);
}

export async function addSale(saleData: NewSaleInput) {
  await createStoreOrder({
    nombre: saleData.nombre,
    apellido: saleData.apellido || "",
    whatsapp: saleData.whatsapp,
    provincia: saleData.provincia,
    municipio: "",
    direccion: saleData.direccion || "Pendiente de coordinar",
    referencia: saleData.referencia || "",
    notas: `Venta registrada desde admin${saleData.responsable ? ` por ${saleData.responsable}` : ""}`,
    itemsSummary: saleData.producto,
    subtotal: Number(saleData.total_venta) || 0,
    discount: 0,
    total: Number(saleData.total_venta) || 0,
    metodoPago: "Pendiente",
    modalidadPago:
      saleData.modalidad_pago ||
      (saleData.ciclo_pago === "quincenal"
        ? "Plan Quincenal Clienta Fiel"
        : "Pago Completo"),
    origen: "admin",
    canal: "admin",
    fechaEntrega: saleData.fecha_venta || todayInLaPaz(),
  });

  return true;
}

export async function updateReceivableAbono(
  planId: string,
  newAbono: number
) {
  return updateQuincenalPayment(planId, Number(newAbono) || 0);
}
