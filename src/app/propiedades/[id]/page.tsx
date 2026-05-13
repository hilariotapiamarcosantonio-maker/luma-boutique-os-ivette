import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bath,
  Bed,
  Building,
  Calendar,
  CheckCircle2,
  DollarSign,
  MapPin,
  Tag,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getLeads } from "@/lib/crm-data/get-leads";
import { getProperties } from "@/lib/crm-data/get-properties";
import { getVisits } from "@/lib/crm-data/get-visits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function propertyStatusClass(status: string) {
  if (status === "Disponible") {
    return "bg-crm-green/20 text-crm-green border-crm-green/30";
  }
  if (status === "Reservada") {
    return "bg-crm-amber/20 text-crm-amber border-crm-amber/30";
  }
  if (status === "Vendida") {
    return "bg-crm-faint/20 text-crm-faint border-crm-faint/30";
  }
  return "bg-crm-red/20 text-crm-red border-crm-red/30";
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const properties = await getProperties();
  const property = properties.find((item) => item.id === params.id);

  if (!property) {
    notFound();
  }

  const [allLeads, allVisits] = await Promise.all([getLeads(), getVisits()]);
  const relatedLeads = allLeads.filter(
    (lead) => lead.propIdOfInterest === property.id
  );
  const relatedVisits = allVisits.filter((visit) => visit.propId === property.id);

  return (
    <div className="mx-auto max-w-6xl space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <Link
          href="/propiedades"
          aria-label="Volver a propiedades"
          className="inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md border border-crm-line bg-crm-surface text-sm font-medium text-crm-text transition-colors hover:bg-crm-surface2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold text-crm-text">
            {property.ref}
            <Badge
              className={`font-medium shadow-sm ${propertyStatusClass(
                property.status
              )}`}
              variant="outline"
            >
              {property.status}
            </Badge>
          </h1>
          <p className="mt-1 text-sm text-crm-muted">
            ID: <span className="text-crm-faint">{property.id}</span>
          </p>
        </div>
      </div>

      <div className="relative flex h-64 w-full flex-col items-center justify-center overflow-hidden rounded-lg border border-crm-line bg-crm-bg2 sm:h-80 md:h-96">
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-crm-bg to-transparent" />
        <div className="select-none text-[5rem] font-black uppercase tracking-tighter text-crm-surface3 opacity-40 sm:text-[8rem] md:text-[10rem]">
          {property.img || property.ref.substring(0, 2)}
        </div>
        <div className="absolute bottom-6 left-6 right-6 z-20 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="mb-2 text-3xl font-bold text-white">
              {property.ref}
            </h2>
            <p className="flex items-center gap-2 text-sm text-crm-muted sm:text-base">
              <MapPin className="h-4 w-4" />
              {property.address || property.zone}
            </p>
          </div>
          <div className="text-left sm:text-right">
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-crm-gold">
              {property.operation}
            </p>
            <p className="text-4xl font-bold text-white">{property.price}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border border-crm-line bg-crm-surface p-6 shadow-sm">
            <h2 className="mb-6 text-lg font-semibold text-crm-text">
              Especificaciones
            </h2>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
              <div className="flex flex-col items-center justify-center rounded-lg border border-crm-line/50 bg-crm-bg2 p-4">
                <Bed className="mb-2 h-6 w-6 text-crm-faint" />
                <span className="text-lg font-bold text-crm-text">
                  {property.beds}
                </span>
                <span className="text-xs text-crm-muted">Habitaciones</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-crm-line/50 bg-crm-bg2 p-4">
                <Bath className="mb-2 h-6 w-6 text-crm-faint" />
                <span className="text-lg font-bold text-crm-text">
                  {property.baths}
                </span>
                <span className="text-xs text-crm-muted">Baños</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-crm-line/50 bg-crm-bg2 p-4">
                <Building className="mb-2 h-6 w-6 text-crm-faint" />
                <span className="text-lg font-bold text-crm-text">
                  {property.m2}
                </span>
                <span className="text-xs text-crm-muted">m² const.</span>
              </div>
              <div className="flex flex-col items-center justify-center rounded-lg border border-crm-line/50 bg-crm-bg2 p-4">
                <CheckCircle2 className="mb-2 h-6 w-6 text-crm-faint" />
                <span className="text-lg font-bold text-crm-text">
                  {property.airbnbReady === "Sí" ? "Sí" : "No"}
                </span>
                <span className="text-xs text-crm-muted">Airbnb Ready</span>
              </div>
            </div>

            {property.notes ? (
              <div className="mt-8 border-t border-crm-line pt-6">
                <h3 className="mb-3 text-sm font-medium uppercase tracking-wider text-crm-faint">
                  Descripción interna
                </h3>
                <p className="text-sm leading-relaxed text-crm-muted">
                  {property.notes}
                </p>
              </div>
            ) : null}
          </div>

          <div className="overflow-hidden rounded-lg border border-crm-line bg-crm-surface shadow-sm">
            <div className="flex items-center justify-between border-b border-crm-line bg-crm-surface2 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-crm-blue" />
                <h2 className="text-lg font-semibold text-crm-text">
                  Prospectos Interesados
                </h2>
              </div>
              <Badge variant="secondary" className="bg-crm-bg2">
                {relatedLeads.length}
              </Badge>
            </div>
            {relatedLeads.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-crm-line bg-crm-surface2/50 text-xs uppercase text-crm-muted">
                    <tr>
                      <th className="px-4 py-3 font-medium">Cliente</th>
                      <th className="px-4 py-3 font-medium">Estatus</th>
                      <th className="px-4 py-3 text-right font-medium">Ver</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-crm-line">
                    {relatedLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-crm-bg2">
                        <td className="px-4 py-3 font-medium text-crm-text">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="hover:text-crm-gold"
                          >
                            {lead.name}
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className="border-crm-line text-crm-muted"
                          >
                            {lead.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/leads/${lead.id}`}
                            className="text-xs text-crm-gold hover:underline"
                          >
                            Abrir
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center p-8 text-center text-sm text-crm-faint">
                <Users className="mb-2 h-8 w-8 opacity-20" />
                No hay prospectos vinculados actualmente a este inmueble.
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-crm-line bg-crm-surface p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-crm-text">
              <DollarSign className="h-4 w-4 text-crm-gold" /> Finanzas
            </h3>
            <div className="space-y-4">
              <div>
                <p className="mb-1 text-xs text-crm-faint">
                  Mantenimiento mensual
                </p>
                <p className="text-sm font-medium text-crm-text">
                  {property.maintenance
                    ? `${property.currency} ${property.maintenance}`
                    : "No definido"}
                </p>
              </div>
              <div className="border-t border-crm-line pt-4">
                <p className="mb-1 text-xs text-crm-faint">
                  Comisión esperada
                </p>
                <p className="text-lg font-bold text-crm-green">
                  {property.expectedComm || "0"}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-crm-line bg-crm-surface p-5 shadow-sm">
            <h3 className="mb-4 font-semibold text-crm-text">Clasificación</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2 text-crm-faint">
                  <Tag className="h-3 w-3" /> Tipo
                </span>
                <span className="font-medium text-crm-text">
                  {property.type}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2 text-crm-faint">
                  <Building className="h-3 w-3" /> Zona
                </span>
                <span className="font-medium text-crm-text">
                  {property.zone}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="flex items-center gap-2 text-crm-faint">
                  <Users className="h-3 w-3" /> Asesor
                </span>
                <span className="font-medium text-crm-text">
                  {property.agent || "No asignado"}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-crm-line bg-crm-surface p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 font-semibold text-crm-text">
              <Calendar className="h-4 w-4 text-crm-cyan" /> Tours realizados
            </h3>
            <div className="mb-2 text-3xl font-bold text-crm-text">
              {relatedVisits.length}
            </div>
            <p className="text-xs text-crm-faint">
              Recorridos asociados a este inmueble en el historial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
