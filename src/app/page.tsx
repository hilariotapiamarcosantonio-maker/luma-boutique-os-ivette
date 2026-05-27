"use client";

import Link from "next/link";
import { ArrowRight, Leaf, Award, MessageSquare, Star, Sparkles, ShieldCheck, Heart, Truck, Plus } from "lucide-react";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ProductVisual } from "@/components/store/ProductVisual";
import { buildGeneralAdvisorMessage, buildProductWhatsappMessage } from "@/lib/whatsapp";
import { Badge } from "@/components/ui/badge";

export default function StoreFrontHome() {
  const { addItem } = useCart();
  const advisorLink = buildGeneralAdvisorMessage();

  // Get 4 featured products
  const featuredProducts = PRODUCTS.slice(0, 4);

  return (
    <>
      <StoreHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1e2d1a] to-[#2a3b26] py-20 lg:py-28 border-b border-[#2a3b26]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            {/* Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="flex justify-center lg:justify-start mb-2">
                <img src="/logo.png" alt="Ivette Berroa Logo" className="h-16 w-16 object-contain bg-[#2a3b26] border-2 border-[#c5a059] rounded-full p-1 shadow-md" />
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-[#1e2d1a]/80 border border-[#c5a059]/20 px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#c5a059]">
                <Sparkles className="h-3.5 w-3.5 text-[#c5a059]" />
                Colección Premium Orgánica
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-[#faf8f5] sm:text-5xl md:text-6xl lg:leading-[1.15]">
                Tu ritual de belleza y bienestar, en una experiencia premium de cosmética ancestral.
              </h1>
              <p className="mx-auto lg:mx-0 max-w-2xl text-xs sm:text-sm text-[#f2eee9]/80 leading-relaxed">
                Fórmulas botánicas orgánicas elaboradas a mano con ingredientes puros y técnicas ancestrales. Diseñadas para nutrir, rejuvenecer y sanar tu piel y cabello de forma natural. Comienza hoy tu ritual de bienestar.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <Link
                  href="/tienda"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-full bg-[#c5a059] px-8 py-4 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#b38f48] hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  Ver Tienda Online
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={advisorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-full border border-[#c5a059] px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#faf8f5] bg-transparent shadow-sm hover:bg-[#2a3b26] hover:scale-[1.01] transition-all"
                >
                  <MessageSquare className="h-4 w-4 text-[#c5a059]" />
                  Asesoría por WhatsApp
                </a>
              </div>
            </div>

            {/* Visual Assembly (3D Mockup showcase) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[400px] h-[360px] flex items-center justify-center">
                {/* Background decorative blob */}
                <div className="absolute -inset-4 rounded-full bg-gradient-to-tr from-[#C7A45A]/10 to-[#F5E6CA]/30 opacity-60 blur-2xl -z-10" />
                
                {/* 3D Product Mockup Card 1 */}
                <div className="absolute w-[240px] p-6 rounded-2xl bg-[#faf8f5] border border-[#f2eee9] shadow-xl rotate-[-6deg] translate-x-[-30px] transition-all hover:rotate-0 hover:scale-105 duration-300 z-10">
                  <div className="h-48 w-full bg-[#f2eee9] flex items-center justify-center rounded-xl overflow-hidden border border-[#f2eee9]/40">
                    <ProductVisual
                      imageGradient="/products/ivette/kit-ritual-inicio.jpg"
                      name="Kit Ritual de Inicio"
                      category="Kits"
                      sku="KIT-RIT-INI"
                      size="md"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#c5a059] block">Nuestra Fórmula Insignia</span>
                    <h3 className="text-xs font-bold text-[#3d2b1f] mt-0.5">Kit Ritual de Inicio</h3>
                  </div>
                </div>

                {/* 3D Product Mockup Card 2 */}
                <div className="absolute w-[240px] p-6 rounded-2xl bg-[#faf8f5] border border-[#f2eee9] shadow-2xl rotate-[6deg] translate-x-[30px] translate-y-[30px] transition-all hover:rotate-0 hover:scale-105 duration-300 z-20">
                  <div className="h-48 w-full bg-[#f2eee9] flex items-center justify-center rounded-xl overflow-hidden border border-[#f2eee9]/40">
                    <ProductVisual
                      imageGradient="/products/ivette/desodorante-equilibrio.jpg"
                      name="Desodorante en Pasta “Equilibrio”"
                      category="Cuerpo"
                      sku="DES-PAST-EQ"
                      size="md"
                    />
                  </div>
                  <div className="mt-4 text-center">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#c5a059] block">Brillo Tridimensional</span>
                    <h3 className="text-xs font-bold text-[#3d2b1f] mt-0.5">Desodorante “Equilibrio”</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Five Pillars Section */}
      <section className="bg-[#faf8f5] py-16 lg:py-24 border-b border-[#f2eee9]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">Pilares de la Cosmética Ancestral</span>
            <h2 className="text-3xl font-bold tracking-tight text-[#3d2b1f] sm:text-4xl">
              ¿Por qué elegir Ivette Berroa?
            </h2>
            <p className="text-xs sm:text-sm text-[#3d2b1f]/70">
              Rituales sagrados adaptados para tu cuidado diario. Ofrecemos resultados garantizados respetando la naturaleza de tu piel y cabello.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {/* Pillar 1: Belleza Consciente */}
            <div className="rounded-2xl border border-[#f2eee9] bg-[#f2eee9] p-6 text-center transition-all hover:shadow-md hover:border-[#c5a059]/20">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#E0F2FE] text-[#0284C7]">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <h3 className="mt-4 text-sm sm:text-base font-bold text-[#3d2b1f]">Belleza Consciente</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#3d2b1f]/80 leading-relaxed">
                Ingredientes 100% orgánicos, libres de parabenos y sulfatos, respetando tu cuerpo y la tierra.
              </p>
            </div>

            {/* Pillar 2: Botánica Activa */}
            <div className="rounded-2xl border border-[#f2eee9] bg-[#f2eee9] p-6 text-center transition-all hover:shadow-md hover:border-[#c5a059]/20">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#DCFCE7] text-[#15803D]">
                <Leaf className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm sm:text-base font-bold text-[#3d2b1f]">Botánica Activa</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#3d2b1f]/80 leading-relaxed">
                Fórmulas elaboradas con aceites esenciales, extractos herbales y activos naturales de alta potencia.
              </p>
            </div>

            {/* Pillar 3: Nutrición Ancestral */}
            <div className="rounded-2xl border border-[#f2eee9] bg-[#f2eee9] p-6 text-center transition-all hover:shadow-md hover:border-[#c5a059]/20">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#FEF3C7] text-[#D97706]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm sm:text-base font-bold text-[#3d2b1f]">Nutrición Ancestral</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#3d2b1f]/80 leading-relaxed">
                Manteca de karité, aceites puros y extractos de plantas cultivadas de forma natural.
              </p>
            </div>

            {/* Pillar 4: Ritual de Cuidado */}
            <div className="rounded-2xl border border-[#f2eee9] bg-[#f2eee9] p-6 text-center transition-all hover:shadow-md hover:border-[#c5a059]/20">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#F5F3FF] text-[#7C3AED]">
                <Award className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm sm:text-base font-bold text-[#3d2b1f]">Ritual de Cuidado</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#3d2b1f]/80 leading-relaxed">
                Diseñado para transformar tu rutina diaria en un momento sagrado de conexión y bienestar.
              </p>
            </div>

            {/* Pillar 5: WhatsApp Concierge */}
            <div className="rounded-2xl border border-[#f2eee9] bg-[#f2eee9] p-6 text-center transition-all hover:shadow-md hover:border-[#c5a059]/20">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-[#f2eee9] text-[#c5a059]">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm sm:text-base font-bold text-[#3d2b1f]">WhatsApp Concierge</h3>
              <p className="mt-2 text-xs sm:text-sm text-[#3d2b1f]/80 leading-relaxed">
                No compras a ciegas. Atención directa y personalizada para guiarte en la selección del ritual adecuado para ti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How to Buy Section (4 Steps) */}
      <section className="bg-[#f2eee9] py-16 lg:py-24 border-b border-[#f2eee9]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">Compra Fácil</span>
            <h2 className="text-3xl font-bold tracking-tight text-[#3d2b1f]">
              Cómo comprar en 4 sencillos pasos
            </h2>
            <p className="text-xs sm:text-sm text-[#3d2b1f]/70">
              Disfruta de una experiencia transparente y segura con pago contra entrega en toda la República Dominicana.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center space-y-4 relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#faf8f5] border border-[#f2eee9] shadow-sm text-sm font-extrabold text-[#c5a059] relative z-10">
                01
              </div>
              <h3 className="text-sm font-bold text-[#3d2b1f]">Explora Productos</h3>
              <p className="text-xs sm:text-sm text-[#3d2b1f]/80 leading-relaxed px-4">
                Visita nuestro catálogo y elige los productos individuales o kits ideales para tu tipo de hebra.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center space-y-4 relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#faf8f5] border border-[#f2eee9] shadow-sm text-sm font-extrabold text-[#c5a059] relative z-10">
                02
              </div>
              <h3 className="text-sm font-bold text-[#3d2b1f]">Agrega al Carrito</h3>
              <p className="text-xs sm:text-sm text-[#3d2b1f]/80 leading-relaxed px-4">
                Ve añadiendo tus favoritos y ajustando las cantidades de tu pedido de forma interactiva.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center space-y-4 relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#faf8f5] border border-[#f2eee9] shadow-sm text-sm font-extrabold text-[#c5a059] relative z-10">
                03
              </div>
              <h3 className="text-sm font-bold text-[#3d2b1f]">Confirma tu Pedido</h3>
              <p className="text-xs sm:text-sm text-[#3d2b1f]/80 leading-relaxed px-4">
                Completa tu formulario de envío. Registraremos tu pedido en línea de forma inmediata.
              </p>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center space-y-4 relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#faf8f5] border border-[#f2eee9] shadow-sm text-sm font-extrabold text-[#c5a059] relative z-10">
                04
              </div>
              <h3 className="text-sm font-bold text-[#3d2b1f]">Coordinación WhatsApp</h3>
              <p className="text-xs sm:text-sm text-[#3d2b1f]/80 leading-relaxed px-4">
                Un asesor te contactará por WhatsApp para confirmar los detalles de despacho y programar el pago.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products (Favoritos de temporada) */}
      <section className="bg-[#faf8f5] py-16 lg:py-24 border-b border-[#f2eee9]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">Favoritos de Temporada</span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#3d2b1f] mt-1">
                Cosmética Ancestral Destacada
              </h2>
            </div>
            <Link
              href="/tienda"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#c5a059] hover:text-[#c5a059] group"
            >
              Ver todo el catálogo
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link
                key={product.id}
                href={`/producto/${product.slug}`}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#f2eee9] bg-[#faf8f5] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[#c5a059]/20 min-h-[430px]"
              >
                {/* Visual Image with ProductVisual */}
                <div className="h-56 w-full bg-[#f2eee9] flex items-center justify-center relative overflow-hidden border-b border-[#f2eee9]/40">
                  {product.badge && (
                    <span className="absolute top-4 left-4 bg-[#faf8f5]/95 backdrop-blur-sm border border-[#f2eee9] text-[#c5a059] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm z-10">
                      {product.badge}
                    </span>
                  )}
                  <ProductVisual
                    imageGradient={product.image}
                    name={product.name}
                    category={product.category}
                    sku={product.sku}
                    size="md"
                  />
                </div>

                <div className="flex flex-1 flex-col p-5 space-y-2 justify-between">
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#A8A29E]">
                      {product.category}
                    </span>
                    <h3 className="text-sm font-bold text-[#3d2b1f] group-hover:text-[#c5a059] transition-colors line-clamp-2 h-10 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#3d2b1f]/70 line-clamp-2 leading-snug h-9">
                      {product.shortDescription}
                    </p>
                  </div>
                  
                  {/* Prices & Actions */}
                  <div className="pt-4 flex items-center justify-between border-t border-[#F5F5F4] mt-auto">
                    <div>
                      {product.priceBefore && (
                        <span className="block text-[10px] text-[#A8A29E] line-through">
                          RD$ {product.priceBefore.toLocaleString()}
                        </span>
                      )}
                      <span className="text-xs font-bold text-[#c5a059]">
                        RD$ {product.price.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          addItem(product, 1);
                        }}
                        className="inline-flex h-8 px-3 items-center justify-center rounded-full bg-[#f2eee9] text-[#c5a059] hover:bg-[#c5a059] hover:text-white transition-all text-xs font-bold gap-1 z-10"
                      >
                        <Plus className="h-3 w-3" />
                        Añadir
                      </button>
                      <a
                        href={buildProductWhatsappMessage(product)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] hover:bg-[#2e7d32] hover:text-white hover:border-[#2e7d32] transition-all"
                        title="Consultar por WhatsApp"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Guarantee Section */}
      <section className="bg-[#f2eee9] py-16 lg:py-24 border-b border-[#f2eee9]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
            <div className="space-y-6">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">Nuestra Garantía</span>
              <h2 className="text-3xl font-bold tracking-tight text-[#3d2b1f] sm:text-4xl">
                Seguridad y tranquilidad en tu rutina de compra
              </h2>
              <p className="text-sm sm:text-base text-[#3d2b1f]/80 leading-relaxed">
                Sabemos que cuidar tu piel y bienestar es una decisión importante. Por eso estructuramos un canal comercial donde lo más importante es tu confianza. No requerimos tarjetas de crédito para registrar tu pedido y el despacho se realiza bajo estrictos controles locales de calidad.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2eee9] text-[#c5a059] mt-0.5">
                    <ShieldCheck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#3d2b1f]">Compra 100% Protegida</span>
                    <span className="block text-xs text-[#3d2b1f]/75 mt-1">Pagas en efectivo o transferencia bancaria al recibir tus productos.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#f2eee9] text-[#c5a059] mt-0.5">
                    <Truck className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <span className="block text-sm font-bold text-[#3d2b1f]">Entrega Local Coordinada</span>
                    <span className="block text-xs text-[#3d2b1f]/75 mt-1">Coordinación personalizada de envíos a nivel nacional para mayor seguridad y rapidez.</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* CTA Box */}
            <div className="bg-[#faf8f5] rounded-3xl p-8 lg:p-12 border border-[#f2eee9] text-center space-y-4 shadow-sm">
              <h3 className="text-xl font-bold text-[#c5a059]">
                ¿Quieres recibir una recomendación experta?
              </h3>
              <p className="text-xs text-[#3d2b1f]/75 leading-relaxed max-w-sm mx-auto">
                Escríbenos por WhatsApp y te ayudaremos a analizar tu caso para recomendarte el kit o producto que mejor se adapte a tu tipo de piel.
              </p>
              <div className="pt-4">
                <a
                  href={advisorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c5a059] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#B5914A] transition-all"
                >
                  Asesoría por WhatsApp
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Extensive & Believable) */}
      <section className="bg-[#faf8f5] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">Experiencias Reales</span>
            <h2 className="text-3xl font-bold tracking-tight text-[#3d2b1f]">
              Lo que dicen nuestros clientes
            </h2>
            <p className="text-xs sm:text-sm text-[#3d2b1f]/70">
              Testimonios honestos de personas reales que han incorporado nuestra línea a su cuidado diario.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {/* Testimonial 1 */}
            <div className="rounded-2xl border border-[#f2eee9] p-8 space-y-4 bg-[#f2eee9] shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5 text-[#c5a059]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#3d2b1f]/75 leading-relaxed italic">
                  &quot;Me orientaron por WhatsApp y pude elegir el kit de inicio correcto para mi rutina.&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-[#f2eee9] flex items-center justify-between mt-4">
                <div>
                  <h4 className="text-xs font-bold text-[#3d2b1f]">Laura M.</h4>
                  <span className="text-[10px] text-[#3d2b1f]/70">Santo Domingo</span>
                </div>
                <Badge variant="secondary" className="bg-[#f2eee9] text-[#c5a059] text-[9px]">Comprador Verificado</Badge>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="rounded-2xl border border-[#f2eee9] p-8 space-y-4 bg-[#f2eee9] shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5 text-[#c5a059]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#3d2b1f]/75 leading-relaxed italic">
                  &quot;El proceso fue fácil: elegí, confirmé por WhatsApp y coordiné la entrega.&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-[#f2eee9] flex items-center justify-between mt-4">
                <div>
                  <h4 className="text-xs font-bold text-[#3d2b1f]">Marcos T.</h4>
                  <span className="text-[10px] text-[#3d2b1f]/70">Santiago</span>
                </div>
                <Badge variant="secondary" className="bg-[#f2eee9] text-[#c5a059] text-[9px]">Comprador Verificado</Badge>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="rounded-2xl border border-[#f2eee9] p-8 space-y-4 bg-[#f2eee9] shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex gap-0.5 text-[#c5a059]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-[#3d2b1f]/75 leading-relaxed italic">
                  &quot;Me gustó que la tienda muestra todo organizado y no tuve que preguntar producto por producto.&quot;
                </p>
              </div>
              <div className="pt-4 border-t border-[#f2eee9] flex items-center justify-between mt-4">
                <div>
                  <h4 className="text-xs font-bold text-[#3d2b1f]">Camila R.</h4>
                  <span className="text-[10px] text-[#3d2b1f]/70">La Romana</span>
                </div>
                <Badge variant="secondary" className="bg-[#f2eee9] text-[#c5a059] text-[9px]">Comprador Verificado</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-t from-[#F5F2EB]/60 to-white py-16 lg:py-20 border-t border-[#f2eee9]/40">
        <div className="mx-auto max-w-4xl px-4 text-center space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059] block">¿Listo para comenzar?</span>
          <h2 className="text-3xl font-bold tracking-tight text-[#3d2b1f] sm:text-4xl">
            Luce una piel saludable, radiante y natural
          </h2>
          <p className="text-xs sm:text-sm text-[#3d2b1f]/75 max-w-md mx-auto leading-relaxed">
            Completa tu pedido en línea y recibe en la comodidad de tu casa con asesoría y seguimiento 100% personalizados por WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/tienda"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-full bg-[#c5a059] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#B5914A] transition-all"
            >
              Explorar Catálogo Completo
            </Link>
            <a
              href={advisorLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto rounded-full border border-[#c5a059] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-[#c5a059] bg-[#faf8f5] shadow-sm hover:bg-[#f2eee9] transition-all"
            >
              Asesoría por WhatsApp
            </a>
          </div>
        </div>
      </section>

      <StoreFooter />
    </>
  );
}
