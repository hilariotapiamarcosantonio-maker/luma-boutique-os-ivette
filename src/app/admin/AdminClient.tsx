"use client";

import { useState, useMemo, useTransition } from "react";
import { DateRangePicker, type DateRange } from "@/components/ui/DateRangePicker";
import { PageHeader } from "@/components/layout/PageHeader";
import type { CapilarDashboardData, CapilarSale } from "@/types/crm";

function formatDop(n: number) {
  return new Intl.NumberFormat("es-DO", { style: "currency", currency: "DOP", maximumFractionDigits: 0 }).format(n);
}

function inRange(dateStr: string, from: string, to: string) {
  if (!dateStr) return false;
  return dateStr >= from && dateStr <= to;
}

function toDateInput(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDaysInput(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return toDateInput(date);
}

function saleDate(sale: CapilarSale) {
  return sale.fechaVenta || sale.fechaRegistro || sale.fechaEntrega || "";
}

function weekKey(dateStr: string) {
  if (!dateStr) return "sin-fecha";
  const date = new Date(`${dateStr}T00:00:00`);
  const day = (date.getDay() + 6) % 7;
  date.setDate(date.getDate() - day);
  return toDateInput(date);
}

const defaultRange: DateRange = { from: "2000-01-01", to: "2099-12-31" };

export function AdminClient({ data }: { data: CapilarDashboardData }) {
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [, startTransition] = useTransition();

  const handleRange = (r: DateRange) => startTransition(() => setRange(r));

  const filteredSales = useMemo(
    () => data.sales.filter((s) => inRange(saleDate(s), range.from, range.to)),
    [data.sales, range]
  );

  const totalVentas = filteredSales.reduce((s, r) => s + r.totalVenta, 0);
  const totalAbonado = filteredSales.reduce((s, r) => s + r.totalAbonado, 0);
  const saldoPendiente = filteredSales.reduce((s, r) => s + r.montoRestante, 0);

  const timeStats = useMemo(() => {
    const today = toDateInput(new Date());
    const yesterday = addDaysInput(-1);
    const tomorrow = addDaysInput(1);
    const currentWeek = weekKey(today);
    const month = today.slice(0, 7);
    const year = today.slice(0, 4);

    const summarize = (label: string, predicate: (date: string) => boolean) => {
      const sales = data.sales.filter((sale) => predicate(saleDate(sale)));
      return {
        label,
        ventas: sales.length,
        total: sales.reduce((sum, sale) => sum + sale.totalVenta, 0),
      };
    };

    return [
      summarize("Ventas de Ayer", (date) => date === yesterday),
      summarize("Ventas de Hoy", (date) => date === today),
      summarize("Mañana", (date) => date === tomorrow),
      summarize("Semana", (date) => weekKey(date) === currentWeek),
      summarize("Mes", (date) => date.startsWith(month)),
      summarize("Año", (date) => date.startsWith(year)),
    ];
  }, [data.sales]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Ventas y Cuentas por Cobrar"
          subtitle="Vista general de ingresos, abonos y saldos del período de Ivette Berroa."
        />
        <DateRangePicker value={range} onChange={handleRange} />
      </div>

      <div className="overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div className="grid min-w-[760px] grid-cols-6 gap-3 sm:min-w-0">
          {timeStats.map((stat) => (
            <div
              key={stat.label}
              className="min-w-0 rounded-xl border border-crm-line bg-crm-surface p-3"
            >
              <p className="whitespace-nowrap text-xs font-medium uppercase tracking-wide text-crm-faint">
                {stat.label}
              </p>
              <p className="mt-1 text-xl font-black text-crm-text">
                {stat.ventas}
              </p>
              <p className="truncate text-xs text-crm-muted">
                {formatDop(stat.total)}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: "Ventas Período", value: formatDop(totalVentas), color: "text-crm-text" },
          { label: "Total Abonado", value: formatDop(totalAbonado), color: "text-crm-green" },
          { label: "Saldo Pendiente", value: formatDop(saldoPendiente), color: "text-crm-gold" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-crm-line bg-crm-surface p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-crm-faint">{k.label}</p>
            <p className={`mt-1 text-2xl font-black ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Master sales table */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-crm-faint">
          Registro de Ventas ({filteredSales.length})
        </p>

        {/* Mobile View: Cards */}
        <div className="block sm:hidden space-y-3">
          {filteredSales.map((sale) => (
            <div
              key={sale.ventaId}
              className="rounded-2xl border border-crm-line bg-crm-surface p-4 space-y-3 text-sm text-crm-text shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-crm-line pb-2">
                <div>
                  <span className="font-extrabold text-crm-gold">#{sale.ventaId}</span>
                  <span className="text-xs text-crm-faint ml-2">{saleDate(sale)}</span>
                </div>
                <div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                    sale.montoRestante <= 0
                      ? "bg-crm-green/15 text-crm-green"
                      : "bg-crm-amber/15 text-crm-amber"
                  }`}>
                    {sale.montoRestante <= 0 ? "Saldado" : `Saldo: ${formatDop(sale.montoRestante)}`}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="text-crm-faint">Cliente</p>
                  <p className="font-bold text-crm-text">{sale.nombreCliente}</p>
                  {sale.whatsapp && (
                    <p className="text-crm-muted truncate mt-0.5">{sale.whatsapp}</p>
                  )}
                </div>
                <div>
                  <p className="text-crm-faint">Ubicación</p>
                  <p className="font-medium text-crm-muted mt-0.5">{sale.provincia || "No especificada"}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-crm-line/50 text-xs">
                <div className="truncate pr-2">
                  <span className="text-crm-faint">Detalle: </span>
                  <span className="font-medium text-crm-muted">{sale.familiaProducto}</span>
                </div>
                <div className="shrink-0">
                  <span className="text-crm-faint">Total: </span>
                  <span className="font-extrabold text-crm-gold text-sm">{formatDop(sale.totalVenta)}</span>
                </div>
              </div>
            </div>
          ))}
          {filteredSales.length === 0 && (
            <div className="text-center py-8 text-crm-muted border border-dashed border-crm-line rounded-2xl bg-crm-surface text-xs">
              No hay ventas en este período.
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden sm:block overflow-hidden rounded-xl border border-crm-line bg-crm-surface">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-crm-line bg-crm-surface2 text-xs uppercase text-crm-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Venta</th>
                  <th className="px-4 py-3 font-medium">Cliente</th>
                  <th className="px-4 py-3 font-medium">Detalle / Origen</th>
                  <th className="px-4 py-3 text-right font-medium">Monto</th>
                  <th className="px-4 py-3 text-right font-medium">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-crm-line">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale.ventaId}
                    className="hover:bg-crm-bg2"
                  >
                    <td className="px-4 py-3 text-crm-faint">
                      {sale.ventaId}
                      <div className="text-xs">{saleDate(sale)}</div>
                    </td>
                    <td className="px-4 py-3 text-crm-text">
                      {sale.nombreCliente}
                      <div className="text-xs text-crm-faint">{sale.whatsapp}</div>
                    </td>
                    <td className="px-4 py-3 text-crm-muted">
                      {sale.familiaProducto}
                      <div className="text-xs text-crm-faint">{sale.provincia}</div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-crm-gold">
                      {formatDop(sale.totalVenta)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                        sale.montoRestante <= 0
                          ? "bg-crm-green/15 text-crm-green"
                          : "bg-crm-amber/15 text-crm-amber"
                      }`}>
                        {formatDop(sale.montoRestante)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
