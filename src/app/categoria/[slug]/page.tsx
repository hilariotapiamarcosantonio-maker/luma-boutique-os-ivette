"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, MessageSquare, AlertCircle } from "lucide-react";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { getActiveNiche } from "@/config/niches";
import { PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ProductVisual } from "@/components/store/ProductVisual";
import { categoryToSlug } from "@/lib/slugs";
import { buildGeneralAdvisorMessage } from "@/lib/whatsapp";

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default function StoreCategory({ params }: CategoryPageProps) {
  const niche = getActiveNiche();
  const rawSlug = params.slug;
  const { addItem } = useCart();
  const advisorLink = buildGeneralAdvisorMessage();

  // Find canonical category name matching the slug
  const canonicalCategory = niche.categories.find(
    (cat) => categoryToSlug(cat) === rawSlug
  ) || rawSlug;

  // Filter products by category using slug comparison
  const categoryProducts = PRODUCTS.filter(
    (product) => categoryToSlug(product.category) === rawSlug
  );

  return (
    <>
      <StoreHeader />

      <main className="min-h-screen bg-[#FAFAF9] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb / Back button */}
          <div className="mb-8">
            <Link
              href="/tienda"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#8C6D30] hover:text-[#C7A45A] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Volver a la Tienda
            </Link>
          </div>

          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3 mb-16">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#C7A45A]">Categoría de Cuidado</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#1C1917] capitalize sm:text-4xl">
              {canonicalCategory}
            </h1>
            <p className="text-xs text-[#78716C] max-w-md mx-auto">
              Descubre nuestra selección premium especializada en {canonicalCategory.toLowerCase()} para potenciar tu salud y bienestar orgánico.
            </p>
          </div>

          {/* Product Grid */}
          {categoryProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {categoryProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#E7E5E4] bg-white transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[#C7A45A]/30 min-h-[430px]"
                >
                  {/* Invisible main overlay Link */}
                  <Link
                    href={`/producto/${product.slug}`}
                    className="absolute inset-0 z-0"
                    aria-label={product.name}
                  />

                  {/* Image Container with ProductVisual */}
                  <div className="h-56 w-full bg-[#FAFAF9] flex items-center justify-center relative overflow-hidden border-b border-[#E7E5E4]/40 pointer-events-none">
                    {product.badge && (
                      <span className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm border border-[#E7E5E4] text-[#8C6D30] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm z-10">
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

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-5 space-y-2 justify-between relative z-10 pointer-events-none">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#A8A29E]">
                        {product.category}
                      </span>
                      <h3 className="text-sm font-bold text-[#1C1917] group-hover:text-[#C7A45A] transition-colors line-clamp-2 h-10 leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-xs text-[#78716C] line-clamp-2 leading-snug h-9">
                        {product.shortDescription}
                      </p>
                    </div>

                    {/* Price and Details */}
                    <div className="pt-4 flex items-center justify-between border-t border-[#F5F5F4] mt-auto pointer-events-auto">
                      <div className="pointer-events-none">
                        {product.priceBefore && (
                          <span className="block text-[10px] text-[#A8A29E] line-through">
                            RD$ {product.priceBefore.toLocaleString()}
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#C7A45A]">
                          RD$ {product.price.toLocaleString()}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 relative z-20">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem(product, 1);
                          }}
                          className="inline-flex h-8 px-3 items-center justify-center rounded-full bg-[#F5F2EB] text-[#8C6D30] hover:bg-[#C7A45A] hover:text-white transition-all text-xs font-bold gap-1"
                        >
                          <Plus className="h-3 w-3" />
                          Añadir
                        </button>
                        <span
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FAFAF9] text-[#1C1917] border border-[#E7E5E4] hover:bg-[#C7A45A] hover:text-white hover:border-[#C7A45A] transition-all"
                        >
                          <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-[#E7E5E4] rounded-2xl max-w-xl mx-auto p-8 space-y-6 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#F5F2EB] text-[#C7A45A] shadow-inner">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-bold text-[#1C1917]">No hay productos en esta categoría</h3>
                <p className="text-xs text-[#78716C] max-w-sm mx-auto leading-relaxed">
                  Actualmente no tenemos productos registrados bajo la categoría &quot;{canonicalCategory}&quot;. Vuelve pronto o explora otras secciones del catálogo.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                <Link
                  href="/tienda"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-[#C7A45A] hover:bg-[#B5914A] px-6 py-3 rounded-full transition-all w-full sm:w-auto shadow-sm"
                >
                  Volver a la Tienda
                </Link>
                <a
                  href={advisorLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-[#8C6D30] bg-[#F5F2EB] hover:bg-[#EFECE3] px-6 py-3 rounded-full transition-all w-full sm:w-auto"
                >
                  <MessageSquare className="h-4 w-4" />
                  Asesoría por WhatsApp
                </a>
              </div>
            </div>
          )}

        </div>
      </main>

      <StoreFooter />
    </>
  );
}

