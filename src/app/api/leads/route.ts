import { NextResponse } from "next/server";
import { createStoreOrder } from "@/lib/ivette-crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const requiredFields = [
      "nombre",
      "whatsapp",
      "provincia",
      "municipio",
      "direccion",
      "referencia",
      "itemsSummary",
      "total",
    ];
    const missing = requiredFields.filter((field) => !data[field]);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos obligatorios: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const lead = await createStoreOrder({
      nombre: String(data.nombre).trim(),
      apellido: String(data.apellido || "").trim(),
      whatsapp: String(data.whatsapp).trim(),
      email: String(data.email || "").trim(),
      provincia: String(data.provincia).trim(),
      municipio: String(data.municipio || "").trim(),
      direccion: String(data.direccion).trim(),
      referencia: String(data.referencia || "").trim(),
      notas: String(data.notas || "").trim(),
      itemsJson: String(data.itemsJson || "[]").trim(),
      itemsSummary: String(data.itemsSummary).trim(),
      subtotal: Number(data.subtotal) || 0,
      tax: Number(data.tax) || 0,
      delivery: Number(data.delivery) || 0,
      discount: Number(data.discount) || 0,
      total: Number(data.total) || 0,
      metodoPago: String(data.metodoPago || "Transferencia").trim(),
      modalidadPago: String(data.modalidadPago || "Pago Completo").trim(),
      origen: String(data.origen || "tienda_boutique").trim(),
      canal: String(data.canal || "tienda_online").trim(),
      utm_source: String(data.utm_source || "").trim(),
      utm_medium: String(data.utm_medium || "").trim(),
      utm_campaign: String(data.utm_campaign || "").trim(),
      utm_content: String(data.utm_content || "").trim(),
      utm_term: String(data.utm_term || "").trim(),
      observaciones: String(data.observaciones || "").trim(),
    });

    return NextResponse.json({ success: true, lead });
  } catch (error) {
    console.error("Error saving store order:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Error interno al guardar el pedido" },
      { status: 500 }
    );
  }
}
