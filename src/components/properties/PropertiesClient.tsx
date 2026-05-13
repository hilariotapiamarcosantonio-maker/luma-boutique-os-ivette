"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Bath,
  Bed,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Property } from "@/types/crm";

type ViewMode = "grid" | "list";

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

function propertyMatchesSearch(property: Property, query: string) {
  if (!query) return true;

  return [
    property.id,
    property.ref,
    property.type,
    property.operation,
    property.zone,
    property.address,
    property.price,
    property.status,
    property.agent,
    property.notes,
  ]
    .map(normalize)
    .some((value) => value.includes(query));
}

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

export function PropertiesClient({ properties }: { properties: Property[] }) {
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const normalizedQuery = normalize(query);

  const filteredProperties = useMemo(
    () =>
      properties.filter((property) =>
        propertyMatchesSearch(property, normalizedQuery)
      ),
    [properties, normalizedQuery]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1 lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crm-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar referencia, ID, zona o estatus..."
            aria-label="Buscar propiedades"
            className="h-10 w-full rounded-md border border-crm-line bg-crm-surface2 pl-9 pr-4 text-sm text-crm-text placeholder:text-crm-faint focus:border-crm-gold focus:outline-none focus:ring-1 focus:ring-crm-gold"
          />
        </div>
        <div className="flex rounded-md border border-crm-line bg-crm-surface p-1">
          <button
            type="button"
            aria-label="Vista de tarjetas"
            aria-pressed={viewMode === "grid"}
            onClick={() => setViewMode("grid")}
            className={`inline-flex h-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
              viewMode === "grid"
                ? "bg-crm-surface2 text-crm-gold"
                : "text-crm-muted hover:text-crm-text"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Vista de lista"
            aria-pressed={viewMode === "list"}
            onClick={() => setViewMode("list")}
            className={`inline-flex h-8 items-center justify-center rounded-md px-2 text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-crm-surface2 text-crm-gold"
                : "text-crm-muted hover:text-crm-text"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
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
          disabled
          title="Próximamente"
          className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-crm-gold px-4 text-sm font-medium text-[#080B0E] opacity-60"
        >
          <Plus className="mr-2 h-4 w-4" /> Añadir propiedad - Próximamente
        </button>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="rounded-md border border-crm-line bg-crm-surface py-16 text-center text-crm-faint">
          No se encontraron propiedades con esa búsqueda.
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProperties.map((property) => (
            <Link
              href={`/propiedades/${property.id}`}
              key={property.id}
              className="group flex flex-col overflow-hidden rounded-lg border border-crm-line bg-crm-surface shadow-sm transition-colors hover:border-crm-gold/50"
            >
              <div className="relative flex h-48 flex-col items-center justify-center bg-crm-surface2">
                <Badge
                  className={`absolute left-3 top-3 font-medium shadow-sm ${propertyStatusClass(
                    property.status
                  )}`}
                  variant="outline"
                >
                  {property.status}
                </Badge>
                <div className="text-4xl font-bold uppercase tracking-tighter text-crm-surface3">
                  {property.img || property.ref.substring(0, 2)}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="line-clamp-1 text-lg font-semibold leading-tight text-crm-text">
                  {property.ref}
                </h3>
                <p className="mb-4 mt-2 text-xl font-bold text-crm-gold">
                  {property.price}
                </p>
                <div className="mb-4 flex items-center gap-4 text-sm text-crm-muted">
                  <span className="flex min-w-0 items-center">
                    <MapPin className="mr-1 h-4 w-4 shrink-0 text-crm-faint" />
                    <span className="truncate">{property.zone}</span>
                  </span>
                </div>
                <div className="mb-4 flex items-center gap-4 border-y border-crm-line py-3">
                  <div className="flex items-center text-sm text-crm-text">
                    <Bed className="mr-1.5 h-4 w-4 text-crm-faint" />
                    {property.beds} Habs
                  </div>
                  <div className="flex items-center text-sm text-crm-text">
                    <Bath className="mr-1.5 h-4 w-4 text-crm-faint" />
                    {property.baths} Baños
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-xs text-crm-faint">{property.id}</span>
                  <Badge
                    variant="secondary"
                    className="border border-crm-line bg-crm-bg2 text-crm-muted"
                  >
                    {property.type || property.operation}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border border-crm-line bg-crm-surface shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-crm-line bg-crm-surface2 text-xs uppercase text-crm-muted">
                <tr>
                  <th className="px-6 py-4 font-medium">Propiedad</th>
                  <th className="px-6 py-4 font-medium">Zona</th>
                  <th className="px-6 py-4 font-medium">Operación</th>
                  <th className="px-6 py-4 font-medium">Precio</th>
                  <th className="px-6 py-4 font-medium">Estatus</th>
                  <th className="px-6 py-4 text-right font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crm-line">
                {filteredProperties.map((property) => (
                  <tr
                    key={property.id}
                    className="transition-colors hover:bg-crm-bg2"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/propiedades/${property.id}`}
                        className="font-semibold text-crm-text hover:text-crm-gold"
                      >
                        {property.ref}
                      </Link>
                      <div className="text-xs text-crm-faint">{property.id}</div>
                    </td>
                    <td className="px-6 py-4 text-crm-muted">{property.zone}</td>
                    <td className="px-6 py-4 text-crm-muted">
                      {property.operation}
                    </td>
                    <td className="px-6 py-4 font-semibold text-crm-gold">
                      {property.price}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={propertyStatusClass(property.status)}
                      >
                        {property.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/propiedades/${property.id}`}
                        className="inline-flex h-8 items-center justify-center rounded-md px-2 text-sm font-medium text-crm-gold transition-colors hover:bg-crm-surface2"
                      >
                        Ver ficha
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
