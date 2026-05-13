import Link from "next/link";
import { Calendar, DollarSign, Target, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { PageHeader } from "@/components/layout/PageHeader";
import { brand } from "@/lib/brand";
import { getDashboardData } from "@/lib/crm-data/get-dashboard-data";
import { getLeads } from "@/lib/crm-data/get-leads";
import { getProperties } from "@/lib/crm-data/get-properties";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const [data, leads, properties] = await Promise.all([
    getDashboardData(),
    getLeads(),
    getProperties(),
  ]);

  const leadById = new Map(leads.map((lead) => [lead.id, lead]));
  const propertyById = new Map(
    properties.map((property) => [property.id, property])
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={brand.productName}
        subtitle="Sistema comercial inmobiliario para captar, medir y cerrar prospectos desde una infraestructura personalizada."
      />

      <Badge
        variant="outline"
        className="border-crm-gold/30 bg-crm-gold/10 text-crm-gold"
      >
        by {brand.parentBrand} · Workspace {brand.workspaceName}
      </Badge>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/leads" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-crm-muted">
                TOTAL LEADS
              </CardTitle>
              <Users className="h-4 w-4 text-crm-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-text">
                {data.totalLeads}
              </div>
              <p className="mt-1 text-xs text-crm-faint">Abrir base comercial</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/visitas" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-crm-muted">
                VISITAS AGENDADAS
              </CardTitle>
              <Calendar className="h-4 w-4 text-crm-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-text">
                {data.visitasAgendadas}
              </div>
              <p className="mt-1 text-xs text-crm-faint">Abrir recorridos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cierres" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-crm-muted">
                CIERRES GANADOS
              </CardTitle>
              <Target className="h-4 w-4 text-crm-green" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-text">
                {data.cierresGanados}
              </div>
              <p className="mt-1 text-xs text-crm-faint">Abrir control financiero</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/cierres" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-crm-muted">
                COMISIONES
              </CardTitle>
              <DollarSign className="h-4 w-4 text-crm-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-gold">
                {data.comisionesAcumuladas}
              </div>
              <p className="mt-1 text-xs text-crm-faint">Ver cierres asociados</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader>
            <CardTitle className="text-base text-crm-text">
              Embudo de Ventas Inmobiliario
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <FunnelChart data={data.funnelData} />
          </CardContent>
        </Card>

        <Card className="border-crm-line bg-crm-surface">
          <CardHeader>
            <CardTitle className="text-base text-crm-text">
              Próximas Visitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-crm-line bg-crm-surface2 text-xs uppercase text-crm-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Propiedad</th>
                    <th className="px-4 py-3 text-right font-medium">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-crm-line">
                  {data.upcomingVisits.map((visit) => {
                    const lead = leadById.get(visit.leadId);
                    const property = propertyById.get(visit.propId);
                    const leadName = lead?.name || visit.leadId;
                    const propertyName =
                      property?.ref || visit.propId;

                    return (
                      <tr
                        key={visit.id}
                        className="transition-colors hover:bg-crm-bg2"
                      >
                        <td className="px-4 py-3 text-crm-faint">
                          {visit.date}
                        </td>
                        <td className="px-4 py-3 font-medium text-crm-text">
                          {lead ? (
                            <Link
                              href={`/leads/${lead.id}`}
                              className="hover:text-crm-gold"
                            >
                              {leadName}
                            </Link>
                          ) : (
                            leadName
                          )}
                        </td>
                        <td className="px-4 py-3 text-crm-gold">
                          {property ? (
                            <Link
                              href={`/propiedades/${property.id}`}
                              className="hover:underline"
                            >
                              {propertyName}
                            </Link>
                          ) : (
                            propertyName
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Badge
                            variant="outline"
                            className={
                              visit.status === "Confirmada" ||
                              visit.status === "Completada"
                                ? "border-crm-green text-crm-green"
                                : visit.status === "Agendada"
                                  ? "border-crm-blue text-crm-blue"
                                  : "border-crm-amber text-crm-amber"
                            }
                          >
                            {visit.status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {data.upcomingVisits.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-crm-faint"
                      >
                        No hay visitas recientes.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
