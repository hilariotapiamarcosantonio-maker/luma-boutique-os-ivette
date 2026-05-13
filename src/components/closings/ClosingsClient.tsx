"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Download, DollarSign, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Closing, Lead, Property } from "@/types/crm";

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function parseAmount(value: string) {
  const numeric = value.replace(/[^0-9.-]/g, "");
  return Number.parseFloat(numeric || "0");
}

function currencyPrefix(value: string) {
  const match = value.match(/^[^\d-]+/);
  return match?.[0].trim() || "USD";
}

function formatTotal(values: string[]) {
  const prefix = currencyPrefix(values.find(Boolean) || "USD");
  const total = values.reduce((sum, value) => sum + parseAmount(value), 0);

  return `${prefix} ${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(total)}`;
}

function statusClass(status: string) {
  if (status === "Cobrado") {
    return "border-crm-green text-crm-green bg-crm-green/10";
  }
  if (status === "Facturado") {
    return "border-crm-blue text-crm-blue bg-crm-blue/10";
  }
  return "border-crm-amber text-crm-amber bg-crm-amber/10";
}

type ClosingsClientProps = {
  closings: Closing[];
  leads: Lead[];
  properties: Property[];
};

export function ClosingsClient({
  closings,
  leads,
  properties,
}: ClosingsClientProps) {
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
  const filteredClosings = useMemo(
    () =>
      closings.filter((closing) => {
        const lead = leadById.get(closing.leadId);
        const property = propertyById.get(closing.propId);

        return [
          closing.id,
          closing.date,
          closing.leadId,
          lead?.name,
          closing.propId,
          property?.ref,
          closing.type,
          closing.price,
          closing.commPct,
          closing.commGross,
          closing.status,
          closing.notes,
        ]
          .map(normalize)
          .some((value) => value.includes(normalizedQuery));
      }),
    [closings, leadById, normalizedQuery, propertyById]
  );

  const totalCommission = formatTotal(
    filteredClosings.map((closing) => closing.commGross)
  );
  const pendingCount = filteredClosings.filter(
    (closing) => closing.status !== "Cobrado"
  ).length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-md border border-crm-line bg-crm-surface p-4">
          <p className="text-xs uppercase text-crm-faint">Cierres visibles</p>
          <p className="mt-2 text-2xl font-bold text-crm-text">
            {filteredClosings.length}
          </p>
        </div>
        <div className="rounded-md border border-crm-line bg-crm-surface p-4">
          <p className="text-xs uppercase text-crm-faint">Comisión bruta</p>
          <p className="mt-2 text-2xl font-bold text-crm-gold">
            {totalCommission}
          </p>
        </div>
        <div className="rounded-md border border-crm-line bg-crm-surface p-4">
          <p className="text-xs uppercase text-crm-faint">Pendientes de cobro</p>
          <p className="mt-2 text-2xl font-bold text-crm-amber">
            {pendingCount}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crm-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar cierre, cliente, propiedad o estatus..."
            aria-label="Buscar cierres"
            className="h-10 w-full rounded-md border border-crm-line bg-crm-surface2 pl-9 pr-4 text-sm text-crm-text placeholder:text-crm-faint focus:border-crm-green focus:outline-none focus:ring-1 focus:ring-crm-green"
          />
        </div>
        <button
          type="button"
          disabled
          title="Próximamente"
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-crm-line bg-crm-surface px-3 text-sm text-crm-muted opacity-60"
        >
          <Download className="mr-2 h-4 w-4" /> Exportar - Próximamente
        </button>
        <button
          type="button"
          disabled
          title="Próximamente"
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-crm-green px-4 text-sm font-medium text-white opacity-60"
        >
          <DollarSign className="mr-2 h-4 w-4" /> Registrar cierre -
          Próximamente
        </button>
      </div>

      <div className="overflow-hidden rounded-md border border-crm-line bg-crm-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-crm-line bg-crm-surface2 text-xs uppercase text-crm-muted">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha</th>
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Propiedad</th>
                <th className="px-6 py-4 font-medium">Operación</th>
                <th className="px-6 py-4 text-right font-medium">Precio cierre</th>
                <th className="px-6 py-4 text-right font-medium">% Com.</th>
                <th className="px-6 py-4 text-right font-medium text-crm-gold">
                  Comisión bruta
                </th>
                <th className="px-6 py-4 text-right font-medium">
                  Estatus cobro
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-line">
              {filteredClosings.map((closing) => {
                const lead = leadById.get(closing.leadId);
                const property = propertyById.get(closing.propId);
                const leadName = lead?.name || closing.leadId;
                const propertyName =
                  property?.ref || closing.propId;

                return (
                  <tr
                    key={closing.id}
                    className="transition-colors hover:bg-crm-bg2"
                  >
                    <td className="px-6 py-4 text-crm-muted">{closing.date}</td>
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
                          className="text-crm-gold hover:underline"
                        >
                          {propertyName}
                        </Link>
                      ) : (
                        <span className="text-crm-faint">{propertyName}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-crm-muted">{closing.type}</td>
                    <td className="px-6 py-4 text-right font-medium text-crm-text">
                      {closing.price}
                    </td>
                    <td className="px-6 py-4 text-right text-crm-muted">
                      {closing.commPct}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-crm-gold">
                      {closing.commGross}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge variant="outline" className={statusClass(closing.status)}>
                        {closing.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              {filteredClosings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-crm-faint">
                    No se encontraron cierres con esa búsqueda.
                  </td>
                </tr>
              ) : null}
            </tbody>
            {filteredClosings.length > 0 ? (
              <tfoot className="border-t border-crm-line bg-crm-surface2">
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-right font-bold text-crm-text"
                  >
                    TOTAL COMISIÓN BRUTA
                  </td>
                  <td className="px-6 py-4 text-right text-lg font-bold text-crm-gold">
                    {totalCommission}
                  </td>
                  <td />
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </div>
    </div>
  );
}
