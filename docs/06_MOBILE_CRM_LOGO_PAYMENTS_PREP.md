# Hotfix 06: Mobile CRM, Logo Premium & Payments Preparation

Este documento detalla los cambios realizados en el marco del **Hotfix 06** para optimizar la experiencia móvil, expandir la presencia de la marca en la tienda virtual e introducir la arquitectura base para la preparación de pasarelas de pago y seguridad en Luma Boutique OS.

---

## 1. Cambios Mobile & Safari (iOS)

Se han corregido problemas críticos de visualización y de interacción en dispositivos iOS (Safari iPhone):
- **Estructuras Flex y scroll de modales**: Se modificaron las envolturas de los modales de detalle (`Lead Detalle`, `Contacto Detalle`, `Seguimiento` y `Plantilla WhatsApp`) en [LeadsTable.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/admin/leads/LeadsTable.tsx) sustituyendo la alineación fija vertical (`items-center`) por `items-start sm:items-center` junto con `overflow-y-auto` y márgenes responsivos `my-auto sm:my-8`. Esto evita que las partes superior e inferior de los modales queden inaccesibles en pantallas pequeñas y navegadores con barras dinámicas como Safari en iOS.
- **Evitar solapamientos del Bottom Nav**: Se incrementó el espaciado de margen inferior general (`pb-28 sm:pb-32`) en el shell del administrador [AppShell.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/components/layout/AppShell.tsx) para garantizar que la barra de navegación inferior flotante no obstruya ningún botón de acción ni texto del CRM.
- **Conversión de tablas a tarjetas (Cards)**:
  - En la vista principal del CRM ([AdminClient.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/admin/AdminClient.tsx)), se implementó una grilla responsiva de tarjetas para dispositivos móviles (`block sm:hidden`) para el listado de Ventas Históricas.
  - En el panel de control ([page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/admin/dashboard/page.tsx)), se adaptó la lista de "Últimos Pedidos" a tarjetas responsivas.
  - En la sección de prospectos y contactos ([LeadsTable.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/admin/leads/LeadsTable.tsx)), se convirtieron las tablas de la pestaña "Pedidos" y "Contactos" a un formato de lista de tarjetas optimizadas para pantallas táctiles verticales.
- **Mejora en KPIs y Títulos**: Se agregaron reglas CSS de ajuste de línea (`break-words whitespace-normal leading-normal`) a los títulos de las tarjetas de indicadores clave del panel para evitar que textos largos rompan los límites de la caja en vistas compactas.

---

## 2. Aumento de la Presencia de Marca (Logo Premium)

Para elevar la sofisticación de la boutique de Ivette Berroa, se incrementó visualmente el medallón del logotipo en tres puntos principales del diseño:
1. **Header ([StoreHeader.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/components/layout/StoreHeader.tsx))**: Se ajustó la escala del contenedor circular del logo a `h-11 w-11` en dispositivos móviles y `md:h-14 md:w-14` en desktop, mejorando además el contraste y legibilidad del texto de marca.
2. **Hero de Tienda ([page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/page.tsx))**: Se amplió el logo central destacado a `h-20 w-20` (mobile) / `md:h-24 md:w-24` (desktop) con un estilo premium, dándole mayor protagonismo al iniciar la navegación.
3. **Footer ([StoreFooter.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/components/layout/StoreFooter.tsx))**: Se aumentó a `h-12 w-12` (mobile) / `md:h-16 md:w-16` (desktop) organizando el eslogan en un bloque inferior con el espaciado correcto para una presentación sofisticada.

---

## 3. Preparación de Métodos de Pago

Se creó la estructura de configuración [payments.ts](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/config/payments.ts) y se actualizó la página de checkout ([page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/checkout/page.tsx)).

### Métodos de Pago Activos
- **Transferencia bancaria** (Confirmación manual de datos de cuenta en pantalla y por WhatsApp).
- **Efectivo coordinado** (Ideal para retiro directo o entrega física local).
- **Contra entrega / Entrega coordinada** (El cliente abona o salda al recibir su paquete).
- **Plan Quincenal Clienta Fiel** (Muestra leyenda informativa: *"Disponible solo para clientas fieles aprobadas. Pago máximo en 30 días: cuota 1 a los 15 días y cuota 2 a los 30 días."*).

