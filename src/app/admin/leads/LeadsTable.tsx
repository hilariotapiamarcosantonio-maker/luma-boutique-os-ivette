"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Search, 
  Filter, 
  ShieldAlert, 
  Sparkles, 
  User, 
  ShoppingCart, 
  Copy, 
  Check, 
  Phone,
  Clock,
  ChevronRight,
  Info
} from "lucide-react";
import { getCommerceConfig } from "@/config/commerce";

interface Lead {
  id: string;
  fecha: string;
  nombre: string;
  apellido: string;
  whatsapp: string;
  email?: string;
  provincia: string;
  municipio?: string;
  direccion: string;
  referencia?: string;
  notas: string;
  producto?: string;
  cantidad?: number;
  deliveryMethod?: string;
  googleMapsUrl?: string;
  itemsJson?: string;
  itemsSummary?: string;
  subtotal?: number;
  tax?: number;
  delivery?: number;
  total?: number;
  canal: string;
  fuente: string;
  origen: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
  metodoPago?: string;
  origenLead?: string;
  estado: string;

  // Plan Quincenal Clienta Fiel fields
  modalidadPago?: string;
  montoTotal?: number;
  cuota1?: number;
  cuota2?: number;
  fechaCuota1?: string;
  fechaCuota2?: string;
  observaciones?: string;
  clienteFiel?: string; // "true" or "false"
  estadoPlan?: string;
}

interface Contact {
  id: string;
  nombre: string;
  telefono: string;
  telefonoNormalizado: string;
  etiqueta: string;
  origen: string;
  notas: string;
  clientaFiel: boolean;
  cohortes: string;
  estadoContacto: string;
  interes: string;
  ultimaInteraccion: string;
  proximaAccion: string;
  email?: string;
  organizacion?: string;
  estadoImportacion?: string;
  contactableWhatsapp?: boolean;
  motivoRevision?: string;
}

interface CartItem {
  id?: string;
  sku?: string;
  name: string;
  price: number;
  quantity: number;
  category?: string;
}

interface LeadsTableProps {
  initialLeads: Lead[];
  initialContacts: Contact[];
  dataSource?: "google-sheets" | "local-fallback";
  demoModeActive: boolean;
  defaultTab?: "pedidos" | "contactos";
  defaultFilter?: string;
}

const normalizeFilter = (f?: string): string => {
  if (!f) return "all";
  const lower = f.toLowerCase();
  if (lower === "csv_ptigo" || lower === "csv ptigo") return "csv_ptigo";
  if (lower === "vcf_ivette" || lower === "vcf ivette") return "vcf_ivette";
  if (lower === "revision" || lower === "revisión") return "revision";
  if (lower === "whatsapp_valido" || lower === "whatsapp válido" || lower === "con_whatsapp") return "whatsapp_valido";
  if (lower === "lanzamiento_500" || lower === "lanzamiento 500" || lower === "lanzamiento") return "lanzamiento_500";
  if (lower === "seguimiento") return "seguimiento";
  return "all";
};

const MOCK_DEMO_LEADS: Lead[] = [
  {
    id: "LEAD-DEMO-001",
    fecha: new Date().toISOString().split('T')[0],
    nombre: "María",
    apellido: "Rodríguez",
    whatsapp: "809-555-1234",
    email: "maria.rod@example.com",
    provincia: "Santo Domingo",
    municipio: "Distrito Nacional (Bella Vista)",
    direccion: "Av. Anacaona No. 45, Apto. 5B",
    referencia: "Cerca del Parque Mirador Sur",
    notas: "Entregar preferiblemente en la tarde.",
    deliveryMethod: "delivery_coordinado",
    itemsSummary: "Kit Ritual de Inicio x1, Jabón Exfoliante de Café y Avena x1",
    subtotal: 4600,
    tax: 828,
    delivery: 0,
    total: 5428,
    canal: "tienda_online",
    fuente: "tienda_botanica",
    origen: "tienda_botanica",
    utm_source: "facebook",
    utm_medium: "paid_ads",
    utm_campaign: "campana_ancestral_2026",
    utm_content: "ad_video_testimonios",
    utm_term: "",
    metodoPago: "Transferencia",
    origenLead: "tienda",
    estado: "Nuevo",
    modalidadPago: "Plan Quincenal",
    montoTotal: 5428,
    cuota1: 2714,
    cuota2: 2714,
    fechaCuota1: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaCuota2: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clienteFiel: "true",
    estadoPlan: "Cuota 1 pendiente",
    observaciones: "Preferencia de contacto en la tarde"
  },
  {
    id: "LEAD-DEMO-002",
    fecha: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    nombre: "Alejandro",
    apellido: "Gómez",
    whatsapp: "829-555-5678",
    email: "ale.gomez@example.com",
    provincia: "Santiago",
    municipio: "Santiago de los Caballeros",
    direccion: "Calle Benito Monción No. 12, Las Colinas",
    referencia: "Frente a la Farmacia Carol",
    notas: "Llamar 10 minutos antes de llegar.",
    deliveryMethod: "delivery_coordinado",
    itemsSummary: "Sérum Facial Antioxidante x2, Jabón de Arcilla y Carbón Activado x1",
    subtotal: 3150,
    tax: 567,
    delivery: 0,
    total: 3717,
    canal: "tienda_online",
    fuente: "tienda_botanica",
    origen: "tienda_botanica",
    utm_source: "instagram",
    utm_medium: "bio_link",
    utm_campaign: "organico",
    utm_content: "",
    utm_term: "",
    metodoPago: "Domicilio contra entrega",
    origenLead: "tienda",
    estado: "Contactado"
  },
  {
    id: "LEAD-DEMO-003",
    fecha: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    nombre: "Laura",
    apellido: "Minaya",
    whatsapp: "849-555-9012",
    email: "",
    provincia: "La Romana",
    municipio: "La Romana (Centro)",
    direccion: "Calle Castillo Márquez No. 8",
    referencia: "Al lado de la Sirena",
    notes: "Pasará a recoger el sábado por la mañana.",
    deliveryMethod: "retiro",
    itemsSummary: "Kit Ritual de Inicio x1",
    subtotal: 3900,
    tax: 702,
    delivery: 0,
    total: 4602,
    canal: "tienda_online",
    fuente: "tienda_botanica",
    origen: "tienda_botanica",
    utm_source: "google",
    utm_medium: "search",
    utm_campaign: "marca_ivette",
    utm_content: "",
    utm_term: "",
    metodoPago: "Efectivo coordinado",
    origenLead: "tienda",
    estado: "Confirmado",
    modalidadPago: "Plan Quincenal",
    montoTotal: 4602,
    cuota1: 2301,
    cuota2: 2301,
    fechaCuota1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    fechaCuota2: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    clienteFiel: "true",
    estadoPlan: "Cuota 1 pagada"
  }
] as unknown as Lead[];

