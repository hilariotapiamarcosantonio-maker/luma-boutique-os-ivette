import { PageHeader } from "@/components/layout/PageHeader";
import { PropertiesClient } from "@/components/properties/PropertiesClient";
import { brand } from "@/lib/brand";
import { getProperties } from "@/lib/crm-data/get-properties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PropiedadesPage() {
  const properties = await getProperties();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventario Premium"
        subtitle={`Catálogo de propiedades y disponibilidad del workspace ${brand.workspaceName}.`}
      />
      <PropertiesClient properties={properties} />
    </div>
  );
}
