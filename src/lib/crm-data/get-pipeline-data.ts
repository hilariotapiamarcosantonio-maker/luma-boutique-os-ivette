import "server-only";
import { Lead } from "@/types/crm";
import { getLeads } from "./get-leads";

export interface PipelineStage {
  id: string;
  title: string;
  color: string;
  items: Lead[];
}

const STAGE_CONFIG = [
  { id: "Nuevo", title: "Nuevo Lead", color: "bg-crm-blue" },
  { id: "Nuevo lead", title: "Nuevo Lead", color: "bg-crm-blue" },
  { id: "Contactado", title: "Contactado", color: "bg-crm-amber" },
  { id: "Seguimiento", title: "Seguimiento", color: "bg-crm-cyan" },
  { id: "Cita", title: "Visita Agendada", color: "bg-crm-cyan" },
  { id: "Visita agendada", title: "Visita Agendada", color: "bg-crm-cyan" },
  { id: "Propuesta enviada", title: "Propuesta Enviada", color: "bg-crm-violet" },
  { id: "Negociacion", title: "Negociacion", color: "bg-crm-violet" },
  { id: "Negociación", title: "Negociacion", color: "bg-crm-violet" },
  { id: "Cerrado", title: "Cierre Ganado", color: "bg-crm-green" },
  { id: "Cierre ganado", title: "Cierre Ganado", color: "bg-crm-green" },
];

export async function getPipelineData(): Promise<PipelineStage[]> {
  const leads = await getLeads();
  const stagesMap = new Map<string, PipelineStage>();

  const baseStages = [
    "Nuevo Lead",
    "Contactado",
    "Visita Agendada",
    "Propuesta Enviada",
    "Negociacion",
    "Cierre Ganado",
  ];
  const colors = [
    "bg-crm-blue",
    "bg-crm-amber",
    "bg-crm-cyan",
    "bg-crm-violet",
    "bg-crm-violet",
    "bg-crm-green",
  ];

  baseStages.forEach((title, index) => {
    stagesMap.set(title, {
      id: `s${index}`,
      title,
      color: colors[index],
      items: [],
    });
  });

  leads.forEach((lead) => {
    let mappedTitle = "Nuevo Lead";
    const config = STAGE_CONFIG.find(
      (stage) =>
        lead.status === stage.id ||
        lead.status.toLowerCase().includes(stage.id.toLowerCase())
    );

    if (config) mappedTitle = config.title;
    if (lead.status === "Perdido" || lead.status === "Cierre perdido") return;

    if (stagesMap.has(mappedTitle)) {
      stagesMap.get(mappedTitle)!.items.push(lead);
    }
  });

  return Array.from(stagesMap.values());
}
