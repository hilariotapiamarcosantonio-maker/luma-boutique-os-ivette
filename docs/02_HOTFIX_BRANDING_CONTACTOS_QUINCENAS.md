# Registro de Hotfix: Branding, Contactos y Pagos Quincenales
**Proyecto**: Luma Boutique OS — Ivette Berroa / Cosmética Ancestral

Este documento registra los cambios implementados para la transición y optimización de la tienda virtual y CRM para la marca **Ivette Berroa / Cosmética Ancestral**.

---

## 1. Cambios de Branding y Logo
- **Integración del Logo Real**: Se configuró el logo original `Ivette Berroa Logo.png` como `/logo.png` en el directorio público y se usó en el encabezado, pie de página, hero de la página de inicio, y favicon de la aplicación.
- **Ajustes de Storefront**:
  - Removido el diseño genérico excesivamente blanco.
  - Implementado un tono botánico de lujo silencioso con presencia dominante de verde oliva oscuro y acentos dorados champagne.
  - El crema hueso se mantiene como fondo secundario y de lino para las secciones informativas.
  - Reemplazadas todas las referencias a "LUMA" o "Luma Capilar OS" visibles en el storefront por la identidad de **Ivette Berroa** y **Cosmética Ancestral**.
  - El "Kit Ritual de Inicio" se estableció como la oferta editorial principal en la página de inicio.

---

## 2. Paleta de Colores Corporativa
- **Verde oliva oscuro / Botánico profundo**: `#1e2d1a` / `#2a3b26` (Presencia dominante en Header, Footer y fondos principales)
- **Oro champagne mate**: `#c5a059` (Utilizado en botones de llamada a la acción (CTAs), pestañas activas y pequeños acentos premium)
- **Bronce antiguo**: `#3d2b1f` (Usado en tipografía de autoridad y bordes contrastantes)
- **Crema hueso / Lino artesanal**: `#faf8f5` / `#f2eee9` (Fondo secundario y contenedores de información limpia)

---

## 3. Modelo de Pagos Quincenales ("Plan Quincenal Clienta Fiel")
Se deshabilitó por completo el modelo de rutas, choferes y comisiones heredado. En su lugar, se implementó el **"Plan Quincenal Clienta Fiel"** a 30 días para las mejores clientas de confianza:
- **Estructura del Plan**:
  - Plazo de pago: 30 días.
  - Cuota 1 (50%): Día 15 a partir de la orden.
  - Cuota 2 (50%): Día 30 a partir de la orden.
- **Flujo de Pago en Checkout**:
  - En la vista de checkout, el cliente puede elegir entre "Pago Completo" y "Plan Quincenal Clienta Fiel".
  - Al seleccionar "Plan Quincenal Clienta Fiel", se muestra un desglose dinámico que indica los montos exactos de la Cuota 1 y Cuota 2 con sus respectivas fechas límite estimadas.
  - Al procesar el pedido, se guardan en la base de datos local `Leads.csv` los campos: `modalidadPago`, `montoTotal`, `cuota1`, `cuota2`, `fechaCuota1`, `fechaCuota2`, `observaciones`, `clienteFiel = true`, y `estadoPlan = "Pendiente inicio"`.
- **Estados del Plan**:
  - *Pendiente inicio*
  - *Cuota 1 pendiente*
  - *Cuota 1 pagada*
  - *Cuota 2 pendiente*
  - *Completado*
  - *Atrasado*

---

## 4. Importación de Contactos desde VCF
- El archivo de contactos con 2328 registros se procesó utilizando un script que normaliza los números telefónicos según el estándar de la República Dominicana (prefijo `1` para códigos de área `809`, `829`, `849`).
- Los contactos se guardaron en `data/luma_boutique_os/contacts.csv` bajo la siguiente estructura de campos:
  1. `id` (CON-XXXXX)
  2. `nombre`
  3. `telefono`
  4. `telefonoNormalizado`
  5. `etiqueta` ("Cliente Fiel" para las primeras 500)
  6. `origen` ("VCF Import")
  7. `notas` (Contiene cargos, organizaciones u otra información del VCF)
  8. `clientaFiel` (`true` para las primeras 500, `false` para las demás)
  9. `cohortes` (`lanzamiento_500` para las primeras 500)
  10. `estadoContacto` ("Nuevo")
  11. `interes`
  12. `ultimaInteraccion`
  13. `proximaAccion`

---

## 5. Panel de CRM y Gestión de Contactos
- **Arquitectura de Pestañas**:
  - **Pestaña "Pedidos y Leads"**: Muestra las órdenes del archivo `Leads.csv` con columnas específicas para el Plan Quincenal, monto pendiente por cobrar, próxima fecha de pago y estado del plan.
  - **Pestaña "Directorio de Contactos"**: Lista los 2328 contactos importados del VCF.
- **Acciones y Plantillas de WhatsApp**:
  - Cada contacto del directorio cuenta con un botón para **WhatsApp** y otro para **Copiar Mensaje**.
  - Al hacer clic en el botón de WhatsApp, se despliega una interfaz premium para seleccionar entre tres plantillas predefinidas:
    1. **Mensaje de Lanzamiento**: Invita a la clienta al lanzamiento del Kit Ritual de Inicio.
    2. **Mensaje de Pago Quincenal**: Recuerda la disponibilidad de pagar en dos cuotas quincenales.
    3. **Mensaje de Seguimiento**: Permite contactarla de forma cálida para recomendarle productos.
  - El mensaje se personaliza automáticamente extrayendo el primer nombre del contacto (por ejemplo, "Hola, María" en lugar del nombre completo).
- **Filtros Avanzados**:
  - Búsqueda por texto.
  - Filtro por categoría de contacto: *Clientas Fieles, Lanzamiento 500, Con WhatsApp, Interesadas en Kit, Pago Quincenal, Pendientes de seguimiento*.

---

## 6. Archivos Modificados
- `src/app/layout.tsx`: Configuración del favicon y remoción de variables de marca antiguas no utilizadas.
- `src/app/checkout/page.tsx`: Integración del selector de "Plan Quincenal Clienta Fiel" y cálculo automático de cuotas y fechas de vencimiento.
- `src/app/gracias/page.tsx`: Modificación de la pantalla de confirmación para mostrar información de cuotas del Plan Quincenal y generar el mensaje de WhatsApp adecuado.
- `src/app/api/leads/route.ts`: Expansión del endpoint para validar, estructurar y guardar datos de pagos quincenales en `Leads.csv` con migración en caliente de cabeceras.
- `src/app/admin/leads/page.tsx`: Carga del archivo `contacts.csv` de contactos VCF en paralelo con `Leads.csv`.
- `src/app/admin/leads/LeadsTable.tsx`: Refactorización total de la tabla en un panel de CRM modular de dos pestañas con visualización de cuotas y modals interactivos para WhatsApp.

---

## 7. Comandos Ejecutados
- `npm run lint`: Verificación y corrección de advertencias y errores de TypeScript (Aprobado sin errores).
- `npm run build`: Compilación de producción (Aprobado sin errores).

---

## Próximos Pasos
1. **QA Visual del Storefront**: Verificar la adaptación responsiva en dispositivos móviles.
2. **Pruebas de Simulación de Leads**: Enviar pedidos de prueba usando el "Plan Quincenal Clienta Fiel" para verificar que se escriban correctamente en el archivo `Leads.csv` local.
3. **Flujo de Envío a WhatsApp**: Probar que las plantillas de WhatsApp redirijan de forma óptima a `https://wa.me/` con los parámetros y textos correspondientes.
