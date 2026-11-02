# Cuenta corriente y pagos manuales

Fecha: 2026-11-02. Autor: Codex. Rama local `codex/t04-operational-integrity`, base de esta entrega `80024fddd6785295010e2c993232b1f560eee363`. Alcance autorizado por Pablo: estados, confirmación e imputación por ambos administradores, saldos por moneda y equivalente EUR. D13/D15/D18 son las fuentes de negocio; D11/D12 no se modifican.

## Entrega implementada, sin desplegar

Cuenta corriente y pagos consultan datos reales en `/app/statement` y `/app/payments`. La consola interna añade `/app/admin/accounts`, con selección explícita de empresa. Ambos roles internos leen; los administradores de One Horizon y de cliente registran, revisan, confirman e imputan dentro de su ámbito. Los dos roles user no escriben. La empresa del cliente se obtiene del servidor y no puede sustituirse enviando otro clientId.

El dashboard cliente usa los mismos saldos por moneda y destinatario; se retiran tendencias constantes y el falso saldo único en euros. Conserva documentos recientes. Se retiran filas de ejemplo y botones sin implementación del estado de cuenta. La cabecera deja de mostrar Horizon Corp/Premium Client como valores fijos.

## Dinero, estados e imputación

- `PaymentReceipt` registra empresa, importe original, EUR/GBP/USD, destinatario, proveedor si corresponde, fecha declarada del pago, referencia, autor y clave de solicitud. Nace **En proceso**; no se acepta un estado/confirmador inyectado en el alta.
- Transiciones: **En proceso → En revisión → Confirmado**. Ambos administradores pueden realizarlas. Cada paso guarda un evento; la confirmación conserva autor y fecha. No se permite regresar de Confirmado ni saltar revisión. Repetir el mismo estado es idempotente.
- `PaymentAllocation` asigna un importe positivo de un pago confirmado a una factura. Admite pagos parciales, un pago repartido en varias facturas y varios pagos sobre una factura. Empresa, moneda y destinatario deben coincidir; para proveedor directo también debe coincidir el proveedor. No hay imputación cruzada de divisas.
- La suma imputada no supera el pago ni el pendiente de la factura. Un excedente confirmado queda **sin aplicar**, visible y separado. No ejecuta devolución ni transferencia automática.
- Las claves de solicitud son únicas por empresa para pagos y por pago para imputaciones. Repetir clave y contenido devuelve el registro existente; cambiar contenido con la misma clave devuelve conflicto. El formulario conserva la clave tras un error y la cambia al completar la operación. No es una integración bancaria ni una deduplicación global de transferencias por referencia.
- Escrituras e historial se confirman juntos en transacciones Serializable. Una competencia que pierde devuelve 409 y requiere recargar/reintentar con la misma clave, sin doble aplicación. Se contempla tanto P2034 como el error de serialización expuesto directamente por adapter-pg al COMMIT.
- Consultas consistentes en RepeatableRead. Los importes originales son enteros de céntimos; no se guardan saldos editables ni se utilizan floats para conversiones.

La confirmación es una declaración identificada del administrador que actúa. **No se presenta como conciliación bancaria verificada.** Comparación bancaria, discrepancias, rechazo, anulación y reversión requieren flujos específicos posteriores; no se ejecutan operaciones reales de dinero.

## Tres modalidades

| Modalidad | Tratamiento implementado |
| --- | --- |
| Honorarios One Horizon | Factura emitida/vencida genera obligación con One Horizon; se reduce mediante imputaciones confirmadas |
| Proveedor directo | La obligación y el pago se muestran aparte, a nombre del proveedor. No aumentan lo adeudado a One Horizon |
| Proveedor pagado por One Horizon | Primero se registra explícitamente un `VendorAdvance` con fecha/referencia del adelanto completo, solo por PLATFORM_ADMIN. Después se reconoce el importe reembolsable. La factura sola no prueba un desembolso. El honorario sigue en otra factura |

El registro de adelanto documenta un pago **ya realizado** por One Horizon; no lo ejecuta. En esta entrega se registra el adelanto completo de la factura, no adelantos parciales ni acuerdos de deuda previa al desembolso.

Las facturas borrador/canceladas no generan obligación actual. Las marcadas PAID por el flujo anterior se excluyen del pendiente y se señalan como pendientes de conciliación con el módulo nuevo; no se inventan recibos ni imputaciones. La edición administrativa anterior de esos estados conserva su contrato. El estado PAID, por sí solo, no se presenta como prueba de un pago confirmado en el módulo nuevo.

Una vez que una factura tiene imputaciones o un adelanto, se bloquean cambios de empresa, moneda, total, tipo, proveedor y estado por PATCH. Se conserva la edición de metadatos como número. Una corrección financiera deberá implementarse con historial/reversión; no se habilita borrado silencioso.

## Lectura de los saldos

Cada resumen separa **moneda** y **destinatario**:

- **Deuda pendiente:** importe de obligaciones reconocidas menos lo imputado a ellas.
- **Confirmado sin aplicar:** pagos confirmados menos sus imputaciones.
- **Saldo neto de cuenta One Horizon:** deuda pendiente menos pagos confirmados sin aplicar. Positivo es pendiente; negativo es a favor del cliente. Imputar un pago ya confirmado cambia qué factura queda cancelada, pero no cambia por segunda vez el saldo neto.
- **En proceso/en revisión:** se muestran aparte y no reducen deuda ni saldo neto.

