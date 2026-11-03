# Documentación privada — entrega local

Fecha: 2026-11-03 (Europe/Paris). Autor: Codex. Rama `codex/t04-operational-integrity`, base `90b0ce363968fb2c97250608848f8ebd82f2c241`. Autorización: carga, organización y descarga vinculada a facturas/pagos, permisos por empresa y rol; solo pruebas locales, sin producción. No resuelve D11/D12 ni autoriza una salida.

## Qué se implementó

- `/app/documents` y `/app/files` usan documentación real; `/app/admin/documents` añade selección explícita de empresa para roles internos.
- Carga de PDF, PNG, JPEG, TXT UTF-8 y CSV UTF-8, de 1 byte a 10 MB. Nombre/extensión, firma inicial para PDF/imágenes y contenido de texto se validan en servidor. No se confía en MIME del navegador. Otros formatos se rechazan; no se procesan Office, ZIP, ejecutables o SVG en esta entrega.
- Organización por categoría (factura, comprobante de pago, contrato u otro), carpeta lógica y nombre. Carpeta no es una ruta del filesystem. Filtros por categoría/carpeta/factura/pago, con páginas de 50 registros y cursor restringido a empresa.
- Referencias opcionales a establecimiento, factura y recibo `PaymentReceipt`. Todas deben pertenecer a la empresa del documento. Cuando se especifican factura y recibo, moneda/destinatario y proveedor directo deben ser compatibles. Un establecimiento explícito no puede contradecir el ya asignado a la factura.
- Los archivos se conservan sin reemplazo, sin endpoint de borrado y sin transferencia de empresa/referencias. La edición cambia solo nombre, carpeta y categoría; exige updatedAt vigente y guarda antes/después. Se conserva la extensión original en archivos nuevos.
- Descarga autenticada con revalidación de sesión y ámbito; historial de carga, organización y autorización de entrega con actor, rol y fecha. Los eventos no prueban que el navegador terminó de guardar todos los bytes si se interrumpió la conexión.
- Desde cuenta corriente se accede a archivos de cada factura y comprobantes de cada pago. El listado de administración de facturas agrega enlace a sus archivos. El dashboard conecta descarga de documentos recientes y View All a la página real.

Adjuntar un comprobante **no confirma un pago, no crea una imputación y no modifica saldos**. Un archivo asociado al recibo también aparece al filtrar una factura a la que ese recibo se imputó, sin duplicar bytes ni crear relaciones nuevas en el documento.

## Matriz de permisos

| Rol | Consultar/descargar | Cargar/organizar |
| --- | --- | --- |
| PLATFORM_ADMIN | Cualquier empresa | Cualquier empresa, con destino explícito |
| PLATFORM_USER | Cualquier empresa | Denegado |
| CLIENT_ADMIN | Solo su empresa | Solo su empresa |
| CLIENT_USER | Solo su empresa | Denegado |

El servidor obtiene el ámbito de la identidad vigente. Alterar URL, clientId, enlaces financieros o el rol guardado en el navegador no amplía permisos. Un ID de documento ajeno y uno inexistente responden 404; no se devuelven sus metadatos/historial. Los lectores generan auditoría automática al descargar, pero no modifican el documento. Roles futuros no adquieren permisos de descarga por defecto.

## Almacenamiento y entrega

`PRIVATE_LOCAL_V1` es un adaptador de filesystem privado. Requiere una ruta **absoluta** explícita:

- aplicación: `DOCUMENT_STORAGE_DIR`;
- pruebas con NODE_ENV=test: exclusivamente `DOCUMENT_STORAGE_DIR_TEST`.

Si falta la configuración, falla cerrado (503). No hay fallback a storagePath histórico, a carpeta pública ni a un servicio remoto. Se rechazan directorios públicos conocidos del repositorio y sus descendientes, incluyendo comparación sin distinguir mayúsculas en Windows. La ruta física jamás se devuelve al navegador. No hay express.static, links públicos ni JWT/token en URL de descarga.

El servidor crea una clave aleatoria de 64 caracteres hexadecimales más `.bin`, sin usar nombre, carpeta o IDs recibidos como ruta. Escritura exclusiva (`wx`), archivo inmutable y hash SHA-256 persistido. Se solicitan permisos 0700/0600 en sistemas que los soportan; las ACL de Windows/volumen y su cifrado requieren configuración del entorno, no se afirman auditados por estas pruebas.

Al descargar se valida formato de clave, tipo de registro, archivo regular sin symlink, ruta real dentro del directorio, identidad/tamaño de la apertura y hash de todos los bytes. Si falta o cambió el archivo, devuelve 409 sin entregar contenido. La respuesta usa Content-Disposition attachment, MIME determinado en servidor, `Cache-Control: private, no-store`, `X-Content-Type-Options: nosniff` y CSP sandbox. El frontend hace fetch con Bearer y crea un object URL temporal para guardar; no se abre una URL privada sin autenticación ni se inserta el archivo inline.

