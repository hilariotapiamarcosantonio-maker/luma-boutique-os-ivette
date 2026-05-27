# Google Sheets Online CRM - Ivette Berroa

## Google Sheet privado

Nombre: `Luma Boutique OS - Ivette Berroa CRM`

URL: https://docs.google.com/spreadsheets/d/1ePHuSc4_b1UP22hP3Io4MwV_-ofB0_d8dx9-Pg220JI

ID para `.env.local`:

```env
IVETTE_SPREADSHEET_ID=1ePHuSc4_b1UP22hP3Io4MwV_-ofB0_d8dx9-Pg220JI
```

La hoja fue creada nueva para Ivette Berroa. No usa el Google Sheet de Luma Capilar.

## Pestañas y columnas

`Contactos`: id, nombre, telefono, telefono_normalizado, whatsapp_url, zona, etiqueta, clienta_fiel, cohorte, origen, estado_contacto, interes, ultima_interaccion, proxima_accion, notas

`Clientas`: id, contacto_id, nombre, telefono, tipo_clienta, limite_credito, puede_fiar, estado, fecha_creacion, notas

`Pedidos`: id, fecha, cliente_nombre, cliente_telefono, productos, subtotal, descuento, total, metodo_pago, modalidad_pago, estado_pedido, origen, direccion, zona, referencia, notas

`Leads`: id, fecha, nombre, telefono, origen, producto_interes, estado, proxima_accion, notas

`Seguimiento`: id, fecha, contacto_id, nombre, telefono, canal, accion, estado, proxima_fecha, responsable, notas

`Pagos Quincenales`: id, pedido_id, contacto_id, cliente_nombre, telefono, fecha_entrega, monto_total, cuota_1, fecha_cuota_1, estado_cuota_1, cuota_2, fecha_cuota_2, estado_cuota_2, saldo_pendiente, estado_plan, notas

`Productos`: id, nombre, categoria, precio, costo_estimado, stock, estado, descripcion, notas

`Inventario`: id, producto_id, producto, movimiento, cantidad, fecha, motivo, responsable, notas

`Campañas`: id, nombre, fecha_inicio, fecha_fin, cohorte, mensaje, canal, estado, resultado, notas

`Historial de Contacto`: id, fecha, contacto_id, nombre, telefono, tipo_interaccion, mensaje, resultado, proxima_accion, responsable, notas

`Config`: clave, valor, descripcion

## Variables de entorno

Crear `.env.local` local o variables privadas en el hosting. No subir este archivo a Git.

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=
GOOGLE_PRIVATE_KEY=
IVETTE_SPREADSHEET_ID=1ePHuSc4_b1UP22hP3Io4MwV_-ofB0_d8dx9-Pg220JI
NEXT_PUBLIC_WHATSAPP_NUMBER=
NEXT_PUBLIC_ADMIN_PROTECTED=false
CRM_BASIC_AUTH_USER=admin
CRM_BASIC_AUTH_PASSWORD=
```

El service account debe tener permiso de editor sobre el Google Sheet privado.

## Importacion del VCF

Script local: `scripts/import-ivette-vcf-to-sheets.js`

Archivo fuente localizado: `Contactos de Ivette Berroa Cosmetica Ancestral.vcf`

Resultado de la primera importacion real:

- Contactos leidos: 2,883
- Contactos validos importables: 2,256
- Telefonos duplicados ignorados: 10
- Contactos insertados: 2,256
- Contactos marcados como `lanzamiento_500`: 500

El script es idempotente: una corrida posterior no inserto duplicados y la corrida final estable quedo en `contactos_insertados=0` y `contactos_actualizados=0`.

## Normalizacion de telefonos y WhatsApp

El importador:

- Extrae `FN`, `N` y `TEL` de cada vCard.
- Normaliza numeros dominicanos de 10 digitos `809`, `829` o `849` a `1XXXXXXXXXX`.
- Mantiene numeros dominicanos de 11 digitos que empiezan con `1`.
- Ignora contactos sin telefono dominicano valido.
- Deduplica por `telefono_normalizado`.
- Genera `whatsapp_url` como `https://wa.me/{telefono_normalizado}`.

