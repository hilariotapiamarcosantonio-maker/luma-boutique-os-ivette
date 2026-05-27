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
  const clientasFielesCount = contacts.filter((contact) => contact.clientaFiel).length;
  const lanzamiento500Count = contacts.filter(
    (contact) => contact.cohortes === "lanzamiento_500"
  ).length;
  const pendientesWhatsappCount = contacts.filter(
    (contact) => contact.estadoContacto === "Seguimiento" || contact.proximaAccion
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Directorio de Contactos"
        subtitle="Control privado de clientas de Ivette Berroa, cohortes comerciales y seguimiento por WhatsApp."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Total de Contactos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-crm-cyan">{contacts.length}</div>
            <p className="mt-1 text-xs text-crm-faint">Registrados en Google Sheets</p>
          </CardContent>
        </Card>

        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Clientas Fieles</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#c5a059]">
              {clientasFielesCount}
            </div>
            <p className="mt-1 text-xs text-crm-faint">Beneficio quincenal</p>
          </CardContent>
        </Card>

        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Lanzamiento 500</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-400">
              {lanzamiento500Count}
            </div>
            <p className="mt-1 text-xs text-crm-faint">Cohorte inicial</p>
          </CardContent>
        </Card>

        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Pendientes Seguimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-crm-gold">
              {pendientesWhatsappCount}
            </div>
            <p className="mt-1 text-xs text-crm-faint">Accion de contacto programada</p>
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
