"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PipelineStage } from "@/lib/crm-data/get-pipeline-data";

function normalize(value: unknown) {
  return String(value ?? "").toLowerCase().trim();
}

export function PipelineClient({ stages }: { stages: PipelineStage[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = normalize(query);

  const visibleStages = useMemo(
    () =>
      stages.map((stage) => ({
        ...stage,
        items: stage.items.filter((item) =>
          [
            item.id,
            item.name,
            item.opp,
            item.budget,
            item.priority,
            item.status,
            item.agent,
            item.propNameOfInterest,
            item.zoneOfInterest,
          ]
            .map(normalize)
            .some((value) => value.includes(normalizedQuery))
        ),
      })),
    [normalizedQuery, stages]
  );

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <div className="mb-6 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-crm-muted">
          Movimiento de etapas disponible en próxima fase.
        </p>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-crm-faint" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar oportunidad..."
            aria-label="Buscar oportunidades"
            className="h-10 w-full rounded-md border border-crm-line bg-crm-surface2 pl-9 pr-4 text-sm text-crm-text placeholder:text-crm-faint focus:border-crm-gold focus:outline-none focus:ring-1 focus:ring-crm-gold"
          />
        </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4">
        <div className="flex h-full min-w-max gap-4">
          {visibleStages.map((stage) => (
            <div
              key={stage.id}
              className="flex w-72 shrink-0 flex-col overflow-hidden rounded-lg border border-crm-line bg-crm-surface/50"
            >
              <div className="flex items-center justify-between border-b border-crm-line bg-crm-surface p-3">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${stage.color}`} />
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-crm-text">
                    {stage.title}
                  </h3>
                </div>
                <Badge variant="secondary" className="bg-crm-bg2 text-crm-muted">
                  {stage.items.length}
                </Badge>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto p-3">
                {stage.items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/leads/${item.id}`}
                    className="block rounded-md border border-crm-line bg-crm-surface p-3 shadow-sm transition-colors hover:border-crm-gold/50"
                  >
                    <div className="mb-2 flex items-start justify-between gap-2">
                      <span className="rounded-sm bg-crm-gold/10 px-2 py-0.5 text-xs font-medium text-crm-gold">
                        {item.opp || "Sin clasificar"}
                      </span>
                      <span className="text-xs text-crm-faint">{item.id}</span>
                    </div>
                    <h4 className="font-medium text-crm-text">{item.name}</h4>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-bold text-crm-muted">
                        {item.budget || "$ ---"}
                      </span>
                      <div
                        className="flex h-6 w-6 items-center justify-center rounded-full border border-crm-line bg-crm-bg2 text-xs text-crm-faint"
                        title={item.agent}
                      >
                        {(item.agent || "NA")
                          .split(" ")
                          .map((word) => word[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                    </div>
                  </Link>
                ))}
                {stage.items.length === 0 ? (
                  <div className="py-6 text-center text-xs text-crm-faint">
                    Sin oportunidades
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