### Métodos en Estado "Próximamente" (Inactivos en UI)
- **PayPal**: (Deshabilitado visualmente y marcado como "Próximamente" a menos que la variable `NEXT_PUBLIC_ENABLE_PAYPAL=true` y exista un link válido en `NEXT_PUBLIC_PAYPAL_PAYMENT_LINK`).
- **Tarjeta de crédito online** (Tarjeta online con pasarela).
- **Apple Pay**
- **Google Pay**

> [!WARNING]
> Ninguna pasarela de cargo directo automático (como Azul, CardNET, Stripe, Apple Pay o Google Pay) se encuentra integrada activamente a nivel producción.

### Flujo Especial de PayPal (Enlace Externo)
Si PayPal se configura como activo:
1. El usuario puede seleccionarlo en la interfaz de Checkout.
2. Al procesar el pedido, el sistema abre la URL externa especificada en `NEXT_PUBLIC_PAYPAL_PAYMENT_LINK` en una pestaña nueva mediante `window.open`.
3. El pedido se registra internamente en Google Sheets con el estado: **`"Pendiente confirmación de pago"`** (en lugar de `"Nuevo"`), requiriendo la conciliación manual posterior por parte de Ivette en el CRM.

---

## 4. Auditoría de Seguridad & Admin Protection

> [!CAUTION]
> ### Pendiente crítico: protección real de admin/CRM
> La variable de entorno `NEXT_PUBLIC_ADMIN_PROTECTED` y su valor asociado en el frontend **no constituyen una barrera de seguridad de grado producción** y actúan puramente como un bypass o alerta visual de desarrollo/auditoría.
> 
> La protección real de datos sensibles (CRM, leads, contactos e ingresos) debe implementarse del lado del servidor (server-side authentication) utilizando middleware de Next.js, cookies de sesión seguras (`httpOnly`), y un proveedor de identidad robusto (Auth0, Clerk, NextAuth, o autenticación nativa basada en token firmados en base de datos). **No opere el CRM con datos reales de clientes utilizando únicamente la validación client-side de `NEXT_PUBLIC_ADMIN_PROTECTED`.**

### Alerta de Auditoría Activa
Cuando `NEXT_PUBLIC_ADMIN_PROTECTED=false`, el CRM muestra una franja de advertencia en color ámbar en la parte superior con el mensaje:
> ⚠️ **Modo auditoría activo. Protege el CRM antes de operar con datos reales.**

---

## 5. Variables de Entorno Recomendadas para Vercel / Producción

Para configurar adecuadamente la visualización de pagos y el modo de protección en Vercel, defina los siguientes pares clave-valor:

```bash
# Habilitar/Deshabilitar flujo manual de PayPal
NEXT_PUBLIC_ENABLE_PAYPAL=false
NEXT_PUBLIC_PAYPAL_PAYMENT_LINK=https://www.paypal.me/tu_usuario_luma/monto

# Control de visualización de botones de tarjetas y wallets
NEXT_PUBLIC_ENABLE_CARD_GATEWAY=false
NEXT_PUBLIC_PAYMENT_GATEWAY_PROVIDER=
NEXT_PUBLIC_ENABLE_APPLE_PAY=false
NEXT_PUBLIC_ENABLE_GOOGLE_PAY=false

# Bypass de protección (Poner en true e implementar middleware seguro en prod)
NEXT_PUBLIC_ADMIN_PROTECTED=false
```

---

## 6. Próximos Pasos (Roadmap de Integraciones)

1. **Implementar Middleware Server-Side para Admin**:
   - Agregar una capa de autenticación HTTP en un archivo `src/middleware.ts` para verificar la existencia de tokens de sesión válidos antes de resolver cualquier ruta bajo el prefijo `/admin/*`.
2. **Pasarelas de Pago Oficiales (Azul, CardNET)**:
   - Configurar endpoints en `src/app/api/payments/` para realizar la firma de peticiones (HMAC-SHA256) requeridas por Azul o CardNET.
   - Definir flujos de webhook de retorno seguro para recibir respuestas asíncronas de cobros aprobados y actualizar automáticamente los estados en el CRM y en Google Sheets.
3. **Automatización de Conciliación de PayPal**:
   - Integrar la API de Webhooks de PayPal para capturar el evento `PAYMENT.CAPTURE.COMPLETED` y cambiar automáticamente el pedido de `"Pendiente confirmación de pago"` a `"Pagado"`.