## Lanzamiento 500

Las primeras 500 filas contactables quedan con:

- `clienta_fiel=TRUE`
- `cohorte=lanzamiento_500`
- `etiqueta=clienta_fiel`
- `estado_contacto=Pendiente`
- `origen=VCF Ivette`

Validacion posterior: `total_contactos=2256`, `origen_vcf=2256`, `lanzamiento_500_validado=500`, `google_sheets_activo=true`.

## Admin y WhatsApp

`/admin/contactos` lee desde Google Sheets cuando `IVETTE_SPREADSHEET_ID` y las credenciales tienen acceso. Si cae a local, muestra alerta de `Fallback local activo`.

Cada contacto muestra:

- nombre
- telefono dentro del admin
- estado_contacto
- clienta_fiel
- cohorte
- interes
- ultima_interaccion
- proxima_accion
- boton `WhatsApp`
- boton `Copiar`
- boton `Seguimiento`

El mensaje de lanzamiento se codifica en el enlace de WhatsApp. El boton `Copiar` copia el mismo texto.

`/admin/leads` tambien prepara WhatsApp por pedido. Si el pedido usa `Plan Quincenal Clienta Fiel`, el texto menciona confirmacion de entrega y fechas de los dos pagos.

## Seguimiento

Desde Contactos se puede registrar seguimiento manual. El sistema actualiza en `Contactos`:

- estado_contacto
- ultima_interaccion
- proxima_accion
- notas

Tambien crea una fila en `Seguimiento` con:

- contacto_id
- nombre
- telefono
- fecha
- canal=WhatsApp
- accion
- estado
- proxima_fecha
- responsable=Ivette/Marcos
- notas

## Flujo de pedido

1. La clienta agrega productos en `/tienda`.
2. Completa `/checkout`.
3. La API `/api/leads` escribe en `Contactos`, `Clientas`, `Pedidos`, `Leads`, `Seguimiento` e `Historial de Contacto`.
4. Si la modalidad es `Plan Quincenal Clienta Fiel`, tambien escribe en `Pagos Quincenales`.
5. El admin lee los pedidos y contactos desde Google Sheets cuando las variables estan configuradas.

## Plan Quincenal Clienta Fiel

Modelo: fiado maximo a 30 dias, en dos cuotas quincenales.

Si `fecha_entrega = 2026-06-01`:

- `fecha_cuota_1 = 2026-06-16`
- `fecha_cuota_2 = 2026-07-01`

La app calcula:

- `cuota_1 = monto_total / 2`
- `cuota_2 = monto_total - cuota_1`
- `saldo_pendiente = monto_total`
- `estado_plan = Cuota 1 pendiente`

Estados operativos permitidos: Pendiente inicio, Cuota 1 pendiente, Cuota 1 pagada, Cuota 2 pendiente, Completado, Atrasado.

## Confirmar Google Sheets activo

1. Ejecutar `node scripts/check-ivette-sheet-access.js`.
2. Debe devolver `ok=true`.
3. Abrir `/admin/contactos`.
4. No debe aparecer la alerta `Fallback local activo`.
5. Abrir `/admin/contactos?filter=lanzamiento_500`.
6. Debe mostrar la cohorte de lanzamiento.

## Seguridad aplicada

- No se imprimieron contactos completos en consola.
- No se imprimieron telefonos completos en logs.
- No se imprimio `GOOGLE_PRIVATE_KEY`.
- No se copio el VCF a `public`.
- No se genero CSV/XLSX privado en el repo.
- No se uso el Google Sheet de Luma Capilar.
- No se hizo deploy.
- No se hizo `git push`.

## Pendientes antes de deploy publico

- Configurar dominio y variables privadas en hosting nuevo, no en Vercel original.
- Cambiar `NEXT_PUBLIC_ADMIN_PROTECTED=true`.
- Definir `CRM_BASIC_AUTH_PASSWORD` fuerte.
- Confirmar que el service account solo tenga acceso al Sheet de Ivette.
- Probar checkout, admin, WhatsApp y plan quincenal con datos ficticios.
