"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { brand } from "@/lib/brand";

const pageTitles: Record<string, string> = {
  "/": "Panel",
  "/leads": "Leads",
  "/propiedades": "Propiedades",
  "/visitas": "Visitas",
  "/cierres": "Cierres",
  "/pipeline": "Pipeline",
};

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname();
  const title =
    pageTitles[pathname] ||
    (pathname?.startsWith("/leads/") ? "Detalle de lead" : undefined) ||
    (pathname?.startsWith("/propiedades/") ? "Ficha de propiedad" : undefined) ||
    "Panel";

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-crm-line bg-crm-bg px-4 sm:px-6 lg:px-8">
      <button
        type="button"
        aria-label="Abrir menú"
        onClick={onMenuClick}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-crm-line bg-crm-surface text-crm-muted transition-colors hover:bg-crm-surface2 hover:text-crm-text lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-medium text-crm-faint">
          {brand.productName}
        </span>
        <h2 className="truncate text-lg font-semibold leading-7 text-crm-text sm:text-xl">
          {title}
        </h2>
      </div>
    </header>
  );
}
