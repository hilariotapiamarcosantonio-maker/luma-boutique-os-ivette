import { PageHeader } from "@/components/layout/PageHeader";
import { LeadsClient } from "@/components/leads/LeadsClient";
import { getLeads } from "@/lib/crm-data/get-leads";
import { getProperties } from "@/lib/crm-data/get-properties";
import { brand } from "@/lib/brand";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  const [leads, properties] = await Promise.all([getLeads(), getProperties()]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Base Comercial"
        subtitle={`Gestión centralizada de prospectos, atribución y oportunidades del workspace ${brand.workspaceName}.`}
      />
      <LeadsClient leads={leads} properties={properties} />
    </div>
  );
}
