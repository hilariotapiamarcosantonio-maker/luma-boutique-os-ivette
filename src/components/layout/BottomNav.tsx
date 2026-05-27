"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const fieldNav = [
  { name: "Panel", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Pedidos", href: "/admin/leads", icon: ClipboardList },
  { name: "Contactos", href: "/admin/contactos", icon: Users },
];

/** Visible only on mobile (<lg). Shown for field-role routes. */
export function BottomNav() {
  const pathname = usePathname();
  const isFieldRoute = fieldNav.some((n) => n.href === pathname || pathname?.startsWith(n.href + "/"));

  if (!isFieldRoute) return null;

  return (
    <nav
      aria-label="Navegación de roles"
      className="fixed bottom-0 inset-x-0 z-40 flex h-16 items-stretch
                 border-t border-crm-line bg-crm-bg2/95 backdrop-blur-sm
                 lg:hidden"
    >
      {fieldNav.map((item) => {
        const active = item.href === "/admin/dashboard" ? pathname === "/admin/dashboard" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1 min-h-[44px] text-xs font-medium transition-colors",
              active ? "text-crm-gold" : "text-crm-faint hover:text-crm-muted"
            )}
          >
            <item.icon
              className={cn("h-5 w-5 transition-transform", active && "scale-110")}
              aria-hidden="true"
            />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
