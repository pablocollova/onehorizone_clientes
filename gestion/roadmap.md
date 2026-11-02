# Roadmap priorizado (PROPUESTO)

El orden expresa dependencias, no fechas prometidas. Responsable de aceptación de negocio: Pablo. Implementador por tarea: asignar mediante protocolo IA. No se autoriza despliegue por aprobar un diseño.

| Fase | Alcance | Dependencia | Criterio de salida |
| --- | --- | --- | --- |
| 0. Base segura | Mapear entornos y automatismos; DB local aislada; reproducir H01/H02/H11; corregir permisos, revocación y barreras test | Diagnóstico | Usuario A no reasigna invitación B; token previo a baja/rol cambiado deja de dar permisos; test nunca apunta DB real; regresión existente aprobada |
| 1. Captación B2B | Consulta persistida o entregada con confirmación real, errores y reintento; responsable operativo; contenido B2B y Family secundario | Entorno aislado; decisión de destino de consulta | Envío de prueba llega a destino de test; fallos conservan datos y no muestran éxito; sin emails a clientes reales |
| 2. Veracidad financiera | Conectar estado de cuenta, eliminar tendencias inventadas, definir saldo, pagos parciales y monedas; H03 | Fase 0, reglas contables acordadas | Factura 100 EUR con pago 40 muestra pendiente 60; otra empresa no ve datos; monedas no se suman indiscriminadamente |
| 3. Operación cliente | Lectura/gestión de establecimientos y documentos con almacenamiento privado; seguimiento de servicios | Permisos y relaciones validados | Cliente ve solo sus locales/documentos; descarga ajena denegada; errores y vacíos resueltos; no placeholders en recorridos entregados |
| 4. Backoffice completo | Contratos, responsables, tareas, fechas, proveedores y renovaciones | Modelo funcional validado; fases 2/3 | Servicio con cliente/local, responsable, estado, vencimiento y trazabilidad; pruebas de autorización por objeto |
| 5. Preparación de salida | QA completo, móvil/accesibilidad, SEO, privacidad, observabilidad, backup y ensayo de restauración | Módulos de entrega cerrados | Evidencia reproducible de QA; commit/entorno/migraciones y rollback revisables; aprobación explícita de Pablo antes de desplegar |

Family puede mejorar en paralelo editorialmente una vez estabilizada la base, sin competir con la consulta de negocio. Integraciones de pago, CRM, firma o automatizaciones quedan por decidir después de definir necesidad y alcance. Ninguna fecha o integración es un compromiso aprobado.

## Actualización de alcance por Pablo (2026-11-02)

Consultar D13-D18 y [modelo operativo](modelo-operativo.md) antes de continuar fases 2-4. El objetivo financiero distingue pagos directos a proveedores, desembolsos reembolsables de One Horizon y honorarios, con confirmación/imputación por ambos administradores y equivalente EUR para GBP/USD. El circuito servicio→presupuesto→aceptación→fecha→trabajo→factura y cuarto rol interno son parte del alcance. Las condiciones de saldo/conciliación antes propuestas no quedaron aprobadas por responder las aclaraciones.

## Avance de fase financiera — 2026-11-02

Primera entrega T06 local: recorrido real para ambos administradores, pago parcial y múltiples imputaciones, aislamiento, separación proveedor/One Horizon, estados y saldos por moneda con equivalente EUR manual. Reembolsos reconocidos solo con adelanto completo registrado por One Horizon. T24 mantiene conciliación histórica, correcciones/reversiones/devoluciones; fase documental T08 sigue abierta. Ver cuenta-corriente-pagos.md y evidencia final en comunicación. Sin despliegue ni migraciones remotas.