export function LeadsTable({ initialLeads, initialContacts, dataSource = "local-fallback", demoModeActive, defaultTab = "pedidos", defaultFilter = "all" }: LeadsTableProps) {
  const [activeTab, setActiveTab] = useState<"pedidos" | "contactos">(defaultTab);
  const config = getCommerceConfig();

  // Leads State & Filters
  const [leadsSearchQuery, setLeadsSearchQuery] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [planStatusFilter, setPlanStatusFilter] = useState("all");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Contacts State & Filters
  const [contacts, setContacts] = useState(initialContacts);
  const [contactsSearchQuery, setContactsSearchQuery] = useState("");
  const [contactsFilter, setContactsFilter] = useState(() => normalizeFilter(defaultFilter));
  const [contactsPage, setContactsPage] = useState(1);
  const contactsPerPage = 100;

  useEffect(() => {
    setContactsPage(1);
  }, [contactsFilter, contactsSearchQuery]);

  useEffect(() => {
    setContactsFilter(normalizeFilter(defaultFilter));
  }, [defaultFilter]);

  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messageContact, setMessageContact] = useState<Contact | null>(null);
  const [followUpContact, setFollowUpContact] = useState<Contact | null>(null);
  const [followUpSaving, setFollowUpSaving] = useState(false);
  const [followUpStatus, setFollowUpStatus] = useState("");
  const [followUpForm, setFollowUpForm] = useState({
    accion: "Lanzamiento",
    estado_contacto: "Seguimiento",
    ultima_interaccion: new Date().toISOString().split("T")[0],
    proxima_fecha: "",
    proxima_accion: "Enviar detalles del Kit Ritual de Inicio",
    responsable: "Ivette/Marcos",
    notas: "",
  });
  
  // WhatsApp Message Composer Modal states
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [copiedText, setCopiedText] = useState(false);

  // Compute leads
  const hasRealStoreLeads = initialLeads.some(
    (l) => l.origen === "tienda_botanica" || l.origen === "tienda_capilar" || l.itemsSummary
  );
  
  const baseLeads = (demoModeActive && !hasRealStoreLeads) 
    ? MOCK_DEMO_LEADS 
    : initialLeads;

  // Filter leads
  const filteredLeads = baseLeads.filter((lead) => {
    const searchLower = leadsSearchQuery.toLowerCase();
    const fullName = `${lead.nombre} ${lead.apellido || ""}`.toLowerCase();
    const matchesSearch = 
      fullName.includes(searchLower) ||
      lead.whatsapp.includes(searchLower) ||
      (lead.itemsSummary || lead.producto || "").toLowerCase().includes(searchLower) ||
      lead.provincia.toLowerCase().includes(searchLower);

    const matchesMethod = methodFilter === "all" || 
      (lead.deliveryMethod || "delivery_coordinado") === methodFilter;

    const matchesStatus = statusFilter === "all" || lead.estado === statusFilter;

    // Normalizing payment methods to match filters
    const leadPaymentMethod = lead.metodoPago || "Transferencia";
    const matchesPayment = paymentFilter === "all" || 
      (paymentFilter === "Plan Quincenal" 
        ? (lead.modalidadPago === "Plan Quincenal" || lead.modalidadPago === "Plan Quincenal Clienta Fiel")
        : leadPaymentMethod === paymentFilter);

    // Plan status filter
    const matchesPlanStatus = planStatusFilter === "all" || lead.estadoPlan === planStatusFilter;

    return matchesSearch && matchesMethod && matchesStatus && matchesPayment && matchesPlanStatus;
  });

  // Filter Contacts
  const filteredContacts = contacts.filter((contact) => {
    // 1. Search filter
    const searchLower = contactsSearchQuery.toLowerCase();
    const matchesSearch = 
      contact.nombre.toLowerCase().includes(searchLower) ||
      contact.telefono.includes(searchLower) ||
      contact.telefonoNormalizado.includes(searchLower) ||
      contact.notas.toLowerCase().includes(searchLower) ||
      contact.cohortes.toLowerCase().includes(searchLower) ||
      contact.etiqueta.toLowerCase().includes(searchLower);

    // 2. Tab-specific category filters
    let matchesCategory = true;
    if (contactsFilter === "whatsapp_valido") {
      matchesCategory = contact.contactableWhatsapp === true;
    } else if (contactsFilter === "revision") {
      matchesCategory = contact.contactableWhatsapp === false || !contact.telefonoNormalizado || contact.estadoImportacion === "Revisión";
    } else if (contactsFilter === "lanzamiento_500") {
      matchesCategory = contact.cohortes === "lanzamiento_500";
    } else if (contactsFilter === "csv_ptigo") {
      matchesCategory = contact.origen === "CSV ptigo";
    } else if (contactsFilter === "vcf_ivette") {
      matchesCategory = contact.origen === "VCF Ivette";
    } else if (contactsFilter === "seguimiento") {
      matchesCategory = contact.estadoContacto === "Seguimiento" || !!contact.proximaAccion;
    }

    return matchesSearch && matchesCategory;
  });

  const totalContactsCount = contacts.length;
  const whatsappValidoCount = contacts.filter((c) => c.contactableWhatsapp === true).length;
  const revisionCount = contacts.filter((c) => c.contactableWhatsapp === false || !c.telefonoNormalizado || c.estadoImportacion === "Revisión").length;
  const lanzamiento500Count = contacts.filter((c) => c.cohortes === "lanzamiento_500").length;
  const csvPtigoCount = contacts.filter((c) => c.origen === "CSV ptigo").length;
  const vcfIvetteCount = contacts.filter((c) => c.origen === "VCF Ivette").length;
  const seguimientoCount = contacts.filter((c) => c.estadoContacto === "Seguimiento" || !!c.proximaAccion).length;

  const filterOptions = [
    { value: "all", label: "Todos", count: totalContactsCount },
    { value: "whatsapp_valido", label: "WhatsApp válido", count: whatsappValidoCount },
    { value: "revision", label: "Revisión", count: revisionCount },
    { value: "lanzamiento_500", label: "Lanzamiento 500", count: lanzamiento500Count },
    { value: "csv_ptigo", label: "CSV ptigo", count: csvPtigoCount },
    { value: "vcf_ivette", label: "VCF Ivette", count: vcfIvetteCount },
    { value: "seguimiento", label: "Seguimiento", count: seguimientoCount },
  ];

  const totalFilteredContacts = filteredContacts.length;
  const totalPages = Math.ceil(totalFilteredContacts / contactsPerPage);
  const startIndex = (contactsPage - 1) * contactsPerPage;
  const endIndex = Math.min(startIndex + contactsPerPage, totalFilteredContacts);
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  // Templates definition
  const getTemplates = (name: string) => {
    const firstName = name.split(" ")[0] || "hermosa";
    return [
      {
        title: "Mensaje 1 — Lanzamiento",
        text: `Hola, ${firstName}. Soy del equipo de Ivette Berroa 🌿✨\nTe escribimos porque formas parte de nuestras clientas especiales.\nYa está disponible nuestro lanzamiento de Cosmética Ancestral y queremos ofrecerte primero el Kit Ritual de Inicio.\n¿Te gustaría que te comparta los detalles?`
      },
      {
        title: "Mensaje 2 — Pago Quincenal",
        text: `Hola, ${firstName} 🌿\nQueremos recordarte que para nuestras clientas fieles tenemos disponible el Plan Quincenal Clienta Fiel para tu compra.\nSi deseas, te compartimos cómo reservar hoy y completar en dos pagos.`
      },
      {
        title: "Mensaje 3 — Seguimiento",
        text: `Hola, ${firstName} ✨\nPaso por aquí para dar seguimiento a tu interés en los productos de Ivette Berroa.\nSi deseas, te ayudo a elegir el ritual ideal para ti.`
      }
    ];
  };

  // Helper to build WhatsApp URL for Contacts
  const buildWhatsAppContactLink = (phone: string, text: string) => {
    const cleaned = phone.replace(/[^0-9]/g, "");
    let target = cleaned;
    // Dominican fallback (10 digits starting with 809/829/849 -> prepend 1)
    if (cleaned.length === 10 && (cleaned.startsWith("809") || cleaned.startsWith("829") || cleaned.startsWith("849"))) {
      target = "1" + cleaned;
    }
    return `https://wa.me/${target}?text=${encodeURIComponent(text)}`;
  };

  const getContactLaunchMessage = () =>
    "Hola, hermosa. Soy del equipo de Ivette Berroa 🌿✨ Te escribimos porque formas parte de nuestras clientas especiales. Ya estamos preparando el lanzamiento de Cosmética Ancestral y queremos ofrecerte primero el Kit Ritual de Inicio. ¿Te gustaría que te comparta los detalles?";

  const getLeadMessage = (lead: Lead) => {
    const firstName = lead.nombre || "hermosa";
    const isPlan = lead.modalidadPago === "Plan Quincenal" || lead.modalidadPago === "Plan Quincenal Clienta Fiel";
    return isPlan
      ? `Hola ${firstName}. Te escribimos de Ivette Berroa — Cosmética Ancestral sobre tu pedido con Plan Quincenal Clienta Fiel. Queremos confirmar tu entrega y las fechas de tus dos pagos.`
      : `Hola ${firstName}. Te escribimos de Ivette Berroa — Cosmética Ancestral sobre tu pedido. Queremos confirmar disponibilidad, entrega y método de pago.`;
  };

  const openFollowUp = (contact: Contact) => {
    setFollowUpContact(contact);
    setFollowUpStatus("");
    setFollowUpForm((current) => ({
      ...current,
      estado_contacto: contact.estadoContacto || "Seguimiento",
      ultima_interaccion: new Date().toISOString().split("T")[0],
      proxima_accion: contact.proximaAccion || "Enviar detalles del Kit Ritual de Inicio",
      notas: contact.notas || "",
    }));
  };

  const saveFollowUp = async () => {
    if (!followUpContact) return;
    setFollowUpSaving(true);
    setFollowUpStatus("");

    try {
      const response = await fetch("/api/contactos/seguimiento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contacto_id: followUpContact.id,
          nombre: followUpContact.nombre,
          telefono: followUpContact.telefonoNormalizado || followUpContact.telefono,
          ...followUpForm,
        }),
      });

      if (!response.ok) throw new Error("No se pudo guardar seguimiento");

      setContacts((current) =>
        current.map((contact) =>
          contact.id === followUpContact.id
            ? {
                ...contact,
                estadoContacto: followUpForm.estado_contacto,
                ultimaInteraccion: followUpForm.ultima_interaccion,
                proximaAccion: followUpForm.proxima_accion,
                notas: followUpForm.notas,
              }
            : contact
        )
      );
      setFollowUpStatus("Seguimiento guardado");
    } catch {
      setFollowUpStatus("No se pudo guardar. Verifica acceso al Google Sheet.");
    } finally {
      setFollowUpSaving(false);
    }
  };

  // Remaining quincenal payment helper
  const getRemainingAmount = (lead: Lead) => {
    const total = lead.total || 0;
    const cuota2 = lead.cuota2 || (total / 2);
    const estado = lead.estadoPlan || "Pendiente inicio";

    if (estado === "Completado") return 0;
    if (estado === "Cuota 1 pagada" || estado === "Cuota 2 pendiente") return cuota2;
    return total;
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "Nuevo":
        return "border-blue-500/40 bg-blue-500/10 text-blue-400";
      case "Contactado":
        return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
      case "Confirmado":
        return "border-green-500/40 bg-green-500/10 text-green-400";
      case "Preparando":
        return "border-orange-500/40 bg-orange-500/10 text-orange-400";
      case "Entregado":
        return "border-teal-500/40 bg-teal-500/10 text-teal-400";
      case "Cancelado":
        return "border-red-500/40 bg-red-500/10 text-red-400";
      case "Seguimiento":
      default:
        return "border-purple-500/40 bg-purple-500/10 text-purple-400";
    }
  };

  const getPlanStatusBadge = (status: string) => {
    switch (status) {
      case "Pendiente inicio":
        return "border-gray-500/40 bg-gray-500/10 text-gray-400";
      case "Cuota 1 pendiente":
        return "border-amber-500/40 bg-amber-500/10 text-amber-400";
      case "Cuota 1 pagada":
        return "border-indigo-500/40 bg-indigo-500/10 text-indigo-400";
      case "Cuota 2 pendiente":
        return "border-orange-500/40 bg-orange-500/10 text-orange-400";
      case "Completado":
        return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
      case "Atrasado":
        return "border-rose-500/40 bg-rose-500/10 text-rose-400 font-extrabold animate-pulse";
      default:
        return "border-stone-500/40 bg-stone-500/10 text-stone-400";
    }
  };

  const getDeliveryMethodText = (method?: string) => {
    const m = method || "delivery_coordinado";
    switch (m) {
      case "retiro":
        return { label: "Retiro Coordinado", style: "bg-stone-800 text-stone-300 border-stone-700" };
      case "delivery_coordinado":
      default:
        return { label: "Entrega Coordinada", style: "bg-amber-950/50 text-amber-400 border-amber-900/50" };
    }
  };

  const handleCopyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Demo mode banner */}
      {demoModeActive && (
        <div className="flex items-center justify-between gap-3 bg-crm-gold/10 border border-crm-gold/30 rounded-2xl p-4 text-crm-gold">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <div className="text-xs">
              <span className="font-bold block">Modo Demo Comercial Activo</span>
              <span className="opacity-90">
                Mostrando datos de simulación interactivos para presentación comercial de Ivette Berroa. Los leads de prueba no afectan tus archivos reales.
              </span>
            </div>
          </div>
          <Badge className="bg-crm-gold text-white font-bold">DEMO</Badge>
        </div>
      )}

      {dataSource === "local-fallback" && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            Fallback local activo: el admin no esta leyendo Google Sheets. Verifica IVETTE_SPREADSHEET_ID y permisos del service account.
          </span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="flex border-b border-crm-line">
        <button
          onClick={() => setActiveTab("pedidos")}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "pedidos"
              ? "border-crm-gold text-crm-gold bg-crm-gold/5"
              : "border-transparent text-crm-muted hover:text-crm-text hover:bg-crm-bg2"
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          Pedidos y Leads ({filteredLeads.length})
        </button>
        <button
          onClick={() => setActiveTab("contactos")}
          className={`flex items-center gap-2 px-6 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
            activeTab === "contactos"
              ? "border-crm-gold text-crm-gold bg-crm-gold/5"
              : "border-transparent text-crm-muted hover:text-crm-text hover:bg-crm-bg2"
          }`}
        >
          <User className="h-4 w-4" />
          Directorio de Contactos ({filteredContacts.length})
        </button>
      </div>

      {/* PEDIDOS TAB */}
      {activeTab === "pedidos" && (
        <div className="space-y-4">
          {/* Filters Control Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 gap-3 bg-crm-surface border border-crm-line rounded-2xl p-4">
            {/* Search */}
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-crm-muted" />
              <input
                type="text"
                placeholder="Buscar por cliente, whatsapp, producto, provincia..."
                value={leadsSearchQuery}
                onChange={(e) => setLeadsSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-crm-line text-xs bg-crm-bg text-crm-text focus:outline-none focus:border-crm-gold transition-colors"
              />
            </div>

            {/* Delivery filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-crm-muted" />
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-crm-line text-xs bg-crm-bg text-crm-text focus:outline-none focus:border-crm-gold transition-colors appearance-none"
              >
                <option value="all">Todos los Envíos</option>
                <option value="delivery_coordinado">Entrega Coordinada</option>
                <option value="retiro">Retiro Coordinado</option>
              </select>
            </div>

            {/* Payment filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-crm-muted" />
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-crm-line text-xs bg-crm-bg text-crm-text focus:outline-none focus:border-crm-gold transition-colors appearance-none"
              >
                <option value="all">Todos los Pagos</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Domicilio contra entrega">Contra Entrega</option>
                <option value="Efectivo coordinado">Efectivo Coordinado</option>
                <option value="Plan Quincenal">Plan Quincenal Fiel</option>
              </select>
            </div>

            {/* Status filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-crm-muted" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-crm-line text-xs bg-crm-bg text-crm-text focus:outline-none focus:border-crm-gold transition-colors appearance-none"
              >
                <option value="all">Todos los Estados</option>
                <option value="Nuevo">Nuevo</option>
                <option value="Contactado">Contactado</option>
                <option value="Confirmado">Confirmado</option>
                <option value="Preparando">Preparando</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
                <option value="Seguimiento">Seguimiento</option>
              </select>
            </div>

            {/* Plan status filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-crm-muted" />
              <select
                value={planStatusFilter}
                onChange={(e) => setPlanStatusFilter(e.target.value)}
                className="w-full pl-8 pr-4 py-2 rounded-xl border border-crm-line text-xs bg-crm-bg text-crm-text focus:outline-none focus:border-crm-gold transition-colors appearance-none"
              >
                <option value="all">Estado del Plan (Todos)</option>
                <option value="Pendiente inicio">Pendiente inicio</option>
                <option value="Cuota 1 pendiente">Cuota 1 pendiente</option>
                <option value="Cuota 1 pagada">Cuota 1 pagada</option>
                <option value="Cuota 2 pendiente">Cuota 2 pendiente</option>
                <option value="Completado">Plan Completado</option>
                <option value="Atrasado">Plan Atrasado</option>
              </select>
            </div>
          </div>

          {/* Leads Grid/Table */}
          <div className="bg-crm-surface border border-crm-line rounded-2xl overflow-hidden">
            {filteredLeads.length > 0 ? (
              <>
                {/* Mobile View: Cards */}
                <div className="block sm:hidden space-y-4 p-4">
                  {filteredLeads.map((lead) => {
                    const itemsDisplay = lead.itemsSummary || lead.producto || "Productos";
                    const displayTotal = lead.total || 0;
                    const isPlan = lead.modalidadPago === "Plan Quincenal" || lead.modalidadPago === "Plan Quincenal Clienta Fiel";
                    const remaining = isPlan ? getRemainingAmount(lead) : 0;
                    const nextPayDate = lead.estadoPlan === "Cuota 2 pendiente" || lead.estadoPlan === "Cuota 1 pagada" 
                      ? lead.fechaCuota2 
                      : lead.fechaCuota1;

                    const leadMessage = getLeadMessage(lead);
                    const waUrl = buildWhatsAppContactLink(lead.whatsapp, leadMessage);

                    return (
                      <div
                        key={lead.id}
                        className={`border border-crm-line bg-crm-surface2 rounded-xl p-4 space-y-3 transition-colors ${
                          lead.estado === "Nuevo" ? "bg-crm-gold/5 border-crm-gold/30" : ""
                        }`}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="font-bold text-crm-text flex items-center gap-1.5 truncate">
                              <User className="h-3.5 w-3.5 text-crm-muted shrink-0" />
                              <span className="truncate">{lead.nombre} {lead.apellido}</span>
                            </div>
                            <div className="text-[10px] text-crm-faint font-mono flex items-center gap-1">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span>{lead.whatsapp}</span>
                            </div>
                            <div className="text-[9px] text-crm-faint flex items-center gap-1">
                              <Calendar className="h-3 w-3 shrink-0" />
                              <span>{lead.fecha}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-1.5 shrink-0">
                            <Badge variant="outline" className={`text-[8px] uppercase tracking-wider font-bold ${getStatusBadge(lead.estado)}`}>
                              {lead.estado}
                            </Badge>
                            <span className={`inline-block border text-[8px] px-1.5 py-0.5 rounded-full ${getDeliveryMethodText(lead.deliveryMethod).style}`}>
                              {getDeliveryMethodText(lead.deliveryMethod).label}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-crm-line/60 pt-2.5 space-y-2">
                          <div className="text-[11px] text-crm-muted">
                            <span className="font-semibold text-crm-faint block text-[9px] uppercase tracking-wider">Productos:</span>
                            <div className="break-words mt-0.5" title={itemsDisplay}>
                              {itemsDisplay}
                            </div>
                          </div>

                          <div className="flex justify-between items-center text-xs bg-crm-surface/60 p-2.5 rounded-xl border border-crm-line/50">
                            <div>
                              <span className="text-[9px] text-crm-faint block uppercase">Monto Total:</span>
                              <span className="font-extrabold text-crm-text text-sm">RD$ {displayTotal.toLocaleString()}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-[9px] text-crm-faint block uppercase">Modalidad:</span>
                              {isPlan ? (
                                <Badge className="bg-crm-gold/20 border border-crm-gold/40 text-crm-gold text-[8px] font-bold py-0.5 px-1.5">
                                  Plan Quincenal
                                </Badge>
                              ) : (
                                <Badge className="bg-crm-surface3 border border-crm-line text-crm-muted text-[8px] py-0.5 px-1.5">
                                  Pago Completo
                                </Badge>
                              )}
                            </div>
                          </div>

                          {isPlan && (
                            <div className="bg-[#c5a059]/5 border border-[#c5a059]/20 p-2.5 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between">
                                <span className="text-crm-faint">Restante:</span>
                                <span className="font-extrabold text-crm-teal">RD$ {remaining.toLocaleString()}</span>
                              </div>
                              {nextPayDate && (
                                <div className="flex justify-between text-[10px] text-crm-faint">
                                  <span>Próx. Pago:</span>
                                  <span className="font-mono">{nextPayDate}</span>
                                </div>
                              )}
                              <div className="flex justify-between items-center pt-1 border-t border-[#c5a059]/10">
                                <span className="text-[10px] text-crm-faint">Estado Plan:</span>
                                <Badge variant="outline" className={`text-[8px] py-0 px-1 font-bold ${getPlanStatusBadge(lead.estadoPlan || "Pendiente inicio")}`}>
                                  {lead.estadoPlan || "Pendiente inicio"}
                                </Badge>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-crm-line/60">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="flex-1 min-h-[38px] text-center rounded border border-crm-line bg-crm-surface hover:bg-crm-surface3 text-crm-text font-bold text-xs transition-all py-1.5"
                          >
                            Detalle
                          </button>
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-xs transition-all shadow-sm py-1.5"
                          >
                            <MessageSquare className="h-4 w-4 fill-current shrink-0" />
                            WhatsApp
                          </a>
                          <button
                            onClick={() => handleCopyMessage(leadMessage)}
                            className="min-h-[38px] px-3 rounded border border-crm-line bg-crm-surface hover:bg-crm-surface2 text-crm-text font-bold text-xs transition-all py-1.5"
                            title="Copiar mensaje"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-crm-line bg-crm-surface2 text-crm-muted uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Cliente & Pedido</th>
                        <th className="px-4 py-3 font-semibold">Ubicación & Envío</th>
                        <th className="px-4 py-3 font-semibold">Modalidad</th>
                        <th className="px-4 py-3 font-semibold">Cuotas / Cobros</th>
                        <th className="px-4 py-3 font-semibold">Monto Total</th>
                        <th className="px-4 py-3 font-semibold">Estado Lead</th>
                        <th className="px-4 py-3 text-right font-semibold">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-crm-line">
                      {filteredLeads.map((lead) => {
                        const itemsDisplay = lead.itemsSummary || lead.producto || "Productos";
                        const displayTotal = lead.total || 0;
                        const isPlan = lead.modalidadPago === "Plan Quincenal" || lead.modalidadPago === "Plan Quincenal Clienta Fiel";
                        const remaining = isPlan ? getRemainingAmount(lead) : 0;
                        const nextPayDate = lead.estadoPlan === "Cuota 2 pendiente" || lead.estadoPlan === "Cuota 1 pagada" 
                          ? lead.fechaCuota2 
                          : lead.fechaCuota1;

                        const leadMessage = getLeadMessage(lead);
                        const waUrl = buildWhatsAppContactLink(lead.whatsapp, leadMessage);

                        return (
                          <tr 
                            key={lead.id} 
                            className={`transition-colors hover:bg-crm-bg2 ${
                              lead.estado === "Nuevo" ? "bg-crm-gold/5" : ""
                            }`}
                          >
                            {/* Client & Date */}
                            <td className="px-4 py-3">
                              <div className="font-bold text-crm-text flex items-center gap-1">
                                <User className="h-3.5 w-3.5 text-crm-muted shrink-0" />
                                {lead.nombre} {lead.apellido}
                              </div>
                              <div className="text-[10px] text-crm-faint mt-0.5 font-mono flex items-center gap-1">
                                <Phone className="h-3 w-3 shrink-0" />
                                {lead.whatsapp}
                              </div>
                              <div className="text-[9px] text-crm-faint mt-0.5 flex items-center gap-1">
                                <Calendar className="h-3 w-3 shrink-0" />
                                {lead.fecha}
                              </div>
                            </td>

                            {/* Address & Delivery */}
                            <td className="px-4 py-3">
                              <div className="font-semibold text-crm-text flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-crm-cyan shrink-0" />
                                {lead.provincia}
                              </div>
                              <div className="text-[10px] text-crm-muted max-w-[200px] truncate mt-0.5">
                                {lead.direccion}
                              </div>
                              <div className="mt-1">
                                <span className={`inline-block border text-[8px] px-1.5 py-0.5 rounded-full ${getDeliveryMethodText(lead.deliveryMethod).style}`}>
                                  {getDeliveryMethodText(lead.deliveryMethod).label}
                                </span>
                              </div>
                            </td>

                            {/* Modality */}
                            <td className="px-4 py-3">
                              {isPlan ? (
                                <div className="space-y-1">
                                  <Badge className="bg-crm-gold/20 border border-crm-gold/40 text-crm-gold text-[9px] hover:bg-crm-gold/20 py-0 font-bold uppercase tracking-wider">
                                    Plan Quincenal 🌿
                                  </Badge>
                                  <div className="text-[9px] text-crm-faint font-mono">
                                    Clienta Fiel
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <Badge className="bg-crm-surface3 border border-crm-line text-crm-muted text-[9px] hover:bg-crm-surface3 py-0 font-semibold uppercase tracking-wider">
                                    Pago Completo
                                  </Badge>
                                  <div className="text-[9px] text-crm-faint">
                                    {lead.metodoPago || "Transferencia"}
                                  </div>
                                </div>
                              )}
                            </td>

                            {/* Quincenas & Cobros */}
                            <td className="px-4 py-3">
                              {isPlan ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1">
                                    <span className="text-[10px] text-crm-muted">Falta:</span>
                                    <span className="font-extrabold text-crm-teal">
                                      RD$ {remaining.toLocaleString()}
                                    </span>
                                  </div>
                                  {nextPayDate && (
                                    <div className="text-[9px] text-crm-faint flex items-center gap-0.5 font-mono">
                                      <Clock className="h-2.5 w-2.5 shrink-0" />
                                      Pago: {nextPayDate}
                                    </div>
                                  )}
                                  <div className="mt-1">
                                    <Badge variant="outline" className={`text-[8px] py-0 px-1 font-bold ${getPlanStatusBadge(lead.estadoPlan || "Pendiente inicio")}`}>
                                      {lead.estadoPlan || "Pendiente inicio"}
                                    </Badge>
                                  </div>
                                </div>
                              ) : (
                                <span className="text-crm-faint italic text-[10px]">No aplica plan</span>
                              )}
                            </td>

                            {/* Total Cost */}
                            <td className="px-4 py-3">
                              <div className="font-extrabold text-crm-text text-sm">
                                RD$ {displayTotal.toLocaleString()}
                              </div>
                              <div className="text-[9px] text-crm-faint max-w-[150px] truncate" title={itemsDisplay}>
                                {itemsDisplay}
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              <Badge variant="outline" className={`text-[8px] uppercase tracking-wider font-bold ${getStatusBadge(lead.estado)}`}>
                                {lead.estado}
                              </Badge>
                            </td>

                            {/* Actions */}
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => setSelectedLead(lead)}
                                  className="px-2.5 py-1.5 rounded border border-crm-line bg-crm-surface hover:bg-crm-surface2 text-crm-text font-bold transition-all"
                                >
                                  Detalle
                                </button>
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#25D366] hover:bg-[#20ba56] text-white font-bold transition-all shadow-sm"
                                >
                                  <MessageSquare className="h-3.5 w-3.5 fill-current shrink-0" />
                                  WhatsApp
                                </a>
                                <button
                                  onClick={() => handleCopyMessage(leadMessage)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-crm-line bg-crm-surface hover:bg-crm-surface2 text-crm-text font-bold transition-all"
                                >
                                  <Copy className="h-3.5 w-3.5 shrink-0" />
                                  Copiar
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-16 text-crm-muted space-y-3">
                <ShieldAlert className="h-10 w-10 text-crm-gold/40 mx-auto" />
                <h3 className="text-sm font-bold text-crm-text">No se encontraron prospectos de pedidos</h3>
                <p className="text-xs text-crm-faint max-w-xs mx-auto">
                  Aún no hay intenciones de compra registradas con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CONTACTS TAB */}
      {activeTab === "contactos" && (
        <div className="space-y-4">
          {/* Contacts Control Filters */}
          <div className="bg-crm-surface border border-crm-line rounded-2xl p-4 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-crm-muted" />
              <input
                type="text"
                placeholder="Buscar por nombre, teléfono, notas o cohorte..."
                value={contactsSearchQuery}
                onChange={(e) => setContactsSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-crm-line text-xs bg-crm-bg text-crm-text focus:outline-none focus:border-crm-gold transition-colors"
              />
            </div>

            {/* Main filter categories */}
            <div className="flex overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 gap-2 whitespace-nowrap scrollbar-none select-none">
              {filterOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    const normalized = normalizeFilter(opt.value);
                    setContactsFilter(normalized);
                    setContactsPage(1);
                    const url = normalized === "all" ? "/admin/contactos" : `/admin/contactos?filter=${normalized}`;
                    window.history.pushState(null, "", url);
                  }}
                  className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all border shrink-0 ${
                    contactsFilter === opt.value
                      ? "bg-crm-gold/25 border-crm-gold text-crm-gold"
                      : "bg-crm-surface2 border-crm-line text-crm-muted hover:text-crm-text hover:bg-crm-surface3"
                  }`}
                >
                  {opt.label} <span className="opacity-70 font-mono font-normal">({opt.count})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Contacts Table */}
          <div className="bg-crm-surface border border-crm-line rounded-2xl overflow-hidden">
            {filteredContacts.length > 0 ? (
              <>
                {/* Mobile View: Cards */}
                <div className="block sm:hidden space-y-4 p-4">
                  {paginatedContacts.map((contact) => {
                    const launchMessage = getContactLaunchMessage();
                    const waUrl = buildWhatsAppContactLink(contact.telefonoNormalizado || contact.telefono, launchMessage);

                    return (
                      <div
                        key={contact.id}
                        className="border border-crm-line bg-crm-surface2 rounded-xl p-4 space-y-3 transition-colors"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-1 min-w-0">
                            <div className="font-bold text-crm-text flex items-center gap-1.5 truncate">
                              <User className="h-3.5 w-3.5 text-crm-muted shrink-0" />
                              <span className="truncate">{contact.nombre}</span>
                            </div>
                            <div className="text-[10px] text-crm-faint font-mono flex items-center gap-1">
                              <Phone className="h-3 w-3 text-crm-cyan shrink-0" />
                              <span>{contact.telefono || "Sin teléfono"}</span>
                            </div>
                            {contact.telefonoNormalizado && contact.telefonoNormalizado !== contact.telefono && (
                              <div className="text-[9px] text-crm-faint font-mono">
                                Norm: {contact.telefonoNormalizado}
                              </div>
                            )}
                            <div className="text-[9px] text-crm-faint mt-1 space-y-0.5">
                              <div>ID: {contact.id} • Origen: {contact.origen}</div>
                              {contact.organizacion && <div>Org: <span className="text-crm-text">{contact.organizacion}</span></div>}
                              {contact.email && <div className="font-mono">Email: <span className="text-crm-text">{contact.email}</span></div>}
                              {contact.estadoImportacion && (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                                    contact.estadoImportacion === "Importado" ? "bg-green-400" : "bg-yellow-500"
                                  }`} />
                                  <span>Importación: {contact.estadoImportacion}</span>
                                  {contact.motivoRevision && <span className="text-crm-muted">({contact.motivoRevision})</span>}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 items-end justify-end shrink-0">
                            {contact.clientaFiel && (
                              <Badge className="bg-crm-gold/20 border border-crm-gold/40 text-crm-gold text-[8px] font-bold py-0.5 px-1.5">
                                Fiel 🌿
                              </Badge>
                            )}
                            {contact.cohortes === "lanzamiento_500" ? (
                              <Badge className="bg-purple-500/20 border border-purple-500/40 text-purple-400 text-[8px] py-0.5 px-1.5">
                                Lanzamiento 500
                              </Badge>
                            ) : contact.cohortes ? (
                              <Badge className="bg-crm-surface3 border border-crm-line text-crm-muted text-[8px] py-0.5 px-1.5">
                                {contact.cohortes}
                              </Badge>
                            ) : null}
                          </div>
                        </div>

                        <div className="border-t border-crm-line/60 pt-2.5 space-y-2 text-xs">
                          {contact.interes && (
                            <div className="flex justify-between items-center py-1">
                              <span className="text-crm-faint">Interés:</span>
                              <span className="font-bold text-crm-gold flex items-center gap-1">
                                <ShoppingCart className="h-3.5 w-3.5 shrink-0" />
                                {contact.interes}
                              </span>
                            </div>
                          )}

                          {contact.proximaAccion && (
                            <div className="flex justify-between items-center py-1 bg-crm-cyan/5 border border-crm-cyan/20 p-2 rounded-xl">
                              <span className="text-crm-cyan font-bold">Próxima Acción:</span>
                              <span className="font-bold text-crm-cyan">{contact.proximaAccion}</span>
                            </div>
                          )}

                          {contact.notas && (
                            <div className="text-[11px] text-crm-muted bg-crm-surface/60 p-2.5 rounded-xl border border-crm-line/50">
                              <span className="font-semibold text-crm-muted block text-[9px] uppercase tracking-wider">Notas:</span>
                              <p className="text-[11px] text-crm-text break-words line-clamp-3 leading-relaxed">
                                {contact.notas}
                              </p>
                            </div>
                          )}

                          {contact.ultimaInteraccion && (
                            <div className="text-[10px] text-crm-faint text-right font-mono">
                              Última int: {contact.ultimaInteraccion}
                            </div>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2 pt-2 border-t border-crm-line/60">
                          <button
                            onClick={() => setSelectedContact(contact)}
                            className="flex-1 min-h-[38px] text-center rounded border border-crm-line bg-crm-surface hover:bg-crm-surface3 text-crm-text font-bold text-xs transition-all py-1.5"
                          >
                            Ver
                          </button>
                          {contact.contactableWhatsapp ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded bg-[#25D366] hover:bg-[#20ba56] text-white font-bold text-xs transition-all shadow-sm py-1.5"
                            >
                              <MessageSquare className="h-4 w-4 fill-current shrink-0" />
                              WhatsApp
                            </a>
                          ) : (
                            <button
                              disabled
                              className="flex-1 min-h-[38px] inline-flex items-center justify-center gap-1.5 rounded bg-crm-surface border border-crm-line text-crm-muted font-bold text-xs cursor-not-allowed opacity-50 py-1.5"
                            >
                              <MessageSquare className="h-4 w-4 fill-current shrink-0" />
                              Revisar teléfono
                            </button>
                          )}
                          <button
                            onClick={() => handleCopyMessage(launchMessage)}
                            className="min-h-[38px] px-3 rounded border border-crm-line bg-crm-surface hover:bg-crm-surface3 text-crm-text font-bold text-xs transition-all py-1.5"
                            title="Copiar mensaje"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => openFollowUp(contact)}
                            className="min-h-[38px] px-3 rounded border border-crm-line bg-crm-surface hover:bg-crm-surface3 text-crm-text font-bold text-xs transition-all py-1.5"
                            title="Registrar seguimiento"
                          >
                            <Clock className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop View: Table */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-crm-line bg-crm-surface2 text-crm-muted uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Nombre de Contacto</th>
                        <th className="px-4 py-3 font-semibold">WhatsApp / Teléfono</th>
                        <th className="px-4 py-3 font-semibold">Segmento / Cohorte</th>
                        <th className="px-4 py-3 font-semibold">Interés / Producto</th>
                        <th className="px-4 py-3 font-semibold">Próxima Acción</th>
                        <th className="px-4 py-3 font-semibold">Última Interacción / Notas</th>
                        <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-crm-line">
                      {paginatedContacts.map((contact) => (
                        <tr key={contact.id} className="transition-colors hover:bg-crm-bg2">
                           {/* Name */}
                          <td className="px-4 py-3">
                            <div className="font-bold text-crm-text flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5 text-crm-muted shrink-0" />
                              {contact.nombre}
                            </div>
                            <div className="text-[9px] text-crm-faint mt-0.5 space-y-0.5">
                              <div>ID: {contact.id} • Origen: {contact.origen}</div>
                              {contact.organizacion && <div>Org: <span className="text-crm-text">{contact.organizacion}</span></div>}
                              {contact.email && <div>Email: <span className="text-crm-text font-mono">{contact.email}</span></div>}
                              {contact.estadoImportacion && (
                                <div className="mt-1 flex items-center gap-1">
                                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                                    contact.estadoImportacion === "Importado" ? "bg-green-400" : "bg-yellow-500"
                                  }`} />
                                  <span>Importación: {contact.estadoImportacion}</span>
                                  {contact.motivoRevision && <span className="text-crm-muted">({contact.motivoRevision})</span>}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Phone */}
                          <td className="px-4 py-3">
                            <div className="font-semibold text-crm-text flex items-center gap-1 font-mono">
                              <Phone className="h-3 w-3 text-crm-cyan shrink-0" />
                              {contact.telefono}
                            </div>
                            <div className="text-[9px] text-crm-faint font-mono">
                              Norm: {contact.telefonoNormalizado}
                            </div>
                          </td>

                          {/* Cohorte & Fiel Badge */}
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {contact.clientaFiel && (
                                <Badge className="bg-crm-gold/20 border border-crm-gold/40 text-crm-gold text-[8px] hover:bg-crm-gold/20 py-0 px-1 font-bold">
                                  Fiel 🌿
                                </Badge>
                              )}
                              {contact.cohortes === "lanzamiento_500" ? (
                                <Badge className="bg-purple-500/20 border border-purple-500/40 text-purple-400 text-[8px] hover:bg-purple-500/20 py-0 px-1">
                                  Lanzamiento 500
                                </Badge>
                              ) : contact.cohortes ? (
                                <Badge className="bg-crm-surface3 border border-crm-line text-crm-muted text-[8px] py-0 px-1">
                                  {contact.cohortes}
                                </Badge>
                              ) : null}
                            </div>
                          </td>

                          {/* Interest */}
                          <td className="px-4 py-3 font-semibold text-crm-gold">
                            {contact.interes ? (
                              <span className="flex items-center gap-1">
                                <ShoppingCart className="h-3 w-3 shrink-0" />
                                {contact.interes}
                              </span>
                            ) : (
                              <span className="text-crm-faint italic font-normal text-[10px]">No especificado</span>
                            )}
                          </td>

                          {/* Proxima Accion */}
                          <td className="px-4 py-3">
                            {contact.proximaAccion ? (
                              <div className="flex items-center gap-1 font-medium text-crm-cyan">
                                <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                                {contact.proximaAccion}
                              </div>
                            ) : (
                              <span className="text-crm-faint italic text-[10px]">Sin acción</span>
                            )}
                          </td>

                          {/* Last Interaction / Notes */}
                          <td className="px-4 py-3">
                            <div className="text-[10px] text-crm-muted max-w-[200px] truncate" title={contact.notas}>
                              {contact.notas || <span className="text-crm-faint italic">Sin notas</span>}
                            </div>
                            {contact.ultimaInteraccion && (
                              <div className="text-[9px] text-crm-faint mt-0.5 font-mono">
                                Int: {contact.ultimaInteraccion}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedContact(contact)}
                                className="px-2.5 py-1.5 rounded border border-crm-line bg-crm-surface hover:bg-crm-surface2 text-crm-text font-bold transition-all"
                              >
                                Ver
                              </button>
                              {contact.contactableWhatsapp ? (
                                <a
                                  href={buildWhatsAppContactLink(contact.telefonoNormalizado || contact.telefono, getContactLaunchMessage())}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-[#25D366] hover:bg-[#20ba56] text-white font-bold transition-all shadow-sm"
                                >
                                  <MessageSquare className="h-3.5 w-3.5 fill-current shrink-0" />
                                  WhatsApp
                                </a>
                              ) : (
                                <button
                                  disabled
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded bg-crm-surface border border-crm-line text-crm-muted font-bold cursor-not-allowed opacity-50"
                                  title="Número de teléfono no apto para WhatsApp"
                                >
                                  <MessageSquare className="h-3.5 w-3.5 fill-current shrink-0" />
                                  Revisar teléfono
                                </button>
                              )}
                              <button
                                onClick={() => handleCopyMessage(getContactLaunchMessage())}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-crm-line bg-crm-surface hover:bg-crm-surface2 text-crm-text font-bold transition-all"
                              >
                                <Copy className="h-3.5 w-3.5 shrink-0" />
                                Copiar
                              </button>
                              <button
                                onClick={() => openFollowUp(contact)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-crm-line bg-crm-surface hover:bg-crm-surface2 text-crm-text font-bold transition-all"
                              >
                                <Clock className="h-3.5 w-3.5 shrink-0" />
                                Seguimiento
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalFilteredContacts > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-crm-line bg-crm-surface2">
                    <div className="text-xs text-crm-muted">
                      {contactsSearchQuery ? (
                        <>
                          Resultados de búsqueda: <span className="font-semibold text-crm-text">{totalFilteredContacts}</span> de{" "}
                          <span className="font-semibold text-crm-text">{totalContactsCount}</span> contactos
                        </>
                      ) : (
                        <>
                          Mostrando <span className="font-semibold text-crm-text">{startIndex + 1}-{endIndex}</span> de{" "}
                          <span className="font-semibold text-crm-text">{totalFilteredContacts}</span> contactos
                          {contactsFilter !== "all" && ` (filtrados de ${totalContactsCount})`}
                        </>
                      )}
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setContactsPage(1)}
                          disabled={contactsPage === 1}
                          className="px-2.5 py-1.5 rounded-lg border border-crm-line bg-crm-surface text-crm-text text-xs font-bold transition-all hover:bg-crm-surface3 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Ir a la primera página"
                        >
                          «
                        </button>
                        <button
                          onClick={() => setContactsPage((p) => Math.max(1, p - 1))}
                          disabled={contactsPage === 1}
                          className="px-3 py-1.5 rounded-lg border border-crm-line bg-crm-surface text-crm-text text-xs font-bold transition-all hover:bg-crm-surface3 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Anterior
                        </button>
                        
                        <span className="text-xs text-crm-muted font-semibold px-2">
                          Página {contactsPage} de {totalPages || 1}
                        </span>
                        
                        <button
                          onClick={() => setContactsPage((p) => Math.min(totalPages, p + 1))}
                          disabled={contactsPage === totalPages || totalPages === 0}
                          className="px-3 py-1.5 rounded-lg border border-crm-line bg-crm-surface text-crm-text text-xs font-bold transition-all hover:bg-crm-surface3 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Siguiente
                        </button>
                        <button
                          onClick={() => setContactsPage(totalPages)}
                          disabled={contactsPage === totalPages || totalPages === 0}
                          className="px-2.5 py-1.5 rounded-lg border border-crm-line bg-crm-surface text-crm-text text-xs font-bold transition-all hover:bg-crm-surface3 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Ir a la última página"
                        >
                          »
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16 text-crm-muted space-y-3">
                <ShieldAlert className="h-10 w-10 text-crm-gold/40 mx-auto" />
                <h3 className="text-sm font-bold text-crm-text">No se encontraron contactos</h3>
                <p className="text-xs text-crm-faint max-w-xs mx-auto">
                  Aún no hay contactos en el directorio que coincidan con los filtros seleccionados.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEAD DETALLE MODAL */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-crm-surface border border-crm-line w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 my-auto sm:my-8">
            {/* Header */}
            <div className="border-b border-crm-line bg-crm-surface2 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-crm-text flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5 text-crm-gold" />
                  Detalle del Pedido ({selectedLead.id})
                </h2>
                <p className="text-[11px] text-crm-faint mt-0.5">
                  Registrado el {selectedLead.fecha} • Origen: {selectedLead.origen || "tienda_botanica"}
                </p>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-full border border-crm-line bg-crm-surface px-2.5 py-1 text-crm-muted hover:text-crm-text hover:bg-crm-surface2 transition-all text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto text-crm-text">
              
              {/* Secciones en 2 Columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Datos del Cliente */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-crm-muted uppercase tracking-wider border-b border-crm-line pb-1.5 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5" />
                    Datos del Cliente
                  </h3>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-crm-faint">Nombre completo:</span>
                      <span className="font-semibold">{selectedLead.nombre} {selectedLead.apellido || ""}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-crm-faint">WhatsApp:</span>
                      <a href={`tel:${selectedLead.whatsapp}`} className="font-semibold text-crm-cyan hover:underline">{selectedLead.whatsapp}</a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-crm-faint">Método de pago:</span>
                      <span className="font-semibold">{selectedLead.metodoPago || "Transferencia"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-crm-faint">Origen del lead:</span>
                      <span className="font-semibold">{selectedLead.origenLead || "tienda"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-crm-faint">Correo:</span>
                      <span className="font-semibold">{selectedLead.email || "No provisto"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-crm-faint">Estado del Pedido:</span>
                      <Badge className="bg-crm-gold/10 border border-crm-gold/30 text-crm-gold text-[9px] py-0.5 px-1.5 uppercase font-bold">{selectedLead.estado}</Badge>
                    </div>
                  </div>
                </div>

                {/* Entrega y Ubicación */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-crm-muted uppercase tracking-wider border-b border-crm-line pb-1.5 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    Envío y Entrega
                  </h3>
                  <div className="text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-crm-faint">Provincia:</span>
                      <span className="font-semibold">{selectedLead.provincia}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-crm-faint">Municipio/Sector:</span>
                      <span className="font-semibold">{selectedLead.municipio || "No provisto"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-crm-faint">Método de entrega:</span>
                      <span className="font-semibold">
                        {selectedLead.deliveryMethod === "retiro" 
                          ? "Retiro Coordinado" 
                          : "Entrega Coordinada"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DIRECCION DETALLADA */}
              <div className="space-y-2.5 bg-crm-surface2/40 border border-crm-line p-4 rounded-2xl">
                <div className="text-xs">
                  <span className="font-bold text-crm-text block mb-1">Dirección exacta:</span>
                  <span className="leading-relaxed">{selectedLead.direccion}</span>
                </div>
                {selectedLead.referencia && (
                  <div className="text-xs border-t border-crm-line pt-2">
                    <span className="font-bold text-crm-muted block mb-0.5">Referencia:</span>
                    <span className="italic">&quot;{selectedLead.referencia}&quot;</span>
                  </div>
                )}
                {selectedLead.notas && (
                  <div className="text-xs border-t border-crm-line pt-2">
                    <span className="font-bold text-crm-muted block mb-0.5">Indicaciones especiales:</span>
                    <span className="font-mono text-[11px]">&quot;{selectedLead.notas}&quot;</span>
                  </div>
                )}
                {selectedLead.googleMapsUrl && (
                  <div className="text-xs border-t border-crm-line pt-2.5 flex items-center justify-between gap-4">
                    <div className="overflow-hidden">
                      <span className="font-bold text-crm-cyan block mb-0.5">Ubicación de Google Maps:</span>
                      <span className="text-crm-faint font-mono text-[10px] truncate max-w-[320px] block" title={selectedLead.googleMapsUrl}>{selectedLead.googleMapsUrl}</span>
                    </div>
                    <a
                      href={selectedLead.googleMapsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-crm-cyan/20 border border-crm-cyan/40 text-crm-cyan hover:bg-crm-cyan/30 px-3.5 py-2 rounded-lg text-xs font-bold transition-all shadow-sm shrink-0"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Abrir ubicación
                    </a>
                  </div>
                )}
              </div>

              {/* DETALLES PLAN QUINCENAL */}
              {(selectedLead.modalidadPago === "Plan Quincenal" || selectedLead.modalidadPago === "Plan Quincenal Clienta Fiel") && (
                <div className="space-y-3 bg-[#c5a059]/10 border border-[#c5a059]/30 p-4 rounded-2xl">
                  <h3 className="text-xs font-extrabold text-crm-gold uppercase tracking-wider flex items-center gap-1.5 border-b border-[#c5a059]/20 pb-1.5">
                    <Sparkles className="h-4 w-4 shrink-0" />
                    Beneficio: Plan Quincenal Clienta Fiel 🌿
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-crm-surface2 p-2.5 rounded-xl border border-crm-line">
                      <span className="text-[10px] text-crm-muted block">Monto Total</span>
                      <span className="font-bold text-crm-text">RD$ {(selectedLead.montoTotal || selectedLead.total || 0).toLocaleString()}</span>
                    </div>
                    
                    <div className="bg-crm-surface2 p-2.5 rounded-xl border border-crm-line">
                      <span className="text-[10px] text-crm-muted block">Por cobrar</span>
                      <span className="font-bold text-crm-teal">RD$ {getRemainingAmount(selectedLead).toLocaleString()}</span>
                    </div>

                    <div className="bg-crm-surface2 p-2.5 rounded-xl border border-crm-line">
                      <span className="text-[10px] text-crm-muted block">Próximo Pago</span>
                      <span className="font-bold text-crm-text">
                        {selectedLead.estadoPlan === "Cuota 2 pendiente" || selectedLead.estadoPlan === "Cuota 1 pagada" 
                          ? selectedLead.fechaCuota2 || "N/A"
                          : selectedLead.fechaCuota1 || "N/A"}
                      </span>
                    </div>

                    <div className="bg-crm-surface2 p-2.5 rounded-xl border border-crm-line">
                      <span className="text-[10px] text-crm-muted block">Estado Plan</span>
                      <Badge variant="outline" className={`text-[8px] mt-0.5 py-0 px-1 font-bold ${getPlanStatusBadge(selectedLead.estadoPlan || "Pendiente inicio")}`}>
                        {selectedLead.estadoPlan || "Pendiente inicio"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="bg-crm-surface border border-crm-line p-3 rounded-xl">
                      <span className="font-bold text-crm-text block mb-1 text-[10px] uppercase text-crm-muted">Primera Cuota (Día 15)</span>
                      <div className="flex justify-between">
                        <span className="text-crm-faint">Monto:</span>
                        <span className="font-semibold text-crm-text">RD$ {(selectedLead.cuota1 || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crm-faint">Fecha Límite:</span>
                        <span className="font-mono text-crm-muted">{selectedLead.fechaCuota1 || "Sin fecha"}</span>
                      </div>
                    </div>

                    <div className="bg-crm-surface border border-crm-line p-3 rounded-xl">
                      <span className="font-bold text-crm-text block mb-1 text-[10px] uppercase text-crm-muted">Segunda Cuota (Día 30)</span>
                      <div className="flex justify-between">
                        <span className="text-crm-faint">Monto:</span>
                        <span className="font-semibold text-crm-text">RD$ {(selectedLead.cuota2 || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-crm-faint">Fecha Límite:</span>
                        <span className="font-mono text-crm-muted">{selectedLead.fechaCuota2 || "Sin fecha"}</span>
                      </div>
                    </div>
                  </div>

                  {selectedLead.observaciones && (
                    <div className="text-xs p-2.5 rounded-xl bg-crm-surface/40 border border-crm-line mt-2">
                      <span className="font-semibold text-crm-muted block mb-0.5">Observaciones del Plan:</span>
                      <p className="italic text-crm-text">&quot;{selectedLead.observaciones}&quot;</p>
                    </div>
                  )}
                </div>
              )}

              {/* PRODUCTOS COMPRADOS */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-crm-muted uppercase tracking-wider border-b border-crm-line pb-1.5">Resumen de Productos</h3>
                <div className="bg-crm-surface2/60 border border-crm-line rounded-2xl overflow-hidden divide-y divide-crm-line">
                  {(() => {
                    try {
                      const items = JSON.parse(selectedLead.itemsJson || "[]");
                      if (Array.isArray(items) && items.length > 0) {
                        return items.map((item: CartItem, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-3 text-xs">
                            <div>
                              <span className="font-bold">{item.name}</span>
                              <span className="block text-[10px] text-crm-faint font-mono">
                                SKU: {item.sku || "N/A"} • Cat: {item.category || "N/A"}
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold">{item.quantity} x RD$ {item.price.toLocaleString()}</span>
                              <span className="block text-[11px] font-bold text-crm-gold">RD$ {(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                          </div>
                        ));
                      }
                    } catch {}
                    
                    return (
                      <div className="p-4 text-xs font-semibold">
                        {selectedLead.itemsSummary || selectedLead.producto || "Detalle no disponible"}
                        {selectedLead.cantidad && ` x ${selectedLead.cantidad}`}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* TOTALES */}
              <div className="bg-crm-surface2 border border-crm-line rounded-2xl p-4 flex flex-wrap justify-between items-center gap-4">
                <div className="flex gap-6 text-xs text-crm-muted">
                  {selectedLead.subtotal ? (
                    <div>
                      <span>Subtotal:</span>
                      <span className="block font-bold">RD$ {selectedLead.subtotal.toLocaleString()}</span>
                    </div>
                  ) : null}
                  {config.showTaxBreakdown && selectedLead.tax ? (
                    <div>
                      <span>ITBIS (18%):</span>
                      <span className="block font-bold">RD$ {selectedLead.tax.toLocaleString()}</span>
                    </div>
                  ) : null}
                  {selectedLead.delivery !== undefined ? (
                    <div>
                      <span>Envío:</span>
                      <span className="block font-bold">
                        {selectedLead.delivery === 0 ? "Gratis" : `RD$ ${selectedLead.delivery.toLocaleString()}`}
                      </span>
                    </div>
                  ) : null}
                </div>
                
                <div className="text-right border-t md:border-t-0 md:border-l border-crm-line pt-2 md:pt-0 md:pl-6">
                  <span className="text-xs text-crm-muted block">Total General</span>
                  <span className="text-lg font-black text-crm-teal">
                    RD$ {(selectedLead.total || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* UTM Params */}
              {selectedLead.utm_source && (
                <div className="space-y-1.5">
                  <h4 className="text-[10px] font-bold text-crm-faint uppercase tracking-wider">Parámetros de Campaña (UTM)</h4>
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                    <span className="bg-crm-surface3 border border-crm-line px-2 py-0.5 rounded text-crm-muted">Source: {selectedLead.utm_source}</span>
                    {selectedLead.utm_medium && <span className="bg-crm-surface3 border border-crm-line px-2 py-0.5 rounded text-crm-muted">Medium: {selectedLead.utm_medium}</span>}
                    {selectedLead.utm_campaign && <span className="bg-crm-surface3 border border-crm-line px-2 py-0.5 rounded text-crm-muted">Campaign: {selectedLead.utm_campaign}</span>}
                    {selectedLead.utm_content && <span className="bg-crm-surface3 border border-crm-line px-2 py-0.5 rounded text-crm-muted">Content: {selectedLead.utm_content}</span>}
                  </div>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="border-t border-crm-line bg-crm-surface2 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedLead(null)}
                className="rounded-full border border-crm-line bg-crm-surface hover:bg-crm-surface3 text-crm-text px-5 py-2 text-xs font-bold transition-all"
              >
                Cerrar
              </button>
              <a
                href={buildWhatsAppContactLink(selectedLead.whatsapp, getLeadMessage(selectedLead))}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#25D366] hover:bg-[#20ba56] text-white px-5 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
              >
                <MessageSquare className="h-4 w-4 fill-current shrink-0" />
                Contactar por WhatsApp
              </a>
            </div>

          </div>
        </div>
      )}

      {/* CONTACT DETAIL MODAL */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-crm-surface border border-crm-line w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 my-auto sm:my-8">
            <div className="border-b border-crm-line bg-crm-surface2 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-crm-text flex items-center gap-2">
                  <User className="h-5 w-5 text-crm-gold" />
                  Detalle del Contacto
                </h2>
                <p className="text-[11px] text-crm-faint mt-0.5">ID: {selectedContact.id}</p>
              </div>
              <button
                onClick={() => setSelectedContact(null)}
                className="rounded-full border border-crm-line bg-crm-surface px-2.5 py-1 text-crm-muted hover:text-crm-text hover:bg-crm-surface2 transition-all text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-crm-text text-xs max-h-[85vh] overflow-y-auto">
              <div className="space-y-2">
                <div className="flex justify-between border-b border-crm-line pb-1.5">
                  <span className="text-crm-faint">Nombre:</span>
                  <span className="font-bold text-crm-text">{selectedContact.nombre}</span>
                </div>
                <div className="flex justify-between border-b border-crm-line pb-1.5">
                  <span className="text-crm-faint">Teléfono original:</span>
                  <span className="font-mono text-crm-text">{selectedContact.telefono}</span>
                </div>
                <div className="flex justify-between border-b border-crm-line pb-1.5">
                  <span className="text-crm-faint">Normalizado:</span>
                  <span className="font-mono text-crm-text">{selectedContact.telefonoNormalizado}</span>
                </div>
                <div className="flex justify-between border-b border-crm-line pb-1.5">
                  <span className="text-crm-faint">Origen Importación:</span>
                  <span>{selectedContact.origen}</span>
                </div>
                {selectedContact.email && (
                  <div className="flex justify-between border-b border-crm-line pb-1.5">
                    <span className="text-crm-faint">Email:</span>
                    <span className="font-mono text-crm-text">{selectedContact.email}</span>
                  </div>
                )}
                {selectedContact.organizacion && (
                  <div className="flex justify-between border-b border-crm-line pb-1.5">
                    <span className="text-crm-faint">Organización:</span>
                    <span>{selectedContact.organizacion}</span>
                  </div>
                )}
                {selectedContact.estadoImportacion && (
                  <div className="flex justify-between border-b border-crm-line pb-1.5">
                    <span className="text-crm-faint">Estado Importación:</span>
                    <span className="flex items-center gap-1.5">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                        selectedContact.estadoImportacion === "Importado" ? "bg-green-400" : "bg-yellow-500"
                      }`} />
                      <span>{selectedContact.estadoImportacion}</span>
                      {selectedContact.motivoRevision && <span className="text-crm-muted">({selectedContact.motivoRevision})</span>}
                    </span>
                  </div>
                )}
                <div className="flex justify-between border-b border-crm-line pb-1.5">
                  <span className="text-crm-faint">Clienta Fiel:</span>
                  <span>
                    {selectedContact.clientaFiel ? (
                      <Badge className="bg-crm-gold/25 border border-crm-gold/40 text-crm-gold py-0 text-[8px] font-bold">
                        Sí (Lanzamiento)
                      </Badge>
                    ) : (
                      "No"
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-b border-crm-line pb-1.5">
                  <span className="text-crm-faint">Cohorte:</span>
                  <span className="font-bold">{selectedContact.cohortes || "General"}</span>
                </div>
                <div className="flex justify-between border-b border-crm-line pb-1.5">
                  <span className="text-crm-faint">Estado Contacto:</span>
                  <Badge variant="outline" className="text-[9px] py-0 px-1.5">{selectedContact.estadoContacto}</Badge>
                </div>
                <div className="flex justify-between border-b border-crm-line pb-1.5">
                  <span className="text-crm-faint">Interés/Producto:</span>
                  <span className="font-bold text-crm-gold">{selectedContact.interes || "Ninguno registrado"}</span>
                </div>
                {selectedContact.ultimaInteraccion && (
                  <div className="flex justify-between border-b border-crm-line pb-1.5">
                    <span className="text-crm-faint">Última Interacción:</span>
                    <span>{selectedContact.ultimaInteraccion}</span>
                  </div>
                )}
                {selectedContact.proximaAccion && (
                  <div className="flex justify-between border-b border-crm-line pb-1.5">
                    <span className="text-crm-faint text-crm-cyan font-bold">Próxima Acción:</span>
                    <span className="font-bold text-crm-cyan">{selectedContact.proximaAccion}</span>
                  </div>
                )}
              </div>

              {selectedContact.notas && (
                <div className="bg-crm-surface2/50 border border-crm-line p-3 rounded-xl">
                  <span className="font-semibold text-crm-muted block mb-1">Notas del contacto:</span>
                  <p className="italic leading-normal text-crm-text font-sans text-[11px]">&quot;{selectedContact.notas}&quot;</p>
                </div>
              )}
            </div>

            <div className="border-t border-crm-line bg-crm-surface2 px-6 py-4 flex justify-end gap-2">
              <button
                onClick={() => setSelectedContact(null)}
                className="rounded-full border border-crm-line bg-crm-surface hover:bg-crm-surface3 text-crm-text px-5 py-2 text-xs font-bold transition-all"
              >
                Cerrar
              </button>
              <button
                onClick={() => {
                  setSelectedContact(null);
                  setMessageContact(selectedContact);
                }}
                className="rounded-full bg-[#25D366] hover:bg-[#20ba56] text-white px-5 py-2 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <MessageSquare className="h-4 w-4 fill-current shrink-0" />
                Plantilla WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOLLOW-UP MODAL */}
      {followUpContact && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-crm-line bg-crm-surface shadow-2xl my-auto sm:my-8">
            <div className="flex items-center justify-between border-b border-crm-line bg-crm-surface2 px-6 py-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-extrabold text-crm-text">
                  <Clock className="h-5 w-5 text-crm-gold" />
                  Registrar seguimiento
                </h2>
                <p className="mt-0.5 text-[11px] text-crm-faint">
                  Contacto: <span className="font-bold text-crm-text">{followUpContact.nombre}</span>
                </p>
              </div>
              <button
                onClick={() => setFollowUpContact(null)}
                className="rounded-full border border-crm-line bg-crm-surface px-2.5 py-1 text-xs font-bold text-crm-muted transition-all hover:bg-crm-surface2 hover:text-crm-text"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-4 p-6 text-xs max-h-[85vh] overflow-y-auto">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="font-bold text-crm-muted">Estado</span>
                  <select
                    value={followUpForm.estado_contacto}
                    onChange={(event) =>
                      setFollowUpForm((current) => ({ ...current, estado_contacto: event.target.value }))
                    }
                    className="w-full rounded-xl border border-crm-line bg-crm-bg px-3 py-2 text-crm-text outline-none focus:border-crm-gold"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="Seguimiento">Seguimiento</option>
                    <option value="Contactada">Contactada</option>
                    <option value="Interesada">Interesada</option>
                    <option value="No interesada">No interesada</option>
                    <option value="Comprar despues">Comprar despues</option>
                  </select>
                </label>

                <label className="space-y-1">
                  <span className="font-bold text-crm-muted">Accion</span>
                  <select
                    value={followUpForm.accion}
                    onChange={(event) =>
                      setFollowUpForm((current) => ({ ...current, accion: event.target.value }))
                    }
                    className="w-full rounded-xl border border-crm-line bg-crm-bg px-3 py-2 text-crm-text outline-none focus:border-crm-gold"
                  >
                    <option value="Lanzamiento">Lanzamiento</option>
                    <option value="Seguimiento">Seguimiento</option>
                    <option value="Pago quincenal">Pago quincenal</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <label className="space-y-1">
                  <span className="font-bold text-crm-muted">Ultima interaccion</span>
                  <input
                    type="date"
                    value={followUpForm.ultima_interaccion}
                    onChange={(event) =>
                      setFollowUpForm((current) => ({ ...current, ultima_interaccion: event.target.value }))
                    }
                    className="w-full rounded-xl border border-crm-line bg-crm-bg px-3 py-2 text-crm-text outline-none focus:border-crm-gold"
                  />
                </label>

                <label className="space-y-1">
                  <span className="font-bold text-crm-muted">Proxima fecha</span>
                  <input
                    type="date"
                    value={followUpForm.proxima_fecha}
                    onChange={(event) =>
                      setFollowUpForm((current) => ({ ...current, proxima_fecha: event.target.value }))
                    }
                    className="w-full rounded-xl border border-crm-line bg-crm-bg px-3 py-2 text-crm-text outline-none focus:border-crm-gold"
                  />
                </label>
              </div>

              <label className="space-y-1 block">
                <span className="font-bold text-crm-muted">Proxima accion</span>
                <input
                  type="text"
                  value={followUpForm.proxima_accion}
                  onChange={(event) =>
                    setFollowUpForm((current) => ({ ...current, proxima_accion: event.target.value }))
                  }
                  className="w-full rounded-xl border border-crm-line bg-crm-bg px-3 py-2 text-crm-text outline-none focus:border-crm-gold"
                />
              </label>

              <label className="space-y-1 block">
                <span className="font-bold text-crm-muted">Notas</span>
                <textarea
                  rows={3}
                  value={followUpForm.notas}
                  onChange={(event) =>
                    setFollowUpForm((current) => ({ ...current, notas: event.target.value }))
                  }
                  className="w-full resize-none rounded-xl border border-crm-line bg-crm-bg px-3 py-2 text-crm-text outline-none focus:border-crm-gold"
                />
              </label>

              {followUpStatus && (
                <div className="rounded-xl border border-crm-line bg-crm-surface2 px-3 py-2 text-crm-muted">
                  {followUpStatus}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-crm-line bg-crm-surface2 px-6 py-4">
              <button
                onClick={() => setFollowUpContact(null)}
                className="rounded-full border border-crm-line bg-crm-surface px-5 py-2 text-xs font-bold text-crm-muted transition-all hover:bg-crm-surface3"
              >
                Cancelar
              </button>
              <button
                onClick={saveFollowUp}
                disabled={followUpSaving}
                className="rounded-full bg-crm-gold px-5 py-2 text-xs font-bold text-white transition-all hover:bg-crm-gold/90 disabled:opacity-50"
              >
                {followUpSaving ? "Guardando..." : "Guardar seguimiento"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WHATSAPP TEMPLATE COMPOSER MODAL */}
      {messageContact && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-crm-surface border border-crm-line w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200 my-auto sm:my-8">
            <div className="border-b border-crm-line bg-crm-surface2 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-crm-text flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-crm-gold" />
                  Enviar Mensaje — Ivette Berroa
                </h2>
                <p className="text-[11px] text-crm-faint mt-0.5">
                  Contacto: <span className="font-bold text-crm-text">{messageContact.nombre}</span> ({messageContact.telefono})
                </p>
              </div>
              <button
                onClick={() => {
                  setMessageContact(null);
                  setSelectedTemplateIndex(0);
                }}
                className="rounded-full border border-crm-line bg-crm-surface px-2.5 py-1 text-crm-muted hover:text-crm-text hover:bg-crm-surface2 transition-all text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[85vh] overflow-y-auto">
              {/* Template selector tabs */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-crm-muted block">
                  Selecciona una Plantilla:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {getTemplates(messageContact.nombre).map((tmpl, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTemplateIndex(idx)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all flex flex-col justify-between ${
                        selectedTemplateIndex === idx
                          ? "border-crm-gold bg-crm-gold/5 text-crm-gold font-bold"
                          : "border-crm-line bg-crm-surface2 hover:bg-crm-surface3 text-crm-muted"
                      }`}
                    >
                      <span className="font-semibold block truncate">{tmpl.title.split(" — ")[1]}</span>
                      <span className="text-[9px] opacity-75 mt-1 font-mono">{tmpl.title.split(" — ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Message Live Preview */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-crm-muted">
                    Vista Previa del Mensaje:
                  </span>
                  {copiedText && (
                    <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded animate-pulse">
                      <Check className="h-3 w-3" /> ¡Copiado!
                    </span>
                  )}
                </div>
                <div className="bg-crm-bg border border-crm-line p-4 rounded-2xl font-sans text-xs leading-relaxed text-crm-text whitespace-pre-wrap select-all font-mono">
                  {getTemplates(messageContact.nombre)[selectedTemplateIndex].text}
                </div>
              </div>

              <div className="bg-crm-surface2/50 border border-crm-line p-3 rounded-xl flex items-start gap-2 text-[10px] text-crm-muted leading-relaxed">
                <Info className="h-4 w-4 shrink-0 text-crm-gold mt-0.5" />
                <span>
                  El botón de enviar abrirá automáticamente WhatsApp con el texto codificado. Si el número tiene formato internacional local, se resolverá de forma óptima.
                </span>
              </div>
            </div>

            <div className="border-t border-crm-line bg-crm-surface2 px-6 py-4 flex justify-between items-center">
              <button
                onClick={() => handleCopyMessage(getTemplates(messageContact!.nombre)[selectedTemplateIndex].text)}
                className="inline-flex items-center gap-1.5 border border-crm-line bg-crm-surface hover:bg-crm-surface3 text-crm-text px-4 py-2 rounded-full text-xs font-bold transition-all"
              >
                <Copy className="h-3.5 w-3.5" />
                Copiar Mensaje
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setMessageContact(null);
                    setSelectedTemplateIndex(0);
                  }}
                  className="rounded-full border border-crm-line bg-crm-surface hover:bg-crm-surface3 text-crm-muted px-5 py-2 text-xs font-bold transition-all"
                >
                  Cancelar
                </button>
                <a
                  href={buildWhatsAppContactLink(
                    messageContact.telefonoNormalizado || messageContact.telefono,
                    getTemplates(messageContact.nombre)[selectedTemplateIndex].text
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setMessageContact(null);
                    setSelectedTemplateIndex(0);
                  }}
                  className="rounded-full bg-[#25D366] hover:bg-[#20ba56] text-white px-5 py-2 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                >
                  <MessageSquare className="h-4 w-4 fill-current shrink-0" />
                  Enviar WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
