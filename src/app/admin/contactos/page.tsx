import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { getAdminContactsResult, getAdminLeads } from "@/lib/admin-crm-view";
import { LeadsTable } from "../leads/LeadsTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: {
    filter?: string;
  };
}

export default async function AdminContactosPage({ searchParams }: PageProps) {
  const [leads, contactsResult] = await Promise.all([
    getAdminLeads(),
    getAdminContactsResult(),
  ]);
  const contacts = contactsResult.contacts;
  const demoModeActive = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const whatsappValidoCount = contacts.filter((contact) => contact.contactableWhatsapp === true).length;
  const revisionCount = contacts.filter(
    (contact) =>
      contact.contactableWhatsapp === false ||
      !contact.telefonoNormalizado ||
      contact.estadoImportacion === "Revisión"
  ).length;
  const lanzamiento500Count = contacts.filter(
    (contact) => contact.cohortes === "lanzamiento_500"
  ).length;
  const csvPtigoCount = contacts.filter((contact) => contact.origen === "CSV ptigo").length;
  const vcfIvetteCount = contacts.filter((contact) => contact.origen === "VCF Ivette").length;
  const pendientesWhatsappCount = contacts.filter(
    (contact) => contact.estadoContacto === "Seguimiento" || contact.proximaAccion
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Directorio de Contactos"
        subtitle="Control privado de clientas de Ivette Berroa, cohortes comerciales y seguimiento por WhatsApp."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-7 gap-4">
        {/* Card 1: Total */}
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Total Contactos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-crm-cyan">{contacts.length}</div>
            <p className="mt-1 text-xs text-crm-faint">Google Sheets</p>
          </CardContent>
        </Card>

        {/* Card 2: WhatsApp Válido */}
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">WhatsApp Válido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-crm-green">{whatsappValidoCount}</div>
            <p className="mt-1 text-xs text-crm-faint">Contactables</p>
          </CardContent>
        </Card>

        {/* Card 3: Revisión */}
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Revisión</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-crm-gold">{revisionCount}</div>
            <p className="mt-1 text-xs text-crm-faint">Por verificar</p>
          </CardContent>
        </Card>

        {/* Card 4: Lanzamiento 500 */}
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Lanzamiento 500</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">{lanzamiento500Count}</div>
            <p className="mt-1 text-xs text-crm-faint">Cohorte inicial</p>
          </CardContent>
        </Card>

        {/* Card 5: CSV ptigo */}
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">CSV ptigo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#c5a059]">{csvPtigoCount}</div>
            <p className="mt-1 text-xs text-crm-faint">Importados CSV</p>
          </CardContent>
        </Card>

        {/* Card 6: VCF Ivette */}
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">VCF Ivette</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-400">{vcfIvetteCount}</div>
            <p className="mt-1 text-xs text-crm-faint">Importados VCF</p>
          </CardContent>
        </Card>

        {/* Card 7: Pendientes Seguimiento */}
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Seguimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-crm-gold">{pendientesWhatsappCount}</div>
            <p className="mt-1 text-xs text-crm-faint">Acción pendiente</p>
          </CardContent>
        </Card>
      </div>

      <LeadsTable
        initialLeads={leads}
        initialContacts={contacts}
        dataSource={contactsResult.source}
        demoModeActive={demoModeActive}
        defaultTab="contactos"
        defaultFilter={searchParams?.filter || "all"}
      />
    </div>
  );
}
