# HOTFIX 11 — Logo Final y Operación de Ventas/Pagos

Este documento resume los cambios realizados, la configuración de la base de datos de Google Sheets, las reglas de negocio implementadas para las operaciones de cobro y despacho, y los resultados de las pruebas de validación.

## 1. Ajustes del Logotipo

Para resolver el problema del margen transparente excesivo en el archivo original `/logo.png`, se recortaron los márgenes no deseados y se guardó la imagen optimizada como:
* `public/brand/ivette-logo-ui.png`

Esta versión recortada de la interfaz de usuario se aplicó con contenedores circulares (`rounded-full border-2 border-[#c5a059] bg-[#2a3b26] overflow-hidden`) y los siguientes factores de escala CSS en los componentes clave:
* **Header:** Contenedor circular con escala interna `scale-[1.35]` (`StoreHeader.tsx`)
* **Hero:** Contenedor circular con escala interna `scale-[1.3]` (`src/app/page.tsx`)
* **Footer:** Contenedor circular con escala interna `scale-[1.25]` (`StoreFooter.tsx`)

Esto hace que el isotipo del logotipo de Ivette Berroa destaque visualmente dentro del medallón de fondo en todos los tamaños de pantalla (Desktop, Tablet, Mobile) y navegadores (QA en Safari iOS incluido).

---

## 2. Estructura y Migración de Google Sheets (No Destructiva)

La base de datos de Google Sheets de Luma Boutique OS se migra de forma pasiva y automática cuando el administrador carga la base. Las cabeceras del Google Sheet se actualizan agregando únicamente los campos faltantes al final del archivo sin alterar las columnas ni los datos existentes.

### Columnas Operativas de Pedidos
Nuevos campos operativos agregados a la hoja de **Pedidos**:
* `fecha_confirmacion` (fecha en la que el pedido pasa de "Nuevo"/"Contactado" a "Confirmado")
* `fecha_pago_completo` (fecha en la que el pedido se liquida en su totalidad)
* `fecha_entrega` (fecha en la que el pedido es entregado físicamente)
* `estado_pago` (mantiene estados de abono como: `Pendiente`, `Cuota 1 pagada`, `Pagado`)
* `saldo_pendiente` (monto que resta por cobrar)
* `proxima_fecha_pago` (fecha límite del siguiente cobro esperado)

### Columnas Operativas de Pagos Quincenales
Nuevos campos operativos agregados a la hoja de **Pagos Quincenales**:
* `fecha_pago_cuota_1` (fecha del abono de la primera cuota)
* `fecha_pago_cuota_2` (fecha del abono de la segunda cuota)

---

## 3. Acciones de Venta y Endpoint API (`/api/leads/update`)

Se creó un endpoint centralizado de actualización que valida y procesa estrictamente las siguientes 7 acciones permitidas:

1. **`confirmar_venta`**:
   * Transiciona `estado_pedido` a `"Confirmado"`.
   * Registra `fecha_confirmacion` actual.
   * Si la modalidad de pago es un Plan Quincenal (por ejemplo, *Plan Quincenal Clienta Fiel*), inicializa el registro del plan de cobro quincenal de 2 cuotas en la hoja de **Pagos Quincenales** con un saldo igual al total del pedido, y establece el primer vencimiento a 15 días y el segundo a 30 días.
   * El estado del pago inicial se define como `"Cuota 1 pendiente"`.
   * **Seguridad:** No marca el pedido como pagado de forma automática al confirmar.

2. **`registrar_pago_completo`**:
   * Cambia `estado_pago` a `"Pagado"`.
   * Ajusta `saldo_pendiente` a `0`.
   * Establece `fecha_pago_completo` con la fecha seleccionada por el usuario.
   * Conserva el estado de entrega actual (`Confirmado`, `Preparando` o `Entregado`) sin alterarlo automáticamente.
   * Si existía un Plan Quincenal asociado, lo marca como `"Completado"` y define ambas cuotas como pagadas.

3. **`registrar_cuota_1`**:
   * Valida un monto positivo recibido.
   * Actualiza el plan en **Pagos Quincenales**, definiendo `estado_cuota_1` como `"Pagada"` con la fecha correspondiente.
   * Calcula el nuevo saldo: `saldo_pendiente = total - monto_recibido`.
   * Transiciona el estado del plan quincenal a `"Cuota 2 pendiente"` y el estado de pago del pedido a `"Cuota 1 pagada"`.

4. **`registrar_cuota_2`**:
   * Valida que no se registre la cuota 2 antes de la cuota 1 a menos que sea forzado explícitamente.
   * Define `estado_cuota_2` como `"Pagada"`.
   * Ajusta `saldo_pendiente` a `0`.
   * Cambia el estado del plan a `"Completado"` y el estado de pago del pedido a `"Pagado"`.

5. **`preparando`**:
   * Cambia el estado del pedido a `"Preparando"`.

6. **`entregado`**:
   * Transiciona el estado del pedido a `"Entregado"` y establece la `fecha_entrega`.

7. **`cancelar`**:
   * Anula el pedido transicionando su estado a `"Cancelado"`. Si el pedido tiene un plan quincenal activo, cancela el plan de cobranza.

Cualquier otra acción es rechazada inmediatamente con un error descriptivo HTTP 400 y no escribe en Sheets.

---

## 4. Historial de Contacto y Seguridad de Datos

