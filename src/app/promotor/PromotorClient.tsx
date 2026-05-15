"use client";

import { useMemo, useState, useTransition } from "react";
import {
  Award,
  CalendarDays,
  MessageCircle,
  Target,
  TrendingUp,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DateRangePicker, type DateRange } from "@/components/ui/DateRangePicker";
import { SkeletonList } from "@/components/ui/SkeletonLoaders";
import { PageHeader } from "@/components/layout/PageHeader";
import type { CapilarDashboardData, CapilarSale } from "@/types/crm";

function formatDop(n: number) {
  return new Intl.NumberFormat("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  }).format(n);
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

function currentWeekKey() {
  return weekKey(toDateInput(new Date()));
}

function calculateMetaBonus(
  sales: CapilarSale[],
  metaSemanal: number,
  bonoMeta: number
) {
  const grouped = new Map<string, number>();

  for (const sale of sales) {
    const key = weekKey(saleDate(sale));
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  return Array.from(grouped.values()).reduce(
    (sum, count) => sum + (count === metaSemanal ? bonoMeta : 0),
    0
  );
}

const defaultRange: DateRange = { from: "2000-01-01", to: "2099-12-31" };

const glassCard = [
  "relative overflow-hidden rounded-2xl border border-white/10",
  "bg-gradient-to-br from-[#111820]/90 to-[#0d1520]/90",
  "backdrop-blur-sm shadow-xl p-5 space-y-3",
].join(" ");

function emptyForm() {
  return {
    nombre: "",
    apellido: "",
    whatsapp: "",
    provincia: "",
    cedula: "",
    producto: "",
    total_venta: "",
    fecha_proximo_pago: addDaysInput(15),
    maximo_cuotas: "2",
    promotor_manual: "",
  };
}

export function PromotorClient({ data }: { data: CapilarDashboardData }) {
  const router = useRouter();
  const [range, setRange] = useState<DateRange>(defaultRange);
  const [selectedPromotor, setSelectedPromotor] = useState("");
  const [isPending, startTransition] = useTransition();

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyForm);

  const promotoresDisponibles = useMemo(
    () =>
      Array.from(
        new Set(
          data.sales
            .map((sale) => sale.promotor)
            .filter((promotor): promotor is string => Boolean(promotor))
        )
      ).sort((a, b) => a.localeCompare(b)),
    [data.sales]
  );

  const productosDisponibles = useMemo(
    () =>
      Array.from(
        new Set(
          [
            ...data.products.map((product) => product.nombreProducto),
            ...data.sales.map((sale) => sale.producto || sale.lineaVendida),
          ].filter(Boolean)
        )
      ).sort((a, b) => a.localeCompare(b)),
    [data.products, data.sales]
  );

  const currentPromotor = selectedPromotor || promotoresDisponibles[0] || "";

  const handleRange = (r: DateRange) => startTransition(() => setRange(r));

  const filteredSales = useMemo(
    () =>
      data.sales.filter((sale) => {
        const date = saleDate(sale);
        const matchesDate = inRange(date, range.from, range.to);
        const matchesPromotor =
          !currentPromotor || sale.promotor === currentPromotor;
        return matchesDate && matchesPromotor;
      }),
    [currentPromotor, data.sales, range]
  );

  const byPromotor = useMemo(() => {
    const map = new Map<
      string,
      {
        promotor: string;
        ventas: number;
        totalVenta: number;
        comisionBase: number;
        bonoMeta: number;
        ventasSemana: number;
        clientes: {
          nombre: string;
          whatsapp: string;
          linea: string;
          saldo: number;
          proximoPago: string;
          cuotasPagadas: number;
          maximoCuotas: number;
        }[];
        sales: CapilarSale[];
      }
    >();

    for (const sale of filteredSales) {
      const key = sale.promotor || "Sin promotor";
      const cur =
        map.get(key) ??
        {
          promotor: key,
          ventas: 0,
          totalVenta: 0,
          comisionBase: 0,
          bonoMeta: 0,
          ventasSemana: 0,
          clientes: [],
          sales: [],
        };
      cur.ventas += 1;
      cur.totalVenta += sale.totalVenta;
      cur.sales.push(sale);
      cur.clientes.push({
        nombre: sale.nombreCliente,
        whatsapp: sale.whatsapp,
        linea: sale.producto || sale.lineaVendida,
        saldo: sale.montoRestante,
        proximoPago: sale.fechaProximoPago || sale.fechaCobro,
        cuotasPagadas: sale.cuotasPagadas,
        maximoCuotas: sale.maximoCuotas,
      });
      map.set(key, cur);
    }

    const week = currentWeekKey();

    return Array.from(map.values())
      .map((stats) => {
        const ventasSemana = data.sales.filter(
          (sale) => sale.promotor === stats.promotor && weekKey(saleDate(sale)) === week
        ).length;

        return {
          ...stats,
          comisionBase: stats.ventas * data.config.comisionBasePorLinea,
          bonoMeta: calculateMetaBonus(
            stats.sales,
            data.config.metaSemanalLineas,
            data.config.bonoMetaSemanal
          ),
          ventasSemana,
        };
      })
      .sort((a, b) => b.totalVenta - a.totalVenta);
  }, [data.config, data.sales, filteredSales]);

  const selectedWeeklySales = useMemo(() => {
    if (!currentPromotor) return 0;
    const week = currentWeekKey();
    return data.sales.filter(
      (sale) => sale.promotor === currentPromotor && weekKey(saleDate(sale)) === week
    ).length;
  }, [currentPromotor, data.sales]);

  const metaProgress = Math.min(
    (selectedWeeklySales / data.config.metaSemanalLineas) * 100,
    100
  );

  const openModal = () => {
    setFormData(emptyForm());
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const promotor = currentPromotor || formData.promotor_manual.trim();

    if (!promotor) {
      alert("Selecciona o escribe el promotor antes de guardar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: formData.nombre,
          apellido: formData.apellido,
          whatsapp: formData.whatsapp,
          provincia: formData.provincia,
          cedula: formData.cedula,
          producto: formData.producto,
          promotor,
          fecha_proximo_pago: formData.fecha_proximo_pago,
          total_venta: Number(formData.total_venta),
          maximo_cuotas: Number(formData.maximo_cuotas),
          ciclo_pago: "quincenal",
        }),
      });

      if (res.ok) {
        setShowModal(false);
        setFormData(emptyForm());
        router.refresh();
      } else {
        const payload = await res.json().catch(() => null);
        alert(payload?.error || "Error al guardar");
      }
    } catch (err) {
      console.error(err);
      alert("Error de conexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <PageHeader
          title="Panel Promotores"
          subtitle="Comision fija por linea, bono semanal y ventas filtradas por promotor."
        />
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 rounded-xl border border-crm-line bg-crm-surface px-3 py-2 text-sm text-crm-muted">
            <UserRound className="h-4 w-4 text-crm-gold" />
            <select
              value={currentPromotor}
              onChange={(e) => setSelectedPromotor(e.target.value)}
              className="min-w-0 bg-transparent text-crm-text outline-none"
              aria-label="Seleccionar promotor"
              disabled={promotoresDisponibles.length === 0}
            >
              {promotoresDisponibles.length === 0 ? (
                <option value="">Sin promotores</option>
              ) : (
                promotoresDisponibles.map((promotor) => (
                  <option key={promotor} value={promotor}>
                    {promotor}
                  </option>
                ))
              )}
            </select>
          </label>
          <DateRangePicker value={range} onChange={handleRange} />
        </div>
      </div>

      <div className={glassCard}>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-crm-gold/15">
            <Target className="h-5 w-5 text-crm-gold" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-crm-faint">
              Meta Semanal
            </p>
            <p className="truncate text-lg font-bold text-crm-text">
              {currentPromotor || "Sin promotor"}: {selectedWeeklySales} /{" "}
              {data.config.metaSemanalLineas} ventas
            </p>
          </div>
          <span className="text-xl font-black text-crm-gold">
            {metaProgress.toFixed(0)}%
          </span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-crm-surface2">
          <div
            className="h-full rounded-full bg-gradient-to-r from-crm-gold via-amber-400 to-yellow-300 transition-all duration-500"
            style={{ width: `${metaProgress}%` }}
          />
        </div>
        <p className="text-[11px] text-crm-faint">
          {selectedWeeklySales === data.config.metaSemanalLineas
            ? `Bono semanal ganado: ${formatDop(data.config.bonoMetaSemanal)}`
            : selectedWeeklySales < data.config.metaSemanalLineas
              ? `Faltan ${data.config.metaSemanalLineas - selectedWeeklySales} ventas para el bono semanal`
              : "La meta exacta de 20 ventas ya fue superada esta semana"}
        </p>
      </div>

      {isPending ? (
        <SkeletonList count={3} />
      ) : (
        <div className="space-y-4">
          {byPromotor.length === 0 && (
            <p className="py-10 text-center text-sm text-crm-faint">
              No hay ventas para este promotor en el periodo seleccionado.
            </p>
          )}
          {byPromotor.map((promotor) => {
            const totalComision = promotor.comisionBase + promotor.bonoMeta;

            return (
              <div key={promotor.promotor} className={glassCard}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-crm-surface3 text-sm font-bold text-crm-gold">
                      {promotor.promotor.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-crm-text">
                        {promotor.promotor}
                      </p>
                      <p className="text-xs text-crm-faint">
                        {promotor.ventas} ventas en el filtro
                      </p>
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5 shrink-0 text-crm-green" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <MetricChip
                    label="Comision Base"
                    value={formatDop(promotor.comisionBase)}
                    color="text-crm-gold"
                  />
                  <MetricChip
                    label="Bono Meta"
                    value={formatDop(promotor.bonoMeta)}
                    color="text-crm-green"
                  />
                  <MetricChip
                    label="Ventas Semana"
                    value={String(promotor.ventasSemana)}
                    color="text-crm-amber"
                  />
                </div>

                <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-crm-gold/10 to-amber-500/5 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-crm-gold" />
                    <span className="text-sm font-semibold text-crm-text">
                      Total a Pagar
                    </span>
                  </div>
                  <span className="text-lg font-black text-crm-gold">
                    {formatDop(totalComision)}
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  {promotor.clientes.map((cliente, idx) => (
                    <div
                      key={`${cliente.nombre}-${idx}`}
                      className="flex items-center justify-between rounded-xl border border-crm-line bg-crm-surface/60 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-crm-text">
                          {cliente.nombre}
                        </p>
                        <p className="text-xs text-crm-faint">{cliente.linea}</p>
                        <div className="mt-1 flex flex-wrap gap-1.5">
                          {cliente.saldo > 0 && (
                            <Pill
                              label="Saldo"
                              value={formatDop(cliente.saldo)}
                              color="bg-crm-amber/10 text-crm-amber"
                            />
                          )}
                          {cliente.proximoPago && (
                            <Pill
                              label="Prox."
                              value={cliente.proximoPago}
                              color="bg-crm-blue/10 text-crm-muted"
                            />
                          )}
                          {cliente.maximoCuotas > 0 && (
                            <Pill
                              label="Cuotas"
                              value={`${cliente.cuotasPagadas}/${cliente.maximoCuotas}`}
                              color="bg-crm-surface3 text-crm-muted"
                            />
                          )}
                        </div>
                      </div>
                      {cliente.whatsapp && (
                        <a
                          href={`https://wa.me/${cliente.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={`WhatsApp ${cliente.nombre}`}
                          className="ml-3 flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-500 text-white shadow-lg shadow-green-500/30 transition-transform hover:bg-green-400 active:scale-95"
                        >
                          <MessageCircle className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        onClick={openModal}
        className="fixed bottom-24 right-5 flex h-14 w-14 items-center justify-center rounded-full bg-crm-gold text-crm-bg shadow-xl shadow-crm-gold/20 transition-transform active:scale-95"
        aria-label="Registrar Nueva Venta"
      >
        <span className="text-2xl font-light leading-none">+</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-white/10 bg-crm-surface2 p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-crm-text">
                  Registrar Venta
                </h3>
                <p className="text-xs text-crm-faint">
                  Fecha de venta automatica al guardar.
                </p>
              </div>
              <CalendarDays className="h-5 w-5 text-crm-gold" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Nombre">
                  <input
                    required
                    type="text"
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Nombre"
                  />
                </Field>
                <Field label="Apellido">
                  <input
                    required
                    type="text"
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Apellido"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="WhatsApp">
                  <input
                    required
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) =>
                      setFormData({ ...formData, whatsapp: e.target.value })
                    }
                    className={inputClass}
                    placeholder="8090000000"
                  />
                </Field>
                <Field label="Cedula (opcional)">
                  <input
                    type="text"
                    value={formData.cedula}
                    onChange={(e) =>
                      setFormData({ ...formData, cedula: e.target.value })
                    }
                    className={inputClass}
                    placeholder="000-0000000-0"
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Provincia">
                  <input
                    required
                    type="text"
                    value={formData.provincia}
                    onChange={(e) =>
                      setFormData({ ...formData, provincia: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Provincia"
                  />
                </Field>
                <Field label="Producto">
                  <input
                    required
                    list="productos-disponibles"
                    value={formData.producto}
                    onChange={(e) =>
                      setFormData({ ...formData, producto: e.target.value })
                    }
                    className={inputClass}
                    placeholder="Linea o producto"
                  />
                  <datalist id="productos-disponibles">
                    {productosDisponibles.map((producto) => (
                      <option key={producto} value={producto} />
                    ))}
                  </datalist>
                </Field>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Monto (RD$)">
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.total_venta}
                    onChange={(e) =>
                      setFormData({ ...formData, total_venta: e.target.value })
                    }
                    className={inputClass}
                    placeholder="0"
                  />
                </Field>
                <Field label="Proximo pago">
                  <input
                    required
                    type="date"
                    value={formData.fecha_proximo_pago}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fecha_proximo_pago: e.target.value,
                      })
                    }
                    className={inputClass}
                  />
                </Field>
                <Field label="Maximo cuotas">
                  <select
                    required
                    value={formData.maximo_cuotas}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        maximo_cuotas: e.target.value,
                      })
                    }
                    className={inputClass}
                  >
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                  </select>
                </Field>
              </div>

              {currentPromotor ? (
                <div className="rounded-xl border border-crm-line bg-crm-bg px-3 py-2">
                  <p className="text-xs text-crm-faint">Promotor por sesion</p>
                  <p className="text-sm font-semibold text-crm-text">
                    {currentPromotor}
                  </p>
                </div>
              ) : (
                <Field label="Promotor">
                  <input
                    required
                    type="text"
                    value={formData.promotor_manual}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        promotor_manual: e.target.value,
                      })
                    }
                    className={inputClass}
                    placeholder="Nombre del promotor"
                  />
                </Field>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-crm-faint hover:text-crm-text"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-crm-gold px-5 py-2 text-sm font-bold text-crm-bg transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-crm-line bg-crm-bg p-2.5 text-sm text-crm-text placeholder:text-crm-faint focus:border-crm-gold focus:outline-none";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-crm-faint">{label}</span>
      {children}
    </label>
  );
}

function MetricChip({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="rounded-lg border border-crm-line bg-crm-surface/60 px-3 py-2 text-center">
      <p className="text-[10px] font-medium text-crm-faint">{label}</p>
      <p className={`mt-0.5 text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

function Pill({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${color}`}
    >
      <span className="text-current/60">{label}:</span> {value}
    </span>
  );
}
