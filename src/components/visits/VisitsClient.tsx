"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Calendar as CalendarIcon,
  Clock,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Lead, Property, Visit } from "@/types/crm";

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function statusClass(status: string) {
  if (status === "Completada") return "border-crm-green text-crm-green";
  if (status === "Agendada") return "border-crm-blue text-crm-blue";
  return "border-crm-red text-crm-red";
}

function interestClass(interest: string) {
  if (interest === "Alto") return "bg-crm-green/10 text-crm-green";
  if (interest === "Medio") return "bg-crm-amber/10 text-crm-amber";
  return "bg-crm-faint/10 text-crm-faint";
}

type VisitsClientProps = {
  visits: Visit[];
  leads: Lead[];
  properties: Property[];
};

export function VisitsClient({ visits, leads, properties }: VisitsClientProps) {
  const [query, setQuery] = useState("");
  const leadById = useMemo(
    () => new Map(leads.map((lead) => [lead.id, lead])),
    [leads]
  );
  const propertyById = useMemo(
    () => new Map(properties.map((property) => [property.id, property])),
    [properties]
  );

  const normalizedQuery = normalize(query);
  const filteredVisits = useMemo(
    () =>
      visits.filter((visit) => {
        const lead = leadById.get(visit.leadId);
        const property = propertyById.get(visit.propId);

        return [
          visit.id,
          visit.date,
          visit.time,
          visit.leadId,
          lead?.name,
          visit.propId,
          property?.ref,
          visit.agent,
          visit.status,
          visit.interest,
          visit.comments,
          visit.nextStep,
        ]
          .map(normalize)
          .some((value) => value.includes(normalizedQuery));
      }),
    [leadById, normalizedQuery, propertyById, visits]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crm-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cliente, propiedad, fecha o estatus..."
            aria-label="Buscar visitas"
            className="h-10 w-full rounded-md border border-crm-line bg-crm-surface2 pl-9 pr-4 text-sm text-crm-text placeholder:text-crm-faint focus:border-crm-gold focus:outline-none focus:ring-1 focus:ring-crm-gold"
          />
        </div>
        <button
          type="button"
          disabled
          title="Próximamente"
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-crm-line bg-crm-surface px-3 text-sm text-crm-muted opacity-60"
        >
          <CalendarIcon className="mr-2 h-4 w-4" /> Rango - Próximamente
        </button>
        <button
          type="button"
          disabled
          title="Próximamente"
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-crm-gold px-4 text-sm font-medium text-[#080B0E] opacity-60"
        >
          <Plus className="mr-2 h-4 w-4" /> Registrar visita - Próximamente
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-crm-line bg-crm-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-crm-line bg-crm-surface2 text-xs uppercase text-crm-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha y hora</th>
                <th className="px-6 py-4 font-medium">Prospecto</th>
                <th className="px-6 py-4 font-medium">Propiedad</th>
                <th className="px-6 py-4 font-medium">Asesor</th>
                <th className="px-6 py-4 font-medium">Interés</th>
                <th className="px-6 py-4 font-medium">Estatus</th>
                <th className="px-6 py-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-line">
              {filteredVisits.map((visit) => {
                const lead = leadById.get(visit.leadId);
                const property = propertyById.get(visit.propId);
                const leadName = lead?.name || visit.leadId;
                const propertyName = property?.ref || visit.propId;

                return (
                  <tr
                    key={visit.id}
                    className="transition-colors hover:bg-crm-bg2"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center font-medium text-crm-text">
                        <CalendarIcon className="mr-2 h-4 w-4 text-crm-faint" />
                        {visit.date}
                      </div>
                      <div className="mt-1 flex items-center text-xs text-crm-muted">
                        <Clock className="mr-2 h-3 w-3 text-crm-faint" />
                        {visit.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {lead ? (
                        <Link
                          href={`/leads/${lead.id}`}
                          className="font-semibold text-crm-text hover:text-crm-gold"
                        >
                          {leadName}
                        </Link>
                      ) : (
                        <span className="font-semibold text-crm-text">
                          {leadName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {property ? (
                        <Link
                          href={`/propiedades/${property.id}`}
                          className="font-medium text-crm-gold hover:underline"
                        >
                          {propertyName}
                        </Link>
                      ) : (
                        <span className="text-crm-gold">{propertyName}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-crm-muted">{visit.agent}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${interestClass(
                          visit.interest
                        )}`}
                      >
                        {visit.interest}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={statusClass(visit.status)}>
                        {visit.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        {lead ? (
                          <Link
                            href={`/leads/${lead.id}`}
                            className="inline-flex h-8 items-center rounded-md px-2 text-sm font-medium text-crm-gold transition-colors hover:bg-crm-surface2"
                          >
                            Ver lead
                          </Link>
                        ) : null}
                        {property ? (
                          <Link
                            href={`/propiedades/${property.id}`}
                            className="inline-flex h-8 items-center rounded-md px-2 text-sm font-medium text-crm-cyan transition-colors hover:bg-crm-surface2"
                          >
                            Ver propiedad
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredVisits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-crm-faint">
                    No se encontraron visitas con esa búsqueda.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
