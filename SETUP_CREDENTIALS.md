# CONFIGURACIÓN DE LECTURA: GOOGLE SHEETS API

El Admin Panel ya incluye la capa de datos modular (`lib/crm-data`) construida sobre la librería oficial `googleapis`.

Para transicionar de los "Mock Datos" a los "Datos en Vivo", solo necesitas inyectar las credenciales en tu archivo `.env.local` en la raíz del frontend (`crm-admin/`).

## Paso 1: Configurar Credenciales
1. Ve a [Google Cloud Console](https://console.cloud.google.com/).
2. Habilita la "Google Sheets API".
3. Crea una "Service Account" y genera una nueva clave en formato JSON.
4. Abre la hoja de Google Sheets del CRM (el `.xlsx` importado) y dale acceso de **"Lector" (Viewer)** al correo de la Service Account (suele terminar en `@gserviceaccount.com`).

## Paso 2: Crear el archivo `.env.local`
En la carpeta `crm-admin`, crea un archivo `.env.local` con estas tres variables extraídas del JSON:

```env
SPREADSHEET_ID="tu-id-del-sheet"
GOOGLE_CLIENT_EMAIL="tu-service-account@proyecto.iam.gserviceaccount.com"
GOOGLE_PRIVATE_KEY="pega-aqui-la-private-key-del-json"
```
*(Nota: Asegúrate de copiar el SPREADSHEET_ID correcto de la URL de tu Google Sheet. Se ve así: `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`)*

## Comportamiento Actual (Fallback Inteligente)
Si el panel de Next.js detecta que faltan estas credenciales, **no se romperá**. Automáticamente interceptará el error en la capa `getSheetsClient()` y hará un fallback al archivo `mock-data.ts`. Esto permite a los desarrolladores o diseñadores seguir modificando la UI sin necesidad de acceso a la base de datos real.

Al poner los datos en `.env.local`, las funciones como `getLeads()` y `getDashboardData()` saltarán la lógica *mock* y ejecutarán `sheets.spreadsheets.values.get()` apuntando directamente a las filas y columnas congeladas en la Fase 1.
