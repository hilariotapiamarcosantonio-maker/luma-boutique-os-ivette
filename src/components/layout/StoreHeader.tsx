"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ShoppingBag, MessageSquare } from "lucide-react";
import { getActiveNiche } from "@/config/niches";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { CartDrawer } from "@/components/store/CartDrawer";
import { buildGeneralAdvisorMessage } from "@/lib/whatsapp";
import { PRODUCTS } from "@/data/products";
import { categoryToSlug } from "@/lib/slugs";

export function StoreHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const pathname = usePathname();
  const niche = getActiveNiche();
  const { cartCount, isLoaded } = useCart();

  const navigation = [
    { name: "Inicio", href: "/" },
    { name: "Tienda", href: "/tienda" },
    { name: "Kits", href: "/categoria/kits" },
  ];

  // Only show categories that actually contain products
  const activeCategories = niche.categories.filter((cat) =>
    PRODUCTS.some((p) => p.category.toLowerCase() === cat.toLowerCase())
  );

  const advisorLink = buildGeneralAdvisorMessage();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#f2eee9] bg-[#faf8f5]/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 md:h-24 items-center justify-between">
            {/* Logo */}
            <div className="flex">
              <Link href="/" className="flex shrink-0 items-center gap-2.5">
                <img src="/logo.png" alt="Ivette Berroa Logo" className="h-14 w-14 md:h-[72px] md:w-[72px] object-contain bg-[#2a3b26] border-2 border-[#c5a059] rounded-full p-1 shadow-md transition-all duration-300 hover:scale-105" />
                <div className="flex flex-col justify-center">
                  <span className="text-xs sm:text-sm md:text-base font-bold uppercase tracking-[0.24em] text-[#3d2b1f] leading-none">
                    IVETTE <span className="text-[#c5a059]">BERROA</span>
                  </span>
                  <span className="text-[8px] md:text-[9px] font-semibold tracking-[0.12em] text-[#3d2b1f]/75 mt-1 uppercase">
                    Cosmética Ancestral
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Nav */}
            <nav className="hidden md:flex space-x-8">
              {navigation.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-[#c5a059]",
                      active ? "text-[#c5a059]" : "text-[#3d2b1f]"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Quick dropdown for categories */}
              <div className="relative group">
                <span className="text-sm font-medium text-[#3d2b1f] hover:text-[#c5a059] cursor-pointer flex items-center gap-1">
                  Categorías
                </span>
                <div className="absolute left-0 mt-2 w-48 rounded-md bg-[#faf8f5] border border-[#f2eee9] shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 py-1">
                  {activeCategories
                    .filter((cat) => cat.toLowerCase() !== "kits") // Exclude Kits as it has a direct link
                    .map((cat) => (
                      <Link
                        key={cat}
                        href={`/categoria/${categoryToSlug(cat)}`}
                        className="block px-4 py-2 text-xs text-[#3d2b1f] hover:bg-[#f2eee9] hover:text-[#c5a059]"
                      >
                        {cat}
                      </Link>
                    ))}
                </div>
              </div>
            </nav>

            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href={advisorLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#faf8f5] bg-[#2a3b26] px-3.5 py-2 rounded-full hover:bg-[#1e2d1a] transition-colors"
              >
                <MessageSquare className="h-3.5 w-3.5 animate-pulse" />
                Asesoría
              </a>
              
              {/* Cart Button */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative inline-flex items-center justify-center p-2 rounded-full text-[#3d2b1f] hover:text-[#c5a059] hover:bg-[#f2eee9] transition-all"
                aria-label="Abrir Carrito"
              >
                <ShoppingBag className="h-5 w-5" />
                {isLoaded && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c5a059] text-[9px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in duration-200">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden gap-3">
              {/* Cart Button Mobile */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 rounded-full text-[#3d2b1f] hover:text-[#c5a059] transition-all"
                aria-label="Abrir Carrito"
              >
                <ShoppingBag className="h-5 w-5" />
                {isLoaded && cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#c5a059] text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-[#3d2b1f] hover:text-[#c5a059] hover:bg-[#f2eee9] focus:outline-none"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-[#f2eee9] bg-[#faf8f5] px-4 pb-4 pt-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "block px-3 py-2.5 rounded-md text-base font-medium",
                      active ? "bg-[#f2eee9] text-[#c5a059]" : "text-[#3d2b1f] hover:bg-[#f2eee9]"
                    )}
                  >
                    {item.name}
                  </Link>
                );
              })}
              
              {/* Mobile Categories Accordion */}
              <div className="px-3 py-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#3d2b1f]/60 mb-2">
                  Categorías
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {activeCategories.map((cat) => (
                    <Link
                      key={cat}
                      href={`/categoria/${categoryToSlug(cat)}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-1 text-sm text-[#3d2b1f] hover:text-[#c5a059]"
                    >
                      {cat}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#f2eee9] pt-4 mt-2 flex flex-col gap-2 px-3">
                <a
                  href={advisorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full text-center py-2.5 rounded-md font-semibold text-sm text-[#faf8f5] bg-[#2a3b26]"
                >
                  <MessageSquare className="h-4 w-4" />
                  Asesoría por WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Shopping Cart Slider Drawer */}
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
}
