"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, MessageSquare, ArrowRight, Sparkles, AlertCircle, ShoppingBag } from "lucide-react";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { getActiveNiche } from "@/config/niches";

function GraciasPageContent() {
  const searchParams = useSearchParams();
  const niche = getActiveNiche();

  const leadId = searchParams.get("leadsId") || "";
  const totalStr = searchParams.get("total") || "0";
  const summary = searchParams.get("summary") || "Productos";
  const deliveryMethod = searchParams.get("deliveryMethod") || "delivery_coordinado";
  const metodoPago = searchParams.get("metodoPago") || "Transferencia";
  const modalidadPago = searchParams.get("modalidadPago") || "Pago Completo";

  const total = parseFloat(totalStr) || 0;

  // Format delivery method text
  const getDeliveryMethodText = (method: string) => {
    switch (method) {
      case "retiro":
        return "Retiro Coordinado";
      case "delivery_coordinado":
      default:
        return "Entrega Coordinada";
    }
  };

  // Split products by comma to show them as a clean list
  const productsList = summary.split(",").map(item => item.trim()).filter(Boolean);

  const isPlanQuincenal = modalidadPago === "Plan Quincenal";
  const cuotaVal = total / 2;
  const planInfo = isPlanQuincenal 
    ? `\n• Modalidad: Plan Quincenal Clienta Fiel (2 cuotas de RD$ ${cuotaVal.toLocaleString()})`
    : "";

  // Prefilled WhatsApp message to continue order confirmation
  const orderConfirmMsg = `Hola! Acabo de registrar mi pedido en línea:
• Pedido: ${summary}
• Total Estimado: RD$ ${total.toLocaleString()}${planInfo}
• Método de Entrega: ${getDeliveryMethodText(deliveryMethod)}
• Método de Pago: ${metodoPago}
• ID de Solicitud: ${leadId}

Me gustaría coordinar la entrega y confirmar mis productos.`;

  const waUrl = `https://wa.me/${niche.whatsappNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    orderConfirmMsg
  )}`;

  return (
    <div className="max-w-2xl mx-auto bg-[#faf8f5] border border-[#f2eee9] rounded-3xl p-8 md:p-12 shadow-sm text-center space-y-6">
      
      {/* Icon */}
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#2a3b26]/10 text-[#2a3b26] shadow-sm animate-bounce">
        <CheckCircle2 className="h-8 w-8" />
      </div>

      {/* Header */}
      <div className="space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] flex items-center justify-center gap-1">
          <Sparkles className="h-3.5 w-3.5" />
          ¡Solicitud Registrada Exitosamente!
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1e2d1a]">
          ¡Muchas Gracias por tu Pedido!
        </h1>
        <p className="text-xs text-[#2a3b26]/70">
          Tu pedido fue registrado correctamente. Hemos limpiado tu carrito para evitar duplicados.
        </p>
      </div>

      {/* Order Info Panel */}
      <div className="bg-white rounded-2xl p-5 border border-[#f2eee9] text-left space-y-3 shadow-inner">
        <h3 className="text-xs font-bold text-[#1e2d1a] uppercase tracking-wider flex items-center gap-1.5 border-b border-[#f2eee9] pb-2">
          <ShoppingBag className="h-4 w-4 text-[#c5a059]" />
          Detalles de tu Pedido
        </h3>
        
        <div className="flex justify-between text-xs text-[#2a3b26] border-b border-[#f2eee9]/40 pb-2">
          <span>Productos:</span>
          {productsList.length > 1 ? (
            <ul className="text-right font-bold text-[#1e2d1a] max-w-[70%] space-y-1">
              {productsList.map((item, idx) => (
                <li key={idx} className="truncate">{item}</li>
              ))}
            </ul>
          ) : (
            <span className="font-bold text-[#1e2d1a] text-right max-w-[70%] truncate">{summary}</span>
          )}
        </div>
        
        <div className="flex justify-between text-xs text-[#2a3b26] border-b border-[#f2eee9]/40 pb-2">
          <span>Método de Entrega:</span>
          <span className="font-semibold text-[#1e2d1a]">{getDeliveryMethodText(deliveryMethod)}</span>
        </div>

        <div className="flex justify-between text-xs text-[#2a3b26] border-b border-[#f2eee9]/40 pb-2">
          <span>Método de Pago:</span>
          <span className="font-semibold text-[#1e2d1a]">{metodoPago}</span>
        </div>

        {isPlanQuincenal && (
          <div className="flex justify-between text-xs text-[#2a3b26] border-b border-[#f2eee9]/40 pb-2 bg-[#f2eee9]/25 p-2 rounded-lg">
            <span>Modalidad de Pago:</span>
            <span className="font-bold text-[#c5a059]">Plan Quincenal Clienta Fiel</span>
          </div>
        )}
        
        <div className="flex justify-between text-xs text-[#2a3b26]">
          <span>ID de Pedido:</span>
          <span className="font-mono font-bold text-[#1e2d1a]">{leadId || "L-PENDING"}</span>
        </div>
        
        <div className="flex justify-between text-xs text-[#2a3b26] border-t border-[#f2eee9] pt-2">
          <span>Total Estimado:</span>
          <span className="font-extrabold text-[#c5a059] text-sm">RD$ {total.toLocaleString()}</span>
        </div>
      </div>

      {/* Action Notice */}
      <div className="flex items-start gap-2.5 rounded-xl bg-[#f2eee9]/30 border border-[#c5a059]/20 p-4 text-left text-xs text-[#1e2d1a]">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#c5a059]" />
        <div>
          <span className="font-bold block text-[#1e2d1a] mb-0.5">Ahora puedes confirmar disponibilidad y entrega por WhatsApp:</span>
          <p className="leading-relaxed text-[#2a3b26]/80">Haz clic en el botón de WhatsApp abajo para enviar tu confirmación de inmediato. Esto nos permitirá coordinar tu pedido de manera prioritaria.</p>
        </div>
      </div>

      {/* Primary WhatsApp Button */}
      <div className="pt-2 space-y-3">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-3 w-full rounded-full bg-[#25D366] text-white py-4 font-bold text-sm shadow-md hover:bg-[#20ba56] hover:scale-[1.01] active:scale-[0.99] transition-all"
        >
          <MessageSquare className="h-5 w-5 fill-current" />
          Confirmar de inmediato por WhatsApp
        </a>

        <Link
          href="/tienda"
          className="flex items-center justify-center gap-2 text-xs font-bold text-[#2a3b26] hover:text-[#c5a059] transition-colors"
        >
          Seguir viendo productos
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

    </div>
  );
}

export default function StoreGracias() {
  return (
    <>
      <StoreHeader />

      <main className="min-h-screen bg-[#f2eee9] flex items-center justify-center py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <Suspense fallback={<div className="text-center text-xs text-[#78716C]">Cargando confirmación...</div>}>
            <GraciasPageContent />
          </Suspense>
        </div>
      </main>

      <StoreFooter />
    </>
  );
}
