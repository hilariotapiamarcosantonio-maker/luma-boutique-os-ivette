import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/layout/PageHeader";
import { getAdminContactsResult, getAdminLeads } from "@/lib/admin-crm-view";
import { LeadsTable } from "./LeadsTable";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const [leads, contactsResult] = await Promise.all([
    getAdminLeads(),
    getAdminContactsResult(),
  ]);
  const contacts = contactsResult.contacts;
  const demoModeActive = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const hasRealStoreLeads = leads.some((lead) => lead.itemsSummary);
  const displayLeadsCount = demoModeActive && !hasRealStoreLeads ? 3 : leads.length;
  const newLeadsCount =
    demoModeActive && !hasRealStoreLeads
      ? 1
      : leads.filter((lead) => lead.estado === "Nuevo").length;
  const storeLeadsCount =
    demoModeActive && !hasRealStoreLeads
      ? 3
      : leads.filter((lead) => lead.itemsSummary).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion de Pedidos y Contactos"
        subtitle="Listado y control de pedidos online, seguimiento y directorio privado de clientas de Ivette Berroa."
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Total Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-crm-text">{displayLeadsCount}</div>
            <p className="mt-1 text-xs text-crm-faint">Registrados en Google Sheets</p>
          </CardContent>
        </Card>

        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Nuevos Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-crm-gold">{newLeadsCount}</div>
            <p className="mt-1 text-xs text-crm-faint">Pendientes de confirmacion</p>
          </CardContent>
        </Card>

        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Origen Tienda Online</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#c5a059]">{storeLeadsCount}</div>
            <p className="mt-1 text-xs text-crm-faint">Canal de comercio digital</p>
          </CardContent>
        </Card>

        <Card className="border-crm-line bg-crm-surface">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-crm-muted">Contactos CRM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-crm-cyan">{contacts.length}</div>
            <p className="mt-1 text-xs text-crm-faint">Directorio privado</p>
          </CardContent>
        </Card>
      </div>

      <LeadsTable
        initialLeads={leads}
        initialContacts={contacts}
        dataSource={contactsResult.source}
        demoModeActive={demoModeActive}
      />
    </div>
  );
}
