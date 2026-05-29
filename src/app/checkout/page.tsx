"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ShieldCheck, Sparkles, AlertCircle, Store, Truck } from "lucide-react";
import { StoreHeader } from "@/components/layout/StoreHeader";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { getActiveNiche } from "@/config/niches";
import { getProductBySlug } from "@/data/products";
import { getSavedUTMs } from "@/components/layout/UTMTracker";
import { useCart } from "@/context/CartContext";
import { getCommerceConfig } from "@/config/commerce";
import { ProductVisual } from "@/components/store/ProductVisual";
import { paymentConfig } from "@/config/payments";

function CheckoutFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const niche = getActiveNiche();
  const config = getCommerceConfig();
  
  const {
    cart,
    addItem,
    clearCart,
    subtotal: contextSubtotal,
    tax: contextTax,
    isLoaded,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form states
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    whatsapp: "",
    email: "",
    provincia: "",
    municipio: "",
    direccion: "",
    referencia: "",
    notas: "",
    googleMapsUrl: "",
    deliveryMethod: "delivery_coordinado", // default
    metodoPago: "Transferencia", // default
    origenLead: "tienda", // default
    modalidadPago: "Pago Completo", // default
    observacionesPlan: "",
  });

  // Handle ?producto=slug "Comprar ahora" parameter
  useEffect(() => {
    const prodParam = searchParams.get("producto") || "";
    if (prodParam && isLoaded) {
      const prod = getProductBySlug(prodParam);
      if (prod) {
        // If not already in cart, add it
        const exists = cart.some((item) => item.slug === prodParam);
        if (!exists) {
          addItem(prod, 1);
        }
      }
    }
  }, [searchParams, isLoaded, cart, addItem]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Re-calculate shipping based on selected delivery method and subtotal
  const shippingCost = formData.deliveryMethod === "retiro" 
    ? 0 
    : (contextSubtotal >= config.freeDeliveryThreshold ? 0 : config.deliveryBase);

  const totalCost = contextSubtotal + contextTax + shippingCost;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.nombre || !formData.whatsapp || !formData.provincia || !formData.municipio || !formData.direccion || !formData.referencia) {
      setError("Por favor, completa todos los campos obligatorios marcados con (*).");
      setLoading(false);
      return;
    }

    if (cart.length === 0) {
      setError("Tu carrito está vacío. Agrega productos antes de finalizar tu pedido.");
      setLoading(false);
      return;
    }

    try {
      const utms = getSavedUTMs();

      // Serialized items
      const itemsJson = JSON.stringify(
        cart.map((item) => ({
          productId: item.productId,
          slug: item.slug,
          name: item.name,
          category: item.category,
          price: item.price,
          quantity: item.quantity,
          sku: item.sku,
        }))
      );

      // Short summary string for WhatsApp/Sheets
      const itemsSummary = cart.map((item) => `${item.name} x${item.quantity}`).join(", ");

      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        whatsapp: formData.whatsapp.trim(),
        email: formData.email.trim(),
        provincia: formData.provincia.trim(),
        municipio: formData.municipio.trim(),
        direccion: formData.direccion.trim(),
        referencia: formData.referencia.trim(),
        notas: formData.notas.trim(),
        deliveryMethod: formData.deliveryMethod,
        googleMapsUrl: formData.googleMapsUrl.trim(),
        itemsJson,
        itemsSummary,
        subtotal: contextSubtotal,
        tax: contextTax,
        delivery: shippingCost,
        total: totalCost,
        canal: "tienda_online",
        fuente: "tienda_botanica",
        origen: niche.crmConfig.origen,
        metodoPago: formData.metodoPago,
        origenLead: formData.origenLead,
        modalidadPago: formData.modalidadPago,
        montoTotal: totalCost,
        cuota1: formData.modalidadPago === "Plan Quincenal Clienta Fiel" ? totalCost / 2 : 0,
        cuota2: formData.modalidadPago === "Plan Quincenal Clienta Fiel" ? totalCost / 2 : 0,
        fechaCuota1: formData.modalidadPago === "Plan Quincenal Clienta Fiel" ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : "",
        fechaCuota2: formData.modalidadPago === "Plan Quincenal Clienta Fiel" ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : "",
        observaciones: formData.observacionesPlan || formData.notas.trim(),
        clienteFiel: formData.modalidadPago === "Plan Quincenal Clienta Fiel" ? "true" : "false",
        estadoPlan: formData.modalidadPago === "Plan Quincenal Clienta Fiel" ? "Pendiente inicio" : "",
        ...utms,
      };

      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Error al enviar el pedido.");
      }

      // Success: Clear Cart
      clearCart();

      // PayPal integration: If payment link is configured, open in new tab
      if (formData.metodoPago === "PayPal" && paymentConfig.PAYPAL_PAYMENT_LINK) {
        try {
          window.open(paymentConfig.PAYPAL_PAYMENT_LINK, "_blank");
        } catch (e) {
          console.error("Could not open PayPal link:", e);
        }
      }

      // Redirect to thank you page with context parameters
      router.push(
        `/gracias?leadsId=${result.lead?.id || Date.now()}&total=${totalCost}&summary=${encodeURIComponent(itemsSummary)}&deliveryMethod=${formData.deliveryMethod}&metodoPago=${encodeURIComponent(formData.metodoPago)}&modalidadPago=${encodeURIComponent(formData.modalidadPago)}`
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Hubo un problema al procesar tu pedido. Intenta nuevamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const PROVINCIAS_DOMINICANAS = [
    "Santo Domingo", "Distrito Nacional", "Santiago", "San Cristóbal", "La Vega", 
    "Puerto Plata", "San Pedro de Macorís", "Duarte", "La Altagracia", "La Romana",
    "San Juan", "Espaillat", "Azua", "Barahona", "Monte Plata", "Peravia", 
    "Monseñor Nouel", "Valverde", "Sánchez Ramírez", "María Trinidad Sánchez", 
    "Hato Mayor", "Hermanas Mirabal", "Bahoruco", "Samana", "El Seibo", "Dajabón",
    "Santiago Rodríguez", "San José de Ocoa", "Elias Piña", "Independencia", 
    "Monte Cristi", "Pedernales"
  ].sort();

  if (!isLoaded) {
    return <div className="text-center py-12 text-xs text-[#3d2b1f]/70">Cargando carrito de compras...</div>;
  }

  // Cart Empty State
  if (cart.length === 0) {
    return (
      <div className="max-w-xl mx-auto bg-[#faf8f5] border border-[#f2eee9] rounded-3xl p-12 shadow-sm text-center space-y-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f2eee9] text-[#c5a059] shadow-sm">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-[#3d2b1f]">Tu carrito está vacío</h2>
          <p className="text-xs text-[#3d2b1f]/70 max-w-sm mx-auto">
            Actualmente no tienes productos agregados a tu carrito de compras. Por favor, explora nuestra tienda virtual para añadir productos a tu rutina.
          </p>
        </div>
        <div className="pt-2">
          <Link
            href="/tienda"
            className="inline-flex items-center gap-2 rounded-full bg-[#c5a059] hover:bg-[#B5914A] text-white px-8 py-3 font-bold text-xs shadow-md transition-colors"
          >
            Explorar Tienda
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-start animate-in fade-in duration-300">
      
      {/* Checkout Form */}
      <div className="lg:col-span-7 bg-[#faf8f5] border border-[#f2eee9] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-[#3d2b1f]">Información del Cliente</h2>
          <p className="text-xs text-[#3d2b1f]/70">Por favor, completa tus datos para coordinar el pago y la entrega.</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 p-4 text-xs text-[#7A2828]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="nombre" className="block text-xs font-semibold text-[#3d2b1f]/75 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ingresa tu nombre"
                className="w-full px-4 py-2.5 rounded-xl border border-[#f2eee9] text-xs bg-[#f2eee9] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label htmlFor="apellido" className="block text-xs font-semibold text-[#3d2b1f]/75 mb-1">
                Apellido
              </label>
              <input
                type="text"
                id="apellido"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                placeholder="Ingresa tu apellido"
                className="w-full px-4 py-2.5 rounded-xl border border-[#f2eee9] text-xs bg-[#f2eee9] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="whatsapp" className="block text-xs font-semibold text-[#3d2b1f]/75 mb-1">
                WhatsApp / Teléfono *
              </label>
              <input
                type="tel"
                id="whatsapp"
                name="whatsapp"
                required
                value={formData.whatsapp}
                onChange={handleInputChange}
                placeholder="Ej: 809-555-5555"
                className="w-full px-4 py-2.5 rounded-xl border border-[#f2eee9] text-xs bg-[#f2eee9] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-[#3d2b1f]/75 mb-1">
                Correo Electrónico (Opcional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-2.5 rounded-xl border border-[#f2eee9] text-xs bg-[#f2eee9] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="provincia" className="block text-xs font-semibold text-[#3d2b1f]/75 mb-1">
                Provincia *
              </label>
              <select
                id="provincia"
                name="provincia"
                required
                value={formData.provincia}
                onChange={handleInputChange}
                className="w-full px-4 py-2.5 rounded-xl border border-[#f2eee9] text-xs bg-[#f2eee9] focus:outline-none focus:border-[#c5a059]"
              >
                <option value="">Selecciona tu provincia</option>
                {PROVINCIAS_DOMINICANAS.map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="municipio" className="block text-xs font-semibold text-[#3d2b1f]/75 mb-1">
                Municipio / Sector *
              </label>
              <input
                type="text"
                id="municipio"
                name="municipio"
                required
                value={formData.municipio}
                onChange={handleInputChange}
                placeholder="Ej: Santo Domingo Este / Alma Rosa I"
                className="w-full px-4 py-2.5 rounded-xl border border-[#f2eee9] text-xs bg-[#f2eee9] focus:outline-none focus:border-[#c5a059]"
              />
            </div>
          </div>

          <div>
            <label htmlFor="direccion" className="block text-xs font-semibold text-[#3d2b1f]/75 mb-1">
              Dirección de Entrega *
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              required
              value={formData.direccion}
              onChange={handleInputChange}
              placeholder="Calle, número de casa, edificio, apartamento..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#f2eee9] text-xs bg-[#f2eee9] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div>
            <label htmlFor="referencia" className="block text-xs font-semibold text-[#3d2b1f]/75 mb-1">
              Punto de Referencia *
            </label>
            <input
              type="text"
              id="referencia"
              name="referencia"
              required
              value={formData.referencia}
              onChange={handleInputChange}
              placeholder="Ej: Frente al colmado principal, detrás de la farmacia..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#f2eee9] text-xs bg-[#f2eee9] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          <div>
            <label htmlFor="googleMapsUrl" className="block text-xs font-semibold text-[#3d2b1f]/75 mb-1">
              Ubicación de Google Maps (Opcional)
            </label>
            <input
              type="url"
              id="googleMapsUrl"
              name="googleMapsUrl"
              value={formData.googleMapsUrl}
              onChange={handleInputChange}
              placeholder="Pega aquí el enlace de ubicación si deseas facilitar la entrega."
              className="w-full px-4 py-2.5 rounded-xl border border-[#f2eee9] text-xs bg-[#f2eee9] focus:outline-none focus:border-[#c5a059]"
            />
          </div>

          {/* Delivery Method Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#3d2b1f]/75">
              Método de Entrega *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Entrega Coordinada */}
              <label className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                formData.deliveryMethod === "delivery_coordinado"
                  ? "border-[#c5a059] bg-[#f2eee9]/30 text-[#c5a059]"
                  : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#f2eee9]"
              }`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="delivery_coordinado"
                  checked={formData.deliveryMethod === "delivery_coordinado"}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <Truck className="h-5 w-5 mb-1.5" />
                <span className="text-xs font-bold block">Entrega Coordinada</span>
                <span className="text-[10px] text-[#3d2b1f]/70 mt-0.5">Envío a domicilio coordinado</span>
              </label>

              {/* Option 2: Retiro Coordinado */}
              <label className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                formData.deliveryMethod === "retiro"
                  ? "border-[#c5a059] bg-[#f2eee9]/30 text-[#c5a059]"
                  : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#f2eee9]"
              }`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="retiro"
                  checked={formData.deliveryMethod === "retiro"}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <Store className="h-5 w-5 mb-1.5" />
                <span className="text-xs font-bold block">Retiro Coordinado</span>
                <span className="text-[10px] text-[#3d2b1f]/70 mt-0.5">Punto de encuentro a convenir</span>
              </label>
            </div>
          </div>

          {/* Método de Pago Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1e2d1a]">
              Método de Pago *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Transferencia */}
              <label className={`flex flex-col items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                formData.metodoPago === "Transferencia"
                  ? "border-[#c5a059] bg-[#f2eee9]/40 text-[#1e2d1a] font-bold"
                  : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#f2eee9]/30 text-[#2a3b26]"
              }`}>
                <input
                  type="radio"
                  name="metodoPago"
                  value="Transferencia"
                  checked={formData.metodoPago === "Transferencia"}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="text-xs font-bold block">Transferencia Bancaria</span>
                <span className="text-[10px] text-[#2a3b26]/70 mt-0.5">Bancaria / Pago móvil (RD$)</span>
              </label>

              {/* Option 2: Domicilio contra entrega */}
              <label className={`flex flex-col items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                formData.metodoPago === "Domicilio contra entrega"
                  ? "border-[#c5a059] bg-[#f2eee9]/40 text-[#1e2d1a] font-bold"
                  : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#f2eee9]/30 text-[#2a3b26]"
              }`}>
                <input
                  type="radio"
                  name="metodoPago"
                  value="Domicilio contra entrega"
                  checked={formData.metodoPago === "Domicilio contra entrega"}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="text-xs font-bold block">Contra Entrega</span>
                <span className="text-[10px] text-[#2a3b26]/70 mt-0.5">Paga al recibir en tu domicilio</span>
              </label>

              {/* Option 3: Efectivo coordinado */}
              <label className={`flex flex-col items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                formData.metodoPago === "Efectivo coordinado"
                  ? "border-[#c5a059] bg-[#f2eee9]/40 text-[#1e2d1a] font-bold"
                  : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#f2eee9]/30 text-[#2a3b26]"
              }`}>
                <input
                  type="radio"
                  name="metodoPago"
                  value="Efectivo coordinado"
                  checked={formData.metodoPago === "Efectivo coordinado"}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="text-xs font-bold block">Efectivo Coordinado</span>
                <span className="text-[10px] text-[#2a3b26]/70 mt-0.5">Efectivo en punto de encuentro</span>
              </label>

              {/* Option 4: PayPal */}
              {paymentConfig.ENABLE_PAYPAL && paymentConfig.PAYPAL_PAYMENT_LINK ? (
                <label className={`flex flex-col items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.metodoPago === "PayPal"
                    ? "border-[#c5a059] bg-[#f2eee9]/40 text-[#1e2d1a] font-bold"
                    : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#f2eee9]/30 text-[#2a3b26]"
                }`}>
                  <input
                    type="radio"
                    name="metodoPago"
                    value="PayPal"
                    checked={formData.metodoPago === "PayPal"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold block">PayPal</span>
                  <span className="text-[10px] text-[#2a3b26]/70 mt-0.5">Pagar con enlace de PayPal externo</span>
                </label>
              ) : (
                <div className="flex flex-col items-start p-4 rounded-2xl border border-[#f2eee9] bg-[#faf8f5]/40 text-[#2a3b26]/50 cursor-not-allowed">
                  <div className="flex justify-between w-full items-center">
                    <span className="text-xs font-bold block text-[#2a3b26]/60">PayPal</span>
                    <span className="text-[8px] bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 rounded px-1 font-bold">Próximamente</span>
                  </div>
                  <span className="text-[10px] text-[#2a3b26]/40 mt-0.5">Pagos online internacionales</span>
                </div>
              )}

              {/* Option 5: Tarjeta de Crédito Online */}
              {paymentConfig.ENABLE_CARD_GATEWAY ? (
                <label className={`flex flex-col items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.metodoPago === "Tarjeta de Crédito"
                    ? "border-[#c5a059] bg-[#f2eee9]/40 text-[#1e2d1a] font-bold"
                    : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#f2eee9]/30 text-[#2a3b26]"
                }`}>
                  <input
                    type="radio"
                    name="metodoPago"
                    value="Tarjeta de Crédito"
                    checked={formData.metodoPago === "Tarjeta de Crédito"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold block">Tarjeta de Crédito</span>
                  <span className="text-[10px] text-[#2a3b26]/70 mt-0.5">Pagar online con tarjeta local</span>
                </label>
              ) : (
                <div className="flex flex-col items-start p-4 rounded-2xl border border-[#f2eee9] bg-[#faf8f5]/40 text-[#2a3b26]/50 cursor-not-allowed">
                  <div className="flex justify-between w-full items-center">
                    <span className="text-xs font-bold block text-[#2a3b26]/60">Tarjeta Online</span>
                    <span className="text-[8px] bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 rounded px-1 font-bold">Próximamente</span>
                  </div>
                  <span className="text-[10px] text-[#2a3b26]/40 mt-0.5">Pagos con CardNET/Azul</span>
                </div>
              )}

              {/* Option 6: Apple Pay */}
              {paymentConfig.ENABLE_APPLE_PAY ? (
                <label className={`flex flex-col items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.metodoPago === "Apple Pay"
                    ? "border-[#c5a059] bg-[#f2eee9]/40 text-[#1e2d1a] font-bold"
                    : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#f2eee9]/30 text-[#2a3b26]"
                }`}>
                  <input
                    type="radio"
                    name="metodoPago"
                    value="Apple Pay"
                    checked={formData.metodoPago === "Apple Pay"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold block">Apple Pay</span>
                  <span className="text-[10px] text-[#2a3b26]/70 mt-0.5">Pago express desde Safari/iOS</span>
                </label>
              ) : (
                <div className="flex flex-col items-start p-4 rounded-2xl border border-[#f2eee9] bg-[#faf8f5]/40 text-[#2a3b26]/50 cursor-not-allowed">
                  <div className="flex justify-between w-full items-center">
                    <span className="text-xs font-bold block text-[#2a3b26]/60">Apple Pay</span>
                    <span className="text-[8px] bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 rounded px-1 font-bold">Próximamente</span>
                  </div>
                  <span className="text-[10px] text-[#2a3b26]/40 mt-0.5">Pago rápido en dispositivos Apple</span>
                </div>
              )}

              {/* Option 7: Google Pay */}
              {paymentConfig.ENABLE_GOOGLE_PAY ? (
                <label className={`flex flex-col items-start p-4 rounded-2xl border cursor-pointer transition-all ${
                  formData.metodoPago === "Google Pay"
                    ? "border-[#c5a059] bg-[#f2eee9]/40 text-[#1e2d1a] font-bold"
                    : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#f2eee9]/30 text-[#2a3b26]"
                }`}>
                  <input
                    type="radio"
                    name="metodoPago"
                    value="Google Pay"
                    checked={formData.metodoPago === "Google Pay"}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <span className="text-xs font-bold block">Google Pay</span>
                  <span className="text-[10px] text-[#2a3b26]/70 mt-0.5">Pago express desde Chrome/Android</span>
                </label>
              ) : (
                <div className="flex flex-col items-start p-4 rounded-2xl border border-[#f2eee9] bg-[#faf8f5]/40 text-[#2a3b26]/50 cursor-not-allowed">
                  <div className="flex justify-between w-full items-center">
                    <span className="text-xs font-bold block text-[#2a3b26]/60">Google Pay</span>
                    <span className="text-[8px] bg-[#c5a059]/15 text-[#c5a059] border border-[#c5a059]/30 rounded px-1 font-bold">Próximamente</span>
                  </div>
                  <span className="text-[10px] text-[#2a3b26]/40 mt-0.5">Pago rápido en dispositivos Android</span>
                </div>
              )}
            </div>
          </div>

          {/* Modalidad de Pago Selection (Pago Completo vs Plan Quincenal Clienta Fiel) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[#1e2d1a]">
              Modalidad de Pago *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Pago completo */}
              <label className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                formData.modalidadPago === "Pago Completo"
                  ? "border-[#c5a059] bg-[#f2eee9]/40 text-[#1e2d1a] font-bold"
                  : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#faf8f5] text-[#2a3b26]"
              }`}>
                <input
                  type="radio"
                  name="modalidadPago"
                  value="Pago Completo"
                  checked={formData.modalidadPago === "Pago Completo"}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="text-xs font-bold block">Pago Completo</span>
                <span className="text-[10px] text-[#2a3b26]/70 mt-0.5">Liquidación total del pedido</span>
              </label>

              {/* Option 2: Plan Quincenal Clienta Fiel */}
              <label className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center cursor-pointer transition-all ${
                formData.modalidadPago === "Plan Quincenal Clienta Fiel"
                  ? "border-[#c5a059] bg-[#f2eee9]/40 text-[#1e2d1a] font-bold"
                  : "border-[#f2eee9] bg-[#faf8f5] hover:bg-[#faf8f5] text-[#2a3b26]"
              }`}>
                <input
                  type="radio"
                  name="modalidadPago"
                  value="Plan Quincenal Clienta Fiel"
                  checked={formData.modalidadPago === "Plan Quincenal Clienta Fiel"}
                  onChange={handleInputChange}
                  className="sr-only"
                />
                <span className="text-xs font-bold block">Plan Quincenal Clienta Fiel</span>
                <span className="text-[10px] text-[#2a3b26]/70 mt-0.5">2 cuotas (días 15 y 30) - Beneficio especial</span>
              </label>
            </div>
          </div>

          {/* Conditional Plan Details Display */}
          {formData.modalidadPago === "Plan Quincenal Clienta Fiel" && (
            <div className="p-4 rounded-2xl border border-[#c5a059]/20 bg-[#faf8f5] space-y-3">
              <div className="text-xs text-[#3d2b1f]/90 leading-relaxed border-b border-[#f2eee9] pb-2">
                <span className="font-bold text-[#c5a059] block mb-1">🌿 Plan Quincenal Clienta Fiel</span>
                <p>
                  Disponible solo para clientas fieles aprobadas. Pago máximo en 30 días: cuota 1 a los 15 días y cuota 2 a los 30 días.
                </p>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#c5a059] block">
                Detalles del Plan Quincenal
              </span>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#f2eee9]">
                  <span className="text-[10px] text-[#2a3b26]/70 block">Primera Cuota (Día 15)</span>
                  <span className="font-bold text-[#1e2d1a]">RD$ {(totalCost / 2).toLocaleString()}</span>
                  <span className="block text-[9px] text-[#2a3b26]/50 mt-0.5">Fecha: {new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
                <div className="bg-[#faf8f5] p-3 rounded-xl border border-[#f2eee9]">
                  <span className="text-[10px] text-[#2a3b26]/70 block">Segunda Cuota (Día 30)</span>
                  <span className="font-bold text-[#1e2d1a]">RD$ {(totalCost / 2).toLocaleString()}</span>
                  <span className="block text-[9px] text-[#2a3b26]/50 mt-0.5">Fecha: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label htmlFor="observacionesPlan" className="block text-[10px] font-semibold text-[#2a3b26]">
                  Observaciones específicas para tu plan (Opcional)
                </label>
                <input
                  type="text"
                  id="observacionesPlan"
                  name="observacionesPlan"
                  value={formData.observacionesPlan}
                  onChange={handleInputChange}
                  placeholder="Ej: Cobrar después de las 3:00 PM..."
                  className="w-full px-3 py-2 rounded-xl border border-[#f2eee9] text-xs bg-[#faf8f5] focus:outline-none focus:border-[#c5a059]"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="notas" className="block text-xs font-semibold text-[#2a3b26] mb-1">
              Indicaciones adicionales (Opcional)
            </label>
            <textarea
              id="notas"
              name="notas"
              rows={3}
              value={formData.notas}
              onChange={handleInputChange}
              placeholder="Horarios de entrega preferidos, instrucciones adicionales..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#f2eee9] text-xs bg-[#faf8f5] focus:outline-none focus:border-[#c5a059] resize-none"
            />
          </div>

          {/* WhatsApp confirmation note */}
          <div className="p-4 rounded-2xl border border-[#c5a059]/20 bg-[#faf8f5] text-[#3d2b1f] text-xs space-y-1">
            <span className="font-bold text-[#c5a059] block">📌 Nota de Confirmación</span>
            <p className="leading-relaxed">
              Por ahora, tu pedido se confirma por WhatsApp. Ivette te indicará disponibilidad, método de entrega y forma de pago.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#c5a059] to-[#3d2b1f] hover:from-[#3d2b1f] hover:to-[#1e2d1a] disabled:from-[#f2eee9] disabled:to-[#f2eee9] disabled:text-[#faf8f5] text-white py-5 rounded-full font-extrabold text-xs uppercase tracking-widest shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Procesando..." : "Finalizar Pedido"}
          </button>
        </form>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-5 bg-[#f2eee9] border border-[#f2eee9] rounded-3xl p-6 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-[#3d2b1f] uppercase tracking-wider flex items-center gap-2">
          <ShoppingBag className="h-4 w-4 text-[#c5a059]" />
          Resumen del Pedido
        </h2>

        <div className="space-y-4">
          {/* Cart Items List */}
          <div className="divide-y divide-[#E7E5E4] max-h-72 overflow-y-auto pr-1">
            {cart.map((item) => (
              <div key={item.productId} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                {/* Visual */}
                <div className="h-16 w-14 rounded-xl bg-[#faf8f5] flex items-center justify-center shrink-0 border border-[#f2eee9] shadow-sm overflow-hidden">
                  <ProductVisual
                    imageGradient={item.image}
                    name={item.name}
                    category={item.category}
                    sku={item.sku}
                    size="sm"
                  />
                </div>
                {/* Info */}
                <div className="flex flex-1 flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-[#3d2b1f] line-clamp-1">
                      {item.name}
                    </h3>
                    <span className="text-[9px] font-semibold text-[#3d2b1f]/50 uppercase tracking-wider block mt-0.5">
                      SKU: {item.sku} • Cant: {item.quantity}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#c5a059]">
                    RD$ {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="space-y-2 pt-4 border-t border-[#f2eee9]">
            <div className="flex justify-between text-xs text-[#3d2b1f]/75">
              <span>Subtotal</span>
              <span>RD$ {contextSubtotal.toLocaleString()}</span>
            </div>
            
            {config.showTaxBreakdown && (
              <div className="flex justify-between text-xs text-[#3d2b1f]/75">
                <span>Impuesto estimado ({Math.round(config.taxRate * 100)}%):</span>
                <span>RD$ {contextTax.toLocaleString()}</span>
              </div>
            )}
            
            <div className="flex justify-between text-xs text-[#3d2b1f]/75">
              <span>Envío ({formData.deliveryMethod === "retiro" ? "Retiro" : "Domicilio"}):</span>
              <span>
                {shippingCost === 0 ? (
                  <span className="text-[#2e7d32] font-semibold">Gratis</span>
                ) : (
                  `RD$ ${shippingCost.toLocaleString()}`
                )}
              </span>
            </div>
            
            {formData.deliveryMethod !== "retiro" && shippingCost > 0 && (
              <div className="text-[10px] text-[#3d2b1f]/50 text-right">
                Envío gratis a partir de RD$ {config.freeDeliveryThreshold.toLocaleString()}
              </div>
            )}

            <div className="flex justify-between text-sm font-extrabold text-[#3d2b1f] pt-2 border-t border-[#f2eee9]">
              <span>Total Estimado</span>
              <span className="text-[#c5a059] text-base">RD$ {totalCost.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="text-center bg-[#f2eee9]/40 p-2.5 rounded-xl border border-[#c5a059]/20">
            <p className="text-[10px] text-[#c5a059] leading-relaxed font-medium">
              * Total Estimado. Nos pondremos en contacto por WhatsApp para confirmar la disponibilidad y coordinar la entrega y el pago.
            </p>
          </div>
          
          {/* Trust Assurances */}
          <div className="bg-[#faf8f5] rounded-2xl p-4 border border-[#f2eee9] space-y-3 shadow-inner">
            <div className="flex items-start gap-2.5 text-xs text-[#3d2b1f]/75">
              <ShieldCheck className="h-4 w-4 text-[#2e7d32] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#3d2b1f] block">Compra 100% Protegida</span>
                <span className="text-[10px] text-[#3d2b1f]/70 leading-normal">Coordinamos el pago contra entrega en efectivo o transferencia bancaria una vez coordinado el envío.</span>
              </div>
            </div>
            <div className="flex items-start gap-2.5 text-xs text-[#3d2b1f]/75">
              <Sparkles className="h-4 w-4 text-[#c5a059] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#3d2b1f] block">Atención Personalizada</span>
                <span className="text-[10px] text-[#3d2b1f]/70 leading-normal">Te contactaremos directamente para confirmar tu dirección y los detalles de tu pedido.</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function StoreCheckout() {
  return (
    <>
      <StoreHeader />

      <main className="min-h-screen bg-[#f2eee9] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          
          {/* Back Link */}
          <div className="mb-8">
            <Link
              href="/tienda"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c5a059] hover:text-[#c5a059] transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Seguir Comprando
            </Link>
          </div>

          <div className="text-center max-w-3xl mx-auto space-y-2 mb-12">
            <h1 className="text-3xl font-extrabold tracking-tight text-[#3d2b1f]">
              Finalizar Pedido
            </h1>
            <p className="text-xs text-[#3d2b1f]/70">
              Estás a solo un paso de recibir la cosmética ancestral y los rituales orgánicos premium que tu cuerpo merece.
            </p>
          </div>

          <Suspense fallback={<div className="text-center py-12 text-xs text-[#3d2b1f]/70">Cargando formulario...</div>}>
            <CheckoutFormContent />
          </Suspense>

        </div>
      </main>

      <StoreFooter />
    </>
  );
}
