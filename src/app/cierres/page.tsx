import { ClosingsClient } from "@/components/closings/ClosingsClient";
import { PageHeader } from "@/components/layout/PageHeader";
import { getClosings } from "@/lib/crm-data/get-closings";
import { getLeads } from "@/lib/crm-data/get-leads";
import { getProperties } from "@/lib/crm-data/get-properties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function CierresPage() {
  const [closings, leads, properties] = await Promise.all([
    getClosings(),
    getLeads(),
    getProperties(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Control Financiero"
        subtitle="Gestión de cierres ganados y cálculo de comisiones brutas."
      />
      <ClosingsClient
        closings={closings}
        leads={leads}
        properties={properties}
      />
    </div>
  );
}
