# HOTFIX 10: Header Verde Premium, Logo Protagonista, CRM Totales Reales y Safari iPhone QA

Este documento detalla los cambios realizados en el sistema comercial e interno de **Luma Boutique OS — Ivette Berroa / Cosmética Ancestral** para resolver problemas visuales del storefront, visualización y cálculo de totales reales del CRM e inestabilidades de layout en Safari iOS.

---

## 1. Causa Exacta de Conteos Parciales
Anteriormente, el archivo central de integración de Google Sheets (`src/lib/ivette-crm.ts`) realizaba lecturas limitadas en sus consultas a las pestañas de la hoja de cálculo. En particular, la función `readCrmRows` utilizaba el rango `A1:AZ1000`.

Esto restringía la lectura a un máximo de 1,000 filas (1 fila de cabecera y 999 registros). Dado que el CRM consolidado de Ivette Berroa cuenta con **4,775 contactos reales**, todos los registros a partir de la fila 1000 eran ignorados. Por ende, los KPIs y las listas filtradas mostraban resultados limitados (como 999 contactos en total, 904 WhatsApp válidos, etc.).

### Rango Anterior vs Rango Nuevo:
* **Rango Anterior (Limitado):** `Contactos!A1:AZ1000`
* **Rango Nuevo (Completo):** `Contactos!A:AZ` (dinámico y auto-expandible)

---

## 2. Confirmación de Totales Reales
Con el cambio de rango a `A:AZ`, el CRM lee en su totalidad la base de datos de Google Sheets. Los conteos ahora se calculan dinámicamente de forma global sobre `fullContacts` antes de aplicar la paginación de visualización.

Los KPIs consolidados ahora reflejan con precisión:
* **Total Contactos:** 4,775 (o el total real de filas presentes)
* **WhatsApp Válido:** Total real global de números normalizados aptos
* **Revisión:** Total real global de contactos por verificar (no aptos)
* **Lanzamiento 500:** 500 clientas preservadas de la primera cohorte
* **CSV ptigo:** Total real global importado de CSV ptigo
* **VCF Ivette:** Total real global importado de VCF Ivette
* **Seguimiento:** Total real global de clientes con estado `Seguimiento` o acción de seguimiento programada.

---

## 3. Cambios en Header y Logo

### Header Verde Premium:
El header de la tienda pública se modificó de un color crema claro genérico a un diseño de lujo con presencia de marca:
* **Fondo:** Verde oliva profundo `#1e2d1a` (con opacidad del 95% y efecto de desenfoque de fondo `backdrop-blur-md`).
* **Borde inferior:** Champagne dorado sutil `#c5a059` con 30% de opacidad.
* **Navegación:** Textos cambiados a color crema claro `#faf8f5` con hover y estado activo en `#c5a059` (oro).
* **Menú de Categorías (Desktop y Móvil):** Adaptados al fondo verde oliva profundo con enlaces legibles.
* **Botón de Asesoría:** Cambiado de verde oliva a un fondo dorado `#c5a059` premium con texto blanco y hover `#b38f48`.

### Logo Protagonista:
Para evitar que el logo se viera pequeño o recortado dentro del medallón, se incrementaron sus dimensiones en el layout general de la UI y se redujo el padding interno al mínimo (`p-[2px]`), permitiendo que la imagen del logo abarque entre el **85% y 95% del círculo**:
* **Header:**
  - Móvil: De `h-14 w-14` a `h-16 w-16`.
  - Desktop: De `md:h-[72px] md:w-[72px]` a `md:h-20 md:w-20`.
* **Hero Section:**
  - Móvil: De `h-24 w-24` a `h-28 w-28`.
  - Desktop: De `md:h-32 md:w-32` a `md:h-36 md:w-36`.
* **Footer:**
  - Móvil: De `h-16 w-16` a `h-20 w-20`.
  - Desktop: De `md:h-20 md:w-20` a `md:h-24 md:w-24`.

---

## 4. Safari iPhone QA

Para resolver las inestabilidades y cortes de pantalla en dispositivos iOS (Safari), se implementaron las siguientes mejoras de UX:
1. **Firma y safe-area del BottomNav:**
   Se aplicó la variable de entorno CSS `safe-area-inset-bottom` en la barra de navegación móvil del CRM (`BottomNav.tsx`) para asegurar compatibilidad con notched iPhones (iPhone X en adelante):
   - `h-[calc(4rem+env(safe-area-inset-bottom))]`
   - `pb-[env(safe-area-inset-bottom)]`
   Esto eleva la barra e impide que los iconos y etiquetas queden superpuestos o tapados por la barra de inicio nativa de iOS.
2. **Dashboard KPIs compactos:**
   La distribución de los 8 KPI cards se cambió de `grid-cols-1` a `grid-cols-2` en pantallas móviles. Esto evita un scroll vertical innecesario y proporciona un panel de mandos balanceado.
3. **Filtros deslizables (Horizontal Scroll):**
   Los botones de filtrado de contactos en móvil se cambiaron de una disposición vertical envuelta (`flex-wrap`) a un carrusel horizontal fluido con scroll:
   - `flex overflow-x-auto whitespace-nowrap pb-2`
   - Clases `shrink-0` en los botones para prevenir distorsión del texto.
4. **Acciones Rápidas no dependientes de Hover:**
   Los botones de acción de contactos y leads (WhatsApp, Copiar, Seguimiento, Detalle) se diseñaron con una altura mínima táctil de `38px` y están permanentemente expuestos, garantizando que el usuario de iPhone pueda interactuar al primer toque.

---

## 5. Filtros Disponibles y Query Params
El listado de contactos ahora es totalmente compatible con la carga parametrizada y persistente en la URL:
* `?filter=all` — Todos los contactos.
* `?filter=whatsapp_valido` — Contactos marcados con `contactable_whatsapp = true`.
* `?filter=revision` — Contactos en revisión (teléfonos no normalizados, no contactables o con estado `Revisión`).
* `?filter=lanzamiento_500` — Contactos de la cohorte comercial `lanzamiento_500`.
* `?filter=csv_ptigo` — Contactos de origen `CSV ptigo`.
* `?filter=vcf_ivette` — Contactos de origen `VCF Ivette`.
* `?filter=seguimiento` — Contactos en estado `Seguimiento` o con acciones pendientes.

---

## 6. Resultado de Validación

Se ejecutaron localmente las pruebas de sanidad y compilación del entorno Next.js para asegurar que las correcciones no introduzcan errores ni hydration mismatches:

1. **`npm run lint`**:
   - Compilación sintáctica exitosa.
   - ESLint completado sin errores. Únicamente se reportaron advertencias menores de Next.js (`next/image`) asociadas al uso de elementos nativos `<img>` para logotipos, las cuales ya venían en el proyecto base y no bloquean el flujo de deploy.
2. **`npm run build`**:
   - Compilación estática y optimización de producción exitosa.
   - Rutas compiladas correctamente, incluyendo todas las rutas dinámicas `/producto/[slug]`, `/categoria/[slug]`, y el segmento administrativo `/admin`.
   - Cero errores de "Hydration failed" o discrepancias de HTML en renderizado de servidor/cliente.

---

## 7. Próximos Pasos para Push y Deploy
Una vez confirmada la sanidad local:
1. El líder frontend podrá autorizar el `git add` y `git commit` de las correcciones.
2. Subir cambios al repositorio de origen para activar la pipeline de CI/CD (ej. Vercel) y desplegar las mejoras a producción.
3. El cliente final (Ivette Berroa) verá reflejada de forma inmediata la base completa de 4,775 contactos y el header corporativo verde en su tienda online.
