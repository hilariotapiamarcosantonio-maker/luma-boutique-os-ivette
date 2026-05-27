export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number; // In DOP
  priceBefore?: number;
  shortDescription: string;
  description: string;
  benefits: string[];
  usage: string;
  image: string; // Gradient description class or safe placeholder
  badge?: "Bestseller" | "Nuevo" | "Oferta" | "Recomendado";
  stock: number;
  sku: string;
  idealPara?: string[];
  queAporta?: string[];
  combinaloCon?: string[]; // Recommended product slugs
}

export const PRODUCTS: Product[] = [
  {
    id: "prod-00",
    slug: "kit-ritual-inicio",
    name: "Kit Ritual de Inicio",
    category: "Kits",
    price: 3900,
    priceBefore: 4900,
    shortDescription: "Un ritual completo de inicio para reconectar con tu piel, tu aroma y tu energía.",
    description: "Nuestra experiencia insignia de reconexión. Este kit sagrado reúne tres pilares fundamentales para tu ritual diario: el Desodorante en Pasta 'Equilibrio' para proteger y armonizar, la Crema Corporal 'Nutrición Profunda' para suavizar y nutrir la piel, y la Vela Aromática de Intención para crear una atmósfera de calma y presencia. Elaborado artesanalmente en pequeños lotes con ingredientes 100% orgánicos.",
    benefits: [
      "Ritual completo para el cuidado del cuerpo y la mente",
      "Nutrición profunda e hidratación de larga duración",
      "Protección natural libre de aluminio y parabenos",
      "Atmósfera de intención y calma con cera de soya natural"
    ],
    usage: "Enciende la Vela de Intención para preparar tu espacio. Aplica una pequeña cantidad de Desodorante en pasta en las axilas limpias. Masajea la Crema Corporal sobre la piel limpia con movimientos circulares ascendentes, respirando profundamente para absorber los aceites esenciales.",
    image: "/products/ivette/kit-ritual-inicio.jpg",
    badge: "Bestseller",
    stock: 15,
    sku: "KIT-RIT-INI",
    idealPara: [
      "Todo tipo de pieles, especialmente sensibles",
      "Quienes buscan una alternativa de higiene 100% natural",
      "Rituales de relajación y cuidado personal al finalizar el día"
    ],
    queAporta: [
      "Desodorante en Pasta 'Equilibrio' (50 ml) en tarro de cristal y tapa de bambú",
      "Crema Corporal 'Nutrición Profunda' (120 ml) en tarro de cristal y tapa de bambú",
      "Vela Aromática de Intención (250 ml) en cristal ámbar y tapa dorada mate"
    ],
    combinaloCon: ["champu-botanico-purificante", "pasta-dental-ancestral"]
  },
  {
    id: "prod-01",
    slug: "desodorante-equilibrio",
    name: "Desodorante en Pasta “Equilibrio”",
    category: "Cuerpo",
    price: 1200,
    shortDescription: "Frescura natural sin aluminio, equilibrio corporal y protección consciente.",
    description: "Formulado para respetar la fisiología de tu cuerpo mientras te protege eficazmente durante todo el día. Libre de sales de aluminio, parabenos y fragancias sintéticas. Su textura suave en pasta combina manteca de karité, aceite de coco orgánico y aceites esenciales purificantes para neutralizar olores y mantener tus axilas frescas e hidratadas sin obstruir los poros.",
    benefits: [
      "100% natural, libre de aluminio, alcohol y bicarbonato irritante",
      "Protección duradera contra el mal olor de forma natural",
      "Nutre y suaviza la delicada piel de las axilas",
      "Aroma botánico neutro y sumamente elegante"
    ],
    usage: "Toma una pequeña porción con la yema del dedo (del tamaño de un guisante) y esparce suavemente sobre la axila limpia y seca hasta que se absorba por completo.",
    image: "/products/ivette/desodorante-equilibrio.jpg",
    badge: "Recomendado",
    stock: 35,
    sku: "DES-PAST-EQ",
    idealPara: [
      "Pieles sensibles con tendencia a irritaciones",
      "Transición a desodorantes naturales libres de toxinas",
      "Higiene diaria saludable y respetuosa con el cuerpo"
    ],
    queAporta: [
      "Tarro de cristal ámbar premium de 50 ml",
      "Tapa de bambú natural reutilizable",
      "Fórmula botánica de aceites esenciales puros"
    ],
    combinaloCon: ["crema-corporal-nutricion-profunda", "kit-ritual-inicio"]
  },
  {
    id: "prod-02",
    slug: "crema-corporal-nutricion-profunda",
    name: "Crema Corporal “Nutrición Profunda”",
    category: "Cuerpo",
    price: 2200,
    priceBefore: 2600,
    shortDescription: "Nutrición corporal intensiva y ritual de suavidad para una piel radiante.",
    description: "Una emulsión rica elaborada a base de mantecas puras de cacao y karité orgánicas, infundida con aceites prensados en frío. Su textura lino penetra profundamente en la piel deshidratada, devolviendo la elasticidad natural y dejando un brillo saludable sin sensación grasosa. Su fragancia sutil a botánica ancestral relaja el sistema nervioso.",
    benefits: [
      "Nutrición intensiva para pieles secas o expuestas al sol",
      "Restaura la elasticidad y previene la descamación",
      "Fragancia botánica natural calmante",
      "Textura exquisita que se funde con la piel al contacto"
    ],
    usage: "Aplica generosamente sobre el cuerpo después del baño o en cualquier momento del día. Realiza masajes ascendentes enfocándote en zonas secas como codos, rodillas y talones.",
    image: "/products/ivette/crema-nutricion-profunda.jpg",
    badge: "Nuevo",
    stock: 20,
    sku: "CREM-CORP-NUT",
    idealPara: [
      "Pieles muy secas, deshidratadas o apagadas",
      "Cuidado corporal post-exposición solar",
      "Masajes de relajación y drenaje linfático en casa"
    ],
    queAporta: [
      "Tarro de cristal ámbar de 120 ml",
      "Tapa de bambú elegante y ecológica",
      "Fórmula botánica rica en antioxidantes y vitaminas"
    ],
    combinaloCon: ["desodorante-equilibrio", "vela-aromatica-intencion"]
  },
  {
    id: "prod-03",
    slug: "vela-aromatica-intencion",
    name: "Vela Aromática de Intención",
    category: "Aroma",
    price: 1500,
    shortDescription: "Cera de soya natural y aceites esenciales para crear espacios de calma.",
    description: "Vertida a mano en pequeños lotes utilizando cera de soya 100% natural, biodegradable y libre de parafina de petróleo. Infundida con una exclusiva mezcla de aceites esenciales orgánicos que liberan un aroma reconfortante, purificador y terapéutico. Su mecha de algodón natural garantiza una combustión limpia y duradera.",
    benefits: [
      "Cera de soya biodegradable, combustión limpia sin hollín tóxico",
      "Aceites esenciales de aromaterapia para inducir calma y presencia",
      "Envase reutilizable de cristal ámbar premium",
      "Duración aproximada de 45 a 50 horas de encendido"
    ],
    usage: "Enciende la mecha y mantén la vela encendida hasta que la superficie de cera se derrita por completo hasta los bordes. Intenciona tu espacio con pensamientos de paz mientras disfrutas de su aroma.",
    image: "/products/ivette/vela-intencion.jpg",
    badge: "Recomendado",
    stock: 25,
    sku: "VEL-AROM-INT",
    idealPara: [
      "Crear un ambiente de spa y meditación en el hogar",
      "Acompañar rituales de baño, lectura o yoga",
      "Regalo elegante con propósito y diseño boutique"
    ],
    queAporta: [
      "Vaso de cristal ámbar de 250 ml",
      "Tapa dorada mate o madera protectora de aroma",
      "Mecha de algodón orgánico y cera vegetal de soya"
    ],
    combinaloCon: ["kit-ritual-inicio", "crema-corporal-nutricion-profunda"]
  },
  {
    id: "prod-04",
    slug: "champu-botanico-purificante",
    name: "Champú Botánico Purificante",
    category: "Cabello",
    price: 1800,
    shortDescription: "Limpieza botánica suave, cuero cabelludo purificado y pureza natural.",
    description: "Una infusión concentrada de romero, menta y extractos purificantes que limpia el cabello delicadamente sin barrer su barrera lipídica protectora. Formulado sin sulfatos, siliconas ni colorantes artificiales. Regula el exceso de grasa en la raíz y aporta una frescura inmediata, dejando el cabello suelto, brillante y lleno de vida.",
    benefits: [
      "Limpieza profunda respetuosa del pH capilar",
      "Estimula el folículo gracias al aceite de romero orgánico",
      "Libre de agentes espumantes sintéticos agresivos",
      "Sensación refrescante mentolada de larga duración"
    ],
    usage: "Aplica sobre el cuero cabelludo húmedo, realiza masajes circulares suaves con la yema de los dedos para activar la circulación y esparce la espuma hacia las puntas. Enjuaga con abundante agua templada.",
    image: "/products/ivette/champu-botanico-purificante.jpg",
    badge: "Nuevo",
    stock: 30,
    sku: "CHAMP-BOT-PUR",
    idealPara: [
      "Todo tipo de cabello, especialmente raíces grasas",
      "Cuero cabelludo sensible o con picazón",
      "Personas que buscan desintoxicar su cabello de siliconas pesadas"
    ],
    queAporta: [
      "Frasco ámbar de 250 ml (apto para baño)",
      "Dispensador negro mate premium de alta precisión",
      "Fórmula biodegradable rica en extractos de plantas dominicanas"
    ],
    combinaloCon: ["kit-ritual-inicio", "crema-corporal-nutricion-profunda"]
  },
  {
    id: "prod-05",
    slug: "pasta-dental-ancestral",
    name: "Pasta Dental Ancestral",
    category: "Higiene Oral",
    price: 900,
    shortDescription: "Higiene dental natural, libre de flúor y ritual oral consciente.",
    description: "Una alternativa natural y saludable para tu higiene oral diaria. Elaborada con arcilla blanca de grado alimentario, carbonato de calcio natural y extracto de árbol de té y menta piperita. Limpia suavemente, protege las encías y proporciona un aliento fresco duradero sin utilizar flúor, espumantes químicos (SLS) ni conservantes sintéticos.",
    benefits: [
      "100% natural, libre de flúor, sulfatos, edulcorantes artificiales y microplásticos",
      "Acción remineralizante suave gracias a minerales puros",
      "Combate bacterias bucales de forma natural",
      "Frescura natural de menta pura"
    ],
    usage: "Toma una pequeña cantidad utilizando una espátula limpia o la punta de tu cepillo de dientes seco, cepilla tus dientes con normalidad y enjuaga con abundante agua.",
    image: "/products/ivette/pasta-dental-ancestral.jpg",
    badge: "Nuevo",
    stock: 40,
    sku: "PAST-DENT-ANC",
    idealPara: [
      "Higiene oral consciente y libre de flúor",
      "Personas con encías altamente sensibles o sangrado leve",
      "Estilo de vida residuo cero (tarro de vidrio reutilizable)"
    ],
    queAporta: [
      "Tarro pequeño de cristal ámbar de 60 ml",
      "Tapa de metal o bambú reciclable",
      "Fórmula de base mineral con aceites esenciales puros"
    ],
    combinaloCon: ["kit-ritual-inicio", "vela-aromatica-intencion"]
  }
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(category: string): Product[] {
  return PRODUCTS.filter((p) => p.category.toLowerCase() === category.toLowerCase());
}
