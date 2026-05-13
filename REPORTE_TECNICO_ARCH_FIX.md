# REPORTE TÉCNICO: AISLAMIENTO DE GOOGLE SHEETS API EN NEXT.JS

## 1. El Problema Base
Al compilar la aplicación, Next.js arrojó los siguientes errores:
- `Module not found: Can't resolve 'net'`
- `Module not found: Can't resolve 'worker_threads'`

**Causa exacta:**
Next.js (a través de Webpack y su sistema de Server Components) intenta analizar el árbol de dependencias completo. El App Router permite exportar rutas tanto al runtime de Node como al runtime "Edge". La librería oficial `googleapis` depende fuertemente de módulos core del sistema operativo (`net`, `tls`, `child_process`, `worker_threads`). Al no tener una restricción fuerte impuesta en los archivos, el *bundler* intentaba empaquetar estas funciones pesadas asumiendo que podrían ser llamadas en un entorno "Edge" o "Cliente", donde dichos módulos no existen.

## 2. La Solución Aplicada (Arquitectura Limpia y Segura)
No fue necesario reestructurar a Route Handlers HTTP (lo cual hubiera agregado latencia de red entre nuestro propio servidor), sino que se aplicó el patrón oficial de Next.js para aislamiento de librerías nativas:

### A. Barrera Estricta de "Server-Only"
Se instaló la librería oficial `server-only`.
Se inyectó la instrucción `import "server-only";` en la cabecera de todo el árbol que conforma la capa de datos modular (`src/lib/google-sheets.ts` y todo `src/lib/crm-data/*`).
*Por qué funciona:* Esto le garantiza a Webpack que el código debajo jamás será importado de forma transitiva hacia un Client Component, deteniendo el árbol de análisis agresivo para entornos de navegador.

### B. Forzado del Runtime `nodejs`
En todas las páginas de lectura dinámica (`page.tsx` de cada módulo), se agregó la directiva:
`export const runtime = 'nodejs';`
*Por qué funciona:* Le avisa explícitamente a Next.js y a Vercel que esta página jamás debe ser compilada para Edge computing. Esto reactiva todos los polyfills y capacidades nativas necesarias para que la librería `googleapis` pueda comunicarse con Google Cloud sin romperse.

## 3. Estado Actual
- **El error de compilación ha desaparecido por completo** (`Compiled successfully`).
- Las páginas que leen datos reales figuran como dinámicas (`f (Dynamic) server-rendered on demand`).
- El *UI Shell* estático y premium no fue alterado, manteniendo la carga relámpago, pero con capacidad total de lectura en caliente.

El CRM Frontend está operativamente apto y estabilizado para lectura de datos en producción.