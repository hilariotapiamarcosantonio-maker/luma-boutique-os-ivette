import { PageHeader } from "@/components/layout/PageHeader";
import { PipelineClient } from "@/components/pipeline/PipelineClient";
import { getPipelineData } from "@/lib/crm-data/get-pipeline-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const stages = await getPipelineData();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flujo de Oportunidades"
        subtitle="Pipeline comercial basado en las etapas actuales de leads."
      />
      <PipelineClient stages={stages} />
    </div>
  );
}