* **Trazabilidad:** Cada una de las 7 acciones operativas escribe un registro en la hoja de **Historial de Contacto** (`Historial de Contacto`), registrando la fecha del movimiento, el ID del contacto, el tipo de interacción, un mensaje explicativo y notas.
* **Privacidad de Datos (Prohibición de fugas):** Para proteger la información del cliente, los números de teléfono se enmascaran en los logs de la terminal (ejemplo: `809***123`) para evitar la visualización completa en consola, archivos de salida o logs de producción.

---

## 5. Panel de Control y Modales en UI Admin

* Se habilitaron botones de operación dinámicos y contextuales en `/admin/leads` (en el detalle lateral del pedido y tabla principal):
  * **Confirmar Venta** (Pedidos nuevos/contactados)
  * **Registrar Pago Completo** (Pedidos con saldo pendiente)
  * **Registrar Cuota 1** / **Registrar Cuota 2** (Pedidos en modalidad Plan Quincenal)
  * **Marcar Preparando** / **Marcar Entregado** / **Cancelar Pedido**
* **Modales de Confirmación Operativos:** Antes de procesar un abono o liquidación, se despliega un diálogo que requiere:
  1. Confirmar el nombre del cliente y código de pedido.
  2. Ajustar el monto cobrado.
  3. Indicar la fecha real de la transacción.
  4. Agregar una nota opcional de seguimiento.
  5. **Advertencia de Desalineación:** Si el monto ingresado no coincide exactamente con el saldo o la cuota esperada, el sistema permite guardar pero solicita confirmación a través de un aviso destacado en el modal.
  6. **Validación:** No se permiten montos vacíos o negativos.
* **WhatsApp Quick Actions:** Botones listos para enviar recordatorios y confirmaciones directamente a las clientas usando plantillas formales personalizadas con su primer nombre.

---

## 6. Dashboard y KPIs Reales

Los indicadores del Dashboard en `/admin/dashboard` se calculan y consolidan dinámicamente mediante fórmulas acumulativas en tiempo real sobre los datos leídos de Google Sheets:
* **Total Vendido:** Suma de montos totales de todos los pedidos activos (`Confirmado`, `Preparando`, `Entregado`).
* **Saldo Pendiente:** Suma de los saldos restantes activos no cancelados.
* **Pedidos Pagados / Pendientes de Pago:** Conteo según el campo `estado_pago`.
* **Planes Quincenales Activos:** Planes quincenales en curso con cuotas pendientes.
* **Cuotas Atrasadas:** Contabiliza cuotas vencidas según la fecha límite.
* **Entregados / Cancelados:** Conteo estricto por estatus de entrega.

---

## 7. Pruebas de Validación Operativa y Linting

### Resultado de Linter y Compilación
* `npm run lint` finalizó exitosamente sin errores de TypeScript ni declaraciones de tipo sueltas (`any`).
* `npm run build` compiló el bundle de producción de Next.js correctamente.

```bash
=== INICIANDO VALIDACIÓN DE FLUJOS DE VENTA (HOTFIX 11) ===

--- TEST A: FLUJO PAGO COMPLETO ---
1. Creando pedido de prueba A...
=> Pedido A creado con ID: PED-1780104651607
2. Confirmando venta de pedido A...
=> Confirmación A: estado_pedido = Confirmado, estado_pago = Pendiente
3. Registrando pago completo de pedido A...
=> Pago A: estado_pago = Pagado, saldo_pendiente = 0
4. Marcando pedido A como Preparando...
=> Preparando A: estado_pedido = Preparando
5. Marcando pedido A como Entregado...
=> Entregado A: estado_pedido = Entregado, fecha_entrega = 2026-05-30
=> TEST A COMPLETADO CON ÉXITO.

--- TEST B: FLUJO PLAN QUINCENAL ---
1. Creando pedido de prueba B...
=> Pedido B creado con ID: PED-1780104669243
2. Confirmando venta de pedido B...
=> Confirmación B: estado_pedido = Confirmado, estado_pago = Cuota 1 pendiente, saldo_pendiente = 6000
3. Registrando pago de Cuota 1 de pedido B...
=> Cuota 1 B: estado_pago = Cuota 1 pagada, saldo_pendiente = 3000
4. Registrando pago de Cuota 2 de pedido B...
=> Cuota 2 B: estado_pago = Pagado, saldo_pendiente = 0
=> TEST B COMPLETADO CON ÉXITO.

=== VALIDACIÓN COMPLETA EXITOSA ===
```

Los registros en la terminal del servidor demuestran que los teléfonos fueron enmascarados correctamente para la privacidad de los datos:
```
[Interaction Log] Contact: Test A - Pago Completo, Phone: 180***233, Action: confirmar venta
[Interaction Log] Contact: Test A - Pago Completo, Phone: 180***233, Action: pago completo
[Interaction Log] Contact: Test A - Pago Completo, Phone: 180***233, Action: preparando
[Interaction Log] Contact: Test A - Pago Completo, Phone: 180***233, Action: entregado
[Interaction Log] Contact: Test B - Plan Quincenal, Phone: 182***566, Action: confirmar venta
[Interaction Log] Contact: Test B - Plan Quincenal, Phone: 182***566, Action: cuota 1
[Interaction Log] Contact: Test B - Plan Quincenal, Phone: 182***566, Action: cuota 2
```
