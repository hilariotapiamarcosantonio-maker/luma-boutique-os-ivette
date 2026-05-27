"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Plus, MessageSquare, ShoppingBag, ShieldCheck, Heart, Sparkles, CheckCircle2, ShoppingCart } from "lucide-react";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { getProductBySlug, PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ProductVisual } from "@/components/store/ProductVisual";
import { buildProductWhatsappMessage } from "@/lib/whatsapp";

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function StoreProductDetails({ params }: ProductPageProps) {
  const product = getProductBySlug(params.slug);
  const { addItem } = useCart();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);

  if (!product) {
    notFound();
  }

  // Pre-filled WhatsApp message URL
  const waUrl = buildProductWhatsappMessage(product);

  const handleAddToCart = () => {
    addItem(product, quantity);
  };

  const handleBuyNow = () => {
    addItem(product, quantity);
    router.push("/checkout");
  };

  return (
    <>
      <StoreHeader />

      <main className="min-h-screen bg-[#f2eee9] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Back Navigation */}
          <div className="mb-8">
            <Link
              href="/tienda"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c5a059] hover:text-[#c5a059] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver al Catálogo
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-start bg-[#faf8f5] border border-[#f2eee9] rounded-3xl p-6 md:p-10 shadow-sm">
            {/* Visual Gallery / Image Area */}
            <div className="lg:col-span-6 space-y-4">
              <div className="h-[350px] md:h-[450px] w-full rounded-2xl bg-[#f2eee9] flex items-center justify-center relative overflow-hidden shadow-inner border border-[#f2eee9]/60">
                {product.badge && (
                  <span className="absolute top-6 left-6 bg-[#faf8f5]/95 backdrop-blur-sm border border-[#f2eee9] text-[#c5a059] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md z-10">
                    {product.badge}
                  </span>
                )}
                <ProductVisual
                  imageGradient={product.image}
                  name={product.name}
                  category={product.category}
                  sku={product.sku}
                  size="lg"
                />
              </div>
              
              {/* Trust markers */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <div className="rounded-xl bg-[#f2eee9] p-3 text-center border border-[#f2eee9]">
                  <ShieldCheck className="h-4 w-4 text-[#c5a059] mx-auto mb-1" />
                  <span className="block text-[10px] font-bold text-[#3d2b1f]">Garantizado</span>
                </div>
                <div className="rounded-xl bg-[#f2eee9] p-3 text-center border border-[#f2eee9]">
                  <Heart className="h-4 w-4 text-[#c5a059] mx-auto mb-1" />
                  <span className="block text-[10px] font-bold text-[#3d2b1f]">Natural</span>
                </div>
                <div className="rounded-xl bg-[#f2eee9] p-3 text-center border border-[#f2eee9]">
                  <Sparkles className="h-4 w-4 text-[#c5a059] mx-auto mb-1" />
                  <span className="block text-[10px] font-bold text-[#3d2b1f]">Premium</span>
                </div>
              </div>
            </div>

            {/* Product Details Area */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A8A29E] block mb-2">
                  {product.category}
                </span>
                <h1 className="text-2xl font-extrabold tracking-tight text-[#3d2b1f] sm:text-3xl">
                  {product.name}
                </h1>
                
                {/* SKU Badge */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="bg-[#f2eee9] text-[#3d2b1f]/70 text-[9px] font-semibold px-2 py-0.5 rounded border border-[#f2eee9]">
                    SKU: {product.sku}
                  </span>
                  <span className="text-xs text-[#2e7d32] font-semibold">
                    ✓ Disponible (Stock: {product.stock})
                  </span>
                </div>
              </div>

              {/* Price section */}
              <div className="bg-[#f2eee9] rounded-2xl p-4 border border-[#f2eee9] flex items-center justify-between gap-4">
                <div>
                  <span className="block text-xs text-[#3d2b1f]/70 font-medium">Precio Exclusivo</span>
                  <span className="text-2xl font-black text-[#c5a059]">
                    RD$ {product.price.toLocaleString()}
                  </span>
                </div>
                {product.priceBefore && (
                  <div className="border-l border-[#f2eee9] pl-4">
                    <span className="block text-[10px] text-[#A8A29E] font-medium line-through">
                      RD$ {product.priceBefore.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-semibold text-[#2e7d32] bg-[#e8f5e9] px-2 py-0.5 rounded-full block mt-0.5">
                      Ahorra RD$ {(product.priceBefore - product.price).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Quantity selector */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-[#3d2b1f]/75">Cantidad:</span>
                <div className="flex items-center border border-[#f2eee9] rounded-full bg-[#f2eee9] px-3 py-1">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-2 text-sm font-bold text-[#3d2b1f]/70 hover:text-[#c5a059]"
                  >
                    -
                  </button>
                  <span className="px-4 text-xs font-extrabold text-[#3d2b1f]">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-2 text-sm font-bold text-[#3d2b1f]/70 hover:text-[#c5a059]"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTAs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 rounded-full border-2 border-[#c5a059] text-[#c5a059] hover:bg-[#f2eee9] py-3.5 font-bold text-xs shadow-sm transition-all"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Agregar al Carrito
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex items-center justify-center gap-2 rounded-full bg-[#c5a059] text-white hover:bg-[#B5914A] py-3.5 font-bold text-xs shadow-md transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Comprar Ahora
                </button>
              </div>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full rounded-full bg-[#25D366] text-white py-3.5 font-bold text-xs shadow-md hover:bg-[#20ba56] transition-all"
              >
                <MessageSquare className="h-4 w-4 fill-current" />
                Consultar por WhatsApp
              </a>

              {/* Description */}
              <div className="space-y-2 border-t border-[#F5F5F4] pt-6">
                <h3 className="text-sm font-bold text-[#3d2b1f] uppercase tracking-wider">Descripción</h3>
                <p className="text-xs text-[#3d2b1f]/75 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Ideal Para Section */}
              {product.idealPara && product.idealPara.length > 0 && (
                <div className="space-y-3 border-t border-[#F5F5F4] pt-6">
                  <h3 className="text-sm font-bold text-[#3d2b1f] uppercase tracking-wider">Ideal Para</h3>
                  <ul className="space-y-2">
                    {product.idealPara.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-[#3d2b1f]/75">
                        <CheckCircle2 className="h-4 w-4 text-[#c5a059] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Qué Aporta Section */}
              {product.queAporta && product.queAporta.length > 0 && (
                <div className="space-y-3 border-t border-[#F5F5F4] pt-6">
                  <h3 className="text-sm font-bold text-[#3d2b1f] uppercase tracking-wider">Qué Aporta / Qué Incluye</h3>
                  <ul className="space-y-2">
                    {product.queAporta.map((item, index) => (
                      <li key={index} className="flex items-start gap-2 text-xs text-[#3d2b1f]/75">
                        <Sparkles className="h-4 w-4 text-[#c5a059] shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Benefits Checklist */}
              <div className="space-y-3 border-t border-[#F5F5F4] pt-6">
                <h3 className="text-sm font-bold text-[#3d2b1f] uppercase tracking-wider">Beneficios Principales</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {product.benefits.map((b, index) => (
                    <li key={index} className="flex items-start gap-2 text-xs text-[#3d2b1f]/75">
                      <CheckCircle2 className="h-4 w-4 text-[#2e7d32] shrink-0 mt-0.5" />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Usage Guide */}
              <div className="space-y-2 border-t border-[#F5F5F4] pt-6">
                <h3 className="text-sm font-bold text-[#3d2b1f] uppercase tracking-wider">Modo de Uso</h3>
                <p className="text-xs text-[#3d2b1f]/75 leading-relaxed bg-[#f2eee9] rounded-xl p-4 border border-[#f2eee9] italic">
                  &quot;{product.usage}&quot;
                </p>
              </div>

              {/* Combínalo Con Section */}
              {product.combinaloCon && product.combinaloCon.length > 0 && (
                <div className="space-y-3 border-t border-[#F5F5F4] pt-6">
                  <h3 className="text-xs font-bold text-[#c5a059] uppercase tracking-widest flex items-center gap-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    Combínalo Con
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.combinaloCon.map((slug) => {
                      const recommended = PRODUCTS.find((p) => p.slug === slug);
                      if (!recommended) return null;
                      return (
                        <Link
                          key={recommended.id}
                          href={`/producto/${recommended.slug}`}
                          className="group/rec flex items-center justify-between p-3.5 rounded-2xl border border-[#f2eee9] hover:border-[#c5a059]/40 hover:shadow-sm transition-all bg-gradient-to-r from-[#FAFAF9] to-white hover:from-white hover:to-white"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="h-14 w-11 bg-[#faf8f5] border border-[#f2eee9]/60 rounded-lg flex items-center justify-center overflow-hidden shrink-0 shadow-sm transition-transform duration-300 group-hover/rec:scale-105">
                              <ProductVisual
                                imageGradient={recommended.image}
                                name={recommended.name}
                                category={recommended.category}
                                sku={recommended.sku}
                                size="sm"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="text-[8px] font-bold uppercase tracking-wider text-[#A8A29E] block truncate">{recommended.category}</span>
                              <span className="text-xs font-bold text-[#3d2b1f] block line-clamp-1 group-hover/rec:text-[#c5a059] transition-colors">{recommended.name}</span>
                              <span className="text-xs font-semibold text-[#c5a059] block">RD$ {recommended.price.toLocaleString()}</span>
                            </div>
                          </div>
                          <div className="text-[10px] font-bold text-[#c5a059] bg-[#f2eee9] group-hover/rec:bg-[#c5a059] group-hover/rec:text-white px-3 py-1.5 rounded-full transition-all flex items-center gap-0.5 shrink-0 ml-2">
                            Ver
                            <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/rec:translate-x-0.5" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Related Products Grid */}
          <div className="mt-16 border-t border-[#f2eee9] pt-12">
            <h2 className="text-xl font-bold text-[#3d2b1f] mb-8">Productos Relacionados</h2>
            {(() => {
              const related = PRODUCTS.filter(
                (p) => p.category === product.category && p.id !== product.id
              ).slice(0, 3);

              if (related.length === 0) {
                return (
                  <p className="text-xs text-[#3d2b1f]/70 italic">No hay productos relacionados disponibles en este momento.</p>
                );
              }

              return (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/producto/${item.slug}`}
                      className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#f2eee9] bg-[#faf8f5] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[#c5a059]/20 min-h-[410px]"
                    >
                      {/* Image */}
                      <div className="h-52 w-full bg-[#f2eee9] flex items-center justify-center relative overflow-hidden border-b border-[#f2eee9]/40">
                        {item.badge && (
                          <span className="absolute top-4 left-4 bg-[#faf8f5]/95 backdrop-blur-sm border border-[#f2eee9] text-[#c5a059] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm z-10">
                            {item.badge}
                          </span>
                        )}
                        <ProductVisual
                          imageGradient={item.image}
                          name={item.name}
                          category={item.category}
                          sku={item.sku}
                          size="md"
                        />
                      </div>
                      {/* Details */}
                      <div className="flex flex-1 flex-col p-5 space-y-2 justify-between">
                        <div className="space-y-2">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-[#A8A29E]">
                            {item.category}
                          </span>
                          <h3 className="text-sm font-bold text-[#3d2b1f] group-hover:text-[#c5a059] transition-colors line-clamp-2 h-10 leading-snug">
                            {item.name}
                          </h3>
                          <p className="text-xs text-[#3d2b1f]/70 line-clamp-2 leading-snug h-9">
                            {item.shortDescription}
                          </p>
                        </div>
                        <div className="pt-4 flex items-center justify-between border-t border-[#F5F5F4] mt-auto">
                          <span className="text-xs font-bold text-[#c5a059]">
                            RD$ {item.price.toLocaleString()}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                addItem(item, 1);
                              }}
                              className="inline-flex h-8 px-3 items-center justify-center rounded-full bg-[#f2eee9] text-[#c5a059] hover:bg-[#c5a059] hover:text-white transition-all text-xs font-bold gap-1 z-10"
                            >
                              <Plus className="h-3 w-3" />
                              Añadir
                            </button>
                            <a
                              href={buildProductWhatsappMessage(item)}
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
              );
            })()}
          </div>

        </div>
      </main>

      <StoreFooter />
    </>
  );
}
