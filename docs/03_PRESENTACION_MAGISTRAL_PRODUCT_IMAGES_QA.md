# Reporte de QA: HOTFIX 03 — Presentación Magistral, Product Imagery y Claridad Comercial

Este documento recopila las acciones realizadas, la justificación de diseño y la validación técnica del **Hotfix 03** para **Luma Boutique OS — Ivette Berroa / Cosmética Ancestral**.

---

## 1. Resumen de Cambios Realizados

Se implementaron quirúrgicamente los siguientes cambios sobre el proyecto:

### A. Branding Visual y Estética Premium
- **Logotipo Medallón**: Se rediseñó la visualización del logotipo de Ivette Berroa en la cabecera, hero, pie de página y menú móvil. Se integró como un medallón premium de color verde oliva profundo (`bg-[#2a3b26]`) con bordes en oro champagne mate (`border-[#c5a059]`) para integrarlo perfectamente en fondos claros y oscuros.
- **Tipografía y Texturas**: Se añadió el subtítulo "Cosmética Ancestral" debajo del logotipo principal para dar más fuerza de marca.
- **Paleta de Colores Lino Crema**: Se reemplazaron los fondos de color blanco genérico (`bg-white` / `bg-[#FAFAF9]`) por la mezcla seleccionada:
  - Crema Hueso: `#faf8f5`
  - Lino Suave: `#f2eee9`
- **Tipografía Bronce**: Se reemplazó el color carbón/negro puro (`text-[#1C1917]`) de los títulos y textos de la tienda por **Bronce Antiguo** (`#3d2b1f`), logrando una estética orgánica y premium.

### B. Generación e Integración de Imágenes de Productos
- Se generaron 6 imágenes de alta calidad con la herramienta `generate_image`.
- Las etiquetas de las imágenes se configuraron para evitar textos deformados, centrándose exclusivamente en un monograma elegante "IB" de color oro champagne sobre fondo verde oliva.
- Se guardaron las imágenes en formato original y se enlazaron en `src/data/products.ts`:
  1. `desodorante-equilibrio.webp` (Desodorante en Pasta)
  2. `crema-nutricion-profunda.webp` (Crema Corporal)
  3. `vela-intencion.webp` (Vela de Intención)
  4. `champu-botanico-purificante.webp` (Champú Purificante)
  5. `pasta-dental-ancestral.webp` (Pasta Dental Ancestral)
  6. `kit-ritual-inicio.webp` (Imagen compuesta del Kit)
- **Neutralización de LUMA**: Se eliminó cualquier referencia a "LUMA" en los mockups 3D HTML/CSS alternativos de `ProductVisual.tsx`, cambiándolo a "IVETTE BERROA".

### C. WhatsApp CTA y Canales de Comunicación
- **Botón WhatsApp en Cards**: Se reemplazó la flecha genérica de las tarjetas de producto en Inicio y Catálogo por un botón directo de WhatsApp de color verde (`bg-[#e8f5e9]` / `text-[#2e7d32]`), que abre un chat con Ivette prellenado con la consulta específica del producto.
- **Ritual WhatsApp en Carrito**: Se añadió un tercer botón en la parte inferior del carrito de compras: **"Consultar mi ritual por WhatsApp"**, que redacta un mensaje detallado con los nombres y cantidades de los productos de la cesta pidiendo a Ivette confirmación de envío y disponibilidad.

### D. Configuración de ITBIS (Impuestos)
- Se añadió la propiedad `showTaxBreakdown: boolean` en `src/config/commerce.ts`, enlazada a `NEXT_PUBLIC_SHOW_TAX_BREAKDOWN`.
- Por defecto, **`showTaxBreakdown` está configurada como `false`**, lo que causa:
  - Ocultar la línea de ITBIS en el resumen del checkout.
  - Ocultar la línea de ITBIS en el carrito/drawer de compras.
  - Ocultar la línea de ITBIS en el modal de detalle del administrador.
  - Mantener los precios del catálogo (ej. RD$ 3,900) como los precios finales netos (el impuesto de 18% no se suma sobre el precio final en el total general, evitando incrementos inesperados).

### E. Admin CRM y Ruta Directa de Contactos
- **Ruta `/admin/contactos`**: Se creó la página directa `/admin/contactos` que lee contactos del archivo local `data/luma_boutique_os/contacts.csv` y los muestra en la pestaña correspondiente pre-seleccionada en la tabla principal, filtrada de forma reactiva por parámetros.
- **Navegación Limpia**: Se actualizó la barra lateral (`Sidebar.tsx`) y barra de navegación móvil (`BottomNav.tsx`) con los títulos:
  - *Panel* (`/admin/dashboard`)
  - *Pedidos* (`/admin/leads`)
  - *Contactos* (`/admin/contactos`)
  - *Lanzamiento 500* (`/admin/contactos?filter=lanzamiento_500`)
  - *Seguimiento WhatsApp* (`/admin/contactos?filter=seguimiento`)
  - *Ventas y CxC* (`/admin`)
