"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Filter, Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CreateLeadModal } from "@/components/leads/CreateLeadModal";
import { Lead, Property } from "@/types/crm";

const PAGE_SIZE = 10;

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function leadMatchesSearch(lead: Lead, query: string) {
  if (!query) return true;

  return [
    lead.id,
    lead.date,
    lead.name,
    lead.email,
    lead.phone,
    lead.source,
    lead.sourceChannel,
    lead.opp,
    lead.budget,
    lead.priority,
    lead.status,
    lead.agent,
    lead.propNameOfInterest,
    lead.propIdOfInterest,
    lead.zoneOfInterest,
    lead.tags,
  ]
    .map(normalize)
    .some((value) => value.includes(query));
}

function priorityClass(priority: string) {
  if (priority === "Alta") return "border-crm-red text-crm-red";
  if (priority === "Media") return "border-crm-amber text-crm-amber";
  return "border-crm-faint text-crm-faint";
}

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

export function LeadsClient({
  leads,
  properties,
}: {
  leads: Lead[];
  properties: Property[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(
    searchParams.get("created")
  );

  const normalizedQuery = normalize(query);
  const filteredLeads = useMemo(
    () => leads.filter((lead) => leadMatchesSearch(lead, normalizedQuery)),
    [leads, normalizedQuery]
  );

  const pageCount = Math.max(1, Math.ceil(filteredLeads.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageLeads = filteredLeads.slice(start, start + PAGE_SIZE);
  const firstVisible = filteredLeads.length === 0 ? 0 : start + 1;
  const lastVisible = Math.min(start + PAGE_SIZE, filteredLeads.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crm-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setPage(1);
            }}
            placeholder="Buscar lead, ID, teléfono o propiedad..."
            aria-label="Buscar leads"
            className="h-10 w-full rounded-md border border-crm-line bg-crm-surface2 pl-9 pr-4 text-sm text-crm-text placeholder:text-crm-faint focus:border-crm-gold focus:outline-none focus:ring-1 focus:ring-crm-gold"
          />
        </div>
        <button
          type="button"
          disabled
          title="Próximamente"
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border border-crm-line bg-crm-surface px-3 text-sm text-crm-muted opacity-60"
        >
          <Filter className="mr-2 h-4 w-4" /> Filtrar - Próximamente
        </button>
        <button
          type="button"
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-crm-gold px-4 text-sm font-medium text-[#080B0E] transition-colors hover:bg-[#b59552]"
        >
          <Plus className="mr-2 h-4 w-4" /> Añadir lead
        </button>
      </div>

      {createdLeadId ? (
        <div className="flex flex-col gap-3 rounded-md border border-crm-green/40 bg-crm-green/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-crm-text">
            Lead creado correctamente:{" "}
            <span className="font-semibold text-crm-green">{createdLeadId}</span>
          </p>
          <Link
            href={`/leads/${createdLeadId}`}
            className="inline-flex h-9 items-center justify-center rounded-md border border-crm-green/40 px-3 text-sm font-medium text-crm-green transition-colors hover:bg-crm-green/10"
          >
            Ver lead creado
          </Link>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-md border border-crm-line bg-crm-surface shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-crm-line bg-crm-surface2 text-xs uppercase text-crm-muted">
              <tr>
                <th className="px-6 py-4 font-medium">ID Lead</th>
                <th className="px-6 py-4 font-medium">Registro</th>
                <th className="px-6 py-4 font-medium">Prospecto</th>
                <th className="px-6 py-4 font-medium">Oportunidad</th>
                <th className="px-6 py-4 font-medium">Prioridad</th>
                <th className="px-6 py-4 font-medium">Estatus</th>
                <th className="px-6 py-4 font-medium">Asesor</th>
                <th className="px-6 py-4 text-right font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-crm-line">
              {pageLeads.map((lead) => {
                const channelLabel = lead.sourceChannel || lead.source;

                return (
                  <tr
                    key={lead.id}
                    className="group transition-colors hover:bg-crm-bg2"
                  >
                    <td className="px-6 py-4 font-medium text-crm-faint">
                      {lead.id}
                    </td>
                    <td className="px-6 py-4 text-crm-muted">{lead.date}</td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="font-semibold text-crm-text hover:text-crm-gold"
                      >
                        {lead.name}
                      </Link>
                      {channelLabel ? (
                        <div className="mt-2">
                          <Badge
                            variant="outline"
                            className="border-crm-gold/30 bg-crm-gold/10 text-crm-gold"
                          >
                            {channelLabel}
                          </Badge>
                        </div>
                      ) : null}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-crm-gold">
                        {lead.opp || "N/A"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={priorityClass(lead.priority)}
                      >
                        {lead.priority || "Baja"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={statusClass(lead.status)}
                      >
                        {lead.status || "Nuevo"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-crm-muted">
                      {lead.agent || "Sin asignar"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/leads/${lead.id}`}
                        className="inline-flex h-8 items-center justify-center gap-1 whitespace-nowrap rounded-md px-2 text-sm font-medium text-crm-gold transition-colors hover:bg-crm-surface2"
                      >
                        Ver detalle <ChevronRight className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {pageLeads.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-crm-faint">
                    No se encontraron leads con esa búsqueda.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex flex-col gap-3 border-t border-crm-line bg-crm-surface px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-crm-muted">
            Mostrando{" "}
            <span className="font-medium text-crm-text">{firstVisible}</span> a{" "}
            <span className="font-medium text-crm-text">{lastVisible}</span> de{" "}
            <span className="font-medium text-crm-text">
              {filteredLeads.length}
            </span>{" "}
            leads
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="inline-flex h-8 items-center justify-center rounded-md border border-crm-line bg-crm-surface2 px-3 text-sm font-medium text-crm-muted transition-colors hover:text-crm-text disabled:pointer-events-none disabled:opacity-50"
            >
              Anterior
            </button>
            <span className="inline-flex h-8 items-center rounded-md border border-crm-line px-3 text-xs text-crm-muted">
              {currentPage} / {pageCount}
            </span>
            <button
              type="button"
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              className="inline-flex h-8 items-center justify-center rounded-md border border-crm-line bg-crm-surface2 px-3 text-sm font-medium text-crm-muted transition-colors hover:text-crm-text disabled:pointer-events-none disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      <CreateLeadModal
        open={createModalOpen}
        properties={properties}
        onClose={() => setCreateModalOpen(false)}
        onCreated={(leadId) => {
          setCreatedLeadId(leadId);
          setQuery("");
          setPage(1);
          router.push(`/leads?created=${leadId}`);
          router.refresh();
        }}
      />
    </div>
  );
}
