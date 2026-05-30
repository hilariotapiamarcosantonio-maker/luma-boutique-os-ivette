"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { getActiveNiche } from "@/config/niches";
import { buildGeneralAdvisorMessage } from "@/lib/whatsapp";
import { categoryToSlug } from "@/lib/slugs";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export function StoreFooter() {
  const niche = getActiveNiche();
  const year = new Date().getFullYear();

  // Social links configuration
  const instagramUrl = process.env.NEXT_PUBLIC_INSTAGRAM_URL || "";
  const facebookUrl = process.env.NEXT_PUBLIC_FACEBOOK_URL || "";
  const tiktokUrl = process.env.NEXT_PUBLIC_TIKTOK_URL || "";
  const hasWhatsapp = !!niche.whatsappNumber;

  const showInstagram = instagramUrl.startsWith("http");
  const showFacebook = facebookUrl.startsWith("http");
  const showTiktok = tiktokUrl.startsWith("http");

  const advisorLink = buildGeneralAdvisorMessage();

  return (
    <footer className="border-t border-[#2a3b26] bg-[#1e2d1a] text-[#faf8f5]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3.5">
              <img src="/logo.png" alt="Ivette Berroa Logo" className="h-20 w-20 md:h-24 md:w-24 object-contain bg-transparent border-2 border-[#c5a059] rounded-full p-[2px] shadow-md hover:scale-105 transition-transform duration-300" />
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-bold uppercase tracking-[0.24em] text-[#faf8f5] leading-none">
                  IVETTE <span className="text-[#c5a059]">BERROA</span>
                </span>
                <span className="text-[9px] font-semibold tracking-[0.12em] text-[#f2eee9]/60 mt-1.5 uppercase">
                  Cosmética Ancestral
                </span>
              </div>
            </div>
            <p className="max-w-md text-xs text-[#f2eee9]/70 leading-relaxed">
              {niche.subtitleHero}
            </p>
            {/* Social Icons */}
            <div className="flex space-x-4">
              {hasWhatsapp && (
                <a
                  href={advisorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f2eee9]/60 hover:text-[#c5a059] transition-colors"
                  aria-label="WhatsApp Asesoría"
                >
                  <MessageSquare className="h-5 w-5" />
                </a>
              )}
              {showInstagram && (
                <a
                  href={instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f2eee9]/60 hover:text-[#c5a059] transition-colors"
                  aria-label="Instagram"
                >
                  <InstagramIcon className="h-5 w-5" />
                </a>
              )}
              {showFacebook && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f2eee9]/60 hover:text-[#c5a059] transition-colors"
                  aria-label="Facebook"
                >
                  <FacebookIcon className="h-5 w-5" />
                </a>
              )}
              {showTiktok && (
                <a
                  href={tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#f2eee9]/60 hover:text-[#c5a059] transition-colors"
                  aria-label="TikTok"
                >
                  <TikTokIcon className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
              Navegación
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link href="/" className="text-xs text-[#f2eee9]/80 hover:text-[#c5a059] transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/tienda" className="text-xs text-[#f2eee9]/80 hover:text-[#c5a059] transition-colors">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/categoria/kits" className="text-xs text-[#f2eee9]/80 hover:text-[#c5a059] transition-colors">
                  Kits Especiales
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#c5a059]">
              Categorías
            </h3>
            <ul className="mt-4 space-y-2">
              {niche.categories
                .filter((cat) => cat.toLowerCase() !== "kits")
                .slice(0, 5)
                .map((cat) => (
                  <li key={cat}>
                    <Link
                      href={`/categoria/${categoryToSlug(cat)}`}
                      className="text-xs text-[#f2eee9]/80 hover:text-[#c5a059] transition-colors"
                    >
                      {cat}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-[#2a3b26] pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <p className="text-[11px] text-[#f2eee9]/70">
              &copy; {year} {niche.name} - Todos los derechos reservados.
            </p>
            <p className="text-[10px] text-[#f2eee9]/50">
              Cosmética ancestral, elaborada a mano con ingredientes orgánicos y de origen consciente.
            </p>
          </div>
          
          <div className="text-center space-y-0.5 shrink-0">
            <p className="text-[10px] text-[#c5a059] font-medium tracking-wide">
              Desarrollado por <span className="font-bold">Marcos Hilario</span>
            </p>
            <p className="text-[9px] text-[#f2eee9]/40">
              &copy; 2026 Marcos Hilario. Arquitectura Digital de Alto Rendimiento.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
            <div className="flex items-center gap-3">
              {process.env.NEXT_PUBLIC_SHOW_INTERNAL_ACCESS === "true" && (
                <>
                  <Link 
                    href="/admin/dashboard" 
                    className="text-[10px] text-[#f2eee9]/50 hover:text-[#c5a059] tracking-wider uppercase font-semibold transition-colors"
                  >
                    Acceso Interno
                  </Link>
                  <span className="text-[#2a3b26]">|</span>
                </>
              )}
              <span className="text-[11px] text-[#f2eee9]/50 tracking-wider uppercase font-semibold">
                Powered by Ivette Berroa
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
