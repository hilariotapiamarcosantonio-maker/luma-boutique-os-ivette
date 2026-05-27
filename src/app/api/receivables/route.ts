import { NextResponse } from "next/server";
import { updateReceivableAbono } from "@/lib/sheets-actions";

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    
    const planId = data.plan_id || data.cxc_id;

    if (!planId || data.abono === undefined) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (plan_id, abono)" },
        { status: 400 }
      );
    }

    const result = await updateReceivableAbono(
      String(planId),
      Number(data.abono)
    );

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Error updating receivable:", error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      { error: "Error interno al actualizar el abono" },
      { status: 500 }
    );
  }
}