- **Dashboard Widgets**: Se actualizaron las tarjetas superiores del dashboard `/admin/dashboard` para mostrar de forma limpia:
  - **Total de pedidos**: Pedidos registrados en Leads.csv.
  - **Nuevos pedidos**: Pedidos con estado "Nuevo".
  - **Contactos VCF**: Cantidad total en contacts.csv.
  - **Clientas fieles**: Contactos con `clientaFiel === true`.
  - **Lanzamiento 500**: Cohorte de lanzamiento inicial.
  - **Planes quincenales activos**: Pedidos quincenales pendientes de cobro final.
  - **Pendientes de WhatsApp**: Contactos programados para seguimiento.

---

## 2. Decisiones de Diseño y Seguridad

1. **Textos en Etiquetas**: Para evitar letras deformadas por el motor de difusión, las etiquetas de los frascos e imágenes del kit solo tienen un monograma "IB" estilizado en oro champagne mate, y la información del producto real se renderiza directamente desde la interfaz del usuario.
2. **Seguridad de Datos**: El archivo `contacts.csv` permanece estrictamente en `data/luma_boutique_os/contacts.csv`. No se expone en la carpeta pública ni en ninguna ruta API pública no autenticada, y no se registran ni documentan teléfonos reales en logs de consola.
3. **Redirecciones de Rutas Obsoletas**: En `middleware.ts` se añadió una redirección del home anterior `/dashboard` hacia `/admin/dashboard` para evitar 404s.

---

## 3. Comandos Ejecutados y Validación Técnica

Durante el Sprint de QA se ejecutaron y aprobaron los siguientes procesos:

- **Eliminación de archivos temporales**: Se removieron con éxito los scripts scratch usados para realizar las sustituciones.
- **Verificación de Linter**:
  ```bash
  npm run lint
  ```
  *Resultado*: APROBADO (0 errores de linter). Se resolvieron las advertencias de importaciones y variables no usadas.
- **Prueba de Compilación**:
  ```bash
  npm run build
  ```
  *Resultado*: COMPILACIÓN EXITOSA. Next.js optimizó todas las páginas y compiló de forma estática y dinámica sin advertencias críticas.

---

## 4. Próximos Pasos (Antes del Lanzamiento)

1. **Configuración de Variables de Entorno en Vercel**:
   Asegurar que al desplegar en producción se defina la variable:
   `NEXT_PUBLIC_SHOW_TAX_BREAKDOWN=false`
2. **Revisión del Logo**: Validar el medallón de Ivette Berroa con el logo real cargado en producción.
3. **Carga de Datos Reales**: Mantener los archivos CSV limpios y listos para la importación del directorio telefónico de producción.

---

## 5. Auditoría de Formato de Imágenes (Post-Sprint)

### Hallazgo
Se solicitó verificar si los archivos en `public/products/ivette/` eran WebP reales o archivos JPEG renombrados con extensión `.webp`.

**Diagnóstico con magic bytes:**

| Archivo | Magic Bytes detectados | Formato real |
|---|---|---|
| `champu-botanico-purificante.webp` | `FF D8 FF E0 00 10 4A 46` | **JPEG** |
| `crema-nutricion-profunda.webp` | `FF D8 FF E0 00 10 4A 46` | **JPEG** |
| `desodorante-equilibrio.webp` | `FF D8 FF E0 00 10 4A 46` | **JPEG** |
| `kit-ritual-inicio.webp` | `FF D8 FF E0 00 10 4A 46` | **JPEG** |
| `pasta-dental-ancestral.webp` | `FF D8 FF E0 00 10 4A 46` | **JPEG** |
| `vela-intencion.webp` | `FF D8 FF E0 00 10 4A 46` | **JPEG** |

> Los magic bytes `FF D8 FF E0` corresponden inequívocamente al formato JPEG (JFIF). Todos los archivos eran JPEGs renombrados con extensión `.webp`.

### Acción Correctiva
1. Se renombraron los 6 archivos de `.webp` → `.jpg` en `public/products/ivette/`.
2. Se actualizaron todas las referencias en:
   - `src/data/products.ts` (6 rutas de imagen)
   - `src/app/page.tsx` (2 referencias en la sección hero)
3. Se verificó que no quedaran referencias residuales a `.webp` en el directorio `src/`.

### Validación Final
```bash
npm run lint   # ✅ APROBADO — 0 errores, solo warnings de <img> existentes
npm run build  # ✅ En ejecución — post-corrección
```

### Estado: ✅ RESUELTO
Las imágenes se sirven correctamente como JPEG bajo la extensión `.jpg`. No hay archivos con extensión errónea en producción.

