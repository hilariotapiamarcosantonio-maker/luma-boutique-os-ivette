import { getActiveNiche } from "@/config/niches";

export interface CartItemShort {
  name: string;
  quantity: number;
  price: number;
  sku: string;
}

export interface CartTotalsShort {
  subtotal: number;
  tax: number;
  delivery: number;
  total: number;
}

export interface LeadShort {
  nombre: string;
  apellido?: string;
  whatsapp: string;
  itemsSummary: string;
  total: number;
  deliveryMethod?: string;
}

// Clean phone number for WhatsApp
export function cleanPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, "");
  // If Dominican Republic number without country code, add 1
  if (cleaned.length === 10 && (cleaned.startsWith("809") || cleaned.startsWith("829") || cleaned.startsWith("849"))) {
    cleaned = "1" + cleaned;
  }
  return cleaned;
}

// Get WhatsApp base link
export function getWhatsappBaseUrl(): string {
  const niche = getActiveNiche();
  const phone = cleanPhoneNumber(niche.whatsappNumber);
  return `https://wa.me/${phone}`;
}

export function buildProductWhatsappMessage(product: { name: string; sku: string }): string {
  const niche = getActiveNiche();
  const message = niche.id === "boutique"
    ? `Hola, vengo de la tienda de Ivette Berroa. Quiero información sobre ${product.name} (SKU: ${product.sku}).`
    : `Hola, estoy interesado/a en ${product.name} (SKU: ${product.sku}). Me gustaría recibir asesoría y confirmar disponibilidad.`;
  return `${getWhatsappBaseUrl()}?text=${encodeURIComponent(message)}`;
}

export function buildCartWhatsappMessage(items: CartItemShort[], totals: CartTotalsShort): string {
  const niche = getActiveNiche();
  let message = niche.id === "boutique"
    ? `Hola, quiero hacer un pedido de los siguientes productos en la tienda de Ivette Berroa:\n\n`
    : `Hola, quiero confirmar este pedido en ${niche.name}:\n\n`;
  
  items.forEach((item) => {
    message += `• ${item.name} x${item.quantity} (SKU: ${item.sku}) - RD$ ${(item.price * item.quantity).toLocaleString()}\n`;
  });
  
  message += `\nSubtotal: RD$ ${totals.subtotal.toLocaleString()}`;
  if (totals.tax > 0) {
    message += `\nImpuestos (18%): RD$ ${totals.tax.toLocaleString()}`;
  }
  message += `\nDelivery: ${totals.delivery === 0 ? "Gratis" : `RD$ ${totals.delivery.toLocaleString()}`}`;
  message += `\n*Total Estimado: RD$ ${totals.total.toLocaleString()}*\n\n`;
  
  message += niche.id === "boutique"
    ? `Por favor, me confirman disponibilidad y método de entrega para coordinar.`
    : `Por favor, ayúdenme a coordinar la entrega y el método de pago.`;

  return `${getWhatsappBaseUrl()}?text=${encodeURIComponent(message)}`;
}

export function buildGeneralAdvisorMessage(): string {
  const niche = getActiveNiche();
  const message = niche.id === "boutique"
    ? `Hola Ivette, me interesa comprar productos orgánicos artesanales. Vi la tienda y quiero orientación.`
    : `Hola, me gustaría recibir asesoría personalizada sobre sus productos de ${niche.nicheName} para elegir la mejor rutina.`;
  return `${getWhatsappBaseUrl()}?text=${encodeURIComponent(message)}`;
}

export function buildLeadFollowUpMessage(lead: LeadShort): string {
  const niche = getActiveNiche();
  const phone = cleanPhoneNumber(lead.whatsapp);
  const fullName = `${lead.nombre} ${lead.apellido || ""}`.trim();
  const deliveryText = lead.deliveryMethod === "retiro" 
    ? "Retiro Coordinado" 
    : "Delivery Coordinado";
  
  const message = niche.id === "boutique"
    ? `Hola ${fullName}, te escribimos de Ivette Berroa — Cosmética Ancestral en relación a tu pedido registrado de:\n${lead.itemsSummary}.\n\n*Total:* RD$ ${lead.total.toLocaleString()}\n*Método de entrega:* ${deliveryText}\n\nQueremos confirmar la disponibilidad, coordinar la entrega y definir tu método de pago preferido. ¿Cómo estás?`
    : `Hola ${fullName}, te escribimos de ${niche.name} en relación a tu pedido registrado de:\n${lead.itemsSummary}.\n\n*Total:* RD$ ${lead.total.toLocaleString()}\n*Método de entrega:* ${deliveryText}\n\nQueremos confirmar la disponibilidad, coordinar la entrega y definir tu método de pago preferido. ¿Cómo estás?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
