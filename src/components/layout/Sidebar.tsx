"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  Users,
  X,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { brand } from "@/lib/brand";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Panel", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Pedidos", href: "/admin/leads", icon: ClipboardList },
  { name: "Contactos", href: "/admin/contactos", icon: Users },
  { name: "Lanzamiento 500", href: "/admin/contactos?filter=lanzamiento_500", icon: Sparkles },
  { name: "Seguimiento WhatsApp", href: "/admin/contactos?filter=seguimiento", icon: MessageSquare },
  { name: "Ventas y CxC", href: "/admin", icon: ClipboardList },
];

type SidebarProps = {
  mobileOpen: boolean;
  onClose: () => void;
};

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div className="flex h-16 shrink-0 items-center border-b border-crm-line px-6">
        <div>
          <h1 className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-crm-text">
            IVETTE BERROA <span className="text-crm-gold font-bold">BOUTIQUE OS</span>
          </h1>
          <p className="mt-1 text-[11px] font-medium text-crm-faint">
            by {brand.parentBrand}
          </p>
        </div>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto pt-6">
        <div className="mx-4 mb-5 rounded-md border border-crm-line bg-crm-surface px-3 py-2">
          <p className="text-[11px] uppercase tracking-wide text-crm-faint">
            Workspace
          </p>
          <p className="mt-1 text-sm font-medium text-crm-text">
            {brand.workspaceName}
          </p>
        </div>
        <nav className="flex-1 space-y-1 px-4">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            const active = item.href === "/admin/dashboard" ? pathname === "/admin/dashboard" : isActive;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  active
                    ? "bg-crm-surface2 text-crm-gold"
                    : "text-crm-muted hover:bg-crm-surface hover:text-crm-text",
                  "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    active
                      ? "text-crm-gold"
                      : "text-crm-faint group-hover:text-crm-muted",
                    "mr-3 h-5 w-5 shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="flex shrink-0 border-t border-crm-line p-4">
        <div className="flex items-center">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-crm-surface3 font-bold text-crm-gold">
            IB
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-crm-text">Ivette Berroa</p>
            <p className="text-xs font-medium text-crm-faint">Administradora</p>
          </div>
        </div>
      </div>
    </>
  );
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 flex-col border-r border-crm-line bg-crm-bg2 lg:flex">
        <SidebarContent />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Cerrar menu"
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />
          <aside className="relative flex h-full w-72 max-w-[85vw] flex-col border-r border-crm-line bg-crm-bg2 shadow-2xl">
            <button
              type="button"
              aria-label="Cerrar menu"
              onClick={onClose}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-md border border-crm-line bg-crm-surface text-crm-muted transition-colors hover:bg-crm-surface2 hover:text-crm-text"
            >
              <X className="h-4 w-4" />
            </button>
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      ) : null}
    </>
  );
}
