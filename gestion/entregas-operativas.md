# Entregas operativas — 2026-11-02, Codex

Base leída: `fix/t16-email-normalization` @ `70190d86f4ba7b5c7e4b27ddb65e97a840bfb05b`, coincidente con origin. Rama local: `codex/t04-operational-integrity`. Esta planificación concreta el pedido de Pablo del 2 de noviembre; no aprueba decisiones pendientes ni autoriza publicación o despliegue.

## Alcance acordado y estado real

El pedido autoriza completar administración y portal con datos reales: empresas/usuarios/roles/locales; facturas y archivos privados; pagos parciales y conciliación manual; estado de cuenta por moneda; servicios/trabajos y sus relaciones; documentos/contratos; resumen global y portal aislado por empresa. Cobros y correos reales no autorizados. Solo base local nueva y ficticia.

La base contiene CRUD parcial de clientes y facturas/trabajos, listado de usuarios e invitaciones y lectura de locales. No contiene CRUD operativo completo de empresas, usuarios o locales. El administrador entra a Clientes, sin resumen global visible. El dashboard cliente lee API pero presenta tendencias constantes y un saldo que suma importes sin pagos ni separación de monedas. Estado de cuenta contiene ejemplos; documentos, archivos, establecimientos y pagos apuntan a PlaceholderPage. Document y Payment son modelos, no flujos completos. No hay catálogo, contratación, tareas, responsables ni contratos operativos dedicados.

## Secuencia verificable

| Entrega | Trabajo autorizado | Aceptación y dependencias |
| --- | --- | --- |
| 1 — T04/H03 + resumen inicial | Validar altas/ediciones de facturas y trabajos, relaciones actuales e inversas, errores de entrada y filtros; resumen global de conteos | Datos cruzados rechazados sin escritura; roles cliente no escriben ni acceden al resumen; regresión backend y frontend. Implementada en esta rama, pendiente revisión. No equivale al cierre de seguridad del producto |
| 2 — T06 y pagos | Movimientos, saldos por moneda, registro manual y pagos parciales, pendientes, conciliación manual; eliminar métricas ficticias | Factura 100/pago 40/pendiente 60; no mezclar divisas; no leer/escribir otra empresa. Confirmar política de estados, excesos, anticipos, reversiones y edición financiera antes de implementar esos comportamientos |
| 3 — T08 y establecimientos/documentos | Gestión de locales, carga privada, lista, descarga autorizada; vincular facturas/documentos | Subida/descarga propia, denegación ajena, sin rutas de almacenamiento en respuestas; tamaños/tipos y errores; confirmar facultades de carga/edición y retención. Contratos requieren definición adicional |
| 4 — servicios y contratos | Lectura cliente y seguimiento de trabajos, responsables, plazos, proveedores y relación con facturación; servicios contratados/contratos según definición | Ciclo operativo con estados acordados, responsables válidos, aislamiento y trazabilidad. T12 define catálogo y diferencia contratación de trabajo realizado |
| 5 — integración y revisión | Completar vistas globales/cliente desde módulos anteriores, permisos y recorridos de principio a fin | Pruebas financieras/documentales completas, E2E local, revisión cruzada, vacíos/errores/móvil. No autoriza despliegue |

La secuencia es propuesta técnica dentro del alcance autorizado; cada estado se informa con evidencia, sin prometer módulos completos por anticipado.

## Entrega 1: comportamiento implementado

- `saveOperation` concentra validación y escritura dentro de una transacción Serializable. Todos los POST/PATCH administrativos de facturas/trabajos lo usan. Conflictos de serialización o FK responden 409 y requieren recargar/reintentar.
- Cliente, establecimiento, proveedor y factura deben existir; establecimiento y factura deben pertenecer al cliente final. PATCH valida también campos conservados. Los proveedores son globales en el modelo actual: no se inventa una propiedad por empresa.
- Al cambiar empresa de una factura, documentos/trabajos vinculados no pueden permanecer en otra. Se bloquean cambios de empresa, moneda o total si hay pagos; es una protección provisional hasta contar con un flujo financiero de correcciones. Número y demás campos permitidos conservan edición; no se define aún conciliación ni máquina de estados contable.
- Céntimos enteros JSON entre 0 y 2147483647, sin coerciones; moneda con tres letras mayúsculas (formato, no catálogo ISO completo), enums existentes, fechas válidas y título no vacío. Los contratos aceptan fechas de calendario o timestamps ISO cuyo día UTC coincide con el día declarado. No se permite simular crédito con importes negativos.
- Validación de filtros enum y tipo de query en listados admin: entradas inválidas devuelven 400.
- `/api/admin/overview` y `/app/admin/overview` muestran conteos reales y fecha de consulta. Lectura consistente RepeatableRead; acceso solo PLATFORM_ADMIN. Menú Overview y entrada de `/app/admin` conectados; los accesos históricos directos a Clientes se conservan. Conteo de documentos representa registros, no verificación de archivos descargables. Facturas pendientes se cuentan por estados existentes; no son un saldo conciliado.

## Decisiones pendientes

D11/T15 y D12/T19 continúan sin aprobación; los enlaces de invitación y el flujo de corrección de empresa no se modifican. T14 requiere preparación de salida porque Railway aplica migraciones al iniciar. No se autoriza esa salida.

Consulta enviada a Pablo: reglas iniciales de deuda por ISSUED/OVERDUE, pagos contra factura en su moneda, rechazo de excesos y tratamiento de borradores/canceladas; responsabilidades/estados de servicios y contratos y permisos documentales. Las reglas preguntadas siguen propuestas hasta recibir respuesta. Anticipos, notas de crédito, impuestos/facturación fiscal, devoluciones, tipos de cambio, retención y vigencias necesitan definición; no se deducen del schema.

## Límites técnicos

No hay migraciones nuevas en esta entrega. Las siete anteriores solo se aplicaron a una base de pruebas nueva en loopback. Las comprobaciones de integridad cubren las escrituras HTTP actuales, no una garantía contra SQL directo o futuros handlers que omitan el servicio. No se repararon ni inspeccionaron datos reales históricos. Descarga privada, pagos/conciliación y estado de cuenta siguen pendientes de implementación y no cuentan como validados por las pruebas de relaciones/confidencialidad de esta entrega.

Rama sin publicar. Ambos vercel.json excluyen exactamente su nombre, pero antes de cualquier push se deben volver a comprobar las integraciones y ramas remotas; el estado histórico de Railway/main no basta. No se ejecutaron correos, cobros, migraciones remotas, merge o despliegue.
