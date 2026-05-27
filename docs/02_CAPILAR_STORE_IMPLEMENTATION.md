# Implementación de la Tienda Virtual (Luma Capilar Store)

Este documento describe la arquitectura, componentes y lógica de negocio de la tienda virtual de Luma Capilar OS integrada dentro del mismo núcleo administrativo de crm-admin.

---

## 1. Arquitectura de la Tienda

La tienda está diseñada sobre Next.js (App Router) en TypeScript y Tailwind CSS, y comparte el mismo servidor Next.js que la plataforma administrativa/CRM. Esto permite un flujo continuo de prospectos (leads) directamente a la base de datos local CSV sin requerir servicios de backend externos.

### Estructura de Rutas Públicas
- `/` - Landing page comercial premium (Home). Muestra héroe del nicho, pilares de cuidado capilar, guía de compra de 3 pasos, catálogo destacado, testimonios y garantías.
- `/tienda` - Catálogo completo de productos con filtros de búsqueda y navegación premium hacia detalles.
- `/categoria/[slug]` - Filtrado dinámico de productos por su categoría con normalización de diacríticos y slugs.
- `/producto/[slug]` - Ficha técnica e interactiva de cada producto con secciones detalladas de uso, público ideal, componentes y productos relacionados.
- `/checkout` - Formulario de registro de datos del cliente, método de entrega, y enlace opcional de ubicación de Google Maps.
- `/gracias` - Confirmación del pedido con resumen desglosado en viñetas y botón para contacto prioritario por WhatsApp.

---

## 2. Componentes Clave de Negocio

### A. Contexto del Carrito (`src/context/CartContext.tsx`)
Maneja el estado reactivo del carrito de compras (`CartItem[]`), calculando de manera dinámica:
- Subtotal
- Impuesto (ITBIS de 18% fijo o configurable por variables de entorno)
- Unidades totales
- Carga inicial asíncrona desde `localStorage` evitando errores de hidratación (*hydration mismatch*) de React/Next.js.

### B. Normalizador de Slugs (`src/lib/slugs.ts`)
Resuelve las colisiones de codificación de caracteres acentuados comunes en español:
- Convierte categorías como `"Hidratación"` a `/categoria/hidratacion`.
- Permite mapeos personalizados (ej. `"Shampoo"` y `"Champú"` mapean ambos a la ruta limpia `/categoria/champu`).

### C. Botón Flotante de WhatsApp (`src/components/store/FloatingWhatsApp.tsx`)
Widget flotante posicionado en la esquina inferior derecha visible en todas las páginas públicas del sitio:
- Oculto en las vistas administrativas y CRM.
- Entrada animada con retraso suave.
- Cuenta con un tooltip interactivo en desktop para incentivar la conversación.

### D. UTM Tracker (`src/components/layout/UTMTracker.tsx`)
Captura los parámetros de marketing digital (`utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, `utm_term`) de la URL del visitante y los almacena en `sessionStorage` para adjuntarlos automáticamente en el payload del lead cuando finaliza la compra.

---

## 3. Integración con el CRM Admin

Cuando el cliente hace clic en "Confirmar pedido" en el checkout:
1. El cliente envía un `POST` a `/api/leads`.
2. La API lee la cabecera actual del archivo `data/luma_route_os/Leads.csv`.
3. Si el archivo no contiene la columna `googleMapsUrl`, realiza una **migración en caliente (hot-migration)** reordenando las columnas existentes y añadiendo los campos nuevos sin romper registros antiguos.
4. Escribe el nuevo registro en el CSV.
5. El administrador en `/admin/leads` puede ver de forma instantánea el pedido, abrir el modal de detalles y hacer clic en "Contactar por WhatsApp" para procesar el pedido con un mensaje de plantilla preestablecido.
