"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { X, Plus, Minus, Trash2, ShoppingBag, MessageSquare, ShieldCheck } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { ProductVisual } from "@/components/store/ProductVisual";
import { buildCartWhatsappMessage, cleanPhoneNumber } from "@/lib/whatsapp";
import { getActiveNiche } from "@/config/niches";
import { getCommerceConfig } from "@/config/commerce";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const {
    cart,
    updateQuantity,
    removeItem,
    subtotal,
    tax,
    delivery,
    total,
    isLoaded,
  } = useCart();
  
  const drawerRef = useRef<HTMLDivElement>(null);
  const config = getCommerceConfig();
  const niche = getActiveNiche();

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const whatsappLink = buildCartWhatsappMessage(
    cart.map((item) => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      sku: item.sku,
    })),
    { subtotal, tax, delivery, total }
  );

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity duration-300"
    >
      {/* Drawer Container */}
      <div
        ref={drawerRef}
        className="flex h-full w-full max-w-md flex-col bg-[#f2eee9] text-[#3d2b1f] shadow-2xl animate-in slide-in-from-right duration-300"
      >
        {/* Header */}
        <div className="flex h-16 items-center justify-between border-b border-[#f2eee9] bg-[#faf8f5] px-6">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#c5a059]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#3d2b1f]">
              Tu Carrito ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-[#3d2b1f]/70 hover:bg-[#f2eee9] hover:text-[#3d2b1f] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {!isLoaded ? (
            <div className="flex h-48 items-center justify-center text-xs text-[#3d2b1f]/70">
              Cargando carrito...
            </div>
          ) : cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-[#f2eee9] p-4 text-[#c5a059]">
                <ShoppingBag className="h-8 w-8" />
              </div>
              <h3 className="text-sm font-bold text-[#3d2b1f]">Tu carrito está vacío</h3>
              <p className="max-w-[240px] text-xs text-[#3d2b1f]/70 leading-normal">
                Agrega productos de nuestra línea botánica premium para iniciar tu ritual de cuidado.
              </p>
              <button
                onClick={onClose}
                className="rounded-full bg-[#C7A45A] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#B5914A] transition-colors"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-4 rounded-2xl border border-[#f2eee9] bg-[#faf8f5] p-4 shadow-sm"
                >
                  {/* Miniature 3D Product Mockup */}
                  <div className="w-16 h-20 shrink-0 flex items-center justify-center bg-[#f2eee9] rounded-xl border border-[#f2eee9]/40">
                    <ProductVisual
                      imageGradient={item.image}
                      name={item.name}
                      category={item.category}
                      sku={item.sku}
                      size="sm"
                    />
                  </div>

                  {/* Info & Adjustments */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-[#3d2b1f] line-clamp-1">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-[#3d2b1f]/50 hover:text-red-500 transition-colors"
                          title="Eliminar del carrito"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-[9px] font-semibold text-[#3d2b1f]/50 uppercase tracking-wider block mt-0.5">
                        {item.category} • SKU: {item.sku}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#F5F5F4]">
                      {/* Price */}
                      <span className="text-xs font-bold text-[#c5a059]">
                        RD$ {item.price.toLocaleString()}
                      </span>

                      {/* Quantity Selector */}
                      <div className="flex items-center border border-[#f2eee9] rounded-full bg-[#f2eee9] px-1.5 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-1 text-xs font-bold text-[#3d2b1f]/70 hover:text-[#c5a059]"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#3d2b1f]">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-1 text-xs font-bold text-[#3d2b1f]/70 hover:text-[#c5a059]"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (Pricing summary & CTAs) */}
        {cart.length > 0 && (
          <div className="border-t border-[#f2eee9] bg-[#faf8f5] p-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-[#3d2b1f]/70">
                <span>Subtotal</span>
                <span>RD$ {subtotal.toLocaleString()}</span>
              </div>
              {config.showTaxBreakdown && (
                <div className="flex justify-between text-xs text-[#3d2b1f]/70">
                  <span>Impuesto estimado ({Math.round(config.taxRate * 100)}%):</span>
                  <span>RD$ {tax.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-xs text-[#3d2b1f]/70">
                <span>Envío</span>
                <span>
                  {delivery === 0 ? (
                    <span className="text-[#2e7d32] font-semibold">Gratis</span>
                  ) : (
                    `RD$ ${delivery.toLocaleString()}`
                  )}
                </span>
              </div>
              {delivery > 0 && (
                <div className="text-[10px] text-[#3d2b1f]/50 text-right">
                  Envío gratis a partir de RD$ {config.freeDeliveryThreshold.toLocaleString()}
                </div>
              )}
              <div className="flex justify-between text-sm font-extrabold text-[#3d2b1f] pt-2 border-t border-[#f2eee9]">
                <span>Total Estimado</span>
                <span className="text-[#c5a059]">RD$ {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link
                href="/checkout"
                onClick={onClose}
                className="flex items-center justify-center gap-2 rounded-full bg-[#c5a059] hover:bg-[#b38f48] text-white py-3 font-bold text-xs shadow-md transition-colors"
              >
                <ShoppingBag className="h-4 w-4" />
                Finalizar Pedido en Línea
              </Link>
              
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full bg-[#25D366] hover:bg-[#20ba56] text-white py-3 font-bold text-xs shadow-md transition-colors"
              >
                <MessageSquare className="h-4 w-4 fill-current" />
                Comprar por WhatsApp
              </a>

              <a
                href={`https://wa.me/${cleanPhoneNumber(niche.whatsappNumber)}?text=${encodeURIComponent(
                  `Hola Ivette, me interesa el ritual con los siguientes productos: ${cart.map((item) => `${item.name} (x${item.quantity})`).join(", ")}. Quiero confirmar disponibilidad, forma de entrega y opción de pago.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-[#c5a059] hover:bg-[#f2eee9] text-[#3d2b1f] py-2.5 font-bold text-xs transition-colors"
              >
                <MessageSquare className="h-4 w-4 text-[#c5a059]" />
                Consultar mi ritual por WhatsApp
              </a>
            </div>

            <div className="flex justify-center items-center gap-1.5 text-[10px] text-[#3d2b1f]/70 bg-[#f2eee9] p-2.5 rounded-xl border border-[#f2eee9]/50">
              <ShieldCheck className="h-3.5 w-3.5 text-[#2e7d32]" />
              <span>Coordinación de pago contra entrega segura</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
