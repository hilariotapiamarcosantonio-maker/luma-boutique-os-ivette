import { NextResponse } from "next/server";
import { todayInLaPaz, updateContactoSeguimiento } from "@/lib/ivette-crm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const requiredFields = ["contacto_id", "nombre", "telefono", "estado_contacto"];
    const missing = requiredFields.filter((field) => !data[field]);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Faltan campos requeridos: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    await updateContactoSeguimiento({
      contactoId: String(data.contacto_id),
      nombre: String(data.nombre),
      telefono: String(data.telefono),
      estadoContacto: String(data.estado_contacto),
      ultimaInteraccion: String(data.ultima_interaccion || todayInLaPaz()),
      proximaAccion: String(data.proxima_accion || ""),
      notas: String(data.notas || ""),
      accion: String(data.accion || "Seguimiento"),
      proximaFecha: String(data.proxima_fecha || ""),
      responsable: String(data.responsable || "Ivette/Marcos"),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "Error updating contact follow-up:",
      error instanceof Error ? error.message : "unknown"
    );
    return NextResponse.json(
      { error: "Error interno al guardar seguimiento" },
      { status: 500 }
    );
  }
}
