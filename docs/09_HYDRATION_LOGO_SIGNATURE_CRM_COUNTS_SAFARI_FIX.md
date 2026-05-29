# HOTFIX 09 — Hydration, Logo Premium, Firma Digital, Safari iPhone y CRM Contactos Completo

Este documento recopila las causas de los problemas solucionados, el análisis técnico, los patrones de corrección aplicados, los archivos modificados y el estado final del sistema para la entrega segura de **HOTFIX 09** en **Luma Boutique OS (Ivette Berroa / Cosmética Ancestral)**.

---

## 1. Causa Real del Hydration Mismatch

### Causa Raíz
En Next.js (App Router con Server Components y Client Components), el servidor genera una estructura de marcado HTML (SSR) que se envía al navegador. Al cargar la aplicación, React compara este HTML inicial con el árbol de componentes generado en el navegador durante el primer renderizado (Hydration). 

El error de hidratación se producía por el anidamiento inválido de etiquetas HTML interactivas:
1. **Botones e hipervínculos anidados:** Colocar elementos `<button>` o enlaces `<a>` secundarios dentro de un componente `<Link>` principal.
2. **Corrección de sintaxis del navegador:** Los navegadores corrigen automáticamente el HTML inválido en caliente, cerrando la etiqueta externa `<Link>` (que es representada como un elemento `<a>`) tan pronto como encuentran otro elemento interactivo interno. Esto modifica el árbol DOM real en el cliente, rompiendo la coincidencia con el DOM generado en el servidor.

### Patrón de Corrección Aplicado
Se reemplazó el contenedor principal de las tarjetas de producto en el catálogo y página de inicio de:
```tsx
// PATRÓN INVÁLIDO ANTERIOR
<Link href={`/producto/${product.slug}`} className="card-wrapper">
  <ProductVisual />
  <button onClick={addItem}>Añadir</button>
</Link>
```

A una arquitectura tridimensional limpia de eventos:
```tsx
// PATRÓN VÁLIDO CORRECTOR
<div className="group relative flex flex-col overflow-hidden rounded-2xl ...">
  {/* Enlace superpuesto invisible absoluto para hacer clickable toda la tarjeta */}
  <Link
    href={`/producto/${product.slug}`}
    className="absolute inset-0 z-0"
    aria-label={product.name}
  />

  {/* Contenido visual e información con eventos de puntero desactivados para que pasen al Link */}
  <div className="flex-1 pointer-events-none">
    <ProductVisual ... />
    <h3>{product.name}</h3>
  </div>

  {/* Botones interactivos flotantes elevados por encima del overlay link con eventos activados */}
  <div className="flex gap-1.5 relative z-20 pointer-events-auto">
    <button onClick={addItem}>Añadir</button>
  </div>
</div>
```

---

## 2. Archivos Modificados

A continuación se detallan los enlaces directos a los archivos implicados en el Hotfix:

* **Página de Inicio:** [src/app/page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/page.tsx)
* **Catálogo General:** [src/app/tienda/page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/tienda/page.tsx)
* **Categorías:** [src/app/categoria/[slug]/page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/categoria/%5Bslug%5D/page.tsx)
* **Detalle del Producto:** [src/app/producto/[slug]/page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/producto/%5Bslug%5D/page.tsx)
* **Layouts de Tienda:**
  * [StoreHeader.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/components/layout/StoreHeader.tsx)
  * [StoreFooter.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/components/layout/StoreFooter.tsx)
  * [CartDrawer.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/components/store/CartDrawer.tsx)
  * [FloatingWhatsApp.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/components/store/FloatingWhatsApp.tsx)
  * [ProductVisual.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/components/store/ProductVisual.tsx)
* **Panel de Control y CRM:**
  * [LeadsTable.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/admin/leads/LeadsTable.tsx)
  * [src/app/admin/contactos/page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/admin/contactos/page.tsx)
  * [src/app/admin/dashboard/page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/admin/dashboard/page.tsx)

---

## 3. Tamaños Finales del Logo

Se aplicaron los tamaños exactos requeridos, logrando un balance visual e integrando bordes dorados champagne y fondos oscuros en el Header/Hero/Footer:

