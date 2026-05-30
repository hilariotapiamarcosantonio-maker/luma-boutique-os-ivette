import { NextRequest, NextResponse } from "next/server";
import {
  listPedidos,
  listContactos,
  listPagosQuincenales,
  updatePedidoCrm,
  upsertPagoQuincenalCrm,
  logCrmInteraction,
  todayInLaPaz,
  normalizePhone,
  calculateQuincenalPlan,
  isQuincenalPlan,
} from "@/lib/ivette-crm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { pedidoId, action, montoRecibido, fecha, nota, force } = body;

    if (!pedidoId) {
      return NextResponse.json(
        { success: false, error: "Falta el ID del pedido (pedidoId)" },
        { status: 400 }
      );
    }

    const allowedActions = [
      "confirmar_venta",
      "registrar_pago_completo",
      "registrar_cuota_1",
      "registrar_cuota_2",
      "preparando",
      "entregado",
      "cancelar",
    ];

    if (!action || !allowedActions.includes(action)) {
      return NextResponse.json(
        { success: false, error: `Acción no permitida: ${action}` },
        { status: 400 }
      );
    }

    // Fetch the target Pedido
    const pedidos = await listPedidos();
    const pedidoRow = pedidos.rows.find(
      (p) => String(p.id).trim() === String(pedidoId).trim()
    );

    if (!pedidoRow) {
      return NextResponse.json(
        { success: false, error: "Pedido no encontrado" },
        { status: 404 }
      );
    }

    const clienteNombre = String(pedidoRow.cliente_nombre || "");
    const clienteTelefono = String(pedidoRow.cliente_telefono || "");
    const totalVenta = Number(String(pedidoRow.total || "0").replace(/[^0-9.-]+/g, "")) || 0;
    const modalidadPago = String(pedidoRow.modalidad_pago || "Pago Completo");
    const currentEstadoPedido = String(pedidoRow.estado_pedido || "");

    // Find the corresponding contactoId
    const contactos = await listContactos();
    const targetContacto = contactos.rows.find(
      (c) =>
        normalizePhone(String(c.telefono || "")) === normalizePhone(clienteTelefono)
    );
    const contactoId = targetContacto ? String(targetContacto.id) : `CON-${Date.now()}`;

    // Get the corresponding payment plan if it exists
    const payments = await listPagosQuincenales();
    const currentPlan = payments.rows.find(
      (p) => String(p.pedido_id).trim() === String(pedidoId).trim()
    );

    const useFecha = fecha || todayInLaPaz();
    const useNota = nota || "";

    const orderUpdates: Record<string, string | number | boolean> = {};
    const interactionLog: {
      tipoInteraccion: string;
      mensaje: string;
      resultado: string;
    } = {
      tipoInteraccion: "",
      mensaje: "",
      resultado: "Completado",
    };

    switch (action) {
      case "confirmar_venta": {
        orderUpdates.estado_pedido = "Confirmado";
        orderUpdates.fecha_confirmacion = useFecha;

        const isQuincenal = isQuincenalPlan(modalidadPago);
        if (isQuincenal) {
          const plan = calculateQuincenalPlan(totalVenta, useFecha);
          await upsertPagoQuincenalCrm(pedidoId, {
            contacto_id: contactoId,
            cliente_nombre: clienteNombre,
            telefono: clienteTelefono,
            fecha_entrega: useFecha,
            monto_total: totalVenta,
            cuota_1: plan.cuota1,
            fecha_cuota_1: plan.fechaCuota1,
            estado_cuota_1: "Cuota 1 pendiente",
            cuota_2: plan.cuota2,
            fecha_cuota_2: plan.fechaCuota2,
            estado_cuota_2: "Cuota 2 pendiente",
            saldo_pendiente: totalVenta,
            estado_plan: "Cuota 1 pendiente",
            notas: useNota,
          });

          orderUpdates.estado_pago = "Cuota 1 pendiente";
          orderUpdates.saldo_pendiente = totalVenta;
          orderUpdates.proxima_fecha_pago = plan.fechaCuota1;
        } else {
          orderUpdates.estado_pago = "Pendiente";
          orderUpdates.saldo_pendiente = totalVenta;
        }

        interactionLog.tipoInteraccion = "confirmar venta";
        interactionLog.mensaje = `Pedido confirmado. Modalidad: ${modalidadPago}. Total: ${totalVenta}. ${useNota}`;
        break;
      }

      case "registrar_pago_completo": {
        const received = Number(montoRecibido);
        if (isNaN(received) || received <= 0) {
          return NextResponse.json(
            { success: false, error: "Monto recibido inválido o negativo" },
            { status: 400 }
          );
        }

        orderUpdates.estado_pago = "Pagado";
        orderUpdates.saldo_pendiente = 0;
        orderUpdates.fecha_pago_completo = useFecha;
        orderUpdates.proxima_fecha_pago = "";

        // Keep order state if already Confirmed/Preparing/Delivered
        if (!["Confirmado", "Preparando", "Entregado"].includes(currentEstadoPedido)) {
          orderUpdates.estado_pedido = "Confirmado";
        }

        if (currentPlan) {
          await upsertPagoQuincenalCrm(pedidoId, {
            estado_cuota_1: "Pagada",
            fecha_pago_cuota_1: useFecha,
            estado_cuota_2: "Pagada",
            fecha_pago_cuota_2: useFecha,
            saldo_pendiente: 0,
            estado_plan: "Completado",
            notas: [String(currentPlan.notas || ""), `Pago completo de ${received} en ${useFecha}. ${useNota}`].filter(Boolean).join(" | "),
          });
        }

        interactionLog.tipoInteraccion = "pago completo";
        interactionLog.mensaje = `Registrado pago completo de ${received} el ${useFecha}. ${useNota}`;
        break;
      }

      case "registrar_cuota_1": {
        const received = Number(montoRecibido);
        if (isNaN(received) || received <= 0) {
          return NextResponse.json(
            { success: false, error: "Monto recibido inválido o negativo" },
            { status: 400 }
          );
        }

        // Fetch or calculate plan info
        const nextPayDate = currentPlan ? String(currentPlan.fecha_cuota_2) : todayInLaPaz();

        const newSaldo = Math.max(totalVenta - received, 0);

        await upsertPagoQuincenalCrm(pedidoId, {
          contacto_id: contactoId,
          cliente_nombre: clienteNombre,
          telefono: clienteTelefono,
          estado_cuota_1: "Pagada",
          fecha_pago_cuota_1: useFecha,
          saldo_pendiente: newSaldo,
          estado_plan: "Cuota 2 pendiente",
          notas: [currentPlan ? String(currentPlan.notas || "") : "", `Cuota 1 pagada con ${received} en ${useFecha}. ${useNota}`].filter(Boolean).join(" | "),
        });

        orderUpdates.estado_pago = "Cuota 1 pagada";
        orderUpdates.saldo_pendiente = newSaldo;
        orderUpdates.proxima_fecha_pago = nextPayDate;

        interactionLog.tipoInteraccion = "cuota 1";
        interactionLog.mensaje = `Registrada Cuota 1 de ${received} el ${useFecha}. Saldo pendiente: ${newSaldo}. ${useNota}`;
        break;
      }

      case "registrar_cuota_2": {
        const received = Number(montoRecibido);
        if (isNaN(received) || received <= 0) {
          return NextResponse.json(
            { success: false, error: "Monto recibido inválido o negativo" },
            { status: 400 }
          );
        }

        // Evitar registrar cuota 2 antes de cuota 1, salvo que sea forzado
        if (currentPlan && String(currentPlan.estado_cuota_1) !== "Pagada" && !force) {
          return NextResponse.json(
            {
              success: false,
              warning: true,
              error: "La Cuota 1 aún no ha sido registrada. ¿Deseas proceder de todos modos?",
            },
            { status: 400 }
          );
        }

        await upsertPagoQuincenalCrm(pedidoId, {
          estado_cuota_2: "Pagada",
          fecha_pago_cuota_2: useFecha,
          saldo_pendiente: 0,
          estado_plan: "Completado",
          notas: [currentPlan ? String(currentPlan.notes || currentPlan.notas || "") : "", `Cuota 2 pagada con ${received} en ${useFecha}. ${useNota}`].filter(Boolean).join(" | "),
        });

        orderUpdates.estado_pago = "Pagado";
        orderUpdates.saldo_pendiente = 0;
        orderUpdates.proxima_fecha_pago = "";

        interactionLog.tipoInteraccion = "cuota 2";
        interactionLog.mensaje = `Registrada Cuota 2 de ${received} el ${useFecha}. Plan completado. ${useNota}`;
        break;
      }

      case "preparando": {
        orderUpdates.estado_pedido = "Preparando";
        interactionLog.tipoInteraccion = "preparando";
        interactionLog.mensaje = `Pedido marcado como Preparando. ${useNota}`;
        break;
      }

      case "entregado": {
        orderUpdates.estado_pedido = "Entregado";
        orderUpdates.fecha_entrega = useFecha;
        interactionLog.tipoInteraccion = "entregado";
        interactionLog.mensaje = `Pedido marcado como Entregado en fecha ${useFecha}. ${useNota}`;
        break;
      }

      case "cancelar": {
        orderUpdates.estado_pedido = "Cancelado";
        if (currentPlan) {
          await upsertPagoQuincenalCrm(pedidoId, {
            estado_plan: "Cancelado",
            notas: [String(currentPlan.notas || ""), `Cancelado el ${useFecha}. ${useNota}`].filter(Boolean).join(" | "),
          });
        }
        interactionLog.tipoInteraccion = "cancelado";
        interactionLog.mensaje = `Pedido Cancelado. ${useNota}`;
        break;
      }
    }

    // Save changes to Google Sheets
    await updatePedidoCrm(pedidoId, orderUpdates);

    // Write history log
    await logCrmInteraction({
      contactoId,
      nombre: clienteNombre,
      telefono: clienteTelefono,
      tipoInteraccion: interactionLog.tipoInteraccion,
      mensaje: interactionLog.mensaje,
      resultado: interactionLog.resultado,
      responsable: "Marcos / Ivette",
      notas: useNota,
    });

    return NextResponse.json({
      success: true,
      pedidoId,
      action,
      updatedFields: orderUpdates,
    });
  } catch (error) {
    console.error("Error processing sales/payment action:", error);
    const errorMessage = error instanceof Error ? error.message : "Error interno del servidor";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