Ejemplo: factura 100 EUR, pago 40 EUR en revisión → deuda y saldo neto 100. Al confirmar → deuda de factura 100, pago sin aplicar 40, saldo neto 60. Al imputar esos 40 → deuda de factura 60, pago sin aplicar 0, saldo neto sigue 60. Pago confirmado de 150 contra factura de 100 deja saldo a favor de 50; al imputar 100 quedan 50 sin aplicar.

Los proveedores se agrupan para consulta por moneda, pero no se permite imputar dinero de un proveedor a otro. Su deuda y dinero sin aplicar se muestran por separado; no se muestra ese agregado como un saldo neto intercambiable entre proveedores.

## Equivalente informativo EUR

Se admite carga **manual** de cotizaciones GBP→EUR y USD→EUR con fuente, fecha efectiva y autor. Cada registro `ExchangeRate` es nuevo e inmutable desde la API; no se sobrescribe una cotización previa. Se selecciona la más reciente por fecha efectiva, sin usar fechas futuras.

La tasa se expresa como euros por unidad de moneda original, hasta seis decimales, persistidos como entero en millonésimas. La conversión usa BigInt y redondeo simétrico a céntimos; incluye saldos a favor. Se conservan los importes originales. Balance, facturas y pagos presentan equivalente EUR o **Equivalente EUR pendiente** si falta una tasa.

Los equivalentes corresponden a la cotización manual seleccionada en el momento de consulta, cuya fecha/fuente se muestran. Una nueva cotización puede cambiar un equivalente informativo; no modifica el importe ni moneda de facturas, pagos o imputaciones. No es una liquidación con tasa de cambio fijada contractualmente ni una cotización automática de mercado. Esa integración y las diferencias de cambio siguen pendientes.

## Datos anteriores y límites

El modelo `Payment` existente se conserva sin migrar ni confirmar automáticamente sus filas. Se muestran advertencias de pagos antiguos, reembolsos sin adelanto, facturas marcadas PAID y monedas no admitidas. Un saldo que tiene esos datos pendientes se identifica como **provisional**. Facturas con Payment antiguo no admiten nuevas imputaciones hasta contar con un flujo de conciliación histórica, evitando duplicar el descuento.

No se inspeccionaron datos reales ni se hizo inventario remoto. No están incluidos devolución/reversión, cierre contable, conciliación bancaria, adelantos parciales, carga de comprobantes ni una exportación histórica a fecha de corte. El historial registra las operaciones del módulo nuevo, no reconstruye eventos antiguos inexistentes. La descarga documental privada sigue en T08.

## API nueva

Todas las rutas están bajo autenticación y resolución de ámbito, en `/api/accounts`.

| Método y ruta | Acción |
| --- | --- |
| GET `/statement?clientId=` | Cuenta, facturas, recibos, imputaciones, eventos y advertencias; clientId obligatorio para internos y restringido al propio para cliente |
| POST `/payments` | Alta manual: clientId, amountCents, currency, recipient, vendorId si aplica, paidAt, reference, requestKey |
| POST `/payments/:id/state` | status REVIEW o CONFIRMED |
| POST `/payments/:id/allocations` | invoiceId, amountCents, requestKey |
| POST `/invoices/:id/advance` | Adelanto completo de proveedor: reference y paidAt; solo One Horizon admin |
| POST `/exchange-rates` | clientId, currency GBP/USD, eurPerUnit como string decimal, effectiveAt y source |

Compatibilidad de `/api/dashboard`: para cliente, currentBalance es solo saldo **neto EUR con One Horizon** y balanceByLocation es deuda EUR pendiente por ubicación principal. `balances` es la fuente por moneda/destinatario. Para interno sin empresa seleccionada, los campos monetarios antiguos devuelven null, no una suma de divisas. Conteos y documentos recientes globales se conservan. Este cambio de semántica es deliberado y está probado; ningún consumidor debe interpretar los campos antiguos como total financiero multimoneda.

## Persistencia, pruebas y salida

Migración aditiva `20261102180000_operational_payments`: dos enums y cinco tablas nuevas; FK, claves únicas e índices, más checks SQL de importes positivos, moneda admitida, destinatario/proveedor y metadatos de confirmación. No contiene backfill de dinero ni actualiza filas de clientes/facturas/pagos existentes. Las relaciones financieras cruzadas y sumas se validan dentro de transacciones en los endpoints actuales; SQL directo o futuros handlers que omitan el servicio requieren sus propios controles.

Aplicada solo a PostgreSQL loopback de pruebas. Semillas/limpieza de test incluyen las tablas nuevas, por orden de dependencias. Se mantiene SMTP desactivado; invitaciones del E2E se simulan localmente con correos example.test. No se envía correo real.

La evidencia final de suites, errores reproducidos/corregidos y comandos está en comunicacion-ia.md. Se probaron ambos roles en navegador con persistencia tras recargar. La rama permanece local; antes de publicarla se deben revisar automatismos remotos, y cualquier futura salida necesitaría aprobación y todas las migraciones/generación de Prisma. T14, D11 y D12 permanecen pendientes.
