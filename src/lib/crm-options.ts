export const sourceOptions = [
  "Facebook Ads",
  "Google Ads",
  "Orgánico",
  "Referido",
  "Landing Directa",
  "WhatsApp",
  "Otro",
] as const;

export const sourceChannelOptions = [
  "Facebook",
  "Instagram",
  "Google",
  "YouTube",
  "TikTok",
  "WhatsApp",
  "Web",
  "Referido",
  "Orgánico",
  "Local",
  "Otro",
] as const;

export const opportunityOptions = ["Airbnb", "Corp", "Retiro"] as const;

export const landingPageOptions = [
  "Oferta Airbnb",
  "Oferta Corporativa",
  "Oferta Retiro",
  "Vista Del Río General",
] as const;

export const priorityOptions = ["Alta", "Media", "Baja"] as const;

export const statusOptions = [
  "Nuevo",
  "Contactado",
  "Seguimiento",
  "Cita",
  "Cerrado",
  "Perdido",
] as const;

export const agentOptions = [
  "Marcos Hilario",
  "Asesor Comercial",
  "Asesor Digital",
] as const;

export const resultOptions = [
  "Pendiente",
  "Interesado",
  "No responde",
  "Cita agendada",
  "Propuesta enviada",
  "Ganado",
  "No califica",
  "Perdido",
] as const;

export const actionOptions = [] as const;

export const clientTypeOptions = [
  "Comprador",
  "Arrendatario",
  "Inversionista",
  "Propietario",
  "Empresa",
  "Cliente corporativo",
  "Retiro",
  "Airbnb",
] as const;

export const operationTypeOptions = [
  "Venta",
  "Alquiler",
  "Alquiler amueblado",
  "Alquiler corporativo",
  "Airbnb",
  "Inversión",
  "Retiro",
] as const;

export const zoneOptions = [
  "Vista del Río",
  "Piantini",
  "Naco",
  "Bella Vista",
  "Santo Domingo Este",
  "Santo Domingo Norte",
  "Punta Cana",
  "Cap Cana",
  "La Romana",
  "Santiago",
  "Jarabacoa",
  "Las Terrenas",
  "Zona Colonial",
  "Otra zona",
] as const;

export const temperatureOptions = [
  "Caliente",
  "Tibio",
  "Frío",
  "No calificado",
] as const;

export const pipelineStageOptions = [
  "Nuevo lead",
  "Contactado",
  "Calificado",
  "Propiedad enviada",
  "Visita agendada",
  "Propuesta enviada",
  "Negociación",
  "Cierre ganado",
  "Cierre perdido",
  "Seguimiento futuro",
] as const;

export const lossReasonOptions = [
  "Precio",
  "Ubicación",
  "Financiamiento",
  "No responde",
  "Compró otra opción",
  "No califica",
  "Sin inventario adecuado",
  "Otro",
] as const;

export const clickIdTypeOptions = ["Facebook", "Google", "TikTok", "Otro"] as const;

export const sourceToChannel: Record<string, string> = {
  "Facebook Ads": "Facebook",
  "Google Ads": "Google",
  Orgánico: "Orgánico",
  Referido: "Referido",
  "Landing Directa": "Web",
  WhatsApp: "WhatsApp",
  Otro: "Otro",
};

export const pipelineStageToStatus: Record<string, string> = {
  "Nuevo lead": "Nuevo",
  Contactado: "Contactado",
  Calificado: "Seguimiento",
  "Propiedad enviada": "Seguimiento",
  "Visita agendada": "Cita",
  "Propuesta enviada": "Seguimiento",
  Negociación: "Seguimiento",
  "Cierre ganado": "Cerrado",
  "Cierre perdido": "Perdido",
  "Seguimiento futuro": "Seguimiento",
};
