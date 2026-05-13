# Fase 2.6A - Plan de Escritura Controlada

## 1. Estado actual

El CRM se mantiene en modo de solo lectura real desde Google Sheets. Las rutas principales consumen getters en `src/lib/crm-data/`, y esos getters usan el cliente de Google Sheets con alcance `spreadsheets.readonly`.

No hay escritura activa, Server Actions de mutacion ni formularios que modifiquen datos.

## 2. Primera mutacion recomendada

La primera mutacion recomendada es crear un nuevo Lead mediante append controlado en la hoja `Leads`.

## 3. Por que crear lead es mas seguro

Crear un lead nuevo es menos riesgoso que editar registros existentes porque no sobrescribe filas actuales, no depende de encontrar una fila exacta por ID para actualizar, y permite auditar el resultado como una nueva fila aislada.

Editar registros existentes debe venir despues, cuando exista trazabilidad de cambios, control de concurrencia y validacion fuerte de fila objetivo.

## 4. Columnas de Leads que se llenarian

La vista previa de escritura prepara una fila para `Leads!A:AE`:

- A: ID sugerido
- B: fecha de creacion
- C: nombre
- D: email
- E: telefono
- F: fuente
- H: oportunidad
- I: presupuesto
- L: estatus inicial, alineado con `pipelineStage`
- N: proximo contacto
- O: asesor
- P: notas
- U: ID de propiedad de interes
- V: nombre de propiedad de interes
- W: tipo de cliente
- X: tipo de operacion
- Y: zona de interes
- Z: temperatura
- AB: etapa de pipeline
- AC: probabilidad

Las columnas no incluidas se mantienen vacias en la vista previa para respetar la estructura actual.

## 5. Generacion de ID

El ID sugerido usa el conteo actual de leads mas uno, con formato `VR-0001`, `VR-0002`, etc.

Antes de escritura real conviene reemplazar el conteo simple por una lectura del maximo ID existente, para reducir riesgo cuando existan filas eliminadas o IDs no secuenciales.

## 6. Validaciones minimas

Antes de escribir se debe validar:

- nombre requerido
- telefono o email requerido
- fuente requerida
- etapa de pipeline requerida
- probabilidad numerica entre 0 y 100 cuando venga informada

## 7. Permisos pendientes

Cuando llegue la fase real de escritura, la Service Account debera tener permiso de editor en el Google Sheet.

No se debe cambiar ese permiso en esta fase.

## 8. Riesgos

- duplicados por telefono, email o nombre similar
- IDs mal generados si hay filas eliminadas o datos historicos no secuenciales
- columnas movidas en la hoja sin actualizar el contrato
- escritura parcial si la API falla despues de enviar una peticion
- diferencias entre campos visibles del formulario y columnas reales de Sheets

## 9. Plan de rollback

- crear backup del Sheet antes de la primera escritura real
- probar primero en una hoja de prueba con la misma estructura
- registrar cada append en consola durante pruebas
- conservar el payload de preview y la respuesta de Google Sheets durante QA
- validar manualmente la fila insertada antes de habilitar escritura para uso normal
