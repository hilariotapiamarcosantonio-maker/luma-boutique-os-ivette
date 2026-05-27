import Link from "next/link";
import { ClipboardList, Clock, DollarSign, MessageSquare, Sparkles, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FunnelChart } from "@/components/dashboard/FunnelChart";
import { PageHeader } from "@/components/layout/PageHeader";
import { brand } from "@/lib/brand";
import { getAdminContacts, getAdminLeads } from "@/lib/admin-crm-view";
import { formatDop, getCapilarData } from "@/lib/crm-data/get-capilar-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function PanelPage() {
  const data = await getCapilarData();
  const recentSales = data.sales.slice(0, 8);
  const [leads, contacts] = await Promise.all([
    getAdminLeads(),
    getAdminContacts(),
  ]);

  const totalPedidos = leads.length;
  const nuevosPedidos = leads.filter((lead) => lead.estado === "Nuevo").length;
  const totalContactos = contacts.length;
  const clientasFieles = contacts.filter((contact) => contact.clientaFiel).length;
  const lanzamiento500 = contacts.filter(
    (contact) => contact.cohortes === "lanzamiento_500"
  ).length;
  const planesQuincenalesActivos = leads.filter(
    (lead) =>
      lead.modalidadPago === "Plan Quincenal Clienta Fiel" &&
      lead.estadoPlan !== "Completado"
  ).length;
  const pendientesWhatsapp = contacts.filter(
    (contact) => contact.estadoContacto === "Seguimiento" || contact.proximaAccion
  ).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={brand.productName}
        subtitle="Base operativa de ventas online, seguimiento, pagos quincenales e inventario de Ivette Berroa."
      />

      <div className="flex flex-wrap gap-2">
        <Badge
          variant="outline"
          className="border-crm-gold/30 bg-crm-gold/10 text-crm-gold"
        >
          by {brand.parentBrand} - Workspace {brand.workspaceName} -{" "}
          {data.source === "google-sheets" ? "Google Sheets" : "Fallback local"}
        </Badge>

        <Badge
          variant="outline"
          className="border-crm-teal/30 bg-crm-teal/10 text-crm-teal font-semibold"
        >
          Modo Operativo: Tienda Online + CRM Privado
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/leads" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-crm-muted">
                Total de Pedidos
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-crm-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-text">{totalPedidos}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Pedidos en Google Sheets</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/leads" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-crm-muted">
                Nuevos Pedidos
              </CardTitle>
              <Sparkles className="h-4 w-4 text-crm-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-gold">{nuevosPedidos}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Pendientes de gestion</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/contactos" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-crm-muted">
                Contactos CRM
              </CardTitle>
              <Users className="h-4 w-4 text-crm-cyan" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-text">{totalContactos}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Directorio privado</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/contactos?filter=clientas_fieles" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-crm-muted">
                Clientas Fieles
              </CardTitle>
              <Sparkles className="h-4 w-4 text-[#c5a059]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#c5a059]">{clientasFieles}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Segmento de confianza</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/contactos?filter=lanzamiento_500" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-crm-muted">
                Lanzamiento 500
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{lanzamiento500}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Primera cohorte comercial</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/leads" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-crm-muted">
                Planes Quincenales Activos
              </CardTitle>
              <Clock className="h-4 w-4 text-crm-teal" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-teal">{planesQuincenalesActivos}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Cobros diferidos activos</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/contactos?filter=seguimiento" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-crm-muted">
                Pendientes de WhatsApp
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-crm-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-gold">{pendientesWhatsapp}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Seguimientos pendientes</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin" className="block">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-crm-muted">
                Ventas Consolidadas
              </CardTitle>
              <DollarSign className="h-4 w-4 text-crm-blue" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-text">
                {formatDop(data.totalVentas)}
              </div>
              <p className="mt-1 text-[10px] text-crm-faint">
                {data.ventasRegistradas} pedidos registrados
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-crm-line bg-crm-surface">
          <CardHeader>
            <CardTitle className="text-base text-crm-text">
              Inventario por Producto
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <FunnelChart data={data.byLinea} />
          </CardContent>
        </Card>

        <Card className="border-crm-line bg-crm-surface">
          <CardHeader>
            <CardTitle className="text-base text-crm-text">
              Ultimos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-crm-line bg-crm-surface2 text-xs uppercase text-crm-muted">
                  <tr>
                    <th className="px-4 py-3 font-medium">Fecha</th>
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Monto</th>
                    <th className="px-4 py-3 text-right font-medium">Estatus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-crm-line">
                  {recentSales.map((sale) => (
                    <tr key={sale.ventaId} className="transition-colors hover:bg-crm-bg2">
                      <td className="px-4 py-3 text-crm-faint">
                        {sale.fechaEntrega || sale.fechaRegistro}
                      </td>
                      <td className="px-4 py-3 font-medium text-crm-text">
                        {sale.nombreCliente}
                        <div className="text-xs text-crm-faint">{sale.provincia}</div>
                      </td>
                      <td className="px-4 py-3 text-crm-gold">
                        {formatDop(sale.totalVenta)}
                        <div className="text-xs text-crm-faint">{sale.familiaProducto}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Badge
                          variant="outline"
                          className={
                            sale.montoRestante <= 0
                              ? "border-crm-green text-crm-green"
                              : "border-crm-amber text-crm-amber"
                          }
                        >
                          {sale.montoRestante <= 0 ? "Sin saldo" : "Pendiente"}
                        </Badge>
                        {sale.montoRestante > 0 ? (
                          <div className="mt-1 text-xs text-crm-faint">
                            Saldo {formatDop(sale.montoRestante)}
                          </div>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                  {recentSales.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-4 py-8 text-center text-crm-faint">
                        No hay pedidos cargados.
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
