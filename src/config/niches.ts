export interface NicheConfig {
  id: string;
  name: string;
  nicheName: string;
  claimHero: string;
  subtitleHero: string;
  categories: string[];
  theme: {
    primary: string; // Tailwind color class or hex
    primaryHover: string;
    background: string;
    text: string;
    cardBg: string;
    border: string;
    gradientFrom: string;
    gradientTo: string;
    badgeBg: string;
    badgeText: string;
  };
  whatsappNumber: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
  ctaText: string;
  benefits: { title: string; description: string; icon: string }[];
  copyComercial: {
    aboutTitle: string;
    aboutText: string;
    ctaSectionTitle: string;
    ctaSectionText: string;
  };
  crmConfig: {
    origen: string;
    sheetName: string;
    localFallbackFile: string;
  };
}

export const NICHES: Record<string, NicheConfig> = {
  boutique: {
    id: "boutique",
    name: "Ivette Berroa — Cosmética Ancestral",
    nicheName: "Cosmética Ancestral",
    claimHero: "Rituales orgánicos para volver al cuerpo.",
    subtitleHero: "Cosmética ancestral elaborada en pequeños lotes. Belleza botánica, lujo silencioso y cuidado consciente.",
    categories: ["Kits", "Cuerpo", "Aroma", "Cabello", "Higiene Oral"],
    theme: {
      primary: "bg-[#c5a059]", // Gold
      primaryHover: "hover:bg-[#b38f48]",
      background: "bg-[#faf8f5]", // Bone Cream
      text: "text-[#1e2d1a]", // Dark Olive Green
      cardBg: "bg-white",
      border: "border-[#f2eee9]",
      gradientFrom: "from-[#faf8f5]",
      gradientTo: "to-[#f2eee9]",
      badgeBg: "bg-[#2a3b26]",
      badgeText: "text-[#faf8f5]",
    },
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+18299434984",
    instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/ivetteberroa",
    facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/ivetteberroa",
    tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@ivetteberroa",
    ctaText: "Pedir por WhatsApp",
    benefits: [
      {
        title: "Ingredientes 100% Orgánicos",
        description: "Fórmulas artesanales puras con activos botánicos libres de químicos nocivos.",
        icon: "Leaf",
      },
      {
        title: "Ritual Ancestral",
        description: "Productos pensados para reconectar con tu bienestar y energía natural.",
        icon: "Sparkles",
      },
      {
        title: "Elaboración Consciente",
        description: "Elaborado a mano en pequeños lotes para garantizar máxima pureza y frescura.",
        icon: "Heart",
      },
    ],
    copyComercial: {
      aboutTitle: "El arte de volver al cuerpo",
      aboutText: "Ivette Berroa — Cosmética Ancestral nace de la unión entre la botánica pura y el cuidado consciente. Cada producto es una invitación a crear un ritual diario de nutrición, calma y amor propio.",
      ctaSectionTitle: "Comienza tu Ritual hoy",
      ctaSectionText: "Elige tu Kit Ritual de Inicio o selecciona tus productos favoritos y coordina tu pedido directamente por WhatsApp.",
    },
    crmConfig: {
      origen: "tienda_boutique",
      sheetName: "Pedidos",
      localFallbackFile: "Pedidos.csv",
    },
  },
  capilar: {
    id: "capilar",
    name: "Luma Capilar OS",
    nicheName: "Productos Capilares",
    claimHero: "Tu cabello merece un cuidado premium",
    subtitleHero: "Fórmulas avanzadas con ingredientes naturales y orgánicos para restaurar la vitalidad, brillo y crecimiento de tu cabello. Calidad profesional en casa.",
    categories: ["Kits", "Shampoo", "Tratamientos", "Aceites", "Crecimiento", "Hidratación"],
    theme: {
      primary: "bg-[#C7A45A]", // Gold
      primaryHover: "hover:bg-[#B5914A]",
      background: "bg-[#FAFAF9]", // Stone 50 (light, elegant)
      text: "text-[#1C1917]", // Stone 900
      cardBg: "bg-[#FFFFFF]",
      border: "border-[#E7E5E4]", // Stone 200
      gradientFrom: "from-[#F5F5F4]", // Stone 100
      gradientTo: "to-[#FAFAF9]",
      badgeBg: "bg-[#F5F2EB]",
      badgeText: "text-[#8C6D30]",
    },
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+18090000000",
    instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/lumacapilar",
    facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/lumacapilar",
    tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@lumacapilar",
    ctaText: "Pedir por WhatsApp",
    benefits: [
      {
        title: "Ingredientes 100% Orgánicos",
        description: "Extractos puros de coco, cacao, jengibre y argán libres de sulfatos y parabenos.",
        icon: "Leaf",
      },
      {
        title: "Resultados Garantizados",
        description: "Cabello visiblemente más fuerte, brillante y saludable en las primeras 3 semanas.",
        icon: "Award",
      },
      {
        title: "Asesoría Personalizada",
        description: "Te guiamos paso a paso por WhatsApp para elegir el tratamiento ideal para tu tipo de cabello.",
        icon: "MessageSquare",
      },
    ],
    copyComercial: {
      aboutTitle: "El secreto de un cabello espectacular",
      aboutText: "Luma Capilar OS combina la sabiduría de la naturaleza con la ciencia de la restauración capilar. Diseñado para la mujer y el hombre contemporáneos que buscan soluciones reales a problemas de caída, resequedad y daño térmico.",
      ctaSectionTitle: "¿Listo para transformar tu cabello?",
      ctaSectionText: "Completa tu pedido en línea o contáctanos por WhatsApp para recibir atención directa de Ivette Berroa.",
    },
    crmConfig: {
      origen: "tienda_capilar",
      sheetName: "Pedidos",
      localFallbackFile: "Pedidos.csv",
    },
  },
  celulares: {
    id: "celulares",
    name: "Luma Cell OS",
    nicheName: "Celulares y Accesorios",
    claimHero: "Tecnología de punta al alcance de tu mano",
    subtitleHero: "La mejor selección de iPhones, equipos Samsung y accesorios premium certificados. Con garantía oficial y entregas rápidas.",
    categories: ["iPhone", "Samsung", "Accesorios", "Audífonos", "Cargadores"],
    theme: {
      primary: "bg-[#0284C7]", // Sky 600
      primaryHover: "hover:bg-[#0369A1]",
      background: "bg-[#F8FAFC]", // Slate 50
      text: "text-[#0F172A]", // Slate 900
      cardBg: "bg-[#FFFFFF]",
      border: "border-[#E2E8F0]", // Slate 200
      gradientFrom: "from-[#F1F5F9]", // Slate 100
      gradientTo: "to-[#F8FAFC]",
      badgeBg: "bg-[#E0F2FE]", // Sky 100
      badgeText: "text-[#0369A1]",
    },
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+18090000000",
    instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/lumacell",
    facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/lumacell",
    tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@lumacell",
    ctaText: "Consultar Stock",
    benefits: [
      {
        title: "Garantía Escrita",
        description: "Todos nuestros dispositivos cuentan con 1 año de garantía directamente con la tienda.",
        icon: "ShieldCheck",
      },
      {
        title: "Equipos Homologados",
        description: "Desbloqueados de fábrica para cualquier red móvil del país, sin restricciones.",
        icon: "Smartphone",
      },
      {
        title: "Accesorios Originales",
        description: "Cargadores de alta velocidad, estuches de alto impacto y protectores de pantalla certificados.",
        icon: "Cpu",
      },
    ],
    copyComercial: {
      aboutTitle: "Tecnología sin compromisos",
      aboutText: "Luma Cell OS es tu socio de confianza para dispositivos inteligentes. Facilitamos la compra y actualización de tu celular con opciones de pago flexibles y soporte técnico postventa inmediato.",
      ctaSectionTitle: "Actualiza tu smartphone hoy",
      ctaSectionText: "Pregunta por nuestros planes de intercambio o solicita el envío express de tu equipo hoy mismo.",
    },
    crmConfig: {
      origen: "tienda_celulares",
      sheetName: "Pedidos",
      localFallbackFile: "Pedidos.csv",
    },
  },
  ropa: {
    id: "ropa",
    name: "Luma Fashion OS",
    nicheName: "Ropa y Boutique",
    claimHero: "Define tu estilo con elegancia moderna",
    subtitleHero: "Prendas seleccionadas con atención al detalle y las últimas tendencias de diseño internacional. Vístete con confianza y exclusividad.",
    categories: ["Vestidos", "Blusas", "Pantalones", "Sets", "Accesorios", "Novedades"],
    theme: {
      primary: "bg-[#DB2777]", // Pink 600
      primaryHover: "hover:bg-[#BE185D]",
      background: "bg-[#FAF5FF]", // Purple 50
      text: "text-[#3B0764]", // Purple 950
      cardBg: "bg-[#FFFFFF]",
      border: "border-[#F3E8FF]", // Purple 200
      gradientFrom: "from-[#F9F5FF]", // Purple 50
      gradientTo: "to-[#FAF5FF]",
      badgeBg: "bg-[#FCE7F3]", // Pink 100
      badgeText: "text-[#BE185D]",
    },
    whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+18090000000",
    instagramUrl: process.env.NEXT_PUBLIC_INSTAGRAM_URL || "https://instagram.com/lumafashion",
    facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://facebook.com/lumafashion",
    tiktokUrl: process.env.NEXT_PUBLIC_TIKTOK_URL || "https://tiktok.com/@lumafashion",
    ctaText: "Ver Tallas Disponibles",
    benefits: [
      {
        title: "Materiales Seleccionados",
        description: "Telas de alta calidad que garantizan durabilidad, comodidad y un ajuste perfecto.",
        icon: "Heart",
      },
      {
        title: "Edición Limitada",
        description: "Producimos cantidades reducidas por estilo para asegurar la exclusividad de tu guardarropa.",
        icon: "Sparkles",
      },
      {
        title: "Cambios Sin Complicaciones",
        description: "Si no te queda como deseas, realizamos cambios de tallas de forma ágil y rápida.",
        icon: "RefreshCw",
      },
    ],
    copyComercial: {
      aboutTitle: "Diseño que inspira confianza",
      aboutText: "Luma Fashion OS cree en el poder de la autoexpresión a través del vestir. Curamos colecciones versátiles que transicionan perfectamente del día a la noche, manteniendo siempre un aire sofisticado.",
      ctaSectionTitle: "¿Encontraste tu look perfecto?",
      ctaSectionText: "Selecciona tus prendas favoritas y consulta disponibilidad de colores y tallas por WhatsApp de inmediato.",
    },
    crmConfig: {
      origen: "tienda_ropa",
      sheetName: "Pedidos",
      localFallbackFile: "Pedidos.csv",
    },
  },
};

// Obtenemos la configuración del nicho activo. Se lee de variables de entorno o usa "boutique" por defecto.
export function getActiveNiche(): NicheConfig {
  const activeId = process.env.NEXT_PUBLIC_ACTIVE_NICHE || "boutique";
  return NICHES[activeId] || NICHES.boutique || NICHES.capilar;
}
