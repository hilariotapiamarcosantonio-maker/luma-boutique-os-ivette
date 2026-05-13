import { PageHeader } from "@/components/layout/PageHeader";
import { VisitsClient } from "@/components/visits/VisitsClient";
import { getLeads } from "@/lib/crm-data/get-leads";
import { getProperties } from "@/lib/crm-data/get-properties";
import { getVisits } from "@/lib/crm-data/get-visits";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function VisitasPage() {
  const [visits, leads, properties] = await Promise.all([
    getVisits(),
    getLeads(),
    getProperties(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tours y Recorridos"
        subtitle="Registro consultivo de visitas físicas y virtuales a propiedades."
      />
      <VisitsClient visits={visits} leads={leads} properties={properties} />
    </div>
  );
}
