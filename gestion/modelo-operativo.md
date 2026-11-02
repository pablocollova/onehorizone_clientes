# Modelo operativo de One Horizon

Fecha: 2026-11-02 (Europe/Paris). Autor: Codex. Fuente de negocio: aclaraciones de Pablo en este chat, posteriores a la entrega `2cf4a6e2`. Rama: `codex/t04-operational-integrity`.

Este documento distingue requisitos confirmados, evidencia del código y diseño propuesto. No certifica funcionalidades todavía no implementadas. No autoriza producción, migraciones remotas, cobros ni correos reales.

## Lo que administra la plataforma

**DECIDIDO-USUARIO:** One Horizon coordina servicios y trámites de naturaleza amplia. Debe poder añadir servicios al catálogo y ofrecerlos al cliente sin convertir cada nuevo servicio en un desarrollo independiente. El portal combina seguimiento operativo, presupuestos/documentos y situación económica; no debe reducirse a una lista de facturas.

**VERIFICADO-CÓDIGO:** los tres tipos de Invoice ya coinciden nominalmente con los tres casos descritos. Esa coincidencia no demuestra que el saldo los trate correctamente: el dashboard actual suma todos los tipos. ServiceRecord representa un trabajo simple; no tiene catálogo, presupuesto versionado, aceptación ni planificación. Payment exige invoiceId y carece de estados, actor, imputaciones múltiples y conciliación. Document tiene referencias, pero no un flujo privado completo. Contratos y recuperación de contraseña todavía no son módulos operativos.

## Tres modalidades y dos destinatarios del dinero

| Caso confirmado | Ejemplo ficticio | Qué debería ver el cliente | Efecto en lo adeudado a One Horizon |
| --- | --- | --- | --- |
| Pago directo al proveedor (`VENDOR_DIRECT`) | Factura de luz de 100 EUR que paga el cliente a la eléctrica | Proveedor, documento, vencimiento, estado del pago directo | El importe de la luz no es deuda a One Horizon. Si existe honorario de gestión, se registra separado |
| One Horizon paga al proveedor (`VENDOR_REBILL`) | One Horizon paga 100 EUR de luz por cuenta del cliente | Factura original, acuerdo/modalidad, desembolso y reembolso pendiente; honorario separado si corresponde | Los 100 EUR son reembolsables según el acuerdo. Falta registrar si One Horizon ya desembolsó, cuánto y cuándo; cargar el PDF no prueba el desembolso |
| Honorario propio (`ONEHORIZON_FEE`) | Gestión por 30 EUR | Concepto del servicio y documento emitido | Es deuda por el servicio de One Horizon |

Ejemplo conjunto: luz pagada directamente por cliente 100 EUR + honorario 30 EUR → deuda con One Horizon 30 EUR. Si One Horizon adelantó esos 100 EUR y además cobra 30 EUR → deuda con One Horizon 130 EUR. Un pago confirmado de 50 EUR aplicado a esa deuda deja 80 EUR. Los ejemplos definen aceptación futura; no son datos reales ni pruebas del sistema actual.

**PROPUESTO:** separar documento de factura, obligación de cobro y desembolso al proveedor. Una factura externa puede existir sin generar una cuenta por cobrar de One Horizon. Reembolso y honorarios deben enlazarse para dar contexto, sin contar dos veces la factura original y su recuperación. El momento exacto de reconocer un reembolso antes de que One Horizon pague depende del acuerdo con el cliente; no se presume por el enum existente.

## Cuenta corriente: pago, confirmación e imputación

**DECIDIDO-USUARIO:** se necesitan pagos en proceso, en revisión y confirmados, con imputaciones. Ambos administradores —One Horizon y cliente— pueden confirmar e imputar en su ámbito. La segunda aclaración de Pablo descarta la propuesta de reservar estas dos acciones exclusivamente a One Horizon. Un cliente no accede ni modifica otra empresa.

**PROPUESTO para implementación:**

1. El pago registra empresa, moneda, importe, fecha, método, referencia, comprobantes, destinatario (One Horizon o proveedor), estado y autor.
2. El estado pasa de **En proceso** a **En revisión** y a **Confirmado**. Rechazo, anulación y reversión se modelan aparte; se definen antes de habilitarlos. La confirmación guarda actor, rol, fecha y evidencia. No significa por sí sola que una integración bancaria comprobó el ingreso.
3. La imputación aplica parte de un pago confirmado a una o varias obligaciones de la misma empresa, moneda y destinatario. Una obligación puede recibir varios pagos parciales. Confirmar un pago e imputarlo son acciones diferentes; un comprobante sin confirmar no cancela deuda.
4. La conciliación indica qué evidencia bancaria/manual se contrastó, por quién y cuándo. Se muestra aparte de la confirmación del usuario, sin ocultar que el cliente puede confirmar. Los permisos detallados de conciliación y sus discrepancias quedan propuestos; no se inventa una prohibición de confirmar para CLIENT_ADMIN.
5. El saldo separa deuda, pagos confirmados aplicados, pagos en proceso/revisión y dinero confirmado sin aplicar. Nunca se resta dos veces un pago por aparecer en el movimiento y en varias imputaciones. Los pagos a proveedores no se mezclan con ingresos de One Horizon.

