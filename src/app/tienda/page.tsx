"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, X, Sparkles, Plus, MessageSquare } from "lucide-react";
import { buildProductWhatsappMessage } from "@/lib/whatsapp";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { getActiveNiche } from "@/config/niches";
import { PRODUCTS } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ProductVisual } from "@/components/store/ProductVisual";
import { normalizeText } from "@/lib/slugs";

export default function StoreCatalog() {
  const niche = getActiveNiche();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { addItem } = useCart();

  // Filter out categories with no products
  const activeCategories = niche.categories.filter((cat) =>
    PRODUCTS.some((p) => p.category.toLowerCase() === cat.toLowerCase())
  );
  const categories = ["all", ...activeCategories];

  // Helper to normalize query and match terms flexibly (e.g., champu -> shampoo)
  const normalizeForSearch = (text: string) => {
    return normalizeText(text)
      .replace(/champu/g, "shampoo")
      .replace(/shampu/g, "shampoo");
  };

  // Filter products based on search query and category tab selection
  const filteredProducts = PRODUCTS.filter((product) => {
    const query = normalizeForSearch(searchQuery);

    const matchesSearch = !query ||
      normalizeForSearch(product.name).includes(query) ||
      normalizeForSearch(product.category).includes(query) ||
      normalizeForSearch(product.description).includes(query) ||
      normalizeForSearch(product.shortDescription || "").includes(query) ||
      product.benefits.some((b) => normalizeForSearch(b).includes(query)) ||
      normalizeForSearch(product.sku).includes(query);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <StoreHeader />

      <main className="min-h-screen bg-[#f2eee9] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#c5a059]">Catálogo Oficial</span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#3d2b1f] sm:text-4xl">
              Nuestra Tienda de Cosmética Ancestral
            </h1>
            <p className="text-xs text-[#3d2b1f]/70 max-w-lg mx-auto">
              Explora nuestra línea de cuidado botánico y descubre el ritual ideal para tu piel y bienestar.
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="bg-[#faf8f5] border border-[#f2eee9] rounded-2xl p-6 mb-10 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A8A29E]" />
              <input
                type="text"
                placeholder="Buscar productos por nombre, ingrediente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-full border border-[#f2eee9] text-xs bg-[#f2eee9] focus:outline-none focus:border-[#c5a059] focus:ring-1 focus:ring-[#C7A45A] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#A8A29E] hover:text-[#3d2b1f]"
                  aria-label="Limpiar búsqueda"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${
                    selectedCategory === cat
                      ? "bg-[#c5a059] text-white shadow-sm"
                      : "bg-[#f2eee9] text-[#3d2b1f]/75 border border-[#f2eee9] hover:bg-[#f2eee9]"
                  }`}
                >
                  {cat === "all" ? "Todos" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#f2eee9] bg-[#faf8f5] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:border-[#c5a059]/20 min-h-[430px]"
                >
                  {/* Invisible main overlay Link */}
                  <Link
                    href={`/producto/${product.slug}`}
                    className="absolute inset-0 z-0"
                    aria-label={product.name}
                  />

                  {/* Image Container with ProductVisual */}
                  <div className="h-56 w-full bg-[#f2eee9] flex items-center justify-center relative overflow-hidden border-b border-[#f2eee9]/40 pointer-events-none">
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

                  {/* Info */}
                  <div className="flex flex-1 flex-col p-5 space-y-2 justify-between relative z-10 pointer-events-none">
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

                    {/* Price and Details link */}
                    <div className="pt-4 flex items-center justify-between border-t border-[#F5F5F4] mt-auto pointer-events-auto">
                      <div className="pointer-events-none">
                        {product.priceBefore && (
                          <span className="block text-[10px] text-[#A8A29E] line-through">
                            RD$ {product.priceBefore.toLocaleString()}
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#c5a059]">
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
                          className="inline-flex h-8 px-3 items-center justify-center rounded-full bg-[#f2eee9] text-[#c5a059] hover:bg-[#c5a059] hover:text-white transition-all text-xs font-bold gap-1"
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
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-[#faf8f5] border border-[#f2eee9] rounded-2xl max-w-xl mx-auto space-y-4">
              <Sparkles className="h-10 w-10 text-[#c5a059]/50 mx-auto" />
              <h3 className="text-base font-bold text-[#3d2b1f]">No se encontraron productos</h3>
              <p className="text-xs text-[#3d2b1f]/70 max-w-xs mx-auto">
                No pudimos encontrar productos que coincidan con la búsqueda &quot;{searchQuery}&quot;. Intenta con otros términos o cambia el filtro de categoría.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c5a059] bg-[#f2eee9] px-4 py-2 rounded-full hover:bg-[#EFECE3] transition-colors"
              >
                Limpiar Filtros
              </button>
            </div>
          )}

        </div>
      </main>

      <StoreFooter />
    </>
  );
}
