import Link from "next/link";
import { ClipboardList, Clock, MessageSquare, Sparkles, Users, ShieldAlert } from "lucide-react";
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
  const lanzamiento500 = contacts.filter(
    (contact) => contact.cohortes === "lanzamiento_500"
  ).length;
  const whatsappValido = contacts.filter(
    (contact) => contact.contactableWhatsapp === true
  ).length;
  const revision = contacts.filter(
    (contact) =>
      contact.contactableWhatsapp === false ||
      !contact.telefonoNormalizado ||
      contact.estadoImportacion === "Revisión"
  ).length;
  const planesQuincenalesActivos = leads.filter(
    (lead) =>
      (lead.modalidadPago === "Plan Quincenal" ||
        lead.modalidadPago === "Plan Quincenal Clienta Fiel") &&
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

      {data.source === "local-fallback" && (
        <div className="flex items-center gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs text-amber-300">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          <span>
            Fallback local activo: los datos visibles pueden no estar sincronizados con Google Sheets.
          </span>
        </div>
      )}

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
        {/* Total Contactos */}
        <Link href="/admin/contactos" className="block w-full min-w-0">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-crm-muted break-words whitespace-normal leading-normal">
                Total Contactos
              </CardTitle>
              <Users className="h-4 w-4 text-crm-cyan shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-text">{totalContactos}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Directorio de contactos</p>
            </CardContent>
          </Card>
        </Link>

        {/* WhatsApp Válido */}
        <Link href="/admin/contactos?filter=whatsapp_valido" className="block w-full min-w-0">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-crm-muted break-words whitespace-normal leading-normal">
                WhatsApp Válido
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-crm-green shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-green">{whatsappValido}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Teléfonos normalizados</p>
            </CardContent>
          </Card>
        </Link>

        {/* Revisión */}
        <Link href="/admin/contactos?filter=revision" className="block w-full min-w-0">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-crm-muted break-words whitespace-normal leading-normal">
                Revisión
              </CardTitle>
              <ShieldAlert className="h-4 w-4 text-crm-gold shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-gold">{revision}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Contacto no disponible</p>
            </CardContent>
          </Card>
        </Link>

        {/* Lanzamiento 500 */}
        <Link href="/admin/contactos?filter=lanzamiento_500" className="block w-full min-w-0">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-crm-muted break-words whitespace-normal leading-normal">
                Lanzamiento 500
              </CardTitle>
              <Users className="h-4 w-4 text-purple-400 shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{lanzamiento500}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Primera cohorte comercial</p>
            </CardContent>
          </Card>
        </Link>

        {/* Total Pedidos */}
        <Link href="/admin/leads" className="block w-full min-w-0">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-crm-muted break-words whitespace-normal leading-normal">
                Total de Pedidos
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-crm-blue shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-text">{totalPedidos}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Pedidos en Google Sheets</p>
            </CardContent>
          </Card>
        </Link>

        {/* Nuevos Pedidos */}
        <Link href="/admin/leads" className="block w-full min-w-0">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-crm-muted break-words whitespace-normal leading-normal">
                Nuevos Pedidos
              </CardTitle>
              <Sparkles className="h-4 w-4 text-crm-gold shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-gold">{nuevosPedidos}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Pendientes de gestión</p>
            </CardContent>
          </Card>
        </Link>

        {/* Planes Quincenales Activos */}
        <Link href="/admin/leads" className="block w-full min-w-0">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-crm-muted break-words whitespace-normal leading-normal">
                Planes Quincenales Activos
              </CardTitle>
              <Clock className="h-4 w-4 text-crm-teal shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-teal">{planesQuincenalesActivos}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Cobros diferidos activos</p>
            </CardContent>
          </Card>
        </Link>

        {/* Pendientes WhatsApp / Seguimiento */}
        <Link href="/admin/contactos?filter=whatsapp_valido" className="block w-full min-w-0">
          <Card className="border-crm-line bg-crm-surface transition-colors hover:border-crm-gold/50 h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 gap-2">
              <CardTitle className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-crm-muted break-words whitespace-normal leading-normal">
                Pendientes WhatsApp
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-crm-gold shrink-0" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-crm-gold">{pendientesWhatsapp}</div>
              <p className="mt-1 text-[10px] text-crm-faint">Seguimientos pendientes</p>
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
              Últimos Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mobile View: Cards */}
            <div className="block sm:hidden space-y-4">
              {recentSales.map((sale) => (
                <div key={sale.ventaId} className="border border-crm-line bg-crm-surface2 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <span className="text-[10px] text-crm-faint font-mono">{sale.fechaEntrega || sale.fechaRegistro}</span>
                    <Badge
                      variant="outline"
                      className={
                        sale.montoRestante <= 0
                          ? "border-crm-green text-crm-green text-[9px] font-bold"
                          : "border-crm-amber text-crm-amber text-[9px] font-bold"
                      }
                    >
                      {sale.montoRestante <= 0 ? "Sin saldo" : "Pendiente"}
                    </Badge>
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-crm-text">{sale.nombreCliente}</div>
                    <div className="text-crm-faint text-[11px] mt-0.5">{sale.provincia}</div>
                  </div>
                  <div className="flex justify-between items-baseline pt-2 border-t border-crm-line/60">
                    <div className="text-[10px] text-crm-faint">{sale.familiaProducto}</div>
                    <div className="text-xs font-bold text-crm-gold">
                      {formatDop(sale.totalVenta)}
                    </div>
                  </div>
                  {sale.montoRestante > 0 && (
                    <div className="text-right text-[10px] text-crm-amber font-semibold">
                      Saldo: {formatDop(sale.montoRestante)}
                    </div>
                  )}
                </div>
              ))}
              {recentSales.length === 0 ? (
                <div className="text-center py-8 text-crm-faint text-xs">
                  No hay pedidos cargados.
                </div>
              ) : null}
            </div>

            {/* Desktop View: Table */}
            <div className="hidden sm:block overflow-x-auto">
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