Los cálculos se derivan de registros y eventos persistidos, con control de concurrencia e idempotencia. Confirmación/imputación deben ser atómicas y resistir dobles clics y reintentos. La suma imputada no puede superar el pago ni la deuda aplicable. Qué hacer con dinero excedente (crédito sin aplicar, devolución u otra regla) sigue por decidir; no se interpreta como aceptación de la pregunta inicial sobre rechazar todo exceso.

Las correcciones de movimientos confirmados deben conservar historial y efecto inverso, en lugar de borrar evidencia o editar importes silenciosamente. Cambiar un PDF no modifica un movimiento confirmado. El estado de una factura, el de su pago, el de un trabajo y el de su conciliación son dimensiones separadas.

## Monedas y equivalentes

**DECIDIDO-USUARIO:** EUR, GBP y USD. Cuando el original está en GBP o USD se muestra claramente su moneda y, complementariamente, el equivalente en EUR. Pablo corrigió expresamente la referencia inicial a equivalente en dólares.

**PROPUESTO:** mantener originales e imputaciones en la moneda de la obligación; el equivalente informativo no transforma el pago ni mezcla las cuentas por moneda. Guardar tipo de cambio, fuente, fecha efectiva, fecha de registro, autor y criterio de redondeo. La cotización aplicada a una operación confirmada se conserva, aunque cambie una cotización posterior. Para presentar un total equivalente, mostrar su fecha y carácter informativo; nunca sumar 100 GBP + 100 USD como 200 EUR.

Sin tipo de cambio conocido, indicar **Equivalente EUR pendiente**, sin mostrar cero ni inventar una tasa. La primera opción técnica es carga manual documentada; fuente de cotización y fecha aplicable siguen propuestas. Importes en unidades menores enteras y tasas decimales exactas; no usar floats para importes ni recalcular históricos con una tasa actual. Conversión para liquidar una deuda en otra moneda, comisiones y diferencias de cambio requieren reglas propias: el pedido de mostrar un equivalente no las autoriza por sí solo.

## Servicio, presupuesto y trabajo

**DECIDIDO-USUARIO:** One Horizon puede crear nuevas ofertas de servicios visibles para el cliente. Caso de electricista: necesidad del cliente → proveedor realiza presupuesto → One Horizon lo presenta → cliente acepta → se acuerda fecha → se realiza el trabajo → se incorpora factura.

**PROPUESTO:**

| Recurso | Responsabilidad y relación |
| --- | --- |
| Catálogo de servicios | Oferta configurable, descripción, visibilidad y disponibilidad. Desactivar una oferta no borra trabajos ya contratados. No obliga a tener un precio fijo |
| Solicitud de servicio | Empresa y establecimiento, necesidad, solicitante, responsable One Horizon y seguimiento. Puede existir sin presupuesto ni factura |
| Presupuesto y versiones | Proveedor, alcance, partidas, moneda, validez y anexos privados. Solo versión publicada puede aceptarse; una revisión exige nueva versión y nueva aceptación |
| Aceptación | Cliente_admin que decide, versión exacta, fecha y decisión; lectura del presupuesto no equivale a aceptación. Un user lector no acepta |
| Trabajo | Responsable, proveedor, fechas previstas/acordadas/reales, estado y evidencia; relacionado con solicitud/presupuesto aceptado. La modalidad de cobro determina cómo se vincula la factura |
| Facturación | Honorarios propios, pago directo o reembolso. Aceptar un presupuesto no implica automáticamente emitir ni pagar una factura |
| Contratación y contratos | Condiciones, vigencia, versiones, documentos y relación con servicios. Firma electrónica y renovaciones automáticas no se dan por implementadas ni aprobadas |

Estados iniciales propuestos, con etiquetas de negocio: **Solicitado, En evaluación, Presupuesto disponible, Aceptado, Programado, En ejecución, Finalizado, Cancelado**. Los estados del presupuesto (borrador/publicado/aceptado/rechazado/vencido) y de facturación se almacenan por separado. Falta definir responsables válidos, reprogramación, cambios tras aceptación y contratos recurrentes. No ampliar un único ServiceRecord con un booleano por cada nuevo servicio.

## Roles y ámbitos

| Rol de negocio confirmado | Identificador compatible | Ámbito | Acciones |
| --- | --- | --- | --- |
| One Horizon admin | PLATFORM_ADMIN | Global | Administración y operación de la plataforma |
| One Horizon user | PLATFORM_USER (nuevo) | Global | Lectura operativa; sin altas, edición, invitaciones ni confirmaciones operativas |
| Cliente admin | CLIENT_ADMIN | Su empresa | Administración de su portal, aceptación de presupuestos y confirmación/imputación de pagos propios conforme al alcance indicado |
| Cliente user | CLIENT_USER | Su empresa | Lectura operativa |

