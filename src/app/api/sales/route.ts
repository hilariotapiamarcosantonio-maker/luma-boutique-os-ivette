import { NextResponse } from "next/server";
import { addSale, addPaymentInterval } from "@/lib/sheets-actions";

function todayInLaPaz() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "America/La_Paz",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((part) => part.type === type)?.value;

  return `${get("year")}-${get("month")}-${get("day")}`;
}

export async function POST(request: Request) {
  try {
    const data = await request.json();

    const requiredFields = [
      "nombre",
      "apellido",
      "whatsapp",
      "provincia",
      "producto",
      "promotor",
      "total_venta",
    ];
    const missing = requiredFields.filter((field) => !data[field]);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const fechaVenta = todayInLaPaz();
    const maximoCuotas = Math.min(Math.max(Number(data.maximo_cuotas) || 2, 2), 4);
    const cicloPago: "quincenal" | "mensual" =
      data.ciclo_pago === "mensual" ? "mensual" : "quincenal";
    const fechaProximoPago =
      data.fecha_proximo_pago || addPaymentInterval(new Date(), "quincenal");

    const newSale = {
      venta_id: `V-${Date.now()}`,
      cliente_id: data.cliente_id || `C-${Date.now()}`,
      nombre: String(data.nombre).trim(),
      apellido: String(data.apellido).trim(),
      whatsapp: String(data.whatsapp).trim(),
      provincia: String(data.provincia).trim(),
      producto: String(data.producto).trim(),
      promotor: String(data.promotor).trim(),
      cedula: String(data.cedula || "").trim(),
      fecha_venta: fechaVenta,
      fecha_proximo_pago: fechaProximoPago,
      total_venta: Number(data.total_venta),
      cuotas_pagadas: 0,
      maximo_cuotas: maximoCuotas,
      ciclo_pago: cicloPago,
    };

    await addSale(newSale);

    return NextResponse.json({ success: true, sale: newSale });
  } catch (error) {
    console.error("Error adding sale:", error);
    return NextResponse.json(
      { error: "Error interno al guardar la venta" },
      { status: 500 }
    );
  }
}