La validación de firmas/tipos no equivale a análisis antivirus ni certificación de un PDF/imagen completo. El servidor guarda/entrega originales como adjuntos y no los ejecuta, interpreta ni renderiza. Cuotas acumuladas por empresa y análisis especializado son extensiones pendientes, no capacidades afirmadas.

## Consistencia e historial

Las referencias, metadatos y evento se registran en una transacción Serializable; los bytes se escriben en la carpeta privada antes del commit. Una clave de carga por empresa permite repetir una petición idéntica sin duplicar documento/evento. La misma clave con contenido/metadatos diferentes devuelve 409; competencia de transacciones devuelve conflicto recuperable.

PostgreSQL y filesystem no comparten una transacción distribuida. Ante rollback conocido se elimina solo el archivo recién creado con clave propia. Si el resultado del commit es incierto y la DB no permite verificarlo, se conservan los bytes privados antes que borrar el archivo de una fila posiblemente confirmada. Una reconciliación de huérfanos con período de gracia y backup es trabajo posterior; no se borra almacenamiento ajeno ni antiguo automáticamente. Las pruebas incluyen fallo real de INSERT de auditoría mediante trigger temporal local y verifican rollback y limpieza de bytes.

DocumentEvent conserva nombre/rol/ID del actor, fecha y detalle de organización anterior/posterior. No contiene contenido del archivo ni secretos. Cambiar categoría/carpeta no cambia sus vínculos financieros ni el original. Descargas y ediciones siguen autorizadas por el servidor aunque se oculte o altere la UI.

## Registros históricos

La migración añade campos a Document y crea DocumentEvent; documentos anteriores quedan `LEGACY`, sin asumir que su ruta es segura o existe. El listado no devuelve storagePath, storageKind, checksum ni claves de carga. Los históricos aparecen con descarga deshabilitada y mensaje de incorporación pendiente. No se intentó leer sus rutas, importar bytes ni inspeccionar datos reales.

La incorporación futura exige identificar el origen, verificar permisos/integridad, copiar al almacenamiento privado y auditar esa acción. No basta cambiar storageKind o habilitar un botón. La categoría Contratos organiza archivos; no implementa todavía firma, vigencias o el ciclo contractual.

## API

Rutas protegidas bajo `/api/documents`:

| Método/ruta | Comportamiento |
| --- | --- |
| GET `/` | Metadatos explícitamente seleccionados, filtros clientId/category/folder/invoiceId/receiptId/cursor, nextCursor |
| GET `/context?clientId=` | Referencias de facturas/recibos/locales y carpetas de esa empresa para selectores |
| POST `/upload` | Body binario application/octet-stream; query con name, clientId, uploadKey y referencias/categoría/carpeta opcionales; límite 10 MB aplicado después de autenticar y comprobar rol |
| PATCH `/:id` | name/folder/category y expectedUpdatedAt; resto de campos rechazado |
| GET `/:id/download` | Bytes autorizados, integridad verificada y entrega como attachment |
| GET `/:id/history` | Eventos accesibles al mismo ámbito, sin rutas físicas |

Las respuestas nuevas de documentos recientes del dashboard incluyen downloadAvailable y omiten storageKind. Se conservan IDs, nombres, MIME, fechas y tamaños anteriores.

## Pruebas y operación

Backend usa PostgreSQL loopback aislado y un directorio mkdtemp único por archivo de pruebas; setup ignora cualquier almacenamiento real configurado en .env. Al terminar, valida que la ruta temporal sea hija directa del temp del sistema y tenga el prefijo propio antes de eliminarla. Seed y helpers limpian eventos/documentos antes de recibos y demás FK. Seed no elimina archivos de un almacenamiento persistente: no es una herramienta de purga documental.

Las pruebas comprueban los cuatro roles, empresa ajena, referencias y filtros, sesión revocada, claves de reintento/concurrencia, límite/tipos, nombres/rutas inseguros, archivo alterado/ausente, raíz pública o no configurada, organización optimista, paginación, no exposición de paths y rollback de metadatos/bytes. Las pruebas de navegador verifican carga real, enlace factura/recibo, organización persistida y bytes descargados idénticos, más lector propio y empresa ajena. Resultados exactos y límites de verificación en comunicacion-ia.md.

Antes de una salida futura, además de autorización expresa, se necesita volumen privado persistente (no disco efímero), variables de entorno por ambiente, backup/restauración coherente de DB + archivos, capacidad/cuotas y procedimiento de incorporación histórica. No se eligió ni configuró proveedor remoto. La migración `20261103100000_private_documents` y generate se ejecutaron únicamente localmente. La rama no se publica sin volver a inspeccionar y bloquear sus automatismos; T14/D11/D12 siguen abiertos.