El ámbito siempre lo resuelve el servidor desde la identidad vigente; nunca un clientId enviado por el navegador. No se otorgan permisos globales por contener la palabra admin. Los futuros recursos necesitan autorización por objeto y por acción, además del rol. Los lectores conservan operaciones de su propia sesión y derechos personales de privacidad: lectura operativa no implica prohibir logout o rectificar sus propios datos.

**Implementado en esta entrega:** cuarto rol, lecturas administrativas existentes para ambos roles internos, escrituras solo para PLATFORM_ADMIN, invitación interna solo por PLATFORM_ADMIN y sin empresa asociada, guards de interfaz y ausencia de controles de edición para el lector. Los permisos nuevos de presupuestos/pagos descritos arriba son alcance confirmado, pero los endpoints correspondientes todavía no existen.

## Alta, activación y recuperación

**DECIDIDO-USUARIO:** el administrador crea la cuenta y se envía invitación al correo del usuario para definir su contraseña; el login debe permitir recuperación por correo.

La activación actual ya usa enlace aleatorio, hash en DB, vencimiento y consumo de un solo uso. El usuario establece su contraseña; conocer su email no debe activar la cuenta. No se necesita distribuir una contraseña compartida por el administrador. D11 y D12 siguen abiertas: el nuevo relato no decide la exposición de inviteLink ni cómo corregir una empresa equivocada.

**Pendiente de implementar:** recuperación con tokens separados de la invitación, hash, vencimiento, un solo uso, respuesta pública uniforme, limitación de solicitudes y revocación de sesiones al cambiar contraseña. No usar un reset para activar usuarios invitados o reactivar bajas. No registrar enlaces/contraseñas en logs. La integración se prueba con buzón/salida local ficticia; ninguna prueba envía correo real. La autorización para añadir el flujo no autoriza envíos reales en esta sesión.

## Modelo técnico objetivo y transición

**PROPUESTO, no migración ya aplicada:** conservar stack y APIs existentes; añadir PaymentReceipt, PaymentAllocation, Receivable, VendorDisbursement, ExchangeRateSnapshot, ServiceOffering, ServiceRequest, Quote/QuoteVersion/QuoteDecision, WorkOrder y ContractVersion (nombres orientativos). Cada recurso de empresa lleva clientId, relaciones consistentes, actores y timestamps. Evitar duplicar el saldo como un campo manual editable.

La transición debe mantener lecturas/relaciones actuales. Los Payment históricos no pueden declararse confirmados ni conciliados automáticamente: el modelo viejo no contiene esa evidencia. Tampoco todo VENDOR_REBILL histórico demuestra un desembolso. Preparar inventario y mapeo con revisión humana, sin ejecutarlo sobre datos reales durante desarrollo. Nuevas restricciones solo después de conocer cómo tratar datos históricos inconsistentes; fallar de forma visible cuando falte evidencia.

Documentos y contratos: almacenamiento privado, identificadores opacos, autorización al descargar, sin storagePath público; relaciones con la misma empresa y versionado de contratos/presupuestos aceptados. Los documentos adjuntos no conceden permisos ni cambian estados económicos por sí mismos.

## Entregas siguientes y pruebas de aceptación

1. **Roles y base operativa:** cerrar cuarto rol y regresión (entrega actual). No habilitar privilegios nuevos por defecto a usuarios existentes.
2. **Cuenta corriente y pagos:** representar destinatarios, estados y asignaciones; implementar UI de confirmación/imputación para ambos administradores según ámbito, historial y saldos por moneda; conversión informativa con evidencia de cotización. Corregir dashboard y estado de cuenta para reemplazar ejemplos sin fabricar saldos.
3. **Documentos privados:** carga, organización, descarga y pruebas de empresa ajena; vincular evidencia de pago y factura. El documento de presupuesto debe poder verse antes de aceptar.
4. **Catálogo y circuito de trabajo:** oferta → solicitud → presupuesto versionado → decisión → fecha acordada → trabajo → facturación; responsables y contratos según definición.
5. **Acceso y recuperación:** completar reset, mensajes en lenguaje comprensible, entrega local de correo y revisión de D11/D12 por separado. Puede implementarse en paralelo lógico sin delegar agentes ni autorizar correos reales.

Casos obligatorios: los tres escenarios de luz/honorarios sin doble deuda; pagos parciales y múltiples imputaciones; pago en revisión sin bajar deuda; confirmación por ambos administradores con autoría; operación simultánea que no sobregira; cliente B no ve/acepta/imputa recursos de A; user lector no modifica; presupuesto aceptado no cambia silenciosamente; fecha de trabajo no implica finalización; GBP/USD conservan originales y equivalente EUR trazable; falta de tasa explícita; tokens de activación/reset aislados y sesiones antiguas revocadas.

Las reglas aún abiertas (reconocimiento de reembolso previo al desembolso, excesos/devoluciones/reversiones, fuente de cambio, conciliación/discrepancias, vigencias/contratos) se registran como propuestas. Se avanza en lo independiente y se pregunta con ejemplos de negocio al llegar a cada comportamiento, sin pedir que Pablo elija nombres internos de enums.
