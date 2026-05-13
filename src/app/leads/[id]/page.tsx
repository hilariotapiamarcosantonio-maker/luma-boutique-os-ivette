import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building,
  Calendar,
  DollarSign,
  Flame,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Tag,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getClosings } from "@/lib/crm-data/get-closings";
import { getLeads } from "@/lib/crm-data/get-leads";
import { getProperties } from "@/lib/crm-data/get-properties";
import { getVisits } from "@/lib/crm-data/get-visits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function statusClass(status: string) {
  if (status === "Nuevo" || status === "Nuevo lead") {
    return "border-crm-blue text-crm-blue bg-crm-blue/10";
  }
  if (status === "Contactado") {
    return "border-crm-amber text-crm-amber bg-crm-amber/10";
  }
  if (status === "Seguimiento") {
    return "border-crm-violet text-crm-violet bg-crm-violet/10";
  }
  if (status === "Cerrado" || status === "Cierre ganado") {
    return "border-crm-green text-crm-green bg-crm-green/10";
  }
  return "border-crm-red text-crm-red bg-crm-red/10";
}

function phoneForTel(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function phoneForWhatsapp(phone: string) {
  return phone.replace(/\D/g, "");
}

export default async function LeadDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const leads = await getLeads();
  const lead = leads.find((item) => item.id === params.id);

  if (!lead) {
    notFound();
  }

  const [allVisits, allClosings, allProperties] = await Promise.all([
    getVisits(),
    getClosings(),
    getProperties(),
  ]);
  const propertyById = new Map(
    allProperties.map((property) => [property.id, property])
  );
  const relatedVisits = allVisits.filter((visit) => visit.leadId === lead.id);
  const relatedClosings = allClosings.filter(
    (closing) => closing.leadId === lead.id
  );

  const telPhone = phoneForTel(lead.phone);
  const whatsappPhone = phoneForWhatsapp(lead.phone);
  const propertyOfInterest = lead.propIdOfInterest
    ? propertyById.get(lead.propIdOfInterest)
    : undefined;
  const originCampaignItems = [
    { label: "Fuente", value: lead.source },
    { label: "Canal", value: lead.sourceChannel },
    { label: "Campaña", value: lead.campaignName },
    { label: "Conjunto de anuncios", value: lead.adSetName },
    { label: "Anuncio", value: lead.adName },
    { label: "Landing", value: lead.landingPage || lead.landing },
    { label: "UTM Source", value: lead.utmSource },
    { label: "UTM Medium", value: lead.utmMedium },
    { label: "UTM Campaign", value: lead.utmCampaign },
    { label: "UTM Content", value: lead.utmContent },
    { label: "UTM Term", value: lead.utmTerm },
    { label: "Referrer", value: lead.referrer },
    { label: "Click ID", value: lead.clickId },
    { label: "Tipo de Click ID", value: lead.clickIdType },
  ];
  const hasOriginCampaignData = originCampaignItems.some((item) =>
    item.value?.trim()
  );

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/leads"
          aria-label="Volver a leads"
          className="inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md border border-crm-line bg-crm-surface text-sm font-medium text-crm-text transition-colors hover:bg-crm-surface2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold text-crm-text">
            {lead.name}
            <Badge variant="outline" className={statusClass(lead.status)}>
              {lead.status || "Nuevo"}
            </Badge>
          </h1>
          <p className="mt-1 text-sm text-crm-muted">
            ID: <span className="text-crm-faint">{lead.id}</span> | Registrado:{" "}
            {lead.date}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="overflow-hidden rounded-lg border border-crm-line bg-crm-surface shadow-sm">
            <div className="flex items-center gap-2 border-b border-crm-line bg-crm-surface2 p-4">
              <User className="h-5 w-5 text-crm-gold" />
              <h2 className="text-lg font-semibold text-crm-text">
                Perfil Comercial
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-6 md:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-crm-faint">
                  Oportunidad
                </p>
                <Badge
                  className="border-crm-gold/20 bg-crm-gold/10 text-crm-gold hover:bg-crm-gold/20"
                  variant="outline"
                >
                  {lead.opp || "No definida"}
                </Badge>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-crm-faint">
                  Presupuesto
                </p>
                <p className="text-sm font-medium text-crm-text">
                  {lead.budget || "No declarado"}
                </p>
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-crm-faint">
                  Propiedad de interés
                </p>
                {lead.propIdOfInterest ? (
                  <Link
                    href={`/propiedades/${lead.propIdOfInterest}`}
                    className="flex items-center gap-1 text-sm font-medium text-crm-gold hover:underline"
                  >
                    <Building className="h-3 w-3" />
                    {propertyOfInterest?.ref ||
                      lead.propNameOfInterest ||
                      lead.propIdOfInterest}
                  </Link>
                ) : (
                  <p className="text-sm font-medium text-crm-muted">
                    Ninguna vinculada
                  </p>
                )}
              </div>
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-crm-faint">
                  Tipo de cliente
                </p>
                <p className="text-sm font-medium text-crm-text">
                  {lead.clientType || "Desconocido"}
                </p>
              </div>
            </div>

            {lead.notes ? (
              <div className="border-t border-crm-line p-6 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wider text-crm-faint">
                  Observaciones
                </p>
                <p className="rounded-md border border-crm-line/50 bg-crm-bg2 p-3 text-sm leading-relaxed text-crm-muted">
                  {lead.notes}
                </p>
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-lg border border-crm-line bg-crm-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-crm-line bg-crm-surface2 p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-crm-cyan" />
                <h2 className="text-lg font-semibold text-crm-text">
                  Historial de Visitas
                </h2>
              </div>
              <Badge variant="secondary" className="bg-crm-bg2">
                {relatedVisits.length}
              </Badge>
            </div>
            {relatedVisits.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-crm-line bg-crm-surface2/50 text-xs uppercase text-crm-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Fecha/Hora</th>
                      <th className="px-4 py-3 font-medium">Propiedad</th>
                      <th className="px-4 py-3 font-medium">Estatus</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-crm-line">
                    {relatedVisits.map((visit) => {
                      const property = propertyById.get(visit.propId);
                      const propertyName =
                        property?.ref || visit.propId;

                      return (
                        <tr key={visit.id} className="hover:bg-crm-bg2">
                          <td className="px-4 py-3 text-crm-text">
                            {visit.date}
                            <span className="ml-1 text-crm-faint">
                              {visit.time}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {property ? (
                              <Link
                                href={`/propiedades/${property.id}`}
                                className="text-crm-gold hover:underline"
                              >
                                {propertyName}
                              </Link>
                            ) : (
                              <span className="text-crm-muted">
                                {propertyName}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={
                                visit.status === "Completada"
                                  ? "border-crm-green text-crm-green"
                                  : "border-crm-blue text-crm-blue"
                              }
                            >
                              {visit.status}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center p-8 text-center text-sm text-crm-faint">
                <Calendar className="mb-2 h-8 w-8 opacity-20" />
                No hay visitas registradas para este lead.
              </div>
            )}
          </div>

          {relatedClosings.length > 0 ? (
            <div className="overflow-hidden rounded-lg border border-crm-line bg-crm-surface shadow-sm">
              <div className="flex items-center justify-between border-b border-crm-line bg-crm-surface2 p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-crm-green" />
                  <h2 className="text-lg font-semibold text-crm-text">
                    Cierres Ganados
                  </h2>
                </div>
                <Badge className="border-crm-green/30 bg-crm-green/20 text-crm-green hover:bg-crm-green/20">
                  {relatedClosings.length}
                </Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-crm-line bg-crm-surface2/50 text-xs uppercase text-crm-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">ID Cierre</th>
                      <th className="px-4 py-3 font-medium">Operación</th>
                      <th className="px-4 py-3 text-right font-medium">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-crm-line">
                    {relatedClosings.map((closing) => (
                      <tr key={closing.id} className="hover:bg-crm-bg2">
                        <td className="px-4 py-3 font-medium text-crm-faint">
                          {closing.id}
                        </td>
                        <td className="px-4 py-3 text-crm-text">
                          {closing.type}
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-crm-green">
                          {closing.price}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-crm-line bg-crm-surface p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-crm-text">Contacto</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-crm-faint" />
                {telPhone ? (
                  <a
                    href={`tel:${telPhone}`}
                    className="text-crm-text hover:text-crm-gold"
                  >
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-crm-muted">Sin teléfono</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail className="h-4 w-4 text-crm-faint" />
                {lead.email ? (
                  <a
                    href={`mailto:${lead.email}`}
                    className="break-all text-crm-text hover:text-crm-gold"
                  >
                    {lead.email}
                  </a>
                ) : (
                  <span className="text-crm-muted">Sin email</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MapPin className="h-4 w-4 text-crm-faint" />
                <span className="text-crm-text">
                  {lead.zoneOfInterest || "Sin zona definida"}
                </span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-2">
              {whatsappPhone ? (
                <a
                  href={`https://wa.me/${whatsappPhone}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-9 items-center justify-center rounded-md border border-crm-line bg-crm-surface2 text-sm font-medium text-crm-green transition-colors hover:bg-crm-bg2"
                >
                  <MessageCircle className="mr-2 h-4 w-4" /> WhatsApp
                </a>
              ) : null}
              {telPhone ? (
                <a
                  href={`tel:${telPhone}`}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-crm-line bg-crm-surface2 text-sm font-medium text-crm-text transition-colors hover:bg-crm-bg2"
                >
                  <Phone className="mr-2 h-4 w-4" /> Llamar
                </a>
              ) : null}
              {lead.email ? (
                <a
                  href={`mailto:${lead.email}`}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-crm-line bg-crm-surface2 text-sm font-medium text-crm-text transition-colors hover:bg-crm-bg2"
                >
                  <Mail className="mr-2 h-4 w-4" /> Email
                </a>
              ) : null}
            </div>
          </div>

          <div className="rounded-lg border border-crm-line bg-crm-surface p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-crm-text">Seguimiento</h3>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs text-crm-faint">Temperatura</p>
                <div className="flex items-center gap-2">
                  <Flame
                    className={`h-4 w-4 ${
                      lead.temperature === "Caliente"
                        ? "text-crm-red"
                        : lead.temperature === "Tibio"
                          ? "text-crm-amber"
                          : "text-crm-blue"
                    }`}
                  />
                  <span className="text-sm font-medium text-crm-text">
                    {lead.temperature || "Frío"}
                  </span>
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs text-crm-faint">Próximo contacto</p>
                <span className="text-sm text-crm-text">
                  {lead.nextFollowUp || "No programado"}
                </span>
              </div>
              <div>
                <p className="mb-1 text-xs text-crm-faint">
                  Asesor responsable
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border border-crm-line bg-crm-bg2 text-xs text-crm-gold">
                    {lead.agent ? lead.agent.substring(0, 2).toUpperCase() : "NA"}
                  </div>
                  <span className="text-sm text-crm-muted">
                    {lead.agent || "No asignado"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-crm-line bg-crm-surface p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-crm-text">
              <Tag className="h-4 w-4 text-crm-gold" />
              Origen y campaña
            </h3>
            {hasOriginCampaignData ? (
              <div className="space-y-3">
                {originCampaignItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-4 text-sm"
                  >
                    <span className="text-crm-faint">{item.label}</span>
                    <span className="max-w-[60%] break-words text-right font-medium text-crm-text">
                      {item.value || "No registrado"}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-crm-muted">
                No hay datos de atribución registrados para este lead.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