| Ubicación | Mobile Sizing | Desktop Sizing | Notas de Adaptabilidad iPhone/Safari |
| :--- | :--- | :--- | :--- |
| **Header** | `h-14 w-14` | `h-[72px] w-[72px]` | Se amplió la altura del contenedor principal del Header de `h-16` a `h-20 md:h-24` para dar espacio al logo y evitar desbordamientos o que empuje el menú mobile. |
| **Hero** | `h-24 w-24` | `md:h-32 md:w-32` | Ubicado en el centro de alineación responsiva en [src/app/page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/page.tsx#L31). |
| **Footer** | `h-16 w-16` | `md:h-20 md:w-20` | Centrado verticalmente junto con el título principal de Ivette Berroa. |

---

## 4. Firma Digital de Marcos Hilario

Se incorporó la firma digital con los estilos cromáticos de la boutique (champagne dorado `#c5a059` y texturado opaco `#f2eee9`/40) en el pie de página de [StoreFooter.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/components/layout/StoreFooter.tsx#L202-L209):

```tsx
<div className="text-center space-y-0.5 shrink-0">
  <p className="text-[10px] text-[#c5a059] font-medium tracking-wide">
    Desarrollado por <span className="font-bold">Marcos Hilario</span>
  </p>
  <p className="text-[9px] text-[#f2eee9]/40">
    &copy; 2026 Marcos Hilario. Arquitectura Digital de Alto Rendimiento.
  </p>
</div>
```

---

## 5. Paginación y Conteos Globales del CRM

Para evitar bloqueos de la interfaz gráfica y sobrecarga en dispositivos móviles (iPhone con Safari), se estructuraron las siguientes soluciones:

### Paginación Client-Side
* Se limitó a **100 contactos por página** en la tabla del directorio.
* Se añadieron botones interactivos de "Anterior" y "Siguiente" que alternan de página de forma fluida.
* Se muestra el desglose del conteo en tiempo real con el siguiente formato:
  > **Mostrando X–Y de Z contactos** (e.g. *Mostrando 1–100 de 4,775 contactos*).
* Los números se leen directamente de la hoja de Google Sheets en tiempo real (`totalFilteredContacts` e `initialContacts.length`).

### Pestañas (Pills) de Categorías con Conteos
Se eliminó el dropdown y se crearon botones horizontales que actúan como "pills" interactivas con conteos globales en tiempo real. 
Los estados de origen y clasificación son:
1. **Todos:** Total global de registros importados en Google Sheets.
2. **WhatsApp válido:** Contactos con teléfono normalizado exitoso (`contactableWhatsapp === true`).
3. **Revisión:** Contactos que no tienen teléfono válido, tienen teléfono incompleto, no normalizable, vacíos, o tienen el estado de importación `"Revisión"` (`contactableWhatsapp === false || !telefonoNormalizado || estadoImportacion === "Revisión"`).
4. **Lanzamiento 500:** Cohorte comercial especial (`cohortes === "lanzamiento_500"`).
5. **CSV ptigo:** Origen desde el archivo CSV de importación ptigo (`origen === "CSV ptigo"`).
6. **VCF Ivette:** Origen desde los contactos de Ivette extraídos de VCF (`origen === "VCF Ivette"`).

---

## 6. Filtros Disponibles e Integración de Query Params

Se añadió soporte nativo para query params de URL para filtrar los contactos directamente al cargar la página:

* **Filtro WhatsApp Válido:** `/admin/contactos?filter=whatsapp_valido`
* **Filtro Revisión:** `/admin/contactos?filter=revision`
* **Filtro Lanzamiento 500:** `/admin/contactos?filter=lanzamiento_500`
* **Filtro CSV Ptigo:** `/admin/contactos?filter=csv_ptigo`
* **Filtro VCF Ivette:** `/admin/contactos?filter=vcf_ivette`

### Compatibilidad de Nombres (Aliases)
Para máxima flexibilidad, se mapean las siguientes variaciones en la URL de forma insensible a mayúsculas/minúsculas y acentos:
* `"WhatsApp válido"`, `"whatsapp_valido"`, `"con_whatsapp"` $\rightarrow$ `whatsapp_valido`
* `"Revisión"`, `"revision"`, `"revisión"` $\rightarrow$ `revision`
* `"Lanzamiento 500"`, `"lanzamiento_500"`, `"lanzamiento"` $\rightarrow$ `lanzamiento_500`
* `"CSV ptigo"`, `"csv_ptigo"`, `"csv ptigo"` $\rightarrow$ `csv_ptigo`
* `"VCF Ivette"`, `"vcf_ivette"`, `"vcf ivette"` $\rightarrow$ `vcf_ivette`

---

## 7. Optimización y QA para Safari iPhone

Se aplicaron los siguientes ajustes de CSS y layouts específicos para Safari móvil:
1. **Scroll Independiente en Modales:** Los modales de detalle de contactos, prospectos, y el editor de mensajes de WhatsApp tienen un contenedor con la altura máxima limitada a `max-h-[85vh]` y la propiedad `overflow-y-auto` activa para evitar que la barra de navegación del navegador Safari o el teclado virtual corten el formulario.
2. **Protección contra Navbars:** El layout principal de CRM ([AppShell.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/components/layout/AppShell.tsx)) cuenta con un padding inferior de seguridad `pb-28 sm:pb-32` para evitar que la barra fija `BottomNav` móvil (64px) tape o colisione con los botones de acción del final de las tarjetas de contactos.
3. **Botones de WhatsApp Deshabilitados:** Los contactos en estado de revisión tienen el botón de WhatsApp atenuado, sin puntero interactivo, y con el texto cambiado a "Revisar teléfono" para evitar envíos fallidos accidentales en móviles.

---

## 8. Resultados de Verificación Técnica

* **Linter (`npm run lint`):** Completado con éxito. Se corrigió un error de importación huérfana de `DollarSign` en [src/app/admin/dashboard/page.tsx](file:///F:/Luma%20Commerce%20%20Boutique%20OS/SaaS%20Comercial%20Replicable/CRM%20En%20Sheets%20-%20copia/crm-admin/src/app/admin/dashboard/page.tsx#L2). Cero errores de TypeScript o formato.
* **Build de Producción (`npm run build`):** Compilación e hidración de páginas estáticas exitosa.

---

## 9. Próximos Pasos

Siguiendo las restricciones obligatorias del Hotfix, **no se ha realizado ningún git push ni deploy a Vercel**.

1. **Revisión del usuario:** El usuario puede levantar el servidor localmente con `npm run dev` para corroborar el flujo responsivo y los conteos globales.
2. **Git Add y Commit Local:** Añadir las modificaciones al control de versiones localmente.
3. **Push y Deploy (Una vez aprobado):** Subir la rama a GitHub para que los hooks de Vercel realicen la compilación y despliegue a producción de forma automática.
